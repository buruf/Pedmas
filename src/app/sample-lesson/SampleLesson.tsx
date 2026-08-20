"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo, Card, PrimaryButton, GhostButton } from "@/components/ui";
import { AdditionLesson } from "@/components/lesson/arithmetic/AdditionLesson";
import { RegionText } from "@/components/lesson/RegionText";
import type { Region } from "@/lib/region";

/**
 * The public lesson's frame. The lesson component itself is the same one
 * served inside the product — nothing is staged for marketing, which is the
 * whole point: what a visitor reads here is exactly what a child gets.
 */
export function SampleLesson({ region, signupsOpen }: { region: Region; signupsOpen: boolean }) {
  const [done, setDone] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-ink-100">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <Link href="/" className="inline-flex min-h-11 items-center">
            <Logo />
          </Link>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center px-2 text-sm font-semibold text-ink-500 hover:text-ink-900"
          >
            ← Home
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-6 rounded-2xl border border-brand-100 bg-brand-50 px-4 py-3">
          <p className="text-sm font-bold text-brand-700">This is a real lesson from inside PEDMAS</p>
          <p className="mt-1 text-sm text-ink-700">
            The exact lesson a child sees before practising column addition — one of 132 covering
            Grades 1–12. Tap through it the way your child would: each step waits until you&rsquo;re
            ready for the next.
          </p>
        </div>

        <Card>
          <RegionText region={region}>
            <AdditionLesson onFinish={() => setDone(true)} />
          </RegionText>
        </Card>

        {done && (
          <div className="mt-5 rounded-2xl border border-brand-200 bg-brand-50 px-5 py-4 pop-in">
            <p className="font-bold text-ink-900">That&rsquo;s how every PEDMAS lesson works</p>
            <p className="mt-2 text-sm text-ink-700">
              Notice what it never did: it never just told the rule. It started from something the
              child already knew, made the common mistake and disproved it, showed the idea in a
              picture, and had the child finish the last example — the rule came last, once it was
              already obvious. All 132 lessons are built this way, and after each one the child
              practises until mastery is shown across days, not until a page is finished.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {signupsOpen ? (
                <>
                  <PrimaryButton href="/signup">Start Free Placement Test</PrimaryButton>
                  <GhostButton href="/curriculum">Explore the curriculum</GhostButton>
                </>
              ) : (
                <>
                  <PrimaryButton href="/curriculum">Explore the curriculum</PrimaryButton>
                  <span className="inline-flex items-center text-sm text-ink-500">
                    Sign-ups are closed while PEDMAS is being tested.
                  </span>
                </>
              )}
            </div>
          </div>
        )}

        <p className="mt-8 text-center text-xs text-ink-500">
          Lesson: Adding when the ones spill over · Grades 2–3 · Operations strand
        </p>
      </div>
    </div>
  );
}
