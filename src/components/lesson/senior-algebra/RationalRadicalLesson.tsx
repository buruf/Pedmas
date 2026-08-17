"use client";

import { useState } from "react";
import { MathText } from "@/components/MathText";
import { Step, KeyIdea, WrongBox, FormulaBox } from "@/components/lesson/Step";
import { LessonShell, TryIt } from "@/components/lesson/LessonShell";
import { PrimaryButton } from "@/components/ui";

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

/* ---------------------------------------------------- rational expression */

/**
 * Simplifying rational expressions.
 *
 * One misconception dominates and it gets the longest step in the lesson:
 * cancelling a number or a letter that is joined to the rest by a plus sign.
 * The disproof is a single substitution, and the repair is a single rule —
 * cancel factors, and a factor is something multiplying the whole line.
 */
export function RationalExpressionLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 11 · Rational expressions · Simplifying"
      title="Simplifying algebraic fractions"
      minutes={7}
      step={step}
      total={7}
    >
      <Step n={1} title="What cancelling actually does" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          <MathText text="{6x/9x}" /> becomes <MathText text="{2/3}" />. Nothing magic happened —
          top and bottom were both divided by <MathText text="3x" />, and dividing both parts of a
          fraction by the same thing leaves its value alone.
        </p>
        <FormulaBox><MathText text="{6x/9x} = {2 * 3x/3 * 3x} = {2/3}" /></FormulaBox>
        <KeyIdea>
          Cancelling is division. It is only allowed when the thing you remove is{" "}
          <strong>multiplying</strong> everything above and everything below.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(2)}>A harder one</PrimaryButton></div>
      </Step>

      <Step n={2} title="The new problem" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <p className="text-ink-700">Simplify</p>
        <FormulaBox><MathText text="{x^2 + 5x + 6/x + 2}" /></FormulaBox>
        <p className="text-ink-700">
          There is an <MathText text="x" /> on top and an <MathText text="x" /> underneath. A 2 as
          well, nearly. Both are traps.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(3)}>Show me the trap</PrimaryButton></div>
      </Step>

      <Step n={3} title="The mistake almost everyone makes" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <WrongBox><MathText text="{x + 2/2} = x" /></WrongBox>
        <p className="text-ink-700">
          Two 2s, one on top and one below, so they go. It looks exactly like the cancelling that was
          legal a moment ago. Substitute <MathText text="x = 4" />.
        </p>
        <NumberTest
          x="x = 4"
          rows={[
            { label: "{x + 2/2}", work: "{4 + 2/2} = {6/2}", value: "3", ok: true },
            { label: "x", work: "4", value: "4", ok: false },
          ]}
        />
        <p className="mt-3 text-ink-700">
          Here is the same error in its other favourite disguise:
        </p>
        <WrongBox><MathText text="{x^2 + 6/x} = x + 6" /></WrongBox>
        <NumberTest
          x="x = 2"
          rows={[
            { label: "{x^2 + 6/x}", work: "{4 + 6/2} = {10/2}", value: "5", ok: true },
            { label: "x + 6", work: "2 + 6", value: "8", ok: false },
          ]}
        />
        <div className="mt-4"><PrimaryButton onClick={() => go(4)}>Why is one legal and the other not?</PrimaryButton></div>
      </Step>

      <Step n={4} title="Factors cancel. Terms do not." open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <p className="text-ink-700">
          Cancelling divides the <strong>whole</strong> top by something. In{" "}
          <MathText text="{x + 2/2}" />, the 2 on top is glued to the <MathText text="x" /> by a plus
          sign — it is only <em>part</em> of the top, so dividing it alone divides the wrong amount.
        </p>
        <div className="mt-3 space-y-2">
          {[
            ["{3(x + 2)/3}", "the 3 multiplies the entire top", "cancels ✓ leaves x + 2"],
            ["{x + 2/2}", "the 2 is one term of a sum", "cannot cancel ✗"],
            ["{x(x + 6)/x}", "the x multiplies the entire top", "cancels ✓ leaves x + 6"],
            ["{x^2 + 6/x}", "the 6 has no x in it", "cannot cancel ✗"],
          ].map(([a, b, c]) => (
            <div key={a} className="rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-black text-brand-700"><MathText text={a} /></span>
              <span className="ml-3 text-sm text-ink-700">{b}</span>
              <div className="mt-0.5 text-sm font-semibold text-ink-900">{c}</div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-ink-700">
          Which gives the method: <strong>factor first, cancel second.</strong> If the top is not
          written as a product, there is nothing you are allowed to touch yet.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(5)}>Back to the problem</PrimaryButton></div>
      </Step>

      <Step n={5} title="Worked example" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <WorkList
          rows={[
            ["Factor the top", "x^2 + 5x + 6 = (x + 2)(x + 3)"],
            ["Rewrite", "{(x + 2)(x + 3)/(x + 2)}"],
            ["Now (x + 2) really is a factor of the top", "cancel it"],
            ["Answer", "x + 3, where x ≠ −2"],
          ]}
        />
        <NumberTest
          x="x = 1"
          rows={[
            { label: "{x^2 + 5x + 6/x + 2}", work: "{1 + 5 + 6/3} = {12/3}", value: "4", ok: true },
            { label: "x + 3", work: "1 + 3", value: "4", ok: true },
          ]}
        />
        <p className="mt-3 text-ink-700">
          The restriction matters. At <MathText text="x = −2" /> the original has{" "}
          <MathText text="0" /> on the bottom and means nothing, while{" "}
          <MathText text="x + 3" /> happily returns 1. They are the same expression{" "}
          <em>everywhere except there</em>, so the condition travels with the answer.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(6)}>Both top and bottom</PrimaryButton></div>
      </Step>

      <Step n={6} title="When both need factoring" open={step === 6} onOpen={() => go(6)} done={step > 6}>
        <p className="text-ink-700">
          Simplify <MathText text="{x^2 − 9/x^2 + 7x + 12}" />.
        </p>
        <WorkList
          rows={[
            ["Top is a difference of squares", "(x − 3)(x + 3)"],
            ["Bottom: two numbers multiplying to 12, adding to 7", "(x + 3)(x + 4)"],
            ["The shared factor", "(x + 3)"],
            ["Answer", "{x − 3/x + 4}, where x ≠ −3 and x ≠ −4"],
          ]}
        />
        <NumberTest
          x="x = 1"
          rows={[
            { label: "the original", work: "{1 − 9/1 + 7 + 12} = {−8/20}", value: "−0.4", ok: true },
            { label: "{x − 3/x + 4}", work: "{1 − 3/1 + 4} = {−2/5}", value: "−0.4", ok: true },
          ]}
        />
        <KeyIdea>
          Notice what did <em>not</em> happen: no <MathText text="x" /> was cancelled with an{" "}
          <MathText text="x" />, and no 3 with a 3. Only the complete bracket{" "}
          <MathText text="(x + 3)" /> was allowed to go.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(7)}>Your turn</PrimaryButton></div>
      </Step>

      <Step n={7} title="You try one" open={step === 7} onOpen={() => go(7)} done={false}>
        <p className="text-ink-700">
          Simplify <MathText text="{x^2 + 7x + 10/x + 5}" />.
        </p>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          Factor the top: two numbers multiplying to 10 and adding to 7 are 5 and 2, so it is{" "}
          <MathText text="(x + 5)(x + 2)" />.
        </div>
        <TryIt
          prompt={<>2. Cancel the shared factor. What is left? Type it like x+7</>}
          accept={["x+2", "X+2", "2+x"]}
          placeholder="like x+7"
          value={fade}
          setValue={setFade}
          hint="the (x + 5) on the bottom matches one bracket on top. The other bracket is the answer."
          explain={
            <>
              <MathText text="x + 2" />, for <MathText text="x ≠ −5" />. Check at{" "}
              <MathText text="x = 1" />: the original is <MathText text="{18/6} = 3" /> and{" "}
              <MathText text="1 + 2 = 3" /> ✓
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Simplifying algebraic fractions</div>
          <div className="mt-2">1. Factor the top and the bottom completely</div>
          <div className="mt-1">2. Cancel only whole factors that appear in both</div>
          <div className="mt-1">3. Never cancel across a + or a − sign</div>
          <div className="mt-1">4. State the values that would have made the bottom zero</div>
        </div>
        <KeyIdea>
          💡 If you can see a plus sign between what you are cancelling and the rest, stop. Factor
          first — and if it will not factor, it will not cancel.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}

