import type { GeneratorFamily, RawQuestion, Rng, SkillRef } from "../types";
import { inputQ, mcQ, mcChoices, pickName } from "./helpers";

/**
 * Temperature scale for the region.
 *
 * Below-zero temperature is the canonical model for negative numbers, so the
 * context stays — only the scale changes. The values in use (roughly -15 to
 * 15) read as an ordinary cold snap in either scale, which is the point: the
 * child needs somewhere negatives genuinely occur.
 */
function tempUnit(params: Record<string, unknown>): string {
  return params.region === "US" ? "°F" : "°C";
}

/** Everyday length unit for depths, elevations and object sizes. */
function lenLong(params: Record<string, unknown>): string {
  return params.region === "US" ? "feet" : "metres";
}

const str = (p: Record<string, unknown>, key: string, dflt: string): string =>
  typeof p[key] === "string" ? (p[key] as string) : dflt;

/** Bare display of an integer with a proper minus sign. */
const neg = (n: number): string => (n < 0 ? `−${-n}` : String(n));
/** Display wrapped in parentheses when negative (for use after an operator). */
const wrap = (n: number): string => (n < 0 ? `(−${-n})` : String(n));
/** Non-zero integer in [lo, hi]. */
function nz(rng: Rng, lo: number, hi: number): number {
  let v = rng.int(lo, hi);
  while (v === 0) v = rng.int(lo, hi);
  return v;
}

/* -------------------------------------------------------------- integer-ops */
/** params: op "add" | "sub" | "mul" | "div" | "mixed".
 * Stage table (structural):
 *  1 small magnitudes (to 9), exactly one negative
 *  2 both signs possible, magnitudes to 12
 *  3 larger magnitudes (add/sub to 50, mul/div full tables)
 *  4 missing numbers
 *  5 story problems (temperature, elevation, money)
 */
const integerOps: GeneratorFamily = {
  stageLabel: (s, st) =>
    ["One negative, small numbers", "Both signs", "Larger numbers", "Missing numbers", "Story problems"][st - 1],
  generate(skill, stage, rng): RawQuestion {
    const T = tempUnit(skill.params);
    const LU = lenLong(skill.params);
    const opParam = str(skill.params, "op", "mixed");
    const op =
      opParam === "mixed"
        ? rng.pick(["add", "sub", "mul", "div"] as const)
        : (opParam as "add" | "sub" | "mul" | "div");

    // Build operands per stage.
    let a: number, b: number;
    if (op === "add" || op === "sub") {
      if (stage === 1) {
        a = rng.int(1, 9);
        b = -rng.int(1, 9);
        if (rng.chance(0.5)) [a, b] = [b, a];
      } else if (stage === 2) {
        a = nz(rng, -12, 12);
        b = nz(rng, -12, 12);
        if (a > 0 && b > 0) a = -a;
      } else {
        a = nz(rng, -50, 50);
        b = nz(rng, -50, 50);
        if (a > 0 && b > 0) b = -b;
      }
    } else {
      const cap = stage >= 3 ? 12 : stage === 2 ? 12 : 9;
      let f1 = rng.int(2, cap);
      let f2 = rng.int(2, stage === 1 ? 9 : cap);
      if (stage === 1) f1 = -f1;
      else {
        if (rng.chance(0.5)) f1 = -f1;
        if (rng.chance(0.5)) f2 = -f2;
        if (f1 > 0 && f2 > 0) f1 = -f1;
      }
      if (op === "mul") {
        a = f1;
        b = f2;
      } else {
        a = f1 * f2; // dividend
        b = f2; // divisor
      }
    }

    const ans = op === "add" ? a + b : op === "sub" ? a - b : op === "mul" ? a * b : a / b;
    const sym = op === "add" ? "+" : op === "sub" ? "−" : op === "mul" ? "×" : "÷";
    const opName = op === "add" ? "Add" : op === "sub" ? "Subtract" : op === "mul" ? "Multiply" : "Divide";
    const verify = () =>
      op === "add" ? ans - b === a : op === "sub" ? ans + b === a : op === "mul" ? ans / b === a : ans * b === a;

    if (stage === 4) {
      // Missing number: a (op) ___ = result
      return inputQ({
        instruction: "Find the missing number.",
        prompt: `${neg(a)} ${sym} ___ = ${neg(ans)}`,
        answer: String(b),
        answerHint: "e.g. -4",
        hint:
          op === "add"
            ? `Subtract ${neg(a)} from ${neg(ans)}.`
            : op === "sub"
              ? `The blank is ${neg(a)} minus ${neg(ans)}.`
              : op === "mul"
                ? `Divide ${neg(ans)} by ${neg(a)}.`
                : `Divide ${neg(a)} by ${neg(ans)}.`,
        steps: [
          op === "add"
            ? `${neg(ans)} − ${wrap(a)} = ${neg(b)}.`
            : op === "sub"
              ? `${neg(a)} − ${wrap(ans)} = ${neg(b)}.`
              : op === "mul"
                ? `${neg(ans)} ÷ ${wrap(a)} = ${neg(b)}.`
                : `${neg(a)} ÷ ${wrap(ans)} = ${neg(b)}.`,
          `Check: ${neg(a)} ${sym} ${wrap(b)} = ${neg(ans)}. ✓`,
        ],
        concept: "Inverse operations undo each other, even with negatives.",
        verify,
      });
    }
    if (stage === 5) {
      const name = pickName(rng);
      if (op === "add" || op === "sub") {
        const t0 = rng.int(-15, 15);
        const drop = rng.int(3, 20);
        const rises = op === "add";
        const final = rises ? t0 + drop : t0 - drop;
        return inputQ({
          instruction: "Solve the problem.",
          prompt: `The temperature is ${neg(t0)}${T}. It ${rises ? "rises" : "falls"} ${drop}${T}. What is the new temperature?`,
          answer: String(final),
          answerHint: "e.g. -7",
          hint: rises ? "Rising means adding." : "Falling means subtracting.",
          steps: [`${neg(t0)} ${rises ? "+" : "−"} ${drop} = ${neg(final)}.`, `The new temperature is ${neg(final)}${T}.`],
          concept: "Rises add and falls subtract on the thermometer's number line.",
          representation: "word",
          verify: () => (rises ? final - drop === t0 : final + drop === t0),
        });
      }
      if (op === "mul") {
        const perHour = rng.int(2, 6);
        const hours = rng.int(3, 6);
        const total = -perHour * hours;
        return inputQ({
          instruction: "Solve the problem.",
          prompt: `The temperature falls ${perHour}${T} every hour for ${hours} hours. What is the total change in temperature?`,
          answer: String(total),
          answerHint: "e.g. -12",
          hint: `Each hour is a change of −${perHour}. Multiply by ${hours}.`,
          steps: [`Each hour changes the temperature by −${perHour}${T}.`, `${wrap(-perHour)} × ${hours} = ${neg(total)}.`],
          concept: "Repeated negative changes multiply into a bigger negative.",
          representation: "word",
          verify: () => total / hours === -perHour,
        });
      }
      const stages = rng.int(3, 6);
      const per = rng.int(2, 8);
      const depth = -stages * per;
      return inputQ({
        instruction: "Solve the problem.",
        prompt: `${name} dives to ${neg(depth)} ${LU} in ${stages} equal stages. How many ${LU} is each stage?`,
        answer: String(-per),
        answerHint: "e.g. -6",
        hint: `Divide ${neg(depth)} by ${stages}.`,
        steps: [`${neg(depth)} ÷ ${stages} = ${neg(-per)}.`, `Each stage is ${per} ${LU} down, written ${neg(-per)}.`],
        concept: "Dividing a negative by a positive keeps the negative sign.",
        representation: "word",
        verify: () => -per * stages === depth,
      });
    }

    const steps: string[] = [];
    if (op === "add") {
      if ((a < 0) === (b < 0)) {
        steps.push(`Same signs: add the absolute values, ${Math.abs(a)} + ${Math.abs(b)} = ${Math.abs(a) + Math.abs(b)}.`);
        steps.push(`Keep the shared sign: ${neg(ans)}.`);
      } else {
        steps.push(`Different signs: subtract the absolute values, ${Math.max(Math.abs(a), Math.abs(b))} − ${Math.min(Math.abs(a), Math.abs(b))} = ${Math.abs(ans)}.`);
        steps.push(`Keep the sign of the number farther from zero: ${neg(ans)}.`);
      }
    } else if (op === "sub") {
      steps.push(`Subtracting is adding the opposite: ${neg(a)} + ${wrap(-b)}.`);
      steps.push(`${neg(a)} + ${wrap(-b)} = ${neg(ans)}.`);
    } else {
      steps.push(
        (a < 0) === (b < 0)
          ? `Same signs give a positive ${op === "mul" ? "product" : "quotient"}.`
          : `Different signs give a negative ${op === "mul" ? "product" : "quotient"}.`
      );
      steps.push(`${Math.abs(a)} ${sym} ${Math.abs(b)} = ${Math.abs(ans)}, so the answer is ${neg(ans)}.`);
    }
    return inputQ({
      instruction: `${opName} the integers.`,
      prompt: `${neg(a)} ${sym} ${wrap(b)} = ?`,
      answer: String(ans),
      answerHint: "e.g. -4",
      hint:
        op === "add"
          ? "Same signs: add and keep the sign. Different signs: subtract and take the stronger sign."
          : op === "sub"
            ? "Change subtraction to adding the opposite."
            : "Same signs make positive; different signs make negative.",
      steps,
      concept:
        op === "add" || op === "sub"
          ? "Adding and subtracting integers is movement along the number line."
          : "The sign of a product or quotient comes from counting negative signs.",
      verify,
    });
  },
};

