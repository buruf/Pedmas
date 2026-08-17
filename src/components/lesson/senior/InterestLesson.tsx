"use client";

import { useState } from "react";
import { MathText } from "@/components/MathText";
import { Step, KeyIdea, FormulaBox, WrongBox } from "@/components/lesson/Step";
import { LessonShell, TryIt } from "@/components/lesson/LessonShell";
import { PrimaryButton } from "@/components/ui";

/**
 * $1000 at 10% for twenty years, drawn twice: a straight line for simple
 * interest and a curve for compound. The point of the picture is the gap on
 * the right — it is not a rounding difference, it is more than double.
 */
function InterestGapPlot() {
  const W = 300;
  const H = 205;
  const V_MAX = 7000;
  const px = (t: number) => 36 + (t / 20) * (W - 52);
  const py = (v: number) => H - 26 - (v / V_MAX) * (H - 44);
  const simple: string[] = [];
  const compound: string[] = [];
  for (let i = 0; i <= 80; i++) {
    const t = (20 * i) / 80;
    simple.push(`${px(t).toFixed(1)},${py(1000 + 100 * t).toFixed(1)}`);
    compound.push(`${px(t).toFixed(1)},${py(1000 * 1.1 ** t).toFixed(1)}`);
  }
  return (
    <figure className="m-0">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style={{ maxWidth: W }}
        role="img"
        aria-label="a straight line for simple interest and a rising curve for compound interest, far apart after twenty years"
      >
        {[2000, 4000, 6000].map((v) => (
          <g key={v}>
            <line x1={px(0)} y1={py(v)} x2={px(20)} y2={py(v)} stroke="#f3f4f6" strokeWidth="1" />
            <text x={px(0) - 4} y={py(v) + 3} fontSize="8" textAnchor="end" fill="#6b7280">
              {v}
            </text>
          </g>
        ))}
        <line x1={px(0)} y1={py(0)} x2={px(20)} y2={py(0)} stroke="#94a3b8" strokeWidth="1.4" />
        <line x1={px(0)} y1={py(0)} x2={px(0)} y2={py(V_MAX)} stroke="#94a3b8" strokeWidth="1.4" />
        <polyline points={compound.join(" ")} fill="none" stroke="#7c3aed" strokeWidth="2.8" />
        <polyline points={simple.join(" ")} fill="none" stroke="#0d9488" strokeWidth="2.4" strokeDasharray="6 4" />
        <line x1={px(20)} y1={py(3000)} x2={px(20)} y2={py(6727.5)} stroke="#dc2626" strokeWidth="2" />
        <text x={px(20) - 4} y={py(4800)} fontSize="10" fontWeight="700" textAnchor="end" fill="#dc2626">
          $3727 apart
        </text>
        <text x={px(1)} y={py(6400)} fontSize="10" fontWeight="700" fill="#7c3aed">
          compound → $6727.50
        </text>
        <text x={px(1)} y={py(1900)} fontSize="10" fontWeight="700" fill="#0d9488">
          simple → $3000
        </text>
        {[0, 10, 20].map((t) => (
          <text key={t} x={px(t)} y={py(0) + 13} fontSize="9" textAnchor="middle" fill="#6b7280">
            {t}
          </text>
        ))}
        <text x={px(20) - 34} y={py(0) + 24} fontSize="9" fill="#6b7280">
          years
        </text>
      </svg>
    </figure>
  );
}

/**
 * Simple and compound interest.
 *
 * Students can state both formulas and still not know what separates them. The
 * lesson pins the difference on a single question — what is the percentage
 * taken OF? — and then lets $1000 at 10% run for twenty years so the answer is
 * worth $3727.
 */
