"use client";

import { useState } from "react";
import { MathText } from "@/components/MathText";
import { Step, KeyIdea, FormulaBox, WrongBox } from "@/components/lesson/Step";
import { LessonShell, TryIt } from "@/components/lesson/LessonShell";
import { PrimaryButton } from "@/components/ui";

/**
 * A single vector drawn from the origin with its two components dashed in.
 * The whole vectors topic rests on seeing that the arrow and its two legs are
 * a right-angled triangle, so this picture is worth drawing properly.
 */
function VectorArrowPlot({
  vx,
  vy,
  lenLabel,
  xLabel,
  yLabel,
  id,
}: {
  vx: number;
  vy: number;
  lenLabel: string;
  xLabel: string;
  yLabel: string;
  id: string;
}) {
  const W = 280;
  const H = 230;
  const xMin = -1;
  const xMax = 6;
  const yMin = -1;
  const yMax = 6;
  const px = (x: number) => ((x - xMin) / (xMax - xMin)) * W;
  const py = (y: number) => H - ((y - yMin) / (yMax - yMin)) * H;
  return (
    <figure className="m-0">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style={{ maxWidth: W }}
        role="img"
        aria-label={`an arrow from the origin across ${vx} and up ${vy}, with its two components drawn as dashed legs`}
      >
        <defs>
          <marker id={`${id}-head`} markerWidth="9" markerHeight="9" refX="7" refY="3.2" orient="auto">
            <path d="M0,0 L7,3.2 L0,6.4 z" fill="#7c3aed" />
          </marker>
        </defs>
        {[0, 1, 2, 3, 4, 5].map((v) => (
          <line key={`v${v}`} x1={px(v)} y1={0} x2={px(v)} y2={H} stroke="#f3f4f6" strokeWidth="1" />
        ))}
        {[0, 1, 2, 3, 4, 5].map((v) => (
          <line key={`h${v}`} x1={0} y1={py(v)} x2={W} y2={py(v)} stroke="#f3f4f6" strokeWidth="1" />
        ))}
        <line x1={px(xMin)} y1={py(0)} x2={px(xMax)} y2={py(0)} stroke="#94a3b8" strokeWidth="1.4" />
        <line x1={px(0)} y1={py(yMin)} x2={px(0)} y2={py(yMax)} stroke="#94a3b8" strokeWidth="1.4" />

        <line
          x1={px(0)}
          y1={py(0)}
          x2={px(vx)}
          y2={py(0)}
          stroke="#0d9488"
          strokeWidth="2"
          strokeDasharray="5 3"
        />
        <line
          x1={px(vx)}
          y1={py(0)}
          x2={px(vx)}
          y2={py(vy)}
          stroke="#f59e0b"
          strokeWidth="2"
          strokeDasharray="5 3"
        />
        <rect x={px(vx) - 12} y={py(0) - 12} width="12" height="12" fill="none" stroke="#94a3b8" strokeWidth="1" />
        <line
          x1={px(0)}
          y1={py(0)}
          x2={px(vx)}
          y2={py(vy)}
          stroke="#7c3aed"
          strokeWidth="2.8"
          markerEnd={`url(#${id}-head)`}
        />
        <circle cx={px(0)} cy={py(0)} r="3.5" fill="#111827" />
        <text x={px(vx / 2)} y={py(0) + 15} fontSize="11" fontWeight="700" textAnchor="middle" fill="#0d9488">
          {xLabel}
        </text>
        <text x={px(vx) + 6} y={py(vy / 2)} fontSize="11" fontWeight="700" fill="#f59e0b">
          {yLabel}
        </text>
        <text x={px(vx / 2) - 30} y={py(vy / 2) - 4} fontSize="12" fontWeight="700" fill="#7c3aed">
          {lenLabel}
        </text>
      </svg>
    </figure>
  );
}

