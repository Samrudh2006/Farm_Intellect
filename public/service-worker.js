// Service Worker for Farm Intellect
// Implements caching strategy: network-first for API, cache-first for assets
// Auto-updates on app version change

const CACHE_NAME = 'farm-intellect-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
];

// Install event - cache critical assets
self.addEventListener('install', (event) => {
  console.log('[SW] Install event - caching critical assets');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).then(() => {
        self.skipWaiting(); // Activate new SW immediately
      });
    }).catch((error) => {
      console.error('[SW] Cache installation failed:', error);
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate event - cleaning old caches');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => {
      // Claim all clients immediately
      return self.clients.claim();
    })
  );
});

// Fetch event - implement caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip API calls - always hit network (network-first with cache fallback)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful API responses for offline fallback
          if (response.ok) {
            const clonedResponse = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, clonedResponse);
            });
          }
          return response;
        })
        .catch((error) => {
          console.warn('[SW] API fetch failed, attempting cache:', request.url);
          // Return cached response if available
          return caches.match(request).catch(() => {
            // Return offline page as last resort
            return caches.match('/offline.html');
          });
        })
    );
    return;
  }

  // Static assets - cache-first strategy
  if (
    url.pathname.match(/\.(js|css|woff2?|ttf|eot|svg|png|jpg|jpeg|gif|ico)$/i)
  ) {
    event.respondWith(
      caches.match(request).then((response) => {
        if (response) {
          return response;
        }
        
        return fetch(request).then((response) => {
          // Don't cache non-2xx responses
          if (!response || response.status !== 200) {
            return response;
          }

          const clonedResponse = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, clonedResponse);
          });

          return response;
        }).catch((error) => {
          console.warn('[SW] Asset fetch failed:', request.url);
          // Return a generic offline asset if available
          if (url.pathname.endsWith('.png')) {
            return new Response(
              new Blob([''], { type: 'image/png' }),
              { headers: { 'Content-Type': 'image/png' } }
            );
          }
          return null;
        });
      })
    );
    return;
  }

  // HTML pages - network-first with cache fallback (stale-while-revalidate)
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const clonedResponse = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, clonedResponse);
          });
        }
        return response;
      })
      .catch((error) => {
        console.warn('[SW] HTML fetch failed, using cache:', request.url);
        return caches
          .match(request)
          .then((response) => {
            return response || caches.match('/offline.html');
          })
          .catch(() => {
            return caches.match('/offline.html');
          });
      })
  );
});

// Handle messages from clients (e.g., app version updates)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
