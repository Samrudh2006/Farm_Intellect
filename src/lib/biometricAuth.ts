// Biometric authentication using WebAuthn (no external API required).
// Works with the device's platform authenticator (Touch ID, Face ID, Windows Hello,
// Android fingerprint/face). The credential is created on the device; we store a
// mapping from the credential ID to the user's Aadhaar + Passkey locally so the
// app can sign them in to Supabase on subsequent attempts.

export type BiometricKind = "fingerprint" | "face";

interface StoredBiometric {
  credentialId: string; // base64url
  kind: BiometricKind;
  aadhaar: string;
  passkey: string;
  label: string;
  createdAt: number;
}

const STORAGE_KEY = "biometric_credentials_v1";

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

const getStore = (): StoredBiometric[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
};
const setStore = (items: StoredBiometric[]) =>
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));

// ---------- public API ----------
export const isBiometricSupported = async (): Promise<boolean> => {
  if (typeof window === "undefined" || !window.PublicKeyCredential) return false;
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
};

export const listRegistered = (kind?: BiometricKind) =>
  getStore().filter((c) => (kind ? c.kind === kind : true));

export const hasRegistered = (kind?: BiometricKind) => listRegistered(kind).length > 0;

export const registerBiometric = async (
  kind: BiometricKind,
  user: { aadhaar: string; passkey: string; label: string },
): Promise<StoredBiometric> => {
  if (!(await isBiometricSupported())) {
    throw new Error("Biometric authentication is not supported on this device/browser");
  }

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
        { type: "public-key", alg: -7 },   // ES256
        { type: "public-key", alg: -257 }, // RS256
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

  // Replace any existing entry for the same kind+aadhaar
  const others = getStore().filter(
    (c) => !(c.aadhaar === user.aadhaar && c.kind === kind),
  );
  setStore([...others, stored]);
  return stored;
};

export const authenticateBiometric = async (
  kind: BiometricKind,
): Promise<{ aadhaar: string; passkey: string; label: string }> => {
  if (!(await isBiometricSupported())) {
    throw new Error("Biometric authentication is not supported on this device/browser");
  }
  const candidates = listRegistered(kind);
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

export const removeBiometric = (kind: BiometricKind, aadhaar?: string) => {
  const remaining = getStore().filter((c) =>
    aadhaar ? !(c.kind === kind && c.aadhaar === aadhaar) : c.kind !== kind,
  );
  setStore(remaining);
};
