import type { GeneratorFamily, RawQuestion, Rng } from "../types";
import { inputQ, mcQ, mcChoices, pickName } from "./helpers";

const str = (p: Record<string, unknown>, key: string, dflt: string): string =>
  typeof p[key] === "string" ? (p[key] as string) : dflt;

/* ---------------------------------------------------------- length-compare */
/**
 * Grade-1 direct comparison and non-standard units. Structural climb:
 * compare two -> compare three -> measure in units -> difference in units
 * -> reason about unit size.
 */
const LC_ITEMS = ["ribbon", "straw", "pencil", "rope", "stick", "scarf"] as const;
const bar = (n: number) => "▬".repeat(n);

const lengthCompare: GeneratorFamily = {
  stageLabel: (s, st) =>
    [
      "Longer or shorter",
      "Compare three lengths",
      "Measure with units",
      "How much longer",
      "Thinking about units",
    ][st - 1],
  generate(skill, stage, rng): RawQuestion {
    if (stage === 1) {
      const [a, b] = rng.sample([2, 3, 4, 5, 6, 7, 8], 2);
      const item = rng.pick(LC_ITEMS);
      const askLonger = rng.chance(0.5);
      const answer = askLonger ? (a > b ? "A" : "B") : a < b ? "A" : "B";
      return mcQ({
        instruction: `Which ${item} is ${askLonger ? "longer" : "shorter"}?`,
        prompt: `A: ${bar(a)}\nB: ${bar(b)}`,
        choices: mcChoices(rng, answer, ["A", "B", "They are the same"].filter((c) => c !== answer)),
        answer,
        hint: askLonger ? "The longer one reaches further." : "The shorter one stops sooner.",
        steps: [
          `A is ${a} units long and B is ${b} units long.`,
          `${a > b ? "A" : "B"} is longer, so ${answer} is the ${askLonger ? "longer" : "shorter"} one.`,
        ],
        concept: "Line lengths up at the same start to compare them.",
        representation: "visual",
        verify: () => (askLonger ? (a > b ? "A" : "B") : a < b ? "A" : "B") === answer,
      });
    }
    if (stage === 2) {
      const lens = rng.sample([2, 3, 4, 5, 6, 7, 8, 9], 3);
      const labels = ["A", "B", "C"];
      const askLongest = rng.chance(0.5);
      const target = askLongest ? Math.max(...lens) : Math.min(...lens);
      const answer = labels[lens.indexOf(target)];
      return mcQ({
        instruction: `Which one is the ${askLongest ? "longest" : "shortest"}?`,
        prompt: labels.map((l, i) => `${l}: ${bar(lens[i])}`).join("\n"),
        choices: mcChoices(rng, answer, labels.filter((l) => l !== answer)),
        answer,
        hint: askLongest ? "Look for the one that reaches furthest." : "Look for the one that stops soonest.",
        steps: [
          labels.map((l, i) => `${l} is ${lens[i]} units`).join(", ") + ".",
          `The ${askLongest ? "largest" : "smallest"} is ${target}, so the answer is ${answer}.`,
        ],
        concept: "Comparing three lengths means finding the biggest or smallest measure.",
        representation: "visual",
        verify: () => lens[labels.indexOf(answer)] === target,
      });
    }
    if (stage === 3) {
      const n = rng.int(3, 9);
      const item = rng.pick(LC_ITEMS);
      return inputQ({
        instruction: `How many paper clips long is the ${item}?`,
        prompt: "📎".repeat(n),
        answer: String(n),
        hint: "Count the paper clips one at a time.",
        steps: [`Count each paper clip: there are ${n}.`, `So the ${item} is ${n} paper clips long.`],
        concept: "We can measure length by repeating a unit with no gaps.",
        representation: "visual",
        verify: () => "📎".repeat(n).length / "📎".length === n,
      });
    }
    if (stage === 4) {
      const a = rng.int(5, 11);
      const b = rng.int(2, a - 1);
      return inputQ({
        instruction: "How many more cubes long is A than B?",
        prompt: `A: ${"🟦".repeat(a)}\nB: ${"🟦".repeat(b)}`,
        answer: String(a - b),
        hint: `Count A, count B, then subtract: ${a} − ${b}.`,
        steps: [`A is ${a} cubes and B is ${b} cubes.`, `${a} − ${b} = ${a - b} cubes longer.`],
        concept: "Comparing measures means subtracting one from the other.",
        representation: "visual",
        verify: () => b + (a - b) === a,
      });
    }
    const name = pickName(rng);
    const answer = "the number of paper clips";
    return mcQ({
      instruction: "Choose the best answer.",
      prompt: `${name} measures the same desk twice: once with paper clips and once with pencils. A pencil is longer than a paper clip.\nWhich number will be bigger?`,
      choices: mcChoices(rng, answer, ["the number of pencils", "they will be exactly the same", "you cannot tell"]),
      answer,
      hint: "Smaller units have to be repeated more times to cover the same length.",
      steps: [
        "The desk length never changes — only the unit changes.",
        "A paper clip is shorter, so it takes more of them to cover the desk.",
        "So the paper clip count is bigger.",
      ],
      concept: "The smaller the unit, the more units it takes to measure the same length.",
    });
  },
};

