import { NextResponse } from "next/server";
import { requireAccount, isResponse, bad } from "@/lib/api";
import { createPortalSession } from "@/lib/billing/service";

/** Stripe Customer Portal: card updates, plan changes and cancellation. */
export async function POST() {
  const account = await requireAccount();
  if (isResponse(account)) return account;
  try {
    const result = await createPortalSession(account);
    if ("error" in result) return bad(result.error);
    return NextResponse.json({ url: result.url });
  } catch (err) {
    console.error("[billing:portal]", err instanceof Error ? err.message : err);
    return bad("Could not open the billing portal. Please try again.", 502);
  }
}
