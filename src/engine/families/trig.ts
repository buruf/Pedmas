import type { GeneratorFamily, RawQuestion, Rng, SkillRef } from "../types";
import { inputQ, mcQ, mcChoices, lenU, bigLenU, unitLong } from "./helpers";

const str = (p: Record<string, unknown>, key: string, dflt: string): string =>
  typeof p[key] === "string" ? (p[key] as string) : dflt;
const num = (p: Record<string, unknown>, key: string, dflt: number): number =>
  typeof p[key] === "number" ? (p[key] as number) : dflt;

function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

/** Simplified plain-text fraction answer: "3/4", "-7/25", or an integer. */
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

const sx = (n: number): string => (n < 0 ? `−${-n}` : String(n));
const rad = (deg: number): number => (deg * Math.PI) / 180;

/** Pythagorean triples [opposite, adjacent, hypotenuse]. */
const TRIPLES: readonly [number, number, number][] = [
  [3, 4, 5],
  [5, 12, 13],
  [8, 15, 17],
  [7, 24, 25],
  [20, 21, 29],
  [9, 40, 41],
];

function pickTriple(rng: Rng, swap = true): [number, number, number] {
  const [a, b, c] = rng.pick(TRIPLES.slice(0, 4));
  return swap && rng.chance(0.5) ? [b, a, c] : [a, b, c];
}

/* ------------------------------------------------------- right-triangle-trig */
function rtSide(stage: number, rng: Rng, params: Record<string, unknown>): RawQuestion {
  const U = lenU(params);
  const B = bigLenU(params);
  const [o, a, h] = pickTriple(rng);
  if (stage === 1) {
    return inputQ({
      instruction: "Write the trig ratio as a fraction.",
      prompt: `In a right triangle, the side opposite angle θ is ${o} and the hypotenuse is ${h}. Find sin θ.`,
      answer: fracAns(o, h),
      answerFormat: "fraction",
      answerHint: "e.g. 3/5",
      hint: "SOH: sine is opposite over hypotenuse.",
      steps: [
        `sin θ = {opposite/hypotenuse}.`,
        `sin θ = {${o}/${h}}.`,
      ],
      concept: "Sine compares the opposite side with the hypotenuse.",
      verify: () => o * o + a * a === h * h,
    });
  }
  if (stage === 2) {
    const useCos = rng.chance(0.5);
    const ans = useCos ? fracAns(a, h) : fracAns(o, a);
    return inputQ({
      instruction: "Write the trig ratio as a fraction.",
      prompt: `A right triangle has legs ${o} (opposite θ) and ${a} (adjacent to θ), with hypotenuse ${h}. Find ${useCos ? "cos" : "tan"} θ.`,
      answer: ans,
      answerFormat: "fraction",
      answerHint: "e.g. 3/4",
      hint: useCos ? "CAH: cosine is adjacent over hypotenuse." : "TOA: tangent is opposite over adjacent.",
      steps: [
        useCos ? `cos θ = {adjacent/hypotenuse} = {${a}/${h}}.` : `tan θ = {opposite/adjacent} = {${o}/${a}}.`,
      ],
      concept: "SOH CAH TOA names each ratio's two sides.",
      verify: () => o * o + a * a === h * h,
    });
  }
  if (stage === 3) {
    const k = rng.int(1, 3);
    const findHyp = rng.chance(0.5);
    if (findHyp) {
      return inputQ({
        instruction: "Find the missing side.",
        prompt: `A right triangle has legs ${o * k} and ${a * k}. Find the hypotenuse.`,
        answer: String(h * k),
        hint: "Use the Pythagorean theorem.",
        steps: [
          `c^2 = ${o * k}^2 + ${a * k}^2 = ${o * o * k * k} + ${a * a * k * k} = ${h * h * k * k}.`,
          `c = sqrt(${h * h * k * k}) = ${h * k}.`,
        ],
        concept: "The hypotenuse comes from the sum of squared legs.",
        verify: () => (o * k) ** 2 + (a * k) ** 2 === (h * k) ** 2,
      });
    }
    return inputQ({
      instruction: "Find the missing side.",
      prompt: `A right triangle has hypotenuse ${h * k} and one leg ${a * k}. Find the other leg.`,
      answer: String(o * k),
      hint: "Rearrange the Pythagorean theorem: subtract the squares.",
      steps: [
        `b^2 = ${h * k}^2 − ${a * k}^2 = ${h * h * k * k} − ${a * a * k * k} = ${o * o * k * k}.`,
        `b = sqrt(${o * o * k * k}) = ${o * k}.`,
      ],
      concept: "A leg comes from the difference of squares.",
      verify: () => (o * k) ** 2 + (a * k) ** 2 === (h * k) ** 2,
    });
  }
  if (stage === 4) {
    const k = rng.int(2, 5);
    return inputQ({
      instruction: "Use the ratio to find the side.",
      prompt: `In a right triangle, sin θ = {${o}/${h}} and the hypotenuse is ${h * k} ${U}. Find the length of the side opposite θ, in ${U}.`,
      answer: String(o * k),
      hint: `sin θ = {opposite/hypotenuse}, so opposite = hypotenuse × sin θ.`,
      steps: [
        `opposite = ${h * k} × {${o}/${h}}.`,
        `= ${k} × ${o} = ${o * k}.`,
      ],
      concept: "A trig ratio scales with the triangle.",
      verify: () => (o * k) / (h * k) === o / h,
    });
  }
  const k = rng.int(1, 3);
  return inputQ({
    instruction: "Solve the problem.",
    prompt: `A ${h * k} ${B} ladder leans against a wall with its foot ${a * k} ${B} from the base of the wall. How high up the wall does the ladder reach, in ${unitLong(B)}?`,
    answer: String(o * k),
    hint: "The ladder, wall, and ground form a right triangle.",
    steps: [
      `height^2 = ${h * k}^2 − ${a * k}^2 = ${h * h * k * k} − ${a * a * k * k} = ${o * o * k * k}.`,
      `height = sqrt(${o * o * k * k}) = ${o * k} ${B}.`,
    ],
    concept: "Right-triangle tools solve real length problems.",
    verify: () => (o * k) ** 2 + (a * k) ** 2 === (h * k) ** 2,
    representation: "word",
  });
}

