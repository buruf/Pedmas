import type { GeneratorFamily, RawQuestion, Rng, SkillRef } from "../types";
import { inputQ, mcQ, mcChoices, pickName, distU, unitLong } from "./helpers";
import { gcd } from "../num";

const numP = (p: Record<string, unknown>, key: string, dflt: number): number =>
  typeof p[key] === "number" ? (p[key] as number) : dflt;
const str = (p: Record<string, unknown>, key: string, dflt: string): string =>
  typeof p[key] === "string" ? (p[key] as string) : dflt;

/** Bare display of an integer with a proper minus sign. */
export const neg = (n: number): string => (n < 0 ? `−${-n}` : String(n));
/** Display wrapped in parentheses when negative. */
export const wrap = (n: number): string => (n < 0 ? `(−${-n})` : String(n));
/** Non-zero integer in [lo, hi]. */
export function nz(rng: Rng, lo: number, hi: number): number {
  let v = rng.int(lo, hi);
  while (v === 0) v = rng.int(lo, hi);
  return v;
}
/** Unsigned term like "3x", "x", "5" (v may be "", "x", "x^2", "y", "xy"). */
export function fmtTerm(c: number, v: string): string {
  const a = Math.abs(c);
  return `${v && a === 1 ? "" : a}${v}`;
}
/** Join [coef, var] pairs into a display polynomial, skipping zero terms. */
export function fmtPoly(terms: ReadonlyArray<readonly [number, string]>): string {
  const parts: string[] = [];
  for (const [c, v] of terms) {
    if (c === 0) continue;
    if (parts.length === 0) parts.push((c < 0 ? "−" : "") + fmtTerm(c, v));
    else parts.push((c < 0 ? " − " : " + ") + fmtTerm(c, v));
  }
  return parts.length ? parts.join("") : "0";
}
/** ASCII twin of a display string, for typed answers. */
export const ascii = (s: string): string => s.replace(/−/g, "-").replace(/\s+/g, " ").trim();
/** Binomial factor display, e.g. binom(3) = "(x + 3)", binom(-2) = "(x − 2)". */
export function binom(r: number, v = "x"): string {
  return r === 0 ? `${v}` : r > 0 ? `(${v} + ${r})` : `(${v} − ${-r})`;
}
/** Reduced fraction as an answer string: sign on the numerator, integer if possible. */
export function fracStr(n: number, d: number): string {
  const s = (n < 0) !== (d < 0) && n !== 0 ? "-" : "";
  const an = Math.abs(n);
  const ad = Math.abs(d);
  const g = gcd(an, ad) || 1;
  return ad / g === 1 ? `${s}${an / g}` : `${s}${an / g}/${ad / g}`;
}
/** Evaluate coefficients (highest power first) at x. */
export function polyVal(coeffs: readonly number[], x: number): number {
  return coeffs.reduce((acc, c) => acc * x + c, 0);
}
/** "y = mx + b" display with clean signs. */
export function lineStr(m: number, b: number): string {
  const mPart = m === 0 ? "" : fmtTerm(m, "x");
  const sign = m < 0 ? "−" : "";
  if (m === 0) return `y = ${neg(b)}`;
  return `y = ${sign}${mPart}${b === 0 ? "" : b > 0 ? ` + ${b}` : ` − ${-b}`}`;
}

/* ------------------------------------------------------ evaluate-expression */
/** params: vars 1 | 2.
 * Stage table:
 *  1 one operation, positive value
 *  2 two operations, positive value
 *  3 squares (or a second variable)
 *  4 negative substitution values
 *  5 multi-term expressions with any signs
 */
const evaluateExpression: GeneratorFamily = {
  stageLabel: (s, st) =>
    ["One operation", "Two operations", "Squares & second variable", "Negative values", "Multi-term expressions"][st - 1],
  generate(skill, stage, rng): RawQuestion {
    const vars = numP(skill.params, "vars", 1);
    if (stage === 1) {
      const a = rng.int(2, 9);
      const b = rng.int(1, 9);
      const x = rng.int(1, 9);
      const ans = a * x + b;
      return inputQ({
        instruction: "Evaluate the expression.",
        prompt: `${a}x + ${b}   (x = ${x})`,
        answer: String(ans),
        hint: `${a}x means ${a} × x. Replace x with ${x}.`,
        steps: [`Substitute: ${a}(${x}) + ${b}.`, `Multiply first: ${a * x} + ${b} = ${ans}.`],
        concept: "Substituting swaps the letter for its value — then order of operations applies.",
        verify: () => (ans - b) / a === x,
      });
    }
    if (stage === 2) {
      const a = rng.int(2, 9);
      const b = rng.int(1, 9);
      const x = rng.int(2, 9);
      const useParen = rng.chance(0.5);
      const ans = useParen ? a * (x + b) : a * x - b;
      return inputQ({
        instruction: "Evaluate the expression.",
        prompt: useParen ? `${a}(x + ${b})   (x = ${x})` : `${a}x − ${b}   (x = ${x})`,
        answer: String(ans),
        hint: useParen ? "Work inside the parentheses first." : `Multiply ${a} × ${x} before subtracting.`,
        steps: useParen
          ? [`Inside first: ${x} + ${b} = ${x + b}.`, `${a} × ${x + b} = ${ans}.`]
          : [`Multiply first: ${a} × ${x} = ${a * x}.`, `${a * x} − ${b} = ${ans}.`],
        concept: "Order of operations still rules after substitution.",
        verify: () => (useParen ? ans / a - b === x : (ans + b) / a === x),
      });
    }
    if (stage === 3) {
      if (vars >= 2) {
        const a = rng.int(2, 6);
        const b = rng.int(2, 6);
        const x = rng.int(1, 8);
        const y = rng.int(1, 8);
        const ans = a * x + b * y;
        return inputQ({
          instruction: "Evaluate the expression.",
          prompt: `${a}x + ${b}y   (x = ${x}, y = ${y})`,
          answer: String(ans),
          hint: "Substitute both letters, then add the two products.",
          steps: [`${a}(${x}) = ${a * x} and ${b}(${y}) = ${b * y}.`, `${a * x} + ${b * y} = ${ans}.`],
          concept: "Each variable carries its own value into the expression.",
          verify: () => ans - b * y === a * x,
        });
      }
      const b = rng.int(1, 12);
      const x = rng.int(2, 9);
      const ans = x * x + b;
      return inputQ({
        instruction: "Evaluate the expression.",
        prompt: `x^2 + ${b}   (x = ${x})`,
        answer: String(ans),
        hint: `x^2 means x × x.`,
        steps: [`${x}^2 = ${x} × ${x} = ${x * x}.`, `${x * x} + ${b} = ${ans}.`],
        concept: "Exponents apply to the substituted value.",
        verify: () => Math.sqrt(ans - b) === x,
      });
    }
    if (stage === 4) {
      const a = rng.int(2, 7);
      const b = rng.int(1, 9);
      const x = -rng.int(1, 6);
      const y = vars >= 2 ? -rng.int(1, 6) : 0;
      if (vars >= 2) {
        const c = rng.int(2, 5);
        const ans = a * x + c * y + b;
        return inputQ({
          instruction: "Evaluate the expression.",
          prompt: `${a}x + ${c}y + ${b}   (x = ${neg(x)}, y = ${neg(y)})`,
          answer: String(ans),
          answerHint: "e.g. -7",
          hint: "Keep the negative signs with the values when multiplying.",
          steps: [
            `${a}(${neg(x)}) = ${neg(a * x)} and ${c}(${neg(y)}) = ${neg(c * y)}.`,
            `${neg(a * x)} + ${wrap(c * y)} + ${b} = ${neg(ans)}.`,
          ],
          concept: "Negative substitutions follow the integer sign rules.",
          verify: () => ans - b - c * y === a * x,
        });
      }
      const ans = a * x + b;
      return inputQ({
        instruction: "Evaluate the expression.",
        prompt: `${a}x + ${b}   (x = ${neg(x)})`,
        answer: String(ans),
        answerHint: "e.g. -7",
        hint: `${a} times a negative number is negative.`,
        steps: [`${a}(${neg(x)}) = ${neg(a * x)}.`, `${neg(a * x)} + ${b} = ${neg(ans)}.`],
        concept: "A negative substitution flips the sign of the product.",
        verify: () => (ans - b) / a === x,
      });
    }
    const a = rng.int(1, 4);
    const b = nz(rng, -6, 6);
    const c = nz(rng, -9, 9);
    const x = nz(rng, -4, 4);
    const ans = a * x * x + b * x + c;
    return inputQ({
      instruction: "Evaluate the expression.",
      prompt: `${fmtPoly([[a, "x^2"], [b, "x"], [c, ""]])}   (x = ${neg(x)})`,
      answer: String(ans),
      answerHint: "e.g. -7",
      hint: "Evaluate the square first — a negative squared is positive.",
      steps: [
        `(${neg(x)})^2 = ${x * x}, so the first term is ${a} × ${x * x} = ${a * x * x}.`,
        `Middle term: ${neg(b)} × ${wrap(x)} = ${neg(b * x)}.`,
        `${a * x * x} + ${wrap(b * x)} + ${wrap(c)} = ${neg(ans)}.`,
      ],
      concept: "Work term by term: powers, then products, then the sum.",
      verify: () => polyVal([a, b, c], x) === ans,
    });
  },
};

