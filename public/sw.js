/**
 * PEDMAS service worker (spec §24, "offline-friendly where practical").
 *
 * What "practical" means here: static assets are cached so repeat visits on
 * slow connections are fast, and losing the network mid-use shows a friendly
 * page instead of the browser dinosaur. Full offline PRACTICE is deliberately
 * not attempted: answers are graded server-side and never shipped to the
 * client (a child could otherwise read them from the page), and that security
 * property is worth more than offline grading.
 */
const VERSION = "pedmas-sw-v1";
const OFFLINE_URL = "/offline";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(VERSION).then((cache) => cache.addAll([OFFLINE_URL])).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Never cache API responses: sessions, answers and auth must stay live.
  if (url.pathname.startsWith("/api/")) return;

  // Immutable build assets: cache-first.
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.open(VERSION).then(async (cache) => {
        const hit = await cache.match(req);
        if (hit) return hit;
        const res = await fetch(req);
        if (res.ok) cache.put(req, res.clone());
        return res;
      })
    );
    return;
  }

  // Page navigations: network-first, offline fallback.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(async () => (await caches.match(OFFLINE_URL)) ?? Response.error())
    );
  }
});
