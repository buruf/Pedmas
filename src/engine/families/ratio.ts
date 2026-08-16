import type { GeneratorFamily, RawQuestion, Rng } from "../types";
import { inputQ, mcQ, mcChoices, pickName, pickObject } from "./helpers";

function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

/** Exact decimal string for `units` × 10^-places (integer math only). */
function fmtU(units: number, places: number): string {
  const neg = units < 0 ? "-" : "";
  const u = Math.abs(units);
  if (places === 0) return neg + String(u);
  const p = 10 ** places;
  const whole = Math.floor(u / p);
  const frac = String(u % p)
    .padStart(places, "0")
    .replace(/0+$/, "");
  return frac ? `${neg}${whole}.${frac}` : `${neg}${whole}`;
}

/** "$4.50" for integer cents. */
function moneyDisp(cents: number): string {
  return `$${Math.floor(cents / 100)}.${String(cents % 100).padStart(2, "0")}`;
}
function moneyAns(cents: number): string {
  return `${Math.floor(cents / 100)}.${String(cents % 100).padStart(2, "0")}`;
}

/** A ratio pair a:b in lowest terms with a ≠ b. */
function simplestPair(rng: Rng, max: number): [number, number] {
  for (let i = 0; i < 60; i++) {
    const a = rng.int(1, max);
    const b = rng.int(1, max);
    if (a !== b && gcd(a, b) === 1) return [a, b];
  }
  return [2, 3];
}

const ratioAccepts = (a: number, b: number): string[] => [`${a} to ${b}`, `${a}/${b}`];

