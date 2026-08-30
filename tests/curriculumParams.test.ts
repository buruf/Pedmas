import { describe, it, expect } from "vitest";
import { generateQuestion } from "@/engine/generate";
import { allSkills } from "@/curriculum";

/**
 * Tier-1 fixes from the August 2026 curriculum audit: both standards keep
 * Grade 3 within 1,000 (CCSS 3.NBT, Ontario B1), and exponents are not
 * taught before Grade 6 (CCSS 6.EE.1; Ontario names them in Grade 7) — yet
 * Grade 3 place value ran to 10,000 and the Grade 4-5 order-of-operations
 * stages asked 4^3 + 17. These pin the corrected behaviour at the generator
 * level, where it is actually enforced.
 */

const skills = allSkills();
const byName = (grade: number, name: string) =>
  skills.find((s) => s.grade === grade && s.name === name)!;

describe("Grade 3 number work stays within 1,000", () => {
  for (const name of ["Place Value", "Comparing Numbers"]) {
    it(`${name}: every number the child works with is ≤ 1,000`, () => {
      const sk = byName(3, name);
      expect(sk, name).toBeDefined();
      for (let stage = 1; stage <= 5; stage++) {
        for (let i = 0; i < 40; i++) {
          const q = generateQuestion(sk, stage, { seed: 500 + i });
          // Prompt and answer only: a distractor may deliberately show the
          // wrong-place mistake (7,000 + 60 + 5) for the child to reject.
          for (const m of `${q.prompt} ${q.answer}`.matchAll(/\d[\d,]*/g)) {
            const v = Number(m[0].replace(/,/g, ""));
            expect(v, `s${stage}: ${q.prompt}`).toBeLessThanOrEqual(1000);
          }
        }
      }
    });
  }
});

describe("order of operations meets exponents only from Grade 6", () => {
  for (const [grade, name] of [
    [4, "Order of Operations Introduction"],
    [5, "Order of Operations"],
  ] as const) {
    it(`Grade ${grade} never shows an exponent at any stage`, () => {
      const sk = byName(grade, name);
      expect(sk, name).toBeDefined();
      for (let stage = 1; stage <= 5; stage++) {
        for (let i = 0; i < 40; i++) {
          const q = generateQuestion(sk, stage, { seed: 900 + i });
          expect(q.prompt, `g${grade} s${stage}`).not.toContain("^");
        }
      }
    });
  }

  it("Grade 6 still teaches them (CCSS 6.EE.1 is on grade)", () => {
    const sk = byName(6, "Order of Operations");
    let saw = false;
    for (let i = 0; i < 40 && !saw; i++) {
      saw = generateQuestion(sk, 3, { seed: 900 + i }).prompt.includes("^");
    }
    expect(saw).toBe(true);
  });

  it("the no-exponent stages never go negative", () => {
    for (const [grade, name] of [
      [4, "Order of Operations Introduction"],
      [5, "Order of Operations"],
    ] as const) {
      const sk = byName(grade, name);
      for (const stage of [3, 5]) {
        for (let i = 0; i < 40; i++) {
          const q = generateQuestion(sk, stage, { seed: 1300 + i });
          expect(Number(q.answer), `g${grade} s${stage}: ${q.prompt}`).toBeGreaterThanOrEqual(0);
        }
      }
    }
  });
});
