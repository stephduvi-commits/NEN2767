// Service worker minimal : force une requête réseau fraîche à chaque
// navigation au lieu de laisser Chrome servir une copie potentiellement
// périmée de l'app installée (comportement observé sur Android : l'icône
// installée pouvait rester bloquée sur une ancienne version pendant des
// jours sans que le vidage du cache Chrome n'y change rien).
const CACHE_NAME = 'nen2767-mobile-2026-07-09b';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request, { cache: 'no-store' })
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