/* --------------------------------------------------------------- ratio-basic */
const ratioBasic: GeneratorFamily = {
  stageLabel: (s, st) =>
    ["Write a ratio", "Simplest form", "Part-to-whole", "Use a ratio", "Share in a ratio"][st - 1],
  generate(skill, stage, rng): RawQuestion {
    if (stage === 1) {
      const [obj1, obj2] = [pickObject(rng), pickObject(rng)];
      const o2 = obj2 === obj1 ? "buttons" : obj2;
      const a = rng.int(2, 9);
      let b = rng.int(2, 9);
      if (b === a) b = a === 9 ? 8 : a + 1;
      const g1 = gcd(a, b);
      return inputQ({
        instruction: "Write the ratio.",
        prompt: `A box holds ${a} ${obj1} and ${b} ${o2}. What is the ratio of ${obj1} to ${o2}?`,
        answer: `${a}:${b}`,
        accept: [
          ...ratioAccepts(a, b),
          ...(g1 > 1 ? [`${a / g1}:${b / g1}`, ...ratioAccepts(a / g1, b / g1)] : []),
        ],
        answerFormat: "text",
        answerHint: "e.g. 3:5",
        hint: `The ratio lists ${obj1} first because they were asked for first.`,
        steps: [
          `${obj1} count: ${a}. ${o2} count: ${b}.`,
          `Order matters — ${obj1} first: ${a}:${b}.`,
        ],
        concept: "A ratio compares two quantities in a stated order.",
        representation: "word",
        verify: () => a !== b,
      });
    }
    if (stage === 2) {
      const [a, b] = simplestPair(rng, 6);
      const k = rng.int(2, 6);
      return inputQ({
        instruction: "Write the ratio in simplest form.",
        prompt: `${a * k}:${b * k}`,
        answer: `${a}:${b}`,
        accept: ratioAccepts(a, b),
        answerFormat: "text",
        answerHint: "e.g. 2:3",
        hint: `Both numbers share the factor ${k} — divide it out.`,
        steps: [
          `GCF of ${a * k} and ${b * k} is ${k}.`,
          `Divide both sides by ${k}: ${a * k}:${b * k} = ${a}:${b}.`,
        ],
        concept: "Simplifying a ratio works exactly like simplifying a fraction.",
        verify: () => gcd(a, b) === 1 && a * k * b === b * k * a,
      });
    }
    if (stage === 3) {
      const [a, b] = simplestPair(rng, 5);
      const k = rng.int(1, 4);
      const red = a * k;
      const blue = b * k;
      const whole = red + blue;
      const g = gcd(red, whole);
      return inputQ({
        instruction: "Write the ratio in simplest form.",
        prompt: `A bag has ${red} red marble${red > 1 ? "s" : ""} and ${blue} blue marble${blue > 1 ? "s" : ""}. What is the ratio of red marbles to ALL the marbles?`,
        answer: `${red / g}:${whole / g}`,
        accept: ratioAccepts(red / g, whole / g),
        answerFormat: "text",
        answerHint: "e.g. 2:5",
        hint: `First find the total number of marbles: ${red} + ${blue}.`,
        steps: [
          `Total marbles: ${red} + ${blue} = ${whole}.`,
          `Red to all: ${red}:${whole}.`,
          `Simplify by dividing both by ${g}: ${red / g}:${whole / g}.`,
        ],
        concept: "Part-to-whole ratios compare one part against everything.",
        representation: "word",
        verify: () => red + blue === whole && gcd(red / g, whole / g) === 1,
      });
    }
    if (stage === 4) {
      const [a, b] = simplestPair(rng, 6);
      const k = rng.int(2, 8);
      const name = pickName(rng);
      return inputQ({
        instruction: "Use the ratio.",
        prompt: `In ${name}'s class the ratio of girls to boys is ${a}:${b}. There are ${a * k} girls. How many boys are there?`,
        answer: String(b * k),
        hint: `${a * k} girls is ${k} groups of ${a} — boys come in matching groups of ${b}.`,
        steps: [
          `${a * k} ÷ ${a} = ${k}, so the ratio is scaled by ${k}.`,
          `Boys: ${b} × ${k} = ${b * k}.`,
          `Check: ${a * k}:${b * k} simplifies back to ${a}:${b}. ✓`,
        ],
        concept: "Both sides of a ratio scale by the same factor.",
        representation: "word",
        verify: () => (a * k) * b === (b * k) * a,
      });
    }
    const [a, b] = simplestPair(rng, 5);
    const k = rng.int(2, 9);
    const total = (a + b) * k;
    const name = pickName(rng);
    const first = rng.chance(0.5);
    const share = (first ? a : b) * k;
    return inputQ({
      instruction: "Share in the given ratio.",
      prompt: `${name} and a friend share $${total} in the ratio ${a}:${b}. ${name} gets the ${first ? "first" : "second"} share. How much does ${name} get?`,
      answer: String(share),
      answerHint: "dollars, e.g. 24",
      hint: `The ratio ${a}:${b} splits the money into ${a + b} equal parts.`,
      steps: [
        `Total parts: ${a} + ${b} = ${a + b}.`,
        `Each part: ${total} ÷ ${a + b} = ${k}.`,
        `${name}'s share: ${first ? a : b} × ${k} = $${share}.`,
      ],
      concept: "Sharing in a ratio means splitting into equal parts first.",
      representation: "word",
      verify: () => a * k + b * k === total,
    });
  },
};

