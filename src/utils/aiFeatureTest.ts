import { AI_CONFIG } from "@/config/aiConfig";

export interface AITestResult {
  feature: string;
  status: "success" | "failed" | "pending";
  message: string;
  timestamp: number;
}

const runHealthCheck = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${AI_CONFIG.API_BASE_URL}${AI_CONFIG.ENDPOINTS.HEALTH}`);
    return response.ok;
  } catch (error) {
    console.error("[v0] AI diagnostics health check failed:", error);
    return false;
  }
};

const createBackendBackedResult = async (feature: string): Promise<AITestResult> => {
  const healthy = await runHealthCheck();
  return {
    feature,
    status: healthy ? "success" : "failed",
    message: healthy
      ? "Backend AI gateway is reachable"
      : "Backend AI gateway is unavailable. Ensure backend server is running.",
    timestamp: Date.now(),
  };
};

export async function testChatAI(): Promise<AITestResult> {
  return createBackendBackedResult("Chat AI");
}

export async function testDiseaseDetectionAI(): Promise<AITestResult> {
  return createBackendBackedResult("Disease Detection");
}

export async function testYieldPredictionAI(): Promise<AITestResult> {
  return createBackendBackedResult("Yield Prediction");
}

export async function testCropRecommendationAI(): Promise<AITestResult> {
  return createBackendBackedResult("Crop Recommendation");
}

export async function runAllAITests(): Promise<AITestResult[]> {
  return Promise.all([
    testChatAI(),
    testDiseaseDetectionAI(),
    testYieldPredictionAI(),
    testCropRecommendationAI(),
  ]);
}

export function getAPIKeyStatus(): { configured: boolean; keyPartial: string } {
  return {
    configured: false,
    keyPartial: "Managed on server",
  };
}