function rtAngle(stage: number, rng: Rng, params: Record<string, unknown>): RawQuestion {
  const B = bigLenU(params);
  if (stage === 1) {
    const which = rng.pick([
      ["opposite side to the hypotenuse", "sine", ["cosine", "tangent"]],
      ["adjacent side to the hypotenuse", "cosine", ["sine", "tangent"]],
      ["opposite side to the adjacent side", "tangent", ["sine", "cosine"]],
    ] as const);
    return mcQ({
      instruction: "Name the ratio.",
      prompt: `Which trig ratio compares the ${which[0]}?`,
      choices: mcChoices(rng, which[1], [...which[2]]),
      answer: which[1],
      hint: "Remember SOH CAH TOA.",
      steps: [
        `SOH CAH TOA: Sine = Opp/Hyp, Cosine = Adj/Hyp, Tangent = Opp/Adj.`,
        `The ${which[0]} ratio is ${which[1]}.`,
      ],
      concept: "Each trig ratio pairs two specific sides.",
    });
  }
  if (stage === 2) {
    const item = rng.pick([
      ["sin", "{1/2}", 30, 0.5],
      ["cos", "{1/2}", 60, 0.5],
      ["tan", "1", 45, 1],
      ["sin", "{√3/2}", 60, Math.sqrt(3) / 2],
      ["cos", "{√3/2}", 30, Math.sqrt(3) / 2],
    ] as const);
    return inputQ({
      instruction: "Find the acute angle, in degrees.",
      prompt: `${item[0]} θ = ${item[1]}, where 0° < θ < 90°. Find θ.`,
      answer: String(item[2]),
      hint: "This is one of the special angles: 30°, 45°, or 60°.",
      steps: [
        `${item[0]} ${item[2]}° = ${item[1]}.`,
        `θ = ${item[2]}°.`,
      ],
      concept: "Special angles have exact, memorable trig values.",
      verify: () => Math.abs(Math[item[0] as "sin" | "cos" | "tan"](rad(item[2])) - item[3]) < 1e-9,
    });
  }
  if (stage === 3 || stage === 4) {
    const [o, a, h] = pickTriple(rng);
    const fn = stage === 3 ? "tan" : rng.pick(["sin", "cos"] as const);
    const ratio = fn === "tan" ? [o, a] : fn === "sin" ? [o, h] : [a, h];
    const value = ratio[0] / ratio[1];
    const ans = Math.round((fn === "tan" ? Math.atan(value) : fn === "sin" ? Math.asin(value) : Math.acos(value)) / rad(1));
    return inputQ({
      instruction: "Find the angle. Round to the nearest degree.",
      prompt: `In a right triangle, ${fn} θ = {${ratio[0]}/${ratio[1]}}. Find θ in degrees.`,
      answer: String(ans),
      hint: `Use the inverse: θ = ${fn}^{−1}({${ratio[0]}/${ratio[1]}}).`,
      steps: [
        `${fn} θ = ${ratio[0]} ÷ ${ratio[1]}.`,
        `θ = ${fn}^{−1} of that value ≈ ${ans}°.`,
      ],
      concept: "Inverse trig functions turn a ratio back into an angle.",
      verify: () => {
        const inv = fn === "tan" ? Math.atan(value) : fn === "sin" ? Math.asin(value) : Math.acos(value);
        return Math.round(inv / rad(1)) === ans;
      },
    });
  }
  const [o, a] = pickTriple(rng);
  const ans = Math.round(Math.atan(o / a) / rad(1));
  return inputQ({
    instruction: "Solve the problem. Round to the nearest degree.",
    prompt: `A ramp rises ${o} ${B} over a horizontal distance of ${a} ${B}. What angle does it make with the ground, in degrees?`,
    answer: String(ans),
    hint: "Rise over run is the tangent of the angle.",
    steps: [
      `tan θ = {rise/run} = {${o}/${a}}.`,
      `θ = tan^{−1}({${o}/${a}}) ≈ ${ans}°.`,
    ],
    concept: "Slopes convert to angles through inverse tangent.",
    representation: "word",
    verify: () => Math.round(Math.atan(o / a) / rad(1)) === ans,
  });
}

const rightTriangleTrig: GeneratorFamily = {
  stageLabel(skill: SkillRef, st: number) {
    const find = str(skill.params, "find", "mixed");
    const labels: Record<string, string[]> = {
      side: ["Sine ratios", "Cosine and tangent", "Pythagorean sides", "Scale the ratio", "Length problems"],
      angle: ["Name the ratio", "Special angles", "Inverse tangent", "Inverse sine and cosine", "Angle problems"],
    };
    return (labels[find] ?? ["Trig ratios", "All three ratios", "Missing sides", "Find angles", "Applications"])[st - 1];
  },
  generate(skill, stage, rng): RawQuestion {
    let find = str(skill.params, "find", "mixed");
    if (find === "mixed") find = rng.pick(["side", "angle"]);
    return find === "angle" ? rtAngle(stage, rng, skill.params) : rtSide(stage, rng, skill.params);
  },
};

/* -------------------------------------------------------------- unit-circle */
const EXACT: Record<string, number> = {
  "0": 0,
  "1": 1,
  "−1": -1,
  "1/2": 0.5,
  "−1/2": -0.5,
  "√2/2": Math.SQRT1_2,
  "−√2/2": -Math.SQRT1_2,
  "√3/2": Math.sqrt(3) / 2,
  "−√3/2": -Math.sqrt(3) / 2,
  "√3": Math.sqrt(3),
  "−√3": -Math.sqrt(3),
  "√3/3": Math.sqrt(3) / 3,
  "−√3/3": -Math.sqrt(3) / 3,
};

