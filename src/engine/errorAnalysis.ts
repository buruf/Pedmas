/**
 * Error-analysis questions (spec §11).
 *
 * A student is shown someone else's wrong working and asked to judge it.
 * This is a different cognitive act from computing: it forces the child to
 * check a method rather than run one, and it is the natural companion to the
 * lesson system — every entry here attacks a misconception a lesson teaches
 * against, so the two reinforce each other.
 *
 * Keyed by generator family. Families without an entry simply never produce
 * one; the mixer asks and moves on.
 */
import type { RawQuestion, Rng, SkillRef } from "./types";
import { mcQ, mcChoices, pickName } from "./families/helpers";
import { simplify, ansFrac } from "./num";

interface ErrorCase {
  /** The working as the fictional student wrote it. */
  prompt: string;
  /** Option that both names the error and gives the right answer. */
  right: string;
  /** Wrong options: other plausible diagnoses, or "yes it's correct". */
  wrong: string[];
  hint: string;
  steps: string[];
  concept: string;
}

type Builder = (rng: Rng, name: string) => ErrorCase;

const say = (name: string, work: string) => `${name} worked this out:\n\n${work}`;

/** Money always shows two decimal places — "$40.5" reads as a typo. */
const money = (v: number) => `$${v.toFixed(2)}`;

/* ------------------------------------------------------------- the cases */

