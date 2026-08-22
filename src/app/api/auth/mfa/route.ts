import { NextRequest, NextResponse } from "next/server";
import { startSession } from "@/lib/auth";
import { getRow } from "@/lib/store/db";
import { clientKey, rateLimit } from "@/lib/rateLimit";
import { verifyChallenge } from "@/lib/mfa";
import { claimAttempt, consumeChallenge } from "@/lib/mfaChallenge";
import type { Account } from "@/lib/model";

/**
 * Second step of sign-in: exchange a challenge ticket plus a valid code for
 * a session. Two independent limits guard it — per-client rate limiting and
 * a per-ticket attempt count — so neither a flood of tickets nor repeated
 * guesses against one ticket can walk the six-digit space.
 */
export async function POST(req: NextRequest) {
  const gate = await rateLimit("mfa", clientKey(req), 10, 15 * 60);
  if (!gate.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait a few minutes and sign in again." },
      { status: 429, headers: { "Retry-After": String(gate.retryAfterSeconds) } }
    );
  }

  const body = await req.json().catch(() => null);
  const challengeId = typeof body?.challenge === "string" ? body.challenge : "";
  const code = typeof body?.code === "string" ? body.code : "";

  const challenge = await claimAttempt(challengeId);
  if (!challenge) {
    return NextResponse.json(
      { error: "That sign-in attempt expired. Please enter your password again." },
      { status: 401 }
    );
  }

  const account = await getRow<Account>("accounts", challenge.accountId);
  if (!account) {
    await consumeChallenge(challengeId);
    return NextResponse.json({ error: "That sign-in attempt expired." }, { status: 401 });
  }

  const result = await verifyChallenge(account, code);
  if (!result.ok) {
    return NextResponse.json({ error: result.error ?? "That code is not valid." }, { status: 401 });
  }

  await consumeChallenge(challengeId);
  await startSession(account.id);
  return NextResponse.json({
    id: account.id,
    email: account.email,
    role: account.role,
    name: account.name,
    usedRecoveryCode: result.usedRecoveryCode ?? false,
    remainingRecoveryCodes: result.remainingRecoveryCodes,
  });
}