/* ------------------------------------------------------------ measure-units */
/**
 * Choosing and reading standard units. `dim` selects length | mass | capacity.
 * Climb: pick the unit -> read from zero -> read with an offset -> estimate
 * -> combine measures in a problem.
 */
interface UnitTier {
  unit: string;
  objects: string[];
}
const DIMS: Record<string, { tiers: UnitTier[]; scaleUnit: string; step: number; foils: string[] }> = {
  length: {
    tiers: [
      { unit: "mm", objects: ["an ant", "a fingernail", "the thickness of a coin"] },
      { unit: "cm", objects: ["a pencil", "a crayon", "a shoe", "a spoon"] },
      { unit: "m", objects: ["a classroom", "a car", "a bed", "a ladder"] },
      { unit: "km", objects: ["the distance between two cities", "a long river", "a marathon"] },
    ],
    scaleUnit: "cm",
    step: 1,
    foils: ["g", "kg", "mL", "L"],
  },
  mass: {
    tiers: [
      { unit: "g", objects: ["an apple", "a letter", "a pencil", "a coin"] },
      { unit: "kg", objects: ["a person", "a bag of rice", "a dog", "a bicycle"] },
    ],
    scaleUnit: "g",
    step: 50,
    foils: ["cm", "m", "mL", "L"],
  },
  capacity: {
    tiers: [
      { unit: "mL", objects: ["a spoonful of medicine", "a small juice box", "a cup of water"] },
      { unit: "L", objects: ["a bucket", "a fish tank", "a watering can"] },
    ],
    scaleUnit: "mL",
    step: 100,
    foils: ["g", "kg", "cm", "m"],
  },
};

