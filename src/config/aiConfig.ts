/**
 * AI Configuration
 * Centralized configuration for all AI features
 * API Key is loaded from environment variable AI_API_KEY
 */

// Get API key from environment
const getAPIKey = (): string => {
  const key = process.env.REACT_APP_AI_API_KEY || process.env.AI_API_KEY || '';
  if (!key) {
    console.warn('[v0] AI_API_KEY environment variable is not set');
  }
  return key;
};

export const AI_CONFIG = {
  // Primary API Key - Used for all AI operations (loaded from environment)
  API_KEY: getAPIKey(),
  
  // OpenAI Configuration
  OPENAI: {
    API_KEY: getAPIKey(),
    BASE_URL: "https://api.openai.com/v1",
    MODELS: {
      CHAT: "gpt-3.5-turbo",
      TEXT: "text-davinci-003",
      EMBEDDING: "text-embedding-ada-002",
    },
  },

  // Feature Flags
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

  // API Endpoints
  ENDPOINTS: {
    CHAT: "/api/ai/chat",
    DISEASE_DETECTION: "/api/ai/disease-detection",
    YIELD_PREDICTION: "/api/ai/yield-prediction",
    CROP_RECOMMENDATION: "/api/ai/crop-recommendation",
    PRICE_FORECASTING: "/api/ai/price-forecast",
    SOIL_ANALYSIS: "/api/ai/soil-analysis",
  },

  // Timeouts and Limits
  TIMEOUTS: {
    CHAT: 30000,
    ANALYSIS: 60000,
    PREDICTION: 45000,
  },

  // Rate Limiting
  RATE_LIMITS: {
    CHAT: 100,
    ANALYSIS: 50,
    PREDICTION: 50,
  },
};

/**
 * Get API key - validates and returns the configured key
 */
export function getConfiguredAPIKey(): string {
  if (!AI_CONFIG.API_KEY) {
    throw new Error("OpenAI API key is not configured");
  }
  return AI_CONFIG.API_KEY;
}

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(feature: keyof typeof AI_CONFIG.FEATURES): boolean {
  return AI_CONFIG.FEATURES[feature];
}

/**
 * Get OpenAI model
 */
export function getOpenAIModel(modelType: keyof typeof AI_CONFIG.OPENAI.MODELS): string {
  return AI_CONFIG.OPENAI.MODELS[modelType];
}

/**
 * Validate API key format
 */
export function validateAPIKey(key: string): boolean {
  // OpenAI keys start with 'sk-'
  return key.startsWith("sk-") && key.length > 20;
}

/**
 * Get API key status for debugging
 */
export function getAPIKeyStatus() {
  const key = AI_CONFIG.API_KEY;
  return {
    isConfigured: !!key,
    isValid: validateAPIKey(key),
    partial: key ? `${key.slice(0, 10)}...${key.slice(-10)}` : "Not configured",
    features: Object.entries(AI_CONFIG.FEATURES)
      .filter(([, enabled]) => enabled)
      .map(([feature]) => feature),
  };
}

/**
 * Log AI configuration status
 */
export function logAIConfigStatus(): void {
  console.log("[v0] AI Configuration Status:", getAPIKeyStatus());
}
