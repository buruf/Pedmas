import { NextResponse } from "next/server";
import { currentAuth, ensureAdmin } from "./auth";
import type { Account } from "./model";

export async function requireAccount(): Promise<Account | NextResponse> {
  await ensureAdmin();
  const auth = await currentAuth();
  if (!auth) {
    return NextResponse.json({ error: "Please log in." }, { status: 401 });
  }
  return auth.account;
}

/**
 * The account, but only when the ADULT is signed in.
 *
 * A child signs in with their own code and gets a session scoped to their
 * own learning. Everything that can spend money, change the account, read a
 * sibling, or destroy data must go through here — a child handed the family
 * laptop should not be one click from the billing portal or from deleting
 * the account. Anything reachable by requireAccount() alone is, by
 * definition, safe for a child to touch.
 */
export async function requireParent(): Promise<Account | NextResponse> {
  await ensureAdmin();
  const auth = await currentAuth();
  if (!auth) {
    return NextResponse.json({ error: "Please log in." }, { status: 401 });
  }
  if (auth.session.studentId) {
    return NextResponse.json(
      { error: "Ask a parent to sign in for this." },
      { status: 403 }
    );
  }
  return auth.account;
}

/**
 * The signed-in child, when the session is a child session.
 *
 * Returns null for a parent session, which may reach any of its own
 * children; a child session may reach exactly one.
 */
export async function sessionStudentId(): Promise<string | null> {
  return (await currentAuth())?.session.studentId ?? null;
}

/** Refuse a child session that reaches for a student other than itself. */
export async function guardStudentScope(studentId: string): Promise<NextResponse | null> {
  const scoped = await sessionStudentId();
  if (scoped && scoped !== studentId) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  return null;
}

export function isResponse(x: unknown): x is NextResponse {
  return x instanceof NextResponse;
}

export function bad(message: string, status = 400): NextResponse {
  return NextResponse.json({ error: message }, { status });
}
