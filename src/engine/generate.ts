import type { Question, Rng, SkillRef } from "./types";
import type { Skill } from "@/curriculum/types";
import { FAMILIES } from "./families";
import { validateRaw, dedupKey } from "./validate";
import { makeRng, randomSeed } from "./rng";
import { errorAnalysisFor, hasErrorAnalysis } from "./errorAnalysis";

const MAX_ATTEMPTS = 40;

export class GenerationError extends Error {}

function toRef(skill: Skill): SkillRef {
  return {
    id: skill.id,
    name: skill.name,
    grade: skill.grade,
    strandId: skill.strandId,
    strandName: skill.strandName,
    family: skill.family,
    params: skill.params,
  };
}

/** Structural difficulty score: grade band + stage within skill. */
function difficultyOf(skill: Skill, stage: number): number {
  const gradeBand = Math.ceil(skill.grade / 3); // 1..4
  return Math.min(10, gradeBand * 2 + stage - 1);
}

/**
 * Generate one validated question. Rejected candidates are regenerated,
 * never patched. `avoid` holds dedup keys already used in this set.
 */
export function generateQuestion(
  skill: Skill,
  stage: number,
  opts: { seed?: number; avoid?: Set<string> } = {}
): Question {
  const family = FAMILIES[skill.family];
  if (!family) {
    throw new GenerationError(`No generator family "${skill.family}" for ${skill.id}`);
  }
  const st = Math.max(1, Math.min(5, stage));
  const avoid = opts.avoid ?? new Set<string>();
  let seed = opts.seed ?? randomSeed();
  let lastReasons: string[] = [];

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const rng = makeRng(seed + attempt * 7919);
    const raw = family.generate(toRef(skill), st, rng);
    const res = validateRaw(raw);
    if (!res.ok) {
      lastReasons = res.reasons;
      continue;
    }
    const key = dedupKey(raw);
    if (avoid.has(key)) continue;
    avoid.add(key);
    const { verify: _verify, ...pub } = raw;
    return {
      id: `${skill.id}.s${st}.${(seed + attempt * 7919) >>> 0}`,
      skillId: skill.id,
      stage: st,
      grade: skill.grade,
      strandId: skill.strandId,
      strandName: skill.strandName,
      topicName: skill.name,
      accept: [],
      representation: "numeric",
      ...pub,
      difficulty: difficultyOf(skill, st),
    };
  }
  throw new GenerationError(
    `Could not generate a valid question for ${skill.id} stage ${st}: ${lastReasons.join("; ")}`
  );
}

/**
 * Generate an error-analysis question for a skill (spec §11): someone else's
 * wrong working, shown for judgement. Returns null when the family has no
 * case written, or when nothing valid could be produced.
 */
export function generateErrorAnalysis(
  skill: Skill,
  opts: { seed?: number; avoid?: Set<string> } = {}
): Question | null {
  if (!hasErrorAnalysis(skill.family)) return null;
  const avoid = opts.avoid ?? new Set<string>();
  const seed = opts.seed ?? randomSeed();

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const rng = makeRng(seed + attempt * 7919);
    const raw = errorAnalysisFor(toRef(skill), rng);
    if (!raw) return null;
    if (!validateRaw(raw).ok) continue;
    const key = dedupKey(raw);
    if (avoid.has(key)) continue;
    avoid.add(key);
    const { verify: _verify, ...pub } = raw;
    return {
      id: `${skill.id}.err.${(seed + attempt * 7919) >>> 0}`,
      skillId: skill.id,
      // Judging a method is a stage-4 act: it needs the procedure known first.
      stage: 4,
      grade: skill.grade,
      strandId: skill.strandId,
      strandName: skill.strandName,
      topicName: skill.name,
      accept: [],
      representation: "error-analysis",
      ...pub,
      difficulty: difficultyOf(skill, 4),
    };
  }
  return null;
}

/**
 * Generate a set of distinct validated questions for one skill+stage.
 * If a skill+stage has fewer distinct questions than requested, a repeat is
 * served rather than failing the session — practice must never break.
 */
export function generateSet(skill: Skill, stage: number, count: number, seed?: number): Question[] {
  const avoid = new Set<string>();
  const out: Question[] = [];
  const base = seed ?? randomSeed();
  for (let i = 0; i < count; i++) {
    try {
      out.push(generateQuestion(skill, stage, { seed: base + i * 104729, avoid }));
    } catch (err) {
      if (!(err instanceof GenerationError)) throw err;
      out.push(generateQuestion(skill, stage, { seed: base + i * 104729 }));
    }
  }
  return out;
}

export function stageLabelFor(skill: Skill, stage: number): string {
  const family = FAMILIES[skill.family];
  if (!family) return `Stage ${stage}`;
  return family.stageLabel(toRef(skill), stage);
}
