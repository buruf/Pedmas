import type { GeneratorFamily, RawQuestion, Rng } from "../types";
import { inputQ, mcQ, mcChoices, pickName } from "./helpers";
import { simplify, ansFrac } from "../num";

const str = (p: Record<string, unknown>, key: string, dflt: string): string =>
  typeof p[key] === "string" ? (p[key] as string) : dflt;

const strArr = (p: Record<string, unknown>, key: string, dflt: string[]): string[] =>
  Array.isArray(p[key]) && (p[key] as unknown[]).every((v) => typeof v === "string")
    ? (p[key] as string[])
    : dflt;

/** Canonical fraction answer plus generous accepted equivalents. */
function fracQ(n: number, d: number): { ans: string; accept: string[] } {
  const s = simplify({ n, d });
  const accept = new Set<string>([`${n}/${d}`, ansFrac(s)]);
  const dec = s.n / s.d;
  if (Number.isInteger(dec * 10000)) accept.add(String(dec));
  return { ans: ansFrac(s), accept: [...accept] };
}

/* ---------------------------------------------------------------- datasets */
interface CategorySet {
  title: string;
  labels: string[];
  icon: string;
  noun: string;
}
const CATEGORY_SETS: CategorySet[] = [
  { title: "Favourite Fruit", labels: ["Apples", "Bananas", "Cherries", "Grapes"], icon: "🍎", noun: "students" },
  { title: "Pets We Own", labels: ["Dogs", "Cats", "Fish", "Birds"], icon: "🐾", noun: "students" },
  { title: "Books Read", labels: ["Mon", "Tue", "Wed", "Thu"], icon: "📗", noun: "books" },
  { title: "Sports Played", labels: ["Soccer", "Hockey", "Tennis", "Running"], icon: "⭐", noun: "students" },
];

const bars = (n: number) => "█".repeat(n);

/* ------------------------------------------------------------- read-graph */
/**
 * `type` selects picture | bar | line-plot | table | mixed. Climb:
 * read one value -> compare two -> total -> read a scaled key -> multi-step.
 */
function renderCounts(type: string, set: CategorySet, labels: string[], symbols: number[]): string {
  if (type === "table") {
    return [`${set.title}`, "Item | Number", ...labels.map((l, i) => `${l} | ${symbols[i]}`)].join("\n");
  }
  const sym = type === "picture" ? set.icon : "█";
  return [`${set.title}`, ...labels.map((l, i) => `${l}: ${sym.repeat(symbols[i])}`)].join("\n");
}

function linePlotQuestion(stage: number, rng: Rng): RawQuestion {
  const values = [1, 2, 3, 4, 5];
  const counts = values.map(() => rng.int(0, 4));
  if (counts.reduce((a, b) => a + b, 0) < 6) counts[rng.int(0, 4)] += 5;
  const block = ["Goals Scored", ...values.map((v, i) => `${v}: ${"X".repeat(counts[i])}`)].join("\n");
  const total = counts.reduce((a, b) => a + b, 0);
  const present = values.filter((_, i) => counts[i] > 0);

  if (stage === 1) {
    const idx = rng.pick(values.map((_, i) => i).filter((i) => counts[i] > 0));
    return inputQ({
      instruction: `How many players scored ${values[idx]} goals?`,
      prompt: block,
      answer: String(counts[idx]),
      hint: "Count the X marks in that row.",
      steps: [`The row for ${values[idx]} has ${counts[idx]} X marks.`, `So ${counts[idx]} players scored ${values[idx]}.`],
      concept: "Each X on a line plot stands for one item of data.",
      representation: "line-plot",
      verify: () => counts[idx] === counts[idx],
    });
  }
  if (stage === 2) {
    return inputQ({
      instruction: "How many players are shown altogether?",
      prompt: block,
      answer: String(total),
      hint: "Count every X mark in the whole plot.",
      steps: [
        `Row counts: ${counts.join(" + ")}.`,
        `${counts.join(" + ")} = ${total} players.`,
      ],
      concept: "The total number of X marks is the size of the data set.",
      representation: "line-plot",
      verify: () => counts.reduce((a, b) => a + b, 0) === total,
    });
  }
  if (stage === 3) {
    const maxC = Math.max(...counts);
    const answer = String(values[counts.indexOf(maxC)]);
    return mcQ({
      instruction: "Which score appears most often?",
      prompt: block,
      choices: mcChoices(rng, answer, values.filter((v) => String(v) !== answer).map(String)),
      answer,
      hint: "Look for the tallest stack of X marks.",
      steps: [`The tallest column has ${maxC} X marks.`, `That column is the score ${answer}.`],
      concept: "The value appearing most often is the mode.",
      representation: "line-plot",
      verify: () => counts[values.indexOf(Number(answer))] === maxC,
    });
  }
  if (stage === 4) {
    const hi = Math.max(...present);
    const lo = Math.min(...present);
    return inputQ({
      instruction: "What is the range of the scores?",
      prompt: block,
      answer: String(hi - lo),
      hint: "Range means the highest value minus the lowest value that actually appears.",
      steps: [`The highest score with an X is ${hi}.`, `The lowest is ${lo}.`, `${hi} − ${lo} = ${hi - lo}.`],
      concept: "Range measures how spread out the data is.",
      representation: "line-plot",
      verify: () => lo + (hi - lo) === hi,
    });
  }
  const cut = rng.pick(present.filter((v) => v < Math.max(...present)) ?? [1]);
  const more = values.reduce((acc, v, i) => (v > cut ? acc + counts[i] : acc), 0);
  return inputQ({
    instruction: `How many players scored more than ${cut} goals?`,
    prompt: block,
    answer: String(more),
    hint: `Add the X marks in every row above ${cut}.`,
    steps: [
      `Rows above ${cut}: ${values.filter((v) => v > cut).join(", ")}.`,
      `Their counts add to ${more}.`,
    ],
    concept: "Reading a plot often means combining several rows.",
    representation: "line-plot",
    verify: () => more === values.reduce((acc, v, i) => (v > cut ? acc + counts[i] : acc), 0),
  });
}

const readGraph: GeneratorFamily = {
  stageLabel: (s, st) =>
    ["Read one value", "Compare two", "Find the total", "Graphs with a key", "Multi-step reading"][st - 1],
  generate(skill, stage, rng): RawQuestion {
    let type = str(skill.params, "type", "bar");
    if (type === "mixed") type = rng.pick(["bar", "picture", "table", "line-plot"]);
    if (type === "line-plot") return linePlotQuestion(stage, rng);

    const set = rng.pick(CATEGORY_SETS);
    const labels = set.labels;
    const scale = stage >= 4 ? rng.pick([2, 5]) : 1;
    const symbols = labels.map(() => rng.int(1, 8));
    const values = symbols.map((s) => s * scale);
    const keyLine = scale > 1 ? `\nKey: each symbol = ${scale} ${set.noun}` : "";
    const block = renderCounts(type, set, labels, type === "table" ? values : symbols) + keyLine;

    if (stage === 1) {
      const i = rng.int(0, labels.length - 1);
      return inputQ({
        instruction: `How many ${set.noun} for ${labels[i]}?`,
        prompt: block,
        answer: String(values[i]),
        hint: type === "table" ? "Find the row and read its number." : "Count the symbols in that row.",
        steps: [`Find the ${labels[i]} row.`, `It shows ${values[i]} ${set.noun}.`],
        concept: "Each row of a graph shows the amount for one category.",
        representation: type,
        verify: () => values[i] === symbols[i] * scale,
      });
    }
    if (stage === 2) {
      const [i, j] = rng.sample([0, 1, 2, 3].slice(0, labels.length), 2);
      const hi = values[i] >= values[j] ? i : j;
      const lo = hi === i ? j : i;
      return inputQ({
        instruction: `How many more ${set.noun} for ${labels[hi]} than ${labels[lo]}?`,
        prompt: block,
        answer: String(values[hi] - values[lo]),
        hint: "Read both amounts, then subtract.",
        steps: [
          `${labels[hi]} has ${values[hi]} and ${labels[lo]} has ${values[lo]}.`,
          `${values[hi]} − ${values[lo]} = ${values[hi] - values[lo]}.`,
        ],
        concept: "Comparing categories means subtracting their amounts.",
        representation: type,
        verify: () => values[lo] + (values[hi] - values[lo]) === values[hi],
      });
    }
    if (stage === 3) {
      const total = values.reduce((a, b) => a + b, 0);
      return inputQ({
        instruction: `How many ${set.noun} altogether?`,
        prompt: block,
        answer: String(total),
        hint: "Add every category.",
        steps: [`${values.join(" + ")} = ${total}.`],
        concept: "The total is the sum of every category in the graph.",
        representation: type,
        verify: () => values.reduce((a, b) => a + b, 0) === total,
      });
    }
    if (stage === 4) {
      const i = rng.int(0, labels.length - 1);
      return inputQ({
        instruction: `How many ${set.noun} for ${labels[i]}?`,
        prompt: block,
        answer: String(values[i]),
        hint: `Each symbol stands for ${scale}, so multiply the number of symbols by ${scale}.`,
        steps: [
          `${labels[i]} shows ${symbols[i]} symbols.`,
          `Each symbol is worth ${scale}, so ${symbols[i]} × ${scale} = ${values[i]}.`,
        ],
        concept: "With a key, multiply the symbols by the value of one symbol.",
        representation: type,
        verify: () => symbols[i] * scale === values[i],
      });
    }
    const maxV = Math.max(...values);
    const minV = Math.min(...values);
    const answer = labels[values.indexOf(maxV)];
    return mcQ({
      instruction: `Which category is ${maxV - minV} more than the smallest?`,
      prompt: block,
      choices: mcChoices(rng, answer, labels.filter((l) => l !== answer)),
      answer,
      hint: "Find the smallest amount first, then look for the one that is that much bigger.",
      steps: [
        `The smallest amount is ${minV}.`,
        `${minV} + ${maxV - minV} = ${maxV}.`,
        `The category showing ${maxV} is ${answer}.`,
      ],
      concept: "Multi-step questions combine reading with calculating.",
      representation: type,
      verify: () => values[labels.indexOf(answer)] - minV === maxV - minV,
    });
  },
};

/* -------------------------------------------------------- central-tendency */
function dataWithMean(rng: Rng, n: number, lo: number, hi: number): { data: number[]; mean: number } {
  for (let t = 0; t < 200; t++) {
    const m = rng.int(lo + 1, hi - 1);
    const head = Array.from({ length: n - 1 }, () => rng.int(lo, hi));
    const last = n * m - head.reduce((a, b) => a + b, 0);
    if (last >= lo && last <= hi) return { data: rng.shuffle([...head, last]), mean: m };
  }
  const m = rng.int(lo, hi);
  return { data: Array(n).fill(m), mean: m };
}

function uniqueModeData(rng: Rng, n: number, lo: number, hi: number): { data: number[]; mode: number } {
  const mode = rng.int(lo, hi);
  const others = [lo, hi, ...Array.from({ length: 6 }, () => rng.int(lo, hi))].filter((v) => v !== mode);
  const data = [mode, mode, mode];
  const pool = rng.shuffle([...new Set(others)]);
  for (let i = 0; i < n - 3 && i < pool.length; i++) data.push(pool[i]);
  while (data.length < n) data.push(mode === hi ? lo : hi);
  return { data: rng.shuffle(data), mode };
}

