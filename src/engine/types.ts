export type AnswerFormat = "integer" | "decimal" | "fraction" | "text" | "choice";
export type QKind = "input" | "mc";

/** A fully-formed, validated question served to a student. */
export interface Question {
  id: string;
  skillId: string;
  stage: number; // 1..5
  grade: number;
  strandId: string;
  strandName: string;
  topicName: string;
  kind: QKind;
  /** Short instruction line, e.g. "Add the fractions." */
  instruction: string;
  /** The mathematical content, MathText markup allowed. */
  prompt: string;
  choices?: string[];
  answer: string;
  accept: string[];
  answerFormat: AnswerFormat;
  /** Placeholder/format guidance for input questions. */
  answerHint?: string;
  hint: string;
  /** Worked solution, steps first — each entry is one step line. */
  steps: string[];
  concept: string;
  difficulty: number; // 1..10, structural
  representation: string;
}

/** What a generator family produces before metadata + validation. */
export interface RawQuestion {
  kind: QKind;
  instruction: string;
  prompt: string;
  choices?: string[];
  answer: string;
  accept?: string[];
  answerFormat: AnswerFormat;
  answerHint?: string;
  hint: string;
  steps: string[];
  concept: string;
  representation?: string;
  /**
   * Optional independent verification hook, run by the validation
   * engine. Must recompute the answer a different way and return true
   * only when it matches. Questions failing verification are rejected.
   */
  verify?: () => boolean;
}

export interface SkillRef {
  id: string;
  name: string;
  grade: number;
  strandId: string;
  strandName: string;
  family: string;
  params: Record<string, unknown>;
}

export interface GeneratorFamily {
  /** Generate one raw question for the skill at the given stage. */
  generate(skill: SkillRef, stage: number, rng: Rng): RawQuestion;
  /** Human label for what a stage covers, e.g. "Unlike denominators". */
  stageLabel(skill: SkillRef, stage: number): string;
}

export interface Rng {
  /** float in [0,1) */
  next(): number;
  /** integer in [lo, hi] inclusive */
  int(lo: number, hi: number): number;
  pick<T>(arr: readonly T[]): T;
  shuffle<T>(arr: readonly T[]): T[];
  /** n distinct elements */
  sample<T>(arr: readonly T[], n: number): T[];
  chance(p: number): boolean;
}
