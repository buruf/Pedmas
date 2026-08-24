import type { Account, Billing } from "@/lib/model";
import { MAX_CHILDREN } from "./plan";
import { isBillingConfigured } from "./stripe";

/**
 * One place that decides what a family may use.
 *
 * Free forever: signing up, the adaptive placement, and the placement report.
 * Subscription required: daily practice, progress tracking, parent dashboard.
 *
 * While billing is unconfigured (no Stripe keys) everything is unlocked, so
 * local development and review never hit a paywall that cannot be satisfied.
 */

export type Entitlement =
  | { active: true; reason: "trialing" | "subscribed" | "unconfigured" | "admin" | "granted"; trialEndsAt?: number }
  | { active: false; reason: "none" | "past_due" | "canceled"; graceEndsAt?: number };

/** Statuses Stripe reports that still grant access. */
const ACTIVE_STATUSES = new Set(["active", "trialing"]);

export function entitlementFor(
  account: Pick<Account, "role" | "billing" | "compAccess">,
  now = Date.now()
): Entitlement {
  if (account.role === "ADMIN") return { active: true, reason: "admin" };

  // Complimentary access outranks Stripe: it is granted deliberately by a
  // human, and a family being tested or compensated should not be cut off
  // because they never had a card on file.
  const comp = account.compAccess;
  if (comp && (!comp.expiresAt || comp.expiresAt > now)) {
    return { active: true, reason: "granted" };
  }
  if (!isBillingConfigured()) return { active: true, reason: "unconfigured" };

  const b: Billing | undefined = account.billing;
  if (!b || !b.status) return { active: false, reason: "none" };

  if (b.status === "trialing") {
    return { active: true, reason: "trialing", trialEndsAt: b.trialEndsAt };
  }
  if (ACTIVE_STATUSES.has(b.status)) {
    return { active: true, reason: "subscribed" };
  }
  // past_due keeps access until the period ends so a failed card does not cut
  // a child off mid-session; Stripe retries in the meantime.
  if (b.status === "past_due" && b.currentPeriodEnd && b.currentPeriodEnd > now) {
    return { active: true, reason: "subscribed" };
  }
  if (b.status === "past_due" || b.status === "unpaid") {
    return { active: false, reason: "past_due", graceEndsAt: b.currentPeriodEnd };
  }
  return { active: false, reason: "canceled" };
}

export function hasPracticeAccess(
  account: Pick<Account, "role" | "billing" | "compAccess">,
  now = Date.now()
): boolean {
  return entitlementFor(account, now).active;
}

/** How many child profiles this account may still create. */
export function remainingChildSlots(currentCount: number): number {
  return Math.max(0, MAX_CHILDREN - currentCount);
}

/** Human explanation for a locked surface. */
export function lockMessage(e: Entitlement): string {
  if (e.active) return "";
  switch (e.reason) {
    case "past_due":
      return "We could not take the last payment. Update your card to keep practising.";
    case "canceled":
      return "Your subscription has ended. Resubscribe to continue daily practice.";
    default:
      return "Start your free trial to unlock daily practice.";
  }
}
