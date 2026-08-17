/**
 * Repository over a key/row store. Each logical table is a map of id -> row.
 *
 * Two backends behind one interface:
 *   - Neon Postgres when DATABASE_URL is set. Rows live in one table keyed by
 *     (tbl, id) with the row itself as jsonb, so the interface maps across
 *     without a migration per entity, while still being a real database with
 *     durability and backups. This is what runs on Vercel, whose filesystem
 *     is read-only.
 *   - A local JSON file per table otherwise, so `npm run dev` and the test
 *     suite need no credentials.
 *
 * Callers never see which is active. Serverless instances are short-lived and
 * concurrent, so the Postgres path deliberately keeps no cache — reading stale
 * rows across instances would corrupt sessions and practice state.
 */
import { promises as fs } from "fs";
import path from "path";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

const DATA_DIR = path.join(process.cwd(), "data");

type Table = Record<string, unknown>;

interface StoreGlobal {
  locks: Map<string, Promise<void>>;
  sql?: NeonQueryFunction<false, false>;
  schemaReady?: Promise<void>;
}

const g = globalThis as typeof globalThis & { __pedmasStore?: StoreGlobal };
const store: StoreGlobal = (g.__pedmasStore ??= { locks: new Map() });

/** Vercel's Neon integration sets DATABASE_URL; accept the common aliases. */
function connectionString(): string | undefined {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.NEON_DATABASE_URL ||
    undefined
  );
}

export function isDatabaseConfigured(): boolean {
  return Boolean(connectionString());
}

/** Missing persistence configuration, for health checks. */
export function storeConfigProblems(): string[] {
  return isDatabaseConfigured() ? [] : ["DATABASE_URL"];
}

export function storeBackend(): "postgres" | "file" {
  return isDatabaseConfigured() ? "postgres" : "file";
}

function db(): NeonQueryFunction<false, false> {
  if (!store.sql) store.sql = neon(connectionString()!);
  return store.sql;
}

/** Create the row table once per instance. Idempotent, so no migration step. */
function ensureSchema(): Promise<void> {
  if (!store.schemaReady) {
    const sql = db();
    store.schemaReady = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS pedmas_rows (
          tbl        text        NOT NULL,
          id         text        NOT NULL,
          data       jsonb       NOT NULL,
          updated_at timestamptz NOT NULL DEFAULT now(),
          PRIMARY KEY (tbl, id)
        )
      `;
    })().catch((err) => {
      // Let the next call retry rather than caching a failure forever.
      store.schemaReady = undefined;
      throw err;
    });
  }
  return store.schemaReady;
}

/**
 * Writing to disk on Vercel throws an opaque EROFS deep inside a request.
 * Fail early and say exactly what is wrong instead.
 */
function assertWritableBackend(): void {
  if (!isDatabaseConfigured() && process.env.VERCEL) {
    throw new Error(
      "No durable store configured. Set DATABASE_URL to a Neon connection string — " +
        "the serverless filesystem is read-only, so data cannot be saved without it."
    );
  }
}

/* ----------------------------------------------------------------- file mode */

/**
 * Read a table from disk. Deliberately uncached.
 *
 * The cache that used to live here held whole tables in memory, so a script
 * and the dev server would each write back their own stale copy and undo the
 * other's changes — a seed script's delete was silently resurrected by the
 * running server. Rereading costs nothing at development data sizes, and the
 * production path (Postgres) never had this problem because it reads per row.
 */
async function loadFile(table: string): Promise<Table> {
  const file = path.join(DATA_DIR, `${table}.json`);
  try {
    return JSON.parse(await fs.readFile(file, "utf8")) as Table;
  } catch {
    return {};
  }
}

/**
 * Apply a change to a table: read fresh, mutate, write — all inside the
 * per-table lock.
 *
 * Reading immediately before writing is what stops one process undoing
 * another's change. Writing a snapshot captured earlier is exactly how a
 * deleted row came back to life.
 */
async function mutateFile(table: string, change: (data: Table) => void): Promise<void> {
  const prev = store.locks.get(table) ?? Promise.resolve();
  const next = prev.then(async () => {
    const data = await loadFile(table);
    change(data);
    await fs.mkdir(DATA_DIR, { recursive: true });
    const file = path.join(DATA_DIR, `${table}.json`);
    const tmp = `${file}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(data), "utf8");
    await fs.rename(tmp, file).catch(async () => {
      // Windows rename can fail if the target is locked; fall back.
      await fs.writeFile(file, JSON.stringify(data), "utf8");
    });
  });
  store.locks.set(table, next.catch(() => undefined));
  await next;
}

/* -------------------------------------------------------------- public API */

export async function getRow<T>(table: string, id: string): Promise<T | undefined> {
  if (isDatabaseConfigured()) {
    await ensureSchema();
    const rows = (await db()`
      SELECT data FROM pedmas_rows WHERE tbl = ${table} AND id = ${id} LIMIT 1
    `) as { data: T }[];
    return rows[0]?.data;
  }
  const data = await loadFile(table);
  return data[id] as T | undefined;
}

export async function allRows<T>(table: string): Promise<T[]> {
  if (isDatabaseConfigured()) {
    await ensureSchema();
    const rows = (await db()`
      SELECT data FROM pedmas_rows WHERE tbl = ${table}
    `) as { data: T }[];
    return rows.map((r) => r.data);
  }
  const data = await loadFile(table);
  return Object.values(data) as T[];
}

export async function putRow<T>(table: string, id: string, row: T): Promise<void> {
  assertWritableBackend();
  if (isDatabaseConfigured()) {
    await ensureSchema();
    await db()`
      INSERT INTO pedmas_rows (tbl, id, data)
      VALUES (${table}, ${id}, ${JSON.stringify(row)}::jsonb)
      ON CONFLICT (tbl, id)
      DO UPDATE SET data = EXCLUDED.data, updated_at = now()
    `;
    return;
  }
  await mutateFile(table, (data) => {
    data[id] = row;
  });
}

export async function deleteRow(table: string, id: string): Promise<void> {
  assertWritableBackend();
  if (isDatabaseConfigured()) {
    await ensureSchema();
    await db()`DELETE FROM pedmas_rows WHERE tbl = ${table} AND id = ${id}`;
    return;
  }
  await mutateFile(table, (data) => {
    delete data[id];
  });
}

export async function findRow<T>(table: string, pred: (row: T) => boolean): Promise<T | undefined> {
  return (await allRows<T>(table)).find(pred);
}

export function newId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}${rand}`;
}
