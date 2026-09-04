const CACHE_NAME = "bubipad-shell-v4";
const APP_SHELL = [
  "./",
  "./index.html",
  "./style.css",
  "./storage-shim.js",
  "./manifest.webmanifest",
  "./vendor/monaco-bundle.js",
  "./vendor/monaco-bundle.css",
  "./vendor/editor.worker.js",
  "./vendor/assets/codicon.ttf",
  "./fonts/courier-prime-latin-400-normal.woff2",
  "./fonts/courier-prime-latin-400-italic.woff2",
  "./fonts/courier-prime-latin-700-normal.woff2",
  "./icons/icon16.png",
  "./icons/icon48.png",
  "./icons/icon128.png",
  "./icons/icon192.png",
  "./icons/icon512.png",
  "./dic/index.json",
  "./dic/es_ES.aff",
  "./dic/es_ES.dic",
  "./dic/eu_ES.aff",
  "./dic/eu_ES.dic",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names.map((name) => (name !== CACHE_NAME ? caches.delete(name) : null))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  // Nunca cachear llamadas a la API de GitHub: siempre red.
  if (req.url.includes("api.github.com")) return;

  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req)
        .then((res) => {
          if (res && res.status === 200 && res.type === "basic") {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
