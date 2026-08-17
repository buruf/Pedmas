import { describe, it, expect } from "vitest";
import { allSkills } from "@/curriculum";
import { generateQuestion } from "@/engine/generate";
import { deriveMetadata } from "@/engine/metadata";

const skill = { prereqs: ["p"] } as never;
const meta = (prompt: string, stage = 3, extra: Record<string, unknown> = {}) =>
  deriveMetadata({ instruction: "", prompt, kind: "input", ...extra } as never, skill, stage, "x");

describe("question metadata (spec §10)", () => {
  it("counts operations the student actually performs", () => {
    // The bar in {3/4} is notation, not a division the child carries out.
    // Counting it made this look like two operations and missed the plus.
    expect(meta("{3/4} + {3/5} = ?").operationCount).toBe(1);
    expect(meta("{x/3} + 5 = 13").operationCount).toBe(1);
    expect(meta("(9 + 4) × 6 = ?").operationCount).toBe(2);
    expect(meta("12 = ?").operationCount).toBe(0);
  });

  it("keeps a leading minus attached to its number", () => {
    expect(meta("−24 + 31 = ?").operationCount).toBe(1);
    expect(meta("−24 + 31 = ?").numericalComplexity.negatives).toBe(true);
  });

  it("reads number size, decimals and fraction complexity off the prompt", () => {
    expect(meta("0.4 × 0.8 = ?").numericalComplexity.decimals).toBe(true);
    expect(meta("2 × 9 = ?").numericalComplexity.decimals).toBe(false);
    expect(meta("{3/4} + {3/5} = ?").fractionComplexity).toBe(5);
    expect(meta("2 × 9 = ?").fractionComplexity).toBe(0);
    expect(meta("−24 + 31 = ?").numberSize).toBe(31);
  });

  it("rates judging a method above running one", () => {
    const compute = meta("2 × 9 = ?", 4);
    const judge = meta("2 × 9 = 11. Is that right?", 4, { representation: "error-analysis" });
    expect(judge.cognitiveComplexity).toBeGreaterThan(compute.cognitiveComplexity);
  });

  it("attaches metadata to every generated question", () => {
    for (const family of ["frac-add-sub", "dec-mul", "two-step-eq", "mult-facts"]) {
      const s = allSkills().find((x) => x.family === family)!;
      const q = generateQuestion(s, 3, { seed: 11 });
      expect(q.metadata, `${family} has no metadata`).toBeTruthy();
      expect(q.metadata.expectedMethod.length).toBeGreaterThan(0);
      expect(q.metadata.prerequisites).toEqual(s.prereqs);
      expect(q.metadata.cognitiveComplexity).toBeGreaterThanOrEqual(1);
      expect(q.metadata.cognitiveComplexity).toBeLessThanOrEqual(5);
    }
  });
});
