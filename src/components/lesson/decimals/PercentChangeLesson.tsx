"use client";

import { useState } from "react";
import { Step, KeyIdea, WrongBox } from "@/components/lesson/Step";
import { LessonShell, EstimateCheck, TryIt } from "@/components/lesson/LessonShell";
import { PrimaryButton } from "@/components/ui";

/**
 * Percent increase, decrease and discounts.
 *
 * Two misconceptions, both expensive in real life: that successive percentages
 * add up, and that a percentage increase is undone by subtracting the same
 * percentage. Both are disproved with money, where the error is concrete.
 */
export function PercentChangeLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [guess, setGuess] = useState<string | null>(null);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 7 · Percent · Discounts, Increase & Decrease"
      title="Percent changes in the real world"
      minutes={6}
      step={step}
      total={6}
    >
      <Step n={1} title="A sale sign" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          A coat costs <strong>$80</strong>. The sign says <strong>25% off</strong>.
        </p>
        <div className="mt-4 rounded-2xl bg-paper p-4">
          <ol className="space-y-2">
            {[
              ["Find 10% of 80", "8"],
              ["So 20% is double that", "16"],
              ["And 5% is half of 10%", "4"],
              ["25% = 20% + 5%", "20"],
            ].map(([a, b], i) => (
              <li key={i} className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 text-sm">
                <span className="text-ink-700">
                  <span className="mr-2 font-bold text-brand-600">{i + 1}.</span>
                  {a}
                </span>
                <span className="font-bold text-ink-900">{b}</span>
              </li>
            ))}
          </ol>
        </div>
        <p className="mt-3 text-ink-700">
          The discount is <strong>$20</strong>, so you pay <strong>$60</strong>.
        </p>
        <KeyIdea>
          Careful: 25% is what comes <em>off</em>, not what you pay. The question decides which one
          you want.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(2)}>A faster way</PrimaryButton></div>
      </Step>

      <Step n={2} title="Go straight to what you pay" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <p className="text-ink-700">
          If 25% comes off, you keep <strong>75%</strong>. So find 75% once, instead of finding the
          discount and subtracting.
        </p>
        <div className="my-3 rounded-xl bg-ink-900 px-4 py-4 text-center text-lg font-bold text-white">
          80 × 0.75 = 60
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {[
            ["20% off", "pay 80% → × 0.8"],
            ["30% off", "pay 70% → × 0.7"],
            ["15% added", "pay 115% → × 1.15"],
            ["8% tax added", "pay 108% → × 1.08"],
          ].map(([a, b]) => (
            <div key={a} className="rounded-xl bg-paper px-3 py-2 text-sm">
              <span className="font-semibold text-ink-900">{a}</span>
              <span className="ml-2 text-ink-700">{b}</span>
            </div>
          ))}
        </div>
        <div className="mt-4"><PrimaryButton onClick={() => go(3)}>Now a trap</PrimaryButton></div>
      </Step>

      <Step n={3} title="Two discounts in a row" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">
          A $100 jacket: <strong>20% off</strong>, then another <strong>10% off</strong> at the
          till. What percent have you saved altogether?
        </p>
        <div className="mt-4 grid gap-2">
          {[
            { k: "a", label: "30% — just add them" },
            { k: "b", label: "28%" },
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
          <div className="mt-4 rounded-xl border border-ok-600/30 bg-ok-100 px-4 py-3 text-sm pop-in">
            <p className="font-bold text-ink-900">
              {guess === "b" ? "✓ Right — and here's why." : "It's 28%, not 30%. Here's why."}
            </p>
            <ol className="mt-2 space-y-1 text-ink-700">
              <li>1. 20% off $100 → you pay $80.</li>
              <li>2. The second 10% comes off <strong>$80</strong>, not $100 → $8 off.</li>
              <li>3. You pay $72, so you saved $28 — that is 28%.</li>
            </ol>
            <div className="mt-3"><PrimaryButton onClick={() => go(4)}>Why it matters</PrimaryButton></div>
          </div>
        )}
      </Step>

      <Step n={4} title="Percentages don't add up" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <WrongBox>20% off then 10% off = 30% off</WrongBox>
        <p className="text-ink-700">
          Each percentage applies to <strong>whatever the price is at that moment</strong>. The
          second discount is taken from an already-reduced price, so it is worth less.
        </p>
        <div className="mt-3 rounded-xl bg-paper px-4 py-3 text-center font-bold text-ink-900">
          100 × 0.8 × 0.9 = 72
        </div>
        <KeyIdea>
          Chain the multipliers instead of adding the percentages. It works for any number of
          changes, in any order.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(5)}>The other trap</PrimaryButton></div>
      </Step>

      <Step n={5} title="Undoing an increase" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">
          A price rose by 10% to <strong>$198</strong>. What was it before?
        </p>
        <WrongBox>take 10% off $198 → $178.20</WrongBox>
        <p className="text-ink-700">
          That 10% was added to the <em>old</em> price, not the new one. The new price is{" "}
          <strong>110%</strong> of the original, so divide rather than subtract.
        </p>
        <div className="mt-3 rounded-xl bg-ink-900 px-4 py-4 text-center text-lg font-bold text-white">
          198 ÷ 1.10 = 180
        </div>
        <EstimateCheck>
          Test it forwards: 180 + 10% of 180 = 180 + 18 = 198 ✓. The wrong answer, 178.20, fails
          that check.
        </EstimateCheck>
        <div className="mt-4"><PrimaryButton onClick={() => go(6)}>Your turn</PrimaryButton></div>
      </Step>

      <Step n={6} title="You try one" open={step === 6} onOpen={() => go(6)} done={false}>
        <p className="text-ink-700">
          A $40 game has <strong>25% off</strong>. What do you pay?
        </p>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">Hint. </span>
          25% off means you pay <strong>75%</strong>, so multiply by 0.75.
        </div>
        <TryIt
          prompt={<>What is the sale price?</>}
          accept={["30", "30.00", "$30"]}
          placeholder="dollars"
          value={fade}
          setValue={setFade}
          hint="10% of 40 is 4, so 25% is 4 + 4 + 2 = 10 off."
          explain={
            <>
              40 × 0.75 = <strong>$30</strong>. Or find the $10 discount and subtract — same
              answer, fewer steps the first way.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Percent change</div>
          <div className="mt-2">1. Work out what you keep, not what comes off</div>
          <div className="mt-1">2. Chain multipliers — never add percentages</div>
          <div className="mt-1">3. To undo a change, divide by the multiplier</div>
        </div>
        <KeyIdea>
          💡 A percentage is always <em>of</em> something, and that something changes as you go.
          This is why two discounts never add up.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
