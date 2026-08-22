import { NextRequest, NextResponse } from "next/server";
import { requireAccount, isResponse, bad } from "@/lib/api";
import { beginEnrolment, confirmEnrolment, disableMfa, regenerateRecoveryCodes, mfaEnabled } from "@/lib/mfa";
import { clientKey, rateLimit } from "@/lib/rateLimit";

/**
 * Managing your own second factor. Admin-only for now: the admin console is
 * what MFA is protecting, and a locked-out parent is a support burden with
 * no matching benefit.
 *
 * Every state change other than starting enrolment requires a working code,
 * so a hijacked session cannot quietly remove the protection.
 */
export async function GET() {
  const account = await requireAccount();
  if (isResponse(account)) return account;
  return NextResponse.json({
    enabled: mfaEnabled(account),
    enabledAt: account.mfa?.enabledAt ?? null,
    recoveryCodesLeft: account.mfa?.recoveryHashes?.length ?? 0,
    required: account.role === "ADMIN",
  });
}

export async function POST(req: NextRequest) {
  const account = await requireAccount();
  if (isResponse(account)) return account;
  if (account.role !== "ADMIN") return bad("Two-factor authentication is available for admin accounts.", 403);

  const gate = await rateLimit("mfaManage", clientKey(req), 20, 15 * 60);
  if (!gate.ok) return bad("Too many attempts. Please wait a few minutes.", 429);

  const body = await req.json().catch(() => null);
  const action = typeof body?.action === "string" ? body.action : "";
  const code = typeof body?.code === "string" ? body.code : "";

  if (action === "begin") {
    if (mfaEnabled(account)) return bad("Two-factor authentication is already on.");
    const offer = await beginEnrolment(account);
    // The secret goes to the enrolling admin's own screen and nowhere else.
    return NextResponse.json(offer);
  }

  if (action === "confirm") {
    const result = await confirmEnrolment(account, code);
    if (!result.ok) return bad(result.error ?? "That code did not match.");
    return NextResponse.json({ ok: true, recoveryCodes: result.recoveryCodes });
  }

  if (action === "disable") {
    const result = await disableMfa(account, code);
    if (!result.ok) return bad(result.error ?? "That code is not valid.");
    return NextResponse.json({ ok: true });
  }

  if (action === "regenerate") {
    const result = await regenerateRecoveryCodes(account, code);
    if (!result.ok) return bad(result.error ?? "That code is not valid.");
    return NextResponse.json({ ok: true, recoveryCodes: result.recoveryCodes });
  }

  return bad("Unknown action.");
}
