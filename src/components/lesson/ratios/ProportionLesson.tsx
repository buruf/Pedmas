"use client";

import { useState } from "react";
import { MathText } from "@/components/MathText";
import { Step, KeyIdea, FormulaBox, WrongBox } from "@/components/lesson/Step";
import { LessonShell, EstimateCheck, TryIt } from "@/components/lesson/LessonShell";
import { PrimaryButton } from "@/components/ui";

/**
 * Solving proportions.
 *
 * The error is adding across — going from 3 to 9 by "+6" and doing the same to
 * the top. It is not laziness: adding the same amount to both parts is exactly
 * what preserves a difference, and nobody has ever told the child that a
 * proportion preserves a quotient instead. So the lesson makes the two visibly
 * different on a recipe, where a wrong answer can be tasted.
 */
export function ProportionSolveLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [guess, setGuess] = useState<string | null>(null);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 7 · Ratios · Solving Proportions"
      title="Solving a proportion"
      minutes={6}
      step={step}
      total={6}
    >
      <Step n={1} title="Scaling up a recipe" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          A pancake recipe uses <strong>2 eggs to every 3 cups of flour</strong>. You have{" "}
          <strong>9 cups</strong> of flour and want the pancakes to taste the same.
        </p>
        <div className="my-4 text-center text-2xl font-bold text-ink-900">
          <MathText text="{2/3} = {x/9}" />
        </div>
        <p className="text-ink-700">How many eggs?</p>
        <div className="mt-4 grid gap-2">
          {[
            { k: "b", label: "8 — the bottom went up by 6, so the top does too" },
            { k: "a", label: "6" },
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
            Let&rsquo;s make three batches and count.
            <div className="mt-3"><PrimaryButton onClick={() => go(2)}>Show me</PrimaryButton></div>
          </div>
        )}
      </Step>

      <Step n={2} title="The mistake almost everyone makes" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <WrongBox>
          <MathText text="{2/3} = {8/9}" /> &nbsp;&ldquo;3 + 6 = 9, so 2 + 6 = 8&rdquo;
        </WrongBox>
        <p className="text-ink-700">
          The instinct is fair-minded — add the same to both. Test it by making the recipe three
          times over, one batch at a time.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="mx-auto border-collapse text-center">
            <tbody>
              <tr>
                <td className="border border-ink-100 bg-paper px-3 py-2 text-sm font-bold text-ink-900">Flour (cups)</td>
                {[3, 6, 9].map((v) => (
                  <td key={v} className="border border-ink-100 px-5 py-2 text-lg font-bold tabular-nums text-ink-900">
                    {v}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="border border-ink-100 bg-paper px-3 py-2 text-sm font-bold text-ink-900">Eggs</td>
                {[2, 4, 6].map((v) => (
                  <td key={v} className="border border-ink-100 px-5 py-2 text-lg font-bold tabular-nums text-brand-700">
                    {v}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-ink-700">
          Nine cups is three batches, so it takes <strong>6</strong> eggs — not 8. Adding 6 to both
          sides kept the <em>gap</em> at 1, but a recipe does not care about the gap.
        </p>
        <KeyIdea>
          Adding the same number to the top and bottom always drags a fraction closer to 1. Check
          crosswise and it shows: 2 × 9 = 18, but 3 × 8 = 24. Not the same fraction.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(3)}>What should I do instead?</PrimaryButton></div>
      </Step>

      <Step n={3} title="Look for the scale factor" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">
          One side of a proportion is complete — 3 became 9. Find what it was{" "}
          <strong>multiplied</strong> by, then do that to the other side.
        </p>
        <div className="mt-4 rounded-2xl bg-paper p-4">
          <ol className="space-y-2">
            {[
              ["The bottom went from 3 to 9", "9 ÷ 3 = 3"],
              ["So the whole recipe is scaled by 3", "×3"],
              ["Eggs: 2 × 3", "6"],
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
        <p className="mt-3 text-center font-bold text-ok-600">
          <MathText text="{2/3} = {6/9}" />
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(4)}>When the factor is untidy</PrimaryButton></div>
      </Step>

      <Step n={4} title="Cross-multiplying, and why it works" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <p className="text-ink-700">
          Sometimes the scale factor is awkward. Solve <MathText text="{4/6} = {x/15}" /> and you get
          15 ÷ 6 = 2.5, which is fiddly. There is a route that never gets awkward.
        </p>
        <FormulaBox>
          <MathText text="{a/b} = {c/d}" /> &nbsp;→&nbsp; a × d = b × c
        </FormulaBox>
        <p className="text-ink-700">
          It is not a trick. Multiply both sides of the equation by <strong>b</strong> and by{" "}
          <strong>d</strong>: on the left the b cancels and on the right the d cancels, leaving the
          two diagonal products facing each other.
        </p>
        <div className="mt-4 rounded-2xl bg-paper p-4">
          <ol className="space-y-2">
            {[
              ["Cross-multiply", "6 × x = 4 × 15"],
              ["Work out the known side", "6x = 60"],
              ["Divide by 6", "x = 10"],
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
        <EstimateCheck>
          Both fractions should simplify to the same thing.{" "}
          <MathText text="{4/6}" /> is <MathText text="{2/3}" />, and{" "}
          <MathText text="{10/15}" /> is <MathText text="{2/3}" /> too ✓
        </EstimateCheck>
        <div className="mt-4"><PrimaryButton onClick={() => go(5)}>A word problem</PrimaryButton></div>
      </Step>

      <Step n={5} title="The same method in words" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">
          A hiker walks <strong>12 km in 3 hours</strong>. At the same pace, how far in{" "}
          <strong>7 hours</strong>?
        </p>
        <p className="mt-3 text-ink-700">
          Set it up so matching units sit in matching places — km above km, hours below hours.
        </p>
        <div className="my-4 text-center text-2xl font-bold text-ink-900">
          <MathText text="{12/3} = {x/7}" />
        </div>
        <div className="rounded-2xl bg-paper p-4">
          <ol className="space-y-2">
            {[
              ["Cross-multiply", "3 × x = 12 × 7"],
              ["The known side", "3x = 84"],
              ["Divide by 3", "x = 28 km"],
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
          Sensible? The pace is 4 km an hour, and 4 × 7 = 28 ✓ Had you added instead — 3 + 4 = 7, so
          12 + 4 = 16 — the hiker would have slowed down without noticing.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(6)}>Your turn</PrimaryButton></div>
      </Step>

      <Step n={6} title="You try one" open={step === 6} onOpen={() => go(6)} done={false}>
        <p className="text-ink-700">
          Solve <MathText text="{5/6} = {x/24}" />.
        </p>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          Cross-multiply: 6 × x = 5 × 24, so <strong>6x = 120</strong>.
        </div>
        <TryIt
          prompt={<>2. Now divide. What is x?</>}
          accept={["20"]}
          placeholder="a number"
          value={fade}
          setValue={setFade}
          hint="6 times what makes 120? Not 5 + 18 — this is a divide, not an add."
          explain={
            <>
              <strong>x = 20</strong>. Check it: <MathText text="{20/24}" /> divides by 4 to give{" "}
              <MathText text="{5/6}" /> ✓ (Adding across would have given 23, and{" "}
              <MathText text="{23/24}" /> is nearly a whole — much too big.)
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Solving proportions</div>
          <div className="mt-2">1. Matching units in matching places</div>
          <div className="mt-1">2. Cross-multiply: the diagonal products are equal</div>
          <div className="mt-1">3. Divide for x, then check it simplifies back</div>
        </div>
        <KeyIdea>
          💡 A proportion is kept by <strong>multiplying</strong>. The moment you add the same
          number to both parts you have changed the ratio, however fair it felt.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}

/**
 * Scale drawings.
 *
 * Children handle drawing → real life easily, because "each centimetre stands
 * for 5 km" is a story about multiplying. The failure is the return journey:
 * asked for a map length they multiply again, and get a map two metres wide
 * without blinking. So the lesson is built around the reverse direction and a
 * convert-it-back habit.
 */
export function ScaleDrawingLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [guess, setGuess] = useState<string | null>(null);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 7 · Ratios · Scale Drawings"
      title="Reading a scale both ways"
      minutes={6}
      step={step}
      total={6}
    >
      <Step n={1} title="A map with a scale" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          A walking map is printed at <strong>1 cm = 5 km</strong>. Every centimetre of paper stands
          for five kilometres of ground.
        </p>
        <p className="mt-3 text-ink-700">
          A road measures <strong>6 cm</strong> on the map. Six lots of 5 km:
        </p>
        <div className="my-4 rounded-xl bg-ink-900 px-4 py-4 text-center text-2xl font-bold text-white">
          6 × 5 = 30 km
        </div>
        <KeyIdea>
          Going from the drawing out into the real world, you <strong>multiply</strong> — because
          real life is the big one.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(2)}>Now the other way</PrimaryButton></div>
      </Step>

      <Step n={2} title="Going back the other way" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <p className="text-ink-700">
          Same map, <strong>1 cm = 5 km</strong>. A river is really <strong>45 km</strong> long. How
          long should it be drawn on the map?
        </p>
        <div className="mt-4 grid gap-2">
          {[
            { k: "b", label: "225 cm — multiply by the scale, 45 × 5" },
            { k: "a", label: "9 cm" },
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
            One of those maps would not fit on a table.
            <div className="mt-3"><PrimaryButton onClick={() => go(3)}>Show me</PrimaryButton></div>
          </div>
        )}
      </Step>

      <Step n={3} title="The mistake almost everyone makes" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <WrongBox>45 km on the map → 45 × 5 = 225 cm</WrongBox>
        <p className="text-ink-700">
          Two things give it away. First, 225 cm is over two metres of paper for one river. Second —
          and this is the check worth keeping — convert the answer back:
        </p>
        <div className="mt-3 space-y-2">
          {[
            ["If the river were drawn 225 cm long…", "225 × 5 = 1125 km"],
            ["…but the river is really", "45 km"],
          ].map(([a, b]) => (
            <div key={a} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-semibold text-ink-900">{a}</span>
              <span className="text-sm font-bold text-err-600">{b}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-ink-700">
          Coming <em>in</em> from the real world onto the paper, you <strong>divide</strong>:
        </p>
        <div className="my-3 rounded-xl bg-ink-900 px-4 py-4 text-center text-2xl font-bold text-white">
          45 ÷ 5 = 9 cm
        </div>
        <p className="text-center font-bold text-ok-600">Check back: 9 × 5 = 45 km ✓</p>
        <KeyIdea>
          Ask yourself which answer should be the bigger number. Real distances are huge, map
          distances are small — so the map number must come out smaller.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(4)}>Scales written as a ratio</PrimaryButton></div>
      </Step>

      <Step n={4} title="Scales written 1:200" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <p className="text-ink-700">
          A model kit says <strong>1:200</strong>. No units at all — which means both sides are in{" "}
          <em>the same</em> unit. One centimetre of model is 200 centimetres of real thing.
        </p>
        <div className="mt-4 rounded-2xl bg-paper p-4">
          <ol className="space-y-2">
            {[
              ["The model is 6 cm tall", "6 cm"],
              ["Real height, still in cm: 6 × 200", "1200 cm"],
              ["Convert to metres: 1200 ÷ 100", "12 m"],
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
          Do the scaling first and the unit conversion second. Mixing the two together is where
          answers come out a hundred times too big.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(5)}>Finding a scale</PrimaryButton></div>
      </Step>

      <Step n={5} title="Working out the scale yourself" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">
          A boat that is really <strong>24 m</strong> long has been drawn <strong>6 cm</strong> long.
          What scale did the artist use?
        </p>
        <div className="mt-4 rounded-2xl bg-paper p-4">
          <ol className="space-y-2">
            {[
              ["6 cm of paper covers 24 m of boat", "6 cm → 24 m"],
              ["So one centimetre covers 24 ÷ 6", "4 m"],
              ["The scale is", "1 cm = 4 m"],
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
          A scale is just a unit rate — real metres <em>per</em> drawing centimetre. Same idea, new
          clothes.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(6)}>Your turn</PrimaryButton></div>
      </Step>

      <Step n={6} title="You try one" open={step === 6} onOpen={() => go(6)} done={false}>
        <p className="text-ink-700">
          A floor plan uses <strong>1 cm = 3 m</strong>. A room is really <strong>21 m</strong> long.
          How long is it on the plan, in centimetres?
        </p>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          You are going <strong>from real life onto the paper</strong>, so the answer must come out
          smaller than 21.
        </div>
        <TryIt
          prompt={<>2. How many cm on the plan?</>}
          accept={["7", "7cm"]}
          placeholder="a number of cm"
          value={fade}
          setValue={setFade}
          hint="each centimetre of the plan is worth 3 m. How many 3s fit into 21?"
          explain={
            <>
              <strong>7 cm</strong>, because 21 ÷ 3 = 7. Check back the other way: 7 × 3 = 21 m ✓
              (Multiplying would have given 63 cm — a plan wider than the room is long.)
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Scale drawings</div>
          <div className="mt-2">1. Drawing → real life: multiply by the scale</div>
          <div className="mt-1">2. Real life → drawing: divide by the scale</div>
          <div className="mt-1">3. Always convert your answer back to check</div>
        </div>
        <KeyIdea>
          💡 Decide which of the two numbers ought to be bigger before you touch the arithmetic. The
          real thing always wins, so the drawing number is always the small one.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
