"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/client";
import { Logo, Card, PrimaryButton } from "@/components/ui";

function ResetForm() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token") ?? "";

  const [state, setState] = useState<"checking" | "ready" | "invalid">("checking");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("This link is missing its reset token.");
      setState("invalid");
      return;
    }
    api<{ ok: true; email: string }>(`/api/auth/reset?token=${encodeURIComponent(token)}`)
      .then((r) => {
        setEmail(r.email);
        setState("ready");
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "This reset link is not valid.");
        setState("invalid");
      });
  }, [token]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Those passwords don't match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setBusy(true);
    try {
      await api("/api/auth/reset", { method: "POST", json: { token, password } });
      router.push("/home");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not reset your password.");
      setBusy(false);
    }
  };

  if (state === "checking") {
    return <p className="mt-3 text-sm text-ink-500">Checking your link…</p>;
  }

  if (state === "invalid") {
    return (
      <>
        <p className="mt-3 rounded-xl border border-err-600/30 bg-err-100 px-4 py-3 text-sm text-ink-700">
          {error}
        </p>
        <p className="mt-4 text-sm text-ink-700">
          <Link href="/forgot" className="font-semibold text-brand-700">
            Request a new reset link
          </Link>
        </p>
      </>
    );
  }

  return (
    <>
      <p className="mt-2 text-sm text-ink-700">
        Choose a new password for <span className="font-semibold">{email}</span>.
      </p>
      <form onSubmit={submit} className="mt-5">
        <label htmlFor="pw" className="text-sm font-semibold text-ink-700">
          New password
        </label>
        <input
          id="pw"
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full"
          autoComplete="new-password"
        />
        <label htmlFor="pw2" className="mt-4 block text-sm font-semibold text-ink-700">
          Confirm password
        </label>
        <input
          id="pw2"
          type="password"
          required
          minLength={8}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="mt-1 w-full"
          autoComplete="new-password"
        />
        {error && (
          <p className="mt-3 rounded-xl border border-err-600/30 bg-err-100 px-3 py-2 text-sm text-ink-700">
            {error}
          </p>
        )}
        <div className="mt-5">
          <PrimaryButton type="submit" disabled={busy}>
            {busy ? "Saving…" : "Set new password"}
          </PrimaryButton>
        </div>
      </form>
    </>
  );
}

export default function ResetPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <header className="mb-8">
        <Link href="/" className="inline-flex min-h-11 items-center">
          <Logo />
        </Link>
      </header>
      <Card>
        <h1 className="text-2xl font-extrabold text-ink-900">Set a new password</h1>
        <Suspense fallback={<p className="mt-3 text-sm text-ink-500">Loading…</p>}>
          <ResetForm />
        </Suspense>
      </Card>
    </div>
  );
}
