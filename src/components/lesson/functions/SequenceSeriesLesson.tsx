"use client";

import { useState } from "react";
import { MathText } from "@/components/MathText";
import { Step, KeyIdea, FormulaBox, WrongBox } from "@/components/lesson/Step";
import { LessonShell, TryIt } from "@/components/lesson/LessonShell";
import { PrimaryButton } from "@/components/ui";

/** A run of terms with the step between each pair written underneath. */
function TermChain({
  terms,
  op,
  steps,
}: {
  terms: (number | string)[];
  op: string;
  steps: (number | string)[];
}) {
  return (
    <div className="mx-auto flex max-w-md flex-wrap items-start justify-center gap-1">
      {terms.map((t, i) => (
        <span key={i} className="flex items-start">
          <span className="rounded-xl bg-brand-50 px-3 py-2 text-base font-bold text-brand-800">{t}</span>
          {i < steps.length && (
            <span className="mx-0.5 mt-2 whitespace-nowrap text-xs font-bold text-ink-500">
              {op}
              {steps[i]}
            </span>
          )}
        </span>
      ))}
    </div>
  );
}

/**
 * Sequences.
 *
 * Two errors, one lesson. Arithmetic and geometric get mixed up because
 * nobody checks both the differences and the ratios; and the nth-term formula
 * is written off by one because a student counts terms where they should be
 * counting steps.
 */
