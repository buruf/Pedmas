"use client";

import { useState } from "react";
import { MathText } from "@/components/MathText";
import { Step, KeyIdea, FormulaBox, WrongBox } from "@/components/lesson/Step";
import { LessonShell, EstimateCheck, TryIt } from "@/components/lesson/LessonShell";
import { PrimaryButton } from "@/components/ui";

/**
 * Scientific notation.
 *
 * The whole topic hinges on one question a child keeps having to re-answer:
 * which way does the point move? Told "the exponent counts places", they move
 * right every time and turn 2.5 × 10⁻³ into 2500. The fix is not a direction
 * rule to memorise but a size judgement made first — a negative power of ten is
 * a tiny number, so the answer must come out small.
 */
export function SciNotationLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [guess, setGuess] = useState<string | null>(null);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 8 · Exponents · Scientific Notation"
      title="Very big and very small numbers"
      minutes={7}
      step={step}
      total={6}
    >
      <Step n={1} title="How far away is the sun?" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          About <strong>150,000,000 km</strong>. Nobody can glance at that and count the zeros
          reliably — and miscounting one makes the answer ten times wrong.
        </p>
        <p className="mt-3 text-ink-700">Scientists write it like this instead:</p>
        <FormulaBox>
          <MathText text="1.5 * 10^8" />
        </FormulaBox>
        <p className="text-ink-700">
          One digit before the point, then a power of ten that says how big the number is. There is
          nothing to count by eye — the 8 tells you.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(2)}>How do I write one?</PrimaryButton></div>
      </Step>

      <Step n={2} title="Big numbers first" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <p className="text-ink-700">
          Write <strong>4300</strong> in scientific notation. Slide the point left until exactly one
          non-zero digit is in front of it, and count the slides.
        </p>
        <div className="mt-4 rounded-2xl bg-paper p-4">
          <ol className="space-y-2">
            {[
              ["Start", "4300."],
              ["Slide the point left, counting", "4.300 — 3 places"],
              ["Write the digits, then × 10 to the 3", "4.3 × 10^3"],
            ].map(([a, b], i) => (
              <li key={i} className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 text-sm">
                <span className="text-ink-700">
                  <span className="mr-2 font-bold text-brand-600">{i + 1}.</span>
                  {a}
                </span>
                <span className="font-bold text-ink-900"><MathText text={b} /></span>
              </li>
            ))}
          </ol>
        </div>
        <EstimateCheck>
          Undo it to check. <MathText text="10^3" /> is 1000, and 4.3 × 1000 = 4300 ✓ Never trust
          the slide on its own; multiply it back.
        </EstimateCheck>
        <div className="mt-4"><PrimaryButton onClick={() => go(3)}>Going the other way</PrimaryButton></div>
      </Step>

      <Step n={3} title="Powers of ten going downwards" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">
          Before touching a negative exponent, look at what the ladder actually does. Each step down
          divides by 10.
        </p>
        <div className="mt-3 space-y-1.5">
          {[
            ["10^3", "1000"],
            ["10^2", "100"],
            ["10^1", "10"],
            ["10^0", "1"],
            ["10^{−1}", "0.1"],
            ["10^{−2}", "0.01"],
            ["10^{−3}", "0.001"],
          ].map(([a, b], i) => (
            <div
              key={a}
              className={`flex items-center justify-between gap-2 rounded-xl px-3 py-1.5 ${
                i >= 4 ? "bg-brand-50" : "bg-paper"
              }`}
            >
              <span className="text-sm font-bold text-ink-900"><MathText text={a} /></span>
              <span className={`text-sm font-bold ${i >= 4 ? "text-brand-700" : "text-ink-700"}`}>{b}</span>
            </div>
          ))}
        </div>
        <KeyIdea>
          Nothing on that ladder ever turns negative. The numbers just get{" "}
          <strong>smaller and smaller</strong>, which is exactly what a negative exponent is for.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(4)}>Now the tricky one</PrimaryButton></div>
      </Step>

      <Step n={4} title="The mistake almost everyone makes" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <p className="text-ink-700">
          Work out <MathText text="2.5 * 10^{−3}" /> as an ordinary number.
        </p>
        <div className="mt-4 grid gap-2">
          {[
            { k: "b", label: "2500 — the exponent is 3, so move the point 3 places" },
            { k: "a", label: "0.0025" },
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
          <div className="pop-in">
            <WrongBox>
              <MathText text="2.5 * 10^{−3}" /> = 2500
            </WrongBox>
            <p className="text-ink-700">
              &ldquo;The exponent counts places&rdquo; is true, but it never said which way — so the
              point drifts right out of habit. Read the ladder instead:{" "}
              <MathText text="10^{−3}" /> is <strong>0.001</strong>.
            </p>
            <p className="mt-3 text-ink-700">
              Multiplying 2.5 by a thousandth has to make it <strong>smaller</strong> than 2.5. An
              answer of 2500 is a thousand times bigger — the opposite direction.
            </p>
            <div className="my-3 rounded-xl bg-ink-900 px-4 py-4 text-center text-2xl font-bold text-white">
              2.5 × 0.001 = 0.0025
            </div>
            <KeyIdea>
              Decide the <em>size</em> first, then move the point. Positive exponent → a big number,
              point goes right. Negative exponent → a small number, point goes left. The sign of the
              exponent never makes the number itself negative.
            </KeyIdea>
            <div className="mt-4"><PrimaryButton onClick={() => go(5)}>Both directions worked out</PrimaryButton></div>
          </div>
        )}
      </Step>

      <Step n={5} title="Both directions, side by side" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <div className="space-y-3">
          <div className="rounded-2xl bg-paper p-4">
            <div className="text-sm font-bold text-ink-900">
              <MathText text="6.2 * 10^5" /> as an ordinary number
            </div>
            <p className="mt-1 text-sm text-ink-700">
              Positive 5, so it is a big number. Move the point <strong>5 places right</strong>,
              filling with zeros.
            </p>
            <p className="mt-2 text-center text-lg font-bold text-ok-600">620000</p>
          </div>
          <div className="rounded-2xl bg-paper p-4">
            <div className="text-sm font-bold text-ink-900">
              <MathText text="8.4 * 10^{−4}" /> as an ordinary number
            </div>
            <p className="mt-1 text-sm text-ink-700">
              Negative 4, so it is a small number. Move the point <strong>4 places left</strong>.
            </p>
            <p className="mt-2 text-center text-lg font-bold text-ok-600">0.00084</p>
          </div>
          <div className="rounded-2xl bg-paper p-4">
            <div className="text-sm font-bold text-ink-900">0.00061 in scientific notation</div>
            <p className="mt-1 text-sm text-ink-700">
              Slide the point <strong>right</strong> until one non-zero digit leads: 4 places, to
              6.1. The number is smaller than 1, so the exponent is negative.
            </p>
            <p className="mt-2 text-center text-lg font-bold text-ok-600">
              <MathText text="6.1 * 10^{−4}" />
            </p>
          </div>
        </div>
        <KeyIdea>
          A number below 1 always gets a <strong>negative</strong> exponent; a number above 10 always
          gets a positive one. If yours disagrees, the point went the wrong way.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(6)}>Your turn</PrimaryButton></div>
      </Step>

      <Step n={6} title="You try one" open={step === 6} onOpen={() => go(6)} done={false}>
        <p className="text-ink-700">
          Write <MathText text="7.2 * 10^{−5}" /> as an ordinary number.
        </p>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          The exponent is negative, so the answer must be <strong>smaller than 7.2</strong>. Move the
          point 5 places left.
        </div>
        <TryIt
          prompt={<>2. What is the ordinary number?</>}
          accept={["0.000072", ".000072"]}
          placeholder="like 0.00081"
          value={fade}
          setValue={setFade}
          hint="the 7 has to end up 5 places after the point, so four zeros sit in between."
          explain={
            <>
              <strong>0.000072</strong>. Check it: <MathText text="10^{−5}" /> is 0.00001, and 7.2 ×
              0.00001 = 0.000072 ✓ Positive and tiny — a negative exponent shrinks a number, it never
              makes it negative.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Scientific notation</div>
          <div className="mt-2">1. One digit before the point, then × a power of ten</div>
          <div className="mt-1">2. Positive exponent = big number, point moves right</div>
          <div className="mt-1">3. Negative exponent = small number, point moves left</div>
        </div>
        <KeyIdea>
          💡 Ask &ldquo;should this end up big or tiny?&rdquo; before you move anything. Get the size
          right and the direction of the point follows on its own.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
