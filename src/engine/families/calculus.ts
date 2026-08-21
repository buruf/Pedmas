import type { GeneratorFamily, RawQuestion, Rng, SkillRef } from "../types";
import { inputQ, mcQ, mcChoices, bigLenU, unitLong } from "./helpers";

const str = (p: Record<string, unknown>, key: string, dflt: string): string =>
  typeof p[key] === "string" ? (p[key] as string) : dflt;

function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

/** Simplified plain-text fraction answer: "3/4", "-2/9", or an integer. */
function fracAns(n: number, d: number): string {
  if (d < 0) {
    n = -n;
    d = -d;
  }
  const g = gcd(n, d);
  n /= g;
  d /= g;
  return d === 1 ? String(n) : `${n}/${d}`;
}

/** Nonzero random integer in [lo, hi]. */
function nz(rng: Rng, lo: number, hi: number): number {
  let v = 0;
  do v = rng.int(lo, hi);
  while (v === 0);
  return v;
}

const sx = (n: number): string => (n < 0 ? `−${-n}` : String(n));
const tail = (n: number): string => (n < 0 ? `− ${-n}` : `+ ${n}`);

/** Format ax + b with clean signs. */
function lin(a: number, b: number, v = "x"): string {
  const head = a === 1 ? v : a === -1 ? `−${v}` : `${sx(a)}${v}`;
  return b === 0 ? head : `${head} ${tail(b)}`;
}

/** Format ax^2 + bx + c with clean signs. */
function quad(a: number, b: number, c: number): string {
  let s = a === 1 ? "x^2" : a === -1 ? "−x^2" : `${sx(a)}x^2`;
  if (b !== 0) s += ` ${b < 0 ? "−" : "+"} ${Math.abs(b) === 1 ? "" : Math.abs(b)}x`;
  if (c !== 0) s += ` ${tail(c)}`;
  return s;
}

/** Symmetric numeric derivative for verification. */
function numDeriv(f: (x: number) => number, x: number): number {
  const h = 1e-5;
  return (f(x + h) - f(x - h)) / (2 * h);
}

/** Midpoint Riemann sum for verification of definite integrals. */
function riemann(f: (x: number) => number, a: number, b: number): number {
  const n = 2000;
  const w = (b - a) / n;
  let s = 0;
  for (let i = 0; i < n; i++) s += f(a + (i + 0.5) * w);
  return s * w;
}

const close = (a: number, b: number, eps = 1e-3): boolean => Math.abs(a - b) < eps;

/* ------------------------------------------------------------------- limits */
const limits: GeneratorFamily = {
  stageLabel: (s, st) =>
    ["Direct substitution", "Rational functions", "Factor and cancel", "Limits at infinity", "Continuity"][st - 1],
  generate(skill, stage, rng): RawQuestion {
    if (stage === 1) {
      const b = nz(rng, -5, 5);
      const c = nz(rng, -9, 9);
      const k = nz(rng, -4, 4);
      const ans = k * k + b * k + c;
      return inputQ({
        instruction: "Evaluate the limit.",
        prompt: `lim as x → ${sx(k)} of ${quad(1, b, c)}`,
        answer: String(ans),
        hint: "Polynomials are continuous — substitute directly.",
        steps: [
          `Substitute x = ${sx(k)}: (${sx(k)})^2 ${tail(b * k)} ${tail(c)}.`,
          `= ${k * k} ${tail(b * k)} ${tail(c)} = ${sx(ans)}.`,
        ],
        concept: "For continuous functions, the limit is just the value.",
        verify: () => {
          const f = (x: number) => x * x + b * x + c;
          return close(f(k - 1e-6), ans, 1e-4) && close(f(k + 1e-6), ans, 1e-4);
        },
      });
    }
    if (stage === 2) {
      const k = rng.int(1, 5);
      const m = nz(rng, -8, 8);
      const p = rng.int(2, 5);
      const r = k - 1; // denominator x − r has value 1 at x = k
      const q = m - p * k;
      return inputQ({
        instruction: "Evaluate the limit.",
        prompt: `lim as x → ${k} of {${lin(p, q)}/x − ${r}}`,
        answer: String(m),
        hint: "The denominator is not 0 at the limit point — substitute.",
        steps: [
          `Denominator at x = ${k}: ${k} − ${r} = 1 (not 0), so substitute directly.`,
          `Numerator: ${p}(${k}) ${tail(q)} = ${sx(m)}.`,
          `Limit = ${sx(m)} ÷ 1 = ${sx(m)}.`,
        ],
        concept: "If substitution works, the limit is the quotient's value.",
        verify: () => {
          const f = (x: number) => (p * x + q) / (x - r);
          return close(f(k - 1e-6), m, 1e-4) && close(f(k + 1e-6), m, 1e-4);
        },
      });
    }
    if (stage === 3) {
      const a = rng.int(2, 9);
      return inputQ({
        instruction: "Evaluate the limit.",
        prompt: `lim as x → ${a} of {x^2 − ${a * a}/x − ${a}}`,
        answer: String(2 * a),
        hint: `Substituting gives {0/0} — factor the numerator first.`,
        steps: [
          `x^2 − ${a * a} = (x − ${a})(x + ${a}).`,
          `Cancel x − ${a}: the expression equals x + ${a} for x ≠ ${a}.`,
          `Limit = ${a} + ${a} = ${2 * a}.`,
        ],
        concept: "0/0 limits often hide a common factor to cancel.",
        verify: () => {
          const f = (x: number) => (x * x - a * a) / (x - a);
          return close(f(a - 1e-6), 2 * a, 1e-4) && close(f(a + 1e-6), 2 * a, 1e-4);
        },
      });
    }
    if (stage === 4) {
      const p = rng.int(1, 9);
      const q = rng.int(2, 5);
      const b1 = nz(rng, -5, 5);
      const c1 = nz(rng, -5, 5);
      const b2 = nz(rng, -5, 5);
      const c2 = nz(rng, -5, 5);
      const ans = fracAns(p, q);
      return inputQ({
        instruction: "Evaluate the limit.",
        prompt: `lim as x → ∞ of {${quad(p, b1, c1)}/${quad(q, b2, c2)}}`,
        answer: ans,
        answerFormat: "fraction",
        answerHint: "fraction or integer",
        hint: "Same degree top and bottom — compare leading coefficients.",
        steps: [
          `Divide top and bottom by x^2: lower-order terms vanish as x → ∞.`,
          `Limit = {${p}/${q}}${ans.includes("/") || Number(ans) === p / q ? "" : ""} = ${ans.includes("/") ? `{${ans}}` : ans}.`,
        ],
        concept: "At infinity, only the leading terms matter.",
        verify: () => {
          const f = (x: number) => (p * x * x + b1 * x + c1) / (q * x * x + b2 * x + c2);
          return close(f(1e7), p / q, 1e-4);
        },
      });
    }
    const r = nz(rng, -5, 5);
    let s = nz(rng, -5, 5);
    while (s === r) s = nz(rng, -5, 5);
    const ans = r - s;
    const bq = -(r + s);
    const cq = r * s;
    return inputQ({
      instruction: "Find the value that makes f continuous.",
      prompt: `f(x) = {${quad(1, bq, cq)}/x − ${sx(r)}} for x ≠ ${sx(r)}. What value should f(${sx(r)}) be so that f is continuous at x = ${sx(r)}?`,
      answer: String(ans),
      hint: `Factor the numerator — one factor is (x − ${sx(r)}).`,
      steps: [
        `${quad(1, bq, cq)} = (x − ${sx(r)})(x − ${sx(s)}).`,
        `For x ≠ ${sx(r)}, f(x) = x − ${sx(s)}.`,
        `The limit at x = ${sx(r)} is ${sx(r)} − (${sx(s)}) = ${sx(ans)} — set f(${sx(r)}) to that.`,
      ],
      concept: "Continuity means the value fills in exactly the limit.",
      verify: () => {
        const f = (x: number) => (x * x + bq * x + cq) / (x - r);
        return close(f(r - 1e-6), ans, 1e-4) && close(f(r + 1e-6), ans, 1e-4);
      },
    });
  },
};

/* --------------------------------------------------------------- derivative */
function fmtPowTerm(coef: number, n: number): string {
  const cs = coef === 1 ? "" : coef === -1 ? "−" : sx(coef);
  if (n === 0) return sx(coef);
  if (n === 1) return `${cs}x`;
  return `${cs}x^${n}`;
}

function derivFirstPrinciples(stage: number, rng: Rng): RawQuestion {
  if (stage === 3) {
    // Vary the power and an optional coefficient; the limit still resolves
    // to the power rule.
    const p = rng.pick([2, 3, 4]);
    const k = rng.int(1, 4);
    const kD = k === 1 ? "" : String(k);
    // The derivative of kx^p is (k·p)x^(p−1) — the coefficients MULTIPLY.
    // Gluing the strings together ("2" + "3x^2" = "23x^2") shipped a wrong
    // answer the numeric verify() below could never see, because it checks
    // the power rule against itself rather than the displayed string.
    const answer = fmtPowTerm(k * p, p - 1);
    const expand =
      p === 2
        ? `${kD}(2xh + h^2)`
        : p === 3
        ? `${kD}(3x^2h + 3xh^2 + h^3)`
        : `${kD}(4x^3h + 6x^2h^2 + 4xh^3 + h^4)`;
    const afterDiv =
      p === 2
        ? `${kD}(2x + h)`
        : p === 3
        ? `${kD}(3x^2 + 3xh + h^2)`
        : `${kD}(4x^3 + 6x^2h + 4xh^2 + h^3)`;
    return mcQ({
      instruction: "Evaluate the limit that defines the derivative.",
      prompt: `lim as h → 0 of {${kD}(x + h)^${p} − ${kD}x^${p}/h}`,
      choices: mcChoices(rng, answer, [
        `${kD}x^${p}`,
        `${answer} + h`,
        fmtPowTerm(k * p, p), // right coefficient, forgot to drop the power
        fmtPowTerm(k, p - 1), // dropped the power, forgot to multiply by it
      ]),
      answer,
      hint: `Expand (x + h)^${p} and simplify before letting h → 0.`,
      steps: [
        `${kD}(x + h)^${p} − ${kD}x^${p} = ${expand}.`,
        `Divide by h: ${afterDiv}.`,
        `As h → 0, this approaches ${answer}.`,
      ],
      concept: "First principles reproduce the power rule.",
      verify: () => close(numDeriv((x) => k * x ** p, 1.7), k * p * 1.7 ** (p - 1), 1e-3),
    });
  }
  const a = nz(rng, -5, 6);
  if (stage === 1) {
    return inputQ({
      instruction: "Use the limit definition of the derivative.",
      prompt: `f(x) = x^2. Using first principles, find f′(${sx(a)}).`,
      answer: String(2 * a),
      hint: `Compute lim of {(${sx(a)} + h)^2 − ${a * a}/h} as h → 0.`,
      steps: [
        `(${sx(a)} + h)^2 − ${a * a} = ${sx(2 * a)}h + h^2.`,
        `Divide by h: ${sx(2 * a)} + h.`,
        `As h → 0 the slope approaches ${sx(2 * a)}.`,
      ],
      concept: "The derivative is the limit of difference quotients.",
      verify: () => close(numDeriv((x) => x * x, a), 2 * a),
    });
  }
  if (stage === 2 || stage === 4) {
    const b = stage === 2 ? nz(rng, -6, 6) : 0;
    const c = stage === 4 ? rng.int(2, 5) : 1;
    const ans = 2 * c * a + b;
    const disp = stage === 2 ? quad(1, b, 0) : `${c}x^2`;
    return inputQ({
      instruction: "Use the limit definition of the derivative.",
      prompt: `f(x) = ${disp}. Using first principles, find f′(${sx(a)}).`,
      answer: String(ans),
      hint: "Form the difference quotient, expand, and let h → 0.",
      steps: [
        `f(${sx(a)} + h) − f(${sx(a)}) = ${sx(2 * c * a + b)}h + ${c === 1 ? "" : c}h^2.`,
        `Divide by h: ${sx(ans)} + ${c === 1 ? "" : c}h.`,
        `As h → 0 the slope approaches ${sx(ans)}.`,
      ],
      concept: "First principles reduce to the surviving h-free term.",
      verify: () => close(numDeriv((x) => c * x * x + b * x, a), ans),
    });
  }
  const k = rng.int(1, 3);
  return inputQ({
    instruction: "Use the limit definition of the derivative.",
    prompt: `f(x) = x^3. Using first principles, find f′(${k}).`,
    answer: String(3 * k * k),
    hint: `Expand (${k} + h)^3; keep the terms linear in h.`,
    steps: [
      `(${k} + h)^3 − ${k ** 3} = ${3 * k * k}h + ${3 * k}h^2 + h^3.`,
      `Divide by h: ${3 * k * k} + ${3 * k}h + h^2.`,
      `As h → 0 the slope approaches ${3 * k * k}.`,
    ],
    concept: "Only the h¹ term survives the limit.",
    verify: () => close(numDeriv((x) => x ** 3, k), 3 * k * k),
  });
}

