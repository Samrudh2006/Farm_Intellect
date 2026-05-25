/**
 * Soil Data Service
 * Abstracts multiple soil data sources with fallback chain:
 * 1. Government Soil Health Card Portal
 * 2. Farmer manual input (localStorage)
 * 3. Mock/default data for development
 */

import {
  SoilHealthCard,
  SoilParameters,
  GovernmentSoilAPIResponse,
  SoilDataSource,
  SoilHealthScore,
  CropSoilRequirement,
  SoilAmendment,
} from "@/types/soil";

const SOIL_HEALTH_CARD_ENDPOINT =
  process.env.VITE_SOIL_HEALTH_API || "https://api.soil.gov.in/health-card";
const SOIL_CACHE_KEY = "farm-intellect:soil-data";
const SOIL_CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

// Crop soil requirements database
const CROP_SOIL_REQUIREMENTS: Record<string, CropSoilRequirement> = {
  rice: {
    crop: "Rice",
    nitrogenMin: 40,
    nitrogenMax: 80,
    phosphorusMin: 20,
    phosphorusMax: 40,
    potassiumMin: 20,
    potassiumMax: 40,
    phMin: 5.5,
    phMax: 7.5,
    organicMatterMin: 2,
    texturePreference: ["loam", "clay", "mixed"],
    drainageNeeds: "poor",
  },
  wheat: {
    crop: "Wheat",
    nitrogenMin: 40,
    nitrogenMax: 80,
    phosphorusMin: 20,
    phosphorusMax: 30,
    potassiumMin: 20,
    potassiumMax: 30,
    phMin: 6.0,
    phMax: 7.5,
    organicMatterMin: 2,
    texturePreference: ["loam", "clay"],
    drainageNeeds: "good",
  },
  cotton: {
    crop: "Cotton",
    nitrogenMin: 60,
    nitrogenMax: 100,
    phosphorusMin: 30,
    phosphorusMax: 50,
    potassiumMin: 40,
    potassiumMax: 60,
    phMin: 6.0,
    phMax: 7.5,
    organicMatterMin: 1.5,
    texturePreference: ["loam", "clay"],
    drainageNeeds: "good",
  },
  sugarcane: {
    crop: "Sugarcane",
    nitrogenMin: 150,
    nitrogenMax: 250,
    phosphorusMin: 60,
    phosphorusMax: 100,
    potassiumMin: 40,
    potassiumMax: 60,
    phMin: 5.5,
    phMax: 8.0,
    organicMatterMin: 2.5,
    texturePreference: ["loam", "clay"],
    drainageNeeds: "moderate",
  },
  maize: {
    crop: "Maize",
    nitrogenMin: 60,
    nitrogenMax: 120,
    phosphorusMin: 25,
    phosphorusMax: 50,
    potassiumMin: 30,
    potassiumMax: 50,
    phMin: 6.0,
    phMax: 7.5,
    organicMatterMin: 1.5,
    texturePreference: ["loam", "sandy"],
    drainageNeeds: "good",
  },
};

/**
 * Fetch soil health card from government portal (with fallback)
 */
