import { describe, it, expect } from "vitest";
import { buildWeeklyStory, shouldSendWeekly } from "@/lib/weeklyStory";
import { unsubscribeSig, verifyUnsubscribeSig } from "@/lib/email/unsubscribe";
import { weeklyProgressMail } from "@/lib/email/templates";
import { allSkills } from "@/curriculum";
import type { StudentProfile, SessionSummary } from "@/lib/model";
import type { AttemptRecord } from "@/engine/mastery";

const NOW = 1_800_000_000_000;
const DAY = 24 * 60 * 60 * 1000;
const WEEK = 7 * DAY;

const SKILL = allSkills().find((s) => s.id === "g1.number.counting")!;
const OTHER = allSkills().find((s) => s.strandId === SKILL.strandId && s.id !== SKILL.id)!;

function attempts(n: number, correct: number, ts: number): AttemptRecord[] {
  return Array.from({ length: n }, (_, i) => ({
    ts,
    stage: 2,
    correct: i < correct,
    eventuallyCorrect: true,
    usedHint: false,
    sessionId: "s",
  }));
}

function session(completedAt: number, total = 12, firstTry = 9): SessionSummary {
  return { id: "x", dayKey: "2027-01-01", total, firstTryCorrect: firstTry, completedAt, activeMs: 10 * 60000 };
}

function student(overrides: Partial<StudentProfile> = {}): StudentProfile {
  return {
    id: "stu1",
    accountId: "a1",
    name: "Amina",
    grade: 2,
    createdAt: 0,
    strandLevels: { [SKILL.strandId]: 1 },
    pointers: { [SKILL.strandId]: SKILL.id },
    skills: {},
    recentSessions: [],
    streak: { count: 3, lastDay: "" },
    ...overrides,
  };
}

describe("dormancy rule", () => {
  it("sends on an active week", () => {
    expect(shouldSendWeekly([session(NOW - DAY)], NOW)).toBe(true);
  });
  it("nudges exactly the first quiet week, then goes silent", () => {
    const wentQuiet = [session(NOW - 10 * DAY)]; // active last week, not this week
    expect(shouldSendWeekly(wentQuiet, NOW)).toBe(true);
    const longQuiet = [session(NOW - 20 * DAY)];
    expect(shouldSendWeekly(longQuiet, NOW)).toBe(false);
    expect(shouldSendWeekly([], NOW)).toBe(false);
  });
});

describe("weekly story", () => {
  it("reports skills mastered this week, excluding placement-assumed ones", () => {
    const s = student({
      skills: {
        [SKILL.id]: { skillId: SKILL.id, stage: 5, stageMastered: 5, attempts: [], mastered: true, masteredAt: NOW - DAY },
        [OTHER.id]: { skillId: OTHER.id, stage: 5, stageMastered: 5, attempts: [], mastered: true, masteredAt: NOW - DAY, assumed: true },
      },
    });
    const story = buildWeeklyStory(s, NOW, "INTL");
    expect(story.masteredThisWeek).toEqual([SKILL.name]);
  });

  it("flags at most one struggle and offers a matching question to try", () => {
    const s = student({
      skills: {
        [SKILL.id]: {
          skillId: SKILL.id,
          stage: 2,
          stageMastered: 1,
          attempts: attempts(10, 3, NOW - DAY), // 30% first-try
          mastered: false,
        },
      },
      recentSessions: [session(NOW - DAY)],
    });
    const story = buildWeeklyStory(s, NOW, "INTL");
    expect(story.workingHardOn?.skillName).toBe(SKILL.name);
    expect(story.workingHardOn?.stageLabel).toBeTruthy();
    if (story.tryThis) {
      expect(story.tryThis.prompt).not.toContain("\n");
      expect(story.tryThis.prompt.length).toBeLessThanOrEqual(140);
      expect(story.tryThis.answer.length).toBeGreaterThan(0);
    }
  });

  it("does not manufacture a struggle from thin or good data", () => {
    const s = student({
      skills: {
        [SKILL.id]: { skillId: SKILL.id, stage: 2, stageMastered: 1, attempts: attempts(10, 9, NOW - DAY), mastered: false },
        [OTHER.id]: { skillId: OTHER.id, stage: 1, stageMastered: 0, attempts: attempts(3, 0, NOW - DAY), mastered: false },
      },
      recentSessions: [session(NOW - DAY)],
    });
    // 90% is not a struggle; 0/3 is too few attempts to say anything.
    expect(buildWeeklyStory(s, NOW, "INTL").workingHardOn).toBeNull();
  });

  it("is identical on a re-run, so a retried cron resends the same mail", () => {
    const s = student({ recentSessions: [session(NOW - DAY)] });
    const a = buildWeeklyStory(s, NOW, "US");
    const b = buildWeeklyStory(s, NOW, "US");
    expect(a).toEqual(b);
  });
});

describe("unsubscribe signature", () => {
  it("round-trips with the secret set and refuses forgeries", () => {
    const prev = process.env.CRON_SECRET;
    process.env.CRON_SECRET = "test-secret";
    try {
      const sig = unsubscribeSig("acc_123")!;
      expect(verifyUnsubscribeSig("acc_123", sig)).toBe(true);
      expect(verifyUnsubscribeSig("acc_456", sig)).toBe(false);
      expect(verifyUnsubscribeSig("acc_123", sig.slice(0, -1) + "0")).toBe(false);
    } finally {
      if (prev === undefined) delete process.env.CRON_SECRET;
      else process.env.CRON_SECRET = prev;
    }
  });
  it("renders no link without a secret", () => {
    const prev = process.env.CRON_SECRET;
    delete process.env.CRON_SECRET;
    try {
      expect(unsubscribeSig("acc_123")).toBeNull();
    } finally {
      if (prev !== undefined) process.env.CRON_SECRET = prev;
    }
  });
});

describe("weekly mail rendering", () => {
  it("leads the subject with a mastery when there is one", () => {
    const s = student({
      skills: {
        [SKILL.id]: { skillId: SKILL.id, stage: 5, stageMastered: 5, attempts: [], mastered: true, masteredAt: NOW - DAY },
      },
      recentSessions: [session(NOW - DAY)],
    });
    const mail = weeklyProgressMail("p@x.com", "Sam", [buildWeeklyStory(s, NOW, "INTL")], "https://x/d", null);
    expect(mail.subject).toBe(`Amina moved past ${SKILL.name} this week`);
    expect(mail.html).toContain("Moved past this week");
    expect(mail.text).toContain(SKILL.name);
  });

  it("escapes child-controlled text and includes the unsubscribe link when given", () => {
    const s = student({ name: "<b>Kid</b>", recentSessions: [session(NOW - DAY)] });
    const mail = weeklyProgressMail("p@x.com", "Sam", [buildWeeklyStory(s, NOW, "INTL")], "https://x/d", "https://x/u?sig=1");
    expect(mail.html).not.toContain("<b>Kid</b>");
    expect(mail.html).toContain("&lt;b&gt;Kid&lt;/b&gt;");
    expect(mail.html).toContain("https://x/u?sig=1");
    expect(mail.text).toContain("https://x/u?sig=1");
  });
});
