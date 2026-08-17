"use client";

import { useState } from "react";
import { Step, KeyIdea, WrongBox } from "@/components/lesson/Step";
import { LessonShell, TryIt } from "@/components/lesson/LessonShell";
import { PrimaryButton } from "@/components/ui";

/**
 * Naming 2D shapes by their attributes (Grade 1).
 *
 * Two errors run through the whole bank. The first is that a shape's name
 * changes when you turn it — a tilted square becomes "a diamond". The second is
 * that sides and corners are the same word for the same thing. Both are fixed
 * by the same move: count what the shape has, with the shape sitting in more
 * than one position.
 */

type Pt = [number, number];

const TONE = {
  brand: { fill: "#ede9fe", stroke: "#7c3aed" },
  ok: { fill: "#dcfce7", stroke: "#16a34a" },
  err: { fill: "#fee2e2", stroke: "#dc2626" },
} as const;

/** Vertices of a regular n-gon sitting the way a child expects to see it. */
function regular(n: number, r: number, extraDeg: number): Pt[] {
  const start = n % 2 === 1 ? -90 : -90 + 180 / n;
  return Array.from({ length: n }, (_, i) => {
    const a = ((start + extraDeg + (i * 360) / n) * Math.PI) / 180;
    return [r * Math.cos(a), r * Math.sin(a)] as Pt;
  });
}

/**
 * One shape, drawn big. `numberSides` writes 1..n along the edges and
 * `numberVertices` puts a numbered dot on each corner — the only reliable way
 * to show a six-year-old that those two counts are separate questions.
 */
function ShapeFig({
  sides,
  rotate = 0,
  points,
  size = 116,
  label,
  tone = "brand",
  numberSides = false,
  numberVertices = false,
}: {
  /** 0 draws a circle */
  sides?: number;
  rotate?: number;
  /** explicit corners in a −1..1 box, for shapes that are not regular */
  points?: Pt[];
  size?: number;
  label?: string;
  tone?: keyof typeof TONE;
  numberSides?: boolean;
  numberVertices?: boolean;
}) {
  const c = size / 2;
  const r = size * 0.38;
  const colours = TONE[tone];
  const pts: Pt[] = points
    ? points.map(([x, y]) => [x * r, y * r] as Pt)
    : sides && sides >= 3
      ? regular(sides, r, rotate)
      : [];

  return (
    <figure className="m-0">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        width="100%"
        style={{ maxWidth: size }}
        role="img"
        aria-label={label ?? (sides ? `shape with ${sides} sides` : "circle")}
      >
        {pts.length === 0 ? (
          <circle cx={c} cy={c} r={r} fill={colours.fill} stroke={colours.stroke} strokeWidth="3" />
        ) : (
          <polygon
            points={pts.map(([x, y]) => `${c + x},${c + y}`).join(" ")}
            fill={colours.fill}
            stroke={colours.stroke}
            strokeWidth="3"
            strokeLinejoin="round"
          />
        )}
        {numberSides &&
          pts.map((p, i) => {
            const q = pts[(i + 1) % pts.length];
            const mx = c + (p[0] + q[0]) / 2;
            const my = c + (p[1] + q[1]) / 2;
            const px = mx + (mx - c) * 0.28;
            const py = my + (my - c) * 0.28;
            return (
              <text
                key={`s${i}`}
                x={px}
                y={py + 3.5}
                fontSize="11"
                fontWeight="700"
                textAnchor="middle"
                fill={colours.stroke}
              >
                {i + 1}
              </text>
            );
          })}
        {numberVertices &&
          pts.map((p, i) => (
            <g key={`v${i}`}>
              <circle cx={c + p[0]} cy={c + p[1]} r="6.5" fill="#d97706" />
              <text
                x={c + p[0]}
                y={c + p[1] + 3.5}
                fontSize="9"
                fontWeight="700"
                textAnchor="middle"
                fill="#fff"
              >
                {i + 1}
              </text>
            </g>
          ))}
      </svg>
      {label && (
        <figcaption className="mt-1 text-center text-sm font-semibold text-ink-700">{label}</figcaption>
      )}
    </figure>
  );
}

