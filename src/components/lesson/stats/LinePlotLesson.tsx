"use client";

import { useState } from "react";
import { Step, KeyIdea, WrongBox } from "@/components/lesson/Step";
import { LessonShell, TryIt } from "@/components/lesson/LessonShell";
import { DotPlot } from "@/components/lesson/stats/StatModels";
import { PrimaryButton } from "@/components/ui";

/**
 * Line plots (dot plots).
 *
 * A line plot carries two numbers at right angles to each other, and children
 * routinely answer with the wrong one: asked which value happened most often
 * they give the height of the tallest stack. The lesson names the two
 * directions and keeps returning to them, because every question about a line
 * plot is really "which direction is this asking about?".
 */
export function LinePlotLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [guess, setGuess] = useState<string | null>(null);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  const counts = [2, 3, 6, 1, 2];

  return (
    <LessonShell
      breadcrumb="Grade 4 · Data · Line Plots"
      title="Reading a line plot"
      minutes={5}
      step={step}
      total={6}
    >
      <Step n={1} title="The chart on the fridge" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          After every game, your team adds one ✕ above the number of goals they scored.
        </p>
        <div className="mt-4">
          <DotPlot
            title="Goals scored, one ✕ per game"
            from={0}
            to={4}
            counts={counts}
            axisLabel="goals scored in a game"
          />
        </div>
        <p className="mt-4 text-ink-700">
          Six games ended with 2 goals. One game ended with 3. The chart remembers every game.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(2)}>How many games?</PrimaryButton></div>
      </Step>

      <Step n={2} title="Every ✕ is one game" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <p className="text-ink-700">
          To find how many games the team has played, count the ✕ marks — not the columns.
        </p>
        <div className="mt-3 rounded-2xl bg-paper p-4">
          <div className="flex flex-wrap items-center justify-center gap-2 text-sm font-bold text-ink-900">
            <span>2</span><span className="text-ink-500">+</span>
            <span>3</span><span className="text-ink-500">+</span>
            <span>6</span><span className="text-ink-500">+</span>
            <span>1</span><span className="text-ink-500">+</span>
            <span>2</span><span className="text-ink-500">=</span>
            <span className="text-ok-600">14 games</span>
          </div>
        </div>
        <KeyIdea>
          There are only 5 columns but 14 games. A column is a <em>score</em> that happened; the ✕
          marks inside it are the games it happened in.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(3)}>A trickier question</PrimaryButton></div>
      </Step>

      <Step n={3} title="What happened most often?" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <div>
          <DotPlot from={0} to={4} counts={counts} axisLabel="goals scored in a game" highlight={2} />
        </div>
        <p className="mt-3 text-ink-700">
          The tallest stack is ringed. What number of goals happened most often?
        </p>
        <div className="mt-3 grid gap-2">
          {[
            { k: "a", label: "6" },
            { k: "b", label: "2" },
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
            Both numbers are on the chart. Let&rsquo;s see what each one means.
            <div className="mt-3"><PrimaryButton onClick={() => go(4)}>Show me</PrimaryButton></div>
          </div>
        )}
      </Step>

      <Step n={4} title="The mistake almost everyone makes" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <WrongBox>&ldquo;It happened most often, so the answer is 6&rdquo;</WrongBox>
        <p className="text-ink-700">
          6 is a real number on this chart — but it is the answer to{" "}
          <strong>how many times</strong>, not to <strong>which score</strong>. The two numbers sit
          in different directions.
        </p>
        <div className="mt-3 space-y-2">
          <div className="rounded-xl bg-paper px-3 py-2">
            <div className="text-sm font-bold text-ink-900">→ Across the bottom</div>
            <div className="text-sm text-ink-700">What was measured: goals in a game — 0, 1, 2, 3, 4.</div>
          </div>
          <div className="rounded-xl bg-paper px-3 py-2">
            <div className="text-sm font-bold text-ink-900">↑ Up the stack</div>
            <div className="text-sm text-ink-700">How often it happened: 2, 3, 6, 1, 2 games.</div>
          </div>
        </div>
        <p className="mt-3 text-center text-lg font-bold text-ok-600">
          The most common score is 2 goals — it happened 6 times.
        </p>
        <KeyIdea>
          Say the sentence out loud before answering: &ldquo;<strong>2 goals</strong> happened{" "}
          <strong>6 times</strong>.&rdquo; The question decides which half of that sentence you hand
          over.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(5)}>Two more questions</PrimaryButton></div>
      </Step>

      <Step n={5} title="Spread, and adding columns" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <div>
          <DotPlot from={0} to={4} counts={counts} axisLabel="goals scored in a game" />
        </div>
        <div className="mt-3 rounded-2xl bg-paper p-4">
          <ol className="space-y-2">
            {[
              ["Range: the highest score with a ✕ is 4, the lowest is 0", "4 − 0 = 4"],
              ["Games with more than 2 goals: the columns to the right of 2", "1 + 2 = 3 games"],
            ].map(([a, b], i) => (
              <li key={i} className="rounded-xl bg-white px-3 py-2 text-sm">
                <span className="mr-2 font-bold text-brand-600">{i + 1}.</span>
                <span className="text-ink-700">{a}</span>
                <div className="mt-0.5 font-bold text-ink-900">{b}</div>
              </li>
            ))}
          </ol>
        </div>
        <p className="mt-3 text-ink-700">
          Notice that &ldquo;more than 2&rdquo; does not include the column above 2 itself, and that
          the range uses the numbers along the bottom — never the heights.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(6)}>Your turn</PrimaryButton></div>
      </Step>

      <Step n={6} title="You try one" open={step === 6} onOpen={() => go(6)} done={false}>
        <p className="text-ink-700">
          A different plot. Each ✕ is one school day, and it shows how many minutes late the bus was.
        </p>
        <div className="mt-3">
          <DotPlot
            title="Minutes the bus was late"
            from={0}
            to={4}
            counts={[3, 5, 2, 0, 1]}
            axisLabel="minutes late"
          />
        </div>
        <TryIt
          prompt={<>Which number of minutes late happened most often?</>}
          accept={["1"]}
          placeholder="minutes late"
          value={fade}
          setValue={setFade}
          hint="find the tallest stack, then look straight down to the number underneath it."
          explain={
            <>
              <strong>1 minute</strong>. That column has 5 ✕ marks, which is more than any other —
              but 5 is how often, and 1 is the answer to the question asked.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Reading a line plot</div>
          <div className="mt-2">1. One ✕ = one thing that was measured</div>
          <div className="mt-1">2. Along the bottom = the value</div>
          <div className="mt-1">3. Up the stack = how often that value happened</div>
        </div>
        <KeyIdea>
          💡 &ldquo;Which value?&rdquo; is answered along the bottom. &ldquo;How many?&rdquo; is
          answered by counting ✕ marks. Decide which is being asked before you answer.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
