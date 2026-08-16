import Link from "next/link";
import { Logo, PrimaryButton, GhostButton, Card } from "@/components/ui";
import { MathText } from "@/components/MathText";
import { StudentIllustration } from "@/components/StudentIllustration";

const STEPS = [
  { icon: "🎯", title: "Find Your Level", text: "A short adaptive placement finds what you already know — strand by strand, not one number." },
  { icon: "🧠", title: "Practice the Right Skills", text: "Daily practice targets exactly what you're ready to learn, never busywork." },
  { icon: "🏅", title: "Master Each Concept", text: "You advance by demonstrating mastery across sessions — not by finishing a lesson." },
  { icon: "🚀", title: "Move Forward", text: "Master a skill and the next one unlocks, following real prerequisite chains." },
  { icon: "🔄", title: "Keep It Fresh", text: "Spaced review brings skills back at 2 days, 1 week, 3 weeks — so mastery sticks." },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-10 border-b border-ink-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Logo />
          <nav className="hidden items-center gap-6 text-sm font-medium text-ink-700 sm:flex">
            <a href="#how" className="hover:text-brand-700">How It Works</a>
            <Link href="/curriculum" className="hover:text-brand-700">Curriculum</Link>
            <a href="#adapts" className="hover:text-brand-700">About</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="btn inline-flex items-center rounded-xl px-4 py-2 text-sm font-semibold text-ink-700 hover:text-brand-700">
              Log in
            </Link>
            <Link href="/signup" className="btn inline-flex items-center rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
              Sign up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-b from-brand-50 to-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-2 md:items-center md:py-20">
          <div>
            <h1 className="text-4xl font-black leading-tight tracking-tight text-ink-900 sm:text-5xl">
              Master Math.
              <br />
              <span className="text-brand-600">One Skill</span> at a Time.
            </h1>
            <p className="mt-4 max-w-md text-lg text-ink-700">
              PEDMAS finds what you know, identifies what you need to learn, and
              gives you the right practice until you master it. Grades 1–12.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <PrimaryButton href="/signup">Start Free Placement Test</PrimaryButton>
              <GhostButton href="/curriculum">Explore Mathematics</GhostButton>
            </div>
            <p className="mt-4 text-sm text-ink-500">
              Adaptive placement · Mastery-based · Spaced review
            </p>
          </div>
          {/* The per-strand profile lives in the "adapts to you" section below,
              so the hero shows the student rather than repeating it. */}
          <div className="pop-in">
            <StudentIllustration className="mx-auto h-auto w-full max-w-md" />
            <div className="mx-auto mt-5 max-w-sm rounded-2xl border border-brand-100 bg-white px-4 py-3 text-center text-sm text-ink-700 shadow-sm">
              <MathText text={"Today: add fractions like {1/2} + {1/3} — you're ready."} />
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-center text-3xl font-extrabold text-ink-900">How PEDMAS Works</h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-ink-500">
          A personal mathematics coach that follows a rigorous K–12 curriculum
          and adjusts to your actual ability.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {STEPS.map((s, i) => (
            <Card key={s.title} className="text-center">
              <div className="text-3xl">{s.icon}</div>
              <div className="mt-2 text-xs font-bold uppercase tracking-wide text-brand-600">Step {i + 1}</div>
              <div className="mt-1 font-bold text-ink-900">{s.title}</div>
              <p className="mt-1 text-sm text-ink-500">{s.text}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Grades */}
      <section className="bg-paper py-14">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-extrabold text-ink-900">Grades 1–12</h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-ink-500">
            The complete mathematics curriculum — from counting to calculus.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {Array.from({ length: 12 }, (_, i) => i + 1).map((g) => (
              <Link
                key={g}
                href={`/curriculum#grade-${g}`}
                className="btn rounded-2xl border border-ink-100 bg-white p-4 text-center shadow-sm transition hover:border-brand-400 hover:shadow"
              >
                <div className="text-xs font-semibold uppercase text-ink-500">Grade</div>
                <div className="text-2xl font-black text-brand-600">{g}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Adapts to you */}
      <section id="adapts" className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-8 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="text-3xl font-extrabold text-ink-900">Mathematics that adapts to you</h2>
            <p className="mt-3 text-ink-700">
              A Grade 6 student is rarely &ldquo;a Grade 6 math student&rdquo; in every strand.
              They might be Grade 7 in geometry and still growing into Grade 5 fractions —
              and that&rsquo;s normal.
            </p>
            <p className="mt-3 text-ink-700">
              PEDMAS builds a per-strand profile from your placement, practices each strand
              at the right level, repairs missing prerequisites when you struggle, and only
              advances you when mastery is demonstrated — the way a great tutor would.
            </p>
            <div className="mt-5">
              <PrimaryButton href="/signup">Find Your Starting Point</PrimaryButton>
            </div>
          </div>
          <Card>
            <div className="text-sm font-bold text-ink-900">School Grade ≠ Mathematical Ability</div>
            <div className="mt-3 space-y-2 text-sm">
              {[
                ["Number Sense", "Grade 6", "Mastered"],
                ["Operations", "Grade 6", "Strong"],
                ["Fractions", "Grade 5", "Developing"],
                ["Geometry", "Grade 7", "Strong"],
              ].map(([s, g, status]) => (
                <div key={s} className="flex items-center justify-between rounded-xl bg-paper px-3 py-2">
                  <span className="font-medium text-ink-700">{s}</span>
                  <span className="text-ink-500">{g}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      status === "Mastered"
                        ? "bg-ok-100 text-ok-600"
                        : status === "Strong"
                          ? "bg-brand-100 text-brand-700"
                          : "bg-warn-100 text-warn-600"
                    }`}
                  >
                    {status}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-ink-500">
              One student, four different levels — each practiced where it should be.
            </p>
          </Card>
        </div>
      </section>

      <footer className="border-t border-ink-100 bg-paper">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-8 text-sm text-ink-500 sm:flex-row sm:justify-between">
          <Logo />
          <p>An adaptive mathematics progression engine for Grades 1–12.</p>
          <nav className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-ink-900">Privacy</Link>
            <Link href="/terms" className="hover:text-ink-900">Terms</Link>
            <Link href="/pricing" className="hover:text-ink-900">Pricing</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
