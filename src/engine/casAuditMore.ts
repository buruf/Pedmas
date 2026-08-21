/**
 * Second bank of CAS checkers: the families whose answers are values wrapped
 * in structured prose — slopes, systems, vectors, sequences, growth stories,
 * simple interest, transformations, probabilities. Same contract as the
 * first bank: read only the rendered prompt/instruction/answer, re-derive
 * with mathematics that shares nothing with the generators, and claim a
 * question only when the format is recognized.
 */
import { evaluate } from "mathjs";
import { familyOf, num, close, toMathjs, type Checker } from "./casAudit";
import type { Question } from "./types";
import { BANK3 } from "./casAuditBank3";

/** ASCII-normalized text for regex parsing. */
const ascii = (s: string): string => s.replace(/−/g, "-").replace(/\s+/g, " ").trim();

/** All "(a, b)" pairs in a string, as number tuples. */
function pairs(s: string): [number, number][] {
  const out: [number, number][] = [];
  const re = /\((-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)\)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(ascii(s)))) out.push([Number(m[1]), Number(m[2])]);
  return out;
}

const verdict = (checker: string, ok: boolean, detail: string) => ({ checked: true as const, checker, ok, detail });

/** Slope from two points, from y = mx + b, or from a wage story. */
const slope: Checker = (q) => {
  if (familyOf(q) !== "slope") return null;
  const p = ascii(q.prompt.split("\n")[0]);
  const pts = pairs(p);
  if (/^\(.+\) and \(.+\)$/.test(p) && pts.length === 2) {
    const m = (pts[1][1] - pts[0][1]) / (pts[1][0] - pts[0][0]);
    try { return verdict("slope", close(m, num(q.answer)), `slope = ${m}`); } catch { return null; }
  }
  const eq = /^y = (.+)$/.exec(p);
  if (eq && /slope/i.test(q.instruction ?? "")) {
    try {
      const f = (x: number) => evaluate(toMathjs(eq[1]), { x }) as number;
      return verdict("slope", close(f(1) - f(0), num(q.answer)), `slope = ${f(1) - f(0)}`);
    } catch { return null; }
  }
  const story = /starts with \$(\d+) and has \$(\d+) after (\d+) hours/.exec(ascii(q.prompt));
  if (story) {
    const rate = (Number(story[2]) - Number(story[1])) / Number(story[3]);
    try { return verdict("slope", close(rate, num(q.answer)), `rate = ${rate}`); } catch { return null; }
  }
  return null;
};

/** "Slope m, y-intercept b" -> the answer line must have that slope and intercept. */
const slopeIntercept: Checker = (q) => {
  const m = /^Slope (-?\d+(?:\.\d+)?), y-intercept (-?\d+(?:\.\d+)?)$/.exec(ascii(q.prompt.split("\n")[0]));
  const a = /^y = (.+)$/.exec(ascii(q.answer));
  if (!m || !a) return null;
  try {
    const f = (x: number) => evaluate(toMathjs(a[1]), { x }) as number;
    const ok = close(f(0), Number(m[2])) && close(f(1) - f(0), Number(m[1]));
    return verdict("slope-intercept", ok, `answer has slope ${f(1) - f(0)}, intercept ${f(0)}`);
  } catch { return null; }
};

