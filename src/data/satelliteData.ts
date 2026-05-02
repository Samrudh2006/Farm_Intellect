// Satellite & Vegetation Index Dataset
// Sources: ISRO/NRSC Bhuvan, ESA Sentinel-2, USGS Landsat-8, MODIS Terra/Aqua
// Vegetation index thresholds: NASA EarthData, ICAR Remote Sensing standards

import { createDatasetMetadata } from "./datasetMetadata";

export interface VegetationIndexRange {
  min: number;
  max: number;
  category: string;
  cropCondition: string;
  color: string;     // hex for UI display
  action?: string;
}

export interface CropNDVIProfile {
  crop: string;
  stages: {
    name: string;
    das: string;          // Days After Sowing
    ndvi: { min: number; max: number; optimal: number };
    evi: { min: number; max: number; optimal: number };
    ndre: { min: number; max: number; optimal: number };
    lswi: { min: number; max: number };   // Land Surface Water Index
    description: string;
  }[];
}

export interface SatelliteBand {
  satellite: string;
  sensor: string;
  bands: {
    name: string;
    wavelength: string;
    use: string;
  }[];
  indices: {
    name: string;
    formula: string;
    range: string;
    use: string;
  }[];
  revisitTime: string;
  spatialResolution: string;
  swathWidth: string;
}

export const satelliteDataMetadata = createDatasetMetadata({
  version: "1.0.0",
  lastUpdated: "2024-10-10T00:00:00Z",
  source: "ISRO/NRSC Bhuvan, ESA Sentinel-2, USGS Landsat-8",
  notes: "NDVI/EVI/NDRE thresholds aligned with remote sensing standards.",
});

export interface NDVIAlert {
  id: string;
  indexName: string;
  threshold: number;
  operator: "<" | ">" | "between";
  threshold2?: number;
  alertLevel: "info" | "warning" | "critical";
  title: string;
  description: string;
  recommendation: string;
  crops?: string[];
}

// ======================== NDVI GENERAL CLASSIFICATION ========================
// Based on NASA MODIS land product documentation and FAO vegetation monitoring standards

export const ndviClassification: VegetationIndexRange[] = [
  { min: -1.0, max: 0.0,  category: "Water/Cloud/Snow", cropCondition: "N/A — water body, cloud cover, or snow",                 color: "#1565C0", action: "No field action needed" },
  { min: 0.0,  max: 0.10, category: "Bare Soil",         cropCondition: "No vegetation — soil exposed, dead/failed crop",          color: "#8D6E63", action: "Investigate crop failure, replant if needed" },
  { min: 0.10, max: 0.20, category: "Sparse Vegetation", cropCondition: "Very sparse — poor establishment or severe stress",        color: "#F9A825", action: "Check germination, water stress, soil health" },
  { min: 0.20, max: 0.35, category: "Low Vegetation",    cropCondition: "Below average — early growth or stressed crop",           color: "#FDD835", action: "Apply irrigation, check nutrient deficiency" },
  { min: 0.35, max: 0.50, category: "Moderate Vegetation","cropCondition": "Moderate growth — crop establishing, needs monitoring", color: "#8BC34A", action: "Monitor closely, ensure adequate nutrition" },
  { min: 0.50, max: 0.65, category: "Good Vegetation",   cropCondition: "Good canopy — healthy crop growing normally",             color: "#4CAF50", action: "Continue standard management" },
  { min: 0.65, max: 0.80, category: "Very Good Vegetation","cropCondition": "Dense canopy — excellent crop health, peak growth",   color: "#2E7D32", action: "Maintain current management practices" },
  { min: 0.80, max: 1.00, category: "Excellent Vegetation","cropCondition": "Maximum/mature canopy — prime or dense forest cover", color: "#1B5E20", action: "Timely harvest if mature stage" },
];

// ======================== EVI CLASSIFICATION ========================
// Enhanced Vegetation Index — better than NDVI in high-biomass regions (corrects for soil + atmosphere)

