/**
 * Minimal JSON-file store behind a repository interface. Each table is a
 * Record<id, row> persisted to data/<table>.json. Writes are serialized
 * per table. Swap this module for Prisma/Postgres without touching callers.
 */
import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

type Table = Record<string, unknown>;

interface StoreGlobal {
  cache: Map<string, Table>;
  locks: Map<string, Promise<void>>;
}

const g = globalThis as typeof globalThis & { __pedmasStore?: StoreGlobal };
const store: StoreGlobal = (g.__pedmasStore ??= { cache: new Map(), locks: new Map() });

async function load(table: string): Promise<Table> {
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

async function persist(table: string): Promise<void> {
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

export async function getRow<T>(table: string, id: string): Promise<T | undefined> {
  const data = await load(table);
  return data[id] as T | undefined;
}

export async function allRows<T>(table: string): Promise<T[]> {
  const data = await load(table);
  return Object.values(data) as T[];
}

export async function putRow<T>(table: string, id: string, row: T): Promise<void> {
  const data = await load(table);
  data[id] = row;
  await persist(table);
}

export async function deleteRow(table: string, id: string): Promise<void> {
  const data = await load(table);
  delete data[id];
  await persist(table);
}

export async function findRow<T>(table: string, pred: (row: T) => boolean): Promise<T | undefined> {
  return (await allRows<T>(table)).find(pred);
}

export function newId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}${rand}`;
}
