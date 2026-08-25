import { describe, it, expect } from "vitest";
import { newSkillState, recordAttempt, isFluent, FLUENCY_FAMILIES, FLUENT_MS, type SkillState, type AttemptRecord } from "@/engine/mastery";
import { allSkills } from "@/curriculum";

/**
 * Spec §13: mastery includes speed/fluency WHERE APPROPRIATE. Appropriate is
 * fact recall — a child solving 7×8 by repeated addition is accurate but the
 * strategy collapses under long division. Everywhere else, thinking time is
 * legitimate and must never be punished.
 */

const factsSkill = allSkills().find((s) => s.family === "mult-facts")!;
const thinkSkill = allSkills().find((s) => s.family === "poly-mul")!;

function playStage(skill: { id: string }, elapsedMs: number | undefined, n = 6): SkillState {
  const state = newSkillState(skill.id);
  for (let i = 0; i < n; i++) {
    recordAttempt(state, {
      ts: i, stage: state.stage, correct: true, eventuallyCorrect: true,
      usedHint: false, sessionId: "s1", elapsedMs,
    });
  }
  return state;
}

describe("fluency gates fact recall", () => {
  it("right-but-slow does not advance a facts skill", () => {
    const state = playStage(factsSkill, 30_000);
    expect(state.stage, "a deriving child was advanced as if recalling").toBe(1);
  });

  it("right-and-quick advances it", () => {
    const state = playStage(factsSkill, 4_000);
    expect(state.stage).toBeGreaterThan(1);
  });

  it("speeding up after a slow start unlocks the advance", () => {
    const state = newSkillState(factsSkill.id);
    const attempt = (elapsedMs: number): AttemptRecord => ({
      ts: 0, stage: state.stage, correct: true, eventuallyCorrect: true,
      usedHint: false, sessionId: "s1", elapsedMs,
    });
    for (let i = 0; i < 3; i++) recordAttempt(state, attempt(40_000));
    expect(state.stage).toBe(1);
    // Practice does its job: the recent window fills with quick answers.
    for (let i = 0; i < 6; i++) recordAttempt(state, attempt(3_000));
    expect(state.stage, "an improved child stayed locked").toBeGreaterThan(1);
  });
});

describe("thinking time is never punished elsewhere", () => {
  it("a slow polynomial answer still advances", () => {
    const state = playStage(thinkSkill, 120_000);
    expect(state.stage, "deliberate work on a thinking skill was punished").toBeGreaterThan(1);
  });

  it("the fluency list is exactly the fact families", () => {
    expect([...FLUENCY_FAMILIES].sort()).toEqual(
      ["add-sub", "div-facts", "fact-family", "mental-math", "mult-facts"]
    );
  });
});

describe("legacy data fails open", () => {
  it("attempts recorded before timing existed still advance", () => {
    const state = playStage(factsSkill, undefined);
    expect(state.stage, "an engine change locked out a learner with old data").toBeGreaterThan(1);
  });

  it("a single timed attempt is not enough evidence to block", () => {
    const recent: AttemptRecord[] = [
      { ts: 0, stage: 1, correct: true, eventuallyCorrect: true, usedHint: false, sessionId: "a", elapsedMs: 60_000 },
      { ts: 1, stage: 1, correct: true, eventuallyCorrect: true, usedHint: false, sessionId: "a" },
      { ts: 2, stage: 1, correct: true, eventuallyCorrect: true, usedHint: false, sessionId: "a" },
    ];
    expect(isFluent("mult-facts", recent)).toBe(true);
  });

  it("the threshold is generous — a steady 10s per fact passes", () => {
    const recent: AttemptRecord[] = Array.from({ length: 6 }, (_, i) => ({
      ts: i, stage: 1, correct: true, eventuallyCorrect: true, usedHint: false, sessionId: "a", elapsedMs: 10_000,
    }));
    expect(FLUENT_MS).toBeGreaterThanOrEqual(10_000);
    expect(isFluent("mult-facts", recent)).toBe(true);
  });
});
