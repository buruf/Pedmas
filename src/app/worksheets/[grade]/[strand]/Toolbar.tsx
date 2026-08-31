"use client";

import { useRouter } from "next/navigation";

/**
 * The only client-side piece of a worksheet page. "New sheet" re-renders the
 * server page with a random seed, so regeneration and the daily indexable
 * default share one code path.
 */
export function WorksheetToolbar() {
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
      <button
        type="button"
        className="btn rounded-xl border border-ink-100 bg-white px-4 py-2.5 text-sm font-bold text-ink-700 hover:border-brand-300"
        onClick={() => router.push(`?seed=${Math.floor(Math.random() * 2 ** 30)}`, { scroll: false })}
      >
        🔄 New sheet
      </button>
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
