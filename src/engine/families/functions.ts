import type { GeneratorFamily, RawQuestion, Rng, SkillRef } from "../types";
import { inputQ, mcQ, mcChoices } from "./helpers";

const str = (p: Record<string, unknown>, key: string, dflt: string): string =>
  typeof p[key] === "string" ? (p[key] as string) : dflt;

function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

/** Simplified plain-text fraction answer: "3/4", "-2/5", or an integer. */
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

/** Display a possibly-negative number, wrapping negatives with a unicode minus. */
const sx = (n: number): string => (n < 0 ? `−${-n}` : String(n));

/** "+ 4" or "− 4" as an expression continuation. */
const tail = (n: number): string => (n < 0 ? `− ${-n}` : `+ ${n}`);

/** Format ax + b, e.g. "3x + 4", "x − 2", "−2x". */
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

/* -------------------------------------------------------- function-notation */
const functionNotation: GeneratorFamily = {
  stageLabel: (s, st) =>
    ["Evaluate a linear function", "Evaluate a quadratic", "Solve f(x) = k", "Piecewise functions", "Combine function values"][st - 1],
  generate(skill, stage, rng): RawQuestion {
    if (stage === 1) {
      const a = rng.int(2, 9);
      const b = nz(rng, -9, 9);
      const x = rng.int(1, 9);
      const ans = a * x + b;
      return inputQ({
        instruction: "Use function notation.",
        prompt: `f(x) = ${lin(a, b)}. Find f(${x}).`,
        answer: String(ans),
        hint: `Replace every x with ${x}, then compute.`,
        steps: [
          `Substitute: f(${x}) = ${a}(${x}) ${tail(b)}.`,
          `${a} × ${x} = ${a * x}.`,
          `${a * x} ${tail(b)} = ${ans}.`,
        ],
        concept: "f(x) is the output of f at the input x.",
        verify: () => ans - b === a * x,
      });
    }
    if (stage === 2) {
      const a = rng.int(1, 3);
      const b = nz(rng, -5, 5);
      const c = nz(rng, -9, 9);
      const x = nz(rng, -4, 4);
      const ans = a * x * x + b * x + c;
      return inputQ({
        instruction: "Evaluate the function.",
        prompt: `f(x) = ${quad(a, b, c)}. Find f(${sx(x)}).`,
        answer: String(ans),
        hint: `Substitute ${sx(x)} for x, squaring first.`,
        steps: [
          `(${sx(x)})^2 = ${x * x}.`,
          `${a} × ${x * x} = ${a * x * x} and ${sx(b)} × ${sx(x)} = ${sx(b * x)}.`,
          `${a * x * x} ${tail(b * x)} ${tail(c)} = ${ans}.`,
        ],
        concept: "Substitute the input everywhere x appears, powers first.",
        verify: () => ans - c - b * x === a * x * x,
      });
    }
    if (stage === 3) {
      const a = rng.int(2, 9);
      const x0 = nz(rng, -6, 9);
      const b = nz(rng, -9, 9);
      const k = a * x0 + b;
      return inputQ({
        instruction: "Find the input that gives the output.",
        prompt: `f(x) = ${lin(a, b)}. Find x so that f(x) = ${sx(k)}.`,
        answer: String(x0),
        hint: `Set ${lin(a, b)} equal to ${sx(k)} and solve for x.`,
        steps: [
          `${lin(a, b)} = ${sx(k)}.`,
          `${a}x = ${sx(k)} − (${sx(b)}) = ${sx(k - b)}.`,
          `x = ${sx(k - b)} ÷ ${a} = ${sx(x0)}.`,
        ],
        concept: "Solving f(x) = k works backward from output to input.",
        verify: () => a * x0 + b === k,
      });
    }
    if (stage === 4) {
      const k = rng.int(0, 5);
      const p = rng.int(1, 9);
      const q = rng.int(2, 5);
      const below = rng.chance(0.5);
      const xe = below ? k - rng.int(1, 4) : k + rng.int(0, 4);
      const ans = xe < k ? xe + p : q * xe;
      return inputQ({
        instruction: "Evaluate the piecewise function.",
        prompt: `f(x) = x + ${p} when x < ${k}, and f(x) = ${q}x when x ≥ ${k}. Find f(${sx(xe)}).`,
        answer: String(ans),
        hint: `First decide which rule ${sx(xe)} falls under.`,
        steps: [
          `${sx(xe)} ${xe < k ? "<" : "≥"} ${k}, so use f(x) = ${xe < k ? `x + ${p}` : `${q}x`}.`,
          `f(${sx(xe)}) = ${xe < k ? `${sx(xe)} + ${p}` : `${q} × ${sx(xe)}`} = ${sx(ans)}.`,
        ],
        concept: "A piecewise function picks its rule from where the input lives.",
        verify: () => (xe < k ? ans - p === xe : ans === q * xe),
      });
    }
    const a = rng.int(2, 6);
    const b = nz(rng, -9, 9);
    const x1 = rng.int(1, 6);
    let x2 = rng.int(1, 6);
    while (x2 === x1) x2 = rng.int(1, 6);
    const add = rng.chance(0.5);
    const f1 = a * x1 + b;
    const f2 = a * x2 + b;
    const ans = add ? f1 + f2 : f1 - f2;
    return inputQ({
      instruction: "Combine function values.",
      prompt: `f(x) = ${lin(a, b)}. Find f(${x1}) ${add ? "+" : "−"} f(${x2}).`,
      answer: String(ans),
      hint: `Evaluate f(${x1}) and f(${x2}) separately first.`,
      steps: [
        `f(${x1}) = ${a}(${x1}) ${tail(b)} = ${sx(f1)}.`,
        `f(${x2}) = ${a}(${x2}) ${tail(b)} = ${sx(f2)}.`,
        `${sx(f1)} ${add ? "+" : "−"} (${sx(f2)}) = ${sx(ans)}.`,
      ],
      concept: "Function values are numbers — combine them like any numbers.",
      verify: () => (add ? ans - f2 === f1 : ans + f2 === f1),
    });
  },
};

/* ------------------------------------------------------------- domain-range */
const domainRange: GeneratorFamily = {
  stageLabel: (s, st) =>
    ["Polynomials: all reals", "Division restrictions", "Square-root domains", "Ranges of parabolas", "Domain and range mixed"][st - 1],
  generate(skill, stage, rng): RawQuestion {
    if (stage === 1) {
      const a = rng.int(1, 3);
      const b = nz(rng, -5, 5);
      const c = nz(rng, -9, 9);
      const fdisp = rng.chance(0.5) ? lin(rng.int(2, 9), b) : quad(a, b, c);
      const ans = "All real numbers";
      return mcQ({
        instruction: "Find the domain of the function.",
        prompt: `f(x) = ${fdisp}`,
        choices: mcChoices(rng, ans, ["x ≥ 0", "x ≠ 0", "x > 0"]),
        answer: ans,
        hint: "Is there any input that breaks this formula?",
        steps: [
          "Polynomials involve only multiplication and addition.",
          "Every real input produces a real output, so the domain is all real numbers.",
        ],
        concept: "Polynomials have no forbidden inputs.",
      });
    }
    if (stage === 2) {
      const a = rng.int(2, 9);
      let c = rng.int(1, 9);
      while (c === a) c = rng.int(1, 9);
      const ans = `x ≠ ${a}`;
      return mcQ({
        instruction: "Find the domain of the function.",
        prompt: `f(x) = {${c}/x − ${a}}`,
        choices: mcChoices(rng, ans, [`x ≠ ${c}`, `x = ${a}`, "All real numbers"]),
        answer: ans,
        hint: "A denominator is never allowed to be zero.",
        steps: [
          `The denominator x − ${a} equals 0 when x = ${a}.`,
          `Division by zero is undefined, so x = ${a} must be excluded.`,
          `Domain: all real numbers with x ≠ ${a}.`,
        ],
        concept: "Exclude inputs that make a denominator zero.",
        verify: () => a - a === 0 && c !== 0,
      });
    }
    if (stage === 3) {
      const a = rng.int(1, 9);
      const ans = `x ≥ ${a}`;
      return mcQ({
        instruction: "Find the domain of the function.",
        prompt: `f(x) = sqrt(x − ${a})`,
        choices: mcChoices(rng, ans, [`x ≤ ${a}`, `x > ${a}`, "All real numbers"]),
        answer: ans,
        hint: "What is under the root sign must not be negative.",
        steps: [
          `Require x − ${a} ≥ 0.`,
          `Add ${a} to both sides: x ≥ ${a}.`,
        ],
        concept: "Square roots need a non-negative radicand.",
        verify: () => a - a >= 0 && a - 1 - a < 0,
      });
    }
    if (stage === 4) {
      const h = nz(rng, -6, 6);
      let k = nz(rng, -9, 9);
      while (k === h) k = nz(rng, -9, 9);
      const up = rng.chance(0.5);
      const ans = up ? `y ≥ ${sx(k)}` : `y ≤ ${sx(k)}`;
      const wrong = up ? `y ≤ ${sx(k)}` : `y ≥ ${sx(k)}`;
      return mcQ({
        instruction: "Find the range of the function.",
        prompt: `f(x) = ${up ? "" : "−"}(x ${tail(-h)})^2 ${tail(k)}`,
        choices: mcChoices(rng, ans, [wrong, `y ≥ ${sx(h)}`, "All real numbers"]),
        answer: ans,
        hint: `The vertex is at (${sx(h)}, ${sx(k)}). Does the parabola open up or down?`,
        steps: [
          `The squared term is ${up ? "at least" : "at most"} 0, so f(x) is ${up ? "smallest" : "largest"} at x = ${sx(h)}.`,
          `The ${up ? "minimum" : "maximum"} value is f(${sx(h)}) = ${sx(k)}.`,
          `Range: ${ans}.`,
        ],
        concept: "A parabola's range starts at its vertex output.",
        verify: () => {
          const f = (x: number) => (up ? 1 : -1) * (x - h) ** 2 + k;
          return f(h) === k && (up ? f(h + 1) > k : f(h + 1) < k);
        },
      });
    }
    if (rng.chance(0.5)) {
      const b = rng.pick([2, 3]);
      const c = nz(rng, -9, 9);
      const ans = `y > ${sx(c)}`;
      return mcQ({
        instruction: "Find the range of the function.",
        prompt: `f(x) = ${b}^x ${tail(c)}`,
        choices: mcChoices(rng, ans, [`y ≥ ${sx(c)}`, `y < ${sx(c)}`, "All real numbers"]),
        answer: ans,
        hint: `${b}^x is always positive but never 0.`,
        steps: [
          `${b}^x takes every positive value and only positive values.`,
          `Adding ${sx(c)} shifts those outputs: y > ${sx(c)}.`,
          `The line y = ${sx(c)} is an asymptote — never reached.`,
        ],
        concept: "Exponential outputs stay above their horizontal asymptote.",
        verify: () => b ** -10 > 0 && b ** -10 + c > c,
      });
    }
    const a = rng.int(1, 9);
    const ans = `x ≤ ${a}`;
    return mcQ({
      instruction: "Find the domain of the function.",
      prompt: `f(x) = sqrt(${a} − x)`,
      choices: mcChoices(rng, ans, [`x ≥ ${a}`, `x < ${a}`, "All real numbers"]),
      answer: ans,
      hint: `Require ${a} − x ≥ 0 — watch the direction when you solve.`,
      steps: [
        `Require ${a} − x ≥ 0.`,
        `Add x to both sides: ${a} ≥ x, i.e. x ≤ ${a}.`,
      ],
      concept: "Solving −x flips the inequality direction.",
      verify: () => a - a >= 0 && a - (a + 1) < 0,
    });
  },
};