/* ---------------------------------------------------------- ratio-equivalent */
const ratioEquivalent: GeneratorFamily = {
  stageLabel: (s, st) =>
    ["Double the ratio", "Missing value", "Ratio tables", "Spot the equivalent", "Scale a recipe"][st - 1],
  generate(skill, stage, rng): RawQuestion {
    if (stage === 1 || stage === 2) {
      const [a, b] = simplestPair(rng, stage === 1 ? 5 : 9);
      const k = stage === 1 ? rng.pick([2, 3] as const) : rng.int(2, 6);
      const hideFirst = stage === 2 && rng.chance(0.5);
      const ans = hideFirst ? a * k : b * k;
      return inputQ({
        instruction: "Find the missing value.",
        prompt: hideFirst ? `${a}:${b} = ?:${b * k}` : `${a}:${b} = ${a * k}:?`,
        answer: String(ans),
        hint: hideFirst
          ? `${b} was multiplied by ${k} — do the same to ${a}.`
          : `${a} was multiplied by ${k} — do the same to ${b}.`,
        steps: [
          hideFirst ? `${b * k} ÷ ${b} = ${k}.` : `${a * k} ÷ ${a} = ${k}.`,
          `Multiply the other side by ${k} too: ${hideFirst ? `${a} × ${k} = ${a * k}` : `${b} × ${k} = ${b * k}`}.`,
        ],
        concept: "Equivalent ratios multiply both sides by the same number.",
        verify: () => (a * k) * b === (b * k) * a,
      });
    }
    if (stage === 3) {
      const [a, b] = simplestPair(rng, 5);
      const ks = [1, 2, 3, rng.int(4, 6)];
      const hideAt = rng.int(2, 3);
      const flourRow = ks.map((k) => String(a * k)).join(", ");
      const milkRow = ks.map((k, i) => (i === hideAt ? "?" : String(b * k))).join(", ");
      const ans = b * ks[hideAt];
      return inputQ({
        instruction: "Complete the ratio table.",
        prompt: `Flour: ${flourRow}\nMilk: ${milkRow}\n(Each column keeps the ratio ${a}:${b}.)`,
        answer: String(ans),
        hint: `The column with the "?" has ${a * ks[hideAt]} flour — how many times ${a} is that?`,
        steps: [
          `${a * ks[hideAt]} ÷ ${a} = ${ks[hideAt]}, so that column is scaled by ${ks[hideAt]}.`,
          `Milk: ${b} × ${ks[hideAt]} = ${ans}.`,
        ],
        concept: "Every column of a ratio table is the same ratio, scaled.",
        representation: "table",
        verify: () => (a * ks[hideAt]) * b === ans * a,
      });
    }
    if (stage === 4) {
      const [a, b] = simplestPair(rng, 7);
      const k = rng.int(2, 5);
      const correct = `${a * k}:${b * k}`;
      const candidates = [
        `${a + k}:${b + k}`,
        `${b}:${a}`,
        `${a * k}:${b * (k + 1)}`,
      ].filter((c) => {
        const [x, y] = c.split(":").map(Number);
        return x * b !== y * a;
      });
      return mcQ({
        instruction: `Which ratio is equivalent to ${a}:${b}?`,
        prompt: "Both sides must be multiplied by the same number.",
        choices: mcChoices(rng, correct, candidates),
        answer: correct,
        hint: "Adding the same number to both sides does NOT keep a ratio equivalent — multiplying does.",
        steps: [
          `${a} × ${k} = ${a * k} and ${b} × ${k} = ${b * k}.`,
          `So ${a}:${b} = ${correct}.`,
          `${a + k}:${b + k} came from adding ${k} — that changes the ratio.`,
        ],
        concept: "Ratios stay equivalent under multiplication, not addition.",
        verify: () => (a * k) * b === (b * k) * a,
      });
    }
    const [a, b] = simplestPair(rng, 5);
    const k1 = rng.int(1, 3);
    const k2 = k1 + rng.int(1, 3);
    const people1 = a * k1 * 2;
    const eggs1 = b * k1 * 2;
    const people2 = a * k2 * 2;
    const eggs2 = b * k2 * 2;
    return inputQ({
      instruction: "Scale the recipe.",
      prompt: `A recipe for ${people1} people uses ${eggs1} eggs. How many eggs are needed for ${people2} people?`,
      answer: String(eggs2),
      hint: `Find the eggs-per-people ratio first, or the scale factor from ${people1} to ${people2}.`,
      steps: [
        `The ratio of people to eggs is ${people1}:${eggs1} = ${a}:${b} in simplest form.`,
        `${people2} ÷ ${a} = ${k2 * 2}, so the ratio is scaled by ${k2 * 2}.`,
        `Eggs: ${b} × ${k2 * 2} = ${eggs2}.`,
      ],
      concept: "Recipes scale by keeping every ingredient in the same ratio.",
      representation: "word",
      verify: () => people1 * eggs2 === people2 * eggs1,
    });
  },
};

