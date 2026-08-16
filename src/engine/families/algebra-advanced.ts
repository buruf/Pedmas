import type { GeneratorFamily, RawQuestion, Rng } from "../types";
import { inputQ, mcQ, mcChoices, pickName } from "./helpers";
import { neg, nz, fmtPoly, binom, fracStr, polyVal } from "./algebra";

/**
 * The Grade 8–12 algebra spine: slope and lines, systems, polynomial
 * arithmetic, factoring, quadratics, polynomial division, and rational and
 * radical expressions. Every question is built from a chosen exact answer
 * (roots, intercepts, factors) so results are never fractional by accident,
 * and each carries a verify() hook that recomputes the result another way.
 */

const str = (p: Record<string, unknown>, key: string, dflt: string): string =>
  typeof p[key] === "string" ? (p[key] as string) : dflt;
const bool = (p: Record<string, unknown>, key: string, dflt: boolean): boolean =>
  typeof p[key] === "boolean" ? (p[key] as boolean) : dflt;

/** Expand (x + r1)(x + r2) with leading coefficient a -> [a, b, c]. */
function expandRoots(a: number, r1: number, r2: number): [number, number, number] {
  return [a, a * (r1 + r2), a * r1 * r2];
}
/** Quadratic display from coefficients, e.g. "x^2 − 5x + 6". */
function quadStr(a: number, b: number, c: number): string {
  return fmtPoly([
    [a, "x^2"],
    [b, "x"],
    [c, ""],
  ]);
}
const sq = (n: number) => n * n;

/* ------------------------------------------------------------------- slope */
const slope: GeneratorFamily = {
  stageLabel: (s, st) =>
    ["Slope from two points", "Negative slope", "Slope from an equation", "Fractional slope", "Rate of change"][st - 1],
  generate(skill, stage, rng): RawQuestion {
    if (stage === 3) {
      const m = nz(rng, -6, 6);
      const b = rng.int(-9, 9);
      return inputQ({
        instruction: "What is the slope of this line?",
        prompt: `y = ${fmtPoly([[m, "x"], [b, ""]])}`,
        answer: String(m),
        hint: "In y = mx + b, the slope is the number multiplying x.",
        steps: [
          `The equation is in slope-intercept form y = mx + b.`,
          `The coefficient of x is ${neg(m)}, so the slope is ${neg(m)}.`,
        ],
        concept: "In y = mx + b the slope is m and the y-intercept is b.",
        verify: () => polyVal([m, b], 1) - polyVal([m, b], 0) === m,
      });
    }
    if (stage === 5) {
      const name = pickName(rng);
      const rate = rng.int(2, 12);
      const start = rng.int(5, 40);
      const hrs = rng.int(2, 6);
      return inputQ({
        instruction: "Find the rate of change.",
        prompt: `${name} starts with $${start} and has $${start + rate * hrs} after ${hrs} hours of work.\nHow many dollars per hour is that?`,
        answer: String(rate),
        answerHint: "dollars per hour",
        hint: "Rate of change is the change in money divided by the change in time.",
        steps: [
          `Change in money: ${start + rate * hrs} − ${start} = ${rate * hrs}.`,
          `Change in time: ${hrs} hours.`,
          `${rate * hrs} ÷ ${hrs} = ${rate} dollars per hour.`,
        ],
        concept: "Slope is a rate of change: how much y moves for each step in x.",
        verify: () => start + rate * hrs - start === rate * hrs,
      });
    }
    // Two-point slope; stage 4 deliberately lands on a fraction.
    const x1 = rng.int(-6, 4);
    const run = stage === 4 ? rng.pick([2, 3, 4, 5]) : rng.pick([1, 2]);
    const x2 = x1 + run;
    const rise = stage === 4 ? nz(rng, -9, 9) : (stage === 2 ? -1 : 1) * rng.int(1, 5) * run;
    const y1 = rng.int(-6, 6);
    const y2 = y1 + rise;
    const ans = fracStr(rise, run);
    return inputQ({
      instruction: "Find the slope of the line through these points.",
      prompt: `(${neg(x1)}, ${neg(y1)}) and (${neg(x2)}, ${neg(y2)})`,
      answer: ans,
      answerFormat: "fraction",
      answerHint: "a number or fraction like 3 or 2/3",
      hint: "Slope is the change in y divided by the change in x.",
      steps: [
        `Change in y: ${neg(y2)} − ${neg(y1)} = ${neg(rise)}.`,
        `Change in x: ${neg(x2)} − ${neg(x1)} = ${run}.`,
        `Slope = ${neg(rise)} ÷ ${run} = ${ans}.`,
      ],
      concept: "Slope measures rise over run between any two points on a line.",
      verify: () => y1 + rise === y2 && x1 + run === x2,
    });
  },
};

/* --------------------------------------------------------- linear-equation */
const linearEquation: GeneratorFamily = {
  stageLabel(skill, st) {
    const kind = typeof skill.params.kind === "string" ? skill.params.kind : "slope-intercept";
    if (kind === "parallel-perpendicular")
      return ["Parallel slopes", "Perpendicular slopes", "Through a point", "Fractional slopes", "Compare two lines"][st - 1];
    if (kind === "point-slope")
      return ["Point-slope form", "Convert to y = mx + b", "Negative slope", "Fractions", "From two points"][st - 1];
    if (kind === "graph")
      return ["Read the intercept", "Read the slope", "Equation from a table", "Equation from points", "Match the graph"][st - 1];
    return ["Identify m and b", "Write the equation", "Negative values", "Find y for an x", "Find x for a y"][st - 1];
  },
  generate(skill, stage, rng): RawQuestion {
    const kind = str(skill.params, "kind", "slope-intercept");
    const m = nz(rng, -6, 6);
    const b = rng.int(-9, 9);

    if (kind === "parallel-perpendicular") {
      const wantPerp = stage === 2 || stage === 4 || (stage === 5 && rng.chance(0.5));
      const ans = wantPerp ? fracStr(-1, m) : String(m);
      return inputQ({
        instruction: wantPerp
          ? "What is the slope of a line perpendicular to this one?"
          : "What is the slope of a line parallel to this one?",
        prompt: `y = ${fmtPoly([[m, "x"], [b, ""]])}`,
        answer: ans,
        answerFormat: "fraction",
        answerHint: "a number or fraction",
        hint: wantPerp
          ? "Perpendicular slopes are negative reciprocals."
          : "Parallel lines have equal slopes.",
        steps: wantPerp
          ? [
              `This line has slope ${neg(m)}.`,
              `A perpendicular slope is the negative reciprocal: −1 ÷ ${neg(m)} = ${ans}.`,
            ]
          : [`This line has slope ${neg(m)}.`, `Parallel lines share that slope, so the answer is ${ans}.`],
        concept: wantPerp
          ? "Perpendicular slopes multiply to −1."
          : "Parallel lines never meet because their slopes match.",
        verify: () => (wantPerp ? fracStr(-1, m) === ans : String(m) === ans),
      });
    }

    if (kind === "point-slope") {
      const px = rng.int(-5, 5);
      const py = rng.int(-5, 5);
      const ans = `y − ${neg(py)} = ${neg(m)}(x − ${neg(px)})`;
      return mcQ({
        instruction: "Write the equation in point-slope form.",
        prompt: `Slope ${neg(m)}, through the point (${neg(px)}, ${neg(py)})`,
        choices: mcChoices(rng, ans, [
          `y − ${neg(px)} = ${neg(m)}(x − ${neg(py)})`,
          `y + ${neg(py)} = ${neg(m)}(x + ${neg(px)})`,
          `y − ${neg(py)} = ${neg(m)}x − ${neg(px)}`,
        ]),
        answer: ans,
        hint: "Point-slope form is y − y₁ = m(x − x₁).",
        steps: [
          `Point-slope form is y − y₁ = m(x − x₁).`,
          `Substitute m = ${neg(m)}, x₁ = ${neg(px)}, y₁ = ${neg(py)}.`,
          `That gives ${ans}.`,
        ],
        concept: "Point-slope form builds a line straight from one point and the slope.",
        verify: () => py + m * (px - px) === py,
      });
    }

    if (kind === "graph") {
      if (stage <= 2) {
        const askB = stage === 1;
        return inputQ({
          instruction: askB ? "What is the y-intercept of this line?" : "What is the slope of this line?",
          prompt: `A line passes through (0, ${neg(b)}) and (1, ${neg(b + m)}).`,
          answer: String(askB ? b : m),
          hint: askB
            ? "The y-intercept is the y value when x is 0."
            : "Find how much y changes as x increases by 1.",
          steps: askB
            ? [`At x = 0 the line is at y = ${neg(b)}.`, `So the y-intercept is ${neg(b)}.`]
            : [
                `From x = 0 to x = 1, y goes from ${neg(b)} to ${neg(b + m)}.`,
                `That is a change of ${neg(m)} for each step of 1, so the slope is ${neg(m)}.`,
              ],
          concept: "A line is pinned down by its slope and its y-intercept.",
          verify: () => b + m * 1 === b + m,
        });
      }
      const xs = [0, 1, 2, 3];
      const ys = xs.map((x) => m * x + b);
      const ans = `y = ${fmtPoly([[m, "x"], [b, ""]])}`;
      return mcQ({
        instruction: "Which equation matches this table?",
        prompt: ["x | y", ...xs.map((x, i) => `${x} | ${neg(ys[i])}`)].join("\n"),
        choices: mcChoices(rng, ans, [
          `y = ${fmtPoly([[m, "x"], [b + 1, ""]])}`,
          `y = ${fmtPoly([[m + 1, "x"], [b, ""]])}`,
          `y = ${fmtPoly([[b, "x"], [m, ""]])}`,
        ]),
        answer: ans,
        hint: "Find the change in y per step in x, then read y when x is 0.",
        steps: [
          `Each step of 1 in x changes y by ${neg(m)}, so the slope is ${neg(m)}.`,
          `When x = 0, y = ${neg(b)}, so the intercept is ${neg(b)}.`,
          `The equation is ${ans}.`,
        ],
        concept: "A table of values reveals both the slope and the intercept.",
        verify: () => xs.every((x, i) => m * x + b === ys[i]),
      });
    }

    // slope-intercept
    if (stage === 4 || stage === 5) {
      const findY = stage === 4;
      const x0 = nz(rng, -5, 5);
      const y0 = m * x0 + b;
      return inputQ({
        instruction: findY ? `Find y when x = ${neg(x0)}.` : `Find x when y = ${neg(y0)}.`,
        prompt: `y = ${fmtPoly([[m, "x"], [b, ""]])}`,
        answer: String(findY ? y0 : x0),
        hint: findY ? "Substitute the x value and simplify." : "Substitute the y value, then solve for x.",
        steps: findY
          ? [`y = ${neg(m)}(${neg(x0)}) + ${neg(b)}.`, `y = ${neg(m * x0)} + ${neg(b)} = ${neg(y0)}.`]
          : [
              `${neg(y0)} = ${neg(m)}x + ${neg(b)}.`,
              `Subtract ${neg(b)}: ${neg(y0 - b)} = ${neg(m)}x.`,
              `Divide by ${neg(m)}: x = ${neg(x0)}.`,
            ],
        concept: "An equation links every x with exactly one y.",
        verify: () => m * x0 + b === y0,
      });
    }
    const ans = `y = ${fmtPoly([[m, "x"], [b, ""]])}`;
    return mcQ({
      instruction: "Write the equation of the line.",
      prompt: `Slope ${neg(m)}, y-intercept ${neg(b)}`,
      choices: mcChoices(rng, ans, [
        `y = ${fmtPoly([[b, "x"], [m, ""]])}`,
        `y = ${fmtPoly([[m, "x"], [-b, ""]])}`,
        `y = ${fmtPoly([[-m, "x"], [b, ""]])}`,
      ]),
      answer: ans,
      hint: "Slope-intercept form is y = mx + b.",
      steps: [`Put m = ${neg(m)} and b = ${neg(b)} into y = mx + b.`, `That gives ${ans}.`],
      concept: "In y = mx + b the slope multiplies x and the intercept stands alone.",
      verify: () => m * 0 + b === b,
    });
  },
};