export const eviClassification: VegetationIndexRange[] = [
  { min: -1.0, max: 0.0,  category: "Non-vegetated",     cropCondition: "Water, cloud, ice/snow",                        color: "#1565C0" },
  { min: 0.0,  max: 0.10, category: "Bare Soil/Rock",    cropCondition: "No vegetation, failed crop",                    color: "#8D6E63" },
  { min: 0.10, max: 0.20, category: "Very Low Biomass",  cropCondition: "Early seedling emergence or severe drought",    color: "#F57F17" },
  { min: 0.20, max: 0.35, category: "Low Biomass",       cropCondition: "Early vegetative, below expected canopy",       color: "#F9A825" },
  { min: 0.35, max: 0.50, category: "Moderate Biomass",  cropCondition: "Active vegetative stage",                      color: "#9CCC65" },
  { min: 0.50, max: 0.65, category: "High Biomass",      cropCondition: "Rapid growth, dense canopy",                   color: "#43A047" },
  { min: 0.65, max: 1.00, category: "Very High Biomass", cropCondition: "Absolute maximum — dense tropical / irrigated", color: "#1B5E20" },
];

// ======================== NDWI/LSWI CLASSIFICATION ========================
// Normalized Difference Water Index — for soil moisture and crop water stress

export const ndwiClassification: VegetationIndexRange[] = [
  { min: -1.0, max: -0.3, category: "Severe Water Stress",  cropCondition: "Critical drought — immediate irrigation needed",  color: "#BF360C", action: "Irrigate immediately" },
  { min: -0.3, max: -0.1, category: "Moderate Water Stress","cropCondition": "Drought stress — yield reduction likely",        color: "#F57F17", action: "Irrigate within 24-48 hours" },
  { min: -0.1, max: 0.10, category: "Mild Stress",          cropCondition: "Slightly dry — monitor closely",                  color: "#FDD835", action: "Plan irrigation in 3-5 days" },
  { min: 0.10, max: 0.30, category: "Adequate Moisture",    cropCondition: "Good soil moisture — no immediate irrigation",    color: "#66BB6A", action: "Monitor normal" },
  { min: 0.30, max: 0.60, category: "High Moisture",        cropCondition: "Field capacity — good conditions",                color: "#26A69A", action: "No irrigation needed" },
  { min: 0.60, max: 1.00, category: "Saturated/Flooded",    cropCondition: "Waterlogged — may cause anaerobic stress",        color: "#1565C0", action: "Drain excess water" },
];

// ======================== CROP-SPECIFIC NDVI PROFILES ========================
// Based on: NRSC Bhuvan crop monitoring, FAO ASIS, ICAR remote sensing studies

