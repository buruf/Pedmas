"use client";

import { useState } from "react";
import { Step, KeyIdea, WrongBox } from "@/components/lesson/Step";
import { LessonShell, TryIt } from "@/components/lesson/LessonShell";
import { NumberLine } from "@/components/lesson/Models";
import { PrimaryButton } from "@/components/ui";

/**
 * Missing numbers — 2 + ___ = 5.
 *
 * The misconception here is not arithmetic, it is reading. A child sees a plus
 * sign, sees two numbers, and adds them: 2 + 5 = 7. The cause is that "=" has
 * been taught as "and here comes the answer" rather than as "the same as", so
 * the number after it never registers as information.
 *
 * The repair is the CHECK. Putting 7 back in the box gives 2 + 7 = 9, and the
 * child can see 9 is not 5 without being told they were wrong. Substituting
 * back is then kept as a habit for every question in the lesson.
 */

/* ------------------------------------------------------------------ visuals */

/** An equation with a real, tappable-looking blank rather than a bare line. */
function Sentence({
  parts,
  fill,
  tone = "open",
}: {
  /** each entry is either a literal or the string "?" for the blank */
  parts: string[];
  /** what to show inside the blank */
  fill?: string;
  tone?: "open" | "wrong" | "right";
}) {
  const box =
    tone === "wrong"
      ? "border-err-600 bg-err-100 text-err-600"
      : tone === "right"
        ? "border-ok-600 bg-ok-100 text-ok-600"
        : "border-brand-400 bg-brand-50 text-brand-700";
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 text-2xl font-black tabular-nums text-ink-900">
      {parts.map((p, i) =>
        p === "?" ? (
          <span
            key={i}
            className={`inline-flex h-11 min-w-[2.75rem] items-center justify-center rounded-xl border-2 border-dashed px-2 ${box}`}
          >
            {fill ?? ""}
          </span>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </div>
  );
}

/** Balance scales — the picture that makes "=" mean "the same as". */
function Scale({
  left,
  right,
  tilt = "level",
}: {
  left: string;
  right: string;
  tilt?: "level" | "left" | "right";
}) {
  const rotate = tilt === "level" ? 0 : tilt === "left" ? -7 : 7;
  return (
    <div className="mx-auto max-w-sm">
      <div
        className="flex items-stretch gap-3 transition"
        style={{ transform: `rotate(${rotate}deg)` }}
      >
        <div className="flex flex-1 items-center justify-center rounded-xl border-2 border-brand-300 bg-brand-50 px-3 py-4 text-xl font-black text-ink-900">
          {left}
        </div>
        <div className="flex items-center text-2xl font-black text-ink-500">=</div>
        <div className="flex flex-1 items-center justify-center rounded-xl border-2 border-brand-300 bg-brand-50 px-3 py-4 text-xl font-black text-ink-900">
          {right}
        </div>
      </div>
      <div className="mx-auto mt-1 h-0 w-0 border-x-[14px] border-b-[18px] border-x-transparent border-b-ink-300" />
      <p className="mt-1 text-center text-xs font-semibold text-ink-500">
        {tilt === "level" ? "both sides the same — balanced" : "one side is heavier — not balanced"}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------- lesson */

export function MissingNumberLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [check, setCheck] = useState("");
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 1–3 · Addition & Subtraction · Missing Numbers"
      title="What goes in the box?"
      minutes={5}
      step={step}
      total={7}
    >
      <Step n={1} title="A number has gone missing" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">Someone rubbed out one of the numbers.</p>
        <div className="mt-5">
          <Sentence parts={["2", "+", "?", "=", "5"]} />
        </div>
        <p className="mt-5 text-ink-700">What number belongs in the box?</p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(2)}>Let&rsquo;s work it out</PrimaryButton>
        </div>
      </Step>

      <Step n={2} title="The trap in the plus sign" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <p className="text-ink-700">
          Lots of people see the <strong>+</strong>, spot the two numbers they <em>can</em> see, and
          add them.
        </p>
        <WrongBox>2 + 5 = 7</WrongBox>
        <p className="text-ink-700">It is a very sensible-looking move. So let&rsquo;s test it.</p>
        <p className="mt-3 text-ink-700">Put the 7 in the box and read the whole sentence again.</p>
        <div className="mt-4">
          <Sentence parts={["2", "+", "?", "=", "5"]} fill="7" tone="wrong" />
        </div>
        <p className="mt-4 text-ink-700">
          2 + 7 is <strong>9</strong>. The sentence says it should be <strong>5</strong>. So 7 cannot
          be the missing number.
        </p>
        <KeyIdea>
          Always put your answer back in the box and read it again. The sentence tells you straight
          away whether it fits.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(3)}>So what does the 5 mean?</PrimaryButton>
        </div>
      </Step>

      <Step n={3} title="The equals sign means the same as" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">
          Most people read <strong>=</strong> as &ldquo;and here comes the answer&rdquo;. That is what
          makes the 5 easy to ignore.
        </p>
        <p className="mt-3 text-ink-700">
          It really means <strong>the same as</strong>. Think of a see-saw that has to balance.
        </p>
        <div className="mt-4">
          <Scale left="2 + ?" right="5" />
        </div>
        <p className="mt-4 text-ink-700">Now try the 7 on the see-saw.</p>
        <div className="mt-3">
          <Scale left="2 + 7 = 9" right="5" tilt="left" />
        </div>
        <p className="mt-4 text-ink-700">
          The left side is far too heavy. The <strong>5</strong> was never the missing answer — it was
          the <strong>total</strong>, and it was there all along.
        </p>
        <KeyIdea>
          The answer is already written down. The box is one of the <em>parts</em>.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(4)}>How do I find the part?</PrimaryButton>
        </div>
      </Step>

      <Step n={4} title="Say it as a sentence" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <p className="text-ink-700">Read the box out loud as a question:</p>
        <div className="mt-3 rounded-2xl bg-paper px-4 py-3 text-center text-lg font-bold text-ink-900">
          &ldquo;2 and how many more make 5?&rdquo;
        </div>
        <p className="mt-4 text-ink-700">Start at 2. Count up until you reach 5.</p>
        <div className="mt-3 flex justify-center">
          <NumberLine
            from={0}
            to={6}
            marks={[2, 5]}
            jumps={[{ from: 2, to: 5, text: "+3" }]}
            label="from 2 up to 5 is 3 hops"
          />
        </div>
        <div className="mt-4">
          <Sentence parts={["2", "+", "?", "=", "5"]} fill="3" tone="right" />
        </div>
        <p className="mt-4 text-ink-700">
          Check it: 2 + 3 = 5. ✓ The see-saw balances.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(5)}>Is there a faster way?</PrimaryButton>
        </div>
      </Step>

      <Step n={5} title="Or take the part you know away" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">
          Counting up is fine for small hops. For bigger ones, <strong>undo</strong> the plus instead.
        </p>
        <p className="mt-2 text-ink-700">
          The whole is there. One part is there. Take the part off the whole and the other part is
          what is left.
        </p>
        <div className="mt-4">
          <Sentence parts={["4", "+", "?", "=", "9"]} />
        </div>
        <div className="mt-4 space-y-2">
          {[
            ["The whole", "9"],
            ["The part you can see", "4"],
            ["So the box is", "9 − 4 = 5"],
          ].map(([a, b], i) => (
            <div
              key={i}
              className={`flex items-center justify-between gap-3 rounded-xl px-3 py-2 ${
                i === 2 ? "bg-ok-100 font-black text-ok-600" : "bg-paper text-ink-700"
              }`}
            >
              <span className="text-sm font-semibold">{a}</span>
              <span className="font-bold tabular-nums">{b}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-ink-700">Now check it before you move on.</p>
        <TryIt
          prompt={<>Put 5 in the box. What is 4 + 5?</>}
          accept={["9"]}
          placeholder="the total"
          value={check}
          setValue={setCheck}
          hint="just add the two numbers now that there is no box."
          explain={
            <>
              4 + 5 = 9, and the sentence wanted 9. ✓ The box was <strong>5</strong>. Notice you found
              a <em>plus</em> answer by doing a <em>take-away</em>.
            </>
          }
          onCorrect={() => go(6)}
        />
      </Step>

      <Step n={6} title="When the box is somewhere else" open={step === 6} onOpen={() => go(6)} done={step > 6}>
        <p className="text-ink-700">Same idea, wherever the box sits. Always undo the sign you see.</p>

        <div className="mt-4 rounded-2xl border-2 border-ink-100 p-4">
          <Sentence parts={["8", "−", "?", "=", "3"]} />
          <p className="mt-3 text-sm text-ink-700">
            Say it: &ldquo;I had 8. Now I have 3. How much went away?&rdquo;
          </p>
          <p className="mt-2 text-sm font-bold text-ok-600">8 − 3 = 5, so the box is 5.</p>
          <p className="mt-1 text-xs text-ink-500">Check: 8 − 5 = 3 ✓</p>
        </div>

        <div className="mt-3 rounded-2xl border-2 border-ink-100 p-4">
          <Sentence parts={["3", "×", "?", "=", "12"]} />
          <p className="mt-3 text-sm text-ink-700">
            Say it: &ldquo;3 groups of how many make 12?&rdquo; Times is undone by divide.
          </p>
          <p className="mt-2 text-sm font-bold text-ok-600">12 ÷ 3 = 4, so the box is 4.</p>
          <p className="mt-1 text-xs text-ink-500">Check: 3 × 4 = 12 ✓</p>
        </div>

        <KeyIdea>
          Every sign has an undo. A <strong>+</strong> is undone by taking away. A{" "}
          <strong>×</strong> is undone by dividing. And when the box sits after a{" "}
          <strong>−</strong>, take the number you ended with away from the one you started with.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(7)}>Your turn</PrimaryButton>
        </div>
      </Step>

      <Step n={7} title="You try one — I'll start it" open={step === 7} onOpen={() => go(7)} done={false}>
        <div className="mt-1">
          <Sentence parts={["7", "+", "?", "=", "15"]} />
        </div>
        <div className="mt-4 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          The <strong>15</strong> is the whole, not the answer to find. The box is a{" "}
          <strong>part</strong>.
        </div>
        <div className="mt-2 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">2. </span>
          So take the part you can see off the whole: <strong>15 − 7</strong>.
        </div>
        <TryIt
          prompt={<>3. What number goes in the box?</>}
          accept={["8"]}
          placeholder="the box"
          value={fade}
          setValue={setFade}
          hint="7 and how many more make 15? Try 15 − 7."
          explain={
            <>
              <strong>8</strong>. Check it: 7 + 8 = 15 ✓. Adding the two numbers you could see would
              have given 22 — nowhere near.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">To fill a box</div>
          <div className="mt-2">1. Find the whole — it is next to the = sign</div>
          <div className="mt-1">2. Say the sentence out loud as a question</div>
          <div className="mt-1">3. Undo the sign to find the missing part</div>
          <div className="mt-1">4. Put your answer back in and read it again</div>
        </div>
        <KeyIdea>
          💡 A plus sign does not always mean &ldquo;add these two numbers&rdquo;. Look at where the
          box is first.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
