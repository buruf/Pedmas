"use client";

import { useState } from "react";
import { MathText } from "@/components/MathText";
import { Step, KeyIdea, WrongBox } from "@/components/lesson/Step";
import { LessonShell, TryIt } from "@/components/lesson/LessonShell";
import { FractionBar, FractionCompare } from "@/components/lesson/FractionBar";
import { PrimaryButton } from "@/components/ui";

/**
 * Comparing fractions.
 *
 * Confronts the most persistent error in the whole topic: reading a bigger
 * denominator as a bigger fraction. The cause is real — 8 IS bigger than 4 —
 * so the lesson does not dismiss the instinct, it shows what the denominator
 * actually counts.
 */
export function FractionCompareLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [guess, setGuess] = useState<string | null>(null);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 3 · Fractions · Comparing Fractions"
      title="Which fraction is bigger?"
      minutes={5}
      step={step}
      total={6}
    >
      <Step n={1} title="Two slices of pizza" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          Two identical pizzas. You get <MathText text="{1/4}" /> of one. Your friend gets{" "}
          <MathText text="{1/8}" /> of the other.
        </p>
        <p className="mt-3 text-ink-700">Who got more?</p>
        <div className="mt-4 grid gap-2">
          {[
            { k: "b", label: "Your friend — 8 is bigger than 4" },
            { k: "a", label: "You" },
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
            Let&rsquo;s cut the pizzas and see.
            <div className="mt-3"><PrimaryButton onClick={() => go(2)}>Show me</PrimaryButton></div>
          </div>
        )}
      </Step>

      <Step n={2} title="The mistake almost everyone makes" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <WrongBox>
          <MathText text="{1/8} > {1/4}" /> &nbsp;&ldquo;because 8 is bigger than 4&rdquo;
        </WrongBox>
        <p className="text-ink-700">
          The instinct is reasonable — 8 <em>is</em> bigger than 4. But look at what the bottom
          number is counting.
        </p>
        <div className="mt-4">
          <FractionCompare
            rows={[
              { parts: 4, shaded: 1, shade: "brand", label: "{1/4} — cut into 4" },
              { parts: 8, shaded: 1, shade: "teal", label: "{1/8} — cut into 8" },
            ]}
          />
        </div>
        <p className="mt-4 text-center text-lg font-bold text-ok-600">
          <MathText text="{1/4}" /> is bigger. You got more.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(3)}>Why?</PrimaryButton></div>
      </Step>

      <Step n={3} title="The bottom number counts the cuts" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">
          The denominator tells you <strong>how many pieces the whole was cut into</strong> — not
          how much you got.
        </p>
        <div className="mt-4 flex flex-col gap-3">
          {[2, 4, 8].map((d) => (
            <FractionBar key={d} parts={d} shaded={1} shade="brand" label={`{1/${d}}`} />
          ))}
        </div>
        <KeyIdea>
          More cuts means <strong>smaller</strong> pieces. So when the tops are the same, the
          fraction with the <em>bigger</em> bottom is the <em>smaller</em> amount.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(4)}>What if the tops differ?</PrimaryButton></div>
      </Step>

      <Step n={4} title="When neither part matches" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <p className="text-ink-700">
          Compare <MathText text="{2/3}" /> and <MathText text="{3/5}" />. Different tops,
          different bottoms — so make the pieces the same size first.
        </p>
        <div className="mt-4 rounded-2xl bg-paper p-4">
          <ol className="space-y-2">
            {[
              ["Both can be cut into fifteenths", "3 × 5 = 15"],
              ["{2/3} becomes", "{10/15}"],
              ["{3/5} becomes", "{9/15}"],
              ["Now just compare the tops", "10 > 9"],
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
          So <MathText text="{2/3}" /> is bigger.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(5)}>A quicker way</PrimaryButton></div>
      </Step>

      <Step n={5} title="Or compare against a half" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">
          Often you can decide without any arithmetic. Ask whether each fraction is above or below{" "}
          <MathText text="{1/2}" />.
        </p>
        <div className="mt-3 space-y-2">
          {[
            ["{5/8}", "more than half — 4 would be half of 8"],
            ["{3/7}", "less than half — 3.5 would be half of 7"],
            ["so {5/8} is bigger", "no common denominator needed"],
          ].map(([a, b], i) => (
            <div key={i} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="font-bold text-ink-900"><MathText text={a} /></span>
              <span className="text-sm text-ink-700">{b}</span>
            </div>
          ))}
        </div>
        <KeyIdea>
          Double the top. If it beats the bottom, the fraction is more than a half.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(6)}>Your turn</PrimaryButton></div>
      </Step>

      <Step n={6} title="You try one" open={step === 6} onOpen={() => go(6)} done={false}>
        <p className="text-ink-700">
          Which is bigger: <MathText text="{1/6}" /> or <MathText text="{1/3}" />?
        </p>
        <div className="mt-3 flex flex-col gap-3">
          <FractionBar parts={6} shaded={1} shade="brand" label="{1/6}" />
          <FractionBar parts={3} shaded={1} shade="teal" label="{1/3}" />
        </div>
        <TryIt
          prompt={<>Type the bigger fraction:</>}
          accept={["1/3"]}
          placeholder="like 1/2"
          value={fade}
          setValue={setFade}
          hint="the tops match, so the one cut into fewer pieces has the bigger pieces."
          explain={
            <>
              <MathText text="{1/3}" /> is bigger. Cutting into 6 makes smaller pieces than cutting
              into 3 — in fact <MathText text="{1/3}" /> is exactly two sixths.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Comparing fractions</div>
          <div className="mt-2">1. Same top? Bigger bottom means smaller</div>
          <div className="mt-1">2. Same bottom? Just compare the tops</div>
          <div className="mt-1">3. Neither? Make the bottoms match, or compare to a half</div>
        </div>
        <KeyIdea>
          💡 A bigger bottom number never means a bigger fraction. It means the whole was cut into
          more, smaller pieces.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
