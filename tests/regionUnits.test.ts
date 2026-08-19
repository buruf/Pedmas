/**
 * A US child must never be shown metric measurements, and vice versa.
 *
 * This is a whole-curriculum sweep rather than a handful of examples because
 * the failure mode is a single forgotten literal in one stage of one family —
 * exactly the thing spot-checks miss. Every skill, every stage, both regions.
 */
import { describe, it, expect } from "vitest";
import { allSkills } from "@/curriculum";
import { generateQuestion } from "@/engine/generate";

const METRIC =
  /(°C|\bmetres?\b|\bcentimetres?\b|\bmillimetres?\b|\bkilometres?\b|\bkilograms?\b|\blitres?\b|\d\s?(cm|mm|km|kg|mL)\b|\d\s?m\b|\bkm\/h\b)/;

// "in" is the trap here: "the digit 1 in this number" and "the digit 3 in
// 5.836" are not measurements, so the abbreviation only counts when it closes
// the clause rather than introducing what follows.
const IMPERIAL =
  /(°F|\bfeet\b|\binches\b|\bmiles\b|\bpounds\b|\bounces\b|\bgallons?\b|\bmph\b|\d\s?(ft|mi|lb|oz)\b|\d\s?in\b(?=[.,;)?]|$))/;

/**
 * Projectile and free-fall heights stay metric everywhere: the −5t² in those
 * problems is half of g in m/s², so the unit belongs to the physics rather
 * than to the reader's country. US science teaches these in metres too.
 */
const METRIC_EVERYWHERE = new Set(["derivative-apps"]);

function textOf(q: { instruction?: string; prompt: string; hint?: string; answerHint?: string; choices?: string[]; steps?: string[] }): string {
  return [q.instruction, q.prompt, q.hint, q.answerHint, ...(q.choices ?? []), ...(q.steps ?? [])]
    .filter(Boolean)
    .join(" | ");
}

describe("regional units", () => {
  it("never mixes measurement systems across the whole curriculum", () => {
    const usHits: string[] = [];
    const intlHits: string[] = [];
    let checked = 0;

    for (const skill of allSkills()) {
      for (let stage = 1; stage <= 5; stage++) {
        for (let s = 0; s < 4; s++) {
          for (const region of ["US", "INTL"] as const) {
            let q;
            try {
              q = generateQuestion(skill, stage, { seed: 5000 + s * 9173, region });
            } catch {
              continue;
            }
            checked++;
            const text = textOf(q);
            if (region === "US" && !METRIC_EVERYWHERE.has(skill.family) && METRIC.test(text)) {
              usHits.push(`${skill.family} / ${skill.id} s${stage}: ${text.slice(0, 120)}`);
            }
            if (region === "INTL" && IMPERIAL.test(text)) {
              intlHits.push(`${skill.family} / ${skill.id} s${stage}: ${text.slice(0, 120)}`);
            }
          }
        }
      }
    }

    expect(checked).toBeGreaterThan(20000);
    expect(usHits.slice(0, 5)).toEqual([]);
    expect(intlHits.slice(0, 5)).toEqual([]);
  });

  it("teaches negative numbers in the scale the child reads", () => {
    const skill = allSkills().find((s) => s.family === "integer-ops");
    expect(skill).toBeDefined();
    let sawF = false;
    let sawC = false;
    for (let s = 0; s < 40; s++) {
      const us = textOf(generateQuestion(skill!, 5, { seed: 700 + s * 31, region: "US" }));
      const intl = textOf(generateQuestion(skill!, 5, { seed: 700 + s * 31, region: "INTL" }));
      expect(us).not.toContain("°C");
      expect(intl).not.toContain("°F");
      if (us.includes("°F")) sawF = true;
      if (intl.includes("°C")) sawC = true;
    }
    // The temperature context must still actually appear — a swap that quietly
    // removed the questions would pass the negative assertions above.
    expect(sawF).toBe(true);
    expect(sawC).toBe(true);
  });
});
