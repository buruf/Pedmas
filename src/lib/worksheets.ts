import { allSkills, stageCapOf } from "@/curriculum";
import { generateQuestion } from "@/engine/generate";
import type { Region } from "@/lib/region";
import type { FigureSpec } from "@/engine/figures";

/**
 * The public worksheet library: free printable sheets per grade and TOPIC.
 *
 * A parent printing "grade 3 multiplication worksheets" is a parent shopping
 * for math help — so these pages are un-gated, watermarked, and end in the
 * placement pitch, exactly like the public sample lesson. The page unit is
 * the curriculum section a skill sits in (its strandName: "Multiplication",
 * "Logarithms", "Percent") rather than the broad strand id, because that is
 * the granularity people actually search at — "grade 9 number sense" is a
 * curriculum term, "grade 11 logarithms worksheet" is a query. Sheets draw
 * on the same validated generator the product uses; only pencil-and-paper
 * question kinds are eligible (the interactive drag/plot types cannot
 * print).
 */

export interface WorksheetQuestion {
  kind: "mc" | "input";
  figure?: FigureSpec;
  instruction: string;
  prompt: string;
  choices?: string[];
  answer: string;
  skillName: string;
}

export interface Worksheet {
  grade: number;
  topicSlug: string;
  topicName: string;
  questions: WorksheetQuestion[];
}

export const WORKSHEET_SIZE = 20;

/** URL slug for a curriculum section name: "Sequences & Series" → "sequences-series". */
export function topicSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Topic pages for a grade, in curriculum order; same-named sections merge. */
export function topicsForGrade(grade: number): { slug: string; name: string }[] {
  const seen = new Set<string>();
  const out: { slug: string; name: string }[] = [];
  for (const s of allSkills()) {
    if (s.grade !== grade) continue;
    const slug = topicSlug(s.strandName);
    if (seen.has(slug)) continue;
    seen.add(slug);
    out.push({ slug, name: s.strandName });
  }
  return out;
}

export function worksheetExists(grade: number, slug: string): boolean {
  return topicsForGrade(grade).some((t) => t.slug === slug);
}

/**
 * Where an old strand-id URL should land now. The library launched briefly
 * with one page per strand id (/worksheets/grade-9/number); anything crawled
 * in that window redirects to the first topic page of that strand.
 */
export function legacyStrandTopic(grade: number, strandId: string): string | null {
  const skill = allSkills().find((s) => s.grade === grade && s.strandId === strandId);
  return skill ? topicSlug(skill.strandName) : null;
}

/**
 * Build one sheet, deterministically for a given seed — the page renders
 * with a daily seed so search engines index stable content, and "New sheet"
 * re-renders with a random one.
 */
export function buildWorksheet(
  grade: number,
  slug: string,
  seed: number,
  region: Region
): Worksheet | null {
  const skills = allSkills().filter((s) => s.grade === grade && topicSlug(s.strandName) === slug);
  if (skills.length === 0) return null;

  const questions: WorksheetQuestion[] = [];
  const avoid = new Set<string>();
  // Round-robin across the topic's skills, easy stages first, so a sheet
  // covers the topic rather than drilling one skill. Attempt-based rather
  // than a fixed number of rounds: a topic with few skills needs many draws
  // from each to fill a sheet. The generator enforces each skill's stage cap.
  const maxAttempts = WORKSHEET_SIZE * 4;
  for (let attempt = 0; attempt < maxAttempts && questions.length < WORKSHEET_SIZE; attempt++) {
    const skill = skills[attempt % skills.length];
    const stage = 1 + (Math.floor(attempt / skills.length) % 3);
    if (stage > stageCapOf(skill)) continue;
    try {
      const q = generateQuestion(skill, stage, { seed: seed + attempt * 7919, avoid, region });
      if (q.kind !== "mc" && q.kind !== "input") continue;
      questions.push({
        kind: q.kind,
        figure: q.figure,
        instruction: q.instruction,
        prompt: q.prompt,
        choices: q.choices,
        answer: q.answer,
        skillName: skill.name,
      });
    } catch {
      // A skill whose generator cannot produce a printable, non-duplicate
      // form at this stage contributes nothing; the rotation moves on.
    }
  }
  if (questions.length === 0) return null;
  const topicName = skills[0].strandName;
  return { grade, topicSlug: slug, topicName, questions };
}

/**
 * Promote bare fractions in an answer to MathText's stacked form: answers
 * come off the generator as the plain text a child would type ("5/6",
 * "2 1/2"), which is right for grading but flat on a printed answer key.
 * Only standalone a/b tokens are wrapped, so "3:4", "0.75" and units pass
 * through untouched.
 */
export function stackFractions(answer: string): string {
  return answer.replace(/(^|[\s(=])(-?\d+\/\d+)(?=$|[\s).,])/g, "$1{$2}");
}

/** FNV-1a of a string — the stable daily seed for indexable pages. */
export function worksheetDailySeed(grade: number, slug: string, dayIso: string): number {
  let h = 2166136261;
  for (const ch of `${grade}:${slug}:${dayIso}`) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
