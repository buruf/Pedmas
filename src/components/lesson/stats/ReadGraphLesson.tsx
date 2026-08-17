"use client";

import { useState } from "react";
import { Step, KeyIdea, WrongBox } from "@/components/lesson/Step";
import { LessonShell, TryIt } from "@/components/lesson/LessonShell";
import { BarChart, Pictograph } from "@/components/lesson/stats/StatModels";
import { PrimaryButton } from "@/components/ui";

/**
 * Picture graphs with a key.
 *
 * A pictograph is the first graph a child meets where the obvious reading is
 * the wrong one: the eye counts symbols, and the answer is symbols × key. The
 * lesson makes the key do visible work — one symbol is unpacked into the five
 * things it stands for — rather than announcing a rule about multiplying.
 */
export function PictographLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [guess, setGuess] = useState<string | null>(null);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 2 · Data · Picture Graphs"
      title="When one picture means five"
      minutes={5}
      step={step}
      total={6}
    >
      <Step n={1} title="The chart on the wall" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          Your class keeps a reading chart. Every day they add pictures for the books they finished.
        </p>
        <div className="mt-4">
          <Pictograph
            title="Books read this week"
            icon="📗"
            rows={[
              { label: "Mon", symbols: 3 },
              { label: "Tue", symbols: 5 },
              { label: "Wed", symbols: 2 },
              { label: "Thu", symbols: 4 },
            ]}
            keyValue={1}
            noun="book"
          />
        </div>
        <p className="mt-4 text-ink-700">
          With one picture for each book, this is easy. Tuesday has 5 pictures, so the class read{" "}
          <strong>5 books</strong>.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(2)}>Now the real chart</PrimaryButton></div>
      </Step>

      <Step n={2} title="The same pictures, a different key" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <p className="text-ink-700">
          Next week the class reads far more books, and there is no room for a picture each. So they
          change the little box at the bottom.
        </p>
        <div className="mt-4">
          <Pictograph
            title="Books read next week"
            icon="📗"
            rows={[
              { label: "Mon", symbols: 3 },
              { label: "Tue", symbols: 5 },
              { label: "Wed", symbols: 2 },
              { label: "Thu", symbols: 4 },
            ]}
            keyValue={5}
            noun="books"
          />
        </div>
        <p className="mt-4 text-ink-700">How many books did the class read on Tuesday?</p>
        <div className="mt-3 grid gap-2">
          {[
            { k: "a", label: "5 — there are 5 pictures" },
            { k: "b", label: "25 — something in the box changes it" },
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
            Let&rsquo;s open one picture up and see what is inside.
            <div className="mt-3"><PrimaryButton onClick={() => go(3)}>Open it up</PrimaryButton></div>
          </div>
        )}
      </Step>

      <Step n={3} title="The mistake almost everyone makes" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <WrongBox>Tuesday = 5 books &nbsp;&ldquo;because there are 5 pictures&rdquo;</WrongBox>
        <p className="text-ink-700">
          Counting the pictures is the natural thing to do, and it worked last week. But the key has
          changed what one picture <em>means</em>.
        </p>
        <div className="my-4 rounded-2xl bg-paper p-4 text-center">
          <div className="text-4xl">📗</div>
          <div className="my-2 text-sm font-bold text-brand-600">↓ this one picture stands for</div>
          <div className="text-2xl">📕 📕 📕 📕 📕</div>
          <div className="mt-2 text-sm font-semibold text-ink-700">5 real books</div>
        </div>
        <p className="text-ink-700">
          So a row of 5 pictures is 5 <em>bundles</em> of 5 books.
        </p>
        <p className="mt-3 text-center text-lg font-bold text-ok-600">5 × 5 = 25 books</p>
        <div className="mt-4"><PrimaryButton onClick={() => go(4)}>Why do they do this?</PrimaryButton></div>
      </Step>

      <Step n={4} title="A picture is a box, not a thing" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <p className="text-ink-700">
          Drawing 25 little books would take all afternoon. So the chart draws boxes of five and
          tells you the box size in the key.
        </p>
        <div className="mt-3 space-y-2">
          {[
            ["Mon", "3 pictures", "3 × 5 = 15"],
            ["Tue", "5 pictures", "5 × 5 = 25"],
            ["Wed", "2 pictures", "2 × 5 = 10"],
            ["Thu", "4 pictures", "4 × 5 = 20"],
          ].map(([a, b, c]) => (
            <div key={a} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-bold text-ink-900">{a}</span>
              <span className="text-sm text-ink-500">{b}</span>
              <span className="text-sm font-bold text-brand-700">{c}</span>
            </div>
          ))}
        </div>
        <KeyIdea>
          Read the key <strong>first</strong>, before you look at any row. It is small, it is at the
          bottom, and it decides every answer on the chart.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(5)}>Half a picture?</PrimaryButton></div>
      </Step>

      <Step n={5} title="Half a picture, half a box" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">
          A new chart, and a new key. Each ⭐ is worth <strong>10 stickers</strong>. Bea&rsquo;s row
          ends with half a star.
        </p>
        <div className="mt-3">
          <Pictograph
            title="Stickers collected"
            icon="⭐"
            rows={[
              { label: "Ali", symbols: 4 },
              { label: "Bea", symbols: 2.5 },
              { label: "Cam", symbols: 3 },
            ]}
            keyValue={10}
            noun="stickers"
          />
        </div>
        <div className="mt-3 rounded-2xl bg-paper p-4">
          <ol className="space-y-2">
            {[
              ["Bea has 2 whole stars", "2 × 10 = 20"],
              ["Plus half a star, so half of 10", "5"],
              ["Add them", "20 + 5 = 25 stickers"],
            ].map(([a, b], i) => (
              <li key={i} className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 text-sm">
                <span className="text-ink-700">
                  <span className="mr-2 font-bold text-brand-600">{i + 1}.</span>
                  {a}
                </span>
                <span className="font-bold text-ink-900">{b}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="mt-4"><PrimaryButton onClick={() => go(6)}>Your turn</PrimaryButton></div>
      </Step>

      <Step n={6} title="You try one" open={step === 6} onOpen={() => go(6)} done={false}>
        <p className="text-ink-700">
          Look at Cam&rsquo;s row on the sticker chart. Remember what one ⭐ is worth.
        </p>
        <div className="mt-3">
          <Pictograph
            title="Stickers collected"
            icon="⭐"
            rows={[
              { label: "Ali", symbols: 4 },
              { label: "Bea", symbols: 2.5 },
              { label: "Cam", symbols: 3 },
            ]}
            keyValue={10}
            noun="stickers"
          />
        </div>
        <TryIt
          prompt={<>How many stickers does Cam have?</>}
          accept={["30"]}
          placeholder="how many stickers"
          value={fade}
          setValue={setFade}
          hint="Cam has 3 stars, and each star is worth 10 — so it is a times, not a count."
          explain={
            <>
              3 × 10 = <strong>30 stickers</strong>. Cam has three stars but thirty stickers, because
              each star is a bundle of ten.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Reading a picture graph</div>
          <div className="mt-2">1. Read the key first</div>
          <div className="mt-1">2. Count the pictures in the row</div>
          <div className="mt-1">3. Multiply: pictures × the value of one picture</div>
        </div>
        <KeyIdea>
          💡 The number of pictures is almost never the answer. One picture is a bundle, and the key
          tells you how big the bundle is.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}

/**
 * Bar graphs, scales, and the axis that does not start at zero.
 *
 * Bar charts are read with the eye, not with arithmetic — which is exactly why
 * they can mislead. Two charts of identical data, one truncated and one not,
 * are shown side by side so the child sees the same numbers produce two
 * completely different impressions.
 */
export function BarGraphLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [guess, setGuess] = useState<string | null>(null);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  const stands = [
    { label: "Ana", value: 100 },
    { label: "Ben", value: 110, colour: "teal" as const },
  ];

  return (
    <LessonShell
      breadcrumb="Grade 3 · Data · Bar Graphs"
      title="Reading a bar graph properly"
      minutes={6}
      step={step}
      total={6}
    >
      <Step n={1} title="Two lemonade stands" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          Ben put this chart on his stand to show how well he is doing.
        </p>
        <div className="mt-3">
          <BarChart title="Cups sold on Saturday" bars={stands} from={90} to={115} step={5} axisWidth={30} showValues={false} />
        </div>
        <p className="mt-4 text-ink-700">How much more did Ben sell than Ana?</p>
        <div className="mt-3 grid gap-2">
          {[
            { k: "a", label: "About twice as much — his bar is twice as tall" },
            { k: "b", label: "Only a little more" },
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
            Let&rsquo;s look at the numbers up the side.
            <div className="mt-3"><PrimaryButton onClick={() => go(2)}>Look at the axis</PrimaryButton></div>
          </div>
        )}
      </Step>

      <Step n={2} title="The mistake almost everyone makes" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <WrongBox>&ldquo;Ben sold twice as much — his bar is twice as tall&rdquo;</WrongBox>
        <p className="text-ink-700">
          Comparing the bars by eye is exactly what a bar chart is for, so this is a fair thing to
          try. Now read the numbers on the side of Ben&rsquo;s chart.
        </p>
        <div className="mt-3">
          <BarChart title="Ben’s chart — starts at 90" bars={stands} from={90} to={115} step={5} axisWidth={30} />
        </div>
        <p className="mt-3 text-ink-700">
          Ana sold <strong>100</strong> cups and Ben sold <strong>110</strong>. The bottom 90 cups of
          each bar have been cut off, so only the last few cups are drawn.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(3)}>Draw it honestly</PrimaryButton></div>
      </Step>

      <Step n={3} title="The same numbers, from zero" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <div className="flex flex-wrap justify-center gap-4">
          <BarChart title="Starts at 90" bars={stands} from={90} to={115} step={5} width={230} axisWidth={30} />
          <BarChart title="Starts at 0" bars={stands} to={120} step={30} width={230} axisWidth={30} />
        </div>
        <p className="mt-4 text-ink-700">
          Same two numbers, same two stands. On the honest chart the bars are almost the same height,
          because 110 really is only a little more than 100.
        </p>
        <KeyIdea>
          A bar is <strong>a length standing for a number</strong>. A length only measures the whole
          number if it starts from zero. Cut the bottom off and the picture stops telling the truth,
          even though every number on it is correct.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(4)}>What else can hide?</PrimaryButton></div>
      </Step>

      <Step n={4} title="What is one step worth?" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <p className="text-ink-700">
          The second thing to check is the gaps between the numbers. On this chart the lines go up in{" "}
          <strong>fives</strong>, not ones.
        </p>
        <div className="mt-3">
          <BarChart
            title="Books borrowed"
            bars={[
              { label: "Mon", value: 15 },
              { label: "Tue", value: 25 },
              { label: "Wed", value: 10 },
              { label: "Thu", value: 20 },
            ]}
            to={30}
            step={5}
            showValues={false}
          />
        </div>
        <p className="mt-3 text-ink-700">
          Tuesday&rsquo;s bar reaches the fifth line up. Counting lines gives 5. But each line is
          worth 5 books, so:
        </p>
        <p className="mt-2 text-center text-lg font-bold text-ok-600">5 lines × 5 books = 25 books</p>
        <KeyIdea>
          Counting gridlines answers a different question — &ldquo;how many lines?&rdquo; — from the
          one being asked. Read the number printed beside the line instead.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(5)}>Use it</PrimaryButton></div>
      </Step>

      <Step n={5} title="Comparing two bars" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">
          How many more books were borrowed on Tuesday than on Wednesday?
        </p>
        <div className="mt-3 rounded-2xl bg-paper p-4">
          <ol className="space-y-2">
            {[
              ["Read Tuesday against the axis", "25"],
              ["Read Wednesday against the axis", "10"],
              ["Subtract", "25 − 10 = 15 books"],
            ].map(([a, b], i) => (
              <li key={i} className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 text-sm">
                <span className="text-ink-700">
                  <span className="mr-2 font-bold text-brand-600">{i + 1}.</span>
                  {a}
                </span>
                <span className="font-bold text-ink-900">{b}</span>
              </li>
            ))}
          </ol>
        </div>
        <p className="mt-3 text-ink-700">
          Tuesday&rsquo;s bar is 3 lines taller than Wednesday&rsquo;s, and 3 × 5 = 15 — the same
          answer, arrived at the other way round.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(6)}>Your turn</PrimaryButton></div>
      </Step>

      <Step n={6} title="You try one" open={step === 6} onOpen={() => go(6)} done={false}>
        <p className="text-ink-700">A new chart. Check where the axis starts and what one step is worth.</p>
        <div className="mt-3">
          <BarChart
            title="Cans collected"
            bars={[
              { label: "3A", value: 40, colour: "amber" },
              { label: "3B", value: 70, colour: "amber" },
              { label: "3C", value: 30, colour: "amber" },
            ]}
            to={80}
            step={10}
            showValues={false}
          />
        </div>
        <TryIt
          prompt={<>How many cans did class 3B collect?</>}
          accept={["70"]}
          placeholder="how many cans"
          value={fade}
          setValue={setFade}
          hint="the bar reaches the seventh line, and each line is worth 10."
          explain={
            <>
              <strong>70 cans</strong>. Seven lines up, each worth 10. If you had counted lines you
              would have said 7 — the axis is what turns that into 70.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Reading a bar graph</div>
          <div className="mt-2">1. Where does the axis start? Zero or not?</div>
          <div className="mt-1">2. What is one step on the axis worth?</div>
          <div className="mt-1">3. Read each bar against the numbers, not against the other bars</div>
        </div>
        <KeyIdea>
          💡 Trust the axis, not the shape. A chart can make a small difference look enormous just by
          starting somewhere other than zero.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
