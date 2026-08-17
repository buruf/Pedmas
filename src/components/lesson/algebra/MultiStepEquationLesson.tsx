"use client";

import { useState } from "react";
import { MathText } from "@/components/MathText";
import { Step, KeyIdea, WrongBox } from "@/components/lesson/Step";
import { LessonShell, TryIt } from "@/components/lesson/LessonShell";
import { PrimaryButton } from "@/components/ui";

/**
 * A pair of scales, used here for the move that defines this lesson: taking
 * the same number of x-bags off both pans. Drawn locally so this lesson owns
 * its own picture.
 */
function Balance({
  left,
  right,
  tilt = 0,
  caption,
}: {
  left: string;
  right: string;
  tilt?: number;
  caption?: string;
}) {
  return (
    <figure className="m-0">
      <svg
        viewBox="0 0 300 140"
        width="100%"
        style={{ maxWidth: 300 }}
        role="img"
        aria-label={caption ?? `${left} weighed against ${right}`}
      >
        <g transform={`rotate(${tilt} 150 46)`}>
          <line x1="26" y1="46" x2="274" y2="46" stroke="#475569" strokeWidth="5" strokeLinecap="round" />
          <rect x="26" y="12" width="104" height="30" rx="8" fill="#ede9fe" stroke="#7c3aed" strokeWidth="2" />
          <text x="78" y="33" fontSize="17" fontWeight="700" fill="#0f172a" textAnchor="middle">
            {left}
          </text>
          <rect x="170" y="12" width="104" height="30" rx="8" fill="#ccfbf1" stroke="#0d9488" strokeWidth="2" />
          <text x="222" y="33" fontSize="17" fontWeight="700" fill="#0f172a" textAnchor="middle">
            {right}
          </text>
        </g>
        <polygon points="150,48 178,112 122,112" fill="#94a3b8" />
        <rect x="104" y="112" width="92" height="10" rx="5" fill="#64748b" />
      </svg>
      {caption && (
        <figcaption className="mt-1 text-center text-sm font-semibold text-ink-700">
          <MathText text={caption} />
        </figcaption>
      )}
    </figure>
  );
}

