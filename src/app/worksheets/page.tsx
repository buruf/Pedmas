import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/ui";
import { topicsForGrade } from "@/lib/worksheets";
import { registrationOpen } from "@/lib/flags";

export const metadata: Metadata = {
  title: "Free Printable Math Worksheets, Grades 1–12 | PEDMAS",
  description:
    "Free printable math worksheets for every grade and topic — number sense, fractions, algebra, geometry and more, with answer keys. Freshly generated every time.",
};

/**
 * The worksheet library index: every grade × strand page, linked from one
 * place so both visitors and crawlers can reach the whole lattice.
 */
export default function WorksheetsIndex() {
  const signupsOpen = registrationOpen();
  const grades = Array.from({ length: 12 }, (_, i) => i + 1);
  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-ink-100 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/"><Logo /></Link>
          <Link
            href={signupsOpen ? "/signup" : "/sample-lesson"}
            className="btn rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            {signupsOpen ? "Start Free Placement Test" : "See a Real Lesson"}
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="text-3xl font-black tracking-tight text-ink-900">Free Printable Math Worksheets</h1>
        <p className="mt-2 max-w-2xl text-ink-700">
          Every sheet is generated fresh from the same question engine PEDMAS students use —
          pick a grade and topic, print, and the answer key comes with it. Grades 1–12, free.
        </p>
        <div className="mt-8 space-y-6">
          {grades.map((g) => (
            <section key={g}>
              <h2 className="text-sm font-extrabold uppercase tracking-wide text-ink-500">Grade {g}</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {topicsForGrade(g).map((s) => (
                  <Link
                    key={s.slug}
                    href={`/worksheets/grade-${g}/${s.slug}`}
                    className="btn rounded-full border border-ink-100 bg-white px-3.5 py-1.5 text-xs font-semibold text-ink-700 hover:border-brand-400 hover:text-brand-700"
                  >
                    {s.name}
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
