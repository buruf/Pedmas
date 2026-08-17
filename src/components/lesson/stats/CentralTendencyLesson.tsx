"use client";

import { useState } from "react";
import { Step, KeyIdea, FormulaBox, WrongBox } from "@/components/lesson/Step";
import { LessonShell, TryIt } from "@/components/lesson/LessonShell";
import { BarChart, DotPlot, ValueStrip } from "@/components/lesson/stats/StatModels";
import { PrimaryButton } from "@/components/ui";

/**
 * Mean, median and mode.
 *
 * Three different answers to "what is a typical value?", taught as three
 * different questions rather than three formulas. The confrontation is the
 * single most common mechanical error in the whole strand: taking the middle
 * of the list as written instead of ordering the data first. The data is laid
 * out so the unordered middle (8) and the true median (6) disagree, which is
 * the only way to prove the step matters.
 */
export function MeanMedianModeLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [guess, setGuess] = useState<string | null>(null);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  const raw = [13, 4, 8, 4, 6];
  const sorted = [4, 4, 6, 8, 13];

  return (
    <LessonShell
      breadcrumb="Grade 5 · Data · Mean, Median & Mode"
      title="Three ways to say “typical”"
      minutes={6}
      step={step}
      total={7}
    >
      <Step n={1} title="Five friends, one question" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          Five friends each took 20 free throws. This is how many they made.
        </p>
        <div className="mt-4">
          <BarChart
            title="Free throws made (out of 20)"
            bars={[
              { label: "Ana", value: 13 },
              { label: "Ben", value: 4 },
              { label: "Cal", value: 8 },
              { label: "Dee", value: 4 },
              { label: "Eli", value: 6 },
            ]}
            to={16}
            step={4}
          />
        </div>
        <p className="mt-4 text-ink-700">
          Their coach wants <strong>one number</strong> that describes the whole group. There are
          three sensible answers, and they are not the same number.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(2)}>Start with sharing</PrimaryButton></div>
      </Step>

      <Step n={2} title="Share it out equally" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <p className="text-ink-700">
          You already know how to share. Pour all 35 shots into one pile and give everyone the same
          amount back.
        </p>
        <div className="mt-4 rounded-2xl bg-paper p-4">
          <ol className="space-y-2">
            {[
              ["Add every value", "13 + 4 + 8 + 4 + 6 = 35"],
              ["Count how many friends", "5"],
              ["Share the total equally", "35 ÷ 5 = 7"],
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
        <div className="mt-4 flex flex-wrap justify-center gap-4">
          <BarChart
            title="What really happened"
            bars={[
              { label: "Ana", value: 13 },
              { label: "Ben", value: 4 },
              { label: "Cal", value: 8 },
              { label: "Dee", value: 4 },
              { label: "Eli", value: 6 },
            ]}
            to={16}
            step={4}
            meanLine={7}
            width={250}
          />
          <BarChart
            title="If they shared"
            bars={[
              { label: "Ana", value: 7, colour: "teal" },
              { label: "Ben", value: 7, colour: "teal" },
              { label: "Cal", value: 7, colour: "teal" },
              { label: "Dee", value: 7, colour: "teal" },
              { label: "Eli", value: 7, colour: "teal" },
            ]}
            to={16}
            step={4}
            width={250}
          />
        </div>
        <KeyIdea>
          That is the <strong>mean</strong>: the height every bar would have if you levelled them
          off. The tall bar pays for the short ones.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(3)}>A different middle</PrimaryButton></div>
      </Step>

      <Step n={3} title="The one in the middle" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">
          The second answer is the <strong>median</strong>: the value in the middle of the group.
          Here are the five scores again, written in the order the coach wrote them down.
        </p>
        <ValueStrip values={raw} />
        <p className="mt-3 text-ink-700">Which one is the middle?</p>
        <div className="mt-3 grid gap-2">
          {[
            { k: "a", label: "8 — it is the third of the five" },
            { k: "b", label: "6 — something else is going on" },
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
            Let&rsquo;s line the friends up and look.
            <div className="mt-3"><PrimaryButton onClick={() => go(4)}>Line them up</PrimaryButton></div>
          </div>
        )}
      </Step>

      <Step n={4} title="The mistake almost everyone makes" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <WrongBox>median = 8 &nbsp;&ldquo;because it is the third one written down&rdquo;</WrongBox>
        <p className="text-ink-700">
          The order the coach wrote them in is just the order the friends took their turns. It says
          nothing about who is in the middle. Sort them smallest to largest and the middle moves.
        </p>
        <ValueStrip values={raw} middle={2} tone="rose" label="As written — the third one is 8" />
        <ValueStrip values={sorted} middle={2} label="In order — the third one is 6" />
        <p className="mt-3 text-center text-lg font-bold text-ok-600">The median is 6.</p>
        <KeyIdea>
          The median is a <strong>position</strong>, not a calculation. A position only means
          something once the values are lined up in order — so ordering is not a tidy-up step you
          can skip, it is the whole method.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(5)}>And the third way?</PrimaryButton></div>
      </Step>

      <Step n={5} title="The one that happens most" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">
          The last answer is the <strong>mode</strong>: the value that turns up most often. Stack
          the scores and look for the tallest pile.
        </p>
        <div className="mt-3">
          <DotPlot
            title="How many friends made each score"
            from={4}
            to={13}
            counts={[2, 0, 1, 0, 1, 0, 0, 0, 0, 1]}
            highlight={4}
            axisLabel="free throws made"
          />
        </div>
        <p className="mt-2 text-center font-bold text-ok-600">The mode is 4 — two friends made 4.</p>
        <KeyIdea>
          Watch the direction you read in. The <em>value</em> lives along the bottom; how
          <em> often</em> it happened is the height of the stack. The mode is 4, not 2.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(6)}>All three at once</PrimaryButton></div>
      </Step>

      <Step n={6} title="All three, one data set" open={step === 6} onOpen={() => go(6)} done={step > 6}>
        <p className="text-ink-700">
          A new set of scores: <strong>9, 3, 6, 3, 4</strong>. Find all three.
        </p>
        <div className="mt-4 rounded-2xl bg-paper p-4">
          <ol className="space-y-2">
            {[
              ["Mean: add, then divide by 5", "9 + 3 + 6 + 3 + 4 = 25, and 25 ÷ 5 = 5"],
              ["Median: order first", "3, 3, 4, 6, 9 → the middle is 4"],
              ["Mode: which repeats?", "3 appears twice → 3"],
            ].map(([a, b], i) => (
              <li key={i} className="rounded-xl bg-white px-3 py-2 text-sm">
                <span className="mr-2 font-bold text-brand-600">{i + 1}.</span>
                <span className="text-ink-700">{a}</span>
                <div className="mt-0.5 font-bold text-ink-900">{b}</div>
              </li>
            ))}
          </ol>
        </div>
        <ValueStrip values={[3, 3, 4, 6, 9]} middle={2} label="In order" />
        <p className="mt-2 text-ink-700">
          Mean 5, median 4, mode 3 — three different numbers, all correct, all answering slightly
          different questions.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(7)}>Your turn</PrimaryButton></div>
      </Step>

      <Step n={7} title="You try one" open={step === 7} onOpen={() => go(7)} done={false}>
        <p className="text-ink-700">
          Five scores were written down in this order: <strong>8, 3, 11, 5, 3</strong>.
        </p>
        <ValueStrip values={[8, 3, 11, 5, 3]} />
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          Before anything else, put them in order: <strong>3, 3, 5, 8, 11</strong>.
        </div>
        <TryIt
          prompt={<>2. Now read off the middle one. What is the median?</>}
          accept={["5"]}
          placeholder="the median"
          value={fade}
          setValue={setFade}
          hint="count in from both ends of the ordered list until you meet in the middle."
          explain={
            <>
              The median is <strong>5</strong>. Two values sit below it and two sit above it. Notice
              the middle of the list <em>as written</em> was 11 — ordering first changed the answer.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <FormulaBox>mean = total ÷ how many</FormulaBox>
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Three averages</div>
          <div className="mt-2">Mean — add them all, divide by how many</div>
          <div className="mt-1">Median — put them in order, take the middle</div>
          <div className="mt-1">Mode — the value that appears most often</div>
        </div>
        <KeyIdea>
          💡 Order the data <strong>before</strong> you look for a median, every single time. It is
          the step that is easiest to skip and the one that changes the answer.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}

