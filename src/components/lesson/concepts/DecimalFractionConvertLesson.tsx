"use client";

import { useState } from "react";
import { MathText } from "@/components/MathText";
import { Step, KeyIdea, FormulaBox, WrongBox } from "@/components/lesson/Step";
import { LessonShell, TryIt } from "@/components/lesson/LessonShell";
import { HundredGrid } from "@/components/lesson/Models";
import { PrimaryButton } from "@/components/ui";

/**
 * Converting between fractions and decimals (Grade 6).
 *
 * The misconception is beautifully simple and completely wrong: read the
 * numbers out of the fraction and drop them after a point, so one third becomes
 * 0.3. It survives because it works for tenths — {3/10} really is 0.3 — and a
 * rule that works once feels like a rule.
 *
 * It is killed by addition rather than by assertion. Three thirds must rebuild
 * the whole, and 0.3 + 0.3 + 0.3 leaves a tenth of the bar sitting on the
 * table. Every conversion here is exact: 3/4 = 0.75, 3/8 = 0.375, 0.35 = 7/20,
 * 9/20 = 0.45.
 */

const BRAND = "#7c3aed";
const TEAL = "#0d9488";
const ROSE = "#dc2626";

/**
 * Two bars of the same whole: one cut into exact thirds, one built from three
 * lots of 0.3. The gap on the second bar is the misconception, drawn.
 */
function ThirdsCheck() {
  const W = 300;
  const barW = 276;
  const x0 = 12;
  const H = 118;
  const third = barW / 3;
  const tenth = barW / 10;
  return (
    <figure className="m-0">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: W }} role="img" aria-label="thirds compared with three lots of 0.3">
        <text x={x0} y={12} fontSize="10" fontWeight="700" fill={BRAND}>
          three exact thirds
        </text>
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <rect x={x0 + i * third} y={18} width={third - 2} height={28} rx="3" fill="#ede9fe" stroke={BRAND} strokeWidth="1.6" />
            <text x={x0 + i * third + third / 2 - 1} y={37} fontSize="12" fontWeight="700" textAnchor="middle" fill={BRAND}>
              1/3
            </text>
          </g>
        ))}
        <text x={x0} y={68} fontSize="10" fontWeight="700" fill={ROSE}>
          three lots of 0.3
        </text>
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <rect x={x0 + i * 3 * tenth} y={74} width={3 * tenth - 2} height={28} rx="3" fill="#f0fdfa" stroke={TEAL} strokeWidth="1.6" />
            <text x={x0 + i * 3 * tenth + (3 * tenth) / 2 - 1} y={93} fontSize="12" fontWeight="700" textAnchor="middle" fill={TEAL}>
              0.3
            </text>
          </g>
        ))}
        <rect x={x0 + 9 * tenth} y={74} width={tenth} height={28} rx="3" fill="#fee2e2" stroke={ROSE} strokeWidth="1.6" />
        <text x={x0 + 9.5 * tenth} y={113} fontSize="9" fontWeight="700" textAnchor="middle" fill={ROSE}>
          0.1 left
        </text>
      </svg>
      <figcaption className="mt-1 text-center text-sm font-semibold text-ink-700">
        thirds fill the bar; three lots of 0.3 do not
      </figcaption>
    </figure>
  );
}

/** The long division 1 ÷ 3, run far enough to see it never stop. */
function NeverEnds() {
  return (
    <div className="rounded-2xl bg-paper px-4 py-3 text-center">
      <div className="text-sm font-semibold text-ink-500">1 ÷ 3 =</div>
      <div className="mt-1 text-2xl font-black tabular-nums text-ink-900">0.333333…</div>
      <div className="mt-1 text-sm text-ink-700">the 3s never run out, and never reach 0.4</div>
    </div>
  );
}

