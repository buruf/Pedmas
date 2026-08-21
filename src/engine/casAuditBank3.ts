/**
 * Third bank of CAS checkers: transformations of functions, the factor
 * theorem, derivative applications, elevation/depression trigonometry,
 * inverses, number classification, phrase translation, volume prose and
 * inequalities. Same contract as the other banks.
 */
import { evaluate } from "mathjs";
import { familyOf, num, close, toMathjs, sameExpr, type Checker } from "./casAudit";

const ascii = (s: string): string => s.replace(/−/g, "-").replace(/\s+/g, " ").trim();
const verdict = (checker: string, ok: boolean, detail: string) => ({ checked: true as const, checker, ok, detail });

/** Solve-the-inequality: boundary must balance, direction must test true. */
const inequality: Checker = (q) => {
  if (familyOf(q) !== "inequality") return null;
  const p = ascii(q.prompt.split("\n")[0]);
  const m = /^(.+?)\s*([<>])\s*(-?\d+(?:\.\d+)?)$/.exec(p);
  if (!m) return null;
  const f = (x: number) => evaluate(toMathjs(m[1]), { x }) as number;
  const rhs = Number(m[3]);
  try {
    const a = /^x\s*([<>])\s*(-?\d+(?:\.\d+)?)$/.exec(ascii(q.answer));
    if (a) {
      const c = Number(a[2]);
      const boundary = close(f(c), rhs, 1e-9); // equality at the fence
      const inside = a[1] === "<" ? c - 1 : c + 1;
      const outside = a[1] === "<" ? c + 1 : c - 1;
      const holds = m[2] === "<" ? f(inside) < rhs : f(inside) > rhs;
      const fails = m[2] === "<" ? !(f(outside) < rhs) : !(f(outside) > rhs);
      return verdict("inequality", boundary && holds && fails, `boundary f(${c})=${f(c)} vs ${rhs}`);
    }
    // Stage 5: a single value that must satisfy the inequality.
    const v = num(q.answer);
    const ok = m[2] === "<" ? f(v) < rhs : f(v) > rhs;
    return verdict("inequality", ok, `f(${v}) = ${f(v)} ${m[2]} ${rhs}?`);
  } catch {
    return null;
  }
};

/** Function transformations: describe, write, or track a point. */
const functionTransform: Checker = (q) => {
  if (familyOf(q) !== "function-transform") return null;
  const p = ascii(q.prompt);
  const answer = ascii(q.answer);
  // Describe: g(x) = f-with-modifiers  ->  the phrase must carry the right
  // direction word and the right amount.
  let m = /^g\(x\) = f\(x\) ([+-]) (\d+)\./.exec(p);
  if (m) {
    const dir = m[1] === "+" ? "up" : "down";
    return verdict("transform", new RegExp(`Shifted ${dir} ${m[2]} unit`).test(answer), `expect shift ${dir} ${m[2]}`);
  }
  m = /^g\(x\) = f\(x ([+-]) (\d+)\)\./.exec(p);
  if (m) {
    const dir = m[1] === "-" ? "right" : "left";
    return verdict("transform", new RegExp(`Shifted ${dir} ${m[2]} unit`).test(answer), `expect shift ${dir} ${m[2]}`);
  }
  if (/^g\(x\) = -f\(x\)\./.test(p)) {
    return verdict("transform", /Reflected in the x-axis/.test(answer), "expect x-axis reflection");
  }
  if (/^g\(x\) = f\(-x\)\./.test(p)) {
    return verdict("transform", /Reflected in the y-axis/.test(answer), "expect y-axis reflection");
  }
  m = /^g\(x\) = (\d+)f\(x\)\./.exec(p);
  if (m) {
    return verdict("transform", new RegExp(`([Vv]ertically stretched|[Ss]tretched vertically) by a factor of ${m[1]}`).test(answer), `expect vertical stretch ${m[1]}, got "${answer}"`);
  }
  // Write the transformed function, verified as an actual function identity.
  m = /^f\(x\) = (.+?) is shifted (right|left) (\d+) units? and (up|down) (\d+) units? to give g\(x\)/.exec(p);
  if (m) {
    const dx = (m[2] === "right" ? -1 : 1) * Number(m[3]);
    const dy = (m[4] === "up" ? 1 : -1) * Number(m[5]);
    try {
      const base = toMathjs(m[1]);
      for (const t of [1.3, -0.7, 2.9]) {
        const expected = (evaluate(base, { x: t + dx }) as number) + dy;
        const got = evaluate(toMathjs(q.answer), { x: t }) as number;
        if (!close(expected, got, 1e-9)) return verdict("transform", false, `at x=${t}: expected ${expected}, answer gives ${got}`);
      }
      return verdict("transform", true, "function identity holds");
    } catch {
      return null;
    }
  }
  // Track a point through y = f(x - h) + k.
  m = /point \((-?\d+), (-?\d+)\) lies on y = f\(x\)\. Where does it move on y = f\(x ([+-]) (\d+)\) ([+-]) (\d+)\?/.exec(p);
  if (m) {
    const x = Number(m[1]) + (m[3] === "-" ? 1 : -1) * Number(m[4]);
    const y = Number(m[2]) + (m[5] === "+" ? 1 : -1) * Number(m[6]);
    const a = /\((-?\d+), (-?\d+)\)/.exec(answer);
    if (!a) return null;
    return verdict("transform", Number(a[1]) === x && Number(a[2]) === y, `expected (${x}, ${y})`);
  }
  return null;
};

