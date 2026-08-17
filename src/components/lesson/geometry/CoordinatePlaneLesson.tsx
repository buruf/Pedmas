"use client";

import { useState } from "react";
import { Step, KeyIdea, FormulaBox, WrongBox } from "@/components/lesson/Step";
import { LessonShell, TryIt } from "@/components/lesson/LessonShell";
import { PrimaryButton } from "@/components/ui";
import { MathText } from "@/components/MathText";
import { CoordGrid, FigRow, GEO_COLOURS } from "./GeoModels";

/**
 * The coordinate plane.
 *
 * One misconception dominates everything else: (x, y) read in the wrong order.
 * It is not carelessness — nothing in the notation says which number is which,
 * and children have spent years reading left-to-right without an agreed
 * meaning. The cure is to plot (3, 7) and (7, 3) on the same grid and let the
 * two dots argue for themselves.
 */
export function CoordinatePlaneLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 5 · Geometry · Coordinate Plane"
      title="Along the corridor, then up the stairs"
      minutes={6}
      step={step}
      total={6}
    >
      <Step n={1} title="Meeting someone in a big park" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          &ldquo;Meet me by a tree&rdquo; is useless in a park full of trees. But if the park has
          paths in a grid, you can say exactly which corner: <strong>3 paths across</strong>, then{" "}
          <strong>7 paths up</strong>.
        </p>
        <p className="mt-3 text-ink-700">
          Mathematicians write that as <strong>(3, 7)</strong>. Two number lines crossed at zero: the
          flat one is the <MathText text="x" />-axis, the upright one the <MathText text="y" />-axis,
          and the crossing point is called the origin.
        </p>
        <div className="mt-3">
          <CoordGrid xMin={0} xMax={9} yMin={0} yMax={9} points={[{ x: 3, y: 7, label: "(3, 7)" }]} />
        </div>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(2)}>Why the order matters</PrimaryButton>
        </div>
      </Step>

      <Step n={2} title="The mistake almost everyone makes" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <WrongBox>(3, 7) — go up 3, then across 7</WrongBox>
        <p className="text-ink-700">
          Perfectly reasonable: nothing in the brackets announces which number is which. But look at
          where the two readings put you.
        </p>
        <div className="mt-3">
          <CoordGrid
            xMin={0}
            xMax={9}
            yMin={0}
            yMax={9}
            points={[
              { x: 3, y: 7, label: "(3, 7)" },
              { x: 7, y: 3, label: "(7, 3)", colour: GEO_COLOURS.red },
            ]}
          />
        </div>
        <p className="mt-3 text-ink-700">
          Two completely different corners of the park. Your friend is waiting at the purple dot and
          you are standing at the red one, both certain you followed the instructions.
        </p>
        <KeyIdea>
          So the world agreed on an order, once and for all: <strong>x first, y second</strong>.
          Across before up, every time.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(3)}>Help me remember</PrimaryButton>
        </div>
      </Step>

      <Step n={3} title="Along the corridor, then up the stairs" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">
          You cannot climb the stairs before you have walked down the corridor. Coordinates work the
          same way — the first number moves you <strong>along</strong>, the second one{" "}
          <strong>up</strong>.
        </p>
        <div className="mt-3 space-y-2">
          {[
            ["x comes before y in the alphabet", "so it comes first in the brackets"],
            ["x runs left–right", "the flat axis, like the corridor"],
            ["y runs down–up", "the upright axis, like the stairs"],
          ].map(([a, b]) => (
            <div key={a} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-semibold text-ink-900">{a}</span>
              <span className="text-sm text-ink-700">{b}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-ink-700">
          Points on the axes follow the same rule. <strong>(5, 0)</strong> is 5 along and no climb,
          so it sits on the <MathText text="x" />-axis. <strong>(0, 5)</strong> never leaves the
          upright axis.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(4)}>What about negatives?</PrimaryButton>
        </div>
      </Step>

      <Step n={4} title="Going backwards and downwards" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <p className="text-ink-700">
          Both axes are number lines, so both continue past zero. A negative{" "}
          <MathText text="x" /> means go left; a negative <MathText text="y" /> means go down. That
          splits the plane into four quadrants.
        </p>
        <div className="mt-3">
          <CoordGrid
            xMin={-6}
            xMax={6}
            yMin={-6}
            yMax={6}
            quadrants
            points={[
              { x: 4, y: 3, label: "(4, 3)" },
              { x: -4, y: 3, label: "(−4, 3)", colour: GEO_COLOURS.teal },
              { x: -4, y: -3, label: "(−4, −3)", colour: GEO_COLOURS.amber },
              { x: 4, y: -3, label: "(4, −3)", colour: GEO_COLOURS.red },
            ]}
          />
        </div>
        <div className="mt-3 space-y-2">
          {[
            ["Quadrant I", "(+, +)", "right and up"],
            ["Quadrant II", "(−, +)", "left and up"],
            ["Quadrant III", "(−, −)", "left and down"],
            ["Quadrant IV", "(+, −)", "right and down"],
          ].map(([a, b, c]) => (
            <div key={a} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-bold text-ink-900">{a}</span>
              <span className="text-sm font-bold text-brand-700">{b}</span>
              <span className="text-sm text-ink-500">{c}</span>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(5)}>Measuring on the grid</PrimaryButton>
        </div>
      </Step>

      <Step n={5} title="Distances and middles" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">
          Once points have addresses, you can measure between them without a ruler.
        </p>
        <FigRow>
          <CoordGrid
            xMin={0}
            xMax={11}
            yMin={0}
            yMax={9}
            size={200}
            points={[
              { x: 2, y: 1, label: "A" },
              { x: 10, y: 7, label: "B" },
            ]}
            segments={[
              { from: [2, 1], to: [10, 1], label: "8 across", colour: GEO_COLOURS.amber },
              { from: [10, 1], to: [10, 7], label: "6 up", colour: GEO_COLOURS.teal },
              { from: [2, 1], to: [10, 7], label: "10", colour: GEO_COLOURS.brand },
            ]}
          />
        </FigRow>
        <div className="mt-3 rounded-2xl bg-paper p-4">
          <ol className="space-y-2">
            {[
              ["Across: subtract the x-numbers", "10 − 2 = 8"],
              ["Up: subtract the y-numbers", "7 − 1 = 6"],
              ["Straight across the diagonal", "8^2 + 6^2 = 100, so 10"],
              ["Midpoint: average each coordinate", "(6, 4)"],
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
        <FormulaBox>
          <div className="text-base">midpoint = ( (x₁+x₂)/2 , (y₁+y₂)/2 )</div>
        </FormulaBox>
        <p className="text-ink-700">
          Halfway between 2 and 10 is 6; halfway between 1 and 7 is 4. Nothing more than finding the
          middle of each number line separately — but the answer is still written x first.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(6)}>Your turn</PrimaryButton>
        </div>
      </Step>

      <Step n={6} title="You try one" open={step === 6} onOpen={() => go(6)} done={false}>
        <p className="text-ink-700">Two points are marked. Look at R.</p>
        <div className="mt-3">
          <CoordGrid
            xMin={0}
            xMax={8}
            yMin={0}
            yMax={8}
            points={[
              { x: 5, y: 1, label: "R" },
              { x: 1, y: 5, label: "S", colour: GEO_COLOURS.teal },
            ]}
          />
        </div>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          R is <strong>5 along</strong> the corridor, so its <MathText text="x" />-coordinate is 5.
        </div>
        <TryIt
          prompt={
            <>
              2. How far <em>up</em> is R? (its <MathText text="y" />-coordinate, the second number)
            </>
          }
          accept={["1"]}
          placeholder="a number"
          value={fade}
          setValue={setFade}
          hint="count the stairs — how many squares above the flat axis does R sit?"
          explain={
            <>
              R is at <strong>(5, 1)</strong>: 5 across and 1 up. S is at <strong>(1, 5)</strong> —
              the same two digits in the other order, and a completely different place on the grid.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Coordinates</div>
          <div className="mt-2">1. (x, y) — along the corridor, then up the stairs</div>
          <div className="mt-1">2. Negative x goes left, negative y goes down</div>
          <div className="mt-1">3. Distance across = subtract the x&rsquo;s; up = subtract the y&rsquo;s</div>
          <div className="mt-1">4. Midpoint = average each coordinate</div>
        </div>
        <KeyIdea>
          💡 If a plotted point looks wrong, check the order before anything else. Swapping x and y
          is the single most common slip on the whole grid.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
