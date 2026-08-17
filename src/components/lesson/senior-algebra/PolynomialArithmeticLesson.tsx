"use client";

import { useState } from "react";
import { MathText } from "@/components/MathText";
import { Step, KeyIdea, WrongBox, FormulaBox } from "@/components/lesson/Step";
import { LessonShell, TryIt } from "@/components/lesson/LessonShell";
import { PrimaryButton } from "@/components/ui";

/* -------------------------------------------------------------- local box */

/**
 * The area box: a rectangle cut by the parts of each factor.
 *
 * This is the same picture that turns 23 × 14 into four easy products, and it
 * is the reason the middle term of a binomial square exists — you can point at
 * the two rectangles that make it.
 */
function BoxModel({
  top,
  side,
  cells,
  highlight = [],
}: {
  top: string[];
  side: string[];
  cells: string[][];
  /** [row, col] pairs drawn in the warning colour */
  highlight?: [number, number][];
}) {
  const hot = (r: number, c: number) => highlight.some(([a, b]) => a === r && b === c);
  return (
    <table className="mx-auto border-collapse text-center">
      <tbody>
        <tr>
          <td className="w-8" />
          {top.map((t, i) => (
            <th key={i} className="px-2 pb-1 text-sm font-bold text-brand-700">
              <MathText text={t} />
            </th>
          ))}
        </tr>
        {side.map((s, r) => (
          <tr key={r}>
            <th className="pr-2 text-sm font-bold text-brand-700">
              <MathText text={s} />
            </th>
            {cells[r].map((c, i) => (
              <td
                key={i}
                className={`border-2 px-4 py-5 text-lg font-black ${
                  hot(r, i)
                    ? "border-warn-600 bg-warn-100 text-ink-900"
                    : "border-brand-200 bg-brand-50 text-ink-900"
                }`}
              >
                <MathText text={c} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function WorkList({ rows }: { rows: [string, string][] }) {
  return (
    <div className="mt-4 rounded-2xl bg-paper p-4">
      <ol className="space-y-2">
        {rows.map(([a, b], i) => (
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
  );
}

/** A small "substitute a number and see" panel — the disproof device. */
function NumberTest({
  x,
  rows,
}: {
  x: string;
  rows: { label: string; work: string; value: string; ok: boolean }[];
}) {
  return (
    <div className="mt-4 rounded-2xl border-2 border-ink-100 bg-white p-4">
      <div className="text-sm font-bold text-ink-900">
        Test it with <MathText text={x} />
      </div>
      <div className="mt-2 space-y-2">
        {rows.map((r) => (
          <div
            key={r.label}
            className={`flex flex-wrap items-center justify-between gap-2 rounded-xl px-3 py-2 ${
              r.ok ? "bg-ok-100" : "bg-err-100"
            }`}
          >
            <span className="text-sm font-bold text-ink-900">
              <MathText text={r.label} />
            </span>
            <span className="text-sm text-ink-700">
              <MathText text={r.work} />
            </span>
            <span className={`text-sm font-black ${r.ok ? "text-ok-600" : "text-err-600"}`}>
              {r.value} {r.ok ? "✓" : "✗"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------- adding and subtracting */

/**
 * Adding and subtracting polynomials.
 *
 * Two errors, one cause: not treating a bracket as a single object. The minus
 * sign gets applied to the first term only, and unlike terms get merged. Both
 * die instantly when a number is substituted.
 */
export function PolyAddSubLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 9 · Polynomials · Adding and subtracting"
      title="Adding and subtracting polynomials"
      minutes={6}
      step={step}
      total={7}
    >
      <Step n={1} title="You can only count the same thing" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          Three boxes and two boxes make five boxes. Three boxes and two crates make — three boxes
          and two crates. There is no single word for the total, because they are not the same thing.
        </p>
        <p className="mt-3 text-ink-700">
          <MathText text="x^2" /> and <MathText text="x" /> are not the same thing either. One is an
          area, one is a length.
        </p>
        <KeyIdea>
          Terms combine only when the variable part is <strong>identical</strong> — same letter, same
          power.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(2)}>Prove it with a number</PrimaryButton></div>
      </Step>

      <Step n={2} title="Unlike terms never merge" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <WrongBox><MathText text="3x^2 + 2x = 5x^2" /></WrongBox>
        <p className="text-ink-700">
          The 3 and the 2 look ready to be added. Put a number in and watch the claim fall over.
        </p>
        <NumberTest
          x="x = 2"
          rows={[
            { label: "3x^2 + 2x", work: "3(4) + 2(2) = 12 + 4", value: "16", ok: true },
            { label: "5x^2", work: "5(4)", value: "20", ok: false },
            { label: "5x", work: "5(2)", value: "10", ok: false },
          ]}
        />
        <p className="mt-3 text-ink-700">
          Only the original is worth 16. <MathText text="3x^2 + 2x" /> is already as short as it
          gets.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(3)}>Now a subtraction</PrimaryButton></div>
      </Step>

      <Step n={3} title="The new problem" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">Simplify</p>
        <FormulaBox><MathText text="(3x^2 + 5x − 2) − (x^2 + 2x − 7)" /></FormulaBox>
        <p className="text-ink-700">
          Adding would be easy — match up the like terms and go. The minus sign in front of the
          second bracket is where it gets interesting.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(4)}>Try it</PrimaryButton></div>
      </Step>

      <Step n={4} title="The mistake almost everyone makes" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <WrongBox><MathText text="3x^2 + 5x − 2 − x^2 + 2x − 7 = 2x^2 + 7x − 9" /></WrongBox>
        <p className="text-ink-700">
          The brackets come off, the minus lands on the <MathText text="x^2" /> and then everything
          else is copied out unchanged. Substitute <MathText text="x = 1" />.
        </p>
        <NumberTest
          x="x = 1"
          rows={[
            { label: "the original", work: "(3 + 5 − 2) − (1 + 2 − 7) = 6 − (−4)", value: "10", ok: true },
            { label: "2x^2 + 7x − 9", work: "2 + 7 − 9", value: "0", ok: false },
          ]}
        />
        <p className="mt-3 text-ink-700">
          10 against 0. The second and third terms of that bracket were never subtracted at all.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(5)}>What should happen?</PrimaryButton></div>
      </Step>

      <Step n={5} title="The minus owns the whole bracket" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">
          <MathText text="−(x^2 + 2x − 7)" /> means <MathText text="−1 * (x^2 + 2x − 7)" />, and
          multiplying reaches every term inside. Think of it as{" "}
          <strong>adding the opposite</strong>.
        </p>
        <div className="mt-4 rounded-2xl bg-paper p-4 text-center">
          <div className="text-lg font-bold text-ink-900"><MathText text="−(x^2 + 2x − 7)" /></div>
          <div className="my-2 text-sm font-semibold text-brand-600">↓ flip every sign</div>
          <div className="text-lg font-bold text-ok-600"><MathText text="−x^2 − 2x + 7" /></div>
        </div>
        <WorkList
          rows={[
            ["Flip the second bracket", "3x^2 + 5x − 2 − x^2 − 2x + 7"],
            ["x² terms: 3 − 1", "2x^2"],
            ["x terms: 5 − 2", "3x"],
            ["Constants: −2 + 7", "+5"],
            ["Answer", "2x^2 + 3x + 5"],
          ]}
        />
        <NumberTest
          x="x = 1"
          rows={[
            { label: "the original", work: "6 − (−4)", value: "10", ok: true },
            { label: "2x^2 + 3x + 5", work: "2 + 3 + 5", value: "10", ok: true },
          ]}
        />
        <KeyIdea>
          Notice the constant went <em>up</em>: subtracting <MathText text="−7" /> adds 7. That is
          the term people miss most often.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(6)}>Worked example</PrimaryButton></div>
      </Step>

      <Step n={6} title="Worked example" open={step === 6} onOpen={() => go(6)} done={step > 6}>
        <p className="text-ink-700">
          Simplify <MathText text="(4x^2 − 3x + 6) + (2x^2 + 7x − 1)" />.
        </p>
        <p className="mt-2 text-ink-700">
          This one is an <strong>addition</strong>, so no signs flip — but line the like terms up
          anyway, because that is the habit that survives the hard ones.
        </p>
        <WorkList
          rows={[
            ["x² terms: 4 + 2", "6x^2"],
            ["x terms: −3 + 7", "4x"],
            ["Constants: 6 − 1", "+5"],
            ["Answer", "6x^2 + 4x + 5"],
          ]}
        />
        <NumberTest
          x="x = 2"
          rows={[
            { label: "the original", work: "(16 − 6 + 6) + (8 + 14 − 1) = 16 + 21", value: "37", ok: true },
            { label: "6x^2 + 4x + 5", work: "24 + 8 + 5", value: "37", ok: true },
          ]}
        />
        <div className="mt-4"><PrimaryButton onClick={() => go(7)}>Your turn</PrimaryButton></div>
      </Step>

      <Step n={7} title="You try one" open={step === 7} onOpen={() => go(7)} done={false}>
        <p className="text-ink-700">
          Simplify <MathText text="(5x^2 + 2x − 3) − (2x^2 − 4x + 1)" />.
        </p>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          Flip the second bracket: <MathText text="5x^2 + 2x − 3 − 2x^2 + 4x − 1" />.
        </div>
        <TryIt
          prompt={<>2. Collect the x terms. What number ends up in front of x?</>}
          accept={["6", "+6"]}
          placeholder="a number"
          value={fade}
          setValue={setFade}
          hint="the −4x became +4x when the bracket flipped, so it is 2 + 4."
          explain={
            <>
              <MathText text="2 + 4 = 6" />, so the answer is <MathText text="3x^2 + 6x − 4" />.
              Check at <MathText text="x = 2" />: the original is{" "}
              <MathText text="(20 + 4 − 3) − (8 − 8 + 1) = 21 − 1 = 20" />, and{" "}
              <MathText text="12 + 12 − 4 = 20" /> ✓
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Adding and subtracting polynomials</div>
          <div className="mt-2">1. A minus in front of a bracket flips <em>every</em> sign inside</div>
          <div className="mt-1">2. Combine only terms with the same letter and power</div>
          <div className="mt-1">3. The powers themselves never change</div>
        </div>
        <KeyIdea>
          💡 Not sure whether you simplified correctly? Put <MathText text="x = 2" /> into the
          original and into your answer. They must agree.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}

/* --------------------------------------------------------------- poly-mul */

/**
 * Multiplying polynomials.
 *
 * The famous one: (x + 3)² read as x² + 9. The area box is the cure, because
 * the missing 6x is physically present as two rectangles you can point at — it
 * stops being a rule to remember and becomes a thing you forgot to count.
 */
export function PolyMulLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 9 · Polynomials · Multiplying"
      title="Multiplying binomials"
      minutes={7}
      step={step}
      total={7}
    >
      <Step n={1} title="A patio you are about to widen" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          You have a square patio of side <MathText text="x" /> metres, and you extend it by 3 metres
          in both directions. The new patio is a square of side <MathText text="x + 3" />.
        </p>
        <p className="mt-3 text-ink-700">
          How much paving do you need? That is <MathText text="(x + 3)^2" />.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(2)}>First, remember 23 × 14</PrimaryButton></div>
      </Step>

      <Step n={2} title="You already do this with numbers" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <p className="text-ink-700">
          <MathText text="23 * 14" /> is <MathText text="(20 + 3)(10 + 4)" />. Cut the rectangle by
          those parts and there are <strong>four</strong> pieces, not two.
        </p>
        <div className="mt-4">
          <BoxModel
            top={["20", "3"]}
            side={["10", "4"]}
            cells={[
              ["200", "30"],
              ["80", "12"],
            ]}
          />
        </div>
        <p className="mt-3 text-center text-sm font-semibold text-ink-700">
          <MathText text="200 + 30 + 80 + 12 = 322" />, and <MathText text="23 * 14 = 322" /> ✓
        </p>
        <KeyIdea>
          Every part of the width has to meet every part of the height. Two parts times two parts
          makes four rectangles.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(3)}>Back to the patio</PrimaryButton></div>
      </Step>

      <Step n={3} title="The mistake almost everyone makes" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <WrongBox><MathText text="(x + 3)^2 = x^2 + 9" /></WrongBox>
        <p className="text-ink-700">
          This is the single most common error in all of algebra, and it is tempting because
          squaring <em>does</em> distribute over multiplication:{" "}
          <MathText text="(3 * 4)^2 = 3^2 * 4^2" /> is genuinely true. It just does not work over
          addition.
        </p>
        <NumberTest
          x="x = 2"
          rows={[
            { label: "(x + 3)^2", work: "(2 + 3)^2 = 5^2", value: "25", ok: true },
            { label: "x^2 + 9", work: "4 + 9", value: "13", ok: false },
          ]}
        />
        <p className="mt-3 text-ink-700">
          25 against 13. Twelve square metres of patio have gone missing. Where are they?
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(4)}>Show me the missing pieces</PrimaryButton></div>
      </Step>

      <Step n={4} title="The two rectangles nobody counts" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <p className="text-ink-700">
          Draw the patio. Side <MathText text="x + 3" /> across, side <MathText text="x + 3" /> down.
        </p>
        <div className="mt-4">
          <BoxModel
            top={["x", "3"]}
            side={["x", "3"]}
            cells={[
              ["x^2", "3x"],
              ["3x", "9"],
            ]}
            highlight={[
              [0, 1],
              [1, 0],
            ]}
          />
        </div>
        <p className="mt-3 text-ink-700">
          <MathText text="x^2" /> is the old patio. <MathText text="9" /> is the little corner
          square. The two shaded strips — <MathText text="3x" /> each — are the new edges along two
          whole sides, and those are what <MathText text="x^2 + 9" /> throws away.
        </p>
        <FormulaBox><MathText text="(x + 3)^2 = x^2 + 6x + 9" /></FormulaBox>
        <NumberTest
          x="x = 2"
          rows={[
            { label: "(x + 3)^2", work: "5^2", value: "25", ok: true },
            { label: "x^2 + 6x + 9", work: "4 + 12 + 9", value: "25", ok: true },
          ]}
        />
        <KeyIdea>
          The middle term is not a rule someone invented. It is the two strips of paving you would
          actually have to buy.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(5)}>Any two brackets</PrimaryButton></div>
      </Step>

      <Step n={5} title="Worked example" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">
          Expand <MathText text="(x + 5)(x + 2)" />. Same box, different edges.
        </p>
        <div className="mt-4">
          <BoxModel
            top={["x", "5"]}
            side={["x", "2"]}
            cells={[
              ["x^2", "5x"],
              ["2x", "10"],
            ]}
          />
        </div>
        <WorkList
          rows={[
            ["Add the four pieces", "x^2 + 5x + 2x + 10"],
            ["The two middle pieces are like terms", "5x + 2x = 7x"],
            ["Answer", "x^2 + 7x + 10"],
          ]}
        />
        <NumberTest
          x="x = 3"
          rows={[
            { label: "(x + 5)(x + 2)", work: "(8)(5)", value: "40", ok: true },
            { label: "x^2 + 7x + 10", work: "9 + 21 + 10", value: "40", ok: true },
          ]}
        />
        <div className="mt-4"><PrimaryButton onClick={() => go(6)}>When the middle vanishes</PrimaryButton></div>
      </Step>

      <Step n={6} title="Why the middle sometimes disappears" open={step === 6} onOpen={() => go(6)} done={step > 6}>
        <p className="text-ink-700">
          Expand <MathText text="(x + 4)(x − 4)" />. The four pieces are{" "}
          <MathText text="x^2" />, <MathText text="−4x" />, <MathText text="+4x" /> and{" "}
          <MathText text="−16" />.
        </p>
        <div className="mt-4">
          <BoxModel
            top={["x", "+4"]}
            side={["x", "−4"]}
            cells={[
              ["x^2", "4x"],
              ["−4x", "−16"],
            ]}
            highlight={[
              [0, 1],
              [1, 0],
            ]}
          />
        </div>
        <p className="mt-3 text-center text-lg font-bold text-ok-600">
          <MathText text="(x + 4)(x − 4) = x^2 − 16" />
        </p>
        <p className="mt-3 text-ink-700">
          Here the two middle pieces cancel — and that is exactly why they cannot be ignored in{" "}
          <MathText text="(x + 3)^2" />, where they do not. Check at{" "}
          <MathText text="x = 5" />: <MathText text="(9)(1) = 9" /> and{" "}
          <MathText text="25 − 16 = 9" /> ✓
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(7)}>Your turn</PrimaryButton></div>
      </Step>

      <Step n={7} title="You try one" open={step === 7} onOpen={() => go(7)} done={false}>
        <p className="text-ink-700">
          Expand <MathText text="(x + 6)(x + 3)" />.
        </p>
        <div className="mt-3">
          <BoxModel
            top={["x", "6"]}
            side={["x", "3"]}
            cells={[
              ["x^2", "6x"],
              ["3x", "18"],
            ]}
          />
        </div>
        <TryIt
          prompt={<>The two middle pieces are 6x and 3x. What number goes in front of x in the answer?</>}
          accept={["9", "+9"]}
          placeholder="a number"
          value={fade}
          setValue={setFade}
          hint="add the two middle rectangles: 6x + 3x."
          explain={
            <>
              <MathText text="9" />, so <MathText text="(x + 6)(x + 3) = x^2 + 9x + 18" />. Check at{" "}
              <MathText text="x = 1" />: <MathText text="(7)(4) = 28" /> and{" "}
              <MathText text="1 + 9 + 18 = 28" /> ✓
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Multiplying binomials</div>
          <div className="mt-2">1. Every part of one bracket meets every part of the other</div>
          <div className="mt-1">2. Two by two means <em>four</em> products</div>
          <div className="mt-1">3. <MathText text="(a + b)^2 = a^2 + 2ab + b^2" /> — never <MathText text="a^2 + b^2" /></div>
        </div>
        <KeyIdea>
          💡 If an expansion ever comes out with only two terms, ask where the middle rectangles
          went. Unless they cancelled, you dropped them.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
