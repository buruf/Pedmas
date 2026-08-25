/**
 * The weekly-summary mail run, extracted so it has exactly two callers with
 * one behaviour: the scheduled cron (CRON_SECRET) and the admin's "send now"
 * button. Two copies of this loop would drift the first time one was edited.
 */
import { allRows, getRow, putRow } from "@/lib/store/db";
import type { Account, StudentProfile } from "@/lib/model";
import { dayKeyOf } from "@/lib/model";
import { sendMail } from "@/lib/email/send";
import { weeklyProgressMail } from "@/lib/email/templates";
import { unsubscribeUrl } from "@/lib/email/unsubscribe";
import { appUrl } from "@/lib/billing/stripe";
import { buildWeeklyStory, shouldSendWeekly } from "@/lib/weeklyStory";

export interface WeeklyRunResult {
  ok: true;
  sent: number;
  skipped: number;
  errors: number;
}

export async function runWeeklySummaries(now = Date.now()): Promise<WeeklyRunResult> {
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
    // At most one summary per account per day, so a retried run cannot spam.
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
      console.error("[weekly-run]", err instanceof Error ? err.message : err);
    }
  }

  return { ok: true, sent, skipped, errors: errors.length };
}
