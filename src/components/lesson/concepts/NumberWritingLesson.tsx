"use client";

import { useState } from "react";
import { Step, KeyIdea, WrongBox } from "@/components/lesson/Step";
import { LessonShell, TryIt } from "@/components/lesson/LessonShell";
import { BaseTen, TenFrame } from "@/components/lesson/Models";
import { PrimaryButton } from "@/components/ui";

/**
 * Reading and writing numbers to 100 (Grade 1).
 *
 * The bank asks a child to match words to digits, and its traps are the three
 * real ones: "seventeen" written 71, "twelve" written 21, and "forty" spelled
 * fourty. All three come from the same honest cause — English says the ones
 * part of a teen number first, and the spelling of forty is simply not what you
 * hear. So the lesson makes the ten visible before it names any digit.
 *
 * Register is deliberately tiny: six-year-old sentences, one idea per screen.
 */

/** Two labelled boxes showing which digit goes where. */
function PlaceCards({
  tens,
  ones,
  ghost = false,
}: {
  tens: number;
  ones: number;
  /** draw it as the wrong-way-round version */
  ghost?: boolean;
}) {
  const cards: { d: number; name: string }[] = ghost
    ? [
        { d: ones, name: "ones first?" },
        { d: tens, name: "tens after?" },
      ]
    : [
        { d: tens, name: "tens" },
        { d: ones, name: "ones" },
      ];
  return (
    <div className="flex justify-center gap-3">
      {cards.map((c, i) => (
        <div
          key={i}
          className={`rounded-2xl border-2 px-6 py-3 text-center ${
            ghost ? "border-err-600/40 bg-err-100/60" : "border-brand-300 bg-brand-50"
          }`}
        >
          <div className="text-4xl font-black text-ink-900">{c.d}</div>
          <div className="mt-1 text-xs font-bold uppercase text-brand-700">{c.name}</div>
        </div>
      ))}
    </div>
  );
}

/** A word card beside its digit card. */
function WordPair({ word, digit }: { word: string; digit: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-paper px-3 py-2">
      <span className="w-24 text-sm font-bold text-ink-700">{word}</span>
      <span className="text-ink-300">=</span>
      <span className="text-2xl font-black text-brand-700">{digit}</span>
    </div>
  );
}

