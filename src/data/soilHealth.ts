// Soil Health Dataset
// Sources: ICAR Soil Health Card scheme, IISS Bhopal norms, NBSS&LUP soil maps,
// Fertiliser Control Order standards, GoI Soil Health Management guidelines

import { createDatasetMetadata } from "./datasetMetadata";

export interface SoilHealthParameter {
  id: string;
  name: string;
  unit: string;
  method: string;            // Standard analytical method used in India
  ranges: {
    category: "Low" | "Medium" | "High" | "Very High";
    min: number;
    max: number;
    color: string;           // hex for UI
    interpretation: string;
    recommendation: string;
  }[];
  deficiencySymptoms: string;
  toxicityThreshold?: number;
  criticalLevel: number;     // Below this = deficiency confirmed
}

export interface SoilType {
  id: string;
  name: string;
  localName: string;
  regions: string[];
  color: string;
  texture: string;
  pH: { min: number; max: number; typical: number };
  organicCarbon: { min: number; max: number };  // %
  CEC: { min: number; max: number };            // cmol/kg
  AWC: { min: number; max: number };            // mm/m available water capacity
  permeability: string;
  drainage: string;
  suitableCrops: string[];
  limitations: string[];
  management: string[];
  area_mha: number;          // million hectares in India (NBSS&LUP)
}

export interface FertilizerRecommendation {
  cropName: string;
  soilType: string;
  season: string;
  NPK: { N: number; P: number; K: number };   // kg/ha
  Micronutrients: { name: string; dose: string; method: string }[];
  organicManure: { type: string; dose: string; timing: string };
  splitApplication: { stage: string; nutrients: string }[];
  notes: string;
}

export interface MicronutrientStatus {
  nutrient: string;
  symbol: string;
  deficientStates: string[];   // States with high % deficient soils
  deficientArea_mha: number;
  criticalLevel: string;
  deficiencySymptoms: string;
  correctiveMeasure: string;
  dose: string;
  timing: string;
  crops: string[];
}

export const soilHealthMetadata = createDatasetMetadata({
  version: "1.0.0",
  lastUpdated: "2024-11-15T00:00:00Z",
  source: "ICAR SHC, IISS Bhopal, NBSS&LUP",
  notes: "Aligned with GoI Soil Health Card scheme parameters.",
});

// ===================== SOIL HEALTH CARD PARAMETERS =====================
// Based on GoI SHC scheme — 12 mandatory parameters