/** Two linear equations; answer is "(x, y)" or one coordinate. */
const systems: Checker = (q) => {
  if (familyOf(q) !== "systems") return null;
  const lines = q.prompt.split("\n").map((l) => ascii(l)).filter((l) => /=/.test(l));
  if (lines.length !== 2) return null;
  try {
    // Extract a1x + b1y = c1 by evaluating the LHS at unit points — no
    // parsing of signs needed, and it works for any linear arrangement.
    const coeffs = lines.map((line) => {
      const [lhs, rhs] = line.split("=");
      const f = (x: number, y: number) => evaluate(toMathjs(lhs), { x, y }) as number;
      const c0 = f(0, 0);
      return { a: f(1, 0) - c0, b: f(0, 1) - c0, c: num(rhs) - c0 };
    });
    const det = coeffs[0].a * coeffs[1].b - coeffs[1].a * coeffs[0].b;
    if (Math.abs(det) < 1e-12) return null;
    const x = (coeffs[0].c * coeffs[1].b - coeffs[1].c * coeffs[0].b) / det;
    const y = (coeffs[0].a * coeffs[1].c - coeffs[1].a * coeffs[0].c) / det;
    const pair = pairs(q.answer);
    if (pair.length === 1) {
      return verdict("systems", close(pair[0][0], x) && close(pair[0][1], y), `solution (${x}, ${y})`);
    }
    const which = /value of (x|y)/i.exec(q.instruction ?? "");
    if (which) {
      const expected = which[1].toLowerCase() === "x" ? x : y;
      return verdict("systems", close(expected, num(q.answer)), `${which[1]} = ${expected}`);
    }
    return null;
  } catch { return null; }
};

/** Vector arithmetic: from A to B, scalar multiples, sums, magnitude. */
const vectors: Checker = (q) => {
  if (familyOf(q) !== "vectors") return null;
  const p = ascii(q.prompt);
  const ans = pairs(q.answer);
  const check = (ex: number, ey: number) =>
    ans.length === 1
      ? verdict("vectors", close(ans[0][0], ex) && close(ans[0][1], ey), `expected (${ex}, ${ey})`)
      : null;
  let m = /from A\((-?\d+), (-?\d+)\) to B\((-?\d+), (-?\d+)\)/.exec(p);
  if (m) return check(Number(m[3]) - Number(m[1]), Number(m[4]) - Number(m[2]));
  m = /u = \((-?\d+), (-?\d+)\)\. Find (-?\d+)u\./.exec(p);
  if (m) return check(Number(m[3]) * Number(m[1]), Number(m[3]) * Number(m[2]));
  m = /u = \((-?\d+), (-?\d+)\) and v = \((-?\d+), (-?\d+)\)\. Find u \+ v\./.exec(p);
  if (m) return check(Number(m[1]) + Number(m[3]), Number(m[2]) + Number(m[4]));
  m = /u = \((-?\d+), (-?\d+)\)\. Find \|u\|/.exec(p);
  if (m) {
    const mag = Math.hypot(Number(m[1]), Number(m[2]));
    try { return verdict("vectors", close(mag, num(q.answer), 1e-2), `|u| = ${mag}`); } catch { return null; }
  }
  return null;
};

/** Arithmetic/geometric sequences: next term, nth term, difference, term number. */
const sequences: Checker = (q) => {
  if (familyOf(q) !== "sequence") return null;
  const p = ascii(q.prompt.split("\n")[0]);
  let m = /^(-?\d+(?:, -?\d+){3,}), \.\.\.$/.exec(p);
  if (m && /next term/i.test(q.instruction ?? "")) {
    const terms = m[1].split(",").map((t) => Number(t.trim()));
    const d = terms[1] - terms[0];
    const arithmetic = terms.every((t, i) => i === 0 || close(t - terms[i - 1], d));
    const r = terms[1] / terms[0];
    const geometric = terms[0] !== 0 && terms.every((t, i) => i === 0 || close(t / terms[i - 1], r));
    if (!arithmetic && !geometric) return null;
    const next = arithmetic ? terms[terms.length - 1] + d : terms[terms.length - 1] * r;
    try { return verdict("sequence", close(next, num(q.answer)), `next term ${next}`); } catch { return null; }
  }
  m = /first term (-?\d+) and common difference (-?\d+)\. Find the (\d+)\w* term/.exec(p);
  if (m) {
    const val = Number(m[1]) + (Number(m[3]) - 1) * Number(m[2]);
    try { return verdict("sequence", close(val, num(q.answer)), `term = ${val}`); } catch { return null; }
  }
  m = /a_1 = (-?\d+) and a_(\d+) = (-?\d+)\. Find the common difference/.exec(p);
  if (m) {
    const d = (Number(m[3]) - Number(m[1])) / (Number(m[2]) - 1);
    try { return verdict("sequence", close(d, num(q.answer)), `d = ${d}`); } catch { return null; }
  }
  m = /a_1 = (-?\d+) and d = (-?\d+), which term equals (-?\d+)/.exec(p);
  if (m) {
    const n = (Number(m[3]) - Number(m[1])) / Number(m[2]) + 1;
    try { return verdict("sequence", close(n, num(q.answer)), `n = ${n}`); } catch { return null; }
  }
  return null;
};

