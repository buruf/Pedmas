import type { GeneratorFamily, RawQuestion, Rng, SkillRef } from "../types";
import { inputQ, mcQ, mcChoices, nearNumbers, pickName, pickObject } from "./helpers";
import { fmtInt, gcd, lcm, isPrime, primeFactors, factorsOf, round } from "../num";

const num = (p: Record<string, unknown>, key: string, dflt: number): number =>
  typeof p[key] === "number" ? (p[key] as number) : dflt;

/* ---------------------------------------------------------------- counting */
const counting: GeneratorFamily = {
  stageLabel: (s, st) =>
    ["Count forward", "Before and after", "Count objects", "Missing numbers", "Counting in stories"][st - 1],
  generate(skill, stage, rng): RawQuestion {
    const max = num(skill.params, "max", 20);
    if (stage === 1) {
      const n = rng.int(1, Math.min(9, max - 1));
      return inputQ({
        instruction: "What number comes next?",
        prompt: `${n}, ${n + 1}, ${n + 2}, ...`,
        answer: String(n + 3),
        hint: "Count forward by 1.",
        steps: [`Count on from ${n + 2}: the next number is ${n + 3}.`],
        concept: "Counting forward adds 1 each time.",
        verify: () => n + 3 === n + 2 + 1,
      });
    }
    if (stage === 2) {
      const n = rng.int(2, max - 1);
      const before = rng.chance(0.5);
      return inputQ({
        instruction: before ? "What number comes just before?" : "What number comes just after?",
        prompt: String(n),
        answer: String(before ? n - 1 : n + 1),
        hint: before ? "Count back by 1." : "Count on by 1.",
        steps: [
          before
            ? `The number just before ${n} is ${n} − 1 = ${n - 1}.`
            : `The number just after ${n} is ${n} + 1 = ${n + 1}.`,
        ],
        concept: "Numbers line up in counting order.",
      });
    }
    if (stage === 3) {
      const count = rng.int(3, Math.min(12, max));
      const icon = rng.pick(["🍎", "⭐", "🔵", "🐟", "🌸"]);
      return inputQ({
        instruction: "Count the objects.",
        prompt: Array(count).fill(icon).join(" "),
        answer: String(count),
        hint: "Point to each one as you count.",
        steps: [`Count each ${icon} one at a time: there are ${count}.`],
        concept: "Say one number for each object you count.",
        representation: "visual",
      });
    }
    if (stage === 4) {
      const start = rng.int(1, max - 4);
      const miss = rng.int(1, 2);
      const seq = [0, 1, 2, 3].map((i) => (i === miss ? "__" : String(start + i)));
      return inputQ({
        instruction: "Fill in the missing number.",
        prompt: seq.join(", "),
        answer: String(start + miss),
        hint: "Count up from the first number.",
        steps: [`Count from ${start}: the missing number is ${start + miss}.`],
        concept: "A counting sequence goes up by 1.",
      });
    }
    const name = pickName(rng);
    const obj = pickObject(rng);
    const a = rng.int(2, Math.min(9, max - 3));
    return inputQ({
      instruction: "Solve the problem.",
      prompt: `${name} has ${a} ${obj} and gets 2 more. Counting on, how many now?`,
      answer: String(a + 2),
      hint: `Start at ${a} and count on 2 more.`,
      steps: [`Start at ${a}.`, `Count on: ${a + 1}, ${a + 2}.`, `${name} now has ${a + 2} ${obj}.`],
      concept: "Counting on is a way to add.",
      representation: "word",
      verify: () => a + 2 - 2 === a,
    });
  },
};