export function InterestLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [guess, setGuess] = useState<string | null>(null);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 10 · Financial maths · Interest"
      title="Why one account beats the other"
      minutes={9}
      step={step}
      total={7}
    >
      <Step n={1} title="Two friends, same $1000" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          Amina and Ben each put $1000 away at 10% a year. Same money, same rate, same twenty years.
        </p>
        <p className="mt-3 text-ink-700">
          Amina ends with $3000. Ben ends with $6727.50. Ben has more than twice as much, and
          neither of them added a cent along the way.
        </p>
        <p className="mt-3 text-ink-700">
          One word explains the whole difference: Amina&rsquo;s account paid <strong>simple</strong>{" "}
          interest and Ben&rsquo;s paid <strong>compound</strong>.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(2)}>Start with one year</PrimaryButton>
        </div>
      </Step>

      <Step n={2} title="One year looks identical" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <p className="text-ink-700">
          10% of $1000 is <MathText text="1000 * {10/100} = 100" />. So after one year both accounts
          hold $1100.
        </p>
        <p className="mt-3 text-ink-700">
          Nothing has separated them yet. The split opens in year two, and it opens because of a
          single question: <strong>10% of what?</strong>
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(3)}>Year two</PrimaryButton>
        </div>
      </Step>

      <Step n={3} title="The new problem" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">
          In year two, Ben&rsquo;s account pays 10% again. What is that 10% calculated on?
        </p>
        <div className="mt-4 grid gap-2">
          {[
            { k: "b", label: "The original $1000 — so another $100" },
            { k: "a", label: "The $1100 that is actually in the account" },
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
            The answer is different for the two accounts — and that is the whole topic.
            <div className="mt-3">
              <PrimaryButton onClick={() => go(4)}>Show me both</PrimaryButton>
            </div>
          </div>
        )}
      </Step>

      <Step n={4} title="The mistake almost everyone makes" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <WrongBox>Simple and compound interest are basically the same</WrongBox>
        <p className="text-ink-700">
          They agree for exactly one year, which is long enough to make them look interchangeable.
          Run them side by side and watch them part.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="mx-auto border-collapse text-center text-sm">
            <thead>
              <tr className="text-xs font-bold uppercase tracking-wide text-ink-500">
                <th className="px-2 pb-1">year</th>
                <th className="px-2 pb-1 text-ok-600">simple</th>
                <th className="px-2 pb-1 text-brand-600">compound</th>
                <th className="px-2 pb-1">gap</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["1", "$1100", "$1100", "—"],
                ["2", "$1200", "$1210", "$10"],
                ["3", "$1300", "$1331", "$31"],
                ["5", "$1500", "$1610.51", "$110.51"],
                ["10", "$2000", "$2593.74", "$593.74"],
                ["20", "$3000", "$6727.50", "$3727.50"],
              ].map(([a, b, c, d]) => (
                <tr key={a} className={a === "20" ? "bg-err-100" : ""}>
                  <td className="border border-ink-100 px-3 py-1 font-semibold tabular-nums text-ink-700">{a}</td>
                  <td className="border border-ink-100 px-3 py-1 tabular-nums text-ink-700">{b}</td>
                  <td className="border border-ink-100 px-3 py-1 font-bold tabular-nums text-brand-700">{c}</td>
                  <td className="border border-ink-100 px-3 py-1 font-bold tabular-nums text-err-600">{d}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-ink-700">
          Look at year 2. Simple interest pays another $100, because it always takes 10% of the{" "}
          <em>original</em> $1000. Compound pays $110, because it takes 10% of the{" "}
          <em>$1100 that is really there</em> — including last year&rsquo;s $100 of interest.
        </p>
        <p className="mt-3 text-ink-700">
          That extra $10 is interest earned <strong>by the interest</strong>. Next year it earns
          interest too, and so on. The gap is not a rounding wobble — after twenty years it is
          larger than the original investment.
        </p>
        <div className="mt-4">
          <InterestGapPlot />
        </div>
        <p className="mt-3 text-ink-700">
          The shapes give it away. Simple interest is a <strong>straight line</strong> — the same
          $100 is added every year, forever. Compound interest is a <strong>curve</strong> that
          steepens, because each year&rsquo;s payment is bigger than the last.
        </p>
        <KeyIdea>
          Simple interest <strong>adds</strong> a fixed amount. Compound interest{" "}
          <strong>multiplies</strong> by a fixed factor. Adding and multiplying repeatedly are not
          the same operation, and the gap between them grows without limit.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(5)}>The two formulas</PrimaryButton>
        </div>
      </Step>

      <Step n={5} title="Write each one down" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <FormulaBox>
          <div className="text-base">
            <MathText text="simple: I = P r t" />
          </div>
          <div className="mt-2 text-base">
            <MathText text="compound: A = P(1 + r)^t" />
          </div>
        </FormulaBox>
        <p className="text-ink-700">
          Two details catch people out. The simple formula gives you the{" "}
          <strong>interest</strong>, so you add <MathText text="P" /> back if the question wants the
          total. The compound formula gives you the <strong>total</strong>, so you subtract{" "}
          <MathText text="P" /> if the question wants the interest.
        </p>
        <div className="mt-3 space-y-2">
          {[
            ["I = P r t", "gives interest only", "total = P + I"],
            ["A = P(1 + r)^t", "gives the total", "interest = A − P"],
          ].map(([a, b, c]) => (
            <div key={a} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-bold text-ink-900">
                <MathText text={a} />
              </span>
              <span className="text-xs text-ink-500">{b}</span>
              <span className="text-sm font-bold text-brand-700">
                <MathText text={c} />
              </span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-ink-700">
          The compound bracket, <MathText text="1 + r" />, is called the <strong>growth
          factor</strong>. For 10% it is 1.1; for 20% it is 1.2. Losing 10% a year gives a factor of
          0.9 instead, and the same formula handles decay without any changes.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(6)}>Worked examples</PrimaryButton>
        </div>
      </Step>

      <Step n={6} title="One of each" open={step === 6} onOpen={() => go(6)} done={step > 6}>
        <p className="text-ink-700">
          <strong>Simple.</strong> $500 at 6% simple interest for 4 years. How much interest is
          earned, and what is the total?
        </p>
        <div className="mt-3 rounded-2xl bg-paper p-4">
          <ol className="space-y-2">
            {[
              ["Interest in one year: 500 * {6/100}", "$30"],
              ["Same again every year, for 4 years", "30 * 4 = $120"],
              ["Total value", "500 + 120 = $620"],
            ].map(([a, b], i) => (
              <li key={i} className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 text-sm">
                <span className="text-ink-700">
                  <span className="mr-2 font-bold text-brand-600">{i + 1}.</span>
                  <MathText text={a} />
                </span>
                <span className="font-bold text-ink-900">
                  <MathText text={b} />
                </span>
              </li>
            ))}
          </ol>
        </div>
        <p className="mt-4 text-ink-700">
          <strong>Compound.</strong> $2000 at 20% compound interest for 3 years.
        </p>
        <div className="mt-3 rounded-2xl bg-paper p-4">
          <ol className="space-y-2">
            {[
              ["Growth factor: 1 + 0.20", "1.2"],
              ["After year 1: 2000 * 1.2", "$2400"],
              ["After year 2: 2400 * 1.2", "$2880"],
              ["After year 3: 2880 * 1.2", "$3456"],
            ].map(([a, b], i) => (
              <li key={i} className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 text-sm">
                <span className="text-ink-700">
                  <span className="mr-2 font-bold text-brand-600">{i + 1}.</span>
                  <MathText text={a} />
                </span>
                <span className="font-bold text-ink-900">
                  <MathText text={b} />
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-2 text-sm text-ink-700">
            The formula agrees in one line: <MathText text="2000 * 1.2^3 = 2000 * 1.728 = 3456" />.
            Simple interest would have paid <MathText text="3 * 400 = 1200" />, reaching only $3200
            — $256 less in just three years.
          </p>
        </div>
        <p className="mt-4 text-ink-700">
          The same multiplying shows up wherever percentages repeat, and it is why percentages never
          simply add:
        </p>
        <div className="mt-3 space-y-2">
          {[
            ["Two 10% rises", "1.1 * 1.1 = 1.21", "a 21% rise, not 20%"],
            ["Two 10% falls", "0.9 * 0.9 = 0.81", "19% lost, not 20%"],
            ["Up 10%, then down 10%", "100 → 110 → 99", "you end up worse off"],
          ].map(([a, b, c]) => (
            <div key={a} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-bold text-ink-900">{a}</span>
              <span className="text-sm font-bold text-brand-700">
                <MathText text={b} />
              </span>
              <span className="text-xs text-ink-500">{c}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-ink-700">
          That last row surprises people every time. The 10% rise was taken on $100, but the 10%
          fall was taken on $110 — a bigger number, so a bigger cut.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(7)}>Your turn</PrimaryButton>
        </div>
      </Step>

      <Step n={7} title="You try one" open={step === 7} onOpen={() => go(7)} done={false}>
        <p className="text-ink-700">
          $400 is invested at 10% <strong>compound</strong> interest. What is it worth after 2
          years, in dollars?
        </p>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          The growth factor is <MathText text="1.1" className="font-bold" />. After the first year
          the account holds <MathText text="400 * 1.1 = 440" />.
        </div>
        <TryIt
          prompt={<>2. Year two takes 10% of the 440 that is now there. What is 440 × 1.1?</>}
          accept={["484"]}
          placeholder="a number"
          value={fade}
          setValue={setFade}
          hint="10% of 440 is 44, so add 44 to 440."
          explain={
            <>
              <strong>$484</strong>. Check with the formula:{" "}
              <MathText text="400 * 1.1^2 = 400 * 1.21 = 484" /> ✓. Simple interest would have paid
              $40 twice and reached only $480 — the extra $4 is the 10% earned on the first
              year&rsquo;s $40 of interest.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Interest</div>
          <div className="mt-2">1. Simple: I = Prt — the same amount added every year</div>
          <div className="mt-1">2. Compound: A = P(1 + r)ᵗ — multiply by the growth factor</div>
          <div className="mt-1">3. Simple gives interest; compound gives the total. Read the question</div>
          <div className="mt-1">4. Repeated percentages multiply, so they never simply add</div>
        </div>
        <KeyIdea>
          💡 Ask yourself &ldquo;10% of what?&rdquo;. Of the original amount, every year, is simple
          interest. Of whatever is in there right now is compound — and over time that difference is
          worth more than the money you started with.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
