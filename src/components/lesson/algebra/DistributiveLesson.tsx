"use client";

import { useState } from "react";
import { MathText } from "@/components/MathText";
import { Step, KeyIdea, WrongBox } from "@/components/lesson/Step";
import { LessonShell, TryIt } from "@/components/lesson/LessonShell";
import { PrimaryButton } from "@/components/ui";

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
 * The outside factor with an arrow reaching each term inside.
 *
 * The whole misconception is that the multiplier only reaches the first term,
 * so the picture has to show two arrows of equal weight — one arriving at each
 * term. Arrowheads are drawn as plain polygons rather than SVG markers so two
 * of these can sit on the same page without sharing an id.
 */
function DistributeArcs({
  outer,
  first,
  op,
  second,
}: {
  outer: string;
  first: string;
  op: string;
  second: string;
}) {
  const START_X = 34;
  const A1 = 74; // lands on the first term
  const A2 = 146; // lands on the second term
  return (
    <svg
      viewBox="0 0 230 96"
      width="100%"
      style={{ maxWidth: 230 }}
      role="img"
      aria-label={`${outer} multiplies both ${first} and ${second}`}
    >
      <text x="20" y="82" fontSize="27" fontWeight="800" fill="#0f172a" textAnchor="middle">
        {outer}
      </text>
      <text x="48" y="82" fontSize="27" fill="#94a3b8" textAnchor="middle">
        (
      </text>
      <text x={A1} y="82" fontSize="27" fontWeight="800" fill="#7c3aed" textAnchor="middle">
        {first}
      </text>
      <text x="110" y="82" fontSize="27" fill="#64748b" textAnchor="middle">
        {op}
      </text>
      <text x={A2} y="82" fontSize="27" fontWeight="800" fill="#0d9488" textAnchor="middle">
        {second}
      </text>
      <text x="184" y="82" fontSize="27" fill="#94a3b8" textAnchor="middle">
        )
      </text>

      <path
        d={`M ${START_X} 56 Q ${(START_X + A1) / 2} 24 ${A1} 56`}
        fill="none"
        stroke="#7c3aed"
        strokeWidth="2.4"
      />
      <polygon points={`${A1},62 ${A1 - 4.5},51 ${A1 + 4.5},51`} fill="#7c3aed" />
      <path
        d={`M ${START_X} 56 Q ${(START_X + A2) / 2} 2 ${A2} 56`}
        fill="none"
        stroke="#0d9488"
        strokeWidth="2.4"
      />
      <polygon points={`${A2},62 ${A2 - 4.5},51 ${A2 + 4.5},51`} fill="#0d9488" />
    </svg>
  );
}

/**
 * The distributive property.
 *
 * The error is universal: 3(x + 2) written as 3x + 2. It survives because the
 * answer looks finished. Substituting one value settles it in a line, and the
 * "bags" reading explains why the second term was never optional.
 */