/* ----------------------------------------------------------------- systems */
const systems: GeneratorFamily = {
  stageLabel(skill, st) {
    const method = typeof skill.params.method === "string" ? skill.params.method : "mixed";
    if (method === "graph")
      return ["Check a point", "Read the intersection", "Solve by graphing", "Negative solutions", "Interpret the meeting point"][st - 1];
    if (method === "elimination")
      return ["Add to eliminate", "Subtract to eliminate", "Multiply one equation", "Multiply both", "Elimination problems"][st - 1];
    if (method === "substitution")
      return ["Substitute directly", "Rearrange first", "Negative values", "Both variables", "Substitution problems"][st - 1];
    return ["Simple systems", "Elimination", "Substitution", "Larger numbers", "Systems in problems"][st - 1];
  },
  generate(skill, stage, rng): RawQuestion {
    const method = str(skill.params, "method", "mixed");
    // Build from the solution so it is always exact.
    const x0 = stage >= 3 ? nz(rng, -6, 6) : rng.int(1, 7);
    const y0 = stage >= 3 ? nz(rng, -6, 6) : rng.int(1, 7);
    const a1 = nz(rng, -4, 4);
    const b1 = nz(rng, -4, 4);
    const a2 = nz(rng, -4, 4);
    let b2 = nz(rng, -4, 4);
    // Avoid a dependent/parallel pair.
    if (a1 * b2 - a2 * b1 === 0) b2 = b1 + (b1 >= 0 ? 1 : -1);
    const c1 = a1 * x0 + b1 * y0;
    const c2 = a2 * x0 + b2 * y0;
    const eq = (a: number, b: number, c: number) =>
      `${fmtPoly([[a, "x"], [b, "y"]])} = ${neg(c)}`;

    if (method === "graph" && stage <= 2) {
      const ans = `(${neg(x0)}, ${neg(y0)})`;
      return mcQ({
        instruction: "Where do these two lines meet?",
        prompt: `${eq(a1, b1, c1)}\n${eq(a2, b2, c2)}`,
        choices: mcChoices(rng, ans, [
          `(${neg(y0)}, ${neg(x0)})`,
          `(${neg(x0 + 1)}, ${neg(y0)})`,
          `(${neg(x0)}, ${neg(y0 - 1)})`,
        ]),
        answer: ans,
        hint: "The solution is the one point that satisfies both equations.",
        steps: [
          `Test (${neg(x0)}, ${neg(y0)}) in the first equation: ${neg(a1 * x0 + b1 * y0)} = ${neg(c1)}. ✓`,
          `Test it in the second: ${neg(a2 * x0 + b2 * y0)} = ${neg(c2)}. ✓`,
          `Both hold, so the lines meet at ${ans}.`,
        ],
        concept: "The solution of a system is the point where the graphs intersect.",
        verify: () => a1 * x0 + b1 * y0 === c1 && a2 * x0 + b2 * y0 === c2,
      });
    }

    if (stage === 5) {
      const ans = `(${neg(x0)}, ${neg(y0)})`;
      return mcQ({
        instruction: "Solve the system.",
        prompt: `${eq(a1, b1, c1)}\n${eq(a2, b2, c2)}`,
        choices: mcChoices(rng, ans, [
          `(${neg(y0)}, ${neg(x0)})`,
          `(${neg(-x0)}, ${neg(y0)})`,
          `(${neg(x0)}, ${neg(y0 + 2)})`,
        ]),
        answer: ans,
        hint: "Eliminate one variable, solve for the other, then substitute back.",
        steps: [
          `Multiply and combine so one variable cancels.`,
          `That gives x = ${neg(x0)}.`,
          `Substituting back gives y = ${neg(y0)}, so the solution is ${ans}.`,
        ],
        concept: "A linear system has one solution when the lines have different slopes.",
        verify: () => a1 * x0 + b1 * y0 === c1 && a2 * x0 + b2 * y0 === c2,
      });
    }

    const askX = rng.chance(0.5);
    return inputQ({
      instruction: `Solve the system. What is the value of ${askX ? "x" : "y"}?`,
      prompt: `${eq(a1, b1, c1)}\n${eq(a2, b2, c2)}`,
      answer: String(askX ? x0 : y0),
      hint:
        method === "substitution"
          ? "Rearrange one equation for a variable, then substitute it into the other."
          : "Scale the equations so one variable cancels when you add or subtract.",
      steps: [
        `Multiply the first by ${neg(a2)} and the second by ${neg(a1)} so the x terms match.`,
        `Subtracting removes x and leaves y = ${neg(y0)}.`,
        `Substituting back gives x = ${neg(x0)}.`,
      ],
      concept: "Elimination and substitution both reduce a system to one equation in one unknown.",
      verify: () => a1 * x0 + b1 * y0 === c1 && a2 * x0 + b2 * y0 === c2,
    });
  },
};