/** Numbered working, one line per move. */
function Work({ rows }: { rows: [string, string][] }) {
  return (
    <div className="mt-4 rounded-2xl bg-paper p-4">
      <ol className="space-y-2">
        {rows.map(([a, b], i) => (
          <li key={i} className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 text-sm">
            <span className="text-ink-700">
              <span className="mr-2 font-bold text-brand-600">{i + 1}.</span>
              <MathText text={a} />
            </span>
            <span className="font-bold text-ink-900">
              <MathText text={b} />
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/**
 * Multi-step equations, including variables on both sides.
 *
 * The error that decides whether a child can do these is the sign: a term is
 * "moved across" and arrives with the sign it had. The cure is to stop calling
 * it moving. Nothing crosses the equals sign — you subtract the same thing
 * from both sides, and the sign change falls out of the subtraction.
 */
export function MultiStepEquationLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 8 · Algebra · Multi-step Equations"
      title="When x is on both sides"
      minutes={7}
      step={step}
      total={6}
    >
      <Step n={1} title="Two phone plans" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          <strong>Plan A</strong> costs $5 a month plus $3 per gigabyte.{" "}
          <strong>Plan B</strong> costs $11 a month plus $1 per gigabyte. At how many gigabytes do
          they cost exactly the same?
        </p>
        <p className="mt-3 text-ink-700">
          Call the gigabytes <MathText text="x" /> and set the two costs equal:
        </p>
        <div className="my-4">
          <Balance left="3x + 5" right="x + 11" caption="3x + 5 = x + 11" />
        </div>
        <p className="text-ink-700">
          This one is new: there are <MathText text="x" /> bags on <em>both</em> pans. Everything you
          already know still applies — you just need one extra move.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(2)}>The move everyone gets wrong</PrimaryButton>
        </div>
      </Step>

      <Step n={2} title="The mistake almost everyone makes" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <p className="text-ink-700">
          People are taught that a term &ldquo;moves across the equals sign&rdquo;. Move it while
          keeping its sign and you get this. Try it on a tiny equation you can check in your head:
        </p>
        <WrongBox>
          <MathText text="2x = x + 6" /> &nbsp;→&nbsp; <MathText text="2x + x = 6" /> &nbsp;→&nbsp;{" "}
          <MathText text="3x = 6" /> &nbsp;→&nbsp; <MathText text="x = 2" />
        </WrongBox>
        <div className="mt-3 space-y-2">
          <div className="rounded-xl border-2 border-err-600/40 bg-err-100/50 px-4 py-3">
            <div className="text-sm font-semibold text-ink-700">Test x = 2 in the original:</div>
            <div className="mt-1 text-lg font-bold text-ink-900">
              left <MathText text="2(2) = 4" />, right <MathText text="2 + 6 = 8" />{" "}
              <span className="text-err-600">✗</span>
            </div>
            <div className="mt-1 text-sm text-ink-700">Not level. The scales tipped somewhere.</div>
          </div>
          <div className="rounded-xl border border-ok-600/30 bg-ok-100 px-4 py-3">
            <div className="text-sm font-semibold text-ink-700">The answer that does work is x = 6:</div>
            <div className="mt-1 text-lg font-bold text-ink-900">
              left <MathText text="2(6) = 12" />, right <MathText text="6 + 6 = 12" />{" "}
              <span className="text-ok-600">✓</span>
            </div>
          </div>
        </div>
        <p className="mt-4 text-ink-700">
          The <MathText text="x" /> was <em>added</em> on the right, so writing it as{" "}
          <MathText text="+ x" /> on the left added it a second time instead of removing it. One pan
          gained; the other lost nothing.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(3)}>So what really happens?</PrimaryButton>
        </div>
      </Step>

      <Step n={3} title="Nothing crosses — you take it off both sides" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">
          There is no such thing as moving a term across. There is only one legal move, the same one
          as always: <strong>do the same thing to both sides</strong>. To clear the{" "}
          <MathText text="x" /> from the right pan, take one <MathText text="x" /> bag off{" "}
          <em>each</em> pan.
        </p>
        <div className="mt-4">
          <Balance left="x" right="6" caption="2x − x = x + 6 − x, so x = 6" />
        </div>
        <p className="mt-3 text-ink-700">
          The sign flip you were told to memorise is just what subtraction does. Now the real one:
        </p>
        <Work
          rows={[
            ["Start", "5x − 3 = 2x + 9"],
            ["Subtract 2x from both sides", "3x − 3 = 9"],
            ["Add 3 to both sides", "3x = 12"],
            ["Divide both sides by 3", "x = 4"],
          ]}
        />
        <p className="mt-3 text-ink-700">
          Check: left <MathText text="5(4) − 3 = 17" />, right <MathText text="2(4) + 9 = 17" />. ✓
        </p>
        <p className="mt-4 text-ink-700">
          And the phone plans: <MathText text="3x + 5 = x + 11" />. Subtract{" "}
          <MathText text="x" /> from both sides to get <MathText text="2x + 5 = 11" />, then{" "}
          <MathText text="2x = 6" />, so <MathText text="x = 3" />. At <strong>3 GB</strong> both
          plans cost $14.
        </p>
        <KeyIdea>
          Choose to subtract the <em>smaller</em> x term. Taking <MathText text="x" /> off both sides
          rather than <MathText text="3x" /> leaves you with a positive coefficient, which is far
          easier to finish.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(4)}>With a bracket</PrimaryButton>
        </div>
      </Step>

      <Step n={4} title="Expand first, then gather" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <p className="text-ink-700">
          Solve <MathText text="3(x + 4) = 5x − 2" />. A bracket has to go before anything can be
          collected, so expand it first.
        </p>
        <Work
          rows={[
            ["Expand the bracket", "3x + 12 = 5x − 2"],
            ["Subtract 3x from both sides", "12 = 2x − 2"],
            ["Add 2 to both sides", "14 = 2x"],
            ["Divide both sides by 2", "7 = x"],
          ]}
        />
        <p className="mt-3 text-ink-700">
          Check: left <MathText text="3(7 + 4) = 3(11) = 33" />, right{" "}
          <MathText text="5(7) − 2 = 33" />. ✓
        </p>
        <p className="mt-4 text-ink-700">
          Ending with <MathText text="7 = x" /> instead of <MathText text="x = 7" /> is fine — the
          equals sign does not care which way round it is read.
        </p>
        <KeyIdea>
          Order of business: expand brackets, combine like terms on each side, gather the x terms on
          one side, then finish it like a two-step equation.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(5)}>When x has a minus</PrimaryButton>
        </div>
      </Step>

      <Step n={5} title="A negative x term" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">
          Solve <MathText text="4 − 2x = 10" />. The usual slip here is to lose the minus and treat
          the term as <MathText text="2x" />:
        </p>
        <WrongBox>
          <MathText text="4 − 2x = 10" /> &nbsp;→&nbsp; <MathText text="2x = 10 − 4 = 6" />{" "}
          &nbsp;→&nbsp; <MathText text="x = 3" />
        </WrongBox>
        <p className="text-ink-700">
          Test <MathText text="x = 3" />: <MathText text="4 − 2(3) = 4 − 6 = −2" />, not 10.{" "}
          <span className="font-bold text-err-600">✗</span>
        </p>
        <p className="mt-4 text-ink-700">
          Keep the sign attached to the term and take it one honest step at a time:
        </p>
        <Work
          rows={[
            ["Start", "4 − 2x = 10"],
            ["Subtract 4 from both sides", "−2x = 6"],
            ["Divide both sides by −2", "x = −3"],
          ]}
        />
        <p className="mt-3 text-ink-700">
          Check: <MathText text="4 − 2(−3) = 4 + 6 = 10" />. ✓ Subtracting a negative added to it.
        </p>
        <KeyIdea>
          The coefficient is <MathText text="−2" />, not 2. The minus sign is part of the term, and
          dividing by a negative is what makes the answer negative.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(6)}>Your turn</PrimaryButton>
        </div>
      </Step>

      <Step n={6} title="You try one" open={step === 6} onOpen={() => go(6)} done={false}>
        <p className="text-ink-700">
          Solve <MathText text="7x + 2 = 3x + 26" />.
        </p>
        <div className="mt-3 space-y-2">
          <div className="rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
            <span className="font-bold text-brand-600">1. </span>
            Subtract the smaller x term, <MathText text="3x" />, from both sides:{" "}
            <MathText text="4x + 2 = 26" />.
          </div>
          <div className="rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
            <span className="font-bold text-brand-600">2. </span>
            Subtract 2 from both sides: <MathText text="4x = 24" />.
          </div>
        </div>
        <TryIt
          prompt={<>3. Now divide both sides by 4. What is x?</>}
          accept={["6"]}
          placeholder="the answer"
          value={fade}
          setValue={setFade}
          hint="4 times what makes 24?"
          explain={
            <>
              <strong>x = 6</strong>. Check: left <MathText text="7(6) + 2 = 44" />, right{" "}
              <MathText text="3(6) + 26 = 44" />. ✓ Adding the <MathText text="3x" /> to the left
              instead would have given <MathText text="10x" /> and a wrong answer.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Multi-step equations</div>
          <div className="mt-2">1. Expand any brackets</div>
          <div className="mt-1">2. Combine like terms on each side</div>
          <div className="mt-1">3. Subtract the smaller x term from BOTH sides</div>
          <div className="mt-1">4. Finish as a two-step equation, then check</div>
        </div>
        <KeyIdea>
          💡 Nothing ever &ldquo;moves across&rdquo;. You subtract the same thing from both sides,
          and the sign takes care of itself — which is why the check always works.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
