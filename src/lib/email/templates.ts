import type { Mail } from "./send";
import { formatCents } from "@/lib/billing/plan";

/**
 * Email templates. Tone matches the product: encouraging, specific, never
 * implying a child is behind. Every mail degrades to readable plain text.
 */

const BRAND = "#7c3aed";

function layout(title: string, bodyHtml: string, cta?: { label: string; url: string }): string {
  return `<!doctype html>
<html><body style="margin:0;padding:24px;background:#f6f5fb;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1f2033">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;padding:28px">
    <div style="font-weight:800;font-size:18px;color:${BRAND};margin-bottom:20px">PEDMAS</div>
    <h1 style="font-size:20px;margin:0 0 14px">${title}</h1>
    ${bodyHtml}
    ${
      cta
        ? `<p style="margin:24px 0 8px"><a href="${cta.url}" style="display:inline-block;background:${BRAND};color:#fff;text-decoration:none;font-weight:700;padding:12px 20px;border-radius:10px">${cta.label}</a></p>`
        : ""
    }
    <p style="color:#6b6d80;font-size:12px;margin-top:26px">PEDMAS — an adaptive mathematics progression engine for Grades 1–12.</p>
  </div>
</body></html>`;
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/* ------------------------------------------------------------ password reset */
export function passwordResetMail(to: string, name: string, url: string, minutes: number): Mail {
  return {
    to,
    subject: "Reset your PEDMAS password",
    html: layout(
      "Reset your password",
      `<p>Hi ${esc(name)}, we received a request to reset your PEDMAS password.</p>
       <p>This link expires in ${minutes} minutes and can be used once. If you did not ask for it you can ignore this email — your password will not change.</p>`,
      { label: "Choose a new password", url }
    ),
    text: `Hi ${name},

We received a request to reset your PEDMAS password.

Reset it here (expires in ${minutes} minutes, single use):
${url}

If you did not ask for this you can ignore this email — your password will not change.`,
  };
}

/* ------------------------------------------------- welcome + placement report */
export interface ReportRow {
  strandName: string;
  level: number;
  status: string;
}

export function placementReportMail(
  to: string,
  parentName: string,
  childName: string,
  schoolGrade: number,
  rows: ReportRow[],
  dashboardUrl: string
): Mail {
  const list = rows
    .map(
      (r) =>
        `<tr><td style="padding:7px 0">${esc(r.strandName)}</td>
             <td style="padding:7px 0;text-align:right;font-weight:700">Grade ${r.level}</td>
             <td style="padding:7px 0;text-align:right;color:#6b6d80">${esc(r.status)}</td></tr>`
    )
    .join("");
  return {
    to,
    subject: `${childName}'s starting point in PEDMAS`,
    html: layout(
      `${esc(childName)}'s starting point`,
      `<p>Hi ${esc(parentName)}, ${esc(childName)} has finished the placement. Here is where each strand begins:</p>
       <table style="width:100%;border-collapse:collapse;font-size:14px;margin:12px 0">${list}</table>
       <p>Different levels in different strands is completely normal — that is exactly what PEDMAS is built for. Practice starts each strand where ${esc(
         childName
       )} is ready to learn, and moves up only when mastery is shown.</p>`,
      { label: "Open the parent dashboard", url: dashboardUrl }
    ),
    text: `Hi ${parentName},

${childName} (Grade ${schoolGrade} at school) has finished the PEDMAS placement.

${rows.map((r) => `${r.strandName}: Grade ${r.level} — ${r.status}`).join("\n")}

Different levels in different strands is completely normal. Practice starts each strand where ${childName} is ready to learn.

Parent dashboard: ${dashboardUrl}`,
  };
}

/* ------------------------------------------------- weekly progress to parent */
export interface WeeklyChild {
  name: string;
  questions: number;
  accuracy: number | null;
  streak: number;
  mastered: number;
  workingOn: string;
}

export function weeklyProgressMail(
  to: string,
  parentName: string,
  children: WeeklyChild[],
  dashboardUrl: string
): Mail {
  const blocks = children
    .map(
      (c) => `<div style="border:1px solid #eceaf5;border-radius:12px;padding:14px;margin:12px 0">
        <div style="font-weight:700;margin-bottom:6px">${esc(c.name)}</div>
        <div style="font-size:14px;color:#4a4c60">
          ${c.questions} questions this week${c.accuracy !== null ? ` · ${c.accuracy}% first-try accuracy` : ""}<br/>
          ${c.streak} day streak · ${c.mastered} skills mastered<br/>
          Working on: ${esc(c.workingOn)}
        </div>
      </div>`
    )
    .join("");
  const anyActivity = children.some((c) => c.questions > 0);
  return {
    to,
    subject: "This week in PEDMAS",
    html: layout(
      "This week's progress",
      `<p>Hi ${esc(parentName)}, here is how the week went.</p>
       ${blocks}
       <p>${
         anyActivity
           ? "Consistency is what turns practice into mastery — even a short session a day keeps every strand moving."
           : "No practice logged this week. A single 10-minute session is enough to keep the streak and the spaced review on track."
       }</p>`,
      { label: "See the full dashboard", url: dashboardUrl }
    ),
    text: `Hi ${parentName},

This week in PEDMAS:

${children
  .map(
    (c) =>
      `${c.name}: ${c.questions} questions${c.accuracy !== null ? `, ${c.accuracy}% first-try accuracy` : ""}, ${c.streak} day streak, ${c.mastered} skills mastered. Working on: ${c.workingOn}`
  )
  .join("\n")}

Dashboard: ${dashboardUrl}`,
  };
}

/* --------------------------------------------------------------- billing mail */
export function subscriptionStartedMail(
  to: string,
  name: string,
  children: number,
  amountCents: number,
  trialEndsAt: number | undefined,
  billingUrl: string
): Mail {
  const trial = trialEndsAt
    ? `Your free trial runs until ${new Date(trialEndsAt).toLocaleDateString("en-US", { dateStyle: "long" })}. We will not charge you before then, and you can cancel any time.`
    : "Your subscription is active.";
  return {
    to,
    subject: "Your PEDMAS subscription is set up",
    html: layout(
      "You're all set",
      `<p>Hi ${esc(name)}, thanks for subscribing to PEDMAS Family.</p>
       <p>${children} ${children === 1 ? "child" : "children"} · ${formatCents(amountCents)} per month.</p>
       <p>${trial}</p>`,
      { label: "Manage billing", url: billingUrl }
    ),
    text: `Hi ${name},

Thanks for subscribing to PEDMAS Family.
${children} ${children === 1 ? "child" : "children"} · ${formatCents(amountCents)} per month.

${trial}

Manage billing: ${billingUrl}`,
  };
}

export function trialEndingMail(to: string, name: string, endsAt: number, billingUrl: string): Mail {
  const when = new Date(endsAt).toLocaleDateString("en-US", { dateStyle: "long" });
  return {
    to,
    subject: "Your PEDMAS trial ends soon",
    html: layout(
      "Your trial ends soon",
      `<p>Hi ${esc(name)}, your PEDMAS free trial ends on ${when}, and your subscription will begin then.</p>
       <p>If PEDMAS is not right for your family you can cancel before that date and you will not be charged.</p>`,
      { label: "Manage billing", url: billingUrl }
    ),
    text: `Hi ${name},

Your PEDMAS free trial ends on ${when} and your subscription begins then.
You can cancel before that date and you will not be charged.

Manage billing: ${billingUrl}`,
  };
}

export function paymentReceiptMail(
  to: string,
  name: string,
  amountCents: number,
  periodEnd: number | undefined,
  billingUrl: string
): Mail {
  const next = periodEnd
    ? `Your next payment is due ${new Date(periodEnd).toLocaleDateString("en-US", { dateStyle: "long" })}.`
    : "";
  return {
    to,
    subject: `PEDMAS receipt — ${formatCents(amountCents)}`,
    html: layout(
      "Payment received",
      `<p>Hi ${esc(name)}, we received your payment of <strong>${formatCents(amountCents)}</strong>. Thank you.</p>
       <p>${next}</p>`,
      { label: "View billing", url: billingUrl }
    ),
    text: `Hi ${name},

We received your payment of ${formatCents(amountCents)}. Thank you.
${next}

Billing: ${billingUrl}`,
  };
}

export function paymentFailedMail(to: string, name: string, billingUrl: string): Mail {
  return {
    to,
    subject: "Action needed: your PEDMAS payment did not go through",
    html: layout(
      "We could not take your payment",
      `<p>Hi ${esc(name)}, the last payment for your PEDMAS subscription was declined.</p>
       <p>Practice stays available for now while we retry, but please update your card so nothing is interrupted.</p>`,
      { label: "Update payment method", url: billingUrl }
    ),
    text: `Hi ${name},

The last payment for your PEDMAS subscription was declined.
Practice stays available while we retry, but please update your card.

Update it here: ${billingUrl}`,
  };
}