/** The exact-value string whose numeric value matches v. */
function exactStr(v: number): string {
  for (const [s, x] of Object.entries(EXACT)) if (Math.abs(x - v) < 1e-9) return s;
  return String(v);
}

function unitCircleQ(rng: Rng, fn: "sin" | "cos" | "tan", angDeg: number, angDisp: string, pool: string[]): RawQuestion {
  const value = Math[fn](rad(angDeg));
  const ans = exactStr(value);
  const distractors = rng.shuffle(pool.filter((p) => p !== ans));
  const quadrant = angDeg % 90 === 0 ? "a quadrantal angle" : angDeg < 90 ? "in quadrant I" : angDeg < 180 ? "in quadrant II" : angDeg < 270 ? "in quadrant III" : "in quadrant IV";
  return mcQ({
    instruction: "Give the exact value.",
    prompt: `${fn}(${angDisp})`,
    choices: mcChoices(rng, ans, distractors),
    answer: ans,
    hint: `${angDisp} is ${quadrant} — find the reference angle and the sign there.`,
    steps: [
      `The reference angle of ${angDisp} is ${angDeg % 90 === 0 ? "on an axis" : `${angDeg <= 90 ? angDeg : angDeg <= 180 ? 180 - angDeg : angDeg <= 270 ? angDeg - 180 : 360 - angDeg}°`}.`,
      `${fn} is ${value >= 0 ? "positive" : "negative"} ${quadrant}.`,
      `${fn}(${angDisp}) = ${ans}.`,
    ],
    concept: "Reference angle gives the size; quadrant gives the sign.",
    verify: () => Math.abs(Math[fn](rad(angDeg)) - EXACT[ans]) < 1e-9,
  });
}

const unitCircle: GeneratorFamily = {
  stageLabel: (s, st) =>
    ["Quadrantal angles", "First-quadrant values", "Second quadrant", "All quadrants and tangent", "Radian measure"][st - 1],
  generate(skill, stage, rng): RawQuestion {
    if (stage === 1) {
      const ang = rng.pick([0, 90, 180, 270, 360]);
      const fn = rng.pick(["sin", "cos"] as const);
      return unitCircleQ(rng, fn, ang, `${ang}°`, ["0", "1", "−1"]);
    }
    if (stage === 2) {
      const ang = rng.pick([30, 45, 60]);
      const fn = rng.pick(["sin", "cos"] as const);
      return unitCircleQ(rng, fn, ang, `${ang}°`, ["1/2", "√2/2", "√3/2", "√3/3"]);
    }
    if (stage === 3) {
      const ang = rng.pick([120, 135, 150]);
      const fn = rng.pick(["sin", "cos"] as const);
      const value = Math[fn](rad(ang));
      const mag = exactStr(Math.abs(value));
      const pool = [mag, `−${mag}`, "1/2", "−1/2", "√3/2", "−√3/2", "√2/2", "−√2/2"];
      return unitCircleQ(rng, fn, ang, `${ang}°`, pool);
    }
    if (stage === 4) {
      if (rng.chance(0.5)) {
        const ang = rng.pick([210, 225, 240, 300, 315, 330]);
        const fn = rng.pick(["sin", "cos"] as const);
        return unitCircleQ(rng, fn, ang, `${ang}°`, ["1/2", "−1/2", "√2/2", "−√2/2", "√3/2", "−√3/2"]);
      }
      const ang = rng.pick([30, 45, 60, 120, 135, 150]);
      return unitCircleQ(rng, "tan", ang, `${ang}°`, ["1", "−1", "√3", "−√3", "√3/3", "−√3/3"]);
    }
    const item = rng.pick([
      ["π/6", 30],
      ["π/4", 45],
      ["π/3", 60],
      ["π/2", 90],
      ["2π/3", 120],
      ["3π/4", 135],
      ["5π/6", 150],
      ["π", 180],
    ] as const);
    const fn = rng.pick(["sin", "cos"] as const);
    return unitCircleQ(rng, fn, item[1], item[0], ["0", "1", "−1", "1/2", "−1/2", "√2/2", "−√2/2", "√3/2", "−√3/2"]);
  },
};

