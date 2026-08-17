"use client";

import { useState } from "react";
import { Step, KeyIdea, WrongBox } from "@/components/lesson/Step";
import { LessonShell, TryIt } from "@/components/lesson/LessonShell";
import { PrimaryButton } from "@/components/ui";

/**
 * Sorting into groups and counting them (Grade 1) — the very start of data.
 *
 * Two things go wrong in the bank. A child sorts by whichever property catches
 * their eye rather than the rule they were given, and a child reads a tally
 * bundle of five as four, because the slash does not look like a mark. Both are
 * fixed by making the rule and the bundle visible instead of spoken.
 */

const CHIP_COLOUR = {
  red: "#dc2626",
  blue: "#2563eb",
  green: "#16a34a",
} as const;

type ChipSpec = {
  shape: "circle" | "square" | "triangle";
  colour: keyof typeof CHIP_COLOUR;
  big?: boolean;
};

/** One button on the tray. Colour, shape and size all vary on purpose. */
function Chip({ shape, colour, big = false }: ChipSpec) {
  const s = big ? 38 : 24;
  const fill = CHIP_COLOUR[colour];
  const pad = big ? 3 : 2;
  const inner = s - pad * 2;
  return (
    <svg
      width={s}
      height={s}
      viewBox={`0 0 ${s} ${s}`}
      role="img"
      aria-label={`${big ? "big" : "small"} ${colour} ${shape}`}
    >
      {shape === "circle" && <circle cx={s / 2} cy={s / 2} r={inner / 2} fill={fill} />}
      {shape === "square" && <rect x={pad} y={pad} width={inner} height={inner} rx="3" fill={fill} />}
      {shape === "triangle" && (
        <polygon
          points={`${s / 2},${pad} ${s - pad},${s - pad} ${pad},${s - pad}`}
          fill={fill}
        />
      )}
    </svg>
  );
}

/** A boxed group of chips with a heading, so a "rule" has somewhere to live. */
function Tray({
  chips,
  heading,
  tone = "plain",
}: {
  chips: ChipSpec[];
  heading?: string;
  tone?: "plain" | "ok" | "err";
}) {
  const border =
    tone === "ok" ? "border-ok-600/50 bg-ok-100" : tone === "err" ? "border-err-600/50 bg-err-100/60" : "border-ink-300 bg-paper";
  return (
    <div className={`rounded-2xl border-2 border-dashed px-3 py-3 ${border}`}>
      {heading && (
        <div className="mb-2 text-center text-xs font-bold uppercase tracking-wide text-ink-700">
          {heading}
        </div>
      )}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {chips.map((c, i) => (
          <Chip key={i} {...c} />
        ))}
      </div>
    </div>
  );
}

/** Tally marks drawn as real bundles of five, slash and all. */
function Tally({ n, label }: { n: number; label?: string }) {
  const bundles = Math.floor(n / 5);
  const rest = n % 5;
  const strokeGap = 8;
  const bundleW = strokeGap * 4 + 10;
  const W = bundles * bundleW + (rest > 0 ? rest * strokeGap + 6 : 0) + 6;
  const H = 40;
  const marks: React.ReactNode[] = [];
  let x = 4;
  for (let b = 0; b < bundles; b++) {
    for (let k = 0; k < 4; k++) {
      marks.push(
        <line
          key={`b${b}-${k}`}
          x1={x + k * strokeGap}
          y1={6}
          x2={x + k * strokeGap}
          y2={32}
          stroke="#374151"
          strokeWidth="3"
          strokeLinecap="round"
        />
      );
    }
    marks.push(
      <line
        key={`slash${b}`}
        x1={x - 4}
        y1={30}
        x2={x + 3 * strokeGap + 4}
        y2={8}
        stroke="#dc2626"
        strokeWidth="3"
        strokeLinecap="round"
      />
    );
    x += bundleW;
  }
  for (let k = 0; k < rest; k++) {
    marks.push(
      <line
        key={`r${k}`}
        x1={x + k * strokeGap}
        y1={6}
        x2={x + k * strokeGap}
        y2={32}
        stroke="#374151"
        strokeWidth="3"
        strokeLinecap="round"
      />
    );
  }
  return (
    <figure className="m-0">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: W * 1.6 }} role="img" aria-label={`tally for ${n}`}>
        {marks}
      </svg>
      {label && (
        <figcaption className="mt-1 text-center text-sm font-semibold text-ink-700">{label}</figcaption>
      )}
    </figure>
  );
}

