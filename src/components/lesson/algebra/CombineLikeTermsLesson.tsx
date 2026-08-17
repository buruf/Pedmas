"use client";

import { useState } from "react";
import { MathText } from "@/components/MathText";
import { Step, KeyIdea, WrongBox } from "@/components/lesson/Step";
import { LessonShell, TryIt } from "@/components/lesson/LessonShell";
import { PrimaryButton } from "@/components/ui";

/** Numbered working, one line per move. */
function Work({ rows }: { rows: [string, string][] }) {
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

/**
 * Two sides of a substitution test, side by side, so a method either survives
 * the check or does not.
 */
function TestRow({
  claim,
  value,
  truth,
  ok,
}: {
  claim: string;
  value: string;
  truth: string;
  ok: boolean;
}) {
  return (
    <div
      className={`rounded-xl border-2 px-4 py-3 ${
        ok ? "border-ok-600/30 bg-ok-100" : "border-err-600/40 bg-err-100/50"
      }`}
    >
      <div className="text-sm font-semibold text-ink-700">{claim}</div>
      <div className="mt-1 text-lg font-bold text-ink-900">
        <MathText text={value} /> <span className={ok ? "text-ok-600" : "text-err-600"}>{ok ? "✓" : "✗"}</span>
      </div>
      <div className="mt-1 text-sm text-ink-700">{truth}</div>
    </div>
  );
}

/**
 * Combining like terms.
 *
 * Two errors, and both come from wanting the expression to finish. The first
 * collapses 2x + 3 into 5x because a leftover plus sign looks unfinished. The
 * second turns 3x + 2x into 5x^2 by adding the letters as well as the numbers.
 * Substituting a value kills both without ever calling the child wrong.
 */
export function CombineLikeTermsLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 7 · Algebra · Combining Like Terms"
      title="Only add what matches"
      minutes={6}
      step={step}
      total={6}
    >
      <Step n={1} title="What's in the bag" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          Three apples and two more apples is five apples. Easy. But three apples and two oranges
          is&hellip; three apples and two oranges. There is no single word for it.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <div className="rounded-xl border-2 border-brand-300 bg-brand-50 px-4 py-3 text-center">
            <div className="text-2xl">🍎🍎🍎 + 🍎🍎</div>
            <div className="mt-1 text-sm font-bold text-brand-800">= 5 apples</div>
          </div>
          <div className="rounded-xl border-2 border-ink-100 bg-white px-4 py-3 text-center">
            <div className="text-2xl">🍎🍎🍎 + 🍊🍊</div>
            <div className="mt-1 text-sm font-bold text-ink-700">stays as it is</div>
          </div>
        </div>
        <p className="mt-4 text-ink-700">
          Algebra works exactly like this. <MathText text="3x" /> and <MathText text="2x" /> are the
          same kind of thing. <MathText text="3x" /> and <MathText text="2y" /> are not.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(2)}>So what about 2x + 3?</PrimaryButton>
        </div>
      </Step>

      <Step n={2} title="The mistake almost everyone makes" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <WrongBox>
          <MathText text="2x + 3 = 5x" />
        </WrongBox>
        <p className="text-ink-700">
          It feels unfinished, sitting there with a plus sign in the middle, so it is tempting to
          squash it into one term. Test the method: if the two really are the same thing, both
          should give the same answer for any value of x.
        </p>
        <div className="mt-4 space-y-2">
          <TestRow
            claim="Put x = 4 into the real expression 2x + 3:"
            value="2(4) + 3 = 11"
            truth="Two lots of four, plus three."
            ok
          />
          <TestRow
            claim="Put x = 4 into the claim 5x:"
            value="5(4) = 20"
            truth="Not 11. So 5x is a different expression — it cannot be the same thing."
            ok={false}
          />
        </div>
        <KeyIdea>
          <MathText text="2x" /> is a number of <em>x&rsquo;s</em>. The 3 is just three. They are
          different kinds, so <MathText text="2x + 3" /> is already as simple as it gets.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(3)}>The other one</PrimaryButton>
        </div>
      </Step>

      <Step n={3} title="The second trap: adding the letters too" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <WrongBox>
          <MathText text="3x + 2x = 5x^2" />
        </WrongBox>
        <p className="text-ink-700">
          Here the instinct is to add everything in sight — the numbers <em>and</em> the letters.
          Same test, with <MathText text="x = 2" />:
        </p>
        <div className="mt-4 space-y-2">
          <TestRow
            claim="The real expression, 3x + 2x, at x = 2:"
            value="6 + 4 = 10"
            truth="Three twos plus two twos."
            ok
          />
          <TestRow
            claim="The claim 5x^2 at x = 2:"
            value="5 * 4 = 20"
            truth="Twice too big."
            ok={false}
          />
          <TestRow claim="And 5x at x = 2:" value="5 * 2 = 10" truth="That matches. 3x + 2x = 5x." ok />
        </div>
        <p className="mt-4 text-ink-700">
          Say it out loud and it stops being strange: <strong>three x&rsquo;s plus two x&rsquo;s is
          five x&rsquo;s</strong>. You are counting how many, so only the count changes. The x itself
          never gets multiplied by anything.
        </p>
        <KeyIdea>
          Adding like terms changes the number in front. It never changes the letter and never
          changes the power.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(4)}>Now a longer one</PrimaryButton>
        </div>
      </Step>

      <Step n={4} title="Sort into kinds, then add each kind" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <p className="text-ink-700">
          Terms are <strong>like</strong> when the letter part is identical — same letter,{" "}
          <em>and</em> same power. <MathText text="x" /> and <MathText text="x^2" /> are as
          different as apples and oranges.
        </p>
        <p className="mt-3 text-ink-700">
          Simplify <MathText text="4x + 7 + 3x + 2" />.
        </p>
        <Work
          rows={[
            ["The x terms: 4x + 3x", "7x"],
            ["The plain numbers: 7 + 2", "9"],
            ["Put them back together", "7x + 9"],
          ]}
        />
        <p className="mt-3 text-ink-700">
          Check with <MathText text="x = 2" />: the original gives 8 + 7 + 6 + 2 = <strong>23</strong>,
          and <MathText text="7x + 9" /> gives 14 + 9 = <strong>23</strong>. ✓
        </p>
        <KeyIdea>
          Simplifying never changes what an expression is worth. It only makes it shorter — which is
          exactly why substituting a number is a fair test.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(5)}>With minus signs</PrimaryButton>
        </div>
      </Step>

      <Step n={5} title="A sign belongs to the term after it" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">
          Simplify <MathText text="6x − 5 − 2x + 9" />. The trick is to read each sign as part of the
          term it sits in front of: <MathText text="+6x" />, <MathText text="−5" />,{" "}
          <MathText text="−2x" />, <MathText text="+9" />.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {[
            { t: "+6x", kind: "x" },
            { t: "−5", kind: "n" },
            { t: "−2x", kind: "x" },
            { t: "+9", kind: "n" },
          ].map((c) => (
            <span
              key={c.t}
              className={`rounded-xl px-3 py-1.5 text-base font-bold ${
                c.kind === "x" ? "bg-brand-100 text-brand-800" : "bg-warn-100 text-ink-900"
              }`}
            >
              <MathText text={c.t} />
            </span>
          ))}
        </div>
        <Work
          rows={[
            ["x terms: 6x − 2x", "4x"],
            ["Numbers: −5 + 9", "4"],
            ["Together", "4x + 4"],
          ]}
        />
        <p className="mt-3 text-ink-700">
          Check with <MathText text="x = 3" />: 18 − 5 − 6 + 9 = <strong>16</strong>, and{" "}
          <MathText text="4x + 4" /> gives 12 + 4 = <strong>16</strong>. ✓
        </p>
        <KeyIdea>
          If you drag a term across the expression, its sign travels with it. Losing the sign is what
          turns a right method into a wrong answer.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(6)}>Your turn</PrimaryButton>
        </div>
      </Step>

      <Step n={6} title="You try one" open={step === 6} onOpen={() => go(6)} done={false}>
        <p className="text-ink-700">
          Simplify <MathText text="9x + 4 − 3x + 1" />.
        </p>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          The plain numbers: <MathText text="4 + 1 = 5" />, so the answer ends <MathText text="+ 5" />.
        </div>
        <TryIt
          prompt={<>2. Now the x terms. How many x&rsquo;s are left?</>}
          accept={["6"]}
          placeholder="just the number"
          value={fade}
          setValue={setFade}
          hint="you start with 9 x's and 3 of them are taken away."
          explain={
            <>
              Nine x&rsquo;s take away three x&rsquo;s leaves <strong>6x</strong>, so the whole thing
              simplifies to <MathText text="6x + 5" />. Check at <MathText text="x = 2" />: 18 + 4 −
              6 + 1 = 17, and 12 + 5 = 17. ✓
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Combining like terms</div>
          <div className="mt-2">1. Like means same letter AND same power</div>
          <div className="mt-1">2. Attach each sign to the term in front of it</div>
          <div className="mt-1">3. Add the numbers in front — the letter never changes</div>
          <div className="mt-1">4. Unlike terms stay where they are</div>
        </div>
        <KeyIdea>
          💡 An expression with a + still in it is not unfinished. <MathText text="2x + 3" /> is the
          answer — there is nothing left that matches.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
