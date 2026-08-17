"use client";

import { useState } from "react";
import { Step, KeyIdea, FormulaBox, WrongBox } from "@/components/lesson/Step";
import { LessonShell, TryIt } from "@/components/lesson/LessonShell";
import { NumberLine } from "@/components/lesson/Models";
import { PrimaryButton } from "@/components/ui";

/**
 * Comparing integers, and absolute value.
 *
 * Taught together because the confusion runs between them, not inside either:
 * a child who knows |−7| = 7 will then rank −7 above −3, because they have
 * quietly answered "which is further from zero?" instead of "which is bigger?".
 * Separating those two questions is the whole lesson.
 */
export function IntegerCompareLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [guess, setGuess] = useState<string | null>(null);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 6 · Integers · Comparing Integers"
      title="Which is bigger, −7 or −3?"
      minutes={6}
      step={step}
      total={6}
    >
      <Step n={1} title="Two cold mornings" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          On Monday the thermometer read <strong>−3 °C</strong>. On Tuesday it read{" "}
          <strong>−7 °C</strong>.
        </p>
        <p className="mt-3 text-ink-700">Which of the two temperatures is the bigger number?</p>
        <div className="mt-4 grid gap-2">
          {[
            { k: "b", label: "−7 — because 7 is bigger than 3" },
            { k: "a", label: "−3" },
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
            Put both on a number line and it settles itself.
            <div className="mt-3"><PrimaryButton onClick={() => go(2)}>Show me</PrimaryButton></div>
          </div>
        )}
      </Step>

      <Step n={2} title="The mistake almost everyone makes" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <WrongBox>−7 &gt; −3 &nbsp;&ldquo;because 7 is bigger than 3&rdquo;</WrongBox>
        <p className="text-ink-700">
          The instinct is reasonable — 7 <em>is</em> bigger than 3. But the minus sign is not
          decoration. It says which side of zero the number sits on.
        </p>
        <div className="mt-4 flex justify-center">
          <NumberLine from={-8} to={2} marks={[-7, -3]} label="−7 sits further left than −3" />
        </div>
        <p className="mt-4 text-ink-700">
          On a number line, <strong>further right is always bigger</strong> — and −7 is to the left
          of −3.
        </p>
        <p className="mt-3 text-center text-lg font-bold text-ok-600">−3 &gt; −7</p>
        <KeyIdea>
          Among negative numbers the order flips: the bigger the digits, the <strong>lower</strong>{" "}
          the number. −100 is colder, poorer and lower than −1.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(3)}>A way to remember it</PrimaryButton></div>
      </Step>

      <Step n={3} title="Think of it as money owed" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">
          A negative balance is a debt. Would you rather owe <strong>$3</strong> or{" "}
          <strong>$7</strong>? Owing $3 leaves you better off — so −3 is the bigger number.
        </p>
        <div className="mt-4 space-y-2">
          {[
            ["−7 or −3", "−3 is bigger", "owes less"],
            ["−1 or −9", "−1 is bigger", "owes less"],
            ["−5 or 2", "2 is bigger", "any positive beats any negative"],
            ["−6 or 0", "0 is bigger", "owing nothing beats owing something"],
          ].map(([a, b, c]) => (
            <div key={a} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-semibold text-ink-900">{a}</span>
              <span className="text-sm font-bold text-brand-700">{b}</span>
              <span className="text-sm text-ink-500">{c}</span>
            </div>
          ))}
        </div>
        <div className="mt-4"><PrimaryButton onClick={() => go(4)}>Putting three in order</PrimaryButton></div>
      </Step>

      <Step n={4} title="Ordering three numbers" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <p className="text-ink-700">
          Put <strong>−4, 3</strong> and <strong>−9</strong> in order, smallest first. Do not sort
          the digits — sort the positions.
        </p>
        <div className="mt-4 flex justify-center">
          <NumberLine from={-10} to={4} marks={[-9, -4, 3]} />
        </div>
        <p className="mt-4 text-center text-lg font-bold text-ok-600">−9, −4, 3</p>
        <p className="mt-3 text-ink-700">
          Reading a number line from left to right always gives you smallest to largest, whatever
          the signs are doing.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(5)}>What about |−7|?</PrimaryButton></div>
      </Step>

      <Step n={5} title="Absolute value is a different question" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">
          The bars in <strong>|−7|</strong> ask <em>how far from zero</em> the number is. Distance
          has no direction, so the answer is never negative.
        </p>
        <div className="mt-3 space-y-2">
          {[
            ["|−7|", "7", "7 steps from zero"],
            ["|7|", "7", "also 7 steps from zero"],
            ["|0|", "0", "no steps at all"],
            ["|−12|", "12", "12 steps from zero"],
          ].map(([a, b, c]) => (
            <div key={a} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-bold text-ink-900">{a}</span>
              <span className="text-sm font-bold text-brand-700">{b}</span>
              <span className="text-sm text-ink-500">{c}</span>
            </div>
          ))}
        </div>
        <WrongBox>|−7| &gt; |−3|, so −7 &gt; −3</WrongBox>
        <p className="text-ink-700">
          This is the trap the two ideas set for each other. It is perfectly true that −7 is further
          from zero than −3. But &ldquo;further from zero&rdquo; and &ldquo;bigger&rdquo; are
          different questions, and below zero they give <strong>opposite</strong> answers — a deeper
          dive and a colder morning are both further out and further down.
        </p>
        <KeyIdea>
          Two questions, two tools. <strong>How far from zero?</strong> use the bars.{" "}
          <strong>Which is bigger?</strong> use the number line.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(6)}>Your turn</PrimaryButton></div>
      </Step>

      <Step n={6} title="You try one" open={step === 6} onOpen={() => go(6)} done={false}>
        <p className="text-ink-700">
          Which is bigger: <strong>−12</strong> or <strong>−5</strong>?
        </p>
        <div className="mt-3 flex justify-center">
          <NumberLine from={-13} to={1} marks={[-12, -5]} />
        </div>
        <TryIt
          prompt={<>Type the bigger number:</>}
          accept={["-5", "−5"]}
          placeholder="like -8"
          value={fade}
          setValue={setFade}
          hint="whichever sits further right on the line wins. 12 is the bigger digit, but that is not the question."
          explain={
            <>
              <strong>−5</strong>. It sits further right, and in money terms owing $5 beats owing
              $12. Note that |−12| = 12 is the larger absolute value — a different question with the
              opposite answer.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Comparing integers</div>
          <div className="mt-2">1. Further right on the number line is bigger</div>
          <div className="mt-1">2. Every positive beats every negative; 0 beats them all</div>
          <div className="mt-1">3. |n| is distance from zero, not size order</div>
        </div>
        <KeyIdea>
          💡 Among negatives the usual order turns over. If your answer looks right because the
          digits were bigger, check the line before you trust it.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}