/* -------------------------------------------------------- combine-like-terms */
/** Stage table:
 *  1 two like terms
 *  2 two groups (x terms and constants)
 *  3 with negative coefficients
 *  4 two variables
 *  5 with squared terms
 */
const combineLikeTerms: GeneratorFamily = {
  stageLabel: (s, st) =>
    ["Two like terms", "Terms and constants", "Negative coefficients", "Two variables", "With squared terms"][st - 1],
  generate(skill, stage, rng): RawQuestion {
    if (stage === 1) {
      const a = rng.int(2, 9);
      const b = rng.int(2, 9);
      return inputQ({
        instruction: "Simplify by combining like terms.",
        prompt: `${a}x + ${b}x`,
        answer: `${a + b}x`,
        answerFormat: "text",
        accept: [`${a + b} x`],
        answerHint: "e.g. 7x",
        hint: `${a} x's plus ${b} x's — add the coefficients.`,
        steps: [`${a}x + ${b}x = (${a} + ${b})x.`, `${a} + ${b} = ${a + b}, so the sum is ${a + b}x.`],
        concept: "Like terms combine by adding their coefficients.",
        verify: () => (a + b) * 3 === a * 3 + b * 3,
      });
    }
    if (stage === 2) {
      const a = rng.int(2, 8);
      const c = rng.int(2, 8);
      const b = rng.int(1, 9);
      const d = rng.int(1, 9);
      const ans = fmtPoly([[a + c, "x"], [b + d, ""]]);
      return mcQ({
        instruction: "Simplify by combining like terms.",
        prompt: `${a}x + ${b} + ${c}x + ${d}`,
        choices: mcChoices(rng, ans, [
          `${a + b + c + d}x`,
          fmtPoly([[a + c, "x^2"], [b + d, ""]]),
          fmtPoly([[a + d, "x"], [b + c, ""]]),
        ]),
        answer: ans,
        hint: "x terms only combine with x terms; numbers only with numbers.",
        steps: [
          `x terms: ${a}x + ${c}x = ${a + c}x.`,
          `Constants: ${b} + ${d} = ${b + d}.`,
          `Result: ${ans}.`,
        ],
        concept: "Only terms with identical variable parts can merge.",
        verify: () => (a + c) * 5 + (b + d) === a * 5 + b + c * 5 + d,
      });
    }
    if (stage === 3) {
      const a = rng.int(3, 9);
      let c = rng.int(2, 8);
      while (c === a) c = rng.int(2, 8);
      const b = rng.int(1, 9);
      let d = rng.int(1, 9);
      while (d === b) d = rng.int(1, 9);
      const ans = fmtPoly([[a - c, "x"], [d - b, ""]]);
      return mcQ({
        instruction: "Simplify by combining like terms.",
        prompt: `${a}x − ${b} − ${c}x + ${d}`,
        choices: mcChoices(rng, ans, [
          fmtPoly([[a + c, "x"], [d - b, ""]]),
          fmtPoly([[a - c, "x"], [b + d, ""]]),
          fmtPoly([[a - c, "x"], [b - d, ""]]),
        ]),
        answer: ans,
        hint: "Keep each minus sign attached to the term that follows it.",
        steps: [
          `x terms: ${a}x − ${c}x = ${neg(a - c)}x.`,
          `Constants: −${b} + ${d} = ${neg(d - b)}.`,
          `Result: ${ans}.`,
        ],
        concept: "A term's sign travels with it when regrouping.",
        verify: () => (a - c) * 7 + (d - b) === a * 7 - b - c * 7 + d,
      });
    }
    if (stage === 4) {
      const a = rng.int(2, 7);
      const b = rng.int(2, 7);
      let c = rng.int(2, 7);
      let d = rng.int(2, 7);
      while (c === d) d = rng.int(2, 7);
      while (a + c === b + d) c = rng.int(2, 8);
      const ans = fmtPoly([[a + c, "x"], [b + d, "y"]]);
      return mcQ({
        instruction: "Simplify by combining like terms.",
        prompt: `${a}x + ${b}y + ${c}x + ${d}y`,
        choices: mcChoices(rng, ans, [
          `${a + b + c + d}xy`,
          fmtPoly([[a + d, "x"], [b + c, "y"]]),
          fmtPoly([[a + c, "y"], [b + d, "x"]]),
        ]),
        answer: ans,
        hint: "x terms and y terms are different kinds — combine each kind separately.",
        steps: [
          `x terms: ${a}x + ${c}x = ${a + c}x.`,
          `y terms: ${b}y + ${d}y = ${b + d}y.`,
          `Result: ${ans} — x and y never merge into xy.`,
        ],
        concept: "Different variables are unlike terms.",
        verify: () => (a + c) * 2 + (b + d) * 3 === a * 2 + b * 3 + c * 2 + d * 3,
      });
    }
    const a = rng.int(2, 6);
    const c = rng.int(2, 6);
    const b = rng.int(2, 8);
    const d = rng.int(1, 9);
    const ans = fmtPoly([[a + c, "x^2"], [b, "x"], [-d, ""]]);
    return mcQ({
      instruction: "Simplify by combining like terms.",
      prompt: `${a}x^2 + ${b}x + ${c}x^2 − ${d}`,
      choices: mcChoices(rng, ans, [
        fmtPoly([[a + b + c, "x^2"], [-d, ""]]),
        fmtPoly([[a + c, "x^2"], [b, "x"], [d, ""]]),
        fmtPoly([[a + c, "x^2"], [b - d, "x"]]),
      ]),
      answer: ans,
      hint: "x^2 and x are unlike terms — treat them as separate kinds.",
      steps: [
        `x^2 terms: ${a}x^2 + ${c}x^2 = ${a + c}x^2.`,
        `${b}x has no partner, and the constant is −${d}.`,
        `Result: ${ans}.`,
      ],
      concept: "Like terms must match in both variable and exponent.",
      verify: () => (a + c) * 9 + b * 3 - d === a * 9 + b * 3 + c * 9 - d,
    });
  },
};

