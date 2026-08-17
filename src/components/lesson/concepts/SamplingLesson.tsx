"use client";

import { useState } from "react";
import { Step, KeyIdea, WrongBox } from "@/components/lesson/Step";
import { LessonShell, TryIt } from "@/components/lesson/LessonShell";
import { PrimaryButton } from "@/components/ui";

/**
 * Samples, populations and bias (Grade 7–9).
 *
 * The bank punishes two beliefs. The first is that a sample which was easy to
 * collect is good enough — the people in front of you feel like people in
 * general. The second is subtler and more dangerous: that collecting more of a
 * biased sample fixes it. Sample size shrinks random noise, never bias, and the
 * lesson shows that with the same wrong estimate drawn twice.
 *
 * All the counts are exact: 30 of the 100 townspeople exercise weekly, the ten
 * people found at the gym contain 9 of them, and the ten chosen at random
 * contain 3 — recovering the true 30%.
 */

/** Indices of the 30 townspeople (out of 100) who exercise weekly. */
const EXERCISERS = new Set([
  2, 5, 7, 11, 14, 17, 19, 23, 25, 28, 31, 34, 38, 40, 43, 47, 52, 55, 59, 61, 66, 70, 73, 78, 81,
  84, 86, 90, 93, 96,
]);
/** The ten people you meet standing outside a gym — 9 of them exercise. */
const GYM_SAMPLE = [2, 5, 7, 11, 14, 17, 19, 23, 25, 26];
/** Ten people drawn at random from the town register — 3 of them exercise. */
const RANDOM_SAMPLE = [6, 19, 27, 33, 48, 55, 62, 71, 89, 93];

/**
 * The whole town as 100 dots, with an optional sample ringed.
 *
 * Drawing the population *and* the sample on one picture is the only way to
 * show that a sample can be perfectly real and still be the wrong ten people.
 */
function TownBoard({
  picked,
  title,
}: {
  picked?: number[];
  title?: string;
}) {
  const cell = 17;
  const W = cell * 10 + 6;
  const H = W;
  const pick = new Set(picked ?? []);
  return (
    <figure className="m-0">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: W * 1.5 }} role="img" aria-label={title ?? "the town"}>
        {Array.from({ length: 100 }, (_, i) => {
          const cx = 3 + (i % 10) * cell + cell / 2;
          const cy = 3 + Math.floor(i / 10) * cell + cell / 2;
          const on = EXERCISERS.has(i);
          return (
            <g key={i}>
              <circle cx={cx} cy={cy} r={5} fill={on ? "#d97706" : "#cbd5e1"} />
              {pick.has(i) && (
                <circle cx={cx} cy={cy} r={7.5} fill="none" stroke="#7c3aed" strokeWidth="2" />
              )}
            </g>
          );
        })}
      </svg>
      {title && (
        <figcaption className="mt-1 text-center text-sm font-semibold text-ink-700">{title}</figcaption>
      )}
    </figure>
  );
}

function BoardKey() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-ink-700">
      <span className="inline-flex items-center gap-1.5">
        <span className="inline-block h-3 w-3 rounded-full" style={{ background: "#d97706" }} />
        exercises weekly
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="inline-block h-3 w-3 rounded-full" style={{ background: "#cbd5e1" }} />
        does not
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span
          className="inline-block h-3.5 w-3.5 rounded-full border-2"
          style={{ borderColor: "#7c3aed" }}
        />
        in the sample
      </span>
    </div>
  );
}

/** A 0–100% track with the true value marked and one estimate plotted on it. */
function Meter({
  estimate,
  truth,
  label,
}: {
  estimate: number;
  truth: number;
  label: string;
}) {
  const W = 280;
  const H = 46;
  const x = (v: number) => 10 + (v / 100) * (W - 20);
  return (
    <figure className="m-0">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: W }} role="img" aria-label={label}>
        <rect x={10} y={18} width={W - 20} height={8} rx="4" fill="#e5e7eb" />
        <line x1={x(truth)} y1={10} x2={x(truth)} y2={34} stroke="#16a34a" strokeWidth="2" strokeDasharray="4 3" />
        <text x={x(truth)} y={44} fontSize="9" textAnchor="middle" fill="#16a34a">
          truth {truth}%
        </text>
        <circle cx={x(estimate)} cy={22} r="7" fill="#dc2626" />
        <text x={x(estimate)} y={11} fontSize="10" fontWeight="700" textAnchor="middle" fill="#dc2626">
          {estimate}%
        </text>
      </svg>
      <figcaption className="mt-1 text-center text-sm font-semibold text-ink-700">{label}</figcaption>
    </figure>
  );
}