export function ShapeAttributesLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [guess, setGuess] = useState<string | null>(null);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 1 · Geometry · Shape Attributes"
      title="What makes a shape that shape"
      minutes={4}
      step={step}
      total={7}
    >
      <Step n={1} title="Two shapes, or one?" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <div className="flex flex-wrap items-center justify-center gap-6">
          <ShapeFig sides={4} label="this one" />
          <ShapeFig sides={4} rotate={45} label="and this one" />
        </div>
        <p className="mt-4 text-ink-700">Is the tilted one still a square?</p>
        <div className="mt-3 grid gap-2">
          {[
            { k: "b", label: "No — that one is a diamond" },
            { k: "a", label: "Yes — it is still a square" },
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
            Let&rsquo;s count and find out.
            <div className="mt-3">
              <PrimaryButton onClick={() => go(2)}>Show me</PrimaryButton>
            </div>
          </div>
        )}
      </Step>

      <Step n={2} title="You already count sides" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <p className="text-ink-700">A side is one straight edge. Count them all the way round.</p>
        <div className="mt-4 flex flex-wrap items-start justify-center gap-4">
          <ShapeFig sides={3} label="3 sides — triangle" numberSides />
          <ShapeFig sides={4} label="4 sides — square" numberSides />
          <ShapeFig sides={6} label="6 sides — hexagon" numberSides />
        </div>
        <KeyIdea>The number of straight sides gives the shape its name.</KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(3)}>Now turn one</PrimaryButton>
        </div>
      </Step>

      <Step n={3} title="Turn it round" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">Here is the same square, tipped over. Count its sides again.</p>
        <div className="mt-4 flex justify-center">
          <ShapeFig sides={4} rotate={45} size={140} label="1, 2, 3, 4" numberSides />
        </div>
        <p className="mt-4 text-ink-700">
          Still 4 straight sides. Still all the same length. Nothing was cut off or added.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(4)}>So why does it look new?</PrimaryButton>
        </div>
      </Step>

      <Step n={4} title="The mistake lots of people make" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <WrongBox>&ldquo;Turned round, a square becomes a diamond&rdquo;</WrongBox>
        <p className="text-ink-700">
          Turning a shape moves it. It does not change it. Put a real square on the table and spin
          it — you never have to go and get a different shape.
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <ShapeFig sides={4} size={90} label="4 sides" tone="ok" />
          <ShapeFig sides={4} rotate={20} size={90} label="4 sides" tone="ok" />
          <ShapeFig sides={4} rotate={45} size={90} label="4 sides" tone="ok" />
        </div>
        <p className="mt-4 text-center font-bold text-ok-600">All three are squares.</p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(5)}>What is the big idea?</PrimaryButton>
        </div>
      </Step>

      <Step n={5} title="Name it by what it has" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">To name a shape, ask what it <strong>has</strong>:</p>
        <div className="mt-3 space-y-2">
          {[
            ["How many straight sides?", "4"],
            ["Are the sides all the same?", "yes"],
            ["Are all the corners square?", "yes"],
            ["So it is a…", "square"],
          ].map(([a, b], i) => (
            <div key={i} className="flex items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm text-ink-700">{a}</span>
              <span className="text-sm font-bold text-ink-900">{b}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-ink-700">
          None of those questions asks which way up it is. That is why turning it changes nothing.
        </p>
        <KeyIdea>
          A shape&rsquo;s name comes from its sides and corners — never from how it is sitting.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(6)}>Sides and corners</PrimaryButton>
        </div>
      </Step>

      <Step n={6} title="Sides and corners are two different counts" open={step === 6} onOpen={() => go(6)} done={step > 6}>
        <p className="text-ink-700">
          A <strong>side</strong> is a straight edge. A <strong>corner</strong> is a point where two
          sides meet. Grown-ups call a corner a <strong>vertex</strong>.
        </p>
        <div className="mt-4 flex flex-wrap items-start justify-center gap-5">
          <ShapeFig sides={6} size={130} label="6 sides" numberSides />
          <ShapeFig sides={6} size={130} label="6 corners" numberVertices />
        </div>
        <p className="mt-4 text-ink-700">
          A hexagon has <strong>6 sides</strong> and <strong>6 corners</strong>. For shapes made of
          straight sides, the two counts always match — so if you get different numbers, count again.
        </p>
        <div className="mt-4 flex justify-center">
          <ShapeFig sides={0} size={110} label="a circle: 0 straight sides, 0 corners" tone="ok" />
        </div>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(7)}>Your turn</PrimaryButton>
        </div>
      </Step>

      <Step n={7} title="You try one" open={step === 7} onOpen={() => go(7)} done={false}>
        <p className="text-ink-700">Here is a triangle, tipped on its side.</p>
        <div className="mt-3 flex justify-center">
          <ShapeFig sides={3} rotate={110} size={140} label="count the corners" numberVertices />
        </div>
        <TryIt
          prompt={<>How many corners does it have?</>}
          accept={["3"]}
          placeholder="a number"
          value={fade}
          setValue={setFade}
          hint="touch each point where two straight sides meet, and count."
          explain={
            <>
              <strong>3 corners</strong> — and 3 sides too. Tipping it over did not take any of them
              away, so it is still a triangle.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Naming a shape</div>
          <div className="mt-2">1. Count the straight sides</div>
          <div className="mt-1">2. Count the corners</div>
          <div className="mt-1">3. Turning it changes neither</div>
        </div>
        <KeyIdea>
          💡 A square that is tipped over is still a square. Count, don&rsquo;t guess from the look.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
