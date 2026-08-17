"use client";

import { useState } from "react";
import { Step, KeyIdea, WrongBox } from "@/components/lesson/Step";
import { LessonShell, TryIt } from "@/components/lesson/LessonShell";
import { PrimaryButton } from "@/components/ui";
import { LabelledRect, PolygonFig, DiagonalFoldFig, FigRow, GEO_COLOURS } from "./GeoModels";

/** A parallelogram, optionally with the turn arrow that shows order-2 symmetry. */
function ParallelogramFig({ turn = false, caption }: { turn?: boolean; caption?: string }) {
  const pts = "36,20 132,20 100,84 4,84";
  return (
    <figure className="m-0">
      <svg viewBox="0 0 140 100" width="100%" style={{ maxWidth: 190 }} role="img" aria-label="a parallelogram" className="mx-auto block">
        <polygon points={pts} fill={GEO_COLOURS.brandSoft} stroke={GEO_COLOURS.brand} strokeWidth="2.2" />
        {turn && (
          <>
            <circle cx={68} cy={52} r="3" fill={GEO_COLOURS.amber} />
            <path
              d="M 68 34 A 18 18 0 1 1 52 60"
              fill="none"
              stroke={GEO_COLOURS.amber}
              strokeWidth="2"
            />
            <path d="M 52 60 l -1 -7 l 7 2 Z" fill={GEO_COLOURS.amber} />
          </>
        )}
      </svg>
      {caption && (
        <figcaption className="mt-1 text-center text-sm font-semibold text-ink-700">{caption}</figcaption>
      )}
    </figure>
  );
}

/**
 * Symmetry.
 *
 * The misconception chosen here is the diagonal of a rectangle. It is almost
 * universal and it is reasonable: the diagonal cuts the rectangle into two
 * identical triangles, and for a square the diagonal genuinely is a line of
 * symmetry. Actually folding it — and watching the corner land outside the
 * shape — is the only argument that sticks.
 */
