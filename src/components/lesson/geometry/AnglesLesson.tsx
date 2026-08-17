"use client";

import { useState } from "react";
import { Step, KeyIdea, FormulaBox, WrongBox } from "@/components/lesson/Step";
import { LessonShell, TryIt } from "@/components/lesson/LessonShell";
import { PrimaryButton } from "@/components/ui";
import { MathText } from "@/components/MathText";
import { AngleFig, Protractor, FigRow } from "./GeoModels";

/**
 * Angles.
 *
 * Two misconceptions, both about what an angle *is*. Children read the length
 * of the drawn arms as the size of the angle, and they read whichever number
 * on the protractor is nearest the ray. Both dissolve once an angle is
 * understood as an amount of turn: turn has nothing to do with how far you
 * draw the line, and the scale you read must be the one that starts at zero
 * on your own arm.
 */
export function AnglesLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [guess, setGuess] = useState<string | null>(null);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 5 · Geometry · Angles"
      title="An angle measures a turn"
      minutes={6}
      step={step}
      total={7}
    >
      <Step n={1} title="Opening a door" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          Push a door open a little, and it turns a little. Push it wide, and it turns a lot. That
          amount of turn is the <strong>angle</strong>.
        </p>
        <FigRow>
          <AngleFig deg={30} arm={64} caption="barely open" />
          <AngleFig deg={90} arm={64} caption="a quarter turn" />
          <AngleFig deg={140} arm={64} caption="nearly flat" />
        </FigRow>
        <p className="mt-4 text-ink-700">
          A full turn all the way round is <strong>360°</strong>. Half a turn is 180°, a quarter
          turn is 90° — the square corner you see everywhere.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(2)}>Try a question</PrimaryButton>
        </div>
      </Step>

      <Step n={2} title="Which angle is bigger?" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <FigRow>
          <AngleFig deg={40} arm={38} showLabel={false} caption="A" />
          <AngleFig deg={40} arm={96} showLabel={false} caption="B" />
        </FigRow>
        <div className="mt-4 grid gap-2">
          {[
            { k: "b", label: "B — the lines are much longer" },
            { k: "same", label: "They are the same" },
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
            Let&rsquo;s put the measurements on and look again.
            <div className="mt-3">
              <PrimaryButton onClick={() => go(3)}>Show me</PrimaryButton>
            </div>
          </div>
        )}
      </Step>

      <Step n={3} title="The mistake almost everyone makes" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <WrongBox>&ldquo;Longer lines mean a bigger angle&rdquo;</WrongBox>
        <FigRow>
          <AngleFig deg={40} arm={38} caption="A" />
          <AngleFig deg={40} arm={96} caption="B" />
        </FigRow>
        <p className="mt-4 text-ink-700">
          Both are <strong>40°</strong>. The instinct is understandable — B takes up far more of the
          page. But the arms of an angle are like the door: you could keep drawing them across the
          room and the door would still be open the same amount.
        </p>
        <KeyIdea>
          An angle measures <strong>turn</strong>, not length. Rubbing out part of an arm, or
          extending it, changes nothing at all.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(4)}>So how do I measure one?</PrimaryButton>
        </div>
      </Step>

      <Step n={4} title="The protractor has two scales" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <p className="text-ink-700">
          A protractor carries two rings of numbers going opposite ways, so it works whichever
          direction your angle opens. Here is one angle, and the two numbers sitting on the same
          ray:
        </p>
        <div className="mt-3">
          <Protractor angle={40} caption="the same ray, two readings" />
        </div>
        <WrongBox>this angle is 140°</WrongBox>
        <p className="text-ink-700">
          Test that reading against what you can see. 140° is more than a square corner — nearly a
          straight line. This angle is clearly much sharper than a square corner, so 140° cannot be
          right.
        </p>
        <div className="mt-3 rounded-2xl bg-paper p-4 text-sm text-ink-700">
          <strong className="text-ink-900">The fix, every time:</strong> find the arm lying along
          the flat edge. Follow it out to the number ring — it sits on a <strong>0</strong>. Use
          the ring that starts at that 0, and count round to the other arm. Here the flat arm is on
          the orange 0, so the answer is the orange number: <strong>40°</strong>.
        </div>
        <KeyIdea>
          Rough check first: is it sharper than a square corner (under 90°) or wider (over 90°)?
          That alone tells you which of the two numbers to keep.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(5)}>Angles that fit together</PrimaryButton>
        </div>
      </Step>

      <Step n={5} title="Angles that share a point" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">
          Because angles are turns, angles meeting at the same point simply add up.
        </p>
        <div className="mt-3 space-y-2">
          {[
            ["On a straight line", "180°", "half a turn"],
            ["All the way round a point", "360°", "a full turn"],
            ["The three angles of any triangle", "180°", "always, in every triangle"],
            ["The four angles of any quadrilateral", "360°", "two triangles joined"],
          ].map(([a, b, c]) => (
            <div key={a} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-semibold text-ink-900">{a}</span>
              <span className="text-sm font-bold text-brand-700">{b}</span>
              <span className="text-sm text-ink-500">{c}</span>
            </div>
          ))}
        </div>
        <FormulaBox>a + b + c = 180° in every triangle</FormulaBox>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(6)}>A worked example</PrimaryButton>
        </div>
      </Step>

      <Step n={6} title="A worked example" open={step === 6} onOpen={() => go(6)} done={step > 6}>
        <p className="text-ink-700">
          Two angles of a triangle are <strong>65°</strong> and <strong>80°</strong>. Find the
          third.
        </p>
        <div className="mt-3 rounded-2xl bg-paper p-4">
          <ol className="space-y-2">
            {[
              ["Add what you know", "65° + 80° = 145°"],
              ["The three must total 180°", "180° − 145° = 35°"],
              ["Check by adding all three", "65 + 80 + 35 = 180 ✓"],
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
        <div className="mt-3">
          <AngleFig deg={35} arm={78} caption="35° — sharper than a square corner, as expected" />
        </div>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(7)}>Your turn</PrimaryButton>
        </div>
      </Step>

      <Step n={7} title="You try one" open={step === 7} onOpen={() => go(7)} done={false}>
        <p className="text-ink-700">
          A triangle has angles of <strong>55°</strong> and <strong>40°</strong>. What is the third
          angle?
        </p>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          The two you know add to <strong>95°</strong>.
        </div>
        <TryIt
          prompt={<>2. How many degrees are left out of 180°?</>}
          accept={["85", "85°"]}
          placeholder="like 35"
          value={fade}
          setValue={setFade}
          hint="take the 95° away from the 180° that every triangle has."
          explain={
            <>
              180° − 95° = <strong>85°</strong>. It is a bit under a square corner, which fits a
              triangle whose other angles were both fairly small.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Angles</div>
          <div className="mt-2">1. An angle is a turn — arm length means nothing</div>
          <div className="mt-1">2. Read the protractor scale that starts at 0 on your arm</div>
          <div className="mt-1">3. Under 90° or over 90°? Check before you write it</div>
          <div className="mt-1">4. Line 180°, point 360°, triangle 180°</div>
        </div>
        <KeyIdea>
          💡 Every angle question can be sanity-checked against a square corner. If your number
          says wide and the picture looks sharp, you read the wrong ring.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
