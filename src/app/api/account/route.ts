import { NextResponse } from "next/server";
import { requireAccount, isResponse } from "@/lib/api";
import { endSession } from "@/lib/auth";
import { eraseAccount } from "@/lib/retention";

/**
 * DELETE: erase the account and everything attached to it.
 *
 * Removes every child profile and its learning history, all sign-in sessions
 * and any outstanding password-reset tokens, then the account record itself.
 * Stripe keeps its own payment records under its own retention policy, which
 * the privacy policy states.
 */
export async function DELETE() {
  const account = await requireAccount();
  if (isResponse(account)) return account;

  // eraseAccount is the single erasure path, shared with the dormancy purge:
  // it cancels billing first, then removes every child profile, sign-in and
  // reset token before the account row itself. Keeping one path is what makes
  // the privacy policy's deletion promise true everywhere rather than here.
  const { childrenRemoved } = await eraseAccount(account, { context: "account:delete" });
  await endSession();

  return NextResponse.json({ ok: true, childrenRemoved });
}