/* ------------------------------------------------------- function-transform */
const functionTransform: GeneratorFamily = {
  stageLabel: (s, st) =>
    ["Vertical shifts", "Horizontal shifts", "Stretches and reflections", "Build the new formula", "Points under transformations"][st - 1],
  generate(skill, stage, rng): RawQuestion {
    if (stage === 1) {
      const k = nz(rng, -9, 9);
      const m = Math.abs(k);
      const ans = `Shifted ${k > 0 ? "up" : "down"} ${m} units`;
      return mcQ({
        instruction: "Describe the transformation.",
        prompt: `g(x) = f(x) ${tail(k)}. How does the graph of g compare with the graph of f?`,
        choices: mcChoices(rng, ans, [
          `Shifted ${k > 0 ? "down" : "up"} ${m} units`,
          `Shifted right ${m} units`,
          `Stretched vertically by a factor of ${m + 1}`,
        ]),
        answer: ans,
        hint: "Adding to the OUTPUT moves the graph vertically.",
        steps: [
          `Every output f(x) has ${sx(k)} added to it.`,
          `Each point moves ${k > 0 ? "up" : "down"} by ${m}, so the whole graph shifts ${k > 0 ? "up" : "down"} ${m} units.`,
        ],
        concept: "f(x) + k slides the graph vertically by k.",
      });
    }
    if (stage === 2) {
      const h = rng.int(2, 9);
      const right = rng.chance(0.5);
      const ans = `Shifted ${right ? "right" : "left"} ${h} units`;
      return mcQ({
        instruction: "Describe the transformation.",
        prompt: `g(x) = f(x ${right ? "−" : "+"} ${h}). How does the graph of g compare with the graph of f?`,
        choices: mcChoices(rng, ans, [
          `Shifted ${right ? "left" : "right"} ${h} units`,
          `Shifted up ${h} units`,
          `Shifted down ${h} units`,
        ]),
        answer: ans,
        hint: "Changing the INPUT moves the graph horizontally — in the opposite direction of the sign.",
        steps: [
          `g needs an input ${h} ${right ? "larger" : "smaller"} than f to produce the same output.`,
          `So the graph moves ${right ? "right" : "left"} by ${h} units — opposite to the sign inside.`,
        ],
        concept: "f(x − h) shifts right h; f(x + h) shifts left h.",
      });
    }
    if (stage === 3) {
      if (rng.chance(0.5)) {
        const a = rng.int(2, 5);
        const ans = `Vertically stretched by a factor of ${a}`;
        return mcQ({
          instruction: "Describe the transformation.",
          prompt: `g(x) = ${a}f(x). How does the graph of g compare with the graph of f?`,
          choices: mcChoices(rng, ans, [
            `Vertically compressed by a factor of ${a}`,
            `Shifted up ${a} units`,
            `Shifted right ${a} units`,
          ]),
          answer: ans,
          hint: "Every output is multiplied — heights scale.",
          steps: [
            `Each output f(x) is multiplied by ${a}.`,
            `Heights grow by a factor of ${a}: a vertical stretch.`,
          ],
          concept: "a·f(x) with a > 1 stretches the graph vertically.",
        });
      }
      const ans = "Reflected in the x-axis";
      return mcQ({
        instruction: "Describe the transformation.",
        prompt: `g(x) = −f(x). How does the graph of g compare with the graph of f?`,
        choices: mcChoices(rng, ans, [
          "Reflected in the y-axis",
          "Shifted down 1 unit",
          "Vertically stretched by a factor of 2",
        ]),
        answer: ans,
        hint: "Every output changes sign.",
        steps: [
          "Each output f(x) becomes −f(x): positive heights flip below the axis and vice versa.",
          "That is a reflection in the x-axis.",
        ],
        concept: "−f(x) flips the graph over the x-axis.",
      });
    }
    if (stage === 4) {
      const h = rng.int(1, 6);
      const k = rng.int(1, 9);
      const ans = `(x − ${h})^2 + ${k}`;
      return mcQ({
        instruction: "Write the transformed function.",
        prompt: `f(x) = x^2 is shifted right ${h} units and up ${k} units to give g(x). Find g(x).`,
        choices: mcChoices(rng, ans, [
          `(x + ${h})^2 + ${k}`,
          `(x − ${h})^2 − ${k}`,
          `(x − ${k})^2 + ${h}`,
        ]),
        answer: ans,
        hint: "Right h means (x − h); up k means + k outside.",
        steps: [
          `Shift right ${h}: replace x with x − ${h}, giving (x − ${h})^2.`,
          `Shift up ${k}: add ${k} outside, giving (x − ${h})^2 + ${k}.`,
        ],
        concept: "Inside changes move horizontally; outside changes move vertically.",
        verify: () => (h - h) ** 2 + k === k && (h + 1 - h) ** 2 + k > k,
      });
    }
    const p = rng.int(-5, 5);
    const q = rng.int(-5, 5);
    const h = rng.int(1, 6);
    const k = rng.int(1, 9);
    const ans = `(${sx(p + h)}, ${sx(q + k)})`;
    return mcQ({
      instruction: "Track a point through the transformation.",
      prompt: `The point (${sx(p)}, ${sx(q)}) lies on y = f(x). Where does it move on y = f(x − ${h}) + ${k}?`,
      choices: mcChoices(rng, ans, [
        `(${sx(p - h)}, ${sx(q + k)})`,
        `(${sx(p + h)}, ${sx(q - k)})`,
        `(${sx(p + k)}, ${sx(q + h)})`,
      ]),
      answer: ans,
      hint: `The graph shifts right ${h} and up ${k} — the point rides along.`,
      steps: [
        `f(x − ${h}) shifts the graph right ${h}: x-coordinate ${sx(p)} → ${sx(p + h)}.`,
        `+ ${k} shifts it up ${k}: y-coordinate ${sx(q)} → ${sx(q + k)}.`,
        `New point: (${sx(p + h)}, ${sx(q + k)}).`,
      ],
      concept: "Transformations move every point of the graph the same way.",
      verify: () => p + h - h === p && q + k - k === q,
    });
  },
};

/* -------------------------------------------------------------- composition */
const composition: GeneratorFamily = {
  stageLabel: (s, st) =>
    ["Evaluate f(g(a))", "Evaluate g(f(a))", "Compose linear functions", "Compose with squares", "Nested evaluation"][st - 1],
  generate(skill, stage, rng): RawQuestion {
    const a = rng.int(2, 5);
    const b = rng.int(1, 9);
    const c = rng.int(2, 5);
    const d = rng.int(1, 9);
    if (stage === 1) {
      const x0 = rng.int(1, 5);
      const inner = c * x0 + d;
      const ans = a * inner + b;
      return inputQ({
        instruction: "Work from the inside out.",
        prompt: `f(x) = ${lin(a, b)} and g(x) = ${lin(c, d)}. Find f(g(${x0})).`,
        answer: String(ans),
        hint: `First find g(${x0}), then feed that result into f.`,
        steps: [
          `g(${x0}) = ${c}(${x0}) + ${d} = ${inner}.`,
          `f(${inner}) = ${a}(${inner}) + ${b} = ${ans}.`,
        ],
        concept: "Composition feeds one function's output into another.",
        verify: () => (ans - b) / a === inner && (inner - d) / c === x0,
      });
    }
    if (stage === 2) {
      const x0 = rng.int(1, 4);
      const e = rng.int(1, 9);
      const inner = a * x0 + b;
      const ans = inner * inner + e;
      return inputQ({
        instruction: "Work from the inside out.",
        prompt: `f(x) = ${lin(a, b)} and g(x) = x^2 + ${e}. Find g(f(${x0})).`,
        answer: String(ans),
        hint: `Find f(${x0}) first, then square it and add ${e}.`,
        steps: [
          `f(${x0}) = ${a}(${x0}) + ${b} = ${inner}.`,
          `g(${inner}) = ${inner}^2 + ${e} = ${inner * inner} + ${e} = ${ans}.`,
        ],
        concept: "The inner function runs first; its output becomes the new input.",
        verify: () => ans - e === inner * inner,
      });
    }
    if (stage === 3) {
      let cc = c;
      while (cc === a) cc = rng.int(2, 5);
      const coef = a * cc;
      const con = a * d + b;
      const ans = `${coef}x + ${con}`;
      return mcQ({
        instruction: "Find the composed function.",
        prompt: `f(x) = ${lin(a, b)} and g(x) = ${lin(cc, d)}. Find f(g(x)).`,
        choices: mcChoices(rng, ans, [
          `${coef}x + ${cc * b + d}`,
          `${a + cc}x + ${b + d}`,
          `${coef}x + ${a * d}`,
        ]),
        answer: ans,
        hint: `Substitute all of g(x) in place of x inside f.`,
        steps: [
          `f(g(x)) = ${a}(${lin(cc, d)}) + ${b}.`,
          `Distribute: ${coef}x + ${a * d} + ${b}.`,
          `Combine constants: ${coef}x + ${con}.`,
        ],
        concept: "Composing substitutes a whole expression for x.",
        verify: () => coef * 2 + con === a * (cc * 2 + d) + b,
      });
    }
    if (stage === 4) {
      const ans = `x^2 + ${2 * b}x + ${b * b}`;
      return mcQ({
        instruction: "Find the composed function.",
        prompt: `f(x) = x^2 and g(x) = x + ${b}. Find f(g(x)).`,
        choices: mcChoices(rng, ans, [
          `x^2 + ${b * b}`,
          `x^2 + ${b}`,
          `x^2 + ${b}x + ${b * b}`,
        ]),
        answer: ans,
        hint: `f(g(x)) = (x + ${b})^2 — expand it fully.`,
        steps: [
          `f(g(x)) = (x + ${b})^2.`,
          `(x + ${b})^2 = x^2 + 2(${b})x + ${b}^2.`,
          `= x^2 + ${2 * b}x + ${b * b}.`,
        ],
        concept: "(x + b)^2 has a middle term — never just x^2 + b^2.",
        verify: () => (3 + b) ** 2 === 9 + 2 * b * 3 + b * b,
      });
    }
    const x0 = rng.int(1, 4);
    const f1 = a * x0 + b;
    const ans = a * f1 + b;
    return inputQ({
      instruction: "Apply the function twice.",
      prompt: `f(x) = ${lin(a, b)}. Find f(f(${x0})).`,
      answer: String(ans),
      hint: `Compute f(${x0}) first, then apply f to that answer.`,
      steps: [
        `f(${x0}) = ${a}(${x0}) + ${b} = ${f1}.`,
        `f(${f1}) = ${a}(${f1}) + ${b} = ${ans}.`,
      ],
      concept: "f(f(x)) composes a function with itself.",
      verify: () => (ans - b) / a === f1 && (f1 - b) / a === x0,
    });
  },
};

/* ---------------------------------------------------------- inverse-function */
const inverseFunction: GeneratorFamily = {
  stageLabel: (s, st) =>
    ["Undo a shift", "Undo a multiplication", "Invert ax + b", "Evaluate an inverse", "Inverses and composition"][st - 1],
  generate(skill, stage, rng): RawQuestion {
    if (stage === 1) {
      const b = rng.int(2, 9);
      const ans = `x − ${b}`;
      return mcQ({
        instruction: "Find the inverse function.",
        prompt: `f(x) = x + ${b}. Find f^{−1}(x).`,
        choices: mcChoices(rng, ans, [`x + ${b}`, `${b} − x`, `−x − ${b}`]),
        answer: ans,
        hint: `f adds ${b}. What operation undoes that?`,
        steps: [
          `f adds ${b} to its input.`,
          `The inverse must undo that: subtract ${b}.`,
          `f^{−1}(x) = x − ${b}.`,
        ],
        concept: "An inverse function reverses each operation.",
        verify: () => 7 + b - b === 7,
      });
    }
    if (stage === 2) {
      const a = rng.int(2, 9);
      const ans = `{x/${a}}`;
      return mcQ({
        instruction: "Find the inverse function.",
        prompt: `f(x) = ${a}x. Find f^{−1}(x).`,
        choices: mcChoices(rng, ans, [`${a}x`, `{${a}/x}`, `x − ${a}`]),
        answer: ans,
        hint: `f multiplies by ${a}. What undoes multiplication?`,
        steps: [
          `f multiplies its input by ${a}.`,
          `The inverse divides by ${a}: f^{−1}(x) = {x/${a}}.`,
        ],
        concept: "Multiplication is undone by division.",
        verify: () => (a * 6) / a === 6,
      });
    }
    if (stage === 3) {
      const a = rng.int(2, 6);
      const b = rng.int(1, 9);
      const ans = `{x − ${b}/${a}}`;
      return mcQ({
        instruction: "Find the inverse function.",
        prompt: `f(x) = ${lin(a, b)}. Find f^{−1}(x).`,
        choices: mcChoices(rng, ans, [
          `{x + ${b}/${a}}`,
          `{x/${a}} − ${b}`,
          `${a}x − ${b}`,
        ]),
        answer: ans,
        hint: `f multiplies by ${a} then adds ${b} — undo in reverse order.`,
        steps: [
          `Write y = ${lin(a, b)} and swap x and y: x = ${a}y + ${b}.`,
          `Subtract ${b}: x − ${b} = ${a}y.`,
          `Divide by ${a}: y = {x − ${b}/${a}}.`,
        ],
        concept: "Invert by undoing the last operation first.",
        verify: () => (a * 5 + b - b) / a === 5,
      });
    }
    if (stage === 4) {
      const a = rng.int(2, 6);
      const b = nz(rng, -9, 9);
      const k = rng.int(1, 8);
      const cv = a * k + b;
      return inputQ({
        instruction: "Evaluate the inverse.",
        prompt: `f(x) = ${lin(a, b)}. Find f^{−1}(${sx(cv)}).`,
        answer: String(k),
        hint: `f^{−1}(${sx(cv)}) is the input x with f(x) = ${sx(cv)}.`,
        steps: [
          `Solve ${lin(a, b)} = ${sx(cv)}.`,
          `${a}x = ${sx(cv - b)}, so x = ${k}.`,
          `Check: f(${k}) = ${sx(cv)}. ✓`,
        ],
        concept: "f⁻¹ of an output returns the original input.",
        verify: () => a * k + b === cv,
      });
    }
    if (rng.chance(0.5)) {
      const m = rng.int(2, 40);
      return inputQ({
        instruction: "Use the key inverse property.",
        prompt: `For an invertible function f, find f(f^{−1}(${m})).`,
        answer: String(m),
        hint: "Applying f after f⁻¹ undoes both.",
        steps: [
          `f^{−1}(${m}) is the input that f sends to ${m}.`,
          `Applying f to it lands right back on ${m}.`,
        ],
        concept: "f(f⁻¹(x)) = x for every x in the range of f.",
        verify: () => m === m,
      });
    }
    const a = rng.int(2, 6);
    const b = rng.int(1, 9);
    const ans = `${a}x + ${b}`;
    return mcQ({
      instruction: "Find the inverse function.",
      prompt: `f(x) = {x − ${b}/${a}}. Find f^{−1}(x).`,
      choices: mcChoices(rng, ans, [
        `${a}x − ${b}`,
        `{x + ${b}/${a}}`,
        `{${a}/x − ${b}}`,
      ]),
      answer: ans,
      hint: `f subtracts ${b} then divides by ${a} — the inverse reverses both, in reverse order.`,
      steps: [
        `f subtracts ${b}, then divides by ${a}.`,
        `The inverse multiplies by ${a} first, then adds ${b}.`,
        `f^{−1}(x) = ${a}x + ${b}.`,
      ],
      concept: "Inverting swaps the operations and their order.",
      verify: () => a * ((a * 4 + b - b) / a) + b === a * 4 + b,
    });
  },
};

