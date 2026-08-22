import { describe, it, expect } from "vitest";
import {
  base32Encode,
  base32Decode,
  codeForStep,
  verifyTotp,
  generateSecret,
  stepFor,
  otpauthUri,
  STEP_SECONDS,
} from "@/lib/totp";

/**
 * TOTP is security code, so it is proved rather than trusted: the first block
 * runs the official RFC 6238 test vectors. If this implementation drifts from
 * the standard, the admin's authenticator app stops matching and these fail
 * first.
 */

// RFC 6238 Appendix B uses the ASCII secret "12345678901234567890".
const RFC_SECRET = base32Encode(Buffer.from("12345678901234567890", "ascii"));

describe("RFC 6238 test vectors (SHA-1)", () => {
  const vectors: [number, string][] = [
    [59, "94287082"],
    [1111111109, "07081804"],
    [1111111111, "14050471"],
    [1234567890, "89005924"],
    [2000000000, "69279037"],
    [20000000000, "65353130"],
  ];

  it.each(vectors)("at unix time %i produces %s", (seconds, expected8) => {
    const step = Math.floor(seconds / STEP_SECONDS);
    // The RFC prints 8 digits; PEDMAS uses the usual 6, which are its last 6.
    const got = codeForStep(RFC_SECRET, step, "sha1", 8);
    expect(got).toBe(expected8);
    expect(codeForStep(RFC_SECRET, step)).toBe(expected8.slice(-6));
  });
});

describe("base32", () => {
  it("round-trips arbitrary bytes", () => {
    for (const text of ["", "a", "ab", "abc", "abcd", "abcde", "hello world"]) {
      const buf = Buffer.from(text, "ascii");
      expect(base32Decode(base32Encode(buf)).toString("ascii")).toBe(text);
    }
  });

  it("matches RFC 4648 examples", () => {
    expect(base32Encode(Buffer.from("foobar"))).toBe("MZXW6YTBOI");
    expect(base32Decode("MZXW6YTBOI").toString()).toBe("foobar");
  });

  it("tolerates spaces and lowercase, as typed by a human", () => {
    expect(base32Decode("mzxw 6ytb oi").toString()).toBe("foobar");
  });

  it("rejects characters outside the alphabet", () => {
    expect(() => base32Decode("MZXW6YTB01")).toThrow();
  });
});

describe("verification", () => {
  const secret = generateSecret();
  const now = 1_800_000_000_000;

  it("accepts the current code", () => {
    const code = codeForStep(secret, stepFor(now));
    expect(verifyTotp(secret, code, { atMs: now }).ok).toBe(true);
  });

  it("absorbs one step of clock drift in both directions", () => {
    for (const drift of [-1, 1]) {
      const code = codeForStep(secret, stepFor(now) + drift);
      expect(verifyTotp(secret, code, { atMs: now }).ok).toBe(true);
    }
  });

  it("rejects codes further out than the window", () => {
    for (const drift of [-3, 2, 10]) {
      const code = codeForStep(secret, stepFor(now) + drift);
      expect(verifyTotp(secret, code, { atMs: now }).ok).toBe(false);
    }
  });

  it("rejects a code from a different secret", () => {
    const other = generateSecret();
    const code = codeForStep(other, stepFor(now));
    expect(verifyTotp(secret, code, { atMs: now }).ok).toBe(false);
  });

  it("refuses replay of an already-used step", () => {
    const step = stepFor(now);
    const code = codeForStep(secret, step);
    const first = verifyTotp(secret, code, { atMs: now });
    expect(first.ok).toBe(true);
    expect(first.step).toBe(step);
    // Same code, submitted again after being recorded as used.
    expect(verifyTotp(secret, code, { atMs: now, afterStep: first.step }).ok).toBe(false);
  });

  it("rejects malformed input without throwing", () => {
    for (const bad of ["", "12345", "1234567", "abcdef", "12 34 56", null as unknown as string]) {
      expect(verifyTotp(secret, bad, { atMs: now }).ok).toBe(false);
    }
  });

  it("generates distinct 160-bit secrets", () => {
    const secrets = new Set(Array.from({ length: 50 }, () => generateSecret()));
    expect(secrets.size).toBe(50);
    expect(base32Decode(generateSecret()).length).toBe(20);
  });
});

describe("enrolment URI", () => {
  it("carries everything an authenticator app needs", () => {
    const uri = otpauthUri("JBSWY3DPEHPK3PXP", "admin@pedmas.com");
    expect(uri).toContain("otpauth://totp/");
    expect(uri).toContain("secret=JBSWY3DPEHPK3PXP");
    expect(uri).toContain("issuer=PEDMAS");
    expect(uri).toContain("digits=6");
    expect(uri).toContain("period=30");
    expect(uri).toContain(encodeURIComponent("PEDMAS:admin@pedmas.com"));
  });
});