export const soilHealthParameters: SoilHealthParameter[] = [
  {
    id: "pH",
    name: "Soil pH",
    unit: "pH units",
    method: "1:2.5 soil:water suspension (IS:11686)",
    ranges: [
      { category: "Low",       min: 0,    max: 5.5,  color: "#F44336", interpretation: "Strongly/Very Strongly Acidic — Al/Mn toxicity likely, P fixation", recommendation: "Apply agricultural lime @ 2-4 t/ha, use acid-tolerant varieties" },
      { category: "Medium",    min: 5.5,  max: 6.5,  color: "#FF9800", interpretation: "Moderately Acidic — some nutrient availability issues",              recommendation: "Apply lime @ 1-2 t/ha, monitor micronutrients" },
      { category: "High",      min: 6.5,  max: 7.5,  color: "#4CAF50", interpretation: "Near Neutral — ideal for most crops",                               recommendation: "Maintain with balanced fertilization and organic matter" },
      { category: "Very High", min: 7.5,  max: 8.5,  color: "#FF9800", interpretation: "Mildly Alkaline — P, Fe, Zn availability reduced",                  recommendation: "Apply gypsum, use acidifying fertilizers (ammonium sulphate)" },
      { category: "Low",       min: 8.5,  max: 14,   color: "#9C27B0", interpretation: "Strongly Alkaline (Usar/Sodic) — Na toxicity, poor structure",      recommendation: "Apply gypsum 5-10 t/ha + organic matter, grow salt-tolerant crops" },
    ],
    deficiencySymptoms: "Indirect — causes nutrient imbalance (acidic soils: Fe/Al toxicity, P locking; alkaline: Fe/Mn/Zn unavailability)",
    criticalLevel: 6.5,
  },
  {
    id: "EC",
    name: "Electrical Conductivity",
    unit: "dS/m",
    method: "1:2.5 soil:water suspension conductivity meter (Richards, 1954)",
    ranges: [
      { category: "Low",       min: 0,    max: 0.25, color: "#4CAF50", interpretation: "Non-saline — no salinity problem",                           recommendation: "Normal crop management" },
      { category: "Medium",    min: 0.25, max: 0.75, color: "#8BC34A", interpretation: "Very slightly saline — slight salinity, no yield loss",      recommendation: "Monitor, improve drainage, use organic matter" },
      { category: "High",      min: 0.75, max: 2.0,  color: "#FFC107", interpretation: "Slightly saline — 10-25% yield loss in sensitive crops",     recommendation: "Leach salts with quality water, avoid furrow irrigation" },
      { category: "Very High", min: 2.0,  max: 100,  color: "#F44336", interpretation: "Moderately to Strongly Saline — severe yield reduction",     recommendation: "Reclamation: leaching + gypsum + salt-tolerant varieties (barley, sugar beet)" },
    ],
    deficiencySymptoms: "High EC: wilting despite adequate water (osmotic stress), white salt crust on soil surface, margin/tip scorch",
    criticalLevel: 2.0,
  },
  {
    id: "OC",
    name: "Organic Carbon",
    unit: "%",
    method: "Walkley-Black wet oxidation method (Jackson, 1973)",
    ranges: [
      { category: "Low",       min: 0,    max: 0.5,  color: "#F44336", interpretation: "Low OC — poor soil health, low water holding, low microbial activity", recommendation: "Apply FYM 10-15 t/ha, compost, green manure; reduce tillage" },
      { category: "Medium",    min: 0.5,  max: 0.75, color: "#FF9800", interpretation: "Medium OC — moderate soil health",                                     recommendation: "Maintain with 5-8 t/ha FYM annually + crop residue incorporation" },
      { category: "High",      min: 0.75, max: 100,  color: "#4CAF50", interpretation: "High OC — good soil health, good nutrient holding capacity",            recommendation: "Continue organic management, consider reduced chemical inputs" },
    ],
    deficiencySymptoms: "Low organic matter: pale/yellowish soil, crust formation after rain, poor tilth, low nutrient availability",
    criticalLevel: 0.50,
  },
  {
    id: "N",
    name: "Available Nitrogen",
    unit: "kg/ha",
    method: "Alkaline permanganate method (Subbiah & Asija, 1956)",
    ranges: [
      { category: "Low",       min: 0,   max: 280,  color: "#F44336", interpretation: "Low N — definite nitrogen response expected",                 recommendation: "Increase N dose by 25%, apply as split, use LCC for rice" },
      { category: "Medium",    min: 280, max: 560,  color: "#FF9800", interpretation: "Medium N — moderate response",                               recommendation: "Apply recommended N dose, top-dress at critical stages" },
      { category: "High",      min: 560, max: 9999, color: "#4CAF50", interpretation: "High N — reduce N dose by 20-25%",                           recommendation: "Reduce N, watch for lodging risk in cereals" },
    ],
    deficiencySymptoms: "Yellowing (chlorosis) from older/lower leaves upward, stunted growth, thin spindly stems, early maturity",
    criticalLevel: 280,
  },
  {
    id: "P",
    name: "Available Phosphorus (Olsen's P)",
    unit: "kg/ha",
    method: "Olsen's method (0.5M NaHCO3 extraction, Olsen 1954) — standard for alkaline soils",
    ranges: [
      { category: "Low",       min: 0,   max: 10,   color: "#F44336", interpretation: "Low P — definite phosphate response expected",               recommendation: "Apply full recommended P dose as DAP/SSP" },
      { category: "Medium",    min: 10,  max: 25,   color: "#FF9800", interpretation: "Medium P — moderate response likely",                       recommendation: "Apply 50-75% recommended P dose" },
      { category: "High",      min: 25,  max: 9999, color: "#4CAF50", interpretation: "High P — good residual phosphorus",                         recommendation: "Reduce P application, monitor for Zn/Fe antagonism" },
    ],
    deficiencySymptoms: "Purple/reddish coloration on older leaves (anthocyanin), delayed maturity, poor root development, sparse tillering in cereals",
    criticalLevel: 10,
  },
  {
    id: "K",
    name: "Available Potassium",
    unit: "kg/ha",
    method: "Neutral normal ammonium acetate extraction (Jackson, 1973)",
    ranges: [
      { category: "Low",       min: 0,   max: 108,  color: "#F44336", interpretation: "Low K — potassium response expected",                       recommendation: "Apply MOP (60% K2O) or SOP (50% K2O) as recommended" },
      { category: "Medium",    min: 108, max: 280,  color: "#FF9800", interpretation: "Medium K — marginal response possible",                     recommendation: "Apply 50% recommended K dose" },
      { category: "High",      min: 280, max: 9999, color: "#4CAF50", interpretation: "High K — no response expected",                             recommendation: "Skip K in this season, verify with crop response" },
    ],
    deficiencySymptoms: "Scorching/firing of leaf margins and tips (marginal necrosis) from older leaves, lodging in cereals, reduced grain quality",
    criticalLevel: 108,
  },
  {
    id: "S",
    name: "Available Sulphur",
    unit: "mg/kg (ppm)",
    method: "0.15% CaCl2 extraction, turbidimetric method (Chesnin & Yien, 1951)",
    ranges: [
      { category: "Low",       min: 0,  max: 10,   color: "#F44336", interpretation: "Low S — definite sulphur deficiency, oil crops respond strongly", recommendation: "Apply gypsum 200-400 kg/ha or ammonium sulphate as N source" },
      { category: "Medium",    min: 10, max: 20,   color: "#FF9800", interpretation: "Medium S — marginal deficiency in some crops",                   recommendation: "Apply sulphur-containing fertilizers (SSP, ammonium sulphate)" },
      { category: "High",      min: 20, max: 9999, color: "#4CAF50", interpretation: "Adequate S — no sulphur application needed",                     recommendation: "Monitor; apply for oilseeds cropping systems" },
    ],
    deficiencySymptoms: "Yellowing of young/new leaves (unlike N — affects new leaves first), restricted growth, reduced oil content in oilseeds",
    criticalLevel: 10,
  },
  {
    id: "Zn",
    name: "DTPA Extractable Zinc",
    unit: "mg/kg (ppm)",
    method: "DTPA chelate extraction (Lindsay & Norvell, 1978) — pH 7.3",
    ranges: [
      { category: "Low",       min: 0,    max: 0.6,  color: "#F44336", interpretation: "Zn deficient — Khaira disease in rice, narrow brown stripe in maize", recommendation: "Apply ZnSO4·7H2O @ 25 kg/ha soil or 0.5% ZnSO4 foliar spray 2-3 times" },
      { category: "Medium",    min: 0.6,  max: 1.2,  color: "#FF9800", interpretation: "Borderline Zn — apply if sensitive crop (rice, maize)",               recommendation: "Apply ZnSO4 @ 12.5 kg/ha as precaution" },
      { category: "High",      min: 1.2,  max: 9999, color: "#4CAF50", interpretation: "Adequate Zn",                                                          recommendation: "No Zn application needed; verify with soil pH" },
    ],
    deficiencySymptoms: "Rice: Khaira (bronzing/browning lower leaves, stunted). Maize: white streaks. Wheat: browning, striping. Citrus: mottle leaf.",
    criticalLevel: 0.6,
    toxicityThreshold: 300,
  },
  {
    id: "Fe",
    name: "DTPA Extractable Iron",
    unit: "mg/kg (ppm)",
    method: "DTPA chelate extraction (Lindsay & Norvell, 1978)",
    ranges: [
      { category: "Low",       min: 0,  max: 4.5,  color: "#F44336", interpretation: "Fe deficient — affects high pH/calcareous soils",             recommendation: "Apply FeSO4 @ 25 kg/ha or 0.5% FeSO4 + 0.1% citric acid foliar" },
      { category: "Medium",    min: 4.5, max: 10,  color: "#FF9800", interpretation: "Borderline — may respond in sensitive crops on calcareous soil", recommendation: "Foliar FeSO4 0.5% for responsive crops (rice on high pH)" },
      { category: "High",      min: 10, max: 9999, color: "#4CAF50", interpretation: "Adequate Fe",                                                    recommendation: "No Fe application" },
    ],
    deficiencySymptoms: "Interveinal chlorosis of young leaves (leaves yellow, veins remain green — inverse of Mg). Severe in rice on calcareous soils.",
    criticalLevel: 4.5,
  },
  {
    id: "Mn",
    name: "DTPA Extractable Manganese",
    unit: "mg/kg (ppm)",
    method: "DTPA chelate extraction (Lindsay & Norvell, 1978)",
    ranges: [
      { category: "Low",       min: 0,    max: 2.0,  color: "#F44336", interpretation: "Mn deficient — mainly on well-drained, high pH soils",   recommendation: "Apply MnSO4 @ 10-25 kg/ha or 0.3-0.4% MnSO4 foliar spray" },
      { category: "Medium",    min: 2.0,  max: 5.0,  color: "#FF9800", interpretation: "Borderline Mn",                                          recommendation: "Apply foliar MnSO4 0.3% for oats, soybean, wheat on calcareous soil" },
      { category: "High",      min: 5.0,  max: 9999, color: "#4CAF50", interpretation: "Adequate Mn",                                            recommendation: "No Mn application; watch for toxicity in acidic soils" },
    ],
    deficiencySymptoms: "Grey speck in oats, speckled leaf in soybean; interveinal chlorosis. Toxicity in acid soils: brown spots, crinkled leaves.",
    criticalLevel: 2.0,
    toxicityThreshold: 200,
  },
  {
    id: "Cu",
    name: "DTPA Extractable Copper",
    unit: "mg/kg (ppm)",
    method: "DTPA chelate extraction (Lindsay & Norvell, 1978)",
    ranges: [
      { category: "Low",       min: 0,    max: 0.2,  color: "#F44336", interpretation: "Cu deficient — reclaimed soils, high OC soils most prone", recommendation: "Apply CuSO4 @ 5 kg/ha once in 3 years or 0.2% CuSO4 foliar" },
      { category: "Medium",    min: 0.2,  max: 0.5,  color: "#FF9800", interpretation: "Borderline Cu",                                           recommendation: "Apply foliar CuSO4 for rice, wheat on affected soils" },
      { category: "High",      min: 0.5,  max: 9999, color: "#4CAF50", interpretation: "Adequate Cu",                                             recommendation: "No Cu needed. Fungicide-sprayed soils may accumulate" },
    ],
    deficiencySymptoms: "Pale, bluish-green leaves that wilt easily; die-back of tips. Grain production severely affected. Common in peat/organic soils.",
    criticalLevel: 0.2,
    toxicityThreshold: 20,
  },
  {
    id: "B",
    name: "Hot Water Soluble Boron",
    unit: "mg/kg (ppm)",
    method: "Hot water extraction (Berger & Truog, 1939), azomethine-H colorimetry",
    ranges: [
      { category: "Low",       min: 0,    max: 0.5,  color: "#F44336", interpretation: "B deficient — affects oilseeds, cotton, sunflower, sugarcane critically", recommendation: "Apply Borax @ 5-10 kg/ha soil or 0.2% borax foliar spray at flowering" },
      { category: "Medium",    min: 0.5,  max: 1.0,  color: "#FF9800", interpretation: "Borderline B — may affect reproductive stage of sensitive crops",          recommendation: "Apply Borax @ 2-5 kg/ha for cotton, mustard, groundnut" },
      { category: "High",      min: 1.0,  max: 9999, color: "#4CAF50", interpretation: "Adequate B",                                                               recommendation: "No B needed; narrow range between deficiency and toxicity" },
    ],
    deficiencySymptoms: "Death of growing point ('heart rot' in beet), hollow stem in crucifers, poor fruit set, cracked petioles, sugar beet black heart.",
    criticalLevel: 0.5,
    toxicityThreshold: 5,
  },
];