/* ------------------------------------------------------------- distributive */
/** Stage table:
 *  1 a(x + b), all positive
 *  2 a(bx − c)
 *  3 negative multiplier
 *  4 distribute then combine
 *  5 two distributions
 */
const distributive: GeneratorFamily = {
  stageLabel: (s, st) =>
    ["Positive multiplier", "Coefficient inside", "Negative multiplier", "Distribute and combine", "Two distributions"][st - 1],
  generate(skill, stage, rng): RawQuestion {
    if (stage === 1) {
      const a = rng.int(2, 9);
      const b = rng.int(1, 9);
      const ans = `${a}x + ${a * b}`;
      return inputQ({
        instruction: "Expand.",
        prompt: `${a}(x + ${b})`,
        answer: ans,
        answerFormat: "text",
        accept: [`${a}x+${a * b}`, `${a * b} + ${a}x`, `${a * b}+${a}x`],
        answerHint: `e.g. ${a}x + ${a * b}`,
        hint: `Multiply ${a} by each term inside the parentheses.`,
        steps: [`${a} × x = ${a}x and ${a} × ${b} = ${a * b}.`, `${a}(x + ${b}) = ${a}x + ${a * b}.`],
        concept: "The outside factor multiplies every term inside.",
        verify: () => a * (10 + b) === a * 10 + a * b,
      });
    }
    if (stage === 2) {
      const a = rng.int(2, 6);
      const b = rng.int(2, 6);
      const c = rng.int(1, 9);
      const ans = `${a * b}x - ${a * c}`;
      return inputQ({
        instruction: "Expand.",
        prompt: `${a}(${b}x − ${c})`,
        answer: ans,
        answerFormat: "text",
        accept: [`${a * b}x-${a * c}`, `-${a * c} + ${a * b}x`, `-${a * c}+${a * b}x`],
        answerHint: `e.g. ${a * b}x - ${a * c}`,
        hint: `${a} multiplies both ${b}x and ${c} — the minus sign stays.`,
        steps: [`${a} × ${b}x = ${a * b}x and ${a} × ${c} = ${a * c}.`, `${a}(${b}x − ${c}) = ${a * b}x − ${a * c}.`],
        concept: "Distribution multiplies coefficients and keeps the signs.",
        verify: () => a * (b * 4 - c) === a * b * 4 - a * c,
      });
    }
    if (stage === 3) {
      const a = rng.int(2, 7);
      const b = rng.int(1, 9);
      const ans = fmtPoly([[-a, "x"], [-a * b, ""]]);
      return mcQ({
        instruction: "Expand.",
        prompt: `−${a}(x + ${b})`,
        choices: mcChoices(rng, ans, [
          fmtPoly([[-a, "x"], [a * b, ""]]),
          fmtPoly([[a, "x"], [-a * b, ""]]),
          fmtPoly([[-a, "x"], [-b, ""]]),
        ]),
        answer: ans,
        hint: "The negative sign distributes to BOTH terms inside.",
        steps: [
          `−${a} × x = −${a}x.`,
          `−${a} × ${b} = −${a * b} — the second term flips too.`,
          `−${a}(x + ${b}) = ${ans}.`,
        ],
        concept: "A negative multiplier flips every sign inside.",
        verify: () => -a * (6 + b) === -a * 6 - a * b,
      });
    }
    if (stage === 4) {
      let a = rng.int(2, 6);
      let c = rng.int(2, 6);
      while (a === 2 && c === 2) c = rng.int(3, 6);
      const b = rng.int(1, 8);
      const ans = fmtPoly([[a + c, "x"], [a * b, ""]]);
      return mcQ({
        instruction: "Expand and simplify.",
        prompt: `${a}(x + ${b}) + ${c}x`,
        choices: mcChoices(rng, ans, [
          fmtPoly([[a + c, "x"], [b, ""]]),
          fmtPoly([[a * c, "x"], [a * b, ""]]),
          fmtPoly([[a + a * c, "x"], [a * b, ""]]),
        ]),
        answer: ans,
        hint: "Distribute first, then collect the x terms.",
        steps: [
          `Distribute: ${a}(x + ${b}) = ${a}x + ${a * b}.`,
          `Combine: ${a}x + ${c}x = ${a + c}x.`,
          `Result: ${ans}.`,
        ],
        concept: "Expand before combining — distribution comes first.",
        verify: () => a * (3 + b) + c * 3 === (a + c) * 3 + a * b,
      });
    }
    let a = rng.int(2, 7);
    let c = rng.int(2, 7);
    while (c === a) c = rng.int(2, 7);
    const b = rng.int(1, 6);
    const d = rng.int(1, 6);
    const ans = fmtPoly([[a - c, "x"], [a * b + c * d, ""]]);
    return mcQ({
      instruction: "Expand and simplify.",
      prompt: `${a}(x + ${b}) − ${c}(x − ${d})`,
      choices: mcChoices(rng, ans, [
        fmtPoly([[a - c, "x"], [a * b - c * d, ""]]),
        fmtPoly([[a + c, "x"], [a * b + c * d, ""]]),
        fmtPoly([[a - c, "x"], [b + d, ""]]),
      ]),
      answer: ans,
      hint: "Distribute −" + c + " carefully: it hits both x and −" + d + ".",
      steps: [
        `${a}(x + ${b}) = ${a}x + ${a * b}.`,
        `−${c}(x − ${d}) = −${c}x + ${c * d} — minus times minus gives plus.`,
        `Combine: ${ans}.`,
      ],
      concept: "Subtracting a group distributes the negative through it.",
      verify: () => a * (2 + b) - c * (2 - d) === (a - c) * 2 + a * b + c * d,
    });
  },
};

