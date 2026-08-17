"use client";

import { useState } from "react";
import { MathText } from "@/components/MathText";
import { Step, KeyIdea, FormulaBox, WrongBox } from "@/components/lesson/Step";
import { LessonShell, TryIt } from "@/components/lesson/LessonShell";
import { PrimaryButton } from "@/components/ui";

/**
 * A stack of parabolas y = x² + C with the tangent at x = 1 drawn on each.
 * The tangents are parallel — which is the whole reason + C exists.
 */
function CurveFamily() {
  const W = 280;
  const H = 200;
  const xMin = -2.2;
  const xMax = 2.2;
  const yMin = -4;
  const yMax = 9;
  const px = (x: number) => ((x - xMin) / (xMax - xMin)) * W;
  const py = (y: number) => H - ((y - yMin) / (yMax - yMin)) * H;
  const shifts = [
    { c: 3, colour: "#7c3aed", label: "x² + 3" },
    { c: 0, colour: "#0d9488", label: "x²" },
    { c: -3, colour: "#d97706", label: "x² − 3" },
  ];
  const path = (c: number) => {
    const pts: string[] = [];
    for (let i = 0; i <= 100; i++) {
      const x = xMin + ((xMax - xMin) * i) / 100;
      const y = x * x + c;
      if (y >= yMin && y <= yMax) pts.push(`${px(x).toFixed(1)},${py(y).toFixed(1)}`);
    }
    return pts.join(" ");
  };
  return (
    <figure className="m-0">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: W }} role="img" aria-label="three parabolas stacked at different heights with parallel tangent lines">
        <line x1={0} y1={py(0)} x2={W} y2={py(0)} stroke="#94a3b8" strokeWidth="1.3" />
        <line x1={px(0)} y1={0} x2={px(0)} y2={H} stroke="#94a3b8" strokeWidth="1.3" />
        {shifts.map((s) => {
          // tangent at x = 1 has slope 2 for every member of the family
          const y1 = 1 + s.c;
          return (
            <g key={s.c}>
              <polyline points={path(s.c)} fill="none" stroke={s.colour} strokeWidth="2.4" />
              <line
                x1={px(0.1)}
                y1={py(y1 - 1.8)}
                x2={px(1.9)}
                y2={py(y1 + 1.8)}
                stroke={s.colour}
                strokeWidth="1.3"
                strokeDasharray="4 3"
              />
              <circle cx={px(1)} cy={py(y1)} r="3.5" fill={s.colour} />
            </g>
          );
        })}
        {shifts.map((s, i) => (
          <text key={s.label} x={6} y={14 + i * 13} fontSize="10" fontWeight="700" fill={s.colour}>
            y = {s.label}
          </text>
        ))}
        <text x={W - 6} y={H - 6} fontSize="10" fontWeight="700" textAnchor="end" fill="#374151">
          every tangent has slope 2
        </text>
      </svg>
    </figure>
  );
}

/** The area under y = 2x from 0 to 3 — a triangle you can check by hand. */
function AreaUnderLine() {
  const W = 260;
  const H = 190;
  const xMin = -0.4;
  const xMax = 4;
  const yMin = -0.8;
  const yMax = 8.5;
  const px = (x: number) => ((x - xMin) / (xMax - xMin)) * W;
  const py = (y: number) => H - ((y - yMin) / (yMax - yMin)) * H;
  return (
    <figure className="m-0">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: W }} role="img" aria-label="the triangular area under the line y equals 2x from 0 to 3">
        <polygon points={`${px(0)},${py(0)} ${px(3)},${py(0)} ${px(3)},${py(6)}`} fill="#ede9fe" />
        <line x1={0} y1={py(0)} x2={W} y2={py(0)} stroke="#94a3b8" strokeWidth="1.3" />
        <line x1={px(0)} y1={0} x2={px(0)} y2={H} stroke="#94a3b8" strokeWidth="1.3" />
        <line x1={px(0)} y1={py(0)} x2={px(4)} y2={py(8)} stroke="#7c3aed" strokeWidth="2.6" />
        <line x1={px(3)} y1={py(0)} x2={px(3)} y2={py(6)} stroke="#7c3aed" strokeWidth="1.6" strokeDasharray="4 3" />
        <text x={px(1.4)} y={py(1.6)} fontSize="12" fontWeight="700" textAnchor="middle" fill="#5b21b6">
          area = 9
        </text>
        <text x={px(3)} y={py(0) + 13} fontSize="10" textAnchor="middle" fill="#6b7280">
          3
        </text>
        <text x={px(3) + 6} y={py(6) + 4} fontSize="10" fill="#6b7280">
          6
        </text>
        <text x={px(3.4)} y={py(7.6)} fontSize="10" fontWeight="700" fill="#7c3aed">
          y = 2x
        </text>
      </svg>
    </figure>
  );
}

