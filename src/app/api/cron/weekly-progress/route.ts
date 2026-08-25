import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { runWeeklySummaries } from "@/lib/weeklyRun";

/**
 * Weekly parent summary. Intended for a scheduled call (Vercel Cron or any
 * scheduler) once a week.
 *
 * Fails closed: without CRON_SECRET set, or without a matching bearer token,
 * the endpoint refuses rather than letting anyone trigger a mail run.
 */

function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = req.headers.get("authorization") ?? "";
  const provided = header.replace(/^Bearer\s+/i, "");
  const a = Buffer.from(provided);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Vercel Cron calls scheduled endpoints with GET; keep POST for manual runs. */
export async function GET(req: Request) {
  return run(req);
}

export async function POST(req: Request) {
  return run(req);
}

async function run(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  return NextResponse.json(await runWeeklySummaries());
}
