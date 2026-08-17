"use client";

import { useState } from "react";
import { Step, KeyIdea, WrongBox } from "@/components/lesson/Step";
import { LessonShell, TryIt } from "@/components/lesson/LessonShell";
import { DotGroups } from "@/components/lesson/Models";
import { PrimaryButton } from "@/components/ui";

/**
 * Factors and multiples.
 *
 * These two words are confused constantly, and the confusion is worth
 * attacking directly: factors go INTO a number and are never bigger than it,
 * multiples come OUT of it and are never smaller. Arrays make the difference
 * visible rather than verbal.
 */
export function FactorsMultiplesLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 4 · Number Sense · Factors & Multiples"
      title="Factors go in, multiples come out"
      minutes={5}
      step={step}
      total={6}
    >
      <Step n={1} title="Arranging 12 chairs" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          You have 12 chairs and want equal rows. Which arrangements work?
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-4">
          <DotGroups groups={3} perGroup={4} asArray label="3 rows of 4" />
          <DotGroups groups={2} perGroup={6} asArray label="2 rows of 6" />
        </div>
        <p className="mt-4 text-ink-700">
          Every arrangement that works uses a <strong>factor</strong> of 12.
        </p>
        <div className="mt-3 rounded-xl bg-paper px-4 py-3 text-center font-bold text-ink-900">
          Factors of 12: 1, 2, 3, 4, 6, 12
        </div>
        <div className="mt-4"><PrimaryButton onClick={() => go(2)}>What about 5?</PrimaryButton></div>
      </Step>

      <Step n={2} title="Why 5 isn't a factor" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <p className="text-ink-700">
          Try 5 rows: you get 2 in each row with 2 chairs left over. It doesn&rsquo;t divide
          evenly, so 5 is not a factor of 12.
        </p>
        <KeyIdea>
          A <strong>factor</strong> divides the number exactly, with nothing left over. Factors are
          never bigger than the number itself.
        </KeyIdea>
        <p className="mt-3 text-ink-700">
          Notice factors come in pairs: 1 × 12, 2 × 6, 3 × 4. Finding one gives you the other free.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(3)}>Now multiples</PrimaryButton></div>
      </Step>

      <Step n={3} title="Multiples are the times table" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">
          The <strong>multiples</strong> of 12 are what you get by multiplying it:
        </p>
        <div className="mt-3 rounded-xl bg-paper px-4 py-3 text-center font-bold text-ink-900">
          12, 24, 36, 48, 60, …
        </div>
        <p className="mt-3 text-ink-700">
          The list never ends, and every multiple is at least as big as 12.
        </p>
        <KeyIdea>
          <strong>Factors go in</strong> — a short list, none bigger than the number.{" "}
          <strong>Multiples come out</strong> — an endless list, none smaller.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(4)}>What goes wrong?</PrimaryButton></div>
      </Step>

      <Step n={4} title="The mistake almost everyone makes" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <WrongBox>&ldquo;24 is a factor of 12&rdquo;</WrongBox>
        <p className="text-ink-700">
          The two words get swapped. Use the size test — it settles it every time:
        </p>
        <div className="mt-3 space-y-2">
          {[
            ["Is 3 a factor of 12?", "yes — smaller, and divides exactly"],
            ["Is 24 a factor of 12?", "no — bigger than 12, so impossible"],
            ["Is 24 a multiple of 12?", "yes — 12 × 2"],
            ["Is 3 a multiple of 12?", "no — smaller than 12, so impossible"],
          ].map(([a, b]) => (
            <div key={a} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-semibold text-ink-900">{a}</span>
              <span className="text-sm text-ink-700">{b}</span>
            </div>
          ))}
        </div>
        <div className="mt-4"><PrimaryButton onClick={() => go(5)}>Why it matters</PrimaryButton></div>
      </Step>

      <Step n={5} title="Where you'll use this" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-paper px-3 py-3">
            <div className="text-sm font-bold text-ink-900">Simplifying fractions</div>
            <p className="mt-1 text-sm text-ink-700">
              You need a common <strong>factor</strong> of the top and bottom to divide by.
            </p>
          </div>
          <div className="rounded-xl bg-paper px-3 py-3">
            <div className="text-sm font-bold text-ink-900">Adding fractions</div>
            <p className="mt-1 text-sm text-ink-700">
              You need a common <strong>multiple</strong> of the bottoms to rename them.
            </p>
          </div>
        </div>
        <KeyIdea>
          Factors shrink things down, multiples build them up. That is why simplifying uses one and
          finding a common denominator uses the other.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(6)}>Your turn</PrimaryButton></div>
      </Step>

      <Step n={6} title="You try one" open={step === 6} onOpen={() => go(6)} done={false}>
        <p className="text-ink-700">
          List all the factors of <strong>18</strong>, smallest first, separated by commas.
        </p>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">Hint. </span>
          Work in pairs: 1 × 18, 2 × 9, 3 × 6. Does 4 go in? Does 5?
        </div>
        <TryIt
          prompt={<>The factors of 18 are:</>}
          accept={["1,2,3,6,9,18"]}
          placeholder="1,2,3,..."
          value={fade}
          setValue={setFade}
          hint="there are six of them. 4 and 5 do not divide 18 exactly."
          explain={
            <>
              <strong>1, 2, 3, 6, 9, 18</strong> — three pairs that each multiply to 18. Note none
              is bigger than 18, exactly as factors must be.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Factors and multiples</div>
          <div className="mt-2">1. Factors divide it exactly — never bigger</div>
          <div className="mt-1">2. Multiples are its times table — never smaller</div>
          <div className="mt-1">3. Hunt factors in pairs</div>
        </div>
        <KeyIdea>
          💡 Stuck on which word is which? Check the size. Anything bigger than the number cannot
          be a factor of it.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
