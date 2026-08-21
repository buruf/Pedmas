/**
 * Repository over a key/row store. Each logical table is a map of id -> row.
 *
 * Two backends behind one interface:
 *   - Neon Postgres when DATABASE_URL is set: one table per entity, each row
 *     stored as a jsonb document with generated columns over the fields the
 *     app looks rows up by (email, Stripe customer, owning account), so those
 *     lookups are indexed instead of scanning every row in application code.
 *     A unique index on account email makes the duplicate-signup race
 *     impossible at the database, not just unlikely at the app.
 *   - A local JSON file per table otherwise, so `npm run dev` and the test
 *     suite need no credentials.
 *
 * The previous schema was a single pedmas_rows table keyed by (tbl, id).
 * ensureSchema migrates its contents into the per-entity tables exactly once
 * (a marker row in store_meta guards re-runs, because re-copying after a
 * deletion would resurrect data a family asked us to erase). pedmas_rows is
 * left in place untouched as a backup; it is never read again.
 *
 * Callers never see which backend is active. Serverless instances are
 * short-lived and concurrent, so the Postgres path deliberately keeps no
 * cache — reading stale rows across instances would corrupt sessions and
 * practice state.
 */
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

/**
 * Node's fs, loaded lazily and hidden from the bundler. instrumentation.ts
 * pulls this module into bundles for runtimes without node builtins; only
 * file mode (local dev, never those runtimes) actually touches the disk.
 */
async function nodeFs(): Promise<typeof import("fs").promises> {
  const mod = (await import(/* webpackIgnore: true */ "fs")) as typeof import("fs");
  return mod.promises;
}

function dataFile(table: string): string {
  return `${process.cwd()}/data/${table}.json`;
}

type Table = Record<string, unknown>;

interface StoreGlobal {
  locks: Map<string, Promise<void>>;
  sql?: NeonQueryFunction<false, false>;
  schemaReady?: Promise<void>;
}

const g = globalThis as typeof globalThis & { __pedmasStore?: StoreGlobal };
const store: StoreGlobal = (g.__pedmasStore ??= { locks: new Map() });

/**
 * Logical table name -> Postgres table name. Also the allowlist: identifiers
 * cannot be parameterized in SQL, so only names from this fixed map are ever
 * interpolated into a statement.
 */
const TABLES: Record<string, string> = {
  accounts: "accounts",
  students: "students",
  authSessions: "auth_sessions",
  passwordResetTokens: "password_reset_tokens",
  rateLimits: "rate_limits",
  stripeEvents: "stripe_events",
  errorEvents: "error_events",
};

/**
 * The statements the public API runs, exported so the PGlite tests execute
 * character-for-character what production executes against Neon.
 */
export function crudSql(table: string): { get: string; put: string; del: string; all: string } {
  const t = pgTable(table);
  return {
    get: `SELECT data FROM ${t} WHERE id = $1 LIMIT 1`,
    all: `SELECT data FROM ${t}`,
    put: `INSERT INTO ${t} (id, data)
       VALUES ($1, $2::jsonb)
       ON CONFLICT (id)
       DO UPDATE SET data = EXCLUDED.data, updated_at = now()`,
    del: `DELETE FROM ${t} WHERE id = $1`,
  };
}

export const LOOKUP_SQL = {
  accountByEmail: `SELECT data FROM accounts WHERE email = $1 LIMIT 1`,
  accountByCustomerId: `SELECT data FROM accounts WHERE customer_id = $1 LIMIT 1`,
  studentsByAccount: `SELECT data FROM students WHERE account_id = $1`,
} as const;

function pgTable(table: string): string {
  const name = TABLES[table];
  if (!name) throw new Error(`Unknown store table "${table}" — add it to TABLES in db.ts.`);
  return name;
}

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

/** Minimal query interface, so the schema code runs identically against Neon in production and PGlite in tests. */
export type Exec = (text: string, params?: unknown[]) => Promise<unknown[]>;

function neonExec(): Exec {
  return (text, params) => db().query(text, params) as Promise<unknown[]>;
}

