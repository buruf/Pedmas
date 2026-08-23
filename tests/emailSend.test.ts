import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  emailProvider,
  isEmailConfigured,
  emailConfigProblems,
  parseFromAddress,
  sendMail,
} from "@/lib/email/send";

const saved = { ...process.env };

beforeEach(() => {
  delete process.env.BREVO_API_KEY;
  delete process.env.RESEND_API_KEY;
  delete process.env.EMAIL_FROM;
});

afterEach(() => {
  process.env = { ...saved };
  vi.restoreAllMocks();
});

describe("email provider selection", () => {
  it("is unconfigured with no keys", () => {
    expect(emailProvider()).toBeNull();
    expect(isEmailConfigured()).toBe(false);
    expect(emailConfigProblems()).toContain("BREVO_API_KEY (or RESEND_API_KEY)");
  });

  it("prefers Brevo when both keys exist", () => {
    process.env.BREVO_API_KEY = "xkeysib-test";
    process.env.RESEND_API_KEY = "re_test";
    expect(emailProvider()).toBe("brevo");
  });

  it("falls back to Resend when only that key exists", () => {
    process.env.RESEND_API_KEY = "re_test";
    expect(emailProvider()).toBe("resend");
  });
});

describe("parseFromAddress", () => {
  it("splits display name and address", () => {
    expect(parseFromAddress("PEDMAS <hello@pedmas.com>")).toEqual({
      name: "PEDMAS",
      email: "hello@pedmas.com",
    });
  });

  it("handles a bare address", () => {
    expect(parseFromAddress("hello@pedmas.com")).toEqual({ email: "hello@pedmas.com" });
  });

  it("handles brackets without a name", () => {
    expect(parseFromAddress("<hello@pedmas.com>")).toEqual({ email: "hello@pedmas.com" });
  });
});

describe("sendMail", () => {
  const mail = { to: "p@example.com", subject: "Hi", html: "<p>Hi</p>", text: "Hi" };

  it("skips without a provider and never calls fetch", async () => {
    const spy = vi.spyOn(globalThis, "fetch");
    const result = await sendMail(mail);
    expect(result).toEqual({ sent: false, skipped: "unconfigured" });
    expect(spy).not.toHaveBeenCalled();
  });

  it("posts to Brevo with api-key header and Brevo field names", async () => {
    process.env.BREVO_API_KEY = "xkeysib-test";
    process.env.EMAIL_FROM = "PEDMAS <hello@pedmas.com>";
    const spy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(JSON.stringify({ messageId: "m1" }), { status: 201 }));

    const result = await sendMail(mail);
    expect(result.sent).toBe(true);
    const [url, init] = spy.mock.calls[0];
    expect(url).toBe("https://api.brevo.com/v3/smtp/email");
    expect((init!.headers as Record<string, string>)["api-key"]).toBe("xkeysib-test");
    const body = JSON.parse(init!.body as string);
    expect(body.sender).toEqual({ name: "PEDMAS", email: "hello@pedmas.com" });
    expect(body.to).toEqual([{ email: "p@example.com" }]);
    expect(body.htmlContent).toBe("<p>Hi</p>");
    expect(body.textContent).toBe("Hi");
  });

  it("posts to Resend with bearer auth when only Resend is configured", async () => {
    process.env.RESEND_API_KEY = "re_test";
    const spy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(JSON.stringify({ id: "m1" }), { status: 200 }));

    const result = await sendMail(mail);
    expect(result.sent).toBe(true);
    const [url, init] = spy.mock.calls[0];
    expect(url).toBe("https://api.resend.com/emails");
    expect((init!.headers as Record<string, string>).Authorization).toBe("Bearer re_test");
  });

  it("reports provider errors without throwing", async () => {
    process.env.BREVO_API_KEY = "xkeysib-test";
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("bad key", { status: 401 }));
    const result = await sendMail(mail);
    expect(result.sent).toBe(false);
    expect(result.error).toBe("Provider responded 401");
  });
});
