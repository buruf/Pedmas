"use client";

import { useState } from "react";
import { MathText } from "@/components/MathText";
import { Step, KeyIdea, FormulaBox, WrongBox } from "@/components/lesson/Step";
import { LessonShell, TryIt } from "@/components/lesson/LessonShell";
import { PrimaryButton } from "@/components/ui";

const W = 300;
const H = 180;
const X_MAX = 360;
const pxOf = (x: number) => (x / X_MAX) * (W - 24) + 18;
const pyOf = (y: number, yMax: number) => H / 2 - (y / yMax) * (H / 2 - 16);

/** Sample y = a·fn(b·x) + c across 0°…360° and return an SVG polyline. */
function wave(a: number, b: number, c: number, fn: "sin" | "cos", yMax: number): string {
  const pts: string[] = [];
  for (let i = 0; i <= 240; i++) {
    const x = (X_MAX * i) / 240;
    const r = ((b * x) * Math.PI) / 180;
    const y = a * (fn === "sin" ? Math.sin(r) : Math.cos(r)) + c;
    pts.push(`${pxOf(x).toFixed(1)},${pyOf(y, yMax).toFixed(1)}`);
  }
  return pts.join(" ");
}

function Axes({ yMax, ticks }: { yMax: number; ticks: number[] }) {
  return (
    <>
      {[0, 90, 180, 270, 360].map((d) => (
        <line key={d} x1={pxOf(d)} y1={10} x2={pxOf(d)} y2={H - 10} stroke="#f3f4f6" strokeWidth="1" />
      ))}
      <line x1={pxOf(0)} y1={pyOf(0, yMax)} x2={pxOf(360)} y2={pyOf(0, yMax)} stroke="#94a3b8" strokeWidth="1.4" />
      <line x1={pxOf(0)} y1={10} x2={pxOf(0)} y2={H - 10} stroke="#94a3b8" strokeWidth="1.4" />
      {[90, 180, 270, 360].map((d) => (
        <text key={d} x={pxOf(d)} y={pyOf(0, yMax) + 12} fontSize="9" textAnchor="middle" fill="#6b7280">
          {d}
        </text>
      ))}
      {ticks.map((t) => (
        <text key={t} x={pxOf(0) - 4} y={pyOf(t, yMax) + 3} fontSize="9" textAnchor="end" fill="#6b7280">
          {t}
        </text>
      ))}
    </>
  );
}

/** y = sin x against y = 3 sin x — the coefficient out front changes the height. */
function AmplitudePlot() {
  const yMax = 4;
  return (
    <figure className="m-0">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style={{ maxWidth: W }}
        role="img"
        aria-label="the sine curve and a taller curve three times its height"
      >
        <Axes yMax={yMax} ticks={[3, 1, -1, -3]} />
        <polyline points={wave(1, 1, 0, "sin", yMax)} fill="none" stroke="#94a3b8" strokeWidth="1.8" strokeDasharray="5 4" />
        <polyline points={wave(3, 1, 0, "sin", yMax)} fill="none" stroke="#7c3aed" strokeWidth="2.8" />
        <line
          x1={pxOf(90)}
          y1={pyOf(0, yMax)}
          x2={pxOf(90)}
          y2={pyOf(3, yMax)}
          stroke="#dc2626"
          strokeWidth="1.6"
        />
        <text x={pxOf(96)} y={pyOf(1.8, yMax)} fontSize="10" fontWeight="700" fill="#dc2626">
          amplitude 3
        </text>
        <text x={pxOf(220)} y={pyOf(-1.2, yMax)} fontSize="10" fontWeight="700" fill="#94a3b8">
          y = sin x
        </text>
        <text x={pxOf(200)} y={pyOf(-3.4, yMax)} fontSize="10" fontWeight="700" fill="#7c3aed">
          y = 3 sin x
        </text>
      </svg>
    </figure>
  );
}

