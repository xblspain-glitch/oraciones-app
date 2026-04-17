const VERSION = "instalable_pro_v1_cc8652b249";
const CACHE_NAME = "oraciones-pro-" + VERSION;
const CORE = [
  "./",
  "./index.html?v=" + VERSION,
  "./manifest.json?v=" + VERSION,
  "./icon-192.png?v=" + VERSION,
  "./icon-512.png?v=" + VERSION
];

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => caches.delete(k)));
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(CORE);
  })());
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;

  event.respondWith((async () => {
    try {
      const fresh = await fetch(req, { cache: "no-store" });
      const cache = await caches.open(CACHE_NAME);
      cache.put(req, fresh.clone()).catch(() => null);
      return fresh;
    } catch (e) {
      const cached = await caches.match(req);
      if (cached) return cached;
      const fallback = await caches.match("./index.html?v=" + VERSION);
      return fallback || new Response("Offline", { status: 503, statusText: "Offline" });
    }
  })());
});