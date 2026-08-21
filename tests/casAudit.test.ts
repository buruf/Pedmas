import { describe, it, expect } from "vitest";
import { allSkills } from "@/curriculum";
import { generateQuestion } from "@/engine/generate";
import { casCheck } from "@/engine/casAudit";
import type { Question } from "@/engine/types";

/**
 * The CAS second opinion: an independent math engine re-derives answers from
 * exactly what the child sees. Two halves, both essential — the sweep proves
 * the curriculum passes the auditor, and the sensitivity tests prove the
 * auditor is capable of failing things, because an auditor that cannot fail
 * is a rubber stamp.
 */

const fake = (prompt: string, answer: string, instruction = "Solve."): Question =>
  ({
    id: "t", skillId: "g10.algebra.quadratic-equations", stage: 3, grade: 10,
    strandId: "algebra", strandName: "Algebra", topicName: "t", microSkill: "t",
    instruction, prompt, answer, accept: [], steps: [], hint: "", concept: "",
    representation: "numeric", difficulty: 5, metadata: undefined,
  }) as unknown as Question;

describe("CAS sensitivity — wrong answers must be caught", () => {
  it("catches the historical 23x^2 derivative bug", () => {
    const v = casCheck(fake("lim as h → 0 of {2(x + h)^3 − 2x^3/h}", "23x^2", "Evaluate the limit."));
    expect(v.checked).toBe(true);
    expect(v.ok).toBe(false);
    // And accepts the correct answer for the same prompt.
    const good = casCheck(fake("lim as h → 0 of {2(x + h)^3 − 2x^3/h}", "6x^2", "Evaluate the limit."));
    expect(good.ok).toBe(true);
  });

  it("catches a wrong equation solution", () => {
    expect(casCheck(fake("x^2 − 8x + 15 = 0", "4")).ok).toBe(false);
    expect(casCheck(fake("x^2 − 8x + 15 = 0", "5")).ok).toBe(true);
  });

  it("catches a wrong exact trig value", () => {
    expect(casCheck(fake("sin(30°)", "√3/2", "Evaluate.")).ok).toBe(false);
    expect(casCheck(fake("sin(30°)", "1/2", "Evaluate.")).ok).toBe(true);
  });

  it("catches a wrong expansion", () => {
    const bad = casCheck(fake("(x + 2)^2", "x^2 + 4", "Expand."));
    // Claimed by the equivalence checker through the poly-mul-family skill id.
    const q = { ...fake("(x + 2)^2", "x^2 + 4", "Expand."), skillId: "g9.algebra.polynomial-multiplication" };
    const v = casCheck(q as Question);
    expect((v.checked && v.ok === false) || (bad.checked && bad.ok === false)).toBe(true);
  });

  it("catches a wrong system solution", () => {
    const q = { ...fake("3x + y = 9\n4x + 2y = 16", "(2, 3)", "Where do these two lines meet?"), skillId: "g9.algebra.graphical-solutions" };
    const v = casCheck(q as Question);
    expect(v.checked).toBe(true);
    expect(v.ok).toBe(false);
    const good = { ...fake("3x + y = 9\n4x + 2y = 16", "(1, 6)", "Where do these two lines meet?"), skillId: "g9.algebra.graphical-solutions" };
    expect(casCheck(good as Question).ok).toBe(true);
  });

  it("catches a wrong transformation description", () => {
    const q = { ...fake("g(x) = f(x) − 7. How does the graph of g compare with the graph of f?", "Shifted up 7 units", "Describe the transformation."), skillId: "g10.functions.transformations" };
    expect(casCheck(q as Question).ok).toBe(false);
    const good = { ...q, answer: "Shifted down 7 units" };
    expect(casCheck(good as Question).ok).toBe(true);
  });

  it("catches a wrong inequality direction", () => {
    const q = { ...fake("−5x > 30", "x > −6", "Solve the inequality."), skillId: "g9.algebra.inequalities" };
    expect(casCheck(q as Question).ok).toBe(false);
    const good = { ...q, answer: "x < −6" };
    expect(casCheck(good as Question).ok).toBe(true);
  });

  it("catches a wrong definite integral", () => {
    expect(casCheck(fake("∫ from 0 to 5 of 2x dx", "30", "Evaluate.")).ok).toBe(false);
    expect(casCheck(fake("∫ from 0 to 5 of 2x dx", "25", "Evaluate.")).ok).toBe(true);
  });
});

describe("CAS sweep — grades 8-12", () => {
  it("every checkable question agrees with the independent engine", () => {
    let checked = 0;
    const failures: string[] = [];
    for (const skill of allSkills().filter((s) => s.grade >= 8)) {
      for (let stage = 1; stage <= 5; stage++) {
        for (let s = 0; s < 3; s++) {
          let q: Question;
          try {
            q = generateQuestion(skill, stage, { seed: 40 + s * 1097 });
          } catch { continue; }
          const v = casCheck(q);
          if (!v.checked) continue;
          checked++;
          if (!v.ok) failures.push(`${skill.id} s${stage}: [${v.checker}] ${v.detail} | P: ${q.prompt.split("\n")[0]} | A: ${q.answer}`);
        }
      }
    }
    expect(checked).toBeGreaterThan(1800);
    expect(failures.slice(0, 8)).toEqual([]);
  });
});
