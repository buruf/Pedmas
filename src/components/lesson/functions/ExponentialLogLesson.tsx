"use client";

import { useState } from "react";
import { MathText } from "@/components/MathText";
import { Step, KeyIdea, FormulaBox, WrongBox } from "@/components/lesson/Step";
import { LessonShell, TryIt } from "@/components/lesson/LessonShell";
import { PrimaryButton } from "@/components/ui";

/** y = 2x against y = 2^x on the same axes, out to x = 10. */
function GrowthChart() {
  const W = 300;
  const H = 200;
  const pad = 26;
  const px = (x: number) => pad + (x / 10) * (W - pad - 8);
  const py = (y: number) => H - pad - (y / 1024) * (H - pad - 12);
  const lin: string[] = [];
  const exp: string[] = [];
  for (let i = 0; i <= 100; i++) {
    const x = (10 * i) / 100;
    lin.push(`${px(x).toFixed(1)},${py(2 * x).toFixed(1)}`);
    exp.push(`${px(x).toFixed(1)},${py(2 ** x).toFixed(1)}`);
  }
  return (
    <figure className="m-0">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: W }} role="img" aria-label="y equals 2x stays low while y equals 2 to the x escapes">
        <line x1={pad} y1={py(0)} x2={W - 6} y2={py(0)} stroke="#94a3b8" strokeWidth="1.6" />
        <line x1={pad} y1={py(0)} x2={pad} y2={8} stroke="#94a3b8" strokeWidth="1.6" />
        {[0, 256, 512, 768, 1024].map((v) => (
          <g key={v}>
            <line x1={pad} y1={py(v)} x2={W - 6} y2={py(v)} stroke="#f3f4f6" strokeWidth="1" />
            <text x={pad - 3} y={py(v) + 3} fontSize="8" textAnchor="end" fill="#6b7280">
              {v}
            </text>
          </g>
        ))}
        {[2, 4, 6, 8, 10].map((v) => (
          <text key={v} x={px(v)} y={py(0) + 12} fontSize="9" textAnchor="middle" fill="#6b7280">
            {v}
          </text>
        ))}
        <polyline points={lin.join(" ")} fill="none" stroke="#0d9488" strokeWidth="2.4" />
        <polyline points={exp.join(" ")} fill="none" stroke="#7c3aed" strokeWidth="2.4" />
        <circle cx={px(10)} cy={py(1024)} r="4" fill="#7c3aed" />
        <circle cx={px(10)} cy={py(20)} r="4" fill="#0d9488" />
        <text x={px(10) - 4} y={py(1024) - 7} fontSize="10" fontWeight="700" textAnchor="end" fill="#7c3aed">
          1024
        </text>
        <text x={px(10) - 4} y={py(20) - 7} fontSize="10" fontWeight="700" textAnchor="end" fill="#0d9488">
          20
        </text>
        <text x={pad + 6} y={16} fontSize="10" fontWeight="700" fill="#7c3aed">
          y = 2ˣ
        </text>
        <text x={pad + 6} y={30} fontSize="10" fontWeight="700" fill="#0d9488">
          y = 2x
        </text>
      </svg>
    </figure>
  );
}

/**
 * Exponential growth.
 *
 * The killer misconception is that "exponential" just means "fast linear".
 * 2x and 2^x agree at x = 1 and x = 2, which is exactly why the confusion
 * starts — so the lesson leans on that agreement, then walks the table out to
 * x = 10 where 20 meets 1024.
 */