/* ---------------------------------------------------------------- abs-value */
/** Stage table:
 *  1 read |n| directly
 *  2 compare absolute values
 *  3 absolute value of a difference
 *  4 combined expressions with two absolute values
 *  5 story problems (distance from zero)
 */
const absValue: GeneratorFamily = {
  stageLabel: (s, st) =>
    ["Distance from zero", "Compare absolute values", "Absolute differences", "Combine absolute values", "In problems"][st - 1],
  generate(skill, stage, rng): RawQuestion {
    if (stage === 1) {
      const n = nz(rng, -20, 20);
      return inputQ({
        instruction: "Evaluate.",
        prompt: `|${neg(n)}| = ?`,
        answer: String(Math.abs(n)),
        hint: "Absolute value is the distance from zero — it is never negative.",
        steps: [`${neg(n)} is ${Math.abs(n)} units from zero.`, `|${neg(n)}| = ${Math.abs(n)}.`],
        concept: "Absolute value measures distance from zero.",
        verify: () => Math.abs(n) === (n < 0 ? -n : n),
      });
    }
    if (stage === 2) {
      let a = nz(rng, -15, 15);
      let b = nz(rng, -15, 15);
      while (b === a) b = nz(rng, -15, 15);
      const aa = Math.abs(a);
      const ab = Math.abs(b);
      const ansStr = aa === ab ? "They are equal" : aa > ab ? `|${neg(a)}|` : `|${neg(b)}|`;
      return mcQ({
        instruction: "Which is greater?",
        prompt: `|${neg(a)}|  or  |${neg(b)}|`,
        choices: rng.shuffle([`|${neg(a)}|`, `|${neg(b)}|`, "They are equal"]),
        answer: ansStr,
        hint: "First strip the signs: compare the distances from zero.",
        steps: [
          `|${neg(a)}| = ${aa} and |${neg(b)}| = ${ab}.`,
          aa === ab ? `${aa} = ${ab}, so they are equal.` : `${Math.max(aa, ab)} > ${Math.min(aa, ab)}, so ${ansStr} is greater.`,
        ],
        concept: "A very negative number can have a large absolute value.",
        verify: () => (aa > ab) === (ansStr === `|${neg(a)}|`) || aa === ab,
      });
    }
    if (stage === 3) {
      const a = rng.int(-12, 12);
      let b = rng.int(-12, 12);
      while (b === a) b = rng.int(-12, 12);
      const ans = Math.abs(a - b);
      return inputQ({
        instruction: "Evaluate.",
        prompt: `|${neg(a)} − ${wrap(b)}| = ?`,
        answer: String(ans),
        hint: "Work inside the bars first, then take the distance from zero.",
        steps: [`Inside: ${neg(a)} − ${wrap(b)} = ${neg(a - b)}.`, `|${neg(a - b)}| = ${ans}.`],
        concept: "Absolute value applies after the inside is simplified.",
        verify: () => ans === Math.abs(b - a),
      });
    }
    if (stage === 4) {
      const a = nz(rng, -12, 12);
      const b = nz(rng, -12, 12);
      const add = rng.chance(0.5);
      const ans = add ? Math.abs(a) + Math.abs(b) : Math.abs(a) * Math.abs(b);
      return inputQ({
        instruction: "Evaluate.",
        prompt: add ? `|${neg(a)}| + |${neg(b)}| = ?` : `|${neg(a)}| × |${neg(b)}| = ?`,
        answer: String(ans),
        hint: "Evaluate each absolute value first, then combine.",
        steps: [
          `|${neg(a)}| = ${Math.abs(a)} and |${neg(b)}| = ${Math.abs(b)}.`,
          `${Math.abs(a)} ${add ? "+" : "×"} ${Math.abs(b)} = ${ans}.`,
        ],
        concept: "Absolute values become plain positive numbers before combining.",
        verify: () => (add ? ans - Math.abs(b) === Math.abs(a) : ans / Math.abs(b) === Math.abs(a)),
      });
    }
    const name = pickName(rng);
    const depth = -rng.int(5, 60);
    const LU = lenLong(skill.params);
    return inputQ({
      instruction: "Solve the problem.",
      prompt: `${name} is scuba diving at an elevation of ${neg(depth)} ${LU}. How many ${LU} from sea level is ${name}?`,
      answer: String(-depth),
      hint: "Distance is always positive — take the absolute value.",
      steps: [`Sea level is 0. The elevation is ${neg(depth)}.`, `|${neg(depth)}| = ${-depth} ${LU} from sea level.`],
      concept: "Distances are absolute values of positions.",
      representation: "word",
      verify: () => Math.abs(depth) === -depth,
    });
  },
};

