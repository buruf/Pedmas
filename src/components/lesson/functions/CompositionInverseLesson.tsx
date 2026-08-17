"use client";

import { useState } from "react";
import { MathText } from "@/components/MathText";
import { Step, KeyIdea, FormulaBox, WrongBox } from "@/components/lesson/Step";
import { LessonShell, TryIt } from "@/components/lesson/LessonShell";
import { PrimaryButton } from "@/components/ui";

/** Two machines in a row, with the number that travels between them. */
function Pipeline({
  start,
  stages,
}: {
  start: string;
  /** each stage is [machine label, rule, value coming out] */
  stages: [string, string, string][];
}) {
  return (
    <div className="mx-auto flex max-w-md flex-wrap items-center justify-center gap-2">
      <span className="rounded-xl bg-brand-50 px-3 py-2 text-lg font-bold text-brand-800">
        <MathText text={start} />
      </span>
      {stages.map(([label, rule, out], i) => (
        <span key={i} className="flex items-center gap-2">
          <span className="text-ink-500">→</span>
          <span className="rounded-2xl border-2 border-brand-300 bg-white px-3 py-2 text-center">
            <span className="block text-[10px] font-bold uppercase tracking-wide text-brand-600">{label}</span>
            <span className="block text-sm font-bold text-ink-900">
              <MathText text={rule} />
            </span>
          </span>
          <span className="text-ink-500">→</span>
          <span className="rounded-xl bg-ok-100 px-3 py-2 text-lg font-bold text-ok-600">
            <MathText text={out} />
          </span>
        </span>
      ))}
    </div>
  );
}

/**
 * Composition of functions.
 *
 * The whole lesson turns on one fact: f(g(3)) and g(f(3)) are different
 * numbers. Showing that with a single pair of simple rules kills both the
 * "work it left to right" habit and the assumption that order does not matter.
 */