/* ------------------------------------------------------------ trig-identity */
function identityL1(stage: number, rng: Rng): RawQuestion {
  if (stage === 1) {
    // Same Pythagorean identity, asked in several rearranged forms and with
    // different angle symbols. Distractors are never equivalent to the answer.
    const v = rng.pick([
      {
        q: "sin^2 A + cos^2 A", a: "1", d: ["0", "sin 2A", "tan^2 A"],
        s: [
          "On the unit circle, sin A and cos A are legs of a right triangle with hypotenuse 1.",
          "The Pythagorean theorem gives sin^2 A + cos^2 A = 1.",
        ],
        f: (t: number) => Math.abs(Math.sin(t) ** 2 + Math.cos(t) ** 2 - 1),
      },
      {
        q: "1 − sin^2 A", a: "cos^2 A", d: ["sin^2 A", "tan^2 A", "2 cos A"],
        s: ["Start from sin^2 A + cos^2 A = 1.", "Subtract sin^2 A from both sides."],
        f: (t: number) => Math.abs(1 - Math.sin(t) ** 2 - Math.cos(t) ** 2),
      },
      {
        q: "1 − cos^2 A", a: "sin^2 A", d: ["cos^2 A", "tan^2 A", "2 sin A"],
        s: ["Start from sin^2 A + cos^2 A = 1.", "Subtract cos^2 A from both sides."],
        f: (t: number) => Math.abs(1 - Math.cos(t) ** 2 - Math.sin(t) ** 2),
      },
      {
        q: "1 + tan^2 A", a: "sec^2 A", d: ["1", "cot^2 A", "sin^2 A"],
        s: ["Divide sin^2 A + cos^2 A = 1 through by cos^2 A.", "That gives tan^2 A + 1 = sec^2 A."],
        f: (t: number) => Math.abs(1 + Math.tan(t) ** 2 - 1 / Math.cos(t) ** 2),
      },
      {
        q: "sec^2 A − tan^2 A", a: "1", d: ["0", "sin^2 A", "cot^2 A"],
        s: ["From 1 + tan^2 A = sec^2 A, move tan^2 A across.", "That leaves sec^2 A − tan^2 A = 1."],
        f: (t: number) => Math.abs(1 / Math.cos(t) ** 2 - Math.tan(t) ** 2 - 1),
      },
    ]);
    const sym = rng.pick(["θ", "x", "A", "β"]);
    const sub = (s: string) => s.replace(/A/g, sym);
    const ans = sub(v.a);
    return mcQ({
      instruction: "Complete the identity.",
      prompt: `${sub(v.q)} = ?`,
      choices: mcChoices(rng, ans, v.d.map(sub)),
      answer: ans,
      hint: "This comes from the Pythagorean identity.",
      steps: v.s.map(sub),
      concept: "sin²θ + cos²θ = 1 for every angle.",
      verify: () => v.f(0.83) < 1e-9,
    });
  }
  if (stage === 2 || stage === 4) {
    const [o, a, h] = pickTriple(rng);
    const givenCos = stage === 4;
    const ans = givenCos ? fracAns(o, a) : fracAns(a, h);
    return inputQ({
      instruction: "Use identities to find the other ratio (θ is acute).",
      prompt: givenCos
        ? `cos θ = {${a}/${h}}. Find tan θ.`
        : `sin θ = {${o}/${h}}. Find cos θ.`,
      answer: ans,
      answerFormat: "fraction",
      hint: givenCos
        ? `First find sin θ from sin^2 θ + cos^2 θ = 1, then divide.`
        : `Use sin^2 θ + cos^2 θ = 1.`,
      steps: givenCos
        ? [
            `sin^2 θ = 1 − {${a * a}/${h * h}} = {${o * o}/${h * h}}, so sin θ = {${o}/${h}}.`,
            `tan θ = {sin θ/cos θ} = {${o}/${h}} ÷ {${a}/${h}} = {${o}/${a}}.`,
          ]
        : [
            `cos^2 θ = 1 − sin^2 θ = 1 − {${o * o}/${h * h}} = {${a * a}/${h * h}}.`,
            `θ is acute, so cos θ is positive: cos θ = {${a}/${h}}.`,
          ],
      concept: "The Pythagorean identity links all three ratios.",
      verify: () => o * o + a * a === h * h,
    });
  }
  if (stage === 3) {
    const variant = rng.pick(["a", "b", "c"] as const);
    if (variant === "a" || variant === "b") {
      const sinFirst = variant === "a";
      const ans = sinFirst ? "cos^2 θ" : "sin^2 θ";
      return mcQ({
        instruction: "Simplify the expression.",
        prompt: sinFirst ? `1 − sin^2 θ` : `1 − cos^2 θ`,
        choices: mcChoices(rng, ans, [sinFirst ? "sin^2 θ" : "cos^2 θ", "1", "tan^2 θ"]),
        answer: ans,
        hint: "Rearrange the Pythagorean identity.",
        steps: [
          `sin^2 θ + cos^2 θ = 1.`,
          `So 1 − ${sinFirst ? "sin^2 θ = cos^2 θ" : "cos^2 θ = sin^2 θ"}.`,
        ],
        concept: "Each squared ratio is 1 minus the other.",
        verify: () => {
          const t = 0.61;
          const lhs = sinFirst ? 1 - Math.sin(t) ** 2 : 1 - Math.cos(t) ** 2;
          const rhs = sinFirst ? Math.cos(t) ** 2 : Math.sin(t) ** 2;
          return Math.abs(lhs - rhs) < 1e-12;
        },
      });
    }
    const ans = "{sin θ/cos θ}";
    return mcQ({
      instruction: "Complete the identity.",
      prompt: `tan θ = ?`,
      choices: mcChoices(rng, ans, ["{cos θ/sin θ}", "sin θ · cos θ", "1"]),
      answer: ans,
      hint: "Tangent is a quotient of the other two ratios.",
      steps: [
        `tan θ = {opposite/adjacent} = {opposite/hypotenuse} ÷ {adjacent/hypotenuse}.`,
        `= {sin θ/cos θ}.`,
      ],
      concept: "tan θ = sin θ / cos θ wherever cos θ ≠ 0.",
      verify: () => {
        const t = 0.47;
        return Math.abs(Math.tan(t) - Math.sin(t) / Math.cos(t)) < 1e-12;
      },
    });
  }
  const item = rng.pick([
    [`sin(90° − θ)`, "cos θ", (t: number) => Math.sin(Math.PI / 2 - t), (t: number) => Math.cos(t)],
    [`cos(90° − θ)`, "sin θ", (t: number) => Math.cos(Math.PI / 2 - t), (t: number) => Math.sin(t)],
    [`sin(−θ)`, "−sin θ", (t: number) => Math.sin(-t), (t: number) => -Math.sin(t)],
    [`cos(−θ)`, "cos θ", (t: number) => Math.cos(-t), (t: number) => Math.cos(t)],
  ] as const);
  const pool = ["sin θ", "cos θ", "−sin θ", "−cos θ", "tan θ"].filter((c) => c !== item[1]);
  return mcQ({
    instruction: "Simplify using identities.",
    prompt: `${item[0]} = ?`,
    choices: mcChoices(rng, item[1], rng.shuffle(pool)),
    answer: item[1],
    hint: item[0].includes("90") ? "Cofunctions: complementary angles swap sin and cos." : "Cosine is even; sine is odd.",
    steps: [
      item[0].includes("90")
        ? `Complementary angles: the sine of an angle equals the cosine of its complement.`
        : `Reflecting an angle flips sine's sign but leaves cosine unchanged.`,
      `${item[0]} = ${item[1]}.`,
    ],
    concept: item[0].includes("90") ? "Cofunction identities swap sin and cos." : "cos is an even function; sin is odd.",
    verify: () => {
      const t = 0.37 + 0.9 * rngIndependent();
      return Math.abs(item[2](t) - item[3](t)) < 1e-9;
    },
  });
}

