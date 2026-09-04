import { describe, it, expect } from "vitest";
import { formatCodeInput } from "@/lib/codeFormat";
import { generateCode, normalizeCode } from "@/lib/childSignIn";

/**
 * Children were struggling to type the hyphens in their sign-in code. The
 * field now inserts them itself; whatever the child types, the server sees
 * the same normalised code.
 */
describe("child sign-in code entry", () => {
  it("inserts a hyphen after every four characters as the child types", () => {
    expect(formatCodeInput("k")).toBe("K");
    expect(formatCodeInput("k7m2")).toBe("K7M2");
    expect(formatCodeInput("k7m29")).toBe("K7M2-9");
    expect(formatCodeInput("k7m29qxt")).toBe("K7M2-9QXT");
    expect(formatCodeInput("k7m29qxt4rbh")).toBe("K7M2-9QXT-4RBH");
  });

  it("leaves a code the child typed with hyphens, spaces or lowercase exactly right", () => {
    expect(formatCodeInput("K7M2-9QXT-4RBH")).toBe("K7M2-9QXT-4RBH");
    expect(formatCodeInput("k7m2 9qxt 4rbh")).toBe("K7M2-9QXT-4RBH");
    expect(formatCodeInput("K7M2--9QXT")).toBe("K7M2-9QXT");
  });

  it("backspacing over an inserted hyphen removes the character before it", () => {
    // The browser deletes the hyphen; re-formatting drops the trailing group.
    expect(formatCodeInput("K7M2-")).toBe("K7M2");
    expect(formatCodeInput("K7M")).toBe("K7M");
  });

  it("never grows beyond three groups of four", () => {
    expect(formatCodeInput("K7M29QXT4RBHEXTRA")).toBe("K7M2-9QXT-4RBH");
  });

  it("round-trips every generated code to the same normalised value", () => {
    for (let i = 0; i < 200; i++) {
      const code = generateCode();
      const typed = code.toLowerCase().replace(/-/g, "");
      expect(formatCodeInput(typed)).toBe(code);
      expect(normalizeCode(formatCodeInput(typed))).toBe(normalizeCode(code));
    }
  });
});
