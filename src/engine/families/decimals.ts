import type { GeneratorFamily, RawQuestion } from "../types";
import { inputQ, mcQ, mcChoices, pickName } from "./helpers";

const str = (p: Record<string, unknown>, key: string, dflt: string): string =>
  typeof p[key] === "string" ? (p[key] as string) : dflt;

/* ---------------------------------------------------------------------------
 * Exact decimal arithmetic: every quantity is an integer count of units at
 * 10^-places (tenths, hundredths, thousandths or cents). Formatting is done
 * digit-wise so no float ever touches an answer string.
 * ------------------------------------------------------------------------- */

/** Exact decimal string for `units` × 10^-places, trailing zeros trimmed. */
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

/** Decimal string keeping all `places` digits (0.50 stays "0.50"). */
function dispU(units: number, places: number): string {
  const neg = units < 0 ? "-" : "";
  const u = Math.abs(units);
  if (places === 0) return neg + String(u);
  const p = 10 ** places;
  return `${neg}${Math.floor(u / p)}.${String(u % p).padStart(places, "0")}`;
}

/** "$4.50" display for an integer number of cents. */
function moneyDisp(cents: number): string {
  return `$${dispU(cents, 2)}`;
}

/** Money answer string, no $ (normalizeAnswer strips $ from student input). */
function moneyAns(cents: number): string {
  return dispU(cents, 2);
}

function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

/** Integer half-up rounding of `units` (at `places`) to `toPlaces`. */
function roundU(units: number, places: number, toPlaces: number): number {
  const f = 10 ** (places - toPlaces);
  const q = Math.floor(units / f);
  const r = units % f;
  return r * 2 >= f ? q + 1 : q;
}

/** Float recompute for verification, snapped back to integer units. */
function toUnits(decimalString: string, places: number): number {
  return Math.round(Number(decimalString) * 10 ** places);
}

const PLACE_NAMES = ["ones", "tenths", "hundredths", "thousandths"] as const;

/* ------------------------------------------------------------ dec-place-value */
const decPlaceValue: GeneratorFamily = {
  stageLabel: (s, st) =>
    ["Tenths", "Hundredths", "Value of a digit", "Expanded form", "Build the decimal"][st - 1],
  generate(skill, stage, rng): RawQuestion {
    if (stage === 1) {
      const w = rng.int(0, 9);
      const t = rng.int(1, 9);
      const ans = `${w}.${t}`;
      return inputQ({
        instruction: "Write the number as a decimal.",
        prompt: w > 0 ? `${w} and ${t} tenths` : `${t} tenths`,
        answer: ans,
        answerFormat: "decimal",
        answerHint: "e.g. 3.4",
        hint: "The first place after the decimal point is the tenths place.",
        steps: [
          `${t} tenths sit one place after the decimal point: .${t}.`,
          w > 0
            ? `The ${w} whole ones go before the point: ${ans}.`
            : `There are no whole ones, so a 0 holds the ones place: ${ans}.`,
        ],
        concept: "Each place to the right of the decimal point is ten times smaller.",
        verify: () => toUnits(ans, 1) === w * 10 + t,
      });
    }
    if (stage === 2) {
      const [w, t, h] = rng.sample([1, 2, 3, 4, 5, 6, 7, 8, 9], 3);
      const which = rng.pick(["ones", "tenths", "hundredths"] as const);
      const ans = which === "ones" ? w : which === "tenths" ? t : h;
      return inputQ({
        instruction: `In the number ${w}.${t}${h}, which digit is in the ${which} place?`,
        prompt: `${w}.${t}${h}`,
        answer: String(ans),
        hint: "Reading right from the decimal point: tenths first, then hundredths.",
        steps: [
          `Label each digit: ${w} is ones, ${t} is tenths, ${h} is hundredths.`,
          `The digit in the ${which} place is ${ans}.`,
        ],
        concept: "A digit's place tells you what it is worth.",
        verify: () => new Set([w, t, h]).size === 3,
      });
    }
    if (stage === 3) {
      const [w, t, h, m] = rng.sample([1, 2, 3, 4, 5, 6, 7, 8, 9], 4);
      const idx = rng.int(1, 3); // 1 tenths, 2 hundredths, 3 thousandths
      const digit = [t, h, m][idx - 1];
      const numStr = `${w}.${t}${h}${m}`;
      const correct = fmtU(digit * 10 ** (3 - idx), 3);
      const wrongs = [
        String(digit),
        ...[1, 2, 3].filter((i) => i !== idx).map((i) => fmtU(digit * 10 ** (3 - i), 3)),
      ];
      return mcQ({
        instruction: `What is the value of the digit ${digit} in ${numStr}?`,
        prompt: numStr,
        choices: mcChoices(rng, correct, wrongs),
        answer: correct,
        hint: `Which place does the ${digit} sit in? Count places from the decimal point.`,
        steps: [
          `The ${digit} is in the ${PLACE_NAMES[idx]} place.`,
          `One ${PLACE_NAMES[idx].replace(/s$/, "")} is ${fmtU(10 ** (3 - idx), 3)}, so the digit is worth ${digit} × ${fmtU(10 ** (3 - idx), 3)} = ${correct}.`,
        ],
        concept: "The same digit is worth ten times less one place further right.",
        verify: () => toUnits(correct, 3) === digit * 10 ** (3 - idx),
      });
    }
    if (stage === 4) {
      const w = rng.int(1, 9);
      const t = rng.int(1, 9);
      const h = rng.int(1, 9);
      const useM = rng.chance(0.5);
      const m = useM ? rng.int(1, 9) : 0;
      const units = w * 1000 + t * 100 + h * 10 + m;
      const ans = fmtU(units, 3);
      const parts = [`${w}`, `0.${t}`, `0.0${h}`, ...(useM ? [`0.00${m}`] : [])];
      return inputQ({
        instruction: "Write the expanded form as one decimal.",
        prompt: `${parts.join(" + ")} = ?`,
        answer: ans,
        answerFormat: "decimal",
        answerHint: useM ? "e.g. 3.456" : "e.g. 3.45",
        hint: "Each addend fills exactly one place — slot them in.",
        steps: [
          `${w} fills the ones place, 0.${t} the tenths, 0.0${h} the hundredths${useM ? `, 0.00${m} the thousandths` : ""}.`,
          `Together: ${ans}.`,
        ],
        concept: "Expanded form splits a decimal into one value per place.",
        verify: () => toUnits(ans, 3) === units,
      });
    }
    const w = rng.int(0, 9);
    const t = rng.int(0, 9);
    const h = rng.int(0, 9);
    const m = rng.int(1, 9);
    const units = w * 1000 + t * 100 + h * 10 + m;
    const ans = fmtU(units, 3);
    return inputQ({
      instruction: "Build the decimal.",
      prompt: `Write the decimal that has ${w} ones, ${t} tenths, ${h} hundredths and ${m} thousandths.`,
      answer: ans,
      answerFormat: "decimal",
      answerHint: "e.g. 4.058",
      hint: "Write the places in order — use 0 to hold any empty place.",
      steps: [
        `Ones ${w}, then tenths ${t}, hundredths ${h}, thousandths ${m}.`,
        (t === 0 || h === 0)
          ? `A zero digit still holds its place, otherwise the other digits shift and change value.`
          : `Read left to right: ${ans}.`,
        `The number is ${ans}.`,
      ],
      concept: "Zeros are placeholders that keep every digit in its correct place.",
      verify: () => toUnits(ans, 3) === units,
    });
  },
};