/** Small deterministic offset so identity checks are not always at one angle. */
let seedTick = 0;
function rngIndependent(): number {
  seedTick = (seedTick + 1) % 7;
  return seedTick / 7;
}

function identityL2(stage: number, rng: Rng): RawQuestion {
  if (stage === 1) {
    const forward = rng.chance(0.5);
    const sym = rng.pick(["θ", "x", "A", "β"]);
    const ans = forward ? `2 sin ${sym} cos ${sym}` : `sin 2${sym}`;
    return mcQ({
      instruction: "Complete the double-angle identity.",
      prompt: forward ? `sin 2${sym} = ?` : `2 sin ${sym} cos ${sym} = ?`,
      choices: mcChoices(
        rng,
        ans,
        forward
          ? [`sin ${sym} cos ${sym}`, `2 sin ${sym}`, `cos^2 ${sym} − sin^2 ${sym}`]
          : [`cos 2${sym}`, `2 sin ${sym}`, `sin^2 ${sym}`]
      ),
      answer: ans,
      hint: "It comes from the sine addition formula with both angles equal.",
      steps: [
        `sin 2${sym} = sin(${sym} + ${sym}) = sin ${sym} cos ${sym} + cos ${sym} sin ${sym}.`,
        `= 2 sin ${sym} cos ${sym}.`,
      ],
      concept: "Double angles come from the addition formulas.",
      verify: () => {
        const t = 0.53;
        return Math.abs(Math.sin(2 * t) - 2 * Math.sin(t) * Math.cos(t)) < 1e-12;
      },
    });
  }
  if (stage === 2) {
    const sym = rng.pick(["θ", "x", "A", "β"]);
    // Only one listed option is ever equivalent to the prompt.
    const v = rng.pick([
      {
        q: `cos 2${sym}`, a: `cos^2 ${sym} − sin^2 ${sym}`,
        d: [`sin^2 ${sym} − cos^2 ${sym}`, `2 sin ${sym} cos ${sym}`, `1 + 2 sin^2 ${sym}`],
      },
      {
        q: `2 cos^2 ${sym} − 1`, a: `cos 2${sym}`,
        d: [`sin 2${sym}`, `2 cos ${sym}`, `cos ${sym}`],
      },
      {
        q: `1 − 2 sin^2 ${sym}`, a: `cos 2${sym}`,
        d: [`sin 2${sym}`, `2 sin ${sym}`, `tan 2${sym}`],
      },
    ]);
    return mcQ({
      instruction: "Complete the double-angle identity.",
      prompt: `${v.q} = ?`,
      choices: mcChoices(rng, v.a, v.d),
      answer: v.a,
      hint: "Watch the order: the cosine term comes first.",
      steps: [
        `cos 2${sym} = cos(${sym} + ${sym}) = cos ${sym} cos ${sym} − sin ${sym} sin ${sym} = cos^2 ${sym} − sin^2 ${sym}.`,
        `Using sin^2 ${sym} + cos^2 ${sym} = 1, this also equals 2 cos^2 ${sym} − 1 and 1 − 2 sin^2 ${sym}.`,
      ],
      concept: "cos 2θ has three equivalent forms, all from the addition formula.",
      verify: () => {
        const t = 0.71;
        return (
          Math.abs(Math.cos(2 * t) - (Math.cos(t) ** 2 - Math.sin(t) ** 2)) < 1e-12 &&
          Math.abs(Math.cos(2 * t) - (2 * Math.cos(t) ** 2 - 1)) < 1e-12 &&
          Math.abs(Math.cos(2 * t) - (1 - 2 * Math.sin(t) ** 2)) < 1e-12
        );
      },
    });
  }
  if (stage === 3) {
    const [o, a, h] = pickTriple(rng, false);
    const ans = fracAns(2 * o * a, h * h);
    return inputQ({
      instruction: "Evaluate the double angle (θ is acute).",
      prompt: `sin θ = {${o}/${h}} and cos θ = {${a}/${h}}. Find sin 2θ.`,
      answer: ans,
      answerFormat: "fraction",
      hint: `sin 2θ = 2 sin θ cos θ.`,
      steps: [
        `sin 2θ = 2 × {${o}/${h}} × {${a}/${h}}.`,
        `= {${2 * o * a}/${h * h}}.`,
      ],
      concept: "Double-angle formulas turn known ratios into new exact values.",
      verify: () => {
        const t = Math.asin(o / h);
        return Math.abs(Math.sin(2 * t) - (2 * o * a) / (h * h)) < 1e-9;
      },
    });
  }
  if (stage === 4) {
    const [o, , h] = pickTriple(rng, false);
    const ans = fracAns(h * h - 2 * o * o, h * h);
    return inputQ({
      instruction: "Evaluate the double angle (θ is acute).",
      prompt: `sin θ = {${o}/${h}}. Find cos 2θ.`,
      answer: ans,
      answerFormat: "fraction",
      hint: `Use cos 2θ = 1 − 2 sin^2 θ.`,
      steps: [
        `sin^2 θ = {${o * o}/${h * h}}.`,
        `cos 2θ = 1 − 2 × {${o * o}/${h * h}} = {${h * h - 2 * o * o}/${h * h}}.`,
      ],
      concept: "The 1 − 2sin²θ form needs only the sine.",
      verify: () => {
        const t = Math.asin(o / h);
        return Math.abs(Math.cos(2 * t) - (h * h - 2 * o * o) / (h * h)) < 1e-9;
      },
    });
  }
  const TRIPLES = [
    [3, 4, 5],
    [5, 12, 13],
    [8, 15, 17],
    [7, 24, 25],
    [20, 21, 29],
  ] as const;
  const [first, second] = rng.sample(TRIPLES, 2);
  const [o1, a1, h1] = first;
  const [o2, a2, h2] = second;
  // Which addition/subtraction formula to ask for.
  const kindPick = rng.pick(["sinSum", "cosSum", "sinDiff"] as const);
  const n =
    kindPick === "sinSum"
      ? o1 * a2 + a1 * o2
      : kindPick === "cosSum"
      ? a1 * a2 - o1 * o2
      : o1 * a2 - a1 * o2;
  const label =
    kindPick === "sinSum" ? "sin(A + B)" : kindPick === "cosSum" ? "cos(A + B)" : "sin(A − B)";
  const formula =
    kindPick === "sinSum"
      ? "sin(A + B) = sin A cos B + cos A sin B"
      : kindPick === "cosSum"
      ? "cos(A + B) = cos A cos B − sin A sin B"
      : "sin(A − B) = sin A cos B − cos A sin B";
  const ans = fracAns(n, h1 * h2);
  return inputQ({
    instruction: "Use the addition formula (A and B are acute).",
    prompt: `sin A = {${o1}/${h1}}, cos A = {${a1}/${h1}}, sin B = {${o2}/${h2}}, cos B = {${a2}/${h2}}. Find ${label}.`,
    answer: ans,
    answerFormat: "fraction",
    hint: formula + ".",
    steps: [
      `Use ${formula}.`,
      kindPick === "cosSum"
        ? `cos A cos B = {${a1 * a2}/${h1 * h2}} and sin A sin B = {${o1 * o2}/${h1 * h2}}.`
        : `sin A cos B = {${o1 * a2}/${h1 * h2}} and cos A sin B = {${a1 * o2}/${h1 * h2}}.`,
      `Combining gives {${n}/${h1 * h2}} = ${ans}.`,
    ],
    concept: "Addition formulas build exact values for combined angles.",
    verify: () => {
      const A = Math.asin(o1 / h1);
      const B = Math.asin(o2 / h2);
      const actual =
        kindPick === "sinSum"
          ? Math.sin(A + B)
          : kindPick === "cosSum"
          ? Math.cos(A + B)
          : Math.sin(A - B);
      return Math.abs(actual - n / (h1 * h2)) < 1e-9;
    },
  });
}