function derivPower(stage: number, rng: Rng): RawQuestion {
  if (stage === 1) {
    const n = rng.int(2, 5);
    const ans = fmtPowTerm(n, n - 1);
    return mcQ({
      instruction: "Differentiate.",
      prompt: `f(x) = x^${n}. Find f′(x).`,
      choices: mcChoices(rng, ans, [
        fmtPowTerm(1, n - 1),
        fmtPowTerm(n, n),
        fmtPowTerm(n - 1, n - 2),
      ]),
      answer: ans,
      hint: "Power rule: bring the exponent down, then reduce it by 1.",
      steps: [
        `Power rule: {d/dx} x^n = n x^{n − 1}.`,
        `f′(x) = ${n}x^{${n} − 1} = ${ans}.`,
      ],
      concept: "The exponent multiplies down and drops by one.",
      verify: () => close(numDeriv((x) => x ** n, 2), n * 2 ** (n - 1)),
    });
  }
  if (stage === 2) {
    const a = rng.int(2, 6);
    const n = rng.int(2, 4);
    const ans = fmtPowTerm(a * n, n - 1);
    return mcQ({
      instruction: "Differentiate.",
      prompt: `f(x) = ${a}x^${n}. Find f′(x).`,
      choices: mcChoices(rng, ans, [
        fmtPowTerm(a, n - 1),
        fmtPowTerm(a * n, n),
        fmtPowTerm(a + n, n - 1),
      ]),
      answer: ans,
      hint: `The coefficient ${a} rides along: multiply it by the exponent.`,
      steps: [
        `{d/dx} ${a}x^${n} = ${a} × ${n} x^{${n} − 1}.`,
        `= ${ans}.`,
      ],
      concept: "Constants multiply through the power rule.",
      verify: () => close(numDeriv((x) => a * x ** n, 2), a * n * 2 ** (n - 1)),
    });
  }
  if (stage === 3) {
    const a = rng.int(2, 5);
    const b = nz(rng, -9, 9);
    const c = nz(rng, -9, 9);
    const ans = `${2 * a}x ${tail(b)}`;
    return mcQ({
      instruction: "Differentiate.",
      prompt: `f(x) = ${quad(a, b, c)}. Find f′(x).`,
      choices: mcChoices(rng, ans, [
        `${a}x ${tail(b)}`,
        `${2 * a}x ${tail(b)} ${tail(c)}`,
        `${2 * a}x ${tail(c)}`,
      ]),
      answer: ans,
      hint: "Differentiate term by term; constants vanish.",
      steps: [
        `{d/dx} ${a}x^2 = ${2 * a}x.`,
        `{d/dx} of the x-term is ${sx(b)}; the constant ${sx(c)} differentiates to 0.`,
        `f′(x) = ${ans}.`,
      ],
      concept: "Derivatives work term by term, killing constants.",
      verify: () => close(numDeriv((x) => a * x * x + b * x + c, 3), 2 * a * 3 + b),
    });
  }
  if (stage === 4) {
    const a = rng.int(1, 4);
    const b = nz(rng, -6, 6);
    const c = nz(rng, -9, 9);
    const k = nz(rng, -4, 4);
    const ans = 2 * a * k + b;
    return inputQ({
      instruction: "Evaluate the derivative.",
      prompt: `f(x) = ${quad(a, b, c)}. Find f′(${sx(k)}).`,
      answer: String(ans),
      hint: `First find f′(x) with the power rule, then substitute ${sx(k)}.`,
      steps: [
        `f′(x) = ${2 * a}x ${tail(b)}.`,
        `f′(${sx(k)}) = ${2 * a}(${sx(k)}) ${tail(b)} = ${sx(ans)}.`,
      ],
      concept: "f′(k) is the slope of the curve at x = k.",
      verify: () => close(numDeriv((x) => a * x * x + b * x + c, k), ans),
    });
  }
  const a = rng.int(1, 3);
  const b = rng.int(1, 4);
  const c = nz(rng, -9, 9);
  const k = nz(rng, -3, 3);
  const ans = 3 * a * k * k + 2 * b * k + c;
  return inputQ({
    instruction: "Evaluate the derivative.",
    prompt: `f(x) = ${a === 1 ? "" : a}x^3 + ${b === 1 ? "" : b}x^2 ${tail(c)}x. Find f′(${sx(k)}).`,
    answer: String(ans),
    hint: "Apply the power rule to each of the three terms.",
    steps: [
      `f′(x) = ${3 * a}x^2 + ${2 * b}x ${tail(c)}.`,
      `f′(${sx(k)}) = ${3 * a}(${k * k}) + ${2 * b}(${sx(k)}) ${tail(c)} = ${sx(ans)}.`,
    ],
    concept: "Each term contributes its own power-rule derivative.",
    verify: () => close(numDeriv((x) => a * x ** 3 + b * x * x + c * x, k), ans),
  });
}

function derivRules(stage: number, rng: Rng): RawQuestion {
  if (stage === 1 || stage === 2) {
    const a = nz(rng, -5, 5);
    const b = nz(rng, -5, 5);
    const k = nz(rng, -3, 3);
    const ans = 2 * k + a + b;
    return inputQ({
      instruction: "Differentiate the product, then evaluate.",
      prompt: `f(x) = (x ${tail(a)})(x ${tail(b)}). Find f′(${sx(k)}).`,
      answer: String(ans),
      hint: "Use the product rule: u′v + uv′ (or expand first).",
      steps: [
        `Product rule: f′ = (1)(x ${tail(b)}) + (x ${tail(a)})(1).`,
        `= 2x ${tail(a + b)}.`,
        `f′(${sx(k)}) = 2(${sx(k)}) ${tail(a + b)} = ${sx(ans)}.`,
      ],
      concept: "The product rule sums each factor times the other's derivative.",
      verify: () => close(numDeriv((x) => (x + a) * (x + b), k), ans),
    });
  }
  if (stage === 3) {
    const a = rng.int(2, 6);
    const c = nz(rng, -4, 4);
    let b = nz(rng, -6, 6);
    while (a * c - b === 0) b = nz(rng, -6, 6);
    let k = nz(rng, -4, 4);
    while (k + c === 0 || Math.abs(k + c) > 3) k = rng.int(-4, 4) || 1;
    const den = (k + c) ** 2;
    const ans = fracAns(a * c - b, den);
    return inputQ({
      instruction: "Differentiate the quotient, then evaluate.",
      prompt: `f(x) = {${lin(a, b)}/x ${tail(c)}}. Find f′(${sx(k)}).`,
      answer: ans,
      answerFormat: "fraction",
      answerHint: "fraction or integer",
      hint: "Quotient rule: (u′v − uv′)/v².",
      steps: [
        `f′(x) = {${a}(x ${tail(c)}) − (${lin(a, b)})/(x ${tail(c)})^2}.`,
        `The numerator simplifies to the constant ${sx(a * c - b)}.`,
        `f′(${sx(k)}) = {${sx(a * c - b)}/${den}}${ans.includes("/") ? "" : ` = ${ans}`}.`,
      ],
      concept: "For linear over linear, the quotient rule leaves a constant numerator.",
      verify: () => {
        const f = (x: number) => (a * x + b) / (x + c);
        const parts = ans.split("/").map(Number);
        const v = parts.length === 2 ? parts[0] / parts[1] : parts[0];
        return close(numDeriv(f, k), v, 1e-4);
      },
    });
  }
  if (stage === 4) {
    const a = rng.int(2, 9);
    const ans = `−{${a}/x^2}`;
    return mcQ({
      instruction: "Differentiate.",
      prompt: `f(x) = {${a}/x}. Find f′(x).`,
      choices: mcChoices(rng, ans, [
        `{${a}/x^2}`,
        `−{${a}/x}`,
        `${a} ln x`,
      ]),
      answer: ans,
      hint: `Rewrite as ${a}x^{−1} and use the power rule.`,
      steps: [
        `f(x) = ${a}x^{−1}.`,
        `f′(x) = ${a} × (−1) x^{−2} = −{${a}/x^2}.`,
      ],
      concept: "Negative exponents obey the same power rule.",
      verify: () => close(numDeriv((x) => a / x, 2), -a / 4, 1e-4),
    });
  }
  const a = nz(rng, -5, 5);
  const b = nz(rng, -4, 4);
  const k = nz(rng, -3, 3);
  const ans = 3 * k * k + 2 * b * k + a;
  return inputQ({
    instruction: "Differentiate the product, then evaluate.",
    prompt: `f(x) = (x^2 ${tail(a)})(x ${tail(b)}). Find f′(${sx(k)}).`,
    answer: String(ans),
    hint: "Product rule: (2x)(x + b) + (x² + a)(1).",
    steps: [
      `f′ = 2x(x ${tail(b)}) + (x^2 ${tail(a)}).`,
      `= 3x^2 ${tail(2 * b)}x ${tail(a)}.`,
      `f′(${sx(k)}) = ${3 * k * k} ${tail(2 * b * k)} ${tail(a)} = ${sx(ans)}.`,
    ],
    concept: "The product rule expands into a clean polynomial derivative.",
    verify: () => close(numDeriv((x) => (x * x + a) * (x + b), k), ans),
  });
}

