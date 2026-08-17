"use client";

import { useState } from "react";
import { MathText } from "@/components/MathText";
import { Step, KeyIdea, WrongBox } from "@/components/lesson/Step";
import { LessonShell, TryIt } from "@/components/lesson/LessonShell";
import { PrimaryButton } from "@/components/ui";

/**
 * A pair of scales.
 *
 * Equations are a balance long before they are a procedure: the equals sign
 * says the two pans weigh the same, and every legal move is one that keeps
 * them level. Tilting the beam is the only honest way to show what happens
 * when a child changes one side and not the other.
 */
function Balance({
  left,
  right,
  tilt = 0,
  caption,
}: {
  left: string;
  right: string;
  /** degrees; negative dips the left pan */
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
 * One-step equations.
 *
 * The misconception is doing something to one side only — which is not
 * carelessness but a reasonable belief that you are "getting x on its own".
 * The scales make the cost of it visible: the pans tip, and the check fails.
 */
export function OneStepEquationLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 6 · Algebra · One-step Equations"
      title="Keeping the scales level"
      minutes={6}
      step={step}
      total={6}
    >
      <Step n={1} title="A bag on the scales" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          On the left pan: a sealed bag plus 5 marbles. On the right: 12 marbles. The scales are
          level, so the two sides weigh the same.
        </p>
        <div className="mt-4">
          <Balance left="x + 5" right="12" caption="x + 5 = 12" />
        </div>
        <p className="mt-3 text-ink-700">
          That is all an equation is. The <MathText text="=" /> sign is not an instruction to work
          something out — it is a claim that both sides are the same weight.
        </p>
        <p className="mt-3 text-ink-700">How many marbles are in the bag?</p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(2)}>Find out</PrimaryButton>
        </div>
      </Step>

      <Step n={2} title="The mistake almost everyone makes" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <p className="text-ink-700">
          You want the bag on its own, so you take the 5 marbles off the left pan. Reasonable — and
          this is where lots of people stop.
        </p>
        <WrongBox>
          <MathText text="x + 5 = 12" /> &nbsp;→&nbsp; <MathText text="x = 12" />
        </WrongBox>
        <div className="mt-3">
          <Balance left="x" right="12" tilt={7} caption="the left pan is 5 marbles lighter now" />
        </div>
        <p className="mt-3 text-ink-700">
          Watch the beam. Removing 5 from one side made that side lighter, so the scales tipped —
          and once they tip, the two sides are no longer equal, so nothing they say is true any more.
        </p>
        <p className="mt-3 text-ink-700">
          Check the answer it gave: if the bag held 12, the left pan would weigh{" "}
          <MathText text="12 + 5 = 17" />, not 12. <span className="font-bold text-err-600">✗</span>
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(3)}>How do I keep it level?</PrimaryButton>
        </div>
      </Step>

      <Step n={3} title="Take the same off both pans" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">
          Remove 5 marbles from the left <em>and</em> 5 from the right. Both sides get lighter by the
          same amount, so the beam never moves.
        </p>
        <div className="mt-4">
          <Balance left="x" right="7" caption="x = 7" />
        </div>
        <Work
          rows={[
            ["Start", "x + 5 = 12"],
            ["Subtract 5 from both sides", "x = 12 − 5"],
            ["Answer", "x = 7"],
          ]}
        />
        <p className="mt-3 text-ink-700">
          Check it: <MathText text="7 + 5 = 12" />. ✓ Seven marbles in the bag.
        </p>
        <KeyIdea>
          Whatever you do to one side, you must do to the other. That single rule is the whole of
          equation solving — everything else is choosing <em>what</em> to do.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(4)}>Choosing what to do</PrimaryButton>
        </div>
      </Step>

      <Step n={4} title="Undo with the opposite" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <p className="text-ink-700">
          Look at what is being done to x, then do the opposite — to both sides.
        </p>
        <div className="mt-3 space-y-2">
          {[
            ["x is being added to", "subtract", "x + 5 = 12 → x = 7"],
            ["x is being subtracted from", "add", "x − 8 = 5 → x = 13"],
            ["x is being multiplied", "divide", "4x = 20 → x = 5"],
            ["x is being divided", "multiply", "{x/3} = 6 → x = 18"],
          ].map(([a, b, c]) => (
            <div key={a} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-semibold text-ink-900">{a}</span>
              <span className="text-sm text-brand-700">{b}</span>
              <span className="text-sm text-ink-500">
                <MathText text={c} />
              </span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-ink-700">
          Take <MathText text="4x = 20" />. Four identical bags weigh 20, so one bag weighs a quarter
          of that — dividing <strong>both</strong> pans by 4 keeps it level.
        </p>
        <div className="mt-3">
          <Balance left="4x" right="20" caption="divide both pans by 4 → x = 5" />
        </div>
        <p className="mt-3 text-ink-700">
          Check: <MathText text="4 * 5 = 20" />. ✓
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(5)}>From a story</PrimaryButton>
        </div>
      </Step>

      <Step n={5} title="Writing the equation yourself" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">
          <strong>Maya gave away 9 stickers and has 14 left. How many did she start with?</strong>
        </p>
        <p className="mt-3 text-ink-700">
          The unknown is what she started with, so call it <MathText text="x" />. Giving 9 away is
          subtracting 9, and the result is 14.
        </p>
        <Work
          rows={[
            ["Write the story as an equation", "x − 9 = 14"],
            ["9 was taken away, so add 9 to both sides", "x = 14 + 9"],
            ["Answer", "x = 23"],
          ]}
        />
        <p className="mt-3 text-ink-700">
          Check against the story: 23 stickers, give away 9, and 14 are left. ✓
        </p>
        <KeyIdea>
          Name the unknown first, then write what the story <em>did</em> to it. Solving comes last
          and is the easy part.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(6)}>Your turn</PrimaryButton>
        </div>
      </Step>

      <Step n={6} title="You try one" open={step === 6} onOpen={() => go(6)} done={false}>
        <p className="text-ink-700">
          Solve <MathText text="x − 6 = 9" />.
        </p>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>6 is being taken away from x, so add 6
          — to <strong>both</strong> sides.
        </div>
        <TryIt
          prompt={<>2. What is x?</>}
          accept={["15"]}
          placeholder="the answer"
          value={fade}
          setValue={setFade}
          hint="the right side becomes 9 + 6."
          explain={
            <>
              <strong>x = 15</strong>. Check by putting it back: <MathText text="15 − 6 = 9" />. ✓
              Adding 6 to only the left would have left x = 9, and 9 − 6 is 3, not 9.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Solving a one-step equation</div>
          <div className="mt-2">1. Ask what is being done to x</div>
          <div className="mt-1">2. Do the opposite</div>
          <div className="mt-1">3. Do it to BOTH sides</div>
          <div className="mt-1">4. Put your answer back in to check</div>
        </div>
        <KeyIdea>
          💡 The equals sign means the pans are level. Any move that touches one side only is a move
          that breaks the equation.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}

/**
 * Two-step equations.
 *
 * Here the misconception is order: dividing before the constant has been dealt
 * with, and — crucially — dividing only the term that has the coefficient. The
 * shoes-and-socks image gives a reason to reverse the order rather than a rule
 * to remember.
 */
export function TwoStepEquationLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 7 · Algebra · Two-step Equations"
      title="Undoing in the right order"
      minutes={6}
      step={step}
      total={6}
    >
      <Step n={1} title="The taxi fare" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          A taxi charges <strong>$3</strong> the moment you get in, then <strong>$2</strong> for
          every kilometre. Your ride cost <strong>$17</strong>. How far did you go?
        </p>
        <p className="mt-3 text-ink-700">
          Call the distance <MathText text="x" />. The metre charges <MathText text="2x" /> for the
          distance, and the $3 is added once:
        </p>
        <div className="my-4">
          <Balance left="2x + 3" right="17" caption="2x + 3 = 17" />
        </div>
        <p className="text-ink-700">
          Two things have been done to x this time — multiplied by 2, then 3 added. So undoing takes
          two steps, and the order matters more than you would expect.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(2)}>Try it</PrimaryButton>
        </div>
      </Step>

      <Step n={2} title="The mistake almost everyone makes" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <p className="text-ink-700">
          The 2 is stuck to the x, so it looks like the thing to deal with first — divide by 2 and be
          done with it.
        </p>
        <WrongBox>
          <MathText text="2x + 3 = 17" /> &nbsp;→&nbsp; <MathText text="x + 3 = 8.5" /> &nbsp;→&nbsp;{" "}
          <MathText text="x = 5.5" />
        </WrongBox>
        <p className="text-ink-700">
          Put <MathText text="5.5" /> back into the original and see whether the pans balance:
        </p>
        <div className="mt-3 rounded-xl border-2 border-err-600/40 bg-err-100/50 px-4 py-3 text-center">
          <div className="text-lg font-bold text-ink-900">
            <MathText text="2(5.5) + 3 = 11 + 3 = 14" />
          </div>
          <div className="mt-1 text-sm text-ink-700">
            The ride cost $17, not $14. <span className="font-bold text-err-600">✗</span>
          </div>
        </div>
        <p className="mt-4 text-ink-700">
          Here is what went wrong: dividing the left side by 2 means dividing{" "}
          <strong>all of it</strong> — the 3 as well, not just the <MathText text="2x" />. Half the
          side got divided and half did not, so the sides stopped matching.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(3)}>What is the right order?</PrimaryButton>
        </div>
      </Step>

      <Step n={3} title="Shoes and socks" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">
          In the morning you put socks on first, then shoes. At night you cannot take the socks off
          first — you take the <strong>shoes</strong> off first. Undoing runs backwards.
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <div className="rounded-xl bg-paper px-4 py-3">
            <div className="text-xs font-bold uppercase tracking-wide text-ink-500">Building 2x + 3</div>
            <div className="mt-1 text-sm text-ink-700">start with x</div>
            <div className="text-sm text-ink-700">→ multiply by 2</div>
            <div className="text-sm text-ink-700">→ add 3</div>
          </div>
          <div className="rounded-xl bg-brand-50 px-4 py-3">
            <div className="text-xs font-bold uppercase tracking-wide text-brand-700">Undoing it</div>
            <div className="mt-1 text-sm text-ink-700">start with 17</div>
            <div className="text-sm text-ink-700">→ subtract 3</div>
            <div className="text-sm text-ink-700">→ divide by 2</div>
          </div>
        </div>
        <Work
          rows={[
            ["Start", "2x + 3 = 17"],
            ["Subtract 3 from both sides", "2x = 14"],
            ["Divide both sides by 2", "x = 7"],
          ]}
        />
        <p className="mt-3 text-ink-700">
          Check: <MathText text="2(7) + 3 = 17" />. ✓ The ride was <strong>7 km</strong>.
        </p>
        <KeyIdea>
          Peel the outside layer off first. The number joined to x by <em>adding</em> is the outer
          layer; the number joined by <em>multiplying</em> is underneath it.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(4)}>Another</PrimaryButton>
        </div>
      </Step>

      <Step n={4} title="A worked example" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <p className="text-ink-700">
          Solve <MathText text="5x − 4 = 26" />.
        </p>
        <Work
          rows={[
            ["The outer layer is the − 4, so add 4 to both sides", "5x = 30"],
            ["Now undo the × 5: divide both sides by 5", "x = 6"],
          ]}
        />
        <p className="mt-3 text-ink-700">
          Check: <MathText text="5(6) − 4 = 30 − 4 = 26" />. ✓
        </p>
        <p className="mt-4 text-ink-700">
          Notice the first move <em>added</em> because the equation subtracted, and the second{" "}
          <em>divided</em> because the equation multiplied. Opposites, in reverse order.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(5)}>What if x is divided?</PrimaryButton>
        </div>
      </Step>

      <Step n={5} title="When x is divided instead" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">
          Solve <MathText text="{x/4} + 2 = 9" />. Same two layers: x was divided by 4, then 2 was
          added.
        </p>
        <Work
          rows={[
            ["Outer layer first: subtract 2 from both sides", "{x/4} = 7"],
            ["Undo the ÷ 4: multiply both sides by 4", "x = 28"],
          ]}
        />
        <p className="mt-3 text-ink-700">
          Check: <MathText text="28 ÷ 4 = 7" />, and <MathText text="7 + 2 = 9" />. ✓
        </p>
        <KeyIdea>
          The order never changes: deal with <MathText text="+" /> and <MathText text="−" /> first,
          then <MathText text="*" /> and <MathText text="÷" />. It is the order of operations run
          backwards.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(6)}>Your turn</PrimaryButton>
        </div>
      </Step>

      <Step n={6} title="You try one" open={step === 6} onOpen={() => go(6)} done={false}>
        <p className="text-ink-700">
          Solve <MathText text="8x − 5 = 51" />.
        </p>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          Outer layer first — add 5 to both sides: <MathText text="8x = 56" />.
        </div>
        <TryIt
          prompt={<>2. Now undo the × 8. What is x?</>}
          accept={["7"]}
          placeholder="the answer"
          value={fade}
          setValue={setFade}
          hint="8 times what makes 56?"
          explain={
            <>
              <strong>x = 7</strong>. Check: <MathText text="8(7) − 5 = 56 − 5 = 51" />. ✓ Dividing by
              8 first would have meant dividing the 5 as well — much messier, and easy to forget.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Solving a two-step equation</div>
          <div className="mt-2">1. Undo the + or − first</div>
          <div className="mt-1">2. Then undo the × or ÷</div>
          <div className="mt-1">3. Every move happens on BOTH sides</div>
          <div className="mt-1">4. Substitute your answer back to check</div>
        </div>
        <KeyIdea>
          💡 Whatever you do, you do to the <em>whole</em> side — not to one term of it. That is what
          keeps the scales level.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
