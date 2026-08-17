"use client";

import { useState } from "react";
import { Step, KeyIdea, FormulaBox, WrongBox } from "@/components/lesson/Step";
import { LessonShell, TryIt } from "@/components/lesson/LessonShell";
import { ScatterPlot } from "@/components/lesson/stats/StatModels";
import { PrimaryButton } from "@/components/ui";

/**
 * Scatter plots, correlation, and the line of best fit.
 *
 * The misconception is the most consequential one in school statistics:
 * reading a rising trend as proof that one thing causes the other. It is
 * confronted with a correlation that is completely real and an explanation
 * that is completely wrong, so the child cannot dismiss the data — only the
 * conclusion drawn from it.
 */
export function ScatterCorrelationLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [guess, setGuess] = useState<string | null>(null);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  const iceCream = [
    { x: 1, y: 1 },
    { x: 2, y: 1 },
    { x: 3, y: 3 },
    { x: 4, y: 2 },
    { x: 5, y: 4 },
    { x: 6, y: 4 },
    { x: 7, y: 6 },
    { x: 8, y: 5 },
  ];

  return (
    <LessonShell
      breadcrumb="Grade 8 · Statistics · Scatter Plots & Correlation"
      title="Two things moving together"
      minutes={7}
      step={step}
      total={8}
    >
      <Step n={1} title="A headline" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <div className="rounded-2xl border-2 border-ink-900 bg-white px-4 py-5 text-center">
          <div className="text-xs font-bold uppercase tracking-wide text-ink-500">The Daily News</div>
          <div className="mt-2 text-2xl font-black text-ink-900">Ice cream causes drowning</div>
          <div className="mt-1 text-sm text-ink-700">
            &ldquo;On days when more ice cream is sold, more swimmers have to be rescued.&rdquo;
          </div>
        </div>
        <p className="mt-4 text-ink-700">
          The newspaper is not making the data up. Every number in it is real. By the end of this
          lesson you will be able to say exactly what is wrong with it.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(2)}>Start with the plot</PrimaryButton></div>
      </Step>

      <Step n={2} title="One dot, two facts" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <p className="text-ink-700">
          A scatter plot puts one dot per thing measured, but each dot carries two numbers at once.
          Here every dot is one student.
        </p>
        <div className="mt-3">
          <ScatterPlot
            title="Study time and test score"
            points={[
              { x: 1, y: 12 },
              { x: 2, y: 18 },
              { x: 3, y: 22 },
              { x: 4, y: 32 },
              { x: 5, y: 36 },
              { x: 6, y: 44 },
              { x: 7, y: 46 },
            ]}
            xMax={8}
            yMax={50}
            xStep={2}
            yStep={10}
            xLabel="hours studied"
            yLabel="score"
          />
        </div>
        <p className="mt-3 text-ink-700">
          The dot at 4 hours and 32 marks says: <em>one student studied 4 hours and scored 32</em>.
          The dots drift upwards as you go right, so more study went with higher scores.
        </p>
        <KeyIdea>
          That upward drift is called a <strong>positive correlation</strong>: as one goes up, so
          does the other.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(3)}>Back to the headline</PrimaryButton></div>
      </Step>

      <Step n={3} title="The newspaper's data" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">
          Here is the actual data. Each dot is one day last summer.
        </p>
        <div className="mt-3">
          <ScatterPlot
            title="Ice cream sales and water rescues"
            points={iceCream}
            xMax={9}
            yMax={8}
            xStep={3}
            yStep={2}
            xLabel="ice creams sold (hundreds)"
            yLabel="rescues"
          />
        </div>
        <p className="mt-3 text-ink-700">
          It really does rise. So should the town ban ice cream to save lives?
        </p>
        <div className="mt-3 grid gap-2">
          {[
            { k: "a", label: "Yes — the data clearly shows ice cream is dangerous" },
            { k: "b", label: "No — something else is going on" },
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
            Let&rsquo;s ask what else changes on those days.
            <div className="mt-3"><PrimaryButton onClick={() => go(4)}>Show me</PrimaryButton></div>
          </div>
        )}
      </Step>

      <Step n={4} title="The mistake almost everyone makes" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <WrongBox>&ldquo;They rise together, so ice cream must cause drowning&rdquo;</WrongBox>
        <p className="text-ink-700">
          Something is missing from the plot entirely — the weather. On hot days people buy ice
          cream. On hot days people also swim, and more swimmers means more rescues.
        </p>
        <div className="my-4 rounded-2xl bg-paper p-4">
          <div className="mx-auto max-w-xs">
            <div className="rounded-xl bg-warn-100 px-3 py-2 text-center text-sm font-bold text-ink-900">
              ☀️ hot weather
            </div>
            <div className="mt-1 flex justify-center gap-8 text-lg text-ink-500">
              <span>↙</span>
              <span>↘</span>
            </div>
            <div className="flex gap-2">
              <div className="flex-1 rounded-xl bg-white px-2 py-2 text-center text-xs font-bold text-ink-900">
                more ice cream sold
              </div>
              <div className="flex-1 rounded-xl bg-white px-2 py-2 text-center text-xs font-bold text-ink-900">
                more people swimming → more rescues
              </div>
            </div>
            <div className="mt-2 text-center text-sm font-bold text-err-600">
              ice cream ⇸ drowning &nbsp;(no arrow between them)
            </div>
          </div>
        </div>
        <p className="text-ink-700">
          Hot weather is driving both columns. That hidden cause has a name: a{" "}
          <strong>lurking variable</strong>. The two things on the plot never touched each other.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(5)}>So what can a plot show?</PrimaryButton></div>
      </Step>

      <Step n={5} title="What a scatter plot can and cannot say" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <div className="space-y-2">
          <div className="rounded-xl border-2 border-ok-600/40 bg-ok-100 px-3 py-2">
            <div className="text-sm font-bold text-ink-900">✓ It can show correlation</div>
            <div className="text-sm text-ink-700">These two measurements move together.</div>
          </div>
          <div className="rounded-xl border-2 border-err-600/40 bg-err-100/60 px-3 py-2">
            <div className="text-sm font-bold text-ink-900">✗ It cannot show causation</div>
            <div className="text-sm text-ink-700">
              That one of them makes the other happen.
            </div>
          </div>
        </div>
        <p className="mt-3 text-ink-700">
          Whenever two things are correlated, there are always at least three explanations: the first
          causes the second, the second causes the first, or a third thing causes both. A plot cannot
          tell you which — only an experiment can.
        </p>
        <KeyIdea>
          Say it as a sentence you can defend: &ldquo;days with more ice cream sales <em>also had</em>{" "}
          more rescues&rdquo;. That is what the data proves. Anything stronger is a story you added.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(6)}>The three shapes</PrimaryButton></div>
      </Step>

      <Step n={6} title="Three shapes to recognise" open={step === 6} onOpen={() => go(6)} done={step > 6}>
        <div className="flex flex-wrap justify-center gap-3">
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
            width={165}
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
            width={165}
          />
          <ScatterPlot
            title="No correlation"
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
            width={165}
          />
        </div>
        <div className="mt-3 space-y-2">
          {[
            ["Positive", "up together", "hours studied and test score"],
            ["Negative", "one up, one down", "age of a car and its value"],
            ["None", "no drift either way", "shoe size and test score"],
          ].map(([a, b, c]) => (
            <div key={a} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-bold text-ink-900">{a}</span>
              <span className="text-sm text-brand-700">{b}</span>
              <span className="text-sm text-ink-500">{c}</span>
            </div>
          ))}
        </div>
        <div className="mt-4"><PrimaryButton onClick={() => go(7)}>Drawing a line through it</PrimaryButton></div>
      </Step>

      <Step n={7} title="The line of best fit" open={step === 7} onOpen={() => go(7)} done={step > 7}>
        <p className="text-ink-700">
          When the dots do follow a trend, you can draw one straight line through the middle of them
          and use it to estimate values you never measured.
        </p>
        <div className="mt-3">
          <ScatterPlot
            title="Practice minutes and words spelled"
            points={[
              { x: 1, y: 10 },
              { x: 2, y: 14 },
              { x: 3, y: 18 },
              { x: 4, y: 22 },
              { x: 5, y: 26 },
            ]}
            xMax={10}
            yMax={40}
            xStep={2}
            yStep={10}
            line={{ m: 4, b: 6 }}
            predict={8}
            xLabel="practice sessions"
            yLabel="words spelled"
          />
        </div>
        <FormulaBox>y = 4x + 6</FormulaBox>
        <div className="mt-3 space-y-2">
          {[
            ["The slope, 4", "each extra session adds about 4 words"],
            ["The intercept, 6", "the value the line gives when x is 0"],
            ["Predict at x = 8", "4 × 8 + 6 = 38 words"],
          ].map(([a, b]) => (
            <div key={a} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-bold text-ink-900">{a}</span>
              <span className="text-sm text-ink-700">{b}</span>
            </div>
          ))}
        </div>
        <KeyIdea>
          Predicting <em>inside</em> the range you measured is reasonable. Push far outside it and
          the line will happily tell you that 50 sessions gives 206 words — the trend was never
          tested out there.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(8)}>Your turn</PrimaryButton></div>
      </Step>

      <Step n={8} title="You try one" open={step === 8} onOpen={() => go(8)} done={false}>
        <p className="text-ink-700">
          A different set of data. Its line of best fit is <strong>y = 3x + 5</strong>, where x is
          the number of weeks of training and y is push-ups.
        </p>
        <div className="mt-3">
          <ScatterPlot
            title="Training weeks and push-ups"
            points={[
              { x: 1, y: 8 },
              { x: 2, y: 11 },
              { x: 3, y: 14 },
              { x: 4, y: 17 },
              { x: 5, y: 20 },
            ]}
            xMax={8}
            yMax={30}
            xStep={2}
            yStep={10}
            line={{ m: 3, b: 5 }}
            predict={7}
            xLabel="weeks"
            yLabel="push-ups"
          />
        </div>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          Put 7 into the equation: y = 3 × 7 + 5.
        </div>
        <TryIt
          prompt={<>2. Predict the push-ups after 7 weeks.</>}
          accept={["26"]}
          placeholder="push-ups"
          value={fade}
          setValue={setFade}
          hint="work out 3 × 7 first, then add the 5."
          explain={
            <>
              3 × 7 + 5 = <strong>26 push-ups</strong>. And remember what this is: an estimate from a
              trend, not a promise. It also does not prove the training caused it — though here, an
              experiment could.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Scatter plots</div>
          <div className="mt-2">1. Each dot is one thing, carrying two numbers</div>
          <div className="mt-1">2. Name the drift: positive, negative or none</div>
          <div className="mt-1">3. Use the line of best fit to estimate, inside the data</div>
          <div className="mt-1">4. Never upgrade a correlation into a cause</div>
        </div>
        <KeyIdea>
          💡 Correlation is not causation. When two things move together, always ask what third
          thing might be moving both.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
