import { NextResponse } from "next/server";
import { requireAccount, isResponse, bad } from "@/lib/api";
import { studentsOf } from "@/lib/students";
import { createCheckoutSession } from "@/lib/billing/service";
import { MAX_CHILDREN } from "@/lib/billing/plan";
import { billingConfigProblems } from "@/lib/billing/stripe";

/** Start a subscription. Seats always follow the real child count. */
export async function POST() {
  const account = await requireAccount();
  if (isResponse(account)) return account;

  // Say what is actually wrong rather than "try again", which invites a
  // retry that can never succeed.
  const missing = billingConfigProblems();
  if (missing.length) {
    return bad(`Payments are not set up on this deployment yet — missing ${missing.join(", ")}.`, 503);
  }

  const children = (await studentsOf(account)).length;
  if (children === 0) return bad("Add a child profile before subscribing.");
  if (children > MAX_CHILDREN) return bad(`The family plan covers up to ${MAX_CHILDREN} children.`);

  try {
    const result = await createCheckoutSession(account, children);
    if ("error" in result) return bad(result.error);
    return NextResponse.json({ url: result.url });
  } catch (err) {
    console.error("[billing:checkout]", err instanceof Error ? err.message : err);
    return bad("Could not start checkout. Please try again.", 502);
  }
}
