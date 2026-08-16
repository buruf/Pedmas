import type { GeneratorFamily, RawQuestion, Rng, SkillRef } from "../types";
import { inputQ, mcQ, mcChoices, pickName } from "./helpers";
import {
  Frac,
  fracAdd,
  fracSub,
  fracMul,
  fracDiv,
  fracEq,
  fracCmp,
  fracValue,
  simplify,
  fmtFrac,
  fmtMixed,
  ansFrac,
  ansMixed,
  gcd,
  lcm,
} from "../num";

const str = (p: Record<string, unknown>, key: string, dflt: string): string =>
  typeof p[key] === "string" ? (p[key] as string) : dflt;

function properFrac(rng: Rng, maxDen: number, minDen = 2): Frac {
  const d = rng.int(minDen, maxDen);
  const n = rng.int(1, d - 1);
  return { n, d };
}

/* ------------------------------------------------------------ frac-identify */
const fracIdentify: GeneratorFamily = {
  stageLabel: (s, st) =>
    ["Equal parts", "Name the fraction", "Numerator & denominator", "Fraction of a set", "Wholes and parts"][st - 1],
  generate(skill, stage, rng): RawQuestion {
    if (stage === 1) {
      const parts = rng.pick([2, 3, 4, 6, 8]);
      return inputQ({
        instruction: "A shape is cut into equal parts.",
        prompt: `A pizza is cut into ${parts} equal slices. One slice is what fraction of the pizza?`,
        answer: `1/${parts}`,
        answerFormat: "fraction",
        answerHint: "e.g. 1/4",
        hint: `The bottom number counts the equal parts.`,
        steps: [`There are ${parts} equal parts.`, `One part is {1/${parts}} of the whole.`],
        concept: "A unit fraction is one equal part of a whole.",
        representation: "visual",
      });
    }
    if (stage === 2 || stage === 3) {
      const d = rng.pick([3, 4, 5, 6, 8, 10]);
      const n = rng.int(1, d - 1);
      const shaded = "🟪".repeat(n) + "⬜".repeat(d - n);
      if (stage === 3) {
        const askNum = rng.chance(0.5);
        return inputQ({
          instruction: `In the fraction {${n}/${d}}, what is the ${askNum ? "numerator" : "denominator"}?`,
          prompt: `${shaded}  (${n} shaded out of ${d})`,
          answer: String(askNum ? n : d),
          hint: askNum ? "The top number counts shaded parts." : "The bottom number counts all equal parts.",
          steps: [
            `The numerator ${n} counts the shaded parts.`,
            `The denominator ${d} counts all equal parts.`,
          ],
          concept: "Numerator on top, denominator on the bottom.",
          representation: "visual",
        });
      }
      return inputQ({
        instruction: "What fraction is shaded?",
        prompt: shaded,
        answer: `${n}/${d}`,
        answerFormat: "fraction",
        answerHint: "e.g. 3/8",
        hint: "Count shaded parts over total parts.",
        steps: [`${n} parts are shaded out of ${d} equal parts.`, `The fraction is {${n}/${d}}.`],
        concept: "A fraction compares parts to the whole.",
        representation: "visual",
      });
    }
    if (stage === 4) {
      const d = rng.pick([3, 4, 5, 6]);
      const n = rng.int(1, d - 1);
      const total = d * rng.int(2, 4);
      const count = (total / d) * n;
      return inputQ({
        instruction: "Find the fraction of the set.",
        prompt: `${count} of the ${total} marbles are red. What fraction of the marbles is red? Give your answer in simplest form.`,
        answer: ansFrac({ n: count, d: total }),
        answerFormat: "fraction",
        hint: `Write ${count} over ${total}, then simplify.`,
        steps: [
          `{${count}/${total}} of the marbles are red.`,
          `Divide top and bottom by ${gcd(count, total)}: {${count}/${total}} = ${fmtFrac(simplify({ n: count, d: total }))}.`,
        ],
        concept: "Fractions can describe parts of a group, not just shapes.",
        verify: () => fracEq({ n: count, d: total }, simplify({ n: count, d: total })),
      });
    }
    const d = rng.pick([2, 3, 4]);
    const whole = rng.int(1, 2);
    const n = whole * d + rng.int(1, d - 1);
    return inputQ({
      instruction: "Improper fractions name more than one whole.",
      prompt: `How many whole pizzas are in {${n}/${d}} pizzas? (Whole number part only)`,
      answer: String(whole),
      hint: `How many times does ${d} fit into ${n}?`,
      steps: [`${d} parts make one whole.`, `${n} ÷ ${d} = ${whole} whole pizzas with ${n - whole * d} part(s) left.`],
      concept: "An improper fraction is one whole or more.",
      verify: () => Math.trunc(n / d) === whole,
    });
  },
};

