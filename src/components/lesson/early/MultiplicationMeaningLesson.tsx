"use client";

import { useState } from "react";
import { Step, KeyIdea, WrongBox } from "@/components/lesson/Step";
import { LessonShell, TryIt } from "@/components/lesson/LessonShell";
import { DotGroups } from "@/components/lesson/Models";
import { PrimaryButton } from "@/components/ui";

/**
 * What multiplication means, before any times table is memorised.
 *
 * Equal groups first, then the array — because the array is what makes
 * 4 x 3 = 3 x 4 obvious rather than a rule to accept, and halves how many
 * facts a child has to learn.
 */
export function MultiplicationMeaningLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 3 · Multiplication · What multiplication means"
      title="Multiplying is counting equal groups"
      minutes={5}
      step={step}
      total={6}
    >
      <Step n={1} title="An apple problem" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          There are <strong>4 bags</strong>. Each bag has <strong>3 apples</strong>.
        </p>
        <div className="mt-4">
          <DotGroups groups={4} perGroup={3} label="4 bags of 3" />
        </div>
        <p className="mt-4 text-ink-700">How many apples altogether?</p>
        <div className="mt-4"><PrimaryButton onClick={() => go(2)}>Let&rsquo;s count</PrimaryButton></div>
      </Step>

      <Step n={2} title="You could add them" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <p className="text-ink-700">You already know how to do this — just add the bags up:</p>
        <div className="my-3 rounded-xl bg-paper px-4 py-3 text-center text-xl font-bold text-ink-900">
          3 + 3 + 3 + 3 = 12
        </div>
        <KeyIdea>
          That works. But writing 3 four times is slow — and imagine 3 added <em>twenty</em> times.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(3)}>Is there a shorter way?</PrimaryButton></div>
      </Step>

      <Step n={3} title="A shorter way to say it" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">
          &ldquo;Four groups of three&rdquo; is written like this:
        </p>
        <div className="my-3 rounded-xl bg-ink-900 px-4 py-4 text-center text-2xl font-bold text-white">
          4 × 3 = 12
        </div>
        <p className="text-ink-700">
          The <strong>×</strong> sign just means <strong>&ldquo;groups of&rdquo;</strong>. It is a
          shortcut for adding the same number over and over.
        </p>
        <KeyIdea>
          Multiplication isn&rsquo;t a new kind of maths — it&rsquo;s fast adding of equal groups.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(4)}>What goes wrong?</PrimaryButton></div>
      </Step>

      <Step n={4} title="The groups must be equal" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <p className="text-ink-700">People sometimes use × when the groups are different sizes:</p>
        <WrongBox>bags of 3, 3, 2 and 4 → &ldquo;4 × 3&rdquo;</WrongBox>
        <p className="text-ink-700">
          That doesn&rsquo;t work. 3 + 3 + 2 + 4 is 12 here by luck, but × only means something when
          <strong> every group is the same size</strong>.
        </p>
        <KeyIdea>
          If the groups aren&rsquo;t equal, you have to add them one by one. Equal groups are what
          make multiplication possible.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(5)}>Show me something useful</PrimaryButton></div>
      </Step>

      <Step n={5} title="A trick that halves your work" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">Line the apples up in rows instead of bags:</p>
        <div className="mt-4 flex justify-center">
          <DotGroups groups={4} perGroup={3} asArray label="4 rows of 3 = 12" />
        </div>
        <p className="mt-4 text-ink-700">
          Now turn your head. The same picture is also <strong>3 rows of 4</strong>.
        </p>
        <div className="mt-3 flex justify-center">
          <DotGroups groups={3} perGroup={4} asArray label="3 rows of 4 = 12" />
        </div>
        <KeyIdea>
          <strong>4 × 3 and 3 × 4 give the same answer.</strong> Nothing moved — you just looked at
          it differently. So every fact you learn gives you a second one free.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(6)}>Your turn</PrimaryButton></div>
      </Step>

      <Step n={6} title="You try one" open={step === 6} onOpen={() => go(6)} done={false}>
        <p className="text-ink-700">There are <strong>5 plates</strong> with <strong>2 biscuits</strong> on each.</p>
        <div className="mt-3">
          <DotGroups groups={5} perGroup={2} label="5 groups of 2" />
        </div>
        <TryIt
          prompt={<>Write it as a multiplication and work it out. How many biscuits?</>}
          accept={["10"]}
          placeholder="how many"
          value={fade}
          setValue={setFade}
          hint="5 groups of 2 means 2 + 2 + 2 + 2 + 2."
          explain={
            <>
              5 × 2 = <strong>10</strong>. And because turning it round gives 2 × 5, you know that
              one too.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Multiplication</div>
          <div className="mt-2">1. × means &ldquo;groups of&rdquo;</div>
          <div className="mt-1">2. Every group must be the same size</div>
          <div className="mt-1">3. Order doesn&rsquo;t change the answer</div>
        </div>
        <KeyIdea>
          💡 There are far fewer times-table facts than there look, because half of them are the
          same fact turned around.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
