import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { createAccount } from "@/lib/auth";
import { CHILD_AGE_THRESHOLD } from "@/lib/legal";

/**
 * A child under the consent threshold cannot consent for themselves. Until
 * registration opened this was hypothetical; on a public site it is a live
 * COPPA exposure, because "I'm a student" is the DEFAULT selection and asked
 * for nothing but a name and an email. Self-signup now requires an age
 * affirmation, enforced on the server — the endpoint is public, so the form
 * alone proves nothing.
 */

const terms = { acceptedTerms: true, parentAffirmed: false };

describe("a student creating their own account must affirm their age", () => {
  it("is refused without the affirmation", async () => {
    const res = await createAccount("age-no@example.com", "longpassword1", "STUDENT", "Kid", terms);
    expect("error" in res).toBe(true);
    if ("error" in res) {
      expect(res.error).toContain(String(CHILD_AGE_THRESHOLD));
      // The refusal must point at the path that IS allowed.
      expect(res.error.toLowerCase()).toContain("parent");
    }
  });

  it("succeeds with it, and records it for evidence", async () => {
    const res = await createAccount("age-yes@example.com", "longpassword1", "STUDENT", "Teen", {
      ...terms,
      ageAffirmed: true,
    });
    expect("error" in res).toBe(false);
    if (!("error" in res)) {
      expect(res.consent?.ageAffirmed).toBe(true);
      expect(res.consent?.policyVersion).toBeTruthy();
    }
  });

  it("does not apply to parents, who affirm guardianship instead", async () => {
    const res = await createAccount("age-parent@example.com", "longpassword1", "PARENT", "Mum", {
      acceptedTerms: true,
      parentAffirmed: true,
    });
    expect("error" in res, "a parent must not be asked to affirm their own age").toBe(false);
  });

  it("a parent still cannot skip the guardianship affirmation", async () => {
    const res = await createAccount("age-parent2@example.com", "longpassword1", "PARENT", "Dad", {
      acceptedTerms: true,
      parentAffirmed: false,
      ageAffirmed: true,
    });
    expect("error" in res).toBe(true);
  });
});

describe("the form asks for it too", () => {
  const form = readFileSync(
    join(process.cwd(), "src/app/(auth)/signup/SignupForm.tsx"),
    "utf8"
  );
  it("shows the affirmation on the student path and blocks submit without it", () => {
    expect(form).toContain('role === "STUDENT" &&');
    expect(form).toContain("I am 13 or older");
    expect(form).toContain('(role === "STUDENT" && !ageAffirmed)');
  });

  it("sends it to the server", () => {
    expect(form).toContain("parentAffirmed, ageAffirmed }");
  });
});