/* -------------------------------------------------------- compare-numbers */
const compareNumbers: GeneratorFamily = {
  stageLabel: (s, st) =>
    ["Which is greater", "Use < > =", "Bigger numbers", "Least and greatest", "Compare in stories"][st - 1],
  generate(skill, stage, rng): RawQuestion {
    const max = num(skill.params, "max", 100);
    const hi = [Math.min(10, max), Math.ceil(max / 4), max, max, max][stage - 1];
    let a = rng.int(0, hi);
    let b = rng.int(0, hi);
    if (stage <= 3) {
      while (b === a) b = rng.int(0, hi);
      if (stage === 1) {
        const ans = String(Math.max(a, b));
        return mcQ({
          instruction: "Which number is greater?",
          prompt: `${fmtInt(a)} or ${fmtInt(b)}`,
          // min and max+1 can never equal the answer, so there are always
          // at least two distinct distractors even when a difference collides.
          choices: mcChoices(rng, ans, [
            String(Math.min(a, b)),
            String(Math.max(a, b) + 1),
            String(Math.abs(a - b)),
          ]),
          answer: ans,
          hint: "The number farther along when counting is greater.",
          steps: [`${fmtInt(Math.max(a, b))} comes after ${fmtInt(Math.min(a, b))} when counting, so it is greater.`],
          concept: "Greater means more.",
          verify: () => Math.max(a, b) === (a > b ? a : b),
        });
      }
      const ans = a > b ? ">" : "<";
      return mcQ({
        instruction: "Choose the correct symbol.",
        prompt: `${fmtInt(a)} ___ ${fmtInt(b)}`,
        choices: rng.shuffle(["<", ">", "="]),
        answer: ans,
        hint: "The open side of the symbol faces the bigger number.",
        steps: [
          `Compare ${fmtInt(a)} and ${fmtInt(b)}.`,
          `${fmtInt(Math.max(a, b))} is greater, so ${fmtInt(a)} ${ans} ${fmtInt(b)}.`,
        ],
        concept: "< means less than, > means greater than.",
      });
    }
    if (stage === 4) {
      const nums = new Set<number>();
      while (nums.size < 4) nums.add(rng.int(0, hi));
      const arr = [...nums];
      const least = rng.chance(0.5);
      const ans = String(least ? Math.min(...arr) : Math.max(...arr));
      return mcQ({
        instruction: least ? "Which number is the least?" : "Which number is the greatest?",
        prompt: arr.map(fmtInt).join(", "),
        choices: rng.shuffle(arr.map((n) => String(n))),
        answer: ans,
        hint: least ? "Find the smallest value." : "Find the largest value.",
        steps: [`Order them: ${[...arr].sort((x, y) => x - y).map(fmtInt).join(" < ")}.`, `The ${least ? "least" : "greatest"} is ${fmtInt(Number(ans))}.`],
        concept: "Ordering numbers makes comparing easy.",
      });
    }
    while (b === a) b = rng.int(0, hi);
    const n1 = pickName(rng);
    const n2 = pickName(rng);
    const obj = pickObject(rng);
    const winner = a > b ? n1 : n2;
    return mcQ({
      instruction: "Read and compare.",
      prompt: `${n1} has ${fmtInt(a)} ${obj}. ${n2} has ${fmtInt(b)} ${obj}. Who has more?`,
      choices: rng.shuffle([n1, n2 === n1 ? `${n2} (2)` : n2, "They have the same"]),
      answer: winner,
      hint: "Compare the two amounts.",
      steps: [`${fmtInt(Math.max(a, b))} > ${fmtInt(Math.min(a, b))}, so ${winner} has more.`],
      concept: "Comparing tells us who has more or fewer.",
      representation: "word",
    });
  },
};

/* ---------------------------------------------------------- order-numbers */
const orderNumbers: GeneratorFamily = {
  stageLabel: () => "Ordering numbers",
  generate(skill, stage, rng): RawQuestion {
    const max = num(skill.params, "max", 100);
    const hi = [Math.min(20, max), Math.ceil(max / 2), max, max, max][stage - 1];
    const count = stage >= 4 ? 4 : 3;
    const set = new Set<number>();
    while (set.size < count) set.add(rng.int(0, hi));
    const arr = [...set];
    const asc = [...arr].sort((x, y) => x - y);
    if (stage === 5 || rng.chance(0.4)) {
      const want = rng.chance(0.5) ? "smallest" : "largest";
      const ans = want === "smallest" ? asc[0] : asc[asc.length - 1];
      return inputQ({
        instruction: `Type the ${want} number.`,
        prompt: arr.map(fmtInt).join(", "),
        answer: String(ans),
        hint: `Compare them one by one to find the ${want}.`,
        steps: [`In order: ${asc.map(fmtInt).join(", ")}.`, `The ${want} is ${fmtInt(ans)}.`],
        concept: "Ordering lines numbers up from least to greatest.",
      });
    }
    const correct = asc.map(fmtInt).join(", ");
    const desc = [...asc].reverse().map(fmtInt).join(", ");
    const swapped = [...asc];
    [swapped[0], swapped[1]] = [swapped[1], swapped[0]];
    return mcQ({
      instruction: "Which shows the numbers from least to greatest?",
      prompt: arr.map(fmtInt).join("   "),
      choices: mcChoices(rng, correct, [desc, swapped.map(fmtInt).join(", "), arr.map(fmtInt).join(", ")]),
      answer: correct,
      hint: "Start with the smallest number.",
      steps: [`Find the smallest, then the next: ${correct}.`],
      concept: "Least to greatest means going up.",
    });
  },
};