function derivChain(stage: number, rng: Rng): RawQuestion {
  if (stage === 1) {
    const a = rng.int(1, 6);
    const n = rng.int(2, 4);
    const ans = `${n}(x + ${a})^${n - 1}`;
    return mcQ({
      instruction: "Differentiate.",
      prompt: `f(x) = (x + ${a})^${n}. Find f′(x).`,
      choices: mcChoices(rng, ans, [
        `(x + ${a})^${n - 1}`,
        `${n}(x + ${a})^${n}`,
        `${n}x^${n - 1}`,
      ]),
      answer: ans,
      hint: "Chain rule: derivative of the outside times derivative of the inside (which is 1 here).",
      steps: [
        `Outer: u^${n} → ${n}u^${n - 1} with u = x + ${a}.`,
        `Inner derivative: {d/dx}(x + ${a}) = 1.`,
        `f′(x) = ${n}(x + ${a})^${n - 1} × 1 = ${ans}.`,
      ],
      concept: "The chain rule multiplies outer and inner derivatives.",
      verify: () => close(numDeriv((x) => (x + a) ** n, 1), n * (1 + a) ** (n - 1), 1e-3),
    });
  }
  if (stage === 2) {
    const a = rng.int(2, 5);
    const b = nz(rng, -6, 6);
    const ans = `${2 * a}(${lin(a, b)})`;
    return mcQ({
      instruction: "Differentiate.",
      prompt: `f(x) = (${lin(a, b)})^2. Find f′(x).`,
      choices: mcChoices(rng, ans, [
        `2(${lin(a, b)})`,
        `${a}(${lin(a, b)})`,
        `${2 * a}x ${tail(b)}`,
      ]),
      answer: ans,
      hint: `The inside ${lin(a, b)} has derivative ${a} — don't forget to multiply by it.`,
      steps: [
        `Outer: u^2 → 2u with u = ${lin(a, b)}.`,
        `Inner derivative: ${a}.`,
        `f′(x) = 2(${lin(a, b)}) × ${a} = ${ans}.`,
      ],
      concept: "Forgetting the inner derivative is the classic chain-rule error.",
      verify: () => close(numDeriv((x) => (a * x + b) ** 2, 2), 2 * a * (a * 2 + b), 1e-3),
    });
  }
  if (stage === 3) {
    const a = rng.int(2, 4);
    const b = nz(rng, -5, 5);
    const k = nz(rng, -3, 3);
    const ans = 2 * a * (a * k + b);
    return inputQ({
      instruction: "Differentiate, then evaluate.",
      prompt: `f(x) = (${lin(a, b)})^2. Find f′(${sx(k)}).`,
      answer: String(ans),
      hint: `f′(x) = 2(${lin(a, b)}) × ${a} by the chain rule.`,
      steps: [
        `f′(x) = ${2 * a}(${lin(a, b)}).`,
        `At x = ${sx(k)}: inside = ${sx(a * k + b)}.`,
        `f′(${sx(k)}) = ${2 * a} × ${sx(a * k + b)} = ${sx(ans)}.`,
      ],
      concept: "Evaluate the inside before multiplying through.",
      verify: () => close(numDeriv((x) => (a * x + b) ** 2, k), ans, 1e-3),
    });
  }
  if (stage === 4) {
    const a = rng.int(1, 6);
    const ans = `4x(x^2 + ${a})`;
    return mcQ({
      instruction: "Differentiate.",
      prompt: `f(x) = (x^2 + ${a})^2. Find f′(x).`,
      choices: mcChoices(rng, ans, [
        `2(x^2 + ${a})`,
        `2x(x^2 + ${a})`,
        `4x^3`,
      ]),
      answer: ans,
      hint: "Outer derivative 2u times inner derivative 2x.",
      steps: [
        `Outer: u^2 → 2u with u = x^2 + ${a}.`,
        `Inner derivative: 2x.`,
        `f′(x) = 2(x^2 + ${a}) × 2x = ${ans}.`,
      ],
      concept: "Both layers of the chain contribute a factor.",
      verify: () => close(numDeriv((x) => (x * x + a) ** 2, 2), 4 * 2 * (4 + a), 1e-2),
    });
  }
  const a = rng.int(1, 5);
  const k = nz(rng, -2, 2);
  const ans = 4 * k * (k * k + a);
  return inputQ({
    instruction: "Differentiate, then evaluate.",
    prompt: `f(x) = (x^2 + ${a})^2. Find f′(${sx(k)}).`,
    answer: String(ans),
    hint: "Chain rule gives f′(x) = 4x(x² + a).",
    steps: [
      `f′(x) = 2(x^2 + ${a}) × 2x = 4x(x^2 + ${a}).`,
      `f′(${sx(k)}) = 4(${sx(k)})(${k * k} + ${a}) = ${sx(ans)}.`,
    ],
    concept: "Chain rule results still evaluate like any formula.",
    verify: () => close(numDeriv((x) => (x * x + a) ** 2, k), ans, 1e-2),
  });
}

function derivExpLog(stage: number, rng: Rng): RawQuestion {
  if (stage === 1) {
    const c = rng.int(1, 6);
    const cD = c === 1 ? "" : String(c);
    const ans = `${cD}e^x`;
    return mcQ({
      instruction: "Differentiate.",
      prompt: `f(x) = ${cD}e^x. Find f′(x).`,
      choices: mcChoices(rng, ans, [`${cD}e^{x − 1}`, `${cD}x e^x`, `${c + 1}e^x`]),
      answer: ans,
      hint: "The exponential is its own derivative, and constants stay put.",
      steps: [
        `The exponential e^x has slope equal to its own value everywhere.`,
        `A constant multiplier carries straight through.`,
        `f′(x) = ${cD}e^x.`,
      ],
      concept: "eˣ is the unique function equal to its own derivative.",
      verify: () => close(numDeriv((x) => c * Math.exp(x), 0.4), c * Math.exp(0.4), 1e-2),
    });
  }
  if (stage === 2) {
    const k = rng.int(2, 6);
    const ans = `${k}e^{${k}x}`;
    return mcQ({
      instruction: "Differentiate.",
      prompt: `f(x) = e^{${k}x}. Find f′(x).`,
      choices: mcChoices(rng, ans, [`e^{${k}x}`, `${k}x e^{${k}x}`, `e^{${k}}`]),
      answer: ans,
      hint: `Chain rule: the inner derivative of ${k}x is ${k}.`,
      steps: [
        `Outer: e^u → e^u with u = ${k}x.`,
        `Inner derivative: ${k}.`,
        `f′(x) = ${k}e^{${k}x}.`,
      ],
      concept: "e to a linear power pulls the coefficient out front.",
      verify: () => close(numDeriv((x) => Math.exp(k * x), 0.3), k * Math.exp(k * 0.3), 1e-2),
    });
  }
  if (stage === 3) {
    const c = rng.int(1, 6);
    const cD = c === 1 ? "" : String(c);
    const ans = `{${c}/x}`;
    return mcQ({
      instruction: "Differentiate.",
      prompt: `f(x) = ${cD}ln x. Find f′(x).`,
      choices: mcChoices(rng, ans, [`${cD}ln x`, `${c}x`, `−{${c}/x^2}`, `{${c + 1}/x}`]),
      answer: ans,
      hint: "The natural log has a famous reciprocal derivative.",
      steps: [
        `{d/dx} ln x = {1/x} for x > 0.`,
        `The constant multiplier stays, giving {${c}/x}.`,
      ],
      concept: "ln x grows at the rate 1/x.",
      verify: () => close(numDeriv((x) => c * Math.log(x), 2), c / 2, 1e-4),
    });
  }
  if (stage === 4) {
    const k = rng.int(2, 9);
    const ans = "{1/x}";
    return mcQ({
      instruction: "Differentiate.",
      prompt: `f(x) = ln(${k}x). Find f′(x).`,
      choices: mcChoices(rng, ans, [`{${k}/x}`, `{1/${k}x}`, `ln ${k}`]),
      answer: ans,
      hint: `ln(${k}x) = ln ${k} + ln x — the constant differentiates away.`,
      steps: [
        `ln(${k}x) = ln ${k} + ln x.`,
        `The constant ln ${k} has derivative 0.`,
        `f′(x) = {1/x} — the ${k} cancels out.`,
      ],
      concept: "Inner constant multiples cancel in log derivatives.",
      verify: () => close(numDeriv((x) => Math.log(k * x), 2), 0.5, 1e-4),
    });
  }
  if (rng.chance(0.5)) {
    const a = rng.int(2, 9);
    return inputQ({
      instruction: "Evaluate the derivative.",
      prompt: `f(x) = ln x. Find f′(${a}).`,
      answer: fracAns(1, a),
      answerFormat: "fraction",
      answerHint: "e.g. 1/4",
      hint: `f′(x) = {1/x}.`,
      steps: [
        `f′(x) = {1/x}.`,
        `f′(${a}) = {1/${a}}.`,
      ],
      concept: "The log's slope shrinks as x grows.",
      verify: () => close(numDeriv(Math.log, a), 1 / a, 1e-4),
    });
  }
  const k = rng.int(2, 5);
  return inputQ({
    instruction: "Evaluate the derivative.",
    prompt: `f(x) = e^{${k}x}. Find f′(0).`,
    answer: String(k),
    hint: `f′(x) = ${k}e^{${k}x}, and e^0 = 1.`,
    steps: [
      `f′(x) = ${k}e^{${k}x}.`,
      `f′(0) = ${k} × e^0 = ${k} × 1 = ${k}.`,
    ],
    concept: "At 0 the exponential factor collapses to 1.",
    verify: () => close(numDeriv((x) => Math.exp(k * x), 0), k, 1e-3),
  });
}

