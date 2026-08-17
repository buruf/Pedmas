/**
 * Which lesson teaches a given skill.
 *
 * Lessons are written per generator family rather than per topic, because the
 * family already encodes the mathematics and its stage progression. One
 * well-made lesson on regrouping therefore serves "Regrouping" in Grade 2 and
 * "Multi-digit Addition" in Grade 4 alike.
 *
 * Pure module with no React, so both the server (deciding whether to offer a
 * lesson) and the client (rendering it) can use the same mapping.
 */
export const LESSON_KEYS = [
  // Foundational spine — where struggling children actually sit.
  "place-value",
  "make-ten",
  "subtract-ten",
  "mult-meaning",
  "div-meaning",
  "frac-meaning",
  // Decimals and percent.
  "dec-place-value",
  "dec-compare",
  "dec-add-sub",
  "percent-basics",
  "dec-mul",
  "dec-div",
  "percent-change",
  // Building on it.
  "add-regroup",
  "sub-regroup",
  "mult-2digit",
  "div-2digit",
  "frac-equivalent",
  "frac-compare",
  "frac-mul",
  "frac-div",
  "mixed-numbers",
  "frac-add",
] as const;

export type LessonKey = (typeof LESSON_KEYS)[number];

export const LESSON_TITLES: Record<LessonKey, string> = {
  "place-value": "What the digits in a number mean",
  "make-ten": "Making ten to add",
  "subtract-ten": "Jumping back to ten to subtract",
  "mult-meaning": "Multiplying is counting equal groups",
  "div-meaning": "Dividing is sharing into equal groups",
  "frac-meaning": "What a fraction really means",
  "dec-place-value": "What the numbers after the point mean",
  "dec-compare": "Which decimal is bigger?",
  "dec-add-sub": "Adding decimals: line up the point",
  "percent-basics": "What percent actually means",
  "dec-mul": "Multiplying by less than one",
  "dec-div": "Dividing by less than one",
  "percent-change": "Percent changes in the real world",
  "add-regroup": "Adding when the ones spill over",
  "sub-regroup": "Subtracting when you haven't got enough ones",
  "mult-2digit": "Multiplying a 2-digit number",
  "div-2digit": "Sharing when the tens don't split evenly",
  "frac-equivalent": "Different fractions, same amount",
  "frac-compare": "Which fraction is bigger?",
  "frac-mul": "Multiplying fractions means of",
  "frac-div": "Dividing by a fraction",
  "mixed-numbers": "Whole numbers and fractions together",
  "frac-add": "Adding fractions when the bottoms are different",
};

/**
 * The lesson for a skill, or null when none has been written yet. Families
 * without a lesson still get "Show me how" during practice, which works
 * everywhere because every generated question carries worked steps.
 */
export function lessonKeyForSkill(
  family: string,
  params: Record<string, unknown> = {}
): LessonKey | null {
  const op = typeof params.op === "string" ? params.op : undefined;
  // "add" and "mixed" both start from the addition trade, which subtraction
  // then reverses — so mixed practice is introduced by the addition lesson.
  const byOp = (): LessonKey => (op === "sub" ? "sub-regroup" : "add-regroup");

  if (family === "add-sub") {
    const max = typeof params.max === "number" ? params.max : 0;
    // Column regrouping only applies once sums run past 100. Between ten and
    // there, the idea that matters is bridging through ten — a different
    // lesson. Below ten there is no crossing at all, so nothing to teach yet.
    if (max >= 100) return byOp();
    if (max > 10) return op === "sub" ? "subtract-ten" : "make-ten";
    return null;
  }
  if (family === "place-value") return "place-value";
  if (family === "dec-place-value") return "dec-place-value";
  if (family === "dec-compare") return "dec-compare";
  if (family === "dec-add-sub" || family === "money") return "dec-add-sub";
  if (family === "percent-basic") return "percent-basics";
  if (family === "dec-mul") return "dec-mul";
  if (family === "dec-div") return "dec-div";
  if (family === "percent-apps" || family === "interest") return "percent-change";
  if (family === "mult-facts") return "mult-meaning";
  if (family === "div-facts") return "div-meaning";
  if (family === "frac-identify") return "frac-meaning";
  if (family === "frac-equivalent" || family === "frac-simplify") return "frac-equivalent";
  if (family === "frac-compare") return "frac-compare";
  if (family === "frac-mul" || family === "frac-of-number") return "frac-mul";
  if (family === "frac-div") return "frac-div";
  if (family === "mixed-number-ops") return "mixed-numbers";
  if (family === "multi-digit") {
    const digits = typeof params.digits === "number" ? params.digits : 2;
    return digits >= 2 ? byOp() : null;
  }
  if (family === "mult-multi") return "mult-2digit";
  if (family === "long-division") return "div-2digit";
  if (family === "frac-add-sub") return "frac-add";
  return null;
}