/* --------------------------------------------------------------- dec-compare */
const decCompare: GeneratorFamily = {
  stageLabel: (s, st) =>
    ["Tenths", "Hundredths", "Different lengths", "Order decimals", "Between two decimals"][st - 1],
  generate(skill, stage, rng): RawQuestion {
    if (stage === 4) {
      // Order three decimals with mixed numbers of places.
      const items: { disp: string; value: number }[] = [];
      while (items.length < 3) {
        const p = rng.pick([1, 2] as const);
        const mant = p === 1 ? rng.int(1, 9) : rng.int(1, 99);
        const value = mant * 10 ** (2 - p); // in hundredths
        if (items.some((x) => x.value === value)) continue;
        items.push({ disp: dispU(mant, p), value });
      }
      const sorted = [...items].sort((a, b) => a.value - b.value);
      const correct = sorted.map((x) => x.disp).join(", ");
      const reversed = [...sorted].reverse().map((x) => x.disp).join(", ");
      const swapped = [sorted[1], sorted[0], sorted[2]].map((x) => x.disp).join(", ");
      const digitTrap = [...items]
        .sort((a, b) => Number(a.disp.replace(".", "")) - Number(b.disp.replace(".", "")))
        .map((x) => x.disp)
        .join(", ");
      return mcQ({
        instruction: "Which list orders the decimals from least to greatest?",
        prompt: items.map((x) => x.disp).join("   "),
        choices: mcChoices(rng, correct, [reversed, swapped, digitTrap]),
        answer: correct,
        hint: "Give every number the same count of decimal places first, then compare.",
        steps: [
          `Pad to hundredths: ${items.map((x) => dispU(x.value, 2)).join(", ")}.`,
          `Now compare like whole numbers of hundredths: ${sorted.map((x) => x.value).join(" < ")}.`,
          `Least to greatest: ${correct}.`,
        ],
        concept: "More digits does not mean bigger — pad with zeros, then compare.",
        verify: () => sorted.every((x, i) => i === 0 || sorted[i - 1].value < x.value),
      });
    }
    if (stage === 5) {
      const t = rng.int(1, 8);
      const ans = `0.${t}${rng.int(1, 9)}`;
      const above = `0.${t + 1}${rng.int(1, 9)}`;
      const below = t >= 2 ? `0.${t - 1}${rng.int(1, 9)}` : `0.0${rng.int(1, 9)}`;
      const far = `${t}.5`;
      return mcQ({
        instruction: `Which decimal is between 0.${t} and 0.${t + 1}?`,
        prompt: `0.${t} < ? < 0.${t + 1}`,
        choices: mcChoices(rng, ans, [above, below, far]),
        answer: ans,
        hint: `Think of 0.${t} as 0.${t}0 and 0.${t + 1} as 0.${t + 1}0 — what fits between?`,
        steps: [
          `0.${t} = 0.${t}0 and 0.${t + 1} = 0.${t + 1}0 in hundredths.`,
          `${ans} has ${t} tenths plus some hundredths, so it sits between them.`,
        ],
        concept: "Between any two decimals there are always more decimals.",
        verify: () => Number(ans) > Number(`0.${t}`) && Number(ans) < Number(`0.${t + 1}`),
      });
    }
    // Stages 1-3: direct comparison.
    let aU: number, bU: number, places: number, aDisp: string, bDisp: string;
    if (stage === 1) {
      places = 1;
      aU = rng.int(1, 99);
      do bU = rng.int(1, 99);
      while (bU === aU);
      aDisp = dispU(aU, 1);
      bDisp = dispU(bU, 1);
    } else if (stage === 2) {
      places = 2;
      aU = rng.int(10, 999);
      do bU = rng.int(10, 999);
      while (bU === aU);
      aDisp = dispU(aU, 2);
      bDisp = dispU(bU, 2);
    } else {
      // The classic trap: 0.5 vs 0.45, or 0.5 vs 0.50.
      places = 2;
      const t = rng.int(1, 9);
      aU = t * 10;
      aDisp = `0.${t}`;
      if (rng.chance(0.25)) {
        bU = t * 10;
        bDisp = `0.${t}0`;
      } else {
        const h = rng.int(1, 9);
        const under = rng.chance(0.5) && t >= 2;
        bU = (under ? t - 1 : t) * 10 + h;
        bDisp = dispU(bU, 2);
      }
      if (rng.chance(0.5)) {
        [aU, bU] = [bU, aU];
        [aDisp, bDisp] = [bDisp, aDisp];
      }
    }
    const ans = aU === bU ? "=" : aU > bU ? ">" : "<";
    return mcQ({
      instruction: "Compare the decimals.",
      prompt: `${aDisp} ___ ${bDisp}`,
      choices: rng.shuffle(["<", ">", "="]),
      answer: ans,
      hint:
        stage === 3
          ? "Give both numbers the same count of decimal places, then compare."
          : "Compare place by place, starting from the left.",
      steps: [
        `Pad to the same length: ${dispU(aU, places)} vs ${dispU(bU, places)}.`,
        `Compare like whole ${places === 1 ? "tenths" : "hundredths"}: ${aU} ${ans} ${bU}.`,
        `So ${aDisp} ${ans} ${bDisp}.`,
      ],
      concept: "Trailing zeros change nothing — 0.5 and 0.50 are the same amount.",
      verify: () => (ans === "=" ? aU === bU : ans === ">" ? aU > bU : aU < bU),
    });
  },
};

/* --------------------------------------------------------------- dec-add-sub */
/** params: op "add" | "sub" | "mixed". */
const decAddSub: GeneratorFamily = {
  stageLabel: (s, st) =>
    ["Tenths", "Hundredths", "Different lengths", "Thousandths & larger", "Story problems"][st - 1],
  generate(skill, stage, rng): RawQuestion {
    const opParam = str(skill.params, "op", "mixed");
    const op = opParam === "mixed" ? rng.pick(["add", "sub"] as const) : (opParam as "add" | "sub");
    const sym = op === "add" ? "+" : "−";

    let aU: number, bU: number, aP: number, bP: number;
    if (stage === 1) {
      aP = bP = 1;
      aU = rng.int(2, 99);
      bU = rng.int(1, op === "sub" ? aU - 1 : 99);
    } else if (stage === 2) {
      aP = bP = 2;
      aU = rng.int(101, 999);
      bU = rng.int(11, op === "sub" ? aU - 1 : 999);
    } else if (stage === 3) {
      aP = 1;
      bP = 2;
      aU = rng.int(11, 99);
      bU = rng.int(11, 999);
      if (bU % 10 === 0) bU += rng.int(1, 9); // keep a genuine hundredths digit
      if (op === "sub" && bU > aU * 10) [aU, bU] = [Math.ceil(bU / 10) + rng.int(1, 20), bU];
    } else {
      aP = bP = 3;
      aU = rng.int(1001, 9999);
      bU = rng.int(101, op === "sub" ? aU - 1 : 9999);
    }
    const P = Math.max(aP, bP);
    const aC = aU * 10 ** (P - aP);
    const bC = bU * 10 ** (P - bP);
    const ansU = op === "add" ? aC + bC : aC - bC;
    const ans = fmtU(ansU, P);
    const aDisp = fmtU(aU, aP);
    const bDisp = fmtU(bU, bP);
    const unitName = P === 1 ? "tenths" : P === 2 ? "hundredths" : "thousandths";

    if (stage === 5) {
      const name = pickName(rng);
      const money = rng.chance(0.5);
      const a2 = rng.int(150, 2999); // cents or hundredths of km
      const b2 = rng.int(105, op === "sub" ? a2 - 1 : 2999);
      const r2 = op === "add" ? a2 + b2 : a2 - b2;
      const prompt = money
        ? op === "add"
          ? `${name} buys a book for ${moneyDisp(a2)} and a pen for ${moneyDisp(b2)}. How much is that in total?`
          : `${name} has ${moneyDisp(a2)} and spends ${moneyDisp(b2)}. How much is left?`
        : op === "add"
          ? `${name} ran ${fmtU(a2, 2)} km on Monday and ${fmtU(b2, 2)} km on Tuesday. How far did ${name} run in total?`
          : `A trail is ${fmtU(a2, 2)} km long. ${name} has walked ${fmtU(b2, 2)} km. How much further is it?`;
      return inputQ({
        instruction: "Solve the problem.",
        prompt,
        answer: money ? moneyAns(r2) : fmtU(r2, 2),
        answerFormat: "decimal",
        answerHint: money ? "dollars, e.g. 4.50" : "e.g. 4.5",
        hint: op === "add" ? "Combine the two amounts — line up the decimal points." : "Find the difference — line up the decimal points.",
        steps: [
          `Line up the decimal points: ${dispU(a2, 2)} ${sym} ${dispU(b2, 2)}.`,
          `Work in hundredths: ${a2} ${sym} ${b2} = ${r2}.`,
          `That is ${money ? moneyDisp(r2) : fmtU(r2, 2) + " km"}.`,
        ],
        concept: "Decimal points must line up so you add like places to like places.",
        representation: "word",
        verify: () => toUnits(money ? moneyAns(r2) : fmtU(r2, 2), 2) === (op === "add" ? a2 + b2 : a2 - b2),
      });
    }
    return inputQ({
      instruction: op === "add" ? "Add." : "Subtract.",
      prompt: `${aDisp} ${sym} ${bDisp} = ?`,
      answer: ans,
      answerFormat: "decimal",
      answerHint: "e.g. 4.75",
      hint:
        aP === bP
          ? "Line up the decimal points and work one place at a time."
          : `Write ${aDisp} as ${dispU(aC, P)} so both numbers have the same places.`,
      steps: [
        `Line up the decimal points: ${dispU(aC, P)} ${sym} ${dispU(bC, P)}.`,
        `Now the digits are all ${unitName}: ${aC} ${sym} ${bC} = ${ansU}.`,
        `Place the decimal point back: ${ans}.`,
      ],
      concept: "Lining up decimal points keeps tenths with tenths and hundredths with hundredths.",
      verify: () => toUnits(ans, P) === (op === "add" ? aC + bC : aC - bC),
    });
  },
};

