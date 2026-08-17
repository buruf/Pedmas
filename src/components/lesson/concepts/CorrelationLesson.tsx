"use client";

import { useState } from "react";
import { Step, KeyIdea, FormulaBox, WrongBox } from "@/components/lesson/Step";
import { LessonShell, TryIt } from "@/components/lesson/LessonShell";
import { ScatterPlot } from "@/components/lesson/stats/StatModels";
import { PrimaryButton } from "@/components/ui";

/**
 * Reading a correlation: direction, strength, r, and the two claims it cannot
 * support (Grade 9).
 *
 * The bank attacks two habits. The first is treating a rising trend as proof
 * that one variable causes the other. The second is running the line of best
 * fit far past the data that produced it. Both are the same underlying error —
 * assuming a pattern holds in a place where nothing was ever measured — so the
 * lesson names that once and applies it twice.
 *
 * Every prediction here is exact arithmetic on a stated line, never a fitted
 * estimate: 7 × 4 + 68 = 96, 7 × 40 + 68 = 348, 4 × 6 + 12 = 36.
 */

const GROWTH = [
  { x: 1, y: 74 },
  { x: 2, y: 83 },
  { x: 3, y: 88 },
  { x: 4, y: 97 },
  { x: 5, y: 104 },
  { x: 6, y: 109 },
];

