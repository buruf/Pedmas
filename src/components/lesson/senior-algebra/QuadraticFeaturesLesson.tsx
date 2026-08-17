"use client";

import { useId, useState } from "react";
import { MathText } from "@/components/MathText";
import { Step, KeyIdea, WrongBox, FormulaBox } from "@/components/lesson/Step";
import { LessonShell, TryIt } from "@/components/lesson/LessonShell";
import { PrimaryButton } from "@/components/ui";

/* --------------------------------------------------------- local parabola */

/**
 * A parabola drawn from vertex form, with its axis of symmetry and vertex
 * marked. Local to this file — the shared Models.tsx has no curve.
 */
function ParabolaPlot({
  a,
  h,
  k,
  xmin,
  xmax,
  ymin,
  ymax,
  showAxis = true,
  extraPoints = [],
  caption,
  size = 210,
}: {
  a: number;
  h: number;
  k: number;
  xmin: number;
  xmax: number;
  ymin: number;
  ymax: number;
  showAxis?: boolean;
  extraPoints?: { x: number; y: number; label?: string; colour?: string }[];
  caption?: string;
  size?: number;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const px = (v: number) => ((v - xmin) / (xmax - xmin)) * size;
  const py = (v: number) => size - ((v - ymin) / (ymax - ymin)) * size;
  const f = (x: number) => a * (x - h) * (x - h) + k;

  const pts: string[] = [];
  const N = 80;
  for (let i = 0; i <= N; i++) {
    const x = xmin + ((xmax - xmin) * i) / N;
    pts.push(`${px(x).toFixed(1)},${py(f(x)).toFixed(1)}`);
  }
  const xticks: number[] = [];
  for (let v = Math.ceil(xmin); v <= xmax; v++) xticks.push(v);

  return (
    <figure className="m-0">
      <svg
        viewBox={`-14 -10 ${size + 26} ${size + 26}`}
        width="100%"
        style={{ maxWidth: size + 44 }}
        role="img"
        aria-label={caption ?? "parabola"}
      >
        <defs>
          <clipPath id={`parclip${uid}`}>
            <rect x="0" y="0" width={size} height={size} />
          </clipPath>
        </defs>
        {xticks.map((v) => (
          <line key={v} x1={px(v)} y1={0} x2={px(v)} y2={size} stroke="#f3f4f6" strokeWidth="1" />
        ))}
        {ymin <= 0 && ymax >= 0 && (
          <line x1={0} y1={py(0)} x2={size} y2={py(0)} stroke="#6b7280" strokeWidth="1.5" />
        )}
        {xmin <= 0 && xmax >= 0 && (
          <line x1={px(0)} y1={0} x2={px(0)} y2={size} stroke="#6b7280" strokeWidth="1.5" />
        )}
        <g clipPath={`url(#parclip${uid})`}>
          {showAxis && (
            <line
              x1={px(h)}
              y1={0}
              x2={px(h)}
              y2={size}
              stroke="#f59e0b"
              strokeWidth="1.8"
              strokeDasharray="5 4"
            />
          )}
          <polyline points={pts.join(" ")} fill="none" stroke="#7c3aed" strokeWidth="2.6" />
          {extraPoints.map((p, i) => (
            <circle key={i} cx={px(p.x)} cy={py(p.y)} r="4.5" fill={p.colour ?? "#111827"} />
          ))}
          <circle cx={px(h)} cy={py(k)} r="5.5" fill="#dc2626" />
        </g>
        {extraPoints.map((p, i) =>
          p.label ? (
            <text
              key={i}
              x={px(p.x) + 6}
              y={py(p.y) - 6}
              fontSize="10"
              fontWeight="700"
              fill="#111827"
            >
              {p.label}
            </text>
          ) : null
        )}
        <text x={px(h) + 8} y={py(k) + (a > 0 ? 14 : -8)} fontSize="10" fontWeight="700" fill="#b91c1c">
          {`(${h}, ${k})`}
        </text>
      </svg>
      {caption && (
        <figcaption className="mt-1 text-center text-sm font-semibold text-ink-700">
          <MathText text={caption} />
        </figcaption>
      )}
    </figure>
  );
}

function WorkList({ rows }: { rows: [string, string][] }) {
  return (
    <div className="mt-4 rounded-2xl bg-paper p-4">
      <ol className="space-y-2">
        {rows.map(([a, b], i) => (
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
  );
}

/**
 * Reading a parabola: vertex, axis of symmetry, intercepts, direction.
 *
 * The misconception is a sign: (x − 3)² + 2 read as a vertex at (−3, 2). It is
 * confronted by evaluating the function at both candidates — one gives 2, the
 * other gives 38 — so the graph itself says which point is the low one.
 */
export function QuadraticFeaturesLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 11 · Quadratics · Graphs"
      title="Reading a parabola"
      minutes={8}
      step={step}
      total={8}
    >
      <Step n={1} title="The turning point is the answer" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          Throw a ball and its path is a parabola. Nearly every real question about it is the same
          question: <strong>where is the turning point?</strong> Highest point of the throw, cheapest
          production run, maximum profit, minimum cost.
        </p>
        <p className="mt-3 text-ink-700">
          That turning point is called the <strong>vertex</strong>, and the curve is a perfect mirror
          image either side of it.
        </p>
        <div className="mt-4">
          <ParabolaPlot a={-1} h={3} k={4} xmin={-1} xmax={7} ymin={-4} ymax={5} caption="a path with its highest point marked" />
        </div>
        <div className="mt-4"><PrimaryButton onClick={() => go(2)}>Where do I find it?</PrimaryButton></div>
      </Step>

      <Step n={2} title="The new problem" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <p className="text-ink-700">Find the vertex of</p>
        <FormulaBox><MathText text="y = (x − 3)^2 + 2" /></FormulaBox>
        <p className="text-ink-700">
          Two numbers are sitting in plain sight: a <MathText text="3" /> and a{" "}
          <MathText text="2" />. The question is what they mean.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(3)}>Take a guess, then test it</PrimaryButton></div>
      </Step>

      <Step n={3} title="The mistake almost everyone makes" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <WrongBox>vertex at <MathText text="(−3, 2)" /></WrongBox>
        <p className="text-ink-700">
          The minus sign is right there in the bracket, so <MathText text="−3" /> feels obviously
          right. Work out the height at each candidate and let the curve decide.
        </p>
        <div className="mt-3 space-y-2">
          {[
            ["at x = 3", "(3 − 3)^2 + 2 = 0 + 2", "y = 2"],
            ["at x = −3", "(−3 − 3)^2 + 2 = 36 + 2", "y = 38"],
          ].map(([a, b, c]) => (
            <div key={a} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-semibold text-ink-900">{a}</span>
              <span className="text-sm text-ink-700"><MathText text={b} /></span>
              <span className="text-sm font-black text-brand-700"><MathText text={c} /></span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-ink-700">
          The curve is 36 units <em>higher</em> at <MathText text="x = −3" /> than at{" "}
          <MathText text="x = 3" />. A point that high cannot be the lowest point of anything.
        </p>
        <div className="mt-4">
          <ParabolaPlot a={1} h={3} k={2} xmin={-1} xmax={7} ymin={0} ymax={12} caption="y = (x − 3)^2 + 2" />
        </div>
        <div className="mt-4"><PrimaryButton onClick={() => go(4)}>Why is it 3 and not −3?</PrimaryButton></div>
      </Step>

      <Step n={4} title="The bracket is looking for its own zero" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <p className="text-ink-700">
          A square is never negative. The smallest <MathText text="(x − 3)^2" /> can ever be is{" "}
          <strong>zero</strong>, and it only reaches zero when the inside is zero — that is, when{" "}
          <MathText text="x = 3" />.
        </p>
        <p className="mt-3 text-ink-700">
          At that moment the whole expression is just the <MathText text="+ 2" />. Everywhere else
          you are adding something positive on top.
        </p>
        <FormulaBox>
          <MathText text="y = a(x − h)^2 + k has its vertex at (h, k)" />
        </FormulaBox>
        <p className="text-ink-700">
          Read <MathText text="h" /> as <em>the value that empties the bracket</em>, not as the
          number you can see. So <MathText text="(x − 3)^2" /> gives{" "}
          <MathText text="h = 3" />, and <MathText text="(x + 4)^2" /> — which is really{" "}
          <MathText text="(x − (−4))^2" /> — gives <MathText text="h = −4" />.
        </p>
        <KeyIdea>
          This is the same reading you use for roots: the bracket <MathText text="(x − 3)" /> points
          at <MathText text="x = 3" />, whether it is squared or not.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(5)}>What if it is not in that form?</PrimaryButton></div>
      </Step>

      <Step n={5} title="From the standard form" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">
          Expand the one you just did: <MathText text="(x − 3)^2 + 2 = x^2 − 6x + 9 + 2" />, so it is
          the very same curve as <MathText text="y = x^2 − 6x + 11" />.
        </p>
        <p className="mt-3 text-ink-700">
          Written that way the vertex is hidden, but the axis of symmetry can be computed directly.
        </p>
        <FormulaBox><MathText text="axis of symmetry: x = {−b/2a}" /></FormulaBox>
        <WorkList
          rows={[
            ["Here a = 1 and b = −6", "x = {6/2} = 3"],
            ["Put x = 3 back in for the height", "9 − 18 + 11 = 2"],
            ["Vertex", "(3, 2)"],
            ["Y-intercept: put x = 0", "y = 11"],
          ]}
        />
        <p className="mt-3 text-ink-700">
          Same vertex as before ✓ — two forms, one curve. And the y-intercept agrees too:{" "}
          <MathText text="(0 − 3)^2 + 2 = 11" /> ✓
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(6)}>And from the roots?</PrimaryButton></div>
      </Step>

      <Step n={6} title="From the factored form, symmetry does the work" open={step === 6} onOpen={() => go(6)} done={step > 6}>
        <p className="text-ink-700">
          Take <MathText text="y = (x − 1)(x − 5)" />. The curve touches zero at{" "}
          <MathText text="x = 1" /> and <MathText text="x = 5" />.
        </p>
        <p className="mt-3 text-ink-700">
          Because a parabola is symmetric, the vertex sits exactly halfway between its roots.
        </p>
        <WorkList
          rows={[
            ["Midpoint of the roots", "{1 + 5/2} = 3"],
            ["Height there", "(3 − 1)(3 − 5) = (2)(−2) = −4"],
            ["Vertex", "(3, −4)"],
          ]}
        />
        <div className="mt-4">
          <ParabolaPlot
            a={1}
            h={3}
            k={-4}
            xmin={-1}
            xmax={7}
            ymin={-6}
            ymax={6}
            extraPoints={[
              { x: 1, y: 0, label: "1" },
              { x: 5, y: 0, label: "5" },
            ]}
            caption="roots at 1 and 5, vertex halfway between"
          />
        </div>
        <p className="mt-3 text-ink-700">
          Check by expanding: <MathText text="x^2 − 6x + 5" />, and at{" "}
          <MathText text="x = 3" /> that is <MathText text="9 − 18 + 5 = −4" /> ✓
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(7)}>Up or down?</PrimaryButton></div>
      </Step>

      <Step n={7} title="Maximum and minimum" open={step === 7} onOpen={() => go(7)} done={step > 7}>
        <p className="text-ink-700">
          The sign of <MathText text="a" /> decides which way the curve opens, and that decides
          whether the vertex is the lowest or the highest point.
        </p>
        <div className="mt-3 space-y-2">
          {[
            ["a > 0", "opens upward", "the vertex is a minimum"],
            ["a < 0", "opens downward", "the vertex is a maximum"],
          ].map(([a, b, c]) => (
            <div key={a} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-black text-brand-700"><MathText text={a} /></span>
              <span className="text-sm font-semibold text-ink-900">{b}</span>
              <span className="text-sm text-ink-700">{c}</span>
            </div>
          ))}
        </div>
        <WrongBox>&ldquo;Minimum means the smallest x&rdquo;</WrongBox>
        <p className="text-ink-700">
          It means the smallest <MathText text="y" />. On{" "}
          <MathText text="y = 3(x + 1)^2 − 8" /> the minimum <em>value</em> is{" "}
          <MathText text="−8" />, and it happens <em>at</em> <MathText text="x = −1" />. Those are
          two different numbers and questions ask for both.
        </p>
        <WorkList
          rows={[
            ["Bracket empties when x + 1 = 0", "x = −1"],
            ["Height there", "3(0) − 8 = −8"],
            ["a = 3 is positive, so it opens up", "vertex (−1, −8) is a minimum"],
            ["Sanity check at x = 0", "3(1) − 8 = −5, which is higher ✓"],
          ]}
        />
        <div className="mt-4"><PrimaryButton onClick={() => go(8)}>Your turn</PrimaryButton></div>
      </Step>

      <Step n={8} title="You try one" open={step === 8} onOpen={() => go(8)} done={false}>
        <p className="text-ink-700">
          Find the vertex of <MathText text="y = (x − 2)^2 − 7" />.
        </p>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          Ask what makes the bracket zero, not what number you can see.
        </div>
        <TryIt
          prompt={<>2. What is the x-coordinate of the vertex?</>}
          accept={["2"]}
          placeholder="a number"
          value={fade}
          setValue={setFade}
          hint="solve x − 2 = 0."
          explain={
            <>
              <MathText text="x = 2" />, so the vertex is <MathText text="(2, −7)" />. Check:{" "}
              at <MathText text="x = 2" /> the height is <MathText text="−7" />, and at{" "}
              <MathText text="x = 0" /> it is <MathText text="4 − 7 = −3" /> — higher, as a minimum
              should be. ✓
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Reading a parabola</div>
          <div className="mt-2">1. <MathText text="y = a(x − h)^2 + k" /> — vertex at (h, k)</div>
          <div className="mt-1">2. Standard form: axis at <MathText text="x = {−b/2a}" />, then substitute</div>
          <div className="mt-1">3. Factored form: vertex halfway between the roots</div>
          <div className="mt-1">4. <MathText text="a > 0" /> opens up (minimum), <MathText text="a < 0" /> opens down</div>
        </div>
        <KeyIdea>
          💡 Unsure about a sign? Evaluate the function at your answer and at one point beside it.
          The vertex must be the extreme one — no rule needed.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
