"use client";

import { useState } from "react";
import { MathText } from "@/components/MathText";
import { Step, KeyIdea, FormulaBox, WrongBox } from "@/components/lesson/Step";
import { LessonShell, TryIt } from "@/components/lesson/LessonShell";
import { PrimaryButton } from "@/components/ui";

/**
 * A right triangle with the angle marked at the bottom left, and the three
 * sides labelled relative to that angle.
 */
function RightTriangle({
  angleLabel,
  opp,
  adj,
  hyp,
  highlight = [],
}: {
  angleLabel: string;
  opp: string;
  adj: string;
  hyp: string;
  /** which sides to draw in the accent colour */
  highlight?: ("opp" | "adj" | "hyp")[];
}) {
  const W = 280;
  const H = 170;
  const ax = 30;
  const ay = 140; // the marked angle
  const bx = 240;
  const by = 140; // right angle corner
  const cx = 240;
  const cy = 30; // top
  const on = (k: "opp" | "adj" | "hyp") => (highlight.includes(k) ? "#7c3aed" : "#94a3b8");
  const w = (k: "opp" | "adj" | "hyp") => (highlight.includes(k) ? 3.2 : 2);
  return (
    <figure className="m-0">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: W }} role="img" aria-label="right triangle with sides labelled relative to the marked angle">
        <polygon points={`${ax},${ay} ${bx},${by} ${cx},${cy}`} fill="#f5f3ff" />
        <line x1={ax} y1={ay} x2={bx} y2={by} stroke={on("adj")} strokeWidth={w("adj")} />
        <line x1={bx} y1={by} x2={cx} y2={cy} stroke={on("opp")} strokeWidth={w("opp")} />
        <line x1={ax} y1={ay} x2={cx} y2={cy} stroke={on("hyp")} strokeWidth={w("hyp")} />
        {/* right-angle square */}
        <polyline points={`${bx - 12},${by} ${bx - 12},${by - 12} ${bx},${by - 12}`} fill="none" stroke="#6b7280" strokeWidth="1.4" />
        {/* the marked angle */}
        <path d={`M ${ax + 30} ${ay} A 30 30 0 0 0 ${ax + 26.9} ${ay - 13.3}`} fill="none" stroke="#dc2626" strokeWidth="2" />
        <text x={ax + 36} y={ay - 8} fontSize="12" fontWeight="700" fill="#dc2626">
          {angleLabel}
        </text>
        <text x={(ax + bx) / 2} y={ay + 18} fontSize="11" fontWeight="700" textAnchor="middle" fill={on("adj")}>
          {adj}
        </text>
        <text x={bx + 4} y={(by + cy) / 2} fontSize="11" fontWeight="700" fill={on("opp")}>
          {opp}
        </text>
        <text x={(ax + cx) / 2 - 14} y={(ay + cy) / 2 - 6} fontSize="11" fontWeight="700" textAnchor="middle" fill={on("hyp")}>
          {hyp}
        </text>
      </svg>
    </figure>
  );
}

/**
 * Right-triangle trigonometry.
 *
 * Two errors are attacked. The first is choosing sin, cos or tan by feel: the
 * 3-4-5 triangle shows the three ratios are three different numbers, so the
 * choice cannot be arbitrary. The second is the calculator left in radians,
 * which is caught by a sanity check a student can actually run.
 */
