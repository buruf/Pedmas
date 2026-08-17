"use client";

import { useState } from "react";
import { MathText } from "@/components/MathText";
import { Step, KeyIdea, FormulaBox, WrongBox } from "@/components/lesson/Step";
import { LessonShell, TryIt } from "@/components/lesson/LessonShell";
import { PrimaryButton } from "@/components/ui";

/**
 * The unit circle with radii at 30° and 150°. Both endpoints sit at the same
 * height, which is the whole reason sin θ = ½ has two solutions.
 */
function TwoSolutionsCircle() {
  const VW = 230;
  const VH = 200;
  const cx = 115;
  const cy = 105;
  const R = 74;
  const at = (deg: number): [number, number] => [
    cx + R * Math.cos((deg * Math.PI) / 180),
    cy - R * Math.sin((deg * Math.PI) / 180),
  ];
  const p30 = at(30);
  const p150 = at(150);
  return (
    <figure className="m-0">
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        width="100%"
        style={{ maxWidth: VW }}
        role="img"
        aria-label="a unit circle with two radii at thirty and one hundred and fifty degrees reaching the same height"
      >
        <line x1={cx - R - 12} y1={cy} x2={cx + R + 12} y2={cy} stroke="#94a3b8" strokeWidth="1.4" />
        <line x1={cx} y1={cy - R - 12} x2={cx} y2={cy + R + 12} stroke="#94a3b8" strokeWidth="1.4" />
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="#cbd5e1" strokeWidth="1.8" />
        <line x1={p150[0]} y1={p150[1]} x2={p30[0]} y2={p30[1]} stroke="#dc2626" strokeWidth="1.6" strokeDasharray="5 4" />
        <line x1={cx} y1={cy} x2={p30[0]} y2={p30[1]} stroke="#7c3aed" strokeWidth="2.6" />
        <line x1={cx} y1={cy} x2={p150[0]} y2={p150[1]} stroke="#0d9488" strokeWidth="2.6" />
        <circle cx={p30[0]} cy={p30[1]} r="4" fill="#7c3aed" />
        <circle cx={p150[0]} cy={p150[1]} r="4" fill="#0d9488" />
        <text x={p30[0] + 6} y={p30[1] - 6} fontSize="11" fontWeight="700" fill="#7c3aed">
          30°
        </text>
        <text x={p150[0] - 34} y={p150[1] - 6} fontSize="11" fontWeight="700" fill="#0d9488">
          150°
        </text>
        <text x={cx - 40} y={cy - R - 2} fontSize="10" fontWeight="700" fill="#dc2626">
          same height = 0.5
        </text>
        <text x={cx + 6} y={cy + 16} fontSize="10" fill="#6b7280">
          O
        </text>
      </svg>
    </figure>
  );
}

/** y = sin x from 0° to 360° cut by the line y = 0.5 — two crossings, not one. */
function SineCutPlot() {
  const W = 300;
  const H = 170;
  const px = (x: number) => (x / 360) * (W - 26) + 20;
  const py = (y: number) => H / 2 - y * (H / 2 - 22);
  const pts: string[] = [];
  for (let i = 0; i <= 240; i++) {
    const x = (360 * i) / 240;
    pts.push(`${px(x).toFixed(1)},${py(Math.sin((x * Math.PI) / 180)).toFixed(1)}`);
  }
  return (
    <figure className="m-0">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style={{ maxWidth: W }}
        role="img"
        aria-label="the sine curve crossed by a horizontal line at zero point five in two places"
      >
        {[90, 180, 270, 360].map((d) => (
          <line key={d} x1={px(d)} y1={12} x2={px(d)} y2={H - 12} stroke="#f3f4f6" strokeWidth="1" />
        ))}
        <line x1={px(0)} y1={py(0)} x2={px(360)} y2={py(0)} stroke="#94a3b8" strokeWidth="1.4" />
        <line x1={px(0)} y1={12} x2={px(0)} y2={H - 12} stroke="#94a3b8" strokeWidth="1.4" />
        <polyline points={pts.join(" ")} fill="none" stroke="#7c3aed" strokeWidth="2.8" />
        <line x1={px(0)} y1={py(0.5)} x2={px(360)} y2={py(0.5)} stroke="#dc2626" strokeWidth="1.8" strokeDasharray="6 4" />
        <circle cx={px(30)} cy={py(0.5)} r="4.5" fill="#dc2626" />
        <circle cx={px(150)} cy={py(0.5)} r="4.5" fill="#dc2626" />
        <text x={px(30)} y={py(0.5) - 9} fontSize="10" fontWeight="700" textAnchor="middle" fill="#dc2626">
          30°
        </text>
        <text x={px(150)} y={py(0.5) - 9} fontSize="10" fontWeight="700" textAnchor="middle" fill="#dc2626">
          150°
        </text>
        <text x={px(300)} y={py(0.5) - 8} fontSize="10" fontWeight="700" fill="#dc2626">
          y = 0.5
        </text>
        {[90, 180, 270, 360].map((d) => (
          <text key={d} x={px(d)} y={py(0) + 13} fontSize="9" textAnchor="middle" fill="#6b7280">
            {d}
          </text>
        ))}
      </svg>
    </figure>
  );
}

