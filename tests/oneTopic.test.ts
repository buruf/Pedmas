import { describe, it, expect } from "vitest";
import { buildPracticeSession, currentSkillFor, focusSkillFor, SESSION_SIZE, type LearnerState } from "@/engine/practice";
import { strandEntrySkill, getSkill } from "@/curriculum";
import { newSkillState } from "@/engine/mastery";

/**
 * The product rule: a child learns one topic at a time and moves on only
 * once it is mastered. These tests pin that rule down, because it is easy
 * for a well-meaning "let's also mix in..." change to quietly undo it.
 */

const NOW = 1_800_000_000_000;

function learner(over: Partial<LearnerState> = {}): LearnerState {
  const strandLevels = over.strandLevels ?? { stats: 8, number: 10, algebra: 9, geometry: 10 };
  const pointers: Record<string, string> = { ...over.pointers };
  for (const [sid, grade] of Object.entries(strandLevels)) {
    if (!pointers[sid]) pointers[sid] = strandEntrySkill(sid, grade)?.id ?? "";
  }
  return { grade: 8, skills: {}, ...over, strandLevels, pointers };
}

const topicsIn = (items: { question: { skillId: string } }[]) => new Set(items.map((i) => i.question.skillId));

describe("one topic at a time", () => {
  it("spends the whole session on a single skill", () => {
    const items = buildPracticeSession(learner(), { now: NOW, seed: 5 });
    expect(items.length).toBe(SESSION_SIZE);
    expect(topicsIn(items).size).toBe(1);
  });

  it("keeps the same topic day after day while it is unmastered", () => {
    const state = learner();
    const days = [0, 1, 2, 3, 4].map(
      (d) => [...topicsIn(buildPracticeSession(state, { now: NOW + d * 86_400_000, seed: 11 + d }))][0]
    );
    expect(new Set(days).size, `topic wandered across days: ${days.join(", ")}`).toBe(1);
  });

  it("moves to a different strand's topic once the first is mastered", () => {
    const state = learner();
    const first = focusSkillFor(state)!.skill;

    // Master it, the way the engine would.
    state.skills[first.id] = { ...newSkillState(first.id), mastered: true, masteredAt: NOW, stage: 5, stageMastered: 5 };

    const next = focusSkillFor(state)!.skill;
    expect(next.id).not.toBe(first.id);
    expect(next.strandId, "the next topic should come from a different strand").not.toBe(first.strandId);
  });

  it("works through topics one at a time without repeating a mastered one", () => {
    const state = learner();
    const seen: string[] = [];
    for (let i = 0; i < 6; i++) {
      const choice = focusSkillFor(state);
      if (!choice) break;
      seen.push(choice.skill.id);
      state.skills[choice.skill.id] = {
        ...newSkillState(choice.skill.id),
        mastered: true,
        masteredAt: NOW,
        stage: 5,
        stageMastered: 5,
      };
    }
    expect(seen.length).toBe(6);
    expect(new Set(seen).size, "a mastered topic was served again").toBe(6);
  });

  it("switches to the prerequisite when the current topic is struggling", () => {
    const state = learner();
    const current = focusSkillFor(state)!.skill;
    const prereqId = current.prereqs[0];
    if (!prereqId) return; // entry skills have no prerequisite; nothing to assert
    state.skills[current.id] = { ...newSkillState(current.id), needsRepair: true };

    const choice = focusSkillFor(state)!;
    expect(choice.skill.id).toBe(prereqId);
    expect(choice.isRepair).toBe(true);
    // Still one topic: the whole session is the prerequisite.
    const items = buildPracticeSession(state, { now: NOW, seed: 3 });
    expect(topicsIn(items).size).toBe(1);
    expect([...topicsIn(items)][0]).toBe(prereqId);
  });
});

describe("review is the one thing allowed alongside", () => {
  it("adds nothing extra when no review is due", () => {
    const items = buildPracticeSession(learner(), { now: NOW, seed: 9 });
    expect(items.every((i) => !i.isReview)).toBe(true);
  });

  it("includes due reviews of already-mastered skills, capped at two", () => {
    const state = learner();
    // Three mastered skills, all overdue for review.
    const mastered = ["g1.number.counting", "g1.number.number-lines", "g2.number.place-value"]
      .map((id) => getSkill(id))
      .filter(Boolean);
    for (const skill of mastered) {
      state.skills[skill!.id] = {
        ...newSkillState(skill!.id),
        mastered: true,
        masteredAt: NOW - 60 * 86_400_000,
        stage: 5,
        stageMastered: 5,
        review: { due: NOW - 86_400_000, intervalIndex: 0 },
      };
    }
    const items = buildPracticeSession(state, { now: NOW, seed: 21 });
    const reviews = items.filter((i) => i.isReview);
    expect(reviews.length).toBeLessThanOrEqual(2);
    expect(reviews.length).toBeGreaterThan(0);
    // Everything that is not review is still the single focus topic.
    expect(topicsIn(items.filter((i) => !i.isReview)).size).toBe(1);
  });
});

describe("a missing pointer must not drop a student to Grade 1", () => {
  it("starts at the placed level for the strand", () => {
    // No pointers at all — the state a strand placement never covered leaves.
    const state: LearnerState = {
      grade: 8,
      strandLevels: { stats: 8, number: 10, algebra: 9, geometry: 10 },
      pointers: {},
      skills: {},
    };
    const choice = focusSkillFor(state);
    expect(choice).toBeDefined();
    expect(
      choice!.skill.grade,
      `served "${choice!.skill.name}" (Grade ${choice!.skill.grade}) to a student placed at Grade 8+`
    ).toBeGreaterThanOrEqual(8);
  });

  it("every strand's fallback respects its own placed level", () => {
    const levels = { stats: 8, number: 10, algebra: 9, geometry: 10 };
    const state: LearnerState = { grade: 8, strandLevels: levels, pointers: {}, skills: {} };
    for (const [sid, level] of Object.entries(levels)) {
      const skill = currentSkillFor(state, sid);
      expect(skill, `no skill for ${sid}`).toBeDefined();
      // Not every strand runs to every grade — Number Sense ends before
      // Grade 10 — so the entry point is the nearest level at or below the
      // placed one. What must never happen is falling all the way to Grade 1.
      expect(skill!.grade, `${sid} exceeded its placed level`).toBeLessThanOrEqual(level);
      expect(skill!.grade, `${sid} fell back to Grade ${skill!.grade} from a Grade ${level} placement`).toBeGreaterThanOrEqual(level - 2);
    }
  });
});