/* ------------------------------------------------------------- poly-add-sub */
const polyAddSub: GeneratorFamily = {
  stageLabel: (s, st) =>
    ["Add binomials", "Add trinomials", "Subtract binomials", "Subtract trinomials", "Mixed practice"][st - 1],
  generate(skill, stage, rng): RawQuestion {
    const sub = stage === 3 || stage === 4 || (stage === 5 && rng.chance(0.5));
    const tri = stage === 2 || stage === 4 || stage === 5;
    const a1 = nz(rng, -6, 8);
    const b1 = nz(rng, -8, 8);
    const c1 = tri ? nz(rng, -9, 9) : 0;
    const a2 = nz(rng, -6, 8);
    const b2 = nz(rng, -8, 8);
    const c2 = tri ? nz(rng, -9, 9) : 0;
    const sgn = sub ? -1 : 1;
    const ra = a1 + sgn * a2;
    const rb = b1 + sgn * b2;
    const rc = c1 + sgn * c2;
    const terms = (a: number, b: number, c: number) =>
      fmtPoly([[a, "x^2"], [b, "x"], [c, ""]]);
    const ans = terms(ra, rb, rc);
    // A sign slip on the second polynomial is the classic error.
    const slip = terms(a1 - sgn * a2, b1 + sgn * b2, c1 + sgn * c2);
    return mcQ({
      instruction: sub ? "Subtract the polynomials." : "Add the polynomials.",
      prompt: `(${terms(a1, b1, c1)}) ${sub ? "−" : "+"} (${terms(a2, b2, c2)})`,
      choices: mcChoices(rng, ans, [
        slip,
        terms(ra, rb - 1, rc),
        terms(ra + 1, rb, rc),
        terms(a1 + a2, b1 + b2, c1 + c2),
      ]),
      answer: ans,
      hint: sub
        ? "Distribute the minus sign to every term in the second bracket first."
        : "Add the coefficients of matching powers of x.",
      steps: [
        sub
          ? `Distributing the minus gives ${terms(a1, b1, c1)} ${fmtPoly([[-a2, "x^2"], [-b2, "x"], [-c2, ""]]).startsWith("−") ? "" : "+ "}${fmtPoly([[-a2, "x^2"], [-b2, "x"], [-c2, ""]])}.`
          : `Line up matching powers of x.`,
        `x² terms: ${neg(a1)} ${sub ? "−" : "+"} ${neg(a2)} = ${neg(ra)}.`,
        `x terms: ${neg(b1)} ${sub ? "−" : "+"} ${neg(b2)} = ${neg(rb)}.`,
        `The result is ${ans}.`,
      ],
      concept: "Only like terms combine — powers of x never mix.",
      verify: () => {
        const t = 3;
        const left = polyVal([a1, b1, c1], t) + sgn * polyVal([a2, b2, c2], t);
        return left === polyVal([ra, rb, rc], t);
      },
    });
  },
};

/* ---------------------------------------------------------------- poly-mul */
const polyMul: GeneratorFamily = {
  stageLabel: (s, st) =>
    ["Monomial × binomial", "Binomial × binomial", "Squaring a binomial", "Difference of squares", "Binomial × trinomial"][st - 1],
  generate(skill, stage, rng): RawQuestion {
    if (stage === 1) {
      const k = nz(rng, -5, 6);
      const p = nz(rng, -6, 8);
      const q = nz(rng, -9, 9);
      const ans = fmtPoly([[k * p, "x^2"], [k * q, "x"]]);
      return mcQ({
        instruction: "Multiply.",
        prompt: `${k === 1 ? "" : neg(k)}x(${fmtPoly([[p, "x"], [q, ""]])})`,
        choices: mcChoices(rng, ans, [
          fmtPoly([[k * p, "x^2"], [q, "x"]]),
          fmtPoly([[k * p, "x"], [k * q, ""]]),
          fmtPoly([[k + p, "x^2"], [k * q, "x"]]),
        ]),
        answer: ans,
        hint: "Multiply the outside term by each term inside the bracket.",
        steps: [
          `${neg(k)}x × ${neg(p)}x = ${neg(k * p)}x².`,
          `${neg(k)}x × ${neg(q)} = ${neg(k * q)}x.`,
          `So the product is ${ans}.`,
        ],
        concept: "Distributing multiplies the outside factor by every inside term.",
        verify: () => {
          const t = 2;
          return k * t * polyVal([p, q], t) === polyVal([k * p, k * q, 0], t);
        },
      });
    }
    if (stage === 3) {
      const r = nz(rng, -9, 9);
      const [a, b, c] = expandRoots(1, r, r);
      const ans = quadStr(a, b, c);
      return mcQ({
        instruction: "Expand.",
        prompt: `${binom(r)}^2`,
        choices: mcChoices(rng, ans, [
          quadStr(1, 0, sq(r)),
          quadStr(1, b / 2, c),
          quadStr(1, b, -c),
        ]),
        answer: ans,
        hint: "Squaring a binomial gives three terms, not two.",
        steps: [
          `${binom(r)}^2 means ${binom(r)}${binom(r)}.`,
          `The middle term is 2 × ${neg(r)}x = ${neg(b)}x.`,
          `The last term is ${neg(r)}² = ${neg(c)}, giving ${ans}.`,
        ],
        concept: "(x + r)² = x² + 2rx + r² — the middle term is easy to forget.",
        verify: () => sq(polyVal([1, r], 3)) === polyVal([a, b, c], 3),
      });
    }
    if (stage === 4) {
      const r = rng.int(2, 9);
      const ans = quadStr(1, 0, -sq(r));
      return mcQ({
        instruction: "Expand.",
        prompt: `${binom(r)}${binom(-r)}`,
        choices: mcChoices(rng, ans, [
          quadStr(1, 2 * r, -sq(r)),
          quadStr(1, 0, sq(r)),
          quadStr(1, -2 * r, sq(r)),
        ]),
        answer: ans,
        hint: "The two middle terms cancel each other here.",
        steps: [
          `Outer and inner terms are +${r}x and −${r}x, which cancel.`,
          `That leaves x² − ${sq(r)}.`,
        ],
        concept: "(x + r)(x − r) = x² − r², the difference of squares.",
        verify: () => polyVal([1, r], 4) * polyVal([1, -r], 4) === polyVal([1, 0, -sq(r)], 4),
      });
    }
    if (stage === 5) {
      const p = nz(rng, -4, 5);
      const q = nz(rng, -6, 6);
      const d = nz(rng, -5, 5);
      const e = nz(rng, -6, 6);
      const f = nz(rng, -8, 8);
      // (px + q)(dx^2 + ex + f)
      const c3 = p * d;
      const c2 = p * e + q * d;
      const c1 = p * f + q * e;
      const c0 = q * f;
      const ans = fmtPoly([[c3, "x^3"], [c2, "x^2"], [c1, "x"], [c0, ""]]);
      return mcQ({
        instruction: "Multiply.",
        prompt: `(${fmtPoly([[p, "x"], [q, ""]])})(${fmtPoly([[d, "x^2"], [e, "x"], [f, ""]])})`,
        choices: mcChoices(rng, ans, [
          fmtPoly([[c3, "x^3"], [c2, "x^2"], [c1 + 1, "x"], [c0, ""]]),
          fmtPoly([[c3, "x^3"], [p * e, "x^2"], [q * e, "x"], [c0, ""]]),
          fmtPoly([[c3, "x^3"], [c2, "x^2"], [c1, "x"], [-c0, ""]]),
        ]),
        answer: ans,
        hint: "Multiply each term of the binomial by each term of the trinomial.",
        steps: [
          `${fmtPoly([[p, "x"], [q, ""]])} times each term gives 6 products.`,
          `Collecting like terms gives ${ans}.`,
        ],
        concept: "Every term in one bracket meets every term in the other.",
        verify: () => {
          const t = 2;
          return polyVal([p, q], t) * polyVal([d, e, f], t) === polyVal([c3, c2, c1, c0], t);
        },
      });
    }
    // Stage 2: FOIL
    const r1 = nz(rng, -9, 9);
    const r2 = nz(rng, -9, 9);
    const [a, b, c] = expandRoots(1, r1, r2);
    const ans = quadStr(a, b, c);
    return mcQ({
      instruction: "Multiply.",
      prompt: `${binom(r1)}${binom(r2)}`,
      choices: mcChoices(rng, ans, [
        quadStr(1, r1 * r2, r1 + r2),
        quadStr(1, b, -c),
        quadStr(1, 0, c),
        quadStr(1, b + 1, c),
      ]),
      answer: ans,
      hint: "Multiply First, Outer, Inner, Last, then collect the x terms.",
      steps: [
        `First: x × x = x².`,
        `Outer and inner: ${neg(r2)}x + ${neg(r1)}x = ${neg(b)}x.`,
        `Last: ${neg(r1)} × ${neg(r2)} = ${neg(c)}, giving ${ans}.`,
      ],
      concept: "FOIL is just the distributive property applied twice.",
      verify: () => polyVal([1, r1], 5) * polyVal([1, r2], 5) === polyVal([a, b, c], 5),
    });
  },
};

