"use client";

import { useEffect } from "react";

/**
 * Registers the service worker. Production only: a caching worker in
 * development serves stale bundles and turns every HMR mystery into an hour
 * of confusion.
 */
export function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  }, []);
  return null;
}
