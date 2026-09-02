"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Logo, Card, GhostButton } from "@/components/ui";
import { LogoutButton } from "@/components/LogoutButton";
import { api } from "@/lib/client";

interface Me {
  id: string;
  email: string;
  name: string;
  role: string;
  region?: "US" | "INTL";
}
interface Child {
  id: string;
  name: string;
  grade: number;
}

/**
 * Account and data controls.
 *
 * Deletion lives here rather than buried in a dashboard because a parent must
 * be able to find it: being able to remove a child's records is a right, not
 * a feature, and it is only meaningful if it is easy to reach.
 */
export default function AccountPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [confirmChild, setConfirmChild] = useState<Child | null>(null);
  const [confirmAccount, setConfirmAccount] = useState(false);
  const [typed, setTyped] = useState("");

  const load = () => {
    api<Me>("/api/auth/me").then(setMe).catch(() => setError("Please log in."));
    api<Child[]>("/api/students").then(setChildren).catch(() => undefined);
  };
  useEffect(load, []);

  const removeChild = async (child: Child) => {
    setBusy(child.id);
    try {
      await api(`/api/students/${child.id}`, { method: "DELETE" });
      setConfirmChild(null);
      setChildren((c) => c.filter((x) => x.id !== child.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not delete.");
    } finally {
      setBusy("");
    }
  };

  const removeAccount = async () => {
    setBusy("account");
    try {
      await api("/api/account", { method: "DELETE" });
      window.location.href = "/";
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not delete the account.");
      setBusy("");
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <header className="mb-8 flex items-center justify-between">
        <Link href="/"><Logo /></Link>
        <div className="flex items-center gap-2">
          <Link href="/home" className="text-sm font-semibold text-ink-500 hover:text-ink-900">
            Back
          </Link>
          <LogoutButton />
        </div>
      </header>

      <h1 className="text-3xl font-extrabold text-ink-900">Account &amp; data</h1>
      {me && <p className="mt-1 text-ink-500">{me.email}</p>}
      {error && (
        <p className="mt-4 rounded-xl bg-err-100 px-3 py-2 text-sm text-err-600">{error}</p>
      )}

      <Card className="mt-6">
        <h2 className="font-bold text-ink-900">What we hold</h2>
        <p className="mt-2 text-sm text-ink-700">
          Your name and email, and for each child a name, school grade and their learning history —
          which questions they answered, how they did, and what they have mastered. We never store
          card details. The{" "}
          <Link href="/privacy" className="font-semibold text-brand-700 underline">
            Privacy Policy
          </Link>{" "}
          sets this out in full.
        </p>
      </Card>

      <Card className="mt-4">
        <h2 className="font-bold text-ink-900">Units &amp; spelling</h2>
        <p className="mt-2 text-sm text-ink-700">
          This decides which measurement units your children learn — inches, feet and pounds, or
          centimetres, metres and kilograms — and the spelling used in questions. We guess it from
          your location, but the guess can be wrong (a VPN is enough), so you can set it here.
          Today&rsquo;s unfinished practice refreshes with the right units straight away.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {([
            ["INTL", "Metric (Canada, UK, and most of the world)"],
            ["US", "US customary (United States)"],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={`btn rounded-xl border-2 px-4 py-2 text-sm font-semibold transition ${
                me?.region === value
                  ? "border-brand-600 bg-brand-50 text-brand-800"
                  : "border-ink-100 bg-white text-ink-700 hover:border-brand-300"
              }`}
              onClick={async () => {
                await api("/api/account", { method: "PATCH", json: { region: value } }).catch(() => undefined);
                load();
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </Card>

      <Card className="mt-4">
        <h2 className="font-bold text-ink-900">Delete a child&rsquo;s data</h2>
        <p className="mt-1 text-sm text-ink-500">
          Removes that child&rsquo;s profile and their entire learning history. This cannot be
          undone.
        </p>
        {children.length === 0 ? (
          <p className="mt-3 text-sm text-ink-500">No child profiles on this account.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {children.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between gap-3 rounded-xl bg-paper px-3 py-2.5"
              >
                <span className="text-sm font-semibold text-ink-900">
                  {c.name} <span className="font-normal text-ink-500">· Grade {c.grade}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setConfirmChild(c)}
                  className="btn rounded-lg border border-err-600/40 px-3 py-1.5 text-sm font-semibold text-err-600 hover:bg-err-100"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}

        {confirmChild && (
          <div className="mt-4 rounded-xl border-2 border-err-600/40 bg-err-100/40 p-4 pop-in">
            <p className="text-sm font-semibold text-ink-900">
              Delete {confirmChild.name} and all of their learning history?
            </p>
            <p className="mt-1 text-sm text-ink-700">This is permanent.</p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                disabled={busy === confirmChild.id}
                onClick={() => void removeChild(confirmChild)}
                className="btn rounded-xl bg-err-600 px-4 py-2 text-sm font-bold text-white hover:opacity-90"
              >
                {busy === confirmChild.id ? "Deleting…" : `Yes, delete ${confirmChild.name}`}
              </button>
              <GhostButton onClick={() => setConfirmChild(null)}>Cancel</GhostButton>
            </div>
          </div>
        )}
      </Card>

      <Card className="mt-4 border-err-600/30">
        <h2 className="font-bold text-ink-900">Delete this account</h2>
        <p className="mt-1 text-sm text-ink-500">
          Removes your account, every child profile on it and all learning history. Cancel your
          subscription first if you have one, so you are not billed again.
        </p>
        {!confirmAccount ? (
          <button
            type="button"
            onClick={() => setConfirmAccount(true)}
            className="btn mt-3 rounded-xl border border-err-600/40 px-4 py-2 text-sm font-semibold text-err-600 hover:bg-err-100"
          >
            Delete my account
          </button>
        ) : (
          <div className="mt-3 rounded-xl border-2 border-err-600/40 bg-err-100/40 p-4 pop-in">
            <p className="text-sm text-ink-700">
              Type <strong>DELETE</strong> to confirm. This erases everything and cannot be undone.
            </p>
            <input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder="DELETE"
              className="mt-2 text-center font-bold"
            />
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                disabled={typed.trim().toUpperCase() !== "DELETE" || busy === "account"}
                onClick={() => void removeAccount()}
                className="btn rounded-xl bg-err-600 px-4 py-2 text-sm font-bold text-white hover:opacity-90 disabled:opacity-40"
              >
                {busy === "account" ? "Deleting…" : "Permanently delete everything"}
              </button>
              <GhostButton
                onClick={() => {
                  setConfirmAccount(false);
                  setTyped("");
                }}
              >
                Cancel
              </GhostButton>
            </div>
          </div>
        )}
      </Card>

      <p className="mt-6 text-center text-xs text-ink-500">
        <Link href="/privacy" className="hover:underline">Privacy Policy</Link> ·{" "}
        <Link href="/terms" className="hover:underline">Terms of Service</Link>
      </p>
    </div>
  );
}
