"use client";

import { useState } from "react";
import { Step, KeyIdea, WrongBox } from "@/components/lesson/Step";
import { LessonShell, TryIt } from "@/components/lesson/LessonShell";
import { DecimalChart } from "@/components/lesson/Models";
import { PrimaryButton } from "@/components/ui";

/**
 * Rounding decimals (Grade 5).
 *
 * The misconception is procedural rather than conceptual, and it is invisible
 * until the digits line up against you: rounding in stages. 2.348 rounded to
 * hundredths is 2.35, and 2.35 rounded to tenths is 2.4 — but 2.348 rounded to
 * tenths is 2.3. A student who rounds twice gets the wrong answer roughly
 * whenever the discarded digits sit just below a midpoint, which is exactly
 * where a rounding question is worth asking.
 *
 * The cure is a number line, because the question "which tenth is it nearer?"
 * has a visible answer that no chain of steps can argue with.
 */

const BRAND = "#7c3aed";
const ROSE = "#dc2626";
const GREY = "#9ca3af";
const INK = "#374151";

/** Tidy number label: 2.35 stays 2.35, but 45.0 becomes 45. */
const fmt = (v: number) => String(Number(v.toFixed(6)));

/**
 * A zoomed-in stretch of the number line between two neighbouring round values,
 * with the midpoint drawn and one value plotted. The shaded half is the half
 * the value falls in, which *is* the rounding answer.
 */
function ZoomLine({
  from,
  to,
  value,
  caption,
}: {
  from: number;
  to: number;
  value: number;
  caption?: string;
}) {
  const W = 300;
  const H = 74;
  const padL = 30;
  const usable = W - padL * 2;
  const mid = (from + to) / 2;
  const x = (v: number) => padL + ((v - from) / (to - from)) * usable;
  const y = 46;
  const nearLow = value < mid;
  return (
    <figure className="m-0">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: W }} role="img" aria-label={caption ?? "number line"}>
        <rect
          x={nearLow ? x(from) : x(mid)}
          y={y - 9}
          width={usable / 2}
          height={18}
          fill="#ede9fe"
        />
        <line x1={padL} y1={y} x2={W - padL} y2={y} stroke={INK} strokeWidth="2" />
        {Array.from({ length: 11 }, (_, i) => {
          const v = from + ((to - from) * i) / 10;
          const big = i === 0 || i === 5 || i === 10;
          return (
            <line
              key={i}
              x1={x(v)}
              y1={y - (big ? 8 : 4)}
              x2={x(v)}
              y2={y + (big ? 8 : 4)}
              stroke={big ? INK : GREY}
              strokeWidth={big ? 1.8 : 1}
            />
          );
        })}
        <line x1={x(mid)} y1={y - 20} x2={x(mid)} y2={y + 10} stroke={GREY} strokeWidth="1.4" strokeDasharray="4 3" />
        <text x={x(from)} y={y + 22} fontSize="11" fontWeight="700" textAnchor="middle" fill={INK}>
          {fmt(from)}
        </text>
        <text x={x(mid)} y={y + 22} fontSize="10" textAnchor="middle" fill={GREY}>
          {fmt(mid)}
        </text>
        <text x={x(to)} y={y + 22} fontSize="11" fontWeight="700" textAnchor="middle" fill={INK}>
          {fmt(to)}
        </text>
        <circle cx={x(value)} cy={y} r="5" fill={ROSE} />
        <text x={x(value)} y={y - 14} fontSize="11" fontWeight="700" textAnchor="middle" fill={ROSE}>
          {value}
        </text>
        <text x={x(nearLow ? from : to)} y={12} fontSize="9.5" fontWeight="700" textAnchor="middle" fill={BRAND}>
          nearer
        </text>
      </svg>
      {caption && (
        <figcaption className="mt-1 text-center text-sm font-semibold text-ink-700">{caption}</figcaption>
      )}
    </figure>
  );
}

/**
 * The stretch of numbers that all round to 7 — 6.50 up to 7.49, with 7.50
 * excluded because it rounds the other way. Rounding is easier to trust once a
 * rounded value is seen as a band rather than a single point.
 */
