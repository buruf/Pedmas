import { scryptSync, randomBytes, timingSafeEqual } from "crypto";
import { regionForCountry } from "./region";
import { cookies } from "next/headers";
import type { Account, AuthSession, Role } from "./model";
import { allRows, getRow, newId, putRow, deleteRow, accountByEmail, isUniqueViolation } from "./store/db";
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
  consent?: { acceptedTerms: boolean; parentAffirmed: boolean },
  country?: string
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
  const existing = await accountByEmail<Account>(norm);
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
    // A stated country beats geo-IP detection: the parent said where they
    // are, and that decides the curriculum variant and units from day one.
    ...(country
      ? { country: country.toUpperCase(), region: regionForCountry(country) }
      : {}),
  };
  try {
    await putRow("accounts", account.id, account);
  } catch (err) {
    // Two simultaneous signups with the same email: the check above passed
    // for both, and the unique index caught the second. Same answer as the
    // check — not a 500.
    if (isUniqueViolation(err, "accounts_email_key")) {
      return { error: "An account with that email already exists." };
    }
    throw err;
  }
  return account;
}

export async function login(email: string, password: string): Promise<Account | null> {
  const norm = email.trim().toLowerCase();
  const account = await accountByEmail<Account>(norm);
  if (!account) return null;
  if (!verifyPassword(password, account.passwordHash)) return null;
  // Stamp the sign-in so the retention sweep can tell a returning family
  // from a dormant one. Best-effort: a store hiccup must not block a login.
  try {
    account.lastSeenAt = Date.now();
    await putRow("accounts", account.id, account);
  } catch {
    /* ignore */
  }
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

export async function startSession(
  accountId: string,
  opts: { studentId?: string } = {}
): Promise<string> {
  const token = newId("sess") + randomBytes(24).toString("hex");
  const session: AuthSession = {
    id: token,
    accountId,
    createdAt: Date.now(),
    expiresAt: Date.now() + SESSION_TTL,
    ...(opts.studentId ? { studentId: opts.studentId } : {}),
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

/**
 * The live session and its account.
 *
 * Callers that touch anything sensitive must look at `studentId`: when it is
 * set, a child signed in with their own code and the session is scoped to
 * that child alone.
 */
export async function currentAuth(): Promise<{ account: Account; session: AuthSession } | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  const session = await getRow<AuthSession>("authSessions", token);
  if (!session || session.expiresAt < Date.now()) return null;
  const account = await getRow<Account>("accounts", session.accountId);
  return account ? { account, session } : null;
}

export async function currentAccount(): Promise<Account | null> {
  return (await currentAuth())?.account ?? null;
}

/**
 * Seed the platform admin on first use.
 * Credentials come from PEDMAS_ADMIN_EMAIL / PEDMAS_ADMIN_PASSWORD; the
 * fallbacks are development-only conveniences. Set both before deploying —
 * the defaults are published in this repository.
 */
/**
 * Admin credentials from the environment, normalized.
 *
 * Pasting a value into a hosting dashboard very easily picks up a trailing
 * space or newline. Left raw, that whitespace is baked into the stored email
 * (which the lookup then never matches) or into the password hash (which the
 * typed password then never verifies) — and the sign-in error deliberately
 * cannot say which, so the account is simply locked out forever. Normalizing
 * here is the difference between a typo and a lockout.
 */
function adminCredentialsFromEnv(): { email: string; password: string } {
  const rawEmail = process.env.PEDMAS_ADMIN_EMAIL ?? "admin@pedmas.com";
  const rawPassword = process.env.PEDMAS_ADMIN_PASSWORD ?? "pedmas-admin";
  const email = rawEmail.trim().toLowerCase();
  const password = rawPassword.trim();
  if (rawEmail !== email || rawPassword !== rawPassword.trim()) {
    console.warn(
      "[auth] PEDMAS_ADMIN_EMAIL/PASSWORD had surrounding whitespace or capitals; using the trimmed, lowercased form."
    );
  }
  return { email, password };
}

/**
 * Skip the "is there an admin?" scan for a short while after finding one.
 *
 * Deliberately a brief expiry rather than a permanent flag: deleting the
 * admin row is the documented way to recover from lost credentials, and a
 * permanent memo would stop a warm instance from ever re-seeding it — the
 * recovery advice would silently fail. A minute keeps the scan off the hot
 * path without breaking the escape hatch.
 */
let adminSeenUntil = 0;
const ADMIN_MEMO_MS = 60_000;

export async function ensureAdmin(): Promise<void> {
  const reseed = process.env.PEDMAS_ADMIN_RESEED === "true";
  if (Date.now() < adminSeenUntil && !reseed) return;

  const admins = await allRows<Account>("accounts");
  const existing = admins.find((a) => a.role === "ADMIN");
  const { email, password } = adminCredentialsFromEnv();

  if (!existing) {
    const account: Account = {
      id: newId("acc"),
      email,
      passwordHash: hashPassword(password),
      role: "ADMIN",
      name: "Platform Admin",
      createdAt: Date.now(),
    };
    await putRow("accounts", account.id, account);
    adminSeenUntil = Date.now() + ADMIN_MEMO_MS;
    return;
  }
  adminSeenUntil = Date.now() + ADMIN_MEMO_MS;

  // Deliberate, opt-in recovery. Setting PEDMAS_ADMIN_RESEED=true makes the
  // environment authoritative for the admin's email and password on the next
  // request — the way back in when the stored credentials are unusable and no
  // reset email can be sent. It is a no-op once they already match, and it
  // leaves any second factor alone, so it can never be used to strip MFA.
  if (!reseed) return;
  const matches = existing.email === email && verifyPassword(password, existing.passwordHash);
  if (matches) return;
  existing.email = email;
  existing.passwordHash = hashPassword(password);
  await putRow("accounts", existing.id, existing);
  console.warn(`[auth] admin credentials reseeded from the environment for ${email}. Unset PEDMAS_ADMIN_RESEED now.`);
}
