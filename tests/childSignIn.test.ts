import { describe, it, expect } from "vitest";
import {
  generateCode,
  normalizeCode,
  issueCode,
  revokeCode,
  studentForCode,
  hasSignIn,
} from "@/lib/childSignIn";
import { putRow, getRow, newId } from "@/lib/store/db";
import type { StudentProfile } from "@/lib/model";

/**
 * A child's code is the only secret standing between a stranger and a
 * child's learning history, so these tests care about the credential
 * properties first and the ergonomics second.
 */

async function makeStudent(name = "Zara", accountId = "acc_1"): Promise<StudentProfile> {
  const student = {
    id: newId("stu"),
    accountId,
    name,
    grade: 8,
    createdAt: Date.now(),
    strandLevels: {},
    pointers: {},
    skills: {},
    recentSessions: [],
    streak: { count: 0, lastDay: "" },
  } as StudentProfile;
  await putRow("students", student.id, student);
  return student;
}

describe("the code itself", () => {
  it("is long and unguessable, and never repeats", () => {
    const codes = new Set(Array.from({ length: 200 }, () => generateCode()));
    expect(codes.size).toBe(200);
    for (const code of codes) {
      expect(normalizeCode(code)).toHaveLength(12);
    }
  });

  it("avoids characters a child would mistype", () => {
    for (let i = 0; i < 100; i++) {
      // No O/0, I/1 or S/5 confusions.
      expect(generateCode()).not.toMatch(/[OIS015]/);
    }
  });

  it("forgives how a child types it — case, spaces, missing dashes", async () => {
    const student = await makeStudent();
    const code = await issueCode(student);
    for (const variant of [code, code.toLowerCase(), code.replace(/-/g, ""), ` ${code} `, code.replace(/-/g, " ")]) {
      const found = await studentForCode(variant);
      expect(found?.id, `failed for "${variant}"`).toBe(student.id);
    }
  });
});

describe("storage and revocation", () => {
  it("stores only a hash — the code cannot be read back", async () => {
    const student = await makeStudent();
    const code = await issueCode(student);
    const stored = await getRow<StudentProfile>("students", student.id);
    const serialized = JSON.stringify(stored);
    expect(serialized).not.toContain(normalizeCode(code));
    expect(stored?.signIn?.codeHash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("replaces the old code when a new one is issued", async () => {
    const student = await makeStudent();
    const first = await issueCode(student);
    const second = await issueCode(student);
    expect(await studentForCode(second)).not.toBeNull();
    expect(await studentForCode(first), "the replaced code still works").toBeNull();
  });

  it("stops working once revoked", async () => {
    const student = await makeStudent();
    const code = await issueCode(student);
    expect(hasSignIn(student)).toBe(true);
    await revokeCode(student);
    expect(hasSignIn(student)).toBe(false);
    expect(await studentForCode(code)).toBeNull();
  });

  it("rejects rubbish without matching anyone", async () => {
    await makeStudent();
    for (const bad of ["", "abc", "----", "0000-0000-0000", "not a code at all"]) {
      expect(await studentForCode(bad), `matched on "${bad}"`).toBeNull();
    }
  });

  it("never matches one child's code to another child", async () => {
    const a = await makeStudent("Amina", "acc_a");
    const b = await makeStudent("Noah", "acc_b");
    const codeA = await issueCode(a);
    await issueCode(b);
    const found = await studentForCode(codeA);
    expect(found?.id).toBe(a.id);
    expect(found?.id).not.toBe(b.id);
  });
});

describe("a child must not be locked out by their own typing", () => {
  it("forgets failed attempts once the right code is entered", async () => {
    const { rateLimit, clearRateLimit } = await import("@/lib/rateLimit");
    const key = "test-family-address";

    // Three fumbles at the code.
    for (let i = 0; i < 3; i++) await rateLimit("childSignIn", key, 20, 900);
    // Then they get it right, which clears the slate.
    await clearRateLimit("childSignIn", key);

    const after = await rateLimit("childSignIn", key, 20, 900);
    expect(after.ok).toBe(true);
    expect(after.remaining, "earlier mistakes still counted").toBe(19);
  });

  it("leaves room for a whole family on one address", async () => {
    const { rateLimit } = await import("@/lib/rateLimit");
    const key = "busy-household";
    // Four children, a couple of fumbles each, all in one evening.
    let last = { ok: true, remaining: 0, retryAfterSeconds: 0 };
    for (let i = 0; i < 12; i++) last = await rateLimit("childSignIn", key, 20, 900);
    expect(last.ok, "a family of four was locked out on one address").toBe(true);
  });
});
