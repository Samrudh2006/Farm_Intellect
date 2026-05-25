/**
 * Service Worker for Offline-First Farm Intellect App
 * Caches critical assets and enables offline field data access
 */

declare const self: ServiceWorkerGlobalScope;

const CACHE_NAME = "farm-intellect-v1";
const CRITICAL_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
];

const CACHE_STRATEGIES = {
  // Cache first, fallback to network
  "asset": ["woff2", "woff", "ttf", "jpg", "png", "svg", "webp"],
  // Network first, fallback to cache
  "api": ["/api/"],
  // Cache only (pre-cached resources)
  "static": ["/index.html", "/manifest.json"],
};

/**
 * Install event - pre-cache critical resources
 */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CRITICAL_ASSETS).catch((error) => {
        console.warn("[ServiceWorker] Failed to cache critical assets:", error);
        // Continue even if some assets fail
        return Promise.resolve();
      });
    })
  );
  self.skipWaiting();
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

/**
 * Fetch event - implement caching strategy
 */
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests
  if (event.request.method !== "GET") {
    return;
  }

  // Skip external origins
  if (url.origin !== self.location.origin) {
    return;
  }

  // Determine caching strategy
  if (isStaticAsset(url.pathname)) {
    // Cache-first strategy for static assets
    event.respondWith(cacheFirst(event.request));
  } else if (isAPIRequest(url.pathname)) {
    // Network-first strategy for API calls
    event.respondWith(networkFirst(event.request));
  } else {
    // Network-first for document requests
    event.respondWith(networkFirst(event.request));
  }
});

/**
 * Cache-first strategy
 */
async function cacheFirst(request: Request): Promise<Response> {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);
    
    // Cache successful responses
    if (response.ok && response.status === 200) {
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.warn("[ServiceWorker] Cache-first failed:", error);
    // Return a fallback response if needed
    return new Response("Offline - resource not available", {
      status: 503,
      statusText: "Service Unavailable",
    });
  }
}

/**
 * Network-first strategy
 */
async function networkFirst(request: Request): Promise<Response> {
  try {
    const response = await fetch(request);
    
    // Cache successful responses for offline use
    if (response.ok && response.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    // Fall back to cached version
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    
    if (cached) {
      return cached;
    }
    
    console.warn("[ServiceWorker] Network-first failed:", error);
    return new Response("Offline - resource not available", {
      status: 503,
      statusText: "Service Unavailable",
    });
  }
}

/**
 * Check if request is for a static asset
 */
function isStaticAsset(pathname: string): boolean {
  return CACHE_STRATEGIES.asset.some((ext) => pathname.endsWith(`.${ext}`));
}

/**
 * Check if request is an API call
 */
function isAPIRequest(pathname: string): boolean {
  return pathname.startsWith("/api/");
}

/**
 * Background sync for offline field data
 */
self.addEventListener("sync" as any, (event: any) => {
  if (event.tag === "sync-field-data") {
    event.waitUntil(syncFieldData());
  }
});

async function syncFieldData(): Promise<void> {
  try {
    // Get unsynced field data from IndexedDB
    const db = await openFieldDatabase();
    const unsyncedFields = await getUnsyncedFields(db);

    // Sync each unsynced field
    for (const field of unsyncedFields) {
      try {
        const response = await fetch("/api/fields", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(field),
        });

        if (response.ok) {
          // Mark as synced
          await markFieldAsSynced(db, field.id);
        }
      } catch (error) {
        console.warn("[ServiceWorker] Failed to sync field:", error);
      }
    }
  } catch (error) {
    console.warn("[ServiceWorker] Sync failed:", error);
  }
}

function openFieldDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("farm-intellect-fields", 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

async function getUnsyncedFields(db: IDBDatabase): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["fields"], "readonly");
    const store = transaction.objectStore("fields");
    const index = store.index("syncStatus");
    const request = index.getAll("pending");

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

async function markFieldAsSynced(db: IDBDatabase, fieldId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["fields"], "readwrite");
    const store = transaction.objectStore("fields");
    const getRequest = store.get(fieldId);

    getRequest.onsuccess = () => {
      const field = getRequest.result;
      if (field) {
        field.syncStatus = "synced";
        store.put(field);
      }
    };

    transaction.onerror = () => reject(transaction.error);
    transaction.oncomplete = () => resolve();
  });
}

// Push notifications for crop alerts
self.addEventListener("push", (event: PushEvent) => {
  if (!event.data) return;

  const data = event.data.json();
  
  event.waitUntil(
    self.registration.showNotification("Farm Intellect Alert", {
      body: data.message,
      icon: "/icon-192x192.png",
      tag: data.type,
      data: data,
    })
  );
});

// Notification click handler
self.addEventListener("notificationclick", (event: NotificationEvent) => {
  event.notification.close();
  
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clientList) => {
      // Focus existing window if open
      for (const client of clientList) {
        if (client.url === "/" && "focus" in client) {
          return (client as WindowClient).focus();
        }
      }
      // Open new window if not open
      if (self.clients.openWindow) {
        return self.clients.openWindow("/");
      }
    })
  );
});

console.log("[ServiceWorker] Service Worker registered successfully");
