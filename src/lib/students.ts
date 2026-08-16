import type { Account, PracticeSessionState, StudentProfile } from "./model";
import { dayKeyOf, toClientQuestion } from "./model";
import { allRows, getRow, newId, putRow } from "./store/db";
import {
  applyPlacementAnswer,
  nextPlacementQuestion,
  placementReport,
  startPlacement,
} from "@/engine/placement";
import { strandChain, getSkill, strandLabel } from "@/curriculum";
import { buildPracticeSession, currentSkillFor, SESSION_SIZE } from "@/engine/practice";
import { assumedMastered, newSkillState, recordAttempt, skillProgress } from "@/engine/mastery";
import { isCorrect, dedupKey } from "@/engine/validate";
import { stageLabelFor, generateQuestion } from "@/engine/generate";

const TABLE = "students";

/**
 * Stable seed from a string, so pressing "Show me" twice on the same question
 * gives the same worked example rather than a new one each time.
 */
function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export async function createStudent(
  account: Account,
  input: { name: string; grade: number; age?: number; goal?: string }
): Promise<StudentProfile> {
  const student: StudentProfile = {
    id: newId("stu"),
    accountId: account.id,
    name: input.name.trim() || "Learner",
    grade: Math.max(1, Math.min(12, Math.round(input.grade))),
    age: input.age,
    goal: input.goal,
    createdAt: Date.now(),
    strandLevels: {},
    pointers: {},
    skills: {},
    recentSessions: [],
    streak: { count: 0, lastDay: "" },
  };
  await putRow(TABLE, student.id, student);
  return student;
}

export async function studentsOf(account: Account): Promise<StudentProfile[]> {
  const rows = await allRows<StudentProfile>(TABLE);
  if (account.role === "ADMIN") return rows;
  return rows.filter((s) => s.accountId === account.id);
}

export async function studentFor(
  account: Account,
  studentId: string
): Promise<StudentProfile | null> {
  const student = await getRow<StudentProfile>(TABLE, studentId);
  if (!student) return null;
  if (account.role !== "ADMIN" && student.accountId !== account.id) return null;
  return student;
}

export async function saveStudent(student: StudentProfile): Promise<void> {
  await putRow(TABLE, student.id, student);
}

/* ------------------------------------------------------------- placement */

export function beginPlacement(student: StudentProfile): void {
  const seed = Math.floor(Math.random() * 2 ** 30);
  student.placement = startPlacement(student.grade, seed, Date.now());
  student.placementReport = undefined;
}

export function placementCurrent(student: StudentProfile) {
  if (!student.placement || student.placement.done) return null;
  const next = nextPlacementQuestion(student.placement);
  if (!next) return null;
  return {
    question: toClientQuestion(next.question),
    strandName: next.strandName,
    progress: next.progress,
  };
}

export function placementAnswer(student: StudentProfile, answer: string) {
  if (!student.placement || student.placement.done) return null;
  const next = nextPlacementQuestion(student.placement);
  if (!next) return null;
  const correct = isCorrect(next.question, answer);
  applyPlacementAnswer(student.placement, correct);
  let report = null;
  if (student.placement.done) {
    student.placementReport = placementReport(student.placement);
    student.placedAt = Date.now();
    initFromPlacement(student);
    report = student.placementReport;
  }
  return {
    correct,
    correctAnswer: next.question.answer,
    steps: next.question.steps,
    concept: next.question.concept,
    done: student.placement.done,
    report,
  };
}

/** Set strand levels/pointers and mark pre-placement skills as mastered. */
function initFromPlacement(student: StudentProfile): void {
  const now = Date.now();
  for (const row of student.placementReport ?? []) {
    student.strandLevels[row.strandId] = row.level;
    const chain = strandChain(row.strandId);
    const entry =
      chain.find((s) => s.grade === row.level) ??
      chain.find((s) => s.grade > row.level) ??
      chain[chain.length - 1];
    if (!entry) continue;
    student.pointers[row.strandId] = entry.id;
    for (const skill of chain) {
      if (skill.grade < row.level && skill.order < entry.order) {
        student.skills[skill.id] = assumedMastered(skill.id, now);
      }
    }
  }
}

/* -------------------------------------------------------------- practice */

export function ensureSession(student: StudentProfile): PracticeSessionState {
  const now = Date.now();
  const dayKey = dayKeyOf(now);
  const active = student.activeSession;
  if (active && !active.completedAt && active.dayKey === dayKey && active.items.length > 0) {
    return active;
  }
  const items = buildPracticeSession(
    {
      grade: student.grade,
      strandLevels: student.strandLevels,
      pointers: student.pointers,
      skills: student.skills,
    },
    { now, seed: Math.floor(Math.random() * 2 ** 30) }
  );
  const session: PracticeSessionState = {
    id: newId("ps"),
    createdAt: now,
    dayKey,
    items: items.map((it) => ({
      question: it.question,
      purpose: it.purpose,
      isReview: it.isReview,
      attempts: 0,
      usedHint: false,
    })),
    index: 0,
    completedAt: items.length === 0 ? now : undefined,
  };
  student.activeSession = session;
  return session;
}

const MAX_ATTEMPTS_PER_QUESTION = 3;

export interface AnswerResult {
  correct: boolean;
  attempts: number;
  moveOn: boolean;
  correctAnswer?: string;
  steps?: string[];
  concept?: string;
  sessionComplete: boolean;
  stageAdvanced?: boolean;
  skillMastered?: boolean;
  skillName?: string;
}

export interface WorkedExample {
  instruction: string;
  prompt: string;
  answer: string;
  steps: string[];
  concept: string;
  skillName: string;
}

