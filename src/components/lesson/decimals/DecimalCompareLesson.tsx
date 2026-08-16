"use client";

import { useState } from "react";
import { Step, KeyIdea, WrongBox } from "@/components/lesson/Step";
import { LessonShell, TryIt } from "@/components/lesson/LessonShell";
import { HundredGrid, DecimalChart } from "@/components/lesson/Models";
import { PrimaryButton } from "@/components/ui";

/**
 * Comparing decimals.
 *
 * Built entirely around the most persistent error in the topic: reading 0.45
 * as larger than 0.5 because 45 > 5. Grids are used rather than argument,
 * because seeing 0.5 fill more of the square settles it in a way a rule
 * never does.
 */
export function DecimalCompareLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [guess, setGuess] = useState<string | null>(null);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 4 · Decimals · Comparing Decimals"
      title="Which decimal is bigger?"
      minutes={5}
      step={step}
      total={6}
    >
      <Step n={1} title="Two race times" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          Two runners. One took <strong>0.5</strong> of a minute, the other{" "}
          <strong>0.45</strong> of a minute.
        </p>
        <p className="mt-3 text-ink-700">Which number is bigger?</p>
        <div className="mt-4 grid gap-2">
          {[
            { k: "b", label: "0.45 — it has more digits" },
            { k: "a", label: "0.5" },
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
            Hold that thought — let&rsquo;s look at what each one actually is.
            <div className="mt-3"><PrimaryButton onClick={() => go(2)}>Show me</PrimaryButton></div>
          </div>
        )}
      </Step>

      <Step n={2} title="The mistake almost everyone makes" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <p className="text-ink-700">
          Nearly everyone picks 0.45, because 45 is a bigger number than 5:
        </p>
        <WrongBox>0.45 &gt; 0.5 &nbsp;&ldquo;because 45 is bigger than 5&rdquo;</WrongBox>
        <p className="text-ink-700">
          It feels obvious. It is also wrong — and the reason it is wrong is the whole point of
          this lesson.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(3)}>Prove it</PrimaryButton></div>
      </Step>

      <Step n={3} title="Look at how much is shaded" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <div className="mt-2 flex flex-wrap justify-center gap-6">
          <HundredGrid shaded={50} label="0.5 — five whole strips" size={140} />
          <HundredGrid shaded={45} label="0.45 — four strips and 5 squares" size={140} shade="tens" />
        </div>
        <p className="mt-4 text-center text-lg font-bold text-ok-600">0.5 is bigger.</p>
        <KeyIdea>
          0.5 means <strong>5 tenths</strong>, which is 50 hundredths. 0.45 is only 45 hundredths.
          The digits after the point are not a whole number — they are parts.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(4)}>So how do I compare them?</PrimaryButton></div>
      </Step>

      <Step n={4} title="Compare place by place, left to right" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <p className="text-ink-700">
          Line the numbers up by their decimal point and read across from the left. The first
          column where they differ decides it.
        </p>
        <div className="mt-4">
          <DecimalChart rows={[{ value: "0.50" }, { value: "0.45" }]} highlight="tenths" />
        </div>
        <p className="mt-4 text-ink-700">
          Tenths: <strong>5</strong> against <strong>4</strong>. 5 wins, and nothing further right
          can change that — the hundredths are too small to catch up.
        </p>
        <KeyIdea>
          Filling the gap with a zero makes it obvious: 0.5 is 0.<strong>50</strong>, and 50 &gt; 45.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(5)}>Another pair</PrimaryButton></div>
      </Step>

      <Step n={5} title="Length tells you nothing" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            ["0.3 vs 0.29", "0.3 is bigger — 30 hundredths beats 29"],
            ["0.7 vs 0.7000", "the same — trailing zeros add nothing"],
            ["0.1 vs 0.099", "0.1 is bigger — 100 thousandths beats 99"],
            ["2.5 vs 2.45", "2.5 is bigger — compare the tenths"],
          ].map(([pair, why]) => (
            <div key={pair} className="rounded-xl bg-paper px-3 py-2.5">
              <div className="font-bold text-ink-900">{pair}</div>
              <div className="mt-0.5 text-sm text-ink-700">{why}</div>
            </div>
          ))}
        </div>
        <KeyIdea>
          A longer decimal is <strong>not</strong> a bigger one. More digits just means the amount
          was measured more finely.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(6)}>Your turn</PrimaryButton></div>
      </Step>

      <Step n={6} title="You try one" open={step === 6} onOpen={() => go(6)} done={false}>
        <p className="text-ink-700">Which is bigger: <strong>0.6</strong> or <strong>0.58</strong>?</p>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">Hint. </span>
          Even them up first — write 0.6 as 0.<strong>60</strong>.
        </div>
        <TryIt
          prompt={<>Type the bigger number:</>}
          accept={["0.6", ".6", "0.60"]}
          placeholder="0.6 or 0.58"
          value={fade}
          setValue={setFade}
          hint="compare the tenths first: 6 against 5."
          explain={
            <>
              0.60 against 0.58 — 60 hundredths beats 58, so <strong>0.6</strong> is bigger, even
              though it looks shorter.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Comparing decimals</div>
          <div className="mt-2">1. Line up the decimal points</div>
          <div className="mt-1">2. Add zeros so both have the same length</div>
          <div className="mt-1">3. Compare from the left; first difference wins</div>
        </div>
        <KeyIdea>
          💡 Never compare decimals by counting digits. 0.5 is bigger than 0.45, and 0.1 is bigger
          than 0.0999.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
