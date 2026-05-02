// Indian Crop Production Dataset
// Source: Data.gov.in, Directorate of Economics & Statistics (DES), Ministry of Agriculture
// State-wise and district-wise crop production statistics for major Indian crops

import { createDatasetMetadata } from "./datasetMetadata";

export interface CropProductionEntry {
  state: string;
  district: string;
  crop: string;
  season: "Kharif" | "Rabi" | "Summer" | "Whole Year";
  year: string;
  area: number; // hectares
  production: number; // tonnes
  yield: number; // kg/ha
}

export interface StateProductionSummary {
  state: string;
  totalArea: number; // '000 hectares
  totalProduction: number; // '000 tonnes
  majorCrops: { crop: string; area: number; production: number; yield: number }[];
  irrigatedPercentage: number;
  rainfedPercentage: number;
}

export interface NationalCropStats {
  crop: string;
  category: string;
  year: string;
  area: number; // million hectares
  production: number; // million tonnes
  yield: number; // kg/ha
  topStates: { state: string; share: number }[];
  trend: "increasing" | "stable" | "decreasing";
  mspPrice: number; // ₹/quintal 2024-25
}

export const cropProductionMetadata = createDatasetMetadata({
  version: "1.0.0",
  lastUpdated: "2024-09-30T00:00:00Z",
  source: "Data.gov.in, DES, Ministry of Agriculture",
  notes: "National production statistics aligned with 2023-24 DES releases.",
});