export function CompositionLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 11 · Functions · Composite Functions"
      title="Two machines in a row"
      minutes={6}
      step={step}
      total={7}
    >
      <Step n={1} title="Dollars, then euros, then tax" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          You convert dollars to euros. Then a shop adds tax to the euro price. Two rules, one after
          the other, and the answer to the first becomes the question for the second.
        </p>
        <p className="mt-3 text-ink-700">
          That chaining is so common that maths has notation for it —{" "}
          <MathText text="f(g(x))" className="font-bold text-ink-900" />.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(2)}>Go on</PrimaryButton></div>
      </Step>

      <Step n={2} title="You can already do the parts" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <p className="text-ink-700">
          Take <MathText text="f(x) = 2x + 1" /> and <MathText text="g(x) = x + 5" />. Separately
          these are easy.
        </p>
        <div className="mt-3 space-y-2">
          {[
            ["g(3) = 3 + 5", "8"],
            ["f(3) = 2(3) + 1", "7"],
            ["f(8) = 2(8) + 1", "17"],
          ].map(([a, b]) => (
            <div key={a} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-semibold text-ink-900"><MathText text={a} /></span>
              <span className="text-sm font-bold text-ink-700"><MathText text={b} /></span>
            </div>
          ))}
        </div>
        <div className="mt-4"><PrimaryButton onClick={() => go(3)}>Now chain them</PrimaryButton></div>
      </Step>

      <Step n={3} title="The new question" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">
          Find <MathText text="f(g(3))" className="font-bold text-ink-900" />.
        </p>
        <p className="mt-3 text-ink-700">
          There are two machines and one number. The only real question is: which machine gets the 3?
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(4)}>Which one?</PrimaryButton></div>
      </Step>

      <Step n={4} title="The mistake almost everyone makes" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <WrongBox>
          <MathText text="f(g(3))" /> — do <MathText text="f" /> first, because it is written first
        </WrongBox>
        <p className="text-ink-700">
          English reads left to right, so it feels natural. And a lot of people also assume the
          order cannot matter much anyway. Test both ideas at once by doing it each way.
        </p>
        <div className="mt-4 rounded-2xl bg-paper p-3">
          <p className="text-center text-sm font-bold text-ink-900">
            <MathText text="f(g(3))" /> — g first
          </p>
          <div className="mt-2">
            <Pipeline
              start="3"
              stages={[
                ["g", "x + 5", "8"],
                ["f", "2x + 1", "17"],
              ]}
            />
          </div>
        </div>
        <div className="mt-3 rounded-2xl bg-paper p-3">
          <p className="text-center text-sm font-bold text-ink-900">
            <MathText text="g(f(3))" /> — f first
          </p>
          <div className="mt-2">
            <Pipeline
              start="3"
              stages={[
                ["f", "2x + 1", "7"],
                ["g", "x + 5", "12"],
              ]}
            />
          </div>
        </div>
        <p className="mt-4 text-center text-lg font-bold text-err-600">
          <MathText text="17 ≠ 12" />
        </p>
        <p className="mt-2 text-ink-700">
          Same two rules, same starting number, five apart. Order is not a detail here — it changes
          the answer.
        </p>
        <KeyIdea>
          So <MathText text="f(g(x))" /> and <MathText text="g(f(x))" /> are different functions.
          You are not allowed to swap them the way you swap <MathText text="3 * 5" /> and{" "}
          <MathText text="5 * 3" />.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(5)}>So what decides the order?</PrimaryButton></div>
      </Step>

      <Step n={5} title="The brackets decide" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">
          Look at where the 3 actually is. In <MathText text="f(g(3))" /> the 3 sits inside{" "}
          <MathText text="g" />&rsquo;s brackets. Only <MathText text="g" /> is touching it.
        </p>
        <FormulaBox>
          <MathText text="f( g(3) )" />
        </FormulaBox>
        <p className="text-ink-700">
          This is the same rule you have used since primary school: <strong>innermost brackets
          first</strong>. <MathText text="g(3)" /> is just a number — 8 — and then{" "}
          <MathText text="f" /> gets that number.
        </p>
        <KeyIdea>
          Work <strong>outward from the inside</strong>, never left to right. The inner function
          runs first because its brackets close first.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(6)}>Worked examples</PrimaryButton></div>
      </Step>

      <Step n={6} title="With a number, and with x" open={step === 6} onOpen={() => go(6)} done={step > 6}>
        <p className="text-ink-700">
          <MathText text="f(x) = 2x + 1" />, <MathText text="g(x) = x + 5" />.
        </p>
        <div className="mt-3 rounded-2xl bg-paper p-4">
          <p className="font-bold text-ink-900">Find <MathText text="f(g(3))" /></p>
          <ol className="mt-2 space-y-2">
            {[
              ["Inside first: g(3) = 3 + 5", "8"],
              ["Feed 8 to f: f(8) = 2(8) + 1", "17"],
            ].map(([a, b], i) => (
              <li key={i} className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 text-sm">
                <span className="text-ink-700">
                  <span className="mr-2 font-bold text-brand-600">{i + 1}.</span>
                  <MathText text={a} />
                </span>
                <span className="font-bold text-ink-900"><MathText text={b} /></span>
              </li>
            ))}
          </ol>
        </div>
        <p className="mt-4 text-ink-700">
          Now the same thing with a letter. Nothing changes — the slot just receives an expression
          instead of a number.
        </p>
        <div className="mt-3 rounded-2xl bg-paper p-4">
          <p className="font-bold text-ink-900">Find <MathText text="f(g(x))" /></p>
          <ol className="mt-2 space-y-2">
            {[
              ["Drop the whole of g(x) into f's slot", "f(x + 5) = 2(x + 5) + 1"],
              ["Expand the bracket", "2x + 10 + 1"],
              ["Tidy", "2x + 11"],
            ].map(([a, b], i) => (
              <li key={i} className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 text-sm">
                <span className="text-ink-700">
                  <span className="mr-2 font-bold text-brand-600">{i + 1}.</span>
                  <MathText text={a} />
                </span>
                <span className="font-bold text-ink-900"><MathText text={b} /></span>
              </li>
            ))}
          </ol>
          <p className="mt-2 text-sm text-ink-700">
            Check against the number answer: at <MathText text="x = 3" />,{" "}
            <MathText text="2(3) + 11 = 17" /> ✓ — the same 17 as before.
          </p>
        </div>
        <div className="mt-4"><PrimaryButton onClick={() => go(7)}>Your turn</PrimaryButton></div>
      </Step>

      <Step n={7} title="You try one" open={step === 7} onOpen={() => go(7)} done={false}>
        <p className="text-ink-700">
          <MathText text="f(x) = 3x − 2" /> and <MathText text="g(x) = x + 4" />. Find{" "}
          <MathText text="f(g(1))" className="font-bold text-ink-900" />.
        </p>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          Innermost brackets first: <MathText text="g(1) = 1 + 4 = 5" className="font-bold" />.
        </div>
        <TryIt
          prompt={<>2. Now feed that 5 into f. What is f(g(1))?</>}
          accept={["13"]}
          placeholder="a number"
          value={fade}
          setValue={setFade}
          hint="f(5) means 3 × 5 − 2."
          explain={
            <>
              <MathText text="f(5) = 15 − 2 = 13" />. Worth seeing the other order too:{" "}
              <MathText text="f(1) = 1" />, then <MathText text="g(1) = 5" /> — so{" "}
              <MathText text="g(f(1)) = 5" />, nothing like 13.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Composite functions</div>
          <div className="mt-2">1. Innermost brackets first — the inner function runs first</div>
          <div className="mt-1">2. Its output becomes the outer function&rsquo;s input</div>
          <div className="mt-1">3. f(g(x)) and g(f(x)) are different — never swap them</div>
        </div>
        <KeyIdea>
          💡 Socks then shoes is not the same as shoes then socks. Composition remembers the order,
          and so must you.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}