export const cropNDVIProfiles: CropNDVIProfile[] = [
  {
    crop: "Rice (Paddy)",
    stages: [
      { name: "Transplanting/Emergence", das: "0-15",   ndvi: { min: 0.05, max: 0.15, optimal: 0.10 }, evi: { min: 0.02, max: 0.10, optimal: 0.06 }, ndre: { min: 0.0, max: 0.10, optimal: 0.05 }, lswi: { min: 0.30, max: 0.70 }, description: "Flooded field, very low canopy, high water signal" },
      { name: "Tillering",               das: "15-40",  ndvi: { min: 0.25, max: 0.45, optimal: 0.35 }, evi: { min: 0.15, max: 0.35, optimal: 0.25 }, ndre: { min: 0.10, max: 0.25, optimal: 0.18 }, lswi: { min: 0.20, max: 0.55 }, description: "Rapid leaf area development, canopy closing" },
      { name: "Active Tillering",        das: "40-60",  ndvi: { min: 0.45, max: 0.65, optimal: 0.55 }, evi: { min: 0.30, max: 0.50, optimal: 0.40 }, ndre: { min: 0.22, max: 0.38, optimal: 0.30 }, lswi: { min: 0.10, max: 0.40 }, description: "Maximum vegetative index, dense canopy" },
      { name: "Panicle Initiation",      das: "60-75",  ndvi: { min: 0.55, max: 0.75, optimal: 0.65 }, evi: { min: 0.38, max: 0.58, optimal: 0.48 }, ndre: { min: 0.28, max: 0.45, optimal: 0.37 }, lswi: { min: 0.05, max: 0.30 }, description: "Near peak NDVI, nitrogen critical stage" },
      { name: "Heading/Flowering",       das: "75-90",  ndvi: { min: 0.55, max: 0.78, optimal: 0.68 }, evi: { min: 0.40, max: 0.62, optimal: 0.52 }, ndre: { min: 0.30, max: 0.48, optimal: 0.40 }, lswi: { min: 0.00, max: 0.25 }, description: "Peak biomass, pollen shedding" },
      { name: "Grain Filling",           das: "90-115", ndvi: { min: 0.40, max: 0.65, optimal: 0.55 }, evi: { min: 0.30, max: 0.52, optimal: 0.42 }, ndre: { min: 0.18, max: 0.38, optimal: 0.28 }, lswi: { min: -0.1, max: 0.20 }, description: "Senescence begins, NDVI declining" },
      { name: "Ripening/Harvest",        das: "115-135",ndvi: { min: 0.15, max: 0.40, optimal: 0.25 }, evi: { min: 0.10, max: 0.28, optimal: 0.18 }, ndre: { min: 0.05, max: 0.18, optimal: 0.10 }, lswi: { min: -0.2, max: 0.10 }, description: "Yellowing, rapid NDVI decline, harvest-ready" },
    ]
  },
  {
    crop: "Wheat",
    stages: [
      { name: "Emergence/Early Seedling",das: "0-20",   ndvi: { min: 0.08, max: 0.20, optimal: 0.14 }, evi: { min: 0.04, max: 0.12, optimal: 0.08 }, ndre: { min: 0.02, max: 0.10, optimal: 0.06 }, lswi: { min: -0.1, max: 0.20 }, description: "Low initial biomass, sparse canopy" },
      { name: "Tillering",               das: "20-45",  ndvi: { min: 0.30, max: 0.55, optimal: 0.43 }, evi: { min: 0.18, max: 0.38, optimal: 0.28 }, ndre: { min: 0.14, max: 0.28, optimal: 0.21 }, lswi: { min: -0.1, max: 0.25 }, description: "Rapid canopy development" },
      { name: "Jointing/Stem Elongation",das: "45-70",  ndvi: { min: 0.55, max: 0.78, optimal: 0.68 }, evi: { min: 0.38, max: 0.60, optimal: 0.50 }, ndre: { min: 0.28, max: 0.45, optimal: 0.38 }, lswi: { min: -0.1, max: 0.20 }, description: "Peak NDVI period, highest LAI" },
      { name: "Heading/Anthesis",        das: "70-85",  ndvi: { min: 0.60, max: 0.82, optimal: 0.72 }, evi: { min: 0.42, max: 0.65, optimal: 0.55 }, ndre: { min: 0.30, max: 0.50, optimal: 0.40 }, lswi: { min: -0.15,max: 0.18 }, description: "Maximum NDVI, critical flowering stage" },
      { name: "Grain Filling",           das: "85-110", ndvi: { min: 0.35, max: 0.65, optimal: 0.50 }, evi: { min: 0.25, max: 0.48, optimal: 0.38 }, ndre: { min: 0.15, max: 0.35, optimal: 0.25 }, lswi: { min: -0.2, max: 0.10 }, description: "Flag leaf senescence, declining NDVI" },
      { name: "Ripening",                das: "110-130",ndvi: { min: 0.12, max: 0.35, optimal: 0.20 }, evi: { min: 0.08, max: 0.22, optimal: 0.14 }, ndre: { min: 0.03, max: 0.12, optimal: 0.07 }, lswi: { min: -0.3, max: 0.00 }, description: "Golden yellowing, harvest window" },
    ]
  },
  {
    crop: "Cotton",
    stages: [
      { name: "Germination/Cotyledon",   das: "0-15",   ndvi: { min: 0.05, max: 0.15, optimal: 0.10 }, evi: { min: 0.02, max: 0.08, optimal: 0.05 }, ndre: { min: 0.0, max: 0.08, optimal: 0.04 }, lswi: { min: -0.2, max: 0.15 }, description: "Very sparse, cotyledon visible" },
      { name: "Vegetative (1-5 square)", das: "15-50",  ndvi: { min: 0.20, max: 0.50, optimal: 0.38 }, evi: { min: 0.12, max: 0.35, optimal: 0.24 }, ndre: { min: 0.08, max: 0.28, optimal: 0.18 }, lswi: { min: -0.2, max: 0.20 }, description: "Canopy building, squaring begins" },
      { name: "Flowering",               das: "50-80",  ndvi: { min: 0.45, max: 0.70, optimal: 0.58 }, evi: { min: 0.32, max: 0.55, optimal: 0.44 }, ndre: { min: 0.25, max: 0.42, optimal: 0.34 }, lswi: { min: -0.1, max: 0.25 }, description: "White flowers, peak LAI for cotton" },
      { name: "Boll Development",        das: "80-120", ndvi: { min: 0.50, max: 0.72, optimal: 0.62 }, evi: { min: 0.35, max: 0.58, optimal: 0.47 }, ndre: { min: 0.28, max: 0.45, optimal: 0.37 }, lswi: { min: -0.1, max: 0.22 }, description: "Maximum biomass, green bolls forming" },
      { name: "Boll Bursting/Opening",   das: "120-160",ndvi: { min: 0.25, max: 0.55, optimal: 0.40 }, evi: { min: 0.18, max: 0.42, optimal: 0.30 }, ndre: { min: 0.12, max: 0.30, optimal: 0.20 }, lswi: { min: -0.2, max: 0.10 }, description: "White cotton visible, senescence" },
    ]
  },
  {
    crop: "Maize",
    stages: [
      { name: "V1-V3 (Seedling)",        das: "0-15",   ndvi: { min: 0.10, max: 0.25, optimal: 0.18 }, evi: { min: 0.05, max: 0.15, optimal: 0.10 }, ndre: { min: 0.02, max: 0.12, optimal: 0.07 }, lswi: { min: -0.2, max: 0.15 }, description: "Low biomass, 3 leaves visible" },
      { name: "V6-V8 (Rapid Growth)",    das: "15-40",  ndvi: { min: 0.35, max: 0.55, optimal: 0.46 }, evi: { min: 0.22, max: 0.40, optimal: 0.31 }, ndre: { min: 0.15, max: 0.32, optimal: 0.23 }, lswi: { min: -0.1, max: 0.22 }, description: "Rapid canopy growth, 6-8 leaves" },
      { name: "V12+ (Knee-high to Tassel)",das: "40-65",ndvi: { min: 0.60, max: 0.82, optimal: 0.72 }, evi: { min: 0.45, max: 0.68, optimal: 0.57 }, ndre: { min: 0.35, max: 0.55, optimal: 0.45 }, lswi: { min: 0.0,  max: 0.30 }, description: "Maximum NDVI, dense canopy, tasseling" },
      { name: "R1 (Silking/Pollination)", das: "65-80",  ndvi: { min: 0.65, max: 0.85, optimal: 0.75 }, evi: { min: 0.48, max: 0.70, optimal: 0.60 }, ndre: { min: 0.38, max: 0.58, optimal: 0.48 }, lswi: { min: 0.0,  max: 0.28 }, description: "Peak vegetation index, critical yield determination" },
      { name: "R3-R5 (Milk to Dent)",    das: "80-105", ndvi: { min: 0.45, max: 0.72, optimal: 0.60 }, evi: { min: 0.32, max: 0.55, optimal: 0.44 }, ndre: { min: 0.25, max: 0.45, optimal: 0.35 }, lswi: { min: -0.1, max: 0.20 }, description: "Grain filling, some senescence" },
      { name: "R6 (Physiological Maturity)",das: "105-120",ndvi: { min: 0.20, max: 0.45, optimal: 0.32 }, evi: { min: 0.12, max: 0.30, optimal: 0.20 }, ndre: { min: 0.08, max: 0.22, optimal: 0.14 }, lswi: { min: -0.3, max: 0.05 }, description: "Black layer formed, leaves senescing" },
    ]
  },
  {
    crop: "Soybean",
    stages: [
      { name: "Emergence (VE)",          das: "0-10",   ndvi: { min: 0.06, max: 0.18, optimal: 0.12 }, evi: { min: 0.03, max: 0.10, optimal: 0.06 }, ndre: { min: 0.01, max: 0.08, optimal: 0.04 }, lswi: { min: -0.2, max: 0.15 }, description: "Very early, unifoliate visible" },
      { name: "V3-V5 (Vegetative)",      das: "10-30",  ndvi: { min: 0.22, max: 0.45, optimal: 0.34 }, evi: { min: 0.14, max: 0.30, optimal: 0.22 }, ndre: { min: 0.10, max: 0.25, optimal: 0.17 }, lswi: { min: -0.1, max: 0.20 }, description: "Rapid canopy expansion" },
      { name: "R1 (Beginning Bloom)",    das: "30-50",  ndvi: { min: 0.50, max: 0.72, optimal: 0.62 }, evi: { min: 0.35, max: 0.55, optimal: 0.45 }, ndre: { min: 0.28, max: 0.45, optimal: 0.37 }, lswi: { min: 0.0,  max: 0.25 }, description: "First flowers, LAI approaching max" },
      { name: "R3-R4 (Pod Fill)",        das: "50-80",  ndvi: { min: 0.60, max: 0.82, optimal: 0.72 }, evi: { min: 0.45, max: 0.68, optimal: 0.57 }, ndre: { min: 0.38, max: 0.55, optimal: 0.47 }, lswi: { min: 0.0,  max: 0.28 }, description: "Maximum NDVI, pods swelling" },
      { name: "R6-R7 (Full Seed/Mature)",das: "80-110", ndvi: { min: 0.20, max: 0.55, optimal: 0.38 }, evi: { min: 0.12, max: 0.38, optimal: 0.25 }, ndre: { min: 0.08, max: 0.28, optimal: 0.18 }, lswi: { min: -0.2, max: 0.10 }, description: "Rapid senescence, yellowing leaves" },
    ]
  },
  {
    crop: "Sugarcane",
    stages: [
      { name: "Germination",             das: "0-30",   ndvi: { min: 0.10, max: 0.25, optimal: 0.18 }, evi: { min: 0.05, max: 0.15, optimal: 0.10 }, ndre: { min: 0.03, max: 0.12, optimal: 0.07 }, lswi: { min: -0.1, max: 0.20 }, description: "Sets germinating, very sparse" },
      { name: "Tillering",               das: "30-90",  ndvi: { min: 0.35, max: 0.60, optimal: 0.48 }, evi: { min: 0.22, max: 0.45, optimal: 0.34 }, ndre: { min: 0.18, max: 0.35, optimal: 0.26 }, lswi: { min: 0.0,  max: 0.28 }, description: "Multiple tillers emerging, canopy expanding" },
      { name: "Grand Growth",            das: "90-210", ndvi: { min: 0.65, max: 0.90, optimal: 0.80 }, evi: { min: 0.50, max: 0.75, optimal: 0.63 }, ndre: { min: 0.45, max: 0.65, optimal: 0.55 }, lswi: { min: 0.10, max: 0.40 }, description: "Tallest, densest canopy, max NDVI" },
      { name: "Maturation",              das: "210-365",ndvi: { min: 0.40, max: 0.72, optimal: 0.58 }, evi: { min: 0.28, max: 0.55, optimal: 0.42 }, ndre: { min: 0.22, max: 0.42, optimal: 0.32 }, lswi: { min: -0.1, max: 0.25 }, description: "Sucrose accumulation, slight NDVI decline" },
    ]
  },
  {
    crop: "Potato",
    stages: [
      { name: "Sprout Development",      das: "0-20",   ndvi: { min: 0.05, max: 0.18, optimal: 0.12 }, evi: { min: 0.02, max: 0.10, optimal: 0.06 }, ndre: { min: 0.01, max: 0.08, optimal: 0.04 }, lswi: { min: -0.15,max: 0.15 }, description: "Tubers germinating, very low canopy" },
      { name: "Vegetative Growth",       das: "20-45",  ndvi: { min: 0.30, max: 0.55, optimal: 0.43 }, evi: { min: 0.20, max: 0.38, optimal: 0.29 }, ndre: { min: 0.14, max: 0.30, optimal: 0.22 }, lswi: { min: -0.1, max: 0.22 }, description: "Rapid vine growth, canopy spreading" },
      { name: "Tuber Initiation",        das: "45-65",  ndvi: { min: 0.58, max: 0.80, optimal: 0.70 }, evi: { min: 0.42, max: 0.65, optimal: 0.54 }, ndre: { min: 0.35, max: 0.52, optimal: 0.43 }, lswi: { min: 0.0,  max: 0.30 }, description: "Peak NDVI, stolons forming tubers" },
      { name: "Tuber Bulking",           das: "65-90",  ndvi: { min: 0.55, max: 0.78, optimal: 0.66 }, evi: { min: 0.40, max: 0.62, optimal: 0.51 }, ndre: { min: 0.30, max: 0.50, optimal: 0.40 }, lswi: { min: -0.05,max: 0.25 }, description: "Tubers expanding rapidly" },
      { name: "Maturation/Senescence",   das: "90-120", ndvi: { min: 0.15, max: 0.45, optimal: 0.28 }, evi: { min: 0.08, max: 0.28, optimal: 0.16 }, ndre: { min: 0.05, max: 0.20, optimal: 0.10 }, lswi: { min: -0.25,max: 0.05 }, description: "Vine death, NDVI dropping rapidly" },
    ]
  },
];