const centralTendency: GeneratorFamily = {
  stageLabel: (s, st) =>
    ["Small data sets", "Bigger numbers", "From a display", "Work backwards", "In problems"][st - 1],
  generate(skill, stage, rng): RawQuestion {
    const stat = rng.pick(strArr(skill.params, "stats", ["mean"]));
    const n = stage === 1 ? 4 : stage === 2 ? rng.pick([5, 6]) : 5;
    const lo = stage <= 1 ? 1 : 2;
    const hi = stage === 1 ? 10 : stage === 2 ? 30 : 20;

    if (stat === "mean") {
      if (stage === 4) {
        const { data, mean } = dataWithMean(rng, 5, 2, 20);
        const hidden = data[4];
        const shown = data.slice(0, 4);
        return inputQ({
          instruction: "Find the missing value.",
          prompt: `Four of the five numbers are ${shown.join(", ")}.\nThe mean of all five numbers is ${mean}.\nWhat is the missing number?`,
          answer: String(hidden),
          hint: `The five numbers must total 5 × ${mean}.`,
          steps: [
            `Total needed: 5 × ${mean} = ${5 * mean}.`,
            `The four shown numbers total ${shown.reduce((a, b) => a + b, 0)}.`,
            `${5 * mean} − ${shown.reduce((a, b) => a + b, 0)} = ${hidden}.`,
          ],
          concept: "Mean × count gives the total, so a missing value can be recovered.",
          verify: () => (shown.reduce((a, b) => a + b, 0) + hidden) / 5 === mean,
        });
      }
      const { data, mean } = dataWithMean(rng, n, lo, hi);
      const sum = data.reduce((a, b) => a + b, 0);
      const isDisplay = stage === 3;
      return inputQ({
        instruction: "Find the mean.",
        prompt: isDisplay
          ? `Scores\n${data.map((d, i) => `Round ${i + 1}: ${d}`).join("\n")}`
          : data.join(", "),
        answer: String(mean),
        hint: "Add all the values, then divide by how many there are.",
        steps: [
          `Add: ${data.join(" + ")} = ${sum}.`,
          `There are ${data.length} values.`,
          `${sum} ÷ ${data.length} = ${mean}.`,
        ],
        concept: "The mean shares the total equally among all the values.",
        verify: () => sum === mean * data.length,
      });
    }

    if (stat === "median") {
      const count = stage === 4 ? 6 : 5;
      const data = rng.shuffle(Array.from({ length: count }, () => rng.int(lo, hi)));
      const sorted = [...data].sort((a, b) => a - b);
      const med =
        count % 2 === 1
          ? sorted[(count - 1) / 2]
          : (sorted[count / 2 - 1] + sorted[count / 2]) / 2;
      const isHalf = !Number.isInteger(med);
      return inputQ({
        instruction: "Find the median.",
        prompt: stage === 3 ? `Scores\n${data.map((d, i) => `Round ${i + 1}: ${d}`).join("\n")}` : data.join(", "),
        answer: String(med),
        answerFormat: isHalf ? "decimal" : "integer",
        hint: "Put the numbers in order first, then find the middle.",
        steps: [
          `In order: ${sorted.join(", ")}.`,
          count % 2 === 1
            ? `With ${count} values the middle one is ${med}.`
            : `With ${count} values there are two middles, ${sorted[count / 2 - 1]} and ${sorted[count / 2]}.`,
          count % 2 === 1
            ? "The median is that middle value."
            : `Their mean is ${med}, so that is the median.`,
        ],
        concept: "The median is the middle value once the data is ordered.",
        verify: () =>
          count % 2 === 1
            ? sorted.filter((v) => v < med).length <= (count - 1) / 2
            : (sorted[count / 2 - 1] + sorted[count / 2]) / 2 === med,
      });
    }

    if (stat === "mode") {
      const { data, mode } = uniqueModeData(rng, stage === 1 ? 5 : 7, lo, hi);
      const counts = new Map<number, number>();
      data.forEach((v) => counts.set(v, (counts.get(v) ?? 0) + 1));
      if (stage === 4) {
        const others = [...new Set(data)].filter((v) => v !== mode).map(String);
        return mcQ({
          instruction: "Which value is the mode?",
          prompt: data.join(", "),
          choices: mcChoices(rng, String(mode), others),
          answer: String(mode),
          hint: "The mode is the value that appears most often.",
          steps: [
            `${mode} appears ${counts.get(mode)} times.`,
            "No other value appears that often.",
            `So the mode is ${mode}.`,
          ],
          concept: "The mode is the most frequent value.",
          verify: () => Math.max(...[...counts.values()]) === counts.get(mode),
        });
      }
      return inputQ({
        instruction: "Find the mode.",
        prompt: stage === 3 ? `Scores\n${data.map((d, i) => `Round ${i + 1}: ${d}`).join("\n")}` : data.join(", "),
        answer: String(mode),
        hint: "Look for the value that repeats most.",
        steps: [`${mode} appears ${counts.get(mode)} times, more than any other value.`, `So the mode is ${mode}.`],
        concept: "The mode is the value that occurs most often.",
        verify: () => Math.max(...[...counts.values()]) === counts.get(mode),
      });
    }

    // range
    if (stage === 4) {
      const lowest = rng.int(2, 12);
      const range = rng.int(5, 20);
      const highest = lowest + range;
      return inputQ({
        instruction: "Find the missing value.",
        prompt: `A data set has a lowest value of ${lowest} and a range of ${range}.\nWhat is the highest value?`,
        answer: String(highest),
        hint: "Range is highest minus lowest, so add the range to the lowest.",
        steps: [`Range = highest − lowest.`, `${lowest} + ${range} = ${highest}.`],
        concept: "Knowing the range and one end gives you the other end.",
        verify: () => highest - lowest === range,
      });
    }
    const data = Array.from({ length: n }, () => rng.int(lo, hi));
    const hiV = Math.max(...data);
    const loV = Math.min(...data);
    return inputQ({
      instruction: "Find the range.",
      prompt: stage === 3 ? `Scores\n${data.map((d, i) => `Round ${i + 1}: ${d}`).join("\n")}` : data.join(", "),
      answer: String(hiV - loV),
      hint: "Subtract the smallest value from the largest.",
      steps: [`The largest value is ${hiV} and the smallest is ${loV}.`, `${hiV} − ${loV} = ${hiV - loV}.`],
      concept: "Range describes how spread out a data set is.",
      verify: () => loV + (hiV - loV) === hiV,
    });
  },
};

/* ------------------------------------------------------------- probability */
const COLOURS = ["red", "blue", "green", "yellow"] as const;

function simpleProbability(stage: number, rng: Rng): RawQuestion {
  if (stage === 1) {
    const sides = rng.pick([6, 8, 10]);
    const target = rng.int(1, sides);
    const q = fracQ(1, sides);
    return inputQ({
      instruction: "Find the probability. Give your answer as a fraction in simplest form.",
      prompt: `A fair ${sides}-sided die is rolled.\nWhat is the probability of rolling a ${target}?`,
      answer: q.ans,
      accept: q.accept,
      answerFormat: "fraction",
      answerHint: "a fraction like 1/6",
      hint: "Probability is favourable outcomes over total outcomes.",
      steps: [
        `There is 1 way to roll a ${target}.`,
        `There are ${sides} equally likely outcomes.`,
        `So the probability is ${q.ans}.`,
      ],
      concept: "Probability compares the wanted outcomes with all possible outcomes.",
      verify: () => sides > 0 && 1 <= sides,
    });
  }
  if (stage === 2) {
    const r = rng.int(2, 6);
    const b = rng.int(2, 6);
    const g = rng.int(1, 4);
    const total = r + b + g;
    const q = fracQ(r, total);
    return inputQ({
      instruction: "Find the probability. Give your answer as a fraction in simplest form.",
      prompt: `A bag holds ${r} red, ${b} blue and ${g} green marbles.\nOne marble is drawn at random. What is the probability it is red?`,
      answer: q.ans,
      accept: q.accept,
      answerFormat: "fraction",
      answerHint: "a fraction like 2/5",
      hint: "Count the red marbles, then the total number of marbles.",
      steps: [
        `Red marbles: ${r}.`,
        `Total marbles: ${r} + ${b} + ${g} = ${total}.`,
        `Probability = ${r}/${total} = ${q.ans}.`,
      ],
      concept: "Every marble is equally likely, so probability is a simple ratio.",
      verify: () => r + b + g === total,
    });
  }
  if (stage === 3) {
    const r = rng.int(2, 6);
    const other = rng.int(3, 8);
    const total = r + other;
    const q = fracQ(other, total);
    return inputQ({
      instruction: "Find the probability. Give your answer as a fraction in simplest form.",
      prompt: `A bag holds ${r} red counters and ${other} counters that are not red.\nWhat is the probability of drawing a counter that is NOT red?`,
      answer: q.ans,
      accept: q.accept,
      answerFormat: "fraction",
      answerHint: "a fraction like 3/5",
      hint: "The complement is everything that is not the event.",
      steps: [
        `Not-red counters: ${other}.`,
        `Total counters: ${total}.`,
        `Probability = ${other}/${total} = ${q.ans}.`,
      ],
      concept: "The probabilities of an event and its complement add to 1.",
      verify: () => r + other === total,
    });
  }
  if (stage === 4) {
    const sides = 6;
    const OPTS = [
      { kind: "even", listed: "2, 4, 6" },
      { kind: "odd", listed: "1, 3, 5" },
      { kind: "greater than 4", listed: "5, 6" },
      { kind: "less than 3", listed: "1, 2" },
      { kind: "prime", listed: "2, 3, 5" },
      { kind: "a multiple of 3", listed: "3, 6" },
      { kind: "at most 2", listed: "1, 2" },
    ];
    const opt = rng.pick(OPTS);
    const kind = opt.kind;
    const listed = opt.listed;
    const fav = listed.split(", ").length;
    const q = fracQ(fav, sides);
    return inputQ({
      instruction: "Find the probability. Give your answer as a fraction in simplest form.",
      prompt: `A fair six-sided die is rolled.\nWhat is the probability of rolling a number that is ${kind}?`,
      answer: q.ans,
      accept: q.accept,
      answerFormat: "fraction",
      answerHint: "a fraction like 1/2",
      hint: "List the outcomes that work, then count them.",
      steps: [
        `Outcomes that are ${kind}: ${listed}.`,
        `That is ${fav} out of ${sides}.`,
        `Probability = ${q.ans}.`,
      ],
      concept: "When several outcomes count as a success, add them up first.",
      verify: () => listed.split(", ").length === fav,
    });
  }
  const name = pickName(rng);
  const win = rng.int(3, 8);
  const lose = rng.int(4, 12);
  const total = win + lose;
  const q = fracQ(win, total);
  return inputQ({
    instruction: "Find the probability. Give your answer as a fraction in simplest form.",
    prompt: `${name} has ${win} winning tickets among ${total} tickets in a box.\nOne ticket is chosen at random. What is the probability it wins?`,
    answer: q.ans,
    accept: q.accept,
    answerFormat: "fraction",
    answerHint: "a fraction like 3/8",
    hint: "Favourable outcomes over total outcomes.",
    steps: [`Winning tickets: ${win}.`, `Total tickets: ${total}.`, `Probability = ${win}/${total} = ${q.ans}.`],
    concept: "Real situations use the same favourable-over-total rule.",
    verify: () => win + lose === total,
  });
}

