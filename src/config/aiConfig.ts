/**
 * AI Configuration
 * Frontend never stores provider secrets; all sensitive AI calls are handled by backend APIs.
 */

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;

// Determine API base URL based on environment
const getApiBaseUrl = (): string => {
  // If explicitly configured via env var, use that (e.g., external backend URL)
  if (configuredBaseUrl) {
    return configuredBaseUrl.replace(/\/$/, "");
  }
  
  // In development, use localhost:3001 (local Express backend)
  if (import.meta.env.DEV) {
    return "http://localhost:3001";
  }
  
  // In production (Vercel), use /api (backend runs on same Vercel project)
  return "/api";
};

export const AI_CONFIG = {
  API_BASE_URL: getApiBaseUrl(),
  FEATURES: {
    CHAT_AI: true,
    DISEASE_DETECTION: true,
    YIELD_PREDICTION: true,
    CROP_RECOMMENDATION: true,
    PRICE_FORECASTING: true,
    SOIL_ANALYSIS: true,
    WEATHER_PREDICTION: true,
    PEST_DETECTION: true,
  },
  ENDPOINTS: {
    HEALTH: "/health",
    CHAT: "/api/chat",
    AI: "/api/ai",
    VOICE: "/api/voice",
  },
  TIMEOUTS: {
    CHAT: 30000,
    ANALYSIS: 60000,
    PREDICTION: 45000,
  },
  RATE_LIMITS: {
    CHAT: 100,
    ANALYSIS: 50,
    PREDICTION: 50,
  },
};

if (import.meta.env.PROD && AI_CONFIG.API_BASE_URL.startsWith("http://") && !AI_CONFIG.API_BASE_URL.startsWith("http://localhost")) {
  console.warn("[v0] Set VITE_API_BASE_URL to an https:// URL in production.");
}

export function isFeatureEnabled(feature: keyof typeof AI_CONFIG.FEATURES): boolean {
  return AI_CONFIG.FEATURES[feature];
}

export function getAPIKeyStatus() {
  return {
    // Browser does not manage provider keys by design; keys are backend-only.
    isConfigured: false,
    isValid: false,
    partial: "Managed on server",
    features: Object.entries(AI_CONFIG.FEATURES)
      .filter(([, enabled]) => enabled)
      .map(([feature]) => feature),
  };
}

export function logAIConfigStatus(): void {
  console.log("[v0] AI Configuration Status:", getAPIKeyStatus());
}
