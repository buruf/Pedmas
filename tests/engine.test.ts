import { describe, it, expect } from "vitest";
import { allSkills, getSkill, strandChain, strandIds } from "@/curriculum";
import { generateQuestion, generateSet, stageLabelFor } from "@/engine/generate";
import { normalizeAnswer, isCorrect, validateRaw, dedupKey } from "@/engine/validate";
import { evalExpr } from "@/engine/families/arith";
import { FAMILIES } from "@/engine/families";
import { FAMILY_KEYS } from "@/engine/families/keys";
import { makeRng } from "@/engine/rng";
import {
  newSkillState,
  recordAttempt,
  assumedMastered,
  reviewsDue,
  REVIEW_INTERVALS_DAYS,
} from "@/engine/mastery";
import {
  startPlacement,
  nextPlacementQuestion,
  applyPlacementAnswer,
  placementReport,
} from "@/engine/placement";
import { buildPracticeSession, SESSION_SIZE } from "@/engine/practice";

const DAY = 24 * 60 * 60 * 1000;

describe("curriculum integrity", () => {
  it("covers all 12 grades with unique skill ids", () => {
    const skills = allSkills();
    expect(skills.length).toBeGreaterThan(500);
    const grades = new Set(skills.map((s) => s.grade));
    for (let g = 1; g <= 12; g++) expect(grades.has(g)).toBe(true);
    expect(new Set(skills.map((s) => s.id)).size).toBe(skills.length);
  });

  it("has resolvable prerequisites", () => {
    for (const skill of allSkills()) {
      for (const p of skill.prereqs) {
        expect(getSkill(p), `${skill.id} prereq ${p}`).toBeDefined();
      }
    }
  });

  it("strand chains are ordered by grade", () => {
    for (const sid of strandIds()) {
      const chain = strandChain(sid);
      for (let i = 1; i < chain.length; i++) {
        expect(chain[i].grade).toBeGreaterThanOrEqual(chain[i - 1].grade);
      }
    }
  });
});

describe("generator coverage — every skill, every stage, validated", () => {
  const skills = allSkills();
  const byFamily = new Map<string, typeof skills>();
  for (const s of skills) {
    const arr = byFamily.get(s.family) ?? [];
    arr.push(s);
    byFamily.set(s.family, arr);
  }

  it("generates 3 valid, distinct questions per skill per stage", () => {
    const failures: string[] = [];
    for (const skill of skills) {
      for (let stage = 1; stage <= 5; stage++) {
        try {
          const qs = generateSet(skill, stage, 3, 12345);
          for (const q of qs) {
            if (!q.answer || !q.steps.length) {
              failures.push(`${skill.id} s${stage}: empty answer/steps`);
            }
          }
        } catch (e) {
          failures.push(`${skill.id} s${stage}: ${e instanceof Error ? e.message : e}`);
        }
      }
    }
    expect(failures, failures.slice(0, 25).join("\n")).toEqual([]);
  });

  it("every family the curriculum uses is implemented", () => {
    const implemented = new Set(Object.keys(FAMILIES));
    const missing = [...new Set(skills.map((s) => s.family))].filter((f) => !implemented.has(f));
    expect(missing, `curriculum references unimplemented families: ${missing.join(", ")}`).toEqual([]);
    const declaredMissing = FAMILY_KEYS.filter((k) => !implemented.has(k));
    expect(declaredMissing, `declared but unimplemented: ${declaredMissing.join(", ")}`).toEqual([]);
  });

  /**
   * Strict pass: no retries. generateQuestion retries up to 40 seeds, which
   * can mask a family that is usually invalid, so check raw output directly.
   */
  it("raw generator output is valid without relying on retries", () => {
    const failures: string[] = [];
    for (const skill of skills) {
      const fam = FAMILIES[skill.family];
      if (!fam) continue;
      for (let stage = 1; stage <= 5; stage++) {
        for (let i = 0; i < 6; i++) {
          const raw = fam.generate(
            {
              id: skill.id,
              name: skill.name,
              grade: skill.grade,
              strandId: skill.strandId,
              strandName: skill.strandName,
              family: skill.family,
              params: skill.params,
            },
            stage,
            makeRng(4242 + i * 7919 + stage * 104729)
          );
          const res = validateRaw(raw);
          if (!res.ok) failures.push(`${skill.family} ${skill.id} s${stage}: ${res.reasons.join("; ")}`);
        }
      }
    }
    expect(failures, failures.slice(0, 20).join("\n")).toEqual([]);
  });

  /** Repetitive question sequences are a product failure, not just a nicety. */
  it("serves three genuinely different questions per skill and stage", () => {
    const repeats: string[] = [];
    for (const skill of skills) {
      for (let stage = 1; stage <= 5; stage++) {
        const qs = generateSet(skill, stage, 3, 20260815);
        const keys = new Set(qs.map((q) => dedupKey(q)));
        if (keys.size < 3) repeats.push(`${skill.family} ${skill.id} s${stage}: only ${keys.size} distinct`);
      }
    }
    expect(repeats, repeats.slice(0, 20).join("\n")).toEqual([]);
  });

  it("stage labels exist for every skill", () => {
    for (const skill of skills) {
      for (let stage = 1; stage <= 5; stage++) {
        expect(stageLabelFor(skill, stage)).toBeTruthy();
      }
    }
  });

  it("questions are deterministic for a fixed seed", () => {
    const skill = skills.find((s) => s.family === "frac-add-sub") ?? skills[0];
    const a = generateQuestion(skill, 3, { seed: 777 });
    const b = generateQuestion(skill, 3, { seed: 777 });
    expect(a.prompt).toBe(b.prompt);
    expect(a.answer).toBe(b.answer);
  });
});

