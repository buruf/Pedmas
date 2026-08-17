"use client";

import { useState } from "react";
import { Step, KeyIdea, WrongBox } from "@/components/lesson/Step";
import { LessonShell, TryIt } from "@/components/lesson/LessonShell";
import { BaseTen, NumberLine, DotGroups } from "@/components/lesson/Models";
import { PrimaryButton } from "@/components/ui";

/**
 * Skip counting by 2s, 5s and 10s (skip-counting family, all step sets).
 *
 * Children learn skip counting as a chant and read it off the ones digit:
 * 2, 4, 6, 8 — 12, 14, 16, 18 — the last digits repeat, so the chant feels
 * safe. It falls apart at the decade wall, where the ones digit cycles back
 * to 0 and the tens digit has to move. "24, 26, 28, 20" is the classic
 * result. The cure is to make the tens digit visible at exactly the moment it
 * changes, so the ones-digit pattern is seen as a side effect rather than the
 * rule.
 */

/** A skip-counting sequence with the jump shown between each pair. */
function SeqStrip({
  terms,
  gap,
  caption,
}: {
  terms: (string | number)[];
  /** label on the chip between terms, e.g. "+2" */
  gap?: string;
  caption?: string;
}) {
  return (
    <figure className="m-0">
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        {terms.map((t, i) => {
          const blank = t === "?";
          return (
            <span key={i} className="flex items-center gap-1.5">
              <span
                className={`flex h-11 min-w-[3rem] items-center justify-center rounded-xl px-2 text-lg font-bold ${
                  blank
                    ? "border-2 border-dashed border-brand-500 bg-white text-brand-600"
                    : "bg-brand-100 text-brand-800"
                }`}
              >
                {t}
              </span>
              {gap && i < terms.length - 1 && (
                <span className="text-xs font-bold text-warn-600">{gap}</span>
              )}
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

/** Numbers split into their tens digit and ones digit, side by side. */
function TensOnesTable({
  values,
  caption,
}: {
  values: number[];
  caption?: string;
}) {
  return (
    <figure className="m-0">
      <table className="mx-auto border-collapse text-center">
        <thead>
          <tr>
            <th className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wide text-ink-500">
              number
            </th>
            <th className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wide text-brand-700">
              tens
            </th>
            <th className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wide text-warn-600">
              ones
            </th>
          </tr>
        </thead>
        <tbody>
          {values.map((v) => (
            <tr key={v}>
              <td className="border border-ink-100 px-3 py-1.5 text-lg font-bold text-ink-900">
                {v}
              </td>
              <td className="border border-ink-100 bg-brand-50 px-3 py-1.5 text-lg font-bold text-brand-700">
                {Math.floor(v / 10)}
              </td>
              <td className="border border-ink-100 bg-warn-100 px-3 py-1.5 text-lg font-bold text-warn-600">
                {v % 10}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {caption && (
        <figcaption className="mt-2 text-center text-sm font-semibold text-ink-700">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

export function SkipCountingLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [guess, setGuess] = useState<string | null>(null);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 2 · Number · Skip counting"
      title="Skip counting past the tens"
      minutes={6}
      step={step}
      total={7}
    >
      <Step n={1} title="Counting shoes" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          Six friends line up. Every friend wears <strong>2</strong> shoes.
        </p>
        <div className="mt-4">
          <DotGroups groups={6} perGroup={2} label="6 friends, 2 shoes each" />
        </div>
        <p className="mt-4 text-ink-700">
          You could count every shoe: 1, 2, 3, 4 &hellip; but that takes ages.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(2)}>Show me a faster way</PrimaryButton>
        </div>
      </Step>

      <Step n={2} title="Count in twos" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <p className="text-ink-700">Take a whole friend at a time. Two shoes each jump.</p>
        <div className="mt-4">
          <SeqStrip terms={[2, 4, 6, 8, 10, 12]} gap="+2" />
        </div>
        <div className="mt-4 flex justify-center">
          <NumberLine
            from={0}
            to={12}
            marks={[2, 4, 6, 8, 10, 12]}
            jumps={[
              { from: 0, to: 2, text: "+2" },
              { from: 2, to: 4, text: "+2" },
              { from: 4, to: 6, text: "+2" },
              { from: 6, to: 8, text: "+2" },
              { from: 8, to: 10, text: "+2" },
              { from: 10, to: 12, text: "+2" },
            ]}
          />
        </div>
        <p className="mt-4 text-center text-xl font-bold text-ok-600">12 shoes 👟</p>
        <KeyIdea>
          Skip counting means <strong>the same size jump every time</strong>. Six jumps instead of
          twelve counts.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(3)}>Keep going higher</PrimaryButton>
        </div>
      </Step>

      <Step n={3} title="Where it goes wrong" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">Keep counting in twos. 24, 26, 28 &hellip; what next?</p>
        <div className="mt-4">
          <SeqStrip terms={[24, 26, 28, "?"]} gap="+2" />
        </div>
        <div className="mt-4 grid gap-2">
          {["20", "30", "210"].map((o) => (
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
          <div className="mt-4 pop-in">
            <WrongBox>24, 26, 28, 20</WrongBox>
            <p className="text-ink-700">
              This one catches almost everybody. Here is why it happens: you were listening to the{" "}
              <strong>last digit</strong> only.
            </p>
            <div className="mt-3">
              <TensOnesTable values={[24, 26, 28]} caption="4, 6, 8 — the tens never moved" />
            </div>
            <p className="mt-3 text-ink-700">
              4, 6, 8 &hellip; the next even digit is 0, so &ldquo;twenty&rdquo; feels right. But
              the ones just ran out, and when the ones run out the tens have to move.
            </p>
            <div className="mt-4">
              <PrimaryButton onClick={() => go(4)}>Show me what really happens</PrimaryButton>
            </div>
          </div>
        )}
      </Step>

      <Step n={4} title="The wall at the end of the ten" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <p className="text-ink-700">
          28 is 2 tens and 8 ones. Add 2 more ones and the ones box fills up.
        </p>
        <div className="mt-4 flex justify-center">
          <BaseTen tens={2} ones={10} ringOnes={10} label="2 tens and 10 ones" />
        </div>
        <p className="mt-4 text-ink-700">Ten ones is a ten. Trade it.</p>
        <div className="mt-4 flex justify-center">
          <BaseTen tens={3} ones={0} label="3 tens = 30" />
        </div>
        <p className="mt-4 text-center text-xl font-bold text-ok-600">28 + 2 = 30</p>
        <div className="mt-4">
          <TensOnesTable values={[24, 26, 28, 30]} caption="the tens digit went 2 → 3" />
        </div>
        <KeyIdea>
          The last digit really does go 4, 6, 8, 0. That part was right. What was missed is that the{" "}
          <strong>tens digit goes up by one</strong> at the same moment.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(5)}>How do I not forget?</PrimaryButton>
        </div>
      </Step>

      <Step n={5} title="Say the whole number" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">Two things keep you safe.</p>
        <div className="mt-3 space-y-2">
          {[
            "Say the whole number out loud, not just the last digit.",
            "When the ones pass 9, add one to the tens.",
          ].map((s, i) => (
            <div key={i} className="flex gap-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
              <span className="font-bold text-brand-600">{i + 1}.</span>
              <span className="font-semibold">{s}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-ink-700">Counting by 5s has walls too. Watch 45.</p>
        <div className="mt-3">
          <SeqStrip terms={[35, 40, 45, 50, 55]} gap="+5" />
        </div>
        <p className="mt-3 text-ink-700">
          And counting by 10s only ever changes the tens digit, so it never hits a wall until 100.
        </p>
        <div className="mt-3">
          <SeqStrip terms={[70, 80, 90, 100]} gap="+10" />
        </div>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(6)}>Do one together</PrimaryButton>
        </div>
      </Step>

      <Step n={6} title="Filling a gap" open={step === 6} onOpen={() => go(6)} done={step > 6}>
        <p className="text-ink-700">Skip count by 2s. What is missing?</p>
        <div className="mt-4">
          <SeqStrip terms={[18, "?", 22, 24]} gap="+2" />
        </div>
        <div className="mt-4 rounded-2xl bg-paper p-4">
          <ol className="space-y-2">
            {[
              ["Start at the number before", "18"],
              ["18 has 8 ones — add 2 more", "the ones fill up"],
              ["Trade for a ten", "1 ten becomes 2 tens"],
              ["So the missing number is", "20"],
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
        <p className="mt-3 text-ink-700">
          Check it the other way too: 20 + 2 = 22. It fits from both sides.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(7)}>Your turn</PrimaryButton>
        </div>
      </Step>

      <Step n={7} title="You try one" open={step === 7} onOpen={() => go(7)} done={false}>
        <p className="text-ink-700">Skip count by 2s again.</p>
        <div className="mt-3">
          <SeqStrip terms={[46, 48, "?", 52]} gap="+2" />
        </div>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          48 has <strong>8</strong> ones. Adding 2 more fills the ones box.
        </div>
        <TryIt
          prompt={<>2. What is the missing number?</>}
          accept={["50"]}
          placeholder="the missing number"
          value={fade}
          setValue={setFade}
          hint="the ones go back to 0 and the tens go up. 4 tens becomes 5 tens."
          explain={
            <>
              <strong>50</strong>. The last digit did go 6, 8, 0 &mdash; but the tens moved from 4
              to 5 at the same time. Check it: 50 + 2 = 52.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Skip counting</div>
          <div className="mt-2">1. Every jump is the same size</div>
          <div className="mt-1">2. Say the whole number, not just the last digit</div>
          <div className="mt-1">3. When the ones pass 9, the tens go up by one</div>
        </div>
        <KeyIdea>
          💡 The last digits do repeat, and that is useful. Just remember they repeat because a new
          ten started.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
