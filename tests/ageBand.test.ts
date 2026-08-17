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
