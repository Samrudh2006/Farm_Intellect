import { supabase, hasSupabaseEnv } from "@/integrations/supabase/client";
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

// Client-side mock handler for document operations
const handleMockDocuments = (path: string, init: RequestInit = {}): any => {
  const method = (init.method || "GET").toUpperCase();
  
  const getDocs = () => {
    try {
      const stored = localStorage.getItem("mock_documents");
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error("Failed to parse mock documents", e);
    }
    
    const defaults = [
      {
        id: "doc-1",
        type: "LAND_RECORDS",
        originalName: "Khasra_Khatauni_Field_A.pdf",
        size: 1420500,
        isVerified: true,
        verifiedAt: "2025-06-10T10:00:00Z",
        createdAt: "2025-06-09T08:30:00Z"
      },
      {
        id: "doc-2",
        type: "ID_PROOF",
        originalName: "Aadhaar_Card_Verified.jpg",
        size: 524288,
        isVerified: true,
        verifiedAt: "2025-05-15T14:20:00Z",
        createdAt: "2025-05-15T12:00:00Z"
      },
      {
        id: "doc-3",
        type: "OTHER",
        originalName: "Soil_Health_Report.pdf",
        size: 2048576,
        isVerified: false,
        createdAt: "2026-06-17T09:15:00Z"
      }
    ];
    localStorage.setItem("mock_documents", JSON.stringify(defaults));
    return defaults;
  };

  const saveDocs = (docs: any[]) => {
    localStorage.setItem("mock_documents", JSON.stringify(docs));
  };

  if (path === "/api/documents/my-documents" && method === "GET") {
    return { documents: getDocs() };
  }

  if (path === "/api/documents/upload" && method === "POST") {
    const formData = init.body as FormData;
    const file = formData?.get("document") as File | null;
    const type = formData?.get("type") as string | null;
    
    const newDoc = {
      id: `doc-${Date.now()}`,
      type: type || "OTHER",
      originalName: file?.name || "Uploaded_Document.pdf",
      size: file?.size || 102400,
      isVerified: false,
      createdAt: new Date().toISOString()
    };
    
    const current = getDocs();
    const updated = [newDoc, ...current];
    saveDocs(updated);
    
    return { document: newDoc };
  }

  if (path.startsWith("/api/documents/") && method === "DELETE") {
    const id = path.split("/").pop();
    if (id) {
      const current = getDocs();
      const updated = current.filter((d: any) => d.id !== id);
      saveDocs(updated);
    }
    return { success: true };
  }

  return null;
};

export const apiFetch = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
  // If we are in mock mode (no Supabase env) and calling documents, bypass network fetch
  if (!hasSupabaseEnv && path.startsWith("/api/documents")) {
    return handleMockDocuments(path, init) as T;
  }

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
    // If backend is down, fall back to mock documents locally
    if (path.startsWith("/api/documents")) {
      console.warn("Backend API down. Serving mock documents.");
      return handleMockDocuments(path, init) as T;
    }

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
