import type { Mail } from "./send";
import { formatCents } from "@/lib/billing/plan";
import { appUrl } from "@/lib/billing/stripe";

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
       )} is ready to learn, and moves up only when mastery is shown.</p>
       <p style="font-size:12px;color:#6b7280">A note on grade levels: PEDMAS follows a rigorous international sequence that introduces some topics earlier than some school curricula do. If ${esc(
         childName
       )} meets something here before it comes up at school, that is by design — every topic is fully taught before it is practised.</p>`,
      { label: "Open the parent dashboard", url: dashboardUrl }
    ),
    text: `Hi ${parentName},

${childName} (Grade ${schoolGrade} at school) has finished the PEDMAS placement.

${rows.map((r) => `${r.strandName}: Grade ${r.level} — ${r.status}`).join("\n")}

Different levels in different strands is completely normal. Practice starts each strand where ${childName} is ready to learn.

A note on grade levels: PEDMAS follows a rigorous international sequence that introduces some topics earlier than some school curricula do. Meeting something here before it comes up at school is by design — every topic is fully taught before it is practised.

Parent dashboard: ${dashboardUrl}`,
  };
}

/* ------------------------------------------------- weekly progress to parent */
import type { WeeklyStory } from "@/lib/weeklyStory";

/**
 * The weekly note home. Reads like a tutor's note, not a report card: what
 * moved, what is current, one focus, one question to try together. The
 * "working hard on" line is deliberately singular and framed as effort.
 */
function childBlock(c: WeeklyStory): string {
  const lines: string[] = [];
  if (c.questions > 0) {
    lines.push(
      `${c.questions} questions${c.minutes > 0 ? ` · ${c.minutes} min of focused work` : ""}${
        c.accuracy !== null ? ` · ${c.accuracy}% right first try` : ""
      }${c.streak > 1 ? ` · ${c.streak}-day streak` : ""}`
    );
  } else {
    lines.push("No practice this week — a single 10-minute session keeps the streak and the review schedule alive.");
  }
  if (c.masteredThisWeek.length) {
    lines.push(`<strong>Moved past this week:</strong> ${c.masteredThisWeek.map(esc).join(", ")}.`);
  }
  // When the current skill IS the struggle, one merged line — repeating the
  // same skill name twice in a row reads like a glitch.
  const merged = c.workingHardOn && c.workingOn?.skillName === c.workingHardOn.skillName;
  if (merged && c.workingOn) {
    lines.push(
      `<strong>Working hard on:</strong> ${esc(c.workingOn.skillName)} — ${esc(
        c.workingOn.stageLabel
      )}. This is the one spot where a few minutes together would help most.${
        c.workingOn.lessonTitle ? ` The lesson for it is “${esc(c.workingOn.lessonTitle)}”.` : ""
      }`
    );
  } else {
    if (c.workingOn) {
      lines.push(
        `<strong>Now working on:</strong> ${esc(c.workingOn.skillName)} — ${esc(c.workingOn.stageLabel)}.${
          c.workingOn.lessonTitle ? ` The lesson for it is “${esc(c.workingOn.lessonTitle)}”.` : ""
        }`
      );
    }
    if (c.workingHardOn) {
      lines.push(
        `<strong>Working hard on:</strong> ${esc(c.workingHardOn.skillName)} (${esc(
          c.workingHardOn.stageLabel
        )}). This is the one spot where a few minutes together would help most.`
      );
    }
  }
  const tryBox = c.tryThis
    ? `<div style="background:#f6f5fb;border-radius:10px;padding:12px;margin-top:10px;font-size:14px">
        <div style="font-weight:700;margin-bottom:4px">Try this one together</div>
        <div>${esc(c.tryThis.prompt)}</div>
        ${c.tryThis.hint ? `<div style="color:#6b6d80;margin-top:4px">Nudge if stuck: ${esc(c.tryThis.hint)}</div>` : ""}
        <div style="color:#6b6d80;margin-top:4px">Answer: ${esc(c.tryThis.answer)}</div>
      </div>`
    : "";
  return `<div style="border:1px solid #eceaf5;border-radius:12px;padding:14px;margin:12px 0">
    <div style="font-weight:700;margin-bottom:6px">${esc(c.name)}</div>
    <div style="font-size:14px;color:#4a4c60;line-height:1.55">${lines.join("<br/>")}</div>
    ${tryBox}
  </div>`;
}

function childText(c: WeeklyStory): string {
  const lines = [`${c.name}:`];
  lines.push(
    c.questions > 0
      ? `  ${c.questions} questions${c.minutes > 0 ? `, ${c.minutes} min` : ""}${
          c.accuracy !== null ? `, ${c.accuracy}% right first try` : ""
        }${c.streak > 1 ? `, ${c.streak}-day streak` : ""}`
      : "  No practice this week — one 10-minute session keeps things moving."
  );
  if (c.masteredThisWeek.length) lines.push(`  Moved past: ${c.masteredThisWeek.join(", ")}.`);
  const merged = c.workingHardOn && c.workingOn?.skillName === c.workingHardOn.skillName;
  if (merged && c.workingOn) {
    lines.push(`  Working hard on: ${c.workingOn.skillName} — ${c.workingOn.stageLabel}. A few minutes together here would help most.`);
  } else {
    if (c.workingOn) lines.push(`  Now working on: ${c.workingOn.skillName} — ${c.workingOn.stageLabel}.`);
    if (c.workingHardOn)
      lines.push(`  Working hard on: ${c.workingHardOn.skillName} (${c.workingHardOn.stageLabel}) — a few minutes together here would help most.`);
  }
  if (c.tryThis) {
    lines.push(`  Try this one together: ${c.tryThis.prompt}`);
    if (c.tryThis.hint) lines.push(`    Nudge if stuck: ${c.tryThis.hint}`);
    lines.push(`    Answer: ${c.tryThis.answer}`);
  }
  return lines.join("\n");
}

export function weeklyProgressMail(
  to: string,
  parentName: string,
  children: WeeklyStory[],
  dashboardUrl: string,
  unsubscribeUrl?: string | null
): Mail {
  const anyActivity = children.some((c) => c.questions > 0);
  const highlight = children.find((c) => c.masteredThisWeek.length > 0);
  const subject = highlight
    ? `${highlight.name} moved past ${highlight.masteredThisWeek[0]} this week`
    : anyActivity
      ? "This week in PEDMAS"
      : "A quiet week in PEDMAS";
  const footer = unsubscribeUrl
    ? `<p style="color:#9a9cb0;font-size:12px;margin-top:8px"><a href="${unsubscribeUrl}" style="color:#9a9cb0">Stop these weekly summaries</a></p>`
    : "";
  return {
    to,
    subject,
    html: layout(
      "This week's progress",
      `<p>Hi ${esc(parentName)}, here is how the week went.</p>
       ${children.map(childBlock).join("")}
       <p>${
         anyActivity
           ? "Consistency is what turns practice into mastery — even a short session a day keeps every strand moving."
           : "Picking the streak back up takes one short session — the review schedule adapts, nothing is lost."
       }</p>${footer}`,
      { label: "See the full dashboard", url: dashboardUrl }
    ),
    text: `Hi ${parentName},