/* -------------------------------------------------------------- int-compare */
/** params: rational?: boolean — include fractions/decimals when true.
 * Stage table:
 *  1 compare two integers
 *  2 order three integers
 *  3 compare rationals (or number-line position for integers)
 *  4 order mixed rationals (or wider integer range)
 *  5 story comparisons
 */
const intCompare: GeneratorFamily = {
  stageLabel: (s, st) =>
    ["Compare two integers", "Order three integers", "Compare rationals", "Order mixed numbers", "In context"][st - 1],
  generate(skill, stage, rng): RawQuestion {
    const T = tempUnit(skill.params);
    const rational = skill.params.rational === true;
    if (stage === 1) {
      let a = rng.int(-15, 15);
      let b = rng.int(-15, 15);
      while (b === a) b = rng.int(-15, 15);
      const ans = a > b ? ">" : "<";
      return mcQ({
        instruction: "Compare the integers.",
        prompt: `${neg(a)} ___ ${neg(b)}`,
        choices: rng.shuffle(["<", ">", "="]),
        answer: ans,
        hint: "The number farther right on the number line is greater.",
        steps: [
          `On a number line, ${neg(Math.min(a, b))} sits left of ${neg(Math.max(a, b))}.`,
          `So ${neg(a)} ${ans} ${neg(b)}.`,
        ],
        concept: "Greater means farther right, even below zero.",
        verify: () => (a > b) === (ans === ">"),
      });
    }
    if (stage === 2 || (stage === 4 && !rational)) {
      const cap = stage === 4 ? 50 : 12;
      const vals: number[] = [];
      while (vals.length < 3) {
        const v = rng.int(-cap, cap);
        if (!vals.includes(v)) vals.push(v);
      }
      const sorted = [...vals].sort((x, y) => x - y);
      // Make sure the shown order is not already sorted either way.
      if (vals.every((v, i) => v === sorted[i]) || vals.every((v, i) => v === sorted[2 - i])) {
        [vals[0], vals[1]] = [vals[1], vals[0]];
      }
      const correct = sorted.map(neg).join(", ");
      const reversed = [...sorted].reverse().map(neg).join(", ");
      const asIs = vals.map(neg).join(", ");
      const byAbs = [...vals].sort((x, y) => Math.abs(x) - Math.abs(y)).map(neg).join(", ");
      return mcQ({
        instruction: "Which list orders the integers from least to greatest?",
        prompt: vals.map(neg).join("   "),
        choices: mcChoices(rng, correct, [reversed, asIs, byAbs]),
        answer: correct,
        hint: "Least means farthest left on the number line — the most negative.",
        steps: [`The most negative number is least: ${neg(sorted[0])}.`, `Least to greatest: ${correct}.`],
        concept: "Negative numbers order by position, not by size of digits.",
        verify: () => sorted.every((v, i) => i === 0 || sorted[i - 1] < v),
      });
    }
    if (stage === 3) {
      if (rational) {
        // Compare two negative decimals — the classic −0.5 vs −0.75 trap.
        const w = rng.int(0, 2);
        let t1 = rng.int(1, 9);
        let t2 = rng.int(1, 9);
        while (t2 === t1) t2 = rng.int(1, 9);
        const a = -(w + t1 / 10);
        const b = -(w + t2 / 10);
        const da = `−${w}.${t1}`;
        const db = `−${w}.${t2}`;
        const ans = a > b ? ">" : "<";
        return mcQ({
          instruction: "Compare the decimals.",
          prompt: `${da} ___ ${db}`,
          choices: rng.shuffle(["<", ">", "="]),
          answer: ans,
          hint: "For negatives, the smaller absolute value is the greater number.",
          steps: [
            `Both are negative; ${da} is ${Math.abs(a).toFixed(1)} below zero and ${db} is ${Math.abs(b).toFixed(1)} below zero.`,
            `Closer to zero is greater: ${da} ${ans} ${db}.`,
          ],
          concept: "Among negatives, closer to zero means greater.",
          verify: () => (a > b) === (ans === ">"),
        });
      }
      let a = rng.int(-20, 20);
      let b = rng.int(-20, 20);
      while (b === a) b = rng.int(-20, 20);
      const ans = a < b ? neg(a) : neg(b);
      return mcQ({
        instruction: "Number-line thinking.",
        prompt: `Which number is farther left on the number line: ${neg(a)} or ${neg(b)}?`,
        choices: rng.shuffle([neg(a), neg(b), "They are at the same point"]),
        answer: ans,
        hint: "Farther left means smaller.",
        steps: [`${ans} < ${a < b ? neg(b) : neg(a)}.`, `Smaller numbers sit farther left, so ${ans} is farther left.`],
        concept: "The number line puts every comparison in one picture.",
        verify: () => Math.min(a, b) === Number(ans.replace("−", "-")),
      });
    }
    if (stage === 4) {
      // Order a fraction, a decimal, and an integer.
      const items: { disp: string; val: number }[] = [];
      const half = rng.pick([1, 3]) as number;
      items.push({ disp: `−{${half}/2}`, val: -half / 2 });
      const dec = rng.int(1, 9) / 10;
      items.push({ disp: String(dec), val: dec });
      items.push({ disp: neg(-rng.int(1, 3)), val: -rng.int(1, 3) });
      // Rebuild third item consistently.
      const k = rng.int(2, 4);
      items[2] = { disp: neg(-k), val: -k };
      const sorted = [...items].sort((x, y) => x.val - y.val);
      const correct = sorted.map((i) => i.disp).join(", ");
      const reversed = [...sorted].reverse().map((i) => i.disp).join(", ");
      const byAbs = [...items].sort((x, y) => Math.abs(x.val) - Math.abs(y.val)).map((i) => i.disp).join(", ");
      // byAbs can coincide with reversed, so fall back to the remaining
      // permutations to guarantee enough distinct wrong orderings.
      const permute = (a: typeof items): typeof items[] =>
        a.length <= 1
          ? [a]
          : a.flatMap((v, i) => permute([...a.slice(0, i), ...a.slice(i + 1)]).map((p) => [v, ...p]));
      const wrongOrders = [
        ...new Set([reversed, byAbs, ...permute(items).map((p) => p.map((i) => i.disp).join(", "))]),
      ].filter((o) => o !== correct);
      return mcQ({
        instruction: "Which list orders the numbers from least to greatest?",
        prompt: items.map((i) => i.disp).join("   "),
        choices: mcChoices(rng, correct, wrongOrders),
        answer: correct,
        hint: "Rewrite each number as a decimal, then order.",
        steps: [
          `As decimals: ${items.map((i) => i.val.toFixed(2)).join(", ")}.`,
          `Least to greatest: ${correct}.`,
        ],
        concept: "One common form (decimals) makes mixed numbers comparable.",
        verify: () => sorted.every((v, i) => i === 0 || sorted[i - 1].val <= v.val),
      });
    }
    const t1 = -rng.int(1, 20);
    let t2 = -rng.int(1, 20);
    while (t2 === t1) t2 = -rng.int(1, 20);
    const colder = Math.min(t1, t2);
    const cityA = "Oslo";
    const cityB = "Yellowknife";
    const ans = colder === t1 ? cityA : cityB;
    return mcQ({
      instruction: "Solve the problem.",
      prompt: `Overnight, ${cityA} reached ${neg(t1)}${T} and ${cityB} reached ${neg(t2)}${T}. Which city was colder?`,
      choices: rng.shuffle([cityA, cityB, "They were equally cold"]),
      answer: ans,
      hint: "Colder means the lower number — farther below zero.",
      steps: [`${neg(colder)} < ${neg(Math.max(t1, t2))}.`, `${ans} was colder.`],
      concept: "Real-world comparisons of negatives use number-line order.",
      representation: "word",
      verify: () => Math.min(t1, t2) === colder,
    });
  },
};