/* ------------------------------------------------------------------- dec-mul */
const decMul: GeneratorFamily = {
  stageLabel: (s, st) =>
    ["Multiply by 10, 100, 1000", "Tenths × whole number", "Tenths × tenths", "Hundredths in play", "Real-world multiplying"][st - 1],
  generate(skill, stage, rng): RawQuestion {
    if (stage === 1) {
      let m = rng.int(101, 998); // hundredths, e.g. 1.01–9.99
      if (m % 10 === 0) m += rng.int(1, 9);
      const pow = rng.pick([10, 100, 1000] as const);
      const shift = pow === 10 ? 1 : pow === 100 ? 2 : 3;
      const disp = fmtU(m, 2);
      const correct = fmtU(m * pow, 2);
      const wrongs = [fmtU(m * pow, 3), fmtU(m * pow, 1), fmtU(m, 2)];
      return mcQ({
        instruction: `What is ${disp} × ${pow}?`,
        prompt: `${disp} × ${pow} = ?`,
        choices: mcChoices(rng, correct, wrongs),
        answer: correct,
        hint: `Multiplying by ${pow} moves the decimal point ${shift} place${shift > 1 ? "s" : ""} to the right.`,
        steps: [
          `Each ×10 makes every digit worth ten times more, shifting the point one place right.`,
          `${disp} × ${pow}: move the point ${shift} place${shift > 1 ? "s" : ""} right to get ${correct}.`,
        ],
        concept: "Multiplying by a power of ten shifts the decimal point, not the digits.",
        verify: () => toUnits(correct, 2) === m * pow,
      });
    }
    if (stage === 2) {
      let t = rng.int(11, 99);
      if (t % 10 === 0) t += 1;
      const w = rng.int(2, 9);
      const ansU = t * w;
      const ans = fmtU(ansU, 1);
      return inputQ({
        instruction: "Multiply.",
        prompt: `${fmtU(t, 1)} × ${w} = ?`,
        answer: ans,
        answerFormat: "decimal",
        answerHint: "e.g. 4.8",
        hint: `Multiply ${t} × ${w} as whole numbers, then put back the one decimal place.`,
        steps: [
          `Ignore the point: ${t} × ${w} = ${ansU}.`,
          `${fmtU(t, 1)} has 1 decimal place, so the answer needs 1: ${ans}.`,
        ],
        concept: "Multiply as whole numbers, then count the decimal places back in.",
        verify: () => toUnits(ans, 1) === t * w,
      });
    }
    if (stage === 3) {
      const a = rng.int(2, 9);
      const b = rng.int(2, 9);
      const ansU = a * b; // hundredths
      const ans = fmtU(ansU, 2);
      return inputQ({
        instruction: "Multiply.",
        prompt: `0.${a} × 0.${b} = ?`,
        answer: ans,
        answerFormat: "decimal",
        answerHint: "e.g. 0.12",
        hint: `${a} × ${b} = ${a * b}. Now count decimal places: 1 + 1 = 2.`,
        steps: [
          `Whole-number product: ${a} × ${b} = ${a * b}.`,
          `Each factor has 1 decimal place, so the product needs 1 + 1 = 2 places.`,
          `0.${a} × 0.${b} = ${ans} — tenths of tenths are hundredths.`,
        ],
        concept: "The product's decimal places are the factors' decimal places added together.",
        verify: () => toUnits(ans, 2) === a * b,
      });
    }
    if (stage === 4) {
      if (rng.chance(0.5)) {
        let h = rng.int(101, 399);
        if (h % 10 === 0) h += rng.int(1, 9);
        const w = rng.int(2, 8);
        const ansU = h * w;
        const ans = fmtU(ansU, 2);
        return inputQ({
          instruction: "Multiply.",
          prompt: `${fmtU(h, 2)} × ${w} = ?`,
          answer: ans,
          answerFormat: "decimal",
          answerHint: "e.g. 5.25",
          hint: `Compute ${h} × ${w}, then restore the 2 decimal places.`,
          steps: [
            `Whole-number product: ${h} × ${w} = ${ansU}.`,
            `${fmtU(h, 2)} has 2 decimal places, so the answer keeps 2: ${ans}.`,
          ],
          concept: "The decimal-place count carries straight into the product.",
          verify: () => toUnits(ans, 2) === h * w,
        });
      }
      let t = rng.int(2, 9);
      let h = rng.int(11, 99);
      if (h % 10 === 0) h += 1;
      const ansU = t * h; // thousandths
      const ans = fmtU(ansU, 3);
      return inputQ({
        instruction: "Multiply.",
        prompt: `0.${t} × ${fmtU(h, 2)} = ?`,
        answer: ans,
        answerFormat: "decimal",
        answerHint: "e.g. 0.144",
        hint: `${t} × ${h} = ${t * h}. Decimal places: 1 + 2 = 3.`,
        steps: [
          `Whole-number product: ${t} × ${h} = ${t * h}.`,
          `One factor has 1 place, the other 2, so the product needs 3 places: ${ans}.`,
        ],
        concept: "Count both factors' decimal places and give the product all of them.",
        verify: () => toUnits(ans, 3) === t * h,
      });
    }
    const name = pickName(rng);
    if (rng.chance(0.5)) {
      let price = rng.int(105, 895); // cents
      if (price % 5 === 0) price += rng.int(1, 4);
      const qty = rng.int(2, 6);
      const total = price * qty;
      return inputQ({
        instruction: "Solve the problem.",
        prompt: `${name} buys ${qty} notebooks at ${moneyDisp(price)} each. How much does ${name} pay in total?`,
        answer: moneyAns(total),
        answerFormat: "decimal",
        answerHint: "dollars, e.g. 4.50",
        hint: "Equal prices means multiply: price × how many.",
        steps: [
          `Work in cents: ${price} × ${qty} = ${total} cents.`,
          `Convert back: ${total} cents = ${moneyDisp(total)}.`,
        ],
        concept: "Working in cents turns decimal money into whole-number multiplication.",
        representation: "word",
        verify: () => toUnits(moneyAns(total), 2) === price * qty,
      });
    }
    let speed = rng.int(101, 349); // tenths of km/h, i.e. 10.1–34.9 km/h
    if (speed % 10 === 0) speed += 1;
    const hours = rng.int(2, 6);
    const dist = speed * hours;
    return inputQ({
      instruction: "Solve the problem.",
      prompt: `A cyclist rides at ${fmtU(speed, 1)} km per hour for ${hours} hours. How far does the cyclist ride?`,
      answer: fmtU(dist, 1),
      answerFormat: "decimal",
      answerHint: "kilometres, e.g. 45.5",
      hint: "Distance = speed × time.",
      steps: [
        `Distance = ${fmtU(speed, 1)} × ${hours}.`,
        `Whole-number product: ${speed} × ${hours} = ${dist}; restore 1 decimal place.`,
        `The cyclist rides ${fmtU(dist, 1)} km.`,
      ],
      concept: "Rates multiply by time to give a total.",
      representation: "word",
      verify: () => toUnits(fmtU(dist, 1), 1) === speed * hours,
    });
  },
};

/* ------------------------------------------------------------------- dec-div */
const decDiv: GeneratorFamily = {
  stageLabel: (s, st) =>
    ["Divide by 10, 100, 1000", "Decimal ÷ whole number", "Whole ÷ whole, decimal answer", "Decimal ÷ decimal", "Sharing money and measures"][st - 1],
  generate(skill, stage, rng): RawQuestion {
    if (stage === 1) {
      const n = rng.int(2, 999);
      const pow = rng.pick([10, 100, 1000] as const);
      const shift = pow === 10 ? 1 : pow === 100 ? 2 : 3;
      const ans = fmtU(n, shift);
      return inputQ({
        instruction: "Divide.",
        prompt: `${n} ÷ ${pow} = ?`,
        answer: ans,
        answerFormat: "decimal",
        answerHint: "e.g. 0.45",
        hint: `Dividing by ${pow} moves the decimal point ${shift} place${shift > 1 ? "s" : ""} to the left.`,
        steps: [
          `Each ÷10 makes every digit worth ten times less, shifting the point one place left.`,
          `${n} ÷ ${pow}: move the point ${shift} place${shift > 1 ? "s" : ""} left to get ${ans}.`,
        ],
        concept: "Dividing by a power of ten shifts the decimal point left.",
        verify: () => toUnits(ans, shift) === n,
      });
    }
    if (stage === 2) {
      let a = rng.int(11, 99); // answer in tenths
      if (a % 10 === 0) a += 1;
      const k = rng.int(2, 9);
      const dividendU = a * k;
      return inputQ({
        instruction: "Divide.",
        prompt: `${fmtU(dividendU, 1)} ÷ ${k} = ?`,
        answer: fmtU(a, 1),
        answerFormat: "decimal",
        answerHint: "e.g. 1.2",
        hint: `Think in tenths: ${dividendU} tenths ÷ ${k}.`,
        steps: [
          `${fmtU(dividendU, 1)} is ${dividendU} tenths.`,
          `${dividendU} ÷ ${k} = ${a} tenths.`,
          `${a} tenths = ${fmtU(a, 1)}.`,
        ],
        concept: "Dividing a decimal by a whole number shares out the decimal units.",
        verify: () => a * k === dividendU,
      });
    }
    if (stage === 3) {
      const k = rng.pick([2, 4, 5] as const);
      const w = rng.int(1, 9);
      const cPart = k === 2 ? 50 : k === 4 ? rng.pick([25, 50, 75] as const) : rng.pick([20, 40, 60, 80] as const);
      const ansU = w * 100 + cPart; // hundredths
      const n = (ansU * k) / 100; // whole by construction
      const ans = fmtU(ansU, 2);
      return inputQ({
        instruction: "Divide. Give the answer as a decimal.",
        prompt: `${n} ÷ ${k} = ?`,
        answer: ans,
        answerFormat: "decimal",
        answerHint: "e.g. 3.5",
        hint: `${k} does not divide ${n} evenly — keep dividing past the decimal point.`,
        steps: [
          `${k} × ${Math.floor(n / k)} = ${Math.floor(n / k) * k}, leaving a remainder of ${n - Math.floor(n / k) * k}.`,
          `Write ${n} as ${n}.00 and keep dividing: ${n} ÷ ${k} = ${ans}.`,
          `Check: ${ans} × ${k} = ${n}.`,
        ],
        concept: "A remainder can keep being divided by adding decimal places.",
        verify: () => (ansU * k) % 100 === 0 && (ansU * k) / 100 === n,
      });
    }
    if (stage === 4) {
      const d = rng.int(2, 9); // divisor 0.d
      const q = rng.int(2, 9); // whole answer
      const dividendU = q * d; // tenths
      return inputQ({
        instruction: "Divide.",
        prompt: `${fmtU(dividendU, 1)} ÷ 0.${d} = ?`,
        answer: String(q),
        answerFormat: "decimal",
        answerHint: "e.g. 7",
        hint: "Multiply both numbers by 10 so the divisor becomes a whole number.",
        steps: [
          `Multiply both by 10: ${fmtU(dividendU, 1)} ÷ 0.${d} = ${dividendU} ÷ ${d}.`,
          `Scaling both numbers the same way keeps the quotient unchanged.`,
          `${dividendU} ÷ ${d} = ${q}.`,
        ],
        concept: "Shift both decimal points together until the divisor is whole.",
        verify: () => q * d === dividendU,
      });
    }
    const name = pickName(rng);
    const k = rng.int(2, 6);
    let per = rng.int(105, 999); // cents each
    if (per % 5 === 0) per += rng.int(1, 4);
    const total = per * k;
    return inputQ({
      instruction: "Solve the problem.",
      prompt: `${k} friends split a bill of ${moneyDisp(total)} equally. How much does each person pay, including ${name}?`,
      answer: moneyAns(per),
      answerFormat: "decimal",
      answerHint: "dollars, e.g. 4.50",
      hint: "Splitting equally means dividing the total by the number of people.",
      steps: [
        `Work in cents: ${moneyDisp(total)} = ${total} cents.`,
        `${total} ÷ ${k} = ${per} cents.`,
        `Each person pays ${moneyDisp(per)}.`,
      ],
      concept: "Convert money to cents to divide without decimal headaches.",
      representation: "word",
      verify: () => per * k === total,
    });
  },
};

