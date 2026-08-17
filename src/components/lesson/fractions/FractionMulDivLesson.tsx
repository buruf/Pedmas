"use client";

import { useState } from "react";
import { MathText } from "@/components/MathText";
import { Step, KeyIdea, WrongBox } from "@/components/lesson/Step";
import { LessonShell, TryIt } from "@/components/lesson/LessonShell";
import { FractionBar, FractionArea } from "@/components/lesson/FractionBar";
import { PrimaryButton } from "@/components/ui";

/**
 * Multiplying fractions.
 *
 * Two misconceptions collide here. The first is carried over from addition —
 * that a common denominator is needed. The second is carried over from whole
 * numbers — that multiplying makes things bigger. The area model answers both
 * at once, because the grid visibly has denominator × denominator pieces.
 */
export function FractionMulLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 5 · Fractions · Multiplication of Fractions"
      title="Multiplying fractions means 'of'"
      minutes={5}
      step={step}
      total={6}
    >
      <Step n={1} title="Half of a third" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          There is <MathText text="{1/3}" /> of a cake left. You eat <strong>half of it</strong>.
          How much of the whole cake did you eat?
        </p>
        <div className="mt-4 flex justify-center">
          <FractionArea cols={3} colsShaded={1} rows={2} rowsShaded={1} label="{1/2} of {1/3}" />
        </div>
        <p className="mt-4 text-ink-700">
          The grid is cut into 3 columns and 2 rows — <strong>6 pieces</strong>. You ate one of
          them.
        </p>
        <div className="my-3 rounded-xl bg-ink-900 px-4 py-3 text-center text-xl font-bold text-white">
          <MathText text="{1/2} × {1/3} = {1/6}" />
        </div>
        <div className="mt-4"><PrimaryButton onClick={() => go(2)}>Why 6?</PrimaryButton></div>
      </Step>

      <Step n={2} title="The bottoms multiply because the cuts multiply" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <p className="text-ink-700">
          Cutting into 3 one way and 2 the other makes 3 × 2 = 6 pieces. That is the whole reason
          you multiply the denominators — no rule to memorise.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-6">
          <FractionArea cols={4} colsShaded={3} rows={2} rowsShaded={1} label="{1/2} of {3/4} = {3/8}" size={130} />
          <FractionArea cols={5} colsShaded={2} rows={3} rowsShaded={2} label="{2/3} of {2/5} = {4/15}" size={130} />
        </div>
        <KeyIdea>
          The word <strong>&ldquo;of&rdquo;</strong> means multiply. Half <em>of</em> a third, two
          thirds <em>of</em> two fifths.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(3)}>What goes wrong?</PrimaryButton></div>
      </Step>

      <Step n={3} title="The two mistakes people make" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <WrongBox>&ldquo;I need a common denominator first&rdquo;</WrongBox>
        <p className="text-ink-700">
          That is the rule for <em>adding</em>. Multiplying needs no common denominator at all —
          you just multiply straight across.
        </p>
        <WrongBox>&ldquo;Multiplying makes it bigger&rdquo;</WrongBox>
        <p className="text-ink-700">
          Taking a fraction <em>of</em> something gives you <strong>less</strong> than you started
          with. Half of a third is smaller than a third.
        </p>
        <div className="mt-3 flex flex-col items-center gap-2">
          <FractionBar parts={3} shaded={1} shade="teal" label="{1/3} — what you started with" />
          <FractionBar parts={6} shaded={1} shade="brand" label="{1/6} — after taking half of it" />
        </div>
        <div className="mt-4"><PrimaryButton onClick={() => go(4)}>Show me the method</PrimaryButton></div>
      </Step>

      <Step n={4} title="Multiply straight across" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <div className="rounded-2xl bg-paper p-4">
          <ol className="space-y-2">
            {[
              ["Multiply the tops", "2 × 3 = 6"],
              ["Multiply the bottoms", "5 × 4 = 20"],
              ["That gives", "{6/20}"],
              ["Simplify by dividing both by 2", "{3/10}"],
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
        </div>
        <p className="mt-3 text-center text-sm text-ink-700">
          <MathText text="{2/5} × {3/4} = {3/10}" />
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(5)}>With a whole number</PrimaryButton></div>
      </Step>

      <Step n={5} title="Multiplying by a whole number" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">
          Every whole number is a fraction with 1 underneath. So <MathText text="{2/3} × 4" /> is{" "}
          <MathText text="{2/3} × {4/1}" />.
        </p>
        <div className="mt-3 rounded-xl bg-paper px-4 py-3 text-center font-bold text-ink-900">
          <MathText text="{2/3} × {4/1} = {8/3} = 2 {2/3}" />
        </div>
        <KeyIdea>
          Here the answer <em>is</em> bigger — because you multiplied by 4, which is more than 1.
          The size of the multiplier decides, not the fact that it is multiplication.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(6)}>Your turn</PrimaryButton></div>
      </Step>

      <Step n={6} title="You try one" open={step === 6} onOpen={() => go(6)} done={false}>
        <p className="text-ink-700">
          Work out <MathText text="{1/2} × {2/5}" />.
        </p>
        <div className="mt-3 flex justify-center">
          <FractionArea cols={5} colsShaded={2} rows={2} rowsShaded={1} label="{1/2} of {2/5}" size={130} />
        </div>
        <TryIt
          prompt={<>Multiply straight across, then simplify:</>}
          accept={["1/5", "2/10"]}
          placeholder="like 1/5"
          value={fade}
          setValue={setFade}
          hint="tops: 1 × 2 = 2. Bottoms: 2 × 5 = 10. Then simplify 2/10."
          explain={
            <>
              <MathText text="{2/10}" />, which simplifies to <MathText text="{1/5}" />. Smaller
              than <MathText text="{2/5}" />, as it must be — you took half of it.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Multiplying fractions</div>
          <div className="mt-2">1. No common denominator needed</div>
          <div className="mt-1">2. Tops × tops, bottoms × bottoms</div>
          <div className="mt-1">3. Simplify at the end</div>
        </div>
        <KeyIdea>
          💡 &ldquo;Of&rdquo; means ×. And multiplying by less than 1 always gives you less.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}

