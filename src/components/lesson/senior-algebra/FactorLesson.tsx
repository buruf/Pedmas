"use client";

import { useState } from "react";
import { MathText } from "@/components/MathText";
import { Step, KeyIdea, WrongBox, FormulaBox } from "@/components/lesson/Step";
import { LessonShell, TryIt } from "@/components/lesson/LessonShell";
import { PrimaryButton } from "@/components/ui";

/* -------------------------------------------------------------- local box */

/** The area box again, this time read backwards: area known, edges wanted. */
function BoxModel({
  top,
  side,
  cells,
  unknownEdges = false,
}: {
  top: string[];
  side: string[];
  cells: string[][];
  /** draw the edge labels as blanks, because they are what you are hunting for */
  unknownEdges?: boolean;
}) {
  const edge = (t: string) =>
    unknownEdges ? (
      <span className="text-ink-300">?</span>
    ) : (
      <MathText text={t} />
    );
  return (
    <table className="mx-auto border-collapse text-center">
      <tbody>
        <tr>
          <td className="w-8" />
          {top.map((t, i) => (
            <th key={i} className="px-2 pb-1 text-sm font-bold text-brand-700">
              {edge(t)}
            </th>
          ))}
        </tr>
        {side.map((s, r) => (
          <tr key={r}>
            <th className="pr-2 text-sm font-bold text-brand-700">{edge(s)}</th>
            {cells[r].map((c, i) => (
              <td
                key={i}
                className="border-2 border-brand-200 bg-brand-50 px-4 py-5 text-lg font-black text-ink-900"
              >
                <MathText text={c} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function WorkList({ rows }: { rows: [string, string][] }) {
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

function NumberTest({
  x,
  rows,
}: {
  x: string;
  rows: { label: string; work: string; value: string; ok: boolean }[];
}) {
  return (
    <div className="mt-4 rounded-2xl border-2 border-ink-100 bg-white p-4">
      <div className="text-sm font-bold text-ink-900">
        Test it with <MathText text={x} />
      </div>
      <div className="mt-2 space-y-2">
        {rows.map((r) => (
          <div
            key={r.label}
            className={`flex flex-wrap items-center justify-between gap-2 rounded-xl px-3 py-2 ${
              r.ok ? "bg-ok-100" : "bg-err-100"
            }`}
          >
            <span className="text-sm font-bold text-ink-900">
              <MathText text={r.label} />
            </span>
            <span className="text-sm text-ink-700">
              <MathText text={r.work} />
            </span>
            <span className={`text-sm font-black ${r.ok ? "text-ok-600" : "text-err-600"}`}>
              {r.value} {r.ok ? "✓" : "✗"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Factoring quadratics.
 *
 * Factoring is expanding run in reverse, so the lesson starts from an
 * expansion the student can already do and asks what each piece came from.
 * The misconception step is signs: with a positive constant and a negative
 * middle, almost everyone reaches for one plus and one minus. Substituting
 * x = 0 kills that in a single line, because x = 0 tests the constant alone.
 */
export function FactorLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 10 · Polynomials · Factoring"
      title="Factoring a quadratic"
      minutes={7}
      step={step}
      total={7}
    >
      <Step n={1} title="The same box, read backwards" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          Expanding tells you the area of a rectangle when you know its sides. Factoring asks the
          opposite question: the area is <MathText text="x^2 + 7x + 12" /> — what were the sides?
        </p>
        <div className="mt-4">
          <BoxModel
            top={["?", "?"]}
            side={["?", "?"]}
            cells={[
              ["x^2", "?"],
              ["?", "12"],
            ]}
            unknownEdges
          />
        </div>
        <KeyIdea>
          Everything you need is already in the expansion you can do. Factoring is just refusing to
          look up the answer.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(2)}>Where did each piece come from?</PrimaryButton></div>
      </Step>

      <Step n={2} title="Two numbers do two jobs" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <p className="text-ink-700">
          Expand <MathText text="(x + 3)(x + 4)" /> and watch the 3 and the 4.
        </p>
        <div className="mt-4">
          <BoxModel
            top={["x", "3"]}
            side={["x", "4"]}
            cells={[
              ["x^2", "3x"],
              ["4x", "12"],
            ]}
          />
        </div>
        <div className="mt-3 space-y-2">
          {[
            ["the corner square", "3 * 4 = 12", "they multiply to give the constant"],
            ["the two strips", "3x + 4x = 7x", "they add to give the middle"],
          ].map(([a, b, c]) => (
            <div key={a} className="rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-semibold text-ink-900">{a}</span>
              <span className="ml-3 text-sm font-bold text-brand-700"><MathText text={b} /></span>
              <div className="mt-0.5 text-sm text-ink-700">{c}</div>
            </div>
          ))}
        </div>
        <FormulaBox>
          <MathText text="x^2 + 7x + 12 = (x + 3)(x + 4)" />
        </FormulaBox>
        <p className="text-ink-700">
          So to factor, hunt for two numbers that <strong>multiply to the constant</strong> and{" "}
          <strong>add to the middle</strong>.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(3)}>Now change one sign</PrimaryButton></div>
      </Step>

      <Step n={3} title="The new problem" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">
          Factor <MathText text="x^2 − 7x + 12" />. Only the middle sign changed.
        </p>
        <p className="mt-3 text-ink-700">
          You still need two numbers multiplying to <strong>12</strong> and adding to{" "}
          <strong>−7</strong>.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(4)}>Try it</PrimaryButton></div>
      </Step>

      <Step n={4} title="The mistake almost everyone makes" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <WrongBox><MathText text="x^2 − 7x + 12 = (x + 3)(x − 4)" /></WrongBox>
        <p className="text-ink-700">
          The reasoning sounds airtight: something has to be negative to make the −7, so make one of
          them negative. Test it at <MathText text="x = 0" /> — a value that strips away every term
          with an x and leaves only the constant.
        </p>
        <NumberTest
          x="x = 0"
          rows={[
            { label: "x^2 − 7x + 12", work: "0 − 0 + 12", value: "12", ok: true },
            { label: "(x + 3)(x − 4)", work: "(3)(−4)", value: "−12", ok: false },
          ]}
        />
        <p className="mt-3 text-ink-700">
          One plus and one minus always multiply to a <strong>negative</strong> constant. But the
          constant here is <MathText text="+12" />. So the signs must <strong>match</strong> — and to
          add to <MathText text="−7" /> they must both be negative.
        </p>
        <div className="mt-3 rounded-xl bg-paper px-4 py-3 text-center">
          <div className="text-lg font-bold text-ok-600"><MathText text="(x − 3)(x − 4)" /></div>
          <div className="mt-1 text-sm text-ink-700">
            <MathText text="(−3)(−4) = +12" /> ✓ &nbsp;and&nbsp; <MathText text="−3 + (−4) = −7" /> ✓
          </div>
        </div>
        <NumberTest
          x="x = 1"
          rows={[
            { label: "x^2 − 7x + 12", work: "1 − 7 + 12", value: "6", ok: true },
            { label: "(x − 3)(x − 4)", work: "(−2)(−3)", value: "6", ok: true },
          ]}
        />
        <div className="mt-4"><PrimaryButton onClick={() => go(5)}>Give me a rule for the signs</PrimaryButton></div>
      </Step>

      <Step n={5} title="The constant tells you the signs" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">
          You never have to guess. The last number decides whether the signs match, and the middle
          number decides which way.
        </p>
        <div className="mt-3 space-y-2">
          {[
            ["constant +, middle +", "both positive", "x^2 + 7x + 12 = (x + 3)(x + 4)"],
            ["constant +, middle −", "both negative", "x^2 − 7x + 12 = (x − 3)(x − 4)"],
            ["constant −", "one of each", "x^2 − 2x − 15 = (x − 5)(x + 3)"],
          ].map(([a, b, c]) => (
            <div key={a} className="rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-semibold text-ink-900">{a}</span>
              <span className="ml-3 text-sm font-bold text-brand-700">{b}</span>
              <div className="mt-0.5 text-sm text-ink-700"><MathText text={c} /></div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-ink-700">
          In that last row, the pair must multiply to <MathText text="−15" /> and add to{" "}
          <MathText text="−2" />: that is <MathText text="−5" /> and <MathText text="+3" />. The
          bigger number carries the sign of the middle term.
        </p>
        <NumberTest
          x="x = 1"
          rows={[
            { label: "x^2 − 2x − 15", work: "1 − 2 − 15", value: "−16", ok: true },
            { label: "(x − 5)(x + 3)", work: "(−4)(4)", value: "−16", ok: true },
          ]}
        />
        <KeyIdea>
          Two patterns are worth spotting on sight:{" "}
          <MathText text="x^2 − 9 = (x + 3)(x − 3)" /> (nothing in the middle) and a common factor
          hiding in front, like <MathText text="2x^2 + 10x = 2x(x + 5)" />. Pull those out first.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(6)}>Worked example</PrimaryButton></div>
      </Step>

      <Step n={6} title="Worked example" open={step === 6} onOpen={() => go(6)} done={step > 6}>
        <p className="text-ink-700">
          Factor <MathText text="x^2 + 9x + 20" />.
        </p>
        <WorkList
          rows={[
            ["Constant is +, middle is + — so both signs are +", "( x + ? )( x + ? )"],
            ["Pairs multiplying to 20", "1 & 20, 2 & 10, 4 & 5"],
            ["Which pair adds to 9?", "4 + 5 = 9"],
            ["Answer", "(x + 4)(x + 5)"],
          ]}
        />
        <p className="mt-3 text-ink-700">
          <strong>Always expand back.</strong> <MathText text="(x + 4)(x + 5)" /> gives{" "}
          <MathText text="x^2 + 5x + 4x + 20 = x^2 + 9x + 20" /> ✓
        </p>
        <NumberTest
          x="x = 1"
          rows={[
            { label: "x^2 + 9x + 20", work: "1 + 9 + 20", value: "30", ok: true },
            { label: "(x + 4)(x + 5)", work: "(5)(6)", value: "30", ok: true },
          ]}
        />
        <div className="mt-4"><PrimaryButton onClick={() => go(7)}>Your turn</PrimaryButton></div>
      </Step>

      <Step n={7} title="You try one" open={step === 7} onOpen={() => go(7)} done={false}>
        <p className="text-ink-700">
          Factor <MathText text="x^2 − 3x − 10" />.
        </p>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          The constant is negative, so the two numbers have <strong>opposite</strong> signs. They
          multiply to <MathText text="−10" /> and add to <MathText text="−3" />. The pair is 5 and 2.
        </div>
        <TryIt
          prompt={<>2. One of them is negative. Which one — type it with its sign.</>}
          accept={["-5", "−5"]}
          placeholder="like -4"
          value={fade}
          setValue={setFade}
          hint="the sum must come out negative, so the bigger of the two takes the minus."
          explain={
            <>
              <MathText text="−5" /> and <MathText text="+2" />, so{" "}
              <MathText text="x^2 − 3x − 10 = (x − 5)(x + 2)" />. Expand back:{" "}
              <MathText text="x^2 + 2x − 5x − 10 = x^2 − 3x − 10" /> ✓
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Factoring <MathText text="x^2 + bx + c" /></div>
          <div className="mt-2">1. Take out any common factor first</div>
          <div className="mt-1">2. Find two numbers multiplying to c and adding to b</div>
          <div className="mt-1">3. c positive means the signs match; c negative means they differ</div>
          <div className="mt-1">4. Expand back — every time</div>
        </div>
        <KeyIdea>
          💡 Factoring is the only topic where you can mark your own work perfectly. Multiply your
          brackets out; if you do not get back what you started with, you are not finished.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
