/**
 * Adaptive placement, version 2.
 *
 * Version 1 produced a report that no real student could have earned:
 * Algebra Grade 5 "Mastered" beside Number Sense Grade 4 and Decimals
 * Grade 1. Three flaws let that happen, and each is closed here:
 *
 *  1. Nothing connected the strands. A strand was placed on its own
 *     evidence alone, so algebra could sit two grades above the arithmetic
 *     it is built from. Strands now carry PREREQUISITES derived from the
 *     curriculum (see STRAND_PREREQS), and a strand's level may not exceed
 *     the lowest unmet prerequisite's level + 1. An estimate over that cap
 *     is not silently clamped: the prerequisite is re-probed at the level
 *     the higher strand needs, and only if it fails there does the cap
 *     stand.
 *  2. One correct answer could advance a whole grade. Every grade now needs
 *     3 correct of at most 4 items to pass, and 2 misses fail it; the level
 *     climbs by an adaptive staircase (up on pass, down on fail, stop after
 *     two reversals) so a strand gets 6–10 items rather than 2–3.
 *  3. A multiple-choice item counted like a typed one, though a four-option
 *     guess is right a quarter of the time. Typed items are preferred when
 *     choosing what to serve, and a correct multiple-choice answer only
 *     counts once a second item on the same skill and level is also
 *     correct. A uniform guesser now places at the floor of every strand.
 *
 * Every item served, every response, and the estimate after each counted
 * item are logged on the state, so any result can be explained afterwards.
 * Thresholds are documented in docs/PLACEMENT-ENGINE.md.
 */
import { strandIds, strandChain, strandLabel, getSkill } from "@/curriculum";
import type { Skill } from "@/curriculum/types";
import { generateQuestion } from "./generate";
import type { Question, QKind } from "./types";

export const PLACEMENT_VERSION = 2;

/* ------------------------------------------------------------------ rules */

/** Items at one grade before the grade is decided. */
export const ITEMS_PER_LEVEL = 4;
/** Correct answers (counted evidence) needed to pass a grade. */
export const PASS_CORRECT = 3;
/** Misses that make 3-of-4 impossible, failing the grade early. */
export const FAIL_MISSES = ITEMS_PER_LEVEL - PASS_CORRECT + 1;
/** Direction changes before a strand's staircase stops. */
export const MAX_REVERSALS = 2;
/** Counted items per strand in the main pass: once reached, no new grade is
 *  started. The grade under test still finishes, and a descent that has
 *  passed nothing yet continues to its first pass or the floor. */
export const MAX_ITEMS_PER_STRAND = 10;
/** Hard stop on items SERVED to a strand, multiple-choice halves included —
 *  a search still open at this point is placed on its best evidence. */
export const MAX_RAW_ITEMS_PER_STRAND = 20;
/** Failed grades in a row, with nothing passed yet, before the descent
 *  steps by two — keeps a far-behind student from a long miss streak. */
export const FAST_DESCENT_AFTER = 3;
/** Items spent re-probing a prerequisite that a higher strand's estimate
 *  depends on. */
export const CONFIRM_ITEMS = 4;
/** Tie-break items served when the profile is incoherent. */
export const TIEBREAK_ITEMS = 4;
/** Spread (highest − lowest placed grade) that triggers tie-breaks. */
export const COHERENCE_SPREAD = 2;

/** Status thresholds: accuracy of counted evidence AT the placed level. */
export const STATUS_THRESHOLDS = { mastered: 0.9, strong: 0.8, developing: 0.5 } as const;

/**
 * Dependency order. Arithmetic settles first so later strands can start
 * from what it revealed, and so prerequisite caps have their evidence.
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

/**
 * Cross-strand prerequisites, DERIVED from the curriculum rather than
 * asserted. The skill graph in src/curriculum is linear within a strand
 * (each skill's prereq is the one before it), so cross-strand structure
 * comes from two things the data does say. tests/placementV2 checks every
 * claim below against the live curriculum, so the map cannot drift from it.
 *
 *  (1) FAMILY INHERITANCE. When strand B uses a generator family that
 *      strand A introduced at a lower grade, B is built on A. Introduced at
 *      the same grade: the strand the curriculum lists first is upstream.
 *      Introduced in BOTH directions: the two are siblings, and no edge is
 *      drawn either way. From the curriculum:
 *        operations → algebra    missing-number            (g1, g1)
 *        number     → algebra    exponent-rules            (g8 → g9)
 *        ratios     → algebra    proportional-relationships (g6 → g8)
 *        ratios     → geometry   scale-drawings            (g7, g7)
 *        algebra    → functions  poly-add-sub, poly-mul, factor,
 *                                rational-expression, radical-expression,
 *                                quadratic-solve, quadratic-features
 *        number  ⟷ operations    siblings: operations introduces
 *                                mental-math (g1) and integer-ops (g6)
 *                                first; number introduces skip-counting
 *        measurement ⟷ geometry  siblings: geometry has perimeter-area
 *                                first (g3), measurement has
 *                                volume-surface first (g4)
 *      Trig and calculus share no family with any other strand, so they
 *      carry only the foundation below — no algebra or functions edge.
 *
 *  (2) ARITHMETIC FOUNDATION. Every grade file lists the five arithmetic
 *      strands first — number, operations, fractions, decimals, ratios —
 *      before algebra, geometry, measurement and statistics. Each of the
 *      five depends on those listed before it (number and operations
 *      being siblings by rule 1), and every other strand depends on all
 *      five.
 *
 * A prerequisite P of strand S at grade G is needed at min(G−1, P's
 * ceiling); if that is below P's floor the requirement is vacuous, which
 * is what keeps Grade 1 algebra from owing anything to Grade 5 ratios.
 */
