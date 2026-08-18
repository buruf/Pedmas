import { allSkills } from "@/curriculum";
import { lessonKeyForSkill, LESSON_TITLES } from "@/lib/lessons";

// One row per distinct (family, params) -> lesson, with a real skill name.
const seen = new Map<string, { skill: string; grade: number; lesson: string; n: number }>();
for (const s of allSkills()) {
  const key = lessonKeyForSkill(s.family, s.params);
  const id = `${s.family}|${JSON.stringify(s.params)}`;
  const row = seen.get(id);
  if (row) { row.n++; continue; }
  seen.set(id, {
    skill: s.name,
    grade: s.grade,
    lesson: key ? LESSON_TITLES[key] : "*** NONE ***",
    n: 1,
  });
}
console.log(`${seen.size} distinct family+params combinations\n`);
[...seen.entries()]
  .sort((a, b) => a[0].localeCompare(b[0]))
  .forEach(([id, r]) => {
    const fam = id.split("|")[0];
    console.log(`${fam.padEnd(22)} G${String(r.grade).padStart(2)} ${r.skill.slice(0, 30).padEnd(32)} -> ${r.lesson}`);
  });
