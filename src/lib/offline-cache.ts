/**
 * Lightweight IndexedDB offline cache for dashboard data.
 * Caches Supabase query results so dashboards can render while offline.
 */

const DB_NAME = "farm-intellect-offline";
const DB_VERSION = 1;
const STORE_NAME = "cache";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getCached<T>(key: string): Promise<{ data: T; timestamp: number } | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function setCache<T>(key: string, data: T): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.put({ data, timestamp: Date.now() }, key);
  } catch {
    // Silently fail — offline cache is best-effort
  }
}

/** Max age in ms (default 30 minutes) */
const DEFAULT_MAX_AGE = 30 * 60 * 1000;

/**
 * Wrap a Supabase fetch with offline cache.
 * Returns cached data if online fetch fails (offline scenario).
 */
export async function withOfflineCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  maxAge = DEFAULT_MAX_AGE
): Promise<{ data: T; fromCache: boolean }> {
  try {
    // Try online first
    const freshData = await fetcher();
    // Cache the result
    await setCache(key, freshData);
    return { data: freshData, fromCache: false };
  } catch {
    // Offline or error — try cache
    const cached = await getCached<T>(key);
    if (cached && Date.now() - cached.timestamp < maxAge) {
      return { data: cached.data, fromCache: true };
    }
    // No cache available, rethrow
    throw new Error(`Offline and no cached data for "${key}"`);
  }
}

export async function clearOfflineCache(): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).clear();
  } catch {
    // ignore
  }
}
