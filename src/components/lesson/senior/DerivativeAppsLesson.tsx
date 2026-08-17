"use client";

import { useState } from "react";
import { MathText } from "@/components/MathText";
import { Step, KeyIdea, FormulaBox, WrongBox } from "@/components/lesson/Step";
import { LessonShell, TryIt } from "@/components/lesson/LessonShell";
import { PrimaryButton } from "@/components/ui";

/** y = x³ − 12x with both critical points marked and their flat tangents drawn. */
function CubicCriticalPlot() {
  const W = 300;
  const H = 215;
  const xMin = -4;
  const xMax = 4;
  const yMin = -20;
  const yMax = 20;
  const px = (x: number) => 22 + ((x - xMin) / (xMax - xMin)) * (W - 34);
  const py = (y: number) => H - 14 - ((y - yMin) / (yMax - yMin)) * (H - 28);
  const pts: string[] = [];
  for (let i = 0; i <= 200; i++) {
    const x = xMin + ((xMax - xMin) * i) / 200;
    pts.push(`${px(x).toFixed(1)},${py(x ** 3 - 12 * x).toFixed(1)}`);
  }
  return (
    <figure className="m-0">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style={{ maxWidth: W }}
        role="img"
        aria-label="a cubic curve with a peak on the left and a trough on the right, both marked"
      >
        {[-2, 0, 2].map((v) => (
          <line key={v} x1={px(v)} y1={8} x2={px(v)} y2={H - 8} stroke="#f3f4f6" strokeWidth="1" />
        ))}
        <line x1={px(xMin)} y1={py(0)} x2={px(xMax)} y2={py(0)} stroke="#94a3b8" strokeWidth="1.4" />
        <line x1={px(0)} y1={8} x2={px(0)} y2={H - 8} stroke="#94a3b8" strokeWidth="1.4" />
        <polyline points={pts.join(" ")} fill="none" stroke="#7c3aed" strokeWidth="2.8" />
        <line x1={px(-3)} y1={py(16)} x2={px(-1)} y2={py(16)} stroke="#dc2626" strokeWidth="2" strokeDasharray="5 3" />
        <line x1={px(1)} y1={py(-16)} x2={px(3)} y2={py(-16)} stroke="#16a34a" strokeWidth="2" strokeDasharray="5 3" />
        <circle cx={px(-2)} cy={py(16)} r="4.5" fill="#dc2626" />
        <circle cx={px(2)} cy={py(-16)} r="4.5" fill="#16a34a" />
        <text x={px(-2) - 4} y={py(16) - 8} fontSize="10" fontWeight="700" textAnchor="middle" fill="#dc2626">
          (−2, 16) max
        </text>
        <text x={px(2) + 2} y={py(-16) + 15} fontSize="10" fontWeight="700" textAnchor="middle" fill="#16a34a">
          (2, −16) min
        </text>
        <text x={px(0) + 5} y={py(0) - 5} fontSize="9" fill="#6b7280">
          O
        </text>
      </svg>
    </figure>
  );
}

/** The sign of f′ across the three intervals cut out by x = −2 and x = 2. */
function SignChart() {
  const W = 300;
  const H = 96;
  const y = 58;
  return (
    <figure className="m-0">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style={{ maxWidth: W }}
        role="img"
        aria-label="a number line split at minus two and two, showing the derivative positive, negative, then positive"
      >
        <line x1={16} y1={y} x2={W - 16} y2={y} stroke="#94a3b8" strokeWidth="1.6" />
        {[
          [110, "−2"],
          [206, "2"],
        ].map(([x, label]) => (
          <g key={String(label)}>
            <line x1={Number(x)} y1={y - 8} x2={Number(x)} y2={y + 8} stroke="#334155" strokeWidth="1.6" />
            <text x={Number(x)} y={y + 22} fontSize="11" fontWeight="700" textAnchor="middle" fill="#334155">
              {label}
            </text>
          </g>
        ))}
        {[
          [40, 90, "#16a34a", "+", "rising"],
          [136, 180, "#dc2626", "−", "falling"],
          [232, 282, "#16a34a", "+", "rising"],
        ].map(([x1, x2, color, sign, word]) => (
          <g key={String(x1)}>
            <line
              x1={Number(x1)}
              y1={sign === "+" ? y - 22 : y - 8}
              x2={Number(x2)}
              y2={sign === "+" ? y - 8 : y - 22}
              stroke={String(color)}
              strokeWidth="2.4"
            />
            <text
              x={(Number(x1) + Number(x2)) / 2}
              y={y - 28}
              fontSize="10"
              fontWeight="700"
              textAnchor="middle"
              fill={String(color)}
            >
              f′ {sign} — {word}
            </text>
          </g>
        ))}
        <text x={16} y={H - 6} fontSize="9" fill="#6b7280">
          f′(−3) = 15
        </text>
        <text x={132} y={H - 6} fontSize="9" fill="#6b7280">
          f′(0) = −12
        </text>
        <text x={236} y={H - 6} fontSize="9" fill="#6b7280">
          f′(3) = 15
        </text>
      </svg>
    </figure>
  );
}

