import { describe, it, expect } from "vitest";
import {
  focusSkillFor,
  currentGradeFor,
  skillsInGrade,
  gradeProgress,
  type LearnerState,
} from "@/engine/practice";
import { newSkillState } from "@/engine/mastery";

/**
 * The progression model, stated as the owner stated it:
 *
 *   "Student takes a test and you determine the student knows all the strands
 *    on Grade 1. You then place the student to start Grade 2. First practice
 *    is Addition Within 100; when mastered, Addition Within 1,000, and so on
 *    until they master all of Grade 2 — then move to Grade 3."
 *
 * These tests are that sentence, executable.
 */

const NOW = 1_800_000_000_000;

/** A learner who has proved every Grade 1 strand and starts Grade 2. */
function afterGrade1(): LearnerState {
  const state: LearnerState = {
    grade: 2,
    strandLevels: { number: 2, operations: 2, algebra: 2, measurement: 2, geometry: 2, stats: 2 },
    pointers: {},
    skills: {},
  };
  for (const skill of skillsInGrade(1)) {
    state.skills[skill.id] = { ...newSkillState(skill.id), mastered: true, masteredAt: NOW, assumed: true };
  }
  return state;
}

const master = (state: LearnerState, id: string) => {
  state.skills[id] = { ...newSkillState(id), mastered: true, masteredAt: NOW, stage: 5, stageMastered: 5 };
};

describe("one grade at a time, in curriculum order", () => {
  it("starts a learner who finished Grade 1 at Grade 2", () => {
    expect(currentGradeFor(afterGrade1())).toBe(2);
  });

  it("reaches Addition Within 100, then Addition Within 1,000", () => {
    const state = afterGrade1();
    // Work forward until the addition sequence begins.
    const seen: string[] = [];
    for (let i = 0; i < 20; i++) {
      const skill = focusSkillFor(state)?.skill;
      if (!skill) break;
      seen.push(skill.name);
      if (skill.name === "Addition Within 1,000") break;
      master(state, skill.id);
    }
    const a = seen.indexOf("Addition Within 100");
    const b = seen.indexOf("Addition Within 1,000");
    expect(a, "Addition Within 100 never came up").toBeGreaterThanOrEqual(0);
    expect(b, "Addition Within 1,000 never came up").toBeGreaterThan(a);
    expect(b - a, "they must be consecutive").toBe(1);
  });

  it("does not open Grade 3 until every Grade 2 skill is mastered", () => {
    const state = afterGrade1();
    const grade2 = skillsInGrade(2);
    // Master all but the last one.
    for (const skill of grade2.slice(0, -1)) master(state, skill.id);
    expect(currentGradeFor(state), "Grade 3 opened with Grade 2 unfinished").toBe(2);
    expect(focusSkillFor(state)?.skill.id).toBe(grade2[grade2.length - 1].id);

    master(state, grade2[grade2.length - 1].id);
    expect(currentGradeFor(state), "Grade 3 did not open after Grade 2 was finished").toBe(3);
    expect(focusSkillFor(state)?.skill.grade).toBe(3);
  });

  it("never goes backwards to a grade already behind the learner", () => {
    const state = afterGrade1();
    for (const skill of skillsInGrade(2)) master(state, skill.id);
    for (let i = 0; i < 5; i++) {
      const skill = focusSkillFor(state)!.skill;
      expect(skill.grade).toBeGreaterThanOrEqual(3);
      master(state, skill.id);
    }
  });

  it("skips what placement already proved rather than repeating it", () => {
    const state = afterGrade1();
    const grade2 = skillsInGrade(2);
    // Placement showed this learner already knows the first three.
    for (const skill of grade2.slice(0, 3)) {
      state.skills[skill.id] = { ...newSkillState(skill.id), mastered: true, assumed: true, masteredAt: NOW };
    }
    expect(focusSkillFor(state)?.skill.id).toBe(grade2[3].id);
  });

  it("reports progress through the grade, which is what a parent reads", () => {
    const state = afterGrade1();
    const grade2 = skillsInGrade(2);
    for (const skill of grade2.slice(0, 4)) master(state, skill.id);
    const p = gradeProgress(state);
    expect(p.grade).toBe(2);
    expect(p.mastered).toBe(4);
    expect(p.total).toBe(grade2.length);
  });

  it("the weakest area sets the starting grade", () => {
    // Strong in geometry, weak in fractions: the learner starts where the
    // weakest strand is, because a grade is not done until all of it is.
    const state: LearnerState = {
      grade: 5,
      strandLevels: { geometry: 5, fractions: 2, number: 4 },
      pointers: {},
      skills: {},
    };
    for (const skill of skillsInGrade(1)) {
      state.skills[skill.id] = { ...newSkillState(skill.id), mastered: true, assumed: true, masteredAt: NOW };
    }
    expect(currentGradeFor(state)).toBe(2);
  });
});