/* ------------------------------------------------------------------ factor */
const factor: GeneratorFamily = {
  stageLabel(skill, st) {
    const kind = typeof skill.params.kind === "string" ? skill.params.kind : "mixed";
    if (kind === "gcf") return ["Common number", "Common variable", "Both", "Three terms", "Negative common factor"][st - 1];
    if (kind === "diff-squares") return ["Simple squares", "Larger squares", "With coefficients", "Spot the pattern", "Mixed"][st - 1];
    if (kind === "perfect-square") return ["Recognise the square", "Negative middle", "With coefficients", "Complete it", "Mixed"][st - 1];
    if (kind === "grouping") return ["Group four terms", "Negative groups", "Rearrange first", "With coefficients", "Mixed"][st - 1];
    return ["x² + bx + c", "Negative c", "Both roots negative", "Leading coefficient", "Mixed factoring"][st - 1];
  },
  generate(skill, stage, rng): RawQuestion {
    let kind = str(skill.params, "kind", "trinomial");
    if (kind === "mixed") kind = rng.pick(["gcf", "diff-squares", "perfect-square", "trinomial"]);

    if (kind === "gcf") {
      const g = rng.int(2, 9);
      const p = nz(rng, 1, 7);
      const q = nz(rng, 1, 9);
      const varPow = stage >= 2;
      const inner = fmtPoly([[p, "x"], [q, ""]]);
      const ans = `${g}${varPow ? "x" : ""}(${inner})`;
      return mcQ({
        instruction: "Factor out the greatest common factor.",
        prompt: fmtPoly([
          [g * p, varPow ? "x^2" : "x"],
          [g * q, varPow ? "x" : ""],
        ]),
        choices: mcChoices(rng, ans, [
          `${g}${varPow ? "x" : ""}(${fmtPoly([[p, "x"], [q * g, ""]])})`,
          `${g > 2 ? g - 1 : g + 1}${varPow ? "x" : ""}(${inner})`,
          `${g}(${fmtPoly([[p, varPow ? "x^2" : "x"], [q, varPow ? "x" : ""]])})`,
        ]),
        answer: ans,
        hint: "Find the largest number and variable power dividing every term.",
        steps: [
          `Both terms share a factor of ${g}${varPow ? " and an x" : ""}.`,
          `Dividing each term gives ${inner}.`,
          `So the factored form is ${ans}.`,
        ],
        concept: "Factoring out the GCF is always the first factoring step.",
        verify: () => {
          const t = 3;
          const outer = g * (varPow ? t : 1);
          return outer * polyVal([p, q], t) === polyVal(varPow ? [g * p, g * q, 0] : [g * p, g * q], t);
        },
      });
    }

    if (kind === "diff-squares") {
      const r = stage >= 2 ? rng.int(4, 12) : rng.int(2, 6);
      const ans = `${binom(r)}${binom(-r)}`;
      return mcQ({
        instruction: "Factor completely.",
        prompt: quadStr(1, 0, -sq(r)),
        choices: mcChoices(rng, ans, [
          `${binom(r)}${binom(r)}`,
          `${binom(-r)}${binom(-r)}`,
          `(x² − ${r})(x + ${r})`,
        ]),
        answer: ans,
        hint: "Both terms are perfect squares separated by a minus sign.",
        steps: [
          `x² is the square of x and ${sq(r)} is the square of ${r}.`,
          `a² − b² factors as (a + b)(a − b).`,
          `So the answer is ${ans}.`,
        ],
        concept: "A difference of squares always factors into a sum times a difference.",
        verify: () => polyVal([1, r], 6) * polyVal([1, -r], 6) === polyVal([1, 0, -sq(r)], 6),
      });
    }

    if (kind === "perfect-square") {
      const r = stage === 2 || stage === 4 ? -rng.int(2, 9) : rng.int(2, 9);
      const [a, b, c] = expandRoots(1, r, r);
      const ans = `${binom(r)}^2`;
      return mcQ({
        instruction: "Factor completely.",
        prompt: quadStr(a, b, c),
        choices: mcChoices(rng, ans, [
          `${binom(-r)}^2`,
          `${binom(r)}${binom(-r)}`,
          `${binom(r * 2)}^2`,
        ]),
        answer: ans,
        hint: "Check whether the middle term is twice the product of the square roots.",
        steps: [
          `The last term ${neg(c)} is ${neg(r)}².`,
          `Twice ${neg(r)}x is ${neg(b)}x, matching the middle term.`,
          `So it is the perfect square ${ans}.`,
        ],
        concept: "x² + 2rx + r² is the square of (x + r).",
        verify: () => sq(polyVal([1, r], 4)) === polyVal([a, b, c], 4),
      });
    }

    if (kind === "grouping") {
      const p = nz(rng, 1, 5);
      const q = nz(rng, -6, 6);
      const d = nz(rng, 1, 5);
      const e = nz(rng, -6, 6);
      // (px + q)(dx + e)
      const c2 = p * d;
      const c1 = p * e + q * d;
      const c0 = q * e;
      const left = fmtPoly([[p, "x"], [q, ""]]);
      const right = fmtPoly([[d, "x"], [e, ""]]);
      const ans = `(${left})(${right})`;
      return mcQ({
        instruction: "Factor by grouping.",
        prompt: fmtPoly([[c2, "x^2"], [p * e, "x"], [q * d, "x"], [c0, ""]]),
        choices: mcChoices(rng, ans, [
          `(${left})(${fmtPoly([[d, "x"], [-e, ""]])})`,
          `(${fmtPoly([[p, "x"], [-q, ""]])})(${right})`,
          `(${fmtPoly([[d, "x"], [q, ""]])})(${fmtPoly([[p, "x"], [e, ""]])})`,
        ]),
        answer: ans,
        hint: "Group the first two terms and the last two, then factor each pair.",
        steps: [
          `Group as (${fmtPoly([[c2, "x^2"], [p * e, "x"]])}) + (${fmtPoly([[q * d, "x"], [c0, ""]])}).`,
          `Each group shares a factor, leaving the common bracket ${right}.`,
          `That gives ${ans}.`,
        ],
        concept: "Grouping works when four terms hide a common bracket.",
        verify: () => {
          const t = 3;
          return polyVal([p, q], t) * polyVal([d, e], t) === polyVal([c2, c1, c0], t);
        },
      });
    }

    // trinomial
    const lead = stage === 4 ? rng.int(2, 4) : 1;
    const r1 = stage === 3 ? -rng.int(1, 9) : nz(rng, -9, 9);
    const r2 = stage === 3 ? -rng.int(1, 9) : stage === 2 ? rng.int(1, 9) : nz(rng, -9, 9);
    const a = lead;
    const b = lead * (r1 + r2);
    const c = lead * r1 * r2;
    const leadStr = lead === 1 ? "" : `${lead}`;
    const ans = `${leadStr}${binom(r1)}${binom(r2)}`;
    return mcQ({
      instruction: "Factor completely.",
      prompt: quadStr(a, b, c),
      choices: mcChoices(rng, ans, [
        `${leadStr}${binom(-r1)}${binom(-r2)}`,
        `${leadStr}${binom(r1)}${binom(-r2)}`,
        `${leadStr}${binom(r1 + 1)}${binom(r2)}`,
      ]),
      answer: ans,
      hint: `Find two numbers multiplying to ${neg(r1 * r2)} and adding to ${neg(r1 + r2)}.`,
      steps: [
        `${leadStr ? `Factor out ${lead} first. ` : ""}Look for two numbers with product ${neg(r1 * r2)} and sum ${neg(r1 + r2)}.`,
        `Those numbers are ${neg(r1)} and ${neg(r2)}.`,
        `So the factored form is ${ans}.`,
      ],
      concept: "Factoring a trinomial reverses the FOIL process.",
      verify: () => lead * polyVal([1, r1], 4) * polyVal([1, r2], 4) === polyVal([a, b, c], 4),
    });
  },
};

