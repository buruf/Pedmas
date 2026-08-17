"use client";

import { useState } from "react";
import { MathText } from "@/components/MathText";
import { Step, KeyIdea, FormulaBox, WrongBox } from "@/components/lesson/Step";
import { LessonShell, TryIt } from "@/components/lesson/LessonShell";
import { PrimaryButton } from "@/components/ui";

/**
 * Relations, domain and range, and the function test (Grade 10).
 *
 * Half the bank turns on one asymmetry: repeated *outputs* are allowed, but
 * repeated *inputs* are not. Students routinely apply the rule in both
 * directions and reject perfectly good functions like y = x². The lesson makes
 * the asymmetry physical with a vending machine — two buttons may serve the
 * same snack, but one button may not serve two different snacks — before any
 * notation appears.
 */

const BRAND = "#7c3aed";
const TEAL = "#0d9488";
const ROSE = "#dc2626";
const GREY = "#9ca3af";

/**
 * Mapping diagram for a small relation. Inputs and outputs are de-duplicated,
 * so a repeated output shows up as two arrows landing on one dot and a repeated
 * input shows up as two arrows leaving one dot — the whole distinction, drawn.
 */
function Mapping({
  pairs,
  title,
  verdict,
}: {
  pairs: [number, number][];
  title?: string;
  /** "ok" draws the arrows green, "bad" reddens the offending input */
  verdict?: "ok" | "bad";
}) {
  const ins = Array.from(new Set(pairs.map((p) => p[0])));
  const outs = Array.from(new Set(pairs.map((p) => p[1])));
  const rows = Math.max(ins.length, outs.length);
  const rowH = 34;
  const H = rows * rowH + 34;
  const W = 236;
  const lx = 52;
  const rx = 184;
  const yOf = (i: number, n: number) => 26 + (H - 34) * ((i + 0.5) / n);
  const badInputs = new Set(
    ins.filter((v) => pairs.filter((p) => p[0] === v).length > 1)
  );
  const arrowColour = verdict === "bad" ? ROSE : verdict === "ok" ? TEAL : BRAND;

  return (
    <figure className="m-0">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: W }} role="img" aria-label={title ?? "mapping diagram"}>
        <ellipse cx={lx} cy={H / 2 + 6} rx={34} ry={H / 2 - 8} fill="#f5f3ff" stroke={BRAND} strokeWidth="1.6" />
        <ellipse cx={rx} cy={H / 2 + 6} rx={34} ry={H / 2 - 8} fill="#f0fdfa" stroke={TEAL} strokeWidth="1.6" />
        <text x={lx} y={12} fontSize="10" fontWeight="700" textAnchor="middle" fill={BRAND}>
          input (x)
        </text>
        <text x={rx} y={12} fontSize="10" fontWeight="700" textAnchor="middle" fill={TEAL}>
          output (y)
        </text>
        {pairs.map(([a, b], i) => {
          const y1 = yOf(ins.indexOf(a), ins.length);
          const y2 = yOf(outs.indexOf(b), outs.length);
          const hot = badInputs.has(a);
          return (
            <line
              key={i}
              x1={lx + 16}
              y1={y1}
              x2={rx - 16}
              y2={y2}
              stroke={hot ? ROSE : arrowColour}
              strokeWidth={hot ? 2.2 : 1.6}
            />
          );
        })}
        {ins.map((v, i) => (
          <g key={`i${v}`}>
            <circle
              cx={lx + 16}
              cy={yOf(i, ins.length)}
              r="4"
              fill={badInputs.has(v) ? ROSE : BRAND}
            />
            <text
              x={lx - 4}
              y={yOf(i, ins.length) + 4}
              fontSize="13"
              fontWeight="700"
              textAnchor="middle"
              fill={badInputs.has(v) ? ROSE : "#111827"}
            >
              {v}
            </text>
          </g>
        ))}
        {outs.map((v, i) => (
          <g key={`o${v}`}>
            <circle cx={rx - 16} cy={yOf(i, outs.length)} r="4" fill={TEAL} />
            <text x={rx + 6} y={yOf(i, outs.length) + 4} fontSize="13" fontWeight="700" textAnchor="middle" fill="#111827">
              {v}
            </text>
          </g>
        ))}
      </svg>
      {title && (
        <figcaption className="mt-1 text-center text-sm font-semibold text-ink-700">{title}</figcaption>
      )}
    </figure>
  );
}

