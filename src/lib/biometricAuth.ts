// Biometric authentication using WebAuthn (no external API required).
// Works with the device's platform authenticator (Touch ID, Face ID, Windows Hello,
// Android fingerprint/face). The credential is created on the device; credential
// mappings are encrypted at rest before being persisted in localStorage.

export type BiometricKind = "fingerprint" | "face";

interface StoredBiometric {
  credentialId: string; // base64url
  kind: BiometricKind;
  aadhaar: string;
  passkey: string;
  label: string;
  createdAt: number;
}

interface EncryptedEnvelope {
  keyId: string;
  iv: string; // base64url
  ciphertext: string; // base64url
  encryptedAt: number;
}

interface StoredEncryptedBiometric {
  credentialId: string;
  kind: BiometricKind;
  label: string;
  createdAt: number;
  secure: EncryptedEnvelope;
}

interface KeyRecord {
  id: string;
  key: CryptoKey;
  createdAt: number;
}

const STORAGE_KEY = "biometric_credentials_v2";
const LEGACY_STORAGE_KEY = "biometric_credentials_v1";
const KEY_DB_NAME = "biometric_cred_keys";
const KEY_STORE_NAME = "keys";
const KEY_ROTATION_DAYS = 30;

const isBrowser = () => typeof window !== "undefined";

// ---------- helpers ----------
const b64urlEncode = (buf: ArrayBuffer) => {
  const bytes = new Uint8Array(buf);
  let str = "";
  for (let i = 0; i < bytes.byteLength; i++) str += String.fromCharCode(bytes[i]);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};
const b64urlDecode = (str: string): ArrayBuffer => {
  const pad = str.length % 4 ? "=".repeat(4 - (str.length % 4)) : "";
  const b64 = (str + pad).replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes.buffer;
};

const randomChallenge = () => {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return arr;
};

const openKeyDb = async (): Promise<IDBDatabase> =>
  await new Promise((resolve, reject) => {
    const req = indexedDB.open(KEY_DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(KEY_STORE_NAME)) {
        db.createObjectStore(KEY_STORE_NAME, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error("Failed to open key database"));
  });

const readAllKeys = async (): Promise<KeyRecord[]> => {
  const db = await openKeyDb();
  return await new Promise((resolve, reject) => {
    const tx = db.transaction(KEY_STORE_NAME, "readonly");
    const store = tx.objectStore(KEY_STORE_NAME);
    const req = store.getAll();
    req.onsuccess = () => resolve((req.result || []) as KeyRecord[]);
    req.onerror = () => reject(req.error || new Error("Failed reading keys"));
  });
};

const saveKey = async (keyRecord: KeyRecord) => {
  const db = await openKeyDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(KEY_STORE_NAME, "readwrite");
    tx.objectStore(KEY_STORE_NAME).put(keyRecord);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error || new Error("Failed storing key"));
  });
};

const generateKeyRecord = async (): Promise<KeyRecord> => ({
  id: crypto.randomUUID(),
  key: await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]),
  createdAt: Date.now(),
});

const getActiveKey = async (): Promise<{ active: KeyRecord; all: KeyRecord[] }> => {
  const all = await readAllKeys();
  const newest = [...all].sort((a, b) => b.createdAt - a.createdAt)[0];
  const rotateAfter = KEY_ROTATION_DAYS * 24 * 60 * 60 * 1000;

  if (!newest || Date.now() - newest.createdAt > rotateAfter) {
    const generated = await generateKeyRecord();
    await saveKey(generated);
    return { active: generated, all: [...all, generated] };
  }

  return { active: newest, all };
};

const getEncryptedStore = (): StoredEncryptedBiometric[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
};

const setEncryptedStore = (items: StoredEncryptedBiometric[]) =>
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));

const decryptPayload = async (secure: EncryptedEnvelope, keys: KeyRecord[]): Promise<{ aadhaar: string; passkey: string }> => {
  const keyRecord = keys.find((k) => k.id === secure.keyId);
  if (!keyRecord) throw new Error("Missing encryption key. Please register biometric again.");

  const plaintextBuf = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: new Uint8Array(b64urlDecode(secure.iv)) },
    keyRecord.key,
    b64urlDecode(secure.ciphertext),
  );

  return JSON.parse(new TextDecoder().decode(plaintextBuf));
};

const encryptPayload = async (
  payload: { aadhaar: string; passkey: string },
  keyRecord: KeyRecord,
): Promise<EncryptedEnvelope> => {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const bytes = new TextEncoder().encode(JSON.stringify(payload));
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, keyRecord.key, bytes);
  return {
    keyId: keyRecord.id,
    iv: b64urlEncode(iv.buffer),
    ciphertext: b64urlEncode(encrypted),
    encryptedAt: Date.now(),
  };
};

