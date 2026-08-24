/**
 * Child sign-in codes.
 *
 * A child gets their own way in without the parent's password — and without
 * the service ever collecting anything from the child. The parent issues a
 * code from their dashboard; the child types it once per device. No email,
 * no child-chosen password, nothing that is personal information under
 * COPPA, and the parent can revoke it instantly.
 *
 * The code is stored only as a hash, like a password-reset token: a database
 * reader cannot sign in as a child, and a lost code is regenerated rather
 * than recovered.
 *
 * Why a random code rather than a four-digit PIN: a PIN is 10,000 guesses,
 * which rate limiting alone should not have to carry for an account holding
 * a child's learning history. The child types this once and stays signed in
 * on that device, so the extra length costs them almost nothing.
 */
import { createHash, randomBytes, timingSafeEqual } from "crypto";
import { allRows, putRow } from "./store/db";
import type { StudentProfile } from "./model";

/** Unambiguous alphabet: no O/0, I/1, S/5 to mistype off a note. */
const ALPHABET = "ABCDEFGHJKLMNPQRTUVWXYZ2346789";

/** Normalised for comparison: case and punctuation do not matter to a child. */
export function normalizeCode(code: string): string {
  return (code ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function hashCode(code: string): string {
  return createHash("sha256").update(normalizeCode(code)).digest("hex");
}

/** A grouped code such as "K7M2-9QXT-4RBH" — three groups of four. */
export function generateCode(): string {
  const bytes = randomBytes(12);
  const chars = [...bytes].map((b) => ALPHABET[b % ALPHABET.length]);
  return [chars.slice(0, 4), chars.slice(4, 8), chars.slice(8, 12)].map((g) => g.join("")).join("-");
}

export function hasSignIn(student: StudentProfile): boolean {
  return Boolean(student.signIn?.codeHash);
}

/**
 * Issue (or replace) a child's code. Returns the plain code, which is shown
 * to the parent once and never stored.
 */
export async function issueCode(student: StudentProfile): Promise<string> {
  const code = generateCode();
  student.signIn = { codeHash: hashCode(code), createdAt: Date.now() };
  await putRow("students", student.id, student);
  return code;
}

/** Withdraw a child's ability to sign in on their own. */
export async function revokeCode(student: StudentProfile): Promise<void> {
  student.signIn = undefined;
  await putRow("students", student.id, student);
}

/**
 * Find the child a code belongs to.
 *
 * Scans students because the code is stored hashed and salt-free by design —
 * there is nothing to look up by. Comparison is constant-time against every
 * candidate, so the scan leaks no timing signal about which child matched.
 */
export async function studentForCode(code: string): Promise<StudentProfile | null> {
  const normalized = normalizeCode(code);
  if (normalized.length < 8) return null;
  const candidate = Buffer.from(hashCode(normalized), "hex");

  let found: StudentProfile | null = null;
  for (const student of await allRows<StudentProfile>("students")) {
    const stored = student.signIn?.codeHash;
    if (!stored) continue;
    const ref = Buffer.from(stored, "hex");
    if (ref.length === candidate.length && timingSafeEqual(ref, candidate)) found = student;
  }
  return found;
}

/** Record that the code was used, so a parent can see it is working. */
export async function markCodeUsed(student: StudentProfile, now = Date.now()): Promise<void> {
  if (!student.signIn) return;
  student.signIn = { ...student.signIn, lastUsedAt: now };
  await putRow("students", student.id, student);
}
