/**
 * NDVI (Normalized Difference Vegetation Index) Service
 * Satellite imagery integration for field health monitoring
 */

import { FieldPolygon, FieldPoint } from "./fieldGeometry";

export interface NDVIData {
  id: string;
  fieldId: string;
  date: Date;
  ndviValues: NDVIPixel[];
  averageNDVI: number;
  minNDVI: number;
  maxNDVI: number;
  healthStatus: "excellent" | "good" | "fair" | "poor" | "critical";
  cloudCover: number; // percentage
  source: string; // Sentinel-2, Planet, etc.
}

export interface NDVIPixel {
  lat: number;
  lng: number;
  ndvi: number; // -1 to 1 scale
}

export interface StressAlert {
  id: string;
  fieldId: string;
  severity: "low" | "medium" | "high" | "critical";
  stressType: "water" | "nutrient" | "pest" | "disease" | "other";
  ndviChange: number; // percentage change week-over-week
  recommendation: string;
  detectedDate: Date;
  location?: FieldPoint; // Approximate location within field
}

export interface NDVIHistoryEntry {
  date: Date;
  averageNDVI: number;
  healthStatus: string;
  cloudCover: number;
}

// Mock satellite API responses
const MOCK_NDVI_RANGE = { min: 0.2, max: 0.85 };

/**
 * Calculate NDVI from NIR and RED bands
 * NDVI = (NIR - RED) / (NIR + RED)
 * Range: -1 (water/no vegetation) to +1 (dense vegetation)
 */
export function calculateNDVI(nir: number, red: number): number {
  if (nir + red === 0) return 0;
  return (nir - red) / (nir + red);
}

/**
 * Classify NDVI value into health status
 */
export function classifyNDVIHealth(ndvi: number): "excellent" | "good" | "fair" | "poor" | "critical" {
  if (ndvi >= 0.7) return "excellent";
  if (ndvi >= 0.5) return "good";
  if (ndvi >= 0.3) return "fair";
  if (ndvi >= 0.1) return "poor";
  return "critical";
}

/**
 * Get NDVI color for visualization
 */
export function getNDVIColor(ndvi: number): string {
  // Red (stressed) to Green (healthy)
  if (ndvi < 0.2) return "#8B0000"; // Dark red
  if (ndvi < 0.3) return "#FF4500"; // Red-orange
  if (ndvi < 0.4) return "#FFA500"; // Orange
  if (ndvi < 0.5) return "#FFFF00"; // Yellow
  if (ndvi < 0.6) return "#ADFF2F"; // Yellow-green
  if (ndvi < 0.7) return "#00DD00"; // Green
  return "#006400"; // Dark green
}

/**
 * Generate mock NDVI data for a field
 */
export function generateMockNDVIData(field: FieldPolygon, date: Date = new Date()): NDVIData {
  const pixels: NDVIPixel[] = [];
  const pixelCount = 20; // 20 sample points

  // Generate random NDVI values within field bounds
  let ndviSum = 0;
  let minNDVI = 1;
  let maxNDVI = -1;

  for (let i = 0; i < pixelCount; i++) {
    // Random point within field
    const randomIndex = Math.floor(Math.random() * field.points.length);
    const point = field.points[randomIndex];

    // Add small random offset
    const offsetLat = (Math.random() - 0.5) * 0.001;
    const offsetLng = (Math.random() - 0.5) * 0.001;

    // Generate NDVI with some spatial variation
    const baseNDVI = 0.55 + (Math.random() - 0.5) * 0.3;
    const ndvi = Math.max(-1, Math.min(1, baseNDVI));

    pixels.push({
      lat: point.lat + offsetLat,
      lng: point.lng + offsetLng,
      ndvi,
    });

    ndviSum += ndvi;
    minNDVI = Math.min(minNDVI, ndvi);
    maxNDVI = Math.max(maxNDVI, ndvi);
  }

  const averageNDVI = ndviSum / pixelCount;
  const healthStatus = classifyNDVIHealth(averageNDVI);

  return {
    id: `ndvi-${field.id}-${date.getTime()}`,
    fieldId: field.id,
    date,
    ndviValues: pixels,
    averageNDVI: Math.round(averageNDVI * 1000) / 1000,
    minNDVI: Math.round(minNDVI * 1000) / 1000,
    maxNDVI: Math.round(maxNDVI * 1000) / 1000,
    healthStatus,
    cloudCover: Math.random() * 15, // 0-15% cloud cover
    source: "Sentinel-2",
  };
}

/**
 * Detect field stress from NDVI data
 */