describe("validation engine", () => {
  it("rejects wrong-format and duplicate-choice questions", () => {
    expect(
      validateRaw({
        kind: "input",
        instruction: "Add.",
        prompt: "2 + 2",
        answer: "four",
        answerFormat: "integer",
        hint: "count",
        steps: ["2+2=4"],
        concept: "addition",
      }).ok
    ).toBe(false);
    expect(
      validateRaw({
        kind: "mc",
        instruction: "Pick.",
        prompt: "2 + 2",
        answer: "4",
        choices: ["4", "4", "5"],
        answerFormat: "choice",
        hint: "count",
        steps: ["2+2=4"],
        concept: "addition",
      }).ok
    ).toBe(false);
  });

  it("normalizes student answers fairly", () => {
    expect(normalizeAnswer(" 3 / 4 ")).toBe("3/4");
    expect(normalizeAnswer("$4.50")).toBe("4.5");
    expect(normalizeAnswer("1,250")).toBe("1250");
    expect(normalizeAnswer(".5")).toBe("0.5");
  });

  it("grades with accept variants", () => {
    const q = {
      accept: ["1 1/2"],
      answer: "3/2",
    } as unknown as Parameters<typeof isCorrect>[0];
    expect(isCorrect(q, "3/2")).toBe(true);
    expect(isCorrect(q, "1 1/2")).toBe(true);
    expect(isCorrect(q, "2/3")).toBe(false);
  });

  it("evalExpr matches order of operations", () => {
    expect(evalExpr("2 + 3 × 4")).toBe(14);
    expect(evalExpr("(2 + 3) × 4")).toBe(20);
    expect(evalExpr("3^2 + 1")).toBe(10);
    expect(evalExpr("18 ÷ 3 + 2 × 5")).toBe(16);
  });
});

