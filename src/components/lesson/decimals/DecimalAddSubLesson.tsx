"use client";

import { useState } from "react";
import { Step, KeyIdea, WrongBox } from "@/components/lesson/Step";
import { LessonShell, EstimateCheck, TryIt } from "@/components/lesson/LessonShell";
import { DecimalChart } from "@/components/lesson/Models";
import { PrimaryButton } from "@/components/ui";

/**
 * Adding and subtracting decimals.
 *
 * One rule, one misconception: line up the decimal points, not the right-hand
 * edges. Right-aligning is a habit carried over from whole numbers, and it is
 * the entire reason 12.5 + 3.75 goes wrong.
 */
export function DecimalAddSubLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 5 · Decimals · Decimal Addition & Subtraction"
      title="Adding decimals: line up the point"
      minutes={5}
      step={step}
      total={6}
    >
      <Step n={1} title="A shopping problem" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          A drink costs <strong>$12.50</strong> and a sandwich costs <strong>$3.75</strong>.
        </p>
        <EstimateCheck>
          $12.50 is about $12 and a half, and $3.75 is nearly $4. So expect about{" "}
          <strong>$16.25</strong>. Keep that in mind.
        </EstimateCheck>
        <div className="mt-4"><PrimaryButton onClick={() => go(2)}>Work it out</PrimaryButton></div>
      </Step>

      <Step n={2} title="The mistake almost everyone makes" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <p className="text-ink-700">
          With whole numbers you line the digits up at the right. People do the same here:
        </p>
        <WrongBox>
          <div className="text-left font-mono text-base">
            <div>&nbsp;12.5</div>
            <div>+&nbsp;3.75</div>
            <div className="border-t border-ink-900">&nbsp;&nbsp;&nbsp;&nbsp;?</div>
          </div>
        </WrongBox>
        <p className="text-ink-700">
          Look at what that lines up: the <strong>5 tenths</strong> under the{" "}
          <strong>7 tenths</strong>? No — it puts the 5 tenths under the 5 hundredths. You would
          be adding tenths to hundredths, which is like adding metres to centimetres.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(3)}>What should I line up?</PrimaryButton></div>
      </Step>

      <Step n={3} title="Line up the points, not the edges" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">
          Every column has to hold the same kind of thing: tenths with tenths, hundredths with
          hundredths. The decimal point is what keeps them honest.
        </p>
        <div className="mt-4">
          <DecimalChart rows={[{ value: "12.50" }, { value: "3.75" }]} highlight="tenths" />
        </div>
        <KeyIdea>
          Write 12.5 as <strong>12.50</strong> so both numbers have the same number of places. It
          is the same amount, and now every column matches.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(4)}>Add it up</PrimaryButton></div>
      </Step>

      <Step n={4} title="Now add as usual" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <div className="rounded-2xl bg-paper p-4 text-center">
          <div className="inline-block text-left font-mono text-xl font-bold text-ink-900">
            <div>&nbsp;&nbsp;12.50</div>
            <div>+&nbsp;&nbsp;3.75</div>
            <div className="border-t-2 border-ink-900 text-ok-600">&nbsp;&nbsp;16.25</div>
          </div>
        </div>
        <ol className="mt-4 space-y-2">
          {[
            "Hundredths: 0 + 5 = 5.",
            "Tenths: 5 + 7 = 12 tenths. That is 1 whole and 2 tenths — write 2, carry the 1.",
            "Ones: 2 + 3 + the carried 1 = 6.",
            "Tens: 1. The point drops straight down into the answer.",
          ].map((s, i) => (
            <li key={i} className="flex gap-3 rounded-xl bg-white px-3 py-2 text-sm text-ink-700">
              <span className="font-bold text-brand-600">{i + 1}.</span>
              <span>{s}</span>
            </li>
          ))}
        </ol>
        <p className="mt-3 text-center font-bold text-ok-600">
          $16.25 — exactly what we estimated. ✓
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(5)}>Does it work for subtracting?</PrimaryButton></div>
      </Step>

      <Step n={5} title="Subtracting is the same" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">
          Same rule, and the missing places matter even more. For <strong>8 − 2.35</strong>, write
          the 8 as <strong>8.00</strong>:
        </p>
        <div className="mt-3 rounded-2xl bg-paper p-4 text-center">
          <div className="inline-block text-left font-mono text-xl font-bold text-ink-900">
            <div>&nbsp;&nbsp;8.00</div>
            <div>−&nbsp;2.35</div>
            <div className="border-t-2 border-ink-900 text-ok-600">&nbsp;&nbsp;5.65</div>
          </div>
        </div>
        <KeyIdea>
          A whole number has an invisible point after it, and as many zeros as you need. 8 is
          8.00 whenever that helps.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(6)}>Your turn</PrimaryButton></div>
      </Step>

      <Step n={6} title="You try one" open={step === 6} onOpen={() => go(6)} done={false}>
        <p className="text-ink-700">Work out <strong>4.6 + 2.85</strong>.</p>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          Even them up: <strong>4.60</strong> + 2.85. Rough check — about 4.6 + 3, so near 7.5.
        </div>
        <TryIt
          prompt={<>2. Line up the points and add. What is the answer?</>}
          accept={["7.45"]}
          placeholder="like 7.45"
          value={fade}
          setValue={setFade}
          hint="hundredths: 0 + 5. Tenths: 6 + 8 = 14 tenths, so carry one whole."
          explain={
            <>
              4.60 + 2.85 = <strong>7.45</strong>, right beside the 7.5 we estimated. Writing the
              extra zero is what keeps the columns honest.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Adding or subtracting decimals</div>
          <div className="mt-2">1. Line up the decimal points</div>
          <div className="mt-1">2. Fill short numbers with zeros</div>
          <div className="mt-1">3. Add or subtract as usual, point drops down</div>
        </div>
        <KeyIdea>
          💡 Never line decimals up at the right-hand edge. Line up the points, and estimate first
          so a slipped point is obvious.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
