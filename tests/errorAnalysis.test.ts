import { describe, it, expect } from "vitest";
import { allSkills } from "@/curriculum";
import { generateErrorAnalysis } from "@/engine/generate";
import { ERROR_ANALYSIS_FAMILIES, hasErrorAnalysis } from "@/engine/errorAnalysis";
import { validateRaw } from "@/engine/validate";

describe("error analysis questions", () => {
  it("produces a valid question for every family that claims one", () => {
    for (const family of ERROR_ANALYSIS_FAMILIES) {
      const skill = allSkills().find((s) => s.family === family);
      expect(skill, `no curriculum skill uses family ${family}`).toBeTruthy();
      for (let i = 0; i < 20; i++) {
        const q = generateErrorAnalysis(skill!, { seed: 500 + i * 7919 });
        expect(q, `${family} produced nothing at seed ${i}`).toBeTruthy();
        // The generator already validates, but re-check the public shape.
        expect(validateRaw({ ...q!, choices: q!.choices }).ok).toBe(true);
      }
    }
  });

  it("shows working that is actually wrong, and names the right answer", () => {
    // The whole point: the prompt must contain a mistake and the correct
    // option must correct it. A "yes that is right" answer would teach the
    // misconception instead of curing it.
    for (const family of ERROR_ANALYSIS_FAMILIES) {
      const skill = allSkills().find((s) => s.family === family)!;
      const q = generateErrorAnalysis(skill, { seed: 4242 })!;
      expect(q.answer.startsWith("No —"), `${family}: answer should reject the working`).toBe(true);
      expect(q.choices).toContain("Yes, that is correct");
      expect(q.choices!.length).toBeGreaterThanOrEqual(3);
      expect(q.steps.length).toBeGreaterThan(0);
    }
  });

  it("only claims families it can actually serve", () => {
    expect(hasErrorAnalysis("frac-add-sub")).toBe(true);
    expect(hasErrorAnalysis("not-a-family")).toBe(false);
    // A family with no case must return null rather than throwing.
    const anySkill = allSkills().find((s) => !hasErrorAnalysis(s.family))!;
    expect(generateErrorAnalysis(anySkill, { seed: 1 })).toBeNull();
  });

  it("never renders money with a single decimal place", () => {
    // "$40.5" reads as a typo to a parent; money is always two places.
    const skill = allSkills().find((s) => s.family === "percent-apps")!;
    for (let i = 0; i < 30; i++) {
      const q = generateErrorAnalysis(skill, { seed: 90 + i * 7919 })!;
      const text = [q.prompt, q.answer, ...q.choices!, ...q.steps].join(" ");
      expect(text).not.toMatch(/\$\d+\.\d(?!\d)/);
    }
  });
});

describe("time on task", () => {
  it("caps a single question so a break is not counted as study", async () => {
    const { MAX_QUESTION_MS } = await import("@/lib/students");
    // A child who leaves for lunch mid-question must not bank an hour.
    const away = 60 * 60 * 1000;
    expect(Math.min(away, MAX_QUESTION_MS)).toBe(MAX_QUESTION_MS);
    expect(MAX_QUESTION_MS).toBeLessThanOrEqual(5 * 60 * 1000);
  });

  it("sums only capped per-question time into a session", async () => {
    const { activeMinutes } = await import("@/lib/students");
    expect(activeMinutes([{ activeMs: 120000 } as never, { activeMs: 60000 } as never])).toBe(3);
    // Sessions recorded before timing existed must not break the total.
    expect(activeMinutes([{} as never])).toBe(0);
  });
});
