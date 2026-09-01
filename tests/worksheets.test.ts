import { describe, it, expect } from "vitest";
import {
  buildWorksheet,
  FREE_WORKSHEETS,
  isFreeWorksheet,
  stackFractions,
  legacyStrandTopic,
  topicsForGrade,
  topicSlug,
  worksheetDailySeed,
  worksheetExists,
  WORKSHEET_SIZE,
} from "@/lib/worksheets";

/**
 * The public worksheet library serves strangers with no account: every
 * advertised grade × topic page must actually produce a printable sheet,
 * deterministically for a given seed (search engines index the daily
 * default), and only from pencil-and-paper question kinds. Pages are per
 * curriculum TOPIC ("Multiplication", "Logarithms") — the granularity
 * people search at — not per broad strand id.
 */

describe("every advertised page produces a real sheet", () => {
  for (let grade = 1; grade <= 12; grade++) {
    it(`grade ${grade}: all topics fill a sheet in both regions`, () => {
      const topics = topicsForGrade(grade);
      expect(topics.length).toBeGreaterThanOrEqual(5);
      for (const t of topics) {
        for (const region of ["US", "INTL"] as const) {
          const sheet = buildWorksheet(grade, t.slug, 12345, region);
          expect(sheet, `${grade}/${t.slug}/${region}`).not.toBeNull();
          expect(sheet!.questions.length, `${grade}/${t.slug}/${region}`).toBeGreaterThanOrEqual(10);
          for (const q of sheet!.questions) {
            expect(["mc", "input"], `${grade}/${t.slug}: unprintable kind`).toContain(q.kind);
            expect(String(q.answer).length).toBeGreaterThan(0);
          }
        }
      }
    });
  }

  it("topic slugs are unique within every grade", () => {
    for (let grade = 1; grade <= 12; grade++) {
      const slugs = topicsForGrade(grade).map((t) => t.slug);
      expect(new Set(slugs).size).toBe(slugs.length);
    }
  });

  it("high grades are split at searchable granularity", () => {
    const g11 = topicsForGrade(11).map((t) => t.slug);
    expect(g11).toContain("logarithms");
    expect(g11).toContain("trigonometry");
    const g12 = topicsForGrade(12).map((t) => t.slug);
    expect(g12).toContain("calculus");
    const g10 = topicsForGrade(10).map((t) => t.slug);
    expect(g10).toContain("quadratics");
  });
});

describe("determinism and seeds", () => {
  it("the same seed yields the same sheet", () => {
    const a = buildWorksheet(3, "fractions", 777, "INTL")!;
    const b = buildWorksheet(3, "fractions", 777, "INTL")!;
    expect(a.questions.map((q) => q.prompt)).toEqual(b.questions.map((q) => q.prompt));
  });

  it("different seeds yield different sheets", () => {
    const a = buildWorksheet(3, "fractions", 1, "INTL")!;
    const b = buildWorksheet(3, "fractions", 2, "INTL")!;
    expect(a.questions.map((q) => q.prompt)).not.toEqual(b.questions.map((q) => q.prompt));
  });

  it("the daily seed is stable within a day and differs across pages", () => {
    expect(worksheetDailySeed(3, "fractions", "2026-08-31")).toBe(
      worksheetDailySeed(3, "fractions", "2026-08-31")
    );
    expect(worksheetDailySeed(3, "fractions", "2026-08-31")).not.toBe(
      worksheetDailySeed(4, "fractions", "2026-08-31")
    );
  });

  it("a full-size topic fills the whole sheet", () => {
    expect(buildWorksheet(3, "multiplication", 42, "INTL")!.questions.length).toBe(WORKSHEET_SIZE);
  });
});

describe("answer-key fractions stack for print", () => {
  it("bare fractions get MathText's stacked form", () => {
    expect(stackFractions("5/6")).toBe("{5/6}");
    expect(stackFractions("-3/4")).toBe("{-3/4}");
    expect(stackFractions("2 1/2")).toBe("2 {1/2}");
  });

  it("non-fractions pass through untouched", () => {
    expect(stackFractions("0.75")).toBe("0.75");
    expect(stackFractions("3:4")).toBe("3:4");
    expect(stackFractions("<")).toBe("<");
    expect(stackFractions("42")).toBe("42");
  });
});

describe("the reroll gate", () => {
  const page = require("fs").readFileSync(
    require("path").join(process.cwd(), "src/app/worksheets/[grade]/[strand]/page.tsx"),
    "utf8"
  );
  it("the ?seed parameter only takes effect for signed-in accounts", () => {
    expect(page).toMatch(/canReroll && seedParam/);
    expect(page).toContain("const canReroll = Boolean(account);");
  });
});

describe("slugs, existence, and legacy strand URLs", () => {
  it("slugifies section names the obvious way", () => {
    expect(topicSlug("Sequences & Series")).toBe("sequences-series");
    expect(topicSlug("Addition & Subtraction")).toBe("addition-subtraction");
    expect(topicSlug("Logarithms")).toBe("logarithms");
  });

  it("real combos exist, invented ones do not", () => {
    expect(worksheetExists(3, "multiplication")).toBe(true);
    expect(worksheetExists(12, "calculus")).toBe(true);
    expect(worksheetExists(1, "calculus")).toBe(false);
    expect(worksheetExists(3, "nonsense")).toBe(false);
  });

  it("old strand-id URLs resolve to a topic for the redirect", () => {
    expect(legacyStrandTopic(9, "number")).toBe("number-systems");
    expect(legacyStrandTopic(3, "operations")).toBe("addition-subtraction");
    expect(legacyStrandTopic(3, "nonsense")).toBeNull();
  });
});

describe("the free-showcase lock", () => {
  const fs2 = require("fs");
  const path2 = require("path");
  const page = fs2.readFileSync(
    path2.join(process.cwd(), "src/app/worksheets/[grade]/[strand]/page.tsx"),
    "utf8"
  );

  it("exactly two sheets are free, and they exist", () => {
    expect(FREE_WORKSHEETS.length).toBe(2);
    for (const f of FREE_WORKSHEETS) {
      expect(worksheetExists(f.grade, f.slug), `${f.grade}/${f.slug}`).toBe(true);
      expect(isFreeWorksheet(f.grade, f.slug)).toBe(true);
    }
    expect(isFreeWorksheet(3, "fractions")).toBe(false);
  });

  it("locked pages are sliced to the preview SERVER-side, and hide the key", () => {
    expect(page).toContain("full.questions.slice(0, WORKSHEET_PREVIEW_SIZE)");
    expect(page).toContain("const unlocked = canReroll || isFreeWorksheet(grade, slug);");
    expect(page).toContain("{unlocked && (");
  });
});
