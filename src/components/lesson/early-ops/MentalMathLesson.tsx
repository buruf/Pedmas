"use client";

import { useState } from "react";
import { MathText } from "@/components/MathText";
import { Step, KeyIdea, FormulaBox, WrongBox } from "@/components/lesson/Step";
import { LessonShell, TryIt } from "@/components/lesson/LessonShell";
import { PrimaryButton } from "@/components/ui";

/**
 * Mental arithmetic — rounding to a friendly number and adjusting.
 *
 * The misconception is not a wrong answer, it is a wrong plan: people try to
 * run the WRITTEN column method inside their head. That method was designed for
 * paper, where the digits sit still and the carry can be written down. Held in
 * working memory it is fragile, and it is why so many adults believe they are
 * "bad at mental maths" when really they are just using the wrong tool.
 *
 * The strategy that replaces it works on whole numbers rather than digits:
 * 47 + 19 becomes 47 + 20 − 1. The compensating step is where the second
 * misconception lives — on subtraction the adjustment REVERSES (63 − 29 is
 * 63 − 30 + 1), and subtracting the 1 again is the single most common slip.
 */

/* ------------------------------------------------------------------ visuals */

/** A compact journey: start, one or two hops, finish. Beats a dense number line. */
function JumpTrack({
  stops,
}: {
  /** first entry is the start; each later entry carries the hop that reached it */
  stops: { v: number | string; via?: string; tone?: "up" | "down" | "end" }[];
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5">
      {stops.map((s, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {s.via && (
            <span className="flex flex-col items-center">
              <span
                className={`text-xs font-black ${
                  s.tone === "down" ? "text-err-600" : "text-warn-600"
                }`}
              >
                {s.via}
              </span>
              <span className="text-lg leading-none text-ink-300">→</span>
            </span>
          )}
          <span
            className={`rounded-xl px-3 py-2 text-lg font-black tabular-nums ${
              s.tone === "end" ? "bg-ok-100 text-ok-600" : "bg-paper text-ink-900"
            }`}
          >
            {s.v}
          </span>
        </span>
      ))}
    </div>
  );
}

