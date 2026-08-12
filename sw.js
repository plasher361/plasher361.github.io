/* Ardeşen Karate Spor Kulübü — Service Worker
   Uygulamayı önbelleğe alır, internet olmadan da açılmasını sağlar. */

const CACHE = 'ardesen-karate-v1';

const DOSYALAR = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './maskable-192.png',
  './maskable-512.png'
];

// Kurulum: dosyaları önbelleğe al
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(DOSYALAR))
      .then(() => self.skipWaiting())
  );
});

// Etkinleşme: eski sürümlerin önbelleğini temizle
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(adlar => Promise.all(
        adlar.filter(ad => ad !== CACHE).map(ad => caches.delete(ad))
      ))
      .then(() => self.clients.claim())
  );
});

// İstekler: önce ağdan dene, olmazsa önbellekten ver
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(yanit => {
        const kopya = yanit.clone();
        caches.open(CACHE).then(cache => {
          cache.put(event.request, kopya).catch(() => {});
        });
        return yanit;
      })
      .catch(() =>
        caches.match(event.request).then(
          onbellek => onbellek || caches.match('./index.html')
        )
      )
  );
});