/* ----------------------------------------------------- radical expression */

/**
 * Radicals.
 *
 * Exactly the same shape of error as (x + 3)² = x² + 9, one operation up: the
 * root distributed over a sum. Disproved with 9 and 16, whose sum is a perfect
 * square, so both sides are whole numbers and the gap is impossible to argue
 * with.
 */
export function RadicalExpressionLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 11 · Radicals · Simplifying"
      title="Working with square roots"
      minutes={7}
      step={step}
      total={7}
    >
      <Step n={1} title="A diagonal across a room" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          A rectangular room is <strong>3 m</strong> by <strong>4 m</strong>. How long is the
          diagonal?
        </p>
        <p className="mt-3 text-ink-700">
          Pythagoras gives <MathText text="sqrt(3^2 + 4^2) = sqrt(9 + 16)" />.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(2)}>Work it out</PrimaryButton></div>
      </Step>

      <Step n={2} title="The mistake almost everyone makes" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <WrongBox><MathText text="sqrt(9 + 16) = sqrt(9) + sqrt(16) = 3 + 4 = 7" /></WrongBox>
        <p className="text-ink-700">
          It is a beautifully tidy piece of reasoning, and both roots came out whole, which makes it
          feel even more right. But <MathText text="9 + 16 = 25" />.
        </p>
        <div className="mt-3 rounded-2xl bg-paper p-4 text-center">
          <div className="text-lg font-bold text-ink-900"><MathText text="sqrt(9 + 16) = sqrt(25) = 5" /></div>
          <div className="mt-1 text-sm font-bold text-err-600">not 7</div>
        </div>
        <p className="mt-3 text-ink-700">
          And 5 is the answer the room agrees with — the 3-4-5 triangle. A 7 m diagonal in a 3 m by
          4 m room is longer than walking round two walls.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(3)}>Why does splitting fail?</PrimaryButton></div>
      </Step>

      <Step n={3} title="Because squaring does not split either" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">
          A square root asks: <em>what number, squared, gives this?</em> So check the candidate by
          squaring it.
        </p>
        <NumberTest
          x="the two candidates"
          rows={[
            { label: "is 7 the root of 25?", work: "7^2 = 49", value: "49", ok: false },
            { label: "is 5 the root of 25?", work: "5^2 = 25", value: "25", ok: true },
          ]}
        />
        <p className="mt-3 text-ink-700">
          <MathText text="(3 + 4)^2" /> is <MathText text="49" />, not{" "}
          <MathText text="3^2 + 4^2" /> — the same missing middle term that makes{" "}
          <MathText text="(x + 3)^2 = x^2 + 6x + 9" />. The root inherits the problem from the
          square.
        </p>
        <FormulaBox><MathText text="sqrt(a + b) is not sqrt(a) + sqrt(b)" /></FormulaBox>
        <div className="mt-4"><PrimaryButton onClick={() => go(4)}>Is any splitting allowed?</PrimaryButton></div>
      </Step>

      <Step n={4} title="Multiplication is the one that works" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <p className="text-ink-700">
          Over a <strong>product</strong>, the root really does split.{" "}
          <MathText text="sqrt(4 * 9) = sqrt(36) = 6" />, and{" "}
          <MathText text="sqrt(4) * sqrt(9) = 2 * 3 = 6" />. Same answer.
        </p>
        <FormulaBox><MathText text="sqrt(a * b) = sqrt(a) * sqrt(b)" /></FormulaBox>
        <p className="text-ink-700">
          That single fact is the whole of simplifying: hunt for a perfect-square{" "}
          <em>factor</em> hiding inside, and walk it out through the root sign.
        </p>
        <KeyIdea>
          Products split, sums do not. It is the same border as in algebraic fractions, where
          factors cancel and terms never do.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(5)}>Worked example</PrimaryButton></div>
      </Step>

      <Step n={5} title="Worked example: simplify a root" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">
          Simplify <MathText text="sqrt(72)" />.
        </p>
        <WorkList
          rows={[
            ["Find the biggest square that divides 72", "36 * 2 = 72"],
            ["Split across the product", "sqrt(36) * sqrt(2)"],
            ["The square comes out whole", "6sqrt(2)"],
          ]}
        />
        <p className="mt-3 text-ink-700">
          Check by squaring the answer: <MathText text="(6sqrt(2))^2 = 36 * 2 = 72" /> ✓
        </p>
        <p className="mt-3 text-ink-700">
          Missing the biggest square is not fatal — <MathText text="sqrt(72) = sqrt(4) sqrt(18) = 2sqrt(18)" />
          , and <MathText text="sqrt(18)" /> still has a 9 in it. You just have to go again.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(6)}>Adding and dividing roots</PrimaryButton></div>
      </Step>

      <Step n={6} title="Roots behave like letters" open={step === 6} onOpen={() => go(6)} done={step > 6}>
        <p className="text-ink-700">
          <MathText text="3sqrt(5) + 4sqrt(5) = 7sqrt(5)" />, for the same reason{" "}
          <MathText text="3x + 4x = 7x" />: they are seven of the same thing.
        </p>
        <p className="mt-3 text-ink-700">
          But different roots never merge — the trap from step 2 in another outfit.
        </p>
        <WrongBox><MathText text="sqrt(2) + sqrt(3) = sqrt(5)" /></WrongBox>
        <NumberTest
          x="a calculator"
          rows={[
            { label: "sqrt(2) + sqrt(3)", work: "1.414 + 1.732", value: "3.146", ok: true },
            { label: "sqrt(5)", work: "about 2.236", value: "2.236", ok: false },
          ]}
        />
        <p className="mt-3 text-ink-700">
          Last habit: a root on the bottom of a fraction gets moved upstairs. Multiply top and
          bottom by that root.
        </p>
        <WorkList
          rows={[
            ["Start", "{6/sqrt(3)}"],
            ["Multiply top and bottom by sqrt(3)", "{6sqrt(3)/3}"],
            ["Simplify", "2sqrt(3)"],
          ]}
        />
        <p className="mt-3 text-ink-700">
          Check on a calculator: <MathText text="6 ÷ 1.732 = 3.464" /> and{" "}
          <MathText text="2 * 1.732 = 3.464" /> ✓
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(7)}>Your turn</PrimaryButton></div>
      </Step>

      <Step n={7} title="You try one" open={step === 7} onOpen={() => go(7)} done={false}>
        <p className="text-ink-700">
          Simplify <MathText text="sqrt(50)" />.
        </p>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          <MathText text="50 = 25 * 2" />, and 25 is a perfect square.
        </div>
        <TryIt
          prompt={<>2. The answer has the form (a number) × sqrt(2). What is the number outside?</>}
          accept={["5"]}
          placeholder="a number"
          value={fade}
          setValue={setFade}
          hint="sqrt(25) comes out of the root whole."
          explain={
            <>
              <MathText text="sqrt(50) = 5sqrt(2)" />. Check by squaring:{" "}
              <MathText text="(5sqrt(2))^2 = 25 * 2 = 50" /> ✓
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Square roots</div>
          <div className="mt-2">1. <MathText text="sqrt(ab) = sqrt(a) sqrt(b)" /> — products split</div>
          <div className="mt-1">2. Sums never split</div>
          <div className="mt-1">3. Simplify by pulling out the biggest square factor</div>
          <div className="mt-1">4. Add roots only when the inside matches</div>
        </div>
        <KeyIdea>
          💡 Any answer involving a root can be checked by squaring it. If squaring does not return
          what was under the root sign, something split that should not have.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
