"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Logo, Card, PrimaryButton, ProgressBar } from "@/components/ui";
import { QuestionView, FeedbackPanel } from "@/components/QuestionView";
import { WorkedExample, type WorkedExampleData } from "@/components/WorkedExample";
import { api, ApiError } from "@/lib/client";
import type { ClientQuestion } from "@/lib/model";

interface PracticePayload {
  total: number;
  index: number;
  complete: boolean;
  summary: { firstTry: number; answered: number; purposes: string[] };
  current: { question: ClientQuestion; purpose: string; attempts: number } | null;
  streak: number;
}
interface AnswerPayload {
  correct: boolean;
  attempts: number;
  moveOn: boolean;
  correctAnswer?: string;
  steps?: string[];
  concept?: string;
  sessionComplete: boolean;
  stageAdvanced?: boolean;
  skillMastered?: boolean;
  skillName?: string;
}

export default function PracticePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [state, setState] = useState<PracticePayload | null>(null);
  const [feedback, setFeedback] = useState<AnswerPayload | null>(null);
  const [retryNonce, setRetryNonce] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [locked, setLocked] = useState<string | null>(null);
  const [example, setExample] = useState<WorkedExampleData | null>(null);
  const [exampleBusy, setExampleBusy] = useState(false);

  const load = useCallback(() => {
    api<PracticePayload>(`/api/students/${id}/practice`)
      .then(setState)
      .catch((e) => {
        if (e instanceof ApiError && e.status === 402) setLocked(e.message);
        else setError(e instanceof Error ? e.message : "Failed to load");
      });
  }, [id]);

  useEffect(load, [load]);

  const submit = async (answer: string, usedHint: boolean) => {
    setBusy(true);
    try {
      const res = await api<AnswerPayload>(`/api/students/${id}/practice`, {
        method: "POST",
        json: { answer, usedHint },
      });
      setFeedback(res);
    } catch (e) {
      if (e instanceof ApiError && e.status === 402) setLocked(e.message);
      else setError(e instanceof Error ? e.message : "Failed to submit");
    } finally {
      setBusy(false);
    }
  };

  const next = () => {
    setFeedback(null);
    // The example belongs to the question that was on screen.
    setExample(null);
    load();
  };
  const retry = () => {
    setFeedback(null);
    setRetryNonce((n) => n + 1);
  };

  if (locked) {
    return (
      <Shell id={id}>
        <Card className="pop-in text-center">
          <div className="text-4xl">🔓</div>
          <h1 className="mt-2 text-2xl font-extrabold text-ink-900">Unlock daily practice</h1>
          <p className="mx-auto mt-2 max-w-md text-ink-700">{locked}</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-500">
            The placement test and your child&rsquo;s starting profile stay free — a subscription adds
            the personalised daily session, mastery tracking and spaced review.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <PrimaryButton href="/pricing">See plans</PrimaryButton>
            <Link
              href={`/app/${id}`}
              className="btn inline-flex min-h-11 items-center rounded-xl border border-ink-100 bg-white px-4 text-sm font-semibold text-ink-700 hover:border-brand-300"
            >
              Back to dashboard
            </Link>
          </div>
        </Card>
      </Shell>
    );
  }

  if (error) return <Shell id={id}><p className="text-err-600">{error}</p></Shell>;
  if (!state) return <Shell id={id}><p className="text-ink-500">Building today&rsquo;s practice…</p></Shell>;

  if (state.complete || !state.current) {
    const pct = state.total ? Math.round((state.summary.firstTry / state.total) * 100) : 0;
    return (
      <Shell id={id}>
        <Card className="pop-in text-center">
          <div className="text-5xl">{pct >= 90 ? "🏆" : pct >= 70 ? "🎉" : "💪"}</div>
          <h1 className="mt-2 text-2xl font-extrabold text-ink-900">Practice complete!</h1>
          <p className="mt-1 text-ink-700">
            {state.summary.firstTry} of {state.total} correct on the first try
            {pct >= 90 ? " — outstanding!" : pct >= 70 ? " — great work!" : " — every attempt makes you stronger."}
          </p>
          {state.streak > 0 && (
            <p className="mt-3 inline-block rounded-full bg-warn-100 px-4 py-1.5 font-bold text-warn-600">
              🔥 {state.streak}-day streak
            </p>
          )}
          <div className="mt-5 flex justify-center gap-3">
            <PrimaryButton href={`/app/${id}`}>Back to dashboard</PrimaryButton>
          </div>
        </Card>
      </Shell>
    );
  }

  const cur = state.current;
  return (
    <Shell id={id}>
      <div className="mb-4">
        <div className="mb-1.5 flex items-center justify-between text-xs font-semibold text-ink-500">
          <span className="rounded-full bg-brand-100 px-2 py-0.5 text-brand-700">{cur.purpose}</span>
          <span>
            Question {state.index + 1} of {state.total}
          </span>
        </div>
        <ProgressBar value={(state.index / state.total) * 100} />
      </div>
      <Card>
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">
          {cur.question.strandName} · {cur.question.topicName} · Stage {cur.question.stage} of 5
        </div>
        <QuestionView
          question={cur.question}
          resetKey={`${cur.question.id}-${retryNonce}`}
          disabled={busy || Boolean(feedback)}
          onSubmit={(a, h) => void submit(a, h)}
        />

        {/* Teaching support: a parallel worked example, never this question's answer. */}
        {!feedback && !example && (
          <button
            type="button"
            disabled={exampleBusy}
            onClick={() => {
              setExampleBusy(true);
              api<WorkedExampleData>(`/api/students/${id}/practice/example`)
                .then(setExample)
                .catch(() => setError("Could not load an example just now."))
                .finally(() => setExampleBusy(false));
            }}
            className="btn mt-3 inline-flex items-center gap-1.5 rounded-xl border border-brand-200 bg-brand-50 px-4 py-2.5 text-sm font-semibold text-brand-700 hover:bg-brand-100"
          >
            {exampleBusy ? "Getting an example…" : "▶ Show me how"}
          </button>
        )}
        {example && <WorkedExample data={example} onClose={() => setExample(null)} />}
        {feedback && !feedback.moveOn && (
          <div className="mt-4 rounded-2xl border border-warn-600/30 bg-warn-100 p-4 pop-in">
            <div className="font-bold text-ink-900">Not quite — you&rsquo;ve got this. Try again!</div>
            {feedback.steps?.[0] && (
              <p className="mt-1 text-sm text-ink-700">💡 {feedback.steps[0]}</p>
            )}
            <div className="mt-3">
              <PrimaryButton onClick={retry}>Try again</PrimaryButton>
            </div>
          </div>
        )}
        {feedback && feedback.moveOn && (
          <>
            {(feedback.stageAdvanced || feedback.skillMastered) && (
              <div className="mt-4 rounded-2xl bg-brand-600 px-4 py-3 text-white pop-in">
                {feedback.skillMastered
                  ? `🏅 Skill mastered: ${feedback.skillName}! It moves into spaced review now.`
                  : `⬆️ Stage up in ${feedback.skillName}! The questions level up with you.`}
              </div>
            )}
            <FeedbackPanel
              correct={feedback.correct}
              moveOn
              correctAnswer={feedback.correctAnswer}
              steps={feedback.steps}
              concept={feedback.concept}
              onNext={next}
              nextLabel={feedback.sessionComplete ? "Finish session" : "Next question"}
            />
          </>
        )}
      </Card>
    </Shell>
  );
}

function Shell({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-6">
      <header className="mb-6 flex items-center justify-between">
        <Link href={`/app/${id}`} className="inline-flex min-h-11 items-center"><Logo /></Link>
        <Link
          href={`/app/${id}`}
          className="-mr-2 inline-flex min-h-11 items-center px-2 text-sm font-semibold text-ink-500 hover:text-ink-900"
        >
          ← Exit practice
        </Link>
      </header>
      {children}
    </div>
  );
}
