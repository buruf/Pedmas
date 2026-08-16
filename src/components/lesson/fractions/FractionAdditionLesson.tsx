"use client";

import { useState } from "react";
import { MathText } from "@/components/MathText";
import { Step } from "@/components/lesson/Step";
import { LessonShell } from "@/components/lesson/LessonShell";
import { FractionBar, FractionCompare } from "@/components/lesson/FractionBar";
import { PrimaryButton, GhostButton } from "@/components/ui";

/**
 * Adding fractions with unlike denominators.
 *
 * Built around the misconception that decides whether fractions ever make
 * sense: adding the denominators. The lesson disproves it by reasoning about
 * size — the answer must be bigger than what you started with — before any
 * procedure is introduced.
 */
export function FractionAdditionLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [guess, setGuess] = useState<string | null>(null);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 5 · Fractions · Addition of Fractions"
      title="Adding fractions when the bottoms are different"
      minutes={4}
      step={step}
      total={8}
    >
        {/* 1 — HOOK: concrete */}
        <Step n={1} title="A chocolate bar problem" open={step === 1} onOpen={() => go(1)} done={step > 1}>
          <p className="text-ink-700">
            You eat <strong>half</strong> a chocolate bar. Your friend eats <strong>one quarter</strong> of
            the same bar.
          </p>
          <div className="mt-4 flex justify-center">
            <FractionCompare
              rows={[
                { parts: 2, shaded: 1, shade: "brand", label: "You ate {1/2}" },
                { parts: 4, shaded: 1, shade: "teal", label: "Your friend ate {1/4}" },
              ]}
            />
          </div>
          <p className="mt-4 text-ink-700">How much of the bar is gone altogether?</p>
          <div className="mt-4"><PrimaryButton onClick={() => go(2)}>Let&rsquo;s work it out</PrimaryButton></div>
        </Step>

        {/* 2 — PRIOR KNOWLEDGE */}
        <Step n={2} title="You can already do this bit" open={step === 2} onOpen={() => go(2)} done={step > 2}>
          <p className="text-ink-700">
            When the pieces are <strong>the same size</strong>, adding is easy. You just count the pieces.
          </p>
          <div className="mt-4 flex flex-col items-center gap-2">
            <FractionBar parts={5} shaded={3} shade="brand" label="{3/5}" />
            <span className="text-2xl font-bold text-ink-500">+</span>
            <FractionBar parts={5} shaded={1} shade="teal" label="{1/5}" />
            <span className="text-2xl font-bold text-ink-500">=</span>
            <FractionBar parts={5} shaded={4} shade="brand" label="{4/5}" />
          </div>
          <p className="mt-4 rounded-xl bg-brand-50 px-4 py-3 text-sm text-ink-700">
            3 fifths and 1 more fifth is <strong>4 fifths</strong>. The bottom number never changed —
            the pieces were already the same size.
          </p>
          <div className="mt-4"><PrimaryButton onClick={() => go(3)}>So what&rsquo;s different?</PrimaryButton></div>
        </Step>

        {/* 3 — THE NEW PROBLEM */}
        <Step n={3} title="Why halves and quarters are harder" open={step === 3} onOpen={() => go(3)} done={step > 3}>
          <p className="text-ink-700">
            Look at the two pieces from the chocolate bar. They are <strong>not the same size</strong>.
          </p>
          <div className="mt-4 flex justify-center">
            <FractionCompare
              rows={[
                { parts: 2, shaded: 1, shade: "brand", label: "{1/2} — one big piece" },
                { parts: 4, shaded: 1, shade: "teal", label: "{1/4} — one smaller piece" },
              ]}
            />
          </div>
          <p className="mt-4 text-ink-700">
            You can&rsquo;t count them together yet. One half and one quarter isn&rsquo;t &ldquo;two&rdquo;
            of anything — the pieces don&rsquo;t match.
          </p>
          <div className="mt-4"><PrimaryButton onClick={() => go(4)}>What do most people try?</PrimaryButton></div>
        </Step>

        {/* 4 — CONFRONT THE MISCONCEPTION */}
        <Step n={4} title="The mistake almost everyone makes" open={step === 4} onOpen={() => go(4)} done={step > 4}>
          <p className="text-ink-700">Lots of people add the tops and the bottoms:</p>
          <div className="my-4 rounded-xl bg-ink-900 px-4 py-3 text-center text-xl font-bold text-white">
            <MathText text="{1/2} + {1/4} = {2/6}" /> <span className="text-err-600">✗</span>
          </div>
          <p className="text-ink-700">Let&rsquo;s test it. Is that answer even sensible?</p>

          <div className="mt-4 grid gap-2">
            {[
              { k: "bigger", label: "It should be MORE than 1/2" },
              { k: "smaller", label: "It should be LESS than 1/2" },
            ].map((o) => (
              <button
                key={o.k}
                type="button"
                onClick={() => setGuess(o.k)}
                className={`btn rounded-xl border-2 px-4 py-3 text-left font-semibold ${
                  guess === o.k ? "border-brand-600 bg-brand-50 text-brand-800" : "border-ink-100 bg-white"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>

          {guess && (
            <div className="mt-4 rounded-xl border border-ok-600/30 bg-ok-100 px-4 py-3 pop-in">
              <p className="font-bold text-ink-900">
                {guess === "bigger" ? "✓ Exactly right." : "Think again — you started with 1/2 and added more."}
              </p>
              <p className="mt-1 text-sm text-ink-700">
                You already had <MathText text="{1/2}" /> and then added <em>more</em> chocolate. The answer
                must be <strong>bigger</strong> than <MathText text="{1/2}" />.
              </p>
              <div className="mt-3 flex flex-col items-center gap-2">
                <FractionBar parts={2} shaded={1} shade="brand" label="{1/2} — where you started" />
                <FractionBar parts={6} shaded={2} shade="rose" label="{2/6} — smaller! So it can't be right" />
              </div>
              <p className="mt-3 text-sm font-semibold text-ink-900">
                <MathText text="{2/6}" /> is <em>less</em> than <MathText text="{1/2}" />, so adding the
                bottoms must be wrong.
              </p>
              <div className="mt-4"><PrimaryButton onClick={() => go(5)}>Show me the right way</PrimaryButton></div>
            </div>
          )}
        </Step>

        {/* 5 — THE IDEA */}
        <Step n={5} title="The big idea: make the pieces match" open={step === 5} onOpen={() => go(5)} done={step > 5}>
          <p className="text-ink-700">
            We can&rsquo;t change how much chocolate there is — but we <em>can</em> cut it into
            smaller, equal pieces.
          </p>
          <div className="mt-4 flex flex-col items-center gap-3">
            <FractionBar parts={2} shaded={1} shade="brand" label="{1/2} — one big piece" />
            <span className="text-sm font-bold text-brand-600">↓ cut each half into 2</span>
            <FractionBar parts={4} shaded={2} shade="brand" label="{2/4} — same amount, smaller pieces" />
          </div>
          <p className="mt-4 rounded-xl bg-brand-50 px-4 py-3 text-sm text-ink-700">
            Nothing was eaten or added. <MathText text="{1/2}" /> and <MathText text="{2/4}" /> are the
            <strong> same amount</strong> — just cut differently. Now both fractions use quarters.
          </p>
          <div className="mt-4"><PrimaryButton onClick={() => go(6)}>Finish the problem</PrimaryButton></div>
        </Step>

        {/* 6 — WORKED EXAMPLE */}
        <Step n={6} title="Now we can add" open={step === 6} onOpen={() => go(6)} done={step > 6}>
          <div className="flex flex-col items-center gap-2">
            <FractionBar parts={4} shaded={2} shade="brand" label="{2/4}" />
            <span className="text-2xl font-bold text-ink-500">+</span>
            <FractionBar parts={4} shaded={1} shade="teal" label="{1/4}" />
            <span className="text-2xl font-bold text-ink-500">=</span>
            <FractionBar parts={4} shaded={3} shade="brand" label="{3/4}" />
          </div>
          <ol className="mt-5 space-y-2">
            {[
              ["Make the pieces match.", "{1/2} = {2/4}"],
              ["Now the bottoms are the same, so count the pieces.", "{2/4} + {1/4} = {3/4}"],
              ["Check it's sensible.", "{3/4} is bigger than {1/2} ✓"],
            ].map(([why, math], i) => (
              <li key={i} className="flex gap-3 rounded-xl bg-paper px-3 py-2">
                <span className="font-bold text-brand-600">{i + 1}.</span>
                <span className="text-sm text-ink-700">
                  {why}
                  <span className="mt-1 block text-base font-bold text-ink-900"><MathText text={math} /></span>
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-center text-lg font-bold text-ok-600">
            Three quarters of the bar is gone. 🍫
          </p>
          <div className="mt-4"><PrimaryButton onClick={() => go(7)}>Your turn</PrimaryButton></div>
        </Step>

        {/* 7 — FADED EXAMPLE */}
        <Step n={7} title="You try one — I'll help" open={step === 7} onOpen={() => go(7)} done={step > 7}>
          <p className="text-ink-700">
            Same idea, new numbers. I&rsquo;ve done the first step for you.
          </p>
          <div className="my-4 rounded-xl bg-ink-900 px-4 py-4 text-center text-xl font-bold text-white">
            <MathText text="{1/3} + {1/6} = ?" />
          </div>
          <div className="rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
            <span className="font-bold text-brand-600">1. </span>
            Make the pieces match — cut each third into 2:
            <span className="mt-1 block text-base font-bold text-ink-900"><MathText text="{1/3} = {2/6}" /></span>
          </div>
          <div className="mt-3 flex flex-col items-center gap-2">
            <FractionBar parts={6} shaded={2} shade="brand" label="{2/6}" />
            <span className="text-xl font-bold text-ink-500">+</span>
            <FractionBar parts={6} shaded={1} shade="teal" label="{1/6}" />
          </div>
          <label className="mt-4 block text-sm font-semibold text-ink-700">
            2. Now count the sixths. What is the answer?
            <input
              value={fade}
              onChange={(e) => setFade(e.target.value)}
              placeholder="like 3/6"
              className="mt-1 text-center text-lg font-bold"
            />
          </label>
          {fade.replace(/\s/g, "") !== "" && (
            <div className="mt-3 pop-in">
              {["3/6", "1/2"].includes(fade.replace(/\s/g, "")) ? (
                <div className="rounded-xl border border-ok-600/30 bg-ok-100 px-4 py-3">
                  <p className="font-bold text-ink-900">✓ Correct! Great work.</p>
                  <p className="mt-1 text-sm text-ink-700">
                    2 sixths and 1 sixth is 3 sixths — and <MathText text="{3/6}" /> is the same as{" "}
                    <MathText text="{1/2}" />, so either answer is right.
                  </p>
                  <div className="mt-3"><PrimaryButton onClick={() => go(8)}>Last thing</PrimaryButton></div>
                </div>
              ) : (
                <div className="rounded-xl border border-warn-600/30 bg-warn-100 px-4 py-3">
                  <p className="text-sm text-ink-700">
                    Not yet — count the shaded pieces in both bars. There are 2 and then 1, and every
                    piece is a sixth.
                  </p>
                </div>
              )}
            </div>
          )}
        </Step>

        {/* 8 — THE RULE */}
        <Step n={8} title="The rule, now that it makes sense" open={step === 8} onOpen={() => go(8)} done={false}>
          <div className="rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
            <div className="text-sm font-semibold text-brand-200">To add fractions</div>
            <div className="mt-2 text-lg">1. Make the bottom numbers the same</div>
            <div className="mt-1 text-lg">2. Add only the top numbers</div>
            <div className="mt-1 text-lg">3. Simplify if you can</div>
          </div>
          <p className="mt-4 rounded-xl bg-brand-50 px-4 py-3 text-sm text-ink-700">
            💡 <strong>Never add the bottoms.</strong> The bottom number tells you the <em>size</em> of the
            pieces — it isn&rsquo;t a thing you count.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <PrimaryButton onClick={() => onFinish?.()}>Practise this skill</PrimaryButton>
            <GhostButton onClick={() => go(1)}>Read it again</GhostButton>
          </div>
        </Step>

    </LessonShell>
  );
}
