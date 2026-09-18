var CACHE_NAME = 'wird-v8-elite';
var ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(
        names.filter(function(name) {
          return name !== CACHE_NAME;
        }).map(function(name) {
          return caches.delete(name);
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    caches.match(event.request).then(function(cached) {
      if (cached) return cached;
      
      return fetch(event.request).then(function(response) {
        // Cache successful responses and opaque responses (like Google Fonts)
        if (!response || (response.status !== 200 && response.type !== 'opaque')) {
          return response;
        }
        
        var clone = response.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          // Prevent caching Chrome extension files etc.
          if(event.request.url.startsWith('http')){
            cache.put(event.request, clone);
          }
        });
        return response;
      }).catch(function() {
        // Fallback for navigation requests
        if(event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