function derivTrig(stage: number, rng: Rng): RawQuestion {
  if (stage === 1) {
    const c = rng.int(1, 6);
    const cD = c === 1 ? "" : `${c} `;
    const ans = `${cD}cos x`;
    return mcQ({
      instruction: "Differentiate.",
      prompt: `f(x) = ${cD}sin x. Find f′(x).`,
      choices: mcChoices(rng, ans, [`−${cD}cos x`, `−${cD}sin x`, `${cD}tan x`, `${c + 1} cos x`]),
      answer: ans,
      hint: "The slope of sine at 0 is positive — which option matches that?",
      steps: [
        `{d/dx} sin x = cos x.`,
        `The constant multiplier carries through, giving ${cD}cos x.`,
      ],
      concept: "sin differentiates to cos, with no sign change.",
      verify: () => close(numDeriv((x) => c * Math.sin(x), 0.7), c * Math.cos(0.7), 1e-4),
    });
  }
  if (stage === 2) {
    const c = rng.int(1, 6);
    const cD = c === 1 ? "" : `${c} `;
    const ans = `−${cD}sin x`;
    return mcQ({
      instruction: "Differentiate.",
      prompt: `f(x) = ${cD}cos x. Find f′(x).`,
      choices: mcChoices(rng, ans, [`${cD}sin x`, `−${cD}cos x`, `${cD}sec x`, `−${c + 1} sin x`]),
      answer: ans,
      hint: "Cosine starts at a maximum — its slope turns negative.",
      steps: [
        `{d/dx} cos x = −sin x.`,
        `The constant multiplier carries through, giving −${cD}sin x.`,
      ],
      concept: "cos differentiates to −sin — the sign flips here.",
      verify: () => close(numDeriv((x) => c * Math.cos(x), 0.7), -c * Math.sin(0.7), 1e-4),
    });
  }
  if (stage === 3) {
    const k = rng.int(2, 6);
    const ans = `${k} cos(${k}x)`;
    return mcQ({
      instruction: "Differentiate.",
      prompt: `f(x) = sin(${k}x). Find f′(x).`,
      choices: mcChoices(rng, ans, [`cos(${k}x)`, `−${k} cos(${k}x)`, `${k} sin(${k}x)`]),
      answer: ans,
      hint: `Chain rule: multiply by the inner derivative ${k}.`,
      steps: [
        `Outer: sin u → cos u with u = ${k}x.`,
        `Inner derivative: ${k}.`,
        `f′(x) = ${k} cos(${k}x).`,
      ],
      concept: "Compressed waves oscillate faster, scaling the slope.",
      verify: () => close(numDeriv((x) => Math.sin(k * x), 0.3), k * Math.cos(k * 0.3), 1e-3),
    });
  }
  if (stage === 4) {
    const useSin = rng.chance(0.5);
    const c = rng.int(1, 6);
    const cD = c === 1 ? "" : `${c} `;
    // Evaluate at an angle whose sine and cosine are exact integers.
    const at = rng.pick([
      { disp: "0", sin: 0, cos: 1 },
      { disp: "π", sin: 0, cos: -1 },
      { disp: "{π/2}", sin: 1, cos: 0 },
      { disp: "{3π/2}", sin: -1, cos: 0 },
    ]);
    const value = useSin ? c * at.cos : -c * at.sin;
    return inputQ({
      instruction: "Evaluate the derivative at the point.",
      prompt: `f(x) = ${cD}${useSin ? "sin" : "cos"} x. Find f′(${at.disp}).`,
      answer: String(value),
      hint: useSin ? `f′(x) = ${cD}cos x.` : `f′(x) = −${cD}sin x.`,
      steps: useSin
        ? [`f′(x) = ${cD}cos x.`, `At x = ${at.disp}, cos is ${at.cos}, so f′ = ${value}.`]
        : [`f′(x) = −${cD}sin x.`, `At x = ${at.disp}, sin is ${at.sin}, so f′ = ${value}.`],
      concept: "A derivative evaluated at a point gives the slope right there.",
      verify: () => {
        const x = at.disp === "0" ? 0 : at.disp === "π" ? Math.PI : at.disp === "{π/2}" ? Math.PI / 2 : (3 * Math.PI) / 2;
        return close(numDeriv((t) => c * (useSin ? Math.sin(t) : Math.cos(t)), x), value, 1e-3);
      },
    });
  }
  const c = rng.int(1, 6);
  const cD = c === 1 ? "" : `${c} `;
  const ans = `${cD}sec^2 x`;
  return mcQ({
    instruction: "Differentiate.",
    prompt: `f(x) = ${cD}tan x. Find f′(x).`,
    choices: mcChoices(rng, ans, [
      `${cD}sec x tan x`,
      `−${cD}sec^2 x`,
      `${cD}cot x`,
      `${c + 1} sec^2 x`,
    ]),
    answer: ans,
    hint: "Apply the quotient rule to sin x / cos x.",
    steps: [
      `tan x = {sin x/cos x}.`,
      `Quotient rule: {cos^2 x + sin^2 x/cos^2 x} = {1/cos^2 x}.`,
      `f′(x) = ${cD}sec^2 x.`,
    ],
    concept: "tan differentiates to sec², via the Pythagorean identity.",
    verify: () => close(numDeriv((x) => c * Math.tan(x), 0.5), c / Math.cos(0.5) ** 2, 1e-3),
  });
}

const derivative: GeneratorFamily = {
  stageLabel(skill: SkillRef, st: number) {
    const kind = str(skill.params, "kind", "mixed");
    const labels: Record<string, string[]> = {
      "first-principles": ["Slope of x²", "Add a linear term", "The defining limit", "With coefficients", "Slope of x³"],
      power: ["Single powers", "With coefficients", "Full polynomials", "Evaluate the slope", "Cubics"],
      rules: ["Simple products", "Products again", "Quotients", "Reciprocal powers", "Bigger products"],
      chain: ["Shifted powers", "Linear insides", "Evaluate", "Quadratic insides", "Evaluate again"],
      "exp-log": ["The exponential", "Scaled exponents", "The natural log", "Logs of multiples", "Evaluate slopes"],
      trig: ["Sine", "Cosine", "Chain with sine", "Slopes at zero", "Tangent"],
    };
    return (labels[kind] ?? labels.power)[st - 1];
  },
  generate(skill, stage, rng): RawQuestion {
    let kind = str(skill.params, "kind", "mixed");
    if (kind === "mixed") kind = rng.pick(["power", "rules", "chain"]);
    if (kind === "first-principles") return derivFirstPrinciples(stage, rng);
    if (kind === "rules") return derivRules(stage, rng);
    if (kind === "chain") return derivChain(stage, rng);
    if (kind === "exp-log") return derivExpLog(stage, rng);
    if (kind === "trig") return derivTrig(stage, rng);
    return derivPower(stage, rng);
  },
};

/* ---------------------------------------------------------- derivative-apps */
function appsIncreasing(stage: number, rng: Rng): RawQuestion {
  const a = rng.int(1, 5);
  if (stage === 1 || stage === 4) {
    const cubic = stage === 4;
    const aa = cubic ? rng.int(1, 3) : a;
    let k = nz(rng, -6, 6);
    while ((cubic ? Math.abs(k) === aa : k === a)) k = nz(rng, -6, 6);
    const slope = cubic ? 3 * k * k - 3 * aa * aa : 2 * k - 2 * a;
    const ans = slope > 0 ? "Increasing" : "Decreasing";
    const fDisp = cubic ? `x^3 − ${3 * aa * aa}x` : `x^2 − ${2 * a}x`;
    return mcQ({
      instruction: "Use the derivative's sign.",
      prompt: `f(x) = ${fDisp}. Is f increasing or decreasing at x = ${sx(k)}?`,
      choices: mcChoices(rng, ans, [slope > 0 ? "Decreasing" : "Increasing", "Neither — it is constant"]),
      answer: ans,
      hint: `Compute f′(${sx(k)}) and check its sign.`,
      steps: [
        `f′(x) = ${cubic ? `3x^2 − ${3 * aa * aa}` : `2x − ${2 * a}`}.`,
        `f′(${sx(k)}) = ${sx(slope)}, which is ${slope > 0 ? "positive" : "negative"}.`,
        `So f is ${ans.toLowerCase()} at x = ${sx(k)}.`,
      ],
      concept: "Positive derivative means rising; negative means falling.",
      verify: () => {
        const f = cubic ? (x: number) => x ** 3 - 3 * aa * aa * x : (x: number) => x * x - 2 * a * x;
        return (numDeriv(f, k) > 0) === (slope > 0);
      },
    });
  }
  if (stage === 2) {
    return inputQ({
      instruction: "Find where the derivative is zero.",
      prompt: `f(x) = x^2 − ${2 * a}x. For what value of x is f′(x) = 0?`,
      answer: String(a),
      hint: `f′(x) = 2x − ${2 * a}.`,
      steps: [
        `f′(x) = 2x − ${2 * a}.`,
        `2x − ${2 * a} = 0 gives x = ${a}.`,
      ],
      concept: "The derivative is zero where the curve flattens.",
      verify: () => close(numDeriv((x) => x * x - 2 * a * x, a), 0, 1e-4),
    });
  }
  if (stage === 3) {
    const ans = `x > ${a}`;
    return mcQ({
      instruction: "Find the increasing interval.",
      prompt: `f(x) = x^2 − ${2 * a}x. For which x is f increasing?`,
      choices: mcChoices(rng, ans, [`x < ${a}`, "All x", `x > −${a}`]),
      answer: ans,
      hint: `f is increasing where f′(x) = 2x − ${2 * a} is positive.`,
      steps: [
        `f′(x) = 2x − ${2 * a}.`,
        `2x − ${2 * a} > 0 gives x > ${a}.`,
      ],
      concept: "Solve f′ > 0 to find the rising interval.",
      verify: () => numDeriv((x) => x * x - 2 * a * x, a + 1) > 0 && numDeriv((x) => x * x - 2 * a * x, a - 1) < 0,
    });
  }
  const b = nz(rng, -6, 6);
  const k = nz(rng, -4, 4);
  const slope = 2 * k + b;
  return inputQ({
    instruction: "Find the slope, then interpret it.",
    prompt: `f(x) = x^2 ${tail(b)}x. Find f′(${sx(k)}). (A positive answer means f is increasing there.)`,
    answer: String(slope),
    hint: `f′(x) = 2x ${tail(b)}.`,
    steps: [
      `f′(x) = 2x ${tail(b)}.`,
      `f′(${sx(k)}) = ${sx(2 * k)} ${tail(b)} = ${sx(slope)}.`,
      `f is ${slope > 0 ? "increasing" : slope < 0 ? "decreasing" : "flat"} at x = ${sx(k)}.`,
    ],
    concept: "The derivative's value is the local rate of change.",
    verify: () => close(numDeriv((x) => x * x + b * x, k), slope),
  });
}

