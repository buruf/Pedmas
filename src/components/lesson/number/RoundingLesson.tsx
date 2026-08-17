"use client";

import { useState } from "react";
import { Step, KeyIdea, WrongBox } from "@/components/lesson/Step";
import { LessonShell, TryIt } from "@/components/lesson/LessonShell";
import { NumberLine } from "@/components/lesson/Models";
import { PrimaryButton } from "@/components/ui";

/**
 * Rounding.
 *
 * Taught on a number line as "which one is it nearer to?", because the digit
 * rule is what children fall back on when they have no picture — and it is
 * exactly the rule that produces 348 -> 400 -> 300 style chain errors.
 */
export function RoundingLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 3 · Number Sense · Rounding"
      title="Rounding is asking which one it's nearer to"
      minutes={5}
      step={step}
      total={6}
    >
      <Step n={1} title="Roughly how many?" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          There are <strong>68</strong> people at a party. If someone asks roughly how many, you
          would say &ldquo;about 70&rdquo; — not 68.
        </p>
        <p className="mt-3 text-ink-700">
          Rounding is choosing the nearest tidy number. It makes numbers easier to hold in your
          head and to check answers with.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(2)}>How do I decide?</PrimaryButton></div>
      </Step>

      <Step n={2} title="Put it on a number line" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <p className="text-ink-700">
          To round 68 to the nearest ten, the only candidates are <strong>60</strong> and{" "}
          <strong>70</strong>. Which is it closer to?
        </p>
        <div className="mt-4 flex justify-center">
          <NumberLine from={60} to={70} marks={[68]} />
        </div>
        <p className="mt-3 text-ink-700">
          68 sits well past the middle, so it is nearer 70.
        </p>
        <KeyIdea>
          Rounding is not a rule about digits. It is the question:{" "}
          <strong>which one is it nearer to?</strong>
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(3)}>What about the middle?</PrimaryButton></div>
      </Step>

      <Step n={3} title="Exactly halfway" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">
          65 is exactly between 60 and 70 — genuinely no nearer to either.
        </p>
        <div className="mt-4 flex justify-center">
          <NumberLine from={60} to={70} marks={[65]} />
        </div>
        <p className="mt-3 text-ink-700">
          So mathematicians agreed a convention: when it is a tie, <strong>round up</strong>. That
          is the only reason 5 goes up — not because 5 is &ldquo;big&rdquo;.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(4)}>The quick method</PrimaryButton></div>
      </Step>

      <Step n={4} title="The quick way" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <p className="text-ink-700">
          Once the picture makes sense, you can shortcut it. Look at the digit{" "}
          <strong>just after</strong> the place you are rounding to:
        </p>
        <div className="mt-3 space-y-2">
          {[
            ["0, 1, 2, 3, 4", "round down — nearer the lower one"],
            ["5, 6, 7, 8, 9", "round up — nearer the higher one, or a tie"],
          ].map(([a, b]) => (
            <div key={a} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="font-bold text-ink-900">{a}</span>
              <span className="text-sm text-ink-700">{b}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 rounded-xl bg-paper px-4 py-3 text-center font-bold text-ink-900">
          348 to the nearest hundred → look at the 4 → <span className="text-ok-600">300</span>
        </div>
        <div className="mt-4"><PrimaryButton onClick={() => go(5)}>What goes wrong?</PrimaryButton></div>
      </Step>

      <Step n={5} title="The mistake almost everyone makes" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">People round one step at a time, from the right:</p>
        <WrongBox>348 → 350 → 400</WrongBox>
        <p className="text-ink-700">
          Rounding twice inflates the answer. Check it on the line: 348 is below the halfway mark
          of 350, so it is nearer <strong>300</strong>.
        </p>
        <div className="mt-3 flex justify-center">
          <NumberLine from={300} to={400} marks={[348]} />
        </div>
        <KeyIdea>
          Round <strong>once</strong>, straight to the place you want, using the single digit
          immediately after it. Ignore everything further right.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(6)}>Your turn</PrimaryButton></div>
      </Step>

      <Step n={6} title="You try one" open={step === 6} onOpen={() => go(6)} done={false}>
        <p className="text-ink-700">Round <strong>472</strong> to the nearest hundred.</p>
        <div className="mt-3 flex justify-center">
          <NumberLine from={400} to={500} marks={[472]} />
        </div>
        <TryIt
          prompt={<>Which hundred is it nearer to?</>}
          accept={["500"]}
          placeholder="a number"
          value={fade}
          setValue={setFade}
          hint="the choices are 400 and 500. Is 472 past the halfway point of 450?"
          explain={
            <>
              472 is past 450, so it rounds to <strong>500</strong>. The quick check agrees: the
              digit after the hundreds is 7, which rounds up.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Rounding</div>
          <div className="mt-2">1. Find the two tidy numbers either side</div>
          <div className="mt-1">2. Ask which one it is nearer to</div>
          <div className="mt-1">3. Exactly halfway rounds up</div>
        </div>
        <KeyIdea>
          💡 Round once, not in stages. 348 to the nearest hundred is 300, never 400.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
