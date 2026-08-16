import { NextRequest, NextResponse } from "next/server";
import { requireAccount, isResponse, bad } from "@/lib/api";
import { getSkill } from "@/curriculum";
import { generateSet, stageLabelFor } from "@/engine/generate";
import { validateRaw } from "@/engine/validate";

/** Admin: generate a validated sample of questions for a skill+stage. */
export async function GET(req: NextRequest) {
  const account = await requireAccount();
  if (isResponse(account)) return account;
  if (account.role !== "ADMIN") return bad("Admin only.", 403);
  const skillId = req.nextUrl.searchParams.get("skillId") ?? "";
  const stage = Number(req.nextUrl.searchParams.get("stage") ?? "1");
  const skill = getSkill(skillId);
  if (!skill) return bad("Unknown skill.", 404);
  try {
    const questions = generateSet(skill, stage, 4);
    return NextResponse.json({
      skill: { id: skill.id, name: skill.name, grade: skill.grade, family: skill.family },
      stage,
      stageLabel: stageLabelFor(skill, stage),
      questions: questions.map((q) => ({
        instruction: q.instruction,
        prompt: q.prompt,
        choices: q.choices,
        answer: q.answer,
        steps: q.steps,
        hint: q.hint,
        concept: q.concept,
        difficulty: q.difficulty,
        validation: validateRaw({ ...q, verify: undefined }),
      })),
    });
  } catch (e) {
    return bad(`Generation failed: ${e instanceof Error ? e.message : String(e)}`, 500);
  }
}
