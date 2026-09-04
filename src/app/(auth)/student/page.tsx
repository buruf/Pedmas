"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo, PrimaryButton, Card } from "@/components/ui";
import { api } from "@/lib/client";
import { formatCodeInput, CODE_GROUP, CODE_GROUPS } from "@/lib/codeFormat";

/**
 * Where a child signs in on their own.
 *
 * Deliberately plainer than the parent's login: one field, no email, no
 * password, and wording a nine-year-old can follow. The code came from their
 * parent, so the failure message points them back to a parent rather than
 * offering account recovery a child cannot complete.
 */
export default function StudentSignInPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await api<{ studentId: string }>("/api/auth/child", {
        method: "POST",
        json: { code },
      });
      router.push(`/app/${res.studentId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10">
      <div className="mb-6 text-center">
        <Link href="/" className="inline-block"><Logo /></Link>
        <h1 className="mt-4 text-2xl font-extrabold text-ink-900">Hello! Let&rsquo;s get started</h1>
        <p className="mt-2 text-ink-500">Type the code your parent gave you.</p>
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
            Your code
            <input
              type="text"
              value={code}
              // Hyphens appear on their own after every four characters;
              // children were hunting for the hyphen key.
              onChange={(e) => setCode(formatCodeInput(e.target.value))}
              autoFocus
              autoComplete="off"
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
              maxLength={CODE_GROUP * CODE_GROUPS + CODE_GROUPS - 1}
              className="mt-1 text-center text-lg uppercase tracking-[0.2em]"
              placeholder="ABCD-EFGH-JKLM"
              required
            />
          </label>
          {error && <p className="rounded-xl bg-err-100 px-3 py-2 text-sm text-err-600">{error}</p>}
          <PrimaryButton type="submit" disabled={busy} className="w-full">
            {busy ? "Checking…" : "Start learning"}
          </PrimaryButton>
        </form>
        <p className="mt-4 text-center text-sm text-ink-500">
          Are you a parent?{" "}
          <Link href="/login" className="font-semibold text-brand-600">Sign in here</Link>
        </p>
      </Card>
    </div>
  );
}
