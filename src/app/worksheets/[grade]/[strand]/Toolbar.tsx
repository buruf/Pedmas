"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

/**
 * The only client-side piece of a worksheet page. The daily sheet is free
 * for everyone; rolling FRESH sheets without limit is the giveaway worth an
 * account, so "New sheet" appears only for signed-in families — visitors
 * see what an account unlocks instead. The server enforces the same rule on
 * the ?seed= parameter.
 */
export function WorksheetToolbar({
  canReroll,
  signupsOpen,
}: {
  canReroll: boolean;
  signupsOpen: boolean;
}) {
  const router = useRouter();
  return (
    <div className="flex flex-wrap gap-2.5 print:hidden">
      <button
        type="button"
        className="btn rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-700"
        onClick={() => window.print()}
      >
        🖨 Print this sheet
      </button>
      {canReroll ? (
        <button
          type="button"
          className="btn rounded-xl border border-ink-100 bg-white px-4 py-2.5 text-sm font-bold text-ink-700 hover:border-brand-300"
          onClick={() => router.push(`?seed=${Math.floor(Math.random() * 2 ** 30)}`, { scroll: false })}
        >
          🔄 New sheet
        </button>
      ) : (
        <Link
          href={signupsOpen ? "/signup" : "/login"}
          className="btn inline-flex items-center rounded-xl border border-brand-200 bg-brand-50 px-4 py-2.5 text-sm font-bold text-brand-700 hover:border-brand-400"
        >
          🔒 Unlimited new sheets — {signupsOpen ? "free with an account" : "log in to unlock"}
        </Link>
      )}
      <button
        type="button"
        className="btn rounded-xl border border-ink-100 bg-white px-4 py-2.5 text-sm font-bold text-ink-700 hover:border-brand-300"
        onClick={() => document.getElementById("answer-key")?.scrollIntoView({ behavior: "smooth" })}
      >
        Answer key
      </button>
    </div>
  );
}
