"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo, PrimaryButton, Card } from "@/components/ui";
import { api } from "@/lib/client";

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState<"PARENT" | "STUDENT">("STUDENT");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [parentAffirmed, setParentAffirmed] = useState(false);

  const submit = async () => {
    setBusy(true);
    setError("");
    try {
      await api("/api/auth/register", {
        method: "POST",
        json: { email, password, name, role, acceptedTerms, parentAffirmed },
      });
      router.push("/onboarding");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10">
      <div className="mb-6 text-center">
        <Link href="/" className="inline-block"><Logo /></Link>
        <h1 className="mt-4 text-2xl font-extrabold text-ink-900">Create your account</h1>
        <p className="mt-1 text-sm text-ink-500">Then we&rsquo;ll find the right starting point.</p>
      </div>
      <Card>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          <div className="grid grid-cols-2 gap-2">
            {(["STUDENT", "PARENT"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`btn rounded-xl border px-3 py-2.5 text-sm font-semibold ${
                  role === r
                    ? "border-brand-600 bg-brand-50 text-brand-700"
                    : "border-ink-300 bg-white text-ink-700"
                }`}
              >
                {r === "STUDENT" ? "I'm a student" : "I'm a parent"}
              </button>
            ))}
          </div>
          <label className="block text-sm font-medium text-ink-700">
            Your name
            <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1" required />
          </label>
          <label className="block text-sm font-medium text-ink-700">
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" required />
          </label>
          <label className="block text-sm font-medium text-ink-700">
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1"
              minLength={8}
              required
            />
          </label>
          {/* Consent is recorded with the policy version — see lib/legal.ts. */}
          <div className="space-y-2.5 rounded-xl bg-paper px-3 py-3">
            <label className="flex cursor-pointer items-start gap-2.5 text-sm text-ink-700">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-0.5 h-5 w-5 shrink-0 accent-brand-600"
                required
              />
              <span>
                I agree to the{" "}
                <Link href="/terms" target="_blank" className="font-semibold text-brand-700 underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" target="_blank" className="font-semibold text-brand-700 underline">
                  Privacy Policy
                </Link>
                .
              </span>
            </label>
            {role === "PARENT" && (
              <label className="flex cursor-pointer items-start gap-2.5 text-sm text-ink-700">
                <input
                  type="checkbox"
                  checked={parentAffirmed}
                  onChange={(e) => setParentAffirmed(e.target.checked)}
                  className="mt-0.5 h-5 w-5 shrink-0 accent-brand-600"
                  required
                />
                <span>
                  I am the parent or legal guardian of any child I add, and I consent to PEDMAS
                  collecting their learning information as described in the Privacy Policy.
                </span>
              </label>
            )}
          </div>

          {error && <p className="rounded-xl bg-err-100 px-3 py-2 text-sm text-err-600">{error}</p>}
          <PrimaryButton
            type="submit"
            disabled={busy || !acceptedTerms || (role === "PARENT" && !parentAffirmed)}
            className="w-full"
          >
            {busy ? "Creating..." : "Create account"}
          </PrimaryButton>
        </form>
        <p className="mt-4 text-center text-sm text-ink-500">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-brand-600">Log in</Link>
        </p>
      </Card>
    </div>
  );
}
