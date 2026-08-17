"use client";

import { useState } from "react";
import { Step, KeyIdea, FormulaBox, WrongBox } from "@/components/lesson/Step";
import { LessonShell, EstimateCheck, TryIt } from "@/components/lesson/LessonShell";
import { PrimaryButton } from "@/components/ui";
import { MathText } from "@/components/MathText";
import { CircleFig, PiUnrollFig, FigRow } from "./GeoModels";

/**
 * Circumference and area of a circle.
 *
 * Two misconceptions that both cost whole marks. The diameter gets fed into a
 * formula that wanted the radius — an error that quadruples an area, so the
 * answer is not slightly wrong but absurd. And the two formulas get swapped,
 * which the units catch instantly: a distance round the edge cannot be
 * measured in square centimetres.
 */
export function CircleMeasureLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [guess, setGuess] = useState<string | null>(null);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 7 · Geometry · Circles"
      title="Round the edge, and across the middle"
      minutes={7}
      step={step}
      total={7}
    >
      <Step n={1} title="A wheel and a pizza" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          A circle has two lengths worth naming. The <strong>radius</strong> goes from the centre to
          the edge. The <strong>diameter</strong> crosses the whole circle through the centre.
        </p>
        <div className="mt-3">
          <CircleFig r={5} unit="cm" show={["radius", "diameter"]} caption="d = 2r, always" />
        </div>
        <p className="mt-3 text-ink-700">
          The diameter is made of two radii laid end to end, so it is always{" "}
          <strong>twice</strong> the radius — and the radius is half the diameter.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(2)}>How far round?</PrimaryButton>
        </div>
      </Step>

      <Step n={2} title="Where π actually comes from" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <p className="text-ink-700">
          Take a tin, wrap a string once round it, and lay the string out straight. Then measure the
          tin across the middle and mark that length onto the string over and over.
        </p>
        <div className="mt-3">
          <PiUnrollFig caption="one trip round = a bit more than 3 diameters" />
        </div>
        <p className="mt-3 text-ink-700">
          It fits <strong>three times, with a small piece left over</strong>. Try it with a coin, a
          plate, a bucket — always the same. That fixed number is π, and it is about{" "}
          <strong>3.14</strong>.
        </p>
        <FormulaBox>
          <div>Circumference = π &times; diameter</div>
          <div className="mt-2 text-base">or C = 2 &times; π &times; radius</div>
        </FormulaBox>
        <p className="text-ink-700">
          Both say the same thing, because the diameter is two radii. Use whichever matches the
          number you were given.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(3)}>And the inside?</PrimaryButton>
        </div>
      </Step>

      <Step n={3} title="Covering the inside" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">
          Circumference is a <em>distance</em> — a piece of string. Area is a{" "}
          <em>covering</em> — the cheese on the pizza. Different questions, different formulas,
          different units.
        </p>
        <FigRow>
          <CircleFig r={5} unit="cm" show={[]} ring caption="C — a length, in cm" px={54} />
          <CircleFig r={5} unit="cm" show={["radius"]} fill caption="A — a covering, in cm^2" px={54} />
        </FigRow>
        <FormulaBox>
          <MathText text="A = π * r^2" />
        </FormulaBox>
        <div className="mt-3 space-y-2">
          {[
            ["Circumference", "2πr", "cm — string round the edge"],
            ["Area", "πr²", "cm² — squares filling the inside"],
          ].map(([a, b, c]) => (
            <div key={a} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-bold text-ink-900">{a}</span>
              <span className="text-sm font-bold text-brand-700">{b}</span>
              <span className="text-sm text-ink-500">{c}</span>
            </div>
          ))}
        </div>
        <KeyIdea>
          The squared radius is why area carries a squared unit. If a question asks how far round
          and your answer has cm<MathText text="^2" /> on it, you used the wrong formula.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(4)}>The costly slip</PrimaryButton>
        </div>
      </Step>

      <Step n={4} title="A pizza is 10 cm across" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <p className="text-ink-700">
          <strong>10 cm across</strong> is the diameter. Which is the area?
        </p>
        <div className="mt-3">
          <CircleFig r={5} unit="cm" show={["diameter"]} fill px={58} />
        </div>
        <div className="mt-4 grid gap-2">
          {[
            { k: "100", label: "π × 10² = 100π cm²" },
            { k: "25", label: "25π cm²" },
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
              <MathText text="A = π * 10^2 = 100π" />
            </WrongBox>
            <p className="text-ink-700">
              The formula was copied perfectly. The trouble is that{" "}
              <MathText text="r" /> means <strong>radius</strong>, and 10 cm was the distance all
              the way across. The radius is only <strong>5 cm</strong>.
            </p>
            <div className="mt-3 rounded-2xl bg-paper p-4">
              <ol className="space-y-2">
                {[
                  ["Halve the diameter to get the radius", "10 ÷ 2 = 5 cm"],
                  ["Square the radius", "5^2 = 25"],
                  ["Multiply by π", "25π cm^2"],
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
              Using the diameter by mistake makes an area <strong>four times too big</strong> —
              because the radius got doubled and then squared. Write down &ldquo;r = &rdquo; before
              you touch the formula, every single time.
            </KeyIdea>
            <div className="mt-4">
              <PrimaryButton onClick={() => go(5)}>Put numbers on it</PrimaryButton>
            </div>
          </div>
        )}
      </Step>

      <Step n={5} title="A worked example" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">
          A circular table has a radius of <strong>5 cm</strong> on a plan. Find the distance round
          it and the area of the top. Use <strong>π ≈ 3.14</strong>.
        </p>
        <div className="mt-3">
          <CircleFig r={5} unit="cm" show={["radius"]} fill />
        </div>
        <div className="mt-3 rounded-2xl bg-paper p-4">
          <ol className="space-y-2">
            {[
              ["Round the edge: C = 2πr", "2 * 3.14 * 5 = 31.4 cm"],
              ["Inside: square the radius first", "5^2 = 25"],
              ["Then multiply by π", "3.14 * 25 = 78.5 cm^2"],
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
          The circle sits inside a 10 cm by 10 cm square, which holds 100 cm². The circle must be a
          bit less, and 78.5 cm² is. A 314 cm² answer would not have fitted in the square at all.
        </EstimateCheck>
        <p className="mt-3 text-ink-700">
          You will also be asked for <em>exact</em> answers. Then just stop before multiplying: the
          circumference is <strong>10π cm</strong> and the area is <strong>25π cm²</strong>, with no
          rounding anywhere.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(6)}>Backwards</PrimaryButton>
        </div>
      </Step>

      <Step n={6} title="Reading a question carefully" open={step === 6} onOpen={() => go(6)} done={step > 6}>
        <p className="text-ink-700">
          Questions rarely hand you the radius. Watch for the words:
        </p>
        <div className="mt-3 space-y-2">
          {[
            ["“radius of 6 cm”", "r = 6", "use it as it is"],
            ["“diameter of 6 cm”", "r = 3", "halve it first"],
            ["“6 cm across”", "r = 3", "across means diameter"],
            ["“a 6 cm wide plate”", "r = 3", "wide means diameter"],
          ].map(([a, b, c]) => (
            <div key={a} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-semibold text-ink-900">{a}</span>
              <span className="text-sm font-bold text-brand-700">{b}</span>
              <span className="text-sm text-ink-500">{c}</span>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(7)}>Your turn</PrimaryButton>
        </div>
      </Step>

      <Step n={7} title="You try one" open={step === 7} onOpen={() => go(7)} done={false}>
        <p className="text-ink-700">
          A bicycle wheel has a <strong>diameter of 20 cm</strong>. How far does it roll in one
          complete turn? Use <strong>π ≈ 3.14</strong>.
        </p>
        <div className="mt-3">
          <CircleFig r={10} unit="cm" show={["diameter"]} ring px={58} />
        </div>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          One turn lays out exactly one circumference on the ground, and you were given the
          diameter — so use <MathText text="C = π * d" />.
        </div>
        <TryIt
          prompt={<>2. Work out 3.14 × 20. How far does it roll, in cm?</>}
          accept={["62.8"]}
          placeholder="like 31.4"
          value={fade}
          setValue={setFade}
          hint="multiply 3.14 by the diameter, 20 — no halving needed for the circumference."
          explain={
            <>
              <MathText text="3.14 * 20 = 62.8" />, so the wheel rolls <strong>62.8 cm</strong>. A
              length, so the unit is cm and not cm<MathText text="^2" />. Sensible too: a bit more
              than 3 diameters.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Circles</div>
          <div className="mt-2">1. Write down r first — halve the diameter if needed</div>
          <div className="mt-1">2. Round the edge: C = 2πr, answer in cm</div>
          <div className="mt-1">3. Inside: A = πr², answer in cm²</div>
          <div className="mt-1">4. Square the radius before multiplying by π</div>
        </div>
        <KeyIdea>
          💡 Radius or diameter? Length or covering? Answer those two questions before writing
          anything and circle problems stop being risky.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