const trigIdentity: GeneratorFamily = {
  stageLabel(skill: SkillRef, st: number) {
    const level = num(skill.params, "level", 1);
    return level >= 2
      ? ["Sine double angle", "Cosine double angle", "Evaluate sin 2θ", "Evaluate cos 2θ", "Addition formulas"][st - 1]
      : ["The Pythagorean identity", "Find the missing ratio", "Simplify", "Ratios to tangent", "Cofunctions and parity"][st - 1];
  },
  generate(skill, stage, rng): RawQuestion {
    const level = num(skill.params, "level", 1);
    return level >= 2 ? identityL2(stage, rng) : identityL1(stage, rng);
  },
};

/* ------------------------------------------------------------ trig-equation */
type EqItem = readonly [string, "sin" | "cos" | "tan", number, number];

const trigEquation: GeneratorFamily = {
  stageLabel: (s, st) =>
    ["Quadrantal solutions", "Special values", "Negative values", "Tangent equations", "Isolate then solve"][st - 1],
  generate(skill, stage, rng): RawQuestion {
    const banks: EqItem[][] = [
      [
        ["sin θ = 1", "sin", 1, 90],
        ["sin θ = −1", "sin", -1, 270],
        ["cos θ = 1", "cos", 1, 0],
        ["cos θ = −1", "cos", -1, 180],
        ["sin θ = 0", "sin", 0, 0],
      ],
      [
        ["sin θ = {1/2}", "sin", 0.5, 30],
        ["sin θ = {√2/2}", "sin", Math.SQRT1_2, 45],
        ["sin θ = {√3/2}", "sin", Math.sqrt(3) / 2, 60],
        ["cos θ = {1/2}", "cos", 0.5, 60],
        ["cos θ = {√2/2}", "cos", Math.SQRT1_2, 45],
        ["cos θ = {√3/2}", "cos", Math.sqrt(3) / 2, 30],
      ],
      [
        ["cos θ = −{1/2}", "cos", -0.5, 120],
        ["cos θ = −{√2/2}", "cos", -Math.SQRT1_2, 135],
        ["cos θ = −{√3/2}", "cos", -Math.sqrt(3) / 2, 150],
        ["sin θ = −{1/2}", "sin", -0.5, 210],
        ["sin θ = −{√2/2}", "sin", -Math.SQRT1_2, 225],
        ["sin θ = −{√3/2}", "sin", -Math.sqrt(3) / 2, 240],
      ],
      [
        ["tan θ = 1", "tan", 1, 45],
        ["tan θ = √3", "tan", Math.sqrt(3), 60],
        ["tan θ = {√3/3}", "tan", Math.sqrt(3) / 3, 30],
        ["tan θ = −1", "tan", -1, 135],
        ["tan θ = −√3", "tan", -Math.sqrt(3), 120],
        ["tan θ = −{√3/3}", "tan", -Math.sqrt(3) / 3, 150],
      ],
      [
        ["2 sin θ − 1 = 0", "sin", 0.5, 30],
        ["2 cos θ + 1 = 0", "cos", -0.5, 120],
        ["2 sin θ + 1 = 0", "sin", -0.5, 210],
        ["tan θ − 1 = 0", "tan", 1, 45],
        ["2 cos θ − 1 = 0", "cos", 0.5, 60],
      ],
    ];
    const item = rng.pick(banks[stage - 1]);
    const isolated = stage === 5;
    return inputQ({
      instruction: "Solve for θ in degrees, where 0° ≤ θ < 360°. Give the smallest solution.",
      prompt: item[0],
      answer: String(item[3]),
      hint: isolated
        ? "Isolate the trig function first, then think of the special angles and their quadrants."
        : "Think of the special angles and which quadrants give this sign.",
      steps: [
        ...(isolated ? [`Isolate: ${item[1]} θ = ${exactDisp(item[2])}.`] : []),
        `${item[1]} θ = ${exactDisp(item[2])} first happens at the reference angle ${refOf(item[3])}°.`,
        `The smallest solution from 0° up to 360° is θ = ${item[3]}°.`,
      ],
      concept: "Trig equations are solved with reference angles plus quadrant signs.",
      verify: () => Math.abs(Math[item[1]](rad(item[3])) - item[2]) < 1e-9,
    });
  },
};

