/**
 * Derives the structural difficulty metadata attached to every question
 * (spec §10).
 *
 * Nothing here is estimated. Each field is read off the question text or the
 * curriculum position, so the answer to "why is this one harder?" is always
 * checkable — which is the whole point of the section: difficulty must be
 * represented structurally, never asserted.
 */
import type { QuestionMetadata, RawQuestion } from "./types";
import type { Skill } from "@/curriculum/types";

/** Strip MathText markup so the numbers can be read plainly. */
function plain(text: string): string {
  return text
    .replace(/\{([^/}]+)\/([^}]+)\}/g, "$1 / $2")
    .replace(/[\^_]\{([^}]*)\}/g, "$1")
    .replace(/sqrt\(([^)]*)\)/g, "$1");
}

function numbersIn(text: string): number[] {
  return (plain(text).match(/\d+(?:\.\d+)?/g) ?? []).map(Number).filter((n) => Number.isFinite(n));
}

/** Denominators of any {a/b} fractions in the prompt. */
function denominators(text: string): number[] {
  const out: number[] = [];
  const re = /\{[^/}]+\/([^}]+)\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const d = Number(m[1].trim());
    if (Number.isFinite(d)) out.push(d);
  }
  return out;
}

/**
 * How many operations the student has to carry out.
 *
 * Fractions are collapsed to a single token first, because the bar in {3/4}
 * is notation rather than a division the child performs — counting it made
 * "{3/4} + {3/5}" look like two operations while missing the actual plus.
 * A leading minus stays attached to its number, so −24 + 31 is one operation.
 */
function countOperations(prompt: string): number {
  const tokens = prompt
    .replace(/\{[^}]*\}/g, "F")
    .replace(/[\^_]\{[^}]*\}/g, "")
    .split(/\s+/);
  return tokens.filter((t) => /^[+×÷*/−-]$/.test(t)).length;
}

/**
 * Cognitive demand, 1..5. Rises with the stage, and again when the task asks
 * for something beyond computing — judging a method, or reading a model.
 */
function cognitiveComplexity(stage: number, representation: string, kind: string): number {
  let score = Math.max(1, Math.min(5, stage));
  // Judging someone else's working is a step above running a procedure.
  if (representation === "error-analysis") score += 1;
  // Reading a picture or a word problem adds interpretation on top.
  else if (representation === "word" || representation === "visual") score += 0.5;
  // A multiple choice question supplies the candidates, which lightens it.
  if (kind === "mc") score -= 0.5;
  return Math.max(1, Math.min(5, Math.round(score)));
}

export function deriveMetadata(
  raw: RawQuestion,
  skill: Skill,
  stage: number,
  stageLabel: string
): QuestionMetadata {
  const text = `${raw.instruction} ${raw.prompt}`;
  const nums = numbersIn(text);
  const dens = denominators(raw.prompt);
  const bare = plain(text);

  return {
    prerequisites: skill.prereqs,
    numberSize: nums.length ? Math.max(...nums) : 0,
    operationCount: countOperations(raw.prompt),
    fractionComplexity: dens.length ? Math.max(...dens) : 0,
    numericalComplexity: {
      decimals: /\d\.\d/.test(bare),
      negatives: /[−-]\s?\d/.test(raw.prompt),
      variables: /\b[a-z]\b/.test(raw.prompt.replace(/\b(a|i|of|in|is|to|at|by|on)\b/g, "")),
    },
    cognitiveComplexity: cognitiveComplexity(stage, raw.representation ?? "numeric", raw.kind),
    expectedMethod: stageLabel,
  };
}
