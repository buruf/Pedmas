/**
 * Error monitoring, self-hosted.
 *
 * Every unhandled error — server (via instrumentation.ts) or browser (via
 * the reporter posting to /api/errors) — becomes one row per *fingerprint*
 * in the store, with a running count. Grouping by fingerprint rather than
 * appending every event keeps the table naturally small and gives the admin
 * view its shape for free: what breaks, where, how often, how recently.
 *
 * When something new fails, the platform admin gets an email — at most one
 * per cooldown window, so an error loop pages a human once, not a thousand
 * times. Recording must never throw: a monitoring failure on top of a real
 * failure would turn one incident into two.
 */
import { getRow, putRow, allRows, deleteRow } from "./store/db";
import { rateLimit } from "./rateLimit";
import { sendMail, isEmailConfigured } from "./email/send";

const appUrl = () => (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3080").replace(/\/+$/, "");

const TABLE = "errorEvents";

/** One email per this window, no matter how many errors arrive. */
const ALERT_COOLDOWN_SECONDS = 6 * 60 * 60;

/** Groups untouched this long are dropped by the occasional sweep. */
const RETENTION_DAYS = 90;

export type ErrorSource = "server" | "client";

export interface ErrorGroup {
  id: string; // fingerprint
  source: ErrorSource;
  message: string;
  stack?: string;
  path?: string;
  count: number;
  firstSeen: number;
  lastSeen: number;
}

const cap = (s: string, n: number) => (s.length > n ? s.slice(0, n) + "…" : s);

/**
 * Stable identity for "the same error". Ids, hashes, numbers and quoted
 * values are masked so "student stu_x8 not found" and "student stu_k2 not
 * found" land in one group instead of one group per student.
 */
export function fingerprintOf(source: ErrorSource, message: string, path?: string): string {
  const normalized = message
    .replace(/\b[a-z]+_[0-9a-z]{6,}\b/gi, "#") // this app's ids: stu_x8k2m4n9p1
    .replace(/\b(?=[0-9a-z]*\d)[0-9a-z]{8,}\b/gi, "#") // hashes and tokens
    .replace(/\d+/g, "#")
    .replace(/(["'`]).*?\1/g, "$1#$1")
    .toLowerCase()
    .slice(0, 300);
  const normalizedPath = (path ?? "").replace(/\/[0-9a-z_-]{10,}/gi, "/#");
  return fnv(`${source}|${normalized}|${normalizedPath}`);
}

/**
 * FNV-1a, doubled for width. Pure JS because this module is pulled in by
 * instrumentation.ts, which Next also bundles for runtimes without node's
 * crypto. Collision resistance here only has to beat "different bugs share a
 * bucket", not an adversary.
 */
function fnv(input: string): string {
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < input.length; i++) {
    const c = input.charCodeAt(i);
    h1 = ((h1 ^ c) * 0x01000193) >>> 0;
    h2 = ((h2 ^ ((c << 8) | (c >> 8))) * 0x01000193) >>> 0;
  }
  return h1.toString(36) + h2.toString(36);
}

export async function recordError(
  source: ErrorSource,
  err: { message: string; stack?: string },
  path?: string
): Promise<void> {
  try {
    const message = cap(String(err.message || "Unknown error"), 500);
    const stack = err.stack ? cap(String(err.stack), 4000) : undefined;
    const id = fingerprintOf(source, message, path);
    const now = Date.now();

    const existing = await getRow<ErrorGroup>(TABLE, id);
    const group: ErrorGroup = existing
      ? { ...existing, count: existing.count + 1, lastSeen: now, message, stack, path }
      : { id, source, message, stack, path: path ? cap(path, 300) : undefined, count: 1, firstSeen: now, lastSeen: now };
    await putRow(TABLE, id, group);

    if (!existing) await alertAdmin(group);
    // Occasional sweep instead of a scheduled job: at this scale a 1%-of-writes
    // lottery keeps the table bounded with no extra moving parts.
    if (Math.random() < 0.01) await sweepOldGroups(now);
  } catch (recordErr) {
    console.error("[errors] failed to record error:", recordErr instanceof Error ? recordErr.message : recordErr);
  }
}

/**
 * One email per cooldown window, sent only for errors not seen before. The
 * limiter rides the existing rate-limit table, so the cooldown holds across
 * serverless instances.
 */
async function alertAdmin(group: ErrorGroup): Promise<void> {
  if (!isEmailConfigured()) return;
  const gate = await rateLimit("errorAlert", "admin", 1, ALERT_COOLDOWN_SECONDS);
  if (!gate.ok) return;
  const to = process.env.PEDMAS_ADMIN_EMAIL ?? "admin@pedmas.com";
  const when = new Date(group.lastSeen).toISOString();
  await sendMail({
    to,
    subject: `PEDMAS error: ${cap(group.message, 80)}`,
    html: `<p>A new error was recorded on ${group.source === "server" ? "the server" : "a visitor's browser"}.</p>
<p><strong>${escapeHtml(cap(group.message, 300))}</strong></p>
<p>Path: ${escapeHtml(group.path ?? "—")}<br/>First seen: ${when}</p>
<p><a href="${appUrl()}/admin">Open the admin console</a> for the full list. Further alerts are paused for ${ALERT_COOLDOWN_SECONDS / 3600} hours.</p>`,
    text: `A new error was recorded (${group.source}).\n\n${cap(group.message, 300)}\nPath: ${group.path ?? "—"}\nFirst seen: ${when}\n\nAdmin console: ${appUrl()}/admin\nFurther alerts are paused for ${ALERT_COOLDOWN_SECONDS / 3600} hours.`,
  });
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function sweepOldGroups(now: number): Promise<void> {
  const cutoff = now - RETENTION_DAYS * 24 * 60 * 60 * 1000;
  const groups = await allRows<ErrorGroup>(TABLE);
  for (const group of groups) {
    if (group.lastSeen < cutoff) await deleteRow(TABLE, group.id);
  }
}

/** Recent error groups for the admin console, most recent first. */
export async function recentErrors(limit = 50): Promise<ErrorGroup[]> {
  const groups = await allRows<ErrorGroup>(TABLE);
  return groups.sort((a, b) => b.lastSeen - a.lastSeen).slice(0, limit);
}

export async function dismissError(id: string): Promise<void> {
  await deleteRow(TABLE, id);
}