/**
 * Create the per-entity schema and migrate the legacy KV table into it.
 * Runs once per instance; a failure clears the memo so the next call retries
 * instead of caching a broken store forever.
 */
function ensureSchema(): Promise<void> {
  if (!store.schemaReady) {
    store.schemaReady = buildSchema(neonExec()).catch((err) => {
      store.schemaReady = undefined;
      throw err;
    });
  }
  return store.schemaReady;
}

export async function buildSchema(exec: Exec): Promise<void> {
  await exec(`
    CREATE TABLE IF NOT EXISTS store_meta (
      key        text        PRIMARY KEY,
      value      jsonb       NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `);

  // Every entity table is (id, data, updated_at) plus generated columns for
  // the fields the app queries by. Generated columns stay correct on every
  // write with no application involvement — a manually-maintained mirror
  // column would drift the first time someone forgot it.
  await exec(`
    CREATE TABLE IF NOT EXISTS accounts (
      id          text        PRIMARY KEY,
      data        jsonb       NOT NULL,
      email       text        GENERATED ALWAYS AS (lower(data->>'email')) STORED,
      customer_id text        GENERATED ALWAYS AS (data->'billing'->>'customerId') STORED,
      updated_at  timestamptz NOT NULL DEFAULT now()
    )
  `);
  await exec(`
    CREATE TABLE IF NOT EXISTS students (
      id         text        PRIMARY KEY,
      data       jsonb       NOT NULL,
      account_id text        GENERATED ALWAYS AS (data->>'accountId') STORED,
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `);
  await exec(`
    CREATE TABLE IF NOT EXISTS auth_sessions (
      id         text        PRIMARY KEY,
      data       jsonb       NOT NULL,
      account_id text        GENERATED ALWAYS AS (data->>'accountId') STORED,
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `);
  for (const plain of ["password_reset_tokens", "rate_limits", "stripe_events", "error_events"]) {
    await exec(`
      CREATE TABLE IF NOT EXISTS ${plain} (
        id         text        PRIMARY KEY,
        data       jsonb       NOT NULL,
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `);
  }

  await exec(`CREATE INDEX IF NOT EXISTS accounts_customer_idx ON accounts (customer_id)`);
  await exec(`CREATE INDEX IF NOT EXISTS students_account_idx ON students (account_id)`);
  await exec(`CREATE INDEX IF NOT EXISTS auth_sessions_account_idx ON auth_sessions (account_id)`);

  await migrateFromKv(exec);

  // The unique email index comes after migration on purpose: if legacy data
  // somehow holds a duplicate (the exact race this index exists to close),
  // creating it would fail — and that must degrade to today's app-level
  // check, loudly, rather than brick the whole store.
  try {
    await exec(`CREATE UNIQUE INDEX IF NOT EXISTS accounts_email_key ON accounts (email)`);
  } catch (err) {
    console.error(
      "[store] UNIQUE index on accounts.email failed — duplicate emails exist in legacy data. " +
        "Falling back to a plain index; deduplicate manually, then redeploy.",
      err instanceof Error ? err.message : err
    );
    await exec(`CREATE INDEX IF NOT EXISTS accounts_email_idx ON accounts (email)`);
  }
}

/**
 * Copy the legacy pedmas_rows KV table into the per-entity tables, once.
 *
 * The store_meta marker is what makes "once" true across every serverless
 * instance that will ever cold-start: without it, a re-copy would resurrect
 * rows deleted since the migration — and deletion is a promise the privacy
 * policy makes. The copies themselves are ON CONFLICT DO NOTHING and the
 * marker is written last, so a crash mid-migration simply re-runs the
 * idempotent copies on the next cold start.
 */
