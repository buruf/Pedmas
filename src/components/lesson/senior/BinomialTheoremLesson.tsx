"use client";

import { useState } from "react";
import { MathText } from "@/components/MathText";
import { Step, KeyIdea, FormulaBox, WrongBox } from "@/components/lesson/Step";
import { LessonShell, TryIt } from "@/components/lesson/LessonShell";
import { PrimaryButton } from "@/components/ui";

/**
 * A square of side (a + b) cut into four pieces, with a = 2 and b = 3.
 * The two ab rectangles are exactly the terms that go missing when someone
 * writes (a + b)² = a² + b², so they are drawn and counted.
 */
function SquareExpansionDiagram() {
  const S = 160;
  const x0 = 34;
  const y0 = 18;
  const aPart = (S * 2) / 5;
  const bPart = S - aPart;
  return (
    <figure className="m-0">
      <svg
        viewBox="0 0 230 215"
        width="100%"
        style={{ maxWidth: 230 }}
        role="img"
        aria-label="a square of side five split into four pieces of area four, six, six and nine"
      >
        <rect x={x0} y={y0} width={aPart} height={aPart} fill="#ede9fe" stroke="#7c3aed" strokeWidth="1.4" />
        <rect x={x0 + aPart} y={y0} width={bPart} height={aPart} fill="#fee2e2" stroke="#dc2626" strokeWidth="1.4" />
        <rect x={x0} y={y0 + aPart} width={aPart} height={bPart} fill="#fee2e2" stroke="#dc2626" strokeWidth="1.4" />
        <rect x={x0 + aPart} y={y0 + aPart} width={bPart} height={bPart} fill="#ccfbf1" stroke="#0d9488" strokeWidth="1.4" />
        <text x={x0 + aPart / 2} y={y0 + aPart / 2 + 4} fontSize="12" fontWeight="700" textAnchor="middle" fill="#5b21b6">
          a² = 4
        </text>
        <text x={x0 + aPart + bPart / 2} y={y0 + aPart / 2 + 4} fontSize="12" fontWeight="700" textAnchor="middle" fill="#dc2626">
          ab = 6
        </text>
        <text x={x0 + aPart / 2} y={y0 + aPart + bPart / 2 + 4} fontSize="12" fontWeight="700" textAnchor="middle" fill="#dc2626">
          ab = 6
        </text>
        <text x={x0 + aPart + bPart / 2} y={y0 + aPart + bPart / 2 + 4} fontSize="12" fontWeight="700" textAnchor="middle" fill="#0f766e">
          b² = 9
        </text>
        <text x={x0 + aPart / 2} y={y0 - 5} fontSize="10" fontWeight="700" textAnchor="middle" fill="#6b7280">
          a = 2
        </text>
        <text x={x0 + aPart + bPart / 2} y={y0 - 5} fontSize="10" fontWeight="700" textAnchor="middle" fill="#6b7280">
          b = 3
        </text>
        <text x={x0 - 6} y={y0 + aPart / 2 + 4} fontSize="10" fontWeight="700" textAnchor="end" fill="#6b7280">
          2
        </text>
        <text x={x0 - 6} y={y0 + aPart + bPart / 2 + 4} fontSize="10" fontWeight="700" textAnchor="end" fill="#6b7280">
          3
        </text>
        <text x={x0} y={y0 + S + 20} fontSize="11" fontWeight="700" fill="#334155">
          4 + 6 + 6 + 9 = 25 = 5²
        </text>
      </svg>
    </figure>
  );
}

