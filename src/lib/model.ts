import type { PlacementReportRow, PlacementState } from "@/engine/placement";
import type { SkillState } from "@/engine/mastery";
import type { Question } from "@/engine/types";
import type { QuestionPurpose } from "@/engine/practice";
import { localise, type Region } from "./region";

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
  /**
   * Which teaching variant this family sees. Detected from the request
   * on first sight, then editable — an American family abroad should not be
   * switched by their holiday.
   */
  region?: "US" | "INTL";
  /** IANA timezone, so the day rolls over at the family's midnight. */
  timezone?: string;
  /**
   * Last sign-in. Written once per login rather than per request — the
   * retention sweep also counts practice activity, so an idle-but-logged-in
   * family is never mistaken for a dormant one.
   */
  lastSeenAt?: number;
  /** Dormancy bookkeeping: when the deletion warning was sent. */
  retention?: { warnedAt?: number };
  /**
   * Two-factor authentication (admin accounts). The TOTP secret must be
   * stored recoverably to verify codes at all; recovery codes are stored
   * only as hashes, and lastStep blocks replay of a code inside its window.
   */
  mfa?: {
    secret?: string;
    enabledAt?: number;
    lastStep?: number;
    recoveryHashes?: string[];
    pendingSecret?: string;
    pendingAt?: number;
  };
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
  microSkill: string;
  strandName: string;
  stage: number;
  representation: string;
}

/**
 * Serialise a question for the client, rewritten for the family's region.
 * Done here so every caller gets it — a question that slips past would show
 * British spelling to an American child mid-session.
 */
export function toClientQuestion(q: Question, region: Region = "INTL"): ClientQuestion {
  const t = (v: string) => localise(v, region);
  return {
    id: q.id,
    kind: q.kind,
    instruction: t(q.instruction),
    prompt: t(q.prompt),
    choices: q.choices?.map(t),
    answerFormat: q.answerFormat,
    answerHint: q.answerHint ? t(q.answerHint) : undefined,
    hint: t(q.hint),
    topicName: t(q.topicName),
    microSkill: t(q.microSkill),
    strandName: t(q.strandName),
    stage: q.stage,
    representation: q.representation,
  };
}

/**
 * The calendar day a timestamp falls on, in the family's own timezone.
 *
 * Streaks, "today's practice" and spaced review all key off this. Computing
 * it in UTC meant the day rolled over at 7pm in New York and 11am in Sydney,
 * so an Australian child practising after lunch could be handed two "daily"
 * sessions and still lose their streak. The boundary has to be local midnight.
 */
export function dayKeyOf(ts: number, timeZone?: string): string {
  if (!timeZone) return new Date(ts).toISOString().slice(0, 10);
  try {
    // en-CA formats as YYYY-MM-DD, which is the shape the rest of the app
    // already stores and compares as a plain string.
    return new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(ts));
  } catch {
    // An unknown zone must never break practice.
    return new Date(ts).toISOString().slice(0, 10);
  }
}