const measureUnits: GeneratorFamily = {
  stageLabel: (s, st) =>
    ["Choose the unit", "Read the scale", "Start at any mark", "Estimate", "Measure in problems"][st - 1],
  generate(skill, stage, rng): RawQuestion {
    const dim = str(skill.params, "dim", "length");
    const cfg = DIMS[dim] ?? DIMS.length;
    const verb = dim === "length" ? "measure the length of" : dim === "mass" ? "measure the mass of" : "measure how much liquid fits in";

    if (stage === 1 || stage === 4) {
      const ti = rng.int(0, cfg.tiers.length - 1);
      const tier = cfg.tiers[ti];
      const obj = rng.pick(tier.objects);
      // Other tiers first, then cross-dimension foils so dimensions with only
      // two tiers still reach the three-choice minimum.
      const distractors = [
        ...cfg.tiers.filter((t) => t.unit !== tier.unit).map((t) => t.unit),
        ...cfg.foils,
      ];
      if (stage === 1) {
        return mcQ({
          instruction: `Which unit would you use to ${verb} ${obj}?`,
          prompt: obj,
          choices: mcChoices(rng, tier.unit, distractors),
          answer: tier.unit,
          hint: "Small things use small units; large things use large units.",
          steps: [
            `${obj.charAt(0).toUpperCase() + obj.slice(1)} is best measured in ${tier.unit}.`,
            "Choosing a sensible unit keeps the number easy to say.",
          ],
          concept: "Match the size of the unit to the size of the object.",
          verify: () => cfg.tiers.some((t) => t.unit === tier.unit && t.objects.includes(obj)),
        });
      }
      const value = ti === cfg.tiers.length - 1 ? rng.int(2, 40) : rng.int(2, 30);
      const wrong = [value * 10, value * 100, Math.max(1, Math.round(value / 10))];
      return mcQ({
        instruction: `About how much is this? Choose the most sensible estimate.`,
        prompt: `${obj.charAt(0).toUpperCase() + obj.slice(1)}`,
        choices: mcChoices(
          rng,
          `${value} ${tier.unit}`,
          wrong.map((w) => `${w} ${tier.unit}`)
        ),
        answer: `${value} ${tier.unit}`,
        hint: `Picture ${obj} and think how many ${tier.unit} that is.`,
        steps: [
          `A sensible size for ${obj} is about ${value} ${tier.unit}.`,
          "The other choices are ten or a hundred times too big or too small.",
        ],
        concept: "Good estimates come from comparing with sizes you already know.",
      });
    }

    if (stage === 2) {
      const end = rng.int(3, 12);
      return inputQ({
        instruction: `How long is the ribbon in ${cfg.scaleUnit === "cm" ? "centimetres" : cfg.scaleUnit}?`,
        prompt:
          dim === "length"
            ? `The ribbon starts at the 0 mark and ends at the ${end} mark.\n0 —— ${end}`
            : `The pointer starts at 0 and stops at ${end * cfg.step} ${cfg.scaleUnit}.`,
        answer: String(dim === "length" ? end : end * cfg.step),
        answerHint: dim === "length" ? `number of ${cfg.scaleUnit}` : cfg.scaleUnit,
        hint: "When you start at 0, the end mark is the measurement.",
        steps: [
          `It starts at 0 and ends at ${dim === "length" ? end : end * cfg.step}.`,
          `So the measure is ${dim === "length" ? end : end * cfg.step} ${cfg.scaleUnit}.`,
        ],
        concept: "Measuring from 0 means you can read the answer straight off the scale.",
        verify: () => (dim === "length" ? end - 0 === end : end * cfg.step - 0 === end * cfg.step),
      });
    }

    if (stage === 3) {
      const start = rng.int(1, 5);
      const len = rng.int(3, 9);
      const end = start + len;
      const unitMul = dim === "length" ? 1 : cfg.step;
      return inputQ({
        instruction: `How long is the object in ${cfg.scaleUnit}?`,
        prompt: `It starts at the ${start * unitMul} mark and ends at the ${end * unitMul} mark.`,
        answer: String(len * unitMul),
        answerHint: cfg.scaleUnit,
        hint: `Subtract the start from the end: ${end * unitMul} − ${start * unitMul}.`,
        steps: [
          "When measuring does not start at 0, subtract the start mark.",
          `${end * unitMul} − ${start * unitMul} = ${len * unitMul} ${cfg.scaleUnit}.`,
        ],
        concept: "Length is the difference between the end and start marks.",
        verify: () => start * unitMul + len * unitMul === end * unitMul,
      });
    }

    const name = pickName(rng);
    const unit = cfg.tiers[Math.min(1, cfg.tiers.length - 1)].unit;
    const a = rng.int(12, 60);
    const b = rng.int(5, 40);
    const together = rng.chance(0.5);
    return inputQ({
      instruction: "Solve the problem.",
      prompt: together
        ? `${name} has two pieces measuring ${a} ${unit} and ${b} ${unit}.\nWhat is the total?`
        : `${name} has ${a} ${unit} and uses ${b} ${unit}.\nHow much is left?`,
      answer: String(together ? a + b : a - b),
      answerHint: unit,
      hint: together ? "Add the two measures." : "Subtract what was used.",
      steps: together
        ? [`${a} + ${b} = ${a + b} ${unit}.`]
        : [`${a} − ${b} = ${a - b} ${unit}.`],
      concept: "Measures with the same unit can be added or subtracted directly.",
      verify: () => (together ? a + b - b === a : a - b + b === a),
    });
  },
};

