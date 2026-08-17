"use client";

import { useState } from "react";
import { Step, KeyIdea, WrongBox } from "@/components/lesson/Step";
import { LessonShell, TryIt } from "@/components/lesson/LessonShell";
import { PrimaryButton } from "@/components/ui";

/**
 * Parallel, perpendicular and intersecting lines (Grade 4).
 *
 * The bank's hardest item asks whether two lines can be parallel *and*
 * perpendicular. That question only looks hard while the two words are stored
 * as decoration. The lesson therefore defines each one by what it says about
 * meeting — parallel never meets, perpendicular must meet — so the answer falls
 * out of the definitions instead of having to be remembered.
 */

const INK = "#374151";
const GREY = "#9ca3af";
const BRAND = "#7c3aed";
const TEAL = "#0d9488";
const ROSE = "#dc2626";

/** Small outward-pointing arrowhead at (x, y) along direction (dx, dy). */
function Arrow({ x, y, dx, dy, colour }: { x: number; y: number; dx: number; dy: number; colour: string }) {
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const px = -uy;
  const py = ux;
  const tip = `${x + ux * 7},${y + uy * 7}`;
  const a = `${x - px * 4},${y - py * 4}`;
  const b = `${x + px * 4},${y + py * 4}`;
  return <polygon points={`${tip} ${a} ${b}`} fill={colour} />;
}

/** A line, a segment or a ray — drawn so the ends tell you which it is. */
function LineKind({ kind, label }: { kind: "line" | "segment" | "ray"; label: string }) {
  const W = 190;
  const y = 26;
  const x1 = 22;
  const x2 = W - 22;
  return (
    <figure className="m-0">
      <svg viewBox={`0 0 ${W} 46`} width="100%" style={{ maxWidth: W }} role="img" aria-label={label}>
        <line x1={x1} y1={y} x2={x2} y2={y} stroke={BRAND} strokeWidth="3" strokeLinecap="round" />
        {kind !== "segment" && <Arrow x={x2} y={y} dx={1} dy={0} colour={BRAND} />}
        {kind === "line" && <Arrow x={x1} y={y} dx={-1} dy={0} colour={BRAND} />}
        {kind !== "line" && <circle cx={x1} cy={y} r="4.5" fill={ROSE} />}
        {kind === "segment" && <circle cx={x2} cy={y} r="4.5" fill={ROSE} />}
      </svg>
      <figcaption className="mt-1 text-center text-sm font-semibold text-ink-700">{label}</figcaption>
    </figure>
  );
}

/** Two lines in one of the three relationships, with the evidence drawn on. */
function TwoLines({
  kind,
  label,
  size = 150,
}: {
  kind: "parallel" | "perpendicular" | "intersecting";
  label?: string;
  size?: number;
}) {
  const S = size;
  const c = S / 2;
  return (
    <figure className="m-0">
      <svg viewBox={`0 0 ${S} ${S}`} width="100%" style={{ maxWidth: S }} role="img" aria-label={label ?? kind}>
        {kind === "parallel" && (
          <>
            <line x1={12} y1={c - 22} x2={S - 12} y2={c - 22} stroke={BRAND} strokeWidth="3" />
            <line x1={12} y1={c + 22} x2={S - 12} y2={c + 22} stroke={TEAL} strokeWidth="3" />
            {[0.3, 0.5, 0.7].map((f) => (
              <line
                key={f}
                x1={S * f}
                y1={c - 22}
                x2={S * f}
                y2={c + 22}
                stroke={GREY}
                strokeWidth="1.2"
                strokeDasharray="3 2"
              />
            ))}
            <text x={c} y={c + 4} fontSize="9" textAnchor="middle" fill={GREY}>
              same gap
            </text>
          </>
        )}
        {kind === "perpendicular" && (
          <>
            <line x1={12} y1={c} x2={S - 12} y2={c} stroke={BRAND} strokeWidth="3" />
            <line x1={c} y1={12} x2={c} y2={S - 12} stroke={TEAL} strokeWidth="3" />
            <rect x={c} y={c - 14} width={14} height={14} fill="none" stroke={ROSE} strokeWidth="2" />
            <text x={c + 30} y={c - 18} fontSize="10" fontWeight="700" fill={ROSE}>
              90°
            </text>
            <circle cx={c} cy={c} r="3.5" fill={INK} />
          </>
        )}
        {kind === "intersecting" && (
          <>
            <line x1={12} y1={c} x2={S - 12} y2={c} stroke={BRAND} strokeWidth="3" />
            <line x1={16} y1={S - 14} x2={S - 16} y2={14} stroke={TEAL} strokeWidth="3" />
            <circle cx={c} cy={c} r="3.5" fill={INK} />
            <text x={c + 26} y={c - 8} fontSize="10" fontWeight="700" fill={ROSE}>
              40°
            </text>
          </>
        )}
      </svg>
      {label && (
        <figcaption className="mt-1 text-center text-sm font-semibold text-ink-700">{label}</figcaption>
      )}
    </figure>
  );
}

