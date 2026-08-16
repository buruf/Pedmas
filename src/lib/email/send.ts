/**
 * Email transport.
 *
 * Uses Resend's REST API directly — no SDK, keeping the dependency surface
 * small. When RESEND_API_KEY is absent nothing is sent: the message is logged
 * and the caller still succeeds, so password reset and billing flows work in
 * development without a mail provider. Callers must never surface a mail
 * failure to the user in a way that reveals whether an address exists.
 */

export interface Mail {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export interface SendResult {
  sent: boolean;
  skipped?: "unconfigured";
  error?: string;
}

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

export function emailFrom(): string {
  return process.env.EMAIL_FROM ?? "PEDMAS <onboarding@resend.dev>";
}

export function emailConfigProblems(): string[] {
  const missing: string[] = [];
  if (!process.env.RESEND_API_KEY) missing.push("RESEND_API_KEY");
  if (!process.env.EMAIL_FROM) missing.push("EMAIL_FROM");
  return missing;
}

export async function sendMail(mail: Mail): Promise<SendResult> {
  if (!isEmailConfigured()) {
    // Developer visibility without a provider. Never log full bodies — reset
    // links are credentials.
    console.info(`[email:skipped] to=${mail.to} subject=${JSON.stringify(mail.subject)}`);
    return { sent: false, skipped: "unconfigured" };
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: emailFrom(),
        to: [mail.to],
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
      }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error(`[email:failed] status=${res.status} ${detail.slice(0, 200)}`);
      return { sent: false, error: `Provider responded ${res.status}` };
    }
    return { sent: true };
  } catch (err) {
    console.error("[email:error]", err instanceof Error ? err.message : err);
    return { sent: false, error: "Transport error" };
  }
}
