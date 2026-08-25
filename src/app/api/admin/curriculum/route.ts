import { NextResponse } from "next/server";
import { requireParent, isResponse, bad } from "@/lib/api";
import { allSkills, strandLabel } from "@/curriculum";
import { stageLabelFor } from "@/engine/generate";
import { lessonKeyForSkill, LESSON_TITLES } from "@/lib/lessons";
import { loadOverrides, disabledSkillIds, setSkillDisabled } from "@/engine/overrides";

/**
 * Curriculum management (spec §21).
 *
 * The curriculum's CONTENT lives in the repository on purpose — versioned,
 * swept by the generation tests, reviewed like code. This endpoint gives the
 * operator the two things that belong at runtime: full visibility of the
 * hierarchy, and the ability to pull a misbehaving skill from rotation
 * immediately, without a deploy.
 */
async function requireAdmin() {
  const account = await requireParent();
  if (isResponse(account)) return account;
  if (account.role !== "ADMIN") return bad("Admin only.", 403);
  return account;
}

export async function GET(req: Request) {
  const admin = await requireAdmin();
  if (isResponse(admin)) return admin;
  const grade = Number(new URL(req.url).searchParams.get("grade") ?? "0");
  if (!grade || grade < 1 || grade > 12) return bad("grade must be 1-12.");
  await loadOverrides(true);
  const disabled = disabledSkillIds();

  const skills = allSkills()
    .filter((s) => s.grade === grade)
    .map((s) => {
      const lessonKey = lessonKeyForSkill(s.family, s.params);
      return {
        id: s.id,
        name: s.name,
        strandName: strandLabel(s.strandId),
        family: s.family,
        prereqs: s.prereqs,
        stages: [1, 2, 3, 4, 5].map((st) => stageLabelFor(s, st)),
        lessonTitle: lessonKey ? LESSON_TITLES[lessonKey] : null,
        disabled: disabled.has(s.id),
      };
    });
  return NextResponse.json({ grade, count: skills.length, skills });
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (isResponse(admin)) return admin;
  const body = await req.json().catch(() => null);
  const skillId = typeof body?.skillId === "string" ? body.skillId : "";
  if (!skillId || !allSkills().some((s) => s.id === skillId)) return bad("Unknown skill.");
  const disabled = body?.disabled === true;
  const reason = typeof body?.reason === "string" ? body.reason : "";
  if (disabled && !reason.trim()) return bad("A reason is required to disable a skill.");

  await setSkillDisabled(skillId, disabled, admin.email, reason);
  return NextResponse.json({ ok: true, skillId, disabled });
}
