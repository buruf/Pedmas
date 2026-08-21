"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/client";
import { Logo, Card, PrimaryButton, GhostButton } from "@/components/ui";

interface BillingStatus {
  configured: boolean;
  missingKeys: string[];
  emailMissingKeys: string[];
  entitlement: { active: boolean; reason: string; trialEndsAt?: number };
  children: number;
  maxChildren: number;
  trialDays: number;
  monthlyLabel: string;
  billing: {
    status: string | null;
    seats: number | null;
    currentPeriodEnd: number | null;
    trialEndsAt: number | null;
    cancelAtPeriodEnd: boolean;
    hasCustomer: boolean;
  };
}

const date = (ms: number | null | undefined) =>
  ms ? new Date(ms).toLocaleDateString("en-US", { dateStyle: "long" }) : "—";

const STATUS_COPY: Record<string, string> = {
  trialing: "Free trial",
  active: "Active",
  past_due: "Payment overdue",
  canceled: "Cancelled",
  unpaid: "Unpaid",
  incomplete: "Awaiting payment",
};

export default function BillingPage() {
  const [status, setStatus] = useState<BillingStatus | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [justSubscribed, setJustSubscribed] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") === "success") setJustSubscribed(true);
    api<BillingStatus>("/api/billing")
      .then(setStatus)
      .catch((e) => setError(e instanceof Error ? e.message : "Could not load billing."));
  }, []);

  const go = async (path: string, key: string) => {
    setBusy(key);
    setError("");
    try {
      const { url } = await api<{ url: string }>(path, { method: "POST" });
      window.location.href = url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setBusy("");
    }
  };

  const b = status?.billing;
  const active = status?.entitlement.active && status.entitlement.reason !== "unconfigured";

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
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

      <h1 className="text-3xl font-extrabold text-ink-900">Billing</h1>

      {justSubscribed && (
        <div className="mt-5 rounded-xl border border-ok-600/30 bg-ok-100 px-4 py-3 text-sm text-ink-700">
          ✓ You&rsquo;re all set. Your trial has started — practice is unlocked for every child on the
          account.
        </div>
      )}

      {status && !status.configured && (
        <div className="mt-5 rounded-xl border border-warn-600/30 bg-warn-100 px-4 py-3 text-sm text-ink-700">
          ⚡ <span className="font-semibold">Demo mode</span> — Stripe is not connected, so practice is
          unlocked for everyone. Set {status.missingKeys.join(", ")} to take real payments.
        </div>
      )}

      {status && status.emailMissingKeys.length > 0 && (
        <div className="mt-3 rounded-xl border border-warn-600/30 bg-warn-100 px-4 py-3 text-sm text-ink-700">
          ✉️ Email is not connected — reset links and receipts are logged to the server instead of
          being sent. Set {status.emailMissingKeys.join(", ")} to enable it.
        </div>
      )}

      {error && (
        <div className="mt-5 rounded-xl border border-err-600/30 bg-err-100 px-4 py-3 text-sm text-ink-700">
          {error}
        </div>
      )}

      <Card className="mt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-ink-500">Plan</div>
            <div className="text-xl font-extrabold text-ink-900">PEDMAS Family</div>
          </div>
          <div
            className={`rounded-full px-3 py-1 text-sm font-bold ${
              active ? "bg-ok-100 text-ok-600" : "bg-ink-100 text-ink-700"
            }`}
          >
            {b?.status ? (STATUS_COPY[b.status] ?? b.status) : "No subscription"}
          </div>
        </div>

        <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-ink-500">Children on the account</dt>
            <dd className="font-semibold text-ink-900">
              {/* The admin can hold more profiles than the family cap; "9 of 4"
                  reads broken, so past the cap show the count with the cap as
                  context instead of as a fraction. */}
              {status && status.children > (status.maxChildren ?? 4)
                ? `${status.children} (plan covers ${status.maxChildren ?? 4})`
                : `${status?.children ?? "—"} of ${status?.maxChildren ?? 4}`}
            </dd>
          </div>
          <div>
            <dt className="text-ink-500">Monthly total</dt>
            <dd className="font-semibold text-ink-900">{status?.monthlyLabel ?? "—"}</dd>
          </div>
          {b?.status === "trialing" && (
            <div>
              <dt className="text-ink-500">Trial ends</dt>
              <dd className="font-semibold text-ink-900">{date(b.trialEndsAt)}</dd>
            </div>
          )}
          {b?.currentPeriodEnd && (
            <div>
              <dt className="text-ink-500">
                {b.cancelAtPeriodEnd ? "Access ends" : "Next payment"}
              </dt>
              <dd className="font-semibold text-ink-900">{date(b.currentPeriodEnd)}</dd>
            </div>
          )}
        </dl>

        {b?.cancelAtPeriodEnd && (
          <p className="mt-4 rounded-xl bg-warn-100 px-3 py-2 text-sm text-ink-700">
            Your subscription is set to cancel. Practice stays available until {date(b.currentPeriodEnd)}.
          </p>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          {active ? (
            <PrimaryButton onClick={() => go("/api/billing/portal", "portal")} disabled={busy !== ""}>
              {busy === "portal" ? "Opening…" : "Manage subscription"}
            </PrimaryButton>
          ) : (
            <PrimaryButton
              onClick={() => go("/api/billing/checkout", "checkout")}
              disabled={busy !== "" || !status || status.children === 0}
            >
              {busy === "checkout"
                ? "Opening checkout…"
                : `Start ${status?.trialDays ?? 7}-day free trial`}
            </PrimaryButton>
          )}
          <Link href="/pricing">
            <GhostButton>See pricing</GhostButton>
          </Link>
        </div>

        {status?.children === 0 && (
          <p className="mt-3 text-sm text-ink-500">
            Add a child profile first — the placement test is free.
          </p>
        )}
      </Card>

      <p className="mt-4 text-xs text-ink-500">
        Payments are processed by Stripe. Card details never touch PEDMAS servers.
      </p>
    </div>
  );
}
