"use client";

import { useState } from "react";
import { MathText } from "@/components/MathText";
import { Step, KeyIdea, WrongBox } from "@/components/lesson/Step";
import { LessonShell, TryIt } from "@/components/lesson/LessonShell";
import { PrimaryButton } from "@/components/ui";

/**
 * Fractions on a number line.
 *
 * A number line asks something a pizza never does: it asks for a fraction as a
 * DISTANCE rather than as a set of shaded pieces. Children who are fluent with
 * fraction bars still land here and count the tick marks, because on a bar the
 * pieces and the cuts look like the same thing. On a line they are not — a line
 * cut into 4 has 5 marks, and counting marks turns quarters into fifths and
 * shifts every point one place to the left.
 *
 * So the lesson never says "count carefully". It changes what is being counted:
 * the JUMPS between 0 and 1, not the marks that separate them.
 */

/* ------------------------------------------------------------------ visuals */

const W = 320;
const PAD = 24;
const USABLE = W - PAD * 2;
const BASE = 58;

/**
 * A fraction number line. `numbering` decides what gets counted on the picture,
 * which is the whole argument of the lesson: "marks" draws the mistake, "gaps"
 * draws the fix.
 */
function FracLine({
  parts,
  wholes = 1,
  at,
  numbering = "none",
  question = false,
  label,
}: {
  /** equal parts per whole */
  parts: number;
  /** how many wholes the line spans */
  wholes?: number;
  /** highlight the point this many parts from 0 */
  at?: number;
  numbering?: "none" | "marks" | "gaps" | "fractions";
  /** draw the highlighted point as a "?" instead of a value */
  question?: boolean;
  label?: string;
}) {
  const total = parts * wholes;
  const x = (i: number) => PAD + (i / total) * USABLE;
  const ticks = Array.from({ length: total + 1 }, (_, i) => i);

  return (
    <figure className="m-0">
      <svg
        viewBox={`0 0 ${W} 92`}
        width="100%"
        style={{ maxWidth: W }}
        role="img"
        aria-label={label ?? `number line from 0 to ${wholes} in ${parts} equal parts per whole`}
      >
        {/* the distance travelled, drawn as a distance */}
        {at !== undefined && (
          <line x1={x(0)} y1={BASE} x2={x(at)} y2={BASE} stroke="#7c3aed" strokeWidth="5" strokeLinecap="round" />
        )}

        <line x1={PAD - 10} y1={BASE} x2={W - PAD + 10} y2={BASE} stroke="#94a3b8" strokeWidth="2" />

        {ticks.map((i) => {
          const whole = i % parts === 0;
          return (
            <g key={i}>
              <line
                x1={x(i)}
                y1={BASE - (whole ? 13 : 8)}
                x2={x(i)}
                y2={BASE + (whole ? 13 : 8)}
                stroke={whole ? "#475569" : "#94a3b8"}
                strokeWidth={whole ? 2.2 : 1.4}
              />
              {whole && numbering !== "fractions" && (
                <text x={x(i)} y={BASE + 27} fontSize="11" fontWeight="700" textAnchor="middle" fill="#475569">
                  {i / parts}
                </text>
              )}
              {numbering === "fractions" && (
                <text x={x(i)} y={BASE + 27} fontSize="9" fontWeight="700" textAnchor="middle" fill="#475569">
                  {i === 0 ? "0" : `${i}/${parts}`}
                </text>
              )}
              {numbering === "marks" && (
                <text x={x(i)} y={BASE - 22} fontSize="11" fontWeight="800" textAnchor="middle" fill="#dc2626">
                  {i + 1}
                </text>
              )}
            </g>
          );
        })}

        {/* the gaps — what actually gets counted */}
        {numbering === "gaps" &&
          ticks.slice(0, -1).map((i) => (
            <g key={`g${i}`}>
              <line
                x1={x(i) + 3}
                y1={BASE - 26}
                x2={x(i + 1) - 3}
                y2={BASE - 26}
                stroke="#d97706"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
              <text x={(x(i) + x(i + 1)) / 2} y={BASE - 31} fontSize="11" fontWeight="800" textAnchor="middle" fill="#d97706">
                {i + 1}
              </text>
            </g>
          ))}

        {at !== undefined && (
          <>
            <circle cx={x(at)} cy={BASE} r="6" fill="#7c3aed" stroke="#ffffff" strokeWidth="1.5" />
            {question && (
              <text x={x(at)} y={BASE - 16} fontSize="16" fontWeight="900" textAnchor="middle" fill="#7c3aed">
                ?
              </text>
            )}
          </>
        )}
      </svg>
      {label && (
        <figcaption className="mt-1 text-center text-sm font-semibold text-ink-700">
          <MathText text={label} />
        </figcaption>
      )}
    </figure>
  );
}

