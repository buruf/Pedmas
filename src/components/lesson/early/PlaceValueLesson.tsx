"use client";

import { useState } from "react";
import { Step, KeyIdea, WrongBox } from "@/components/lesson/Step";
import { LessonShell, TryIt } from "@/components/lesson/LessonShell";
import { BaseTen, BaseTenKey } from "@/components/lesson/Models";
import { PrimaryButton } from "@/components/ui";

/**
 * Tens and ones.
 *
 * The idea every later arithmetic lesson leans on: a digit's position tells
 * you what it is worth. Confronts the misreading of 34 as "a 3 and a 4",
 * which is what makes column arithmetic feel arbitrary later on.
 */
export function PlaceValueLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 2 · Number Sense · Tens and Ones"
      title="What the digits in a number mean"
      minutes={5}
      step={step}
      total={6}
    >
      <Step n={1} title="Counting a big pile" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          Imagine counting <strong>34</strong> stickers one at a time. Slow — and easy to lose your
          place.
        </p>
        <div className="mt-4 flex justify-center">
          <BaseTen ones={9} label="counting one by one…" />
        </div>
        <p className="mt-4 text-ink-700">There&rsquo;s a much faster way.</p>
        <div className="mt-4"><PrimaryButton onClick={() => go(2)}>Show me</PrimaryButton></div>
      </Step>

      <Step n={2} title="Bundle them into tens" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <p className="text-ink-700">
          Group them in tens. Then you count <strong>10, 20, 30</strong> — and just four left over.
        </p>
        <div className="mt-4 flex justify-center">
          <BaseTen tens={3} ones={4} label="3 tens and 4 ones" />
        </div>
        <div className="mt-4"><BaseTenKey /></div>
        <KeyIdea>
          Counting in tens is much faster than counting in ones — and it is exactly how our
          numbers are written.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(3)}>How is it written?</PrimaryButton></div>
      </Step>

      <Step n={3} title="The place tells you the value" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <div className="my-3 flex justify-center gap-4">
          {[
            { d: "3", name: "tens", worth: "30" },
            { d: "4", name: "ones", worth: "4" },
          ].map((c) => (
            <div key={c.name} className="rounded-xl border-2 border-brand-300 bg-brand-50 px-6 py-3 text-center">
              <div className="text-3xl font-black text-ink-900">{c.d}</div>
              <div className="mt-1 text-xs font-bold uppercase text-brand-700">{c.name}</div>
              <div className="mt-1 text-sm font-semibold text-ink-700">worth {c.worth}</div>
            </div>
          ))}
        </div>
        <p className="text-ink-700">
          The <strong>3</strong> isn&rsquo;t three. It sits in the tens place, so it means{" "}
          <strong>3 tens = 30</strong>.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(4)}>What goes wrong?</PrimaryButton></div>
      </Step>

      <Step n={4} title="The mistake almost everyone makes" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <p className="text-ink-700">People read the digits as two separate little numbers:</p>
        <WrongBox>&ldquo;34 is a 3 and a 4, so it&rsquo;s about 7&rdquo;</WrongBox>
        <p className="text-ink-700">
          Test it with the blocks. Three <em>tens</em> is already 30 on its own — far more than 7.
        </p>
        <div className="mt-3 flex flex-col items-center gap-2">
          <BaseTen tens={3} ones={4} label="34 — three TENS and four ones" />
        </div>
        <KeyIdea>
          Where a digit sits changes what it is worth. That is why <strong>34</strong> and{" "}
          <strong>43</strong> are completely different numbers, even though they use the same two
          digits.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(5)}>Write it out</PrimaryButton></div>
      </Step>

      <Step n={5} title="Breaking a number apart" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <div className="my-3 rounded-xl bg-ink-900 px-4 py-4 text-center text-xl font-bold text-white">
          34 = 30 + 4
        </div>
        <p className="text-ink-700">
          Every 2-digit number splits like this. It is what lets you add and subtract them one
          column at a time later on.
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {[
            ["52", "50 + 2"],
            ["70", "70 + 0"],
            ["19", "10 + 9"],
            ["86", "80 + 6"],
          ].map(([n, split]) => (
            <div key={n} className="rounded-xl bg-paper px-3 py-2 text-center text-sm font-semibold text-ink-700">
              {n} = {split}
            </div>
          ))}
        </div>
        <div className="mt-4"><PrimaryButton onClick={() => go(6)}>Your turn</PrimaryButton></div>
      </Step>

      <Step n={6} title="You try one" open={step === 6} onOpen={() => go(6)} done={false}>
        <div className="flex justify-center">
          <BaseTen tens={4} ones={7} label="how many is this?" />
        </div>
        <TryIt
          prompt={<>Count the tens, then the ones. What number is shown?</>}
          accept={["47"]}
          placeholder="the number"
          value={fade}
          setValue={setFade}
          hint="count the tall rods in tens: 10, 20, 30, 40 — then count the small cubes."
          explain={
            <>
              4 tens is 40, and 7 ones is 7, so <strong>47</strong>. Written apart: 40 + 7.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Reading a 2-digit number</div>
          <div className="mt-2">1. The left digit counts tens</div>
          <div className="mt-1">2. The right digit counts ones</div>
          <div className="mt-1">3. Add them: tens value + ones value</div>
        </div>
        <KeyIdea>
          💡 A digit&rsquo;s place is worth more than the digit itself. This one idea is behind
          carrying, borrowing and every column method you will meet.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