const CASES: Record<string, Builder> = {
  // Adding the denominators — the error that decides whether fractions ever
  // make sense.
  "frac-add-sub": (rng, name) => {
    const [a, b] = rng.pick([
      [{ n: 1, d: 2 }, { n: 1, d: 3 }],
      [{ n: 1, d: 2 }, { n: 1, d: 4 }],
      [{ n: 1, d: 3 }, { n: 1, d: 6 }],
      [{ n: 2, d: 3 }, { n: 1, d: 4 }],
    ]);
    const correct = simplify({ n: a.n * b.d + b.n * a.d, d: a.d * b.d });
    const wrong = { n: a.n + b.n, d: a.d + b.d };
    return {
      prompt: say(name, `{${a.n}/${a.d}} + {${b.n}/${b.d}} = {${wrong.n}/${wrong.d}}`),
      right: `No — the bottoms were added. It is ${ansFrac(correct)}`,
      wrong: [
        "Yes, that is correct",
        `No — it is ${ansFrac({ n: a.n * b.n, d: a.d * b.d })}`,
        `No — it is ${ansFrac(simplify({ n: a.n + b.n, d: a.d * b.d }))}`,
      ],
      hint: "The bottom number says how big the pieces are. It is not a thing you count.",
      steps: [
        `The pieces are different sizes, so they must be renamed first.`,
        `{${a.n}/${a.d}} + {${b.n}/${b.d}} = ${ansFrac(correct)}.`,
        `Check the size: the answer must be bigger than {${a.n}/${a.d}}, and it is.`,
      ],
      concept: "Adding denominators makes the answer smaller than what you started with.",
    };
  },

  // Longer decimal read as bigger.
  "dec-compare": (rng, name) => {
    const [big, small] = rng.pick([
      ["0.5", "0.45"],
      ["0.6", "0.58"],
      ["0.3", "0.29"],
      ["0.7", "0.65"],
    ]);
    return {
      prompt: say(name, `${small} is bigger than ${big}\nbecause ${small.slice(2)} is bigger than ${big.slice(2)}`),
      right: `No — ${big} is bigger`,
      wrong: [
        "Yes, that is correct",
        "No — they are the same size",
        "No — you cannot compare decimals of different lengths",
      ],
      hint: "Even them up with a zero, then compare place by place from the left.",
      steps: [
        `Write ${big} with the same number of places: ${big}0.`,
        `Now compare tenths first — that decides it.`,
        `${big} is bigger, even though it looks shorter.`,
      ],
      concept: "A longer decimal is not a bigger one. More digits just means a finer measurement.",
    };
  },

  // Two discounts treated as additive.
  "percent-apps": (rng, name) => {
    const price = rng.pick([100, 200, 50]);
    const first = rng.pick([20, 10]);
    const second = 10;
    const afterFirst = price * (1 - first / 100);
    const real = afterFirst * (1 - second / 100);
    const naive = price * (1 - (first + second) / 100);
    return {
      prompt: say(
        name,
        `${money(price)} with ${first}% off, then ${second}% off\n= ${first + second}% off\n= ${money(naive)}`
      ),
      right: `No — the second cut is off the reduced price. It is ${money(real)}`,
      wrong: [
        "Yes, that is correct",
        `No — it is ${money(price - first - second)}`,
        `No — it is ${money(afterFirst)}`,
      ],
      hint: "The second percentage is taken from whatever the price is at that moment.",
      steps: [
        `First cut: ${money(price)} becomes ${money(afterFirst)}.`,
        `The ${second}% comes off ${money(afterFirst)}, not ${money(price)}.`,
        `Final price ${money(real)}, so the saving is not ${first + second}%.`,
      ],
      concept: "Percentages never add. Chain the multipliers instead.",
    };
  },

  // Subtracting a negative read as making it smaller.
  "integer-ops": (rng, name) => {
    const a = rng.int(3, 9);
    const b = rng.int(2, 6);
    return {
      prompt: say(name, `${a} − (−${b}) = ${a - b}`),
      right: `No — taking away a negative adds. It is ${a + b}`,
      wrong: [
        "Yes, that is correct",
        `No — it is −${a + b}`,
        `No — it is −${Math.abs(a - b)}`,
      ],
      hint: "Removing a debt leaves you better off, not worse.",
      steps: [
        `Taking away −${b} is the same as adding ${b}.`,
        `${a} − (−${b}) = ${a} + ${b} = ${a + b}.`,
        `The answer must be bigger than ${a}, and it is.`,
      ],
      concept: "Subtracting a negative moves you up the number line.",
    };
  },

  // Multiplying the exponents instead of adding them.
  "exponent-rules": (rng, name) => {
    const p = rng.int(2, 4);
    const q = rng.int(2, 4);
    return {
      prompt: say(name, `x^${p} × x^${q} = x^{${p * q}}`),
      right: `No — the exponents add. It is x^{${p + q}}`,
      wrong: [
        "Yes, that is correct",
        `No — it is x^{${Math.abs(p - q)}}`,
        `No — it is 2x^{${p + q}}`,
      ],
      hint: "Write the powers out in full and count the x's.",
      steps: [
        `x^${p} is ${p} x's multiplied, and x^${q} is ${q} more.`,
        `Altogether that is ${p} + ${q} = ${p + q} x's.`,
        `Test it with x = 2: ${2 ** p} × ${2 ** q} = ${2 ** (p + q)}, which is 2^{${p + q}}.`,
      ],
      concept: "Multiplying powers of the same base adds the exponents.",
    };
  },

  // Collapsing unlike terms.
  "combine-like-terms": (rng, name) => {
    const a = rng.int(2, 5);
    const b = rng.int(2, 7);
    const test = 4;
    return {
      prompt: say(name, `${a}x + ${b} = ${a + b}x`),
      right: `No — ${b} has no x, so it cannot join. It stays ${a}x + ${b}`,
      wrong: [
        "Yes, that is correct",
        `No — it is ${a * b}x`,
        `No — it is ${a + b}`,
      ],
      hint: "Try a number. Does the original and the answer agree?",
      steps: [
        `Test x = ${test}: the original is ${a * test} + ${b} = ${a * test + b}.`,
        `The claimed answer gives ${(a + b) * test}.`,
        `Different, so the two are not the same expression.`,
      ],
      concept: "Only terms with exactly the same letter part can be added.",
    };
  },

  // Distributing to only the first term.
  distributive: (rng, name) => {
    const a = rng.int(2, 5);
    const b = rng.int(2, 6);
    const test = 5;
    return {
      prompt: say(name, `${a}(x + ${b}) = ${a}x + ${b}`),
      right: `No — the ${b} must be multiplied too. It is ${a}x + ${a * b}`,
      wrong: [
        "Yes, that is correct",
        `No — it is ${a}x + ${a + b}`,
        `No — it is ${a * b}x`,
      ],
      hint: "The number outside multiplies everything inside the bracket.",
      steps: [
        `Test x = ${test}: the original is ${a} × ${test + b} = ${a * (test + b)}.`,
        `The claimed answer gives ${a * test} + ${b} = ${a * test + b}.`,
        `The correct expansion is ${a}x + ${a * b}.`,
      ],
      concept: "Distributing means multiplying every term inside the bracket.",
    };
  },

  // The forgotten middle term.
  "poly-mul": (rng, name) => {
    const b = rng.int(2, 5);
    const test = 2;
    return {
      prompt: say(name, `(x + ${b})^2 = x^2 + ${b * b}`),
      right: `No — the middle term is missing. It is x^2 + ${2 * b}x + ${b * b}`,
      wrong: [
        "Yes, that is correct",
        `No — it is x^2 + ${b}x + ${b * b}`,
        `No — it is 2x + ${2 * b}`,
      ],
      hint: "Squaring a bracket means multiplying it by itself, which gives four products.",
      steps: [
        `Test x = ${test}: the original is (${test + b})^2 = ${(test + b) ** 2}.`,
        `The claimed answer gives ${test * test} + ${b * b} = ${test * test + b * b}.`,
        `Expanding properly gives x^2 + ${2 * b}x + ${b * b}.`,
      ],
      concept: "Squaring a bracket always produces a middle term.",
    };
  },

  // Roots split over a plus.
  "radical-expression": (_rng, name) => ({
    prompt: say(name, `sqrt(9 + 16) = sqrt(9) + sqrt(16) = 3 + 4 = 7`),
    right: "No — add first, then take the root. It is 5",
    wrong: [
      "Yes, that is correct",
      "No — it is 12",
      "No — it is 25",
    ],
    hint: "Work out what is under the root sign before doing anything else.",
    steps: [
      "9 + 16 = 25, and sqrt(25) = 5.",
      "The claimed method gives 7, which is not 5.",
      "Roots do split over multiplication, but never over addition.",
    ],
    concept: "sqrt(a + b) is not sqrt(a) + sqrt(b).",
  }),

  // Cancelling across a plus sign.
  "rational-expression": (rng, name) => {
    const k = rng.int(2, 5);
    const test = 4;
    return {
      prompt: say(name, `{x + ${k}/${k}} = x`),
      right: `No — you cannot cancel across a plus. At x = ${test} it is ${(test + k) / k}, not ${test}`,
      wrong: [
        "Yes, that is correct",
        `No — it is x + 1`,
        `No — it is ${k}x`,
      ],
      hint: "Cancelling only works on things multiplied, never on one part of a sum.",
      steps: [
        `Test x = ${test}: the original is ${test + k} ÷ ${k} = ${(test + k) / k}.`,
        `The claimed answer gives ${test}.`,
        `The ${k} on top is added, not multiplied, so it cannot cancel.`,
      ],
      concept: "Only common factors cancel — never a term inside a sum.",
    };
  },

  // Perimeter and area confused.
  "perimeter-area": (rng, name) => {
    const w = rng.int(3, 8);
    const h = rng.int(2, 7);
    return {
      prompt: say(name, `A rectangle is ${w} cm by ${h} cm.\nIts perimeter is ${w * h} cm`),
      right: `No — that is the area. The perimeter is ${2 * (w + h)} cm`,
      wrong: [
        "Yes, that is correct",
        `No — the perimeter is ${w + h} cm`,
        `No — the perimeter is ${2 * w * h} cm`,
      ],
      hint: "Perimeter is the walk around the edge; area is the covering inside.",
      steps: [
        `Walking round: ${w} + ${h} + ${w} + ${h} = ${2 * (w + h)} cm.`,
        `${w} × ${h} = ${w * h} is the area, measured in cm^2.`,
        "The units give it away: perimeter is cm, area is cm^2.",
      ],
      concept: "Perimeter adds the sides; area multiplies them.",
    };
  },

  // Adding the legs instead of the squares.
  pythagorean: (rng, name) => {
    const [a, b, c] = rng.pick([
      [3, 4, 5],
      [6, 8, 10],
      [5, 12, 13],
    ]);
    return {
      prompt: say(name, `A right triangle has legs ${a} and ${b}.\nThe hypotenuse is ${a + b}`),
      right: `No — the squares add, not the sides. It is ${c}`,
      wrong: [
        "Yes, that is correct",
        `No — it is ${a * b}`,
        `No — it is ${b - a}`,
      ],
      hint: "The rule squares each side before adding.",
      steps: [
        `${a}^2 + ${b}^2 = ${a * a} + ${b * b} = ${c * c}.`,
        `The hypotenuse is sqrt(${c * c}) = ${c}.`,
        `${a + b} would be longer than going along both legs, which is impossible.`,
      ],
      concept: "a^2 + b^2 = c^2 squares the sides first.",
    };
  },

  // Median taken without ordering.
  "central-tendency": (rng, name) => {
    const data = rng.shuffle([4, 6, 8, 13, 4]);
    const sorted = [...data].sort((x, y) => x - y);
    const middleAsWritten = data[2];
    const median = sorted[2];
    if (middleAsWritten === median) {
      // Guarantee the mistake is visible.
      const swapped = [13, 4, 8, 4, 6];
      return {
        prompt: say(name, `Data: 13, 4, 8, 4, 6\nThe median is 8`),
        right: "No — the data must be ordered first. The median is 6",
        wrong: ["Yes, that is correct", "No — the median is 4", "No — the median is 7"],
        hint: "Put the numbers in order before taking the middle one.",
        steps: [
          `In order: ${[...swapped].sort((x, y) => x - y).join(", ")}.`,
          "The middle value is 6.",
          "8 was simply the number written in the middle of the list.",
        ],
        concept: "The median is the middle of the ordered data, not of the list as written.",
      };
    }
    return {
      prompt: say(name, `Data: ${data.join(", ")}\nThe median is ${middleAsWritten}`),
      right: `No — the data must be ordered first. The median is ${median}`,
      wrong: [
        "Yes, that is correct",
        `No — the median is ${sorted[0]}`,
        `No — the median is ${sorted[4]}`,
      ],
      hint: "Put the numbers in order before taking the middle one.",
      steps: [
        `In order: ${sorted.join(", ")}.`,
        `The middle value is ${median}.`,
        `${middleAsWritten} was just the number sitting in the middle of the list.`,
      ],
      concept: "The median is the middle of the ordered data.",
    };
  },

  // Left to right, ignoring precedence.
  "order-of-ops": (rng, name) => {
    const a = rng.int(2, 6);
    const b = rng.int(2, 5);
    const c = rng.int(2, 6);
    return {
      prompt: say(name, `${a} + ${b} × ${c} = ${(a + b) * c}`),
      right: `No — multiply first. It is ${a + b * c}`,
      wrong: [
        "Yes, that is correct",
        `No — it is ${a * b + c}`,
        `No — it is ${a + b + c}`,
      ],
      hint: "Multiplication binds tighter than addition, whatever order they are written in.",
      steps: [
        `${b} × ${c} = ${b * c} has to be built first.`,
        `Then ${a} + ${b * c} = ${a + b * c}.`,
        `Working left to right gives ${(a + b) * c}, which is a different sum.`,
      ],
      concept: "Multiplication and division happen before addition and subtraction.",
    };
  },

  // Rounding in stages.
  rounding: (_rng, name) => ({
    prompt: say(name, `348 to the nearest hundred:\n348 → 350 → 400`),
    right: "No — round once, straight to hundreds. It is 300",
    wrong: [
      "Yes, that is correct",
      "No — it is 350",
      "No — it is 340",
    ],
    hint: "Look only at the digit immediately after the place you are rounding to.",
    steps: [
      "The hundreds digit is 3, and the digit after it is 4.",
      "4 rounds down, so 348 becomes 300.",
      "Rounding twice inflated the answer to 400.",
    ],
    concept: "Round once, using the single digit after the target place.",
  }),

  // Converting the wrong way.
  "unit-conversion": (rng, name) => {
    const cm = rng.pick([300, 500, 800]);
    return {
      prompt: say(name, `${cm} cm = ${cm * 100} m`),
      right: `No — metres are bigger, so divide. It is ${cm / 100} m`,
      wrong: [
        "Yes, that is correct",
        `No — it is ${cm * 10} m`,
        `No — it is ${cm / 10} m`,
      ],
      hint: "Going to a bigger unit always gives a smaller number.",
      steps: [
        `1 m = 100 cm, so divide by 100.`,
        `${cm} ÷ 100 = ${cm / 100} m.`,
        `${cm * 100} m would be ${cm} kilometres of it — clearly wrong.`,
      ],
      concept: "Bigger unit, smaller number. Multiply going down, divide going up.",
    };
  },
};

/** Families that can produce an error-analysis question. */
export function hasErrorAnalysis(family: string): boolean {
  return family in CASES;
}

/**
 * Build an error-analysis question for a skill, or null when its family has
 * no case written.
 */
export function errorAnalysisFor(skill: SkillRef, rng: Rng): RawQuestion | null {
  const build = CASES[skill.family];
  if (!build) return null;
  const name = pickName(rng);
  const c = build(rng, name);
  return mcQ({
    instruction: "Spot the mistake.",
    prompt: c.prompt,
    choices: mcChoices(rng, c.right, c.wrong),
    answer: c.right,
    hint: c.hint,
    steps: c.steps,
    concept: c.concept,
    representation: "error-analysis",
  });
}

/** Exposed for tests: every family that carries a case. */
export const ERROR_ANALYSIS_FAMILIES = Object.keys(CASES);