/** Pascal's triangle to row 5, with row 3 picked out. */
function PascalTriangle() {
  const rows = [[1], [1, 1], [1, 2, 1], [1, 3, 3, 1], [1, 4, 6, 4, 1], [1, 5, 10, 10, 5, 1]];
  const cx = 150;
  const dx = 34;
  const dy = 27;
  const y0 = 20;
  const at = (n: number, k: number): [number, number] => [cx + (k - n / 2) * dx, y0 + n * dy];
  return (
    <figure className="m-0">
      <svg
        viewBox="0 0 300 190"
        width="100%"
        style={{ maxWidth: 300 }}
        role="img"
        aria-label="Pascal's triangle to the sixth row, with the row one three three one highlighted"
      >
        {[
          [3, 0, 4, 1],
          [3, 1, 4, 1],
        ].map(([n1, k1, n2, k2], i) => {
          const [ax, ay] = at(n1, k1);
          const [bx, by] = at(n2, k2);
          return <line key={i} x1={ax} y1={ay + 4} x2={bx} y2={by - 10} stroke="#dc2626" strokeWidth="1.3" strokeDasharray="3 2" />;
        })}
        {rows.map((row, n) =>
          row.map((v, k) => {
            const [x, y] = at(n, k);
            const hot = n === 3;
            return (
              <g key={`${n}-${k}`}>
                <circle cx={x} cy={y - 4} r="12" fill={hot ? "#7c3aed" : "#f3f4f6"} />
                <text
                  x={x}
                  y={y}
                  fontSize="11"
                  fontWeight="700"
                  textAnchor="middle"
                  fill={hot ? "#ffffff" : "#374151"}
                >
                  {v}
                </text>
              </g>
            );
          })
        )}
        <text x={8} y={y0 + 3 * dy} fontSize="10" fontWeight="700" fill="#7c3aed">
          n = 3
        </text>
        <text x={196} y={y0 + 4 * dy + 2} fontSize="9" fontWeight="700" fill="#dc2626">
          1 + 3 = 4
        </text>
      </svg>
    </figure>
  );
}

/**
 * The binomial theorem.
 *
 * The misconception is the most durable error in all of algebra: distributing
 * a power over a sum, so (a + b)³ becomes a³ + b³. It is disproved twice —
 * numerically, where 125 meets 35, and geometrically, where the two missing ab
 * rectangles are visible in a square. Pascal's triangle is then introduced as
 * a count of choices rather than as a table to memorise.
 */
