import React from "react";
import Link from "next/link";

/**
 * The mark is the four operations in a square. No letter, so it needs no
 * reading — a child who cannot yet read the wordmark still recognises the
 * app — and it is the form that survives best at browser-tab size, where
 * a monogram turns to mush. Drawn, never set as text, so it cannot reshape
 * itself when a font fails to load.
 */
export function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <svg viewBox="0 0 64 64" className="h-9 w-9" aria-hidden="true" focusable="false">
        <rect width="64" height="64" rx="16" fill="#7c3aed" />
        <g stroke="#fff" strokeWidth="4.6" strokeLinecap="round" fill="none">
          <path d="M15 20h10M20 15v10" />
          <path d="M39 20h10" />
          <path d="M15.5 40.5l9 9M24.5 40.5l-9 9" />
          <path d="M39 45h10" />
        </g>
        <g fill="#fff">
          <circle cx="44" cy="39.4" r="2.5" />
          <circle cx="44" cy="50.6" r="2.5" />
        </g>
      </svg>
      <span
        className={`text-xl font-extrabold tracking-tight ${
          dark ? "text-white" : "text-ink-900"
        }`}
      >
        PEDMAS
      </span>
    </span>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-ink-100 bg-white p-5 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

export function ProgressBar({
  value,
  className = "",
  color = "bg-brand-600",
}: {
  value: number; // 0..100
  className?: string;
  color?: string;
}) {
  return (
    <div className={`h-2 w-full overflow-hidden rounded-full bg-ink-100 ${className}`}>
      <div
        className={`h-full rounded-full ${color} transition-all`}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

export function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Mastered: "bg-ok-100 text-ok-600",
    Strong: "bg-brand-100 text-brand-700",
    Developing: "bg-warn-100 text-warn-600",
    Practicing: "bg-blue-50 text-blue-600",
    "Ready to Learn": "bg-ink-100 text-ink-700",
    Current: "bg-brand-600 text-white",
    // Where the strand resumes once the current topic is mastered.
    "Next up": "bg-brand-50 text-brand-700",
    Locked: "bg-ink-100 text-ink-500",
    Upcoming: "bg-ink-100 text-ink-500",
  };
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        styles[status] ?? "bg-ink-100 text-ink-700"
      }`}
    >
      {status}
    </span>
  );
}

export function PrimaryButton({
  children,
  href,
  onClick,
  type = "button",
  disabled,
  className = "",
}: {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
}) {
  const cls = `btn inline-flex items-center justify-center rounded-xl bg-brand-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-brand-700 active:scale-[0.98] disabled:opacity-50 ${className}`;
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls}>
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  href,
  onClick,
  disabled,
  className = "",
}: {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  const cls = `btn inline-flex items-center justify-center rounded-xl border border-ink-300 bg-white px-6 py-3 text-base font-semibold text-ink-700 transition hover:border-brand-400 hover:text-brand-700 active:scale-[0.98] disabled:opacity-50 ${className}`;
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={cls}>
      {children}
    </button>
  );
}
