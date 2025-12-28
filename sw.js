const CACHE_NAME = "kassandra-v2";
const ASSETS = [
  "/Kasandra/",
  "/Kasandra/index.html",
  "/Kasandra/manifest.json",
  "/Kasandra/icon-192.png",
  "/Kasandra/icon-512.png"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(resp => resp || fetch(e.request))
  );
});
