"use client";

import { useState } from "react";
import { MathText } from "@/components/MathText";
import { Step, KeyIdea, WrongBox } from "@/components/lesson/Step";
import { LessonShell, TryIt } from "@/components/lesson/LessonShell";
import { PrimaryButton } from "@/components/ui";

/**
 * A number line that can carry marked values and a solution ray.
 *
 * Inequalities are the first time an answer is a whole set rather than a
 * single number, and the flip rule is a statement about direction on this
 * line — so the line has to be visible for either idea to land. Drawn locally
 * so this lesson owns its own picture.
 */
function NumLine({
  from,
  to,
  dots = [],
  ray,
  label,
}: {
  from: number;
  to: number;
  /** values to mark with a solid dot */
  dots?: number[];
  /** the solution set: everything left or right of `at` */
  ray?: { at: number; dir: "left" | "right"; closed?: boolean };
  label?: string;
}) {
  const w = 300;
  const padL = 18;
  const usable = w - padL * 2;
  const span = Math.max(1, to - from);
  const x = (v: number) => padL + ((v - from) / span) * usable;
  const y = 34;
  const ticks = Array.from({ length: span + 1 }, (_, i) => from + i);
  const end = ray ? (ray.dir === "right" ? w - 6 : 6) : 0;
  const head = ray
    ? ray.dir === "right"
      ? `${end},${y} ${end - 10},${y - 6} ${end - 10},${y + 6}`
      : `${end},${y} ${end + 10},${y - 6} ${end + 10},${y + 6}`
    : "";

  return (
    <figure className="m-0">
      <svg
        viewBox={`0 0 ${w} 58`}
        width="100%"
        style={{ maxWidth: w }}
        role="img"
        aria-label={label ?? `number line from ${from} to ${to}`}
      >
        <line x1={padL - 10} y1={y} x2={w - padL + 10} y2={y} stroke="#94a3b8" strokeWidth="2" />
        {ticks.map((v) => (
          <g key={v}>
            <line x1={x(v)} y1={y - 5} x2={x(v)} y2={y + 5} stroke="#94a3b8" strokeWidth="1.5" />
            <text x={x(v)} y={y + 19} fontSize="10" textAnchor="middle" fill="#475569">
              {v}
            </text>
          </g>
        ))}
        {ray && (
          <>
            <line
              x1={x(ray.at)}
              y1={y}
              x2={ray.dir === "right" ? end - 8 : end + 8}
              y2={y}
              stroke="#7c3aed"
              strokeWidth="5"
              strokeLinecap="round"
            />
            <polygon points={head} fill="#7c3aed" />
            <circle
              cx={x(ray.at)}
              cy={y}
              r="6"
              fill={ray.closed ? "#7c3aed" : "#ffffff"}
              stroke="#7c3aed"
              strokeWidth="2.5"
            />
          </>
        )}
        {dots.map((v) => (
          <circle key={v} cx={x(v)} cy={y} r="5" fill="#0d9488" />
        ))}
      </svg>
      {label && (
        <figcaption className="mt-1 text-center text-sm font-semibold text-ink-700">
          <MathText text={label} />
        </figcaption>
      )}
    </figure>
  );
}

