// AstroType v3.0 Service Worker — Offline-First PWA Cache
const CACHE_NAME = 'astrotype-v3.0-zero-lag-cache';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './css/styles.css',
  './js/data.js',
  './js/audio.js',
  './js/game.js',
  './manifest.json',
  './favicon.svg'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(
          keys.map((k) => {
            if (k !== CACHE_NAME) return caches.delete(k);
          })
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;

  // Network-first with fast cache fallback for local assets
  e.respondWith(
    fetch(e.request)
      .then((response) => {
        if (response && response.status === 200) {
          const url = new URL(e.request.url);
          if (url.origin === self.location.origin) {
            const respClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(e.request, respClone));
          }
        }
        return response;
      })
      .catch(() => caches.match(e.request))
  );
});
