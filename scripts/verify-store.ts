/**
 * Round-trips a row through whichever store backend is configured.
 *
 * Run this before trusting a new DATABASE_URL — it proves the schema can be
 * created and that write, read, list and delete all behave, rather than
 * finding out from a failed signup in production.
 *
 *   npx tsx scripts/verify-store.ts
 */
import { getRow, putRow, deleteRow, allRows, newId, storeBackend, storeConfigProblems } from "../src/lib/store/db";

interface Probe {
  id: string;
  note: string;
  nested: { count: number; when: string };
}

async function main() {
  const backend = storeBackend();
  const missing = storeConfigProblems();
  console.log(`backend: ${backend}`);
  if (backend === "file") {
    console.log(`(no database configured — missing ${missing.join(", ")}; using data/ files)`);
  }

  const table = "storeProbe";
  const id = newId("probe");
  const row: Probe = { id, note: "verify-store round trip", nested: { count: 42, when: new Date(0).toISOString() } };

  const fail = (msg: string): never => {
    console.error(`FAIL: ${msg}`);
    process.exit(1);
  };

  await putRow(table, id, row);
  const read = await getRow<Probe>(table, id);
  if (!read) fail("row was not readable after write");
  if (read!.note !== row.note) fail(`note mismatch: ${read!.note}`);
  if (read!.nested?.count !== 42) fail("nested object did not survive the round trip");
  console.log("write + read      ok");

  const listed = await allRows<Probe>(table);
  if (!listed.some((r) => r.id === id)) fail("row missing from allRows");
  console.log(`list              ok (${listed.length} row${listed.length === 1 ? "" : "s"} in ${table})`);

  const updated: Probe = { ...row, note: "updated" };
  await putRow(table, id, updated);
  const reread = await getRow<Probe>(table, id);
  if (reread?.note !== "updated") fail("update did not overwrite the row");
  console.log("update            ok");

  await deleteRow(table, id);
  if (await getRow<Probe>(table, id)) fail("row still present after delete");
  console.log("delete            ok");

  console.log(`\nStore is working on ${backend}.`);
}

main().catch((err) => {
  console.error("FAIL:", err instanceof Error ? err.message : err);
  process.exit(1);
});
