/**
 * Fixed-window rate limiting for the endpoints worth protecting.
 *
 * Sign-in, registration and password reset are the routes an attacker probes:
 * credential stuffing, signup spam, and using reset emails to harass an
 * address. Without a limit, each is free to attempt thousands of times.
 *
 * Counters live in the same store as everything else, so the limit holds
 * across serverless instances rather than only within one process. A store
 * failure must never block a legitimate sign-in, so errors fail open.
 */
import { getRow, putRow } from "./store/db";

const TABLE = "rateLimits";

interface Window {
  id: string;
  count: number;
  resetAt: number;
}

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

/**
 * Best-effort client identity. Behind Vercel the forwarded header is set by
 * the platform; locally it is absent and everything shares one bucket, which
 * is fine for development.
 */
export function clientKey(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  const ip = fwd ? fwd.split(",")[0].trim() : req.headers.get("x-real-ip") ?? "local";
  return ip || "unknown";
}

export async function rateLimit(
  bucket: string,
  key: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const id = `${bucket}:${key}`;
  const now = Date.now();
  try {
    const existing = await getRow<Window>(TABLE, id);
    if (!existing || existing.resetAt <= now) {
      await putRow<Window>(TABLE, id, { id, count: 1, resetAt: now + windowSeconds * 1000 });
      return { ok: true, remaining: limit - 1, retryAfterSeconds: 0 };
    }
    if (existing.count >= limit) {
      return {
        ok: false,
        remaining: 0,
        retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
      };
    }
    await putRow<Window>(TABLE, id, { ...existing, count: existing.count + 1 });
    return { ok: true, remaining: limit - existing.count - 1, retryAfterSeconds: 0 };
  } catch {
    // Never lock a real user out because the counter store hiccuped.
    return { ok: true, remaining: limit, retryAfterSeconds: 0 };
  }
}

/** Standard limits, tuned so a forgetful human is never affected. */
export const LIMITS = {
  login: { limit: 10, windowSeconds: 15 * 60 },
  register: { limit: 5, windowSeconds: 60 * 60 },
  passwordReset: { limit: 5, windowSeconds: 60 * 60 },
} as const;
