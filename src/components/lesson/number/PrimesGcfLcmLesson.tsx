"use client";

import { useState } from "react";
import { Step, KeyIdea, WrongBox } from "@/components/lesson/Step";
import { LessonShell, TryIt } from "@/components/lesson/LessonShell";
import { DotGroups } from "@/components/lesson/Models";
import { PrimaryButton } from "@/components/ui";

/**
 * Prime and composite numbers.
 *
 * The stubborn cases are 1 and 2: children classify 1 as prime because "only
 * 1 and itself" sounds like it fits, and 2 as composite because it is even.
 * Both are addressed head-on, since almost every later mistake traces back
 * to one of them.
 */
export function PrimesLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 4 · Number Sense · Prime & Composite Numbers"
      title="Numbers that can't be split"
      minutes={5}
      step={step}
      total={5}
    >
      <Step n={1} title="Which can make a rectangle?" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          Take 12 counters — you can arrange them several ways. Take 7, and the only arrangement is
          a single line.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-4">
          <DotGroups groups={3} perGroup={4} asArray label="12 = 3 × 4" />
          <DotGroups groups={1} perGroup={7} asArray label="7 = 1 × 7 only" />
        </div>
        <KeyIdea>
          A <strong>prime</strong> number has exactly two factors: 1 and itself. Anything with more
          is <strong>composite</strong>.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(2)}>The first few</PrimaryButton></div>
      </Step>

      <Step n={2} title="The primes start like this" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          {[2, 3, 5, 7, 11, 13, 17, 19, 23, 29].map((p) => (
            <span key={p} className="rounded-xl bg-brand-100 px-3 py-1.5 font-bold text-brand-800">
              {p}
            </span>
          ))}
        </div>
        <p className="mt-4 text-ink-700">
          Worth memorising the first ten — they turn up constantly when simplifying fractions.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(3)}>Two tricky cases</PrimaryButton></div>
      </Step>

      <Step n={3} title="The mistakes almost everyone makes" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <WrongBox>&ldquo;1 is prime — its only factors are 1 and itself&rdquo;</WrongBox>
        <p className="text-ink-700">
          For 1, &ldquo;1&rdquo; and &ldquo;itself&rdquo; are the <em>same</em> factor. That is one
          factor, not two — so 1 is neither prime nor composite. It sits outside both.
        </p>
        <WrongBox>&ldquo;2 can't be prime, it's even&rdquo;</WrongBox>
        <p className="text-ink-700">
          Even just means divisible by 2 — and every number is divisible by itself. 2 has exactly
          the factors 1 and 2, so it is prime. It is the <strong>only</strong> even prime, because
          every other even number also has 2 as a factor.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(4)}>How do I test a number?</PrimaryButton></div>
      </Step>

      <Step n={4} title="Testing a number quickly" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <p className="text-ink-700">
          Try dividing by the small primes in turn — 2, 3, 5, 7 — and stop once a factor squares
          past the number.
        </p>
        <div className="mt-3 rounded-2xl bg-paper p-4">
          <div className="text-sm font-bold text-ink-900">Is 51 prime?</div>
          <ol className="mt-2 space-y-1.5 text-sm text-ink-700">
            <li>÷ 2? No, it is odd.</li>
            <li>÷ 3? Digits 5 + 1 = 6, which is in the 3 times table — so yes.</li>
            <li>51 = 3 × 17, so it is <strong>composite</strong>.</li>
          </ol>
        </div>
        <KeyIdea>
          If the digits add to a multiple of 3, the number divides by 3. That one check catches a
          surprising number of near-misses like 51, 57 and 91.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(5)}>Your turn</PrimaryButton></div>
      </Step>

      <Step n={5} title="You try one" open={step === 5} onOpen={() => go(5)} done={false}>
        <p className="text-ink-700">Is <strong>29</strong> prime or composite?</p>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">Hint. </span>
          Check 2, 3 and 5. It is odd, its digits add to 11, and it does not end in 0 or 5.
        </div>
        <TryIt
          prompt={<>Type prime or composite:</>}
          accept={["prime"]}
          placeholder="prime or composite"
          value={fade}
          setValue={setFade}
          hint="nothing divides it except 1 and 29 itself."
          explain={
            <>
              <strong>Prime.</strong> Nothing below it divides in — 29 has exactly two factors, 1
              and 29.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Prime numbers</div>
          <div className="mt-2">1. Exactly two factors: 1 and itself</div>
          <div className="mt-1">2. 1 is neither prime nor composite</div>
          <div className="mt-1">3. 2 is the only even prime</div>
        </div>
        <KeyIdea>
          💡 Primes are the building blocks — every whole number is a product of primes in exactly
          one way.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}

/**
 * Greatest common factor and lowest common multiple, taught together because
 * the confusion is between them, not within either. GCF is for simplifying,
 * LCM is for adding — naming the job decides which one you want.
 */
