const CACHE = "focusflow-v5";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./src/styles/app.css",
  "./dist/src/main.js",
  "./dist/src/appShell.js",
  "./dist/src/historyMenu.js",
  "./dist/src/audioEngine.js",
  "./icons/icon-192.svg",
  "./icons/icon-512.svg",
];

self.addEventListener("install", (e: Event) => {
  const ev = e as Event & { waitUntil: (p: Promise<unknown>) => void };
  ev.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => {
      const sw = self as unknown as ServiceWorkerGlobalScope;
      return sw.skipWaiting();
    })
  );
});

self.addEventListener("activate", (e: Event) => {
  const ev = e as Event & { waitUntil: (p: Promise<unknown>) => void };
  ev.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => {
        const sw = self as unknown as ServiceWorkerGlobalScope;
        return sw.clients.claim();
      })
  );
});

self.addEventListener("fetch", (e: Event) => {
  const ev = e as Event & {
    request: Request;
    respondWith: (p: Promise<Response>) => void;
  };
  const request = ev.request;

  if (request.mode === "navigate") {
    ev.respondWith(
      fetch(request)
        .then((res) => {
          const clone = res.clone();
          void caches.open(CACHE).then((c) => c.put("./index.html", clone));
          return res;
        })
        .catch(async () => {
          const cached = await caches.match("./index.html");
          if (cached) return cached;
          return new Response("Offline", { status: 503, statusText: "Offline" });
        })
    );
    return;
  }

  if (request.url.includes("fonts.googleapis.com") || request.url.includes("fonts.gstatic.com")) {
    ev.respondWith(
      fetch(request)
        .then((res) => {
          const clone = res.clone();
          void caches.open(CACHE).then((c) => c.put(request, clone));
          return res;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          return new Response("Not found", { status: 404, statusText: "Not found" });
        })
    );
    return;
  }

  const isModuleAsset =
    request.destination === "script" || request.url.endsWith(".js") || request.url.endsWith(".css");
  if (isModuleAsset) {
    ev.respondWith(
      caches.match(request).then(async (cached) => {
        if (cached) {
          void fetch(request)
            .then((res) => {
              if (res.ok) {
                const clone = res.clone();
                void caches.open(CACHE).then((c) => c.put(request, clone));
              }
            })
            .catch(() => {});
          return cached;
        }
        try {
          const res = await fetch(request);
          if (res.ok) {
            const clone = res.clone();
            void caches.open(CACHE).then((c) => c.put(request, clone));
          }
          return res;
        } catch {
          return new Response("Not found", { status: 404, statusText: "Not found" });
        }
      })
    );
    return;
  }

  ev.respondWith(
    caches.match(request).then(async (cached) => {
      if (cached) return cached;
      try {
        const res = await fetch(request);
        if (res.ok) {
          const clone = res.clone();
          void caches.open(CACHE).then((c) => c.put(request, clone));
        }
        return res;
      } catch {
        return new Response("Not found", { status: 404, statusText: "Not found" });
      }
    })
  );
});
