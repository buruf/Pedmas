"use client";

import { useState } from "react";
import { Step, KeyIdea, FormulaBox, WrongBox } from "@/components/lesson/Step";
import { LessonShell, EstimateCheck, TryIt } from "@/components/lesson/LessonShell";
import { PrimaryButton } from "@/components/ui";
import { MathText } from "@/components/MathText";
import { TileBar, RulerFig, GEO_COLOURS } from "./GeoModels";

/**
 * Converting between metric units.
 *
 * The misconception is mechanical and very common: the conversion number is
 * known, so it gets multiplied by, whichever direction the conversion goes.
 * The cure is not a rule but a size check done first — going to a bigger unit
 * must give a smaller number, and 500 cm turning into 50 000 m is a ribbon
 * fifty kilometres long.
 */
export function UnitConversionLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [guess, setGuess] = useState<string | null>(null);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 5 · Measurement · Unit Conversion"
      title="Bigger unit, smaller number"
      minutes={6}
      step={step}
      total={6}
    >
      <Step n={1} title="Three metres of ribbon" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          You have <strong>3 m</strong> of ribbon and the instructions are written in centimetres.
          How many centimetres is that?
        </p>
        <p className="mt-3 text-ink-700">
          One metre is 100 centimetres, so three metres is three lots of 100.
        </p>
        <div className="my-3 rounded-xl bg-ink-900 px-4 py-4 text-center text-2xl font-bold text-white">
          3 m = 300 cm
        </div>
        <KeyIdea>
          Nothing was cut. The ribbon is the same length — it is just being counted in smaller
          pieces, so the number is bigger.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(2)}>Now the other way</PrimaryButton>
        </div>
      </Step>

      <Step n={2} title="Going backwards" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <p className="text-ink-700">
          A different roll measures <strong>500 cm</strong>. How many metres is that?
        </p>
        <div className="mt-4 grid gap-2">
          {[
            { k: "mul", label: "500 × 100 = 50 000 m" },
            { k: "div", label: "500 ÷ 100 = 5 m" },
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
            Let&rsquo;s check the size of each answer before deciding.
            <div className="mt-3">
              <PrimaryButton onClick={() => go(3)}>Check them</PrimaryButton>
            </div>
          </div>
        )}
      </Step>

      <Step n={3} title="The mistake almost everyone makes" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <WrongBox>500 cm = 500 &times; 100 = 50 000 m</WrongBox>
        <p className="text-ink-700">
          The 100 is right, and multiplying worked last time, so it is a very natural move. Now test
          it against something you can picture: 50 000 m is <strong>50 kilometres</strong> of
          ribbon. That is an hour&rsquo;s drive.
        </p>
        <p className="mt-3 text-ink-700">
          500 cm is about the length of a car. A car is not 50 km long, so the method has failed —
          and it failed by going the wrong way.
        </p>
        <div className="mt-4 rounded-2xl bg-paper p-4">
          <div className="text-center text-sm font-semibold text-ink-700">
            Decide the direction <em>before</em> the arithmetic
          </div>
          <div className="mt-3 space-y-2">
            <div className="rounded-xl bg-white px-3 py-2 text-sm">
              <span className="font-bold text-ink-900">m &rarr; cm</span>{" "}
              <span className="text-ink-700">
                — going to a <strong>smaller</strong> unit, so you need <strong>more</strong> of
                them. The number grows: <strong>multiply</strong>.
              </span>
            </div>
            <div className="rounded-xl bg-white px-3 py-2 text-sm">
              <span className="font-bold text-ink-900">cm &rarr; m</span>{" "}
              <span className="text-ink-700">
                — going to a <strong>bigger</strong> unit, so you need <strong>fewer</strong> of
                them. The number shrinks: <strong>divide</strong>.
              </span>
            </div>
          </div>
        </div>
        <p className="mt-3 text-center text-lg font-bold text-ok-600">500 cm = 5 m</p>
        <KeyIdea>
          Bigger unit &rarr; smaller number. Smaller unit &rarr; bigger number. Say which one it is
          out loud, then the &times; or ÷ chooses itself.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(4)}>The numbers to know</PrimaryButton>
        </div>
      </Step>

      <Step n={4} title="Five facts cover almost everything" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <div className="mt-2 space-y-2">
          {[
            ["1 cm", "10 mm", "length"],
            ["1 m", "100 cm", "length"],
            ["1 km", "1000 m", "length"],
            ["1 kg", "1000 g", "mass"],
            ["1 L", "1000 mL", "capacity"],
          ].map(([a, b, c]) => (
            <div key={a} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-bold text-ink-900">{a}</span>
              <span className="text-sm font-bold text-brand-700">= {b}</span>
              <span className="text-sm text-ink-500">{c}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-ink-700">
          The prefixes repeat, which is why the metric system is worth the effort:{" "}
          <strong>kilo</strong> means a thousand of them, <strong>centi</strong> means a hundredth
          of one, <strong>milli</strong> means a thousandth.
        </p>
        <FormulaBox>
          <div className="text-base">to a smaller unit: &times;</div>
          <div className="mt-1 text-base">to a bigger unit: ÷</div>
        </FormulaBox>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(5)}>Worked examples</PrimaryButton>
        </div>
      </Step>

      <Step n={5} title="Two worked examples" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <div className="rounded-2xl bg-paper p-4">
          <div className="text-sm font-bold text-ink-900">7 km = ___ m</div>
          <ol className="mt-2 space-y-2">
            {[
              ["m is smaller than km, so the number grows", "multiply"],
              ["1 km = 1000 m", "7 * 1000"],
              ["Answer", "7000 m"],
            ].map(([a, b], i) => (
              <li key={i} className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 text-sm">
                <span className="text-ink-700">
                  <span className="mr-2 font-bold text-brand-600">{i + 1}.</span>
                  {a}
                </span>
                <span className="font-bold text-ink-900">
                  <MathText text={b} />
                </span>
              </li>
            ))}
          </ol>
        </div>
        <div className="mt-3 rounded-2xl bg-paper p-4">
          <div className="text-sm font-bold text-ink-900">8000 mL = ___ L</div>
          <ol className="mt-2 space-y-2">
            {[
              ["L is bigger than mL, so the number shrinks", "divide"],
              ["1 L = 1000 mL", "8000 ÷ 1000"],
              ["Answer", "8 L"],
            ].map(([a, b], i) => (
              <li key={i} className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 text-sm">
                <span className="text-ink-700">
                  <span className="mr-2 font-bold text-brand-600">{i + 1}.</span>
                  {a}
                </span>
                <span className="font-bold text-ink-900">
                  <MathText text={b} />
                </span>
              </li>
            ))}
          </ol>
        </div>
        <EstimateCheck>
          8000 mL is eight big bottles of water. &ldquo;8 L&rdquo; matches that picture;
          &ldquo;8 000 000 L&rdquo; would fill a swimming pool.
        </EstimateCheck>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(6)}>Your turn</PrimaryButton>
        </div>
      </Step>

      <Step n={6} title="You try one" open={step === 6} onOpen={() => go(6)} done={false}>
        <p className="text-ink-700">
          A rope is <strong>600 cm</strong> long. How many metres is that?
        </p>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          Metres are <strong>bigger</strong> than centimetres, so the number must come out{" "}
          <strong>smaller</strong> than 600 — which means dividing by 100.
        </div>
        <TryIt
          prompt={<>2. Work out 600 ÷ 100. How many metres is the rope?</>}
          accept={["6"]}
          placeholder="a number"
          value={fade}
          setValue={setFade}
          hint="how many lots of 100 cm are there in 600 cm?"
          explain={
            <>
              <MathText text="600 ÷ 100 = 6" />, so the rope is <strong>6 m</strong>. Sensible: 6 m
              is about the length of a small car, and 600 cm is the same thing counted in
              centimetres.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Converting units</div>
          <div className="mt-2">1. Which unit is bigger? Answer that first</div>
          <div className="mt-1">2. To a smaller unit &rarr; bigger number &rarr; multiply</div>
          <div className="mt-1">3. To a bigger unit &rarr; smaller number &rarr; divide</div>
          <div className="mt-1">4. Picture the answer. Does that size exist?</div>
        </div>
        <KeyIdea>
          💡 The amount never changes when you convert — only the unit you are counting in. If your
          answer describes a different object entirely, you went the wrong way.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}

/**
 * Choosing and reading measuring units.
 *
 * Two ideas that carry all the way up to unit conversion. First, a bigger
 * number does not mean a longer object when the units differ — the desk did
 * not grow when you swapped pencils for paper clips. Second, a ruler measures
 * a difference, not a position, so an object starting at the 3 mark is not
 * 11 cm long just because it ends there.
 */
export function MeasureUnitsLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [guess, setGuess] = useState<string | null>(null);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 2 · Measurement · Measuring"
      title="What are you counting in?"
      minutes={5}
      step={step}
      total={6}
    >
      <Step n={1} title="Measuring the same desk twice" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          Before rulers, people measured with whatever was handy. Lay paper clips end to end along a
          desk, then do it again with pencils.
        </p>
        <div className="mt-3 space-y-3">
          <TileBar units={12} unitName="paper clips" colour={GEO_COLOURS.teal} />
          <TileBar units={4} unitName="pencils" colour={GEO_COLOURS.amber} />
        </div>
        <p className="mt-3 text-ink-700">
          Same desk, measured twice. One answer is 12, the other is 4.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(2)}>Which is longer?</PrimaryButton>
        </div>
      </Step>

      <Step n={2} title="Did the desk change?" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <p className="text-ink-700">
          A friend measures her desk and gets <strong>5 pencils</strong>. Yours came to{" "}
          <strong>12 paper clips</strong>. Whose desk is longer?
        </p>
        <div className="mt-4 grid gap-2">
          {[
            { k: "y", label: "Mine — 12 is bigger than 5" },
            { k: "n", label: "You cannot tell from those numbers" },
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
            Look back at your own desk — it gave two different numbers on its own.
            <div className="mt-3">
              <PrimaryButton onClick={() => go(3)}>Show me</PrimaryButton>
            </div>
          </div>
        )}
      </Step>

      <Step n={3} title="The mistake almost everyone makes" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <WrongBox>the bigger number means the longer desk</WrongBox>
        <p className="text-ink-700">
          Your single desk measured 12 with clips and 4 with pencils. Nothing was sawn off in
          between — so a number on its own says nothing until you know{" "}
          <strong>what it is counting</strong>.
        </p>
        <div className="mt-3 space-y-3">
          <TileBar units={12} unitName="paper clips" colour={GEO_COLOURS.teal} />
          <TileBar units={4} unitName="pencils" colour={GEO_COLOURS.amber} />
        </div>
        <KeyIdea>
          The <strong>smaller</strong> the unit, the <strong>more</strong> of them it takes. Small
          unit, big number. Big unit, small number.
        </KeyIdea>
        <p className="mt-3 text-ink-700">
          This is exactly why the world agreed on standard units. &ldquo;4 pencils&rdquo; depends on
          whose pencil; <strong>60 cm</strong> means the same thing in every classroom on earth.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(4)}>Using a real ruler</PrimaryButton>
        </div>
      </Step>

      <Step n={4} title="A ruler measures a gap, not a spot" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <p className="text-ink-700">Here is a pencil that was not lined up with the 0 mark.</p>
        <div className="mt-3">
          <RulerFig start={3} end={11} caption="it ends at 11 — but how long is it?" />
        </div>
        <WrongBox>the pencil is 11 cm long</WrongBox>
        <p className="text-ink-700">
          Reading the end mark works fine when you start at 0, because you are secretly doing{" "}
          <MathText text="11 - 0" />. Here the pencil only occupies the ruler from 3 to 11, so it
          never used the first 3 cm.
        </p>
        <div className="mt-3 rounded-2xl bg-paper p-4">
          <ol className="space-y-2">
            {[
              ["Where it ends", "11"],
              ["Where it starts", "3"],
              ["Length is the gap between them", "11 − 3 = 8 cm"],
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
        <KeyIdea>
          Length is always <strong>end − start</strong>. Lining up with 0 is just a way of making
          the subtraction easy.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(5)}>Choosing the unit</PrimaryButton>
        </div>
      </Step>

      <Step n={5} title="Picking a sensible unit" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">
          Any unit would work, but a good one keeps the number easy to say. Nobody gives their
          height in millimetres.
        </p>
        <div className="mt-3 space-y-2">
          {[
            ["mm", "a fingernail, the thickness of a coin"],
            ["cm", "a pencil, a shoe, a spoon"],
            ["m", "a bed, a car, a classroom"],
            ["km", "the distance to the next town"],
            ["g / kg", "an apple / a person"],
            ["mL / L", "a spoon of medicine / a bucket"],
          ].map(([a, b]) => (
            <div key={a} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-bold text-ink-900">{a}</span>
              <span className="text-sm text-ink-700">{b}</span>
            </div>
          ))}
        </div>
        <EstimateCheck>
          Compare against something you know. A door is about 2 m tall, so a wall 3 m tall is
          believable — but 3 cm or 3 km is not.
        </EstimateCheck>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(6)}>Your turn</PrimaryButton>
        </div>
      </Step>

      <Step n={6} title="You try one" open={step === 6} onOpen={() => go(6)} done={false}>
        <p className="text-ink-700">This ribbon also does not start at 0.</p>
        <div className="mt-3">
          <RulerFig start={4} end={13} caption="from the 4 mark to the 13 mark" />
        </div>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          It starts at <strong>4</strong> and ends at <strong>13</strong>, so the length is the gap
          between them.
        </div>
        <TryIt
          prompt={<>2. Work out 13 − 4. How long is the ribbon, in cm?</>}
          accept={["9"]}
          placeholder="a number"
          value={fade}
          setValue={setFade}
          hint="take the starting mark away from the ending mark."
          explain={
            <>
              <MathText text="13 - 4 = 9" />, so the ribbon is <strong>9 cm</strong>. Count the
              spaces it covers on the ruler and there are nine of them — not thirteen.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Measuring</div>
          <div className="mt-2">1. A number means nothing without its unit</div>
          <div className="mt-1">2. Smaller unit &rarr; more of them &rarr; bigger number</div>
          <div className="mt-1">3. Length = end mark − start mark</div>
          <div className="mt-1">4. Choose a unit that keeps the number easy</div>
        </div>
        <KeyIdea>
          💡 Always write the unit next to the number. It is what turns &ldquo;9&rdquo; into
          something anyone else can picture.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
