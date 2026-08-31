import { describe, it, expect } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MathText } from "@/components/MathText";

/**
 * Calculus prompts keep their prose form on the wire ("lim as x → −1 of …")
 * because the CAS audit parses those exact strings — but a math product must
 * not SHOW prose limits ("so amateur" — the owner, reviewing the live
 * worksheet pages). MathText typesets the two fixed patterns; everything
 * else is untouched.
 */

const html = (text: string) => renderToStaticMarkup(React.createElement(MathText, { text }));

describe("limits render as notation, not prose", () => {
  it("lim gets its approach underneath and the prose disappears", () => {
    const out = html("lim as x → −1 of x^2 + 5x − 6");
    expect(out).toContain('class="lim"');
    expect(out).toContain("x → −1");
    expect(out).not.toContain("lim as");
    expect(out).not.toContain(" of ");
    expect(out).toContain("<sup>2</sup>");
  });

  it("handles h → 0 and ∞ targets", () => {
    expect(html("lim as h → 0 of {x/h}")).toContain("h → 0");
    expect(html("lim as x → ∞ of x")).toContain("x → ∞");
  });
});

describe("definite integrals carry their bounds on the sign", () => {
  it("∫ from a to b renders stacked bounds", () => {
    const out = html("∫ from 0 to 3 of 2x dx");
    expect(out).toContain('class="intb"');
    expect(out).toContain('class="int-sign"');
    expect(out).not.toContain("from 0 to 3 of");
    expect(out).toContain("2x dx");
  });

  it("indefinite integrals are untouched", () => {
    const out = html("∫ 5x dx");
    expect(out).not.toContain("intb");
    expect(out).toContain("∫ 5x dx");
  });
});

describe("ordinary text is unaffected", () => {
  it("prose containing the word lim elsewhere stays prose", () => {
    expect(html("The limit exists.")).toContain("The limit exists.");
  });
});
