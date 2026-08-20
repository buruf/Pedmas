import { describe, it, expect } from "vitest";
import {
  accountByEmail,
  accountByCustomerId,
  studentsByAccount,
  isUniqueViolation,
  putRow,
  deleteRow,
  newId,
} from "@/lib/store/db";

/**
 * The store runs in file mode under tests (no DATABASE_URL), so these cover
 * the lookup helpers' fallback paths and the pieces of the Postgres layer
 * that are pure. The SQL paths mirror these exact semantics — email
 * normalized to lowercase, customer id nested under billing, students keyed
 * by accountId — which is what the assertions pin down.
 */

describe("indexed lookup helpers (file-mode semantics)", () => {
  it("finds an account by email case-insensitively", async () => {
    const id = newId("acc");
    await putRow("accounts", id, { id, email: "family@example.com", role: "PARENT" });
    try {
      const hit = await accountByEmail<{ id: string }>("  Family@Example.COM ");
      expect(hit?.id).toBe(id);
      expect(await accountByEmail("nobody@example.com")).toBeUndefined();
    } finally {
      await deleteRow("accounts", id);
    }
  });

  it("finds an account by Stripe customer id", async () => {
    const id = newId("acc");
    await putRow("accounts", id, { id, email: `${id}@x.com`, billing: { customerId: "cus_T1" } });
    try {
      const hit = await accountByCustomerId<{ id: string }>("cus_T1");
      expect(hit?.id).toBe(id);
      expect(await accountByCustomerId("cus_missing")).toBeUndefined();
    } finally {
      await deleteRow("accounts", id);
    }
  });

  it("returns exactly the students owned by an account", async () => {
    const a = newId("acc");
    const mine = newId("stu");
    const other = newId("stu");
    await putRow("students", mine, { id: mine, accountId: a, name: "Mine" });
    await putRow("students", other, { id: other, accountId: "someone-else", name: "Other" });
    try {
      const rows = await studentsByAccount<{ id: string }>(a);
      expect(rows.map((r) => r.id)).toEqual([mine]);
    } finally {
      await deleteRow("students", mine);
      await deleteRow("students", other);
    }
  });
});

describe("unique-violation detection", () => {
  it("recognizes the Postgres error code and the index name", () => {
    const byCode = Object.assign(new Error("duplicate key value"), { code: "23505" });
    expect(isUniqueViolation(byCode, "accounts_email_key")).toBe(true);
    expect(isUniqueViolation(new Error('violates unique constraint "accounts_email_key"'), "accounts_email_key")).toBe(true);
    expect(isUniqueViolation(new Error("connection refused"), "accounts_email_key")).toBe(false);
    expect(isUniqueViolation("not an error", "accounts_email_key")).toBe(false);
  });
});