function appsCritical(stage: number, rng: Rng): RawQuestion {
  const b = rng.int(1, 6);
  const c = nz(rng, -9, 9);
  if (stage === 1) {
    return inputQ({
      instruction: "Find the critical point.",
      prompt: `f(x) = x^2 − ${2 * b}x ${tail(c)}. At what x is the critical point (where f′(x) = 0)?`,
      answer: String(b),
      hint: `Set the derivative 2x − ${2 * b} to 0.`,
      steps: [
        `f′(x) = 2x − ${2 * b}.`,
        `2x − ${2 * b} = 0 gives x = ${b}.`,
      ],
      concept: "Critical points are where the derivative vanishes.",
      verify: () => close(numDeriv((x) => x * x - 2 * b * x + c, b), 0, 1e-4),
    });
  }
  if (stage === 2) {
    const minV = c - b * b;
    return inputQ({
      instruction: "Find the minimum value.",
      prompt: `f(x) = x^2 − ${2 * b}x ${tail(c)}. What is the minimum value of f?`,
      answer: String(minV),
      hint: `The minimum sits at the critical point x = ${b}.`,
      steps: [
        `f′(x) = 2x − ${2 * b} = 0 at x = ${b}.`,
        `f(${b}) = ${b * b} − ${2 * b * b} ${tail(c)} = ${sx(minV)}.`,
      ],
      concept: "Extreme values happen at critical points.",
      verify: () => {
        const f = (x: number) => x * x - 2 * b * x + c;
        return f(b) === minV && f(b + 1) > minV && f(b - 1) > minV;
      },
    });
  }
  if (stage === 3) {
    const up = rng.chance(0.5);
    const ans = up ? "Minimum" : "Maximum";
    return mcQ({
      instruction: "Classify the critical point.",
      prompt: `f(x) = ${up ? "" : "−"}x^2 ${up ? "−" : "+"} ${2 * b}x ${tail(c)} has a critical point at x = ${up ? b : b}. Is it a maximum or a minimum?`,
      choices: mcChoices(rng, ans, [up ? "Maximum" : "Minimum", "Neither"]),
      answer: ans,
      hint: `Look at the x² coefficient: does the parabola open up or down?`,
      steps: [
        `The x^2 coefficient is ${up ? "positive" : "negative"}, so the parabola opens ${up ? "upward" : "downward"}.`,
        `An ${up ? "upward" : "downward"} parabola has a ${ans.toLowerCase()} at its critical point.`,
      ],
      concept: "Concavity decides max versus min.",
      verify: () => {
        const f = (x: number) => (up ? 1 : -1) * x * x + (up ? -2 * b : 2 * b) * x + c;
        return up ? f(b) < f(b + 1) : f(b) > f(b + 1);
      },
    });
  }
  const a = rng.int(1, 3);
  if (stage === 4) {
    return inputQ({
      instruction: "Find the positive critical point.",
      prompt: `f(x) = x^3 − ${3 * a * a}x. Find the positive value of x where f′(x) = 0.`,
      answer: String(a),
      hint: `f′(x) = 3x^2 − ${3 * a * a}.`,
      steps: [
        `f′(x) = 3x^2 − ${3 * a * a}.`,
        `3x^2 = ${3 * a * a} gives x^2 = ${a * a}, so x = ±${a}.`,
        `The positive critical point is x = ${a}.`,
      ],
      concept: "Cubics can have two critical points, one of each sign.",
      verify: () => close(numDeriv((x) => x ** 3 - 3 * a * a * x, a), 0, 1e-3),
    });
  }
  const maxV = 2 * a ** 3;
  return inputQ({
    instruction: "Find the local maximum value.",
    prompt: `f(x) = x^3 − ${3 * a * a}x. Find the local maximum value of f (its value at the critical point x = −${a}).`,
    answer: String(maxV),
    hint: `Evaluate f(−${a}).`,
    steps: [
      `f(−${a}) = (−${a})^3 − ${3 * a * a}(−${a}).`,
      `= −${a ** 3} + ${3 * a ** 3} = ${maxV}.`,
    ],
    concept: "Evaluate f, not f′, to get the extreme VALUE.",
    verify: () => {
      const f = (x: number) => x ** 3 - 3 * a * a * x;
      return f(-a) === maxV && f(-a) > f(-a + 0.5) && f(-a) > f(-a - 0.5);
    },
  });
}

function appsOptimize(stage: number, rng: Rng, params: Record<string, unknown>): RawQuestion {
  // Only the geometry problems take a regional unit. The projectile-height
  // questions stay metric everywhere: their −5t² is half of g in m/s², so the
  // unit is part of the physics, not a label.
  const B = bigLenU(params);
  if (stage === 1) {
    const half = rng.int(3, 12);
    const s = 2 * half;
    return inputQ({
      instruction: "Optimize.",
      prompt: `Two numbers add to ${s}. What is the largest possible value of their product?`,
      answer: String(half * half),
      hint: "Balanced numbers multiply biggest — check the middle.",
      steps: [
        `Let the numbers be x and ${s} − x; product P = x(${s} − x).`,
        `P′ = ${s} − 2x = 0 gives x = ${half}.`,
        `Maximum product: ${half} × ${half} = ${half * half}.`,
      ],
      concept: "A fixed sum is split evenly for the maximum product.",
      verify: () => {
        const P = (x: number) => x * (s - x);
        return P(half) === half * half && P(half + 1) < P(half) && P(half - 1) < P(half);
      },
    });
  }
  if (stage === 2) {
    const q = rng.int(3, 10);
    const p = 4 * q;
    return inputQ({
      instruction: "Optimize.",
      prompt: `A rectangle has perimeter ${p} ${B}. What is the largest area it can enclose, in square ${unitLong(B)}?`,
      answer: String(q * q),
      hint: "Among rectangles with a fixed perimeter, one shape wins.",
      steps: [
        `Width x gives length {${p}/2} − x = ${p / 2} − x; area A = x(${p / 2} − x).`,
        `A′ = ${p / 2} − 2x = 0 gives x = ${q} — a square.`,
        `Maximum area: ${q} × ${q} = ${q * q} ${B}².`,
      ],
      concept: "The square maximizes area for a given perimeter.",
      verify: () => {
        const A = (x: number) => x * (p / 2 - x);
        return A(q) === q * q && A(q + 1) < A(q);
      },
    });
  }
  if (stage === 3) {
    const half = rng.int(2, 6);
    const bb = 2 * half;
    return inputQ({
      instruction: "Optimize.",
      prompt: `A ball's height is h(t) = −t^2 + ${bb}t metres after t seconds. At what time t is the height greatest?`,
      answer: String(half),
      hint: `Set h′(t) = −2t + ${bb} to zero.`,
      steps: [
        `h′(t) = −2t + ${bb}.`,
        `−2t + ${bb} = 0 gives t = ${half}.`,
      ],
      concept: "Peaks happen where the rate of change hits zero.",
      verify: () => {
        const h = (t: number) => -t * t + bb * t;
        return h(half) > h(half + 0.5) && h(half) > h(half - 0.5);
      },
    });
  }
  if (stage === 4) {
    const tPeak = rng.int(1, 4);
    const bb = 10 * tPeak;
    const c = rng.int(1, 20);
    const hMax = c + 5 * tPeak * tPeak;
    return inputQ({
      instruction: "Optimize.",
      prompt: `A projectile's height is h(t) = −5t^2 + ${bb}t + ${c} metres. What is its maximum height, in metres?`,
      answer: String(hMax),
      hint: `First find the time from h′(t) = −10t + ${bb} = 0.`,
      steps: [
        `h′(t) = −10t + ${bb} = 0 gives t = ${tPeak}.`,
        `h(${tPeak}) = −5(${tPeak * tPeak}) + ${bb * tPeak} + ${c} = ${hMax}.`,
      ],
      concept: "Optimize in two steps: find the time, then the value.",
      verify: () => {
        const h = (t: number) => -5 * t * t + bb * t + c;
        return h(tPeak) === hMax && h(tPeak + 0.5) < hMax && h(tPeak - 0.5) < hMax;
      },
    });
  }
  const m = rng.int(2, 6);
  const fTotal = 4 * m;
  const area = 2 * m * m;
  return inputQ({
    instruction: "Optimize.",
    prompt: `A farmer has ${fTotal} ${B} of fence for a rectangular pen against a wall (the wall forms one long side, so fencing covers two widths and one length). What is the largest possible area, in square ${unitLong(B)}?`,
    answer: String(area),
    hint: "Let width be x; then length = total − 2x. Maximize x(total − 2x).",
    steps: [
      `Width x gives length ${fTotal} − 2x; area A = x(${fTotal} − 2x).`,
      `A′ = ${fTotal} − 4x = 0 gives x = ${m}.`,
      `A = ${m} × ${fTotal - 2 * m} = ${area} ${B}².`,
    ],
    concept: "Optimization with a wall splits fencing unevenly on purpose.",
    verify: () => {
      const A = (x: number) => x * (fTotal - 2 * x);
      return A(m) === area && A(m + 0.5) < area && A(m - 0.5) < area;
    },
  });
}

const derivativeApps: GeneratorFamily = {
  stageLabel(skill: SkillRef, st: number) {
    const kind = str(skill.params, "kind", "critical");
    const labels: Record<string, string[]> = {
      increasing: ["Rising or falling?", "Zero slope", "Increasing intervals", "Cubic behaviour", "Slopes with meaning"],
      critical: ["Find critical points", "Minimum values", "Max or min?", "Cubic critical points", "Local maximum values"],
      optimize: ["Best products", "Best rectangles", "Peak times", "Peak heights", "Fencing with a wall"],
    };
    return (labels[kind] ?? labels.critical)[st - 1];
  },
  generate(skill, stage, rng): RawQuestion {
    const kind = str(skill.params, "kind", "critical");
    if (kind === "increasing") return appsIncreasing(stage, rng);
    if (kind === "optimize") return appsOptimize(stage, rng, skill.params);
    return appsCritical(stage, rng);
  },
};

