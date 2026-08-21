import { describe, it, expect } from "vitest";
import { allSkills } from "@/curriculum";
import { generateQuestion, generateErrorAnalysis, stageLabelFor } from "@/engine/generate";
import { hasErrorAnalysis } from "@/engine/errorAnalysis";
import { lessonKeyForSkill, LESSON_KEYS } from "@/lib/lessons";

/**
 * Every skill, every stage, both regions — no sampling, no shortcuts.
 *
 * 634 skills x 5 stages x 2 regions x 3 seeds ≈ 19,000 generated questions
 * per run. Success from generateQuestion already implies the validator
 * passed and the answer re-verified, so a zero failure count here means
 * every cell of the curriculum can actually produce sound questions. The
 * failure list carries the exact skill/stage/region, so a regression names
 * itself.
 */
describe("the whole curriculum generates", () => {
  it("every skill x stage x region produces valid questions", () => {
    const failures: string[] = [];
    const leaks: string[] = [];
    let generated = 0;

    for (const skill of allSkills()) {
      for (let stage = 1; stage <= 5; stage++) {
        for (const region of ["US", "INTL"] as const) {
          for (let s = 0; s < 3; s++) {
            try {
              const q = generateQuestion(skill, stage, { seed: 1234 + s * 4241, region });
              generated++;
              const text = [q.instruction, q.prompt, q.hint, ...(q.choices ?? []), ...(q.steps ?? [])]
                .filter(Boolean)
                .join(" ");
              if (text.includes("${")) leaks.push(`${skill.id} s${stage} ${region}`);
              if (!String(q.answer ?? "").length) failures.push(`${skill.id} s${stage} ${region}: empty answer`);
            } catch (err) {
              failures.push(`${skill.id} s${stage} ${region}: ${(err as Error).message.slice(0, 90)}`);
            }
          }
        }
      }
    }

    expect(generated).toBeGreaterThan(18000);
    expect(failures.slice(0, 10)).toEqual([]);
    expect(leaks.slice(0, 10)).toEqual([]);
  });

  it("every skill names all five of its micro-skill stages", () => {
    const missing: string[] = [];
    for (const skill of allSkills()) {
      for (let stage = 1; stage <= 5; stage++) {
        const label = stageLabelFor(skill, stage);
        if (!label || !label.trim()) missing.push(`${skill.id} s${stage}`);
      }
    }
    expect(missing).toEqual([]);
  });

  it("every skill's lesson route points at a real lesson, and no lesson is orphaned", () => {
    const used = new Set<string>();
    const badRoutes: string[] = [];
    for (const skill of allSkills()) {
      const key = lessonKeyForSkill(skill.family, skill.params);
      if (key === null) continue;
      if (!(LESSON_KEYS as readonly string[]).includes(key)) badRoutes.push(`${skill.id} -> ${key}`);
      used.add(key);
    }
    expect(badRoutes).toEqual([]);
    const orphans = LESSON_KEYS.filter((k) => !used.has(k));
    expect(orphans, "lessons no skill can ever reach").toEqual([]);
  });

  it("every family that advertises error analysis can produce one for each of its skills", () => {
    const dry: string[] = [];
    let produced = 0;
    for (const skill of allSkills()) {
      if (!hasErrorAnalysis(skill.family)) continue;
      let ok = false;
      for (let s = 0; s < 5 && !ok; s++) {
        if (generateErrorAnalysis(skill, { seed: 99 + s * 7331 })) ok = true;
      }
      if (ok) produced++;
      else dry.push(skill.id);
    }
    expect(produced).toBeGreaterThan(0);
    expect(dry.slice(0, 10)).toEqual([]);
  });
});
