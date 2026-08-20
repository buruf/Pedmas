import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripeClient, appUrl } from "@/lib/billing/stripe";
import { syncSubscription, mergeBilling } from "@/lib/billing/service";
import { getRow, putRow, accountByCustomerId } from "@/lib/store/db";
import type { Account } from "@/lib/model";
import { sendMail } from "@/lib/email/send";
import {
  subscriptionStartedMail,
  trialEndingMail,
  paymentReceiptMail,
  paymentFailedMail,
} from "@/lib/email/templates";
import { priceCentsFor } from "@/lib/billing/plan";

/**
 * Stripe webhook. Signatures are always verified — an unverified webhook can
 * be spoofed, so an unconfigured signing secret is treated as a hard failure
 * rather than being waved through.
 *
 * Events are deduplicated by id so Stripe's at-least-once delivery cannot send
 * a receipt twice.
 */

async function alreadyHandled(eventId: string): Promise<boolean> {
  const seen = await getRow<{ id: string }>("stripeEvents", eventId);
  if (seen) return true;
  await putRow("stripeEvents", eventId, { id: eventId, at: Date.now() });
  return false;
}

async function accountForCustomer(customer: string | Stripe.Customer | Stripe.DeletedCustomer | null) {
  const id = typeof customer === "string" ? customer : customer?.id;
  if (!id) return null;
  return (await accountByCustomerId<Account>(id)) ?? null;
}

export async function POST(req: Request) {
  const stripe = stripeClient();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    console.error("[stripe:webhook] not configured");
    return NextResponse.json({ error: "Webhook not configured." }, { status: 503 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing signature." }, { status: 400 });

  const payload = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, secret);
  } catch (err) {
    console.error("[stripe:webhook] bad signature", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  if (await alreadyHandled(event.id)) return NextResponse.json({ received: true, duplicate: true });

  const billingUrl = `${appUrl()}/billing`;

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const accountId = session.client_reference_id ?? (session.metadata?.accountId as string | undefined);
        if (session.customer && accountId) {
          await mergeBilling(accountId, {
            customerId: typeof session.customer === "string" ? session.customer : session.customer.id,
          });
        }
        if (session.subscription) {
          const subId = typeof session.subscription === "string" ? session.subscription : session.subscription.id;
          const sub = await stripe.subscriptions.retrieve(subId);
          const account = await syncSubscription(sub);
          if (account) {
            const children = account.billing?.seats ?? Number(session.metadata?.children ?? 1);
            await sendMail(
              subscriptionStartedMail(
                account.email,
                account.name,
                children,
                priceCentsFor(children),
                sub.trial_end ? sub.trial_end * 1000 : undefined,
                billingUrl
              )
            );
          }
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        await syncSubscription(event.data.object as Stripe.Subscription);
        break;
      }

      case "customer.subscription.trial_will_end": {
        const sub = event.data.object as Stripe.Subscription;
        const account = await syncSubscription(sub);
        if (account && sub.trial_end) {
          await sendMail(trialEndingMail(account.email, account.name, sub.trial_end * 1000, billingUrl));
        }
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const account = await accountForCustomer(invoice.customer);
        // Skip the zero-amount invoice that opens a trial.
        if (account && (invoice.amount_paid ?? 0) > 0) {
          await sendMail(
            paymentReceiptMail(
              account.email,
              account.name,
              invoice.amount_paid ?? 0,
              invoice.period_end ? invoice.period_end * 1000 : undefined,
              billingUrl
            )
          );
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const account = await accountForCustomer(invoice.customer);
        if (account) {
          await sendMail(paymentFailedMail(account.email, account.name, billingUrl));
        }
        break;
      }

      default:
        break;
    }
  } catch (err) {
    // Return 500 so Stripe retries rather than dropping the event.
    console.error(`[stripe:webhook] handler failed for ${event.type}`, err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Handler failed." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
