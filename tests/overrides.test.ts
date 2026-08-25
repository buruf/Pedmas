import { describe, it, expect, afterEach } from "vitest";
import { setSkillDisabled, loadOverrides, isSkillDisabled } from "@/engine/overrides";
import { focusSkillFor, currentGradeFor, gradeProgress, skillsInGrade, type LearnerState } from "@/engine/practice";
import { newSkillState } from "@/engine/mastery";

/**
 * Disabling a skill is the operator's break-glass: a generator misbehaving in
 * production comes out of rotation without a deploy. The dangerous half of
 * that power is what it must NOT do — hold a grade open forever, or corrupt
 * progress totals.
 */

const NOW = 1_800_000_000_000;

function learner(): LearnerState {
  const state: LearnerState = {
    grade: 2,
    strandLevels: { number: 2, operations: 2, algebra: 2, measurement: 2, geometry: 2, stats: 2 },
    pointers: {},
    skills: {},
  };
  for (const s of skillsInGrade(1)) {
    state.skills[s.id] = { ...newSkillState(s.id), mastered: true, assumed: true, masteredAt: NOW };
  }
  return state;
}

afterEach(async () => {
  // Leave no overrides behind for other tests.
  for (const id of ["g2.number.counting-to-1-000", "g2.number.place-value"]) {
    await setSkillDisabled(id, false, "test", "");
  }
  await loadOverrides(true);
});

describe("disabling a skill", () => {
  it("takes it out of the focus rotation immediately", async () => {
    const state = learner();
    const first = focusSkillFor(state)!.skill;
    await setSkillDisabled(first.id, true, "admin@test", "generator broken");
    expect(isSkillDisabled(first.id)).toBe(true);
    const next = focusSkillFor(state)!.skill;
    expect(next.id).not.toBe(first.id);
  });

  it("does not hold the grade open — the grade can finish without it", async () => {
    const state = learner();
    const g2 = skillsInGrade(2);
    const disabledOne = g2[0];
    await setSkillDisabled(disabledOne.id, true, "admin@test", "broken");
    // Master everything except the disabled skill.
    for (const s of g2.slice(1)) {
      state.skills[s.id] = { ...newSkillState(s.id), mastered: true, masteredAt: NOW };
    }
    expect(currentGradeFor(state), "a disabled skill trapped the learner in the grade").toBe(3);
  });

  it("keeps progress totals honest — the denominator shrinks with it", async () => {
    const state = learner();
    await setSkillDisabled("g2.number.place-value", true, "admin@test", "broken");
    const p = gradeProgress(state);
    expect(p.total).toBe(skillsInGrade(2).length - 1);
  });

  it("re-enabling restores it to rotation", async () => {
    const state = learner();
    const first = focusSkillFor(state)!.skill;
    await setSkillDisabled(first.id, true, "admin@test", "broken");
    await setSkillDisabled(first.id, false, "admin@test", "");
    expect(isSkillDisabled(first.id)).toBe(false);
    expect(focusSkillFor(state)!.skill.id).toBe(first.id);
  });
});