/* ------------------------------------------------------------ place-value */
const placeValue: GeneratorFamily = {
  stageLabel: (s, st) =>
    ["Tens and ones", "Digit values", "Expanded form", "Build the number", "Big numbers"][st - 1],
  generate(skill, stage, rng): RawQuestion {
    const max = num(skill.params, "max", 999);
    const digits = String(max).length;
    if (stage === 1) {
      const t = rng.int(1, 9);
      const o = rng.int(0, 9);
      return inputQ({
        instruction: "What number is this?",
        prompt: `${t} tens and ${o} ones`,
        answer: String(t * 10 + o),
        hint: "Tens count as 10 each.",
        steps: [`${t} tens = ${t * 10}.`, `${t * 10} + ${o} = ${t * 10 + o}.`],
        concept: "Each place in a number has a value.",
        verify: () => Math.floor((t * 10 + o) / 10) === t && (t * 10 + o) % 10 === o,
      });
    }
    let nDigits = Math.min(digits, stage >= 5 ? digits : stage + 1);
    let lo = 10 ** (nDigits - 1);
    // A round `max` (1000, 10000) makes the top band degenerate to a single
    // value, so step down until the band actually contains a range.
    while (nDigits > 1 && lo >= max) {
      nDigits--;
      lo = 10 ** (nDigits - 1);
    }
    const hi = Math.max(lo, Math.min(max, 10 ** nDigits - 1));
    const n = rng.int(lo, hi);
    const str = String(n);
    if (stage === 2 || stage === 5) {
      let pos = rng.int(0, str.length - 1);
      if (str[pos] === "0") pos = 0;
      const digit = Number(str[pos]);
      const value = digit * 10 ** (str.length - 1 - pos);
      return inputQ({
        instruction: `What is the value of the digit ${digit} in this number?`,
        prompt: fmtInt(n),
        answer: String(value),
        hint: "Look at which place the digit sits in.",
        steps: [
          `The digit ${digit} is in the ${placeName(str.length - 1 - pos)} place.`,
          `Its value is ${digit} × ${fmtInt(10 ** (str.length - 1 - pos))} = ${fmtInt(value)}.`,
        ],
        concept: "A digit's value depends on its place.",
        verify: () => String(n).includes(String(digit)) && value <= n,
      });
    }
    const parts = [...str]
      .map((d, i) => Number(d) * 10 ** (str.length - 1 - i))
      .filter((v) => v > 0);
    const expanded = parts.map(fmtInt).join(" + ");
    if (stage === 3) {
      const wrongParts = parts.map((v, i) => (i === 0 ? v * 10 : v));
      return mcQ({
        instruction: "Which is the expanded form?",
        prompt: fmtInt(n),
        choices: mcChoices(rng, expanded, [
          wrongParts.map(fmtInt).join(" + "),
          parts.map((v) => fmtInt(Math.max(1, Math.floor(v / 10)))).join(" + "),
          [...str].map((d) => d).join(" + "),
        ]),
        answer: expanded,
        hint: "Break the number into the value of each digit.",
        steps: [`${fmtInt(n)} = ${expanded}.`],
        concept: "Expanded form shows each digit's value.",
        verify: () => parts.reduce((a, b) => a + b, 0) === n,
      });
    }
    return inputQ({
      instruction: "What number is this?",
      prompt: expanded,
      answer: String(n),
      hint: "Add the place values together.",
      steps: [`${expanded} = ${fmtInt(n)}.`],
      concept: "Adding place values rebuilds the number.",
      verify: () => parts.reduce((a, b) => a + b, 0) === n,
    });
  },
};

function placeName(power: number): string {
  return (
    ["ones", "tens", "hundreds", "thousands", "ten-thousands", "hundred-thousands", "millions"][power] ??
    `10^${power}`
  );
}

/* ------------------------------------------------------------ number-line */
const numberLine: GeneratorFamily = {
  stageLabel: () => "Number lines",
  generate(skill, stage, rng): RawQuestion {
    const max = num(skill.params, "max", 100);
    if (stage <= 2) {
      const a = rng.int(0, Math.min(18, max - 2));
      return inputQ({
        instruction: "A number line goes up by 1.",
        prompt: `What number is 2 steps to the right of ${a}?`,
        answer: String(a + 2),
        hint: "Moving right means the numbers get bigger.",
        steps: [`Start at ${a}.`, `Move right 2 steps: ${a + 1}, then ${a + 2}.`],
        concept: "Right on a number line means greater.",
        representation: "number-line",
      });
    }
    if (stage === 3) {
      const a = rng.int(0, max - 10) & ~1;
      const b = a + rng.pick([2, 4, 6, 8, 10]);
      const mid = (a + b) / 2;
      return inputQ({
        instruction: "Find the number halfway between.",
        prompt: `${a} and ${b}`,
        answer: String(mid),
        hint: "Halfway is the same distance from both numbers.",
        steps: [`The gap from ${a} to ${b} is ${b - a}.`, `Half of ${b - a} is ${(b - a) / 2}.`, `${a} + ${(b - a) / 2} = ${mid}.`],
        concept: "Halfway means equal distance from both ends.",
        representation: "number-line",
        verify: () => mid - a === b - mid,
      });
    }
    const step = rng.pick([5, 10, 25]);
    const start = rng.int(0, 5) * step;
    const idx = rng.int(1, 3);
    const marks = [0, 1, 2, 3, 4].map((i) => (i === idx ? "?" : String(start + i * step)));
    return inputQ({
      instruction: "The marks on this number line are equally spaced. What is the missing number?",
      prompt: marks.join(" — "),
      answer: String(start + idx * step),
      hint: `Find how much each jump is worth.`,
      steps: [`Each jump is ${step}.`, `The missing mark is ${start + (idx - 1) * step} + ${step} = ${start + idx * step}.`],
      concept: "Equal spacing means equal jumps.",
      representation: "number-line",
    });
  },
};

