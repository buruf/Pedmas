import { describe, it, expect } from "vitest";
import { fingerprintOf, recordError, recentErrors, dismissError, type ErrorGroup } from "@/lib/errors";
import { getRow } from "@/lib/store/db";

describe("error fingerprinting", () => {
  it("collapses variable parts into one group", () => {
    const a = fingerprintOf("server", "student stu_x8k2m4n9p1 not found", "GET /api/students/stu_x8k2m4n9p1");
    const b = fingerprintOf("server", "student stu_q7w3e5r8t2 not found", "GET /api/students/stu_q7w3e5r8t2");
    expect(a).toBe(b);
  });

  it("separates genuinely different errors and sources", () => {
    const a = fingerprintOf("server", "database timeout", "/api/x");
    expect(fingerprintOf("server", "permission denied", "/api/x")).not.toBe(a);
    expect(fingerprintOf("client", "database timeout", "/api/x")).not.toBe(a);
  });

  it("masks numbers and quoted values", () => {
    expect(fingerprintOf("client", 'Cannot read "score" of row 42')).toBe(
      fingerprintOf("client", 'Cannot read "streak" of row 7')
    );
  });
});

describe("recording", () => {
  it("groups repeats into one row with a running count", async () => {
    const msg = `test-error-${Math.random().toString(36).slice(2)}`;
    const id = fingerprintOf("server", msg, "/api/test");
    try {
      await recordError("server", { message: msg, stack: "at test" }, "/api/test");
      await recordError("server", { message: msg }, "/api/test");
      const group = await getRow<ErrorGroup>("errorEvents", id);
      expect(group?.count).toBe(2);
      expect(group?.firstSeen).toBeLessThanOrEqual(group!.lastSeen);
      const listed = await recentErrors();
      expect(listed.some((g) => g.id === id)).toBe(true);
    } finally {
      await dismissError(id);
    }
  });

  it("caps huge messages and stacks instead of storing them whole", async () => {
    const msg = "x".repeat(5000);
    const id = fingerprintOf("client", msg.slice(0, 500) + "…");
    try {
      await recordError("client", { message: msg, stack: "y".repeat(50000) });
      const group = await getRow<ErrorGroup>("errorEvents", id);
      expect(group).toBeDefined();
      expect(group!.message.length).toBeLessThanOrEqual(501);
      expect(group!.stack!.length).toBeLessThanOrEqual(4001);
    } finally {
      await dismissError(id);
    }
  });

  it("never throws, even when given garbage", async () => {
    try {
      await expect(recordError("client", { message: "" })).resolves.toBeUndefined();
      await expect(
        recordError("server", { message: 123 as unknown as string })
      ).resolves.toBeUndefined();
    } finally {
      // The garbage still lands in the shared dev store — leave no residue.
      await dismissError(fingerprintOf("client", "Unknown error"));
      await dismissError(fingerprintOf("server", "123"));
    }
  });
});