/* ----------------------------------------------------------------- unit-rate */
const unitRate: GeneratorFamily = {
  stageLabel: (s, st) =>
    ["Price per item", "Speed", "Unit price with cents", "Better buy", "Use the rate"][st - 1],
  generate(skill, stage, rng): RawQuestion {
    if (stage === 1) {
      const per = rng.int(2, 9);
      const count = rng.int(3, 8);
      const total = per * count;
      const obj = pickObject(rng);
      return inputQ({
        instruction: "Find the unit rate.",
        prompt: `${count} ${obj} cost $${total}. How much does 1 of the ${obj} cost?`,
        answer: String(per),
        answerHint: "dollars, e.g. 3",
        hint: "Divide the total cost by how many there are.",
        steps: [
          `$${total} ÷ ${count} = $${per}.`,
          `Each one costs $${per} — that is the unit rate.`,
        ],
        concept: "A unit rate tells you the amount for exactly one.",
        representation: "word",
        verify: () => per * count === total,
      });
    }
    if (stage === 2) {
      const speed = rng.int(30, 110);
      const hours = rng.int(2, 6);
      const dist = speed * hours;
      return inputQ({
        instruction: "Find the unit rate.",
        prompt: `A train travels ${dist} km in ${hours} hours at a steady speed. How fast is it going, in km per hour?`,
        answer: String(speed),
        answerHint: "km per hour, e.g. 80",
        hint: "Speed is distance for ONE hour: divide distance by time.",
        steps: [
          `${dist} ÷ ${hours} = ${speed}.`,
          `The train covers ${speed} km each hour, so its speed is ${speed} km/h.`,
        ],
        concept: "Speed is a unit rate: distance per one unit of time.",
        representation: "word",
        verify: () => speed * hours === dist,
      });
    }
    if (stage === 3) {
      let per = rng.int(105, 495); // cents per item
      if (per % 5 === 0) per += rng.int(1, 4);
      const count = rng.int(3, 8);
      const total = per * count;
      const obj = pickObject(rng);
      return inputQ({
        instruction: "Find the unit price.",
        prompt: `A pack of ${count} ${obj} costs ${moneyDisp(total)}. What is the price per item?`,
        answer: moneyAns(per),
        answerFormat: "decimal",
        answerHint: "dollars, e.g. 1.45",
        hint: "Work in cents: convert, divide, convert back.",
        steps: [
          `${moneyDisp(total)} = ${total} cents.`,
          `${total} ÷ ${count} = ${per} cents.`,
          `Per item: ${moneyDisp(per)}.`,
        ],
        concept: "Unit prices make different pack sizes comparable.",
        representation: "word",
        verify: () => per * count === total,
      });
    }
    if (stage === 4) {
      const unitA = rng.int(110, 300); // cents per item
      const unitB = unitA + rng.pick([-40, -25, -15, 15, 25, 40] as const);
      const nA = rng.pick([3, 4, 5] as const);
      const nB = rng.pick([6, 8, 10] as const);
      const costA = unitA * nA;
      const costB = unitB * nB;
      const answer = unitA < unitB ? "Pack A" : "Pack B";
      const obj = pickObject(rng);
      const cheap = unitA < unitB ? unitA : unitB;
      const dear = unitA < unitB ? unitB : unitA;
      return mcQ({
        instruction: "Which is the better buy?",
        prompt: `Pack A: ${nA} ${obj} for ${moneyDisp(costA)}. Pack B: ${nB} ${obj} for ${moneyDisp(costB)}.`,
        choices: rng.shuffle(["Pack A", "Pack B", "They cost the same per item"]),
        answer,
        hint: "Find each pack's price per item, then compare.",
        steps: [
          `Pack A: ${moneyDisp(costA)} ÷ ${nA} = ${moneyDisp(unitA)} each.`,
          `Pack B: ${moneyDisp(costB)} ÷ ${nB} = ${moneyDisp(unitB)} each.`,
          `${moneyDisp(cheap)} < ${moneyDisp(dear)}, so ${answer} is the better buy.`,
        ],
        concept: "The better buy is the lower unit price, not the lower sticker price.",
        representation: "word",
        verify: () => (answer === "Pack A") === (costA * nB < costB * nA),
      });
    }
    const name = pickName(rng);
    if (rng.chance(0.5)) {
      const rate = rng.int(9, 25); // dollars per hour
      const hours = rng.int(3, 9);
      const earned = rate * hours;
      return inputQ({
        instruction: "Use the unit rate.",
        prompt: `${name} earns $${rate} per hour. How much does ${name} earn in ${hours} hours?`,
        answer: String(earned),
        answerHint: "dollars, e.g. 96",
        hint: "Multiply the rate by the number of hours.",
        steps: [
          `$${rate} per hour × ${hours} hours = $${earned}.`,
          `The unit rate scales up by multiplying.`,
        ],
        concept: "Once you know the rate for one, multiply for many.",
        representation: "word",
        verify: () => earned / hours === rate,
      });
    }
    const speed = rng.int(40, 100);
    const hours = rng.int(2, 7);
    const dist = speed * hours;
    return inputQ({
      instruction: "Use the unit rate.",
      prompt: `A car travels at a steady ${speed} km per hour. How far does it go in ${hours} hours?`,
      answer: String(dist),
      answerHint: "km, e.g. 240",
      hint: "Distance = speed × time.",
      steps: [
        `${speed} km each hour, for ${hours} hours.`,
        `${speed} × ${hours} = ${dist} km.`,
      ],
      concept: "Rates predict totals: rate × amount of time.",
      representation: "word",
      verify: () => dist / hours === speed,
    });
  },
};