/* -------------------------------------------------------------- exponential */
function expSolve(stage: number, rng: Rng): RawQuestion {
  if (stage <= 2) {
    const base = rng.pick(stage === 1 ? [2, 3, 5, 10] : [2, 3, 5]);
    const maxN = stage === 1 ? 3 : base === 2 ? 8 : base === 3 ? 5 : 4;
    const n = rng.int(stage === 1 ? 2 : 3, maxN);
    const v = base ** n;
    return inputQ({
      instruction: "Solve for x.",
      prompt: `${base}^x = ${v}`,
      answer: String(n),
      hint: `Write ${v} as a power of ${base}.`,
      steps: [
        `${v} = ${base}^${n}.`,
        `${base}^x = ${base}^${n}, so x = ${n}.`,
      ],
      concept: "Matching bases lets you match exponents.",
      verify: () => base ** n === v,
    });
  }
  if (stage === 3) {
    const base = rng.pick([2, 3, 5]);
    const n = rng.int(2, base === 2 ? 6 : 4);
    const cc = rng.int(1, 3);
    const v = base ** n;
    return inputQ({
      instruction: "Solve for x.",
      prompt: `${base}^{x + ${cc}} = ${v}`,
      answer: String(n - cc),
      hint: `Write ${v} as a power of ${base}, then match exponents.`,
      steps: [
        `${v} = ${base}^${n}.`,
        `So x + ${cc} = ${n}.`,
        `x = ${n} − ${cc} = ${sx(n - cc)}.`,
      ],
      concept: "Equal bases mean the whole exponents are equal.",
      verify: () => base ** (n - cc + cc) === v,
    });
  }
  if (stage === 4) {
    const aa = rng.int(2, 5);
    const base = rng.pick([2, 3]);
    const n = rng.int(2, base === 2 ? 5 : 4);
    const v = aa * base ** n;
    return inputQ({
      instruction: "Solve for x.",
      prompt: `${aa} · ${base}^x = ${v}`,
      answer: String(n),
      hint: `Divide both sides by ${aa} first.`,
      steps: [
        `${base}^x = ${v} ÷ ${aa} = ${base ** n}.`,
        `${base ** n} = ${base}^${n}, so x = ${n}.`,
      ],
      concept: "Isolate the power before matching exponents.",
      verify: () => aa * base ** n === v,
    });
  }
  const base = rng.pick([2, 3, 5]);
  const n = rng.int(1, base === 2 ? 4 : 3);
  const v = base ** n;
  return inputQ({
    instruction: "Solve for x.",
    prompt: `${base}^x = {1/${v}}`,
    answer: String(-n),
    hint: `{1/${v}} is ${base} to a negative power.`,
    steps: [
      `{1/${v}} = {1/${base}^${n}} = ${base}^{−${n}}.`,
      `So x = −${n}.`,
    ],
    concept: "Reciprocals of powers are negative exponents.",
    verify: () => Math.abs(base ** -n - 1 / v) < 1e-12,
  });
}

function expGrowth(stage: number, rng: Rng): RawQuestion {
  if (stage === 1) {
    const p0 = rng.int(3, 9) * 5;
    const t = rng.int(2, 4);
    const ans = p0 * 2 ** t;
    return inputQ({
      instruction: "Solve the growth problem.",
      prompt: `A bacteria culture starts with ${p0} cells and doubles every hour. How many cells after ${t} hours?`,
      answer: String(ans),
      hint: `Double ${p0}, ${t} times in a row.`,
      steps: [
        `Each hour multiplies the count by 2.`,
        `After ${t} hours: ${p0} × 2^${t} = ${p0} × ${2 ** t} = ${ans}.`,
      ],
      concept: "Repeated doubling is multiplication by a power of 2.",
      verify: () => ans / 2 ** t === p0,
    });
  }
  if (stage === 2) {
    const t = rng.int(2, 4);
    const end = rng.int(2, 9);
    const start = end * 2 ** t;
    return inputQ({
      instruction: "Solve the decay problem.",
      prompt: `A sample of ${start} g halves every day. How many grams remain after ${t} days?`,
      answer: String(end),
      hint: `Halve ${start}, ${t} times.`,
      steps: [
        `Each day multiplies the amount by {1/2}.`,
        `After ${t} days: ${start} ÷ 2^${t} = ${start} ÷ ${2 ** t} = ${end}.`,
      ],
      concept: "Repeated halving divides by a power of 2.",
      verify: () => end * 2 ** t === start,
    });
  }
  if (stage === 3) {
    const p0 = rng.int(2, 9);
    const t = rng.int(2, 3);
    const ans = p0 * 3 ** t;
    return inputQ({
      instruction: "Solve the growth problem.",
      prompt: `A population starts at ${p0} and triples every year. What is the population after ${t} years?`,
      answer: String(ans),
      hint: `Multiply by 3, ${t} times.`,
      steps: [
        `Growth factor 3 per year for ${t} years: 3^${t} = ${3 ** t}.`,
        `${p0} × ${3 ** t} = ${ans}.`,
      ],
      concept: "A constant growth factor compounds as a power.",
      verify: () => ans / 3 ** t === p0,
    });
  }
  if (stage === 4) {
    const k = rng.int(2, 4);
    const m = rng.int(2, 4);
    const p0 = rng.int(2, 9) * 5;
    const ans = p0 * 2 ** m;
    return inputQ({
      instruction: "Solve the growth problem.",
      prompt: `An investment of $${p0} doubles every ${k} years. What is it worth after ${k * m} years?`,
      answer: String(ans),
      hint: `How many doubling periods fit into ${k * m} years?`,
      steps: [
        `${k * m} ÷ ${k} = ${m} doubling periods.`,
        `${p0} × 2^${m} = ${p0} × ${2 ** m} = ${ans}.`,
      ],
      concept: "Count doubling periods, not years, before applying the power.",
      verify: () => ans / p0 === 2 ** m,
    });
  }
  const p0 = rng.int(2, 5);
  const t = rng.int(3, 6);
  const target = p0 * 2 ** t;
  return inputQ({
    instruction: "Find the time.",
    prompt: `A colony starts at ${p0} and doubles every day. After how many days does it reach ${target}?`,
    answer: String(t),
    hint: `How many doublings turn ${p0} into ${target}?`,
    steps: [
      `${target} ÷ ${p0} = ${2 ** t} = 2^${t}.`,
      `${t} doublings are needed, so ${t} days.`,
    ],
    concept: "Solving for time means counting growth factors.",
    verify: () => p0 * 2 ** t === target,
  });
}

function expGraph(stage: number, rng: Rng): RawQuestion {
  const a = rng.int(2, 9);
  const b = rng.pick([2, 3, 5]);
  if (stage === 1) {
    return inputQ({
      instruction: "Read the graph's key point.",
      prompt: `What is the y-intercept of y = ${a} · ${b}^x? Give the y-value.`,
      answer: String(a),
      hint: "The y-intercept is the value at x = 0.",
      steps: [
        `At x = 0: ${b}^0 = 1.`,
        `y = ${a} × 1 = ${a}.`,
      ],
      concept: "For y = a·bˣ the y-intercept is a.",
      verify: () => a * b ** 0 === a,
    });
  }
  if (stage === 2) {
    return inputQ({
      instruction: "Evaluate on the curve.",
      prompt: `y = ${a} · ${b}^x. Find y when x = 1.`,
      answer: String(a * b),
      hint: `${b}^1 = ${b}.`,
      steps: [
        `${b}^1 = ${b}.`,
        `y = ${a} × ${b} = ${a * b}.`,
      ],
      concept: "Each unit step in x multiplies y by the base.",
      verify: () => (a * b) / b === a,
    });
  }
  if (stage === 3) {
    const growth = rng.chance(0.5);
    const base = growth ? rng.pick(["2", "3", "1.5"]) : rng.pick(["0.5", "0.8", "0.25"]);
    const ans = growth ? "Growth" : "Decay";
    return mcQ({
      instruction: "Classify the function.",
      prompt: `Is y = ${a} · (${base})^x exponential growth or decay?`,
      choices: mcChoices(rng, ans, [growth ? "Decay" : "Growth", "Constant", "Linear"]),
      answer: ans,
      hint: "Compare the base with 1.",
      steps: [
        `The base is ${base}, which is ${growth ? "greater than" : "between 0 and"} 1.`,
        `Each step multiplies y by ${base}, so y ${growth ? "grows" : "shrinks"}: ${ans.toLowerCase()}.`,
      ],
      concept: "Base > 1 grows; base between 0 and 1 decays.",
      verify: () => (Number(base) > 1) === growth,
    });
  }
  if (stage === 4) {
    const c = nz(rng, -9, 9);
    const ans = `y = ${sx(c)}`;
    return mcQ({
      instruction: "Find the horizontal asymptote.",
      prompt: `y = ${a} · ${b}^x ${tail(c)}`,
      choices: mcChoices(rng, ans, [`y = ${a}`, `x = ${sx(c)}`, "y = 0"]),
      answer: ans,
      hint: `What does ${a} · ${b}^x approach as x becomes very negative?`,
      steps: [
        `As x → −∞, ${b}^x → 0, so ${a} · ${b}^x → 0.`,
        `y approaches 0 ${tail(c)} = ${sx(c)}: asymptote y = ${sx(c)}.`,
      ],
      concept: "The vertical shift sets the horizontal asymptote.",
      verify: () => Math.abs(a * b ** -20 + c - c) < 1e-3,
    });
  }
  let bb = b;
  while (bb === a) bb = rng.pick([2, 3, 5]);
  const ans = `y = ${a} · ${bb}^x`;
  return mcQ({
    instruction: "Match the equation to the points.",
    prompt: `An exponential function passes through (0, ${a}) and (1, ${a * bb}). Find its equation.`,
    choices: mcChoices(rng, ans, [
      `y = ${bb} · ${a}^x`,
      `y = ${a}x + ${bb}`,
      `y = ${a * bb}^x`,
    ]),
    answer: ans,
    hint: "The value at 0 gives the coefficient; the jump to x = 1 gives the base.",
    steps: [
      `At x = 0 the value is the coefficient: a = ${a}.`,
      `From x = 0 to 1, y multiplies by ${a * bb} ÷ ${a} = ${bb}: the base is ${bb}.`,
      `y = ${a} · ${bb}^x.`,
    ],
    concept: "Two points pin down an exponential's coefficient and base.",
    verify: () => a * bb ** 0 === a && a * bb ** 1 === a * bb,
  });
}

const exponential: GeneratorFamily = {
  stageLabel(skill: SkillRef, st: number) {
    const kind = str(skill.params, "kind", "mixed");
    const labels: Record<string, string[]> = {
      solve: ["Powers of small bases", "Larger powers", "Shifted exponents", "With a coefficient", "Negative exponents"],
      "growth-decay": ["Doubling", "Halving", "Other growth factors", "Doubling periods", "Reaching a target"],
      graph: ["y-intercepts", "Evaluate at x = 1", "Growth or decay", "Asymptotes", "Match the equation"],
    };
    return (labels[kind] ?? ["Exponential basics", "Evaluate", "Solve equations", "Growth and decay", "Applications"])[st - 1];
  },
  generate(skill, stage, rng): RawQuestion {
    let kind = str(skill.params, "kind", "mixed");
    if (kind === "mixed") kind = rng.pick(["solve", "growth-decay", "graph"]);
    if (kind === "solve") return expSolve(stage, rng);
    if (kind === "graph") return expGraph(stage, rng);
    return expGrowth(stage, rng);
  },
};

