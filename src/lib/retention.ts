/**
 * Data retention for dormant accounts.
 *
 * The amended COPPA rule forbids keeping children's data indefinitely: an
 * operator must hold it only as long as it serves the purpose it was
 * collected for, and must say so in writing. Teaching a child mathematics
 * stops being a purpose once nobody has opened the account for two years.
 *
 * So: after DORMANT_DAYS of no activity the account and every child profile
 * on it are erased, and a warning email goes out WARNING_LEAD_DAYS earlier so
 * a family that simply took a long break can return and keep everything.
 *
 * Two design rules matter more than the numbers:
 *
 *  1. Erasure runs through eraseAccount(), the same function the parent's own
 *     "delete my account" button uses. One code path means the privacy
 *     policy's promise cannot be true in one place and false in the other.
 *  2. A paying subscription is never dormant. Deleting a family whose card is
 *     still being charged would be indefensible, so any live billing status
 *     protects the account regardless of activity.
 */
import { allRows, deleteRow, putRow } from "./store/db";
import type { Account, AuthSession, StudentProfile } from "./model";
import { cancelSubscriptionForDeletion } from "./billing/service";
import { revokeTokensFor } from "./passwordReset";
import { sendMail, isEmailConfigured } from "./email/send";
import { dormancyWarningMail } from "./email/templates";

/** No activity for this long and the account is erased. */
export const DORMANT_DAYS = 730; // two years

/** The warning goes out this many days before that deadline. */
export const WARNING_LEAD_DAYS = 30;

const DAY = 24 * 60 * 60 * 1000;

/** Stripe statuses that mean money is still moving; never purge these. */
const LIVE_BILLING = new Set(["trialing", "active", "past_due", "unpaid", "incomplete"]);

export interface RetentionInputs {
  account: Account;
  students: StudentProfile[];
  sessions: AuthSession[];
}

/**
 * The most recent sign of life on an account.
 *
 * Deliberately generous, and deliberately not a per-request write: a child
 * practising is the truest signal, a sign-in is the next best, and the
 * account's own creation covers a family that has only just joined. Taking
 * the maximum means every one of those protects the account.
 */
export function lastActivityAt({ account, students, sessions }: RetentionInputs): number {
  let latest = Math.max(account.createdAt ?? 0, account.lastSeenAt ?? 0);
  for (const student of students) {
    for (const s of student.recentSessions ?? []) {
      if (s.completedAt > latest) latest = s.completedAt;
    }
    if ((student.placedAt ?? 0) > latest) latest = student.placedAt!;
    if ((student.createdAt ?? 0) > latest) latest = student.createdAt;
  }
  for (const s of sessions) {
    if (s.createdAt > latest) latest = s.createdAt;
  }
  return latest;
}

export type RetentionAction = "keep" | "warn" | "purge";

export interface RetentionDecision {
  action: RetentionAction;
  reason: string;
  idleDays: number;
}

/** What should happen to one account today, and why. */
export function retentionDecision(inputs: RetentionInputs, now: number): RetentionDecision {
  const { account } = inputs;
  const idleDays = Math.floor((now - lastActivityAt(inputs)) / DAY);

  if (account.role === "ADMIN") return { action: "keep", reason: "admin account", idleDays };
  if (LIVE_BILLING.has(account.billing?.status ?? "")) {
    return { action: "keep", reason: `subscription ${account.billing?.status}`, idleDays };
  }
  if (idleDays >= DORMANT_DAYS) {
    // Only purge a family that had a fair chance to come back: the warning
    // must have gone out, and long enough ago to have been acted on. If mail
    // is unconfigured no warning can exist, so nothing is ever purged — the
    // safe failure, and a loud one in the cron's response.
    const warnedAt = account.retention?.warnedAt;
    if (!warnedAt) return { action: "warn", reason: "overdue but never warned", idleDays };
    if (now - warnedAt < WARNING_LEAD_DAYS * DAY) {
      return { action: "keep", reason: "warned, grace period running", idleDays };
    }
    return { action: "purge", reason: `idle ${idleDays} days, warned ${Math.floor((now - warnedAt) / DAY)} days ago`, idleDays };
  }
  if (idleDays >= DORMANT_DAYS - WARNING_LEAD_DAYS && !account.retention?.warnedAt) {
    return { action: "warn", reason: "approaching the retention limit", idleDays };
  }
  return { action: "keep", reason: "active", idleDays };
}

