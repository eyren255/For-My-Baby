const STATIC_CACHE = "baby-static-v4";
const RUNTIME_CACHE = "baby-runtime-v4";

self.addEventListener("install", (event) => {
    // Precache only truly static essentials; avoid html/css to reduce staleness
    event.waitUntil(caches.open(STATIC_CACHE).then((cache) => cache.addAll(["favicon.svg"])));
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((keys) =>
                Promise.all(
                    keys
                        .filter((k) => k !== STATIC_CACHE && k !== RUNTIME_CACHE)
                        .map((k) => caches.delete(k))
                )
            )
    );
    self.clients.claim();
});

self.addEventListener("fetch", (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Bypass cross-origin except same-origin requests
    if (url.origin !== self.location.origin) return;

    const isHTML =
        request.mode === "navigate" || (request.headers.get("accept") || "").includes("text/html");
    const isCSS = url.pathname.endsWith(".css");
    const isJS = url.pathname.endsWith(".js");

    if (isHTML || isCSS || isJS) {
        // Network-first for app shell assets to pick up updates immediately
        event.respondWith(
            fetch(request)
                .then((response) => {
                    const copy = response.clone();
                    caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
                    return response;
                })
                .catch(() => caches.match(request))
        );
        return;
    }

    // Cache-first for images and other static assets
    event.respondWith(
        caches.match(request).then((cached) => {
            if (cached) return cached;
            return fetch(request).then((response) => {
                const copy = response.clone();
                caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
                return response;
            });
        })
    );
});
