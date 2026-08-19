import { describe, it, expect } from "vitest";
import { allSkills } from "@/curriculum";
import { generateQuestion } from "@/engine/generate";

/**
 * Units cannot be localised as text: 5 cm is not 5 inches. An American child
 * must be given customary questions from the start, or the arithmetic is
 * simply wrong.
 */
describe("regional units", () => {
  const conv = allSkills().find((s) => s.family === "unit-conversion")!;
  const measure = allSkills().find((s) => s.family === "measure-units")!;

  it("teaches customary units in the US and metric elsewhere", () => {
    const us: string[] = [];
    const intl: string[] = [];
    for (let i = 0; i < 12; i++) {
      us.push(generateQuestion(conv, (i % 5) + 1, { seed: 400 + i * 7919, region: "US" }).prompt);
      intl.push(generateQuestion(conv, (i % 5) + 1, { seed: 400 + i * 7919, region: "INTL" }).prompt);
    }
    expect(us.join(" ")).toMatch(/inch|feet|foot|yard|pound|ounce|cup|quart|gallon/);
    expect(us.join(" ")).not.toMatch(/\b(cm|mm|km|kg|mL)\b/);
    expect(intl.join(" ")).toMatch(/\b(cm|mm|km|kg|mL|m|g|L)\b/);
  });

  it("never writes a broken plural like '13 yard' or '1 feet'", () => {
    for (let i = 0; i < 40; i++) {
      const q = generateQuestion(conv, (i % 5) + 1, { seed: 900 + i * 7919, region: "US" });
      const text = `${q.prompt} ${q.steps.join(" ")}`;
      // A number other than 1 followed by a singular unit word.
      expect(text, text).not.toMatch(/\b(?!1\b)\d+\s(foot|yard|pound|ounce|cup|quart|gallon|inch)\b/);
      // "1" followed by a plural.
      expect(text, text).not.toMatch(/\b1\s(feet|yards|pounds|ounces|cups|quarts|gallons|inches)\b/);
    }
  });

  it("keeps the arithmetic right in customary units", () => {
    // 12 in = 1 ft, 3 ft = 1 yd, 16 oz = 1 lb, 4 qt = 1 gal, 4 cups = 1 qt.
    for (let i = 0; i < 30; i++) {
      const q = generateQuestion(conv, 1, { seed: 1500 + i * 7919, region: "US" });
      const m = q.prompt.match(/^(\d+)\s+(\w+)\s+=\s+___\s+(\w+)$/);
      if (!m) continue;
      const [, nStr, from, to] = m;
      const n = Number(nStr);
      const table: Record<string, Record<string, number>> = {
        feet: { inches: 12 }, foot: { inches: 12 },
        yards: { feet: 3 }, yard: { feet: 3 },
        pounds: { ounces: 16 }, pound: { ounces: 16 },
        gallons: { quarts: 4 }, gallon: { quarts: 4 },
        quarts: { cups: 4 }, quart: { cups: 4 },
      };
      const factor = table[from]?.[to];
      if (factor) expect(Number(q.answer), q.prompt).toBe(n * factor);
    }
  });

  it("keeps measurement units in the right system", () => {
    const us = generateQuestion(measure, 1, { seed: 21, region: "US" });
    expect(`${us.prompt} ${us.choices?.join(" ")}`).toMatch(/inch|feet|yard|mile|ounce|pound|cup|gallon/);
  });
});

describe("geometry units", () => {
  const geo = ["perimeter-area", "volume-surface", "circle-measure", "pythagorean", "similarity"];

  it("labels figures in the region's unit without changing the numbers", () => {
    for (const family of geo) {
      const skill = allSkills().find((s) => s.family === family)!;
      for (let stage = 1; stage <= 5; stage++) {
        const us = generateQuestion(skill, stage, { seed: 5150 + stage, region: "US" });
        const intl = generateQuestion(skill, stage, { seed: 5150 + stage, region: "INTL" });
        // Same figure, same arithmetic — only the label moves.
        expect(us.answer, `${family} stage ${stage}`).toBe(intl.answer);
        expect(`${us.prompt} ${us.steps.join(" ")}`, `${family} stage ${stage}`).not.toMatch(/\bcm\b/);
      }
    }
  });

  it("never leaks an un-interpolated template into a question", () => {
    // A plain-quoted string containing ${U} prints the source to the child.
    for (const family of geo) {
      const skill = allSkills().find((s) => s.family === family)!;
      for (let stage = 1; stage <= 5; stage++) {
        for (const region of ["US", "INTL"] as const) {
          const q = generateQuestion(skill, stage, { seed: 7000 + stage, region });
          const text = [q.prompt, q.instruction, ...(q.choices ?? []), ...q.steps].join(" ");
          expect(text, `${family} stage ${stage}`).not.toContain("${");
        }
      }
    }
  });
});

describe("scale drawings and rates", () => {
  it("keeps a scale drawing in one system at every stage", () => {
    // The earlier attempt produced "1 in = 4 m", mixing systems, which is
    // worse than being consistently metric.
    const skill = allSkills().find((s) => s.family === "scale-drawings")!;
    for (let stage = 1; stage <= 5; stage++) {
      const q = generateQuestion(skill, stage, { seed: 9090 + stage, region: "US" });
      const text = `${q.prompt} ${q.steps.join(" ")}`;
      expect(text, `stage ${stage}`).not.toMatch(/\d+\s*(cm|km|\bm\b|metres|centimetres)/);
      expect(text, `stage ${stage}`).toMatch(/\b(in|ft|miles|feet|inch)\b/);
    }
  });

  it("converts the ratio scale exactly in both systems", () => {
    // Stage 3 divides drawing units into real ones: 100 for cm to m, 12 for
    // inches to feet. A ratio that is not a multiple of that gives a fraction.
    const skill = allSkills().find((s) => s.family === "scale-drawings")!;
    for (const region of ["US", "INTL"] as const) {
      for (let i = 0; i < 15; i++) {
        const q = generateQuestion(skill, 3, { seed: 2200 + i * 7919, region });
        expect(Number(q.answer), `${region}: ${q.prompt}`).toBe(Math.round(Number(q.answer)));
      }
    }
  });

  it("measures speed in mph for the US", () => {
    const skill = allSkills().find((s) => s.family === "unit-rate")!;
    const us: string[] = [];
    const intl: string[] = [];
    for (let stage = 1; stage <= 5; stage++) {
      us.push(generateQuestion(skill, stage, { seed: 4141 + stage, region: "US" }).prompt);
      intl.push(generateQuestion(skill, stage, { seed: 4141 + stage, region: "INTL" }).prompt);
    }
    expect(us.join(" ")).toMatch(/miles/);
    expect(us.join(" ")).not.toMatch(/\bkm\b/);
    expect(intl.join(" ")).toMatch(/\bkm\b/);
  });
});
