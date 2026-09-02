import { describe, it, expect } from "vitest";
import {
  startPlacement,
  nextPlacementQuestion,
  applyPlacementAnswer,
  placementReport,
  strandsToPlace,
} from "@/engine/placement";
import { strandIds, strandChain } from "@/curriculum";

/**
 * The published curriculum is what a child learns from — so placement has to
 * reach all of it. It used to probe only the strands a grade's syllabus
 * names, which for Grade 8 meant Number, Algebra, Geometry and Statistics:
 * Fractions, Decimals, Ratios, Operations and Measurement were never
 * assessed and never taught, so a Grade 8 student weak at fractions had no
 * route to fraction practice at all.
 */

const firstGrade = (id: string) => Math.min(...strandChain(id).map((s) => s.grade));

function simulate(studentGrade: number, ability: number) {
  const state = startPlacement(studentGrade, 42, Date.now());
  let guard = 0;
  while (!state.done && guard++ < 80) {
    const next = nextPlacementQuestion(state);
    if (!next) break;
    applyPlacementAnswer(state, next.question.grade <= ability);
  }
  return { state, report: placementReport(state) };
}

describe("placement covers the whole curriculum a student could owe", () => {
  it("includes every strand that starts at or below the student's grade", () => {
    for (const grade of [1, 3, 5, 8, 10, 12]) {
      const placed = new Set(strandsToPlace(grade));
      const expected = strandIds().filter((id) => firstGrade(id) <= grade);
      expect([...placed].sort(), `grade ${grade}`).toEqual(expected.sort());
    }
  });

  it("reaches strands that end below the student's grade — fractions for a Grade 8", () => {
    const placed = strandsToPlace(8);
    for (const id of ["fractions", "decimals", "ratios", "operations", "measurement"]) {
      expect(placed, `Grade 8 placement must assess ${id}`).toContain(id);
    }
  });

  it("does not offer strands that have not started yet", () => {
    const placed = strandsToPlace(8);
    // Functions, trig and calculus all begin at Grade 10 or later.
    for (const id of ["functions", "trig", "calculus"]) {
      expect(placed, `Grade 8 placement must not assess ${id}`).not.toContain(id);
    }
  });

  it("gives every eligible strand a level in the report", () => {
    for (const [grade, ability] of [[8, 8], [8, 4], [5, 5], [12, 12]] as [number, number][]) {
      const { report } = simulate(grade, ability);
      expect(report.length, `grade ${grade}/ability ${ability}`).toBe(strandsToPlace(grade).length);
      for (const row of report) {
        expect(row.level, `${row.strandName} has no usable level`).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it("stays a short test despite the wider coverage", () => {
    // The budget scales with the number of strands (a flat 26 gave a Grade 12
    // student 2.2 questions per strand, so the test ran out and estimated the
    // rest), but it is still hard-capped: no child ever faces more than 42,
    // and the mercy rule ends it far sooner for anyone struggling.
    for (const [grade, ability] of [[8, 8], [8, 4], [8, 2], [1, 1], [12, 12]] as [number, number][]) {
      const { state } = simulate(grade, ability);
      expect(state.asked, `grade ${grade}/ability ${ability} asked ${state.asked}`).toBeLessThanOrEqual(42);
    }
  });

  it("still starts a young child at the very beginning", () => {
    const { state } = simulate(1, 1);
    const firstQuestion = startPlacement(1, 42, Date.now());
    expect(nextPlacementQuestion(firstQuestion)?.question.grade).toBe(1);
    expect(state.asked).toBeLessThanOrEqual(20);
  });
});

describe("status is judged against the strand, not the school year", () => {
  it("calls a finished strand mastered rather than developing", () => {
    // Measurement ends at Grade 5. A Grade 8 student who gets everything
    // right has completed it and must not be told they are behind.
    const { report } = simulate(8, 12);
    const measurement = report.find((r) => r.strandId === "measurement");
    expect(measurement, "measurement must be assessed for a Grade 8 student").toBeDefined();
    expect(measurement!.level).toBe(5);
    expect(measurement!.status).toBe("Mastered");
  });

  it("still reports a genuinely behind strand honestly", () => {
    const { report } = simulate(8, 3);
    const number = report.find((r) => r.strandId === "number")!;
    expect(number.level).toBeLessThan(8);
    expect(["Developing", "Practicing", "Ready to Learn"]).toContain(number.status);
  });
});
