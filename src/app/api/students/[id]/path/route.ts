import { NextRequest, NextResponse } from "next/server";
import { requireAccount, isResponse, bad } from "@/lib/api";
import { studentFor } from "@/lib/students";
import { strandChain, strandLabel } from "@/curriculum";
import { stageLabelFor } from "@/engine/generate";

/** The student's learning path per strand: mastered, current, upcoming. */
export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const account = await requireAccount();
  if (isResponse(account)) return account;
  const { id } = await ctx.params;
  const student = await studentFor(account, id);
  if (!student) return bad("Student not found.", 404);

  const strands = Object.keys(student.strandLevels).map((sid) => {
    const level = student.strandLevels[sid];
    const pointer = student.pointers[sid];
    const chain = strandChain(sid).filter(
      (s) => s.grade >= Math.max(1, level - 1) && s.grade <= Math.min(12, level + 1)
    );
    const pointerIdx = chain.findIndex((s) => s.id === pointer);
    const skills = chain.map((s, i) => {
      const state = student.skills[s.id];
      const status = state?.mastered
        ? "Mastered"
        : s.id === pointer || (pointerIdx === -1 && i === 0)
          ? "Current"
          : i < pointerIdx
            ? "Ready to Learn"
            : "Locked";
      return {
        id: s.id,
        name: s.name,
        grade: s.grade,
        status,
        stage: state?.stage ?? 1,
        stageLabel: state && !state.mastered ? stageLabelFor(s, state.stage) : null,
        assumed: state?.assumed ?? false,
      };
    });
    return { strandId: sid, strandName: strandLabel(sid), level, skills };
  });
  return NextResponse.json({ name: student.name, grade: student.grade, strands });
}
