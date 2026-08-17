"use client";

import { useState } from "react";
import { Step, KeyIdea, WrongBox } from "@/components/lesson/Step";
import { LessonShell, TryIt } from "@/components/lesson/LessonShell";
import { PrimaryButton } from "@/components/ui";

/**
 * Counting a set of objects (counting family, small `max`).
 *
 * The misconception here is not about numbers at all — a child who can recite
 * "one two three four five" perfectly still gets a different answer every time
 * they count a jumbled pile. The cause is that nothing in the pile records
 * which items have already been given a number, so items get counted twice or
 * missed. The fix taught here is the physical one researchers actually
 * recommend: move each object as you say its number, and know that the last
 * number said is the answer (cardinality).
 */

type Ring = "double" | "miss" | null;

/** Objects dropped where they fell — the hard case for a young counter. */
function Scatter({
  items,
  tags,
  rings,
  caption,
}: {
  items: { x: number; y: number; icon: string }[];
  /** number said over each object, or null if it never got one */
  tags?: (string | null)[];
  rings?: Ring[];
  caption?: string;
}) {
  return (
    <figure className="m-0">
      <div className="relative mx-auto h-44 w-full max-w-xs rounded-2xl border-2 border-ink-100 bg-paper">
        {items.map((it, i) => {
          const ring = rings?.[i] ?? null;
          const tag = tags?.[i] ?? null;
          return (
            <div
              key={i}
              className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
              style={{ left: `${it.x}%`, top: `${it.y}%` }}
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full text-2xl ${
                  ring === "double"
                    ? "border-2 border-err-600 bg-err-100"
                    : ring === "miss"
                      ? "border-2 border-dashed border-warn-600 bg-warn-100"
                      : ""
                }`}
              >
                {it.icon}
              </span>
              {tag && (
                <span className="mt-0.5 rounded-md bg-white px-1 text-xs font-bold text-brand-700">
                  {tag}
                </span>
              )}
            </div>
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

/** The same objects, lined up and tagged one by one. */
function RowCount({
  icon,
  n,
  tagged,
  caption,
}: {
  icon: string;
  n: number;
  /** how many have been given a number so far */
  tagged?: number;
  caption?: string;
}) {
  const show = tagged ?? n;
  return (
    <figure className="m-0">
      <div className="flex flex-wrap items-end justify-center gap-2 rounded-2xl border-2 border-ink-100 bg-paper px-2 py-3">
        {Array.from({ length: n }, (_, i) => (
          <div key={i} className="flex flex-col items-center">
            <span className="text-2xl">{icon}</span>
            <span
              className={`mt-0.5 text-xs font-bold ${
                i < show ? "text-brand-700" : "text-ink-300"
              }`}
            >
              {i < show ? i + 1 : "?"}
            </span>
          </div>
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

const BERRIES = [
  { x: 18, y: 26, icon: "🍓" },
  { x: 52, y: 17, icon: "🍓" },
  { x: 81, y: 32, icon: "🍓" },
  { x: 30, y: 60, icon: "🍓" },
  { x: 62, y: 54, icon: "🍓" },
  { x: 87, y: 74, icon: "🍓" },
  { x: 44, y: 84, icon: "🍓" },
];

export function CountingObjectsLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [guess, setGuess] = useState<string | null>(null);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 1 · Number · Counting"
      title="Counting without losing your place"
      minutes={5}
      step={step}
      total={6}
    >
      <Step n={1} title="A pile of berries" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">Count the berries.</p>
        <div className="mt-4">
          <Scatter items={BERRIES} />
        </div>
        <p className="mt-4 text-ink-700">How many did you get?</p>
        <div className="mt-3 grid gap-2">
          {["6", "7", "8"].map((o) => (
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
              I got {o}
            </button>
          ))}
        </div>
        {guess && (
          <div className="mt-4 rounded-xl bg-paper px-4 py-3 text-sm text-ink-700 pop-in">
            Count them again. Did you get the same number?
            <div className="mt-3">
              <PrimaryButton onClick={() => go(2)}>Show me</PrimaryButton>
            </div>
          </div>
        )}
      </Step>

      <Step n={2} title="You already know the words" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <p className="text-ink-700">Say them out loud.</p>
        <div className="mt-4 flex flex-wrap justify-center gap-1.5">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
            <span
              key={n}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-100 text-base font-bold text-brand-700"
            >
              {n}
            </span>
          ))}
        </div>
        <p className="mt-4 text-ink-700">Easy. You know all of them.</p>
        <KeyIdea>
          So the hard part is <strong>not</strong> the words. The hard part is the pile.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(3)}>Why is the pile hard?</PrimaryButton>
        </div>
      </Step>

      <Step n={3} title="What goes wrong" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">Two things happen to lots of people.</p>

        <p className="mt-4 font-bold text-ink-900">1. One berry gets counted twice.</p>
        <div className="mt-2">
          <Scatter
            items={BERRIES}
            tags={["1", "2", "3", "4 · 5", "6", "7", "8"]}
            rings={[null, null, null, "double", null, null, null]}
            caption="You said 8. But there are not 8."
          />
        </div>

        <p className="mt-5 font-bold text-ink-900">2. One berry gets missed.</p>
        <div className="mt-2">
          <Scatter
            items={BERRIES}
            tags={["1", "2", "3", "4", null, "5", "6"]}
            rings={[null, null, null, null, "miss", null, null]}
            caption="You said 6. But there are not 6."
          />
        </div>

        <WrongBox>Say the numbers and hope</WrongBox>
        <p className="text-ink-700">
          Your eyes jump around the pile. Nothing on a berry shows that it was already counted. So
          it is very easy to touch one twice, or skip one.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(4)}>Show me the fix</PrimaryButton>
        </div>
      </Step>

      <Step n={4} title="Move it. Say it." open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <p className="text-ink-700">Move each berry as you say its number.</p>
        <div className="mt-3 space-y-2">
          {["Pick one up.", "Say the next number.", "Put it in a line.", "Do it again."].map((s, i) => (
            <div key={i} className="flex gap-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
              <span className="font-bold text-brand-600">{i + 1}.</span>
              <span className="font-semibold">{s}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-ink-700">Now the line shows what you have done.</p>
        <div className="mt-3">
          <RowCount icon="🍓" n={7} tagged={4} caption="4 moved. 3 still in the pile." />
        </div>
        <KeyIdea>
          <strong>One number for one berry.</strong> Never two numbers for one berry. Never a berry
          with no number.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(5)}>Finish the count</PrimaryButton>
        </div>
      </Step>

      <Step n={5} title="The last number is the answer" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <div className="mt-1">
          <RowCount icon="🍓" n={7} caption="1, 2, 3, 4, 5, 6, 7" />
        </div>
        <p className="mt-4 text-center text-xl font-bold text-ok-600">7 berries 🍓</p>
        <p className="mt-4 text-ink-700">
          The last number you say tells you <strong>how many</strong>. You do not count again to
          find out. It is 7.
        </p>
        <p className="mt-3 text-ink-700">
          You can start with any berry you like. As long as each one gets exactly one number, you
          always get 7.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(6)}>Your turn</PrimaryButton>
        </div>
      </Step>

      <Step n={6} title="You try one" open={step === 6} onOpen={() => go(6)} done={false}>
        <p className="text-ink-700">These fish are already in a line. I started the numbers.</p>
        <div className="mt-3">
          <RowCount icon="🐟" n={9} tagged={3} />
        </div>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          Touch each fish. Keep going: 4, 5, 6 &hellip;
        </div>
        <TryIt
          prompt={<>2. How many fish?</>}
          accept={["9"]}
          placeholder="how many"
          value={fade}
          setValue={setFade}
          hint="give every fish one number. Do not skip one, and do not say two numbers for one fish."
          explain={
            <>
              There are <strong>9</strong>. The last number you said was 9, so 9 is how many.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">To count things</div>
          <div className="mt-2">1. Move each one as you say its number</div>
          <div className="mt-1">2. One number for one thing</div>
          <div className="mt-1">3. The last number you say is how many</div>
        </div>
        <KeyIdea>
          💡 If you get a different answer twice, you touched one twice or missed one. Line them up
          and count again.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
