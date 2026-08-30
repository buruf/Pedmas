import type { GradeDef, Skill } from "./types";
import { skillIdFor, STRAND_LABELS } from "./types";
import { grade1 } from "./grade1";
import { grade2 } from "./grade2";
import { grade3 } from "./grade3";
import { grade4 } from "./grade4";
import { grade5 } from "./grade5";
import { grade6 } from "./grade6";
import { grade7 } from "./grade7";
import { grade8 } from "./grade8";
import { grade9 } from "./grade9";
import { grade10 } from "./grade10";
import { grade11 } from "./grade11";
import { grade12 } from "./grade12";

export const GRADES: GradeDef[] = [
  grade1,
  grade2,
  grade3,
  grade4,
  grade5,
  grade6,
  grade7,
  grade8,
  grade9,
  grade10,
  grade11,
  grade12,
];

/**
 * Expand grade definitions into the flat skill graph.
 * Default prerequisites: the previous topic in the same strand within the
 * grade; the first topic of a strand depends on the last topic of the same
 * canonical strand in the nearest lower grade. Explicit prereqs override.
 */
function build() {
  const skills = new Map<string, Skill>();
  const chains = new Map<string, Skill[]>(); // strandId -> ordered skills across grades

  for (const g of GRADES) {
    for (const s of g.strands) {
      const chain = chains.get(s.id) ?? [];
      for (const t of s.topics) {
        const id = skillIdFor(g.grade, s.id, t.name);
        const prev = chain[chain.length - 1];
        const skill: Skill = {
          id,
          name: t.name,
          grade: g.grade,
          strandId: s.id,
          strandName: s.name,
          order: chain.length,
          prereqs: t.prereqs ?? (prev ? [prev.id] : []),
          family: t.family,
          params: t.params ?? {},
        };
        if (skills.has(id)) {
          // Same topic name repeated in a strand+grade — disambiguate.
          let i = 2;
          let alt = `${id}-${i}`;
          while (skills.has(alt)) alt = `${id}-${++i}`;
          skill.id = alt;
        }
        skills.set(skill.id, skill);
        chain.push(skill);
      }
      chains.set(s.id, chain);
    }
  }
  return { skills, chains };
}

const { skills: SKILLS, chains: CHAINS } = build();

export function allSkills(): Skill[] {
  return [...SKILLS.values()];
}

export function getSkill(id: string): Skill | undefined {
  return SKILLS.get(id);
}

/**
 * How many of a family's five stages are in scope for this skill.
 *
 * A family's stage ladder attaches whole to every skill that uses it, so
 * Grade 1 "2D Shapes" was asking polygon interior-angle sums (Grade 7–8
 * content) at stage 5. A skill declares `maxStage` in its params to stop
 * the ladder where its grade's curriculum stops; mastery then completes at
 * that stage (2026 curriculum audit, tier 2).
 */
export function stageCapOf(skill: { params?: Record<string, unknown> } | undefined): number {
  const v = skill?.params?.["maxStage"];
  return typeof v === "number" && v >= 1 && v <= 5 ? Math.floor(v) : 5;
}

/** Ordered skills for a canonical strand across all grades. */
export function strandChain(strandId: string): Skill[] {
  return CHAINS.get(strandId) ?? [];
}

export function strandIds(): string[] {
  return [...CHAINS.keys()];
}

export function strandLabel(strandId: string): string {
  return STRAND_LABELS[strandId] ?? strandId;
}

export function skillsForGrade(grade: number): Skill[] {
  return allSkills().filter((s) => s.grade === grade);
}

/** Strands that exist at a given grade (in curriculum order). */
export function strandsAtGrade(grade: number): { id: string; name: string }[] {
  const g = GRADES.find((x) => x.grade === grade);
  return g ? g.strands.map((s) => ({ id: s.id, name: s.name })) : [];
}

/** First skill of a strand at the given grade, walking down if absent. */
export function strandEntrySkill(strandId: string, grade: number): Skill | undefined {
  const chain = strandChain(strandId);
  for (let g = grade; g >= 1; g--) {
    const first = chain.find((s) => s.grade === g);
    if (first) return first;
  }
  return chain[0];
}

export function nextSkillInStrand(skillId: string): Skill | undefined {
  const skill = SKILLS.get(skillId);
  if (!skill) return undefined;
  const chain = strandChain(skill.strandId);
  const idx = chain.findIndex((s) => s.id === skillId);
  return idx >= 0 ? chain[idx + 1] : undefined;
}