/**
 * Choosing between mean and median, and describing spread with the range.
 *
 * The misconception is not mechanical here — a child can compute a mean
 * perfectly and still be misled by it. The lesson uses a true advertised mean
 * that nobody earns, so the mean is never called wrong: it is called an answer
 * to a different question.
 */
export function ChoosingAverageLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  const payBars = [
    { label: "Ada", value: 300 },
    { label: "Bo", value: 320 },
    { label: "Cy", value: 280 },
    { label: "Di", value: 300 },
    { label: "owner", value: 9800, colour: "rose" as const },
  ];

  return (
    <LessonShell
      breadcrumb="Grade 6 · Data · Choosing an Average"
      title="When the average lies"
      minutes={6}
      step={step}
      total={8}
    >
      <Step n={1} title="The job advert" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <div className="rounded-2xl border-2 border-brand-300 bg-brand-50 px-4 py-5 text-center">
          <div className="text-xs font-bold uppercase tracking-wide text-brand-600">Now hiring</div>
          <div className="mt-2 text-2xl font-black text-ink-900">Average pay: $2,200 a week</div>
          <div className="mt-1 text-sm text-ink-700">Five people work here. Come and join us!</div>
        </div>
        <p className="mt-4 text-ink-700">
          You take the job. Your first pay slip says <strong>$300</strong>.
        </p>
        <p className="mt-2 text-ink-700">
          Nobody lied to you. The advert is exactly true. Let&rsquo;s find out how.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(2)}>Check the advert</PrimaryButton></div>
      </Step>

      <Step n={2} title="The advert is true" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <p className="text-ink-700">Here is what all five people earn in a week.</p>
        <div className="mt-3">
          <BarChart
            title="Weekly pay ($)"
            bars={payBars}
            to={10000}
            step={2000}
            axisWidth={40}
            meanLine={2200}
            meanLabel="mean 2200"
          />
        </div>
        <div className="mt-3 rounded-2xl bg-paper p-4 text-sm">
          <div className="text-ink-700">Total: 300 + 320 + 280 + 300 + 9800 = <strong>11,000</strong></div>
          <div className="mt-1 text-ink-700">Mean: 11,000 ÷ 5 = <strong>2,200</strong></div>
        </div>
        <p className="mt-3 text-ink-700">
          The mean really is $2,200. And four of the five people earn about $300.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(3)}>So what went wrong?</PrimaryButton></div>
      </Step>

      <Step n={3} title="The mistake almost everyone makes" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <WrongBox>&ldquo;The mean is what a typical person gets&rdquo;</WrongBox>
        <p className="text-ink-700">
          The mean shares the total out equally — but the money was never shared equally. One very
          large value dragged it upwards, and it dragged it past every ordinary person in the room.
        </p>
        <ValueStrip values={[280, 300, 300, 320, 9800]} middle={2} label="In order — the middle person earns 300" />
        <p className="mt-3 text-center text-lg font-bold text-ok-600">Median pay: $300</p>
        <p className="mt-3 text-ink-700">
          That single unusual value has a name: an <strong>outlier</strong>.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(4)}>Why does the median survive?</PrimaryButton></div>
      </Step>

      <Step n={4} title="Size versus position" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <p className="text-ink-700">
          Watch what happens if the owner has a brilliant year and pays herself <strong>$49,800</strong>{" "}
          instead. Nobody else&rsquo;s pay changes.
        </p>
        <div className="mt-3 space-y-2">
          {[
            ["Mean before", "$2,200"],
            ["Mean after", "$10,200"],
            ["Median before", "$300"],
            ["Median after", "$300"],
          ].map(([a, b], i) => (
            <div
              key={i}
              className={`flex items-center justify-between gap-2 rounded-xl px-3 py-2 ${
                i < 2 ? "bg-err-100/60" : "bg-ok-100"
              }`}
            >
              <span className="text-sm font-semibold text-ink-900">{a}</span>
              <span className="text-sm font-bold text-ink-900">{b}</span>
            </div>
          ))}
        </div>
        <KeyIdea>
          The mean adds up every value, so it feels the <strong>size</strong> of the outlier. The
          median only counts how many are on each side, so it feels only its <strong>position</strong>
          — and an outlier is still just one person in the line.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(5)}>So which do I use?</PrimaryButton></div>
      </Step>

      <Step n={5} title="Which average to pick" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <div className="space-y-2">
          {[
            ["Values all fairly close together", "mean", "it uses every value, so it wastes nothing"],
            ["One or two extreme values", "median", "the outlier cannot drag it"],
            ["Things you cannot add up — colours, shoe sizes, names", "mode", "you can still count which happens most"],
          ].map(([a, b, c]) => (
            <div key={a} className="rounded-xl bg-paper px-3 py-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-semibold text-ink-900">{a}</span>
                <span className="rounded-lg bg-brand-100 px-2 py-0.5 text-sm font-bold text-brand-700">{b}</span>
              </div>
              <div className="mt-0.5 text-xs text-ink-500">{c}</div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-ink-700">
          Nobody ever asks which average is <em>correct</em>. Ask which one answers the question
          being asked.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(6)}>A worked example</PrimaryButton></div>
      </Step>

      <Step n={6} title="Nine test scores" open={step === 6} onOpen={() => go(6)} done={step > 6}>
        <p className="text-ink-700">
          Nine students sat a test. One was ill and left the paper blank, scoring 0.
        </p>
        <ValueStrip values={[0, 70, 72, 74, 75, 76, 78, 80, 87]} middle={4} label="In order" />
        <div className="mt-3 rounded-2xl bg-paper p-4">
          <ol className="space-y-2">
            {[
              ["Total of all nine scores", "612"],
              ["Mean: 612 ÷ 9", "68"],
              ["Median: the 5th of 9 in order", "75"],
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
          Eight of the nine students scored 70 or more, so a &ldquo;typical&rdquo; score of 68 is
          below almost everyone. The median, <strong>75</strong>, describes the class better.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(7)}>One more number</PrimaryButton></div>
      </Step>

      <Step n={7} title="How spread out?" open={step === 7} onOpen={() => go(7)} done={step > 7}>
        <p className="text-ink-700">
          An average tells you where the middle is. It says nothing about how spread out the values
          are. These two classes have <strong>exactly the same mean</strong>.
        </p>
        <div className="mt-3 flex flex-wrap justify-center gap-4">
          <BarChart
            title="Class A — mean 70"
            bars={[
              { label: "", value: 68 },
              { label: "", value: 70 },
              { label: "", value: 70 },
              { label: "", value: 72 },
              { label: "", value: 70 },
            ]}
            to={100}
            step={25}
            width={230}
            meanLine={70}
          />
          <BarChart
            title="Class B — mean 70"
            bars={[
              { label: "", value: 50, colour: "amber" },
              { label: "", value: 60, colour: "amber" },
              { label: "", value: 70, colour: "amber" },
              { label: "", value: 80, colour: "amber" },
              { label: "", value: 90, colour: "amber" },
            ]}
            to={100}
            step={25}
            width={230}
            meanLine={70}
          />
        </div>
        <div className="mt-3 space-y-2">
          {[
            ["Class A range", "72 − 68 = 4"],
            ["Class B range", "90 − 50 = 40"],
          ].map(([a, b]) => (
            <div key={a} className="flex items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-semibold text-ink-900">{a}</span>
              <span className="text-sm font-bold text-ink-900">{b}</span>
            </div>
          ))}
        </div>
        <KeyIdea>
          <strong>Range = largest − smallest.</strong> Same centre, very different classes. Always
          say something about the spread as well as the middle.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(8)}>Your turn</PrimaryButton></div>
      </Step>

      <Step n={8} title="You try one" open={step === 8} onOpen={() => go(8)} done={false}>
        <p className="text-ink-700">
          Five friends counted their savings, in dollars: <strong>20, 25, 30, 25, 400</strong>. One
          of them has been saving since she was four.
        </p>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          The mean is 500 ÷ 5 = <strong>$100</strong> — more than three of the friends have in total.
          So the mean is not the number to quote here.
        </div>
        <div className="mt-2 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">2. </span>
          In order: <strong>20, 25, 25, 30, 400</strong>.
        </div>
        <TryIt
          prompt={<>3. What is the median amount saved?</>}
          accept={["25", "$25"]}
          placeholder="the median"
          value={fade}
          setValue={setFade}
          hint="there are five values, so take the third one in the ordered list."
          explain={
            <>
              <strong>$25</strong>. That is a fair description of what these friends have saved —
              the $400 is one unusual person, and the median refuses to be dragged by her.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Choosing an average</div>
          <div className="mt-2">1. Look at the data before you calculate</div>
          <div className="mt-1">2. Outlier? Use the median</div>
          <div className="mt-1">3. No outliers? The mean uses every value</div>
          <div className="mt-1">4. Report the range too — centre is only half the story</div>
        </div>
        <KeyIdea>
          💡 A mean can be perfectly correct and still describe nobody. Ask &ldquo;does this number
          look like the data?&rdquo; before you trust it.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