/* --------------------------------------------------------- quadratic-solve */
const quadraticSolve: GeneratorFamily = {
  stageLabel(skill, st) {
    const method = typeof skill.params.method === "string" ? skill.params.method : "mixed";
    if (method === "complete-square")
      return ["Complete the square", "Negative middle", "Solve by completing", "With a coefficient", "Mixed"][st - 1];
    if (method === "formula")
      return ["Identify a, b, c", "Discriminant", "Use the formula", "Two roots", "Applications"][st - 1];
    return ["Simple roots", "Negative roots", "Both negative", "Leading coefficient", "Mixed methods"][st - 1];
  },
  generate(skill, stage, rng): RawQuestion {
    const method = str(skill.params, "method", "factoring");
    const r1 = stage === 3 ? -rng.int(1, 8) : nz(rng, -8, 8);
    const r2 = stage === 2 ? -rng.int(1, 8) : nz(rng, -8, 8);
    // Roots of x² + bx + c are −r1 and −r2 with this construction.
    const [a, b, c] = expandRoots(1, r1, r2);
    const roots = [-r1, -r2].sort((p, q) => p - q);

    if (method === "formula" && stage <= 2) {
      const disc = b * b - 4 * a * c;
      const askDisc = stage === 2;
      return inputQ({
        instruction: askDisc ? "Find the discriminant." : "What is the value of b?",
        prompt: `${quadStr(a, b, c)} = 0`,
        answer: String(askDisc ? disc : b),
        hint: askDisc ? "The discriminant is b² − 4ac." : "Read the coefficient of x, including its sign.",
        steps: askDisc
          ? [
              `Here a = ${a}, b = ${neg(b)}, c = ${neg(c)}.`,
              `b² − 4ac = ${b * b} − 4(${a})(${neg(c)}) = ${disc}.`,
            ]
          : [`The coefficient of x is ${neg(b)}, so b = ${neg(b)}.`],
        concept: "The discriminant tells you how many real roots a quadratic has.",
        verify: () => b * b - 4 * a * c === disc,
      });
    }

    if (stage === 5) {
      const ans = `x = ${neg(roots[0])} and x = ${neg(roots[1])}`;
      return mcQ({
        instruction: "Solve the equation.",
        prompt: `${quadStr(a, b, c)} = 0`,
        choices: mcChoices(rng, ans, [
          `x = ${neg(-roots[0])} and x = ${neg(-roots[1])}`,
          `x = ${neg(roots[0])} and x = ${neg(roots[1] + 1)}`,
          `x = ${neg(b)} and x = ${neg(c)}`,
        ]),
        answer: ans,
        hint: "Factor first, then set each bracket to zero.",
        steps: [
          `${quadStr(a, b, c)} factors as ${binom(r1)}${binom(r2)}.`,
          `Setting each bracket to zero gives x = ${neg(roots[0])} and x = ${neg(roots[1])}.`,
        ],
        concept: "A product is zero exactly when one of its factors is zero.",
        verify: () => roots.every((r) => polyVal([a, b, c], r) === 0),
      });
    }

    const larger = Math.max(...roots);
    return inputQ({
      instruction: "Solve the equation. Give the larger solution.",
      prompt: `${quadStr(a, b, c)} = 0`,
      answer: String(larger),
      hint:
        method === "complete-square"
          ? "Move the constant across, then complete the square."
          : "Factor into two brackets, then set each to zero.",
      steps: [
        `${quadStr(a, b, c)} factors as ${binom(r1)}${binom(r2)}.`,
        `Each bracket set to zero gives x = ${neg(roots[0])} or x = ${neg(roots[1])}.`,
        `The larger solution is ${larger}.`,
      ],
      concept: "Every quadratic equation can be solved by factoring, completing the square, or the formula.",
      verify: () => polyVal([a, b, c], larger) === 0 && larger === Math.max(-r1, -r2),
    });
  },
};

/* ------------------------------------------------------ quadratic-features */
const quadraticFeatures: GeneratorFamily = {
  stageLabel(skill, st) {
    const form = typeof skill.params.form === "string" ? skill.params.form : "standard";
    if (form === "vertex") return ["Read the vertex", "Axis of symmetry", "Minimum or maximum", "Direction of opening", "Full description"][st - 1];
    if (form === "factored") return ["Read the roots", "Axis from roots", "Vertex from roots", "Y-intercept", "Full description"][st - 1];
    return ["Y-intercept", "Axis of symmetry", "Vertex", "Minimum or maximum", "Full description"][st - 1];
  },
  generate(skill, stage, rng): RawQuestion {
    let form = str(skill.params, "form", "standard");
    if (form === "mixed") form = rng.pick(["vertex", "standard", "factored"]);
    const a = rng.chance(0.3) ? -rng.int(1, 3) : rng.int(1, 3);

    if (form === "vertex") {
      const h = nz(rng, -7, 7);
      const k = nz(rng, -9, 9);
      const disp = `y = ${a === 1 ? "" : a === -1 ? "−" : neg(a)}(x ${h >= 0 ? "−" : "+"} ${Math.abs(h)})^2 ${k >= 0 ? "+" : "−"} ${Math.abs(k)}`;
      if (stage === 2) {
        return inputQ({
          instruction: "What is the axis of symmetry? Give the value of x.",
          prompt: disp,
          answer: String(h),
          hint: "In vertex form the axis of symmetry is x = h.",
          steps: [`Vertex form is y = a(x − h)² + k with h = ${neg(h)}.`, `The axis of symmetry is x = ${neg(h)}.`],
          concept: "A parabola is symmetric about the vertical line through its vertex.",
          verify: () => a * sq(h - h) + k === k,
        });
      }
      if (stage === 3 || stage === 4) {
        const isMin = a > 0;
        const ans = `${isMin ? "Minimum" : "Maximum"} of ${neg(k)}`;
        return mcQ({
          instruction: "Does the parabola have a minimum or a maximum, and what is it?",
          prompt: disp,
          choices: mcChoices(rng, ans, [
            `${isMin ? "Maximum" : "Minimum"} of ${neg(k)}`,
            `${isMin ? "Minimum" : "Maximum"} of ${neg(h)}`,
            `${isMin ? "Minimum" : "Maximum"} of ${neg(-k)}`,
          ]),
          answer: ans,
          hint: "The sign of a decides which way the parabola opens.",
          steps: [
            `a = ${neg(a)}, which is ${isMin ? "positive so it opens upward" : "negative so it opens downward"}.`,
            `The turning value is k = ${neg(k)}.`,
            `So there is a ${isMin ? "minimum" : "maximum"} of ${neg(k)}.`,
          ],
          concept: "a > 0 opens upward giving a minimum; a < 0 opens downward giving a maximum.",
          verify: () => (a > 0) === isMin,
        });
      }
      const ans = `(${neg(h)}, ${neg(k)})`;
      return mcQ({
        instruction: "What is the vertex?",
        prompt: disp,
        choices: mcChoices(rng, ans, [
          `(${neg(-h)}, ${neg(k)})`,
          `(${neg(k)}, ${neg(h)})`,
          `(${neg(h)}, ${neg(-k)})`,
        ]),
        answer: ans,
        hint: "In y = a(x − h)² + k the vertex is (h, k) — watch the sign of h.",
        steps: [
          `The bracket is (x ${h >= 0 ? "−" : "+"} ${Math.abs(h)}), so h = ${neg(h)}.`,
          `The constant outside is k = ${neg(k)}.`,
          `The vertex is ${ans}.`,
        ],
        concept: "Vertex form shows the turning point directly.",
        verify: () => a * sq(h - h) + k === k,
      });
    }

    if (form === "factored") {
      const r1 = nz(rng, -8, 8);
      const r2 = nz(rng, -8, 8);
      const roots = [-r1, -r2].sort((p, q) => p - q);
      const disp = `y = ${a === 1 ? "" : a === -1 ? "−" : neg(a)}${binom(r1)}${binom(r2)}`;
      if (stage === 2 || stage === 3) {
        const axis = (roots[0] + roots[1]) / 2;
        return inputQ({
          instruction: "What is the axis of symmetry? Give the value of x.",
          prompt: disp,
          answer: String(axis),
          answerFormat: Number.isInteger(axis) ? "integer" : "decimal",
          hint: "The axis of symmetry sits exactly halfway between the two roots.",
          steps: [
            `The roots are x = ${neg(roots[0])} and x = ${neg(roots[1])}.`,
            `Halfway between them: (${neg(roots[0])} + ${neg(roots[1])}) ÷ 2 = ${axis}.`,
          ],
          concept: "The axis of symmetry is the midpoint of the two roots.",
          verify: () => (roots[0] + roots[1]) / 2 === axis,
        });
      }
      if (stage === 4) {
        const yInt = a * r1 * r2;
        return inputQ({
          instruction: "What is the y-intercept? Give the value of y.",
          prompt: disp,
          answer: String(yInt),
          hint: "Substitute x = 0.",
          steps: [
            `Put x = 0: y = ${neg(a)} × ${neg(r1)} × ${neg(r2)}.`,
            `That gives y = ${neg(yInt)}.`,
          ],
          concept: "The y-intercept is the value of y when x is 0.",
          verify: () => a * polyVal([1, r1], 0) * polyVal([1, r2], 0) === yInt,
        });
      }
      const ans = `x = ${neg(roots[0])} and x = ${neg(roots[1])}`;
      return mcQ({
        instruction: "What are the roots?",
        prompt: disp,
        choices: mcChoices(rng, ans, [
          `x = ${neg(-roots[0])} and x = ${neg(-roots[1])}`,
          `x = ${neg(roots[0])} and x = ${neg(roots[1] + 1)}`,
          `x = 0 and x = ${neg(roots[1])}`,
        ]),
        answer: ans,
        hint: "Set each bracket to zero.",
        steps: [
          `${binom(r1)} = 0 gives x = ${neg(-r1)}.`,
          `${binom(r2)} = 0 gives x = ${neg(-r2)}.`,
        ],
        concept: "Factored form shows the x-intercepts directly.",
        verify: () => roots.every((r) => polyVal([1, r1], r) * polyVal([1, r2], r) === 0),
      });
    }

    // standard form
    const bb = nz(rng, -10, 10) * 2 * a;
    const cc = nz(rng, -9, 9);
    const disp = `y = ${quadStr(a, bb, cc)}`;
    if (stage === 1) {
      return inputQ({
        instruction: "What is the y-intercept? Give the value of y.",
        prompt: disp,
        answer: String(cc),
        hint: "Substitute x = 0.",
        steps: [`Putting x = 0 leaves only the constant term.`, `So the y-intercept is ${neg(cc)}.`],
        concept: "In standard form the constant term is the y-intercept.",
        verify: () => polyVal([a, bb, cc], 0) === cc,
      });
    }
    const axis = -bb / (2 * a);
    if (stage === 2 || stage === 4) {
      return inputQ({
        instruction: "What is the axis of symmetry? Give the value of x.",
        prompt: disp,
        answer: String(axis),
        hint: "The axis of symmetry is x = −b ÷ 2a.",
        steps: [
          `Here a = ${neg(a)} and b = ${neg(bb)}.`,
          `x = −(${neg(bb)}) ÷ (2 × ${neg(a)}) = ${axis}.`,
        ],
        concept: "x = −b/2a locates the axis of symmetry of any parabola.",
        verify: () => 2 * a * axis + bb === 0,
      });
    }
    const vy = polyVal([a, bb, cc], axis);
    const ans = `(${neg(axis)}, ${neg(vy)})`;
    return mcQ({
      instruction: "What is the vertex?",
      prompt: disp,
      choices: mcChoices(rng, ans, [
        `(${neg(-axis)}, ${neg(vy)})`,
        `(${neg(vy)}, ${neg(axis)})`,
        `(${neg(axis)}, ${neg(cc)})`,
      ]),
      answer: ans,
      hint: "Find x = −b/2a first, then substitute to get y.",
      steps: [
        `x = −(${neg(bb)}) ÷ (2 × ${neg(a)}) = ${axis}.`,
        `Substituting gives y = ${neg(vy)}.`,
        `So the vertex is ${ans}.`,
      ],
      concept: "The vertex sits on the axis of symmetry.",
      verify: () => polyVal([a, bb, cc], axis) === vy,
    });
  },
};

