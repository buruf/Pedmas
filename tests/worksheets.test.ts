import { describe, it, expect } from "vitest";
import {
  buildWorksheet,
  strandsForGrade,
  worksheetDailySeed,
  worksheetExists,
  WORKSHEET_SIZE,
} from "@/lib/worksheets";

/**
 * The public worksheet library serves strangers with no account: every
 * advertised grade × strand page must actually produce a printable sheet,
 * deterministically for a given seed (search engines index the daily
 * default), and only from pencil-and-paper question kinds.
 */

describe("every advertised page produces a real sheet", () => {
  for (let grade = 1; grade <= 12; grade++) {
    it(`grade ${grade}: all strands fill a sheet in both regions`, () => {
      for (const s of strandsForGrade(grade)) {
        for (const region of ["US", "INTL"] as const) {
          const sheet = buildWorksheet(grade, s.id, 12345, region);
          expect(sheet, `${grade}/${s.id}/${region}`).not.toBeNull();
          expect(sheet!.questions.length, `${grade}/${s.id}/${region}`).toBeGreaterThanOrEqual(10);
          for (const q of sheet!.questions) {
            expect(["mc", "input"], `${grade}/${s.id}: unprintable kind`).toContain(q.kind);
            expect(String(q.answer).length).toBeGreaterThan(0);
          }
        }
      }
    });
  }
});

describe("determinism and seeds", () => {
  it("the same seed yields the same sheet", () => {
    const a = buildWorksheet(3, "fractions", 777, "INTL")!;
    const b = buildWorksheet(3, "fractions", 777, "INTL")!;
    expect(a.questions.map((q) => q.prompt)).toEqual(b.questions.map((q) => q.prompt));
  });

  it("different seeds yield different sheets", () => {
    const a = buildWorksheet(3, "fractions", 1, "INTL")!;
    const b = buildWorksheet(3, "fractions", 2, "INTL")!;
    expect(a.questions.map((q) => q.prompt)).not.toEqual(b.questions.map((q) => q.prompt));
  });

  it("the daily seed is stable within a day and differs across pages", () => {
    expect(worksheetDailySeed(3, "fractions", "2026-08-31")).toBe(
      worksheetDailySeed(3, "fractions", "2026-08-31")
    );
    expect(worksheetDailySeed(3, "fractions", "2026-08-31")).not.toBe(
      worksheetDailySeed(4, "fractions", "2026-08-31")
    );
  });

  it("a full-size strand fills the whole sheet", () => {
    expect(buildWorksheet(3, "operations", 42, "INTL")!.questions.length).toBe(WORKSHEET_SIZE);
  });
});

describe("existence checks match the curriculum", () => {
  it("real combos exist, invented ones do not", () => {
    expect(worksheetExists(3, "fractions")).toBe(true);
    expect(worksheetExists(12, "calculus")).toBe(true);
    expect(worksheetExists(1, "calculus")).toBe(false);
    expect(worksheetExists(3, "nonsense")).toBe(false);
  });
});