/* --------------------------------------------------------------- odd-even */
const oddEven: GeneratorFamily = {
  stageLabel: () => "Odd and even",
  generate(skill, stage, rng): RawQuestion {
    const max = num(skill.params, "max", 100);
    const hi = [10, 20, max, max, max][stage - 1];
    const n = rng.int(1, hi);
    if (stage <= 2 || stage === 4) {
      const ans = n % 2 === 0 ? "Even" : "Odd";
      return mcQ({
        instruction: "Is this number odd or even?",
        prompt: fmtInt(n),
        choices: rng.shuffle(["Odd", "Even", "Neither"]),
        answer: ans,
        hint: "Even numbers can be split into two equal groups.",
        steps: [
          `Look at the ones digit of ${fmtInt(n)}: it is ${n % 10}.`,
          `${n % 10} ${n % 2 === 0 ? "is" : "is not"} one of 0, 2, 4, 6, 8, so ${fmtInt(n)} is ${ans.toLowerCase()}.`,
        ],
        concept: "The ones digit tells you odd or even.",
        verify: () => (n % 2 === 0) === (ans === "Even"),
      });
    }
    if (stage === 3) {
      const nums: number[] = [];
      while (nums.length < 4) {
        const v = rng.int(1, hi);
        if (!nums.includes(v)) nums.push(v);
      }
      const wantOdd = rng.chance(0.5);
      if (!nums.some((v) => v % 2 === (wantOdd ? 1 : 0))) nums[0] += 1;
      const matches = nums.filter((v) => v % 2 === (wantOdd ? 1 : 0));
      const ans = String(matches[0]);
      if (matches.length !== 1) {
        // Force exactly one match for a clean MC.
        const keep = matches[0];
        for (let i = 0; i < nums.length; i++) {
          if (nums[i] % 2 === (wantOdd ? 1 : 0) && nums[i] !== keep) nums[i] += 1;
        }
      }
      return mcQ({
        instruction: `Which number is ${wantOdd ? "odd" : "even"}?`,
        prompt: [...new Set(nums)].map(fmtInt).join(", "),
        choices: mcChoices(rng, ans, [...new Set(nums)].filter((v) => String(v) !== ans).map(String)),
        answer: ans,
        hint: "Check the ones digit of each number.",
        steps: [`${ans} ends in ${Number(ans) % 10}, so it is ${wantOdd ? "odd" : "even"}.`],
        concept: "0, 2, 4, 6, 8 in the ones place means even.",
      });
    }
    const a = rng.int(1, 20);
    const b = rng.int(1, 20);
    const ans = (a + b) % 2 === 0 ? "Even" : "Odd";
    return mcQ({
      instruction: "Without adding, is the sum odd or even?",
      prompt: `${a % 2 === 0 ? "even" : "odd"} + ${b % 2 === 0 ? "even" : "odd"}`,
      choices: rng.shuffle(["Odd", "Even", "You cannot tell"]),
      answer: ans,
      hint: "odd+odd and even+even are always even.",
      steps: [
        `${a % 2 === 0 ? "Even" : "Odd"} + ${b % 2 === 0 ? "even" : "odd"} is always ${ans.toLowerCase()}.`,
        `Example: ${a} + ${b} = ${a + b}, which is ${ans.toLowerCase()}.`,
      ],
      concept: "Parity rules let you predict sums without adding.",
      verify: () => ((a + b) % 2 === 0) === (ans === "Even"),
    });
  },
};

/* ---------------------------------------------------------- skip-counting */
const skipCounting: GeneratorFamily = {
  stageLabel: () => "Skip counting",
  generate(skill, stage, rng): RawQuestion {
    const steps = (skill.params.steps as number[] | undefined) ?? [2, 5, 10];
    const step = rng.pick(stage <= 2 ? steps.slice(0, 2) : steps);
    const start = stage >= 4 ? rng.int(1, 9) : step * rng.int(0, 3);
    const seq = [0, 1, 2, 3].map((i) => start + i * step);
    if (stage === 5) {
      const name = pickName(rng);
      const groups = rng.int(3, 6);
      return inputQ({
        instruction: "Skip count to solve.",
        prompt: `${name} puts marbles in bags of ${step}. How many marbles are in ${groups} bags?`,
        answer: String(step * groups),
        hint: `Count by ${step}s ${groups} times.`,
        steps: [
          `Count by ${step}s: ${Array.from({ length: groups }, (_, i) => step * (i + 1)).join(", ")}.`,
          `${groups} bags hold ${step * groups} marbles.`,
        ],
        concept: "Skip counting is repeated addition.",
        representation: "word",
        verify: () => step * groups === seqSum(step, groups),
      });
    }
    const missIdx = stage >= 3 ? rng.int(1, 2) : 3;
    const shown = seq.map((v, i) => (i === missIdx ? "__" : String(v)));
    return inputQ({
      instruction: `Skip count by ${step}s. Fill in the missing number.`,
      prompt: shown.join(", "),
      answer: String(seq[missIdx]),
      hint: `Each number goes up by ${step}.`,
      steps: [`${seq[missIdx - 1]} + ${step} = ${seq[missIdx]}.`],
      concept: `Counting by ${step}s adds ${step} each time.`,
      verify: () => seq[missIdx] - seq[missIdx - 1] === step,
    });
  },
};

function seqSum(step: number, groups: number): number {
  let t = 0;
  for (let i = 0; i < groups; i++) t += step;
  return t;
}

