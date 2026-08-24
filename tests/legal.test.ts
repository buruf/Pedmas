import { describe, it, expect } from "vitest";
import { rateLimit, LIMITS } from "@/lib/rateLimit";
import { createAccount } from "@/lib/auth";
import { POLICY_VERSION, OPERATOR } from "@/lib/legal";

describe("rate limiting", () => {
  it("blocks once the window limit is reached", async () => {
    const key = `test-${Math.random().toString(36).slice(2)}`;
    for (let i = 0; i < 3; i++) {
      const r = await rateLimit("unit", key, 3, 60);
      expect(r.ok).toBe(true);
    }
    const blocked = await rateLimit("unit", key, 3, 60);
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("keeps separate buckets per client", async () => {
    const a = `a-${Math.random().toString(36).slice(2)}`;
    const b = `b-${Math.random().toString(36).slice(2)}`;
    await rateLimit("unit", a, 1, 60);
    expect((await rateLimit("unit", a, 1, 60)).ok).toBe(false);
    // One noisy client must not lock everyone else out.
    expect((await rateLimit("unit", b, 1, 60)).ok).toBe(true);
  });

  it("protects the endpoints an attacker actually probes", () => {
    expect(LIMITS.login.limit).toBeLessThanOrEqual(10);
    expect(LIMITS.register.limit).toBeLessThanOrEqual(10);
    expect(LIMITS.passwordReset.limit).toBeLessThanOrEqual(10);
  });
});

describe("consent", () => {
  const email = () => `consent-${Math.random().toString(36).slice(2)}@example.com`;

  it("refuses to create an account without accepting the terms", async () => {
    const r = await createAccount(email(), "password123", "PARENT", "Test", {
      acceptedTerms: false,
      parentAffirmed: true,
    });
    expect("error" in r).toBe(true);
  });

  it("requires a parent to affirm guardianship", async () => {
    const r = await createAccount(email(), "password123", "PARENT", "Test", {
      acceptedTerms: true,
      parentAffirmed: false,
    });
    expect("error" in r).toBe(true);
  });

  it("records the policy version actually accepted", async () => {
    // Storing the version is the point: a material change to the policy has to
    // be able to identify who has not yet agreed to it.
    const r = await createAccount(email(), "password123", "PARENT", "Test", {
      acceptedTerms: true,
      parentAffirmed: true,
    });
    expect("error" in r).toBe(false);
    if (!("error" in r)) {
      expect(r.consent?.policyVersion).toBe(POLICY_VERSION);
      expect(r.consent?.parentAffirmed).toBe(true);
      expect(r.consent?.acceptedAt).toBeGreaterThan(0);
    }
  });
});

describe("policy documents", () => {
  it("has a policy version to tie consent to", () => {
    expect(POLICY_VERSION).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("names an operator and a contact for privacy requests", () => {
    // A privacy policy with no contactable operator is not a usable one.
    // Operator details were completed 2026-08-23; a bracketed placeholder
    // reappearing here would silently invalidate the published policies.
    for (const field of [OPERATOR.entity, OPERATOR.address, OPERATOR.contactEmail, OPERATOR.jurisdiction]) {
      expect(field.trim().length).toBeGreaterThan(0);
      expect(field).not.toMatch(/\[|to be (completed|confirmed)/i);
    }
    expect(OPERATOR.contactEmail).toMatch(/^[^@\s]+@[^@\s]+$/);
  });
});