export function BinomialTheoremLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [guess, setGuess] = useState<string | null>(null);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 12 · Algebra · The binomial theorem"
      title="Raising a bracket to a power"
      minutes={9}
      step={step}
      total={7}
    >
      <Step n={1} title="A power over a plus sign" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          Powers spread over multiplication without any trouble:{" "}
          <MathText text="(2 * 5)^2 = 2^2 * 5^2 = 100" />, and{" "}
          <MathText text="10^2 = 100" /> ✓
        </p>
        <p className="mt-3 text-ink-700">
          So does the same trick work over a plus sign? Is{" "}
          <MathText text="(2 + 3)^2" className="font-bold text-ink-900" /> equal to{" "}
          <MathText text="2^2 + 3^2" className="font-bold text-ink-900" />?
        </p>
        <div className="mt-4 grid gap-2">
          {[
            { k: "b", label: "Yes — the power goes onto each part" },
            { k: "a", label: "No" },
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
            Both sides are small enough to just work out. Let&rsquo;s do that.
            <div className="mt-3">
              <PrimaryButton onClick={() => go(2)}>Work them out</PrimaryButton>
            </div>
          </div>
        )}
      </Step>

      <Step n={2} title="What you already know how to do" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <p className="text-ink-700">
          A power is just repeated multiplication, so <MathText text="(x + 3)^2" /> means{" "}
          <MathText text="(x + 3)(x + 3)" />. Multiply it out the long way:
        </p>
        <div className="mt-3 rounded-2xl bg-paper p-4">
          <ol className="space-y-2">
            {[
              ["x times x", "x^2"],
              ["x times 3", "3x"],
              ["3 times x", "3x"],
              ["3 times 3", "9"],
              ["Collect", "x^2 + 6x + 9"],
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
          Three terms, not two. The <MathText text="6x" /> arrived because there were{" "}
          <strong>two</strong> ways to pick one <MathText text="x" /> and one 3.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(3)}>Now try a cube</PrimaryButton>
        </div>
      </Step>

      <Step n={3} title="The new problem" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">
          Expand <MathText text="(x + 3)^3" className="font-bold text-ink-900" />.
        </p>
        <p className="mt-3 text-ink-700">
          You could multiply three brackets together by hand, and for a cube that is just about
          bearable. For <MathText text="(x + 3)^{10}" /> it is not. There has to be a pattern — and
          before we find it, we have to clear away the pattern people invent instead.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(4)}>The invented pattern</PrimaryButton>
        </div>
      </Step>

      <Step n={4} title="The mistake almost everyone makes" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <WrongBox>
          <MathText text="(a + b)^3 = a^3 + b^3" />
        </WrongBox>
        <p className="text-ink-700">
          This is the single most common error in senior algebra, and it has a cousin you have met
          already: <MathText text="(x + 3)^2 = x^2 + 9" />. Both come from spreading a power over a
          plus sign. Test them with numbers and they collapse immediately.
        </p>
        <div className="mt-3 space-y-2">
          {[
            ["(2 + 3)^2", "5^2 = 25", "but 4 + 9 = 13"],
            ["(2 + 3)^3", "5^3 = 125", "but 8 + 27 = 35"],
            ["(1 + 1)^3", "2^3 = 8", "but 1 + 1 = 2"],
          ].map(([a, b, c]) => (
            <div key={a} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-bold text-ink-900">
                <MathText text={a} />
              </span>
              <span className="text-sm font-bold text-ok-600">
                <MathText text={b} />
              </span>
              <span className="text-sm font-bold text-err-600">
                <MathText text={c} />
              </span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-ink-700">
          Not slightly out — 125 against 35. So where did the missing 90 go? Draw the square case
          and you can point at it.
        </p>
        <div className="mt-4 flex justify-center">
          <SquareExpansionDiagram />
        </div>
        <p className="mt-3 text-ink-700">
          A square of side <MathText text="a + b" /> holds four pieces. Writing{" "}
          <MathText text="a^2 + b^2" /> keeps only the two corner squares and throws away both{" "}
          <MathText text="ab" /> rectangles. Here that is <MathText text="6 + 6 = 12" /> of area —
          exactly the gap between 25 and 13.
        </p>
        <KeyIdea>
          A power never distributes over a plus sign. The cross terms are real area, and dropping
          them is not a small slip — for a cube it lost more than two thirds of the answer.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(5)}>Where the coefficients come from</PrimaryButton>
        </div>
      </Step>

      <Step n={5} title="Count the ways to choose" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">
          <MathText text="(a + b)^3" /> is <MathText text="(a + b)(a + b)(a + b)" />. To build a
          term you walk through the three brackets and take either an <MathText text="a" /> or a{" "}
          <MathText text="b" /> from each. The coefficient counts how many routes give the same
          result.
        </p>
        <div className="mt-3 space-y-2">
          {[
            ["Take b from none of them", "a^3", "1 way"],
            ["Take b from exactly one", "a^2 b", "3 ways"],
            ["Take b from exactly two", "a b^2", "3 ways"],
            ["Take b from all three", "b^3", "1 way"],
          ].map(([a, b, c]) => (
            <div key={a} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-xs text-ink-500">{a}</span>
              <span className="text-sm font-bold text-ink-900">
                <MathText text={b} />
              </span>
              <span className="text-sm font-bold text-brand-700">{c}</span>
            </div>
          ))}
        </div>
        <FormulaBox>
          <MathText text="(a + b)^3 = a^3 + 3a^2 b + 3a b^2 + b^3" />
        </FormulaBox>
        <p className="text-ink-700">
          Check it with <MathText text="a = 2" /> and <MathText text="b = 3" />:{" "}
          <MathText text="8 + 3(4)(3) + 3(2)(9) + 27 = 8 + 36 + 54 + 27 = 125" />, which is{" "}
          <MathText text="5^3" /> ✓
        </p>
        <p className="mt-3 text-ink-700">
          Those counts — 1, 3, 3, 1 — are the fourth row of Pascal&rsquo;s triangle, and every entry
          is the sum of the two above it.
        </p>
        <div className="mt-4 flex justify-center">
          <PascalTriangle />
        </div>
        <p className="mt-3 text-ink-700">
          The same numbers are written <MathText text="C(n, k)" /> — the count of ways to choose{" "}
          <MathText text="k" /> things from <MathText text="n" />. So{" "}
          <MathText text="C(3, 1) = 3" />, and reading row 5 gives{" "}
          <MathText text="C(5, 2) = 10" />.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(6)}>Worked examples</PrimaryButton>
        </div>
      </Step>

      <Step n={6} title="Three worked examples" open={step === 6} onOpen={() => go(6)} done={step > 6}>
        <p className="text-ink-700">
          <strong>1.</strong> Expand <MathText text="(x + 3)^3" className="font-bold text-ink-900" />
          .
        </p>
        <div className="mt-3 rounded-2xl bg-paper p-4">
          <ol className="space-y-2">
            {[
              ["Coefficients from row 3", "1, 3, 3, 1"],
              ["First term", "x^3"],
              ["3 * 3 * x^2", "9x^2"],
              ["3 * 3^2 * x", "27x"],
              ["3^3", "27"],
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
            <MathText text="(x + 3)^3 = x^3 + 9x^2 + 27x + 27" className="font-bold" />. Check at{" "}
            <MathText text="x = 1" />: the left side is <MathText text="4^3 = 64" /> and the right
            is <MathText text="1 + 9 + 27 + 27 = 64" /> ✓
          </p>
        </div>

        <p className="mt-4 text-ink-700">
          <strong>2.</strong> Find the coefficient of <MathText text="x^2" /> in{" "}
          <MathText text="(x + 2)^5" className="font-bold text-ink-900" /> — without expanding the
          whole thing.
        </p>
        <div className="mt-3 rounded-2xl bg-paper p-4">
          <ol className="space-y-2">
            {[
              ["Every term looks like C(5, k) x^k 2^{5 − k}", "take k = 2"],
              ["C(5, 2) from row 5", "10"],
              ["The 2 is raised to 5 − 2 = 3", "2^3 = 8"],
              ["Coefficient", "10 * 8 = 80"],
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
            The powers of <MathText text="x" /> fall while the powers of 2 rise, and the two always
            add to 5.
          </p>
        </div>

        <p className="mt-4 text-ink-700">
          <strong>3.</strong> A trap worth meeting once. Expand{" "}
          <MathText text="(2x + 1)^3" className="font-bold text-ink-900" />.
        </p>
        <p className="mt-2 text-ink-700">
          The first part is now <MathText text="2x" />, not <MathText text="x" />, so the 2 gets
          raised to the power as well: <MathText text="(2x)^3 = 8x^3" />, not{" "}
          <MathText text="2x^3" />.
        </p>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-center text-sm font-bold text-ink-900">
          <MathText text="(2x + 1)^3 = 8x^3 + 12x^2 + 6x + 1" />
        </div>
        <p className="mt-2 text-sm text-ink-700">
          Check at <MathText text="x = 1" />: <MathText text="3^3 = 27" />, and{" "}
          <MathText text="8 + 12 + 6 + 1 = 27" /> ✓
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(7)}>Your turn</PrimaryButton>
        </div>
      </Step>

      <Step n={7} title="You try one" open={step === 7} onOpen={() => go(7)} done={false}>
        <p className="text-ink-700">
          In the expansion of <MathText text="(x + 4)^3" className="font-bold text-ink-900" />, what
          is the coefficient of <MathText text="x" />?
        </p>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          Row 3 of Pascal&rsquo;s triangle is <MathText text="1, 3, 3, 1" className="font-bold" />.
          The <MathText text="x" /> term is <MathText text="3 * 4^2 * x" /> — the 4 is squared,
          because the <MathText text="x" /> power dropped from 3 to 1.
        </div>
        <TryIt
          prompt={<>2. Work out 3 × 4². What is the coefficient of x?</>}
          accept={["48"]}
          placeholder="a number"
          value={fade}
          setValue={setFade}
          hint="square the 4 first, then multiply by 3."
          explain={
            <>
              The coefficient is <strong>48</strong>. The full expansion is{" "}
              <MathText text="x^3 + 12x^2 + 48x + 64" />. Check at <MathText text="x = 1" />:{" "}
              <MathText text="5^3 = 125" />, and{" "}
              <MathText text="1 + 12 + 48 + 64 = 125" /> ✓. Anyone who wrote{" "}
              <MathText text="x^3 + 64" /> would have got 65 instead — 60 short.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Binomial expansions</div>
          <div className="mt-2">1. A power NEVER spreads over a plus sign</div>
          <div className="mt-1">2. Coefficients come from Pascal&rsquo;s triangle: 1 3 3 1, 1 4 6 4 1</div>
          <div className="mt-1">3. Powers of a fall, powers of b rise, and they always add to n</div>
          <div className="mt-1">4. One term: C(n, k) aⁿ⁻ᵏ bᵏ — and any inner coefficient is raised too</div>
        </div>
        <KeyIdea>
          💡 If you are unsure of an expansion, substitute <MathText text="x = 1" />. Both sides
          become plain numbers, and a wrong expansion almost never survives the test.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
