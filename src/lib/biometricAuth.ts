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
  let newest = all[0];
  for (let i = 1; i < all.length; i++) {
    if (all[i].createdAt > newest.createdAt) {
      newest = all[i];
    }
  }
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

// ---------- platform detection ----------
export type DevicePlatform = "ios" | "android" | "windows" | "mac" | "other";

export const detectPlatform = (): DevicePlatform => {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return "ios";
  if (/android/.test(ua)) return "android";
  if (/windows/.test(ua)) return "windows";
  if (/mac/.test(ua)) return "mac";
  return "other";
};

/** Human-readable label for what biometric will be used on this device */
export const getBiometricLabel = (kind: BiometricKind): string => {
  const platform = detectPlatform();
  if (kind === "face") {
    if (platform === "ios") return "Face ID";
    if (platform === "android") return "Face Unlock";
    if (platform === "windows") return "Windows Hello Face";
    if (platform === "mac") return "Face ID";
    return "Face Login";
  }
  // fingerprint
  if (platform === "ios") return "Touch ID";
  if (platform === "android") return "Fingerprint";
  if (platform === "windows") return "Windows Hello Fingerprint";
  if (platform === "mac") return "Touch ID";
  return "Fingerprint";
};

/** Setup instructions shown when biometric fails — device-specific */
export const getBiometricSetupGuide = (): string => {
  const platform = detectPlatform();
  if (platform === "ios")
    return "On iPhone/iPad: go to Settings → Face ID & Passcode (or Touch ID & Passcode) and make sure it's set up.";
  if (platform === "android")
    return "On Android: go to Settings → Biometrics and security → Fingerprint or Face recognition and enroll your biometric.";
  if (platform === "windows")
    return "On Windows: go to Settings → Accounts → Sign-in options and set up a Windows Hello PIN first, then optionally add Fingerprint or Face.";
  if (platform === "mac")
    return "On Mac: go to System Settings → Touch ID & Password and add a fingerprint.";
  return "Make sure your device has a fingerprint sensor or face recognition set up in your device settings.";
};

/** Whether we're on a secure origin (localhost or https) — WebAuthn requires this */
export const isSecureOrigin = (): boolean => {
  if (typeof window === "undefined") return false;
  return window.location.protocol === "https:" || window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
};

// ---------- public API ----------
export const isBiometricSupported = async (): Promise<boolean> => {
  if (typeof window === "undefined") return false;
  if (!window.PublicKeyCredential || !window.indexedDB || !window.crypto?.subtle) return false;
  // WebAuthn requires HTTPS or localhost
  if (!isSecureOrigin()) return false;
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
};

