import { describe, it, expect } from "vitest";
import { allSkills } from "@/curriculum";
import { generateQuestion } from "@/engine/generate";

/**
 * A student was shown 399 and asked "What is the value of the digit 9?" —
 * the answer could be 90 or 9. Any "value of the digit d" question must name
 * a digit that appears exactly once in the number.
 */
describe("place-value digit questions are unambiguous", () => {
  const skills = allSkills().filter((s) => s.family === "place-value");

  it("asks only about a digit that occurs once in the number, every skill, every seed", () => {
    expect(skills.length).toBeGreaterThan(0);
    const bad: string[] = [];
    for (const skill of skills) {
      for (const stage of [2, 5]) {
        for (let seed = 1; seed <= 150; seed++) {
          const q = generateQuestion(skill, stage, { seed });
          const m = /value of the digit (\d)/.exec(q.instruction ?? "");
          if (!m) continue; // a stage-capped skill may serve a different form
          const digit = m[1];
          const digits = q.prompt.replace(/\D/g, "");
          const count = digits.split(digit).length - 1;
          if (count !== 1 || digit === "0") bad.push(`${skill.id} s${stage} seed ${seed}: digit ${digit} in ${q.prompt}`);
        }
      }
    }
    expect(bad, bad.slice(0, 10).join("\n")).toEqual([]);
  });

  it("still covers every position, not just the leading digit", () => {
    const skill = skills.find((s) => s.params?.["max"] === 1000) ?? skills[0];
    const answers = new Set<string>();
    for (let seed = 1; seed <= 150; seed++) answers.add(generateQuestion(skill, 2, { seed }).answer);
    // Ones, tens and hundreds values all appear across seeds.
    expect([...answers].some((a) => a.length === 1)).toBe(true);
    expect([...answers].some((a) => a.length === 2)).toBe(true);
    expect([...answers].some((a) => a.length === 3)).toBe(true);
  });
});