const ARITHMETIC = ["number", "operations", "fractions", "decimals", "ratios"];

export const STRAND_PREREQS: Record<string, string[]> = {
  number: [],
  operations: [],
  fractions: ["number", "operations"],
  decimals: ["number", "operations", "fractions"],
  ratios: ["number", "operations", "fractions", "decimals"],
  algebra: [...ARITHMETIC],
  measurement: [...ARITHMETIC],
  geometry: [...ARITHMETIC],
  stats: [...ARITHMETIC],
  functions: [...ARITHMETIC, "algebra"],
  trig: [...ARITHMETIC],
  calculus: [...ARITHMETIC],
};

/* ------------------------------------------------------------------ types */

export type StrandStatus =
  | "Mastered"
  | "Strong"
  | "Developing"
  | "Practicing"
  | "Ready to Learn"
  | "Not started";

export interface LevelTally {
  correct: number;
  wrong: number;
}

export interface StrandProbe {
  strandId: string;
  strandName: string;
  /** First and last grade the strand exists at. */
  floor: number;
  ceiling: number;
  /** Age-expected grade: the student's year, capped by the strand's ceiling. */
  expected: number;
  testGrade: number;
  direction: -1 | 0 | 1;
  reversals: number;
  /** Failed grades in a row while nothing has passed yet (fast descent). */
  failStreak: number;
  items: number;
  /** Counted evidence per grade (multiple-choice pairs count once). */
  tallies: Record<number, LevelTally>;
  passed: Record<number, boolean>;
  failed: Record<number, boolean>;
  /** A correct multiple-choice answer awaiting its confirming twin. */
  pendingPair?: { grade: number; skillId: string; stage: number };
  finalGrade?: number;
  /** True once counted evidence exists at the placed level. */
  assessed: boolean;
  /** True when prerequisites were below the floor — never probed. */
  gated: boolean;
  /** Set when a prerequisite cap lowered the raw estimate. */
  cappedBy?: string;
  rawGrade?: number;
  /** Estimate after every counted item, for explaining the result. */
  trajectory: number[];
  /** Grades that received their one status-refinement item. */
  refined?: Record<number, boolean>;
  // Legacy field name kept for the UI's progress copy.
  high: number;
}

export type PlacementPhase = "main" | "confirm" | "tiebreak" | "done";

export interface PlacementLogEntry {
  n: number;
  phase: PlacementPhase;
  strandId: string;
  grade: number;
  skillId: string;
  stage: number;
  kind: QKind;
  correct: boolean;
  /** False for the first half of a multiple-choice pair. */
  counted: boolean;
  note?: string;
}

interface PendingItem {
  phase: PlacementPhase;
  strandId: string;
  grade: number;
  question: Question;
  /** For confirm/tie-break items: which strand's estimate depends on this. */
  forStrand?: string;
}

interface ConfirmJob {
  strandId: string;
  grade: number;
  forStrand: string;
  tally: LevelTally;
  items: number;
  pendingPair?: { grade: number; skillId: string; stage: number };
}

export interface PlacementState {
  version: number;
  studentGrade: number;
  order: string[];
  current: number;
  probes: Record<string, StrandProbe>;
  asked: number;
  seedBase: number;
  done: boolean;
  startedAt: number;
  phase: PlacementPhase;
  pending?: PendingItem;
  confirm?: ConfirmJob;
  /** Prerequisite confirmations already spent, per strand. */
  confirmSpent: Record<string, number>;
  tiebreak?: ConfirmJob;
  tiebreakSpent: number;
  log: PlacementLogEntry[];
  /** Kept for the parent-facing "ended early" message; never true in v2. */
  endedEarly: boolean;
  /** Legacy: consecutive wrong answers. Informational only in v2. */
  wrongStreak: number;
}

