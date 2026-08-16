"use client";

import { useState } from "react";
import { MathText } from "@/components/MathText";
import { Step, KeyIdea, WrongBox } from "@/components/lesson/Step";
import { LessonShell, TryIt } from "@/components/lesson/LessonShell";
import { HundredGrid } from "@/components/lesson/Models";
import { PrimaryButton } from "@/components/ui";

/**
 * What percent means.
 *
 * "Per cent" is literally "per hundred", so the hundred grid used for decimals
 * is reused deliberately — a percent, a decimal and a fraction turn out to be
 * three ways of shading the same square, which is what makes conversion
 * obvious later instead of three memorised rules.
 */
export function PercentBasicsLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 5 · Percent · Meaning of Percent"
      title="What percent actually means"
      minutes={5}
      step={step}
      total={6}
    >
      <Step n={1} title="Per cent means per hundred" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          The word breaks in two: <strong>per</strong> means &ldquo;for every&rdquo;, and{" "}
          <strong>cent</strong> means hundred — the same cent as in a century, or 100 cents in a
          dollar.
        </p>
        <div className="mt-4 flex justify-center">
          <HundredGrid shaded={25} label="25% — 25 squares out of 100" />
        </div>
        <KeyIdea>
          <strong>25% just means 25 out of every 100.</strong> The % sign is shorthand for
          &ldquo;out of a hundred&rdquo;.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(2)}>Why a hundred?</PrimaryButton></div>
      </Step>

      <Step n={2} title="Why everything is out of 100" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <p className="text-ink-700">
          Two test scores: 18 out of 25, and 32 out of 50. Which is better? Hard to say — the
          totals are different.
        </p>
        <p className="mt-3 text-ink-700">
          Put both out of 100 and it is instant: <strong>72%</strong> and <strong>64%</strong>.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-6">
          <HundredGrid shaded={72} label="72%" size={130} />
          <HundredGrid shaded={64} label="64%" size={130} shade="tens" />
        </div>
        <KeyIdea>
          Percent exists to make different amounts comparable, by putting them all on the same
          scale of 100.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(3)}>The same square, three ways</PrimaryButton></div>
      </Step>

      <Step n={3} title="Percent, decimal and fraction are the same thing" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <div className="mt-2 flex justify-center">
          <HundredGrid shaded={50} label="half the square" />
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {[
            ["50%", "50 out of 100"],
            ["0.5", "5 tenths"],
            ["{1/2}", "one half"],
          ].map(([sym, why]) => (
            <div key={sym} className="rounded-xl bg-paper px-3 py-3 text-center">
              <div className="text-2xl font-black text-ink-900"><MathText text={sym} /></div>
              <div className="mt-1 text-xs text-ink-500">{why}</div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-ink-700">
          Three different labels, one amount. To turn a percent into a decimal, divide by 100 —
          which just moves the point two places left.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(4)}>What goes wrong?</PrimaryButton></div>
      </Step>

      <Step n={4} title="The mistake almost everyone makes" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <p className="text-ink-700">People treat the percent as the number itself:</p>
        <WrongBox>&ldquo;25% of 80 is 25&rdquo; &nbsp;or&nbsp; &ldquo;50% = 50&rdquo;</WrongBox>
        <p className="text-ink-700">
          A percent on its own isn&rsquo;t an amount — it is a <strong>share of something</strong>.
          50% of 10 is 5, but 50% of 1000 is 500. Always ask: <em>percent of what?</em>
        </p>
        <KeyIdea>
          A percent is a rate, not a quantity. It only becomes an amount once you say what it is a
          percent <em>of</em>.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(5)}>How do I find a percent of something?</PrimaryButton></div>
      </Step>

      <Step n={5} title="Finding a percent of an amount" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">
          The trick is to build from <strong>10%</strong>, which is easy — just divide by 10.
        </p>
        <div className="mt-4 space-y-2">
          {[
            ["10% of 80", "80 ÷ 10 = 8"],
            ["20% of 80", "double the 10% → 16"],
            ["5% of 80", "half the 10% → 4"],
            ["25% of 80", "20% + 5% = 16 + 4 = 20"],
          ].map(([q, a]) => (
            <div key={q} className="flex items-center justify-between rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-semibold text-ink-900">{q}</span>
              <span className="text-sm text-ink-700">{a}</span>
            </div>
          ))}
        </div>
        <KeyIdea>
          Find 10%, then add and halve your way to whatever you need. No calculator, and it works
          on any number.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(6)}>Your turn</PrimaryButton></div>
      </Step>

      <Step n={6} title="You try one" open={step === 6} onOpen={() => go(6)} done={false}>
        <p className="text-ink-700">
          A jacket costs <strong>$60</strong>. Find <strong>15%</strong> of it.
        </p>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          10% of 60 is <strong>6</strong>. So 5% is half of that — <strong>3</strong>.
        </div>
        <TryIt
          prompt={<>2. Add them together. What is 15% of $60?</>}
          accept={["9", "9.00", "$9"]}
          placeholder="dollars"
          value={fade}
          setValue={setFade}
          hint="15% is 10% plus 5%, so add 6 and 3."
          explain={
            <>
              6 + 3 = <strong>$9</strong>. Sensible too: 15% is a small slice, and $9 is a small
              slice of $60.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Percent</div>
          <div className="mt-2">1. % means &ldquo;out of 100&rdquo;</div>
          <div className="mt-1">2. A percent is always a percent OF something</div>
          <div className="mt-1">3. Find 10% first, then build from it</div>
        </div>
        <KeyIdea>
          💡 50%, 0.5 and <MathText text="{1/2}" /> are the same amount wearing different clothes.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