/* -------------------------------------------------------------------- time */
/**
 * `kind` selects clock | half-hour | calendar | elapsed | mixed.
 * Clock climb: o'clock -> half past -> quarter -> five minutes -> problems.
 */
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;
const MONTH_DAYS: Record<string, number> = {
  January: 31, February: 28, March: 31, April: 30, May: 31, June: 30,
  July: 31, August: 31, September: 30, October: 31, November: 30, December: 31,
};

const clockFace = (h: number, m: number) =>
  `The hour hand is ${m === 0 ? `on the ${h}` : `just past the ${h}`} and the minute hand is on the ${m === 0 ? 12 : m / 5}.`;

const fmtTime = (h: number, m: number) => `${h}:${String(m).padStart(2, "0")}`;

const timeAccept = (h: number, m: number): string[] => {
  const base = fmtTime(h, m);
  const out = [base, `${h}.${String(m).padStart(2, "0")}`];
  if (m === 0) out.push(String(h), `${h} o'clock`, `${h} oclock`);
  if (m === 30) out.push(`half past ${h}`);
  if (m === 15) out.push(`quarter past ${h}`);
  if (m === 45) out.push(`quarter to ${h + 1 > 12 ? 1 : h + 1}`);
  return out;
};

function clockQuestion(stage: number, rng: Rng, forceHalf: boolean): RawQuestion {
  const h = rng.int(1, 12);
  const m = forceHalf
    ? rng.pick([0, 30])
    : stage === 1
    ? 0
    : stage === 2
    ? rng.pick([0, 30])
    : stage === 3
    ? rng.pick([0, 15, 30, 45])
    : rng.pick([0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]);
  return inputQ({
    instruction: "What time does the clock show?",
    prompt: clockFace(h, m),
    answer: fmtTime(h, m),
    answerFormat: "text",
    accept: timeAccept(h, m),
    answerHint: "like 3:30",
    hint: "The hour hand gives the hour; the minute hand counts by 5s.",
    steps: [
      `The hour hand is at ${h}, so the hour is ${h}.`,
      m === 0
        ? "The minute hand is on 12, so it is exactly o'clock."
        : `The minute hand is on ${m / 5}, and ${m / 5} × 5 = ${m} minutes.`,
      `The time is ${fmtTime(h, m)}.`,
    ],
    concept: "Read the hour first, then count the minutes in fives.",
    verify: () => m % 5 === 0 && h >= 1 && h <= 12,
  });
}

