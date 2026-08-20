import { NextResponse } from "next/server";
import { requireAccount, isResponse } from "@/lib/api";
import { endSession } from "@/lib/auth";
import { studentsOf } from "@/lib/students";
import { revokeTokensFor } from "@/lib/passwordReset";
import { allRows, deleteRow } from "@/lib/store/db";
import { cancelSubscriptionForDeletion } from "@/lib/billing/service";
import type { AuthSession } from "@/lib/model";

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

  // Stop the money before erasing the data: an active subscription on a
  // deleted account would keep charging a family that can no longer even
  // sign in to cancel. A billing failure is logged loudly but never blocks
  // deletion — erasure cannot depend on the billing API being up.
  const cancel = await cancelSubscriptionForDeletion(account);
  if (cancel.error) {
    console.error(
      `[account:delete] FAILED to cancel subscription ${account.billing?.subscriptionId} for ${account.id}: ${cancel.error} — cancel manually in the Stripe dashboard.`
    );
  }

  const children = await studentsOf(account);
  for (const child of children) {
    await deleteRow("students", child.id);
  }

  // Revoke every sign-in, not just this browser's.
  const sessions = await allRows<AuthSession>("authSessions");
  for (const s of sessions.filter((s) => s.accountId === account.id)) {
    await deleteRow("authSessions", s.id);
  }

  await revokeTokensFor(account.id);

  await deleteRow("accounts", account.id);
  await endSession();

  return NextResponse.json({ ok: true, childrenRemoved: children.length });
}
