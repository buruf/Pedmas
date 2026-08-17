"use client";

import { useState } from "react";
import { MathText } from "@/components/MathText";
import { Step, KeyIdea, FormulaBox, WrongBox } from "@/components/lesson/Step";
import { LessonShell, TryIt } from "@/components/lesson/LessonShell";
import { ChoiceGrid, ProbTree } from "@/components/lesson/stats/StatModels";
import { PrimaryButton } from "@/components/ui";

/**
 * The fundamental counting principle.
 *
 * The misconception is adding the choices instead of multiplying them, and it
 * is not carelessness: adding is the correct answer to a real question
 * ("how many things do I own?"), just not the one being asked. The lesson
 * separates the two questions rather than banning addition, and finishes with
 * the "and / or" test so a child can tell them apart afterwards.
 */
export function CountingPrincipleLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [guess, setGuess] = useState<string | null>(null);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 11 · Counting & Probability · Counting Principle"
      title="Counting without listing"
      minutes={6}
      step={step}
      total={7}
    >
      <Step n={1} title="Getting dressed" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          You own <strong>3 shirts</strong> and <strong>4 pairs of shorts</strong>. An outfit is one
          shirt and one pair of shorts.
        </p>
        <div className="mt-3 rounded-2xl bg-paper p-4 text-center">
          <div className="text-2xl">👕 👕 👕</div>
          <div className="mt-2 text-2xl">🩳 🩳 🩳 🩳</div>
        </div>
        <p className="mt-4 text-ink-700">How many different outfits can you make?</p>
        <div className="mt-3 grid gap-2">
          {[
            { k: "a", label: "7 — three shirts and four shorts" },
            { k: "b", label: "12" },
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
            Small enough to list. Let&rsquo;s just write them all out and count.
            <div className="mt-3"><PrimaryButton onClick={() => go(2)}>List them</PrimaryButton></div>
          </div>
        )}
      </Step>

      <Step n={2} title="The mistake almost everyone makes" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <WrongBox>3 + 4 = 7 outfits</WrongBox>
        <p className="text-ink-700">
          Here is every outfit. Shirts are R, B, G down the side; shorts are 1, 2, 3, 4 across the
          top.
        </p>
        <div className="mt-3">
          <ChoiceGrid
            rowsLabel="shirt"
            colsLabel="shorts"
            rowItems={["R", "B", "G"]}
            colItems={["1", "2", "3", "4"]}
            caption="12 outfits, none of them repeated"
          />
        </div>
        <p className="mt-3 text-ink-700">
          7 is not a made-up number — it is exactly how many <em>pieces of clothing</em> you own. But
          the question asked about outfits, and an outfit is a pair.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(3)}>Why does it multiply?</PrimaryButton></div>
      </Step>

      <Step n={3} title="Each choice opens a fresh set" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">
          Follow the decisions in order. Pick a shirt — that does not use up any shorts, so all 4
          pairs are still available.
        </p>
        <div className="mt-3">
          <ProbTree
            stage1={[{ label: "R" }, { label: "B" }, { label: "G" }]}
            stage2={[{ label: "1" }, { label: "2" }, { label: "3" }, { label: "4" }]}
            caption="3 branches, each opening 4 more"
          />
        </div>
        <p className="mt-3 text-ink-700">
          That is <strong>3 groups of 4</strong> — and groups of something is multiplication.
        </p>
        <FormulaBox>3 × 4 = 12</FormulaBox>
        <KeyIdea>
          Adding would mean the choices compete for the same slot. Multiplying means each choice
          survives alongside the other — which is what &ldquo;a shirt <em>and</em> shorts&rdquo;
          asks for.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(4)}>More than two stages</PrimaryButton></div>
      </Step>

      <Step n={4} title="Any number of stages" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <p className="text-ink-700">
          A menu offers <strong>2 starters</strong>, <strong>3 mains</strong> and{" "}
          <strong>2 desserts</strong>. A meal is one of each.
        </p>
        <div className="mt-3 rounded-2xl bg-paper p-4">
          <ol className="space-y-2">
            {[
              ["Choose a starter", "2 ways"],
              ["For each of those, choose a main", "× 3"],
              ["For each of those, choose a dessert", "× 2"],
              ["Multiply the stages", "2 × 3 × 2 = 12 meals"],
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
          Listing 12 meals is possible. Listing the meals for a menu with 8 starters, 12 mains and 6
          desserts is not — but multiplying still is: 8 × 12 × 6 = 576.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(5)}>Codes and PINs</PrimaryButton></div>
      </Step>

      <Step n={5} title="When choices get used up" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">
          A 4-digit PIN, each digit from 0 to 9. Everything depends on one word in the question.
        </p>
        <div className="mt-3 space-y-3">
          <div className="rounded-xl bg-paper p-3">
            <div className="text-sm font-bold text-ink-900">Digits may repeat</div>
            <div className="mt-1 text-sm text-ink-700">
              Every position still has all 10 digits available.
            </div>
            <div className="mt-1 font-bold text-brand-700">10 × 10 × 10 × 10 = 10,000</div>
          </div>
          <div className="rounded-xl bg-paper p-3">
            <div className="text-sm font-bold text-ink-900">No digit may repeat</div>
            <div className="mt-1 text-sm text-ink-700">
              Each digit you use is gone, so the next position has one fewer.
            </div>
            <div className="mt-1 font-bold text-brand-700">10 × 9 × 8 × 7 = 5,040</div>
          </div>
        </div>
        <KeyIdea>
          The method never changes — count the options at each stage and multiply. Only the numbers
          you write down change, depending on whether the earlier choice took something away.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(6)}>When to add instead</PrimaryButton></div>
      </Step>

      <Step n={6} title="When adding IS right" open={step === 6} onOpen={() => go(6)} done={step > 6}>
        <p className="text-ink-700">
          There is a question where 3 + 4 is the correct answer. Listen for the joining word.
        </p>
        <div className="mt-3 space-y-2">
          <div className="rounded-xl border-2 border-brand-200 bg-brand-50 px-3 py-2">
            <div className="text-sm font-bold text-ink-900">
              &ldquo;A shirt <em>and</em> shorts&rdquo;
            </div>
            <div className="text-sm text-ink-700">Two stages, both happen → multiply → 12</div>
          </div>
          <div className="rounded-xl border-2 border-ink-100 bg-paper px-3 py-2">
            <div className="text-sm font-bold text-ink-900">
              &ldquo;One item to wash: a shirt <em>or</em> a pair of shorts&rdquo;
            </div>
            <div className="text-sm text-ink-700">One choice from two separate piles → add → 7</div>
          </div>
        </div>
        <KeyIdea>
          <strong>And</strong> means stages, so multiply. <strong>Or</strong> means one pick from
          separate lists, so add. Read the question for that word before you write anything.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(7)}>Your turn</PrimaryButton></div>
      </Step>

      <Step n={7} title="You try one" open={step === 7} onOpen={() => go(7)} done={false}>
        <p className="text-ink-700">
          A café offers <strong>4 kinds of bread</strong> and <strong>5 fillings</strong>. A sandwich
          is one bread and one filling.
        </p>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          It says <strong>and</strong>, so these are two stages — not one pile.
        </div>
        <TryIt
          prompt={<>2. How many different sandwiches are possible?</>}
          accept={["20"]}
          placeholder="how many sandwiches"
          value={fade}
          setValue={setFade}
          hint="each of the 4 breads can take any of the 5 fillings."
          explain={
            <>
              4 × 5 = <strong>20 sandwiches</strong>. Choosing a bread uses up no fillings, so all 5
              are still waiting for each of the 4 breads.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">The counting principle</div>
          <div className="mt-2">1. Break the choice into stages</div>
          <div className="mt-1">2. Count the options at each stage</div>
          <div className="mt-1">3. Multiply them together</div>
          <div className="mt-1">4. Options used up? Drop by one each stage</div>
        </div>
        <KeyIdea>
          💡 Adding counts <em>things</em>. Multiplying counts <em>combinations of things</em>. The
          word &ldquo;and&rdquo; in the question is your signal.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}

