import { NextRequest, NextResponse } from "next/server";
import { requireAccount, isResponse, bad, guardStudentScope } from "@/lib/api";
import {
  answerCurrent,
  ensureSession,
  markServed,
  lessonForCurrent,
  markLessonSeen,
  saveStudent,
  studentFor,
} from "@/lib/students";
import { toClientQuestion } from "@/lib/model";
import { ensureAccountRegion } from "@/lib/regionServer";
import { entitlementFor, lockMessage } from "@/lib/billing/entitlement";

/** 402 with the reason, so the client can show the right upgrade prompt. */
function locked(account: Parameters<typeof entitlementFor>[0]) {
  const e = entitlementFor(account);
  if (e.active) return null;
  return NextResponse.json(
    { error: lockMessage(e), locked: true, reason: e.reason },
    { status: 402 }
  );
}

/** GET: today's session state and the current question. */
export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const account = await requireAccount();
  if (isResponse(account)) return account;
  const { id } = await ctx.params;
  // A child session may reach only its own record; anything else is 404,
  // which reveals nothing about whether a sibling exists.
  const scope = await guardStudentScope(id);
  if (scope) return scope;
  const student = await studentFor(account, id);
  if (!student) return bad("Student not found.", 404);
  if (!student.placedAt) return bad("Placement comes first.", 409);
  const gate = locked(account);
  if (gate) return gate;
  const region = await ensureAccountRegion(account);
  const session = ensureSession(student, account.timezone, region);
  // Start the clock on whichever question is now in front of the student.
  markServed(student);
  await saveStudent(student);
  const item = session.items[session.index];
  return NextResponse.json({
    sessionId: session.id,
    region,
    // Drives age-appropriate presentation on the practice screen (spec §25).
    grade: student.grade,
    total: session.items.length,
    index: session.index,
    complete: Boolean(session.completedAt) || session.index >= session.items.length,
    summary: {
      firstTry: session.items.filter((i) => i.correctFirstTry).length,
      answered: session.items.filter((i) => i.eventuallyCorrect !== undefined).length,
      purposes: session.items.map((i) => i.purpose),
    },
    current: item
      ? {
          question: toClientQuestion(item.question, region),
          purpose: item.purpose,
          attempts: item.attempts,
          lesson: lessonForCurrent(student),
        }
      : null,
    streak: student.streak.count,
  });
}

/** POST: answer the current question. */
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const account = await requireAccount();
  if (isResponse(account)) return account;
  const { id } = await ctx.params;
  // A child session may reach only its own record; anything else is 404,
  // which reveals nothing about whether a sibling exists.
  const scope = await guardStudentScope(id);
  if (scope) return scope;
  const student = await studentFor(account, id);
  if (!student) return bad("Student not found.", 404);
  const gate = locked(account);
  if (gate) return gate;
  await ensureAccountRegion(account);
  const body = await req.json().catch(() => null);
  if (typeof body?.answer !== "string") return bad("An answer is required.");
  const result = answerCurrent(student, body.answer, Boolean(body.usedHint), account.timezone);
  if (!result) return bad("No active question.", 409);
  await saveStudent(student);
  return NextResponse.json(result);
}
