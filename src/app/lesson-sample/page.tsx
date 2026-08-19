"use client";

/**
 * PROTOTYPE — the fraction lesson on its own, for review.
 * The lesson itself now lives in the registry and is served inside practice.
 */

import Link from "next/link";
import { Logo } from "@/components/ui";
import { FractionAdditionLesson } from "@/components/lesson/fractions/FractionAdditionLesson";

export default function LessonSample() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <header className="mb-5 flex items-center justify-between">
        <Link href="/"><Logo /></Link>
        <div className="flex items-center gap-2">
          <Link
            href="/lesson-sample/arithmetic"
            className="text-sm font-semibold text-brand-700 hover:underline"
          >
            Arithmetic lessons →
          </Link>
          <span className="rounded-full bg-warn-100 px-3 py-1 text-xs font-bold text-warn-600">
            PROTOTYPE
          </span>
        </div>
      </header>
      {/* Needs a handler: the last step's button calls onFinish. */}
      <FractionAdditionLesson onFinish={() => window.scrollTo({ top: 0, behavior: "smooth" })} />
    </div>
  );
}
