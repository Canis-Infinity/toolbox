const CACHE = "iistw-toolbox-offline-v1";
const OFFLINE = "/offline.html";
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then(async (cache) => {
      const response = await fetch(OFFLINE, { cache: "reload" });
      if (
        !response.ok ||
        !response.headers.get("content-type")?.includes("text/html")
      )
        throw new Error("Offline page unavailable");
      await cache.put(OFFLINE, response);
      await self.skipWaiting();
    }),
  );
});
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      for (const key of await caches.keys()) {
        if (
          key !== CACHE &&
          (key.startsWith("iistw-toolbox-offline-") ||
            key.startsWith("serwist-") ||
            key.startsWith("workbox-") ||
            [
              "pages",
              "apis",
              "others",
              "static-resources",
              "next-data",
            ].includes(key))
        )
          await caches.delete(key);
      }
      await self.clients.claim();
    })(),
  );
});
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (
    event.request.method !== "GET" ||
    url.origin !== self.location.origin ||
    url.pathname.startsWith("/api/") ||
    event.request.mode !== "navigate"
  )
    return;
  event.respondWith(
    (async () => {
      let response;
      try {
        response = await fetch(event.request);
        if (![502, 503, 504].includes(response.status)) return response;
      } catch {
        /* Network failure uses the same self-contained fallback. */
      }
      const cache = await caches.open(CACHE);
      return (await cache.match(OFFLINE)) || response || Response.error();
    })(),
  );
});
