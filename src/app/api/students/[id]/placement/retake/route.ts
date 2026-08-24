import { NextResponse } from "next/server";
import { requireParent, isResponse, bad } from "@/lib/api";
import { studentFor, saveStudent, resetPlacement } from "@/lib/students";

/**
 * Retake the placement test.
 *
 * Parent-only on purpose: this resets where a learner sits in the
 * curriculum, which is not a decision a child should be able to make about
 * themselves — nor one they should be able to make by accident.
 */
export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const account = await requireParent();
  if (isResponse(account)) return account;
  const { id } = await ctx.params;
  const student = await studentFor(account, id);
  if (!student) return bad("Student not found.", 404);

  const { kept, cleared } = resetPlacement(student);
  await saveStudent(student);
  return NextResponse.json({ ok: true, kept, cleared, name: student.name });
}
