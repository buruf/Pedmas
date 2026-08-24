/**
 * Daily practice mixer: one grade at a time, one skill at a time.
 *
 * A learner works the skills of their current grade in curriculum order —
 * Grade 2 is Addition Within 100, then Addition Within 1,000, then
 * Regrouping — mastering each before the next begins. When every skill of
 * the grade is mastered, the next grade opens.
 *
 * A session is therefore any genuinely due spaced reviews, then the whole
 * rest of the sitting on that single skill. Review survives because it is
 * the opposite of a distraction: without it a mastered topic decays back to
 * unmastered, and "master it, then move on" quietly stops being true.
 */
import { allSkills, getSkill, nextSkillInStrand, strandChain, strandEntrySkill } from "@/curriculum";
import type { Skill } from "@/curriculum/types";
import { generateQuestion, generateErrorAnalysis } from "./generate";
import type { Question } from "./types";
import type { Region } from "@/lib/region";
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
    // No pointer yet — start at the placed level for this strand, NOT at the
    // beginning of the chain. Falling back to chain[0] served Grade 1 topics
    // ("Counting", "2D Shapes") to a student placed in Grade 10, because the
    // placement level was never consulted. A missing pointer happens on any
    // strand placement did not cover, so this path is reached in practice.
    const level = learner.strandLevels[strandId] ?? learner.grade;
    const entry = strandEntrySkill(strandId, level);
    if (entry) id = entry.id;
    else {
      const chain = strandChain(strandId);
      if (!chain.length) return undefined;
      id = chain[0].id;
    }
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

/**
 * The grade the learner is currently working through.
 *
 * A single number, not a level per strand. Placement decides where to
 * start; from then on the learner completes a whole grade before the next
 * one opens, which is how a curriculum is actually sequenced and how a
 * parent expects to read progress.
 *
 * Derived rather than stored: it is simply the earliest grade that still
 * has unmastered work, floored at where placement put the learner. That
 * keeps it self-correcting — nothing to migrate, and no stored pointer can
 * drift out of step with what has actually been mastered.
 */
export function currentGradeFor(learner: LearnerState): number {
  const levels = Object.values(learner.strandLevels);
  // The weakest area sets the floor: a grade is not finished until every
  // strand in it is. Anything the learner already proved is marked mastered
  // by placement, so stronger strands are skipped rather than repeated.
  const floor = levels.length ? Math.min(...levels) : learner.grade;
  for (const skill of allSkills()) {
    if (skill.grade < floor) continue;
    if (!learner.skills[skill.id]?.mastered) return skill.grade;
  }
  return 12;
}

/** Every skill of a grade, in the order the curriculum teaches them. */
export function skillsInGrade(grade: number): Skill[] {
  return allSkills().filter((s) => s.grade === grade);
}

/** How far through the current grade the learner is. */
export function gradeProgress(learner: LearnerState): { grade: number; mastered: number; total: number } {
  const grade = currentGradeFor(learner);
  const skills = skillsInGrade(grade);
  return {
    grade,
    mastered: skills.filter((s) => learner.skills[s.id]?.mastered).length,
    total: skills.length,
  };
}

export interface FocusChoice {
  skill: Skill;
  /** True when this is a prerequisite pulled in because the next skill is struggling. */
  isRepair: boolean;
}

/**
 * The one skill today is about: the next unmastered skill of the current
 * grade, in curriculum order.
 *
 * So a learner starting Grade 2 works Addition Within 100, masters it, then
 * Addition Within 1,000, and so on until Grade 2 is finished — then Grade 3
 * opens. One thing at a time, in the order the subject is actually built.
 */
export function focusSkillFor(learner: LearnerState): FocusChoice | undefined {
  const grade = currentGradeFor(learner);
  for (const skill of skillsInGrade(grade)) {
    if (learner.skills[skill.id]?.mastered) continue;
    // A struggling skill means its prerequisite is the real work. Still one
    // topic — just the right one.
    const state = stateFor(learner, skill.id);
    if (state.needsRepair && skill.prereqs[0]) {
      const prereq = getSkill(skill.prereqs[0]);
      if (prereq && !stateFor(learner, prereq.id).mastered) return { skill: prereq, isRepair: true };
    }
    return { skill, isRepair: false };
  }
  return undefined;
}

export function buildPracticeSession(
  learner: LearnerState,
  opts: { now: number; seed: number; size?: number; region?: Region }
): SessionItem[] {
  const { now, seed } = opts;
  // Session length is a learning preference (spec §2); some children need a
  // shorter sitting, and a short finished session beats a long abandoned one.
  const SIZE = opts.size ?? SESSION_SIZE;
  const avoid = new Set<string>();
  const items: SessionItem[] = [];
  let seedStep = 0;
  const gen = (skill: Skill, stage: number): Question | null => {
    try {
      return generateQuestion(skill, stage, { seed: seed + seedStep++ * 104729, avoid, region: opts.region });
    } catch {
      return null;
    }
  };
  const push = (skill: Skill | undefined, stage: number, purpose: QuestionPurpose, isReview = false): boolean => {
    if (!skill || items.length >= SIZE) return false;
    const q = gen(skill, Math.max(1, Math.min(5, stage)));
    if (!q) return false;
    items.push({ question: q, purpose, isReview });
    return true;
  };

  // Spaced review first, and only what is genuinely due. These are skills
  // already mastered, so they are not "another topic to learn" — they are
  // what stops a mastered topic quietly decaying back to unmastered. Capped
  // at two so the day still belongs to the one thing being learned.
  const due = reviewsDue(Object.values(learner.skills), now).slice(0, 2);
  for (const st of due) push(getSkill(st.skillId), 4, "Review", true);

  // Everything else is one topic, carried until it is mastered.
  const focus = focusSkillFor(learner);
  if (focus) {
    const { skill, isRepair } = focus;
    const st = stateFor(learner, skill.id);

    // Judging someone else's working is a different act from computing, and
    // it targets the same misconception this skill's lesson teaches against.
    // Same topic, so it belongs here — but only once the procedure is known.
    if (st.stage >= 3) {
      const err = generateErrorAnalysis(skill, { seed: seed + seedStep++ * 104729, avoid });
      if (err && items.length < SIZE) {
        items.push({ question: err, purpose: "Spot the mistake", isReview: false });
      }
    }

    // Fill the rest of the sitting from this one skill.
    //
    // A single skill+stage does not hold twelve distinct questions, so when
    // the current stage is exhausted the session widens to the neighbouring
    // stages of the *same* skill — easier ones first, which consolidates
    // rather than escalates. That keeps the day on one topic while giving it
    // enough variety to be worth twelve questions.
    const purpose: QuestionPurpose = isRepair ? "Skill builder" : "Current skill";
    const ladder = [st.stage, st.stage - 1, st.stage + 1, st.stage - 2, st.stage + 2].filter(
      (n, i, all) => n >= 1 && n <= 5 && all.indexOf(n) === i
    );
    for (const stage of ladder) {
      // Ask until this stage stops yielding anything new, then step along.
      while (items.length < SIZE && push(skill, stage, purpose)) {
        /* keep filling */
      }
      if (items.length >= SIZE) break;
    }

    // Still short only if the whole skill has fewer distinct questions than a
    // session. Repeating a question the child has already seen today beats
    // handing them a half-length session, so allow duplicates as a last step.
    if (items.length < SIZE) {
      avoid.clear();
      let guard = 0;
      while (items.length < SIZE && guard++ < SIZE * 2) {
        if (!push(skill, st.stage, purpose)) break;
      }
    }
  }

  return items;
}
