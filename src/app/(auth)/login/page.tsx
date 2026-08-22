"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo, PrimaryButton, Card } from "@/components/ui";
import { api } from "@/lib/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  // Set once the password is accepted but a second factor is still owed.
  const [challenge, setChallenge] = useState("");
  const [code, setCode] = useState("");

  const submit = async () => {
    setBusy(true);
    setError("");
    try {
      const me = await api<{ role: string; mfaRequired?: boolean; challenge?: string }>(
        "/api/auth/login",
        { method: "POST", json: { email, password } }
      );
      if (me.mfaRequired && me.challenge) {
        setChallenge(me.challenge);
        setBusy(false);
        return;
      }
      router.push(me.role === "ADMIN" ? "/admin" : "/home");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setBusy(false);
    }
  };

  const submitCode = async () => {
    setBusy(true);
    setError("");
    try {
      const me = await api<{ role: string; usedRecoveryCode?: boolean; remainingRecoveryCodes?: number }>(
        "/api/auth/mfa",
        { method: "POST", json: { challenge, code } }
      );
      if (me.usedRecoveryCode) {
        // Worth knowing immediately: recovery codes are finite.
        alert(`Signed in with a recovery code. ${me.remainingRecoveryCodes ?? 0} left — generate new ones from the admin console.`);
      }
      router.push(me.role === "ADMIN" ? "/admin" : "/home");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setCode("");
      setBusy(false);
    }
  };

  if (challenge) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10">
        <div className="mb-6 text-center">
          <Link href="/" className="inline-block"><Logo /></Link>
          <h1 className="mt-4 text-2xl font-extrabold text-ink-900">Enter your code</h1>
          <p className="mt-2 text-sm text-ink-500">
            Open your authenticator app and type the six-digit code for PEDMAS.
          </p>
        </div>
        <Card>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              void submitCode();
            }}
          >
            <label className="block text-sm font-medium text-ink-700">
              Six-digit code
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                autoFocus
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="mt-1 text-center text-lg tracking-[0.3em]"
                placeholder="000000"
                required
              />
            </label>
            {error && <p className="rounded-xl bg-err-100 px-3 py-2 text-sm text-err-600">{error}</p>}
            <PrimaryButton type="submit" disabled={busy} className="w-full">
              {busy ? "Checking…" : "Verify"}
            </PrimaryButton>
          </form>
          <p className="mt-4 text-center text-xs text-ink-500">
            Lost your phone? Enter one of your recovery codes instead.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10">
      <div className="mb-6 text-center">
        <Link href="/" className="inline-block"><Logo /></Link>
        <h1 className="mt-4 text-2xl font-extrabold text-ink-900">Welcome back</h1>
      </div>
      <Card>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          <label className="block text-sm font-medium text-ink-700">
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" required />
          </label>
          <label className="block text-sm font-medium text-ink-700">
            Password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1" required />
          </label>
          {error && <p className="rounded-xl bg-err-100 px-3 py-2 text-sm text-err-600">{error}</p>}
          <PrimaryButton type="submit" disabled={busy} className="w-full">
            {busy ? "Logging in..." : "Log in"}
          </PrimaryButton>
        </form>
        <p className="mt-4 text-center text-sm text-ink-500">
          <Link href="/forgot" className="font-semibold text-brand-600">Forgot your password?</Link>
        </p>
        <p className="mt-2 text-center text-sm text-ink-500">
          New to PEDMAS?{" "}
          <Link href="/signup" className="font-semibold text-brand-600">Create an account</Link>
        </p>
      </Card>
    </div>
  );
}