/* ------------------------------------------------------------ exponent-eval */
/** Stage table:
 *  1 squares
 *  2 small cubes and powers
 *  3 powers of ten, zero and first powers
 *  4 negative bases
 *  5 negative exponents (unit-fraction answers)
 */
const exponentEval: GeneratorFamily = {
  stageLabel: (s, st) =>
    ["Squares", "Cubes & small powers", "Powers of ten & special cases", "Negative bases", "Negative exponents"][st - 1],
  generate(skill, stage, rng): RawQuestion {
    if (stage === 1) {
      const n = rng.int(2, 12);
      return inputQ({
        instruction: "Evaluate.",
        prompt: `${n}^2 = ?`,
        answer: String(n * n),
        hint: `${n}^2 means ${n} × ${n}.`,
        steps: [`${n}^2 = ${n} × ${n}.`, `${n} × ${n} = ${n * n}.`],
        concept: "Squaring multiplies a number by itself.",
        verify: () => Math.pow(n, 2) === n * n,
      });
    }
    if (stage === 2) {
      const b = rng.int(2, 5);
      const e = rng.pick([3, 4] as const);
      const ans = b ** e;
      return inputQ({
        instruction: "Evaluate.",
        prompt: `${b}^${e} = ?`,
        answer: String(ans),
        hint: `Multiply ${b} by itself ${e} times.`,
        steps: [
          `${b}^${e} means ${Array(e).fill(b).join(" × ")}.`,
          `Step by step: ${b * b}${e >= 3 ? ` → ${b * b * b}` : ""}${e === 4 ? ` → ${ans}` : ""}.`,
          `${b}^${e} = ${ans}.`,
        ],
        concept: "The exponent counts how many copies of the base are multiplied.",
        verify: () => Math.pow(b, e) === ans,
      });
    }
    if (stage === 3) {
      const kind = rng.pick(["ten", "zero", "one"] as const);
      if (kind === "ten") {
        const e = rng.int(2, 6);
        return inputQ({
          instruction: "Evaluate.",
          prompt: `10^${e} = ?`,
          answer: String(10 ** e),
          hint: `10^${e} is a 1 followed by ${e} zeros.`,
          steps: [`Each factor of 10 adds one zero.`, `10^${e} = ${10 ** e}.`],
          concept: "Powers of ten shift the place value.",
          verify: () => String(10 ** e) === "1" + "0".repeat(e),
        });
      }
      const b = rng.int(2, 99);
      if (kind === "zero") {
        return inputQ({
          instruction: "Evaluate.",
          prompt: `${b}^0 = ?`,
          answer: "1",
          hint: "Any non-zero number to the power 0 equals the same thing.",
          steps: [`Each time the exponent drops by 1, you divide by ${b}.`, `${b}^1 ÷ ${b} = ${b}^0 = 1.`],
          concept: "Any non-zero base to the power 0 is 1.",
          verify: () => Math.pow(b, 0) === 1,
        });
      }
      return inputQ({
        instruction: "Evaluate.",
        prompt: `${b}^1 = ?`,
        answer: String(b),
        hint: "The exponent 1 means just one copy of the base.",
        steps: [`One copy of ${b} is ${b}.`],
        concept: "The first power of a number is the number itself.",
        verify: () => Math.pow(b, 1) === b,
      });
    }
    if (stage === 4) {
      const b = rng.int(2, 6);
      const e = rng.int(2, 4);
      const ans = (-b) ** e;
      return inputQ({
        instruction: "Evaluate. Watch the sign.",
        prompt: `(−${b})^${e} = ?`,
        answer: String(ans),
        answerHint: "e.g. -8",
        hint: `An ${e % 2 === 0 ? "even" : "odd"} number of negative factors gives a ${e % 2 === 0 ? "positive" : "negative"} result.`,
        steps: [
          `(−${b})^${e} multiplies ${e} copies of −${b}.`,
          `${e} negative signs ${e % 2 === 0 ? "cancel in pairs — the result is positive" : "leave one negative — the result is negative"}.`,
          `(−${b})^${e} = ${neg(ans)}.`,
        ],
        concept: "Even exponents erase the negative sign; odd exponents keep it.",
        verify: () => Math.pow(-b, e) === ans,
      });
    }
    const b = rng.pick([2, 3, 4, 5, 10] as const);
    const e = b >= 5 ? rng.int(1, 2) : rng.int(1, 3);
    const den = b ** e;
    return inputQ({
      instruction: "Evaluate. Give your answer as a fraction.",
      prompt: `${b}^{-${e}} = ?`,
      answer: `1/${den}`,
      answerFormat: "fraction",
      answerHint: "e.g. 1/8",
      hint: "A negative exponent means the reciprocal of the positive power.",
      steps: [`${b}^{-${e}} = {1/${b}^${e}}.`, `${b}^${e} = ${den}, so ${b}^{-${e}} = {1/${den}}.`],
      concept: "Negative exponents flip the base into a fraction.",
      verify: () => Math.pow(b, -e) === 1 / den,
    });
  },
};

