"use client";

import { useState } from "react";
import { Step, KeyIdea, FormulaBox, WrongBox } from "@/components/lesson/Step";
import { LessonShell, EstimateCheck, TryIt } from "@/components/lesson/LessonShell";
import { PrimaryButton } from "@/components/ui";
import { MathText } from "@/components/MathText";
import { LabelledRect, TriangleFig, FigRow } from "./GeoModels";

/**
 * Perimeter and area.
 *
 * Two misconceptions, and the second is the one that lasts. First, the two
 * measurements get swapped, because both are "how big is this rectangle?".
 * Second — and almost nobody is taught this — children assume the same
 * perimeter must mean the same area. Showing three rectangles with a 22 cm
 * fence holding 24, 28 and 30 squares of grass settles it in one picture.
 */
export function PerimeterAreaLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [guess, setGuess] = useState<string | null>(null);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 4 · Geometry · Perimeter and Area"
      title="Around the edge, or inside?"
      minutes={6}
      step={step}
      total={7}
    >
      <Step n={1} title="A fence and some grass" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          You are making a garden. It is <strong>8 m</strong> long and <strong>3 m</strong> wide.
        </p>
        <div className="mt-3">
          <LabelledRect w={8} h={3} unit="m" />
        </div>
        <p className="mt-3 text-ink-700">Two jobs, and they are not the same job:</p>
        <div className="mt-2 space-y-2">
          <div className="rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
            🪵 A fence has to go <strong>all the way round</strong> the edge. How many metres of fence?
          </div>
          <div className="rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
            🌱 Grass has to <strong>cover the whole inside</strong>. How many square metres of grass?
          </div>
        </div>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(2)}>Which one is which?</PrimaryButton>
        </div>
      </Step>

      <Step n={2} title="The mistake almost everyone makes" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <p className="text-ink-700">Here is a very common way to work out the fence:</p>
        <WrongBox>fence = 8 &times; 3 = 24 m</WrongBox>
        <p className="text-ink-700">
          Let&rsquo;s test that method by actually walking the edge. Start at one corner and go all
          the way round, counting.
        </p>
        <div className="mt-3">
          <LabelledRect w={8} h={3} unit="m" mode="perimeter" caption="8 + 3 + 8 + 3" />
        </div>
        <p className="mt-3 text-center text-lg font-bold text-ok-600">
          The walk is 22 m, not 24 m.
        </p>
        <p className="mt-3 text-ink-700">
          So <strong>8 &times; 3</strong> answered a different question. Let&rsquo;s find out which
          one.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(3)}>Show me</PrimaryButton>
        </div>
      </Step>

      <Step n={3} title="8 × 3 counts the squares inside" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">
          Cut the garden into <strong>1 m by 1 m</strong> squares of turf. Now count them.
        </p>
        <div className="mt-3">
          <LabelledRect w={8} h={3} unit="m" mode="area" tile caption="3 rows of 8 squares" />
        </div>
        <p className="mt-3 text-ink-700">
          3 rows, 8 in each row. <MathText text="3 * 8 = 24" /> squares of turf. That is what{" "}
          <strong>8 &times; 3</strong> was telling you all along — the grass, not the fence.
        </p>
        <KeyIdea>
          <strong>Perimeter</strong> is the distance round the edge, so you <em>add</em> the sides.
          <br />
          <strong>Area</strong> is the covering inside, so you <em>multiply</em> the sides.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(4)}>How do I never mix them up?</PrimaryButton>
        </div>
      </Step>

      <Step n={4} title="The unit tells you which one" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <p className="text-ink-700">
          Fence comes on a roll, measured in <strong>metres</strong>. Turf comes in squares,
          measured in <strong>square metres</strong>. The unit is a label you can check your answer
          against.
        </p>
        <div className="mt-3 space-y-2">
          {[
            ["Perimeter", "a length — you could walk it", "m, cm, km"],
            ["Area", "a covering — squares that tile it", "m², cm², km²"],
          ].map(([a, b, c]) => (
            <div key={a} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-bold text-ink-900">{a}</span>
              <span className="text-sm text-ink-700">{b}</span>
              <span className="text-sm font-semibold text-brand-700">{c}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-ink-700">
          The little <MathText text="^2" /> means &ldquo;squares&rdquo;. If your answer counts
          squares, it needs it. If your answer is a walk, it must not have it.
        </p>
        <FormulaBox>
          <div>Perimeter = 2 &times; (length + width)</div>
          <div className="mt-2">Area = length &times; width</div>
        </FormulaBox>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(5)}>There&rsquo;s a trap here</PrimaryButton>
        </div>
      </Step>

      <Step n={5} title="Same fence, different garden" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">
          Suppose you already own <strong>22 m</strong> of fence. Does that decide how much grass
          you need?
        </p>
        <div className="mt-3 grid gap-2">
          {[
            { k: "a", label: "Yes — same fence, so the same amount of grass" },
            { k: "b", label: "No — the grass could be different" },
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
            <p className="mt-4 text-ink-700">
              Here are three gardens. Every one of them takes exactly 22 m of fence.
            </p>
            <FigRow>
              <LabelledRect w={8} h={3} unit="m" mode="area" tile maxPx={110} caption="8 by 3 — 24 m²" />
              <LabelledRect w={7} h={4} unit="m" mode="area" tile maxPx={110} caption="7 by 4 — 28 m²" />
              <LabelledRect w={6} h={5} unit="m" mode="area" tile maxPx={110} caption="6 by 5 — 30 m²" />
            </FigRow>
            <p className="mt-4 text-center text-lg font-bold text-ok-600">
              Same fence. 24, 28 and 30 m² of grass.
            </p>
            <KeyIdea>
              Perimeter does <strong>not</strong> decide area. The nearer a rectangle gets to a
              square, the more it holds — which is why fields and rooms are usually squarish.
            </KeyIdea>
            <div className="mt-4">
              <PrimaryButton onClick={() => go(6)}>Work one through</PrimaryButton>
            </div>
          </div>
        )}
      </Step>

      <Step n={6} title="A worked example" open={step === 6} onOpen={() => go(6)} done={step > 6}>
        <p className="text-ink-700">
          A rug is <strong>9 cm</strong> by <strong>4 cm</strong> on a plan. Find both measurements.
        </p>
        <div className="mt-3">
          <LabelledRect w={9} h={4} unit="cm" mode="area" tile />
        </div>
        <div className="mt-4 rounded-2xl bg-paper p-4">
          <ol className="space-y-2">
            {[
              ["Perimeter: add a length and a width", "9 + 4 = 13"],
              ["Then double it — there are two of each", "2 * 13 = 26 cm"],
              ["Area: multiply the two sides", "9 * 4 = 36 cm^2"],
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
          Area is nearly always the bigger number, and it always carries the{" "}
          <MathText text="^2" />. 26 cm of edging, 36 cm<MathText text="^2" /> of rug.
        </EstimateCheck>
        <p className="mt-4 text-ink-700">
          Triangles work the same way, once you notice a triangle is exactly half of the rectangle
          around it:
        </p>
        <div className="mt-2">
          <TriangleFig base={10} height={6} unit="cm" ghostRect caption="half of 10 * 6 = 30 cm^2" />
        </div>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(7)}>Your turn</PrimaryButton>
        </div>
      </Step>

      <Step n={7} title="You try one" open={step === 7} onOpen={() => go(7)} done={false}>
        <p className="text-ink-700">
          A tray is <strong>7 cm</strong> by <strong>5 cm</strong>.
        </p>
        <div className="mt-3">
          <LabelledRect w={7} h={5} unit="cm" mode="area" tile />
        </div>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          The perimeter is <MathText text="2 * (7 + 5) = 24" /> cm — the distance round the rim.
        </div>
        <TryIt
          prompt={<>2. How many square centimetres cover the inside? (the area)</>}
          accept={["35"]}
          placeholder="like 24"
          value={fade}
          setValue={setFade}
          hint="area covers the inside, so multiply the two sides rather than adding them."
          explain={
            <>
              <MathText text="7 * 5 = 35" />, so the area is <strong>35 cm²</strong>. Five rows of
              seven squares. Notice it is a different number from the 24 cm perimeter — and it wears
              the little <MathText text="^2" />.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Perimeter and area</div>
          <div className="mt-2">1. Round the edge? Add the sides. Answer in cm</div>
          <div className="mt-1">2. Covering the inside? Multiply. Answer in cm²</div>
          <div className="mt-1">3. Triangle: half of base &times; height</div>
          <div className="mt-1">4. Same perimeter does not mean the same area</div>
        </div>
        <KeyIdea>
          💡 Ask yourself what you are buying. Fence by the metre, or turf by the square metre? The
          unit picks the method for you.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