/**
 * A worked example for the question the student is currently stuck on.
 *
 * Deliberately a *different* question at the same skill and stage, never the
 * live one: showing the answer to the question in front of them teaches
 * copying, whereas working a parallel problem teaches the method and leaves
 * them something to do. Generated on demand, so every family has this
 * support without any per-skill authoring.
 */
export function workedExampleFor(student: StudentProfile): WorkedExample | null {
  const session = student.activeSession;
  if (!session || session.completedAt) return null;
  const item = session.items[session.index];
  if (!item) return null;
  const skill = getSkill(item.question.skillId);
  if (!skill) return null;

  // Exclude the live question so the example cannot be a restatement of it.
  const avoid = new Set<string>([dedupKey(item.question)]);
  try {
    const example = generateQuestion(skill, item.question.stage, {
      seed: hashSeed(`${session.id}:${item.question.id}:example`),
      avoid,
    });
    return {
      instruction: example.instruction,
      prompt: example.prompt,
      answer: example.answer,
      steps: example.steps,
      concept: example.concept,
      skillName: skill.name,
    };
  } catch {
    return null;
  }
}

export function answerCurrent(
  student: StudentProfile,
  input: string,
  usedHint: boolean
): AnswerResult | null {
  const session = student.activeSession;
  if (!session || session.completedAt) return null;
  const item = session.items[session.index];
  if (!item) return null;
  item.attempts += 1;
  if (usedHint) item.usedHint = true;
  const correct = isCorrect(item.question, input);
  const exhausted = !correct && item.attempts >= MAX_ATTEMPTS_PER_QUESTION;
  const moveOn = correct || exhausted;
  const result: AnswerResult = {
    correct,
    attempts: item.attempts,
    moveOn,
    sessionComplete: false,
  };
  if (correct || exhausted) {
    item.correctFirstTry = correct && item.attempts === 1;
    item.eventuallyCorrect = correct;
    result.correctAnswer = item.question.answer;
    result.steps = item.question.steps;
    result.concept = item.question.concept;

    const skill = getSkill(item.question.skillId);
    if (skill) {
      const state = (student.skills[skill.id] ??= newSkillState(skill.id, item.question.stage));
      const outcome = recordAttempt(
        state,
        {
          ts: Date.now(),
          stage: item.question.stage,
          correct: item.correctFirstTry ?? false,
          eventuallyCorrect: correct,
          usedHint: item.usedHint,
          sessionId: session.id,
        },
        { isReview: item.isReview }
      );
      result.stageAdvanced = outcome.stageAdvanced;
      result.skillMastered = outcome.skillMastered;
      result.skillName = skill.name;
    }
    session.index += 1;
    if (session.index >= session.items.length) {
      completeSession(student, session);
      result.sessionComplete = true;
    }
  } else {
    // Wrong but retryable: coach, don't reveal the answer yet.
    result.steps = [item.question.hint];
  }
  return result;
}

function completeSession(student: StudentProfile, session: PracticeSessionState): void {
  const now = Date.now();
  session.completedAt = now;
  const firstTry = session.items.filter((i) => i.correctFirstTry).length;
  student.recentSessions.unshift({
    id: session.id,
    dayKey: session.dayKey,
    total: session.items.length,
    firstTryCorrect: firstTry,
    completedAt: now,
  });
  if (student.recentSessions.length > 60) student.recentSessions.length = 60;

  const yesterday = dayKeyOf(now - 24 * 60 * 60 * 1000);
  if (student.streak.lastDay === session.dayKey) {
    // Already counted today.
  } else if (student.streak.lastDay === yesterday) {
    student.streak = { count: student.streak.count + 1, lastDay: session.dayKey };
  } else {
    student.streak = { count: 1, lastDay: session.dayKey };
  }
}

/* -------------------------------------------------------------- progress */

export function progressSummary(student: StudentProfile) {
  const strands = Object.keys(student.strandLevels).map((sid) => {
    const level = student.strandLevels[sid];
    const chain = strandChain(sid);
    const atLevel = chain.filter((s) => s.grade === level);
    const mastered = atLevel.filter((s) => student.skills[s.id]?.mastered).length;
    const pct = atLevel.length ? Math.round((mastered / atLevel.length) * 100) : 0;
    const current = currentSkillFor(
      {
        grade: student.grade,
        strandLevels: student.strandLevels,
        pointers: student.pointers,
        skills: student.skills,
      },
      sid
    );
    const state = current ? student.skills[current.id] : undefined;
    return {
      strandId: sid,
      strandName: strandLabel(sid),
      level,
      percent: pct,
      currentSkill: current
        ? {
            id: current.id,
            name: current.name,
            grade: current.grade,
            stage: state?.stage ?? 1,
            stageLabel: stageLabelFor(current, state?.stage ?? 1),
            progress: state ? skillProgress(state) : 0,
          }
        : null,
    };
  });
  const masteredSkills = Object.values(student.skills).filter((s) => s.mastered && !s.assumed);
  const masteredNames = masteredSkills
    .sort((a, b) => (b.masteredAt ?? 0) - (a.masteredAt ?? 0))
    .slice(0, 8)
    .map((s) => getSkill(s.skillId)?.name ?? s.skillId);
  const totalAnswered = student.recentSessions.reduce((a, s) => a + s.total, 0);
  const totalFirstTry = student.recentSessions.reduce((a, s) => a + s.firstTryCorrect, 0);
  return {
    strands,
    masteredCount: masteredSkills.length,
    masteredRecent: masteredNames,
    streak: student.streak,
    accuracy: totalAnswered ? Math.round((totalFirstTry / totalAnswered) * 100) : null,
    sessions: student.recentSessions.slice(0, 14),
    placementReport: student.placementReport ?? null,
    placed: Boolean(student.placedAt),
  };
}
