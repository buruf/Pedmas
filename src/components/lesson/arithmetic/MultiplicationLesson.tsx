"use client";

import { useState } from "react";
import { Step, KeyIdea, WrongBox } from "@/components/lesson/Step";
import { LessonShell, EstimateCheck, TryIt } from "@/components/lesson/LessonShell";
import { AreaModel, BaseTen } from "@/components/lesson/Models";
import { PrimaryButton } from "@/components/ui";

/**
 * 2-digit × 1-digit multiplication.
 *
 * Taught as splitting by place value rather than as a column ritual: 3 × 24 is
 * 3 lots of 20 plus 3 lots of 4. The area model makes the split visible, and
 * every piece reduces to a times-table fact the child already owns.
 */
export function MultiplicationLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 4 · Operations · Multi-digit Multiplication"
      title="Multiplying a 2-digit number"
      minutes={5}
      step={step}
      total={7}
    >
      <Step n={1} title="A pencil problem" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          There are <strong>3 boxes</strong> of pencils. Each box holds <strong>24</strong> pencils.
          How many pencils altogether?
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-xl border-2 border-dashed border-ink-300 bg-paper p-2">
              <BaseTen tens={2} ones={4} />
            </div>
          ))}
        </div>
        <p className="mt-2 text-center text-sm font-semibold text-ink-700">3 boxes of 24</p>
        <EstimateCheck>
          24 is nearly 25, and 3 × 25 = 75. So the answer should be a bit under{" "}
          <strong>75</strong>.
        </EstimateCheck>
        <div className="mt-4"><PrimaryButton onClick={() => go(2)}>Let&rsquo;s work it out</PrimaryButton></div>
      </Step>

      <Step n={2} title="You can already do this bit" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <p className="text-ink-700">You already know both of these facts:</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-paper px-4 py-3 text-center">
            <div className="text-2xl font-black text-ink-900">3 × 4 = 12</div>
            <div className="mt-1 text-xs text-ink-500">a times-table fact</div>
          </div>
          <div className="rounded-xl bg-paper px-4 py-3 text-center">
            <div className="text-2xl font-black text-ink-900">3 × 20 = 60</div>
            <div className="mt-1 text-xs text-ink-500">because 3 × 2 = 6, then tens</div>
          </div>
        </div>
        <KeyIdea>
          3 × 20 is just 3 × 2 = 6, but counting in <strong>tens</strong> instead of ones — so 6
          tens, which is 60.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(3)}>How does that help?</PrimaryButton></div>
      </Step>

      <Step n={3} title="Split the 24 into parts you know" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">
          24 is made of <strong>20 and 4</strong>. So 3 boxes of 24 is 3 lots of 20{" "}
          <em>and</em> 3 lots of 4.
        </p>
        <div className="mt-4">
          <AreaModel rows={3} parts={[20, 4]} showProducts={false} />
        </div>
        <p className="mt-3 text-center text-sm text-ink-500">
          3 rows, split into a 20 part and a 4 part
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(4)}>What do people get wrong?</PrimaryButton></div>
      </Step>

      <Step n={4} title="The mistake almost everyone makes" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <p className="text-ink-700">
          Some people multiply each digit separately and squash the results together:
        </p>
        <WrongBox>3 × 24 = 6 and 12 → 612</WrongBox>
        <p className="text-ink-700">
          Check it against the estimate. You expected a bit under <strong>75</strong> — but 612 is
          hundreds. Far too big.
        </p>
        <KeyIdea>
          The 2 in 24 isn&rsquo;t 2 — it&rsquo;s <strong>20</strong>. Treating it as 2 throws the
          place value away, and the answer with it.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(5)}>Show me the right way</PrimaryButton></div>
      </Step>

      <Step n={5} title="Multiply each part, then join them" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <div className="mt-2">
          <AreaModel rows={3} parts={[20, 4]} />
        </div>
        <ol className="mt-4 space-y-2">
          {[
            "3 lots of 20 = 60",
            "3 lots of 4 = 12",
            "Add the two parts: 60 + 12 = 72",
          ].map((s, i) => (
            <li key={i} className="flex gap-3 rounded-xl bg-white px-3 py-2 text-sm text-ink-700">
              <span className="font-bold text-brand-600">{i + 1}.</span>
              <span className="font-semibold">{s}</span>
            </li>
          ))}
        </ol>
        <p className="mt-3 text-center text-lg font-bold text-ok-600">
          72 pencils — just under 75, exactly as we predicted. ✓
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(6)}>Show the short way</PrimaryButton></div>
      </Step>

      <Step n={6} title="The short way written down" open={step === 6} onOpen={() => go(6)} done={step > 6}>
        <p className="text-ink-700">
          The column method does exactly the same two multiplications — it just records the trade
          instead of writing 60 and 12 in full.
        </p>
        <div className="mt-4 rounded-2xl bg-paper p-4 text-center">
          <table className="mx-auto border-collapse text-2xl font-bold text-ink-900">
            <tbody>
              <tr className="text-sm text-err-600"><td /><td /><td className="px-2">1</td><td /></tr>
              <tr><td /><td className="px-2">2</td><td className="px-2">4</td></tr>
              <tr className="border-b-2 border-ink-900">
                <td className="pr-1 text-ink-500">×</td><td /><td className="px-2 pb-1">3</td>
              </tr>
              <tr className="text-ok-600"><td /><td className="px-2 pt-1">7</td><td className="px-2 pt-1">2</td></tr>
            </tbody>
          </table>
        </div>
        <ol className="mt-4 space-y-2">
          {[
            "3 × 4 ones = 12 ones. Write the 2, carry the 1 ten.",
            "3 × 2 tens = 6 tens, plus the 1 ten carried = 7 tens.",
            "That's 72 — the same 60 + 12 as before.",
          ].map((s, i) => (
            <li key={i} className="flex gap-3 rounded-xl bg-white px-3 py-2 text-sm text-ink-700">
              <span className="font-bold text-brand-600">{i + 1}.</span>
              <span>{s}</span>
            </li>
          ))}
        </ol>
        <div className="mt-4"><PrimaryButton onClick={() => go(7)}>Your turn</PrimaryButton></div>
      </Step>

      <Step n={7} title="You try one — I'll start it" open={step === 7} onOpen={() => go(7)} done={false}>
        <p className="text-ink-700">Work out <strong>4 × 32</strong>.</p>
        <div className="mt-3"><AreaModel rows={4} parts={[30, 2]} showProducts={false} /></div>
        <div className="mt-3 rounded-xl bg-white px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          Split 32 into <strong>30 and 2</strong>. Then 4 × 30 = <strong>120</strong>.
        </div>
        <TryIt
          prompt={<>2. Now work out 4 × 2 and add it on. What is 4 × 32?</>}
          accept={["128"]}
          placeholder="the answer"
          value={fade}
          setValue={setFade}
          hint="4 × 2 = 8, and you already have 120. Add them."
          explain={
            <>
              120 + 8 = <strong>128</strong>. Rough check: 32 is about 30, and 4 × 30 = 120, so 128
              is right in range.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">To multiply a 2-digit number</div>
          <div className="mt-2">1. Split it into tens and ones</div>
          <div className="mt-1">2. Multiply each part on its own</div>
          <div className="mt-1">3. Add the parts together</div>
        </div>
        <KeyIdea>
          💡 Every big multiplication is just times-table facts plus place value. You never need a
          fact you haven&rsquo;t already learned.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
