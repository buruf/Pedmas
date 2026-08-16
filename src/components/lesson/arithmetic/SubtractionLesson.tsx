"use client";

import { useState } from "react";
import { Step, KeyIdea, WrongBox } from "@/components/lesson/Step";
import { LessonShell, EstimateCheck, TryIt } from "@/components/lesson/LessonShell";
import { BaseTen, BaseTenKey, ColumnSum } from "@/components/lesson/Models";
import { PrimaryButton } from "@/components/ui";

/**
 * 2-digit subtraction with regrouping.
 *
 * Built around the single most common error in primary arithmetic: taking the
 * smaller digit from the larger one regardless of which is on top. The lesson
 * disproves it by checking the answer with addition, which also teaches that
 * subtraction and addition undo each other.
 */
export function SubtractionLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 2 · Addition & Subtraction · Subtraction with regrouping"
      title="Subtracting when you haven't got enough ones"
      minutes={5}
      step={step}
      total={7}
    >
      <Step n={1} title="A marble problem" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          You have <strong>52</strong> marbles. You give <strong>27</strong> to your friend.
        </p>
        <div className="mt-4 flex justify-center">
          <BaseTen tens={5} ones={2} label="52 — what you start with" />
        </div>
        <div className="mt-4"><BaseTenKey /></div>
        <EstimateCheck>
          52 is about 50, and 27 is nearly 30. 50 − 30 = 20, so expect an answer near{" "}
          <strong>25</strong>.
        </EstimateCheck>
        <div className="mt-4"><PrimaryButton onClick={() => go(2)}>Let&rsquo;s work it out</PrimaryButton></div>
      </Step>

      <Step n={2} title="You can already do this bit" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <p className="text-ink-700">When there are enough ones to take away, it&rsquo;s simple.</p>
        <div className="mt-4"><ColumnSum top={58} bottom={23} op="−" answer={35} /></div>
        <KeyIdea>
          8 ones take away 3 ones leaves 5 ones. 5 tens take away 2 tens leaves 3 tens.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(3)}>So what&rsquo;s different?</PrimaryButton></div>
      </Step>

      <Step n={3} title="Why 52 − 27 is harder" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">Look only at the ones column:</p>
        <div className="mt-4 flex flex-col items-center gap-2">
          <BaseTen ones={2} label="you have 2 ones" />
          <span className="text-sm font-bold text-err-600">but you must give away 7 ones</span>
        </div>
        <p className="mt-4 text-ink-700">
          You can&rsquo;t take 7 things from a pile of 2. You need more ones.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(4)}>What do people try?</PrimaryButton></div>
      </Step>

      <Step n={4} title="The mistake almost everyone makes" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <p className="text-ink-700">
          Because 2 − 7 looks impossible, people flip it round and do 7 − 2 instead:
        </p>
        <WrongBox>52 − 27 = 35</WrongBox>
        <p className="text-ink-700">
          Let&rsquo;s test it. Subtraction and addition undo each other, so if 35 is right, then
          35 + 27 must bring us back to 52.
        </p>
        <div className="mt-3 rounded-2xl bg-paper p-4">
          <ColumnSum top={35} bottom={27} op="+" answer={62} carries={{ 1: "1" }} />
        </div>
        <p className="mt-3 text-center font-bold text-err-600">
          62, not 52. So 35 cannot be the answer.
        </p>
        <KeyIdea>
          Checking by adding back is the fastest way to catch this. If it doesn&rsquo;t return to
          where you started, the answer is wrong.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(5)}>Show me the right way</PrimaryButton></div>
      </Step>

      <Step n={5} title="The big idea: break one ten open" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">
          You have plenty of tens. Swap <strong>one ten</strong> for <strong>ten ones</strong> — the
          same trade as in addition, just the other way round.
        </p>
        <div className="mt-4 flex flex-col items-center gap-2">
          <BaseTen tens={5} ones={2} label="52 = 5 tens and 2 ones" />
          <span className="text-sm font-bold text-brand-600">↓ break one ten into ten ones</span>
          <BaseTen tens={4} ones={9} label="52 = 4 tens and 12 ones" />
        </div>
        <KeyIdea>
          It&rsquo;s still 52 — nothing was lost. But now there are <strong>12 ones</strong>, and
          taking 7 away is easy.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(6)}>Finish the problem</PrimaryButton></div>
      </Step>

      <Step n={6} title="Now write it down" open={step === 6} onOpen={() => go(6)} done={step > 6}>
        <div className="rounded-2xl bg-paper p-4">
          <ColumnSum
            top={52}
            bottom={27}
            op="−"
            strikeTop={{ 1: "4", 0: "12" }}
            answer={25}
            highlight={0}
          />
        </div>
        <ol className="mt-4 space-y-2">
          {[
            "Not enough ones, so take one ten from the 5 tens. Cross out the 5, write 4.",
            "That ten becomes ten more ones: the 2 becomes 12.",
            "Now subtract the ones: 12 − 7 = 5.",
            "Subtract the tens: 4 − 2 = 2. The answer is 25 — just as we estimated. ✓",
          ].map((s, i) => (
            <li key={i} className="flex gap-3 rounded-xl bg-white px-3 py-2 text-sm text-ink-700">
              <span className="font-bold text-brand-600">{i + 1}.</span>
              <span>{s}</span>
            </li>
          ))}
        </ol>
        <div className="mt-4 rounded-xl border border-ok-600/30 bg-ok-100 px-4 py-3 text-sm text-ink-700">
          <strong>Check:</strong> 25 + 27 = 52 ✓ — back where we started, so it&rsquo;s right.
        </div>
        <div className="mt-4"><PrimaryButton onClick={() => go(7)}>Your turn</PrimaryButton></div>
      </Step>

      <Step n={7} title="You try one — I'll start it" open={step === 7} onOpen={() => go(7)} done={false}>
        <div className="mt-2 rounded-2xl bg-paper p-4">
          <ColumnSum top={63} bottom={28} op="−" highlight={0} />
        </div>
        <div className="mt-3 rounded-xl bg-white px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          3 ones isn&rsquo;t enough to take 8 away. Break one ten: the 6 tens become{" "}
          <strong>5 tens</strong>, and the 3 ones become <strong>13 ones</strong>.
        </div>
        <TryIt
          prompt={<>2. Now finish it. What is 63 − 28?</>}
          accept={["35"]}
          placeholder="the answer"
          value={fade}
          setValue={setFade}
          hint="do 13 − 8 for the ones, then 5 − 2 for the tens."
          explain={
            <>
              13 − 8 = 5 ones, and 5 − 2 = 3 tens, so <strong>35</strong>. Check: 35 + 28 = 63 ✓
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">To subtract bigger numbers</div>
          <div className="mt-2">1. Start with the ones</div>
          <div className="mt-1">2. Not enough? Break one ten into ten ones</div>
          <div className="mt-1">3. Then subtract each column</div>
        </div>
        <KeyIdea>
          💡 Never flip a column round. If the top digit is too small, trade — then check your
          answer by adding it back.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
