import { NextRequest, NextResponse } from "next/server";
import { startSession } from "@/lib/auth";
import { clientKey, rateLimit } from "@/lib/rateLimit";
import { studentForCode, markCodeUsed } from "@/lib/childSignIn";
import { getRow } from "@/lib/store/db";
import type { Account } from "@/lib/model";

/**
 * A child signs in with the code their parent gave them.
 *
 * Rate limited hard: the code is the only secret, and unlike a password
 * there is no second factor behind it. The reply is deliberately identical
 * for "no such code" and any other failure, so the endpoint cannot be used
 * to discover which codes exist.
 */
export async function POST(req: NextRequest) {
  const gate = await rateLimit("childSignIn", clientKey(req), 8, 15 * 60);
  if (!gate.ok) {
    return NextResponse.json(
      { error: "Too many tries. Please wait a few minutes and ask a parent for help." },
      { status: 429, headers: { "Retry-After": String(gate.retryAfterSeconds) } }
    );
  }

  const body = await req.json().catch(() => null);
  const code = typeof body?.code === "string" ? body.code : "";
  const deny = () =>
    NextResponse.json({ error: "That code did not work. Check it with a parent." }, { status: 401 });

  const student = await studentForCode(code);
  if (!student) return deny();

  // The subscription belongs to the parent, so the session still runs on the
  // parent's account — scoped to this child and nothing else.
  const account = await getRow<Account>("accounts", student.accountId);
  if (!account) return deny();

  await markCodeUsed(student);
  await startSession(account.id, { studentId: student.id });
  return NextResponse.json({ ok: true, studentId: student.id, name: student.name });
}
