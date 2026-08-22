import { describe, it, expect } from "vitest";
import {
  lastActivityAt,
  retentionDecision,
  DORMANT_DAYS,
  WARNING_LEAD_DAYS,
} from "@/lib/retention";
import type { Account, AuthSession, StudentProfile } from "@/lib/model";

/**
 * This module deletes families' data, so the tests are written around the
 * ways it could do that wrongly rather than around the happy path.
 */

const DAY = 24 * 60 * 60 * 1000;
const NOW = 1_800_000_000_000;
const daysAgo = (n: number) => NOW - n * DAY;

const account = (over: Partial<Account> = {}): Account =>
  ({
    id: "acc_1",
    email: "parent@example.com",
    passwordHash: "x",
    role: "PARENT",
    name: "Parent",
    createdAt: daysAgo(1000),
    ...over,
  }) as Account;

const student = (over: Partial<StudentProfile> = {}): StudentProfile =>
  ({
    id: "stu_1",
    accountId: "acc_1",
    name: "Child",
    grade: 3,
    createdAt: daysAgo(1000),
    strandLevels: {},
    pointers: {},
    skills: {},
    recentSessions: [],
    streak: { count: 0, lastDay: "" },
    ...over,
  }) as StudentProfile;

const inputs = (over: { account?: Partial<Account>; students?: StudentProfile[]; sessions?: AuthSession[] } = {}) => ({
  account: account(over.account),
  students: over.students ?? [],
  sessions: over.sessions ?? [],
});

describe("last activity", () => {
  it("counts a child's practice as activity, not just the parent's sign-in", () => {
    const at = lastActivityAt(
      inputs({ students: [student({ recentSessions: [{ id: "s", dayKey: "", total: 5, firstTryCorrect: 4, completedAt: daysAgo(3) }] })] })
    );
    expect(Math.round((NOW - at) / DAY)).toBe(3);
  });

  it("counts a sign-in", () => {
    const at = lastActivityAt(
      inputs({ sessions: [{ id: "t", accountId: "acc_1", createdAt: daysAgo(10), expiresAt: NOW } as AuthSession] })
    );
    expect(Math.round((NOW - at) / DAY)).toBe(10);
  });

  it("takes the most recent signal of several", () => {
    const at = lastActivityAt(
      inputs({
        account: { lastSeenAt: daysAgo(50) },
        students: [student({ recentSessions: [{ id: "s", dayKey: "", total: 1, firstTryCorrect: 1, completedAt: daysAgo(2) }] })],
        sessions: [{ id: "t", accountId: "acc_1", createdAt: daysAgo(400), expiresAt: NOW } as AuthSession],
      })
    );
    expect(Math.round((NOW - at) / DAY)).toBe(2);
  });

  it("treats a brand-new account with no activity as new, not dormant", () => {
    const d = retentionDecision(inputs({ account: { createdAt: daysAgo(1) } }), NOW);
    expect(d.action).toBe("keep");
  });
});

describe("decisions", () => {
  it("keeps an active family", () => {
    const d = retentionDecision(
      inputs({ students: [student({ recentSessions: [{ id: "s", dayKey: "", total: 1, firstTryCorrect: 1, completedAt: daysAgo(5) }] })] }),
      NOW
    );
    expect(d.action).toBe("keep");
  });

  it("warns as the limit approaches", () => {
    const d = retentionDecision(inputs({ account: { createdAt: daysAgo(DORMANT_DAYS - 10) } }), NOW);
    expect(d.action).toBe("warn");
  });

  it("does not warn twice", () => {
    const d = retentionDecision(
      inputs({ account: { createdAt: daysAgo(DORMANT_DAYS - 10), retention: { warnedAt: daysAgo(2) } } }),
      NOW
    );
    expect(d.action).toBe("keep");
  });

  it("never purges without a warning first", () => {
    const d = retentionDecision(inputs({ account: { createdAt: daysAgo(DORMANT_DAYS + 500) } }), NOW);
    expect(d.action).toBe("warn");
  });

  it("respects the grace period after warning", () => {
    const d = retentionDecision(
      inputs({ account: { createdAt: daysAgo(DORMANT_DAYS + 5), retention: { warnedAt: daysAgo(WARNING_LEAD_DAYS - 1) } } }),
      NOW
    );
    expect(d.action).toBe("keep");
  });

  it("purges once warned and past the grace period", () => {
    const d = retentionDecision(
      inputs({ account: { createdAt: daysAgo(DORMANT_DAYS + 40), retention: { warnedAt: daysAgo(WARNING_LEAD_DAYS + 1) } } }),
      NOW
    );
    expect(d.action).toBe("purge");
  });

  it("never purges a paying family, however idle", () => {
    for (const status of ["trialing", "active", "past_due", "unpaid", "incomplete"]) {
      const d = retentionDecision(
        inputs({
          account: {
            createdAt: daysAgo(DORMANT_DAYS + 400),
            retention: { warnedAt: daysAgo(400) },
            billing: { status },
          },
        }),
        NOW
      );
      expect(d.action, `status ${status} must protect the account`).toBe("keep");
    }
  });

  it("does purge an account whose subscription has ended", () => {
    const d = retentionDecision(
      inputs({
        account: {
          createdAt: daysAgo(DORMANT_DAYS + 40),
          retention: { warnedAt: daysAgo(WARNING_LEAD_DAYS + 1) },
          billing: { status: "canceled" },
        },
      }),
      NOW
    );
    expect(d.action).toBe("purge");
  });

  it("never touches the admin account", () => {
    const d = retentionDecision(
      inputs({ account: { role: "ADMIN", createdAt: daysAgo(DORMANT_DAYS + 900), retention: { warnedAt: daysAgo(500) } } }),
      NOW
    );
    expect(d.action).toBe("keep");
  });

  it("keeps the policy honest: warning lead is shorter than the dormancy window", () => {
    expect(WARNING_LEAD_DAYS).toBeLessThan(DORMANT_DAYS);
    expect(DORMANT_DAYS).toBeGreaterThanOrEqual(365);
  });
});
