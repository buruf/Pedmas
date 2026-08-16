import type { GeneratorFamily, RawQuestion, Rng, SkillRef } from "../types";
import { inputQ, mcQ, mcChoices, pickName, pickObject } from "./helpers";
import { fmtInt } from "../num";

const num = (p: Record<string, unknown>, key: string, dflt: number): number =>
  typeof p[key] === "number" ? (p[key] as number) : dflt;
const str = (p: Record<string, unknown>, key: string, dflt: string): string =>
  typeof p[key] === "string" ? (p[key] as string) : dflt;

/* ----------------------------------------------------------------- add-sub */
/** params: op "add" | "sub" | "mixed", max (largest total involved). */
const addSub: GeneratorFamily = {
  stageLabel: (s, st) =>
    [
      "Small facts",
      "Full range facts",
      "With regrouping",
      "Missing numbers",
      "Story problems",
    ][st - 1],
  generate(skill, stage, rng): RawQuestion {
    const max = num(skill.params, "max", 20);
    const opParam = str(skill.params, "op", "mixed");
    const op = opParam === "mixed" ? rng.pick(["add", "sub"] as const) : (opParam as "add" | "sub");
    const cap = [Math.min(10, max), max, max, max, max][stage - 1];

    let a: number, b: number;
    if (stage >= 3 && max >= 20) {
      // Force regrouping: ones digits that carry/borrow.
      if (op === "add") {
        do {
          a = rng.int(Math.floor(cap / 4), cap - 2);
          b = rng.int(2, cap - a);
        } while ((a % 10) + (b % 10) < 10);
      } else {
        do {
          a = rng.int(Math.floor(cap / 3), cap);
          b = rng.int(2, a - 1);
        } while (a % 10 >= b % 10);
      }
    } else {
      if (op === "add") {
        a = rng.int(0, cap - 1);
        b = rng.int(0, cap - a);
      } else {
        a = rng.int(1, cap);
        b = rng.int(0, a);
      }
    }
    const ans = op === "add" ? a + b : a - b;
    const sym = op === "add" ? "+" : "−";

    if (stage === 4) {
      // Missing addend / subtrahend.
      if (op === "add") {
        return inputQ({
          instruction: "Find the missing number.",
          prompt: `${a} + ___ = ${a + b}`,
          answer: String(b),
          hint: `Think: ${a} plus what makes ${a + b}? Subtract to find out.`,
          steps: [`${a + b} − ${a} = ${b}.`, `Check: ${a} + ${b} = ${a + b}. ✓`],
          concept: "Addition and subtraction undo each other.",
          verify: () => a + b - a === b,
        });
      }
      return inputQ({
        instruction: "Find the missing number.",
        prompt: `${a} − ___ = ${a - b}`,
        answer: String(b),
        hint: `How much was taken away from ${a} to leave ${a - b}?`,
        steps: [`${a} − ${a - b} = ${b}.`, `Check: ${a} − ${b} = ${a - b}. ✓`],
        concept: "Subtraction can be checked with addition.",
        verify: () => a - (a - b) === b,
      });
    }
    if (stage === 5) {
      const name = pickName(rng);
      const obj = pickObject(rng);
      const prompt =
        op === "add"
          ? `${name} has ${a} ${obj}. A friend gives ${name} ${b} more. How many ${obj} does ${name} have now?`
          : `${name} has ${a} ${obj} and gives away ${b}. How many ${obj} are left?`;
      return inputQ({
        instruction: "Solve the problem.",
        prompt,
        answer: String(ans),
        hint: op === "add" ? "Getting more means adding." : "Giving away means subtracting.",
        steps: [`${a} ${sym} ${b} = ${ans}.`, `${name} has ${ans} ${obj}.`],
        concept: op === "add" ? "Join stories are addition." : "Take-away stories are subtraction.",
        representation: "word",
        verify: () => (op === "add" ? ans - b === a : ans + b === a),
      });
    }
    const regroupNote =
      stage === 3 && max >= 20
        ? op === "add"
          ? [`Add the ones: ${a % 10} + ${b % 10} = ${(a % 10) + (b % 10)} — regroup 10 ones as 1 ten.`, `Add the tens, then combine: ${ans}.`]
          : [`You cannot take ${b % 10} ones from ${a % 10} — regroup 1 ten as 10 ones.`, `Now subtract: ${a} − ${b} = ${ans}.`]
        : [`${a} ${sym} ${b} = ${ans}.`];
    return inputQ({
      instruction: op === "add" ? "Add." : "Subtract.",
      prompt: `${a} ${sym} ${b} = ?`,
      answer: String(ans),
      hint:
        op === "add"
          ? "Start from the bigger number and count on."
          : "Count back, or think of the matching addition fact.",
      steps: regroupNote,
      concept: op === "add" ? "Addition joins amounts." : "Subtraction finds the difference.",
      verify: () => (op === "add" ? ans - b === a : ans + b === a),
    });
  },
};

