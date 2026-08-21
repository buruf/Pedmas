/**
 * CAS second opinion for higher mathematics.
 *
 * Every question already re-verifies its answer at generation time — but the
 * verify() function is written alongside the generator, so the two can share
 * a wrong assumption and agree with each other about it. (They did, once: a
 * first-principles derivative displayed "23x^2" for the derivative of 2x^3
 * because two coefficients were concatenated instead of multiplied, and the
 * numeric verify checked the power rule against itself, never the string.)
 *
 * This module is the independent auditor: checkers that read ONLY what the
 * child sees — the rendered prompt and the displayed answer — and re-derive
 * the mathematics with mathjs, a computer-algebra library that shares no
 * code with the generators. Symbolic answers are compared by evaluating both
 * sides at several sample points, so equivalent forms (x^2+4x+4 versus
 * (x+2)^2) agree and different ones cannot.
 *
 * A checker only claims a question when it recognizes the format, and every
 * claim is counted, so coverage is measurable rather than assumed.
 */
import { evaluate, derivative } from "mathjs";
import { getSkill } from "@/curriculum";
import type { Question } from "./types";

/** The generator family behind a question, via its skill id. */
function familyOf(q: Question): string {
  return getSkill(q.skillId)?.family ?? "";
}

export interface CasVerdict {
  checked: boolean;
  checker?: string;
  ok?: boolean;
  detail?: string;
}