/* ---------------------------------------------------------------- logarithm */
function logEval(stage: number, rng: Rng): RawQuestion {
  if (stage === 1) {
    const n = rng.int(1, 4);
    return inputQ({
      instruction: "Evaluate the common logarithm.",
      prompt: `log ${10 ** n}`,
      answer: String(n),
      hint: `log means log base 10: 10 to what power gives ${10 ** n}?`,
      steps: [
        `${10 ** n} = 10^${n}.`,
        `log ${10 ** n} = ${n}.`,
      ],
      concept: "A logarithm asks: what exponent produces this number?",
      verify: () => 10 ** n === Number(`1${"0".repeat(n)}`),
    });
  }
  if (stage === 2) {
    const b = rng.pick([2, 3, 5]);
    const n = rng.int(2, b === 2 ? 6 : 4);
    return inputQ({
      instruction: "Evaluate the logarithm.",
      prompt: `log_${b} ${b ** n}`,
      answer: String(n),
      hint: `${b} to what power gives ${b ** n}?`,
      steps: [
        `${b ** n} = ${b}^${n}.`,
        `log_${b} ${b ** n} = ${n}.`,
      ],
      concept: "log_b x is the exponent that turns b into x.",
      verify: () => Math.abs(Math.log(b ** n) / Math.log(b) - n) < 1e-9,
    });
  }
  if (stage === 3) {
    const b = rng.int(2, 9);
    const one = rng.chance(0.5);
    return inputQ({
      instruction: "Evaluate the logarithm.",
      prompt: one ? `log_${b} 1` : `log_${b} ${b}`,
      answer: one ? "0" : "1",
      hint: one ? `${b} to what power gives 1?` : `${b} to what power gives ${b}?`,
      steps: one
        ? [`Any base to the power 0 equals 1.`, `log_${b} 1 = 0.`]
        : [`${b}^1 = ${b}.`, `log_${b} ${b} = 1.`],
      concept: one ? "log of 1 is always 0." : "log base b of b is always 1.",
      verify: () => (one ? b ** 0 === 1 : b ** 1 === b),
    });
  }
  if (stage === 4) {
    const b = rng.pick([2, 3, 5]);
    const n = rng.int(1, b === 2 ? 4 : 3);
    return inputQ({
      instruction: "Evaluate the logarithm.",
      prompt: `log_${b} {1/${b ** n}}`,
      answer: String(-n),
      hint: `{1/${b ** n}} is ${b} to a negative power.`,
      steps: [
        `{1/${b ** n}} = ${b}^{−${n}}.`,
        `log_${b} {1/${b ** n}} = −${n}.`,
      ],
      concept: "Logs of numbers below 1 are negative.",
      verify: () => Math.abs(Math.log(1 / b ** n) / Math.log(b) + n) < 1e-9,
    });
  }
  const b = rng.pick([2, 3, 4, 5]);
  return inputQ({
    instruction: "Evaluate the logarithm.",
    prompt: `log_${b * b} ${b}`,
    answer: "1/2",
    answerFormat: "fraction",
    hint: `${b * b} to what power gives ${b}? Think square roots.`,
    steps: [
      `sqrt(${b * b}) = ${b}, so ${b * b}^{1/2} = ${b}.`,
      `log_${b * b} ${b} = {1/2}.`,
    ],
    concept: "Fractional exponents give roots — logs can be fractions.",
    verify: () => Math.abs(Math.log(b) / Math.log(b * b) - 0.5) < 1e-9,
  });
}

function logLaws(stage: number, rng: Rng): RawQuestion {
  const b = rng.pick([2, 3]);
  if (stage === 1) {
    const m = rng.int(1, 3);
    const k = rng.int(1, 3);
    const ans = m + k;
    return inputQ({
      instruction: "Use the product law of logarithms.",
      prompt: `log_${b} ${b ** m} + log_${b} ${b ** k}`,
      answer: String(ans),
      hint: `log_b x + log_b y = log_b (xy).`,
      steps: [
        `log_${b} ${b ** m} + log_${b} ${b ** k} = log_${b} (${b ** m} × ${b ** k}) = log_${b} ${b ** (m + k)}.`,
        `${b ** (m + k)} = ${b}^${ans}, so the value is ${ans}.`,
      ],
      concept: "Adding logs multiplies their arguments.",
      verify: () => b ** m * b ** k === b ** ans,
    });
  }
  if (stage === 2) {
    const k = rng.int(1, 3);
    const m = k + rng.int(1, 3);
    const ans = m - k;
    return inputQ({
      instruction: "Use the quotient law of logarithms.",
      prompt: `log_${b} ${b ** m} − log_${b} ${b ** k}`,
      answer: String(ans),
      hint: `log_b x − log_b y = log_b (x ÷ y).`,
      steps: [
        `log_${b} ${b ** m} − log_${b} ${b ** k} = log_${b} (${b ** m} ÷ ${b ** k}) = log_${b} ${b ** ans}.`,
        `${b ** ans} = ${b}^${ans}, so the value is ${ans}.`,
      ],
      concept: "Subtracting logs divides their arguments.",
      verify: () => b ** m / b ** k === b ** ans,
    });
  }
  if (stage === 3) {
    const n = rng.int(2, 3);
    const m = rng.int(1, 3);
    const ans = n * m;
    return inputQ({
      instruction: "Use the power law of logarithms.",
      prompt: `${n} log_${b} ${b ** m}`,
      answer: String(ans),
      hint: `n · log_b x = log_b (x^n).`,
      steps: [
        `log_${b} ${b ** m} = ${m}.`,
        `${n} × ${m} = ${ans}.`,
      ],
      concept: "A coefficient on a log becomes an exponent inside it.",
      verify: () => Math.abs((n * Math.log(b ** m)) / Math.log(b) - ans) < 1e-9,
    });
  }
  if (stage === 4) {
    const p = rng.int(2, 5);
    const v = rng.pick([
      {
        q: "log(xy)", a: "log x + log y",
        d: ["log x · log y", "log(x + y)", "log x − log y"],
        s: ["The product law: log(xy) = log x + log y.", "Logs turn multiplication into addition."],
        f: () => Math.abs(Math.log(6 * 7) - (Math.log(6) + Math.log(7))),
      },
      {
        q: "log({x/y})", a: "log x − log y",
        d: ["{log x/log y}", "log(x − y)", "log x + log y"],
        s: ["The quotient law: log(x/y) = log x − log y.", "Division inside becomes subtraction outside."],
        f: () => Math.abs(Math.log(6 / 7) - (Math.log(6) - Math.log(7))),
      },
      {
        q: `log(x^${p})`, a: `${p} log x`,
        d: [`(log x)^${p}`, `log(${p}x)`, `${p} + log x`],
        s: [`The power law: log(x^${p}) = ${p} log x.`, "An exponent inside comes out as a multiplier."],
        f: () => Math.abs(Math.log(6 ** p) - p * Math.log(6)),
      },
      {
        q: "log x + log y + log z", a: "log(xyz)",
        d: ["log(x + y + z)", "3 log(xyz)", "log x · log y · log z"],
        s: ["Apply the product law twice.", "log x + log y + log z = log(xyz)."],
        f: () => Math.abs(Math.log(2) + Math.log(3) + Math.log(5) - Math.log(30)),
      },
      {
        q: `${p} log x − log y`, a: `log({x^${p}/y})`,
        d: [`log({${p}x/y})`, `${p} log({x/y})`, `log(x^${p} − y)`],
        s: [`First the power law: ${p} log x = log(x^${p}).`, `Then the quotient law gives log(x^${p}/y).`],
        f: () => Math.abs(p * Math.log(6) - Math.log(7) - Math.log(6 ** p / 7)),
      },
    ]);
    return mcQ({
      instruction: "Pick the equivalent expression.",
      prompt: `Which expression equals ${v.q}?`,
      choices: mcChoices(rng, v.a, v.d),
      answer: v.a,
      hint: "Match the operation inside the log with the operation between the logs.",
      steps: v.s,
      concept: "Logs turn products into sums, quotients into differences, and powers into multipliers.",
      verify: () => v.f() < 1e-9,
    });
  }
  const m = rng.int(1, 3);
  const k = rng.int(1, 3);
  const j = rng.int(1, 3);
  const ans = m + k - j;
  return inputQ({
    instruction: "Combine using log laws.",
    prompt: `log_${b} ${b ** m} + log_${b} ${b ** k} − log_${b} ${b ** j}`,
    answer: String(ans),
    hint: "Each term is a whole-number exponent of the base.",
    steps: [
      `The three logs are ${m}, ${k}, and ${j}.`,
      `${m} + ${k} − ${j} = ${sx(ans)}.`,
    ],
    concept: "Evaluate each log first when the arguments are powers of the base.",
    verify: () => (b ** m * b ** k) / b ** j === b ** ans,
  });
}

function logNatural(stage: number, rng: Rng): RawQuestion {
  if (stage === 1) {
    const v = rng.pick([
      { p: "ln 1", a: 0, s: "e^0 = 1, so ln 1 = 0." },
      { p: "ln e", a: 1, s: "e^1 = e, so ln e = 1." },
      { p: "ln e^2", a: 2, s: "e^2 is e squared, so ln e^2 = 2." },
      { p: "ln e^3", a: 3, s: "e^3 is e cubed, so ln e^3 = 3." },
      { p: "ln {1/e}", a: -1, s: "1/e is e^{−1}, so ln {1/e} = −1." },
      { p: "ln sqrt(e)", a: 0.5, s: "sqrt(e) is e^{1/2}, so the answer is 0.5." },
    ]);
    return inputQ({
      instruction: "Evaluate the natural logarithm.",
      prompt: v.p,
      answer: String(v.a),
      answerFormat: Number.isInteger(v.a) ? "integer" : "decimal",
      hint: "ln is the logarithm with base e.",
      steps: [v.s],
      concept: "ln x asks: e to what power gives x?",
      verify: () => Math.abs(Math.exp(v.a) - Math.exp(v.a)) < 1e-12,
    });
  }
  if (stage === 2) {
    const k = rng.int(2, 6);
    return inputQ({
      instruction: "Evaluate the natural logarithm.",
      prompt: `ln e^${k}`,
      answer: String(k),
      hint: "ln and the exponential undo each other.",
      steps: [
        `ln e^${k} asks: e to what power gives e^${k}?`,
        `The answer is ${k}.`,
      ],
      concept: "ln eˣ = x.",
      verify: () => Math.abs(Math.log(Math.exp(k)) - k) < 1e-9,
    });
  }
  if (stage === 3) {
    const k = rng.int(2, 9);
    return inputQ({
      instruction: "Evaluate.",
      prompt: `e^{ln ${k}}`,
      answer: String(k),
      hint: "The exponential undoes the natural log.",
      steps: [
        `ln ${k} is the power that turns e into ${k}.`,
        `Raising e to that power gives ${k} back.`,
      ],
      concept: "e^(ln x) = x for x > 0.",
      verify: () => Math.abs(Math.exp(Math.log(k)) - k) < 1e-9,
    });
  }
  if (stage === 4) {
    const k = rng.int(1, 5);
    return inputQ({
      instruction: "Evaluate the natural logarithm.",
      prompt: `ln e^{−${k}}`,
      answer: String(-k),
      hint: "ln eˣ = x works for negative exponents too.",
      steps: [
        `ln e^{−${k}} = −${k}.`,
      ],
      concept: "The log of a reciprocal power is negative.",
      verify: () => Math.abs(Math.log(Math.exp(-k)) + k) < 1e-9,
    });
  }
  const k = rng.int(2, 6);
  const ans = `x = e^${k}`;
  return mcQ({
    instruction: "Solve the equation.",
    prompt: `ln x = ${k}`,
    choices: mcChoices(rng, ans, [`x = ${k}e`, `x = e ÷ ${k}`, `x = ${k}^e`]),
    answer: ans,
    hint: "Rewrite the log equation in exponential form.",
    steps: [
      `ln x = ${k} means e^${k} = x.`,
      `So x = e^${k}.`,
    ],
    concept: "log form and exponential form say the same thing.",
    verify: () => Math.abs(Math.log(Math.exp(k)) - k) < 1e-9,
  });
}

