"use client";

import { useState } from "react";
import { Step, KeyIdea, WrongBox } from "@/components/lesson/Step";
import { LessonShell, TryIt } from "@/components/lesson/LessonShell";
import { PrimaryButton } from "@/components/ui";

/**
 * Comparing and ordering numbers past 100 (compare-numbers / order-numbers
 * with a large `max`).
 *
 * The first-digit habit survives long after a child can compare 9 and 12, and
 * it comes back hard when the numbers have different lengths: 92 is chosen
 * over 105 because 9 beats 1. Two separate tools fix it, and they must be
 * taught in order — count the digits first (a whole-number-only shortcut, and
 * the reason it works is that an extra digit is an extra place), and only when
 * the lengths match do you scan left to right for the first place that differs.
 */

/** Digits laid into place-value columns so like places line up. */
function PlaceCols({
  heads,
  rows,
  highlight,
  caption,
}: {
  heads: string[];
  rows: { value: string; tone?: "win" | "lose" }[];
  /** index into heads to shade */
  highlight?: number;
  caption?: string;
}) {
  return (
    <figure className="m-0">
      <table className="mx-auto border-collapse text-center">
        <thead>
          <tr>
            {heads.map((h, i) => (
              <th
                key={h}
                className={`px-1 pb-1 text-[10px] font-bold uppercase tracking-wide ${
                  highlight === i ? "text-brand-700" : "text-ink-500"
                }`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, ri) => {
            const cells = r.value.padStart(heads.length, " ").split("");
            return (
              <tr key={ri}>
                {cells.map((d, ci) => (
                  <td
                    key={ci}
                    className={`w-10 border border-ink-100 px-2 py-1.5 text-xl font-bold tabular-nums ${
                      highlight === ci ? "bg-warn-100" : ""
                    } ${
                      r.tone === "win"
                        ? "text-ok-600"
                        : r.tone === "lose"
                          ? "text-ink-500"
                          : "text-ink-900"
                    }`}
                  >
                    {d.trim() === "" ? "" : d}
                  </td>
                ))}
              </tr>
            );
          })}
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

/** A number with its digits counted. */
function DigitCount({ value, tone }: { value: string; tone: "win" | "lose" }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-paper px-3 py-2">
      <span className="flex gap-1">
        {value.split("").map((d, i) => (
          <span
            key={i}
            className={`flex h-8 w-8 items-center justify-center rounded-lg text-lg font-bold ${
              tone === "win" ? "bg-ok-100 text-ok-600" : "bg-ink-100 text-ink-700"
            }`}
          >
            {d}
          </span>
        ))}
      </span>
      <span className="text-sm font-semibold text-ink-700">{value.length} digits</span>
    </div>
  );
}

export function OrderBigNumbersLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [guess, setGuess] = useState<string | null>(null);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 2 · Number · Comparing bigger numbers"
      title="Comparing big numbers"
      minutes={6}
      step={step}
      total={7}
    >
      <Step n={1} title="Two scores" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          You scored <strong>92</strong>. Your friend scored <strong>105</strong>.
        </p>
        <p className="mt-3 text-ink-700">Who scored more?</p>
        <div className="mt-4 grid gap-2">
          {[
            { k: "a", label: "You — 92 starts with 9" },
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
            Let&rsquo;s put the digits in their places.
            <div className="mt-3">
              <PrimaryButton onClick={() => go(2)}>Show me</PrimaryButton>
            </div>
          </div>
        )}
      </Step>

      <Step n={2} title="Every digit has a place" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <p className="text-ink-700">You already know this from place value.</p>
        <div className="mt-4">
          <PlaceCols
            heads={["hundreds", "tens", "ones"]}
            rows={[{ value: "105" }, { value: "92" }]}
            caption="line them up on the right"
          />
        </div>
        <p className="mt-4 text-ink-700">
          105 has a digit in the hundreds place. 92 has nothing there at all.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(3)}>So why did 92 look bigger?</PrimaryButton>
        </div>
      </Step>

      <Step n={3} title="The habit that trips people up" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <WrongBox>92 is more than 105 &nbsp;&ldquo;because 9 beats 1&rdquo;</WrongBox>
        <p className="text-ink-700">
          Lots of people compare the two first digits they can see. And 9 really is bigger than 1.
        </p>
        <p className="mt-3 text-ink-700">
          But those two digits are not doing the same job. The 9 counts <strong>tens</strong>. The 1
          counts <strong>hundreds</strong>.
        </p>
        <div className="mt-4 space-y-2 text-center font-bold text-ink-900">
          <div className="rounded-xl bg-paper px-3 py-2">
            92 = 9 tens and 2 ones = <span className="text-ink-500">no hundreds</span>
          </div>
          <div className="rounded-xl bg-paper px-3 py-2">
            105 = <span className="text-brand-600">1 hundred</span>, 0 tens and 5 ones
          </div>
        </div>
        <KeyIdea>
          One hundred beats nine tens. Comparing digits only works when they sit in the{" "}
          <strong>same column</strong>.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(4)}>Give me a quick way</PrimaryButton>
        </div>
      </Step>

      <Step n={4} title="Step one: count the digits" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <p className="text-ink-700">For whole numbers, longer is bigger. Count them.</p>
        <div className="mt-3 space-y-2">
          <DigitCount value="105" tone="win" />
          <DigitCount value="92" tone="lose" />
        </div>
        <p className="mt-4 text-center text-lg font-bold text-ok-600">
          105 is bigger. Your friend won.
        </p>
        <p className="mt-3 text-ink-700">
          An extra digit means an extra place. 3 digits reach the hundreds. 2 digits stop at the
          tens.
        </p>
        <KeyIdea>
          Careful: this only works for <strong>whole numbers</strong>, and only when you have not
          written extra zeros at the front.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(5)}>What if they are the same length?</PrimaryButton>
        </div>
      </Step>

      <Step n={5} title="Step two: go left to right" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">
          Compare <strong>372</strong> and <strong>358</strong>. Both have 3 digits, so counting
          digits does not help.
        </p>
        <div className="mt-4">
          <PlaceCols
            heads={["hundreds", "tens", "ones"]}
            rows={[{ value: "372", tone: "win" }, { value: "358", tone: "lose" }]}
            highlight={1}
          />
        </div>
        <div className="mt-4 rounded-2xl bg-paper p-4">
          <ol className="space-y-2">
            {[
              ["Hundreds", "3 and 3 — a tie, keep going"],
              ["Tens", "7 beats 5 — decided"],
              ["Ones", "never needed"],
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
        <p className="mt-3 text-center text-lg font-bold text-ok-600">372 is bigger</p>
        <KeyIdea>
          Start at the <strong>left</strong>. The first column where they differ decides it. Stop
          there.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(6)}>Put four in order</PrimaryButton>
        </div>
      </Step>

      <Step n={6} title="Putting four numbers in order" open={step === 6} onOpen={() => go(6)} done={step > 6}>
        <p className="text-ink-700">
          Order <strong>640</strong>, <strong>406</strong>, <strong>64</strong>,{" "}
          <strong>460</strong> from least to greatest. They all use the same digits, so the first
          digit tells you nothing.
        </p>
        <div className="mt-4">
          <PlaceCols
            heads={["hundreds", "tens", "ones"]}
            rows={[{ value: "640" }, { value: "406" }, { value: "64" }, { value: "460" }]}
          />
        </div>
        <div className="mt-4 rounded-2xl bg-paper p-4">
          <ol className="space-y-2">
            {[
              ["Shortest first", "64 has only 2 digits — least"],
              ["Now the hundreds", "406 and 460 have 4, 640 has 6"],
              ["So 640 is greatest", "6 beats 4"],
              ["406 or 460? check tens", "0 is less than 6"],
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
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xl font-bold text-ok-600">
          <span>64</span>
          <span className="text-ink-500">&lt;</span>
          <span>406</span>
          <span className="text-ink-500">&lt;</span>
          <span>460</span>
          <span className="text-ink-500">&lt;</span>
          <span>640</span>
        </div>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(7)}>Your turn</PrimaryButton>
        </div>
      </Step>

      <Step n={7} title="You try one" open={step === 7} onOpen={() => go(7)} done={false}>
        <p className="text-ink-700">
          Which is greatest: <strong>87</strong>, <strong>610</strong> or <strong>178</strong>?
        </p>
        <div className="mt-3">
          <PlaceCols
            heads={["hundreds", "tens", "ones"]}
            rows={[{ value: "87" }, { value: "610" }, { value: "178" }]}
          />
        </div>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          Count digits. 87 has only 2, so it is out. Two are left.
        </div>
        <TryIt
          prompt={<>2. Type the greatest number:</>}
          accept={["610"]}
          placeholder="greatest"
          value={fade}
          setValue={setFade}
          hint="610 and 178 both have 3 digits, so look at the hundreds column."
          explain={
            <>
              <strong>610</strong>. Both have 3 digits, so check hundreds: 6 beats 1. The 8 in 87
              never mattered &mdash; it was only counting ones.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Comparing big numbers</div>
          <div className="mt-2">1. Count the digits — more digits wins</div>
          <div className="mt-1">2. Same length? Line them up on the right</div>
          <div className="mt-1">3. Read left to right, stop at the first difference</div>
        </div>
        <KeyIdea>
          💡 A digit is only worth what its column says. Never compare a tens digit with a hundreds
          digit.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
