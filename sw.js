const CACHE_NAME = "baby-v1";
self.addEventListener("install", (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((c) => c.addAll(["index.html", "styles.css", "favicon.svg"]))
    );
});
self.addEventListener("activate", (e) => {
    e.waitUntil(
        caches
            .keys()
            .then((keys) =>
                Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
            )
    );
});
self.addEventListener("fetch", (e) => {
    e.respondWith(caches.match(e.request).then((res) => res || fetch(e.request)));
});
