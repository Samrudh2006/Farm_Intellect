/**
 * Field Storage Service
 * localStorage + IndexedDB for offline-first field data persistence
 */

import { FieldPolygon, FieldPoint } from "./fieldGeometry";

const STORAGE_PREFIX = "farm-intellect:fields";
const DB_NAME = "farm-intellect-fields";
const DB_VERSION = 1;

export interface StoredField extends FieldPolygon {
  syncStatus: "synced" | "pending" | "failed";
  lastSyncTime?: Date;
}

/**
 * Initialize IndexedDB
 */
async function initializeDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains("fields")) {
        const store = db.createObjectStore("fields", { keyPath: "id" });
        store.createIndex("farmerId", "farmerId", { unique: false });
        store.createIndex("syncStatus", "syncStatus", { unique: false });
      }
    };
  });
}

/**
 * Save field to localStorage (quick access)
 */
export function saveFieldLocally(farmerId: string, field: FieldPolygon): void {
  try {
    const key = `${STORAGE_PREFIX}:${farmerId}:${field.id}`;
    localStorage.setItem(key, JSON.stringify({
      ...field,
      syncStatus: "pending",
    } as StoredField));
  } catch (error) {
    console.warn("[fieldStorage] LocalStorage save error:", error);
  }
}

/**
 * Save field to IndexedDB (offline persistence)
 */
