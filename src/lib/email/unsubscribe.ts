/**
 * One-click unsubscribe for the weekly summary.
 *
 * The link must work without a login — a parent skimming mail on their phone
 * will not sign in to stop mail — so it carries an HMAC of the account id.
 * The signature grants exactly one power: flipping that account's weekly
 * summary preference. It reveals nothing and cannot be forged without the
 * server secret. No secret configured ⇒ no link is rendered and the endpoint
 * refuses, which is the right failure for a dev environment.
 */
import { createHmac, timingSafeEqual } from "crypto";
import { appUrl } from "@/lib/billing/stripe";

function secret(): string | undefined {
  return process.env.CRON_SECRET;
}

export function unsubscribeSig(accountId: string): string | null {
  const key = secret();
  if (!key) return null;
  return createHmac("sha256", key).update(`weekly-unsub:${accountId}`).digest("hex");
}

export function unsubscribeUrl(accountId: string): string | null {
  const sig = unsubscribeSig(accountId);
  if (!sig) return null;
  return `${appUrl()}/api/email/unsubscribe?acct=${encodeURIComponent(accountId)}&sig=${sig}`;
}

export function verifyUnsubscribeSig(accountId: string, sig: string): boolean {
  const expected = unsubscribeSig(accountId);
  if (!expected) return false;
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
