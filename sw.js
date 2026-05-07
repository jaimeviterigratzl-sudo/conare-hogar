/* Service Worker — CONARE HOGAR PWA */
const CACHE = 'conare-hogar-v1';
const ASSETS = ['/', '/index.html', '/css/app.css', '/js/config.js', '/js/app.js',
  '/js/auth.js', '/js/registro.js', '/js/pago.js', '/js/retiro.js', '/js/camiones.js',
  '/js/admin.js', '/manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