function elapsedQuestion(stage: number, rng: Rng): RawQuestion {
  if (stage <= 2) {
    const sh = rng.int(1, 9);
    const dur = stage === 1 ? rng.int(1, 4) : rng.pick([1, 2, 3]);
    const half = stage === 2 && rng.chance(0.5);
    const mins = dur * 60 + (half ? 30 : 0);
    return inputQ({
      instruction: "How many minutes is that?",
      prompt: `A film starts at ${fmtTime(sh, 0)} and ends at ${fmtTime(sh + dur, half ? 30 : 0)}.`,
      answer: String(mins),
      answerHint: "minutes",
      hint: "Each whole hour is 60 minutes.",
      steps: [
        `From ${fmtTime(sh, 0)} to ${fmtTime(sh + dur, 0)} is ${dur} hour${dur === 1 ? "" : "s"} = ${dur * 60} minutes.`,
        ...(half ? [`Then 30 more minutes: ${dur * 60} + 30 = ${mins}.`] : []),
      ],
      concept: "Elapsed time counts forward from the start to the end.",
      verify: () => dur * 60 + (half ? 30 : 0) === mins,
    });
  }
  if (stage === 3) {
    const sh = rng.int(1, 10);
    const sm = rng.pick([15, 20, 40, 45, 50]);
    const dur = rng.pick([20, 25, 30, 35, 40]);
    const total = sm + dur;
    const eh = sh + Math.floor(total / 60);
    const em = total % 60;
    return inputQ({
      instruction: "How many minutes pass?",
      prompt: `A lesson runs from ${fmtTime(sh, sm)} to ${fmtTime(eh, em)}.`,
      answer: String(dur),
      answerHint: "minutes",
      hint: "Count up to the next o'clock first, then add the rest.",
      steps: [
        `From ${fmtTime(sh, sm)} to ${fmtTime(sh + 1, 0)} is ${60 - sm} minutes.`,
        `From ${fmtTime(sh + 1, 0)} to ${fmtTime(eh, em)} is ${dur - (60 - sm)} minutes.`,
        `${60 - sm} + ${dur - (60 - sm)} = ${dur} minutes.`,
      ],
      concept: "Crossing the hour is easier if you stop at the o'clock on the way.",
      verify: () => sm + dur === (eh - sh) * 60 + em,
    });
  }
  if (stage === 4) {
    const sh = rng.int(1, 9);
    const sm = rng.pick([0, 15, 30, 45]);
    const dur = rng.pick([30, 45, 60, 90]);
    const total = sm + dur;
    const eh = sh + Math.floor(total / 60);
    const em = total % 60;
    return inputQ({
      instruction: "What time does it finish?",
      prompt: `Practice starts at ${fmtTime(sh, sm)} and lasts ${dur} minutes.`,
      answer: fmtTime(eh, em),
      answerFormat: "text",
      accept: timeAccept(eh, em),
      answerHint: "like 3:30",
      hint: "Add the hours first, then the leftover minutes.",
      steps: [
        `${dur} minutes is ${Math.floor(dur / 60)} hour${Math.floor(dur / 60) === 1 ? "" : "s"} and ${dur % 60} minutes.`,
        `${fmtTime(sh, sm)} plus that time is ${fmtTime(eh, em)}.`,
      ],
      concept: "To find an end time, add the duration to the start time.",
      verify: () => (eh - sh) * 60 + em - sm === dur,
    });
  }
  const name = pickName(rng);
  const sh = rng.int(3, 9);
  const dur = rng.pick([45, 60, 75, 90]);
  const total = dur;
  const eh = sh + Math.floor(total / 60);
  const em = total % 60;
  return inputQ({
    instruction: "Solve the problem.",
    prompt: `${name} starts homework at ${fmtTime(sh, 0)} and finishes at ${fmtTime(eh, em)}.\nHow many minutes did it take?`,
    answer: String(dur),
    answerHint: "minutes",
    hint: "Count the whole hours, then the extra minutes.",
    steps: [
      `From ${fmtTime(sh, 0)} to ${fmtTime(eh, 0)} is ${(eh - sh) * 60} minutes.`,
      `Then ${em} more minutes gives ${dur} minutes in total.`,
    ],
    concept: "Elapsed time answers how long something lasted.",
    verify: () => (eh - sh) * 60 + em === dur,
  });
}

