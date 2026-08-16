import { NextResponse } from "next/server";
import { requireAccount, isResponse } from "@/lib/api";
import { studentsOf } from "@/lib/students";
import { entitlementFor } from "@/lib/billing/entitlement";
import { billingConfigProblems, isBillingConfigured } from "@/lib/billing/stripe";
import { emailConfigProblems } from "@/lib/email/send";
import {
  priceCentsFor,
  priceTable,
  formatCents,
  MAX_CHILDREN,
  TRIAL_DAYS,
  FIRST_CHILD_CENTS,
  ADDITIONAL_CHILD_CENTS,
} from "@/lib/billing/plan";

/** Billing status for the pricing and billing screens. */
export async function GET() {
  const account = await requireAccount();
  if (isResponse(account)) return account;

  const children = (await studentsOf(account)).length;
  const entitlement = entitlementFor(account);

  return NextResponse.json({
    configured: isBillingConfigured(),
    missingKeys: billingConfigProblems(),
    emailMissingKeys: emailConfigProblems(),
    entitlement,
    children,
    maxChildren: MAX_CHILDREN,
    trialDays: TRIAL_DAYS,
    monthlyCents: priceCentsFor(Math.max(1, children)),
    monthlyLabel: formatCents(priceCentsFor(Math.max(1, children))),
    firstChildCents: FIRST_CHILD_CENTS,
    additionalChildCents: ADDITIONAL_CHILD_CENTS,
    table: priceTable(),
    billing: {
      status: account.billing?.status ?? null,
      seats: account.billing?.seats ?? null,
      currentPeriodEnd: account.billing?.currentPeriodEnd ?? null,
      trialEndsAt: account.billing?.trialEndsAt ?? null,
      cancelAtPeriodEnd: account.billing?.cancelAtPeriodEnd ?? false,
      hasCustomer: Boolean(account.billing?.customerId),
    },
  });
}
