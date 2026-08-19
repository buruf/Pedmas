"use client";

/**
 * PROTOTYPE — the four foundational arithmetic lessons, for review.
 *
 * Not yet wired into the practice flow. Each lesson follows the same spine:
 * hook → prior knowledge → the new problem → confront the misconception →
 * the big idea → worked example → faded example → the rule.
 */

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/ui";
import { AdditionLesson } from "@/components/lesson/arithmetic/AdditionLesson";
import { SubtractionLesson } from "@/components/lesson/arithmetic/SubtractionLesson";
import { MultiplicationLesson } from "@/components/lesson/arithmetic/MultiplicationLesson";
import { DivisionLesson } from "@/components/lesson/arithmetic/DivisionLesson";

const LESSONS = [
  { id: "add", label: "Addition", sub: "27 + 15", Component: AdditionLesson },
  { id: "sub", label: "Subtraction", sub: "52 − 27", Component: SubtractionLesson },
  { id: "mul", label: "Multiplication", sub: "3 × 24", Component: MultiplicationLesson },
  { id: "div", label: "Division", sub: "72 ÷ 3", Component: DivisionLesson },
] as const;

export default function ArithmeticLessons() {
  const [active, setActive] = useState<(typeof LESSONS)[number]["id"]>("add");
  const Lesson = LESSONS.find((l) => l.id === active)!.Component;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <header className="mb-5 flex items-center justify-between">
        <Link href="/"><Logo /></Link>
        <span className="rounded-full bg-warn-100 px-3 py-1 text-xs font-bold text-warn-600">
          PROTOTYPE
        </span>
      </header>

      <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {LESSONS.map((l) => (
          <button
            key={l.id}
            type="button"
            onClick={() => setActive(l.id)}
            className={`btn rounded-xl border-2 px-3 py-2.5 text-center transition ${
              active === l.id
                ? "border-brand-600 bg-brand-50"
                : "border-ink-100 bg-white hover:border-brand-300"
            }`}
          >
            <div className={`text-sm font-bold ${active === l.id ? "text-brand-800" : "text-ink-900"}`}>
              {l.label}
            </div>
            <div className="mt-0.5 text-xs text-ink-500">{l.sub}</div>
          </button>
        ))}
      </div>

      {/* Remount on change so each lesson starts at step 1. */}
      {/* Needs a handler: the last step's button calls onFinish. */}
      <Lesson key={active} onFinish={() => window.scrollTo({ top: 0, behavior: "smooth" })} />
    </div>
  );
}
