import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { Logo } from "@/components/ui";
import { MathText } from "@/components/MathText";
import { Figure } from "@/components/Figure";
import {
  buildWorksheet,
  legacyStrandTopic,
  stackFractions,
  topicsForGrade,
  worksheetDailySeed,
  worksheetExists,
} from "@/lib/worksheets";
import { currentAccount } from "@/lib/auth";
import { regionForRequest } from "@/lib/regionServer";
import { registrationOpen } from "@/lib/flags";
import { WorksheetToolbar } from "./Toolbar";

/**
 * One public worksheet page per grade × topic — an SEO landing page whose
 * content is the product's own generator. The page unit is the curriculum
 * section ("Multiplication", "Logarithms"), which is what people search
 * for. The default seed is stable for a day so search engines index
 * consistent pages; ?seed= re-rolls the sheet.
 */

interface Params {
  grade: string;
  strand: string; // the topic slug; the segment name predates the topic split
}

function parseGrade(param: string): number | null {
  const m = /^grade-([1-9]|1[0-2])$/.exec(param);
  return m ? Number(m[1]) : null;
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { grade: gradeParam, strand: slug } = await params;
  const grade = parseGrade(gradeParam);
  if (!grade) return {};
  const topic = topicsForGrade(grade).find((t) => t.slug === slug);
  if (!topic) return {};
  return {
    title: `Grade ${grade} ${topic.name} Worksheets — Free & Printable | PEDMAS`,
    description: `Free printable Grade ${grade} ${topic.name.toLowerCase()} worksheets with answer keys. Every sheet is freshly generated — print as many as you need.`,
  };
}

