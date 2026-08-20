import type Stripe from "stripe";
import type { Account, Billing } from "@/lib/model";
import { getRow, putRow, findRow } from "@/lib/store/db";
import { stripeClient, stripeConfig, appUrl } from "./stripe";
import { seatsFor, priceCentsFor, TRIAL_DAYS, MAX_CHILDREN, PLAN_NAME } from "./plan";

/**
 * Billing service: creates Checkout and Portal sessions and mirrors Stripe
 * subscription state onto the account. Stripe is always the source of truth;
 * the copy on the account exists only so page loads do not need an API call.
 */

/** Find or create the Stripe customer for an account. */
export async function ensureCustomer(account: Account): Promise<string | null> {
  const stripe = stripeClient();
  if (!stripe) return null;
  if (account.billing?.customerId) return account.billing.customerId;

  const customer = await stripe.customers.create({
    email: account.email,
    name: account.name,
    metadata: { accountId: account.id },
  });
  await mergeBilling(account.id, { customerId: customer.id });
  return customer.id;
}

/** Merge a partial billing update into an account. */
export async function mergeBilling(accountId: string, patch: Partial<Billing>): Promise<void> {
  const account = await getRow<Account>("accounts", accountId);
  if (!account) return;
  account.billing = { ...(account.billing ?? {}), ...patch, updatedAt: Date.now() };
  await putRow("accounts", account.id, account);
}

/**
 * Subscription Checkout for `children` seats.
 * Note: payment_method_types is deliberately omitted so Stripe can offer every
 * eligible payment method configured in the Dashboard.
 */
export async function createCheckoutSession(
  account: Account,
  children: number
): Promise<{ url: string } | { error: string }> {
  const stripe = stripeClient();
  const cfg = stripeConfig();
  if (!stripe || !cfg) return { error: "Billing is not configured yet." };
  if (children < 1) return { error: "Add a child profile before subscribing." };
  if (children > MAX_CHILDREN) return { error: `The family plan covers up to ${MAX_CHILDREN} children.` };

  const customerId = await ensureCustomer(account);
  if (!customerId) return { error: "Billing is not configured yet." };

  const { base, additional } = seatsFor(children);
  const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [
    { price: cfg.basePriceId, quantity: base },
  ];
  if (additional > 0) line_items.push({ price: cfg.additionalPriceId, quantity: additional });

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items,
    subscription_data: {
      trial_period_days: TRIAL_DAYS,
      metadata: { accountId: account.id, children: String(children), plan: PLAN_NAME },
    },
    client_reference_id: account.id,
    metadata: { accountId: account.id, children: String(children) },
    allow_promotion_codes: true,
    success_url: `${cfg.appUrl}/billing?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${cfg.appUrl}/pricing?checkout=cancelled`,
  });

  return session.url ? { url: session.url } : { error: "Stripe did not return a checkout URL." };
}

