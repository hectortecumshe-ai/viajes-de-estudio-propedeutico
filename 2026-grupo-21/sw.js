// Guarda la guía del viaje en el teléfono para usarla sin internet.
const CACHE = "propedeutico-21-2026-e1ced6000e";
const RECURSOS = ["./", "index.html", "manifest.webmanifest", "icono-192.png", "icono-512.png", "vendor/OrbitControls.js", "vendor/logo_uach_web.jpg", "vendor/relieve.jpg", "vendor/three.min.js"];
self.addEventListener("install", (e) => e.waitUntil(caches.open(CACHE).then((c) => c.addAll(RECURSOS)).then(() => self.skipWaiting())));
self.addEventListener("activate", (e) => e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith("propedeutico-21-2026-") && k !== CACHE)
  .map((k) => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  e.respondWith(fetch(e.request).then((r) => { const c = r.clone(); caches.open(CACHE).then((k) => k.put(e.request, c)); return r; })
    .catch(() => caches.match(e.request, { ignoreSearch: true }).then((r) => r || (e.request.mode === "navigate" ? caches.match("index.html") : undefined))));
});
