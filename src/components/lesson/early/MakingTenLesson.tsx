"use client";

import { useState } from "react";
import { Step, KeyIdea, WrongBox } from "@/components/lesson/Step";
import { LessonShell, TryIt } from "@/components/lesson/LessonShell";
import { TenFrame, NumberLine } from "@/components/lesson/Models";
import { PrimaryButton } from "@/components/ui";

/**
 * Addition within 20 by bridging through ten.
 *
 * The strategy that decides whether a child ever becomes fluent: counting on
 * one finger at a time works for 8 + 5 but collapses under bigger numbers,
 * while "fill the ten first" scales all the way to mental arithmetic. The ten
 * frame is used because it makes "how far from ten" visible without counting.
 */
export function MakingTenLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [pairs, setPairs] = useState("");
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 1 · Addition & Subtraction · Adding past ten"
      title="Making ten to add"
      minutes={5}
      step={step}
      total={7}
    >
      <Step n={1} title="A sweet problem" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          You have <strong>8</strong> sweets. You get <strong>5</strong> more.
        </p>
        <div className="mt-4 flex justify-center">
          <TenFrame filled={8} label="8 sweets" />
        </div>
        <p className="mt-4 text-ink-700">How many sweets now?</p>
        <div className="mt-4"><PrimaryButton onClick={() => go(2)}>Let&rsquo;s find out</PrimaryButton></div>
      </Step>

      <Step n={2} title="Ten is your best friend" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <p className="text-ink-700">
          Adding to <strong>ten</strong> is the easiest thing in maths. 10 + 3 is 13. 10 + 6 is 16.
          You can hear the answer.
        </p>
        <div className="mt-4 flex justify-center">
          <TenFrame filled={10} extra={3} label="10 + 3 = 13" />
        </div>
        <KeyIdea>
          The trick to adding anything is to <strong>get to ten first</strong>.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(3)}>How do I get to ten?</PrimaryButton></div>
      </Step>

      <Step n={3} title="What does 8 need?" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">Look at the frame. How many empty boxes are left?</p>
        <div className="mt-4 flex justify-center">
          <TenFrame filled={8} label="8 — how many empty?" />
        </div>
        <TryIt
          prompt={<>Count the empty boxes:</>}
          accept={["2"]}
          placeholder="empty boxes"
          value={pairs}
          setValue={setPairs}
          hint="there are 10 boxes in total, and 8 are full."
          explain={<>Exactly — 8 needs <strong>2</strong> more to make ten. 8 and 2 are a pair that makes 10.</>}
          onCorrect={() => go(4)}
        />
      </Step>

      <Step n={4} title="How most people do it" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <p className="text-ink-700">
          Most people count on their fingers, one at a time:
        </p>
        <WrongBox>&ldquo;8 … 9, 10, 11, 12, 13&rdquo;</WrongBox>
        <p className="text-ink-700">
          That <em>works</em> — but it&rsquo;s slow, and it&rsquo;s very easy to lose count. It also
          stops working when the numbers get big. Try counting on for 48 + 7 that way.
        </p>
        <KeyIdea>
          There&rsquo;s a faster way that never breaks, however big the numbers get.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(5)}>Show me the fast way</PrimaryButton></div>
      </Step>

      <Step n={5} title="Split the 5 to fill the ten" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">
          8 needs <strong>2</strong>. So break the 5 into <strong>2 and 3</strong>. Give the 2 away
          to finish the ten — then the 3 is left over.
        </p>
        <div className="mt-4 flex justify-center">
          <TenFrame filled={10} extra={3} label="10 and 3 more" />
        </div>
        <div className="mt-4 flex justify-center">
          <NumberLine
            from={8}
            to={14}
            marks={[8, 10, 13]}
            jumps={[
              { from: 8, to: 10, text: "+2" },
              { from: 10, to: 13, text: "+3" },
            ]}
          />
        </div>
        <KeyIdea>
          No sweets were added or lost — the 5 was just split into 2 and 3. Two easy jumps beat
          five slow ones.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(6)}>Finish it</PrimaryButton></div>
      </Step>

      <Step n={6} title="Say the answer" open={step === 6} onOpen={() => go(6)} done={step > 6}>
        <ol className="space-y-2">
          {[
            "8 needs 2 to make ten.",
            "Split the 5 into 2 and 3.",
            "8 + 2 = 10.",
            "10 + 3 = 13.",
          ].map((s, i) => (
            <li key={i} className="flex gap-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
              <span className="font-bold text-brand-600">{i + 1}.</span>
              <span className="font-semibold">{s}</span>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-center text-xl font-bold text-ok-600">8 + 5 = 13 🍬</p>
        <div className="mt-4"><PrimaryButton onClick={() => go(7)}>Your turn</PrimaryButton></div>
      </Step>

      <Step n={7} title="You try one — I'll start it" open={step === 7} onOpen={() => go(7)} done={false}>
        <p className="text-ink-700">Work out <strong>7 + 5</strong>.</p>
        <div className="mt-3 flex justify-center">
          <TenFrame filled={7} label="7 — how many empty boxes?" />
        </div>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          7 needs <strong>3</strong> to make ten. So split the 5 into <strong>3 and 2</strong>.
        </div>
        <TryIt
          prompt={<>2. Now do 7 + 3 to make ten, then add what&rsquo;s left. What is 7 + 5?</>}
          accept={["12"]}
          placeholder="the answer"
          value={fade}
          setValue={setFade}
          hint="7 + 3 = 10, and there are 2 left over."
          explain={<>7 + 3 = 10, then 10 + 2 = <strong>12</strong>. Two jumps, no counting on fingers.</>}
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">To add past ten</div>
          <div className="mt-2">1. Ask what the first number needs to reach ten</div>
          <div className="mt-1">2. Split the second number to give it exactly that</div>
          <div className="mt-1">3. Add what is left to ten</div>
        </div>
        <KeyIdea>
          💡 Learn the pairs that make ten and this works every time: 9+1, 8+2, 7+3, 6+4, 5+5.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