export async function fetchGovernmentSoilData(
  farmerId: string,
  district: string
): Promise<SoilHealthCard | null> {
  try {
    const response = await fetch(`${SOIL_HEALTH_CARD_ENDPOINT}/${farmerId}`, {
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": process.env.VITE_SOIL_API_KEY || "",
      },
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    if (!response.ok) {
      console.warn("[soilData] Government API failed:", response.status);
      return null;
    }

    const data: GovernmentSoilAPIResponse = await response.json();
    if (data.status === "success" && data.data) {
      // Cache the result
      cacheSOilData(farmerId, data.data);
      return data.data;
    }
    return null;
  } catch (error) {
    console.warn("[soilData] Government API error:", error);
    return null;
  }
}

/**
 * Get farmer-input soil data from localStorage
 */
export function getFarmerInputSoilData(
  farmerId: string
): SoilHealthCard | null {
  try {
    const cached = localStorage.getItem(`${SOIL_CACHE_KEY}:${farmerId}`);
    if (!cached) return null;

    const data = JSON.parse(cached);
    const timestamp = data.lastUpdated ? new Date(data.lastUpdated).getTime() : 0;
    const age = Date.now() - timestamp;

    // Check if cache is still valid
    if (age > SOIL_CACHE_TTL) {
      localStorage.removeItem(`${SOIL_CACHE_KEY}:${farmerId}`);
      return null;
    }

    return data;
  } catch (error) {
    console.warn("[soilData] Farmer input parse error:", error);
    return null;
  }
}

/**
 * Save farmer-input soil data to localStorage
 */
export function saveFarmerSoilData(farmerId: string, card: SoilHealthCard): void {
  try {
    localStorage.setItem(
      `${SOIL_CACHE_KEY}:${farmerId}`,
      JSON.stringify({ ...card, lastUpdated: new Date().toISOString() })
    );
  } catch (error) {
    console.warn("[soilData] Save farmer soil data error:", error);
  }
}

/**
 * Cache government soil data
 */
function cacheSOilData(farmerId: string, card: SoilHealthCard): void {
  try {
    localStorage.setItem(
      `${SOIL_CACHE_KEY}:${farmerId}`,
      JSON.stringify({ ...card, lastUpdated: new Date().toISOString(), source: "government" })
    );
  } catch (error) {
    console.warn("[soilData] Cache error:", error);
  }
}

/**
 * Generate mock soil data for development
 */
export function generateMockSoilData(
  farmerId: string,
  fieldName: string = "Field A"
): SoilHealthCard {
  return {
    id: `mock-${farmerId}-${Date.now()}`,
    farmerId,
    fieldId: `field-${Date.now()}`,
    fieldName,
    state: "Maharashtra",
    district: "Nashik",
    testDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    expiryDate: new Date(Date.now() + 330 * 24 * 60 * 60 * 1000), // 330 days from now
    parameters: {
      nitrogen: 250 + Math.random() * 100,
      phosphorus: 25 + Math.random() * 15,
      potassium: 180 + Math.random() * 100,
      ph: 6.5 + Math.random() * 1.0,
      organicMatter: 2.5 + Math.random() * 1.5,
      ec: 0.3 + Math.random() * 0.4,
      texture: "loam",
      moisture: 20 + Math.random() * 15,
    },
    recommendations: [
      "Apply farm yard manure before planting",
      "Optimize irrigation based on moisture levels",
      "Consider nitrogen supplementation",
    ],
    source: "mock",
    lastUpdated: new Date(),
  };
}

/**
 * Get soil data with multi-source fallback
 */
export async function getSoilData(
  farmerId: string,
  district: string,
  options: { useMock?: boolean } = {}
): Promise<SoilHealthCard> {
  // Try government API first
  const govData = await fetchGovernmentSoilData(farmerId, district);
  if (govData) return govData;

  // Try farmer-input cache
  const farmerData = getFarmerInputSoilData(farmerId);
  if (farmerData) return farmerData;

  // Fallback to mock data
  if (options.useMock !== false) {
    return generateMockSoilData(farmerId);
  }

  // Last resort: return empty card
  return generateMockSoilData(farmerId);
}

/**
 * Calculate soil health score based on parameters
 */
export function calculateSoilHealthScore(
  parameters: SoilParameters,
  cropName?: string
): SoilHealthScore {
  const crop = cropName?.toLowerCase();
  const requirement = crop ? CROP_SOIL_REQUIREMENTS[crop] : null;

  // Helper function to get status
  const getStatus = (value: number, min: number, max: number): 'deficient' | 'optimum' | 'excessive' => {
    if (value < min) return 'deficient';
    if (value > max) return 'excessive';
    return 'optimum';
  };

  // Calculate scores for each parameter (0-100)
  let totalScore = 0;
  let count = 0;

  const nitrogenScore = Math.min(100, (parameters.nitrogen / 200) * 100);
  totalScore += nitrogenScore;
  count++;

  const phosphorusScore = Math.min(100, (parameters.phosphorus / 60) * 100);
  totalScore += phosphorusScore;
  count++;

  const potassiumScore = Math.min(100, (parameters.potassium / 200) * 100);
  totalScore += potassiumScore;
  count++;

  const phScore = parameters.ph >= 6.0 && parameters.ph <= 7.5 ? 100 : 70;
  totalScore += phScore;
  count++;

  const organicMatterScore = Math.min(100, (parameters.organicMatter / 4) * 100);
  totalScore += organicMatterScore;
  count++;

  const nitrogenStatus = requirement
    ? getStatus(
        parameters.nitrogen,
        requirement.nitrogenMin,
        requirement.nitrogenMax
      )
    : 'optimum';

  const phosphorusStatus = requirement
    ? getStatus(
        parameters.phosphorus,
        requirement.phosphorusMin,
        requirement.phosphorusMax
      )
    : 'optimum';

  const potassiumStatus = requirement
    ? getStatus(
        parameters.potassium,
        requirement.potassiumMin,
        requirement.potassiumMax
      )
    : 'optimum';

  const phStatus =
    parameters.ph < 6.0 ? 'acidic' : parameters.ph > 8.0 ? 'alkaline' : 'neutral';

  const organicMatterStatus =
    parameters.organicMatter < 1.5
      ? 'poor'
      : parameters.organicMatter < 2.5
        ? 'moderate'
        : parameters.organicMatter < 4
          ? 'good'
          : 'excellent';

  const recommendations: string[] = [];
  const amendments: SoilAmendment[] = [];

  // Generate recommendations
  if (nitrogenStatus === 'deficient') {
    recommendations.push(
      `Nitrogen levels low (${parameters.nitrogen.toFixed(1)} kg/ha). Consider urea or DAP application.`
    );
    amendments.push({
      name: "Urea (46-0-0)",
      type: "fertilizer",
      npk: [46, 0, 0],
      applicationRate: 50,
      cost: 25,
      benefits: ["Increases nitrogen content", "Supports vegetative growth"],
      timing: "Pre-planting or top-dressing at V4-V6 stage",
    });
  }

  if (phosphorusStatus === 'deficient') {
    recommendations.push(
      `Phosphorus levels low (${parameters.phosphorus.toFixed(1)} kg/ha). Apply DAP or SSP.`
    );
    amendments.push({
      name: "DAP (18-46-0)",
      type: "fertilizer",
      npk: [18, 46, 0],
      applicationRate: 75,
      cost: 40,
      benefits: ["Increases phosphorus availability", "Improves root development"],
      timing: "Pre-planting incorporation",
    });
  }

  if (phStatus === 'acidic') {
    recommendations.push(`Soil is acidic (pH ${parameters.ph}). Apply lime for neutralization.`);
    amendments.push({
      name: "Agricultural Lime (CaCO3)",
      type: "lime",
      npk: [0, 0, 0],
      applicationRate: 2000,
      cost: 5,
      benefits: ["Raises pH", "Provides calcium"],
      timing: "Before planting, incorporate deeply",
    });
  }

  if (organicMatterStatus === 'poor' || organicMatterStatus === 'moderate') {
    recommendations.push(
      `Organic matter content is ${organicMatterStatus} (${parameters.organicMatter}%). Incorporate compost or FYM.`
    );
    amendments.push({
      name: "Farm Yard Manure (FYM)",
      type: "organic",
      npk: [0.5, 0.2, 0.5],
      applicationRate: 10000,
      cost: 2,
      benefits: ["Increases organic matter", "Improves water retention", "Adds micronutrients"],
      timing: "1-2 weeks before planting, mix thoroughly",
    });
  }

  return {
    overall: Math.round(totalScore / count),
    nitrogenStatus,
    phosphorusStatus,
    potassiumStatus,
    phStatus,
    organicMatterStatus,
    recommendations,
    amendments,
  };
}

/**
 * Check if soil is suitable for a crop
 */
export function isSoilSuitableForCrop(
  parameters: SoilParameters,
  cropName: string
): { suitable: boolean; issues: string[]; compatibility: number } {
  const crop = cropName.toLowerCase();
  const requirement = CROP_SOIL_REQUIREMENTS[crop];

  if (!requirement) {
    return {
      suitable: true,
      issues: [],
      compatibility: 50, // Unknown crop
    };
  }

  const issues: string[] = [];
  let compatibility = 100;

  if (parameters.nitrogen < requirement.nitrogenMin) {
    issues.push(`Nitrogen below ${requirement.nitrogenMin} kg/ha`);
    compatibility -= 15;
  }
  if (parameters.phosphorus < requirement.phosphorusMin) {
    issues.push(`Phosphorus below ${requirement.phosphorusMin} kg/ha`);
    compatibility -= 15;
  }
  if (parameters.potassium < requirement.potassiumMin) {
    issues.push(`Potassium below ${requirement.potassiumMin} kg/ha`);
    compatibility -= 15;
  }
  if (parameters.ph < requirement.phMin || parameters.ph > requirement.phMax) {
    issues.push(`pH outside optimal range (${requirement.phMin}-${requirement.phMax})`);
    compatibility -= 10;
  }

  if (!requirement.texturePreference.includes(parameters.texture)) {
    issues.push(`Soil texture ${parameters.texture} not ideal for ${cropName}`);
    compatibility -= 10;
  }

  return {
    suitable: issues.length === 0,
    issues,
    compatibility: Math.max(0, compatibility),
  };
}

/**
 * Get available data sources status
 */
export function getDataSourcesStatus(): SoilDataSource[] {
  const govAvailable = !!process.env.VITE_SOIL_API_KEY;

  return [
    {
      id: "government",
      name: "Government Soil Health Card Portal",
      type: "government",
      priority: 1,
      available: govAvailable,
      lastChecked: new Date(),
    },
    {
      id: "farmer-input",
      name: "Farmer Manual Input",
      type: "offline",
      priority: 2,
      available: true,
      lastChecked: new Date(),
    },
    {
      id: "mock",
      name: "Development/Test Data",
      type: "offline",
      priority: 3,
      available: true,
      lastChecked: new Date(),
    },
  ];
}
