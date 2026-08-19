"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { Logo, Card, PrimaryButton, GhostButton } from "@/components/ui";
import { LESSON_COMPONENTS } from "@/components/lesson/registry";
import { RegionText } from "@/components/lesson/RegionText";
import { LESSON_TITLES, LESSON_KEYS, type LessonKey } from "@/lib/lessons";
import type { Region } from "@/lib/region";
import { api } from "@/lib/client";

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
  const [done, setDone] = useState(false);
  const [region, setRegion] = useState<Region>("INTL");

  // Ask the server which variant this family reads.
  useEffect(() => {
    api<{ region?: Region }>("/api/auth/me")
      .then((m) => setRegion(m.region ?? "INTL"))
      .catch(() => undefined);
  }, []);
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
            {/* Reading a lesson here records no progress, but the final step's
                button still needs somewhere to go — without a handler it
                renders and silently does nothing. */}
            <RegionText region={region}>
              <LessonBody onFinish={() => setDone(true)} />
            </RegionText>
          </Card>

          {done && (
            <div className="mt-4 rounded-2xl border border-ok-600/30 bg-ok-100 px-4 py-3 pop-in">
              <p className="font-bold text-ink-900">✓ You finished this lesson</p>
              <p className="mt-1 text-sm text-ink-700">
                Nothing was recorded — you can read it again whenever you like.
              </p>
            </div>
          )}
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
