// RideNow Service Worker — PWA offline support
const CACHE_NAME = 'ridenow-v5';
const STATIC_ASSETS = [
  '/',
  '/css/styles.css',
  '/js/i18n.js',
  '/js/accessibility.js',
  '/js/auth.js',
  '/js/reservations.js',
  '/js/checkin.js',
  '/js/ai.js',
  '/js/admin.js',
  '/js/app.js',
  '/img/icon-512.png',
  '/manifest.json'
];

// Install: cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: network-first for API calls, cache-first for static
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Always go to network for API and socket.io
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/socket.io/')) {
    event.respondWith(fetch(event.request).catch(() => new Response('{"error":"Sin conexión"}', {
      headers: { 'Content-Type': 'application/json' }
    })));
    return;
  }

  // Cache-first for static assets
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).then(response => {
        // Cache new responses
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      });
    }).catch(() => caches.match('/'))
  );
});
