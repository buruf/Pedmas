"use client";

import { useState } from "react";
import { Step, KeyIdea, FormulaBox, WrongBox } from "@/components/lesson/Step";
import { LessonShell, TryIt } from "@/components/lesson/LessonShell";
import { PrimaryButton } from "@/components/ui";
import { MathText } from "@/components/MathText";
import { LabelledRect, PolygonFig, SolidFig, FigRow } from "./GeoModels";

/**
 * Naming and classifying 2D shapes.
 *
 * The misconception is that a shape's name depends on how it is sitting. A
 * square turned 45° becomes "a diamond" and stops being a square; a triangle
 * with its point down stops looking like a triangle. Names come from
 * properties — sides, equal lengths, angles — and properties survive turning.
 */
export function Shapes2dLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [guess, setGuess] = useState<string | null>(null);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 3 · Geometry · 2D Shapes"
      title="What makes a shape that shape?"
      minutes={6}
      step={step}
      total={6}
    >
      <Step n={1} title="Sorting the shape box" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          Tip out a box of plastic shapes and you can sort them without being told how: by counting
          the straight sides.
        </p>
        <FigRow>
          <PolygonFig sides={3} r={38} caption="3 sides — triangle" />
          <PolygonFig sides={5} r={38} caption="5 sides — pentagon" />
          <PolygonFig sides={6} r={38} caption="6 sides — hexagon" />
        </FigRow>
        <p className="mt-4 text-ink-700">
          Count the corners of any of them and you get the same number as the sides. That is not a
          coincidence — every side ends at a corner, and every corner joins two sides.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(2)}>A tricky one</PrimaryButton>
        </div>
      </Step>

      <Step n={2} title="Is this a square?" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <div className="mt-2">
          <PolygonFig sides={4} r={46} caption="four equal sides, four square corners" />
        </div>
        <div className="mt-4 grid gap-2">
          {[
            { k: "d", label: "No — that's a diamond" },
            { k: "s", label: "Yes — it's a square" },
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
            Tilt your head to the side and look again.
            <div className="mt-3">
              <PrimaryButton onClick={() => go(3)}>Show me</PrimaryButton>
            </div>
          </div>
        )}
      </Step>

      <Step n={3} title="The mistake almost everyone makes" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <WrongBox>&ldquo;Turn a square and it becomes a diamond&rdquo;</WrongBox>
        <p className="text-ink-700">
          Test the method against the actual rules. A square is a shape with{" "}
          <strong>4 straight sides, all the same length, and 4 square corners</strong>. Check the
          tilted one:
        </p>
        <FigRow>
          <LabelledRect w={4} h={4} unit="cm" caption="4 sides, all equal, square corners" />
          <PolygonFig sides={4} r={46} caption="4 sides, all equal, square corners" />
        </FigRow>
        <p className="mt-4 text-ink-700">
          Both pass every test. Turning a shape moves it; it does not change how many sides it has
          or how long they are. So both pictures are squares — the second one is just resting on a
          corner.
        </p>
        <KeyIdea>
          A shape&rsquo;s name comes from its <strong>properties</strong>, never from its position on
          the page. &ldquo;Diamond&rdquo; is not a mathematical name at all.
        </KeyIdea>
        <p className="mt-3 text-ink-700">
          The same idea catches people out one more time: a square has 4 sides and 4 square corners,
          so a square <em>is</em> a rectangle — a special one where the sides happen to be equal.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(4)}>Sorting triangles</PrimaryButton>
        </div>
      </Step>

      <Step n={4} title="Triangles, sorted by their sides" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <p className="text-ink-700">
          All triangles have 3 sides, so the sorting is by how many of those sides are{" "}
          <strong>equal</strong>.
        </p>
        <div className="mt-3 space-y-2">
          {[
            ["Equilateral", "all 3 sides equal", "6 cm, 6 cm, 6 cm"],
            ["Isosceles", "exactly 2 sides equal", "7 cm, 7 cm, 4 cm"],
            ["Scalene", "no sides equal", "5 cm, 6 cm, 8 cm"],
          ].map(([a, b, c]) => (
            <div key={a} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-bold text-ink-900">{a}</span>
              <span className="text-sm text-brand-700">{b}</span>
              <span className="text-sm text-ink-500">{c}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-ink-700">
          Quadrilaterals sort the same way — by equal sides, parallel sides and square corners.
          A rhombus has 4 equal sides but leaning corners; a trapezium has just one pair of parallel
          sides.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(5)}>Angles inside a shape</PrimaryButton>
        </div>
      </Step>

      <Step n={5} title="Cutting a shape into triangles" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">
          You already know a triangle&rsquo;s three angles add to 180°. Every other polygon can be
          cut into triangles from one corner — so nothing new has to be learnt.
        </p>
        <FigRow>
          <PolygonFig sides={4} r={44} triangles caption="4 sides → 2 triangles" />
          <PolygonFig sides={5} r={44} triangles caption="5 sides → 3 triangles" />
        </FigRow>
        <div className="mt-4 rounded-2xl bg-paper p-4">
          <ol className="space-y-2">
            {[
              ["A pentagon cuts into 3 triangles", "5 − 2 = 3"],
              ["Each triangle holds 180°", "3 * 180° = 540°"],
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
        <FormulaBox>angle sum = (sides − 2) &times; 180°</FormulaBox>
        <p className="text-ink-700">
          The &ldquo;− 2&rdquo; is not a rule to memorise: two of the sides are used up reaching the
          corner you cut from, so they never start a triangle of their own.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(6)}>Your turn</PrimaryButton>
        </div>
      </Step>

      <Step n={6} title="You try one" open={step === 6} onOpen={() => go(6)} done={false}>
        <p className="text-ink-700">
          What do the interior angles of a <strong>hexagon</strong> add up to?
        </p>
        <div className="mt-3">
          <PolygonFig sides={6} r={46} triangles caption="cut from one corner" />
        </div>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>A hexagon has 6 sides, so it cuts
          into <MathText text="6 - 2 = 4" /> triangles.
        </div>
        <TryIt
          prompt={<>2. Four triangles of 180° each. What is the total, in degrees?</>}
          accept={["720", "720°"]}
          placeholder="like 540"
          value={fade}
          setValue={setFade}
          hint="four lots of 180°."
          explain={
            <>
              <MathText text="4 * 180 = 720" />, so a hexagon&rsquo;s angles total{" "}
              <strong>720°</strong>. In a <em>regular</em> hexagon all six are equal, so each one is{" "}
              <MathText text="720 ÷ 6 = 120" />°.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Naming 2D shapes</div>
          <div className="mt-2">1. Count the sides — corners always match</div>
          <div className="mt-1">2. Turning a shape never changes its name</div>
          <div className="mt-1">3. Sort triangles by equal sides</div>
          <div className="mt-1">4. Angle sum = (sides − 2) &times; 180°</div>
        </div>
        <KeyIdea>
          💡 Before naming a shape, list what it has: how many sides, which are equal, which corners
          are square. Names follow from the list.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}

/**
 * 3D solids: faces, edges, vertices.
 *
 * The misconception here is a drawing problem rather than a geometry one.
 * Children count what the picture shows — three faces of a cube, seven or
 * eight edges — because the back of the solid is not on the page. Dashed
 * hidden edges are the whole lesson.
 */
export function Shapes3dLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 4 · Geometry · 3D Shapes"
      title="Counting the parts you cannot see"
      minutes={5}
      step={step}
      total={6}
    >
      <Step n={1} title="Solids around the kitchen" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          A cereal box, a tin of beans, an ice-cream cone, a ball. Each has a mathematical name
          based on the surfaces it is made of.
        </p>
        <FigRow>
          <SolidFig kind="rectangular prism" caption="rectangular prism" />
          <SolidFig kind="cylinder" caption="cylinder" />
          <SolidFig kind="cone" caption="cone" />
          <SolidFig kind="sphere" caption="sphere" />
        </FigRow>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(2)}>The three things we count</PrimaryButton>
        </div>
      </Step>

      <Step n={2} title="Faces, edges, vertices" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <div className="mt-2 space-y-2">
          {[
            ["Face", "a flat surface you could put a sticker on"],
            ["Edge", "the line where two faces meet"],
            ["Vertex", "a corner point where edges meet (plural: vertices)"],
          ].map(([a, b]) => (
            <div key={a} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-bold text-ink-900">{a}</span>
              <span className="text-sm text-ink-700">{b}</span>
            </div>
          ))}
        </div>
        <div className="mt-3">
          <SolidFig kind="cube" caption="a cube — the dashed lines are round the back" />
        </div>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(3)}>Count the faces</PrimaryButton>
        </div>
      </Step>

      <Step n={3} title="The mistake almost everyone makes" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">Here is a cube as a photograph would show it:</p>
        <div className="mt-3">
          <SolidFig kind="cube" hideHidden caption="how many faces can you see?" />
        </div>
        <WrongBox>a cube has 3 faces</WrongBox>
        <p className="text-ink-700">
          Three is exactly right for what is <em>visible</em> — top, front and one side. But pick a
          real dice up and turn it over. There is a face underneath, a face at the back and a face
          on the far side, all hiding behind the ones you can see.
        </p>
        <div className="mt-3">
          <SolidFig kind="cube" caption="the same cube, with the hidden edges dashed in" />
        </div>
        <p className="mt-3 text-center text-lg font-bold text-ok-600">
          6 faces, 12 edges, 8 vertices
        </p>
        <KeyIdea>
          A drawing shows you half a solid at best. Count in <strong>pairs</strong>: every face you
          can see on a box has a twin hiding opposite it.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(4)}>The other solids</PrimaryButton>
        </div>
      </Step>

      <Step n={4} title="The ones worth knowing" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <FigRow>
          <SolidFig kind="triangular prism" caption="triangular prism" />
          <SolidFig kind="square pyramid" caption="square pyramid" />
        </FigRow>
        <div className="mt-4 overflow-x-auto">
          <table className="mx-auto border-collapse text-center text-sm">
            <thead>
              <tr className="text-[11px] font-bold uppercase tracking-wide text-ink-500">
                <th className="px-2 pb-1 text-left">Solid</th>
                <th className="px-2 pb-1">Faces</th>
                <th className="px-2 pb-1">Edges</th>
                <th className="px-2 pb-1">Vertices</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["cube", 6, 12, 8],
                ["rectangular prism", 6, 12, 8],
                ["triangular prism", 5, 9, 6],
                ["square pyramid", 5, 8, 5],
                ["triangular pyramid", 4, 6, 4],
              ].map((r) => (
                <tr key={String(r[0])}>
                  <td className="border border-ink-100 px-2 py-1.5 text-left font-semibold text-ink-900">{r[0]}</td>
                  <td className="border border-ink-100 px-2 py-1.5 tabular-nums text-ink-700">{r[1]}</td>
                  <td className="border border-ink-100 px-2 py-1.5 tabular-nums text-ink-700">{r[2]}</td>
                  <td className="border border-ink-100 px-2 py-1.5 tabular-nums text-ink-700">{r[3]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-ink-700">
          A <strong>prism</strong> has the same shape at both ends, joined by rectangles. A{" "}
          <strong>pyramid</strong> has one base and triangles meeting at a single point.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(5)}>A check that always works</PrimaryButton>
        </div>
      </Step>

      <Step n={5} title="Euler's rule" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">
          Look down the table again: add the faces and vertices, then subtract the edges. Every
          single row gives 2.
        </p>
        <div className="mt-3 space-y-2">
          {[
            ["cube", "6 + 8 − 12 = 2"],
            ["triangular prism", "5 + 6 − 9 = 2"],
            ["square pyramid", "5 + 5 − 8 = 2"],
          ].map(([a, b]) => (
            <div key={a} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-semibold text-ink-900">{a}</span>
              <span className="text-sm font-bold text-brand-700">{b}</span>
            </div>
          ))}
        </div>
        <FormulaBox>faces + vertices − edges = 2</FormulaBox>
        <p className="text-ink-700">
          That gives you a way to catch a miscount. If your numbers do not make 2, you missed a
          hidden part.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(6)}>Your turn</PrimaryButton>
        </div>
      </Step>

      <Step n={6} title="You try one" open={step === 6} onOpen={() => go(6)} done={false}>
        <p className="text-ink-700">
          A square pyramid has <strong>5 faces</strong> and <strong>5 vertices</strong>. How many
          edges does it have?
        </p>
        <div className="mt-3">
          <SolidFig kind="square pyramid" caption="don't forget the base edges at the back" />
        </div>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          Faces + vertices = <MathText text="5 + 5 = 10" />.
        </div>
        <TryIt
          prompt={<>2. Euler&rsquo;s rule says faces + vertices − edges = 2. How many edges?</>}
          accept={["8"]}
          placeholder="like 12"
          value={fade}
          setValue={setFade}
          hint="10 minus the edges has to leave 2."
          explain={
            <>
              <MathText text="10 - 2 = 8" /> edges. Count them on the picture: 4 round the square
              base and 4 running up to the point. The two base edges at the back are the ones people
              miss.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">3D solids</div>
          <div className="mt-2">1. Faces are flat, edges are lines, vertices are corners</div>
          <div className="mt-1">2. Count the hidden parts too — turn the solid in your head</div>
          <div className="mt-1">3. Check with faces + vertices − edges = 2</div>
        </div>
        <KeyIdea>
          💡 The parts you cannot see are still there. A drawing hides exactly half a box, so a count
          that only uses the picture will always come up short.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