/**
 * A quadrilateral with its parallel pairs ticked. One chevron marks the first
 * pair and two chevrons the second, which is the standard notation and also the
 * fastest way to count pairs without arguing about them.
 */
function Quad({
  kind,
  label,
  showRightAngles = false,
}: {
  kind: "rectangle" | "trapezoid";
  label?: string;
  showRightAngles?: boolean;
}) {
  const W = 175;
  const H = 115;
  const pts: [number, number][] =
    kind === "rectangle"
      ? [
          [20, 20],
          [155, 20],
          [155, 95],
          [20, 95],
        ]
      : [
          [50, 20],
          [125, 20],
          [160, 95],
          [15, 95],
        ];
  const chevron = (x: number, y: number, dir: "h" | "v", count: number, colour: string) =>
    Array.from({ length: count }, (_, i) => {
      const o = (i - (count - 1) / 2) * 5;
      return dir === "h" ? (
        <polyline
          key={i}
          points={`${x - 4 + o},${y - 5} ${x + 2 + o},${y} ${x - 4 + o},${y + 5}`}
          fill="none"
          stroke={colour}
          strokeWidth="2"
        />
      ) : (
        <polyline
          key={i}
          points={`${x - 5},${y - 4 + o} ${x},${y + 2 + o} ${x + 5},${y - 4 + o}`}
          fill="none"
          stroke={colour}
          strokeWidth="2"
        />
      );
    });

  return (
    <figure className="m-0">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: W }} role="img" aria-label={label ?? kind}>
        <polygon
          points={pts.map(([x, y]) => `${x},${y}`).join(" ")}
          fill="#ede9fe"
          stroke={BRAND}
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {/* top and bottom are parallel in both shapes */}
        {chevron((pts[0][0] + pts[1][0]) / 2, 20, "v", 1, TEAL)}
        {chevron((pts[2][0] + pts[3][0]) / 2, 95, "v", 1, TEAL)}
        {kind === "rectangle" && (
          <>
            {chevron(20, 57, "h", 2, ROSE)}
            {chevron(155, 57, "h", 2, ROSE)}
          </>
        )}
        {showRightAngles &&
          kind === "rectangle" &&
          [
            [20, 20, 1, 1],
            [155, 20, -1, 1],
            [155, 95, -1, -1],
            [20, 95, 1, -1],
          ].map(([x, y, sx, sy], i) => (
            <rect
              key={i}
              x={sx > 0 ? x : x - 13}
              y={sy > 0 ? y : y - 13}
              width={13}
              height={13}
              fill="none"
              stroke={ROSE}
              strokeWidth="1.8"
            />
          ))}
      </svg>
      {label && (
        <figcaption className="mt-1 text-center text-sm font-semibold text-ink-700">{label}</figcaption>
      )}
    </figure>
  );
}