const getStore = async (): Promise<StoredBiometric[]> => {
  if (!isBrowser()) return [];
  const { active, all } = await getActiveKey();
  const encryptedItems = getEncryptedStore();
  const decrypted = await Promise.all(
    encryptedItems.map(async (item) => {
      const payload = await decryptPayload(item.secure, all);
      return {
        credentialId: item.credentialId,
        kind: item.kind,
        label: item.label,
        createdAt: item.createdAt,
        ...payload,
      };
    }),
  );

  const needsRotation = encryptedItems.some((item) => item.secure.keyId !== active.id);
  if (needsRotation) {
    await setStore(decrypted);
  }

  return decrypted;
};

const setStore = async (items: StoredBiometric[]) => {
  const { active } = await getActiveKey();
  const encryptedItems = await Promise.all(
    items.map(async (item) => ({
      credentialId: item.credentialId,
      kind: item.kind,
      label: item.label,
      createdAt: item.createdAt,
      secure: await encryptPayload({ aadhaar: item.aadhaar, passkey: item.passkey }, active),
    })),
  );
  setEncryptedStore(encryptedItems);
};

const migrateLegacyPlaintext = async () => {
  const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
  if (!raw || localStorage.getItem(STORAGE_KEY)) return;

  try {
    const legacy = JSON.parse(raw) as StoredBiometric[];
    if (Array.isArray(legacy) && legacy.length > 0) {
      await setStore(legacy);
    }
  } catch {
    // ignore legacy parse failures
  }

  localStorage.removeItem(LEGACY_STORAGE_KEY);
};

// ---------- public API ----------
export const isBiometricSupported = async (): Promise<boolean> => {
  if (typeof window === "undefined" || !window.PublicKeyCredential || !window.indexedDB || !window.crypto?.subtle) return false;
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
};

export const listRegistered = async (kind?: BiometricKind) => {
  await migrateLegacyPlaintext();
  return (await getStore()).filter((c) => (kind ? c.kind === kind : true));
};

export const hasRegistered = async (kind?: BiometricKind) => (await listRegistered(kind)).length > 0;

export const registerBiometric = async (
  kind: BiometricKind,
  user: { aadhaar: string; passkey: string; label: string },
): Promise<StoredBiometric> => {
  if (!(await isBiometricSupported())) {
    throw new Error("Biometric authentication is not supported on this device/browser");
  }
  await migrateLegacyPlaintext();
  const userIdBytes = new TextEncoder().encode(user.aadhaar.padEnd(16, "0").slice(0, 16));

  const cred = (await navigator.credentials.create({
    publicKey: {
      challenge: randomChallenge(),
      rp: { name: "Smart Crop Advisory" },
      user: {
        id: userIdBytes,
        name: user.label || user.aadhaar,
        displayName: user.label || user.aadhaar,
      },
      pubKeyCredParams: [
        { type: "public-key", alg: -7 },
        { type: "public-key", alg: -257 },
      ],
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        userVerification: "required",
        residentKey: "preferred",
      },
      timeout: 60000,
      attestation: "none",
    },
  })) as PublicKeyCredential | null;

  if (!cred) throw new Error("Registration cancelled");

  const stored: StoredBiometric = {
    credentialId: b64urlEncode(cred.rawId),
    kind,
    aadhaar: user.aadhaar,
    passkey: user.passkey,
    label: user.label,
    createdAt: Date.now(),
  };

  const others = (await getStore()).filter((c) => !(c.aadhaar === user.aadhaar && c.kind === kind));
  await setStore([...others, stored]);
  return stored;
};

export const authenticateBiometric = async (
  kind: BiometricKind,
): Promise<{ aadhaar: string; passkey: string; label: string }> => {
  if (!(await isBiometricSupported())) {
    throw new Error("Biometric authentication is not supported on this device/browser");
  }
  const candidates = await listRegistered(kind);
  if (candidates.length === 0) {
    throw new Error(
      `No ${kind === "face" ? "Face ID" : "fingerprint"} registered on this device. Sign in once with Aadhaar + Passkey, then register from Login.`,
    );
  }

  const assertion = (await navigator.credentials.get({
    publicKey: {
      challenge: randomChallenge(),
      timeout: 60000,
      userVerification: "required",
      allowCredentials: candidates.map((c) => ({
        type: "public-key",
        id: b64urlDecode(c.credentialId),
        transports: ["internal"],
      })),
    },
  })) as PublicKeyCredential | null;

  if (!assertion) throw new Error("Authentication cancelled");

  const usedId = b64urlEncode(assertion.rawId);
  const match = candidates.find((c) => c.credentialId === usedId);
  if (!match) throw new Error("Unknown credential. Please register again.");

  return { aadhaar: match.aadhaar, passkey: match.passkey, label: match.label };
};

export const removeBiometric = async (kind: BiometricKind, aadhaar?: string) => {
  const remaining = (await getStore()).filter((c) =>
    aadhaar ? !(c.kind === kind && c.aadhaar === aadhaar) : c.kind !== kind,
  );
  await setStore(remaining);
};
