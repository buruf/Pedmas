"use client";

import { useState } from "react";
import { MathText } from "@/components/MathText";
import { Step, KeyIdea, FormulaBox, WrongBox } from "@/components/lesson/Step";
import { LessonShell, TryIt } from "@/components/lesson/LessonShell";
import { PrimaryButton } from "@/components/ui";

/**
 * The order of operations — the lesson this platform is named after.
 *
 * Two misconceptions are confronted, not one. The first is the famous one:
 * working strictly left to right, so 2 + 3 × 4 becomes 20. The second is the
 * one almost every adult still carries: reading P-E-D-M-A-S as a six-step
 * queue, so multiplication is believed to outrank division. That belief turns
 * 8 ÷ 2 × 4 into 1 instead of 16, and it survives school because most textbook
 * exercises never put a ÷ to the left of a ×.
 *
 * The fix is structural rather than mnemonic: the rule is FOUR TIERS, not six
 * letters. × and ÷ share a tier; + and − share a tier; inside a tier you go
 * left to right. Stated that way, PEDMAS and PEMDAS and BODMAS all say the same
 * thing, which is exactly why the different spellings never caused an argument.
 */

/* ------------------------------------------------------------------ visuals */

const TIERS = [
  {
    key: "P",
    name: "Parentheses",
    also: "brackets ( )",
    note: "Whatever is inside, do it first.",
    tone: "bg-brand-600",
  },
  {
    key: "E",
    name: "Exponents",
    also: "powers, like 4²",
    note: "A power only grabs the number it sits on.",
    tone: "bg-brand-500",
  },
  {
    key: "D M",
    name: "Divide & Multiply",
    also: "one tier, together",
    note: "Left to right. Neither one outranks the other.",
    tone: "bg-warn-600",
  },
  {
    key: "A S",
    name: "Add & Subtract",
    also: "one tier, together",
    note: "Left to right. Neither one outranks the other.",
    tone: "bg-warn-600",
  },
];

/** The rule as four tiers rather than six letters. */
function TierLadder({ highlight }: { highlight?: string }) {
  return (
    <div className="mx-auto max-w-md space-y-2">
      {TIERS.map((t) => {
        const on = highlight === t.key;
        return (
          <div
            key={t.key}
            className={`flex items-center gap-3 rounded-xl border-2 px-3 py-2.5 transition ${
              on ? "border-brand-600 bg-brand-50" : "border-ink-100 bg-white"
            }`}
          >
            <span
              className={`flex h-9 shrink-0 items-center justify-center rounded-lg px-2.5 text-sm font-black text-white ${t.tone}`}
            >
              {t.key}
            </span>
            <span className="flex-1">
              <span className="block text-sm font-bold text-ink-900">{t.name}</span>
              <span className="block text-xs text-ink-500">{t.also}</span>
            </span>
            <span className="hidden max-w-[9.5rem] text-right text-xs text-ink-700 sm:block">
              {t.note}
            </span>
          </div>
        );
      })}
      <p className="pt-1 text-center text-xs font-semibold text-ink-500">
        Four tiers, not six letters. The bottom two tiers each hold two operations.
      </p>
    </div>
  );
}

/**
 * An expression peeled one tier at a time. Showing the whole expression get
 * rewritten — rather than a list of side calculations — is what stops a child
 * losing the parts they have not touched yet.
 */
function Peel({
  rows,
  answer,
}: {
  rows: { line: string; note: string }[];
  answer?: string;
}) {
  return (
    <div className="mx-auto max-w-md space-y-1.5">
      {rows.map((r, i) => (
        <div
          key={i}
          className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-xl bg-paper px-3 py-2.5"
        >
          <span className="text-lg font-bold tabular-nums text-ink-900">
            <MathText text={r.line} />
          </span>
          <span className="text-xs font-semibold text-ink-500">{r.note}</span>
        </div>
      ))}
      {answer && (
        <p className="pt-1 text-center text-xl font-black text-ok-600">
          <MathText text={answer} />
        </p>
      )}
    </div>
  );
}