export function GcfLcmLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 5 · Number Sense · GCF & LCM"
      title="Greatest common factor and lowest common multiple"
      minutes={6}
      step={step}
      total={5}
    >
      <Step n={1} title="Two different jobs" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-paper px-3 py-3">
            <div className="text-sm font-bold text-ink-900">GCF — greatest common factor</div>
            <p className="mt-1 text-sm text-ink-700">
              The biggest number that goes <strong>into</strong> both. Used to{" "}
              <strong>simplify</strong>.
            </p>
          </div>
          <div className="rounded-xl bg-paper px-3 py-3">
            <div className="text-sm font-bold text-ink-900">LCM — lowest common multiple</div>
            <p className="mt-1 text-sm text-ink-700">
              The smallest number both go <strong>into</strong>. Used to{" "}
              <strong>add fractions</strong>.
            </p>
          </div>
        </div>
        <KeyIdea>
          GCF is smaller than both numbers. LCM is bigger than both. If your answer is on the wrong
          side, you found the wrong one.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(2)}>Find a GCF</PrimaryButton></div>
      </Step>

      <Step n={2} title="Finding the GCF of 12 and 18" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <div className="mt-2 space-y-2">
          <div className="rounded-xl bg-paper px-3 py-2">
            <span className="text-sm font-semibold text-ink-900">Factors of 12:</span>{" "}
            <span className="text-sm text-ink-700">1, 2, 3, 4, <strong>6</strong>, 12</span>
          </div>
          <div className="rounded-xl bg-paper px-3 py-2">
            <span className="text-sm font-semibold text-ink-900">Factors of 18:</span>{" "}
            <span className="text-sm text-ink-700">1, 2, 3, <strong>6</strong>, 9, 18</span>
          </div>
        </div>
        <p className="mt-3 text-ink-700">
          Shared: 1, 2, 3 and 6. The greatest is <strong>6</strong>.
        </p>
        <div className="mt-3 rounded-xl bg-brand-50 px-4 py-3 text-sm text-ink-700">
          This is exactly what simplifying <span className="font-bold">12/18</span> needs: divide
          both by 6 to get <span className="font-bold">2/3</span>.
        </div>
        <div className="mt-4"><PrimaryButton onClick={() => go(3)}>Now an LCM</PrimaryButton></div>
      </Step>

      <Step n={3} title="Finding the LCM of 4 and 6" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <div className="mt-2 space-y-2">
          <div className="rounded-xl bg-paper px-3 py-2">
            <span className="text-sm font-semibold text-ink-900">Multiples of 4:</span>{" "}
            <span className="text-sm text-ink-700">4, 8, <strong>12</strong>, 16, 20, 24</span>
          </div>
          <div className="rounded-xl bg-paper px-3 py-2">
            <span className="text-sm font-semibold text-ink-900">Multiples of 6:</span>{" "}
            <span className="text-sm text-ink-700">6, <strong>12</strong>, 18, 24</span>
          </div>
        </div>
        <p className="mt-3 text-ink-700">
          The first number in both lists is <strong>12</strong>.
        </p>
        <div className="mt-3 rounded-xl bg-brand-50 px-4 py-3 text-sm text-ink-700">
          So to add <span className="font-bold">1/4 + 1/6</span>, rename both into twelfths.
        </div>
        <div className="mt-4"><PrimaryButton onClick={() => go(4)}>What goes wrong?</PrimaryButton></div>
      </Step>

      <Step n={4} title="The mistake almost everyone makes" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <WrongBox>Using the GCF to add fractions, or the LCM to simplify</WrongBox>
        <p className="text-ink-700">
          Both give nonsense. Decide by asking what the job is:
        </p>
        <div className="mt-3 space-y-2">
          {[
            ["Making a fraction simpler", "GCF — divide both parts by it"],
            ["Making bottoms match to add", "LCM — rename both into it"],
            ["Sharing into the largest equal groups", "GCF"],
            ["Two things repeating together again", "LCM"],
          ].map(([a, b]) => (
            <div key={a} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-semibold text-ink-900">{a}</span>
              <span className="text-sm text-brand-700">{b}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-ink-700">
          A quick sanity check: multiplying the two numbers always gives <em>a</em> common
          multiple, so 4 × 6 = 24 works for adding — 12 is just tidier.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(5)}>Your turn</PrimaryButton></div>
      </Step>

      <Step n={5} title="You try one" open={step === 5} onOpen={() => go(5)} done={false}>
        <p className="text-ink-700">
          Find the <strong>lowest common multiple</strong> of 6 and 8.
        </p>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">Hint. </span>
          Count up in 8s and check each against the 6 times table: 8, 16, 24…
        </div>
        <TryIt
          prompt={<>The LCM of 6 and 8 is:</>}
          accept={["24"]}
          placeholder="a number"
          value={fade}
          setValue={setFade}
          hint="it must be bigger than both. 24 is 6 × 4 and 8 × 3."
          explain={
            <>
              <strong>24</strong>. Bigger than both, as an LCM must be. Note 48 is also a common
              multiple — but not the lowest.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">GCF and LCM</div>
          <div className="mt-2">1. GCF goes into both — smaller than both</div>
          <div className="mt-1">2. LCM both go into — bigger than both</div>
          <div className="mt-1">3. Simplify with GCF, add fractions with LCM</div>
        </div>
        <KeyIdea>
          💡 Check the size of your answer. A GCF bigger than either number, or an LCM smaller than
          either, is always wrong.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
