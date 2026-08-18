"use client";

import { useEffect, useState } from "react";
import { MathText } from "./MathText";
import { PrimaryButton } from "./ui";
import type { ClientQuestion } from "@/lib/model";

/**
 * One-question-at-a-time practice card: MC choices or a typed answer with
 * an on-screen keypad, plus an optional hint. Feedback is the parent's job.
 */
export function QuestionView({
  question,
  onSubmit,
  disabled,
  resetKey,
  band,
}: {
  question: ClientQuestion;
  onSubmit: (answer: string, usedHint: boolean) => void;
  disabled?: boolean;
  resetKey: string;
  /** Age-appropriate sizing (spec §25); defaults suit the middle years. */
  band?: { questionText: string; touchTarget: string; radius: string };
}) {
  const size = band?.questionText ?? "text-2xl";
  const target = band?.touchTarget ?? "min-h-11";
  const radius = band?.radius ?? "rounded-xl";
  const [answer, setAnswer] = useState("");
  const [choice, setChoice] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    setAnswer("");
    setChoice(null);
    setShowHint(false);
  }, [resetKey]);

  const canSubmit = question.kind === "mc" ? choice !== null : answer.trim().length > 0;
  const submit = () => {
    if (!canSubmit || disabled) return;
    onSubmit(question.kind === "mc" ? choice! : answer.trim(), showHint);
  };

  const pad = ["7", "8", "9", "4", "5", "6", "1", "2", "3", "0", ".", "/"];

  return (
    <div>
      <div className="text-sm font-semibold text-ink-500">
        <MathText text={question.instruction} />
      </div>
      <div className={`mt-3 whitespace-pre-line ${size} font-bold leading-relaxed text-ink-900`}>
        <MathText text={question.prompt} />
      </div>

      {question.kind === "mc" ? (
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          {question.choices?.map((c) => (
            <button
              key={c}
              type="button"
              disabled={disabled}
              onClick={() => setChoice(c)}
              className={`btn ${radius} ${target} border-2 px-4 py-3 text-left text-lg font-semibold transition ${
                choice === c
                  ? "border-brand-600 bg-brand-50 text-brand-800"
                  : "border-ink-100 bg-white text-ink-900 hover:border-brand-300"
              }`}
            >
              <MathText text={c} />
            </button>
          ))}
        </div>
      ) : (
        <div className="mt-5">
          <input
            type="text"
            inputMode={question.answerFormat === "text" ? "text" : "decimal"}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
            }}
            placeholder={question.answerHint ?? "Type your answer"}
            disabled={disabled}
            className="text-center text-xl font-bold"
            aria-label="Your answer"
          />
          {question.answerFormat !== "text" && (
            <div className="mx-auto mt-3 grid max-w-xs grid-cols-3 gap-2 sm:hidden">
              {pad.map((k) => (
                <button
                  key={k}
                  type="button"
                  disabled={disabled}
                  onClick={() => setAnswer((a) => a + k)}
                  className="btn rounded-xl border border-ink-100 bg-white py-2.5 text-lg font-bold text-ink-900 active:bg-brand-50"
                >
                  {k}
                </button>
              ))}
              <button
                type="button"
                disabled={disabled}
                onClick={() => setAnswer((a) => a.slice(0, -1))}
                className="btn col-span-2 rounded-xl border border-ink-100 bg-white py-2.5 text-sm font-bold text-ink-700"
              >
                ⌫ Delete
              </button>
              <button
                type="button"
                disabled={disabled}
                onClick={() => setAnswer((a) => (a.startsWith("-") ? a.slice(1) : `-${a}`))}
                className="btn rounded-xl border border-ink-100 bg-white py-2.5 text-lg font-bold text-ink-900"
              >
                ±
              </button>
            </div>
          )}
        </div>
      )}

      <div className="mt-5 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setShowHint(true)}
          disabled={disabled}
          className="btn inline-flex items-center gap-1.5 rounded-xl border border-ink-100 bg-white px-4 py-2.5 text-sm font-semibold text-ink-700 hover:border-brand-300 hover:text-brand-700"
        >
          💡 Hint
        </button>
        <PrimaryButton onClick={submit} disabled={disabled || !canSubmit}>
          Submit Answer
        </PrimaryButton>
      </div>
      {showHint && (
        <div className="mt-3 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-ink-700 pop-in">
          💡 <MathText text={question.hint} />
        </div>
      )}
    </div>
  );
}

export function FeedbackPanel({
  correct,
  moveOn,
  correctAnswer,
  steps,
  concept,
  onNext,
  nextLabel,
  neutral,
}: {
  correct: boolean;
  moveOn: boolean;
  correctAnswer?: string;
  steps?: string[];
  concept?: string;
  onNext: () => void;
  nextLabel: string;
  /**
   * Placement mode: report nothing about right or wrong. A diagnostic exists
   * to find a level, and a child who is placed correctly will miss roughly
   * half of it by design — telling them so each time only discourages them.
   */
  neutral?: boolean;
}) {
  if (neutral) {
    return (
      <div className="mt-4 rounded-2xl border border-brand-200 bg-brand-50 p-4 pop-in">
        <div className="text-base font-bold text-ink-900">Answer saved 👍</div>
        <p className="mt-1 text-sm text-ink-700">
          There&rsquo;s no pass or fail here — we&rsquo;re just finding the right place to start.
        </p>
        <div className="mt-3">
          <PrimaryButton onClick={onNext}>{nextLabel}</PrimaryButton>
        </div>
      </div>
    );
  }
  return (
    <div
      className={`mt-4 rounded-2xl border p-4 pop-in ${
        correct ? "border-ok-600/30 bg-ok-100" : moveOn ? "border-ink-300 bg-paper" : "border-warn-600/30 bg-warn-100"
      }`}
    >
      <div className="text-base font-bold text-ink-900">
        {correct ? "✓ Correct! Great work!" : moveOn ? "Let's look at this one together." : "Not yet — try again!"}
      </div>
      {!correct && moveOn && correctAnswer && (
        <div className="mt-1 text-sm text-ink-700">
          The answer is <span className="font-bold"><MathText text={correctAnswer} /></span>.
        </div>
      )}
      {steps && steps.length > 0 && (correct || moveOn) && (
        <ol className="mt-2 space-y-1.5">
          {steps.map((s, i) => (
            <li key={i} className="flex gap-2 text-sm text-ink-700">
              <span className="font-bold text-brand-600">{i + 1}.</span>
              <span><MathText text={s} /></span>
            </li>
          ))}
        </ol>
      )}
      {!correct && !moveOn && steps?.[0] && (
        <p className="mt-1 text-sm text-ink-700">
          💡 <MathText text={steps[0]} />
        </p>
      )}
      {concept && (correct || moveOn) && (
        <p className="mt-2 rounded-xl bg-white/70 px-3 py-2 text-sm text-ink-700">
          <span className="font-semibold">Key concept:</span> <MathText text={concept} />
        </p>
      )}
      {(correct || moveOn) && (
        <div className="mt-3">
          <PrimaryButton onClick={onNext}>{nextLabel}</PrimaryButton>
        </div>
      )}
    </div>
  );
}