/** Factor theorem: evaluate P, find k, verify a factorization, judge yes/no. */
const factorTheorem: Checker = (q) => {
  if (familyOf(q) !== "factor-theorem") return null;
  const p = ascii(q.prompt.split("\n")[0]);
  const instruction = ascii(q.instruction ?? "");
  const pm = /^P\(x\) = (.+)$/.exec(p);
  if (!pm) return null;
  const P = pm[1];
  try {
    let m = /^Evaluate P\((-?\d+)\)\.$/.exec(instruction);
    if (m) {
      const v = evaluate(toMathjs(P), { x: Number(m[1]) }) as number;
      return verdict("factor-theorem", close(v, num(q.answer)), `P(${m[1]}) = ${v}`);
    }
    m = /^Find k so that \(x ([+-]) (\d+)\) is a factor\.$/.exec(instruction);
    if (m) {
      const root = (m[1] === "-" ? 1 : -1) * Number(m[2]);
      const v = evaluate(toMathjs(P), { x: root, k: num(q.answer) }) as number;
      return verdict("factor-theorem", close(v, 0, 1e-9), `P(${root}) with that k = ${v}`);
    }
    m = /^Given that \(x ([+-]) (\d+)\) is a factor, factor P\(x\)\.$/.exec(instruction);
    if (m) {
      return verdict("factor-theorem", sameExpr(P, q.answer), "product equals P");
    }
    m = /^Is \(x ([+-]) (\d+)\) a factor of P\(x\)\?$/.exec(instruction);
    if (m) {
      const root = (m[1] === "-" ? 1 : -1) * Number(m[2]);
      const v = evaluate(toMathjs(P), { x: root }) as number;
      const saysYes = /^Yes/.test(ascii(q.answer));
      const claim = /P\((-?\d+)\) = (-?\d+)/.exec(ascii(q.answer));
      const claimOk = claim ? close(evaluate(toMathjs(P), { x: Number(claim[1]) }) as number, Number(claim[2])) : true;
      return verdict("factor-theorem", (close(v, 0, 1e-9) === saysYes) && claimOk, `P(${root}) = ${v}, answer says ${saysYes ? "yes" : "no"}`);
    }
  } catch {
    return null;
  }
  return null;
};

/** Elevation and depression word problems, all four shapes. */
const elevation: Checker = (q) => {
  if (familyOf(q) !== "angle-apps") return null;
  const p = ascii(q.prompt);
  const rounded = /nearest tenth/.test(q.instruction ?? "") ? 0.051 : /nearest degree/.test(q.instruction ?? "") ? 0.51 : 1e-6;
  const rad = (d: number) => (d * Math.PI) / 180;
  try {
    let m = /point (\d+) (?:m|ft) from the base of a \w+, the angle of elevation of the \w+ is (\d+)°/.exec(p);
    if (m) {
      const h = Number(m[1]) * Math.tan(rad(Number(m[2])));
      return verdict("elevation", Math.abs(h - num(q.answer)) <= rounded, `height = ${h.toFixed(3)}`);
    }
    m = /point (\d+) (?:m|ft) from the base of a \w+, the angle of elevation θ of the top satisfies tan θ = \{(\d+)\/(\d+)\}/.exec(p);
    if (m) {
      const h = (Number(m[1]) * Number(m[2])) / Number(m[3]);
      return verdict("elevation", close(h, num(q.answer)), `height = ${h}`);
    }
    m = /top of a (\d+) (?:m|ft) \w+, the angle of depression of a \w+ is (\d+)°/.exec(p);
    if (m) {
      const d = Number(m[1]) / Math.tan(rad(Number(m[2])));
      return verdict("elevation", Math.abs(d - num(q.answer)) <= rounded, `distance = ${d.toFixed(3)}`);
    }
    m = /A (\d+) (?:m|ft) \w+ stands (\d+) (?:m|ft) away from an observer/.exec(p);
    if (m) {
      const deg = (Math.atan(Number(m[1]) / Number(m[2])) * 180) / Math.PI;
      return verdict("elevation", Math.abs(deg - num(q.answer)) <= rounded, `angle = ${deg.toFixed(2)}°`);
    }
  } catch {
    return null;
  }
  return null;
};

