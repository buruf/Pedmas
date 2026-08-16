import type { Question, RawQuestion } from "./types";

export interface ValidationResult {
  ok: boolean;
  reasons: string[];
}

const FORMAT_PATTERNS: Record<string, RegExp> = {
  integer: /^-?\d+$/,
  decimal: /^-?\d+(\.\d+)?$/,
  fraction: /^-?\d+(\s+\d+\/\d+|\/\d+)?$/, // "3/4", "2 3/4", or integer
  text: /^.+$/,
  choice: /^.+$/,
};

/**
 * The gate between generation and students. A question failing any check
 * is rejected outright — never patched.
 */
export function validateRaw(q: RawQuestion): ValidationResult {
  const reasons: string[] = [];

  if (!q.prompt?.trim() && !q.instruction?.trim()) reasons.push("empty prompt");
  if (!q.answer?.toString().trim()) reasons.push("empty answer");
  if (!q.hint?.trim()) reasons.push("missing hint");
  if (!q.steps || q.steps.length < 1) reasons.push("missing worked steps");
  if (!q.concept?.trim()) reasons.push("missing key concept");

  const pat = FORMAT_PATTERNS[q.answerFormat];
  if (!pat) reasons.push(`unknown answer format ${q.answerFormat}`);
  else if (q.kind === "input" && !pat.test(q.answer.trim()))
    reasons.push(`answer "${q.answer}" does not match format ${q.answerFormat}`);

  if (q.kind === "mc") {
    if (!q.choices || q.choices.length < 3 || q.choices.length > 5)
      reasons.push("mc needs 3-5 choices");
    else {
      const set = new Set(q.choices.map((c) => c.trim()));
      if (set.size !== q.choices.length) reasons.push("duplicate choices");
      if (!q.choices.includes(q.answer)) reasons.push("answer not among choices");
    }
  }

  if (q.verify) {
    try {
      if (!q.verify()) reasons.push("independent verification failed");
    } catch {
      reasons.push("verification threw");
    }
  }

  // Unbalanced MathText markup would render as garbage. The instruction is
  // rendered through MathText too, so it is checked alongside the rest.
  for (const s of [q.instruction, q.prompt, ...(q.steps ?? [])]) {
    if (s && !balanced(s)) {
      reasons.push(`unbalanced markup in "${s.slice(0, 40)}"`);
      break;
    }
  }

  return { ok: reasons.length === 0, reasons };
}

function balanced(s: string): boolean {
  let curly = 0;
  let paren = 0;
  for (const ch of s) {
    if (ch === "{") curly++;
    else if (ch === "}") curly--;
    else if (ch === "(") paren++;
    else if (ch === ")") paren--;
    if (curly < 0 || paren < 0) return false;
  }
  return curly === 0 && paren === 0;
}

/**
 * Normalized key used for duplicate rejection within a question set.
 * Choices are included because many multiple-choice generators keep a fixed
 * prompt and vary the options — those are genuinely different questions.
 * They are sorted first so that merely reshuffling the same options still
 * counts as a duplicate.
 */
export function dedupKey(q: {
  instruction: string;
  prompt: string;
  choices?: string[];
}): string {
  const opts = q.choices ? [...q.choices].sort().join("~") : "";
  return `${q.instruction}|${q.prompt}|${opts}`.replace(/\s+/g, " ").trim().toLowerCase();
}

/** Normalize a student answer for grading. */
export function normalizeAnswer(input: string): string {
  let s = input.trim().toLowerCase().replace(/\s+/g, " ");
  s = s.replace(/^\$/, "").replace(/,/g, "");
  // "2 / 3" -> "2/3"
  s = s.replace(/\s*\/\s*/g, "/");
  // strip trailing period
  s = s.replace(/\.$/, "");
  // canonical decimals: ".5" -> "0.5", "3.50" -> "3.5", "4.0" -> "4"
  if (/^-?\d*\.?\d+$/.test(s)) {
    const n = Number(s);
    if (Number.isFinite(n)) s = String(n);
  }
  return s;
}

export function isCorrect(q: Question, input: string): boolean {
  const norm = normalizeAnswer(input);
  if (norm === normalizeAnswer(q.answer)) return true;
  return q.accept.some((a) => normalizeAnswer(a) === norm);
}
