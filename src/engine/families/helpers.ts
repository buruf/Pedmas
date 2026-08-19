import type { RawQuestion, Rng } from "../types";

/**
 * Build a set of MC choices: correct answer + plausible distractors.
 * Extra candidates beyond `count-1` distinct distractors are dropped;
 * throws if not enough distinct distractors could be built.
 */
export function mcChoices(
  rng: Rng,
  answer: string,
  distractors: string[],
  count = 4
): string[] {
  const seen = new Set([answer.trim()]);
  const keep: string[] = [];
  for (const d of distractors) {
    const t = d.trim();
    if (!t || seen.has(t)) continue;
    seen.add(t);
    keep.push(t);
    if (keep.length >= count - 1) break;
  }
  if (keep.length < 2) {
    // Validator requires >=3 total choices; signal rejection upstream by
    // returning too-few choices (validateRaw rejects it).
    return [answer, ...keep];
  }
  return rng.shuffle([answer, ...keep]);
}

/** Numeric distractors near a value (never equal to it). */
export function nearNumbers(answer: number, spread = 3): string[] {
  const deltas = [1, -1, 2, -2, spread, -spread, spread + 2, 10, -10];
  return deltas.map((d) => String(answer + d)).filter((s) => s !== String(answer));
}

export function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export const NAMES = [
  "Emma",
  "Liam",
  "Ava",
  "Noah",
  "Maya",
  "Omar",
  "Sofia",
  "Amir",
  "Lily",
  "Jayden",
  "Fatima",
  "Lucas",
] as const;

export const OBJECTS = [
  "apples",
  "marbles",
  "stickers",
  "books",
  "pencils",
  "shells",
  "coins",
  "cards",
  "blocks",
  "oranges",
] as const;

export function pickName(rng: Rng): string {
  return rng.pick(NAMES);
}

export function pickObject(rng: Rng): string {
  return rng.pick(OBJECTS);
}

/** Convenience constructor with defaults for input questions. */
export function inputQ(q: {
  instruction: string;
  prompt: string;
  answer: string;
  answerFormat?: RawQuestion["answerFormat"];
  accept?: string[];
  answerHint?: string;
  hint: string;
  steps: string[];
  concept: string;
  representation?: string;
  verify?: () => boolean;
}): RawQuestion {
  return {
    kind: "input",
    answerFormat: q.answerFormat ?? "integer",
    ...q,
  };
}

/** Convenience constructor for multiple-choice questions. */
export function mcQ(q: {
  instruction: string;
  prompt: string;
  choices: string[];
  answer: string;
  hint: string;
  steps: string[];
  concept: string;
  representation?: string;
  verify?: () => boolean;
}): RawQuestion {
  return {
    kind: "mc",
    answerFormat: "choice",
    ...q,
  };
}

/**
 * Region-aware unit labels.
 *
 * These are labels only. A rectangle 7 by 4 has area 28 whichever unit is
 * named, and a 13-unit ladder reaches the same height, so swapping the word
 * is safe. Anywhere a conversion factor is involved — unit conversion, scale
 * drawings — the generator must build the right system from the start
 * instead, because 5 cm is not 5 inches.
 */
export function lenU(params: Record<string, unknown>): string {
  return params.region === "US" ? "in" : "cm";
}

/** Large lengths: ladders, buildings, fields. */
export function bigLenU(params: Record<string, unknown>): string {
  return params.region === "US" ? "ft" : "m";
}

/** Road distances. */
export function distU(params: Record<string, unknown>): string {
  return params.region === "US" ? "mi" : "km";
}

/** Speed to match distU. */
export function speedU(params: Record<string, unknown>): string {
  return params.region === "US" ? "mph" : "km/h";
}

/** Long form of a unit label, for instructions like "in square inches". */
export function unitLong(u: string): string {
  switch (u) {
    case "in":
      return "inches";
    case "ft":
      return "feet";
    case "m":
      return "metres";
    case "mi":
      return "miles";
    case "km":
      return "kilometres";
    default:
      return "centimetres";
  }
}
