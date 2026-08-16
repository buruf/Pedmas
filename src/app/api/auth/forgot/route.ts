import { NextResponse } from "next/server";
import { accountByEmail, createResetToken, RESET_TTL_MINUTES } from "@/lib/passwordReset";
import { sendMail } from "@/lib/email/send";
import { passwordResetMail } from "@/lib/email/templates";
import { appUrl } from "@/lib/billing/stripe";

/**
 * Request a password reset.
 *
 * Always answers the same way whether or not the address exists — otherwise
 * this endpoint becomes an account enumeration oracle.
 */
export async function POST(req: Request) {
  let email = "";
  try {
    const body = (await req.json()) as { email?: string } | null;
    email = typeof body?.email === "string" ? body.email : "";
  } catch {
    // fall through to the generic reply
  }

  const generic = NextResponse.json({
    ok: true,
    message: "If that email has a PEDMAS account, a reset link is on its way.",
  });

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return generic;

  try {
    const account = await accountByEmail(email);
    if (account) {
      const token = await createResetToken(account.id);
      const url = `${appUrl()}/reset?token=${encodeURIComponent(token)}`;
      const result = await sendMail(passwordResetMail(account.email, account.name, url, RESET_TTL_MINUTES));
      // Development affordance: with no mail provider the link would be
      // unreachable, so print it. Never in production — this is a credential.
      if (result.skipped === "unconfigured" && process.env.NODE_ENV !== "production") {
        console.info(`[auth:forgot] dev reset link for ${account.email}: ${url}`);
      }
    }
  } catch (err) {
    // Never leak failure detail to the caller.
    console.error("[auth:forgot]", err instanceof Error ? err.message : err);
  }

  return generic;
}
