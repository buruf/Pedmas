import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  priceCentsFor,
  seatsFor,
  priceTable,
  canAddChild,
  formatCents,
  MAX_CHILDREN,
  FIRST_CHILD_CENTS,
  ADDITIONAL_CHILD_CENTS,
  TRIAL_DAYS,
} from "@/lib/billing/plan";
import { entitlementFor, hasPracticeAccess, remainingChildSlots, lockMessage } from "@/lib/billing/entitlement";

/**
 * Billing is money and access — the arithmetic and the gate both need to be
 * exact. These run against the pure modules, no Stripe calls.
 */

const DAY = 24 * 60 * 60 * 1000;

describe("family plan pricing", () => {
  it("charges the first child once and each extra at the lower rate", () => {
    expect(priceCentsFor(1)).toBe(1199);
    expect(priceCentsFor(2)).toBe(1199 + 599);
    expect(priceCentsFor(3)).toBe(1199 + 599 * 2);
    expect(priceCentsFor(4)).toBe(1199 + 599 * 3);
  });

  it("matches the advertised table exactly", () => {
    expect(priceTable().map((r) => formatCents(r.totalCents))).toEqual([
      "$11.99",
      "$17.98",
      "$23.97",
      "$29.96",
    ]);
  });

  it("never bills beyond the family cap", () => {
    expect(priceCentsFor(MAX_CHILDREN + 3)).toBe(priceCentsFor(MAX_CHILDREN));
    expect(seatsFor(99)).toEqual({ base: 1, additional: MAX_CHILDREN - 1 });
  });

  it("bills nothing with no children", () => {
    expect(priceCentsFor(0)).toBe(0);
    expect(seatsFor(0)).toEqual({ base: 0, additional: 0 });
  });

  it("seat quantities reconstruct the price", () => {
    for (let n = 1; n <= MAX_CHILDREN; n++) {
      const { base, additional } = seatsFor(n);
      expect(base * FIRST_CHILD_CENTS + additional * ADDITIONAL_CHILD_CENTS).toBe(priceCentsFor(n));
    }
  });

  it("stops families adding a fifth child", () => {
    expect(canAddChild(3)).toBe(true);
    expect(canAddChild(MAX_CHILDREN)).toBe(false);
    expect(remainingChildSlots(MAX_CHILDREN)).toBe(0);
    expect(remainingChildSlots(1)).toBe(MAX_CHILDREN - 1);
  });

  it("ignores fractional or negative counts", () => {
    expect(priceCentsFor(-2)).toBe(0);
    expect(priceCentsFor(2.7)).toBe(priceCentsFor(2));
  });

  it("offers a 7-day trial", () => {
    expect(TRIAL_DAYS).toBe(7);
  });
});

describe("entitlement gate", () => {
  const original = process.env.STRIPE_SECRET_KEY;
  const originalPriceA = process.env.STRIPE_PRICE_FIRST_CHILD;
  const originalPriceB = process.env.STRIPE_PRICE_ADDITIONAL_CHILD;

  beforeEach(() => {
    // Pretend Stripe is configured so the gate is live.
    process.env.STRIPE_SECRET_KEY = "rk_test_dummy";
    process.env.STRIPE_PRICE_FIRST_CHILD = "price_first";
    process.env.STRIPE_PRICE_ADDITIONAL_CHILD = "price_additional";
  });
  afterEach(() => {
    process.env.STRIPE_SECRET_KEY = original;
    process.env.STRIPE_PRICE_FIRST_CHILD = originalPriceA;
    process.env.STRIPE_PRICE_ADDITIONAL_CHILD = originalPriceB;
  });

  const acct = (billing?: Record<string, unknown>) =>
    ({ role: "PARENT" as const, billing: billing as never });

  it("locks an account with no subscription", () => {
    const e = entitlementFor(acct());
    expect(e.active).toBe(false);
    expect(lockMessage(e)).toMatch(/free trial/i);
  });

  it("unlocks during the trial and while active", () => {
    expect(hasPracticeAccess(acct({ status: "trialing" }))).toBe(true);
    expect(hasPracticeAccess(acct({ status: "active" }))).toBe(true);
  });

  it("keeps a past_due family practising until the period ends, then locks", () => {
    const now = Date.now();
    expect(hasPracticeAccess(acct({ status: "past_due", currentPeriodEnd: now + DAY }), now)).toBe(true);
    const expired = entitlementFor(acct({ status: "past_due", currentPeriodEnd: now - DAY }), now);
    expect(expired.active).toBe(false);
    expect(lockMessage(expired)).toMatch(/could not take the last payment/i);
  });

  it("locks once cancelled", () => {
    const e = entitlementFor(acct({ status: "canceled" }));
    expect(e.active).toBe(false);
    expect(lockMessage(e)).toMatch(/subscription has ended/i);
  });

  it("never locks an admin", () => {
    expect(hasPracticeAccess({ role: "ADMIN", billing: undefined })).toBe(true);
  });

  it("leaves everything unlocked when Stripe is not configured", () => {
    delete process.env.STRIPE_SECRET_KEY;
    const e = entitlementFor(acct());
    expect(e.active).toBe(true);
    expect(e.reason).toBe("unconfigured");
  });
});
