const CACHE_NAME = "tic-tac-toe-cache-v1"; // bump version
const urlsToCache = [
  "/TIC-TAC-TOE/",
  "/TIC-TAC-TOE/index.html",
  "/TIC-TAC-TOE/style.css",
  "/TIC-TAC-TOE/script.js",
  "/TIC-TAC-TOE/icons/icon-192.png",
  "/TIC-TAC-TOE/icons/icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("Caching files...");
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) return caches.delete(cache);
        })
      )
    )
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Update cache with latest files
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
        return response;
      })
      .catch(() =>
        caches.match(event.request)
      )
  );
});