/**
 * Critical points, maxima and minima.
 *
 * The misconception is that f′(x) = 0 announces a maximum. It is confronted on
 * a cubic that has one of each, where the same equation produces both answers,
 * so the only way to tell them apart is to test the sides. A second error is
 * confronted alongside it: reporting the x-value when the question asked for
 * the value of f.
 */
export function CriticalPointsLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [guess, setGuess] = useState<string | null>(null);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 12 · Calculus · Critical points"
      title="Flat does not mean highest"
      minutes={8}
      step={step}
      total={7}
    >
      <Step n={1} title="Over the top of a hill" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          Drive over a hill and, for one instant at the summit, you are neither climbing nor
          descending. Your rate of climb is exactly zero.
        </p>
        <p className="mt-3 text-ink-700">
          Now drive through the bottom of a valley. Same thing — for one instant, zero rate of
          climb. Both the highest point and the lowest point are flat.
        </p>
        <p className="mt-3 text-ink-700">That is a problem, and this lesson is about solving it.</p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(2)}>What the derivative tells you</PrimaryButton>
        </div>
      </Step>

      <Step n={2} title="Sign of the slope" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <p className="text-ink-700">
          The derivative <MathText text="f′(x)" /> is the slope of the curve at{" "}
          <MathText text="x" />, so its sign says which way the curve is heading.
        </p>
        <div className="mt-3 space-y-2">
          {[
            ["f′(x) > 0", "slope points uphill", "increasing"],
            ["f′(x) < 0", "slope points downhill", "decreasing"],
            ["f′(x) = 0", "momentarily flat", "critical point"],
          ].map(([a, b, c]) => (
            <div key={a} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-bold text-ink-900">
                <MathText text={a} />
              </span>
              <span className="text-xs text-ink-500">{b}</span>
              <span className="text-sm font-bold text-brand-700">{c}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-ink-700">
          A <strong>critical point</strong> is any <MathText text="x" /> where the slope is zero. It
          is where interesting things happen — but notice the definition says nothing at all about
          high or low.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(3)}>The new problem</PrimaryButton>
        </div>
      </Step>

      <Step n={3} title="f(x) = x³ − 12x" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">Find the critical points.</p>
        <div className="mt-3 rounded-2xl bg-paper p-4">
          <ol className="space-y-2">
            {[
              ["Differentiate", "f′(x) = 3x^2 − 12"],
              ["Set it to zero", "3x^2 − 12 = 0"],
              ["Solve", "x^2 = 4, so x = 2 or x = −2"],
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
          Two critical points, from one equation. So which one is the maximum?
        </p>
        <div className="mt-4 grid gap-2">
          {[
            { k: "b", label: "Both — the derivative was zero at both" },
            { k: "a", label: "Only one of them" },
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
            The derivative cannot tell you on its own. You have to look either side.
            <div className="mt-3">
              <PrimaryButton onClick={() => go(4)}>Look either side</PrimaryButton>
            </div>
          </div>
        )}
      </Step>

      <Step n={4} title="The mistake almost everyone makes" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <WrongBox>
          <MathText text="f′(x) = 0" />, so this is a maximum
        </WrongBox>
        <p className="text-ink-700">
          Lots of people treat &ldquo;critical point&rdquo; and &ldquo;maximum&rdquo; as the same
          word. But here the very same equation produced two points, and they cannot both be the
          top. Substitute values into <MathText text="f′(x) = 3x^2 − 12" /> and watch the sign
          change.
        </p>
        <div className="mt-4">
          <SignChart />
        </div>
        <p className="mt-3 text-ink-700">
          Read it left to right. The curve rises, then at <MathText text="x = −2" /> it turns and
          falls — that is a <strong>maximum</strong>. It keeps falling until{" "}
          <MathText text="x = 2" />, where it turns and rises again — that is a{" "}
          <strong>minimum</strong>.
        </p>
        <div className="mt-4">
          <CubicCriticalPlot />
        </div>
        <p className="mt-3 text-ink-700">
          The picture confirms it. And notice the maximum, at{" "}
          <MathText text="f(−2) = −8 + 24 = 16" />, is not the highest the function ever gets —
          further right the curve climbs past 16 and keeps going. It is a{" "}
          <strong>local</strong> maximum: the highest point in its own neighbourhood.
        </p>

        <WrongBox>The maximum is <MathText text="−2" /></WrongBox>
        <p className="text-ink-700">
          Second slip, and it costs marks constantly. <MathText text="x = −2" /> is{" "}
          <em>where</em> the maximum happens. The maximum <em>value</em> is{" "}
          <MathText text="f(−2) = 16" />. Read the question and check which one it asked for.
        </p>
        <KeyIdea>
          <MathText text="f′(x) = 0" /> gives you a <strong>candidate</strong>, not a verdict. The
          sign of <MathText text="f′" /> either side delivers the verdict.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(5)}>The shortcut for parabolas</PrimaryButton>
        </div>
      </Step>

      <Step n={5} title="Two ways to settle max or min" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">
          <strong>Method 1 — test the sides.</strong> Pick an <MathText text="x" /> just below the
          critical point and one just above, and put them into <MathText text="f′" />. Plus then
          minus is a maximum; minus then plus is a minimum. This always works.
        </p>
        <p className="mt-3 text-ink-700">
          <strong>Method 2 — look at the shape.</strong> For a quadratic you can skip the testing. A
          positive <MathText text="x^2" /> coefficient opens upward, so its one critical point is a
          minimum. A negative coefficient opens downward, giving a maximum.
        </p>
        <div className="mt-3 space-y-2">
          {[
            ["f(x) = x^2 − 6x + 5", "opens up ∪", "minimum"],
            ["f(x) = −x^2 + 6x + 5", "opens down ∩", "maximum"],
          ].map(([a, b, c]) => (
            <div key={a} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-bold text-ink-900">
                <MathText text={a} />
              </span>
              <span className="text-xs text-ink-500">{b}</span>
              <span className="text-sm font-bold text-brand-700">{c}</span>
            </div>
          ))}
        </div>
        <FormulaBox>
          <div className="text-base">solve f′(x) = 0 → test the sides → then evaluate f</div>
        </FormulaBox>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(6)}>Worked example</PrimaryButton>
        </div>
      </Step>

      <Step n={6} title="A full question" open={step === 6} onOpen={() => go(6)} done={step > 6}>
        <p className="text-ink-700">
          <MathText text="f(x) = x^2 − 8x + 3" className="font-bold text-ink-900" />. Find the
          critical point, decide what kind it is, and give the minimum value.
        </p>
        <div className="mt-3 rounded-2xl bg-paper p-4">
          <ol className="space-y-2">
            {[
              ["Differentiate", "f′(x) = 2x − 8"],
              ["Set to zero and solve", "x = 4"],
              ["Test below: f′(3) = 6 − 8", "−2, falling"],
              ["Test above: f′(5) = 10 − 8", "2, rising"],
              ["Falling then rising", "minimum"],
              ["Minimum value: f(4) = 16 − 32 + 3", "−13"],
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
            Sanity check by evaluating the neighbours: <MathText text="f(3) = −12" /> and{" "}
            <MathText text="f(5) = −12" />, both above −13 ✓. The shape shortcut agrees too — the{" "}
            <MathText text="x^2" /> coefficient is positive, so it opens upward.
          </p>
        </div>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(7)}>Your turn</PrimaryButton>
        </div>
      </Step>

      <Step n={7} title="You try one" open={step === 7} onOpen={() => go(7)} done={false}>
        <p className="text-ink-700">
          <MathText text="f(x) = x^2 − 10x + 7" className="font-bold text-ink-900" />. What is the
          minimum <strong>value</strong> of <MathText text="f" />?
        </p>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          <MathText text="f′(x) = 2x − 10" className="font-bold" />, which is zero at{" "}
          <MathText text="x = 5" />. The <MathText text="x^2" /> coefficient is positive, so the
          parabola opens upward and this is a minimum.
        </div>
        <TryIt
          prompt={<>2. The question asked for the value, not the x. Work out f(5).</>}
          accept={["-18", "−18"]}
          placeholder="a number"
          value={fade}
          setValue={setFade}
          hint="substitute 5 into x² − 10x + 7: that is 25 − 50 + 7."
          explain={
            <>
              <MathText text="f(5) = 25 − 50 + 7 = −18" />. Check the neighbours:{" "}
              <MathText text="f(4) = −17" /> and <MathText text="f(6) = −17" />, both higher ✓.
              Answering 5 would have named the place, not the minimum.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Critical points</div>
          <div className="mt-2">1. Solve f′(x) = 0 to find the candidates</div>
          <div className="mt-1">2. Plus then minus = maximum; minus then plus = minimum</div>
          <div className="mt-1">3. Quadratics: positive x² opens up (min), negative opens down (max)</div>
          <div className="mt-1">4. For the VALUE, substitute back into f — not f′</div>
        </div>
        <KeyIdea>
          💡 A flat spot could be a peak, a trough, or neither. The derivative alone never tells you
          which — the sign either side does.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}

/** The three fenced sides of a pen built against a wall. */
function FenceDiagram() {
  const W = 290;
  const H = 165;
  const left = 60;
  const right = 240;
  const top = 40;
  const bottom = 130;
  return (
    <figure className="m-0">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style={{ maxWidth: W }}
        role="img"
        aria-label="a rectangular pen with a wall along the top and fence on the other three sides"
      >
        <line x1={left - 16} y1={top} x2={right + 16} y2={top} stroke="#334155" strokeWidth="5" />
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <line
            key={i}
            x1={left - 12 + i * 26}
            y1={top - 3}
            x2={left - 20 + i * 26}
            y2={top - 12}
            stroke="#94a3b8"
            strokeWidth="1.6"
          />
        ))}
        <text x={(left + right) / 2} y={top - 16} fontSize="10" fontWeight="700" textAnchor="middle" fill="#6b7280">
          existing wall — no fence needed
        </text>
        <line x1={left} y1={top} x2={left} y2={bottom} stroke="#0d9488" strokeWidth="3" />
        <line x1={right} y1={top} x2={right} y2={bottom} stroke="#0d9488" strokeWidth="3" />
        <line x1={left} y1={bottom} x2={right} y2={bottom} stroke="#7c3aed" strokeWidth="3" />
        <rect x={left} y={top} width={right - left} height={bottom - top} fill="#7c3aed" opacity="0.06" />
        <text x={left - 8} y={(top + bottom) / 2} fontSize="11" fontWeight="700" textAnchor="end" fill="#0d9488">
          x
        </text>
        <text x={right + 8} y={(top + bottom) / 2} fontSize="11" fontWeight="700" fill="#0d9488">
          x
        </text>
        <text x={(left + right) / 2} y={bottom + 16} fontSize="11" fontWeight="700" textAnchor="middle" fill="#7c3aed">
          40 − 2x
        </text>
        <text x={(left + right) / 2} y={(top + bottom) / 2 + 4} fontSize="11" fontWeight="700" textAnchor="middle" fill="#334155">
          area = x(40 − 2x)
        </text>
      </svg>
    </figure>
  );
}