export function RightTriangleTrigLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 10 · Trigonometry · Right-Triangle Trig"
      title="Measuring what you cannot reach"
      minutes={7}
      step={step}
      total={7}
    >
      <Step n={1} title="How tall is that tree?" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          You stand 20 m from a tree and look up at the top. The angle of your gaze above the
          horizontal is 35°. Nobody is climbing anything.
        </p>
        <p className="mt-3 text-ink-700">
          Two facts about a triangle, and the third comes out. That is the whole business of
          trigonometry.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(2)}>What do I already have?</PrimaryButton></div>
      </Step>

      <Step n={2} title="Pythagoras got you halfway" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <p className="text-ink-700">
          You already know <MathText text="a^2 + b^2 = c^2" />: give it two sides and it hands back
          the third. A 3-4-5 triangle checks out —{" "}
          <MathText text="9 + 16 = 25" />.
        </p>
        <p className="mt-3 text-ink-700">
          But Pythagoras is blind to <em>angles</em>. It cannot use your 35°, and it cannot tell you
          one. Trigonometry is the part that connects an angle to the sides.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(3)}>Show me the connection</PrimaryButton></div>
      </Step>

      <Step n={3} title="Name the sides from where you stand" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">
          The three sides get names, but only <strong>relative to the angle you are using</strong>.
        </p>
        <div className="mt-3">
          <RightTriangle angleLabel="θ" opp="opposite" adj="adjacent" hyp="hypotenuse" />
        </div>
        <div className="mt-3 space-y-2">
          {[
            ["hypotenuse", "the long one, always across from the right angle — it never changes"],
            ["opposite", "the side facing θ, across the triangle from it"],
            ["adjacent", "the other short side, touching θ"],
          ].map(([a, b]) => (
            <div key={a} className="rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-bold text-ink-900">{a}</span>
              <span className="ml-2 text-sm text-ink-700">— {b}</span>
            </div>
          ))}
        </div>
        <KeyIdea>
          Move to the other angle and opposite and adjacent <strong>swap</strong>. Only the
          hypotenuse stays put. Label the picture before you do anything else.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(4)}>Now which ratio?</PrimaryButton></div>
      </Step>

      <Step n={4} title="The mistake almost everyone makes" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <WrongBox>Pick sin, cos or tan and hope</WrongBox>
        <p className="text-ink-700">
          Under time pressure the three names blur together and the choice becomes a coin toss. Test
          whether it matters, on a triangle where every number is exact — the 3-4-5.
        </p>
        <div className="mt-3">
          <RightTriangle angleLabel="θ" opp="3" adj="4" hyp="5" highlight={["opp", "adj", "hyp"]} />
        </div>
        <div className="mt-3 space-y-2">
          {[
            ["sin θ = {opp/hyp} = {3/5}", "0.6"],
            ["cos θ = {adj/hyp} = {4/5}", "0.8"],
            ["tan θ = {opp/adj} = {3/4}", "0.75"],
          ].map(([a, b]) => (
            <div key={a} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-semibold text-ink-900"><MathText text={a} /></span>
              <span className="text-sm font-bold text-brand-700">{b}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-ink-700">
          Three different numbers from the same triangle and the same angle. Guessing gives you a
          two-in-three chance of the wrong side. The choice is not a matter of taste — it is
          decided entirely by <strong>which two sides the question involves</strong>.
        </p>

        <WrongBox>
          <MathText text="sin 30° = −0.988" />
        </WrongBox>
        <p className="text-ink-700">
          The second classic, and it is not your maths — it is your calculator sitting in radian
          mode, reading &ldquo;30&rdquo; as 30 radians instead of 30 degrees.
        </p>
        <p className="mt-3 text-ink-700">
          You can catch it without knowing any values. In a right triangle every side is a positive
          length, so <MathText text="{opp/hyp}" /> can never be negative. A negative sine of an acute
          angle is impossible. Nor can it exceed 1 — the opposite side is always shorter than the
          hypotenuse.
        </p>
        <KeyIdea>
          Check <MathText text="sin 30°" /> before every session. If it does not say exactly{" "}
          <strong>0.5</strong>, switch the calculator to DEG and start again.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(5)}>So how do I choose?</PrimaryButton></div>
      </Step>

      <Step n={5} title="Let the known sides choose for you" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <FormulaBox>
          <div className="text-base"><MathText text="sin θ = {opposite/hypotenuse}" /></div>
          <div className="mt-1 text-base"><MathText text="cos θ = {adjacent/hypotenuse}" /></div>
          <div className="mt-1 text-base"><MathText text="tan θ = {opposite/adjacent}" /></div>
        </FormulaBox>
        <p className="text-ink-700">
          Each ratio owns exactly one pair of sides. So mark which two sides the question mentions —
          one you know, one you want — and only one of the three can possibly be used.
        </p>
        <div className="mt-3 space-y-2">
          {[
            ["opposite and hypotenuse", "sin"],
            ["adjacent and hypotenuse", "cos"],
            ["opposite and adjacent", "tan"],
          ].map(([a, b]) => (
            <div key={a} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-semibold text-ink-900">the two sides are {a}</span>
              <span className="text-sm font-bold text-brand-700">use {b}</span>
            </div>
          ))}
        </div>
        <KeyIdea>
          <strong>SOH-CAH-TOA</strong> is only a way of remembering that table. The table is the
          thing: two sides in, one name out.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(6)}>Worked examples</PrimaryButton></div>
      </Step>

      <Step n={6} title="A side, then an angle" open={step === 6} onOpen={() => go(6)} done={step > 6}>
        <p className="font-bold text-ink-900">
          A ramp makes a 30° angle with the ground. Its sloping surface is 10 m long. How high is the
          top end?
        </p>
        <div className="mt-3">
          <RightTriangle angleLabel="30°" opp="? " adj="" hyp="10" highlight={["opp", "hyp"]} />
        </div>
        <div className="mt-3 rounded-2xl bg-paper p-4">
          <ol className="space-y-2">
            {[
              ["The height faces the 30°, so it is the opposite; 10 is the hypotenuse", "opp and hyp → sin"],
              ["Write the ratio", "sin 30° = {opp/10}"],
              ["sin 30° is exactly", "0.5"],
              ["So opp = 10 * 0.5", "5 m"],
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
            Sensible? The height must be less than the 10 m slope, and 5 is. ✓
          </p>
        </div>

        <p className="mt-4 font-bold text-ink-900">Now the other direction: find the angle.</p>
        <p className="mt-1 text-ink-700">
          In the 3-4-5 triangle, what is <MathText text="θ" />?
        </p>
        <div className="mt-3 rounded-2xl bg-paper p-4">
          <ol className="space-y-2">
            {[
              ["You know opposite 3 and adjacent 4", "opp and adj → tan"],
              ["tan θ = {3/4}", "0.75"],
              ["Undo the tan with the inverse key", "θ = tan^{−1}(0.75)"],
              ["", "≈ 36.87°"],
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
            Sensible? The opposite side is shorter than the adjacent, so θ must be under 45°. ✓ (If
            your calculator said 0.6435, it is in radians again.)
          </p>
        </div>
        <div className="mt-4"><PrimaryButton onClick={() => go(7)}>Your turn</PrimaryButton></div>
      </Step>

      <Step n={7} title="You try one" open={step === 7} onOpen={() => go(7)} done={false}>
        <p className="text-ink-700">
          A 12 m guy wire runs from the ground to the top of a mast, making a 60° angle with the
          ground. How far from the base of the mast is it anchored?
        </p>
        <div className="mt-3">
          <RightTriangle angleLabel="60°" opp="" adj="?" hyp="12" highlight={["adj", "hyp"]} />
        </div>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          The ground distance touches the 60° angle, so it is the <strong>adjacent</strong>. With
          the hypotenuse 12, that pair means <strong>cos</strong>. And{" "}
          <MathText text="cos 60° = 0.5" /> exactly.
        </div>
        <TryIt
          prompt={<>2. Work out the distance in metres.</>}
          accept={["6"]}
          placeholder="metres"
          value={fade}
          setValue={setFade}
          hint="cos 60° = adj ÷ 12, so adj = 12 × 0.5."
          explain={
            <>
              <MathText text="12 * 0.5 = 6" /> m. Check it is sensible: the anchor must be closer
              than the 12 m wire is long, and 6 &lt; 12 ✓. Note that using sin instead would have
              given <MathText text="12 * 0.866 ≈ 10.4" /> — the mast height, not the ground
              distance.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Right-triangle trig</div>
          <div className="mt-2">1. Label opposite, adjacent, hypotenuse from the angle you are using</div>
          <div className="mt-1">2. Mark the side you know and the side you want</div>
          <div className="mt-1">3. That pair names the ratio — SOH CAH TOA</div>
          <div className="mt-1">4. Finding an angle? Use sin⁻¹, cos⁻¹ or tan⁻¹</div>
          <div className="mt-1">5. Check sin 30° = 0.5 to prove you are in degrees</div>
        </div>
        <KeyIdea>
          💡 Never choose the ratio by feel. The two sides in the question choose it for you, and
          they are never ambiguous.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
