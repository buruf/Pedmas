"use client";

import { useState } from "react";
import { MathText } from "@/components/MathText";
import { Step, KeyIdea, FormulaBox, WrongBox } from "@/components/lesson/Step";
import { LessonShell, TryIt } from "@/components/lesson/LessonShell";
import { PrimaryButton } from "@/components/ui";

/** A rule drawn as a machine: input goes in the top, output comes out the bottom. */
function Machine({
  name,
  rule,
  input,
  output,
}: {
  name: string;
  rule: string;
  input: string;
  output: string;
}) {
  return (
    <figure className="m-0 mx-auto max-w-[220px] text-center">
      <div className="rounded-xl bg-brand-50 px-3 py-2 text-lg font-bold text-brand-800">
        <MathText text={input} />
      </div>
      <div className="mx-auto text-2xl leading-none text-ink-500">↓</div>
      <div className="rounded-2xl border-2 border-brand-300 bg-white px-3 py-4">
        <div className="text-xs font-bold uppercase tracking-wide text-brand-600">machine {name}</div>
        <div className="mt-1 text-lg font-bold text-ink-900">
          <MathText text={rule} />
        </div>
      </div>
      <div className="mx-auto text-2xl leading-none text-ink-500">↓</div>
      <div className="rounded-xl bg-ok-100 px-3 py-2 text-lg font-bold text-ok-600">
        <MathText text={output} />
      </div>
    </figure>
  );
}

/**
 * Function notation.
 *
 * Confronts the biggest single misreading in senior maths: f(x) read as
 * "f times x". The brackets look exactly like multiplication brackets, so the
 * instinct is honest — and it is disproved here by testing the method, not by
 * asserting a rule.
 */