function RoundsToBand() {
  const W = 300;
  const H = 62;
  const padL = 24;
  const usable = W - padL * 2;
  const x = (v: number) => padL + ((v - 6) / 2) * usable;
  const y = 34;
  return (
    <figure className="m-0">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: W }} role="img" aria-label="numbers that round to 7">
        <rect x={x(6.5)} y={y - 10} width={x(7.5) - x(6.5)} height={20} fill="#ede9fe" />
        <line x1={padL} y1={y} x2={W - padL} y2={y} stroke={INK} strokeWidth="2" />
        {[6, 6.5, 7, 7.5, 8].map((v) => (
          <g key={v}>
            <line x1={x(v)} y1={y - 7} x2={x(v)} y2={y + 7} stroke={INK} strokeWidth="1.6" />
            <text x={x(v)} y={y + 21} fontSize="10" fontWeight={v === 7 ? "700" : "400"} textAnchor="middle" fill={v === 7 ? BRAND : GREY}>
              {fmt(v)}
            </text>
          </g>
        ))}
        <text x={x(7)} y={12} fontSize="10" fontWeight="700" textAnchor="middle" fill={BRAND}>
          all of this rounds to 7
        </text>
      </svg>
      <figcaption className="mt-1 text-center text-sm font-semibold text-ink-700">
        from 6.50 up to 7.49
      </figcaption>
    </figure>
  );
}

/** The digits of a number with the kept place and the deciding digit picked out. */
function DigitRow({
  digits,
  keepIndex,
  note,
}: {
  /** the number split into characters, decimal point included */
  digits: string;
  /** index in `digits` of the last digit you keep */
  keepIndex: number;
  note?: string;
}) {
  const chars = digits.split("");
  return (
    <div>
      <div className="flex items-end justify-center gap-1">
        {chars.map((c, i) => {
          const keep = i <= keepIndex;
          const decide = i === keepIndex + 1;
          return (
            <span
              key={i}
              className={`inline-flex h-11 min-w-8 items-center justify-center rounded-lg border-2 text-xl font-black ${
                decide
                  ? "border-err-600 bg-err-100 text-err-600"
                  : keep
                    ? "border-brand-400 bg-brand-50 text-ink-900"
                    : "border-ink-100 bg-white text-ink-300"
              } ${c === "." ? "min-w-4 border-transparent bg-transparent" : ""}`}
            >
              {c}
            </span>
          );
        })}
      </div>
      <div className="mt-1 flex justify-center gap-4 text-[11px] font-semibold">
        <span className="text-brand-700">keep</span>
        <span className="text-err-600">deciding digit</span>
        <span className="text-ink-300">drop</span>
      </div>
      {note && <p className="mt-2 text-center text-sm text-ink-700">{note}</p>}
    </div>
  );
}

