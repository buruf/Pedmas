import { NextRequest, NextResponse } from "next/server";
import { startSession } from "@/lib/auth";
import { clientKey, rateLimit, clearRateLimit } from "@/lib/rateLimit";
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
  // The limit exists to stop abuse, not to stop guessing: a 12-character
  // code drawn from a 30-symbol alphabet is around 10^17 combinations, so
  // no realistic number of tries threatens it. What a tight limit DOES
  // break is a household — one address is shared by every child in the
  // family, and a young child mistyping a code copied off a note should
  // not lock their siblings out. Hence a generous ceiling, and a correct
  // code wipes the slate below, so only failures ever accumulate.
  const who = clientKey(req);
  const gate = await rateLimit("childSignIn", who, 20, 15 * 60);
  if (!gate.ok) {
    const minutes = Math.max(1, Math.ceil(gate.retryAfterSeconds / 60));
    return NextResponse.json(
      {
        error:
          "Too many tries. Please wait about " +
          minutes +
          (minutes === 1 ? " minute" : " minutes") +
          " and try again.",
      },
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

  // Correct code: forget the failed attempts that came before it.
  await clearRateLimit("childSignIn", who);
  await markCodeUsed(student);
  await startSession(account.id, { studentId: student.id });
  return NextResponse.json({ ok: true, studentId: student.id, name: student.name });
}