export async function migrateFromKv(exec: Exec): Promise<void> {
  const done = (await exec(`SELECT 1 FROM store_meta WHERE key = 'migrated_from_kv'`)) as unknown[];
  if (done.length > 0) return;

  const legacy = (await exec(`SELECT to_regclass('public.pedmas_rows') AS t`)) as { t: string | null }[];
  if (legacy[0]?.t) {
    let total = 0;
    for (const [logical, physical] of Object.entries(TABLES)) {
      const res = (await exec(
        `INSERT INTO ${physical} (id, data, updated_at)
         SELECT id, data, updated_at FROM pedmas_rows WHERE tbl = $1
         ON CONFLICT (id) DO NOTHING
         RETURNING id`,
        [logical]
      )) as unknown[];
      total += res.length;
    }
    console.info(`[store] migrated ${total} rows from pedmas_rows into per-entity tables`);
  }

  await exec(
    `INSERT INTO store_meta (key, value) VALUES ('migrated_from_kv', $1::jsonb) ON CONFLICT (key) DO NOTHING`,
    [JSON.stringify({ at: Date.now(), hadLegacyTable: Boolean(legacy[0]?.t) })]
  );
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
  try {
    const fs = await nodeFs();
    return JSON.parse(await fs.readFile(dataFile(table), "utf8")) as Table;
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
    const fs = await nodeFs();
    const data = await loadFile(table);
    change(data);
    await fs.mkdir(`${process.cwd()}/data`, { recursive: true });
    const file = dataFile(table);
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
    const rows = (await db().query(crudSql(table).get, [id])) as { data: T }[];
    return rows[0]?.data;
  }
  const data = await loadFile(table);
  return data[id] as T | undefined;
}

export async function allRows<T>(table: string): Promise<T[]> {
  if (isDatabaseConfigured()) {
    await ensureSchema();
    const rows = (await db().query(crudSql(table).all)) as { data: T }[];
    return rows.map((r) => r.data);
  }
  const data = await loadFile(table);
  return Object.values(data) as T[];
}

export async function putRow<T>(table: string, id: string, row: T): Promise<void> {
  assertWritableBackend();
  if (isDatabaseConfigured()) {
    await ensureSchema();
    await db().query(crudSql(table).put, [id, JSON.stringify(row)]);
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
    await db().query(crudSql(table).del, [id]);
    return;
  }
  await mutateFile(table, (data) => {
    delete data[id];
  });
}

export async function findRow<T>(table: string, pred: (row: T) => boolean): Promise<T | undefined> {
  return (await allRows<T>(table)).find(pred);
}

/* --------------------------------------------------- indexed lookup paths */

/**
 * True when an error is Postgres rejecting a duplicate on the named unique
 * index — the register flow turns this into its friendly "already exists"
 * message instead of a 500.
 */
export function isUniqueViolation(err: unknown, indexName: string): boolean {
  if (!(err instanceof Error)) return false;
  const withCode = err as Error & { code?: string };
  return withCode.code === "23505" || err.message.includes(indexName);
}

/**
 * The account with this email, via the unique index. Emails are compared
 * lowercased on both sides, matching how the app normalizes them.
 */
export async function accountByEmail<T>(email: string): Promise<T | undefined> {
  const norm = email.trim().toLowerCase();
  if (isDatabaseConfigured()) {
    await ensureSchema();
    const rows = (await db().query(LOOKUP_SQL.accountByEmail, [norm])) as { data: T }[];
    return rows[0]?.data;
  }
  return findRow<T>("accounts", (a) => (a as { email?: string }).email === norm);
}

/** The account owning this Stripe customer, via its index. */
export async function accountByCustomerId<T>(customerId: string): Promise<T | undefined> {
  if (isDatabaseConfigured()) {
    await ensureSchema();
    const rows = (await db().query(LOOKUP_SQL.accountByCustomerId, [customerId])) as { data: T }[];
    return rows[0]?.data;
  }
  return findRow<T>(
    "accounts",
    (a) => (a as { billing?: { customerId?: string } }).billing?.customerId === customerId
  );
}

/** All child profiles owned by an account, via the account_id index. */
export async function studentsByAccount<T>(accountId: string): Promise<T[]> {
  if (isDatabaseConfigured()) {
    await ensureSchema();
    const rows = (await db().query(LOOKUP_SQL.studentsByAccount, [accountId])) as { data: T }[];
    return rows.map((r) => r.data);
  }
  return (await allRows<T>("students")).filter(
    (s) => (s as { accountId?: string }).accountId === accountId
  );
}

export function newId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}${rand}`;
}