/** Two vectors laid tip to tail, so the resultant is visibly one journey. */
function TipToTailPlot() {
  const W = 280;
  const H = 200;
  const xMin = -1;
  const xMax = 9;
  const yMin = -1;
  const yMax = 6;
  const px = (x: number) => ((x - xMin) / (xMax - xMin)) * W;
  const py = (y: number) => H - ((y - yMin) / (yMax - yMin)) * H;
  return (
    <figure className="m-0">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style={{ maxWidth: W }}
        role="img"
        aria-label="two arrows joined tip to tail and the single arrow that replaces them"
      >
        <defs>
          <marker id="tt-a" markerWidth="9" markerHeight="9" refX="7" refY="3.2" orient="auto">
            <path d="M0,0 L7,3.2 L0,6.4 z" fill="#0d9488" />
          </marker>
          <marker id="tt-b" markerWidth="9" markerHeight="9" refX="7" refY="3.2" orient="auto">
            <path d="M0,0 L7,3.2 L0,6.4 z" fill="#f59e0b" />
          </marker>
          <marker id="tt-r" markerWidth="9" markerHeight="9" refX="7" refY="3.2" orient="auto">
            <path d="M0,0 L7,3.2 L0,6.4 z" fill="#7c3aed" />
          </marker>
        </defs>
        <line x1={px(xMin)} y1={py(0)} x2={px(xMax)} y2={py(0)} stroke="#94a3b8" strokeWidth="1.4" />
        <line x1={px(0)} y1={py(yMin)} x2={px(0)} y2={py(yMax)} stroke="#94a3b8" strokeWidth="1.4" />
        <line
          x1={px(0)}
          y1={py(0)}
          x2={px(6)}
          y2={py(1)}
          stroke="#0d9488"
          strokeWidth="2.6"
          markerEnd="url(#tt-a)"
        />
        <line
          x1={px(6)}
          y1={py(1)}
          x2={px(4)}
          y2={py(4)}
          stroke="#f59e0b"
          strokeWidth="2.6"
          markerEnd="url(#tt-b)"
        />
        <line
          x1={px(0)}
          y1={py(0)}
          x2={px(4)}
          y2={py(4)}
          stroke="#7c3aed"
          strokeWidth="2.8"
          strokeDasharray="6 4"
          markerEnd="url(#tt-r)"
        />
        <text x={px(3)} y={py(0.5) + 16} fontSize="11" fontWeight="700" fill="#0d9488">
          u = (6, 1)
        </text>
        <text x={px(5.1)} y={py(2.6)} fontSize="11" fontWeight="700" fill="#f59e0b">
          v = (−2, 3)
        </text>
        <text x={px(0.4)} y={py(3.1)} fontSize="11" fontWeight="700" fill="#7c3aed">
          u + v = (4, 4)
        </text>
      </svg>
    </figure>
  );
}

/**
 * Vectors: components, addition and magnitude.
 *
 * The misconception is the one that ruins every displacement question — adding
 * the lengths instead of the components, so 3 km east then 4 km north comes
 * out as 7 km. It is disproved with a right-angled triangle the student has
 * known since Grade 8, and then repaired by separating the two directions.
 */