/** A curve with one vertical test line drawn across it. */
function VerticalLineTest({
  kind,
  testX,
  title,
}: {
  kind: "parabola" | "sideways";
  /** where the vertical line is drawn, in graph units */
  testX: number;
  title: string;
}) {
  const W = 168;
  const H = 158;
  const cx = W / 2;
  const cy = H - 26;
  const sx = 30;
  const sy = 24;
  const px = (x: number) => cx + x * sx;
  const py = (y: number) => cy - y * sy;

  let d = "";
  if (kind === "parabola") {
    const pts: string[] = [];
    for (let x = -2.2; x <= 2.21; x += 0.1) pts.push(`${px(x).toFixed(1)},${py(x * x).toFixed(1)}`);
    d = `M ${pts.join(" L ")}`;
  } else {
    const pts: string[] = [];
    for (let y = -2.2; y <= 2.21; y += 0.1) pts.push(`${px(y * y).toFixed(1)},${py(y).toFixed(1)}`);
    d = `M ${pts.join(" L ")}`;
  }
  const hits =
    kind === "parabola"
      ? [{ x: testX, y: testX * testX }]
      : [
          { x: testX, y: Math.sqrt(testX) },
          { x: testX, y: -Math.sqrt(testX) },
        ];

  return (
    <figure className="m-0">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: W }} role="img" aria-label={title}>
        <line x1={6} y1={cy} x2={W - 6} y2={cy} stroke={GREY} strokeWidth="1.4" />
        <line x1={cx} y1={8} x2={cx} y2={H - 8} stroke={GREY} strokeWidth="1.4" />
        <path d={d} fill="none" stroke={BRAND} strokeWidth="2.4" />
        <line x1={px(testX)} y1={8} x2={px(testX)} y2={H - 8} stroke={ROSE} strokeWidth="1.8" strokeDasharray="4 3" />
        {hits.map((h, i) => (
          <circle key={i} cx={px(h.x)} cy={py(h.y)} r="4" fill="#fff" stroke={ROSE} strokeWidth="2.2" />
        ))}
        <text x={px(testX)} y={H - 2} fontSize="9" textAnchor="middle" fill={ROSE}>
          x = {testX}
        </text>
      </svg>
      <figcaption className="mt-1 text-center text-sm font-semibold text-ink-700">{title}</figcaption>
    </figure>
  );
}

