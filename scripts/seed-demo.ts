/**
 * Seeds a demo family so the whole product can be exercised without clicking
 * through placement four times.
 *
 * Creates one parent account with four children, one in each age band, each
 * placed at a different ability and carrying real practice history — so
 * streaks, time on task, mastery and the parent dashboard all have something
 * to show. Everything runs through the real engine, so the data is honest
 * rather than fabricated.
 *
 *   npx tsx scripts/seed-demo.ts          # seed
 *   npx tsx scripts/seed-demo.ts --wipe   # remove the demo family only
 *
 * Safe to re-run: it clears its own rows first and touches nothing else.
 */
import { createAccount } from "../src/lib/auth";
import { createStudent, ensureSession, answerCurrent, saveStudent } from "../src/lib/students";
import { nextPlacementQuestion, applyPlacementAnswer, placementReport, startPlacement } from "../src/engine/placement";
import { allRows, deleteRow, getRow } from "../src/lib/store/db";
import { storeBackend } from "../src/lib/store/db";
import type { Account, StudentProfile } from "../src/lib/model";

const EMAIL = "demo.parent@pedmas.test";
const PASSWORD = "demo-parent-1234";

interface Child {
  name: string;
  grade: number;
  /** Ability: answers correctly at or below this grade. */
  trueGrade: number;
  sessions: number;
  /** Chance of a first-try correct answer during practice. */
  accuracy: number;
  preferences?: { sessionLength: "short" | "standard" | "long"; lessonsFirst: boolean; plainMode: boolean };
}

const CHILDREN: Child[] = [
  { name: "Amina", grade: 2, trueGrade: 1, sessions: 4, accuracy: 0.7,
    preferences: { sessionLength: "short", lessonsFirst: true, plainMode: false } },
  { name: "Noah", grade: 5, trueGrade: 5, sessions: 6, accuracy: 0.8,
    preferences: { sessionLength: "standard", lessonsFirst: true, plainMode: false } },
  { name: "Zara", grade: 8, trueGrade: 6, sessions: 3, accuracy: 0.6,
    preferences: { sessionLength: "standard", lessonsFirst: false, plainMode: false } },
  { name: "Ibrahim", grade: 11, trueGrade: 11, sessions: 5, accuracy: 0.9,
    preferences: { sessionLength: "long", lessonsFirst: true, plainMode: true } },
];

async function wipe(): Promise<number> {
  const accounts = await allRows<Account>("accounts");
  const demo = accounts.find((a) => a.email === EMAIL);
  if (!demo) return 0;
  const students = await allRows<StudentProfile>("students");
  let removed = 0;
  for (const s of students.filter((s) => s.accountId === demo.id)) {
    await deleteRow("students", s.id);
    removed++;
  }
  await deleteRow("accounts", demo.id);
  return removed;
}

/** Run the real placement engine, answering as a child of `trueGrade` would. */
function simulatePlacement(student: StudentProfile, trueGrade: number): void {
  student.placement = startPlacement(student.grade, 4242, Date.now());
  let guard = 0;
  while (!student.placement.done && guard++ < 400) {
    const next = nextPlacementQuestion(student.placement);
    if (!next) break;
    const probe = student.placement.probes[student.placement.order[student.placement.current]];
    applyPlacementAnswer(student.placement, probe.testGrade <= trueGrade);
  }
  student.placementReport = placementReport(student.placement);
  student.placedAt = Date.now();
}

/** Play through completed sessions, with plausible time on task. */
async function playSessions(student: StudentProfile, child: Child): Promise<void> {
  for (let s = 0; s < child.sessions; s++) {
    // Backdate each session a day earlier so the streak and week view fill in.
    const dayOffset = child.sessions - 1 - s;
    const session = ensureSession(student);
    let guard = 0;
    while (student.activeSession && !student.activeSession.completedAt && guard++ < 60) {
      const item = student.activeSession.items[student.activeSession.index];
      if (!item) break;
      // 20-90 seconds per question, so time on task looks like real work.
      item.servedAt = Date.now() - (20000 + Math.floor(Math.random() * 70000));
      const right = Math.random() < child.accuracy;
      answerCurrent(student, right ? item.question.answer : "___wrong___", false);
    }
    const done = student.recentSessions[0];
    if (done && dayOffset > 0) {
      const day = new Date(Date.now() - dayOffset * 86400000).toISOString().slice(0, 10);
      done.dayKey = day;
      student.streak = { count: child.sessions, lastDay: student.recentSessions[0].dayKey };
    }
    void session;
    student.activeSession = undefined;
  }
  // Leave the last child mid-session so a half-finished state can be tested.
  if (child.name === "Noah") ensureSession(student);
  await saveStudent(student);
}

async function main() {
  const wipeOnly = process.argv.includes("--wipe");
  console.log(`store backend: ${storeBackend()}`);

  const removed = await wipe();
  if (removed || wipeOnly) console.log(`removed demo family (${removed} children)`);
  if (wipeOnly) return;

  const account = await createAccount(EMAIL, PASSWORD, "PARENT", "Demo Parent", {
    acceptedTerms: true,
    parentAffirmed: true,
  });
  if ("error" in account) throw new Error(account.error);

  for (const child of CHILDREN) {
    const student = await createStudent(account, {
      name: child.name,
      grade: child.grade,
      age: child.grade + 5,
      goal: "Stay on track at school",
      preferences: child.preferences,
    });
    simulatePlacement(student, child.trueGrade);
    await saveStudent(student);
    await playSessions(student, child);

    const fresh = await getRow<StudentProfile>("students", student.id);
    const levels = (fresh?.placementReport ?? [])
      .map((r) => `${r.strandName.split(" ")[0]} G${r.level}`)
      .join(", ");
    console.log(
      `  ${child.name.padEnd(8)} grade ${String(child.grade).padStart(2)}  ` +
        `${fresh?.recentSessions.length ?? 0} sessions  |  ${levels}`
    );
  }

  // Deliberately left as a PARENT, not promoted to admin: admins see every
  // student in the database, which would bury the demo family among other
  // rows and stop this being a faithful test of the parent experience.
  console.log(`\nParent account — sign in at /login`);
  console.log(`  email:    ${EMAIL}`);
  console.log(`  password: ${PASSWORD}`);
  console.log(`\nAdmin console at /admin uses the seeded admin instead:`);
  console.log(`  email:    ${process.env.PEDMAS_ADMIN_EMAIL ?? "admin@pedmas.com"}`);
  console.log(`  password: ${process.env.PEDMAS_ADMIN_PASSWORD ? "(from PEDMAS_ADMIN_PASSWORD)" : "pedmas-admin"}`);
}

main().catch((e) => {
  console.error("seed failed:", e instanceof Error ? e.message : e);
  process.exit(1);
});