/* ---------------------------------------------------------- frac-equivalent */
const fracEquivalent: GeneratorFamily = {
  stageLabel: (s, st) =>
    ["Double it", "Missing numerator", "Missing denominator", "Spot the equivalent", "Equivalence everywhere"][st - 1],
  generate(skill, stage, rng): RawQuestion {
    const base = properFrac(rng, stage <= 2 ? 5 : 9);
    const s = simplify(base);
    const k = rng.int(2, stage >= 4 ? 6 : 3);
    const big: Frac = { n: s.n * k, d: s.d * k };
    if (stage === 4) {
      const ans = fmtPlain(big);
      const wrongs = [
        `${s.n + 1}/${s.d + 1}`,
        `${s.n * k}/${s.d * (k + 1)}`,
        `${s.n + k}/${s.d + k}`,
      ].filter((w) => {
        const [n, d] = w.split("/").map(Number);
        return !fracEq({ n, d }, s);
      });
      return mcQ({
        instruction: `Which fraction is equivalent to {${s.n}/${s.d}}?`,
        prompt: "Multiply top and bottom by the same number.",
        choices: mcChoices(rng, ans, wrongs),
        answer: ans,
        hint: "Equivalent fractions multiply the top and bottom by the same amount.",
        steps: [`{${s.n}/${s.d}} × {${k}/${k}} = {${big.n}/${big.d}}.`],
        concept: "Multiplying by k/k keeps a fraction's value.",
        verify: () => fracEq(s, big),
      });
    }
    const missing = stage === 3 ? "den" : "num";
    if (stage === 5 && rng.chance(0.5)) {
      const name = pickName(rng);
      return inputQ({
        instruction: "Solve the problem.",
        prompt: `${name} ate {${s.n}/${s.d}} of a cake. The cake is cut into ${big.d} equal pieces. How many pieces did ${name} eat?`,
        answer: String(big.n),
        hint: `Rewrite {${s.n}/${s.d}} with denominator ${big.d}.`,
        steps: [`{${s.n}/${s.d}} = {${big.n}/${big.d}}.`, `${name} ate ${big.n} pieces.`],
        concept: "Equivalent fractions rename the same amount.",
        representation: "word",
        verify: () => fracEq(s, big),
      });
    }
    if (missing === "num") {
      return inputQ({
        instruction: "Find the missing numerator.",
        prompt: `{${s.n}/${s.d}} = {?/${big.d}}`,
        answer: String(big.n),
        hint: `${s.d} × ${k} = ${big.d}, so multiply the numerator by ${k} too.`,
        steps: [`The denominator was multiplied by ${k}.`, `${s.n} × ${k} = ${big.n}.`],
        concept: "Whatever you do to the bottom, do to the top.",
        verify: () => fracEq(s, big),
      });
    }
    return inputQ({
      instruction: "Find the missing denominator.",
      prompt: `{${s.n}/${s.d}} = {${big.n}/?}`,
      answer: String(big.d),
      hint: `${s.n} × ${k} = ${big.n}, so multiply the denominator by ${k} too.`,
      steps: [`The numerator was multiplied by ${k}.`, `${s.d} × ${k} = ${big.d}.`],
      concept: "Equivalent fractions scale top and bottom together.",
      verify: () => fracEq(s, big),
    });
  },
};

function fmtPlain(f: Frac): string {
  return `${f.n}/${f.d}`;
}