/* ----------------------------------------------------------------- dec-round */
const decRound: GeneratorFamily = {
  stageLabel: (s, st) =>
    ["To the nearest whole", "To the nearest tenth", "To the nearest hundredth", "Any place", "Rounding money"][st - 1],
  generate(skill, stage, rng): RawQuestion {
    if (stage === 5) {
      if (rng.chance(0.5)) {
        const dollars = rng.int(2, 49);
        const centsOff = rng.int(1, 49) * (rng.chance(0.5) ? 1 : -1);
        const price = dollars * 100 + centsOff;
        return inputQ({
          instruction: "Round to the nearest dollar.",
          prompt: `A shirt costs ${moneyDisp(price)}. About how many dollars is that?`,
          answer: String(dollars),
          answerHint: "whole dollars, e.g. 12",
          hint: "Look at the cents: 50 or more rounds up, less than 50 rounds down.",
          steps: [
            `The cents part is ${String(price % 100).padStart(2, "0")}.`,
            centsOff > 0
              ? `${String(price % 100).padStart(2, "0")} is less than 50, so round down to $${dollars}.`
              : `${String(price % 100).padStart(2, "0")} is 50 or more, so round up to $${dollars}.`,
            `${moneyDisp(price)} is about $${dollars}.`,
          ],
          concept: "Rounding money to whole dollars makes quick estimates possible.",
          representation: "word",
          verify: () => roundU(price, 2, 0) === dollars,
        });
      }
      const target = rng.int(2, 9);
      const correct = dispU(target * 100 + rng.int(1, 49) * (rng.chance(0.5) ? 1 : -1), 2);
      const upWrong = dispU(target * 100 + 50 + rng.int(1, 40), 2);
      const downWrong = dispU(target * 100 - 51 - rng.int(0, 40), 2);
      const farWrong = dispU((target + 1) * 100 + 60, 2);
      return mcQ({
        instruction: `Which number rounds to ${target} when rounded to the nearest whole number?`,
        prompt: `Rounds to ${target}: which one?`,
        choices: mcChoices(rng, correct, [upWrong, downWrong, farWrong]),
        answer: correct,
        hint: `A number rounds to ${target} when it is between ${target - 1}.50 and ${target}.49 (with .50 rounding up).`,
        steps: [
          `Numbers from ${target - 1}.50 up to (but not including) ${target}.50 round to ${target}.`,
          `${correct} is in that range, so it rounds to ${target}.`,
        ],
        concept: "Every rounded value covers a whole range of numbers.",
        verify: () => roundU(toUnits(correct, 2), 2, 0) === target,
      });
    }
    const cfg =
      stage === 1
        ? { places: 1, to: 0 }
        : stage === 2
          ? { places: 2, to: 1 }
          : stage === 3
            ? { places: 3, to: 2 }
            : { places: 3, to: rng.int(0, 2) };
    const { places, to } = cfg;
    let units = rng.int(10 ** (places - 1) + 1, 10 ** (places + 1) - 1);
    if (units % 10 === 0) units += rng.pick([3, 7] as const);
    const disp = dispU(units, places);
    const rounded = roundU(units, places, to);
    const ans = fmtU(rounded, to);
    const placeName = to === 0 ? "whole number" : to === 1 ? "tenth" : "hundredth";
    const checkDigit = Math.floor(units / 10 ** (places - to - 1)) % 10;
    return inputQ({
      instruction: `Round to the nearest ${placeName}.`,
      prompt: disp,
      answer: ans,
      answerFormat: "decimal",
      answerHint: to === 0 ? "e.g. 4" : to === 1 ? "e.g. 4.5" : "e.g. 4.56",
      hint: `Look at the digit just right of the ${to === 0 ? "ones" : PLACE_NAMES[to]} place — it decides up or down.`,
      steps: [
        `The deciding digit is ${checkDigit}.`,
        checkDigit >= 5
          ? `${checkDigit} is 5 or more, so round up: ${ans}.`
          : `${checkDigit} is less than 5, so keep the digit and drop the rest: ${ans}.`,
      ],
      concept: "The digit one place right of the target decides whether to round up.",
      verify: () => {
        const [wp, fp = ""] = disp.split(".");
        const rebuilt = Number(wp + fp.padEnd(places, "0"));
        return roundU(rebuilt, places, to) === rounded;
      },
    });
  },
};

