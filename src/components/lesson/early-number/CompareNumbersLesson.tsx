"use client";

import { useState } from "react";
import { Step, KeyIdea, WrongBox } from "@/components/lesson/Step";
import { LessonShell, TryIt } from "@/components/lesson/LessonShell";
import { TenFrame, NumberLine } from "@/components/lesson/Models";
import { PrimaryButton } from "@/components/ui";

/**
 * Comparing and ordering small numbers (compare-numbers / order-numbers with
 * a small `max`).
 *
 * The misconception is the first-digit habit: 9 is read as greater than 12
 * because 9 beats 1. It is not carelessness — the child is comparing the two
 * symbols they can see, and 9 really is greater than 1. What they have not yet
 * been told is that the 1 in 12 is not one, it is one *ten*. The ten frame and
 * the number line are used together so "further along when counting" and "has
 * a whole ten" arrive as the same fact.
 */

/** Two numbers side by side with the comparison symbol between them. */
function SymbolRow({
  left,
  symbol,
  right,
  note,
}: {
  left: number;
  symbol: string;
  right: number;
  note: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
      <span className="flex items-center gap-2 text-xl font-bold text-ink-900">
        <span>{left}</span>
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
          {symbol}
        </span>
        <span>{right}</span>
      </span>
      <span className="text-sm text-ink-700">{note}</span>
    </div>
  );
}

