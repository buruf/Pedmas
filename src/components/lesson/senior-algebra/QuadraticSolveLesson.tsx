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

/** Substitute a candidate root back into the equation and show it lands on 0. */
function RootCheck({ rows }: { rows: { root: string; work: string; value: string; ok: boolean }[] }) {
  return (
    <div className="mt-4 rounded-2xl border-2 border-ink-100 bg-white p-4">
      <div className="text-sm font-bold text-ink-900">Substitute each answer back in</div>
      <div className="mt-2 space-y-2">
        {rows.map((r) => (
          <div
            key={r.root}
            className={`flex flex-wrap items-center justify-between gap-2 rounded-xl px-3 py-2 ${
              r.ok ? "bg-ok-100" : "bg-err-100"
            }`}
          >
            <span className="text-sm font-bold text-ink-900">
              <MathText text={r.root} />
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

/**
 * Solving quadratic equations.
 *
 * Three losses of solutions get confronted: dividing both sides by x (which
 * deletes x = 0), taking a square root without the ±, and mis-signing b in the
 * formula. Every one of them is caught by the same habit — put the answer back
 * in — so the lesson makes that habit the point rather than an afterthought.
 */
export function QuadraticSolveLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 10 · Quadratics · Solving"
      title="Solving quadratic equations"
      minutes={8}
      step={step}
      total={8}
    >
      <Step n={1} title="A garden with a fixed area" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          A rectangular bed covers <strong>24 m²</strong> and is <strong>5 m longer</strong> than it
          is wide. How wide is it?
        </p>
        <p className="mt-3 text-ink-700">
          Call the width <MathText text="w" />. Then the length is <MathText text="w + 5" />, and
        </p>
        <FormulaBox><MathText text="w(w + 5) = 24" /></FormulaBox>
        <p className="text-ink-700">
          There is a <MathText text="w^2" /> hiding in there once you expand, and that changes
          everything about how you solve it.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(2)}>Why is it different?</PrimaryButton></div>
      </Step>

      <Step n={2} title="Only zero tells you anything" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <p className="text-ink-700">
          If two numbers multiply to give <strong>zero</strong>, at least one of them <em>is</em>{" "}
          zero. Nothing else can happen.
        </p>
        <FormulaBox><MathText text="AB = 0 means A = 0 or B = 0" /></FormulaBox>
        <p className="text-ink-700">
          No other number behaves this way. <MathText text="AB = 12" /> tells you nothing about A —
          it could be 12, or 3, or 0.5, or −4.
        </p>
        <WrongBox><MathText text="(x + 1)(x + 2) = 12, so x + 1 = 12" /></WrongBox>
        <KeyIdea>
          That is why every quadratic gets pushed to <strong>= 0</strong> before anything else
          happens. The zero is not tidiness, it is the whole method.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(3)}>Solve the garden</PrimaryButton></div>
      </Step>

      <Step n={3} title="The new problem" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <WorkList
          rows={[
            ["Expand", "w^2 + 5w = 24"],
            ["Push everything to one side", "w^2 + 5w − 24 = 0"],
            ["Factor: two numbers multiplying to −24, adding to 5", "8 and −3"],
            ["So", "(w + 8)(w − 3) = 0"],
            ["Each bracket could be the zero", "w = −8 or w = 3"],
          ]}
        />
        <p className="mt-3 text-ink-700">
          A width cannot be <MathText text="−8" /> metres, so the bed is <strong>3 m</strong> wide
          and 8 m long. Check: <MathText text="3 * 8 = 24" /> ✓
        </p>
        <KeyIdea>
          Two answers came out. That is normal — a quadratic asks a question with two possible
          answers, and only the <em>situation</em> can rule one out.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(4)}>A tempting shortcut</PrimaryButton></div>
      </Step>

      <Step n={4} title="The mistake almost everyone makes" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <p className="text-ink-700">
          Solve <MathText text="x^2 = 5x" />. There is an <MathText text="x" /> on both sides, so the
          obvious move is to cancel it.
        </p>
        <WrongBox><MathText text="x^2 = 5x, divide both sides by x, so x = 5" /></WrongBox>
        <p className="text-ink-700">
          <MathText text="x = 5" /> is genuinely a solution — <MathText text="25 = 25" />. But try{" "}
          <MathText text="x = 0" /> in the original.
        </p>
        <RootCheck
          rows={[
            { root: "x = 5", work: "25 = 5(5)", value: "true", ok: true },
            { root: "x = 0", work: "0 = 5(0)", value: "true", ok: true },
          ]}
        />
        <p className="mt-3 text-ink-700">
          Both work — but the shortcut only found one of them. Dividing by{" "}
          <MathText text="x" /> quietly assumes <MathText text="x" /> is not zero, and that
          assumption threw a solution away.
        </p>
        <WorkList
          rows={[
            ["Never divide by a variable — move everything over instead", "x^2 − 5x = 0"],
            ["Factor out the common x", "x(x − 5) = 0"],
            ["Either factor can be the zero", "x = 0 or x = 5"],
          ]}
        />
        <KeyIdea>
          Dividing by something that might be zero deletes an answer without warning. Factor it out
          and it stays visible.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(5)}>The other lost answer</PrimaryButton></div>
      </Step>

      <Step n={5} title="A square root has two sides" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">
          Solve <MathText text="x^2 = 9" />.
        </p>
        <WrongBox><MathText text="x = 3" /></WrongBox>
        <p className="text-ink-700">
          True, but incomplete. <MathText text="(−3)^2 = 9" /> as well, because a negative times a
          negative is positive.
        </p>
        <RootCheck
          rows={[
            { root: "x = 3", work: "3^2 = 9", value: "true", ok: true },
            { root: "x = −3", work: "(−3)^2 = 9", value: "true", ok: true },
          ]}
        />
        <FormulaBox><MathText text="x^2 = 9 gives x = ±3" /></FormulaBox>
        <KeyIdea>
          Squaring destroys the sign, so undoing it has to offer both signs back. This is the same
          reason the quadratic formula carries a <MathText text="±" />.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(6)}>Worked example</PrimaryButton></div>
      </Step>

      <Step n={6} title="Worked example: factor and solve" open={step === 6} onOpen={() => go(6)} done={step > 6}>
        <p className="text-ink-700">
          Solve <MathText text="x^2 + 2x − 15 = 0" />.
        </p>
        <WorkList
          rows={[
            ["It is already = 0, so factor", "two numbers multiplying to −15, adding to 2"],
            ["The pair", "+5 and −3"],
            ["Factored", "(x + 5)(x − 3) = 0"],
            ["Set each bracket to zero", "x = −5 or x = 3"],
          ]}
        />
        <RootCheck
          rows={[
            { root: "x = 3", work: "9 + 6 − 15", value: "0", ok: true },
            { root: "x = −5", work: "25 − 10 − 15", value: "0", ok: true },
          ]}
        />
        <p className="mt-3 text-ink-700">
          Note the signs flip: the bracket <MathText text="(x + 5)" /> gives the root{" "}
          <MathText text="x = −5" />, because that is the value making it zero.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(7)}>When it will not factor</PrimaryButton></div>
      </Step>

      <Step n={7} title="The formula, and the sign that catches people" open={step === 7} onOpen={() => go(7)} done={step > 7}>
        <FormulaBox>
          <MathText text="x = {−b ± sqrt(b^2 − 4ac)/2a}" />
        </FormulaBox>
        <p className="text-ink-700">
          Solve <MathText text="2x^2 − 7x + 3 = 0" />. Read the coefficients{" "}
          <strong>with their signs</strong>: <MathText text="a = 2" />, <MathText text="b = −7" />,{" "}
          <MathText text="c = 3" />.
        </p>
        <WorkList
          rows={[
            ["Under the root: b² − 4ac", "49 − 24 = 25"],
            ["sqrt(25)", "5"],
            ["−b is −(−7)", "+7"],
            ["So x = (7 ± 5) ÷ 4", "x = 3 or x = 0.5"],
          ]}
        />
        <p className="mt-3 text-ink-700">
          The trap is writing <MathText text="−7" /> where <MathText text="−b" /> belongs. Watch what
          that would produce:
        </p>
        <WrongBox><MathText text="x = {−7 ± 5/4}, so x = −0.5 or x = −3" /></WrongBox>
        <RootCheck
          rows={[
            { root: "x = 3", work: "2(9) − 21 + 3 = 18 − 21 + 3", value: "0", ok: true },
            { root: "x = 0.5", work: "2(0.25) − 3.5 + 3 = 0.5 − 3.5 + 3", value: "0", ok: true },
            { root: "x = −3", work: "2(9) + 21 + 3 = 18 + 21 + 3", value: "42", ok: false },
          ]}
        />
        <KeyIdea>
          <MathText text="−b" /> means &ldquo;the opposite of b&rdquo;. If{" "}
          <MathText text="b" /> is already negative, <MathText text="−b" /> is positive. And the
          substitution check catches it either way.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(8)}>Your turn</PrimaryButton></div>
      </Step>

      <Step n={8} title="You try one" open={step === 8} onOpen={() => go(8)} done={false}>
        <p className="text-ink-700">
          Solve <MathText text="x^2 − 6x + 8 = 0" />.
        </p>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          The constant is positive and the middle is negative, so both numbers are negative. They
          multiply to 8 and add to −6: that is <MathText text="−2" /> and <MathText text="−4" />, so{" "}
          <MathText text="(x − 2)(x − 4) = 0" />.
        </div>
        <TryIt
          prompt={<>2. There are two solutions. What is the smaller one?</>}
          accept={["2"]}
          placeholder="a number"
          value={fade}
          setValue={setFade}
          hint="set each bracket to zero: x − 2 = 0 and x − 4 = 0."
          explain={
            <>
              <MathText text="x = 2" /> and <MathText text="x = 4" />. Check both:{" "}
              <MathText text="4 − 12 + 8 = 0" /> ✓ and <MathText text="16 − 24 + 8 = 0" /> ✓
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Solving a quadratic</div>
          <div className="mt-2">1. Get everything on one side, = 0</div>
          <div className="mt-1">2. Factor if you can; otherwise use the formula</div>
          <div className="mt-1">3. Never divide both sides by a variable</div>
          <div className="mt-1">4. Expect <em>two</em> answers, and substitute both back</div>
        </div>
        <KeyIdea>
          💡 Every error in this lesson loses a solution rather than producing a wrong one. That is
          why checking how <strong>many</strong> answers you have matters as much as checking each
          one.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