/* ---------------------------------------------------------------- rounding */
const rounding: GeneratorFamily = {
  stageLabel: (s, st) =>
    ["Nearest ten", "Nearest hundred", "Nearest thousand", "Any place", "Estimate with rounding"][st - 1],
  generate(skill, stage, rng): RawQuestion {
    const max = num(skill.params, "max", 10000);
    let place = [10, 100, 1000, rng.pick([10, 100, 1000]), rng.pick([10, 100])][stage - 1];
    // Rounding to a place the max cannot span leaves only one possible
    // number, so drop to a place that actually fits.
    while (place > 10 && place * 2 > max) place /= 10;
    const hi = Math.max(place + 1, Math.min(max, place * 90));
    let n = rng.int(place, hi);
    if (n % place === place / 2 && rng.chance(0.5)) n += 1;
    const rounded = Math.round(n / place) * place;
    if (stage === 5) {
      let b = rng.int(place, hi);
      if (b % place === place / 2) b += 1;
      const rb = Math.round(b / place) * place;
      const est = rounded + rb;
      return mcQ({
        instruction: `Estimate by rounding each number to the nearest ${place}.`,
        prompt: `${fmtInt(n)} + ${fmtInt(b)} ≈ ?`,
        choices: mcChoices(rng, fmtInt(est), [fmtInt(est + place), fmtInt(est - place), fmtInt(est + 2 * place)]),
        answer: fmtInt(est),
        hint: `Round both numbers first, then add.`,
        steps: [
          `${fmtInt(n)} rounds to ${fmtInt(rounded)}.`,
          `${fmtInt(b)} rounds to ${fmtInt(rb)}.`,
          `${fmtInt(rounded)} + ${fmtInt(rb)} = ${fmtInt(est)}.`,
        ],
        concept: "Rounding first makes estimating quick.",
        verify: () => Math.abs(est - (n + b)) <= place,
      });
    }
    return inputQ({
      instruction: `Round to the nearest ${place === 10 ? "ten" : place === 100 ? "hundred" : "thousand"}.`,
      prompt: fmtInt(n),
      answer: String(rounded),
      hint: `Look at the digit to the right of the ${place === 10 ? "tens" : place === 100 ? "hundreds" : "thousands"} place.`,
      steps: [
        `The deciding digit is ${Math.floor((n % place) / (place / 10))}.`,
        `${Math.floor((n % place) / (place / 10)) >= 5 ? "5 or more — round up" : "Less than 5 — round down"}: ${fmtInt(rounded)}.`,
      ],
      concept: "5 or more rounds up; less than 5 rounds down.",
      verify: () => Math.abs(rounded - n) <= place / 2 && rounded % place === 0,
    });
  },
};

/* -------------------------------------------------------------- estimation */
const estimation: GeneratorFamily = {
  stageLabel: () => "Estimation",
  generate(skill, stage, rng): RawQuestion {
    const place = stage <= 2 ? 10 : 100;
    const hi = stage >= 4 ? place * 80 : place * 40;
    let a = rng.int(place, hi);
    let b = rng.int(place, hi);
    if (a % place === place / 2) a += 1;
    if (b % place === place / 2) b += 1;
    const op = stage >= 3 && rng.chance(0.4) ? "-" : "+";
    if (op === "-" && b > a) [a, b] = [b, a];
    const ra = Math.round(a / place) * place;
    const rb = Math.round(b / place) * place;
    const est = op === "+" ? ra + rb : ra - rb;
    return mcQ({
      instruction: `Estimate by rounding to the nearest ${place}.`,
      prompt: `${fmtInt(a)} ${op} ${fmtInt(b)} ≈ ?`,
      choices: mcChoices(rng, fmtInt(est), [fmtInt(est + place), fmtInt(Math.max(0, est - place)), fmtInt(est + 3 * place)]),
      answer: fmtInt(est),
      hint: "Round each number first.",
      steps: [
        `${fmtInt(a)} ≈ ${fmtInt(ra)} and ${fmtInt(b)} ≈ ${fmtInt(rb)}.`,
        `${fmtInt(ra)} ${op} ${fmtInt(rb)} = ${fmtInt(est)}.`,
      ],
      concept: "An estimate should be close, not exact.",
      verify: () => Math.abs(est - (op === "+" ? a + b : a - b)) <= place,
    });
  },
};

