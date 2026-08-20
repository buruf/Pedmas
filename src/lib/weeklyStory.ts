/**
 * The weekly parent email's content.
 *
 * The parent pays; the child practices. This module turns a week of practice
 * into the note a good tutor would send home: what the child moved past,
 * what they are working on now, where they are working hardest, and one real
 * question to try together at the table. Numbers support the story — they
 * are not the story.
 *
 * Tone rules (same as the product): specific, encouraging, and never implying
 * a child is behind. A struggle is reported as "working hard on", singular —
 * one focus, never a list of failures.
 */
import type { StudentProfile, SessionSummary } from "@/lib/model";
import { activeMinutes } from "@/lib/students";
import { getSkill } from "@/curriculum";
import type { Skill } from "@/curriculum/types";
import { generateQuestion, stageLabelFor } from "@/engine/generate";
import { localise, type Region } from "@/lib/region";
import { lessonKeyForSkill, LESSON_TITLES } from "@/lib/lessons";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export interface WeeklyStory {
  name: string;
  questions: number;
  accuracy: number | null; // first-try, this week
  minutes: number;
  streak: number;
  /** Skills genuinely mastered this week (placement-assumed ones excluded). */
  masteredThisWeek: string[];
  workingOn: { skillName: string; stageLabel: string; lessonTitle: string | null } | null;
  /** At most one — the skill that deserves the parent's attention. */
  workingHardOn: { skillName: string; stageLabel: string } | null;
  /** One real question from that exact skill and stage, to try together. */
  tryThis: { prompt: string; answer: string; hint: string } | null;
}

/**
 * Whether this account should get a summary at all this week.
 *
 * Active week: always. First quiet week after an active one: yes — that nudge
 * is the mail's whole retention job. Quiet beyond that: silence. Mailing a
 * dormant family "no practice again" every Sunday forever trains them to mark
 * it spam, which then costs deliverability for everyone.
 */
export function shouldSendWeekly(sessions: SessionSummary[], now: number): boolean {
  const thisWeek = sessions.some((s) => s.completedAt >= now - WEEK_MS);
  if (thisWeek) return true;
  return sessions.some((s) => s.completedAt >= now - 2 * WEEK_MS);
}

/** Deterministic per-student-per-week seed, so a retried cron resends the identical mail. */
function weeklySeed(studentId: string, now: number): number {
  const week = Math.floor(now / WEEK_MS);
  let h = week;
  for (let i = 0; i < studentId.length; i++) h = (h * 31 + studentId.charCodeAt(i)) >>> 0;
  return h;
}

/**
 * A question a parent can read aloud from an email: one line, short, and not
 * dependent on an on-screen diagram or table.
 */
function emailable(prompt: string): boolean {
  return !prompt.includes("\n") && prompt.length <= 140;
}

function tryThisFor(skill: Skill, stage: number, seed: number, region: Region): WeeklyStory["tryThis"] {
  for (let i = 0; i < 8; i++) {
    try {
      const q = generateQuestion(skill, Math.max(1, Math.min(5, stage)), { seed: seed + i * 7919, region });
      if (!emailable(q.prompt) || q.choices?.length) continue;
      return {
        prompt: localise(q.prompt, region),
        answer: q.answer,
        hint: localise(q.hint ?? "", region),
      };
    } catch {
      return null;
    }
  }
  return null;
}

export function buildWeeklyStory(student: StudentProfile, now: number, region: Region): WeeklyStory {
  const recent = student.recentSessions.filter((s) => s.completedAt >= now - WEEK_MS);
  const questions = recent.reduce((a, s) => a + s.total, 0);
  const firstTry = recent.reduce((a, s) => a + s.firstTryCorrect, 0);

  const masteredThisWeek = Object.values(student.skills ?? {})
    .filter((st) => st.mastered && !st.assumed && (st.masteredAt ?? 0) >= now - WEEK_MS)
    .map((st) => getSkill(st.skillId)?.name)
    .filter((n): n is string => Boolean(n))
    .slice(0, 4);

  // The skill that deserves attention: repair takes priority (the engine has
  // already decided it needs help); otherwise the week's weakest well-sampled
  // skill. One or none — a list of struggles reads as a report card.
  let hardState = Object.values(student.skills ?? {}).find(
    (st) => st.needsRepair && !st.mastered && st.attempts.some((a) => a.ts >= now - WEEK_MS)
  );
  if (!hardState) {
    let worst = 0.6; // only flag below 60% first-try
    for (const st of Object.values(student.skills ?? {})) {
      if (st.mastered) continue;
      const week = st.attempts.filter((a) => a.ts >= now - WEEK_MS);
      if (week.length < 5) continue;
      const acc = week.filter((a) => a.correct).length / week.length;
      if (acc < worst) {
        worst = acc;
        hardState = st;
      }
    }
  }
  const hardSkill = hardState ? getSkill(hardState.skillId) : undefined;

  // "Working on" comes from the strand pointers; prefer a strand the child
  // actually touched this week so the line matches what they remember doing.
  const touched = new Set(
    Object.values(student.skills ?? {})
      .filter((st) => st.attempts.some((a) => a.ts >= now - WEEK_MS))
      .map((st) => getSkill(st.skillId)?.strandId)
  );
  let workingOn: WeeklyStory["workingOn"] = null;
  let workingSkill: Skill | undefined;
  const pointerIds = Object.entries(student.pointers ?? {});
  pointerIds.sort(([a], [b]) => Number(touched.has(b)) - Number(touched.has(a)));
  for (const [, skillId] of pointerIds) {
    const skill = getSkill(skillId);
    if (!skill) continue;
    const st = student.skills[skill.id];
    if (st?.mastered) continue;
    const key = lessonKeyForSkill(skill.family, skill.params);
    workingSkill = skill;
    workingOn = {
      skillName: skill.name,
      stageLabel: localise(stageLabelFor(skill, st?.stage ?? 1), region),
      lessonTitle: key ? LESSON_TITLES[key] : null,
    };
    break;
  }

  const tryTarget = hardSkill ?? workingSkill;
  const tryStage = tryTarget ? (student.skills[tryTarget.id]?.stage ?? 1) : 1;

  return {
    name: student.name,
    questions,
    accuracy: questions > 0 ? Math.round((firstTry / questions) * 100) : null,
    minutes: activeMinutes(recent),
    streak: student.streak.count,
    masteredThisWeek,
    workingOn,
    workingHardOn:
      hardSkill && hardState
        ? { skillName: hardSkill.name, stageLabel: localise(stageLabelFor(hardSkill, hardState.stage), region) }
        : null,
    tryThis: tryTarget ? tryThisFor(tryTarget, tryStage, weeklySeed(student.id, now), region) : null,
  };
}
