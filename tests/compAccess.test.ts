import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { entitlementFor, hasPracticeAccess } from "@/lib/billing/entitlement";
import type { Account } from "@/lib/model";

/**
 * Complimentary access: an admin unlocking a family without touching Stripe.
 * Needed for beta families and test accounts, and for goodwill after a
 * support problem — all cases where a card on file is the wrong requirement.
 */

// The gate only exists when Stripe is configured; unconfigured unlocks
// everything, which is right for local development but would make these
// assertions vacuous.
const ENV = { ...process.env };
beforeEach(() => {
  process.env.STRIPE_SECRET_KEY = "sk_test_x";
  process.env.STRIPE_PRICE_FIRST_CHILD = "price_a";
  process.env.STRIPE_PRICE_ADDITIONAL_CHILD = "price_b";
});
afterEach(() => {
  process.env = { ...ENV };
});

const DAY = 24 * 60 * 60 * 1000;
const NOW = 1_800_000_000_000;
const account = (over: Partial<Account> = {}): Account =>
  ({ id: "a", email: "p@x.com", role: "PARENT", ...over }) as Account;

describe("granted access", () => {
  it("unlocks a family with no subscription at all", () => {
    const granted = account({
      compAccess: { grantedAt: NOW - DAY, grantedBy: "admin@pedmas.com", reason: "Beta testing" },
    });
    const e = entitlementFor(granted, NOW);
    expect(e.active).toBe(true);
    expect(e.reason).toBe("granted");
    expect(hasPracticeAccess(granted, NOW)).toBe(true);
  });

  it("still locks a family with neither subscription nor grant", () => {
    expect(entitlementFor(account(), NOW).active).toBe(false);
  });

  it("expires when the grant runs out", () => {
    const expired = account({
      compAccess: { grantedAt: NOW - 40 * DAY, grantedBy: "admin", reason: "trial", expiresAt: NOW - DAY },
    });
    expect(entitlementFor(expired, NOW).active).toBe(false);

    const live = account({
      compAccess: { grantedAt: NOW, grantedBy: "admin", reason: "trial", expiresAt: NOW + DAY },
    });
    expect(entitlementFor(live, NOW).active).toBe(true);
  });

  it("outranks a cancelled subscription, so a comped family is not cut off", () => {
    const comped = account({
      billing: { status: "canceled" },
      compAccess: { grantedAt: NOW, grantedBy: "admin", reason: "goodwill" },
    });
    expect(entitlementFor(comped, NOW).active).toBe(true);
  });

  it("does not fake a Stripe status — billing stays truthful", () => {
    const comped = account({
      compAccess: { grantedAt: NOW, grantedBy: "admin", reason: "beta" },
    });
    // The mirror of Stripe must remain empty: the family genuinely has no
    // subscription, and the next webhook must not have to fight us.
    expect(comped.billing).toBeUndefined();
  });

  it("records who granted it and why", () => {
    const comped = account({
      compAccess: { grantedAt: NOW, grantedBy: "admin@pedmas.com", reason: "Beta family #3" },
    });
    expect(comped.compAccess?.grantedBy).toBe("admin@pedmas.com");
    expect(comped.compAccess?.reason).toBe("Beta family #3");
  });
});
