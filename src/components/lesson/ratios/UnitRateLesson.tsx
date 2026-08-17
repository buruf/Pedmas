"use client";

import { useState } from "react";
import { Step, KeyIdea, WrongBox } from "@/components/lesson/Step";
import { LessonShell, EstimateCheck, TryIt } from "@/components/lesson/LessonShell";
import { PrimaryButton } from "@/components/ui";

/** A small two-row rate table with the y ÷ x column made visible. */
function RateTable({
  xLabel,
  yLabel,
  xs,
  ys,
  quotients,
  quotientLabel,
  steady,
}: {
  xLabel: string;
  yLabel: string;
  xs: number[];
  ys: number[];
  quotients: string[];
  quotientLabel: string;
  steady: boolean;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="mx-auto border-collapse text-center">
        <tbody>
          <tr>
            <td className="border border-ink-100 bg-paper px-3 py-2 text-sm font-bold text-ink-900">{xLabel}</td>
            {xs.map((v, i) => (
              <td key={i} className="border border-ink-100 px-4 py-2 text-lg font-bold tabular-nums text-ink-900">
                {v}
              </td>
            ))}
          </tr>
          <tr>
            <td className="border border-ink-100 bg-paper px-3 py-2 text-sm font-bold text-ink-900">{yLabel}</td>
            {ys.map((v, i) => (
              <td key={i} className="border border-ink-100 px-4 py-2 text-lg font-bold tabular-nums text-brand-700">
                {v}
              </td>
            ))}
          </tr>
          <tr>
            <td className="px-3 pt-1.5 text-xs font-semibold text-ink-500">{quotientLabel}</td>
            {quotients.map((v, i) => (
              <td
                key={i}
                className={`px-4 pt-1.5 text-xs font-bold ${steady ? "text-ok-600" : "text-err-600"}`}
              >
                {v}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

/**
 * Unit rates and proportional relationships.
 *
 * Two ideas that are really one: the constant of proportionality IS the unit
 * rate. The lesson confronts the error that decides whether a child can start
 * a rate question at all — dividing the wrong way round — and then the error
 * that decides whether they can recognise one: reading "goes up steadily" as
 * proportional.
 */
export function UnitRateLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [guess, setGuess] = useState<string | null>(null);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 6 · Ratios · Unit Rates"
      title="The price of exactly one"
      minutes={6}
      step={step}
      total={7}
    >
      <Step n={1} title="Two packs of pens" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-paper px-3 py-3 text-center">
            <div className="text-sm font-bold text-ink-900">Pack A</div>
            <div className="mt-1 text-lg font-black text-brand-700">3 pens for $6</div>
          </div>
          <div className="rounded-xl bg-paper px-3 py-3 text-center">
            <div className="text-sm font-bold text-ink-900">Pack B</div>
            <div className="mt-1 text-lg font-black text-brand-700">5 pens for $9</div>
          </div>
        </div>
        <p className="mt-4 text-ink-700">Which pack is better value?</p>
        <div className="mt-4 grid gap-2">
          {[
            { k: "b", label: "Pack A — it costs less" },
            { k: "a", label: "Pack B" },
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
            The prices are not comparable until both packs are measured the same way — per pen.
            <div className="mt-3"><PrimaryButton onClick={() => go(2)}>Work them out</PrimaryButton></div>
          </div>
        )}
      </Step>

      <Step n={2} title="The mistake almost everyone makes" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <WrongBox>3 pens for $6 → 3 ÷ 6 = 0.5, so each pen costs 50¢</WrongBox>
        <p className="text-ink-700">
          Test that answer instead of trusting it. If each pen really cost 50¢, then 3 of them would
          cost <strong>$1.50</strong> — and the pack costs $6. The division went the wrong way round.
        </p>
        <div className="mt-4 rounded-2xl bg-paper p-4">
          <ol className="space-y-2">
            {[
              ["Pack A: $6 shared over 3 pens", "6 ÷ 3 = $2 each"],
              ["Pack B: $9 shared over 5 pens", "9 ÷ 5 = $1.80 each"],
              ["Cheaper per pen", "Pack B"],
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
        <p className="mt-3 text-ink-700">
          Pack B costs more at the till and still wins — which is exactly why the unit rate is worth
          finding.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(3)}>How do I know which way?</PrimaryButton></div>
      </Step>

      <Step n={3} title="The word per tells you what to divide by" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">
          Whatever comes after <strong>per</strong> is the thing you want <em>one</em> of. That is
          the number you divide by.
        </p>
        <div className="mt-3 space-y-2">
          {[
            ["dollars per pen", "dollars ÷ pens", "6 ÷ 3 = 2"],
            ["km per hour", "km ÷ hours", "240 ÷ 4 = 60"],
            ["pages per minute", "pages ÷ minutes", "90 ÷ 3 = 30"],
          ].map(([a, b, c]) => (
            <div key={a} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-semibold text-ink-900">{a}</span>
              <span className="text-sm text-brand-700">{b}</span>
              <span className="text-sm text-ink-500">{c}</span>
            </div>
          ))}
        </div>
        <EstimateCheck>
          Multiply your answer back. 3 pens at $2 is $6 ✓. Had you answered 50¢, 3 pens would come to
          $1.50 ✗. That one check catches every upside-down division.
        </EstimateCheck>
        <div className="mt-4"><PrimaryButton onClick={() => go(4)}>Use a rate</PrimaryButton></div>
      </Step>

      <Step n={4} title="Finding a rate, then using it" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <p className="text-ink-700">
          A train travels <strong>240 km in 4 hours</strong> at a steady speed. How far does it get
          in 7 hours?
        </p>
        <div className="mt-4 rounded-2xl bg-paper p-4">
          <ol className="space-y-2">
            {[
              ["We want km per hour, so divide by the hours", "240 ÷ 4 = 60 km/h"],
              ["That is the distance for ONE hour", "60 km"],
              ["Seven of those hours", "60 × 7 = 420 km"],
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
        <KeyIdea>
          Find the rate once, and every other question becomes a single multiplication. Divide to
          get to one, multiply to get to many.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(5)}>Same rate every time</PrimaryButton></div>
      </Step>

      <Step n={5} title="When the rate never changes" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">
          Lay that train out as a table. Divide each distance by its time and the same 60 comes back
          every single time.
        </p>
        <div className="mt-4">
          <RateTable
            xLabel="hours"
            yLabel="km"
            xs={[1, 2, 3, 4]}
            ys={[60, 120, 180, 240]}
            quotients={["60", "60", "60", "60"]}
            quotientLabel="km ÷ hours"
            steady
          />
        </div>
        <p className="mt-4 text-ink-700">
          That fixed number has a name — the <strong>constant of proportionality</strong>, usually
          written <strong>k</strong>. It is the unit rate wearing a different hat, and it gives you
          an equation:
        </p>
        <div className="my-4 rounded-xl bg-ink-900 px-4 py-4 text-center text-xl font-bold text-white">
          y = 60x
        </div>
        <p className="text-ink-700">
          Put in x = 7 hours and out comes y = 420 km — the same answer as before, with no working.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(6)}>Is every table like this?</PrimaryButton></div>
      </Step>

      <Step n={6} title="The second mistake almost everyone makes" open={step === 6} onOpen={() => go(6)} done={step > 6}>
        <WrongBox>&ldquo;It goes up by the same amount each time, so it&rsquo;s proportional&rdquo;</WrongBox>
        <p className="text-ink-700">
          Here is a taxi that charges <strong>$3 to get in</strong> and then <strong>$2 per km</strong>.
          The cost climbs by a steady $2 every kilometre — and it is not proportional.
        </p>
        <div className="mt-4">
          <RateTable
            xLabel="km"
            yLabel="$"
            xs={[1, 2, 3, 4]}
            ys={[5, 7, 9, 11]}
            quotients={["5", "3.5", "3", "2.75"]}
            quotientLabel="$ ÷ km"
            steady={false}
          />
        </div>
        <p className="mt-4 text-ink-700">
          Every column gives a different rate, so there is no single &ldquo;cost per km&rdquo; for the
          journey. The giveaway is the start: a 0 km trip still costs $3.
        </p>
        <KeyIdea>
          Proportional means <strong>y ÷ x is the same for every pair</strong> — which also means the
          graph passes through (0, 0). Going up steadily is not enough; it has to go up{" "}
          <em>from nothing</em>.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(7)}>Your turn</PrimaryButton></div>
      </Step>

      <Step n={7} title="You try one" open={step === 7} onOpen={() => go(7)} done={false}>
        <p className="text-ink-700">
          A shop sells <strong>8 apples for $12</strong>. What does one apple cost?
        </p>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          You want <strong>dollars per apple</strong>, so the apples go underneath: 12 ÷ 8.
        </div>
        <TryIt
          prompt={<>2. Work it out. One apple costs (in dollars):</>}
          accept={["1.5", "1.50", "$1.5", "$1.50"]}
          placeholder="like 2.5"
          value={fade}
          setValue={setFade}
          hint="12 ÷ 8 is between 1 and 2. Eight apples must come back to $12 when you multiply."
          explain={
            <>
              <strong>$1.50</strong>. Check by multiplying back: 8 × 1.50 = $12 ✓. So k = 1.5, and
              the cost of any number of apples is y = 1.5x.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Unit rates</div>
          <div className="mt-2">1. &ldquo;A per B&rdquo; means divide A by B</div>
          <div className="mt-1">2. Always multiply back to check the direction</div>
          <div className="mt-1">3. Proportional means y ÷ x never changes: y = kx</div>
        </div>
        <KeyIdea>
          💡 The unit rate and the constant of proportionality are the same number. Find it once and
          the whole table, graph and equation follow from it.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
