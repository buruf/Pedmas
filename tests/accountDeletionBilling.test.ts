import { describe, it, expect, vi } from "vitest";

/**
 * The legal-review defect: deleting an account must cancel a live Stripe
 * subscription, immediately, and a Stripe failure must never block deletion.
 * The Stripe client is mocked so the real call path is exercised end-to-end.
 */
const cancel = vi.fn();
vi.mock("@/lib/billing/stripe", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@/lib/billing/stripe")>();
  return { ...mod, stripeClient: () => ({ subscriptions: { cancel } }) };
});

import { cancelSubscriptionForDeletion } from "@/lib/billing/service";

const account = (billing?: object) =>
  ({ id: "acc_1", email: "x@y.z", name: "X", billing }) as never;

describe("account deletion cancels the subscription", () => {
  it("cancels immediately with the stored subscription id", async () => {
    cancel.mockReset().mockResolvedValue({ id: "sub_live", status: "canceled" });
    const res = await cancelSubscriptionForDeletion(account({ subscriptionId: "sub_live", status: "active" }));
    expect(cancel).toHaveBeenCalledExactlyOnceWith("sub_live");
    expect(res).toEqual({ canceled: true });
  });

  it("reports a Stripe failure instead of throwing, so deletion proceeds", async () => {
    cancel.mockReset().mockRejectedValue(new Error("stripe is down"));
    const res = await cancelSubscriptionForDeletion(account({ subscriptionId: "sub_live", status: "trialing" }));
    expect(res.canceled).toBe(false);
    expect(res.error).toContain("stripe is down");
  });

  it("makes no call for an already-finished or absent subscription", async () => {
    cancel.mockReset();
    await cancelSubscriptionForDeletion(account({ subscriptionId: "sub_old", status: "canceled" }));
    await cancelSubscriptionForDeletion(account(undefined));
    expect(cancel).not.toHaveBeenCalled();
  });
});
