/* FollowExam service worker.
 *
 * Strategy:
 * - Navigations are network-first so a signed-in visitor always gets fresh
 *   HTML, with a cached copy and a small offline page as fallbacks.
 * - Static build assets (scripts, styles, icons, fonts) use
 *   stale-while-revalidate so repeat visits stay fast.
 * - API responses such as /jobs.json are never cached, so data stays current.
 */

const VERSION = "followexam-v1";
const STATIC_CACHE = `${VERSION}-static`;
const PAGE_CACHE = `${VERSION}-pages`;

const PRECACHE = [
  "/manifest.webmanifest",
  "/favicon.svg",
  "/favicon-32.png",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-512-maskable.png",
];

const OFFLINE_HTML = `<!doctype html>
<html lang="en-IN">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Offline — FollowExam</title>
<style>
  body { margin: 0; font-family: system-ui, -apple-system, "Segoe UI", sans-serif; background: #f5f8fc; color: #1b2b44; display: grid; place-items: center; min-height: 100vh; padding: 24px; }
  main { background: #fff; border: 1px solid #dbe4ef; border-radius: 14px; padding: 32px; max-width: 420px; text-align: center; box-shadow: 0 10px 30px rgba(16, 42, 77, 0.08); }
  h1 { font-size: 1.4rem; margin: 0 0 10px; }
  p { color: #5a6b82; font-size: 0.92rem; }
  a { display: inline-block; margin-top: 12px; background: #0b4f9c; color: #fff; text-decoration: none; padding: 11px 18px; border-radius: 9px; font-weight: 700; font-size: 0.9rem; }
</style>
</head>
<body>
<main>
  <h1>You are offline</h1>
  <p>FollowExam needs a connection to load the latest official notifications. Reconnect and try again.</p>
  <a href="/">Try again</a>
</main>
</body>
</html>`;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .catch(() => undefined)
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => !key.startsWith(VERSION))
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});

function isCacheableAsset(url) {
  if (url.pathname.startsWith("/_astro/")) return true;
  if (url.pathname.startsWith("/icons/")) return true;
  if (url.pathname === "/favicon.svg" || url.pathname === "/favicon-32.png") return true;
  if (url.pathname === "/manifest.webmanifest") return true;
  return /\.(css|js|mjs|png|jpg|jpeg|svg|webp|avif|woff2?|ttf|otf)$/i.test(url.pathname);
}

async function networkFirst(request) {
  const cache = await caches.open(PAGE_CACHE);
  try {
    const response = await fetch(request);
    if (response && response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    const home = await cache.match("/");
    if (home) return home;
    return new Response(OFFLINE_HTML, {
      status: 200,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((response) => {
      if (response && response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => null);
  return cached || network || fetch(request);
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname === "/sw.js") return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
    return;
  }

  if (isCacheableAsset(url)) {
    event.respondWith(staleWhileRevalidate(request));
  }
});
