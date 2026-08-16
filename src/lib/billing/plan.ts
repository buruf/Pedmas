/**
 * The PEDMAS family plan — one source of truth for pricing.
 *
 * Placement is always free: a family can complete the diagnostic and read the
 * full per-strand report without paying. Daily practice, progress tracking and
 * the parent dashboard need an active subscription.
 *
 * Billing is per child: the first costs FIRST_CHILD_CENTS and every further
 * child ADDITIONAL_CHILD_CENTS, up to MAX_CHILDREN. In Stripe this is one
 * subscription with two line items — a base price at quantity 1 and an
 * additional-child price at quantity (children - 1) — so a family can add or
 * remove children without changing plans.
 */

export const CURRENCY = "usd";
export const FIRST_CHILD_CENTS = 1199;
export const ADDITIONAL_CHILD_CENTS = 599;
export const MAX_CHILDREN = 4;
export const TRIAL_DAYS = 7;

/** Monthly total in cents for a given number of children. */
export function priceCentsFor(children: number): number {
  const n = Math.max(0, Math.min(MAX_CHILDREN, Math.floor(children)));
  if (n === 0) return 0;
  return FIRST_CHILD_CENTS + (n - 1) * ADDITIONAL_CHILD_CENTS;
}

/** Stripe line-item quantities for a given number of children. */
export function seatsFor(children: number): { base: number; additional: number } {
  const n = Math.max(0, Math.min(MAX_CHILDREN, Math.floor(children)));
  return { base: n > 0 ? 1 : 0, additional: Math.max(0, n - 1) };
}

export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/** Per-child breakdown for the pricing table. */
export function priceTable(): { children: number; totalCents: number; perChildCents: number }[] {
  return Array.from({ length: MAX_CHILDREN }, (_, i) => {
    const children = i + 1;
    const totalCents = priceCentsFor(children);
    return { children, totalCents, perChildCents: Math.round(totalCents / children) };
  });
}

/** True when a family may add another child profile. */
export function canAddChild(currentCount: number): boolean {
  return currentCount < MAX_CHILDREN;
}

export const PLAN_NAME = "PEDMAS Family";