// ======================== SATELLITE PLATFORMS ========================
export const satellitePlatforms: SatelliteBand[] = [
  {
    satellite: "Sentinel-2 A/B",
    sensor: "MSI (MultiSpectral Instrument)",
    revisitTime: "5 days (1 satellite: 10 days)",
    spatialResolution: "10m (VIS/NIR), 20m (Red Edge/SWIR), 60m (Coastal/WV)",
    swathWidth: "290 km",
    bands: [
      { name: "B2 Blue",          wavelength: "492.4 nm ± 66 nm",  use: "Atmospheric scattering, water penetration" },
      { name: "B3 Green",         wavelength: "559.8 nm ± 36 nm",  use: "Vegetation vigour, chlorophyll" },
      { name: "B4 Red",           wavelength: "664.6 nm ± 31 nm",  use: "Chlorophyll absorption" },
      { name: "B5 Red Edge 1",    wavelength: "704.1 nm ± 15 nm",  use: "Canopy chlorophyll content (unique)" },
      { name: "B6 Red Edge 2",    wavelength: "740.5 nm ± 15 nm",  use: "Canopy chlorophyll content" },
      { name: "B7 Red Edge 3",    wavelength: "782.8 nm ± 20 nm",  use: "Canopy chlorophyll content" },
      { name: "B8 NIR",           wavelength: "832.8 nm ± 106 nm", use: "Canopy structure, LAI estimation" },
      { name: "B8A Narrow NIR",   wavelength: "864.7 nm ± 21 nm",  use: "Moisture, cloud detection" },
      { name: "B11 SWIR-1",       wavelength: "1613.7 nm ± 91 nm", use: "Soil moisture, crop stress" },
      { name: "B12 SWIR-2",       wavelength: "2202.4 nm ± 175 nm",use: "Crop residue, soil properties" },
    ],
    indices: [
      { name: "NDVI",   formula: "(B8 - B4) / (B8 + B4)",          range: "-1 to +1", use: "Crop health, biomass, growth stage" },
      { name: "EVI",    formula: "2.5×(B8-B4)/(B8+6×B4-7.5×B2+1)",range: "-1 to +1", use: "Canopy biomass in dense areas" },
      { name: "NDRE",   formula: "(B8A - B5) / (B8A + B5)",         range: "-1 to +1", use: "Nitrogen status, chlorophyll content" },
      { name: "NDWI",   formula: "(B3 - B8) / (B3 + B8)",           range: "-1 to +1", use: "Crop and soil water content" },
      { name: "LSWI",   formula: "(B8 - B11) / (B8 + B11)",         range: "-1 to +1", use: "Soil moisture, irrigation monitoring" },
      { name: "SAVI",   formula: "1.5×(B8-B4)/(B8+B4+0.5)",         range: "-1.5 to +1.5","use": "NDVI-corrected for soil in sparse canopy" },
      { name: "NDTI",   formula: "(B11 - B12) / (B11 + B12)",        range: "-1 to +1",  use: "Tillage intensity, crop residue" },
      { name: "PSRI",   formula: "(B4 - B2) / B6",                  range: "0 to 1",    use: "Plant senescence, disease stress" },
    ]
  },
  {
    satellite: "Landsat-8/9 OLI",
    sensor: "OLI (Operational Land Imager) + TIRS",
    revisitTime: "16 days",
    spatialResolution: "30m (OLI), 100m (TIRS Thermal)",
    swathWidth: "185 km",
    bands: [
      { name: "B1 Coastal",  wavelength: "435-451 nm",   use: "Coastal, aerosol study" },
      { name: "B2 Blue",     wavelength: "452-512 nm",   use: "Bathymetric mapping, soil distinction" },
      { name: "B3 Green",    wavelength: "533-590 nm",   use: "Vegetation vigor" },
      { name: "B4 Red",      wavelength: "636-673 nm",   use: "Chlorophyll absorption, crop discrimination" },
      { name: "B5 NIR",      wavelength: "851-879 nm",   use: "Vegetation/water boundary, biomass" },
      { name: "B6 SWIR-1",   wavelength: "1566-1651 nm", use: "Soil/vegetation moisture" },
      { name: "B7 SWIR-2",   wavelength: "2107-2294 nm", use: "Soil moisture, hydrothermally altered minerals" },
      { name: "B10 TIRS-1",  wavelength: "10.6-11.2 μm", use: "Land surface temperature, heat stress" },
    ],
    indices: [
      { name: "NDVI",  formula: "(B5 - B4) / (B5 + B4)",           range: "-1 to +1", use: "Crop health, biomass" },
      { name: "NDWI",  formula: "(B3 - B5) / (B3 + B5)",           range: "-1 to +1", use: "Water bodies, irrigation" },
      { name: "NDTI",  formula: "(B6 - B7) / (B6 + B7)",           range: "-1 to +1", use: "Tillage, residue after harvest" },
      { name: "LST",   formula: "Derived from B10 with emissivity", range: "°C",       use: "Heat wave detection, crop stress" },
      { name: "EVI",   formula: "2.5×(B5-B4)/(B5+6×B4-7.5×B2+1)", range: "-1 to +1", use: "Dense canopy biomass" },
    ]
  },
  {
    satellite: "MODIS (Terra/Aqua)",
    sensor: "MODIS 36-band",
    revisitTime: "1-2 days",
    spatialResolution: "250m (B1-B2), 500m (B3-7), 1km (B8-36)",
    swathWidth: "2330 km",
    bands: [
      { name: "B1 Red",    wavelength: "620-670 nm",    use: "Chlorophyll absorption, land cover" },
      { name: "B2 NIR",    wavelength: "841-876 nm",    use: "Vegetation, land/water boundary" },
      { name: "B4 Green",  wavelength: "545-565 nm",    use: "Vegetation vigor" },
      { name: "B5 SWIR",   wavelength: "1230-1250 nm",  use: "Leaf water content" },
      { name: "B6 SWIR",   wavelength: "1628-1652 nm",  use: "Snow/cloud distinction, soil moisture" },
      { name: "B31 TIR",   wavelength: "10.78-11.28 μm","use": "Land surface temperature" },
    ],
    indices: [
      { name: "MOD13Q1 NDVI",  formula: "(B2-B1)/(B2+B1)", range: "-2000 to +10000 (×0.0001 for actual)", use: "Regional/national crop monitoring, FAAS" },
      { name: "MOD13Q1 EVI",   formula: "G×(B2-B1)/(B2+C1×B1-C2×B4+L)", range: "Same scale",   use: "High biomass crop monitoring" },
      { name: "MOD11A1 LST",   formula: "Split-window algorithm",          range: "°K (−273.15 for °C)", use: "Daily heat stress monitoring" },
      { name: "MOD09 NDWI",    formula: "(B4-B6)/(B4+B6)",                range: "-1 to +1",    use: "Drought monitoring, ASIS" },
    ]
  },
  {
    satellite: "ResourceSat-2A (ISRO/NRSC)",
    sensor: "LISS-III / LISS-IV / AWiFS",
    revisitTime: "24 days (LISS-IV: 5 days)",
    spatialResolution: "5.8m (LISS-IV), 23.5m (LISS-III), 56m (AWiFS)",
    swathWidth: "23 km (LISS-IV), 141 km (LISS-III), 740 km (AWiFS)",
    bands: [
      { name: "B2 Green",  wavelength: "520-590 nm",  use: "Vegetation vigor" },
      { name: "B3 Red",    wavelength: "620-680 nm",  use: "Chlorophyll, crop discrimination" },
      { name: "B4 NIR",    wavelength: "770-860 nm",  use: "Biomass, canopy density" },
      { name: "B5 SWIR",   wavelength: "1550-1700 nm","use": "Soil/crop moisture" },
    ],
    indices: [
      { name: "NDVI", formula: "(B4-B3)/(B4+B3)", range: "-1 to +1", use: "Bhuvan-based crop area estimation, seasonal monitoring" },
      { name: "NDWI", formula: "(B2-B4)/(B2+B4)", range: "-1 to +1", use: "Flood mapping, irrigation status" },
    ]
  }
];

