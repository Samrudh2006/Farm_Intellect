import { supabase } from "@/integrations/supabase/client";
import { buildOfflineUrl, enqueueOfflineRequest } from "@/lib/offlineSync";

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;

export const apiBaseUrl = (configuredBaseUrl || "http://localhost:3001").replace(/\/$/, "");

export class ApiError extends Error {
  status: number;
  queued?: boolean;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export const apiFetch = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
  const { data: { session } } = await supabase.auth.getSession();
  const headers = new Headers(init.headers ?? {});
  const method = (init.method || "GET").toUpperCase();
  const canQueue = method !== "GET" && !(init.body instanceof FormData);

  if (!(init.body instanceof FormData) && init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  headers.set("Accept", headers.get("Accept") || "application/json");

  if (session?.access_token) {
    headers.set("Authorization", `Bearer ${session.access_token}`);
  }

  if (typeof navigator !== "undefined" && !navigator.onLine && canQueue) {
    enqueueOfflineRequest({
      url: buildOfflineUrl(path),
      method,
      headers: Object.fromEntries(headers.entries()),
      body: typeof init.body === "string" ? init.body : init.body ? JSON.stringify(init.body) : undefined,
    });
    const error = new ApiError("Request queued for sync while offline.", 0);
    error.queued = true;
    throw error;
  }

  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      ...init,
      headers,
    });
  } catch (error) {
    if (canQueue) {
      enqueueOfflineRequest({
        url: buildOfflineUrl(path),
        method,
        headers: Object.fromEntries(headers.entries()),
        body: typeof init.body === "string" ? init.body : init.body ? JSON.stringify(init.body) : undefined,
      });
      const queuedError = new ApiError("Network error. Request queued for sync.", 0);
      queuedError.queued = true;
      throw queuedError;
    }
    throw error;
  }

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    try {
      const payload = await response.json();
      message = payload.error || payload.message || message;
    } catch {
      // keep default message
    }

    throw new ApiError(message, response.status);
  }

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json() as Promise<T>;
  }

  return undefined as T;
};
