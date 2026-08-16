"use client";

import { useState } from "react";
import { Step, KeyIdea, WrongBox } from "@/components/lesson/Step";
import { LessonShell, EstimateCheck, TryIt } from "@/components/lesson/LessonShell";
import { BaseTen, BaseTenKey, ShareGroups } from "@/components/lesson/Models";
import { PrimaryButton } from "@/components/ui";

/**
 * 2-digit ÷ 1-digit division, taught as sharing by place value.
 *
 * 72 ÷ 3 is chosen deliberately: the tens do NOT share evenly, so the child
 * must break a leftover ten into ones. That is the idea long division exists
 * to record, and it mirrors the same trade used in the other three lessons.
 */
export function DivisionLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 4 · Operations · Dividing a 2-digit number"
      title="Sharing when the tens don't split evenly"
      minutes={6}
      step={step}
      total={7}
    >
      <Step n={1} title="A sticker-sharing problem" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          You have <strong>72</strong> stickers to share equally between <strong>3</strong> friends.
          How many does each friend get?
        </p>
        <div className="mt-4 flex justify-center">
          <BaseTen tens={7} ones={2} label="72 = 7 tens and 2 ones" />
        </div>
        <div className="mt-4"><BaseTenKey /></div>
        <EstimateCheck>
          3 × 20 = 60 and 3 × 30 = 90. So each friend gets somewhere{" "}
          <strong>between 20 and 30</strong>.
        </EstimateCheck>
        <div className="mt-4"><PrimaryButton onClick={() => go(2)}>Let&rsquo;s share them out</PrimaryButton></div>
      </Step>

      <Step n={2} title="Share the big pieces first" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <p className="text-ink-700">
          When you share money you hand out the notes before the coins. Same here — share the{" "}
          <strong>tens</strong> first.
        </p>
        <p className="mt-3 text-ink-700">
          But there are <strong>7 tens</strong> and only 3 friends. 7 doesn&rsquo;t split evenly
          into 3.
        </p>
        <div className="mt-4 flex justify-center">
          <BaseTen tens={7} label="7 tens to share between 3" />
        </div>
        <div className="mt-4"><PrimaryButton onClick={() => go(3)}>What do people try?</PrimaryButton></div>
      </Step>

      <Step n={3} title="The mistake almost everyone makes" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">
          Because 7 doesn&rsquo;t divide by 3, some people skip it, or divide each digit on its own:
        </p>
        <WrongBox>72 ÷ 3 → &ldquo;7 ÷ 3 doesn&rsquo;t work, so 2 ÷ 3 …&rdquo;</WrongBox>
        <p className="text-ink-700">
          Division isn&rsquo;t done digit by digit. You <em>can</em> share 7 tens — you just
          can&rsquo;t share all of them evenly, and whatever is left over doesn&rsquo;t vanish.
        </p>
        <KeyIdea>
          A leftover ten is still 10 stickers. It gets broken up and shared, not thrown away.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(4)}>Show me the right way</PrimaryButton></div>
      </Step>

      <Step n={4} title="Share what you can" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <p className="text-ink-700">
          Give each friend <strong>2 tens</strong>. That uses 6 of the 7 tens.
        </p>
        <div className="mt-4">
          <ShareGroups groups={3} tensEach={2} onesEach={0} label="2 tens each — 6 tens used" />
        </div>
        <div className="mt-4 flex justify-center">
          <BaseTen tens={1} ones={2} label="left over: 1 ten and 2 ones" />
        </div>
        <div className="mt-4"><PrimaryButton onClick={() => go(5)}>What about the leftovers?</PrimaryButton></div>
      </Step>

      <Step n={5} title="Break the leftover ten open" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">
          That spare ten is 10 stickers. Break it into <strong>ten ones</strong> and add them to the
          2 ones you already had.
        </p>
        <div className="mt-4 flex flex-col items-center gap-2">
          <BaseTen tens={1} ones={2} label="1 ten and 2 ones" />
          <span className="text-sm font-bold text-brand-600">↓ break the ten</span>
          <BaseTen ones={9} label="12 ones" />
        </div>
        <KeyIdea>
          Exactly the same trade as in subtraction — one ten becomes ten ones. Now there are{" "}
          <strong>12 ones</strong> to share between 3 friends.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(6)}>Finish sharing</PrimaryButton></div>
      </Step>

      <Step n={6} title="Share the ones and count up" open={step === 6} onOpen={() => go(6)} done={step > 6}>
        <p className="text-ink-700">12 ones shared between 3 friends is 4 ones each.</p>
        <div className="mt-4">
          <ShareGroups groups={3} tensEach={2} onesEach={4} label="each friend gets 2 tens and 4 ones = 24" />
        </div>
        <ol className="mt-4 space-y-2">
          {[
            "Share the tens: 6 tens between 3 = 2 tens each. 1 ten left over.",
            "Break the leftover ten: 10 + 2 = 12 ones.",
            "Share the ones: 12 ÷ 3 = 4 each.",
            "Each friend gets 2 tens and 4 ones = 24 stickers.",
          ].map((s, i) => (
            <li key={i} className="flex gap-3 rounded-xl bg-white px-3 py-2 text-sm text-ink-700">
              <span className="font-bold text-brand-600">{i + 1}.</span>
              <span>{s}</span>
            </li>
          ))}
        </ol>
        <div className="mt-4 rounded-xl border border-ok-600/30 bg-ok-100 px-4 py-3 text-sm text-ink-700">
          <strong>Check:</strong> 3 × 24 = 72 ✓ — and 24 is between 20 and 30, exactly as estimated.
        </div>
        <div className="mt-4"><PrimaryButton onClick={() => go(7)}>Your turn</PrimaryButton></div>
      </Step>

      <Step n={7} title="You try one — I'll start it" open={step === 7} onOpen={() => go(7)} done={false}>
        <p className="text-ink-700">Share <strong>96</strong> stickers between <strong>4</strong> friends.</p>
        <div className="mt-3 rounded-xl bg-white px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          Share the tens: 9 tens between 4 is <strong>2 tens each</strong>, using 8 tens. That
          leaves <strong>1 ten and 6 ones</strong> — which is <strong>16 ones</strong>.
        </div>
        <TryIt
          prompt={<>2. Share the 16 ones between 4, then say how much each friend gets in total.</>}
          accept={["24"]}
          placeholder="stickers each"
          value={fade}
          setValue={setFade}
          hint="16 ÷ 4 = 4 ones each. Add that to the 2 tens each friend already has."
          explain={
            <>
              16 ÷ 4 = 4 ones, on top of 2 tens, so <strong>24</strong> each. Check: 4 × 24 = 96 ✓
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">To divide a 2-digit number</div>
          <div className="mt-2">1. Share the tens first</div>
          <div className="mt-1">2. Break any leftover ten into ten ones</div>
          <div className="mt-1">3. Share the ones, then count each pile</div>
        </div>
        <KeyIdea>
          💡 Always check by multiplying back. If the pieces don&rsquo;t rebuild the number you
          started with, something was shared wrongly.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
