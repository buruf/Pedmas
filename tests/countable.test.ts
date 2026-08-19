import { describe, it, expect } from "vitest";
import { allSkills } from "@/curriculum";
import { generateSet } from "@/engine/generate";

/**
 * A question that asks a child to count marks must show marks that CAN be
 * counted. Repeated block characters merge into one solid rectangle in a
 * proportional font, which made bar-graph questions unanswerable in
 * production — the child saw a black bar with no edges.
 */
describe("countable graph questions", () => {
  const runs = [
    { family: "read-graph", type: "bar" },
    { family: "read-graph", type: "picture" },
    { family: "read-graph", type: "line-plot" },
  ];

  for (const { family, type } of runs) {
    it(`${type} graphs never render a run of identical glyphs`, () => {
      const skill = allSkills().find(
        (s) => s.family === family && (s.params as { type?: string }).type === type
      );
      expect(skill, `no skill for ${type}`).toBeTruthy();

      for (let stage = 1; stage <= 5; stage++) {
        for (const q of generateSet(skill!, stage, 4, 1234 + stage)) {
          // Three or more of the same non-space character in a row is
          // indistinguishable once rendered.
          const run = q.prompt.match(/([▮█X■●])\1\1/);
          expect(
            run,
            `${type} stage ${stage} has an uncountable run "${run?.[0]}" in:\n${q.prompt}`
          ).toBeNull();
        }
      }
    });
  }
});