function logSolve(stage: number, rng: Rng): RawQuestion {
  if (stage === 1) {
    const b = rng.pick([2, 3, 5, 10]);
    const n = rng.int(1, b === 2 ? 5 : 3);
    return inputQ({
      instruction: "Solve for x.",
      prompt: `log_${b} x = ${n}`,
      answer: String(b ** n),
      hint: `Rewrite in exponential form: x = ${b}^${n}.`,
      steps: [
        `log_${b} x = ${n} means ${b}^${n} = x.`,
        `x = ${b ** n}.`,
      ],
      concept: "Undo a log by raising the base to both sides.",
      verify: () => Math.abs(Math.log(b ** n) / Math.log(b) - n) < 1e-9,
    });
  }
  if (stage === 2) {
    const b = rng.int(2, 5);
    const n = rng.int(2, 3);
    const v = b ** n;
    return inputQ({
      instruction: "Find the base.",
      prompt: `log_x ${v} = ${n}`,
      answer: String(b),
      hint: `Which base raised to the power ${n} gives ${v}?`,
      steps: [
        `log_x ${v} = ${n} means x^${n} = ${v}.`,
        `${b}^${n} = ${v}, so x = ${b}.`,
      ],
      concept: "The base is the unknown being raised to the log's value.",
      verify: () => b ** n === v,
    });
  }
  if (stage === 3) {
    const b = rng.pick([2, 3]);
    const n = rng.int(2, b === 2 ? 5 : 4);
    const cc = rng.int(1, 5);
    const ans = b ** n - cc;
    return inputQ({
      instruction: "Solve for x.",
      prompt: `log_${b} (x + ${cc}) = ${n}`,
      answer: String(ans),
      hint: `First rewrite: x + ${cc} = ${b}^${n}.`,
      steps: [
        `x + ${cc} = ${b}^${n} = ${b ** n}.`,
        `x = ${b ** n} − ${cc} = ${sx(ans)}.`,
      ],
      concept: "Convert to exponential form, then solve the leftover equation.",
      verify: () => ans + cc === b ** n,
    });
  }
  if (stage === 4) {
    const b = rng.pick([2, 3]);
    const j = rng.int(1, 2);
    const n = j + rng.int(1, 3);
    const cc = b ** j;
    const ans = b ** (n - j);
    return inputQ({
      instruction: "Solve for x.",
      prompt: `log_${b} x + log_${b} ${cc} = ${n}`,
      answer: String(ans),
      hint: `Combine the logs: log_${b} (${cc}x) = ${n}.`,
      steps: [
        `Product law: log_${b} (${cc}x) = ${n}.`,
        `${cc}x = ${b}^${n} = ${b ** n}.`,
        `x = ${b ** n} ÷ ${cc} = ${ans}.`,
      ],
      concept: "Merge logs into one before converting to exponential form.",
      verify: () => cc * ans === b ** n,
    });
  }
  const b = rng.pick([2, 3, 5]);
  const half = rng.int(1, b === 2 ? 3 : 2);
  const n = 2 * half;
  const ans = b ** half;
  return inputQ({
    instruction: "Solve for x.",
    prompt: `2 log_${b} x = ${n}`,
    answer: String(ans),
    hint: `Divide both sides by 2 first.`,
    steps: [
      `log_${b} x = ${n} ÷ 2 = ${half}.`,
      `x = ${b}^${half} = ${ans}.`,
    ],
    concept: "Strip coefficients off a log before converting.",
    verify: () => ans ** 2 === b ** n,
  });
}

function logGraph(stage: number, rng: Rng): RawQuestion {
  const b = rng.pick([2, 3, 5]);
  if (stage === 1) {
    const ans = "x > 0";
    return mcQ({
      instruction: "Find the domain.",
      prompt: `y = log_${b} x`,
      choices: mcChoices(rng, ans, ["x ≥ 0", "All real numbers", "x ≠ 0"]),
      answer: ans,
      hint: `Can ${b} raised to any power ever be 0 or negative?`,
      steps: [
        `${b}^t is positive for every t, so only positive x have a log.`,
        `Domain: x > 0 — note 0 itself is excluded.`,
      ],
      concept: "Logarithms accept only positive inputs.",
      verify: () => b ** -5 > 0,
    });
  }
  if (stage === 2) {
    return inputQ({
      instruction: "Find the x-intercept.",
      prompt: `At what value of x does y = log_${b} x equal 0?`,
      answer: "1",
      hint: `${b} to what power gives... think of the power 0.`,
      steps: [
        `log_${b} x = 0 means ${b}^0 = x.`,
        `${b}^0 = 1, so x = 1.`,
      ],
      concept: "Every log graph crosses the x-axis at x = 1.",
      verify: () => b ** 0 === 1,
    });
  }
  if (stage === 3) {
    const a = rng.int(1, 9);
    const ans = `x = ${a}`;
    return mcQ({
      instruction: "Find the vertical asymptote.",
      prompt: `y = log_${b} (x − ${a})`,
      choices: mcChoices(rng, ans, [`x = −${a}`, `y = ${a}`, "x = 0"]),
      answer: ans,
      hint: "The asymptote sits where the log's argument hits 0.",
      steps: [
        `The argument x − ${a} must stay positive.`,
        `It approaches 0 as x → ${a}, so the vertical asymptote is x = ${a}.`,
      ],
      concept: "Shifting a log shifts its vertical asymptote with it.",
      verify: () => a - a === 0,
    });
  }
  if (stage === 4) {
    const n = rng.int(2, b === 2 ? 5 : 3);
    return inputQ({
      instruction: "Evaluate on the curve.",
      prompt: `y = log_${b} x. Find y when x = ${b ** n}.`,
      answer: String(n),
      hint: `${b} to what power gives ${b ** n}?`,
      steps: [
        `${b ** n} = ${b}^${n}.`,
        `y = log_${b} ${b ** n} = ${n}.`,
      ],
      concept: "Points on a log curve are (bⁿ, n).",
      verify: () => Math.abs(Math.log(b ** n) / Math.log(b) - n) < 1e-9,
    });
  }
  const a = rng.int(1, 9);
  const ans = `x > ${a}`;
  return mcQ({
    instruction: "Find the domain.",
    prompt: `y = log_${b} (x − ${a})`,
    choices: mcChoices(rng, ans, [`x < ${a}`, `x ≥ ${a}`, "x > 0"]),
    answer: ans,
    hint: `The argument x − ${a} must be positive.`,
    steps: [
      `Require x − ${a} > 0.`,
      `So x > ${a}.`,
    ],
    concept: "A shifted log's domain shifts along with it.",
    verify: () => a + 1 - a > 0 && a - a <= 0,
  });
}

const logarithm: GeneratorFamily = {
  stageLabel(skill: SkillRef, st: number) {
    const kind = str(skill.params, "kind", "mixed");
    const labels: Record<string, string[]> = {
      eval: ["Base-10 logs", "Small bases", "Logs of 1 and b", "Negative logs", "Fractional logs"],
      laws: ["Product law", "Quotient law", "Power law", "Recognize the laws", "Combine laws"],
      natural: ["ln of 1 and e", "ln of powers", "e undoes ln", "Negative powers", "Solve with e"],
      solve: ["Basic log equations", "Unknown base", "Shifted arguments", "Combine then solve", "With coefficients"],
      graph: ["Domain", "x-intercept", "Asymptotes", "Points on the curve", "Shifted domains"],
    };
    return (labels[kind] ?? ["Log basics", "Evaluate", "Laws", "Solve", "Applications"])[st - 1];
  },
  generate(skill, stage, rng): RawQuestion {
    let kind = str(skill.params, "kind", "mixed");
    if (kind === "mixed") kind = rng.pick(["eval", "laws", "solve"]);
    if (kind === "laws") return logLaws(stage, rng);
    if (kind === "natural") return logNatural(stage, rng);
    if (kind === "solve") return logSolve(stage, rng);
    if (kind === "graph") return logGraph(stage, rng);
    return logEval(stage, rng);
  },
};

/* ----------------------------------------------------------------- sequence */
function seqArith(stage: number, rng: Rng): RawQuestion {
  const a1 = rng.int(1, 9);
  if (stage === 1) {
    const d = nz(rng, -6, 9);
    const terms = [0, 1, 2, 3].map((i) => a1 + i * d);
    const ans = a1 + 4 * d;
    return inputQ({
      instruction: "Find the next term of the sequence.",
      prompt: `${terms.map(sx).join(", ")}, ...`,
      answer: String(ans),
      hint: "How much does each term change by?",
      steps: [
        `Each term ${d > 0 ? "increases" : "decreases"} by ${Math.abs(d)}: the common difference is ${sx(d)}.`,
        `${sx(terms[3])} ${tail(d)} = ${sx(ans)}.`,
      ],
      concept: "Arithmetic sequences add the same amount each step.",
      verify: () => ans - terms[3] === d,
    });
  }
  if (stage === 2) {
    const d = rng.int(2, 9);
    const n = rng.int(5, 10);
    const ans = a1 + (n - 1) * d;
    return inputQ({
      instruction: "Find the requested term.",
      prompt: `An arithmetic sequence has first term ${a1} and common difference ${d}. Find the ${n}th term.`,
      answer: String(ans),
      hint: `Use a_n = a_1 + (n − 1)d.`,
      steps: [
        `a_${n} = ${a1} + (${n} − 1) × ${d}.`,
        `= ${a1} + ${(n - 1) * d} = ${ans}.`,
      ],
      concept: "The nth term adds the difference n − 1 times.",
      verify: () => (ans - a1) / d === n - 1,
    });
  }
  if (stage === 3) {
    let d = rng.int(2, 9);
    while (d === a1) d = rng.int(2, 9);
    const ans = `a_n = ${a1} + (n − 1) · ${d}`;
    return mcQ({
      instruction: "Choose the explicit formula.",
      prompt: `An arithmetic sequence starts ${a1}, ${a1 + d}, ${a1 + 2 * d}, ${a1 + 3 * d}, ...`,
      choices: mcChoices(rng, ans, [
        `a_n = ${a1} + n · ${d}`,
        `a_n = ${d} + (n − 1) · ${a1}`,
        `a_n = ${a1} · ${d}^{n − 1}`,
      ]),
      answer: ans,
      hint: `Check the formula at n = 1: it must give ${a1}.`,
      steps: [
        `First term ${a1}, common difference ${d}.`,
        `a_n = a_1 + (n − 1)d = ${a1} + (n − 1) · ${d}.`,
        `Check n = 1: ${a1} + 0 = ${a1}. ✓`,
      ],
      concept: "Explicit formulas must reproduce the first term at n = 1.",
      verify: () => a1 + (2 - 1) * d === a1 + d,
    });
  }
  if (stage === 4) {
    const d = nz(rng, -9, 9);
    const k = rng.int(4, 8);
    const ak = a1 + (k - 1) * d;
    return inputQ({
      instruction: "Find the common difference.",
      prompt: `An arithmetic sequence has a_1 = ${a1} and a_${k} = ${sx(ak)}. Find the common difference d.`,
      answer: String(d),
      hint: `From term 1 to term ${k} there are ${k - 1} equal jumps.`,
      steps: [
        `Total change: ${sx(ak)} − ${a1} = ${sx(ak - a1)}.`,
        `Spread over ${k - 1} steps: d = ${sx(ak - a1)} ÷ ${k - 1} = ${sx(d)}.`,
      ],
      concept: "The difference is total change divided by number of steps.",
      verify: () => a1 + (k - 1) * d === ak,
    });
  }
  const d = rng.int(2, 9);
  const n = rng.int(6, 15);
  const v = a1 + (n - 1) * d;
  return inputQ({
    instruction: "Find the term number.",
    prompt: `In the arithmetic sequence with a_1 = ${a1} and d = ${d}, which term equals ${v}? Give n.`,
    answer: String(n),
    hint: `Solve ${a1} + (n − 1) × ${d} = ${v}.`,
    steps: [
      `(n − 1) × ${d} = ${v} − ${a1} = ${v - a1}.`,
      `n − 1 = ${(v - a1) / d}, so n = ${n}.`,
    ],
    concept: "Solve the explicit formula backwards to locate a term.",
    verify: () => a1 + (n - 1) * d === v,
  });
}

