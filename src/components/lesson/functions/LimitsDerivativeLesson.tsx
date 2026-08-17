"use client";

import { useState } from "react";
import { MathText } from "@/components/MathText";
import { Step, KeyIdea, FormulaBox, WrongBox } from "@/components/lesson/Step";
import { LessonShell, TryIt } from "@/components/lesson/LessonShell";
import { PrimaryButton } from "@/components/ui";

/**
 * y = x + 3 with a hole punched at x = 3 — the picture of
 * (x² − 9)/(x − 3), which agrees with the line everywhere except one point.
 */
function HoleGraph() {
  const W = 280;
  const H = 190;
  const xMin = -1;
  const xMax = 7;
  const yMin = 0;
  const yMax = 11;
  const px = (x: number) => ((x - xMin) / (xMax - xMin)) * W;
  const py = (y: number) => H - ((y - yMin) / (yMax - yMin)) * H;
  return (
    <figure className="m-0">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: W }} role="img" aria-label="a straight line with a single point missing at x equals 3">
        {[0, 2, 4, 6].map((v) => (
          <line key={`v${v}`} x1={px(v)} y1={0} x2={px(v)} y2={H} stroke="#f3f4f6" strokeWidth="1" />
        ))}
        {[2, 4, 6, 8, 10].map((v) => (
          <line key={`h${v}`} x1={0} y1={py(v)} x2={W} y2={py(v)} stroke="#f3f4f6" strokeWidth="1" />
        ))}
        <line x1={px(0)} y1={0} x2={px(0)} y2={H} stroke="#94a3b8" strokeWidth="1.4" />
        <line x1={0} y1={py(0)} x2={W} y2={py(0)} stroke="#94a3b8" strokeWidth="1.4" />
        <line x1={px(-1)} y1={py(2)} x2={px(7)} y2={py(10)} stroke="#7c3aed" strokeWidth="2.6" />
        <line x1={px(3)} y1={py(0)} x2={px(3)} y2={py(6)} stroke="#dc2626" strokeWidth="1.2" strokeDasharray="4 3" />
        <line x1={px(0)} y1={py(6)} x2={px(3)} y2={py(6)} stroke="#dc2626" strokeWidth="1.2" strokeDasharray="4 3" />
        <circle cx={px(3)} cy={py(6)} r="5.5" fill="#ffffff" stroke="#dc2626" strokeWidth="2.4" />
        <text x={px(3) + 9} y={py(6) - 6} fontSize="11" fontWeight="700" fill="#dc2626">
          (3, 6) missing
        </text>
        <text x={px(3)} y={py(0) + 13} fontSize="10" textAnchor="middle" fill="#6b7280">
          3
        </text>
        <text x={px(0) - 5} y={py(6) + 4} fontSize="10" textAnchor="end" fill="#6b7280">
          6
        </text>
      </svg>
    </figure>
  );
}

/** One zoom panel on y = x² centred at (2, 4); a smaller w is a closer look. */
function ZoomPanel({ w, caption }: { w: number; caption: string }) {
  const W = 128;
  const H = 128;
  const xC = 2;
  const yC = 4;
  const yHalf = 4 * w;
  const px = (x: number) => ((x - (xC - w)) / (2 * w)) * W;
  const py = (y: number) => H - ((y - (yC - yHalf)) / (2 * yHalf)) * H;
  const pts: string[] = [];
  for (let i = 0; i <= 120; i++) {
    const x = xC - w + (2 * w * i) / 120;
    const y = x * x;
    if (y >= yC - yHalf && y <= yC + yHalf) pts.push(`${px(x).toFixed(1)},${py(y).toFixed(1)}`);
  }
  return (
    <figure className="m-0">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: W }} role="img" aria-label={caption}>
        <rect x="0.5" y="0.5" width={W - 1} height={H - 1} fill="#ffffff" stroke="#e5e7eb" strokeWidth="1" />
        <polyline points={pts.join(" ")} fill="none" stroke="#7c3aed" strokeWidth="2.4" />
        <circle cx={px(xC)} cy={py(yC)} r="4" fill="#dc2626" />
      </svg>
      <figcaption className="mt-1 text-center text-xs font-semibold text-ink-700">{caption}</figcaption>
    </figure>
  );
}