// ===================== SOIL TYPES OF INDIA =====================
// NBSS&LUP (National Bureau of Soil Survey & Land Use Planning) classification

export const indianSoilTypes: SoilType[] = [
  {
    id: "alluvial",
    name: "Alluvial Soil",
    localName: "Khadar / Bangar",
    regions: ["Punjab", "Haryana", "Uttar Pradesh", "Bihar", "West Bengal", "Assam", "Odisha coastal", "Rajasthan (Ganges valley)"],
    color: "#D2B48C",
    texture: "Sandy loam to clay loam; Khadar (new alluvium, sandy) vs Bangar (old alluvium, more clay)",
    pH: { min: 6.0, max: 8.5, typical: 7.2 },
    organicCarbon: { min: 0.3, max: 0.8 },
    CEC: { min: 10, max: 25 },
    AWC: { min: 120, max: 180 },
    permeability: "Moderate",
    drainage: "Well to moderately drained; waterlogging in low-lying areas",
    suitableCrops: ["Wheat", "Rice", "Sugarcane", "Maize", "Mustard", "Potato", "Vegetables"],
    limitations: ["Zinc deficiency common", "Potassium may be low", "Flooding risk in Khadar"],
    management: ["Add organic matter (FYM 10-12 t/ha)", "Apply ZnSO4 25 kg/ha every 2 years", "Raise beds for drainage"],
    area_mha: 143,
  },
  {
    id: "black",
    name: "Black Soil (Regur/Vertisol)",
    localName: "Regur / Kali Mitti",
    regions: ["Maharashtra", "Madhya Pradesh", "Gujarat", "Andhra Pradesh", "Karnataka", "Tamil Nadu (small area)"],
    color: "#2C2C2C",
    texture: "Heavy clay (>35% clay), montmorillonite dominant — shrinks, cracks when dry, swells when wet",
    pH: { min: 7.5, max: 8.5, typical: 8.0 },
    organicCarbon: { min: 0.4, max: 1.0 },
    CEC: { min: 25, max: 50 },
    AWC: { min: 150, max: 250 },
    permeability: "Very slow — impermeable when wet",
    drainage: "Imperfect — waterlogged in rainy season, cracking in dry season",
    suitableCrops: ["Cotton", "Soybean", "Jowar", "Sunflower", "Wheat (irrigation)", "Chickpea", "Sugarcane"],
    limitations: ["Sticky and plastic when wet (difficult tillage)", "Boron and sulphur deficiency", "High pH limits micronutrients", "Tillage window very narrow"],
    management: ["Deep ploughing in summer (crack utilisation)", "Broad-bed furrow (BBF) system for drainage", "Apply gypsum for structure improvement", "Borax + ZnSO4"],
    area_mha: 73,
  },
  {
    id: "red_yellow",
    name: "Red and Yellow Soil",
    localName: "Lal Mitti",
    regions: ["Andhra Pradesh", "Telangana", "Tamil Nadu", "Karnataka", "Odisha", "Jharkhand", "Chhattisgarh", "Maharashtra (eastern fringe)"],
    color: "#C0392B",
    texture: "Sandy loam to clay loam; red due to ferric oxide (Fe2O3) coating",
    pH: { min: 5.5, max: 7.5, typical: 6.5 },
    organicCarbon: { min: 0.2, max: 0.6 },
    CEC: { min: 5, max: 15 },
    AWC: { min: 80, max: 120 },
    permeability: "Moderate to high",
    drainage: "Well-drained",
    suitableCrops: ["Groundnut", "Jowar", "Bajra", "Ragi", "Cotton", "Tobacco", "Oilseeds", "Vegetables"],
    limitations: ["Low N, P, K and OC", "Zinc and boron deficient", "Low water holding capacity", "Drought prone"],
    management: ["Intensive organic matter additions", "Apply lime where acidic", "Mulching to conserve moisture", "Micronutrient packages (Zn+B)"],
    area_mha: 61,
  },
  {
    id: "laterite",
    name: "Laterite Soil (Oxisol/Ultisol)",
    localName: "Laterite",
    regions: ["Kerala", "West Bengal (Burdwan/Bankura)", "Odisha (coastal)", "Northeast India", "Meghalaya", "Karnataka (Western Ghats)"],
    color: "#8B4513",
    texture: "Sandy to loamy; hard laterite crust forms on surface; low clay activity",
    pH: { min: 4.5, max: 6.0, typical: 5.2 },
    organicCarbon: { min: 0.8, max: 2.5 },
    CEC: { min: 3, max: 10 },
    AWC: { min: 50, max: 100 },
    permeability: "High — rapid drainage",
    drainage: "Excessive — drought prone",
    suitableCrops: ["Tea", "Coffee", "Rubber", "Cashew", "Coconut", "Pineapple", "Tapioca", "Vegetables"],
    limitations: ["Strong P fixation by Fe/Al hydrous oxides", "Low CEC — nutrients leach", "Al/Mn toxicity", "Very low K, Ca, Mg"],
    management: ["Lime heavily (2-4 t/ha) to raise pH", "Large quantities of organic matter", "Frequent split fertilizer applications", "Phosphate solubilising bacteria"],
    area_mha: 13,
  },
  {
    id: "arid_desert",
    name: "Arid/Desert Soil (Aridisol)",
    localName: "Retily Mitti / Balu Mitti",
    regions: ["Rajasthan (west of Aravallis)", "Gujarat (Rann of Kutch)", "Haryana (SW fringe)"],
    color: "#F4D03F",
    texture: "Sandy to loamy sand; high sand content, low clay, aeolian (wind-deposited)",
    pH: { min: 7.5, max: 9.0, typical: 8.2 },
    organicCarbon: { min: 0.1, max: 0.3 },
    CEC: { min: 2, max: 8 },
    AWC: { min: 30, max: 70 },
    permeability: "Very high — rapid infiltration",
    drainage: "Excessive — very low water retention",
    suitableCrops: ["Bajra", "Moth bean", "Guar (Cluster bean)", "Jowar", "Ber", "Ker", "Khejri (Prosopis cineraria)"],
    limitations: ["Very low water holding capacity", "Very low OM and NPK", "Prone to wind erosion", "Saline patches common", "Calcrete (calcium carbonate) layers impede roots"],
    management: ["Shelter belts (Prosopis/Acacia)", "Mulching with crop residues", "Rainwater harvesting (tanka, khadin)", "Organic matter addition critical", "Drip irrigation for any cultivation"],
    area_mha: 32,
  },
  {
    id: "mountain",
    name: "Mountain/Forest Soil",
    localName: "Pahadi Mitti",
    regions: ["Uttarakhand", "Himachal Pradesh", "Arunachal Pradesh", "Sikkim", "Nagaland", "Manipur", "J&K", "Darjeeling"],
    color: "#5D4037",
    texture: "Loamy to clayey; highly variable; rich humus in upper layers",
    pH: { min: 4.5, max: 7.0, typical: 5.8 },
    organicCarbon: { min: 1.5, max: 5.0 },
    CEC: { min: 15, max: 35 },
    AWC: { min: 150, max: 250 },
    permeability: "Moderate",
    drainage: "Well-drained on slopes; saturated in valleys",
    suitableCrops: ["Apple", "Pear", "Apricot", "Walnut", "Tea", "Cardamom", "Potato", "Vegetables"],
    limitations: ["Shallow on steep slopes", "Soil erosion risk", "P fixation", "Cold temperatures limit season", "Small fragmented plots"],
    management: ["Contour farming + terrace building", "Cover crops to prevent erosion", "Organic farming with compost", "Avoid soil disturbance on slopes"],
    area_mha: 27,
  },
];