/** Which denominators can be rewritten over 10, 100 or 1000. */
function DenominatorTable() {
  const rows: [string, string, string][] = [
    ["2", "× 50", "50/100 = 0.5"],
    ["4", "× 25", "25/100 = 0.25"],
    ["5", "× 20", "20/100 = 0.2"],
    ["8", "× 125", "125/1000 = 0.125"],
    ["20", "× 5", "5/100 = 0.05"],
    ["25", "× 4", "4/100 = 0.04"],
    ["3", "nothing works", "0.333… forever"],
  ];
  return (
    <div className="overflow-x-auto">
      <table className="mx-auto border-collapse text-sm">
        <thead>
          <tr className="text-[10px] font-bold uppercase tracking-wide text-ink-500">
            <th className="px-2 pb-1">bottom</th>
            <th className="px-2 pb-1">multiply by</th>
            <th className="px-2 pb-1">one unit of it</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([d, k, r]) => {
            const bad = d === "3";
            return (
              <tr key={d} className={bad ? "bg-err-100/60" : ""}>
                <td className="border border-ink-100 px-2 py-1.5 text-center font-bold text-ink-900">{d}</td>
                <td className="border border-ink-100 px-2 py-1.5 text-center text-ink-700">{k}</td>
                <td className="border border-ink-100 px-2 py-1.5 text-center font-semibold text-brand-700">
                  <MathText text={r} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function DecimalFractionConvertLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [guess, setGuess] = useState<string | null>(null);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 6 · Decimals · Fractions and Decimals"
      title="Two ways of writing the same amount"
      minutes={7}
      step={step}
      total={8}
    >
      <Step n={1} title="Splitting a chocolate bar" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          Three friends share one chocolate bar equally. Each gets <MathText text="{1/3}" /> of it.
        </p>
        <p className="mt-3 text-ink-700">
          A calculator wants that as a decimal. Someone says it is <strong>0.3</strong>. Before you
          agree, do one check: three shares must rebuild the whole bar.
        </p>
        <FormulaBox>0.3 + 0.3 + 0.3 = 0.9</FormulaBox>
        <p className="text-ink-700">
          That is not a whole bar. A tenth of it is still on the table.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(2)}>Where did it go?</PrimaryButton>
        </div>
      </Step>

      <Step n={2} title="What a decimal already is" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <p className="text-ink-700">
          A decimal is not a different kind of number. It is a fraction whose bottom you never write
          down, because the place value tells you what it is.
        </p>
        <div className="mt-3 space-y-2">
          {[
            ["0.7", "7 tenths", "{7/10}"],
            ["0.27", "27 hundredths", "{27/100}"],
            ["0.125", "125 thousandths", "{125/1000}"],
          ].map(([a, b, c]) => (
            <div key={a} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-bold text-ink-900">{a}</span>
              <span className="text-sm text-ink-500">{b}</span>
              <span className="text-lg font-bold text-brand-700">
                <MathText text={c} />
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-center">
          <HundredGrid shaded={27} label="0.27 = {27/100}" />
        </div>
        <KeyIdea>
          One decimal place means tenths, two means hundredths, three means thousandths. That is the
          only bottom number a decimal can have.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(3)}>So what about thirds?</PrimaryButton>
        </div>
      </Step>

      <Step n={3} title="Reading the digits off" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">
          <MathText text="{3/10}" /> really is 0.3 — the bottom is already 10. So it is tempting to
          do the same thing every time and read the top number off after the point.
        </p>
        <p className="mt-3 text-ink-700">
          What does that give for <MathText text="{1/3}" />?
        </p>
        <div className="mt-3 grid gap-2">
          {[
            { k: "b", label: "0.3 — the 3 is right there in the fraction" },
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
            Test the rule on a fraction you already know the answer to.
            <div className="mt-3">
              <PrimaryButton onClick={() => go(4)}>Show me</PrimaryButton>
            </div>
          </div>
        )}
      </Step>

      <Step n={4} title="The mistake almost everyone makes" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <WrongBox>
          <MathText text="{1/3}" /> = 0.3
        </WrongBox>
        <p className="text-ink-700">
          Try the same rule on <MathText text="{1/2}" />. It would give 0.2 — and everybody knows a
          half is <strong>0.5</strong>. So the rule was never a rule; it just happened to work for
          tenths.
        </p>
        <div className="mt-4">
          <ThirdsCheck />
        </div>
        <p className="mt-4 text-ink-700">
          The missing 0.1 is the proof. <MathText text="{1/3}" /> has to be a little more than 0.3.
        </p>
        <div className="mt-4">
          <NeverEnds />
        </div>
        <p className="mt-3 text-ink-700">
          Thirds cannot be written exactly as a decimal at all, because no number of tenths,
          hundredths or thousandths ever divides evenly into three.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(5)}>Then how do I convert?</PrimaryButton>
        </div>
      </Step>

      <Step n={5} title="A fraction is a division" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <FormulaBox>
          <MathText text="{a/b}" /> = a ÷ b
        </FormulaBox>
        <p className="text-ink-700">That gives you two ways to convert, and they always agree.</p>
        <div className="mt-3 space-y-2">
          <div className="rounded-xl border-2 border-brand-300 bg-brand-50 px-3 py-2">
            <div className="text-sm font-bold text-ink-900">Route 1 — rebuild the bottom</div>
            <div className="text-sm text-ink-700">
              Multiply top and bottom by whatever turns the bottom into 10, 100 or 1000. Then just
              read it off.
            </div>
          </div>
          <div className="rounded-xl border-2 border-brand-300 bg-brand-50 px-3 py-2">
            <div className="text-sm font-bold text-ink-900">Route 2 — just divide</div>
            <div className="text-sm text-ink-700">
              Work out top ÷ bottom. This always works, even when the answer never ends.
            </div>
          </div>
        </div>
        <KeyIdea>
          Route 1 is faster when the bottom is friendly. Route 2 is the one that never lets you down
          — and it is where 0.333… comes from.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(6)}>Work some through</PrimaryButton>
        </div>
      </Step>

      <Step n={6} title="Both directions, worked" open={step === 6} onOpen={() => go(6)} done={step > 6}>
        <div className="rounded-2xl bg-paper p-4">
          <div className="text-sm font-bold text-ink-900">
            Fraction to decimal: <MathText text="{3/4}" />
          </div>
          <ol className="mt-2 space-y-2">
            {[
              ["What turns 4 into 100?", "× 25"],
              ["Do it to the top as well", "3 × 25 = 75"],
              ["So the fraction is", "{75/100}"],
              ["75 hundredths is written", "0.75"],
            ].map(([a, b], i) => (
              <li key={i} className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 text-sm">
                <span className="text-ink-700">
                  <span className="mr-2 font-bold text-brand-600">{i + 1}.</span>
                  <MathText text={a} />
                </span>
                <span className="shrink-0 font-bold text-ink-900">
                  <MathText text={b} />
                </span>
              </li>
            ))}
          </ol>
          <div className="mt-3 flex justify-center">
            <HundredGrid shaded={75} label="{3/4} = 0.75" />
          </div>
        </div>

        <div className="mt-4 rounded-2xl bg-paper p-4">
          <div className="text-sm font-bold text-ink-900">Decimal to fraction: 0.35</div>
          <ol className="mt-2 space-y-2">
            {[
              ["Two decimal places, so hundredths", "{35/100}"],
              ["Largest number dividing both", "5"],
              ["Divide top and bottom by 5", "{7/20}"],
            ].map(([a, b], i) => (
              <li key={i} className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 text-sm">
                <span className="text-ink-700">
                  <span className="mr-2 font-bold text-brand-600">{i + 1}.</span>
                  <MathText text={a} />
                </span>
                <span className="shrink-0 font-bold text-ink-900">
                  <MathText text={b} />
                </span>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-4 rounded-2xl bg-paper p-4">
          <div className="text-sm font-bold text-ink-900">
            Eighths need thousandths: <MathText text="{3/8}" />
          </div>
          <p className="mt-2 text-sm text-ink-700">
            8 does not divide into 100, but 8 × 125 = 1000. So{" "}
            <MathText text="{3/8} = {375/1000}" /> = <strong>0.375</strong>.
          </p>
        </div>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(7)}>Which bottoms work?</PrimaryButton>
        </div>
      </Step>

      <Step n={7} title="Why thirds are the odd one out" open={step === 7} onOpen={() => go(7)} done={step > 7}>
        <div className="mt-1">
          <DenominatorTable />
        </div>
        <p className="mt-3 text-ink-700">
          Every bottom in that list except 3 divides exactly into 10, 100 or 1000, so each of those
          fractions has a decimal that stops. Thirds, sixths, sevenths and ninths never do — they
          repeat forever.
        </p>
        <p className="mt-3 text-ink-700">
          A mixed number keeps its whole part and converts only the fraction:{" "}
          <MathText text="2 {3/4}" /> = 2.75.
        </p>
        <KeyIdea>
          When the decimal repeats, the fraction is the exact answer and the decimal is the rounded
          one. <MathText text="{1/3}" /> is precise; 0.33 is close.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(8)}>Your turn</PrimaryButton>
        </div>
      </Step>

      <Step n={8} title="You try one" open={step === 8} onOpen={() => go(8)} done={false}>
        <p className="text-ink-700">
          Write <MathText text="{9/20}" /> as a decimal.
        </p>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          What do you multiply 20 by to reach 100? Do the same to the 9.
        </div>
        <TryIt
          prompt={<>2. Type the decimal:</>}
          accept={["0.45", ".45", "0.450"]}
          placeholder="e.g. 0.25"
          value={fade}
          setValue={setFade}
          hint="20 × 5 = 100, so multiply the top by 5 too."
          explain={
            <>
              <MathText text="{9/20} = {45/100}" />, and 45 hundredths is <strong>0.45</strong>.
              Notice it is nowhere near &ldquo;0.920&rdquo; — the digits of a fraction are never its
              decimal.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Fractions and decimals</div>
          <div className="mt-2">1. A decimal is already a fraction over 10, 100 or 1000</div>
          <div className="mt-1">2. To convert: rebuild the bottom, or divide top by bottom</div>
          <div className="mt-1">3. Decimal to fraction: count the places, then simplify</div>
        </div>
        <KeyIdea>
          💡 Never copy the digits across. <MathText text="{1/3}" /> is 0.333…, not 0.3 — and three
          lots of 0.3 leave a tenth of the bar behind.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
