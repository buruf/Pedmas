/**
 * Email transport.
 *
 * Talks to the provider's REST API directly — no SDK, keeping the dependency
 * surface small. Two providers are supported and picked by env var:
 *
 *   BREVO_API_KEY   → Brevo (preferred; one account covers every domain)
 *   RESEND_API_KEY  → Resend (legacy fallback, kept so nothing breaks)
 *
 * When neither key is present nothing is sent: the message is logged and the
 * caller still succeeds, so password reset and billing flows work in
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

export type EmailProvider = "brevo" | "resend";

export function emailProvider(): EmailProvider | null {
  if (process.env.BREVO_API_KEY) return "brevo";
  if (process.env.RESEND_API_KEY) return "resend";
  return null;
}

export function isEmailConfigured(): boolean {
  return emailProvider() !== null;
}

export function emailFrom(): string {
  return process.env.EMAIL_FROM ?? "PEDMAS <onboarding@resend.dev>";
}

export function emailConfigProblems(): string[] {
  const missing: string[] = [];
  if (!isEmailConfigured()) missing.push("BREVO_API_KEY (or RESEND_API_KEY)");
  if (!process.env.EMAIL_FROM) missing.push("EMAIL_FROM");
  return missing;
}

/** Splits `Name <addr@example.com>` into parts; a bare address gets no name. */
export function parseFromAddress(from: string): { name?: string; email: string } {
  const match = from.match(/^\s*(.*?)\s*<\s*(.+?)\s*>\s*$/);
  if (match && match[2]) {
    return match[1] ? { name: match[1], email: match[2] } : { email: match[2] };
  }
  return { email: from.trim() };
}

async function postJson(
  url: string,
  headers: Record<string, string>,
  body: unknown,
): Promise<SendResult> {
  const res = await fetch(url, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error(`[email:failed] status=${res.status} ${detail.slice(0, 200)}`);
    return { sent: false, error: `Provider responded ${res.status}` };
  }
  return { sent: true };
}

export async function sendMail(mail: Mail): Promise<SendResult> {
  const provider = emailProvider();
  if (!provider) {
    // Developer visibility without a provider. Never log full bodies — reset
    // links are credentials.
    console.info(`[email:skipped] to=${mail.to} subject=${JSON.stringify(mail.subject)}`);
    return { sent: false, skipped: "unconfigured" };
  }
  try {
    if (provider === "brevo") {
      return await postJson(
        "https://api.brevo.com/v3/smtp/email",
        { "api-key": process.env.BREVO_API_KEY! },
        {
          sender: parseFromAddress(emailFrom()),
          to: [{ email: mail.to }],
          subject: mail.subject,
          htmlContent: mail.html,
          textContent: mail.text,
        },
      );
    }
    return await postJson(
      "https://api.resend.com/emails",
      { Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
      {
        from: emailFrom(),
        to: [mail.to],
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
      },
    );
  } catch (err) {
    console.error("[email:error]", err instanceof Error ? err.message : err);
    return { sent: false, error: "Transport error" };
  }
}
