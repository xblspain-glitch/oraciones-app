const CACHE_NAME = "oraciones-estable-v3-fixleer";
self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.map(n => caches.delete(n)));
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(["/","/index.html","/manifest.json","/icon-192.png","/icon-512.png"]);
  })());
  self.skipWaiting();
});
self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n)));
    await self.clients.claim();
  })());
});
self.addEventListener("fetch", event => {
  event.respondWith(
    fetch(event.request).then(response => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy)).catch(()=>null);
      return response;
    }).catch(async () => {
      const cached = await caches.match(event.request);
      return cached || caches.match("/index.html");
    })
  );
});