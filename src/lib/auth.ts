import { scryptSync, randomBytes, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import type { Account, AuthSession, Role } from "./model";
import { allRows, findRow, getRow, newId, putRow, deleteRow } from "./store/db";
import { POLICY_VERSION } from "./legal";

const COOKIE = "pedmas_session";
const SESSION_TTL = 30 * 24 * 60 * 60 * 1000;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const test = scryptSync(password, salt, 64);
  const ref = Buffer.from(hash, "hex");
  return test.length === ref.length && timingSafeEqual(test, ref);
}

export async function createAccount(
  email: string,
  password: string,
  role: Role,
  name: string,
  consent?: { acceptedTerms: boolean; parentAffirmed: boolean }
): Promise<Account | { error: string }> {
  const norm = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(norm)) return { error: "Please enter a valid email." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };
  // Consent is required to create an account: the service is used by children,
  // so an unrecorded acceptance is not one we could later evidence.
  if (!consent?.acceptedTerms) {
    return { error: "Please accept the Terms of Service and Privacy Policy to continue." };
  }
  if (role === "PARENT" && !consent.parentAffirmed) {
    return { error: "Please confirm you are the parent or guardian of the children you add." };
  }
  const existing = await findRow<Account>("accounts", (a) => a.email === norm);
  if (existing) return { error: "An account with that email already exists." };
  const account: Account = {
    id: newId("acc"),
    email: norm,
    passwordHash: hashPassword(password),
    role,
    name: name.trim() || "Learner",
    createdAt: Date.now(),
    consent: {
      policyVersion: POLICY_VERSION,
      acceptedAt: Date.now(),
      parentAffirmed: Boolean(consent.parentAffirmed),
    },
  };
  await putRow("accounts", account.id, account);
  return account;
}

export async function login(email: string, password: string): Promise<Account | null> {
  const norm = email.trim().toLowerCase();
  const account = await findRow<Account>("accounts", (a) => a.email === norm);
  if (!account) return null;
  if (!verifyPassword(password, account.passwordHash)) return null;
  return account;
}


/**
 * Cookie options shared by set and clear — they must match exactly or the
 * browser keeps a stale cookie the app can no longer see.
 *
 * Domain matters here: without it the cookie is host-only, so a session
 * started on www.pedmas.com is invisible on pedmas.com. A cached redirect
 * between the two then reads as being logged straight back out. Set
 * AUTH_COOKIE_DOMAIN=.pedmas.com in production to cover both.
 */
function cookieOptions() {
  const domain = process.env.AUTH_COOKIE_DOMAIN;
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    // A session cookie for a children's service must never cross plain HTTP.
    secure: Boolean(process.env.VERCEL),
    ...(domain ? { domain } : {}),
  };
}

export async function startSession(accountId: string): Promise<string> {
  const token = newId("sess") + randomBytes(24).toString("hex");
  const session: AuthSession = {
    id: token,
    accountId,
    createdAt: Date.now(),
    expiresAt: Date.now() + SESSION_TTL,
  };
  await putRow("authSessions", token, session);
  const jar = await cookies();
  jar.set(COOKIE, token, { ...cookieOptions(), maxAge: SESSION_TTL / 1000 });
  return token;
}

export async function endSession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) await deleteRow("authSessions", token);
  // Delete with the same attributes it was set with, or it survives.
  jar.set(COOKIE, "", { ...cookieOptions(), maxAge: 0 });
}

export async function currentAccount(): Promise<Account | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  const session = await getRow<AuthSession>("authSessions", token);
  if (!session || session.expiresAt < Date.now()) return null;
  return (await getRow<Account>("accounts", session.accountId)) ?? null;
}

/**
 * Seed the platform admin on first use.
 * Credentials come from PEDMAS_ADMIN_EMAIL / PEDMAS_ADMIN_PASSWORD; the
 * fallbacks are development-only conveniences. Set both before deploying —
 * the defaults are published in this repository.
 */
export async function ensureAdmin(): Promise<void> {
  const admins = await allRows<Account>("accounts");
  if (!admins.some((a) => a.role === "ADMIN")) {
    const account: Account = {
      id: newId("acc"),
      email: process.env.PEDMAS_ADMIN_EMAIL ?? "admin@pedmas.com",
      passwordHash: hashPassword(process.env.PEDMAS_ADMIN_PASSWORD ?? "pedmas-admin"),
      role: "ADMIN",
      name: "Platform Admin",
      createdAt: Date.now(),
    };
    await putRow("accounts", account.id, account);
  }
}
