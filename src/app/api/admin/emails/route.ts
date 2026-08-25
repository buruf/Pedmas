import { NextResponse } from "next/server";
import { requireParent, isResponse, bad } from "@/lib/api";
import { runWeeklySummaries } from "@/lib/weeklyRun";
import { sendMail, isEmailConfigured } from "@/lib/email/send";
import { weeklyProgressMail, dormancyWarningMail } from "@/lib/email/templates";
import type { WeeklyStory } from "@/lib/weeklyStory";
import { unsubscribeUrl } from "@/lib/email/unsubscribe";
import { appUrl } from "@/lib/billing/stripe";

/**
 * Admin email operations: confirm the mail pipeline with your own eyes.
 *
 * "samples" sends one of each recurring template to the ADMIN's inbox with
 * clearly-fake data — rendering and deliverability proven without emailing a
 * single real family. "run-weekly" fires the real weekly run, identical to
 * the Sunday cron. The retention warning has no real-run variant here on
 * purpose: its real path deletes data, and the only way it should ever run
 * is the guarded daily cron.
 */
export async function POST(req: Request) {
  const admin = await requireParent();
  if (isResponse(admin)) return admin;
  if (admin.role !== "ADMIN") return bad("Admin only.", 403);
  if (!isEmailConfigured()) return bad("Email is not configured.");

  const body = await req.json().catch(() => null);
  const action = typeof body?.action === "string" ? body.action : "";

  if (action === "run-weekly") {
    return NextResponse.json(await runWeeklySummaries());
  }

  if (action === "samples") {
    const results: Record<string, boolean> = {};

    const sampleStory: WeeklyStory = {
      name: "Sample Child",
      questions: 32,
      accuracy: 88,
      minutes: 24,
      streak: 4,
      masteredThisWeek: ["Equivalent Fractions"],
      workingOn: { skillName: "Adding Fractions", stageLabel: "Common denominators", lessonTitle: "Making the pieces match" },
      workingHardOn: { skillName: "Adding Fractions", stageLabel: "Common denominators" },
      tryThis: { prompt: "1/2 + 1/4 = ?", answer: "3/4", hint: "Make both quarters first." },
    };
    const weekly = weeklyProgressMail(
      admin.email,
      "Sample Parent",
      [sampleStory],
      `${appUrl()}/home`,
      unsubscribeUrl(admin.id)
    );
    weekly.subject = "[SAMPLE] " + weekly.subject;
    results.weekly = (await sendMail(weekly)).sent;

    const dormancy = dormancyWarningMail(admin.email, "Sample Parent", 30, ["Sample Child"]);
    dormancy.subject = "[SAMPLE] " + dormancy.subject;
    results.dormancy = (await sendMail(dormancy)).sent;

    results.errorAlert = (
      await sendMail({
        to: admin.email,
        subject: "[SAMPLE] PEDMAS error: Example error for pipeline testing",
        html: `<p>This is a sample of the alert sent when a new error is recorded in production.</p><p><strong>Example error for pipeline testing</strong></p><p>Path: GET /api/example<br/>This sample was requested from the admin console; no real error occurred.</p>`,
        text: "This is a sample of the alert sent when a new error is recorded in production.\n\nExample error for pipeline testing\nPath: GET /api/example\n\nThis sample was requested from the admin console; no real error occurred.",
      })
    ).sent;

    return NextResponse.json({ ok: true, to: admin.email, results });
  }

  return bad("Unknown action.");
}