export function CompareNumbersLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [guess, setGuess] = useState<string | null>(null);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 1 · Number · Comparing numbers"
      title="Which number is bigger?"
      minutes={6}
      step={step}
      total={7}
    >
      <Step n={1} title="Stickers" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          You have <strong>9</strong> stickers. Your friend has <strong>12</strong>.
        </p>
        <p className="mt-3 text-ink-700">Who has more?</p>
        <div className="mt-4 grid gap-2">
          {[
            { k: "a", label: "You — 9 is a big number" },
            { k: "b", label: "Your friend" },
          ].map((o) => (
            <button
              key={o.k}
              type="button"
              onClick={() => setGuess(o.k)}
              className={`btn rounded-xl border-2 px-4 py-3 text-left text-base font-bold ${
                guess === o.k
                  ? "border-brand-600 bg-brand-50 text-brand-800"
                  : "border-ink-100 bg-white"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
        {guess && (
          <div className="mt-4 rounded-xl bg-paper px-4 py-3 text-sm text-ink-700 pop-in">
            Let&rsquo;s lay the stickers out and look.
            <div className="mt-3">
              <PrimaryButton onClick={() => go(2)}>Show me</PrimaryButton>
            </div>
          </div>
        )}
      </Step>

      <Step n={2} title="Lay them out" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <div className="mt-2 grid gap-5 sm:grid-cols-2">
          <div className="flex justify-center">
            <TenFrame filled={9} label="you — 9" />
          </div>
          <div className="flex justify-center">
            <TenFrame filled={10} extra={2} label="your friend — 12" />
          </div>
        </div>
        <p className="mt-4 text-center text-lg font-bold text-ok-600">
          Your friend has more. 12 is bigger.
        </p>
        <p className="mt-3 text-ink-700">
          Your friend filled a whole box of ten, and still had 2 left. You did not fill your box.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(3)}>But 9 looked bigger!</PrimaryButton>
        </div>
      </Step>

      <Step n={3} title="Why 9 looked bigger" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <WrongBox>9 is more than 12 &nbsp;&ldquo;because 9 beats 1&rdquo;</WrongBox>
        <p className="text-ink-700">
          Lots of people do this. And the thinking is fair &mdash; 9 <em>is</em> bigger than 1.
        </p>
        <p className="mt-3 text-ink-700">But the 1 in 12 is not one thing. It is one whole ten.</p>
        <div className="mt-4 space-y-2">
          <div className="rounded-xl bg-paper px-3 py-2 text-center font-bold text-ink-900">
            12 = <span className="text-brand-600">1 ten</span> and{" "}
            <span className="text-warn-600">2 ones</span>
          </div>
          <div className="rounded-xl bg-paper px-3 py-2 text-center font-bold text-ink-900">
            9 = <span className="text-brand-600">0 tens</span> and{" "}
            <span className="text-warn-600">9 ones</span>
          </div>
        </div>
        <KeyIdea>
          Digits do not mean anything on their own. It matters <strong>where</strong> a digit sits.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(4)}>Show me an easier way</PrimaryButton>
        </div>
      </Step>

      <Step n={4} title="Use the counting line" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <p className="text-ink-700">You count 9 first. You count 12 later.</p>
        <div className="mt-4 flex justify-center">
          <NumberLine from={0} to={15} marks={[9, 12]} />
        </div>
        <p className="mt-4 text-ink-700">
          12 sits further to the <strong>right</strong>. Further right always means more.
        </p>
        <KeyIdea>
          Whichever number you say <strong>later</strong> when counting is the bigger one. That
          never fails.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(5)}>Learn the signs</PrimaryButton>
        </div>
      </Step>

      <Step n={5} title="The signs < and >" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">
          The sign is like a hungry mouth. The open end always points at the bigger number.
        </p>
        <div className="mt-3 space-y-2">
          <SymbolRow left={9} symbol="<" right={12} note="9 is less than 12" />
          <SymbolRow left={12} symbol=">" right={9} note="12 is greater than 9" />
          <SymbolRow left={7} symbol="=" right={7} note="the same" />
        </div>
        <p className="mt-4 text-ink-700">
          The small pointy end points at the smaller number. Both rows above say exactly the same
          thing.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(6)}>Put three in order</PrimaryButton>
        </div>
      </Step>

      <Step n={6} title="Putting numbers in order" open={step === 6} onOpen={() => go(6)} done={step > 6}>
        <p className="text-ink-700">
          Put <strong>3</strong>, <strong>15</strong> and <strong>9</strong> from smallest to
          biggest.
        </p>
        <div className="mt-4 flex justify-center">
          <NumberLine from={0} to={15} marks={[3, 9, 15]} />
        </div>
        <p className="mt-4 text-ink-700">Find them on the line. Then read from left to right.</p>
        <div className="mt-3 flex items-center justify-center gap-2 text-xl font-bold text-ok-600">
          <span>3</span>
          <span className="text-ink-500">&lt;</span>
          <span>9</span>
          <span className="text-ink-500">&lt;</span>
          <span>15</span>
        </div>
        <KeyIdea>
          Smallest to biggest is just <strong>left to right</strong> on the counting line.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(7)}>Your turn</PrimaryButton>
        </div>
      </Step>

      <Step n={7} title="You try one" open={step === 7} onOpen={() => go(7)} done={false}>
        <p className="text-ink-700">
          Here are three numbers: <strong>14</strong>, <strong>6</strong>, <strong>11</strong>.
        </p>
        <div className="mt-3 flex justify-center">
          <NumberLine from={0} to={15} marks={[6, 11, 14]} />
        </div>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          The smallest one is the one furthest to the <strong>left</strong>.
        </div>
        <TryIt
          prompt={<>2. Type the smallest number:</>}
          accept={["6"]}
          placeholder="smallest"
          value={fade}
          setValue={setFade}
          hint="which one do you say first when you count? 6, then 11, then 14."
          explain={
            <>
              <strong>6</strong> is smallest. In order they go 6, 11, 14 &mdash; and 6 is the only
              one with no whole ten inside it.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Comparing numbers</div>
          <div className="mt-2">1. Later when counting means bigger</div>
          <div className="mt-1">2. Count the tens first, then the ones</div>
          <div className="mt-1">3. The open end of &lt; or &gt; faces the bigger number</div>
        </div>
        <KeyIdea>
          💡 Never judge a number by its first digit alone. 9 is one digit. 12 is a ten plus 2.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