This week in PEDMAS:

${children.map(childText).join("\n\n")}

Dashboard: ${dashboardUrl}${unsubscribeUrl ? `\n\nStop these weekly summaries: ${unsubscribeUrl}` : ""}`,
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

/* --------------------------------------------------- dormancy / retention */
/**
 * Sent before a dormant account is deleted. The tone is a reminder, not a
 * threat: signing in is all it takes, and the mail says exactly what would
 * be lost and when.
 */
export function dormancyWarningMail(
  to: string,
  parentName: string,
  daysLeft: number,
  childNames: string[]
): Mail {
  const who =
    childNames.length === 0
      ? "your account"
      : childNames.length === 1
        ? `${childNames[0]}'s progress`
        : `${childNames.slice(0, -1).join(", ")} and ${childNames[childNames.length - 1]}'s progress`;
  return {
    to,
    subject: "Your PEDMAS account will be deleted soon",
    html: layout(
      "We are about to delete your data",
      `<p>Hi ${esc(parentName)}, nobody has used your PEDMAS account for about two years.</p>
       <p>We do not keep children's learning data longer than it is useful, so in <strong>${daysLeft} day${daysLeft === 1 ? "" : "s"}</strong> we will permanently delete your account and ${esc(who)}.</p>
       <p><strong>Signing in is all it takes to keep everything.</strong> If you would rather we went ahead and deleted it, you need do nothing at all.</p>`,
      { label: "Sign in to keep my data", url: `${appUrl()}/login` }
    ),
    text: `Hi ${parentName},

Nobody has used your PEDMAS account for about two years.

We do not keep children's learning data longer than it is useful, so in ${daysLeft} day${daysLeft === 1 ? "" : "s"} we will permanently delete your account and ${who}.

Signing in is all it takes to keep everything: ${appUrl()}/login

If you would rather we deleted it, you need do nothing at all.`,
  };
}