/* -------------------------------------------------------------- fact-family */
const factFamily: GeneratorFamily = {
  stageLabel: () => "Fact families",
  generate(skill, stage, rng): RawQuestion {
    const max = num(skill.params, "max", 20);
    const a = rng.int(1, Math.floor(max / 2));
    const b = rng.int(1, max - a);
    const c = a + b;
    const family = [`${a} + ${b} = ${c}`, `${b} + ${a} = ${c}`, `${c} − ${a} = ${b}`, `${c} − ${b} = ${a}`];
    if (stage <= 2) {
      const shown = family.slice(0, 3);
      const ans = family[3];
      const wrongs = [`${c} − ${b} = ${b}`, `${a} − ${b} = ${c}`, `${c} + ${b} = ${a}`];
      return mcQ({
        instruction: "Which fact completes the fact family?",
        prompt: shown.join("    "),
        choices: mcChoices(rng, ans, wrongs),
        answer: ans,
        hint: `A fact family uses the same three numbers: ${a}, ${b}, ${c}.`,
        steps: [`The family for ${a}, ${b}, ${c} has two additions and two subtractions.`, `The missing fact is ${ans}.`],
        concept: "Fact families link addition and subtraction.",
        verify: () => c - b === a,
      });
    }
    const hideIdx = rng.int(0, 3);
    const isAdd = hideIdx < 2;
    const missing = isAdd ? c : hideIdx === 2 ? b : a;
    const shown = family.filter((_, i) => i !== hideIdx);
    const blanked = family[hideIdx].replace(String(missing), "___");
    return inputQ({
      instruction: "Complete the fact family. What number goes in the blank?",
      prompt: `${shown.slice(0, 2).join("    ")}\n${blanked}`,
      answer: String(missing),
      hint: `Every fact uses the numbers ${a}, ${b} and their total.`,
      steps: [`The three numbers are ${a}, ${b}, ${c}.`, `So the blank is ${missing}.`],
      concept: "Knowing one fact gives you three more for free.",
      verify: () => a + b === c,
    });
  },
};

/* ----------------------------------------------------------- missing-number */
const missingNumber: GeneratorFamily = {
  stageLabel: () => "Missing numbers",
  generate(skill, stage, rng): RawQuestion {
    const max = num(skill.params, "max", 100);
    const opParam = str(skill.params, "op", "mixed");
    const ops: readonly string[] = opParam === "mixed" ? ["add", "sub", "mul"] : [opParam];
    // Multiplication is withheld until stage 3; never let that filter empty the pool.
    const allowed = stage <= 2 ? ops.filter((o) => o !== "mul") : ops;
    const op = rng.pick(allowed.length > 0 ? allowed : ops);
    const cap = Math.max(10, Math.floor((max * stage) / 5));
    if (op === "mul") {
      const f = rng.int(2, 9);
      const m = rng.int(2, 9);
      return inputQ({
        instruction: "Find the missing number.",
        prompt: `${f} × ___ = ${f * m}`,
        answer: String(m),
        hint: `Divide ${f * m} by ${f}.`,
        steps: [`${f * m} ÷ ${f} = ${m}.`, `Check: ${f} × ${m} = ${f * m}. ✓`],
        concept: "Multiplication and division undo each other.",
        verify: () => (f * m) % f === 0 && (f * m) / f === m,
      });
    }
    const a = rng.int(1, cap - 1);
    const b = rng.int(1, cap - a);
    if (op === "add") {
      const blankFirst = rng.chance(0.5);
      const missing = blankFirst ? a : b;
      const known = blankFirst ? b : a;
      return inputQ({
        instruction: "Find the missing number.",
        prompt: blankFirst ? `___ + ${b} = ${a + b}` : `${a} + ___ = ${a + b}`,
        answer: String(missing),
        hint: "Subtract the known part from the total.",
        steps: [`${a + b} − ${known} = ${missing}.`],
        concept: "Part + part = whole; whole − part = the other part.",
        verify: () => known + missing === a + b,
      });
    }
    const whole = a + b;
    return inputQ({
      instruction: "Find the missing number.",
      prompt: `${whole} − ___ = ${a}`,
      answer: String(b),
      hint: `What is taken from ${whole} to leave ${a}?`,
      steps: [`${whole} − ${a} = ${b}.`],
      concept: "The missing part is the difference.",
      verify: () => whole - b === a,
    });
  },
};