/* ------------------------------------------------------------ frac-simplify */
const fracSimplify: GeneratorFamily = {
  stageLabel: (s, st) =>
    ["Halves and thirds", "Common factors", "Bigger numbers", "Already simplest?", "Simplify anywhere"][st - 1],
  generate(skill, stage, rng): RawQuestion {
    if (stage === 4) {
      const simple = rng.chance(0.5);
      const f = simple ? simplestFrac(rng, 9) : nonSimplestFrac(rng, 4, 6);
      const ans = simple ? "Yes" : "No";
      return mcQ({
        instruction: `Is {${f.n}/${f.d}} in simplest form?`,
        prompt: `Check whether ${f.n} and ${f.d} share a common factor.`,
        choices: rng.shuffle(["Yes", "No", "Cannot tell"]),
        answer: ans,
        hint: "Simplest form means the only common factor is 1.",
        steps: [
          simple
            ? `The greatest common factor of ${f.n} and ${f.d} is 1, so it is already simplest.`
            : `${f.n} and ${f.d} share the factor ${gcd(f.n, f.d)}, so it can be simplified to ${fmtFrac(simplify(f))}.`,
        ],
        concept: "Simplest form has no shared factors left.",
        verify: () => (gcd(f.n, f.d) === 1) === simple,
      });
    }
    const k = stage === 1 ? rng.pick([2, 3]) : rng.int(2, stage >= 3 ? 8 : 5);
    const s = simplestFrac(rng, stage >= 3 ? 9 : 5);
    const f: Frac = { n: s.n * k, d: s.d * k };
    return inputQ({
      instruction: "Write the fraction in simplest form.",
      prompt: `{${f.n}/${f.d}}`,
      answer: ansFrac(f),
      answerFormat: "fraction",
      hint: `Find the greatest common factor of ${f.n} and ${f.d}.`,
      steps: [
        `GCF of ${f.n} and ${f.d} is ${gcd(f.n, f.d)}.`,
        `Divide top and bottom by ${gcd(f.n, f.d)}: {${f.n}/${f.d}} = ${fmtFrac(s)}.`,
      ],
      concept: "Dividing top and bottom by the GCF fully simplifies a fraction.",
      verify: () => fracEq(f, s) && gcd(s.n, s.d) === 1,
    });
  },
};

function simplestFrac(rng: Rng, maxDen: number): Frac {
  for (let i = 0; i < 50; i++) {
    const f = properFrac(rng, maxDen);
    if (gcd(f.n, f.d) === 1) return f;
  }
  return { n: 1, d: 2 };
}
function nonSimplestFrac(rng: Rng, maxK: number, maxDen: number): Frac {
  const s = simplestFrac(rng, maxDen);
  const k = rng.int(2, maxK);
  return { n: s.n * k, d: s.d * k };
}

/* ------------------------------------------------------------- frac-compare */
const fracCompare: GeneratorFamily = {
  stageLabel: (s, st) =>
    ["Same denominator", "Same numerator", "Compare to one half", "Unlike denominators", "Order fractions"][st - 1],
  generate(skill, stage, rng): RawQuestion {
    if (stage === 5) {
      const fs: Frac[] = [];
      while (fs.length < 3) {
        const f = properFrac(rng, 8);
        if (!fs.some((g) => fracEq(f, g))) fs.push(f);
      }
      const sorted = [...fs].sort(fracCmp);
      const correct = sorted.map(fmtFracDisp).join(", ");
      const reversed = [...sorted].reverse().map(fmtFracDisp).join(", ");
      const asIs = fs.map(fmtFracDisp).join(", ");
      // reversed/asIs are the realistic error patterns, but either can coincide
      // with the correct order; back them with the remaining permutations so
      // there are always enough distinct choices.
      const others = permutations(fs).map((p) => p.map(fmtFracDisp).join(", "));
      return mcQ({
        instruction: "Which list orders the fractions from least to greatest?",
        prompt: fs.map(fmtFracDisp).join("   "),
        choices: mcChoices(rng, correct, [reversed, asIs, ...rng.shuffle(others)]),
        answer: correct,
        hint: "Give them a common denominator, or compare each to one half.",
        steps: [
          `As decimals: ${fs.map((f) => (fracValue(f)).toFixed(2)).join(", ")}.`,
          `Least to greatest: ${correct}.`,
        ],
        concept: "A common denominator makes fractions directly comparable.",
        verify: () => sorted.every((f, i) => i === 0 || fracCmp(sorted[i - 1], f) <= 0),
      });
    }
    let a: Frac, b: Frac;
    if (stage === 1) {
      const d = rng.pick([3, 4, 5, 6, 8, 10]);
      let n1 = rng.int(1, d - 1);
      let n2 = rng.int(1, d - 1);
      while (n2 === n1) n2 = rng.int(1, d - 1);
      a = { n: n1, d };
      b = { n: n2, d };
    } else if (stage === 2) {
      const n = rng.int(1, 5);
      let d1 = rng.int(n + 1, 10);
      let d2 = rng.int(n + 1, 10);
      while (d2 === d1) d2 = rng.int(n + 1, 10);
      a = { n, d: d1 };
      b = { n, d: d2 };
    } else if (stage === 3) {
      a = properFrac(rng, 10);
      b = { n: 1, d: 2 };
      if (fracEq(a, b)) a = { n: 2, d: 3 };
    } else {
      a = properFrac(rng, 9);
      b = properFrac(rng, 9);
      while (fracEq(a, b)) b = properFrac(rng, 9);
    }
    const cmp = fracCmp(a, b);
    const ans = cmp > 0 ? ">" : "<";
    const l = lcm(a.d, b.d);
    return mcQ({
      instruction: "Compare the fractions.",
      prompt: `${fmtFracDisp(a)} ___ ${fmtFracDisp(b)}`,
      choices: rng.shuffle(["<", ">", "="]),
      answer: ans,
      hint:
        stage === 1
          ? "Same denominator: compare numerators."
          : stage === 2
            ? "Same numerator: smaller denominator means bigger pieces."
            : "Rewrite with a common denominator.",
      steps:
        stage <= 2
          ? [
              stage === 1
                ? `Same size pieces: ${a.n} pieces vs ${b.n} pieces, so ${fmtFracDisp(a)} ${ans} ${fmtFracDisp(b)}.`
                : `Same count of pieces; ${ans === ">" ? "smaller" : "bigger"} denominator on the ${ans === ">" ? "left" : "right"} means ${ans === ">" ? "bigger" : "smaller"} pieces on the left.`,
            ]
          : [
              `Common denominator ${l}: {${(a.n * l) / a.d}/${l}} vs {${(b.n * l) / b.d}/${l}}.`,
              `${(a.n * l) / a.d} ${ans} ${(b.n * l) / b.d}, so ${fmtFracDisp(a)} ${ans} ${fmtFracDisp(b)}.`,
            ],
      concept: "Fractions compare cleanly once the pieces are the same size.",
      verify: () => (cmp > 0) === (ans === ">"),
    });
  },
};