// ======================== NDVI-BASED ALERTS ========================
export const ndviAlerts: NDVIAlert[] = [
  { id: "al001", indexName: "NDVI",  threshold: 0.10, operator: "<",       alertLevel: "critical", title: "Crop Failure Detected", description: "NDVI < 0.10 indicates bare soil or complete crop failure",        recommendation: "Immediately visit field, assess germination failure or severe drought", crops: ["All"] },
  { id: "al002", indexName: "NDVI",  threshold: 0.25, operator: "<",       alertLevel: "warning",  title: "Poor Crop Stand",       description: "NDVI < 0.25 indicates sparse canopy below expected for stage", recommendation: "Check irrigation status, check for pest/disease, apply foliar nutrition" },
  { id: "al003", indexName: "NDVI",  threshold: 0.15, threshold2: 0.60, operator: "between", alertLevel: "warning", title: "Below-Normal Seasonal NDVI", description: "NDVI 15-30% below historical average for this date/stage", recommendation: "Investigate water stress, leaf disease, or delayed sowing" },
  { id: "al004", indexName: "NDWI",  threshold: -0.3, operator: "<",       alertLevel: "critical", title: "Severe Drought Stress",  description: "NDWI < -0.3 indicates critical water deficit",                recommendation: "Irrigate immediately, apply anti-transpirant sprays" },
  { id: "al005", indexName: "NDWI",  threshold: 0.60, operator: ">",       alertLevel: "warning",  title: "Waterlogging Risk",     description: "NDWI > 0.60 indicates saturated or flooded conditions",       recommendation: "Drain excess water within 48 hours to prevent root anoxia" },
  { id: "al006", indexName: "NDRE",  threshold: 0.15, operator: "<",       alertLevel: "warning",  title: "Nitrogen Deficiency",   description: "NDRE < 0.15 at vegetative stage indicates N deficiency",      recommendation: "Apply urea top-dressing immediately", crops: ["Rice", "Wheat", "Maize"] },
  { id: "al007", indexName: "LST",   threshold: 35,   operator: ">",       alertLevel: "warning",  title: "Heat Stress Risk",      description: "Land surface temperature > 35°C, crop heat stress likely",    recommendation: "Irrigate, apply KCl foliar, schedule field operations for early morning" },
  { id: "al008", indexName: "LST",   threshold: 42,   operator: ">",       alertLevel: "critical", title: "Critical Heat Event",   description: "LST > 42°C — severe heat stress, pollen sterility risk",      recommendation: "Emergency irrigation within 6 hours for flowering crops" },
];

