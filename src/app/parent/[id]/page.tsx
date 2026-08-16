"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { Logo, Card, ProgressBar, StatusPill } from "@/components/ui";
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
      currentSkill: { name: string; stage: number } | null;
    }[];
    masteredCount: number;
    masteredRecent: string[];
    streak: { count: number };
    accuracy: number | null;
    sessions: { dayKey: string; total: number; firstTryCorrect: number }[];
    placementReport: { strandId: string; strandName: string; level: number; status: string }[] | null;
  };
}

export default function ParentDashboard({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<StudentPayload | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<StudentPayload>(`/api/students/${id}`)
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"));
  }, [id]);

  if (error) return <div className="p-8 text-err-600">{error}</div>;
  if (!data) return <div className="grid min-h-screen place-items-center text-ink-500">Loading…</div>;
  const p = data.progress;

  const focus = [...p.strands].sort((a, b) => a.level - b.level)[0];
  const strongest = [...p.strands].sort((a, b) => b.level - a.level)[0];

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <header className="mb-6 flex items-center justify-between">
        <Link href="/home"><Logo /></Link>
        <Link href="/home" className="text-sm font-semibold text-ink-500 hover:text-ink-900">
          ← All learners
        </Link>
      </header>
      <h1 className="text-2xl font-extrabold text-ink-900">Parent Dashboard</h1>
      <p className="mt-1 text-ink-500">
        {data.name} · Grade {data.grade} at school
      </p>

      {focus && strongest && (
        <Card className="mt-6 border-brand-200 bg-brand-50">
          <p className="text-sm leading-relaxed text-ink-700">
            <span className="font-semibold">{data.name}</span> is currently practicing{" "}
            <span className="font-semibold text-brand-700">
              {focus.currentSkill?.name ?? focus.strandName}
            </span>{" "}
            at a Grade {focus.level} level and is progressing steadily.{" "}
            {strongest.level > data.grade
              ? `${strongest.strandName} is already ahead of grade level — wonderful momentum.`
              : `${strongest.strandName} is their strongest strand right now.`}{" "}
            Daily practice keeps every strand moving at the right pace.
          </p>
        </Card>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Card className="text-center">
          <div className="text-3xl font-black text-brand-600">{p.streak.count}</div>
          <div className="text-xs font-semibold uppercase text-ink-500">Day streak</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-black text-brand-600">{p.masteredCount}</div>
          <div className="text-xs font-semibold uppercase text-ink-500">Skills mastered</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-black text-brand-600">{p.accuracy ?? "—"}{p.accuracy !== null ? "%" : ""}</div>
          <div className="text-xs font-semibold uppercase text-ink-500">First-try accuracy</div>
        </Card>
      </div>

      <Card className="mt-4">
        <h2 className="font-bold text-ink-900">Mathematics Profile</h2>
        <p className="mt-0.5 text-xs text-ink-500">
          Levels differ by strand — that&rsquo;s expected, and each strand is practiced at its own level.
        </p>
        <div className="mt-4 space-y-4">
          {p.strands.map((s) => (
            <div key={s.strandId}>
              <div className="mb-1 flex items-baseline justify-between">
                <span className="text-sm font-semibold text-ink-900">{s.strandName}</span>
                <span className="text-xs font-semibold text-ink-500">
                  Grade {s.level} · {s.percent}% of level mastered
                </span>
              </div>
              <ProgressBar value={s.percent} />
              {s.currentSkill && (
                <div className="mt-1 text-xs text-ink-500">
                  Working on: {s.currentSkill.name} (stage {s.currentSkill.stage}/5)
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {p.placementReport && (
        <Card className="mt-4">
          <h2 className="font-bold text-ink-900">Placement Results</h2>
          <div className="mt-3 overflow-hidden rounded-xl border border-ink-100">
            <table className="w-full text-sm">
              <thead className="bg-paper text-left text-xs uppercase tracking-wide text-ink-500">
                <tr>
                  <th className="px-4 py-2">Strand</th>
                  <th className="px-4 py-2">Level</th>
                  <th className="px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {p.placementReport.map((r) => (
                  <tr key={r.strandId} className="border-t border-ink-100">
                    <td className="px-4 py-2 font-medium text-ink-900">{r.strandName}</td>
                    <td className="px-4 py-2 text-ink-700">Grade {r.level}</td>
                    <td className="px-4 py-2"><StatusPill status={r.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {p.sessions.length > 0 && (
        <Card className="mt-4">
          <h2 className="font-bold text-ink-900">Recent practice</h2>
          <ul className="mt-3 space-y-2">
            {p.sessions.slice(0, 7).map((s, i) => (
              <li key={i} className="flex items-center justify-between text-sm">
                <span className="text-ink-700">{s.dayKey}</span>
                <span className="font-semibold text-ink-900">
                  {s.firstTryCorrect}/{s.total} first try
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
