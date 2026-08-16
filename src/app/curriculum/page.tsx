import Link from "next/link";
import { Logo, PrimaryButton } from "@/components/ui";
import { GRADES } from "@/curriculum";

export const metadata = { title: "Curriculum — PEDMAS" };

export default function CurriculumPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <header className="mb-8 flex items-center justify-between">
        <Link href="/"><Logo /></Link>
        <PrimaryButton href="/signup" className="!px-4 !py-2 text-sm">
          Start Free Placement
        </PrimaryButton>
      </header>
      <h1 className="text-3xl font-extrabold text-ink-900">The PEDMAS Curriculum</h1>
      <p className="mt-2 max-w-2xl text-ink-500">
        Grades 1–12, organized as Grade → Strand → Skill. Every skill has five progression
        stages and clear prerequisites — students move through it at their own pace, strand by strand.
      </p>
      <div className="mt-8 space-y-4">
        {GRADES.map((g) => (
          <details
            key={g.grade}
            id={`grade-${g.grade}`}
            className="group rounded-2xl border border-ink-100 bg-white shadow-sm open:pb-4"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-100 font-black text-brand-700">
                  {g.grade}
                </span>
                <div>
                  <div className="font-bold text-ink-900">Grade {g.grade}</div>
                  <div className="text-xs text-ink-500">
                    {g.strands.length} strands ·{" "}
                    {g.strands.reduce((a, s) => a + s.topics.length, 0)} skills
                  </div>
                </div>
              </div>
              <span className="text-ink-500 transition group-open:rotate-90">▸</span>
            </summary>
            <div className="grid gap-4 px-5 sm:grid-cols-2 lg:grid-cols-3">
              {g.strands.map((s, i) => (
                <div key={`${s.id}-${i}`} className="rounded-xl bg-paper p-4">
                  <div className="text-sm font-bold text-brand-700">{s.name}</div>
                  <ul className="mt-2 space-y-1">
                    {s.topics.map((t, j) => (
                      <li key={`${t.name}-${j}`} className="text-sm text-ink-700">
                        {t.name}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </details>
        ))}
      </div>
      <div className="my-10 rounded-2xl bg-brand-600 p-8 text-center text-white">
        <h2 className="text-2xl font-extrabold">Not sure where to start?</h2>
        <p className="mx-auto mt-2 max-w-md text-brand-100">
          You don&rsquo;t have to be. The adaptive placement finds the right level in each strand for you.
        </p>
        <div className="mt-5">
          <Link
            href="/signup"
            className="btn inline-flex items-center rounded-xl bg-white px-6 py-3 font-bold text-brand-700 hover:bg-brand-50"
          >
            Start Free Placement Test
          </Link>
        </div>
      </div>
    </div>
  );
}
