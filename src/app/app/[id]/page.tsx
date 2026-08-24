"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo, Card, PrimaryButton, GhostButton, ProgressBar, StatusPill } from "@/components/ui";
import { styleForGrade } from "@/lib/ageBand";
import { api } from "@/lib/client";

interface StudentPayload {
  id: string;
  name: string;
  grade: number;
  placed: boolean;
  progress: {
    strands: {
      strandId: string;
      strandName: string;
      level: number;
      percent: number;
      currentSkill: {
        id: string;
        name: string;
        grade: number;
        stage: number;
        stageLabel: string;
        lessonKey: string | null;
        lessonTitle: string | null;
        progress: number;
      } | null;
    }[];
    gradeProgress: { grade: number; mastered: number; total: number };
    focus: {
      id: string;
      name: string;
      grade: number;
      strandName: string;
      stage: number;
      stageLabel: string;
      progress: number;
      isRepair: boolean;
      lessonKey: string | null;
      lessonTitle: string | null;
    } | null;
    masteredCount: number;
    masteredRecent: string[];
    streak: { count: number; lastDay: string };
    accuracy: number | null;
    placed: boolean;
  };
}

export default function StudentDashboard({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [data, setData] = useState<StudentPayload | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<StudentPayload>(`/api/students/${id}`)
      .then((d) => {
        if (!d.placed) router.replace(`/placement/${id}`);
        else setData(d);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"));
  }, [id, router]);

  if (error) return <div className="p-8 text-err-600">{error}</div>;
  if (!data) return <div className="grid min-h-screen place-items-center text-ink-500">Loading your dashboard…</div>;

  const p = data.progress;
  const band = styleForGrade(data.grade);
  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <header className="mb-6 flex items-center justify-between">
        <Link href="/home"><Logo /></Link>
        <div className="flex items-center gap-3">
          {p.streak.count > 0 && (
            <span className="rounded-full bg-warn-100 px-3 py-1 text-sm font-bold text-warn-600">
              🔥 {p.streak.count} day{p.streak.count > 1 ? "s" : ""}
            </span>
          )}
          <span className="hidden rounded-full bg-ink-100 px-3 py-1 text-sm font-semibold text-ink-700 sm:inline">
            {data.name} · Grade {data.grade}
          </span>
        </div>
      </header>

      {/* Tone matures with the student's year — see lib/ageBand.ts (spec §25). */}
      <h1 className="text-2xl font-extrabold text-ink-900">{band.greeting(data.name)}</h1>
      <p className="mt-1 text-ink-500">
        {band.playful
          ? "Let’s keep your math skills growing."
          : "Your next session is ready."}
      </p>

      {/* Today's practice */}
      <Card className="mt-6 bg-gradient-to-br from-brand-600 to-brand-800 !border-0 text-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="text-xs font-semibold uppercase tracking-wide text-brand-200">
              {p.focus?.isRepair ? "Building up to your next topic" : "Today you are working on"}
            </div>
            <div className="mt-0.5 text-lg font-bold">
              {p.focus ? p.focus.name : "Today’s Practice"}
            </div>
            <div className="mt-0.5 text-sm text-brand-100">
              {p.focus
                ? `${p.focus.strandName} · Stage ${p.focus.stage} of 5 — ${p.focus.stageLabel}`
                : "12 questions · picked for exactly where you are"}
            </div>
            {p.focus && (
              <div className="mt-2 text-xs text-brand-100">
                You will stay on this until you have mastered it.
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {p.focus?.lessonKey && (
              <Link
                href={`/app/${id}/learn/${p.focus.lessonKey}`}
                title={p.focus.lessonTitle ?? undefined}
                className={`btn inline-flex items-center ${band.radius} ${band.touchTarget} border border-white/40 px-4 py-3 font-bold text-white transition hover:bg-white/10`}
              >
                📘 Learn it first
              </Link>
            )}
            <Link
              href={`/app/${id}/practice`}
              className={`btn inline-flex items-center ${band.radius} ${band.touchTarget} bg-white px-6 py-3 font-bold text-brand-700 shadow-sm transition hover:bg-brand-50 active:scale-[0.98]`}
            >
              {band.practiceCta} →
            </Link>
          </div>
        </div>
      </Card>

      {/* Strand progress */}
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-ink-900">Grade {p.gradeProgress.grade}</h2>
                <p className="mt-0.5 text-xs text-ink-500">
                  You are working through Grade {p.gradeProgress.grade}. Finish every skill here and
                  Grade {p.gradeProgress.grade + 1} opens.
                </p>
              </div>
              <GhostButton href={`/app/${id}/path`} className="!px-3 !py-1.5 text-xs">
                View my path
              </GhostButton>
            </div>
            <div className="mt-4">
              <div className="flex items-baseline justify-between text-sm">
                <span className="font-semibold text-ink-900">
                  {p.gradeProgress.mastered} of {p.gradeProgress.total} skills mastered
                </span>
                <span className="text-xs text-ink-500">
                  {Math.round((p.gradeProgress.mastered / Math.max(1, p.gradeProgress.total)) * 100)}%
                </span>
              </div>
              <div className="mt-2">
                <ProgressBar
                  value={Math.round((p.gradeProgress.mastered / Math.max(1, p.gradeProgress.total)) * 100)}
                />
              </div>            </div>
          </Card>
        </div>
        <div className="space-y-4">
          <Card>
            <h2 className="font-bold text-ink-900">You&rsquo;ve mastered</h2>
            <div className="mt-1 text-3xl font-black text-brand-600">{p.masteredCount}</div>
            <div className="text-xs text-ink-500">skills through practice</div>
            {p.masteredRecent.length > 0 && (
              <ul className="mt-3 space-y-1.5">
                {p.masteredRecent.slice(0, 5).map((n) => (
                  <li key={n} className="flex items-center gap-2 text-sm text-ink-700">
                    <span className="text-ok-600">✓</span> {n}
                  </li>
                ))}
              </ul>
            )}
          </Card>
          {p.accuracy !== null && (
            <Card>
              <h2 className="font-bold text-ink-900">First-try accuracy</h2>
              <div className="mt-1 text-3xl font-black text-ink-900">{p.accuracy}%</div>
              <div className="text-xs text-ink-500">across recent sessions</div>
            </Card>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3 text-sm">
        <GhostButton href={`/parent/${id}`} className="!px-4 !py-2 text-sm">Parent dashboard</GhostButton>
        <GhostButton href="/curriculum" className="!px-4 !py-2 text-sm">Explore the curriculum</GhostButton>
      </div>
    </div>
  );
}
