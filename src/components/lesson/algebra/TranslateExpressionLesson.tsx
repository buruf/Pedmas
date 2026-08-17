"use client";

import { useState } from "react";
import { MathText } from "@/components/MathText";
import { Step, KeyIdea, WrongBox } from "@/components/lesson/Step";
import { LessonShell, TryIt } from "@/components/lesson/LessonShell";
import { PrimaryButton } from "@/components/ui";

/** A phrase paired with the expression it becomes. */
function PhraseRow({ phrase, expr, note }: { phrase: string; expr: string; note?: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
      <span className="text-sm text-ink-700">&ldquo;{phrase}&rdquo;</span>
      <span className="text-base font-bold text-ink-900">
        <MathText text={expr} />
      </span>
      {note && <span className="w-full text-xs text-ink-500">{note}</span>}
    </div>
  );
}

/**
 * Writing an expression from words.
 *
 * One phrase does most of the damage: "5 less than x". English says the 5
 * first, so it gets written first, and the subtraction comes out backwards.
 * The fix is not a rule to memorise — it is noticing which quantity is being
 * taken away, which a real age or price makes obvious.
 */
export function TranslateExpressionLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [guess, setGuess] = useState<string | null>(null);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 6 · Algebra · Writing Expressions"
      title="Turning words into algebra"
      minutes={6}
      step={step}
      total={6}
    >
      <Step n={1} title="You and your brother" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          You are <strong>5 years younger</strong> than your brother. You do not know how old he is,
          so call his age <MathText text="b" />.
        </p>
        <p className="mt-3 text-ink-700">Which one is your age?</p>
        <div className="mt-4 grid gap-2">
          {[
            { k: "wrong", label: "5 − b" },
            { k: "right", label: "b − 5" },
          ].map((o) => (
            <button
              key={o.k}
              type="button"
              onClick={() => setGuess(o.k)}
              className={`btn rounded-xl border-2 px-4 py-3 text-left text-lg font-bold ${
                guess === o.k ? "border-brand-600 bg-brand-50 text-brand-800" : "border-ink-100 bg-white"
              }`}
            >
              <MathText text={o.label} />
            </button>
          ))}
        </div>
        {guess && (
          <div className="mt-4 rounded-xl bg-paper px-4 py-3 text-sm text-ink-700 pop-in">
            Let&rsquo;s test both of them with a real age.
            <div className="mt-3">
              <PrimaryButton onClick={() => go(2)}>Test them</PrimaryButton>
            </div>
          </div>
        )}
      </Step>

      <Step n={2} title="The mistake almost everyone makes" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <WrongBox>
          &ldquo;5 less than <MathText text="b" />&rdquo; &nbsp;→&nbsp; <MathText text="5 − b" />
        </WrongBox>
        <p className="text-ink-700">
          It is what the sentence sounds like — you hear <em>five</em> first, so you write it first.
          Now put a real number in and see what the method claims.
        </p>
        <div className="mt-4 space-y-2">
          <div className="rounded-xl border-2 border-err-600/40 bg-err-100/50 px-4 py-3">
            <div className="text-sm font-semibold text-ink-700">Brother is 12, so this method says:</div>
            <div className="mt-1 text-lg font-bold text-ink-900">
              <MathText text="5 − 12 = −7" /> <span className="text-err-600">✗</span>
            </div>
            <div className="mt-1 text-sm text-ink-700">You are not minus seven years old.</div>
          </div>
          <div className="rounded-xl border border-ok-600/30 bg-ok-100 px-4 py-3">
            <div className="text-sm font-semibold text-ink-700">The other one says:</div>
            <div className="mt-1 text-lg font-bold text-ink-900">
              <MathText text="12 − 5 = 7" /> <span className="text-ok-600">✓</span>
            </div>
            <div className="mt-1 text-sm text-ink-700">Seven. That is a real age, and it is 5 less than 12.</div>
          </div>
        </div>
        <KeyIdea>
          Ask which quantity is being <strong>taken away</strong>. In &ldquo;5 less than b&rdquo; the
          5 is what leaves, so the 5 goes second: <MathText text="b − 5" />.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(3)}>Why does order matter here?</PrimaryButton>
        </div>
      </Step>

      <Step n={3} title="Two operations don't care, two do" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">
          You can swap the numbers round in an addition or a multiplication and nothing changes:
          4 + 9 and 9 + 4 are both 13. That is why &ldquo;5 more than n&rdquo; is never a problem.
        </p>
        <p className="mt-3 text-ink-700">
          Subtraction and division are not like that. 12 − 5 is 7, but 5 − 12 is −7. Two completely
          different answers — so for those two, the order you write is the whole answer.
        </p>
        <div className="mt-4 space-y-2">
          <PhraseRow phrase="5 more than n" expr="n + 5" />
          <PhraseRow phrase="the product of 5 and n" expr="5n" />
          <PhraseRow phrase="5 less than n" expr="n − 5" note="the 5 is taken away — it goes second" />
          <PhraseRow phrase="n less than 5" expr="5 − n" note="now n is the one being taken away" />
          <PhraseRow phrase="n divided by 5" expr="{n/5}" note="n is being shared out, so n is on top" />
          <PhraseRow phrase="5 divided by n" expr="{5/n}" />
        </div>
        <KeyIdea>
          The phrases that reverse on you: <strong>less than</strong>, <strong>fewer than</strong>,{" "}
          <strong>subtracted from</strong>, <strong>divided into</strong>.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(4)}>A two-step phrase</PrimaryButton>
        </div>
      </Step>

      <Step n={4} title="Building a longer phrase" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <p className="text-ink-700">
          &ldquo;<strong>7 less than 3 times a number n</strong>&rdquo;. Build it in the order the
          sentence builds it, one piece at a time.
        </p>
        <div className="mt-4 rounded-2xl bg-paper p-4">
          <ol className="space-y-2">
            {[
              ["3 times a number n", "3n"],
              ["7 less than that — the 7 leaves", "3n − 7"],
            ].map(([a, b], i) => (
              <li key={i} className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 text-sm">
                <span className="text-ink-700">
                  <span className="mr-2 font-bold text-brand-600">{i + 1}.</span>
                  <MathText text={a} />
                </span>
                <span className="font-bold text-ink-900">
                  <MathText text={b} />
                </span>
              </li>
            ))}
          </ol>
        </div>
        <p className="mt-4 text-ink-700">
          Test it with <MathText text="n = 5" />: 3 times 5 is 15, and 7 less than 15 is{" "}
          <strong>8</strong>. ✓
        </p>
        <p className="mt-3 text-ink-700">
          Watch what brackets would have done. <MathText text="3(n − 7)" /> at{" "}
          <MathText text="n = 5" /> gives 3 × (−2) = <strong>−6</strong> — that is &ldquo;3 times a
          number that is 7 less than n&rdquo;, a different sentence entirely.
        </p>
        <KeyIdea>
          Brackets are how you say &ldquo;do this bit first&rdquo;. If the phrase does not ask for
          that, do not add them.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(5)}>In real life</PrimaryButton>
        </div>
      </Step>

      <Step n={5} title="Rates and one-off amounts" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">
          Most word problems are the same shape: something that repeats, plus something that happens
          once.
        </p>
        <div className="mt-3 space-y-2">
          <PhraseRow
            phrase="Tickets cost $6 each, plus a $4 booking fee"
            expr="6t + 4"
            note="the $6 repeats for every ticket, the $4 happens once"
          />
          <PhraseRow
            phrase="Tickets cost $6 each, with $4 off the total"
            expr="6t − 4"
            note="same shape, but the one-off amount comes off"
          />
        </div>
        <p className="mt-4 text-ink-700">
          Notice what does <em>not</em> work: <MathText text="10t" />. Adding the 6 and the 4
          together would charge the booking fee once per ticket instead of once per order.
        </p>
        <KeyIdea>
          Whatever gets multiplied by the letter is the thing that repeats. Anything that happens
          only once stands on its own.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(6)}>Your turn</PrimaryButton>
        </div>
      </Step>

      <Step n={6} title="You try one" open={step === 6} onOpen={() => go(6)} done={false}>
        <p className="text-ink-700">
          Write &ldquo;<strong>4 less than 6 times a number n</strong>&rdquo; as an expression, then
          find its value when <MathText text="n = 3" />.
        </p>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          Six times three is <strong>18</strong>.
        </div>
        <TryIt
          prompt={<>2. Now take away 4. What is the value?</>}
          accept={["14"]}
          placeholder="the answer"
          value={fade}
          setValue={setFade}
          hint="the 4 is the amount being taken away, so it comes off the 18."
          explain={
            <>
              The expression is <MathText text="6n − 4" />, and at <MathText text="n = 3" /> that is
              18 − 4 = <strong>14</strong>. Written backwards as{" "}
              <MathText text="4 − 6n" /> it would have given −14 instead.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Words into algebra</div>
          <div className="mt-2">1. Find the two quantities</div>
          <div className="mt-1">2. Find the operation word</div>
          <div className="mt-1">3. Ask which one is taken away or shared out — it goes second</div>
          <div className="mt-1">4. Try a real number to check it makes sense</div>
        </div>
        <KeyIdea>
          💡 &ldquo;Less than&rdquo; reverses the order you hear it in. Testing your expression with
          one real number catches it every single time.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