function compoundProbability(stage: number, rng: Rng): RawQuestion {
  if (stage === 1) {
    const want = rng.pick(["heads", "tails"] as const);
    const other = want === "heads" ? "tails" : "heads";
    const both = rng.chance(0.5);
    const q = fracQ(both ? 1 : 2, 4);
    return inputQ({
      instruction: "Find the probability. Give your answer as a fraction in simplest form.",
      prompt: both
        ? `Two fair coins are tossed.\nWhat is the probability that both land ${want}?`
        : `Two fair coins are tossed.\nWhat is the probability of one ${want} and one ${other}?`,
      answer: q.ans,
      accept: q.accept,
      answerFormat: "fraction",
      answerHint: "a fraction like 1/4",
      hint: both
        ? "Multiply the probability of each independent event."
        : "List all four equally likely outcomes and count the ones that work.",
      steps: both
        ? [
            `P of ${want} on one coin is 1/2.`,
            "The coins do not affect each other, so multiply.",
            `1/2 × 1/2 = ${q.ans}.`,
          ]
        : [
            "The four equally likely outcomes are HH, HT, TH and TT.",
            "Two of them have one of each.",
            `Probability = 2/4 = ${q.ans}.`,
          ],
      concept: both
        ? "For independent events, multiply the separate probabilities."
        : "Listing every outcome shows which ones count as a success.",
      verify: () => (both ? 1 : 2) <= 4,
    });
  }
  if (stage === 2) {
    const face = rng.int(1, 6);
    const q = fracQ(1, 12);
    return inputQ({
      instruction: "Find the probability. Give your answer as a fraction in simplest form.",
      prompt: `A fair coin is tossed and a fair six-sided die is rolled.\nWhat is the probability of heads and a ${face}?`,
      answer: q.ans,
      accept: q.accept,
      answerFormat: "fraction",
      answerHint: "a fraction like 1/12",
      hint: "Multiply the two independent probabilities.",
      steps: ["P of heads is 1/2.", `P of rolling a ${face} is 1/6.`, "1/2 × 1/6 = 1/12."],
      concept: "Independent events combine by multiplication.",
      verify: () => Math.abs((1 / 2) * (1 / 6) - 1 / 12) < 1e-12,
    });
  }
  if (stage === 3) {
    const r = rng.int(2, 5);
    const other = rng.int(3, 7);
    const total = r + other;
    const q = fracQ(r * r, total * total);
    return inputQ({
      instruction: "Find the probability. Give your answer as a fraction in simplest form.",
      prompt: `A bag holds ${r} red and ${other} blue counters.\nA counter is drawn, replaced, then a second is drawn.\nWhat is the probability both are red?`,
      answer: q.ans,
      accept: q.accept,
      answerFormat: "fraction",
      answerHint: "a fraction like 4/25",
      hint: "With replacement the second draw has the same probability as the first.",
      steps: [
        `P of red on one draw is ${r}/${total}.`,
        "Because the counter is replaced, the draws are independent.",
        `${r}/${total} × ${r}/${total} = ${q.ans}.`,
      ],
      concept: "Replacing the item keeps the two draws independent.",
      verify: () => r * r <= total * total,
    });
  }
  if (stage === 4) {
    const r = rng.int(3, 6);
    const other = rng.int(3, 7);
    const total = r + other;
    const q = fracQ(r * (r - 1), total * (total - 1));
    return inputQ({
      instruction: "Find the probability. Give your answer as a fraction in simplest form.",
      prompt: `A bag holds ${r} red and ${other} blue counters.\nTwo counters are drawn without replacement.\nWhat is the probability both are red?`,
      answer: q.ans,
      accept: q.accept,
      answerFormat: "fraction",
      answerHint: "a fraction like 1/6",
      hint: "After the first red is taken, both counts go down by one.",
      steps: [
        `First draw: ${r}/${total}.`,
        `Second draw: ${r - 1}/${total - 1} because one red has gone.`,
        `${r}/${total} × ${r - 1}/${total - 1} = ${q.ans}.`,
      ],
      concept: "Without replacement, the second probability depends on the first draw.",
      verify: () => r - 1 >= 0 && total - 1 > 0,
    });
  }
  const n = rng.pick([2, 3, 4]);
  const face = rng.pick(["head", "tail"] as const);
  const q = fracQ(Math.pow(2, n) - 1, Math.pow(2, n));
  return inputQ({
    instruction: "Find the probability. Give your answer as a fraction in simplest form.",
    prompt: `${n} fair coins are tossed.\nWhat is the probability of getting at least one ${face}?`,
    answer: q.ans,
    accept: q.accept,
    answerFormat: "fraction",
    answerHint: "a fraction like 3/4",
    hint: `It is easier to work out the chance of no ${face}s at all first.`,
    steps: [
      `P of every coin being the other face is 1/2 multiplied ${n} times = 1/${Math.pow(2, n)}.`,
      `At least one ${face} is the complement of that.`,
      `1 − 1/${Math.pow(2, n)} = ${q.ans}.`,
    ],
    concept: "For 'at least one', subtract the probability of none from 1.",
    verify: () => Math.pow(2, n) - 1 + 1 === Math.pow(2, n),
  });
}

function conditionalProbability(stage: number, rng: Rng): RawQuestion {
  const a1 = rng.int(6, 14);
  const a2 = rng.int(4, 12);
  const b1 = rng.int(5, 12);
  const b2 = rng.int(4, 12);
  const rowA = a1 + a2;
  const rowB = b1 + b2;
  const colBus = a1 + b1;
  const total = rowA + rowB;
  const table = [
    "        | Bus | Walk | Total",
    `Grade 7 | ${a1} | ${a2} | ${rowA}`,
    `Grade 8 | ${b1} | ${b2} | ${rowB}`,
    `Total   | ${colBus} | ${a2 + b2} | ${total}`,
  ].join("\n");

  if (stage === 1 || stage === 5) {
    const q = fracQ(a1, rowA);
    return inputQ({
      instruction: "Find the probability. Give your answer as a fraction in simplest form.",
      prompt: `${table}\n\nA Grade 7 student is chosen at random.\nWhat is the probability that they take the bus?`,
      answer: q.ans,
      accept: q.accept,
      answerFormat: "fraction",
      answerHint: "a fraction like 3/5",
      hint: "You are only looking inside the Grade 7 row.",
      steps: [
        `Grade 7 students who take the bus: ${a1}.`,
        `All Grade 7 students: ${rowA}.`,
        `Probability = ${a1}/${rowA} = ${q.ans}.`,
      ],
      concept: "A condition restricts you to one row or column of the table.",
      verify: () => a1 + a2 === rowA,
    });
  }
  if (stage === 2) {
    const q = fracQ(a1, colBus);
    return inputQ({
      instruction: "Find the probability. Give your answer as a fraction in simplest form.",
      prompt: `${table}\n\nA student who takes the bus is chosen at random.\nWhat is the probability that they are in Grade 7?`,
      answer: q.ans,
      accept: q.accept,
      answerFormat: "fraction",
      answerHint: "a fraction like 4/7",
      hint: "This time the condition restricts you to the Bus column.",
      steps: [
        `Bus riders in Grade 7: ${a1}.`,
        `All bus riders: ${colBus}.`,
        `Probability = ${a1}/${colBus} = ${q.ans}.`,
      ],
      concept: "Swapping the condition changes which total you divide by.",
      verify: () => a1 + b1 === colBus,
    });
  }
  if (stage === 3) {
    const q = fracQ(a2, rowA);
    return inputQ({
      instruction: "Find the probability. Give your answer as a fraction in simplest form.",
      prompt: `${table}\n\nA Grade 7 student is chosen at random.\nWhat is the probability that they do NOT take the bus?`,
      answer: q.ans,
      accept: q.accept,
      answerFormat: "fraction",
      answerHint: "a fraction like 2/5",
      hint: "Within Grade 7, the students who walk are the ones who do not take the bus.",
      steps: [
        `Grade 7 students who walk: ${a2}.`,
        `All Grade 7 students: ${rowA}.`,
        `Probability = ${a2}/${rowA} = ${q.ans}.`,
      ],
      concept: "Conditional complements still use the restricted total.",
      verify: () => a1 + a2 === rowA,
    });
  }
  const answer = "No, the probabilities are different";
  return mcQ({
    instruction: "Are taking the bus and being in Grade 7 independent?",
    prompt: `${table}\n\nCompare the probability of taking the bus for Grade 7 students with the probability for all students.`,
    choices: mcChoices(rng, answer, [
      "Yes, the probabilities are the same",
      "There is not enough information",
      "Yes, because every student is counted once",
    ]),
    answer,
    hint: "Independent means the condition does not change the probability.",
    steps: [
      `P of bus given Grade 7 is ${a1}/${rowA}.`,
      `P of bus overall is ${colBus}/${total}.`,
      "These are not equal, so knowing the grade changes the probability.",
    ],
    concept: "Events are independent only when the condition leaves the probability unchanged.",
    verify: () => a1 * total !== colBus * rowA,
  });
}

const fact = (n: number): number => (n <= 1 ? 1 : n * fact(n - 1));
const nCr = (n: number, r: number): number => Math.round(fact(n) / (fact(r) * fact(n - r)));
const nPr = (n: number, r: number): number => Math.round(fact(n) / fact(n - r));

function binomialProbability(stage: number, rng: Rng): RawQuestion {
  if (stage <= 2) {
    const n = stage === 1 ? rng.pick([3, 4]) : rng.pick([5, 6]);
    const k = rng.int(1, n - 1);
    const ways = nCr(n, k);
    const q = fracQ(ways, Math.pow(2, n));
    return inputQ({
      instruction: "Find the probability. Give your answer as a fraction in simplest form.",
      prompt: `${n} fair coins are tossed.\nWhat is the probability of getting exactly ${k} head${k === 1 ? "" : "s"}?`,
      answer: q.ans,
      accept: q.accept,
      answerFormat: "fraction",
      answerHint: "a fraction like 3/8",
      hint: `Count the arrangements with ${k} heads, then divide by all ${Math.pow(2, n)} outcomes.`,
      steps: [
        `Ways to choose which ${k} of the ${n} coins are heads: ${ways}.`,
        `Total possible outcomes: 2^${n} = ${Math.pow(2, n)}.`,
        `Probability = ${ways}/${Math.pow(2, n)} = ${q.ans}.`,
      ],
      concept: "Binomial probability counts arrangements over all outcomes.",
      verify: () => nCr(n, k) === nCr(n, n - k),
    });
  }
  if (stage === 3) {
    const n = rng.pick([4, 5, 6]);
    const k = rng.int(2, n - 1);
    const ways = Array.from({ length: n - k + 1 }, (_, i) => nCr(n, k + i)).reduce((a, b) => a + b, 0);
    const q = fracQ(ways, Math.pow(2, n));
    return inputQ({
      instruction: "Find the probability. Give your answer as a fraction in simplest form.",
      prompt: `${n} fair coins are tossed.\nWhat is the probability of getting at least ${k} heads?`,
      answer: q.ans,
      accept: q.accept,
      answerFormat: "fraction",
      answerHint: "a fraction like 5/16",
      hint: `Add the ways of getting ${k} heads, ${k + 1} heads, and so on.`,
      steps: [
        `Ways: ${Array.from({ length: n - k + 1 }, (_, i) => `C of ${n} choose ${k + i} = ${nCr(n, k + i)}`).join(", ")}.`,
        `Total favourable ways: ${ways}.`,
        `Probability = ${ways}/${Math.pow(2, n)} = ${q.ans}.`,
      ],
      concept: "'At least' means adding every case from that point upwards.",
      verify: () => ways <= Math.pow(2, n),
    });
  }
  if (stage === 4) {
    const sections = rng.pick([3, 4, 5]);
    const n = rng.pick([2, 3]);
    const k = rng.int(1, n);
    const ways = nCr(n, k);
    const num = ways * Math.pow(sections - 1, n - k);
    const q = fracQ(num, Math.pow(sections, n));
    return inputQ({
      instruction: "Find the probability. Give your answer as a fraction in simplest form.",
      prompt: `A spinner has ${sections} equal sections, one of which is red.\nThe spinner is spun ${n} times.\nWhat is the probability of landing on red exactly ${k} time${k === 1 ? "" : "s"}?`,
      answer: q.ans,
      accept: q.accept,
      answerFormat: "fraction",
      answerHint: "a fraction like 4/9",
      hint: `Each spin is red with probability 1/${sections} and not red with probability ${sections - 1}/${sections}.`,
      steps: [
        `Ways to choose which ${k} spin${k === 1 ? "" : "s"} land red: ${ways}.`,
        `Each such case has probability 1/${sections} used ${k} time${k === 1 ? "" : "s"} and ${sections - 1}/${sections} used ${n - k} time${n - k === 1 ? "" : "s"}.`,
        `Total = ${ways} × ${Math.pow(sections - 1, n - k)}/${Math.pow(sections, n)} = ${q.ans}.`,
      ],
      concept: "Binomial probability multiplies arrangements by each outcome's chance.",
      verify: () => num <= Math.pow(sections, n),
    });
  }
  const n = 4;
  const ways = nCr(n, 2);
  const q = fracQ(ways, Math.pow(2, n));
  const name = pickName(rng);
  return inputQ({
    instruction: "Find the probability. Give your answer as a fraction in simplest form.",
    prompt: `${name} guesses the answer to ${n} true-or-false questions.\nWhat is the probability of getting exactly 2 correct?`,
    answer: q.ans,
    accept: q.accept,
    answerFormat: "fraction",
    answerHint: "a fraction like 3/8",
    hint: "Each guess is correct with probability 1/2.",
    steps: [
      `Ways to choose which 2 of the ${n} are correct: ${ways}.`,
      `Total outcomes: 2^${n} = ${Math.pow(2, n)}.`,
      `Probability = ${ways}/${Math.pow(2, n)} = ${q.ans}.`,
    ],
    concept: "Guessing on true-or-false questions is a binomial experiment.",
    verify: () => nCr(n, 2) === ways,
  });
}

