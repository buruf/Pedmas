/**
 * Mastery engine: Learn -> Practice -> Fluency -> Master -> Advance.
 * A skill has 5 progression stages. Students advance a stage on demonstrated
 * accuracy (mostly first-try, low hint use) and master the skill after
 * stage 5 plus multi-session consistency. Mastered skills enter spaced
 * review; a failed review returns the skill to active practice.
 */
import { getSkill, stageCapOf } from "@/curriculum";

export interface AttemptRecord {
  ts: number;
  stage: number;
  correct: boolean; // correct on first try
  eventuallyCorrect: boolean;
  usedHint: boolean;
  sessionId: string;
  /** Time on the question, capped upstream so a break is not counted. */
  elapsedMs?: number;
}

/**
 * Families where mastery includes SPEED, not just accuracy (spec §13:
 * "speed/fluency where appropriate").
 *
 * Appropriate means fact recall: number facts a child will lean on in every
 * later skill. A child solving 7×8 by repeated addition can be perfectly
 * accurate, but that strategy collapses under the load of long division —
 * accuracy alone would call this mastered and set them up to struggle.
 * Everywhere else, thinking time is legitimate and speed is NOT judged:
 * a geometry proof taken slowly is diligence, not weakness.
 */
export const FLUENCY_FAMILIES = new Set([
  "fact-family",
  "mental-math",
  "mult-facts",
  "div-facts",
  "add-sub",
]);

/** Median time of recent correct answers must come in under this. */
export const FLUENT_MS = 15_000;

/**
 * Fluency verdict over the recent window. Fails OPEN when timings are
 * missing (attempts recorded before timing existed) — an engine change
 * must never retroactively lock a learner who was doing fine.
 */
export function isFluent(family: string, recent: AttemptRecord[]): boolean {
  if (!FLUENCY_FAMILIES.has(family)) return true;
  const timed = recent.filter((a) => a.correct && typeof a.elapsedMs === "number");
  if (timed.length < 2) return true;
  const times = timed.map((a) => a.elapsedMs!).sort((x, y) => x - y);
  const median = times[Math.floor(times.length / 2)];
  return median <= FLUENT_MS;
}

export interface ReviewState {
  due: number; // epoch ms
  intervalIndex: number; // index into REVIEW_INTERVALS
}

export interface SkillState {
  skillId: string;
  stage: number; // current working stage 1..5
  stageMastered: number; // highest stage cleared, 0..5
  attempts: AttemptRecord[]; // bounded window
  mastered: boolean;
  masteredAt?: number;
  /** Set when placement inferred mastery without direct practice. */
  assumed?: boolean;
  review?: ReviewState;
  /** Set when a failed review or repeated struggle sends it back. */
  needsRepair?: boolean;
}

export const REVIEW_INTERVALS_DAYS = [2, 7, 21, 60];
const DAY = 24 * 60 * 60 * 1000;
const WINDOW = 30; // attempts kept per skill

export function newSkillState(skillId: string, stage = 1): SkillState {
  return { skillId, stage, stageMastered: stage - 1, attempts: [], mastered: false };
}

export function assumedMastered(skillId: string, now: number): SkillState {
  return {
    skillId,
    stage: 5,
    stageMastered: 5,
    attempts: [],
    mastered: true,
    masteredAt: now,
    assumed: true,
    review: { due: now + 7 * DAY, intervalIndex: 1 },
  };
}

export interface AttemptOutcome {
  stageAdvanced: boolean;
  skillMastered: boolean;
  returnedToPractice: boolean;
}

/**
 * Record one practice attempt and apply stage/mastery transitions.
 * Mutates and returns the state.
 */
