"use client";

import { useState } from "react";
import { MathText } from "@/components/MathText";
import { Step, KeyIdea, FormulaBox, WrongBox } from "@/components/lesson/Step";
import { LessonShell, TryIt } from "@/components/lesson/LessonShell";
import { PrimaryButton } from "@/components/ui";

/**
 * The unit circle with one angle drawn, its point marked, and the two legs
 * shown so that "cos is the across, sin is the up" is visible rather than
 * asserted.
 */
function UnitCircleDiagram({
  angle,
  pointLabel,
  showLegs = true,
  size = 240,
}: {
  /** angle in degrees, measured anticlockwise from the positive x-axis */
  angle: number;
  pointLabel?: string;
  showLegs?: boolean;
  size?: number;
}) {
  const c = size / 2;
  const r = size / 2 - 30;
  const t = (angle * Math.PI) / 180;
  const x = c + r * Math.cos(t);
  const y = c - r * Math.sin(t);
  const arcEnd = { x: c + 34 * Math.cos(t), y: c - 34 * Math.sin(t) };
  const large = angle > 180 ? 1 : 0;
  return (
    <figure className="m-0">
      <svg viewBox={`0 0 ${size} ${size}`} width="100%" style={{ maxWidth: size }} role="img" aria-label={`unit circle with the angle ${angle} degrees drawn`}>
        <line x1={4} y1={c} x2={size - 4} y2={c} stroke="#94a3b8" strokeWidth="1.4" />
        <line x1={c} y1={4} x2={c} y2={size - 4} stroke="#94a3b8" strokeWidth="1.4" />
        <circle cx={c} cy={c} r={r} fill="none" stroke="#c4b5fd" strokeWidth="2" />
        {showLegs && (
          <>
            <line x1={c} y1={c} x2={x} y2={c} stroke="#0d9488" strokeWidth="3" />
            <line x1={x} y1={c} x2={x} y2={y} stroke="#dc2626" strokeWidth="3" />
            <text x={(c + x) / 2} y={c + 15} fontSize="11" fontWeight="700" textAnchor="middle" fill="#0d9488">
              cos = x
            </text>
            <text x={x + (x > c ? 6 : -6)} y={(c + y) / 2} fontSize="11" fontWeight="700" textAnchor={x > c ? "start" : "end"} fill="#dc2626">
              sin = y
            </text>
          </>
        )}
        <line x1={c} y1={c} x2={x} y2={y} stroke="#7c3aed" strokeWidth="2.4" />
        <path d={`M ${c + 34} ${c} A 34 34 0 ${large} 0 ${arcEnd.x} ${arcEnd.y}`} fill="none" stroke="#7c3aed" strokeWidth="1.8" />
        <circle cx={x} cy={y} r="5" fill="#7c3aed" />
        {pointLabel && (
          <text x={x + (x > c ? 8 : -8)} y={y + (y < c ? -8 : 16)} fontSize="11" fontWeight="700" textAnchor={x > c ? "start" : "end"} fill="#4c1d95">
            {pointLabel}
          </text>
        )}
        <text x={size - 10} y={c - 6} fontSize="10" textAnchor="end" fill="#6b7280">
          1
        </text>
        <text x={c + 5} y={12} fontSize="10" fill="#6b7280">
          1
        </text>
      </svg>
    </figure>
  );
}

const EXACT_ROWS: [string, string, string][] = [
  ["0°", "1", "0"],
  ["30°", "√3/2", "1/2"],
  ["45°", "√2/2", "√2/2"],
  ["60°", "1/2", "√3/2"],
  ["90°", "0", "1"],
  ["180°", "−1", "0"],
];

/**
 * The unit circle.
 *
 * The error is swapping the coordinates — reading sin as the x. It is fixed
 * here by deriving them rather than naming them: on a circle of radius 1 the
 * hypotenuse is 1, so cos θ = adjacent/1 is literally the horizontal leg.
 */