function calendarQuestion(stage: number, rng: Rng): RawQuestion {
  if (stage === 1) {
    const i = rng.int(0, 6);
    const after = rng.chance(0.5);
    const answer = DAYS[(i + (after ? 1 : 6)) % 7];
    return mcQ({
      instruction: `Which day comes just ${after ? "after" : "before"} ${DAYS[i]}?`,
      prompt: DAYS[i],
      choices: mcChoices(rng, answer, rng.shuffle(DAYS.filter((d) => d !== answer && d !== DAYS[i])).slice(0, 3)),
      answer,
      hint: "Say the days of the week in order.",
      steps: [`The days run ${DAYS.join(", ")}.`, `Just ${after ? "after" : "before"} ${DAYS[i]} is ${answer}.`],
      concept: "The days of the week always repeat in the same order.",
      verify: () => DAYS[(DAYS.indexOf(answer) + (after ? 6 : 1)) % 7] === DAYS[i],
    });
  }
  if (stage === 2) {
    const weeks = rng.int(1, 6);
    const FACTS = [
      { q: `${weeks} week${weeks === 1 ? "" : "s"} = ___ days`, instr: `How many days are in ${weeks} week${weeks === 1 ? "" : "s"}?`, a: weeks * 7, hint: "Each week has 7 days.", step: `${weeks} × 7 = ${weeks * 7} days.` },
      { q: "1 year = ___ months", instr: "How many months are in a year?", a: 12, hint: "Count January through December.", step: "There are 12 months: January to December." },
      { q: "1 day = ___ hours", instr: "How many hours are in a day?", a: 24, hint: "Count from midnight to midnight.", step: "A full day is 24 hours." },
      { q: "1 fortnight = ___ days", instr: "How many days are in a fortnight?", a: 14, hint: "A fortnight is two weeks.", step: "2 × 7 = 14 days." },
      { q: "1 year = ___ weeks", instr: "About how many weeks are in a year?", a: 52, hint: "365 days shared into weeks of 7.", step: "365 ÷ 7 is about 52 weeks." },
      { q: "half a year = ___ months", instr: "How many months are in half a year?", a: 6, hint: "Half of 12.", step: "12 ÷ 2 = 6 months." },
    ];
    const f = rng.pick(FACTS);
    return inputQ({
      instruction: f.instr,
      prompt: f.q,
      answer: String(f.a),
      hint: f.hint,
      steps: [f.step],
      concept: "Calendars are built from fixed-size groups of days, weeks and months.",
      verify: () => f.a > 0 && DAYS.length === 7 && MONTHS.length === 12,
    });
  }
  if (stage === 3) {
    const i = rng.int(0, 11);
    const answer = MONTHS[i];
    return mcQ({
      instruction: `Which month is month number ${i + 1}?`,
      prompt: `Month ${i + 1} of the year`,
      choices: mcChoices(rng, answer, rng.shuffle(MONTHS.filter((m) => m !== answer)).slice(0, 3)),
      answer,
      hint: "Count the months from January.",
      steps: [`Counting from January, month ${i + 1} is ${answer}.`],
      concept: "Each month has a fixed position in the year.",
      verify: () => MONTHS.indexOf(answer) === i,
    });
  }
  if (stage === 4) {
    const i = rng.int(0, 6);
    const add = rng.int(2, 6);
    const answer = DAYS[(i + add) % 7];
    return mcQ({
      instruction: `What day is it ${add} days after ${DAYS[i]}?`,
      prompt: `${add} days after ${DAYS[i]}`,
      choices: mcChoices(rng, answer, rng.shuffle(DAYS.filter((d) => d !== answer)).slice(0, 3)),
      answer,
      hint: "Count forward one day at a time.",
      steps: [`Start at ${DAYS[i]} and count ${add} days forward.`, `That lands on ${answer}.`],
      concept: "After 7 days you return to the same weekday.",
      verify: () => (DAYS.indexOf(answer) - i + 7) % 7 === add % 7,
    });
  }
  const month = rng.pick(MONTHS.filter((m) => m !== "February"));
  const days = MONTH_DAYS[month];
  const weeks = rng.int(2, 5);
  const askWeeks = rng.chance(0.5);
  return inputQ({
    instruction: "Solve the problem.",
    prompt: askWeeks
      ? `How many days are there in ${weeks} weeks?`
      : `How many days are in ${month}?`,
    answer: String(askWeeks ? weeks * 7 : days),
    answerHint: "days",
    hint: askWeeks ? "Each week has 7 days." : "Most months have 30 or 31 days.",
    steps: askWeeks
      ? [`${weeks} × 7 = ${weeks * 7} days.`]
      : [`${month} has ${days} days.`],
    concept: "Weeks, months and years are fixed-size groups of days.",
    verify: () => (askWeeks ? (weeks * 7) / 7 === weeks : MONTH_DAYS[month] === days),
  });
}

