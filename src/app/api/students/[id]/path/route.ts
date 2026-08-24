import { NextRequest, NextResponse } from "next/server";
import { requireAccount, isResponse, bad, guardStudentScope } from "@/lib/api";
import { studentFor } from "@/lib/students";
import { stageLabelFor } from "@/engine/generate";
import { focusSkillFor, currentGradeFor, skillsInGrade } from "@/engine/practice";

/**
 * The learning path: one grade, its skills in curriculum order.
 *
 * Not a column per strand. The learner completes a grade before the next one
 * opens, so the honest picture is a single ordered queue — what is done, the
 * one thing in progress, and what is still ahead in this grade.
 */
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

  const learner = {
    grade: student.grade,
    strandLevels: student.strandLevels,
    pointers: student.pointers,
    skills: student.skills,
  };
  const grade = currentGradeFor(learner);
  const focusId = focusSkillFor(learner)?.skill.id;

  const skills = skillsInGrade(grade).map((s) => {
    const state = student.skills[s.id];
    const status = state?.mastered ? "Mastered" : s.id === focusId ? "Current" : "Upcoming";
    return {
      id: s.id,
      name: s.name,
      strandName: s.strandName,
      status,
      stage: state?.stage ?? 1,
      stageLabel: status === "Current" ? stageLabelFor(s, state?.stage ?? 1) : null,
      assumed: state?.assumed ?? false,
    };
  });

  return NextResponse.json({
    name: student.name,
    grade: student.grade,
    currentGrade: grade,
    mastered: skills.filter((s) => s.status === "Mastered").length,
    total: skills.length,
    skills,
  });
}