/** Arithmetic series sums and term counts. */
const seriesSum: Checker = (q) => {
  if (familyOf(q) !== "series") return null;
  const p = ascii(q.prompt.split("\n")[0]);
  let m = /sum of the first (\d+) terms of the arithmetic series with a_1 = (-?\d+) and d = (-?\d+)/.exec(p);
  if (m) {
    const [n, a, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
    const sum = (n / 2) * (2 * a + (n - 1) * d);
    try { return verdict("series", close(sum, num(q.answer)), `sum = ${sum}`); } catch { return null; }
  }
  m = /has (\d+) terms, first term (-?\d+) and last term (-?\d+)\. Find its sum/.exec(p);
  if (m) {
    const sum = (Number(m[1]) * (Number(m[2]) + Number(m[3]))) / 2;
    try { return verdict("series", close(sum, num(q.answer)), `sum = ${sum}`); } catch { return null; }
  }
  m = /a_1 = (-?\d+) and d = (-?\d+) sums to (-?\d+)\. How many terms/.exec(p);
  if (m) {
    try {
      const [a, d, s] = [Number(m[1]), Number(m[2]), Number(m[3])];
      const n = num(q.answer);
      const sum = (n / 2) * (2 * a + (n - 1) * d);
      return verdict("series", close(sum, s), `${n} terms sum to ${sum}, prompt says ${s}`);
    } catch { return null; }
  }
  return null;
};

/** "x^a * x^b = x^n" — recover n by evaluating the left side at x = 2. */
const exponentRules: Checker = (q) => {
  const m = /^(.+)= x\^n$/.exec(ascii(q.prompt.split("\n")[0]));
  if (!m) return null;
  try {
    const value = evaluate(toMathjs(m[1]), { x: 2 }) as number;
    const n = Math.log2(value);
    return verdict("exponent-rules", close(n, num(q.answer)), `x^n with n = ${n}`);
  } catch { return null; }
};

/** "sin θ = value" in degrees: substitution plus the smallest-solution claim. */
const trigEquation: Checker = (q) => {
  if (familyOf(q) !== "trig-equation") return null;
  if (!/Solve for θ/.test(q.instruction ?? "")) return null;
  const p = ascii(q.prompt.split("\n")[0]);
  let fn: string, rhs: number;
  let m = /^(sin|cos|tan) θ = (.+)$/.exec(p);
  if (m) {
    fn = m[1];
    try { rhs = num(m[2]); } catch { return null; }
  } else {
    m = /^(sin|cos|tan) θ - (.+) = 0$/.exec(p);
    if (!m) return null;
    fn = m[1];
    try { rhs = num(m[2]); } catch { return null; }
  }
  try {
    const deg = num(q.answer);
    const val = (t: number) => evaluate(`${fn}(${t} deg)`) as number;
    if (!close(val(deg), rhs, 1e-6)) return verdict("trig-equation", false, `${fn}(${deg}°) = ${val(deg)}, prompt wants ${rhs}`);
    // "Give the smallest solution": no earlier integer degree may also work.
    for (let t = 0; t < deg; t++) {
      if (Math.abs(val(t) - rhs) < 1e-9) return verdict("trig-equation", false, `${t}° also solves it and is smaller`);
    }
    return verdict("trig-equation", true, `θ = ${deg}°`);
  } catch { return null; }
};

/** "EXPR   (x = 8)" or "(x = 1, y = 5)". */
const evaluateAt: Checker = (q) => {
  // ascii() collapses runs of spaces — but the double space IS the format
  // here ("3x + 8   (x = 8)"), so parse the raw line.
  const m = /^(.+?)\s{2,}\((.+)\)\s*$/.exec(q.prompt.split("\n")[0].replace(/−/g, "-"));
  if (!m || !/=/.test(m[2])) return null;
  const scope: Record<string, number> = {};
  for (const part of m[2].split(",")) {
    const kv = /^\s*([a-z])\s*=\s*(-?\d+(?:\.\d+)?)\s*$/.exec(part);
    if (!kv) return null;
    scope[kv[1]] = Number(kv[2]);
  }
  try {
    const value = evaluate(toMathjs(m[1]), scope) as number;
    return verdict("evaluate-at", close(value, num(q.answer)), `evaluates to ${value}`);
  } catch { return null; }
};

/** Point geometry prose: coordinates, distance, translations, reflections, rotations. */
const pointGeometry: Checker = (q) => {
  const p = ascii(q.prompt);
  const ans = pairs(q.answer);
  const check = (ex: number, ey: number) =>
    ans.length === 1
      ? verdict("point-geometry", close(ans[0][0], ex) && close(ans[0][1], ey), `expected (${ex}, ${ey})`)
      : null;

  let m = /point \((-?\d+), (-?\d+)\) is translated (\d+) units? (right|left) and (\d+) units? (up|down)/.exec(p);
  if (m) {
    const x = Number(m[1]) + (m[4] === "right" ? 1 : -1) * Number(m[3]);
    const y = Number(m[2]) + (m[6] === "up" ? 1 : -1) * Number(m[5]);
    return check(x, y);
  }
  m = /point \((-?\d+), (-?\d+)\) is reflected over the (x|y)-axis/.exec(p);
  if (m) {
    return m[3] === "x" ? check(Number(m[1]), -Number(m[2])) : check(-Number(m[1]), Number(m[2]));
  }
  m = /point \((-?\d+), (-?\d+)\) is rotated (90|180)° (clockwise|counterclockwise|anticlockwise)? ?about the origin/.exec(p);
  if (m) {
    const [x, y] = [Number(m[1]), Number(m[2])];
    if (m[3] === "180") return check(-x, -y);
    return m[4] === "clockwise" ? check(y, -x) : check(-y, x);
  }
  m = /(?:How far apart are|distance between) the points \((-?\d+), (-?\d+)\) and \((-?\d+), (-?\d+)\)/.exec(p);
  if (m) {
    const d = Math.hypot(Number(m[3]) - Number(m[1]), Number(m[4]) - Number(m[2]));
    try { return verdict("point-geometry", close(d, num(q.answer), 1e-3), `distance = ${d}`); } catch { return null; }
  }
  m = /(\d+) units? (right|left) of the origin and (\d+) units? (up|down)/.exec(p);
  if (m) {
    const x = (m[2] === "right" ? 1 : -1) * Number(m[1]);
    const y = (m[4] === "up" ? 1 : -1) * Number(m[3]);
    if (/x-coordinate/.test(p)) {
      try { return verdict("point-geometry", close(x, num(q.answer)), `x = ${x}`); } catch { return null; }
    }
    if (/y-coordinate/.test(p)) {
      try { return verdict("point-geometry", close(y, num(q.answer)), `y = ${y}`); } catch { return null; }
    }
    if (/ordered pair/.test(p)) return check(x, y);
  }
  return null;
};

/** Vertex-form parabola features, located numerically from the curve itself. */
const quadraticFeatures: Checker = (q) => {
  if (familyOf(q) !== "quadratic-features") return null;
  const m = /^y = (.+)$/.exec(ascii(q.prompt.split("\n")[0]));
  if (!m) return null;
  try {
    const f = (x: number) => evaluate(toMathjs(m[1]), { x }) as number;
    // A parabola is fully determined by three samples: y = ax^2 + bx + c.
    const [y0, y1, y2] = [f(0), f(1), f(-1)];
    const a = (y1 + y2 - 2 * y0) / 2;
    const b = (y1 - y2) / 2;
    if (Math.abs(a) < 1e-12) return null;
    const vx = -b / (2 * a);
    const vy = f(vx);
    const instruction = q.instruction ?? "";
    if (/vertex/i.test(instruction)) {
      const ans = pairs(q.answer);
      if (ans.length !== 1) return null;
      return verdict("quadratic-features", close(ans[0][0], vx) && close(ans[0][1], vy), `vertex (${vx}, ${vy})`);
    }
    if (/axis of symmetry/i.test(instruction)) {
      return verdict("quadratic-features", close(vx, num(q.answer)), `axis x = ${vx}`);
    }
    if (/minimum or a maximum/i.test(instruction)) {
      const word = a > 0 ? "Minimum" : "Maximum";
      const wm = /^(Minimum|Maximum) of (.+)$/.exec(ascii(q.answer));
      if (!wm) return null;
      return verdict("quadratic-features", wm[1] === word && close(num(wm[2]), vy), `${word} of ${vy}`);
    }
    return null;
  } catch { return null; }
};

/** Domain restrictions, tested against the function itself. */
const domainRange: Checker = (q) => {
  if (familyOf(q) !== "domain-range") return null;
  const m = /^f\(x\) = (.+)$/.exec(ascii(q.prompt.split("\n")[0]));
  if (!m) return null;
  const expr = toMathjs(m[1]);
  const realAt = (x: number): boolean => {
    try {
      const v = evaluate(expr, { x });
      return typeof v === "number" && Number.isFinite(v);
    } catch { return false; }
  };
  const a = /^x (≠|≥|≤) (-?\d+(?:\.\d+)?)$/.exec(q.answer.replace(/−/g, "-").trim());
  if (!a) return null;
  const c = Number(a[2]);
  if (a[1] === "≠") {
    return verdict("domain", !realAt(c) && realAt(c + 0.7) && realAt(c - 0.7), `f real everywhere except ${c}`);
  }
  if (a[1] === "≥") {
    return verdict("domain", realAt(c) && realAt(c + 1) && !realAt(c - 0.5), `f real from ${c} up`);
  }
  return verdict("domain", realAt(c) && realAt(c - 1) && !realAt(c + 0.5), `f real up to ${c}`);
};

/** Growth and decay stories: start, factor, period. */
const exponentialGrowth: Checker = (q) => {
  if (familyOf(q) !== "exponential") return null;
  const p = ascii(q.prompt);
  const factor = /doubles/.test(p) ? 2 : /triples/.test(p) ? 3 : /halves/.test(p) ? 0.5 : null;
  if (factor === null) return null;
  const start = /(?:starts (?:with|at) |sample of |investment of \$|population starts at )(\d+)/.exec(p);
  if (!start) return null;
  const s = Number(start[1]);
  const period = /every (\d+) (?:hours|days|years|weeks)/.exec(p);
  const per = period ? Number(period[1]) : 1;
  let m = /(?:after|What is it worth after) (\d+) (?:hours|days|years|weeks)/.exec(p);
  if (m) {
    const value = s * factor ** (Number(m[1]) / per);
    try { return verdict("exponential", close(value, num(q.answer)), `value = ${value}`); } catch { return null; }
  }
  m = /reach(?:es)? (\d+)\?/.exec(p) ?? /does it reach (\d+)/.exec(p);
  if (m) {
    try {
      const n = num(q.answer);
      const value = s * factor ** (n / per);
      return verdict("exponential", close(value, Number(m[1])), `after ${n}: ${value}, target ${m[1]}`);
    } catch { return null; }
  }
  return null;
};

/** Simple interest: I = P·r·t/100, and each rearrangement the stages ask for. */
const simpleInterest: Checker = (q) => {
  if (familyOf(q) !== "financial") return null;
  const p = ascii(q.prompt);
  const grab = (re: RegExp): number | null => {
    const m = re.exec(p);
    return m ? Number(m[1]) : null;
  };
  try {
    let m = /\$(\d+) is invested at (\d+)% simple interest per year for (\d+) years?\./.exec(p);
    if (m) {
      const interest = (Number(m[1]) * Number(m[2]) * Number(m[3])) / 100;
      const expected = /total value/.test(p) ? Number(m[1]) + interest : interest;
      return verdict("interest", close(expected, num(q.answer)), `expected ${expected}`);
    }
    m = /\$(\d+) at (\d+)% simple interest earns \$(\d+) in interest\. For how many years/.exec(p);
    if (m) {
      const t = (Number(m[3]) * 100) / (Number(m[1]) * Number(m[2]));
      return verdict("interest", close(t, num(q.answer)), `t = ${t}`);
    }
    m = /\$(\d+) invested for (\d+) years at simple interest earns \$(\d+)\. What is the annual rate/.exec(p);
    if (m) {
      const r = (Number(m[3]) * 100) / (Number(m[1]) * Number(m[2]));
      return verdict("interest", close(r, num(q.answer)), `r = ${r}%`);
    }
    const rate = grab(/at (\d+)% simple interest/);
    const years = grab(/for (\d+) years? earned/);
    const earned = grab(/earned \$(\d+)/);
    if (rate !== null && years !== null && earned !== null && /How many dollars were invested/.test(p)) {
      const principal = (earned * 100) / (rate * years);
      return verdict("interest", close(principal, num(q.answer)), `P = ${principal}`);
    }
  } catch { return null; }
  return null;
};

/** Similar figures: scaled sides, scale factors, proportions, shadow problems. */
const similarity: Checker = (q) => {
  if (familyOf(q) !== "similarity") return null;
  const p = ascii(q.prompt);
  try {
    let m = /side of (\d+) cm\. It is enlarged by a scale factor of (\d+)/.exec(p);
    if (m) return verdict("similarity", close(Number(m[1]) * Number(m[2]), num(q.answer)), "scaled side");
    m = /match a side of (\d+) cm to a side of (\d+) cm/.exec(p);
    if (m) return verdict("similarity", close(Number(m[2]) / Number(m[1]), num(q.answer)), "scale factor");
    m = /Side \w+ = (\d+) cm matches side \w+ = (\d+) cm\. Side \w+ = (\d+) cm matches side \w+\./.exec(p);
    if (m) {
      const val = (Number(m[3]) * Number(m[2])) / Number(m[1]);
      return verdict("similarity", close(val, num(q.answer)), `proportion gives ${val}`);
    }
    m = /Every side of a \w+ is multiplied by (\d+)\. Its area is multiplied/.exec(p);
    if (m) return verdict("similarity", close(Number(m[1]) ** 2, num(q.answer)), "area factor");
    m = /A (\d+) m \w+ casts a (\d+) m shadow\..*casts a (\d+) m shadow\. How tall/.exec(p);
    if (m) {
      const h = (Number(m[1]) * Number(m[3])) / Number(m[2]);
      return verdict("similarity", close(h, num(q.answer)), `height = ${h}`);
    }
  } catch { return null; }
  return null;
};

/** Simple probability: dice, marble bags, counters, tickets. */
const probability: Checker = (q) => {
  if (familyOf(q) !== "probability") return null;
  const p = ascii(q.prompt);
  try {
    if (/fair (?:6|six)-sided die/i.test(p)) {
      let m = /rolling an? (\d+)\?/.exec(p);
      if (m) return verdict("probability", close(1 / 6, num(q.answer)), "1/6");
      m = /at most (\d+)/.exec(p);
      if (m) return verdict("probability", close(Number(m[1]) / 6, num(q.answer)), `${m[1]}/6`);
      m = /at least (\d+)/.exec(p);
      if (m) return verdict("probability", close((7 - Number(m[1])) / 6, num(q.answer)), `${7 - Number(m[1])}/6`);
      return null;
    }
    let m = /holds (\d+) red, (\d+) blue and (\d+) green marbles.*it is (red|blue|green)/s.exec(p);
    if (m) {
      const counts = { red: Number(m[1]), blue: Number(m[2]), green: Number(m[3]) };
      const total = counts.red + counts.blue + counts.green;
      return verdict("probability", close(counts[m[4] as keyof typeof counts] / total, num(q.answer)), `${m[4]}/total`);
    }
    m = /holds (\d+) red counters and (\d+) counters that are not red.*NOT red/s.exec(p);
    if (m) {
      const val = Number(m[2]) / (Number(m[1]) + Number(m[2]));
      return verdict("probability", close(val, num(q.answer)), `not-red = ${val}`);
    }
    m = /has (\d+) winning tickets among (\d+) tickets/.exec(p);
    if (m) return verdict("probability", close(Number(m[1]) / Number(m[2]), num(q.answer)), "wins/total");
  } catch { return null; }
  return null;
};

/** Counting principle: outfit/meal products, codes with and without repeats. */
const counting: Checker = (q) => {
  if (familyOf(q) !== "counting-principle") return null;
  const p = ascii(q.prompt);
  try {
    if (/outfits|meals/.test(q.instruction ?? "")) {
      const counts = [...p.matchAll(/(\d+) (?:shirts|pairs of trousers|starters|main courses|desserts|hats|jackets|scarves)/g)].map((m) => Number(m[1]));
      if (counts.length >= 2) {
        const product = counts.reduce((a, b) => a * b, 1);
        return verdict("counting", close(product, num(q.answer)), `product = ${product}`);
      }
    }
    let m = /code has (\d+) digits\. Each one can be 0 to 9 and they may repeat/.exec(p);
    if (m) return verdict("counting", close(10 ** Number(m[1]), num(q.answer)), `10^${m[1]}`);
    m = /code has (\d+) symbols\. Each one can be a set of (\d+) and they may repeat/.exec(p);
    if (m) return verdict("counting", close(Number(m[2]) ** Number(m[1]), num(q.answer)), `${m[2]}^${m[1]}`);
    m = /code has (\d+) digits from 0 to 9\. No digit may be repeated/.exec(p);
    if (m) {
      let v = 1;
      for (let i = 0; i < Number(m[1]); i++) v *= 10 - i;
      return verdict("counting", close(v, num(q.answer)), `permutations = ${v}`);
    }
    m = /plate has (\d+) letters followed by (\d+) digits\. Letters and digits may repeat/.exec(p);
    if (m) {
      const v = 26 ** Number(m[1]) * 10 ** Number(m[2]);
      return verdict("counting", close(v, num(q.answer)), `${v}`);
    }
  } catch { return null; }
  return null;
};

/** Sinusoid features read from y = A sin/cos(Bx) + C. */
const trigGraph: Checker = (q) => {
  if (familyOf(q) !== "trig-graph") return null;
  const m = /^y = (-?\d*)\s*(sin|cos)\((\d*)x\)(?: (\+|-) (\d+))?$/.exec(ascii(q.prompt.split("\n")[0]));
  if (!m) return null;
  const A = m[1] === "" ? 1 : m[1] === "-" ? -1 : Number(m[1]);
  const B = m[3] === "" ? 1 : Number(m[3]);
  const C = m[4] ? (m[4] === "+" ? 1 : -1) * Number(m[5]) : 0;
  const instruction = q.instruction ?? "";
  try {
    if (/amplitude/i.test(instruction)) return verdict("trig-graph", close(Math.abs(A), num(q.answer)), `|A| = ${Math.abs(A)}`);
    if (/period/i.test(instruction)) return verdict("trig-graph", close(360 / B, num(q.answer)), `period = ${360 / B}`);
    if (/maximum/i.test(instruction)) return verdict("trig-graph", close(C + Math.abs(A), num(q.answer)), `max = ${C + Math.abs(A)}`);
    if (/minimum/i.test(instruction)) return verdict("trig-graph", close(C - Math.abs(A), num(q.answer)), `min = ${C - Math.abs(A)}`);
    if (/midline/i.test(instruction)) {
      const a = /^y = (-?\d+)$/.exec(ascii(q.answer));
      return a ? verdict("trig-graph", close(Number(a[1]), C), `midline y = ${C}`) : null;
    }
  } catch { return null; }
  return null;
};

export const MORE_CHECKERS: Checker[] = [
  ...BANK3,
  slope,
  slopeIntercept,
  systems,
  vectors,
  sequences,
  seriesSum,
  exponentRules,
  trigEquation,
  evaluateAt,
  pointGeometry,
  quadraticFeatures,
  domainRange,
  exponentialGrowth,
  simpleInterest,
  similarity,
  probability,
  counting,
  trigGraph,
];