export function ExponentialLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [guess, setGuess] = useState<string | null>(null);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 11 · Functions · Exponential Functions"
      title="Growth that gets away from you"
      minutes={6}
      step={step}
      total={7}
    >
      <Step n={1} title="Guess before you calculate" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          A single water weed covers 1 square metre of a pond. Every day the covered area doubles.
        </p>
        <p className="mt-3 text-ink-700">
          After 10 days, roughly how much is covered? Pick the closest.
        </p>
        <div className="mt-4 grid gap-2">
          {[
            { k: "a", label: "About 20 m²" },
            { k: "b", label: "About 100 m²" },
            { k: "c", label: "About 1000 m²" },
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
            Hold that answer. Let&rsquo;s count the days properly.
            <div className="mt-3"><PrimaryButton onClick={() => go(2)}>Count them</PrimaryButton></div>
          </div>
        )}
      </Step>

      <Step n={2} title="What you already know about growth" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <p className="text-ink-700">
          You have met steady growth for years. A job paying $2 an hour gives{" "}
          <MathText text="y = 2x" />: every extra hour <strong>adds</strong> the same $2.
        </p>
        <div className="mt-3 space-y-2">
          {[
            ["1 hour", "$2"],
            ["2 hours", "$4"],
            ["3 hours", "$6"],
            ["10 hours", "$20"],
          ].map(([a, b]) => (
            <div key={a} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-semibold text-ink-900">{a}</span>
              <span className="text-sm font-bold text-ink-700">{b}</span>
            </div>
          ))}
        </div>
        <KeyIdea>
          That is <strong>linear</strong>: the same amount is added each step.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(3)}>Now the pond</PrimaryButton></div>
      </Step>

      <Step n={3} title="The pond is a different animal" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">
          The weed does not <em>add</em> 1 m² a day. It <strong>multiplies by 2</strong> each day.
          That is <MathText text="y = 2^x" />.
        </p>
        <p className="mt-3 text-ink-700">
          Here is where the trouble starts — for the first two days the two rules give the same
          numbers.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="mx-auto border-collapse text-center text-sm">
            <thead>
              <tr className="text-xs font-bold uppercase tracking-wide text-ink-500">
                <th className="px-2 pb-1">day</th>
                <th className="px-2 pb-1 text-brand-600">2ˣ</th>
                <th className="px-2 pb-1">2x</th>
              </tr>
            </thead>
            <tbody>
              {[
                [1, 2, 2],
                [2, 4, 4],
                [3, 8, 6],
                [4, 16, 8],
                [5, 32, 10],
                [6, 64, 12],
                [8, 256, 16],
                [10, 1024, 20],
              ].map(([d, e, l]) => (
                <tr key={d} className={d === 1 || d === 2 ? "bg-warn-100" : ""}>
                  <td className="border border-ink-100 px-3 py-1 font-semibold text-ink-700">{d}</td>
                  <td className="border border-ink-100 px-3 py-1 font-bold text-brand-700 tabular-nums">{e}</td>
                  <td className="border border-ink-100 px-3 py-1 tabular-nums text-ink-700">{l}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-center text-lg font-bold text-ok-600">
          After 10 days: <MathText text="2^{10} = 1024" /> m²
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(4)}>Why did that feel wrong?</PrimaryButton></div>
      </Step>

      <Step n={4} title="The mistake almost everyone makes" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <WrongBox>
          <MathText text="2^{10}" /> is around 20
        </WrongBox>
        <p className="text-ink-700">
          Most people guess low — often by a factor of fifty. It is not carelessness. It is that
          those first two rows really do match, so the brain files{" "}
          <MathText text="2^x" /> next to <MathText text="2x" /> and never revisits it.
        </p>
        <p className="mt-3 text-ink-700">
          Test the &ldquo;fast linear&rdquo; reading directly. If it were adding a fixed amount,
          the gaps between rows would be constant. They are not:
        </p>
        <div className="mt-3 space-y-2">
          {[
            ["2 → 4", "gap 2"],
            ["4 → 8", "gap 4"],
            ["8 → 16", "gap 8"],
            ["512 → 1024", "gap 512"],
          ].map(([a, b]) => (
            <div key={a} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-bold text-ink-900">{a}</span>
              <span className="text-sm text-err-600">{b}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-ink-700">
          The gap is not constant — the gap itself doubles. Something whose <em>increase</em> keeps
          doubling cannot be a straight line.
        </p>
        <div className="mt-4">
          <GrowthChart />
        </div>
        <div className="mt-4"><PrimaryButton onClick={() => go(5)}>The big idea</PrimaryButton></div>
      </Step>

      <Step n={5} title="Add versus multiply" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <FormulaBox>
          <div className="text-base">linear: each step <strong>adds</strong> the same amount</div>
          <div className="mt-1 text-base">exponential: each step <strong>multiplies</strong> by the same factor</div>
        </FormulaBox>
        <p className="text-ink-700">
          The general shape is <MathText text="y = a · b^x" className="font-bold text-ink-900" />,
          where <MathText text="a" /> is the starting amount and <MathText text="b" /> is the factor
          per step.
        </p>
        <div className="mt-3 space-y-2">
          {[
            ["a", "the value at x = 0, because b^0 = 1"],
            ["b > 1", "growth — it climbs"],
            ["0 < b < 1", "decay — it shrinks towards 0"],
          ].map(([a, b]) => (
            <div key={a} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-bold text-ink-900"><MathText text={a} /></span>
              <span className="text-sm text-ink-700"><MathText text={b} /></span>
            </div>
          ))}
        </div>
        <KeyIdea>
          The exponent counts <strong>how many times you multiplied</strong>. That is the only fact
          in the topic, and everything else follows from it.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(6)}>Worked examples</PrimaryButton></div>
      </Step>

      <Step n={6} title="Forwards and backwards" open={step === 6} onOpen={() => go(6)} done={step > 6}>
        <div className="rounded-2xl bg-paper p-4">
          <p className="font-bold text-ink-900">
            A culture starts with 30 cells and doubles every hour. How many after 4 hours?
          </p>
          <ol className="mt-2 space-y-2">
            {[
              ["4 hours means 4 doublings", "2^4 = 16"],
              ["Multiply the start by that factor", "30 * 16"],
              ["", "480 cells"],
            ].map(([a, b], i) => (
              <li key={i} className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 text-sm">
                <span className="text-ink-700">
                  <span className="mr-2 font-bold text-brand-600">{i + 1}.</span>
                  <MathText text={a} />
                </span>
                <span className="font-bold text-ink-900"><MathText text={b} /></span>
              </li>
            ))}
          </ol>
          <p className="mt-2 text-sm text-ink-700">
            Check by hand: 30 → 60 → 120 → 240 → 480 ✓
          </p>
        </div>

        <div className="mt-4 rounded-2xl bg-paper p-4">
          <p className="font-bold text-ink-900">
            Backwards: solve <MathText text="3^x = 81" />.
          </p>
          <ol className="mt-2 space-y-2">
            {[
              ["Write 81 as a power of 3", "3 * 3 * 3 * 3 = 81"],
              ["So 81 is", "3^4"],
              ["Same base, so match the exponents", "x = 4"],
            ].map(([a, b], i) => (
              <li key={i} className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 text-sm">
                <span className="text-ink-700">
                  <span className="mr-2 font-bold text-brand-600">{i + 1}.</span>
                  <MathText text={a} />
                </span>
                <span className="font-bold text-ink-900"><MathText text={b} /></span>
              </li>
            ))}
          </ol>
        </div>
        <div className="mt-4"><PrimaryButton onClick={() => go(7)}>Your turn</PrimaryButton></div>
      </Step>

      <Step n={7} title="You try one" open={step === 7} onOpen={() => go(7)} done={false}>
        <p className="text-ink-700">
          Solve <MathText text="2^x = 32" className="font-bold text-ink-900" />.
        </p>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          Ask how many 2s multiply together to make 32: 2, 4, 8, 16, 32 &hellip;
        </div>
        <TryIt
          prompt={<>2. Count the multiplications. What is x?</>}
          accept={["5"]}
          placeholder="a number"
          value={fade}
          setValue={setFade}
          hint="count the numbers in the chain 2, 4, 8, 16, 32 — that is how many 2s were used."
          explain={
            <>
              <MathText text="2^5 = 32" />, so <MathText text="x = 5" />. Note it is not{" "}
              <MathText text="32 ÷ 2 = 16" /> — the exponent counts multiplications, not size.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Exponential functions</div>
          <div className="mt-2">1. Linear adds; exponential multiplies</div>
          <div className="mt-1">2. y = a · bˣ — a is the start, b is the factor per step</div>
          <div className="mt-1">3. b &gt; 1 grows, 0 &lt; b &lt; 1 decays</div>
          <div className="mt-1">4. To solve bˣ = k, rewrite k as a power of b</div>
        </div>
        <KeyIdea>
          💡 Whenever a question says <em>doubles</em>, <em>triples</em>, <em>halves</em> or{" "}
          <em>per cent per year</em>, the growth is exponential — and your first guess will almost
          certainly be far too small.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}

/**
 * Logarithms.
 *
 * Everything rests on "a log is an exponent". The lesson confronts the
 * log(a + b) = log a + log b error with a fully exact disproof in base 2:
 * log₂(8 + 8) = 4 but log₂ 8 + log₂ 8 = 6 — no decimals, no room to argue.
 */
export function LogarithmLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 11 · Functions · Logarithms"
      title="A logarithm is just an exponent"
      minutes={7}
      step={step}
      total={7}
    >
      <Step n={1} title="A question you can already answer" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          &ldquo;2 to the what makes 32?&rdquo;
        </p>
        <p className="mt-3 text-ink-700">
          You worked it out before you finished reading: 2, 4, 8, 16, 32 — five of them. The answer
          is 5.
        </p>
        <p className="mt-3 text-ink-700">
          That question is so useful it gets its own symbol.
        </p>
        <FormulaBox>
          <MathText text="log_2 32 = 5" />
        </FormulaBox>
        <div className="mt-4"><PrimaryButton onClick={() => go(2)}>That is all it is?</PrimaryButton></div>
      </Step>

      <Step n={2} title="Powers you already know" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <p className="text-ink-700">
          Every log statement is a power statement wearing different clothes.
        </p>
        <div className="mt-3 space-y-2">
          {[
            ["2^5 = 32", "log_2 32 = 5"],
            ["3^4 = 81", "log_3 81 = 4"],
            ["10^3 = 1000", "log 1000 = 3"],
            ["5^0 = 1", "log_5 1 = 0"],
          ].map(([a, b]) => (
            <div key={a} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-bold text-ink-900"><MathText text={a} /></span>
              <span className="text-sm text-ink-500">means</span>
              <span className="text-sm font-bold text-brand-700"><MathText text={b} /></span>
            </div>
          ))}
        </div>
        <KeyIdea>
          Written with no base, <MathText text="log" /> means base 10. Written as{" "}
          <MathText text="ln" />, it means base <MathText text="e" />. The idea is identical either
          way.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(3)}>The new problem</PrimaryButton></div>
      </Step>

      <Step n={3} title="Breaking a log apart" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">
          Logs earn their keep when they let you split a big expression into small ones. The
          question is which splits are legal.
        </p>
        <p className="mt-3 text-ink-700">
          Two candidates look equally plausible:
        </p>
        <div className="mt-3 grid gap-2">
          <div className="rounded-xl border-2 border-ink-100 bg-white px-4 py-3 text-center font-bold text-ink-900">
            <MathText text="log(a + b) = log a + log b" /> ?
          </div>
          <div className="rounded-xl border-2 border-ink-100 bg-white px-4 py-3 text-center font-bold text-ink-900">
            <MathText text="log(ab) = log a + log b" /> ?
          </div>
        </div>
        <p className="mt-3 text-ink-700">Only one of them is true. Numbers will decide.</p>
        <div className="mt-4"><PrimaryButton onClick={() => go(4)}>Test them</PrimaryButton></div>
      </Step>

      <Step n={4} title="The mistake almost everyone makes" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <WrongBox>
          <MathText text="log(a + b) = log a + log b" />
        </WrongBox>
        <p className="text-ink-700">
          It is the tidier-looking of the two, and the plus signs line up beautifully. Test it in
          base 2, where every number below is exact.
        </p>
        <div className="mt-3 space-y-2">
          {[
            ["Left side: log_2(8 + 8) = log_2 16", "4"],
            ["Right side: log_2 8 + log_2 8 = 3 + 3", "6"],
          ].map(([a, b]) => (
            <div key={a} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-semibold text-ink-900"><MathText text={a} /></span>
              <span className="text-sm font-bold text-err-600">{b}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-center text-lg font-bold text-err-600">
          <MathText text="4 ≠ 6" />
        </p>
        <p className="mt-3 text-ink-700">
          Not a rounding difference — a whole 2 out. That rule is dead.
        </p>
        <p className="mt-4 font-bold text-ink-900">Now the other one:</p>
        <div className="mt-2 space-y-2">
          {[
            ["Left side: log_2(4 * 8) = log_2 32", "5"],
            ["Right side: log_2 4 + log_2 8 = 2 + 3", "5"],
          ].map(([a, b]) => (
            <div key={a} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-semibold text-ink-900"><MathText text={a} /></span>
              <span className="text-sm font-bold text-ok-600">{b}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-center text-lg font-bold text-ok-600">
          <MathText text="5 = 5" /> ✓
        </p>
        <KeyIdea>
          A sum of logs matches a <strong>product</strong> inside, never a sum inside.{" "}
          <MathText text="log(a + b)" /> does not break apart at all — leave it alone.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(5)}>Why a product?</PrimaryButton></div>
      </Step>

      <Step n={5} title="Why the product law has to be true" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">
          Remember what a log <em>is</em>: an exponent. And you already know what happens to
          exponents when you multiply powers.
        </p>
        <FormulaBox>
          <MathText text="2^2 * 2^3 = 2^5" />
        </FormulaBox>
        <p className="text-ink-700">
          Multiplying the numbers <strong>added</strong> the exponents. Logs <em>are</em> those
          exponents, so a log of a product must be a sum of logs. It is the same fact, read from the
          other side.
        </p>
        <div className="mt-4 rounded-2xl bg-ink-900 px-4 py-4 text-center text-white">
          <div className="text-sm font-semibold text-brand-200">The three laws</div>
          <div className="mt-2 font-bold"><MathText text="log(ab) = log a + log b" /></div>
          <div className="mt-1 font-bold"><MathText text="log({a/b}) = log a − log b" /></div>
          <div className="mt-1 font-bold"><MathText text="log(a^n) = n log a" /></div>
        </div>
        <p className="mt-3 text-ink-700">
          The third one is the first one used repeatedly:{" "}
          <MathText text="log(a^3) = log(a · a · a) = log a + log a + log a = 3 log a" />.
        </p>
        <KeyIdea>
          Notice the pattern: the operation inside always drops one level.
          Multiply → add. Divide → subtract. Power → multiply. Adding is already the bottom level,
          so there is nowhere for it to drop to. That is why{" "}
          <MathText text="log(a + b)" /> has no law.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(6)}>Worked examples</PrimaryButton></div>
      </Step>

      <Step n={6} title="Two worked examples" open={step === 6} onOpen={() => go(6)} done={step > 6}>
        <div className="rounded-2xl bg-paper p-4">
          <p className="font-bold text-ink-900">Evaluate <MathText text="log_2 32" /></p>
          <ol className="mt-2 space-y-2">
            {[
              ["Ask: 2 to what power gives 32?", "2^5 = 32"],
              ["So the answer is the exponent", "5"],
            ].map(([a, b], i) => (
              <li key={i} className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 text-sm">
                <span className="text-ink-700">
                  <span className="mr-2 font-bold text-brand-600">{i + 1}.</span>
                  <MathText text={a} />
                </span>
                <span className="font-bold text-ink-900"><MathText text={b} /></span>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-4 rounded-2xl bg-paper p-4">
          <p className="font-bold text-ink-900">
            Evaluate <MathText text="log_3 9 + log_3 27" />
          </p>
          <ol className="mt-2 space-y-2">
            {[
              ["9 = 3^2, so log_3 9 =", "2"],
              ["27 = 3^3, so log_3 27 =", "3"],
              ["Add them", "5"],
            ].map(([a, b], i) => (
              <li key={i} className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 text-sm">
                <span className="text-ink-700">
                  <span className="mr-2 font-bold text-brand-600">{i + 1}.</span>
                  <MathText text={a} />
                </span>
                <span className="font-bold text-ink-900"><MathText text={b} /></span>
              </li>
            ))}
          </ol>
          <p className="mt-2 text-sm text-ink-700">
            Check with the product law: <MathText text="9 * 27 = 243" />, and{" "}
            <MathText text="3^5 = 243" />, so <MathText text="log_3 243 = 5" /> ✓ — the two routes
            agree.
          </p>
        </div>
        <div className="mt-4"><PrimaryButton onClick={() => go(7)}>Your turn</PrimaryButton></div>
      </Step>

      <Step n={7} title="You try one" open={step === 7} onOpen={() => go(7)} done={false}>
        <p className="text-ink-700">
          Evaluate <MathText text="log_5 25 + log_5 5" className="font-bold text-ink-900" />.
        </p>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          <MathText text="25 = 5^2" />, so <MathText text="log_5 25 = 2" />. And{" "}
          <MathText text="5 = 5^1" />, so <MathText text="log_5 5 = 1" />.
        </div>
        <TryIt
          prompt={<>2. Add them. What is the total?</>}
          accept={["3"]}
          placeholder="a number"
          value={fade}
          setValue={setFade}
          hint="you have 2 and 1 — the logs are the exponents, so just add those."
          explain={
            <>
              <MathText text="2 + 1 = 3" />. Check with the product law:{" "}
              <MathText text="25 * 5 = 125" /> and <MathText text="5^3 = 125" />, so{" "}
              <MathText text="log_5 125 = 3" /> ✓
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Logarithms</div>
          <div className="mt-2">
            1. <MathText text="log_b x" /> asks &ldquo;b to what power gives x?&rdquo;
          </div>
          <div className="mt-1">2. log(ab) = log a + log b</div>
          <div className="mt-1">3. log(a/b) = log a − log b</div>
          <div className="mt-1">4. log(aⁿ) = n log a</div>
          <div className="mt-1">5. log(a + b) breaks no further — ever</div>
        </div>
        <KeyIdea>
          💡 If you ever forget which law is which, test it on powers of 2 — say{" "}
          <MathText text="log_2 4 = 2" /> and <MathText text="log_2 8 = 3" />. Those values are
          exact, so a wrong rule has nowhere to hide.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