/* ----------------------------------------------------------------- integral */
function intAntiderivative(stage: number, rng: Rng): RawQuestion {
  if (stage === 1) {
    const k = rng.int(2, 9);
    const ans = `${k}x + C`;
    return mcQ({
      instruction: "Find the antiderivative.",
      prompt: `∫ ${k} dx`,
      choices: mcChoices(rng, ans, [`${k} + C`, `${k}x^2 + C`, `{${k}/2}x^2 + C`]),
      answer: ans,
      hint: `Which function has constant derivative ${k}?`,
      steps: [
        `A line with slope ${k} has derivative ${k}.`,
        `∫ ${k} dx = ${k}x + C.`,
      ],
      concept: "Antiderivatives of constants are lines (plus C).",
      verify: () => close(numDeriv((x) => k * x, 2), k),
    });
  }
  if (stage === 2) {
    const n = rng.int(1, 4);
    const ans = `x^${n + 1} + C`;
    return mcQ({
      instruction: "Find the antiderivative.",
      prompt: `∫ ${n + 1}x^${n} dx`,
      choices: mcChoices(rng, ans, [
        `${n === 1 ? "" : n}x^${Math.max(n - 1, 1)} + C`,
        `${n + 1}x^${n + 1} + C`,
        `x^${n} + C`,
      ]),
      answer: ans,
      hint: `Whose derivative is ${n + 1}x^${n}? Raise the power by one.`,
      steps: [
        `{d/dx} x^${n + 1} = ${n + 1}x^${n} — exactly the integrand.`,
        `∫ ${n + 1}x^${n} dx = x^${n + 1} + C.`,
      ],
      concept: "Integration raises the power and divides by the new power.",
      verify: () => close(numDeriv((x) => x ** (n + 1), 2), (n + 1) * 2 ** n, 1e-2),
    });
  }
  if (stage === 3) {
    const half = rng.int(1, 6);
    const a = 2 * half;
    const ans = `${half === 1 ? "" : half}x^2 + C`;
    return mcQ({
      instruction: "Find the antiderivative.",
      prompt: `∫ ${a}x dx`,
      choices: mcChoices(rng, ans, [`${a}x^2 + C`, `${a} + C`, `${a * 2}x^2 + C`]),
      answer: ans,
      hint: `Raise the power to x², then divide ${a} by 2.`,
      steps: [
        `∫ ${a}x dx = ${a} × {x^2/2} + C.`,
        `= ${half === 1 ? "" : half}x^2 + C.`,
      ],
      concept: "Divide by the new exponent after raising the power.",
      verify: () => close(numDeriv((x) => half * x * x, 3), a * 3, 1e-3),
    });
  }
  if (stage === 4) {
    const half = rng.int(1, 4);
    const a = 2 * half;
    const b = rng.int(1, 9);
    const ans = `${half === 1 ? "" : half}x^2 + ${b}x + C`;
    return mcQ({
      instruction: "Find the antiderivative.",
      prompt: `∫ (${a}x + ${b}) dx`,
      choices: mcChoices(rng, ans, [
        `${a}x^2 + ${b}x + C`,
        `${half === 1 ? "" : half}x^2 + C`,
        `${a} + C`,
      ]),
      answer: ans,
      hint: "Integrate term by term.",
      steps: [
        `∫ ${a}x dx = ${half === 1 ? "" : half}x^2 and ∫ ${b} dx = ${b}x.`,
        `Total: ${half === 1 ? "" : half}x^2 + ${b}x + C.`,
      ],
      concept: "Integrals distribute across sums.",
      verify: () => close(numDeriv((x) => half * x * x + b * x, 2), a * 2 + b, 1e-3),
    });
  }
  const a = rng.int(1, 3);
  const b = rng.int(1, 4);
  const c = rng.int(1, 9);
  const ans = `${a === 1 ? "" : a}x^3 + ${b === 1 ? "" : b}x^2 + ${c}x + C`;
  return mcQ({
    instruction: "Find the antiderivative.",
    prompt: `∫ (${3 * a}x^2 + ${2 * b}x + ${c}) dx`,
    choices: mcChoices(rng, ans, [
      `${3 * a}x^3 + ${2 * b}x^2 + ${c}x + C`,
      `${6 * a}x + ${2 * b} + C`,
      `${a === 1 ? "" : a}x^3 + ${b === 1 ? "" : b}x^2 + C`,
    ]),
    answer: ans,
    hint: "Raise each power by one and divide by the new power.",
    steps: [
      `∫ ${3 * a}x^2 dx = ${a === 1 ? "" : a}x^3, ∫ ${2 * b}x dx = ${b === 1 ? "" : b}x^2, ∫ ${c} dx = ${c}x.`,
      `Sum the pieces and add C.`,
    ],
    concept: "Check an antiderivative by differentiating it back.",
    verify: () => close(numDeriv((x) => a * x ** 3 + b * x * x + c * x, 2), 3 * a * 4 + 2 * b * 2 + c, 1e-2),
  });
}

function intDefinite(stage: number, rng: Rng): RawQuestion {
  if (stage === 1) {
    const b = rng.int(2, 6);
    const ans = b * b;
    return inputQ({
      instruction: "Evaluate the definite integral.",
      prompt: `∫ from 0 to ${b} of 2x dx`,
      answer: String(ans),
      hint: "The antiderivative of 2x is x².",
      steps: [
        `An antiderivative of 2x is x^2.`,
        `Evaluate: ${b}^2 − 0^2 = ${ans}.`,
      ],
      concept: "Definite integrals subtract antiderivative values.",
      verify: () => close(riemann((x) => 2 * x, 0, b), ans, 0.01 * (1 + ans)),
    });
  }
  if (stage === 2) {
    const b = rng.int(2, 6);
    const c = rng.int(1, 6);
    const ans = b * b + c * b;
    return inputQ({
      instruction: "Evaluate the definite integral.",
      prompt: `∫ from 0 to ${b} of (2x + ${c}) dx`,
      answer: String(ans),
      hint: "Antiderivative: x² + cx.",
      steps: [
        `An antiderivative is x^2 + ${c}x.`,
        `At ${b}: ${b * b} + ${c * b} = ${ans}; at 0: 0.`,
        `Integral = ${ans} − 0 = ${ans}.`,
      ],
      concept: "Fundamental theorem: F(b) − F(a).",
      verify: () => close(riemann((x) => 2 * x + c, 0, b), ans, 0.01 * (1 + ans)),
    });
  }
  if (stage === 3) {
    const a = rng.int(0, 2);
    const b = a + rng.int(1, 3);
    const ans = b ** 3 - a ** 3;
    return inputQ({
      instruction: "Evaluate the definite integral.",
      prompt: `∫ from ${a} to ${b} of 3x^2 dx`,
      answer: String(ans),
      hint: "The antiderivative of 3x² is x³.",
      steps: [
        `An antiderivative of 3x^2 is x^3.`,
        `x^3 from ${a} to ${b}: ${b ** 3} − ${a ** 3} = ${ans}.`,
      ],
      concept: "Both endpoints matter — subtract the lower value.",
      verify: () => close(riemann((x) => 3 * x * x, a, b), ans, 0.01 * (1 + ans)),
    });
  }
  if (stage === 4) {
    const a = rng.int(1, 3);
    const b = a + rng.int(1, 4);
    const c = rng.int(1, 6);
    const ans = b * b + c * b - (a * a + c * a);
    return inputQ({
      instruction: "Evaluate the definite integral.",
      prompt: `∫ from ${a} to ${b} of (2x + ${c}) dx`,
      answer: String(ans),
      hint: `Use F(x) = x^2 + ${c}x at both endpoints.`,
      steps: [
        `F(x) = x^2 + ${c}x.`,
        `F(${b}) = ${b * b + c * b}; F(${a}) = ${a * a + c * a}.`,
        `Integral = ${b * b + c * b} − ${a * a + c * a} = ${ans}.`,
      ],
      concept: "The lower limit's value is subtracted, never ignored.",
      verify: () => close(riemann((x) => 2 * x + c, a, b), ans, 0.01 * (1 + ans)),
    });
  }
  const b = rng.int(1, 3);
  const d = rng.int(1, 3);
  const e = rng.int(1, 6);
  const ans = b ** 3 + d * b * b + e * b;
  return inputQ({
    instruction: "Evaluate the definite integral.",
    prompt: `∫ from 0 to ${b} of (3x^2 + ${2 * d}x + ${e}) dx`,
    answer: String(ans),
    hint: `Antiderivative: x^3 + ${d}x^2 + ${e}x.`,
    steps: [
      `F(x) = x^3 + ${d === 1 ? "" : d}x^2 + ${e}x.`,
      `F(${b}) = ${b ** 3} + ${d * b * b} + ${e * b} = ${ans}; F(0) = 0.`,
      `Integral = ${ans}.`,
    ],
    concept: "Integrate each term, then apply the limits once.",
    verify: () => close(riemann((x) => 3 * x * x + 2 * d * x + e, 0, b), ans, 0.01 * (1 + ans)),
  });
}

function intArea(stage: number, rng: Rng): RawQuestion {
  if (stage === 1) {
    const c = rng.int(2, 9);
    const b = rng.int(2, 8);
    const ans = c * b;
    return inputQ({
      instruction: "Find the area under the curve.",
      prompt: `Find the area under y = ${c} from x = 0 to x = ${b}.`,
      answer: String(ans),
      hint: "The region is a rectangle.",
      steps: [
        `The region is a rectangle: width ${b}, height ${c}.`,
        `Area = ${b} × ${c} = ${ans}.`,
      ],
      concept: "Areas under constant functions are rectangles.",
      verify: () => close(riemann(() => c, 0, b), ans, 0.01 * (1 + ans)),
    });
  }
  if (stage === 2) {
    const m = rng.int(1, 5);
    const b = rng.int(2, 6) * 2;
    const ans = (m * b * b) / 2;
    return inputQ({
      instruction: "Find the area under the curve.",
      prompt: `Find the area under y = ${m === 1 ? "" : m}x from x = 0 to x = ${b}.`,
      answer: String(ans),
      hint: "The region is a triangle — or integrate.",
      steps: [
        `∫ ${m === 1 ? "" : m}x dx = {${m === 1 ? "" : m}x^2/2}.`,
        `At ${b}: ${m} × ${b * b} ÷ 2 = ${ans}.`,
      ],
      concept: "Integrals agree with the geometry they generalize.",
      verify: () => close(riemann((x) => m * x, 0, b), ans, 0.01 * (1 + ans)),
    });
  }
  if (stage === 3) {
    const b = rng.int(2, 5);
    const ans = b ** 3;
    return inputQ({
      instruction: "Find the area under the curve.",
      prompt: `Find the area under y = 3x^2 from x = 0 to x = ${b}.`,
      answer: String(ans),
      hint: "Integrate 3x² and evaluate at the endpoints.",
      steps: [
        `∫ 3x^2 dx = x^3.`,
        `Area = ${b}^3 − 0 = ${ans}.`,
      ],
      concept: "Curved areas need integrals, not geometry formulas.",
      verify: () => close(riemann((x) => 3 * x * x, 0, b), ans, 0.01 * (1 + ans)),
    });
  }
  if (stage === 4) {
    const a = rng.int(1, 3);
    const b = a + rng.int(2, 4);
    const c = rng.int(1, 5);
    const ans = b * b + c * b - (a * a + c * a);
    return inputQ({
      instruction: "Find the area under the curve.",
      prompt: `Find the area under y = 2x + ${c} from x = ${a} to x = ${b}.`,
      answer: String(ans),
      hint: `The function is positive there, so area = the definite integral.`,
      steps: [
        `Area = ∫ from ${a} to ${b} of (2x + ${c}) dx.`,
        `F(x) = x^2 + ${c}x: F(${b}) − F(${a}) = ${b * b + c * b} − ${a * a + c * a} = ${ans}.`,
      ],
      concept: "For positive functions, area IS the definite integral.",
      verify: () => close(riemann((x) => 2 * x + c, a, b), ans, 0.01 * (1 + ans)),
    });
  }
  // b must be a multiple of 3 so 4b³/3 stays an exact integer.
  const bb = 3 * rng.int(1, 5);
  const ans = (4 * bb ** 3) / 3;
  return inputQ({
    instruction: "Find the enclosed area.",
    prompt: `Find the area between y = ${bb * bb} − x^2 and the x-axis (from x = −${bb} to x = ${bb}).`,
    answer: String(ans),
    hint: `Integrate ${bb * bb} − x^2 across the interval where it is positive.`,
    steps: [
      `The curve meets the axis at x = ±${bb}.`,
      `∫ (${bb * bb} − x^2) dx = ${bb * bb}x − {x^3/3}.`,
      `From −${bb} to ${bb}: (${bb ** 3} − ${bb ** 3 / 3}) − (−${bb ** 3} + ${bb ** 3 / 3}) = ${ans}.`,
    ],
    concept: "Symmetric regions can be integrated across the full interval.",
    verify: () => close(riemann((x) => bb * bb - x * x, -bb, bb), ans, 0.01 * (1 + ans)),
  });
}

