// Crop Recommendation Dataset
// Source: Kaggle Crop Recommendation Dataset (N, P, K, temperature, humidity, pH, rainfall)
// Enhanced with Indian agricultural data from ICAR, IARI, and state agricultural universities

import { createDatasetMetadata } from "./datasetMetadata";

export interface SoilParameters {
  nitrogen: { min: number; max: number; optimal: number; unit: string };
  phosphorus: { min: number; max: number; optimal: number; unit: string };
  potassium: { min: number; max: number; optimal: number; unit: string };
  ph: { min: number; max: number; optimal: number };
  temperature: { min: number; max: number; optimal: number; unit: string };
  humidity: { min: number; max: number; optimal: number; unit: string };
  rainfall: { min: number; max: number; optimal: number; unit: string };
  organicCarbon?: { min: number; max: number; optimal: number; unit: string };
}

export interface CropRecommendationData {
  id: string;
  crop: string;
  hindiName: string;
  category: "cereal" | "pulse" | "oilseed" | "vegetable" | "fruit" | "spice" | "fiber" | "commercial";
  season: "Kharif" | "Rabi" | "Zaid" | "Perennial";
  soilParameters: SoilParameters;
  suitableStates: string[];
  soilTypes: string[];
  irrigationType: ("rainfed" | "irrigated" | "both")[];
  avgYield: { value: number; unit: string };
  marketPrice: { min: number; max: number; unit: string };
  costOfCultivation: { value: number; unit: string };
  profitPerHectare: { min: number; max: number; unit: string };
  waterRequirement: { value: number; unit: string };
  duration: { min: number; max: number; unit: string };
  bestVarieties: { name: string; yield: string; features: string }[];
  fertilizers: {
    basal: string[];
    topDressing: string[];
  };
  intercropping: string[];
  rotationCrops: string[];
}

export const cropRecommendationsMetadata = createDatasetMetadata({
  version: "1.0.0",
  lastUpdated: "2024-12-01T00:00:00Z",
  source: "Kaggle + ICAR/IARI/state agri universities",
  notes: "Merged nutrient ranges with India-specific agronomy references.",
});

