/**
 * Adaptive placement.
 *
 * The guiding rule is that a child should meet an easy question first and only
 * be taken somewhere harder once they have earned it. Concretely:
 *
 *  - Start LOW and climb. Young children begin at Grade 1 regardless of school
 *    year, and everyone can be placed as low as Grade 1. Starting at the school
 *    grade and falling meant a struggling child failed most of the test before
 *    it found their level.
 *  - Easiest form first. The opening question at any grade is stage 1 of an
 *    early topic, not a mid-difficulty one.
 *  - Respect prerequisites. A strand is only assessed once the child has shown
 *    ability at the grade where that strand begins, so a child who cannot yet
 *    add is never asked to compare fractions. Un-assessed strands are reported
 *    as "Ready to Learn" at their first grade rather than guessed at.
 *  - Stop early. A run of wrong answers ends the test instead of grinding on.
 *
 * Branching still keeps the question count small — this is not a fixed test.
 */
import { strandsAtGrade, strandChain, strandLabel } from "@/curriculum";
import type { Skill } from "@/curriculum/types";
import { generateQuestion } from "./generate";
import type { Question } from "./types";

export interface StrandProbe {
  strandId: string;
  strandName: string;
  testGrade: number;
  low: number; // lowest grade we will probe
  high: number; // highest grade we will probe
  /** Earliest grade at which this strand exists in the curriculum. */
  firstGrade: number;
  correctAtGrade: number;
  totalAtGrade: number;
  outcomes: Record<number, boolean>; // grade -> passed
  finalGrade?: number;
  /** False when the strand was gated or cut short rather than measured. */
  assessed: boolean;
}

export interface PlacementState {
  studentGrade: number;
  order: string[];
  current: number; // index into order
  probes: Record<string, StrandProbe>;
  asked: number;
  seedBase: number;
  done: boolean;
  startedAt: number;
  /** Wrong answers in a row, across the whole session. Drives the mercy rule. */
  wrongStreak: number;
  /** True when the test ended early rather than assessing every strand. */
  endedEarly: boolean;
}

const QUESTIONS_PER_GRADE = 2;
/** A child should never face more than this many placement questions. */
const MAX_QUESTIONS = 26;
/** Consecutive wrong answers that end the test. */
const MERCY_WRONG_STREAK = 5;

/**
 * Dependency order. Arithmetic is settled first so later strands can be gated
 * on what it reveals; anything unlisted is assessed last.
 */
const STRAND_ORDER = [
  "number",
  "operations",
  "fractions",
  "decimals",
  "ratios",
  "algebra",
  "functions",
  "measurement",
  "geometry",
  "stats",
  "trig",
  "calculus",
];

const orderIndex = (id: string) => {
  const i = STRAND_ORDER.indexOf(id);
  return i === -1 ? STRAND_ORDER.length : i;
};

/** Earliest grade at which a strand appears at all. */
function firstGradeOf(strandId: string): number {
  const chain = strandChain(strandId);
  return chain.length ? Math.min(...chain.map((s) => s.grade)) : 1;
}

/**
 * Where to begin probing. The youngest children start at the very bottom;
 * older students start a few grades below their year so the opening question
 * is comfortable, and climb quickly if they are fine.
 */
export function entryGradeFor(studentGrade: number): number {
  return studentGrade <= 3 ? 1 : Math.max(1, studentGrade - 3);
}

/** Strands probed during placement (those defined at the student's grade). */
export function startPlacement(studentGrade: number, seedBase: number, now: number): PlacementState {
  const strands = strandsAtGrade(studentGrade);
  const seen = new Set<string>();
  const order: string[] = [];
  for (const s of strands) {
    if (!seen.has(s.id)) {
      seen.add(s.id);
      order.push(s.id);
    }
  }
  order.sort((a, b) => orderIndex(a) - orderIndex(b));

  const entry = entryGradeFor(studentGrade);
  const probes: Record<string, StrandProbe> = {};
  for (const id of order) {
    probes[id] = {
      strandId: id,
      strandName: strandLabel(id),
      testGrade: nearestGradeWithStrand(id, entry),
      low: 1,
      high: Math.min(12, studentGrade + 2),
      firstGrade: firstGradeOf(id),
      correctAtGrade: 0,
      totalAtGrade: 0,
      outcomes: {},
      assessed: true,
    };
  }
  const state: PlacementState = {
    studentGrade,
    order,
    current: 0,
    probes,
    asked: 0,
    seedBase,
    done: order.length === 0,
    startedAt: now,
    wrongStreak: 0,
    endedEarly: false,
  };
  skipGatedStrands(state);
  return state;
}

function nearestGradeWithStrand(strandId: string, grade: number): number {
  const chain = strandChain(strandId);
  const grades = [...new Set(chain.map((s) => s.grade))].sort((a, b) => a - b);
  let best = grades[0] ?? grade;
  for (const g of grades) if (g <= grade) best = g;
  return best;
}