/** y = sin x against y = sin 2x — the coefficient inside squashes the wave. */
function PeriodPlot() {
  const yMax = 1.75;
  return (
    <figure className="m-0">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style={{ maxWidth: W }}
        role="img"
        aria-label="the sine curve and a squashed curve completing two cycles in the same width"
      >
        <Axes yMax={yMax} ticks={[1, -1]} />
        <polyline points={wave(1, 1, 0, "sin", yMax)} fill="none" stroke="#94a3b8" strokeWidth="1.8" strokeDasharray="5 4" />
        <polyline points={wave(1, 2, 0, "sin", yMax)} fill="none" stroke="#7c3aed" strokeWidth="2.8" />
        <line x1={pxOf(0)} y1={pyOf(1.45, yMax)} x2={pxOf(180)} y2={pyOf(1.45, yMax)} stroke="#7c3aed" strokeWidth="1.6" />
        <line x1={pxOf(180)} y1={pyOf(1.3, yMax)} x2={pxOf(180)} y2={pyOf(1.6, yMax)} stroke="#7c3aed" strokeWidth="1.6" />
        <line x1={pxOf(0)} y1={pyOf(1.3, yMax)} x2={pxOf(0)} y2={pyOf(1.6, yMax)} stroke="#7c3aed" strokeWidth="1.6" />
        <text x={pxOf(20)} y={pyOf(1.62, yMax) - 2} fontSize="10" fontWeight="700" fill="#7c3aed">
          sin 2x repeats after 180°
        </text>
        <line x1={pxOf(0)} y1={pyOf(-1.45, yMax)} x2={pxOf(360)} y2={pyOf(-1.45, yMax)} stroke="#94a3b8" strokeWidth="1.6" />
        <line x1={pxOf(360)} y1={pyOf(-1.6, yMax)} x2={pxOf(360)} y2={pyOf(-1.3, yMax)} stroke="#94a3b8" strokeWidth="1.6" />
        <text x={pxOf(20)} y={pyOf(-1.55, yMax) + 12} fontSize="10" fontWeight="700" fill="#6b7280">
          sin x repeats after 360°
        </text>
      </svg>
    </figure>
  );
}

/** y = 4 sin(3x) − 1 with its midline, maximum and minimum drawn in. */
function WorkedWavePlot() {
  const yMax = 6;
  return (
    <figure className="m-0">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style={{ maxWidth: W }}
        role="img"
        aria-label="a wave of amplitude four about the line y equals minus one, repeating three times"
      >
        <Axes yMax={yMax} ticks={[3, -1, -5]} />
        <line
          x1={pxOf(0)}
          y1={pyOf(-1, yMax)}
          x2={pxOf(360)}
          y2={pyOf(-1, yMax)}
          stroke="#0d9488"
          strokeWidth="1.6"
          strokeDasharray="6 4"
        />
        <line x1={pxOf(0)} y1={pyOf(3, yMax)} x2={pxOf(360)} y2={pyOf(3, yMax)} stroke="#e5e7eb" strokeWidth="1.2" />
        <line x1={pxOf(0)} y1={pyOf(-5, yMax)} x2={pxOf(360)} y2={pyOf(-5, yMax)} stroke="#e5e7eb" strokeWidth="1.2" />
        <polyline points={wave(4, 3, -1, "sin", yMax)} fill="none" stroke="#7c3aed" strokeWidth="2.8" />
        <circle cx={pxOf(30)} cy={pyOf(3, yMax)} r="3.5" fill="#dc2626" />
        <circle cx={pxOf(90)} cy={pyOf(-5, yMax)} r="3.5" fill="#dc2626" />
        <text x={pxOf(200)} y={pyOf(-1, yMax) - 5} fontSize="10" fontWeight="700" fill="#0d9488">
          midline y = −1
        </text>
        <text x={pxOf(36)} y={pyOf(3, yMax) - 5} fontSize="10" fontWeight="700" fill="#dc2626">
          max 3
        </text>
        <text x={pxOf(96)} y={pyOf(-5, yMax) + 12} fontSize="10" fontWeight="700" fill="#dc2626">
          min −5
        </text>
      </svg>
    </figure>
  );
}

/**
 * Trig graphs: amplitude, period, midline.
 *
 * Two errors are confronted together because they feed each other. Students
 * swap which coefficient does which job, and they expect the number inside the
 * bracket to stretch the wave when it squashes it. Both are settled by
 * substituting exact angles rather than by restating the rule.
 */
