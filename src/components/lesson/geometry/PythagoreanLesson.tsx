"use client";

import { useState } from "react";
import { Step, KeyIdea, FormulaBox, WrongBox } from "@/components/lesson/Step";
import { LessonShell, EstimateCheck, TryIt } from "@/components/lesson/LessonShell";
import { PrimaryButton } from "@/components/ui";
import { MathText } from "@/components/MathText";
import { RightTriangleFig, FigRow } from "./GeoModels";

/**
 * The Pythagorean theorem.
 *
 * Three misconceptions, in the order they actually bite. Sides get added
 * instead of squared; the given hypotenuse gets used as a leg; and the theorem
 * gets applied to triangles with no right angle at all. The squares drawn on
 * the three sides answer the first two at once — the big square is visibly the
 * total of the other two, so it can never be one of the parts.
 */
export function PythagoreanLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [guess, setGuess] = useState<string | null>(null);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 8 · Geometry · Pythagorean Theorem"
      title="The longest side of a right triangle"
      minutes={7}
      step={step}
      total={7}
    >
      <Step n={1} title="A ladder against a wall" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          The foot of a ladder is <strong>3 m</strong> out from the wall, and its top reaches{" "}
          <strong>4 m</strong> up. How long is the ladder?
        </p>
        <p className="mt-3 text-ink-700">
          The wall, the ground and the ladder make a triangle with a square corner where the wall
          meets the ground.
        </p>
        <div className="mt-3">
          <RightTriangleFig a={4} b={3} unknown="c" unit="m" />
        </div>
        <div className="mt-4 grid gap-2">
          {[
            { k: "7", label: "7 m — 3 + 4" },
            { k: "5", label: "5 m" },
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
            Let&rsquo;s build actual squares on the sides and see.
            <div className="mt-3">
              <PrimaryButton onClick={() => go(2)}>Show me</PrimaryButton>
            </div>
          </div>
        )}
      </Step>

      <Step n={2} title="The mistake almost everyone makes" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <WrongBox>3 m + 4 m = 7 m</WrongBox>
        <p className="text-ink-700">
          Test that method. Lay the ladder flat along the ground and it would stretch 7 m — but
          standing it up in the corner, it only has to cover the 3 m out and the 4 m up{" "}
          <em>at the same time</em>. It must come out shorter than going the long way round.
        </p>
        <p className="mt-3 text-ink-700">
          Here is what does work. Build a real square on each of the three sides and count the small
          squares inside:
        </p>
        <div className="mt-3">
          <RightTriangleFig a={4} b={3} c={5} squares unit="m" caption="16 + 9 = 25" />
        </div>
        <div className="mt-3 rounded-2xl bg-paper p-4">
          <ol className="space-y-2">
            {[
              ["Square on the 3 m side", "3^2 = 9"],
              ["Square on the 4 m side", "4^2 = 16"],
              ["Those two together", "9 + 16 = 25"],
              ["A square of 25 has sides of", "sqrt(25) = 5 m"],
            ].map(([a, b], i) => (
              <li key={i} className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 text-sm">
                <span className="text-ink-700">
                  <span className="mr-2 font-bold text-brand-600">{i + 1}.</span>
                  <MathText text={a} />
                </span>
                <span className="font-bold text-ink-900">
                  <MathText text={b} />
                </span>
              </li>
            ))}
          </ol>
        </div>
        <p className="mt-3 text-center text-lg font-bold text-ok-600">The ladder is 5 m long.</p>
        <KeyIdea>
          The <strong>squares</strong> add up. The <strong>sides</strong> never do. That single
          sentence is the whole theorem.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(3)}>Name the sides</PrimaryButton>
        </div>
      </Step>

      <Step n={3} title="Legs and hypotenuse" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">
          The two sides that make the square corner are the <strong>legs</strong>. The side facing
          the square corner is the <strong>hypotenuse</strong>.
        </p>
        <div className="mt-3 space-y-2">
          {[
            ["The hypotenuse is always opposite the right angle", "no exceptions"],
            ["The hypotenuse is always the longest side", "it holds the other two squares"],
            ["Only right triangles", "no square corner, no theorem"],
          ].map(([a, b]) => (
            <div key={a} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-semibold text-ink-900">{a}</span>
              <span className="text-sm text-ink-500">{b}</span>
            </div>
          ))}
        </div>
        <FormulaBox>
          <MathText text="a^2 + b^2 = c^2" />
          <div className="mt-1 text-sm font-semibold text-brand-200">c is always the hypotenuse</div>
        </FormulaBox>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(4)}>The second trap</PrimaryButton>
        </div>
      </Step>

      <Step n={4} title="When the long side is the one you know" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <p className="text-ink-700">
          A ramp is <strong>13 m</strong> long and reaches <strong>12 m</strong> along the ground.
          How high is the end?
        </p>
        <div className="mt-3">
          <RightTriangleFig a={5} b={12} c={13} unknown="a" unit="m" />
        </div>
        <WrongBox>
          <MathText text="13^2 + 12^2 = 313" />, so the height is about 17.7 m
        </WrongBox>
        <p className="text-ink-700">
          The formula was used exactly as written — but 13 was dropped into the <em>a</em> slot when
          it is the hypotenuse. Check the answer against the picture: a 17.7 m side would be longer
          than the 13 m ramp facing the square corner, and nothing can beat the hypotenuse.
        </p>
        <div className="mt-3 rounded-2xl bg-paper p-4">
          <ol className="space-y-2">
            {[
              ["The hypotenuse's square holds both others", "13^2 = 169"],
              ["Take away the leg you know", "169 − 144 = 25"],
              ["That leaves the missing leg's square", "sqrt(25) = 5 m"],
            ].map(([a, b], i) => (
              <li key={i} className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 text-sm">
                <span className="text-ink-700">
                  <span className="mr-2 font-bold text-brand-600">{i + 1}.</span>
                  <MathText text={a} />
                </span>
                <span className="font-bold text-ink-900">
                  <MathText text={b} />
                </span>
              </li>
            ))}
          </ol>
        </div>
        <KeyIdea>
          Looking for the hypotenuse? <strong>Add</strong> the squares. Looking for a leg?{" "}
          <strong>Subtract</strong> from the hypotenuse&rsquo;s square. Deciding which before you
          touch a calculator prevents nearly every error here.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(5)}>A worked example</PrimaryButton>
        </div>
      </Step>

      <Step n={5} title="A worked example" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">
          A field is <strong>15 m</strong> by <strong>8 m</strong>. How long is the diagonal path
          across it?
        </p>
        <div className="mt-3">
          <RightTriangleFig a={8} b={15} unknown="c" unit="m" />
        </div>
        <div className="mt-3 rounded-2xl bg-paper p-4">
          <ol className="space-y-2">
            {[
              ["The path faces the square corner, so it is c", "c^2 = a^2 + b^2"],
              ["Square each leg", "8^2 = 64, 15^2 = 225"],
              ["Add them", "64 + 225 = 289"],
              ["Undo the square", "sqrt(289) = 17 m"],
            ].map(([a, b], i) => (
              <li key={i} className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 text-sm">
                <span className="text-ink-700">
                  <span className="mr-2 font-bold text-brand-600">{i + 1}.</span>
                  <MathText text={a} />
                </span>
                <span className="font-bold text-ink-900">
                  <MathText text={b} />
                </span>
              </li>
            ))}
          </ol>
        </div>
        <EstimateCheck>
          The diagonal must be longer than 15 m but shorter than walking 15 + 8 = 23 m. 17 m sits
          comfortably between — so it is believable.
        </EstimateCheck>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(6)}>When the answer isn&rsquo;t whole</PrimaryButton>
        </div>
      </Step>

      <Step n={6} title="Most answers are not whole numbers" open={step === 6} onOpen={() => go(6)} done={step > 6}>
        <p className="text-ink-700">
          3-4-5, 5-12-13 and 8-15-17 are famous because they come out exactly. Most triangles do
          not.
        </p>
        <FigRow>
          <RightTriangleFig a={2} b={3} unknown="c" unit="cm" />
        </FigRow>
        <div className="mt-3 rounded-2xl bg-paper p-4 text-center">
          <div className="text-lg font-bold text-ink-900">
            <MathText text="c^2 = 2^2 + 3^2 = 4 + 9 = 13" />
          </div>
          <div className="my-2 text-sm font-semibold text-brand-600">13 is not a perfect square</div>
          <div className="text-lg font-bold text-ok-600">
            <MathText text="c = sqrt(13) cm" /> — exactly
          </div>
        </div>
        <p className="mt-3 text-ink-700">
          Leaving it as <MathText text="sqrt(13)" /> is not giving up; it is the exact answer. Round
          only at the very end, if you are asked to.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(7)}>Your turn</PrimaryButton>
        </div>
      </Step>

      <Step n={7} title="You try one" open={step === 7} onOpen={() => go(7)} done={false}>
        <p className="text-ink-700">
          A kite string is <strong>10 m</strong> long. The kite is <strong>6 m</strong> along the
          ground from where you stand. How high is it?
        </p>
        <div className="mt-3">
          <RightTriangleFig a={8} b={6} c={10} unknown="a" unit="m" />
        </div>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          The string faces the square corner, so it is the hypotenuse:{" "}
          <MathText text="10^2 = 100" /> and <MathText text="6^2 = 36" />.
        </div>
        <TryIt
          prompt={<>2. Height² = 100 − 36 = 64. So how high is the kite, in metres?</>}
          accept={["8"]}
          placeholder="like 5"
          value={fade}
          setValue={setFade}
          hint="you need the number that multiplies by itself to make 64."
          explain={
            <>
              <MathText text="sqrt(64) = 8" />, so the kite is <strong>8 m</strong> up. It is shorter
              than the 10 m string, exactly as a leg must be.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Pythagoras</div>
          <div className="mt-2">1. Right angle only — find it first</div>
          <div className="mt-1">2. The hypotenuse faces it, and is the longest side</div>
          <div className="mt-1">3. Missing hypotenuse? Add the squares</div>
          <div className="mt-1">4. Missing leg? Subtract from the hypotenuse&rsquo;s square</div>
          <div className="mt-1">5. Square root at the end, and check it is sensible</div>
        </div>
        <KeyIdea>
          💡 Squares add, sides do not. And if an answer comes out longer than the hypotenuse, you
          added when you should have subtracted.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
