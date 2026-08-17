"use client";

import { useState } from "react";
import { MathText } from "@/components/MathText";
import { Step, KeyIdea, WrongBox } from "@/components/lesson/Step";
import { LessonShell, TryIt } from "@/components/lesson/LessonShell";
import { PrimaryButton } from "@/components/ui";

/**
 * A strip of `a` cells in one colour followed by `b` in another.
 *
 * Local to this file because the whole point of the picture is that the two
 * parts sit side by side inside one whole — which is what makes part-to-part
 * and part-to-whole visibly different objects rather than two readings of the
 * same pair of numbers.
 */
function RatioBar({
  a,
  b,
  aLabel,
  bLabel,
  caption,
}: {
  a: number;
  b: number;
  aLabel: string;
  bLabel: string;
  caption?: string;
}) {
  const total = a + b;
  const width = 280;
  const height = 44;
  const w = width / total;
  return (
    <figure className="m-0">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        style={{ maxWidth: width }}
        role="img"
        aria-label={`${a} ${aLabel} and ${b} ${bLabel}`}
      >
        {Array.from({ length: total }, (_, i) => (
          <rect
            key={i}
            x={i * w}
            y={0}
            width={w}
            height={height}
            rx="3"
            fill={i < a ? "#7c3aed" : "#0d9488"}
            stroke="#ffffff"
            strokeWidth="2"
          />
        ))}
      </svg>
      <figcaption className="mt-1 flex flex-wrap justify-center gap-4 text-xs font-semibold text-ink-700">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm" style={{ background: "#7c3aed" }} />
          {a} {aLabel}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm" style={{ background: "#0d9488" }} />
          {b} {bLabel}
        </span>
      </figcaption>
      {caption && (
        <p className="mt-2 text-center text-sm font-semibold text-ink-700">
          <MathText text={caption} />
        </p>
      )}
    </figure>
  );
}

/**
 * What a ratio compares.
 *
 * Confronts the error that swallows the whole topic: reading 3:2 as "3 out of
 * 2". A ratio names two parts, a fraction names a part of a whole, and until a
 * child can see both quantities inside the same strip they will read every
 * ratio question as whichever one they met most recently.
 */
