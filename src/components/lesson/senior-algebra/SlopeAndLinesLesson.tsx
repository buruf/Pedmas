"use client";

import { useId, useState } from "react";
import { MathText } from "@/components/MathText";
import { Step, KeyIdea, WrongBox, FormulaBox } from "@/components/lesson/Step";
import { LessonShell, TryIt } from "@/components/lesson/LessonShell";
import { PrimaryButton } from "@/components/ui";

/* ------------------------------------------------------------- local plot */

type PlotLine = { m: number; b: number; colour?: string; dash?: boolean };
type PlotPoint = { x: number; y: number; label?: string; colour?: string };

/**
 * A small coordinate plane. Local to this file on purpose — the senior-algebra
 * lessons need a grid, and the shared Models.tsx is a primary-school toolkit.
 */
function Plot({
  lines = [],
  points = [],
  verticals = [],
  triangle,
  min = -6,
  max = 6,
  size = 200,
  caption,
}: {
  lines?: PlotLine[];
  points?: PlotPoint[];
  /** vertical lines x = k, which no y = mx + b can describe */
  verticals?: number[];
  triangle?: { x1: number; y1: number; x2: number; y2: number; runText?: string; riseText?: string };
  min?: number;
  max?: number;
  size?: number;
  caption?: string;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const px = (v: number) => ((v - min) / (max - min)) * size;
  const py = (v: number) => size - px(v);
  const ticks: number[] = [];
  for (let v = Math.ceil(min); v <= max; v++) ticks.push(v);

  return (
    <figure className="m-0">
      <svg
        viewBox={`-12 -10 ${size + 24} ${size + 24}`}
        width="100%"
        style={{ maxWidth: size + 40 }}
        role="img"
        aria-label={caption ?? "coordinate grid"}
      >
        <defs>
          <clipPath id={`plotclip${uid}`}>
            <rect x="0" y="0" width={size} height={size} />
          </clipPath>
        </defs>
        {ticks.map((v) => (
          <g key={v}>
            <line x1={px(v)} y1={0} x2={px(v)} y2={size} stroke="#f3f4f6" strokeWidth="1" />
            <line x1={0} y1={py(v)} x2={size} y2={py(v)} stroke="#f3f4f6" strokeWidth="1" />
          </g>
        ))}
        <line x1={0} y1={py(0)} x2={size} y2={py(0)} stroke="#6b7280" strokeWidth="1.5" />
        <line x1={px(0)} y1={0} x2={px(0)} y2={size} stroke="#6b7280" strokeWidth="1.5" />
        <text x={size + 2} y={py(0) + 4} fontSize="9" fill="#6b7280">x</text>
        <text x={px(0) - 10} y={-1} fontSize="9" fill="#6b7280">y</text>

        <g clipPath={`url(#plotclip${uid})`}>
          {triangle && (
            <g>
              <line
                x1={px(triangle.x1)}
                y1={py(triangle.y1)}
                x2={px(triangle.x2)}
                y2={py(triangle.y1)}
                stroke="#f59e0b"
                strokeWidth="2"
                strokeDasharray="4 3"
              />
              <line
                x1={px(triangle.x2)}
                y1={py(triangle.y1)}
                x2={px(triangle.x2)}
                y2={py(triangle.y2)}
                stroke="#16a34a"
                strokeWidth="2"
                strokeDasharray="4 3"
              />
            </g>
          )}
          {lines.map((l, i) => (
            <line
              key={i}
              x1={px(min)}
              y1={py(l.m * min + l.b)}
              x2={px(max)}
              y2={py(l.m * max + l.b)}
              stroke={l.colour ?? "#7c3aed"}
              strokeWidth="2.4"
              strokeDasharray={l.dash ? "6 4" : undefined}
            />
          ))}
          {verticals.map((v, i) => (
            <line key={i} x1={px(v)} y1={0} x2={px(v)} y2={size} stroke="#dc2626" strokeWidth="2.4" />
          ))}
        </g>

        {triangle?.runText && (
          <text
            x={(px(triangle.x1) + px(triangle.x2)) / 2}
            y={py(triangle.y1) + 13}
            fontSize="10"
            fontWeight="700"
            textAnchor="middle"
            fill="#b45309"
          >
            {triangle.runText}
          </text>
        )}
        {triangle?.riseText && (
          <text
            x={px(triangle.x2) + 5}
            y={(py(triangle.y1) + py(triangle.y2)) / 2 + 3}
            fontSize="10"
            fontWeight="700"
            fill="#15803d"
          >
            {triangle.riseText}
          </text>
        )}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={px(p.x)} cy={py(p.y)} r="4.5" fill={p.colour ?? "#111827"} />
            {p.label && (
              <text x={px(p.x) + 7} y={py(p.y) - 6} fontSize="10" fontWeight="700" fill="#111827">
                {p.label}
              </text>
            )}
          </g>
        ))}
      </svg>
      {caption && (
        <figcaption className="mt-1 text-center text-sm font-semibold text-ink-700">
          <MathText text={caption} />
        </figcaption>
      )}
    </figure>
  );
}

