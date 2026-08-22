"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, PrimaryButton, GhostButton } from "@/components/ui";
import { api } from "@/lib/client";

interface Status {
  enabled: boolean;
  recoveryCodesLeft: number;
  required: boolean;
}

/**
 * Two-factor setup for the admin account.
 *
 * The flow is deliberately "prove it before we trust it": the secret is
 * offered, the admin scans or types it, and MFA only switches on once a code
 * from their app verifies. A mis-scanned QR therefore costs nothing.
 *
 * Recovery codes appear exactly once. The panel says so plainly and refuses
 * to move on until they have been acknowledged.
 */
export function MfaPanel() {
  const [status, setStatus] = useState<Status | null>(null);
  const [secret, setSecret] = useState<{ formattedSecret: string; otpauthUri: string } | null>(null);
  const [code, setCode] = useState("");
  const [codes, setCodes] = useState<string[] | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    api<Status>("/api/account/mfa")
      .then(setStatus)
      .catch(() => setStatus(null));
  }, []);
  useEffect(load, [load]);

  const act = async (action: string, body: Record<string, unknown> = {}) => {
    setBusy(true);
    setError("");
    try {
      return await api<Record<string, unknown>>("/api/account/mfa", {
        method: "POST",
        json: { action, ...body },
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      return null;
    } finally {
      setBusy(false);
    }
  };

  if (!status) return null;

  // Recovery codes take over the panel until acknowledged — they cannot be
  // shown again, so burying them under other controls would be a trap.
  if (codes) {
    return (
      <Card className="mt-6 border-2 border-brand-300">
        <h2 className="font-bold text-ink-900">Save your recovery codes</h2>
        <p className="mt-1 text-sm text-ink-700">
          These are shown <strong>once</strong>. Each works a single time in place of your
          authenticator app — store them somewhere you can reach without your phone.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl bg-paper p-3 font-mono text-sm">
          {codes.map((c) => (
            <div key={c}>{c}</div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <GhostButton onClick={() => void navigator.clipboard?.writeText(codes.join("\n"))}>
            Copy to clipboard
          </GhostButton>
          <PrimaryButton
            onClick={() => {
              setCodes(null);
              setSecret(null);
              setCode("");
              load();
            }}
          >
            I have saved them
          </PrimaryButton>
        </div>
      </Card>
    );
  }

  if (secret) {
    return (
      <Card className="mt-6 border-2 border-brand-300">
        <h2 className="font-bold text-ink-900">Set up two-factor authentication</h2>
        <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm text-ink-700">
          <li>Open an authenticator app (Google Authenticator, Authy, 1Password…).</li>
          <li>
            Add an account by pasting this setup link, or type the key by hand:
            <div className="mt-2 break-all rounded-xl bg-paper px-3 py-2 font-mono text-xs">{secret.otpauthUri}</div>
            <div className="mt-2 rounded-xl bg-paper px-3 py-2 font-mono text-sm tracking-wider">
              {secret.formattedSecret}
            </div>
          </li>
          <li>Type the six-digit code it shows, to prove it is working.</li>
        </ol>
        <form
          className="mt-4 flex flex-wrap items-end gap-3"
          onSubmit={async (e) => {
            e.preventDefault();
            const res = await act("confirm", { code });
            if (res?.recoveryCodes) setCodes(res.recoveryCodes as string[]);
          }}
        >
          <label className="text-sm font-medium text-ink-700">
            Six-digit code
            <input
              type="text"
              inputMode="numeric"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="mt-1 w-40 text-center tracking-[0.3em]"
              placeholder="000000"
              required
            />
          </label>
          <PrimaryButton type="submit" disabled={busy}>
            {busy ? "Checking…" : "Turn it on"}
          </PrimaryButton>
          <GhostButton onClick={() => { setSecret(null); setCode(""); setError(""); }}>Cancel</GhostButton>
        </form>
        {error && <p className="mt-3 rounded-xl bg-err-100 px-3 py-2 text-sm text-err-600">{error}</p>}
      </Card>
    );
  }

  return (
    <Card className={`mt-6 ${status.enabled ? "" : "border-2 border-warn-600/40"}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-bold text-ink-900">Two-factor authentication</h2>
          <p className="mt-1 text-sm text-ink-700">
            {status.enabled ? (
              <>
                On. Sign-in asks for a code from your authenticator app.{" "}
                <span className={status.recoveryCodesLeft <= 2 ? "font-semibold text-err-600" : "text-ink-500"}>
                  {status.recoveryCodesLeft} recovery code{status.recoveryCodesLeft === 1 ? "" : "s"} left.
                </span>
              </>
            ) : (
              <>
                Off. This account can read every family&rsquo;s data, so a stolen password is the
                worst thing that can happen to this service — a second factor makes one useless.
              </>
            )}
          </p>
        </div>
        {!status.enabled && (
          <PrimaryButton
            disabled={busy}
            onClick={async () => {
              const res = await act("begin");
              if (res) setSecret(res as unknown as { formattedSecret: string; otpauthUri: string });
            }}
          >
            Turn on
          </PrimaryButton>
        )}
      </div>

      {status.enabled && (
        <form
          className="mt-4 flex flex-wrap items-end gap-3 border-t border-ink-100 pt-4"
          onSubmit={(e) => e.preventDefault()}
        >
          <label className="text-sm font-medium text-ink-700">
            Current code
            <input
              type="text"
              inputMode="numeric"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="mt-1 w-40 text-center tracking-[0.3em]"
              placeholder="000000"
            />
          </label>
          <GhostButton
            disabled={busy}
            onClick={async () => {
              const res = await act("regenerate", { code });
              if (res?.recoveryCodes) setCodes(res.recoveryCodes as string[]);
            }}
          >
            New recovery codes
          </GhostButton>
          <GhostButton
            disabled={busy}
            onClick={async () => {
              const res = await act("disable", { code });
              if (res) { setCode(""); load(); }
            }}
          >
            Turn off
          </GhostButton>
          <p className="w-full text-xs text-ink-500">
            Both actions need a current code, so a hijacked session cannot remove your protection.
          </p>
        </form>
      )}
      {error && <p className="mt-3 rounded-xl bg-err-100 px-3 py-2 text-sm text-err-600">{error}</p>}
    </Card>
  );
}