/** Customer Portal for self-service card, plan and cancellation changes. */
export async function createPortalSession(account: Account): Promise<{ url: string } | { error: string }> {
  const stripe = stripeClient();
  if (!stripe) return { error: "Billing is not configured yet." };
  const customerId = account.billing?.customerId ?? (await ensureCustomer(account));
  if (!customerId) return { error: "No billing profile yet." };
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${appUrl()}/billing`,
  });
  return { url: session.url };
}

/** Seat count currently billed, derived from the subscription's line items. */
export function seatsFromSubscription(sub: Stripe.Subscription, cfg: { basePriceId: string; additionalPriceId: string }): number {
  let seats = 0;
  for (const item of sub.items.data) {
    const priceId = typeof item.price === "string" ? item.price : item.price?.id;
    if (priceId === cfg.basePriceId) seats += item.quantity ?? 0;
    else if (priceId === cfg.additionalPriceId) seats += item.quantity ?? 0;
  }
  return seats;
}

/** Mirror a Stripe subscription onto its account. */
export async function syncSubscription(sub: Stripe.Subscription): Promise<Account | null> {
  const cfg = stripeConfig();
  const accountId =
    (sub.metadata?.accountId as string | undefined) ??
    (await accountIdForCustomer(typeof sub.customer === "string" ? sub.customer : sub.customer?.id));
  if (!accountId) return null;

  // Period end lives on the subscription items in current API versions.
  const periodEnd = sub.items.data[0]?.current_period_end ?? null;

  await mergeBilling(accountId, {
    subscriptionId: sub.id,
    status: sub.status,
    seats: cfg ? seatsFromSubscription(sub, cfg) : undefined,
    currentPeriodEnd: periodEnd ? periodEnd * 1000 : undefined,
    trialEndsAt: sub.trial_end ? sub.trial_end * 1000 : undefined,
    cancelAtPeriodEnd: sub.cancel_at_period_end ?? false,
  });
  return (await getRow<Account>("accounts", accountId)) ?? null;
}

async function accountIdForCustomer(customerId?: string): Promise<string | undefined> {
  if (!customerId) return undefined;
  const account = await findRow<Account>("accounts", (a) => a.billing?.customerId === customerId);
  return account?.id;
}

/** Keep the billed seat count in step with the number of child profiles. */
export async function syncSeats(account: Account, children: number): Promise<void> {
  const stripe = stripeClient();
  const cfg = stripeConfig();
  const subId = account.billing?.subscriptionId;
  if (!stripe || !cfg || !subId) return;
  if (children < 1 || children > MAX_CHILDREN) return;

  const sub = await stripe.subscriptions.retrieve(subId);
  if (sub.status === "canceled" || sub.status === "incomplete_expired") return;
  const { base, additional } = seatsFor(children);

  const baseItem = sub.items.data.find((i) => (typeof i.price === "string" ? i.price : i.price?.id) === cfg.basePriceId);
  const addItem = sub.items.data.find(
    (i) => (typeof i.price === "string" ? i.price : i.price?.id) === cfg.additionalPriceId
  );

  const items: Stripe.SubscriptionUpdateParams.Item[] = [];
  if (baseItem) items.push({ id: baseItem.id, quantity: base });
  if (addItem) items.push({ id: addItem.id, quantity: additional });
  else if (additional > 0) items.push({ price: cfg.additionalPriceId, quantity: additional });

  if (items.length === 0) return;
  const updated = await stripe.subscriptions.update(subId, { items, proration_behavior: "create_prorations" });
  await syncSubscription(updated);
}

export function monthlyTotalCents(children: number): number {
  return priceCentsFor(children);
}

/**
 * Whether a stored billing record points at a subscription that still needs
 * cancelling. Terminal Stripe statuses need no call; anything else does —
 * including past_due and unpaid, where Stripe would otherwise keep retrying
 * the card of an account that no longer exists.
 */
export function needsCancellation(billing: Billing | undefined): boolean {
  if (!billing?.subscriptionId) return false;
  return billing.status !== "canceled" && billing.status !== "incomplete_expired";
}

/**
 * Cancel the subscription immediately as part of account deletion.
 *
 * Immediate rather than at period end: the account and every child profile
 * are being erased, so there is nothing left to serve for the rest of the
 * paid period. A failure must never block deletion — the family's right to
 * erase their data cannot depend on the billing API being up — so this
 * returns the error for the caller to log loudly instead of throwing.
 */
export async function cancelSubscriptionForDeletion(
  account: Account
): Promise<{ canceled: boolean; error?: string }> {
  if (!needsCancellation(account.billing)) return { canceled: false };
  const stripe = stripeClient();
  if (!stripe) return { canceled: false };
  try {
    await stripe.subscriptions.cancel(account.billing!.subscriptionId!);
    return { canceled: true };
  } catch (err) {
    return { canceled: false, error: err instanceof Error ? err.message : String(err) };
  }
}
