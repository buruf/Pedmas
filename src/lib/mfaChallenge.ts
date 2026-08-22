/**
 * The short-lived ticket between "password was right" and "second factor was
 * right".
 *
 * It exists so the password step never mints a session: until the code is
 * verified there is no cookie, nothing to steal, and nothing to replay. The
 * ticket is a random opaque id, single-use, five-minute lifetime, with an
 * attempt counter so a stolen ticket cannot be brute-forced against the
 * million possible codes.
 */
import { getRow, putRow, deleteRow, newId } from "./store/db";
import { randomBytes } from "crypto";

const TABLE = "mfaChallenges";
const TTL_MS = 5 * 60 * 1000;
export const MAX_ATTEMPTS = 5;

export interface MfaChallenge {
  id: string;
  accountId: string;
  createdAt: number;
  expiresAt: number;
  attempts: number;
}

export async function createChallenge(accountId: string): Promise<MfaChallenge> {
  const challenge: MfaChallenge = {
    id: newId("mfa") + randomBytes(18).toString("hex"),
    accountId,
    createdAt: Date.now(),
    expiresAt: Date.now() + TTL_MS,
    attempts: 0,
  };
  await putRow(TABLE, challenge.id, challenge);
  return challenge;
}

/** Fetch a live challenge, counting the attempt. Null when unusable. */
export async function claimAttempt(id: string): Promise<MfaChallenge | null> {
  if (!id) return null;
  const challenge = await getRow<MfaChallenge>(TABLE, id);
  if (!challenge) return null;
  if (challenge.expiresAt < Date.now()) {
    await deleteRow(TABLE, id);
    return null;
  }
  if (challenge.attempts >= MAX_ATTEMPTS) {
    // Burned: throwing it away forces a fresh password sign-in.
    await deleteRow(TABLE, id);
    return null;
  }
  challenge.attempts++;
  await putRow(TABLE, id, challenge);
  return challenge;
}

export async function consumeChallenge(id: string): Promise<void> {
  await deleteRow(TABLE, id);
}
