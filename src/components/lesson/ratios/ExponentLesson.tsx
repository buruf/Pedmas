"use client";

import { useState } from "react";
import { MathText } from "@/components/MathText";
import { Step, KeyIdea, FormulaBox, WrongBox } from "@/components/lesson/Step";
import { LessonShell, TryIt } from "@/components/lesson/LessonShell";
import { DotGroups } from "@/components/lesson/Models";
import { PrimaryButton } from "@/components/ui";

/**
 * Evaluating powers, and the roots that undo them.
 *
 * 3² read as 3 × 2 survives because it is right once — at 2² — and because
 * nothing about the notation says "multiply this many copies". Roots are taught
 * in the same lesson because they are the same picture read backwards, and
 * because √36 = 18 is the identical mistake wearing the other sign.
 */
export function ExponentEvalLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [guess, setGuess] = useState<string | null>(null);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 8 · Exponents · Powers & Roots"
      title="What a power really means"
      minutes={7}
      step={step}
      total={6}
    >
      <Step n={1} title="Tiling a square patio" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          A square patio measures <strong>3 m by 3 m</strong>. You are laying tiles that are one
          metre square. How many do you need?
        </p>
        <p className="mt-3 text-ink-700">
          That area gets written <MathText text="3^2" /> — read aloud as &ldquo;three squared&rdquo;.
          So what is <MathText text="3^2" />?
        </p>
        <div className="mt-4 grid gap-2">
          {[
            { k: "b", label: "6 — the little 2 means times 2" },
            { k: "a", label: "9" },
          ].map((o) => (
            <button
              key={o.k}
              type="button"
              onClick={() => setGuess(o.k)}
              className={`btn rounded-xl border-2 px-4 py-3 text-left font-semibold ${
                guess === o.k ? "border-brand-600 bg-brand-50 text-brand-800" : "border-ink-100 bg-white"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
        {guess && (
          <div className="mt-4 rounded-xl bg-paper px-4 py-3 text-sm text-ink-700 pop-in">
            Lay the tiles out and count them.
            <div className="mt-3"><PrimaryButton onClick={() => go(2)}>Show me</PrimaryButton></div>
          </div>
        )}
      </Step>

      <Step n={2} title="The mistake almost everyone makes" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <WrongBox>
          <MathText text="3^2" /> = 3 × 2 = 6
        </WrongBox>
        <p className="text-ink-700">
          Count the patio and the method fails: a 3 by 3 square holds nine tiles, not six.
        </p>
        <div className="mt-4 flex justify-center">
          <DotGroups groups={3} perGroup={3} asArray label="3 rows of 3 = 9 tiles" />
        </div>
        <p className="mt-4 text-ink-700">
          The small raised number is not something you multiply <em>by</em>. It{" "}
          <strong>counts how many 3s get multiplied together</strong>.
        </p>
        <FormulaBox>
          <MathText text="3^2 = 3 * 3 = 9" />
        </FormulaBox>
        <KeyIdea>
          This mistake is stubborn because it is right exactly once:{" "}
          <MathText text="2^2" /> = 4 and 2 × 2 = 4. That one coincidence keeps it alive for years.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(3)}>Bigger exponents</PrimaryButton></div>
      </Step>

      <Step n={3} title="The base is what, the exponent is how many" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">
          Say it in that order every time and the notation stops being ambiguous: the{" "}
          <strong>base</strong> is the number you multiply, the <strong>exponent</strong> counts how
          many of them.
        </p>
        <div className="mt-3 space-y-2">
          {[
            ["3^2", "3 * 3", "9"],
            ["3^3", "3 * 3 * 3", "27"],
            ["2^5", "2 * 2 * 2 * 2 * 2", "32"],
            ["10^3", "10 * 10 * 10", "1000"],
          ].map(([a, b, c]) => (
            <div key={a} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-bold text-ink-900"><MathText text={a} /></span>
              <span className="text-sm text-ink-700"><MathText text={b} /></span>
              <span className="text-sm font-bold text-brand-700">{c}</span>
            </div>
          ))}
        </div>
        <KeyIdea>
          Powers of ten are the easiest check you own: the exponent is the number of zeros.{" "}
          <MathText text="10^3" /> = 1000, three zeros.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(4)}>The awkward cases</PrimaryButton></div>
      </Step>

      <Step n={4} title="Zero, one, and where the brackets are" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <div className="space-y-2">
          {[
            ["7^1", "7", "one 7, multiplied by nothing else"],
            ["7^0", "1", "no 7s at all — you start from 1"],
            ["(−3)^2", "9", "(−3) × (−3): the brackets square the minus too"],
            ["−3^2", "−9", "no brackets: square the 3, then apply the minus"],
            ["2^{−3}", "{1/8}", "a negative exponent means one over the power"],
          ].map(([a, b, c]) => (
            <div key={a} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-bold text-ink-900"><MathText text={a} /></span>
              <span className="text-sm font-bold text-brand-700"><MathText text={b} /></span>
              <span className="text-sm text-ink-500">{c}</span>
            </div>
          ))}
        </div>
        <KeyIdea>
          A negative exponent never makes the answer negative — it makes it{" "}
          <strong>small</strong>. <MathText text="2^{−3}" /> is <MathText text="{1/8}" />, which is
          positive.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(5)}>Now the question backwards</PrimaryButton></div>
      </Step>

      <Step n={5} title="Roots ask it in reverse" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">
          The patio is now <strong>49 m²</strong> and you want to know how long a side is. You are
          hunting the number that squares to 49.
        </p>
        <FormulaBox>
          <MathText text="sqrt(49) = 7" /> &nbsp; because &nbsp; <MathText text="7 * 7 = 49" />
        </FormulaBox>
        <WrongBox>
          <MathText text="sqrt(36)" /> = 18
        </WrongBox>
        <p className="text-ink-700">
          Halving feels like the opposite of squaring, so lots of people halve. Test it: 18 × 18 =
          324, nowhere near 36. The number that works is 6, because 6 × 6 = 36.
        </p>
        <p className="mt-3 text-ink-700">Worth knowing on sight:</p>
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          {[1, 4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144].map((p) => (
            <span key={p} className="rounded-xl bg-brand-100 px-3 py-1.5 font-bold text-brand-800">
              {p}
            </span>
          ))}
        </div>
        <p className="mt-4 text-ink-700">
          Cube roots run the same way: <MathText text="3 * 3 * 3 = 27" />, so the cube root of 27 is
          3. And when a number is not a perfect square, trap it between two that are —{" "}
          <MathText text="sqrt(50)" /> sits between 7 and 8, because 49 &lt; 50 &lt; 64.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(6)}>Your turn</PrimaryButton></div>
      </Step>

      <Step n={6} title="You try one" open={step === 6} onOpen={() => go(6)} done={false}>
        <p className="text-ink-700">
          Work out <MathText text="4^3" />.
        </p>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          The exponent is 3, so that is <strong>three</strong> 4s multiplied:{" "}
          <MathText text="4 * 4 * 4" />. Start with <MathText text="4 * 4 = 16" />.
        </div>
        <TryIt
          prompt={<>2. Now multiply by the last 4. What is 4 cubed?</>}
          accept={["64"]}
          placeholder="a number"
          value={fade}
          setValue={setFade}
          hint="16 × 4. The answer is not 4 × 3 — the exponent counts the 4s, it is not one of them."
          explain={
            <>
              <strong>64</strong>, because 4 × 4 × 4 = 64. Notice how far that is from 4 × 3 = 12 —
              powers grow fast, which is exactly why the notation exists.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Powers and roots</div>
          <div className="mt-2">1. The exponent counts how many bases are multiplied</div>
          <div className="mt-1">2. 3² is 3 × 3, never 3 × 2</div>
          <div className="mt-1">3. A root asks it backwards: √49 = 7 because 7² = 49</div>
        </div>
        <KeyIdea>
          💡 Read every power out loud as &ldquo;how many of them?&rdquo; and the whole family of
          slips — 3² = 6, √36 = 18 — has nowhere left to hide.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}

/**
 * The exponent rules.
 *
 * x² · x³ = x⁶ is not carelessness — the child has spotted that something is
 * being multiplied and applied it to the visible numbers. The cure is not a
 * mnemonic but a test: substitute x = 2 and the wrong rule produces a number
 * you can check on your fingers. Every rule here is earned by writing the xs
 * out, so none of them has to be remembered separately.
 */
export function ExponentRulesLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [guess, setGuess] = useState<string | null>(null);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 8 · Exponents · Exponent Rules"
      title="Why the exponents add"
      minutes={6}
      step={step}
      total={6}
    >
      <Step n={1} title="Two powers, multiplied" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          Write <MathText text="x^2 * x^3" /> as a single power of x.
        </p>
        <div className="mt-4 grid gap-2">
          {[
            { k: "b", label: "x⁶ — multiply the exponents, 2 × 3" },
            { k: "a", label: "x⁵" },
          ].map((o) => (
            <button
              key={o.k}
              type="button"
              onClick={() => setGuess(o.k)}
              className={`btn rounded-xl border-2 px-4 py-3 text-left font-semibold ${
                guess === o.k ? "border-brand-600 bg-brand-50 text-brand-800" : "border-ink-100 bg-white"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
        {guess && (
          <div className="mt-4 rounded-xl bg-paper px-4 py-3 text-sm text-ink-700 pop-in">
            We do not have to argue about it — we can put a number in and check.
            <div className="mt-3"><PrimaryButton onClick={() => go(2)}>Test it</PrimaryButton></div>
          </div>
        )}
      </Step>

      <Step n={2} title="The mistake almost everyone makes" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <WrongBox>
          <MathText text="x^2 * x^3 = x^6" />
        </WrongBox>
        <p className="text-ink-700">
          Multiplying is happening, so multiplying the exponents feels right. Put{" "}
          <strong>x = 2</strong> in and every claim becomes a number you can check.
        </p>
        <div className="mt-4 rounded-2xl bg-paper p-4">
          <ol className="space-y-2">
            {[
              ["2^2", "4"],
              ["2^3", "8"],
              ["so x^2 * x^3 is really 4 * 8", "32"],
              ["but 2^6 is", "64"],
              ["and 2^5 is", "32 ✓"],
            ].map(([a, b], i) => (
              <li key={i} className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 text-sm">
                <span className="text-ink-700">
                  <span className="mr-2 font-bold text-brand-600">{i + 1}.</span>
                  <MathText text={a} />
                </span>
                <span className="font-bold text-ink-900"><MathText text={b} /></span>
              </li>
            ))}
          </ol>
        </div>
        <p className="mt-3 text-center text-lg font-bold text-ok-600">
          <MathText text="x^2 * x^3 = x^5" />
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(3)}>Why 5?</PrimaryButton></div>
      </Step>

      <Step n={3} title="Just count the xs" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">
          Nothing needs remembering here. Write both powers out and see what is in the pile.
        </p>
        <div className="my-4 rounded-2xl bg-paper p-4 text-center">
          <div className="text-lg font-bold text-ink-900">
            <MathText text="x^2 * x^3" />
          </div>
          <div className="my-2 text-sm font-semibold text-brand-600">↓ write them out</div>
          <div className="text-lg font-bold text-ink-900">(x · x) (x · x · x)</div>
          <div className="my-2 text-sm font-semibold text-brand-600">↓ two xs and three more xs</div>
          <div className="text-lg font-bold text-ok-600">
            <MathText text="x^5" />
          </div>
        </div>
        <FormulaBox>
          <MathText text="x^a * x^b = x^{a+b}" />
        </FormulaBox>
        <KeyIdea>
          You are counting how many xs are in the pile, and counting things together is{" "}
          <strong>adding</strong>. 2 + 3 = 5.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(4)}>What about dividing?</PrimaryButton></div>
      </Step>

      <Step n={4} title="Dividing takes xs away" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <p className="text-ink-700">
          Same trick. <MathText text="x^5" /> divided by <MathText text="x^2" />: write out five xs
          over two xs, and cancel the pairs.
        </p>
        <div className="my-4 rounded-2xl bg-paper p-4 text-center">
          <div className="text-lg font-bold text-ink-900">
            (x · x · x · x · x) ÷ (x · x)
          </div>
          <div className="my-2 text-sm font-semibold text-brand-600">↓ two of them cancel</div>
          <div className="text-lg font-bold text-ok-600">
            <MathText text="x^3" />
          </div>
        </div>
        <FormulaBox>
          <MathText text="x^a ÷ x^b = x^{a−b}" />
        </FormulaBox>
        <p className="text-ink-700">
          Check with x = 2: <MathText text="2^5" /> ÷ <MathText text="2^2" /> = 32 ÷ 4 = 8, and{" "}
          <MathText text="2^3" /> = 8 ✓
        </p>
        <KeyIdea>
          This also explains the odd-looking <MathText text="x^0" /> = 1. Divide{" "}
          <MathText text="x^3" /> by <MathText text="x^3" />: the rule says{" "}
          <MathText text="x^0" />, and common sense says any number over itself is 1. Both are right.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(5)}>When do you multiply?</PrimaryButton></div>
      </Step>

      <Step n={5} title="A power of a power — here you do multiply" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">
          <MathText text="(x^3)^2" /> means two copies of <MathText text="x^3" />, so it is{" "}
          <MathText text="x^3 * x^3" /> — three xs, twice over. Six xs.
        </p>
        <FormulaBox>
          <MathText text="(x^a)^b = x^{a*b}" />
        </FormulaBox>
        <p className="text-ink-700">
          Check with x = 2: <MathText text="(2^3)^2" /> = 8² = 64, and <MathText text="2^6" /> = 64 ✓
        </p>
        <div className="mt-4 space-y-2">
          {[
            ["x^2 * x^3", "add: x^5", "two powers side by side"],
            ["x^5 ÷ x^2", "subtract: x^3", "one power over another"],
            ["(x^3)^2", "multiply: x^6", "a bracket raised to a power"],
          ].map(([a, b, c]) => (
            <div key={a} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-bold text-ink-900"><MathText text={a} /></span>
              <span className="text-sm font-bold text-brand-700"><MathText text={b} /></span>
              <span className="text-sm text-ink-500">{c}</span>
            </div>
          ))}
        </div>
        <KeyIdea>
          Multiplying the exponents is right <strong>only when there is a bracket</strong>. Without
          one, you are counting xs, and counting means adding.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(6)}>Your turn</PrimaryButton></div>
      </Step>

      <Step n={6} title="You try one" open={step === 6} onOpen={() => go(6)} done={false}>
        <p className="text-ink-700">
          Write <MathText text="x^4 * x^6" /> as a single power of x.
        </p>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          No brackets — the two powers are just sitting side by side, so count the xs in the pile.
        </div>
        <TryIt
          prompt={<>2. The answer is x to the power of what?</>}
          accept={["10"]}
          placeholder="a number"
          value={fade}
          setValue={setFade}
          hint="four xs, then six more xs. That is not 4 × 6."
          explain={
            <>
              <strong>10</strong>, so <MathText text="x^4 * x^6 = x^{10}" />. Check with x = 2:
              16 × 64 = 1024, and <MathText text="2^{10}" /> = 1024 ✓ (Multiplying would have given{" "}
              <MathText text="x^{24}" /> — over sixteen million at x = 2.)
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Exponent rules</div>
          <div className="mt-2">1. Same base, multiplying → add the exponents</div>
          <div className="mt-1">2. Same base, dividing → subtract the exponents</div>
          <div className="mt-1">3. A power of a power → multiply the exponents</div>
        </div>
        <KeyIdea>
          💡 If you ever forget which, put x = 2 in and count. The rule that survives the test is
          the rule.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