/** Which functions are positive in which quadrant. */
function QuadrantSigns() {
  const VW = 220;
  const VH = 190;
  const cells: [number, number, string, string][] = [
    [160, 55, "S", "sin +"],
    [58, 55, "A", "all +"],
    [58, 140, "T", "tan +"],
    [160, 140, "C", "cos +"],
  ];
  return (
    <figure className="m-0">
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        width="100%"
        style={{ maxWidth: VW }}
        role="img"
        aria-label="four quadrants labelled all, sine, tangent and cosine positive"
      >
        <rect x="10" y="12" width="200" height="166" fill="#ffffff" stroke="#e5e7eb" strokeWidth="1.2" />
        <line x1="110" y1="12" x2="110" y2="178" stroke="#94a3b8" strokeWidth="1.4" />
        <line x1="10" y1="95" x2="210" y2="95" stroke="#94a3b8" strokeWidth="1.4" />
        {cells.map(([x, y, big, small]) => (
          <g key={big}>
            <text x={x} y={y} fontSize="20" fontWeight="800" textAnchor="middle" fill="#7c3aed">
              {big}
            </text>
            <text x={x} y={y + 15} fontSize="10" fontWeight="700" textAnchor="middle" fill="#6b7280">
              {small}
            </text>
          </g>
        ))}
        <text x="196" y="90" fontSize="9" fill="#6b7280">
          0°
        </text>
        <text x="114" y="22" fontSize="9" fill="#6b7280">
          90°
        </text>
        <text x="14" y="90" fontSize="9" fill="#6b7280">
          180°
        </text>
        <text x="114" y="174" fontSize="9" fill="#6b7280">
          270°
        </text>
      </svg>
    </figure>
  );
}

/**
 * Trig equations.
 *
 * The misconception is the highest-cost one in the whole trig course: taking
 * the calculator's single answer and stopping. It is confronted twice — once
 * on the unit circle, where both radii plainly reach the same height, and once
 * on the graph, where a horizontal line visibly cuts the curve in two places.
 */
