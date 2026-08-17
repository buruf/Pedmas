"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo, Card, PrimaryButton } from "@/components/ui";
import { MathText } from "@/components/MathText";
import { api } from "@/lib/client";
import { GRADES } from "@/curriculum";
import { skillIdFor } from "@/curriculum/types";

interface AdminPayload {
  counts: {
    accounts: number;
    students: number;
    placedStudents: number;
    grades: number;
    skills: number;
    strands: number;
  };
  students: {
    id: string;
    name: string;
    grade: number;
    placed: boolean;
    streak: number;
    sessions: number;
    mastered: number;
    struggling: number;
  }[];
}

interface PreviewPayload {
  skill: { id: string; name: string; grade: number; family: string };
  stage: number;
  stageLabel: string;
  health: {
    sampled: number;
    distinct: number;
    duplicateRate: number;
    flaggedCount: number;
    flagged: { prompt: string; reasons: string[] }[];
    verdict: "healthy" | "thin" | "very thin" | "fails validation";
  };
  questions: {
    instruction: string;
    prompt: string;
    choices?: string[];
    answer: string;
    steps: string[];
    hint: string;
    concept: string;
    difficulty: number;
    validation: { ok: boolean; reasons: string[] };
  }[];
}

export default function AdminPage() {
  const router = useRouter();
  const [data, setData] = useState<AdminPayload | null>(null);
  const [error, setError] = useState("");
  const [grade, setGrade] = useState(5);
  const [skillId, setSkillId] = useState("");
  const [stage, setStage] = useState(3);
  const [preview, setPreview] = useState<PreviewPayload | null>(null);
  const [previewBusy, setPreviewBusy] = useState(false);
  const [previewError, setPreviewError] = useState("");

  useEffect(() => {
    api<AdminPayload>("/api/admin")
      .then(setData)
      .catch((e) => {
        const msg = e instanceof Error ? e.message : "Failed";
        if (msg.includes("log in")) router.replace("/login");
        else setError(msg);
      });
  }, [router]);

  const gradeSkills = useMemo(() => {
    const g = GRADES.find((x) => x.grade === grade);
    if (!g) return [];
    return g.strands.flatMap((s) =>
      s.topics.map((t) => ({
        id: skillIdFor(g.grade, s.id, t.name),
        label: `${s.name} · ${t.name}`,
      }))
    );
  }, [grade]);

  const runPreview = async () => {
    if (!skillId) return;
    setPreviewBusy(true);
    setPreviewError("");
    setPreview(null);
    try {
      setPreview(
        await api<PreviewPayload>(
          `/api/admin/preview?skillId=${encodeURIComponent(skillId)}&stage=${stage}`
        )
      );
    } catch (e) {
      setPreviewError(e instanceof Error ? e.message : "Preview failed");
    } finally {
      setPreviewBusy(false);
    }
  };

  if (error) return <div className="p-8 text-err-600">{error}</div>;
  if (!data) return <div className="grid min-h-screen place-items-center text-ink-500">Loading admin…</div>;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <header className="mb-6 flex items-center justify-between">
        <Link href="/"><Logo /></Link>
        <span className="rounded-full bg-ink-900 px-3 py-1 text-xs font-bold text-white">ADMIN</span>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {Object.entries({
          Accounts: data.counts.accounts,
          Students: data.counts.students,
          Placed: data.counts.placedStudents,
          Grades: data.counts.grades,
          Strands: data.counts.strands,
          Skills: data.counts.skills,
        }).map(([k, v]) => (
          <Card key={k} className="text-center !p-4">
            <div className="text-2xl font-black text-brand-600">{v}</div>
            <div className="text-xs font-semibold uppercase text-ink-500">{k}</div>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <h2 className="font-bold text-ink-900">Question generator preview</h2>
        <p className="mt-0.5 text-xs text-ink-500">
          Generate validated samples for any skill and stage — exactly what students would see.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-[100px_1fr_110px_auto]">
          <label className="text-sm font-medium text-ink-700">
            Grade
            <select value={grade} onChange={(e) => { setGrade(Number(e.target.value)); setSkillId(""); }} className="mt-1">
              {GRADES.map((g) => (
                <option key={g.grade} value={g.grade}>{g.grade}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium text-ink-700">
            Skill
            <select value={skillId} onChange={(e) => setSkillId(e.target.value)} className="mt-1">
              <option value="">Choose a skill…</option>
              {gradeSkills.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium text-ink-700">
            Stage
            <select value={stage} onChange={(e) => setStage(Number(e.target.value))} className="mt-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>
          <div className="self-end">
            <PrimaryButton onClick={() => void runPreview()} disabled={previewBusy || !skillId}>
              {previewBusy ? "Generating…" : "Generate"}
            </PrimaryButton>
          </div>
        </div>
        {previewError && <p className="mt-3 rounded-xl bg-err-100 px-3 py-2 text-sm text-err-600">{previewError}</p>}
        {preview && (
          <div className="mt-4 space-y-3">
            <div className="text-sm text-ink-500">
              <span className="font-semibold text-ink-900">{preview.skill.name}</span> · family{" "}
              <code className="rounded bg-ink-100 px-1.5 py-0.5 text-xs">{preview.skill.family}</code> · stage{" "}
              {preview.stage}: {preview.stageLabel}
            </div>

            {/* Question performance and duplicate detection (spec §21). */}
            <div
              className={`rounded-xl border p-3 text-sm ${
                preview.health.verdict === "healthy"
                  ? "border-ok-600/30 bg-ok-100"
                  : preview.health.verdict === "fails validation"
                    ? "border-err-600/30 bg-err-100"
                    : "border-warn-600/30 bg-warn-100"
              }`}
            >
              <div className="font-bold text-ink-900">
                Generator health: {preview.health.verdict}
              </div>
              <div className="mt-1 text-ink-700">
                {preview.health.distinct} distinct out of {preview.health.sampled} generated
                {preview.health.duplicateRate > 0 && ` · ${preview.health.duplicateRate}% repeats`}
                {preview.health.flaggedCount > 0 && ` · ${preview.health.flaggedCount} failed validation`}
              </div>
              {preview.health.verdict !== "healthy" && preview.health.flaggedCount === 0 && (
                <div className="mt-1 text-xs text-ink-700">
                  A child working this skill to mastery meets it many times, so a thin pool shows
                  up as visible repetition.
                </div>
              )}
              {preview.health.flagged.map((f, i) => (
                <div key={i} className="mt-1 text-xs text-err-600">
                  <MathText text={f.prompt} /> — {f.reasons.join("; ")}
                </div>
              ))}
            </div>
            {preview.questions.map((q, i) => (
              <div key={i} className="rounded-xl border border-ink-100 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm text-ink-500"><MathText text={q.instruction} /></div>
                    <div className="mt-1 text-lg font-bold text-ink-900"><MathText text={q.prompt} /></div>
                    {q.choices && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {q.choices.map((c) => (
                          <span
                            key={c}
                            className={`rounded-lg border px-2.5 py-1 text-sm ${
                              c === q.answer
                                ? "border-ok-600 bg-ok-100 font-bold text-ok-600"
                                : "border-ink-100 text-ink-700"
                            }`}
                          >
                            <MathText text={c} />
                          </span>
                        ))}
                      </div>
                    )}
                    {!q.choices && (
                      <div className="mt-1 text-sm text-ok-600">
                        Answer: <span className="font-bold"><MathText text={q.answer} /></span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                        q.validation.ok ? "bg-ok-100 text-ok-600" : "bg-err-100 text-err-600"
                      }`}
                    >
                      {q.validation.ok ? "VALID" : "REJECTED"}
                    </span>
                    <span className="text-xs text-ink-500">difficulty {q.difficulty}/10</span>
                  </div>
                </div>
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs font-semibold text-brand-700">
                    Worked steps
                  </summary>
                  <ol className="mt-1 space-y-1 text-sm text-ink-700">
                    {q.steps.map((s, j) => (
                      <li key={j}>{j + 1}. <MathText text={s} /></li>
                    ))}
                  </ol>
                  <p className="mt-1 text-xs text-ink-500">Hint: <MathText text={q.hint} /> · Concept: <MathText text={q.concept} /></p>
                </details>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="mt-6">
        <h2 className="font-bold text-ink-900">Students</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-ink-500">
              <tr>
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Grade</th>
                <th className="py-2 pr-4">Placed</th>
                <th className="py-2 pr-4">Sessions</th>
                <th className="py-2 pr-4">Mastered</th>
                <th className="py-2 pr-4">Struggling</th>
                <th className="py-2">Streak</th>
              </tr>
            </thead>
            <tbody>
              {data.students.map((s) => (
                <tr key={s.id} className="border-t border-ink-100">
                  <td className="py-2 pr-4 font-medium text-ink-900">{s.name}</td>
                  <td className="py-2 pr-4">{s.grade}</td>
                  <td className="py-2 pr-4">{s.placed ? "✓" : "—"}</td>
                  <td className="py-2 pr-4">{s.sessions}</td>
                  <td className="py-2 pr-4">{s.mastered}</td>
                  <td className="py-2 pr-4">{s.struggling > 0 ? `⚠ ${s.struggling}` : "0"}</td>
                  <td className="py-2">{s.streak > 0 ? `🔥 ${s.streak}` : "—"}</td>
                </tr>
              ))}
              {data.students.length === 0 && (
                <tr><td colSpan={7} className="py-4 text-center text-ink-500">No students yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
