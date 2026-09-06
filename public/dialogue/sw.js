/* Dialogue service worker — cache app shell + fonts + icons. Do NOT cache user comic blobs. */
const CACHE = 'dialogue-shell-v1';
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/dialogue.css',
  './js/utils.js',
  './js/formats.js',
  './js/db.js',
  './js/history.js',
  './js/export.js',
  './js/demo.js',
  './js/editor.js',
  './js/app.js',
  './icons/d-mark.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/maskable-512.png',
  './icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

function isUserBlob(url) {
  // IndexedDB is SoT — never cache opaque comic data URLs or upload posts
  return url.startsWith('blob:') || url.includes('indexeddb');
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (isUserBlob(url.href)) return;

  // Cache-first for same-origin shell + stickers + icons
  const same = url.origin === self.location.origin;
  const isFont = url.hostname.includes('fonts.g') || url.pathname.includes('font');
  const isCdn = url.hostname.includes('unpkg.com') || url.hostname.includes('cdnjs.cloudflare.com');

  if (same || isFont || isCdn) {
    event.respondWith(
      caches.open(CACHE).then(async (cache) => {
        const hit = await cache.match(req);
        if (hit) return hit;
        try {
          const res = await fetch(req);
          if (res && res.ok && (same || isFont || isCdn)) {
            cache.put(req, res.clone());
          }
          return res;
        } catch (err) {
          if (same && req.mode === 'navigate') {
            return cache.match('./index.html');
          }
          throw err;
        }
      })
    );
  }
});