describe("mastery engine", () => {
  const attempt = (
    stage: number,
    correct: boolean,
    session: string,
    ts: number,
    usedHint = false
  ) => ({ ts, stage, correct, eventuallyCorrect: correct, usedHint, sessionId: session });

  it("advances stages on consistent first-try accuracy", () => {
    const st = newSkillState("x");
    let advanced = false;
    for (let i = 0; i < 6; i++) {
      const out = recordAttempt(st, attempt(st.stage, true, "s1", i));
      advanced ||= out.stageAdvanced;
    }
    expect(advanced).toBe(true);
    expect(st.stage).toBeGreaterThan(1);
  });

  it("requires multi-session consistency for mastery and schedules review", () => {
    const st = newSkillState("x", 5);
    st.stageMastered = 4;
    for (let i = 0; i < 5; i++) recordAttempt(st, attempt(5, true, "s1", i));
    // Only one session so far — not mastered yet.
    const before = st.mastered;
    for (let i = 5; i < 10; i++) recordAttempt(st, attempt(5, true, "s2", i));
    expect(before).toBe(false);
    expect(st.mastered).toBe(true);
    expect(st.review).toBeDefined();
    expect(st.review!.due).toBeGreaterThan(0);
  });

  it("failed review returns the skill to active practice", () => {
    const st = assumedMastered("x", 0);
    const out = recordAttempt(
      st,
      { ts: 10 * DAY, stage: 4, correct: false, eventuallyCorrect: false, usedHint: false, sessionId: "r1" },
      { isReview: true }
    );
    expect(out.returnedToPractice).toBe(true);
    expect(st.mastered).toBe(false);
    expect(st.needsRepair).toBe(true);
  });

  it("passing reviews stretch the interval", () => {
    const st = assumedMastered("x", 0);
    const firstDue = st.review!.due;
    recordAttempt(
      st,
      { ts: firstDue, stage: 4, correct: true, eventuallyCorrect: true, usedHint: false, sessionId: "r1" },
      { isReview: true }
    );
    expect(st.review!.due - firstDue).toBeGreaterThanOrEqual(REVIEW_INTERVALS_DAYS[1] * DAY);
    expect(reviewsDue([st], firstDue + 100 * DAY).length).toBe(1);
  });
});

describe("placement engine", () => {
  function run(grade: number, correctness: (testGrade: number) => boolean) {
    const state = startPlacement(grade, 42, 0);
    let guard = 0;
    while (!state.done && guard++ < 400) {
      const next = nextPlacementQuestion(state);
      if (!next) break;
      const strand = state.order[state.current];
      const testGrade = state.probes[strand].testGrade;
      applyPlacementAnswer(state, correctness(testGrade));
    }
    expect(state.done).toBe(true);
    return placementReport(state);
  }

  it("a strong student places above grade", () => {
    const report = run(6, () => true);
    for (const row of report) {
      expect(row.level).toBeGreaterThanOrEqual(6);
      expect(["Mastered", "Strong"]).toContain(row.status);
    }
  });

  it("a struggling student places below grade with positive labels", () => {
    const report = run(6, () => false);
    for (const row of report) {
      expect(row.level).toBeLessThan(6);
      expect(["Developing", "Practicing"]).toContain(row.status);
    }
  });

  it("a mixed student gets a mixed profile", () => {
    const report = run(6, (g) => g <= 6);
    expect(report.every((r) => r.level >= 5 && r.level <= 7)).toBe(true);
  });

  it("keeps the question count reasonable", () => {
    const state = startPlacement(6, 7, 0);
    let guard = 0;
    while (!state.done && guard++ < 400) {
      const next = nextPlacementQuestion(state);
      if (!next) break;
      applyPlacementAnswer(state, Math.random() > 0.4);
    }
    expect(state.asked).toBeLessThanOrEqual(70);
  });
});

describe("practice mixer", () => {
  it("builds a full session with purposes and review priority", () => {
    const learner = {
      grade: 6,
      strandLevels: { number: 6, operations: 6, fractions: 5, geometry: 7, stats: 6 },
      pointers: {} as Record<string, string>,
      skills: {} as Record<string, ReturnType<typeof newSkillState>>,
    };
    // Seed a due review.
    const fracChain = strandChain("fractions").filter((s) => s.grade === 5);
    const reviewSkill = fracChain[0];
    learner.skills[reviewSkill.id] = assumedMastered(reviewSkill.id, 0);
    const items = buildPracticeSession(learner, { now: 30 * DAY, seed: 99 });
    expect(items.length).toBeGreaterThanOrEqual(SESSION_SIZE - 2);
    expect(items.some((i) => i.purpose === "Review")).toBe(true);
    expect(items.some((i) => i.purpose === "Current skill")).toBe(true);
    // No duplicate prompts within a session.
    const keys = items.map((i) => i.question.instruction + i.question.prompt);
    expect(new Set(keys).size).toBe(keys.length);
  });
});
