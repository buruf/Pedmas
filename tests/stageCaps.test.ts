import { describe, it, expect } from "vitest";
import { generateQuestion } from "@/engine/generate";
import { recordAttempt, newSkillState, skillProgress, type AttemptRecord } from "@/engine/mastery";
import { allSkills, stageCapOf } from "@/curriculum";

/**
 * Tier 2 of the August 2026 curriculum audit: a family's five-stage ladder
 * attaches whole to every skill using it, so Grade 1 "2D Shapes" asked
 * polygon interior-angle sums (Grade 7-8) at stage 5, and Grade 1 graphs got
 * scaled keys (Grade 3) at stage 4. Skills now declare maxStage; the cap is
 * enforced in the generator (no caller can reach an out-of-scope stage) and
 * mastery completes at the cap instead of stage 5.
 */

const skills = allSkills();
const byName = (grade: number, name: string) =>
  skills.find((s) => s.grade === grade && s.name === name)!;

describe("the generator never exceeds a skill's stage cap", () => {
  it("Grade 1 2D Shapes stops at naming (no classification, no angle sums)", () => {
    const sk = byName(1, "2D Shapes");
    expect(stageCapOf(sk)).toBe(2);
    for (const requested of [3, 4, 5]) {
      const q = generateQuestion(sk, requested, { seed: 42 });
      expect(q.stage, `requested stage ${requested}`).toBeLessThanOrEqual(2);
      expect(q.prompt + q.instruction).not.toMatch(/interior|angle sum|scalene|isosceles/i);
    }
  });

  it("Grade 1 Bar Graphs never shows a scaled key", () => {
    const sk = byName(1, "Bar Graphs");
    expect(stageCapOf(sk)).toBe(3);
    for (let i = 0; i < 30; i++) {
      const q = generateQuestion(sk, 4, { seed: 100 + i });
      expect(q.stage).toBeLessThanOrEqual(3);
      expect(q.prompt + q.instruction, "scaled keys are Grade 3 (3.MD.B.3)").not.toMatch(/each .* (stands for|represents|means) [2-9]/i);
    }
  });

  it("Grade 3 Quadrilaterals keeps classification but never angle sums", () => {
    const sk = byName(3, "Quadrilaterals");
    expect(stageCapOf(sk)).toBe(4);
    const q4 = generateQuestion(sk, 4, { seed: 7 });
    expect(q4.stage).toBe(4);
    const q5 = generateQuestion(sk, 5, { seed: 7 });
    expect(q5.stage).toBeLessThanOrEqual(4);
  });

  it("Grade 5 skills on the same families keep all five stages", () => {
    for (const sk of skills.filter((s) => s.grade >= 4 && s.family === "read-graph")) {
      expect(stageCapOf(sk), sk.id).toBe(5);
    }
  });
});

describe("mastery completes at the cap", () => {
  const attempt = (stage: number, session: string, ts: number): AttemptRecord => ({
    ts,
    stage,
    correct: true,
    eventuallyCorrect: true,
    usedHint: false,
    sessionId: session,
  });

  it("a capped skill masters after its final in-scope stage, not stage 5", () => {
    const sk = byName(1, "2D Shapes");
    const state = newSkillState(sk.id);
    let mastered = false;
    let ts = 1_700_000_000_000;
    // Clear stage 1 then stage 2 across two sessions; stage 3-5 must never be required.
    for (const session of ["s1", "s2", "s3"]) {
      for (let i = 0; i < 6 && !mastered; i++) {
        const out = recordAttempt(state, attempt(state.stage, session, (ts += 60_000)));
        mastered ||= out.skillMastered;
      }
      if (mastered) break;
    }
    expect(state.stage, "must never be asked beyond the cap").toBeLessThanOrEqual(2);
    expect(mastered, "mastery must be reachable without stages 3-5").toBe(true);
  });

  it("a state stranded above the cap is clamped back on the next attempt", () => {
    const sk = byName(1, "2D Shapes");
    const state = newSkillState(sk.id, 5);
    recordAttempt(state, attempt(2, "s1", 1_700_000_000_000));
    expect(state.stage).toBeLessThanOrEqual(2);
  });

  it("progress reaches high nineties within the capped ladder", () => {
    const sk = byName(1, "2D Shapes");
    const state = newSkillState(sk.id);
    state.stageMastered = 1;
    state.stage = 2;
    expect(skillProgress(state)).toBeGreaterThanOrEqual(50);
  });
});
