import { NextResponse } from "next/server";
import { bad } from "@/lib/api";
import { checkResetToken, consumeResetToken } from "@/lib/passwordReset";
import { startSession } from "@/lib/auth";

/** Validate a reset link before showing the form. */
export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token") ?? "";
  if (!token) return bad("Missing reset token.");
  const check = await checkResetToken(token);
  if (!check.ok) return bad(check.error);
  return NextResponse.json({ ok: true, email: check.account.email });
}

/** Set the new password and sign the account in. */
export async function POST(req: Request) {
  let token = "";
  let password = "";
  try {
    ({ token = "", password = "" } = (await req.json()) as { token?: string; password?: string });
  } catch {
    return bad("Invalid request.");
  }
  if (!token) return bad("Missing reset token.");

  const result = await consumeResetToken(token, password);
  if (!result.ok) return bad(result.error);

  await startSession(result.account.id);
  return NextResponse.json({ ok: true, role: result.account.role });
}
