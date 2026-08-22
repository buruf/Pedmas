import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { runRetentionSweep, DORMANT_DAYS, WARNING_LEAD_DAYS } from "@/lib/retention";

/**
 * Daily dormancy sweep: warn families approaching the retention limit, then
 * erase the accounts that passed it without returning.
 *
 * Fails closed exactly like the weekly-progress cron — without CRON_SECRET,
 * or without a matching bearer token, it refuses rather than letting anyone
 * on the internet trigger deletions.
 */
function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const provided = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  const a = Buffer.from(provided);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(req: Request) {
  return run(req);
}

export async function POST(req: Request) {
  return run(req);
}

async function run(req: Request) {
  if (!authorized(req)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const result = await runRetentionSweep();
  return NextResponse.json({
    ok: true,
    policy: { dormantDays: DORMANT_DAYS, warningLeadDays: WARNING_LEAD_DAYS },
    ...result,
    // Surfaced rather than silent: with no mail provider no warning can be
    // sent, so nothing is ever purged and the data keeps piling up.
    note: result.skippedNoEmail
      ? "Email is not configured, so no warnings were sent and nothing was purged. Set RESEND_API_KEY."
      : undefined,
  });
}
