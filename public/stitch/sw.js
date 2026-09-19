// Bump VERSION whenever any shell, engine or dependency changes.
const VERSION = 'stitch-v1';
const ASSETS = ['./', './index.html', './style.css', './app.js', './core.js', './worker.js', './vendor/pdf-lib.min.js', './manifest.webmanifest', './icon.svg', './icon-192.png', './icon-512.png', '/fonts/webfonts/archivo-var-latin.woff2', '/fonts/webfonts/fraunces-var-latin.woff2', '/fonts/webfonts/ibm-plex-mono-400-latin.woff2'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(VERSION).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('stitch-') && key !== VERSION).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;
  // Navigation outside Stitch belongs to the main site's worker, not this one.
  if (event.request.mode === 'navigate') {
    if (!url.pathname.startsWith('/stitch/')) return;
    event.respondWith(caches.open(VERSION).then(cache => cache.match('./index.html')).then(response => response || fetch(event.request)));
    return;
  }
  event.respondWith(caches.open(VERSION).then(async cache => (await cache.match(event.request, {ignoreSearch:true})) || fetch(event.request)));
});