// National-level crop production statistics (2023-24 data from DES)
export const nationalCropStats: NationalCropStats[] = [
  {
    crop: "Rice",
    category: "Cereal",
    year: "2023-24",
    area: 46.31,
    production: 136.71,
    yield: 2952,
    topStates: [
      { state: "West Bengal", share: 14.2 },
      { state: "Uttar Pradesh", share: 12.8 },
      { state: "Punjab", share: 9.1 },
      { state: "Andhra Pradesh", share: 7.5 },
      { state: "Tamil Nadu", share: 5.8 }
    ],
    trend: "increasing",
    mspPrice: 2300
  },
  {
    crop: "Wheat",
    category: "Cereal",
    year: "2023-24",
    area: 31.46,
    production: 112.74,
    yield: 3583,
    topStates: [
      { state: "Uttar Pradesh", share: 30.2 },
      { state: "Madhya Pradesh", share: 15.8 },
      { state: "Punjab", share: 14.1 },
      { state: "Haryana", share: 10.5 },
      { state: "Rajasthan", share: 8.2 }
    ],
    trend: "increasing",
    mspPrice: 2275
  },
  {
    crop: "Maize",
    category: "Cereal",
    year: "2023-24",
    area: 10.15,
    production: 35.91,
    yield: 3539,
    topStates: [
      { state: "Karnataka", share: 16.2 },
      { state: "Madhya Pradesh", share: 14.5 },
      { state: "Maharashtra", share: 10.1 },
      { state: "Rajasthan", share: 9.8 },
      { state: "Bihar", share: 9.2 }
    ],
    trend: "increasing",
    mspPrice: 2090
  },
  {
    crop: "Bajra (Pearl Millet)",
    category: "Cereal",
    year: "2023-24",
    area: 7.08,
    production: 11.22,
    yield: 1586,
    topStates: [
      { state: "Rajasthan", share: 45.8 },
      { state: "Maharashtra", share: 12.1 },
      { state: "Gujarat", share: 10.5 },
      { state: "Uttar Pradesh", share: 9.2 },
      { state: "Haryana", share: 7.8 }
    ],
    trend: "stable",
    mspPrice: 2500
  },
  {
    crop: "Jowar (Sorghum)",
    category: "Cereal",
    year: "2023-24",
    area: 4.18,
    production: 4.82,
    yield: 1153,
    topStates: [
      { state: "Maharashtra", share: 48.5 },
      { state: "Karnataka", share: 22.1 },
      { state: "Rajasthan", share: 8.5 },
      { state: "Tamil Nadu", share: 5.2 },
      { state: "Telangana", share: 4.8 }
    ],
    trend: "decreasing",
    mspPrice: 3180
  },
  {
    crop: "Chickpea (Gram)",
    category: "Pulse",
    year: "2023-24",
    area: 10.74,
    production: 13.54,
    yield: 1261,
    topStates: [
      { state: "Madhya Pradesh", share: 38.2 },
      { state: "Rajasthan", share: 18.1 },
      { state: "Maharashtra", share: 14.5 },
      { state: "Uttar Pradesh", share: 8.2 },
      { state: "Andhra Pradesh", share: 6.8 }
    ],
    trend: "increasing",
    mspPrice: 5440
  },
  {
    crop: "Tur/Arhar (Pigeon Pea)",
    category: "Pulse",
    year: "2023-24",
    area: 4.58,
    production: 3.46,
    yield: 755,
    topStates: [
      { state: "Maharashtra", share: 30.1 },
      { state: "Karnataka", share: 18.2 },
      { state: "Madhya Pradesh", share: 12.5 },
      { state: "Telangana", share: 8.8 },
      { state: "Uttar Pradesh", share: 8.1 }
    ],
    trend: "stable",
    mspPrice: 7000
  },
  {
    crop: "Urad (Black Gram)",
    category: "Pulse",
    year: "2023-24",
    area: 4.52,
    production: 2.92,
    yield: 646,
    topStates: [
      { state: "Madhya Pradesh", share: 22.5 },
      { state: "Rajasthan", share: 15.8 },
      { state: "Maharashtra", share: 12.1 },
      { state: "Andhra Pradesh", share: 10.5 },
      { state: "Tamil Nadu", share: 8.2 }
    ],
    trend: "stable",
    mspPrice: 6950
  },
  {
    crop: "Moong (Green Gram)",
    category: "Pulse",
    year: "2023-24",
    area: 4.86,
    production: 3.18,
    yield: 654,
    topStates: [
      { state: "Rajasthan", share: 42.5 },
      { state: "Maharashtra", share: 12.2 },
      { state: "Andhra Pradesh", share: 8.5 },
      { state: "Madhya Pradesh", share: 7.8 },
      { state: "Karnataka", share: 6.8 }
    ],
    trend: "increasing",
    mspPrice: 8558
  },
  {
    crop: "Lentil (Masoor)",
    category: "Pulse",
    year: "2023-24",
    area: 1.62,
    production: 1.56,
    yield: 963,
    topStates: [
      { state: "Madhya Pradesh", share: 38.5 },
      { state: "Uttar Pradesh", share: 28.2 },
      { state: "Bihar", share: 12.1 },
      { state: "West Bengal", share: 8.5 },
      { state: "Jharkhand", share: 5.2 }
    ],
    trend: "increasing",
    mspPrice: 6425
  },
  {
    crop: "Soybean",
    category: "Oilseed",
    year: "2023-24",
    area: 12.15,
    production: 13.98,
    yield: 1151,
    topStates: [
      { state: "Madhya Pradesh", share: 52.5 },
      { state: "Maharashtra", share: 32.8 },
      { state: "Rajasthan", share: 8.2 },
      { state: "Karnataka", share: 3.1 },
      { state: "Telangana", share: 1.5 }
    ],
    trend: "increasing",
    mspPrice: 4600
  },
  {
    crop: "Rapeseed-Mustard",
    category: "Oilseed",
    year: "2023-24",
    area: 9.42,
    production: 12.85,
    yield: 1364,
    topStates: [
      { state: "Rajasthan", share: 42.5 },
      { state: "Madhya Pradesh", share: 12.8 },
      { state: "Haryana", share: 8.5 },
      { state: "Uttar Pradesh", share: 8.2 },
      { state: "West Bengal", share: 6.5 }
    ],
    trend: "increasing",
    mspPrice: 5650
  },
  {
    crop: "Groundnut",
    category: "Oilseed",
    year: "2023-24",
    area: 5.54,
    production: 10.12,
    yield: 1827,
    topStates: [
      { state: "Gujarat", share: 38.5 },
      { state: "Rajasthan", share: 18.2 },
      { state: "Andhra Pradesh", share: 12.5 },
      { state: "Tamil Nadu", share: 8.5 },
      { state: "Karnataka", share: 7.2 }
    ],
    trend: "stable",
    mspPrice: 6377
  },
  {
    crop: "Sunflower",
    category: "Oilseed",
    year: "2023-24",
    area: 0.28,
    production: 0.22,
    yield: 786,
    topStates: [
      { state: "Karnataka", share: 68.5 },
      { state: "Maharashtra", share: 12.1 },
      { state: "Andhra Pradesh", share: 8.5 },
      { state: "Tamil Nadu", share: 5.2 },
      { state: "Odisha", share: 2.8 }
    ],
    trend: "decreasing",
    mspPrice: 6760
  },
  {
    crop: "Cotton",
    category: "Fiber",
    year: "2023-24",
    area: 12.68,
    production: 32.52, // million bales (170 kg each)
    yield: 436, // kg lint/ha
    topStates: [
      { state: "Gujarat", share: 25.8 },
      { state: "Maharashtra", share: 24.2 },
      { state: "Telangana", share: 14.5 },
      { state: "Karnataka", share: 8.2 },
      { state: "Andhra Pradesh", share: 7.5 }
    ],
    trend: "stable",
    mspPrice: 6620
  },
  {
    crop: "Sugarcane",
    category: "Commercial",
    year: "2023-24",
    area: 5.72,
    production: 453.15,
    yield: 79221,
    topStates: [
      { state: "Uttar Pradesh", share: 42.5 },
      { state: "Maharashtra", share: 18.2 },
      { state: "Karnataka", share: 12.8 },
      { state: "Tamil Nadu", share: 5.2 },
      { state: "Gujarat", share: 4.5 }
    ],
    trend: "increasing",
    mspPrice: 315 // FRP ₹/quintal
  },
  {
    crop: "Jute",
    category: "Fiber",
    year: "2023-24",
    area: 0.68,
    production: 9.85, // million bales
    yield: 2652,
    topStates: [
      { state: "West Bengal", share: 72.5 },
      { state: "Bihar", share: 10.2 },
      { state: "Assam", share: 8.5 },
      { state: "Odisha", share: 4.2 },
      { state: "Meghalaya", share: 1.8 }
    ],
    trend: "decreasing",
    mspPrice: 5050
  },
  {
    crop: "Tobacco",
    category: "Commercial",
    year: "2023-24",
    area: 0.45,
    production: 0.82,
    yield: 1822,
    topStates: [
      { state: "Andhra Pradesh", share: 62.5 },
      { state: "Gujarat", share: 18.2 },
      { state: "Karnataka", share: 8.5 },
      { state: "Uttar Pradesh", share: 4.2 },
      { state: "West Bengal", share: 3.1 }
    ],
    trend: "decreasing",
    mspPrice: 0 // No MSP
  }
];