/* ------------------------------------------------------ translate-expression */
/** Stage table:
 *  1 add/subtract phrases
 *  2 multiply/divide phrases
 *  3 two-step phrases
 *  4 order traps ("less than")
 *  5 real-world contexts
 */
const translateExpression: GeneratorFamily = {
  stageLabel: (s, st) =>
    ["Add & subtract phrases", "Multiply & divide phrases", "Two-step phrases", "Order matters", "In context"][st - 1],
  generate(skill, stage, rng): RawQuestion {
    const k = rng.int(2, 9);
    if (stage === 1) {
      const isAdd = rng.chance(0.5);
      const phrase = isAdd
        ? rng.pick([`${k} more than a number n`, `the sum of n and ${k}`, `n increased by ${k}`])
        : rng.pick([`n decreased by ${k}`, `the difference of n and ${k}`, `${k} fewer than n`]);
      const ans = isAdd ? `n + ${k}` : `n − ${k}`;
      return mcQ({
        instruction: "Which expression matches the phrase?",
        prompt: phrase,
        choices: mcChoices(rng, ans, [isAdd ? `n − ${k}` : `n + ${k}`, `${k} − n`, `${k}n`]),
        answer: ans,
        hint: isAdd ? "More than / sum / increased all mean addition." : "Decreased / fewer / difference mean subtraction.",
        steps: [`"${phrase}" ${isAdd ? "adds" : "subtracts"} ${k} ${isAdd ? "to" : "from"} n.`, `Expression: ${ans}.`],
        concept: "Key words map phrases onto operations.",
      });
    }
    if (stage === 2) {
      const isMul = rng.chance(0.5);
      if (isMul) {
        const phrase = rng.pick([`the product of ${k} and n`, `${k} times a number n`, `n multiplied by ${k}`]);
        return mcQ({
          instruction: "Which expression matches the phrase?",
          prompt: phrase,
          choices: mcChoices(rng, `${k}n`, [`n + ${k}`, `{n/${k}}`, `n − ${k}`]),
          answer: `${k}n`,
          hint: "Product and times mean multiplication.",
          steps: [`"${phrase}" multiplies n by ${k}.`, `Expression: ${k}n.`],
          concept: "A number written next to a letter means multiply.",
        });
      }
      const phrase = rng.pick([`n divided by ${k}`, `the quotient of n and ${k}`, `one ${k === 2 ? "half" : k === 3 ? "third" : `${k}th`} of n`]);
      return mcQ({
        instruction: "Which expression matches the phrase?",
        prompt: phrase,
        choices: mcChoices(rng, `{n/${k}}`, [`{${k}/n}`, `${k}n`, `n − ${k}`]),
        answer: `{n/${k}}`,
        hint: "Quotient and divided by mean division — order matters.",
        steps: [`n is being divided by ${k}, so n goes on top.`, `Expression: {n/${k}}.`],
        concept: "In a quotient, the first-named quantity is the dividend.",
      });
    }
    if (stage === 3) {
      const m = rng.int(2, 5);
      const phrase = rng.pick([`${k} more than ${m} times a number n`, `the sum of ${m}n and ${k}`]);
      const ans = `${m}n + ${k}`;
      return mcQ({
        instruction: "Which expression matches the phrase?",
        prompt: phrase,
        choices: mcChoices(rng, ans, [`${m}(n + ${k})`, `${k}n + ${m}`, `${m}n − ${k}`]),
        answer: ans,
        hint: "Build the multiplication first, then add.",
        steps: [`${m} times n is ${m}n.`, `${k} more than that: ${m}n + ${k}.`],
        concept: "Two-step phrases nest one operation inside another.",
      });
    }
    if (stage === 4) {
      const m = rng.int(2, 5);
      const ans = `${m}n − ${k}`;
      return mcQ({
        instruction: "Which expression matches the phrase?",
        prompt: `${k} less than ${m} times a number n`,
        choices: mcChoices(rng, ans, [`${k} − ${m}n`, `${m}(n − ${k})`, `${m}n + ${k}`]),
        answer: ans,
        hint: `"${k} less than X" means X − ${k}, not ${k} − X.`,
        steps: [
          `Start with ${m} times n: ${m}n.`,
          `"${k} less than" takes ${k} away FROM it: ${m}n − ${k}.`,
        ],
        concept: `"Less than" reverses the order you hear the numbers in.`,
      });
    }
    const price = rng.int(3, 12);
    const fee = rng.int(2, 9);
    const ans = `${price}t + ${fee}`;
    return mcQ({
      instruction: "Which expression gives the total cost of t tickets?",
      prompt: `Tickets cost $${price} each, plus a one-time $${fee} booking fee.`,
      choices: mcChoices(rng, ans, [`${fee}t + ${price}`, `${price + fee}t`, `${price}t − ${fee}`]),
      answer: ans,
      hint: "The per-ticket price multiplies t; the one-time fee is added once.",
      steps: [
        `t tickets at $${price} each cost ${price}t.`,
        `Add the single $${fee} fee: ${price}t + ${fee}.`,
      ],
      concept: "Rates multiply the variable; one-time amounts stand alone.",
      representation: "word",
    });
  },
};

/* -------------------------------------------------------------- one-step-eq */
/** Stage table:
 *  1 x + a = b
 *  2 x − a = b and ax = b
 *  3 x/a = b, larger numbers
 *  4 negative solutions
 *  5 story problems
 */
