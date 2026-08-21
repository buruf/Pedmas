/**
 * Generates the Skill Coverage Checklist: every skill in the curriculum,
 * grouped by grade and strand, with a tick-box per stage and its lesson.
 * Run from this folder:  npx tsx checklist.ts
 */
import { allSkills } from "../../src/curriculum";
import { stageLabelFor } from "../../src/engine/generate";
import { lessonKeyForSkill, LESSON_TITLES } from "../../src/lib/lessons";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { makeDoc } = require("./dockit");

const d = makeDoc(
  "../../docs/PEDMAS-Skill-Checklist.pdf",
  "Skill Coverage Checklist",
  "Every skill in the curriculum, with a box per stage — tick as you verify each in the admin question preview"
);

d.title();
d.p(
  "The automated suite already generates and validates questions for every one of these skills at every stage in both regions on every test run — this checklist is for the judgement a machine cannot make: does the question feel right for the grade, is the wording clear, would a child understand it? Open /admin, use the question preview for the skill and stage, and tick the box. The five boxes are stages 1–5; L means the skill's lesson has been read.",
  { muted: true }
);

const skills = allSkills();
let currentGroup = "";
let count = 0;

for (const skill of skills) {
  const group = `Grade ${skill.grade} — ${skill.strandName}`;
  if (group !== currentGroup) {
    currentGroup = group;
    d.h2(group);
  }
  const lessonKey = lessonKeyForSkill(skill.family, skill.params);
  const lesson = lessonKey ? (LESSON_TITLES as Record<string, string>)[lessonKey] : null;
  d.checkRow(skill.name, lesson, [1, 2, 3, 4, 5].map((s) => stageLabelFor(skill, s)));
  count++;
}

d.p(`${count} skills total.`, { muted: true });
d.finish();
console.log(`checklist written: ${count} skills`);
