/**
 * Smart Crop Scheduling Engine
 * Matches crop requirements to soil parameters and generates personalized calendars
 */

import { SoilParameters, SoilHealthCard, CropSoilRequirement } from "@/types/soil";
import { CropCalendarEntry } from "@/data/cropCalendar";
import { isSoilSuitableForCrop, calculateSoilHealthScore } from "./soilData";
import { addDays, addMonths, startOfMonth, endOfMonth, format } from "date-fns";

export interface PlantingSchedule {
  cropName: string;
  season: string;
  fieldName: string;
  soilReadiness: number; // 0-100
  recommendedPlantingDate: Date;
  optimalWindow: { start: Date; end: Date };
  harvestDate: Date;
  preAmendments: { name: string; timing: string; rate: string }[];
  criticalStages: { name: string; daysAfterSowing: number; action: string }[];
  expectedYield: string;
  riskFactors: string[];
  notes: string;
}

export interface SmartCalendarEntry {
  date: Date;
  activity: string;
  category: string;
  crop: string;
  priority: 'high' | 'medium' | 'low';
  soilRelated: boolean;
  description: string;
  amendments?: string[];
}

export interface SoilHealthReadiness {
  nitrogen: number; // 0-100 readiness
  phosphorus: number;
  potassium: number;
  ph: number;
  organicMatter: number;
  overall: number;
}

/**
 * Calculate soil readiness for a specific crop (0-100)
 */
export function calculateSoilReadiness(
  soilParams: SoilParameters,
  requirement: CropSoilRequirement
): SoilHealthReadiness {
  const calculateReadiness = (
    actual: number,
    min: number,
    max: number,
    optimal: number
  ): number => {
    // Optimal is in the middle of the range
    const optimalPt = optimal || (min + max) / 2;

    if (actual < min) {
      // Below minimum - readiness = (actual / min) * 50
      return Math.max(0, (actual / min) * 50);
    } else if (actual > max) {
      // Above maximum - readiness = 100 - ((actual - max) / max) * 50
      return Math.max(0, 100 - ((actual - max) / max) * 50);
    } else {
      // Within range - higher readiness toward optimal
      if (actual <= optimalPt) {
        return ((actual - min) / (optimalPt - min)) * 100;
      } else {
        return (((max - actual) / (max - optimalPt)) * 50 + 50);
      }
    }
  };

  const nitrogen = calculateReadiness(
    soilParams.nitrogen,
    requirement.nitrogenMin,
    requirement.nitrogenMax,
    (requirement.nitrogenMin + requirement.nitrogenMax) / 2
  );

  const phosphorus = calculateReadiness(
    soilParams.phosphorus,
    requirement.phosphorusMin,
    requirement.phosphorusMax,
    (requirement.phosphorusMin + requirement.phosphorusMax) / 2
  );

  const potassium = calculateReadiness(
    soilParams.potassium,
    requirement.potassiumMin,
    requirement.potassiumMax,
    (requirement.potassiumMin + requirement.potassiumMax) / 2
  );

  const phOptimal = 6.8;
  const phReadiness =
    soilParams.ph >= requirement.phMin && soilParams.ph <= requirement.phMax
      ? 100 - Math.abs(soilParams.ph - phOptimal) * 10
      : 50;

  const organicMatterReadiness = Math.min(
    100,
    (soilParams.organicMatter / 4) * 100
  );

  const overall =
    (nitrogen + phosphorus + potassium + phReadiness + organicMatterReadiness) /
    5;

  return {
    nitrogen: Math.round(nitrogen),
    phosphorus: Math.round(phosphorus),
    potassium: Math.round(potassium),
    ph: Math.round(phReadiness),
    organicMatter: Math.round(organicMatterReadiness),
    overall: Math.round(overall),
  };
}

/**
 * Generate planting schedule based on soil health and crop requirements
 */
