"use client";

import { useState } from "react";
import { Step, KeyIdea, FormulaBox, WrongBox } from "@/components/lesson/Step";
import { LessonShell, TryIt } from "@/components/lesson/LessonShell";
import { DotPlot, ValueStrip } from "@/components/lesson/stats/StatModels";
import { PrimaryButton } from "@/components/ui";

/**
 * Describing a distribution: centre, spread and shape (Grade 7–9).
 *
 * Two misconceptions run through the bank. The first is that "the average"
 * always means the mean, even when a single outlier has dragged it away from
 * every actual person in the data. The second is that skew is named for where
 * the bulk of the data sits rather than where the tail points.
 *
 * The salary figures are chosen so both the mean and the median come out exact:
 * eight salaries totalling 328, plus one of 500, is 828 over 9 people — a mean
 * of exactly 92 against a median of 42.
 */

/** The nine salaries, in thousands, already sorted. */
const SALARIES = [32, 36, 38, 40, 42, 44, 46, 50, 500];
const SALARY_TOTAL = 828; // 32+36+38+40+42+44+46+50+500
const SALARY_MEAN = 92; // 828 ÷ 9
const SALARY_MEDIAN = 42; // the 5th of 9

export function DistributionShapeLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [guess, setGuess] = useState<string | null>(null);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 7 · Statistics · Distributions"
      title="Centre, spread and shape"
      minutes={8}
      step={step}
      total={8}
    >
      <Step n={1} title="A job advert" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <div className="rounded-2xl border-2 border-ink-900 bg-white px-4 py-5 text-center">
          <div className="text-xs font-bold uppercase tracking-wide text-ink-500">Now hiring</div>
          <div className="mt-2 text-2xl font-black text-ink-900">Average salary $92,000</div>
          <div className="mt-1 text-sm text-ink-700">&ldquo;Join our team of nine.&rdquo;</div>
        </div>
        <p className="mt-4 text-ink-700">
          Every number in that advert is true. Nobody has lied to you. And yet if you take the job,
          you will almost certainly earn far less than $92,000.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(2)}>How can both be true?</PrimaryButton>
        </div>
      </Step>

      <Step n={2} title="The three words you need" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <p className="text-ink-700">
          Take a tiny data set: <strong>3, 5, 7, 9, 11</strong>.
        </p>
        <div className="mt-3 space-y-2">
          {[
            ["Mean", "add everything, divide by how many", "35 ÷ 5 = 7"],
            ["Median", "sort them, take the middle one", "7"],
            ["Range", "highest minus lowest", "11 − 3 = 8"],
          ].map(([a, b, c]) => (
            <div key={a} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-bold text-ink-900">{a}</span>
              <span className="text-sm text-ink-500">{b}</span>
              <span className="text-sm font-bold text-brand-700">{c}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-ink-700">
          Mean and median describe the <strong>centre</strong>. Range describes the{" "}
          <strong>spread</strong>. They answer different questions, and a data set needs both.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(3)}>Back to the salaries</PrimaryButton>
        </div>
      </Step>

      <Step n={3} title="The nine actual salaries" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">Here they are, in thousands of dollars, sorted.</p>
        <div className="mt-3">
          <ValueStrip values={SALARIES} label="salary ($000)" />
        </div>
        <p className="mt-2 text-ink-700">
          Eight people between 32 and 50. One founder on 500. Which single number should the advert
          have used to describe a typical salary?
        </p>
        <div className="mt-3 grid gap-2">
          {[
            { k: "b", label: "$92,000 — the mean is the average, so it is the typical salary" },
            { k: "a", label: "Something else" },
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
            Count how many people actually earn $92,000 or more.
            <div className="mt-3">
              <PrimaryButton onClick={() => go(4)}>Show me</PrimaryButton>
            </div>
          </div>
        )}
      </Step>

      <Step n={4} title="The mistake almost everyone makes" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <WrongBox>&ldquo;The mean is $92,000, so a typical worker earns $92,000&rdquo;</WrongBox>
        <p className="text-ink-700">
          Mark the mean on the data and look at where it lands.
        </p>
        <div className="mt-3">
          <ValueStrip values={SALARIES} label="salary ($000) — mean is 92" />
        </div>
        <div className="mt-3 space-y-2">
          {[
            ["Earning less than the mean", "8 of the 9"],
            ["Earning more than the mean", "1 of the 9"],
            ["Highest salary that is not the founder", "50"],
          ].map(([a, b]) => (
            <div key={a} className="flex items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm text-ink-700">{a}</span>
              <span className="text-sm font-bold text-ink-900">{b}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-ink-700">
          The mean sits above <em>everybody except one person</em>. It is a correct calculation and a
          terrible description. The founder&rsquo;s 500 is an <strong>outlier</strong>, and the mean
          shared it out across the other eight.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(5)}>Why does that happen?</PrimaryButton>
        </div>
      </Step>

      <Step n={5} title="One measure counts, the other only lines up" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <FormulaBox>mean = total ÷ how many</FormulaBox>
        <p className="text-ink-700">
          The mean puts <strong>every value</strong> into the total, so a single huge value drags it.
          Push the founder&rsquo;s salary to 5,000 and the mean leaps again.
        </p>
        <p className="mt-3 text-ink-700">
          The median only asks <strong>which value is in the middle position</strong>. Push the
          founder to 5,000 and the person in the middle has not moved at all.
        </p>
        <div className="mt-3">
          <ValueStrip values={[32, 36, 38, 40, 42, 44, 46, 50, "5000"]} middle={4} label="median still 42" />
        </div>
        <div className="mt-3 space-y-2">
          {[
            ["Mean", "uses every value", "sensitive to outliers"],
            ["Median", "uses position only", "resistant to outliers"],
          ].map(([a, b, c]) => (
            <div key={a} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-bold text-ink-900">{a}</span>
              <span className="text-sm text-ink-500">{b}</span>
              <span className="text-sm font-bold text-brand-700">{c}</span>
            </div>
          ))}
        </div>
        <KeyIdea>
          When one value is far from the rest, report the <strong>median</strong>. When the data has
          no extreme values, the mean is fine — and uses more information.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(6)}>Work them both out</PrimaryButton>
        </div>
      </Step>

      <Step n={6} title="Both numbers, worked out" open={step === 6} onOpen={() => go(6)} done={step > 6}>
        <div className="rounded-2xl bg-paper p-4">
          <ol className="space-y-2">
            {[
              ["Add all nine salaries", `${SALARY_TOTAL}`],
              ["Divide by 9", `mean = ${SALARY_MEAN}`],
              ["Sort them (already sorted)", "32 … 500"],
              ["9 values, so the middle is the 5th", `median = ${SALARY_MEDIAN}`],
              ["Range: 500 − 32", "468"],
            ].map(([a, b], i) => (
              <li key={i} className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 text-sm">
                <span className="text-ink-700">
                  <span className="mr-2 font-bold text-brand-600">{i + 1}.</span>
                  {a}
                </span>
                <span className="shrink-0 font-bold text-ink-900">{b}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="mt-3">
          <ValueStrip values={SALARIES} middle={4} label="the 5th value is the median" />
        </div>
        <p className="mt-3 text-ink-700">
          An honest advert would say <strong>&ldquo;median salary $42,000&rdquo;</strong>. It is less
          impressive and far more useful.
        </p>
        <p className="mt-3 text-ink-700">
          And notice the spread. Two teams can share a centre and be nothing alike: if two classes
          both average 70, but one has a range of 10 and the other a range of 40, the second class
          has scores scattered far wider. Always report spread beside centre.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(7)}>What shape is the data?</PrimaryButton>
        </div>
      </Step>

      <Step n={7} title="Naming the shape" open={step === 7} onOpen={() => go(7)} done={step > 7}>
        <p className="text-ink-700">
          Plot the values and the distribution has a shape. A histogram or a dot plot shows it.
        </p>
        <div className="mt-3 space-y-4">
          <DotPlot
            from={1}
            to={10}
            counts={[0, 1, 2, 4, 6, 6, 4, 2, 1, 0]}
            title="Symmetric"
            axisLabel="balanced either side of the centre"
          />
          <DotPlot
            from={1}
            to={10}
            counts={[0, 2, 6, 7, 4, 2, 1, 1, 0, 1]}
            title="Skewed right"
            axisLabel="pile on the left, long tail stretching right"
          />
        </div>
        <p className="mt-4 text-ink-700">Now the second thing that trips people up:</p>
        <WrongBox>&ldquo;Most of the data is on the left, so it is skewed left&rdquo;</WrongBox>
        <p className="text-ink-700">
          Skew is named for the <strong>tail</strong>, not the pile. The tail is the thin part that
          stretches away, and in that second plot it stretches to the <em>right</em> — so the
          distribution is skewed <strong>right</strong>.
        </p>
        <div className="mt-4 space-y-2">
          {[
            ["Symmetric", "mean ≈ median"],
            ["Skewed right (tail to the right)", "mean > median"],
            ["Skewed left (tail to the left)", "mean < median"],
          ].map(([a, b]) => (
            <div key={a} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm text-ink-700">{a}</span>
              <span className="text-sm font-bold text-ink-900">{b}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-ink-700">
          Check it against the salaries: mean 92, median 42. The mean is bigger, so the tail must run
          to the right — and it does, all the way out to 500.
        </p>
        <KeyIdea>
          The tail names the skew. And the tail is also what pulls the mean, which is why{" "}
          <strong>mean &gt; median</strong> is the fingerprint of a right-skewed set.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(8)}>Your turn</PrimaryButton>
        </div>
      </Step>

      <Step n={8} title="You try one" open={step === 8} onOpen={() => go(8)} done={false}>
        <p className="text-ink-700">
          Five friends counted how many books they read this year: <strong>4, 5, 6, 7, 38</strong>.
        </p>
        <div className="mt-3">
          <ValueStrip values={[4, 5, 6, 7, 38]} label="books read" />
        </div>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          The mean is 60 ÷ 5 = 12 — higher than four of the five friends. So the mean is not the
          number to quote here.
        </div>
        <div className="mt-2 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">2. </span>
          The values are already sorted, and there are 5 of them.
        </div>
        <TryIt
          prompt={<>3. What is the median?</>}
          accept={["6"]}
          placeholder="a number"
          value={fade}
          setValue={setFade}
          hint="with 5 sorted values, the middle one is the 3rd."
          explain={
            <>
              The median is <strong>6 books</strong>. The 38 is an outlier: it pushed the mean up to
              12, but it could not move the value sitting in the middle position. Mean 12 &gt; median
              6, so this data is skewed right.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Describing a distribution</div>
          <div className="mt-2">1. Centre: mean, or median if there is an outlier</div>
          <div className="mt-1">2. Spread: the range — never report centre alone</div>
          <div className="mt-1">3. Shape: skew is named after the tail</div>
        </div>
        <KeyIdea>
          💡 The mean uses every value, so one extreme value moves it. The median only cares about
          position, so it stays put. Choose the one that describes the people, not the arithmetic.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
