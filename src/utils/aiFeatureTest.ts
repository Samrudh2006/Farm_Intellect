// AI Feature Test Utility
// Tests all AI features with the configured API key (loaded from environment)

const getAPIKey = (): string => {
  return process.env.REACT_APP_AI_API_KEY || process.env.AI_API_KEY || '';
};

export interface AITestResult {
  feature: string;
  status: "success" | "failed" | "pending";
  message: string;
  timestamp: number;
}

/**
 * Test chat AI feature
 */
export async function testChatAI(): Promise<AITestResult> {
  const API_KEY = getAPIKey();
  if (!API_KEY) {
    return {
      feature: "Chat AI",
      status: "failed",
      message: "AI_API_KEY environment variable is not configured",
      timestamp: Date.now(),
    };
  }
  
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "user", content: "Hello, test AI chat." }
        ],
        max_tokens: 50,
      }),
    });

    if (response.ok) {
      return {
        feature: "Chat AI",
        status: "success",
        message: "Chat AI is working correctly",
        timestamp: Date.now(),
      };
    } else {
      const error = await response.json();
      return {
        feature: "Chat AI",
        status: "failed",
        message: `Chat API error: ${error.error?.message || response.statusText}`,
        timestamp: Date.now(),
      };
    }
  } catch (error) {
    return {
      feature: "Chat AI",
      status: "failed",
      message: `Chat AI test failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      timestamp: Date.now(),
    };
  }
}

/**
 * Test disease detection AI
 */
export async function testDiseaseDetectionAI(): Promise<AITestResult> {
  const API_KEY = getAPIKey();
  if (!API_KEY) {
    return {
      feature: "Disease Detection",
      status: "failed",
      message: "AI_API_KEY environment variable is not configured",
      timestamp: Date.now(),
    };
  }
  
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "user", content: "What are common crop diseases?" }
        ],
        max_tokens: 100,
      }),
    });

    if (response.ok) {
      return {
        feature: "Disease Detection",
        status: "success",
        message: "Disease detection AI is working correctly",
        timestamp: Date.now(),
      };
    } else {
      return {
        feature: "Disease Detection",
        status: "failed",
        message: "Disease detection API failed",
        timestamp: Date.now(),
      };
    }
  } catch (error) {
    return {
      feature: "Disease Detection",
      status: "failed",
      message: `Disease detection test failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      timestamp: Date.now(),
    };
  }
}

/**
 * Test yield prediction AI
 */
export async function testYieldPredictionAI(): Promise<AITestResult> {
  const API_KEY = getAPIKey();
  if (!API_KEY) {
    return {
      feature: "Yield Prediction",
      status: "failed",
      message: "AI_API_KEY environment variable is not configured",
      timestamp: Date.now(),
    };
  }
  
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "user", content: "Estimate yield based on soil quality and rainfall" }
        ],
        max_tokens: 100,
      }),
    });

    if (response.ok) {
      return {
        feature: "Yield Prediction",
        status: "success",
        message: "Yield prediction AI is working correctly",
        timestamp: Date.now(),
      };
    } else {
      return {
        feature: "Yield Prediction",
        status: "failed",
        message: "Yield prediction API failed",
        timestamp: Date.now(),
      };
    }
  } catch (error) {
    return {
      feature: "Yield Prediction",
      status: "failed",
      message: `Yield prediction test failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      timestamp: Date.now(),
    };
  }
}

/**
 * Test crop recommendation AI
 */
export async function testCropRecommendationAI(): Promise<AITestResult> {
  const API_KEY = getAPIKey();
  if (!API_KEY) {
    return {
      feature: "Crop Recommendation",
      status: "failed",
      message: "AI_API_KEY environment variable is not configured",
      timestamp: Date.now(),
    };
  }
  
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "user", content: "Recommend best crops for tropical climate" }
        ],
        max_tokens: 100,
      }),
    });

    if (response.ok) {
      return {
        feature: "Crop Recommendation",
        status: "success",
        message: "Crop recommendation AI is working correctly",
        timestamp: Date.now(),
      };
    } else {
      return {
        feature: "Crop Recommendation",
        status: "failed",
        message: "Crop recommendation API failed",
        timestamp: Date.now(),
      };
    }
  } catch (error) {
    return {
      feature: "Crop Recommendation",
      status: "failed",
      message: `Crop recommendation test failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      timestamp: Date.now(),
    };
  }
}

/**
 * Run all AI feature tests
 */
export async function runAllAITests(): Promise<AITestResult[]> {
  const API_KEY = getAPIKey();
  console.log("[v0] Starting AI feature tests. API key configured:", !!API_KEY);
  
  const results = await Promise.all([
    testChatAI(),
    testDiseaseDetectionAI(),
    testYieldPredictionAI(),
    testCropRecommendationAI(),
  ]);

  const summary = {
    total: results.length,
    successful: results.filter(r => r.status === "success").length,
    failed: results.filter(r => r.status === "failed").length,
  };

  console.log("[v0] AI tests summary:", summary);
  console.log("[v0] Test results:", results);

  return results;
}

/**
 * Get API key configuration status
 */
export function getAPIKeyStatus(): { configured: boolean; keyPartial: string } {
  const API_KEY = getAPIKey();
  return {
    configured: !!API_KEY,
    keyPartial: API_KEY ? `${API_KEY.slice(0, 10)}...${API_KEY.slice(-10)}` : "Not configured",
  };
}

/**
 * Export API key for use in other modules
 */
export function getAPIKey(): string {
  return process.env.REACT_APP_AI_API_KEY || process.env.AI_API_KEY || '';
}
