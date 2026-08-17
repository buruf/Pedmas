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

/** The long-division ladder: what you bring down, what you take away. */
function DivisionLadder({
  divisor,
  dividend,
  quotient,
  rows,
}: {
  divisor: string;
  dividend: string;
  quotient: string;
  /** each rung: the piece of quotient found, what it multiplies out to, what is left */
  rows: { term: string; product: string; left: string }[];
}) {
  return (
    <div className="mt-4 rounded-2xl bg-paper p-4">
      <div className="text-center text-sm text-ink-500">
        <MathText text={`(${dividend}) ÷ (${divisor})`} />
      </div>
      <div className="mt-3 space-y-2">
        {rows.map((r, i) => (
          <div key={i} className="rounded-xl bg-white px-3 py-2 text-sm">
            <div className="font-semibold text-ink-900">
              <span className="mr-2 font-bold text-brand-600">{i + 1}.</span>
              Next term of the answer: <span className="font-black text-brand-700"><MathText text={r.term} /></span>
            </div>
            <div className="mt-1 pl-6 text-ink-700">
              <MathText text={`${r.term} * (${divisor}) = ${r.product}`} />
            </div>
            <div className="mt-1 pl-6 text-ink-700">
              subtract that, and what is left is{" "}
              <span className="font-bold text-ink-900"><MathText text={r.left} /></span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 text-center text-lg font-bold text-ok-600">
        <MathText text={quotient} />
      </div>
    </div>
  );
}

/**
 * Dividing polynomials.
 *
 * The monomial case carries a misconception worth killing first: dividing only
 * the leading term and copying the rest. After that, long division is presented
 * as repeated "what do I multiply the divisor by", with the check — multiply
 * back and add the remainder — treated as part of the method.
 */
export function PolyDivisionLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 11 · Polynomials · Division"
      title="Dividing polynomials"
      minutes={7}
      step={step}
      total={6}
    >
      <Step n={1} title="Sharing out an expression" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          Simplify <MathText text="{6x^2 + 4x/2x}" />.
        </p>
        <p className="mt-3 text-ink-700">
          Everything on top has to be shared, exactly the way{" "}
          <MathText text="{60 + 40/2} = 30 + 20" /> shares both parts.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(2)}>Try it</PrimaryButton></div>
      </Step>

      <Step n={2} title="The mistake almost everyone makes" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <WrongBox><MathText text="{6x^2 + 4x/2x} = 3x + 4x" /></WrongBox>
        <p className="text-ink-700">
          The first term gets divided properly and then attention slips: the second term is copied
          across untouched. Substitute <MathText text="x = 1" />.
        </p>
        <NumberTest
          x="x = 1"
          rows={[
            { label: "the original", work: "{6 + 4/2} = {10/2}", value: "5", ok: true },
            { label: "3x + 4x", work: "3 + 4", value: "7", ok: false },
            { label: "3x + 2", work: "3 + 2", value: "5", ok: true },
          ]}
        />
        <div className="mt-4"><PrimaryButton onClick={() => go(3)}>Why does it split like that?</PrimaryButton></div>
      </Step>

      <Step n={3} title="A division bar reaches every term" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">
          Dividing by <MathText text="2x" /> is multiplying by{" "}
          <MathText text="{1/2x}" />, and multiplying reaches into every term — the same rule that
          expands a bracket.
        </p>
        <WorkList
          rows={[
            ["First term", "{6x^2/2x} = 3x"],
            ["Second term", "{4x/2x} = 2"],
            ["Answer", "3x + 2"],
          ]}
        />
        <p className="mt-3 text-ink-700">
          Check the way you always should — multiply back:{" "}
          <MathText text="2x(3x + 2) = 6x^2 + 4x" /> ✓
        </p>
        <KeyIdea>
          Note the second term lost its <MathText text="x" /> entirely, because{" "}
          <MathText text="x ÷ x = 1" />. Terms can change degree during a division; that is exactly
          what makes copying them across wrong.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(4)}>Dividing by a bracket</PrimaryButton></div>
      </Step>

      <Step n={4} title="Worked example: long division" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <p className="text-ink-700">
          Work out <MathText text="(x^2 + 5x + 6) ÷ (x + 2)" />. You cannot split this term by term,
          because the bottom has two terms of its own. Instead ask repeatedly:{" "}
          <strong>what do I multiply <MathText text="(x + 2)" /> by to kill the leading term?</strong>
        </p>
        <DivisionLadder
          divisor="x + 2"
          dividend="x^2 + 5x + 6"
          quotient="answer: x + 3"
          rows={[
            { term: "x", product: "x^2 + 2x", left: "3x + 6" },
            { term: "3", product: "3x + 6", left: "0" },
          ]}
        />
        <p className="mt-3 text-ink-700">
          Nothing left over, so the division is exact. Multiply back to be sure:{" "}
          <MathText text="(x + 2)(x + 3) = x^2 + 5x + 6" /> ✓
        </p>
        <KeyIdea>
          Watch the subtraction. You are removing the <em>whole</em> line{" "}
          <MathText text="x^2 + 2x" />, not just the <MathText text="x^2" />. Missing the second
          part of that line is the other classic slip here.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(5)}>What if it does not divide exactly?</PrimaryButton></div>
      </Step>

      <Step n={5} title="When something is left over" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">
          Change one number: <MathText text="(x^2 + 5x + 9) ÷ (x + 2)" />.
        </p>
        <DivisionLadder
          divisor="x + 2"
          dividend="x^2 + 5x + 9"
          quotient="answer: x + 3, remainder 3"
          rows={[
            { term: "x", product: "x^2 + 2x", left: "3x + 9" },
            { term: "3", product: "3x + 6", left: "3" },
          ]}
        />
        <p className="mt-3 text-ink-700">
          The 3 that is left has no <MathText text="x" /> in it, so <MathText text="(x + 2)" /> can
          never go into it again. That is the remainder, and it is where you stop.
        </p>
        <FormulaBox>
          <MathText text="dividend = divisor * quotient + remainder" />
        </FormulaBox>
        <p className="text-ink-700">
          Check: <MathText text="(x + 2)(x + 3) + 3 = x^2 + 5x + 6 + 3 = x^2 + 5x + 9" /> ✓
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(6)}>Your turn</PrimaryButton></div>
      </Step>

      <Step n={6} title="You try one" open={step === 6} onOpen={() => go(6)} done={false}>
        <p className="text-ink-700">
          Work out <MathText text="(x^2 + 7x + 12) ÷ (x + 3)" />.
        </p>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          First term of the answer is <MathText text="x" />, because{" "}
          <MathText text="x(x + 3) = x^2 + 3x" />. Subtract that and{" "}
          <MathText text="4x + 12" /> is left.
        </div>
        <TryIt
          prompt={<>2. What is the next (and last) term of the answer?</>}
          accept={["4", "+4"]}
          placeholder="a number"
          value={fade}
          setValue={setFade}
          hint="what times (x + 3) gives exactly 4x + 12?"
          explain={
            <>
              <MathText text="4" />, since <MathText text="4(x + 3) = 4x + 12" /> and nothing is
              left. So the answer is <MathText text="x + 4" />. Multiply back:{" "}
              <MathText text="(x + 3)(x + 4) = x^2 + 7x + 12" /> ✓
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Dividing polynomials</div>
          <div className="mt-2">1. By a single term: divide <em>every</em> term on top</div>
          <div className="mt-1">2. By a bracket: kill the leading term, subtract the whole line, repeat</div>
          <div className="mt-1">3. Stop when what is left has a lower degree than the divisor</div>
          <div className="mt-1">4. Check by multiplying back and adding the remainder</div>
        </div>
        <KeyIdea>
          💡 Division is the only one of the four operations that is awkward to do and easy to check.
          Multiplying back takes ten seconds and settles it.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}

