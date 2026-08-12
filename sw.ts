const CACHE = "focusflow-v8";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./src/styles/app.css",
  "./dist/src/main.js",
  "./dist/src/appShell.js",
  "./dist/src/audioEngine.js",
  "./dist/src/audioTrim.js",
  "./dist/src/dom.js",
  "./dist/src/historyMenu.js",
  "./dist/src/keyboard.js",
  "./dist/src/lazyModules.js",
  "./dist/src/ring.js",
  "./dist/src/shortcuts.js",
  "./dist/src/state.js",
  "./dist/src/storage.js",
  "./dist/src/timerCore.js",
  "./dist/src/types.js",
  "./dist/src/uiBindings.js",
  "./icons/icon-192.svg",
  "./icons/icon-512.svg",
  "./favicon.svg",
];

async function precacheAssets(cache: Cache): Promise<void> {
  await Promise.all(
    ASSETS.map(async (url) => {
      try {
        const res = await fetch(url);
        if (res.ok) await cache.put(url, res);
      } catch {
        // best-effort: never let a single asset abort the install
      }
    })
  );
}

self.addEventListener("install", (e: Event) => {
  const ev = e as Event & { waitUntil: (p: Promise<unknown>) => void };
  ev.waitUntil(
    caches.open(CACHE).then((c) => precacheAssets(c)).then(() => {
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
