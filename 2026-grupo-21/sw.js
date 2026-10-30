// Guarda la guía del viaje en el teléfono para usarla sin internet.
const CACHE = "propedeutico-21-2026-38450fbe11";
const RECURSOS = ["./", "index.html", "manifest.webmanifest", "icono-192.png", "icono-512.png", "vendor/OrbitControls.js", "vendor/logo_uach_web.jpg", "vendor/relieve.jpg", "vendor/three.min.js"];
self.addEventListener("install", (e) => e.waitUntil(caches.open(CACHE).then((c) => c.addAll(RECURSOS)).then(() => self.skipWaiting())));
self.addEventListener("activate", (e) => e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith("propedeutico-21-2026-") && k !== CACHE)
  .map((k) => caches.delete(k)))).then(() => self.clients.claim())));
// En campo la señal suele ser débil: los archivos fijos (vendor/, íconos) salen siempre de lo guardado;
// la página busca la versión nueva en la red, pero si no responde en 3 s abre lo guardado.
const guardada = (req) => caches.match(req, { ignoreSearch: true })
  .then((r) => r || (req.mode === "navigate" ? caches.match("index.html") : undefined));
const guardar = (req, r) => { if (r && r.ok) { const c = r.clone(); caches.open(CACHE).then((k) => k.put(req, c)); } return r; };
self.addEventListener("fetch", (e) => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== location.origin) return;
  if (/\/vendor\/|icono-\d+\.png$/.test(url.pathname)) {
    e.respondWith(guardada(req).then((r) => r || fetch(req).then((n) => guardar(req, n))));
    return;
  }
  e.respondWith(new Promise((listo) => {
    let hecho = false;
    const dar = (r) => { if (!hecho && r) { hecho = true; listo(r); } };
    const espera = setTimeout(() => guardada(req).then(dar), 3000);
    fetch(req).then((n) => { clearTimeout(espera); guardar(req, n); dar(n); })
      .catch(() => { clearTimeout(espera); guardada(req).then((r) => { if (!hecho) { hecho = true; listo(r || Response.error()); } }); });
  }));
});