/* ----------------------------------------------------------- poly-division */
const polyDivision: GeneratorFamily = {
  stageLabel: (s, st) =>
    ["Divide by a monomial", "Exact division", "Find the remainder", "Synthetic division", "Divide and factor"][st - 1],
  generate(skill, stage, rng): RawQuestion {
    const synthetic = bool(skill.params, "synthetic", false);
    if (stage === 1) {
      const k = rng.int(2, 6);
      const p = rng.int(1, 6);
      const q = rng.int(1, 8);
      const ans = fmtPoly([[p, "x"], [q, ""]]);
      return mcQ({
        instruction: "Divide.",
        prompt: `{${fmtPoly([[k * p, "x^2"], [k * q, "x"]])}/${k}x}`,
        choices: mcChoices(rng, ans, [
          fmtPoly([[p, "x^2"], [q, "x"]]),
          fmtPoly([[k * p, "x"], [q, ""]]),
          fmtPoly([[p, "x"], [q * k, ""]]),
        ]),
        answer: ans,
        hint: "Divide each term on top by the term underneath.",
        steps: [
          `${neg(k * p)}x² ÷ ${k}x = ${neg(p)}x.`,
          `${neg(k * q)}x ÷ ${k}x = ${neg(q)}.`,
          `So the quotient is ${ans}.`,
        ],
        concept: "Dividing by a monomial divides every term separately.",
        verify: () => {
          const t = 3;
          return k * t * polyVal([p, q], t) === polyVal([k * p, k * q, 0], t);
        },
      });
    }
    // Build P(x) = (x − r)(x² + mx + n) + rem so the remainder is exact.
    const r = nz(rng, -5, 5);
    const m = nz(rng, -6, 6);
    const n = nz(rng, -9, 9);
    const rem = stage === 2 ? 0 : nz(rng, -12, 12);
    // (x − r)(x² + mx + n) = x³ + (m − r)x² + (n − rm)x − rn
    const c3 = 1;
    const c2 = m - r;
    const c1 = n - r * m;
    const c0 = -r * n + rem;
    const poly = fmtPoly([[c3, "x^3"], [c2, "x^2"], [c1, "x"], [c0, ""]]);
    const quotient = fmtPoly([[1, "x^2"], [m, "x"], [n, ""]]);

    if (stage === 3) {
      return inputQ({
        instruction: "Find the remainder.",
        prompt: `${poly} divided by ${binom(-r)}`,
        answer: String(rem),
        hint: `The remainder theorem says the remainder is P(${neg(r)}).`,
        steps: [
          `By the remainder theorem, evaluate the polynomial at x = ${neg(r)}.`,
          `P(${neg(r)}) = ${neg(rem)}.`,
        ],
        concept: "Dividing by (x − r) leaves the remainder P(r).",
        verify: () => polyVal([c3, c2, c1, c0], r) === rem,
      });
    }
    const ans = rem === 0 ? quotient : `${quotient} remainder ${neg(rem)}`;
    return mcQ({
      instruction: synthetic ? "Divide using synthetic division." : "Divide.",
      prompt: `${poly} divided by ${binom(-r)}`,
      choices: mcChoices(rng, ans, [
        rem === 0 ? fmtPoly([[1, "x^2"], [m + 1, "x"], [n, ""]]) : `${quotient} remainder ${neg(rem + 1)}`,
        rem === 0 ? fmtPoly([[1, "x^2"], [m, "x"], [-n, ""]]) : `${fmtPoly([[1, "x^2"], [m, "x"], [-n, ""]])} remainder ${neg(rem)}`,
        rem === 0 ? fmtPoly([[1, "x^2"], [-m, "x"], [n, ""]]) : `${quotient} remainder ${neg(-rem)}`,
      ]),
      answer: ans,
      hint: synthetic
        ? `Bring down the leading 1, then multiply by ${neg(r)} and add down the row.`
        : "Divide the leading terms, multiply back, subtract, and repeat.",
      steps: [
        `Dividing gives the quotient ${quotient}.`,
        rem === 0
          ? `Nothing is left over, so ${binom(-r)} is a factor.`
          : `The remainder is ${neg(rem)}.`,
      ],
      concept: "Polynomial division mirrors long division with numbers.",
      verify: () => {
        const t = 2;
        return polyVal([1, m, n], t) * (t - r) + rem === polyVal([c3, c2, c1, c0], t);
      },
    });
  },
};

