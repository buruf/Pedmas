"use client";

import { useState } from "react";
import { MathText } from "@/components/MathText";
import { Step, KeyIdea, WrongBox } from "@/components/lesson/Step";
import { LessonShell, EstimateCheck, TryIt } from "@/components/lesson/LessonShell";
import { BaseTen, BaseTenKey, ColumnSum } from "@/components/lesson/Models";
import { PrimaryButton } from "@/components/ui";

/**
 * 2-digit addition with regrouping, taught as a trade rather than a rule.
 *
 * The whole lesson turns on one sentence: ten ones become one ten. "Carry the
 * 1" is only meaningful once a child has seen that trade happen with blocks.
 */
export function AdditionLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 2 · Addition & Subtraction · Addition with regrouping"
      title="Adding when the ones spill over"
      minutes={5}
      step={step}
      total={7}
    >
      <Step n={1} title="A sticker problem" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          You have <strong>27</strong> stickers. Your aunt gives you <strong>15</strong> more.
        </p>
        <div className="mt-4 flex flex-col items-center gap-3">
          <BaseTen tens={2} ones={7} label="27" />
          <span className="text-2xl font-bold text-ink-500">+</span>
          <BaseTen tens={1} ones={5} label="15" />
        </div>
        <div className="mt-4"><BaseTenKey /></div>
        <EstimateCheck>
          27 is nearly 30, and 15 is a bit more than 10. So the answer should be somewhere
          around <strong>40-ish</strong>. Remember that.
        </EstimateCheck>
        <div className="mt-4"><PrimaryButton onClick={() => go(2)}>Let&rsquo;s work it out</PrimaryButton></div>
      </Step>

      <Step n={2} title="You can already do this bit" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <p className="text-ink-700">
          When nothing spills over, adding is easy. Add the ones, then add the tens.
        </p>
        <div className="mt-4"><ColumnSum top={23} bottom={14} op="+" answer={37} /></div>
        <KeyIdea>
          3 ones + 4 ones = 7 ones. 2 tens + 1 ten = 3 tens. Each column stays in its own place.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(3)}>So what&rsquo;s different?</PrimaryButton></div>
      </Step>

      <Step n={3} title="Why 27 + 15 is harder" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">Put all the ones together and count them:</p>
        <div className="mt-4 flex justify-center">
          <BaseTen ones={7} label="7 ones" />
        </div>
        <div className="my-1 text-center text-xl font-bold text-ink-500">+</div>
        <div className="flex justify-center">
          <BaseTen ones={5} label="5 ones" />
        </div>
        <p className="mt-4 text-center text-lg font-bold text-ink-900">
          7 + 5 = <span className="text-err-600">12 ones</span>
        </p>
        <p className="mt-3 text-ink-700">
          But a place can only hold the digits 0 to 9. <strong>12 is too big to sit in the ones
          column.</strong>
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(4)}>What do people try?</PrimaryButton></div>
      </Step>

      <Step n={4} title="The mistake almost everyone makes" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <p className="text-ink-700">Lots of people write the 12 straight into the answer:</p>
        <WrongBox>27 + 15 = 312</WrongBox>
        <p className="text-ink-700">
          Check it against your rough guess. You expected about <strong>40</strong> — but
          312 is <em>hundreds</em>. Something has gone badly wrong.
        </p>
        <KeyIdea>
          The 12 isn&rsquo;t 12 ones sitting in one box. It&rsquo;s <strong>1 ten and 2 ones</strong>,
          and those two parts belong in different columns.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(5)}>Show me the right way</PrimaryButton></div>
      </Step>

      <Step n={5} title="The big idea: trade ten ones for one ten" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">
          Whenever you collect <strong>ten ones</strong>, you swap them for <strong>one ten</strong>.
          Same amount — tidier.
        </p>
        <div className="mt-4 flex flex-col items-center gap-2">
          <BaseTen ones={9} ringOnes={5} label="12 ones — ring ten of them" />
          <span className="text-sm font-bold text-brand-600">↓ trade</span>
          <BaseTen tens={1} ones={2} label="1 ten and 2 ones" />
        </div>
        <KeyIdea>
          Nothing was added or lost. Ten small cubes became one rod. That swap is the whole
          trick — it&rsquo;s what &ldquo;carrying&rdquo; means.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(6)}>Finish the problem</PrimaryButton></div>
      </Step>

      <Step n={6} title="Now write it down" open={step === 6} onOpen={() => go(6)} done={step > 6}>
        <div className="rounded-2xl bg-paper p-4">
          <ColumnSum top={27} bottom={15} op="+" carries={{ 1: "1" }} answer={42} highlight={0} />
        </div>
        <ol className="mt-4 space-y-2">
          {[
            "Add the ones: 7 + 5 = 12.",
            "12 is 1 ten and 2 ones. Write the 2 in the ones column, and carry the 1 ten above the tens column.",
            "Add the tens, including the one you carried: 2 + 1 + 1 = 4 tens.",
            "The answer is 42 — right where your rough guess said it would be. ✓",
          ].map((s, i) => (
            <li key={i} className="flex gap-3 rounded-xl bg-white px-3 py-2 text-sm text-ink-700">
              <span className="font-bold text-brand-600">{i + 1}.</span>
              <span>{s}</span>
            </li>
          ))}
        </ol>
        <div className="mt-4 flex justify-center">
          <BaseTen tens={4} ones={2} label="42" />
        </div>
        <div className="mt-4"><PrimaryButton onClick={() => go(7)}>Your turn</PrimaryButton></div>
      </Step>

      <Step n={7} title="You try one — I'll start it" open={step === 7} onOpen={() => go(7)} done={false}>
        <p className="text-ink-700">Same idea, new numbers.</p>
        <div className="mt-3 rounded-2xl bg-paper p-4">
          <ColumnSum top={38} bottom={24} op="+" highlight={0} />
        </div>
        <div className="mt-3 rounded-xl bg-white px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          Add the ones: 8 + 4 = <strong>12</strong>. That&rsquo;s 1 ten and 2 ones — so 2 goes in
          the ones column and 1 ten carries across.
        </div>
        <TryIt
          prompt={<>2. Now add the tens, including the carried one. What is the whole answer?</>}
          accept={["62"]}
          placeholder="the full answer"
          value={fade}
          setValue={setFade}
          hint="add 3 tens + 2 tens + the 1 ten you carried, then put the 2 ones on the end."
          explain={
            <>
              3 + 2 + 1 = 6 tens, and 2 ones left over, so <strong>62</strong>. A rough check
              agrees: 38 is nearly 40, 24 is nearly 25, and 40 + 25 is about 65.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">To add bigger numbers</div>
          <div className="mt-2">1. Start with the ones</div>
          <div className="mt-1">2. Ten ones become one ten — carry it</div>
          <div className="mt-1">3. Then add the tens</div>
        </div>
        <KeyIdea>
          💡 A digit can never be bigger than 9 in its column. If it is, you have a trade to make.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
