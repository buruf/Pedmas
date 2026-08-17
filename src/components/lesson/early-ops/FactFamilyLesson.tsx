"use client";

import { useState } from "react";
import { Step, KeyIdea, WrongBox } from "@/components/lesson/Step";
import { LessonShell, TryIt } from "@/components/lesson/LessonShell";
import { PrimaryButton } from "@/components/ui";

/**
 * Fact families — three numbers, four facts.
 *
 * The misconception is quiet but expensive: a child treats subtraction as a
 * separate skill from addition, so 12 − 5 is counted back from scratch even
 * though they answered 5 + 7 = 12 a minute earlier. Every subtraction fact then
 * has to be learned twice.
 *
 * The part–part–whole bar is the model that fixes it, because the same picture
 * answers all four questions: cover a part and you are subtracting, show both
 * parts and you are adding. Nothing about the picture changes.
 */

/* ------------------------------------------------------------------ visuals */

/** Part–part–whole bar. Covering a part is what turns it into a subtraction. */
function PartWhole({
  whole,
  a,
  b,
  cover,
}: {
  whole: number;
  a: number;
  b: number;
  /** which part is hidden behind a question mark */
  cover?: "a" | "b" | "whole";
}) {
  return (
    <div className="mx-auto max-w-sm">
      <div
        className={`flex h-12 items-center justify-center rounded-xl text-xl font-black text-white ${
          cover === "whole" ? "bg-ink-500" : "bg-brand-600"
        }`}
      >
        {cover === "whole" ? "?" : whole}
      </div>
      <div className="mt-1.5 flex gap-1.5">
        <div
          className={`flex h-12 items-center justify-center rounded-xl text-xl font-black text-white ${
            cover === "a" ? "bg-ink-500" : "bg-warn-600"
          }`}
          style={{ flexGrow: a }}
        >
          {cover === "a" ? "?" : a}
        </div>
        <div
          className={`flex h-12 items-center justify-center rounded-xl text-xl font-black text-white ${
            cover === "b" ? "bg-ink-500" : "bg-brand-400"
          }`}
          style={{ flexGrow: b }}
        >
          {cover === "b" ? "?" : b}
        </div>
      </div>
      <p className="mt-1.5 text-center text-xs font-semibold text-ink-500">
        the whole on top, the two parts underneath
      </p>
    </div>
  );
}

/** A box of two-coloured counters — the concrete version of the same idea. */
function MixedBox({ a, b, hide }: { a: number; b: number; hide?: "a" | "b" }) {
  const dot = (key: string, colour: string, hidden: boolean) => (
    <span
      key={key}
      className="inline-block h-5 w-5 rounded-full"
      style={{ background: hidden ? "#d1d5db" : colour }}
    />
  );
  return (
    <div className="mx-auto flex max-w-[15rem] flex-wrap justify-center gap-2 rounded-2xl border-2 border-dashed border-ink-300 bg-paper p-3">
      {Array.from({ length: a }, (_, i) => dot(`a${i}`, "#dc2626", hide === "a"))}
      {Array.from({ length: b }, (_, i) => dot(`b${i}`, "#0d9488", hide === "b"))}
    </div>
  );
}

