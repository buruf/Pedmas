import { NextRequest, NextResponse } from "next/server";
import { ensureAdmin, login, startSession } from "@/lib/auth";
import { clientKey, rateLimit, LIMITS } from "@/lib/rateLimit";
import { mfaEnabled } from "@/lib/mfa";
import { createChallenge } from "@/lib/mfaChallenge";

export async function POST(req: NextRequest) {
  // Throttle before doing any work: this is the credential-stuffing target.
  const gate = await rateLimit("login", clientKey(req), LIMITS.login.limit, LIMITS.login.windowSeconds);
  if (!gate.ok) {
    return NextResponse.json(
      { error: "Too many sign-in attempts. Please wait a few minutes and try again." },
      { status: 429, headers: { "Retry-After": String(gate.retryAfterSeconds) } }
    );
  }
  await ensureAdmin();
  const body = await req.json().catch(() => null);
  if (!body?.email || !body?.password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }
  const account = await login(body.email, body.password);
  if (!account) {
    return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
  }
  // With a second factor enabled the password alone earns no session — only
  // a short-lived challenge ticket. The cookie is minted in /api/auth/mfa,
  // after the code is proved.
  if (mfaEnabled(account)) {
    const challenge = await createChallenge(account.id);
    return NextResponse.json({ mfaRequired: true, challenge: challenge.id });
  }

  await startSession(account.id);
  return NextResponse.json({ id: account.id, email: account.email, role: account.role, name: account.name });
}