function fmtFracDisp(f: Frac): string {
  return `{${f.n}/${f.d}}`;
}

/** Every ordering of a small list, used to build ordering distractors. */
function permutations<T>(items: readonly T[]): T[][] {
  if (items.length <= 1) return [[...items]];
  const out: T[][] = [];
  for (let i = 0; i < items.length; i++) {
    const rest = [...items.slice(0, i), ...items.slice(i + 1)];
    for (const p of permutations(rest)) out.push([items[i], ...p]);
  }
  return out;
}

/* --------------------------------------------------------- frac-number-line */
const fracNumberLine: GeneratorFamily = {
  stageLabel: () => "Fractions on number lines",
  generate(skill, stage, rng): RawQuestion {
    const d = rng.pick(stage <= 2 ? [2, 3, 4] : [4, 5, 6, 8]);
    const n = rng.int(1, stage >= 4 ? d * 2 - 1 : d - 1);
    if (stage >= 3 && rng.chance(0.5)) {
      return inputQ({
        instruction: `A number line from 0 to ${Math.ceil(n / d) || 1} is split into ${d} equal parts per whole.`,
        prompt: `A point sits at the ${n}${n === 1 ? "st" : n === 2 ? "nd" : n === 3 ? "rd" : "th"} mark after 0. What fraction is it? (Answers may be improper.)`,
        answer: `${n}/${d}`,
        accept: n % d === 0 ? [String(n / d)] : n > d ? [ansMixed({ n, d })] : [],
        answerFormat: "fraction",
        hint: `Each mark is worth {1/${d}}.`,
        steps: [`Each step is {1/${d}}.`, `${n} steps from 0 is {${n}/${d}}.`],
        concept: "Number lines show fractions as distances from 0.",
        representation: "number-line",
      });
    }
    const marks = Array.from({ length: d + 1 }, (_, i) =>
      i === n ? "?" : i === 0 ? "0" : i === d ? "1" : "·"
    ).join(" — ");
    return inputQ({
      instruction: `This number line from 0 to 1 is split into ${d} equal parts. What fraction is at the "?" mark?`,
      prompt: marks,
      answer: `${n}/${d}`,
      answerFormat: "fraction",
      hint: `Count the marks: each one is {1/${d}}.`,
      steps: [`The line is cut into ${d} equal jumps.`, `The "?" is ${n} jumps from 0, so it is {${n}/${d}}.`],
      concept: "Equal jumps on a number line are unit fractions.",
      representation: "number-line",
    });
  },
};

