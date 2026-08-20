/** Renders a sample weekly email to a file, using a story-rich synthetic
 * student plus a quiet-week sibling, so the layout can be eyeballed. */
import fs from "fs";
import { buildWeeklyStory } from "../src/lib/weeklyStory";
import { weeklyProgressMail } from "../src/lib/email/templates";
import { allSkills } from "../src/curriculum";
import type { StudentProfile } from "../src/lib/model";

const NOW = Date.now();
const DAY = 86400000;
const skills = allSkills();
const counting = skills.find((s) => s.id === "g1.number.counting")!;
const addsub = skills.find((s) => s.family === "add-sub" && s.grade === 2)!;
const shapes = skills.find((s) => s.strandId === "geometry" && s.grade <= 2)!;

const att = (n: number, ok: number, ts: number) =>
  Array.from({ length: n }, (_, i) => ({ ts, stage: 2, correct: i < ok, eventuallyCorrect: true, usedHint: false, sessionId: "s" }));

const amina: StudentProfile = {
  id: "prev-amina", accountId: "a", name: "Amina", grade: 2, createdAt: 0,
  strandLevels: { [addsub.strandId]: 2 }, pointers: { [addsub.strandId]: addsub.id, [shapes.strandId]: shapes.id },
  skills: {
    [counting.id]: { skillId: counting.id, stage: 5, stageMastered: 5, attempts: [], mastered: true, masteredAt: NOW - 2 * DAY },
    [addsub.id]: { skillId: addsub.id, stage: 2, stageMastered: 1, attempts: att(9, 3, NOW - DAY), mastered: false },
  },
  recentSessions: [
    { id: "1", dayKey: "d", total: 12, firstTryCorrect: 9, completedAt: NOW - DAY, activeMs: 14 * 60000 },
    { id: "2", dayKey: "d", total: 12, firstTryCorrect: 10, completedAt: NOW - 3 * DAY, activeMs: 11 * 60000 },
  ],
  streak: { count: 5, lastDay: "" },
};
const noah: StudentProfile = {
  id: "prev-noah", accountId: "a", name: "Noah", grade: 5, createdAt: 0,
  strandLevels: {}, pointers: {}, skills: {}, recentSessions: [], streak: { count: 0, lastDay: "" },
};

const mail = weeklyProgressMail(
  "parent@example.com", "Sam",
  [buildWeeklyStory(amina, NOW, "US"), buildWeeklyStory(noah, NOW, "US")],
  "https://www.pedmas.com/parent/demo",
  "https://www.pedmas.com/api/email/unsubscribe?acct=demo&sig=deadbeef"
);
fs.writeFileSync(process.argv[2], mail.html);
console.log("subject:", mail.subject);
console.log("---- text version ----");
console.log(mail.text);
