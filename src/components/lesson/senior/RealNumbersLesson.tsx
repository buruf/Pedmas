"use client";

import { useState } from "react";
import { MathText } from "@/components/MathText";
import { Step, KeyIdea, FormulaBox, WrongBox } from "@/components/lesson/Step";
import { LessonShell, TryIt } from "@/components/lesson/LessonShell";
import { PrimaryButton } from "@/components/ui";

/** The unit square whose diagonal broke the Pythagoreans' world view. */
function UnitSquareDiagonal() {
  const VW = 210;
  const VH = 160;
  const x0 = 40;
  const y0 = 130;
  const s = 92;
  return (
    <figure className="m-0">
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        width="100%"
        style={{ maxWidth: VW }}
        role="img"
        aria-label="a square of side one with its diagonal marked as the square root of two"
      >
        <rect x={x0} y={y0 - s} width={s} height={s} fill="#7c3aed" opacity="0.07" stroke="#334155" strokeWidth="2" />
        <line x1={x0} y1={y0} x2={x0 + s} y2={y0 - s} stroke="#dc2626" strokeWidth="2.6" />
        <rect x={x0} y={y0 - 12} width="12" height="12" fill="none" stroke="#94a3b8" strokeWidth="1.2" />
        <text x={x0 + s / 2} y={y0 + 15} fontSize="11" fontWeight="700" textAnchor="middle" fill="#334155">
          1
        </text>
        <text x={x0 + s + 8} y={y0 - s / 2} fontSize="11" fontWeight="700" fill="#334155">
          1
        </text>
        <text x={x0 + 6} y={y0 - s / 2 - 8} fontSize="11" fontWeight="700" fill="#dc2626">
          √2
        </text>
        <text x={10} y={16} fontSize="10" fontWeight="700" fill="#6b7280">
          1² + 1² = 2, so the diagonal is √2
        </text>
      </svg>
    </figure>
  );
}

/** The number sets, drawn as the nested boxes they actually are. */
function NumberSetsDiagram() {
  return (
    <figure className="m-0">
      <svg
        viewBox="0 0 300 215"
        width="100%"
        style={{ maxWidth: 300 }}
        role="img"
        aria-label="nested boxes showing whole numbers inside integers inside rationals, with the irrationals beside them inside the reals"
      >
        <rect x="6" y="6" width="288" height="203" rx="10" fill="#f8fafc" stroke="#334155" strokeWidth="1.6" />
        <text x="14" y="21" fontSize="11" fontWeight="800" fill="#334155">
          Real numbers
        </text>

        <rect x="14" y="30" width="180" height="172" rx="9" fill="#ede9fe" stroke="#7c3aed" strokeWidth="1.4" />
        <text x="22" y="45" fontSize="10" fontWeight="800" fill="#7c3aed">
          Rational — a fraction of integers
        </text>
        <text x="22" y="60" fontSize="10" fontWeight="700" fill="#6b7280">
          0.25 &nbsp; {"{5/11}"} &nbsp; 0.333…
        </text>

        <rect x="24" y="68" width="160" height="126" rx="8" fill="#ccfbf1" stroke="#0d9488" strokeWidth="1.4" />
        <text x="32" y="82" fontSize="10" fontWeight="800" fill="#0d9488">
          Integers
        </text>
        <text x="32" y="96" fontSize="10" fontWeight="700" fill="#6b7280">
          −7 &nbsp; −1
        </text>

        <rect x="34" y="104" width="140" height="82" rx="7" fill="#fef3c7" stroke="#d97706" strokeWidth="1.4" />
        <text x="42" y="119" fontSize="10" fontWeight="800" fill="#b45309">
          Whole numbers
        </text>
        <text x="42" y="136" fontSize="11" fontWeight="700" fill="#334155">
          0 &nbsp; 1 &nbsp; 2 &nbsp; 4 &nbsp; 17
        </text>
        <text x="42" y="156" fontSize="9" fill="#6b7280">
          √16 lives here — it is 4
        </text>

        <rect x="202" y="30" width="86" height="172" rx="9" fill="#fee2e2" stroke="#dc2626" strokeWidth="1.4" />
        <text x="210" y="45" fontSize="10" fontWeight="800" fill="#dc2626">
          Irrational
        </text>
        <text x="210" y="66" fontSize="12" fontWeight="700" fill="#334155">
          √2
        </text>
        <text x="210" y="88" fontSize="12" fontWeight="700" fill="#334155">
          √20
        </text>
        <text x="210" y="110" fontSize="12" fontWeight="700" fill="#334155">
          π
        </text>
        <text x="210" y="134" fontSize="9" fill="#6b7280">
          never ends,
        </text>
        <text x="210" y="146" fontSize="9" fill="#6b7280">
          never repeats
        </text>
      </svg>
    </figure>
  );
}

