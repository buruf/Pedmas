"use client";

import { useState } from "react";
import { MathText } from "@/components/MathText";
import { Step, KeyIdea, FormulaBox, WrongBox } from "@/components/lesson/Step";
import { LessonShell, TryIt } from "@/components/lesson/LessonShell";
import { PrimaryButton } from "@/components/ui";

const W = 300;
const H = 200;
const X_MIN = -5;
const X_MAX = 7;
const Y_MIN = -3;
const Y_MAX = 11;
const px = (x: number) => ((x - X_MIN) / (X_MAX - X_MIN)) * W;
const py = (y: number) => H - ((y - Y_MIN) / (Y_MAX - Y_MIN)) * H;

/** Sample a curve across the visible window, clipping anything off the top. */
function curve(f: (x: number) => number): string {
  const pts: string[] = [];
  for (let i = 0; i <= 140; i++) {
    const x = X_MIN + ((X_MAX - X_MIN) * i) / 140;
    const y = f(x);
    if (y >= Y_MIN - 0.5 && y <= Y_MAX + 0.5) pts.push(`${px(x).toFixed(1)},${py(y).toFixed(1)}`);
  }
  return pts.join(" ");
}

/** Two parabolas on one set of axes, with their lowest points marked. */
function ShiftGraph({
  curves,
  label,
}: {
  curves: { f: (x: number) => number; colour: string; vertex: [number, number]; name: string; dash?: boolean }[];
  label?: string;
}) {
  return (
    <figure className="m-0">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: W }} role="img" aria-label={label ?? "graph"}>
        {Array.from({ length: X_MAX - X_MIN + 1 }, (_, i) => X_MIN + i).map((v) => (
          <line key={`v${v}`} x1={px(v)} y1={0} x2={px(v)} y2={H} stroke="#f3f4f6" strokeWidth="1" />
        ))}
        {Array.from({ length: Y_MAX - Y_MIN + 1 }, (_, i) => Y_MIN + i).map((v) => (
          <line key={`h${v}`} x1={0} y1={py(v)} x2={W} y2={py(v)} stroke="#f3f4f6" strokeWidth="1" />
        ))}
        <line x1={0} y1={py(0)} x2={W} y2={py(0)} stroke="#94a3b8" strokeWidth="1.6" />
        <line x1={px(0)} y1={0} x2={px(0)} y2={H} stroke="#94a3b8" strokeWidth="1.6" />
        {[-4, -2, 2, 4, 6].map((v) => (
          <text key={v} x={px(v)} y={py(0) + 12} fontSize="9" textAnchor="middle" fill="#6b7280">
            {v}
          </text>
        ))}
        {curves.map((c, i) => (
          <g key={i}>
            <polyline
              points={curve(c.f)}
              fill="none"
              stroke={c.colour}
              strokeWidth="2.4"
              strokeDasharray={c.dash ? "5 4" : undefined}
            />
            <circle cx={px(c.vertex[0])} cy={py(c.vertex[1])} r="4" fill={c.colour} />
          </g>
        ))}
        {curves.map((c, i) => (
          <text key={`t${i}`} x={8} y={14 + i * 14} fontSize="11" fontWeight="700" fill={c.colour}>
            {c.name}
          </text>
        ))}
      </svg>
    </figure>
  );
}

/**
 * Transformations of graphs.
 *
 * The horizontal shift is genuinely counter-intuitive — f(x − 3) moves the
 * graph RIGHT — and telling a student that never sticks. Here the claim is
 * settled by finding where the lowest point of the parabola actually lands.
 */
