import { NextResponse } from "next/server";
import { requireParent, isResponse, bad } from "@/lib/api";
import { dismissError } from "@/lib/errors";

/** Dismiss one error group; POST throws on purpose to prove the monitoring works. */
export async function DELETE(req: Request) {
  const account = await requireParent();
  if (isResponse(account)) return account;
  if (account.role !== "ADMIN") return bad("Admin only.", 403);
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return bad("Missing id.");
  await dismissError(id);
  return NextResponse.json({ ok: true });
}

/**
 * A deliberate server error, admin-triggered. The only way to trust an error
 * monitor is to watch it catch one; this is the button that feeds it.
 */
export async function POST() {
  const account = await requireParent();
  if (isResponse(account)) return account;
  if (account.role !== "ADMIN") return bad("Admin only.", 403);
  throw new Error("Test error from the admin console — monitoring is working if you can read this in the Errors panel.");
}