const integral: GeneratorFamily = {
  stageLabel(skill: SkillRef, st: number) {
    const kind = str(skill.params, "kind", "antiderivative");
    const labels: Record<string, string[]> = {
      antiderivative: ["Constants", "Perfect powers", "Divide by the power", "Linear integrands", "Full polynomials"],
      definite: ["From zero", "Add a constant", "Cubic growth", "Both limits", "Polynomial integrals"],
      area: ["Rectangles", "Triangles", "Under a parabola", "Shifted intervals", "Enclosed regions"],
    };
    return (labels[kind] ?? labels.antiderivative)[st - 1];
  },
  generate(skill, stage, rng): RawQuestion {
    const kind = str(skill.params, "kind", "antiderivative");
    if (kind === "definite") return intDefinite(stage, rng);
    if (kind === "area") return intArea(stage, rng);
    return intAntiderivative(stage, rng);
  },
};

/* ------------------------------------------------------------------ vectors */
const pairAns = (x: number, y: number): string => `(${x}, ${y})`;
const pairDisp = (x: number, y: number): string => `(${sx(x)}, ${sx(y)})`;

const VEC_TRIPLES: readonly [number, number, number][] = [
  [3, 4, 5],
  [6, 8, 10],
  [5, 12, 13],
  [8, 15, 17],
  [9, 12, 15],
  [7, 24, 25],
];

function vecComponents(stage: number, rng: Rng): RawQuestion {
  if (stage === 1 || stage === 3) {
    const lo = stage === 1 ? 0 : -8;
    const hi = stage === 1 ? 9 : 9;
    const x1 = rng.int(lo, hi);
    const y1 = rng.int(lo, hi);
    const dx = nz(rng, -6, 6);
    const dy = nz(rng, -6, 6);
    return inputQ({
      instruction: "Write the vector in component form (a, b).",
      prompt: `Find the vector from A(${sx(x1)}, ${sx(y1)}) to B(${sx(x1 + dx)}, ${sx(y1 + dy)}).`,
      answer: pairAns(dx, dy),
      accept: [`(${dx},${dy})`, `${dx}, ${dy}`, `${dx},${dy}`],
      answerFormat: "text",
      answerHint: "e.g. (3, -2)",
      hint: "Subtract: terminal point minus initial point.",
      steps: [
        `x-component: ${sx(x1 + dx)} − (${sx(x1)}) = ${sx(dx)}.`,
        `y-component: ${sx(y1 + dy)} − (${sx(y1)}) = ${sx(dy)}.`,
        `Vector AB = ${pairDisp(dx, dy)}.`,
      ],
      concept: "A vector's components are terminal minus initial coordinates.",
      verify: () => x1 + dx - x1 === dx && y1 + dy - y1 === dy,
    });
  }
  if (stage === 2) {
    const k = rng.int(2, 5);
    const ux = nz(rng, -6, 6);
    const uy = nz(rng, -6, 6);
    return inputQ({
      instruction: "Write the vector in component form (a, b).",
      prompt: `u = ${pairDisp(ux, uy)}. Find ${k}u.`,
      answer: pairAns(k * ux, k * uy),
      accept: [`(${k * ux},${k * uy})`, `${k * ux}, ${k * uy}`],
      answerFormat: "text",
      answerHint: "e.g. (6, -4)",
      hint: "Multiply each component by the scalar.",
      steps: [
        `${k}u = (${k} × ${sx(ux)}, ${k} × ${sx(uy)}).`,
        `= ${pairDisp(k * ux, k * uy)}.`,
      ],
      concept: "Scalar multiplication stretches every component equally.",
      verify: () => (k * ux) / k === ux && (k * uy) / k === uy,
    });
  }
  if (stage === 4) {
    const ux = nz(rng, -5, 5);
    const uy = nz(rng, -5, 5);
    const k = rng.int(2, 4);
    const ans = pairDisp(k * ux, k * uy);
    return mcQ({
      instruction: "Identify the parallel vector.",
      prompt: `Which vector is parallel to u = ${pairDisp(ux, uy)}?`,
      choices: mcChoices(rng, ans, [
        pairDisp(uy, ux),
        pairDisp(-uy, ux),
        pairDisp(k * ux, k * uy + 1),
      ]),
      answer: ans,
      hint: "Parallel vectors are scalar multiples of each other.",
      steps: [
        `${ans} = ${k} × ${pairDisp(ux, uy)}.`,
        `A scalar multiple points along the same line, so it is parallel.`,
      ],
      concept: "Parallel means one vector is a scalar times the other.",
      verify: () => k * ux * uy === k * uy * ux,
    });
  }
  const ux = nz(rng, -6, 6);
  const uy = nz(rng, -6, 6);
  const vx = nz(rng, -6, 6);
  const vy = nz(rng, -6, 6);
  const k = rng.int(2, 3);
  return inputQ({
    instruction: "Write the vector in component form (a, b).",
    prompt: `u = ${pairDisp(ux, uy)} and v = ${pairDisp(vx, vy)}. Find ${k}u − v.`,
    answer: pairAns(k * ux - vx, k * uy - vy),
    accept: [`(${k * ux - vx},${k * uy - vy})`, `${k * ux - vx}, ${k * uy - vy}`],
    answerFormat: "text",
    answerHint: "e.g. (5, -1)",
    hint: `First compute ${k}u, then subtract v component-wise.`,
    steps: [
      `${k}u = ${pairDisp(k * ux, k * uy)}.`,
      `${k}u − v = (${sx(k * ux)} − (${sx(vx)}), ${sx(k * uy)} − (${sx(vy)})).`,
      `= ${pairDisp(k * ux - vx, k * uy - vy)}.`,
    ],
    concept: "Vector expressions evaluate component by component.",
    verify: () => k * ux - vx + vx === k * ux && k * uy - vy + vy === k * uy,
  });
}

function vecAdd(stage: number, rng: Rng): RawQuestion {
  const span = stage <= 2 ? 8 : 9;
  const lo = stage >= 3 ? -span : 1;
  const ux = nz(rng, lo, span);
  const uy = nz(rng, lo, span);
  const vx = nz(rng, lo, span);
  const vy = nz(rng, lo, span);
  if (stage === 4) {
    const k1 = 2;
    const k2 = 3;
    return inputQ({
      instruction: "Write the vector in component form (a, b).",
      prompt: `u = ${pairDisp(ux, uy)} and v = ${pairDisp(vx, vy)}. Find ${k1}u + ${k2}v.`,
      answer: pairAns(k1 * ux + k2 * vx, k1 * uy + k2 * vy),
      accept: [`(${k1 * ux + k2 * vx},${k1 * uy + k2 * vy})`, `${k1 * ux + k2 * vx}, ${k1 * uy + k2 * vy}`],
      answerFormat: "text",
      answerHint: "e.g. (5, -1)",
      hint: "Scale each vector first, then add components.",
      steps: [
        `${k1}u = ${pairDisp(k1 * ux, k1 * uy)} and ${k2}v = ${pairDisp(k2 * vx, k2 * vy)}.`,
        `Sum: ${pairDisp(k1 * ux + k2 * vx, k1 * uy + k2 * vy)}.`,
      ],
      concept: "Linear combinations mix scaling and adding.",
      verify: () => k1 * ux + k2 * vx - k2 * vx === k1 * ux,
    });
  }
  if (stage === 5) {
    return inputQ({
      instruction: "Write the vector in component form (a, b).",
      prompt: `u = ${pairDisp(ux, uy)} and v = ${pairDisp(vx, vy)}. Find the vector w with u + w = v.`,
      answer: pairAns(vx - ux, vy - uy),
      accept: [`(${vx - ux},${vy - uy})`, `${vx - ux}, ${vy - uy}`],
      answerFormat: "text",
      answerHint: "e.g. (2, -7)",
      hint: "Solve for w: w = v − u.",
      steps: [
        `u + w = v means w = v − u.`,
        `w = (${sx(vx)} − (${sx(ux)}), ${sx(vy)} − (${sx(uy)})) = ${pairDisp(vx - ux, vy - uy)}.`,
      ],
      concept: "Vector equations rearrange just like number equations.",
      verify: () => ux + (vx - ux) === vx && uy + (vy - uy) === vy,
    });
  }
  const sub = stage === 2 || (stage === 3 && rng.chance(0.5));
  const rx = sub ? ux - vx : ux + vx;
  const ry = sub ? uy - vy : uy + vy;
  return inputQ({
    instruction: "Write the vector in component form (a, b).",
    prompt: `u = ${pairDisp(ux, uy)} and v = ${pairDisp(vx, vy)}. Find u ${sub ? "−" : "+"} v.`,
    answer: pairAns(rx, ry),
    accept: [`(${rx},${ry})`, `${rx}, ${ry}`],
    answerFormat: "text",
    answerHint: "e.g. (5, -1)",
    hint: `${sub ? "Subtract" : "Add"} matching components.`,
    steps: [
      `x: ${sx(ux)} ${sub ? "−" : "+"} (${sx(vx)}) = ${sx(rx)}.`,
      `y: ${sx(uy)} ${sub ? "−" : "+"} (${sx(vy)}) = ${sx(ry)}.`,
      `u ${sub ? "−" : "+"} v = ${pairDisp(rx, ry)}.`,
    ],
    concept: "Vectors add and subtract component by component.",
    verify: () => (sub ? rx + vx === ux && ry + vy === uy : rx - vx === ux && ry - vy === uy),
  });
}

function vecMagnitude(stage: number, rng: Rng): RawQuestion {
  const [a, b, c] = rng.pick(VEC_TRIPLES);
  if (stage === 1 || stage === 2) {
    const sxg = stage === 2 && rng.chance(0.6) ? -1 : 1;
    const syg = stage === 2 && rng.chance(0.6) ? -1 : 1;
    const vx = sxg * a;
    const vy = syg * b;
    return inputQ({
      instruction: "Find the magnitude of the vector.",
      prompt: `v = ${pairDisp(vx, vy)}. Find |v|.`,
      answer: String(c),
      hint: "Magnitude is the square root of the summed squared components.",
      steps: [
        `|v| = sqrt((${sx(vx)})^2 + (${sx(vy)})^2) = sqrt(${a * a} + ${b * b}).`,
        `= sqrt(${c * c}) = ${c}.`,
      ],
      concept: "Magnitude is the Pythagorean length of the arrow.",
      verify: () => a * a + b * b === c * c,
    });
  }
  if (stage === 3) {
    const k = rng.int(2, 4);
    return inputQ({
      instruction: "Find the magnitude.",
      prompt: `v = ${pairDisp(a, b)} has |v| = ${c}. Find |${k}v|.`,
      answer: String(k * c),
      hint: "Scaling a vector scales its length by the same factor.",
      steps: [
        `|${k}v| = ${k} × |v|.`,
        `= ${k} × ${c} = ${k * c}.`,
      ],
      concept: "|k·v| = |k| × |v|.",
      verify: () => (k * a) ** 2 + (k * b) ** 2 === (k * c) ** 2,
    });
  }
  if (stage === 4) {
    const ans = `({${a}/${c}}, {${b}/${c}})`;
    return mcQ({
      instruction: "Find the unit vector.",
      prompt: `Find the unit vector in the direction of v = ${pairDisp(a, b)}.`,
      choices: mcChoices(rng, ans, [
        `(${a}, ${b})`,
        `({${b}/${c}}, {${a}/${c}})`,
        `({1/${a}}, {1/${b}})`,
      ]),
      answer: ans,
      hint: `First find |v| = ${c}, then divide each component by it.`,
      steps: [
        `|v| = sqrt(${a * a} + ${b * b}) = ${c}.`,
        `Unit vector: ({${a}/${c}}, {${b}/${c}}) — same direction, length 1.`,
      ],
      concept: "Dividing by the magnitude normalizes a vector.",
      verify: () => Math.abs((a / c) ** 2 + (b / c) ** 2 - 1) < 1e-9,
    });
  }
  return inputQ({
    instruction: "Find the missing component.",
    prompt: `v = (${a}, y) has magnitude ${c}, with y positive. Find y.`,
    answer: String(b),
    hint: `Solve ${a}^2 + y^2 = ${c * c}.`,
    steps: [
      `y^2 = ${c * c} − ${a * a} = ${b * b}.`,
      `y is positive, so y = ${b}.`,
    ],
    concept: "Magnitudes hide a Pythagorean equation.",
    verify: () => a * a + b * b === c * c,
  });
}

