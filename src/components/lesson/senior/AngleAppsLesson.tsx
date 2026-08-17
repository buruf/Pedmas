"use client";

import { useState } from "react";
import { MathText } from "@/components/MathText";
import { Step, KeyIdea, FormulaBox, WrongBox } from "@/components/lesson/Step";
import { LessonShell, EstimateCheck, TryIt } from "@/components/lesson/LessonShell";
import { PrimaryButton } from "@/components/ui";

/**
 * An angle of elevation measured from an observer's eye, with the eye height
 * drawn as a separate strip below the triangle. The strip is deliberately
 * exaggerated: the whole point of the picture is that the triangle stops at
 * eye level and something is left over underneath.
 */
function ElevationDiagram() {
  const W = 300;
  const H = 205;
  const ground = 176;
  const eye = 158;
  const obs = 44;
  const tower = 252;
  const top = 44;
  return (
    <figure className="m-0">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style={{ maxWidth: W }}
        role="img"
        aria-label="an observer sighting the top of a tower, with the eye height marked below the triangle"
      >
        <line x1={10} y1={ground} x2={W - 8} y2={ground} stroke="#94a3b8" strokeWidth="1.6" />
        <line x1={tower} y1={ground} x2={tower} y2={top} stroke="#334155" strokeWidth="4" />
        <line x1={obs} y1={ground} x2={obs} y2={eye} stroke="#334155" strokeWidth="3" />
        <circle cx={obs} cy={eye - 4} r="4.5" fill="#334155" />
        <line x1={obs} y1={eye} x2={tower} y2={eye} stroke="#0d9488" strokeWidth="1.6" strokeDasharray="6 4" />
        <line x1={obs} y1={eye} x2={tower} y2={top} stroke="#7c3aed" strokeWidth="2.4" />
        <path d={`M ${obs + 34} ${eye} A 34 34 0 0 0 ${obs + 29.8} ${eye - 16.3}`} fill="none" stroke="#dc2626" strokeWidth="1.6" />
        <text x={obs + 40} y={eye - 3} fontSize="10" fontWeight="700" fill="#dc2626">
          θ
        </text>
        <text x={(obs + tower) / 2 - 16} y={eye + 14} fontSize="10" fontWeight="700" fill="#0d9488">
          40 m
        </text>
        <text x={tower + 5} y={(eye + top) / 2} fontSize="10" fontWeight="700" fill="#7c3aed">
          30 m
        </text>
        <line x1={tower + 22} y1={eye} x2={tower + 22} y2={ground} stroke="#f59e0b" strokeWidth="1.6" />
        <text x={tower - 44} y={ground - 4} fontSize="10" fontWeight="700" fill="#f59e0b">
          1.5 m
        </text>
        <text x={10} y={20} fontSize="10" fontWeight="700" fill="#6b7280">
          the triangle starts at eye level — not at the ground
        </text>
        <text x={10} y={H - 4} fontSize="9" fill="#9ca3af">
          not to scale
        </text>
      </svg>
    </figure>
  );
}

/**
 * An angle of depression at the top of a cliff, with the equal angle of
 * elevation at the boat marked, so the alternate-angle argument is visible.
 */
function DepressionDiagram() {
  const W = 300;
  const H = 200;
  const sea = 172;
  const cliffX = 52;
  const cliffTop = 42;
  const boat = 258;
  return (
    <figure className="m-0">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style={{ maxWidth: W }}
        role="img"
        aria-label="a line of sight from a cliff top down to a boat, with the depression angle at the top equal to the elevation angle at the boat"
      >
        <rect x={26} y={cliffTop} width={cliffX - 26} height={sea - cliffTop} fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.2" />
        <line x1={cliffX} y1={sea} x2={W - 8} y2={sea} stroke="#94a3b8" strokeWidth="1.6" />
        <line x1={cliffX} y1={cliffTop} x2={W - 20} y2={cliffTop} stroke="#0d9488" strokeWidth="1.6" strokeDasharray="6 4" />
        <line x1={cliffX} y1={cliffTop} x2={boat} y2={sea} stroke="#7c3aed" strokeWidth="2.4" />
        <line x1={cliffX} y1={cliffTop} x2={cliffX} y2={sea} stroke="#334155" strokeWidth="2" strokeDasharray="4 3" />
        <path d={`M ${cliffX + 40} ${cliffTop} A 40 40 0 0 1 ${cliffX + 33.9} ${cliffTop + 21.2}`} fill="none" stroke="#dc2626" strokeWidth="1.6" />
        <text x={cliffX + 46} y={cliffTop + 15} fontSize="10" fontWeight="700" fill="#dc2626">
          30° depression
        </text>
        <path d={`M ${boat - 40} ${sea} A 40 40 0 0 1 ${boat - 33.9} ${sea - 21.2}`} fill="none" stroke="#dc2626" strokeWidth="1.6" />
        <text x={boat - 96} y={sea - 6} fontSize="10" fontWeight="700" fill="#dc2626">
          30° elevation
        </text>
        <text x={12} y={(cliffTop + sea) / 2} fontSize="10" fontWeight="700" fill="#334155">
          120 m
        </text>
        <ellipse cx={boat} cy={sea - 4} rx="10" ry="4" fill="#334155" />
        <text x={cliffX + 66} y={sea + 14} fontSize="10" fontWeight="700" fill="#6b7280">
          distance = ?
        </text>
      </svg>
    </figure>
  );
}

