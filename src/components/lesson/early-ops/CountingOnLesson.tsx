"use client";

import { useState } from "react";
import { Step, KeyIdea, WrongBox } from "@/components/lesson/Step";
import { LessonShell, TryIt } from "@/components/lesson/LessonShell";
import { NumberLine } from "@/components/lesson/Models";
import { PrimaryButton } from "@/components/ui";

/**
 * Adding and subtracting the tiniest numbers — totals of five, then ten.
 *
 * At this size the answer is never the difficulty. The METHOD is. A child who
 * counts every counter from one, every single time, is doing seven counts to
 * find 3 + 4, and that habit does not survive 8 + 5, let alone 48 + 7. Counting
 * on from the larger number turns the same problem into three counts and is the
 * first step towards recall.
 *
 * Two lessons live here because the two operations have different failure
 * modes: adding is spoiled by counting all, subtracting is spoiled by counting
 * the starting number as the first step back.
 */

/* ------------------------------------------------------------------ visuals */

const DOT = "#7c3aed";
const DOT_B = "#0d9488";

/** One pile of counters. Ghost dots show what is being taken away. */
function Pile({
  n,
  colour = DOT,
  crossed = 0,
  label,
}: {
  n: number;
  colour?: string;
  /** the last `crossed` counters are drawn as taken away */
  crossed?: number;
  label?: string;
}) {
  return (
    <figure className="m-0">
      <div className="flex max-w-[13rem] flex-wrap justify-center gap-2 rounded-2xl border-2 border-dashed border-ink-300 bg-paper p-3">
        {Array.from({ length: n }, (_, i) => {
          const gone = i >= n - crossed;
          return (
            <span key={i} className="relative inline-flex h-6 w-6 items-center justify-center">
              <span
                className="inline-block h-5 w-5 rounded-full"
                style={{ background: gone ? "#e5e7eb" : colour }}
              />
              {gone && <span className="absolute text-sm font-black text-err-600">✕</span>}
            </span>
          );
        })}
      </div>
      {label && (
        <figcaption className="mt-1 text-center text-sm font-semibold text-ink-700">{label}</figcaption>
      )}
    </figure>
  );
}

/** Two piles side by side, so "the one you already know" is a separate object. */
function TwoPiles({ a, b, labelA, labelB }: { a: number; b: number; labelA: string; labelB: string }) {
  return (
    <div className="flex flex-wrap items-start justify-center gap-3">
      <Pile n={a} label={labelA} />
      <span className="self-center text-2xl font-black text-ink-500">+</span>
      <Pile n={b} colour={DOT_B} label={labelB} />
    </div>
  );
}

/** The words a child actually says, shown as a chain of counts. */
function CountChant({
  start,
  counts,
  direction = "up",
  caption,
}: {
  start: number;
  counts: number[];
  direction?: "up" | "down";
  caption: string;
}) {
  return (
    <div className="mt-3 rounded-2xl bg-paper px-3 py-3 text-center">
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        <span className="rounded-lg bg-ink-900 px-2.5 py-1 text-lg font-black text-white">{start}</span>
        <span className="text-sm font-semibold text-ink-500">{direction === "up" ? "then" : "back"}</span>
        {counts.map((c, i) => (
          <span
            key={i}
            className="rounded-lg bg-brand-100 px-2.5 py-1 text-lg font-black text-brand-800"
          >
            {c}
          </span>
        ))}
      </div>
      <p className="mt-2 text-xs font-semibold text-ink-500">{caption}</p>
    </div>
  );
}

/* ------------------------------------------------- adding: counting on */

