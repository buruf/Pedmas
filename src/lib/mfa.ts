/**
 * Two-factor authentication for the administrative account.
 *
 * The admin console can read every family's data, so a stolen admin password
 * is the worst single failure this service has. A second factor makes the
 * password alone useless.
 *
 * Deliberately admin-only. Parents get no benefit proportionate to the
 * support burden of a locked-out family, and a parent account can already be
 * recovered by email; the admin account is the one holding everyone's data.
 *
 * Three properties shape the design:
 *
 *  1. Enrolment is never trusted until proved. The secret is held pending
 *     until a code generated from it verifies, so a mis-scanned QR cannot
 *     lock anyone out — the enrolment simply fails and nothing changes.
 *  2. Recovery codes are stored as HASHES, like password-reset tokens. A
 *     database reader gains nothing. Each is single-use.
 *  3. Codes cannot be replayed. The step a code was accepted at is recorded,
 *     and codes at or before it are refused for the rest of that window.
 */
import { createHash, randomBytes, timingSafeEqual } from "crypto";
import { putRow } from "./store/db";
import type { Account } from "./model";
import { generateSecret, otpauthUri, verifyTotp, formatSecret } from "./totp";

export const RECOVERY_CODE_COUNT = 10;

/** Recovery codes are hashed with SHA-256: they are high-entropy already. */
function hashRecovery(code: string): string {
  return createHash("sha256").update(normalizeRecovery(code)).digest("hex");
}

function normalizeRecovery(code: string): string {
  return (code ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");
}

/** Ten single-use codes, shown once at enrolment and never again. */
export function generateRecoveryCodes(count = RECOVERY_CODE_COUNT): string[] {
  return Array.from({ length: count }, () => {
    const raw = randomBytes(5).toString("hex").toUpperCase(); // 10 hex chars
    return `${raw.slice(0, 5)}-${raw.slice(5)}`;
  });
}

export function mfaEnabled(account: Account | null | undefined): boolean {
  return Boolean(account?.mfa?.enabledAt);
}

/** True when this account ought to have MFA but does not yet. */
export function mfaRequiredButMissing(account: Account | null | undefined): boolean {
  return account?.role === "ADMIN" && !mfaEnabled(account);
}

export interface EnrolmentOffer {
  secret: string;
  formattedSecret: string;
  otpauthUri: string;
}

/**
 * Begin enrolment: mint a secret and stash it as *pending*. Nothing about
 * sign-in changes until confirmEnrolment succeeds, so an abandoned or
 * mis-scanned enrolment leaves the account exactly as it was.
 */
export async function beginEnrolment(account: Account): Promise<EnrolmentOffer> {
  const secret = generateSecret();
  account.mfa = { ...(account.mfa ?? {}), pendingSecret: secret, pendingAt: Date.now() };
  await putRow("accounts", account.id, account);
  return {
    secret,
    formattedSecret: formatSecret(secret),
    otpauthUri: otpauthUri(secret, account.email),
  };
}

export interface ConfirmResult {
  ok: boolean;
  error?: string;
  recoveryCodes?: string[];
}

/**
 * Finish enrolment by proving the authenticator works. Returns the recovery
 * codes, which are shown exactly once — only their hashes are kept.
 */
export async function confirmEnrolment(account: Account, code: string): Promise<ConfirmResult> {
  const pending = account.mfa?.pendingSecret;
  if (!pending) return { ok: false, error: "Start the setup again — no enrolment is in progress." };

  const result = verifyTotp(pending, code);
  if (!result.ok) return { ok: false, error: "That code did not match. Check your authenticator app and try again." };

  const recoveryCodes = generateRecoveryCodes();
  account.mfa = {
    secret: pending,
    enabledAt: Date.now(),
    lastStep: result.step,
    recoveryHashes: recoveryCodes.map(hashRecovery),
  };
  await putRow("accounts", account.id, account);
  return { ok: true, recoveryCodes };
}

export interface ChallengeResult {
  ok: boolean;
  /** True when a recovery code was spent rather than an app code used. */
  usedRecoveryCode?: boolean;
  remainingRecoveryCodes?: number;
  error?: string;
}

/**
 * Check a code at sign-in. Accepts either an authenticator code or one
 * recovery code, and consumes whatever it accepts so neither can be reused.
 */
export async function verifyChallenge(account: Account, submitted: string): Promise<ChallengeResult> {
  const mfa = account.mfa;
  if (!mfa?.secret || !mfa.enabledAt) return { ok: false, error: "Two-factor authentication is not set up." };

  const totp = verifyTotp(mfa.secret, submitted, { afterStep: mfa.lastStep });
  if (totp.ok) {
    // Record the step so this exact code cannot be presented twice.
    account.mfa = { ...mfa, lastStep: totp.step };
    await putRow("accounts", account.id, account);
    return { ok: true };
  }

  // Fall back to recovery codes, compared in constant time and spent on use.
  const candidate = hashRecovery(submitted);
  const hashes = mfa.recoveryHashes ?? [];
  const index = hashes.findIndex((stored) => {
    const a = Buffer.from(stored, "hex");
    const b = Buffer.from(candidate, "hex");
    return a.length === b.length && timingSafeEqual(a, b);
  });
  if (index >= 0) {
    const remaining = hashes.filter((_, i) => i !== index);
    account.mfa = { ...mfa, recoveryHashes: remaining };
    await putRow("accounts", account.id, account);
    return { ok: true, usedRecoveryCode: true, remainingRecoveryCodes: remaining.length };
  }

  return { ok: false, error: "That code is not valid." };
}

/** Turn MFA off. Requires a working code, so a hijacked session cannot do it. */
export async function disableMfa(account: Account, code: string): Promise<ChallengeResult> {
  const check = await verifyChallenge(account, code);
  if (!check.ok) return check;
  account.mfa = undefined;
  await putRow("accounts", account.id, account);
  return { ok: true };
}

/** Fresh recovery codes, replacing any unused ones. Requires a valid code. */
export async function regenerateRecoveryCodes(
  account: Account,
  code: string
): Promise<{ ok: boolean; error?: string; recoveryCodes?: string[] }> {
  const check = await verifyChallenge(account, code);
  if (!check.ok) return { ok: false, error: check.error };
  const recoveryCodes = generateRecoveryCodes();
  account.mfa = { ...(account.mfa ?? {}), recoveryHashes: recoveryCodes.map(hashRecovery) };
  await putRow("accounts", account.id, account);
  return { ok: true, recoveryCodes };
}