/** Numbered working, one line per move. */
function Work({ rows }: { rows: [string, string][] }) {
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
 * Inequalities.
 *
 * One rule causes almost every lost mark: multiplying or dividing by a
 * negative reverses the direction. Told as a rule it is forgotten within a
 * week, so here it is derived — first by catching a solution set that
 * excludes an answer which plainly works, then by watching the number line
 * reflect.
 */
export function InequalityLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 8 · Algebra · Inequalities"
      title="The one rule that flips"
      minutes={7}
      step={step}
      total={7}
    >
      <Step n={1} title="You must be this tall" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          The sign at the ride says you have to be taller than 140 cm. It does not name one height —
          141 works, 150 works, 183 works. The answer is a whole <strong>set</strong> of heights.
        </p>
        <div className="my-4">
          <NumLine from={137} to={144} ray={{ at: 140, dir: "right" }} label="h > 140" />
        </div>
        <p className="text-ink-700">
          The hollow circle at 140 says &ldquo;not this one&rdquo; — exactly 140 is not taller than
          140. Everything to the right of it is in.
        </p>
        <KeyIdea>
          An equation has an answer. An inequality has an answer <em>set</em>, and the arrow shows
          which way it runs.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(2)}>How do I solve one?</PrimaryButton>
        </div>
      </Step>

      <Step n={2} title="Solve it like an equation" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <p className="text-ink-700">
          Almost everything transfers. Whatever you do to one side, do to the other — and the
          direction sign just comes along for the ride.
        </p>
        <Work
          rows={[
            ["Start", "x + 4 < 11"],
            ["Subtract 4 from both sides", "x < 7"],
          ]}
        />
        <p className="mt-3 text-ink-700">
          Test one from inside the set: <MathText text="x = 6" /> gives{" "}
          <MathText text="10 < 11" /> ✓. And one from outside: <MathText text="x = 8" /> gives{" "}
          <MathText text="12 < 11" />, which is false ✓ — exactly as it should be.
        </p>
        <Work
          rows={[
            ["Start", "3x ≥ 12"],
            ["Divide both sides by 3", "x ≥ 4"],
          ]}
        />
        <p className="mt-3 text-ink-700">
          Here the circle would be solid: <MathText text="x = 4" /> gives{" "}
          <MathText text="12 ≥ 12" />, which is true, so 4 is included.
        </p>
        <div className="mt-3">
          <NumLine from={0} to={8} ray={{ at: 4, dir: "right", closed: true }} label="x ≥ 4" />
        </div>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(3)}>Now the famous one</PrimaryButton>
        </div>
      </Step>

      <Step n={3} title="The mistake almost everyone makes" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">
          Solve <MathText text="−2x < 6" />. Doing what has worked every time so far — divide both
          sides by −2 and leave the sign alone:
        </p>
        <WrongBox>
          <MathText text="−2x < 6" /> &nbsp;→&nbsp; <MathText text="x < −3" />
        </WrongBox>
        <p className="text-ink-700">
          Test that answer set with the easiest number there is, <MathText text="x = 0" />:
        </p>
        <div className="mt-3 space-y-2">
          <div className="rounded-xl border border-ok-600/30 bg-ok-100 px-4 py-3">
            <div className="text-sm font-semibold text-ink-700">Is 0 a genuine solution?</div>
            <div className="mt-1 text-lg font-bold text-ink-900">
              <MathText text="−2(0) = 0" />, and <MathText text="0 < 6" />{" "}
              <span className="text-ok-600">✓</span>
            </div>
            <div className="mt-1 text-sm text-ink-700">Yes — 0 works in the original.</div>
          </div>
          <div className="rounded-xl border-2 border-err-600/40 bg-err-100/50 px-4 py-3">
            <div className="text-sm font-semibold text-ink-700">Does the answer set allow 0?</div>
            <div className="mt-1 text-lg font-bold text-ink-900">
              <MathText text="0 < −3" /> is false <span className="text-err-600">✗</span>
            </div>
            <div className="mt-1 text-sm text-ink-700">
              So <MathText text="x < −3" /> throws away an answer that works. It cannot be right.
            </div>
          </div>
        </div>
        <p className="mt-4 text-ink-700">
          The correct set is <MathText text="x > −3" />, which does contain 0. The direction turned
          round.
        </p>
        <div className="mt-3">
          <NumLine from={-6} to={2} ray={{ at: -3, dir: "right" }} label="x > −3" />
        </div>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(4)}>Why does it turn round?</PrimaryButton>
        </div>
      </Step>

      <Step n={4} title="Negatives run the other way" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <p className="text-ink-700">
          Multiplying by a negative does something no positive can do: it{" "}
          <strong>reflects the number line</strong>. Every number swaps to the opposite side of
          zero, so anything that was on the left ends up on the right.
        </p>
        <div className="my-4">
          <NumLine from={-6} to={6} dots={[-5, -3, 3, 5]} label="3 and 5, and their reflections" />
        </div>
        <div className="mt-3 space-y-2">
          {[
            ["3 < 5", "3 sits to the LEFT of 5"],
            ["−3 > −5", "but −3 sits to the RIGHT of −5"],
          ].map(([a, b]) => (
            <div key={a} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-base font-bold text-ink-900">
                <MathText text={a} />
              </span>
              <span className="text-sm text-ink-700">{b}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-ink-700">
          Owing $5 is worse than owing $3, even though 5 is the bigger number. That is the same fact.
          Multiply or divide an inequality by a negative and both sides get reflected — so the
          direction sign has to be reversed to stay true.
        </p>
        <KeyIdea>
          Adding and subtracting slide both sides along the line by the same amount, so the order
          never changes. Only a negative multiplier can turn the line around.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(5)}>A worked example</PrimaryButton>
        </div>
      </Step>

      <Step n={5} title="Flipping, carefully" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">
          Solve <MathText text="−5x ≥ 20" />.
        </p>
        <Work
          rows={[
            ["Start", "−5x ≥ 20"],
            ["Divide both sides by −5 — a negative, so flip ≥ to ≤", "x ≤ −4"],
          ]}
        />
        <div className="mt-3">
          <NumLine from={-8} to={0} ray={{ at: -4, dir: "left", closed: true }} label="x ≤ −4" />
        </div>
        <p className="mt-3 text-ink-700">
          Test inside the set: <MathText text="x = −6" /> gives{" "}
          <MathText text="−5(−6) = 30" />, and <MathText text="30 ≥ 20" /> ✓. Test outside it:{" "}
          <MathText text="x = 0" /> gives <MathText text="0 ≥ 20" />, false ✓. The set is right.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(6)}>When NOT to flip</PrimaryButton>
        </div>
      </Step>

      <Step n={6} title="The over-correction" open={step === 6} onOpen={() => go(6)} done={step > 6}>
        <p className="text-ink-700">
          Once people learn the flip, they start flipping whenever they see a minus sign anywhere.
          It only ever applies to <strong>multiplying or dividing by a negative</strong>.
        </p>
        <div className="mt-3 space-y-2">
          <div className="rounded-xl bg-paper px-4 py-3">
            <div className="text-base font-bold text-ink-900">
              <MathText text="x + 5 < 2" /> → <MathText text="x < −3" />
            </div>
            <div className="mt-1 text-sm text-ink-700">
              No flip. You subtracted 5 — the answer is negative, but nothing was reflected. Test{" "}
              <MathText text="x = −4" />: <MathText text="1 < 2" /> ✓
            </div>
          </div>
          <div className="rounded-xl bg-paper px-4 py-3">
            <div className="text-base font-bold text-ink-900">
              <MathText text="4x + 3 > 19" /> → <MathText text="4x > 16" /> →{" "}
              <MathText text="x > 4" />
            </div>
            <div className="mt-1 text-sm text-ink-700">
              No flip. You divided by <strong>+4</strong>. Test <MathText text="x = 5" />:{" "}
              <MathText text="23 > 19" /> ✓
            </div>
          </div>
        </div>
        <KeyIdea>
          A negative <em>answer</em> is not a reason to flip. A negative you divide or multiply{" "}
          <em>by</em> is the only reason.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(7)}>Your turn</PrimaryButton>
        </div>
      </Step>

      <Step n={7} title="You try one" open={step === 7} onOpen={() => go(7)} done={false}>
        <p className="text-ink-700">
          Solve <MathText text="2 − 3x < −13" />.
        </p>
        <div className="mt-3 space-y-2">
          <div className="rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
            <span className="font-bold text-brand-600">1. </span>
            Subtract 2 from both sides: <MathText text="−3x < −15" />. No flip yet — that was a
            subtraction.
          </div>
          <div className="rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
            <span className="font-bold text-brand-600">2. </span>
            Now divide both sides by <MathText text="−3" />. That is a negative, so the{" "}
            <MathText text="<" /> becomes <MathText text=">" />.
          </div>
        </div>
        <TryIt
          prompt={<>3. The answer is x &gt; ___ . Type the number.</>}
          accept={["5"]}
          placeholder="just the number"
          value={fade}
          setValue={setFade}
          hint="divide −15 by −3 — a negative divided by a negative comes out positive."
          explain={
            <>
              <MathText text="x > 5" />. Check with <MathText text="x = 6" />:{" "}
              <MathText text="2 − 18 = −16" />, and <MathText text="−16 < −13" /> ✓. Check with{" "}
              <MathText text="x = 4" />: <MathText text="2 − 12 = −10" />, and{" "}
              <MathText text="−10 < −13" /> is false ✓ — 4 is correctly outside the set.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-4">
          <NumLine from={2} to={9} ray={{ at: 5, dir: "right" }} label="x > 5" />
        </div>
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Solving an inequality</div>
          <div className="mt-2">1. Solve it exactly like an equation</div>
          <div className="mt-1">2. Adding or subtracting NEVER flips the sign</div>
          <div className="mt-1">3. Multiplying or dividing by a negative ALWAYS flips it</div>
          <div className="mt-1">4. Test one number from your set in the original</div>
        </div>
        <KeyIdea>
          💡 You never have to trust your memory on the flip. Pick any number from your answer set,
          put it in the original inequality, and see whether it holds.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