/* -------------------------------------------------------- factors-multiples */
const factorsMultiples: GeneratorFamily = {
  stageLabel: (s, st) =>
    ["Multiples", "Find the multiple", "Find the factor", "Count factors", "Common multiples"][st - 1],
  generate(skill, stage, rng): RawQuestion {
    const max = num(skill.params, "max", 100);
    if (stage === 1) {
      const b = rng.int(2, 9);
      const k = rng.int(2, 5);
      return inputQ({
        instruction: `What is the ${ordinalWord(k)} multiple of ${b}?`,
        prompt: `Multiples of ${b}: ${b}, ${b * 2}, ...`,
        answer: String(b * k),
        hint: `Count by ${b}s.`,
        steps: [`Multiples of ${b}: ${Array.from({ length: k }, (_, i) => b * (i + 1)).join(", ")}.`],
        concept: "Multiples come from skip counting.",
        verify: () => (b * k) % b === 0,
      });
    }
    if (stage === 2) {
      const b = rng.int(3, 9);
      const ans = b * rng.int(3, Math.floor(max / b));
      const wrongs = [ans + 1, ans - 1, ans + b + 1].filter((w) => w % b !== 0);
      return mcQ({
        instruction: `Which number is a multiple of ${b}?`,
        prompt: `Think about the ${b} times table.`,
        choices: mcChoices(rng, String(ans), wrongs.map(String)),
        answer: String(ans),
        hint: `A multiple of ${b} is ${b} × some whole number.`,
        steps: [`${ans} = ${b} × ${ans / b}, so ${ans} is a multiple of ${b}.`],
        concept: "Multiples divide evenly by the number.",
        verify: () => ans % b === 0,
      });
    }
    if (stage === 3) {
      const n = rng.pick([12, 18, 20, 24, 30, 36, 40, 48].filter((v) => v <= max));
      const fs = factorsOf(n).filter((f) => f > 1 && f < n);
      const ans = String(rng.pick(fs));
      const wrongs: string[] = [];
      let w = rng.int(2, n - 1);
      while (wrongs.length < 3) {
        if (n % w !== 0 && !wrongs.includes(String(w))) wrongs.push(String(w));
        w = rng.int(2, n - 1);
      }
      return mcQ({
        instruction: `Which number is a factor of ${n}?`,
        prompt: `A factor divides ${n} with no remainder.`,
        choices: mcChoices(rng, ans, wrongs),
        answer: ans,
        hint: `Try dividing ${n} by each choice.`,
        steps: [`${n} ÷ ${ans} = ${n / Number(ans)} with no remainder, so ${ans} is a factor.`],
        concept: "Factors multiply together to make the number.",
        verify: () => n % Number(ans) === 0,
      });
    }
    if (stage === 4) {
      const n = rng.pick([12, 16, 18, 20, 24, 28, 36].filter((v) => v <= max));
      const fs = factorsOf(n);
      return inputQ({
        instruction: `How many factors does ${n} have?`,
        prompt: `Count every whole number that divides ${n} exactly (including 1 and ${n}).`,
        answer: String(fs.length),
        hint: "List factor pairs: 1 and the number itself always count.",
        steps: [`Factors of ${n}: ${fs.join(", ")}.`, `That is ${fs.length} factors.`],
        concept: "Factor pairs help you find every factor.",
        verify: () => fs.every((f) => n % f === 0),
      });
    }
    const a = rng.pick([2, 3, 4, 5, 6]);
    let b = rng.pick([2, 3, 4, 5, 6, 8, 10]);
    while (b === a) b = rng.pick([2, 3, 4, 5, 6, 8, 10]);
    const ans = lcm(a, b);
    return inputQ({
      instruction: `What is the smallest number that is a multiple of both ${a} and ${b}?`,
      prompt: `Multiples of ${a}: ${a}, ${a * 2}, ${a * 3}, ...  Multiples of ${b}: ${b}, ${b * 2}, ...`,
      answer: String(ans),
      hint: "List multiples of each until they match.",
      steps: [
        `Multiples of ${a}: ${[1, 2, 3, 4, 5, 6].map((k) => a * k).join(", ")}...`,
        `Multiples of ${b}: ${[1, 2, 3, 4].map((k) => b * k).join(", ")}...`,
        `The first shared multiple is ${ans}.`,
      ],
      concept: "The least common multiple is the first shared multiple.",
      verify: () => ans % a === 0 && ans % b === 0,
    });
  },
};

function ordinalWord(k: number): string {
  return ["first", "second", "third", "fourth", "fifth"][k - 1] ?? `${k}th`;
}