/** y = x² with the secant to (3, 9) and the true tangent at (2, 4). */
function SecantTangent() {
  const W = 280;
  const H = 190;
  const xMin = 0;
  const xMax = 4;
  const yMin = -1;
  const yMax = 12;
  const px = (x: number) => ((x - xMin) / (xMax - xMin)) * W;
  const py = (y: number) => H - ((y - yMin) / (yMax - yMin)) * H;
  const pts: string[] = [];
  for (let i = 0; i <= 120; i++) {
    const x = xMin + ((xMax - xMin) * i) / 120;
    const y = x * x;
    if (y <= yMax) pts.push(`${px(x).toFixed(1)},${py(y).toFixed(1)}`);
  }
  return (
    <figure className="m-0">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: W }} role="img" aria-label="the parabola with a secant line and the tangent at x equals 2">
        <line x1={0} y1={py(0)} x2={W} y2={py(0)} stroke="#94a3b8" strokeWidth="1.4" />
        <line x1={px(0)} y1={0} x2={px(0)} y2={H} stroke="#94a3b8" strokeWidth="1.4" />
        <polyline points={pts.join(" ")} fill="none" stroke="#7c3aed" strokeWidth="2.6" />
        <line x1={px(1.2)} y1={py(0)} x2={px(3.6)} y2={py(12)} stroke="#f59e0b" strokeWidth="2" strokeDasharray="5 4" />
        <line x1={px(0.75)} y1={py(-1)} x2={px(4)} y2={py(12)} stroke="#16a34a" strokeWidth="2" />
        <circle cx={px(2)} cy={py(4)} r="4.5" fill="#dc2626" />
        <circle cx={px(3)} cy={py(9)} r="4" fill="#f59e0b" />
        <text x={px(3) + 7} y={py(9) - 4} fontSize="10" fontWeight="700" fill="#f59e0b">
          secant, slope 5
        </text>
        <text x={px(2) + 7} y={py(4) + 15} fontSize="10" fontWeight="700" fill="#16a34a">
          tangent, slope 4
        </text>
      </svg>
    </figure>
  );
}

/**
 * Limits.
 *
 * The misconception is that a limit is just substitution. Substitution is
 * where you start, but 0/0 is a signal rather than an answer — and the way to
 * show that is a table of values creeping in from both sides.
 */
