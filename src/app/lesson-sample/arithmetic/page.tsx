"use client";

/**
 * PROTOTYPE — sample lessons for 2- and 3-digit arithmetic, for review.
 *
 * Each lesson is built around the specific misconception that actually derails
 * children on that operation, because naming and disproving the wrong method is
 * what changes behaviour. Stating the correct rule alone never does.
 */

import { useState } from "react";
import Link from "next/link";
import { Logo, Card, PrimaryButton } from "@/components/ui";
import { MathText } from "@/components/MathText";
import { Step, KeyIdea, FormulaBox, WrongBox } from "@/components/lesson/Step";
import { BaseTen, BaseTenKey, ColumnSum, AreaModel, ShareGroups } from "@/components/lesson/Models";

/* ------------------------------------------------------------------ shared */

function Try({
  prompt,
  accept,
  hint,
  onDone,
}: {
  prompt: React.ReactNode;
  accept: string[];
  hint: string;
  onDone: () => void;
}) {
  const [v, setV] = useState("");
  const clean = v.replace(/\s/g, "");
  const answered = clean !== "";
  const right = accept.includes(clean);
  return (
    <div>
      {prompt}
      <input
        value={v}
        onChange={(e) => setV(e.target.value)}
        placeholder="Your answer"
        className="mt-3 text-center text-lg font-bold"
        inputMode="numeric"
      />
      {answered && (
        <div className="mt-3 pop-in">
          {right ? (
            <div className="rounded-xl border border-ok-600/30 bg-ok-100 px-4 py-3">
              <p className="font-bold text-ink-900">✓ Correct! Great work.</p>
              <div className="mt-3"><PrimaryButton onClick={onDone}>Last thing</PrimaryButton></div>
            </div>
          ) : (
            <div className="rounded-xl border border-warn-600/30 bg-warn-100 px-4 py-3 text-sm text-ink-700">
              Not yet — {hint}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Predict({
  question,
  options,
  correct,
  children,
}: {
  question: string;
  options: { k: string; label: string }[];
  correct: string;
  children: React.ReactNode;
}) {
  const [pick, setPick] = useState<string | null>(null);
  return (
    <div>
      <p className="text-ink-700">{question}</p>
      <div className="mt-3 grid gap-2">
        {options.map((o) => (
          <button
            key={o.k}
            type="button"
            onClick={() => setPick(o.k)}
            className={`btn rounded-xl border-2 px-4 py-3 text-left font-semibold ${
              pick === o.k ? "border-brand-600 bg-brand-50 text-brand-800" : "border-ink-100 bg-white"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
      {pick && (
        <div className="mt-4 rounded-xl border border-ok-600/30 bg-ok-100 px-4 py-3 pop-in">
          <p className="font-bold text-ink-900">
            {pick === correct ? "✓ Exactly right." : "Not quite — look at the picture."}
          </p>
          {children}
        </div>
      )}
    </div>
  );
}

function useLesson() {
  const [step, setStep] = useState(1);
  return { step, go: (n: number) => setStep(n) };
}

function Progress({ step, total }: { step: number; total: number }) {
  return (
    <Card className="mt-6">
      <div className="h-2 w-full overflow-hidden rounded-full bg-ink-100">
        <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${(step / total) * 100}%` }} />
      </div>
      <div className="mt-1 text-xs text-ink-500">Step {step} of {total}</div>
    </Card>
  );
}

/* --------------------------------------------------------------- ADDITION */

function AdditionLesson() {
  const { step, go } = useLesson();
  return (
    <>
      <Head grade="Grade 2 · Addition with regrouping" title="Adding when the ones make more than ten" mins={4} />
      <div className="space-y-3">
        <Step n={1} title="A sticker problem" open={step === 1} onOpen={() => go(1)} done={step > 1}>
          <p className="text-ink-700">You have <strong>27</strong> stickers. You get <strong>15</strong> more.</p>
          <div className="mt-4 flex flex-col items-center gap-3">
            <BaseTen tens={2} ones={7} label="27" />
            <BaseTen tens={1} ones={5} label="15" />
            <BaseTenKey />
          </div>
          <div className="mt-4"><PrimaryButton onClick={() => go(2)}>How many now?</PrimaryButton></div>
        </Step>

        <Step n={2} title="You can already do this bit" open={step === 2} onOpen={() => go(2)} done={step > 2}>
          <p className="text-ink-700">When the ones stay small, you add each column and you&rsquo;re done.</p>
          <div className="mt-4"><ColumnSum top={23} bottom={14} op="+" answer={37} /></div>
          <KeyIdea>
            3 ones + 4 ones = 7 ones. 2 tens + 1 ten = 3 tens. Every column stayed under ten, so nothing had
            to move.
          </KeyIdea>
          <div className="mt-4"><PrimaryButton onClick={() => go(3)}>Now the tricky one</PrimaryButton></div>
        </Step>

        <Step n={3} title="Why 27 + 15 is different" open={step === 3} onOpen={() => go(3)} done={step > 3}>
          <p className="text-ink-700">Put all the ones together: 7 ones and 5 ones.</p>
          <div className="mt-4 flex flex-col items-center gap-2">
            <BaseTen ones={7} /><span className="font-bold text-ink-500">+</span><BaseTen ones={5} />
            <span className="font-bold text-ink-500">=</span>
            <BaseTen ones={10} ringOnes={10} label="12 ones — that is more than one column can hold" />
          </div>
          <p className="mt-3 text-ink-700">
            The ones column only has room for <strong>0 to 9</strong>. Twelve does not fit.
          </p>
          <div className="mt-4"><PrimaryButton onClick={() => go(4)}>What do people get wrong?</PrimaryButton></div>
        </Step>

        <Step n={4} title="The mistake almost everyone makes" open={step === 4} onOpen={() => go(4)} done={step > 4}>
          <p className="text-ink-700">Lots of people just write the 12 in:</p>
          <WrongBox>27 + 15 = 312</WrongBox>
          <Predict
            question="Before we check properly — could 312 possibly be right?"
            options={[
              { k: "no", label: "No — that is far too big" },
              { k: "yes", label: "Yes, it could be right" },
            ]}
            correct="no"
          >
            <p className="mt-1 text-sm text-ink-700">
              27 is nearly 30, and 15 is about 15. So the answer must be somewhere near{" "}
              <strong>42</strong> — nowhere near 312.
            </p>
            <p className="mt-2 text-sm font-semibold text-ink-900">
              Estimating first tells you when an answer is nonsense.
            </p>
            <div className="mt-3"><PrimaryButton onClick={() => go(5)}>Show me the right way</PrimaryButton></div>
          </Predict>
        </Step>

        <Step n={5} title="The big idea: trade ten ones for one ten" open={step === 5} onOpen={() => go(5)} done={step > 5}>
          <p className="text-ink-700">
            Ten ones are exactly the same amount as one ten. So we swap them.
          </p>
          <div className="mt-4 flex flex-col items-center gap-3">
            <BaseTen ones={10} ringOnes={10} label="10 ones" />
            <span className="text-sm font-bold text-brand-600">↓ trade</span>
            <BaseTen tens={1} label="1 ten — same amount, tidier" />
          </div>
          <KeyIdea>
            Nothing was added or lost. We only changed <em>how it is written</em>. That swap is what
            &ldquo;carrying&rdquo; really means.
          </KeyIdea>
          <div className="mt-4"><PrimaryButton onClick={() => go(6)}>Finish the problem</PrimaryButton></div>
        </Step>

        <Step n={6} title="Now we can add" open={step === 6} onOpen={() => go(6)} done={step > 6}>
          <p className="text-ink-700">12 ones becomes <strong>1 ten and 2 ones</strong>. The ten moves across.</p>
          <div className="mt-4"><ColumnSum top={27} bottom={15} op="+" answer={42} carries={{ 1: "1" }} highlight={0} /></div>
          <ol className="mt-4 space-y-2 text-sm text-ink-700">
            <li><strong>1.</strong> 7 + 5 = 12 ones. Write the <strong>2</strong>, carry the <strong>1 ten</strong>.</li>
            <li><strong>2.</strong> 2 tens + 1 ten + the carried 1 ten = <strong>4 tens</strong>.</li>
            <li><strong>3.</strong> Check against the estimate: 42 is close to 42 ✓</li>
          </ol>
          <div className="mt-4 flex justify-center"><BaseTen tens={4} ones={2} label="42" /></div>
          <div className="mt-4"><PrimaryButton onClick={() => go(7)}>Your turn</PrimaryButton></div>
        </Step>

        <Step n={7} title="You try one — I'll start it" open={step === 7} onOpen={() => go(7)} done={step > 7}>
          <Try
            prompt={
              <div>
                <FormulaBox>38 + 24 = ?</FormulaBox>
                <p className="text-sm text-ink-700">
                  <strong>1.</strong> 8 + 4 = 12 ones → write 2, carry 1 ten. Now finish the tens column.
                </p>
              </div>
            }
            accept={["62"]}
            hint="3 tens + 2 tens + the carried 1 ten = 6 tens, and 2 ones left over."
            onDone={() => go(8)}
          />
        </Step>

        <Step n={8} title="The rule, now that it makes sense" open={step === 8} onOpen={() => go(8)} done={false}>
          <FormulaBox>
            <div className="text-sm text-brand-200">To add</div>
            <div className="mt-2 text-lg">1. Start with the ones</div>
            <div className="text-lg">2. Ten or more? Trade ten for one ten and carry it</div>
            <div className="text-lg">3. Add the next column, including the carry</div>
          </FormulaBox>
          <KeyIdea>💡 Estimate first. If your answer is nowhere near the estimate, you have a place-value slip.</KeyIdea>
        </Step>
      </div>
      <Progress step={step} total={8} />
    </>
  );
}

/* ------------------------------------------------------------ SUBTRACTION */

function SubtractionLesson() {
  const { step, go } = useLesson();
  return (
    <>
      <Head grade="Grade 2 · Subtraction with regrouping" title="Subtracting when there aren't enough ones" mins={4} />
      <div className="space-y-3">
        <Step n={1} title="A marble problem" open={step === 1} onOpen={() => go(1)} done={step > 1}>
          <p className="text-ink-700">You have <strong>52</strong> marbles. You give <strong>27</strong> away.</p>
          <div className="mt-4 flex flex-col items-center gap-2">
            <BaseTen tens={5} ones={2} label="52" />
            <BaseTenKey />
          </div>
          <div className="mt-4"><PrimaryButton onClick={() => go(2)}>How many are left?</PrimaryButton></div>
        </Step>

        <Step n={2} title="You can already do this bit" open={step === 2} onOpen={() => go(2)} done={step > 2}>
          <p className="text-ink-700">When there are enough ones to take from, you just subtract each column.</p>
          <div className="mt-4"><ColumnSum top={58} bottom={23} op="−" answer={35} /></div>
          <KeyIdea>8 ones take away 3 ones is 5 ones. 5 tens take away 2 tens is 3 tens. No trouble.</KeyIdea>
          <div className="mt-4"><PrimaryButton onClick={() => go(3)}>Now the tricky one</PrimaryButton></div>
        </Step>

        <Step n={3} title="Why 52 − 27 is different" open={step === 3} onOpen={() => go(3)} done={step > 3}>
          <p className="text-ink-700">Look only at the ones column: you have <strong>2</strong> ones, and you need to take away <strong>7</strong>.</p>
          <div className="mt-4 flex flex-col items-center gap-2">
            <BaseTen ones={2} label="you have 2 ones" />
            <span className="text-sm font-bold text-err-600">but you need to take 7 away</span>
          </div>
          <p className="mt-3 text-ink-700">There aren&rsquo;t enough. So what now?</p>
          <div className="mt-4"><PrimaryButton onClick={() => go(4)}>What do people get wrong?</PrimaryButton></div>
        </Step>

        <Step n={4} title="The mistake almost everyone makes" open={step === 4} onOpen={() => go(4)} done={step > 4}>
          <p className="text-ink-700">
            When people can&rsquo;t do 2 − 7, they flip it round and do 7 − 2 instead:
          </p>
          <WrongBox>52 − 27 = 35</WrongBox>
          <p className="text-ink-700">
            There&rsquo;s a way to catch this every time. Subtraction can always be checked by{" "}
            <strong>adding back</strong>.
          </p>
          <Predict
            question="If 35 were the answer, then 35 + 27 should give us 52. Does it?"
            options={[
              { k: "no", label: "No — 35 + 27 = 62, not 52" },
              { k: "yes", label: "Yes, it works out" },
            ]}
            correct="no"
          >
            <p className="mt-1 text-sm text-ink-700">
              35 + 27 = <strong>62</strong>. That&rsquo;s 10 too many, so 35 cannot be right. Flipping the
              digits quietly changed the question.
            </p>
            <div className="mt-3"><PrimaryButton onClick={() => go(5)}>Show me the right way</PrimaryButton></div>
          </Predict>
        </Step>

        <Step n={5} title="The big idea: break one ten open" open={step === 5} onOpen={() => go(5)} done={step > 5}>
          <p className="text-ink-700">
            You don&rsquo;t have enough ones — but you do have plenty of tens. So take <strong>one ten</strong>{" "}
            and break it into <strong>ten ones</strong>.
          </p>
          <div className="mt-4 flex flex-col items-center gap-3">
            <BaseTen tens={5} ones={2} label="52 = 5 tens and 2 ones" />
            <span className="text-sm font-bold text-brand-600">↓ break one ten open</span>
            <BaseTen tens={4} ones={10} ringOnes={10} label="52 = 4 tens and 12 ones" />
          </div>
          <KeyIdea>
            Both pictures show <strong>52</strong> — the same marbles, just arranged differently. Now there
            are 12 ones, which is plenty to take 7 from.
          </KeyIdea>
          <div className="mt-4"><PrimaryButton onClick={() => go(6)}>Finish the problem</PrimaryButton></div>
        </Step>

        <Step n={6} title="Now we can subtract" open={step === 6} onOpen={() => go(6)} done={step > 6}>
          <div className="mt-2">
            <ColumnSum top={52} bottom={27} op="−" answer={25} strikeTop={{ 1: "4", 0: "12" }} highlight={0} />
          </div>
          <ol className="mt-4 space-y-2 text-sm text-ink-700">
            <li><strong>1.</strong> Not enough ones, so 5 tens becomes 4 tens and the 2 ones become 12.</li>
            <li><strong>2.</strong> 12 − 7 = <strong>5</strong> ones.</li>
            <li><strong>3.</strong> 4 − 2 = <strong>2</strong> tens.</li>
            <li><strong>4.</strong> Check by adding back: 25 + 27 = 52 ✓</li>
          </ol>
          <div className="mt-4 flex justify-center"><BaseTen tens={2} ones={5} label="25" /></div>
          <div className="mt-4"><PrimaryButton onClick={() => go(7)}>Your turn</PrimaryButton></div>
        </Step>

        <Step n={7} title="You try one — I'll start it" open={step === 7} onOpen={() => go(7)} done={step > 7}>
          <Try
            prompt={
              <div>
                <FormulaBox>63 − 28 = ?</FormulaBox>
                <p className="text-sm text-ink-700">
                  <strong>1.</strong> 3 ones isn&rsquo;t enough to take 8 from, so break a ten: 63 becomes 5
                  tens and 13 ones. Now finish it.
                </p>
              </div>
            }
            accept={["35"]}
            hint="13 − 8 = 5 ones, and 5 − 2 = 3 tens. Then check: 35 + 28 should be 63."
            onDone={() => go(8)}
          />
        </Step>

        <Step n={8} title="The rule, now that it makes sense" open={step === 8} onOpen={() => go(8)} done={false}>
          <FormulaBox>
            <div className="text-sm text-brand-200">To subtract</div>
            <div className="mt-2 text-lg">1. Start with the ones</div>
            <div className="text-lg">2. Not enough? Break one ten into ten ones</div>
            <div className="text-lg">3. Subtract each column</div>
            <div className="text-lg">4. Check by adding your answer back</div>
          </FormulaBox>
          <KeyIdea>
            💡 <strong>Never flip a column round.</strong> If you can&rsquo;t do 2 − 7, that&rsquo;s a signal
            to trade — not to swap the digits.
          </KeyIdea>
        </Step>
      </div>
      <Progress step={step} total={8} />
    </>
  );
}

/* --------------------------------------------------------- MULTIPLICATION */

function MultiplicationLesson() {
  const { step, go } = useLesson();
  return (
    <>
      <Head grade="Grade 3–4 · Multiplying by one digit" title="Multiplying a 2-digit number" mins={4} />
      <div className="space-y-3">
        <Step n={1} title="A pencil problem" open={step === 1} onOpen={() => go(1)} done={step > 1}>
          <p className="text-ink-700">There are <strong>3</strong> boxes. Each box holds <strong>24</strong> pencils.</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-xl border-2 border-dashed border-ink-300 bg-paper p-2">
                <BaseTen tens={2} ones={4} />
              </div>
            ))}
          </div>
          <p className="mt-3 text-center text-sm text-ink-500">3 boxes of 24</p>
          <div className="mt-4"><PrimaryButton onClick={() => go(2)}>How many pencils?</PrimaryButton></div>
        </Step>

        <Step n={2} title="You can already do this bit" open={step === 2} onOpen={() => go(2)} done={step > 2}>
          <p className="text-ink-700">You already know both of these:</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <div className="rounded-xl bg-paper px-4 py-3 text-center text-lg font-bold text-ink-900">3 × 4 = 12</div>
            <div className="rounded-xl bg-paper px-4 py-3 text-center text-lg font-bold text-ink-900">3 × 20 = 60</div>
          </div>
          <KeyIdea>
            3 × 20 is just 3 × 2 = 6, then ten times bigger. Multiplying by a ten gives you tens.
          </KeyIdea>
          <div className="mt-4"><PrimaryButton onClick={() => go(3)}>So how does that help?</PrimaryButton></div>
        </Step>

        <Step n={3} title="Split 24 into parts you know" open={step === 3} onOpen={() => go(3)} done={step > 3}>
          <p className="text-ink-700">24 is made of <strong>20 and 4</strong>. Look at one box:</p>
          <div className="mt-4 flex justify-center"><BaseTen tens={2} ones={4} label="24 = 20 + 4" /></div>
          <p className="mt-3 text-ink-700">
            So 3 boxes of 24 is 3 lots of 20 <em>and</em> 3 lots of 4.
          </p>
          <div className="mt-4"><PrimaryButton onClick={() => go(4)}>What do people get wrong?</PrimaryButton></div>
        </Step>

        <Step n={4} title="The mistake almost everyone makes" open={step === 4} onOpen={() => go(4)} done={step > 4}>
          <p className="text-ink-700">Some people multiply each digit on its own and stick them together:</p>
          <WrongBox>3 × 24 = 612</WrongBox>
          <Predict
            question="Roughly how many pencils should there be?"
            options={[
              { k: "75", label: "About 75 — because 24 is nearly 25, and 3 × 25 = 75" },
              { k: "600", label: "About 600" },
            ]}
            correct="75"
          >
            <p className="mt-1 text-sm text-ink-700">
              3 boxes of about 25 is about <strong>75</strong> pencils. 612 would need boxes of 200 —
              the digits were multiplied separately, which loses the place value.
            </p>
            <div className="mt-3"><PrimaryButton onClick={() => go(5)}>Show me the right way</PrimaryButton></div>
          </Predict>
        </Step>

        <Step n={5} title="The big idea: multiply each part, then add" open={step === 5} onOpen={() => go(5)} done={step > 5}>
          <p className="text-ink-700">Draw it as a rectangle 3 rows tall and 24 wide, then cut it at 20:</p>
          <div className="mt-4"><AreaModel rows={3} parts={[20, 4]} /></div>
          <KeyIdea>
            The whole rectangle is 3 × 24. Cutting it doesn&rsquo;t change its size — it just turns one hard
            question into two easy ones you already know.
          </KeyIdea>
          <div className="mt-4"><PrimaryButton onClick={() => go(6)}>Finish the problem</PrimaryButton></div>
        </Step>

        <Step n={6} title="Now we can multiply" open={step === 6} onOpen={() => go(6)} done={step > 6}>
          <ol className="space-y-2 text-sm text-ink-700">
            <li><strong>1.</strong> 3 × 20 = <strong>60</strong></li>
            <li><strong>2.</strong> 3 × 4 = <strong>12</strong></li>
            <li><strong>3.</strong> Add the parts: 60 + 12 = <strong>72</strong></li>
            <li><strong>4.</strong> Check against the estimate: 72 is close to 75 ✓</li>
          </ol>
          <div className="mt-4 flex justify-center"><BaseTen tens={7} ones={2} label="72 pencils" /></div>
          <div className="mt-4"><PrimaryButton onClick={() => go(7)}>Your turn</PrimaryButton></div>
        </Step>

        <Step n={7} title="You try one — I'll start it" open={step === 7} onOpen={() => go(7)} done={step > 7}>
          <Try
            prompt={
              <div>
                <FormulaBox>4 × 32 = ?</FormulaBox>
                <p className="text-sm text-ink-700"><strong>1.</strong> Split 32 into 30 and 2. Then 4 × 30 = 120. Now finish.</p>
                <div className="mt-3"><AreaModel rows={4} parts={[30, 2]} showProducts={false} /></div>
              </div>
            }
            accept={["128"]}
            hint="4 × 2 = 8, and 120 + 8 = 128."
            onDone={() => go(8)}
          />
        </Step>

        <Step n={8} title="The rule, now that it makes sense" open={step === 8} onOpen={() => go(8)} done={false}>
          <FormulaBox>
            <div className="text-sm text-brand-200">To multiply a 2-digit number</div>
            <div className="mt-2 text-lg">1. Split it into tens and ones</div>
            <div className="text-lg">2. Multiply each part</div>
            <div className="text-lg">3. Add the parts together</div>
          </FormulaBox>
          <KeyIdea>💡 Never multiply digits separately — 3 × 24 is not &ldquo;3×2 then 3×4&rdquo;. The 2 in 24 means twenty.</KeyIdea>
        </Step>
      </div>
      <Progress step={step} total={8} />
    </>
  );
}

/* --------------------------------------------------------------- DIVISION */

function DivisionLesson() {
  const { step, go } = useLesson();
  return (
    <>
      <Head grade="Grade 3–4 · Dividing by one digit" title="Sharing a 2-digit number equally" mins={4} />
      <div className="space-y-3">
        <Step n={1} title="A sweet problem" open={step === 1} onOpen={() => go(1)} done={step > 1}>
          <p className="text-ink-700"><strong>84</strong> sweets shared equally between <strong>4</strong> friends.</p>
          <div className="mt-4 flex justify-center"><BaseTen tens={8} ones={4} label="84 = 8 tens and 4 ones" /></div>
          <div className="mt-3"><BaseTenKey /></div>
          <div className="mt-4"><PrimaryButton onClick={() => go(2)}>How many each?</PrimaryButton></div>
        </Step>

        <Step n={2} title="You can already do this bit" open={step === 2} onOpen={() => go(2)} done={step > 2}>
          <p className="text-ink-700">You already know 8 shared between 4:</p>
          <div className="mt-3 rounded-xl bg-paper px-4 py-3 text-center text-lg font-bold text-ink-900">8 ÷ 4 = 2</div>
          <KeyIdea>
            Here&rsquo;s the useful part: if <strong>8 things</strong> shared by 4 gives 2 each, then{" "}
            <strong>8 tens</strong> shared by 4 gives <strong>2 tens</strong> each.
          </KeyIdea>
          <div className="mt-4"><PrimaryButton onClick={() => go(3)}>Let's share them out</PrimaryButton></div>
        </Step>

        <Step n={3} title="Share the tens first" open={step === 3} onOpen={() => go(3)} done={step > 3}>
          <p className="text-ink-700">Deal out the 8 tens between the 4 friends — 2 tens each:</p>
          <div className="mt-4"><ShareGroups groups={4} tensEach={2} onesEach={0} label="8 tens shared by 4 = 2 tens each" /></div>
          <div className="mt-4"><PrimaryButton onClick={() => go(4)}>What do people get wrong?</PrimaryButton></div>
        </Step>

        <Step n={4} title="The mistake almost everyone makes" open={step === 4} onOpen={() => go(4)} done={step > 4}>
          <p className="text-ink-700">
            In adding and subtracting you always start on the <strong>right</strong>. So people assume
            division works the same way and share the ones first.
          </p>
          <Predict
            question="Which end should you start from when dividing?"
            options={[
              { k: "left", label: "Start on the LEFT — share the biggest pieces first" },
              { k: "right", label: "Start on the RIGHT, like adding" },
            ]}
            correct="left"
          >
            <p className="mt-1 text-sm text-ink-700">
              Division is the odd one out: you share the <strong>biggest</strong> pieces first, so the
              tens before the ones. It&rsquo;s how you&rsquo;d really deal out sweets — big handfuls first,
              then the leftovers.
            </p>
            <div className="mt-3"><PrimaryButton onClick={() => go(5)}>Finish sharing</PrimaryButton></div>
          </Predict>
        </Step>

        <Step n={5} title="Now share the ones" open={step === 5} onOpen={() => go(5)} done={step > 5}>
          <p className="text-ink-700">4 ones left, shared between 4 friends — that&rsquo;s 1 each.</p>
          <div className="mt-4"><ShareGroups groups={4} tensEach={2} onesEach={1} label="each friend has 2 tens and 1 one = 21" /></div>
          <div className="mt-4"><PrimaryButton onClick={() => go(6)}>Write it down</PrimaryButton></div>
        </Step>

        <Step n={6} title="The written method" open={step === 6} onOpen={() => go(6)} done={step > 6}>
          <FormulaBox>84 ÷ 4 = 21</FormulaBox>
          <ol className="space-y-2 text-sm text-ink-700">
            <li><strong>1.</strong> 8 tens ÷ 4 = <strong>2 tens</strong> → write 2 in the tens place</li>
            <li><strong>2.</strong> 4 ones ÷ 4 = <strong>1 one</strong> → write 1 in the ones place</li>
            <li><strong>3.</strong> Check by multiplying back: 21 × 4 = 84 ✓</li>
          </ol>
          <KeyIdea>Division and multiplication undo each other, so multiplying back always checks your answer.</KeyIdea>
          <div className="mt-4"><PrimaryButton onClick={() => go(7)}>Your turn</PrimaryButton></div>
        </Step>

        <Step n={7} title="You try one — I'll start it" open={step === 7} onOpen={() => go(7)} done={step > 7}>
          <Try
            prompt={
              <div>
                <FormulaBox>96 ÷ 3 = ?</FormulaBox>
                <p className="text-sm text-ink-700">
                  <strong>1.</strong> Start on the left: 9 tens ÷ 3 = 3 tens. Now share the 6 ones.
                </p>
              </div>
            }
            accept={["32"]}
            hint="6 ones ÷ 3 = 2 ones, so it's 3 tens and 2 ones. Check: 32 × 3 = 96."
            onDone={() => go(8)}
          />
        </Step>

        <Step n={8} title="The rule, now that it makes sense" open={step === 8} onOpen={() => go(8)} done={false}>
          <FormulaBox>
            <div className="text-sm text-brand-200">To divide</div>
            <div className="mt-2 text-lg">1. Start on the LEFT — biggest pieces first</div>
            <div className="text-lg">2. Share each place value in turn</div>
            <div className="text-lg">3. Check by multiplying back</div>
          </FormulaBox>
          <KeyIdea>💡 Division is the one operation that starts from the left, not the right.</KeyIdea>
        </Step>
      </div>
      <Progress step={step} total={8} />
    </>
  );
}

/* ------------------------------------------------------------------ shell */

function Head({ grade, title, mins }: { grade: string; title: string; mins: number }) {
  return (
    <div className="mb-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-brand-600">{grade}</div>
      <h1 className="mt-1 text-2xl font-black text-ink-900">{title}</h1>
      <p className="mt-1 text-sm text-ink-500">About {mins} minutes · then you&rsquo;ll practise</p>
    </div>
  );
}

const TABS = [
  { k: "add", label: "Addition", el: <AdditionLesson /> },
  { k: "sub", label: "Subtraction", el: <SubtractionLesson /> },
  { k: "mul", label: "Multiplication", el: <MultiplicationLesson /> },
  { k: "div", label: "Division", el: <DivisionLesson /> },
];

export default function ArithmeticSamples() {
  const [tab, setTab] = useState("add");
  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <header className="mb-5 flex items-center justify-between">
        <Link href="/"><Logo /></Link>
        <span className="rounded-full bg-warn-100 px-3 py-1 text-xs font-bold text-warn-600">
          PROTOTYPE — sample lessons
        </span>
      </header>

      <div className="mb-5 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.k}
            type="button"
            onClick={() => setTab(t.k)}
            className={`btn rounded-xl border-2 px-4 py-2 text-sm font-bold ${
              tab === t.k ? "border-brand-600 bg-brand-600 text-white" : "border-ink-100 bg-white text-ink-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {TABS.find((t) => t.k === tab)!.el}
    </div>
  );
}
