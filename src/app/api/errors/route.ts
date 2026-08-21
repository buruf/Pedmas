import { NextResponse } from "next/server";
import { recordError } from "@/lib/errors";
import { rateLimit, clientKey } from "@/lib/rateLimit";

/**
 * Browser error reports. Necessarily unauthenticated — errors mostly happen
 * to people who are not logged in as anyone interesting — so the surface is
 * kept unattractive: tight rate limit per client, hard size caps, and the
 * response reveals nothing. The body is data about a failure, never trusted
 * as anything else.
 */
export async function POST(req: Request) {
  const gate = await rateLimit("clientErrors", clientKey(req), 10, 10 * 60);
  if (!gate.ok) return NextResponse.json({ ok: true });

  let body: { message?: unknown; stack?: unknown; path?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: true });
  }
  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!message) return NextResponse.json({ ok: true });

  await recordError(
    "client",
    {
      message: message.slice(0, 500),
      stack: typeof body.stack === "string" ? body.stack.slice(0, 4000) : undefined,
    },
    typeof body.path === "string" ? body.path.slice(0, 300) : undefined
  );
  return NextResponse.json({ ok: true });
}
