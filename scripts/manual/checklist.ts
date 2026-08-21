/**
 * Generates the Skill Coverage Checklist: every skill in the curriculum,
 * grouped by grade and strand, with a tick-box per stage, its lesson, and —
 * for grades 8–12 — how many of its five stages the independent CAS auditor
 * verifies. Run from this folder:  npx tsx checklist.ts
 */
import { allSkills } from "../../src/curriculum";
import { generateQuestion, stageLabelFor } from "../../src/engine/generate";
import { casCheck } from "../../src/engine/casAudit";
import { lessonKeyForSkill, LESSON_TITLES } from "../../src/lib/lessons";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { makeDoc } = require("./dockit");

/** Stages of this skill the CAS auditor actually claims, measured live. */
function casStages(skill: (typeof skills)[number]): number {
  if (skill.grade < 8) return 0;
  let covered = 0;
  for (let stage = 1; stage <= 5; stage++) {
    for (let s = 0; s < 2; s++) {
      try {
        if (casCheck(generateQuestion(skill, stage, { seed: 40 + s * 1097 })).checked) {
          covered++;
          break;
        }
      } catch {
        /* generation hiccup: stage counts as uncovered */
      }
    }
  }
  return covered;
}

const d = makeDoc(
  "../../docs/PEDMAS-Skill-Checklist.pdf",
  "Skill Coverage Checklist",
  "Every skill in the curriculum, with a box per stage — tick as you verify each in the admin question preview"
);

d.title();
d.p(
  "Two machine layers already stand behind every row here. First, the automated suite generates and validates questions for every skill at every stage in both regions on every test run. Second, for grades 8–12, an independent computer-algebra engine (the CAS audit — see the Test Script, section H) re-derives answers from exactly the text a student sees; rows marked “CAS n/5” on the right have n of their five stages verified that way, so their computational correctness is triple-checked before you ever look.",
  { muted: true }
);
d.p(
  "This checklist is for the judgement no machine makes: does the question feel right for the grade, is the wording clear, would a child understand it? Open /admin, use the question preview for the skill and stage, and tick the box. The five boxes are stages 1–5; L means the skill's lesson has been read. Unmarked senior rows (no CAS tag) are the ones where your eyes are the only check on the mathematics itself — give those extra care.",
  { muted: true }
);

const skills = allSkills();
let currentGroup = "";
let count = 0;
let casCovered = 0;

for (const skill of skills) {
  const group = `Grade ${skill.grade} — ${skill.strandName}`;
  if (group !== currentGroup) {
    currentGroup = group;
    d.h2(group);
  }
  const lessonKey = lessonKeyForSkill(skill.family, skill.params);
  const lesson = lessonKey ? (LESSON_TITLES as Record<string, string>)[lessonKey] : null;
  const stages = casStages(skill);
  if (stages > 0) casCovered++;
  d.checkRow(
    skill.name,
    lesson,
    [1, 2, 3, 4, 5].map((s) => stageLabelFor(skill, s)),
    stages > 0 ? `CAS ${stages}/5` : undefined
  );
  count++;
}

d.p(`${count} skills total; ${casCovered} carry independent CAS verification on at least one stage.`, { muted: true });
d.finish();
console.log(`checklist written: ${count} skills, ${casCovered} CAS-tagged`);
