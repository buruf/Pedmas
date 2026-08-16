import type { PlacementReportRow, PlacementState } from "@/engine/placement";
import type { SkillState } from "@/engine/mastery";
import type { Question } from "@/engine/types";
import type { QuestionPurpose } from "@/engine/practice";

export type Role = "PARENT" | "STUDENT" | "ADMIN";

export interface Account {
  id: string;
  email: string;
  passwordHash: string; // scrypt: salt:hex
  role: Role;
  name: string;
  createdAt: number;
}

export interface AuthSession {
  id: string; // token
  accountId: string;
  createdAt: number;
  expiresAt: number;
}

export interface SessionItemState {
  question: Question; // full server-side copy (answer included)
  purpose: QuestionPurpose;
  isReview: boolean;
  attempts: number;
  usedHint: boolean;
  correctFirstTry?: boolean;
  eventuallyCorrect?: boolean;
}

export interface PracticeSessionState {
  id: string;
  createdAt: number;
  dayKey: string; // YYYY-MM-DD
  items: SessionItemState[];
  index: number;
  completedAt?: number;
}

export interface SessionSummary {
  id: string;
  dayKey: string;
  total: number;
  firstTryCorrect: number;
  completedAt: number;
}

export interface StudentProfile {
  id: string;
  accountId: string; // owner (parent account or the student's own)
  name: string;
  grade: number;
  age?: number;
  goal?: string;
  createdAt: number;
  placement?: PlacementState;
  placementReport?: PlacementReportRow[];
  placedAt?: number;
  strandLevels: Record<string, number>;
  pointers: Record<string, string>;
  skills: Record<string, SkillState>;
  activeSession?: PracticeSessionState;
  recentSessions: SessionSummary[]; // bounded, newest first
  streak: { count: number; lastDay: string };
}

/** Question shape sent to the client (no answer, no steps until graded). */
export interface ClientQuestion {
  id: string;
  kind: Question["kind"];
  instruction: string;
  prompt: string;
  choices?: string[];
  answerFormat: Question["answerFormat"];
  answerHint?: string;
  hint: string;
  topicName: string;
  strandName: string;
  stage: number;
  representation: string;
}

export function toClientQuestion(q: Question): ClientQuestion {
  return {
    id: q.id,
    kind: q.kind,
    instruction: q.instruction,
    prompt: q.prompt,
    choices: q.choices,
    answerFormat: q.answerFormat,
    answerHint: q.answerHint,
    hint: q.hint,
    topicName: q.topicName,
    strandName: q.strandName,
    stage: q.stage,
    representation: q.representation,
  };
}

export function dayKeyOf(ts: number): string {
  return new Date(ts).toISOString().slice(0, 10);
}