/** A = 40x − 2x² plotted against x, with the maximum at (10, 200) marked. */
function AreaParabolaPlot() {
  const W = 290;
  const H = 190;
  const px = (x: number) => 30 + (x / 20) * (W - 46);
  const py = (a: number) => H - 24 - (a / 220) * (H - 40);
  const pts: string[] = [];
  for (let i = 0; i <= 160; i++) {
    const x = (20 * i) / 160;
    pts.push(`${px(x).toFixed(1)},${py(40 * x - 2 * x * x).toFixed(1)}`);
  }
  return (
    <figure className="m-0">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style={{ maxWidth: W }}
        role="img"
        aria-label="area plotted against width, peaking at width ten and area two hundred"
      >
        <line x1={px(0)} y1={py(0)} x2={px(20)} y2={py(0)} stroke="#94a3b8" strokeWidth="1.4" />
        <line x1={px(0)} y1={py(0)} x2={px(0)} y2={py(220)} stroke="#94a3b8" strokeWidth="1.4" />
        <polyline points={pts.join(" ")} fill="none" stroke="#7c3aed" strokeWidth="2.8" />
        <line x1={px(10)} y1={py(0)} x2={px(10)} y2={py(200)} stroke="#dc2626" strokeWidth="1.4" strokeDasharray="4 3" />
        <line x1={px(0)} y1={py(200)} x2={px(10)} y2={py(200)} stroke="#dc2626" strokeWidth="1.4" strokeDasharray="4 3" />
        <circle cx={px(10)} cy={py(200)} r="4.5" fill="#dc2626" />
        <text x={px(10) + 6} y={py(200) - 6} fontSize="10" fontWeight="700" fill="#dc2626">
          (10, 200)
        </text>
        <text x={px(10)} y={py(0) + 13} fontSize="10" textAnchor="middle" fill="#6b7280">
          x = 10
        </text>
        <text x={px(0) - 4} y={py(200) + 3} fontSize="10" textAnchor="end" fill="#6b7280">
          200
        </text>
        <text x={px(20) - 30} y={py(0) + 13} fontSize="9" fill="#6b7280">
          width x
        </text>
        <text x={px(0) + 4} y={py(220) + 2} fontSize="9" fill="#6b7280">
          area
        </text>
      </svg>
    </figure>
  );
}