export function NumberWritingLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [guess, setGuess] = useState<string | null>(null);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 1 · Number Sense · Writing Numbers"
      title="Saying it and writing it"
      minutes={4}
      step={step}
      total={7}
    >
      <Step n={1} title="How many stickers?" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">You have this many stickers. Now write it down.</p>
        <div className="mt-4 flex justify-center">
          <TenFrame filled={10} extra={7} label="a full ten, and 7 more" />
        </div>
        <p className="mt-4 text-ink-700">
          You say <strong>seventeen</strong>. But which digits do you write?
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(2)}>Let&rsquo;s find out</PrimaryButton>
        </div>
      </Step>

      <Step n={2} title="You already know the small ones" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <p className="text-ink-700">Every number word has one digit that goes with it.</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <WordPair word="three" digit="3" />
          <WordPair word="five" digit="5" />
          <WordPair word="seven" digit="7" />
          <WordPair word="nine" digit="9" />
        </div>
        <p className="mt-3 text-ink-700">These all fit in one box. Ten needs two.</p>
        <div className="mt-3 flex justify-center">
          <PlaceCards tens={1} ones={0} />
        </div>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(3)}>Now the bigger ones</PrimaryButton>
        </div>
      </Step>

      <Step n={3} title="Seventeen has a ten hiding in it" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">
          Look at the stickers again. There is <strong>1 full ten</strong> and <strong>7 left over</strong>.
        </p>
        <div className="mt-4 flex justify-center">
          <TenFrame filled={10} extra={7} label="1 ten and 7 ones" />
        </div>
        <p className="mt-4 text-ink-700">So which do you write first, the 1 or the 7?</p>
        <div className="mt-3 grid gap-2">
          {[
            { k: "b", label: "The 7 — I hear seven first" },
            { k: "a", label: "The 1" },
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
            Good thinking. Now look at what tricks lots of people.
            <div className="mt-3">
              <PrimaryButton onClick={() => go(4)}>Show me</PrimaryButton>
            </div>
          </div>
        )}
      </Step>

      <Step n={4} title="The mistake lots of people make" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <WrongBox>seventeen &rarr; 71</WrongBox>
        <p className="text-ink-700">
          It happens because your ears say <strong>seven</strong> first. So your hand writes 7 first.
        </p>
        <div className="mt-4 flex justify-center">
          <PlaceCards tens={1} ones={7} ghost />
        </div>
        <p className="mt-4 text-ink-700">
          But 71 would be <strong>7 tens</strong> — that is seven full frames of stickers. You only
          have one.
        </p>
        <div className="mt-4 flex justify-center">
          <TenFrame filled={10} extra={7} label="still just 1 ten and 7 ones" />
        </div>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(5)}>So what is the rule?</PrimaryButton>
        </div>
      </Step>

      <Step n={5} title="Tens go first" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">Write the tens box first. Then the ones box.</p>
        <div className="mt-4">
          <PlaceCards tens={1} ones={7} />
        </div>
        <p className="mt-4 text-center text-xl font-black text-ok-600">seventeen = 17</p>
        <p className="mt-4 text-ink-700">Twelve works the same way: 1 ten and 2 ones.</p>
        <div className="mt-3 flex justify-center">
          <TenFrame filled={10} extra={2} label="twelve = 12, not 21" />
        </div>
        <KeyIdea>
          Your ears hear the ones first. Your pencil writes the <strong>tens</strong> first.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(6)}>Try one with me</PrimaryButton>
        </div>
      </Step>

      <Step n={6} title="Write thirty-one" open={step === 6} onOpen={() => go(6)} done={step > 6}>
        <div className="rounded-2xl bg-paper p-4">
          <ol className="space-y-2">
            {[
              ["Say it slowly", "thirty… one"],
              ["How many tens?", "thirty is 3 tens"],
              ["How many ones?", "1 one"],
              ["Tens first, then ones", "31"],
            ].map(([a, b], i) => (
              <li
                key={i}
                className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 text-sm"
              >
                <span className="text-ink-700">
                  <span className="mr-2 font-bold text-brand-600">{i + 1}.</span>
                  {a}
                </span>
                <span className="font-bold text-ink-900">{b}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="mt-4">
          <PlaceCards tens={3} ones={1} />
        </div>
        <p className="mt-4 rounded-xl bg-warn-100 px-4 py-3 text-sm text-ink-700">
          ✏️ One word to remember: <strong>40</strong> is spelled <strong>forty</strong>. It sounds
          like four, but the <strong>u</strong> is gone. Lots of people write &ldquo;fourty&rdquo;.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(7)}>Your turn</PrimaryButton>
        </div>
      </Step>

      <Step n={7} title="You try one" open={step === 7} onOpen={() => go(7)} done={false}>
        <p className="text-ink-700">
          A number has <strong>2 tens</strong> and <strong>5 ones</strong>. Write it.
        </p>
        <div className="mt-3 flex justify-center">
          <BaseTen tens={2} ones={5} label="2 tens and 5 ones" />
        </div>
        <TryIt
          prompt={<>Type the number:</>}
          accept={["25"]}
          placeholder="like 34"
          value={fade}
          setValue={setFade}
          hint="write the tens digit first, then the ones digit."
          explain={
            <>
              2 tens is 20, and 5 more makes <strong>25</strong>. Tens first, then ones — so it is
              25, not 52.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Writing a number</div>
          <div className="mt-2">1. Count the full tens</div>
          <div className="mt-1">2. Count the ones left over</div>
          <div className="mt-1">3. Write the tens digit first</div>
        </div>
        <KeyIdea>
          💡 The first digit always tells you the <strong>tens</strong>, even when the word says the
          ones part first.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