/* -------------------------------------------------------------- multi-digit */
/** params: op "add" | "sub" | "mixed", digits max digit count. */
const multiDigit: GeneratorFamily = {
  stageLabel: (s, st) =>
    ["2-digit, no regrouping", "2-digit with regrouping", "3-digit", "4-digit", "Story problems"][st - 1],
  generate(skill, stage, rng): RawQuestion {
    const maxDigits = num(skill.params, "digits", 4);
    const opParam = str(skill.params, "op", "mixed");
    const op = opParam === "mixed" ? rng.pick(["add", "sub"] as const) : (opParam as "add" | "sub");
    const d = Math.min(maxDigits, [2, 2, 3, 4, 4][stage - 1]);
    const lo = 10 ** (d - 1);
    const hi = 10 ** d - 1;
    let a = rng.int(lo, hi);
    let b = rng.int(lo, hi);
    if (stage === 1) {
      // No regrouping: build digit-wise.
      const da: number[] = [];
      const db: number[] = [];
      for (let i = 0; i < d; i++) {
        const x = rng.int(i === d - 1 ? 1 : 0, op === "add" ? 4 : 9);
        const y = op === "add" ? rng.int(i === d - 1 ? 1 : 0, 9 - x) : rng.int(i === d - 1 ? 1 : 0, x);
        da.push(x);
        db.push(y);
      }
      a = Number(da.reverse().join(""));
      b = Number(db.reverse().join(""));
    }
    if (op === "sub" && b > a) [a, b] = [b, a];
    const ans = op === "add" ? a + b : a - b;
    const sym = op === "add" ? "+" : "−";
    if (stage === 5) {
      const name = pickName(rng);
      const prompt =
        op === "add"
          ? `A school library has ${fmtInt(a)} books. It receives ${fmtInt(b)} more. How many books does it have now?`
          : `${name}'s book has ${fmtInt(a)} pages. ${name} has read ${fmtInt(b)}. How many pages are left?`;
      return inputQ({
        instruction: "Solve the problem.",
        prompt,
        answer: String(ans),
        hint: op === "add" ? "Combine the two amounts." : "Find the difference.",
        steps: [`${fmtInt(a)} ${sym} ${fmtInt(b)} = ${fmtInt(ans)}.`],
        concept: op === "add" ? "Totals come from addition." : "Amount remaining comes from subtraction.",
        representation: "word",
        verify: () => (op === "add" ? ans - b === a : ans + b === a),
      });
    }
    return inputQ({
      instruction: op === "add" ? "Add." : "Subtract.",
      prompt: `${fmtInt(a)} ${sym} ${fmtInt(b)} = ?`,
      answer: String(ans),
      hint: "Line up the place values and work right to left.",
      steps: [
        `Line up ones under ones, tens under tens.`,
        `Work from the ones column${op === "add" ? ", carrying when a column passes 9" : ", borrowing when the top digit is smaller"}.`,
        `${fmtInt(a)} ${sym} ${fmtInt(b)} = ${fmtInt(ans)}.`,
      ],
      concept: "Column arithmetic works one place value at a time.",
      verify: () => (op === "add" ? ans - b === a : ans + b === a),
    });
  },
};