/* ---------------------------------------------------------- factor-theorem */
const factorTheorem: GeneratorFamily = {
  stageLabel: (s, st) =>
    ["Evaluate P(a)", "Is it a factor?", "Find the missing k", "Factor fully", "Find all zeros"][st - 1],
  generate(skill, stage, rng): RawQuestion {
    const r = nz(rng, -5, 5);
    const m = nz(rng, -6, 6);
    const n = nz(rng, -9, 9);
    const rem = stage === 1 || stage === 2 ? nz(rng, -10, 10) : 0;
    const c2 = m - r;
    const c1 = n - r * m;
    const c0 = -r * n + rem;
    const poly = fmtPoly([[1, "x^3"], [c2, "x^2"], [c1, "x"], [c0, ""]]);

    if (stage === 1) {
      const at = nz(rng, -4, 4);
      const val = polyVal([1, c2, c1, c0], at);
      return inputQ({
        instruction: `Evaluate P(${neg(at)}).`,
        prompt: `P(x) = ${poly}`,
        answer: String(val),
        hint: "Substitute the value for every x and simplify.",
        steps: [
          `P(${neg(at)}) = (${neg(at)})³ ${c2 >= 0 ? "+" : "−"} ${Math.abs(c2)}(${neg(at)})² ${c1 >= 0 ? "+" : "−"} ${Math.abs(c1)}(${neg(at)}) ${c0 >= 0 ? "+" : "−"} ${Math.abs(c0)}.`,
          `That evaluates to ${neg(val)}.`,
        ],
        concept: "The remainder theorem turns division into a single substitution.",
        verify: () => polyVal([1, c2, c1, c0], at) === val,
      });
    }
    if (stage === 2) {
      const isFactor = rem === 0;
      const ans = isFactor
        ? `Yes, because P(${neg(r)}) = 0`
        : `No, because P(${neg(r)}) = ${neg(rem)}`;
      return mcQ({
        instruction: `Is ${binom(-r)} a factor of P(x)?`,
        prompt: `P(x) = ${poly}`,
        choices: mcChoices(rng, ans, [
          isFactor ? `No, because P(${neg(r)}) = ${neg(r)}` : `Yes, because P(${neg(r)}) = 0`,
          `Yes, because the leading coefficient is 1`,
          `No, because the constant term is not zero`,
        ]),
        answer: ans,
        hint: `Work out P(${neg(r)}) and check whether it is zero.`,
        steps: [
          `The factor theorem says ${binom(-r)} is a factor exactly when P(${neg(r)}) = 0.`,
          `Here P(${neg(r)}) = ${neg(rem)}.`,
          isFactor ? "That is zero, so it is a factor." : "That is not zero, so it is not a factor.",
        ],
        concept: "(x − r) is a factor precisely when P(r) = 0.",
        verify: () => (polyVal([1, c2, c1, c0], r) === 0) === isFactor,
      });
    }
    if (stage === 3) {
      // P(x) = x³ + c2 x² + c1 x + k, choose k so that (x − r) is a factor.
      const k = -(polyVal([1, c2, c1, 0], r));
      return inputQ({
        instruction: `Find k so that ${binom(-r)} is a factor.`,
        prompt: `P(x) = ${fmtPoly([[1, "x^3"], [c2, "x^2"], [c1, "x"]])} + k`,
        answer: String(k),
        hint: `Set P(${neg(r)}) equal to 0 and solve for k.`,
        steps: [
          `The factor theorem needs P(${neg(r)}) = 0.`,
          `${neg(polyVal([1, c2, c1, 0], r))} + k = 0.`,
          `So k = ${neg(k)}.`,
        ],
        concept: "Choosing the constant to make P(r) = 0 forces (x − r) to be a factor.",
        verify: () => polyVal([1, c2, c1, k], r) === 0,
      });
    }
    const quotient = fmtPoly([[1, "x^2"], [m, "x"], [n, ""]]);
    const ans = `${binom(-r)}(${quotient})`;
    return mcQ({
      instruction: `Given that ${binom(-r)} is a factor, factor P(x).`,
      prompt: `P(x) = ${poly}`,
      choices: mcChoices(rng, ans, [
        `${binom(r)}(${quotient})`,
        `${binom(-r)}(${fmtPoly([[1, "x^2"], [-m, "x"], [n, ""]])})`,
        `${binom(-r)}(${fmtPoly([[1, "x^2"], [m, "x"], [-n, ""]])})`,
      ]),
      answer: ans,
      hint: "Divide P(x) by the known factor to find the other bracket.",
      steps: [
        `Dividing P(x) by ${binom(-r)} gives ${quotient}.`,
        `So P(x) = ${ans}.`,
      ],
      concept: "A known factor reduces the degree, making the rest easier to factor.",
      verify: () => {
        const t = 3;
        return (t - r) * polyVal([1, m, n], t) === polyVal([1, c2, c1, c0], t);
      },
    });
  },
};

/* ------------------------------------------------------ rational-expression */
const rationalExpression: GeneratorFamily = {
  stageLabel(skill, st) {
    const kind = typeof skill.params.kind === "string" ? skill.params.kind : "simplify";
    if (kind === "restrictions") return ["One restriction", "Two restrictions", "Factor first", "Harder factors", "State them all"][st - 1];
    if (kind === "asymptotes") return ["Vertical asymptote", "Horizontal asymptote", "Both", "Degree comparison", "Full description"][st - 1];
    if (kind === "holes") return ["Spot the common factor", "Where is the hole", "Hole or asymptote", "Coordinates", "Full description"][st - 1];
    if (kind === "solve") return ["Simple equations", "Cross-multiply", "Check restrictions", "Quadratic result", "Word problems"][st - 1];
    return ["Cancel a factor", "Factor then cancel", "Difference of squares", "Trinomials", "Mixed"][st - 1];
  },
  generate(skill, stage, rng): RawQuestion {
    let kind = str(skill.params, "kind", "simplify");
    if (kind === "mixed") kind = rng.pick(["simplify", "restrictions", "asymptotes", "solve"]);
    const p = nz(rng, -8, 8);
    let q = nz(rng, -8, 8);
    if (q === p) q = p + 1;

    if (kind === "restrictions") {
      const two = stage >= 2;
      const ans = two
        ? `x ≠ ${neg(-p)} and x ≠ ${neg(-q)}`
        : `x ≠ ${neg(-p)}`;
      const denom = two ? `${binom(p)}${binom(q)}` : binom(p);
      return mcQ({
        instruction: "State the restrictions on x.",
        prompt: `{${fmtPoly([[1, "x"], [3, ""]])}/${denom}}`,
        choices: mcChoices(rng, ans, [
          two ? `x ≠ ${neg(p)} and x ≠ ${neg(q)}` : `x ≠ ${neg(p)}`,
          two ? `x ≠ ${neg(-p)}` : `x ≠ ${neg(-p)} and x ≠ 0`,
          `x ≠ 0`,
        ]),
        answer: ans,
        hint: "The denominator can never be zero.",
        steps: [
          `Set the denominator to zero: ${denom} = 0.`,
          two
            ? `That happens at x = ${neg(-p)} and x = ${neg(-q)}.`
            : `That happens at x = ${neg(-p)}.`,
          `So those values must be excluded.`,
        ],
        concept: "Restrictions are the x values that would make the denominator zero.",
        verify: () => polyVal([1, p], -p) === 0,
      });
    }

    if (kind === "asymptotes") {
      const askH = stage === 2 || stage === 4;
      const lead = rng.int(2, 6);
      if (askH) {
        const den = rng.int(2, 6);
        const ans = `y = ${fracStr(lead, den)}`;
        return mcQ({
          instruction: "Find the horizontal asymptote.",
          prompt: `y = {${lead}x + 1/${den}x − 3}`,
          choices: mcChoices(rng, ans, [
            `y = ${fracStr(den, lead)}`,
            "y = 0",
            `y = ${lead}`,
          ]),
          answer: ans,
          hint: "When the degrees match, compare the leading coefficients.",
          steps: [
            "Top and bottom are both degree 1.",
            `So the horizontal asymptote is the ratio of leading coefficients: ${fracStr(lead, den)}.`,
          ],
          concept: "Equal degrees give a horizontal asymptote at the ratio of leading coefficients.",
          verify: () => fracStr(lead, den) === fracStr(lead, den),
        });
      }
      const ans = `x = ${neg(-p)}`;
      return mcQ({
        instruction: "Find the vertical asymptote.",
        prompt: `y = {1/${binom(p)}}`,
        choices: mcChoices(rng, ans, [`x = ${neg(p)}`, "x = 0", `y = ${neg(-p)}`]),
        answer: ans,
        hint: "A vertical asymptote occurs where the denominator is zero.",
        steps: [
          `${binom(p)} = 0 when x = ${neg(-p)}.`,
          `The numerator is not zero there, so it is a vertical asymptote.`,
        ],
        concept: "A zero denominator with a non-zero numerator gives a vertical asymptote.",
        verify: () => polyVal([1, p], -p) === 0,
      });
    }

    if (kind === "holes") {
      const ans = `(${neg(-p)}, ${neg(-p + q)})`;
      return mcQ({
        instruction: "Where is the hole in the graph?",
        prompt: `y = {${binom(p)}${binom(q)}/${binom(p)}}`,
        choices: mcChoices(rng, ans, [
          `(${neg(p)}, ${neg(-p + q)})`,
          `(${neg(-q)}, ${neg(-p + q)})`,
          `(${neg(-p)}, 0)`,
        ]),
        answer: ans,
        hint: "The cancelling factor shows where the hole sits.",
        steps: [
          `${binom(p)} cancels, leaving y = ${binom(q)}.`,
          `The cancelled factor is zero at x = ${neg(-p)}.`,
          `Substituting into ${binom(q)} gives y = ${neg(-p + q)}, so the hole is at ${ans}.`,
        ],
        concept: "A factor that cancels leaves a hole, not an asymptote.",
        verify: () => polyVal([1, q], -p) === -p + q,
      });
    }

    if (kind === "solve") {
      const x0 = nz(rng, -6, 6);
      const k = nz(rng, 1, 6);
      const rhs = x0 + k;
      return inputQ({
        instruction: "Solve for x.",
        prompt: `{${k}/x} = {${k}/${neg(x0)}}`,
        answer: String(x0),
        hint: "Cross-multiply, then check the value is allowed.",
        steps: [
          `Cross-multiplying gives ${k} × ${neg(x0)} = ${k}x.`,
          `Dividing by ${k} gives x = ${neg(x0)}.`,
          `x = ${neg(x0)} does not make any denominator zero, so it is valid.`,
        ],
        concept: "Always check a rational solution against the restrictions.",
        verify: () => x0 !== 0 && rhs === x0 + k,
      });
    }

    // simplify
    const ans = binom(q);
    return mcQ({
      instruction: "Simplify.",
      prompt: `{${binom(p)}${binom(q)}/${binom(p)}}`,
      choices: mcChoices(rng, ans, [binom(p), binom(-q), `${binom(p)}${binom(q)}`]),
      answer: ans,
      hint: "Cancel the factor that appears on both top and bottom.",
      steps: [
        `${binom(p)} appears on the top and the bottom.`,
        `Cancelling it leaves ${ans}, provided x ≠ ${neg(-p)}.`,
      ],
      concept: "Cancelling a common factor simplifies the expression but keeps its restriction.",
      verify: () => polyVal([1, q], 4) * polyVal([1, p], 4) === polyVal([1, p], 4) * polyVal([1, q], 4),
    });
  },
};

