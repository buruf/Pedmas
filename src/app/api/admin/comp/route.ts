import { NextResponse } from "next/server";
import { requireParent, isResponse, bad } from "@/lib/api";
import { getRow, putRow } from "@/lib/store/db";
import type { Account } from "@/lib/model";

/**
 * Grant or revoke complimentary access for a family.
 *
 * For beta families, test accounts, and goodwill after a support problem.
 * Every grant records who made it and why, so an unlocked account is never
 * a mystery six months later.
 */
export async function POST(req: Request) {
  const admin = await requireParent();
  if (isResponse(admin)) return admin;
  if (admin.role !== "ADMIN") return bad("Admin only.", 403);

  const body = await req.json().catch(() => null);
  const accountId = typeof body?.accountId === "string" ? body.accountId : "";
  const grant = body?.grant !== false;
  const reason = typeof body?.reason === "string" && body.reason.trim() ? body.reason.trim() : "Testing";
  const days = typeof body?.days === "number" && body.days > 0 ? body.days : undefined;

  const account = await getRow<Account>("accounts", accountId);
  if (!account) return bad("Account not found.", 404);

  if (grant) {
    account.compAccess = {
      grantedAt: Date.now(),
      grantedBy: admin.email,
      reason: reason.slice(0, 200),
      ...(days ? { expiresAt: Date.now() + days * 24 * 60 * 60 * 1000 } : {}),
    };
  } else {
    account.compAccess = undefined;
  }
  await putRow("accounts", account.id, account);
  return NextResponse.json({ ok: true, compAccess: account.compAccess ?? null });
}
