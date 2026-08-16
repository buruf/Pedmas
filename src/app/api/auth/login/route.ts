import { NextRequest, NextResponse } from "next/server";
import { ensureAdmin, login, startSession } from "@/lib/auth";
import { clientKey, rateLimit, LIMITS } from "@/lib/rateLimit";

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
  await startSession(account.id);
  return NextResponse.json({ id: account.id, email: account.email, role: account.role, name: account.name });
}
