/** Seeds one local-dev student with attempts around a completed lesson, so the
 * admin Lesson effectiveness table has a fully-populated row to look at. */
import fs from "fs";
import { skillLessonMap } from "../src/lib/lessonEffect";

const [skillId, lessonKey] = skillLessonMap().entries().next().value as [string, string];
const raw = JSON.parse(fs.readFileSync("data/students.json", "utf8"));
const rows: any[] = Array.isArray(raw) ? raw : Object.values(raw);
const t = Date.now() - 3 * 86400_000;

const mk = (n: number, correct: number, ts: number) =>
  Array.from({ length: n }, (_, i) => ({ ts: ts + i * 60000, stage: 2, correct: i < correct, eventuallyCorrect: true, usedHint: false, sessionId: "seed" }));

const demo = {
  id: "demo-effect",
  accountId: rows[0].accountId,
  name: "Effect Demo",
  grade: 3,
  createdAt: t,
  strandLevels: {},
  pointers: {},
  skills: {
    [skillId]: { skillId, stage: 2, stageMastered: 1, attempts: [...mk(14, 6, t), ...mk(16, 14, t + 86400_000)], mastered: false },
  },
  recentSessions: [],
  streak: { count: 0, lastDay: "" },
  lessonsSeen: { [lessonKey]: t + 43200_000 },
};
const existing = rows.findIndex((r) => r.id === "demo-effect");
if (existing >= 0) rows[existing] = demo; else rows.push(demo);
fs.writeFileSync("data/students.json", JSON.stringify(Array.isArray(raw) ? rows : Object.fromEntries(rows.map((r) => [r.id, r])), null, 2));
console.log(`seeded demo-effect on ${skillId} -> lesson ${lessonKey}`);
