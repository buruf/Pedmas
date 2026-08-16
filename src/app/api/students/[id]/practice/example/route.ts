import { NextRequest, NextResponse } from "next/server";
import { requireAccount, isResponse, bad } from "@/lib/api";
import { studentFor, workedExampleFor } from "@/lib/students";
import { entitlementFor } from "@/lib/billing/entitlement";

/**
 * GET: a worked example for the current question — same skill and stage, but
 * different numbers, so it teaches the method without handing over the answer.
 */
export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const account = await requireAccount();
  if (isResponse(account)) return account;
  const { id } = await ctx.params;
  const student = await studentFor(account, id);
  if (!student) return bad("Student not found.", 404);
  if (!entitlementFor(account).active) return bad("Subscription required.", 402);

  const example = workedExampleFor(student);
  if (!example) return bad("No active question.", 409);
  return NextResponse.json(example);
}