/** One named strategy with the example that makes it obvious. */
function StrategyCard({
  name,
  when,
  example,
  working,
}: {
  name: string;
  when: string;
  example: string;
  working: string;
}) {
  return (
    <div className="rounded-2xl border-2 border-ink-100 bg-white px-3 py-3">
      <div className="text-xs font-bold uppercase tracking-wide text-brand-600">{name}</div>
      <div className="mt-0.5 text-xs text-ink-500">{when}</div>
      <div className="mt-2 text-base font-black tabular-nums text-ink-900">
        <MathText text={example} />
      </div>
      <div className="mt-1 text-sm font-semibold text-ink-700">
        <MathText text={working} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------- lesson */

export function MentalMathLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [subCheck, setSubCheck] = useState("");
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 2–4 · Whole Numbers · Mental Math"
      title="Round it, then pay it back"
      minutes={6}
      step={step}
      total={8}
    >
      {/* 1 */}
      <Step n={1} title="No pencil allowed" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">Work this out in your head. Nothing to write on.</p>
        <FormulaBox>47 + 19</FormulaBox>
        <p className="text-ink-700">
          Notice what your brain reaches for first. That instinct is the whole lesson.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(2)}>I have tried it</PrimaryButton>
        </div>
      </Step>

      {/* 2 */}
      <Step n={2} title="What most people reach for" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <p className="text-ink-700">
          Almost everyone builds the written sum in their head — the one from their exercise book.
        </p>
        <WrongBox>
          &ldquo;7 + 9 is 16 … write the 6, carry the 1 … 4 + 1 is 5, plus the carried 1 is 6 …
          so 66&rdquo;
        </WrongBox>
        <p className="text-ink-700">
          That is not a wrong <em>answer</em> — 66 is correct. It is a wrong <strong>tool</strong>.
        </p>
        <p className="mt-3 text-ink-700">
          The column method was invented for <strong>paper</strong>. The digits stay still, and you
          can write the carry down. In your head you have to hold four things at once, in order,
          while looking at nothing. One wobble and it is gone.
        </p>
        <KeyIdea>
          Mental arithmetic works on <strong>whole numbers</strong>, not on digits. Different job,
          different tool.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(3)}>Show me the other tool</PrimaryButton>
        </div>
      </Step>

      {/* 3 */}
      <Step n={3} title="19 is nearly 20" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">
          Adding 19 is awkward. Adding <strong>20</strong> is easy — you can almost hear it.
        </p>
        <div className="mt-3 rounded-2xl bg-paper px-4 py-3 text-center">
          <div className="text-lg font-bold text-ink-900">47 + 20 = 67</div>
          <div className="mt-1 text-xs font-semibold text-ink-500">no carrying, no holding on</div>
        </div>
        <p className="mt-4 text-ink-700">
          But you were asked for 19, not 20. You have added <strong>one too many</strong>. So give it
          back.
        </p>
        <div className="mt-4">
          <JumpTrack
            stops={[
              { v: 47 },
              { v: 67, via: "+20" },
              { v: 66, via: "−1", tone: "end" },
            ]}
          />
        </div>
        <p className="mt-4 text-center text-xl font-black text-ok-600">47 + 19 = 66</p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(4)}>Why is that allowed?</PrimaryButton>
        </div>
      </Step>

      {/* 4 */}
      <Step n={4} title="You already do this with money" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <p className="text-ink-700">
          Nobody counts out £19 in coins. You hand over a £20 note and take £1 change.
        </p>
        <div className="mt-3 space-y-2">
          {[
            ["Hand over a £20 note", "you have given £20"],
            ["Take £1 change", "so really you gave £19"],
            ["The shop is happy", "the total is the same"],
          ].map(([a, b], i) => (
            <div key={i} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-semibold text-ink-900">{a}</span>
              <span className="text-sm text-ink-700">{b}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-ink-700">
          Rounding and adjusting is the same trade. You overshoot on purpose, because the overshoot
          lands on a friendly number, and then you correct by exactly what you overshot.
        </p>
        <KeyIdea>
          <MathText text="47 + 19" /> and <MathText text="47 + 20 − 1" /> are the same amount. You
          have not changed the sum — only the route you took to it.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(5)}>What about taking away?</PrimaryButton>
        </div>
      </Step>

      {/* 5 */}
      <Step n={5} title="Taking away flips the payback" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">
          Now try <strong>63 − 29</strong>. Same idea: 29 is awkward, 30 is easy.
        </p>
        <div className="mt-3 rounded-2xl bg-paper px-4 py-3 text-center">
          <div className="text-lg font-bold text-ink-900">63 − 30 = 33</div>
        </div>
        <p className="mt-4 text-ink-700">
          Here is where nearly everyone slips. It feels like the next move is another take-away.
        </p>
        <WrongBox>63 − 30 − 1 = 32</WrongBox>
        <p className="text-ink-700">
          Think about what actually happened. You took away <strong>30</strong>. You were only meant
          to take away <strong>29</strong>. So you took <strong>one too much</strong> — and one too
          much has to come <em>back</em>.
        </p>
        <div className="mt-4">
          <JumpTrack
            stops={[
              { v: 63 },
              { v: 33, via: "−30", tone: "down" },
              { v: 34, via: "+1", tone: "end" },
            ]}
          />
        </div>
        <p className="mt-4 text-center text-xl font-black text-ok-600">63 − 29 = 34</p>
        <KeyIdea>
          Ask one question every time: <strong>&ldquo;did I go too far, or not far enough?&rdquo;</strong>{" "}
          Then move back by exactly that much. Adding rounds up and pays back down; taking away rounds
          up and pays back up.
        </KeyIdea>
        <TryIt
          prompt={<>Your go: 45 − 19. Take away 20 first, then fix it. What is the answer?</>}
          accept={["26"]}
          placeholder="the answer"
          value={subCheck}
          setValue={setSubCheck}
          hint="45 − 20 = 25. You took one too much, so it comes back."
          explain={
            <>
              45 − 20 = 25, then <strong>25 + 1 = 26</strong>. Taking the 1 away again would have
              given 24 — one short.
            </>
          }
          onCorrect={() => go(6)}
        />
      </Step>

      {/* 6 */}
      <Step n={6} title="Which numbers are friendly?" open={step === 6} onOpen={() => go(6)} done={step > 6}>
        <p className="text-ink-700">
          Round to whatever is <strong>closest and easiest</strong> — usually a ten or a hundred.
        </p>
        <div className="mt-3 space-y-2">
          {[
            ["+9", "add 10, pay back 1", "35 + 9 = 45 − 1 = 44"],
            ["+11", "add 10, then one more", "35 + 11 = 45 + 1 = 46"],
            ["−9", "take 10, give 1 back", "52 − 9 = 42 + 1 = 43"],
            ["+98", "add 100, pay back 2", "146 + 98 = 246 − 2 = 244"],
          ].map(([a, b, c], i) => (
            <div key={i} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="w-12 text-sm font-black text-brand-700">{a}</span>
              <span className="flex-1 text-xs text-ink-500">{b}</span>
              <span className="text-sm font-bold tabular-nums text-ink-900">{c}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-ink-700">
          Sometimes it is easier to move the friendly-making amount <em>between</em> the two numbers
          instead. 48 wants 2 to reach 50, so borrow the 2 from the 26:
        </p>
        <div className="mt-3">
          <JumpTrack stops={[{ v: "48 + 26" }, { v: "50 + 24", via: "move 2" }, { v: 74, via: "=", tone: "end" }]} />
        </div>
        <KeyIdea>
          Nothing was gained or lost — 2 simply moved from one number to the other. The total cannot
          change.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(7)}>What else is in the toolkit?</PrimaryButton>
        </div>
      </Step>

      {/* 7 */}
      <Step n={7} title="The rest of the toolkit" open={step === 7} onOpen={() => go(7)} done={step > 7}>
        <p className="text-ink-700">
          Rounding and adjusting is the workhorse. These four sit beside it.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <StrategyCard
            name="Make ten"
            when="crossing the ten"
            example="8 + 5"
            working="8 + 2 = 10, then 10 + 3 = 13"
          />
          <StrategyCard
            name="Doubles"
            when="the numbers are neighbours"
            example="7 + 8"
            working="7 + 7 = 14, then 14 + 1 = 15"
          />
          <StrategyCard
            name="Half of ten times"
            when="multiplying by 5"
            example="14 * 5"
            working="14 * 10 = 140, half is 70"
          />
          <StrategyCard
            name="Quarter of a hundred"
            when="multiplying by 25"
            example="12 * 25"
            working="12 * 100 = 1200, a quarter is 300"
          />
        </div>
        <p className="mt-4 text-ink-700">
          They all share one move: swap the awkward number for a friendly one, then repair the
          difference. Even <MathText text="8 * 50" /> is just <MathText text="8 * 100 = 800" />,
          halved to <strong>400</strong>.
        </p>
        <KeyIdea>
          Choose the strategy <em>before</em> you start calculating. Picking the route is the skill;
          the arithmetic that follows is meant to be easy.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(8)}>Your turn</PrimaryButton>
        </div>
      </Step>

      {/* 8 */}
      <Step n={8} title="You try one — I'll start it" open={step === 8} onOpen={() => go(8)} done={false}>
        <p className="text-ink-700">
          In your head: <strong>56 + 29</strong>.
        </p>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          29 is one short of <strong>30</strong>. So add 30 instead: <strong>56 + 30 = 86</strong>.
        </div>
        <div className="mt-2 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">2. </span>
          Ask the question: did you add too much, or too little?
        </div>
        <TryIt
          prompt={<>3. Fix the 86. What is 56 + 29?</>}
          accept={["85"]}
          placeholder="the answer"
          value={fade}
          setValue={setFade}
          hint="you added 30 when you only wanted 29, so you are one over."
          explain={
            <>
              56 + 30 = 86, then <strong>86 − 1 = 85</strong>. Two easy steps, no carrying and nothing
              to hold in your head.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">To calculate in your head</div>
          <div className="mt-2">1. Do not rebuild the column sum — work with whole numbers</div>
          <div className="mt-1">2. Round the awkward number to a friendly ten or hundred</div>
          <div className="mt-1">3. Do the easy calculation</div>
          <div className="mt-1">4. Ask &ldquo;too far or not far enough?&rdquo; and pay the difference back</div>
        </div>
        <KeyIdea>
          💡 When you add, an overshoot is paid back by subtracting. When you subtract, an overshoot
          is paid back by adding. Say what you overshot by out loud and the direction takes care of
          itself.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
