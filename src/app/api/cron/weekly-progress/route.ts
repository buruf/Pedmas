import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { allRows, getRow, putRow } from "@/lib/store/db";
import type { Account, StudentProfile } from "@/lib/model";
import { dayKeyOf } from "@/lib/model";
import { sendMail } from "@/lib/email/send";
import { weeklyProgressMail } from "@/lib/email/templates";
import { unsubscribeUrl } from "@/lib/email/unsubscribe";
import { appUrl } from "@/lib/billing/stripe";
import { buildWeeklyStory, shouldSendWeekly } from "@/lib/weeklyStory";

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

  const now = Date.now();
  const today = dayKeyOf(now);
  const accounts = await allRows<Account>("accounts");
  const students = await allRows<StudentProfile>("students");

  let sent = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const account of accounts) {
    if (account.role === "ADMIN") continue;
    if (account.emailPrefs?.weeklySummary === false) {
      skipped++;
      continue;
    }
    // At most one summary per account per day, so a retried cron cannot spam.
    if (account.emailPrefs?.lastWeeklySentDay === today) {
      skipped++;
      continue;
    }

    const mine = students.filter((s) => s.accountId === account.id);
    if (mine.length === 0) {
      skipped++;
      continue;
    }
    // Dormancy: active week or the first quiet one gets mail; beyond that,
    // silence until the family returns. See shouldSendWeekly for why.
    if (!mine.some((s) => shouldSendWeekly(s.recentSessions, now))) {
      skipped++;
      continue;
    }

    const children = mine.map((student) => buildWeeklyStory(student, now, account.region ?? "INTL"));

    try {
      const result = await sendMail(
        weeklyProgressMail(
          account.email,
          account.name,
          children,
          `${appUrl()}/parent/${mine[0].id}`,
          unsubscribeUrl(account.id)
        )
      );
      if (result.sent) sent++;
      else skipped++;
      const fresh = await getRow<Account>("accounts", account.id);
      if (fresh) {
        fresh.emailPrefs = { ...(fresh.emailPrefs ?? {}), lastWeeklySentDay: today };
        await putRow("accounts", fresh.id, fresh);
      }
    } catch (err) {
      errors.push(account.id);
      console.error("[cron:weekly]", err instanceof Error ? err.message : err);
    }
  }

  return NextResponse.json({ ok: true, sent, skipped, errors: errors.length });
}