export function CountingOnLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 1 · Addition & Subtraction · Adding small numbers"
      title="Counting on"
      minutes={4}
      step={step}
      total={6}
    >
      <Step n={1} title="Two piles of counters" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          You have <strong>3</strong> counters. Your friend gives you <strong>4</strong> more.
        </p>
        <div className="mt-4">
          <TwoPiles a={3} b={4} labelA="3 counters" labelB="4 more" />
        </div>
        <p className="mt-4 text-ink-700">How many do you have now?</p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(2)}>Let&rsquo;s count them</PrimaryButton>
        </div>
      </Step>

      <Step n={2} title="How most people count" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <p className="text-ink-700">Most people start again at one. They touch every counter.</p>
        <WrongBox>&ldquo;1, 2, 3, 4, 5, 6, 7&rdquo;</WrongBox>
        <p className="text-ink-700">
          That gets the right answer. <strong>7.</strong> But look how much work it was.
        </p>
        <p className="mt-2 text-ink-700">
          Seven counts. And three of them were counters you had <em>already counted</em>.
        </p>
        <KeyIdea>
          You knew that first pile was <strong>3</strong>. Counting it again wastes the thing you
          already knew.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(3)}>Show me a quicker way</PrimaryButton>
        </div>
      </Step>

      <Step n={3} title="Keep the number in your head" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">Hold the 3 in your head. Do not touch that pile.</p>
        <p className="mt-2 text-ink-700">Now count the 4 new ones on top of it.</p>
        <CountChant start={3} counts={[4, 5, 6, 7]} caption="Start at 3. Count on four more." />
        <p className="mt-3 text-ink-700">
          You land on <strong>7</strong>. Same answer. Four counts instead of seven.
        </p>
        <div className="mt-4 flex justify-center">
          <NumberLine
            from={3}
            to={8}
            marks={[3, 7]}
            jumps={[{ from: 3, to: 7, text: "+4" }]}
            label="3 + 4 = 7"
          />
        </div>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(4)}>There is one more trick</PrimaryButton>
        </div>
      </Step>

      <Step n={4} title="Always start with the bigger pile" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <p className="text-ink-700">
          <strong>3 + 4</strong> and <strong>4 + 3</strong> give the same total. Swapping the piles
          never changes how many counters there are.
        </p>
        <p className="mt-2 text-ink-700">So pick the bigger one to start from. You count less.</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-paper px-3 py-3">
            <div className="text-xs font-bold uppercase tracking-wide text-ink-500">Start at 3</div>
            <div className="mt-1 text-sm font-bold text-ink-900">3 … 4, 5, 6, 7</div>
            <div className="mt-1 text-xs text-ink-500">four counts</div>
          </div>
          <div className="rounded-xl border-2 border-ok-600/40 bg-ok-100 px-3 py-3">
            <div className="text-xs font-bold uppercase tracking-wide text-ok-600">Start at 4</div>
            <div className="mt-1 text-sm font-bold text-ink-900">4 … 5, 6, 7</div>
            <div className="mt-1 text-xs text-ink-500">only three counts</div>
          </div>
        </div>
        <KeyIdea>
          Say the <strong>bigger</strong> number first. Then count on the smaller one.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(5)}>Watch one more</PrimaryButton>
        </div>
      </Step>

      <Step n={5} title="Watch me do 2 + 6" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">The bigger number is 6. So start there.</p>
        <div className="mt-3">
          <TwoPiles a={2} b={6} labelA="2" labelB="6" />
        </div>
        <CountChant start={6} counts={[7, 8]} caption="Start at 6. Count on two more." />
        <p className="mt-3 text-center text-xl font-bold text-ok-600">2 + 6 = 8</p>
        <p className="mt-3 text-ink-700">
          Two counts. If you had started at 2, you would have said six numbers.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(6)}>Your turn</PrimaryButton>
        </div>
      </Step>

      <Step n={6} title="You try one — I'll start it" open={step === 6} onOpen={() => go(6)} done={false}>
        <p className="text-ink-700">
          Work out <strong>3 + 6</strong>.
        </p>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          The bigger number is <strong>6</strong>. Start there. Now count on <strong>3</strong>.
        </div>
        <div className="mt-3 flex justify-center">
          <NumberLine from={5} to={10} marks={[6]} label="start at 6" />
        </div>
        <TryIt
          prompt={<>2. Where do you land?</>}
          accept={["9"]}
          placeholder="the answer"
          value={fade}
          setValue={setFade}
          hint="say it out loud: 6 … then three more."
          explain={
            <>
              6 … <strong>7, 8, 9</strong>. So 3 + 6 = <strong>9</strong>. Three counts, not nine.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">To add</div>
          <div className="mt-2">1. Find the bigger number</div>
          <div className="mt-1">2. Say it, and hold it in your head</div>
          <div className="mt-1">3. Count on the smaller number</div>
        </div>
        <KeyIdea>
          💡 Never count a pile twice. The first number is already counted for you.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}

/* --------------------------------------------- subtracting: counting back */