/** Rendered math -> mathjs syntax. */
export function toMathjs(s: string): string {
  return (
    s
      .replace(/−/g, "-")
      .replace(/×/g, "*")
      .replace(/÷/g, "/")
      .replace(/√(\d+)/g, "sqrt($1)")
      .replace(/√\(/g, "sqrt(")
      .replace(/π/g, "pi")
      // {a/b} display fractions -> (a)/(b); the braces group the whole thing.
      .replace(/\{([^{}]+)\/([^{}]+)\}/g, "(($1)/($2))")
      // implicit multiplication mathjs cannot parse: digit before sqrt/(
      .replace(/(\d)\s*sqrt/g, "$1*sqrt")
      .replace(/(\d)\(/g, "$1*(")
      .replace(/\)\(/g, ")*(")
      .replace(/\)(\d|[a-z])/gi, ")*$1")
      // A bare variable before "(" reads as a function call to mathjs, so
      // "2x(6x−9)" must become "2x*(6x−9)" — but sqrt(/sin( etc. must not.
      .replace(/\b(sqrt|sin|cos|tan|log|combinations)\(/g, "$1§")
      .replace(/([a-zθ])\(/g, "$1*(")
      .replace(/§/g, "(")
      .trim()
  );
}

/** The variables an expression mentions, function names masked out. */
function varsIn(expr: string): string[] {
  const masked = expr.replace(/sqrt|sin|cos|tan|log|combinations|deg|pi/g, " ");
  return [...new Set(masked.match(/[a-z]/g) ?? [])];
}

const num = (s: string): number => evaluate(toMathjs(s)) as number;

const close = (a: number, b: number, tol = 1e-6): boolean =>
  Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b));

/** Numeric-sampling equivalence of two expressions in any shared variables. */
function sameExpr(exprA: string, exprB: string): boolean {
  const a = toMathjs(exprA);
  const b = toMathjs(exprB);
  const vars = [...new Set([...varsIn(a), ...varsIn(b)])];
  const points = [1.7, -2.3, 0.6, 3.9, -0.9];
  let compared = 0;
  for (let i = 0; i < points.length; i++) {
    // Every variable gets a distinct value, rotated per round, so x and y
    // cannot mask each other's coefficients by coincidence.
    const scope: Record<string, number> = {};
    vars.forEach((v, j) => (scope[v] = points[(i + j) % points.length] + j * 0.13));
    let va: number, vb: number;
    try {
      va = evaluate(a, scope) as number;
      vb = evaluate(b, scope) as number;
    } catch {
      return false;
    }
    if (!Number.isFinite(va) || !Number.isFinite(vb)) continue; // hole (e.g. cancelled factor)
    if (!close(va, vb, 1e-8)) return false;
    compared++;
  }
  return compared >= 3;
}

type Checker = (q: Question) => CasVerdict | null;

/** "EXPR = ?"  or a bare arithmetic expression with a numeric answer. */
const bareNumeric: Checker = (q) => {
  const m = q.prompt.replace(/\s*=\s*\?\s*$/, "").trim();
  if (!/^[\d\s+\-−×÷*/^().{}√,!]+$/.test(m) && !/^C\(\d+,\s*\d+\)$/.test(m)) return null;
  try {
    const expected = /^C\((\d+),\s*(\d+)\)$/.exec(m)
      ? evaluate(m.replace(/^C\(/, "combinations(")) as number
      : num(m);
    const got = num(q.answer);
    return { checked: true, checker: "arithmetic", ok: close(expected, got), detail: `${m} = ${expected}, answer says ${q.answer}` };
  } catch {
    return null;
  }
};

/** "sin(30°)" / "cos(135°)" exact-value questions. */
const trigValue: Checker = (q) => {
  const m = /^(sin|cos|tan)\((-?\d+)°\)$/.exec(q.prompt.trim());
  if (!m) return null;
  try {
    const expected = evaluate(`${m[1]}(${m[2]} deg)`) as number;
    const got = num(q.answer);
    return { checked: true, checker: "trig-value", ok: close(expected, got), detail: `${m[0]} = ${expected.toFixed(6)}, answer ${q.answer}` };
  } catch {
    return null;
  }
};

/** "log 10" / "log_b n" */
const logValue: Checker = (q) => {
  const m = /^log(?:_(\d+))?\s+(\d+)$/.exec(q.prompt.trim());
  if (!m) return null;
  const base = m[1] ? Number(m[1]) : 10;
  const expected = Math.log(Number(m[2])) / Math.log(base);
  try {
    return { checked: true, checker: "logarithm", ok: close(expected, num(q.answer)), detail: `log_${base} ${m[2]} = ${expected}` };
  } catch {
    return null;
  }
};

/** Single-variable equation in the prompt; the answer is the claimed solution. */
const equationSolution: Checker = (q) => {
  const line = q.prompt.split("\n")[0].trim();
  const m = /^(.+)=(.+)$/.exec(line);
  if (!m || /[<>≤≥?]/.test(line)) return null;
  // Some families show an equation but ask about a PART of it (identify b,
  // compute the discriminant) — only claim genuine solve questions.
  if (!/solve/i.test(q.instruction ?? "")) return null;
  const lhs = toMathjs(m[1]);
  const rhs = toMathjs(m[2]);
  const vars = new Set((lhs + rhs).match(/\b[a-wyzθ]\b/g) ?? []);
  if (vars.size !== 1 && !(vars.size === 0 && /x/.test(lhs + rhs))) {
    if (!/x/.test(lhs + rhs) || vars.size > 0) return null;
  }
  const variable = /θ/.test(line) ? "θ" : "x";
  const value = Number(toMathjs(q.answer).replace(/^x\s*=\s*/, ""));
  if (!Number.isFinite(value)) return null;
  try {
    const scope: Record<string, number> = {};
    scope[variable === "θ" ? "t" : "x"] = variable === "θ" ? (value * Math.PI) / 180 : value;
    const l = evaluate(lhs.replace(/θ/g, "t").replace(/\bt\b/g, "(t)"), scope) as number;
    const r = evaluate(rhs.replace(/θ/g, "t"), scope) as number;
    return {
      checked: true,
      checker: "equation",
      ok: close(l, r, 1e-6),
      detail: `substituting ${variable}=${q.answer}: LHS=${l}, RHS=${r}`,
    };
  } catch {
    return null;
  }
};

/** Expression-rewriting families: answer must equal the prompt expression. */
const equivalence: Checker = (q) => {
  const families = new Set([
    "combine-like-terms", "distributive", "poly-add-sub", "poly-mul",
    "factor", "rational-expression", "binomial-theorem", "radical-expression",
    "poly-division", "exponent-rules",
  ]);
  if (!families.has(familyOf(q))) return null;
  if (!/x/.test(q.answer) || /[≠<>≤≥=]/.test(q.answer)) return null;
  const prompt = q.prompt.split("\n")[0].trim();
  if (/=|\?|[A-Za-z]{5,}/.test(prompt.replace(/sqrt/g, ""))) return null;
  try {
    return {
      checked: true,
      checker: "equivalence",
      ok: sameExpr(prompt, q.answer),
      detail: `"${prompt}" vs "${q.answer}"`,
    };
  } catch {
    return null;
  }
};

/** "lim as x → a of EXPR" with a numeric answer. */
const limitValue: Checker = (q) => {
  const m = /^lim as x → (-?\d+(?:\.\d+)?) of (.+)$/.exec(q.prompt.trim());
  if (!m) return null;
  const a = Number(m[1]);
  const expr = toMathjs(m[2]);
  try {
    const left = evaluate(expr, { x: a - 1e-7 }) as number;
    const right = evaluate(expr, { x: a + 1e-7 }) as number;
    const got = num(q.answer);
    const ok = close(left, got, 1e-4) && close(right, got, 1e-4);
    return { checked: true, checker: "limit", ok, detail: `two-sided values ${left.toFixed(6)}/${right.toFixed(6)}, answer ${q.answer}` };
  } catch {
    return null;
  }
};

/** "lim as h → 0 of EXPR(x,h)" whose answer is an expression in x. */
const hLimit: Checker = (q) => {
  const m = /^lim as h → 0 of (.+)$/.exec(q.prompt.trim());
  if (!m || !/x/.test(q.answer)) return null;
  try {
    const expr = toMathjs(m[1]);
    for (const x of [1.3, -2.1, 0.7]) {
      const lim = evaluate(expr, { x, h: 1e-7 }) as number;
      const got = evaluate(toMathjs(q.answer), { x }) as number;
      if (!close(lim, got, 1e-4)) {
        return { checked: true, checker: "h-limit", ok: false, detail: `at x=${x}: limit≈${lim.toFixed(4)}, answer gives ${got}` };
      }
    }
    return { checked: true, checker: "h-limit", ok: true };
  } catch {
    return null;
  }
};

/** "f(x) = EXPR. Using first principles, find f′(a)." — numeric derivative. */
const firstPrinciples: Checker = (q) => {
  const m = /^f\(x\) = (.+)\. Using first principles, find f′\((-?\d+(?:\.\d+)?)\)\.$/.exec(q.prompt.trim());
  if (!m) return null;
  const a = Number(toMathjs(m[2]));
  try {
    const expr = toMathjs(m[1]);
    const h = 1e-6;
    const d = ((evaluate(expr, { x: a + h }) as number) - (evaluate(expr, { x: a - h }) as number)) / (2 * h);
    return { checked: true, checker: "derivative-at", ok: close(d, num(q.answer), 1e-4), detail: `f'(${a}) ≈ ${d.toFixed(6)}, answer ${q.answer}` };
  } catch {
    return null;
  }
};

/** "∫ EXPR dx" — differentiate the answer, must give back the integrand. */
const antiderivative: Checker = (q) => {
  if (/from/.test(q.prompt)) return null;
  const m = /^∫ (.+) dx$/.exec(q.prompt.trim());
  if (!m) return null;
  const anti = q.answer.replace(/\s*\+\s*C\s*$/, "");
  try {
    const d = derivative(toMathjs(anti), "x").toString();
    return { checked: true, checker: "antiderivative", ok: sameExpr(d, m[1]), detail: `d/dx(${anti}) = ${d}, integrand ${m[1]}` };
  } catch {
    return null;
  }
};

/** "f(x) = EXPR. Find f(a)." and "f(x)=..., g(x)=..., find f(g(a))". */
const functionEval: Checker = (q) => {
  const simple = /^f\(x\) = (.+)\. Find f\((-?\d+)\)\.$/.exec(q.prompt.trim());
  if (simple) {
    try {
      const v = evaluate(toMathjs(simple[1]), { x: Number(simple[2]) }) as number;
      return { checked: true, checker: "function-eval", ok: close(v, num(q.answer)), detail: `f(${simple[2]}) = ${v}` };
    } catch {
      return null;
    }
  }
  const comp = /^f\(x\) = (.+) and g\(x\) = (.+)\. Find ([fg])\(([fg])\((-?\d+)\)\)\.$/.exec(q.prompt.trim());
  if (comp) {
    try {
      const fns: Record<string, string> = { f: toMathjs(comp[1]), g: toMathjs(comp[2]) };
      const inner = evaluate(fns[comp[4]], { x: Number(comp[5]) }) as number;
      const outer = evaluate(fns[comp[3]], { x: inner }) as number;
      return { checked: true, checker: "composition", ok: close(outer, num(q.answer)), detail: `${comp[3]}(${comp[4]}(${comp[5]})) = ${outer}` };
    } catch {
      return null;
    }
  }
  return null;
};

/** Pythagorean prose: legs -> hypotenuse, or hypotenuse+leg -> other leg. */
const pythagorean: Checker = (q) => {
  let m = /legs of (\d+)(?:\s*\w+)? and (\d+)/.exec(q.prompt);
  if (m && /hypotenuse/i.test(q.prompt)) {
    const c = Math.hypot(Number(m[1]), Number(m[2]));
    try {
      return { checked: true, checker: "pythagorean", ok: close(c, num(q.answer), 1e-3), detail: `hyp = ${c}` };
    } catch { return null; }
  }
  m = /hypotenuse of (\d+)(?:\s*\w+)? and one leg of (\d+)/.exec(q.prompt);
  if (m) {
    const b = Math.sqrt(Number(m[1]) ** 2 - Number(m[2]) ** 2);
    try {
      return { checked: true, checker: "pythagorean", ok: close(b, num(q.answer), 1e-3), detail: `other leg = ${b}` };
    } catch { return null; }
  }
  return null;
};

/** "sin θ = {a/b}. Find cos θ." — the identity families' numeric cases. */
const trigIdentityNumeric: Checker = (q) => {
  const m = /^(sin|cos) θ = \{(\d+)\/(\d+)\}\. Find (sin|cos) θ\.$/.exec(q.prompt.trim());
  if (!m) return null;
  const given = Number(m[2]) / Number(m[3]);
  const other = Math.sqrt(1 - given * given);
  try {
    return { checked: true, checker: "trig-identity", ok: close(other, num(q.answer), 1e-6), detail: `${m[4]} θ = ${other}` };
  } catch {
    return null;
  }
};

/** "tan θ = {o/a}. Find θ in degrees." — inverse trig, rounded answers. */
const inverseTrig: Checker = (q) => {
  const m = /^(?:In a right triangle, )?(sin|cos|tan) θ = \{(\d+)\/(\d+)\}\. Find θ in degrees\.$/.exec(q.prompt.trim());
  if (!m) return null;
  const r = Number(m[2]) / Number(m[3]);
  const fn = m[1] === "tan" ? Math.atan : m[1] === "sin" ? Math.asin : Math.acos;
  const deg = (fn(r) * 180) / Math.PI;
  try {
    return { checked: true, checker: "inverse-trig", ok: Math.abs(deg - num(q.answer)) <= 0.51, detail: `θ = ${deg.toFixed(2)}°, answer ${q.answer}` };
  } catch {
    return null;
  }
};

/** "a ___ b" with answer <, > or =. */
const comparison: Checker = (q) => {
  const m = /^(.+) ___ (.+)$/.exec(q.prompt.split("\n")[0].trim());
  if (!m || !/^[<>=]$/.test(q.answer.trim())) return null;
  try {
    const a = num(m[1]);
    const b = num(m[2]);
    const expected = close(a, b) ? "=" : a < b ? "<" : ">";
    return { checked: true, checker: "comparison", ok: expected === q.answer.trim(), detail: `${a} vs ${b}: expected ${expected}` };
  } catch {
    return null;
  }
};

/** Ordering: values separated by wide gaps, answer is the sorted comma list. */
const ordering: Checker = (q) => {
  const parts = q.prompt.split("\n")[0].trim().split(/\s{2,}/);
  if (parts.length < 3 || !q.answer.includes(",")) return null;
  try {
    const values = parts.map(num);
    const answerVals = q.answer.split(",").map((t) => num(t.trim()));
    if (values.length !== answerVals.length) return null;
    const sorted = [...values].sort((a, b) => a - b);
    const isSorted = answerVals.every((v, i) => close(v, sorted[i]));
    return { checked: true, checker: "ordering", ok: isSorted, detail: `sorted should be ${sorted.join(", ")}` };
  } catch {
    return null;
  }
};

/** Definite integral: numeric Simpson integration versus the stated value. */
const definiteIntegral: Checker = (q) => {
  const m = /^∫ from (-?\d+) to (-?\d+) of (.+) dx$/.exec(q.prompt.trim());
  if (!m) return null;
  const a = Number(m[1]);
  const b = Number(m[2]);
  try {
    const expr = toMathjs(m[3]);
    const n = 2000;
    const h = (b - a) / n;
    let sum = (evaluate(expr, { x: a }) as number) + (evaluate(expr, { x: b }) as number);
    for (let i = 1; i < n; i++) sum += (i % 2 ? 4 : 2) * (evaluate(expr, { x: a + i * h }) as number);
    const integral = (sum * h) / 3;
    return { checked: true, checker: "definite-integral", ok: close(integral, num(q.answer), 1e-4), detail: `numeric ∫ = ${integral.toFixed(6)}, answer ${q.answer}` };
  } catch {
    return null;
  }
};

const CHECKERS: Checker[] = [
  definiteIntegral,
  trigValue,
  logValue,
  limitValue,
  hLimit,
  firstPrinciples,
  antiderivative,
  functionEval,
  pythagorean,
  trigIdentityNumeric,
  inverseTrig,
  comparison,
  ordering,
  bareNumeric,
  equationSolution,
  equivalence,
];

/** Run the independent checkers over one question. */
export function casCheck(q: Question): CasVerdict {
  for (const checker of CHECKERS) {
    const verdict = checker(q);
    if (verdict) return verdict;
  }
  return { checked: false };
}
