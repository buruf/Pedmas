import { describe, it, expect, vi, beforeEach } from "vitest";
import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

/**
 * A child session must be able to practise and nothing else.
 *
 * The risk this guards against is concrete: before child sign-in existed, a
 * child using the family laptop held the parent's session, one click from
 * the billing portal and from deleting every child's history. These tests
 * check the guard behaves, and then check — statically — that no sensitive
 * route was left on the weaker guard, because the next route someone adds
 * is where this would quietly regress.
 */

const cookieStore = { value: "" };
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => (name === "pedmas_session" && cookieStore.value ? { value: cookieStore.value } : undefined),
    set: () => undefined,
  }),
}));

const { requireParent, requireAccount, guardStudentScope, isResponse } = await import("@/lib/api");
const { putRow, newId } = await import("@/lib/store/db");
import type { Account, AuthSession, StudentProfile } from "@/lib/model";

const ACCOUNT_ID = "acc_family";

async function seed() {
  await putRow("accounts", ACCOUNT_ID, {
    id: ACCOUNT_ID,
    email: "parent@example.com",
    passwordHash: "x:y",
    role: "PARENT",
    name: "Parent",
    createdAt: Date.now(),
  } as Account);
  for (const [id, name] of [["stu_zara", "Zara"], ["stu_noah", "Noah"]] as const) {
    await putRow("students", id, {
      id, accountId: ACCOUNT_ID, name, grade: 8, createdAt: Date.now(),
      strandLevels: {}, pointers: {}, skills: {}, recentSessions: [], streak: { count: 0, lastDay: "" },
    } as StudentProfile);
  }
}

async function signIn(opts: { studentId?: string } = {}) {
  const token = newId("sess");
  await putRow("authSessions", token, {
    id: token,
    accountId: ACCOUNT_ID,
    createdAt: Date.now(),
    expiresAt: Date.now() + 60_000,
    ...(opts.studentId ? { studentId: opts.studentId } : {}),
  } as AuthSession);
  cookieStore.value = token;
}

beforeEach(seed);

describe("a child session is confined to their own learning", () => {
  it("is refused anything a parent owns", async () => {
    await signIn({ studentId: "stu_zara" });
    const result = await requireParent();
    expect(isResponse(result), "a child reached a parent-only endpoint").toBe(true);
    expect((result as Response).status).toBe(403);
  });

  it("cannot reach a sibling", async () => {
    await signIn({ studentId: "stu_zara" });
    const blocked = await guardStudentScope("stu_noah");
    expect(blocked, "a child reached a sibling's record").not.toBeNull();
    // 404 rather than 403: a sibling's existence is not the child's business.
    expect(blocked!.status).toBe(404);
  });

  it("can still reach itself", async () => {
    await signIn({ studentId: "stu_zara" });
    expect(await guardStudentScope("stu_zara")).toBeNull();
    const account = await requireAccount();
    expect(isResponse(account)).toBe(false);
  });
});

describe("a parent session keeps full access", () => {
  it("passes the parent guard", async () => {
    await signIn();
    const result = await requireParent();
    expect(isResponse(result), "a parent was refused their own account").toBe(false);
  });

  it("may reach every one of their children", async () => {
    await signIn();
    expect(await guardStudentScope("stu_zara")).toBeNull();
    expect(await guardStudentScope("stu_noah")).toBeNull();
  });
});

describe("no sensitive route may sit on the weaker guard", () => {
  /** Route files whose reach must be adult-only. */
  const SENSITIVE = ["/api/account", "/api/billing", "/api/admin", "/api/students/route.ts"];

  function routeFiles(dir: string): string[] {
    return readdirSync(dir).flatMap((entry) => {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) return routeFiles(full);
      return entry === "route.ts" ? [full] : [];
    });
  }

  it("keeps money, account and admin endpoints on requireParent", () => {
    const offenders: string[] = [];
    for (const file of routeFiles(join(process.cwd(), "src/app/api"))) {
      const rel = file.replace(/\\/g, "/").split("/src/app")[1];
      const sensitive = SENSITIVE.some((s) => rel.startsWith(s) || rel.endsWith(s));
      if (!sensitive) continue;
      const body = readFileSync(file, "utf8");
      if (/\brequireAccount\b/.test(body)) offenders.push(rel);
    }
    expect(offenders, "these are reachable by a child session").toEqual([]);
  });

  it("scopes every per-student route to the signed-in child", () => {
    const unscoped: string[] = [];
    const base = join(process.cwd(), "src/app/api/students/[id]");
    for (const file of routeFiles(base)) {
      const body = readFileSync(file, "utf8");
      // The sign-in route is parent-only, so it needs no per-child scope.
      if (/\brequireParent\b/.test(body)) continue;
      if (!/guardStudentScope/.test(body)) unscoped.push(file.replace(/\\/g, "/").split("/src/app")[1]);
    }
    expect(unscoped, "a child could reach a sibling through these").toEqual([]);
  });
});

describe("payloads are scoped too, not only routes", () => {
  it("hides the parent's email and every sibling from a child session", async () => {
    // Regression: /api/auth/me passed the route guard (any session may call
    // it) and returned the parent's email plus all four siblings' names.
    const source = readFileSync(join(process.cwd(), "src/app/api/auth/me/route.ts"), "utf8");
    expect(source, "me route must consult the session scope").toMatch(/sessionStudentId/);
    expect(source, "me must filter the student list for a child").toMatch(/scopedStudentId \? all\.filter/);
    expect(source, "a child must not receive the account email").toMatch(/scopedStudentId \? undefined : account\.email/);
  });
});