/**
 * Erase an account and everything attached to it.
 *
 * Shared by the parent's own delete button and the dormancy purge, so the
 * two can never drift apart. Billing is stopped first; a billing failure is
 * logged loudly but never blocks erasure, because the right to have data
 * deleted cannot depend on Stripe being reachable.
 */
export async function eraseAccount(
  account: Account,
  opts: { students?: StudentProfile[]; sessions?: AuthSession[]; context?: string } = {}
): Promise<{ childrenRemoved: number; billingError?: string }> {
  const context = opts.context ?? "account:delete";

  const cancel = await cancelSubscriptionForDeletion(account);
  if (cancel.error) {
    console.error(
      `[${context}] FAILED to cancel subscription ${account.billing?.subscriptionId} for ${account.id}: ${cancel.error} — cancel it manually in the Stripe dashboard.`
    );
  }

  const students = opts.students ?? (await allRows<StudentProfile>("students")).filter((s) => s.accountId === account.id);
  for (const student of students) {
    await deleteRow("students", student.id);
  }

  const sessions = opts.sessions ?? (await allRows<AuthSession>("authSessions")).filter((s) => s.accountId === account.id);
  for (const session of sessions) {
    await deleteRow("authSessions", session.id);
  }

  await revokeTokensFor(account.id);
  await deleteRow("accounts", account.id);

  return { childrenRemoved: students.length, billingError: cancel.error };
}

/** Record that the warning was sent, so the grace period can be measured. */
export async function markWarned(account: Account, now: number): Promise<void> {
  account.retention = { ...(account.retention ?? {}), warnedAt: now };
  await putRow("accounts", account.id, account);
}

export interface RetentionRunResult {
  examined: number;
  warned: number;
  purged: number;
  childrenRemoved: number;
  skippedNoEmail: boolean;
  errors: number;
}

/**
 * One pass over every account. Safe to run daily: decisions are idempotent,
 * and an account already warned is not warned again.
 */
export async function runRetentionSweep(now = Date.now()): Promise<RetentionRunResult> {
  const accounts = await allRows<Account>("accounts");
  const allStudents = await allRows<StudentProfile>("students");
  const allSessions = await allRows<AuthSession>("authSessions");
  const emailReady = isEmailConfigured();

  const result: RetentionRunResult = {
    examined: 0,
    warned: 0,
    purged: 0,
    childrenRemoved: 0,
    skippedNoEmail: !emailReady,
    errors: 0,
  };

  for (const account of accounts) {
    const students = allStudents.filter((s) => s.accountId === account.id);
    const sessions = allSessions.filter((s) => s.accountId === account.id);
    const decision = retentionDecision({ account, students, sessions }, now);
    result.examined++;

    try {
      if (decision.action === "warn") {
        // Without mail there is no way to warn, and without a warning there
        // must be no purge — so the sweep simply waits for the key.
        if (!emailReady) continue;
        const daysLeft = Math.max(1, DORMANT_DAYS + WARNING_LEAD_DAYS - decision.idleDays);
        await sendMail(dormancyWarningMail(account.email, account.name, daysLeft, students.map((s) => s.name)));
        await markWarned(account, now);
        result.warned++;
      } else if (decision.action === "purge") {
        const erased = await eraseAccount(account, { students, sessions, context: "retention:purge" });
        result.purged++;
        result.childrenRemoved += erased.childrenRemoved;
        console.info(`[retention] purged ${account.id}: ${decision.reason}`);
      }
    } catch (err) {
      result.errors++;
      console.error(`[retention] ${decision.action} failed for ${account.id}:`, err instanceof Error ? err.message : err);
    }
  }

  return result;
}
