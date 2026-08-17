import type { PlacementReportRow, PlacementState } from "@/engine/placement";
import type { SkillState } from "@/engine/mastery";
import type { Question } from "@/engine/types";
import type { QuestionPurpose } from "@/engine/practice";

export type Role = "PARENT" | "STUDENT" | "ADMIN";

/** Subscription state mirrored from Stripe. Stripe remains the source of truth. */
export interface Billing {
  customerId?: string;
  subscriptionId?: string;
  /** Stripe subscription status: trialing | active | past_due | canceled | unpaid | incomplete */
  status?: string;
  /** Children covered by the subscription at the last sync. */
  seats?: number;
  currentPeriodEnd?: number;
  trialEndsAt?: number;
  cancelAtPeriodEnd?: boolean;
  updatedAt?: number;
}

export interface Account {
  id: string;
  email: string;
  passwordHash: string; // scrypt: salt:hex
  role: Role;
  name: string;
  createdAt: number;
  billing?: Billing;
  /** Weekly parent summary opt-out and send bookkeeping. */
  emailPrefs?: { weeklySummary?: boolean; lastWeeklySentDay?: string };
  /**
   * Record of the terms and parental consent accepted at signup. Stored with
   * the policy version so a material change can require fresh consent, which
   * is the point of collecting it at all.
   */
  consent?: {
    policyVersion: string;
    acceptedAt: number;
    /** True when the holder affirmed they are a parent or guardian. */
    parentAffirmed: boolean;
  };
}

/** Single-use password reset token. Only the hash is stored. */
export interface PasswordResetToken {
  id: string; // hash of the emailed token
  accountId: string;
  createdAt: number;
  expiresAt: number;
  usedAt?: number;
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
  /** When this question was first shown, for measuring time on task. */
  servedAt?: number;
  /** Time actually spent on it, capped so a break is not counted as study. */
  elapsedMs?: number;
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
  /** Time on task for the session, summed from capped per-question times. */
  activeMs?: number;
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
  /** Lesson key -> when it was first completed, so it is taught once. */
  lessonsSeen?: Record<string, number>;
  /**
   * Learning preferences (spec §2). Only settings that genuinely change the
   * product live here — a preference that does nothing is worse than none,
   * because it implies a promise the app does not keep.
   */
  preferences?: LearningPreferences;
}

export interface LearningPreferences {
  /** Questions per daily session. Some children need a shorter sitting. */
  sessionLength: "short" | "standard" | "long";
  /** Teach the lesson before a new skill, or go straight to practice. */
  lessonsFirst: boolean;
  /** Suppress emoji and celebration for students who find it patronising. */
  plainMode: boolean;
}

export const DEFAULT_PREFERENCES: LearningPreferences = {
  sessionLength: "standard",
  lessonsFirst: true,
  plainMode: false,
};

/** Questions in a session, from the chosen length. */
export function sessionSizeFor(prefs: LearningPreferences | undefined): number {
  switch (prefs?.sessionLength) {
    case "short":
      return 8;
    case "long":
      return 16;
    default:
      return 12;
  }
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
