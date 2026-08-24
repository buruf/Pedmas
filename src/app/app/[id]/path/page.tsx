"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { Logo, Card, StatusPill } from "@/components/ui";
import { api } from "@/lib/client";

interface PathPayload {
  name: string;
  grade: number;
  currentGrade: number;
  mastered: number;
  total: number;
  skills: {
    id: string;
    name: string;
    strandName: string;
    status: string;
    stage: number;
    stageLabel: string | null;
    assumed: boolean;
  }[];
}

/**
 * The learning path: this grade, in order.
 *
 * Deliberately one list rather than a card per strand. The learner finishes a
 * grade before the next opens, so a strand-by-strand view would show several
 * things looking "in progress" when only one ever is — which is exactly the
 * contradiction this page used to create with the dashboard.
 */
export default function PathPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<PathPayload | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<PathPayload>(`/api/students/${id}/path`)
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : "Could not load your path."));
  }, [id]);

  if (error) return <div className="p-8 text-err-600">{error}</div>;
  if (!data) return <div className="grid min-h-screen place-items-center text-ink-500">Loading…</div>;

  const pct = Math.round((data.mastered / Math.max(1, data.total)) * 100);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <header className="mb-5 flex items-center justify-between gap-3">
        <Link href={`/app/${id}`} className="inline-flex min-h-11 items-center"><Logo /></Link>
        <Link
          href={`/app/${id}`}
          className="inline-flex min-h-11 items-center px-2 text-sm font-semibold text-ink-500 hover:text-ink-900"
        >
          ← Back
        </Link>
      </header>

      <h1 className="text-2xl font-extrabold text-ink-900">Grade {data.currentGrade}</h1>
      <p className="mt-1 text-sm text-ink-500">
        One skill at a time, in order. Master every skill here and Grade {data.currentGrade + 1}{" "}
        opens.
      </p>

      <Card className="mt-4">
        <div className="flex items-baseline justify-between text-sm">
          <span className="font-semibold text-ink-900">
            {data.mastered} of {data.total} mastered
          </span>
          <span className="text-xs text-ink-500">{pct}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-ink-100">
          <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${pct}%` }} />
        </div>
      </Card>

      <Card className="mt-4">
        <ol className="space-y-2">
          {data.skills.map((k) => (
            <li key={k.id} className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <span
                  className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold ${
                    k.status === "Mastered"
                      ? "bg-ok-100 text-ok-600"
                      : k.status === "Current"
                        ? "bg-brand-600 text-white"
                        : "bg-ink-100 text-ink-500"
                  }`}
                >
                  {k.status === "Mastered" ? "✓" : k.status === "Current" ? "●" : "○"}
                </span>
                <div className="min-w-0">
                  <div
                    className={`text-sm font-medium ${
                      k.status === "Upcoming" ? "text-ink-500" : "text-ink-900"
                    }`}
                  >
                    {k.name}
                    <span className="ml-1.5 text-xs text-ink-500">{k.strandName}</span>
                  </div>
                  {k.status === "Current" && k.stageLabel && (
                    <div className="text-xs text-brand-700">
                      Stage {k.stage} of 5 — {k.stageLabel}
                    </div>
                  )}
                  {k.assumed && k.status === "Mastered" && (
                    <div className="text-xs text-ink-500">Shown by your placement test</div>
                  )}
                </div>
              </div>
              <StatusPill status={k.status} />
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}
