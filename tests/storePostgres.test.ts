import { describe, it, expect, beforeAll } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { buildSchema, migrateFromKv, crudSql, LOOKUP_SQL, type Exec } from "@/lib/store/db";

/**
 * The Postgres layer, executed against a real Postgres (PGlite, in-process).
 * These run the exact statements production sends to Neon — the schema DDL,
 * the one-time KV migration, the CRUD statements, and the indexed lookups —
 * so a syntax error, a bad generated-column expression, or a migration that
 * resurrects deleted rows fails here instead of on a production cold start.
 */

function execFor(pg: PGlite): Exec {
  return async (text, params) => (await pg.query(text, params as unknown[])).rows as unknown[];
}

async function freshWithLegacy(): Promise<{ pg: PGlite; exec: Exec }> {
  const pg = new PGlite();
  const exec = execFor(pg);
  await exec(`
    CREATE TABLE pedmas_rows (
      tbl text NOT NULL, id text NOT NULL, data jsonb NOT NULL,
      updated_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY (tbl, id)
    )`);
  const seed = (tbl: string, id: string, data: object) =>
    exec(`INSERT INTO pedmas_rows (tbl, id, data) VALUES ($1, $2, $3::jsonb)`, [tbl, id, JSON.stringify(data)]);
  await seed("accounts", "acc_1", { id: "acc_1", email: "One@Example.com", role: "PARENT", billing: { customerId: "cus_A" } });
  await seed("accounts", "acc_2", { id: "acc_2", email: "two@example.com", role: "PARENT" });
  await seed("students", "stu_1", { id: "stu_1", accountId: "acc_1", name: "Kid" });
  await seed("students", "stu_2", { id: "stu_2", accountId: "acc_2", name: "Other" });
  await seed("authSessions", "tok_1", { id: "tok_1", accountId: "acc_1", expiresAt: 1 });
  await seed("stripeEvents", "evt_1", { id: "evt_1", at: 1 });
  return { pg, exec };
}

describe("per-entity schema against real Postgres", () => {
  let exec: Exec;

  beforeAll(async () => {
    ({ exec } = await freshWithLegacy());
    await buildSchema(exec);
  });

  it("migrates every legacy row into its entity table", async () => {
    expect((await exec(`SELECT id FROM accounts ORDER BY id`)).length).toBe(2);
    expect((await exec(`SELECT id FROM students`)).length).toBe(2);
    expect((await exec(`SELECT id FROM auth_sessions`)).length).toBe(1);
    expect((await exec(`SELECT id FROM stripe_events`)).length).toBe(1);
    const marker = await exec(`SELECT value FROM store_meta WHERE key = 'migrated_from_kv'`);
    expect(marker.length).toBe(1);
  });

  it("is idempotent, and never resurrects a deleted row", async () => {
    await exec(crudSql("accounts").del, ["acc_2"]);
    // A later cold start runs the whole schema again.
    await buildSchema(exec);
    const rows = await exec(`SELECT id FROM accounts`);
    expect(rows).toEqual([{ id: "acc_1" }]);
  });

  it("serves the indexed lookups from the generated columns", async () => {
    // Case-insensitive email: stored as One@Example.com, looked up lowercased.
    const byEmail = (await exec(LOOKUP_SQL.accountByEmail, ["one@example.com"])) as { data: { id: string } }[];
    expect(byEmail[0]?.data.id).toBe("acc_1");
    const byCustomer = (await exec(LOOKUP_SQL.accountByCustomerId, ["cus_A"])) as { data: { id: string } }[];
    expect(byCustomer[0]?.data.id).toBe("acc_1");
    const kids = (await exec(LOOKUP_SQL.studentsByAccount, ["acc_1"])) as { data: { id: string } }[];
    expect(kids.map((k) => k.data.id)).toEqual(["stu_1"]);
  });

  it("upserts through the CRUD statements and keeps generated columns fresh", async () => {
    const sql = crudSql("accounts");
    await exec(sql.put, ["acc_3", JSON.stringify({ id: "acc_3", email: "Three@Example.com" })]);
    await exec(sql.put, ["acc_3", JSON.stringify({ id: "acc_3", email: "renamed@example.com" })]);
    const found = (await exec(LOOKUP_SQL.accountByEmail, ["renamed@example.com"])) as { data: { id: string } }[];
    expect(found[0]?.data.id).toBe("acc_3");
    // The old address no longer matches anything — the generated column moved.
    expect(await exec(LOOKUP_SQL.accountByEmail, ["three@example.com"])).toEqual([]);
  });

  it("rejects a second account with the same email at the database", async () => {
    await expect(
      exec(crudSql("accounts").put, ["acc_dup", JSON.stringify({ id: "acc_dup", email: "ONE@example.com" })])
    ).rejects.toThrow(/accounts_email_key|duplicate key/);
  });
});

describe("fresh install with no legacy table", () => {
  it("builds the schema and marks migration done without pedmas_rows", async () => {
    const pg = new PGlite();
    const exec = execFor(pg);
    await buildSchema(exec);
    const marker = (await exec(`SELECT value FROM store_meta WHERE key = 'migrated_from_kv'`)) as {
      value: { hadLegacyTable: boolean };
    }[];
    expect(marker.length).toBe(1);
    expect(marker[0].value.hadLegacyTable).toBe(false);
    // And the store is usable immediately.
    await exec(crudSql("students").put, ["stu_x", JSON.stringify({ id: "stu_x", accountId: "acc_9" })]);
    const kids = (await exec(LOOKUP_SQL.studentsByAccount, ["acc_9"])) as unknown[];
    expect(kids.length).toBe(1);
  });
});

describe("duplicate legacy emails degrade gracefully", () => {
  it("falls back to a plain index and keeps every row", async () => {
    const pg = new PGlite();
    const exec = execFor(pg);
    await exec(`
      CREATE TABLE pedmas_rows (
        tbl text NOT NULL, id text NOT NULL, data jsonb NOT NULL,
        updated_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY (tbl, id)
      )`);
    for (const id of ["acc_a", "acc_b"]) {
      await exec(`INSERT INTO pedmas_rows (tbl, id, data) VALUES ('accounts', $1, $2::jsonb)`, [
        id,
        JSON.stringify({ id, email: "same@example.com" }),
      ]);
    }
    await buildSchema(exec); // must not throw
    expect((await exec(`SELECT id FROM accounts`)).length).toBe(2);
    const unique = await exec(`SELECT indexname FROM pg_indexes WHERE indexname = 'accounts_email_key'`);
    expect(unique.length).toBe(0);
    const fallback = await exec(`SELECT indexname FROM pg_indexes WHERE indexname = 'accounts_email_idx'`);
    expect(fallback.length).toBe(1);
  });
});
