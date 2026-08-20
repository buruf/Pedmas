import { getRow, putRow } from "@/lib/store/db";
import type { Account } from "@/lib/model";
import { verifyUnsubscribeSig } from "@/lib/email/unsubscribe";

/**
 * One-click weekly-summary unsubscribe (and resubscribe via ?on=1).
 * GET because it is opened from an email link; the signature scopes it to
 * this single preference on this single account. See lib/email/unsubscribe.
 */

function page(title: string, body: string): Response {
  return new Response(
    `<!doctype html><html><body style="margin:0;padding:48px 24px;background:#f6f5fb;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1f2033">
      <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:16px;padding:28px;text-align:center">
        <div style="font-weight:800;font-size:18px;color:#7c3aed;margin-bottom:16px">PEDMAS</div>
        <h1 style="font-size:19px;margin:0 0 10px">${title}</h1>
        <p style="color:#4a4c60;font-size:14px;line-height:1.5">${body}</p>
      </div>
    </body></html>`,
    { headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const acct = url.searchParams.get("acct") ?? "";
  const sig = url.searchParams.get("sig") ?? "";
  const on = url.searchParams.get("on") === "1";

  if (!acct || !sig || !verifyUnsubscribeSig(acct, sig)) {
    return page("This link is not valid", "It may have been truncated by your mail app. You can manage emails from your PEDMAS account.");
  }
  const account = await getRow<Account>("accounts", acct);
  if (!account) {
    return page("This link is not valid", "The account it points to no longer exists.");
  }

  account.emailPrefs = { ...(account.emailPrefs ?? {}), weeklySummary: on };
  await putRow("accounts", account.id, account);

  if (on) {
    return page("Weekly summaries are back on", "You will get the next progress summary on Sunday.");
  }
  const resub = `${url.origin}${url.pathname}?acct=${encodeURIComponent(acct)}&sig=${sig}&on=1`;
  return page(
    "You are unsubscribed",
    `No more weekly progress summaries will be sent to this address. Password reset and billing emails are unaffected.
     <br/><br/><a href="${resub}" style="color:#7c3aed;font-weight:600">Changed your mind? Turn them back on.</a>`
  );
}
