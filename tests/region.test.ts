import { describe, it, expect } from "vitest";
import { localise, regionForCountry } from "@/lib/region";

describe("regional spelling", () => {
  it("never corrupts words that merely contain -meter", () => {
    // The trap: a loose rule turns these into perimetre / diametre /
    // parametre. All three appear constantly in geometry lessons.
    const dangerous =
      "The perimeter and diameter differ. A parameter, a thermometer, and symmetry.";
    expect(localise(dangerous, "US")).toBe(dangerous);
  });

  it("converts units of length and volume including prefixes", () => {
    expect(localise("7 centimetres and 2 metres", "US")).toBe("7 centimeters and 2 meters");
    expect(localise("500 millilitres in a litre", "US")).toBe("500 milliliters in a liter");
    expect(localise("3 kilometres", "US")).toBe("3 kilometers");
  });

  it("handles the words that differ in meaning, not just spelling", () => {
    // A UK trapezium IS a US trapezoid — getting this wrong teaches the
    // wrong shape, not just an odd spelling.
    expect(localise("a trapezium has one pair", "US")).toBe("a trapezoid has one pair");
    expect(localise("Maths is practise", "US")).toBe("Math is practice");
  });

  it("leaves international text untouched", () => {
    const s = "Colour the trapezium, then measure 5 centimetres.";
    expect(localise(s, "INTL")).toBe(s);
  });

  it("is idempotent, because lesson text is transformed after render", () => {
    const once = localise("Colour 3 centimetres of the centre", "US");
    expect(localise(once, "US")).toBe(once);
    expect(once).toBe("Color 3 centimeters of the center");
  });

  it("maps countries to the right variant", () => {
    expect(regionForCountry("US")).toBe("US");
    expect(regionForCountry("us")).toBe("US");
    expect(regionForCountry("GB")).toBe("INTL");
    expect(regionForCountry("AU")).toBe("INTL");
    expect(regionForCountry("NG")).toBe("INTL");
    expect(regionForCountry("AE")).toBe("INTL");
    expect(regionForCountry(null)).toBe("INTL");
  });
});