const oneStepEq: GeneratorFamily = {
  stageLabel: (s, st) =>
    ["Addition equations", "Subtraction & multiplication", "Division equations", "Negative solutions", "Story problems"][st - 1],
  generate(skill, stage, rng): RawQuestion {
    if (stage === 1) {
      const x = rng.int(1, 20);
      const a = rng.int(1, 20);
      return inputQ({
        instruction: "Solve for x.",
        prompt: `x + ${a} = ${x + a}`,
        answer: String(x),
        hint: `Undo the +${a} by subtracting ${a} from both sides.`,
        steps: [`Subtract ${a} from both sides: x = ${x + a} − ${a}.`, `x = ${x}.`, `Check: ${x} + ${a} = ${x + a}. ✓`],
        concept: "Whatever you do to one side, do to the other.",
        verify: () => x + a === x + a && (x + a) - a === x,
      });
    }
    if (stage === 2) {
      const x = rng.int(2, 15);
      const a = rng.int(2, 12);
      if (rng.chance(0.5)) {
        return inputQ({
          instruction: "Solve for x.",
          prompt: `x − ${a} = ${x - a}`,
          answer: String(x),
          hint: `Undo the −${a} by adding ${a} to both sides.`,
          steps: [`Add ${a} to both sides: x = ${x - a} + ${a}.`, `x = ${x}.`],
          concept: "Addition undoes subtraction.",
          verify: () => x - a + a === x,
        });
      }
      return inputQ({
        instruction: "Solve for x.",
        prompt: `${a}x = ${a * x}`,
        answer: String(x),
        hint: `x is multiplied by ${a} — divide both sides by ${a}.`,
        steps: [`Divide both sides by ${a}: x = ${a * x} ÷ ${a}.`, `x = ${x}.`],
        concept: "Division undoes multiplication.",
        verify: () => (a * x) / a === x,
      });
    }
    if (stage === 3) {
      const a = rng.int(2, 9);
      const q = rng.int(2, 12);
      return inputQ({
        instruction: "Solve for x.",
        prompt: `{x/${a}} = ${q}`,
        answer: String(a * q),
        hint: `x is divided by ${a} — multiply both sides by ${a}.`,
        steps: [`Multiply both sides by ${a}: x = ${q} × ${a}.`, `x = ${a * q}.`],
        concept: "Multiplication undoes division.",
        verify: () => (a * q) / a === q,
      });
    }
    if (stage === 4) {
      const x = -rng.int(1, 12);
      if (rng.chance(0.5)) {
        const a = rng.int(1, 12);
        return inputQ({
          instruction: "Solve for x.",
          prompt: `x + ${a} = ${neg(x + a)}`,
          answer: String(x),
          answerHint: "e.g. -4",
          hint: `Subtract ${a} — the result will be negative.`,
          steps: [`x = ${neg(x + a)} − ${a}.`, `x = ${neg(x)}.`],
          concept: "Solutions can be negative — the moves are the same.",
          verify: () => x + a === x + a && x === (x + a) - a,
        });
      }
      const a = rng.int(2, 9);
      return inputQ({
        instruction: "Solve for x.",
        prompt: `${a}x = ${neg(a * x)}`,
        answer: String(x),
        answerHint: "e.g. -4",
        hint: `Divide both sides by ${a}; a negative divided by a positive is negative.`,
        steps: [`x = ${neg(a * x)} ÷ ${a}.`, `x = ${neg(x)}.`],
        concept: "Sign rules carry into equation solving.",
        verify: () => (a * x) / a === x,
      });
    }
    const name = pickName(rng);
    const gave = rng.int(3, 15);
    const left = rng.int(4, 20);
    return inputQ({
      instruction: "Write and solve the equation.",
      prompt: `${name} gave away ${gave} stickers and has ${left} left. How many stickers did ${name} start with?`,
      answer: String(gave + left),
      hint: `The equation is x − ${gave} = ${left}.`,
      steps: [`Starting amount minus ${gave} equals ${left}: x − ${gave} = ${left}.`, `x = ${left} + ${gave} = ${gave + left}.`],
      concept: "One-step equations model before-and-after stories.",
      representation: "word",
      verify: () => gave + left - gave === left,
    });
  },
};

/* -------------------------------------------------------------- two-step-eq */
/** Stage table:
 *  1 ax + b = c
 *  2 ax − b = c
 *  3 x/a + b = c
 *  4 negatives (b − ax = c, negative solutions)
 *  5 story problems
 */
const twoStepEq: GeneratorFamily = {
  stageLabel: (s, st) =>
    ["ax + b = c", "ax − b = c", "Division first term", "With negatives", "Story problems"][st - 1],
  generate(skill, stage, rng): RawQuestion {
    if (stage === 1 || stage === 2) {
      const a = rng.int(2, 9);
      const x = rng.int(1, 9);
      const b = rng.int(1, 12);
      const sub = stage === 2;
      const c = sub ? a * x - b : a * x + b;
      return inputQ({
        instruction: "Solve for x.",
        prompt: `${a}x ${sub ? "−" : "+"} ${b} = ${neg(c)}`,
        answer: String(x),
        hint: `First undo the ${sub ? `−${b}` : `+${b}`}, then divide by ${a}.`,
        steps: [
          `${sub ? "Add" : "Subtract"} ${b} ${sub ? "to" : "from"} both sides: ${a}x = ${a * x}.`,
          `Divide by ${a}: x = ${x}.`,
          `Check: ${a}(${x}) ${sub ? "−" : "+"} ${b} = ${neg(c)}. ✓`,
        ],
        concept: "Undo addition/subtraction before multiplication.",
        verify: () => (sub ? a * x - b === c : a * x + b === c),
      });
    }
    if (stage === 3) {
      const a = rng.int(2, 6);
      const q = rng.int(2, 9);
      const b = rng.int(1, 9);
      const c = q + b;
      return inputQ({
        instruction: "Solve for x.",
        prompt: `{x/${a}} + ${b} = ${c}`,
        answer: String(a * q),
        hint: `Subtract ${b} first, then multiply by ${a}.`,
        steps: [`Subtract ${b}: {x/${a}} = ${q}.`, `Multiply by ${a}: x = ${a * q}.`],
        concept: "Peel operations off in reverse order.",
        verify: () => (a * q) / a + b === c,
      });
    }
    if (stage === 4) {
      const a = rng.int(2, 8);
      const x = -rng.int(1, 8);
      const b = rng.int(1, 12);
      if (rng.chance(0.5)) {
        const c = a * x + b;
        return inputQ({
          instruction: "Solve for x.",
          prompt: `${a}x + ${b} = ${neg(c)}`,
          answer: String(x),
          answerHint: "e.g. -3",
          hint: `Subtracting ${b} leaves a negative number to divide.`,
          steps: [`Subtract ${b}: ${a}x = ${neg(a * x)}.`, `Divide by ${a}: x = ${neg(x)}.`],
          concept: "Negative solutions come from the same two steps.",
          verify: () => a * x + b === c,
        });
      }
      const xx = rng.int(1, 8);
      const c = b - a * xx;
      return inputQ({
        instruction: "Solve for x.",
        prompt: `${b} − ${a}x = ${neg(c)}`,
        answer: String(xx),
        hint: `Subtract ${b} from both sides, then divide by −${a}.`,
        steps: [
          `Subtract ${b}: −${a}x = ${neg(c - b)}.`,
          `Divide by −${a}: x = ${xx}.`,
        ],
        concept: "Dividing by a negative flips the sign of the result.",
        verify: () => b - a * xx === c,
      });
    }
    const DL = unitLong(distU(skill.params));
    const DS = distU(skill.params) === "mi" ? "mile" : "kilometre";
    const base = rng.int(2, 6);
    const per = rng.int(2, 5);
    const km = rng.int(3, 12);
    const total = base + per * km;
    return inputQ({
      instruction: "Write and solve the equation.",
      prompt: `A taxi charges a ${base} flat fee plus ${per} per ${DS}. A ride costs ${total}. How many ${DL} was the ride?`,
      answer: String(km),
      hint: `The equation is ${per}x + ${base} = ${total}.`,
      steps: [
        `${per}x + ${base} = ${total}.`,
        `Subtract the flat fee: ${per}x = ${total - base}.`,
        `Divide by ${per}: x = ${km} ${DL}.`,
      ],
      concept: "Two-step equations model rate-plus-fee situations.",
      representation: "word",
      verify: () => base + per * km === total,
    });
  },
};