function refOf(deg: number): number {
  const d = deg % 180;
  return d > 90 ? 180 - d : d;
}

function exactDisp(v: number): string {
  const s = exactStr(Math.abs(v));
  const disp = /[/]/.test(s) ? `{${s}}` : s;
  return v < 0 ? `−${disp}` : disp;
}

/* --------------------------------------------------------------- trig-graph */
const trigGraph: GeneratorFamily = {
  stageLabel: (s, st) =>
    ["Amplitude", "Period", "Maximum and minimum", "Midlines", "Match the equation"][st - 1],
  generate(skill, stage, rng): RawQuestion {
    const fnName = rng.pick(["sin", "cos"] as const);
    if (stage === 1) {
      const a = rng.int(2, 6) * (rng.chance(0.3) ? -1 : 1);
      const ans = Math.abs(a);
      return inputQ({
        instruction: "Find the amplitude.",
        prompt: `y = ${sx(a)} ${fnName}(x)`,
        answer: String(ans),
        hint: "Amplitude is the coefficient's size — always positive.",
        steps: [
          `${fnName}(x) swings between −1 and 1.`,
          `Multiplying by ${sx(a)} makes the swing ±${ans}: amplitude ${ans}.`,
        ],
        concept: "Amplitude = |a|, the half-height of the wave.",
        verify: () => {
          let max = -Infinity;
          for (let d = 0; d < 360; d += 5) max = Math.max(max, a * Math[fnName](rad(d)));
          return Math.abs(max - ans) < 0.02;
        },
      });
    }
    if (stage === 2) {
      const b = rng.pick([2, 3, 4, 6]);
      const ans = 360 / b;
      return inputQ({
        instruction: "Find the period, in degrees.",
        prompt: `y = ${fnName}(${b}x)`,
        answer: String(ans),
        hint: `The basic wave repeats every 360°; the ${b} squeezes it.`,
        steps: [
          `Period = 360° ÷ ${b} = ${ans}°.`,
        ],
        concept: "Period = 360°/b — bigger b, faster repeats.",
        verify: () => {
          for (let d = 0; d < 360; d += 30) {
            if (Math.abs(Math[fnName](rad(b * (d + ans))) - Math[fnName](rad(b * d))) > 1e-9) return false;
          }
          return true;
        },
      });
    }
    if (stage === 3) {
      const a = rng.int(2, 5);
      let c = rng.int(-9, 9);
      while (c === 0) c = rng.int(-9, 9);
      const wantMax = rng.chance(0.5);
      const ans = wantMax ? a + c : c - a;
      return inputQ({
        instruction: `Find the ${wantMax ? "maximum" : "minimum"} value.`,
        prompt: `y = ${a} ${fnName}(x) ${c < 0 ? `− ${-c}` : `+ ${c}`}`,
        answer: String(ans),
        hint: `${fnName}(x) reaches ${wantMax ? "+1" : "−1"} at its ${wantMax ? "peak" : "trough"}.`,
        steps: [
          `${a} ${fnName}(x) swings between −${a} and ${a}.`,
          `Shifting by ${sx(c)}: ${wantMax ? `max = ${a} ${c < 0 ? `− ${-c}` : `+ ${c}`} = ${sx(ans)}` : `min = −${a} ${c < 0 ? `− ${-c}` : `+ ${c}`} = ${sx(ans)}`}.`,
        ],
        concept: "Max = a + c and min = −a + c for a positive a.",
        verify: () => {
          let best = wantMax ? -Infinity : Infinity;
          for (let d = 0; d < 360; d += 5) {
            const v = a * Math[fnName](rad(d)) + c;
            best = wantMax ? Math.max(best, v) : Math.min(best, v);
          }
          return Math.abs(best - ans) < 0.02;
        },
      });
    }
    if (stage === 4) {
      const a = rng.int(2, 5);
      let c = rng.int(-9, 9);
      while (c === 0 || c === a) c = rng.int(-9, 9);
      const b = rng.pick([2, 3]);
      const ans = `y = ${sx(c)}`;
      return mcQ({
        instruction: "Find the midline.",
        prompt: `y = ${a} ${fnName}(${b}x) ${c < 0 ? `− ${-c}` : `+ ${c}`}`,
        choices: mcChoices(rng, ans, [`y = ${a}`, `y = 0`, `x = ${sx(c)}`]),
        answer: ans,
        hint: "The midline is the horizontal center of the wave — set by the vertical shift.",
        steps: [
          `The wave oscillates ±${a} around its center.`,
          `The vertical shift ${sx(c)} places that center at y = ${sx(c)}.`,
        ],
        concept: "The midline is y = c, the average of max and min.",
        verify: () => {
          const max = a + c;
          const min = -a + c;
          return (max + min) / 2 === c;
        },
      });
    }
    const A = rng.int(2, 5);
    let b = rng.pick([2, 3, 4, 6]);
    while (b === A) b = rng.pick([2, 3, 4, 6]);
    const P = 360 / b;
    const ans = `y = ${A} sin(${b}x)`;
    return mcQ({
      instruction: "Match the equation to the description.",
      prompt: `Which function has amplitude ${A} and period ${P}°?`,
      choices: mcChoices(rng, ans, [
        `y = ${b} sin(${A}x)`,
        `y = ${A} sin(x) + ${b}`,
        `y = ${P} sin(${A}x)`,
      ]),
      answer: ans,
      hint: `Amplitude is the front coefficient; period ${P}° needs b = 360 ÷ ${P}.`,
      steps: [
        `Amplitude ${A} → coefficient ${A} in front.`,
        `Period ${P}° → b = 360 ÷ ${P} = ${b} inside.`,
        `y = ${A} sin(${b}x).`,
      ],
      concept: "a controls height; b controls how fast the wave repeats.",
      verify: () => 360 / b === P && A !== b,
    });
  },
};

