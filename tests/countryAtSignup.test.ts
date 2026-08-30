import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { createAccount } from "@/lib/auth";
import { isCountryCode } from "@/lib/countries";

/**
 * Registration asks the parent for their country outright, and that stated
 * country — not geo-IP guessing — decides the curriculum variant and units.
 * The very first test families were geo-stamped US by a mis-routed
 * connection and their children were served customary units in Canada.
 */

describe("a stated country decides the region at account creation", () => {
  const consent = { acceptedTerms: true, parentAffirmed: true };

  it("Canada gets the metric curriculum", async () => {
    const acc = await createAccount("country-ca@example.com", "longpassword1", "PARENT", "T", consent, "CA");
    expect("error" in acc).toBe(false);
    if ("error" in acc) return;
    expect(acc.region).toBe("INTL");
    expect(acc.country).toBe("CA");
  });

  it("the United States gets customary units", async () => {
    const acc = await createAccount("country-us@example.com", "longpassword1", "PARENT", "T", consent, "US");
    if ("error" in acc) throw new Error(acc.error);
    expect(acc.region).toBe("US");
  });

  it("no country still creates the account (older callers), leaving detection as fallback", async () => {
    const acc = await createAccount("country-none@example.com", "longpassword1", "PARENT", "T", consent);
    if ("error" in acc) throw new Error(acc.error);
    expect(acc.region).toBeUndefined();
  });
});

describe("the register endpoint requires a real country code", () => {
  const route = readFileSync(join(process.cwd(), "src/app/api/auth/register/route.ts"), "utf8");
  it("validates with isCountryCode before creating anything", () => {
    expect(route).toMatch(/isCountryCode\(body\.country\)/);
  });
  it("the validator accepts real codes case-insensitively and rejects junk", () => {
    expect(isCountryCode("CA")).toBe(true);
    expect(isCountryCode("ca")).toBe(true);
    expect(isCountryCode("XX")).toBe(false);
    expect(isCountryCode("CAN")).toBe(false);
    expect(isCountryCode(42)).toBe(false);
  });
});