/* -------------------------------------------------------- factor theorem */

/**
 * The factor and remainder theorems.
 *
 * Sold as a shortcut that is worth its own name: one substitution replaces a
 * whole long division. The misconception is the sign — testing (x − 3) with
 * x = −3 — and it is disproved on a cubic-free example where the factorisation
 * is already visible, so the wrong verdict is unmistakable.
 */
export function FactorTheoremLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 11 · Polynomials · Factor theorem"
      title="Testing a factor without dividing"
      minutes={7}
      step={step}
      total={6}
    >
      <Step n={1} title="Long division is slow" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          Is <MathText text="(x − 2)" /> a factor of{" "}
          <MathText text="x^3 − 3x^2 + 4x − 4" />?
        </p>
        <p className="mt-3 text-ink-700">
          You could do the long division and see whether the remainder is zero. Three rungs, plenty
          of sign traps. There is a one-line answer instead.
        </p>
        <div className="mt-4 rounded-2xl bg-paper p-4 text-center">
          <div className="text-sm text-ink-700">Put <MathText text="x = 2" /> into the polynomial</div>
          <div className="mt-2 text-lg font-bold text-ink-900">
            <MathText text="8 − 12 + 8 − 4 = 0" />
          </div>
          <div className="mt-1 text-sm font-bold text-ok-600">so yes, it is a factor</div>
        </div>
        <div className="mt-4"><PrimaryButton onClick={() => go(2)}>That cannot be right</PrimaryButton></div>
      </Step>

      <Step n={2} title="What a remainder really is" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <p className="text-ink-700">
          Any division can be written out in full. Dividing <MathText text="P(x)" /> by{" "}
          <MathText text="(x − a)" /> gives some quotient <MathText text="Q(x)" /> and some
          remainder <MathText text="R" />:
        </p>
        <FormulaBox><MathText text="P(x) = (x − a) * Q(x) + R" /></FormulaBox>
        <p className="text-ink-700">
          That is an identity — true for <em>every</em> value of x. So choose the most helpful value
          in the world: <MathText text="x = a" />.
        </p>
        <div className="mt-3 rounded-2xl bg-paper p-4 text-center">
          <div className="text-lg font-bold text-ink-900"><MathText text="P(a) = (a − a) * Q(a) + R" /></div>
          <div className="my-1 text-sm font-semibold text-brand-600">↓ the bracket is zero, so the whole first term vanishes</div>
          <div className="text-lg font-bold text-ok-600"><MathText text="P(a) = R" /></div>
        </div>
        <KeyIdea>
          Substituting <MathText text="a" /> hands you the remainder directly. And a factor is
          exactly a divisor with remainder zero — so <MathText text="P(a) = 0" /> means{" "}
          <MathText text="(x − a)" /> is a factor.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(3)}>Which number do I substitute?</PrimaryButton></div>
      </Step>

      <Step n={3} title="The mistake almost everyone makes" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <WrongBox>to test <MathText text="(x − 3)" />, substitute <MathText text="x = −3" /></WrongBox>
        <p className="text-ink-700">
          The minus is right there in the bracket, so it gets carried across. Test the method on a
          polynomial where you can already see the answer:{" "}
          <MathText text="P(x) = x^2 − 5x + 6" />, which is <MathText text="(x − 2)(x − 3)" />. So{" "}
          <MathText text="(x − 3)" /> is definitely a factor.
        </p>
        <div className="mt-3 space-y-2">
          {[
            ["substitute x = 3", "9 − 15 + 6 = 0", "verdict: it is a factor ✓"],
            ["substitute x = −3", "9 + 15 + 6 = 30", "verdict: not a factor ✗"],
          ].map(([a, b, c]) => (
            <div key={a} className="rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-semibold text-ink-900">{a}</span>
              <span className="ml-3 text-sm text-ink-700"><MathText text={b} /></span>
              <div className="mt-0.5 text-sm font-bold text-brand-700">{c}</div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-ink-700">
          The second row reaches a conclusion you can see with your own eyes is false. So the number
          you feed in is not the one printed in the bracket — it is{" "}
          <strong>the value that makes the bracket zero</strong>.
        </p>
        <div className="mt-3 space-y-2">
          {[
            ["(x − 3)", "zero when x = 3", "test x = 3"],
            ["(x + 4)", "zero when x = −4", "test x = −4"],
            ["(x − a)", "zero when x = a", "test x = a"],
          ].map(([a, b, c]) => (
            <div key={a} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-black text-brand-700"><MathText text={a} /></span>
              <span className="text-sm text-ink-700">{b}</span>
              <span className="text-sm font-semibold text-ink-900">{c}</span>
            </div>
          ))}
        </div>
        <div className="mt-4"><PrimaryButton onClick={() => go(4)}>Use it on a cubic</PrimaryButton></div>
      </Step>

      <Step n={4} title="Worked example: factor a cubic completely" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <p className="text-ink-700">
          Factor <MathText text="P(x) = x^3 − 4x^2 + x + 6" /> completely.
        </p>
        <WorkList
          rows={[
            ["Try x = 3 (testing the factor x − 3)", "27 − 36 + 3 + 6 = 0"],
            ["Zero, so (x − 3) is a factor", "divide it out"],
            ["The quotient", "x^2 − x − 2"],
            ["Factor that the usual way", "(x − 2)(x + 1)"],
            ["Fully factored", "(x − 3)(x − 2)(x + 1)"],
          ]}
        />
        <NumberTest
          x="each root"
          rows={[
            { label: "P(3)", work: "27 − 36 + 3 + 6", value: "0", ok: true },
            { label: "P(2)", work: "8 − 16 + 2 + 6", value: "0", ok: true },
            { label: "P(−1)", work: "−1 − 4 − 1 + 6", value: "0", ok: true },
          ]}
        />
        <p className="mt-3 text-ink-700">
          Three brackets, three zeros, and each one is the number that empties its own bracket.
        </p>
        <KeyIdea>
          Which values are worth trying first? The ones that divide the constant term. Here the
          constant is 6, so ±1, ±2, ±3, ±6 are the only whole numbers with a chance.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(5)}>A remainder that is not zero</PrimaryButton></div>
      </Step>

      <Step n={5} title="The same test also gives the remainder" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">
          Take <MathText text="P(x) = x^3 − 4x^2 + x + 6" /> again and divide by{" "}
          <MathText text="(x − 1)" />.
        </p>
        <div className="mt-3 rounded-2xl bg-paper p-4 text-center">
          <div className="text-sm text-ink-700">Substitute <MathText text="x = 1" /></div>
          <div className="mt-2 text-lg font-bold text-ink-900">
            <MathText text="1 − 4 + 1 + 6 = 4" />
          </div>
          <div className="mt-1 text-sm text-ink-700">
            not zero, so <MathText text="(x − 1)" /> is <strong>not</strong> a factor — and the
            remainder is 4
          </div>
        </div>
        <p className="mt-3 text-ink-700">
          You get two answers for the price of one substitution: whether it divides, and what is left
          over if it does not.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(6)}>Your turn</PrimaryButton></div>
      </Step>

      <Step n={6} title="You try one" open={step === 6} onOpen={() => go(6)} done={false}>
        <p className="text-ink-700">
          You want to know whether <MathText text="(x + 3)" /> is a factor of{" "}
          <MathText text="x^3 + 2x^2 − 5x − 6" />.
        </p>
        <TryIt
          prompt={<>Which value of x do you substitute to find out?</>}
          accept={["-3", "−3"]}
          placeholder="a number"
          value={fade}
          setValue={setFade}
          hint="use the value that makes the bracket x + 3 equal to zero."
          explain={
            <>
              <MathText text="x = −3" />, because that empties the bracket. And{" "}
              <MathText text="P(−3) = −27 + 18 + 15 − 6 = 0" />, so it <em>is</em> a factor —
              in fact <MathText text="x^3 + 2x^2 − 5x − 6 = (x + 3)(x − 2)(x + 1)" />.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Factor and remainder theorems</div>
          <div className="mt-2">1. Dividing by <MathText text="(x − a)" /> leaves remainder <MathText text="P(a)" /></div>
          <div className="mt-1">2. <MathText text="P(a) = 0" /> means <MathText text="(x − a)" /> is a factor</div>
          <div className="mt-1">3. Substitute the value that makes the bracket zero</div>
          <div className="mt-1">4. Try the numbers that divide the constant term</div>
        </div>
        <KeyIdea>
          💡 The bracket <MathText text="(x + 3)" /> is testing <MathText text="x = −3" />. Read
          every bracket as a question: <em>what would make you disappear?</em>
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
