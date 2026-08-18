"use client";

import { use } from "react";
import Link from "next/link";
import { Logo, Card, PrimaryButton, GhostButton } from "@/components/ui";
import { LESSON_COMPONENTS } from "@/components/lesson/registry";
import { LESSON_TITLES, LESSON_KEYS, type LessonKey } from "@/lib/lessons";

/**
 * A lesson opened on its own, from the "Learn" button on the dashboard.
 *
 * Separate from the practice flow on purpose: a child revising, or a parent
 * checking what is being taught, should be able to read a lesson without
 * starting a session and without it counting as anything.
 */
export default function LearnPage({
  params,
}: {
  params: Promise<{ id: string; key: string }>;
}) {
  const { id, key } = use(params);
  const isKnown = (LESSON_KEYS as readonly string[]).includes(key);
  const LessonBody = isKnown ? LESSON_COMPONENTS[key as LessonKey] : undefined;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <header className="mb-5 flex items-center justify-between gap-3">
        <Link href={`/app/${id}`} className="inline-flex min-h-11 items-center">
          <Logo />
        </Link>
        <Link
          href={`/app/${id}`}
          className="inline-flex min-h-11 items-center px-2 text-sm font-semibold text-ink-500 hover:text-ink-900"
        >
          ← Back
        </Link>
      </header>

      {LessonBody ? (
        <>
          <div className="mb-4">
            <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-bold text-brand-700">
              📘 Lesson
            </span>
          </div>
          <Card>
            {/* No onFinish: reading a lesson here changes no progress. */}
            <LessonBody />
          </Card>
          <div className="mt-5 flex flex-wrap gap-3">
            <PrimaryButton href={`/app/${id}/practice`}>Practise this now</PrimaryButton>
            <GhostButton href={`/app/${id}`}>Back to dashboard</GhostButton>
          </div>
        </>
      ) : (
        <Card>
          <p className="text-ink-700">
            That lesson could not be found{isKnown ? "" : ` (${key})`}.
          </p>
          <div className="mt-4">
            <PrimaryButton href={`/app/${id}`}>Back to dashboard</PrimaryButton>
          </div>
        </Card>
      )}

      {isKnown && (
        <p className="mt-6 text-center text-xs text-ink-500">{LESSON_TITLES[key as LessonKey]}</p>
      )}
    </div>
  );
}
