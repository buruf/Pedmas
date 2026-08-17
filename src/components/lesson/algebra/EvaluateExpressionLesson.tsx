"use client";

import { useState } from "react";
import { MathText } from "@/components/MathText";
import { Step, KeyIdea, WrongBox } from "@/components/lesson/Step";
import { LessonShell, TryIt } from "@/components/lesson/LessonShell";
import { PrimaryButton } from "@/components/ui";

/** Numbered working, laid out so each line shows what changed and what it became. */
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

/** Three dashed groups of four counters — "3 lots of 4", the meaning of 3x. */
function Lots({ groups, each }: { groups: number; each: number }) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {Array.from({ length: groups }, (_, g) => (
        <div key={g} className="rounded-xl border-2 border-dashed border-ink-300 bg-paper px-3 py-2 text-center">
          <div className="text-lg font-black text-brand-700">{each}</div>
        </div>
      ))}
    </div>
  );
}

/**
 * Evaluating an expression.
 *
 * Two errors do nearly all the damage. The first is reading 3x with x = 4 as
 * the digits "34" — the notation genuinely looks like that, so the lesson
 * never calls it silly, it shows what sitting side by side actually means.
 * The second is squaring the whole term in 3x^2 instead of only the x.
 */
export function EvaluateExpressionLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 6 · Algebra · Evaluating Expressions"
      title="What a letter is worth"
      minutes={6}
      step={step}
      total={6}
    >
      <Step n={1} title="Movie night" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          Tickets are <strong>$9</strong> each, and the site adds a <strong>$4</strong> booking fee
          to the whole order — once, no matter how many tickets you buy.
        </p>
        <p className="mt-3 text-ink-700">
          Rather than write that out every time, you write the cost of <MathText text="n" /> tickets
          as:
        </p>
        <div className="my-4 rounded-xl bg-ink-900 px-4 py-4 text-center text-2xl font-bold text-white">
          9n + 4
        </div>
        <p className="text-ink-700">
          The letter is a placeholder. Three of you are going, so <MathText text="n" /> is worth 3.
          What does the order cost?
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(2)}>Work it out</PrimaryButton>
        </div>
      </Step>

      <Step n={2} title="The mistake almost everyone makes" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <WrongBox>
          <MathText text="3x" /> with <MathText text="x = 4" /> &nbsp;→&nbsp; &ldquo;34&rdquo;
        </WrongBox>
        <p className="text-ink-700">
          It is a fair reading — the 3 and the 4 end up written next to each other, and that is
          exactly how we write thirty-four. But in algebra, a number sitting against a letter has
          always meant one thing: <strong>multiply</strong>.
        </p>
        <p className="mt-3 text-ink-700">
          <MathText text="3x" /> is <em>three lots of x</em>. If x is worth 4:
        </p>
        <div className="mt-3">
          <Lots groups={3} each={4} />
        </div>
        <p className="mt-3 text-center text-lg font-bold text-ok-600">4 + 4 + 4 = 12, not 34</p>
        <p className="mt-4 text-ink-700">So the movie tickets:</p>
        <Work
          rows={[
            ["Write the value in: 9(3) + 4", "9(3) + 4"],
            ["9 lots of 3", "27 + 4"],
            ["Add the booking fee", "$31"],
          ]}
        />
        <KeyIdea>
          A number written against a letter always means multiply. <MathText text="9n" /> is 9 × n,
          never the digits 9 and n pushed together.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(3)}>Now the method</PrimaryButton>
        </div>
      </Step>

      <Step n={3} title="Swap the letter, then follow the usual rules" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">
          Evaluating is two moves: put the value in, then work out the arithmetic in the normal
          order. Nothing new — substitution just hands you an ordinary sum.
        </p>
        <p className="mt-3 text-ink-700">
          Evaluate <MathText text="5x + 7" /> when <MathText text="x = 6" />.
        </p>
        <Work
          rows={[
            ["Replace x with 6", "5(6) + 7"],
            ["Multiply before adding", "30 + 7"],
            ["Answer", "37"],
          ]}
        />
        <p className="mt-4 text-ink-700">
          Brackets change which part goes first. Evaluate <MathText text="4(x + 3)" /> when{" "}
          <MathText text="x = 5" />.
        </p>
        <Work
          rows={[
            ["Replace x with 5", "4(5 + 3)"],
            ["Inside the brackets first", "4(8)"],
            ["Answer", "32"],
          ]}
        />
        <KeyIdea>
          Substituting does not change the order of operations. It just turns letters into numbers
          so the usual order can run.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(4)}>The other trap</PrimaryButton>
        </div>
      </Step>

      <Step n={4} title="The little 2 belongs to the letter only" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <p className="text-ink-700">
          Evaluate <MathText text="3x^2" /> when <MathText text="x = 4" />. Lots of people multiply
          first and square the lot:
        </p>
        <WrongBox>
          <MathText text="3x^2 = (3 * 4)^2 = 12^2 = 144" />
        </WrongBox>
        <p className="text-ink-700">
          Look at where the little 2 is sitting. It is on the <strong>x</strong>, not on the 3. The
          3 is waiting outside, and powers are worked out before multiplying.
        </p>
        <Work
          rows={[
            ["Square the x first: 4^2", "16"],
            ["Now the 3 multiplies that", "3 * 16"],
            ["Answer", "48"],
          ]}
        />
        <p className="mt-3 text-ink-700">
          If you wanted the whole thing squared, the brackets would have to say so:{" "}
          <MathText text="(3x)^2" />. That one really is 144.
        </p>
        <KeyIdea>
          A power only ever applies to whatever it is touching. <MathText text="3x^2" /> means 3 ×
          x × x.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(5)}>What about negatives?</PrimaryButton>
        </div>
      </Step>

      <Step n={5} title="When the value is negative" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">
          Nothing changes except that you must keep the minus sign attached. The safe habit:{" "}
          <strong>write the value inside brackets</strong>.
        </p>
        <p className="mt-3 text-ink-700">
          Evaluate <MathText text="2x + 9" /> when <MathText text="x = −4" />.
        </p>
        <Work
          rows={[
            ["Replace x with (−4)", "2(−4) + 9"],
            ["2 lots of −4", "−8 + 9"],
            ["Answer", "1"],
          ]}
        />
        <p className="mt-4 text-ink-700">
          And a squared one. Evaluate <MathText text="x^2" /> when <MathText text="x = −3" />:
        </p>
        <Work rows={[["(−3)^2 means (−3) × (−3)", "9"]]} />
        <KeyIdea>
          A negative squared comes out positive — two minuses multiplied make a plus. Those brackets
          are what remind you the minus is part of the value.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(6)}>Your turn</PrimaryButton>
        </div>
      </Step>

      <Step n={6} title="You try one" open={step === 6} onOpen={() => go(6)} done={false}>
        <p className="text-ink-700">
          Evaluate <MathText text="x^2 + 7" /> when <MathText text="x = 4" />.
        </p>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          The power goes first: <MathText text="4^2 = 4 * 4 = 16" />.
        </div>
        <TryIt
          prompt={<>2. Now add the 7. What is the value of the expression?</>}
          accept={["23"]}
          placeholder="the answer"
          value={fade}
          setValue={setFade}
          hint="you have 16 from the square, and there is still a + 7 waiting."
          explain={
            <>
              <strong>23</strong>. The square happened first, then the addition — 16 + 7. Reading it
              as 47 would mean the 7 had been glued on instead of added.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Evaluating an expression</div>
          <div className="mt-2">1. Replace every letter with its value, in brackets</div>
          <div className="mt-1">2. Brackets, then powers</div>
          <div className="mt-1">3. Then × and ÷</div>
          <div className="mt-1">4. Then + and −</div>
        </div>
        <KeyIdea>
          💡 <MathText text="3x" /> is never two digits side by side. It is 3 × x — and once you
          swap x for its value, it is only arithmetic.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
