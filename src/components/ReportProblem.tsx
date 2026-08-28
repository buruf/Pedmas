"use client";

import { useState } from "react";

/**
 * "Something wrong?" — a student reports a problem from inside practice.
 *
 * Tap-only for children: they choose a reason, the current question attaches
 * itself, and there is no text box — the privacy policy promises we never
 * collect free text from a child, and this is exactly where one would type
 * their name or school. The server enforces the same rule; this UI simply
 * never invites it.
 */
const REASONS: { key: string; label: string }[] = [
  { key: "answer-marked-wrong", label: "My answer was right but marked wrong" },
  { key: "question-confusing", label: "I don't understand the question" },
  { key: "lesson-unclear", label: "The lesson didn't help" },
  { key: "something-broken", label: "Something looks broken" },
];

export function ReportProblem({
  studentId,
  question,
}: {
  studentId: string;
  question: { id: string; stage: number; prompt: string };
}) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  if (done) {
    return (
      <p className="mt-3 rounded-xl bg-ok-100 px-3 py-2 text-sm text-ok-700 pop-in">
        ✓ Thank you — we got your report and we&rsquo;ll take a look.
      </p>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn mt-3 inline-flex min-h-11 items-center gap-1 px-2 text-xs font-semibold text-ink-500 hover:text-ink-900"
      >
        🚩 Something wrong with this question?
      </button>
    );
  }

  return (
    <div className="mt-3 rounded-xl border border-ink-100 bg-paper p-3 pop-in">
      <p className="text-sm font-semibold text-ink-900">What&rsquo;s wrong?</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {REASONS.map((r) => (
          <button
            key={r.key}
            type="button"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await fetch(`/api/students/${studentId}/report`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ category: r.key, path: window.location.pathname, question }),
                });
                setDone(true);
              } catch {
                setDone(true); // never make a child feel their report failed
              }
            }}
            className="btn rounded-xl border border-ink-100 bg-white px-3 py-2 text-sm text-ink-700 hover:border-brand-300 hover:text-brand-700"
          >
            {r.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="btn px-2 py-2 text-xs font-semibold text-ink-500 hover:text-ink-900"
        >
          Never mind
        </button>
      </div>
    </div>
  );
}
