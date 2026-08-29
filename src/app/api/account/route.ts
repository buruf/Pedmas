import { NextResponse } from "next/server";
import { requireParent, isResponse, bad } from "@/lib/api";
import { endSession } from "@/lib/auth";
import { eraseAccount } from "@/lib/retention";
import { setAccountRegion } from "@/lib/regionServer";

/**
 * PATCH: the parent's region override.
 *
 * Detection is a default, never a lock — an American family in Canada should
 * still get American units, and a Canadian family behind a US-routed
 * connection must be able to get metric back. Child sessions cannot reach
 * this (requireParent refuses them).
 */
export async function PATCH(req: Request) {
  const account = await requireParent();
  if (isResponse(account)) return account;
  const body = await req.json().catch(() => null);
  const region = body?.region;
  if (region !== "US" && region !== "INTL") return bad("Region must be US or INTL.");
  await setAccountRegion(account, region);
  return NextResponse.json({ ok: true, region });
}

/**
 * DELETE: erase the account and everything attached to it.
 *
 * Removes every child profile and its learning history, all sign-in sessions
 * and any outstanding password-reset tokens, then the account record itself.
 * Stripe keeps its own payment records under its own retention policy, which
 * the privacy policy states.
 */
export async function DELETE() {
  const account = await requireParent();
  if (isResponse(account)) return account;

  // eraseAccount is the single erasure path, shared with the dormancy purge:
  // it cancels billing first, then removes every child profile, sign-in and
  // reset token before the account row itself. Keeping one path is what makes
  // the privacy policy's deletion promise true everywhere rather than here.
  const { childrenRemoved } = await eraseAccount(account, { context: "account:delete" });
  await endSession();

  return NextResponse.json({ ok: true, childrenRemoved });
}
