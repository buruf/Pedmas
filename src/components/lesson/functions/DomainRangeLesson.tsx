"use client";

import { useState } from "react";
import { MathText } from "@/components/MathText";
import { Step, KeyIdea, FormulaBox, WrongBox } from "@/components/lesson/Step";
import { LessonShell, TryIt } from "@/components/lesson/LessonShell";
import { PrimaryButton } from "@/components/ui";

/** Inputs on the left, outputs on the right, with the rule in the middle. */
function InOut({ rule, rows }: { rule: string; rows: [string, string][] }) {
  return (
    <div className="mx-auto max-w-sm rounded-2xl border-2 border-brand-200 bg-white p-3">
      <div className="grid grid-cols-3 gap-1 text-center text-xs font-bold uppercase tracking-wide">
        <span className="text-brand-600">input (x)</span>
        <span className="text-ink-500">
          <MathText text={rule} />
        </span>
        <span className="text-ok-600">output (y)</span>
      </div>
      <div className="mt-2 space-y-1.5">
        {rows.map(([a, b], i) => (
          <div key={i} className="grid grid-cols-3 items-center gap-1 rounded-xl bg-paper px-2 py-1.5 text-center">
            <span className="text-sm font-bold text-ink-900">
              <MathText text={a} />
            </span>
            <span className="text-ink-500">→</span>
            <span className="text-sm font-bold text-ink-900">
              <MathText text={b} />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** A parabola with its vertex marked, drawn from an explicit vertex form. */
function ParabolaVertex({ h, k }: { h: number; k: number }) {
  const W = 260;
  const H = 170;
  const xMin = h - 4;
  const xMax = h + 4;
  const yMin = k - 1;
  const yMax = k + 9;
  const px = (x: number) => ((x - xMin) / (xMax - xMin)) * W;
  const py = (y: number) => H - ((y - yMin) / (yMax - yMin)) * H;
  const pts: string[] = [];
  for (let i = 0; i <= 80; i++) {
    const x = xMin + ((xMax - xMin) * i) / 80;
    const y = (x - h) ** 2 + k;
    if (y <= yMax) pts.push(`${px(x).toFixed(1)},${py(y).toFixed(1)}`);
  }
  return (
    <figure className="m-0">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: W }} role="img" aria-label="parabola with its lowest point marked">
        <rect x="0" y={py(k)} width={W} height={H - py(k)} fill="#f3f4f6" />
        <line x1="0" y1={py(k)} x2={W} y2={py(k)} stroke="#dc2626" strokeWidth="1.4" strokeDasharray="4 3" />
        <polyline points={pts.join(" ")} fill="none" stroke="#7c3aed" strokeWidth="2.4" />
        <circle cx={px(h)} cy={py(k)} r="4.5" fill="#7c3aed" />
        <text x={px(h) + 8} y={py(k) - 8} fontSize="11" fontWeight="700" fill="#7c3aed">
          ({h}, {k})
        </text>
        <text x="6" y={py(k) + 16} fontSize="10" fill="#dc2626">
          no output ever lands below y = {k}
        </text>
      </svg>
    </figure>
  );
}

/**
 * Domain and range.
 *
 * Two misconceptions live here and they reinforce each other: the two words
 * get swapped, and the forbidden inputs get forgotten. Both are attacked by
 * substituting real numbers and watching what the machine does.
 */
export function DomainRangeLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 10 · Functions · Domain and Range"
      title="What is allowed in, what can come out"
      minutes={6}
      step={step}
      total={7}
    >
      <Step n={1} title="A machine that refuses" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          A ticket machine takes coins. Push in a button, a bus pass, a $20 note — nothing happens.
          Some inputs it simply will not take.
        </p>
        <p className="mt-3 text-ink-700">
          Functions are the same. Most take anything you throw at them. A few have inputs that break
          them completely.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(2)}>Which ones break?</PrimaryButton></div>
      </Step>

      <Step n={2} title="Start with one that never breaks" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <p className="text-ink-700">
          Take <MathText text="f(x) = x^2" />. Try to break it.
        </p>
        <div className="mt-4">
          <InOut
            rule="x^2"
            rows={[
              ["−3", "9"],
              ["0", "0"],
              ["1.5", "2.25"],
              ["1000", "1000000"],
            ]}
          />
        </div>
        <p className="mt-3 text-ink-700">
          Every real number goes in and something sensible comes out. Squaring only ever multiplies,
          and multiplying is always legal.
        </p>
        <KeyIdea>
          The set of inputs a function accepts is its <strong>domain</strong>. For{" "}
          <MathText text="f(x) = x^2" /> the domain is all real numbers — and that is true of every
          polynomial.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(3)}>Now break one</PrimaryButton></div>
      </Step>

      <Step n={3} title="A machine you can break" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">
          Now take <MathText text="f(x) = {6/x − 4}" className="font-bold text-ink-900" />. Feed it
          numbers and watch what happens as you creep towards 4.
        </p>
        <div className="mt-4">
          <InOut
            rule="{6/x − 4}"
            rows={[
              ["x = 5", "6"],
              ["x = 4.1", "60"],
              ["x = 4.01", "600"],
              ["x = 4", "6 ÷ 0 — nothing"],
            ]}
          />
        </div>
        <p className="mt-3 text-ink-700">
          At <MathText text="x = 4" /> the bottom is exactly 0, and{" "}
          <MathText text="6 ÷ 0" /> is not a number — not infinity, not zero, nothing. The machine
          jams.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(4)}>Two things go wrong here</PrimaryButton></div>
      </Step>

      <Step n={4} title="The two mistakes almost everyone makes" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <WrongBox>The domain is the set of <MathText text="y" />-values</WrongBox>
        <p className="text-ink-700">
          Test that reading on <MathText text="f(x) = x^2" />. If the domain were the outputs, the
          domain would be <MathText text="y ≥ 0" /> — no negatives allowed.
        </p>
        <p className="mt-3 text-ink-700">
          But you just fed it <MathText text="−3" /> and it happily returned 9. So{" "}
          <MathText text="−3" /> <em>is</em> allowed in. The domain contains negatives; the outputs
          do not. The two lists are genuinely different, so mixing them up gives a wrong answer
          straight away.
        </p>
        <div className="mt-3 rounded-xl bg-brand-50 px-4 py-3 text-sm text-ink-700">
          <strong>D</strong>omain comes before <strong>R</strong>ange in the alphabet, just as the
          input comes before the output. <strong>D</strong> for <strong>D</strong>oor you go{" "}
          <em>in</em> through.
        </div>

        <WrongBox>Domain of <MathText text="{6/x − 4}" /> = all real numbers</WrongBox>
        <p className="text-ink-700">
          This one is a slip rather than a belief — the formula looks harmless, so nobody checks the
          bottom. Lots of people write &ldquo;all reals&rdquo; and move on. But you have already
          seen <MathText text="x = 4" /> jam the machine, so all reals cannot be right.
        </p>
        <KeyIdea>
          Before you answer any domain question, hunt for the two things that break a formula:
          a <strong>bottom that can hit 0</strong>, and a <strong>square root that can go
          negative</strong>.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(5)}>The big idea</PrimaryButton></div>
      </Step>

      <Step n={5} title="Domain in, range out" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <FormulaBox>
          <div className="text-base">domain = every input allowed in</div>
          <div className="mt-1 text-base">range = every output that actually comes out</div>
        </FormulaBox>
        <p className="text-ink-700">Finding a domain is a hunt for forbidden inputs:</p>
        <div className="mt-3 space-y-2">
          {[
            ["A polynomial", "nothing forbidden", "all real numbers"],
            ["Something ÷ (x − 4)", "bottom cannot be 0", "x ≠ 4"],
            ["sqrt(x − 5)", "inside cannot be negative", "x ≥ 5"],
          ].map(([a, b, c]) => (
            <div key={a} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-semibold text-ink-900"><MathText text={a} /></span>
              <span className="text-sm text-brand-700">{b}</span>
              <span className="text-sm font-bold text-ink-700"><MathText text={c} /></span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-ink-700">
          Finding a range is a different job: you ask how high and how low the outputs can reach.
        </p>
        <div className="mt-3">
          <ParabolaVertex h={2} k={3} />
        </div>
        <p className="mt-2 text-center text-sm text-ink-700">
          <MathText text="f(x) = (x − 2)^2 + 3" />
        </p>
        <p className="mt-2 text-ink-700">
          The squared part is never negative, so the smallest it can be is 0, at{" "}
          <MathText text="x = 2" />. That makes the smallest output{" "}
          <MathText text="0 + 3 = 3" />. Range: <MathText text="y ≥ 3" />.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(6)}>Worked examples</PrimaryButton></div>
      </Step>

      <Step n={6} title="Three worked examples" open={step === 6} onOpen={() => go(6)} done={step > 6}>
        <div className="rounded-2xl bg-paper p-4">
          <p className="font-bold text-ink-900">
            Domain of <MathText text="f(x) = {6/x − 4}" />
          </p>
          <ol className="mt-2 space-y-2">
            {[
              ["Set the bottom to 0", "x − 4 = 0"],
              ["Solve it — this is the banned input", "x = 4"],
              ["Everything else is fine", "all reals, x ≠ 4"],
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
            Domain of <MathText text="f(x) = sqrt(x − 5)" />
          </p>
          <ol className="mt-2 space-y-2">
            {[
              ["Inside must not be negative", "x − 5 ≥ 0"],
              ["Add 5 to both sides", "x ≥ 5"],
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
            Check: <MathText text="x = 5" /> gives <MathText text="sqrt(0) = 0" /> ✓, and{" "}
            <MathText text="x = 4" /> gives <MathText text="sqrt(−1)" /> — not a real number ✓
          </p>
        </div>

        <div className="mt-4 rounded-2xl bg-paper p-4">
          <p className="font-bold text-ink-900">
            Range of <MathText text="f(x) = (x − 2)^2 + 3" />
          </p>
          <ol className="mt-2 space-y-2">
            {[
              ["The squared part is at least 0", "(x − 2)^2 ≥ 0"],
              ["So the output is at least 0 + 3", "f(x) ≥ 3"],
              ["It is reached at x = 2", "f(2) = 3"],
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
            Check: <MathText text="f(3) = 1 + 3 = 4" /> and <MathText text="f(0) = 4 + 3 = 7" /> —
            both above 3 ✓
          </p>
        </div>
        <div className="mt-4"><PrimaryButton onClick={() => go(7)}>Your turn</PrimaryButton></div>
      </Step>

      <Step n={7} title="You try one" open={step === 7} onOpen={() => go(7)} done={false}>
        <p className="text-ink-700">
          Find the domain of <MathText text="f(x) = sqrt(x − 9)" className="font-bold text-ink-900" />.
        </p>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          A square root refuses negatives, so you need{" "}
          <MathText text="x − 9 ≥ 0" className="font-bold" />.
        </div>
        <TryIt
          prompt={<>2. What is the smallest number you are allowed to put in?</>}
          accept={["9"]}
          placeholder="a number"
          value={fade}
          setValue={setFade}
          hint="solve x − 9 ≥ 0 — add 9 to both sides."
          explain={
            <>
              <MathText text="x ≥ 9" />, so 9 itself is the smallest allowed input and it gives{" "}
              <MathText text="sqrt(0) = 0" />. Anything below 9 puts a negative under the root.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Domain and range</div>
          <div className="mt-2">1. Domain = inputs (x). Range = outputs (y)</div>
          <div className="mt-1">2. Hunt for a bottom that hits 0 — exclude that x</div>
          <div className="mt-1">3. Hunt for a root going negative — restrict that x</div>
          <div className="mt-1">4. For a range, ask how high and how low the output can go</div>
        </div>
        <KeyIdea>
          💡 &ldquo;All real numbers&rdquo; is the right answer surprisingly often — but only after
          you have checked the bottom and the roots. Never before.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
