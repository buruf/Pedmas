"use client";

import { useState } from "react";
import { MathText } from "@/components/MathText";
import { Step, KeyIdea, WrongBox } from "@/components/lesson/Step";
import { LessonShell, TryIt } from "@/components/lesson/LessonShell";
import { FractionBar, FractionCompare } from "@/components/lesson/FractionBar";
import { PrimaryButton } from "@/components/ui";

/**
 * What a fraction is, before any arithmetic is done with one.
 *
 * Two ideas decide everything later: the parts must be EQUAL, and the bottom
 * number names the size of the piece rather than counting anything. A child
 * who misses the second will always be tempted to add denominators.
 */
export function FractionMeaningLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 2 · Fractions · Equal Parts"
      title="What a fraction really means"
      minutes={5}
      step={step}
      total={6}
    >
      <Step n={1} title="Sharing a chocolate bar" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          One bar, two people. You break it so you each get the same amount.
        </p>
        <div className="mt-4 flex justify-center">
          <FractionBar parts={2} shaded={1} label="one half" />
        </div>
        <p className="mt-4 text-ink-700">
          Each person gets <strong>one half</strong> — written <MathText text="{1/2}" />.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(2)}>What do the numbers mean?</PrimaryButton></div>
      </Step>

      <Step n={2} title="The two numbers do different jobs" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <div className="my-4 flex items-center justify-center gap-6">
          <div className="text-6xl font-black text-ink-900">
            <MathText text="{3/4}" />
          </div>
          <div className="space-y-3 text-sm">
            <div className="rounded-xl bg-brand-50 px-3 py-2">
              <strong>3</strong> — how many pieces you have
            </div>
            <div className="rounded-xl bg-paper px-3 py-2">
              <strong>4</strong> — how many equal pieces the whole was cut into
            </div>
          </div>
        </div>
        <div className="flex justify-center">
          <FractionBar parts={4} shaded={3} label="{3/4}" />
        </div>
        <KeyIdea>
          The bottom number doesn&rsquo;t count anything you have — it tells you{" "}
          <strong>how big each piece is</strong>. That is why it behaves so differently later.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(3)}>What goes wrong?</PrimaryButton></div>
      </Step>

      <Step n={3} title="The pieces must be equal" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">
          Someone breaks a bar into 4 pieces — but not fairly — and says they took a quarter:
        </p>
        <WrongBox>a big piece out of 4 uneven pieces = &ldquo;one quarter&rdquo;</WrongBox>
        <p className="text-ink-700">
          It isn&rsquo;t. A quarter means one of <strong>four equal</strong> pieces. If the pieces
          are different sizes, none of them is a quarter of anything.
        </p>
        <KeyIdea>
          Cut into equal parts, or it isn&rsquo;t a fraction at all.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(4)}>Something surprising</PrimaryButton></div>
      </Step>

      <Step n={4} title="Bigger bottom, smaller piece" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <p className="text-ink-700">
          Which would you rather have — <MathText text="{1/4}" /> of a pizza, or{" "}
          <MathText text="{1/8}" />?
        </p>
        <div className="mt-4 flex justify-center">
          <FractionCompare
            rows={[
              { parts: 4, shaded: 1, shade: "brand", label: "{1/4}" },
              { parts: 8, shaded: 1, shade: "teal", label: "{1/8}" },
            ]}
          />
        </div>
        <p className="mt-4 text-ink-700">
          8 is a bigger number than 4 — but <MathText text="{1/8}" /> is the{" "}
          <strong>smaller</strong> piece. Sharing the same pizza between more people means less
          each.
        </p>
        <KeyIdea>
          This catches people out constantly. The bigger the bottom number, the more pieces the
          whole was cut into — so each one is smaller.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(5)}>When the pieces are the same</PrimaryButton></div>
      </Step>

      <Step n={5} title="Counting pieces of the same size" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">
          Once every piece is the same size, fractions behave just like counting:
        </p>
        <div className="mt-4 flex flex-col items-center gap-2">
          <FractionBar parts={5} shaded={1} label="{1/5}" />
          <span className="text-xl font-bold text-ink-500">+</span>
          <FractionBar parts={5} shaded={2} shade="teal" label="{2/5}" />
          <span className="text-xl font-bold text-ink-500">=</span>
          <FractionBar parts={5} shaded={3} label="{3/5}" />
        </div>
        <p className="mt-3 text-ink-700">
          1 fifth and 2 more fifths is <strong>3 fifths</strong>. The bottom number never changed —
          the pieces were the same size all along.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(6)}>Your turn</PrimaryButton></div>
      </Step>

      <Step n={6} title="You try one" open={step === 6} onOpen={() => go(6)} done={false}>
        <div className="flex justify-center">
          <FractionBar parts={6} shaded={4} label="what fraction is shaded?" />
        </div>
        <TryIt
          prompt={<>Count the shaded pieces, then all the pieces. Write it as a fraction.</>}
          accept={["4/6", "2/3"]}
          placeholder="like 3/5"
          value={fade}
          setValue={setFade}
          hint="the top counts what is shaded, the bottom counts every equal piece."
          explain={
            <>
              4 pieces shaded out of 6 equal pieces, so <MathText text="{4/6}" />. That is the same
              amount as <MathText text="{2/3}" />, so either is right.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Reading a fraction</div>
          <div className="mt-2">1. The pieces must be equal</div>
          <div className="mt-1">2. The top counts the pieces you have</div>
          <div className="mt-1">3. The bottom says how big each piece is</div>
        </div>
        <KeyIdea>
          💡 The bottom number is a size, not a count. Remember that and adding fractions will make
          sense when you meet it.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