/* -------------------------------------------------------------- frac-add-sub */
/** params: op "add" | "sub" | "mixed". Stages follow the spec exactly. */
const fracAddSub: GeneratorFamily = {
  stageLabel: (s, st) =>
    [
      "Same denominator (small)",
      "Same denominator (larger)",
      "Simple unlike denominators",
      "Any unlike denominators",
      "Mixed numbers & review",
    ][st - 1],
  generate(skill, stage, rng): RawQuestion {
    const opParam = str(skill.params, "op", "mixed");
    const op = opParam === "mixed" ? rng.pick(["add", "sub"] as const) : (opParam as "add" | "sub");
    const sym = op === "add" ? "+" : "−";

    let a: Frac, b: Frac;
    if (stage === 1 || stage === 2) {
      const d = stage === 1 ? rng.pick([3, 4, 5, 6]) : rng.pick([8, 10, 12, 15]);
      let n1 = rng.int(1, d - 2);
      let n2 = op === "add" ? rng.int(1, d - n1 - 1) : rng.int(1, n1);
      a = { n: n1, d };
      b = { n: n2, d };
    } else if (stage === 3) {
      const d1 = rng.pick([2, 3, 4, 5, 6]);
      const mult = rng.pick([2, 3]);
      const d2 = d1 * mult;
      a = { n: rng.int(1, d1 - 1), d: d1 };
      b = { n: rng.int(1, d2 - 1), d: d2 };
      if (op === "sub" && fracCmp(a, b) < 0) [a, b] = [b, a];
    } else if (stage === 4) {
      const pairs: [number, number][] = [
        [3, 4],
        [4, 5],
        [3, 5],
        [4, 6],
        [8, 12],
        [6, 8],
        [5, 6],
      ];
      const [d1, d2] = rng.pick(pairs);
      a = { n: rng.int(1, d1 - 1), d: d1 };
      b = { n: rng.int(1, d2 - 1), d: d2 };
      if (op === "sub" && fracCmp(a, b) < 0) [a, b] = [b, a];
    } else {
      const d1 = rng.pick([2, 3, 4, 6]);
      const d2 = rng.pick([2, 3, 4, 6]);
      a = { n: rng.int(1, 2) * d1 + rng.int(1, d1 - 1), d: d1 };
      b = { n: rng.int(0, 1) * d2 + rng.int(1, d2 - 1), d: d2 };
      if (op === "sub" && fracCmp(a, b) < 0) [a, b] = [b, a];
    }

    const result = op === "add" ? fracAdd(a, b) : fracSub(a, b);
    const l = lcm(a.d, b.d);
    const an = (a.n * l) / a.d;
    const bn = (b.n * l) / b.d;
    const rawSum = op === "add" ? an + bn : an - bn;
    const disp = stage === 5 ? fmtMixed : fmtFrac;
    const answer = stage === 5 ? ansMixed(result) : ansFrac(result);
    const accept = stage === 5 ? [ansFrac(result)] : [ansMixed(result), `${rawSum}/${l}`].filter((x) => x !== ansFrac(result));

    const steps: string[] = [];
    if (a.d !== b.d) {
      steps.push(`Find a common denominator: ${l}.`);
      steps.push(`Rewrite: ${fmtFrac(a)} = {${an}/${l}} and ${fmtFrac(b)} = {${bn}/${l}}.`);
    }
    steps.push(`${op === "add" ? "Add" : "Subtract"} the numerators: ${an} ${sym} ${bn} = ${rawSum}.`);
    if (simplify({ n: rawSum, d: l }).d !== l || rawSum >= l) {
      steps.push(`Simplify: {${rawSum}/${l}} = ${disp(result)}.`);
    }
    return inputQ({
      instruction: `${op === "add" ? "Add" : "Subtract"} the fractions. Give your answer in simplest form.`,
      prompt: `${stage === 5 ? fmtMixed(a) : fmtFrac(a)} ${sym} ${stage === 5 ? fmtMixed(b) : fmtFrac(b)} = ?`,
      answer,
      accept,
      answerFormat: "fraction",
      answerHint: stage === 5 ? "e.g. 2 3/4" : "e.g. 3/4",
      hint:
        a.d === b.d
          ? `The pieces are the same size — just ${op === "add" ? "add" : "subtract"} the numerators.`
          : `Make the denominators the same first (try ${l}).`,
      steps,
      concept:
        a.d === b.d
          ? "Same denominators: work with the numerators."
          : "Common denominators make pieces the same size before combining.",
      verify: () => {
        const check: Frac = { n: rawSum, d: l };
        return fracEq(check, result);
      },
    });
  },
};

