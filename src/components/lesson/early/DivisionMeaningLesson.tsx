"use client";

import { useState } from "react";
import { Step, KeyIdea, WrongBox } from "@/components/lesson/Step";
import { LessonShell, TryIt } from "@/components/lesson/LessonShell";
import { DotGroups } from "@/components/lesson/Models";
import { PrimaryButton } from "@/components/ui";

/**
 * What division means, taught as the undoing of multiplication.
 *
 * Two readings of the same symbol are shown deliberately — sharing between a
 * number of people, and making groups of a given size — because children who
 * only ever meet one are stranded the first time a problem uses the other.
 */
export function DivisionMeaningLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 3 · Division · What division means"
      title="Dividing is sharing into equal groups"
      minutes={5}
      step={step}
      total={6}
    >
      <Step n={1} title="A sharing problem" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          There are <strong>12 sweets</strong> to share fairly between <strong>3 friends</strong>.
        </p>
        <div className="mt-4">
          <DotGroups groups={1} perGroup={12} label="12 sweets" />
        </div>
        <p className="mt-4 text-ink-700">How many does each friend get?</p>
        <div className="mt-4"><PrimaryButton onClick={() => go(2)}>Share them out</PrimaryButton></div>
      </Step>

      <Step n={2} title="One for you, one for you…" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <p className="text-ink-700">
          Deal them out one at a time, like cards, until they run out.
        </p>
        <div className="mt-4">
          <DotGroups groups={3} perGroup={4} label="each friend gets 4" />
        </div>
        <div className="my-3 rounded-xl bg-ink-900 px-4 py-4 text-center text-2xl font-bold text-white">
          12 ÷ 3 = 4
        </div>
        <KeyIdea>
          The <strong>÷</strong> sign means <strong>&ldquo;shared equally into&rdquo;</strong>.
          Fairly — everyone gets the same.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(3)}>There's a second meaning</PrimaryButton></div>
      </Step>

      <Step n={3} title="The same sum, a different question" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">
          Now a different problem: 12 sweets go into bags of <strong>3</strong>. How many{" "}
          <em>bags</em>?
        </p>
        <div className="mt-4">
          <DotGroups groups={4} perGroup={3} label="4 bags of 3" />
        </div>
        <p className="mt-3 text-ink-700">
          The answer is <strong>4 bags</strong> — and the sum is <em>still</em> 12 ÷ 3.
        </p>
        <KeyIdea>
          12 ÷ 3 answers both &ldquo;how many each?&rdquo; and &ldquo;how many groups?&rdquo;. Knowing
          both meanings is what lets you spot division in a word problem.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(4)}>What goes wrong?</PrimaryButton></div>
      </Step>

      <Step n={4} title="Order matters in division" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <p className="text-ink-700">
          With multiplication you can swap the numbers round. People assume division is the same:
        </p>
        <WrongBox>12 ÷ 3 is the same as 3 ÷ 12</WrongBox>
        <p className="text-ink-700">
          It isn&rsquo;t. Sharing <strong>12 sweets between 3 friends</strong> gives 4 each. Sharing{" "}
          <strong>3 sweets between 12 friends</strong> doesn&rsquo;t even give everyone a whole one.
        </p>
        <KeyIdea>
          In division, the number being shared comes <strong>first</strong>. Swapping them changes
          the question completely.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(5)}>Show me the shortcut</PrimaryButton></div>
      </Step>

      <Step n={5} title="Division undoes multiplication" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">
          You don&rsquo;t have to deal sweets out every time. Ask a multiplication question instead:
        </p>
        <div className="my-3 rounded-xl bg-paper px-4 py-3 text-center text-lg font-bold text-ink-900">
          12 ÷ 3 = ?  →  &ldquo;3 times what makes 12?&rdquo;
        </div>
        <p className="text-ink-700">
          You already know 3 × 4 = 12. So 12 ÷ 3 = 4. Every times-table fact you know gives you a
          division fact too.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {[
            ["5 × 2 = 10", "10 ÷ 5 = 2"],
            ["4 × 6 = 24", "24 ÷ 4 = 6"],
          ].map(([m, d]) => (
            <div key={m} className="rounded-xl bg-paper px-3 py-2 text-center text-sm font-semibold text-ink-700">
              {m} &nbsp;→&nbsp; {d}
            </div>
          ))}
        </div>
        <div className="mt-4"><PrimaryButton onClick={() => go(6)}>Your turn</PrimaryButton></div>
      </Step>

      <Step n={6} title="You try one" open={step === 6} onOpen={() => go(6)} done={false}>
        <p className="text-ink-700">
          <strong>15</strong> pencils are shared between <strong>5</strong> children.
        </p>
        <TryIt
          prompt={<>Ask yourself: 5 times what makes 15? How many pencils each?</>}
          accept={["3"]}
          placeholder="pencils each"
          value={fade}
          setValue={setFade}
          hint="count up in fives: 5, 10, 15. How many fives was that?"
          explain={
            <>
              5 × 3 = 15, so 15 ÷ 5 = <strong>3</strong> each. Check by multiplying back: 3 × 5 = 15 ✓
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Division</div>
          <div className="mt-2">1. ÷ means shared equally</div>
          <div className="mt-1">2. The number being shared goes first</div>
          <div className="mt-1">3. Use a times-table fact you already know</div>
        </div>
        <KeyIdea>
          💡 Always check a division by multiplying back. If it doesn&rsquo;t rebuild the number you
          started with, something went wrong.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
