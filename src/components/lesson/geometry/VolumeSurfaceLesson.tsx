"use client";

import { useState } from "react";
import { Step, KeyIdea, FormulaBox, WrongBox } from "@/components/lesson/Step";
import { LessonShell, EstimateCheck, TryIt } from "@/components/lesson/LessonShell";
import { PrimaryButton } from "@/components/ui";
import { MathText } from "@/components/MathText";
import { BoxFig, NetFig, FigRow } from "./GeoModels";

/**
 * Volume.
 *
 * Built by counting a layer and then stacking layers, so `l × w × h` arrives
 * as a shortcut for something already counted. The unit is treated as part of
 * the mathematics rather than decoration: three lengths multiplied give cubes,
 * and cm³ is the word for that.
 */
export function VolumeLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 5 · Geometry · Volume"
      title="How much fits inside?"
      minutes={5}
      step={step}
      total={6}
    >
      <Step n={1} title="Sugar cubes in a box" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          A small box is <strong>4 cm</strong> long, <strong>3 cm</strong> wide and{" "}
          <strong>2 cm</strong> tall. You are filling it with 1 cm sugar cubes.
        </p>
        <div className="mt-3">
          <BoxFig l={4} w={3} h={2} cubes />
        </div>
        <p className="mt-3 text-ink-700">How many cubes fit? Don&rsquo;t guess — count a layer.</p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(2)}>Count a layer</PrimaryButton>
        </div>
      </Step>

      <Step n={2} title="One layer, then stack it" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <p className="text-ink-700">
          The bottom layer is just a rectangle of cubes: 4 along and 3 back.
        </p>
        <div className="mt-3 rounded-2xl bg-paper p-4">
          <ol className="space-y-2">
            {[
              ["Cubes in the bottom layer", "4 * 3 = 12"],
              ["The box is 2 cm tall, so it holds 2 layers", "12 * 2 = 24"],
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
        <p className="mt-3 text-center text-lg font-bold text-ok-600">
          24 cubes — the volume is 24 cm<MathText text="^3" />
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(3)}>Why the little 3?</PrimaryButton>
        </div>
      </Step>

      <Step n={3} title="The mistake almost everyone makes" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <WrongBox>
          the volume is 24 cm<MathText text="^2" />
        </WrongBox>
        <p className="text-ink-700">
          Lots of people write <MathText text="cm^2" /> here, or drop the unit altogether. But the
          little number is not decoration — it counts how many lengths you multiplied.
        </p>
        <div className="mt-3 space-y-2">
          {[
            ["cm", "one length", "how long a piece of string is"],
            ["cm²", "two lengths multiplied", "how many squares tile a floor"],
            ["cm³", "three lengths multiplied", "how many cubes fill a box"],
          ].map(([a, b, c]) => (
            <div key={a} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-bold text-ink-900">{a}</span>
              <span className="text-sm text-brand-700">{b}</span>
              <span className="text-sm text-ink-500">{c}</span>
            </div>
          ))}
        </div>
        <KeyIdea>
          You multiplied <MathText text="4 * 3 * 2" /> — three lengths — so the answer counts{" "}
          <strong>cubes</strong>, and cubes are written <MathText text="cm^3" />.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(4)}>The shortcut</PrimaryButton>
        </div>
      </Step>

      <Step n={4} title="You never have to count again" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <p className="text-ink-700">
          &ldquo;Cubes in a layer, times the number of layers&rdquo; is exactly length &times; width
          &times; height. That is the whole formula, and it is only a summary of the counting you
          just did.
        </p>
        <FormulaBox>
          Volume = length &times; width &times; height
        </FormulaBox>
        <p className="text-ink-700">
          The order does not matter. Turn the box on its side and{" "}
          <MathText text="2 * 4 * 3" /> gives 24 as well — the same cubes, counted from a different
          direction.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(5)}>A worked example</PrimaryButton>
        </div>
      </Step>

      <Step n={5} title="A worked example" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">
          A crate is <strong>5 cm</strong> by <strong>4 cm</strong> by <strong>3 cm</strong>. What
          is its volume?
        </p>
        <div className="mt-3">
          <BoxFig l={5} w={4} h={3} cubes colour="#0d9488" />
        </div>
        <div className="mt-3 rounded-2xl bg-paper p-4">
          <ol className="space-y-2">
            {[
              ["Bottom layer", "5 * 4 = 20 cubes"],
              ["Three layers high", "20 * 3 = 60"],
              ["Three lengths multiplied, so cubes", "60 cm^3"],
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
        <EstimateCheck>
          A cube each way would be about 4 cm, and <MathText text="4 * 4 * 4 = 64" />. 60 sits right
          next to it, so the answer is the right size.
        </EstimateCheck>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(6)}>Your turn</PrimaryButton>
        </div>
      </Step>

      <Step n={6} title="You try one" open={step === 6} onOpen={() => go(6)} done={false}>
        <p className="text-ink-700">
          A drawer is <strong>6 cm</strong> long, <strong>2 cm</strong> wide and{" "}
          <strong>4 cm</strong> deep.
        </p>
        <div className="mt-3">
          <BoxFig l={6} w={2} h={4} cubes />
        </div>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          One layer holds <MathText text="6 * 2 = 12" /> cubes, and there are 4 layers.
        </div>
        <TryIt
          prompt={<>2. How many cubic centimetres does the drawer hold?</>}
          accept={["48"]}
          placeholder="like 24"
          value={fade}
          setValue={setFade}
          hint="12 cubes in a layer, four layers high — multiply."
          explain={
            <>
              <MathText text="6 * 2 * 4 = 48" />, so the volume is <strong>48 cm³</strong>. Three
              lengths multiplied, so the unit is cubed.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Volume of a box</div>
          <div className="mt-2">1. Cubes in one layer = length &times; width</div>
          <div className="mt-1">2. Multiply by the height for all the layers</div>
          <div className="mt-1">3. Three lengths multiplied &rarr; answer in cm³</div>
        </div>
        <KeyIdea>
          💡 Volume answers &ldquo;how much fits inside&rdquo;, and it is always measured in cubes:
          cm³, m³, mm³.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}

/**
 * Surface area.
 *
 * The misconception is not arithmetic, it is that "surface area" and "volume"
 * both sound like size. Wrapping paper versus the space inside separates them
 * physically, and the net turns six faces into three pairs you can see rather
 * than a formula to remember.
 */
export function SurfaceAreaLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 6 · Geometry · Surface Area"
      title="Wrapping a box, not filling it"
      minutes={6}
      step={step}
      total={6}
    >
      <Step n={1} title="Two different shopping lists" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          Same box, two different jobs. You need <strong>rice</strong> to fill it, and{" "}
          <strong>wrapping paper</strong> to cover it.
        </p>
        <div className="mt-3">
          <BoxFig l={5} w={3} h={2} />
        </div>
        <div className="mt-3 space-y-2">
          <div className="rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
            🍚 Rice fills the inside &rarr; that is <strong>volume</strong>, measured in cm³.
          </div>
          <div className="rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
            🎁 Paper covers the outside &rarr; that is <strong>surface area</strong>, measured in
            cm².
          </div>
        </div>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(2)}>Work out the paper</PrimaryButton>
        </div>
      </Step>

      <Step n={2} title="The mistake almost everyone makes" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <WrongBox>
          paper needed = 5 &times; 3 &times; 2 = 30 cm<MathText text="^2" />
        </WrongBox>
        <p className="text-ink-700">
          It is the formula that comes to mind first, because it is the one you already know. But{" "}
          <MathText text="5 * 3 * 2" /> is the <em>rice</em> — 30 cm³ of space inside. Paper never
          goes inside a box.
        </p>
        <p className="mt-3 text-ink-700">
          Paper lies flat on faces. So cut the box open and lay it out flat.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(3)}>Cut it open</PrimaryButton>
        </div>
      </Step>

      <Step n={3} title="Six faces, in three matching pairs" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">
          Flattened out, the box is six rectangles. The number inside each one is its area in cm².
        </p>
        <div className="mt-3">
          <NetFig l={5} w={3} h={2} caption="the net of a 5 by 3 by 2 box" />
        </div>
        <p className="mt-3 text-ink-700">
          Notice they come in <strong>pairs</strong>: top matches bottom, front matches back, left
          matches right. Opposite faces of a box are always identical.
        </p>
        <div className="mt-3 rounded-2xl bg-paper p-4">
          <ol className="space-y-2">
            {[
              ["Top and bottom", "2 * (5 * 3) = 30"],
              ["Front and back", "2 * (5 * 2) = 20"],
              ["The two ends", "2 * (3 * 2) = 12"],
              ["Add them all", "30 + 20 + 12 = 62 cm^2"],
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
        <p className="mt-3 text-center text-lg font-bold text-ok-600">
          62 cm<MathText text="^2" /> of paper — and 30 cm<MathText text="^3" /> of rice.
        </p>
        <KeyIdea>
          Different question, different method, different unit. Areas are <em>added</em> because you
          are collecting flat pieces; volume is <em>multiplied</em> because you are stacking layers.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(4)}>The cube case</PrimaryButton>
        </div>
      </Step>

      <Step n={4} title="A cube makes it obvious" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <p className="text-ink-700">
          A cube with <strong>4 cm</strong> edges. Every face is the same square, so there is only
          one area to work out.
        </p>
        <FigRow>
          <BoxFig l={4} w={4} h={4} cubes colour="#0d9488" caption="volume: 4 * 4 * 4 = 64 cm^3" />
          <NetFig l={4} w={4} h={4} caption="surface: 6 faces of 16 cm^2" />
        </FigRow>
        <div className="mt-3 space-y-2">
          <div className="rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
            One face: <MathText text="4 * 4 = 16" /> cm<MathText text="^2" />. Six faces:{" "}
            <MathText text="6 * 16 = 96" /> cm<MathText text="^2" />.
          </div>
          <div className="rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
            Volume: <MathText text="4 * 4 * 4 = 64" /> cm<MathText text="^3" />.
          </div>
        </div>
        <p className="mt-3 text-ink-700">
          96 and 64 for the very same cube. If the two answers ever come out identical, that is a
          signal to check which question you actually answered.
        </p>
        <FormulaBox>
          <div>Cube surface area = 6 &times; edge &times; edge</div>
          <div className="mt-2 text-base">Box = 2(lw + lh + wh)</div>
        </FormulaBox>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(5)}>A worked example</PrimaryButton>
        </div>
      </Step>

      <Step n={5} title="A worked example" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">
          A tin is <strong>7 cm</strong> by <strong>3 cm</strong> by <strong>2 cm</strong>. How much
          label paper covers it completely?
        </p>
        <div className="mt-3">
          <NetFig l={7} w={3} h={2} />
        </div>
        <div className="mt-3 rounded-2xl bg-paper p-4">
          <ol className="space-y-2">
            {[
              ["Top and bottom: 7 * 3 = 21 each", "2 * 21 = 42"],
              ["Front and back: 7 * 2 = 14 each", "2 * 14 = 28"],
              ["The two ends: 3 * 2 = 6 each", "2 * 6 = 12"],
              ["Total", "42 + 28 + 12 = 82 cm^2"],
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
        <EstimateCheck>
          Six faces, the biggest 21 cm². Six of the biggest would be 126 cm², so 82 cm² is a
          believable total. A &ldquo;42 cm²&rdquo; would have been too small to cover it.
        </EstimateCheck>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(6)}>Your turn</PrimaryButton>
        </div>
      </Step>

      <Step n={6} title="You try one" open={step === 6} onOpen={() => go(6)} done={false}>
        <p className="text-ink-700">
          A gift box is <strong>6 cm</strong> by <strong>4 cm</strong> by <strong>2 cm</strong>.
        </p>
        <div className="mt-3">
          <NetFig l={6} w={4} h={2} />
        </div>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          The three different faces are <MathText text="6 * 4 = 24" />, <MathText text="6 * 2 = 12" />{" "}
          and <MathText text="4 * 2 = 8" /> cm<MathText text="^2" />. Together that is 44 cm
          <MathText text="^2" />.
        </div>
        <TryIt
          prompt={<>2. There are two of each face. How much paper covers the whole box, in cm²?</>}
          accept={["88"]}
          placeholder="like 62"
          value={fade}
          setValue={setFade}
          hint="every face has a twin on the opposite side, so double the 44."
          explain={
            <>
              <MathText text="2 * 44 = 88" />, so the surface area is <strong>88 cm²</strong>. (The
              volume of the same box is <MathText text="6 * 4 * 2 = 48" /> cm³ — a different
              question with a different unit.)
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Surface area of a box</div>
          <div className="mt-2">1. Wrapping, not filling — think paper</div>
          <div className="mt-1">2. Work out the three different faces</div>
          <div className="mt-1">3. Double each one, because faces come in pairs</div>
          <div className="mt-1">4. Add them up. Answer in cm²</div>
        </div>
        <KeyIdea>
          💡 Volume multiplies three lengths and gives cm³. Surface area adds up flat faces and
          gives cm². The unit is the fastest check you have.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
