import { describe, it, expect } from "vitest";
import { bandForGrade, styleForGrade } from "@/lib/ageBand";

describe("age-appropriate presentation", () => {
  it("matures across the four bands", () => {
    expect(bandForGrade(1)).toBe("primary");
    expect(bandForGrade(3)).toBe("primary");
    expect(bandForGrade(4)).toBe("middle");
    expect(bandForGrade(6)).toBe("middle");
    expect(bandForGrade(7)).toBe("junior");
    expect(bandForGrade(9)).toBe("junior");
    expect(bandForGrade(10)).toBe("senior");
    expect(bandForGrade(12)).toBe("senior");
  });

  it("stops being playful once students are old enough to mind", () => {
    // The spec is explicit: do not make the whole site look like a
    // kindergarten app. Older students get no emoji and no exclamation.
    expect(styleForGrade(2).playful).toBe(true);
    expect(styleForGrade(8).playful).toBe(false);
    expect(styleForGrade(11).playful).toBe(false);
    expect(styleForGrade(11).greeting("Sam")).not.toMatch(/[!👋🎉]/);
    expect(styleForGrade(2).greeting("Sam")).toMatch(/👋/);
  });

  it("gives younger children bigger targets and bigger text", () => {
    // Small fingers are less accurate and young eyes need more size.
    expect(styleForGrade(1).touchTarget).toBe("min-h-14");
    expect(styleForGrade(11).touchTarget).toBe("min-h-11");
    expect(styleForGrade(1).questionText).toBe("text-3xl");
    expect(styleForGrade(11).questionText).toBe("text-xl");
  });

  it("bands on school year, not measured level", () => {
    // A Grade 9 student working at Grade 4 arithmetic is still fifteen, and
    // must not be addressed as a small child. This is the dignity point in
    // the spec, so it is asserted rather than left to chance.
    expect(bandForGrade(9)).toBe("junior");
    expect(styleForGrade(9).playful).toBe(false);
  });
});

describe("learning preferences (spec §2)", () => {
  it("changes the session length rather than just recording a choice", async () => {
    const { sessionSizeFor, DEFAULT_PREFERENCES } = await import("@/lib/model");
    expect(sessionSizeFor({ ...DEFAULT_PREFERENCES, sessionLength: "short" })).toBe(10);
    // Standard is 16: mastery needs twenty good attempts across five stages,
    // so a shorter sitting strands a learner mid-skill and costs a whole day.
    expect(sessionSizeFor({ ...DEFAULT_PREFERENCES, sessionLength: "standard" })).toBe(16);
    expect(sessionSizeFor({ ...DEFAULT_PREFERENCES, sessionLength: "long" })).toBe(24);
    // A student created before preferences existed still gets a session.
    expect(sessionSizeFor(undefined)).toBe(16);
  });

  it("lets plain mode suppress celebration at any age", async () => {
    const { styleForGrade } = await import("@/lib/ageBand");
    // A Grade 2 student is playful by default...
    expect(styleForGrade(2).playful).toBe(true);
    // ...but plain mode wins, because some children find it patronising.
    expect(styleForGrade(2, true).playful).toBe(false);
    expect(styleForGrade(2, true).greeting("Sam")).toBe("Sam");
  });
});