const MIXED: ChipSpec[] = [
  { shape: "circle", colour: "red", big: true },
  { shape: "triangle", colour: "blue" },
  { shape: "square", colour: "red" },
  { shape: "circle", colour: "blue", big: true },
  { shape: "triangle", colour: "red" },
  { shape: "square", colour: "green", big: true },
  { shape: "circle", colour: "green" },
  { shape: "square", colour: "blue" },
];

export function SortingDataLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [guess, setGuess] = useState<string | null>(null);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 1 · Data · Sorting and Counting"
      title="Putting things into groups"
      minutes={4}
      step={step}
      total={7}
    >
      <Step n={1} title="A messy tray" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">Here are all your buttons, jumbled up.</p>
        <div className="mt-4">
          <Tray chips={MIXED} />
        </div>
        <p className="mt-4 text-ink-700">Tidy them into groups. But groups of what?</p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(2)}>Have a look</PrimaryButton>
        </div>
      </Step>

      <Step n={2} title="Same and different" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <p className="text-ink-700">Every button has three things you could look at.</p>
        <div className="mt-3 space-y-2">
          {[
            ["its colour", "red, blue or green"],
            ["its shape", "circle, square or triangle"],
            ["its size", "big or small"],
          ].map(([a, b], i) => (
            <div key={i} className="flex items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-bold text-ink-900">{a}</span>
              <span className="text-sm text-ink-700">{b}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-ink-700">
          You have to pick <strong>one</strong>. That choice is called the <strong>rule</strong>.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(3)}>Sort by colour</PrimaryButton>
        </div>
      </Step>

      <Step n={3} title="The rule is: colour" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">
          So the red group takes <strong>every red button</strong> — big, small, any shape.
        </p>
        <div className="mt-4">
          <Tray
            heading="red group"
            tone="ok"
            chips={[
              { shape: "circle", colour: "red", big: true },
              { shape: "square", colour: "red" },
              { shape: "triangle", colour: "red" },
            ]}
          />
        </div>
        <p className="mt-4 text-ink-700">Does this button belong in the red group?</p>
        <div className="mt-3 flex justify-center">
          <Chip shape="circle" colour="blue" big />
        </div>
        <div className="mt-3 grid gap-2">
          {[
            { k: "b", label: "Yes — it is big, like the big red one" },
            { k: "a", label: "No — it is blue" },
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
            This is exactly where lots of people slip.
            <div className="mt-3">
              <PrimaryButton onClick={() => go(4)}>Show me</PrimaryButton>
            </div>
          </div>
        )}
      </Step>

      <Step n={4} title="The mistake lots of people make" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <WrongBox>&ldquo;It&rsquo;s big, so it goes with the big ones&rdquo;</WrongBox>
        <p className="text-ink-700">
          Halfway through sorting, your eyes notice something else — the size — and you quietly
          change the rule.
        </p>
        <div className="mt-4">
          <Tray
            heading="red group?"
            tone="err"
            chips={[
              { shape: "circle", colour: "red", big: true },
              { shape: "square", colour: "red" },
              { shape: "triangle", colour: "red" },
              { shape: "circle", colour: "blue", big: true },
            ]}
          />
        </div>
        <p className="mt-4 text-ink-700">
          Now the group has no rule at all. Somebody looking at it cannot say what it is a group{" "}
          <em>of</em>.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(5)}>How do I stop that?</PrimaryButton>
        </div>
      </Step>

      <Step n={5} title="One rule, and check every one" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">
          Say the rule out loud before you start, then hold each button up and ask the{" "}
          <strong>same question</strong>.
        </p>
        <div className="mt-4 rounded-2xl bg-brand-50 px-4 py-3 text-center text-lg font-bold text-brand-800">
          &ldquo;Is it red?&rdquo;
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Tray
            heading="red"
            chips={[
              { shape: "circle", colour: "red", big: true },
              { shape: "square", colour: "red" },
              { shape: "triangle", colour: "red" },
            ]}
          />
          <Tray
            heading="blue"
            chips={[
              { shape: "triangle", colour: "blue" },
              { shape: "circle", colour: "blue", big: true },
              { shape: "square", colour: "blue" },
            ]}
          />
          <Tray
            heading="green"
            chips={[
              { shape: "square", colour: "green", big: true },
              { shape: "circle", colour: "green" },
            ]}
          />
        </div>
        <KeyIdea>
          Everything in a group must follow the <strong>one</strong> rule you chose. Size and shape
          have to wait their turn.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(6)}>Now count them</PrimaryButton>
        </div>
      </Step>

      <Step n={6} title="Counting with tally marks" open={step === 6} onOpen={() => go(6)} done={step > 6}>
        <p className="text-ink-700">
          Once things are sorted, you count each group. Tally marks make counting easy: four
          standing up, then the fifth goes <strong>across</strong> them.
        </p>
        <div className="mt-4 flex justify-center">
          <Tally n={5} label="this bundle is 5, not 4" />
        </div>
        <p className="mt-4 text-ink-700">The slash <em>is</em> a mark. Count it.</p>
        <div className="mt-4 flex justify-center">
          <Tally n={6} label="one bundle of 5, and 1 more = 6" />
        </div>
        <div className="mt-4 rounded-2xl bg-paper p-4">
          <ol className="space-y-2">
            {[
              ["Count the bundles", "1 bundle"],
              ["Each bundle is worth", "5"],
              ["Count the loose marks", "1"],
              ["Add them", "5 + 1 = 6"],
            ].map(([a, b], i) => (
              <li key={i} className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 text-sm">
                <span className="text-ink-700">
                  <span className="mr-2 font-bold text-brand-600">{i + 1}.</span>
                  {a}
                </span>
                <span className="font-bold text-ink-900">{b}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(7)}>Your turn</PrimaryButton>
        </div>
      </Step>

      <Step n={7} title="You try one" open={step === 7} onOpen={() => go(7)} done={false}>
        <p className="text-ink-700">A class sorted their pets into three groups.</p>
        <div className="mt-3 space-y-2">
          {[
            ["Dogs", 5],
            ["Cats", 3],
            ["Fish", 2],
          ].map(([name, n]) => (
            <div key={String(name)} className="flex items-center gap-3 rounded-xl bg-paper px-3 py-2">
              <span className="w-14 text-sm font-bold text-ink-900">{name}</span>
              <div className="flex-1">
                <Tally n={Number(n)} />
              </div>
              <span className="w-6 text-right text-sm font-bold text-ink-700">{n}</span>
            </div>
          ))}
        </div>
        <TryIt
          prompt={<>How many pets altogether?</>}
          accept={["10"]}
          placeholder="a number"
          value={fade}
          setValue={setFade}
          hint="add all three group counts together."
          explain={
            <>
              5 + 3 + 2 = <strong>10 pets</strong>. Every pet is in exactly one group, so the groups
              always add up to the whole.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Sorting</div>
          <div className="mt-2">1. Choose one rule</div>
          <div className="mt-1">2. Ask the same question about every item</div>
          <div className="mt-1">3. Count each group — a tally bundle is 5</div>
        </div>
        <KeyIdea>
          💡 A group only means something when every single thing in it follows the same one rule.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
