"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Logo, Card, PrimaryButton, ProgressBar, StatusPill } from "@/components/ui";
import { QuestionView, FeedbackPanel } from "@/components/QuestionView";
import { api } from "@/lib/client";
import type { ClientQuestion } from "@/lib/model";

interface CurrentPayload {
  done: boolean;
  report?: ReportRow[];
  current?: {
    question: ClientQuestion;
    strandName: string;
    progress: { asked: number; estimatedTotal: number; strandIndex: number; strandCount: number };
  } | null;
}
interface ReportRow {
  strandId: string;
  strandName: string;
  level: number;
  status: string;
}
interface AnswerPayload {
  correct: boolean;
  steps: string[];
  concept: string;
  correctAnswer: string;
  done: boolean;
  report: ReportRow[] | null;
}

export default function PlacementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [state, setState] = useState<CurrentPayload | null>(null);
  const [feedback, setFeedback] = useState<AnswerPayload | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    api<CurrentPayload>(`/api/students/${id}/placement`)
      .then(setState)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"));
  }, [id]);

  useEffect(load, [load]);

  const submit = async (answer: string) => {
    setBusy(true);
    try {
      const res = await api<AnswerPayload>(`/api/students/${id}/placement`, {
        method: "POST",
        json: { answer },
      });
      setFeedback(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to submit");
    } finally {
      setBusy(false);
    }
  };

  const next = () => {
    if (feedback?.done && feedback.report) {
      setState({ done: true, report: feedback.report });
    } else {
      load();
    }
    setFeedback(null);
  };

  if (error) return <Shell><p className="text-err-600">{error}</p></Shell>;
  if (!state) return <Shell><p className="text-ink-500">Preparing your placement…</p></Shell>;

  if (state.done || (feedback?.done && feedback.report)) {
    const report = state.report ?? feedback?.report ?? [];
    return (
      <Shell>
        <Card className="pop-in">
          <h1 className="text-2xl font-extrabold text-ink-900">Your Starting Point</h1>
          <p className="mt-1 text-sm text-ink-500">
            PEDMAS uses this profile to create your personalized practice. Every strand starts
            exactly where you&rsquo;re ready to learn.
          </p>
          <div className="mt-5 overflow-hidden rounded-xl border border-ink-100">
            <table className="w-full text-sm">
              <thead className="bg-paper text-left text-xs uppercase tracking-wide text-ink-500">
                <tr>
                  <th className="px-4 py-2.5">Strand</th>
                  <th className="px-4 py-2.5">Current level</th>
                  <th className="px-4 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody>
                {report.map((r) => (
                  <tr key={r.strandId} className="border-t border-ink-100">
                    <td className="px-4 py-2.5 font-medium text-ink-900">{r.strandName}</td>
                    <td className="px-4 py-2.5 text-ink-700">Grade {r.level}</td>
                    <td className="px-4 py-2.5"><StatusPill status={r.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 rounded-xl bg-brand-50 px-4 py-3 text-sm text-ink-700">
            💜 Remember: different levels in different strands is completely normal — that&rsquo;s
            exactly what PEDMAS is built for.
          </p>
          <div className="mt-5">
            <PrimaryButton href={`/app/${id}`}>Go to my dashboard</PrimaryButton>
          </div>
        </Card>
      </Shell>
    );
  }

  const cur = state.current;
  if (!cur) return <Shell><p className="text-ink-500">Loading question…</p></Shell>;
  const pct = Math.min(95, (cur.progress.asked / cur.progress.estimatedTotal) * 100);

  return (
    <Shell>
      <div className="mb-4">
        <div className="mb-1.5 flex items-center justify-between text-xs font-semibold text-ink-500">
          <span>
            Finding your level · {cur.strandName} ({cur.progress.strandIndex + 1}/{cur.progress.strandCount})
          </span>
          <span>Question {cur.progress.asked + 1}</span>
        </div>
        <ProgressBar value={pct} />
      </div>
      <Card>
        <QuestionView
          question={cur.question}
          resetKey={cur.question.id}
          disabled={busy || Boolean(feedback)}
          onSubmit={(a) => void submit(a)}
        />
        {feedback && (
          <FeedbackPanel
            correct={feedback.correct}
            moveOn
            neutral
            onNext={next}
            nextLabel={feedback.done ? "See my results" : "Next question"}
          />
        )}
      </Card>
      <p className="mt-4 text-center text-xs text-ink-500">
        The test adapts to you — harder after correct answers, gentler after misses. Just do your best.
      </p>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-6">
      <header className="mb-6 flex items-center justify-between">
        <Link href="/"><Logo /></Link>
        <Link href="/home" className="text-sm font-semibold text-ink-500 hover:text-ink-900">
          Exit
        </Link>
      </header>
      {children}
    </div>
  );
}
