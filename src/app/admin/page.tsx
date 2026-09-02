"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo, Card, PrimaryButton } from "@/components/ui";
import { LogoutButton } from "@/components/LogoutButton";
import { MathText } from "@/components/MathText";
import { api } from "@/lib/client";
import { MfaPanel } from "@/components/MfaPanel";
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
  reports: {
    id: string;
    studentName: string;
    fromChildSession: boolean;
    category: string;
    message: string;
    question: { skillId: string; stage: number; prompt: string };
    createdAt: number;
  }[];
  flags: {
    id: string;
    skillId: string;
    stage: number;
    prompt: string;
    reason: string;
    flaggedBy: string;
    flaggedAt: number;
  }[];
  families: {
    id: string;
    email: string;
    region: "US" | "INTL" | null;
    children: number;
    billingStatus: string | null;
    comp: { reason: string; grantedBy: string; expiresAt: number | null } | null;
    unlocked: boolean;
  }[];
  errors: {
    id: string;
    source: "server" | "client";
    message: string;
    path?: string;
    count: number;
    lastSeen: number;
  }[];
  lessons: {
    key: string;
    title: string;
    taughtStudents: number;
    untaughtStudents: number;
    beforeAttempts: number;
    afterAttempts: number;
    untaughtAttempts: number;
    afterAccuracy: number | null;
    baselineAccuracy: number | null;
    lift: number | null;
    verdict: "working" | "no clear signal" | "check this lesson" | "not enough data";
  }[];
}

const VERDICT_STYLE: Record<string, string> = {
  working: "bg-ok-100 text-ok-700",
  "no clear signal": "bg-ink-100 text-ink-600",
  "check this lesson": "bg-err-100 text-err-700",
  "not enough data": "bg-ink-50 text-ink-400",
};

