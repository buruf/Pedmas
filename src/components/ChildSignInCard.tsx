"use client";

import { useState } from "react";
import { GhostButton, PrimaryButton } from "@/components/ui";
import { api } from "@/lib/client";

/**
 * Parent-side control for a child's own sign-in.
 *
 * The code appears exactly once, so the panel holds it prominently until the
 * parent has copied it and says so — burying it would guarantee support
 * requests we cannot satisfy, because only the hash is kept.
 */
export function ChildSignInCard({
  studentId,
  name,
  enabled,
  placed,
  onChanged,
}: {
  studentId: string;
  name: string;
  enabled: boolean;
  placed: boolean;
  onChanged: () => void;
}) {
  const [code, setCode] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const act = async (method: "POST" | "DELETE") => {
    setBusy(true);
    setError("");
    try {
      const res = await api<{ code?: string }>(`/api/students/${studentId}/signin`, { method });
      if (res.code) setCode(res.code);
      else onChanged();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  if (code) {
    return (
      <div className="mt-3 rounded-xl border-2 border-brand-300 bg-brand-50 px-4 py-3">
        <p className="text-sm font-bold text-ink-900">{name}&rsquo;s sign-in code</p>
        <p className="mt-2 select-all rounded-lg bg-white px-3 py-2 text-center font-mono text-lg font-bold tracking-widest text-brand-700">
          {code}
        </p>
        <p className="mt-2 text-xs text-ink-700">
          Write this down — it is shown <strong>once</strong>. {name} enters it at{" "}
          <span className="font-semibold">pedmas.com/student</span>. It signs them in to their own
          practice only: they cannot see billing, your account, or another child.
          {!placed && <> They&rsquo;ll start with their placement test.</>}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <GhostButton
            className="!px-3 !py-1.5 text-xs"
            onClick={() => void navigator.clipboard?.writeText(code)}
          >
            Copy
          </GhostButton>
          <PrimaryButton
            className="!px-3 !py-1.5 text-xs"
            onClick={() => {
              setCode(null);
              onChanged();
            }}
          >
            I have written it down
          </PrimaryButton>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <PrimaryButton className="!px-3 !py-1.5 text-xs" disabled={busy} onClick={() => void act("POST")}>
        {enabled ? "New code" : "Set up sign-in"}
      </PrimaryButton>
      {enabled && (
        <GhostButton className="!px-3 !py-1.5 text-xs" disabled={busy} onClick={() => void act("DELETE")}>
          Turn off
        </GhostButton>
      )}
      <span className="text-xs text-ink-500">
        {enabled
          ? `${name} can sign in at pedmas.com/student`
          : `Let ${name} sign in without your password`}
      </span>
      {error && <span className="w-full text-xs text-err-600">{error}</span>}
    </div>
  );
}