/* ---------------------------------------------------------- dec-frac-convert */
/** params: dir "to-dec" | "to-frac" | "mixed". */
const decFracConvert: GeneratorFamily = {
  stageLabel: (s, st) =>
    ["Tenths", "Hundredths", "Friendly fractions", "Simplest form", "Eighths & mixed numbers"][st - 1],
  generate(skill, stage, rng): RawQuestion {
    const dirParam = str(skill.params, "dir", "mixed");
    const toDec = dirParam === "to-dec" || (dirParam !== "to-frac" && rng.chance(0.5));

    /** Exact decimal string of n/d for d dividing 1000. */
    const decOf = (n: number, d: number): string => fmtU((n * 1000) / d, 3);

    if (stage === 1) {
      const n = rng.int(1, 9);
      if (toDec) {
        return inputQ({
          instruction: "Write the fraction as a decimal.",
          prompt: `{${n}/10}`,
          answer: `0.${n}`,
          answerFormat: "decimal",
          answerHint: "e.g. 0.3",
          hint: "Tenths live one place after the decimal point.",
          steps: [`{${n}/10} means ${n} tenths.`, `${n} tenths is written 0.${n}.`],
          concept: "The first decimal place counts tenths.",
          verify: () => toUnits(`0.${n}`, 1) === n,
        });
      }
      return inputQ({
        instruction: "Write the decimal as a fraction.",
        prompt: `0.${n}`,
        answer: `${n}/10`,
        accept: n % 2 === 0 ? [`${n / 2}/5`] : n === 5 ? ["1/2"] : [],
        answerFormat: "fraction",
        answerHint: "e.g. 3/10",
        hint: "One decimal place means tenths.",
        steps: [`0.${n} is ${n} tenths.`, `${n} tenths = {${n}/10}.`],
        concept: "A one-place decimal is a fraction over 10.",
        verify: () => toUnits(`0.${n}`, 1) === n,
      });
    }
    if (stage === 2) {
      let n = rng.int(11, 99);
      if (n % 10 === 0) n += rng.int(1, 9);
      const disp = fmtU(n, 2);
      if (toDec) {
        return inputQ({
          instruction: "Write the fraction as a decimal.",
          prompt: `{${n}/100}`,
          answer: disp,
          answerFormat: "decimal",
          answerHint: "e.g. 0.27",
          hint: "Hundredths fill the first two decimal places.",
          steps: [`{${n}/100} means ${n} hundredths.`, `${n} hundredths is written ${disp}.`],
          concept: "Two decimal places count hundredths.",
          verify: () => toUnits(disp, 2) === n,
        });
      }
      const g = gcd(n, 100);
      return inputQ({
        instruction: "Write the decimal as a fraction with denominator 100.",
        prompt: disp,
        answer: `${n}/100`,
        accept: g > 1 ? [`${n / g}/${100 / g}`] : [],
        answerFormat: "fraction",
        answerHint: "e.g. 27/100",
        hint: "Two decimal places means hundredths.",
        steps: [`${disp} is ${n} hundredths.`, `${n} hundredths = {${n}/100}.`],
        concept: "A two-place decimal is a fraction over 100.",
        verify: () => toUnits(disp, 2) === n,
      });
    }
    if (stage === 3 || stage === 4) {
      const d = rng.pick([2, 4, 5, 20, 25, 50] as const);
      let n = rng.int(1, d - 1);
      while (gcd(n, d) !== 1) n = rng.int(1, d - 1);
      const dec = decOf(n, d);
      const k = 100 / d;
      if (stage === 3 && toDec) {
        return inputQ({
          instruction: "Write the fraction as a decimal.",
          prompt: `{${n}/${d}}`,
          answer: dec,
          answerFormat: "decimal",
          answerHint: "e.g. 0.25",
          hint: `Make an equivalent fraction with denominator 100: multiply top and bottom by ${k}.`,
          steps: [
            `{${n}/${d}} = {${n * k}/100} because ${d} × ${k} = 100.`,
            `${n * k} hundredths = ${dec}.`,
          ],
          concept: "Rewriting over 100 turns any friendly fraction into a decimal.",
          verify: () => Math.round(Number(dec) * d) === n,
        });
      }
      // Stage 4 (or stage 3 asked in reverse): decimal -> simplest fraction.
      return inputQ({
        instruction: "Write the decimal as a fraction in simplest form.",
        prompt: dec,
        answer: `${n}/${d}`,
        accept: d === 2 && n === 1 ? [] : [`${n * k}/100`],
        answerFormat: "fraction",
        answerHint: "e.g. 7/20",
        hint: `Write it over 100 first, then divide top and bottom by their GCF.`,
        steps: [
          `${dec} = {${n * k}/100}.`,
          `GCF of ${n * k} and 100 is ${k}.`,
          `Divide both by ${k}: {${n * k}/100} = {${n}/${d}}.`,
        ],
        concept: "Simplest form divides out every common factor.",
        verify: () => gcd(n, d) === 1 && Math.round(Number(dec) * d) === n,
      });
    }
    // Stage 5: eighths and mixed numbers.
    if (rng.chance(0.5)) {
      const n = rng.pick([1, 3, 5, 7] as const);
      const dec = decOf(n, 8);
      if (toDec) {
        return inputQ({
          instruction: "Write the fraction as a decimal.",
          prompt: `{${n}/8}`,
          answer: dec,
          answerFormat: "decimal",
          answerHint: "e.g. 0.375",
          hint: "Eighths need thousandths: multiply top and bottom by 125.",
          steps: [
            `{${n}/8} = {${n * 125}/1000} because 8 × 125 = 1000.`,
            `${n * 125} thousandths = ${dec}.`,
          ],
          concept: "Eighths become exact three-place decimals.",
          verify: () => Math.round(Number(dec) * 8) === n,
        });
      }
      return inputQ({
        instruction: "Write the decimal as a fraction in simplest form.",
        prompt: dec,
        answer: `${n}/8`,
        accept: [`${n * 125}/1000`],
        answerFormat: "fraction",
        answerHint: "e.g. 3/8",
        hint: "Three decimal places means thousandths — then simplify.",
        steps: [
          `${dec} = {${n * 125}/1000}.`,
          `Divide top and bottom by 125: {${n}/8}.`,
        ],
        concept: "Thousandths with factor 125 simplify to eighths.",
        verify: () => Math.round(Number(dec) * 8) === n,
      });
    }
    const w = rng.int(1, 5);
    const d = rng.pick([2, 4, 5] as const);
    let n = rng.int(1, d - 1);
    while (gcd(n, d) !== 1) n = rng.int(1, d - 1);
    const fracDec = decOf(n, d);
    const dec = `${w}${fracDec.slice(1)}`; // e.g. 2 + .6 -> "2.6"
    if (toDec) {
      return inputQ({
        instruction: "Write the mixed number as a decimal.",
        prompt: `${w} {${n}/${d}}`,
        answer: dec,
        answerFormat: "decimal",
        answerHint: "e.g. 2.75",
        hint: `The whole part stays ${w}; convert {${n}/${d}} to a decimal.`,
        steps: [
          `{${n}/${d}} = ${fracDec}.`,
          `Add the whole part: ${w} + ${fracDec} = ${dec}.`,
        ],
        concept: "A mixed number is a whole part plus a decimal part.",
        verify: () => Math.round((Number(dec) - w) * d) === n,
      });
    }
    return inputQ({
      instruction: "Write the decimal as a mixed number in simplest form.",
      prompt: dec,
      answer: `${w} ${n}/${d}`,
      accept: [`${w * d + n}/${d}`],
      answerFormat: "fraction",
      answerHint: "e.g. 2 3/4",
      hint: `Keep the whole part ${w}; turn the decimal part into a fraction and simplify.`,
      steps: [
        `The whole part is ${w}; the decimal part is ${fracDec}.`,
        `${fracDec} = {${n}/${d}} in simplest form.`,
        `So ${dec} = ${w} {${n}/${d}}.`,
      ],
      concept: "Split a decimal at the point: whole part plus fraction part.",
      verify: () => Math.round((Number(dec) - w) * d) === n,
    });
  },
};

/* --------------------------------------------------------------------- money */
/** params: kind "count" | "mixed". */
const COINS = [
  ["quarter", 25],
  ["dime", 10],
  ["nickel", 5],
] as const;

const moneyFam: GeneratorFamily = {
  stageLabel: (s, st) =>
    ["One kind of coin", "Mixed coins", "Coins into dollars", "Bills and totals", "Making amounts and change"][st - 1],
  generate(skill, stage, rng): RawQuestion {
    const kind = str(skill.params, "kind", "mixed");
    if (stage === 1) {
      const [name, value] = rng.pick(COINS);
      const count = rng.int(2, 9);
      const cents = count * value;
      return inputQ({
        instruction: `A ${name} is worth ${value}¢. How many cents are ${count} ${name}s?`,
        prompt: `${count} ${name}s = ? cents`,
        answer: String(cents),
        answerHint: "cents, e.g. 45",
        hint: `Skip count by ${value}s, ${count} times.`,
        steps: [
          `Each ${name} is ${value}¢.`,
          `${count} × ${value}¢ = ${cents}¢.`,
        ],
        concept: "Counting equal coins is multiplication.",
        verify: () => cents / value === count,
      });
    }
    if (stage === 2) {
      const [[n1, v1], [n2, v2]] = rng.sample(COINS, 2);
      const c1 = rng.int(1, 5);
      const c2 = rng.int(1, 5);
      const cents = c1 * v1 + c2 * v2;
      return inputQ({
        instruction: "Count the money in cents.",
        prompt: `${c1} ${n1}${c1 > 1 ? "s" : ""} and ${c2} ${n2}${c2 > 1 ? "s" : ""} = ? cents`,
        answer: String(cents),
        answerHint: "cents, e.g. 85",
        hint: `Count the ${n1}s first (${v1}¢ each), then add the ${n2}s (${v2}¢ each).`,
        steps: [
          `${c1} ${n1}${c1 > 1 ? "s" : ""}: ${c1} × ${v1}¢ = ${c1 * v1}¢.`,
          `${c2} ${n2}${c2 > 1 ? "s" : ""}: ${c2} × ${v2}¢ = ${c2 * v2}¢.`,
          `${c1 * v1}¢ + ${c2 * v2}¢ = ${cents}¢.`,
        ],
        concept: "Count the biggest coins first, then add the rest.",
        verify: () => c1 * v1 + c2 * v2 === cents,
      });
    }
    if (stage === 3) {
      const q = rng.int(2, 8);
      const d = rng.int(1, 5);
      const n = rng.int(0, 3);
      const cents = q * 25 + d * 10 + n * 5;
      return inputQ({
        instruction: "Write the total in dollars.",
        prompt: `${q} quarters, ${d} dime${d > 1 ? "s" : ""}${n > 0 ? ` and ${n} nickel${n > 1 ? "s" : ""}` : ""} = $?`,
        answer: moneyAns(cents),
        answerFormat: "decimal",
        answerHint: "dollars, e.g. 1.45",
        hint: "Find the total in cents first; 100 cents make a dollar.",
        steps: [
          `${q} × 25¢ + ${d} × 10¢${n > 0 ? ` + ${n} × 5¢` : ""} = ${cents}¢.`,
          `${cents}¢ ÷ 100 = ${moneyDisp(cents)}.`,
        ],
        concept: "Dollars are just cents grouped in hundreds.",
        verify: () => q * 25 + d * 10 + n * 5 === cents,
      });
    }
    if (stage === 4) {
      if (kind === "count") {
        const bills = rng.int(1, 3);
        const billVal = rng.pick([5, 10] as const);
        const q = rng.int(1, 3);
        const d = rng.int(1, 4);
        const cents = bills * billVal * 100 + q * 25 + d * 10;
        return inputQ({
          instruction: "Count the money.",
          prompt: `${bills} $${billVal} bill${bills > 1 ? "s" : ""}, ${q} quarter${q > 1 ? "s" : ""} and ${d} dime${d > 1 ? "s" : ""} = $?`,
          answer: moneyAns(cents),
          answerFormat: "decimal",
          answerHint: "dollars, e.g. 11.45",
          hint: "Count bills as dollars, coins as cents, then combine.",
          steps: [
            `Bills: ${bills} × $${billVal} = $${bills * billVal}.`,
            `Coins: ${q} × 25¢ + ${d} × 10¢ = ${q * 25 + d * 10}¢.`,
            `Total: ${moneyDisp(cents)}.`,
          ],
          concept: "Bills and coins combine as dollars plus cents.",
          verify: () => bills * billVal * 100 + q * 25 + d * 10 === cents,
        });
      }
      const name = pickName(rng);
      const a = rng.int(105, 999);
      const b = rng.int(105, 999);
      const total = a + b;
      return inputQ({
        instruction: "Solve the problem.",
        prompt: `${name} buys a snack for ${moneyDisp(a)} and a drink for ${moneyDisp(b)}. How much does ${name} spend in total?`,
        answer: moneyAns(total),
        answerFormat: "decimal",
        answerHint: "dollars, e.g. 4.50",
        hint: "Add the two prices — line up the dollars and cents.",
        steps: [
          `In cents: ${a} + ${b} = ${total}.`,
          `${total}¢ = ${moneyDisp(total)}.`,
        ],
        concept: "Money adds like any decimal once the points line up.",
        representation: "word",
        verify: () => total - b === a,
      });
    }
    if (kind === "count") {
      const [coinName, value] = rng.pick(COINS);
      const count = rng.int(4, 20);
      const cents = count * value;
      return inputQ({
        instruction: "How many coins?",
        prompt: `How many ${coinName}s make ${moneyDisp(cents)}?`,
        answer: String(count),
        answerHint: "e.g. 8",
        hint: `Convert to cents, then divide by ${value}.`,
        steps: [
          `${moneyDisp(cents)} = ${cents}¢.`,
          `${cents} ÷ ${value} = ${count} ${coinName}s.`,
        ],
        concept: "Finding how many coins fit is division.",
        verify: () => count * value === cents,
      });
    }
    const name = pickName(rng);
    const paidDollars = rng.pick([5, 10, 20] as const);
    const cost = rng.int(105, paidDollars * 100 - 15);
    const change = paidDollars * 100 - cost;
    return inputQ({
      instruction: "Find the change.",
      prompt: `${name} buys a toy for ${moneyDisp(cost)} and pays with a $${paidDollars} bill. How much change does ${name} get?`,
      answer: moneyAns(change),
      answerFormat: "decimal",
      answerHint: "dollars, e.g. 2.35",
      hint: `Change = what was paid minus the cost.`,
      steps: [
        `In cents: ${paidDollars * 100} − ${cost} = ${change}.`,
        `${change}¢ = ${moneyDisp(change)}.`,
        `Check: ${moneyDisp(cost)} + ${moneyDisp(change)} = $${paidDollars}.00.`,
      ],
      concept: "Change is the difference between paying and the price.",
      representation: "word",
      verify: () => cost + change === paidDollars * 100,
    });
  },
};

