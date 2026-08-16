import { scryptSync, randomBytes, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import type { Account, AuthSession, Role } from "./model";
import { allRows, findRow, getRow, newId, putRow, deleteRow } from "./store/db";

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
  name: string
): Promise<Account | { error: string }> {
  const norm = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(norm)) return { error: "Please enter a valid email." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };
  const existing = await findRow<Account>("accounts", (a) => a.email === norm);
  if (existing) return { error: "An account with that email already exists." };
  const account: Account = {
    id: newId("acc"),
    email: norm,
    passwordHash: hashPassword(password),
    role,
    name: name.trim() || "Learner",
    createdAt: Date.now(),
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
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL / 1000,
  });
  return token;
}

export async function endSession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) await deleteRow("authSessions", token);
  jar.delete(COOKIE);
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
