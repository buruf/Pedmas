"use client";

import { useEffect } from "react";

/**
 * Reports unhandled browser errors to /api/errors. Without this, a child
 * hitting a crash is invisible unless a parent writes in — the blind spot
 * the admin Errors panel exists to close.
 *
 * Each distinct message is sent once per page load, five reports at most, so
 * a render loop cannot flood the endpoint from one tab.
 */
export function ErrorReporter() {
  useEffect(() => {
    const seen = new Set<string>();
    let budget = 5;
    const report = (message: string, stack?: string) => {
      if (!message || seen.has(message) || budget <= 0) return;
      seen.add(message);
      budget--;
      void fetch("/api/errors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, stack, path: window.location.pathname }),
        keepalive: true,
      }).catch(() => undefined);
    };
    const onError = (event: ErrorEvent) => report(event.message, event.error?.stack);
    const onRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      report(
        reason instanceof Error ? reason.message : `Unhandled rejection: ${String(reason).slice(0, 200)}`,
        reason instanceof Error ? reason.stack : undefined
      );
    };
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);
  return null;
}