function seqGeom(stage: number, rng: Rng): RawQuestion {
  const a = rng.int(1, 5);
  const r = rng.pick([2, 3]);
  if (stage === 1) {
    const terms = [0, 1, 2, 3].map((i) => a * r ** i);
    const ans = a * r ** 4;
    return inputQ({
      instruction: "Find the next term of the sequence.",
      prompt: `${terms.join(", ")}, ...`,
      answer: String(ans),
      hint: "What is each term multiplied by?",
      steps: [
        `Each term is multiplied by ${r}: the common ratio is ${r}.`,
        `${terms[3]} × ${r} = ${ans}.`,
      ],
      concept: "Geometric sequences multiply by the same ratio each step.",
      verify: () => ans / terms[3] === r,
    });
  }
  if (stage === 2) {
    const n = rng.int(4, 6);
    const ans = a * r ** (n - 1);
    return inputQ({
      instruction: "Find the requested term.",
      prompt: `A geometric sequence has first term ${a} and common ratio ${r}. Find the ${n}th term.`,
      answer: String(ans),
      hint: `Use a_n = a_1 · r^{n − 1}.`,
      steps: [
        `a_${n} = ${a} × ${r}^{${n} − 1} = ${a} × ${r ** (n - 1)}.`,
        `= ${ans}.`,
      ],
      concept: "The nth term multiplies by the ratio n − 1 times.",
      verify: () => ans / a === r ** (n - 1),
    });
  }
  if (stage === 3) {
    let aa = a;
    while (aa === r) aa = rng.int(1, 5);
    const ans = `a_n = ${aa} · ${r}^{n − 1}`;
    return mcQ({
      instruction: "Choose the explicit formula.",
      prompt: `A geometric sequence starts ${aa}, ${aa * r}, ${aa * r * r}, ${aa * r ** 3}, ...`,
      choices: mcChoices(rng, ans, [
        `a_n = ${aa} · ${r}^n`,
        `a_n = ${aa} + ${r}(n − 1)`,
        `a_n = ${r} · ${aa}^{n − 1}`,
      ]),
      answer: ans,
      hint: `Check n = 1: the formula must give ${aa}.`,
      steps: [
        `First term ${aa}, common ratio ${r}.`,
        `a_n = a_1 · r^{n − 1} = ${aa} · ${r}^{n − 1}.`,
        `Check n = 1: ${aa} · ${r}^0 = ${aa}. ✓`,
      ],
      concept: "The exponent n − 1 makes the formula start at the first term.",
      verify: () => aa * r ** (2 - 1) === aa * r,
    });
  }
  if (stage === 4) {
    const rr = rng.int(2, 5);
    const t = rng.int(2, 6);
    return inputQ({
      instruction: "Find the common ratio.",
      prompt: `Two consecutive terms of a geometric sequence are ${t} and ${t * rr}. Find the common ratio r.`,
      answer: String(rr),
      hint: "Divide a term by the term before it.",
      steps: [
        `r = ${t * rr} ÷ ${t} = ${rr}.`,
      ],
      concept: "The ratio is any term divided by its predecessor.",
      verify: () => t * rr === rr * t,
    });
  }
  const n = rng.int(4, 7);
  const v = a * r ** (n - 1);
  return inputQ({
    instruction: "Find the term number.",
    prompt: `In the geometric sequence with a_1 = ${a} and r = ${r}, which term equals ${v}? Give n.`,
    answer: String(n),
    hint: `How many times must ${a} be multiplied by ${r} to reach ${v}?`,
    steps: [
      `${v} ÷ ${a} = ${r ** (n - 1)} = ${r}^${n - 1}.`,
      `So n − 1 = ${n - 1} and n = ${n}.`,
    ],
    concept: "Undo the ratio repeatedly to locate a term.",
    verify: () => a * r ** (n - 1) === v,
  });
}

function seqRecursive(stage: number, rng: Rng): RawQuestion {
  const a1 = rng.int(1, 9);
  if (stage === 1 || stage === 2) {
    const d = stage === 1 ? rng.int(2, 9) : nz(rng, -9, 9);
    const n = stage === 1 ? 3 : 4;
    const ans = a1 + (n - 1) * d;
    const mid = [a1 + d, a1 + 2 * d];
    return inputQ({
      instruction: "Follow the recursive rule.",
      prompt: `a_1 = ${a1} and a_{n+1} = a_n ${tail(d)}. Find a_${n}.`,
      answer: String(ans),
      hint: `Apply the rule ${n - 1} times, starting from a_1.`,
      steps: [
        `a_2 = ${a1} ${tail(d)} = ${sx(mid[0])}.`,
        `a_3 = ${sx(mid[0])} ${tail(d)} = ${sx(mid[1])}.`,
        ...(n === 4 ? [`a_4 = ${sx(mid[1])} ${tail(d)} = ${sx(ans)}.`] : []),
      ],
      concept: "A recursive rule builds each term from the one before.",
      verify: () => ans === a1 + (n - 1) * d,
    });
  }
  if (stage === 3) {
    const a0 = rng.int(1, 4);
    const r = rng.pick([2, 3]);
    const ans = a0 * r ** 3;
    return inputQ({
      instruction: "Follow the recursive rule.",
      prompt: `a_1 = ${a0} and a_{n+1} = ${r} · a_n. Find a_4.`,
      answer: String(ans),
      hint: `Multiply by ${r} three times.`,
      steps: [
        `a_2 = ${a0 * r}, a_3 = ${a0 * r * r}.`,
        `a_4 = ${a0 * r * r} × ${r} = ${ans}.`,
      ],
      concept: "Multiplicative recursion generates geometric sequences.",
      verify: () => ans / a0 === r ** 3,
    });
  }
  if (stage === 4) {
    const a0 = rng.int(1, 4);
    const cc = rng.int(1, 5);
    const a2 = 2 * a0 + cc;
    const a3 = 2 * a2 + cc;
    return inputQ({
      instruction: "Follow the recursive rule.",
      prompt: `a_1 = ${a0} and a_{n+1} = 2a_n + ${cc}. Find a_3.`,
      answer: String(a3),
      hint: "Compute a_2 first, then feed it back into the rule.",
      steps: [
        `a_2 = 2(${a0}) + ${cc} = ${a2}.`,
        `a_3 = 2(${a2}) + ${cc} = ${a3}.`,
      ],
      concept: "Each application of the rule uses the newest term.",
      verify: () => a3 === 2 * (2 * a0 + cc) + cc,
    });
  }
  const d = rng.int(2, 8);
  const terms = [0, 1, 2, 3].map((i) => a1 + i * d);
  const ans = `a_{n+1} = a_n + ${d}`;
  return mcQ({
    instruction: "Choose the recursive rule.",
    prompt: `A sequence starts ${terms.join(", ")}, ... with a_1 = ${a1}. Which rule generates it?`,
    choices: mcChoices(rng, ans, [
      `a_{n+1} = a_n − ${d}`,
      `a_{n+1} = ${d} · a_n`,
      `a_{n+1} = a_n + ${d + 1}`,
    ]),
    answer: ans,
    hint: "Test the rule: does it turn the first term into the second?",
    steps: [
      `${terms[1]} − ${terms[0]} = ${d}: each term adds ${d}.`,
      `Rule: a_{n+1} = a_n + ${d}. Check: ${terms[0]} + ${d} = ${terms[1]}. ✓`,
    ],
    concept: "A recursive rule states how to get the NEXT term.",
    verify: () => terms[1] - terms[0] === d && terms[2] - terms[1] === d,
  });
}

const sequence: GeneratorFamily = {
  stageLabel(skill: SkillRef, st: number) {
    const kind = str(skill.params, "kind", "mixed");
    const labels: Record<string, string[]> = {
      arith: ["Next term", "The nth term", "Explicit formulas", "Find the difference", "Which term?"],
      geom: ["Next term", "The nth term", "Explicit formulas", "Find the ratio", "Which term?"],
      recursive: ["Additive rules", "More steps", "Multiplicative rules", "Affine rules", "Match the rule"],
    };
    return (labels[kind] ?? ["Next term", "The nth term", "Formulas", "Find the parameter", "Which term?"])[st - 1];
  },
  generate(skill, stage, rng): RawQuestion {
    let kind = str(skill.params, "kind", "mixed");
    if (kind === "mixed") kind = rng.pick(["arith", "geom", "recursive"]);
    if (kind === "geom") return seqGeom(stage, rng);
    if (kind === "recursive") return seqRecursive(stage, rng);
    return seqArith(stage, rng);
  },
};

/* ------------------------------------------------------------------- series */
function seriesArith(stage: number, rng: Rng): RawQuestion {
  const a1 = rng.int(1, 9);
  const d = rng.int(2, 6);
  if (stage === 1) {
    const terms = [0, 1, 2, 3].map((i) => a1 + i * d);
    const ans = terms.reduce((s, t) => s + t, 0);
    return inputQ({
      instruction: "Add the terms of the series.",
      prompt: `${terms.join(" + ")}`,
      answer: String(ans),
      hint: "Add left to right, or pair first with last.",
      steps: [
        `Pair the ends: ${terms[0]} + ${terms[3]} = ${terms[0] + terms[3]} and ${terms[1]} + ${terms[2]} = ${terms[1] + terms[2]}.`,
        `${terms[0] + terms[3]} + ${terms[1] + terms[2]} = ${ans}.`,
      ],
      concept: "In an arithmetic series, opposite pairs share the same sum.",
      verify: () => terms.reduce((s, t) => s + t, 0) === ans,
    });
  }
  if (stage === 2 || stage === 3) {
    const n = stage === 2 ? rng.int(6, 10) : rng.int(11, 20);
    const ans = (n * (2 * a1 + (n - 1) * d)) / 2;
    return inputQ({
      instruction: "Find the sum of the series.",
      prompt: `Find the sum of the first ${n} terms of the arithmetic series with a_1 = ${a1} and d = ${d}.`,
      answer: String(ans),
      hint: `Use S_n = {n/2}(2a_1 + (n − 1)d).`,
      steps: [
        `S_${n} = {${n}/2} × (2 × ${a1} + ${n - 1} × ${d}).`,
        `= {${n}/2} × ${2 * a1 + (n - 1) * d}.`,
        `= ${ans}.`,
      ],
      concept: "The sum formula averages first and last terms across n terms.",
      verify: () => {
        let s = 0;
        for (let i = 0; i < n; i++) s += a1 + i * d;
        return s === ans;
      },
    });
  }
  if (stage === 4) {
    const n = rng.int(6, 12);
    const an = a1 + (n - 1) * d;
    const ans = (n * (a1 + an)) / 2;
    return inputQ({
      instruction: "Find the sum of the series.",
      prompt: `An arithmetic series has ${n} terms, first term ${a1} and last term ${an}. Find its sum.`,
      answer: String(ans),
      hint: `Use S_n = {n/2}(first + last).`,
      steps: [
        `First + last = ${a1} + ${an} = ${a1 + an}.`,
        `S = {${n}/2} × ${a1 + an} = ${ans}.`,
      ],
      concept: "n terms average out to (first + last)/2 each.",
      verify: () => {
        let s = 0;
        for (let i = 0; i < n; i++) s += a1 + i * d;
        return s === ans;
      },
    });
  }
  const n = rng.int(5, 12);
  const sum = (n * (2 * a1 + (n - 1) * d)) / 2;
  return inputQ({
    instruction: "Find the number of terms.",
    prompt: `The arithmetic series with a_1 = ${a1} and d = ${d} sums to ${sum}. How many terms were added?`,
    answer: String(n),
    hint: `Try S_n = {n/2}(2 × ${a1} + (n − 1) × ${d}) for whole numbers n.`,
    steps: [
      `S_n = {n/2}(${2 * a1} + (n − 1) × ${d}).`,
      `Testing n = ${n}: {${n}/2} × ${2 * a1 + (n - 1) * d} = ${sum}. ✓`,
    ],
    concept: "The number of terms is the unknown in the same sum formula.",
    verify: () => {
      let s = 0;
      for (let i = 0; i < n; i++) s += a1 + i * d;
      return s === sum;
    },
  });
}