export function DecimalRoundLesson({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(1);
  const [guess, setGuess] = useState<string | null>(null);
  const [fade, setFade] = useState("");
  const go = (n: number) => setStep(n);

  return (
    <LessonShell
      breadcrumb="Grade 5 · Decimals · Rounding Decimals"
      title="Rounding to a decimal place"
      minutes={7}
      step={step}
      total={8}
    >
      <Step n={1} title="The stopwatch says 2.348" open={step === 1} onOpen={() => go(1)} done={step > 1}>
        <div className="mx-auto max-w-xs rounded-2xl border-2 border-ink-900 bg-ink-900 px-4 py-5 text-center">
          <div className="text-xs font-bold uppercase tracking-wide text-brand-200">race timer</div>
          <div className="mt-1 text-4xl font-black tabular-nums text-white">2.348 s</div>
        </div>
        <p className="mt-4 text-ink-700">
          The record book only has room for one decimal place. You have to write this time as a
          number of <strong>tenths</strong> of a second. Which do you write — 2.3 or 2.4?
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(2)}>Let&rsquo;s work it out</PrimaryButton>
        </div>
      </Step>

      <Step n={2} title="You already do this with whole numbers" open={step === 2} onOpen={() => go(2)} done={step > 2}>
        <p className="text-ink-700">Round 47 to the nearest ten. You never think about it — you just see it.</p>
        <div className="mt-3 flex justify-center">
          <ZoomLine from={40} to={50} value={47} caption="47 is past the halfway mark, so it rounds up to 50" />
        </div>
        <p className="mt-3 text-ink-700">
          Rounding always means the same thing: <strong>which of the two nearest round numbers is
          this closer to?</strong> Decimals do not change that. They just make the two neighbours
          closer together.
        </p>
        <div className="mt-4">
          <DecimalChart rows={[{ value: "2.34" }]} highlight="tenths" />
        </div>
        <p className="mt-3 text-center text-sm text-ink-500">
          the first place after the point is tenths, the second is hundredths
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(3)}>Back to 2.348</PrimaryButton>
        </div>
      </Step>

      <Step n={3} title="Which two tenths is it between?" open={step === 3} onOpen={() => go(3)} done={step > 3}>
        <p className="text-ink-700">
          Rounding 2.348 to the nearest tenth means choosing between <strong>2.3</strong> and{" "}
          <strong>2.4</strong>. Which one?
        </p>
        <div className="mt-3 grid gap-2">
          {[
            { k: "b", label: "2.4 — round the 8 up first, then carry on" },
            { k: "a", label: "2.3" },
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
            The first option is how a lot of people do it. Let&rsquo;s see where it leads.
            <div className="mt-3">
              <PrimaryButton onClick={() => go(4)}>Show me</PrimaryButton>
            </div>
          </div>
        )}
      </Step>

      <Step n={4} title="The mistake almost everyone makes" open={step === 4} onOpen={() => go(4)} done={step > 4}>
        <WrongBox>2.348 → 2.35 → 2.4</WrongBox>
        <p className="text-ink-700">
          It looks careful. Tidy the last digit, then tidy the next one. Each step on its own is
          correct — the 8 really does round the 4 up to 5, and 2.35 really does round to 2.4.
        </p>
        <p className="mt-3 text-ink-700">Now put 2.348 on the number line and look.</p>
        <div className="mt-3 flex justify-center">
          <ZoomLine from={2.3} to={2.4} value={2.348} caption="2.348 sits below the 2.35 halfway mark" />
        </div>
        <p className="mt-3 text-ink-700">
          It is on the <strong>2.3 side</strong>. Rounding twice let the 8 push the 4, and then the
          pushed-up 4 pushed the 3 — so a digit two places away ended up changing the answer. It was
          never close enough to have a vote.
        </p>
        <p className="mt-3 text-center text-lg font-bold text-ok-600">2.348 → 2.3</p>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(5)}>What should I do instead?</PrimaryButton>
        </div>
      </Step>

      <Step n={5} title="One look, one decision" open={step === 5} onOpen={() => go(5)} done={step > 5}>
        <p className="text-ink-700">
          Go straight from the original number to the answer. Only <strong>one</strong> digit ever
          gets a vote: the one immediately to the right of the place you are keeping.
        </p>
        <div className="mt-4">
          <DigitRow
            digits="2.348"
            keepIndex={2}
            note="keeping tenths, so the hundredths digit 4 decides — and 4 is less than 5"
          />
        </div>
        <div className="mt-4 space-y-2">
          {[
            ["Deciding digit is 5 or more", "round up"],
            ["Deciding digit is less than 5", "keep the digit as it is"],
            ["Every digit further right", "no vote — just drop it"],
          ].map(([a, b]) => (
            <div key={a} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm text-ink-700">{a}</span>
              <span className="text-sm font-bold text-ink-900">{b}</span>
            </div>
          ))}
        </div>
        <KeyIdea>
          Round <strong>once</strong>, from the number you started with. Rounding a rounded number
          lets small digits vote twice.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(6)}>Work one through</PrimaryButton>
        </div>
      </Step>

      <Step n={6} title="Round 6.449 to the nearest tenth" open={step === 6} onOpen={() => go(6)} done={step > 6}>
        <div className="rounded-2xl bg-paper p-4">
          <ol className="space-y-2">
            {[
              ["Which place am I keeping?", "tenths → the 4"],
              ["Which digit is immediately right of it?", "4 (hundredths)"],
              ["Is that 5 or more?", "no"],
              ["So keep the tenths digit and drop the rest", "6.4"],
            ].map(([a, b], i) => (
              <li key={i} className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 text-sm">
                <span className="text-ink-700">
                  <span className="mr-2 font-bold text-brand-600">{i + 1}.</span>
                  {a}
                </span>
                <span className="shrink-0 font-bold text-ink-900">{b}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="mt-3">
          <DigitRow digits="6.449" keepIndex={2} />
        </div>
        <div className="mt-3 flex justify-center">
          <ZoomLine from={6.4} to={6.5} value={6.449} caption="6.449 is just below the halfway mark 6.45" />
        </div>
        <p className="mt-3 text-ink-700">
          Rounding in stages would have given 6.449 → 6.45 → 6.5, and been wrong by a whole tenth.
        </p>
        <p className="mt-3 text-ink-700">
          The same number to the nearest <strong>hundredth</strong> is different, because a different
          digit gets the vote:
        </p>
        <div className="mt-3">
          <DigitRow digits="6.449" keepIndex={3} note="now the thousandths digit 9 decides, so round up: 6.45" />
        </div>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(7)}>Money and ranges</PrimaryButton>
        </div>
      </Step>

      <Step n={7} title="Rounding money, and reading it backwards" open={step === 7} onOpen={() => go(7)} done={step > 7}>
        <p className="text-ink-700">
          Rounding to the nearest dollar is rounding to the nearest whole number — the cents are the
          deciding part.
        </p>
        <div className="mt-3 space-y-2">
          {[
            ["$4.62 to the nearest dollar", "62¢ is 50 or more → $5"],
            ["$4.28 to the nearest dollar", "28¢ is under 50 → $4"],
          ].map(([a, b]) => (
            <div key={a} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <span className="text-sm text-ink-700">{a}</span>
              <span className="text-sm font-bold text-ink-900">{b}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-ink-700">
          It also works backwards. If a number rounds to <strong>7</strong>, you know where it came
          from: anywhere from <strong>6.50</strong> up to <strong>7.49</strong>.
        </p>
        <div className="mt-3 flex justify-center">
          <RoundsToBand />
        </div>
        <KeyIdea>
          A rounded value is not one number — it is a whole range of numbers wearing the same label.
        </KeyIdea>
        <div className="mt-4">
          <PrimaryButton onClick={() => go(8)}>Your turn</PrimaryButton>
        </div>
      </Step>

      <Step n={8} title="You try one" open={step === 8} onOpen={() => go(8)} done={false}>
        <p className="text-ink-700">
          Round <strong>3.749</strong> to the nearest tenth.
        </p>
        <div className="mt-3">
          <DigitRow digits="3.749" keepIndex={2} />
        </div>
        <div className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm text-ink-700">
          <span className="font-bold text-brand-600">1. </span>
          You are keeping tenths, so find the digit immediately to its right. Ignore the 9 entirely.
        </div>
        <TryIt
          prompt={<>2. What is 3.749 to the nearest tenth?</>}
          accept={["3.7", "3.70"]}
          placeholder="e.g. 4.5"
          value={fade}
          setValue={setFade}
          hint="the hundredths digit is 4, and 4 is less than 5."
          explain={
            <>
              <strong>3.7.</strong> Rounding in stages would have gone 3.749 → 3.75 → 3.8, letting
              the 9 reach across two places to change the answer. One look, one decision.
            </>
          }
          onCorrect={() => onFinish?.()}
        />
        <div className="mt-5 rounded-xl bg-ink-900 px-4 py-4 text-center font-bold text-white">
          <div className="text-sm font-semibold text-brand-200">Rounding a decimal</div>
          <div className="mt-2">1. Find the place you are keeping</div>
          <div className="mt-1">2. Look at the one digit immediately right of it</div>
          <div className="mt-1">3. 5 or more rounds up, less than 5 stays</div>
          <div className="mt-1">4. Drop everything after — and never round twice</div>
        </div>
        <KeyIdea>
          💡 Always round from the original number. Rounding a rounded number lets a distant digit
          change an answer it should never have touched.
        </KeyIdea>
      </Step>
    </LessonShell>
  );
}