export function DistributiveLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 7 · Algebra · The Distributive Property"
      title="Multiplying into a bracket"
      minutes={6}
      step={step}
      total={6}
    >
      <Step n={1} title="Four identical orders" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          Four friends each order a burger and a <strong>$3</strong> drink. Nobody can remember what
          the burger costs, so call it <MathText text="x" />.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border-2 border-dashed border-ink-300 bg-paper px-3 py-2 text-center">
              <div className="text-sm font-bold text-brand-700">
                <MathText text="x" />
              </div>
              <div className="text-xs text-ink-500">+ 3</div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-ink-700">
          You can total it two ways. Four identical orders: <MathText text="4(x + 3)" />. Or count
          the burgers and the drinks separately: <MathText text="4x + 12" />.
        </p>
        <KeyIdea>
          Same food, same bill — so those two expressions must be worth exactly the same for every
          value of x. That equality is the distributive property.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(2)}>The usual slip</PrimaryButton>
        </div>
      </Step>

      <Step n={2} title="The mistake almost everyone makes" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <WrongBox>
          <MathText text="3(x + 2) = 3x + 2" />
        </WrongBox>
        <p className="text-ink-700">
          The 3 is right next to the x, so the x gets multiplied and the 2 quietly gets left alone.
          The answer even looks tidy. Test it with <MathText text="x = 5" />:
        </p>
        <div className="mt-4 space-y-2">
          <div className="rounded-xl border border-ok-600/30 bg-ok-100 px-4 py-3">
            <div className="text-sm font-semibold text-ink-700">The real thing, 3(x + 2) at x = 5:</div>
            <div className="mt-1 text-lg font-bold text-ink-900">
              <MathText text="3(5 + 2) = 3(7) = 21" /> <span className="text-ok-600">✓</span>
            </div>
          </div>
          <div className="rounded-xl border-2 border-err-600/40 bg-err-100/50 px-4 py-3">
            <div className="text-sm font-semibold text-ink-700">The claim, 3x + 2 at x = 5:</div>
            <div className="mt-1 text-lg font-bold text-ink-900">
              <MathText text="15 + 2 = 17" /> <span className="text-err-600">✗</span>
            </div>
            <div className="mt-1 text-sm text-ink-700">Four short. The 2 never got multiplied.</div>
          </div>
        </div>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(3)}>So what should happen?</PrimaryButton>
        </div>
      </Step>

      <Step n={3} title="The bracket is a bag" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">
          <MathText text="3(x + 2)" /> means <strong>three bags</strong>, and each bag holds an{" "}
          <MathText text="x" /> and a 2. Three bags means three x&rsquo;s <em>and</em> three 2s.
        </p>
        <div className="mt-4 flex justify-center">
          <DistributeArcs outer="3" first="x" op="+" second="2" />
        </div>
        <p className="mt-2 text-center text-lg font-bold text-ok-600">
          <MathText text="3(x + 2) = 3x + 6" />
        </p>
        <p className="mt-3 text-ink-700">
          Check at <MathText text="x = 5" /> again: 15 + 6 = <strong>21</strong>, which matches. ✓
        </p>
        <KeyIdea>
          The outside number reaches <strong>every</strong> term inside — one arrow per term. Count
          the terms in the bracket, and you know how many multiplications you owe.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(4)}>Worked examples</PrimaryButton>
        </div>
      </Step>

      <Step n={4} title="Two worked examples" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <p className="text-ink-700">
          Expand <MathText text="5(x + 4)" />.
        </p>
        <Work
          rows={[
            ["5 × x", "5x"],
            ["5 × 4", "20"],
            ["Write both", "5x + 20"],
          ]}
        />
        <p className="mt-3 text-ink-700">
          Check at <MathText text="x = 2" />: <MathText text="5(6) = 30" /> and{" "}
          <MathText text="10 + 20 = 30" />. ✓
        </p>
        <p className="mt-5 text-ink-700">
          Now one with a coefficient inside and a minus: expand <MathText text="4(2x − 3)" />.
        </p>
        <Work
          rows={[
            ["4 × 2x", "8x"],
            ["4 × 3, and the minus stays", "− 12"],
            ["Write both", "8x − 12"],
          ]}
        />
        <p className="mt-3 text-ink-700">
          Check at <MathText text="x = 3" />: <MathText text="4(6 − 3) = 12" /> and{" "}
          <MathText text="24 − 12 = 12" />. ✓
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(5)}>When the outside is negative</PrimaryButton>
        </div>
      </Step>

      <Step n={5} title="A minus outside hits everything inside" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">
          Expand <MathText text="−3(x + 5)" />. The rule has not changed, but now both arrows carry a
          minus sign with them.
        </p>
        <div className="mt-4 flex justify-center">
          <DistributeArcs outer="−3" first="x" op="+" second="5" />
        </div>
        <Work
          rows={[
            ["−3 × x", "−3x"],
            ["−3 × 5", "−15"],
            ["Result", "−3x − 15"],
          ]}
        />
        <p className="mt-3 text-ink-700">
          Check at <MathText text="x = 1" />: <MathText text="−3(6) = −18" /> and{" "}
          <MathText text="−3 − 15 = −18" />. ✓
        </p>
        <p className="mt-5 text-ink-700">
          The same idea handles a subtracted bracket. Expand and simplify{" "}
          <MathText text="4(x + 2) − 2(x − 3)" />:
        </p>
        <Work
          rows={[
            ["First bracket", "4x + 8"],
            ["Second: −2 × x, then −2 × (−3)", "−2x + 6"],
            ["Collect like terms", "2x + 14"],
          ]}
        />
        <p className="mt-3 text-ink-700">
          Check at <MathText text="x = 5" />: <MathText text="4(7) − 2(2) = 28 − 4 = 24" />, and{" "}
          <MathText text="2(5) + 14 = 24" />. ✓
        </p>
        <KeyIdea>
          Minus times minus gives plus — that is why the <MathText text="−3" /> inside came back out
          as <MathText text="+6" />. Treat the minus as part of the multiplier and it looks after
          itself.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(6)}>Your turn</PrimaryButton>
        </div>
      </Step>

      <Step n={6} title="You try one" open={step === 6} onOpen={() => go(6)} done={false}>
        <p className="text-ink-700">
          Expand <MathText text="6(x + 3)" />.
        </p>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          The first arrow: <MathText text="6 * x = 6x" />. So the answer starts{" "}
          <MathText text="6x +" /> something.
        </div>
        <TryIt
          prompt={<>2. The second arrow lands on the 3. What number goes at the end?</>}
          accept={["18"]}
          placeholder="just the number"
          value={fade}
          setValue={setFade}
          hint="the 6 has to reach the 3 as well — what is 6 lots of 3?"
          explain={
            <>
              <MathText text="6(x + 3) = 6x + 18" />. Check at <MathText text="x = 2" />:{" "}
              <MathText text="6(5) = 30" /> and <MathText text="12 + 18 = 30" />. ✓ Leaving the 3
              alone would have given 15 instead.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Expanding a bracket</div>
          <div className="mt-2">1. Count the terms inside — that is how many arrows you owe</div>
          <div className="mt-1">2. Multiply the outside number by each one</div>
          <div className="mt-1">3. Carry the signs, including a minus on the outside</div>
          <div className="mt-1">4. Then collect any like terms</div>
        </div>
        <KeyIdea>
          💡 Nothing inside a bracket gets skipped. If your expanded answer still contains one of the
          original numbers untouched, an arrow went missing.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