const probability: GeneratorFamily = {
  stageLabel: (s, st) => {
    const kind = typeof s.params.kind === "string" ? s.params.kind : "simple";
    if (kind === "compound")
      return ["Two coins", "Coin and die", "With replacement", "Without replacement", "At least one"][st - 1];
    if (kind === "conditional")
      return ["Read the table", "Swap the condition", "Conditional complement", "Test independence", "In problems"][st - 1];
    if (kind === "binomial")
      return ["Exactly k heads", "More coins", "At least k", "Other probabilities", "In problems"][st - 1];
    return ["One event", "From a bag", "Complements", "Several outcomes", "In problems"][st - 1];
  },
  generate(skill, stage, rng): RawQuestion {
    const kind = str(skill.params, "kind", "simple");
    if (kind === "compound") return compoundProbability(stage, rng);
    if (kind === "conditional") return conditionalProbability(stage, rng);
    if (kind === "binomial") return binomialProbability(stage, rng);
    return simpleProbability(stage, rng);
  },
};

/* ------------------------------------------------------- counting-principle */
const countingPrinciple: GeneratorFamily = {
  stageLabel: (s, st) => {
    const kind = typeof s.params.kind === "string" ? s.params.kind : "fcp";
    if (kind === "permutation")
      return ["Arrange all", "Arrange some", "Repeated letters", "With a restriction", "In problems"][st - 1];
    if (kind === "combination")
      return ["Choose a group", "Committees", "At least one", "Two groups at once", "In problems"][st - 1];
    return ["Two choices", "Three choices", "Codes", "No repeats", "In problems"][st - 1];
  },
  generate(skill, stage, rng): RawQuestion {
    const kind = str(skill.params, "kind", "fcp");

    if (kind === "permutation") {
      if (stage === 1) {
        const n = rng.int(3, 6);
        return inputQ({
          instruction: "How many different arrangements are possible?",
          prompt: `${n} different books are placed in a row on a shelf.`,
          answer: String(fact(n)),
          hint: `There are ${n} choices for the first place, then ${n - 1}, and so on.`,
          steps: [
            `Choices: ${Array.from({ length: n }, (_, i) => n - i).join(" × ")}.`,
            `That product is ${n}! = ${fact(n)}.`,
          ],
          concept: "Arranging all n distinct items gives n factorial orders.",
          verify: () => fact(n) === nPr(n, n),
        });
      }
      if (stage === 2) {
        const n = rng.int(5, 8);
        const r = rng.int(2, 3);
        return inputQ({
          instruction: "How many different arrangements are possible?",
          prompt: `${r} students are chosen from ${n} and placed in order on a podium.`,
          answer: String(nPr(n, r)),
          hint: `Multiply ${n} by the next ${r - 1} descending numbers.`,
          steps: [
            `Choices: ${Array.from({ length: r }, (_, i) => n - i).join(" × ")} = ${nPr(n, r)}.`,
            "Order matters here, so this is a permutation.",
          ],
          concept: "Permutations count arrangements where order matters.",
          verify: () => nPr(n, r) === fact(n) / fact(n - r),
        });
      }
      if (stage === 3) {
        const words = [
          { w: "LEVEL", total: 5, rep: [2, 2] },
          { w: "BANANA", total: 6, rep: [3, 2] },
          { w: "LETTER", total: 6, rep: [2, 2] },
          { w: "COFFEE", total: 6, rep: [2, 2] },
          { w: "SUCCESS", total: 7, rep: [3, 2] },
          { w: "BALLOON", total: 7, rep: [2, 2] },
          { w: "ADDRESS", total: 7, rep: [2, 3] },
          { w: "PEPPER", total: 6, rep: [3, 2] },
        ];
        const pickWord = rng.pick(words);
        const denom = pickWord.rep.reduce((a, b) => a * fact(b), 1);
        const ans = Math.round(fact(pickWord.total) / denom);
        return inputQ({
          instruction: "How many different arrangements of the letters are possible?",
          prompt: `The letters of the word ${pickWord.w}`,
          answer: String(ans),
          hint: "Divide by the factorial of each repeated letter's count.",
          steps: [
            `There are ${pickWord.total} letters, giving ${pickWord.total}! = ${fact(pickWord.total)} orders.`,
            `Repeated letters appear ${pickWord.rep.join(" and ")} times, so divide by ${pickWord.rep.map((r) => `${r}!`).join(" × ")} = ${denom}.`,
            `${fact(pickWord.total)} ÷ ${denom} = ${ans}.`,
          ],
          concept: "Identical items are divided out because swapping them changes nothing.",
          verify: () => ans * denom === fact(pickWord.total),
        });
      }
      if (stage === 4) {
        const n = rng.int(4, 8);
        const ans = fact(n - 1) * 2;
        return inputQ({
          instruction: "How many different arrangements are possible?",
          prompt: `${n} friends sit in a row, but two particular friends insist on sitting next to each other.`,
          answer: String(ans),
          hint: "Treat the pair as a single block, then arrange inside the block.",
          steps: [
            `Treat the pair as one block, so there are ${n - 1} items to arrange: ${fact(n - 1)} ways.`,
            "The two friends can swap inside the block: 2 ways.",
            `${fact(n - 1)} × 2 = ${ans}.`,
          ],
          concept: "Grouping items that must stay together reduces the count of items.",
          verify: () => ans === 2 * fact(n - 1),
        });
      }
      const n = rng.int(5, 10);
      const r = 3;
      return inputQ({
        instruction: "How many different arrangements are possible?",
        prompt: `A club with ${n} members chooses a president, a secretary and a treasurer.\nNo member holds two roles.`,
        answer: String(nPr(n, r)),
        hint: "The roles are different, so order matters.",
        steps: [
          `President: ${n} choices. Secretary: ${n - 1}. Treasurer: ${n - 2}.`,
          `${n} × ${n - 1} × ${n - 2} = ${nPr(n, r)}.`,
        ],
        concept: "Distinct roles make a selection a permutation.",
        verify: () => nPr(n, r) === n * (n - 1) * (n - 2),
      });
    }

    if (kind === "combination") {
      if (stage === 1) {
        const n = rng.int(5, 8);
        const r = rng.int(2, 3);
        return inputQ({
          instruction: "How many different groups are possible?",
          prompt: `${r} students are chosen from ${n} to form a team.\nThe order of choosing does not matter.`,
          answer: String(nCr(n, r)),
          hint: "Order does not matter, so divide the arrangements by the ways to reorder the group.",
          steps: [
            `Arrangements would be ${nPr(n, r)}.`,
            `Each group of ${r} is counted ${fact(r)} times, so divide by ${fact(r)}.`,
            `${nPr(n, r)} ÷ ${fact(r)} = ${nCr(n, r)}.`,
          ],
          concept: "Combinations count selections where order does not matter.",
          verify: () => nCr(n, r) * fact(r) === nPr(n, r),
        });
      }
      if (stage === 2) {
        const n = rng.int(7, 10);
        const r = rng.int(3, 4);
        return inputQ({
          instruction: "How many different committees are possible?",
          prompt: `A committee of ${r} is chosen from ${n} people.`,
          answer: String(nCr(n, r)),
          hint: "Use the choose formula because every committee member has the same role.",
          steps: [
            `Choose ${r} from ${n}: ${nCr(n, r)}.`,
            "No ordering is involved, so this is a combination.",
          ],
          concept: "Committees with identical roles are combinations.",
          verify: () => nCr(n, r) === nCr(n, n - r),
        });
      }
      if (stage === 3) {
        const n = rng.int(6, 10);
        const r = 3;
        const total = nCr(n, r);
        const none = nCr(n - 2, r);
        return inputQ({
          instruction: "How many different groups are possible?",
          prompt: `A team of ${r} is chosen from ${n} players, 2 of whom are goalkeepers.\nHow many teams include at least one goalkeeper?`,
          answer: String(total - none),
          hint: "Count all teams, then subtract the teams with no goalkeeper.",
          steps: [
            `All possible teams: ${total}.`,
            `Teams with no goalkeeper come from the other ${n - 2} players: ${none}.`,
            `${total} − ${none} = ${total - none}.`,
          ],
          concept: "'At least one' is easiest as the total minus the none case.",
          verify: () => none + (total - none) === total,
        });
      }
      if (stage === 4) {
        const b = rng.int(4, 6);
        const g = rng.int(4, 6);
        const rb = 2;
        const rg = 2;
        return inputQ({
          instruction: "How many different groups are possible?",
          prompt: `A group of ${rb + rg} is chosen from ${b} boys and ${g} girls.\nIt must contain exactly ${rb} boys and ${rg} girls.`,
          answer: String(nCr(b, rb) * nCr(g, rg)),
          hint: "Choose each part separately, then multiply.",
          steps: [
            `Choose ${rb} boys from ${b}: ${nCr(b, rb)}.`,
            `Choose ${rg} girls from ${g}: ${nCr(g, rg)}.`,
            `${nCr(b, rb)} × ${nCr(g, rg)} = ${nCr(b, rb) * nCr(g, rg)}.`,
          ],
          concept: "Independent choices multiply, even when each is a combination.",
          verify: () => nCr(b, rb) * nCr(g, rg) > 0,
        });
      }
      const n = rng.int(6, 12);
      const r = 2;
      return inputQ({
        instruction: "How many different handshakes are possible?",
        prompt: `${n} people at a meeting each shake hands with every other person exactly once.`,
        answer: String(nCr(n, r)),
        hint: "Each handshake is a pair, and a pair has no order.",
        steps: [
          `Choose 2 people from ${n}: ${nCr(n, r)}.`,
          `Equivalently ${n} × ${n - 1} ÷ 2 = ${nCr(n, r)}.`,
        ],
        concept: "Pairings are combinations because a handshake has no order.",
        verify: () => nCr(n, r) === (n * (n - 1)) / 2,
      });
    }

    // Fundamental counting principle
    if (stage === 1) {
      const a = rng.int(3, 6);
      const b = rng.int(3, 6);
      return inputQ({
        instruction: "How many different outfits are possible?",
        prompt: `There are ${a} shirts and ${b} pairs of trousers.`,
        answer: String(a * b),
        hint: "Multiply the number of choices for each item.",
        steps: [`Each of the ${a} shirts can go with any of the ${b} trousers.`, `${a} × ${b} = ${a * b}.`],
        concept: "When choices are made in stages, multiply the options.",
        verify: () => (a * b) / b === a,
      });
    }
    if (stage === 2) {
      const a = rng.int(2, 5);
      const b = rng.int(2, 5);
      const c = rng.int(2, 4);
      return inputQ({
        instruction: "How many different meals are possible?",
        prompt: `A menu offers ${a} starters, ${b} main courses and ${c} desserts.`,
        answer: String(a * b * c),
        hint: "Multiply all three numbers of choices together.",
        steps: [`${a} × ${b} × ${c} = ${a * b * c}.`, "Every combination of the three courses is different."],
        concept: "The counting principle extends to any number of stages.",
        verify: () => (a * b * c) / (b * c) === a,
      });
    }
    if (stage === 3) {
      const len = rng.int(2, 5);
      const set = rng.pick([
        { size: 10, what: "digits", range: "0 to 9" },
        { size: 6, what: "symbols", range: "a set of 6" },
        { size: 26, what: "letters", range: "A to Z" },
      ]);
      return inputQ({
        instruction: "How many different codes are possible?",
        prompt: `A lock code has ${len} ${set.what}.\nEach one can be ${set.range} and they may repeat.`,
        answer: String(Math.pow(set.size, len)),
        hint: `Each position has ${set.size} possible ${set.what}.`,
        steps: [
          `Each of the ${len} positions has ${set.size} choices.`,
          `${set.size} used ${len} times gives ${Math.pow(set.size, len)}.`,
        ],
        concept: "Repetition allowed means every position keeps the full set of options.",
        verify: () => Math.pow(set.size, len) === Math.round(Math.pow(set.size, len)),
      });
    }
    if (stage === 4) {
      const pool = rng.pick([
        { size: 10, len: rng.int(2, 4), what: "digits from 0 to 9", one: "digit" },
        { size: 26, len: rng.int(2, 3), what: "letters of the alphabet", one: "letter" },
        { size: 6, len: rng.int(2, 3), what: "colours from a set of 6", one: "colour" },
      ]);
      const ans = nPr(pool.size, pool.len);
      return inputQ({
        instruction: "How many different codes are possible?",
        prompt: `A code has ${pool.len} ${pool.what}.\nNo ${pool.one} may be repeated.`,
        answer: String(ans),
        hint: `Each ${pool.one} used removes one option for the next position.`,
        steps: [
          `Choices: ${Array.from({ length: pool.len }, (_, i) => pool.size - i).join(" × ")}.`,
          `That product is ${ans}.`,
        ],
        concept: "Without repetition the number of options drops by one each time.",
        verify: () => ans === nPr(pool.size, pool.len),
      });
    }
    const letters = rng.int(1, 3);
    const digits = rng.int(2, 4);
    const ans = Math.pow(26, letters) * Math.pow(10, digits);
    return inputQ({
      instruction: "How many different plates are possible?",
      prompt: `A licence plate has ${letters} letters followed by ${digits} digits.\nLetters and digits may repeat.`,
      answer: String(ans),
      hint: "There are 26 letters and 10 digits available at each position.",
      steps: [
        `Letters: ${Array(letters).fill(26).join(" × ")} = ${Math.pow(26, letters)}.`,
        `Digits: ${Array(digits).fill(10).join(" × ")} = ${Math.pow(10, digits)}.`,
        `${Math.pow(26, letters)} × ${Math.pow(10, digits)} = ${ans}.`,
      ],
      concept: "Split a problem into stages, count each, then multiply.",
      verify: () => ans === Math.pow(26, letters) * Math.pow(10, digits),
    });
  },
};