/* ----------------------------------------------------------------- frac-mul */
const fracMulFam: GeneratorFamily = {
  stageLabel: (s, st) =>
    ["Fraction × whole", "Fraction × fraction", "Simplify first", "Mixed numbers", "Multiply anywhere"][st - 1],
  generate(skill, stage, rng): RawQuestion {
    if (stage === 1) {
      const f = properFrac(rng, 6);
      const w = rng.int(2, 6);
      const result = fracMul(f, { n: w, d: 1 });
      return inputQ({
        instruction: "Multiply. Give your answer in simplest form.",
        prompt: `${fmtFrac(f)} × ${w} = ?`,
        answer: ansMixed(result),
        accept: [ansFrac(result)],
        answerFormat: "fraction",
        hint: `Multiply the numerator by ${w}; the denominator stays.`,
        steps: [
          `${fmtFrac(f)} × ${w} = {${f.n * w}/${f.d}}.`,
          `Simplify: ${fmtMixed(result)}.`,
        ],
        concept: "Multiplying by a whole number scales the numerator.",
        verify: () => fracEq({ n: f.n * w, d: f.d }, result),
      });
    }
    let a: Frac, b: Frac;
    if (stage === 4 || (stage === 5 && rng.chance(0.5))) {
      a = { n: rng.int(1, 2) * rng.pick([2, 3, 4]) + 1, d: rng.pick([2, 3, 4]) };
      a = { n: a.d * rng.int(1, 2) + rng.int(1, a.d - 1), d: a.d };
      b = properFrac(rng, 5);
    } else {
      a = properFrac(rng, stage >= 3 ? 8 : 6);
      b = properFrac(rng, stage >= 3 ? 8 : 6);
    }
    const result = fracMul(a, b);
    const disp = fracValue(result) > 1 ? fmtMixed : fmtFrac;
    return inputQ({
      instruction: "Multiply. Give your answer in simplest form.",
      prompt: `${fracValue(a) > 1 ? fmtMixed(a) : fmtFrac(a)} × ${fmtFrac(b)} = ?`,
      answer: fracValue(result) > 1 ? ansMixed(result) : ansFrac(result),
      accept: [ansFrac(result), ansMixed(result)],
      answerFormat: "fraction",
      hint:
        fracValue(a) > 1
          ? "Turn the mixed number into an improper fraction first."
          : "Multiply straight across: tops together, bottoms together.",
      steps: [
        ...(fracValue(a) > 1 ? [`Convert: ${fmtMixed(a)} = {${a.n}/${a.d}}.`] : []),
        `Multiply numerators: ${a.n} × ${b.n} = ${a.n * b.n}.`,
        `Multiply denominators: ${a.d} × ${b.d} = ${a.d * b.d}.`,
        `Simplify: {${a.n * b.n}/${a.d * b.d}} = ${disp(result)}.`,
      ],
      concept: "Fractions multiply straight across.",
      verify: () => fracEq({ n: a.n * b.n, d: a.d * b.d }, result),
    });
  },
};

/* ----------------------------------------------------------------- frac-div */
const fracDivFam: GeneratorFamily = {
  stageLabel: (s, st) =>
    ["Whole ÷ fraction", "Unit fractions", "Fraction ÷ fraction", "Mixed numbers", "Divide anywhere"][st - 1],
  generate(skill, stage, rng): RawQuestion {
    let a: Frac, b: Frac;
    if (stage === 1) {
      b = { n: 1, d: rng.pick([2, 3, 4]) };
      a = { n: rng.int(1, 4), d: 1 };
    } else if (stage === 2) {
      a = { n: 1, d: rng.pick([2, 3, 4]) };
      b = { n: 1, d: rng.pick([5, 6, 8]) };
    } else if (stage === 3) {
      a = properFrac(rng, 8);
      b = properFrac(rng, 8);
    } else {
      a = { n: rng.pick([2, 3]) * rng.int(1, 2) + 1, d: rng.pick([2, 3]) };
      b = properFrac(rng, 6);
    }
    const result = fracDiv(a, b);
    const disp = fracValue(result) >= 1 ? fmtMixed : fmtFrac;
    const aDisp = a.d === 1 ? String(a.n) : fracValue(a) > 1 ? fmtMixed(a) : fmtFrac(a);
    return inputQ({
      instruction: "Divide. Give your answer in simplest form.",
      prompt: `${aDisp} ÷ ${fmtFrac(b)} = ?`,
      answer: fracValue(result) >= 1 ? ansMixed(result) : ansFrac(result),
      accept: [ansFrac(result), ansMixed(result)],
      answerFormat: "fraction",
      hint: `Dividing by ${fmtFrac(b)} is the same as multiplying by {${b.d}/${b.n}}.`,
      steps: [
        ...(a.d !== 1 && fracValue(a) > 1 ? [`Convert: ${fmtMixed(a)} = {${a.n}/${a.d}}.`] : []),
        `Keep, change, flip: ${aDisp} × {${b.d}/${b.n}}.`,
        `Multiply: {${a.n * b.d}/${a.d * b.n}}.`,
        `Simplify: ${disp(result)}.`,
      ],
      concept: "Dividing by a fraction multiplies by its reciprocal.",
      verify: () => fracEq(fracMul(result, b), simplify(a)),
    });
  },
};

