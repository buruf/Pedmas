import { describe, it, expect, afterEach } from "vitest";
import { registrationOpen } from "@/lib/flags";

const original = process.env.REGISTRATION_OPEN;
afterEach(() => {
  if (original === undefined) delete process.env.REGISTRATION_OPEN;
  else process.env.REGISTRATION_OPEN = original;
});

describe("registration flag", () => {
  it("is closed unless explicitly opened", () => {
    // Defaulting to closed means forgetting to set anything is the safe
    // outcome: the live site cannot collect a child's details by accident.
    delete process.env.REGISTRATION_OPEN;
    expect(registrationOpen()).toBe(false);
  });

  it("does not open on a merely truthy value", () => {
    for (const value of ["1", "yes", "TRUE", "on", ""]) {
      process.env.REGISTRATION_OPEN = value;
      expect(registrationOpen(), `"${value}" should not open registration`).toBe(false);
    }
  });

  it("opens only on the exact string true", () => {
    process.env.REGISTRATION_OPEN = "true";
    expect(registrationOpen()).toBe(true);
  });
});