export function RelationsLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [guess, setGuess] = useState<string | null>(null);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 10 · Functions · Relations"
      title="When is a relation a function?"
      minutes={8}
      step={step}
      total={8}
    >
      <Step n={1} title="A vending machine" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <div className="mx-auto max-w-xs rounded-2xl border-2 border-ink-900 bg-white p-4">
          <div className="grid grid-cols-3 gap-2">
            {["A1", "A2", "B1", "B2", "C1", "C2"].map((b) => (
              <div key={b} className="rounded-lg bg-ink-100 py-2 text-center text-sm font-bold text-ink-700">
                {b}
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-lg bg-brand-50 px-3 py-2 text-center text-xs font-semibold text-brand-800">
            press a button → get a snack
          </div>
        </div>
        <p className="mt-4 text-ink-700">
          Two different buttons might both give you crisps. Annoying, maybe, but the machine still
          works. Now imagine pressing <strong>B1</strong> and getting crisps one day and a chocolate
          bar the next. That machine is broken.
        </p>
        <p className="mt-3 text-ink-700">
          That difference — which repeat is fine and which is fatal — is the whole of this lesson.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(2)}>Set up the language</PrimaryButton>
        </div>
      </Step>

      <Step n={2} title="Relations, domain and range" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <p className="text-ink-700">
          A <strong>relation</strong> is just a set of ordered pairs. In each pair the first number
          is the input and the second is the output.
        </p>
        <FormulaBox>(x, y) = (input, output)</FormulaBox>
        <p className="text-ink-700">
          Take the relation <strong>{"{(2, 3), (4, 5)}"}</strong>.
        </p>
        <div className="mt-3 space-y-2">
          {[
            ["The domain", "all the inputs", "2 and 4"],
            ["The range", "all the outputs", "3 and 5"],
          ].map(([a, b, c]) => (
            <div key={a} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-bold text-ink-900">{a}</span>
              <span className="text-sm text-ink-500">{b}</span>
              <span className="text-sm font-bold text-brand-700">{c}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-xl bg-warn-100 px-4 py-3 text-sm text-ink-700">
          ⚠️ While we are here: <MathText text="f(x)" /> is read &ldquo;f of x&rdquo;. It is{" "}
          <strong>not</strong> f multiplied by x. The brackets say &ldquo;this is what the machine
          gives back when you feed it x&rdquo;.
        </div>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(3)}>Two relations to judge</PrimaryButton>
        </div>
      </Step>

      <Step n={3} title="Which one is a function?" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <div className="flex flex-wrap justify-center gap-5">
          <Mapping pairs={[[1, 5], [2, 5], [3, 5]]} title="Relation A" />
          <Mapping pairs={[[1, 2], [1, 3]]} title="Relation B" />
        </div>
        <p className="mt-4 text-ink-700">
          Relation A sends three different inputs to the same output. Relation B sends one input to
          two outputs. Which of them is a function?
        </p>
        <div className="mt-3 grid gap-2">
          {[
            { k: "b", label: "Neither — A repeats the output 5, B repeats the input 1" },
            { k: "a", label: "A only" },
            { k: "c", label: "B only" },
          ].map((o) => (
            <button
              key={o.k}
              type="button"
              onClick={() => setGuess(o.k)}
              className={`btn rounded-xl border-2 px-4 py-3 text-left font-semibold ${
                guess === o.k ? "border-brand-600 bg-brand-50 text-brand-800" : "border-ink-100 bg-white"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
        {guess && (
          <div className="mt-4 rounded-xl bg-paper px-4 py-3 text-sm text-ink-700 pop-in">
            Go back to the machine and check which repeat actually breaks it.
            <div className="mt-3">
              <PrimaryButton onClick={() => go(4)}>Show me</PrimaryButton>
            </div>
          </div>
        )}
      </Step>

      <Step n={4} title="The mistake almost everyone makes" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <WrongBox>&ldquo;The outputs repeat, so it is not a function&rdquo;</WrongBox>
        <p className="text-ink-700">
          The rule feels like it should be symmetric — inputs unique, outputs unique. It is not, and
          the machine shows why.
        </p>
        <div className="mt-4 space-y-3">
          <div className="rounded-xl border-2 border-ok-600/40 bg-ok-100 px-3 py-3">
            <div className="text-sm font-bold text-ink-900">Buttons A1 and A2 both give crisps ✓</div>
            <div className="mt-1 text-sm text-ink-700">
              You still know exactly what you will get from each button. Nothing is ambiguous.
            </div>
          </div>
          <div className="rounded-xl border-2 border-err-600/40 bg-err-100/60 px-3 py-3">
            <div className="text-sm font-bold text-ink-900">Button B1 gives crisps or chocolate ✗</div>
            <div className="mt-1 text-sm text-ink-700">
              Now the machine cannot answer &ldquo;what does B1 give?&rdquo;. That is the failure.
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap justify-center gap-5">
          <Mapping pairs={[[1, 5], [2, 5], [3, 5]]} title="A — a function" verdict="ok" />
          <Mapping pairs={[[1, 2], [1, 3]]} title="B — not a function" verdict="bad" />
        </div>
        <p className="mt-4 text-ink-700">
          So Relation A <em>is</em> a function. Only Relation B fails, and it fails because of the
          repeated <strong>input</strong>.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(5)}>State it properly</PrimaryButton>
        </div>
      </Step>

      <Step n={5} title="One input, exactly one output" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <FormulaBox>each x → exactly one y</FormulaBox>
        <div className="space-y-2">
          {[
            ["Two inputs sharing an output", "allowed", "ok"],
            ["An input with no output", "not in the domain", "ok"],
            ["One input with two outputs", "breaks the rule", "bad"],
          ].map(([a, b, tone]) => (
            <div
              key={a}
              className={`flex flex-wrap items-center justify-between gap-2 rounded-xl border-2 px-3 py-2 ${
                tone === "ok" ? "border-ok-600/40 bg-ok-100" : "border-err-600/40 bg-err-100/60"
              }`}
            >
              <span className="text-sm text-ink-700">{a}</span>
              <span className="text-sm font-bold text-ink-900">{b}</span>
            </div>
          ))}
        </div>
        <KeyIdea>
          To check a list of pairs, scan the <strong>first</strong> coordinates only. If one value
          appears twice with different partners, it is not a function. Ignore the second coordinates
          entirely.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(6)}>What about graphs?</PrimaryButton>
        </div>
      </Step>

      <Step n={6} title="The vertical line test" open={step === 6} onOpen={() => go(6)} done={step > 6}>
        <p className="text-ink-700">
          A vertical line is a picture of a single x value. Slide one across the graph and count the
          crossings — each crossing is an output for that one input.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-5">
          <VerticalLineTest kind="parabola" testX={1.5} title="1 crossing → a function" />
          <VerticalLineTest kind="sideways" testX={2} title="2 crossings → not a function" />
        </div>
        <p className="mt-4 text-ink-700">
          If <em>every</em> vertical line crosses at most once, the graph is a function.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(7)}>The classic pair</PrimaryButton>
        </div>
      </Step>

      <Step n={7} title="y = x² and x = y²" open={step === 7} onOpen={() => go(7)} done={step > 7}>
        <div className="rounded-2xl bg-paper p-4">
          <div className="text-sm font-bold text-ink-900">
            Is <MathText text="y = x^2" /> a function?
          </div>
          <ol className="mt-2 space-y-2">
            {[
              ["Feed in x = 3", "y = 9"],
              ["Feed in x = −3", "y = 9"],
              ["Did any single input give two answers?", "no"],
              ["The output 9 is shared — is that allowed?", "yes"],
            ].map(([a, b], i) => (
              <li key={i} className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 text-sm">
                <span className="text-ink-700">
                  <span className="mr-2 font-bold text-brand-600">{i + 1}.</span>
                  <MathText text={a} />
                </span>
                <span className="shrink-0 font-bold text-ink-900">
                  <MathText text={b} />
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-center font-bold text-ok-600">Yes — it is a function.</p>
        </div>
        <div className="mt-4 rounded-2xl bg-paper p-4">
          <div className="text-sm font-bold text-ink-900">
            Is <MathText text="x = y^2" /> a function of x?
          </div>
          <ol className="mt-2 space-y-2">
            {[
              ["Feed in x = 4", "y^2 = 4"],
              ["Solve for y", "y = 2 or y = −2"],
              ["One input, how many outputs?", "2"],
            ].map(([a, b], i) => (
              <li key={i} className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 text-sm">
                <span className="text-ink-700">
                  <span className="mr-2 font-bold text-brand-600">{i + 1}.</span>
                  <MathText text={a} />
                </span>
                <span className="shrink-0 font-bold text-ink-900">
                  <MathText text={b} />
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-center font-bold text-err-600">No — it is not a function.</p>
        </div>
        <KeyIdea>
          Same two numbers, opposite verdicts. <MathText text="y = x^2" /> shares an output;{" "}
          <MathText text="x = y^2" /> splits an input.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(8)}>Your turn</PrimaryButton>
        </div>
      </Step>

      <Step n={8} title="You try one" open={step === 8} onOpen={() => go(8)} done={false}>
        <p className="text-ink-700">Here is a relation with four pairs.</p>
        <div className="my-3 text-center text-lg font-bold text-ink-900">
          {"{(1, 4), (3, 4), (6, 4), (6, 9)}"}
        </div>
        <div className="flex justify-center">
          <Mapping pairs={[[1, 4], [3, 4], [6, 4], [6, 9]]} />
        </div>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          List the first coordinates: 1, 3, 6, 6. Ignore the output 4 turning up three times — that
          is allowed.
        </div>
        <TryIt
          prompt={<>2. Which input value stops this being a function?</>}
          accept={["6"]}
          placeholder="a number"
          value={fade}
          setValue={setFade}
          hint="find the input that appears twice with two different partners."
          explain={
            <>
              The input <strong>6</strong> is paired with both 4 and 9, so the relation cannot say
              what 6 maps to. The repeated output 4 was never a problem.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Function test</div>
          <div className="mt-2">1. Look only at the inputs (first coordinates)</div>
          <div className="mt-1">2. An input repeated with different outputs → not a function</div>
          <div className="mt-1">3. On a graph: every vertical line crosses at most once</div>
        </div>
        <KeyIdea>
          💡 Repeated outputs are fine. Only a repeated input with two different outputs breaks the
          function rule.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