/**
 * Dividing fractions — "keep, change, flip" is taught only after the child has
 * seen why there are four quarters in every whole, so the rule records a fact
 * rather than replacing one.
 */
export function FractionDivLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 5 · Fractions · Division of Fractions"
      title="Dividing by a fraction"
      minutes={5}
      step={step}
      total={5}
    >
      <Step n={1} title="How many quarters in 2 pizzas?" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          Two pizzas, cut into quarters. How many slices?
        </p>
        <div className="mt-4 flex flex-col items-center gap-2">
          <FractionBar parts={4} shaded={4} shade="brand" label="pizza 1" />
          <FractionBar parts={4} shaded={4} shade="teal" label="pizza 2" />
        </div>
        <p className="mt-4 text-center text-lg font-bold text-ok-600">8 slices</p>
        <p className="mt-2 text-ink-700">
          And that question is exactly <MathText text="2 ÷ {1/4}" />.
        </p>
        <KeyIdea>
          Dividing asks <strong>&ldquo;how many of these fit inside?&rdquo;</strong> Small pieces
          fit many times, so the answer got bigger.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(2)}>Why does that feel wrong?</PrimaryButton></div>
      </Step>

      <Step n={2} title="The mistake almost everyone makes" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <WrongBox>&ldquo;Dividing always makes it smaller&rdquo;</WrongBox>
        <p className="text-ink-700">
          Only when dividing by something bigger than 1. Dividing by a fraction gives a{" "}
          <strong>bigger</strong> answer, because you are counting how many little pieces fit.
        </p>
        <div className="mt-3 space-y-2">
          {[
            ["6 ÷ 2", "3 — fewer, because 2 is bigger than 1"],
            ["6 ÷ 1", "6 — unchanged"],
            ["6 ÷ {1/2}", "12 — more, because halves are small"],
          ].map(([a, b]) => (
            <div key={a} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="font-bold text-ink-900"><MathText text={a} /></span>
              <span className="text-sm text-ink-700"><MathText text={b} /></span>
            </div>
          ))}
        </div>
        <div className="mt-4"><PrimaryButton onClick={() => go(3)}>Where does flipping come from?</PrimaryButton></div>
      </Step>

      <Step n={3} title="Why you flip the second fraction" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">
          There are <strong>4</strong> quarters in every whole. So asking &ldquo;how many quarters
          in 2?&rdquo; is the same as asking &ldquo;what is 2 × 4?&rdquo;
        </p>
        <div className="my-3 rounded-xl bg-ink-900 px-4 py-4 text-center text-lg font-bold text-white">
          <MathText text="2 ÷ {1/4} = 2 × 4 = 8" />
        </div>
        <KeyIdea>
          Dividing by <MathText text="{1/4}" /> and multiplying by 4 are the same question. Flipping
          the fraction is just writing that down.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(4)}>The method</PrimaryButton></div>
      </Step>

      <Step n={4} title="Keep, change, flip" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <div className="rounded-2xl bg-paper p-4">
          <ol className="space-y-2">
            {[
              ["Keep the first fraction", "{3/4}"],
              ["Change ÷ into ×", "×"],
              ["Flip the second", "{2/1}"],
              ["Multiply across, then simplify", "{6/4} = {3/2} = 1 {1/2}"],
            ].map(([a, b], i) => (
              <li key={i} className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 text-sm">
                <span className="text-ink-700">
                  <span className="mr-2 font-bold text-brand-600">{i + 1}.</span>
                  {a}
                </span>
                <span className="font-bold text-ink-900"><MathText text={b} /></span>
              </li>
            ))}
          </ol>
        </div>
        <p className="mt-3 text-center text-sm text-ink-700">
          <MathText text="{3/4} ÷ {1/2} = 1 {1/2}" /> — there really are one and a half halves in
          three quarters.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(5)}>Your turn</PrimaryButton></div>
      </Step>

      <Step n={5} title="You try one" open={step === 5} onOpen={() => go(5)} done={false}>
        <p className="text-ink-700">
          Work out <MathText text="{1/2} ÷ {1/6}" /> — how many sixths fit inside a half?
        </p>
        <div className="mt-3 flex flex-col items-center gap-2">
          <FractionBar parts={2} shaded={1} shade="brand" label="{1/2}" />
          <FractionBar parts={6} shaded={3} shade="teal" label="the same amount, in sixths" />
        </div>
        <TryIt
          prompt={<>How many sixths fit in a half?</>}
          accept={["3"]}
          placeholder="a number"
          value={fade}
          setValue={setFade}
          hint="keep, change, flip: 1/2 × 6/1."
          explain={
            <>
              <MathText text="{1/2} × {6/1} = {6/2} = 3" />. The picture agrees — three sixths
              shade exactly the same amount as one half.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Dividing fractions</div>
          <div className="mt-2">1. Ask &ldquo;how many fit inside?&rdquo;</div>
          <div className="mt-1">2. Keep, change, flip</div>
          <div className="mt-1">3. Multiply across and simplify</div>
        </div>
        <KeyIdea>
          💡 Dividing by a fraction gives a bigger answer. If yours came out smaller, you probably
          forgot to flip.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