export function detectFieldStress(
  currentNDVI: NDVIData,
  previousNDVI?: NDVIData
): StressAlert[] {
  const alerts: StressAlert[] = [];

  // Check absolute NDVI levels
  if (currentNDVI.averageNDVI < 0.3) {
    alerts.push({
      id: `alert-${currentNDVI.id}`,
      fieldId: currentNDVI.fieldId,
      severity: currentNDVI.averageNDVI < 0.2 ? "critical" : "high",
      stressType: currentNDVI.averageNDVI < 0.15 ? "water" : "nutrient",
      ndviChange: -30,
      recommendation:
        currentNDVI.averageNDVI < 0.2
          ? "Critical water deficit detected. Increase irrigation immediately."
          : "Nutrient deficiency detected. Apply nitrogen fertilizer.",
      detectedDate: currentNDVI.date,
    });
  }

  // Check week-over-week changes
  if (previousNDVI) {
    const change = ((currentNDVI.averageNDVI - previousNDVI.averageNDVI) / previousNDVI.averageNDVI) * 100;

    if (change < -15) {
      alerts.push({
        id: `alert-change-${currentNDVI.id}`,
        fieldId: currentNDVI.fieldId,
        severity: change < -25 ? "critical" : "high",
        stressType: "pest",
        ndviChange: change,
        recommendation: `Rapid NDVI decline (${Math.abs(change).toFixed(1)}%). Check for pest/disease outbreak.`,
        detectedDate: currentNDVI.date,
      });
    }
  }

  // Check for high variance within field (heterogeneous stress)
  const variance = currentNDVI.maxNDVI - currentNDVI.minNDVI;
  if (variance > 0.35) {
    alerts.push({
      id: `alert-variance-${currentNDVI.id}`,
      fieldId: currentNDVI.fieldId,
      severity: "medium",
      stressType: "water",
      ndviChange: 0,
      recommendation: `High spatial variation detected. Adjust irrigation zones or check for drainage issues.`,
      detectedDate: currentNDVI.date,
    });
  }

  return alerts;
}

/**
 * Get historical NDVI trend for a field
 */
export function generateNDVIHistory(field: FieldPolygon, daysBack: number = 60): NDVIHistoryEntry[] {
  const history: NDVIHistoryEntry[] = [];
  const interval = Math.ceil(daysBack / 8); // ~8 data points

  for (let i = daysBack; i >= 0; i -= interval) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    // Simulate seasonal trend with some noise
    const seasonalFactor = Math.sin((i / 60) * Math.PI) * 0.15;
    const noise = (Math.random() - 0.5) * 0.1;
    const ndvi = 0.55 + seasonalFactor + noise;

    history.push({
      date,
      averageNDVI: Math.max(0.2, Math.min(0.85, ndvi)),
      healthStatus: classifyNDVIHealth(ndvi),
      cloudCover: Math.random() * 20,
    });
  }

  return history;
}

/**
 * Recommend irrigation based on NDVI
 */
export function getIrrigationRecommendation(
  ndvi: number,
  lastRainfallDays: number = 7
): { recommendation: string; priority: "low" | "medium" | "high" }  {
  if (ndvi < 0.25) {
    return {
      recommendation: "Critical water stress. Irrigate immediately with high volume.",
      priority: "high",
    };
  }

  if (ndvi < 0.35) {
    return {
      recommendation: "Moderate water stress. Plan irrigation within 2-3 days.",
      priority: "high",
    };
  }

  if (ndvi < 0.5 && lastRainfallDays > 7) {
    return {
      recommendation: "Monitor soil moisture. Schedule irrigation if no rain forecast.",
      priority: "medium",
    };
  }

  return {
    recommendation: "Field appears adequately watered. Continue monitoring.",
    priority: "low",
  };
}

/**
 * Recommend fertilization based on NDVI
 */
export function getFertilizationRecommendation(ndvi: number): {
  recommendation: string;
  priority: "low" | "medium" | "high";
  fertilizer?: string;
} {
  if (ndvi < 0.35) {
    return {
      recommendation: "Low vegetation index suggests nutrient deficiency.",
      priority: "high",
      fertilizer: "Apply DAP (18-46-0) at 50 kg/ha immediately",
    };
  }

  if (ndvi < 0.5) {
    return {
      recommendation: "Moderate vegetation vigor. Nitrogen supplementation may help.",
      priority: "medium",
      fertilizer: "Apply urea at 25-50 kg/ha in next scheduled irrigation",
    };
  }

  return {
    recommendation: "Vegetation vigor is good. Continue regular fertilization schedule.",
    priority: "low",
  };
}

/**
 * Export NDVI data as CSV
 */
export function exportNDVIAsCSV(ndvi: NDVIData): string {
  const rows = [
    ["NDVI Data Export"],
    ["Field ID", ndvi.fieldId],
    ["Date", ndvi.date.toISOString()],
    ["Average NDVI", ndvi.averageNDVI],
    ["Min NDVI", ndvi.minNDVI],
    ["Max NDVI", ndvi.maxNDVI],
    ["Health Status", ndvi.healthStatus],
    ["Cloud Cover %", ndvi.cloudCover],
    ["Source", ndvi.source],
    [],
    ["Pixel Data"],
    ["Latitude", "Longitude", "NDVI", "Status"],
    ...ndvi.ndviValues.map((pixel) => [
      pixel.lat.toFixed(6),
      pixel.lng.toFixed(6),
      pixel.ndvi.toFixed(3),
      classifyNDVIHealth(pixel.ndvi),
    ]),
  ];

  return rows.map((row) => row.join(",")).join("\n");
}