/* --------------------------------------------------------------- mult-facts */
/** params: tables: number[] — which times tables this skill covers. */
const multFacts: GeneratorFamily = {
  stageLabel: (s, st) =>
    ["Small factors", "The full table", "Mixed practice", "Missing factors", "Arrays and stories"][st - 1],
  generate(skill, stage, rng): RawQuestion {
    const tables = (skill.params.tables as number[] | undefined) ?? [2, 3, 4, 5, 6, 7, 8, 9, 10];
    const t = rng.pick(tables);
    const f = stage === 1 ? rng.int(1, 5) : rng.int(2, stage >= 3 ? 12 : 10);
    const ans = t * f;
    if (stage === 4) {
      return inputQ({
        instruction: "Find the missing factor.",
        prompt: `${t} × ___ = ${ans}`,
        answer: String(f),
        hint: `Count by ${t}s until you reach ${ans}.`,
        steps: [`${ans} ÷ ${t} = ${f}.`, `Check: ${t} × ${f} = ${ans}. ✓`],
        concept: "A missing factor is found by dividing.",
        verify: () => ans / t === f,
      });
    }
    if (stage === 5) {
      if (rng.chance(0.5)) {
        return inputQ({
          instruction: "An array shows rows and columns.",
          prompt: `An array has ${t} rows with ${f} dots in each row. How many dots in total?`,
          answer: String(ans),
          hint: "Rows × columns gives the total.",
          steps: [`${t} rows × ${f} dots = ${ans} dots.`],
          concept: "Arrays picture multiplication.",
          representation: "visual",
          verify: () => ans / f === t,
        });
      }
      const name = pickName(rng);
      const obj = pickObject(rng);
      return inputQ({
        instruction: "Solve the problem.",
        prompt: `${name} buys ${t} packs of ${obj}. Each pack has ${f}. How many ${obj} altogether?`,
        answer: String(ans),
        hint: "Equal groups means multiply.",
        steps: [`${t} packs × ${f} each = ${ans}.`],
        concept: "Equal groups are multiplication stories.",
        representation: "word",
        verify: () => ans / t === f,
      });
    }
    return inputQ({
      instruction: "Multiply.",
      prompt: `${t} × ${f} = ?`,
      answer: String(ans),
      hint: `Skip count by ${t}: ${t}, ${t * 2}, ${t * 3}...`,
      steps: [`${t} × ${f} means ${f} groups of ${t}.`, `${t} × ${f} = ${ans}.`],
      concept: "Multiplication is repeated addition.",
      verify: () => ans / t === f,
    });
  },
};

/* ---------------------------------------------------------------- div-facts */
const divFacts: GeneratorFamily = {
  stageLabel: (s, st) =>
    ["Sharing equally", "Division facts", "Mixed tables", "Missing numbers", "Story problems"][st - 1],
  generate(skill, stage, rng): RawQuestion {
    const tables = (skill.params.tables as number[] | undefined) ?? [2, 3, 4, 5, 6, 7, 8, 9, 10];
    const d = rng.pick(tables);
    const q = stage === 1 ? rng.int(1, 5) : rng.int(2, stage >= 3 ? 12 : 10);
    const n = d * q;
    if (stage === 4) {
      return inputQ({
        instruction: "Find the missing number.",
        prompt: `___ ÷ ${d} = ${q}`,
        answer: String(n),
        hint: `Multiply ${q} × ${d}.`,
        steps: [`${q} × ${d} = ${n}.`, `Check: ${n} ÷ ${d} = ${q}. ✓`],
        concept: "Division is checked by multiplying back.",
        verify: () => n / d === q,
      });
    }
    if (stage === 5) {
      const name = pickName(rng);
      const obj = pickObject(rng);
      return inputQ({
        instruction: "Solve the problem.",
        prompt: `${name} shares ${n} ${obj} equally among ${d} friends. How many does each friend get?`,
        answer: String(q),
        hint: "Sharing equally means dividing.",
        steps: [`${n} ÷ ${d} = ${q}.`, `Each friend gets ${q} ${obj}.`],
        concept: "Equal sharing is division.",
        representation: "word",
        verify: () => q * d === n,
      });
    }
    return inputQ({
      instruction: "Divide.",
      prompt: `${n} ÷ ${d} = ?`,
      answer: String(q),
      hint: `Think: ${d} × what = ${n}?`,
      steps: [`${d} × ${q} = ${n}, so ${n} ÷ ${d} = ${q}.`],
      concept: "Every division fact hides a multiplication fact.",
      verify: () => q * d === n,
    });
  },
};