/* ------------------------------------------------------------ multi-step-eq */
/** params: kind "basic" | "both-sides" | "decimals" | "fractions" | "mixed".
 * Stage table (within each kind, numbers and structure grow):
 *  1 single extra structure
 *  2 combine like terms
 *  3 larger/negative numbers
 *  4 two structures at once
 *  5 full combination
 */
const multiStepEq: GeneratorFamily = {
  stageLabel: (s, st) => {
    const kind = str(s.params, "kind", "mixed");
    if (kind === "fractions")
      return ["One fraction", "Two fractions", "Fraction of a sum", "With constants", "Fractions both sides"][st - 1];
    if (kind === "decimals")
      return ["Tenths coefficient", "With a constant", "Larger decimals", "With subtraction", "Decimals both sides"][st - 1];
    if (kind === "both-sides")
      return ["Small numbers", "Larger numbers", "Negative constants", "Negative coefficient", "With distribution"][st - 1];
    return ["Distribute first", "Combine like terms", "Distribute and combine", "Distribute and subtract", "Two distributions"][st - 1];
  },
  generate(skill, stage, rng): RawQuestion {
    const kindParam = str(skill.params, "kind", "mixed");
    const kind =
      kindParam === "mixed" ? rng.pick(["basic", "both-sides", "decimals", "fractions"] as const) : kindParam;

    if (kind === "fractions") {
      if (stage === 2 || stage === 5) {
        const [a, b] = rng.pick([[2, 3], [2, 5], [3, 4], [3, 5], [2, 7]] as const);
        const k = rng.int(1, stage === 5 ? 6 : 3);
        const x = a * b * k;
        const c = k * (a + b);
        return inputQ({
          instruction: "Solve for x.",
          prompt: `{x/${a}} + {x/${b}} = ${c}`,
          answer: String(x),
          hint: `Multiply every term by ${a * b} to clear both fractions.`,
          steps: [
            `Multiply through by ${a * b}: ${b}x + ${a}x = ${a * b * c}.`,
            `Combine: ${a + b}x = ${a * b * c}.`,
            `Divide: x = ${x}.`,
          ],
          concept: "Clearing denominators turns a fraction equation into a familiar one.",
          verify: () => x / a + x / b === c,
        });
      }
      if (stage === 3 || stage === 4) {
        const b = rng.int(2, 6);
        const x = rng.int(1, 10) * b - rng.int(0, 2);
        const a = rng.int(1, 9);
        const v = Math.round((x + a) / b) === (x + a) / b ? (x + a) / b : 0;
        const aa = v === 0 ? b * rng.int(2, 8) - x : a; // force divisibility
        const vv = (x + aa) / b;
        return inputQ({
          instruction: "Solve for x.",
          prompt: `{(x + ${aa})/${b}} = ${vv}`,
          answer: String(x),
          hint: `Multiply both sides by ${b} first.`,
          steps: [
            `Multiply by ${b}: x + ${aa} = ${b * vv}.`,
            `Subtract ${aa}: x = ${x}.`,
          ],
          concept: "Undo the division before the addition.",
          verify: () => (x + aa) / b === vv,
        });
      }
      const a = rng.int(2, 6);
      const m = rng.int(2, 9);
      const b = rng.int(1, 9);
      const x = a * m;
      return inputQ({
        instruction: "Solve for x.",
        prompt: `{x/${a}} + ${b} = ${m + b}`,
        answer: String(x),
        hint: `Subtract ${b}, then multiply by ${a}.`,
        steps: [`Subtract ${b}: {x/${a}} = ${m}.`, `Multiply by ${a}: x = ${x}.`],
        concept: "Fractions clear once the constant is out of the way.",
        verify: () => x / a + b === m + b,
      });
    }

    if (kind === "decimals") {
      // Work in tenths so every value is exact.
      const dec = (t: number): string => (t % 10 === 0 ? String(t / 10) : (t / 10).toFixed(1));
      const a10 = stage >= 3 ? rng.pick([15, 25, 12] as const) : 5;
      const x = rng.int(2, 12) * 2;
      const b10 = stage === 1 ? 0 : rng.int(1, 9) * 5;
      const sub = stage >= 4 && rng.chance(0.5);
      if (stage === 5) {
        const c10 = rng.pick([2, 4] as const);
        const xs = rng.int(2, 8);
        // Derive the constant from the solution so the equation is exact:
        // a·xs = c·xs + d  requires  d = (a − c)·xs.
        const d10 = (a10 - c10) * xs;
        return inputQ({
          instruction: "Solve for x.",
          prompt: `${dec(a10)}x = ${dec(c10)}x + ${dec(d10)}`,
          answer: String(xs),
          hint: `Subtract ${dec(c10)}x from both sides first.`,
          steps: [
            `Subtract ${dec(c10)}x from both sides: ${dec(a10 - c10)}x = ${dec(d10)}.`,
            `Divide both sides by ${dec(a10 - c10)}: x = ${xs}.`,
          ],
          concept: "Decimal equations follow the same moves as integer ones.",
          verify: () => a10 * xs === c10 * xs + d10,
        });
      }
      const c10 = sub ? a10 * x - b10 : a10 * x + b10;
      return inputQ({
        instruction: "Solve for x.",
        prompt:
          b10 === 0
            ? `${dec(a10)}x = ${dec(c10)}`
            : `${dec(a10)}x ${sub ? "−" : "+"} ${dec(b10)} = ${dec(c10)}`,
        answer: String(x),
        hint: b10 === 0 ? `Divide both sides by ${dec(a10)}.` : `Move the ${dec(b10)} first, then divide by ${dec(a10)}.`,
        steps: [
          ...(b10 === 0 ? [] : [`${sub ? "Add" : "Subtract"} ${dec(b10)}: ${dec(a10)}x = ${dec(a10 * x)}.`]),
          `Divide by ${dec(a10)}: x = ${x}.`,
        ],
        concept: "Decimals behave like whole numbers once you keep the point lined up.",
        verify: () => (sub ? a10 * x - b10 === c10 : a10 * x + b10 === c10),
      });
    }

    if (kind === "both-sides") {
      const range = stage >= 2 ? 9 : 5;
      let a = rng.int(2, range);
      let c = stage === 4 ? -rng.int(1, 5) : rng.int(1, range - 1);
      while (c === a) c = stage === 4 ? -rng.int(1, 5) : rng.int(1, range - 1);
      const x = stage >= 3 ? nz(rng, -9, 9) : rng.int(1, 9);
      const b = stage >= 3 ? nz(rng, -12, 12) : rng.int(1, 12);
      if (stage === 5) {
        const bb = rng.int(1, 6);
        const d = a * (x + bb) - c * x;
        return inputQ({
          instruction: "Solve for x.",
          prompt: `${a}(x + ${bb}) = ${fmtPoly([[c, "x"], [d, ""]])}`,
          answer: String(x),
          answerHint: "e.g. -3",
          hint: `Distribute the ${a} first, then gather x terms on one side.`,
          steps: [
            `Distribute: ${a}x + ${a * bb} = ${fmtPoly([[c, "x"], [d, ""]])}.`,
            `Subtract ${fmtTerm(c, "x")}: ${a - c}x + ${a * bb} = ${neg(d)}.`,
            `Subtract ${a * bb} and divide by ${a - c}: x = ${neg(x)}.`,
          ],
          concept: "Distribute, gather, then solve like a two-step equation.",
          verify: () => a * (x + bb) === c * x + d,
        });
      }
      const d = a * x + b - c * x;
      return inputQ({
        instruction: "Solve for x.",
        prompt: `${fmtPoly([[a, "x"], [b, ""]])} = ${fmtPoly([[c, "x"], [d, ""]])}`,
        answer: String(x),
        answerHint: "e.g. -3",
        hint: `Move the x terms together: subtract ${fmtTerm(c, "x")} from both sides.`,
        steps: [
          `Subtract ${fmtTerm(Math.abs(c), "x")}${c < 0 ? " (i.e. add it)" : ""}: ${neg(a - c)}x ${b >= 0 ? "+" : "−"} ${Math.abs(b)} = ${neg(d)}.`,
          `Move the constant: ${neg(a - c)}x = ${neg(d - b)}.`,
          `Divide by ${neg(a - c)}: x = ${neg(x)}.`,
        ],
        concept: "Collect variables on one side, constants on the other.",
        verify: () => a * x + b === c * x + d,
      });
    }

    // kind === "basic"
    const a = rng.int(2, stage >= 3 ? 9 : 6);
    const b = rng.int(1, 8);
    const x = stage >= 3 ? nz(rng, -9, 9) : rng.int(1, 9);
    if (stage === 1) {
      const xx = rng.int(1, 9);
      return inputQ({
        instruction: "Solve for x.",
        prompt: `${a}(x + ${b}) = ${a * (xx + b)}`,
        answer: String(xx),
        hint: `Divide both sides by ${a} first — or distribute.`,
        steps: [
          `Divide by ${a}: x + ${b} = ${xx + b}.`,
          `Subtract ${b}: x = ${xx}.`,
        ],
        concept: "A factored side can be undone by dividing first.",
        verify: () => a * (xx + b) / a - b === xx,
      });
    }
    if (stage === 2) {
      const c = rng.int(2, 6);
      const xx = rng.int(1, 9);
      const d = rng.int(1, 9);
      const rhs = (a + c) * xx + d;
      return inputQ({
        instruction: "Solve for x.",
        prompt: `${a}x + ${c}x + ${d} = ${rhs}`,
        answer: String(xx),
        hint: `Combine ${a}x and ${c}x first.`,
        steps: [
          `Combine like terms: ${a + c}x + ${d} = ${rhs}.`,
          `Subtract ${d}: ${a + c}x = ${(a + c) * xx}.`,
          `Divide by ${a + c}: x = ${xx}.`,
        ],
        concept: "Simplify each side before moving terms across.",
        verify: () => (a + c) * xx + d === rhs,
      });
    }
    if (stage === 3 || stage === 4) {
      const c = rng.int(2, 6);
      const rhs = a * (x + b) + c * x;
      const useSub = stage === 4;
      const rhs2 = useSub ? a * (x + b) - c : rhs;
      if (useSub) {
        return inputQ({
          instruction: "Solve for x.",
          prompt: `${a}(x + ${b}) − ${c} = ${neg(rhs2)}`,
          answer: String(x),
          answerHint: "e.g. -3",
          hint: `Distribute ${a}, then collect the constants.`,
          steps: [
            `Distribute: ${a}x + ${a * b} − ${c} = ${neg(rhs2)}.`,
            `Constants: ${a}x + ${neg(a * b - c)} = ${neg(rhs2)}.`,
            `Solve: x = ${neg(x)}.`,
          ],
          concept: "Distribution first, then the usual two steps.",
          verify: () => a * (x + b) - c === rhs2,
        });
      }
      return inputQ({
        instruction: "Solve for x.",
        prompt: `${a}(x + ${b}) + ${c}x = ${neg(rhs)}`,
        answer: String(x),
        answerHint: "e.g. -3",
        hint: `Distribute, combine the x terms, then solve.`,
        steps: [
          `Distribute: ${a}x + ${a * b} + ${c}x = ${neg(rhs)}.`,
          `Combine: ${a + c}x + ${a * b} = ${neg(rhs)}.`,
          `Solve: x = ${neg(x)}.`,
        ],
        concept: "Expand, simplify, then isolate x.",
        verify: () => a * (x + b) + c * x === rhs,
      });
    }
    const c = rng.int(2, 5);
    const d = rng.int(1, 5);
    const xx = nz(rng, -6, 6);
    const rhs = a * (xx + b) + c * (xx + d);
    return inputQ({
      instruction: "Solve for x.",
      prompt: `${a}(x + ${b}) + ${c}(x + ${d}) = ${neg(rhs)}`,
      answer: String(xx),
      answerHint: "e.g. -3",
      hint: "Expand both groups, then combine everything.",
      steps: [
        `Expand: ${a}x + ${a * b} + ${c}x + ${c * d} = ${neg(rhs)}.`,
        `Combine: ${a + c}x + ${a * b + c * d} = ${neg(rhs)}.`,
        `Solve: x = ${neg(xx)}.`,
      ],
      concept: "Multiple distributions still reduce to one linear equation.",
      verify: () => a * (xx + b) + c * (xx + d) === rhs,
    });
  },
};