/* -------------------------------------------------------------- curriculum */

const orderIndex = (id: string) => {
  const i = STRAND_ORDER.indexOf(id);
  return i === -1 ? STRAND_ORDER.length : i;
};

function firstGradeOf(strandId: string): number {
  const chain = strandChain(strandId);
  return chain.length ? Math.min(...chain.map((s) => s.grade)) : 1;
}

function lastGradeOf(strandId: string): number {
  const chain = strandChain(strandId);
  return chain.length ? Math.max(...chain.map((s) => s.grade)) : 1;
}

/** Every strand the student could owe work in: starts at or below their grade. */
export function strandsToPlace(studentGrade: number): string[] {
  return strandIds()
    .filter((id) => firstGradeOf(id) <= studentGrade)
    .sort((a, b) => orderIndex(a) - orderIndex(b));
}

/**
 * Where the first strand begins: the student's own grade. Later strands
 * begin from what earlier ones revealed (see informedStart).
 */
export function entryGradeFor(studentGrade: number): number {
  return Math.max(1, Math.min(12, studentGrade));
}

/* --------------------------------------------------------- item selection */

const KIND_CACHE = new Map<string, QKind>();

/** Whether a family serves typed or multiple-choice items (probed once). */
function familyKind(skill: Skill): QKind {
  const cached = KIND_CACHE.get(skill.family);
  if (cached) return cached;
  let kind: QKind = "input";
  try {
    kind = generateQuestion(skill, 1, { seed: 7 }).kind;
  } catch {
    /* treat as typed */
  }
  KIND_CACHE.set(skill.family, kind);
  return kind;
}

