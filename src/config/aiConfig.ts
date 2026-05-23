/**
 * AI Configuration
 * Frontend never stores provider secrets; all sensitive AI calls are handled by backend APIs.
 */

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;
const defaultApiBaseUrl = "http://localhost:3001";

export const AI_CONFIG = {
  API_BASE_URL: (configuredBaseUrl || defaultApiBaseUrl).replace(/\/$/, ""),
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

export function isFeatureEnabled(feature: keyof typeof AI_CONFIG.FEATURES): boolean {
  return AI_CONFIG.FEATURES[feature];
}

export function getAPIKeyStatus() {
  return {
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
