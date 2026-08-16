"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/client";
import { Logo, Card, PrimaryButton, GhostButton } from "@/components/ui";

interface BillingStatus {
  configured: boolean;
  missingKeys: string[];
  entitlement: { active: boolean; reason: string; trialEndsAt?: number };
  children: number;
  maxChildren: number;
  trialDays: number;
  monthlyLabel: string;
  firstChildCents: number;
  additionalChildCents: number;
  table: { children: number; totalCents: number; perChildCents: number }[];
}

const money = (cents: number) => `$${(cents / 100).toFixed(2)}`;

export default function PricingPage() {
  const [status, setStatus] = useState<BillingStatus | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [loggedOut, setLoggedOut] = useState(false);

  useEffect(() => {
    api<BillingStatus>("/api/billing")
      .then(setStatus)
      .catch(() => setLoggedOut(true));
  }, []);

  const subscribe = async () => {
    setBusy(true);
    setError("");
    try {
      const { url } = await api<{ url: string }>("/api/billing/checkout", { method: "POST" });
      window.location.href = url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start checkout.");
      setBusy(false);
    }
  };

  const table = status?.table ?? [
    { children: 1, totalCents: 1199, perChildCents: 1199 },
    { children: 2, totalCents: 1798, perChildCents: 899 },
    { children: 3, totalCents: 2397, perChildCents: 799 },
    { children: 4, totalCents: 2996, perChildCents: 749 },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <header className="mb-8 flex items-center justify-between">
        <Link href="/" className="inline-flex min-h-11 items-center">
          <Logo />
        </Link>
        <Link
          href="/home"
          className="inline-flex min-h-11 items-center px-2 text-sm font-semibold text-ink-500 hover:text-ink-900"
        >
          Back
        </Link>
      </header>

      <h1 className="text-3xl font-extrabold text-ink-900">One family plan</h1>
      <p className="mt-2 text-ink-700">
        The placement test and your child&rsquo;s full starting profile are free, always. Pay only when
        you want daily practice.
      </p>

      {status && !status.configured && (
        <div className="mt-5 rounded-xl border border-warn-600/30 bg-warn-100 px-4 py-3 text-sm text-ink-700">
          ⚡ <span className="font-semibold">Demo mode</span> — payments are not connected yet, so
          everything is unlocked. Set {status.missingKeys.join(", ")} to take real payments.
        </div>
      )}

      <Card className="mt-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-sm font-semibold uppercase tracking-wide text-brand-700">
              PEDMAS Family
            </div>
            <div className="mt-1 text-4xl font-extrabold text-ink-900">
              {money(status?.firstChildCents ?? 1199)}
              <span className="text-lg font-semibold text-ink-500">/month</span>
            </div>
            <div className="text-sm text-ink-700">
              for your first child · {money(status?.additionalChildCents ?? 599)} for each additional
            </div>
          </div>
          <div className="rounded-xl bg-brand-50 px-3 py-2 text-sm font-semibold text-brand-800">
            {status?.trialDays ?? 7}-day free trial
          </div>
        </div>

        <table className="mt-6 w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-ink-500">
              <th className="pb-2">Children</th>
              <th className="pb-2 text-right">Per month</th>
              <th className="pb-2 text-right">Per child</th>
            </tr>
          </thead>
          <tbody>
            {table.map((row) => (
              <tr key={row.children} className="border-t border-ink-100">
                <td className="py-2 font-semibold text-ink-900">{row.children}</td>
                <td className="py-2 text-right font-bold text-ink-900">{money(row.totalCents)}</td>
                <td className="py-2 text-right text-ink-700">{money(row.perChildCents)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-3 text-xs text-ink-500">
          Covers up to {status?.maxChildren ?? 4} children on one account. Cancel any time.
        </p>
      </Card>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Card>
          <div className="text-sm font-bold text-ink-900">Free, always</div>
          <ul className="mt-2 space-y-1.5 text-sm text-ink-700">
            <li>✓ Adaptive placement test</li>
            <li>✓ Full per-strand starting profile</li>
            <li>✓ Explore the whole curriculum</li>
          </ul>
        </Card>
        <Card>
          <div className="text-sm font-bold text-ink-900">With a subscription</div>
          <ul className="mt-2 space-y-1.5 text-sm text-ink-700">
            <li>✓ Daily personalised practice</li>
            <li>✓ Mastery tracking and spaced review</li>
            <li>✓ Parent dashboard and weekly summary</li>
          </ul>
        </Card>
      </div>

      {error && (
        <div className="mt-5 rounded-xl border border-err-600/30 bg-err-100 px-4 py-3 text-sm text-ink-700">
          {error}
        </div>
      )}

      <div className="mt-7 flex flex-wrap items-center gap-3">
        {loggedOut ? (
          <>
            <Link href="/signup">
              <PrimaryButton>Create an account</PrimaryButton>
            </Link>
            <Link href="/login">
              <GhostButton>Log in</GhostButton>
            </Link>
          </>
        ) : status?.entitlement.active && status.entitlement.reason !== "unconfigured" ? (
          <>
            <div className="text-sm font-semibold text-ok-600">
              ✓ Your subscription is active
            </div>
            <Link href="/billing">
              <GhostButton>Manage billing</GhostButton>
            </Link>
          </>
        ) : status && status.children === 0 ? (
          <>
            <Link href="/onboarding">
              <PrimaryButton>Add a child to get started</PrimaryButton>
            </Link>
            <span className="text-sm text-ink-500">Placement is free — no card needed.</span>
          </>
        ) : (
          <>
            <PrimaryButton onClick={subscribe} disabled={busy || !status}>
              {busy ? "Opening checkout…" : `Start ${status?.trialDays ?? 7}-day free trial`}
            </PrimaryButton>
            {status && (
              <span className="text-sm text-ink-500">
                {status.children} {status.children === 1 ? "child" : "children"} ·{" "}
                {status.monthlyLabel}/month after the trial
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}
