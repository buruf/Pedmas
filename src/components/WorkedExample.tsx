"use client";

import { useState } from "react";
import { MathText } from "./MathText";

export interface WorkedExampleData {
  instruction: string;
  prompt: string;
  answer: string;
  steps: string[];
  concept: string;
  skillName: string;
}

/**
 * "Show me how" support during practice.
 *
 * Shows a *different* problem from the one on screen and walks it one step at
 * a time. Two reasons for the design: revealing the live answer would teach
 * copying rather than the method, and releasing steps one at a time keeps the
 * child reading each line instead of skipping to the end.
 */
export function WorkedExample({
  data,
  onClose,
}: {
  data: WorkedExampleData;
  onClose: () => void;
}) {
  const [shown, setShown] = useState(1);
  const done = shown >= data.steps.length;

  return (
    <div className="mt-4 rounded-2xl border-2 border-brand-200 bg-brand-50/60 p-4 pop-in">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-bold uppercase tracking-wide text-brand-700">
            Let&rsquo;s work through a different one
          </div>
          <p className="mt-1 text-xs text-ink-500">
            Not the question you&rsquo;re on — try that one yourself afterwards.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="btn shrink-0 rounded-lg px-2 py-1 text-sm font-semibold text-ink-500 hover:text-ink-900"
          aria-label="Close the worked example"
        >
          ✕
        </button>
      </div>

      <div className="mt-3 rounded-xl bg-white px-4 py-3">
        <div className="text-sm font-semibold text-ink-500">{data.instruction}</div>
        <div className="mt-1 text-xl font-bold text-ink-900">
          <MathText text={data.prompt} />
        </div>
      </div>

      <ol className="mt-3 space-y-2">
        {data.steps.slice(0, shown).map((s, i) => (
          <li key={i} className="flex gap-2 rounded-xl bg-white px-3 py-2 text-sm text-ink-700 pop-in">
            <span className="font-bold text-brand-600">{i + 1}.</span>
            <span>
              <MathText text={s} />
            </span>
          </li>
        ))}
      </ol>

      {!done ? (
        <button
          type="button"
          onClick={() => setShown((n) => n + 1)}
          className="btn mt-3 w-full rounded-xl border-2 border-brand-300 bg-white px-4 py-2.5 text-sm font-bold text-brand-700 hover:bg-brand-50"
        >
          Next step ({shown} of {data.steps.length})
        </button>
      ) : (
        <>
          <div className="mt-3 rounded-xl border border-ok-600/30 bg-ok-100 px-4 py-2.5 text-sm">
            <span className="font-semibold text-ink-900">Answer: </span>
            <span className="font-bold text-ink-900">
              <MathText text={data.answer} />
            </span>
          </div>
          {data.concept && (
            <p className="mt-2 rounded-xl bg-white px-3 py-2 text-sm text-ink-700">
              <span className="font-semibold">Key concept:</span>{" "}
              <MathText text={data.concept} />
            </p>
          )}
          <button
            type="button"
            onClick={onClose}
            className="btn mt-3 w-full rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-700"
          >
            Got it — back to my question
          </button>
        </>
      )}
    </div>
  );
}