function vecDot(stage: number, rng: Rng): RawQuestion {
  if (stage === 1 || stage === 2) {
    const lo = stage === 1 ? 1 : -6;
    const hi = stage === 1 ? 6 : 6;
    const ux = nz(rng, lo, hi);
    const uy = nz(rng, lo, hi);
    const vx = nz(rng, lo, hi);
    const vy = nz(rng, lo, hi);
    const ans = ux * vx + uy * vy;
    return inputQ({
      instruction: "Compute the dot product.",
      prompt: `u = ${pairDisp(ux, uy)} and v = ${pairDisp(vx, vy)}. Find u · v.`,
      answer: String(ans),
      hint: "Multiply matching components, then add the results.",
      steps: [
        `u · v = (${sx(ux)})(${sx(vx)}) + (${sx(uy)})(${sx(vy)}).`,
        `= ${sx(ux * vx)} + (${sx(uy * vy)}) = ${sx(ans)}.`,
      ],
      concept: "The dot product pairs components into one number.",
      verify: () => ans - uy * vy === ux * vx,
    });
  }
  if (stage === 3) {
    const bcomp = rng.pick([1, 2, 3]);
    const m = rng.int(1, 3);
    const cc = nz(rng, -4, 4);
    const ux = bcomp * m;
    const k0 = -m * cc;
    return inputQ({
      instruction: "Make the vectors perpendicular.",
      prompt: `u = ${pairDisp(ux, bcomp)} and v = (${sx(cc)}, k). Find k so that u and v are perpendicular.`,
      answer: String(k0),
      hint: "Perpendicular vectors have dot product 0.",
      steps: [
        `u · v = ${sx(ux)}(${sx(cc)}) + ${bcomp}k = 0.`,
        `${bcomp}k = ${sx(-ux * cc)}, so k = ${sx(k0)}.`,
      ],
      concept: "Zero dot product means a right angle.",
      verify: () => ux * cc + bcomp * k0 === 0,
    });
  }
  if (stage === 4) {
    const mu = rng.pick([2, 4, 6]);
    const mv = rng.int(2, 6);
    const ans = (mu * mv) / 2;
    return inputQ({
      instruction: "Use the angle form of the dot product.",
      prompt: `|u| = ${mu}, |v| = ${mv}, and the angle between u and v is 60°. Find u · v.`,
      answer: String(ans),
      hint: `u · v = |u||v| cos 60°, and cos 60° = {1/2}.`,
      steps: [
        `u · v = ${mu} × ${mv} × cos 60°.`,
        `= ${mu * mv} × {1/2} = ${ans}.`,
      ],
      concept: "The dot product also measures angle times lengths.",
      verify: () => Math.abs(mu * mv * Math.cos(Math.PI / 3) - ans) < 1e-9,
    });
  }
  const acute = rng.chance(0.5);
  const ux = rng.int(1, 5);
  const uy = rng.int(1, 5);
  const vx = acute ? rng.int(1, 5) : -rng.int(1, 5) - uy;
  const vy = acute ? rng.int(1, 5) : -rng.int(1, 5);
  const dot = ux * vx + uy * vy;
  const ans = dot > 0 ? "Acute" : dot < 0 ? "Obtuse" : "Right";
  return mcQ({
    instruction: "Classify the angle between the vectors.",
    prompt: `u = ${pairDisp(ux, uy)} and v = ${pairDisp(vx, vy)}. Is the angle between them acute, right, or obtuse?`,
    choices: mcChoices(rng, ans, ["Acute", "Right", "Obtuse"].filter((x) => x !== ans)),
    answer: ans,
    hint: "Check the sign of the dot product.",
    steps: [
      `u · v = ${sx(ux * vx)} + (${sx(uy * vy)}) = ${sx(dot)}.`,
      `A ${dot > 0 ? "positive" : dot < 0 ? "negative" : "zero"} dot product means the angle is ${ans.toLowerCase()}.`,
    ],
    concept: "The dot product's sign classifies the angle.",
    verify: () => {
      const cos = dot / (Math.hypot(ux, uy) * Math.hypot(vx, vy));
      return dot > 0 ? cos > 0 : dot < 0 ? cos < 0 : cos === 0;
    },
  });
}

function vecAngle(stage: number, rng: Rng): RawQuestion {
  if (stage === 1) {
    const m = rng.int(1, 5);
    const n = rng.int(1, 5);
    const u: [number, number] = [m, n];
    const v: [number, number] = [-n, m];
    return inputQ({
      instruction: "Find the angle, in degrees.",
      prompt: `u = ${pairDisp(u[0], u[1])} and v = ${pairDisp(v[0], v[1])}. Find the angle between u and v.`,
      answer: "90",
      hint: "Compute the dot product first.",
      steps: [
        `u · v = (${sx(u[0])})(${sx(v[0])}) + (${sx(u[1])})(${sx(v[1])}) = ${sx(u[0] * v[0])} + ${sx(u[1] * v[1])} = 0.`,
        `Zero dot product means the vectors are perpendicular: 90°.`,
      ],
      concept: "Swapped-and-negated components give perpendicular vectors.",
      verify: () => u[0] * v[0] + u[1] * v[1] === 0,
    });
  }
  if (stage === 2) {
    const m = rng.int(1, 4);
    const same = rng.chance(0.5);
    const ux = nz(rng, -4, 4);
    const uy = nz(rng, -4, 4);
    const k = same ? m + 1 : -(m + 1);
    const ans = same ? 0 : 180;
    return inputQ({
      instruction: "Find the angle, in degrees.",
      prompt: `u = ${pairDisp(ux, uy)} and v = ${pairDisp(k * ux, k * uy)}. Find the angle between u and v.`,
      answer: String(ans),
      hint: `v is a ${same ? "positive" : "negative"} multiple of u.`,
      steps: [
        `v = ${sx(k)}u, a ${same ? "positive" : "negative"} scalar multiple.`,
        `${same ? "Same direction: 0°." : "Opposite directions: 180°."}`,
      ],
      concept: "Scalar multiples are parallel — 0° or 180° apart.",
      verify: () => {
        const dot = ux * k * ux + uy * k * uy;
        return same ? dot > 0 : dot < 0;
      },
    });
  }
  if (stage === 3) {
    const k = rng.int(1, 5);
    const up = rng.chance(0.5);
    const v: [number, number] = up ? [k, k] : [-k, k];
    const ans = up ? 45 : 135;
    return inputQ({
      instruction: "Find the angle, in degrees.",
      prompt: `u = (1, 0) and v = ${pairDisp(v[0], v[1])}. Find the angle between u and v.`,
      answer: String(ans),
      hint: `v points along a diagonal — equal-sized components.`,
      steps: [
        `v makes equal ${up ? "" : "(but opposite-sign) "}steps in x and y: it lies on the ${up ? "45°" : "135°"} diagonal.`,
        `The angle from (1, 0) is ${ans}°.`,
      ],
      concept: "Equal components put a vector on a 45° diagonal.",
      verify: () => {
        const cos = (1 * v[0] + 0 * v[1]) / (1 * Math.hypot(v[0], v[1]));
        return Math.abs(Math.acos(cos) - (ans * Math.PI) / 180) < 1e-9;
      },
    });
  }
  const [a, b, c] = rng.pick(VEC_TRIPLES.slice(0, 4));
  const useX = rng.chance(0.5);
  const other: [number, number] = useX ? [1, 0] : [0, 1];
  const dot = useX ? a : b;
  const ans = Math.round((Math.acos(dot / c) * 180) / Math.PI);
  return inputQ({
    instruction: "Find the angle. Round to the nearest degree.",
    prompt: `u = ${pairDisp(a, b)} and v = ${pairDisp(other[0], other[1])}. Find the angle between u and v, in degrees.`,
    answer: String(ans),
    hint: `cos θ = {u · v/|u||v|} with |u| = ${c} and |v| = 1.`,
    steps: [
      `u · v = ${dot} and |u||v| = ${c} × 1 = ${c}.`,
      `cos θ = {${dot}/${c}}.`,
      `θ = cos^{−1}({${dot}/${c}}) ≈ ${ans}°.`,
    ],
    concept: "The dot-product formula recovers the exact angle.",
    verify: () => Math.round((Math.acos(dot / c) * 180) / Math.PI) === ans,
  });
}

const vectors: GeneratorFamily = {
  stageLabel(skill: SkillRef, st: number) {
    const kind = str(skill.params, "kind", "mixed");
    const labels: Record<string, string[]> = {
      components: ["Point to point", "Scalar multiples", "Negative components", "Parallel vectors", "Combinations"],
      add: ["Adding vectors", "Subtracting vectors", "With negatives", "Linear combinations", "Solve for a vector"],
      magnitude: ["Lengths", "Negative components", "Scaled lengths", "Unit vectors", "Missing components"],
      dot: ["Dot products", "With negatives", "Perpendicularity", "The angle form", "Classify angles"],
      angle: ["Right angles", "Parallel vectors", "Diagonals", "Use the formula", "Use the formula again"],
    };
    return (labels[kind] ?? ["Components", "Operations", "Lengths", "Dot products", "Angles"])[st - 1];
  },
  generate(skill, stage, rng): RawQuestion {
    let kind = str(skill.params, "kind", "mixed");
    if (kind === "mixed") kind = rng.pick(["components", "add", "magnitude", "dot"]);
    if (kind === "add") return vecAdd(stage, rng);
    if (kind === "magnitude") return vecMagnitude(stage, rng);
    if (kind === "dot") return vecDot(stage, rng);
    if (kind === "angle") return vecAngle(stage, rng);
    return vecComponents(stage, rng);
  },
};

export const calculusFamilies = {
  "limits": limits,
  "derivative": derivative,
  "derivative-apps": derivativeApps,
  "integral": integral,
  "vectors": vectors,
} satisfies Record<string, GeneratorFamily>;
