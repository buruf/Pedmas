"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/client";
import { Logo, Card, PrimaryButton } from "@/components/ui";

export default function ForgotPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api("/api/auth/forgot", { method: "POST", json: { email } });
    } catch {
      // The endpoint answers the same way regardless; never reveal more.
    }
    setSent(true);
    setBusy(false);
  };

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <header className="mb-8">
        <Link href="/" className="inline-flex min-h-11 items-center">
          <Logo />
        </Link>
      </header>

      <Card>
        <h1 className="text-2xl font-extrabold text-ink-900">Reset your password</h1>

        {sent ? (
          <>
            <p className="mt-3 text-sm text-ink-700">
              If that email has a PEDMAS account, a reset link is on its way. It expires in 45
              minutes and can be used once.
            </p>
            <p className="mt-4 text-sm text-ink-500">
              Didn&rsquo;t get it? Check spam, or{" "}
              <button
                type="button"
                onClick={() => setSent(false)}
                className="font-semibold text-brand-700 underline"
              >
                try another address
              </button>
              .
            </p>
          </>
        ) : (
          <>
            <p className="mt-2 text-sm text-ink-700">
              Enter your email and we&rsquo;ll send you a link to choose a new one.
            </p>
            <form onSubmit={submit} className="mt-5">
              <label htmlFor="email" className="text-sm font-semibold text-ink-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full"
                autoComplete="email"
              />
              <div className="mt-5">
                <PrimaryButton type="submit" disabled={busy}>
                  {busy ? "Sending…" : "Send reset link"}
                </PrimaryButton>
              </div>
            </form>
          </>
        )}

        <p className="mt-6 text-sm text-ink-500">
          Remembered it?{" "}
          <Link href="/login" className="font-semibold text-brand-700">
            Log in
          </Link>
        </p>
      </Card>
    </div>
  );
}