/**
 * Optimisation.
 *
 * The misconception here is not about calculus at all — students solve
 * f′(x) = 0 correctly and then hand in x. The lesson makes the units do the
 * catching: 10 is a length in metres, the question asked for an area in square
 * metres, and no amount of correct differentiation fixes that.
 */
export function OptimisationLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 12 · Calculus · Optimisation"
      title="Getting the most out of what you have"
      minutes={9}
      step={step}
      total={7}
    >
      <Step n={1} title="Forty metres of fence" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          A farmer has 40 m of fencing and a long straight wall. She wants a rectangular pen with
          the wall as one whole side, so the fence only has to cover the other three.
        </p>
        <p className="mt-3 text-ink-700">
          A narrow deep pen wastes fence on the two sides. A wide shallow pen has almost no depth.
          Somewhere between them is the best shape — and calculus finds it exactly.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(2)}>What you already know</PrimaryButton>
        </div>
      </Step>

      <Step n={2} title="Maxima live where the slope is zero" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <p className="text-ink-700">
          You already know how to find the top of a curve: differentiate, set{" "}
          <MathText text="f′(x) = 0" />, solve, then check the sides to confirm it really is a
          maximum.
        </p>
        <p className="mt-3 text-ink-700">
          Optimisation adds one job at the front and one job at the back. At the front, you have to{" "}
          <strong>build the function yourself</strong> from the words. At the back, you have to{" "}
          <strong>answer the question that was asked</strong>.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(3)}>Build the function</PrimaryButton>
        </div>
      </Step>

      <Step n={3} title="Turn the words into algebra" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">
          Call the two matching sides <MathText text="x" /> each. They use up{" "}
          <MathText text="2x" /> of fence, so the remaining side is{" "}
          <MathText text="40 − 2x" />.
        </p>
        <div className="mt-4">
          <FenceDiagram />
        </div>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-center text-sm font-bold text-ink-900">
          <MathText text="A(x) = x(40 − 2x) = 40x − 2x^2" />
        </div>
        <p className="mt-3 text-ink-700">
          Now it is an ordinary maximum problem. Differentiate and solve:
        </p>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-center text-sm font-bold text-ink-900">
          <MathText text="A′(x) = 40 − 4x = 0, so x = 10" />
        </div>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(4)}>Is that the answer?</PrimaryButton>
        </div>
      </Step>

      <Step n={4} title="The mistake almost everyone makes" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <WrongBox>
          The largest possible area is <MathText text="10" />
        </WrongBox>
        <p className="text-ink-700">
          Every line of that calculus was right. The answer is still wrong, and the units say so out
          loud: <MathText text="x = 10" /> is a <strong>width in metres</strong>, while the question
          asked for an <strong>area in square metres</strong>. Those are not the same kind of thing.
        </p>
        <p className="mt-3 text-ink-700">
          Solving <MathText text="A′(x) = 0" /> tells you <em>where</em> the maximum is. To get the
          maximum itself you have to go back and put that <MathText text="x" /> into{" "}
          <MathText text="A" />:
        </p>
        <div className="mt-3 rounded-2xl bg-paper p-4">
          <ol className="space-y-2">
            {[
              ["Width", "x = 10 m"],
              ["Length", "40 − 20 = 20 m"],
              ["Area", "10 * 20 = 200 m^2"],
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
          Confirm it really is the biggest by trying the neighbours.{" "}
          <MathText text="x = 9" /> gives <MathText text="9 * 22 = 198" />, and{" "}
          <MathText text="x = 11" /> gives <MathText text="11 * 18 = 198" />. Both fall short of
          200 ✓
        </p>
        <div className="mt-4">
          <AreaParabolaPlot />
        </div>
        <p className="mt-3 text-ink-700">
          The graph shows the whole story: <MathText text="x = 10" /> is read off the bottom axis,
          and 200 is read off the side. The question asked for the number on the side.
        </p>
        <KeyIdea>
          Before you write your final line, reread the question and check the units. Metres, square
          metres, seconds and dollars are four different answers, and only one of them was asked
          for.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(5)}>The method, in three steps</PrimaryButton>
        </div>
      </Step>

      <Step n={5} title="The method" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <div className="space-y-2">
          {[
            ["1. Build", "Name a variable, write the quantity to be optimised in terms of it alone"],
            ["2. Differentiate", "Set the derivative to zero, solve, and confirm it is a max or a min"],
            ["3. Answer", "Substitute back and give the quantity the question actually asked for"],
          ].map(([a, b]) => (
            <div key={a} className="rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-bold text-brand-700">{a}</span>
              <span className="ml-2 text-sm text-ink-700">{b}</span>
            </div>
          ))}
        </div>
        <FormulaBox>
          <div className="text-base">build it → solve f′ = 0 → substitute back</div>
        </FormulaBox>
        <p className="text-ink-700">
          Step 1 has a rule of its own: the function must end up with <strong>one</strong> variable
          in it. That is what the fixed 40 m of fence was for — it let you replace the length with{" "}
          <MathText text="40 − 2x" />.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(6)}>Worked example</PrimaryButton>
        </div>
      </Step>

      <Step n={6} title="A projectile" open={step === 6} onOpen={() => go(6)} done={step > 6}>
        <p className="text-ink-700">
          A ball is launched and its height after <MathText text="t" /> seconds is{" "}
          <MathText text="h(t) = −5t^2 + 30t + 12" className="font-bold text-ink-900" /> metres.
          What is its maximum height?
        </p>
        <div className="mt-3 rounded-2xl bg-paper p-4">
          <ol className="space-y-2">
            {[
              ["Differentiate", "h′(t) = −10t + 30"],
              ["Set to zero and solve", "t = 3 seconds"],
              ["Negative t^2 coefficient — opens down", "so it is a maximum"],
              ["Substitute back: h(3) = −45 + 90 + 12", "57 metres"],
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
            Check the neighbours: <MathText text="h(2) = 52" /> and <MathText text="h(4) = 52" />,
            both below 57 ✓
          </p>
        </div>
        <p className="mt-3 text-ink-700">
          One problem, two possible questions. &ldquo;<em>When</em> is it highest?&rdquo; is 3
          seconds. &ldquo;<em>How high</em> does it get?&rdquo; is 57 metres. Same working, different
          final line — and the units tell you which line to write down.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(7)}>Your turn</PrimaryButton>
        </div>
      </Step>

      <Step n={7} title="You try one" open={step === 7} onOpen={() => go(7)} done={false}>
        <p className="text-ink-700">
          A rectangle has a perimeter of 48 m. What is the largest area it can enclose, in square
          metres?
        </p>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          All four sides are fenced this time, so the width and length add to{" "}
          <MathText text="48 ÷ 2 = 24" />. With width <MathText text="x" />, the area is{" "}
          <MathText text="A = x(24 − x)" className="font-bold" />, so{" "}
          <MathText text="A′ = 24 − 2x = 0" /> gives <MathText text="x = 12" />.
        </div>
        <TryIt
          prompt={<>2. The question asked for the area. Work out 12 × (24 − 12).</>}
          accept={["144"]}
          placeholder="a number"
          value={fade}
          setValue={setFade}
          hint="the width is 12 and the length is 24 − 12. Multiply them — do not stop at 12."
          explain={
            <>
              The largest area is <strong>144 m²</strong>, from a 12 m by 12 m square. Check a
              neighbour: an 11 m by 13 m rectangle has the same 48 m perimeter but an area of only{" "}
              <MathText text="143 m^2" /> ✓. Answering 12 would have given the side length, not the
              area.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Optimisation</div>
          <div className="mt-2">1. Write the quantity in terms of ONE variable</div>
          <div className="mt-1">2. Solve f′ = 0 to find where the best value happens</div>
          <div className="mt-1">3. Confirm max or min by the sides or the shape</div>
          <div className="mt-1">4. Substitute back — then check your units against the question</div>
        </div>
        <KeyIdea>
          💡 Solving f′ = 0 answers &ldquo;where?&rdquo;. Almost every optimisation question asks
          &ldquo;how much?&rdquo; instead. Those last two lines of working are worth as many marks
          as all the calculus above them.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