/* ------------------------------------------------------------------ gcf-lcm */
const gcfLcm: GeneratorFamily = {
  stageLabel: (s, st) =>
    ["GCF of small pairs", "LCM of small pairs", "GCF of larger pairs", "LCM of larger pairs", "GCF & LCM problems"][st - 1],
  generate(skill, stage, rng): RawQuestion {
    const small = stage <= 2;
    const wantGcf = stage === 1 || stage === 3 || (stage === 5 && rng.chance(0.5));
    const base = small ? rng.int(2, 6) : rng.int(3, 12);
    const a = base * rng.int(2, small ? 4 : 6);
    let b = base * rng.int(2, small ? 4 : 6);
    while (b === a) b = base * rng.int(2, small ? 4 : 6);
    const g = gcd(a, b);
    const l = lcm(a, b);
    if (stage === 5) {
      const name = pickName(rng);
      if (wantGcf) {
        return inputQ({
          instruction: "Solve the problem.",
          prompt: `${name} has ${a} red beads and ${b} blue beads. What is the greatest number of identical bracelets ${name} can make using every bead?`,
          answer: String(g),
          hint: "Each bracelet needs an equal share of both colours — find the GCF.",
          steps: [
            `Find the greatest common factor of ${a} and ${b}.`,
            `GCF(${a}, ${b}) = ${g}.`,
            `${name} can make ${g} bracelets (each with ${a / g} red and ${b / g} blue beads).`,
          ],
          concept: "GCF splits two quantities into the largest equal groups.",
          representation: "word",
          verify: () => a % g === 0 && b % g === 0,
        });
      }
      return inputQ({
        instruction: "Solve the problem.",
        prompt: `One bus leaves every ${a} minutes and another every ${b} minutes. They just left together. In how many minutes will they leave together again?`,
        answer: String(l),
        hint: "Find the least common multiple.",
        steps: [`LCM(${a}, ${b}) = ${l}.`, `They leave together again after ${l} minutes.`],
        concept: "LCM finds when repeating events line up.",
        representation: "word",
        verify: () => l % a === 0 && l % b === 0,
      });
    }
    const ans = wantGcf ? g : l;
    return inputQ({
      instruction: wantGcf
        ? `Find the greatest common factor (GCF) of ${a} and ${b}.`
        : `Find the least common multiple (LCM) of ${a} and ${b}.`,
      prompt: `${a} and ${b}`,
      answer: String(ans),
      hint: wantGcf ? "List the factors of each number." : "List multiples of each number.",
      steps: wantGcf
        ? [
            `Factors of ${a}: ${factorsOf(a).join(", ")}.`,
            `Factors of ${b}: ${factorsOf(b).join(", ")}.`,
            `The greatest shared factor is ${g}.`,
          ]
        : [
            `Multiples of ${a}: ${[1, 2, 3, 4].map((k) => a * k).join(", ")}...`,
            `Multiples of ${b}: ${[1, 2, 3, 4].map((k) => b * k).join(", ")}...`,
            `The least shared multiple is ${l}.`,
          ],
      concept: wantGcf ? "GCF is the biggest number dividing both." : "LCM is the smallest number both divide into.",
      verify: () => (wantGcf ? a % ans === 0 && b % ans === 0 : ans % a === 0 && ans % b === 0),
    });
  },
};

/* ------------------------------------------------------------------- primes */
const primes: GeneratorFamily = {
  stageLabel: (s, st) =>
    ["Prime or composite", "Spot the prime", "Prime factorization", "Primes in a range", "Prime puzzles"][st - 1],
  generate(skill, stage, rng): RawQuestion {
    if (stage === 1) {
      const n = rng.int(2, 30);
      const ans = isPrime(n) ? "Prime" : "Composite";
      return mcQ({
        instruction: "Is this number prime or composite?",
        prompt: String(n),
        choices: rng.shuffle(["Prime", "Composite", "Neither"]),
        answer: ans,
        hint: "A prime has exactly two factors: 1 and itself.",
        steps: [
          isPrime(n)
            ? `${n} has no factors other than 1 and ${n}, so it is prime.`
            : `${n} = ${primeFactors(n)[0]} × ${n / primeFactors(n)[0]}, so it is composite.`,
        ],
        concept: "Primes have exactly two factors.",
        verify: () => (ans === "Prime") === isPrime(n),
      });
    }
    if (stage === 2) {
      const primesList = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43];
      const p = rng.pick(primesList);
      const wrongs: number[] = [];
      while (wrongs.length < 3) {
        const c = rng.int(4, 45);
        if (!isPrime(c) && !wrongs.includes(c) && c !== p) wrongs.push(c);
      }
      return mcQ({
        instruction: "Which number is prime?",
        prompt: "Check each number's factors.",
        choices: mcChoices(rng, String(p), wrongs.map(String)),
        answer: String(p),
        hint: "Try dividing each by small primes: 2, 3, 5, 7.",
        steps: [`${p} is divisible only by 1 and ${p}, so it is prime.`],
        concept: "Test divisibility by small primes to check primality.",
        verify: () => isPrime(p) && wrongs.every((w) => !isPrime(w)),
      });
    }
    if (stage === 3) {
      const n = rng.pick([12, 18, 20, 24, 28, 36, 40, 45, 50, 54, 60]);
      const pf = primeFactors(n);
      const ans = pf.join(" * ");
      const alt1 = [...pf.slice(0, -1), pf[pf.length - 1] + 1].join(" * ");
      const alt2 = pf.length > 2 ? pf.slice(1).join(" * ") : `2 * ${n / 2}`;
      return mcQ({
        instruction: "Which is the prime factorization?",
        prompt: String(n),
        choices: mcChoices(rng, ans, [alt1, alt2, `1 * ${n}`]),
        answer: ans,
        hint: "Break the number down using a factor tree until all factors are prime.",
        steps: [`${n} = ${ans}.`, `Every factor listed is prime, and they multiply back to ${n}.`],
        concept: "Every whole number has one prime factorization.",
        verify: () => pf.reduce((x, y) => x * y, 1) === n && pf.every(isPrime),
      });
    }
    if (stage === 4) {
      const lo = rng.pick([1, 10, 20, 30]);
      const hi = lo + 10;
      const count = countPrimes(lo, hi);
      return inputQ({
        instruction: `How many prime numbers are there between ${lo} and ${hi}?`,
        prompt: `Count the primes from ${lo + 1} to ${hi - 1}.`,
        answer: String(count),
        hint: "List each number and test it.",
        steps: [
          `Primes strictly between ${lo} and ${hi}: ${listPrimes(lo, hi).join(", ") || "none"}.`,
          `That is ${count} prime${count === 1 ? "" : "s"}.`,
        ],
        concept: "Primes thin out but never stop.",
        verify: () => listPrimes(lo, hi).every(isPrime),
      });
    }
    const p1 = rng.pick([2, 3, 5, 7]);
    let p2 = rng.pick([2, 3, 5, 7, 11]);
    while (p2 === p1) p2 = rng.pick([2, 3, 5, 7, 11]);
    const n = p1 * p2;
    return inputQ({
      instruction: `A number is the product of exactly two different primes: ${p1} and one other. The number is ${n}. What is the other prime?`,
      prompt: `${p1} × ? = ${n}`,
      answer: String(p2),
      hint: `Divide ${n} by ${p1}.`,
      steps: [`${n} ÷ ${p1} = ${p2}.`, `${p2} is prime, so the other prime is ${p2}.`],
      concept: "Dividing by a known factor reveals the other factor.",
      verify: () => p1 * p2 === n && isPrime(p2),
    });
  },
};