/* --------------------------------------------------------------- inequality */
/** params: steps 1 | 2.
 * Stage table:
 *  1 one-step add/subtract
 *  2 one-step multiply/divide (positive)
 *  3 divide by a negative (flip!)
 *  4 two-step (or reinforced flips when steps: 1)
 *  5 test a value
 */
const inequality: GeneratorFamily = {
  stageLabel: (s, st) =>
    ["Add & subtract", "Multiply & divide", "Flip the sign", "Two-step", "Test a value"][st - 1],
  generate(skill, stage, rng): RawQuestion {
    const maxSteps = numP(skill.params, "steps", 2);
    const lt = rng.chance(0.5);
    const sym = lt ? "<" : ">";
    const opp = lt ? ">" : "<";
    if (stage === 1) {
      const a = rng.int(1, 12);
      const m = rng.int(1, 12);
      const ans = `x ${sym} ${m}`;
      return mcQ({
        instruction: "Solve the inequality.",
        prompt: `x + ${a} ${sym} ${m + a}`,
        choices: mcChoices(rng, ans, [`x ${opp} ${m}`, `x ${sym} ${m + 2 * a}`, `x ${opp} ${m + 2 * a}`]),
        answer: ans,
        hint: `Subtract ${a} from both sides — the direction does not change.`,
        steps: [`Subtract ${a}: x ${sym} ${m + a} − ${a}.`, `x ${sym} ${m}.`],
        concept: "Adding or subtracting never flips an inequality.",
        verify: () => (lt ? m - 1 + a < m + a : m + 1 + a > m + a),
      });
    }
    if (stage === 2) {
      const a = rng.int(2, 9);
      const m = rng.int(2, 9);
      const ans = `x ${sym} ${m}`;
      return mcQ({
        instruction: "Solve the inequality.",
        prompt: `${a}x ${sym} ${a * m}`,
        choices: mcChoices(rng, ans, [`x ${opp} ${m}`, `x ${sym} ${a * m - a}`, `x ${sym} ${a * m}`]),
        answer: ans,
        hint: `Divide by ${a}. Dividing by a POSITIVE keeps the direction.`,
        steps: [`Divide both sides by ${a}: x ${sym} ${m}.`],
        concept: "Positive scaling preserves inequality direction.",
        verify: () => (lt ? a * (m - 1) < a * m : a * (m + 1) > a * m),
      });
    }
    if (stage === 3 || (stage === 4 && maxSteps === 1)) {
      const a = rng.int(2, 9);
      const m = nz(rng, -6, 6);
      const ans = `x ${opp} ${neg(m)}`;
      return mcQ({
        instruction: "Solve the inequality.",
        prompt: `−${a}x ${sym} ${neg(-a * m)}`,
        choices: mcChoices(rng, ans, [`x ${sym} ${neg(m)}`, `x ${opp} ${neg(-m)}`, `x ${sym} ${neg(-m)}`]),
        answer: ans,
        hint: "You must divide by a NEGATIVE — that flips the inequality.",
        steps: [
          `Divide both sides by −${a}.`,
          `Dividing by a negative reverses the direction: x ${opp} ${neg(m)}.`,
        ],
        concept: "Multiplying or dividing by a negative flips the inequality.",
        verify: () => (lt ? -a * (m + 1) < -a * m : -a * (m - 1) > -a * m),
      });
    }
    if (stage === 4) {
      const a = rng.int(2, 6);
      const b = rng.int(1, 9);
      const m = rng.int(1, 8);
      const ans = `x ${sym} ${m}`;
      return mcQ({
        instruction: "Solve the inequality.",
        prompt: `${a}x + ${b} ${sym} ${a * m + b}`,
        choices: mcChoices(rng, ans, [`x ${opp} ${m}`, `x ${sym} ${a * m}`, `x ${sym} ${m + b}`]),
        answer: ans,
        hint: `Subtract ${b} first, then divide by ${a} (positive — no flip).`,
        steps: [`Subtract ${b}: ${a}x ${sym} ${a * m}.`, `Divide by ${a}: x ${sym} ${m}.`],
        concept: "Two-step inequalities mirror two-step equations.",
        verify: () => (lt ? a * (m - 1) + b < a * m + b : a * (m + 1) + b > a * m + b),
      });
    }
    const a = rng.int(2, 6);
    const b = rng.int(1, 9);
    const m = rng.int(2, 8);
    const good = lt ? m - 2 : m + 2;
    const bads = lt ? [m, m + 1, m + 3] : [m, m - 1, m - 3];
    return mcQ({
      instruction: "Which value of x makes the inequality true?",
      prompt: `${a}x + ${b} ${sym} ${a * m + b}`,
      choices: mcChoices(rng, String(good), bads.map(String)),
      answer: String(good),
      hint: `Solve first: the inequality simplifies to x ${sym} ${m}.`,
      steps: [
        `Solve: ${a}x ${sym} ${a * m}, so x ${sym} ${m}.`,
        `${good} ${sym} ${m} is true, so x = ${good} works.`,
      ],
      concept: "An inequality's solution is a whole set — test candidates against it.",
      verify: () => (lt ? a * good + b < a * m + b : a * good + b > a * m + b),
    });
  },
};

/* Advanced algebra families live in ./algebra-advanced.ts */

export const algebraFamilies = {
  "evaluate-expression": evaluateExpression,
  "combine-like-terms": combineLikeTerms,
  distributive: distributive,
  "translate-expression": translateExpression,
  "one-step-eq": oneStepEq,
  "two-step-eq": twoStepEq,
  "multi-step-eq": multiStepEq,
  inequality: inequality,
} satisfies Record<string, GeneratorFamily>;