/** Returns a human-readable explanation for common WebAuthn DOMException errors */
const explainWebAuthnError = (err: unknown, action: "register" | "authenticate"): string => {
  if (!(err instanceof Error)) return "An unexpected error occurred. Please try again.";
  const msg = err.message?.toLowerCase() ?? "";
  const name = (err as DOMException).name ?? "";
  const platform = detectPlatform();

  // User dismissed the prompt
  if (name === "NotAllowedError" || msg.includes("not allowed"))
    return action === "register"
      ? "Registration was cancelled. Please try again and complete the biometric prompt on your device."
      : "Login was cancelled. Please try again and use your biometric when prompted.";

  // Already registered on this device
  if (name === "InvalidStateError" || msg.includes("already registered"))
    return "This biometric is already registered on this device. Go to Settings → Security to remove it and re-register.";

  // Not supported
  if (name === "NotSupportedError" || msg.includes("not supported"))
    return `Your browser does not support biometric login. Try Chrome or Safari on a phone/tablet, or Chrome/Edge on a PC. ${getBiometricSetupGuide()}`;

  // HTTPS error
  if (name === "SecurityError" || msg.includes("security"))
    return "Biometric login requires a secure connection (HTTPS). This works on localhost during development, or on your live HTTPS site.";

  // Windows credential manager error
  if (msg.includes("credential manager") || msg.includes("unknown error")) {
    if (platform === "windows")
      return "Windows could not access biometrics. Please set up Windows Hello: Settings → Accounts → Sign-in options → add a PIN first, then try again.";
    if (platform === "android")
      return "Android could not access your biometric. Please make sure a fingerprint or face is enrolled: Settings → Biometrics and security.";
    if (platform === "ios")
      return "Could not access Face ID / Touch ID. Please check Settings → Face ID & Passcode (or Touch ID & Passcode).";
    return `Biometric access failed. ${getBiometricSetupGuide()}`;
  }

  // Timeout
  if (name === "TimeoutError" || msg.includes("timeout"))
    return "Biometric prompt timed out. Please try again and respond to the prompt quickly.";

  // Abort
  if (name === "AbortError" || msg.includes("abort"))
    return "Biometric operation was aborted. Please try again.";

  return err.message || "An unknown error occurred. Please try again.";
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
  if (!isSecureOrigin()) {
    throw new Error(
      "Biometric login requires HTTPS. During development use localhost. On mobile, make sure you are accessing the app via https://, not http:// or a plain IP address.",
    );
  }
  if (!(await isBiometricSupported())) {
    throw new Error(
      `Biometric login is not available on this device or browser. ${getBiometricSetupGuide()} Also make sure you are using Chrome, Edge, or Safari.`,
    );
  }
  await migrateLegacyPlaintext();

  // Random 16-byte user handle — WebAuthn spec requires ArrayBuffer
  const userIdBytes = crypto.getRandomValues(new Uint8Array(16));
  const rpId = window.location.hostname;

  const makeCredentialOptions = (withAttachment: boolean): CredentialCreationOptions => ({
    publicKey: {
      challenge: randomChallenge(),
      rp: { name: "Farm Intellect", id: rpId },
      user: {
        id: userIdBytes,
        name: user.label || user.aadhaar,
        displayName: user.label || user.aadhaar,
      },
      pubKeyCredParams: [
        { type: "public-key", alg: -7 },   // ES256  — Android, iOS, Mac
        { type: "public-key", alg: -257 },  // RS256  — Windows Hello
        { type: "public-key", alg: -37 },   // PS256  — some Android TPMs
      ],
      authenticatorSelection: {
        // "platform" = device's built-in sensor (fingerprint/face/Hello)
        // only set if withAttachment=true; some older Android WebViews reject this field
        ...(withAttachment ? { authenticatorAttachment: "platform" as AuthenticatorAttachment } : {}),
        // "preferred" = use biometric if available, fall back to PIN/password
        // "required" causes the "unknown error" on Windows when Hello isn't enrolled
        userVerification: "preferred",
        residentKey: "preferred",
      },
      timeout: 90000,   // 90 s — gives users on mobile enough time
      attestation: "none",
    },
  });

  let cred: PublicKeyCredential | null = null;

  // First attempt: with platform attachment (preferred — uses device sensor)
  try {
    cred = (await navigator.credentials.create(makeCredentialOptions(true))) as PublicKeyCredential | null;
  } catch (firstErr) {
    const firstName = (firstErr as DOMException).name;
    // NotAllowedError = user cancelled — don't retry, just report
    if (firstName === "NotAllowedError") {
      throw new Error(explainWebAuthnError(firstErr, "register"));
    }
    // For any other error (NotSupportedError, InvalidStateError on some Android/iOS)
    // try again WITHOUT authenticatorAttachment — broader compatibility
    try {
      cred = (await navigator.credentials.create(makeCredentialOptions(false))) as PublicKeyCredential | null;
    } catch (secondErr) {
      throw new Error(explainWebAuthnError(secondErr, "register"));
    }
  }

  if (!cred) throw new Error("Registration was cancelled. Please try again.");

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
  if (!isSecureOrigin()) {
    throw new Error(
      "Biometric login requires a secure connection. Make sure you are on https:// or localhost.",
    );
  }
  if (!(await isBiometricSupported())) {
    throw new Error(`Biometric login is not supported on this device. ${getBiometricSetupGuide()}`);
  }
  const candidates = await listRegistered(kind);
  if (candidates.length === 0) {
    throw new Error(
      `No ${getBiometricLabel(kind)} registered on this device. Sign in with Aadhaar + Passkey first, then go to Settings → Security to register your biometric.`,
    );
  }

  const rpId = window.location.hostname;

  let assertion: PublicKeyCredential | null = null;
  try {
    assertion = (await navigator.credentials.get({
      publicKey: {
        challenge: randomChallenge(),
        timeout: 90000,
        rpId,
        userVerification: "preferred",
        allowCredentials: candidates.map((c) => ({
          type: "public-key",
          id: b64urlDecode(c.credentialId),
          transports: ["internal", "hybrid"] as AuthenticatorTransport[],
        })),
      },
    })) as PublicKeyCredential | null;
  } catch (err) {
    throw new Error(explainWebAuthnError(err, "authenticate"));
  }

  if (!assertion) throw new Error("Authentication was cancelled. Please try again.");

  const usedId = b64urlEncode(assertion.rawId);
  const match = candidates.find((c) => c.credentialId === usedId);
  if (!match)
    throw new Error(
      "The biometric credential was not recognised. This can happen if you re-enrolled your fingerprint/face on the device. Please register again from Settings → Security.",
    );

  return { aadhaar: match.aadhaar, passkey: match.passkey, label: match.label };
};

export const removeBiometric = async (kind: BiometricKind, aadhaar?: string) => {
  const remaining = (await getStore()).filter((c) =>
    aadhaar ? !(c.kind === kind && c.aadhaar === aadhaar) : c.kind !== kind,
  );
  await setStore(remaining);
};

