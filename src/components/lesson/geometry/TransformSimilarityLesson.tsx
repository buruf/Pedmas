"use client";

import { useState } from "react";
import { Step, KeyIdea, FormulaBox, WrongBox } from "@/components/lesson/Step";
import { LessonShell, TryIt } from "@/components/lesson/LessonShell";
import { PrimaryButton } from "@/components/ui";
import { MathText } from "@/components/MathText";
import { CoordGrid, ScaleCompare, LabelledRect, FigRow, GEO_COLOURS } from "./GeoModels";

/**
 * Transformations.
 *
 * Slides and turns are rarely a problem; reflections are. Children draw the
 * image somewhere on the far side of the mirror line without measuring, and
 * usually too close to it — because a mirror "puts the shape on the other
 * side" and nobody mentioned distance. Marking the squares from the line to
 * the point, and the same count back, is the fix.
 */
export function TransformationsLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 7 · Geometry · Transformations"
      title="Sliding, flipping and turning"
      minutes={6}
      step={step}
      total={6}
    >
      <Step n={1} title="Three ways to move a shape" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          Push a book across the table. Flip a playing card over. Turn a key in a lock. Three
          different moves, and not one of them changes how big the object is.
        </p>
        <div className="mt-3 space-y-2">
          {[
            ["Translation", "a slide", "nothing turns, nothing flips"],
            ["Reflection", "a flip over a mirror line", "left and right swap"],
            ["Rotation", "a turn about a fixed point", "like a hand on a clock"],
          ].map(([a, b, c]) => (
            <div key={a} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-bold text-ink-900">{a}</span>
              <span className="text-sm text-brand-700">{b}</span>
              <span className="text-sm text-ink-500">{c}</span>
            </div>
          ))}
        </div>
        <KeyIdea>
          All three keep every length and every angle exactly the same. Only the shape&rsquo;s{" "}
          <em>position</em> changes — so the image is always identical to the original.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(2)}>Start with the slide</PrimaryButton>
        </div>
      </Step>

      <Step n={2} title="Translations are just instructions" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <p className="text-ink-700">
          &ldquo;4 right and 2 up&rdquo; applies to <strong>every</strong> corner of the shape.
          Move all the corners, then join them.
        </p>
        <div className="mt-3">
          <CoordGrid
            xMin={0}
            xMax={9}
            yMin={0}
            yMax={8}
            polys={[
              { pts: [[1, 1], [3, 1], [1, 4]], colour: GEO_COLOURS.brand, fill: GEO_COLOURS.brandSoft, label: "A" },
              { pts: [[5, 3], [7, 3], [5, 6]], colour: GEO_COLOURS.teal, dashed: true, label: "A′" },
            ]}
            caption="every corner moved 4 right and 2 up"
          />
        </div>
        <p className="mt-3 text-ink-700">
          Corner (1, 1) becomes (5, 3): add 4 to the x, add 2 to the y. Do the same to the other two
          corners and the triangle arrives whole.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(3)}>Now the flip</PrimaryButton>
        </div>
      </Step>

      <Step n={3} title="The mistake almost everyone makes" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">
          Reflect the point <strong>P</strong> in the red mirror line. Here is where it usually gets
          drawn:
        </p>
        <WrongBox>just put it on the other side of the line</WrongBox>
        <div className="mt-3">
          <CoordGrid
            xMin={0}
            xMax={10}
            yMin={0}
            yMax={6}
            vLines={[{ x: 5, label: "mirror" }]}
            points={[
              { x: 2, y: 3, label: "P" },
              { x: 6, y: 3, label: "✗", colour: GEO_COLOURS.red, hollow: true },
              { x: 8, y: 3, label: "P′", colour: GEO_COLOURS.teal },
            ]}
            segments={[
              { from: [2, 3], to: [5, 3], label: "3", colour: GEO_COLOURS.brand },
              { from: [5, 3], to: [8, 3], label: "3", colour: GEO_COLOURS.teal },
            ]}
            caption="✗ is only 1 square out; P′ is 3, the same as P"
          />
        </div>
        <p className="mt-3 text-ink-700">
          Being on the other side is only half the job. Stand in front of a real mirror and step
          back a metre — your reflection steps back a metre too. It is always{" "}
          <strong>the same distance from the glass as you are</strong>.
        </p>
        <div className="mt-3 rounded-2xl bg-paper p-4">
          <ol className="space-y-2">
            {[
              ["Count from P to the mirror line", "5 − 2 = 3 squares"],
              ["Count the same distance out the other side", "5 + 3 = 8"],
              ["The up-down position never changes", "y stays 3"],
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
        <p className="mt-3 text-center text-lg font-bold text-ok-600">P(2, 3) → P′(8, 3)</p>
        <KeyIdea>
          Measure, don&rsquo;t eyeball. Each point and its image sit at equal distances from the
          mirror line, on a path that crosses the line at a square corner.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(4)}>A whole shape</PrimaryButton>
        </div>
      </Step>

      <Step n={4} title="Reflecting a whole shape" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <p className="text-ink-700">
          Do one corner at a time. Corners far from the line stay far; corners near it stay near —
          which is why the image looks flipped rather than slid.
        </p>
        <div className="mt-3">
          <CoordGrid
            xMin={0}
            xMax={10}
            yMin={0}
            yMax={6}
            vLines={[{ x: 5, label: "x = 5" }]}
            polys={[
              { pts: [[1, 1], [1, 4], [3, 1]], colour: GEO_COLOURS.brand, fill: GEO_COLOURS.brandSoft, label: "T" },
              { pts: [[9, 1], [9, 4], [7, 1]], colour: GEO_COLOURS.teal, dashed: true, label: "T′" },
            ]}
          />
        </div>
        <div className="mt-3 space-y-2">
          {[
            ["(1, 4) is 4 from the line", "→ (9, 4)"],
            ["(1, 1) is 4 from the line", "→ (9, 1)"],
            ["(3, 1) is only 2 from the line", "→ (7, 1)"],
          ].map(([a, b]) => (
            <div key={a} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-semibold text-ink-900">{a}</span>
              <span className="text-sm font-bold text-brand-700">{b}</span>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(5)}>And the turn</PrimaryButton>
        </div>
      </Step>

      <Step n={5} title="Rotations" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">
          A rotation needs three things: a <strong>centre</strong> to turn about, an{" "}
          <strong>angle</strong>, and a <strong>direction</strong>. Turning 90° clockwise about the
          origin sends the corner (1, 5) to (5, −1).
        </p>
        <div className="mt-3">
          <CoordGrid
            xMin={-6}
            xMax={6}
            yMin={-6}
            yMax={6}
            polys={[
              { pts: [[1, 1], [1, 5], [2, 1]], colour: GEO_COLOURS.brand, fill: GEO_COLOURS.brandSoft },
              { pts: [[1, -1], [5, -1], [1, -2]], colour: GEO_COLOURS.teal, dashed: true },
            ]}
            caption="a quarter turn clockwise about the origin"
          />
        </div>
        <FormulaBox>
          <div className="text-base">translation: slide every point the same way</div>
          <div className="mt-1 text-base">reflection: equal distance, opposite side</div>
          <div className="mt-1 text-base">rotation: same angle about one fixed point</div>
        </FormulaBox>
        <p className="text-ink-700">
          Tracing paper is the honest test for all three: draw the shape, move the paper as
          described, and the image is wherever the tracing lands.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(6)}>Your turn</PrimaryButton>
        </div>
      </Step>

      <Step n={6} title="You try one" open={step === 6} onOpen={() => go(6)} done={false}>
        <p className="text-ink-700">
          The point <strong>Q(2, 3)</strong> is reflected in the mirror line <strong>x = 6</strong>.
        </p>
        <div className="mt-3">
          <CoordGrid
            xMin={0}
            xMax={12}
            yMin={0}
            yMax={6}
            vLines={[{ x: 6, label: "x = 6" }]}
            points={[{ x: 2, y: 3, label: "Q" }]}
            segments={[{ from: [2, 3], to: [6, 3], label: "?", colour: GEO_COLOURS.brand }]}
          />
        </div>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          Q sits <MathText text="6 - 2 = 4" /> squares to the left of the mirror line, and its
          height does not change.
        </div>
        <TryIt
          prompt={<>2. The image is 4 squares to the right of the line. What is its x-coordinate?</>}
          accept={["10"]}
          placeholder="a number"
          value={fade}
          setValue={setFade}
          hint="start at the mirror line, 6, and count 4 more squares to the right."
          explain={
            <>
              <MathText text="6 + 4 = 10" />, so the image is <strong>Q′(10, 3)</strong>. Equal
              distances on either side of the line — 4 squares out, 4 squares back.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Transformations</div>
          <div className="mt-2">1. Size and shape never change — only position</div>
          <div className="mt-1">2. Translation: move every corner the same way</div>
          <div className="mt-1">3. Reflection: count to the line, count the same back</div>
          <div className="mt-1">4. Rotation: needs a centre, an angle and a direction</div>
        </div>
        <KeyIdea>
          💡 For a reflection, always count squares. &ldquo;On the other side&rdquo; is where most
          marks are lost, because it is only half of the instruction.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}

/**
 * Similar figures and scale factor.
 *
 * The headline misconception is superb because the wrong answer is so
 * confident: double the sides, double the area. It is wrong by a factor of two
 * and no amount of formula-quoting fixes it. Counting 6 squares becoming 24 —
 * not 12 — settles it in one glance.
 */
export function SimilarityLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [guess, setGuess] = useState<string | null>(null);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 8 · Geometry · Similar Figures"
      title="What happens to the area when you enlarge?"
      minutes={6}
      step={step}
      total={6}
    >
      <Step n={1} title="Enlarging a photo" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          A photo is 2 cm by 3 cm. You enlarge it by a <strong>scale factor of 2</strong>, so every
          length doubles: 4 cm by 6 cm.
        </p>
        <FigRow>
          <LabelledRect w={2} h={3} unit="cm" maxPx={44} caption="original" />
          <LabelledRect w={4} h={6} unit="cm" maxPx={88} caption="scale factor 2" />
        </FigRow>
        <p className="mt-4 text-ink-700">
          The shapes are <strong>similar</strong>: same shape, different size. Every angle is
          unchanged and every length has been multiplied by the same number.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(2)}>A question about ink</PrimaryButton>
        </div>
      </Step>

      <Step n={2} title="How much more ink does it need?" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <p className="text-ink-700">
          Printing the big photo costs ink, and ink depends on <strong>area</strong>. You doubled
          every length. How many times as much ink?
        </p>
        <div className="mt-4 grid gap-2">
          {[
            { k: "2", label: "Twice as much — the sides doubled" },
            { k: "4", label: "Four times as much" },
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
            Let&rsquo;s count the squares in both.
            <div className="mt-3">
              <PrimaryButton onClick={() => go(3)}>Count them</PrimaryButton>
            </div>
          </div>
        )}
      </Step>

      <Step n={3} title="The mistake almost everyone makes" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <WrongBox>double the sides &rarr; double the area</WrongBox>
        <div className="mt-2">
          <ScaleCompare w={2} h={3} k={2} caption="scale factor 2" />
        </div>
        <p className="mt-3 text-ink-700">
          6 squares became <strong>24</strong>, not 12. The area is <strong>four times</strong> as
          big — so the big print costs four times the ink, not twice.
        </p>
        <KeyIdea>
          The reason is that area is made from <em>two</em> lengths, and{" "}
          <strong>both of them doubled</strong>. Twice as wide <em>and</em> twice as tall is{" "}
          <MathText text="2 * 2 = 4" /> times as much surface.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(4)}>Does that always happen?</PrimaryButton>
        </div>
      </Step>

      <Step n={4} title="Lengths by k, area by k squared" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <p className="text-ink-700">Try a scale factor of 3 on the same photo:</p>
        <div className="mt-3">
          <ScaleCompare w={2} h={3} k={3} caption="scale factor 3" />
        </div>
        <div className="mt-3 space-y-2">
          {[
            ["scale factor 2", "area × 4", "2 * 2"],
            ["scale factor 3", "area × 9", "3 * 3"],
            ["scale factor 5", "area × 25", "5 * 5"],
            ["scale factor k", "area × k²", "k * k"],
          ].map(([a, b, c]) => (
            <div key={a} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-semibold text-ink-900">{a}</span>
              <span className="text-sm font-bold text-brand-700">{b}</span>
              <span className="text-sm text-ink-500">
                <MathText text={c} />
              </span>
            </div>
          ))}
        </div>
        <FormulaBox>
          <div>lengths &times; k</div>
          <div className="mt-1">
            areas &times; <MathText text="k^2" />
          </div>
          <div className="mt-1">
            volumes &times; <MathText text="k^3" />
          </div>
        </FormulaBox>
        <p className="text-ink-700">
          Volume follows the same logic with a third length, which is why a model car at{" "}
          <MathText text="{1/10}" /> scale needs only a thousandth of the metal.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(5)}>Matching sides</PrimaryButton>
        </div>
      </Step>

      <Step n={5} title="A worked example" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">
          Triangles ABC and DEF are similar. Side <strong>AB = 4 cm</strong> matches{" "}
          <strong>DE = 12 cm</strong>. Side <strong>BC = 5 cm</strong>. How long is EF?
        </p>
        <div className="mt-3 rounded-2xl bg-paper p-4">
          <ol className="space-y-2">
            {[
              ["Find the scale factor from a pair you know", "12 ÷ 4 = 3"],
              ["Every length is multiplied by 3", "EF = 5 * 3 = 15 cm"],
              ["Check the ratios match", "{4/12} = {5/15} ✓"],
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
        <p className="mt-3 text-ink-700">
          And if someone asks about the area of DEF: the scale factor is 3, so its area is{" "}
          <MathText text="3^2 = 9" /> times the area of ABC — never 3 times.
        </p>
        <p className="mt-3 text-ink-700">
          The same trick measures things you cannot reach. A 2 m pole casting a 1 m shadow, next to
          a tree casting a 6 m shadow: the shadow is 6 times longer, so the tree is{" "}
          <MathText text="2 * 6 = 12" /> m tall.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(6)}>Your turn</PrimaryButton>
        </div>
      </Step>

      <Step n={6} title="You try one" open={step === 6} onOpen={() => go(6)} done={false}>
        <p className="text-ink-700">
          A rug is enlarged so that every side is <strong>4 times</strong> as long.
        </p>
        <div className="mt-3">
          <ScaleCompare w={1} h={2} k={4} caption="1 by 2 becomes 4 by 8" />
        </div>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          The rug becomes 4 times as wide <em>and</em> 4 times as long.
        </div>
        <TryIt
          prompt={<>2. The area is multiplied by what number?</>}
          accept={["16"]}
          placeholder="a number"
          value={fade}
          setValue={setFade}
          hint="two lengths each grew 4 times — multiply the two growths together."
          explain={
            <>
              <MathText text="4 * 4 = 16" />, so the area is <strong>16 times</strong> as big. The
              new rug needs 16 times as much material, even though each side only grew 4 times.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Similar figures</div>
          <div className="mt-2">1. Similar = same shape, same angles, all lengths &times; k</div>
          <div className="mt-1">2. Find k from a pair of matching sides</div>
          <div className="mt-1">3. Areas grow by k², not by k</div>
          <div className="mt-1">4. Volumes grow by k³</div>
        </div>
        <KeyIdea>
          💡 Scaling lengths never scales area by the same number. Ask &ldquo;how many lengths make
          this measurement?&rdquo; — one for a side, two for an area, three for a volume.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
