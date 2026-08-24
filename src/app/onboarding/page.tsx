"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo, PrimaryButton, Card } from "@/components/ui";
import { api } from "@/lib/client";

export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [grade, setGrade] = useState(6);
  const [age, setAge] = useState("");
  const [goal, setGoal] = useState("");
  const [sessionLength, setSessionLength] = useState<"short" | "standard" | "long">("standard");
  const [lessonsFirst, setLessonsFirst] = useState(true);
  const [plainMode, setPlainMode] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    setError("");
    try {
      const student = await api<{ id: string }>("/api/students", {
        method: "POST",
        json: {
          name,
          grade,
          age: age ? Number(age) : undefined,
          goal: goal || undefined,
          preferences: { sessionLength, lessonsFirst, plainMode },
        },
      });
      router.push(`/placement/${student.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10">
      <div className="mb-6 text-center">
        <Link href="/" className="inline-block"><Logo /></Link>
        <h1 className="mt-4 text-2xl font-extrabold text-ink-900">Who&rsquo;s learning?</h1>
        <p className="mt-1 text-sm text-ink-500">
          School grade gives us context — the placement finds the real starting point.
        </p>
      </div>
      <Card>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          <label className="block text-sm font-medium text-ink-700">
            Student name
            <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1" required />
          </label>
          <div>
            <span className="block text-sm font-medium text-ink-700">School grade</span>
            <div className="mt-2 grid grid-cols-6 gap-1.5">
              {Array.from({ length: 12 }, (_, i) => i + 1).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGrade(g)}
                  className={`btn rounded-lg border py-2 text-sm font-bold ${
                    grade === g
                      ? "border-brand-600 bg-brand-600 text-white"
                      : "border-ink-300 bg-white text-ink-700"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
          <label className="block text-sm font-medium text-ink-700">
            Age <span className="font-normal text-ink-500">(optional)</span>
            <input
              type="number"
              min={5}
              max={19}
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="mt-1"
            />
          </label>
          <label className="block text-sm font-medium text-ink-700">
            Goal <span className="font-normal text-ink-500">(optional)</span>
            <select value={goal} onChange={(e) => setGoal(e.target.value)} className="mt-1">
              <option value="">Choose a goal...</option>
              <option>Catch up with confidence</option>
              <option>Stay on track at school</option>
              <option>Get ahead of my grade</option>
              <option>Build daily math habits</option>
            </select>
          </label>
          {/* Learning preferences (spec §2). Each one changes the product. */}
          <fieldset className="rounded-xl bg-paper px-3 py-3">
            <legend className="px-1 text-sm font-medium text-ink-700">
              How would you like to practise?
            </legend>
            <label className="mt-1 block text-sm text-ink-700">
              Daily session
              <select
                value={sessionLength}
                onChange={(e) => setSessionLength(e.target.value as typeof sessionLength)}
                className="mt-1"
              >
                <option value="short">Short — 10 questions</option>
                <option value="standard">Standard — 16 questions</option>
                <option value="long">Long — 24 questions</option>
              </select>
            </label>
            <label className="mt-3 flex cursor-pointer items-start gap-2.5 text-sm text-ink-700">
              <input
                type="checkbox"
                checked={lessonsFirst}
                onChange={(e) => setLessonsFirst(e.target.checked)}
                className="mt-0.5 h-5 w-5 shrink-0 accent-brand-600"
              />
              <span>Teach me a short lesson before a new skill</span>
            </label>
            <label className="mt-2 flex cursor-pointer items-start gap-2.5 text-sm text-ink-700">
              <input
                type="checkbox"
                checked={plainMode}
                onChange={(e) => setPlainMode(e.target.checked)}
                className="mt-0.5 h-5 w-5 shrink-0 accent-brand-600"
              />
              <span>Plain mode — no emoji or celebrations</span>
            </label>
            <p className="mt-2 text-xs text-ink-500">
              You can change any of these later.
            </p>
          </fieldset>

          {error && <p className="rounded-xl bg-err-100 px-3 py-2 text-sm text-err-600">{error}</p>}
          <PrimaryButton type="submit" disabled={busy} className="w-full">
            {busy ? "Setting up..." : "Start the Placement Test"}
          </PrimaryButton>
          <p className="text-center text-xs text-ink-500">
            Usually 20–40 quick questions, and fewer in the senior grades. It adapts as you go — some will feel easy, some will stretch you. That&rsquo;s by design.
          </p>
        </form>
      </Card>
    </div>
  );
}