/** f^{-1}: an inverse is verified by round-tripping through f. */
const inverseFunction: Checker = (q) => {
  if (familyOf(q) !== "inverse-function") return null;
  const m = /^f\(x\) = (.+?)\. Find f\^\{-1\}\((x|\-?\d+)\)\.$/.exec(ascii(q.prompt.split("\n")[0]).replace("f^{−1}", "f^{-1}"));
  if (!m) return null;
  const f = (x: number) => evaluate(toMathjs(m[1]), { x }) as number;
  try {
    if (m[2] !== "x") {
      // Numeric: f(answer) must give back the queried value.
      const target = Number(m[2]);
      return verdict("inverse", close(f(num(q.answer)), target), `f(answer) = ${f(num(q.answer))}, want ${target}`);
    }
    for (const t of [1.7, -2.3, 4.1]) {
      const g = evaluate(toMathjs(q.answer), { x: t }) as number;
      if (!close(f(g), t, 1e-9)) return verdict("inverse", false, `f(g(${t})) = ${f(g)} ≠ ${t}`);
    }
    return verdict("inverse", true, "f∘g is the identity");
  } catch {
    return null;
  }
};

/** Derivative applications on an explicit f. */
const derivativeApps: Checker = (q) => {
  if (familyOf(q) !== "derivative-apps") return null;
  const p = ascii(q.prompt.split("\n").join(" "));
  const fm = /f\(x\) = (.+?)\./.exec(p);
  if (!fm) return null;
  const f = (x: number) => evaluate(toMathjs(fm[1]), { x }) as number;
  const fp = (x: number) => (f(x + 1e-6) - f(x - 1e-6)) / 2e-6;
  try {
    let m = /Is f increasing or decreasing at x = (-?\d+)\?/.exec(p);
    if (m) {
      const slope = fp(Number(m[1]));
      const word = slope > 0 ? "Increasing" : "Decreasing";
      return verdict("derivative-apps", ascii(q.answer).startsWith(word), `f'(${m[1]}) = ${slope.toFixed(4)}`);
    }
    m = /For what value of x is f′\(x\) = 0\?/.exec(p);
    if (m) {
      const v = fp(num(q.answer));
      return verdict("derivative-apps", Math.abs(v) < 1e-4, `f'(answer) = ${v}`);
    }
    m = /For which x is f increasing\?/.exec(p);
    if (m) {
      const a = /^x ([<>]) (-?\d+(?:\.\d+)?)$/.exec(ascii(q.answer));
      if (!a) return null;
      const c = Number(a[2]);
      const inside = a[1] === ">" ? c + 1 : c - 1;
      const outside = a[1] === ">" ? c - 1 : c + 1;
      return verdict("derivative-apps", Math.abs(fp(c)) < 1e-4 && fp(inside) > 0 && fp(outside) < 0, `f'(${c}) = ${fp(c).toFixed(5)}`);
    }
    m = /Find f′\((-?\d+)\)\./.exec(p);
    if (m) {
      const v = fp(Number(m[1]));
      return verdict("derivative-apps", close(v, num(q.answer), 1e-4), `f'(${m[1]}) = ${v.toFixed(4)}`);
    }
  } catch {
    return null;
  }
  return null;
};

/** Number classification: the chosen value must actually be in the class. */
const realNumbers: Checker = (q) => {
  if (familyOf(q) !== "real-numbers") return null;
  const instruction = ascii(q.instruction ?? "");
  const answer = ascii(q.answer);
  const irrationalForm = /sqrt\((\d+)\)|π|pi/.test(answer.replace(/−/g, "-"));
  try {
    if (/whole number/.test(instruction)) {
      const v = num(q.answer);
      return verdict("real-numbers", Number.isInteger(v) && v >= 0 && !irrationalForm, `${answer} whole?`);
    }
    if (/an integer/.test(instruction)) {
      const v = num(q.answer);
      return verdict("real-numbers", Number.isInteger(v) && !irrationalForm, `${answer} integer?`);
    }
    if (/rational number/.test(instruction)) {
      const v = num(q.answer);
      return verdict("real-numbers", Number.isFinite(v) && !irrationalForm, `${answer} rational?`);
    }
    if (/irrational/.test(instruction)) {
      const root = /sqrt\((\d+)\)/.exec(answer);
      const nonSquare = root ? !Number.isInteger(Math.sqrt(Number(root[1]))) : /π|pi/.test(answer);
      return verdict("real-numbers", nonSquare, `${answer} irrational?`);
    }
  } catch {
    return null;
  }
  return null;
};