const time: GeneratorFamily = {
  stageLabel: (s, st) => {
    const kind = typeof s.params.kind === "string" ? s.params.kind : "clock";
    if (kind === "calendar")
      return ["Days of the week", "Weeks and months", "Months in order", "Counting days", "Calendar problems"][st - 1];
    if (kind === "elapsed")
      return ["Whole hours", "Half hours", "Across the hour", "Find the end time", "Elapsed time problems"][st - 1];
    if (kind === "half-hour")
      return ["O'clock", "Half past", "O'clock and half past", "Half hours forward", "Half-hour problems"][st - 1];
    return ["O'clock", "Half past", "Quarter past and to", "Five-minute times", "Time problems"][st - 1];
  },
  generate(skill, stage, rng): RawQuestion {
    const kind = str(skill.params, "kind", "clock");
    if (kind === "calendar") return calendarQuestion(stage, rng);
    if (kind === "elapsed") return elapsedQuestion(stage, rng);
    if (kind === "half-hour") {
      if (stage >= 4) return elapsedQuestion(Math.min(stage - 2, 5), rng);
      return clockQuestion(stage, rng, true);
    }
    if (kind === "mixed") {
      const pickKind = rng.pick(["clock", "elapsed", "calendar"]);
      if (pickKind === "elapsed") return elapsedQuestion(stage, rng);
      if (pickKind === "calendar") return calendarQuestion(stage, rng);
      return clockQuestion(stage, rng, false);
    }
    if (stage === 5) return elapsedQuestion(4, rng);
    return clockQuestion(stage, rng, false);
  },
};

/* -------------------------------------------------------- unit-conversion */
/**
 * Metric conversion with exact integer results only. Climb:
 * ×10 and ×100 -> ×1000 -> smaller-to-larger (divide) -> both ways with
 * bigger numbers -> two-step and comparison.
 */
interface ConvRule {
  big: string;
  small: string;
  factor: number;
}
const CONV: ConvRule[] = [
  { big: "cm", small: "mm", factor: 10 },
  { big: "m", small: "cm", factor: 100 },
  { big: "km", small: "m", factor: 1000 },
  { big: "kg", small: "g", factor: 1000 },
  { big: "L", small: "mL", factor: 1000 },
];