/** Shared list layout for a run of worked steps. */
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

/* ------------------------------------------------------------------ slope */

/**
 * Slope.
 *
 * Three errors live here and they are all about direction: rise and run
 * swapped, a negative slope described as "no slope", and zero slope confused
 * with undefined slope. Each is settled by walking the line rather than by
 * quoting the formula.
 */
export function SlopeLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 9 · Linear relations · Slope"
      title="How steep is a line?"
      minutes={6}
      step={step}
      total={6}
    >
      <Step n={1} title="Steepness is a number" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          A wheelchair ramp is allowed to climb 1 metre for every 12 metres it travels forward. A
          staircase climbs about 1 for every 2. A ladder climbs 4 for every 1.
        </p>
        <p className="mt-3 text-ink-700">
          Same idea every time: <strong>how far up</strong>, divided by <strong>how far across</strong>.
          That number is the slope.
        </p>
        <div className="mt-3 space-y-2">
          {[
            ["ramp", "1 up per 12 across", "gentle"],
            ["stairs", "1 up per 2 across", "steep"],
            ["ladder", "4 up per 1 across", "very steep"],
          ].map(([a, b, c]) => (
            <div key={a} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-semibold text-ink-900">{a}</span>
              <span className="text-sm text-brand-700">{b}</span>
              <span className="text-sm text-ink-500">{c}</span>
            </div>
          ))}
        </div>
        <div className="mt-4"><PrimaryButton onClick={() => go(2)}>Put it on a grid</PrimaryButton></div>
      </Step>

      <Step n={2} title="Two points, one number" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <p className="text-ink-700">
          A line passes through <strong>(0, −4)</strong> and <strong>(2, 2)</strong>. How steep is it?
        </p>
        <div className="mt-4">
          <Plot
            lines={[{ m: 3, b: -4 }]}
            points={[
              { x: 0, y: -4, label: "(0, −4)" },
              { x: 2, y: 2, label: "(2, 2)" },
            ]}
            triangle={{ x1: 0, y1: -4, x2: 2, y2: 2, runText: "across 2", riseText: "up 6" }}
            caption="across 2, up 6"
          />
        </div>
        <p className="mt-3 text-ink-700">
          Going from the first point to the second, y climbed <strong>6</strong> while x moved{" "}
          <strong>2</strong> across.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(3)}>So what is the slope?</PrimaryButton></div>
      </Step>

      <Step n={3} title="The mistake almost everyone makes" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <WrongBox>
          slope <MathText text="= {across/up} = {2/6} = {1/3}" />
        </WrongBox>
        <p className="text-ink-700">
          Both numbers are sitting right there, so it is easy to divide them the wrong way round.
          Let the line decide which is correct.
        </p>
        <p className="mt-3 text-ink-700">
          Step across just <strong>1</strong>, to <MathText text="x = 1" />. The point on the line
          there is <strong>(1, −1)</strong>.
        </p>
        <div className="mt-4">
          <Plot
            lines={[{ m: 3, b: -4 }]}
            points={[
              { x: 0, y: -4 },
              { x: 1, y: -1, label: "(1, −1)" },
              { x: 2, y: 2 },
            ]}
            triangle={{ x1: 0, y1: -4, x2: 1, y2: -1, runText: "across 1", riseText: "up 3" }}
            caption="one step across lifts you 3"
          />
        </div>
        <p className="mt-3 text-ink-700">
          From <MathText text="y = −4" /> to <MathText text="y = −1" /> is a climb of{" "}
          <strong>3</strong> — not <MathText text="{1/3}" />. Slope is what happens{" "}
          <em>per one step across</em>, so the rise goes on top.
        </p>
        <FormulaBox>
          <MathText text="m = {rise/run} = {y_2 − y_1/x_2 − x_1}" />
        </FormulaBox>
        <p className="text-center text-lg font-bold text-ok-600">
          <MathText text="m = {6/2} = 3" />
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(4)}>What about flat and upright lines?</PrimaryButton></div>
      </Step>

      <Step n={4} title="Zero slope is not the same as no slope" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <WrongBox>&ldquo;That line has no slope&rdquo;</WrongBox>
        <p className="text-ink-700">
          Lots of people use &ldquo;no slope&rdquo; for three completely different lines, and then
          cannot tell them apart later. Name what actually happens to the fraction.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-5">
          <Plot lines={[{ m: 0, b: 2, colour: "#16a34a" }]} size={130} caption="y = 2" />
          <Plot verticals={[2]} size={130} caption="x = 2" />
          <Plot lines={[{ m: -2, b: 1, colour: "#dc2626" }]} size={130} caption="y = −2x + 1" />
        </div>
        <div className="mt-4 space-y-2">
          {[
            ["flat line", "rise 0, run 4", "m = {0/4} = 0 — a real slope, and it is zero"],
            ["upright line", "rise 5, run 0", "m = {5/0} — undefined, you cannot divide by 0"],
            ["downhill line", "rise −4, run 2", "m = −2 — a perfectly ordinary negative slope"],
          ].map(([a, b, c]) => (
            <div key={a} className="rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-semibold text-ink-900">{a}</span>
              <span className="ml-2 text-sm text-ink-500">{b}</span>
              <div className="mt-0.5 text-sm text-brand-700"><MathText text={c} /></div>
            </div>
          ))}
        </div>
        <KeyIdea>
          A negative slope is not a broken slope — it just means y falls as x grows. Only an{" "}
          <strong>upright</strong> line has no slope, and the reason is a zero on the bottom.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(5)}>A full example</PrimaryButton></div>
      </Step>

      <Step n={5} title="Worked example" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">
          Find the slope of the line through <strong>(−4, 5)</strong> and <strong>(1, −5)</strong>.
        </p>
        <WorkList
          rows={[
            ["Rise: the change in y", "−5 − 5 = −10"],
            ["Run: the change in x", "1 − (−4) = 5"],
            ["Slope is rise over run", "m = {−10/5} = −2"],
          ]}
        />
        <div className="mt-4">
          <Plot
            lines={[{ m: -2, b: -3, colour: "#dc2626" }]}
            points={[
              { x: -4, y: 5, label: "(−4, 5)" },
              { x: 1, y: -5, label: "(1, −5)" },
            ]}
            triangle={{ x1: -4, y1: 5, x2: 1, y2: -5, runText: "across 5", riseText: "down 10" }}
            caption="m = −2"
          />
        </div>
        <p className="mt-3 text-ink-700">
          Check it by walking: start at <strong>(−4, 5)</strong>, go 5 across and 10 down — you land
          on <strong>(1, −5)</strong>. ✓ And the slope is negative because the line falls. ✓
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(6)}>Your turn</PrimaryButton></div>
      </Step>

      <Step n={6} title="You try one" open={step === 6} onOpen={() => go(6)} done={false}>
        <p className="text-ink-700">
          Find the slope of the line through <strong>(−2, −3)</strong> and <strong>(2, 5)</strong>.
        </p>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          Rise: <MathText text="5 − (−3) = 8" />. &nbsp; Run: <MathText text="2 − (−2) = 4" />.
        </div>
        <div className="mt-3">
          <Plot
            lines={[{ m: 2, b: 1 }]}
            points={[
              { x: -2, y: -3, label: "(−2, −3)" },
              { x: 2, y: 5, label: "(2, 5)" },
            ]}
            triangle={{ x1: -2, y1: -3, x2: 2, y2: 5, runText: "across 4", riseText: "up 8" }}
          />
        </div>
        <TryIt
          prompt={<>2. Now divide rise by run. What is the slope?</>}
          accept={["2"]}
          placeholder="the slope"
          value={fade}
          setValue={setFade}
          hint="rise goes on top: 8 divided by 4."
          explain={
            <>
              <MathText text="m = {8/4} = 2" />. Check by walking one step across from (−2, −3):
              you reach (−1, −1), which is 2 higher. ✓
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Slope</div>
          <div className="mt-2">1. <MathText text="m = {y_2 − y_1/x_2 − x_1}" /> — rise on top</div>
          <div className="mt-1">2. Negative slope means the line falls</div>
          <div className="mt-1">3. Flat line: m = 0. Upright line: m is undefined</div>
        </div>
        <KeyIdea>
          💡 Slope answers one question: <strong>if x moves one step right, how far does y move?</strong>{" "}
          Every rule above is just that sentence.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}

