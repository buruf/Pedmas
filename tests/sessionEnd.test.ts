import { describe, it, expect } from "vitest";
import { ensureSession } from "@/lib/students";
import type { StudentProfile } from "@/lib/model";

/**
 * Tester report, verbatim: "there is no end to the questions." Finishing the
 * day's session used to roll silently into a fresh sitting on the next load
 * of the practice page — ensureSession only returned the active session
 * while it was unfinished. A finished day now stays finished unless the
 * learner explicitly starts extra practice.
 */

function placedStudent(): StudentProfile {
  return {
    id: "stu_end",
    accountId: "acc",
    name: "T",
    grade: 3,
    createdAt: 0,
    placedAt: 1,
    strandLevels: { number: 3 },
    pointers: {},
    skills: {},
    recentSessions: [],
    streak: { count: 0, lastDay: "" },
  } as unknown as StudentProfile;
}

describe("the day's practice ends when it is complete", () => {
  it("a completed session is returned as-is on the next load", () => {
    const s = placedStudent();
    const first = ensureSession(s, undefined, "INTL");
    expect(first.items.length).toBeGreaterThan(0);
    first.completedAt = Date.now();
    const again = ensureSession(s, undefined, "INTL");
    expect(again.id, "no silent fresh session after finishing").toBe(first.id);
    expect(again.completedAt).toBeDefined();
  });

  it("extra practice is available, but only on explicit request", () => {
    const s = placedStudent();
    const first = ensureSession(s, undefined, "INTL");
    first.completedAt = Date.now();
    const extra = ensureSession(s, undefined, "INTL", { startExtra: true });
    expect(extra.id).not.toBe(first.id);
    expect(extra.completedAt).toBeUndefined();
  });

  it("startExtra never abandons an unfinished session", () => {
    const s = placedStudent();
    const first = ensureSession(s, undefined, "INTL");
    const again = ensureSession(s, undefined, "INTL", { startExtra: true });
    expect(again.id, "an in-progress session always continues").toBe(first.id);
  });
});