export function SymmetryLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [guess, setGuess] = useState<string | null>(null);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 4 · Geometry · Symmetry"
      title="Where can you fold it?"
      minutes={5}
      step={step}
      total={6}
    >
      <Step n={1} title="Cutting a paper heart" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          Fold a piece of paper in half, cut half a heart along the fold, and open it out. The two
          halves match perfectly, because one was made from the other.
        </p>
        <p className="mt-3 text-ink-700">
          That fold line is a <strong>line of symmetry</strong>: a line you could fold along so the
          two halves land exactly on top of each other.
        </p>
        <div className="mt-3">
          <LabelledRect w={6} h={3} unit="cm" foldLines={["v", "h"]} caption="a rectangle folds two ways" />
        </div>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(2)}>A third fold?</PrimaryButton>
        </div>
      </Step>

      <Step n={2} title="Does the diagonal work too?" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <p className="text-ink-700">
          The diagonal cuts this rectangle into two triangles that are exactly the same size and
          shape. So is the diagonal a line of symmetry?
        </p>
        <div className="mt-3">
          <LabelledRect w={6} h={3} unit="cm" foldLines={["d"]} />
        </div>
        <div className="mt-4 grid gap-2">
          {[
            { k: "y", label: "Yes — both halves are identical triangles" },
            { k: "n", label: "No" },
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
            The only way to settle it is to fold it and watch where the corner lands.
            <div className="mt-3">
              <PrimaryButton onClick={() => go(3)}>Fold it</PrimaryButton>
            </div>
          </div>
        )}
      </Step>

      <Step n={3} title="The mistake almost everyone makes" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <WrongBox>the diagonal of a rectangle is a line of symmetry</WrongBox>
        <p className="text-ink-700">
          Here is the bottom triangle folded up over the diagonal, drawn where it actually lands:
        </p>
        <div className="mt-3">
          <DiagonalFoldFig w={6} h={3} caption="the folded half hangs off the top" />
        </div>
        <p className="mt-3 text-ink-700">
          The two triangles <em>are</em> identical — but identical is not enough. For a fold to
          work, the halves must also be <strong>mirror images facing each other</strong>. Here the
          long side lands on the short side, so the corner overshoots.
        </p>
        <KeyIdea>
          Same size and shape ≠ symmetry. The test is the fold: does every point land exactly on
          top of another point of the shape?
        </KeyIdea>
        <p className="mt-3 text-ink-700">
          One thing makes this error very reasonable: in a <strong>square</strong>, the diagonal{" "}
          <em>is</em> a line of symmetry, because the two sides meeting at the corner are the same
          length. So a square has 4 lines and a longer rectangle has only 2.
        </p>
        <FigRow>
          <PolygonFig sides={4} r={40} symmetryLines caption="a square: 4 lines" />
          <LabelledRect w={6} h={3} unit="cm" foldLines={["v", "h"]} maxPx={110} caption="a rectangle: 2 lines" />
        </FigRow>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(4)}>Counting the lines</PrimaryButton>
        </div>
      </Step>

      <Step n={4} title="Regular shapes are the easy ones" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <p className="text-ink-700">
          When every side and every angle is equal, the shape looks the same from every direction —
          so a regular shape has as many lines of symmetry as it has sides.
        </p>
        <FigRow>
          <PolygonFig sides={3} r={40} symmetryLines caption="3 sides, 3 lines" />
          <PolygonFig sides={4} r={40} symmetryLines caption="4 sides, 4 lines" />
          <PolygonFig sides={6} r={40} symmetryLines caption="6 sides, 6 lines" />
        </FigRow>
        <p className="mt-4 text-ink-700">
          Letters work the same way. <strong>A</strong> and <strong>T</strong> fold down the middle;{" "}
          <strong>H</strong> and <strong>X</strong> fold two ways; <strong>F</strong>,{" "}
          <strong>P</strong> and <strong>R</strong> have no fold at all.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(5)}>Symmetry without folding</PrimaryButton>
        </div>
      </Step>

      <Step n={5} title="Turning instead of folding" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">
          A parallelogram has <strong>no</strong> lines of symmetry — no fold matches its halves.
          But turn it half a turn about its centre and it lands back on itself.
        </p>
        <FigRow>
          <ParallelogramFig caption="no fold works" />
          <ParallelogramFig turn caption="half a turn does" />
        </FigRow>
        <p className="mt-4 text-ink-700">
          That is <strong>rotational symmetry</strong>. The <em>order</em> is how many times a shape
          fits onto itself in one full turn: the parallelogram has order 2, a regular pentagon order
          5, a regular hexagon order 6.
        </p>
        <KeyIdea>
          Lines of symmetry are about <em>flipping</em>; order of rotational symmetry is about{" "}
          <em>turning</em>. A shape can have one without the other.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(6)}>Your turn</PrimaryButton>
        </div>
      </Step>

      <Step n={6} title="You try one" open={step === 6} onOpen={() => go(6)} done={false}>
        <p className="text-ink-700">
          How many lines of symmetry does a <strong>regular pentagon</strong> have?
        </p>
        <div className="mt-3">
          <PolygonFig sides={5} r={48} caption="5 equal sides, 5 equal angles" />
        </div>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          Every side is the same length, so the fold through any corner works.
        </div>
        <TryIt
          prompt={<>2. How many fold lines are there altogether?</>}
          accept={["5"]}
          placeholder="like 4"
          value={fade}
          setValue={setFade}
          hint="a regular shape has one line for each side."
          explain={
            <>
              <strong>5 lines</strong> — one from each corner down to the middle of the opposite
              side. Its rotational symmetry is order 5 as well.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Symmetry</div>
          <div className="mt-2">1. A line of symmetry is a fold where the halves match</div>
          <div className="mt-1">2. Two identical halves are not automatically symmetric</div>
          <div className="mt-1">3. A regular shape with n sides has n lines</div>
          <div className="mt-1">4. Rotational symmetry counts turns, not folds</div>
        </div>
        <KeyIdea>
          💡 When you are unsure, fold it in your head and follow one <em>corner</em>. If that corner
          does not land on another corner, the line is not a line of symmetry.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