/* --------------------------------------------------------------- mult-multi */
/** Multi-digit multiplication. params: digitsA, digitsB caps. */
const multMulti: GeneratorFamily = {
  stageLabel: (s, st) =>
    ["2-digit × 1-digit", "3-digit × 1-digit", "2-digit × 2-digit", "3-digit × 2-digit", "Story problems"][st - 1],
  generate(skill, stage, rng): RawQuestion {
    const shapes: [number, number][] = [
      [2, 1],
      [3, 1],
      [2, 2],
      [3, 2],
      [rng.pick([2, 3]), rng.pick([1, 2])],
    ];
    const [da, db] = shapes[stage - 1];
    const a = rng.int(10 ** (da - 1) + 1, 10 ** da - 1);
    const b = rng.int(db === 1 ? 2 : 10 ** (db - 1) + 1, 10 ** db - 1);
    const ans = a * b;
    if (stage === 5) {
      return inputQ({
        instruction: "Solve the problem.",
        prompt: `A theatre has ${a} rows with ${b} seats in each row. How many seats in total?`,
        answer: String(ans),
        hint: "Rows × seats per row.",
        steps: [`${a} × ${b} = ${fmtInt(ans)}.`],
        concept: "Area/array situations multiply two quantities.",
        representation: "word",
        verify: () => ans / b === a,
      });
    }
    const tens = Math.floor(b / 10) * 10;
    const ones = b % 10;
    const partial =
      db === 2
        ? [`Split ${b} into ${tens} + ${ones}.`, `${a} × ${tens} = ${fmtInt(a * tens)} and ${a} × ${ones} = ${fmtInt(a * ones)}.`, `${fmtInt(a * tens)} + ${fmtInt(a * ones)} = ${fmtInt(ans)}.`]
        : [`Multiply each place of ${a} by ${b}, carrying as needed.`, `${a} × ${b} = ${fmtInt(ans)}.`];
    return inputQ({
      instruction: "Multiply.",
      prompt: `${a} × ${b} = ?`,
      answer: String(ans),
      hint: db === 2 ? `Break ${b} into tens and ones.` : "Multiply ones, then tens, then add.",
      steps: partial,
      concept: "Break numbers apart to multiply in easy pieces.",
      verify: () => ans / b === a,
    });
  },
};

/* ------------------------------------------------------------ long-division */
const longDivision: GeneratorFamily = {
  stageLabel: (s, st) =>
    ["2-digit ÷ 1-digit", "3-digit ÷ 1-digit", "With remainders", "2-digit divisors", "Story problems"][st - 1],
  generate(skill, stage, rng): RawQuestion {
    if (stage === 3) {
      const d = rng.int(3, 9);
      const q = rng.int(4, 30);
      const r = rng.int(1, d - 1);
      const n = d * q + r;
      return inputQ({
        instruction: "Divide. Give the quotient and remainder like: 7 R2",
        prompt: `${n} ÷ ${d} = ?`,
        answer: `${q} R${r}`,
        accept: [`${q} r${r}`, `${q}r${r}`, `${q} r ${r}`, `${q} remainder ${r}`],
        answerFormat: "text",
        answerHint: "e.g. 7 R2",
        hint: `How many whole ${d}s fit in ${n}? What is left over?`,
        steps: [`${d} × ${q} = ${d * q}.`, `${n} − ${d * q} = ${r} left over.`, `${n} ÷ ${d} = ${q} R${r}.`],
        concept: "The remainder is what is left after equal groups.",
        verify: () => d * q + r === n && r < d,
      });
    }
    const d = stage === 4 ? rng.int(11, 25) : rng.int(3, 9);
    const q = stage === 1 ? rng.int(3, Math.floor(99 / d)) : rng.int(stage === 4 ? 3 : 12, stage === 4 ? 40 : Math.floor(999 / d));
    const n = d * q;
    if (stage === 5) {
      const name = pickName(rng);
      return inputQ({
        instruction: "Solve the problem.",
        prompt: `${name} packs ${fmtInt(n)} eggs into cartons of ${d}. How many cartons are filled?`,
        answer: String(q),
        hint: "Divide the total by the group size.",
        steps: [`${fmtInt(n)} ÷ ${d} = ${q}.`],
        concept: "Division counts how many equal groups fit.",
        representation: "word",
        verify: () => q * d === n,
      });
    }
    return inputQ({
      instruction: "Divide.",
      prompt: `${fmtInt(n)} ÷ ${d} = ?`,
      answer: String(q),
      hint: "Divide place by place, bringing digits down.",
      steps: [`Estimate: ${d} × ${q} = ${fmtInt(n)}.`, `So ${fmtInt(n)} ÷ ${d} = ${q}.`],
      concept: "Long division shares out one place value at a time.",
      verify: () => q * d === n,
    });
  },
};