export function RatioBasicsLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [guess, setGuess] = useState<string | null>(null);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 6 · Ratios · Understanding Ratios"
      title="What a ratio is comparing"
      minutes={6}
      step={step}
      total={6}
    >
      <Step n={1} title="Mixing a jug of punch" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          The recipe says: <strong>3 cups of juice to 2 cups of soda</strong>. Written short, that
          is the ratio <strong>3:2</strong>.
        </p>
        <p className="mt-3 text-ink-700">
          So what fraction of the finished punch is juice?
        </p>
        <div className="mt-4 grid gap-2">
          {[
            { k: "b", label: "3 out of 2 of it — the ratio says 3:2" },
            { k: "a", label: "3 out of 5 of it" },
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
            Let&rsquo;s pour the jug and look at it.
            <div className="mt-3"><PrimaryButton onClick={() => go(2)}>Show me</PrimaryButton></div>
          </div>
        )}
      </Step>

      <Step n={2} title="The mistake almost everyone makes" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <WrongBox>3:2 means &ldquo;3 out of 2 cups are juice&rdquo;</WrongBox>
        <p className="text-ink-700">
          Test that. Three out of two would mean more juice than there is punch — you cannot pour
          three cups out of a two-cup jug. Something has gone wrong before the arithmetic starts.
        </p>
        <div className="mt-4">
          <RatioBar a={3} b={2} aLabel="cups of juice" bLabel="cups of soda" />
        </div>
        <p className="mt-4 text-ink-700">
          There are <strong>5</strong> cups in the jug altogether, and 3 of them are juice. So juice
          is <MathText text="{3/5}" /> of the punch.
        </p>
        <KeyIdea>
          The ratio 3:2 compares juice against <em>soda</em>. The fraction{" "}
          <MathText text="{3/5}" /> compares juice against <em>the whole jug</em>. Same drink, two
          different questions.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(3)}>How do I tell them apart?</PrimaryButton></div>
      </Step>

      <Step n={3} title="Read the words, in order" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">
          A ratio always answers exactly the question it was asked. The words before and after{" "}
          <strong>to</strong> tell you which two amounts go where.
        </p>
        <div className="mt-3 space-y-2">
          {[
            ["juice to soda", "3:2", "part to part"],
            ["soda to juice", "2:3", "part to part, other way round"],
            ["juice to all the punch", "3:5", "part to whole"],
            ["soda to all the punch", "2:5", "part to whole"],
          ].map(([a, b, c]) => (
            <div key={a} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-semibold text-ink-900">{a}</span>
              <span className="text-sm font-bold text-brand-700">{b}</span>
              <span className="text-sm text-ink-500">{c}</span>
            </div>
          ))}
        </div>
        <KeyIdea>
          Whenever a question says <strong>all</strong>, <strong>total</strong> or{" "}
          <strong>altogether</strong>, add the parts first. That is the only time the 5 appears.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(4)}>Sharing in a ratio</PrimaryButton></div>
      </Step>

      <Step n={4} title="Sharing $40 in the ratio 3:5" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <p className="text-ink-700">
          Two friends share <strong>$40</strong> in the ratio <strong>3:5</strong>. This is where
          the total matters, so start by counting the parts.
        </p>
        <div className="mt-4 rounded-2xl bg-paper p-4">
          <ol className="space-y-2">
            {[
              ["Count the parts: 3 + 5", "8 parts"],
              ["One part is worth 40 ÷ 8", "$5"],
              ["First share: 3 × 5", "$15"],
              ["Second share: 5 × 5", "$25"],
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
          <RatioBar a={3} b={5} aLabel="parts ($15)" bLabel="parts ($25)" />
        </div>
        <p className="mt-3 text-center font-bold text-ok-600">
          Check: 15 + 25 = 40 ✓
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(5)}>Simplest form</PrimaryButton></div>
      </Step>

      <Step n={5} title="Ratios simplify like fractions" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">
          A ratio of <strong>6:9</strong> describes the same mix as <strong>2:3</strong> — for every
          2 of the first you have 3 of the second, whether you count in ones or in threes.
        </p>
        <div className="mt-4 flex flex-col gap-4">
          <RatioBar a={6} b={9} aLabel="yellow" bLabel="green" caption="6:9" />
          <RatioBar a={2} b={3} aLabel="yellow" bLabel="green" caption="divide both by 3 → 2:3" />
        </div>
        <KeyIdea>
          Divide both sides by their greatest common factor and the ratio is in{" "}
          <strong>simplest form</strong>. It is the same instruction you already use on fractions.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(6)}>Your turn</PrimaryButton></div>
      </Step>

      <Step n={6} title="You try one" open={step === 6} onOpen={() => go(6)} done={false}>
        <p className="text-ink-700">
          A bag holds <strong>4 red counters and 6 blue counters</strong>. What is the ratio of red
          counters to <strong>all</strong> the counters, in simplest form?
        </p>
        <div className="mt-3">
          <RatioBar a={4} b={6} aLabel="red" bLabel="blue" />
        </div>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          The word is <strong>all</strong>, so add the parts: 4 + 6 = <strong>10</strong> counters.
        </div>
        <TryIt
          prompt={<>2. Now write red to all, in simplest form:</>}
          accept={["2:5", "2/5", "2to5"]}
          placeholder="like 3:4"
          value={fade}
          setValue={setFade}
          hint="you want 4 out of the 10, then divide both numbers by 2."
          explain={
            <>
              <strong>2:5</strong>. Red to all is 4:10, and both sides divide by 2. Note that red to
              blue would have been 4:6 = 2:3 — a different question, a different answer.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Ratios</div>
          <div className="mt-2">1. The order of the words is the order of the numbers</div>
          <div className="mt-1">2. Part to whole? Add the parts first</div>
          <div className="mt-1">3. Simplify by dividing both sides by the same number</div>
        </div>
        <KeyIdea>
          💡 3:2 is not a fraction. To turn it into one, work out the total — and 3:2 becomes{" "}
          <MathText text="{3/5}" />.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}

/**
 * Equivalent ratios.
 *
 * The error here is not carelessness — adding the same amount to both sides
 * genuinely feels fair, and it is exactly what keeps a *difference* the same.
 * The lesson tests that instinct on a recipe, where a wrong mix can be tasted,
 * rather than asserting the rule.
 */