/** The wrong route and the right route, side by side, so the fork is visible. */
function TwoWays({
  wrongTitle,
  wrong,
  wrongAnswer,
  rightTitle,
  right,
  rightAnswer,
}: {
  wrongTitle: string;
  wrong: string[];
  wrongAnswer: string;
  rightTitle: string;
  right: string[];
  rightAnswer: string;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-xl border-2 border-err-600/40 bg-err-100/50 px-3 py-3">
        <div className="text-xs font-bold uppercase tracking-wide text-err-600">{wrongTitle}</div>
        <div className="mt-2 space-y-1">
          {wrong.map((w, i) => (
            <div key={i} className="text-base font-bold tabular-nums text-ink-900">
              <MathText text={w} />
            </div>
          ))}
        </div>
        <div className="mt-2 text-lg font-black text-err-600">
          <MathText text={wrongAnswer} /> ✗
        </div>
      </div>
      <div className="rounded-xl border-2 border-ok-600/40 bg-ok-100 px-3 py-3">
        <div className="text-xs font-bold uppercase tracking-wide text-ok-600">{rightTitle}</div>
        <div className="mt-2 space-y-1">
          {right.map((r, i) => (
            <div key={i} className="text-base font-bold tabular-nums text-ink-900">
              <MathText text={r} />
            </div>
          ))}
        </div>
        <div className="mt-2 text-lg font-black text-ok-600">
          <MathText text={rightAnswer} /> ✓
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------- lesson */

export function OrderOfOpsLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [guess, setGuess] = useState<string | null>(null);
  const [tier, setTier] = useState("");
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 4–6 · Whole Numbers · Order of Operations"
      title="PEDMAS: the order every calculation follows"
      minutes={9}
      step={step}
      total={10}
    >
      {/* 1 — hook */}
      <Step n={1} title="One expression, two answers" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          You buy one drink for <strong>£2</strong> and three sandwiches at <strong>£4</strong> each.
        </p>
        <FormulaBox>
          <MathText text="2 + 3 × 4" />
        </FormulaBox>
        <p className="text-ink-700">Two people work it out and get different answers.</p>
        <div className="mt-4 grid gap-2">
          {[
            { k: "a", label: "20 — go left to right: 2 + 3 = 5, then 5 × 4 = 20" },
            { k: "b", label: "14 — do 3 × 4 first, then add the 2" },
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
          <div className="mt-4 rounded-xl bg-paper px-4 py-3 text-sm text-ink-700 pop-in">
            The till knows. Let&rsquo;s go and pay.
            <div className="mt-3">
              <PrimaryButton onClick={() => go(2)}>Check at the till</PrimaryButton>
            </div>
          </div>
        )}
      </Step>

      {/* 2 — the real world settles it */}
      <Step n={2} title="The shop settles the argument" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <p className="text-ink-700">Count the money, not the symbols.</p>
        <div className="mt-4 space-y-2">
          {[
            ["1 drink", "£2"],
            ["3 sandwiches at £4", "£4 + £4 + £4 = £12"],
            ["Total", "£14"],
          ].map(([a, b], i) => (
            <div
              key={i}
              className={`flex items-center justify-between gap-3 rounded-xl px-3 py-2 ${
                i === 2 ? "bg-ok-100 font-black text-ok-600" : "bg-paper text-ink-700"
              }`}
            >
              <span className="text-sm font-semibold">{a}</span>
              <span className="font-bold">{b}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-ink-700">
          <strong>14</strong> is the real total. So &ldquo;left to right&rdquo; got it wrong — and it
          got it wrong for a reason worth knowing.
        </p>
        <WrongBox>
          <MathText text="2 + 3 × 4 = 20" /> &nbsp;&ldquo;because I read left to right&rdquo;
        </WrongBox>
        <p className="text-ink-700">
          Reading left to right is a habit from words, not from numbers. Nobody decided arithmetic
          should copy it. Somebody had to decide something, though — otherwise{" "}
          <MathText text="2 + 3 × 4" /> would mean two different things and no calculator on earth
          could be trusted.
        </p>
        <KeyIdea>
          An expression has to mean <strong>exactly one thing</strong>. The order of operations is the
          agreement that makes that true.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(3)}>Show me the agreement</PrimaryButton>
        </div>
      </Step>

      {/* 3 — the tiers */}
      <Step n={3} title="The rule is four tiers" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">
          You may have met it as a word: <strong>PEDMAS</strong>. Or PEMDAS. Or BODMAS, or BIDMAS.
          Different countries, different spellings, <em>same rule</em> — and the spellings never
          caused a single argument, because of what comes next.
        </p>
        <div className="mt-4">
          <TierLadder />
        </div>
        <p className="mt-4 text-ink-700">
          Look at the bottom two rows. Divide and Multiply are on <strong>one</strong> tier. Add and
          Subtract are on <strong>one</strong> tier. That is why PEDMAS and PEMDAS agree: swapping D
          and M changes nothing, because they were never in an order to begin with.
        </p>
        <KeyIdea>
          Work down the tiers. <strong>Inside a tier, work left to right.</strong> That second
          sentence is the one people forget, and it is where nearly every wrong answer comes from.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(4)}>Why does × beat + ?</PrimaryButton>
        </div>
      </Step>

      {/* 4 — why multiply binds tighter */}
      <Step n={4} title="Why multiplying goes first" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <p className="text-ink-700">
          This is not a random ranking. <MathText text="3 × 4" /> is short for{" "}
          <MathText text="4 + 4 + 4" />. It is <em>already</em> an addition, just written compactly.
        </p>
        <div className="mt-4 rounded-2xl bg-paper p-4 text-center">
          <div className="text-lg font-bold text-ink-900">
            <MathText text="2 + 3 × 4" />
          </div>
          <div className="mt-1 text-xs font-semibold text-ink-500">unpack the ×</div>
          <div className="mt-2 text-lg font-bold text-ink-900">
            2 + <span className="rounded-lg bg-brand-100 px-2 py-0.5 text-brand-800">4 + 4 + 4</span>
          </div>
          <div className="mt-2 text-xl font-black text-ok-600">= 14</div>
        </div>
        <p className="mt-4 text-ink-700">
          The <MathText text="3 × 4" /> is one <strong>bundle</strong>. You cannot add the £2 to part
          of a bundle. So the bundle gets built first, then it joins the sum.
        </p>
        <KeyIdea>
          × and ÷ hold their numbers together more tightly than + and −. Doing them first is just
          respecting the bundles.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(5)}>Now the trap</PrimaryButton>
        </div>
      </Step>

      {/* 5 — THE trap */}
      <Step n={5} title="The trap almost every adult falls into" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">
          Here is the one that catches grown-ups, teachers and internet arguments alike.
        </p>
        <FormulaBox>
          <MathText text="8 ÷ 2 × 4" />
        </FormulaBox>
        <p className="text-ink-700">
          Lots of people read PEDMAS as a <strong>queue</strong>: P, then E, then D, then M, then A,
          then S — six steps, one after another. Read that way, you would do the multiply before the
          divide.
        </p>
        <div className="mt-4">
          <TwoWays
            wrongTitle="Treating M as its own step"
            wrong={["2 × 4 = 8", "8 ÷ 8 = 1"]}
            wrongAnswer="1"
            rightTitle="One tier, left to right"
            right={["8 ÷ 2 = 4", "4 × 4 = 16"]}
            rightAnswer="16"
          />
        </div>
        <p className="mt-4 text-ink-700">
          The answer is <strong>16</strong>. And it is not a technicality — here is why ÷ and × can
          never be ranked against each other.
        </p>
        <div className="mt-3 rounded-2xl border-2 border-brand-200 bg-brand-50 p-4 text-center">
          <p className="text-sm font-semibold text-ink-700">
            Dividing by 2 <em>is</em> multiplying by <MathText text="{1/2}" />.
          </p>
          <div className="mt-2 text-lg font-bold text-ink-900">
            <MathText text="8 ÷ 2 × 4" /> &nbsp;=&nbsp; <MathText text="8 × {1/2} × 4" />
          </div>
          <div className="mt-2 text-lg font-black text-ok-600">= 4 × 4 = 16</div>
        </div>
        <p className="mt-4 text-ink-700">
          Division is multiplication wearing a different coat. You cannot put an operation ahead of
          itself. Same story for subtraction: taking away 4 is adding <MathText text="−4" />. That is
          why each of those pairs shares a tier.
        </p>
        <KeyIdea>
          💡 <strong>The letters are not a queue.</strong> PEDMAS has six letters but only four tiers.
          Inside the bottom two tiers, position on the page decides — leftmost goes first.
        </KeyIdea>
        <p className="mt-4 text-ink-700">
          One for you. Same shape, different numbers: <MathText text="30 ÷ 5 × 3" />.
        </p>
        <TryIt
          prompt={<>Work along the tier from the left:</>}
          accept={["18"]}
          placeholder="the answer"
          value={tier}
          setValue={setTier}
          hint="the ÷ is further left, so it goes first. 30 ÷ 5 comes before anything else."
          explain={
            <>
              <MathText text="30 ÷ 5 = 6" />, then <MathText text="6 × 3 = 18" />. Doing the × first
              would have given <MathText text="30 ÷ 15 = 2" /> — a completely different number.
            </>
          }
          onCorrect={() => go(6)}
        />
      </Step>

      {/* 6 — same trap, bottom tier */}
      <Step n={6} title="The same trap with + and −" open={step === 6} onOpen={() => go(6)} done={step > 6}>
        <p className="text-ink-700">
          The bottom tier has an identical twin of that trap, and it is easier to feel because it is
          about money.
        </p>
        <FormulaBox>
          <MathText text="10 − 4 + 3" />
        </FormulaBox>
        <p className="text-ink-700">
          You have £10. You spend £4. Then you earn £3. How much is in your pocket?
        </p>
        <div className="mt-4">
          <TwoWays
            wrongTitle="Treating A as its own step"
            wrong={["4 + 3 = 7", "10 − 7 = 3"]}
            wrongAnswer="3"
            rightTitle="One tier, left to right"
            right={["10 − 4 = 6", "6 + 3 = 9"]}
            rightAnswer="9"
          />
        </div>
        <p className="mt-4 text-ink-700">
          You end with <strong>£9</strong>, and you can check that on your fingers. Doing the A of
          PEDMAS &ldquo;before&rdquo; the S would have left you £6 short of the truth.
        </p>
        <KeyIdea>
          The minus sign belongs to the number just after it. <MathText text="10 − 4 + 3" /> is really{" "}
          <MathText text="10 + (−4) + 3" /> — and those you may add in any order at all.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(7)}>What if I want the other order?</PrimaryButton>
        </div>
      </Step>

      {/* 7 — brackets */}
      <Step n={7} title="Brackets: how to say what you mean" open={step === 7} onOpen={() => go(7)} done={step > 7}>
        <p className="text-ink-700">
          Back at step 1, someone answered <strong>20</strong>. That answer is not nonsense. It is the
          correct answer to a <em>different</em> question — and brackets are how you ask it.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-paper px-3 py-3 text-center">
            <div className="text-lg font-bold text-ink-900">
              <MathText text="2 + 3 × 4" />
            </div>
            <div className="mt-1 text-xs text-ink-500">a £2 drink and three £4 sandwiches</div>
            <div className="mt-2 text-xl font-black text-ok-600">14</div>
          </div>
          <div className="rounded-xl bg-paper px-3 py-3 text-center">
            <div className="text-lg font-bold text-ink-900">
              <MathText text="(2 + 3) × 4" />
            </div>
            <div className="mt-1 text-xs text-ink-500">five items, £4 each… no — 2 + 3 things, ×4</div>
            <div className="mt-2 text-xl font-black text-ok-600">20</div>
          </div>
        </div>
        <p className="mt-4 text-ink-700">
          Brackets are not an extra rule to memorise. They are a way of{" "}
          <strong>overriding the tiers</strong> — a note that says &ldquo;whatever the ranking says,
          do this bit first.&rdquo;
        </p>
        <div className="mt-4">
          <Peel
            rows={[
              { line: "(2 + 3) × 4", note: "brackets first" },
              { line: "5 × 4", note: "then the × tier" },
            ]}
            answer="= 20"
          />
        </div>
        <KeyIdea>
          If you ever want an answer done in an unusual order, do not argue with PEDMAS — put in
          brackets. That is what they are for.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(8)}>Next tier up: exponents</PrimaryButton>
        </div>
      </Step>

      {/* 8 — exponents */}
      <Step n={8} title="Exponents sit above × and ÷" open={step === 8} onOpen={() => go(8)} done={step > 8}>
        <p className="text-ink-700">
          A power is an even tighter bundle. <MathText text="2^3" /> means{" "}
          <MathText text="2 × 2 × 2 = 8" />, and it only ever grabs the number it is sitting on.
        </p>
        <div className="mt-4">
          <TwoWays
            wrongTitle="Power spread too wide"
            wrong={["5 × 2 = 10", "10^3 = 1000"]}
            wrongAnswer="1000"
            rightTitle="Power grabs only the 2"
            right={["2^3 = 8", "5 × 8 = 40"]}
            rightAnswer="40"
          />
        </div>
        <p className="mt-4 text-ink-700">
          So <MathText text="5 × 2^3 = 40" />. And in a sum, the power still goes first:
        </p>
        <div className="mt-3">
          <Peel
            rows={[
              { line: "3 + 2^3", note: "exponent tier first" },
              { line: "3 + 8", note: "then the + tier" },
            ]}
            answer="= 11"
          />
        </div>
        <KeyIdea>
          Tightest first: powers, then bundles (× ÷), then loose joins (+ −). Brackets outrank all
          three.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(9)}>Put it all together</PrimaryButton>
        </div>
      </Step>

      {/* 9 — worked examples */}
      <Step n={9} title="All four tiers at once" open={step === 9} onOpen={() => go(9)} done={step > 9}>
        <p className="text-ink-700">
          Work <MathText text="3 × (4 + 2) − 4^2" />. Take one tier at a time and rewrite the whole
          line each time — never do two tiers in one go.
        </p>
        <div className="mt-4">
          <Peel
            rows={[
              { line: "3 × (4 + 2) − 4^2", note: "P — brackets: 4 + 2 = 6" },
              { line: "3 × 6 − 4^2", note: "E — exponents: 4^2 = 16" },
              { line: "3 × 6 − 16", note: "D M — multiply: 3 × 6 = 18" },
              { line: "18 − 16", note: "A S — subtract" },
            ]}
            answer="= 2"
          />
        </div>
        <p className="mt-5 text-ink-700">
          One more, with a ÷ and a × on the same tier —{" "}
          <MathText text="12 ÷ 4 + 5 × 3" />. Both belong to the D M tier, so <em>both</em> get done
          before anything is added.
        </p>
        <div className="mt-3">
          <Peel
            rows={[
              { line: "12 ÷ 4 + 5 × 3", note: "D M tier, left to right: 12 ÷ 4 = 3" },
              { line: "3 + 5 × 3", note: "still the D M tier: 5 × 3 = 15" },
              { line: "3 + 15", note: "now the A S tier" },
            ]}
            answer="= 18"
          />
        </div>
        <KeyIdea>
          Finish a whole tier before dropping to the next one. Sweeping left to right and clearing
          every × and ÷ you meet is what stops you skipping one.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(10)}>Your turn</PrimaryButton>
        </div>
      </Step>

      {/* 10 — faded + rule */}
      <Step n={10} title="You try one — I'll start it" open={step === 10} onOpen={() => go(10)} done={false}>
        <p className="text-ink-700">
          Work out <MathText text="2 × (5 + 3) − 3^2" />.
        </p>
        <div className="mt-3 space-y-1.5">
          <div className="rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
            <span className="font-bold text-brand-600">P. </span>
            Brackets: <MathText text="5 + 3 = 8" />, so the line becomes{" "}
            <strong>
              <MathText text="2 × 8 − 3^2" />
            </strong>
            .
          </div>
          <div className="rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
            <span className="font-bold text-brand-600">E. </span>
            Exponents: <MathText text="3^2 = 9" />, so the line becomes{" "}
            <strong>
              <MathText text="2 × 8 − 9" />
            </strong>
            .
          </div>
        </div>
        <TryIt
          prompt={<>Now finish the last two tiers. What is the answer?</>}
          accept={["7"]}
          placeholder="the answer"
          value={fade}
          setValue={setFade}
          hint="the × tier comes before the − tier. Do 2 × 8 first, then subtract the 9."
          explain={
            <>
              <MathText text="2 × 8 = 16" />, then <MathText text="16 − 9 = 7" />. Subtracting before
              multiplying would have given <MathText text="2 × (−1)" /> — the tiers stopped that.
            </>
          }
          onCorrect={() => onFinish?.()}
        />

        <div className="mt-5">
          <TierLadder />
        </div>

        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">PEDMAS, said properly</div>
          <div className="mt-2">1. Brackets first — they outrank everything</div>
          <div className="mt-1">2. Then exponents</div>
          <div className="mt-1">3. Then × and ÷ together, left to right</div>
          <div className="mt-1">4. Then + and − together, left to right</div>
        </div>
        <KeyIdea>
          💡 The letters are a reminder, not a queue. <MathText text="8 ÷ 2 × 4 = 16" />, not 1, and{" "}
          <MathText text="10 − 4 + 3 = 9" />, not 3. When two operations share a tier, the one further
          left goes first — every single time.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
