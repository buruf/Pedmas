/**
 * Age-appropriate presentation (spec §25).
 *
 * The interface should mature as the student does: playful for Grades 1-3,
 * plainly academic by 10-12. A single design cannot serve a six-year-old and
 * a sixteen-year-old — the six-year-old needs bigger targets and warmth, and
 * the sixteen-year-old is put off by anything that reads as babyish.
 *
 * This is deliberately presentation-only. Nothing here touches the
 * mathematics, the placement, or what a student is asked — a Grade 2 child
 * working at Grade 6 fractions still gets Grade 6 fractions.
 */

export type AgeBand = "primary" | "middle" | "junior" | "senior";

export interface BandStyle {
  band: AgeBand;
  /** Greeting on the student dashboard. */
  greeting: (name: string) => string;
  /** Whether to use emoji and exclamation marks at all. */
  playful: boolean;
  /** Tailwind size for the question text — younger eyes need more. */
  questionText: string;
  /** Minimum tap target; small fingers are less accurate. */
  touchTarget: string;
  /** Rounding: softer for the youngest, squarer as they grow. */
  radius: string;
  /** Label for the practice call to action. */
  practiceCta: string;
  /** What a finished session is called. */
  doneLabel: string;
}

const BANDS: Record<AgeBand, BandStyle> = {
  // Grades 1-3. Warm, roomy, emoji welcome.
  primary: {
    band: "primary",
    greeting: (name) => `Hi ${name}! 👋`,
    playful: true,
    questionText: "text-3xl",
    touchTarget: "min-h-14",
    radius: "rounded-3xl",
    practiceCta: "Let's play!",
    doneLabel: "All done! 🎉",
  },
  // Grades 4-6. Still friendly, less loud.
  middle: {
    band: "middle",
    greeting: (name) => `Welcome back, ${name}!`,
    playful: true,
    questionText: "text-2xl",
    touchTarget: "min-h-12",
    radius: "rounded-2xl",
    practiceCta: "Start practice",
    doneLabel: "Session complete 🎉",
  },
  // Grades 7-9. Academic in tone, no exclamation.
  junior: {
    band: "junior",
    greeting: (name) => `Welcome back, ${name}`,
    playful: false,
    questionText: "text-2xl",
    touchTarget: "min-h-11",
    radius: "rounded-2xl",
    practiceCta: "Start practice",
    doneLabel: "Session complete",
  },
  // Grades 10-12. Reads like a serious study tool.
  senior: {
    band: "senior",
    greeting: (name) => `${name}`,
    playful: false,
    questionText: "text-xl",
    touchTarget: "min-h-11",
    radius: "rounded-xl",
    practiceCta: "Begin session",
    doneLabel: "Session complete",
  },
};

/**
 * Band from school grade. Uses the student's year rather than their measured
 * level: a Grade 9 student working at Grade 4 arithmetic should still be
 * spoken to as a fifteen-year-old, which is exactly the dignity the spec is
 * protecting.
 */
export function bandForGrade(grade: number): AgeBand {
  if (grade <= 3) return "primary";
  if (grade <= 6) return "middle";
  if (grade <= 9) return "junior";
  return "senior";
}

export function styleForGrade(grade: number): BandStyle {
  return BANDS[bandForGrade(grade)];
}