function hash(...parts: (string | number)[]): number {
  let h = 2166136261;
  for (const ch of parts.join("|")) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * A skill to probe a strand at a grade. Typed families are preferred
 * because they cannot be guessed; among candidates the choice rotates with
 * the item index so a grade is not judged on one topic alone.
 */
export function probeSkill(strandId: string, grade: number, seed = 0, nth = 0): Skill | undefined {
  const chain = strandChain(strandId);
  let atGrade = chain.filter((s) => s.grade === grade);
  if (atGrade.length === 0) {
    for (let g = grade - 1; g >= 1 && atGrade.length === 0; g--) {
      atGrade = chain.filter((s) => s.grade === g);
    }
  }
  if (atGrade.length === 0) return chain[0];
  const typed = atGrade.filter((s) => familyKind(s) === "input");
  const pool = typed.length ? typed : atGrade;
  return pool[(hash(seed, strandId, grade) + nth) % pool.length];
}

/* ------------------------------------------------------------- lifecycle */

function newProbe(id: string, studentGrade: number): StrandProbe {
  const floor = firstGradeOf(id);
  const ceiling = lastGradeOf(id);
  const expected = Math.max(floor, Math.min(studentGrade, ceiling));
  return {
    strandId: id,
    strandName: strandLabel(id),
    floor,
    ceiling,
    expected,
    testGrade: expected,
    direction: 0,
    reversals: 0,
    failStreak: 0,
    items: 0,
    tallies: {},
    passed: {},
    failed: {},
    assessed: false,
    gated: false,
    trajectory: [],
    high: ceiling,
  };
}

export function startPlacement(studentGrade: number, seedBase: number, now: number): PlacementState {
  const order = strandsToPlace(studentGrade);
  const probes: Record<string, StrandProbe> = {};
  for (const id of order) probes[id] = newProbe(id, studentGrade);
  const state: PlacementState = {
    version: PLACEMENT_VERSION,
    studentGrade,
    order,
    current: 0,
    probes,
    asked: 0,
    seedBase,
    done: order.length === 0,
    startedAt: now,
    phase: order.length === 0 ? "done" : "main",
    confirmSpent: {},
    tiebreakSpent: 0,
    log: [],
    endedEarly: false,
    wrongStreak: 0,
  };
  advanceStrand(state, false);
  return state;
}

/** Median placed grade of the strands assessed so far. */
function demonstratedLevel(state: PlacementState): number | null {
  const levels = Object.values(state.probes)
    .filter((p) => p.finalGrade !== undefined && !p.gated)
    .map((p) => p.finalGrade!)
    .sort((a, b) => a - b);
  if (levels.length === 0) return null;
  return levels[Math.floor(levels.length / 2)];
}

/**
 * Where a later strand starts: the age-expected grade, lowered to what its
 * PREREQUISITES allow, so a child who is behind meets a question they can
 * answer rather than one from their school year. A strand with no
 * prerequisites placed yet starts at the expected grade.
 */
function informedStart(state: PlacementState, probe: StrandProbe): number {
  const { cap } = prerequisiteCap(probe.strandId, probe.expected, estimatedLevels(state));
  return Math.max(probe.floor, Math.min(probe.expected, cap));
}

/**
 * Move to the next strand still to be probed. A strand is gated — recorded
 * as "Not started" at its floor, never probed, never guessed above it —
 * when its prerequisites are below what even its FLOOR requires. Judged on
 * prerequisites, not on a median of everything placed so far: strands that
 * end early (measurement at 5, operations at 6) would otherwise drag a
 * capable Grade 12 student's median under the floor of functions.
 */
function advanceStrand(state: PlacementState, step: boolean): void {
  if (step) state.current += 1;
  while (state.current < state.order.length) {
    const probe = state.probes[state.order[state.current]];
    const { cap } = prerequisiteCap(probe.strandId, probe.floor, estimatedLevels(state));
    if (cap < probe.floor) {
      probe.gated = true;
      probe.assessed = false;
      probe.finalGrade = probe.floor;
      state.current += 1;
      continue;
    }
    probe.testGrade = informedStart(state, probe);
    return;
  }
  state.phase = "confirm";
  planConfirmations(state);
}

/* ----------------------------------------------------------- serving items */

export interface PlacementQuestion {
  question: Question;
  strandId: string;
  strandName: string;
  /** The grade under test — not always the skill's own grade, since a grade
   *  with no skills of its own borrows from the nearest lower one. */
  grade: number;
  progress: { asked: number; estimatedTotal: number; strandIndex: number; strandCount: number };
}

function makeQuestion(
  state: PlacementState,
  strandId: string,
  grade: number,
  nth: number,
  pair?: { skillId: string; stage: number }
): Question | null {
  const skill = pair ? getSkill(pair.skillId) : probeSkill(strandId, grade, state.seedBase, nth);
  if (!skill) return null;
  // The first item at a grade is the gentlest form; later ones step up a
  // stage so a pass reflects the grade, not its easiest exercise.
  const stage = pair ? pair.stage : nth === 0 ? 1 : 2;
  const seed = state.seedBase + state.asked * 7919 + grade * 131 + hash(strandId) % 977;
  try {
    return generateQuestion(skill, stage, { seed });
  } catch {
    return null;
  }
}

function progressOf(state: PlacementState) {
  return {
    asked: state.asked,
    estimatedTotal: Math.max(state.asked + 1, state.order.length * 6),
    strandIndex: Math.min(state.current, Math.max(0, state.order.length - 1)),
    strandCount: state.order.length,
  };
}

export function nextPlacementQuestion(state: PlacementState): PlacementQuestion | null {
  if (state.done) return null;
  if (state.pending) {
    const p = state.pending;
    // Keep the probe's testGrade honest while a confirm or tie-break item is
    // out, so anything reading it sees the grade actually being served.
    state.probes[p.strandId].testGrade = p.grade;
    return {
      question: p.question,
      strandId: p.strandId,
      strandName: strandLabel(p.strandId),
      grade: p.grade,
      progress: progressOf(state),
    };
  }

  if (state.phase === "main") {
    const strandId = state.order[state.current];
    const probe = state.probes[strandId];
    if (!probe) return finishAll(state);
    const nth = probe.tallies[probe.testGrade]
      ? probe.tallies[probe.testGrade].correct + probe.tallies[probe.testGrade].wrong + (probe.pendingPair ? 1 : 0)
      : probe.pendingPair
        ? 1
        : 0;
    const pair = probe.pendingPair ? { skillId: probe.pendingPair.skillId, stage: probe.pendingPair.stage } : undefined;
    const question = makeQuestion(state, strandId, probe.testGrade, nth, pair);
    if (!question) {
      finishStrand(state, probe, probe.floor, "no item could be generated");
      return nextPlacementQuestion(state);
    }
    state.pending = { phase: "main", strandId, grade: probe.testGrade, question };
    return nextPlacementQuestion(state);
  }

  const job = state.phase === "confirm" ? state.confirm : state.phase === "tiebreak" ? state.tiebreak : undefined;
  if (!job) return finishAll(state);
  const nth = job.tally.correct + job.tally.wrong + (job.pendingPair ? 1 : 0);
  const pair = job.pendingPair ? { skillId: job.pendingPair.skillId, stage: job.pendingPair.stage } : undefined;
  const question = makeQuestion(state, job.strandId, job.grade, nth, pair);
  if (!question) {
    resolveJob(state, job, false);
    return nextPlacementQuestion(state);
  }
  state.pending = { phase: state.phase, strandId: job.strandId, grade: job.grade, question, forStrand: job.forStrand };
  return nextPlacementQuestion(state);
}

/* ---------------------------------------------------------- applying answers */

/**
 * Multiple-choice guess protection. Returns the counted result of this
 * answer, or null when a correct multiple-choice answer is held pending its
 * confirming twin on the same skill and level.
 */
type Counted = boolean | "pending" | "inconclusive";

function countAnswer(
  holder: { pendingPair?: { grade: number; skillId: string; stage: number } },
  question: Question,
  grade: number,
  correct: boolean
): Counted {
  if (question.kind !== "mc") return correct;
  if (holder.pendingPair) {
    holder.pendingPair = undefined;
    // Correct twice: counted once. Correct then wrong: the pair proved
    // nothing either way — a lucky guess and a slip look the same — so
    // neither half counts. Counting the miss alone would make a grade
    // served as multiple choice markedly harder than the same grade typed.
    return correct ? true : "inconclusive";
  }
  if (!correct) return false;
  holder.pendingPair = { grade, skillId: question.skillId, stage: question.stage };
  return "pending";
}

function pairNote(c: Counted): string | undefined {
  if (c === "pending") return "multiple-choice: awaiting confirming item";
  if (c === "inconclusive") return "multiple-choice: pair inconclusive, neither half counted";
  return undefined;
}

function tallyOf(tallies: Record<number, LevelTally>, grade: number): LevelTally {
  return (tallies[grade] ??= { correct: 0, wrong: 0 });
}

export function applyPlacementAnswer(state: PlacementState, correct: boolean): void {
  const pending = state.pending;
  if (!pending || state.done) return;
  state.pending = undefined;
  state.asked += 1;
  state.wrongStreak = correct ? 0 : state.wrongStreak + 1;

  if (pending.phase === "main") {
    const probe = state.probes[pending.strandId];
    const counted = countAnswer(probe, pending.question, pending.grade, correct);
    state.log.push({
      n: state.asked,
      phase: "main",
      strandId: probe.strandId,
      grade: pending.grade,
      skillId: pending.question.skillId,
      stage: pending.question.stage,
      kind: pending.question.kind,
      correct,
      counted: typeof counted === "boolean",
      note: pairNote(counted),
    });
    probe.items += 1;
    if (typeof counted !== "boolean") {
      if (probe.items >= MAX_RAW_ITEMS_PER_STRAND) settleOnEvidence(state, probe);
      return;
    }
    const t = tallyOf(probe.tallies, pending.grade);
    if (counted) t.correct += 1;
    else t.wrong += 1;
    probe.trajectory.push(currentEstimate(probe));
    decideGrade(state, probe);
    return;
  }

  const job = pending.phase === "confirm" ? state.confirm : state.tiebreak;
  if (!job) return;
  const counted = countAnswer(job, pending.question, pending.grade, correct);
  state.log.push({
    n: state.asked,
    phase: pending.phase,
    strandId: job.strandId,
    grade: pending.grade,
    skillId: pending.question.skillId,
    stage: pending.question.stage,
    kind: pending.question.kind,
    correct,
    counted: typeof counted === "boolean",
    note: [`${pending.phase === "confirm" ? "prerequisite check" : "tie-break"} for ${job.forStrand}`, pairNote(counted)]
      .filter(Boolean)
      .join("; "),
  });
  job.items += 1;
  if (typeof counted === "boolean") {
    if (counted) job.tally.correct += 1;
    else job.tally.wrong += 1;
  }
  if (job.tally.correct >= PASS_CORRECT) resolveJob(state, job, true);
  else if (job.tally.wrong >= FAIL_MISSES || job.items >= ITEMS_PER_LEVEL * 2) resolveJob(state, job, false);
}

/** Highest passed grade so far, else the floor. */
function currentEstimate(probe: StrandProbe): number {
  const passed = Object.entries(probe.passed)
    .filter(([, ok]) => ok)
    .map(([g]) => Number(g));
  return passed.length ? Math.max(...passed) : probe.floor;
}

/** Counted evidence a strand has accumulated across all grades. */
function countedItems(probe: StrandProbe): number {
  let n = 0;
  for (const t of Object.values(probe.tallies)) n += t.correct + t.wrong;
  return n;
}

/** The staircase: decide the grade under test, then step, reverse or stop. */
function decideGrade(state: PlacementState, probe: StrandProbe): void {
  const g = probe.testGrade;
  const t = tallyOf(probe.tallies, g);
  const passed = t.correct >= PASS_CORRECT;
  const failed = !passed && t.wrong >= FAIL_MISSES;
  if (!passed && !failed) {
    // A grade in progress is never cut short by the counted budget — only
    // by the hard stop on items served.
    if (probe.items >= MAX_RAW_ITEMS_PER_STRAND) settleOnEvidence(state, probe);
    return;
  }

  if (passed) {
    // Status refinement: a grade passed with a miss sits at exactly 75%,
    // which no threshold band was written for. One further item at the same
    // grade turns that into 80% (Strong) or 60% (Developing) — the decision
    // to pass is already made, only the label is at stake.
    if (t.wrong > 0 && t.correct + t.wrong === ITEMS_PER_LEVEL && !probe.refined?.[g] && probe.items < MAX_RAW_ITEMS_PER_STRAND) {
      probe.refined = { ...(probe.refined ?? {}), [g]: true };
      return;
    }
    probe.passed[g] = true;
    probe.failStreak = 0;
    if (g >= probe.ceiling || probe.failed[g + 1]) return finishStrand(state, probe, g);
    if (probe.direction === -1) probe.reversals += 1;
    probe.direction = 1;
    if (
      probe.reversals >= MAX_REVERSALS ||
      countedItems(probe) >= MAX_ITEMS_PER_STRAND ||
      probe.items >= MAX_RAW_ITEMS_PER_STRAND
    ) {
      return finishStrand(state, probe, g);
    }
    probe.testGrade = g + 1;
    return;
  }

  probe.failed[g] = true;
  const anyPassed = Object.values(probe.passed).some(Boolean);
  if (g <= probe.floor) return finishStrand(state, probe, probe.floor);
  if (probe.passed[g - 1]) return finishStrand(state, probe, g - 1);
  if (probe.direction === 1) probe.reversals += 1;
  probe.direction = -1;
  // The counted budget stops the search at a grade boundary — but not a
  // descent that has passed nothing yet. That continues, two quick misses a
  // grade, until something passes or the floor is reached, so a far-behind
  // student is placed on a pass rather than on the last grade the budget
  // happened to allow.
  const outOfBudget = anyPassed && countedItems(probe) >= MAX_ITEMS_PER_STRAND;
  if (probe.reversals >= MAX_REVERSALS || outOfBudget || probe.items >= MAX_RAW_ITEMS_PER_STRAND) {
    return settleOnEvidence(state, probe);
  }
  probe.failStreak = anyPassed ? 0 : probe.failStreak + 1;
  // Fast descent: with nothing passed and three grades failed in a row, the
  // student is far below here — step by two rather than grind down by one.
  const step = !anyPassed && probe.failStreak >= FAST_DESCENT_AFTER ? 2 : 1;
  probe.testGrade = Math.max(probe.floor, g - step);
}

/** The strand ran out of budget or reversals: place on the best evidence. */
function settleOnEvidence(state: PlacementState, probe: StrandProbe): void {
  const passed = Object.entries(probe.passed).filter(([, ok]) => ok).map(([g]) => Number(g));
  if (passed.length) return finishStrand(state, probe, Math.max(...passed));
  const failed = Object.entries(probe.failed).filter(([, ok]) => ok).map(([g]) => Number(g));
  const below = failed.length ? Math.min(...failed) - 1 : probe.testGrade;
  finishStrand(state, probe, Math.max(probe.floor, below), "settled without a passed grade");
}

function finishStrand(state: PlacementState, probe: StrandProbe, grade: number, note?: string): void {
  probe.finalGrade = Math.max(probe.floor, Math.min(probe.ceiling, grade));
  probe.rawGrade = probe.finalGrade;
  probe.assessed = Boolean(probe.tallies[probe.finalGrade]);
  probe.pendingPair = undefined;
  if (note) state.log.push({
    n: state.asked,
    phase: "main",
    strandId: probe.strandId,
    grade: probe.finalGrade,
    skillId: "",
    stage: 0,
    kind: "input",
    correct: false,
    counted: false,
    note,
  });
  advanceStrand(state, true);
}

/* -------------------------------------------------- prerequisites and caps */

/** The level prerequisite P must reach for strand S to be placed at grade g. */
export function requiredLevel(prereq: string, grade: number): number {
  return Math.min(grade - 1, lastGradeOf(prereq));
}

/**
 * The highest grade a strand may be placed at given its prerequisites'
 * levels. The rule is "lowest unmet prerequisite level + 1", written as
 * grade − shortfall so it also behaves for a prerequisite strand that has
 * ENDED: measurement stops at Grade 5, and a Grade 12 student two grades
 * short of finishing it is capped two grades in geometry, not dragged to
 * Grade 4. For a prerequisite that is still running, need = grade − 1 and
 * the formula is exactly level + 1. Returns the binding prerequisite so it
 * can be re-probed rather than silently applied.
 */
export function prerequisiteCap(
  strandId: string,
  grade: number,
  levels: Record<string, number | undefined>
): { cap: number; bindingPrereq: string | null } {
  let cap = Infinity;
  let binding: string | null = null;
  for (const p of STRAND_PREREQS[strandId] ?? []) {
    const need = requiredLevel(p, grade);
    if (need < firstGradeOf(p)) continue; // vacuous: P has not started by then
    const have = levels[p];
    if (have === undefined) continue; // P not placed for this student
    if (have >= need) continue;
    const c = grade - (need - have);
    if (c < cap) {
      cap = c;
      binding = p;
    }
  }
  return { cap, bindingPrereq: binding };
}

/**
 * Two views of the levels placed so far.
 *
 * ESTIMATED is each strand's best estimate: its placed grade, except that a
 * strand which failed at its floor without passing anything, or was gated,
 * sits one below its floor. This view chooses where later strands START
 * and which strands are gated — cheap decisions the staircase corrects.
 *
 * EARNED admits only what was PASSED: a strand settled on failures alone
 * vouches for nothing above its floor − 1. This view computes prerequisite
 * CAPS, which bind the final result — and an unverified estimate a higher
 * strand leans on is re-probed in the confirm phase rather than trusted.
 */
function estimatedLevels(state: PlacementState): Record<string, number | undefined> {
  const out: Record<string, number | undefined> = {};
  for (const p of Object.values(state.probes)) {
    if (p.finalGrade === undefined) continue;
    const passedAny = Object.values(p.passed).some(Boolean);
    const belowFloor = p.gated || (!passedAny && p.failed[p.floor]);
    out[p.strandId] = belowFloor ? p.floor - 1 : p.finalGrade;
  }
  return out;
}

function earnedLevels(state: PlacementState): Record<string, number | undefined> {
  const out: Record<string, number | undefined> = {};
  for (const p of Object.values(state.probes)) {
    if (p.finalGrade === undefined) continue;
    const passed = Object.entries(p.passed).filter(([, ok]) => ok).map(([g]) => Number(g));
    out[p.strandId] = passed.length ? Math.min(p.finalGrade, Math.max(...passed)) : p.floor - 1;
  }
  return out;
}

/**
 * After the main pass: find strands whose raw estimate exceeds their
 * prerequisite cap. Rather than clamp, re-probe the binding prerequisite at
 * the level the higher strand needs. The cap only stands if that fails.
 */
function planConfirmations(state: PlacementState): void {
  let levels = earnedLevels(state);
  for (const id of state.order) {
    const probe = state.probes[id];
    if (probe.gated || probe.finalGrade === undefined) continue;
    const { cap, bindingPrereq } = prerequisiteCap(id, probe.finalGrade, levels);
    if (probe.finalGrade <= cap || !bindingPrereq) continue;
    const need = requiredLevel(bindingPrereq, probe.finalGrade);
    const spent = state.confirmSpent[bindingPrereq] ?? 0;
    // Even a grade the prerequisite failed in the main pass is re-asked
    // once: two misses on three items is evidence, not proof, and the cap
    // binds another strand's result. The budget keeps it to one re-probe.
    if (spent < CONFIRM_ITEMS) {
      state.confirm = {
        strandId: bindingPrereq,
        grade: need,
        forStrand: id,
        tally: { correct: 0, wrong: 0 },
        items: 0,
      };
      state.phase = "confirm";
      return;
    }
    // Budget spent and still unmet: the cap stands, and says so.
    probe.cappedBy = bindingPrereq;
    probe.finalGrade = cap;
    levels = earnedLevels(state); // later strands see the lowered prerequisite
    state.log.push({
      n: state.asked, phase: "confirm", strandId: id, grade: cap, skillId: "", stage: 0,
      kind: "input", correct: false, counted: false,
      note: `capped from ${probe.rawGrade} to ${cap}: ${bindingPrereq} is below the level ${id} needs`,
    });
  }
  state.confirm = undefined;
  state.phase = "tiebreak";
  planTiebreak(state);
}

function resolveJob(state: PlacementState, job: ConfirmJob, passed: boolean): void {
  const probe = state.probes[job.strandId];
  state.confirmSpent[job.strandId] = (state.confirmSpent[job.strandId] ?? 0) + job.items;
  if (state.phase === "tiebreak") state.tiebreakSpent += job.items;
  tallyOf(probe.tallies, job.grade).correct += job.tally.correct;
  tallyOf(probe.tallies, job.grade).wrong += job.tally.wrong;
  if (passed) {
    probe.passed[job.grade] = true;
    probe.finalGrade = Math.max(probe.finalGrade ?? probe.floor, job.grade);
    probe.assessed = true;
    probe.trajectory.push(probe.finalGrade);
  } else {
    probe.failed[job.grade] = true;
    probe.trajectory.push(probe.finalGrade ?? probe.floor);
  }
  if (state.phase === "confirm") {
    state.confirm = undefined;
    planConfirmations(state);
  } else {
    state.tiebreak = undefined;
    planTiebreak(state);
  }
}

/* --------------------------------------------------------- coherence check */

/**
 * A profile whose strands are more than two grades apart is suspicious. The
 * low outlier gets up to four items one grade above its placement; a pass
 * lifts it. Prerequisite caps are respected — a strand is never lifted
 * above what its prerequisites allow.
 */
function planTiebreak(state: PlacementState): void {
  const assessed = state.order
    .map((id) => state.probes[id])
    .filter((p) => !p.gated && p.finalGrade !== undefined && p.assessed);
  if (assessed.length >= 2 && state.tiebreakSpent < TIEBREAK_ITEMS) {
    const top = Math.max(...assessed.map((p) => p.finalGrade!));
    // The outlier is the lowest strand that could still be lifted: one at
    // its ceiling (measurement ends at Grade 5) is finished, not behind.
    const liftable = assessed.filter((p) => p.finalGrade! < p.ceiling);
    const low = liftable.length
      ? liftable.reduce((a, b) => (a.finalGrade! <= b.finalGrade! ? a : b))
      : undefined;
    if (low && top - low.finalGrade! > COHERENCE_SPREAD) {
      const up = low.finalGrade! + 1;
      const { cap } = prerequisiteCap(low.strandId, up, earnedLevels(state));
      // The grade above is re-asked even if the main pass failed it: that
      // fail is the suspicious result. The budget allows one such lift.
      if (up <= cap) {
        state.tiebreak = {
          strandId: low.strandId,
          grade: up,
          forStrand: low.strandId,
          tally: { correct: 0, wrong: 0 },
          items: 0,
        };
        state.phase = "tiebreak";
        return;
      }
    }
  }
  finishAll(state);
}

function finishAll(state: PlacementState): null {
  state.phase = "done";
  state.done = true;
  state.pending = undefined;
  state.confirm = undefined;
  state.tiebreak = undefined;
  return null;
}

/* ----------------------------------------------------------------- report */

export interface PlacementReportRow {
  strandId: string;
  strandName: string;
  level: number;
  status: StrandStatus;
  /** Counted accuracy at the placed level, when evidence exists. */
  accuracy?: number;
  /** Explanation hooks: raw estimate before caps, and the estimate path. */
  rawLevel?: number;
  cappedBy?: string;
  trajectory?: number[];
}

/**
 * Status from defined rules, not a raw percentage:
 *   Not started   prerequisites were below the floor; never probed
 *   Ready to Learn placed at the floor with no evidence at that level
 *   Mastered      at/above the age-expected grade, ≥90% at that level,
 *                 and confirmed above it (ceiling reached, or the grade
 *                 above was attempted)
 *   Strong        ≥80% at the placed level
 *   Developing    50–79%
 *   Practicing    <50%
 */
export function statusFor(probe: StrandProbe): StrandStatus {
  if (probe.gated) return "Not started";
  const level = probe.finalGrade ?? probe.floor;
  const t = probe.tallies[level];
  if (!t || t.correct + t.wrong === 0) return "Ready to Learn";
  const acc = t.correct / (t.correct + t.wrong);
  const above = probe.tallies[level + 1];
  const confirmedAbove = level >= probe.ceiling || Boolean(above && above.correct + above.wrong > 0);
  if (level >= probe.expected && acc >= STATUS_THRESHOLDS.mastered && confirmedAbove) return "Mastered";
  if (acc >= STATUS_THRESHOLDS.strong) return "Strong";
  if (acc >= STATUS_THRESHOLDS.developing) return "Developing";
  return "Practicing";
}

export function placementReport(state: PlacementState): PlacementReportRow[] {
  return state.order.map((id) => {
    const p = state.probes[id];
    const level = p.finalGrade ?? p.floor;
    const t = p.tallies[level];
    return {
      strandId: id,
      strandName: p.strandName,
      level,
      status: statusFor(p),
      accuracy: t && t.correct + t.wrong ? t.correct / (t.correct + t.wrong) : undefined,
      rawLevel: p.rawGrade,
      cappedBy: p.cappedBy,
      trajectory: p.trajectory,
    };
  });
}