// ===================== MICRONUTRIENT DEFICIENCY STATUS =====================
// Based on ICAR/NRSC national surveys and Fertiliser Association of India data

export const micronutrientStatus: MicronutrientStatus[] = [
  {
    nutrient: "Zinc",
    symbol: "Zn",
    deficientStates: ["Uttar Pradesh", "Bihar", "West Bengal", "Odisha", "Punjab", "Haryana", "Maharashtra", "Madhya Pradesh"],
    deficientArea_mha: 49.7,
    criticalLevel: "< 0.6 mg/kg (DTPA)",
    deficiencySymptoms: "Khaira disease (rice): bronzing, white chlorosis, stunting. Maize: broad white/grey stripes on leaves. Wheat: leaf whitening, browning of leaves.",
    correctiveMeasure: "ZnSO4·7H2O (21% Zn) or ZnSO4·H2O (33% Zn)",
    dose: "Soil: 25 kg ZnSO4/ha every 2-3 years. Foliar: 0.5% ZnSO4 + 0.25% Ca(OH)2 spray 2-3 times.",
    timing: "At planting (soil) or at early vegetative stage (foliar)",
    crops: ["Rice", "Wheat", "Maize", "Cotton", "Sugarcane", "Citrus"]
  },
  {
    nutrient: "Boron",
    symbol: "B",
    deficientStates: ["Odisha", "West Bengal", "Bihar", "Assam", "Uttar Pradesh", "Maharashtra", "Kerala"],
    deficientArea_mha: 33.6,
    criticalLevel: "< 0.5 mg/kg (Hot water soluble)",
    deficiencySymptoms: "Hollow stem in cauliflower/broccoli, internal browning of turnip, poor pod/fruit set in mustard/groundnut/cotton, cracked petiole in celery, heart rot in beet.",
    correctiveMeasure: "Borax (10.5% B) or Boric Acid (17% B) or Solubor (20% B)",
    dose: "Soil: 5-10 kg Borax/ha. Foliar: 0.2% Borax solution at flowering stage.",
    timing: "At sowing/transplanting OR at pre-flowering stage",
    crops: ["Mustard", "Groundnut", "Cotton", "Sunflower", "Sugarcane", "Vegetables", "Fruits"]
  },
  {
    nutrient: "Iron",
    symbol: "Fe",
    deficientStates: ["Punjab", "Haryana", "Rajasthan", "Gujarat", "Maharashtra", "Karnataka"],
    deficientArea_mha: 12.5,
    criticalLevel: "< 4.5 mg/kg (DTPA) on calcareous soils",
    deficiencySymptoms: "Interveinal chlorosis (yellowing between green veins) on young leaves. More common in calcareous (high pH), waterlogged or over-limed soils.",
    correctiveMeasure: "FeSO4·7H2O (19% Fe) or chelated Fe-EDTA/DTPA",
    dose: "Soil: 10-25 kg FeSO4/ha. Foliar: 0.5% FeSO4 + 0.1% citric acid spray 2-3 times at 10-day intervals.",
    timing: "At onset of deficiency symptoms (early crop stage)",
    crops: ["Rice (on calcareous)", "Wheat", "Soybean", "Groundnut", "Sorghum", "Fruits"]
  },
  {
    nutrient: "Sulphur",
    symbol: "S",
    deficientStates: ["Maharashtra", "Andhra Pradesh", "Karnataka", "Madhya Pradesh", "Gujarat", "Rajasthan", "Uttar Pradesh"],
    deficientArea_mha: 40.1,
    criticalLevel: "< 10 mg/kg (0.15% CaCl2 soluble)",
    deficiencySymptoms: "Yellowing of young leaves first (unlike N which starts in old leaves). Reduced oil content in mustard/groundnut. Stunted growth.",
    correctiveMeasure: "Gypsum (CaSO4, ~18% S) or Ammonium Sulphate (24% S) or Elemental S",
    dose: "Gypsum 200-400 kg/ha or elemental S 40 kg S/ha",
    timing: "At sowing as basal application",
    crops: ["Mustard", "Groundnut", "Soybean", "Onion", "Garlic", "Pulses", "Cotton"]
  },
  {
    nutrient: "Manganese",
    symbol: "Mn",
    deficientStates: ["Punjab", "Haryana", "Uttar Pradesh", "Rajasthan", "Gujarat", "Maharashtra"],
    deficientArea_mha: 5.2,
    criticalLevel: "< 2.0 mg/kg (DTPA)",
    deficiencySymptoms: "Gray speck in oats, speckled yellowing in soybean, interveinal chlorosis on young leaves. Common on high pH, well-aerated soils.",
    correctiveMeasure: "MnSO4 (31% Mn)",
    dose: "Soil: 10-25 kg MnSO4/ha. Foliar: 0.3-0.4% MnSO4 solution spray.",
    timing: "At early vegetative stage or at symptom appearance",
    crops: ["Oats", "Soybean", "Wheat", "Rice", "Peas", "Beet"]
  },
];

