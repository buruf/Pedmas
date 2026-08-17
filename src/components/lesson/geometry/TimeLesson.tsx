"use client";

import { useState } from "react";
import { Step, KeyIdea, FormulaBox, WrongBox } from "@/components/lesson/Step";
import { LessonShell, TryIt } from "@/components/lesson/LessonShell";
import { PrimaryButton } from "@/components/ui";
import { ClockFig, TimeJumps, FigRow } from "./GeoModels";

/**
 * Telling the time and working out how long something lasted.
 *
 * The misconception is that clock times behave like ordinary numbers. Set out
 * as a column subtraction, 4:20 − 2:45 borrows ten instead of sixty and gives
 * "1 h 75 min" — an answer containing more than an hour's worth of minutes.
 * Counting on through the o'clock avoids the borrow entirely and matches how
 * people actually think about time.
 */
export function TimeLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 3 · Measurement · Time"
      title="How long did that take?"
      minutes={5}
      step={step}
      total={6}
    >
      <Step n={1} title="A film at the cinema" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          The film starts at <strong>2:45</strong> and ends at <strong>4:20</strong>. How long is
          it?
        </p>
        <FigRow>
          <ClockFig h={2} m={45} caption="starts — 2:45" />
          <ClockFig h={4} m={20} caption="ends — 4:20" />
        </FigRow>
        <p className="mt-4 text-ink-700">
          The long hand counts minutes, the short hand hours. At 2:45 the long hand has swept
          three-quarters of the way round, which is why it is also called{" "}
          <em>quarter to three</em>.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(2)}>Why time is awkward</PrimaryButton>
        </div>
      </Step>

      <Step n={2} title="Time does not count in tens" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <p className="text-ink-700">
          Every other measurement you meet is built on tens and hundreds. Time is not — it was
          divided up thousands of years before that idea existed.
        </p>
        <div className="mt-3 space-y-2">
          {[
            ["1 minute", "60 seconds"],
            ["1 hour", "60 minutes"],
            ["1 day", "24 hours"],
            ["1 week", "7 days"],
            ["1 year", "12 months, or 365 days"],
          ].map(([a, b]) => (
            <div key={a} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-bold text-ink-900">{a}</span>
              <span className="text-sm font-bold text-brand-700">= {b}</span>
            </div>
          ))}
        </div>
        <KeyIdea>
          The <strong>60</strong> is the one that catches people. There is no such thing as 75
          minutes past the hour — after 59 comes the next hour.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(3)}>Back to the film</PrimaryButton>
        </div>
      </Step>

      <Step n={3} title="The mistake almost everyone makes" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">
          The natural move is to stack the times up and subtract them like ordinary numbers:
        </p>
        <div className="my-3 rounded-xl border-2 border-err-600/40 bg-err-100/50 px-4 py-4 text-center">
          <div className="mx-auto inline-block text-left font-mono text-lg font-bold text-ink-900">
            <div>&nbsp;&nbsp;4 : 20</div>
            <div>− 2 : 45</div>
            <div className="border-t-2 border-ink-900">&nbsp;&nbsp;1 : 75</div>
          </div>
          <div className="mt-2 text-sm font-bold text-err-600">1 hour 75 minutes ✗</div>
        </div>
        <p className="text-ink-700">
          Look at the answer rather than the working. <strong>75 minutes</strong> is more than an
          hour — it should have turned into another hour and some minutes long before it got that
          big.
        </p>
        <p className="mt-3 text-ink-700">
          The borrow is what went wrong. Borrowing from the hours column gave{" "}
          <strong>10</strong> extra minutes, because that is what borrowing does with ordinary
          numbers. But one hour is worth <strong>60</strong> minutes, not 10.
        </p>
        <WrongBox>borrow 1 hour = 10 minutes</WrongBox>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(4)}>A way that never breaks</PrimaryButton>
        </div>
      </Step>

      <Step n={4} title="Count on through the o'clock" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <p className="text-ink-700">
          Nobody works out a journey by stacking numbers. They think: &ldquo;quarter of an hour to
          three, then an hour, then twenty minutes.&rdquo; Do exactly that, and stop at every
          o&rsquo;clock on the way.
        </p>
        <div className="mt-3">
          <TimeJumps
            stops={[
              { at: "2:45" },
              { at: "3:00", gap: "15 min" },
              { at: "4:00", gap: "1 hour" },
              { at: "4:20", gap: "20 min" },
            ]}
          />
        </div>
        <div className="mt-3 rounded-2xl bg-paper p-4">
          <ol className="space-y-2">
            {[
              ["Up to the next o'clock", "15 min"],
              ["Whole hours after that", "1 hour"],
              ["The last few minutes", "20 min"],
              ["Add them up", "1 hour 35 min"],
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
        <p className="mt-3 text-center text-lg font-bold text-ok-600">
          The film is 1 hour 35 minutes — that is 95 minutes.
        </p>
        <KeyIdea>
          Stopping at the o&rsquo;clock means you never have to borrow, so the 60 can never be
          mistaken for a 10.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(5)}>A worked example</PrimaryButton>
        </div>
      </Step>

      <Step n={5} title="A worked example" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">
          A train leaves at <strong>9:50</strong> and arrives at <strong>11:15</strong>. How long is
          the journey?
        </p>
        <div className="mt-3">
          <TimeJumps
            stops={[
              { at: "9:50" },
              { at: "10:00", gap: "10 min" },
              { at: "11:00", gap: "1 hour" },
              { at: "11:15", gap: "15 min" },
            ]}
          />
        </div>
        <div className="mt-3 rounded-2xl bg-paper p-4">
          <ol className="space-y-2">
            {[
              ["9:50 up to 10:00", "10 min"],
              ["10:00 up to 11:00", "60 min"],
              ["11:00 up to 11:15", "15 min"],
              ["Total", "85 min = 1 h 25 min"],
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
        <FormulaBox>
          <div className="text-base">85 minutes = 60 + 25 = 1 hour 25 minutes</div>
        </FormulaBox>
        <p className="text-ink-700">
          Going the other way — &ldquo;starts at 3:40 and lasts 50 minutes&rdquo; — works the same
          way forwards: 20 minutes takes you to 4:00, and 30 minutes more makes{" "}
          <strong>4:30</strong>.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(6)}>Your turn</PrimaryButton>
        </div>
      </Step>

      <Step n={6} title="You try one" open={step === 6} onOpen={() => go(6)} done={false}>
        <p className="text-ink-700">
          A lesson runs from <strong>1:25</strong> to <strong>2:10</strong>. How many minutes is
          that?
        </p>
        <FigRow>
          <ClockFig h={1} m={25} caption="1:25" />
          <ClockFig h={2} m={10} caption="2:10" />
        </FigRow>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          From 1:25 up to 2:00 is <strong>35 minutes</strong>. Then there are 10 minutes more.
        </div>
        <TryIt
          prompt={<>2. How many minutes does the lesson last altogether?</>}
          accept={["45"]}
          placeholder="a number"
          value={fade}
          setValue={setFade}
          hint="add the 35 minutes up to two o'clock and the 10 minutes after it."
          explain={
            <>
              35 + 10 = <strong>45 minutes</strong> — three quarters of an hour. A column
              subtraction would have said &ldquo;2:10 − 1:25 = 0:85&rdquo;, and 85 minutes is more
              than an hour, so it could never have been right.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Working with time</div>
          <div className="mt-2">1. An hour is 60 minutes, never 100 and never 10</div>
          <div className="mt-1">2. Count on to the next o&rsquo;clock first</div>
          <div className="mt-1">3. Then whole hours, then the last minutes</div>
          <div className="mt-1">4. Any answer over 59 minutes must become hours</div>
        </div>
        <KeyIdea>
          💡 Never stack clock times up and subtract. Walk forwards along the clock instead — it is
          how you already think about time anyway.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
