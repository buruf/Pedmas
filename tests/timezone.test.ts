import { describe, it, expect } from "vitest";
import { dayKeyOf } from "@/lib/model";

/**
 * Streaks, "today's practice" and spaced review all key off the calendar day.
 * Computed in UTC, the day rolled over at 7pm in New York and 11am in Sydney.
 */
describe("day boundary", () => {
  // 2026-08-18 01:00 UTC. Local dates differ either side of that instant.
  const ts = Date.parse("2026-08-18T01:00:00Z");

  it("uses the family's own midnight, not UTC's", () => {
    expect(dayKeyOf(ts, "Europe/London")).toBe("2026-08-18");
    // Still the previous evening in the Americas.
    expect(dayKeyOf(ts, "America/New_York")).toBe("2026-08-17");
    expect(dayKeyOf(ts, "America/Los_Angeles")).toBe("2026-08-17");
    // Already well into the next day in the Pacific.
    expect(dayKeyOf(ts, "Australia/Sydney")).toBe("2026-08-18");
    expect(dayKeyOf(ts, "Pacific/Auckland")).toBe("2026-08-18");
  });

  it("keeps an afternoon session on one day in Sydney", () => {
    // 14:00 and 16:00 Sydney on the same afternoon used to straddle the UTC
    // boundary, so they counted as two different days.
    const early = Date.parse("2026-08-18T04:00:00Z"); // 14:00 Sydney
    const late = Date.parse("2026-08-18T06:00:00Z"); // 16:00 Sydney
    expect(dayKeyOf(early, "Australia/Sydney")).toBe(dayKeyOf(late, "Australia/Sydney"));
  });

  it("falls back to UTC rather than breaking on a bad zone", () => {
    expect(dayKeyOf(ts, "Not/AZone")).toBe("2026-08-18");
    expect(dayKeyOf(ts, undefined)).toBe("2026-08-18");
  });
});