const unitConversion: GeneratorFamily = {
  stageLabel: (s, st) =>
    [
      "Multiply by 10 and 100",
      "Multiply by 1000",
      "Convert back by dividing",
      "Both directions",
      "Two steps and comparing",
    ][st - 1],
  generate(skill, stage, rng): RawQuestion {
    const rule =
      stage === 1
        ? rng.pick(CONV.filter((c) => c.factor <= 100))
        : stage === 2
        ? rng.pick(CONV.filter((c) => c.factor === 1000))
        : rng.pick(CONV);

    if (stage === 1 || stage === 2) {
      const v = rng.int(2, stage === 1 ? 20 : 9);
      return inputQ({
        instruction: "Convert the measurement.",
        prompt: `${v} ${rule.big} = ___ ${rule.small}`,
        answer: String(v * rule.factor),
        answerHint: rule.small,
        hint: `1 ${rule.big} = ${rule.factor} ${rule.small}, so multiply by ${rule.factor}.`,
        steps: [
          `1 ${rule.big} = ${rule.factor} ${rule.small}.`,
          `${v} × ${rule.factor} = ${v * rule.factor} ${rule.small}.`,
        ],
        concept: "Going to a smaller unit gives a bigger number, so multiply.",
        verify: () => (v * rule.factor) / rule.factor === v,
      });
    }

    if (stage === 3) {
      const v = rng.int(2, 12);
      const total = v * rule.factor;
      return inputQ({
        instruction: "Convert the measurement.",
        prompt: `${total} ${rule.small} = ___ ${rule.big}`,
        answer: String(v),
        answerHint: rule.big,
        hint: `1 ${rule.big} = ${rule.factor} ${rule.small}, so divide by ${rule.factor}.`,
        steps: [
          `1 ${rule.big} = ${rule.factor} ${rule.small}.`,
          `${total} ÷ ${rule.factor} = ${v} ${rule.big}.`,
        ],
        concept: "Going to a larger unit gives a smaller number, so divide.",
        verify: () => v * rule.factor === total,
      });
    }

    if (stage === 4) {
      const toSmall = rng.chance(0.5);
      const v = rng.int(3, 25);
      return inputQ({
        instruction: "Convert the measurement.",
        prompt: toSmall
          ? `${v} ${rule.big} = ___ ${rule.small}`
          : `${v * rule.factor} ${rule.small} = ___ ${rule.big}`,
        answer: String(toSmall ? v * rule.factor : v),
        answerHint: toSmall ? rule.small : rule.big,
        hint: toSmall
          ? `Multiply by ${rule.factor} to reach the smaller unit.`
          : `Divide by ${rule.factor} to reach the larger unit.`,
        steps: [
          `1 ${rule.big} = ${rule.factor} ${rule.small}.`,
          toSmall
            ? `${v} × ${rule.factor} = ${v * rule.factor} ${rule.small}.`
            : `${v * rule.factor} ÷ ${rule.factor} = ${v} ${rule.big}.`,
        ],
        concept: "Multiply going down a unit size; divide going up.",
        verify: () => (toSmall ? (v * rule.factor) / rule.factor === v : v * rule.factor === v * rule.factor),
      });
    }

    // Stage 5: two-step conversion, or compare across units.
    if (rng.chance(0.5)) {
      const v = rng.int(2, 9);
      return inputQ({
        instruction: "Convert the measurement.",
        prompt: `${v} m = ___ mm`,
        answer: String(v * 1000),
        answerHint: "mm",
        hint: "First change metres to centimetres, then centimetres to millimetres.",
        steps: [
          `${v} m = ${v * 100} cm because 1 m = 100 cm.`,
          `${v * 100} cm = ${v * 1000} mm because 1 cm = 10 mm.`,
        ],
        concept: "Two conversions can be chained one after the other.",
        verify: () => v * 100 * 10 === v * 1000,
      });
    }
    const bigVal = rng.int(2, 8);
    const smallVal = rng.int(1, bigVal * rule.factor - 1);
    const bigAsSmall = bigVal * rule.factor;
    const answer = bigAsSmall > smallVal ? `${bigVal} ${rule.big}` : `${smallVal} ${rule.small}`;
    return mcQ({
      instruction: "Which measurement is larger?",
      prompt: `${bigVal} ${rule.big}  or  ${smallVal} ${rule.small}`,
      choices: mcChoices(rng, answer, [
        answer === `${bigVal} ${rule.big}` ? `${smallVal} ${rule.small}` : `${bigVal} ${rule.big}`,
        "They are equal",
        "You cannot compare them",
      ]),
      answer,
      hint: "Change both to the same unit before comparing.",
      steps: [
        `${bigVal} ${rule.big} = ${bigAsSmall} ${rule.small}.`,
        `Compare ${bigAsSmall} ${rule.small} with ${smallVal} ${rule.small}.`,
        `So ${answer} is larger.`,
      ],
      concept: "You can only compare measurements once they share a unit.",
      verify: () => (bigAsSmall > smallVal ? answer === `${bigVal} ${rule.big}` : answer === `${smallVal} ${rule.small}`),
    });
  },
};

export const measurementFamilies = {
  "length-compare": lengthCompare,
  "measure-units": measureUnits,
  time,
  "unit-conversion": unitConversion,
} satisfies Record<string, GeneratorFamily>;