export async function saveFieldToDB(
  farmerId: string,
  field: FieldPolygon,
  syncStatus: "synced" | "pending" = "pending"
): Promise<void> {
  try {
    const db = await initializeDB();
    const transaction = db.transaction(["fields"], "readwrite");
    const store = transaction.objectStore("fields");

    const storedField: StoredField = {
      ...field,
      farmerId,
      syncStatus,
      lastSyncTime: syncStatus === "synced" ? new Date() : undefined,
    };

    store.put(storedField);

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (error) {
    console.warn("[fieldStorage] IndexedDB save error:", error);
  }
}

/**
 * Get field from localStorage
 */
export function getFieldLocally(farmerId: string, fieldId: string): FieldPolygon | null {
  try {
    const key = `${STORAGE_PREFIX}:${farmerId}:${fieldId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.warn("[fieldStorage] LocalStorage get error:", error);
    return null;
  }
}

/**
 * Get field from IndexedDB
 */
export async function getFieldFromDB(fieldId: string): Promise<StoredField | null> {
  try {
    const db = await initializeDB();
    const transaction = db.transaction(["fields"], "readonly");
    const store = transaction.objectStore("fields");
    const request = store.get(fieldId);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.warn("[fieldStorage] IndexedDB get error:", error);
    return null;
  }
}

/**
 * Get all fields for a farmer (from localStorage - faster)
 */
export function getAllFieldsLocally(farmerId: string): FieldPolygon[] {
  try {
    const prefix = `${STORAGE_PREFIX}:${farmerId}:`;
    const fields: FieldPolygon[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(prefix)) {
        const data = localStorage.getItem(key);
        if (data) {
          fields.push(JSON.parse(data));
        }
      }
    }

    return fields;
  } catch (error) {
    console.warn("[fieldStorage] Get all fields error:", error);
    return [];
  }
}

/**
 * Get all fields for a farmer from IndexedDB
 */
export async function getAllFieldsFromDB(farmerId: string): Promise<StoredField[]> {
  try {
    const db = await initializeDB();
    const transaction = db.transaction(["fields"], "readonly");
    const store = transaction.objectStore("fields");
    const index = store.index("farmerId");
    const request = index.getAll(farmerId);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.warn("[fieldStorage] Get all fields from DB error:", error);
    return [];
  }
}

/**
 * Delete field
 */
export async function deleteField(farmerId: string, fieldId: string): Promise<void> {
  try {
    // Delete from localStorage
    const key = `${STORAGE_PREFIX}:${farmerId}:${fieldId}`;
    localStorage.removeItem(key);

    // Delete from IndexedDB
    const db = await initializeDB();
    const transaction = db.transaction(["fields"], "readwrite");
    const store = transaction.objectStore("fields");
    store.delete(fieldId);

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (error) {
    console.warn("[fieldStorage] Delete error:", error);
  }
}

/**
 * Get unsync fields (for sync on network reconnection)
 */
export async function getUnsyncedFields(): Promise<StoredField[]> {
  try {
    const db = await initializeDB();
    const transaction = db.transaction(["fields"], "readonly");
    const store = transaction.objectStore("fields");
    const index = store.index("syncStatus");
    const request = index.getAll("pending");

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.warn("[fieldStorage] Get unsynced fields error:", error);
    return [];
  }
}

/**
 * Mark field as synced
 */
export async function markFieldAsSynced(fieldId: string): Promise<void> {
  try {
    const db = await initializeDB();
    const transaction = db.transaction(["fields"], "readwrite");
    const store = transaction.objectStore("fields");
    const getRequest = store.get(fieldId);

    getRequest.onsuccess = () => {
      const field = getRequest.result as StoredField;
      if (field) {
        field.syncStatus = "synced";
        field.lastSyncTime = new Date();
        store.put(field);
      }
    };

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (error) {
    console.warn("[fieldStorage] Mark synced error:", error);
  }
}

/**
 * Export all fields as JSON backup
 */
export function exportFieldsAsJSON(farmerId: string): string {
  const fields = getAllFieldsLocally(farmerId);
  return JSON.stringify(
    {
      version: 1,
      exportDate: new Date().toISOString(),
      farmerId,
      fields,
    },
    null,
    2
  );
}

/**
 * Import fields from JSON backup
 */
export async function importFieldsFromJSON(
  farmerId: string,
  jsonString: string
): Promise<{ success: boolean; count: number; errors: string[] }> {
  const errors: string[] = [];
  let count = 0;

  try {
    const backup = JSON.parse(jsonString);

    if (!backup.fields || !Array.isArray(backup.fields)) {
      errors.push("Invalid backup format");
      return { success: false, count: 0, errors };
    }

    for (const field of backup.fields) {
      try {
        await saveFieldToDB(farmerId, field, "pending");
        saveFieldLocally(farmerId, field);
        count++;
      } catch (error) {
        errors.push(`Failed to import field ${field.name}: ${error}`);
      }
    }

    return {
      success: errors.length === 0,
      count,
      errors,
    };
  } catch (error) {
    errors.push(`JSON parse error: ${error}`);
    return { success: false, count: 0, errors };
  }
}

/**
 * Clear all fields for a farmer
 */
export async function clearAllFields(farmerId: string): Promise<void> {
  try {
    // Clear from localStorage
    const prefix = `${STORAGE_PREFIX}:${farmerId}:`;
    const keysToDelete: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(prefix)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => localStorage.removeItem(key));

    // Clear from IndexedDB
    const db = await initializeDB();
    const transaction = db.transaction(["fields"], "readwrite");
    const store = transaction.objectStore("fields");
    const index = store.index("farmerId");
    const request = index.openCursor(farmerId);

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor) {
        store.delete(cursor.primaryKey);
        cursor.continue();
      }
    };

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (error) {
    console.warn("[fieldStorage] Clear all error:", error);
  }
}

/**
 * Get storage statistics
 */
export async function getStorageStats(farmerId: string): Promise<{
  localStorageFields: number;
  indexedDBFields: number;
  totalSize: number;
}> {
  const localFields = getAllFieldsLocally(farmerId);
  const dbFields = await getAllFieldsFromDB(farmerId);

  // Rough estimate of storage size
  const localSize = JSON.stringify(localFields).length;
  const dbSize = JSON.stringify(dbFields).length;

  return {
    localStorageFields: localFields.length,
    indexedDBFields: dbFields.length,
    totalSize: localSize + dbSize,
  };
}
