"use client";

import { useState } from "react";
import { Step, KeyIdea, WrongBox } from "@/components/lesson/Step";
import { LessonShell, TryIt } from "@/components/lesson/LessonShell";
import { PrimaryButton } from "@/components/ui";

/**
 * Repeating patterns, growing patterns and pattern rules (patterns family).
 *
 * Two habits to break, and they are the same habit twice. Children decide a
 * rule from the first two terms and never test it, and they assume the rule
 * must be addition. "2, 4, …" is the perfect opening because *both* common
 * answers are defensible — the child is not wrong, they simply do not have
 * enough evidence yet. That reframes finding a rule as making a guess and
 * checking it against every term you can see, which is the actual skill.
 */

/** A repeating pattern of icons, with the repeating unit optionally boxed. */
function IconRow({
  icons,
  unit,
  caption,
}: {
  icons: string[];
  /** length of the repeating unit; boxes each copy */
  unit?: number;
  caption?: string;
}) {
  if (unit) {
    const groups: string[][] = [];
    for (let i = 0; i < icons.length; i += unit) groups.push(icons.slice(i, i + unit));
    return (
      <figure className="m-0">
        <div className="flex flex-wrap items-center justify-center gap-2">
          {groups.map((g, i) => (
            <span
              key={i}
              className="flex gap-1 rounded-xl border-2 border-dashed border-brand-300 bg-brand-50 px-2 py-1.5 text-2xl"
            >
              {g.map((ic, k) => (
                <span key={k}>{ic}</span>
              ))}
            </span>
          ))}
        </div>
        {caption && (
          <figcaption className="mt-2 text-center text-sm font-semibold text-ink-700">
            {caption}
          </figcaption>
        )}
      </figure>
    );
  }
  return (
    <figure className="m-0">
      <div className="flex flex-wrap items-center justify-center gap-1.5 text-2xl">
        {icons.map((ic, i) => (
          <span key={i}>{ic}</span>
        ))}
      </div>
      {caption && (
        <figcaption className="mt-2 text-center text-sm font-semibold text-ink-700">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

/** A number pattern with the step between each pair written above it. */
function GapStrip({
  terms,
  gaps,
  caption,
}: {
  terms: (string | number)[];
  /** label between term i and term i+1 */
  gaps?: (string | null)[];
  caption?: string;
}) {
  return (
    <figure className="m-0">
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        {terms.map((t, i) => {
          const blank = t === "?";
          const g = gaps?.[i] ?? null;
          return (
            <span key={i} className="flex items-center gap-1.5">
              <span
                className={`flex h-11 min-w-[3rem] items-center justify-center rounded-xl px-2 text-lg font-bold ${
                  blank
                    ? "border-2 border-dashed border-brand-500 bg-white text-brand-600"
                    : "bg-brand-100 text-brand-800"
                }`}
              >
                {t}
              </span>
              {g && i < terms.length - 1 && (
                <span className="rounded-md bg-warn-100 px-1.5 py-0.5 text-xs font-bold text-warn-600">
                  {g}
                </span>
              )}
            </span>
          );
        })}
      </div>
      {caption && (
        <figcaption className="mt-2 text-center text-sm font-semibold text-ink-700">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

export function PatternsLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [guess, setGuess] = useState<string | null>(null);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 1 · Patterns · Pattern rules"
      title="Finding the rule"
      minutes={6}
      step={step}
      total={7}
    >
      <Step n={1} title="Two numbers" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">A pattern starts like this.</p>
        <div className="mt-4">
          <GapStrip terms={[2, 4, "?"]} />
        </div>
        <p className="mt-4 text-ink-700">What comes next?</p>
        <div className="mt-3 grid gap-2">
          {["6", "8"].map((o) => (
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
            Good choice &mdash; and so is the other one.
            <div className="mt-3">
              <PrimaryButton onClick={() => go(2)}>How can both be right?</PrimaryButton>
            </div>
          </div>
        )}
      </Step>

      <Step n={2} title="Both answers work" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <p className="text-ink-700">Here are two real patterns. Both start 2, 4.</p>
        <div className="mt-4 space-y-4">
          <GapStrip
            terms={[2, 4, 6, 8]}
            gaps={["+2", "+2", "+2"]}
            caption="rule: add 2"
          />
          <GapStrip
            terms={[2, 4, 8, 16]}
            gaps={["×2", "×2", "×2"]}
            caption="rule: double it"
          />
        </div>
        <WrongBox>2, 4 &nbsp;&ldquo;so the rule is add 2&rdquo;</WrongBox>
        <p className="text-ink-700">
          Lots of people decide the rule the moment they see two numbers. It feels obvious. But two
          numbers can never tell you the rule &mdash; there is always more than one way to get from
          2 to 4.
        </p>
        <KeyIdea>
          You need a <strong>third</strong> number to test your guess against.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(3)}>So what do I do?</PrimaryButton>
        </div>
      </Step>

      <Step n={3} title="Guess, then check every step" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">
          Look at <strong>7, 10, 13, 16</strong>.
        </p>
        <div className="mt-3">
          <GapStrip terms={[7, 10, 13, 16]} />
        </div>
        <div className="mt-4 space-y-2">
          {[
            ["7 to 10", "+3"],
            ["10 to 13", "+3"],
            ["13 to 16", "+3"],
          ].map(([a, b], i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-3 rounded-xl bg-paper px-3 py-2 text-sm"
            >
              <span className="font-semibold text-ink-700">{a}</span>
              <span className="font-bold text-ok-600">{b}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-ink-700">
          Three checks, all the same. Now you can trust the rule: <strong>add 3</strong>.
        </p>
        <KeyIdea>
          Find the gap between <strong>every</strong> pair. If they all match, that is your rule.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(4)}>What if they do not match?</PrimaryButton>
        </div>
      </Step>

      <Step n={4} title="Not every pattern adds" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <p className="text-ink-700">
          Try <strong>3, 6, 12, 24</strong>.
        </p>
        <div className="mt-3">
          <GapStrip terms={[3, 6, 12, 24]} gaps={["+3", "+6", "+12"]} caption="the gaps are all different" />
        </div>
        <p className="mt-4 text-ink-700">
          3, then 6, then 12. The gaps do not match, so it is <strong>not</strong> an adding
          pattern.
        </p>
        <p className="mt-3 text-ink-700">When adding fails, try multiplying.</p>
        <div className="mt-3">
          <GapStrip terms={[3, 6, 12, 24]} gaps={["×2", "×2", "×2"]} caption="rule: double it" />
        </div>
        <div className="mt-3 space-y-2">
          {[
            ["3 × 2 = 6", "✓"],
            ["6 × 2 = 12", "✓"],
            ["12 × 2 = 24", "✓"],
          ].map(([a, b], i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-3 rounded-xl bg-paper px-3 py-2 text-sm"
            >
              <span className="font-semibold text-ink-700">{a}</span>
              <span className="font-bold text-ok-600">{b}</span>
            </div>
          ))}
        </div>
        <KeyIdea>
          If the gaps grow bigger and bigger, the pattern is probably{" "}
          <strong>multiplying</strong>, not adding.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(5)}>What about shape patterns?</PrimaryButton>
        </div>
      </Step>

      <Step n={5} title="Patterns that repeat" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">Some patterns do not grow at all. They just go round again.</p>
        <div className="mt-4">
          <IconRow icons={["🔴", "🔵", "🔴", "🔵", "🔴", "🔵"]} caption="what comes next?" />
        </div>
        <p className="mt-4 text-ink-700">Find the part that repeats, then box it up.</p>
        <div className="mt-3">
          <IconRow icons={["🔴", "🔵", "🔴", "🔵", "🔴", "🔵"]} unit={2} caption="the unit is 🔴🔵" />
        </div>
        <p className="mt-4 text-center text-lg font-bold text-ok-600">Next comes 🔴</p>
        <p className="mt-3 text-ink-700">
          The unit is not always two long. This one is <strong>three</strong> long.
        </p>
        <div className="mt-3">
          <IconRow
            icons={["⭐", "⭐", "🟢", "⭐", "⭐", "🟢", "⭐", "⭐", "🟢"]}
            unit={3}
            caption="the unit is ⭐⭐🟢"
          />
        </div>
        <KeyIdea>
          Same idea as before: guess the unit, then <strong>check it repeats</strong> all the way
          along.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(6)}>Do one together</PrimaryButton>
        </div>
      </Step>

      <Step n={6} title="Finding a missing term" open={step === 6} onOpen={() => go(6)} done={step > 6}>
        <p className="text-ink-700">
          What comes next in <strong>5, 8, 11, 14</strong>?
        </p>
        <div className="mt-3">
          <GapStrip terms={[5, 8, 11, 14, "?"]} />
        </div>
        <div className="mt-4 rounded-2xl bg-paper p-4">
          <ol className="space-y-2">
            {[
              ["Find the first gap", "8 − 5 = 3"],
              ["Check the next gap", "11 − 8 = 3"],
              ["Check again", "14 − 11 = 3"],
              ["All match, so add 3", "14 + 3 = 17"],
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
        <p className="mt-3 text-center text-xl font-bold text-ok-600">17</p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(7)}>Your turn</PrimaryButton>
        </div>
      </Step>

      <Step n={7} title="You try one" open={step === 7} onOpen={() => go(7)} done={false}>
        <p className="text-ink-700">This time the gap is in the middle.</p>
        <div className="mt-3">
          <GapStrip terms={[4, 9, 14, "?", 24]} />
        </div>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          Check two gaps first. 9 − 4 = <strong>5</strong>, and 14 − 9 = <strong>5</strong>. They
          match.
        </div>
        <TryIt
          prompt={<>2. What is the missing number?</>}
          accept={["19"]}
          placeholder="the missing number"
          value={fade}
          setValue={setFade}
          hint="add 5 to the number before the gap."
          explain={
            <>
              14 + 5 = <strong>19</strong>. Test it from the other side too: 19 + 5 = 24. The rule
              works everywhere, so it is the right rule.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Finding a pattern rule</div>
          <div className="mt-2">1. Two numbers are never enough — look at three</div>
          <div className="mt-1">2. Find the gap between every pair</div>
          <div className="mt-1">3. Gaps all equal? Add. Gaps growing? Try multiply</div>
        </div>
        <KeyIdea>
          💡 A rule is only a rule if it works on <strong>every</strong> step you can see. Always
          test it.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
