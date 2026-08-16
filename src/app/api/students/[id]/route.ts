import { NextRequest, NextResponse } from "next/server";
import { requireAccount, isResponse, bad } from "@/lib/api";
import { deleteStudent, progressSummary, studentFor } from "@/lib/students";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const account = await requireAccount();
  if (isResponse(account)) return account;
  const { id } = await ctx.params;
  const student = await studentFor(account, id);
  if (!student) return bad("Student not found.", 404);
  return NextResponse.json({
    id: student.id,
    name: student.name,
    grade: student.grade,
    goal: student.goal ?? null,
    placed: Boolean(student.placedAt),
    placementInProgress: Boolean(student.placement && !student.placement.done),
    progress: progressSummary(student),
  });
}

/**
 * DELETE: permanently remove a child profile and all of its learning history.
 * A parent must be able to delete what we hold about their child, so this is
 * irreversible by design.
 */
export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const account = await requireAccount();
  if (isResponse(account)) return account;
  const { id } = await ctx.params;
  const removed = await deleteStudent(account, id);
  if (!removed) return bad("Student not found.", 404);
  return NextResponse.json({ ok: true });
}