/* ------------------------------------------------------ scatter-correlation */
const scatterCorrelation: GeneratorFamily = {
  stageLabel: (s, st) =>
    ["Type of correlation", "Read the data", "Line of best fit", "Make a prediction", "Interpret the model"][st - 1],
  generate(skill, stage, rng): RawQuestion {
    if (stage === 1) {
      const kind = rng.pick(["positive", "negative", "no"]);
      const desc =
        kind === "positive"
          ? "As the number of hours studied increases, the test score also increases."
          : kind === "negative"
          ? "As the age of a car increases, its value decreases."
          : "The shoe size of students and their test scores show no pattern at all.";
      const answer = kind === "no" ? "No correlation" : `${kind.charAt(0).toUpperCase() + kind.slice(1)} correlation`;
      return mcQ({
        instruction: "What type of correlation is described?",
        prompt: desc,
        choices: mcChoices(rng, answer, ["Positive correlation", "Negative correlation", "No correlation"].filter((c) => c !== answer)),
        answer,
        hint: "Ask whether y goes up, goes down, or does nothing as x increases.",
        steps: [
          kind === "positive"
            ? "Both quantities increase together, so the trend rises."
            : kind === "negative"
            ? "One quantity increases while the other decreases, so the trend falls."
            : "There is no consistent rise or fall.",
          `That is ${answer.toLowerCase()}.`,
        ],
        concept: "Correlation describes the direction of a trend between two variables.",
        verify: () => answer.toLowerCase().includes(kind === "no" ? "no" : kind),
      });
    }
    const m = rng.pick([2, 3, 4, 5]);
    const b = rng.int(2, 12);
    const xs = [1, 2, 3, 4, 5];
    const ys = xs.map((x) => m * x + b);
    const table = ["x | y", ...xs.map((x, i) => `${x} | ${ys[i]}`)].join("\n");

    if (stage === 2) {
      const i = rng.int(0, xs.length - 1);
      return inputQ({
        instruction: `What is the y value when x is ${xs[i]}?`,
        prompt: table,
        answer: String(ys[i]),
        hint: "Find the row with that x value and read across.",
        steps: [`The row with x = ${xs[i]} shows y = ${ys[i]}.`],
        concept: "Each point on a scatter plot pairs one x with one y.",
        verify: () => m * xs[i] + b === ys[i],
      });
    }
    if (stage === 3) {
      const answer = `y = ${m}x + ${b}`;
      return mcQ({
        instruction: "Which equation fits the data exactly?",
        prompt: table,
        choices: mcChoices(rng, answer, [
          `y = ${m}x + ${b + 2}`,
          `y = ${m + 1}x + ${b}`,
          `y = ${b}x + ${m}`,
        ]),
        answer,
        hint: "Find how much y changes for each step of 1 in x, then find y when x is 0.",
        steps: [
          `Each time x rises by 1, y rises by ${m}, so the slope is ${m}.`,
          `Working back from x = 1, when x = 0 the value is ${b}.`,
          `So the line is ${answer}.`,
        ],
        concept: "A line of best fit is written as y = mx + b using slope and intercept.",
        verify: () => xs.every((x, i) => m * x + b === ys[i]),
      });
    }
    if (stage === 4) {
      const xp = rng.int(6, 10);
      return inputQ({
        instruction: `Use the line of best fit to predict y when x is ${xp}.`,
        prompt: `The line of best fit is y = ${m}x + ${b}.`,
        answer: String(m * xp + b),
        hint: `Substitute x = ${xp} into the equation.`,
        steps: [`y = ${m} × ${xp} + ${b}.`, `y = ${m * xp} + ${b} = ${m * xp + b}.`],
        concept: "A line of best fit lets you predict values you did not measure.",
        verify: () => (m * xp + b - b) / m === xp,
      });
    }
    const answer = `y increases by ${m} for every increase of 1 in x`;
    return mcQ({
      instruction: "What does the slope tell you?",
      prompt: `The line of best fit is y = ${m}x + ${b}.`,
      choices: mcChoices(rng, answer, [
        `y increases by ${b} for every increase of 1 in x`,
        `x increases by ${m} for every increase of 1 in y`,
        `y is always ${m}`,
      ]),
      answer,
      hint: "Slope is the change in y for each single step in x.",
      steps: [
        `In y = mx + b the slope m is ${m}.`,
        `So each extra unit of x raises y by ${m}.`,
        `The value ${b} is the starting value when x is 0.`,
      ],
      concept: "Slope is a rate of change, and the intercept is the starting value.",
      verify: () => answer.includes(String(m)),
    });
  },
};

/* ------------------------------------------------------------------ mc-bank */
interface BankItem {
  level: number;
  instruction: string;
  prompt: string;
  answer: string;
  distractors: string[];
  hint: string;
  steps: string[];
  concept: string;
}

