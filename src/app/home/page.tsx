"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo, Card, PrimaryButton, GhostButton } from "@/components/ui";
import { api } from "@/lib/client";

interface Me {
  name: string;
  role: string;
  students: { id: string; name: string; grade: number; placed: boolean; streak: number }[];
}

export default function HomeHub() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<Me>("/api/auth/me")
      .then((m) => {
        if (m.students.length === 1 && m.role === "STUDENT") {
          const s = m.students[0];
          router.replace(s.placed ? `/app/${s.id}` : `/placement/${s.id}`);
        } else {
          setMe(m);
        }
      })
      .catch(() => router.replace("/login"));
  }, [router]);

  if (error) return <p className="p-8 text-err-600">{error}</p>;
  if (!me) return <div className="grid min-h-screen place-items-center text-ink-500">Loading…</div>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <header className="mb-8 flex items-center justify-between">
        <Link href="/"><Logo /></Link>
        <button
          className="btn rounded-xl px-3 py-2 text-sm font-semibold text-ink-500 hover:text-ink-900"
          onClick={() => api("/api/auth/logout", { method: "POST" }).then(() => router.push("/"))}
        >
          Log out
        </button>
      </header>
      <h1 className="text-2xl font-extrabold text-ink-900">
        {me.role === "PARENT" ? "Your learners" : `Welcome, ${me.name}`}
      </h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {me.students.map((s) => (
          <Card key={s.id}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-bold text-ink-900">{s.name}</div>
                <div className="text-sm text-ink-500">Grade {s.grade}</div>
              </div>
              {s.streak > 0 && (
                <span className="rounded-full bg-warn-100 px-2.5 py-1 text-sm font-bold text-warn-600">
                  🔥 {s.streak}
                </span>
              )}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {s.placed ? (
                <>
                  <PrimaryButton href={`/app/${s.id}`} className="!px-4 !py-2 text-sm">Dashboard</PrimaryButton>
                  <GhostButton href={`/parent/${s.id}`} className="!px-4 !py-2 text-sm">Parent view</GhostButton>
                </>
              ) : (
                <PrimaryButton href={`/placement/${s.id}`} className="!px-4 !py-2 text-sm">
                  Start placement
                </PrimaryButton>
              )}
            </div>
          </Card>
        ))}
        <Link
          href="/onboarding"
          className="btn grid place-items-center rounded-2xl border-2 border-dashed border-ink-300 p-6 text-ink-500 transition hover:border-brand-400 hover:text-brand-600"
        >
          + Add a learner
        </Link>
      </div>
    </div>
  );
}
