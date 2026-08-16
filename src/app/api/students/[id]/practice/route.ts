import { NextRequest, NextResponse } from "next/server";
import { requireAccount, isResponse, bad } from "@/lib/api";
import { answerCurrent, ensureSession, saveStudent, studentFor } from "@/lib/students";
import { toClientQuestion } from "@/lib/model";

/** GET: today's session state and the current question. */
export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const account = await requireAccount();
  if (isResponse(account)) return account;
  const { id } = await ctx.params;
  const student = await studentFor(account, id);
  if (!student) return bad("Student not found.", 404);
  if (!student.placedAt) return bad("Placement comes first.", 409);
  const session = ensureSession(student);
  await saveStudent(student);
  const item = session.items[session.index];
  return NextResponse.json({
    sessionId: session.id,
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
          question: toClientQuestion(item.question),
          purpose: item.purpose,
          attempts: item.attempts,
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
  const student = await studentFor(account, id);
  if (!student) return bad("Student not found.", 404);
  const body = await req.json().catch(() => null);
  if (typeof body?.answer !== "string") return bad("An answer is required.");
  const result = answerCurrent(student, body.answer, Boolean(body.usedHint));
  if (!result) return bad("No active question.", 409);
  await saveStudent(student);
  return NextResponse.json(result);
}
