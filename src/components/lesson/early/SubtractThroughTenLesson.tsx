"use client";

import { useState } from "react";
import { Step, KeyIdea, WrongBox } from "@/components/lesson/Step";
import { LessonShell, TryIt } from "@/components/lesson/LessonShell";
import { TenFrame, NumberLine } from "@/components/lesson/Models";
import { PrimaryButton } from "@/components/ui";

/**
 * Subtraction within 20 by jumping back to ten.
 *
 * The mirror of making ten, taught deliberately as the same idea in reverse so
 * a child sees one strategy rather than two unrelated tricks.
 */
export function SubtractThroughTenLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 1 · Addition & Subtraction · Subtracting past ten"
      title="Jumping back to ten to subtract"
      minutes={5}
      step={step}
      total={6}
    >
      <Step n={1} title="A cookie problem" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          There are <strong>13</strong> cookies. You eat <strong>5</strong>.
        </p>
        <div className="mt-4 flex justify-center">
          <TenFrame filled={10} extra={3} label="13 cookies" />
        </div>
        <p className="mt-4 text-ink-700">How many are left?</p>
        <div className="mt-4"><PrimaryButton onClick={() => go(2)}>Let&rsquo;s find out</PrimaryButton></div>
      </Step>

      <Step n={2} title="Ten is easy to take from" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <p className="text-ink-700">
          Just like adding, <strong>ten</strong> is the easy place to be. 10 − 2 is 8. 10 − 4 is 6.
        </p>
        <KeyIdea>
          So instead of counting back one at a time, get down to <strong>ten</strong> first.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(3)}>What do people usually do?</PrimaryButton></div>
      </Step>

      <Step n={3} title="The slow way" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">Most people count back one at a time:</p>
        <WrongBox>&ldquo;13 … 12, 11, 10, 9, 8&rdquo;</WrongBox>
        <p className="text-ink-700">
          It gets the right answer, but it&rsquo;s slow and easy to miscount — especially going
          backwards, which is much harder than counting forwards.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(4)}>Show me the fast way</PrimaryButton></div>
      </Step>

      <Step n={4} title="Split the 5 to land on ten" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <p className="text-ink-700">
          13 is <strong>3 past ten</strong>. So take those 3 off first to land exactly on ten, then
          take off the other 2.
        </p>
        <div className="mt-4 flex justify-center">
          <NumberLine
            from={7}
            to={13}
            marks={[13, 10, 8]}
            jumps={[
              { from: 13, to: 10, text: "−3" },
              { from: 10, to: 8, text: "−2" },
            ]}
          />
        </div>
        <div className="mt-4 flex justify-center">
          <TenFrame filled={8} label="8 left" />
        </div>
        <KeyIdea>
          The 5 was split into <strong>3 and 2</strong> — exactly the same move as making ten, just
          going the other way.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(5)}>Say the answer</PrimaryButton></div>
      </Step>

      <Step n={5} title="Put it together" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <ol className="space-y-2">
          {["13 is 3 past ten.", "Split the 5 into 3 and 2.", "13 − 3 = 10.", "10 − 2 = 8."].map((s, i) => (
            <li key={i} className="flex gap-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
              <span className="font-bold text-brand-600">{i + 1}.</span>
              <span className="font-semibold">{s}</span>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-center text-xl font-bold text-ok-600">13 − 5 = 8 🍪</p>
        <div className="mt-3 rounded-xl border border-ok-600/30 bg-ok-100 px-4 py-3 text-sm text-ink-700">
          <strong>Check:</strong> 8 + 5 = 13 ✓ — adding it back gets you home.
        </div>
        <div className="mt-4"><PrimaryButton onClick={() => go(6)}>Your turn</PrimaryButton></div>
      </Step>

      <Step n={6} title="You try one — I'll start it" open={step === 6} onOpen={() => go(6)} done={false}>
        <p className="text-ink-700">Work out <strong>15 − 7</strong>.</p>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          15 is <strong>5 past ten</strong>. So split the 7 into <strong>5 and 2</strong>, and take
          the 5 off first: 15 − 5 = <strong>10</strong>.
        </div>
        <TryIt
          prompt={<>2. Now take off the 2 that is left. What is 15 − 7?</>}
          accept={["8"]}
          placeholder="the answer"
          value={fade}
          setValue={setFade}
          hint="you are standing on 10 and need to take 2 more off."
          explain={<>10 − 2 = <strong>8</strong>. Check: 8 + 7 = 15 ✓</>}
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">To subtract past ten</div>
          <div className="mt-2">1. Ask how far the number is past ten</div>
          <div className="mt-1">2. Take off exactly that much to land on ten</div>
          <div className="mt-1">3. Take off whatever is left</div>
        </div>
        <KeyIdea>
          💡 Same idea as adding: ten is the easy place. Get there first, then finish the jump.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