function listPrimes(lo: number, hi: number): number[] {
  const out: number[] = [];
  for (let i = lo + 1; i < hi; i++) if (isPrime(i)) out.push(i);
  return out;
}
function countPrimes(lo: number, hi: number): number {
  return listPrimes(lo, hi).length;
}

/* ---------------------------------------------------------------- patterns */
const patterns: GeneratorFamily = {
  stageLabel: (s, st) =>
    ["Repeating patterns", "Growing patterns", "Pattern rules", "Missing terms", "Two-step rules"][st - 1],
  generate(skill, stage, rng): RawQuestion {
    if (stage === 1) {
      const icons = rng.sample(["🔴", "🔵", "🟡", "🟢", "⭐", "🔺"], 2);
      const unit = rng.pick([
        [0, 1],
        [0, 0, 1],
        [0, 1, 1],
      ]);
      const seq: string[] = [];
      for (let i = 0; i < 3; i++) for (const u of unit) seq.push(icons[u]);
      const nextIcon = icons[unit[0]];
      return mcQ({
        instruction: "What comes next in the pattern?",
        prompt: seq.join(" ") + " ...",
        choices: mcChoices(rng, nextIcon, ["🟣", icons[1 - unit[0]], "⬛"]),
        answer: nextIcon,
        hint: "Find the repeating part.",
        steps: [`The repeating unit is ${unit.map((u) => icons[u]).join(" ")}.`, `The pattern starts again with ${nextIcon}.`],
        concept: "Repeating patterns cycle through the same unit.",
        representation: "visual",
      });
    }
    const step = rng.int(2, stage >= 4 ? 12 : 6);
    const start = rng.int(1, 10);
    const mult = stage === 5 ? rng.int(2, 3) : 1;
    const rng2Const = stage === 5 ? rng.int(1, 5) : step;
    const seq = [start];
    for (let i = 0; i < 4; i++) seq.push(mult === 1 ? seq[i] + step : seq[i] * mult + rng2Const);
    if (stage === 3) {
      const ansRule = `Add ${step}`;
      return mcQ({
        instruction: "What is the pattern rule?",
        prompt: seq.slice(0, 4).join(", "),
        choices: mcChoices(rng, ansRule, [`Add ${step + 1}`, `Multiply by ${step}`, `Subtract ${step}`]),
        answer: ansRule,
        hint: "Compare each term with the next.",
        steps: [`${seq[1]} − ${seq[0]} = ${step}, and each step is the same.`, `The rule is: add ${step}.`],
        concept: "A pattern rule tells how to get the next term.",
        verify: () => seq[1] - seq[0] === step,
      });
    }
    const missIdx = stage >= 4 ? rng.int(1, 3) : 4;
    const shown = seq.map((v, i) => (i === missIdx ? "__" : String(v)));
    const ans = seq[missIdx];
    return inputQ({
      instruction:
        stage === 5
          ? `The rule is: multiply by ${mult}, then add ${rng2Const}. Fill in the missing term.`
          : "Fill in the missing term.",
      prompt: shown.join(", "),
      answer: String(ans),
      hint: stage === 5 ? "Apply the two-step rule to the term before the blank." : "Find how much the pattern grows each time.",
      steps:
        stage === 5
          ? [`${seq[missIdx - 1]} × ${mult} = ${seq[missIdx - 1] * mult}.`, `${seq[missIdx - 1] * mult} + ${rng2Const} = ${ans}.`]
          : [`Each term grows by ${step}.`, `${seq[missIdx - 1]} + ${step} = ${ans}.`],
      concept: "Patterns follow a rule you can test on every term.",
      verify: () => (stage === 5 ? seq[missIdx - 1] * mult + rng2Const === ans : seq[missIdx] - seq[missIdx - 1] === step),
    });
  },
};

export const foundationFamilies = {
  counting,
  "compare-numbers": compareNumbers,
  "order-numbers": orderNumbers,
  "place-value": placeValue,
  "number-line": numberLine,
  "odd-even": oddEven,
  "skip-counting": skipCounting,
  rounding,
  estimation,
  "factors-multiples": factorsMultiples,
  "gcf-lcm": gcfLcm,
  primes,
  patterns,
} satisfies Record<string, GeneratorFamily>;
