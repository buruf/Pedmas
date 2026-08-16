"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { Logo, Card, StatusPill } from "@/components/ui";
import { api } from "@/lib/client";

interface PathPayload {
  name: string;
  grade: number;
  strands: {
    strandId: string;
    strandName: string;
    level: number;
    skills: {
      id: string;
      name: string;
      grade: number;
      status: string;
      stage: number;
      stageLabel: string | null;
      assumed: boolean;
    }[];
  }[];
}

export default function PathPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<PathPayload | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<PathPayload>(`/api/students/${id}/path`)
      .then((d) => {
        setData(d);
        setOpen(d.strands[0]?.strandId ?? null);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"));
  }, [id]);

  if (error) return <div className="p-8 text-err-600">{error}</div>;
  if (!data) return <div className="grid min-h-screen place-items-center text-ink-500">Loading your path…</div>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <header className="mb-6 flex items-center justify-between">
        <Link href={`/app/${id}`}><Logo /></Link>
        <Link href={`/app/${id}`} className="text-sm font-semibold text-ink-500 hover:text-ink-900">
          ← Dashboard
        </Link>
      </header>
      <h1 className="text-2xl font-extrabold text-ink-900">My Learning Path</h1>
      <p className="mt-1 text-sm text-ink-500">
        Skills unlock in order — master the current one to open the next. No skipping ahead,
        no busywork behind.
      </p>
      <div className="mt-6 space-y-3">
        {data.strands.map((s) => (
          <Card key={s.strandId} className="!p-0 overflow-hidden">
            <button
              className="btn flex w-full items-center justify-between px-5 py-4 text-left"
              onClick={() => setOpen(open === s.strandId ? null : s.strandId)}
            >
              <div>
                <span className="font-bold text-ink-900">{s.strandName}</span>
                <span className="ml-2 text-xs font-semibold text-ink-500">Grade {s.level}</span>
              </div>
              <span className="text-ink-500">{open === s.strandId ? "▾" : "▸"}</span>
            </button>
            {open === s.strandId && (
              <div className="border-t border-ink-100 px-5 py-3">
                <ol className="space-y-2">
                  {s.skills.map((k) => (
                    <li key={k.id} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
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
                        <div>
                          <div
                            className={`text-sm font-medium ${
                              k.status === "Locked" ? "text-ink-500" : "text-ink-900"
                            }`}
                          >
                            {k.name}
                            <span className="ml-1.5 text-xs text-ink-500">G{k.grade}</span>
                          </div>
                          {k.status === "Current" && k.stageLabel && (
                            <div className="text-xs text-brand-700">
                              Stage {k.stage}/5 — {k.stageLabel}
                            </div>
                          )}
                        </div>
                      </div>
                      <StatusPill status={k.status === "Ready to Learn" ? "Practicing" : k.status} />
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