/**
 * Integration.
 *
 * Built as the reverse of differentiation, which makes + C inevitable rather
 * than a rule to remember: three different functions all differentiate to the
 * same thing, so an antiderivative cannot be a single answer. The definite
 * integral then explains why the C is allowed to disappear.
 */
export function IntegralLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 12 · Calculus · Integration"
      title="Differentiation run backwards"
      minutes={8}
      step={step}
      total={7}
    >
      <Step n={1} title="You know the speed. How far?" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          A car&rsquo;s speedometer is recorded for a whole journey. Nobody wrote down the distance.
          Can you recover it?
        </p>
        <p className="mt-3 text-ink-700">
          Speed is the <em>rate</em> at which distance changes — the derivative of distance. So the
          question is: given a derivative, find the function it came from.
        </p>
        <p className="mt-3 text-ink-700">That is integration.</p>
        <div className="mt-4"><PrimaryButton onClick={() => go(2)}>Try a small one</PrimaryButton></div>
      </Step>

      <Step n={2} title="Read the derivative table backwards" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <p className="text-ink-700">
          You already know a pile of derivatives. Reverse each arrow and you have your first
          integrals.
        </p>
        <div className="mt-3 space-y-2">
          {[
            ["x^2", "2x"],
            ["x^3", "3x^2"],
            ["x^4", "4x^3"],
            ["5x", "5"],
          ].map(([a, b]) => (
            <div key={a} className="flex flex-wrap items-center justify-center gap-3 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-bold text-ink-900"><MathText text={a} /></span>
              <span className="text-xs font-semibold text-ink-500">— differentiate →</span>
              <span className="text-sm font-bold text-brand-700"><MathText text={b} /></span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-ink-700">
          So if someone hands you <MathText text="3x^2" /> and asks where it came from, you can
          answer immediately: <MathText text="x^3" />.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(3)}>The new problem</PrimaryButton></div>
      </Step>

      <Step n={3} title="A question with too many answers" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">
          Which function has derivative <MathText text="2x" className="font-bold text-ink-900" />?
        </p>
        <p className="mt-3 text-ink-700">
          <MathText text="x^2" />, obviously. But check a couple of others.
        </p>
        <div className="mt-3 space-y-2">
          {[
            ["x^2", "2x ✓"],
            ["x^2 + 3", "2x ✓"],
            ["x^2 − 3", "2x ✓"],
            ["x^2 + 1000", "2x ✓"],
          ].map(([a, b]) => (
            <div key={a} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-bold text-ink-900"><MathText text={a} /></span>
              <span className="text-sm font-bold text-ok-600"><MathText text={b} /></span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-ink-700">
          Every one of them works. The constant differentiates to 0, so it leaves no trace.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(4)}>So which is the answer?</PrimaryButton></div>
      </Step>

      <Step n={4} title="The mistake almost everyone makes" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <WrongBox>
          <MathText text="∫ 2x dx = x^2" />
        </WrongBox>
        <p className="text-ink-700">
          It is not that this is <em>wrong</em> — it is that it is only one of infinitely many, and
          writing it alone claims the others do not exist. You have just proved they do.
        </p>
        <div className="mt-3">
          <CurveFamily />
        </div>
        <p className="mt-3 text-ink-700">
          Look at the picture. The three curves are the same shape at three different heights, so at
          any given <MathText text="x" /> their tangents are <strong>parallel</strong> — identical
          slope, identical derivative. Differentiating throws the height away, and nothing can bring
          it back.
        </p>
        <p className="mt-3 text-ink-700">
          So the honest answer is not a function. It is a whole family of them.
        </p>
        <FormulaBox>
          <MathText text="∫ 2x dx = x^2 + C" />
        </FormulaBox>
        <KeyIdea>
          The <MathText text="+ C" /> is not decoration and it is not a rule to remember. It is the
          information that differentiating destroyed. Leaving it out says something false.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(5)}>The rule</PrimaryButton></div>
      </Step>

      <Step n={5} title="Undo the power rule" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">
          Differentiating drops the power by one and multiplies by the old power. Reverse both
          moves: <strong>raise the power by one, then divide by the new power</strong>.
        </p>
        <FormulaBox>
          <MathText text="∫ x^n dx = {x^{n + 1}/n + 1} + C" />
        </FormulaBox>
        <p className="text-ink-700">
          Test it on something you can check. Take <MathText text="n = 2" />:
        </p>
        <div className="mt-3 space-y-2">
          {[
            ["Raise the power", "x^3"],
            ["Divide by the new power", "{x^3/3}"],
            ["Differentiate it back", "{3x^2/3} = x^2 ✓"],
          ].map(([a, b], i) => (
            <div key={i} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-semibold text-ink-900"><MathText text={a} /></span>
              <span className="text-sm font-bold text-ink-700"><MathText text={b} /></span>
            </div>
          ))}
        </div>
        <KeyIdea>
          Every integral can be checked, for free, by differentiating your answer. If it does not
          land back on what you started with, something slipped. Use it every single time.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(6)}>Worked examples</PrimaryButton></div>
      </Step>

      <Step n={6} title="An indefinite one, then a definite one" open={step === 6} onOpen={() => go(6)} done={step > 6}>
        <div className="rounded-2xl bg-paper p-4">
          <p className="font-bold text-ink-900">
            Find <MathText text="∫ (6x^2 + 4x) dx" />
          </p>
          <ol className="mt-2 space-y-2">
            {[
              ["6x^2: raise to x^3, divide by 3, keep the 6", "2x^3"],
              ["4x: raise to x^2, divide by 2, keep the 4", "2x^2"],
              ["Add the constant that was destroyed", "2x^3 + 2x^2 + C"],
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
            Check by differentiating: <MathText text="2x^3 → 6x^2" /> and{" "}
            <MathText text="2x^2 → 4x" />, and the <MathText text="C" /> vanishes ✓
          </p>
        </div>

        <p className="mt-4 text-ink-700">
          Put numbers on the integral sign and it stops being a family and becomes a single number —
          the <strong>area</strong> under the curve between those two inputs.
        </p>
        <div className="mt-3 rounded-2xl bg-paper p-4">
          <p className="font-bold text-ink-900">
            Find <MathText text="∫ 2x dx from 0 to 3" />
          </p>
          <ol className="mt-2 space-y-2">
            {[
              ["Antiderivative", "x^2 + C"],
              ["Value at the top limit", "3^2 + C = 9 + C"],
              ["Value at the bottom limit", "0^2 + C = C"],
              ["Subtract — the C cancels", "9"],
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
        <p className="mt-3 text-ink-700">
          That subtraction is why a definite integral never carries a{" "}
          <MathText text="+ C" />: whatever it was, it appears twice and cancels itself. Not a
          special case — a consequence.
        </p>
        <div className="mt-3">
          <AreaUnderLine />
        </div>
        <p className="mt-2 text-ink-700">
          And this one you can check with primary-school geometry. The region is a triangle of base
          3 and height 6, so its area is{" "}
          <MathText text="{1/2} * 3 * 6 = 9" /> ✓ — exactly what the integral said.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(7)}>Your turn</PrimaryButton></div>
      </Step>

      <Step n={7} title="You try one" open={step === 7} onOpen={() => go(7)} done={false}>
        <p className="text-ink-700">
          Find <MathText text="∫ 3x^2 dx from 0 to 4" className="font-bold text-ink-900" />.
        </p>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          Raise the power and divide: <MathText text="{3x^3/3} = x^3" className="font-bold" />. (Check:{" "}
          <MathText text="x^3" /> differentiates to <MathText text="3x^2" /> ✓.) Now evaluate it at 4
          and at 0.
        </div>
        <TryIt
          prompt={<>2. Work out 4³ − 0³. What is the integral?</>}
          accept={["64"]}
          placeholder="a number"
          value={fade}
          setValue={setFade}
          hint="4 × 4 × 4, and then take away 0."
          explain={
            <>
              <MathText text="4^3 − 0^3 = 64 − 0 = 64" />. Because this one has limits, no{" "}
              <MathText text="+ C" /> is needed — it would have cancelled. Written without limits the
              answer would have had to be <MathText text="x^3 + C" />.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Integration</div>
          <div className="mt-2">1. Integration undoes differentiation</div>
          <div className="mt-1">2. Raise the power by 1, divide by the new power</div>
          <div className="mt-1">3. No limits? Add + C — it is real information</div>
          <div className="mt-1">4. With limits: top value − bottom value, and the C cancels</div>
          <div className="mt-1">5. Check by differentiating your answer</div>
        </div>
        <KeyIdea>
          💡 Differentiating erases the constant. That is exactly why integrating cannot recover
          it — and why <MathText text="+ C" /> has to be written down.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
