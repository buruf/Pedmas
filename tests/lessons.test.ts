import { describe, it, expect } from "vitest";
import { allSkills } from "@/curriculum";
import { lessonKeyForSkill, LESSON_KEYS, LESSON_TITLES } from "@/lib/lessons";

describe("lesson routing", () => {
  it("teaches addition and subtraction from their own lessons", () => {
    // Regrouping up and regrouping down are different ideas and must not
    // share a lesson, even though they share a generator family.
    expect(lessonKeyForSkill("multi-digit", { op: "add", digits: 2 })).toBe("add-regroup");
    expect(lessonKeyForSkill("multi-digit", { op: "sub", digits: 2 })).toBe("sub-regroup");
    expect(lessonKeyForSkill("add-sub", { op: "add", max: 100 })).toBe("add-regroup");
    expect(lessonKeyForSkill("add-sub", { op: "sub", max: 100 })).toBe("sub-regroup");
    expect(lessonKeyForSkill("mult-multi", {})).toBe("mult-2digit");
    expect(lessonKeyForSkill("long-division", {})).toBe("div-2digit");
    expect(lessonKeyForSkill("frac-add-sub", { op: "add" })).toBe("frac-add");
  });

  it("returns null for families without a lesson yet", () => {
    // Uncovered families must fall through to null rather than being routed to
    // a loosely-related lesson — "Show me how" already covers every family, so
    // a wrong lesson is worse than none.
    expect(lessonKeyForSkill("mc-bank", { bank: "sorting-data" })).toBeNull();
    expect(lessonKeyForSkill("vectors", {})).toBeNull();
    expect(lessonKeyForSkill("not-a-real-family", {})).toBeNull();
  });

  it("matches the lesson to the size of the numbers", () => {
    // Caught in a real session walk: "Addition Within 5" was being offered the
    // column-regrouping lesson. Each band of numbers needs a different idea.
    // At or below ten nothing crosses, so the idea is counting on or back.
    expect(lessonKeyForSkill("add-sub", { op: "add", max: 5 })).toBe("ops-count-on");
    expect(lessonKeyForSkill("add-sub", { op: "sub", max: 10 })).toBe("ops-count-back");
    // Between ten and a hundred the idea is bridging through ten.
    expect(lessonKeyForSkill("add-sub", { op: "add", max: 20 })).toBe("make-ten");
    expect(lessonKeyForSkill("add-sub", { op: "sub", max: 20 })).toBe("subtract-ten");
    // Past a hundred it becomes column regrouping.
    expect(lessonKeyForSkill("add-sub", { op: "add", max: 100 })).toBe("add-regroup");
    expect(lessonKeyForSkill("add-sub", { op: "sub", max: 1000 })).toBe("sub-regroup");
    // Single-digit column work needs no trade either.
    expect(lessonKeyForSkill("multi-digit", { op: "add", digits: 1 })).toBeNull();
    expect(lessonKeyForSkill("multi-digit", { op: "add", digits: 3 })).toBe("add-regroup");
  });

  it("every key it can return has a title", () => {
    for (const skill of allSkills()) {
      const key = lessonKeyForSkill(skill.family, skill.params);
      if (key) {
        expect(LESSON_KEYS).toContain(key);
        expect(LESSON_TITLES[key]).toBeTruthy();
      }
    }
  });

  it("teaches meaning before procedure", () => {
    // A child meeting multiplication or fractions for the first time needs to
    // know what the symbol means, not a method for combining them.
    expect(lessonKeyForSkill("mult-facts", { tables: [2] })).toBe("mult-meaning");
    expect(lessonKeyForSkill("div-facts", { tables: [2] })).toBe("div-meaning");
    expect(lessonKeyForSkill("frac-identify", {})).toBe("frac-meaning");
    expect(lessonKeyForSkill("place-value", { max: 100 })).toBe("place-value");
  });

  it("covers the skills a beginner actually meets first", () => {
    // The foundational spine is where teaching matters most, so check real
    // curriculum topics route to a lesson rather than trusting the mapping.
    const taught = allSkills().filter((s) => lessonKeyForSkill(s.family, s.params));
    expect(taught.length).toBeGreaterThan(20);
    const names = taught.map((s) => s.name);
    for (const expected of ["Regrouping", "Long Division", "Multi-digit Multiplication"]) {
      expect(names).toContain(expected);
    }
  });
});