/* ------------------------------------------------------------- mental-math */
const mentalMath: GeneratorFamily = {
  stageLabel: (s, st) =>
    ["Make ten", "Doubles and near doubles", "Add/subtract 9 and 11", "Friendly numbers", "Mixed strategies"][st - 1],
  generate(skill, stage, rng): RawQuestion {
    const opParam = str(skill.params, "op", "mixed");
    if (stage === 1) {
      const a = rng.int(1, 9);
      return inputQ({
        instruction: "Make ten.",
        prompt: `${a} + ___ = 10`,
        answer: String(10 - a),
        hint: `Count up from ${a} to 10.`,
        steps: [`${a} + ${10 - a} = 10.`],
        concept: "Number pairs that make 10 speed up mental math.",
        verify: () => a + (10 - a) === 10,
      });
    }
    if (stage === 2) {
      const a = rng.int(3, 12);
      const near = rng.chance(0.5) ? 1 : 0;
      const ans = a + a + near;
      return inputQ({
        instruction: "Use doubles to solve mentally.",
        prompt: `${a} + ${a + near} = ?`,
        answer: String(ans),
        hint: `Double ${a}${near ? ", then add 1" : ""}.`,
        steps: [`${a} + ${a} = ${2 * a}.`, ...(near ? [`${2 * a} + 1 = ${ans}.`] : [])],
        concept: "Doubles are anchors for nearby facts.",
        verify: () => ans - a - near === a,
      });
    }
    if (stage === 3) {
      const a = rng.int(15, 80);
      const add = opParam !== "sub" && rng.chance(0.5);
      const nine = rng.chance(0.5) ? 9 : 11;
      const ans = add ? a + nine : a - nine;
      return inputQ({
        instruction: `Solve mentally using tens.`,
        prompt: `${a} ${add ? "+" : "−"} ${nine} = ?`,
        answer: String(ans),
        hint: `${add ? "Add" : "Subtract"} 10, then adjust by 1.`,
        steps: [
          `${a} ${add ? "+" : "−"} 10 = ${add ? a + 10 : a - 10}.`,
          `Adjust by 1: ${ans}.`,
        ],
        concept: "9 and 11 are one away from a friendly 10.",
        verify: () => (add ? ans - nine === a : ans + nine === a),
      });
    }
    if (stage === 4) {
      const a = rng.int(2, 9) * 10 + rng.pick([8, 9]);
      const b = rng.int(10, 40);
      const ans = a + b;
      const bump = 10 - (a % 10);
      return inputQ({
        instruction: "Use a friendly number.",
        prompt: `${a} + ${b} = ?`,
        answer: String(ans),
        hint: `Move ${bump} from ${b} to make ${a + bump} first.`,
        steps: [`${a} + ${bump} = ${a + bump}.`, `${a + bump} + ${b - bump} = ${ans}.`],
        concept: "Shifting amounts between numbers keeps the total the same.",
        verify: () => a + bump + (b - bump) === a + b,
      });
    }
    const t = rng.pick([5, 25, 50]);
    const k = rng.int(3, 12);
    const ans = t * k;
    return inputQ({
      instruction: "Solve mentally.",
      prompt: `${t} × ${k} = ?`,
      answer: String(ans),
      hint: t === 5 ? "×5 is half of ×10." : t === 25 ? "Think quarters: 4 × 25 = 100." : "×50 is half of ×100.",
      steps: [
        t === 5
          ? `${k} × 10 = ${k * 10}; half is ${ans}.`
          : t === 25
            ? `${k} × 100 = ${k * 100}; a quarter is ${ans}.`
            : `${k} × 100 = ${k * 100}; half is ${ans}.`,
      ],
      concept: "Friendly numbers like 10 and 100 anchor mental math.",
      verify: () => ans / t === k,
    });
  },
};

