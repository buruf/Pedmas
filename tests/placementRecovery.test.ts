import { describe, it, expect } from "vitest";
import {
  startPlacement,
  nextPlacementQuestion,
  applyPlacementAnswer,
  placementReport,
} from "@/engine/placement";
import { placementAnswer } from "@/lib/students";
import type { StudentProfile } from "@/lib/model";

/**
 * Regression: a Grade 12 tester answered everything right except ONE
 * measurement question and was placed at Grade 3 measurement ("mastered for
 * all except grade 3 measurements"). Two compounding flaws: a single miss in
 * the warm-up zone was treated as conclusive, and the climb back overshot
 * the strand's ceiling (measurement ends at Grade 5), finishing low instead
 * of re-climbing. One slip must cost extra questions, not two grades.
 */

function runPlacement(
  grade: number,
  wrongOn: (strandId: string, testGrade: number, nth: number) => boolean
) {
  const state = startPlacement(grade, 12345, 1_700_000_000_000);
  const seen: Record<string, number> = {};
  let guard = 0;
  while (!state.done && guard++ < 200) {
    const q = nextPlacementQuestion(state);
    if (!q) break;
    seen[q.strandId] = (seen[q.strandId] ?? 0) + 1;
    const probe = state.probes[q.strandId];
    applyPlacementAnswer(state, !wrongOn(q.strandId, probe.testGrade, seen[q.strandId]));
  }
  return placementReport(state);
}

const levelOf = (report: ReturnType<typeof runPlacement>, strandId: string) =>
  report.find((r) => r.strandId === strandId)!;

describe("placement recovers from a single slip", () => {
  it("a perfect Grade 12 masters measurement at its ceiling", () => {
    const report = runPlacement(12, () => false);
    const m = levelOf(report, "measurement");
    expect(m.level).toBe(5);
    expect(m.status).toBe("Mastered");
  });

  it("one wrong measurement answer costs extra questions, not two grades", () => {
    const report = runPlacement(12, (s, _g, nth) => s === "measurement" && nth === 1);
    const m = levelOf(report, "measurement");
    // The slip is re-tested at the same grade; two of three decides.
    expect(m.level, "a single slip must not drag a strong student to Grade 3").toBe(5);
    expect(m.status).toBe("Mastered");
  });

  it("a student genuinely weak in measurement still places low", () => {
    const report = runPlacement(12, (s, g) => s === "measurement" && g > 3);
    const m = levelOf(report, "measurement");
    expect(m.level).toBeLessThanOrEqual(3);
  });

  it("every strand of a perfect Grade 12 reads Mastered", () => {
    const report = runPlacement(12, () => false);
    for (const row of report) expect(row.status, row.strandId).toBe("Mastered");
  });
});

describe("the I-don't-know answer", () => {
  it("grades as an honest wrong, without consulting the answer checker", () => {
    const student = {
      id: "stu_idk",
      grade: 4,
      strandLevels: {},
      pointers: {},
      skills: {},
      placement: startPlacement(4, 999, 1_700_000_000_000),
    } as unknown as StudentProfile;
    const res = placementAnswer(student, "", { idk: true });
    expect(res).not.toBeNull();
    expect(res!.correct).toBe(false);
  });
});