/**
 * The real numbers.
 *
 * Two beliefs are confronted. The first is the ancient one — that every number
 * is a ratio of whole numbers — which is disproved properly, by contradiction,
 * because at this level a student can follow the argument and it is the only
 * honest reason √2 is irrational. The second is the modern classroom one, that
 * a decimal running on forever must be irrational, which 0.333… settles.
 */
export function RealNumbersLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [guess, setGuess] = useState<string | null>(null);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 8–9 · Number · Rational and irrational"
      title="The numbers that are not fractions"
      minutes={8}
      step={step}
      total={7}
    >
      <Step n={1} title="A square that caused a crisis" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          The Pythagoreans believed every number in the universe was a ratio of whole numbers. Then
          somebody drew a square with sides of 1 and measured the diagonal.
        </p>
        <div className="mt-4 flex justify-center">
          <UnitSquareDiagonal />
        </div>
        <p className="mt-3 text-ink-700">
          The diagonal is <MathText text="sqrt(2)" />. It is a perfectly ordinary length you can
          draw with a ruler — and it turned out to be impossible to write as a fraction. This lesson
          is about why, and about the sorting system that came out of it.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(2)}>What fractions do</PrimaryButton>
        </div>
      </Step>

      <Step n={2} title="Every fraction does one of two things" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <p className="text-ink-700">
          Turn any fraction into a decimal by dividing. Exactly two things can happen.
        </p>
        <div className="mt-3 space-y-2">
          {[
            ["{1/4}", "0.25", "stops"],
            ["{3/8}", "0.375", "stops"],
            ["{1/3}", "0.333333…", "repeats: 3"],
            ["{1/7}", "0.142857142857…", "repeats: 142857"],
          ].map(([a, b, c]) => (
            <div key={a} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-bold text-ink-900">
                <MathText text={a} />
              </span>
              <span className="text-sm font-bold text-brand-700">{b}</span>
              <span className="text-xs text-ink-500">{c}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-ink-700">
          It either <strong>stops</strong> or it <strong>repeats a block forever</strong>. There is
          no third option, because long division has only so many possible remainders — sooner or
          later one comes back round and the pattern starts again.
        </p>
        <KeyIdea>
          A number you can write as <MathText text="{a/b}" /> with <MathText text="a" /> and{" "}
          <MathText text="b" /> whole numbers is called <strong>rational</strong> — from{" "}
          <em>ratio</em>, not from being sensible.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(3)}>Now test √2</PrimaryButton>
        </div>
      </Step>

      <Step n={3} title="Hunting for the fraction that equals √2" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">
          <MathText text="sqrt(2)" /> is the number that squares to exactly 2. Square some
          candidates and see how close you can get.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="mx-auto border-collapse text-center text-sm">
            <thead>
              <tr className="text-xs font-bold uppercase tracking-wide text-ink-500">
                <th className="px-2 pb-1">x</th>
                <th className="px-2 pb-1 text-brand-600">x²</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["1.4", "1.96"],
                ["1.41", "1.9881"],
                ["1.414", "1.999396"],
                ["1.4142", "1.99996164"],
              ].map(([a, b]) => (
                <tr key={a}>
                  <td className="border border-ink-100 px-4 py-1 font-semibold tabular-nums text-ink-700">{a}</td>
                  <td className="border border-ink-100 px-4 py-1 font-bold tabular-nums text-brand-700">{b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-ink-700">
          Closer and closer, never exact. Does that mean the right fraction is simply hard to find?
        </p>
        <div className="mt-4 grid gap-2">
          {[
            { k: "b", label: "Yes — some fraction must work, we just have not found it" },
            { k: "a", label: "No — no fraction can ever work" },
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
            This one can be settled for certain — not by searching, but by proof.
            <div className="mt-3">
              <PrimaryButton onClick={() => go(4)}>Prove it</PrimaryButton>
            </div>
          </div>
        )}
      </Step>

      <Step n={4} title="The two mistakes almost everyone makes" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <WrongBox>Every number can be written as a fraction</WrongBox>
        <p className="text-ink-700">
          Suppose <MathText text="sqrt(2) = {a/b}" />, already cancelled down so that{" "}
          <MathText text="a" /> and <MathText text="b" /> share no common factor. Follow it
          through.
        </p>
        <div className="mt-3 rounded-2xl bg-paper p-4">
          <ol className="space-y-2">
            {[
              ["Square both sides", "2 = {a^2/b^2}"],
              ["Multiply up", "a^2 = 2b^2"],
              ["So a^2 is even, which forces a to be even", "a = 2k"],
              ["Substitute: (2k)^2 = 2b^2 gives 4k^2 = 2b^2", "b^2 = 2k^2"],
              ["So b^2 is even, which forces b to be even too", "a and b share the factor 2"],
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
        <p className="mt-3 text-ink-700">
          But we started by cancelling the fraction down, so <MathText text="a" /> and{" "}
          <MathText text="b" /> could not share a factor. The assumption has contradicted itself, so
          the assumption was false: <strong>no such fraction exists</strong>. Not hard to find —{" "}
          <em>impossible</em>.
        </p>
        <p className="mt-3 text-ink-700">
          A number that is not a ratio of integers is called <strong>irrational</strong>. It is not
          a rare curiosity either: <MathText text="sqrt(3)" />, <MathText text="sqrt(20)" /> and{" "}
          <MathText text="π" /> are all irrational. Any square root that is not a perfect square is
          irrational.
        </p>

        <WrongBox>
          A decimal that goes on forever must be irrational
        </WrongBox>
        <p className="text-ink-700">
          This is the more common error, and <MathText text="0.333333…" /> destroys it. Watch:
        </p>
        <div className="mt-3 rounded-2xl bg-paper p-4">
          <ol className="space-y-2">
            {[
              ["Let x be the number", "x = 0.3333…"],
              ["Multiply by 10", "10x = 3.3333…"],
              ["Subtract — the tails cancel exactly", "9x = 3"],
              ["Solve", "x = {3/9} = {1/3}"],
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
        <p className="mt-3 text-ink-700">
          So <MathText text="0.3333…" /> runs on forever and is <em>exactly</em>{" "}
          <MathText text="{1/3}" /> — completely rational. Going on forever is not the test.
        </p>
        <KeyIdea>
          Irrational means the decimal never ends <strong>and</strong> never settles into a
          repeating block. Two conditions, not one.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(5)}>How the sets fit together</PrimaryButton>
        </div>
      </Step>

      <Step n={5} title="The sets nest inside each other" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <div className="flex justify-center">
          <NumberSetsDiagram />
        </div>
        <p className="mt-3 text-ink-700">
          Each box sits inside the next, and the nesting answers the true-or-false questions on its
          own:
        </p>
        <div className="mt-3 space-y-2">
          {[
            ["Every integer is rational", "True", "−7 = {−7/1}"],
            ["Every rational is an integer", "False", "{1/2} is not"],
            ["Every whole number is an integer", "True", "the box is inside"],
            ["Every integer is a whole number", "False", "−3 is not"],
          ].map(([a, b, c]) => (
            <div key={a} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-semibold text-ink-900">{a}</span>
              <span className={`text-sm font-bold ${b === "True" ? "text-ok-600" : "text-err-600"}`}>{b}</span>
              <span className="text-xs text-ink-500">
                <MathText text={c} />
              </span>
            </div>
          ))}
        </div>
        <FormulaBox>
          <div className="text-base">whole ⊂ integer ⊂ rational ⊂ real</div>
        </FormulaBox>
        <p className="text-ink-700">
          The irrationals fill the rest of the real line. Together the two groups leave no gaps —
          which is exactly what &ldquo;real number&rdquo; means.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(6)}>Worked example</PrimaryButton>
        </div>
      </Step>

      <Step n={6} title="Sort these six" open={step === 6} onOpen={() => go(6)} done={step > 6}>
        <div className="space-y-2">
          {[
            ["sqrt(16)", "Rational — it is exactly 4, a whole number"],
            ["sqrt(20)", "Irrational — 20 is not a perfect square"],
            ["0.25", "Rational — it stops, and equals {1/4}"],
            ["−7", "Rational integer — it is {−7/1}, but not a whole number"],
            ["{22/7}", "Rational — 3.142857142857…, a repeating block"],
            ["π", "Irrational — 3.14159265358979…, no repeating block ever"],
          ].map(([a, b]) => (
            <div key={a} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-bold text-ink-900">
                <MathText text={a} />
              </span>
              <span className="text-xs text-ink-700">
                <MathText text={b} />
              </span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-ink-700">
          The last two deserve a closer look, because a lot of people believe{" "}
          <MathText text="{22/7}" /> <em>is</em> <MathText text="π" />. Line them up:
        </p>
        <div className="mt-3 rounded-2xl bg-paper p-4 text-center">
          <div className="font-bold text-ink-900">
            <MathText text="{22/7} = 3.142857…" />
          </div>
          <div className="mt-1 font-bold text-ink-900">
            <MathText text="π = 3.141592…" />
          </div>
          <div className="mt-2 text-sm text-ink-700">They part company at the third decimal place.</div>
        </div>
        <p className="mt-3 text-ink-700">
          <MathText text="{22/7}" /> is a handy approximation, and being a fraction it is rational
          by definition. <MathText text="π" /> is not a fraction at all — no fraction anywhere
          equals it.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(7)}>Your turn</PrimaryButton>
        </div>
      </Step>

      <Step n={7} title="You try one" open={step === 7} onOpen={() => go(7)} done={false}>
        <p className="text-ink-700">
          <MathText text="0.454545…" className="font-bold text-ink-900" /> runs on forever. Prove it
          is rational by writing it as a fraction in lowest terms.
        </p>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          The repeating block is two digits long, so multiply by 100:{" "}
          <MathText text="100x = 45.454545…" className="font-bold" />. Subtracting{" "}
          <MathText text="x = 0.454545…" /> cancels the tail and leaves{" "}
          <MathText text="99x = 45" />.
        </div>
        <TryIt
          prompt={<>2. So x = 45/99. Cancel it down — type the fraction in lowest terms.</>}
          accept={["5/11", "11"]}
          placeholder="like 3/4"
          value={fade}
          setValue={setFade}
          hint="45 and 99 share a factor of 9."
          explain={
            <>
              <MathText text="{45/99} = {5/11}" />. Divide it out and you get{" "}
              <MathText text="0.454545…" /> right back ✓. A never-ending decimal, and yet a plain
              ratio of two integers — so it was rational the whole time. Compare{" "}
              <MathText text="sqrt(2) = 1.41421356…" />, where no block ever repeats and no fraction
              exists.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Rational and irrational</div>
          <div className="mt-2">1. Rational = can be written as a fraction of integers</div>
          <div className="mt-1">2. Its decimal either stops or repeats a block — forever is fine</div>
          <div className="mt-1">3. Irrational = never ends AND never repeats: √2, √20, π</div>
          <div className="mt-1">4. A square root is rational only if it is a perfect square</div>
        </div>
        <KeyIdea>
          💡 &ldquo;Goes on forever&rdquo; is not the test. Ask whether it <em>repeats</em>. 0.333…
          repeats, so it is 1/3. π never does, so it is nothing but itself.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
