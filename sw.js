/* Royal Ludo service worker – offline support.
 * Bump VERSION whenever you deploy new files so installed apps refresh. */
const VERSION = 'royal-ludo-v3;
const ASSETS = [
  './', './index.html', './style.css', './config.js', './engine.js', './app.js', './manifest.webmanifest',
  './icons/icon-192.png', './icons/icon-512.png', './icons/maskable-512.png',
  './icons/apple-touch-icon.png', './icons/favicon-32.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Stale-while-revalidate for same-origin GETs; falls back to cached shell offline.
self.addEventListener('fetch', e => {
  const req = e.request;
  const u = new URL(req.url);
  const isPeerLib = /^(cdn\.jsdelivr\.net|unpkg\.com)$/.test(u.hostname) && /peerjs/.test(u.pathname);
  if (req.method !== 'GET' || (u.origin !== location.origin && !isPeerLib)) return;
  e.respondWith(
    caches.open(VERSION).then(async cache => {
      const cached = await cache.match(req, { ignoreSearch: true });
      const network = fetch(req).then(res => {
        if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone());
        return res;
      }).catch(() => null);
      if (cached) { network.catch(() => {}); return cached; }
      return (await network) || (await cache.match('./index.html')) || Response.error();
    })
  );
});
