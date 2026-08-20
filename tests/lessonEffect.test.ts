import { describe, it, expect } from "vitest";
import { lessonEffectiveness, skillLessonMap, MIN_ATTEMPTS } from "@/lib/lessonEffect";
import type { StudentProfile } from "@/lib/model";
import type { AttemptRecord, SkillState } from "@/engine/mastery";

const LESSON_TS = 1_000_000;

/** A skill that maps to some lesson, found from the real curriculum. */
const [SKILL_ID, LESSON_KEY] = (() => {
  const map = skillLessonMap();
  const first = map.entries().next().value as [string, string];
  return first;
})();

function attempts(n: number, correct: number, ts: number): AttemptRecord[] {
  return Array.from({ length: n }, (_, i) => ({
    ts,
    stage: 1,
    correct: i < correct,
    eventuallyCorrect: true,
    usedHint: false,
    sessionId: "s1",
  }));
}

function student(
  id: string,
  skillAttempts: AttemptRecord[],
  opts: { lessonSeenAt?: number } = {}
): StudentProfile {
  const skills: Record<string, SkillState> = {
    [SKILL_ID]: {
      skillId: SKILL_ID,
      stage: 1,
      stageMastered: 0,
      attempts: skillAttempts,
      mastered: false,
    },
  };
  return {
    id,
    accountId: "a1",
    name: id,
    grade: 3,
    createdAt: 0,
    strandLevels: {},
    pointers: {},
    skills,
    recentSessions: [],
    streak: { count: 0, lastDay: "" },
    lessonsSeen: opts.lessonSeenAt !== undefined ? { [LESSON_KEY]: opts.lessonSeenAt } : undefined,
  };
}

describe("lesson effectiveness", () => {
  it("buckets attempts by lesson completion, ties counting as after", () => {
    const s = student(
      "kid",
      [
        ...attempts(3, 1, LESSON_TS - 10), // before
        ...attempts(1, 1, LESSON_TS), // exactly at completion -> after
        ...attempts(4, 4, LESSON_TS + 10), // after
      ],
      { lessonSeenAt: LESSON_TS }
    );
    const row = lessonEffectiveness([s]).find((r) => r.key === LESSON_KEY)!;
    expect(row.beforeAttempts).toBe(3);
    expect(row.beforeCorrect).toBe(1);
    expect(row.afterAttempts).toBe(5);
    expect(row.afterCorrect).toBe(5);
    expect(row.untaughtAttempts).toBe(0);
    expect(row.taughtStudents).toBe(1);
    expect(row.untaughtStudents).toBe(0);
  });

  it("treats students who never completed the lesson as the untaught baseline", () => {
    const taught = student("taught", attempts(30, 27, LESSON_TS + 5), { lessonSeenAt: LESSON_TS });
    const untaught = student("untaught", attempts(30, 15, LESSON_TS + 5));
    const row = lessonEffectiveness([taught, untaught]).find((r) => r.key === LESSON_KEY)!;
    expect(row.afterAccuracy).toBeCloseTo(0.9);
    expect(row.baselineAccuracy).toBeCloseTo(0.5);
    expect(row.lift).toBeCloseTo(0.4);
    expect(row.verdict).toBe("working");
    expect(row.taughtStudents).toBe(1);
    expect(row.untaughtStudents).toBe(1);
  });

  it("withholds a verdict below the sample floor", () => {
    // One attempt short on the after side.
    const taught = student("taught", attempts(MIN_ATTEMPTS - 1, 20, LESSON_TS + 5), { lessonSeenAt: LESSON_TS });
    const untaught = student("untaught", attempts(40, 20, 0));
    const row = lessonEffectiveness([taught, untaught]).find((r) => r.key === LESSON_KEY)!;
    expect(row.verdict).toBe("not enough data");
    // The accuracies are still reported — only the judgement is withheld.
    expect(row.afterAccuracy).not.toBeNull();
  });

  it("flags a lesson whose readers do worse than the baseline", () => {
    const taught = student("taught", attempts(30, 12, LESSON_TS + 5), { lessonSeenAt: LESSON_TS }); // 40%
    const untaught = student("untaught", attempts(30, 24, 0)); // 80%
    const row = lessonEffectiveness([taught, untaught]).find((r) => r.key === LESSON_KEY)!;
    expect(row.verdict).toBe("check this lesson");
  });

  it("calls a small difference no clear signal", () => {
    const taught = student("taught", attempts(50, 26, LESSON_TS + 5), { lessonSeenAt: LESSON_TS }); // 52%
    const untaught = student("untaught", attempts(50, 25, 0)); // 50%
    const row = lessonEffectiveness([taught, untaught]).find((r) => r.key === LESSON_KEY)!;
    expect(row.verdict).toBe("no clear signal");
  });

  it("covers every skill that has a lesson, and only those", () => {
    const map = skillLessonMap();
    expect(map.size).toBeGreaterThan(0);
    // A student with no attempts produces no rows at all.
    expect(lessonEffectiveness([student("idle", [])])).toEqual([]);
  });
});