export function generatePlantingSchedule(
  crop: string,
  soilCard: SoilHealthCard,
  cropCalendarEntry?: CropCalendarEntry
): PlantingSchedule {
  const score = calculateSoilHealthScore(soilCard.parameters, crop);
  const suitability = isSoilSuitableForCrop(soilCard.parameters, crop);

  // Determine season (simplified - based on current month)
  const currentMonth = new Date().getMonth();
  let season = "Rabi";
  let basePlantingDate = new Date();

  if (currentMonth >= 5 && currentMonth <= 9) {
    // June to September = Kharif
    season = "Kharif";
    basePlantingDate = new Date(new Date().getFullYear(), 5, 15); // Mid-June
  } else if (currentMonth >= 9 || currentMonth <= 2) {
    // October to February = Rabi
    season = "Rabi";
    basePlantingDate = new Date(new Date().getFullYear(), 9, 15); // Mid-October
  } else {
    // March to May = Zaid (Summer)
    season = "Zaid";
    basePlantingDate = new Date(new Date().getFullYear(), 2, 15); // Mid-March
  }

  // Adjust planting date based on soil readiness
  let plantingDate = new Date(basePlantingDate);
  if (score.overall < 60) {
    // If soil health is poor, delay planting and recommend amendments
    plantingDate = addDays(plantingDate, 21);
  } else if (score.overall > 85) {
    // If soil health is excellent, can plant earlier
    plantingDate = addDays(plantingDate, -7);
  }

  const optimalWindow = {
    start: addDays(plantingDate, -5),
    end: addDays(plantingDate, 10),
  };

  // Estimate harvest based on crop cycle (simplified)
  const cropCycleDays =
    crop.toLowerCase() === "rice"
      ? 120
      : crop.toLowerCase() === "wheat"
        ? 120
        : crop.toLowerCase() === "cotton"
          ? 180
          : crop.toLowerCase() === "sugarcane"
            ? 360
            : 120;

  const harvestDate = addDays(plantingDate, cropCycleDays);

  // Build pre-amendments list
  const preAmendments: { name: string; timing: string; rate: string }[] = [];

  if (score.amendments && score.amendments.length > 0) {
    score.amendments.forEach((amend) => {
      preAmendments.push({
        name: amend.name,
        timing: amend.timing,
        rate: `${amend.applicationRate} kg/ha`,
      });
    });
  }

  // Critical growth stages
  const criticalStages = [
    {
      name: "Land Preparation",
      daysAfterSowing: -21,
      action: "Apply amendments, deep plough, remove weeds",
    },
    {
      name: "Sowing",
      daysAfterSowing: 0,
      action: "Sow seeds at recommended spacing and depth",
    },
    {
      name: "Germination & Seedling",
      daysAfterSowing: 7,
      action: "Monitor moisture, thin seedlings if necessary",
    },
    {
      name: "Vegetative Growth",
      daysAfterSowing: 30,
      action: "First irrigation, nitrogen topdressing if needed",
    },
    {
      name: "Flowering/Panicle Initiation",
      daysAfterSowing: 60,
      action: "Critical water requirement, apply potassium if deficient",
    },
    {
      name: "Grain Filling",
      daysAfterSowing: 90,
      action: "Monitor for pests, maintain moisture",
    },
    {
      name: "Maturity",
      daysAfterSowing: cropCycleDays - 10,
      action: "Reduce irrigation, monitor for harvest readiness",
    },
  ];

  const riskFactors: string[] = [];
  if (score.overall < 60) {
    riskFactors.push("Low soil health score - consider delaying planting");
  }
  if (suitability.issues.length > 0) {
    riskFactors.push(
      `Soil suitability issues: ${suitability.issues.join(", ")}`
    );
  }
  if (soilCard.parameters.moisture < 15) {
    riskFactors.push(
      "Soil moisture low - may need pre-sowing irrigation"
    );
  }
  if (soilCard.parameters.ph < 5.5 || soilCard.parameters.ph > 8.0) {
    riskFactors.push(
      `Soil pH is ${soilCard.parameters.ph} - not in ideal range`
    );
  }

  // Expected yield (simplified estimation)
  const yieldBase =
    crop.toLowerCase() === "rice"
      ? 3.5
      : crop.toLowerCase() === "wheat"
        ? 3.0
        : crop.toLowerCase() === "cotton"
          ? 1.2
          : crop.toLowerCase() === "sugarcane"
            ? 60
            : 2.5;

  const yieldAdjustment = (score.overall / 100) * 0.4 + 0.8; // Adjusted 80-120%
  const expectedYield = (yieldBase * yieldAdjustment).toFixed(1);

  const unit =
    crop.toLowerCase() === "sugarcane" ? "t/ha" : "t/ha";

  return {
    cropName: crop,
    season,
    fieldName: soilCard.fieldName,
    soilReadiness: score.overall,
    recommendedPlantingDate: plantingDate,
    optimalWindow,
    harvestDate,
    preAmendments,
    criticalStages: criticalStages.map((stage) => ({
      ...stage,
      daysAfterSowing:
        stage.daysAfterSowing === -21
          ? plantingDate.getTime() - 21 * 24 * 60 * 60 * 1000
          : stage.daysAfterSowing,
    })) as unknown as typeof criticalStages,
    expectedYield: `${expectedYield} ${unit}`,
    riskFactors,
    notes: `Scheduling based on ${soilCard.source} soil data from ${format(soilCard.testDate, "MMM d, yyyy")}. Adjust dates based on weather conditions and local advisories.`,
  };
}