/* ----------------------------------------------------------- exponent-rules */
/** Stage table:
 *  1 product rule
 *  2 quotient rule
 *  3 power of a power
 *  4 pick the correct simplification (rule discrimination)
 *  5 combined rules, negative exponents possible
 */
const exponentRules: GeneratorFamily = {
  stageLabel: (s, st) =>
    ["Product rule", "Quotient rule", "Power of a power", "Choose the rule", "Combined rules"][st - 1],
  generate(skill, stage, rng): RawQuestion {
    if (stage === 1) {
      const a = rng.int(2, 9);
      const b = rng.int(2, 9);
      return inputQ({
        instruction: "Write as a single power of x. What is the exponent?",
        prompt: `x^${a} * x^${b} = x^n`,
        answer: String(a + b),
        hint: "Multiplying powers of the same base adds the exponents.",
        steps: [
          `x^${a} * x^${b} has ${a} copies of x times ${b} more copies.`,
          `That is ${a} + ${b} = ${a + b} copies, so n = ${a + b}.`,
        ],
        concept: "Same base, multiplied: add the exponents.",
        verify: () => Math.pow(2, a) * Math.pow(2, b) === Math.pow(2, a + b),
      });
    }
    if (stage === 2) {
      const b = rng.int(2, 6);
      const a = b + rng.int(1, 6);
      return inputQ({
        instruction: "Write as a single power of x. What is the exponent?",
        prompt: `x^${a} ÷ x^${b} = x^n`,
        answer: String(a - b),
        hint: "Dividing powers of the same base subtracts the exponents.",
        steps: [`${b} of the ${a} copies of x cancel with the denominator.`, `n = ${a} − ${b} = ${a - b}.`],
        concept: "Same base, divided: subtract the exponents.",
        verify: () => Math.pow(2, a) / Math.pow(2, b) === Math.pow(2, a - b),
      });
    }
    if (stage === 3) {
      const a = rng.int(2, 5);
      const b = rng.int(2, 4);
      return inputQ({
        instruction: "Write as a single power of x. What is the exponent?",
        prompt: `(x^${a})^${b} = x^n`,
        answer: String(a * b),
        hint: "A power of a power multiplies the exponents.",
        steps: [`(x^${a})^${b} is ${b} copies of x^${a}.`, `Adding ${a} exponent ${b} times gives ${a} × ${b} = ${a * b}.`],
        concept: "Power of a power: multiply the exponents.",
        verify: () => Math.pow(Math.pow(2, a), b) === Math.pow(2, a * b),
      });
    }
    if (stage === 4) {
      const rule = rng.pick(["prod", "quot", "pow"] as const);
      let a: number, b: number, correct: number, wrong1: number, wrong2: number, exprS: string, ruleName: string;
      if (rule === "prod") {
        a = rng.int(2, 6);
        b = a + rng.int(1, 3); // a !== b keeps distractors distinct
        exprS = `x^${a} * x^${b}`;
        correct = a + b;
        wrong1 = a * b;
        wrong2 = Math.abs(a - b);
        ruleName = "multiplied, so the exponents add";
      } else if (rule === "quot") {
        b = rng.int(2, 4);
        a = b + rng.int(2, 5);
        exprS = `x^${a} ÷ x^${b}`;
        correct = a - b;
        wrong1 = a + b;
        wrong2 = Math.round(a / b) === a - b ? a * b : Math.round(a / b);
        ruleName = "divided, so the exponents subtract";
      } else {
        a = rng.int(2, 5);
        b = rng.int(2, 4);
        exprS = `(x^${a})^${b}`;
        correct = a * b;
        wrong1 = a + b;
        wrong2 = Math.abs(a - b) === 0 ? a : a ** b;
        ruleName = "a power of a power, so the exponents multiply";
      }
      const ans = `x^${correct}`;
      return mcQ({
        instruction: "Simplify.",
        prompt: `${exprS} = ?`,
        choices: mcChoices(rng, ans, [`x^${wrong1}`, `x^${wrong2}`, `x^${correct + 1}`]),
        answer: ans,
        hint: "First decide which exponent law applies.",
        steps: [`The powers are ${ruleName}.`, `${exprS} = ${ans}.`],
        concept: "Each exponent law matches one operation on the bases.",
        verify: () =>
          rule === "prod"
            ? correct === a + b
            : rule === "quot"
              ? correct === a - b
              : correct === a * b,
      });
    }
    const a = rng.int(2, 4);
    const b = rng.int(2, 3);
    const c = rng.int(1, 5);
    const d = rng.int(1, a * b + c + 3); // may exceed a*b + c → negative answer
    const n = a * b + c - d;
    return inputQ({
      instruction: "Write as a single power of x. What is the exponent? (It may be negative.)",
      prompt: `(x^${a})^${b} * x^${c} ÷ x^${d} = x^n`,
      answer: String(n),
      answerHint: "e.g. -2",
      hint: "Multiply the first pair of exponents, then add, then subtract.",
      steps: [
        `(x^${a})^${b} = x^${a * b}.`,
        `x^${a * b} * x^${c} = x^${a * b + c}.`,
        `x^${a * b + c} ÷ x^${d} = x^{${n}}.`,
      ],
      concept: "Exponent laws chain together one operation at a time.",
      verify: () => Math.pow(2, a * b) * Math.pow(2, c) / Math.pow(2, d) === Math.pow(2, n),
    });
  },
};

