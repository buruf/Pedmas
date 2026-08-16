"use client";

import { useState } from "react";
import { Step, KeyIdea, WrongBox } from "@/components/lesson/Step";
import { LessonShell, EstimateCheck, TryIt } from "@/components/lesson/LessonShell";
import { HundredGrid } from "@/components/lesson/Models";
import { PrimaryButton } from "@/components/ui";

/**
 * Multiplying decimals.
 *
 * Confronts the belief carried over from whole numbers that multiplying
 * always makes a number bigger. Multiplying by something less than one makes
 * it smaller, and until a child accepts that, every decimal product looks
 * wrong to them and they "correct" it.
 */
export function DecimalMulLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 5 · Decimals · Decimal Multiplication"
      title="Multiplying by less than one"
      minutes={5}
      step={step}
      total={6}
    >
      <Step n={1} title="A surprising question" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          Half of a half. Or written another way: <strong>0.5 × 0.5</strong>.
        </p>
        <p className="mt-3 text-ink-700">
          Your instinct probably says multiplying makes things bigger. Watch what happens.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(2)}>Show me</PrimaryButton></div>
      </Step>

      <Step n={2} title="Half of a half is a quarter" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <div className="mt-2 flex flex-wrap justify-center gap-6">
          <HundredGrid shaded={50} label="0.5 — half the square" size={130} />
          <HundredGrid shaded={25} label="half of that half = 0.25" size={130} shade="tens" />
        </div>
        <p className="mt-4 text-center text-lg font-bold text-ok-600">0.5 × 0.5 = 0.25</p>
        <KeyIdea>
          The answer is <strong>smaller</strong> than what you started with. Taking a fraction
          <em> of</em> something gives you less of it — &ldquo;of&rdquo; is what × means here.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(3)}>Why does that feel wrong?</PrimaryButton></div>
      </Step>

      <Step n={3} title="The mistake almost everyone makes" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <WrongBox>&ldquo;Multiplying always makes a number bigger&rdquo;</WrongBox>
        <p className="text-ink-700">
          True for whole numbers bigger than 1 — and only those. The real rule depends on what you
          multiply by:
        </p>
        <div className="mt-3 space-y-2">
          {[
            ["× a number bigger than 1", "gets bigger", "8 × 2 = 16"],
            ["× exactly 1", "unchanged", "8 × 1 = 8"],
            ["× a number less than 1", "gets smaller", "8 × 0.5 = 4"],
          ].map(([a, b, c]) => (
            <div key={a} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-semibold text-ink-900">{a}</span>
              <span className="text-sm text-brand-700">{b}</span>
              <span className="text-sm text-ink-500">{c}</span>
            </div>
          ))}
        </div>
        <div className="mt-4"><PrimaryButton onClick={() => go(4)}>How do I work them out?</PrimaryButton></div>
      </Step>

      <Step n={4} title="Ignore the point, then put it back" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <p className="text-ink-700">
          Multiply as if the points were not there, then count how many decimal places went in —
          the same number come out.
        </p>
        <div className="mt-4 rounded-2xl bg-paper p-4">
          <ol className="space-y-2">
            {[
              ["Work out 0.5 × 0.5 as 5 × 5", "= 25"],
              ["Count the places going in: 1 + 1", "= 2 places"],
              ["Put 2 places into the answer", "0.25"],
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
        <EstimateCheck>
          Always sanity-check the size. 0.5 of a half must be under a half — and 0.25 is. If you
          had written 2.5, the estimate would have caught it.
        </EstimateCheck>
        <div className="mt-4"><PrimaryButton onClick={() => go(5)}>A bigger one</PrimaryButton></div>
      </Step>

      <Step n={5} title="The same method, bigger numbers" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">Work out <strong>1.2 × 0.4</strong>.</p>
        <div className="mt-3 rounded-2xl bg-paper p-4">
          <ol className="space-y-2">
            {[
              ["Ignore the points: 12 × 4", "= 48"],
              ["Places going in: 1 + 1", "= 2"],
              ["Answer with 2 places", "0.48"],
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
        <p className="mt-3 text-ink-700">
          Sensible? 0.4 is a bit less than half, and a bit less than half of 1.2 is about 0.5. ✓
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(6)}>Your turn</PrimaryButton></div>
      </Step>

      <Step n={6} title="You try one" open={step === 6} onOpen={() => go(6)} done={false}>
        <p className="text-ink-700">Work out <strong>0.3 × 0.6</strong>.</p>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          Ignore the points: 3 × 6 = <strong>18</strong>. Two decimal places went in.
        </div>
        <TryIt
          prompt={<>2. Put two decimal places back into 18. What is 0.3 × 0.6?</>}
          accept={["0.18", ".18"]}
          placeholder="like 0.18"
          value={fade}
          setValue={setFade}
          hint="two places means the 18 becomes 0.18, not 1.8."
          explain={
            <>
              <strong>0.18</strong>. Both numbers were under 1, so the answer had to be smaller
              than either of them — and it is.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Multiplying decimals</div>
          <div className="mt-2">1. Multiply as if there were no points</div>
          <div className="mt-1">2. Count the decimal places going in</div>
          <div className="mt-1">3. Put the same number of places in the answer</div>
        </div>
        <KeyIdea>
          💡 Multiplying by less than 1 makes things <strong>smaller</strong>. Estimate first and a
          misplaced point becomes obvious.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}

/**
 * Dividing decimals — the mirror surprise: dividing by less than one makes a
 * number bigger, because you are asking how many small pieces fit inside.
 */
export function DecimalDivLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 5 · Decimals · Decimal Division"
      title="Dividing by less than one"
      minutes={5}
      step={step}
      total={5}
    >
      <Step n={1} title="How many halves in six?" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          You have <strong>6</strong> pizzas and cut each into halves. How many half-pizzas?
        </p>
        <p className="mt-3 text-ink-700">
          Twelve, obviously. And that question is exactly <strong>6 ÷ 0.5</strong>.
        </p>
        <div className="my-3 rounded-xl bg-ink-900 px-4 py-4 text-center text-2xl font-bold text-white">
          6 ÷ 0.5 = 12
        </div>
        <KeyIdea>
          Dividing made it <strong>bigger</strong>. That is not a trick — you were counting how
          many small pieces fit inside, and small pieces go a long way.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(2)}>Why does that feel wrong?</PrimaryButton></div>
      </Step>

      <Step n={2} title="The mistake almost everyone makes" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <WrongBox>&ldquo;Dividing always makes a number smaller&rdquo;</WrongBox>
        <p className="text-ink-700">
          Only when you divide by something bigger than 1. Read the sum as{" "}
          <strong>&ldquo;how many of these fit inside?&rdquo;</strong> and it stops being strange:
          how many 0.5s fit in 6? Twelve.
        </p>
        <div className="mt-3 space-y-2">
          {[
            ["÷ a number bigger than 1", "gets smaller", "6 ÷ 2 = 3"],
            ["÷ exactly 1", "unchanged", "6 ÷ 1 = 6"],
            ["÷ a number less than 1", "gets bigger", "6 ÷ 0.5 = 12"],
          ].map(([a, b, c]) => (
            <div key={a} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-semibold text-ink-900">{a}</span>
              <span className="text-sm text-brand-700">{b}</span>
              <span className="text-sm text-ink-500">{c}</span>
            </div>
          ))}
        </div>
        <div className="mt-4"><PrimaryButton onClick={() => go(3)}>How do I work them out?</PrimaryButton></div>
      </Step>

      <Step n={3} title="Make the divider a whole number" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">
          Dividing by a decimal is awkward, so move the point until it isn&rsquo;t — as long as you
          move <strong>both</strong> numbers the same way, the answer is unchanged.
        </p>
        <div className="mt-4 rounded-2xl bg-paper p-4 text-center">
          <div className="text-lg font-bold text-ink-900">7.2 ÷ 0.8</div>
          <div className="my-2 text-sm font-semibold text-brand-600">↓ move both one place right</div>
          <div className="text-lg font-bold text-ok-600">72 ÷ 8 = 9</div>
        </div>
        <KeyIdea>
          Both numbers grew ten times, so the answer stays the same — just as 6 ÷ 2 and 60 ÷ 20
          both give 3.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(4)}>Another</PrimaryButton></div>
      </Step>

      <Step n={4} title="One more" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <div className="rounded-2xl bg-paper p-4 text-center">
          <div className="text-lg font-bold text-ink-900">1.5 ÷ 0.25</div>
          <div className="my-2 text-sm font-semibold text-brand-600">↓ move both two places right</div>
          <div className="text-lg font-bold text-ok-600">150 ÷ 25 = 6</div>
        </div>
        <p className="mt-3 text-ink-700">
          Check it makes sense: 0.25 is a quarter, and there are 4 quarters in every 1 — so 1.5
          holds 6 of them. ✓
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(5)}>Your turn</PrimaryButton></div>
      </Step>

      <Step n={5} title="You try one" open={step === 5} onOpen={() => go(5)} done={false}>
        <p className="text-ink-700">Work out <strong>4.8 ÷ 0.6</strong>.</p>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          Move both one place right: <strong>48 ÷ 6</strong>.
        </div>
        <TryIt
          prompt={<>2. Now finish it. What is 4.8 ÷ 0.6?</>}
          accept={["8"]}
          placeholder="the answer"
          value={fade}
          setValue={setFade}
          hint="6 times what makes 48?"
          explain={
            <>
              48 ÷ 6 = <strong>8</strong>. Bigger than 4.8, as expected — you divided by less than
              one. Check: 8 × 0.6 = 4.8 ✓
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Dividing decimals</div>
          <div className="mt-2">1. Read it as &ldquo;how many fit inside?&rdquo;</div>
          <div className="mt-1">2. Move both points until the divider is whole</div>
          <div className="mt-1">3. Divide as usual, then check by multiplying back</div>
        </div>
        <KeyIdea>
          💡 Dividing by less than 1 makes things <strong>bigger</strong>. It is the mirror of
          multiplying, and both follow from what the operation actually asks.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
