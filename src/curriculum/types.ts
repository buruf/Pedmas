/**
 * Curriculum is pure data: Grade -> Strand -> Topic (skill).
 * Each topic binds to a generator family with parameters; every skill
 * has 5 progression stages defined structurally by its family.
 */

import type { FamilyKey } from "@/engine/families/keys";

export interface TopicDef {
  /** Display name, e.g. "Addition of Fractions". */
  name: string;
  /** Generator family key from the family registry. */
  family: FamilyKey;
  /** Family parameters controlling structural difficulty. */
  params?: Record<string, unknown>;
  /** Explicit prerequisite skill ids (overrides the default chain). */
  prereqs?: string[];
}

export interface StrandDef {
  /**
   * Canonical strand id used for placement/profile aggregation across
   * grades: number | operations | fractions | decimals | ratios |
   * algebra | functions | geometry | measurement | stats | trig | calculus
   */
  id: string;
  /** Display name for this grade, e.g. "Addition & Subtraction". */
  name: string;
  topics: TopicDef[];
}

export interface GradeDef {
  grade: number;
  strands: StrandDef[];
}

export interface Skill {
  id: string; // e.g. "g5.fractions.addition-of-fractions"
  name: string;
  grade: number;
  strandId: string;
  strandName: string;
  /** Position within the strand chain across all grades (0-based). */
  order: number;
  prereqs: string[];
  family: string;
  params: Record<string, unknown>;
}

export const STRAND_LABELS: Record<string, string> = {
  number: "Number Sense",
  operations: "Operations",
  fractions: "Fractions",
  decimals: "Decimals & Percent",
  ratios: "Ratios & Proportions",
  algebra: "Algebra",
  functions: "Functions",
  geometry: "Geometry",
  measurement: "Measurement",
  stats: "Statistics & Probability",
  trig: "Trigonometry",
  calculus: "Calculus & Vectors",
};

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function skillIdFor(grade: number, strandId: string, topicName: string): string {
  return `g${grade}.${strandId}.${slugify(topicName)}`;
}