export function TrigEquationLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [guess, setGuess] = useState<string | null>(null);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 11–12 · Trigonometry · Equations"
      title="One calculator answer is rarely the whole answer"
      minutes={8}
      step={step}
      total={7}
    >
      <Step n={1} title="Halfway up the wheel" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          A ferris wheel turns once. You pass the halfway-up mark on the way <strong>up</strong>,
          and you pass it again on the way <strong>down</strong>.
        </p>
        <p className="mt-3 text-ink-700">
          So &ldquo;when were you halfway up?&rdquo; has two answers in a single turn. Trig
          equations behave the same way, and a calculator only ever hands you one of them.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(2)}>What sine actually measures</PrimaryButton>
        </div>
      </Step>

      <Step n={2} title="Sine is a height" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <p className="text-ink-700">
          On the unit circle, <MathText text="sin θ" /> is the <strong>height</strong> of the point
          and <MathText text="cos θ" /> is how far <strong>across</strong> it is.
        </p>
        <p className="mt-3 text-ink-700">These exact values are worth having ready:</p>
        <div className="mt-3 overflow-x-auto">
          <table className="mx-auto border-collapse text-center text-sm">
            <thead>
              <tr className="text-xs font-bold uppercase tracking-wide text-ink-500">
                <th className="px-2 pb-1">θ</th>
                <th className="px-2 pb-1">sin θ</th>
                <th className="px-2 pb-1">cos θ</th>
                <th className="px-2 pb-1">tan θ</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["30°", "{1/2}", "{√3/2}", "{√3/3}"],
                ["45°", "{√2/2}", "{√2/2}", "1"],
                ["60°", "{√3/2}", "{1/2}", "√3"],
              ].map((row) => (
                <tr key={row[0]}>
                  {row.map((cell, j) => (
                    <td
                      key={j}
                      className={`border border-ink-100 px-3 py-1 ${
                        j === 0 ? "font-semibold text-ink-700" : "font-bold text-brand-700"
                      }`}
                    >
                      <MathText text={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(3)}>The new problem</PrimaryButton>
        </div>
      </Step>

      <Step n={3} title="Solve sin θ = ½ for 0° ≤ θ < 360°" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">
          The table says <MathText text="sin 30° = {1/2}" />, so 30° is certainly one answer.
        </p>
        <p className="mt-3 text-ink-700">How many answers are there in the full turn?</p>
        <div className="mt-4 grid gap-2">
          {[
            { k: "b", label: "One — θ = 30°" },
            { k: "a", label: "Two" },
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
            Go back to the circle and look at the height.
            <div className="mt-3">
              <PrimaryButton onClick={() => go(4)}>Show me</PrimaryButton>
            </div>
          </div>
        )}
      </Step>

      <Step n={4} title="The mistake almost everyone makes" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <WrongBox>
          <MathText text="sin θ = {1/2}" /> so <MathText text="θ = 30°" />, and that is the answer
        </WrongBox>
        <p className="text-ink-700">
          The calculator gives one number, so it looks finished. But the calculator is answering a
          narrower question than the one you were asked. Look at where else the height is 0.5.
        </p>
        <div className="mt-4 flex justify-center">
          <TwoSolutionsCircle />
        </div>
        <p className="mt-3 text-ink-700">
          The radius at 150° reaches exactly the same height as the radius at 30°. So{" "}
          <MathText text="sin 150° = {1/2}" /> as well — check it on your calculator and you will
          get 0.5 to every decimal place it shows.
        </p>
        <div className="mt-4">
          <SineCutPlot />
        </div>
        <p className="mt-3 text-ink-700">
          The graph makes the same point. Solving <MathText text="sin θ = {1/2}" /> means finding
          where the curve meets the line <MathText text="y = 0.5" />, and a horizontal line cuts a
          full wave in <strong>two</strong> places.
        </p>
        <p className="mt-3 text-center text-lg font-bold text-ok-600">
          <MathText text="θ = 30° or θ = 150°" />
        </p>
        <p className="mt-3 text-ink-700">
          It gets worse with negatives. Ask a calculator for{" "}
          <MathText text="sin^{−1}(−{1/2})" /> and it returns −30°, which is not even inside{" "}
          <MathText text="0° ≤ θ < 360°" />. The real answers are 210° and 330°. The calculator is a
          tool for finding the <em>reference angle</em>, not the solution set.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(5)}>The reliable method</PrimaryButton>
        </div>
      </Step>

      <Step n={5} title="Reference angle, then quadrants" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">
          Work in two moves. First get the <strong>reference angle</strong> — the acute angle you
          get by ignoring the minus sign. Then decide which quadrants carry that sign.
        </p>
        <div className="mt-4 flex justify-center">
          <QuadrantSigns />
        </div>
        <p className="mt-3 text-ink-700">
          Read it anticlockwise from the bottom right: <strong>A</strong>ll,{" "}
          <strong>S</strong>ine, <strong>T</strong>angent, <strong>C</strong>osine — the one
          function that stays positive in each quadrant.
        </p>
        <p className="mt-3 text-ink-700">
          Once you know the quadrant, the angle itself follows a fixed pattern. With reference angle{" "}
          <MathText text="r" />:
        </p>
        <div className="mt-3 space-y-2">
          {[
            ["Quadrant 1", "0° to 90°", "θ = r"],
            ["Quadrant 2", "90° to 180°", "θ = 180° − r"],
            ["Quadrant 3", "180° to 270°", "θ = 180° + r"],
            ["Quadrant 4", "270° to 360°", "θ = 360° − r"],
          ].map(([a, b, c]) => (
            <div key={a} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-bold text-ink-900">{a}</span>
              <span className="text-xs text-ink-500">{b}</span>
              <span className="text-sm font-bold text-brand-700">
                <MathText text={c} />
              </span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-ink-700">
          Tangent is the exception worth remembering: it repeats every 180°, not 360°. So{" "}
          <MathText text="tan θ = 1" /> gives <MathText text="θ = 45°" /> and{" "}
          <MathText text="θ = 45° + 180° = 225°" /> — still two answers in the turn.
        </p>
        <FormulaBox>
          <div className="text-base">reference angle → sign → quadrants → both answers</div>
        </FormulaBox>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(6)}>Worked example</PrimaryButton>
        </div>
      </Step>

      <Step n={6} title="A negative cosine" open={step === 6} onOpen={() => go(6)} done={step > 6}>
        <p className="text-ink-700">
          Solve <MathText text="cos θ = −{√3/2}" className="font-bold text-ink-900" /> for{" "}
          <MathText text="0° ≤ θ < 360°" />.
        </p>
        <div className="mt-3 rounded-2xl bg-paper p-4">
          <ol className="space-y-2">
            {[
              ["Drop the sign and find the reference angle", "cos r = {√3/2}, so r = 30°"],
              ["Cosine is negative — which quadrants?", "2 and 3"],
              ["Quadrant 2: 180° − 30°", "150°"],
              ["Quadrant 3: 180° + 30°", "210°"],
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
            Check on the quadrant diagram: only <strong>A</strong> and <strong>C</strong> carry a
            positive cosine, and neither of those is quadrant 2 or 3 ✓
          </p>
        </div>
        <p className="mt-3 text-center text-lg font-bold text-ok-600">
          <MathText text="θ = 150° or θ = 210°" />
        </p>
        <p className="mt-3 text-ink-700">
          If a question asks only for the smallest solution, it is 150° — but you should have found
          both before choosing.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(7)}>Your turn</PrimaryButton>
        </div>
      </Step>

      <Step n={7} title="You try one" open={step === 7} onOpen={() => go(7)} done={false}>
        <p className="text-ink-700">
          Solve <MathText text="2 sin θ + 1 = 0" className="font-bold text-ink-900" /> for{" "}
          <MathText text="0° ≤ θ < 360°" />, and give the smallest solution.
        </p>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          Isolate first: <MathText text="2 sin θ = −1" />, so{" "}
          <MathText text="sin θ = −{1/2}" className="font-bold" />. The reference angle is{" "}
          <MathText text="30°" />, and sine is negative in quadrants 3 and 4.
        </div>
        <TryIt
          prompt={<>2. Quadrant 3 gives 180° + 30°. What is the smallest solution, in degrees?</>}
          accept={["210"]}
          placeholder="a number"
          value={fade}
          setValue={setFade}
          hint="add the reference angle to 180°."
          explain={
            <>
              <MathText text="θ = 210°" />, and the other solution is{" "}
              <MathText text="360° − 30° = 330°" />. Check both:{" "}
              <MathText text="sin 210° = −{1/2}" /> and <MathText text="sin 330° = −{1/2}" /> ✓. A
              calculator alone would have offered −30°, which is not in the range at all.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Solving trig equations</div>
          <div className="mt-2">1. Isolate the sin, cos or tan first</div>
          <div className="mt-1">2. Ignore the sign to get the reference angle</div>
          <div className="mt-1">3. Use A-S-T-C to pick the two quadrants</div>
          <div className="mt-1">4. Convert: r, 180 − r, 180 + r, 360 − r</div>
        </div>
        <KeyIdea>
          💡 Expect <strong>two</strong> solutions per turn. If you have written down only one, you
          have found the reference angle and stopped halfway.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