export function LinesLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [guess, setGuess] = useState<string | null>(null);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 4 · Geometry · Lines"
      title="How two lines can sit together"
      minutes={6}
      step={step}
      total={7}
    >
      <Step n={1} title="Tracks and corners" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          Railway tracks run beside each other for a hundred miles and never touch. The corner of
          this page does the opposite — two edges meet, and meet squarely.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-6">
          <TwoLines kind="parallel" label="the tracks" />
          <TwoLines kind="perpendicular" label="the page corner" />
        </div>
        <p className="mt-4 text-ink-700">
          Both are pairs of straight lines. Geometry gives each arrangement its own name.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(2)}>First, what is a line?</PrimaryButton>
        </div>
      </Step>

      <Step n={2} title="Line, segment, ray" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <p className="text-ink-700">The ends tell you which one you are looking at.</p>
        <div className="mt-4 space-y-3">
          <LineKind kind="line" label="line — no endpoints, goes on both ways" />
          <LineKind kind="ray" label="ray — 1 endpoint, goes on one way" />
          <LineKind kind="segment" label="segment — 2 endpoints, stops at both" />
        </div>
        <KeyIdea>
          Count the closed ends: <strong>0</strong> is a line, <strong>1</strong> is a ray,{" "}
          <strong>2</strong> is a segment.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(3)}>Now put two together</PrimaryButton>
        </div>
      </Step>

      <Step n={3} title="Which pair is which?" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <div className="flex justify-center">
          <TwoLines kind="perpendicular" size={160} />
        </div>
        <p className="mt-4 text-ink-700">What are these two lines called?</p>
        <div className="mt-3 grid gap-2">
          {[
            { k: "b", label: "Parallel — they are perfectly straight and even" },
            { k: "a", label: "Perpendicular" },
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
            The two words get swapped constantly. Here is what stops it.
            <div className="mt-3">
              <PrimaryButton onClick={() => go(4)}>Show me</PrimaryButton>
            </div>
          </div>
        )}
      </Step>

      <Step n={4} title="The mistake almost everyone makes" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <WrongBox>&ldquo;These lines are parallel <em>and</em> perpendicular&rdquo;</WrongBox>
        <p className="text-ink-700">
          It sounds harmless — both words describe neat, tidy lines. But read what each one actually
          claims:
        </p>
        <div className="mt-4 space-y-2">
          <div className="rounded-xl border-2 border-brand-300 bg-brand-50 px-3 py-2">
            <div className="text-sm font-bold text-ink-900">Parallel</div>
            <div className="text-sm text-ink-700">The lines <strong>never</strong> meet.</div>
          </div>
          <div className="rounded-xl border-2 border-brand-300 bg-brand-50 px-3 py-2">
            <div className="text-sm font-bold text-ink-900">Perpendicular</div>
            <div className="text-sm text-ink-700">
              The lines <strong>do</strong> meet — at exactly 90°.
            </div>
          </div>
        </div>
        <p className="mt-4 text-ink-700">
          One says they never meet. The other says they must. A pair of lines cannot do both, so no
          two lines are ever parallel and perpendicular at the same time.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-5">
          <TwoLines kind="parallel" size={130} label="never meet" />
          <TwoLines kind="perpendicular" size={130} label="meet at 90°" />
        </div>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(5)}>Give me the test</PrimaryButton>
        </div>
      </Step>

      <Step n={5} title="Ask one question: do they meet?" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <div className="mt-1 space-y-2">
          {[
            ["Never meet, same gap forever", "parallel", "∥"],
            ["Meet at 90°", "perpendicular", "⊥"],
            ["Meet at any other angle", "intersecting", "—"],
          ].map(([a, b, c]) => (
            <div key={b} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm text-ink-700">{a}</span>
              <span className="text-sm font-bold text-ink-900">{b}</span>
              <span className="text-lg font-bold text-brand-700">{c}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-center">
          <TwoLines kind="intersecting" label="intersecting, but not perpendicular" />
        </div>
        <p className="mt-3 text-ink-700">
          Every perpendicular pair is also an intersecting pair. It just happens to cross at the one
          special angle.
        </p>
        <KeyIdea>
          One more useful fact: if two lines are each parallel to a third line, they run in the same
          direction as each other — so they are parallel too.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(6)}>Use it on a shape</PrimaryButton>
        </div>
      </Step>

      <Step n={6} title="A rectangle has both" open={step === 6} onOpen={() => go(6)} done={step > 6}>
        <div className="flex justify-center">
          <Quad kind="rectangle" showRightAngles label="opposite sides ∥, adjacent sides ⊥" />
        </div>
        <div className="mt-4 rounded-2xl bg-paper p-4">
          <ol className="space-y-2">
            {[
              ["Top and bottom — extend them forever. Do they meet?", "no → parallel"],
              ["Left and right — same question", "no → parallel"],
              ["So how many pairs of parallel sides?", "2"],
              ["Sides that meet at a corner — what angle?", "90° → perpendicular"],
              ["How many right angles altogether?", "4"],
            ].map(([a, b], i) => (
              <li key={i} className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 text-sm">
                <span className="text-ink-700">
                  <span className="mr-2 font-bold text-brand-600">{i + 1}.</span>
                  {a}
                </span>
                <span className="shrink-0 font-bold text-ink-900">{b}</span>
              </li>
            ))}
          </ol>
        </div>
        <p className="mt-3 text-ink-700">
          Notice that no pair of sides was both. Opposite sides never meet; adjacent sides always do.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(7)}>Your turn</PrimaryButton>
        </div>
      </Step>

      <Step n={7} title="You try one" open={step === 7} onOpen={() => go(7)} done={false}>
        <p className="text-ink-700">This four-sided shape is a trapezoid.</p>
        <div className="mt-3 flex justify-center">
          <Quad kind="trapezoid" label="which sides never meet?" />
        </div>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          The top and the bottom are flat and level — extend them and they never meet. That is one
          pair.
        </div>
        <div className="mt-2 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">2. </span>
          Now check the two slanted sides. Extended downwards they get further apart; extended
          upwards they close in and cross.
        </div>
        <TryIt
          prompt={<>3. How many pairs of parallel sides does it have?</>}
          accept={["1"]}
          placeholder="a number"
          value={fade}
          setValue={setFade}
          hint="the slanted sides would cross if you kept drawing them, so they are not a pair."
          explain={
            <>
              <strong>1 pair.</strong> That is exactly what makes it a trapezoid rather than a
              rectangle — a rectangle has 2 pairs.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Two lines</div>
          <div className="mt-2">1. Never meet? Parallel ∥</div>
          <div className="mt-1">2. Meet at 90°? Perpendicular ⊥</div>
          <div className="mt-1">3. Meet at any other angle? Just intersecting</div>
        </div>
        <KeyIdea>
          💡 Parallel and perpendicular answer opposite questions, so one pair of lines can never be
          both.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