/* ------------------------------------------------------------- sci-notation */
/** params: dir "to-standard" | "mixed".
 * Stage table:
 *  1 powers of ten to standard form
 *  2 positive exponents (to standard, or choose sci form)
 *  3 write a large number in scientific notation
 *  4 negative exponents (small numbers)
 *  5 multiply numbers in scientific notation
 */
function sciStandard(d: number, t: number, e: number): string {
  const digits = t ? `${d}${t}` : `${d}`;
  if (e > 0) return t ? digits + "0".repeat(e - 1) : `${d}` + "0".repeat(e);
  if (e === 0) return t ? `${d}.${t}` : `${d}`;
  return "0." + "0".repeat(-e - 1) + digits;
}
const sciDisp = (d: number, t: number, e: number): string =>
  `${t ? `${d}.${t}` : d} × 10^{${e}}`;

const sciNotation: GeneratorFamily = {
  stageLabel: (s, st) =>
    ["Powers of ten", "Expand positive powers", "Write in scientific notation", "Negative exponents", "Multiply in scientific notation"][st - 1],
  generate(skill, stage, rng): RawQuestion {
    const dir = str(skill.params, "dir", "mixed");
    if (stage === 1) {
      const e = rng.int(2, 6);
      return inputQ({
        instruction: "Write as a standard number.",
        prompt: `10^${e} = ?`,
        answer: String(10 ** e),
        hint: `Move the decimal point ${e} places right of 1.`,
        steps: [`10^${e} is a 1 followed by ${e} zeros.`, `10^${e} = ${10 ** e}.`],
        concept: "The exponent on 10 counts the decimal shifts.",
        verify: () => String(10 ** e).length === e + 1,
      });
    }
    if (stage === 2 || (stage === 3 && dir === "to-standard")) {
      const d = rng.int(1, 9);
      const t = rng.int(1, 9);
      const e = stage === 3 ? rng.int(5, 8) : rng.int(2, 4);
      const std = sciStandard(d, t, e);
      return inputQ({
        instruction: "Write as a standard number.",
        prompt: `${sciDisp(d, t, e)} = ?`,
        answer: std,
        answerFormat: "decimal",
        hint: `Move the decimal point in ${d}.${t} exactly ${e} places right.`,
        steps: [
          `10^${e} moves the decimal ${e} places right.`,
          `${d}.${t} becomes ${std}.`,
        ],
        concept: "Scientific notation is a compact decimal shift.",
        verify: () => Math.abs(Number(std) - (d + t / 10) * 10 ** e) < 1e-6 * 10 ** e,
      });
    }
    if (stage === 3) {
      const d = rng.int(1, 9);
      const t = rng.int(1, 9);
      const e = rng.int(3, 6);
      const std = sciStandard(d, t, e);
      const ans = sciDisp(d, t, e);
      return mcQ({
        instruction: "Write in scientific notation.",
        prompt: `${std} = ?`,
        choices: mcChoices(rng, ans, [
          sciDisp(d, t, e + 1),
          sciDisp(d, t, e - 1),
          `${d}${t} × 10^{${e - 1}}`,
        ]),
        answer: ans,
        hint: "The first factor must be at least 1 and less than 10.",
        steps: [
          `Place the decimal after the first digit: ${d}.${t}.`,
          `The decimal moved ${e} places, so the power is 10^${e}.`,
          `${std} = ${ans}.`,
        ],
        concept: "Scientific notation keeps one digit before the decimal point.",
        verify: () => Math.abs((d + t / 10) * 10 ** e - Number(std)) < 1e-6 * 10 ** e,
      });
    }
    if (stage === 4) {
      const d = rng.int(1, 9);
      const t = rng.int(0, 9);
      const e = -rng.int(2, 4);
      const std = sciStandard(d, t, e);
      return inputQ({
        instruction: "Write as a standard number.",
        prompt: `${sciDisp(d, t, e)} = ?`,
        answer: std,
        answerFormat: "decimal",
        answerHint: "e.g. 0.0032",
        hint: `A negative power of ten moves the decimal point ${-e} places left.`,
        steps: [
          `10^{${e}} moves the decimal ${-e} places left.`,
          `${t ? `${d}.${t}` : d} becomes ${std}.`,
        ],
        concept: "Negative powers of ten make small numbers.",
        verify: () => Math.abs(Number(std) - (d + t / 10) * 10 ** e) < 1e-9,
      });
    }
    const m1 = rng.int(2, 4);
    const m2 = rng.int(2, Math.floor(9 / m1));
    const e1 = rng.int(2, 5);
    const e2 = rng.int(2, 5);
    const ans = `${m1 * m2} × 10^{${e1 + e2}}`;
    return mcQ({
      instruction: "Multiply. Give the answer in scientific notation.",
      prompt: `(${m1} × 10^${e1}) × (${m2} × 10^${e2}) = ?`,
      // The first two error-pattern distractors can collide with the answer
      // (e.g. 2×10^2 times 2×10^2), so the exponent-shifted pair follows as a
      // guaranteed-distinct fallback.
      choices: mcChoices(rng, ans, [
        `${m1 * m2} × 10^{${e1 * e2}}`,
        `${m1 + m2} × 10^{${e1 + e2}}`,
        `${m1 * m2} × 10^{${e1 + e2 + 1}}`,
        `${m1 * m2} × 10^{${e1 + e2 - 1}}`,
      ]),
      answer: ans,
      hint: "Multiply the front numbers; add the exponents on 10.",
      steps: [
        `Front numbers: ${m1} × ${m2} = ${m1 * m2}.`,
        `Powers of ten: 10^${e1} × 10^${e2} = 10^${e1 + e2}.`,
        `Result: ${ans}.`,
      ],
      concept: "Multiplying in scientific notation splits into factors and powers.",
      verify: () => m1 * 10 ** e1 * (m2 * 10 ** e2) === m1 * m2 * 10 ** (e1 + e2),
    });
  },
};