export function CountingBackLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 1 · Addition & Subtraction · Taking away small numbers"
      title="Counting back"
      minutes={4}
      step={step}
      total={6}
    >
      <Step n={1} title="Eight grapes" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          You have <strong>8</strong> grapes. You eat <strong>3</strong>.
        </p>
        <div className="mt-4 flex justify-center">
          <Pile n={8} crossed={3} label="8 grapes, 3 eaten" />
        </div>
        <p className="mt-4 text-ink-700">How many are left?</p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(2)}>Let&rsquo;s find out</PrimaryButton>
        </div>
      </Step>

      <Step n={2} title="The slow way" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <p className="text-ink-700">
          Lots of people draw all eight grapes, cross out three, then count what is left — starting
          again at one.
        </p>
        <WrongBox>&ldquo;1, 2, 3, 4, 5&rdquo; &nbsp;(after counting all 8 first)</WrongBox>
        <p className="text-ink-700">
          The answer <strong>5</strong> is right. But that was thirteen counts to find it.
        </p>
        <KeyIdea>
          You already know you started with <strong>8</strong>. You can start from there instead.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(3)}>Show me</PrimaryButton>
        </div>
      </Step>

      <Step n={3} title="Count back from 8" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">Stand on 8. Take three steps backwards.</p>
        <CountChant start={8} counts={[7, 6, 5]} direction="down" caption="Start at 8. Step back three times." />
        <div className="mt-3 flex justify-center">
          <NumberLine
            from={4}
            to={9}
            marks={[5, 8]}
            jumps={[{ from: 8, to: 5, text: "−3" }]}
            label="8 − 3 = 5"
          />
        </div>
        <p className="mt-3 text-center text-xl font-bold text-ok-600">8 − 3 = 5</p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(4)}>One thing to watch</PrimaryButton>
        </div>
      </Step>

      <Step n={4} title="Where lots of people slip" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <p className="text-ink-700">This bit catches almost everyone. Some people count like this:</p>
        <WrongBox>&ldquo;8, 7, 6&rdquo; &nbsp;— so the answer is 6</WrongBox>
        <p className="text-ink-700">
          They counted the 8 as their first step. But the 8 is where you are <em>standing</em>. It is
          not a step you have taken yet.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border-2 border-err-600/40 bg-err-100/50 px-3 py-3 text-center">
            <div className="text-sm font-bold text-ink-900">8, 7, 6</div>
            <div className="mt-1 text-xs font-semibold text-err-600">counting the start ✗</div>
          </div>
          <div className="rounded-xl border-2 border-ok-600/40 bg-ok-100 px-3 py-3 text-center">
            <div className="text-sm font-bold text-ink-900">8 … 7, 6, 5</div>
            <div className="mt-1 text-xs font-semibold text-ok-600">three real steps ✓</div>
          </div>
        </div>
        <KeyIdea>
          Say the starting number <strong>quietly</strong>, then count the steps out loud. The first
          number you say out loud is one <em>less</em>.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(5)}>A shortcut for close numbers</PrimaryButton>
        </div>
      </Step>

      <Step n={5} title="When the numbers are close, count up" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">
          Try <strong>9 − 7</strong>. Counting back seven steps is a long way, and easy to lose.
        </p>
        <p className="mt-2 text-ink-700">
          So ask the question a different way: <strong>how far is it from 7 up to 9?</strong>
        </p>
        <div className="mt-3 flex justify-center">
          <NumberLine
            from={6}
            to={10}
            marks={[7, 9]}
            jumps={[{ from: 7, to: 9, text: "+2" }]}
            label="from 7 to 9 is 2 hops"
          />
        </div>
        <p className="mt-3 text-center text-xl font-bold text-ok-600">9 − 7 = 2</p>
        <KeyIdea>
          Subtraction can mean &ldquo;take away&rdquo; <em>or</em> &ldquo;how far apart&rdquo;. Both
          give the same answer, so pick whichever is fewer hops.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(6)}>Your turn</PrimaryButton>
        </div>
      </Step>

      <Step n={6} title="You try one — I'll start it" open={step === 6} onOpen={() => go(6)} done={false}>
        <p className="text-ink-700">
          Work out <strong>7 − 2</strong>.
        </p>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          Stand on <strong>7</strong>. Say it quietly. Now take <strong>2</strong> steps back.
        </div>
        <div className="mt-3 flex justify-center">
          <NumberLine from={3} to={8} marks={[7]} label="start at 7" />
        </div>
        <TryIt
          prompt={<>2. Where do you land?</>}
          accept={["5"]}
          placeholder="the answer"
          value={fade}
          setValue={setFade}
          hint="say 7 quietly, then count two steps out loud. Do not say 7 as a step."
          explain={
            <>
              7 … <strong>6, 5</strong>. So 7 − 2 = <strong>5</strong>. Two steps, and the 7 was not
              one of them.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">To take away</div>
          <div className="mt-2">1. Stand on the bigger number</div>
          <div className="mt-1">2. Step back — the start is not a step</div>
          <div className="mt-1">3. If the numbers are close, count up instead</div>
        </div>
        <KeyIdea>
          💡 You never have to count a whole pile again. You already know how many were there.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
