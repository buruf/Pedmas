"use client";

import { useEffect } from "react";
import { Card, PrimaryButton, GhostButton } from "@/components/ui";

/**
 * Render-error boundary. The child sees a calm way forward; the error itself
 * is reported so the admin panel sees what the child could not describe.
 */
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    void fetch("/api/errors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: error.message || `Render error ${error.digest ?? ""}`,
        stack: error.stack,
        path: window.location.pathname,
      }),
      keepalive: true,
    }).catch(() => undefined);
  }, [error]);

  return (
    <div className="grid min-h-screen place-items-center px-4">
      <Card className="max-w-md text-center">
        <div className="text-4xl">🔧</div>
        <h1 className="mt-2 text-xl font-black text-ink-900">Something went wrong</h1>
        <p className="mt-2 text-ink-700">
          It&rsquo;s not you — a page hiccupped on our side, and we&rsquo;ve been told about it.
          Your progress is saved.
        </p>
        <div className="mt-5 flex justify-center gap-3">
          <PrimaryButton onClick={reset}>Try again</PrimaryButton>
          <GhostButton href="/">Go home</GhostButton>
        </div>
      </Card>
    </div>
  );
}