export function SamplingLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [guess, setGuess] = useState<string | null>(null);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 7 · Statistics · Sampling"
      title="Who you ask decides the answer"
      minutes={8}
      step={step}
      total={8}
    >
      <Step n={1} title="A survey result" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <div className="rounded-2xl border-2 border-ink-900 bg-white px-4 py-5 text-center">
          <div className="text-xs font-bold uppercase tracking-wide text-ink-500">Town Herald</div>
          <div className="mt-2 text-2xl font-black text-ink-900">
            9 in 10 residents exercise every week
          </div>
          <div className="mt-1 text-sm text-ink-700">
            &ldquo;We asked ten people. Nine said yes.&rdquo;
          </div>
        </div>
        <p className="mt-4 text-ink-700">
          Nobody miscounted. Nine really did say yes. The survey was carried out at the entrance to
          the town gym.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(2)}>Start with the words</PrimaryButton>
        </div>
      </Step>

      <Step n={2} title="Population and sample" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <div className="space-y-2">
          {[
            ["Population", "the entire group you want to know about", "everyone in the town"],
            ["Sample", "the part of it you actually ask", "the ten people surveyed"],
          ].map(([a, b, c]) => (
            <div key={a} className="rounded-xl bg-paper px-3 py-2">
              <div className="text-sm font-bold text-ink-900">{a}</div>
              <div className="text-sm text-ink-500">{b}</div>
              <div className="text-sm font-semibold text-brand-700">{c}</div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-ink-700">
          You sample because asking everyone is impossible. That is a practical compromise, and it
          works — as long as the small group behaves like the big one.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(3)}>Look at the whole town</PrimaryButton>
        </div>
      </Step>

      <Step n={3} title="The town, all 100 of them" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">
          Here is every resident. Orange means they exercise every week. Count them and the real
          figure is <strong>30 out of 100 — 30%</strong>.
        </p>
        <div className="mt-3 flex justify-center">
          <TownBoard title="the whole town" />
        </div>
        <div className="mt-3">
          <BoardKey />
        </div>
        <p className="mt-4 text-ink-700">
          The newspaper said 90%. Where did ten people go so wrong?
        </p>
        <div className="mt-3 grid gap-2">
          {[
            { k: "b", label: "Bad luck — ten is a small number, it just came out odd" },
            { k: "a", label: "Standing at the gym changed who could be picked" },
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
            Let&rsquo;s ring the ten people who were actually asked.
            <div className="mt-3">
              <PrimaryButton onClick={() => go(4)}>Show me</PrimaryButton>
            </div>
          </div>
        )}
      </Step>

      <Step n={4} title="The mistake almost everyone makes" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <WrongBox>&ldquo;I asked ten real residents, so they stand for the town&rdquo;</WrongBox>
        <div className="mt-3 flex justify-center">
          <TownBoard picked={GYM_SAMPLE} title="the ten asked at the gym — 9 orange" />
        </div>
        <p className="mt-4 text-ink-700">
          Every one of them is a genuine resident. But the gym door quietly did the choosing: the
          people who walk through it are the people who exercise. Nine of the ten were orange before
          a single question was asked.
        </p>
        <div className="mt-3">
          <Meter estimate={90} truth={30} label="the gym survey's estimate" />
        </div>
        <p className="mt-3 text-ink-700">
          A sample chosen because it was easy to reach is called a <strong>convenience sample</strong>
          , and the systematic error it produces is called <strong>bias</strong>.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(5)}>Then just ask more people?</PrimaryButton>
        </div>
      </Step>

      <Step n={5} title="The follow-up mistake" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <WrongBox>&ldquo;Ten was too few. Ask 400 at the gym instead&rdquo;</WrongBox>
        <p className="text-ink-700">
          This one is worth slowing down for, because it sounds like good science. More data is
          usually better. But look at what changes and what does not:
        </p>
        <div className="mt-4 space-y-3">
          <Meter estimate={90} truth={30} label="10 people at the gym" />
          <Meter estimate={91} truth={30} label="400 people at the gym" />
        </div>
        <p className="mt-4 text-ink-700">
          The estimate did not move towards the truth. It just stopped wobbling. Every extra person
          came through the same door, so every extra person carried the same tilt.
        </p>
        <div className="mt-4 space-y-2">
          {[
            ["Sample size fixes", "random wobble — how much the answer jumps around"],
            ["Sample size never fixes", "bias — a tilt built into who could be chosen"],
          ].map(([a, b]) => (
            <div key={a} className="rounded-xl bg-paper px-3 py-2">
              <div className="text-sm font-bold text-ink-900">{a}</div>
              <div className="text-sm text-ink-700">{b}</div>
            </div>
          ))}
        </div>
        <KeyIdea>
          A bigger biased sample is not a better answer. It is the same wrong answer, held more
          confidently.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(6)}>So what does work?</PrimaryButton>
        </div>
      </Step>

      <Step n={6} title="Random first, then size" open={step === 6} onOpen={() => go(6)} done={step > 6}>
        <p className="text-ink-700">
          Take the town register, number every resident, and let a random draw pick ten. Now nobody
          is filtered out by where they happen to be standing.
        </p>
        <div className="mt-3 flex justify-center">
          <TownBoard picked={RANDOM_SAMPLE} title="ten drawn at random — 3 orange" />
        </div>
        <div className="mt-3">
          <Meter estimate={30} truth={30} label="the random sample's estimate" />
        </div>
        <p className="mt-4 text-ink-700">
          Ten people. The same tiny sample size as the newspaper used — and it lands on the truth,
          because <strong>every resident had an equal chance of being chosen</strong>.
        </p>
        <div className="mt-4 space-y-2">
          {[
            ["Names drawn from a hat containing everyone", "random ✓"],
            ["The first 10 people to arrive", "not random"],
            ["People who volunteer, or vote in an online poll", "not random — they chose themselves"],
            ["Everyone in one classroom", "not random — one group only"],
          ].map(([a, b]) => (
            <div key={a} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm text-ink-700">{a}</span>
              <span className="text-sm font-bold text-ink-900">{b}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-xl bg-warn-100 px-4 py-3 text-sm text-ink-700">
          ⚠️ The question can be biased too. &ldquo;Do you agree that our excellent park deserves
          more funding?&rdquo; pushes people towards yes before they have thought. That is a{" "}
          <strong>leading question</strong>.
        </div>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(7)}>Now compare two fair polls</PrimaryButton>
        </div>
      </Step>

      <Step n={7} title="When size does decide" open={step === 7} onOpen={() => go(7)} done={step > 7}>
        <p className="text-ink-700">
          Two election polls disagree. Both drew their people <strong>at random</strong> from the
          full voter list.
        </p>
        <div className="mt-3 rounded-2xl bg-paper p-4">
          <ol className="space-y-2">
            {[
              ["Poll A: 50 random voters", "fair method"],
              ["Poll B: 500 random voters", "fair method"],
              ["Is either one biased?", "no — both random"],
              ["So what separates them?", "only random wobble"],
              ["Which wobbles less?", "the bigger one"],
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
          <p className="mt-3 text-center font-bold text-ok-600">Trust Poll B, with 500.</p>
        </div>
        <KeyIdea>
          Size is the tie-breaker <em>between fair methods</em>. It is never a repair for an unfair
          one — so always check how people were chosen before you look at how many.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(8)}>Your turn</PrimaryButton>
        </div>
      </Step>

      <Step n={8} title="You try one" open={step === 8} onOpen={() => go(8)} done={false}>
        <p className="text-ink-700">
          A town of 12,000 people is being surveyed about a new library. Two studies report
          different results.
        </p>
        <div className="mt-3 space-y-2">
          {[
            ["Survey A", "2,000 shoppers leaving one supermarket"],
            ["Survey B", "200 residents drawn at random from the town address list"],
          ].map(([a, b]) => (
            <div key={a} className="rounded-xl bg-paper px-3 py-2">
              <div className="text-sm font-bold text-ink-900">{a}</div>
              <div className="text-sm text-ink-700">{b}</div>
            </div>
          ))}
        </div>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          Ask the first question: could every resident have been chosen? For Survey A, only people
          who shop at that one supermarket could.
        </div>
        <TryIt
          prompt={<>2. Which survey should you trust — type its number of people, 2000 or 200:</>}
          accept={["200"]}
          placeholder="2000 or 200"
          value={fade}
          setValue={setFade}
          hint="check for bias before you compare sizes."
          explain={
            <>
              Trust the <strong>200</strong>. Survey A is ten times bigger and still biased — every
              extra shopper came through the same door. Survey B is random, so its smaller size only
              costs a little precision, not the whole answer.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Judging a survey</div>
          <div className="mt-2">1. Who is the population?</div>
          <div className="mt-1">2. Could every one of them have been chosen?</div>
          <div className="mt-1">3. Only then does a bigger sample help</div>
        </div>
        <KeyIdea>
          💡 Bias is a tilt in <em>who</em> gets asked, and no amount of extra asking straightens it.
          Random selection is the only fix.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