export function VectorBasicsLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [guess, setGuess] = useState<string | null>(null);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 12 · Vectors · Components and magnitude"
      title="Two numbers, one arrow"
      minutes={8}
      step={step}
      total={7}
    >
      <Step n={1} title="Walk east, then north" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          You leave home and walk 3 km east. Then you turn and walk 4 km north.
        </p>
        <p className="mt-3 text-ink-700">
          You have walked 7 km in total. But <strong>how far from home are you?</strong>
        </p>
        <div className="mt-4 grid gap-2">
          {[
            { k: "b", label: "7 km — 3 + 4" },
            { k: "a", label: "5 km" },
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
            Draw the walk and the answer settles itself.
            <div className="mt-3">
              <PrimaryButton onClick={() => go(2)}>Draw it</PrimaryButton>
            </div>
          </div>
        )}
      </Step>

      <Step n={2} title="Something you already know" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <p className="text-ink-700">
          East and north are at right angles. So the walk makes a right-angled triangle, and you
          have had the tool for this since Grade 8.
        </p>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-center text-sm">
          <MathText text="a^2 + b^2 = c^2" />
        </div>
        <p className="mt-3 text-ink-700">
          The legs are 3 and 4. Note that <MathText text="3^2 + 4^2 = 9 + 16 = 25" />, and{" "}
          <MathText text="sqrt(25) = 5" />.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(3)}>So who was right?</PrimaryButton>
        </div>
      </Step>

      <Step n={3} title="The mistake almost everyone makes" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <WrongBox>
          <MathText text="3 km + 4 km = 7 km from home" />
        </WrongBox>
        <p className="text-ink-700">
          Lots of people add the two lengths, because that is what you do with ordinary numbers. But
          look at where you actually end up.
        </p>
        <div className="mt-4 flex justify-center">
          <VectorArrowPlot vx={3} vy={4} lenLabel="5 km" xLabel="3 east" yLabel="4 north" id="vec-hook" />
        </div>
        <p className="mt-3 text-center text-lg font-bold text-ok-600">You are 5 km from home</p>
        <p className="mt-3 text-ink-700">
          You <em>walked</em> 7 km. You are <em>5 km away</em>. Those are two different questions,
          and only one of them cares which way you were pointing.
        </p>
        <p className="mt-3 text-ink-700">
          Here is when adding the lengths does work. Walk 3 km east, then 4 km <strong>east
          again</strong>, and you really are 7 km from home. Adding lengths is correct only when
          both trips point the same way — which is exactly why the instinct feels so reasonable.
        </p>
        <KeyIdea>
          A vector is not a number. It carries a size <em>and</em> a direction, and throwing away
          the direction is what breaks the arithmetic.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(4)}>The fix</PrimaryButton>
        </div>
      </Step>

      <Step n={4} title="Keep the two directions apart" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <p className="text-ink-700">
          Write the walk as <strong>two numbers</strong>: how far across, then how far up. The east
          walk is <MathText text="(3, 0)" /> and the north walk is <MathText text="(0, 4)" />.
        </p>
        <p className="mt-3 text-ink-700">
          Now add them the only way that makes sense — across with across, up with up:
        </p>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-center text-sm font-bold text-ink-900">
          <MathText text="(3, 0) + (0, 4) = (3 + 0, 0 + 4) = (3, 4)" />
        </div>
        <p className="mt-3 text-ink-700">
          The across-number and the up-number never mix. That is the whole rule, and it works no
          matter how many trips you string together.
        </p>
        <div className="mt-4">
          <TipToTailPlot />
        </div>
        <p className="mt-3 text-ink-700">
          Lay the arrows tip to tail and the dashed arrow is the single trip that replaces both of
          them. Check the components: <MathText text="6 + (−2) = 4" /> across, and{" "}
          <MathText text="1 + 3 = 4" /> up.
        </p>
        <FormulaBox>
          <div className="text-base">
            <MathText text="(a, b) + (c, d) = (a + c, b + d)" />
          </div>
        </FormulaBox>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(5)}>Now measure the arrow</PrimaryButton>
        </div>
      </Step>

      <Step n={5} title="How long is a vector?" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">
          The length of the arrow is called its <strong>magnitude</strong>, written{" "}
          <MathText text="|v|" />. It is the Pythagoras step from before, written once and for all.
        </p>
        <FormulaBox>
          <MathText text="|(a, b)| = sqrt(a^2 + b^2)" />
        </FormulaBox>
        <p className="text-ink-700">
          <MathText text="v = (5, 12)" className="font-bold text-ink-900" />. Find{" "}
          <MathText text="|v|" />.
        </p>
        <div className="mt-3 rounded-2xl bg-paper p-4">
          <ol className="space-y-2">
            {[
              ["Square both components", "25 and 144"],
              ["Add them", "169"],
              ["Take the square root", "13"],
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
          Two things fall straight out of that formula. First, signs do not matter — squaring
          removes them, so <MathText text="(−5, 12)" /> also has magnitude 13. Second, scaling a
          vector scales its length by the same factor: <MathText text="3v = (15, 36)" />, and{" "}
          <MathText text="sqrt(225 + 1296) = sqrt(1521) = 39" />, which is <MathText text="3 * 13" />{" "}
          ✓
        </p>
        <p className="mt-3 text-ink-700">
          Divide a vector by its own magnitude and you get a <strong>unit vector</strong> — same
          direction, length exactly 1. For <MathText text="v = (5, 12)" /> that is{" "}
          <MathText text="({5/13}, {12/13})" />, and{" "}
          <MathText text="{25/169} + {144/169} = {169/169} = 1" /> ✓
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(6)}>Worked example</PrimaryButton>
        </div>
      </Step>

      <Step n={6} title="A full question" open={step === 6} onOpen={() => go(6)} done={step > 6}>
        <p className="text-ink-700">
          <MathText text="u = (6, 8)" className="font-bold text-ink-900" /> and{" "}
          <MathText text="v = (−2, 3)" className="font-bold text-ink-900" />. Find{" "}
          <MathText text="2u − v" /> and then the magnitude of <MathText text="u" />.
        </p>
        <div className="mt-3 rounded-2xl bg-paper p-4">
          <ol className="space-y-2">
            {[
              ["Scale first: 2u doubles each component", "(12, 16)"],
              ["Subtract v across", "12 − (−2) = 14"],
              ["Subtract v up", "16 − 3 = 13"],
              ["So 2u − v =", "(14, 13)"],
              ["|u| = sqrt(36 + 64) = sqrt(100)", "10"],
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
            Watch the trap in step 2: subtracting <MathText text="−2" /> makes the answer{" "}
            <strong>bigger</strong>, not smaller. Every component keeps its own sign.
          </p>
        </div>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(7)}>Your turn</PrimaryButton>
        </div>
      </Step>

      <Step n={7} title="You try one" open={step === 7} onOpen={() => go(7)} done={false}>
        <p className="text-ink-700">
          A drone flies 8 km east, then 15 km north. How far is it from where it started, in
          kilometres?
        </p>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          As a vector the flight is <MathText text="(8, 15)" className="font-bold" />. So you need{" "}
          <MathText text="sqrt(8^2 + 15^2)" />, and <MathText text="64 + 225 = 289" />.
        </div>
        <TryIt
          prompt={<>2. What is the square root of 289?</>}
          accept={["17"]}
          placeholder="a number"
          value={fade}
          setValue={setFade}
          hint="try 17 × 17 and see what you get."
          explain={
            <>
              <MathText text="|(8, 15)| = 17" /> km. The drone <em>flew</em> 23 km but it is only 17
              km from home — and <MathText text="17^2 = 289" /> ✓. Adding the lengths would have
              given 23, which is the distance travelled, not the distance away.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Vectors</div>
          <div className="mt-2">1. A vector is two numbers: across, then up</div>
          <div className="mt-1">2. Add and subtract component by component — never mix them</div>
          <div className="mt-1">3. Scaling by k multiplies both components by k</div>
          <div className="mt-1">4. Magnitude is √(a² + b²), and |kv| = |k| × |v|</div>
        </div>
        <KeyIdea>
          💡 Distance travelled and distance from home are different questions. Only the second one
          is a magnitude, and it is almost always smaller.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}

/** u = (3, 4) and v = (−4, 3) drawn together — the picture of a zero dot product. */
function PerpendicularPlot() {
  const W = 260;
  const H = 230;
  const xMin = -5;
  const xMax = 5;
  const yMin = -1;
  const yMax = 5;
  const px = (x: number) => ((x - xMin) / (xMax - xMin)) * W;
  const py = (y: number) => H - ((y - yMin) / (yMax - yMin)) * H;
  return (
    <figure className="m-0">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style={{ maxWidth: W }}
        role="img"
        aria-label="two arrows from the origin meeting at a right angle"
      >
        <defs>
          <marker id="dot-u" markerWidth="9" markerHeight="9" refX="7" refY="3.2" orient="auto">
            <path d="M0,0 L7,3.2 L0,6.4 z" fill="#7c3aed" />
          </marker>
          <marker id="dot-v" markerWidth="9" markerHeight="9" refX="7" refY="3.2" orient="auto">
            <path d="M0,0 L7,3.2 L0,6.4 z" fill="#0d9488" />
          </marker>
        </defs>
        {[-4, -2, 0, 2, 4].map((v) => (
          <line key={`v${v}`} x1={px(v)} y1={0} x2={px(v)} y2={H} stroke="#f3f4f6" strokeWidth="1" />
        ))}
        {[0, 2, 4].map((v) => (
          <line key={`h${v}`} x1={0} y1={py(v)} x2={W} y2={py(v)} stroke="#f3f4f6" strokeWidth="1" />
        ))}
        <line x1={px(xMin)} y1={py(0)} x2={px(xMax)} y2={py(0)} stroke="#94a3b8" strokeWidth="1.4" />
        <line x1={px(0)} y1={py(yMin)} x2={px(0)} y2={py(yMax)} stroke="#94a3b8" strokeWidth="1.4" />
        <line
          x1={px(0)}
          y1={py(0)}
          x2={px(3)}
          y2={py(4)}
          stroke="#7c3aed"
          strokeWidth="2.8"
          markerEnd="url(#dot-u)"
        />
        <line
          x1={px(0)}
          y1={py(0)}
          x2={px(-4)}
          y2={py(3)}
          stroke="#0d9488"
          strokeWidth="2.8"
          markerEnd="url(#dot-v)"
        />
        <path
          d={`M ${px(0.72)} ${py(0.96)} L ${px(-0.24)} ${py(1.68)} L ${px(-0.96)} ${py(0.72)}`}
          fill="none"
          stroke="#94a3b8"
          strokeWidth="1.4"
        />
        <text x={px(3) + 4} y={py(4) + 4} fontSize="11" fontWeight="700" fill="#7c3aed">
          u = (3, 4)
        </text>
        <text x={px(-4.9)} y={py(3) - 6} fontSize="11" fontWeight="700" fill="#0d9488">
          v = (−4, 3)
        </text>
        <text x={px(0.2)} y={py(2.3)} fontSize="10" fontWeight="700" fill="#dc2626">
          u · v = 0
        </text>
      </svg>
    </figure>
  );
}

/**
 * The dot product.
 *
 * Two errors are confronted. The first is producing a vector — students carry
 * the bracket notation across from addition and answer (6, 20). The second is
 * reading a zero dot product as "nothing", when it is the single most useful
 * answer the operation ever gives: a right angle.
 */
export function DotProductLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 12 · Vectors · The dot product"
      title="Multiplying two arrows"
      minutes={8}
      step={step}
      total={7}
    >
      <Step n={1} title="Pulling a sledge" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          You drag a sledge along the ground with a rope. The rope goes up at an angle, so part of
          your pull lifts the sledge and only part of it drags the sledge forward.
        </p>
        <p className="mt-3 text-ink-700">
          Two vectors are in play — your pull, and the direction of travel — and the useful answer
          is a single number: <strong>how much of one goes along the other</strong>. That number is
          the dot product.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(2)}>What you already do</PrimaryButton>
        </div>
      </Step>

      <Step n={2} title="You have added them already" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <p className="text-ink-700">
          Adding vectors kept the two directions apart and gave back a vector:
        </p>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-center text-sm font-bold text-ink-900">
          <MathText text="(3, 4) + (2, 5) = (5, 9)" />
        </div>
        <p className="mt-3 text-ink-700">
          The dot product starts the same way — pair the components — but then it does one more
          thing that changes everything.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(3)}>The new problem</PrimaryButton>
        </div>
      </Step>

      <Step n={3} title="Find u · v" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">
          <MathText text="u = (3, 4)" className="font-bold text-ink-900" /> and{" "}
          <MathText text="v = (2, 5)" className="font-bold text-ink-900" />. Find{" "}
          <MathText text="u · v" />.
        </p>
        <div className="mt-3 rounded-2xl bg-paper p-4 text-center">
          <div className="font-bold text-ink-900">
            <MathText text="u · v = (3)(2) + (4)(5) = 6 + 20 = 26" />
          </div>
        </div>
        <p className="mt-3 text-ink-700">
          Multiply the matching components, then <strong>add the two results together</strong>. The
          answer is 26 — one number, no brackets, no arrow.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(4)}>Two things go wrong here</PrimaryButton>
        </div>
      </Step>

      <Step n={4} title="The two mistakes almost everyone makes" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <WrongBox>
          <MathText text="(3, 4) · (2, 5) = (6, 20)" />
        </WrongBox>
        <p className="text-ink-700">
          Every other operation so far handed back a vector, so the brackets get kept out of habit.
          But the final step of a dot product is an <strong>addition</strong>, and adding 6 and 20
          leaves you with one number. The dot product of two vectors is never a vector. It is called
          a <em>scalar</em> product for exactly that reason.
        </p>

        <WrongBox>
          <MathText text="u · v = 0" /> means &ldquo;there is nothing there&rdquo;
        </WrongBox>
        <p className="text-ink-700">
          Zero usually means nothing. Here it means the most specific thing the dot product can
          ever tell you. Try it with real numbers:
        </p>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-center text-sm font-bold text-ink-900">
          <MathText text="(3, 4) · (−4, 3) = −12 + 12 = 0" />
        </div>
        <div className="mt-4 flex justify-center">
          <PerpendicularPlot />
        </div>
        <p className="mt-3 text-ink-700">
          Neither arrow is zero — one has length 5 and so does the other. They are at{" "}
          <strong>right angles</strong>. Nothing of the first vector points along the second, so the
          amount of overlap really is zero.
        </p>
        <KeyIdea>
          <MathText text="u · v = 0" /> is the fastest perpendicularity test in mathematics. No
          angles, no square roots — just multiply, add, and look for zero.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(5)}>What the sign tells you</PrimaryButton>
        </div>
      </Step>

      <Step n={5} title="The sign is the angle" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">
          Because the dot product measures overlap, its sign alone classifies the angle between the
          two vectors.
        </p>
        <div className="mt-3 space-y-2">
          {[
            ["(3, 4) · (2, 5) = 26", "positive", "Acute — under 90°"],
            ["(3, 4) · (−4, 3) = 0", "zero", "Right angle — exactly 90°"],
            ["(3, 4) · (−5, 1) = −11", "negative", "Obtuse — over 90°"],
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
          Check the last one: <MathText text="(3)(−5) + (4)(1) = −15 + 4 = −11" />. Negative, so the
          arrows lean away from each other.
        </p>
        <p className="mt-3 text-ink-700">
          For the exact angle there is a second formula, and it says the same thing more precisely:
        </p>
        <FormulaBox>
          <div className="text-base">
            <MathText text="u · v = |u| |v| cos θ" />
          </div>
        </FormulaBox>
        <div className="mt-3 rounded-2xl bg-paper p-4">
          <p className="text-sm font-semibold text-ink-900">
            <MathText text="u = (3, 4)" /> and <MathText text="v = (1, 0)" />. Find the angle.
          </p>
          <ol className="mt-2 space-y-2">
            {[
              ["u · v = (3)(1) + (4)(0)", "3"],
              ["|u| = sqrt(9 + 16) = 5 and |v| = 1", "5 * 1 = 5"],
              ["cos θ = {3/5}", "0.6"],
              ["θ = cos^{−1}(0.6)", "≈ 53°"],
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
            Positive dot product, angle under 90° — the sign test and the formula agree ✓
          </p>
        </div>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(6)}>Worked example</PrimaryButton>
        </div>
      </Step>

      <Step n={6} title="Make them perpendicular" open={step === 6} onOpen={() => go(6)} done={step > 6}>
        <p className="text-ink-700">
          <MathText text="u = (6, 2)" className="font-bold text-ink-900" /> and{" "}
          <MathText text="v = (3, k)" className="font-bold text-ink-900" />. Find{" "}
          <MathText text="k" /> so that <MathText text="u" /> and <MathText text="v" /> are
          perpendicular.
        </p>
        <div className="mt-3 rounded-2xl bg-paper p-4">
          <ol className="space-y-2">
            {[
              ["Perpendicular means the dot product is 0", "u · v = 0"],
              ["Write it out", "(6)(3) + (2)(k) = 0"],
              ["Simplify", "18 + 2k = 0"],
              ["Solve", "k = −9"],
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
            Check: <MathText text="(6, 2) · (3, −9) = 18 − 18 = 0" /> ✓
          </p>
        </div>
        <p className="mt-3 text-ink-700">
          There is also an angle version worth knowing. If <MathText text="|u| = 6" />,{" "}
          <MathText text="|v| = 4" /> and the angle between them is 60°, then{" "}
          <MathText text="u · v = 6 * 4 * cos 60° = 24 * {1/2} = 12" />.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(7)}>Your turn</PrimaryButton>
        </div>
      </Step>

      <Step n={7} title="You try one" open={step === 7} onOpen={() => go(7)} done={false}>
        <p className="text-ink-700">
          <MathText text="u = (5, 2)" className="font-bold text-ink-900" /> and{" "}
          <MathText text="v = (4, k)" className="font-bold text-ink-900" />. Find{" "}
          <MathText text="k" /> so that the two vectors are perpendicular.
        </p>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          Perpendicular means <MathText text="u · v = 0" />, so{" "}
          <MathText text="(5)(4) + (2)(k) = 0" className="font-bold" />, which is{" "}
          <MathText text="20 + 2k = 0" />.
        </div>
        <TryIt
          prompt={<>2. Solve 20 + 2k = 0. What is k?</>}
          accept={["-10", "−10"]}
          placeholder="a number"
          value={fade}
          setValue={setFade}
          hint="subtract 20 from both sides, then halve."
          explain={
            <>
              <MathText text="k = −10" />. Check it:{" "}
              <MathText text="(5, 2) · (4, −10) = 20 − 20 = 0" /> ✓ — and notice the answer is a
              single number, not a pair.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">The dot product</div>
          <div className="mt-2">1. u · v = a c + b d — multiply pairs, then add</div>
          <div className="mt-1">2. The answer is one number, never a vector</div>
          <div className="mt-1">3. Zero means perpendicular; positive acute, negative obtuse</div>
          <div className="mt-1">4. For the exact angle: cos θ = (u · v) ÷ (|u| |v|)</div>
        </div>
        <KeyIdea>
          💡 If your dot product has a bracket around it, you stopped one step early. The last
          operation is always an addition.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