/** The four facts a family gives you, laid out as a two-by-two. */
function FamilyGrid({ a, b, c, glow }: { a: number; b: number; c: number; glow?: number }) {
  const facts = [
    `${a} + ${b} = ${c}`,
    `${b} + ${a} = ${c}`,
    `${c} − ${a} = ${b}`,
    `${c} − ${b} = ${a}`,
  ];
  return (
    <div className="mx-auto grid max-w-sm grid-cols-2 gap-2">
      {facts.map((f, i) => (
        <div
          key={i}
          className={`rounded-xl px-3 py-3 text-center text-base font-bold tabular-nums ${
            glow === i ? "bg-ok-100 text-ok-600 ring-2 ring-ok-600/40" : "bg-paper text-ink-900"
          }`}
        >
          {f}
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------- lesson */

export function FactFamilyLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 1–2 · Addition & Subtraction · Fact Families"
      title="Three numbers, four facts"
      minutes={5}
      step={step}
      total={7}
    >
      <Step n={1} title="One box of counters" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          A box has <strong>5</strong> red counters and <strong>7</strong> green counters.
        </p>
        <div className="mt-4">
          <MixedBox a={5} b={7} />
        </div>
        <p className="mt-4 text-center text-xl font-bold text-ok-600">5 + 7 = 12</p>
        <p className="mt-3 text-ink-700">Remember that. It is the only fact you need today.</p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(2)}>Why only one?</PrimaryButton>
        </div>
      </Step>

      <Step n={2} title="Turn the box around" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <p className="text-ink-700">Walk around the table and look at the same box from the other side.</p>
        <div className="mt-4">
          <MixedBox a={7} b={5} />
        </div>
        <p className="mt-3 text-ink-700">
          Now the greens come first. Nothing was added. Nothing was taken away.
        </p>
        <p className="mt-3 text-center text-xl font-bold text-ok-600">7 + 5 = 12</p>
        <KeyIdea>
          That is <strong>two facts</strong> from one box. And you did no work for the second one.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(3)}>Keep going</PrimaryButton>
        </div>
      </Step>

      <Step n={3} title="Now cover the reds" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">
          Same box. Put your hand over the <strong>5</strong> red ones.
        </p>
        <div className="mt-4">
          <MixedBox a={5} b={7} hide="a" />
        </div>
        <p className="mt-3 text-ink-700">
          There were 12. Five are hidden. How many can you still see?
        </p>
        <p className="mt-3 text-center text-xl font-bold text-ok-600">12 − 5 = 7</p>
        <p className="mt-3 text-ink-700">
          You did not count anything. You already knew there were 7 green ones.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(4)}>So why do people count?</PrimaryButton>
        </div>
      </Step>

      <Step n={4} title="The habit worth breaking" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <p className="text-ink-700">
          When lots of people see <strong>12 − 5</strong> on a page, they start counting backwards.
        </p>
        <WrongBox>&ldquo;12 … 11, 10, 9, 8, 7&rdquo;</WrongBox>
        <p className="text-ink-700">
          It works. But it is five slow counts to find something they already knew one minute ago.
        </p>
        <p className="mt-3 text-ink-700">
          The take-away sign made it <em>look</em> like a brand new question. It was the same box.
        </p>
        <KeyIdea>
          Subtraction <strong>undoes</strong> addition. If you know <strong>5 + 7 = 12</strong>, you
          already know <strong>12 − 5</strong> without doing anything.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(5)}>Show me the picture</PrimaryButton>
        </div>
      </Step>

      <Step n={5} title="A whole and two parts" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">Here is the box drawn as bars. One whole, split into two parts.</p>
        <div className="mt-4">
          <PartWhole whole={12} a={5} b={7} />
        </div>
        <p className="mt-4 text-ink-700">Every question is just: which piece is covered up?</p>
        <div className="mt-3 space-y-2">
          {[
            ["Both parts showing, whole hidden", "you add", "5 + 7 = 12"],
            ["Whole showing, one part hidden", "you subtract", "12 − 5 = 7"],
          ].map(([a, b, c], i) => (
            <div key={i} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm text-ink-700">{a}</span>
              <span className="text-sm font-semibold text-brand-700">{b}</span>
              <span className="font-bold tabular-nums text-ink-900">{c}</span>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <PartWhole whole={12} a={5} b={7} cover="b" />
        </div>
        <KeyIdea>
          Three numbers — <strong>5, 7 and 12</strong> — live together. Any one of them can be the
          hidden one.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(6)}>Show me all four facts</PrimaryButton>
        </div>
      </Step>

      <Step n={6} title="Four facts for the price of one" open={step === 6} onOpen={() => go(6)} done={step > 6}>
        <p className="text-ink-700">The family of 5, 7 and 12:</p>
        <div className="mt-3">
          <FamilyGrid a={5} b={7} c={12} />
        </div>
        <p className="mt-4 text-ink-700">
          Here is another. <strong>6</strong> and <strong>3</strong> make <strong>9</strong>.
        </p>
        <div className="mt-3">
          <PartWhole whole={9} a={6} b={3} />
        </div>
        <div className="mt-3">
          <FamilyGrid a={6} b={3} c={9} />
        </div>
        <p className="mt-3 text-ink-700">
          Two additions and two subtractions, and only the first one needed any thinking.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(7)}>Your turn</PrimaryButton>
        </div>
      </Step>

      <Step n={7} title="You try one — I'll start it" open={step === 7} onOpen={() => go(7)} done={false}>
        <p className="text-ink-700">
          A new family. <strong>6 + 8 = 14</strong>.
        </p>
        <div className="mt-3">
          <PartWhole whole={14} a={6} b={8} />
        </div>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          The three numbers are <strong>6, 8 and 14</strong>. Now cover the <strong>8</strong>.
        </div>
        <div className="mt-3">
          <PartWhole whole={14} a={6} b={8} cover="b" />
        </div>
        <TryIt
          prompt={<>2. What is 14 − 8?</>}
          accept={["6"]}
          placeholder="the answer"
          value={fade}
          setValue={setFade}
          hint="do not count back. Look at the part that is still showing."
          explain={
            <>
              <strong>6</strong>. You did not have to count — 6 and 8 were the two parts all along, so
              covering the 8 has to leave the 6.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5">
          <FamilyGrid a={6} b={8} c={14} glow={3} />
        </div>
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">A fact family</div>
          <div className="mt-2">1. Three numbers: two parts and their whole</div>
          <div className="mt-1">2. Parts showing → add</div>
          <div className="mt-1">3. A part covered → subtract</div>
          <div className="mt-1">4. One fact learned gives you the other three free</div>
        </div>
        <KeyIdea>
          💡 A minus sign is not a new question. It is the same three numbers, asked backwards.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