/* -------------------------------------------------------------------- roots */
/** params: kind "square" | "cube".
 * Stage table:
 *  1 small perfect roots
 *  2 larger perfect roots
 *  3 between which integers?
 *  4 roots of round numbers
 *  5 side/edge from area/volume
 */
const roots: GeneratorFamily = {
  stageLabel: (s, st) =>
    ["Small perfect roots", "Larger perfect roots", "Between which integers?", "Round numbers", "Area & volume problems"][st - 1],
  generate(skill, stage, rng): RawQuestion {
    const kind = str(skill.params, "kind", "square");
    const cube = kind === "cube";
    const rootWord = cube ? "cube root" : "square root";
    const pow = cube ? 3 : 2;
    if (stage === 1 || stage === 2) {
      const n = stage === 1 ? rng.int(2, cube ? 5 : 10) : rng.int(cube ? 6 : 11, cube ? 10 : 15);
      const val = n ** pow;
      return inputQ({
        instruction: `Find the ${rootWord}.`,
        prompt: cube ? `What is the cube root of ${val}?` : `sqrt(${val}) = ?`,
        answer: String(n),
        hint: cube ? `What number times itself twice more gives ${val}?` : `What number times itself gives ${val}?`,
        steps: [
          cube ? `${n} × ${n} × ${n} = ${val}.` : `${n} × ${n} = ${val}.`,
          `So the ${rootWord} of ${val} is ${n}.`,
        ],
        concept: cube ? "Cube roots undo cubing." : "Square roots undo squaring.",
        verify: () => n ** pow === val,
      });
    }
    if (stage === 3) {
      const lo = rng.int(3, cube ? 6 : 12);
      const val = lo ** pow + rng.int(1, (lo + 1) ** pow - lo ** pow - 1);
      const ans = `between ${lo} and ${lo + 1}`;
      return mcQ({
        instruction: `The ${rootWord} of ${val} is not a whole number. Between which two consecutive integers does it lie?`,
        prompt: cube ? `cube root of ${val}` : `sqrt(${val})`,
        choices: mcChoices(rng, ans, [
          `between ${lo - 1} and ${lo}`,
          `between ${lo + 1} and ${lo + 2}`,
          `between ${lo + 2} and ${lo + 3}`,
        ]),
        answer: ans,
        hint: `Find the perfect ${cube ? "cubes" : "squares"} just below and above ${val}.`,
        steps: [
          `${lo}^${pow} = ${lo ** pow} and ${lo + 1}^${pow} = ${(lo + 1) ** pow}.`,
          `${lo ** pow} < ${val} < ${(lo + 1) ** pow}, so the root is ${ans}.`,
        ],
        concept: `Roots of non-perfect ${cube ? "cubes" : "squares"} sit between whole numbers.`,
        verify: () => lo ** pow < val && val < (lo + 1) ** pow,
      });
    }
    if (stage === 4) {
      const n = rng.pick(cube ? [10, 20, 30] : ([20, 30, 40, 50, 60, 70, 80, 90, 100] as const)) as number;
      const val = n ** pow;
      return inputQ({
        instruction: `Find the ${rootWord}.`,
        prompt: cube ? `What is the cube root of ${val}?` : `sqrt(${val}) = ?`,
        answer: String(n),
        hint: cube
          ? `Try a multiple of 10: 10 × 10 × 10 = 1000.`
          : `Split it up: ${val} = ${(n / 10) ** 2} × 100.`,
        steps: [
          cube
            ? `${n} = ${n / 10} × 10, and (${n / 10} × 10)^3 = ${(n / 10) ** 3} × 1000 = ${val}.`
            : `${val} = ${(n / 10) ** 2} × 100, and sqrt(${(n / 10) ** 2}) × sqrt(100) = ${n / 10} × 10.`,
          `So the ${rootWord} of ${val} is ${n}.`,
        ],
        concept: "Roots of round numbers split into easy factors.",
        verify: () => n ** pow === val,
      });
    }
    const n = rng.int(3, cube ? 9 : 12);
    const val = n ** pow;
    const us = skill.params.region === "US";
    const smallU = us ? "inches" : "centimetres";
    const bigU = us ? "feet" : "metres";
    return inputQ({
      instruction: "Solve the problem.",
      prompt: cube
        ? `A cube-shaped box has a volume of ${val} cubic ${smallU}. How long is each edge, in ${smallU}?`
        : `A square garden has an area of ${val} square ${bigU}. How long is each side, in ${bigU}?`,
      answer: String(n),
      hint: cube ? "Edge × edge × edge = volume, so take the cube root." : "Side × side = area, so take the square root.",
      steps: [
        cube ? `edge^3 = ${val}.` : `side^2 = ${val}.`,
        `${n}^${pow} = ${val}, so each ${cube ? "edge" : "side"} is ${n}.`,
      ],
      concept: cube ? "Cube roots recover an edge from a volume." : "Square roots recover a side from an area.",
      representation: "word",
      verify: () => n ** pow === val,
    });
  },
};

