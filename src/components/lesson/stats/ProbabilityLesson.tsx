"use client";

import { useState } from "react";
import { MathText } from "@/components/MathText";
import { Step, KeyIdea, FormulaBox, WrongBox } from "@/components/lesson/Step";
import { LessonShell, TryIt } from "@/components/lesson/LessonShell";
import { Counters, DiceGrid, ProbTree, Spinner } from "@/components/lesson/stats/StatModels";
import { PrimaryButton } from "@/components/ui";

/**
 * Simple probability.
 *
 * Confronts the most portable wrong idea in the topic: "there are two things
 * that can happen, so it is fifty-fifty". The instinct is half right — a fair
 * coin really is a half — so the lesson does not attack it, it finds the part
 * that was quietly assumed: that the two outcomes are the same size.
 */
export function ProbabilityBasicsLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [guess, setGuess] = useState<string | null>(null);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 6 · Probability · Simple Probability"
      title="How likely is it, really?"
      minutes={6}
      step={step}
      total={6}
    >
      <Step n={1} title="The spinner game" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          A fairground spinner. Land on <strong>blue</strong> and you win a prize.
        </p>
        <div className="mt-4 flex justify-center">
          <Spinner
            sections={[
              { label: "blue", colour: "sky" },
              { label: "red", colour: "rose" },
              { label: "red", colour: "rose" },
              { label: "red", colour: "rose" },
            ]}
            caption="four equal sections"
          />
        </div>
        <p className="mt-4 text-ink-700">
          Your friend says: &ldquo;It either lands on blue or it doesn&rsquo;t — so it&rsquo;s
          fifty-fifty.&rdquo;
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(2)}>Is that right?</PrimaryButton></div>
      </Step>

      <Step n={2} title="When fifty-fifty is true" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <p className="text-ink-700">
          Your friend is copying something that <em>is</em> true. A fair coin really is fifty-fifty.
        </p>
        <div className="mt-4 flex justify-center">
          <Spinner
            sections={[
              { label: "H", colour: "brand" },
              { label: "T", colour: "teal" },
            ]}
            caption="a coin, drawn as a spinner — two equal halves"
          />
        </div>
        <p className="mt-4 text-ink-700">
          Look at <em>why</em>. Not because there are two outcomes — because the two outcomes take up
          the same amount of room.
        </p>
        <p className="mt-3 text-ink-700">So what is the chance of blue on the fairground spinner?</p>
        <div className="mt-3 grid gap-2">
          {[
            { k: "a", label: "1/2 — blue or not blue" },
            { k: "b", label: "1/4 — something about the sections" },
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
            Let&rsquo;s put the two arguments side by side.
            <div className="mt-3"><PrimaryButton onClick={() => go(3)}>Show me</PrimaryButton></div>
          </div>
        )}
      </Step>

      <Step n={3} title="The mistake almost everyone makes" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <WrongBox>
          <MathText text="P(blue) = {1/2}" /> &nbsp;&ldquo;because it either lands on blue or it
          doesn&rsquo;t&rdquo;
        </WrongBox>
        <p className="text-ink-700">
          Two outcomes were counted — blue and not-blue — and then treated as equal. But look at how
          much of the spinner each one owns.
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-5">
          <Spinner
            sections={[
              { label: "blue", colour: "sky" },
              { label: "red", colour: "rose" },
              { label: "red", colour: "rose" },
              { label: "red", colour: "rose" },
            ]}
            size={120}
            caption="blue owns 1 section"
          />
          <div className="text-sm text-ink-700">
            <div className="font-bold text-ink-900">not blue owns 3</div>
            <div className="mt-1">Two outcomes, but not two <em>equal</em> outcomes.</div>
          </div>
        </div>
        <p className="mt-4 text-center text-lg font-bold text-ok-600">
          <MathText text="P(blue) = {1/4}" />
        </p>
        <KeyIdea>
          Counting outcomes only works when the outcomes are the same size. &ldquo;It happens or it
          doesn&rsquo;t&rdquo; is true of absolutely everything — including winning the lottery — so
          it cannot be what makes something a half.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(4)}>What is the rule then?</PrimaryButton></div>
      </Step>

      <Step n={4} title="Count the equal chances" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <FormulaBox>
          P ={" "}
          <MathText text="{ways it can happen/all equally likely ways}" />
        </FormulaBox>
        <p className="text-ink-700">
          Cut the situation into pieces that are all the same size, count the ones you want, and put
          that over the total.
        </p>
        <div className="mt-3 space-y-2">
          {[
            ["blue", "1 section of 4", "{1/4}"],
            ["red", "3 sections of 4", "{3/4}"],
            ["blue or red", "4 sections of 4", "1 — it is certain"],
          ].map(([a, b, c]) => (
            <div key={a} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-bold text-ink-900">{a}</span>
              <span className="text-sm text-ink-500">{b}</span>
              <span className="text-sm font-bold text-brand-700"><MathText text={c} /></span>
            </div>
          ))}
        </div>
        <KeyIdea>
          <MathText text="{1/4}" /> and <MathText text="{3/4}" /> add to 1. Something that happens
          and something that does not always add to 1 — so once you know one, you can subtract for
          the other.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(5)}>A bag of counters</PrimaryButton></div>
      </Step>

      <Step n={5} title="Worked example" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">
          A bag holds <strong>3 red</strong>, <strong>5 blue</strong> and <strong>4 green</strong>{" "}
          counters. You take one without looking.
        </p>
        <div className="mt-3">
          <Counters
            groups={[
              { n: 3, colour: "rose" },
              { n: 5, colour: "sky" },
              { n: 4, colour: "teal" },
            ]}
            caption="every counter is equally likely"
          />
        </div>
        <div className="mt-3 rounded-2xl bg-paper p-4">
          <ol className="space-y-2">
            {[
              ["How many counters altogether?", "3 + 5 + 4 = 12"],
              ["How many are red?", "3"],
              ["Write it as a fraction", "{3/12}"],
              ["Simplify — divide both by 3", "{1/4}"],
            ].map(([a, b], i) => (
              <li key={i} className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 text-sm">
                <span className="text-ink-700">
                  <span className="mr-2 font-bold text-brand-600">{i + 1}.</span>
                  {a}
                </span>
                <span className="font-bold text-ink-900"><MathText text={b} /></span>
              </li>
            ))}
          </ol>
        </div>
        <p className="mt-3 text-ink-700">
          And <MathText text="P(not red) = {9/12} = {3/4}" />, because 9 of the 12 counters are not
          red — or just <MathText text="1 − {1/4}" />, which is quicker.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(6)}>Your turn</PrimaryButton></div>
      </Step>

      <Step n={6} title="You try one" open={step === 6} onOpen={() => go(6)} done={false}>
        <p className="text-ink-700">
          A different bag: <strong>2 yellow</strong>, <strong>3 green</strong> and{" "}
          <strong>5 white</strong> counters.
        </p>
        <div className="mt-3">
          <Counters
            groups={[
              { n: 2, colour: "amber" },
              { n: 3, colour: "teal" },
              { n: 5, colour: "grey" },
            ]}
          />
        </div>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          Total counters: 2 + 3 + 5 = <strong>10</strong>.
        </div>
        <TryIt
          prompt={<>2. What is the probability of drawing a green counter? Give a fraction.</>}
          accept={["3/10", "0.3"]}
          placeholder="like 1/4"
          value={fade}
          setValue={setFade}
          hint="how many counters are green, out of how many counters in total?"
          explain={
            <>
              <MathText text="{3/10}" /> — 3 green out of 10 counters, and 3 and 10 share no factor,
              so it is already in simplest form. Green is less likely than white, and the fractions
              say so.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Finding a probability</div>
          <div className="mt-2">1. Check the outcomes are all equally likely</div>
          <div className="mt-1">2. Count the ones you want</div>
          <div className="mt-1">3. Put that over the total, then simplify</div>
        </div>
        <KeyIdea>
          💡 &ldquo;Two things can happen&rdquo; never means a half on its own. Ask whether the two
          things are the same size first.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}

