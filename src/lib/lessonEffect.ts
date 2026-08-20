/**
 * Lesson effectiveness (does the teaching actually teach?).
 *
 * The whole product rests on the claim that a lesson changes what a child can
 * do. This module turns the data we already collect into a check on that
 * claim: every attempt carries a timestamp and first-try correctness, every
 * completed lesson carries a timestamp, and lessonKeyForSkill links the two.
 *
 * For each lesson, attempts on the skills it teaches fall into three buckets:
 *
 *   before   — attempts by students who later completed the lesson
 *   after    — attempts by the same students once the lesson was completed
 *   untaught — attempts by students who never completed the lesson
 *
 * In the normal flow the lesson is offered when a skill first comes up, so
 * "before" is often thin; the untaught bucket (students who skip lessons via
 * the lessonsFirst preference, or who declined) is the everyday baseline. The
 * verdict therefore compares "after" against before + untaught pooled.
 *
 * Honesty notes, so the number is never read as more than it is:
 *  - Attempts are a bounded window (30 per skill), so long-gone "before"
 *    attempts may have been evicted. This biases the lift *down*, not up.
 *  - Students choose whether to open a lesson, so taught vs untaught is not
 *    a randomized comparison. Verdicts below the sample floor say so instead
 *    of guessing.
 */
import { allSkills } from "@/curriculum";
import { lessonKeyForSkill, LESSON_TITLES, type LessonKey } from "@/lib/lessons";
import type { StudentProfile } from "@/lib/model";

export interface LessonEffectRow {
  key: LessonKey;
  title: string;
  /** Students contributing attempts to each side. */
  taughtStudents: number;
  untaughtStudents: number;
  beforeAttempts: number;
  beforeCorrect: number;
  afterAttempts: number;
  afterCorrect: number;
  untaughtAttempts: number;
  untaughtCorrect: number;
  /** First-try accuracy, 0..1, or null when the bucket is empty. */
  afterAccuracy: number | null;
  baselineAccuracy: number | null;
  /** afterAccuracy − baselineAccuracy, or null when either side is empty. */
  lift: number | null;
  verdict: "working" | "no clear signal" | "check this lesson" | "not enough data";
}

/**
 * Sample floor per side of the comparison. Below this, run-to-run noise in a
 * handful of questions swamps any real effect, so the verdict refuses to say.
 */
export const MIN_ATTEMPTS = 25;

/** Lift thresholds, in accuracy points. */
const WORKING_LIFT = 0.08;
const HARMFUL_LIFT = -0.05;

/** skillId -> lesson key, built once from the curriculum. */
export function skillLessonMap(): Map<string, LessonKey> {
  const map = new Map<string, LessonKey>();
  for (const skill of allSkills()) {
    const key = lessonKeyForSkill(skill.family, skill.params);
    if (key) map.set(skill.id, key);
  }
  return map;
}

export function lessonEffectiveness(students: StudentProfile[]): LessonEffectRow[] {
  const skillToLesson = skillLessonMap();

  interface Tally {
    taught: Set<string>;
    untaught: Set<string>;
    before: [number, number]; // attempts, correct
    after: [number, number];
    without: [number, number];
  }
  const tallies = new Map<LessonKey, Tally>();
  const tallyFor = (key: LessonKey): Tally => {
    let t = tallies.get(key);
    if (!t) {
      t = { taught: new Set(), untaught: new Set(), before: [0, 0], after: [0, 0], without: [0, 0] };
      tallies.set(key, t);
    }
    return t;
  };

  for (const student of students) {
    for (const state of Object.values(student.skills ?? {})) {
      if (!state.attempts?.length) continue;
      const key = skillToLesson.get(state.skillId);
      if (!key) continue;
      const t = tallyFor(key);
      const seenAt = student.lessonsSeen?.[key];
      for (const attempt of state.attempts) {
        // An attempt stamped at the very moment the lesson finished was made
        // with the lesson available, so ties count as after.
        const bucket = seenAt === undefined ? t.without : attempt.ts >= seenAt ? t.after : t.before;
        bucket[0]++;
        if (attempt.correct) bucket[1]++;
      }
      (seenAt === undefined ? t.untaught : t.taught).add(student.id);
    }
  }

  const rows: LessonEffectRow[] = [];
  for (const [key, t] of tallies) {
    const afterAcc = t.after[0] ? t.after[1] / t.after[0] : null;
    const baseAttempts = t.before[0] + t.without[0];
    const baseCorrect = t.before[1] + t.without[1];
    const baseAcc = baseAttempts ? baseCorrect / baseAttempts : null;
    const lift = afterAcc !== null && baseAcc !== null ? afterAcc - baseAcc : null;

    let verdict: LessonEffectRow["verdict"];
    if (t.after[0] < MIN_ATTEMPTS || baseAttempts < MIN_ATTEMPTS || lift === null) {
      verdict = "not enough data";
    } else if (lift >= WORKING_LIFT) {
      verdict = "working";
    } else if (lift <= HARMFUL_LIFT) {
      verdict = "check this lesson";
    } else {
      verdict = "no clear signal";
    }

    rows.push({
      key,
      title: LESSON_TITLES[key],
      taughtStudents: t.taught.size,
      untaughtStudents: t.untaught.size,
      beforeAttempts: t.before[0],
      beforeCorrect: t.before[1],
      afterAttempts: t.after[0],
      afterCorrect: t.after[1],
      untaughtAttempts: t.without[0],
      untaughtCorrect: t.without[1],
      afterAccuracy: afterAcc,
      baselineAccuracy: baseAcc,
      lift,
      verdict,
    });
  }

  // Busiest lessons first — those are the ones a verdict can be trusted on.
  rows.sort(
    (a, b) =>
      b.afterAttempts + b.beforeAttempts + b.untaughtAttempts - (a.afterAttempts + a.beforeAttempts + a.untaughtAttempts)
  );
  return rows;
}