export function FunctionTransformLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [guess, setGuess] = useState<string | null>(null);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 11 · Functions · Transformations"
      title="Moving a graph without redrawing it"
      minutes={6}
      step={step}
      total={7}
    >
      <Step n={1} title="One shape, many places" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          A graphic designer does not redraw a logo to move it across the page. They drag it. The
          shape is unchanged; only its position is different.
        </p>
        <p className="mt-3 text-ink-700">
          Graphs work the same way. Once you know the shape of{" "}
          <MathText text="y = x^2" />, you can place it anywhere — without plotting a single new
          point.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(2)}>Show me the base shape</PrimaryButton></div>
      </Step>

      <Step n={2} title="The one you already know" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <p className="text-ink-700">
          <MathText text="y = x^2" /> — a valley with its lowest point at the origin.
        </p>
        <div className="mt-3">
          <ShiftGraph
            curves={[{ f: (x) => x * x, colour: "#7c3aed", vertex: [0, 0], name: "y = x²" }]}
            label="the parabola y equals x squared"
          />
        </div>
        <div className="mt-3 space-y-2">
          {[
            ["x = 0", "y = 0 — the lowest point"],
            ["x = 1", "y = 1"],
            ["x = 2", "y = 4"],
            ["x = 3", "y = 9"],
          ].map(([a, b]) => (
            <div key={a} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-bold text-ink-900"><MathText text={a} /></span>
              <span className="text-sm text-ink-700"><MathText text={b} /></span>
            </div>
          ))}
        </div>
        <div className="mt-4"><PrimaryButton onClick={() => go(3)}>Now move it</PrimaryButton></div>
      </Step>

      <Step n={3} title="The new problem" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">
          Which way does <MathText text="y = (x − 3)^2" className="font-bold text-ink-900" /> sit
          compared with <MathText text="y = x^2" />?
        </p>
        <div className="mt-4 grid gap-2">
          {[
            { k: "left", label: "Left 3 — there is a minus 3 in it" },
            { k: "right", label: "Right 3" },
            { k: "down", label: "Down 3" },
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
            Rather than argue, let&rsquo;s find where the lowest point ends up.
            <div className="mt-3"><PrimaryButton onClick={() => go(4)}>Find it</PrimaryButton></div>
          </div>
        )}
      </Step>

      <Step n={4} title="The mistake almost everyone makes" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <WrongBox>
          <MathText text="y = (x − 3)^2" /> is <MathText text="y = x^2" /> shifted{" "}
          <strong>left</strong> 3
        </WrongBox>
        <p className="text-ink-700">
          Minus means left on a number line, so the guess is a fair one. Test it by asking a
          question the graph must answer: <strong>where is the bottom of the valley now?</strong>
        </p>
        <p className="mt-3 text-ink-700">
          The valley bottom is wherever the squared part equals 0 — nothing squared can be less
          than 0.
        </p>
        <div className="mt-3 space-y-2">
          {[
            ["The squared part is", "(x − 3)^2"],
            ["It hits 0 when", "x − 3 = 0"],
            ["That is at", "x = 3"],
          ].map(([a, b], i) => (
            <div key={i} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-semibold text-ink-900"><MathText text={a} /></span>
              <span className="text-sm font-bold text-ink-700"><MathText text={b} /></span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-ink-700">
          The bottom was at <MathText text="x = 0" />. It is now at <MathText text="x = 3" />, which
          is 3 to the <strong>right</strong>. And 3 is positive, so it certainly is not on the left.
        </p>
        <div className="mt-3">
          <ShiftGraph
            curves={[
              { f: (x) => x * x, colour: "#cbd5e1", vertex: [0, 0], name: "y = x²", dash: true },
              { f: (x) => (x - 3) ** 2, colour: "#7c3aed", vertex: [3, 0], name: "y = (x − 3)²" },
            ]}
            label="the parabola shifted three to the right"
          />
        </div>
        <div className="mt-4"><PrimaryButton onClick={() => go(5)}>Why on earth?</PrimaryButton></div>
      </Step>

      <Step n={5} title="Why inside is backwards" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">
          The <MathText text="− 3" /> is not changing the output. It is changing the input{" "}
          <em>before</em> the squaring happens.
        </p>
        <p className="mt-3 text-ink-700">
          To get the output 0, the old graph needed <MathText text="x = 0" />. The new one needs{" "}
          <MathText text="x − 3 = 0" />, so it needs an <strong>x that is 3 bigger</strong>. Every
          output is delayed until x has caught up — which drags the whole picture to the right.
        </p>
        <FormulaBox>
          <div className="text-base">
            <MathText text="f(x − h)" /> → right <MathText text="h" /> &nbsp;·&nbsp;{" "}
            <MathText text="f(x) + k" /> → up <MathText text="k" />
          </div>
        </FormulaBox>
        <div className="mt-3 space-y-2">
          {[
            ["Inside the bracket", "changes the input", "horizontal — and backwards"],
            ["Outside the bracket", "changes the output", "vertical — and as expected"],
          ].map(([a, b, c]) => (
            <div key={a} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-semibold text-ink-900">{a}</span>
              <span className="text-sm text-brand-700">{b}</span>
              <span className="text-sm text-ink-500">{c}</span>
            </div>
          ))}
        </div>
        <KeyIdea>
          Only the horizontal one is surprising, and only because it acts on the input. Vertical
          shifts, stretches and flips all behave exactly as they look.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(6)}>Put them together</PrimaryButton></div>
      </Step>

      <Step n={6} title="Both at once" open={step === 6} onOpen={() => go(6)} done={step > 6}>
        <p className="text-ink-700">
          Describe <MathText text="y = (x − 3)^2 + 2" className="font-bold text-ink-900" />.
        </p>
        <div className="mt-3 rounded-2xl bg-paper p-4">
          <ol className="space-y-2">
            {[
              ["Inside: x − 3", "right 3"],
              ["Outside: + 2", "up 2"],
              ["So the lowest point moves from (0, 0) to", "(3, 2)"],
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
        <div className="mt-3">
          <ShiftGraph
            curves={[
              { f: (x) => x * x, colour: "#cbd5e1", vertex: [0, 0], name: "y = x²", dash: true },
              { f: (x) => (x - 3) ** 2 + 2, colour: "#0d9488", vertex: [3, 2], name: "y = (x − 3)² + 2" },
            ]}
            label="the parabola shifted right three and up two"
          />
        </div>
        <p className="mt-3 text-ink-700">
          Check with real numbers: <MathText text="x = 3" /> gives{" "}
          <MathText text="0 + 2 = 2" />, <MathText text="x = 4" /> gives{" "}
          <MathText text="1 + 2 = 3" />, <MathText text="x = 5" /> gives{" "}
          <MathText text="4 + 2 = 6" />. The same 0, 1, 4 heights as{" "}
          <MathText text="y = x^2" /> — just started 3 later and lifted 2. ✓
        </p>
        <div className="mt-3 space-y-2">
          {[
            ["y = −f(x)", "flip over the x-axis — every height changes sign"],
            ["y = 3f(x)", "stretch upward — every height triples"],
            ["y = f(x + 4)", "left 4 — the input is now reached 4 sooner"],
          ].map(([a, b]) => (
            <div key={a} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-bold text-ink-900"><MathText text={a} /></span>
              <span className="text-sm text-ink-700">{b}</span>
            </div>
          ))}
        </div>
        <div className="mt-4"><PrimaryButton onClick={() => go(7)}>Your turn</PrimaryButton></div>
      </Step>

      <Step n={7} title="You try one" open={step === 7} onOpen={() => go(7)} done={false}>
        <p className="text-ink-700">
          The point <MathText text="(2, 5)" /> lies on <MathText text="y = f(x)" />. The graph is
          redrawn as <MathText text="y = f(x − 4) + 3" className="font-bold text-ink-900" />.
        </p>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          Inside is <MathText text="x − 4" />, so the whole graph slides{" "}
          <strong>right 4</strong>. Outside is <MathText text="+ 3" />, so it also rises 3.
        </div>
        <TryIt
          prompt={<>2. The point lands at (?, 8). What is its new x-coordinate?</>}
          accept={["6"]}
          placeholder="a number"
          value={fade}
          setValue={setFade}
          hint="right 4 means the x-coordinate grows by 4, not shrinks."
          explain={
            <>
              <MathText text="2 + 4 = 6" />, so the point moves to <MathText text="(6, 8)" />.
              Sanity check: <MathText text="f(6 − 4) + 3 = f(2) + 3 = 5 + 3 = 8" /> ✓
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Transformations</div>
          <div className="mt-2">1. Inside the bracket → horizontal, and backwards</div>
          <div className="mt-1">2. Outside the bracket → vertical, and as written</div>
          <div className="mt-1">3. f(x − h) + k moves the whole graph right h, up k</div>
          <div className="mt-1">4. Lost? Find where one known point lands</div>
        </div>
        <KeyIdea>
          💡 If you ever doubt the direction, ask what x now makes the bracket zero. That single
          number settles it every time.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
