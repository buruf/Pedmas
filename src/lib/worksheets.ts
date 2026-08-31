import { allSkills, stageCapOf, strandLabel, GRADES } from "@/curriculum";
import { generateQuestion } from "@/engine/generate";
import type { Region } from "@/lib/region";

/**
 * The public worksheet library: free printable sheets per grade and strand.
 *
 * A parent printing "grade 3 fractions worksheets" is a parent shopping for
 * math help — so these pages are un-gated, watermarked, and end in the
 * placement pitch, exactly like the public sample lesson. Sheets draw on the
 * same validated generator the product uses; only pencil-and-paper question
 * kinds are eligible (the interactive drag/plot types cannot print).
 */

export interface WorksheetQuestion {
  kind: "mc" | "input";
  instruction: string;
  prompt: string;
  choices?: string[];
  answer: string;
  skillName: string;
}

export interface Worksheet {
  grade: number;
  strandId: string;
  strandName: string;
  questions: WorksheetQuestion[];
}

export const WORKSHEET_SIZE = 20;

/** Unique strand ids for a grade, in curriculum order. */
export function strandsForGrade(grade: number): { id: string; name: string }[] {
  const def = GRADES.find((g) => g.grade === grade);
  if (!def) return [];
  const seen = new Set<string>();
  const out: { id: string; name: string }[] = [];
  for (const s of def.strands) {
    if (seen.has(s.id)) continue;
    seen.add(s.id);
    out.push({ id: s.id, name: strandLabel(s.id) });
  }
  return out;
}

export function worksheetExists(grade: number, strandId: string): boolean {
  return strandsForGrade(grade).some((s) => s.id === strandId);
}

/**
 * Build one sheet, deterministically for a given seed — the page renders
 * with a daily seed so search engines index stable content, and "New sheet"
 * re-renders with a random one.
 */
export function buildWorksheet(
  grade: number,
  strandId: string,
  seed: number,
  region: Region
): Worksheet | null {
  const skills = allSkills().filter((s) => s.grade === grade && s.strandId === strandId);
  if (skills.length === 0) return null;

  const questions: WorksheetQuestion[] = [];
  const avoid = new Set<string>();
  // Round-robin across the strand's skills, easy stages first, so a sheet
  // covers the strand rather than drilling one topic. Attempt-based rather
  // than a fixed number of rounds: a strand with a single skill (Grade 5
  // measurement) needs many draws from that one skill to fill a sheet. The
  // generator itself enforces each skill's stage cap.
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
  return { grade, strandId, strandName: strandLabel(strandId), questions };
}

/** FNV-1a of a string — the stable daily seed for indexable pages. */
export function worksheetDailySeed(grade: number, strandId: string, dayIso: string): number {
  let h = 2166136261;
  for (const ch of `${grade}:${strandId}:${dayIso}`) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