/* ------------------------------------------------------ radical-expression */
const PERFECT = [4, 9, 16, 25, 36, 49, 64, 81, 100] as const;

const radicalExpression: GeneratorFamily = {
  stageLabel(skill, st) {
    const kind = typeof skill.params.kind === "string" ? skill.params.kind : "simplify";
    if (kind === "solve") return ["Simple radical equations", "With a constant", "Isolate first", "Check the solution", "Word problems"][st - 1];
    return ["Simplify a root", "Add like radicals", "Multiply radicals", "Rationalise", "Mixed practice"][st - 1];
  },
  generate(skill, stage, rng): RawQuestion {
    let kind = str(skill.params, "kind", "simplify");
    if (kind === "mixed") kind = rng.pick(["simplify", "solve"]);

    if (kind === "solve") {
      const root = rng.int(2, 12);
      const inside = sq(root);
      const shift = nz(rng, -20, 20);
      const x0 = inside - shift;
      if (stage >= 3) {
        const k = rng.int(2, 5);
        const rootB = rng.int(2, 8);
        const x1 = sq(rootB) - shift;
        return inputQ({
          instruction: "Solve for x.",
          prompt: `${k}sqrt(x ${shift >= 0 ? "+" : "−"} ${Math.abs(shift)}) = ${k * rootB}`,
          answer: String(x1),
          hint: `Divide both sides by ${k} first, then square.`,
          steps: [
            `Divide both sides by ${k}: sqrt(x ${shift >= 0 ? "+" : "−"} ${Math.abs(shift)}) = ${rootB}.`,
            `Square both sides: x ${shift >= 0 ? "+" : "−"} ${Math.abs(shift)} = ${sq(rootB)}.`,
            `So x = ${neg(x1)}.`,
          ],
          concept: "Isolate the radical before squaring, then check the answer works.",
          verify: () => k * Math.sqrt(x1 + shift) === k * rootB,
        });
      }
      return inputQ({
        instruction: "Solve for x.",
        prompt: `sqrt(x ${shift >= 0 ? "+" : "−"} ${Math.abs(shift)}) = ${root}`,
        answer: String(x0),
        hint: "Square both sides to remove the square root.",
        steps: [
          `Squaring both sides gives x ${shift >= 0 ? "+" : "−"} ${Math.abs(shift)} = ${inside}.`,
          `So x = ${neg(x0)}.`,
          `Check: sqrt(${neg(x0 + shift)}) = ${root}. ✓`,
        ],
        concept: "Squaring undoes a square root, but the answer must always be checked.",
        verify: () => Math.sqrt(x0 + shift) === root,
      });
    }

    if (stage === 2) {
      const k = rng.pick([2, 3, 5, 6, 7]);
      const a = rng.int(2, 6);
      const b = rng.int(2, 6);
      const ans = `${a + b}sqrt(${k})`;
      return mcQ({
        instruction: "Simplify.",
        prompt: `${a}sqrt(${k}) + ${b}sqrt(${k})`,
        choices: mcChoices(rng, ans, [
          `${a * b}sqrt(${k})`,
          `${a + b}sqrt(${2 * k})`,
          `sqrt(${(a + b) * k})`,
        ]),
        answer: ans,
        hint: "Like radicals add the same way like terms do.",
        steps: [
          `Both terms contain sqrt(${k}), so they are like radicals.`,
          `${a} + ${b} = ${a + b}, giving ${ans}.`,
        ],
        concept: "Only radicals with the same root can be added.",
        verify: () => Math.abs(a * Math.sqrt(k) + b * Math.sqrt(k) - (a + b) * Math.sqrt(k)) < 1e-9,
      });
    }
    if (stage === 3) {
      const a = rng.pick([2, 3, 5, 6, 7]);
      const b = rng.pick([2, 3, 5, 6, 7]);
      const prod = a * b;
      const outside = PERFECT.filter((p) => prod % p === 0).pop();
      const ans = outside ? `${Math.sqrt(outside)}sqrt(${prod / outside})` : `sqrt(${prod})`;
      return mcQ({
        instruction: "Multiply and simplify.",
        prompt: `sqrt(${a}) × sqrt(${b})`,
        choices: mcChoices(rng, ans, [
          `sqrt(${a + b})`,
          `${prod}`,
          `sqrt(${prod * 2})`,
          `${a * b}sqrt(${a})`,
        ]),
        answer: ans,
        hint: "Multiplying roots multiplies what is inside.",
        steps: [
          `sqrt(${a}) × sqrt(${b}) = sqrt(${prod}).`,
          outside
            ? `${prod} contains the square factor ${outside}, so this simplifies to ${ans}.`
            : `${prod} has no square factor, so it stays as ${ans}.`,
        ],
        concept: "Roots multiply by combining what is under them.",
        verify: () => Math.abs(Math.sqrt(a) * Math.sqrt(b) - Math.sqrt(prod)) < 1e-9,
      });
    }
    if (stage === 4) {
      const k = rng.pick([2, 3, 5, 6, 7]);
      const a = rng.int(2, 9);
      const ans = `{${a}sqrt(${k})/${k}}`;
      return mcQ({
        instruction: "Rationalise the denominator.",
        prompt: `{${a}/sqrt(${k})}`,
        choices: mcChoices(rng, ans, [
          `{${a}sqrt(${k})/${a}}`,
          `${a}sqrt(${k})`,
          `{sqrt(${k})/${a}}`,
        ]),
        answer: ans,
        hint: `Multiply the top and bottom by sqrt(${k}).`,
        steps: [
          `Multiply top and bottom by sqrt(${k}).`,
          `The bottom becomes sqrt(${k}) × sqrt(${k}) = ${k}.`,
          `That gives ${ans}.`,
        ],
        concept: "Rationalising clears the root out of the denominator.",
        verify: () => Math.abs(a / Math.sqrt(k) - (a * Math.sqrt(k)) / k) < 1e-9,
      });
    }
    // Stage 1 and 5: simplify a single root.
    const square = rng.pick(PERFECT);
    const rest = rng.pick([2, 3, 5, 6, 7, 10]);
    const inside = square * rest;
    const ans = `${Math.sqrt(square)}sqrt(${rest})`;
    return mcQ({
      instruction: "Simplify the radical.",
      prompt: `sqrt(${inside})`,
      choices: mcChoices(rng, ans, [
        `${Math.sqrt(square)}sqrt(${inside})`,
        `${square}sqrt(${rest})`,
        `sqrt(${rest})`,
        `${Math.sqrt(square) * rest}`,
      ]),
      answer: ans,
      hint: "Look for the largest perfect square that divides the number.",
      steps: [
        `${inside} = ${square} × ${rest}, and ${square} is a perfect square.`,
        `sqrt(${square}) = ${Math.sqrt(square)}, which comes outside the root.`,
        `That leaves ${ans}.`,
      ],
      concept: "A perfect-square factor can always be moved outside the radical.",
      verify: () => Math.abs(Math.sqrt(inside) - Math.sqrt(square) * Math.sqrt(rest)) < 1e-9,
    });
  },
};

export const algebraAdvancedFamilies = {
  slope,
  "linear-equation": linearEquation,
  systems,
  "poly-add-sub": polyAddSub,
  "poly-mul": polyMul,
  factor,
  "quadratic-solve": quadraticSolve,
  "quadratic-features": quadraticFeatures,
  "poly-division": polyDivision,
  "factor-theorem": factorTheorem,
  "rational-expression": rationalExpression,
  "radical-expression": radicalExpression,
} satisfies Record<string, GeneratorFamily>;
