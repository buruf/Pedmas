/**
 * Daily practice mixer. Builds a personalized ~12-question session:
 *   1. current learning skill (focus strand gets the deepest block)
 *   2. skills close to mastery in other strands
 *   3. fluency
 *   4. spaced review that is due
 *   5. prerequisite repair when a skill is struggling
 */
import { getSkill, nextSkillInStrand, strandChain } from "@/curriculum";
import type { Skill } from "@/curriculum/types";
import { generateQuestion, generateErrorAnalysis } from "./generate";
import type { Question } from "./types";
import { newSkillState, reviewsDue, type SkillState } from "./mastery";

export const SESSION_SIZE = 12;

export type QuestionPurpose =
  | "Current skill"
  | "Practice"
  | "Fluency"
  | "Review"
  | "Skill builder"
  | "Spot the mistake";

export interface SessionItem {
  question: Question;
  purpose: QuestionPurpose;
  isReview: boolean;
}

export interface LearnerState {
  grade: number;
  strandLevels: Record<string, number>;
  pointers: Record<string, string>;
  skills: Record<string, SkillState>;
}

function stateFor(learner: LearnerState, skillId: string): SkillState {
  return (learner.skills[skillId] ??= newSkillState(skillId));
}

/** Advance the strand pointer past mastered skills. */
export function currentSkillFor(learner: LearnerState, strandId: string): Skill | undefined {
  let id = learner.pointers[strandId];
  if (!id) {
    const chain = strandChain(strandId);
    if (!chain.length) return undefined;
    id = chain[0].id;
  }
  let skill = getSkill(id);
  let guard = 0;
  while (skill && stateFor(learner, skill.id).mastered && guard++ < 500) {
    const next = nextSkillInStrand(skill.id);
    if (!next) break;
    learner.pointers[strandId] = next.id;
    skill = next;
  }
  return skill;
}

/** The strand that needs the most attention gets the focus block. */
export function focusStrand(learner: LearnerState, dayIndex: number): string | undefined {
  const ids = Object.keys(learner.strandLevels);
  if (!ids.length) return undefined;
  const sorted = [...ids].sort(
    (a, b) => (learner.strandLevels[a] ?? learner.grade) - (learner.strandLevels[b] ?? learner.grade)
  );
  // Weakest strand leads most days; rotate so nothing goes stale.
  return dayIndex % 3 === 2 ? sorted[(dayIndex / 3) % sorted.length | 0] : sorted[0];
}

export function buildPracticeSession(
  learner: LearnerState,
  opts: { now: number; seed: number }
): SessionItem[] {
  const { now, seed } = opts;
  const avoid = new Set<string>();
  const items: SessionItem[] = [];
  let seedStep = 0;
  const gen = (skill: Skill, stage: number): Question | null => {
    try {
      return generateQuestion(skill, stage, { seed: seed + seedStep++ * 104729, avoid });
    } catch {
      return null;
    }
  };
  const push = (skill: Skill | undefined, stage: number, purpose: QuestionPurpose, isReview = false) => {
    if (!skill || items.length >= SESSION_SIZE) return;
    const q = gen(skill, Math.max(1, Math.min(5, stage)));
    if (q) items.push({ question: q, purpose, isReview });
  };

  // 4. Due spaced reviews (max 2 up front).
  const due = reviewsDue(Object.values(learner.skills), now).slice(0, 2);
  for (const st of due) push(getSkill(st.skillId), 4, "Review", true);

  // 5. Prerequisite repair: struggling skills bring in their prerequisite.
  const repairs = Object.values(learner.skills).filter((s) => s.needsRepair && !s.mastered).slice(0, 1);
  for (const st of repairs) {
    const skill = getSkill(st.skillId);
    const prereq = skill?.prereqs[0] ? getSkill(skill.prereqs[0]) : undefined;
    if (prereq) push(prereq, 3, "Skill builder");
  }

  // 1. Focus strand block.
  const dayIndex = Math.floor(now / (24 * 60 * 60 * 1000));
  const focus = focusStrand(learner, dayIndex);
  const strandIds = Object.keys(learner.strandLevels);
  if (focus) {
    const skill = currentSkillFor(learner, focus);
    if (skill) {
      const st = stateFor(learner, skill.id);
      for (let i = 0; i < 4; i++) push(skill, st.stage, "Current skill");

      // Judging someone else's working is a different act from computing, and
      // it targets the same misconception the skill's lesson teaches against.
      // Only once the procedure is known — stage 3 onwards.
      if (st.stage >= 3) {
        const err = generateErrorAnalysis(skill, {
          seed: seed + seedStep++ * 104729,
          avoid,
        });
        if (err && items.length < SESSION_SIZE) {
          items.push({ question: err, purpose: "Spot the mistake", isReview: false });
        }
      }
    }
  }

  // 2. Other strands, round-robin by need.
  const others = strandIds.filter((s) => s !== focus);
  others.sort((a, b) => (learner.strandLevels[a] ?? 0) - (learner.strandLevels[b] ?? 0));
  let round = 0;
  while (items.length < SESSION_SIZE - 1 && round < 3 && others.length) {
    for (const sid of others) {
      if (items.length >= SESSION_SIZE - 1) break;
      const skill = currentSkillFor(learner, sid);
      if (!skill) continue;
      const st = stateFor(learner, skill.id);
      push(skill, st.stage, "Practice");
    }
    round++;
  }

  // 3. One fluency question from an earlier operations skill.
  const opsChain = strandChain("operations").filter((s) => s.grade <= learner.grade);
  const fluencySkill = opsChain.length ? opsChain[Math.max(0, opsChain.length - 3)] : undefined;
  push(fluencySkill, 2, "Fluency");

  // Fill any remaining slots from the focus strand.
  let guard = 0;
  while (items.length < SESSION_SIZE && guard++ < 20) {
    const sid = focus ?? strandIds[guard % Math.max(1, strandIds.length)];
    const skill = sid ? currentSkillFor(learner, sid) : undefined;
    if (!skill) break;
    push(skill, stateFor(learner, skill.id).stage, "Practice");
  }
  return items;
}
