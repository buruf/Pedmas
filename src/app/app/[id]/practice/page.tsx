"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Logo, Card, PrimaryButton, ProgressBar } from "@/components/ui";
import { QuestionView, FeedbackPanel } from "@/components/QuestionView";
import { WorkedExample, type WorkedExampleData } from "@/components/WorkedExample";
import { LESSON_COMPONENTS } from "@/components/lesson/registry";
import { RegionText } from "@/components/lesson/RegionText";
import type { Region } from "@/lib/region";
import { api, ApiError } from "@/lib/client";
import { ReportProblem } from "@/components/ReportProblem";
import type { LessonKey } from "@/lib/lessons";
import { styleForGrade } from "@/lib/ageBand";
import type { ClientQuestion } from "@/lib/model";

interface PracticePayload {
  grade: number;
  /** Which teaching variant this family reads (spelling and terminology). */
  region?: Region;
  total: number;
  index: number;
  complete: boolean;
  summary: { firstTry: number; answered: number; purposes: string[] };
  current: {
    question: ClientQuestion;
    purpose: string;
    attempts: number;
    lesson: { key: LessonKey; title: string; seen: boolean } | null;
  } | null;
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
  /** Set when mastery freed the rest of the session for the next skill. */
  nextSkillName?: string;
}

export default function PracticePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [state, setState] = useState<PracticePayload | null>(null);
  const [feedback, setFeedback] = useState<AnswerPayload | null>(null);
  const [retryNonce, setRetryNonce] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [locked, setLocked] = useState<string | null>(null);
  // A child signed in with their own code cannot buy anything.
  const [lockedForChild, setLockedForChild] = useState(false);
  const [example, setExample] = useState<WorkedExampleData | null>(null);
  const [exampleBusy, setExampleBusy] = useState(false);
  /** Lesson the student chose to skip or has finished this session. */
  const [lessonDismissed, setLessonDismissed] = useState<LessonKey | null>(null);
  /** Lesson reopened deliberately from the practice screen. */
  const [lessonReopened, setLessonReopened] = useState<LessonKey | null>(null);

  const load = useCallback(() => {
    api<PracticePayload>(`/api/students/${id}/practice`)
      .then(setState)
      .catch((e) => {
        if (e instanceof ApiError && e.status === 402) {
          setLocked(e.message);
          setLockedForChild(Boolean((e.data as { child?: boolean }).child));
        }
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
      if (e instanceof ApiError && e.status === 402) {
          setLocked(e.message);
          setLockedForChild(Boolean((e.data as { child?: boolean }).child));
        }
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

  if (locked && lockedForChild) {
    // No pricing, no "start a trial": a child cannot act on either, and a
    // payment wall is not something to put in front of a child at all.
    return (
      <Shell id={id}>
        <Card className="pop-in text-center">
          <div className="text-4xl">⏳</div>
          <h1 className="mt-2 text-2xl font-extrabold text-ink-900">Almost ready!</h1>
          <p className="mx-auto mt-2 max-w-md text-ink-700">
            Your practice is not switched on yet. Ask a grown-up to finish setting up PEDMAS,
            and your questions will be here waiting.
          </p>
          <div className="mt-5 flex justify-center">
            <Link
              href={`/app/${id}`}
              className="btn inline-flex min-h-11 items-center rounded-xl border border-ink-100 bg-white px-4 text-sm font-semibold text-ink-700 hover:border-brand-300"
            >
              Back to my dashboard
            </Link>
          </div>
        </Card>
      </Shell>
    );
  }

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
  const band = styleForGrade(state?.grade ?? 5);

  const cur = state.current;

  // Teach before drilling: a new idea gets its lesson first, and any lesson
  // can be reopened on demand. Skipping is allowed — some children already
  // know it, and forcing them through it would be its own kind of failure.
  const lesson = cur.lesson;
  const showLesson =
    lesson &&
    (lessonReopened === lesson.key ||
      (!lesson.seen && lessonDismissed !== lesson.key));
  if (showLesson && lesson) {
    const LessonBody = LESSON_COMPONENTS[lesson.key];
    const finish = () => {
      void api(`/api/students/${id}/lesson`, {
        method: "POST",
        body: JSON.stringify({ key: lesson.key }),
      }).catch(() => undefined);
      setLessonReopened(null);
      setLessonDismissed(lesson.key);
      load();
    };
    return (
      <Shell id={id}>
        <div className="mb-4 flex items-center justify-between gap-3">
          <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-bold text-brand-700">
            📘 Learn this first
          </span>
          <button
            type="button"
            onClick={finish}
            className="btn rounded-xl px-3 py-2 text-sm font-semibold text-ink-500 hover:text-ink-900"
          >
            Skip to practice →
          </button>
        </div>
        <Card>
          <RegionText region={state?.region ?? "INTL"}>
            <LessonBody onFinish={finish} />
          </RegionText>
        </Card>
      </Shell>
    );
  }

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
          {/* Grade → strand → topic → micro-skill → stage (spec §5). */}
          {cur.question.strandName} › {cur.question.topicName} ›{" "}
          <span className="font-semibold text-brand-700">{cur.question.microSkill}</span> · Stage{" "}
          {cur.question.stage} of {cur.question.stageCount}
        </div>
        <QuestionView
              band={band}
          question={cur.question}
          resetKey={`${cur.question.id}-${retryNonce}`}
          disabled={busy || Boolean(feedback)}
          onSubmit={(a, h) => void submit(a, h)}
        />

        {/* Teaching support: a parallel worked example, never this question's answer. */}
        {!feedback && !example && lesson && (
          <button
            type="button"
            onClick={() => setLessonReopened(lesson.key)}
            className="btn mr-2 mt-3 inline-flex items-center gap-1.5 rounded-xl border border-ink-100 bg-white px-4 py-2.5 text-sm font-semibold text-ink-700 hover:border-brand-300 hover:text-brand-700"
          >
            📘 Read the lesson
          </button>
        )}
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
        <ReportProblem
          studentId={id}
          question={{
            id: cur.question.id,
            stage: cur.question.stage,
            prompt: cur.question.prompt,
          }}
        />
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
                  ? feedback.nextSkillName
                    ? `🏅 ${feedback.skillName} mastered! Next up: ${feedback.nextSkillName} — starting now.`
                    : `🏅 Skill mastered: ${feedback.skillName}! It moves into spaced review now.`
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
