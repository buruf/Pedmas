"use client";

import { useEffect } from "react";

/**
 * Last-resort boundary: the root layout itself failed, so nothing of the
 * app's styling can be assumed. Plain inline styles, same report, same calm.
 */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    void fetch("/api/errors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: error.message || `Global error ${error.digest ?? ""}`,
        stack: error.stack,
        path: window.location.pathname,
      }),
      keepalive: true,
    }).catch(() => undefined);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", display: "grid", placeItems: "center", minHeight: "100vh", margin: 0, background: "#faf9fc", color: "#1f2033" }}>
        <div style={{ textAlign: "center", maxWidth: 420, padding: 24 }}>
          <div style={{ fontSize: 40 }}>🔧</div>
          <h1 style={{ fontSize: 22, margin: "10px 0" }}>Something went wrong</h1>
          <p style={{ lineHeight: 1.5 }}>It&rsquo;s not you — the page hiccupped on our side, and we&rsquo;ve been told about it.</p>
          <button onClick={reset} style={{ marginTop: 16, background: "#7c3aed", color: "#fff", border: 0, borderRadius: 10, padding: "12px 22px", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
