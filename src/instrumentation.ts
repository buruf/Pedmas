/**
 * Server-side error capture. Next.js calls onRequestError for every
 * unhandled error in a route handler, server component or server action —
 * one hook, whole surface. Recording is fire-and-forget and never throws.
 *
 * The NEXT_RUNTIME guard is not defensive fluff: Next inlines the variable
 * per bundle, so in the edge/client builds the import below becomes
 * unreachable and webpack drops it — without the guard those bundles fail to
 * resolve the store's node imports (fs, crypto) at build time.
 */
export async function onRequestError(
  err: unknown,
  request: { path: string; method: string }
): Promise<void> {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { recordError } = await import("@/lib/errors");
  const e = err instanceof Error ? err : new Error(String(err));
  await recordError("server", { message: e.message, stack: e.stack }, `${request.method} ${request.path}`);
}
