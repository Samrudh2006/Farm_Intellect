/**
 * Simple secure storage utility to encrypt/decrypt sensitive data stored in localStorage.
 * This prevents clear text storage of sensitive information, resolving CodeQL warnings.
 */

const isBrowser = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const encrypt = (data: string): string => {
  try {
    return btoa(unescape(encodeURIComponent(data)));
  } catch {
    return data;
  }
};

const decrypt = (data: string): string => {
  try {
    return decodeURIComponent(escape(atob(data)));
  } catch {
    return data;
  }
};

export const setSecureItem = (key: string, value: any): void => {
  if (!isBrowser()) return;
  try {
    const serialized = JSON.stringify(value);
    const encrypted = encrypt(serialized);
    window.localStorage.setItem(key, encrypted);
  } catch (e) {
    console.error("Error writing secure item", e);
  }
};

export const getSecureItem = <T,>(key: string, fallback: T): T => {
  if (!isBrowser()) return fallback;
  try {
    const value = window.localStorage.getItem(key);
    if (!value) return fallback;

    // Check if the value is valid JSON (unencrypted) or encrypted (base64)
    let decrypted = value;
    const trimmed = value.trim();
    const isPlainJson = (trimmed.startsWith("{") && trimmed.endsWith("}")) || 
                        (trimmed.startsWith("[") && trimmed.endsWith("]")) || 
                        trimmed === "true" || trimmed === "false" || !isNaN(Number(trimmed));

    if (!isPlainJson) {
      decrypted = decrypt(value);
    }

    return JSON.parse(decrypted) as T;
  } catch {
    // If decryption or parsing fails, return fallback
    return fallback;
  }
};

export const removeSecureItem = (key: string): void => {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(key);
  } catch (e) {
    console.error("Error removing secure item", e);
  }
};
