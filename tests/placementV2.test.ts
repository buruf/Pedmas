import { describe, it, expect } from "vitest";
import {
  startPlacement,
  nextPlacementQuestion,
  applyPlacementAnswer,
  placementReport,
  prerequisiteCap,
  statusFor,
  strandsToPlace,
  STRAND_PREREQS,
  PLACEMENT_VERSION,
  ITEMS_PER_LEVEL,
  PASS_CORRECT,
  MAX_RAW_ITEMS_PER_STRAND,
  type PlacementState,
  type StrandProbe,
} from "@/engine/placement";
import { allSkills, strandChain, strandIds, strandsAtGrade } from "@/curriculum";

/**
 * Placement version 2 — the owner's acceptance tests.
 *
 * The report that triggered the rebuild read: Number Sense Grade 4,
 * Decimals Grade 1, Algebra Grade 5 "Mastered". No student can be at
 * Grade 5 algebra with Grade 1 decimals; the engine had no way to know.
 * These tests pin the six rules that now make such a report impossible.
 */

type Oracle = (strandId: string, grade: number, kind: "input" | "mc", rnd: () => number) => boolean;

function lcg(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

function run(grade: number, oracle: Oracle, seed = 4242) {
  const rnd = lcg(seed);
  const state = startPlacement(grade, seed, 1_700_000_000_000);
  let guard = 0;
  while (!state.done && guard++ < 600) {
    const q = nextPlacementQuestion(state);
    if (!q) break;
    applyPlacementAnswer(state, oracle(q.strandId, q.grade, q.question.kind === "mc" ? "mc" : "input", rnd));
  }
  expect(state.done, "placement must finish").toBe(true);
  return { state, report: placementReport(state) };
}

const floorOf = (id: string) => Math.min(...strandChain(id).map((s) => s.grade));
const ceilingOf = (id: string) => Math.max(...strandChain(id).map((s) => s.grade));
const levelOf = (report: ReturnType<typeof placementReport>, id: string) =>
  report.find((r) => r.strandId === id)!.level;

/** Every row respects the floor and the prerequisite cap, whatever the student. */
function assertInvariants(report: ReturnType<typeof placementReport>) {
  const levels: Record<string, number> = {};
  for (const r of report) levels[r.strandId] = r.level;
  for (const r of report) {
    expect(r.level, `${r.strandId} below its floor`).toBeGreaterThanOrEqual(floorOf(r.strandId));
    expect(r.level, `${r.strandId} above its ceiling`).toBeLessThanOrEqual(ceilingOf(r.strandId));
    // A strand AT its floor cannot go lower: when the floor itself exceeds
    // the cap the strand is gated and reported "Not started" there.
    if (r.level === floorOf(r.strandId)) {
      if (prerequisiteCap(r.strandId, r.level, levels).cap < r.level) expect(r.status).toBe("Not started");
      continue;
    }
    const { cap, bindingPrereq } = prerequisiteCap(r.strandId, r.level, levels);
    expect(
      r.level,
      `${r.strandId} at G${r.level} exceeds what ${bindingPrereq} at G${levels[bindingPrereq ?? ""]} allows`
    ).toBeLessThanOrEqual(cap);
  }
}

describe("1. the prerequisite map is derived from the curriculum, not invented", () => {
  const skills = allSkills();
  const firstGradeOfFamily = (family: string, strandId: string) => {
    const gs = skills.filter((s) => s.family === family && s.strandId === strandId).map((s) => s.grade);
    return gs.length ? Math.min(...gs) : undefined;
  };

  it("every prerequisite names a real strand, and no strand depends on itself", () => {
    const ids = new Set(strandIds());
    for (const [s, prereqs] of Object.entries(STRAND_PREREQS)) {
      expect(ids.has(s), s).toBe(true);
      for (const p of prereqs) {
        expect(ids.has(p), `${s} → ${p}`).toBe(true);
        expect(p).not.toBe(s);
      }
    }
    for (const id of strandIds()) expect(STRAND_PREREQS[id], `${id} has no prerequisite entry`).toBeDefined();
  });

  it("family inheritance: each cross-strand edge is a family the upstream strand introduced first", () => {
    // (family, introduced by, reused by) — the evidence behind STRAND_PREREQS.
    const edges: [string, string, string][] = [
      ["missing-number", "operations", "algebra"],
      ["proportional-relationships", "ratios", "algebra"],
      ["exponent-rules", "number", "algebra"],
      ["scale-drawings", "ratios", "geometry"],
      ["poly-add-sub", "algebra", "functions"],
      ["poly-mul", "algebra", "functions"],
      ["factor", "algebra", "functions"],
      ["rational-expression", "algebra", "functions"],
      ["radical-expression", "algebra", "functions"],
      ["quadratic-solve", "algebra", "functions"],
      ["quadratic-features", "algebra", "functions"],
    ];
    const order = strandsAtGrade(7).map((s) => s.id); // the curriculum's own listing order
    for (const [family, from, to] of edges) {
      const a = firstGradeOfFamily(family, from);
      const b = firstGradeOfFamily(family, to);
      expect(a, `${family} is not used by ${from}`).toBeDefined();
      expect(b, `${family} is not used by ${to}`).toBeDefined();
      expect(a!, `${family}: ${from} (G${a}) should introduce it no later than ${to} (G${b})`).toBeLessThanOrEqual(b!);
      if (a === b) expect(order.indexOf(from), `${family}: same grade, ${from} must be listed before ${to}`).toBeLessThan(order.indexOf(to));
      expect(STRAND_PREREQS[to], `${to} must list ${from} as a prerequisite`).toContain(from);
    }
  });

  it("siblings: strands that introduce shared families in both directions get no edge", () => {
    const pairs: [string, string, string, string][] = [
      // (A, B, family A introduces first, family B introduces first)
      ["operations", "number", "mental-math", "skip-counting"],
      ["operations", "number", "integer-ops", "skip-counting"],
      ["geometry", "measurement", "perimeter-area", "volume-surface"],
    ];
    for (const [a, b, famA, famB] of pairs) {
      expect(firstGradeOfFamily(famA, a)!, `${famA}: ${a} first`).toBeLessThanOrEqual(firstGradeOfFamily(famA, b)!);
      expect(firstGradeOfFamily(famB, b)!, `${famB}: ${b} first`).toBeLessThanOrEqual(firstGradeOfFamily(famB, a)!);
      expect(STRAND_PREREQS[a]).not.toContain(b);
      expect(STRAND_PREREQS[b]).not.toContain(a);
    }
  });

  it("no cross-strand family links exist that the map ignores", () => {
    // Every family used by two strands is accounted for above: as an edge,
    // as a sibling pair, or as arithmetic foundation. A new shared family in
    // the curriculum must be classified here before the map is trusted.
    const known = new Set([
      "missing-number", "proportional-relationships", "exponent-rules", "scale-drawings",
      "poly-add-sub", "poly-mul", "factor", "rational-expression", "radical-expression",
      "quadratic-solve", "quadratic-features",
      "mental-math", "skip-counting", "integer-ops", "perimeter-area", "volume-surface",
      // Generic: a bank of multiple-choice items any strand can draw on. It
      // carries content, not a dependency between the strands that use it.
      "mc-bank",
    ]);
    const byFamily = new Map<string, Set<string>>();
    for (const s of skills) (byFamily.get(s.family) ?? byFamily.set(s.family, new Set()).get(s.family)!).add(s.strandId);
    const shared = [...byFamily].filter(([, strands]) => strands.size > 1).map(([f]) => f);
    expect(shared.filter((f) => !known.has(f))).toEqual([]);
  });

  it("arithmetic foundation: the curriculum lists the five arithmetic strands first in every grade", () => {
    const arithmetic = ["number", "operations", "fractions", "decimals", "ratios"];
    for (let g = 1; g <= 9; g++) {
      const ids = strandsAtGrade(g).map((s) => s.id);
      const lastArithmetic = Math.max(...ids.map((id, i) => (arithmetic.includes(id) ? i : -1)));
      const firstOther = ids.findIndex((id) => !arithmetic.includes(id));
      if (firstOther >= 0) expect(lastArithmetic, `grade ${g}: ${ids.join(" ")}`).toBeLessThan(firstOther);
    }
    for (const id of strandIds()) {
      if (arithmetic.includes(id)) continue;
      for (const a of arithmetic) expect(STRAND_PREREQS[id], `${id} must rest on ${a}`).toContain(a);
    }
  });

  it("trig rests on algebra — the one edge added by judgement, not data", () => {
    expect(STRAND_PREREQS.trig).toContain("algebra");
    // A Grade 12 student with algebra at Grade 8 cannot be placed above
    // Grade 10 trig (trig at G needs algebra at G − 1).
    expect(prerequisiteCap("trig", 12, { number: 9, operations: 6, fractions: 6, decimals: 7, ratios: 7, algebra: 8 })).toEqual({ cap: 10, bindingPrereq: "algebra" });
    // Calculus stays data-only: arithmetic foundation, no algebra edge.
    expect(STRAND_PREREQS.calculus).not.toContain("algebra");
  });

  it("prerequisites are placed before the strands that depend on them", () => {
    const order = strandsToPlace(12);
    for (const [s, prereqs] of Object.entries(STRAND_PREREQS)) {
      for (const p of prereqs) {
        expect(order.indexOf(p), `${p} must be placed before ${s}`).toBeLessThan(order.indexOf(s));
      }
    }
  });

  it("the cap is lowest-unmet-prerequisite + 1, and vacuous before the prerequisite starts", () => {
    // Algebra at Grade 5 needs number, operations and ratios at Grade 4.
    expect(prerequisiteCap("algebra", 5, { number: 4, operations: 4, ratios: 5 })).toEqual({ cap: Infinity, bindingPrereq: null });
    expect(prerequisiteCap("algebra", 5, { number: 4, operations: 2, ratios: 5 })).toEqual({ cap: 3, bindingPrereq: "operations" });
    // Ratios begins at Grade 5: algebra at Grade 3 owes it nothing.
    expect(prerequisiteCap("algebra", 3, { number: 2, operations: 2, ratios: 5 }).cap).toBe(Infinity);
    // A prerequisite that has ENDED caps by shortfall, not to level + 1:
    // operations stops at Grade 6, so algebra at Grade 9 needs it finished —
    // and a student two grades short of finishing it is capped two grades.
    expect(prerequisiteCap("algebra", 9, { number: 8, operations: 6, ratios: 7 }).cap).toBe(Infinity);
    expect(prerequisiteCap("algebra", 9, { number: 8, operations: 4, ratios: 7 })).toEqual({ cap: 7, bindingPrereq: "operations" });
    // Geometry rests on the arithmetic foundation, not on measurement (the
    // two are siblings in the curriculum): Grade 9 geometry needs ratios
    // finished (ceiling 7).
    expect(prerequisiteCap("geometry", 9, { number: 8, operations: 6, fractions: 6, decimals: 7, ratios: 5 })).toEqual({ cap: 7, bindingPrereq: "ratios" });
    expect(prerequisiteCap("geometry", 9, { number: 8, operations: 6, fractions: 6, decimals: 7, ratios: 7, measurement: 1 }).cap).toBe(Infinity);
  });
});

describe("2. evidence threshold and the adaptive staircase", () => {
  it("a consistently Grade 3 student lands at Grade 3 in every strand", () => {
    const { state, report } = run(3, (_s, g) => g <= 3);
    for (const r of report) {
      const truth = Math.min(3, ceilingOf(r.strandId));
      expect(r.level, r.strandId).toBe(truth);
    }
    assertInvariants(report);
    // 3-of-4 per grade: the search is short but never decided on one item.
    for (const id of state.order) {
      const p = state.probes[id];
      const t = p.tallies[p.finalGrade!];
      expect(t.correct, `${id} passed on too little evidence`).toBeGreaterThanOrEqual(PASS_CORRECT);
    }
  });

  it("a Grade 3 student with realistic noise lands within one grade, every seed", () => {
    // Solid below level, 75% at it, weak above — 20 different students.
    const noisy: Oracle = (_s, g, _k, rnd) => {
      const d = g - 3;
      return rnd() < (d <= -1 ? 0.95 : d === 0 ? 0.75 : d === 1 ? 0.3 : 0.05);
    };
    for (let t = 0; t < 20; t++) {
      const { report } = run(3, noisy, 900 + t * 7919);
      for (const r of report) {
        const truth = Math.min(3, ceilingOf(r.strandId));
        expect(Math.abs(r.level - truth), `seed ${t}: ${r.strandId} at G${r.level}`).toBeLessThanOrEqual(1);
      }
      assertInvariants(report);
    }
  });

  it("starts each strand at the expected grade, steps one grade, and stops after two reversals", () => {
    const { state } = run(5, (_s, g) => g <= 6);
    const number = state.probes.number;
    expect(state.log.find((e) => e.strandId === "number" && e.counted)!.grade).toBe(5);
    // 5 pass → 6 pass → 7 fail → settle at 6: one reversal, single steps.
    expect(number.finalGrade).toBe(6);
    expect(number.passed[5] && number.passed[6]).toBe(true);
    expect(number.failed[7]).toBe(true);
    expect(number.reversals).toBeLessThanOrEqual(2);
    const grades = state.log.filter((e) => e.strandId === "number" && e.phase === "main" && e.skillId).map((e) => e.grade);
    for (let i = 1; i < grades.length; i++) expect(Math.abs(grades[i] - grades[i - 1])).toBeLessThanOrEqual(1);
  });

  it("gives each strand a bounded number of items", () => {
    for (const [grade, truth] of [[3, 3], [5, 5], [8, 8], [12, 12], [8, 2]] as const) {
      const { state } = run(grade, (_s, g) => g <= truth);
      for (const id of state.order) {
        const served = state.log.filter((e) => e.strandId === id && e.skillId).length;
        expect(served, `${id} for a G${grade} student at G${truth}`).toBeLessThanOrEqual(MAX_RAW_ITEMS_PER_STRAND);
      }
    }
  });
});

describe("3. guess protection", () => {
  it("a uniform guesser never rises above Practicing, and never above a floor", () => {
    // One in four on multiple choice, essentially never on typed answers.
    const guesser: Oracle = (_s, _g, kind, rnd) => rnd() < (kind === "mc" ? 0.25 : 0.02);
    for (const grade of [3, 5, 8]) {
      for (let t = 0; t < 10; t++) {
        const { report } = run(grade, guesser, 100 + t * 7919 + grade);
        for (const r of report) {
          expect(r.level, `G${grade} seed ${t}: ${r.strandId}`).toBe(floorOf(r.strandId));
          expect(["Practicing", "Ready to Learn", "Not started"], `${r.strandId} ${r.status}`).toContain(r.status);
        }
        assertInvariants(report);
      }
    }
  });

  it("a correct multiple-choice answer only counts once its twin on the same skill is also correct", () => {
    const state = startPlacement(8, 7, 0);
    let pairs = 0;
    let guard = 0;
    while (!state.done && guard++ < 600) {
      const q = nextPlacementQuestion(state)!;
      const probe = state.probes[q.strandId];
      const before = probe.pendingPair;
      applyPlacementAnswer(state, true);
      if (q.question.kind === "mc" && !before) {
        // First half: held, not counted.
        expect(state.log.at(-1)!.counted).toBe(false);
        expect(probe.pendingPair?.skillId ?? state.confirm?.pendingPair?.skillId ?? state.tiebreak?.pendingPair?.skillId).toBe(
          q.question.skillId
        );
        pairs += 1;
      }
    }
    expect(pairs).toBeGreaterThan(0);
  });

  it("prefers typed items: most items served are typed, not multiple choice", () => {
    const { state } = run(8, (_s, g) => g <= 8);
    const served = state.log.filter((e) => e.skillId);
    const typed = served.filter((e) => e.kind === "input").length;
    expect(typed / served.length).toBeGreaterThan(0.6);
  });
});

describe("4. strand floors", () => {
  it("no strand is ever reported below its floor, and 'Not started' sits AT the floor", () => {
    const { report } = run(8, () => false); // gets nothing right at all
    for (const r of report) {
      expect(r.level, r.strandId).toBe(floorOf(r.strandId));
      expect(["Practicing", "Not started"]).toContain(r.status);
    }
    // Decimals and ratios need arithmetic this student does not have: gated,
    // at their floors of 4 and 5 — never a Grade 1 default.
    expect(report.find((r) => r.strandId === "decimals")).toMatchObject({ level: 4, status: "Not started" });
    expect(report.find((r) => r.strandId === "ratios")).toMatchObject({ level: 5, status: "Not started" });
  });
});

describe("5. status labels come from rules", () => {
  const probe = (over: Partial<StrandProbe>): StrandProbe =>
    ({
      strandId: "number",
      strandName: "Number Sense",
      floor: 1,
      ceiling: 9,
      expected: 5,
      testGrade: 5,
      direction: 0,
      reversals: 0,
      failStreak: 0,
      items: 0,
      tallies: {},
      passed: {},
      failed: {},
      assessed: true,
      gated: false,
      trajectory: [],
      high: 9,
      finalGrade: 5,
      ...over,
    }) as StrandProbe;

  it("Mastered needs ≥90% at or above the expected grade AND a look above it", () => {
    expect(statusFor(probe({ tallies: { 5: { correct: 9, wrong: 1 }, 6: { correct: 1, wrong: 2 } } }))).toBe("Mastered");
    // Same accuracy, nothing attempted above: not confirmed.
    expect(statusFor(probe({ tallies: { 5: { correct: 9, wrong: 1 } } }))).toBe("Strong");
    // Same accuracy but below the expected grade: Strong, not Mastered.
    expect(statusFor(probe({ finalGrade: 4, tallies: { 4: { correct: 9, wrong: 1 }, 5: { correct: 0, wrong: 2 } } }))).toBe("Strong");
    // At the ceiling there is nothing above to attempt: confirmed by definition.
    expect(statusFor(probe({ finalGrade: 9, tallies: { 9: { correct: 4, wrong: 0 } } }))).toBe("Mastered");
  });

  it("Strong ≥80%, Developing 50–79%, Practicing <50%, Ready to Learn = no evidence, Not started = gated", () => {
    expect(statusFor(probe({ tallies: { 5: { correct: 4, wrong: 1 } } }))).toBe("Strong");
    expect(statusFor(probe({ tallies: { 5: { correct: 3, wrong: 2 } } }))).toBe("Developing");
    expect(statusFor(probe({ tallies: { 5: { correct: 3, wrong: 1 } } }))).toBe("Developing"); // 75%
    expect(statusFor(probe({ tallies: { 5: { correct: 2, wrong: 3 } } }))).toBe("Practicing");
    expect(statusFor(probe({ finalGrade: 1, tallies: {} }))).toBe("Ready to Learn");
    expect(statusFor(probe({ gated: true, finalGrade: 1 }))).toBe("Not started");
  });
});

describe("6. coherence — the report that started this can no longer be produced", () => {
  it("a Grade 5 student with a decimals gap: decimals low, algebra capped by what it rests on", () => {
    // Grade 5 everywhere, except decimals stalls at Grade 4.
    const { state, report } = run(5, (s, g) => (s === "decimals" ? g <= 4 : g <= 5));
    expect(levelOf(report, "decimals")).toBe(4);
    expect(levelOf(report, "number")).toBe(5);
    expect(levelOf(report, "operations")).toBe(5);
    expect(levelOf(report, "algebra")).toBeLessThanOrEqual(5);
    assertInvariants(report);
    // The gap is visible, not smoothed over: decimals is Strong at 4, not
    // "Mastered", because Grade 5 was attempted and failed.
    expect(report.find((r) => r.strandId === "decimals")!.status).toBe("Strong");
    expect(state.probes.decimals.failed[5]).toBe(true);
  });

  it("algebra cannot sit two grades above the arithmetic it is built from", () => {
    // Arithmetic genuinely at Grade 3; algebra answers happen to go well.
    const { report } = run(5, (s, g) => (s === "algebra" ? g <= 5 : g <= 3));
    expect(levelOf(report, "number")).toBe(3);
    // Number at 3 allows algebra at most 4 — and the cap is recorded.
    const algebra = report.find((r) => r.strandId === "algebra")!;
    expect(algebra.level).toBeLessThanOrEqual(4);
    expect(algebra.cappedBy).toBeDefined();
    expect(algebra.rawLevel).toBe(5);
    assertInvariants(report);
  });

  it("does not clamp silently: the binding prerequisite is re-probed first", () => {
    // Number sense is unlucky in the main pass (fails Grade 5 on noise) but
    // actually fine; algebra needs it at 4. The confirm phase must re-ask
    // number at 4 rather than cap algebra on stale evidence.
    let numberItems = 0;
    const oracle: Oracle = (s, g) => {
      if (s === "number") {
        numberItems += 1;
        return numberItems > 6 ? g <= 5 : g <= 3; // first six number items: weak
      }
      return g <= 5;
    };
    const { state, report } = run(5, oracle);
    const confirmForNumber = state.log.filter((e) => e.phase === "confirm" && e.strandId === "number");
    if (levelOf(report, "algebra") === 5 && levelOf(report, "number") < 4) {
      throw new Error("algebra placed above its cap without a confirmation");
    }
    if (report.find((r) => r.strandId === "algebra")!.cappedBy === "number") {
      expect(confirmForNumber.length, "capped without re-probing number").toBeGreaterThan(0);
    }
    assertInvariants(report);
  });

  it("a spread wider than two grades triggers tie-break items on the low outlier", () => {
    // Everything Grade 7; statistics has a bad main pass (Grade 4) but
    // answers at Grade 7 when asked again. Measurement ends at Grade 5 and
    // is NOT the outlier — a strand at its ceiling cannot be lifted.
    const state = startPlacement(7, 77, 0);
    let guard = 0;
    while (!state.done && guard++ < 600) {
      const q = nextPlacementQuestion(state)!;
      const truth = q.strandId === "stats" && state.phase === "main" ? 4 : 7;
      applyPlacementAnswer(state, q.grade <= truth);
    }
    const report = placementReport(state);
    const tiebreak = state.log.filter((e) => e.phase === "tiebreak" && e.skillId);
    expect(tiebreak.length).toBeGreaterThan(0);
    expect(tiebreak.every((e) => e.strandId === "stats")).toBe(true);
    // One grade per tie-break: lifted from 4 to 5, the spread is now 2.
    expect(levelOf(report, "stats")).toBe(5);
    expect(levelOf(report, "measurement")).toBe(5);
    assertInvariants(report);
  });
});

describe("the log explains every result", () => {
  it("records every item served, its response, and the estimate trajectory", () => {
    const { state } = run(6, (_s, g, _k, rnd) => rnd() < (g <= 6 ? 0.9 : 0.2));
    const items = state.log.filter((e) => e.skillId);
    expect(items.length).toBe(state.asked);
    for (const e of items) {
      expect(e.strandId).toBeTruthy();
      expect(e.grade).toBeGreaterThanOrEqual(1);
      expect(["input", "mc"]).toContain(e.kind);
      expect(typeof e.correct).toBe("boolean");
      expect(typeof e.counted).toBe("boolean");
    }
    for (const id of state.order) {
      const p = state.probes[id];
      if (!p.gated) expect(p.trajectory.length, `${id} has no trajectory`).toBeGreaterThan(0);
    }
    expect(state.version).toBe(PLACEMENT_VERSION);
    expect(ITEMS_PER_LEVEL).toBe(4);
  });
});

describe("stale state", () => {
  it("a version-1 state is recognisable so it can be restarted", () => {
    const state = startPlacement(4, 1, 0) as PlacementState & { version?: number };
    expect(state.version).toBe(2);
  });
});