export function SequenceLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 11 · Functions · Sequences"
      title="Finding the 100th term without counting"
      minutes={6}
      step={step}
      total={7}
    >
      <Step n={1} title="Two patterns" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">Fill in the next number in each row.</p>
        <div className="mt-4 space-y-4">
          <TermChain terms={[3, 7, 11, 15, "?"]} op="+" steps={[4, 4, 4, 4]} />
          <TermChain terms={[3, 6, 12, 24, "?"]} op="×" steps={[2, 2, 2, 2]} />
        </div>
        <p className="mt-4 text-ink-700">
          Easy enough: 19 and 48. But now try the <strong>50th</strong> term of each — counting is
          no longer an option.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(2)}>Show me a shortcut</PrimaryButton></div>
      </Step>

      <Step n={2} title="Name the two kinds" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <p className="text-ink-700">
          The two rows above are the two patterns that matter, and they differ in one word.
        </p>
        <div className="mt-3 space-y-2">
          {[
            ["Arithmetic", "each step adds the same amount", "3, 7, 11, 15 — add 4"],
            ["Geometric", "each step multiplies by the same amount", "3, 6, 12, 24 — times 2"],
          ].map(([a, b, c]) => (
            <div key={a} className="rounded-xl bg-paper px-3 py-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-bold text-ink-900">{a}</span>
                <span className="text-sm text-brand-700">{b}</span>
              </div>
              <div className="mt-1 text-sm text-ink-500">{c}</div>
            </div>
          ))}
        </div>
        <KeyIdea>
          The added amount is called the <strong>common difference</strong>{" "}
          <MathText text="d" />. The multiplied amount is the <strong>common ratio</strong>{" "}
          <MathText text="r" />.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(3)}>The new problem</PrimaryButton></div>
      </Step>

      <Step n={3} title="A formula for any term" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">
          Take <MathText text="3, 7, 11, 15, …" className="font-bold text-ink-900" />. You want a
          formula that turns the term number <MathText text="n" /> straight into the term.
        </p>
        <p className="mt-3 text-ink-700">
          The difference is 4 every time, so 4 must be in the formula somewhere. The obvious first
          try is <MathText text="4n" />.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(4)}>Test it</PrimaryButton></div>
      </Step>

      <Step n={4} title="The two mistakes almost everyone makes" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <WrongBox>
          <MathText text="3, 7, 11, 15, …" /> has nth term <MathText text="4n" />
        </WrongBox>
        <p className="text-ink-700">
          Reasonable — the gaps really are 4. But feed the formula the term numbers and compare with
          the actual list.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="mx-auto border-collapse text-center text-sm">
            <thead>
              <tr className="text-xs font-bold uppercase tracking-wide text-ink-500">
                <th className="px-2 pb-1">n</th>
                <th className="px-2 pb-1">4n says</th>
                <th className="px-2 pb-1 text-brand-600">really is</th>
              </tr>
            </thead>
            <tbody>
              {[
                [1, 4, 3],
                [2, 8, 7],
                [3, 12, 11],
                [4, 16, 15],
              ].map(([n, f, t]) => (
                <tr key={n}>
                  <td className="border border-ink-100 px-3 py-1 font-semibold text-ink-700">{n}</td>
                  <td className="border border-ink-100 px-3 py-1 tabular-nums text-err-600">{f}</td>
                  <td className="border border-ink-100 px-3 py-1 font-bold tabular-nums text-brand-700">{t}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-ink-700">
          Every single row is out by exactly 1. Not random — the formula is systematically one step
          too far along, so the fix is <MathText text="4n − 1" />.
        </p>
        <p className="mt-3 text-ink-700">
          <strong>Why?</strong> Getting from term 1 to term 4 takes <em>three</em> steps, not four.
          <MathText text=" 4n" /> counted a step that never happened — the step before the first
          term.
        </p>

        <WrongBox>&ldquo;The differences are not constant, so there is no pattern&rdquo;</WrongBox>
        <p className="text-ink-700">
          The second slip. Look at <MathText text="3, 6, 12, 24" />: the differences are 3, 6, 12 —
          all different, so a lot of people stop there. But divide instead:{" "}
          <MathText text="6 ÷ 3 = 2" />, <MathText text="12 ÷ 6 = 2" />,{" "}
          <MathText text="24 ÷ 12 = 2" />. Perfectly constant.
        </p>
        <KeyIdea>
          Always run <strong>both</strong> checks: subtract consecutive terms, then divide them. One
          of the two will usually come out constant, and that tells you which family you are in.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(5)}>The formulas</PrimaryButton></div>
      </Step>

      <Step n={5} title="Count steps, not terms" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">
          Start at <MathText text="a_1" />. To reach term <MathText text="n" /> you take{" "}
          <MathText text="n − 1" /> steps. That <MathText text="n − 1" /> is the entire content of
          both formulas.
        </p>
        <FormulaBox>
          <div className="text-base"><MathText text="arithmetic:  a_n = a_1 + (n − 1)d" /></div>
          <div className="mt-2 text-base"><MathText text="geometric:  a_n = a_1 * r^{n − 1}" /></div>
        </FormulaBox>
        <p className="text-ink-700">
          Check the first against the list you already have:{" "}
          <MathText text="a_1 = 3" />, <MathText text="d = 4" />, so{" "}
          <MathText text="a_n = 3 + (n − 1)4 = 3 + 4n − 4 = 4n − 1" /> — the same correction you
          found by hand. ✓
        </p>
        <KeyIdea>
          If you ever write <MathText text="a_1 + nd" /> and the first term comes out wrong,
          you have counted an extra step. Substituting <MathText text="n = 1" /> catches it every
          time.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(6)}>Worked example</PrimaryButton></div>
      </Step>

      <Step n={6} title="The 12th term" open={step === 6} onOpen={() => go(6)} done={step > 6}>
        <p className="text-ink-700">
          Find the 12th term of <MathText text="5, 9, 13, 17, …" className="font-bold text-ink-900" />
        </p>
        <div className="mt-3 rounded-2xl bg-paper p-4">
          <ol className="space-y-2">
            {[
              ["Differences: 9 − 5 = 4, 13 − 9 = 4 — constant, so arithmetic", "d = 4"],
              ["First term", "a_1 = 5"],
              ["Steps from term 1 to term 12", "12 − 1 = 11"],
              ["a_12 = 5 + 11 * 4", "5 + 44 = 49"],
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
          <p className="mt-2 text-center text-sm text-ink-700">
            Sanity check: terms go 5, 9, 13, 17, 21, 25, 29, 33, 37, 41, 45,{" "}
            <strong className="text-ok-600">49</strong> ✓
          </p>
        </div>
        <div className="mt-4"><PrimaryButton onClick={() => go(7)}>Your turn</PrimaryButton></div>
      </Step>

      <Step n={7} title="You try one" open={step === 7} onOpen={() => go(7)} done={false}>
        <p className="text-ink-700">
          Find the 5th term of <MathText text="2, 6, 18, 54, …" className="font-bold text-ink-900" />
        </p>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          Differences are 4, 12, 36 — not constant. Ratios are{" "}
          <MathText text="6 ÷ 2 = 3" />, <MathText text="18 ÷ 6 = 3" />,{" "}
          <MathText text="54 ÷ 18 = 3" />. Geometric, <MathText text="r = 3" />.
        </div>
        <TryIt
          prompt={<>2. What is the 5th term?</>}
          accept={["162"]}
          placeholder="a number"
          value={fade}
          setValue={setFade}
          hint="the 4th term is 54 — take one more step of the pattern."
          explain={
            <>
              <MathText text="54 * 3 = 162" />. By formula:{" "}
              <MathText text="a_5 = 2 * 3^{5 − 1} = 2 * 81 = 162" /> ✓ — note the exponent is 4, not
              5.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Sequences</div>
          <div className="mt-2">1. Subtract consecutive terms; then divide them</div>
          <div className="mt-1">2. Constant difference → arithmetic: aₙ = a₁ + (n − 1)d</div>
          <div className="mt-1">3. Constant ratio → geometric: aₙ = a₁ · rⁿ⁻¹</div>
          <div className="mt-1">4. Always test your formula at n = 1</div>
        </div>
        <KeyIdea>
          💡 The <MathText text="n − 1" /> is not a quirk of the formula. It is the number of steps
          between the first term and the one you want.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}

/**
 * Series.
 *
 * Gauss's pairing is the hook because it makes the sum formula obvious rather
 * than memorised. The misconception attacked is the off-by-one in counting how
 * many terms a run contains — the single most common way a correct formula
 * produces a wrong answer.
 */
export function SeriesLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 11 · Functions · Series"
      title="Adding a whole list at once"
      minutes={6}
      step={step}
      total={7}
    >
      <Step n={1} title="The schoolboy who finished early" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          The story goes that a teacher, wanting quiet, told the class to add every whole number
          from 1 to 100. A boy called Gauss put his hand up almost immediately.
        </p>
        <p className="mt-3 text-ink-700">He had not added 100 numbers. He had added two.</p>
        <div className="mt-4"><PrimaryButton onClick={() => go(2)}>How?</PrimaryButton></div>
      </Step>

      <Step n={2} title="What you already know" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <p className="text-ink-700">
          A <strong>sequence</strong> is the list. A <strong>series</strong> is what you get when you
          add the list up. Different objects, and easy to confuse.
        </p>
        <div className="mt-3 space-y-2">
          {[
            ["Sequence", "1, 2, 3, 4, 5", "a list of five numbers"],
            ["Series", "1 + 2 + 3 + 4 + 5 = 15", "one number"],
          ].map(([a, b, c]) => (
            <div key={a} className="rounded-xl bg-paper px-3 py-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-bold text-ink-900">{a}</span>
                <span className="text-sm font-bold text-brand-700">{b}</span>
              </div>
              <div className="mt-1 text-sm text-ink-500">{c}</div>
            </div>
          ))}
        </div>
        <div className="mt-4"><PrimaryButton onClick={() => go(3)}>Gauss&rsquo;s trick</PrimaryButton></div>
      </Step>

      <Step n={3} title="Pair them from the ends" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">
          Write 1 to 100 forwards, then write it again backwards underneath. Every column adds to
          the same thing.
        </p>
        <div className="mt-3 rounded-2xl bg-paper p-4">
          <div className="space-y-1.5">
            {[
              ["1 + 100", "101"],
              ["2 + 99", "101"],
              ["3 + 98", "101"],
              ["…", "…"],
              ["50 + 51", "101"],
            ].map(([a, b], i) => (
              <div key={i} className="flex items-center justify-between rounded-xl bg-white px-3 py-1.5 text-sm">
                <span className="font-semibold text-ink-900">{a}</span>
                <span className="font-bold text-brand-700">{b}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-center text-sm text-ink-700">
            50 pairs, each worth 101
          </p>
          <p className="mt-1 text-center text-lg font-bold text-ok-600">
            <MathText text="50 * 101 = 5050" />
          </p>
        </div>
        <p className="mt-3 text-ink-700">
          Turn that into a formula: there were <MathText text="n" /> terms, they made{" "}
          <MathText text="{n/2}" /> pairs, and each pair was worth first + last.
        </p>
        <FormulaBox>
          <MathText text="S_n = {n(a_1 + a_n)/2}" />
        </FormulaBox>
        <div className="mt-4"><PrimaryButton onClick={() => go(4)}>Where this goes wrong</PrimaryButton></div>
      </Step>

      <Step n={4} title="The mistake almost everyone makes" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <p className="text-ink-700">
          The formula is easy. Feeding it the wrong <MathText text="n" /> is what costs marks. Add
          up <MathText text="5 + 8 + 11 + … + 32" />. How many terms is that?
        </p>
        <WrongBox>
          <MathText text="n = {32 − 5/3} = 9" />
        </WrongBox>
        <p className="text-ink-700">
          Very tempting, and the arithmetic is right. Test it by writing the terms out:
        </p>
        <div className="mt-3 flex flex-wrap justify-center gap-1.5">
          {[5, 8, 11, 14, 17, 20, 23, 26, 29, 32].map((v, i) => (
            <span key={v} className="rounded-lg bg-brand-50 px-2.5 py-1.5 text-sm font-bold text-brand-800">
              {v}
              <span className="ml-1 text-[10px] font-semibold text-ink-500">#{i + 1}</span>
            </span>
          ))}
        </div>
        <p className="mt-3 text-center text-lg font-bold text-ok-600">10 terms, not 9</p>
        <p className="mt-3 text-ink-700">
          The subtraction counted the <strong>gaps</strong> between terms. There are 9 gaps —
          and 10 fence posts holding them up. You always need one more post than gap.
        </p>
        <FormulaBox>
          <MathText text="n = {last − first/d} + 1" />
        </FormulaBox>
        <p className="text-ink-700">
          Same off-by-one as the <MathText text="n − 1" /> in the nth-term formula, seen from the
          other direction. Both are really about steps versus terms.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(5)}>The rest of the toolkit</PrimaryButton></div>
      </Step>

      <Step n={5} title="Geometric sums, and infinite ones" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">
          When each term multiplies instead of adds, pairing no longer works and a different formula
          takes over.
        </p>
        <FormulaBox>
          <MathText text="S_n = {a_1(r^n − 1)/r − 1}" />
        </FormulaBox>
        <p className="text-ink-700">
          Check it on something small: <MathText text="2 + 6 + 18 + 54" />. Here{" "}
          <MathText text="a_1 = 2" />, <MathText text="r = 3" />, <MathText text="n = 4" />.
        </p>
        <div className="mt-3 space-y-2">
          {[
            ["By hand", "2 + 6 + 18 + 54 = 80"],
            ["By formula: {2(3^4 − 1)/3 − 1}", "{2 * 80/2} = 80"],
          ].map(([a, b]) => (
            <div key={a} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-semibold text-ink-900"><MathText text={a} /></span>
              <span className="text-sm font-bold text-ok-600"><MathText text={b} /></span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-ink-700">
          And something that sounds impossible: add <em>infinitely</em> many terms and still get a
          finite answer.
        </p>
        <div className="mt-3 rounded-2xl bg-paper p-4 text-center">
          <div className="font-bold text-ink-900">
            <MathText text="{1/2} + {1/4} + {1/8} + {1/16} + …" />
          </div>
          <div className="mt-2 text-sm text-ink-700">
            running totals: 0.5, 0.75, 0.875, 0.9375, 0.96875 &hellip;
          </div>
          <div className="mt-2 font-bold text-ok-600">closing in on exactly 1</div>
        </div>
        <p className="mt-3 text-ink-700">
          Each term covers half the gap that is left, so the gap never quite closes — but it shrinks
          without limit. That works whenever <MathText text="|r| < 1" />.
        </p>
        <FormulaBox>
          <MathText text="S_∞ = {a_1/1 − r}" />
        </FormulaBox>
        <p className="text-ink-700">
          Here <MathText text="{{1/2}/1 − {1/2}} = {{1/2}/{1/2}} = 1" /> ✓
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(6)}>Worked example</PrimaryButton></div>
      </Step>

      <Step n={6} title="Finish the one you started" open={step === 6} onOpen={() => go(6)} done={step > 6}>
        <p className="text-ink-700">
          Find <MathText text="5 + 8 + 11 + … + 32" className="font-bold text-ink-900" />.
        </p>
        <div className="mt-3 rounded-2xl bg-paper p-4">
          <ol className="space-y-2">
            {[
              ["Common difference", "d = 3"],
              ["Count the terms: {32 − 5/3} + 1", "9 + 1 = 10"],
              ["Pair value: first + last", "5 + 32 = 37"],
              ["S = {10 * 37/2}", "{370/2} = 185"],
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
          <p className="mt-2 text-sm text-ink-700">
            Check the long way: 5+8=13, +11=24, +14=38, +17=55, +20=75, +23=98, +26=124, +29=153,
            +32=<strong className="text-ok-600">185</strong> ✓
          </p>
        </div>
        <div className="mt-4"><PrimaryButton onClick={() => go(7)}>Your turn</PrimaryButton></div>
      </Step>

      <Step n={7} title="You try one" open={step === 7} onOpen={() => go(7)} done={false}>
        <p className="text-ink-700">
          Find <MathText text="4 + 7 + 10 + … + 31" className="font-bold text-ink-900" />.
        </p>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          <MathText text="d = 3" />, and the number of terms is{" "}
          <MathText text="{31 − 4/3} + 1 = 9 + 1 = 10" className="font-bold" />. Each pair is worth{" "}
          <MathText text="4 + 31 = 35" />.
        </div>
        <TryIt
          prompt={<>2. Ten terms make five pairs of 35. What is the total?</>}
          accept={["175"]}
          placeholder="a number"
          value={fade}
          setValue={setFade}
          hint="five pairs, each worth 35."
          explain={
            <>
              <MathText text="5 * 35 = 175" />. By formula:{" "}
              <MathText text="S = {10 * 35/2} = {350/2} = 175" /> ✓. Had you used{" "}
              <MathText text="n = 9" /> you would have got 157.5 — not even a whole number, which is
              itself a warning.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Series</div>
          <div className="mt-2">1. Count terms with (last − first) ÷ d + 1 — never forget the + 1</div>
          <div className="mt-1">2. Arithmetic: Sₙ = n(a₁ + aₙ) ÷ 2 — pairs from the ends</div>
          <div className="mt-1">3. Geometric: Sₙ = a₁(rⁿ − 1) ÷ (r − 1)</div>
          <div className="mt-1">4. Infinite, |r| &lt; 1: S = a₁ ÷ (1 − r)</div>
        </div>
        <KeyIdea>
          💡 Fence posts and gaps. Subtracting gives you gaps; terms are always one more than that.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