/** Phrase-to-expression translation, verified as a function identity. */
const translate: Checker = (q) => {
  if (familyOf(q) !== "translate-expression") return null;
  const p = ascii(q.prompt.split("\n").join(" "));
  let expected: string | null = null;
  let m = /^n decreased by (\d+)$/.exec(p);
  if (m) expected = `n - ${m[1]}`;
  if (!expected && (m = /^n increased by (\d+)$/.exec(p))) expected = `n + ${m[1]}`;
  if (!expected && (m = /^(\d+) times a number n$/.exec(p))) expected = `${m[1]}n`;
  if (!expected && (m = /^(\d+) more than (\d+) times a number n$/.exec(p))) expected = `${m[2]}n + ${m[1]}`;
  if (!expected && (m = /^(\d+) less than (\d+) times a number n$/.exec(p))) expected = `${m[2]}n - ${m[1]}`;
  if (!expected && (m = /cost \$(\d+) each, plus a one-time \$(\d+) booking fee/.exec(p))) expected = `${m[1]}t + ${m[2]}`;
  if (!expected) return null;
  return verdict("translate", sameExpr(expected, q.answer), `expected ${expected}`);
};

/** Box-volume prose. */
const volume: Checker = (q) => {
  if (familyOf(q) !== "volume-surface") return null;
  const p = ascii(q.prompt);
  try {
    let m = /(\d+) rows of (\d+) unit cubes in each layer, and there are (\d+) layers/.exec(p);
    if (m) return verdict("volume", close(Number(m[1]) * Number(m[2]) * Number(m[3]), num(q.answer)), "cubes");
    m = /box is (\d+) cm long, (\d+) cm wide, and (\d+) cm tall/.exec(p);
    if (m) {
      // The same box prompt appears in both the volume and surface-area
      // skills — route by what the question asks, not by the shape.
      const [l, w, h] = [Number(m[1]), Number(m[2]), Number(m[3])];
      if (/surface area/.test(p)) return verdict("volume", close(2 * (l * w + l * h + w * h), num(q.answer)), "surface 2(lw+lh+wh)");
      if (/volume/.test(p)) return verdict("volume", close(l * w * h, num(q.answer)), "lwh");
      return null;
    }
    m = /cube has edges of (\d+) cm/.exec(p);
    if (m) {
      const e = Number(m[1]);
      if (/area of one face/.test(p)) return verdict("volume", close(e ** 2, num(q.answer)), "face e^2");
      if (/surface area/.test(p)) return verdict("volume", close(6 * e ** 2, num(q.answer)), "surface 6e^2");
      if (/volume/.test(p)) return verdict("volume", close(e ** 3, num(q.answer)), "e^3");
      return null;
    }
    m = /volume of (\d+) cm\^3\. Its base is (\d+) cm by (\d+) cm\. How tall/.exec(p);
    if (m) return verdict("volume", close(Number(m[1]) / (Number(m[2]) * Number(m[3])), num(q.answer)), "V/(ab)");
    m = /tank is (\d+) cm long, (\d+) cm wide, and filled with water to a depth of (\d+) cm/.exec(p);
    if (m) return verdict("volume", close(Number(m[1]) * Number(m[2]) * Number(m[3]), num(q.answer)), "tank");
  } catch {
    return null;
  }
  return null;
};

/** "sqrt(128) lies between which consecutive integers", and area -> side. */
const rootsProse: Checker = (q) => {
  if (familyOf(q) !== "roots") return null;
  const p = ascii(q.prompt.split("\n")[0]);
  try {
    let m = /^sqrt\((\d+)\)$/.exec(p);
    if (m && /consecutive integers/.test(q.instruction ?? "")) {
      const lo = Math.floor(Math.sqrt(Number(m[1])));
      const a = /between (\d+) and (\d+)/.exec(ascii(q.answer));
      if (!a) return null;
      return verdict("roots", Number(a[1]) === lo && Number(a[2]) === lo + 1, `between ${lo} and ${lo + 1}`);
    }
    m = /area of (\d+) square/.exec(p);
    if (m) return verdict("roots", close(Math.sqrt(Number(m[1])), num(q.answer)), `side = ${Math.sqrt(Number(m[1]))}`);
  } catch {
    return null;
  }
  return null;
};

export const BANK3: Checker[] = [
  inequality,
  functionTransform,
  factorTheorem,
  elevation,
  inverseFunction,
  derivativeApps,
  realNumbers,
  translate,
  volume,
  rootsProse,
];
