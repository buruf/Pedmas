import { randomBytes, createHash, timingSafeEqual } from "crypto";
import type { Account, PasswordResetToken } from "./model";
import { getRow, putRow, findRow, allRows, deleteRow, newId } from "./store/db";
import { hashPassword } from "./auth";

/**
 * Password reset.
 *
 * The emailed token is random and only its SHA-256 hash is stored, so a leak
 * of the data store cannot be used to take over accounts. Tokens are single
 * use, expire quickly, and any outstanding tokens are revoked once one is
 * spent or the password changes.
 */

export const RESET_TTL_MINUTES = 45;
const TTL_MS = RESET_TTL_MINUTES * 60 * 1000;

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Issue a reset token. Returns the raw token to email — never store it. */
export async function createResetToken(accountId: string): Promise<string> {
  await revokeTokensFor(accountId);
  const raw = `${newId("prt")}${randomBytes(32).toString("hex")}`;
  const row: PasswordResetToken = {
    id: hashToken(raw),
    accountId,
    createdAt: Date.now(),
    expiresAt: Date.now() + TTL_MS,
  };
  await putRow("passwordResetTokens", row.id, row);
  return raw;
}

export async function revokeTokensFor(accountId: string): Promise<void> {
  const all = await allRows<PasswordResetToken>("passwordResetTokens");
  for (const t of all) {
    if (t.accountId === accountId) await deleteRow("passwordResetTokens", t.id);
  }
}

export type ResetCheck =
  | { ok: true; account: Account; tokenId: string }
  | { ok: false; error: string };

/** Validate a raw token without consuming it. */
export async function checkResetToken(raw: string): Promise<ResetCheck> {
  const candidate = hashToken(raw.trim());
  const row = await getRow<PasswordResetToken>("passwordResetTokens", candidate);
  const invalid = { ok: false as const, error: "This reset link is invalid or has already been used." };
  if (!row) return invalid;

  // Constant-time compare of the stored id, belt and braces alongside the
  // direct lookup above.
  const a = Buffer.from(row.id);
  const b = Buffer.from(candidate);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return invalid;

  if (row.usedAt) return invalid;
  if (row.expiresAt < Date.now()) {
    await deleteRow("passwordResetTokens", row.id);
    return { ok: false, error: "This reset link has expired. Please request a new one." };
  }
  const account = await getRow<Account>("accounts", row.accountId);
  if (!account) return invalid;
  return { ok: true, account, tokenId: row.id };
}

/** Consume a token and set the new password. */
export async function consumeResetToken(
  raw: string,
  newPassword: string
): Promise<{ ok: true; account: Account } | { ok: false; error: string }> {
  if (newPassword.length < 8) return { ok: false, error: "Password must be at least 8 characters." };
  const check = await checkResetToken(raw);
  if (!check.ok) return { ok: false, error: check.error };

  check.account.passwordHash = hashPassword(newPassword);
  await putRow("accounts", check.account.id, check.account);
  await revokeTokensFor(check.account.id);
  return { ok: true, account: check.account };
}

export async function accountByEmail(email: string): Promise<Account | undefined> {
  const norm = email.trim().toLowerCase();
  return findRow<Account>("accounts", (a) => a.email === norm);
}