/**
 * Angles of elevation and depression.
 *
 * Two errors are confronted. Students place the depression angle inside the
 * triangle at the wrong vertex, and they answer with the height above eye
 * level instead of the height of the object. Both are fixed by insisting the
 * triangle is drawn and labelled before any trigonometry starts.
 */
export function AngleAppsLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 10 · Trigonometry · Elevation and depression"
      title="Measuring things you cannot reach"
      minutes={8}
      step={step}
      total={7}
    >
      <Step n={1} title="How tall is that tower?" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          You cannot climb it and you cannot lay a tape measure up its side. But you can stand back,
          measure how far away you are, and measure the angle you have to tilt your head.
        </p>
        <p className="mt-3 text-ink-700">
          Those two measurements are enough. That is the entire idea behind surveying, and behind
          every elevation question you will be set.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(2)}>The ratio you need</PrimaryButton>
        </div>
      </Step>

      <Step n={2} title="Tangent links a height to a distance" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <p className="text-ink-700">
          In a right-angled triangle, the tangent of an angle is the side opposite it divided by the
          side next to it.
        </p>
        <FormulaBox>
          <MathText text="tan θ = {opposite/adjacent}" />
        </FormulaBox>
        <p className="text-ink-700">
          Rearranged for the two questions you will actually be asked:
        </p>
        <div className="mt-3 space-y-2">
          {[
            ["Height unknown", "height = distance * tan θ", "multiply"],
            ["Distance unknown", "distance = {height/tan θ}", "divide"],
          ].map(([a, b, c]) => (
            <div key={a} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-bold text-ink-900">{a}</span>
              <span className="text-sm font-bold text-brand-700">
                <MathText text={b} />
              </span>
              <span className="text-xs text-ink-500">{c}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-ink-700">
          One value is worth memorising: <MathText text="tan 45° = 1" /> exactly. So a 45° sightline
          means the height and the distance are equal — stand 60 m from a tower and see the top at
          45°, and the tower rises 60 m above your eye.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(3)}>The new problem</PrimaryButton>
        </div>
      </Step>

      <Step n={3} title="A surveyor measures a tower" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">
          A surveyor stands 40 m from the base of a tower. Her instrument sits{" "}
          <strong>1.5 m above the ground</strong>. Sighting the top, she records an angle of
          elevation <MathText text="θ" /> with <MathText text="tan θ = {3/4}" />.
        </p>
        <p className="mt-3 text-ink-700">How tall is the tower?</p>
        <EstimateCheck>
          The sightline rises 3 m for every 4 m across, so over 40 m it should climb about 30 m. The
          answer must be a little more than 30 — never less.
        </EstimateCheck>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(4)}>Where it goes wrong</PrimaryButton>
        </div>
      </Step>

      <Step n={4} title="The two mistakes almost everyone makes" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <WrongBox>
          <MathText text="height = 40 * {3/4} = 30 m" /> &nbsp;— so the tower is 30 m tall
        </WrongBox>
        <p className="text-ink-700">
          The arithmetic is perfect. The answer is still wrong, because the triangle does not start
          at the ground. It starts at the surveyor&rsquo;s eye.
        </p>
        <div className="mt-4">
          <ElevationDiagram />
        </div>
        <p className="mt-3 text-ink-700">
          The 30 m is the height of the tower <em>above eye level</em>. There is another 1.5 m of
          tower underneath the dashed line that the triangle never saw. The tower is{" "}
          <MathText text="30 + 1.5 = 31.5 m" /> tall.
        </p>

        <WrongBox>
          An angle of depression is measured at the <strong>bottom</strong>, going up
        </WrongBox>
        <p className="text-ink-700">
          The two words describe where you are standing, not what you are looking at.{" "}
          <strong>Elevation</strong> is measured at the lower point, from the horizontal, looking
          up. <strong>Depression</strong> is measured at the higher point, from the horizontal,
          looking down. Both are measured from a <em>horizontal</em> line — never from the vertical.
        </p>
        <div className="mt-4">
          <DepressionDiagram />
        </div>
        <p className="mt-3 text-ink-700">
          Here is the useful consequence. The horizontal at the cliff top and the sea are parallel,
          so the depression angle at the top and the elevation angle at the boat are alternate
          angles — <strong>equal</strong>. That is why you can move a depression angle down into the
          triangle at the boat and carry on as normal.
        </p>
        <KeyIdea>
          Draw the picture before you touch the calculator. Mark the horizontal, mark the angle
          against it, and mark anything the triangle leaves out underneath.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(5)}>Finish the tower</PrimaryButton>
        </div>
      </Step>

      <Step n={5} title="Worked example: the tower" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <div className="rounded-2xl bg-paper p-4">
          <ol className="space-y-2">
            {[
              ["The triangle sits above eye level", "adjacent = 40 m"],
              ["tan θ = {3/4}, so opposite = 40 * {3/4}", "30 m"],
              ["That is the height ABOVE the instrument", "30 m"],
              ["Add the instrument height", "30 + 1.5"],
              ["Height of the tower", "31.5 m"],
            ].map(([a, b], i) => (
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
          <p className="mt-2 text-sm text-ink-700">
            The estimate said &ldquo;a little more than 30&rdquo;, and 31.5 is exactly that ✓
          </p>
        </div>
        <p className="mt-3 text-ink-700">
          The moment you can skip the last step is when the question says the angle was measured{" "}
          <em>from the ground</em>, or gives you no observer height at all. Read for it every time.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(6)}>A depression question</PrimaryButton>
        </div>
      </Step>

      <Step n={6} title="Worked example: the boat" open={step === 6} onOpen={() => go(6)} done={step > 6}>
        <p className="text-ink-700">
          From the top of a 120 m cliff, the angle of depression of a boat is 30°. How far is the
          boat from the base of the cliff?
        </p>
        <div className="mt-3 rounded-2xl bg-paper p-4">
          <ol className="space-y-2">
            {[
              ["Move the angle down to the boat (alternate angles)", "elevation = 30°"],
              ["Opposite the angle is the cliff", "120 m"],
              ["tan 30° = {120/distance}", "rearrange"],
              ["distance = 120 ÷ tan 30°", "≈ 207.8 m"],
            ].map(([a, b], i) => (
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
        <p className="mt-3 text-ink-700">
          A very common slip here is to multiply instead of divide, giving{" "}
          <MathText text="120 * tan 30° ≈ 69.3 m" />. Catch it with common sense: 30° is a{" "}
          <strong>shallow</strong> look downwards, so the boat must be well out to sea — further
          away than the cliff is tall. 69.3 m is closer than 120 m, so it cannot be right. 207.8 m
          can.
        </p>
        <KeyIdea>
          Shallow angle, far away. Steep angle, close in. One glance at the angle tells you whether
          your answer should be bigger or smaller than the height you started with.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(7)}>Your turn</PrimaryButton>
        </div>
      </Step>

      <Step n={7} title="You try one" open={step === 7} onOpen={() => go(7)} done={false}>
        <p className="text-ink-700">
          A student stands 60 m from a mast, holding a clinometer{" "}
          <strong>1.8 m above the ground</strong>. The angle of elevation of the top satisfies{" "}
          <MathText text="tan θ = {4/3}" />. How tall is the mast, in metres?
        </p>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          Above the clinometer, the mast rises{" "}
          <MathText text="60 * {4/3} = 80 m" className="font-bold" />.
        </div>
        <TryIt
          prompt={<>2. Now finish the job. How tall is the mast altogether, in metres?</>}
          accept={["81.8"]}
          placeholder="like 12.5"
          value={fade}
          setValue={setFade}
          hint="the triangle only measured from 1.8 m upwards. Something is still missing underneath."
          explain={
            <>
              The mast is <strong>81.8 m</strong> tall: <MathText text="80 + 1.8" />. Answering 80
              would have described the part of the mast the student could see above eye level, not
              the mast. Notice the sightline is steeper than 45° here (
              <MathText text="{4/3} > 1" />
              ), so the height beats the 60 m distance — as it should.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Elevation and depression</div>
          <div className="mt-2">1. Draw it, and draw the horizontal the angle is measured from</div>
          <div className="mt-1">2. Elevation looks up from below; depression looks down from above</div>
          <div className="mt-1">3. They are equal — alternate angles between two horizontals</div>
          <div className="mt-1">4. Add back the observer&rsquo;s height at the end</div>
        </div>
        <KeyIdea>
          💡 The triangle only knows about eye level. Whatever sits below the observer&rsquo;s eye
          has to be put back by hand.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