/* ------------------------------------------------------------- percent-basic */
/** params: kind "convert" | "of-number" | "mixed". */
const percentBasic: GeneratorFamily = {
  stageLabel: (s, st) =>
    ["Out of 100", "Percent & decimals", "Fractions to percents", "What percent?", "Tricky percents"][st - 1],
  generate(skill, stage, rng): RawQuestion {
    const kind = str(skill.params, "kind", "mixed");
    const convert = kind === "convert" || (kind !== "of-number" && rng.chance(0.5));

    if (convert) {
      if (stage === 1) {
        const n = rng.int(5, 95);
        return inputQ({
          instruction: "Write it as a percent.",
          prompt: `${n} of the 100 squares on a grid are shaded. What percent of the grid is shaded?`,
          answer: String(n),
          accept: [`${n}%`],
          answerHint: "percent, e.g. 43",
          hint: "Percent means \"out of 100\".",
          steps: [
            `${n} out of 100 is exactly what percent means.`,
            `{${n}/100} = ${n}%.`,
          ],
          concept: "Percent literally means per hundred.",
          verify: () => n >= 0 && n <= 100,
        });
      }
      if (stage === 2) {
        const p = rng.int(1, 19) * 5;
        const dec = fmtU(p, 2);
        if (rng.chance(0.5)) {
          return inputQ({
            instruction: "Write the percent as a decimal.",
            prompt: `${p}% = ?`,
            answer: dec,
            answerFormat: "decimal",
            answerHint: "e.g. 0.45",
            hint: "Percent means out of 100 — divide by 100.",
            steps: [
              `${p}% = {${p}/100}.`,
              `${p} ÷ 100 = ${dec} (the decimal point moves 2 places left).`,
            ],
            concept: "Dividing by 100 turns a percent into a decimal.",
            verify: () => toUnits(dec, 2) === p,
          });
        }
        return inputQ({
          instruction: "Write the decimal as a percent.",
          prompt: `${dec} = ?%`,
          answer: String(p),
          accept: [`${p}%`],
          answerHint: "percent, e.g. 45",
          hint: "Multiply by 100 — the decimal point moves 2 places right.",
          steps: [
            `${dec} × 100 = ${p}.`,
            `So ${dec} = ${p}%.`,
          ],
          concept: "Multiplying by 100 turns a decimal into a percent.",
          verify: () => toUnits(dec, 2) === p,
        });
      }
      if (stage === 3) {
        const d = rng.pick([2, 4, 5, 10, 20, 25, 50] as const);
        let n = rng.int(1, d - 1);
        while (gcd(n, d) !== 1) n = rng.int(1, d - 1);
        const pct = (n * 100) / d;
        return inputQ({
          instruction: "Write the fraction as a percent.",
          prompt: `{${n}/${d}} = ?%`,
          answer: String(pct),
          accept: [`${pct}%`],
          answerHint: "percent, e.g. 75",
          hint: `Make an equivalent fraction with denominator 100: multiply top and bottom by ${100 / d}.`,
          steps: [
            `{${n}/${d}} = {${pct}/100} because ${d} × ${100 / d} = 100.`,
            `{${pct}/100} = ${pct}%.`,
          ],
          concept: "Rewriting over 100 reads off the percent directly.",
          verify: () => (pct * d) / 100 === n,
        });
      }
      if (stage === 4) {
        const digit = rng.int(1, 9);
        const form = rng.pick(["small", "tenth", "over1"] as const);
        const units = form === "small" ? digit : form === "tenth" ? digit * 10 : 100 + digit * 10; // hundredths
        const disp = fmtU(units, 2); // 0.07, 0.7 or 1.7
        const pct = units; // percent value equals the hundredths count
        const correct = `${pct}%`;
        const wrongs = [`${pct * 10}%`, pct % 10 === 0 ? `${pct / 10}%` : `${pct * 100}%`, `${disp}%`];
        return mcQ({
          instruction: `Write ${disp} as a percent.`,
          prompt: `${disp} = ?`,
          choices: mcChoices(rng, correct, wrongs),
          answer: correct,
          hint: "Move the decimal point exactly 2 places right — no more, no less.",
          steps: [
            `${disp} × 100 = ${pct}.`,
            `So ${disp} = ${pct}% — a misplaced decimal point gives ${pct * 10}% or ${wrongs[1]}, both wrong.`,
          ],
          concept: "Decimal to percent is a two-place shift, even for small or large values.",
          verify: () => toUnits(disp, 2) === pct,
        });
      }
      // Stage 5: half-percent values like 12.5% and eighths.
      const pt = rng.pick([50, 125, 375, 625, 875, 1500] as const); // tenths of a percent
      const dec = fmtU(pt, 3); // p% as decimal: pt/1000
      const pctDisp = fmtU(pt, 1); // e.g. "12.5"
      if (rng.chance(0.5)) {
        return inputQ({
          instruction: "Write the percent as a decimal.",
          prompt: `${pctDisp}% = ?`,
          answer: dec,
          answerFormat: "decimal",
          answerHint: "e.g. 0.125",
          hint: "Divide by 100 — the point moves 2 places left, even past other digits.",
          steps: [
            `${pctDisp} ÷ 100 = ${dec}.`,
            `Check: ${dec} × 100 = ${pctDisp}.`,
          ],
          concept: "Percents can have decimal parts and still convert the same way.",
          verify: () => toUnits(dec, 3) === pt,
        });
      }
      return inputQ({
        instruction: "Write the decimal as a percent.",
        prompt: `${dec} = ?%`,
        answer: pctDisp,
        accept: [`${pctDisp}%`],
        answerFormat: "decimal",
        answerHint: "percent, e.g. 12.5",
        hint: "Multiply by 100 — the point moves 2 places right.",
        steps: [
          `${dec} × 100 = ${pctDisp}.`,
          `So ${dec} = ${pctDisp}%.`,
        ],
        concept: "The two-place shift works even when the percent is not whole.",
        verify: () => toUnits(dec, 3) === pt,
      });
    }

    // ---- of-number strand ----
    if (stage === 1) {
      const p = rng.pick([10, 50, 100] as const);
      const base = rng.int(2, 20) * 10;
      const ans = (base * p) / 100;
      return inputQ({
        instruction: "Find the percent of the number.",
        prompt: `${p}% of ${base} = ?`,
        answer: String(ans),
        hint: p === 10 ? "10% is one tenth — divide by 10." : p === 50 ? "50% is one half." : "100% is the whole thing.",
        steps: [
          p === 10
            ? `10% = {1/10}, so divide by 10: ${base} ÷ 10 = ${ans}.`
            : p === 50
              ? `50% = {1/2}, so halve it: ${base} ÷ 2 = ${ans}.`
              : `100% of a number is the number itself: ${ans}.`,
          `So ${p}% of ${base} is ${ans}.`,
        ],
        concept: "Benchmark percents match simple fractions.",
        verify: () => (ans * 100) / p === base,
      });
    }
    if (stage === 2) {
      const p = rng.pick([20, 25, 75, 5] as const);
      const base = rng.int(2, 15) * 20;
      const ans = (base * p) / 100;
      return inputQ({
        instruction: "Find the percent of the number.",
        prompt: `${p}% of ${base} = ?`,
        answer: String(ans),
        hint:
          p === 25 ? "25% is one quarter." : p === 75 ? "75% is three quarters." : p === 20 ? "20% is one fifth." : "5% is half of 10%.",
        steps: [
          p === 5
            ? `10% of ${base} = ${base / 10}; half of that is ${ans}.`
            : `${p}% = {${p % 25 === 0 ? p / 25 : p / 20}/${p % 25 === 0 ? 4 : 5}}, so divide ${base} by ${p % 25 === 0 ? 4 : 5}${p > 25 ? " and multiply by " + (p % 25 === 0 ? p / 25 : p / 20) : ""}.`,
          `${p}% of ${base} = ${ans}.`,
        ],
        concept: "Quarter and fifth percents come from dividing by 4 or 5.",
        verify: () => (ans * 100) / p === base,
      });
    }
    if (stage === 3) {
      const p = rng.pick([15, 30, 40, 60, 70, 80, 90, 35] as const);
      const base = rng.int(2, 25) * 20;
      const ans = (base * p) / 100;
      const ten = base / 10;
      return inputQ({
        instruction: "Find the percent of the number.",
        prompt: `${p}% of ${base} = ?`,
        answer: String(ans),
        hint: `Build from 10%: 10% of ${base} is ${ten}.`,
        steps: [
          `10% of ${base} = ${ten}.`,
          p % 10 === 0
            ? `${p}% = ${p / 10} × 10%, so ${p / 10} × ${ten} = ${ans}.`
            : `${Math.floor(p / 10) * 10}% = ${Math.floor(p / 10) * ten} and 5% = ${ten / 2}; together ${ans}.`,
        ],
        concept: "10% is a building block for every other percent.",
        verify: () => (ans * 100) / p === base,
      });
    }
    if (stage === 4) {
      const d = rng.pick([2, 4, 5, 10, 20, 25] as const);
      let n = rng.int(1, d - 1);
      while (gcd(n, d) !== 1) n = rng.int(1, d - 1);
      const B = d * rng.int(2, 12);
      const A = (B * n) / d;
      const pct = (n * 100) / d;
      return inputQ({
        instruction: "Find the percent.",
        prompt: `What percent of ${B} is ${A}?`,
        answer: String(pct),
        accept: [`${pct}%`],
        answerHint: "percent, e.g. 25",
        hint: `Write the part over the whole: {${A}/${B}}, then convert to a percent.`,
        steps: [
          `{${A}/${B}} = {${n}/${d}} in simplest form.`,
          `{${n}/${d}} = {${pct}/100} = ${pct}%.`,
        ],
        concept: "Percent questions are part-over-whole in disguise.",
        verify: () => (B * pct) / 100 === A,
      });
    }
    const p = rng.pick([10, 20, 25, 40, 50, 75, 5] as const);
    const W = (100 / gcd(100, p)) * rng.int(1, 12);
    const A = (W * p) / 100;
    return inputQ({
      instruction: "Find the whole.",
      prompt: `${p}% of a number is ${A}. What is the number?`,
      answer: String(W),
      hint: `If ${p}% is ${A}, first find 1% (or use ${p}% = {${p / gcd(100, p)}/${100 / gcd(100, p)}}).`,
      steps: [
        `${p}% of the number is ${A}, so 1% is ${A} ÷ ${p}, and 100% is that × 100.`,
        `${A} × 100 ÷ ${p} = ${W}.`,
        `Check: ${p}% of ${W} = ${A}. ✓`,
      ],
      concept: "Scale from the known percent back up to 100%.",
      verify: () => (W * p) / 100 === A,
    });
  },
};

