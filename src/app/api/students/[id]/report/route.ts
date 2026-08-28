import { NextRequest, NextResponse } from "next/server";
import { requireAccount, isResponse, bad, guardStudentScope, sessionStudentId } from "@/lib/api";
import { studentFor } from "@/lib/students";
import { putRow, newId } from "@/lib/store/db";
import { clientKey, rateLimit } from "@/lib/rateLimit";
import { sendMail, isEmailConfigured } from "@/lib/email/send";

/**
 * A student (or parent) reports a problem from inside practice.
 *
 * The child flow is deliberately structured: they tap a reason, and the
 * question context attaches itself. There is NO free-text path for a child
 * session — the privacy policy promises we never collect free text from
 * children, and a bug box is exactly where a child would type their name,
 * their school, or their friend's. The server enforces this: any `message`
 * arriving on a child session is dropped, whatever the client claimed.
 */
const CATEGORIES = new Set([
  "answer-marked-wrong",
  "question-confusing",
  "lesson-unclear",
  "something-broken",
  "other",
]);

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const account = await requireAccount();
  if (isResponse(account)) return account;
  const { id } = await ctx.params;
  const scope = await guardStudentScope(id);
  if (scope) return scope;
  const student = await studentFor(account, id);
  if (!student) return bad("Student not found.", 404);

  const gate = await rateLimit("bugReport", clientKey(req), 5, 10 * 60);
  if (!gate.ok) return bad("Thanks — we already have your recent reports. Please try again later.", 429);

  const body = await req.json().catch(() => null);
  const category = typeof body?.category === "string" && CATEGORIES.has(body.category) ? body.category : "other";
  const isChild = Boolean(await sessionStudentId());
  // Free text is a parent-only field, enforced here rather than trusted to
  // the client. A child session's message is discarded unread.
  const message = !isChild && typeof body?.message === "string" ? body.message.trim().slice(0, 500) : "";

  const question = body?.question ?? {};
  const qid = typeof question?.id === "string" ? question.id.slice(0, 120) : "";
  const report = {
    id: newId("bug"),
    studentId: student.id,
    studentName: student.name,
    accountId: account.id,
    fromChildSession: isChild,
    category,
    message,
    path: typeof body?.path === "string" ? body.path.slice(0, 200) : "",
    question: {
      // The skill id is embedded in the question id (skill.sN.seed) — derive
      // it server-side rather than trusting a client-supplied value.
      skillId: qid.replace(/\.s\d+\.\d+$/, ""),
      stage: Number(question?.stage) || 0,
      prompt: typeof question?.prompt === "string" ? question.prompt.slice(0, 400) : "",
      id: qid,
    },
    createdAt: Date.now(),
  };
  await putRow("bugReports", report.id, report);

  // Tell the operator, at most once per cooldown window — same discipline as
  // error alerts, so a burst of reports pages a human once.
  if (isEmailConfigured()) {
    const alertGate = await rateLimit("bugAlert", "admin", 1, 6 * 60 * 60);
    if (alertGate.ok) {
      const to = process.env.PEDMAS_ADMIN_EMAIL ?? "admin@pedmas.com";
      await sendMail({
        to,
        subject: `PEDMAS bug report: ${category}`,
        html: `<p>A ${isChild ? "student" : "parent"} reported a problem.</p><p><strong>${category}</strong> — ${report.studentName}</p><p>${report.question.prompt ? "Question: " + report.question.prompt : "No question context."}</p><p>See the admin console for the full list. Further report alerts are paused for 6 hours.</p>`,
        text: `A ${isChild ? "student" : "parent"} reported a problem.\n\n${category} — ${report.studentName}\n${report.question.prompt ? "Question: " + report.question.prompt : "No question context."}\n\nSee the admin console. Further report alerts are paused for 6 hours.`,
      }).catch(() => undefined);
    }
  }

  return NextResponse.json({ ok: true });
}