/* -------------------------------------------------------- linear equation */

/**
 * y = mx + b.
 *
 * The misconception is a straight swap: m and b read off a graph the wrong way
 * round. Substituting a point the line visibly passes through settles it in one
 * line of arithmetic, which is also the habit worth keeping.
 */
export function LinearEquationLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 9 · Linear relations · Equation of a line"
      title="Writing the equation of a line"
      minutes={6}
      step={step}
      total={6}
    >
      <Step n={1} title="A joining fee and a monthly fee" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          A gym charges <strong>$30 to join</strong> and then <strong>$5 a month</strong>. After{" "}
          <MathText text="x" /> months you have paid
        </p>
        <FormulaBox><MathText text="y = 5x + 30" /></FormulaBox>
        <p className="text-ink-700">
          Two different jobs are being done by those two numbers. <strong>30</strong> is where you
          start — you pay it before a single month passes. <strong>5</strong> is the rate — what each
          extra month costs.
        </p>
        <KeyIdea>
          Every straight line is a starting value plus a steady rate. That is all{" "}
          <MathText text="y = mx + b" /> says.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(2)}>Now read one off a graph</PrimaryButton></div>
      </Step>

      <Step n={2} title="The new problem" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <p className="text-ink-700">Write the equation of this line.</p>
        <div className="mt-4">
          <Plot
            lines={[{ m: 2, b: 1 }]}
            points={[
              { x: 0, y: 1, label: "(0, 1)" },
              { x: 3, y: 7, label: "(3, 7)" },
            ]}
            min={-4}
            max={8}
            size={210}
            caption="crosses the y-axis at 1, climbs 2 for every 1 across"
          />
        </div>
        <p className="mt-3 text-ink-700">
          Two facts are visible: it crosses the y-axis at <strong>1</strong>, and it climbs{" "}
          <strong>2</strong> for every <strong>1</strong> across.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(3)}>Write it</PrimaryButton></div>
      </Step>

      <Step n={3} title="The mistake almost everyone makes" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <WrongBox><MathText text="y = 1x + 2" /></WrongBox>
        <p className="text-ink-700">
          The two numbers 1 and 2 both came off the graph, so it is easy to drop them into the wrong
          slots. Nothing about the equation looks wrong. So test it.
        </p>
        <p className="mt-3 text-ink-700">
          The graph clearly passes through <strong>(3, 7)</strong>. Put <MathText text="x = 3" /> into
          each candidate.
        </p>
        <div className="mt-3 space-y-2">
          {[
            ["y = x + 2", "3 + 2 = 5", "but the graph is at 7 ✗"],
            ["y = 2x + 1", "6 + 1 = 7", "matches the graph ✓"],
          ].map(([a, b, c]) => (
            <div key={a} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-bold text-ink-900"><MathText text={a} /></span>
              <span className="text-sm text-brand-700"><MathText text={b} /></span>
              <span className="text-sm text-ink-500">{c}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-center text-lg font-bold text-ok-600">
          <MathText text="y = 2x + 1" />
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(4)}>How do I stop swapping them?</PrimaryButton></div>
      </Step>

      <Step n={4} title="One is where, the other is how fast" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <p className="text-ink-700">
          Ask what each number would mean if <MathText text="x = 0" />.
        </p>
        <div className="mt-3 space-y-2">
          {[
            ["b", "where the line starts", "put x = 0 and everything with an x disappears, leaving b"],
            ["m", "how fast it climbs", "it is attached to x, so it only acts once x starts moving"],
          ].map(([a, b, c]) => (
            <div key={a} className="rounded-xl bg-paper px-3 py-2">
              <span className="text-lg font-black text-brand-700"><MathText text={a} /></span>
              <span className="ml-3 text-sm font-semibold text-ink-900">{b}</span>
              <div className="mt-0.5 text-sm text-ink-700">{c}</div>
            </div>
          ))}
        </div>
        <KeyIdea>
          <MathText text="b" /> never touches <MathText text="x" />, so it cannot change with{" "}
          <MathText text="x" /> — it has to be the starting height. Whatever multiplies{" "}
          <MathText text="x" /> is the slope.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(5)}>From two points</PrimaryButton></div>
      </Step>

      <Step n={5} title="Worked example: only two points given" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">
          A line passes through <strong>(1, 5)</strong> and <strong>(3, 11)</strong>. Find its
          equation. There is no graph, so find <MathText text="m" /> first and{" "}
          <MathText text="b" /> second.
        </p>
        <WorkList
          rows={[
            ["Slope: rise over run", "m = {11 − 5/3 − 1} = {6/2} = 3"],
            ["So far", "y = 3x + b"],
            ["Put in a point you know: (1, 5)", "5 = 3(1) + b"],
            ["Solve for b", "b = 2"],
            ["The equation", "y = 3x + 2"],
          ]}
        />
        <p className="mt-3 text-ink-700">
          Check with the <em>other</em> point, the one you did not use:{" "}
          <MathText text="3(3) + 2 = 11" /> ✓
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(6)}>Your turn</PrimaryButton></div>
      </Step>

      <Step n={6} title="You try one" open={step === 6} onOpen={() => go(6)} done={false}>
        <p className="text-ink-700">
          A line passes through <strong>(2, 1)</strong> and <strong>(5, 13)</strong>.
        </p>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          <MathText text="m = {13 − 1/5 − 2} = {12/3} = 4" />, so <MathText text="y = 4x + b" />.
        </div>
        <TryIt
          prompt={<>2. Put the point (2, 1) in and solve for b. What is b?</>}
          accept={["-7", "−7"]}
          placeholder="like -3"
          value={fade}
          setValue={setFade}
          hint="1 = 4(2) + b, so 1 = 8 + b."
          explain={
            <>
              <MathText text="b = −7" />, so the line is <MathText text="y = 4x − 7" />. Check with
              the unused point: <MathText text="4(5) − 7 = 13" /> ✓
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Equation of a line</div>
          <div className="mt-2">1. <MathText text="y = mx + b" /> — m multiplies x, b stands alone</div>
          <div className="mt-1">2. b is the y-value when x = 0</div>
          <div className="mt-1">3. Always test the equation on a point before you trust it</div>
        </div>
        <KeyIdea>
          💡 If you are ever unsure which number is which, substitute a point. One arithmetic line
          tells you the answer, and it never lies.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