export function TrigGraphLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [guess, setGuess] = useState<string | null>(null);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 11–12 · Trigonometry · Graphs"
      title="What the numbers do to a wave"
      minutes={8}
      step={step}
      total={7}
    >
      <Step n={1} title="The tide comes in twice a day" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          A tide chart is a wave. Two numbers describe it completely: <strong>how far</strong> the
          water rises and falls, and <strong>how long</strong> before the pattern repeats.
        </p>
        <p className="mt-3 text-ink-700">
          A trig graph works the same way, and the equation carries both numbers. The trick is
          knowing which is which.
        </p>
        <p className="mt-3 text-ink-700">
          For <MathText text="y = 3 sin(2x)" className="font-bold text-ink-900" />, what is the
          amplitude?
        </p>
        <div className="mt-4 grid gap-2">
          {[
            { k: "b", label: "2 — it is the number attached to x" },
            { k: "a", label: "3" },
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
            Hold that answer. We will test both numbers by substituting angles.
            <div className="mt-3">
              <PrimaryButton onClick={() => go(2)}>Start from plain sine</PrimaryButton>
            </div>
          </div>
        )}
      </Step>

      <Step n={2} title="What plain sine already does" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <p className="text-ink-700">
          You know these values exactly, from the unit circle:
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="mx-auto border-collapse text-center text-sm">
            <thead>
              <tr className="text-xs font-bold uppercase tracking-wide text-ink-500">
                <th className="px-2 pb-1">x</th>
                <th className="px-2 pb-1 text-brand-600">sin x</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["0°", "0"],
                ["90°", "1"],
                ["180°", "0"],
                ["270°", "−1"],
                ["360°", "0"],
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
          So <MathText text="y = sin x" /> swings between −1 and 1, and by 360° it is back where it
          started. Height 1, one full cycle in 360°. Every other wave is this one, adjusted.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(3)}>Change the front number</PrimaryButton>
        </div>
      </Step>

      <Step n={3} title="The number in front stretches the height" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">
          Take <MathText text="y = 3 sin x" />. Every output of <MathText text="sin x" /> gets
          tripled, so at 90° the value is <MathText text="3 * 1 = 3" />, and at 270° it is{" "}
          <MathText text="3 * (−1) = −3" />.
        </p>
        <div className="mt-4">
          <AmplitudePlot />
        </div>
        <p className="mt-3 text-ink-700">
          The wave now swings between −3 and 3. That half-height, 3, is the{" "}
          <strong>amplitude</strong>. Notice what has <em>not</em> changed: it still finishes a full
          cycle at 360°. The front number touches the height and nothing else.
        </p>
        <KeyIdea>
          Amplitude is <MathText text="|a|" /> — the size of the front coefficient. It is always
          positive, because it is a distance from the middle to the peak. A negative{" "}
          <MathText text="a" /> flips the wave upside down but keeps the same amplitude.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(4)}>Now the inside number</PrimaryButton>
        </div>
      </Step>

      <Step n={4} title="The mistake almost everyone makes" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <WrongBox>
          <MathText text="y = sin(2x)" /> is <MathText text="sin x" /> stretched out twice as wide
        </WrongBox>
        <p className="text-ink-700">
          Multiplying by 2 has made everything bigger so far, so &ldquo;wider&rdquo; feels right.
          Stop guessing and substitute.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="mx-auto border-collapse text-center text-sm">
            <thead>
              <tr className="text-xs font-bold uppercase tracking-wide text-ink-500">
                <th className="px-2 pb-1">x</th>
                <th className="px-2 pb-1">2x</th>
                <th className="px-2 pb-1 text-brand-600">sin 2x</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["0°", "0°", "0"],
                ["45°", "90°", "1"],
                ["90°", "180°", "0"],
                ["135°", "270°", "−1"],
                ["180°", "360°", "0"],
              ].map(([a, b, c]) => (
                <tr key={a} className={a === "180°" ? "bg-ok-100" : ""}>
                  <td className="border border-ink-100 px-3 py-1 font-semibold tabular-nums text-ink-700">{a}</td>
                  <td className="border border-ink-100 px-3 py-1 tabular-nums text-ink-500">{b}</td>
                  <td className="border border-ink-100 px-3 py-1 font-bold tabular-nums text-brand-700">{c}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-ink-700">
          The full cycle — up, down, back to zero — is finished by <MathText text="x = 180°" />, not
          360°. The inside 2 makes the angle race ahead twice as fast, so the wave is{" "}
          <strong>squashed</strong>, not stretched. Two complete cycles now fit where one used to.
        </p>
        <div className="mt-4">
          <PeriodPlot />
        </div>
        <p className="mt-3 text-ink-700">
          The peak that <MathText text="sin x" /> reached at 90° now happens at 45°. Everything
          arrives at half the distance, so the cycle length is halved:{" "}
          <MathText text="360 ÷ 2 = 180°" />.
        </p>
        <FormulaBox>
          <MathText text="period = {360°/b}" />
        </FormulaBox>
        <KeyIdea>
          Bigger <MathText text="b" /> means a <strong>shorter</strong> period. It is a division, so
          the number goes down as <MathText text="b" /> goes up — which is exactly backwards from
          what the amplitude coefficient does.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(5)}>Sort the two out</PrimaryButton>
        </div>
      </Step>

      <Step n={5} title="Which number does which job" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">
          Every wave in this topic looks like <MathText text="y = a sin(bx) + c" />, and each letter
          has exactly one job.
        </p>
        <div className="mt-3 space-y-2">
          {[
            ["a — in front", "half-height", "amplitude = |a|"],
            ["b — inside the bracket", "how fast it repeats", "period = 360° ÷ b"],
            ["c — added at the end", "where the middle sits", "midline y = c"],
          ].map(([x, y, z]) => (
            <div key={x} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-bold text-ink-900">
                <MathText text={x} />
              </span>
              <span className="text-xs text-ink-500">{y}</span>
              <span className="text-sm font-bold text-brand-700">
                <MathText text={z} />
              </span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-ink-700">
          So for <MathText text="y = 3 sin(2x)" /> the amplitude is 3 and the period is{" "}
          <MathText text="360 ÷ 2 = 180°" />. The 2 never touches the height and the 3 never touches
          the timing.
        </p>
        <p className="mt-3 text-ink-700">
          Once <MathText text="c" /> is added, the maximum and minimum come straight from it:{" "}
          <MathText text="max = c + a" /> and <MathText text="min = c − a" />, because the wave
          reaches <MathText text="a" /> above and <MathText text="a" /> below its own middle.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(6)}>Worked example</PrimaryButton>
        </div>
      </Step>

      <Step n={6} title="Read everything off one equation" open={step === 6} onOpen={() => go(6)} done={step > 6}>
        <p className="text-ink-700">
          <MathText text="y = 4 sin(3x) − 1" className="font-bold text-ink-900" />. Find the
          amplitude, period, midline, maximum and minimum.
        </p>
        <div className="mt-3 rounded-2xl bg-paper p-4">
          <ol className="space-y-2">
            {[
              ["Front coefficient is 4", "amplitude 4"],
              ["Inside coefficient is 3", "period = 360 ÷ 3 = 120°"],
              ["Added constant is −1", "midline y = −1"],
              ["Maximum: −1 + 4", "3"],
              ["Minimum: −1 − 4", "−5"],
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
        <div className="mt-4">
          <WorkedWavePlot />
        </div>
        <p className="mt-3 text-ink-700">
          Check it by substituting. At <MathText text="x = 30°" /> the bracket is 90°, so{" "}
          <MathText text="sin = 1" /> and <MathText text="y = 4 − 1 = 3" /> ✓. At{" "}
          <MathText text="x = 90°" /> the bracket is 270°, so <MathText text="sin = −1" /> and{" "}
          <MathText text="y = −4 − 1 = −5" /> ✓. At <MathText text="x = 120°" /> the bracket is
          360°, so the wave is back at the midline — one whole cycle in 120°, exactly as predicted.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(7)}>Your turn</PrimaryButton>
        </div>
      </Step>

      <Step n={7} title="You try one" open={step === 7} onOpen={() => go(7)} done={false}>
        <p className="text-ink-700">
          <MathText text="y = 5 cos(4x) + 2" className="font-bold text-ink-900" />. What is the
          period, in degrees?
        </p>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          The period is set by the number <em>inside</em> the bracket, which is{" "}
          <MathText text="4" className="font-bold" />. Ignore the 5 and the 2 — they change the
          height and the middle, not the timing.
        </div>
        <TryIt
          prompt={<>2. Work out 360 ÷ 4. What is the period, in degrees?</>}
          accept={["90"]}
          placeholder="a number"
          value={fade}
          setValue={setFade}
          hint="divide 360 by the inside coefficient — the period gets shorter, not longer."
          explain={
            <>
              The period is <strong>90°</strong>. Check it: at <MathText text="x = 0" /> the bracket
              is 0° so <MathText text="y = 5 + 2 = 7" />, and at <MathText text="x = 90°" /> the
              bracket is 360° so <MathText text="y = 7" /> again — one full cycle in 90°, four of
              them in 360°. The amplitude is 5 and the midline is <MathText text="y = 2" />, giving
              a maximum of 7 and a minimum of −3.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">y = a sin(bx) + c</div>
          <div className="mt-2">1. Amplitude = |a| — the half-height</div>
          <div className="mt-1">2. Period = 360° ÷ b — bigger b, faster wave</div>
          <div className="mt-1">3. Midline = y = c; max = c + a, min = c − a</div>
          <div className="mt-1">4. Unsure? Substitute an angle that makes the bracket 90°</div>
        </div>
        <KeyIdea>
          💡 The number inside the bracket squashes the graph, because it makes the angle grow
          faster than x does. Outside stretches, inside squashes.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