export function LimitsLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 12 · Calculus · Limits"
      title="Where a function is heading"
      minutes={7}
      step={step}
      total={7}
    >
      <Step n={1} title="A path with one slab missing" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          Suppose one slab of a footpath has been lifted out. You can still see exactly where the
          path goes — the gap tells you nothing about the direction.
        </p>
        <p className="mt-3 text-ink-700">
          A limit asks that same question about a function: <strong>where are the outputs
          heading</strong> as <MathText text="x" /> closes in on a point — whether or not anything
          is actually there.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(2)}>Start with an easy one</PrimaryButton></div>
      </Step>

      <Step n={2} title="Usually you just substitute" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <p className="text-ink-700">
          For most functions a limit is no work at all. Watch <MathText text="x^2 + 1" /> as{" "}
          <MathText text="x" /> approaches 2:
        </p>
        <div className="mt-3 space-y-2">
          {[
            ["x = 1.9", "4.61"],
            ["x = 1.99", "4.9601"],
            ["x = 2.01", "5.0401"],
            ["x = 2.1", "5.41"],
          ].map(([a, b]) => (
            <div key={a} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-bold text-ink-900"><MathText text={a} /></span>
              <span className="text-sm text-ink-700">{b}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-ink-700">
          Closing in on 5 from both sides — and <MathText text="2^2 + 1 = 5" /> as well.
          Substitution worked because the graph has no break there.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(3)}>Now a hard one</PrimaryButton></div>
      </Step>

      <Step n={3} title="The new problem" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">Find</p>
        <FormulaBox>
          <MathText text="lim as x → 3 of {x^2 − 9/x − 3}" />
        </FormulaBox>
        <p className="text-ink-700">Substitute 3 and see what happens.</p>
        <div className="mt-3 rounded-2xl bg-paper p-4 text-center">
          <div className="font-bold text-ink-900">
            <MathText text="{3^2 − 9/3 − 3} = {9 − 9/3 − 3} = {0/0}" />
          </div>
        </div>
        <p className="mt-3 text-ink-700">
          <MathText text="{0/0}" /> is not a number. The question &ldquo;what times 0 gives
          0?&rdquo; is answered by <em>every</em> number, so it pins nothing down at all.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(4)}>So what now?</PrimaryButton></div>
      </Step>

      <Step n={4} title="The mistake almost everyone makes" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <WrongBox>A limit is just substitution — so this one does not exist</WrongBox>
        <p className="text-ink-700">
          Substitution has worked every time until now, so it starts to feel like the definition.
          But the limit never asks what happens <em>at</em> 3 — only what happens <em>near</em> 3.
          So go and look.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="mx-auto border-collapse text-center text-sm">
            <thead>
              <tr className="text-xs font-bold uppercase tracking-wide text-ink-500">
                <th className="px-2 pb-1">x</th>
                <th className="px-2 pb-1 text-brand-600">value</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["2.9", "5.9"],
                ["2.99", "5.99"],
                ["3", "undefined"],
                ["3.01", "6.01"],
                ["3.1", "6.1"],
              ].map(([a, b]) => (
                <tr key={a} className={a === "3" ? "bg-err-100" : ""}>
                  <td className="border border-ink-100 px-4 py-1 font-semibold tabular-nums text-ink-700">{a}</td>
                  <td
                    className={`border border-ink-100 px-4 py-1 font-bold tabular-nums ${
                      a === "3" ? "text-err-600" : "text-brand-700"
                    }`}
                  >
                    {b}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-ink-700">
          From the left it climbs towards 6. From the right it drops towards 6. The single place it
          says nothing is the single place the limit never asks about.
        </p>
        <p className="mt-3 text-center text-lg font-bold text-ok-600">The limit is 6</p>
        <KeyIdea>
          <MathText text="{0/0}" /> is not a dead end. It is a <strong>signal</strong> that the top
          and the bottom share a factor, and that some algebra will remove it.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(5)}>Prove it with algebra</PrimaryButton></div>
      </Step>

      <Step n={5} title="Cancel the factor that caused the zero" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <div className="rounded-2xl bg-paper p-4">
          <ol className="space-y-2">
            {[
              ["Factor the top — difference of two squares", "(x − 3)(x + 3)"],
              ["Rewrite the fraction", "{(x − 3)(x + 3)/x − 3}"],
              ["Cancel — legal for every x except 3", "x + 3"],
              ["Now substitute", "3 + 3 = 6"],
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
          So the original expression <em>is</em> the line <MathText text="y = x + 3" /> — with
          exactly one point removed.
        </p>
        <div className="mt-3">
          <HoleGraph />
        </div>
        <p className="mt-3 text-ink-700">
          That is why the answer is 6 even though the function is undefined there. The hole is one
          missing point on an otherwise perfectly ordinary line.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(6)}>One more kind</PrimaryButton></div>
      </Step>

      <Step n={6} title="Limits at infinity" open={step === 6} onOpen={() => go(6)} done={step > 6}>
        <p className="text-ink-700">
          The other common question asks where a function settles as <MathText text="x" /> runs off
          to infinity. Find
        </p>
        <FormulaBox>
          <MathText text="lim as x → ∞ of {3x^2 + 5x/2x^2 − 7}" />
        </FormulaBox>
        <p className="text-ink-700">
          You cannot substitute infinity — it is not a number. Instead divide top and bottom by the
          biggest power present, <MathText text="x^2" />.
        </p>
        <div className="mt-3 rounded-2xl bg-paper p-4">
          <ol className="space-y-2">
            {[
              ["Divide every term by x^2", "{3 + {5/x}/2 − {7/x^2}}"],
              ["As x grows, {5/x} and {7/x^2} shrink to 0", "{3 + 0/2 − 0}"],
              ["So the limit is", "{3/2}"],
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
            Check at <MathText text="x = 1000" />: the top is 3&nbsp;005&nbsp;000 and the bottom is
            1&nbsp;999&nbsp;993, giving 1.5025 — already almost exactly <MathText text="{3/2}" /> ✓
          </p>
        </div>
        <KeyIdea>
          Far out, only the highest powers matter. Everything else has been squashed flat by
          comparison.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(7)}>Your turn</PrimaryButton></div>
      </Step>

      <Step n={7} title="You try one" open={step === 7} onOpen={() => go(7)} done={false}>
        <p className="text-ink-700">Find</p>
        <div className="my-3 rounded-xl bg-ink-900 px-4 py-3 text-center text-lg font-bold text-white">
          <MathText text="lim as x → 5 of {x^2 − 25/x − 5}" />
        </div>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          Substituting gives <MathText text="{0/0}" />, so factor:{" "}
          <MathText text="x^2 − 25 = (x − 5)(x + 5)" className="font-bold" />, and the{" "}
          <MathText text="(x − 5)" /> cancels.
        </div>
        <TryIt
          prompt={<>2. What is left is x + 5. What does the limit equal?</>}
          accept={["10"]}
          placeholder="a number"
          value={fade}
          setValue={setFade}
          hint="put 5 into x + 5."
          explain={
            <>
              <MathText text="5 + 5 = 10" />. Check it numerically:{" "}
              <MathText text="x = 4.99" /> gives 9.99 and <MathText text="x = 5.01" /> gives 10.01 —
              closing in on 10 from both sides ✓
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Limits</div>
          <div className="mt-2">1. Try substitution first — it usually works</div>
          <div className="mt-1">2. A number comes out? That is the limit</div>
          <div className="mt-1">3. 0/0? Factor and cancel, then substitute again</div>
          <div className="mt-1">4. Heading to infinity? Divide by the highest power</div>
        </div>
        <KeyIdea>
          💡 A limit is about the neighbourhood, not the address. What happens exactly at the point
          is allowed to be nothing at all.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}

/**
 * The derivative.
 *
 * Introduced as a rate — the slope of a curve at a point, reached by zooming
 * in until the curve looks straight. Two errors are confronted: the power rule
 * applied to a constant, and the missing inner derivative, which is settled by
 * expanding (3x + 1)² where no new rule is needed.
 */
export function DerivativeLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 12 · Calculus · Derivatives"
      title="The slope of a curve at one point"
      minutes={8}
      step={step}
      total={7}
    >
      <Step n={1} title="What the speedometer knows" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          Drive 120 km in 2 hours and your average speed is 60 km/h. But the needle does not read 60
          the whole way. It reads your speed <strong>right now</strong>.
        </p>
        <p className="mt-3 text-ink-700">
          &ldquo;Right now&rdquo; is a strange idea. In zero time you cover zero distance, and{" "}
          <MathText text="{0/0}" /> is nothing. Yet the needle plainly has a number on it.
        </p>
        <p className="mt-3 text-ink-700">
          The derivative is how that number gets pinned down — and it turns out to be the same
          problem as finding the slope of a curve at a single point.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(2)}>Start with a straight line</PrimaryButton></div>
      </Step>

      <Step n={2} title="Slope you already know" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <p className="text-ink-700">
          For a straight line the slope is <MathText text="{rise/run}" />, and it is the same
          everywhere on the line. Two points is all you ever need.
        </p>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-center text-sm">
          <MathText text="from (1, 3) to (4, 12): slope = {12 − 3/4 − 1} = {9/3} = 3" />
        </div>
        <p className="mt-3 text-ink-700">
          A curve is different. Its steepness keeps changing, so &ldquo;the slope of{" "}
          <MathText text="y = x^2" />&rdquo; is not a question with one answer. You have to say{" "}
          <em>where</em>.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(3)}>The new problem</PrimaryButton></div>
      </Step>

      <Step n={3} title="How steep is y = x² at x = 2?" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">
          Here is the move that makes it possible. <strong>Zoom in.</strong> Keep the point{" "}
          <MathText text="(2, 4)" /> in the middle and shrink the window around it.
        </p>
        <div className="mt-4 flex flex-wrap items-start justify-center gap-3">
          <ZoomPanel w={2} caption="wide — clearly a curve" />
          <ZoomPanel w={0.5} caption="closer — gently bent" />
          <ZoomPanel w={0.1} caption="close — looks straight" />
        </div>
        <p className="mt-4 text-ink-700">
          Zoomed in far enough, any smooth curve is indistinguishable from a straight line. And a
          straight line has a slope you can measure.
        </p>
        <KeyIdea>
          The slope of that line is the <strong>derivative</strong> at the point, written{" "}
          <MathText text="f′(2)" />. It is the rate at which the output changes as the input creeps
          forward.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(4)}>Measure it</PrimaryButton></div>
      </Step>

      <Step n={4} title="Close in on the slope" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <p className="text-ink-700">
          You cannot take the slope between a point and itself. So take the slope from{" "}
          <MathText text="(2, 4)" /> to a second point — then drag that second point closer and
          closer.
        </p>
        <div className="mt-3">
          <SecantTangent />
        </div>
        <div className="mt-3 overflow-x-auto">
          <table className="mx-auto border-collapse text-center text-sm">
            <thead>
              <tr className="text-xs font-bold uppercase tracking-wide text-ink-500">
                <th className="px-2 pb-1">second point</th>
                <th className="px-2 pb-1">rise ÷ run</th>
                <th className="px-2 pb-1 text-brand-600">slope</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["(3, 9)", "5 ÷ 1", "5"],
                ["(2.5, 6.25)", "2.25 ÷ 0.5", "4.5"],
                ["(2.1, 4.41)", "0.41 ÷ 0.1", "4.1"],
                ["(2.01, 4.0401)", "0.0401 ÷ 0.01", "4.01"],
                ["(2.001, 4.004001)", "0.004001 ÷ 0.001", "4.001"],
              ].map(([a, b, c]) => (
                <tr key={a}>
                  <td className="border border-ink-100 px-2 py-1 font-semibold tabular-nums text-ink-700">{a}</td>
                  <td className="border border-ink-100 px-2 py-1 tabular-nums text-ink-500">{b}</td>
                  <td className="border border-ink-100 px-2 py-1 font-bold tabular-nums text-brand-700">{c}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-center text-lg font-bold text-ok-600">
          <MathText text="f′(2) = 4" />
        </p>
        <p className="mt-3 text-ink-700">And the algebra says exactly the same thing:</p>
        <div className="mt-2 rounded-2xl bg-paper p-4">
          <ol className="space-y-2">
            {[
              ["Second point at x = 2 + h", "(2 + h)^2 = 4 + 4h + h^2"],
              ["Rise", "4h + h^2"],
              ["Divide by the run h", "4 + h"],
              ["Let h shrink to 0", "4"],
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
        <FormulaBox>
          <div className="text-base"><MathText text="{d/dx} x^n = n x^{n − 1}" /></div>
        </FormulaBox>
        <p className="text-ink-700">
          For <MathText text="x^2" /> that gives <MathText text="2x" />, and{" "}
          <MathText text="2 * 2 = 4" /> ✓ — the rule and the table agree.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(5)}>Two ways it goes wrong</PrimaryButton></div>
      </Step>

      <Step n={5} title="The two mistakes almost everyone makes" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <WrongBox>
          <MathText text="f(x) = 3x^2 + 7" /> gives <MathText text="f′(x) = 6x + 7" />
        </WrongBox>
        <p className="text-ink-700">
          The 7 is carried along because it looks like it ought to do something. Test it with a
          picture instead of a rule.
        </p>
        <p className="mt-3 text-ink-700">
          <MathText text="y = 3x^2 + 7" /> is exactly <MathText text="y = 3x^2" /> lifted 7 upwards.
          Sliding a graph up does not tilt it — at every <MathText text="x" /> the two curves are
          equally steep. So the <MathText text="+ 7" /> contributes <strong>0</strong> to the slope,
          and <MathText text="f′(x) = 6x" />.
        </p>
        <div className="mt-3 space-y-2">
          {[
            ["f(x) = 7", "a flat line — no rise, ever", "f′(x) = 0"],
            ["f(x) = 5x", "a line of slope 5", "f′(x) = 5"],
            ["f(x) = 3x^2 + 7", "the + 7 only lifts it", "f′(x) = 6x"],
          ].map(([a, b, c]) => (
            <div key={a} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-bold text-ink-900"><MathText text={a} /></span>
              <span className="text-xs text-ink-500">{b}</span>
              <span className="text-sm font-bold text-brand-700"><MathText text={c} /></span>
            </div>
          ))}
        </div>

        <WrongBox>
          <MathText text="f(x) = (3x + 1)^2" /> gives <MathText text="f′(x) = 2(3x + 1)" />
        </WrongBox>
        <p className="text-ink-700">
          This is the power rule applied honestly to the outside — and it is still wrong, because
          the inside is not plain <MathText text="x" />. Settle it by expanding first, where no new
          rule is needed at all.
        </p>
        <div className="mt-3 space-y-2">
          {[
            ["Expand: (3x + 1)^2", "9x^2 + 6x + 1"],
            ["Differentiate term by term", "18x + 6"],
            ["At x = 1 that gives", "24"],
            ["But 2(3x + 1) at x = 1 gives", "8"],
          ].map(([a, b], i) => (
            <div key={i} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-semibold text-ink-900"><MathText text={a} /></span>
              <span className={`text-sm font-bold ${i === 3 ? "text-err-600" : "text-ink-700"}`}>
                <MathText text={b} />
              </span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-ink-700">
          24 against 8 — out by a factor of 3. And 3 is precisely the rate at which the inside,{" "}
          <MathText text="3x + 1" />, is changing. Put that factor back and everything fits:{" "}
          <MathText text="2(3x + 1) * 3 = 18x + 6" /> ✓
        </p>
        <FormulaBox>
          <div className="text-base">chain rule: outside derivative × inside derivative</div>
        </FormulaBox>
        <KeyIdea>
          The inside is a machine of its own. If it is changing 3 times as fast as{" "}
          <MathText text="x" />, then everything downstream changes 3 times as fast too.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(6)}>Worked example</PrimaryButton></div>
      </Step>

      <Step n={6} title="A full polynomial" open={step === 6} onOpen={() => go(6)} done={step > 6}>
        <p className="text-ink-700">
          <MathText text="f(x) = 3x^2 + 5x − 4" className="font-bold text-ink-900" />. Find{" "}
          <MathText text="f′(2)" />.
        </p>
        <div className="mt-3 rounded-2xl bg-paper p-4">
          <ol className="space-y-2">
            {[
              ["3x^2 — bring the 2 down, drop the power", "6x"],
              ["5x is a line of slope 5", "5"],
              ["−4 is flat", "0"],
              ["So f′(x) =", "6x + 5"],
              ["f′(2) = 6(2) + 5", "17"],
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
            Sanity check by measuring: <MathText text="f(2) = 18" /> and{" "}
            <MathText text="f(2.01) = 18.1703" />, so the slope across that tiny step is{" "}
            <MathText text="0.1703 ÷ 0.01 = 17.03" /> — heading for 17 ✓
          </p>
        </div>
        <div className="mt-4"><PrimaryButton onClick={() => go(7)}>Your turn</PrimaryButton></div>
      </Step>

      <Step n={7} title="You try one" open={step === 7} onOpen={() => go(7)} done={false}>
        <p className="text-ink-700">
          <MathText text="f(x) = 4x^2 − 3x + 9" className="font-bold text-ink-900" />. Find{" "}
          <MathText text="f′(3)" />.
        </p>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          Term by term: <MathText text="4x^2" /> gives <MathText text="8x" />,{" "}
          <MathText text="−3x" /> gives <MathText text="−3" />, and the{" "}
          <MathText text="+ 9" /> is flat so it gives 0. That makes{" "}
          <MathText text="f′(x) = 8x − 3" className="font-bold" />.
        </div>
        <TryIt
          prompt={<>2. Now put x = 3 into f′(x). What is f′(3)?</>}
          accept={["21"]}
          placeholder="a number"
          value={fade}
          setValue={setFade}
          hint="8 × 3 = 24, and you still subtract the 3."
          explain={
            <>
              <MathText text="f′(3) = 24 − 3 = 21" />. Check it by measuring:{" "}
              <MathText text="f(3) = 36" /> and <MathText text="f(3.01) = 36.2104" />, so the
              measured slope is <MathText text="0.2104 ÷ 0.01 = 21.04" /> — closing in on 21 ✓. Note
              that the 9 made no difference at all.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Derivatives</div>
          <div className="mt-2">1. f′(x) is the slope of the curve — its rate of change</div>
          <div className="mt-1">2. Power rule: xⁿ becomes n xⁿ⁻¹</div>
          <div className="mt-1">3. Constants differentiate to 0 — flat means no slope</div>
          <div className="mt-1">4. Inside not plain x? Multiply by the inside&rsquo;s derivative</div>
        </div>
        <KeyIdea>
          💡 If you ever doubt a derivative, measure it. Work out <MathText text="f(a)" /> and{" "}
          <MathText text="f(a + 0.01)" />, divide the gap by 0.01, and your answer should be sitting
          right there.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
