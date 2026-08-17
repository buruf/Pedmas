"use client";

import { useState } from "react";
import { MathText } from "@/components/MathText";
import { Step, KeyIdea, WrongBox } from "@/components/lesson/Step";
import { LessonShell, TryIt } from "@/components/lesson/LessonShell";
import { FractionBar } from "@/components/lesson/FractionBar";
import { PrimaryButton } from "@/components/ui";

/**
 * Mixed numbers.
 *
 * The interesting misconception is not the conversion — it is subtracting
 * mixed numbers part by part when the fraction on top is too small. That is
 * the same regrouping trade as whole-number subtraction, so the lesson names
 * the connection explicitly rather than teaching a separate rule.
 */
export function MixedNumberLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 5 · Fractions · Mixed Number Operations"
      title="Working with whole numbers and fractions together"
      minutes={6}
      step={step}
      total={6}
    >
      <Step n={1} title="Two ways to say the same amount" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          Two and a half pizzas. You can write that as <MathText text="2 {1/2}" /> — or count the
          halves: there are 5.
        </p>
        <div className="mt-4 flex flex-col items-center gap-2">
          <FractionBar parts={2} shaded={2} shade="brand" label="1" />
          <FractionBar parts={2} shaded={2} shade="brand" label="1" />
          <FractionBar parts={2} shaded={1} shade="teal" label="{1/2}" />
        </div>
        <div className="my-3 rounded-xl bg-ink-900 px-4 py-3 text-center text-xl font-bold text-white">
          <MathText text="2 {1/2} = {5/2}" />
        </div>
        <KeyIdea>
          A <strong>mixed number</strong> shows the wholes separately. An{" "}
          <strong>improper fraction</strong> counts every piece. Same amount, different views.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(2)}>How do I convert?</PrimaryButton></div>
      </Step>

      <Step n={2} title="Converting between them" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-paper px-3 py-3">
            <div className="text-sm font-bold text-ink-900">Mixed → improper</div>
            <p className="mt-1 text-sm text-ink-700">
              How many pieces in the wholes? Multiply, then add the extra.
            </p>
            <div className="mt-2 font-bold text-ink-900">
              <MathText text="3 {2/5}" /> → 3 × 5 = 15, + 2 = <MathText text="{17/5}" />
            </div>
          </div>
          <div className="rounded-xl bg-paper px-3 py-3">
            <div className="text-sm font-bold text-ink-900">Improper → mixed</div>
            <p className="mt-1 text-sm text-ink-700">
              How many whole groups fit? Divide, and the remainder stays on top.
            </p>
            <div className="mt-2 font-bold text-ink-900">
              <MathText text="{17/5}" /> → 17 ÷ 5 = 3 r 2 → <MathText text="3 {2/5}" />
            </div>
          </div>
        </div>
        <div className="mt-4"><PrimaryButton onClick={() => go(3)}>Adding them</PrimaryButton></div>
      </Step>

      <Step n={3} title="Adding mixed numbers" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">
          Add the wholes, add the fractions, then tidy up if the fraction part is too big.
        </p>
        <div className="mt-3 rounded-2xl bg-paper p-4">
          <ol className="space-y-2">
            {[
              ["Wholes: 1 + 2", "3"],
              ["Fractions: {3/4} + {3/4}", "{6/4}"],
              ["{6/4} is more than one whole", "= 1 {2/4} = 1 {1/2}"],
              ["Add that whole on: 3 + 1", "4 {1/2}"],
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
        <p className="mt-2 text-center text-sm text-ink-700">
          <MathText text="1 {3/4} + 2 {3/4} = 4 {1/2}" />
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(4)}>Now the tricky one</PrimaryButton></div>
      </Step>

      <Step n={4} title="The mistake almost everyone makes" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <p className="text-ink-700">
          Subtract <MathText text="3 {1/4} − 1 {3/4}" />. People take each part separately:
        </p>
        <WrongBox>
          3 − 1 = 2, and <MathText text="{1/4} − {3/4}" />… &ldquo;so <MathText text="2 {2/4}" />&rdquo;
        </WrongBox>
        <p className="text-ink-700">
          You cannot take 3 quarters from 1 quarter, so people flip it round — exactly the same
          error as taking the smaller digit from the larger in column subtraction.
        </p>
        <KeyIdea>
          And the fix is the same trade: <strong>break one whole into quarters</strong>.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(5)}>Show me</PrimaryButton></div>
      </Step>

      <Step n={5} title="Break a whole into pieces" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <div className="flex flex-col items-center gap-2">
          <FractionBar parts={4} shaded={1} shade="teal" label="the {1/4} you have" />
          <span className="text-sm font-bold text-brand-600">↓ borrow one whole = {"{4/4}"}</span>
          <FractionBar parts={4} shaded={4} shade="brand" label="{4/4} from a whole" />
        </div>
        <div className="mt-4 rounded-2xl bg-paper p-4">
          <ol className="space-y-2">
            {[
              ["Take one whole from the 3", "2 wholes left"],
              ["That whole is {4/4}; add it to the {1/4}", "{5/4}"],
              ["Now subtract the fractions: {5/4} − {3/4}", "{2/4} = {1/2}"],
              ["Subtract the wholes: 2 − 1", "1"],
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
        <p className="mt-3 text-center font-bold text-ok-600">
          <MathText text="3 {1/4} − 1 {3/4} = 1 {1/2}" />
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(6)}>Your turn</PrimaryButton></div>
      </Step>

      <Step n={6} title="You try one" open={step === 6} onOpen={() => go(6)} done={false}>
        <p className="text-ink-700">
          Work out <MathText text="4 {1/5} − 2 {3/5}" />.
        </p>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          Not enough fifths, so borrow a whole: 4 becomes <strong>3</strong>, and{" "}
          <MathText text="{1/5}" /> becomes <MathText text="{6/5}" />.
        </div>
        <TryIt
          prompt={<>2. Now finish it. What is the answer?</>}
          accept={["1 3/5", "13/5", "1  3/5"]}
          placeholder="like 1 3/5"
          value={fade}
          setValue={setFade}
          hint="fractions: 6/5 − 3/5. Wholes: 3 − 2."
          explain={
            <>
              <MathText text="{6/5} − {3/5} = {3/5}" />, and 3 − 2 = 1, giving{" "}
              <MathText text="1 {3/5}" />. Check: <MathText text="1 {3/5} + 2 {3/5} = 4 {1/5}" /> ✓
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Mixed numbers</div>
          <div className="mt-2">1. Wholes with wholes, fractions with fractions</div>
          <div className="mt-1">2. Fraction too big? Carry a whole across</div>
          <div className="mt-1">3. Fraction too small to subtract? Borrow a whole</div>
        </div>
        <KeyIdea>
          💡 Borrowing a whole here is the same trade as breaking a ten into ones. One idea, two
          places it shows up.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