export function FunctionNotationLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 10 · Functions · Function Notation"
      title="What f(x) actually means"
      minutes={6}
      step={step}
      total={7}
    >
      <Step n={1} title="A machine with a name" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          A vending machine takes a code and gives back a snack. Same code, same snack, every time.
        </p>
        <p className="mt-3 text-ink-700">
          Maths has machines too. You feed one a number and it hands back a number. To talk about a
          particular machine, you give it a name — usually <strong>f</strong>.
        </p>
        <div className="mt-4">
          <Machine name="f" rule="3x + 2" input="input 4" output="output 14" />
        </div>
        <div className="mt-4"><PrimaryButton onClick={() => go(2)}>Go on</PrimaryButton></div>
      </Step>

      <Step n={2} title="You already do this" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <p className="text-ink-700">
          You have been evaluating rules for years. Given <MathText text="y = 3x + 2" />, you put a
          number in for <MathText text="x" /> and work out <MathText text="y" />.
        </p>
        <div className="mt-3 space-y-2">
          {[
            ["x = 0", "y = 3(0) + 2 = 2"],
            ["x = 1", "y = 3(1) + 2 = 5"],
            ["x = 4", "y = 3(4) + 2 = 14"],
          ].map(([a, b]) => (
            <div key={a} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-bold text-ink-900"><MathText text={a} /></span>
              <span className="text-sm text-ink-700"><MathText text={b} /></span>
            </div>
          ))}
        </div>
        <KeyIdea>
          Nothing new is coming. Only a better way to <em>write down</em> what you already do.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(3)}>Show me the new writing</PrimaryButton></div>
      </Step>

      <Step n={3} title="The new notation" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">
          The same rule, named <strong>f</strong>, is written{" "}
          <MathText text="f(x) = 3x + 2" className="font-bold text-ink-900" />.
        </p>
        <p className="mt-3 text-ink-700">
          And instead of saying &ldquo;the value of <MathText text="y" /> when{" "}
          <MathText text="x" /> is 4&rdquo;, you write <MathText text="f(4)" />.
        </p>
        <p className="mt-3 text-ink-700">
          That is a real gain: <MathText text="f(4) = 14" /> says the input and the output in six
          characters, and it lets you keep two rules apart —{" "}
          <MathText text="f(4)" /> and <MathText text="g(4)" /> need not be the same number.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(4)}>But what do the brackets mean?</PrimaryButton></div>
      </Step>

      <Step n={4} title="The mistake almost everyone makes" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <WrongBox>
          <MathText text="f(x)" /> means <MathText text="f * x" />
        </WrongBox>
        <p className="text-ink-700">
          The instinct is completely reasonable. Everywhere else in algebra,{" "}
          <MathText text="3(x)" /> does mean <MathText text="3 * x" />. So why not here?
        </p>
        <p className="mt-3 text-ink-700">
          Let&rsquo;s test that reading instead of arguing with it. If <MathText text="f" /> were a
          number being multiplied, then doubling the input would double the output:
        </p>
        <div className="mt-3 space-y-2">
          {[
            ["If f were a multiplier", "f(2) would be exactly 2 * f(1)"],
            ["f(1) = 3(1) + 2", "= 5"],
            ["f(2) = 3(2) + 2", "= 8"],
            ["Is 8 = 2 * 5 = 10?", "no"],
          ].map(([a, b], i) => (
            <div key={i} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-semibold text-ink-900"><MathText text={a} /></span>
              <span className="text-sm font-bold text-ink-700"><MathText text={b} /></span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-ink-700">
          8 is not 10, so <MathText text="f" /> is not sitting there multiplying anything. The
          reading fails on its own terms.
        </p>
        <KeyIdea>
          <MathText text="f" /> is not a number at all. It is the <strong>name of the rule</strong>,
          and the brackets are a slot to drop the input into.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(5)}>So how do I read it?</PrimaryButton></div>
      </Step>

      <Step n={5} title="Read it as a slot" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">
          Say it out loud as <strong>&ldquo;f of 4&rdquo;</strong>, never &ldquo;f times 4&rdquo;.
          The bracket is a slot, and whatever you drop in the slot replaces every{" "}
          <MathText text="x" /> in the rule.
        </p>
        <FormulaBox>
          <MathText text="f(  ) = 3(  ) + 2" />
        </FormulaBox>
        <p className="text-ink-700">
          Fill both slots with the same thing and you are done. The slot takes anything:
        </p>
        <div className="mt-3 space-y-2">
          {[
            ["f(4)", "3(4) + 2 = 14"],
            ["f(0)", "3(0) + 2 = 2"],
            ["f(−1)", "3(−1) + 2 = −1"],
            ["f(a)", "3a + 2"],
          ].map(([a, b]) => (
            <div key={a} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-bold text-ink-900"><MathText text={a} /></span>
              <span className="text-sm text-ink-700"><MathText text={b} /></span>
            </div>
          ))}
        </div>
        <KeyIdea>
          Because <MathText text="f" /> is only a name, <MathText text="f(4)" /> and{" "}
          <MathText text="g(4)" /> can be totally different numbers. That is exactly the point of
          naming rules.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(6)}>A worked example</PrimaryButton></div>
      </Step>

      <Step n={6} title="Forwards and backwards" open={step === 6} onOpen={() => go(6)} done={step > 6}>
        <p className="text-ink-700">
          Take <MathText text="f(x) = 3x + 2" />. Two different questions get asked about it.
        </p>
        <p className="mt-4 font-bold text-ink-900">Forwards: find <MathText text="f(4)" />.</p>
        <div className="mt-2 rounded-2xl bg-paper p-4">
          <ol className="space-y-2">
            {[
              ["Drop 4 into every slot", "f(4) = 3(4) + 2"],
              ["Multiply first", "12 + 2"],
              ["Add", "14"],
            ].map(([a, b], i) => (
              <li key={i} className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 text-sm">
                <span className="text-ink-700">
                  <span className="mr-2 font-bold text-brand-600">{i + 1}.</span>
                  <MathText text={a} />
                </span>
                <span className="font-bold text-ink-900"><MathText text={b} /></span>
              </li>
            ))}
          </ol>
          <p className="mt-2 text-center font-bold text-ok-600"><MathText text="f(4) = 14" /></p>
        </div>
        <p className="mt-4 font-bold text-ink-900">
          Backwards: solve <MathText text="f(x) = 20" />.
        </p>
        <p className="mt-1 text-ink-700">
          Now you are given the output and asked for the input. The rule becomes an equation.
        </p>
        <div className="mt-2 rounded-2xl bg-paper p-4">
          <ol className="space-y-2">
            {[
              ["Write the rule equal to the output", "3x + 2 = 20"],
              ["Subtract 2", "3x = 18"],
              ["Divide by 3", "x = 6"],
            ].map(([a, b], i) => (
              <li key={i} className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 text-sm">
                <span className="text-ink-700">
                  <span className="mr-2 font-bold text-brand-600">{i + 1}.</span>
                  <MathText text={a} />
                </span>
                <span className="font-bold text-ink-900"><MathText text={b} /></span>
              </li>
            ))}
          </ol>
          <p className="mt-2 text-center text-sm text-ink-700">
            Check: <MathText text="f(6) = 3(6) + 2 = 20" /> ✓
          </p>
        </div>
        <div className="mt-4"><PrimaryButton onClick={() => go(7)}>Your turn</PrimaryButton></div>
      </Step>

      <Step n={7} title="You try one" open={step === 7} onOpen={() => go(7)} done={false}>
        <p className="text-ink-700">
          A different machine: <MathText text="g(x) = 5x − 3" className="font-bold text-ink-900" />.
        </p>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          Drop 4 into every slot: <MathText text="g(4) = 5(4) − 3" className="font-bold" />.
        </div>
        <TryIt
          prompt={<>2. Finish it. What is g(4)?</>}
          accept={["17"]}
          placeholder="a number"
          value={fade}
          setValue={setFade}
          hint="5 × 4 is 20, and you still owe the − 3."
          explain={
            <>
              <MathText text="g(4) = 20 − 3 = 17" />. Notice it is nothing like{" "}
              <MathText text="f(4) = 14" /> from before — different rule, different name, different
              answer.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Function notation</div>
          <div className="mt-2">1. f is a name, not a number — never multiply by it</div>
          <div className="mt-1">2. f(4) means &ldquo;f of 4&rdquo;: put 4 in every slot</div>
          <div className="mt-1">3. f(x) = k asks the reverse — solve for the input</div>
        </div>
        <KeyIdea>
          💡 The brackets in <MathText text="f(x)" /> hold the <strong>input</strong>. They are the
          one pair of brackets in algebra that never means multiply.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
