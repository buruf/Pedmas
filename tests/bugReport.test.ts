import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

/**
 * The bug-report privacy contract: a child session can never attach free
 * text. The policy says "we do not ask children to write free text about
 * themselves", and a report box is exactly where a child would type their
 * name or school — so the rule must hold server-side, whatever the client
 * sends, and the child UI must not even show a text field.
 */

const route = readFileSync(join(process.cwd(), "src/app/api/students/[id]/report/route.ts"), "utf8");
const ui = readFileSync(join(process.cwd(), "src/components/ReportProblem.tsx"), "utf8");

describe("children cannot submit free text", () => {
  it("the server drops message on child sessions regardless of the client", () => {
    expect(route).toMatch(/const isChild = Boolean\(await sessionStudentId\(\)\)/);
    expect(route, "message must be gated on NOT being a child session").toMatch(
      /const message = !isChild && typeof body\?\.message === "string"/
    );
  });

  it("the child UI offers no text input at all", () => {
    expect(ui).not.toMatch(/<textarea/i);
    expect(ui).not.toMatch(/<input/i);
  });

  it("the skill id is derived from the question id, never client-supplied", () => {
    // The exact pattern matters: an escaping accident once turned \d into d
    // and a loose static check missed it — only reading the stored report
    // caught it. Pin the real regex, and prove it behaves.
    expect(route).toContain(String.raw`qid.replace(/\.s\d+\.\d+$/, "")`);
    const derive = (qid: string) => qid.replace(/\.s\d+\.\d+$/, "");
    expect(derive("g2.number.counting-to-1-000.s1.999")).toBe("g2.number.counting-to-1-000");
    expect(derive("g11.trig.unit-circle.s5.123456")).toBe("g11.trig.unit-circle");
    expect(route).not.toMatch(/question\?\.skillId/);
  });

  it("reports are rate limited", () => {
    expect(route).toMatch(/rateLimit\("bugReport"/);
  });

  it("categories are a fixed allowlist", () => {
    expect(route).toMatch(/CATEGORIES\.has\(body\.category\)/);
  });
});

describe("the route honours the child scope like every student route", () => {
  it("uses guardStudentScope", () => {
    expect(route).toMatch(/guardStudentScope\(id\)/);
  });
});
