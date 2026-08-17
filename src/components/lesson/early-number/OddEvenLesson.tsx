"use client";

import { useState } from "react";
import { Step, KeyIdea, WrongBox } from "@/components/lesson/Step";
import { LessonShell, TryIt } from "@/components/lesson/LessonShell";
import { PrimaryButton } from "@/components/ui";

/**
 * Odd and even numbers (odd-even family, all bands).
 *
 * The lesson is built on partners rather than on the list 0, 2, 4, 6, 8,
 * because a memorised list cannot answer the question children actually get
 * stuck on: what is zero? "Zero is odd" and "zero is neither" both come from
 * reading even as *having* pairs instead of *having nothing left over*. Once
 * even is defined as "nobody is left alone", zero is the easiest case in the
 * whole topic. The ones-digit shortcut is then earned, not asserted: a ten is
 * five pairs, so tens never leave anyone over.
 */

/** People lined up in twos, with anyone left over shown on their own. */
function PairRows({
  n,
  icon = "🙂",
  caption,
}: {
  n: number;
  icon?: string;
  caption?: string;
}) {
  const pairs = Math.floor(n / 2);
  const leftover = n % 2;
  return (
    <figure className="m-0">
      <div className="flex flex-wrap items-start justify-center gap-2 rounded-2xl border-2 border-ink-100 bg-paper px-3 py-4">
        {n === 0 && (
          <div className="flex h-16 w-24 items-center justify-center rounded-xl border-2 border-dashed border-ink-300 text-xs font-bold text-ink-500">
            nobody here
          </div>
        )}
        {Array.from({ length: pairs }, (_, i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-0.5 rounded-xl border-2 border-brand-300 bg-brand-50 px-1.5 py-1"
          >
            <span className="text-xl leading-none">{icon}</span>
            <span className="text-xl leading-none">{icon}</span>
          </div>
        ))}
        {leftover === 1 && (
          <div className="flex flex-col items-center gap-0.5 rounded-xl border-2 border-dashed border-warn-600 bg-warn-100 px-1.5 py-1">
            <span className="text-xl leading-none">{icon}</span>
            <span className="text-[10px] font-bold leading-tight text-warn-600">alone</span>
          </div>
        )}
      </div>
      {caption && (
        <figcaption className="mt-2 text-center text-sm font-semibold text-ink-700">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

/** The ones digits that mean even, shown as a strip. */
function DigitStrip({ digits, tone }: { digits: number[]; tone: "even" | "odd" }) {
  return (
    <div className="flex flex-wrap justify-center gap-1.5">
      {digits.map((d) => (
        <span
          key={d}
          className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg font-bold ${
            tone === "even" ? "bg-ok-100 text-ok-600" : "bg-warn-100 text-warn-600"
          }`}
        >
          {d}
        </span>
      ))}
    </div>
  );
}

export function OddEvenLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [guess, setGuess] = useState<string | null>(null);
  const [zero, setZero] = useState<string | null>(null);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 2 · Number · Odd and even"
      title="Odd, even, and zero"
      minutes={6}
      step={step}
      total={7}
    >
      <Step n={1} title="Lining up in twos" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          <strong>8</strong> children line up in twos for a trip.
        </p>
        <p className="mt-3 text-ink-700">Is anybody left on their own?</p>
        <div className="mt-4 grid gap-2">
          {["Yes, one is left", "No, everyone has a partner"].map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => setGuess(o)}
              className={`btn rounded-xl border-2 px-4 py-3 text-left text-base font-bold ${
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
            Let&rsquo;s line them up.
            <div className="mt-3">
              <PrimaryButton onClick={() => go(2)}>Show me</PrimaryButton>
            </div>
          </div>
        )}
      </Step>

      <Step n={2} title="Two names for two answers" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <div className="mt-1">
          <PairRows n={8} caption="8 — everyone has a partner" />
        </div>
        <p className="mt-3 text-center text-lg font-bold text-ok-600">8 is EVEN</p>
        <div className="mt-5">
          <PairRows n={7} caption="7 — one is left alone" />
        </div>
        <p className="mt-3 text-center text-lg font-bold text-warn-600">7 is ODD</p>
        <KeyIdea>
          <strong>Even</strong> means nobody is left over. <strong>Odd</strong> means one is left
          over.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(3)}>What about big numbers?</PrimaryButton>
        </div>
      </Step>

      <Step n={3} title="You cannot line up 346 children" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">So here is the shortcut. Only look at the last digit.</p>
        <div className="mt-4 text-center text-sm font-bold text-ink-700">these mean EVEN</div>
        <div className="mt-2">
          <DigitStrip digits={[0, 2, 4, 6, 8]} tone="even" />
        </div>
        <div className="mt-4 text-center text-sm font-bold text-ink-700">these mean ODD</div>
        <div className="mt-2">
          <DigitStrip digits={[1, 3, 5, 7, 9]} tone="odd" />
        </div>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(4)}>Why only the last digit?</PrimaryButton>
        </div>
      </Step>

      <Step n={4} title="Why the last digit is enough" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <p className="text-ink-700">A ten is 10 children. They make 5 pairs exactly.</p>
        <div className="mt-3">
          <PairRows n={10} caption="one ten = 5 pairs, nobody left" />
        </div>
        <p className="mt-4 text-ink-700">
          So <strong>every ten always pairs up perfectly</strong>. Tens can never leave anyone over.
          Hundreds cannot either.
        </p>
        <p className="mt-3 text-ink-700">Only the loose ones can leave somebody alone.</p>
        <div className="mt-3 rounded-xl bg-paper px-3 py-3 text-center font-bold text-ink-900">
          34 = <span className="text-ink-500">3 tens (all paired)</span> +{" "}
          <span className="text-brand-600">4 ones</span>
        </div>
        <div className="mt-3">
          <PairRows n={4} caption="4 ones — nobody left, so 34 is even" />
        </div>
        <KeyIdea>
          That is the whole reason. The tens look after themselves, so the{" "}
          <strong>ones digit</strong> decides.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(5)}>Now the tricky one</PrimaryButton>
        </div>
      </Step>

      <Step n={5} title="Is zero odd or even?" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">Nobody turned up for the trip. Zero children.</p>
        <div className="mt-3 grid gap-2">
          {["Odd", "Even", "Neither — zero is nothing"].map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => setZero(o)}
              className={`btn rounded-xl border-2 px-4 py-3 text-left text-base font-bold ${
                zero === o
                  ? "border-brand-600 bg-brand-50 text-brand-800"
                  : "border-ink-100 bg-white"
              }`}
            >
              {o}
            </button>
          ))}
        </div>
        {zero && (
          <div className="mt-4 pop-in">
            <WrongBox>0 is odd, or 0 is neither</WrongBox>
            <p className="text-ink-700">
              Lots of people say this. It feels strange to call nothing &ldquo;even&rdquo;.
            </p>
            <p className="mt-3 text-ink-700">
              But look again at what even means. Even is <strong>nobody left over</strong>. It does
              not say you need any pairs.
            </p>
            <div className="mt-3">
              <PairRows n={0} caption="0 — nobody is left alone" />
            </div>
            <p className="mt-3 text-center text-xl font-bold text-ok-600">0 is EVEN</p>
            <p className="mt-3 text-ink-700">
              And it fits the shortcut too. 0 is the first digit in the even list. That is why 10,
              20 and 100 are all even.
            </p>
            <div className="mt-4">
              <PrimaryButton onClick={() => go(6)}>Do one together</PrimaryButton>
            </div>
          </div>
        )}
      </Step>

      <Step n={6} title="Try it on a big number" open={step === 6} onOpen={() => go(6)} done={step > 6}>
        <p className="text-ink-700">
          Is <strong>46</strong> odd or even?
        </p>
        <div className="mt-4 rounded-2xl bg-paper p-4">
          <ol className="space-y-2">
            {[
              ["Ignore the tens", "4 tens all pair up"],
              ["Look at the ones digit", "6"],
              ["Is 6 in the even list?", "0, 2, 4, 6, 8 — yes"],
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
        <div className="mt-4">
          <PairRows n={6} caption="the 6 ones make 3 pairs, nobody left" />
        </div>
        <p className="mt-3 text-center text-xl font-bold text-ok-600">46 is EVEN</p>
        <p className="mt-3 text-ink-700">
          And <strong>235</strong>? The ones digit is 5. 5 is in the odd list, so 235 is odd.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(7)}>Your turn</PrimaryButton>
        </div>
      </Step>

      <Step n={7} title="You try one" open={step === 7} onOpen={() => go(7)} done={false}>
        <p className="text-ink-700">
          <strong>30</strong> people at a dance all pair up.
        </p>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          30 is 3 tens. Every ten makes 5 pairs.
        </div>
        <TryIt
          prompt={<>2. How many people are left without a partner?</>}
          accept={["0"]}
          placeholder="how many left"
          value={fade}
          setValue={setFade}
          hint="the ones digit is 0. Are there any loose ones at all?"
          explain={
            <>
              <strong>0</strong> people are left. Nobody is alone, so 30 is even &mdash; and that is
              exactly why the number 0 itself is even too.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Odd or even</div>
          <div className="mt-2">1. Even means nobody is left over</div>
          <div className="mt-1">2. Only the ones digit decides</div>
          <div className="mt-1">3. 0, 2, 4, 6, 8 are even — and that includes 0</div>
        </div>
        <KeyIdea>
          💡 Zero is even. Nothing is left over, and nothing is exactly what even asks for.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
