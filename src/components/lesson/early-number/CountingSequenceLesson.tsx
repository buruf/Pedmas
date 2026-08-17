"use client";

import { useState } from "react";
import { Step, KeyIdea, WrongBox } from "@/components/lesson/Step";
import { LessonShell, TryIt } from "@/components/lesson/LessonShell";
import { BaseTen, BaseTenKey } from "@/components/lesson/Models";
import { PrimaryButton } from "@/components/ui";

/**
 * Counting on and back with bigger numbers (counting family, `max` >= 100).
 *
 * The famous stall point: "twenty-eight, twenty-nine, twenty-ten". The number
 * names from 21 to 29 are wonderfully regular, so a child extends the pattern
 * one step too far. Nothing in the spoken name warns them that nine is the
 * last digit. The base-ten blocks are used because they show the actual event
 * — ten ones filling up and becoming one more ten — that the words hide.
 */

/** A short run of counting numbers, with one slot blank. */
function CountRun({
  terms,
  caption,
}: {
  terms: (string | number)[];
  caption?: string;
}) {
  return (
    <figure className="m-0">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {terms.map((t, i) => {
          const blank = t === "?";
          return (
            <span
              key={i}
              className={`flex h-11 min-w-[3rem] items-center justify-center rounded-xl px-2 text-lg font-bold ${
                blank
                  ? "border-2 border-dashed border-brand-500 bg-white text-brand-600"
                  : "bg-brand-100 text-brand-800"
              }`}
            >
              {t}
            </span>
          );
        })}
      </div>
      {caption && (
        <figcaption className="mt-2 text-center text-sm font-semibold text-ink-700">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

export function CountingSequenceLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [guess, setGuess] = useState<string | null>(null);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 2 · Number · Counting on"
      title="Counting past a nine"
      minutes={5}
      step={step}
      total={6}
    >
      <Step n={1} title="Counting your steps" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">You are counting your steps. You are up to 29.</p>
        <div className="mt-4">
          <CountRun terms={[27, 28, 29, "?"]} />
        </div>
        <p className="mt-4 text-ink-700">What do you say next?</p>
        <div className="mt-3 grid gap-2">
          {["twenty-ten", "thirty", "two hundred ten"].map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => setGuess(o)}
              className={`btn rounded-xl border-2 px-4 py-3 text-left text-lg font-bold ${
                guess === o
                  ? "border-brand-600 bg-brand-50 text-brand-800"
                  : "border-ink-100 bg-white"
              }`}
            >
              {o}
            </button>
          ))}
        </div>
        {guess && (
          <div className="mt-4 rounded-xl bg-paper px-4 py-3 text-sm text-ink-700 pop-in">
            Let&rsquo;s look at what 29 is actually made of.
            <div className="mt-3">
              <PrimaryButton onClick={() => go(2)}>Show me</PrimaryButton>
            </div>
          </div>
        )}
      </Step>

      <Step n={2} title="What a number is made of" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <p className="text-ink-700">
          <strong>29</strong> is 2 tens and 9 ones.
        </p>
        <div className="mt-4 flex justify-center">
          <BaseTen tens={2} ones={9} label="2 tens and 9 ones = 29" />
        </div>
        <div className="mt-3">
          <BaseTenKey places={["tens", "ones"]} />
        </div>
        <KeyIdea>
          The ones box only holds <strong>nine</strong>. There is no such thing as ten ones sitting
          on their own.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(3)}>So what goes wrong?</PrimaryButton>
        </div>
      </Step>

      <Step n={3} title="The trap in the words" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">Listen to the names. They all sound the same.</p>
        <div className="mt-3">
          <CountRun terms={["twenty-six", "twenty-seven", "twenty-eight", "twenty-nine"]} />
        </div>
        <p className="mt-4 text-ink-700">
          Six, seven, eight, nine &hellip; so lots of people say the next one the same way:
        </p>
        <WrongBox>&ldquo;twenty-ten&rdquo;</WrongBox>
        <p className="text-ink-700">
          That guess makes good sense. The words gave you a pattern and you followed it. But the
          words hide something. <strong>Nine is the last digit.</strong> There is no digit after 9.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(4)}>What really happens</PrimaryButton>
        </div>
      </Step>

      <Step n={4} title="The ones turn into a ten" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <p className="text-ink-700">Add one more to 29. Now there are 10 ones.</p>
        <div className="mt-4 flex justify-center">
          <BaseTen tens={2} ones={10} ringOnes={10} label="2 tens and 10 ones" />
        </div>
        <p className="mt-4 text-ink-700">Ten ones is a ten. Trade them.</p>
        <div className="mt-4 flex justify-center">
          <BaseTen tens={3} ones={0} label="3 tens and 0 ones = 30" />
        </div>
        <p className="mt-4 text-center text-xl font-bold text-ok-600">After 29 comes 30</p>
        <KeyIdea>
          When the ones reach ten, they become <strong>one more ten</strong>. The ones start again
          at 0.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(5)}>Does this always happen?</PrimaryButton>
        </div>
      </Step>

      <Step n={5} title="Every nine does this" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">Same story every time.</p>
        <div className="mt-3 space-y-2">
          {[
            ["39", "40"],
            ["59", "60"],
            ["79", "80"],
            ["99", "100"],
          ].map(([a, b]) => (
            <div
              key={a}
              className="flex items-center justify-center gap-3 rounded-xl bg-paper px-3 py-2 text-lg font-bold text-ink-900"
            >
              <span>{a}</span>
              <span className="text-brand-600">&rarr;</span>
              <span className="text-ok-600">{b}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-ink-700">
          <strong>99</strong> is the big one. 9 tens and 9 ones. Add one and the ones make a ten, so
          now there are <strong>10 tens</strong>. Ten tens is one hundred.
        </p>
        <div className="mt-4 flex justify-center">
          <BaseTen hundreds={1} label="1 hundred = 100" />
        </div>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(6)}>Your turn</PrimaryButton>
        </div>
      </Step>

      <Step n={6} title="You try one" open={step === 6} onOpen={() => go(6)} done={false}>
        <p className="text-ink-700">Keep counting.</p>
        <div className="mt-3">
          <CountRun terms={[147, 148, 149, "?"]} />
        </div>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          149 has <strong>9</strong> ones. Nine is the last digit, so the ones make a ten.
        </div>
        <TryIt
          prompt={<>2. What number comes just after 149?</>}
          accept={["150"]}
          placeholder="the next number"
          value={fade}
          setValue={setFade}
          hint="the ones go back to 0 and the tens go up by one. 4 tens becomes 5 tens."
          explain={
            <>
              <strong>150</strong>. The 9 ones became a ten, so 4 tens turned into 5 tens, and the
              ones started again at 0.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Counting past a nine</div>
          <div className="mt-2">1. Nine is the last digit — nothing comes after it</div>
          <div className="mt-1">2. The ones go back to 0</div>
          <div className="mt-1">3. The next place up goes up by one</div>
        </div>
        <KeyIdea>
          💡 Ten ones make one ten. Ten tens make one hundred. Same trade, one step up.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