/**
 * Inverse functions.
 *
 * The notation f⁻¹ is read as a reciprocal by a huge number of students,
 * because everywhere else a −1 exponent means "one over". The lesson tests
 * that reading numerically and lets it fail, then rebuilds f⁻¹ as "run the
 * machine backwards", with the reversed order of operations made explicit.
 */
export function InverseFunctionLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 11 · Functions · Inverse Functions"
      title="Running the machine backwards"
      minutes={6}
      step={step}
      total={7}
    >
      <Step n={1} title="Socks, then shoes" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          This morning you put on socks, then shoes. Tonight you undo it: shoes off, then socks off.
        </p>
        <p className="mt-3 text-ink-700">
          Two things happened there. Each action was reversed, <em>and</em> the order was reversed.
          Try taking your socks off first and you will see why both matter.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(2)}>What has this to do with functions?</PrimaryButton></div>
      </Step>

      <Step n={2} title="You already undo simple ones" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <p className="text-ink-700">
          If <MathText text="f(x) = x + 7" />, then to get back you subtract 7. If{" "}
          <MathText text="f(x) = 4x" />, you divide by 4. Nobody finds that hard.
        </p>
        <div className="mt-3 space-y-2">
          {[
            ["f(x) = x + 7 adds 7", "undo: subtract 7"],
            ["f(x) = 4x multiplies by 4", "undo: divide by 4"],
            ["f(x) = x − 3 subtracts 3", "undo: add 3"],
          ].map(([a, b]) => (
            <div key={a} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-semibold text-ink-900"><MathText text={a} /></span>
              <span className="text-sm text-brand-700">{b}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-ink-700">
          The undoing machine gets a name: <MathText text="f^{−1}" className="font-bold text-ink-900" />.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(3)}>The new problem</PrimaryButton></div>
      </Step>

      <Step n={3} title="Two operations at once" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">
          Now <MathText text="f(x) = 4x + 3" className="font-bold text-ink-900" />. This machine
          does two things: multiply by 4, then add 3.
        </p>
        <p className="mt-3 text-ink-700">
          Check it: <MathText text="f(2) = 4(2) + 3 = 11" />. So whatever{" "}
          <MathText text="f^{−1}" /> is, it must send 11 back to 2.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(4)}>Find it</PrimaryButton></div>
      </Step>

      <Step n={4} title="The mistake almost everyone makes" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <WrongBox>
          <MathText text="f^{−1}(x)" /> means <MathText text="{1/f(x)}" />
        </WrongBox>
        <p className="text-ink-700">
          Honestly earned: <MathText text="2^{−1}" /> is <MathText text="{1/2}" />, and{" "}
          <MathText text="x^{−1}" /> is <MathText text="{1/x}" />. A <MathText text="−1" /> up there
          has meant &ldquo;one over&rdquo; for years.
        </p>
        <p className="mt-3 text-ink-700">
          So test it. You know <MathText text="f(2) = 11" />, so the true undoing machine must give{" "}
          <MathText text="f^{−1}(11) = 2" />. What does the reciprocal reading give?
        </p>
        <div className="mt-3 space-y-2">
          {[
            ["Reciprocal reading", "{1/f(11)}"],
            ["f(11) = 4(11) + 3", "47"],
            ["So it claims f^{−1}(11) =", "{1/47}"],
            ["But undoing must give", "2"],
          ].map(([a, b], i) => (
            <div key={i} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-semibold text-ink-900"><MathText text={a} /></span>
              <span className="text-sm font-bold text-ink-700"><MathText text={b} /></span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-ink-700">
          <MathText text="{1/47}" /> is not 2, and it is not even close. The reciprocal reading is
          answering a different question entirely.
        </p>
        <KeyIdea>
          The <MathText text="−1" /> in <MathText text="f^{−1}" /> is not an exponent. It is a label
          meaning <strong>&ldquo;the machine that undoes f&rdquo;</strong>. If you ever want the
          reciprocal, you must write <MathText text="{1/f(x)}" /> or{" "}
          <MathText text="(f(x))^{−1}" /> — with brackets.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(5)}>How do I build it?</PrimaryButton></div>
      </Step>

      <Step n={5} title="Undo the operations, backwards" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">
          <MathText text="f" /> multiplies by 4, <em>then</em> adds 3. So{" "}
          <MathText text="f^{−1}" /> must subtract 3, <em>then</em> divide by 4 — shoes before
          socks.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border-2 border-brand-200 bg-white p-3 text-center">
            <div className="text-xs font-bold uppercase tracking-wide text-brand-600">f — forwards</div>
            <div className="mt-2 text-sm font-bold text-ink-900">2</div>
            <div className="text-ink-500">↓ × 4</div>
            <div className="text-sm font-bold text-ink-900">8</div>
            <div className="text-ink-500">↓ + 3</div>
            <div className="text-sm font-bold text-ok-600">11</div>
          </div>
          <div className="rounded-2xl border-2 border-brand-200 bg-white p-3 text-center">
            <div className="text-xs font-bold uppercase tracking-wide text-brand-600">
              f<sup>−1</sup> — backwards
            </div>
            <div className="mt-2 text-sm font-bold text-ink-900">11</div>
            <div className="text-ink-500">↓ − 3</div>
            <div className="text-sm font-bold text-ink-900">8</div>
            <div className="text-ink-500">↓ ÷ 4</div>
            <div className="text-sm font-bold text-ok-600">2</div>
          </div>
        </div>
        <FormulaBox>
          <MathText text="f(f^{−1}(x)) = x" />
        </FormulaBox>
        <p className="text-ink-700">
          That is the definition, and it is also the fastest check you own. Do one then the other
          and you should land exactly back where you started.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(6)}>The algebra</PrimaryButton></div>
      </Step>

      <Step n={6} title="The swap-and-solve method" open={step === 6} onOpen={() => go(6)} done={step > 6}>
        <p className="text-ink-700">
          Writing the backwards machine as a formula takes three lines. Find{" "}
          <MathText text="f^{−1}(x)" /> for <MathText text="f(x) = 4x + 3" />.
        </p>
        <div className="mt-3 rounded-2xl bg-paper p-4">
          <ol className="space-y-2">
            {[
              ["Write it as y =", "y = 4x + 3"],
              ["Swap x and y — that is the reversal", "x = 4y + 3"],
              ["Subtract 3", "x − 3 = 4y"],
              ["Divide by 4", "y = {x − 3/4}"],
            ].map(([a, b], i) => (
              <li key={i} className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 text-sm">
                <span className="text-ink-700">
                  <span className="mr-2 font-bold text-brand-600">{i + 1}.</span>
                  <MathText text={a} />
                </span>
                <span className="font-bold text-ink-900"><MathText text={b} /></span>
              </li>
            ))}
          </ol>
          <p className="mt-2 text-center font-bold text-ok-600">
            <MathText text="f^{−1}(x) = {x − 3/4}" />
          </p>
          <p className="mt-2 text-center text-sm text-ink-700">
            Check: <MathText text="f^{−1}(11) = {11 − 3/4} = {8/4} = 2" /> ✓
          </p>
        </div>
        <KeyIdea>
          Why swapping works: <MathText text="f" /> turns inputs into outputs, so its inverse turns
          outputs into inputs. Trading the letters <em>is</em> reversing the arrow.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(7)}>Your turn</PrimaryButton></div>
      </Step>

      <Step n={7} title="You try one" open={step === 7} onOpen={() => go(7)} done={false}>
        <p className="text-ink-700">
          <MathText text="f(x) = 5x − 2" className="font-bold text-ink-900" />. Find{" "}
          <MathText text="f^{−1}(23)" />.
        </p>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          <MathText text="f^{−1}(23)" /> asks: which input does <MathText text="f" /> send to 23? So
          solve <MathText text="5x − 2 = 23" className="font-bold" />.
        </div>
        <TryIt
          prompt={<>2. Solve it. What is f⁻¹(23)?</>}
          accept={["5"]}
          placeholder="a number"
          value={fade}
          setValue={setFade}
          hint="add 2 to both sides first, then divide by 5."
          explain={
            <>
              <MathText text="5x = 25" />, so <MathText text="x = 5" />. Check forwards:{" "}
              <MathText text="f(5) = 25 − 2 = 23" /> ✓. And note{" "}
              <MathText text="{1/f(23)} = {1/113}" /> — nowhere near 5, as expected.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Inverse functions</div>
          <div className="mt-2">1. f⁻¹ undoes f — it is not 1 over f</div>
          <div className="mt-1">2. Undo each operation, in reverse order</div>
          <div className="mt-1">3. Or: write y =, swap x and y, solve for y</div>
          <div className="mt-1">4. Check with f(f⁻¹(x)) = x</div>
        </div>
        <KeyIdea>
          💡 <MathText text="f^{−1}(11) = 2" /> and <MathText text="f(2) = 11" /> say exactly the
          same thing. An inverse is one fact read from the other end.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
