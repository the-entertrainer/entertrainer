/* Dialogue service worker — cache app shell + fonts + icons. Do NOT cache user comic blobs. */
const CACHE = 'dialogue-shell-v3';
const SHELL = [
  '/dialogue/',
  '/dialogue/index.html',
  '/dialogue/manifest.webmanifest',
  '/dialogue/css/dialogue.css',
  '/dialogue/js/utils.js',
  '/dialogue/js/formats.js',
  '/dialogue/js/db.js',
  '/dialogue/js/history.js',
  '/dialogue/js/export.js',
  '/dialogue/js/demo.js',
  '/dialogue/js/editor.js',
  '/dialogue/js/app.js',
  '/dialogue/icons/d-mark.svg',
  '/dialogue/icons/icon-192.png',
  '/dialogue/icons/icon-512.png',
  '/dialogue/icons/maskable-512.png',
  '/dialogue/icons/apple-touch-icon.png',
  '/dialogue/stickers/burst.svg',
  '/dialogue/stickers/heart.svg',
  '/dialogue/stickers/pow.svg',
  '/dialogue/stickers/bam.svg',
  '/dialogue/stickers/sweat.svg',
  '/dialogue/stickers/speed-lines.svg',
  '/dialogue/stickers/sparkle.svg',
  '/dialogue/stickers/exclaim.svg',
  '/dialogue/stickers/question.svg',
  '/dialogue/stickers/impact-lines.svg',
  '/dialogue/stickers/anger-vein.svg',
  '/dialogue/stickers/music-note.svg',
  '/dialogue/stickers/zzzz.svg',
  '/dialogue/stickers/cloud-puff.svg',
  '/dialogue/stickers/motion-arc.svg',
  '/dialogue/stickers/hearts-mini.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

function isUserBlob(url) {
  return url.startsWith('blob:') || url.includes('indexeddb');
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (isUserBlob(url.href)) return;

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
            return cache.match('/dialogue/index.html');
          }
          throw err;
        }
      })
    );
  }
});