/**
 * Highest grade the student has actually demonstrated so far. Used to gate
 * later strands; falls back to the entry grade before anything is settled.
 */
function demonstratedLevel(state: PlacementState): number {
  const settled = Object.values(state.probes)
    .filter((p) => p.assessed && p.finalGrade !== undefined)
    .map((p) => p.finalGrade!);
  if (settled.length === 0) return entryGradeFor(state.studentGrade);
  return Math.max(...settled);
}

/**
 * Skip strands the student is plainly not ready for, so nobody is asked about
 * fractions after failing basic addition. Skipped strands are recorded at their
 * first grade and reported as "Ready to Learn".
 */
function skipGatedStrands(state: PlacementState): void {
  while (state.current < state.order.length) {
    const probe = state.probes[state.order[state.current]];
    if (!probe) break;
    // Always assess the first strand — there is nothing to gate on yet.
    const anyAssessed = Object.values(state.probes).some(
      (p) => p.assessed && p.finalGrade !== undefined
    );
    if (!anyAssessed || demonstratedLevel(state) >= probe.firstGrade) break;
    probe.assessed = false;
    probe.finalGrade = probe.firstGrade;
    state.current += 1;
  }
  if (state.current >= state.order.length) state.done = true;
}

/** A representative skill for probing a strand at a grade — an early, easy one. */
export function probeSkill(strandId: string, grade: number): Skill | undefined {
  const chain = strandChain(strandId);
  const pick = (list: Skill[]): Skill =>
    list[grade <= 2 ? 0 : Math.min(list.length - 1, Math.floor(list.length * 0.3))];
  const atGrade = chain.filter((s) => s.grade === grade);
  if (atGrade.length > 0) return pick(atGrade);
  // Walk down to the nearest populated grade.
  for (let g = grade - 1; g >= 1; g--) {
    const lower = chain.filter((s) => s.grade === g);
    if (lower.length) return pick(lower);
  }
  return chain[0];
}

export interface PlacementQuestion {
  question: Question;
  strandId: string;
  strandName: string;
  progress: { asked: number; estimatedTotal: number; strandIndex: number; strandCount: number };
}

export function nextPlacementQuestion(state: PlacementState): PlacementQuestion | null {
  if (state.done) return null;
  skipGatedStrands(state);
  if (state.done) return null;

  const strandId = state.order[state.current];
  const probe = state.probes[strandId];
  const skill = probeSkill(strandId, probe.testGrade);
  if (!skill) {
    finishStrand(state, probe, probe.testGrade);
    return state.done ? null : nextPlacementQuestion(state);
  }
  // Open every grade with its gentlest form, then step up one.
  const stage = probe.totalAtGrade === 0 ? 1 : 2;
  const question = generateQuestion(skill, stage, {
    seed: state.seedBase + state.asked * 7919 + probe.testGrade * 131,
  });
  return {
    question,
    strandId,
    strandName: probe.strandName,
    progress: {
      asked: state.asked,
      estimatedTotal: Math.min(MAX_QUESTIONS, state.order.length * (QUESTIONS_PER_GRADE + 1)),
      strandIndex: state.current,
      strandCount: state.order.length,
    },
  };
}