/* ------------------------------------------------------------- order-of-ops */
/** Independent evaluator used for verification (shunting-yard style). */
export function evalExpr(expr: string): number {
  let i = 0;
  const s = expr.replace(/\s+/g, "").replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-");
  function parseExpr(): number {
    let v = parseTerm();
    while (s[i] === "+" || s[i] === "-") {
      const op = s[i++];
      const t = parseTerm();
      v = op === "+" ? v + t : v - t;
    }
    return v;
  }
  function parseTerm(): number {
    let v = parsePow();
    while (s[i] === "*" || s[i] === "/") {
      const op = s[i++];
      const t = parsePow();
      v = op === "*" ? v * t : v / t;
    }
    return v;
  }
  function parsePow(): number {
    const base = parseAtom();
    if (s[i] === "^") {
      i++;
      const e = parsePow();
      return base ** e;
    }
    return base;
  }
  function parseAtom(): number {
    if (s[i] === "(") {
      i++;
      const v = parseExpr();
      i++; // skip ")"
      return v;
    }
    let j = i;
    if (s[j] === "-") j++;
    while (j < s.length && /\d/.test(s[j])) j++;
    const v = Number(s.slice(i, j));
    i = j;
    return v;
  }
  return parseExpr();
}

const orderOfOps: GeneratorFamily = {
  stageLabel: (s, st) =>
    [
      "Multiply before adding",
      "Brackets first",
      "With exponents",
      "All four operations",
      "Nested and combined",
    ][st - 1],
  generate(skill, stage, rng): RawQuestion {
    let expr = "";
    let ans = 0;
    if (stage === 1) {
      const a = rng.int(2, 9);
      const b = rng.int(2, 9);
      const c = rng.int(2, 9);
      expr = rng.chance(0.5) ? `${a} + ${b} × ${c}` : `${a} × ${b} + ${c}`;
      ans = evalExpr(expr);
    } else if (stage === 2) {
      const a = rng.int(2, 9);
      const b = rng.int(2, 9);
      const c = rng.int(2, 6);
      expr = rng.chance(0.5) ? `(${a} + ${b}) × ${c}` : `${c} × (${a} − ${b < a ? b : a - 1})`;
      ans = evalExpr(expr);
    } else if (stage === 3) {
      const a = rng.int(2, 5);
      const b = rng.int(2, 3);
      const c = rng.int(1, 20);
      expr = rng.chance(0.5) ? `${a}^${b} + ${c}` : `${c} + ${a}^${b}`;
      ans = evalExpr(expr);
    } else if (stage === 4) {
      const d = rng.int(2, 6);
      const q = rng.int(2, 8);
      const a = rng.int(2, 9);
      const b = rng.int(2, 9);
      expr = `${d * q} ÷ ${d} + ${a} × ${b}`;
      ans = q + a * b;
    } else {
      const a = rng.int(2, 5);
      const b = rng.int(1, 4);
      const c = rng.int(2, 4);
      const d = rng.int(2, 5);
      expr = `${c} × (${a} + ${b}) − ${d}^2`;
      ans = c * (a + b) - d * d;
    }
    const steps: string[] = [];
    if (expr.includes("(")) steps.push("Brackets first.");
    if (expr.includes("^")) steps.push("Then exponents.");
    steps.push("Then multiply/divide left to right, then add/subtract.");
    steps.push(`${expr} = ${ans}.`);
    return inputQ({
      instruction: "Evaluate using the order of operations.",
      prompt: `${expr} = ?`,
      answer: String(ans),
      hint: "PEDMAS: Parentheses, Exponents, Divide/Multiply, Add/Subtract.",
      steps,
      concept: "The order of operations makes every expression mean one thing.",
      verify: () => evalExpr(expr) === ans && Number.isInteger(ans),
    });
  },
};

export const arithFamilies = {
  "add-sub": addSub,
  "fact-family": factFamily,
  "missing-number": missingNumber,
  "multi-digit": multiDigit,
  "mult-facts": multFacts,
  "div-facts": divFacts,
  "mult-multi": multMulti,
  "long-division": longDivision,
  "mental-math": mentalMath,
  "order-of-ops": orderOfOps,
} satisfies Record<string, GeneratorFamily>;
