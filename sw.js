// Service Worker NEN 2767 AMAYFA
const CACHE_NAME = 'nen2767-v2';
const CACHE_URLS = [
  '/NEN2767/mobile/',
  '/NEN2767/mobile/index.html',
  '/NEN2767/manifest.json',
];

// Installation - mettre en cache les ressources statiques
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CACHE_URLS))
  );
  self.skipWaiting();
});

// Activation - nettoyer les anciens caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch - stratégie Cache First pour les ressources statiques
// Network First pour les données Supabase
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Données Supabase → Network First avec fallback cache
  if (url.hostname.includes('supabase.co')) {
    event.respondWith(
      fetch(event.request.clone())
        .then(response => {
          // Mettre en cache les réponses GET de Supabase
          if (event.request.method === 'GET' && response.ok) {
            const cacheCopy = response.clone();
            caches.open(CACHE_NAME + '-data').then(cache => {
              cache.put(event.request, cacheCopy);
            });
          }
          return response;
        })
        .catch(() => {
          // Hors ligne → retourner depuis le cache
          return caches.match(event.request);
        })
    );
    return;
  }

  // Ressources statiques → Cache First
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).then(response => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        }
        return response;
      });
    })
  );
});