export const cropRecommendations: CropRecommendationData[] = [
  // ==================== CEREALS ====================
  {
    id: "rice",
    crop: "Rice",
    hindiName: "धान / चावल",
    category: "cereal",
    season: "Kharif",
    soilParameters: {
      nitrogen: { min: 60, max: 120, optimal: 80, unit: "kg/ha" },
      phosphorus: { min: 25, max: 60, optimal: 40, unit: "kg/ha" },
      potassium: { min: 25, max: 60, optimal: 40, unit: "kg/ha" },
      ph: { min: 5.0, max: 7.5, optimal: 6.5 },
      temperature: { min: 20, max: 37, optimal: 28, unit: "°C" },
      humidity: { min: 60, max: 95, optimal: 80, unit: "%" },
      rainfall: { min: 1000, max: 2500, optimal: 1500, unit: "mm" },
      organicCarbon: { min: 0.3, max: 1.5, optimal: 0.75, unit: "%" }
    },
    suitableStates: ["West Bengal", "Uttar Pradesh", "Punjab", "Andhra Pradesh", "Tamil Nadu", "Bihar", "Chhattisgarh", "Odisha", "Assam", "Karnataka"],
    soilTypes: ["Clay loam", "Alluvial", "Laterite", "Black cotton soil"],
    irrigationType: ["irrigated", "rainfed"],
    avgYield: { value: 3950, unit: "kg/ha" },
    marketPrice: { min: 2183, max: 2800, unit: "₹/quintal" },
    costOfCultivation: { value: 65000, unit: "₹/ha" },
    profitPerHectare: { min: 20000, max: 50000, unit: "₹/ha" },
    waterRequirement: { value: 1200, unit: "mm/season" },
    duration: { min: 120, max: 150, unit: "days" },
    bestVarieties: [
      { name: "Pusa Basmati 1121", yield: "4.5 t/ha", features: "Long grain aromatic, export quality" },
      { name: "Swarna (MTU 7029)", yield: "5.0 t/ha", features: "Medium duration, high yielding" },
      { name: "IR 64", yield: "5.5 t/ha", features: "Early maturing, fine grain" },
      { name: "Pusa 44", yield: "7.0 t/ha", features: "Very high yield, long duration" },
      { name: "Samba Mahsuri (BPT 5204)", yield: "5.0 t/ha", features: "Fine grain, bacterial blight resistant" }
    ],
    fertilizers: {
      basal: ["DAP 100kg/ha", "MOP 50kg/ha", "Zinc Sulphate 25kg/ha"],
      topDressing: ["Urea 65kg/ha at tillering", "Urea 35kg/ha at panicle initiation"]
    },
    intercropping: ["Azolla", "Fish (paddy-cum-fish culture)"],
    rotationCrops: ["Wheat", "Mustard", "Lentil", "Potato", "Chickpea"]
  },
  {
    id: "wheat",
    crop: "Wheat",
    hindiName: "गेहूं",
    category: "cereal",
    season: "Rabi",
    soilParameters: {
      nitrogen: { min: 80, max: 150, optimal: 120, unit: "kg/ha" },
      phosphorus: { min: 40, max: 80, optimal: 60, unit: "kg/ha" },
      potassium: { min: 30, max: 60, optimal: 40, unit: "kg/ha" },
      ph: { min: 6.0, max: 8.5, optimal: 7.0 },
      temperature: { min: 10, max: 30, optimal: 22, unit: "°C" },
      humidity: { min: 40, max: 75, optimal: 60, unit: "%" },
      rainfall: { min: 400, max: 1100, optimal: 750, unit: "mm" },
      organicCarbon: { min: 0.3, max: 1.5, optimal: 0.65, unit: "%" }
    },
    suitableStates: ["Uttar Pradesh", "Punjab", "Haryana", "Madhya Pradesh", "Rajasthan", "Bihar", "Gujarat", "Maharashtra"],
    soilTypes: ["Loam", "Clay loam", "Alluvial", "Black soil"],
    irrigationType: ["irrigated", "both"],
    avgYield: { value: 3507, unit: "kg/ha" },
    marketPrice: { min: 2275, max: 2900, unit: "₹/quintal" },
    costOfCultivation: { value: 55000, unit: "₹/ha" },
    profitPerHectare: { min: 25000, max: 55000, unit: "₹/ha" },
    waterRequirement: { value: 450, unit: "mm/season" },
    duration: { min: 120, max: 155, unit: "days" },
    bestVarieties: [
      { name: "HD 3226 (Pusa Yashasvi)", yield: "6.2 t/ha", features: "Rust resistant, high yield" },
      { name: "DBW 187 (Karan Vandana)", yield: "5.8 t/ha", features: "Heat tolerant, timely sown" },
      { name: "HD 2967", yield: "5.5 t/ha", features: "Widely adapted, good quality" },
      { name: "WH 1105", yield: "5.5 t/ha", features: "Excellent chapati quality" },
      { name: "PBW 826", yield: "5.7 t/ha", features: "Latest Punjab variety, rust resistant" }
    ],
    fertilizers: {
      basal: ["DAP 130kg/ha", "MOP 50kg/ha"],
      topDressing: ["Urea 65kg/ha at CRI stage", "Urea 65kg/ha at late jointing"]
    },
    intercropping: ["Mustard (9:1 ratio)", "Lentil"],
    rotationCrops: ["Rice", "Maize", "Cotton", "Soybean", "Mung bean"]
  },
  {
    id: "maize",
    crop: "Maize",
    hindiName: "मक्का",
    category: "cereal",
    season: "Kharif",
    soilParameters: {
      nitrogen: { min: 80, max: 160, optimal: 120, unit: "kg/ha" },
      phosphorus: { min: 40, max: 80, optimal: 60, unit: "kg/ha" },
      potassium: { min: 30, max: 70, optimal: 50, unit: "kg/ha" },
      ph: { min: 5.5, max: 8.0, optimal: 6.8 },
      temperature: { min: 18, max: 35, optimal: 28, unit: "°C" },
      humidity: { min: 50, max: 85, optimal: 70, unit: "%" },
      rainfall: { min: 500, max: 1200, optimal: 800, unit: "mm" },
      organicCarbon: { min: 0.4, max: 1.2, optimal: 0.7, unit: "%" }
    },
    suitableStates: ["Karnataka", "Madhya Pradesh", "Maharashtra", "Rajasthan", "Bihar", "Andhra Pradesh", "Telangana", "Uttar Pradesh"],
    soilTypes: ["Sandy loam", "Loam", "Clay loam", "Red soil"],
    irrigationType: ["both"],
    avgYield: { value: 3000, unit: "kg/ha" },
    marketPrice: { min: 2090, max: 2600, unit: "₹/quintal" },
    costOfCultivation: { value: 45000, unit: "₹/ha" },
    profitPerHectare: { min: 18000, max: 40000, unit: "₹/ha" },
    waterRequirement: { value: 500, unit: "mm/season" },
    duration: { min: 90, max: 120, unit: "days" },
    bestVarieties: [
      { name: "DHM 121", yield: "7.5 t/ha", features: "Single cross hybrid, high yield" },
      { name: "HQPM 1", yield: "6.5 t/ha", features: "Quality protein maize" },
      { name: "Vivek QPM 9", yield: "5.5 t/ha", features: "High quality protein, medium duration" },
      { name: "Bio 9681", yield: "8.0 t/ha", features: "Private hybrid, very high yield" },
      { name: "PMH 1", yield: "6.0 t/ha", features: "Public hybrid for hills" }
    ],
    fertilizers: {
      basal: ["DAP 130kg/ha", "MOP 65kg/ha", "ZnSO4 25kg/ha"],
      topDressing: ["Urea 65kg/ha at knee-high stage", "Urea 65kg/ha at tasseling"]
    },
    intercropping: ["Black gram", "Soybean", "Cowpea"],
    rotationCrops: ["Wheat", "Chickpea", "Mustard", "Potato"]
  },
  {
    id: "bajra",
    crop: "Pearl Millet (Bajra)",
    hindiName: "बाजरा",
    category: "cereal",
    season: "Kharif",
    soilParameters: {
      nitrogen: { min: 40, max: 80, optimal: 60, unit: "kg/ha" },
      phosphorus: { min: 20, max: 40, optimal: 30, unit: "kg/ha" },
      potassium: { min: 20, max: 40, optimal: 30, unit: "kg/ha" },
      ph: { min: 6.0, max: 8.5, optimal: 7.0 },
      temperature: { min: 25, max: 42, optimal: 33, unit: "°C" },
      humidity: { min: 20, max: 60, optimal: 40, unit: "%" },
      rainfall: { min: 200, max: 700, optimal: 400, unit: "mm" },
      organicCarbon: { min: 0.2, max: 0.8, optimal: 0.5, unit: "%" }
    },
    suitableStates: ["Rajasthan", "Maharashtra", "Gujarat", "Uttar Pradesh", "Haryana", "Karnataka", "Madhya Pradesh"],
    soilTypes: ["Sandy", "Sandy loam", "Light loam", "Red soil"],
    irrigationType: ["rainfed", "both"],
    avgYield: { value: 1800, unit: "kg/ha" },
    marketPrice: { min: 2500, max: 3200, unit: "₹/quintal" },
    costOfCultivation: { value: 25000, unit: "₹/ha" },
    profitPerHectare: { min: 15000, max: 35000, unit: "₹/ha" },
    waterRequirement: { value: 350, unit: "mm/season" },
    duration: { min: 75, max: 110, unit: "days" },
    bestVarieties: [
      { name: "HHB 67 Improved", yield: "3.0 t/ha", features: "Downy mildew resistant" },
      { name: "Pusa Composite 612", yield: "2.5 t/ha", features: "Dual purpose (grain + fodder)" },
      { name: "RHB 177", yield: "3.2 t/ha", features: "High yielding hybrid" },
      { name: "GHB 558", yield: "3.0 t/ha", features: "Pearl quality grain" }
    ],
    fertilizers: {
      basal: ["DAP 65kg/ha", "MOP 30kg/ha"],
      topDressing: ["Urea 45kg/ha at 25-30 DAS"]
    },
    intercropping: ["Cluster bean", "Moth bean", "Mung bean"],
    rotationCrops: ["Mustard", "Chickpea", "Wheat"]
  },

  // ==================== PULSES ====================
  {
    id: "chickpea",
    crop: "Chickpea (Gram)",
    hindiName: "चना",
    category: "pulse",
    season: "Rabi",
    soilParameters: {
      nitrogen: { min: 15, max: 25, optimal: 20, unit: "kg/ha" },
      phosphorus: { min: 40, max: 80, optimal: 60, unit: "kg/ha" },
      potassium: { min: 20, max: 40, optimal: 30, unit: "kg/ha" },
      ph: { min: 6.0, max: 8.0, optimal: 7.0 },
      temperature: { min: 10, max: 30, optimal: 22, unit: "°C" },
      humidity: { min: 30, max: 65, optimal: 45, unit: "%" },
      rainfall: { min: 400, max: 900, optimal: 650, unit: "mm" },
      organicCarbon: { min: 0.3, max: 1.0, optimal: 0.6, unit: "%" }
    },
    suitableStates: ["Madhya Pradesh", "Rajasthan", "Maharashtra", "Uttar Pradesh", "Andhra Pradesh", "Karnataka", "Gujarat"],
    soilTypes: ["Sandy loam", "Loam", "Clay loam", "Black soil"],
    irrigationType: ["rainfed", "both"],
    avgYield: { value: 1200, unit: "kg/ha" },
    marketPrice: { min: 5440, max: 7000, unit: "₹/quintal" },
    costOfCultivation: { value: 30000, unit: "₹/ha" },
    profitPerHectare: { min: 25000, max: 55000, unit: "₹/ha" },
    waterRequirement: { value: 300, unit: "mm/season" },
    duration: { min: 115, max: 150, unit: "days" },
    bestVarieties: [
      { name: "JG 14", yield: "2.0 t/ha", features: "Wilt resistant, bold grain" },
      { name: "Pusa 372", yield: "1.8 t/ha", features: "Desi type, machine harvestable" },
      { name: "KAK 2", yield: "1.7 t/ha", features: "Wilt + root rot resistant" },
      { name: "JAKI 9218", yield: "2.2 t/ha", features: "High yield, Kabuli type" }
    ],
    fertilizers: {
      basal: ["DAP 100kg/ha", "Rhizobium seed treatment"],
      topDressing: ["No nitrogen topdressing needed (BNF)"]
    },
    intercropping: ["Linseed", "Mustard (6:1)", "Safflower"],
    rotationCrops: ["Rice", "Maize", "Sorghum", "Cotton"]
  },
  {
    id: "lentil",
    crop: "Lentil (Masoor)",
    hindiName: "मसूर",
    category: "pulse",
    season: "Rabi",
    soilParameters: {
      nitrogen: { min: 15, max: 25, optimal: 20, unit: "kg/ha" },
      phosphorus: { min: 30, max: 60, optimal: 45, unit: "kg/ha" },
      potassium: { min: 20, max: 40, optimal: 25, unit: "kg/ha" },
      ph: { min: 6.0, max: 8.0, optimal: 7.0 },
      temperature: { min: 12, max: 28, optimal: 20, unit: "°C" },
      humidity: { min: 35, max: 70, optimal: 50, unit: "%" },
      rainfall: { min: 300, max: 800, optimal: 500, unit: "mm" },
      organicCarbon: { min: 0.3, max: 0.8, optimal: 0.5, unit: "%" }
    },
    suitableStates: ["Uttar Pradesh", "Madhya Pradesh", "Bihar", "West Bengal", "Jharkhand"],
    soilTypes: ["Loam", "Clay loam", "Alluvial", "Sandy loam"],
    irrigationType: ["rainfed", "both"],
    avgYield: { value: 950, unit: "kg/ha" },
    marketPrice: { min: 6425, max: 8000, unit: "₹/quintal" },
    costOfCultivation: { value: 28000, unit: "₹/ha" },
    profitPerHectare: { min: 25000, max: 50000, unit: "₹/ha" },
    waterRequirement: { value: 250, unit: "mm/season" },
    duration: { min: 110, max: 140, unit: "days" },
    bestVarieties: [
      { name: "IPL 316", yield: "1.5 t/ha", features: "Bold seeded, wilt resistant" },
      { name: "Pusa Vaibhav", yield: "1.4 t/ha", features: "Rust resistant, high Fe/Zn" },
      { name: "KLS 218", yield: "1.3 t/ha", features: "Medium duration, wide adaptability" },
      { name: "HUL 57", yield: "1.5 t/ha", features: "Early maturing, heat tolerant" }
    ],
    fertilizers: {
      basal: ["DAP 80kg/ha", "Rhizobium + PSB seed treatment"],
      topDressing: ["Generally not required"]
    },
    intercropping: ["Mustard (6:1)", "Linseed"],
    rotationCrops: ["Rice", "Maize", "Millets"]
  },
  {
    id: "mung",
    crop: "Green Gram (Mung)",
    hindiName: "मूंग",
    category: "pulse",
    season: "Kharif",
    soilParameters: {
      nitrogen: { min: 15, max: 25, optimal: 20, unit: "kg/ha" },
      phosphorus: { min: 30, max: 50, optimal: 40, unit: "kg/ha" },
      potassium: { min: 15, max: 30, optimal: 20, unit: "kg/ha" },
      ph: { min: 6.0, max: 8.0, optimal: 7.0 },
      temperature: { min: 25, max: 40, optimal: 32, unit: "°C" },
      humidity: { min: 50, max: 80, optimal: 65, unit: "%" },
      rainfall: { min: 400, max: 800, optimal: 600, unit: "mm" },
      organicCarbon: { min: 0.3, max: 0.8, optimal: 0.5, unit: "%" }
    },
    suitableStates: ["Rajasthan", "Maharashtra", "Andhra Pradesh", "Madhya Pradesh", "Odisha", "Karnataka", "Tamil Nadu"],
    soilTypes: ["Sandy loam", "Loam", "Well-drained soils"],
    irrigationType: ["rainfed", "both"],
    avgYield: { value: 800, unit: "kg/ha" },
    marketPrice: { min: 8558, max: 10000, unit: "₹/quintal" },
    costOfCultivation: { value: 22000, unit: "₹/ha" },
    profitPerHectare: { min: 30000, max: 58000, unit: "₹/ha" },
    waterRequirement: { value: 300, unit: "mm/season" },
    duration: { min: 60, max: 75, unit: "days" },
    bestVarieties: [
      { name: "IPM 02-3 (Virat)", yield: "1.2 t/ha", features: "MYMV resistant, short duration" },
      { name: "SML 668", yield: "1.0 t/ha", features: "Synchronous maturity" },
      { name: "Pusa Vishal", yield: "1.0 t/ha", features: "Bold seeded, high protein" },
      { name: "MH 421", yield: "1.1 t/ha", features: "MYMV + powdery mildew resistant" }
    ],
    fertilizers: {
      basal: ["DAP 75kg/ha", "Rhizobium + PSB seed treatment"],
      topDressing: ["Not required"]
    },
    intercropping: ["Maize", "Sorghum", "Pearl millet"],
    rotationCrops: ["Rice", "Wheat", "Maize", "Cotton"]
  },

  // ==================== OILSEEDS ====================
  {
    id: "mustard",
    crop: "Mustard",
    hindiName: "सरसों",
    category: "oilseed",
    season: "Rabi",
    soilParameters: {
      nitrogen: { min: 60, max: 120, optimal: 80, unit: "kg/ha" },
      phosphorus: { min: 30, max: 60, optimal: 40, unit: "kg/ha" },
      potassium: { min: 20, max: 40, optimal: 30, unit: "kg/ha" },
      ph: { min: 6.0, max: 8.0, optimal: 7.0 },
      temperature: { min: 10, max: 30, optimal: 20, unit: "°C" },
      humidity: { min: 30, max: 70, optimal: 50, unit: "%" },
      rainfall: { min: 250, max: 700, optimal: 400, unit: "mm" },
      organicCarbon: { min: 0.3, max: 0.8, optimal: 0.5, unit: "%" }
    },
    suitableStates: ["Rajasthan", "Uttar Pradesh", "Haryana", "Madhya Pradesh", "Gujarat", "West Bengal", "Assam"],
    soilTypes: ["Sandy loam", "Loam", "Clay loam", "Alluvial"],
    irrigationType: ["rainfed", "both"],
    avgYield: { value: 1400, unit: "kg/ha" },
    marketPrice: { min: 5650, max: 7500, unit: "₹/quintal" },
    costOfCultivation: { value: 32000, unit: "₹/ha" },
    profitPerHectare: { min: 35000, max: 70000, unit: "₹/ha" },
    waterRequirement: { value: 300, unit: "mm/season" },
    duration: { min: 120, max: 150, unit: "days" },
    bestVarieties: [
      { name: "Pusa Mustard 25", yield: "2.0 t/ha", features: "White rust tolerant, bold seeded" },
      { name: "NRCHB 101", yield: "2.2 t/ha", features: "Canola quality, low erucic acid" },
      { name: "RH 749", yield: "2.3 t/ha", features: "High oil content (42%)" },
      { name: "Pusa Bold", yield: "1.8 t/ha", features: "Bold seeded, high oil" }
    ],
    fertilizers: {
      basal: ["DAP 87kg/ha", "MOP 33kg/ha", "Sulphur 40kg/ha"],
      topDressing: ["Urea 55kg/ha at 30 DAS"]
    },
    intercropping: ["Wheat (9:1)", "Chickpea"],
    rotationCrops: ["Rice", "Maize", "Mung", "Cotton"]
  },
  {
    id: "soybean",
    crop: "Soybean",
    hindiName: "सोयाबीन",
    category: "oilseed",
    season: "Kharif",
    soilParameters: {
      nitrogen: { min: 20, max: 30, optimal: 25, unit: "kg/ha" },
      phosphorus: { min: 60, max: 100, optimal: 80, unit: "kg/ha" },
      potassium: { min: 30, max: 60, optimal: 40, unit: "kg/ha" },
      ph: { min: 6.0, max: 7.5, optimal: 6.5 },
      temperature: { min: 20, max: 35, optimal: 28, unit: "°C" },
      humidity: { min: 60, max: 85, optimal: 70, unit: "%" },
      rainfall: { min: 600, max: 1200, optimal: 850, unit: "mm" },
      organicCarbon: { min: 0.4, max: 1.0, optimal: 0.6, unit: "%" }
    },
    suitableStates: ["Madhya Pradesh", "Maharashtra", "Rajasthan", "Karnataka", "Telangana"],
    soilTypes: ["Black soil", "Clay loam", "Loam", "Well-drained"],
    irrigationType: ["rainfed", "both"],
    avgYield: { value: 1200, unit: "kg/ha" },
    marketPrice: { min: 4600, max: 6000, unit: "₹/quintal" },
    costOfCultivation: { value: 35000, unit: "₹/ha" },
    profitPerHectare: { min: 15000, max: 40000, unit: "₹/ha" },
    waterRequirement: { value: 450, unit: "mm/season" },
    duration: { min: 90, max: 120, unit: "days" },
    bestVarieties: [
      { name: "JS 95-60", yield: "2.0 t/ha", features: "Widely adapted, high yield" },
      { name: "JS 20-34", yield: "2.5 t/ha", features: "Latest release, rust resistant" },
      { name: "NRC 86", yield: "2.0 t/ha", features: "YMV resistant" },
      { name: "MACS 1407", yield: "2.3 t/ha", features: "Girdle beetle resistant" }
    ],
    fertilizers: {
      basal: ["DAP 130kg/ha", "MOP 50kg/ha", "Bradyrhizobium seed treatment"],
      topDressing: ["Not required (BNF crop)"]
    },
    intercropping: ["Pigeon pea (4:2)", "Maize"],
    rotationCrops: ["Wheat", "Chickpea", "Safflower"]
  },
  {
    id: "groundnut",
    crop: "Groundnut",
    hindiName: "मूंगफली",
    category: "oilseed",
    season: "Kharif",
    soilParameters: {
      nitrogen: { min: 15, max: 25, optimal: 20, unit: "kg/ha" },
      phosphorus: { min: 40, max: 80, optimal: 60, unit: "kg/ha" },
      potassium: { min: 30, max: 60, optimal: 45, unit: "kg/ha" },
      ph: { min: 5.5, max: 7.5, optimal: 6.5 },
      temperature: { min: 22, max: 38, optimal: 30, unit: "°C" },
      humidity: { min: 50, max: 80, optimal: 65, unit: "%" },
      rainfall: { min: 500, max: 1000, optimal: 700, unit: "mm" },
      organicCarbon: { min: 0.3, max: 0.8, optimal: 0.5, unit: "%" }
    },
    suitableStates: ["Gujarat", "Rajasthan", "Andhra Pradesh", "Tamil Nadu", "Karnataka", "Maharashtra"],
    soilTypes: ["Sandy loam", "Light loam", "Red soil", "Well-drained"],
    irrigationType: ["rainfed", "both"],
    avgYield: { value: 1800, unit: "kg/ha" },
    marketPrice: { min: 6377, max: 8000, unit: "₹/quintal" },
    costOfCultivation: { value: 40000, unit: "₹/ha" },
    profitPerHectare: { min: 35000, max: 75000, unit: "₹/ha" },
    waterRequirement: { value: 500, unit: "mm/season" },
    duration: { min: 100, max: 135, unit: "days" },
    bestVarieties: [
      { name: "TG 51", yield: "2.5 t/ha", features: "High yield, rust resistant" },
      { name: "Girnar 4", yield: "2.0 t/ha", features: "High oleic acid" },
      { name: "GPBD 4", yield: "2.2 t/ha", features: "Drought tolerant" },
      { name: "GG 20", yield: "2.5 t/ha", features: "Bold pods, high oil (49%)" }
    ],
    fertilizers: {
      basal: ["SSP 250kg/ha", "Gypsum 200kg/ha at pegging", "Rhizobium seed treatment"],
      topDressing: ["Calcium through gypsum at flowering"]
    },
    intercropping: ["Pigeon pea (6:2)", "Castor (6:1)"],
    rotationCrops: ["Wheat", "Rabi sorghum", "Chickpea"]
  },

  // ==================== VEGETABLES ====================
  {
    id: "tomato",
    crop: "Tomato",
    hindiName: "टमाटर",
    category: "vegetable",
    season: "Rabi",
    soilParameters: {
      nitrogen: { min: 100, max: 180, optimal: 150, unit: "kg/ha" },
      phosphorus: { min: 50, max: 100, optimal: 75, unit: "kg/ha" },
      potassium: { min: 50, max: 120, optimal: 80, unit: "kg/ha" },
      ph: { min: 5.5, max: 7.5, optimal: 6.5 },
      temperature: { min: 15, max: 32, optimal: 25, unit: "°C" },
      humidity: { min: 50, max: 80, optimal: 65, unit: "%" },
      rainfall: { min: 400, max: 800, optimal: 600, unit: "mm" },
      organicCarbon: { min: 0.5, max: 1.5, optimal: 0.8, unit: "%" }
    },
    suitableStates: ["Andhra Pradesh", "Karnataka", "Madhya Pradesh", "Maharashtra", "Odisha", "Gujarat", "West Bengal", "Bihar"],
    soilTypes: ["Sandy loam", "Loam", "Well-drained", "Red soil"],
    irrigationType: ["irrigated"],
    avgYield: { value: 25000, unit: "kg/ha" },
    marketPrice: { min: 800, max: 4000, unit: "₹/quintal" },
    costOfCultivation: { value: 120000, unit: "₹/ha" },
    profitPerHectare: { min: 80000, max: 300000, unit: "₹/ha" },
    waterRequirement: { value: 600, unit: "mm/season" },
    duration: { min: 90, max: 140, unit: "days" },
    bestVarieties: [
      { name: "Arka Rakshak", yield: "75 t/ha", features: "ToLCV + bacterial wilt resistant" },
      { name: "Pusa Rohini", yield: "45 t/ha", features: "Determinate, good processing quality" },
      { name: "Arka Samrat", yield: "80 t/ha", features: "Triple disease resistant" },
      { name: "Pusa Sadabahar", yield: "25 t/ha", features: "Heat tolerant, year-round" }
    ],
    fertilizers: {
      basal: ["FYM 25t/ha", "DAP 130kg/ha", "MOP 100kg/ha", "Micronutrients"],
      topDressing: ["Urea 50kg/ha at 30 DAT", "Urea 50kg/ha at 60 DAT", "Potash 50kg/ha at fruiting"]
    },
    intercropping: ["Onion", "Marigold (border crop for pest trap)"],
    rotationCrops: ["Cabbage", "Cauliflower", "Cucumber", "Cereals"]
  },
  {
    id: "potato",
    crop: "Potato",
    hindiName: "आलू",
    category: "vegetable",
    season: "Rabi",
    soilParameters: {
      nitrogen: { min: 120, max: 200, optimal: 150, unit: "kg/ha" },
      phosphorus: { min: 60, max: 120, optimal: 80, unit: "kg/ha" },
      potassium: { min: 80, max: 160, optimal: 120, unit: "kg/ha" },
      ph: { min: 5.0, max: 7.0, optimal: 5.8 },
      temperature: { min: 12, max: 25, optimal: 18, unit: "°C" },
      humidity: { min: 60, max: 85, optimal: 75, unit: "%" },
      rainfall: { min: 500, max: 1000, optimal: 700, unit: "mm" },
      organicCarbon: { min: 0.5, max: 1.5, optimal: 0.8, unit: "%" }
    },
    suitableStates: ["Uttar Pradesh", "West Bengal", "Bihar", "Gujarat", "Madhya Pradesh", "Punjab", "Himachal Pradesh"],
    soilTypes: ["Sandy loam", "Loam", "Light alluvial", "Well-drained"],
    irrigationType: ["irrigated"],
    avgYield: { value: 23000, unit: "kg/ha" },
    marketPrice: { min: 600, max: 2500, unit: "₹/quintal" },
    costOfCultivation: { value: 150000, unit: "₹/ha" },
    profitPerHectare: { min: 50000, max: 200000, unit: "₹/ha" },
    waterRequirement: { value: 500, unit: "mm/season" },
    duration: { min: 75, max: 120, unit: "days" },
    bestVarieties: [
      { name: "Kufri Jyoti", yield: "30 t/ha", features: "Medium duration, wide adaptability" },
      { name: "Kufri Pukhraj", yield: "35 t/ha", features: "Early maturing, high yield" },
      { name: "Kufri Badshah", yield: "40 t/ha", features: "Late blight tolerant" },
      { name: "Kufri Lima", yield: "35 t/ha", features: "Processing quality, chips grade" }
    ],
    fertilizers: {
      basal: ["FYM 25t/ha", "DAP 170kg/ha", "MOP 200kg/ha", "ZnSO4 25kg/ha"],
      topDressing: ["Urea 100kg/ha at earthing up (30-35 DAP)"]
    },
    intercropping: ["Mustard (border)", "Wheat (relay cropping)"],
    rotationCrops: ["Rice", "Maize", "Mung bean", "Sugarcane"]
  },
  {
    id: "onion",
    crop: "Onion",
    hindiName: "प्याज",
    category: "vegetable",
    season: "Rabi",
    soilParameters: {
      nitrogen: { min: 80, max: 150, optimal: 110, unit: "kg/ha" },
      phosphorus: { min: 40, max: 80, optimal: 60, unit: "kg/ha" },
      potassium: { min: 50, max: 100, optimal: 60, unit: "kg/ha" },
      ph: { min: 6.0, max: 7.5, optimal: 6.8 },
      temperature: { min: 13, max: 30, optimal: 22, unit: "°C" },
      humidity: { min: 50, max: 80, optimal: 65, unit: "%" },
      rainfall: { min: 500, max: 900, optimal: 650, unit: "mm" },
      organicCarbon: { min: 0.5, max: 1.2, optimal: 0.7, unit: "%" }
    },
    suitableStates: ["Maharashtra", "Karnataka", "Madhya Pradesh", "Gujarat", "Rajasthan", "Bihar", "Andhra Pradesh"],
    soilTypes: ["Sandy loam", "Loam", "Clay loam", "Well-drained alluvial"],
    irrigationType: ["irrigated"],
    avgYield: { value: 20000, unit: "kg/ha" },
    marketPrice: { min: 500, max: 5000, unit: "₹/quintal" },
    costOfCultivation: { value: 100000, unit: "₹/ha" },
    profitPerHectare: { min: 0, max: 400000, unit: "₹/ha" },
    waterRequirement: { value: 450, unit: "mm/season" },
    duration: { min: 120, max: 150, unit: "days" },
    bestVarieties: [
      { name: "NHRDF Red", yield: "30 t/ha", features: "Dark red, good storage" },
      { name: "Arka Kalyan", yield: "25 t/ha", features: "Light red, uniform bulbs" },
      { name: "Agrifound Dark Red", yield: "32 t/ha", features: "Dark red, pungent" },
      { name: "Bhima Super", yield: "35 t/ha", features: "High yield Kharif variety" }
    ],
    fertilizers: {
      basal: ["FYM 20t/ha", "DAP 130kg/ha", "MOP 65kg/ha", "Sulphur 30kg/ha"],
      topDressing: ["Urea 65kg/ha at 30 DAT", "Urea 35kg/ha at 45 DAT"]
    },
    intercropping: ["Not recommended (onion is a sole crop)"],
    rotationCrops: ["Okra", "Rice", "Groundnut", "Maize"]
  },

  // ==================== COMMERCIAL / FIBER ====================
  {
    id: "cotton",
    crop: "Cotton",
    hindiName: "कपास",
    category: "fiber",
    season: "Kharif",
    soilParameters: {
      nitrogen: { min: 60, max: 120, optimal: 80, unit: "kg/ha" },
      phosphorus: { min: 30, max: 60, optimal: 40, unit: "kg/ha" },
      potassium: { min: 30, max: 60, optimal: 40, unit: "kg/ha" },
      ph: { min: 6.0, max: 8.5, optimal: 7.5 },
      temperature: { min: 20, max: 40, optimal: 30, unit: "°C" },
      humidity: { min: 40, max: 80, optimal: 60, unit: "%" },
      rainfall: { min: 500, max: 1200, optimal: 800, unit: "mm" },
      organicCarbon: { min: 0.3, max: 0.8, optimal: 0.5, unit: "%" }
    },
    suitableStates: ["Gujarat", "Maharashtra", "Telangana", "Karnataka", "Andhra Pradesh", "Madhya Pradesh", "Rajasthan", "Haryana", "Punjab"],
    soilTypes: ["Black soil", "Alluvial", "Sandy loam", "Clay loam"],
    irrigationType: ["rainfed", "both"],
    avgYield: { value: 500, unit: "kg lint/ha" },
    marketPrice: { min: 6620, max: 8500, unit: "₹/quintal" },
    costOfCultivation: { value: 55000, unit: "₹/ha" },
    profitPerHectare: { min: 15000, max: 50000, unit: "₹/ha" },
    waterRequirement: { value: 700, unit: "mm/season" },
    duration: { min: 150, max: 200, unit: "days" },
    bestVarieties: [
      { name: "Bt Cotton (Bollgard II)", yield: "2.5 t/ha kapas", features: "Bollworm resistant" },
      { name: "Suraj (non-Bt desi)", yield: "1.5 t/ha", features: "Desi cotton, drought tolerant" },
      { name: "NH 615", yield: "2.0 t/ha", features: "Good fiber quality" },
      { name: "RCH 2 Bt", yield: "2.5 t/ha", features: "Widely adapted Bt hybrid" }
    ],
    fertilizers: {
      basal: ["DAP 87kg/ha", "MOP 50kg/ha"],
      topDressing: ["Urea 55kg/ha at squaring", "Urea 55kg/ha at boll development", "MgSO4 foliar spray"]
    },
    intercropping: ["Green gram (1:1)", "Soybean (1:2)", "Groundnut"],
    rotationCrops: ["Wheat", "Chickpea", "Sorghum"]
  },
  {
    id: "sugarcane",
    crop: "Sugarcane",
    hindiName: "गन्ना",
    category: "commercial",
    season: "Perennial",
    soilParameters: {
      nitrogen: { min: 150, max: 300, optimal: 200, unit: "kg/ha" },
      phosphorus: { min: 60, max: 100, optimal: 80, unit: "kg/ha" },
      potassium: { min: 60, max: 120, optimal: 80, unit: "kg/ha" },
      ph: { min: 5.5, max: 8.5, optimal: 6.5 },
      temperature: { min: 20, max: 38, optimal: 30, unit: "°C" },
      humidity: { min: 60, max: 90, optimal: 75, unit: "%" },
      rainfall: { min: 1000, max: 2000, optimal: 1500, unit: "mm" },
      organicCarbon: { min: 0.5, max: 1.5, optimal: 0.8, unit: "%" }
    },
    suitableStates: ["Uttar Pradesh", "Maharashtra", "Karnataka", "Tamil Nadu", "Gujarat", "Andhra Pradesh", "Punjab", "Haryana", "Bihar"],
    soilTypes: ["Loam", "Clay loam", "Alluvial", "Black soil"],
    irrigationType: ["irrigated"],
    avgYield: { value: 80000, unit: "kg/ha" },
    marketPrice: { min: 315, max: 400, unit: "₹/quintal (FRP)" },
    costOfCultivation: { value: 150000, unit: "₹/ha" },
    profitPerHectare: { min: 50000, max: 200000, unit: "₹/ha" },
    waterRequirement: { value: 2000, unit: "mm/season" },
    duration: { min: 300, max: 420, unit: "days" },
    bestVarieties: [
      { name: "Co 0238", yield: "100 t/ha", features: "Most popular variety in India" },
      { name: "Co 86032", yield: "90 t/ha", features: "High sugar recovery" },
      { name: "CoS 767", yield: "85 t/ha", features: "Early maturing" },
      { name: "Co 0118", yield: "95 t/ha", features: "Subtropical zone, high CCS" }
    ],
    fertilizers: {
      basal: ["FYM 25t/ha", "DAP 150kg/ha", "MOP 80kg/ha"],
      topDressing: ["Urea 130kg/ha at 30-45 DAP", "Urea 130kg/ha at 60-75 DAP"]
    },
    intercropping: ["Potato (autumn planted)", "Wheat", "Mustard", "Onion"],
    rotationCrops: ["Rice", "Wheat (after ratoon)"]
  },

  // ==================== SPICES ====================
  {
    id: "turmeric",
    crop: "Turmeric",
    hindiName: "हल्दी",
    category: "spice",
    season: "Kharif",
    soilParameters: {
      nitrogen: { min: 60, max: 120, optimal: 90, unit: "kg/ha" },
      phosphorus: { min: 30, max: 60, optimal: 45, unit: "kg/ha" },
      potassium: { min: 60, max: 120, optimal: 90, unit: "kg/ha" },
      ph: { min: 5.0, max: 7.5, optimal: 6.5 },
      temperature: { min: 20, max: 35, optimal: 28, unit: "°C" },
      humidity: { min: 60, max: 90, optimal: 75, unit: "%" },
      rainfall: { min: 1000, max: 2000, optimal: 1500, unit: "mm" },
      organicCarbon: { min: 0.5, max: 1.5, optimal: 0.8, unit: "%" }
    },
    suitableStates: ["Telangana", "Andhra Pradesh", "Tamil Nadu", "Maharashtra", "Odisha", "Karnataka", "West Bengal", "Assam"],
    soilTypes: ["Sandy loam", "Loam", "Clay loam", "Rich in organic matter"],
    irrigationType: ["rainfed", "both"],
    avgYield: { value: 7000, unit: "kg fresh/ha" },
    marketPrice: { min: 8000, max: 15000, unit: "₹/quintal (dry)" },
    costOfCultivation: { value: 120000, unit: "₹/ha" },
    profitPerHectare: { min: 80000, max: 250000, unit: "₹/ha" },
    waterRequirement: { value: 1200, unit: "mm/season" },
    duration: { min: 240, max: 300, unit: "days" },
    bestVarieties: [
      { name: "Pratibha (IISR)", yield: "37 t/ha fresh", features: "High curcumin (6.4%)" },
      { name: "Salem Lakadong", yield: "20 t/ha", features: "Very high curcumin (7%)" },
      { name: "Suroma", yield: "25 t/ha", features: "Bold fingers, good colour" },
      { name: "Prabha", yield: "30 t/ha", features: "High oleoresin content" }
    ],
    fertilizers: {
      basal: ["FYM 25t/ha", "DAP 100kg/ha", "MOP 100kg/ha"],
      topDressing: ["Urea 55kg/ha at 45 DAP", "Urea 55kg/ha at 90 DAP"]
    },
    intercropping: ["Chilli", "Onion", "Vegetables (inter-row)", "Coconut (as intercrop)"],
    rotationCrops: ["Rice", "Maize", "Vegetables"]
  }
];