/**
 * Integer arithmetic.
 *
 * Two errors, and they pull in opposite directions. "Subtracting makes things
 * smaller" is carried over intact from whole numbers, so 5 − (−3) comes out as
 * 2. Then "two negatives make a positive" — learnt for multiplication — leaks
 * into addition, so −4 + (−6) comes out as 10. Both are handled by testing the
 * method against a thermometer or a bank balance, where a wrong answer is
 * visibly wrong.
 */
export function IntegerOpsLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 7 · Integers · Adding & Subtracting Integers"
      title="Taking away a negative"
      minutes={7}
      step={step}
      total={7}
    >
      <Step n={1} title="How much did it warm up?" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          At dawn it was <strong>−3 °C</strong>. By noon it was <strong>5 °C</strong>. How many
          degrees did the temperature climb?
        </p>
        <div className="mt-4 flex justify-center">
          <NumberLine from={-4} to={6} jumps={[{ from: -3, to: 5, text: "+8" }]} marks={[-3, 5]} />
        </div>
        <p className="mt-4 text-ink-700">
          Three degrees to get up to zero, then five more. <strong>8 degrees.</strong> And that
          question — the gap from −3 up to 5 — is written like this:
        </p>
        <FormulaBox>5 − (−3) = 8</FormulaBox>
        <KeyIdea>
          Subtracting made the answer <strong>bigger</strong> than the 5 you started with. That is
          not a trick; it is what the thermometer actually did.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(2)}>Why does that feel wrong?</PrimaryButton></div>
      </Step>

      <Step n={2} title="The mistake almost everyone makes" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <WrongBox>5 − (−3) = 2 &nbsp;&ldquo;subtracting always makes it smaller&rdquo;</WrongBox>
        <p className="text-ink-700">
          Test that answer against the morning. If the temperature had climbed only 2 degrees from
          −3, noon would have been <strong>−1 °C</strong>. It was 5. The thermometer disagrees, so
          the method is wrong — not the reader.
        </p>
        <p className="mt-3 text-ink-700">
          &ldquo;Subtracting makes it smaller&rdquo; is a rule learnt on whole numbers, where you
          only ever take away something positive. Take away something negative and it goes the other
          way.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(3)}>So what is really happening?</PrimaryButton></div>
      </Step>

      <Step n={3} title="Taking away a debt leaves you better off" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">
          Suppose you owe a friend $3 and they cancel it. Nobody handed you any money, yet you are{" "}
          <strong>$3 better off</strong> than you were. Removing a negative adds.
        </p>
        <FormulaBox>a − (−b) = a + b</FormulaBox>
        <div className="mt-3 space-y-2">
          {[
            ["5 − (−3)", "5 + 3 = 8", "two minuses in a row flip"],
            ["−2 − (−6)", "−2 + 6 = 4", "still climbs"],
            ["5 + (−3)", "5 − 3 = 2", "adding a debt takes away"],
            ["5 − 3", "2", "unchanged — only one minus"],
          ].map(([a, b, c]) => (
            <div key={a} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-bold text-ink-900">{a}</span>
              <span className="text-sm font-bold text-brand-700">{b}</span>
              <span className="text-sm text-ink-500">{c}</span>
            </div>
          ))}
        </div>
        <KeyIdea>
          The flip needs <strong>two</strong> signs sitting next to each other. A single minus is
          just ordinary subtraction and nothing changes.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(4)}>The other famous slip</PrimaryButton></div>
      </Step>

      <Step n={4} title="The second mistake almost everyone makes" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <WrongBox>−4 + (−6) = 10 &nbsp;&ldquo;two negatives make a positive&rdquo;</WrongBox>
        <p className="text-ink-700">
          Test it with the bank balance. You are $4 overdrawn, then you spend $6 more. Nobody thinks
          that leaves you $10 <em>up</em>. You are <strong>$10 in debt</strong>.
        </p>
        <div className="mt-3 space-y-2">
          {[
            ["−4 + (−6)", "−10", "two debts pile up — still a debt"],
            ["−4 − (−6)", "2", "a debt of 6 is cancelled"],
            ["−4 × (−6)", "24", "here the sign really does flip"],
          ].map(([a, b, c]) => (
            <div key={a} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-bold text-ink-900">{a}</span>
              <span className="text-sm font-bold text-brand-700">{b}</span>
              <span className="text-sm text-ink-500">{c}</span>
            </div>
          ))}
        </div>
        <KeyIdea>
          &ldquo;Two negatives make a positive&rdquo; is a rule about{" "}
          <strong>multiplying and dividing</strong>, and about a minus sitting directly in front of
          a negative. It says nothing about adding two negatives together.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(5)}>Why does multiplying flip?</PrimaryButton></div>
      </Step>

      <Step n={5} title="Why two negatives multiply to a positive" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">
          Not a rule to accept on trust — watch the pattern and carry it past zero.
        </p>
        <div className="mt-3 space-y-1.5">
          {[
            ["3 × (−4)", "−12"],
            ["2 × (−4)", "−8"],
            ["1 × (−4)", "−4"],
            ["0 × (−4)", "0"],
            ["−1 × (−4)", "4"],
            ["−2 × (−4)", "8"],
          ].map(([a, b], i) => (
            <div
              key={a}
              className={`flex items-center justify-between gap-2 rounded-xl px-3 py-1.5 ${
                i >= 4 ? "bg-brand-50" : "bg-paper"
              }`}
            >
              <span className="text-sm font-bold text-ink-900">{a}</span>
              <span className={`text-sm font-bold ${i >= 4 ? "text-ok-600" : "text-ink-700"}`}>{b}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-ink-700">
          Each step down the list, the left number falls by 1 and the answer climbs by 4. Keeping
          that going past zero <em>forces</em> −1 × (−4) to be 4. Nothing was decided by fiat.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(6)}>One more worked out</PrimaryButton></div>
      </Step>

      <Step n={6} title="A bigger one, step by step" open={step === 6} onOpen={() => go(6)} done={step > 6}>
        <p className="text-ink-700">Work out <strong>−7 − (−12)</strong>.</p>
        <div className="mt-4 rounded-2xl bg-paper p-4">
          <ol className="space-y-2">
            {[
              ["Two signs in a row, so they flip", "−7 + 12"],
              ["Start at −7 and climb 12", "7 up to zero, 5 more"],
              ["Answer", "5"],
            ].map(([a, b], i) => (
              <li key={i} className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 text-sm">
                <span className="text-ink-700">
                  <span className="mr-2 font-bold text-brand-600">{i + 1}.</span>
                  {a}
                </span>
                <span className="font-bold text-ink-900">{b}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="mt-4 flex justify-center">
          <NumberLine from={-8} to={6} jumps={[{ from: -7, to: 5, text: "+12" }]} marks={[-7, 5]} />
        </div>
        <p className="mt-3 text-ink-700">
          Sensible? You removed a debt bigger than the one you had, so you should end up above zero
          — and you did.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(7)}>Your turn</PrimaryButton></div>
      </Step>

      <Step n={7} title="You try one" open={step === 7} onOpen={() => go(7)} done={false}>
        <p className="text-ink-700">Work out <strong>3 − (−9)</strong>.</p>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          Two signs in a row, so they flip: the sum becomes <strong>3 + 9</strong>.
        </div>
        <TryIt
          prompt={<>2. Now finish it. What is 3 − (−9)?</>}
          accept={["12"]}
          placeholder="a number"
          value={fade}
          setValue={setFade}
          hint="a debt of 9 has been cancelled, so the answer must be bigger than 3 — not smaller."
          explain={
            <>
              <strong>12</strong>. Taking away a negative added it on. Check on the line: the gap
              from −9 up to 3 really is 12 steps.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Integer operations</div>
          <div className="mt-2">1. a − (−b) = a + b — taking away a negative adds</div>
          <div className="mt-1">2. a + (−b) = a − b — adding a negative subtracts</div>
          <div className="mt-1">3. Two negatives multiplied give a positive</div>
        </div>
        <KeyIdea>
          💡 Two signs must be <strong>touching</strong> before anything flips. −4 + (−6) is still
          −10, however many minus signs you can count in it.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
