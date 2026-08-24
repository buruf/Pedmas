import { describe, it, expect } from "vitest";
import { placementConcern, resetPlacement } from "@/lib/students";
import { strandsToPlace } from "@/engine/placement";
import { newSkillState } from "@/engine/mastery";
import type { StudentProfile } from "@/lib/model";

/**
 * A placement can go stale. Rukiya was measured before the assessment covered
 * the whole curriculum, so three strands decided where she sits; a child who
 * taps through a bad start gets a placement decided from a handful of
 * questions. Neither is visible to a parent unless the product says so, and
 * neither should be fixed by hand in the database.
 */

function student(over: Partial<StudentProfile> = {}): StudentProfile {
  return {
    id: "stu_x",
    accountId: "acc_x",
    name: "Rukiya",
    grade: 11,
    createdAt: Date.now(),
    placedAt: Date.now(),
    strandLevels: { trig: 12, stats: 12, functions: 12 },
    pointers: {},
    skills: {},
    recentSessions: [],
    streak: { count: 0, lastDay: "" },
    ...over,
  } as StudentProfile;
}

describe("spotting a placement that can no longer be trusted", () => {
  it("flags a placement that measured only some of the curriculum", () => {
    const s = student();
    const expected = strandsToPlace(11).length;
    const concern = placementConcern(s);
    expect(concern, "Rukiya's partial placement was not flagged").toBeTruthy();
    expect(concern).toContain(`3 of ${expected}`);
  });

  it("says nothing when the placement covered everything", () => {
    const full: Record<string, number> = {};
    for (const id of strandsToPlace(11)) full[id] = 11;
    expect(placementConcern(student({ strandLevels: full }))).toBeNull();
  });

  it("flags a placement that ended early", () => {
    const full: Record<string, number> = {};
    for (const id of strandsToPlace(11)) full[id] = 11;
    const s = student({
      strandLevels: full,
      placement: { endedEarly: true, asked: 6 } as never,
    });
    expect(placementConcern(s)).toContain("ended early");
  });

  it("says nothing about a child who has not been placed", () => {
    expect(placementConcern(student({ placedAt: undefined }))).toBeNull();
  });
});

describe("retaking", () => {
  it("keeps skills earned by practice and clears ones merely assumed", () => {
    const s = student({
      skills: {
        earned: { ...newSkillState("earned"), mastered: true, masteredAt: 1 },
        guessed: { ...newSkillState("guessed"), mastered: true, assumed: true, masteredAt: 1 },
        inProgress: { ...newSkillState("inProgress"), stage: 3 },
      },
    });
    const { kept, cleared } = resetPlacement(s);
    expect(kept, "practice-earned mastery was thrown away").toBe(1);
    expect(cleared, "stale assumed mastery survived its own retake").toBe(1);
    expect(s.skills.earned?.mastered).toBe(true);
    expect(s.skills.guessed).toBeUndefined();
    expect(s.skills.inProgress, "work in progress should survive").toBeDefined();
  });

  it("clears the old positioning and starts a fresh test", () => {
    const s = student();
    resetPlacement(s);
    expect(s.strandLevels).toEqual({});
    expect(s.pointers).toEqual({});
    expect(s.placedAt).toBeUndefined();
    expect(s.placementReport).toBeUndefined();
    expect(s.placement, "a new placement should be waiting").toBeDefined();
    expect(s.placement!.done).toBe(false);
  });

  it("the fresh test covers the whole curriculum for the grade", () => {
    const s = student();
    resetPlacement(s);
    expect(s.placement!.order.length).toBe(strandsToPlace(11).length);
    expect(s.placement!.order.length).toBeGreaterThan(3);
  });

  it("drops any half-finished practice session", () => {
    const s = student({ activeSession: { id: "old" } as never });
    resetPlacement(s);
    expect(s.activeSession).toBeUndefined();
  });
});
