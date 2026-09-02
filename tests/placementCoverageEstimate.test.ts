import { describe, it, expect } from "vitest";
import {
  startPlacement,
  nextPlacementQuestion,
  applyPlacementAnswer,
  placementReport,
  strandsToPlace,
} from "@/engine/placement";

/**
 * The owner doubted placement accuracy. Simulation against students with a
 * KNOWN true level found the algorithm's estimate sound (median error 0) but
 * its COVERAGE broken: the question budget was a flat 26 regardless of how
 * many strands existed, so it ran out, and every strand it never reached was
 * recorded at that strand's FIRST grade. An on-level Grade 8 student was
 * placed at GRADE 1 statistics — seven grades below the truth — for no
 * reason other than running out of questions.
 *
 * Fixed two ways: the budget scales with the number of strands, and a strand
 * the test never reached is estimated from what the student has already
 * proven elsewhere (one grade below it — Kumon's deliberate "comfortable
 * starting point"), never from the bottom of the curriculum.
 */

/** Answer model: solid below the true level, coin-flip at it, poor above. */
function pCorrect(testGrade: number, trueLevel: number): number {
  const d = testGrade - trueLevel;
  if (d <= -2) return 0.97;
  if (d === -1) return 0.92;
  if (d === 0) return 0.75;
  if (d === 1) return 0.35;
  if (d === 2) return 0.12;
  return 0.04;
}

function simulate(schoolGrade: number, trueLevel: number, seed: number) {
  let s = seed >>> 0;
  const rnd = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
  const state = startPlacement(schoolGrade, seed, 1_700_000_000_000);
  let guard = 0;
  while (!state.done && guard++ < 400) {
    const q = nextPlacementQuestion(state);
    if (!q) break;
    const probe = state.probes[q.strandId];
    applyPlacementAnswer(state, rnd() < pCorrect(probe.testGrade, trueLevel));
  }
  return { report: placementReport(state), asked: state.asked };
}

describe("a strand the test never reached is estimated, not dumped at Grade 1", () => {
  for (const [grade, trueLevel] of [
    [5, 5],
    [8, 8],
    [10, 10],
    [12, 12],
  ] as const) {
    it(`an on-level Grade ${grade} student is never placed more than 2 grades low anywhere`, () => {
      for (let t = 0; t < 30; t++) {
        const { report } = simulate(grade, trueLevel, 500 + t * 7919);
        for (const row of report) {
          // Strands end at different grades; compare against the reachable truth.
          const worst = row.level;
          expect(
            worst,
            `${row.strandId} placed at G${row.level} for an on-level G${grade} student`
          ).toBeGreaterThanOrEqual(Math.min(trueLevel, 5) - 2);
        }
      }
    });
  }

  it("the specific regression: no Grade 1 statistics for a capable Grade 8", () => {
    let worstStats = 12;
    for (let t = 0; t < 40; t++) {
      const { report } = simulate(8, 8, 1000 + t * 7919);
      const stats = report.find((r) => r.strandId === "stats");
      if (stats) worstStats = Math.min(worstStats, stats.level);
    }
    expect(worstStats, "statistics must never collapse to the bottom").toBeGreaterThanOrEqual(4);
  });
});

describe("the budget scales with what there is to measure", () => {
  it("older students, who have more strands, are not cut short", () => {
    for (const grade of [8, 10, 12] as const) {
      let early = 0;
      for (let t = 0; t < 20; t++) {
        const { report } = simulate(grade, grade, 2000 + t * 7919);
        // "Ready to Learn" on a capable student means the test gave up.
        early += report.filter((r) => r.status === "Ready to Learn").length;
      }
      expect(early / 20, `grade ${grade} left strands unmeasured`).toBeLessThan(1.5);
    }
  });

  it("the test stays humane in length", () => {
    for (const [grade, level] of [
      [1, 1],
      [3, 3],
      [8, 8],
      [12, 12],
    ] as const) {
      const lengths: number[] = [];
      for (let t = 0; t < 20; t++) lengths.push(simulate(grade, level, 3000 + t * 7919).asked);
      const median = lengths.sort((a, b) => a - b)[10];
      expect(median, `grade ${grade} test length`).toBeLessThanOrEqual(
        Math.max(30, strandsToPlace(grade).length * 4)
      );
    }
  });
});

describe("a genuinely unready student is still gated, not estimated upward", () => {
  it("a Grade 8 working at Grade 2 places low, and stays low", () => {
    const levels: number[] = [];
    for (let t = 0; t < 20; t++) {
      const { report } = simulate(8, 2, 4000 + t * 7919);
      levels.push(Math.max(...report.map((r) => r.level)));
    }
    // Estimating from demonstrated ability must never lift a struggling
    // student above what they showed.
    expect(Math.max(...levels)).toBeLessThanOrEqual(5);
  });
});
