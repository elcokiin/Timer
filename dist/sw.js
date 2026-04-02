/// <reference lib="webworker" />
const CACHE = "focusflow-v4";
const ASSETS = [
    "./",
    "./index.html",
    "./manifest.json",
    "./dist/src/main.js",
    "./dist/src/historyMenu.js",
    "./dist/src/audioEngine.js",
    "./icons/icon-192.svg",
    "./icons/icon-512.svg",
];
self.addEventListener("install", (e) => {
    e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
    e.waitUntil(caches
        .keys()
        .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
        .then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
    const request = e.request;
    if (request.mode === "navigate") {
        e.respondWith(fetch(request)
            .then((res) => {
            const clone = res.clone();
            void caches.open(CACHE).then((c) => c.put("./index.html", clone));
            return res;
        })
            .catch(() => caches.match("./index.html")));
        return;
    }
    if (request.url.includes("fonts.googleapis.com") || request.url.includes("fonts.gstatic.com")) {
        e.respondWith(fetch(request)
            .then((res) => {
            const clone = res.clone();
            void caches.open(CACHE).then((c) => c.put(request, clone));
            return res;
        })
            .catch(() => caches.match(request)));
        return;
    }
    const isModuleAsset = request.destination === "script" || request.url.endsWith(".js") || request.url.endsWith(".css");
    if (isModuleAsset) {
        e.respondWith(caches.match(request).then((cached) => {
            const networkFetch = fetch(request)
                .then((res) => {
                if (res.ok) {
                    const clone = res.clone();
                    void caches.open(CACHE).then((c) => c.put(request, clone));
                }
                return res;
            })
                .catch(() => cached);
            return cached || networkFetch;
        }));
        return;
    }
    e.respondWith(caches.match(request).then((cached) => cached ||
        fetch(request).then((res) => {
            if (res.ok) {
                const clone = res.clone();
                void caches.open(CACHE).then((c) => c.put(request, clone));
            }
            return res;
        })));
});
export {};