/* -------------------------------------------------------------- percent-apps */
/** params: kind "increase" | "decrease" | "discount" | "markup" | "tax" | "whole". */
const percentApps: GeneratorFamily = {
  stageLabel: (s, st) =>
    ["The percent amount", "The new total", "Bigger changes", "Find the percent", "Work backwards"][st - 1],
  generate(skill, stage, rng): RawQuestion {
    const kindParam = str(skill.params, "kind", "mixed");
    if (kindParam === "whole") {
      const p = rng.pick([10, 20, 25, 50, 40, 75, 5] as const);
      const scale = [1, 2, 4, 8, 12][stage - 1];
      const W = (100 / gcd(100, p)) * rng.int(1, Math.max(2, scale));
      const A = (W * p) / 100;
      const name = pickName(rng);
      return inputQ({
        instruction: "Find the whole amount.",
        prompt: `${name} has saved $${A}, which is ${p}% of the price of a bike. What is the full price of the bike?`,
        answer: String(W),
        answerHint: "dollars, e.g. 240",
        hint: `$${A} is only ${p} parts out of 100 — scale up to all 100 parts.`,
        steps: [
          `${p}% of the price = $${A}.`,
          `1% of the price = ${A} ÷ ${p} dollars, so 100% = ${A} × 100 ÷ ${p} = $${W}.`,
          `Check: ${p}% of $${W} = $${A}. ✓`,
        ],
        concept: "Knowing any percent of a whole lets you rebuild the whole.",
        representation: "word",
        verify: () => (W * p) / 100 === A,
      });
    }
    const kind =
      kindParam === "mixed"
        ? rng.pick(["discount", "tax", "increase", "decrease"] as const)
        : (kindParam as "increase" | "decrease" | "discount" | "markup" | "tax");
    const isMoney = kind === "discount" || kind === "markup" || kind === "tax";
    const grows = kind === "tax" || kind === "markup" || kind === "increase";
    const p = rng.pick(stage >= 3 ? ([5, 10, 15, 20, 25, 30, 40, 50] as const) : ([10, 20, 25, 50] as const));
    const noun = kind === "discount" ? "discount" : kind === "markup" ? "markup" : kind === "tax" ? "tax" : kind;
    const D = rng.int(stage >= 3 ? 2 : 1, stage >= 3 ? 19 : 9) * 20; // multiple of 20 keeps every 5% step exact
    const amount = (D * p) / 100; // exact by construction (D multiple of 20 covers p=5,15,...)
    const after = grows ? D + amount : D - amount;
    const item = isMoney ? rng.pick(["jacket", "backpack", "skateboard", "video game", "pair of shoes"] as const) : "";

    if (stage === 1) {
      const prompt = isMoney
        ? `A ${item} costs $${D}. The ${noun} is ${p}%. How many dollars is the ${noun}?`
        : `A team scored ${D} points last season. This season the total ${grows ? "went up" : "went down"} by ${p}%. By how many points did it change?`;
      return inputQ({
        instruction: `Find the ${isMoney ? noun : "change"} amount.`,
        prompt,
        answer: String(amount),
        answerHint: isMoney ? "dollars, e.g. 12" : "e.g. 12",
        hint: `Find ${p}% of ${D}.`,
        steps: [
          `${p}% of ${D} = ${D} × ${p} ÷ 100.`,
          `${D} × ${p} ÷ 100 = ${amount}.`,
        ],
        concept: "A percent change starts with a percent-of calculation.",
        representation: "word",
        verify: () => (amount * 100) / p === D,
      });
    }
    if (stage === 2 || stage === 3) {
      const prompt = isMoney
        ? kind === "discount"
          ? `A ${item} costs $${D} and is on sale at ${p}% off. What is the sale price?`
          : kind === "tax"
            ? `A ${item} costs $${D} plus ${p}% tax. What is the total price?`
            : `A store buys a ${item} for $${D} and marks it up ${p}%. What is the selling price?`
        : `A town's fair had ${D} visitors last year. This year attendance ${grows ? "increased" : "decreased"} by ${p}%. How many visitors came this year?`;
      return inputQ({
        instruction: isMoney ? "Find the final price." : "Find the new amount.",
        prompt,
        answer: String(after),
        answerHint: isMoney ? "dollars, e.g. 48" : "e.g. 480",
        hint: `First find ${p}% of ${D}, then ${grows ? "add it to" : "subtract it from"} ${D}.`,
        steps: [
          `${p}% of ${D} = ${amount}.`,
          `${D} ${grows ? "+" : "−"} ${amount} = ${after}.`,
          grows
            ? `Adding the ${noun === "increase" ? "increase" : noun} gives the new total.`
            : `Taking the ${noun === "decrease" ? "decrease" : noun} off gives what is left.`,
        ],
        concept: grows
          ? "New total = original + percent of original."
          : "New total = original − percent of original.",
        representation: "word",
        verify: () => (grows ? after - amount === D : after + amount === D),
      });
    }
    if (stage === 4) {
      const prompt = isMoney
        ? `The price of a ${item} ${grows ? "rose" : "dropped"} from $${D} to $${after}. What percent ${grows ? "increase" : "decrease"} is that?`
        : `A club ${grows ? "grew" : "shrank"} from ${D} members to ${after} members. What is the percent ${grows ? "increase" : "decrease"}?`;
      return inputQ({
        instruction: "Find the percent change.",
        prompt,
        answer: String(p),
        accept: [`${p}%`],
        answerHint: "percent, e.g. 25",
        hint: "Percent change = change ÷ original × 100. Always divide by the ORIGINAL amount.",
        steps: [
          `The change is ${grows ? `${after} − ${D}` : `${D} − ${after}`} = ${amount}.`,
          `Divide by the original: {${amount}/${D}} = {${p}/100}.`,
          `So the ${grows ? "increase" : "decrease"} is ${p}%.`,
        ],
        concept: "Percent change always compares against the original value.",
        representation: "word",
        verify: () => (D * p) / 100 === amount,
      });
    }
    // Stage 5: work backwards to the original.
    const prompt = isMoney
      ? kind === "discount"
        ? `After a ${p}% discount, a ${item} costs $${after}. What was the original price?`
        : `A ${item} costs $${after} including ${p}% ${noun}. What was the price before ${noun}?`
      : `After a ${p}% ${grows ? "increase" : "decrease"}, a school has ${after} students. How many did it have before?`;
    return inputQ({
      instruction: "Find the original amount.",
      prompt,
      answer: String(D),
      answerHint: isMoney ? "dollars, e.g. 60" : "e.g. 400",
      hint: `The new amount is ${grows ? 100 + p : 100 - p}% of the original — divide, don't just ${grows ? "subtract" : "add"} ${p}%.`,
      steps: [
        `After the change, the amount is ${grows ? 100 + p : 100 - p}% of the original.`,
        `Original = ${after} ÷ ${grows ? 100 + p : 100 - p} × 100 = ${D}.`,
        `Check: ${p}% of ${D} is ${amount}, and ${D} ${grows ? "+" : "−"} ${amount} = ${after}. ✓`,
      ],
      concept: "Reverse a percent change by dividing by the new percent, not by shifting back.",
      representation: "word",
      verify: () => (grows ? after - (D * p) / 100 === D : after + (D * p) / 100 === D),
    });
  },
};

