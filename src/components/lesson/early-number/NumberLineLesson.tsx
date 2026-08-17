"use client";

import { useState } from "react";
import { Step, KeyIdea, WrongBox } from "@/components/lesson/Step";
import { LessonShell, TryIt } from "@/components/lesson/LessonShell";
import { PrimaryButton } from "@/components/ui";

/**
 * Reading and using a number line (number-line family, all bands).
 *
 * Two errors, one cause. Children count the *marks* rather than the *spaces*
 * between them, which is the fence-post problem: five posts hold only four
 * panels. The same slip produces off-by-one jump counts and a mis-read scale.
 * The second error is treating a number line as a list of labels, so unequal
 * gaps look acceptable. Both are fixed by making the gap — not the tick — the
 * thing you count.
 */

/** Number line with arbitrary tick labels, optional uneven spacing and arcs. */
function TickLine({
  labels,
  positions,
  jumps,
  caption,
}: {
  labels: string[];
  /** 0..1 along the line for each label; omit for equal spacing */
  positions?: number[];
  /** text over the arc from tick i to tick i+1, or null for no arc */
  jumps?: (string | null)[];
  caption?: string;
}) {
  const w = 300;
  const padL = 24;
  const usable = w - padL * 2;
  const baseY = 62;
  const n = labels.length;
  const x = (i: number) =>
    padL + (positions ? positions[i] : n <= 1 ? 0 : i / (n - 1)) * usable;
  return (
    <figure className="m-0">
      <svg
        viewBox={`0 0 ${w} 86`}
        width="100%"
        style={{ maxWidth: w }}
        role="img"
        aria-label={caption ?? `number line from ${labels[0]} to ${labels[n - 1]}`}
      >
        <line x1={8} y1={baseY} x2={w - 8} y2={baseY} stroke="#9ca3af" strokeWidth="2" />
        {labels.map((lab, i) => (
          <g key={i}>
            <line
              x1={x(i)}
              y1={baseY - 7}
              x2={x(i)}
              y2={baseY + 7}
              stroke="#9ca3af"
              strokeWidth="2"
            />
            <text
              x={x(i)}
              y={baseY + 23}
              fontSize="12"
              fontWeight="700"
              textAnchor="middle"
              fill={lab === "?" ? "#dc2626" : "#374151"}
            >
              {lab}
            </text>
          </g>
        ))}
        {jumps?.map((t, i) => {
          if (!t) return null;
          const x1 = x(i);
          const x2 = x(i + 1);
          const mid = (x1 + x2) / 2;
          return (
            <g key={i}>
              <path
                d={`M ${x1} ${baseY - 9} Q ${mid} ${baseY - 42} ${x2} ${baseY - 9}`}
                fill="none"
                stroke="#d97706"
                strokeWidth="2"
              />
              <text
                x={mid}
                y={baseY - 34}
                fontSize="11"
                fontWeight="700"
                textAnchor="middle"
                fill="#d97706"
              >
                {t}
              </text>
            </g>
          );
        })}
      </svg>
      {caption && (
        <figcaption className="mt-1 text-center text-sm font-semibold text-ink-700">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

/** Trees and the spaces between them — the fence-post picture. */
function TreesAndGaps() {
  return (
    <div className="rounded-2xl bg-paper px-3 py-4">
      <div className="flex items-end justify-center">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-end">
            <span className="text-2xl">🌳</span>
            {i < 4 && (
              <span className="mx-1 mb-2 w-8 rounded-full bg-warn-100 text-center text-xs font-bold text-warn-600">
                {i + 1}
              </span>
            )}
          </div>
        ))}
      </div>
      <p className="mt-3 text-center text-sm font-semibold text-ink-700">
        5 trees. Only <span className="text-warn-600">4</span> spaces.
      </p>
    </div>
  );
}

export function NumberLineLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [guess, setGuess] = useState<string | null>(null);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 1 · Number · Number lines"
      title="Count the jumps, not the marks"
      minutes={6}
      step={step}
      total={7}
    >
      <Step n={1} title="A frog on a number line" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          The frog sits on <strong>3</strong>. It hops to <strong>7</strong>.
        </p>
        <div className="mt-4 flex justify-center">
          <TickLine labels={["0", "1", "2", "3", "4", "5", "6", "7", "8"]} />
        </div>
        <p className="mt-4 text-ink-700">How many hops?</p>
        <div className="mt-3 grid gap-2">
          {["4 hops", "5 hops"].map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => setGuess(o)}
              className={`btn rounded-xl border-2 px-4 py-3 text-left text-lg font-bold ${
                guess === o
                  ? "border-brand-600 bg-brand-50 text-brand-800"
                  : "border-ink-100 bg-white"
              }`}
            >
              {o}
            </button>
          ))}
        </div>
        {guess && (
          <div className="mt-4 rounded-xl bg-paper px-4 py-3 text-sm text-ink-700 pop-in">
            Let&rsquo;s watch the frog.
            <div className="mt-3">
              <PrimaryButton onClick={() => go(2)}>Show me</PrimaryButton>
            </div>
          </div>
        )}
      </Step>

      <Step n={2} title="What a number line is" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <p className="text-ink-700">Every mark is a number. Going right means bigger.</p>
        <div className="mt-4 flex justify-center">
          <TickLine
            labels={["0", "1", "2", "3", "4", "5", "6"]}
            jumps={["+1", "+1", "+1", "+1", "+1", "+1"]}
          />
        </div>
        <KeyIdea>
          One step to the right adds <strong>1</strong>. One step to the left takes away 1.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(3)}>Back to the frog</PrimaryButton>
        </div>
      </Step>

      <Step n={3} title="The mistake lots of people make" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">Most people count the numbers they see:</p>
        <WrongBox>&ldquo;3, 4, 5, 6, 7 &mdash; that&rsquo;s 5 hops&rdquo;</WrongBox>
        <p className="text-ink-700">
          That counts <strong>3</strong>. But the frog was already sitting on 3. Sitting still is
          not a hop.
        </p>
        <p className="mt-3 text-ink-700">Watch the hops instead.</p>
        <div className="mt-3 flex justify-center">
          <TickLine
            labels={["3", "4", "5", "6", "7"]}
            jumps={["1", "2", "3", "4"]}
            caption="4 hops"
          />
        </div>
        <p className="mt-3 text-center text-lg font-bold text-ok-600">4 hops</p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(4)}>Why?</PrimaryButton>
        </div>
      </Step>

      <Step n={4} title="Marks and gaps are different things" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <p className="text-ink-700">Look at a row of trees.</p>
        <div className="mt-3">
          <TreesAndGaps />
        </div>
        <p className="mt-4 text-ink-700">
          There is always <strong>one more mark than gap</strong>. The first mark is where you
          start, not a move.
        </p>
        <KeyIdea>
          Count the <strong>jumps</strong>, never the marks. Marks are places. Jumps are moves.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(5)}>One more rule</PrimaryButton>
        </div>
      </Step>

      <Step n={5} title="The gaps must be equal" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">This one is broken. The gaps are all different sizes.</p>
        <div className="mt-3 flex justify-center">
          <TickLine
            labels={["0", "1", "2", "3"]}
            positions={[0, 0.62, 0.75, 1]}
            caption="✗ the gaps are not equal"
          />
        </div>
        <p className="mt-4 text-ink-700">
          Here the gap from 0 to 1 looks huge and the gap from 1 to 2 looks tiny. But both are 1.
          The picture is lying to you.
        </p>
        <div className="mt-3 flex justify-center">
          <TickLine labels={["0", "1", "2", "3"]} caption="✓ equal gaps" />
        </div>
        <KeyIdea>
          On a real number line, <strong>every gap is the same size</strong>. That is what makes it
          possible to read.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(6)}>Find a missing number</PrimaryButton>
        </div>
      </Step>

      <Step n={6} title="Finding a missing mark" open={step === 6} onOpen={() => go(6)} done={step > 6}>
        <p className="text-ink-700">The gaps are equal. What is the missing number?</p>
        <div className="mt-3 flex justify-center">
          <TickLine labels={["10", "?", "20", "25", "30"]} />
        </div>
        <div className="mt-4 rounded-2xl bg-paper p-4">
          <ol className="space-y-2">
            {[
              ["Find one jump you can see", "20 to 25 is 5"],
              ["Every jump is the same", "so every jump is 5"],
              ["Jump on from 10", "10 + 5 = 15"],
            ].map(([a, b], i) => (
              <li
                key={i}
                className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 text-sm"
              >
                <span className="text-ink-700">
                  <span className="mr-2 font-bold text-brand-600">{i + 1}.</span>
                  {a}
                </span>
                <span className="font-bold text-ink-900">{b}</span>
              </li>
            ))}
          </ol>
        </div>
        <p className="mt-3 text-center text-xl font-bold text-ok-600">The mark is 15</p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(7)}>Your turn</PrimaryButton>
        </div>
      </Step>

      <Step n={7} title="You try one" open={step === 7} onOpen={() => go(7)} done={false}>
        <p className="text-ink-700">The gaps are equal again.</p>
        <div className="mt-3 flex justify-center">
          <TickLine labels={["0", "25", "?", "75", "100"]} />
        </div>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          One jump you can see: 0 to 25. So every jump is <strong>25</strong>.
        </div>
        <TryIt
          prompt={<>2. What is the missing number?</>}
          accept={["50"]}
          placeholder="the missing number"
          value={fade}
          setValue={setFade}
          hint="jump on from 25 by 25."
          explain={
            <>
              25 + 25 = <strong>50</strong>. Check it: 50 + 25 = 75, and 75 + 25 = 100. Every jump
              matches.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Reading a number line</div>
          <div className="mt-2">1. Count the jumps between marks, not the marks</div>
          <div className="mt-1">2. Every gap is worth the same</div>
          <div className="mt-1">3. Find one jump, then use it everywhere</div>
        </div>
        <KeyIdea>
          💡 5 marks means 4 jumps. If your answer is one too big, you probably counted the mark you
          started on.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