/* ------------------------------------------------------------ frac-of-number */
const fracOfNumber: GeneratorFamily = {
  stageLabel: (s, st) =>
    ["Unit fraction of a number", "Any fraction of a number", "Larger numbers", "Find the whole", "In problems"][st - 1],
  generate(skill, stage, rng): RawQuestion {
    const d = rng.pick(stage >= 3 ? [3, 4, 5, 6, 8] : [2, 3, 4, 5]);
    const n = stage === 1 ? 1 : rng.int(1, d - 1);
    const unit = rng.int(2, stage >= 3 ? 12 : 8);
    const whole = d * unit;
    const part = n * unit;
    if (stage === 4) {
      return inputQ({
        instruction: "Find the whole amount.",
        prompt: `{${n}/${d}} of a number is ${part}. What is the number?`,
        answer: String(whole),
        hint: `First find {1/${d}} of the number: divide ${part} by ${n}.`,
        steps: [
          `{1/${d}} of the number = ${part} ÷ ${n} = ${unit}.`,
          `The whole is ${unit} × ${d} = ${whole}.`,
        ],
        concept: "Work back from the part to one share, then to the whole.",
        verify: () => (whole * n) / d === part,
      });
    }
    if (stage === 5) {
      const name = pickName(rng);
      return inputQ({
        instruction: "Solve the problem.",
        prompt: `${name} had $${whole} and spent {${n}/${d}} of it. How much money did ${name} spend?`,
        answer: String(part),
        hint: `Find {1/${d}} of ${whole} first.`,
        steps: [
          `{1/${d}} of ${whole} = ${whole} ÷ ${d} = ${unit}.`,
          `{${n}/${d}} = ${n} × ${unit} = $${part}.`,
        ],
        concept: "A fraction of an amount: divide by the bottom, multiply by the top.",
        representation: "word",
        verify: () => (whole * n) / d === part,
      });
    }
    return inputQ({
      instruction: "Find the fraction of the number.",
      prompt: `{${n}/${d}} of ${whole} = ?`,
      answer: String(part),
      hint: `Divide ${whole} by ${d}, then multiply by ${n}.`,
      steps: [
        `${whole} ÷ ${d} = ${unit}.`,
        ...(n > 1 ? [`${unit} × ${n} = ${part}.`] : []),
      ],
      concept: "Divide by the denominator, multiply by the numerator.",
      verify: () => (whole * n) / d === part,
    });
  },
};