export default async function WorksheetPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<{ seed?: string }>;
}) {
  const { grade: gradeParam, strand: slug } = await params;
  const grade = parseGrade(gradeParam);
  if (!grade) notFound();
  if (!worksheetExists(grade, slug)) {
    // The library launched briefly with one page per strand id; anything
    // crawled in that window lands on the strand's first topic page.
    const legacy = legacyStrandTopic(grade, slug);
    if (legacy) permanentRedirect(`/worksheets/grade-${grade}/${legacy}`);
    notFound();
  }

  const account = await currentAccount();
  const { seed: seedParam } = await searchParams;
  // The daily sheet is the free sample; LIMITLESS regeneration is the
  // giveaway worth an account. Enforced here, not just in the button — a
  // visitor pasting ?seed= gets the daily sheet back.
  const canReroll = Boolean(account);
  const seed =
    canReroll && seedParam && /^\d{1,10}$/.test(seedParam)
      ? Number(seedParam)
      : worksheetDailySeed(grade, slug, new Date().toISOString().slice(0, 10));

  const region = await regionForRequest(account);
  const sheet = buildWorksheet(grade, slug, seed, region);
  if (!sheet) notFound();

  const signupsOpen = registrationOpen();
  const siblingTopics = topicsForGrade(grade).filter((t) => t.slug !== slug);
  const otherGrades = Array.from({ length: 12 }, (_, i) => i + 1).filter(
    (g) => g !== grade && worksheetExists(g, slug)
  );

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-ink-100 bg-white print:hidden">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/"><Logo /></Link>
          <nav className="flex items-center gap-4 text-sm font-medium">
            <Link href="/worksheets" className="text-ink-700 hover:text-brand-700">All worksheets</Link>
            <Link
              href={signupsOpen ? "/signup" : "/sample-lesson"}
              className="btn rounded-xl bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-700"
            >
              {signupsOpen ? "Start Free Placement Test" : "See a Real Lesson"}
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 print:max-w-none print:p-0">
        <div className="print:hidden">
          <p className="text-xs text-ink-500">
            <Link href="/worksheets" className="hover:text-brand-700">Worksheets</Link> › Grade {grade} ›{" "}
            <span className="font-semibold text-ink-900">{sheet.topicName}</span>
          </p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-ink-900">
            Grade {grade} {sheet.topicName} Worksheets
          </h1>
          <p className="mt-2 max-w-2xl text-ink-700">
            Free printable {sheet.topicName.toLowerCase()} practice for Grade {grade}, drawn from
            the same question engine PEDMAS students use — with an answer key. A fresh sheet
            every day{canReroll
              ? ", and you can roll a new one any time."
              : " — families with a PEDMAS account can roll new sheets any time."}
          </p>
          <div className="mt-5">
            <WorksheetToolbar canReroll={canReroll} signupsOpen={signupsOpen} />
          </div>
        </div>

        {/* The sheet itself — the only thing that prints, key on its own page. */}
        <div className="mt-6 rounded-2xl border border-ink-100 bg-white p-8 shadow-sm print:mt-0 print:rounded-none print:border-0 print:p-0 print:shadow-none">
          <div className="flex flex-wrap items-baseline justify-between gap-3 border-b-2 border-ink-900 pb-3">
            <h2 className="text-lg font-extrabold text-ink-900">
              Grade {grade} · {sheet.topicName} — Practice Sheet
            </h2>
            <p className="text-sm text-ink-500">
              Name <span className="mx-1 inline-block w-28 border-b border-ink-300" /> Date{" "}
              <span className="mx-1 inline-block w-24 border-b border-ink-300" />
            </p>
          </div>
          <ol className="mt-4 gap-x-10 sm:columns-2">
            {sheet.questions.map((q, i) => (
              <li key={i} className="flex break-inside-avoid gap-3 border-b border-dashed border-ink-100 py-3">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-50 text-xs font-extrabold text-brand-700">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  {q.instruction && !q.prompt.startsWith(q.instruction) && (
                    <p className="text-xs text-ink-500"><MathText text={q.instruction} /></p>
                  )}
                  <p className="whitespace-pre-line font-semibold text-ink-900"><MathText text={q.prompt} /></p>
                  {q.figure && <div className="mt-2"><Figure spec={q.figure} /></div>}
                  {q.kind === "mc" ? (
                    <ul className="mt-1.5 space-y-1 text-sm">
                      {q.choices?.map((c) => (
                        <li key={c} className="flex items-center gap-2">
                          <span className="inline-block h-3.5 w-3.5 shrink-0 rounded-full border-2 border-ink-300" />
                          <MathText text={c} />
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 text-sm text-ink-500">
                      Answer: <span className="inline-block h-4 w-28 border-b-2 border-ink-900 align-bottom" />
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-5 text-center text-[11px] text-ink-500">
            Generated by PEDMAS · pedmas.com/worksheets · free to print and share for personal and classroom use
          </p>
        </div>

        <div
          id="answer-key"
          className="mt-4 rounded-2xl border border-ink-100 bg-white px-6 py-4 print:mt-0 print:break-before-page print:rounded-none print:border-0 print:px-0"
        >
          <h3 className="text-sm font-extrabold text-ok-600">✓ Answer key</h3>
          <p className="mt-2 text-sm leading-7 text-ink-700">
            {sheet.questions.map((q, i) => (
              <span key={i} className="mr-5 inline-block whitespace-nowrap">
                <b>{i + 1}.</b> <MathText text={stackFractions(q.answer)} />
              </span>
            ))}
          </p>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-5 rounded-2xl bg-brand-600 px-7 py-6 print:hidden">
          <div>
            <h3 className="text-lg font-extrabold text-white">Worksheets show practice. PEDMAS shows the path.</h3>
            <p className="mt-1 max-w-xl text-sm text-brand-100">
              {signupsOpen
                ? "The free placement test finds exactly where your child stands in every strand — then teaches one skill at a time until each is truly mastered."
                : "See how PEDMAS teaches before it practises — read a complete real lesson, no account needed."}
            </p>
          </div>
          <Link
            href={signupsOpen ? "/signup" : "/sample-lesson"}
            className="btn rounded-xl bg-white px-5 py-2.5 text-sm font-extrabold text-brand-700 hover:bg-brand-50"
          >
            {signupsOpen ? "Find your child's level →" : "📘 Read the full lesson"}
          </Link>
        </div>

        <div className="mt-8 print:hidden">
          <h3 className="text-xs font-bold uppercase tracking-wide text-ink-500">More Grade {grade} worksheets</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {siblingTopics.map((t) => (
              <Link
                key={t.slug}
                href={`/worksheets/grade-${grade}/${t.slug}`}
                className="btn rounded-full border border-ink-100 bg-white px-3.5 py-1.5 text-xs font-semibold text-ink-700 hover:border-brand-400 hover:text-brand-700"
              >
                {t.name}
              </Link>
            ))}
          </div>
          {otherGrades.length > 0 && (
            <>
              <h3 className="mt-5 text-xs font-bold uppercase tracking-wide text-ink-500">
                {sheet.topicName} worksheets by grade
              </h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {otherGrades.map((g) => (
                  <Link
                    key={g}
                    href={`/worksheets/grade-${g}/${slug}`}
                    className="btn rounded-full border border-ink-100 bg-white px-3.5 py-1.5 text-xs font-semibold text-ink-700 hover:border-brand-400 hover:text-brand-700"
                  >
                    Grade {g}
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