/**
 * Generate 12-month smart planting calendar
 */
export function generateSmartCalendar(
  crops: string[],
  soilCard: SoilHealthCard
): SmartCalendarEntry[] {
  const calendar: SmartCalendarEntry[] = [];
  const today = new Date();

  crops.forEach((crop) => {
    const schedule = generatePlantingSchedule(crop, soilCard);
    const plantDate = schedule.recommendedPlantingDate;

    // Add pre-amendment activities (3 weeks before)
    const amendDate = addDays(plantDate, -21);
    if (schedule.preAmendments.length > 0) {
      calendar.push({
        date: amendDate,
        activity: "Apply Soil Amendments",
        category: "soil_amendment",
        crop,
        priority: "high",
        soilRelated: true,
        description: `Apply amendments to improve soil health before planting ${crop}`,
        amendments: schedule.preAmendments.map((a) => `${a.name} (${a.rate})`),
      });
    }

    // Add land preparation (2 weeks before)
    const prepDate = addDays(plantDate, -14);
    calendar.push({
      date: prepDate,
      activity: "Land Preparation",
      category: "field_prep",
      crop,
      priority: "high",
      soilRelated: true,
      description: "Deep plough, remove weeds, level field",
    });

    // Add planting date
    calendar.push({
      date: plantDate,
      activity: "Sowing/Planting",
      category: "sowing",
      crop,
      priority: "high",
      soilRelated: false,
      description: `Optimal window: ${format(schedule.optimalWindow.start, "MMM d")} - ${format(schedule.optimalWindow.end, "MMM d")}`,
    });

    // Add first irrigation
    const firstIrrigationDate = addDays(plantDate, 7);
    calendar.push({
      date: firstIrrigationDate,
      activity: "First Irrigation",
      category: "irrigate",
      crop,
      priority: "high",
      soilRelated: false,
      description: "Check soil moisture and irrigate if needed",
    });

    // Add nitrogen top-dressing
    const nDressDate = addDays(plantDate, 30);
    if (
      calculateSoilHealthScore(soilCard.parameters, crop).nitrogenStatus ===
      "deficient"
    ) {
      calendar.push({
        date: nDressDate,
        activity: "Nitrogen Topdressing",
        category: "fertilize",
        crop,
        priority: "medium",
        soilRelated: true,
        description: "Apply nitrogen fertilizer as soil tests indicate deficiency",
      });
    }

    // Add harvest date
    calendar.push({
      date: schedule.harvestDate,
      activity: "Harvesting",
      category: "harvest",
      crop,
      priority: "high",
      soilRelated: false,
      description: "Monitor for harvest readiness",
    });
  });

  // Sort by date
  return calendar.sort((a, b) => a.date.getTime() - b.date.getTime());
}

/**
 * Get soil preparation recommendations for next 30 days
 */
export function getNext30DaysActions(
  soilCard: SoilHealthCard,
  crops: string[]
): SmartCalendarEntry[] {
  const allCalendar = generateSmartCalendar(crops, soilCard);
  const today = new Date();
  const thirtyDaysLater = addDays(today, 30);

  return allCalendar.filter(
    (entry) =>
      entry.date >= today && entry.date <= thirtyDaysLater
  );
}
