import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import {
  getRow,
  putRow,
  deleteRow,
  newId,
  storeBackend,
  storeConfigProblems,
} from "@/lib/store/db";
import { billingConfigProblems, isWebhookConfigured } from "@/lib/billing/stripe";
import { emailConfigProblems } from "@/lib/email/send";

/**
 * Deployment health check.
 *
 * Round-trips a throwaway row so a green result means the configured store
 * genuinely accepts writes — not merely that an env var is present. The probe
 * row is deleted again, so this never pollutes real data.
 *
 * Guarded by CRON_SECRET: it reveals configuration state, and an unauthenticated
 * write probe would be an obvious abuse target. Fails closed when unset.
 */
function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const provided = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  const a = Buffer.from(provided);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const backend = storeBackend();
  const started = Date.now();
  let storeOk = false;
  let storeError: string | undefined;

  try {
    const id = newId("health");
    await putRow("healthProbe", id, { id, at: started });
    const read = await getRow<{ id: string }>("healthProbe", id);
    storeOk = read?.id === id;
    if (!storeOk) storeError = "row not readable after write";
    await deleteRow("healthProbe", id);
  } catch (err) {
    storeError = err instanceof Error ? err.message : String(err);
  }

  const body = {
    ok: storeOk,
    store: {
      backend,
      writable: storeOk,
      roundTripMs: Date.now() - started,
      missing: storeConfigProblems(),
      ...(storeError ? { error: storeError } : {}),
    },
    stripe: {
      configured: billingConfigProblems().length === 0,
      missing: billingConfigProblems(),
      webhookConfigured: isWebhookConfigured(),
    },
    email: {
      configured: emailConfigProblems().length === 0,
      missing: emailConfigProblems(),
    },
  };

  return NextResponse.json(body, { status: storeOk ? 200 : 503 });
}