// ============ HELPER / RECOMMENDATION FUNCTIONS ============

export const getRecommendationBySoil = (
  nitrogen: number,
  phosphorus: number,
  potassium: number,
  ph: number,
  temperature: number,
  humidity: number,
  rainfall: number
): { crop: CropRecommendationData; score: number }[] => {
  return cropRecommendations
    .map(crop => {
      const sp = crop.soilParameters;
      let score = 0;
      const maxScore = 7;

      if (nitrogen >= sp.nitrogen.min && nitrogen <= sp.nitrogen.max) score++;
      if (phosphorus >= sp.phosphorus.min && phosphorus <= sp.phosphorus.max) score++;
      if (potassium >= sp.potassium.min && potassium <= sp.potassium.max) score++;
      if (ph >= sp.ph.min && ph <= sp.ph.max) score++;
      if (temperature >= sp.temperature.min && temperature <= sp.temperature.max) score++;
      if (humidity >= sp.humidity.min && humidity <= sp.humidity.max) score++;
      if (rainfall >= sp.rainfall.min && rainfall <= sp.rainfall.max) score++;

      return { crop, score: Math.round((score / maxScore) * 100) };
    })
    .filter(r => r.score >= 50)
    .sort((a, b) => b.score - a.score);
};

export const getCropsByCategory = (category: CropRecommendationData["category"]): CropRecommendationData[] =>
  cropRecommendations.filter(c => c.category === category);

export const getCropsBySeason = (season: CropRecommendationData["season"]): CropRecommendationData[] =>
  cropRecommendations.filter(c => c.season === season);

export const getCropsByState = (state: string): CropRecommendationData[] =>
  cropRecommendations.filter(c =>
    c.suitableStates.some(s => s.toLowerCase() === state.toLowerCase())
  );

export const getHighProfitCrops = (): CropRecommendationData[] =>
  cropRecommendations
    .filter(c => c.profitPerHectare.max > 50000)
    .sort((a, b) => b.profitPerHectare.max - a.profitPerHectare.max);

export const getLowWaterCrops = (): CropRecommendationData[] =>
  cropRecommendations
    .filter(c => c.waterRequirement.value <= 400)
    .sort((a, b) => a.waterRequirement.value - b.waterRequirement.value);
