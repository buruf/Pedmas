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
  "add-regroup",
  "sub-regroup",
  "mult-2digit",
  "div-2digit",
  "frac-add",
] as const;

export type LessonKey = (typeof LESSON_KEYS)[number];

export const LESSON_TITLES: Record<LessonKey, string> = {
  "add-regroup": "Adding when the ones spill over",
  "sub-regroup": "Subtracting when you haven't got enough ones",
  "mult-2digit": "Multiplying a 2-digit number",
  "div-2digit": "Sharing when the tens don't split evenly",
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
    // These lessons teach regrouping. "Addition Within 5" involves no trade at
    // all, so offering it there would teach a rule the child does not need yet
    // and cannot see the point of. Only sums that can pass ten qualify.
    const max = typeof params.max === "number" ? params.max : 0;
    return max >= 100 ? byOp() : null;
  }
  if (family === "multi-digit") {
    const digits = typeof params.digits === "number" ? params.digits : 2;
    return digits >= 2 ? byOp() : null;
  }
  if (family === "mult-multi") return "mult-2digit";
  if (family === "long-division") return "div-2digit";
  if (family === "frac-add-sub") return "frac-add";
  return null;
}