export function UnitCircleLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 11 · Trigonometry · The Unit Circle"
      title="Trig for angles bigger than a triangle allows"
      minutes={7}
      step={step}
      total={7}
    >
      <Step n={1} title="A problem with triangles" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          In a right triangle, the angles you can use are stuck between 0° and 90°. Anything bigger
          and the triangle falls apart.
        </p>
        <p className="mt-3 text-ink-700">
          Yet <MathText text="sin 150°" /> and <MathText text="cos 210°" /> are real, useful numbers
          — waves, orbits and alternating current all need them. Something has to replace the
          triangle.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(2)}>What replaces it?</PrimaryButton></div>
      </Step>

      <Step n={2} title="A circle of radius exactly 1" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <p className="text-ink-700">
          Draw a circle of radius 1 around the origin. Start at the far right and walk anticlockwise
          by <MathText text="θ" />. You are standing on a point.
        </p>
        <div className="mt-3">
          <UnitCircleDiagram angle={60} pointLabel="(cos θ, sin θ)" />
        </div>
        <p className="mt-3 text-ink-700">
          Drop a line straight down to the axis and you have a right triangle again — with a
          hypotenuse of exactly 1.
        </p>
        <div className="mt-3 space-y-2">
          {[
            ["cos θ = {adjacent/hypotenuse} = {across/1}", "= the across"],
            ["sin θ = {opposite/hypotenuse} = {up/1}", "= the up"],
          ].map(([a, b]) => (
            <div key={a} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-semibold text-ink-900"><MathText text={a} /></span>
              <span className="text-sm font-bold text-brand-700">{b}</span>
            </div>
          ))}
        </div>
        <KeyIdea>
          Because the hypotenuse is 1, dividing by it changes nothing. The ratios{" "}
          <em>become</em> the coordinates.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(3)}>So the point is…</PrimaryButton></div>
      </Step>

      <Step n={3} title="The point is (cos θ, sin θ)" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <FormulaBox>
          <MathText text="(x, y) = (cos θ, sin θ)" />
        </FormulaBox>
        <p className="text-ink-700">
          That single line is the whole unit circle. Every value you will ever be asked for is a
          coordinate of a point on it — and now nothing stops <MathText text="θ" /> being 150°, 300°
          or 1000°.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(4)}>Careful here</PrimaryButton></div>
      </Step>

      <Step n={4} title="The mistake almost everyone makes" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <WrongBox>
          the point is <MathText text="(sin θ, cos θ)" />
        </WrongBox>
        <p className="text-ink-700">
          A fifty-fifty guess that people get wrong constantly, because sin is usually said first
          out loud. Test it at the easiest angle there is: <MathText text="θ = 0°" />.
        </p>
        <div className="mt-3">
          <UnitCircleDiagram angle={0} pointLabel="(1, 0)" showLegs={false} size={200} />
        </div>
        <p className="mt-3 text-ink-700">
          At 0° you have not moved. You are at the far right of the circle:{" "}
          <MathText text="(1, 0)" />.
        </p>
        <div className="mt-3 space-y-2">
          {[
            ["Correct reading (cos, sin)", "cos 0° = 1, sin 0° = 0"],
            ["Swapped reading (sin, cos)", "claims sin 0° = 1"],
          ].map(([a, b], i) => (
            <div key={i} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-semibold text-ink-900">{a}</span>
              <span className={`text-sm font-bold ${i === 0 ? "text-ok-600" : "text-err-600"}`}>
                <MathText text={b} />
              </span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-ink-700">
          The swapped reading says that at zero degrees you are already at the top of the circle,
          having turned nothing at all. It cannot be right.
        </p>
        <KeyIdea>
          <strong>cos</strong> comes before <strong>sin</strong> alphabetically, exactly as{" "}
          <strong>x</strong> comes before <strong>y</strong>. And there is a reason underneath:
          &ldquo;adjacent&rdquo; is the horizontal leg.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(5)}>The values</PrimaryButton></div>
      </Step>

      <Step n={5} title="Reference angle for size, quadrant for sign" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">
          You only ever need the first-quadrant values. Everything else is one of these with a sign
          attached.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="mx-auto border-collapse text-center text-sm">
            <thead>
              <tr className="text-xs font-bold uppercase tracking-wide text-ink-500">
                <th className="px-2 pb-1">θ</th>
                <th className="px-2 pb-1" style={{ color: "#0d9488" }}>cos θ (x)</th>
                <th className="px-2 pb-1" style={{ color: "#dc2626" }}>sin θ (y)</th>
              </tr>
            </thead>
            <tbody>
              {EXACT_ROWS.map(([a, cv, sv]) => (
                <tr key={a}>
                  <td className="border border-ink-100 px-3 py-1 font-bold text-ink-900">{a}</td>
                  <td className="border border-ink-100 px-3 py-1 font-semibold" style={{ color: "#0d9488" }}>
                    <MathText text={cv} />
                  </td>
                  <td className="border border-ink-100 px-3 py-1 font-semibold" style={{ color: "#dc2626" }}>
                    <MathText text={sv} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-ink-700">
          The signs are not a rule to learn — they are just which side of the axes you are standing
          on.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {[
            ["Quadrant II (90°–180°)", "x negative, y positive", "cos −, sin +"],
            ["Quadrant I (0°–90°)", "x positive, y positive", "both +"],
            ["Quadrant III (180°–270°)", "x negative, y negative", "both −"],
            ["Quadrant IV (270°–360°)", "x positive, y negative", "cos +, sin −"],
          ].map(([a, b, c]) => (
            <div key={a} className="rounded-xl bg-paper px-3 py-2">
              <div className="text-xs font-bold text-ink-900">{a}</div>
              <div className="mt-1 text-xs text-ink-500">{b}</div>
              <div className="mt-1 text-sm font-bold text-brand-700">{c}</div>
            </div>
          ))}
        </div>
        <KeyIdea>
          The <strong>reference angle</strong> is the acute angle to the nearest part of the x-axis.
          It gives the size. The quadrant gives the sign. Two easy questions instead of one hard one.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(6)}>Worked example</PrimaryButton></div>
      </Step>

      <Step n={6} title="Find cos 150°" open={step === 6} onOpen={() => go(6)} done={step > 6}>
        <div className="mt-1">
          <UnitCircleDiagram angle={150} pointLabel="(−√3/2, 1/2)" />
        </div>
        <div className="mt-3 rounded-2xl bg-paper p-4">
          <ol className="space-y-2">
            {[
              ["150° lands in", "quadrant II"],
              ["Reference angle: 180° − 150°", "30°"],
              ["Size: cos 30°", "{√3/2}"],
              ["Sign: in quadrant II the x is negative", "−{√3/2}"],
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
          <p className="mt-2 text-center text-sm text-ink-700">
            Check on the picture: the point is left of the vertical axis, so its x must be negative
            ✓
          </p>
        </div>
        <div className="mt-4"><PrimaryButton onClick={() => go(7)}>Your turn</PrimaryButton></div>
      </Step>

      <Step n={7} title="You try one" open={step === 7} onOpen={() => go(7)} done={false}>
        <p className="text-ink-700">
          Find <MathText text="sin 210°" className="font-bold text-ink-900" />.
        </p>
        <div className="mt-2">
          <UnitCircleDiagram angle={210} pointLabel="( ? , ? )" size={200} />
        </div>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          210° is in quadrant III, and its reference angle is{" "}
          <MathText text="210° − 180° = 30°" className="font-bold" />. You need{" "}
          <MathText text="sin 30° = {1/2}" />, then the sign.
        </div>
        <TryIt
          prompt={<>2. Type the exact value (like 1/2 or -1/2):</>}
          accept={["-1/2", "−1/2"]}
          placeholder="like 1/2"
          value={fade}
          setValue={setFade}
          hint="sin is the y-coordinate, and in quadrant III the point is below the axis."
          explain={
            <>
              <MathText text="sin 210° = −{1/2}" />. The point sits below the horizontal axis, so
              its y — and therefore its sine — must be negative.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">The unit circle</div>
          <div className="mt-2">1. The point is (cos θ, sin θ) — cos across, sin up</div>
          <div className="mt-1">2. Reference angle gives the size</div>
          <div className="mt-1">3. Quadrant gives the sign</div>
          <div className="mt-1">4. Learn only 30°, 45°, 60° — the rest are copies</div>
        </div>
        <KeyIdea>
          💡 When you cannot remember a sign, sketch the circle and look at which side of the axes
          the point is on. It takes five seconds and it is never wrong.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}

/**
 * Trigonometric identities.
 *
 * The deepest error here is treating sin as a number that multiplies its
 * angle — the same misreading as f(x) meaning f times x. Disproving
 * sin 2θ = 2 sin θ at θ = 30° settles it with exact values.
 */
export function TrigIdentityLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 12 · Trigonometry · Identities"
      title="One equation true for every angle"
      minutes={7}
      step={step}
      total={7}
    >
      <Step n={1} title="An equation with no solution to find" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          <MathText text="2x + 1 = 7" /> is true for one value of <MathText text="x" />. You solve
          it and you are done.
        </p>
        <p className="mt-3 text-ink-700">
          <MathText text="sin^2 θ + cos^2 θ = 1" className="font-bold text-ink-900" /> is different.
          It is true for <em>every</em> angle. There is nothing to solve — it is a tool.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(2)}>Why is it true?</PrimaryButton></div>
      </Step>

      <Step n={2} title="It is Pythagoras in disguise" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <p className="text-ink-700">
          On the unit circle the point is <MathText text="(cos θ, sin θ)" />, and it sits on a circle
          of radius 1. The two legs and the radius form a right triangle.
        </p>
        <div className="mt-3">
          <UnitCircleDiagram angle={55} pointLabel="(cos θ, sin θ)" />
        </div>
        <div className="mt-3 space-y-2">
          {[
            ["Pythagoras on that triangle", "(cos θ)^2 + (sin θ)^2 = 1^2"],
            ["Written the usual way", "sin^2 θ + cos^2 θ = 1"],
          ].map(([a, b]) => (
            <div key={a} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-semibold text-ink-900">{a}</span>
              <span className="text-sm font-bold text-brand-700"><MathText text={b} /></span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-ink-700">
          Check it exactly at 30°: <MathText text="sin 30° = {1/2}" /> and{" "}
          <MathText text="cos 30° = {√3/2}" />, so{" "}
          <MathText text="{1/4} + {3/4} = 1" /> ✓
        </p>
        <KeyIdea>
          <MathText text="sin^2 θ" /> is shorthand for <MathText text="(sin θ)^2" /> — square the
          answer, not the angle.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(3)}>The new problem</PrimaryButton></div>
      </Step>

      <Step n={3} title="Simplifying with an identity" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">
          Identities earn their keep when an ugly expression collapses. Simplify{" "}
          <MathText text="{1 − cos^2 θ/sin θ}" className="font-bold text-ink-900" />.
        </p>
        <p className="mt-3 text-ink-700">
          Before doing that, there is a habit that ruins this whole topic, and it is worth killing
          first.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(4)}>Go on</PrimaryButton></div>
      </Step>

      <Step n={4} title="The mistake almost everyone makes" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <WrongBox>
          <MathText text="sin 2θ = 2 sin θ" />
        </WrongBox>
        <p className="text-ink-700">
          The reasoning is that <MathText text="sin" /> is sitting in front of{" "}
          <MathText text="2θ" /> like a coefficient, so it should distribute. Exactly the same
          instinct as reading <MathText text="f(x)" /> as <MathText text="f * x" />.
        </p>
        <p className="mt-3 text-ink-700">
          Test it at <MathText text="θ = 30°" />, where both sides are exact.
        </p>
        <div className="mt-3 space-y-2">
          {[
            ["Left: sin(2 * 30°) = sin 60°", "{√3/2} ≈ 0.866"],
            ["Right: 2 sin 30° = 2 * {1/2}", "1"],
          ].map(([a, b]) => (
            <div key={a} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-semibold text-ink-900"><MathText text={a} /></span>
              <span className="text-sm font-bold text-err-600"><MathText text={b} /></span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-center text-lg font-bold text-err-600">
          <MathText text="0.866 ≠ 1" />
        </p>
        <p className="mt-3 text-ink-700">
          Here is the clincher: try <MathText text="θ = 90°" />. Then{" "}
          <MathText text="sin 180° = 0" /> but <MathText text="2 sin 90° = 2" />. Zero against two —
          the rule is not slightly off, it is not a rule at all.
        </p>
        <KeyIdea>
          <MathText text="sin" /> is the <strong>name of a machine</strong>, not a number. You may
          never pull it through a bracket, split it over a sum, or cancel it.{" "}
          <MathText text="sin θ" /> is one indivisible thing.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(5)}>The toolkit</PrimaryButton></div>
      </Step>

      <Step n={5} title="Three identities do most of the work" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <FormulaBox>
          <div className="text-base"><MathText text="sin^2 θ + cos^2 θ = 1" /></div>
          <div className="mt-1 text-base"><MathText text="tan θ = {sin θ/cos θ}" /></div>
          <div className="mt-1 text-base"><MathText text="sin 2θ = 2 sin θ cos θ" /></div>
        </FormulaBox>
        <p className="text-ink-700">
          The first one is worth carrying around in three shapes, because you rarely meet it in the
          form you need:
        </p>
        <div className="mt-3 space-y-2">
          {[
            ["sin^2 θ + cos^2 θ = 1", "as given"],
            ["sin^2 θ = 1 − cos^2 θ", "rearranged for sin"],
            ["cos^2 θ = 1 − sin^2 θ", "rearranged for cos"],
          ].map(([a, b]) => (
            <div key={a} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-bold text-ink-900"><MathText text={a} /></span>
              <span className="text-sm text-ink-500">{b}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-ink-700">
          Check the quotient identity exactly at 30°:{" "}
          <MathText text="{sin 30°/cos 30°} = {{1/2}/{√3/2}} = {1/√3} = {√3/3}" />, and{" "}
          <MathText text="tan 30° = {√3/3}" /> ✓
        </p>
        <p className="mt-3 text-ink-700">
          And the double-angle one at 30°:{" "}
          <MathText text="2 sin 30° cos 30° = 2 * {1/2} * {√3/2} = {√3/2} = sin 60°" /> ✓ — this is
          what the broken rule was reaching for.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(6)}>Worked example</PrimaryButton></div>
      </Step>

      <Step n={6} title="Simplify it" open={step === 6} onOpen={() => go(6)} done={step > 6}>
        <p className="text-ink-700">
          Simplify <MathText text="{1 − cos^2 θ/sin θ}" className="font-bold text-ink-900" />.
        </p>
        <div className="mt-3 rounded-2xl bg-paper p-4">
          <ol className="space-y-2">
            {[
              ["Spot 1 − cos^2 θ on the top", "= sin^2 θ"],
              ["Rewrite", "{sin^2 θ/sin θ}"],
              ["Cancel one sin θ", "sin θ"],
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
            Test it at 30°: top is <MathText text="1 − {3/4} = {1/4}" />, bottom is{" "}
            <MathText text="{1/2}" />, so the value is{" "}
            <MathText text="{{1/4}/{1/2}} = {1/2}" /> — which is exactly{" "}
            <MathText text="sin 30°" /> ✓
          </p>
        </div>
        <KeyIdea>
          Always test a simplification at 30° or 45°. If the two sides disagree there, you have made
          a slip — and you find out in ten seconds instead of at the end of the paper.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(7)}>Your turn</PrimaryButton></div>
      </Step>

      <Step n={7} title="You try one" open={step === 7} onOpen={() => go(7)} done={false}>
        <p className="text-ink-700">
          <MathText text="cos θ = {3/5}" /> and <MathText text="θ" /> is in quadrant I. Find{" "}
          <MathText text="sin θ" className="font-bold text-ink-900" />.
        </p>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          Use <MathText text="sin^2 θ = 1 − cos^2 θ" className="font-bold" />:{" "}
          <MathText text="1 − {9/25} = {16/25}" />. In quadrant I the sine is positive.
        </div>
        <TryIt
          prompt={<>2. Take the square root. What is sin θ? (like 4/5)</>}
          accept={["4/5"]}
          placeholder="like 4/5"
          value={fade}
          setValue={setFade}
          hint="the square root of 16/25 — root the top and the bottom separately."
          explain={
            <>
              <MathText text="sin θ = {4/5}" />. Check:{" "}
              <MathText text="{16/25} + {9/25} = {25/25} = 1" /> ✓. You may recognise the 3-4-5
              triangle hiding inside.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Trig identities</div>
          <div className="mt-2">1. sin is a name, not a multiplier — never distribute it</div>
          <div className="mt-1">2. sin²θ + cos²θ = 1, in all three rearrangements</div>
          <div className="mt-1">3. tan θ = sin θ ÷ cos θ</div>
          <div className="mt-1">4. sin 2θ = 2 sin θ cos θ — not 2 sin θ</div>
          <div className="mt-1">5. Test any identity at 30° before you trust it</div>
        </div>
        <KeyIdea>
          💡 An identity is a licence to swap one expression for another, anywhere, for any angle.
          That is why it is worth more than a solution.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