export function recordAttempt(
  state: SkillState,
  attempt: AttemptRecord,
  opts: { isReview?: boolean } = {}
): AttemptOutcome {
  const outcome: AttemptOutcome = {
    stageAdvanced: false,
    skillMastered: false,
    returnedToPractice: false,
  };
  state.attempts.push(attempt);
  if (state.attempts.length > WINDOW) state.attempts.splice(0, state.attempts.length - WINDOW);

  // A skill may scope out the top of its family's ladder (stageCapOf); a
  // state left above the cap — e.g. after a curriculum change — would never
  // match its own attempts again, so clamp on entry.
  const cap = stageCapOf(getSkill(state.skillId));
  if (state.stage > cap) state.stage = cap;

  if (opts.isReview && state.mastered) {
    if (attempt.correct) {
      const idx = Math.min((state.review?.intervalIndex ?? 0) + 1, REVIEW_INTERVALS_DAYS.length - 1);
      state.review = { due: attempt.ts + REVIEW_INTERVALS_DAYS[idx] * DAY, intervalIndex: idx };
    } else {
      // Retention slipped: back to active practice at a late stage.
      state.mastered = false;
      state.needsRepair = true;
      state.stage = Math.min(4, cap);
      state.stageMastered = Math.min(state.stageMastered, state.stage - 1);
      state.review = undefined;
      outcome.returnedToPractice = true;
    }
    return outcome;
  }

  const atStage = state.attempts.filter((a) => a.stage === state.stage);
  const recent = atStage.slice(-6);
  const firstTry = recent.filter((a) => a.correct).length;
  const hints = recent.filter((a) => a.usedHint).length;
  const distinctSessions = new Set(atStage.filter((a) => a.correct).map((a) => a.sessionId));

  const enough = recent.length >= 4;
  const accurate = firstTry >= Math.max(3, Math.ceil(recent.length * 0.8));
  const independent = hints <= 1;
  // Fact-recall skills must also be QUICK: right-but-slow means the child
  // is deriving, not recalling, and the strategy collapses under later
  // skills that lean on these facts. Other families ignore timing entirely.
  const family = getSkill(state.skillId)?.family ?? "";
  const fluent = isFluent(family, recent);

  if (enough && accurate && independent && fluent) {
    state.stageMastered = Math.max(state.stageMastered, state.stage);
    if (state.stage < cap) {
      state.stage += 1;
      outcome.stageAdvanced = true;
    } else {
      // Final stage cleared — mastery needs consistency across sessions.
      const lateSessions = new Set(
        state.attempts.filter((a) => a.stage >= Math.max(1, cap - 1) && a.correct).map((a) => a.sessionId)
      );
      if (lateSessions.size >= 2 || distinctSessions.size >= 2) {
        state.mastered = true;
        state.needsRepair = false;
        state.masteredAt = attempt.ts;
        state.review = { due: attempt.ts + REVIEW_INTERVALS_DAYS[0] * DAY, intervalIndex: 0 };
        outcome.skillMastered = true;
      }
    }
  }

  // Persistent struggle at a stage drops back one stage (prerequisite help
  // is handled by the practice mixer via needsRepair).
  const recentMisses = recent.filter((a) => !a.eventuallyCorrect).length;
  if (recent.length >= 5 && firstTry <= 1 && recentMisses >= 3 && state.stage > 1) {
    state.stage -= 1;
    state.needsRepair = true;
  }

  return outcome;
}

/** Progress within the current skill, 0..100, for UI bars. */
export function skillProgress(state: SkillState): number {
  if (state.mastered) return 100;
  const cap = stageCapOf(getSkill(state.skillId));
  const base = (Math.min(state.stageMastered, cap) / cap) * 100;
  const atStage = state.attempts.filter((a) => a.stage === state.stage).slice(-6);
  const partial = atStage.length
    ? (atStage.filter((a) => a.correct).length / 6) * (100 / cap)
    : 0;
  return Math.min(99, Math.round(base + partial));
}

export function reviewsDue(states: SkillState[], now: number): SkillState[] {
  return states
    .filter((s) => s.mastered && s.review && s.review.due <= now)
    .sort((a, b) => (a.review!.due - b.review!.due));
}
