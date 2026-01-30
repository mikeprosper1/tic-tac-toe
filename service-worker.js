// ============================
// Tic Tac Toe Service Worker
// ============================

const CACHE_NAME = "tic-tac-toe-v2"; // increment version on changes
const FILES_TO_CACHE = [
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.json"
];

// Install: cache all required files
self.addEventListener("install", (event) => {
  console.log("[Service Worker] Installing...");
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log("[Service Worker] Caching app files");
        return cache.addAll(FILES_TO_CACHE);
      })
  );
  self.skipWaiting();
});

// Activate: remove old caches
self.addEventListener("activate", (event) => {
  console.log("[Service Worker] Activating...");
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("[Service Worker] Removing old cache:", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch: respond with cached file or network fallback
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Serve from cache if available
        if (response) return response;
        // Else fetch from network
        return fetch(event.request)
          .catch(() => {
            // If fetch fails (offline), fallback to index.html
            if (event.request.mode === "navigate") {
              return caches.match("./index.html");
            }
          });
      })
  );
});