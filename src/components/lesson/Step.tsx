"use client";

/**
 * One tap-gated lesson step.
 *
 * Nothing advances on its own: a child controls the pace, and each step stays
 * reopenable so they can look back at the picture that explained the idea.
 */
export function Step({
  n,
  title,
  children,
  open,
  onOpen,
  done,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
  open: boolean;
  onOpen: () => void;
  done: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border-2 transition ${
        open ? "border-brand-300 bg-white" : done ? "border-ok-600/30 bg-ok-100/40" : "border-ink-100 bg-white"
      }`}
    >
      <button
        type="button"
        onClick={onOpen}
        className="btn flex w-full items-center gap-3 px-4 py-3 text-left"
        aria-expanded={open}
      >
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
            done ? "bg-ok-600 text-white" : open ? "bg-brand-600 text-white" : "bg-ink-100 text-ink-700"
          }`}
        >
          {done ? "✓" : n}
        </span>
        <span className="flex-1 font-bold text-ink-900">{title}</span>
        <span className="text-ink-500">{open ? "▾" : "▸"}</span>
      </button>
      {open && <div className="px-4 pb-5 pt-1">{children}</div>}
    </div>
  );
}

/** Blue "the point" callout used at the end of an explanation. */
export function KeyIdea({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-4 rounded-xl bg-brand-50 px-4 py-3 text-sm text-ink-700">{children}</p>
  );
}

/** Dark formula box — the symbolic form, once it has been earned. */
export function FormulaBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-4 rounded-xl bg-ink-900 px-4 py-4 text-center text-xl font-bold text-white">
      {children}
    </div>
  );
}

/** A wrong method shown deliberately, so it can be disproved. */
export function WrongBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-3 rounded-xl border-2 border-err-600/40 bg-err-100/50 px-4 py-3 text-center text-lg font-bold text-ink-900">
      {children} <span className="text-err-600">✗</span>
    </div>
  );
}
