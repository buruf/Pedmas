"use client";

import { useId, useState } from "react";
import { MathText } from "@/components/MathText";
import { Step, KeyIdea, WrongBox, FormulaBox } from "@/components/lesson/Step";
import { LessonShell, TryIt } from "@/components/lesson/LessonShell";
import { PrimaryButton } from "@/components/ui";

/* ------------------------------------------------------------- local plot */

/** Two lines and their crossing point. Local to this file. */
function CrossPlot({
  lines,
  points = [],
  min = -6,
  max = 6,
  size = 200,
  caption,
}: {
  lines: { m: number; b: number; colour?: string; label?: string }[];
  points?: { x: number; y: number; label?: string }[];
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
        aria-label={caption ?? "two lines on a grid"}
      >
        <defs>
          <clipPath id={`sysclip${uid}`}>
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
        <g clipPath={`url(#sysclip${uid})`}>
          {lines.map((l, i) => (
            <line
              key={i}
              x1={px(min)}
              y1={py(l.m * min + l.b)}
              x2={px(max)}
              y2={py(l.m * max + l.b)}
              stroke={l.colour ?? "#7c3aed"}
              strokeWidth="2.4"
            />
          ))}
        </g>
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={px(p.x)} cy={py(p.y)} r="5" fill="#dc2626" />
            {p.label && (
              <text x={px(p.x) + 8} y={py(p.y) - 6} fontSize="10" fontWeight="700" fill="#111827">
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
 * Systems of two linear equations.
 *
 * The error worth a whole step is stopping half way: eliminating one variable,
 * finding the other, and calling that the answer. The disproof is neat — two
 * different systems can share the same y, so a single number can never be the
 * solution to a question about where two lines meet.
 */
export function SystemsLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 10 · Linear relations · Systems of equations"
      title="Where do two lines meet?"
      minutes={7}
      step={step}
      total={7}
    >
      <Step n={1} title="Two gyms" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          Gym A charges <strong>$20</strong> to join and <strong>$10</strong> a month. Gym B charges{" "}
          <strong>$50</strong> to join and <strong>$4</strong> a month.
        </p>
        <p className="mt-3 text-ink-700">
          B looks expensive at first and cheap later. So there is a month where they cost the same —
          and that is the only month worth finding.
        </p>
        <div className="mt-4 rounded-2xl bg-paper p-4">
          <div className="text-center text-lg font-bold text-ink-900">
            <MathText text="20 + 10m = 50 + 4m" />
          </div>
          <div className="mt-2 text-center text-sm text-ink-700">
            <MathText text="6m = 30, so m = 5 months" />
          </div>
          <div className="mt-2 text-center text-sm font-semibold text-ok-600">
            A: 20 + 50 = $70 &nbsp;·&nbsp; B: 50 + 20 = $70 ✓
          </div>
        </div>
        <KeyIdea>
          Two rules, one moment where they agree. A system of equations is that question written
          down.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(2)}>What counts as an answer?</PrimaryButton></div>
      </Step>

      <Step n={2} title="A solution is a point, not a number" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <p className="text-ink-700">
          Each equation on its own is a whole line — endlessly many pairs work. Solving a{" "}
          <em>system</em> means finding the pair that works for <strong>both</strong>.
        </p>
        <div className="mt-4">
          <CrossPlot
            lines={[
              { m: -1, b: 5, colour: "#7c3aed" },
              { m: 1, b: 1, colour: "#16a34a" },
            ]}
            points={[{ x: 2, y: 3, label: "(2, 3)" }]}
            caption="x + y = 5 and y = x + 1 cross at (2, 3)"
          />
        </div>
        <div className="mt-3 space-y-2">
          {[
            ["x + y = 5", "2 + 3 = 5 ✓"],
            ["y = x + 1", "3 = 2 + 1 ✓"],
          ].map(([a, b]) => (
            <div key={a} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-bold text-ink-900"><MathText text={a} /></span>
              <span className="text-sm text-brand-700"><MathText text={b} /></span>
            </div>
          ))}
        </div>
        <KeyIdea>
          The answer to a system is always a <strong>pair</strong>: an x and a y that survive both
          equations at once.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(3)}>Solve one without a graph</PrimaryButton></div>
      </Step>

      <Step n={3} title="The new problem" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">Solve</p>
        <FormulaBox>
          <div><MathText text="2x + 3y = 17" /></div>
          <div className="mt-1"><MathText text="2x − y = 5" /></div>
        </FormulaBox>
        <p className="text-ink-700">
          Both equations contain <MathText text="2x" />. Subtract the second from the first and that
          term cancels itself out.
        </p>
        <WorkList
          rows={[
            ["Subtract: (2x + 3y) − (2x − y)", "4y"],
            ["And the right-hand sides: 17 − 5", "12"],
            ["So 4y = 12", "y = 3"],
          ]}
        />
        <div className="mt-4"><PrimaryButton onClick={() => go(4)}>Is that the answer?</PrimaryButton></div>
      </Step>

      <Step n={4} title="The mistake almost everyone makes" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <WrongBox>&ldquo;<MathText text="y = 3" />. Done.&rdquo;</WrongBox>
        <p className="text-ink-700">
          It feels finished — real work happened and a clean number came out. Here is why it cannot
          be the answer. Look at a <em>different</em> system:
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {[
            { t: "System A", e: ["2x + 3y = 17", "2x − y = 5"], w: "4y = 12, y = 3, then 2x − 3 = 5, x = 4", s: "(4, 3)" },
            { t: "System B", e: ["2x + 3y = 21", "2x − y = 9"], w: "4y = 12, y = 3, then 2x − 3 = 9, x = 6", s: "(6, 3)" },
          ].map((c) => (
            <div key={c.t} className="rounded-xl bg-paper px-3 py-3">
              <div className="text-sm font-bold text-brand-700">{c.t}</div>
              {c.e.map((e) => (
                <div key={e} className="text-sm font-semibold text-ink-900"><MathText text={e} /></div>
              ))}
              <div className="mt-1 text-xs text-ink-700"><MathText text={c.w} /></div>
              <div className="mt-1 text-sm font-bold text-ok-600">answer {c.s}</div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-ink-700">
          Both give <MathText text="y = 3" /> — but they are different problems with different
          answers. So <MathText text="y = 3" /> cannot be an answer to either. It is half of one.
        </p>
        <p className="mt-3 text-ink-700">
          On the grid, <MathText text="y = 3" /> is a whole horizontal line. You were asked for a{" "}
          <strong>point</strong>.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(5)}>Finish system A</PrimaryButton></div>
      </Step>

      <Step n={5} title="Feed it back in, then check both" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">
          You know <MathText text="y = 3" />. Put it into whichever equation is easiest —{" "}
          <MathText text="2x − y = 5" />.
        </p>
        <WorkList
          rows={[
            ["Substitute y = 3", "2x − 3 = 5"],
            ["Add 3 to both sides", "2x = 8"],
            ["Divide by 2", "x = 4"],
            ["The solution is a pair", "(4, 3)"],
          ]}
        />
        <div className="mt-4 rounded-xl border border-ok-600/30 bg-ok-100 px-4 py-3 text-sm text-ink-700">
          <strong>Check in both</strong>, not just the one you used:
          <div className="mt-1"><MathText text="2(4) + 3(3) = 8 + 9 = 17" /> ✓</div>
          <div><MathText text="2(4) − 3 = 8 − 3 = 5" /> ✓</div>
        </div>
        <KeyIdea>
          Checking in only one equation proves nothing — that equation had infinitely many solutions
          on its own. The second check is the real one.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(6)}>The other method</PrimaryButton></div>
      </Step>

      <Step n={6} title="Substitution, when one variable is already alone" open={step === 6} onOpen={() => go(6)} done={step > 6}>
        <p className="text-ink-700">Solve</p>
        <FormulaBox>
          <div><MathText text="y = 2x − 1" /></div>
          <div className="mt-1"><MathText text="3x + y = 14" /></div>
        </FormulaBox>
        <p className="text-ink-700">
          The first equation already says what <MathText text="y" /> is. So write that instead of{" "}
          <MathText text="y" /> in the second, and only one letter is left.
        </p>
        <WorkList
          rows={[
            ["Replace y with 2x − 1", "3x + (2x − 1) = 14"],
            ["Collect the x terms", "5x − 1 = 14"],
            ["Solve", "x = 3"],
            ["Now go back for y", "y = 2(3) − 1 = 5"],
          ]}
        />
        <p className="mt-3 text-ink-700">
          Check both: <MathText text="5 = 2(3) − 1" /> ✓ and <MathText text="3(3) + 5 = 14" /> ✓ The
          solution is <strong>(3, 5)</strong> — again a pair, never a single number.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(7)}>Your turn</PrimaryButton></div>
      </Step>

      <Step n={7} title="You try one" open={step === 7} onOpen={() => go(7)} done={false}>
        <p className="text-ink-700">Solve</p>
        <div className="my-3 rounded-xl bg-paper px-4 py-3 text-center text-lg font-bold text-ink-900">
          <div><MathText text="x + 2y = 16" /></div>
          <div className="mt-1"><MathText text="x − y = 1" /></div>
        </div>
        <div className="rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          Subtract: <MathText text="3y = 15" />, so <MathText text="y = 5" />.
        </div>
        <TryIt
          prompt={<>2. You are only half done. Put y = 5 back in and find x.</>}
          accept={["6"]}
          placeholder="the value of x"
          value={fade}
          setValue={setFade}
          hint="use x − y = 1, so x − 5 = 1."
          explain={
            <>
              <MathText text="x = 6" />, so the solution is <strong>(6, 5)</strong>. Check both:{" "}
              <MathText text="6 + 2(5) = 16" /> ✓ and <MathText text="6 − 5 = 1" /> ✓
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Solving a system</div>
          <div className="mt-2">1. Get rid of one variable — eliminate or substitute</div>
          <div className="mt-1">2. Solve for the one that is left</div>
          <div className="mt-1">3. Put it back to find the other one</div>
          <div className="mt-1">4. Check the pair in <em>both</em> equations</div>
        </div>
        <KeyIdea>
          💡 The answer to a system is a point. If your final line has only one letter in it, you
          have stopped one step early.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