/* ---------------------------------------------------------- proportion-solve */
const proportionSolve: GeneratorFamily = {
  stageLabel: (s, st) =>
    ["Scale up", "Any missing corner", "Cross-multiply", "Word proportions", "Decimal answers"][st - 1],
  generate(skill, stage, rng): RawQuestion {
    if (stage === 4) {
      const [a, b] = simplestPair(rng, 6);
      const k1 = rng.int(1, 3);
      const k2 = k1 + rng.int(1, 4);
      const km1 = a * k1;
      const h1 = b * k1;
      const km2 = a * k2;
      const h2 = b * k2;
      return inputQ({
        instruction: "Solve with a proportion.",
        prompt: `A hiker walks ${km1} km in ${h1} hours. At the same pace, how many km can the hiker walk in ${h2} hours?`,
        answer: String(km2),
        answerHint: "km, e.g. 15",
        hint: `Set up {${km1}/${h1}} = {?/${h2}} and cross-multiply.`,
        steps: [
          `Same pace means the km-to-hours ratio stays fixed: {${km1}/${h1}} = {x/${h2}}.`,
          `Cross-multiply: ${h1} × x = ${km1} × ${h2} = ${km1 * h2}.`,
          `x = ${km1 * h2} ÷ ${h1} = ${km2}.`,
        ],
        concept: "A steady rate lets you solve for any missing amount with a proportion.",
        representation: "word",
        verify: () => km1 * h2 === km2 * h1,
      });
    }
    if (stage === 5) {
      // Construct a half-integer answer: n odd, d even keeps the shown value whole.
      const n = rng.pick([1, 3, 5, 7] as const);
      const d = rng.pick([2, 4, 6, 8] as const);
      const half = 2 * rng.int(1, 4) + 1; // odd => k = half/2 is *.5
      const shown = (d * half) / 2; // integer because d is even
      const xU = n * half * 5; // x in tenths: n * half/2 = n*half*5 tenths
      const x = fmtU(xU, 1);
      return inputQ({
        instruction: "Solve the proportion.",
        prompt: `{x/${shown}} = {${n}/${d}}`,
        answer: x,
        answerFormat: "decimal",
        answerHint: "e.g. 7.5",
        hint: `Cross-multiply: ${d} × x = ${n} × ${shown}.`,
        steps: [
          `Cross-multiply: ${d} × x = ${n} × ${shown} = ${n * shown}.`,
          `x = ${n * shown} ÷ ${d} = ${x}.`,
          `The answer is not a whole number — proportions often are not.`,
        ],
        concept: "Cross-multiplying works even when the answer is a decimal.",
        verify: () => 10 * n * shown === xU * d, // exact integer cross-check in tenths
      });
    }
    const [n, d] = simplestPair(rng, stage === 1 ? 5 : 7);
    const k1 = stage === 1 ? 1 : rng.int(1, 3);
    const k2 = k1 + rng.int(1, stage >= 3 ? 5 : 3);
    const A = n * k1;
    const B = d * k1;
    const C = n * k2;
    const D2 = d * k2;
    const hide = stage === 1 ? 2 : rng.int(0, 3); // 0:A 1:B 2:C 3:D
    const vals = [A, B, C, D2];
    const shown = vals.map((v, i) => (i === hide ? "x" : String(v)));
    const ans = vals[hide];
    const crossKnown = hide === 0 ? B * C : hide === 1 ? A * D2 : hide === 2 ? A * D2 : B * C;
    const divisor = hide === 0 ? D2 : hide === 1 ? C : hide === 2 ? B : A;
    return inputQ({
      instruction: "Solve the proportion.",
      prompt: `{${shown[0]}/${shown[1]}} = {${shown[2]}/${shown[3]}}`,
      answer: String(ans),
      hint:
        stage <= 2
          ? `Both fractions equal {${n}/${d}} — find the scale factor between them.`
          : "Cross-multiply: the two diagonal products are equal.",
      steps: [
        `Cross products are equal: ${hide === 1 || hide === 2 ? `${shown[0]} × ${shown[3]} = ${shown[1]} × ${shown[2]}` : `${shown[1]} × ${shown[2]} = ${shown[0]} × ${shown[3]}`}.`,
        `So x × ${divisor} = ${crossKnown}.`,
        `x = ${crossKnown} ÷ ${divisor} = ${ans}.`,
      ],
      concept: "In a true proportion the cross products always match.",
      verify: () => A * D2 === B * C,
    });
  },
};