/* ------------------------------------------------------------------ interest */
/** params: kind "simple" | "compound" | "mixed". Compound appears at stages 4-5. */
const interest: GeneratorFamily = {
  stageLabel: (s, st) => {
    return ["One year of interest", "Interest over years", "The total amount", "Compound growth", "Compound vs simple"][st - 1];
  },
  generate(skill, stage, rng): RawQuestion {
    const kind = str(skill.params, "kind", "mixed");
    const P = rng.int(2, 20) * 100; // whole hundreds of dollars
    const r = rng.int(2, 10);
    const t = rng.int(2, 5);
    const name = pickName(rng);
    if (stage === 1) {
      const I = (P * r) / 100;
      return inputQ({
        instruction: "Find the simple interest for one year.",
        prompt: `${name} deposits $${P} at ${r}% simple interest per year. How much interest is earned in 1 year?`,
        answer: String(I),
        answerHint: "dollars, e.g. 40",
        hint: `Interest = principal × rate: ${r}% of $${P}.`,
        steps: [
          `Interest = P × r = ${P} × ${r} ÷ 100.`,
          `${P} × ${r} ÷ 100 = ${I}.`,
          `One year earns $${I}.`,
        ],
        concept: "Simple interest is a fixed percent of the principal each year.",
        representation: "word",
        verify: () => (I * 100) / r === P,
      });
    }
    if (stage === 2) {
      const I = (P * r * t) / 100;
      return inputQ({
        instruction: "Find the simple interest.",
        prompt: `${name} invests $${P} at ${r}% simple interest per year for ${t} years. How much interest is earned in total?`,
        answer: String(I),
        answerHint: "dollars, e.g. 120",
        hint: `I = P × r × t. Each year earns the same $${(P * r) / 100}.`,
        steps: [
          `One year: ${P} × ${r} ÷ 100 = ${(P * r) / 100}.`,
          `${t} years: ${(P * r) / 100} × ${t} = ${I}.`,
        ],
        concept: "Simple interest repeats the same yearly amount — it never compounds.",
        representation: "word",
        verify: () => I === ((P * r) / 100) * t,
      });
    }
    if (stage === 3) {
      const I = (P * r * t) / 100;
      const A = P + I;
      return inputQ({
        instruction: "Find the total amount.",
        prompt: `${name} borrows $${P} at ${r}% simple interest per year for ${t} years. How much must be paid back in total?`,
        answer: String(A),
        answerHint: "dollars, e.g. 560",
        hint: "Total = principal + all the interest: A = P + Prt.",
        steps: [
          `Interest: ${P} × ${r} ÷ 100 × ${t} = ${I}.`,
          `Total = principal + interest = ${P} + ${I} = ${A}.`,
        ],
        concept: "A loan repays the original amount plus its interest.",
        representation: "word",
        verify: () => A - I === P,
      });
    }
    if (kind === "simple") {
      // Honor the curriculum's simple-only skills: reverse problems instead of compound.
      if (stage === 4) {
        const I = (P * r * t) / 100;
        return inputQ({
          instruction: "Find the interest rate.",
          prompt: `$${P} earns $${I} in simple interest over ${t} years. What is the yearly interest rate, as a percent?`,
          answer: String(r),
          accept: [`${r}%`],
          answerHint: "percent, e.g. 5",
          hint: "Rearrange I = Prt: r = I ÷ (P × t) × 100.",
          steps: [
            `Interest per year: ${I} ÷ ${t} = ${I / t}.`,
            `Rate = ${I / t} ÷ ${P} × 100 = ${r}%.`,
            `Check: ${P} × ${r}% × ${t} = ${I}. ✓`,
          ],
          concept: "Any one variable in I = Prt can be found from the other three.",
          verify: () => (P * r * t) / 100 === I,
        });
      }
      const I = (P * r * t) / 100;
      return inputQ({
        instruction: "Find the principal.",
        prompt: `An account at ${r}% simple interest per year earned $${I} over ${t} years. How much was deposited at the start?`,
        answer: String(P),
        answerHint: "dollars, e.g. 800",
        hint: "Rearrange I = Prt: P = I × 100 ÷ (r × t).",
        steps: [
          `Each dollar earns ${r} cents a year (${r}%), so over ${t} years each dollar earns ${r * t} cents.`,
          `P = ${I} ÷ (${r} × ${t}) × 100 = ${P}.`,
          `Check: ${P} × ${r}% × ${t} = ${I}. ✓`,
        ],
        concept: "Work backwards from the interest to the starting deposit.",
        verify: () => (P * r * t) / 100 === I,
      });
    }
    if (stage === 4) {
      const k = P / 100;
      // P cents = 100P; after 1 year = P(100+r) cents; after 2 years = k(100+r)² cents — exact
      // because P is a whole multiple of $100.
      const y1c = P * (100 + r); // cents after year 1
      const y2c = k * (100 + r) ** 2; // cents after year 2
      return inputQ({
        instruction: "Find the amount after compound interest.",
        prompt: `${name} invests $${P} at ${r}% interest per year, compounded annually. How much is in the account after 2 years?`,
        answer: moneyAns(y2c),
        answerFormat: "decimal",
        answerHint: "dollars, e.g. 441.00",
        hint: `Grow the balance by ${r}% each year — year 2 earns interest on year 1's interest.`,
        steps: [
          `Year 1: ${P} × ${100 + r} ÷ 100 = ${moneyDisp(y1c)}.`,
          `Year 2: ${moneyDisp(y1c)} × ${100 + r} ÷ 100 = ${moneyDisp(y2c)}.`,
          `Compounding means each year's interest joins the principal.`,
        ],
        concept: "Compound interest earns interest on interest.",
        representation: "word",
        verify: () => {
          // Independent check via the closed form A = P(1+r/100)^2 in cents.
          const closed = Math.round(P * 100 * (1 + r / 100) ** 2);
          return closed === y2c;
        },
      });
    }
    // Stage 5: compound vs simple over 2 years — the difference is P(r/100)^2.
    const k = P / 100;
    const y2c = k * (100 + r) ** 2;
    const simple2c = P * 100 + 2 * P * r; // cents: P + 2·P·r%
    const diffC = y2c - simple2c;
    return inputQ({
      instruction: "Compare compound and simple interest.",
      prompt: `$${P} is invested for 2 years at ${r}% per year. How much MORE does annual compounding earn than simple interest?`,
      answer: moneyAns(diffC),
      answerFormat: "decimal",
      answerHint: "dollars, e.g. 1.00",
      hint: "Work out both totals, then subtract. Only year 2 differs.",
      steps: [
        `Simple: ${P} + 2 × ${(P * r) / 100} = ${moneyDisp(simple2c)}.`,
        `Compound: ${P} × ${100 + r} ÷ 100 = ${moneyDisp(P * (100 + r))}, then × ${100 + r} ÷ 100 = ${moneyDisp(y2c)}.`,
        `Difference: ${moneyDisp(y2c)} − ${moneyDisp(simple2c)} = ${moneyDisp(diffC)}.`,
        `That extra is interest earned on year 1's interest.`,
      ],
      concept: "Compounding beats simple interest by earning interest on interest.",
      representation: "word",
      verify: () => {
        // Closed form: the 2-year difference is exactly P·(r/100)² = k·r² cents.
        return diffC === k * r * r;
      },
    });
  },
};

export const decimalFamilies = {
  "dec-place-value": decPlaceValue,
  "dec-compare": decCompare,
  "dec-add-sub": decAddSub,
  "dec-mul": decMul,
  "dec-div": decDiv,
  "dec-round": decRound,
  "dec-frac-convert": decFracConvert,
  money: moneyFam,
  "percent-basic": percentBasic,
  "percent-apps": percentApps,
  interest,
} satisfies Record<string, GeneratorFamily>;