function seriesGeom(stage: number, rng: Rng): RawQuestion {
  if (stage === 1) {
    const a = rng.int(1, 4);
    const r = rng.pick([2, 3]);
    const terms = [0, 1, 2, 3].map((i) => a * r ** i);
    const ans = terms.reduce((s, t) => s + t, 0);
    return inputQ({
      instruction: "Add the terms of the series.",
      prompt: `${terms.join(" + ")}`,
      answer: String(ans),
      hint: "Add the four terms directly.",
      steps: [
        `${terms[0]} + ${terms[1]} = ${terms[0] + terms[1]}.`,
        `${terms[0] + terms[1]} + ${terms[2]} = ${terms[0] + terms[1] + terms[2]}.`,
        `${terms[0] + terms[1] + terms[2]} + ${terms[3]} = ${ans}.`,
      ],
      concept: "A geometric series adds terms that share a common ratio.",
      verify: () => terms.reduce((s, t) => s + t, 0) === ans,
    });
  }
  if (stage === 2 || stage === 3) {
    const a = rng.int(1, stage === 2 ? 4 : 5);
    const r = stage === 3 ? 2 : rng.pick([2, 3]);
    const n = stage === 2 ? rng.int(4, 5) : rng.int(6, 8);
    const ans = (a * (r ** n - 1)) / (r - 1);
    return inputQ({
      instruction: "Find the sum of the series.",
      prompt: `Find the sum of the first ${n} terms of the geometric series with a_1 = ${a} and r = ${r}.`,
      answer: String(ans),
      hint: `Use S_n = a · {r^n − 1/r − 1}.`,
      steps: [
        `${r}^${n} = ${r ** n}.`,
        `S_${n} = ${a} × {${r ** n} − 1/${r} − 1} = ${a} × ${(r ** n - 1) / (r - 1)}.`,
        `= ${ans}.`,
      ],
      concept: "The geometric sum formula collapses many multiplications.",
      verify: () => {
        let s = 0;
        for (let i = 0; i < n; i++) s += a * r ** i;
        return s === ans;
      },
    });
  }
  if (stage === 4) {
    const a = rng.int(1, 4);
    const n = rng.int(4, 6);
    let s = 0;
    for (let i = 0; i < n; i++) s += a * (-2) ** i;
    return inputQ({
      instruction: "Find the sum of the series.",
      prompt: `Find the sum of the first ${n} terms of the geometric series with a_1 = ${a} and r = −2.`,
      answer: String(s),
      hint: "The terms alternate in sign — track them carefully.",
      steps: [
        `Terms: ${[0, 1, 2, 3].map((i) => sx(a * (-2) ** i)).join(", ")}${n > 4 ? ", ..." : ""}.`,
        `S = ${a} × {(−2)^${n} − 1/−2 − 1} = ${a} × {${sx((-2) ** n - 1)}/−3} = ${sx(s)}.`,
      ],
      concept: "A negative ratio makes the series alternate.",
      verify: () => {
        let t = 0;
        for (let i = 0; i < n; i++) t += a * (-2) ** i;
        return t === s;
      },
    });
  }
  const n = rng.int(4, 8);
  const sum = 2 ** n - 1;
  return inputQ({
    instruction: "Find the number of terms.",
    prompt: `The series 1 + 2 + 4 + 8 + ... sums to ${sum}. How many terms were added?`,
    answer: String(n),
    hint: `The sum of the first n powers of 2 is 2^n − 1.`,
    steps: [
      `1 + 2 + ... + 2^{n − 1} = 2^n − 1.`,
      `2^n − 1 = ${sum} gives 2^n = ${sum + 1} = 2^${n}, so n = ${n}.`,
    ],
    concept: "Doubling sums land one short of the next power of 2.",
    verify: () => {
      let s = 0;
      for (let i = 0; i < n; i++) s += 2 ** i;
      return s === sum;
    },
  });
}

function seriesInfinite(stage: number, rng: Rng): RawQuestion {
  if (stage === 5) {
    // One converging ratio among diverging ones; both are varied.
    const good = rng.pick([
      { disp: "r = {1/2}", val: 0.5 },
      { disp: "r = {1/3}", val: 1 / 3 },
      { disp: "r = −{1/4}", val: -0.25 },
      { disp: "r = 0.9", val: 0.9 },
      { disp: "r = −{2/3}", val: -2 / 3 },
      { disp: "r = 0.05", val: 0.05 },
    ]);
    const bad = rng
      .shuffle([
        { disp: "r = 2", val: 2 },
        { disp: "r = 1", val: 1 },
        { disp: "r = −3", val: -3 },
        { disp: "r = −1", val: -1 },
        { disp: "r = 1.5", val: 1.5 },
        { disp: "r = 4", val: 4 },
      ])
      .slice(0, 3);
    return mcQ({
      instruction: "Decide when an infinite sum exists.",
      prompt: "For which common ratio does an infinite geometric series have a finite sum?",
      choices: mcChoices(rng, good.disp, bad.map((b) => b.disp)),
      answer: good.disp,
      hint: "The terms must shrink toward 0.",
      steps: [
        "An infinite geometric series converges only when the ratio satisfies −1 < r < 1.",
        `Of the choices, only ${good.disp.replace("r = ", "")} lies strictly between −1 and 1.`,
      ],
      concept: "Convergence needs |r| < 1.",
      verify: () => Math.abs(good.val) < 1 && bad.every((b) => Math.abs(b.val) >= 1),
    });
  }
  const setups: [number, number, number][] = [
    [rng.int(2, 9), 2, 1],
    [rng.int(1, 6) * 2, 3, 1],
    rng.chance(0.5) ? [rng.int(1, 4) * 3, 4, 1] : [rng.int(1, 3) * 4, 5, 1],
    rng.chance(0.5) ? [rng.int(2, 9), 3, 2] : [rng.int(2, 6), 4, 3],
  ];
  const [a, den, num] = setups[stage - 1];
  const ans = (a * den) / (den - num);
  const rDisp = `{${num}/${den}}`;
  return inputQ({
    instruction: "Find the sum of the infinite series.",
    prompt: `An infinite geometric series has first term ${a} and common ratio r = ${rDisp}. Find its sum.`,
    answer: String(ans),
    hint: `Use S = a ÷ (1 − r).`,
    steps: [
      `1 − r = 1 − ${rDisp} = {${den - num}/${den}}.`,
      `S = ${a} ÷ {${den - num}/${den}} = ${a} × {${den}/${den - num}}.`,
      `= ${ans}.`,
    ],
    concept: "A shrinking geometric tail adds up to a/(1 − r).",
    verify: () => {
      let s = 0;
      let t = a;
      for (let i = 0; i < 80; i++) {
        s += t;
        t *= num / den;
      }
      return Math.abs(s - ans) < 1e-6;
    },
  });
}

const series: GeneratorFamily = {
  stageLabel(skill: SkillRef, st: number) {
    const kind = str(skill.params, "kind", "mixed");
    const labels: Record<string, string[]> = {
      arith: ["Add a few terms", "The sum formula", "Longer sums", "First and last term", "How many terms?"],
      geom: ["Add a few terms", "The sum formula", "Longer sums", "Negative ratios", "How many terms?"],
      infinite: ["Ratio one half", "Ratio one third", "Smaller ratios", "Larger ratios", "When sums exist"],
    };
    return (labels[kind] ?? ["Add a few terms", "Sum formulas", "Longer sums", "Harder sums", "How many terms?"])[st - 1];
  },
  generate(skill, stage, rng): RawQuestion {
    let kind = str(skill.params, "kind", "mixed");
    if (kind === "mixed") kind = rng.pick(["arith", "geom"]);
    if (kind === "geom") return seriesGeom(stage, rng);
    if (kind === "infinite") return seriesInfinite(stage, rng);
    return seriesArith(stage, rng);
  },
};

/* --------------------------------------------------------- binomial-theorem */
function choose(n: number, k: number): number {
  let r = 1;
  for (let i = 1; i <= k; i++) r = (r * (n - i + 1)) / i;
  return Math.round(r);
}

const binomialTheorem: GeneratorFamily = {
  stageLabel: (s, st) =>
    ["Square a binomial", "Binomial coefficients", "Cube a binomial", "Find a coefficient", "General terms"][st - 1],
  generate(skill, stage, rng): RawQuestion {
    if (stage === 1) {
      const a = rng.int(2, 9);
      const ans = `x^2 + ${2 * a}x + ${a * a}`;
      return mcQ({
        instruction: "Expand the binomial.",
        prompt: `(x + ${a})^2`,
        choices: mcChoices(rng, ans, [
          `x^2 + ${a * a}`,
          `x^2 + ${a}x + ${a * a}`,
          `x^2 + ${2 * a}x + ${2 * a}`,
        ]),
        answer: ans,
        hint: `(x + a)^2 = x^2 + 2ax + a^2 — don't drop the middle term.`,
        steps: [
          `(x + ${a})^2 = (x + ${a})(x + ${a}).`,
          `= x^2 + ${a}x + ${a}x + ${a * a}.`,
          `= x^2 + ${2 * a}x + ${a * a}.`,
        ],
        concept: "Squaring a binomial always produces a middle term.",
        verify: () => (5 + a) ** 2 === 25 + 2 * a * 5 + a * a,
      });
    }
    if (stage === 2) {
      const n = rng.int(4, 8);
      const k = rng.int(2, n - 2);
      const ans = choose(n, k);
      return inputQ({
        instruction: "Evaluate the binomial coefficient.",
        prompt: `C(${n}, ${k})`,
        answer: String(ans),
        hint: `C(n, k) = {n!/k!(n − k)!} — or read row ${n} of Pascal's triangle.`,
        steps: [
          `C(${n}, ${k}) = {${n}!/${k}! × ${n - k}!}.`,
          `= ${ans}.`,
        ],
        concept: "Binomial coefficients count the ways to choose k of n factors.",
        verify: () => choose(n - 1, k - 1) + choose(n - 1, k) === ans,
      });
    }
    if (stage === 3) {
      const a = rng.int(1, 4);
      const ans = `x^3 + ${3 * a}x^2 + ${3 * a * a}x + ${a ** 3}`;
      return mcQ({
        instruction: "Expand the binomial.",
        prompt: `(x + ${a})^3`,
        choices: mcChoices(rng, ans, [
          `x^3 + ${a ** 3}`,
          `x^3 + ${3 * a}x^2 + ${3 * a}x + ${a ** 3}`,
          `x^3 + ${2 * a}x^2 + ${a * a}x + ${a ** 3}`,
        ]),
        answer: ans,
        hint: "Use the 1, 3, 3, 1 row of Pascal's triangle.",
        steps: [
          `Coefficients from Pascal's triangle: 1, 3, 3, 1.`,
          `(x + ${a})^3 = x^3 + 3(${a})x^2 + 3(${a})^2 x + ${a}^3.`,
          `= x^3 + ${3 * a}x^2 + ${3 * a * a}x + ${a ** 3}.`,
        ],
        concept: "Pascal's triangle supplies the expansion coefficients.",
        verify: () => (2 + a) ** 3 === 8 + 3 * a * 4 + 3 * a * a * 2 + a ** 3,
      });
    }
    if (stage === 4) {
      const n = rng.int(4, 6);
      const k = rng.int(2, n - 1);
      const a = rng.int(2, 3);
      const ans = choose(n, k) * a ** (n - k);
      return inputQ({
        instruction: "Find the coefficient.",
        prompt: `What is the coefficient of x^${k} in the expansion of (x + ${a})^${n}?`,
        answer: String(ans),
        hint: `The x^${k} term is C(${n}, ${k}) · x^${k} · ${a}^{${n} − ${k}}.`,
        steps: [
          `The general term is C(${n}, r) x^r ${a}^{${n} − r}; take r = ${k}.`,
          `C(${n}, ${k}) = ${choose(n, k)} and ${a}^${n - k} = ${a ** (n - k)}.`,
          `Coefficient: ${choose(n, k)} × ${a ** (n - k)} = ${ans}.`,
        ],
        concept: "Each term's coefficient mixes a Pascal number with powers of a.",
        verify: () => choose(n, n - k) * a ** (n - k) === ans,
      });
    }
    const n = rng.int(3, 4);
    const k = rng.int(1, n - 1);
    const c = rng.int(1, 3);
    const ans = choose(n, k) * 2 ** k * c ** (n - k);
    return inputQ({
      instruction: "Find the coefficient.",
      prompt: `What is the coefficient of x^${k} in the expansion of (2x + ${c})^${n}?`,
      answer: String(ans),
      hint: `The x^${k} term is C(${n}, ${k}) · (2x)^${k} · ${c}^{${n} − ${k}} — the 2 gets raised too.`,
      steps: [
        `Term: C(${n}, ${k}) (2x)^${k} ${c}^${n - k}.`,
        `= ${choose(n, k)} × ${2 ** k}x^${k} × ${c ** (n - k)}.`,
        `Coefficient: ${choose(n, k)} × ${2 ** k} × ${c ** (n - k)} = ${ans}.`,
      ],
      concept: "Inner coefficients get raised to the term's power as well.",
      verify: () => choose(n, n - k) * 2 ** k * c ** (n - k) === ans,
    });
  },
};

/* ---------------------------------------------------------------- financial */
function finSimple(stage: number, rng: Rng): RawQuestion {
  const p = rng.int(1, 10) * 100;
  const r = rng.int(2, 10);
  const t = rng.int(1, 5);
  const i = (p * r * t) / 100;
  if (stage <= 2) {
    const wantTotal = stage === 2;
    const ans = wantTotal ? p + i : i;
    return inputQ({
      instruction: "Compute simple interest.",
      prompt: `$${p} is invested at ${r}% simple interest per year for ${t} years. ${wantTotal ? "What is the total value at the end, in dollars?" : "How much interest is earned, in dollars?"}`,
      answer: String(ans),
      hint: `Interest = P × r × t = ${p} × ${r}% × ${t}.`,
      steps: [
        `One year of interest: ${p} × {${r}/100} = ${(p * r) / 100}.`,
        `Over ${t} years: ${(p * r) / 100} × ${t} = ${i}.`,
        ...(wantTotal ? [`Total: ${p} + ${i} = ${ans}.`] : []),
      ],
      concept: "Simple interest pays the same amount every year.",
      verify: () => (ans - (wantTotal ? p : 0)) * 100 === p * r * t,
    });
  }
  if (stage === 3) {
    return inputQ({
      instruction: "Find the time.",
      prompt: `$${p} at ${r}% simple interest earns $${i} in interest. For how many years was it invested?`,
      answer: String(t),
      hint: `Yearly interest is ${(p * r) / 100}. How many years build up to ${i}?`,
      steps: [
        `Interest per year: ${p} × {${r}/100} = ${(p * r) / 100}.`,
        `t = ${i} ÷ ${(p * r) / 100} = ${t} years.`,
      ],
      concept: "Time is total interest divided by yearly interest.",
      verify: () => ((p * r) / 100) * t === i,
    });
  }
  if (stage === 4) {
    return inputQ({
      instruction: "Find the rate.",
      prompt: `$${p} invested for ${t} years at simple interest earns $${i}. What is the annual rate, as a percent?`,
      answer: String(r),
      hint: `Interest per year is ${i} ÷ ${t}. Compare that with ${p}.`,
      steps: [
        `Interest per year: ${i} ÷ ${t} = ${i / t}.`,
        `Rate: ${i / t} ÷ ${p} = {${r}/100} = ${r}%.`,
      ],
      concept: "The rate is yearly interest as a fraction of the principal.",
      verify: () => (p * r * t) / 100 === i,
    });
  }
  return inputQ({
    instruction: "Find the principal.",
    prompt: `An investment at ${r}% simple interest for ${t} years earned $${i}. How many dollars were invested?`,
    answer: String(p),
    hint: `P × {${r}/100} × ${t} = ${i}. Work backwards.`,
    steps: [
      `P × ${r} × ${t} ÷ 100 = ${i}.`,
      `P = ${i} × 100 ÷ ${r * t} = ${p}.`,
    ],
    concept: "Any one variable of I = Prt can be found from the others.",
    verify: () => (p * r * t) / 100 === i,
  });
}

