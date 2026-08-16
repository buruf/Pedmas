import { NextRequest, NextResponse } from "next/server";
import { requireAccount, isResponse, bad } from "@/lib/api";
import { progressSummary, studentFor } from "@/lib/students";

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
