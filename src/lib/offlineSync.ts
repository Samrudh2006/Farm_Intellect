import { apiBaseUrl } from "./api";

export interface OfflineRequest {
  id: string;
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: string;
  createdAt: string;
}

const OFFLINE_QUEUE_KEY = "offline-sync-queue";
export const OFFLINE_SYNC_EVENT = "offline-sync-updated";

const isBrowser = () => typeof window !== "undefined";

const readQueue = (): OfflineRequest[] => {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(OFFLINE_QUEUE_KEY);
    return raw ? (JSON.parse(raw) as OfflineRequest[]) : [];
  } catch {
    return [];
  }
};

const writeQueue = (queue: OfflineRequest[]) => {
  if (!isBrowser()) return;
  window.localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  window.dispatchEvent(new Event(OFFLINE_SYNC_EVENT));
};

export const getQueuedCount = () => readQueue().length;

export const enqueueOfflineRequest = (request: Omit<OfflineRequest, "id" | "createdAt">) => {
  const queue = readQueue();
  const entry: OfflineRequest = {
    ...request,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  writeQueue([entry, ...queue]);
  return entry;
};

export const flushOfflineQueue = async () => {
  const queue = readQueue();
  if (queue.length === 0) return;

  const remaining: OfflineRequest[] = [];
  for (const request of queue.reverse()) {
    try {
      const response = await fetch(request.url, {
        method: request.method,
        headers: request.headers,
        body: request.body,
      });
      if (!response.ok) {
        remaining.unshift(request);
      }
    } catch {
      remaining.unshift(request);
    }
  }

  writeQueue(remaining);
};

export const startOfflineSync = () => {
  if (!isBrowser()) return;

  window.addEventListener("online", () => {
    flushOfflineQueue();
  });

  setInterval(() => {
    if (navigator.onLine) {
      flushOfflineQueue();
    }
  }, 60_000);
};

export const buildOfflineUrl = (path: string) => `${apiBaseUrl}${path}`;