/* ------------------------------------------------------------ scale-drawings */
const scaleDrawings: GeneratorFamily = {
  stageLabel: (s, st) =>
    ["Drawing to real life", "Real life to drawing", "Scale as a ratio", "Find the scale", "Decimal measurements"][st - 1],
  generate(skill, stage, rng): RawQuestion {
    if (stage === 1) {
      const k = rng.pick([2, 3, 4, 5, 10] as const);
      const L = rng.int(2, 12);
      return inputQ({
        instruction: "Use the scale.",
        prompt: `A map uses the scale 1 cm = ${k} km. A road measures ${L} cm on the map. How long is the real road, in km?`,
        answer: String(L * k),
        answerHint: "km, e.g. 20",
        hint: `Every map centimetre stands for ${k} real km.`,
        steps: [
          `${L} cm on the map is ${L} groups of ${k} km.`,
          `${L} × ${k} = ${L * k} km.`,
        ],
        concept: "A scale converts drawing lengths into real lengths by multiplying.",
        representation: "word",
        verify: () => (L * k) / k === L,
      });
    }
    if (stage === 2) {
      const k = rng.pick([2, 3, 4, 5, 10] as const);
      const L = rng.int(2, 12);
      const real = L * k;
      return inputQ({
        instruction: "Use the scale.",
        prompt: `A blueprint uses the scale 1 cm = ${k} m. A wall is really ${real} m long. How long should it be on the blueprint, in cm?`,
        answer: String(L),
        answerHint: "cm, e.g. 6",
        hint: `Going from real life to the drawing means dividing by ${k}.`,
        steps: [
          `Each blueprint cm stands for ${k} m.`,
          `${real} ÷ ${k} = ${L} cm.`,
        ],
        concept: "Real to drawing divides; drawing to real multiplies.",
        representation: "word",
        verify: () => L * k === real,
      });
    }
    if (stage === 3) {
      const n = rng.pick([100, 200, 500] as const);
      const L = rng.int(2, 9);
      const realCm = L * n;
      const realM = realCm / 100; // n is a multiple of 100, so this is exact
      return inputQ({
        instruction: "Use the ratio scale.",
        prompt: `A model is built at a scale of 1:${n}. The model is ${L} cm tall. How tall is the real object, in metres?`,
        answer: String(realM),
        answerHint: "metres, e.g. 8",
        hint: `1:${n} means real lengths are ${n} times the model's. Then convert cm to m.`,
        steps: [
          `Real height: ${L} × ${n} = ${realCm} cm.`,
          `Convert: ${realCm} cm ÷ 100 = ${realM} m.`,
        ],
        concept: "A 1:n scale multiplies by n — units convert afterwards.",
        representation: "word",
        verify: () => realM * 100 === L * n,
      });
    }
    if (stage === 4) {
      const k = rng.pick([2, 3, 4, 5, 8, 10] as const);
      const L = rng.int(2, 9);
      const real = L * k;
      return inputQ({
        instruction: "Find the scale.",
        prompt: `On a drawing, a ${real} m boat is shown ${L} cm long. The scale is 1 cm = ? m.`,
        answer: String(k),
        answerHint: "e.g. 4",
        hint: `How many real metres does each drawing centimetre cover?`,
        steps: [
          `${L} cm stands for ${real} m.`,
          `Each cm: ${real} ÷ ${L} = ${k} m.`,
          `So the scale is 1 cm = ${k} m.`,
        ],
        concept: "The scale is the real length divided by the drawing length.",
        representation: "word",
        verify: () => L * k === real,
      });
    }
    const k = rng.pick([2, 3, 4, 6, 8] as const);
    const halves = 2 * rng.int(1, 5) + 1; // odd halves -> x.5 cm
    const drawU = halves * 5; // tenths of cm, e.g. 3.5 cm = 35 tenths
    const realU = drawU * k; // tenths of m
    return inputQ({
      instruction: "Use the scale.",
      prompt: `A garden plan uses 1 cm = ${k} m. A path measures ${fmtU(drawU, 1)} cm on the plan. How long is the real path, in metres?`,
      answer: fmtU(realU, 1),
      answerFormat: "decimal",
      answerHint: "metres, e.g. 10.5",
      hint: `Multiply ${fmtU(drawU, 1)} by ${k} — the half centimetre scales too.`,
      steps: [
        `${fmtU(drawU, 1)} × ${k}: whole part ${Math.floor(drawU / 10)} × ${k} = ${Math.floor(drawU / 10) * k}, half part 0.5 × ${k} = ${fmtU(5 * k, 1)}.`,
        `Together: ${fmtU(realU, 1)} m.`,
      ],
      concept: "Scales apply to every bit of a measurement, including fractions.",
      representation: "word",
      verify: () => drawU * k === realU,
    });
  },
};