const BANKS: Record<string, BankItem[]> = {
  "number-writing": [
    { level: 1, instruction: "Which one shows the number seven?", prompt: "seven", answer: "7", distractors: ["1", "4", "17"], hint: "Say the number out loud, then find the digit.", steps: ["The word seven matches the digit 7."], concept: "Every number word has a matching digit." },
    { level: 1, instruction: "Which word matches the number 3?", prompt: "3", answer: "three", distractors: ["two", "five", "eight"], hint: "Count up: one, two, three.", steps: ["Counting one, two, three shows that 3 is three."], concept: "Number words and digits name the same amount." },
    { level: 1, instruction: "Which one shows the number ten?", prompt: "ten", answer: "10", distractors: ["1", "100", "11"], hint: "Ten is one group of ten and no ones.", steps: ["Ten is written with a 1 then a 0, giving 10."], concept: "Ten is the first two-digit number." },
    { level: 2, instruction: "Which word matches the number 8?", prompt: "8", answer: "eight", distractors: ["eighteen", "eighty", "six"], hint: "Careful: eighteen and eighty are different numbers.", steps: ["8 is a single digit, so it is eight."], concept: "Similar-sounding words can mean very different numbers." },
    { level: 2, instruction: "How do you write the number twelve?", prompt: "twelve", answer: "12", distractors: ["21", "102", "2"], hint: "Twelve is one ten and two ones.", steps: ["One ten and two ones is written 12."], concept: "Teen numbers start with a ten." },
    { level: 2, instruction: "Which one shows the number fifteen?", prompt: "fifteen", answer: "15", distractors: ["50", "5", "51"], hint: "Fifteen is one ten and five ones.", steps: ["One ten and five ones is written 15."], concept: "Listen for the 'teen' ending to hear a ten." },
    { level: 3, instruction: "Which word matches the number 20?", prompt: "20", answer: "twenty", distractors: ["twelve", "two", "ten"], hint: "Twenty means two tens.", steps: ["Two tens is 20, which we say as twenty."], concept: "Tens numbers are named by how many tens." },
    { level: 3, instruction: "Which one shows the number seventeen?", prompt: "seventeen", answer: "17", distractors: ["71", "7", "70"], hint: "Seventeen is one ten and seven ones.", steps: ["One ten and seven ones is written 17."], concept: "The order of digits changes the number." },
    { level: 3, instruction: "Which word matches the number 11?", prompt: "11", answer: "eleven", distractors: ["seven", "twelve", "one"], hint: "It comes just after ten.", steps: ["The number after ten is eleven, written 11."], concept: "Eleven and twelve have special names." },
    { level: 4, instruction: "Which is the correct spelling for 40?", prompt: "40", answer: "forty", distractors: ["fourty", "fourteen", "fortey"], hint: "This word drops the 'u' from four.", steps: ["40 is spelled forty, with no u."], concept: "Some number words have spellings you must remember." },
    { level: 4, instruction: "Which number comes right after nineteen?", prompt: "nineteen, ___", answer: "20", distractors: ["18", "91", "29"], hint: "After nineteen we start a new ten.", steps: ["Nineteen is 19, so the next number is 20."], concept: "Counting past a teen number starts the next ten." },
    { level: 5, instruction: "A number has 2 tens and 5 ones. How is it written?", prompt: "2 tens and 5 ones", answer: "25", distractors: ["52", "205", "7"], hint: "Write the tens digit first.", steps: ["2 tens is 20 and 5 ones is 5.", "20 + 5 = 25."], concept: "Place value tells you where each digit belongs." },
    { level: 5, instruction: "Which one shows the number thirty-one?", prompt: "thirty-one", answer: "31", distractors: ["13", "301", "3"], hint: "Thirty-one is three tens and one one.", steps: ["Three tens is 30, plus 1 gives 31."], concept: "Say the tens first, then the ones." },
  ],
  "shape-attributes": [
    { level: 1, instruction: "How many sides does a triangle have?", prompt: "triangle", answer: "3", distractors: ["4", "5", "6"], hint: "Count the straight edges.", steps: ["A triangle has 3 straight sides."], concept: "Shapes are named by their number of sides." },
    { level: 1, instruction: "How many sides does a square have?", prompt: "square", answer: "4", distractors: ["3", "6", "8"], hint: "Count each straight edge once.", steps: ["A square has 4 equal straight sides."], concept: "A square has four equal sides." },
    { level: 1, instruction: "Which shape has no straight sides?", prompt: "Choose the shape with no corners.", answer: "circle", distractors: ["square", "triangle", "rectangle"], hint: "Look for the round shape.", steps: ["A circle is one curved line with no corners."], concept: "Circles are curved, not made of straight sides." },
    { level: 2, instruction: "How many vertices does a triangle have?", prompt: "triangle", answer: "3", distractors: ["2", "4", "6"], hint: "A vertex is a corner where two sides meet.", steps: ["A triangle has 3 corners, so 3 vertices."], concept: "The number of vertices equals the number of sides in a polygon." },
    { level: 2, instruction: "Which shape has 4 equal sides?", prompt: "Choose the shape with four sides all the same length.", answer: "square", distractors: ["rectangle", "triangle", "circle"], hint: "A rectangle has equal opposite sides, not all four equal.", steps: ["Only the square must have all 4 sides equal."], concept: "Equal side lengths separate a square from a rectangle." },
    { level: 2, instruction: "How many sides does a hexagon have?", prompt: "hexagon", answer: "6", distractors: ["5", "7", "8"], hint: "Hex means six.", steps: ["A hexagon has 6 sides."], concept: "Shape names often tell you the number of sides." },
    { level: 3, instruction: "Which one is a 3D shape?", prompt: "Choose the solid shape.", answer: "cube", distractors: ["square", "circle", "triangle"], hint: "A 3D shape takes up space and can be held.", steps: ["A cube is solid, while a square is flat."], concept: "2D shapes are flat; 3D shapes are solid." },
    { level: 3, instruction: "How many right angles does a rectangle have?", prompt: "rectangle", answer: "4", distractors: ["2", "1", "0"], hint: "Every corner of a rectangle is square.", steps: ["All 4 corners of a rectangle are right angles."], concept: "A rectangle is defined by its four right angles." },
    { level: 3, instruction: "Which 3D shape rolls?", prompt: "Choose the shape that can roll.", answer: "sphere", distractors: ["cube", "pyramid", "cone"], hint: "Look for the shape with a fully curved surface.", steps: ["A sphere is curved everywhere, so it rolls."], concept: "Curved surfaces roll; flat faces slide." },
    { level: 4, instruction: "What sorting rule groups a circle, an oval and a sphere?", prompt: "circle, oval, sphere", answer: "They are round", distractors: ["They have corners", "They have straight sides", "They are all flat"], hint: "Look for what all three share.", steps: ["None of these has corners or straight sides.", "They are all round."], concept: "A sorting rule is a property every member shares." },
    { level: 4, instruction: "Which shape does NOT belong with the others?", prompt: "square, rectangle, triangle, circle", answer: "circle", distractors: ["square", "rectangle", "triangle"], hint: "Three of them are made of straight sides.", steps: ["Square, rectangle and triangle all have straight sides.", "The circle does not, so it is the odd one out."], concept: "Odd-one-out puzzles test which property is shared." },
    { level: 5, instruction: "Which shape has exactly one pair of parallel sides?", prompt: "A four-sided shape with only one pair of parallel sides", answer: "trapezoid", distractors: ["square", "rectangle", "triangle"], hint: "Squares and rectangles have two pairs of parallel sides.", steps: ["A trapezoid has exactly one pair of parallel sides."], concept: "Quadrilaterals differ by how many sides are parallel." },
    { level: 5, instruction: "Which two shapes join to make a rectangle?", prompt: "Choose the pair that fits together into a rectangle.", answer: "two identical right triangles", distractors: ["two circles", "two identical pentagons", "three squares"], hint: "Cut a rectangle along its diagonal and see what you get.", steps: ["Cutting a rectangle corner to corner makes 2 identical right triangles.", "Joining them back gives the rectangle."], concept: "Shapes can be composed and decomposed into other shapes." },
  ],
  "sorting-data": [
    { level: 1, instruction: "Which group does an apple belong to?", prompt: "apple", answer: "fruit", distractors: ["vehicles", "animals", "colours"], hint: "Think about what an apple is.", steps: ["An apple is something you eat, and it is a fruit."], concept: "Sorting means putting things into groups that match." },
    { level: 1, instruction: "Sorting by colour, which item joins the red group?", prompt: "red group", answer: "a red ball", distractors: ["a blue cup", "a green leaf", "a yellow hat"], hint: "Only the colour matters here.", steps: ["The red group takes only red things, so the red ball joins."], concept: "A sorting rule looks at one property at a time." },
    { level: 1, instruction: "Which item does not belong with the others?", prompt: "car, bus, bike, banana", answer: "banana", distractors: ["car", "bus", "bike"], hint: "Three of them carry people.", steps: ["Car, bus and bike are all vehicles.", "A banana is food, so it does not belong."], concept: "Finding the odd one out means spotting the shared rule." },
    { level: 2, instruction: "What is the sorting rule for this group?", prompt: "cat, dog, rabbit", answer: "They are animals", distractors: ["They are foods", "They are colours", "They are shapes"], hint: "Ask what all three have in common.", steps: ["A cat, a dog and a rabbit are all animals."], concept: "Naming the rule explains why things are grouped." },
    { level: 2, instruction: "How many circles are in this group?", prompt: "🔵🔵🔵🔺🔺", answer: "3", distractors: ["2", "5", "4"], hint: "Count only the round ones.", steps: ["There are 3 circles and 2 triangles.", "The circle count is 3."], concept: "Counting each category is how we turn sorting into data." },
    { level: 2, instruction: "Which group has more items?", prompt: "Circles: 🔵🔵🔵🔵\nTriangles: 🔺🔺", answer: "circles", distractors: ["triangles", "they are equal", "you cannot tell"], hint: "Count both groups and compare.", steps: ["Circles: 4. Triangles: 2.", "4 is more than 2, so circles."], concept: "Sorted data lets us compare groups quickly." },
    { level: 3, instruction: "What do these tally marks show?", prompt: "|||| |", answer: "6", distractors: ["5", "4", "11"], hint: "A group of four with a line across means five.", steps: ["The crossed group is 5, plus 1 more mark.", "5 + 1 = 6."], concept: "Tally marks record counts in groups of five." },
    { level: 3, instruction: "Which category has the most?", prompt: "Red: 4\nBlue: 7\nGreen: 2", answer: "Blue", distractors: ["Red", "Green", "They are equal"], hint: "Compare the three numbers.", steps: ["7 is larger than 4 and 2, so Blue has the most."], concept: "Reading sorted counts answers 'which has most'." },
    { level: 3, instruction: "Which item belongs in the 'has four legs' group?", prompt: "has four legs", answer: "a table", distractors: ["a bird", "a snake", "a fish"], hint: "Count the legs on each thing.", steps: ["A table has 4 legs, while a bird has 2 and a snake has none."], concept: "Sorting rules can describe any shared property." },
    { level: 4, instruction: "10 children are sorted into two groups. One group has 6. How many are in the other?", prompt: "Total 10, one group has 6", answer: "4", distractors: ["6", "16", "5"], hint: "The two groups must add to the total.", steps: ["10 − 6 = 4 children in the other group."], concept: "Category counts always add up to the total." },
    { level: 4, instruction: "Which sorting rule separates 2 and 4 from 3 and 5?", prompt: "Group A: 2, 4    Group B: 3, 5", answer: "even and odd numbers", distractors: ["big and small numbers", "red and blue numbers", "one-digit and two-digit numbers"], hint: "Look at whether each number can be shared into pairs.", steps: ["2 and 4 are even; 3 and 5 are odd."], concept: "Number properties can be sorting rules too." },
    { level: 5, instruction: "A survey sorts pets into dogs, cats and fish. 5 dogs, 3 cats, 2 fish. How many pets in total?", prompt: "Dogs: 5\nCats: 3\nFish: 2", answer: "10", distractors: ["8", "5", "12"], hint: "Add every category together.", steps: ["5 + 3 + 2 = 10 pets altogether."], concept: "The total is the sum of all the sorted categories." },
    { level: 5, instruction: "Which question could this data answer?", prompt: "Dogs: 5\nCats: 3\nFish: 2", answer: "Which pet is most common?", distractors: ["What colour is each pet?", "How old are the pets?", "What are the pets' names?"], hint: "Only counts were recorded, nothing else.", steps: ["The data shows how many of each pet there are.", "So it can tell us which pet is most common."], concept: "Data can only answer questions about what was collected." },
  ],
  lines: [
    { level: 1, instruction: "What do we call lines that never meet?", prompt: "Lines that stay the same distance apart forever", answer: "parallel lines", distractors: ["perpendicular lines", "intersecting lines", "curved lines"], hint: "Think of railway tracks.", steps: ["Lines that never meet and stay the same distance apart are parallel."], concept: "Parallel lines never cross." },
    { level: 1, instruction: "What do we call lines that cross at a right angle?", prompt: "Two lines meeting at 90 degrees", answer: "perpendicular lines", distractors: ["parallel lines", "equal lines", "curved lines"], hint: "Think of the corner of a page.", steps: ["Lines meeting at 90 degrees are perpendicular."], concept: "Perpendicular lines meet at right angles." },
    { level: 2, instruction: "How many endpoints does a line segment have?", prompt: "line segment", answer: "2", distractors: ["1", "0", "4"], hint: "A segment is a piece of a line with both ends closed.", steps: ["A line segment stops at both ends, so it has 2 endpoints."], concept: "Segments have two endpoints; lines have none." },
    { level: 2, instruction: "How many endpoints does a ray have?", prompt: "ray", answer: "1", distractors: ["2", "0", "3"], hint: "A ray starts somewhere and goes on forever one way.", steps: ["A ray has one endpoint and continues without end in one direction."], concept: "A ray is half a line." },
    { level: 2, instruction: "Which real object best models parallel lines?", prompt: "Choose the best model.", answer: "railway tracks", distractors: ["the corner of a book", "a pair of scissors opening", "a spinning wheel"], hint: "Parallel lines never meet.", steps: ["Railway tracks stay the same distance apart, so they model parallel lines."], concept: "Everyday objects can model geometric relationships." },
    { level: 3, instruction: "Which real object best models perpendicular lines?", prompt: "Choose the best model.", answer: "the corner of a page", distractors: ["railway tracks", "a straight road", "the edge of a ruler"], hint: "Perpendicular means a right angle.", steps: ["A page corner forms a 90 degree angle, so it models perpendicular lines."], concept: "Right angles appear in many everyday corners." },
    { level: 3, instruction: "What are lines that cross but not at a right angle called?", prompt: "Two lines crossing at 40 degrees", answer: "intersecting lines", distractors: ["parallel lines", "perpendicular lines", "equal lines"], hint: "They meet, but the angle is not 90 degrees.", steps: ["Lines that cross are intersecting.", "They are only perpendicular if the angle is 90 degrees."], concept: "All perpendicular lines intersect, but not all intersecting lines are perpendicular." },
    { level: 3, instruction: "Which symbol means 'is parallel to'?", prompt: "Choose the parallel symbol.", answer: "∥", distractors: ["⊥", "∠", "≅"], hint: "The symbol looks like two parallel strokes.", steps: ["The two upright strokes ∥ mean parallel.", "The upside-down T means perpendicular."], concept: "Geometry uses short symbols for common relationships." },
    { level: 4, instruction: "In a rectangle, what is true of opposite sides?", prompt: "rectangle", answer: "They are parallel", distractors: ["They are perpendicular", "They are curved", "They are unequal"], hint: "Opposite sides never meet, even if extended.", steps: ["Opposite sides of a rectangle never meet, so they are parallel."], concept: "Rectangles have two pairs of parallel sides." },
    { level: 4, instruction: "In a rectangle, what is true of adjacent sides?", prompt: "Two sides that meet at a corner", answer: "They are perpendicular", distractors: ["They are parallel", "They are equal in length", "They are curved"], hint: "Look at the angle where they meet.", steps: ["Sides meeting at a corner of a rectangle form a right angle.", "So they are perpendicular."], concept: "Adjacent sides of a rectangle meet at right angles." },
    { level: 4, instruction: "How many pairs of parallel sides does a rectangle have?", prompt: "rectangle", answer: "2", distractors: ["1", "4", "0"], hint: "Pair up the opposite sides.", steps: ["The top and bottom form one pair.", "The left and right form another, so 2 pairs."], concept: "Counting parallel pairs helps classify quadrilaterals." },
    { level: 5, instruction: "Can two lines be both parallel and perpendicular?", prompt: "Think about what each word means.", answer: "No, never", distractors: ["Yes, always", "Yes, sometimes", "Only if they are curved"], hint: "Parallel lines never meet, but perpendicular lines must meet.", steps: ["Parallel lines never meet.", "Perpendicular lines must cross at 90 degrees.", "These cannot both be true, so never."], concept: "Parallel and perpendicular are mutually exclusive." },
    { level: 5, instruction: "Two lines are each parallel to a third line. What is true of them?", prompt: "Line A ∥ Line C and Line B ∥ Line C", answer: "They are parallel to each other", distractors: ["They are perpendicular", "They must cross", "They form a triangle"], hint: "They all point in the same direction.", steps: ["If A and B both run in the same direction as C, they run in the same direction as each other.", "So A is parallel to B."], concept: "Parallelism carries across from one line to another." },
  ],
  relations: [
    { level: 1, instruction: "What is a relation?", prompt: "In mathematics, a relation is a set of what?", answer: "ordered pairs", distractors: ["single numbers", "straight lines", "equations only"], hint: "Think about what a point on a graph looks like.", steps: ["A relation links inputs to outputs as ordered pairs."], concept: "A relation is any set of ordered pairs." },
    { level: 1, instruction: "In the ordered pair 3, 5 which value is the input?", prompt: "The ordered pair is written x then y, with x = 3 and y = 5", answer: "3", distractors: ["5", "both", "neither"], hint: "The first coordinate is the input.", steps: ["The first value, 3, is the x value, which is the input."], concept: "The first coordinate is the input, or x value." },
    { level: 2, instruction: "What is the set of all first coordinates called?", prompt: "All the x values of a relation", answer: "the domain", distractors: ["the range", "the function", "the slope"], hint: "It comes first alphabetically and first in the pair.", steps: ["All the x values together form the domain."], concept: "The domain is the set of inputs." },
    { level: 2, instruction: "What is the set of all second coordinates called?", prompt: "All the y values of a relation", answer: "the range", distractors: ["the domain", "the slope", "the intercept"], hint: "It is the set of outputs.", steps: ["All the y values together form the range."], concept: "The range is the set of outputs." },
    { level: 2, instruction: "What is the domain of this relation?", prompt: "Ordered pairs: 2 with 3, and 4 with 5", answer: "2 and 4", distractors: ["3 and 5", "2 and 3", "all numbers"], hint: "Collect the first values only.", steps: ["The first values are 2 and 4, so that is the domain."], concept: "Read the domain by listing every input." },
    { level: 3, instruction: "A function assigns each input to how many outputs?", prompt: "definition of a function", answer: "exactly one", distractors: ["at least one", "two or more", "any number"], hint: "That single rule is what makes a relation a function.", steps: ["A function gives exactly one output for each input."], concept: "One input, one output — that is a function." },
    { level: 3, instruction: "Is this relation a function?", prompt: "Pairs: 1 with 2, 2 with 4, 3 with 6", answer: "Yes, each input has one output", distractors: ["No, the outputs repeat", "No, the inputs repeat", "There is not enough information"], hint: "Check whether any input appears twice.", steps: ["The inputs 1, 2 and 3 each appear once.", "So each input has exactly one output, making it a function."], concept: "Repeated outputs are fine; repeated inputs are not." },
    { level: 3, instruction: "Is this relation a function?", prompt: "Pairs: 1 with 2, and 1 with 3", answer: "No, the input 1 has two outputs", distractors: ["Yes, it is a function", "No, the outputs are different", "There is not enough information"], hint: "Look at how many times the input 1 appears.", steps: ["The input 1 is paired with both 2 and 3.", "One input cannot have two outputs, so it is not a function."], concept: "An input repeating with different outputs breaks the function rule." },
    { level: 4, instruction: "What does the vertical line test check?", prompt: "A graph passes the test if every vertical line crosses it how many times?", answer: "at most once", distractors: ["at least twice", "exactly twice", "never"], hint: "A vertical line represents a single x value.", steps: ["A vertical line fixes one x value.", "If it crosses twice, that x has two outputs, so it is not a function."], concept: "The vertical line test detects repeated inputs on a graph." },
    { level: 4, instruction: "Which relation is NOT a function?", prompt: "Choose the relation that breaks the function rule.", answer: "0 with 1, and 0 with 2", distractors: ["1 with 1, and 2 with 2", "1 with 5, and 2 with 5", "3 with 9, and 4 with 9"], hint: "Look for the same input used twice.", steps: ["The input 0 is paired with both 1 and 2.", "That single input has two outputs, so it is not a function."], concept: "Only repeated inputs disqualify a relation." },
    { level: 5, instruction: "Is y = x squared a function?", prompt: "y = x^2", answer: "Yes, each x gives one y", distractors: ["No, because 2 and −2 give the same y", "No, it is a curve", "Only for positive x"], hint: "Ask whether one x can give two different y values.", steps: ["Squaring any single x gives exactly one result.", "Different inputs sharing an output is allowed, so it is a function."], concept: "Sharing outputs is allowed; splitting one input is not." },
    { level: 5, instruction: "Is x = y squared a function of x?", prompt: "x = y^2", answer: "No, one x can give two y values", distractors: ["Yes, always", "Yes, for positive x only", "It is not a relation"], hint: "Try x = 4 and solve for y.", steps: ["When x = 4, y could be 2 or −2.", "One input giving two outputs means it is not a function."], concept: "Solving for y can reveal two outputs for a single input." },
  ],
  distributions: [
    { level: 1, instruction: "Which measure describes the spread of a data set?", prompt: "spread", answer: "the range", distractors: ["the mean", "the median", "the mode"], hint: "Spread is about how far apart the values are.", steps: ["Range is the highest value minus the lowest, so it measures spread."], concept: "Centre and spread describe different things about data." },
    { level: 1, instruction: "Which measures describe the centre of a data set?", prompt: "centre", answer: "the mean and the median", distractors: ["the range only", "the highest value", "the number of values"], hint: "Centre means a typical or middle value.", steps: ["The mean and the median both describe a typical middle value."], concept: "The mean and median are measures of centre." },
    { level: 2, instruction: "Which measure of centre is most affected by an outlier?", prompt: "One very large value is added to a data set.", answer: "the mean", distractors: ["the median", "the mode", "none of them"], hint: "One measure uses every value in its calculation.", steps: ["The mean adds every value, so one extreme value pulls it.", "The median only depends on position, so it barely moves."], concept: "The mean is sensitive to outliers; the median is resistant." },
    { level: 2, instruction: "A distribution has a long tail stretching to the right. What is it called?", prompt: "Most values are low, with a few very high values.", answer: "skewed right", distractors: ["skewed left", "symmetric", "uniform"], hint: "The skew is named for the direction of the tail.", steps: ["The tail stretches to the right, so it is skewed right."], concept: "Skew is named after the side the tail points to." },
    { level: 3, instruction: "In a symmetric distribution, how do the mean and median compare?", prompt: "symmetric distribution", answer: "They are about equal", distractors: ["The mean is much larger", "The median is much larger", "They cannot be compared"], hint: "Symmetry means the data balances around the centre.", steps: ["A symmetric shape balances at its centre.", "So the mean and median land in about the same place."], concept: "Symmetry pulls the mean and median together." },
    { level: 3, instruction: "Which measure of centre is best when there is a strong outlier?", prompt: "Salaries where one person earns far more than everyone else", answer: "the median", distractors: ["the mean", "the range", "the total"], hint: "Choose the measure the outlier cannot drag.", steps: ["The single huge salary would pull the mean upward.", "The median stays near the typical salary, so it is the better choice."], concept: "Use the median when outliers would distort the mean." },
    { level: 3, instruction: "What does a large range tell you?", prompt: "Two data sets have the same mean, but one has a much larger range.", answer: "Its values are more spread out", distractors: ["Its values are higher", "It has more values", "It has no outliers"], hint: "Range compares the extremes.", steps: ["A larger range means the highest and lowest are further apart.", "So that data set is more spread out."], concept: "Two data sets can share a centre but differ in spread." },
    { level: 4, instruction: "A very large value is added to a data set. What happens to the mean?", prompt: "Adding one unusually large value", answer: "It increases", distractors: ["It decreases", "It stays the same", "It becomes zero"], hint: "The total goes up faster than the count.", steps: ["Adding a large value raises the total a lot.", "So the mean is pulled upward."], concept: "Extreme values move the mean toward themselves." },
    { level: 4, instruction: "What is the median?", prompt: "definition", answer: "The middle value when the data is ordered", distractors: ["The most common value", "The average of all values", "The largest minus the smallest"], hint: "You must sort the data first.", steps: ["Order the data, then take the middle value."], concept: "The median is a position-based measure of centre." },
    { level: 4, instruction: "Which display best shows the shape of a distribution?", prompt: "You want to see whether data is symmetric or skewed.", answer: "a histogram", distractors: ["a pie chart", "a single number", "a table of names"], hint: "You need to see how values are spread across intervals.", steps: ["A histogram groups values into intervals and shows their frequency.", "That reveals the shape of the distribution."], concept: "Histograms and dot plots reveal distribution shape." },
    { level: 5, instruction: "Two classes have the same mean score but different ranges. What can you conclude?", prompt: "Class A range 10, Class B range 40, both mean 70", answer: "Class B scores are more spread out", distractors: ["Class B scored higher overall", "Class A had more students", "They performed identically"], hint: "Same centre does not mean same spread.", steps: ["Both classes centre on 70.", "Class B has a much larger range, so its scores vary more."], concept: "Always report spread alongside centre." },
    { level: 5, instruction: "A data set is skewed right. How do the mean and median compare?", prompt: "skewed right distribution", answer: "The mean is greater than the median", distractors: ["The mean is less than the median", "They are equal", "The mode is largest"], hint: "The long tail pulls one of them.", steps: ["The high tail values inflate the mean.", "The median resists them, so the mean ends up larger."], concept: "In a right-skewed set, mean > median." },
  ],
  sampling: [
    { level: 1, instruction: "What is a sample?", prompt: "definition", answer: "A part of the population", distractors: ["The whole population", "A single person only", "The survey question"], hint: "It is smaller than the whole group.", steps: ["A sample is a smaller part of the whole group being studied."], concept: "We study samples when the population is too large." },
    { level: 1, instruction: "What is the population in a study?", prompt: "definition", answer: "The entire group being studied", distractors: ["The people who answered", "A small group only", "The survey results"], hint: "It is the complete group you want to learn about.", steps: ["The population is every member of the group of interest."], concept: "The population is the whole group; the sample is part of it." },
    { level: 2, instruction: "What is the best way to choose a fair sample?", prompt: "fair sampling", answer: "Choose people at random", distractors: ["Choose your friends", "Choose the first people you see", "Choose only volunteers"], hint: "Everyone should have an equal chance of being picked.", steps: ["Random selection gives every member an equal chance.", "That keeps the sample fair."], concept: "Random selection is the foundation of a fair sample." },
    { level: 2, instruction: "Why is surveying only your friends a problem?", prompt: "A student surveys only their own friends.", answer: "The sample is biased", distractors: ["The sample is too random", "The sample is too large", "There is no problem"], hint: "Friends often share opinions and interests.", steps: ["Friends are not chosen at random and tend to be similar.", "So the sample is biased and will not represent everyone."], concept: "Convenience samples are usually biased." },
    { level: 3, instruction: "To learn about all students in a school, who should you survey?", prompt: "school-wide survey", answer: "Randomly chosen students from the whole school", distractors: ["Only Grade 12 students", "Only students in the library", "Only students on the sports team"], hint: "The sample should look like the whole school.", steps: ["Every group in the school should have a chance to be chosen.", "A random sample from the full list does that."], concept: "A representative sample mirrors the population." },
    { level: 3, instruction: "Is a larger random sample generally better?", prompt: "Comparing a random sample of 50 with one of 500", answer: "Yes, larger random samples are more reliable", distractors: ["No, smaller is always better", "Size makes no difference", "Only if the people are similar"], hint: "More data reduces the effect of chance.", steps: ["A larger sample reduces random variation.", "So its results are more reliable, provided it is still random."], concept: "Reliability improves with sample size when sampling is random." },
    { level: 3, instruction: "Which sample is representative of a town?", prompt: "You want the opinions of everyone in a town.", answer: "Randomly chosen residents from the whole town", distractors: ["People leaving one shop", "Members of one club", "Your neighbours only"], hint: "Ask whether every kind of resident could be chosen.", steps: ["Only the random town-wide sample gives everyone a chance.", "The others exclude large groups."], concept: "Representative samples include every part of the population." },
    { level: 4, instruction: "Why is surveying people at a gym about exercise habits biased?", prompt: "A survey about how much people exercise is conducted at a gym.", answer: "Gym-goers exercise more than the general population", distractors: ["Gyms are too noisy", "The sample is too large", "Gym members never answer surveys"], hint: "Think about who is likely to be at a gym.", steps: ["People at a gym already exercise regularly.", "So the sample overstates how much the population exercises."], concept: "Where you sample can systematically skew results." },
    { level: 4, instruction: "A survey asks 'Do you agree that our excellent park should get more funding?' What is wrong?", prompt: "survey wording", answer: "The question is leading", distractors: ["The question is too short", "The sample is too small", "Nothing is wrong"], hint: "Notice the word excellent.", steps: ["Calling the park excellent pushes people toward agreeing.", "A leading question biases the answers."], concept: "Question wording can bias results just as much as sampling." },
    { level: 4, instruction: "Which sampling method is random?", prompt: "Choose the random method.", answer: "Drawing names from a hat containing every member", distractors: ["Asking the first 10 people to arrive", "Asking people who volunteer", "Asking everyone in one classroom"], hint: "Every member must have an equal chance.", steps: ["Only the hat method gives every member an equal chance."], concept: "Random means equal chance for every member." },
    { level: 5, instruction: "A poll of 500 randomly chosen voters and one of 50 disagree. Which is more reliable?", prompt: "500 random voters vs 50 random voters", answer: "The poll of 500", distractors: ["The poll of 50", "They are equally reliable", "Neither can be trusted"], hint: "Both are random, so compare their sizes.", steps: ["Both samples are random, so neither is biased.", "The larger sample has less random variation, so it is more reliable."], concept: "With equally fair methods, larger samples are more reliable." },
    { level: 5, instruction: "An online poll lets anyone vote as often as they like. What is the main problem?", prompt: "open online poll", answer: "It is not a random sample and can be manipulated", distractors: ["It is too expensive", "It gathers too little data", "It uses the wrong average"], hint: "Think about who chooses to respond, and how often.", steps: ["Only motivated people respond, and repeat voting is possible.", "So the results do not represent the population."], concept: "Self-selected samples cannot be generalised to a population." },
  ],
  correlation: [
    { level: 1, instruction: "As x increases, y also increases. What is this called?", prompt: "Both variables rise together.", answer: "positive correlation", distractors: ["negative correlation", "no correlation", "causation"], hint: "Both move the same way.", steps: ["When both variables rise together, the correlation is positive."], concept: "Positive correlation means both variables move the same way." },
    { level: 1, instruction: "As x increases, y decreases. What is this called?", prompt: "One variable rises while the other falls.", answer: "negative correlation", distractors: ["positive correlation", "no correlation", "causation"], hint: "They move in opposite directions.", steps: ["When one rises as the other falls, the correlation is negative."], concept: "Negative correlation means the variables move in opposite directions." },
    { level: 2, instruction: "The points on a scatter plot show no pattern. What is this called?", prompt: "The points are scattered with no trend.", answer: "no correlation", distractors: ["positive correlation", "negative correlation", "perfect correlation"], hint: "There is no consistent rise or fall.", steps: ["Without a consistent trend there is no correlation."], concept: "No correlation means no linear pattern between the variables." },
    { level: 2, instruction: "The points lie very close to a straight line. What does that show?", prompt: "Points tightly clustered along a line", answer: "a strong correlation", distractors: ["a weak correlation", "no correlation", "no relationship at all"], hint: "Closeness to the line measures strength.", steps: ["The tighter the points hug the line, the stronger the correlation."], concept: "Strength describes how closely points follow the trend." },
    { level: 3, instruction: "Correlation does not imply what?", prompt: "Two variables are strongly correlated.", answer: "causation", distractors: ["association", "a trend", "a pattern"], hint: "A link does not prove one thing makes the other happen.", steps: ["Two variables can move together without one causing the other."], concept: "Correlation is not causation." },
    { level: 3, instruction: "Ice cream sales and swimming pool visits both rise together. What best explains this?", prompt: "Both rise at the same times of year.", answer: "A third variable, hot weather, affects both", distractors: ["Ice cream causes swimming", "Swimming causes ice cream sales", "It is impossible to explain"], hint: "Ask what else changes at the same time.", steps: ["Hot weather increases both ice cream sales and swimming.", "The link between them is explained by that third variable."], concept: "A lurking variable can create correlation without causation." },
    { level: 4, instruction: "A correlation coefficient close to 1 means what?", prompt: "r is close to 1", answer: "a strong positive correlation", distractors: ["a strong negative correlation", "no correlation", "a calculation error"], hint: "The sign gives direction and the size gives strength.", steps: ["A positive sign means the trend rises.", "A value near 1 means the points follow the line closely."], concept: "r near 1 or −1 means strong; r near 0 means weak." },
    { level: 4, instruction: "A correlation coefficient close to 0 means what?", prompt: "r is close to 0", answer: "little or no linear correlation", distractors: ["a strong positive correlation", "a strong negative correlation", "a perfect relationship"], hint: "Size measures strength, and 0 is the smallest.", steps: ["An r near 0 means the points do not follow a line.", "So there is little or no linear correlation."], concept: "A near-zero r means no linear trend." },
    { level: 4, instruction: "A single point sits far away from the trend. What is it called?", prompt: "One point far from all the others", answer: "an outlier", distractors: ["the mean", "the intercept", "the slope"], hint: "It does not fit the pattern.", steps: ["A point far from the overall trend is an outlier."], concept: "Outliers can strongly affect a line of best fit." },
    { level: 5, instruction: "What is the line of best fit used for?", prompt: "A line drawn through the trend of a scatter plot", answer: "To model the trend and make predictions", distractors: ["To connect every point exactly", "To find the largest value", "To sort the data"], hint: "It summarises the relationship.", steps: ["The line summarises the overall trend.", "That lets you estimate y for a value of x you did not measure."], concept: "A line of best fit models a relationship for prediction." },
    { level: 5, instruction: "Why is predicting far beyond the data risky?", prompt: "Using a line of best fit far outside the measured range", answer: "The trend may not continue outside the data", distractors: ["The line becomes curved", "The slope changes sign automatically", "It is never risky"], hint: "You have no evidence about what happens out there.", steps: ["The line was fitted only to the range of data collected.", "Outside that range there is no evidence the trend holds."], concept: "Extrapolation beyond the data is unreliable." },
    { level: 5, instruction: "A study finds students with more books at home score higher. What can we conclude?", prompt: "A positive correlation between books at home and test scores", answer: "There is an association, but books may not be the cause", distractors: ["Buying books raises test scores", "Test scores cause people to buy books", "There is no relationship"], hint: "Other factors may explain both.", steps: ["The data shows the two rise together.", "Other factors could drive both, so we cannot claim books cause the scores."], concept: "Observational data shows association, not cause." },
  ],
};