/**
 * Permutations and combinations.
 *
 * Both are the counting principle with one extra question attached: does
 * rearranging the chosen group make a different result? The lesson lets the
 * permutation method run on handshakes and fail by exactly a factor of two,
 * which is what makes dividing by r! feel like a repair rather than a rule.
 */
export function PermutationCombinationLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [guess, setGuess] = useState<string | null>(null);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  const pairs = ["AB", "AC", "AD", "BC", "BD", "CD"];

  return (
    <LessonShell
      breadcrumb="Grade 11 · Counting & Probability · Permutations & Combinations"
      title="Does the order matter?"
      minutes={7}
      step={step}
      total={6}
    >
      <Step n={1} title="Four friends, one handshake each" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <p className="text-ink-700">
          Four friends — A, B, C and D — meet up. Every pair shakes hands exactly once.
        </p>
        <div className="mt-3 rounded-2xl bg-paper p-4 text-center text-3xl">🧑 🧑 🧑 🧑</div>
        <p className="mt-4 text-ink-700">How many handshakes happen?</p>
        <div className="mt-3 grid gap-2">
          {[
            { k: "a", label: "12 — four people, each shaking three hands" },
            { k: "b", label: "6" },
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
            Four people is small enough to check by hand. Let&rsquo;s do that.
            <div className="mt-3"><PrimaryButton onClick={() => go(2)}>First, a race</PrimaryButton></div>
          </div>
        )}
      </Step>

      <Step n={2} title="What you already know" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <p className="text-ink-700">
          Those same four friends run a race. Gold, silver and bronze are handed out. The counting
          principle handles it:
        </p>
        <div className="mt-3 rounded-2xl bg-paper p-4">
          <ol className="space-y-2">
            {[
              ["Gold — anyone", "4 ways"],
              ["Silver — anyone left", "× 3"],
              ["Bronze — anyone left", "× 2"],
              ["Multiply", "4 × 3 × 2 = 24"],
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
          A–B–C and B–A–C are different results here: swapping gold and silver changes who is
          champion. Counting like this is called a <strong>permutation</strong>.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(3)}>Now the handshakes</PrimaryButton></div>
      </Step>

      <Step n={3} title="The mistake almost everyone makes" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <WrongBox>4 × 3 = 12 handshakes</WrongBox>
        <p className="text-ink-700">
          The same reliable method — 4 choices for the first hand, 3 for the second. Now list what it
          counted.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {pairs.map((p) => (
            <div key={p} className="rounded-xl bg-ok-100 px-3 py-2 text-center text-sm font-bold text-ink-900">
              {p}
              <span className="ml-1 text-xs font-semibold text-ink-500">and {p[1]}{p[0]}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-ink-700">
          Six real handshakes. The method found 12 because it counted AB and BA as two different
          things — but A shaking B&rsquo;s hand <em>is</em> B shaking A&rsquo;s hand. Every handshake
          got written down twice.
        </p>
        <p className="mt-3 text-center text-lg font-bold text-ok-600">12 ÷ 2 = 6 handshakes</p>
        <div className="mt-4"><PrimaryButton onClick={() => go(4)}>What do I divide by?</PrimaryButton></div>
      </Step>

      <Step n={4} title="Divide by the orders you do not want" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <p className="text-ink-700">
          Every group of 2 can be written in 2 orders, so counting with order counts each group 2
          times. A group of 3 can be written in 3 × 2 × 1 = 6 orders, so it gets counted 6 times.
        </p>
        <div className="mt-3 space-y-2">
          {[
            ["Group of 2", "2 × 1 = 2 orders", "divide by 2"],
            ["Group of 3", "3 × 2 × 1 = 6 orders", "divide by 6"],
            ["Group of 4", "4 × 3 × 2 × 1 = 24 orders", "divide by 24"],
          ].map(([a, b, c]) => (
            <div key={a} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm font-bold text-ink-900">{a}</span>
              <span className="text-sm text-ink-500">{b}</span>
              <span className="text-sm font-bold text-brand-700">{c}</span>
            </div>
          ))}
        </div>
        <FormulaBox>
          <MathText text="{arrangements/orders of the chosen group}" />
        </FormulaBox>
        <p className="mt-1 text-ink-700">
          Counting groups where the order does <em>not</em> matter is called a{" "}
          <strong>combination</strong>.
        </p>
        <div className="mt-4"><PrimaryButton onClick={() => go(5)}>A bigger one</PrimaryButton></div>
      </Step>

      <Step n={5} title="A committee of three" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">
          Choose <strong>3 people from 7</strong> for a committee. Everyone on it has the same job.
        </p>
        <div className="mt-3 rounded-2xl bg-paper p-4">
          <ol className="space-y-2">
            {[
              ["Count as if order mattered", "7 × 6 × 5 = 210"],
              ["Each group of 3 was counted this many times", "3 × 2 × 1 = 6"],
              ["Divide", "210 ÷ 6 = 35 committees"],
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
          Change one word — <em>president, secretary and treasurer</em> instead of a committee — and
          the answer goes back to <strong>210</strong>, because now swapping two people really does
          change the result.
        </p>
        <KeyIdea>
          The test is one question: <strong>would swapping two of the chosen people change
          anything?</strong> Yes → keep the 210. No → divide by the orders.
        </KeyIdea>
        <div className="mt-4"><PrimaryButton onClick={() => go(6)}>Your turn</PrimaryButton></div>
      </Step>

      <Step n={6} title="You try one" open={step === 6} onOpen={() => go(6)} done={false}>
        <p className="text-ink-700">
          A team of <strong>2</strong> is chosen from <strong>6</strong> students. Both team members
          do the same job.
        </p>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          Counting as if order mattered: 6 × 5 = <strong>30</strong>.
        </div>
        <div className="mt-2 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">2. </span>
          Swapping the two members changes nothing, and a pair has 2 orders.
        </div>
        <TryIt
          prompt={<>3. How many different teams are possible?</>}
          accept={["15"]}
          placeholder="how many teams"
          value={fade}
          setValue={setFade}
          hint="every team of two was counted twice, so halve the 30."
          explain={
            <>
              30 ÷ 2 = <strong>15 teams</strong>. If instead one of them were captain, swapping would
              matter and the answer would stay at 30.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Permutation or combination?</div>
          <div className="mt-2">1. Count as if order mattered: n × (n−1) × …</div>
          <div className="mt-1">2. Ask: does swapping two of them change the result?</div>
          <div className="mt-1">3. Yes → done. No → divide by r × (r−1) × … × 1</div>
        </div>
        <KeyIdea>
          💡 Roles, prizes and positions care about order. Teams, committees and handshakes do not —
          and anything that does not care has been counted too many times.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