export function EquivalentRatioLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [guess, setGuess] = useState<string | null>(null);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 6 · Ratios · Equivalent Ratios"
      title="Different numbers, same mix"
      minutes={6}
      step={step}
      total={6}
    >
      <Step n={1} title="Making twice as much squash" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          A jug of squash is <strong>1 cup of cordial to 4 cups of water</strong> — the ratio{" "}
          <strong>1:4</strong>. You need twice as much.
        </p>
        <p className="mt-3 text-ink-700">Which of these tastes the same?</p>
        <div className="mt-4 grid gap-2">
          {[
            { k: "b", label: "3:6 — add 2 cups of each" },
            { k: "a", label: "2:8 — double each" },
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
            Both look fair. Let&rsquo;s taste them.
            <div className="mt-3"><PrimaryButton onClick={() => go(2)}>Show me</PrimaryButton></div>
          </div>
        )}
      </Step>

      <Step n={2} title="The mistake almost everyone makes" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <WrongBox>1:4 = 3:6 &nbsp;&ldquo;add 2 to both sides&rdquo;</WrongBox>
        <p className="text-ink-700">
          Adding the same to both sides <em>does</em> keep something the same — the gap between
          them. But a ratio is about how many times bigger one side is, and that changes.
        </p>
        <div className="mt-4 flex flex-col gap-4">
          <RatioBar a={1} b={4} aLabel="cordial" bLabel="water" caption="1:4 — water is 4 times the cordial" />
          <RatioBar a={3} b={6} aLabel="cordial" bLabel="water" caption="3:6 — water is only 2 times the cordial" />
          <RatioBar a={2} b={8} aLabel="cordial" bLabel="water" caption="2:8 — water is 4 times the cordial ✓" />
        </div>
        <p className="mt-4 text-ink-700">
          3:6 is much stronger squash. Doubling both sides is what keeps the taste.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(3)}>So what is the rule?</PrimaryButton></div>
      </Step>

      <Step n={3} title="Whatever you do to one side, do to the other" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">
          Equivalent ratios come from <strong>multiplying or dividing</strong> both sides by the
          same number — never from adding or subtracting.
        </p>
        <div className="mt-3 space-y-2">
          {[
            ["1:4 × 2", "2:8", "same mix"],
            ["1:4 × 5", "5:20", "same mix"],
            ["1:4 + 2", "3:6", "different mix"],
          ].map(([a, b, c]) => (
            <div key={a} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-semibold text-ink-900">{a}</span>
              <span className="text-sm font-bold text-brand-700">{b}</span>
              <span className={`text-sm ${c === "same mix" ? "text-ok-600" : "text-err-600"}`}>{c}</span>
            </div>
          ))}
        </div>
        <KeyIdea>
          A quick test: multiply crosswise. For 1:4 and 2:8, 1 × 8 = 8 and 4 × 2 = 8 — equal, so
          they match. For 1:4 and 3:6, 1 × 6 = 6 but 4 × 3 = 12. Not equal, not the same mix.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(4)}>Find a missing number</PrimaryButton></div>
      </Step>

      <Step n={4} title="Filling in the gap" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <p className="text-ink-700">
          A ratio table has one cell empty: <strong>3:5 = 12:?</strong>
        </p>
        <div className="mt-4 rounded-2xl bg-paper p-4">
          <ol className="space-y-2">
            {[
              ["Look at the side you can see: 3 became 12", "12 ÷ 3 = 4"],
              ["So the ratio was scaled by 4", "×4"],
              ["Do the same to the other side: 5 × 4", "20"],
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
        <p className="mt-3 text-center font-bold text-ok-600">3:5 = 12:20</p>
        <p className="mt-3 text-ink-700">
          Check it crosswise: 3 × 20 = 60 and 5 × 12 = 60. Equal ✓
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(5)}>A whole table</PrimaryButton></div>
      </Step>

      <Step n={5} title="Every column is the same ratio" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">
          A ratio table just lists several equivalent ratios side by side. This one keeps{" "}
          <strong>2 cups of flour to 3 cups of milk</strong>.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="mx-auto border-collapse text-center">
            <tbody>
              <tr>
                <td className="border border-ink-100 bg-paper px-3 py-2 text-sm font-bold text-ink-900">Flour</td>
                {[2, 4, 6, 10].map((v) => (
                  <td key={v} className="border border-ink-100 px-4 py-2 text-lg font-bold tabular-nums text-ink-900">
                    {v}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="border border-ink-100 bg-paper px-3 py-2 text-sm font-bold text-ink-900">Milk</td>
                {[3, 6, 9, 15].map((v) => (
                  <td key={v} className="border border-ink-100 px-4 py-2 text-lg font-bold tabular-nums text-brand-700">
                    {v}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-3 pt-1 text-xs font-semibold text-ink-500">scale</td>
                {["×1", "×2", "×3", "×5"].map((v) => (
                  <td key={v} className="px-4 pt-1 text-xs font-semibold text-ink-500">
                    {v}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <KeyIdea>
          Notice that milk is always <MathText text="1{1/2}" /> times the flour — 3 is to 2 as 15 is
          to 10. That fixed relationship is what &ldquo;equivalent&rdquo; means.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(6)}>Your turn</PrimaryButton></div>
      </Step>

      <Step n={6} title="You try one" open={step === 6} onOpen={() => go(6)} done={false}>
        <p className="text-ink-700">
          Fill in the missing number: <strong>4:7 = 24:?</strong>
        </p>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          The side you can see went from 4 to 24, so 24 ÷ 4 = <strong>6</strong>. The ratio was
          scaled by 6.
        </div>
        <TryIt
          prompt={<>2. Now scale the other side. What replaces the ?</>}
          accept={["42"]}
          placeholder="a number"
          value={fade}
          setValue={setFade}
          hint="do to the 7 exactly what was done to the 4 — multiply it by 6, do not add 20."
          explain={
            <>
              <strong>42</strong>, because 7 × 6 = 42. Check crosswise: 4 × 42 = 168 and 7 × 24 =
              168. Equal ✓ (Adding 20 to both would have given 24:27, and 4 × 27 = 108 while 7 × 24
              = 168 — nowhere near.)
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Equivalent ratios</div>
          <div className="mt-2">1. Multiply or divide both sides by the same number</div>
          <div className="mt-1">2. Never add or subtract — that changes the mix</div>
          <div className="mt-1">3. Check crosswise: the two products must match</div>
        </div>
        <KeyIdea>
          💡 Adding keeps the <em>difference</em> the same. Multiplying keeps the{" "}
          <em>ratio</em> the same. A ratio question always wants the second one.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
