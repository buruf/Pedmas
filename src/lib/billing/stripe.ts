import Stripe from "stripe";

/**
 * Stripe client, built lazily from the environment.
 *
 * Keys never live in source. Set STRIPE_SECRET_KEY to a restricted key
 * (rk_...) with only the permissions this integration needs: write on
 * Checkout Sessions, Customers and Billing Portal Sessions, and read on
 * Subscriptions. Until it is set the app runs in demo mode — every billing
 * surface still renders and explains what is missing rather than erroring.
 */

const API_VERSION = "2026-06-24.dahlia";

export interface StripeConfig {
  secretKey: string;
  webhookSecret: string;
  basePriceId: string;
  additionalPriceId: string;
  appUrl: string;
}

/** Missing configuration keys, for the demo-mode banner. */
export function billingConfigProblems(): string[] {
  const missing: string[] = [];
  if (!process.env.STRIPE_SECRET_KEY) missing.push("STRIPE_SECRET_KEY");
  if (!process.env.STRIPE_PRICE_FIRST_CHILD) missing.push("STRIPE_PRICE_FIRST_CHILD");
  if (!process.env.STRIPE_PRICE_ADDITIONAL_CHILD) missing.push("STRIPE_PRICE_ADDITIONAL_CHILD");
  return missing;
}

export function isBillingConfigured(): boolean {
  return billingConfigProblems().length === 0;
}

export function isWebhookConfigured(): boolean {
  return Boolean(process.env.STRIPE_WEBHOOK_SECRET);
}

export function appUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3080";
}

export function stripeConfig(): StripeConfig | null {
  if (!isBillingConfigured()) return null;
  return {
    secretKey: process.env.STRIPE_SECRET_KEY!,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
    basePriceId: process.env.STRIPE_PRICE_FIRST_CHILD!,
    additionalPriceId: process.env.STRIPE_PRICE_ADDITIONAL_CHILD!,
    appUrl: appUrl(),
  };
}

let client: Stripe | null = null;

/** The Stripe client, or null when billing is not configured. */
export function stripeClient(): Stripe | null {
  const cfg = stripeConfig();
  if (!cfg) return null;
  if (!client) {
    client = new Stripe(cfg.secretKey, { apiVersion: API_VERSION as Stripe.LatestApiVersion });
  }
  return client;
}
