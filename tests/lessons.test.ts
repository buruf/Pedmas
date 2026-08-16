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
    expect(lessonKeyForSkill("trig-identity", {})).toBeNull();
    expect(lessonKeyForSkill("limits", {})).toBeNull();
  });

  it("does not teach regrouping to a child adding within 5", () => {
    // Caught in a real session walk: "Addition Within 5" was being offered
    // the regrouping lesson. 2 + 3 involves no trade, so the lesson would be
    // teaching a rule the child has no use for and cannot see the point of.
    expect(lessonKeyForSkill("add-sub", { op: "add", max: 5 })).toBeNull();
    expect(lessonKeyForSkill("add-sub", { op: "add", max: 10 })).toBeNull();
    expect(lessonKeyForSkill("add-sub", { op: "add", max: 20 })).toBeNull();
    // Sums that can pass ten do need it.
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