/* --------------------------------------------------------- mixed-number-ops */
const mixedNumberOps: GeneratorFamily = {
  stageLabel: (s, st) =>
    ["Convert improper & mixed", "Add without regrouping", "Add with regrouping", "Subtract with regrouping", "All operations"][st - 1],
  generate(skill, stage, rng): RawQuestion {
    const d = rng.pick([2, 3, 4, 5, 6, 8]);
    if (stage === 1) {
      const toMixed = rng.chance(0.5);
      const whole = rng.int(1, 3);
      const n = rng.int(1, d - 1);
      const improper = whole * d + n;
      if (toMixed) {
        return inputQ({
          instruction: "Write as a mixed number.",
          prompt: `{${improper}/${d}}`,
          answer: ansMixed({ n: improper, d }),
          answerFormat: "fraction",
          answerHint: "e.g. 2 3/4",
          hint: `How many times does ${d} go into ${improper}?`,
          steps: [`${improper} ÷ ${d} = ${whole} remainder ${n}.`, `{${improper}/${d}} = ${fmtMixed({ n: improper, d })}.`],
          concept: "Improper fractions convert to a whole plus a fraction.",
          verify: () => whole * d + n === improper,
        });
      }
      return inputQ({
        instruction: "Write as an improper fraction.",
        prompt: `${whole} {${n}/${d}}`,
        answer: `${improper}/${d}`,
        answerFormat: "fraction",
        hint: `Multiply ${whole} × ${d}, then add ${n}.`,
        steps: [`${whole} × ${d} = ${whole * d}.`, `${whole * d} + ${n} = ${improper}, so the fraction is {${improper}/${d}}.`],
        concept: "Wholes hide extra parts inside them.",
        verify: () => whole * d + n === improper,
      });
    }
    const op = stage === 4 ? "sub" : stage === 5 ? rng.pick(["add", "sub", "mul"] as const) : "add";
    let a: Frac = { n: rng.int(1, 3) * d + rng.int(1, d - 1), d };
    let b: Frac = { n: rng.int(0, 1) * d + rng.int(1, d - 1), d };
    if (stage === 2) {
      // No regrouping: fractional parts sum below 1.
      const fa = rng.int(1, d - 2);
      const fb = rng.int(1, d - 1 - fa);
      a = { n: rng.int(1, 3) * d + fa, d };
      b = { n: rng.int(1, 2) * d + fb, d };
    }
    if (stage === 3) {
      // Force regrouping on add.
      const fa = rng.int(Math.ceil(d / 2), d - 1);
      const fb = rng.int(d - fa, d - 1);
      a = { n: rng.int(1, 2) * d + fa, d };
      b = { n: rng.int(1, 2) * d + fb, d };
    }
    if (op === "sub") {
      // Force borrow: smaller fractional part on top.
      const fa = rng.int(1, Math.max(1, Math.floor(d / 2) - 1));
      const fb = rng.int(Math.min(fa + 1, d - 1), d - 1);
      a = { n: rng.int(2, 3) * d + fa, d };
      b = { n: 1 * d + fb, d };
    }
    const result = op === "add" ? fracAdd(a, b) : op === "sub" ? fracSub(a, b) : fracMul(a, b);
    const opSym = op === "add" ? "+" : op === "sub" ? "−" : "×";
    return inputQ({
      instruction: `${op === "add" ? "Add" : op === "sub" ? "Subtract" : "Multiply"} the mixed numbers. Give your answer in simplest form.`,
      prompt: `${fmtMixed(a)} ${opSym} ${fmtMixed(b)} = ?`,
      answer: ansMixed(result),
      accept: [ansFrac(result)],
      answerFormat: "fraction",
      answerHint: "e.g. 2 3/4",
      hint:
        op === "mul"
          ? "Convert both to improper fractions before multiplying."
          : `Work with the wholes and the fraction parts${stage >= 3 ? " — you will need to regroup" : ""}.`,
      steps: [
        `Convert: ${fmtMixed(a)} = {${a.n}/${d}} and ${fmtMixed(b)} = {${b.n}/${d}}.`,
        op === "mul"
          ? `Multiply: {${a.n * b.n}/${d * d}}.`
          : `${op === "add" ? "Add" : "Subtract"}: {${a.n}/${d}} ${opSym} {${b.n}/${d}} = {${op === "add" ? a.n + b.n : a.n - b.n}/${d}}.`,
        `Simplify: ${fmtMixed(result)}.`,
      ],
      concept: "Improper fractions make mixed-number arithmetic mechanical.",
      verify: () =>
        op === "add"
          ? fracEq({ n: a.n + b.n, d }, result)
          : op === "sub"
            ? fracEq({ n: a.n - b.n, d }, result)
            : fracEq({ n: a.n * b.n, d: d * d }, result),
    });
  },
};

export const fractionFamilies = {
  "frac-identify": fracIdentify,
  "frac-equivalent": fracEquivalent,
  "frac-simplify": fracSimplify,
  "frac-compare": fracCompare,
  "frac-number-line": fracNumberLine,
  "frac-add-sub": fracAddSub,
  "frac-mul": fracMulFam,
  "frac-div": fracDivFam,
  "frac-of-number": fracOfNumber,
  "mixed-number-ops": mixedNumberOps,
} satisfies Record<string, GeneratorFamily>;
