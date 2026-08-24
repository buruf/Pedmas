import { NextRequest, NextResponse } from "next/server";
import { requireParent, isResponse, bad } from "@/lib/api";
import { getSkill } from "@/curriculum";
import { generateSet, stageLabelFor } from "@/engine/generate";
import { validateRaw, dedupKey } from "@/engine/validate";

/** Admin: generate a validated sample of questions for a skill+stage. */
export async function GET(req: NextRequest) {
  const account = await requireParent();
  if (isResponse(account)) return account;
  if (account.role !== "ADMIN") return bad("Admin only.", 403);
  const skillId = req.nextUrl.searchParams.get("skillId") ?? "";
  const stage = Number(req.nextUrl.searchParams.get("stage") ?? "1");
  const skill = getSkill(skillId);
  if (!skill) return bad("Unknown skill.", 404);
  try {
    // Generate a wide sample so duplicate detection has something to find:
    // a family that can only make a handful of distinct questions is a real
    // content defect, and it is invisible in a sample of four.
    const SAMPLE = 40;
    const questions = generateSet(skill, stage, SAMPLE);
    const keys = questions.map((q) => dedupKey(q));
    const distinct = new Set(keys).size;
    const seen = new Map<string, number>();
    for (const k of keys) seen.set(k, (seen.get(k) ?? 0) + 1);
    const repeated = [...seen.entries()].filter(([, n]) => n > 1);

    const flagged = questions
      .map((q, i) => ({ q, i, res: validateRaw({ ...q, verify: undefined }) }))
      .filter((x) => !x.res.ok);

    return NextResponse.json({
      skill: { id: skill.id, name: skill.name, grade: skill.grade, family: skill.family },
      stage,
      stageLabel: stageLabelFor(skill, stage),
      // Question performance and duplicate detection (spec §21).
      health: {
        sampled: SAMPLE,
        distinct,
        duplicateRate: Math.round(((SAMPLE - distinct) / SAMPLE) * 100),
        repeatedCount: repeated.length,
        flaggedCount: flagged.length,
        flagged: flagged.slice(0, 5).map((x) => ({
          prompt: x.q.prompt,
          reasons: x.res.reasons,
        })),
        // A child grinding one skill to mastery meets it many times, so a
        // thin pool shows up as visible repetition rather than practice.
        verdict:
          flagged.length > 0
            ? "fails validation"
            : distinct >= 20
              ? "healthy"
              : distinct >= 10
                ? "thin"
                : "very thin",
      },
      questions: questions.slice(0, 6).map((q) => ({
        instruction: q.instruction,
        prompt: q.prompt,
        choices: q.choices,
        answer: q.answer,
        steps: q.steps,
        hint: q.hint,
        concept: q.concept,
        difficulty: q.difficulty,
        metadata: q.metadata,
        validation: validateRaw({ ...q, verify: undefined }),
      })),
    });
  } catch (e) {
    return bad(`Generation failed: ${e instanceof Error ? e.message : String(e)}`, 500);
  }
}
