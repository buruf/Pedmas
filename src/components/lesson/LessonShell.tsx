"use client";

import { MathText } from "@/components/MathText";

/**
 * Chrome shared by every lesson: where you are in the curriculum, what this
 * lesson is called, how long it takes, and how far through you are.
 *
 * Kept deliberately plain — the visuals inside the steps should be the only
 * thing competing for a child's attention.
 */
export function LessonShell({
  breadcrumb,
  title,
  minutes,
  step,
  total,
  children,
}: {
  breadcrumb: string;
  title: string;
  minutes: number;
  step: number;
  total: number;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-brand-600">{breadcrumb}</div>
        <h1 className="mt-1 text-2xl font-black text-ink-900">
          <MathText text={title} />
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          About {minutes} minutes · then you&rsquo;ll practise
        </p>
      </div>

      <div className="space-y-3">{children}</div>

      <div className="sticky bottom-0 mt-6 rounded-2xl border border-ink-100 bg-white/95 px-4 py-3 backdrop-blur">
        <div className="h-2 w-full overflow-hidden rounded-full bg-ink-100">
          <div
            className="h-full rounded-full bg-brand-500 transition-all"
            style={{ width: `${(step / total) * 100}%` }}
          />
        </div>
        <div className="mt-1 text-xs text-ink-500">
          Step {step} of {total}
        </div>
      </div>
    </div>
  );
}

/** Estimate prompt used to sanity-check an answer before computing it. */
export function EstimateCheck({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-3 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-ink-700">
      🔎 <strong>Rough check first:</strong> {children}
    </div>
  );
}

/** "You try one" input with tolerant checking and a specific nudge on a miss. */
export function TryIt({
  prompt,
  accept,
  placeholder,
  onCorrect,
  hint,
  explain,
  value,
  setValue,
}: {
  prompt: React.ReactNode;
  accept: string[];
  placeholder: string;
  onCorrect: () => void;
  hint: string;
  explain: React.ReactNode;
  value: string;
  setValue: (v: string) => void;
}) {
  const cleaned = value.replace(/\s|,/g, "");
  const answered = cleaned !== "";
  const right = accept.includes(cleaned);
  return (
    <div>
      <label className="mt-4 block text-sm font-semibold text-ink-700">
        {prompt}
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          inputMode="numeric"
          className="mt-1 text-center text-lg font-bold"
        />
      </label>
      {answered && (
        <div className="mt-3 pop-in">
          {right ? (
            <div className="rounded-xl border border-ok-600/30 bg-ok-100 px-4 py-3">
              <p className="font-bold text-ink-900">✓ Correct! Great work.</p>
              <div className="mt-1 text-sm text-ink-700">{explain}</div>
              <div className="mt-3">
                <button
                  type="button"
                  onClick={onCorrect}
                  className="btn rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
                >
                  Next
                </button>
              </div>
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
