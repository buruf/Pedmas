import { describe, it, expect } from "vitest";
import { newSkillState, recordAttempt, type SkillState } from "@/engine/mastery";
import { sessionSizeFor, DEFAULT_PREFERENCES } from "@/lib/model";

/**
 * A quick learner must not be held back by the shape of a session.
 *
 * Two things used to cost them days. A sitting of twelve could not contain
 * the twenty good attempts mastery needs, so every skill spilled into an
 * extra day; and mastering a skill halfway through a session left the rest
 * of that session drilling work already proved.
 */

function sessionsToMaster(perDay: number, accuracy = 1): number {
  const state: SkillState = newSkillState("sim");
  let day = 0;
  while (!state.mastered && day < 40) {
    day++;
    for (let q = 0; q < perDay && !state.mastered; q++) {
      recordAttempt(state, {
        ts: day * 86_400_000,
        stage: state.stage,
        correct: Math.random() < accuracy,
        eventuallyCorrect: true,
        usedHint: false,
        sessionId: `day-${day}`,
      });
    }
  }
  return day;
}

describe("session length", () => {
  it("defaults to 16, which is what a skill actually needs", () => {
    expect(sessionSizeFor(undefined)).toBe(16);
    expect(sessionSizeFor(DEFAULT_PREFERENCES)).toBe(16);
  });

  it("clears a skill a day sooner than the old default", () => {
    expect(sessionsToMaster(12), "12 a day should still take three days").toBe(3);
    expect(sessionsToMaster(16), "16 a day should master in two").toBe(2);
  });

  it("cannot be rushed below two days, however long the session", () => {
    // The second session is the retention requirement, and no amount of
    // practice in one sitting should be able to buy past it.
    for (const size of [24, 40, 80]) {
      expect(sessionsToMaster(size), `${size} a day skipped the confirmation`).toBe(2);
    }
  });

  it("still holds a struggling learner to the same standard", () => {
    const runs = Array.from({ length: 100 }, () => sessionsToMaster(16, 0.6));
    const avg = runs.reduce((a, b) => a + b, 0) / runs.length;
    expect(avg, "a 60% learner should take longer, not be waved through").toBeGreaterThan(2);
  });
});

describe("mastering mid-session hands the rest to the next skill", () => {
  it("the practice route rebuilds the remainder rather than drilling a finished skill", async () => {
    const { readFileSync } = await import("fs");
    const src = readFileSync("src/lib/students.ts", "utf8");
    expect(src, "no refill on mastery").toMatch(/refillAfterMastery/);
    expect(src, "the refill must target the NEXT focus skill").toMatch(/const next = focusSkillFor\(learner\)/);
    expect(src, "only the unanswered tail may be replaced").toMatch(/session\.items\.slice\(0, session\.index \+ 1\)/);
    expect(src, "the learner must be told what comes next").toMatch(/nextSkillName/);
  });
});
