/**
 * Adaptive placement: per strand, start probing at the student's school
 * grade, move up on success and down on struggle, and settle each strand
 * at the highest grade the student can pass. Branching keeps the total
 * question count small — no giant fixed test.
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
  correctAtGrade: number;
  totalAtGrade: number;
  outcomes: Record<number, boolean>; // grade -> passed
  finalGrade?: number;
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
}

const QUESTIONS_PER_GRADE = 2;

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
  const probes: Record<string, StrandProbe> = {};
  for (const id of order) {
    probes[id] = {
      strandId: id,
      strandName: strandLabel(id),
      testGrade: nearestGradeWithStrand(id, studentGrade),
      low: Math.max(1, studentGrade - 3),
      high: Math.min(12, studentGrade + 2),
      correctAtGrade: 0,
      totalAtGrade: 0,
      outcomes: {},
    };
  }
  return {
    studentGrade,
    order,
    current: 0,
    probes,
    asked: 0,
    seedBase,
    done: order.length === 0,
    startedAt: now,
  };
}

function nearestGradeWithStrand(strandId: string, grade: number): number {
  const chain = strandChain(strandId);
  const grades = [...new Set(chain.map((s) => s.grade))].sort((a, b) => a - b);
  let best = grades[0] ?? grade;
  for (const g of grades) if (g <= grade) best = g;
  return best;
}

/** A representative skill for probing a strand at a grade. */
export function probeSkill(strandId: string, grade: number): Skill | undefined {
  const chain = strandChain(strandId);
  const atGrade = chain.filter((s) => s.grade === grade);
  if (atGrade.length === 0) {
    // Walk down to the nearest populated grade.
    for (let g = grade - 1; g >= 1; g--) {
      const lower = chain.filter((s) => s.grade === g);
      if (lower.length) return lower[Math.floor(lower.length * 0.6)];
    }
    return chain[0];
  }
  return atGrade[Math.floor(atGrade.length * 0.6)];
}

export interface PlacementQuestion {
  question: Question;
  strandId: string;
  strandName: string;
  progress: { asked: number; estimatedTotal: number; strandIndex: number; strandCount: number };
}

export function nextPlacementQuestion(state: PlacementState): PlacementQuestion | null {
  if (state.done) return null;
  const strandId = state.order[state.current];
  const probe = state.probes[strandId];
  const skill = probeSkill(strandId, probe.testGrade);
  if (!skill) {
    finishStrand(state, probe, probe.testGrade);
    return state.done ? null : nextPlacementQuestion(state);
  }
  const stage = probe.totalAtGrade === 0 ? 2 : 3;
  const question = generateQuestion(skill, stage, {
    seed: state.seedBase + state.asked * 7919 + probe.testGrade * 131,
  });
  return {
    question,
    strandId,
    strandName: probe.strandName,
    progress: {
      asked: state.asked,
      estimatedTotal: state.order.length * (QUESTIONS_PER_GRADE * 2 + 1),
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

  const { correctAtGrade: c, totalAtGrade: t } = probe;
  // A "stretch" probe sits above a grade this strand has already passed, so
  // the floor is established. One clear miss there ends the climb: stopping
  // slightly low is safe because the mastery engine advances the student,
  // whereas placing them too high strands them above their prerequisites.
  const passedGrades = Object.entries(probe.outcomes)
    .filter(([, ok]) => ok)
    .map(([g]) => Number(g));
  const isStretch = passedGrades.length > 0 && probe.testGrade > Math.max(...passedGrades);

  // Decide after 2 (clear) or 3 (split) questions at this grade.
  const passed = c === QUESTIONS_PER_GRADE && t === QUESTIONS_PER_GRADE ? true
    : isStretch && t === 1 && c === 0 ? false
    : t === QUESTIONS_PER_GRADE && c === 0 ? false
    : t >= 3 ? c >= 2
    : undefined;
  if (passed === undefined) return;

  probe.outcomes[probe.testGrade] = passed;
  probe.correctAtGrade = 0;
  probe.totalAtGrade = 0;

  if (passed) {
    const upper = probe.testGrade + 1;
    if (upper > probe.high || probe.outcomes[upper] === false || !gradeHasStrand(strandId, upper)) {
      finishStrand(state, probe, probe.testGrade);
    } else {
      probe.testGrade = upper;
    }
  } else {
    const lower = probe.testGrade - 1;
    if (lower < probe.low || probe.outcomes[lower] === true || !gradeHasStrand(strandId, lower)) {
      finishStrand(state, probe, probe.outcomes[lower] === true ? lower : Math.max(probe.low, lower));
    } else {
      probe.testGrade = lower;
    }
  }
}

function gradeHasStrand(strandId: string, grade: number): boolean {
  return strandChain(strandId).some((s) => s.grade === grade) || grade >= 1;
}

/**
 * Median of the strands settled so far. Ability correlates across strands,
 * so this is a much better starting guess than the school grade for a
 * student working above or below their year.
 */
function priorGrade(state: PlacementState): number | undefined {
  const settled = Object.values(state.probes)
    .map((p) => p.finalGrade)
    .filter((g): g is number => g !== undefined);
  if (settled.length === 0) return undefined;
  const sorted = [...settled].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

function finishStrand(state: PlacementState, probe: StrandProbe, finalGrade: number): void {
  probe.finalGrade = Math.max(1, Math.min(12, finalGrade));
  state.current += 1;
  if (state.current >= state.order.length) {
    state.done = true;
    return;
  }
  // Start the next strand from what we already know about this student
  // instead of walking down from the school grade all over again.
  const next = state.probes[state.order[state.current]];
  const prior = priorGrade(state);
  if (next && prior !== undefined) {
    const clamped = Math.max(next.low, Math.min(next.high, prior));
    next.testGrade = nearestGradeWithStrand(next.strandId, clamped);
  }
}

export type StrandStatus = "Mastered" | "Strong" | "Developing" | "Practicing";

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
    const status: StrandStatus =
      diff >= 1 ? "Mastered" : diff === 0 ? "Strong" : diff === -1 ? "Developing" : "Practicing";
    return { strandId: id, strandName: p.strandName, level, status };
  });
}
