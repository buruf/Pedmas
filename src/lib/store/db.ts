/**
 * Repository over a key/row store. Each logical table is a map of id -> row.
 *
 * Two backends behind one interface:
 *   - Upstash Redis when UPSTASH_REDIS_REST_URL/TOKEN are set. Each table is a
 *     Redis hash, so a row read or write touches only that row. This is what
 *     runs on Vercel, whose filesystem is read-only.
 *   - A local JSON file per table otherwise, so `npm run dev` and the test
 *     suite need no credentials.
 *
 * Callers never see which is active. Serverless instances are short-lived and
 * concurrent, so the Redis path deliberately keeps no cache — reading stale
 * rows across instances would corrupt sessions and practice state.
 */
import { promises as fs } from "fs";
import path from "path";
import { Redis } from "@upstash/redis";

const DATA_DIR = path.join(process.cwd(), "data");
const KEY_PREFIX = "pedmas";

type Table = Record<string, unknown>;

interface StoreGlobal {
  cache: Map<string, Table>;
  locks: Map<string, Promise<void>>;
  redis?: Redis | null;
}

const g = globalThis as typeof globalThis & { __pedmasStore?: StoreGlobal };
const store: StoreGlobal = (g.__pedmasStore ??= { cache: new Map(), locks: new Map() });

export function isRedisConfigured(): boolean {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

/** Missing persistence configuration, for health checks. */
export function storeConfigProblems(): string[] {
  const missing: string[] = [];
  if (!process.env.UPSTASH_REDIS_REST_URL) missing.push("UPSTASH_REDIS_REST_URL");
  if (!process.env.UPSTASH_REDIS_REST_TOKEN) missing.push("UPSTASH_REDIS_REST_TOKEN");
  return missing;
}

export function storeBackend(): "redis" | "file" {
  return isRedisConfigured() ? "redis" : "file";
}

function redis(): Redis {
  if (!store.redis) {
    store.redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }
  return store.redis;
}

/**
 * Writing to disk on Vercel throws an opaque EROFS deep inside a request.
 * Fail early and say exactly what is wrong instead.
 */
function assertWritableBackend(): void {
  if (!isRedisConfigured() && process.env.VERCEL) {
    throw new Error(
      "No durable store configured. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN — " +
        "the serverless filesystem is read-only, so data cannot be saved without them."
    );
  }
}

const tableKey = (table: string) => `${KEY_PREFIX}:${table}`;

/** Upstash decodes JSON automatically; strings may arrive already parsed. */
function decode<T>(value: unknown): T | undefined {
  if (value === null || value === undefined) return undefined;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as unknown as T;
    }
  }
  return value as T;
}

/* ----------------------------------------------------------------- file mode */

async function loadFile(table: string): Promise<Table> {
  const cached = store.cache.get(table);
  if (cached) return cached;
  const file = path.join(DATA_DIR, `${table}.json`);
  let data: Table = {};
  try {
    data = JSON.parse(await fs.readFile(file, "utf8")) as Table;
  } catch {
    data = {};
  }
  store.cache.set(table, data);
  return data;
}

async function persistFile(table: string): Promise<void> {
  const data = store.cache.get(table) ?? {};
  const prev = store.locks.get(table) ?? Promise.resolve();
  const next = prev.then(async () => {
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
  if (isRedisConfigured()) {
    return decode<T>(await redis().hget(tableKey(table), id));
  }
  const data = await loadFile(table);
  return data[id] as T | undefined;
}

export async function allRows<T>(table: string): Promise<T[]> {
  if (isRedisConfigured()) {
    const all = await redis().hgetall<Record<string, unknown>>(tableKey(table));
    if (!all) return [];
    return Object.values(all)
      .map((v) => decode<T>(v))
      .filter((v): v is T => v !== undefined);
  }
  const data = await loadFile(table);
  return Object.values(data) as T[];
}

export async function putRow<T>(table: string, id: string, row: T): Promise<void> {
  assertWritableBackend();
  if (isRedisConfigured()) {
    await redis().hset(tableKey(table), { [id]: JSON.stringify(row) });
    return;
  }
  const data = await loadFile(table);
  data[id] = row;
  await persistFile(table);
}

export async function deleteRow(table: string, id: string): Promise<void> {
  assertWritableBackend();
  if (isRedisConfigured()) {
    await redis().hdel(tableKey(table), id);
    return;
  }
  const data = await loadFile(table);
  delete data[id];
  await persistFile(table);
}

export async function findRow<T>(table: string, pred: (row: T) => boolean): Promise<T | undefined> {
  return (await allRows<T>(table)).find(pred);
}

export function newId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}${rand}`;
}
