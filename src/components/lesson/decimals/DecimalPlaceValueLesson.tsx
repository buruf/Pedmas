"use client";

import { useState } from "react";
import { MathText } from "@/components/MathText";
import { Step, KeyIdea, WrongBox } from "@/components/lesson/Step";
import { LessonShell, TryIt } from "@/components/lesson/LessonShell";
import { HundredGrid, DecimalChart } from "@/components/lesson/Models";
import { PrimaryButton } from "@/components/ui";

/**
 * What a decimal is.
 *
 * Presented as place value continuing past the point rather than a new system,
 * because a child who sees "0.7" as a separate kind of object will never
 * reason about it. The hundred grid does the work: one whole, cut into ten
 * strips or a hundred squares.
 */
export function DecimalPlaceValueLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 4 · Decimals · Decimal Place Value"
      title="What the numbers after the point mean"
      minutes={5}
      step={step}
      total={6}
    >
      <Step n={1} title="Numbers between the whole ones" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          You already know 3 and 4. But what about the amounts <em>in between</em>? Half a pizza,
          part of a metre, a price like $3.50.
        </p>
        <div className="mt-4 flex justify-center">
          <HundredGrid shaded={100} label="one whole" />
        </div>
        <p className="mt-4 text-ink-700">
          To talk about parts of a whole, we keep going past the point.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(2)}>Show me</PrimaryButton></div>
      </Step>

      <Step n={2} title="Cut the whole into ten" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <p className="text-ink-700">
          Slice the whole into <strong>10 equal strips</strong>. Each strip is one{" "}
          <strong>tenth</strong>, written <strong>0.1</strong>.
        </p>
        <div className="mt-4 flex justify-center gap-6">
          <HundredGrid shaded={10} label="0.1 — one tenth" size={120} />
          <HundredGrid shaded={70} label="0.7 — seven tenths" size={120} />
        </div>
        <KeyIdea>
          0.7 isn&rsquo;t &ldquo;point seven&rdquo; as a mystery. It is{" "}
          <strong>7 tenths</strong> — the same as <MathText text="{7/10}" />.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(3)}>Smaller still?</PrimaryButton></div>
      </Step>

      <Step n={3} title="Cut each strip into ten again" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">
          Cut every strip into 10, and you get <strong>100 little squares</strong>. Each one is a{" "}
          <strong>hundredth</strong>, written <strong>0.01</strong>.
        </p>
        <div className="mt-4 flex justify-center">
          <HundredGrid shaded={43} label="0.43 — forty-three hundredths" />
        </div>
        <p className="mt-4 text-ink-700">
          That is 4 whole strips and 3 extra squares: <strong>4 tenths and 3 hundredths</strong>.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(4)}>Where do they go?</PrimaryButton></div>
      </Step>

      <Step n={4} title="It's the same place-value idea" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <p className="text-ink-700">
          Each column going right is worth ten times <em>less</em> than the one before — exactly
          the pattern you already know for tens and ones.
        </p>
        <div className="mt-4">
          <DecimalChart rows={[{ value: "3.42" }]} highlight="tenths" />
        </div>
        <p className="mt-4 text-ink-700">
          So <strong>3.42</strong> is 3 wholes, 4 tenths and 2 hundredths.
        </p>
        <KeyIdea>
          The decimal point isn&rsquo;t a divider between two numbers. It just marks where the
          whole ones stop.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(5)}>What goes wrong?</PrimaryButton></div>
      </Step>

      <Step n={5} title="The mistake almost everyone makes" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">People read the two parts as separate whole numbers:</p>
        <WrongBox>&ldquo;3.42 is a 3 and a 42, so it&rsquo;s a bit less than 3 and a half… or is it 45?&rdquo;</WrongBox>
        <p className="text-ink-700">
          The 42 is not forty-two of anything you can count alongside the 3. It is 42{" "}
          <strong>hundredths</strong> — less than half of one whole.
        </p>
        <div className="mt-3 flex justify-center">
          <HundredGrid shaded={42} label="0.42 — not even half a whole" />
        </div>
        <div className="mt-4"><PrimaryButton onClick={() => go(6)}>Your turn</PrimaryButton></div>
      </Step>

      <Step n={6} title="You try one" open={step === 6} onOpen={() => go(6)} done={false}>
        <div className="flex justify-center">
          <HundredGrid shaded={60} label="what decimal is shaded?" />
        </div>
        <TryIt
          prompt={<>Six whole strips are shaded. Write that as a decimal.</>}
          accept={["0.6", ".6", "0.60"]}
          placeholder="like 0.3"
          value={fade}
          setValue={setFade}
          hint="each strip is one tenth, and there are six of them."
          explain={
            <>
              Six tenths is <strong>0.6</strong>. It is also 60 hundredths, so 0.60 means the same
              amount — the extra zero adds nothing.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Reading a decimal</div>
          <div className="mt-2">1. The point marks where whole ones stop</div>
          <div className="mt-1">2. First place after it is tenths</div>
          <div className="mt-1">3. Next is hundredths, ten times smaller again</div>
        </div>
        <KeyIdea>
          💡 0.6 and 0.60 are the same amount. Adding a zero on the end of a decimal changes
          nothing — which is not true for whole numbers.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