/* --------------------------------------------------------------- angle-apps */
const angleApps: GeneratorFamily = {
  stageLabel: (s, st) =>
    ["45° sightlines", "Exact ratios", "Angles of elevation", "Angles of depression", "Find the angle"][st - 1],
  generate(skill, stage, rng): RawQuestion {
    const B = bigLenU(skill.params);
    if (stage === 1) {
      const d = rng.int(4, 12) * 5;
      return inputQ({
        instruction: "Solve the problem.",
        prompt: `From a point ${d} ${B} from the base of a tower, the angle of elevation of the top is 45°. How tall is the tower, in ${unitLong(B)}?`,
        answer: String(d),
        hint: "tan 45° = 1, so height and distance match.",
        steps: [
          `tan 45° = {height/${d}}.`,
          `tan 45° = 1, so height = ${d} ${B}.`,
        ],
        concept: "A 45° elevation makes an isosceles right triangle.",
        representation: "word",
        verify: () => Math.abs(Math.tan(rad(45)) - 1) < 1e-12,
      });
    }
    if (stage === 2) {
      const [o, a] = pickTriple(rng);
      const k = rng.int(1, 3);
      return inputQ({
        instruction: "Solve the problem.",
        prompt: `From a point ${a * k} ${B} from the base of a flagpole, the angle of elevation θ of the top satisfies tan θ = {${o}/${a}}. How tall is the flagpole, in ${unitLong(B)}?`,
        answer: String(o * k),
        hint: `height = distance × tan θ.`,
        steps: [
          `tan θ = {height/${a * k}}.`,
          `height = ${a * k} × {${o}/${a}} = ${o * k} ${B}.`,
        ],
        concept: "Tangent links height to horizontal distance.",
        representation: "word",
        verify: () => (o * k) / (a * k) === o / a,
      });
    }
    if (stage === 3) {
      let ang = rng.int(20, 70);
      while (ang === 45) ang = rng.int(20, 70);
      const d = rng.int(2, 18) * 5;
      const ans = (Math.round(d * Math.tan(rad(ang)) * 10) / 10).toFixed(1);
      return inputQ({
        instruction: "Solve the problem. Round to the nearest tenth.",
        prompt: `From a point ${d} ${B} from the base of a building, the angle of elevation of the roof is ${ang}°. How tall is the building, in ${unitLong(B)}?`,
        answer: ans,
        answerFormat: "decimal",
        answerHint: "e.g. 34.6",
        hint: `height = ${d} × tan ${ang}°.`,
        steps: [
          `tan ${ang}° = {height/${d}}.`,
          `height = ${d} × tan ${ang}° ≈ ${ans} ${B}.`,
        ],
        concept: "The tangent ratio converts an angle and distance into a height.",
        representation: "word",
        verify: () => Math.abs(d * Math.tan(rad(ang)) - Number(ans)) <= 0.05 + 1e-9,
      });
    }
    if (stage === 4) {
      let ang = rng.int(25, 65);
      while (ang === 45) ang = rng.int(25, 65);
      const h = rng.int(6, 30) * 10;
      const ans = (Math.round((h / Math.tan(rad(ang))) * 10) / 10).toFixed(1);
      return inputQ({
        instruction: "Solve the problem. Round to the nearest tenth.",
        prompt: `From the top of a ${h} ${B} cliff, the angle of depression of a boat is ${ang}°. How far is the boat from the base of the cliff, in ${unitLong(B)}?`,
        answer: ans,
        answerFormat: "decimal",
        answerHint: "e.g. 128.7",
        hint: "The angle of depression equals the angle of elevation from the boat.",
        steps: [
          `From the boat, the cliff top is at elevation ${ang}°: tan ${ang}° = {${h}/distance}.`,
          `distance = ${h} ÷ tan ${ang}° ≈ ${ans} ${B}.`,
        ],
        concept: "Depression from the top equals elevation from the bottom.",
        representation: "word",
        verify: () => Math.abs(h / Math.tan(rad(ang)) - Number(ans)) <= 0.05 + 1e-9,
      });
    }
    const h = rng.int(8, 80);
    const d = rng.int(10, 90);
    const ans = Math.round(Math.atan(h / d) / rad(1));
    return inputQ({
      instruction: "Solve the problem. Round to the nearest degree.",
      prompt: `A ${h} ${B} tree stands ${d} ${B} away from an observer at ground level. What is the angle of elevation of the treetop, in degrees?`,
      answer: String(ans),
      hint: `tan θ = {${h}/${d}}; use inverse tangent.`,
      steps: [
        `tan θ = {height/distance} = {${h}/${d}}.`,
        `θ = tan^{−1}({${h}/${d}}) ≈ ${ans}°.`,
      ],
      concept: "Inverse tangent recovers the viewing angle.",
      representation: "word",
      verify: () => Math.round(Math.atan(h / d) / rad(1)) === ans,
    });
  },
};

export const trigFamilies = {
  "right-triangle-trig": rightTriangleTrig,
  "unit-circle": unitCircle,
  "trig-identity": trigIdentity,
  "trig-equation": trigEquation,
  "trig-graph": trigGraph,
  "angle-apps": angleApps,
} satisfies Record<string, GeneratorFamily>;
