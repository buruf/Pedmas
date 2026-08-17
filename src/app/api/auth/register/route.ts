import { NextRequest, NextResponse } from "next/server";
import { createAccount, startSession } from "@/lib/auth";
import { clientKey, rateLimit, LIMITS } from "@/lib/rateLimit";
import { registrationOpen, REGISTRATION_CLOSED_MESSAGE } from "@/lib/flags";

export async function POST(req: NextRequest) {
  // Enforced here, not merely hidden in the UI: without this the endpoint
  // stays open to anyone who posts to it directly.
  if (!registrationOpen()) {
    return NextResponse.json({ error: REGISTRATION_CLOSED_MESSAGE }, { status: 403 });
  }
  const gate = await rateLimit(
    "register",
    clientKey(req),
    LIMITS.register.limit,
    LIMITS.register.windowSeconds
  );
  if (!gate.ok) {
    return NextResponse.json(
      { error: "Too many accounts created from here. Please try again later." },
      { status: 429, headers: { "Retry-After": String(gate.retryAfterSeconds) } }
    );
  }
  const body = await req.json().catch(() => null);
  if (!body?.email || !body?.password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }
  const role = body.role === "STUDENT" ? "STUDENT" : "PARENT";
  const result = await createAccount(body.email, body.password, role, body.name ?? "", {
    acceptedTerms: Boolean(body.acceptedTerms),
    parentAffirmed: Boolean(body.parentAffirmed),
  });
  if ("error" in result) return NextResponse.json(result, { status: 400 });
  await startSession(result.id);
  return NextResponse.json({ id: result.id, email: result.email, role: result.role, name: result.name });
}