export function CorrelationLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [guess, setGuess] = useState<string | null>(null);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 9 · Statistics · Correlation"
      title="What a trend line can and cannot tell you"
      minutes={8}
      step={step}
      total={8}
    >
      <Step n={1} title="A headline" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <div className="rounded-2xl border-2 border-ink-900 bg-white px-4 py-5 text-center">
          <div className="text-xs font-bold uppercase tracking-wide text-ink-500">City Chronicle</div>
          <div className="mt-2 text-2xl font-black text-ink-900">Firefighters make fires worse</div>
          <div className="mt-1 text-sm text-ink-700">
            &ldquo;The more firefighters sent to a blaze, the more damage it does.&rdquo;
          </div>
        </div>
        <p className="mt-4 text-ink-700">
          The city measured it. Send more firefighters, and the damage bill really is higher — every
          single time. The data is solid. The conclusion is nonsense. Working out exactly where the
          argument breaks is the point of this lesson.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(2)}>Start with the plot</PrimaryButton>
        </div>
      </Step>

      <Step n={2} title="Direction: which way does it drift?" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <p className="text-ink-700">
          On a scatter plot each dot carries two measurements. The first thing to read is the
          direction of the drift.
        </p>
        <div className="mt-3 flex flex-wrap justify-center gap-3">
          <ScatterPlot
            title="Positive"
            points={[
              { x: 1, y: 3 },
              { x: 2, y: 5 },
              { x: 3, y: 6 },
              { x: 4, y: 9 },
              { x: 5, y: 10 },
              { x: 6, y: 13 },
            ]}
            xMax={7}
            yMax={15}
            xStep={7}
            yStep={5}
            width={158}
          />
          <ScatterPlot
            title="Negative"
            points={[
              { x: 1, y: 13 },
              { x: 2, y: 11 },
              { x: 3, y: 10 },
              { x: 4, y: 7 },
              { x: 5, y: 5 },
              { x: 6, y: 3 },
            ]}
            xMax={7}
            yMax={15}
            xStep={7}
            yStep={5}
            width={158}
          />
          <ScatterPlot
            title="None"
            points={[
              { x: 1, y: 11 },
              { x: 2, y: 4 },
              { x: 3, y: 13 },
              { x: 4, y: 6 },
              { x: 5, y: 12 },
              { x: 6, y: 5 },
            ]}
            xMax={7}
            yMax={15}
            xStep={7}
            yStep={5}
            width={158}
          />
        </div>
        <div className="mt-3 space-y-2">
          {[
            ["Positive", "x up, y up"],
            ["Negative", "x up, y down"],
            ["None", "no consistent drift either way"],
          ].map(([a, b]) => (
            <div key={a} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-bold text-ink-900">{a}</span>
              <span className="text-sm text-ink-700">{b}</span>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(3)}>And how strong is it?</PrimaryButton>
        </div>
      </Step>

      <Step n={3} title="Strength, and the number r" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">
          Direction is only half the description. <strong>Strength</strong> is how tightly the dots
          hug the line.
        </p>
        <div className="mt-3 flex flex-wrap justify-center gap-3">
          <ScatterPlot
            title="Strong positive"
            points={[
              { x: 1, y: 3 },
              { x: 2, y: 5 },
              { x: 3, y: 7 },
              { x: 4, y: 9 },
              { x: 5, y: 11 },
              { x: 6, y: 13 },
            ]}
            xMax={7}
            yMax={15}
            xStep={7}
            yStep={5}
            width={158}
          />
          <ScatterPlot
            title="Weak positive"
            points={[
              { x: 1, y: 6 },
              { x: 2, y: 3 },
              { x: 3, y: 9 },
              { x: 4, y: 6 },
              { x: 5, y: 13 },
              { x: 6, y: 9 },
            ]}
            xMax={7}
            yMax={15}
            xStep={7}
            yStep={5}
            width={158}
          />
        </div>
        <p className="mt-3 text-ink-700">
          Statisticians pack both facts into one number, the correlation coefficient{" "}
          <strong>r</strong>. Its sign is the direction; its size is the strength.
        </p>
        <div className="mt-3 space-y-2">
          {[
            ["r close to 1", "strong positive — the dots nearly form a rising line"],
            ["r close to −1", "strong negative — a falling line"],
            ["r close to 0", "little or no linear trend"],
          ].map(([a, b]) => (
            <div key={a} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-bold text-ink-900">{a}</span>
              <span className="text-sm text-ink-700">{b}</span>
            </div>
          ))}
        </div>
        <KeyIdea>
          A point sitting far away from everything else is an <strong>outlier</strong>. One outlier
          can drag the whole line of best fit, so always look at the plot before trusting r.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(4)}>Back to the firefighters</PrimaryButton>
        </div>
      </Step>

      <Step n={4} title="The city's data" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <div className="flex justify-center">
          <ScatterPlot
            title="Firefighters sent and damage caused"
            points={[
              { x: 2, y: 4 },
              { x: 4, y: 9 },
              { x: 6, y: 12 },
              { x: 8, y: 19 },
              { x: 10, y: 22 },
              { x: 12, y: 29 },
            ]}
            xMax={14}
            yMax={35}
            xStep={2}
            yStep={5}
            xLabel="firefighters sent"
            yLabel="damage ($0,000)"
          />
        </div>
        <p className="mt-3 text-ink-700">
          Strong, positive, and completely real. So should the city send fewer firefighters to save
          money?
        </p>
        <div className="mt-3 grid gap-2">
          {[
            { k: "b", label: "Yes — the data shows firefighters increase the damage" },
            { k: "a", label: "No — something is missing from the plot" },
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
            Ask what decides how many firefighters get sent in the first place.
            <div className="mt-3">
              <PrimaryButton onClick={() => go(5)}>Show me</PrimaryButton>
            </div>
          </div>
        )}
      </Step>

      <Step n={5} title="The mistake almost everyone makes" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <WrongBox>&ldquo;They rise together, so firefighters cause the damage&rdquo;</WrongBox>
        <p className="text-ink-700">
          The plot has two columns of numbers. The thing that actually drives both of them was never
          measured: <strong>the size of the fire</strong>.
        </p>
        <div className="my-4 rounded-2xl bg-paper p-4">
          <div className="mx-auto max-w-xs">
            <div className="rounded-xl bg-warn-100 px-3 py-2 text-center text-sm font-bold text-ink-900">
              🔥 how big the fire is
            </div>
            <div className="mt-1 flex justify-center gap-10 text-lg text-ink-500">
              <span>↙</span>
              <span>↘</span>
            </div>
            <div className="flex gap-2">
              <div className="flex-1 rounded-xl bg-white px-2 py-2 text-center text-xs font-bold text-ink-900">
                more firefighters sent
              </div>
              <div className="flex-1 rounded-xl bg-white px-2 py-2 text-center text-xs font-bold text-ink-900">
                more damage done
              </div>
            </div>
            <div className="mt-2 text-center text-sm font-bold text-err-600">
              no arrow between these two
            </div>
          </div>
        </div>
        <p className="text-ink-700">
          A big fire causes both columns to be large. That hidden cause is a{" "}
          <strong>lurking variable</strong>, and it manufactures a correlation between two things
          that never touched each other.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(6)}>State the rule</PrimaryButton>
        </div>
      </Step>

      <Step n={6} title="Three explanations, every time" open={step === 6} onOpen={() => go(6)} done={step > 6}>
        <p className="text-ink-700">
          Whenever two things are correlated, at least three stories fit the same plot:
        </p>
        <div className="mt-3 space-y-2">
          {[
            ["A causes B", "firefighters cause damage"],
            ["B causes A", "damage causes more firefighters to be sent"],
            ["C causes both", "the fire's size causes both"],
          ].map(([a, b], i) => (
            <div key={a} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-bold text-ink-900">
                <span className="mr-2 text-brand-600">{i + 1}.</span>
                {a}
              </span>
              <span className="text-sm text-ink-700">{b}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-ink-700">
          The scatter plot cannot choose between them, because all three produce identical dots. Only
          an experiment — where you decide who gets the treatment — can separate cause from
          coincidence.
        </p>
        <div className="mt-3 space-y-2">
          <div className="rounded-xl border-2 border-ok-600/40 bg-ok-100 px-3 py-2">
            <div className="text-sm font-bold text-ink-900">✓ Safe to say</div>
            <div className="text-sm text-ink-700">
              &ldquo;Fires with more firefighters <em>also had</em> more damage.&rdquo;
            </div>
          </div>
          <div className="rounded-xl border-2 border-err-600/40 bg-err-100/60 px-3 py-2">
            <div className="text-sm font-bold text-ink-900">✗ Not supported</div>
            <div className="text-sm text-ink-700">
              &ldquo;Sending firefighters <em>causes</em> damage.&rdquo;
            </div>
          </div>
        </div>
        <KeyIdea>
          Correlation is not causation. A study that only watches — rather than intervenes — can show
          association and nothing more.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(7)}>Using the line to predict</PrimaryButton>
        </div>
      </Step>

      <Step n={7} title="Predicting — and how far is too far" open={step === 7} onOpen={() => go(7)} done={step > 7}>
        <p className="text-ink-700">
          A child&rsquo;s height was measured every year from age 1 to age 6. A line has been drawn
          through the trend.
        </p>
        <div className="mt-3 flex justify-center">
          <ScatterPlot
            title="Age and height"
            points={GROWTH}
            xMax={8}
            yMax={140}
            xStep={2}
            yStep={20}
            line={{ m: 7, b: 68 }}
            predict={4}
            xLabel="age (years)"
            yLabel="height (cm)"
          />
        </div>
        <FormulaBox>height = 7 × age + 68</FormulaBox>
        <div className="rounded-2xl bg-paper p-4">
          <ol className="space-y-2">
            {[
              ["Predict the height at age 4", "7 × 4 + 68"],
              ["Multiply first", "28 + 68"],
              ["Add", "96 cm"],
              ["Is age 4 inside the measured range 1 to 6?", "yes — safe"],
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
        <p className="mt-4 text-ink-700">Now push the same line further out.</p>
        <WrongBox>at age 40: 7 × 40 + 68 = 348 cm tall</WrongBox>
        <p className="text-ink-700">
          Nothing went wrong with the arithmetic — 348 is exactly what the line says. What went wrong
          is that the line was only ever tested between ages 1 and 6. Past there you have no
          evidence at all, and in fact growth stops.
        </p>
        <KeyIdea>
          Predicting inside the measured range is <strong>interpolation</strong>, and it is
          reasonable. Predicting far outside it is <strong>extrapolation</strong>, and the trend was
          never checked out there.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(8)}>Your turn</PrimaryButton>
        </div>
      </Step>

      <Step n={8} title="You try one" open={step === 8} onOpen={() => go(8)} done={false}>
        <p className="text-ink-700">
          A different study measured practice sessions against words spelled correctly, for 1 to 5
          sessions. Its line of best fit is <strong>y = 4x + 12</strong>.
        </p>
        <div className="mt-3 flex justify-center">
          <ScatterPlot
            title="Practice and words spelled"
            points={[
              { x: 1, y: 17 },
              { x: 2, y: 19 },
              { x: 3, y: 25 },
              { x: 4, y: 27 },
              { x: 5, y: 33 },
            ]}
            xMax={8}
            yMax={50}
            xStep={2}
            yStep={10}
            line={{ m: 4, b: 12 }}
            predict={6}
            xLabel="practice sessions"
            yLabel="words spelled"
          />
        </div>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          Put 6 into the equation: y = 4 × 6 + 12. Six is just past the measured range, so this is a
          short, defensible step — not a leap.
        </div>
        <TryIt
          prompt={<>2. Predict the words spelled after 6 sessions.</>}
          accept={["36"]}
          placeholder="a number"
          value={fade}
          setValue={setFade}
          hint="work out 4 × 6 first, then add the 12."
          explain={
            <>
              4 × 6 + 12 = <strong>36 words</strong>. Two warnings come with it. The same line at 100
              sessions claims 412 words, which nothing in this study supports. And even here, the
              data alone cannot prove practice <em>caused</em> the improvement — for that you would
              have to run an experiment.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Reading a correlation</div>
          <div className="mt-2">1. Name the direction: positive, negative or none</div>
          <div className="mt-1">2. Judge the strength — r near ±1 is strong, near 0 is weak</div>
          <div className="mt-1">3. Predict inside the data, never far outside it</div>
          <div className="mt-1">4. Never upgrade an association into a cause</div>
        </div>
        <KeyIdea>
          💡 Both traps are the same mistake: claiming something about a place the data never went —
          either a cause it never tested, or an x value it never measured.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