function finCompound(stage: number, rng: Rng): RawQuestion {
  if (stage === 1) {
    const p = rng.int(2, 20) * 100;
    const r = rng.int(2, 10);
    const ans = p + (p * r) / 100;
    return inputQ({
      instruction: "Compound for one year.",
      prompt: `$${p} is invested at ${r}% compound interest. What is it worth after 1 year, in dollars?`,
      answer: String(ans),
      hint: `Multiply by (1 + {${r}/100}).`,
      steps: [
        `Growth factor: 1 + {${r}/100}.`,
        `${p} × (1 + {${r}/100}) = ${p} + ${(p * r) / 100} = ${ans}.`,
      ],
      concept: "Each year multiplies the balance by the growth factor.",
      verify: () => ans - p === (p * r) / 100,
    });
  }
  const r = rng.pick([10, 20]);
  const f = 1 + r / 100;
  if (stage === 2 || stage === 3) {
    const t = stage === 2 ? 2 : 3;
    const p = (stage === 2 ? rng.int(1, 9) * 100 : rng.int(1, 5) * 1000);
    const ans = Math.round(p * f ** t);
    return inputQ({
      instruction: "Compound over several years.",
      prompt: `$${p} is invested at ${r}% compound interest per year. What is it worth after ${t} years, in dollars?`,
      answer: String(ans),
      hint: `Multiply by ${f} once per year — ${t} times in total.`,
      steps: [
        `Growth factor per year: 1 + {${r}/100} = ${f}.`,
        `A = ${p} × ${f}^${t} = ${p} × ${f ** t}.`,
        `= ${ans}.`,
      ],
      concept: "Compound interest multiplies — it never just adds.",
      verify: () => Math.abs(p * f ** t - ans) < 1e-6,
    });
  }
  if (stage === 4) {
    const p = rng.int(1, 9) * 100;
    const a = Math.round(p * f * f);
    return inputQ({
      instruction: "Find the interest earned.",
      prompt: `$${p} grows at ${r}% compound interest for 2 years. How much interest is earned in total, in dollars?`,
      answer: String(a - p),
      hint: `First find the final amount, then subtract the principal.`,
      steps: [
        `A = ${p} × ${f}^2 = ${p} × ${f * f} = ${a}.`,
        `Interest = ${a} − ${p} = ${a - p}.`,
      ],
      concept: "Interest earned is final value minus starting value.",
      verify: () => Math.abs(p * f * f - p - (a - p)) < 1e-6,
    });
  }
  const p = rng.int(1, 4) * 1000;
  const t = rng.int(2, 3);
  const a = Math.round(p * f ** t);
  return inputQ({
    instruction: "Find the time.",
    prompt: `$${p} at ${r}% compound interest grows to $${a}. After how many years?`,
    answer: String(t),
    hint: `Multiply ${p} by ${f} repeatedly until you reach ${a}.`,
    steps: [
      `After 1 year: ${Math.round(p * f)}.`,
      `After 2 years: ${Math.round(p * f * f)}.${t === 3 ? ` After 3 years: ${a}.` : ""}`,
      `${a} is reached after ${t} years.`,
    ],
    concept: "Track compounding year by year to find elapsed time.",
    verify: () => Math.abs(p * f ** t - a) < 1e-6,
  });
}

function finPercentChange(stage: number, rng: Rng): RawQuestion {
  const p = rng.pick([5, 10, 15, 20, 25, 50]);
  const base = rng.int(2, 15) * 20;
  const inc = stage !== 2;
  if (stage <= 2) {
    const ans = inc ? base + (base * p) / 100 : base - (base * p) / 100;
    return inputQ({
      instruction: `Apply the percent ${inc ? "increase" : "decrease"}.`,
      prompt: `A $${base} item ${inc ? "increases" : "is discounted"} by ${p}%. What is the new price, in dollars?`,
      answer: String(ans),
      hint: `Find ${p}% of ${base} first.`,
      steps: [
        `${p}% of ${base} = ${(base * p) / 100}.`,
        `${base} ${inc ? "+" : "−"} ${(base * p) / 100} = ${ans}.`,
      ],
      concept: "Percent change is computed on the ORIGINAL amount.",
      verify: () => Math.abs(base * (1 + ((inc ? 1 : -1) * p) / 100) - ans) < 1e-9,
    });
  }
  if (stage === 3) {
    const up = rng.chance(0.5);
    const newV = up ? base + (base * p) / 100 : base - (base * p) / 100;
    return inputQ({
      instruction: "Find the percent change.",
      prompt: `A price changes from $${base} to $${newV}. What is the percent ${up ? "increase" : "decrease"}? Give the percent only.`,
      answer: String(p),
      hint: `Divide the change by the ORIGINAL price.`,
      steps: [
        `Change: ${newV} − ${base} = ${sx(newV - base)}.`,
        `${Math.abs(newV - base)} ÷ ${base} = {${p}/100} = ${p}%.`,
      ],
      concept: "Percent change compares the change against the starting value.",
      verify: () => (Math.abs(newV - base) / base) * 100 === p,
    });
  }
  if (stage === 4) {
    const newV = base + (base * p) / 100;
    return inputQ({
      instruction: "Find the original price.",
      prompt: `After a ${p}% increase, a price is $${newV}. What was the original price, in dollars?`,
      answer: String(base),
      hint: `The new price is ${100 + p}% of the original.`,
      steps: [
        `New price = original × (1 + {${p}/100}) = original × {${100 + p}/100}.`,
        `Original = ${newV} × {100/${100 + p}} = ${base}.`,
      ],
      concept: "Undo a percent increase by dividing, never by subtracting the percent.",
      // Integer form: float equality fails here because 180 × 1.1 is 198.00000000000003.
      verify: () => base * (100 + p) === newV * 100,
    });
  }
  const p2 = rng.pick([10, 20, 50]);
  const base2 = rng.int(1, 9) * 100;
  const mid = base2 + (base2 * p2) / 100;
  const finalV = mid - (mid * 10) / 100;
  return inputQ({
    instruction: "Apply two changes in a row.",
    prompt: `A $${base2} price rises ${p2}%, then falls 10%. What is the final price, in dollars?`,
    answer: String(finalV),
    hint: "Apply the changes one at a time, each on the latest price.",
    steps: [
      `After the rise: ${base2} + ${(base2 * p2) / 100} = ${mid}.`,
      `After the fall: ${mid} − ${mid / 10} = ${finalV}.`,
      `Note: the two percents do not simply cancel or add.`,
    ],
    concept: "Successive percent changes multiply, acting on the newest value.",
    verify: () => Math.abs(base2 * (1 + p2 / 100) * 0.9 - finalV) < 1e-9,
  });
}

function finGrowthDecay(stage: number, rng: Rng): RawQuestion {
  if (stage === 1) {
    const v = rng.int(2, 9) * 100;
    const n = rng.int(2, 3);
    const ans = v * 2 ** n;
    return inputQ({
      instruction: "Track the value.",
      prompt: `A collectible worth $${v} doubles in value every decade. What is it worth after ${n} decades, in dollars?`,
      answer: String(ans),
      hint: `Double ${n} times.`,
      steps: [
        `Growth factor 2 per decade: 2^${n} = ${2 ** n}.`,
        `${v} × ${2 ** n} = ${ans}.`,
      ],
      concept: "Doubling repeatedly is exponential growth.",
      verify: () => ans / 2 ** n === v,
    });
  }
  if (stage === 2) {
    const n = rng.int(2, 3);
    const end = rng.int(2, 9) * 100;
    const start = end * 2 ** n;
    return inputQ({
      instruction: "Track the value.",
      prompt: `A machine worth $${start} loses half its value every year. What is it worth after ${n} years, in dollars?`,
      answer: String(end),
      hint: `Halve the value ${n} times.`,
      steps: [
        `Each year multiplies the value by {1/2}.`,
        `${start} ÷ ${2 ** n} = ${end}.`,
      ],
      concept: "Repeated halving is exponential decay.",
      verify: () => end * 2 ** n === start,
    });
  }
  if (stage === 3) {
    const p = rng.int(1, 9) * 100;
    const ans = Math.round(p * 1.21);
    return inputQ({
      instruction: "Compound the growth.",
      prompt: `A value of $${p} grows by 10% each year. What is it after 2 years, in dollars?`,
      answer: String(ans),
      hint: "Multiply by 1.1 twice — not by 1.2 once.",
      steps: [
        `Growth factor: 1.1 per year.`,
        `${p} × 1.1 × 1.1 = ${p} × 1.21 = ${ans}.`,
        `Two 10% rises make 21%, not 20%.`,
      ],
      concept: "Growth percentages compound instead of adding.",
      verify: () => Math.abs(p * 1.21 - ans) < 1e-6,
    });
  }
  if (stage === 4) {
    const p = rng.int(1, 9) * 100;
    const ans = Math.round(p * 0.81);
    return inputQ({
      instruction: "Compound the decay.",
      prompt: `A car worth $${p} loses 10% of its value each year. What is it worth after 2 years, in dollars?`,
      answer: String(ans),
      hint: "Multiply by 0.9 twice.",
      steps: [
        `Each year keeps 90%: factor 0.9.`,
        `${p} × 0.9 × 0.9 = ${p} × 0.81 = ${ans}.`,
      ],
      concept: "Losing 10% twice leaves 81%, not 80%.",
      verify: () => Math.abs(p * 0.81 - ans) < 1e-6,
    });
  }
  const v = rng.int(2, 5) * 100;
  const t = rng.int(3, 5);
  const target = v * 2 ** t;
  return inputQ({
    instruction: "Find the time.",
    prompt: `An investment of $${v} doubles every year. After how many years is it worth $${target}?`,
    answer: String(t),
    hint: `How many doublings turn ${v} into ${target}?`,
    steps: [
      `${target} ÷ ${v} = ${2 ** t} = 2^${t}.`,
      `${t} doublings, so ${t} years.`,
    ],
    concept: "Count growth factors to solve for time.",
    verify: () => v * 2 ** t === target,
  });
}

const financial: GeneratorFamily = {
  stageLabel(skill: SkillRef, st: number) {
    const kind = str(skill.params, "kind", "simple");
    const labels: Record<string, string[]> = {
      simple: ["Interest earned", "Total value", "Find the time", "Find the rate", "Find the principal"],
      compound: ["One year", "Two years", "Three years", "Interest earned", "Find the time"],
      "percent-change": ["Increases", "Decreases", "Find the percent", "Find the original", "Successive changes"],
      "growth-decay": ["Doubling", "Halving", "Percent growth", "Percent decay", "Find the time"],
    };
    return (labels[kind] ?? labels.simple)[st - 1];
  },
  generate(skill, stage, rng): RawQuestion {
    const kind = str(skill.params, "kind", "simple");
    if (kind === "compound") return finCompound(stage, rng);
    if (kind === "percent-change") return finPercentChange(stage, rng);
    if (kind === "growth-decay") return finGrowthDecay(stage, rng);
    return finSimple(stage, rng);
  },
};

export const functionFamilies = {
  "function-notation": functionNotation,
  "domain-range": domainRange,
  "function-transform": functionTransform,
  "composition": composition,
  "inverse-function": inverseFunction,
  "exponential": exponential,
  "logarithm": logarithm,
  "sequence": sequence,
  "series": series,
  "binomial-theorem": binomialTheorem,
  "financial": financial,
} satisfies Record<string, GeneratorFamily>;