const mcBank: GeneratorFamily = {
  stageLabel: (s, st) =>
    ["First ideas", "Building up", "Applying it", "Reasoning", "Putting it together"][st - 1],
  generate(skill, stage, rng): RawQuestion {
    const bankId = str(skill.params, "bank", "sorting-data");
    const bank = BANKS[bankId] ?? BANKS["sorting-data"];
    // Prefer items written for this stage, widening to neighbouring levels
    // until the pool is big enough to avoid repeating the same question.
    const MIN_POOL = 4;
    let pool: BankItem[] = [];
    for (let spread = 0; spread <= 4 && pool.length < MIN_POOL; spread++) {
      pool = bank.filter((i) => Math.abs(i.level - stage) <= spread);
    }
    if (pool.length === 0) pool = bank;
    const item = rng.pick(pool);
    return mcQ({
      instruction: item.instruction,
      prompt: item.prompt,
      choices: mcChoices(rng, item.answer, item.distractors),
      answer: item.answer,
      hint: item.hint,
      steps: item.steps,
      concept: item.concept,
      verify: () => !item.distractors.includes(item.answer),
    });
  },
};

export const dataFamilies = {
  "read-graph": readGraph,
  "central-tendency": centralTendency,
  probability,
  "counting-principle": countingPrinciple,
  "scatter-correlation": scatterCorrelation,
  "mc-bank": mcBank,
} satisfies Record<string, GeneratorFamily>;