/** Marks versus gaps, counted side by side. */
function MarksVsGaps({ parts }: { parts: number }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-xl border-2 border-err-600/40 bg-err-100/50 px-3 py-3 text-center">
        <div className="text-xs font-bold uppercase tracking-wide text-err-600">Marks</div>
        <div className="mt-1 text-3xl font-black text-ink-900">{parts + 1}</div>
        <div className="mt-1 text-xs text-ink-700">including the one you start on</div>
      </div>
      <div className="rounded-xl border-2 border-ok-600/40 bg-ok-100 px-3 py-3 text-center">
        <div className="text-xs font-bold uppercase tracking-wide text-ok-600">Gaps</div>
        <div className="mt-1 text-3xl font-black text-ink-900">{parts}</div>
        <div className="mt-1 text-xs text-ink-700">the jumps you actually take</div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------- lesson */

export function FractionNumberLineLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [guess, setGuess] = useState<string | null>(null);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 2–4 · Fractions · Fractions on Number Lines"
      title="Count the jumps, not the marks"
      minutes={6}
      step={step}
      total={8}
    >
      {/* 1 */}
      <Step n={1} title="Where does the point sit?" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          This line runs from <strong>0</strong> to <strong>1</strong>. It has been split into equal
          parts.
        </p>
        <div className="mt-4 flex justify-center">
          <FracLine parts={4} at={1} question />
        </div>
        <p className="mt-4 text-ink-700">What fraction is the point sitting on?</p>
        <div className="mt-4 grid gap-2">
          {[
            { k: "a", label: "1/5 — there are 5 marks on the line" },
            { k: "b", label: "1/4 — the line is cut into 4" },
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
            Both are honest readings of the same picture. Let&rsquo;s find out which one the line is
            really showing.
            <div className="mt-3">
              <PrimaryButton onClick={() => go(2)}>Show me</PrimaryButton>
            </div>
          </div>
        )}
      </Step>

      {/* 2 */}
      <Step n={2} title="What happens if you count the marks" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <p className="text-ink-700">
          Counting marks is the natural thing to do — they are the only things on the line you can
          point at. Here is what it gives you.
        </p>
        <div className="mt-4 flex justify-center">
          <FracLine parts={4} numbering="marks" />
        </div>
        <WrongBox>
          &ldquo;Five marks, so the line is in <MathText text="{1/5}" />s&rdquo;
        </WrongBox>
        <p className="text-ink-700">
          But look at the right-hand end. That mark is <strong>1</strong> — a whole. If the parts were
          fifths, you would need five of them to reach 1, and there are only four spaces between the
          ends.
        </p>
        <p className="mt-3 text-ink-700">
          The count came out one too big. That extra one is always the mark you were standing on at
          the start.
        </p>
        <KeyIdea>
          A line cut into 4 has <strong>5</strong> marks. There is always one more mark than there are
          pieces.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(3)}>So what should I count?</PrimaryButton>
        </div>
      </Step>

      {/* 3 */}
      <Step n={3} title="A fraction is a distance" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">
          On a number line, a fraction is not a thing you point at. It is <strong>how far you have
          travelled</strong> from 0.
        </p>
        <p className="mt-3 text-ink-700">
          So count the <strong>jumps</strong> — the spaces between the marks.
        </p>
        <div className="mt-4 flex justify-center">
          <FracLine parts={4} numbering="gaps" />
        </div>
        <div className="mt-4">
          <MarksVsGaps parts={4} />
        </div>
        <KeyIdea>
          Four equal jumps get you from 0 to 1. So each jump is worth{" "}
          <MathText text="{1/4}" />. The bottom number of a fraction counts the{" "}
          <strong>jumps in one whole</strong>.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(4)}>Why is 0 not a jump?</PrimaryButton>
        </div>
      </Step>

      {/* 4 */}
      <Step n={4} title="Zero is where you stand" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <p className="text-ink-700">
          The mark at 0 is the start line. You have not moved yet, so nothing has been counted.
        </p>
        <div className="mt-4 flex justify-center">
          <FracLine parts={4} at={0} label="0 jumps taken — you are at 0" />
        </div>
        <p className="mt-4 text-ink-700">
          It is the same slip as counting backwards and saying the number you are standing on. The
          start is a place, not a step.
        </p>
        <div className="mt-4 space-y-2">
          {[
            ["0 jumps", "0"],
            ["1 jump", "{1/4}"],
            ["2 jumps", "{2/4} — a half"],
            ["3 jumps", "{3/4}"],
            ["4 jumps", "{4/4} — a whole"],
          ].map(([a, b], i) => (
            <div key={i} className="flex items-center justify-between gap-3 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-semibold text-ink-700">{a}</span>
              <span className="text-lg font-bold text-ink-900">
                <MathText text={b} />
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(5)}>Answer the first question</PrimaryButton>
        </div>
      </Step>

      {/* 5 */}
      <Step n={5} title="Back to the point" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">
          The point was one jump from 0, on a line where four jumps make a whole.
        </p>
        <div className="mt-4 flex justify-center">
          <FracLine parts={4} at={1} numbering="fractions" label="one jump of {1/4}" />
        </div>
        <p className="mt-4 text-center text-2xl font-black text-ok-600">
          <MathText text="{1/4}" />
        </p>
        <KeyIdea>
          <strong>Bottom number</strong> — how many jumps make one whole.{" "}
          <strong>Top number</strong> — how many jumps you took. That is the whole reading rule.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(6)}>Watch a harder one</PrimaryButton>
        </div>
      </Step>

      {/* 6 */}
      <Step n={6} title="Watch me read this one" open={step === 6} onOpen={() => go(6)} done={step > 6}>
        <p className="text-ink-700">A new line from 0 to 1, with the point further along.</p>
        <div className="mt-4 flex justify-center">
          <FracLine parts={6} at={5} question />
        </div>
        <div className="mt-4 space-y-2">
          {[
            ["Count the jumps from 0 to 1", "6 jumps — so sixths"],
            ["Count the jumps to the point", "5 jumps"],
            ["Write it", "{5/6}"],
          ].map(([a, b], i) => (
            <div
              key={i}
              className={`flex flex-wrap items-center justify-between gap-2 rounded-xl px-3 py-2 ${
                i === 2 ? "bg-ok-100 text-ok-600" : "bg-paper text-ink-700"
              }`}
            >
              <span className="text-sm font-semibold">{a}</span>
              <span className="text-lg font-bold">
                <MathText text={b} />
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-center">
          <FracLine parts={6} at={5} numbering="fractions" label="{5/6}" />
        </div>
        <p className="mt-3 text-ink-700">
          Had you counted marks, you would have found 7 and written{" "}
          <MathText text="{6/7}" /> — a fraction this line cannot even show.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(7)}>What if it goes past 1?</PrimaryButton>
        </div>
      </Step>

      {/* 7 */}
      <Step n={7} title="Going past the whole" open={step === 7} onOpen={() => go(7)} done={step > 7}>
        <p className="text-ink-700">
          Number lines do not stop at 1. This one runs to <strong>2</strong>, with every whole cut
          into <strong>3</strong>.
        </p>
        <div className="mt-4 flex justify-center">
          <FracLine parts={3} wholes={2} at={5} question />
        </div>
        <p className="mt-4 text-ink-700">
          Nothing changes. Three jumps make a whole, so every jump is{" "}
          <MathText text="{1/3}" />. The point is <strong>5</strong> jumps from 0.
        </p>
        <div className="mt-3 flex justify-center">
          <FracLine parts={3} wholes={2} at={5} numbering="fractions" label="{5/3}" />
        </div>
        <p className="mt-4 text-ink-700">
          <MathText text="{5/3}" /> is more than 1, and the picture says so — you passed the 1 mark
          after three jumps and took two more.
        </p>
        <KeyIdea>
          <MathText text="{3/3}" /> is one whole, and 2 jumps are left over. So{" "}
          <MathText text="{5/3}" /> is the same point as 1 and <MathText text="{2/3}" />.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(8)}>Your turn</PrimaryButton>
        </div>
      </Step>

      {/* 8 */}
      <Step n={8} title="You try one — I'll start it" open={step === 8} onOpen={() => go(8)} done={false}>
        <p className="text-ink-700">This line runs from 0 to 1. Read the point.</p>
        <div className="mt-4 flex justify-center">
          <FracLine parts={8} at={3} question />
        </div>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          Count the jumps from 0 to 1 — not the marks. There are <strong>8</strong>. So the bottom
          number is 8.
        </div>
        <div className="mt-2 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">2. </span>
          Now count the jumps from 0 to the point. Remember: the mark at 0 is not a jump.
        </div>
        <TryIt
          prompt={<>3. Write the fraction:</>}
          accept={["3/8"]}
          placeholder="like 1/2"
          value={fade}
          setValue={setFade}
          hint="the bottom number is 8. Count the spaces you cross to reach the point, not the marks you pass."
          explain={
            <>
              <MathText text="{3/8}" /> — three jumps, each worth <MathText text="{1/8}" />. Counting
              marks would have given four, and put the point at{" "}
              <MathText text="{4/9}" /> instead.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-4 flex justify-center">
          <FracLine parts={8} at={3} numbering="gaps" label="3 jumps of {1/8}" />
        </div>
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Reading a number line</div>
          <div className="mt-2">1. Count the jumps in one whole → bottom number</div>
          <div className="mt-1">2. Count the jumps from 0 to the point → top number</div>
          <div className="mt-1">3. The mark at 0 is never a jump</div>
        </div>
        <KeyIdea>
          💡 There is always one more mark than jump. If your bottom number is one bigger than it
          should be, you counted the marks.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