/* ---------------------------------------- proportional-relationships */
const proportionalRelationships: GeneratorFamily = {
  stageLabel: (s, st) =>
    ["Find the constant", "Extend the table", "Proportional or not?", "The equation y = kx", "Points on the graph"][st - 1],
  generate(skill, stage, rng): RawQuestion {
    const k = rng.int(2, 9);
    if (stage === 1) {
      const xs = [1, 2, 3];
      return inputQ({
        instruction: "Find the constant of proportionality.",
        prompt: `x: ${xs.join(", ")}\ny: ${xs.map((x) => x * k).join(", ")}\nWhat is k, where y = k × x?`,
        answer: String(k),
        hint: "Divide any y-value by its x-value.",
        steps: [
          `${k} ÷ 1 = ${k}, ${2 * k} ÷ 2 = ${k}, ${3 * k} ÷ 3 = ${k}.`,
          `Every pair gives the same value, so k = ${k}.`,
        ],
        concept: "In a proportional relationship, y ÷ x is the same for every pair.",
        representation: "table",
        verify: () => 2 * k === k * 2 && 3 * k === k * 3,
      });
    }
    if (stage === 2) {
      const xs = [2, 4, 6];
      const beyond = rng.pick([9, 10, 12] as const);
      return inputQ({
        instruction: "Extend the pattern.",
        prompt: `x: ${xs.join(", ")}\ny: ${xs.map((x) => x * k).join(", ")}\nWhat is y when x = ${beyond}?`,
        answer: String(beyond * k),
        hint: `First find k = y ÷ x from the table.`,
        steps: [
          `k = ${2 * k} ÷ 2 = ${k}.`,
          `y = k × x = ${k} × ${beyond} = ${beyond * k}.`,
        ],
        concept: "The constant k predicts y for any x, not just the table's.",
        representation: "table",
        verify: () => (beyond * k) / beyond === k,
      });
    }
    if (stage === 3) {
      const c = rng.int(1, 5);
      const propFirst = rng.chance(0.5);
      const xs = [1, 2, 3];
      const propRow = xs.map((x) => x * k).join(", ");
      const addRow = xs.map((x) => x + c === x * k && x === 1 ? x + c + 1 : x + c).join(", ");
      const tableA = propFirst ? propRow : addRow;
      const tableB = propFirst ? addRow : propRow;
      const answer = propFirst ? "Table A" : "Table B";
      return mcQ({
        instruction: "Which table shows a proportional relationship?",
        prompt: `Both tables use x: ${xs.join(", ")}\nTable A - y: ${tableA}\nTable B - y: ${tableB}`,
        choices: rng.shuffle(["Table A", "Table B", "Both", "Neither"]),
        answer,
        hint: "Check y ÷ x for each column — proportional means the quotient never changes.",
        steps: [
          `${answer} gives y ÷ x = ${k} for every pair.`,
          `The other table was made by ADDING ${c}, so its y ÷ x keeps changing.`,
          `Only multiplication by a constant is proportional.`,
        ],
        concept: "Proportional tables have a constant y ÷ x; add-a-number tables do not.",
        representation: "table",
        verify: () => xs.every((x) => (x * k) / x === k),
      });
    }
    if (stage === 4) {
      const x0 = rng.int(2, 9);
      if (rng.chance(0.5)) {
        return inputQ({
          instruction: "Find the constant in the equation.",
          prompt: `A proportional relationship y = kx passes through the point (${x0}, ${x0 * k}). What is k?`,
          answer: String(k),
          hint: `Substitute the point: ${x0 * k} = k × ${x0}.`,
          steps: [
            `y = kx with x = ${x0}, y = ${x0 * k}.`,
            `k = ${x0 * k} ÷ ${x0} = ${k}.`,
          ],
          concept: "One point is enough to pin down a proportional equation.",
          verify: () => x0 * k === k * x0,
        });
      }
      const x1 = rng.int(10, 20);
      return inputQ({
        instruction: "Use the equation.",
        prompt: `y = ${k}x. What is y when x = ${x1}?`,
        answer: String(k * x1),
        hint: `Replace x with ${x1} and multiply.`,
        steps: [
          `y = ${k} × ${x1}.`,
          `y = ${k * x1}.`,
        ],
        concept: "The equation y = kx turns any x into its y.",
        verify: () => (k * x1) / x1 === k,
      });
    }
    const name = pickName(rng);
    const items = rng.int(3, 8);
    const perItem = rng.int(2, 9);
    const target = items + rng.int(2, 6);
    return inputQ({
      instruction: "Use the proportional relationship.",
      prompt: `The graph of a proportional relationship goes through (${items}, ${items * perItem}), showing the cost in dollars of ${items} tickets. How much do ${target} tickets cost ${name}?`,
      answer: String(target * perItem),
      answerHint: "dollars, e.g. 63",
      hint: `The point (${items}, ${items * perItem}) tells you the price of one ticket.`,
      steps: [
        `Unit rate: ${items * perItem} ÷ ${items} = ${perItem} dollars per ticket.`,
        `On a proportional graph, that is the same everywhere — including at x = ${target}.`,
        `${target} × ${perItem} = $${target * perItem}.`,
      ],
      concept: "On a proportional graph, every point shares the same unit rate.",
      representation: "word",
      verify: () => items * (target * perItem) === target * (items * perItem),
    });
  },
};

export const ratioFamilies = {
  "ratio-basic": ratioBasic,
  "ratio-equivalent": ratioEquivalent,
  "unit-rate": unitRate,
  "proportion-solve": proportionSolve,
  "scale-drawings": scaleDrawings,
  "proportional-relationships": proportionalRelationships,
} satisfies Record<string, GeneratorFamily>;