const pct = (v: number | null) => (v === null ? "—" : `${Math.round(v * 100)}%`);
const liftDisp = (v: number | null) =>
  v === null ? "—" : `${v >= 0 ? "+" : "−"}${Math.round(Math.abs(v) * 100)} pts`;

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
  const [curGrade, setCurGrade] = useState(0);
  const [famName, setFamName] = useState("");
  const [famEmail, setFamEmail] = useState("");
  const [famKids, setFamKids] = useState<{ name: string; grade: number }[]>([{ name: "", grade: 3 }]);
  const [famCountry, setFamCountry] = useState("CA");
  const [famResult, setFamResult] = useState<{ email: string; password: string; children: { name: string; grade: number }[] } | null>(null);
  const [famError, setFamError] = useState("");
  const [famBusy, setFamBusy] = useState(false);
  const [curriculum, setCurriculum] = useState<{
    id: string; name: string; strandName: string; prereqs: string[];
    stages: string[]; lessonTitle: string | null; disabled: boolean;
  }[] | null>(null);

  const loadCurriculum = async (g: number) => {
    setCurGrade(g);
    setCurriculum(null);
    if (!g) return;
    try {
      const res = await api<{ skills: NonNullable<typeof curriculum> }>(`/api/admin/curriculum?grade=${g}`);
      setCurriculum(res.skills);
    } catch { setCurriculum([]); }
  };

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
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-ink-900 px-3 py-1 text-xs font-bold text-white">ADMIN</span>
          <LogoutButton />
        </div>
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
                  <button
                    className="btn order-2 shrink-0 rounded-lg border border-ink-100 px-2 py-1 text-xs font-semibold text-ink-500 hover:border-warn-600 hover:text-warn-600"
                    title="Flag this question for review"
                    onClick={async () => {
                      const reason = prompt("What is wrong with this question?");
                      if (!reason) return;
                      await fetch("/api/admin/flags", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ skillId, stage, prompt: q.prompt, answer: q.answer, reason }),
                      }).catch(() => undefined);
                      alert("Flagged. It will stay in the Flagged questions list until resolved.");
                    }}
                  >
                    ⚑ Flag
                  </button>
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
                <th className="py-2 pr-4">Streak</th>
                <th className="py-2"></th>
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
                  <td className="py-2 pr-4">{s.streak > 0 ? `🔥 ${s.streak}` : "—"}</td>
                  <td className="py-2">
                    {s.placed && (
                      <button
                        className="btn rounded-lg border border-ink-100 px-2 py-1 text-xs font-semibold text-ink-500 hover:border-warn-600/50 hover:text-warn-600"
                        onClick={async () => {
                          if (!confirm(`Send ${s.name} back to the placement test? Skills mastered through practice are kept.`)) return;
                          await fetch(`/api/students/${s.id}/placement/retake`, { method: "POST" }).catch(() => undefined);
                          location.reload();
                        }}
                      >
                        Retake placement
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {data.students.length === 0 && (
                <tr><td colSpan={8} className="py-4 text-center text-ink-500">No students yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <MfaPanel />

      <Card className="mt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-ink-900">Curriculum</h2>
            <p className="mt-0.5 text-xs text-ink-500">
              Browse the hierarchy. Content changes are made in the repository (versioned and
              tested); here you can pull a misbehaving skill from rotation instantly. Disabled
              skills are skipped by practice, reviews and grade completion.
            </p>
          </div>
          <select value={curGrade} onChange={(e) => void loadCurriculum(Number(e.target.value))} className="!w-auto">
            <option value={0}>Pick a grade…</option>
            {GRADES.map((g) => (
              <option key={g.grade} value={g.grade}>Grade {g.grade}</option>
            ))}
          </select>
        </div>
        {curriculum && (
          <div className="mt-3 max-h-96 space-y-1.5 overflow-y-auto pr-1">
            {curriculum.map((k) => (
              <div key={k.id} className={`rounded-xl border px-3 py-2 ${k.disabled ? "border-err-600/40 bg-err-100/40" : "border-ink-100"}`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0 text-sm">
                    <span className="font-medium text-ink-900">{k.name}</span>
                    <span className="ml-1.5 text-xs text-ink-500">{k.strandName}</span>
                    {k.lessonTitle && <span className="ml-1.5 text-xs text-brand-700">📘 {k.lessonTitle}</span>}
                    <div className="mt-0.5 text-xs text-ink-500">
                      Stages: {k.stages.join(" → ")}
                    </div>
                    {k.prereqs.length > 0 && (
                      <div className="text-xs text-ink-500">Needs: {k.prereqs.join(", ")}</div>
                    )}
                  </div>
                  <button
                    className={`btn shrink-0 rounded-lg border px-2.5 py-1 text-xs font-semibold ${k.disabled ? "border-ok-600/50 text-ok-600 hover:bg-ok-100" : "border-ink-100 text-ink-500 hover:border-err-600 hover:text-err-600"}`}
                    onClick={async () => {
                      const reason = k.disabled ? "" : prompt(`Why disable ${k.name}?`);
                      if (!k.disabled && !reason) return;
                      await fetch("/api/admin/curriculum", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ skillId: k.id, disabled: !k.disabled, reason }),
                      }).catch(() => undefined);
                      void loadCurriculum(curGrade);
                    }}
                  >
                    {k.disabled ? "Re-enable" : "Disable"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="mt-6">
        <h2 className="font-bold text-ink-900">Families</h2>
        {famResult ? (
          <div className="mt-3 rounded-xl border-2 border-brand-300 bg-brand-50 px-4 py-3">
            <p className="text-sm font-bold text-ink-900">Family created — write this down now</p>
            <p className="mt-2 text-sm text-ink-700">
              Email: <span className="font-mono font-bold">{famResult.email}</span>
              <br />
              Password: <span className="select-all font-mono font-bold text-brand-700">{famResult.password}</span>
            </p>
            <p className="mt-1 text-xs text-ink-500">
              Shown once — only a hash is stored. Children: {famResult.children.map((c) => `${c.name} (G${c.grade})`).join(", ")}.
              Complimentary access is already granted.
            </p>
            <button className="btn mt-2 rounded-lg border border-brand-300 px-3 py-1 text-xs font-bold text-brand-700" onClick={() => { setFamResult(null); location.reload(); }}>
              I have saved it
            </button>
          </div>
        ) : (
          <div className="mt-3 rounded-xl border border-ink-100 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Add a test family</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <input placeholder="Parent name" value={famName} onChange={(e) => setFamName(e.target.value)} />
              <input placeholder="Parent email" type="email" value={famEmail} onChange={(e) => setFamEmail(e.target.value)} />
              <select value={famCountry} onChange={(e) => setFamCountry(e.target.value)} title="Sets the family's curriculum region from day one — no geo-IP guessing">
                <option value="CA">Canada (metric)</option>
                <option value="US">United States (US units)</option>
                <option value="GB">United Kingdom (metric)</option>
                <option value="AU">Australia (metric)</option>
              </select>
            </div>
            {famKids.map((k, i) => (
              <div key={i} className="mt-2 flex gap-2">
                <input placeholder={`Child ${i + 1} name`} value={k.name} onChange={(e) => setFamKids(famKids.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} />
                <select value={k.grade} onChange={(e) => setFamKids(famKids.map((x, j) => (j === i ? { ...x, grade: Number(e.target.value) } : x)))} className="!w-28">
                  {GRADES.map((g) => (
                    <option key={g.grade} value={g.grade}>Grade {g.grade}</option>
                  ))}
                </select>
              </div>
            ))}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {famKids.length < 4 && (
                <button className="btn rounded-lg border border-ink-100 px-2.5 py-1 text-xs font-semibold text-ink-500" onClick={() => setFamKids([...famKids, { name: "", grade: 3 }])}>+ child</button>
              )}
              <PrimaryButton className="!px-3 !py-1.5 text-xs" disabled={famBusy} onClick={async () => {
                setFamBusy(true); setFamError("");
                try {
                  const res = await api<NonNullable<typeof famResult>>("/api/admin/families", { method: "POST", json: { parentName: famName, email: famEmail, children: famKids, country: famCountry } });
                  setFamResult(res);
                } catch (e) { setFamError(e instanceof Error ? e.message : "Failed"); }
                finally { setFamBusy(false); }
              }}>
                {famBusy ? "Creating…" : "Create family"}
              </PrimaryButton>
              {famError && <span className="text-xs text-err-600">{famError}</span>}
            </div>
          </div>
        )}
        <p className="mt-1 text-xs text-ink-500">
          Locked families are listed first. Granting access unlocks practice without touching
          Stripe — use it for test families and beta users. Every grant records who made it.
        </p>
        <div className="mt-3 space-y-2">
          {(data.families ?? []).map((f) => (
            <div key={f.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-ink-100 px-3 py-2">
              <div className="min-w-0 text-sm">
                <span className="font-medium text-ink-900">{f.email}</span>
                <span className="ml-2 text-xs text-ink-500">
                  {f.children} child{f.children === 1 ? "" : "ren"} ·{" "}
                  {f.billingStatus ?? "no subscription"}
                  {f.comp ? ` · granted by ${f.comp.grantedBy} (${f.comp.reason})` : ""}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <select
                  className="rounded-lg border border-ink-100 px-1.5 py-1 text-xs font-semibold text-ink-700"
                  value={f.region ?? ""}
                  title="Curriculum region — US customary units vs international metric. Auto-detected from the family's first request, which a VPN gets wrong."
                  onChange={async (e) => {
                    await fetch("/api/admin/families", {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ accountId: f.id, region: e.target.value }),
                    }).catch(() => undefined);
                    location.reload();
                  }}
                >
                  <option value="" disabled>region?</option>
                  <option value="US">US units</option>
                  <option value="INTL">Metric</option>
                </select>
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${f.unlocked ? "bg-ok-100 text-ok-700" : "bg-err-100 text-err-700"}`}>
                  {f.unlocked ? "can practise" : "locked"}
                </span>
                <button
                  className="btn rounded-lg border border-ink-100 px-2.5 py-1 text-xs font-semibold text-ink-700 hover:border-brand-400"
                  onClick={async () => {
                    const reason = f.comp ? "" : prompt(`Why is ${f.email} being granted access?`, "Beta testing") ?? "";
                    if (!f.comp && !reason) return;
                    await fetch("/api/admin/comp", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ accountId: f.id, grant: !f.comp, reason }),
                    }).catch(() => undefined);
                    location.reload();
                  }}
                >
                  {f.comp ? "Revoke access" : "Grant access"}
                </button>
              </div>
            </div>
          ))}
          {(data.families ?? []).length === 0 && (
            <p className="py-2 text-center text-sm text-ink-500">No families yet.</p>
          )}
        </div>
      </Card>

      {(data.reports ?? []).length > 0 && (
        <Card className="mt-6">
          <h2 className="font-bold text-ink-900">Student reports</h2>
          <p className="mt-1 text-xs text-ink-500">
            Problems reported from inside practice. Children tap a reason (no free text, by
            policy); parents may add a note. The question they were on is attached.
          </p>
          <div className="mt-3 space-y-2">
            {data.reports.map((r) => (
              <div key={r.id} className="flex items-start justify-between gap-3 rounded-xl border border-brand-200 bg-brand-50/50 px-3 py-2">
                <div className="min-w-0 text-sm">
                  <span className={`mr-2 rounded-full px-2 py-0.5 text-xs font-semibold ${r.fromChildSession ? "bg-brand-100 text-brand-700" : "bg-ink-900 text-white"}`}>
                    {r.fromChildSession ? "student" : "parent"}
                  </span>
                  <span className="font-medium text-ink-900">{r.category}</span>
                  <span className="ml-1.5 text-xs text-ink-500">— {r.studentName}, {new Date(r.createdAt).toLocaleString()}</span>
                  {r.message && <div className="mt-0.5 text-xs text-ink-700">“{r.message}”</div>}
                  {r.question?.prompt && (
                    <div className="mt-0.5 text-xs text-ink-500">
                      <MathText text={r.question.prompt} /> <span className="text-ink-400">({r.question.skillId} s{r.question.stage})</span>
                    </div>
                  )}
                </div>
                <button
                  className="btn shrink-0 rounded-lg px-2 py-1 text-xs font-semibold text-ink-500 hover:text-ok-600"
                  onClick={async () => {
                    await fetch(`/api/admin/reports?id=${encodeURIComponent(r.id)}`, { method: "DELETE" }).catch(() => undefined);
                    location.reload();
                  }}
                >
                  Resolve
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {(data.flags ?? []).length > 0 && (
        <Card className="mt-6">
          <h2 className="font-bold text-ink-900">Flagged questions</h2>
          <p className="mt-1 text-xs text-ink-500">
            Questions flagged during review. They stay here until resolved, so a concern
            spotted one day is not lost the next.
          </p>
          <div className="mt-3 space-y-2">
            {data.flags.map((fl) => (
              <div key={fl.id} className="flex items-start justify-between gap-3 rounded-xl border border-warn-600/30 bg-warn-100/40 px-3 py-2">
                <div className="min-w-0 text-sm">
                  <div className="font-medium text-ink-900"><MathText text={fl.prompt} /></div>
                  <div className="mt-0.5 text-xs text-ink-500">
                    {fl.skillId} · stage {fl.stage} · “{fl.reason}” — {fl.flaggedBy},{" "}
                    {new Date(fl.flaggedAt).toLocaleDateString()}
                  </div>
                </div>
                <button
                  className="btn shrink-0 rounded-lg px-2 py-1 text-xs font-semibold text-ink-500 hover:text-ok-600"
                  onClick={async () => {
                    await fetch(`/api/admin/flags?id=${encodeURIComponent(fl.id)}`, { method: "DELETE" }).catch(() => undefined);
                    location.reload();
                  }}
                >
                  Resolve
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-ink-900">Errors</h2>
          <button
            className="btn rounded-xl border border-ink-100 px-3 py-1.5 text-xs font-semibold text-ink-500 hover:text-ink-900"
            onClick={async () => {
              await fetch("/api/admin/errors", { method: "POST" }).catch(() => undefined);
              setTimeout(() => location.reload(), 800);
            }}
          >
            Fire a test error
          </button>
        </div>
        <p className="mt-1 text-xs text-ink-500">
          Unhandled errors from the server and from visitors&rsquo; browsers, grouped. The test
          button throws a real server error — if it appears below, monitoring works end to end.
        </p>
        <div className="mt-3 space-y-2">
          {(data.errors ?? []).map((e) => (
            <div key={e.id} className="flex items-start justify-between gap-3 rounded-xl border border-err-600/20 bg-err-100/40 px-3 py-2">
              <div className="min-w-0 text-sm">
                <span className={`mr-2 rounded-full px-2 py-0.5 text-xs font-semibold ${e.source === "server" ? "bg-ink-900 text-white" : "bg-brand-100 text-brand-700"}`}>
                  {e.source}
                </span>
                <span className="font-medium text-ink-900 break-words">{e.message}</span>
                <div className="mt-0.5 text-xs text-ink-500">
                  {e.count}× · {e.path ?? "unknown path"} · last {new Date(e.lastSeen).toLocaleString()}
                </div>
              </div>
              <button
                className="btn shrink-0 rounded-lg px-2 py-1 text-xs font-semibold text-ink-500 hover:text-err-600"
                onClick={async () => {
                  await fetch(`/api/admin/errors?id=${encodeURIComponent(e.id)}`, { method: "DELETE" }).catch(() => undefined);
                  location.reload();
                }}
              >
                Dismiss
              </button>
            </div>
          ))}
          {(data.errors ?? []).length === 0 && (
            <p className="py-2 text-center text-sm text-ink-500">No errors recorded. ✨</p>
          )}
        </div>
      </Card>

      <Card className="mt-6">
        <h2 className="font-bold text-ink-900">Lesson effectiveness</h2>
        <p className="mt-1 text-xs text-ink-500">
          First-try accuracy on a lesson&apos;s skills, after the lesson vs the baseline (attempts made before it,
          plus students who never opened it). Lift is the difference. Verdicts hold back until each side has 25
          attempts — and students choose whether to open a lesson, so read this as a signal, not an experiment.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-ink-500">
              <tr>
                <th className="py-2 pr-4">Lesson</th>
                <th className="py-2 pr-4">Taught</th>
                <th className="py-2 pr-4">After</th>
                <th className="py-2 pr-4">Baseline</th>
                <th className="py-2 pr-4">Lift</th>
                <th className="py-2">Verdict</th>
              </tr>
            </thead>
            <tbody>
              {(data.lessons ?? []).map((l) => (
                <tr key={l.key} className="border-t border-ink-100">
                  <td className="py-2 pr-4 font-medium text-ink-900">{l.title}</td>
                  <td className="py-2 pr-4">
                    {l.taughtStudents}
                    <span className="text-ink-400"> / {l.taughtStudents + l.untaughtStudents}</span>
                  </td>
                  <td className="py-2 pr-4">
                    {pct(l.afterAccuracy)}
                    <span className="text-xs text-ink-400"> ({l.afterAttempts})</span>
                  </td>
                  <td className="py-2 pr-4">
                    {pct(l.baselineAccuracy)}
                    <span className="text-xs text-ink-400"> ({l.beforeAttempts + l.untaughtAttempts})</span>
                  </td>
                  <td className="py-2 pr-4 font-semibold">{liftDisp(l.lift)}</td>
                  <td className="py-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${VERDICT_STYLE[l.verdict]}`}>
                      {l.verdict}
                    </span>
                  </td>
                </tr>
              ))}
              {(data.lessons ?? []).length === 0 && (
                <tr><td colSpan={6} className="py-4 text-center text-ink-500">No practice on lesson-covered skills yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
