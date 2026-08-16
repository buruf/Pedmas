import { describe, it, expect } from "vitest";
import { allSkills } from "@/curriculum";
import { generateQuestion } from "@/engine/generate";
import { dedupKey } from "@/engine/validate";

/**
 * "Show me how" must never restate the question the student is looking at —
 * that teaches copying instead of the method. The service excludes the live
 * question via the dedup set; this checks the mechanism holds across the
 * whole curriculum, including families with few distinct questions.
 */
describe("worked example", () => {
  it("never reproduces the question it is explaining", () => {
    const skills = allSkills();
    // Sample across the curriculum rather than all 634 x 5, to stay fast.
    const sample = skills.filter((_, i) => i % 7 === 0);
    let checked = 0;

    for (const skill of sample) {
      for (const stage of [1, 3, 5]) {
        const live = generateQuestion(skill, stage, { seed: 4242 });
        const avoid = new Set([dedupKey(live)]);
        const example = generateQuestion(skill, stage, { seed: 99991, avoid });
        expect(dedupKey(example)).not.toBe(dedupKey(live));
        checked += 1;
      }
    }
    expect(checked).toBeGreaterThan(200);
  });

  it("gives an example with steps to walk through", () => {
    const skill = allSkills().find((s) => s.family === "frac-add-sub")!;
    const q = generateQuestion(skill, 3, { seed: 7 });
    expect(q.steps.length).toBeGreaterThan(0);
    expect(q.concept.length).toBeGreaterThan(0);
    expect(q.answer.length).toBeGreaterThan(0);
  });
});
