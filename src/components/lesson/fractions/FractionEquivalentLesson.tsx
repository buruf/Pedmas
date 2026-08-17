"use client";

import { useState } from "react";
import { MathText } from "@/components/MathText";
import { Step, KeyIdea, WrongBox } from "@/components/lesson/Step";
import { LessonShell, TryIt } from "@/components/lesson/LessonShell";
import { FractionBar, FractionCompare } from "@/components/lesson/FractionBar";
import { PrimaryButton } from "@/components/ui";

/**
 * Equivalent fractions and simplifying.
 *
 * The misconception here is adding to both parts instead of multiplying —
 * a natural guess, because "do the same to both" sounds right. Showing that
 * 1/2 and 2/3 shade different amounts settles it, and the same picture read
 * backwards gives simplifying for free.
 */
export function FractionEquivalentLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 4 · Fractions · Equivalent Fractions"
      title="Different fractions, same amount"
      minutes={5}
      step={step}
      total={6}
    >
      <Step n={1} title="Two ways to cut the same bar" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          Half a chocolate bar. Now cut every piece in two — you have not eaten anything, but the
          name has changed.
        </p>
        <div className="mt-4 flex flex-col items-center gap-3">
          <FractionBar parts={2} shaded={1} shade="brand" label="{1/2}" />
          <span className="text-sm font-bold text-brand-600">↓ cut each piece into 2</span>
          <FractionBar parts={4} shaded={2} shade="brand" label="{2/4} — the same amount" />
        </div>
        <KeyIdea>
          <MathText text="{1/2}" /> and <MathText text="{2/4}" /> are{" "}
          <strong>equivalent</strong> — different names for one amount.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(2)}>Keep cutting</PrimaryButton></div>
      </Step>

      <Step n={2} title="A whole family of names" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <div className="mt-2">
          <FractionCompare
            rows={[
              { parts: 2, shaded: 1, shade: "brand", label: "{1/2}" },
              { parts: 4, shaded: 2, shade: "brand", label: "{2/4}" },
              { parts: 6, shaded: 3, shade: "brand", label: "{3/6}" },
              { parts: 8, shaded: 4, shade: "brand", label: "{4/8}" },
            ]}
          />
        </div>
        <p className="mt-4 text-ink-700">
          Every bar is shaded to exactly the same point. Look at the numbers: the top and bottom
          are both being <strong>multiplied</strong> by the same thing.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(3)}>What goes wrong?</PrimaryButton></div>
      </Step>

      <Step n={3} title="The mistake almost everyone makes" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">
          &ldquo;Do the same to both&rdquo; is right — but people <em>add</em> instead of
          multiplying:
        </p>
        <WrongBox>
          <MathText text="{1/2} = {2/3}" /> &nbsp;&ldquo;add 1 to the top and 1 to the bottom&rdquo;
        </WrongBox>
        <div className="mt-3">
          <FractionCompare
            rows={[
              { parts: 2, shaded: 1, shade: "brand", label: "{1/2}" },
              { parts: 3, shaded: 2, shade: "rose", label: "{2/3} — clearly more" },
            ]}
          />
        </div>
        <p className="mt-4 text-ink-700">
          Not the same amount at all. Adding changes the size of the pieces <em>and</em> how many
          you have, by different proportions.
        </p>
        <KeyIdea>
          Multiplying both parts is really multiplying by <MathText text="{2/2}" />, which is 1 —
          and multiplying by 1 never changes an amount. Adding 1 to each part is not multiplying
          by 1.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(4)}>Show me the rule</PrimaryButton></div>
      </Step>

      <Step n={4} title="Multiply both parts by the same number" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <div className="rounded-2xl bg-paper p-4">
          <ol className="space-y-2">
            {[
              ["{2/3} with top and bottom × 2", "{4/6}"],
              ["{2/3} with top and bottom × 3", "{6/9}"],
              ["{2/3} with top and bottom × 5", "{10/15}"],
            ].map(([a, b], i) => (
              <li key={i} className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 text-sm">
                <span className="text-ink-700"><MathText text={a} /></span>
                <span className="font-bold text-ink-900"><MathText text={b} /></span>
              </li>
            ))}
          </ol>
        </div>
        <p className="mt-3 text-ink-700">
          This is exactly what you do to add fractions — rename them until the bottoms match.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(5)}>Now backwards</PrimaryButton></div>
      </Step>

      <Step n={5} title="Simplifying is the same idea reversed" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">
          To simplify, <strong>divide</strong> both parts by the same number — glue the small
          pieces back into bigger ones.
        </p>
        <div className="mt-4 flex flex-col items-center gap-3">
          <FractionBar parts={12} shaded={8} shade="teal" label="{8/12}" />
          <span className="text-sm font-bold text-brand-600">↓ divide top and bottom by 4</span>
          <FractionBar parts={3} shaded={2} shade="teal" label="{2/3} — simplest form" />
        </div>
        <KeyIdea>
          A fraction is in its simplest form when no number divides both parts any more. Here 4 was
          the biggest that fitted.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(6)}>Your turn</PrimaryButton></div>
      </Step>

      <Step n={6} title="You try one" open={step === 6} onOpen={() => go(6)} done={false}>
        <p className="text-ink-700">
          Write <MathText text="{3/4}" /> with a bottom number of 8.
        </p>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">Hint. </span>
          4 × 2 = 8, so the bottom was multiplied by 2. Do the same to the top.
        </div>
        <TryIt
          prompt={<>What is the equivalent fraction?</>}
          accept={["6/8"]}
          placeholder="like 6/8"
          value={fade}
          setValue={setFade}
          hint="multiply the top by 2 as well — not add 2."
          explain={
            <>
              <MathText text="{3/4} = {6/8}" />. Both parts were multiplied by 2, so the amount is
              unchanged — the pieces are just half the size and there are twice as many.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Equivalent fractions</div>
          <div className="mt-2">1. Multiply BOTH parts by the same number</div>
          <div className="mt-1">2. Divide BOTH parts to simplify</div>
          <div className="mt-1">3. Never add — adding changes the amount</div>
        </div>
        <KeyIdea>
          💡 Multiplying top and bottom by the same number is multiplying by 1 in disguise. That is
          why the amount survives.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