/* ------------------------------------------------------------- real-numbers */
/** Stage table (classification ladder):
 *  1 whole numbers
 *  2 integers
 *  3 rational numbers
 *  4 irrational numbers
 *  5 true/false about the number sets
 */
const realNumbers: GeneratorFamily = {
  stageLabel: (s, st) =>
    ["Whole numbers", "Integers", "Rational numbers", "Irrational numbers", "Facts about the sets"][st - 1],
  generate(skill, stage, rng): RawQuestion {
    if (stage === 1) {
      const w = rng.int(0, 20);
      const negInt = -rng.int(1, 9);
      const dec = `${rng.int(1, 9)}.${rng.int(1, 9)}`;
      const frac = `{${rng.int(1, 4)}/${rng.int(5, 9)}}`;
      const ans = String(w);
      return mcQ({
        instruction: "Which of these is a whole number?",
        prompt: "Whole numbers are 0, 1, 2, 3, …",
        choices: mcChoices(rng, ans, [neg(negInt), dec, frac]),
        answer: ans,
        hint: "Whole numbers have no minus sign, no decimal part, no fraction part.",
        steps: [
          `${neg(negInt)} is negative, ${dec} has a decimal part, and ${frac} is a fraction.`,
          `${ans} is a whole number.`,
        ],
        concept: "The whole numbers are the counting numbers plus zero.",
        verify: () => Number.isInteger(w) && w >= 0,
      });
    }
    if (stage === 2) {
      const int = rng.chance(0.5) ? -rng.int(1, 20) : rng.int(0, 20);
      const dec = `${rng.int(1, 9)}.${rng.int(1, 9)}`;
      const frac = `{${rng.int(1, 4)}/${rng.int(5, 9)}}`;
      const dec2 = `−0.${rng.int(1, 9)}`;
      const ans = neg(int);
      return mcQ({
        instruction: "Which of these is an integer?",
        prompt: "Integers are …, −2, −1, 0, 1, 2, …",
        choices: mcChoices(rng, ans, [dec, frac, dec2]),
        answer: ans,
        hint: "Integers can be negative, but they never have a fraction or decimal part.",
        steps: [
          `${dec}, ${frac} and ${dec2} all have fractional parts.`,
          `${ans} is a whole-valued number, so it is an integer.`,
        ],
        concept: "Integers extend the whole numbers below zero.",
        verify: () => Number.isInteger(int),
      });
    }
    if (stage === 3) {
      const p = rng.int(1, 9);
      const q = rng.int(2, 9);
      const nonSq = rng.pick([2, 3, 5, 7, 8, 10] as const);
      const ans = `{${p}/${q}}`;
      return mcQ({
        instruction: "Which of these is a rational number?",
        prompt: "A rational number can be written as a fraction of two integers.",
        choices: mcChoices(rng, ans, ["π", `sqrt(${nonSq})`, `sqrt(${nonSq === 2 ? 3 : 2})`]),
        answer: ans,
        hint: "Look for the number that is already a fraction of integers.",
        steps: [
          `π and square roots of non-perfect squares never settle into a repeating decimal.`,
          `${ans} is a ratio of the integers ${p} and ${q}, so it is rational.`,
        ],
        concept: "Rational means expressible as an integer fraction.",
        verify: () => Number.isFinite(p / q),
      });
    }
    if (stage === 4) {
      const nonSq = rng.pick([2, 3, 5, 6, 7, 8, 10, 11, 12] as const);
      const sq = rng.pick([4, 9, 16, 25, 36] as const);
      const ans = `sqrt(${nonSq})`;
      return mcQ({
        instruction: "Which of these is irrational?",
        prompt: "An irrational number cannot be written as a fraction of integers.",
        choices: mcChoices(rng, ans, [
          `sqrt(${sq})`,
          `0.${rng.int(1, 9)}`,
          neg(-rng.int(1, 9)),
        ]),
        answer: ans,
        hint: `Is ${nonSq} a perfect square?`,
        steps: [
          `sqrt(${sq}) = ${Math.sqrt(sq)}, which is an integer — rational.`,
          `Decimals that end and plain integers are rational too.`,
          `${nonSq} is not a perfect square, so sqrt(${nonSq}) is irrational.`,
        ],
        concept: "Square roots of non-perfect squares are irrational.",
        verify: () => !Number.isInteger(Math.sqrt(nonSq)) && Number.isInteger(Math.sqrt(sq)),
      });
    }
    const facts: { text: string; truth: boolean; why: string }[] = [
      { text: "Every integer is a rational number.", truth: true, why: "Any integer n can be written as {n/1}." },
      { text: "Every rational number is an integer.", truth: false, why: "{1/2} is rational but not an integer." },
      { text: "Every whole number is an integer.", truth: true, why: "The integers contain 0, 1, 2, 3, … and their negatives." },
      { text: "Every integer is a whole number.", truth: false, why: "−3 is an integer but not a whole number." },
      { text: "sqrt(2) can be written as a fraction of two integers.", truth: false, why: "sqrt(2) is irrational — no integer fraction equals it." },
      { text: "Every irrational number is a real number.", truth: true, why: "The real numbers contain both the rationals and the irrationals." },
    ];
    const f = rng.pick(facts);
    const ans = f.truth ? "True" : "False";
    return mcQ({
      instruction: "True or false?",
      prompt: f.text,
      choices: rng.shuffle(["True", "False", "Cannot be determined"]),
      answer: ans,
      hint: "Test the statement against an example number.",
      steps: [f.why, `The statement is ${ans.toLowerCase()}.`],
      concept: "The number sets nest: whole ⊂ integer ⊂ rational ⊂ real.",
    });
  },
};

export const integerFamilies = {
  "integer-ops": integerOps,
  "abs-value": absValue,
  "int-compare": intCompare,
  "exponent-eval": exponentEval,
  "exponent-rules": exponentRules,
  "sci-notation": sciNotation,
  roots: roots,
  "real-numbers": realNumbers,
} satisfies Record<string, GeneratorFamily>;