/**
 * Compound events: independence, the gambler's fallacy, and totals that are
 * not equally likely.
 *
 * Both misconceptions here come from the same place — assuming that things you
 * can name are things that are equally likely, and assuming that a coin can
 * remember. The 36-cell dice grid settles the second argument by being
 * countable, which no verbal explanation manages.
 */
export function CompoundProbabilityLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [guess, setGuess] = useState<string | null>(null);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 7 · Probability · Compound Events"
      title="Two things at once"
      minutes={7}
      step={step}
      total={7}
    >
      <Step n={1} title="Five heads in a row" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <div className="rounded-2xl bg-paper p-4 text-center text-3xl">🪙 🪙 🪙 🪙 🪙</div>
        <p className="mt-3 text-center text-sm font-semibold text-ink-700">H · H · H · H · H</p>
        <p className="mt-4 text-ink-700">
          You toss a fair coin five times and get five heads. Your friend leans over: &ldquo;Bet on
          tails — it&rsquo;s <em>due</em>.&rdquo;
        </p>
        <p className="mt-3 text-ink-700">What is the chance the next toss is tails?</p>
        <div className="mt-3 grid gap-2">
          {[
            { k: "a", label: "More than a half — tails is overdue" },
            { k: "b", label: "Exactly a half" },
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
            This one has fooled mathematicians, so let&rsquo;s go carefully.
            <div className="mt-3"><PrimaryButton onClick={() => go(2)}>Show me</PrimaryButton></div>
          </div>
        )}
      </Step>

      <Step n={2} title="The mistake almost everyone makes" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <WrongBox>&ldquo;After five heads, tails is more likely&rdquo;</WrongBox>
        <p className="text-ink-700">
          Ask the practical question: <em>how</em> would the coin do that? It has no memory, no way
          of counting, and no way of knowing what happened a minute ago. It is a piece of metal.
        </p>
        <p className="mt-3 text-ink-700">
          The feeling behind the mistake is real though: five heads in a row <strong>is</strong> rare.
          The next step shows where that rareness actually lives.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(3)}>Where does it live?</PrimaryButton></div>
      </Step>

      <Step n={3} title="The rare part has already happened" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">
          Before you start, six tosses have <strong>64</strong> equally likely results — HHHHHH,
          HHHHHT, HHHHTH and so on. Getting six heads is 1 of those 64. Genuinely rare.
        </p>
        <div className="mt-3 space-y-2">
          {[
            ["Before any toss: six heads in a row", "{1/64}"],
            ["Results that start with five heads", "only HHHHHH and HHHHHT"],
            ["So after five heads, the next toss", "1 of 2 → {1/2}"],
          ].map(([a, b], i) => (
            <div key={i} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm text-ink-700">{a}</span>
              <span className="text-sm font-bold text-ink-900"><MathText text={b} /></span>
            </div>
          ))}
        </div>
        <KeyIdea>
          The five heads are already spent. Of everything that could still happen, exactly half ends
          in heads and half in tails — so the last toss is a half, the same as every other toss.
          Events like this are called <strong>independent</strong>.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(4)}>Two coins at once</PrimaryButton></div>
      </Step>

      <Step n={4} title="Independent events multiply" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <p className="text-ink-700">
          Toss two coins. Draw every path: the first coin splits into two, and each of those splits
          into two again.
        </p>
        <div className="mt-3">
          <ProbTree
            stage1={[
              { label: "H", prob: "1/2" },
              { label: "T", prob: "1/2" },
            ]}
            stage2={[
              { label: "H", prob: "1/2" },
              { label: "T", prob: "1/2" },
            ]}
            leafProb={() => "1/4"}
            highlight={["HH"]}
            caption="four paths, each equally likely"
          />
        </div>
        <p className="mt-3 text-ink-700">
          One path in four is HH, and multiplying along that path gives the same thing:
        </p>
        <FormulaBox>
          <MathText text="{1/2} * {1/2} = {1/4}" />
        </FormulaBox>
        <KeyIdea>
          Along a path, <strong>multiply</strong>. Between different paths that both count as a win,{" "}
          <strong>add</strong> — one head and one tail is HT or TH, so{" "}
          <MathText text="{1/4} + {1/4} = {2/4} = {1/2}" />.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(5)}>Now two dice</PrimaryButton></div>
      </Step>

      <Step n={5} title="Not every outcome is equally likely" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <WrongBox>&ldquo;The totals run 2 to 12, so each total has the same chance&rdquo;</WrongBox>
        <p className="text-ink-700">
          Roll two dice and add them. Here is every one of the 36 equally likely rolls, each showing
          its total. Count the cells for 7.
        </p>
        <div className="mt-3 flex justify-center">
          <DiceGrid highlight={7} caption="six ways to make 7" />
        </div>
        <div className="mt-3 flex justify-center">
          <DiceGrid highlight={2} caption="one way to make 2" />
        </div>
        <div className="mt-3 space-y-2">
          {[
            ["P(total 7)", "{6/36} = {1/6}"],
            ["P(total 2)", "{1/36}"],
          ].map(([a, b]) => (
            <div key={a} className="flex items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-semibold text-ink-900">{a}</span>
              <span className="text-sm font-bold text-brand-700"><MathText text={b} /></span>
            </div>
          ))}
        </div>
        <KeyIdea>
          A 7 is six times as likely as a 2. The <em>dice rolls</em> are equally likely; the{" "}
          <em>totals</em> are not, because several different rolls share a total. Always count the
          things that are equally likely, not the names you can give the answer.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(6)}>When the first draw matters</PrimaryButton></div>
      </Step>

      <Step n={6} title="When the first event changes the second" open={step === 6} onOpen={() => go(6)} done={step > 6}>
        <p className="text-ink-700">
          A bag holds <strong>3 red</strong> and <strong>2 blue</strong> counters. You take two, and
          you do <em>not</em> put the first one back.
        </p>
        <div className="mt-3">
          <Counters
            groups={[
              { n: 3, colour: "rose" },
              { n: 2, colour: "sky" },
            ]}
          />
        </div>
        <div className="mt-3 rounded-2xl bg-paper p-4">
          <ol className="space-y-2">
            {[
              ["First draw: 3 red out of 5", "{3/5}"],
              ["One red has gone, so 2 red out of 4 remain", "{2/4}"],
              ["Multiply along the path", "{3/5} * {2/4} = {6/20} = {3/10}"],
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
        <p className="mt-3 text-ink-700">
          Coins are independent because nothing is used up. Counters taken out of a bag are not — the
          bag has genuinely changed.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(7)}>Your turn</PrimaryButton></div>
      </Step>

      <Step n={7} title="You try one" open={step === 7} onOpen={() => go(7)} done={false}>
        <p className="text-ink-700">
          Two fair dice are rolled and the numbers added. The cells that make a total of{" "}
          <strong>5</strong> are picked out below.
        </p>
        <div className="mt-3 flex justify-center">
          <DiceGrid highlight={5} />
        </div>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          Count them: 1+4, 2+3, 3+2, 4+1 — that is <strong>4</strong> rolls out of{" "}
          <strong>36</strong>.
        </div>
        <TryIt
          prompt={<>2. What is P(total of 5)? Give a fraction in simplest form.</>}
          accept={["4/36", "1/9"]}
          placeholder="like 1/6"
          value={fade}
          setValue={setFade}
          hint="write 4 out of 36 as a fraction, then divide top and bottom by 4."
          explain={
            <>
              <MathText text="{4/36} = {1/9}" />. Fewer ways than a 7 and more ways than a 2 — the
              totals in the middle have more rolls that reach them.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Two events at once</div>
          <div className="mt-2">1. List or draw the equally likely outcomes</div>
          <div className="mt-1">2. Along one path, multiply</div>
          <div className="mt-1">3. Across separate winning paths, add</div>
          <div className="mt-1">4. Nothing put back? The second fraction changes</div>
        </div>
        <KeyIdea>
          💡 A coin cannot remember, and a total is not an outcome. Count the things that are truly
          equally likely and both mistakes disappear.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