// State-wise production summaries
export const stateProductionSummaries: StateProductionSummary[] = [
  {
    state: "Uttar Pradesh",
    totalArea: 17450,
    totalProduction: 62350,
    majorCrops: [
      { crop: "Wheat", area: 9800, production: 35200, yield: 3592 },
      { crop: "Rice", area: 5900, production: 17500, yield: 2966 },
      { crop: "Sugarcane", area: 2250, production: 192500, yield: 85556 },
      { crop: "Potato", area: 610, production: 16200, yield: 26557 },
      { crop: "Mustard", area: 780, production: 1050, yield: 1346 }
    ],
    irrigatedPercentage: 81.5,
    rainfedPercentage: 18.5
  },
  {
    state: "Punjab",
    totalArea: 7920,
    totalProduction: 35800,
    majorCrops: [
      { crop: "Wheat", area: 3520, production: 18420, yield: 5233 },
      { crop: "Rice", area: 3050, production: 12450, yield: 4082 },
      { crop: "Cotton", area: 285, production: 350, yield: 549 },
      { crop: "Maize", area: 120, production: 480, yield: 4000 },
      { crop: "Potato", area: 108, production: 3200, yield: 29630 }
    ],
    irrigatedPercentage: 98.8,
    rainfedPercentage: 1.2
  },
  {
    state: "Madhya Pradesh",
    totalArea: 15200,
    totalProduction: 42500,
    majorCrops: [
      { crop: "Soybean", area: 5420, production: 6850, yield: 1264 },
      { crop: "Wheat", area: 4750, production: 17800, yield: 3747 },
      { crop: "Chickpea", area: 3280, production: 5180, yield: 1579 },
      { crop: "Rice", area: 1920, production: 4250, yield: 2214 },
      { crop: "Maize", area: 1050, production: 5200, yield: 4952 }
    ],
    irrigatedPercentage: 45.2,
    rainfedPercentage: 54.8
  },
  {
    state: "Maharashtra",
    totalArea: 17800,
    totalProduction: 28500,
    majorCrops: [
      { crop: "Soybean", area: 4200, production: 4600, yield: 1095 },
      { crop: "Cotton", area: 4100, production: 7800, yield: 380 },
      { crop: "Sugarcane", area: 1180, production: 82600, yield: 70000 },
      { crop: "Jowar", area: 2050, production: 2340, yield: 1141 },
      { crop: "Onion", area: 550, production: 9800, yield: 17818 }
    ],
    irrigatedPercentage: 22.5,
    rainfedPercentage: 77.5
  },
  {
    state: "Rajasthan",
    totalArea: 19800,
    totalProduction: 25200,
    majorCrops: [
      { crop: "Bajra", area: 4550, production: 5140, yield: 1130 },
      { crop: "Mustard", area: 3200, production: 5460, yield: 1706 },
      { crop: "Wheat", area: 2850, production: 9340, yield: 3277 },
      { crop: "Chickpea", area: 1950, production: 2450, yield: 1256 },
      { crop: "Groundnut", area: 850, production: 1840, yield: 2165 }
    ],
    irrigatedPercentage: 42.8,
    rainfedPercentage: 57.2
  },
  {
    state: "West Bengal",
    totalArea: 9250,
    totalProduction: 32500,
    majorCrops: [
      { crop: "Rice", area: 5520, production: 19420, yield: 3518 },
      { crop: "Potato", area: 410, production: 12500, yield: 30488 },
      { crop: "Jute", area: 580, production: 7150, yield: 2681 },
      { crop: "Wheat", area: 325, production: 850, yield: 2615 },
      { crop: "Mustard", area: 605, production: 840, yield: 1388 }
    ],
    irrigatedPercentage: 65.2,
    rainfedPercentage: 34.8
  },
  {
    state: "Gujarat",
    totalArea: 11200,
    totalProduction: 22800,
    majorCrops: [
      { crop: "Cotton", area: 2850, production: 8380, yield: 564 },
      { crop: "Groundnut", area: 1920, production: 3890, yield: 2026 },
      { crop: "Wheat", area: 1100, production: 3450, yield: 3136 },
      { crop: "Bajra", area: 680, production: 1180, yield: 1735 },
      { crop: "Rice", area: 850, production: 2150, yield: 2529 }
    ],
    irrigatedPercentage: 48.5,
    rainfedPercentage: 51.5
  },
  {
    state: "Karnataka",
    totalArea: 10500,
    totalProduction: 18200,
    majorCrops: [
      { crop: "Rice", area: 1350, production: 4250, yield: 3148 },
      { crop: "Maize", area: 1280, production: 5820, yield: 4547 },
      { crop: "Jowar", area: 850, production: 1065, yield: 1253 },
      { crop: "Cotton", area: 650, production: 2665, yield: 434 },
      { crop: "Sugarcane", area: 580, production: 58000, yield: 100000 }
    ],
    irrigatedPercentage: 35.2,
    rainfedPercentage: 64.8
  },
  {
    state: "Andhra Pradesh",
    totalArea: 6800,
    totalProduction: 18500,
    majorCrops: [
      { crop: "Rice", area: 2250, production: 10250, yield: 4556 },
      { crop: "Groundnut", area: 680, production: 1265, yield: 1860 },
      { crop: "Cotton", area: 620, production: 2440, yield: 473 },
      { crop: "Maize", area: 350, production: 1520, yield: 4343 },
      { crop: "Chickpea", area: 580, production: 920, yield: 1586 }
    ],
    irrigatedPercentage: 52.5,
    rainfedPercentage: 47.5
  },
  {
    state: "Tamil Nadu",
    totalArea: 5200,
    totalProduction: 15800,
    majorCrops: [
      { crop: "Rice", area: 1820, production: 7920, yield: 4352 },
      { crop: "Sugarcane", area: 350, production: 23600, yield: 67429 },
      { crop: "Groundnut", area: 420, production: 860, yield: 2048 },
      { crop: "Maize", area: 280, production: 1250, yield: 4464 },
      { crop: "Cotton", area: 120, production: 540, yield: 519 }
    ],
    irrigatedPercentage: 58.5,
    rainfedPercentage: 41.5
  },
  {
    state: "Haryana",
    totalArea: 6350,
    totalProduction: 22500,
    majorCrops: [
      { crop: "Wheat", area: 2520, production: 12850, yield: 5099 },
      { crop: "Rice", area: 1450, production: 5820, yield: 4014 },
      { crop: "Mustard", area: 620, production: 1095, yield: 1766 },
      { crop: "Cotton", area: 580, production: 1760, yield: 503 },
      { crop: "Bajra", area: 420, production: 875, yield: 2083 }
    ],
    irrigatedPercentage: 90.5,
    rainfedPercentage: 9.5
  },
  {
    state: "Bihar",
    totalArea: 7200,
    totalProduction: 19800,
    majorCrops: [
      { crop: "Rice", area: 3280, production: 8520, yield: 2598 },
      { crop: "Wheat", area: 2150, production: 6450, yield: 3000 },
      { crop: "Maize", area: 850, production: 3300, yield: 3882 },
      { crop: "Potato", area: 320, production: 8500, yield: 26563 },
      { crop: "Lentil", area: 185, production: 190, yield: 1027 }
    ],
    irrigatedPercentage: 68.5,
    rainfedPercentage: 31.5
  },
  {
    state: "Telangana",
    totalArea: 5800,
    totalProduction: 12500,
    majorCrops: [
      { crop: "Rice", area: 2050, production: 8200, yield: 4000 },
      { crop: "Cotton", area: 1850, production: 4720, yield: 435 },
      { crop: "Maize", area: 520, production: 2280, yield: 4385 },
      { crop: "Soybean", area: 180, production: 210, yield: 1167 },
      { crop: "Turmeric", area: 120, production: 420, yield: 3500 }
    ],
    irrigatedPercentage: 52.8,
    rainfedPercentage: 47.2
  }
];