export function applyPlacementAnswer(state: PlacementState, correct: boolean): void {
  const strandId = state.order[state.current];
  const probe = state.probes[strandId];
  probe.totalAtGrade += 1;
  if (correct) probe.correctAtGrade += 1;
  state.asked += 1;
  state.wrongStreak = correct ? 0 : state.wrongStreak + 1;

  const { correctAtGrade: c, totalAtGrade: t } = probe;
  // A "stretch" probe sits above a grade this strand has already passed, so
  // the floor is established. One clear miss there ends the climb: stopping
  // slightly low is safe because the mastery engine advances the student,
  // whereas placing them too high strands them above their prerequisites.
  const passedGrades = Object.entries(probe.outcomes)
    .filter(([, ok]) => ok)
    .map(([g]) => Number(g));
  const isStretch = passedGrades.length > 0 && probe.testGrade > Math.max(...passedGrades);
  // Once another strand has settled, that level is a strong prior: ability
  // correlates across strands. Re-proving it in every strand is what made the
  // test drag on, so at or below the known level one correct answer confirms.
  const settledAny = Object.values(state.probes).some(
    (p) => p.assessed && p.finalGrade !== undefined
  );
  const known = demonstratedLevel(state);
  // Below the student's own year we only want a quick confirmation, so one
  // correct answer is enough. Rigour is spent at the boundary, where the
  // actual placement decision gets made.
  const isWarmUp =
    probe.testGrade < state.studentGrade || (settledAny && probe.testGrade <= known);
  // Nothing passed yet and there is room to drop: one miss on the gentlest
  // question is enough to know we are still too high. This keeps a struggling
  // student from answering pair after pair they cannot do.
  const searchingDown = passedGrades.length === 0 && probe.testGrade > probe.low;

  const passed = c === QUESTIONS_PER_GRADE && t === QUESTIONS_PER_GRADE ? true
    : isWarmUp && t === 1 && c === 1 ? true
    : (isStretch || searchingDown) && t === 1 && c === 0 ? false
    : t === QUESTIONS_PER_GRADE && c === 0 ? false
    : t >= 3 ? c >= 2
    : undefined;

  if (passed !== undefined) {
    probe.outcomes[probe.testGrade] = passed;
    probe.correctAtGrade = 0;
    probe.totalAtGrade = 0;

    if (passed) {
      // Climb in bigger strides while still below where this student is
      // expected to land, then step one grade at a time once the decision
      // actually matters. After the first strand, the expectation comes from
      // what has already been measured rather than the school year.
      const target = settledAny ? Math.max(known, probe.testGrade) : state.studentGrade;
      const stride = probe.testGrade < target
        ? Math.max(1, Math.ceil((target - probe.testGrade) / 2))
        : 1;
      const upper = probe.testGrade + stride;
      if (upper > probe.high || probe.outcomes[upper] === false || !gradeHasStrand(strandId, upper)) {
        finishStrand(state, probe, probe.testGrade);
      } else {
        probe.testGrade = upper;
      }
    } else {
      // Halve the distance to the floor while hunting for the level, so a
      // struggling student reaches something they can do in a few questions.
      const stride = passedGrades.length === 0
        ? Math.max(1, Math.ceil((probe.testGrade - probe.low) / 2))
        : 1;
      const lower = probe.testGrade - stride;
      if (lower < probe.low || probe.outcomes[lower] === true || !gradeHasStrand(strandId, lower)) {
        finishStrand(state, probe, probe.outcomes[lower] === true ? lower : Math.max(probe.low, lower));
      } else {
        // Dropping to something easier is progress, not a losing streak.
        state.wrongStreak = 0;
        probe.testGrade = lower;
      }
    }
  }

  // Mercy rule and hard cap: never let placement become an endurance test.
  if (!state.done && (state.wrongStreak >= MERCY_WRONG_STREAK || state.asked >= MAX_QUESTIONS)) {
    endEarly(state);
  }
}

/** Close out the test, leaving untouched strands honestly un-assessed. */
function endEarly(state: PlacementState): void {
  const activeId = state.order[state.current];
  const active = state.probes[activeId];
  if (active && active.finalGrade === undefined) {
    // Place the strand in progress at the lowest grade it reached.
    const passed = Object.entries(active.outcomes)
      .filter(([, ok]) => ok)
      .map(([g]) => Number(g));
    active.finalGrade = passed.length ? Math.max(...passed) : active.low;
    active.assessed = passed.length > 0;
  }
  for (let i = state.current + 1; i < state.order.length; i++) {
    const p = state.probes[state.order[i]];
    if (p && p.finalGrade === undefined) {
      p.finalGrade = p.firstGrade;
      p.assessed = false;
    }
  }
  state.current = state.order.length;
  state.done = true;
  state.endedEarly = true;
}

function gradeHasStrand(strandId: string, grade: number): boolean {
  return strandChain(strandId).some((s) => s.grade === grade) || grade >= 1;
}

function finishStrand(state: PlacementState, probe: StrandProbe, finalGrade: number): void {
  probe.finalGrade = Math.max(1, Math.min(12, finalGrade));
  state.current += 1;
  if (state.current >= state.order.length) {
    state.done = true;
    return;
  }
  skipGatedStrands(state);
  if (state.done) return;
  // Start the next strand from what we already know about this student
  // instead of walking up from the entry grade all over again.
  const next = state.probes[state.order[state.current]];
  const known = demonstratedLevel(state);
  if (next) {
    const clamped = Math.max(next.low, Math.min(next.high, known));
    next.testGrade = nearestGradeWithStrand(next.strandId, clamped);
  }
}

export type StrandStatus = "Mastered" | "Strong" | "Developing" | "Practicing" | "Ready to Learn";

export interface PlacementReportRow {
  strandId: string;
  strandName: string;
  level: number;
  status: StrandStatus;
}

export function placementReport(state: PlacementState): PlacementReportRow[] {
  return state.order.map((id) => {
    const p = state.probes[id];
    const level = p.finalGrade ?? state.studentGrade;
    const diff = level - state.studentGrade;
    const status: StrandStatus = !p.assessed
      ? "Ready to Learn"
      : diff >= 1 ? "Mastered"
      : diff === 0 ? "Strong"
      : diff === -1 ? "Developing"
      : "Practicing";
    return { strandId: id, strandName: p.strandName, level, status };
  });
}
