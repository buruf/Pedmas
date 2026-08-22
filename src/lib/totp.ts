/**
 * TOTP (RFC 6238) and its base32 alphabet (RFC 4648), implemented directly.
 *
 * Two reasons not to take a dependency here: the algorithm is thirty lines of
 * HMAC, and it ships with official test vectors, so a correct implementation
 * can be *proved* rather than trusted. tests/totp.test.ts runs the RFC's own
 * vectors against this file.
 *
 * Compatible with Google Authenticator, Authy, 1Password and the rest: SHA-1,
 * 6 digits, 30-second steps, which is what every authenticator app assumes.
 */
import { createHmac, randomBytes, timingSafeEqual } from "crypto";

export const STEP_SECONDS = 30;
const DIGITS = 6;
const B32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

/** Base32-encode, no padding — the form authenticator apps expect. */
export function base32Encode(buf: Buffer): string {
  let bits = 0;
  let value = 0;
  let out = "";
  for (const byte of buf) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += B32[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += B32[(value << (5 - bits)) & 31];
  return out;
}

export function base32Decode(input: string): Buffer {
  const clean = input.toUpperCase().replace(/=+$/, "").replace(/\s/g, "");
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (const ch of clean) {
    const idx = B32.indexOf(ch);
    if (idx === -1) throw new Error("Invalid base32 character");
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(out);
}

/** A fresh 20-byte (160-bit) secret, the size RFC 4226 recommends. */
export function generateSecret(): string {
  return base32Encode(randomBytes(20));
}

/** The counter value for a moment in time. */
export function stepFor(atMs: number): number {
  return Math.floor(atMs / 1000 / STEP_SECONDS);
}

/** The HOTP/TOTP code for a given counter, per RFC 4226 dynamic truncation. */
export function codeForStep(secretBase32: string, step: number, algorithm = "sha1", digits = DIGITS): string {
  const key = base32Decode(secretBase32);
  const counter = Buffer.alloc(8);
  // 64-bit big-endian counter. Written as two 32-bit halves because
  // writeBigUInt64BE would force BigInt on every call for no benefit.
  counter.writeUInt32BE(Math.floor(step / 2 ** 32), 0);
  counter.writeUInt32BE(step >>> 0, 4);

  const digest = createHmac(algorithm, key).update(counter).digest();
  const offset = digest[digest.length - 1] & 0x0f;
  const binary =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);
  return String(binary % 10 ** digits).padStart(digits, "0");
}

export interface VerifyResult {
  ok: boolean;
  /** The step the code matched, so a replay of the same code can be refused. */
  step?: number;
}

/**
 * Check a submitted code.
 *
 * `window` accepts codes one step either side of now, which absorbs ordinary
 * clock drift between a phone and the server. `afterStep` refuses any code at
 * or before a step already used — without it, a code shoulder-surfed inside
 * its 30-second life could be replayed.
 */
export function verifyTotp(
  secretBase32: string,
  submitted: string,
  opts: { atMs?: number; window?: number; afterStep?: number } = {}
): VerifyResult {
  const code = (submitted ?? "").replace(/\s/g, "");
  if (!/^\d{6}$/.test(code)) return { ok: false };
  const now = opts.atMs ?? Date.now();
  const window = opts.window ?? 1;
  const current = stepFor(now);

  for (let drift = -window; drift <= window; drift++) {
    const step = current + drift;
    if (opts.afterStep !== undefined && step <= opts.afterStep) continue;
    const expected = codeForStep(secretBase32, step);
    // Constant-time compare: both are fixed-length digit strings.
    const a = Buffer.from(expected);
    const b = Buffer.from(code);
    if (a.length === b.length && timingSafeEqual(a, b)) return { ok: true, step };
  }
  return { ok: false };
}

/** The otpauth:// URI an authenticator app scans or accepts pasted. */
export function otpauthUri(secretBase32: string, account: string, issuer = "PEDMAS"): string {
  const label = encodeURIComponent(`${issuer}:${account}`);
  const params = new URLSearchParams({
    secret: secretBase32,
    issuer,
    algorithm: "SHA1",
    digits: String(DIGITS),
    period: String(STEP_SECONDS),
  });
  return `otpauth://totp/${label}?${params.toString()}`;
}

/** Human-friendly grouping for a secret typed in by hand. */
export function formatSecret(secret: string): string {
  return secret.replace(/(.{4})/g, "$1 ").trim();
}