// District-level production records (representative sample from major districts)
export const districtProductionRecords: CropProductionEntry[] = [
  // Punjab
  { state: "Punjab", district: "Ludhiana", crop: "Wheat", season: "Rabi", year: "2023-24", area: 285000, production: 1567500, yield: 5500 },
  { state: "Punjab", district: "Ludhiana", crop: "Rice", season: "Kharif", year: "2023-24", area: 250000, production: 1075000, yield: 4300 },
  { state: "Punjab", district: "Sangrur", crop: "Wheat", season: "Rabi", year: "2023-24", area: 310000, production: 1612000, yield: 5200 },
  { state: "Punjab", district: "Sangrur", crop: "Rice", season: "Kharif", year: "2023-24", area: 275000, production: 1210000, yield: 4400 },
  { state: "Punjab", district: "Bathinda", crop: "Cotton", season: "Kharif", year: "2023-24", area: 85000, production: 42500, yield: 500 },
  // Uttar Pradesh
  { state: "Uttar Pradesh", district: "Lucknow", crop: "Rice", season: "Kharif", year: "2023-24", area: 45000, production: 135000, yield: 3000 },
  { state: "Uttar Pradesh", district: "Lucknow", crop: "Wheat", season: "Rabi", year: "2023-24", area: 52000, production: 187200, yield: 3600 },
  { state: "Uttar Pradesh", district: "Agra", crop: "Potato", season: "Rabi", year: "2023-24", area: 32000, production: 896000, yield: 28000 },
  { state: "Uttar Pradesh", district: "Meerut", crop: "Sugarcane", season: "Whole Year", year: "2023-24", area: 85000, production: 7225000, yield: 85000 },
  { state: "Uttar Pradesh", district: "Muzaffarnagar", crop: "Sugarcane", season: "Whole Year", year: "2023-24", area: 120000, production: 10800000, yield: 90000 },
  // Madhya Pradesh
  { state: "Madhya Pradesh", district: "Indore", crop: "Soybean", season: "Kharif", year: "2023-24", area: 320000, production: 448000, yield: 1400 },
  { state: "Madhya Pradesh", district: "Indore", crop: "Wheat", season: "Rabi", year: "2023-24", area: 180000, production: 756000, yield: 4200 },
  { state: "Madhya Pradesh", district: "Ujjain", crop: "Soybean", season: "Kharif", year: "2023-24", area: 280000, production: 364000, yield: 1300 },
  { state: "Madhya Pradesh", district: "Vidisha", crop: "Chickpea", season: "Rabi", year: "2023-24", area: 185000, production: 296000, yield: 1600 },
  // Maharashtra
  { state: "Maharashtra", district: "Nashik", crop: "Onion", season: "Rabi", year: "2023-24", area: 115000, production: 2300000, yield: 20000 },
  { state: "Maharashtra", district: "Nagpur", crop: "Cotton", season: "Kharif", year: "2023-24", area: 185000, production: 68450, yield: 370 },
  { state: "Maharashtra", district: "Kolhapur", crop: "Sugarcane", season: "Whole Year", year: "2023-24", area: 120000, production: 12000000, yield: 100000 },
  { state: "Maharashtra", district: "Amravati", crop: "Soybean", season: "Kharif", year: "2023-24", area: 240000, production: 264000, yield: 1100 },
  // Rajasthan
  { state: "Rajasthan", district: "Sri Ganganagar", crop: "Mustard", season: "Rabi", year: "2023-24", area: 250000, production: 500000, yield: 2000 },
  { state: "Rajasthan", district: "Jodhpur", crop: "Bajra", season: "Kharif", year: "2023-24", area: 420000, production: 420000, yield: 1000 },
  { state: "Rajasthan", district: "Jaipur", crop: "Wheat", season: "Rabi", year: "2023-24", area: 150000, production: 525000, yield: 3500 },
  { state: "Rajasthan", district: "Alwar", crop: "Mustard", season: "Rabi", year: "2023-24", area: 180000, production: 324000, yield: 1800 },
  // West Bengal
  { state: "West Bengal", district: "Bardhaman", crop: "Rice", season: "Kharif", year: "2023-24", area: 285000, production: 1140000, yield: 4000 },
  { state: "West Bengal", district: "Hooghly", crop: "Potato", season: "Rabi", year: "2023-24", area: 45000, production: 1350000, yield: 30000 },
  { state: "West Bengal", district: "Murshidabad", crop: "Jute", season: "Kharif", year: "2023-24", area: 95000, production: 266000, yield: 2800 },
  // Gujarat
  { state: "Gujarat", district: "Rajkot", crop: "Groundnut", season: "Kharif", year: "2023-24", area: 185000, production: 407000, yield: 2200 },
  { state: "Gujarat", district: "Surendranagar", crop: "Cotton", season: "Kharif", year: "2023-24", area: 220000, production: 132000, yield: 600 },
  { state: "Gujarat", district: "Banaskantha", crop: "Mustard", season: "Rabi", year: "2023-24", area: 120000, production: 204000, yield: 1700 },
  // Karnataka
  { state: "Karnataka", district: "Davangere", crop: "Maize", season: "Kharif", year: "2023-24", area: 150000, production: 750000, yield: 5000 },
  { state: "Karnataka", district: "Belgaum", crop: "Sugarcane", season: "Whole Year", year: "2023-24", area: 85000, production: 8500000, yield: 100000 },
  { state: "Karnataka", district: "Dharwad", crop: "Jowar", season: "Rabi", year: "2023-24", area: 65000, production: 81250, yield: 1250 },
  // Bihar
  { state: "Bihar", district: "Rohtas", crop: "Rice", season: "Kharif", year: "2023-24", area: 120000, production: 360000, yield: 3000 },
  { state: "Bihar", district: "Samastipur", crop: "Wheat", season: "Rabi", year: "2023-24", area: 95000, production: 285000, yield: 3000 },
  { state: "Bihar", district: "Nalanda", crop: "Rice", season: "Kharif", year: "2023-24", area: 85000, production: 297500, yield: 3500 },
  // Tamil Nadu
  { state: "Tamil Nadu", district: "Thanjavur", crop: "Rice", season: "Kharif", year: "2023-24", area: 180000, production: 900000, yield: 5000 },
  { state: "Tamil Nadu", district: "Erode", crop: "Turmeric", season: "Kharif", year: "2023-24", area: 25000, production: 150000, yield: 6000 },
  { state: "Tamil Nadu", district: "Coimbatore", crop: "Sugarcane", season: "Whole Year", year: "2023-24", area: 42000, production: 2940000, yield: 70000 },
  // Telangana
  { state: "Telangana", district: "Nizamabad", crop: "Rice", season: "Kharif", year: "2023-24", area: 165000, production: 742500, yield: 4500 },
  { state: "Telangana", district: "Adilabad", crop: "Cotton", season: "Kharif", year: "2023-24", area: 150000, production: 67500, yield: 450 },
  // Andhra Pradesh
  { state: "Andhra Pradesh", district: "East Godavari", crop: "Rice", season: "Kharif", year: "2023-24", area: 245000, production: 1347500, yield: 5500 },
  { state: "Andhra Pradesh", district: "Kurnool", crop: "Groundnut", season: "Kharif", year: "2023-24", area: 125000, production: 237500, yield: 1900 },
  // Haryana
  { state: "Haryana", district: "Karnal", crop: "Rice", season: "Kharif", year: "2023-24", area: 145000, production: 652500, yield: 4500 },
  { state: "Haryana", district: "Karnal", crop: "Wheat", season: "Rabi", year: "2023-24", area: 165000, production: 874500, yield: 5300 },
  { state: "Haryana", district: "Sirsa", crop: "Cotton", season: "Kharif", year: "2023-24", area: 180000, production: 90000, yield: 500 }
];

// ============ HELPER FUNCTIONS ============

export const getProductionByState = (state: string): CropProductionEntry[] =>
  districtProductionRecords.filter(r => r.state.toLowerCase() === state.toLowerCase());

export const getProductionByCrop = (crop: string): CropProductionEntry[] =>
  districtProductionRecords.filter(r => r.crop.toLowerCase() === crop.toLowerCase());

export const getNationalStatsByCrop = (crop: string): NationalCropStats | undefined =>
  nationalCropStats.find(s => s.crop.toLowerCase() === crop.toLowerCase());

export const getStateSummary = (state: string): StateProductionSummary | undefined =>
  stateProductionSummaries.find(s => s.state.toLowerCase() === state.toLowerCase());

export const getTopProducingStates = (crop: string): { state: string; share: number }[] => {
  const stats = nationalCropStats.find(s => s.crop.toLowerCase() === crop.toLowerCase());
  return stats?.topStates ?? [];
};

export const getCropsByTrend = (trend: "increasing" | "stable" | "decreasing"): NationalCropStats[] =>
  nationalCropStats.filter(s => s.trend === trend);