// ===================== FERTILIZER RECOMMENDATIONS =====================
// Based on ICAR crop-wise fertilizer recommendation (2012 edition)

export const fertilizerRecommendations: FertilizerRecommendation[] = [
  {
    cropName: "Wheat",
    soilType: "Alluvial",
    season: "Rabi",
    NPK: { N: 120, P: 60, K: 40 },
    Micronutrients: [
      { name: "Zinc Sulphate", dose: "25 kg/ha every alternate year", method: "Basal soil application" },
      { name: "Sulphur (Gypsum)", dose: "200 kg/ha", method: "Basal — especially for sandy/low OM soils" }
    ],
    organicManure: { type: "Well-decomposed FYM", dose: "6-7 t/ha", timing: "3-4 weeks before sowing" },
    splitApplication: [
      { stage: "Basal (at sowing)", nutrients: "N 40 kg + full P 60 kg + full K 40 kg" },
      { stage: "CRI (21-25 DAS)", nutrients: "N 40 kg (Urea 87 kg/ha)" },
      { stage: "At Tillering (40 DAS)", nutrients: "N 40 kg (remaining)" }
    ],
    notes: "Under late sown conditions, reduce N to 90:60:40. Apply Urea on moist soil. Use slow-release urea (neem-coated) to reduce N losses."
  },
  {
    cropName: "Rice (HYV)",
    soilType: "Alluvial",
    season: "Kharif",
    NPK: { N: 120, P: 60, K: 60 },
    Micronutrients: [
      { name: "Zinc Sulphate", dose: "25 kg/ha", method: "Basal mixed in puddled soil" },
      { name: "Zinc foliar", dose: "0.5% ZnSO4 + 0.25% CaO", method: "2 sprays at 20 and 40 DAT" }
    ],
    organicManure: { type: "Dhaincha (Sesbania) green manure", dose: "Grow 30 kg seed/ha, incorporate 45 days later", timing: "Before puddling" },
    splitApplication: [
      { stage: "Basal (at transplanting)", nutrients: "Full P + Full K + Zn" },
      { stage: "1st top-dress (at tillering, 14-21 DAT)", nutrients: "N 40 kg (Urea 87 kg/ha)" },
      { stage: "2nd top-dress (at panicle initiation)", nutrients: "N 40 kg" },
    ],
    notes: "Green manure (Dhaincha) substitutes 25-30 kg N/ha. Use LCC for N management. Drain water before N application, refill after 2 days."
  },
  {
    cropName: "Maize (Kharif)",
    soilType: "Alluvial/Red Yellow",
    season: "Kharif",
    NPK: { N: 150, P: 75, K: 50 },
    Micronutrients: [
      { name: "Zinc Sulphate", dose: "25 kg/ha", method: "Basal" },
      { name: "Ferrous Sulphate", dose: "10 kg/ha", method: "Basal on Fe-deficient soils" }
    ],
    organicManure: { type: "FYM", dose: "5-6 t/ha", timing: "Before final ploughing" },
    splitApplication: [
      { stage: "Basal", nutrients: "N 50 kg + Full P 75 kg + Full K 50 kg" },
      { stage: "V4-V5 (knee-high, ~25 DAS)", nutrients: "N 50 kg" },
      { stage: "Tasseling (50-55 DAS)", nutrients: "N 50 kg" }
    ],
    notes: "Side-dress urea 3-5 cm below soil surface. Avoid surface broadcast during high rainfall."
  },
  {
    cropName: "Cotton",
    soilType: "Black",
    season: "Kharif",
    NPK: { N: 150, P: 60, K: 60 },
    Micronutrients: [
      { name: "Zinc Sulphate", dose: "25 kg/ha", method: "Basal" },
      { name: "Borax", dose: "5 kg/ha", method: "Basal soil or 0.2% foliar at boll development" },
      { name: "Ferrous Sulphate", dose: "0.5% spray", method: "2-3 foliar sprays at vegetative stage" }
    ],
    organicManure: { type: "FYM or compost", dose: "5-8 t/ha", timing: "Before sowing" },
    splitApplication: [
      { stage: "Basal", nutrients: "N 30 kg + Full P + Full K" },
      { stage: "Square formation (30-35 DAS)", nutrients: "N 60 kg" },
      { stage: "Boll development (65-75 DAS)", nutrients: "N 60 kg" }
    ],
    notes: "For Bt cotton: increase K by 20 kg/ha. Use potassium nitrate foliar at boll stage for improved fiber quality. Avoid excess N post-flowering."
  },
  {
    cropName: "Mustard",
    soilType: "Alluvial",
    season: "Rabi",
    NPK: { N: 80, P: 40, K: 20 },
    Micronutrients: [
      { name: "Sulphur (Gypsum)", dose: "30 kg S/ha (Gypsum 400 kg)", method: "Basal — critical for oil content" },
      { name: "Zinc Sulphate", dose: "25 kg/ha on deficient soils", method: "Basal" },
      { name: "Borax", dose: "1 kg B/ha (Borax 10 kg)", method: "Basal or 0.2% foliar at flowering" }
    ],
    organicManure: { type: "FYM/compost", dose: "5 t/ha", timing: "Before sowing" },
    splitApplication: [
      { stage: "Basal", nutrients: "N 40 kg + Full P + Full K + Full Sulphur" },
      { stage: "At first irrigation (25-30 DAS)", nutrients: "N 40 kg" }
    ],
    notes: "Sulphur application increases oil content by 1.5-2%. In rainfed conditions, use entire N as basal."
  },
  {
    cropName: "Sugarcane",
    soilType: "Alluvial/Black",
    season: "Annual",
    NPK: { N: 300, P: 80, K: 120 },
    Micronutrients: [
      { name: "Iron Sulphate", dose: "20 kg FeSO4/ha", method: "Soil" },
      { name: "Zinc Sulphate", dose: "25 kg/ha", method: "Basal soil application" },
      { name: "Manganese Sulphate", dose: "10 kg/ha", method: "Soil if deficient" }
    ],
    organicManure: { type: "Pressmud (sugarcane factory)", dose: "10 t/ha", timing: "Before planting" },
    splitApplication: [
      { stage: "At planting", nutrients: "Full P + Full K + N 100 kg" },
      { stage: "60 days after planting", nutrients: "N 100 kg" },
      { stage: "120 days (at earthing up)", nutrients: "N 100 kg" }
    ],
    notes: "Foliar application of 2% urea at 30-day intervals from 60-120 days increases cane yield. Trash mulching conserves moisture and adds nutrition."
  },
  {
    cropName: "Soybean",
    soilType: "Black/Alluvial",
    season: "Kharif",
    NPK: { N: 30, P: 60, K: 40 },
    Micronutrients: [
      { name: "Sulphur (Gypsum)", dose: "40 kg S/ha", method: "Basal — essential for N fixation" },
      { name: "Zinc Sulphate", dose: "25 kg/ha", method: "Basal on deficient soils" },
      { name: "Boron", dose: "0.2% Borax foliar at R1 stage", method: "Foliar" }
    ],
    organicManure: { type: "FYM", dose: "5 t/ha", timing: "2 weeks before sowing" },
    splitApplication: [
      { stage: "Seed treatment", nutrients: "Rhizobium + PSB inoculants (0.5 kg each/10 kg seed)" },
      { stage: "Basal", nutrients: "N 30 kg (starter N) + Full P + Full K + Sulphur" }
    ],
    notes: "Effective Rhizobium inoculation fixes 40-80 kg N/ha. Avoid pre-emergent N excess. Seed inoculants: Bradyrhizobium japonicum + PSB tank mix."
  },
];

// ===================== HELPER FUNCTIONS =====================

export const getSoilParameterStatus = (parameterId: string, value: number) => {
  const param = soilHealthParameters.find(p => p.id === parameterId);
  if (!param) return null;
  const range = param.ranges.find(r => value >= r.min && value < r.max);
  return { param, range, isDeficient: value < param.criticalLevel };
};

export const getSoilTypeInfo = (name: string): SoilType | undefined =>
  indianSoilTypes.find(s => s.name.toLowerCase().includes(name.toLowerCase()) || s.id === name);

export const getFertilizerRecommendation = (crop: string): FertilizerRecommendation[] =>
  fertilizerRecommendations.filter(f => f.cropName.toLowerCase().includes(crop.toLowerCase()));

export const getDeficientSoils = (state: string): MicronutrientStatus[] =>
  micronutrientStatus.filter(m => m.deficientStates.some(s => s.toLowerCase() === state.toLowerCase()));

export const getSoilHealthCardReport = (readings: { [key: string]: number }) => {
  return soilHealthParameters.map(param => ({
    parameter: param.name,
    unit: param.unit,
    value: readings[param.id] ?? null,
    status: readings[param.id] != null ? getSoilParameterStatus(param.id, readings[param.id]) : null,
  }));
};