// ======================== HELPER FUNCTIONS ========================

export const getNDVIStatus = (ndvi: number): VegetationIndexRange =>
  ndviClassification.find(c => ndvi >= c.min && ndvi < c.max) || ndviClassification[0];

export const getEVIStatus = (evi: number): VegetationIndexRange =>
  eviClassification.find(c => evi >= c.min && evi < c.max) || eviClassification[0];

export const getNDWIStatus = (ndwi: number): VegetationIndexRange =>
  ndwiClassification.find(c => ndwi >= c.min && ndwi < c.max) || ndwiClassification[0];

export const getCropNDVIProfile = (crop: string): CropNDVIProfile | undefined =>
  cropNDVIProfiles.find(p => p.crop.toLowerCase().includes(crop.toLowerCase()));

export const analyzeFieldHealth = (ndvi: number, ndwi: number, crop: string) => {
  const vegetation = getNDVIStatus(ndvi);
  const moisture   = getNDWIStatus(ndwi);
  const alerts     = ndviAlerts.filter(a => {
    if (a.indexName === "NDVI" && a.operator === "<" && ndvi < a.threshold) return true;
    if (a.indexName === "NDWI" && a.operator === "<" && ndwi < a.threshold) return true;
    if (a.indexName === "NDWI" && a.operator === ">" && ndwi > a.threshold) return true;
    return false;
  });
  return { vegetation, moisture, alerts, overallScore: Math.round((ndvi + 1) / 2 * 100) };
};

export const getSatellitePlatform = (name: string): SatelliteBand | undefined =>
  satellitePlatforms.find(p => p.satellite.toLowerCase().includes(name.toLowerCase()));
