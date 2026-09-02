import { NextResponse } from "next/server";

/**
 * What commit is actually running.
 *
 * Exists because a push is not a deploy: a GitHub webhook silently failed to
 * reach Vercel once, production kept serving the previous commit, and there
 * was no way to tell from the outside. This endpoint makes "what is live?" a
 * question with a definite answer — `scripts/deploy.mjs` compares it against
 * local HEAD and re-deploys if they differ.
 *
 * Public and unauthenticated on purpose: it is the one check that must work
 * when everything else is uncertain, and it reveals nothing sensitive — the
 * repository is public.
 */
export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(
    {
      // Vercel sets this for both git and CLI deployments.
      sha: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
      ref: process.env.VERCEL_GIT_COMMIT_REF ?? null,
      env: process.env.VERCEL_ENV ?? "development",
      deploymentId: process.env.VERCEL_DEPLOYMENT_ID ?? null,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
