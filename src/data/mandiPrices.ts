// Mandi (Agricultural Market) Price Dataset
// Source: AGMARKNET (agmarknet.gov.in), eNAM portal, APMC market data
// Real commodity prices from major Indian mandis

import { createDatasetMetadata } from "./datasetMetadata";

export interface MandiPrice {
  id: string;
  commodity: string;
  hindiName: string;
  variety: string;
  category: "cereal" | "pulse" | "oilseed" | "vegetable" | "fruit" | "spice" | "fiber" | "other";
  unit: string;
  mspPrice: number | null; // Minimum Support Price (₹/quintal) 2024-25
  marketPrices: MarketEntry[];
}

export interface MarketEntry {
  market: string;
  district: string;
  state: string;
  minPrice: number; // ₹/quintal
  maxPrice: number;
  modalPrice: number;
  date: string;
  arrivals: number; // tonnes
}

export interface PriceTrend {
  commodity: string;
  monthlyAvg: { month: string; avgPrice: number }[];
  yearlyAvg: { year: string; avgPrice: number }[];
  seasonalPattern: string;
  volatility: "low" | "medium" | "high" | "extreme";
}

export const mandiPricesMetadata = createDatasetMetadata({
  version: "1.0.0",
  lastUpdated: "2024-12-01T00:00:00Z",
  source: "AGMARKNET, eNAM, APMC market data",
  notes: "Snapshot of representative mandi pricing for 2024.",
});

export const mandiPrices: MandiPrice[] = [
  // ==================== CEREALS ====================
  {
    id: "wheat_mp",
    commodity: "Wheat",
    hindiName: "गेहूं",
    variety: "Lokwan / Sharbati / PBW 343",
    category: "cereal",
    unit: "₹/quintal",
    mspPrice: 2275,
    marketPrices: [
      { market: "Azadpur", district: "New Delhi", state: "Delhi", minPrice: 2250, maxPrice: 2800, modalPrice: 2450, date: "2024-12", arrivals: 850 },
      { market: "Khanna", district: "Ludhiana", state: "Punjab", minPrice: 2275, maxPrice: 2650, modalPrice: 2400, date: "2024-12", arrivals: 2500 },
      { market: "Narela", district: "New Delhi", state: "Delhi", minPrice: 2200, maxPrice: 2700, modalPrice: 2380, date: "2024-12", arrivals: 680 },
      { market: "Hapur", district: "Hapur", state: "Uttar Pradesh", minPrice: 2180, maxPrice: 2550, modalPrice: 2350, date: "2024-12", arrivals: 1200 },
      { market: "Indore", district: "Indore", state: "Madhya Pradesh", minPrice: 2250, maxPrice: 2900, modalPrice: 2550, date: "2024-12", arrivals: 3200 },
      { market: "Karnal", district: "Karnal", state: "Haryana", minPrice: 2275, maxPrice: 2600, modalPrice: 2380, date: "2024-12", arrivals: 1800 },
      { market: "Jaipur", district: "Jaipur", state: "Rajasthan", minPrice: 2200, maxPrice: 2750, modalPrice: 2420, date: "2024-12", arrivals: 950 },
      { market: "Dewas", district: "Dewas", state: "Madhya Pradesh", minPrice: 2280, maxPrice: 2850, modalPrice: 2520, date: "2024-12", arrivals: 1500 }
    ]
  },
  {
    id: "rice_mp",
    commodity: "Rice (Paddy)",
    hindiName: "धान",
    variety: "Common / Grade-A / Basmati",
    category: "cereal",
    unit: "₹/quintal",
    mspPrice: 2300,
    marketPrices: [
      { market: "Karnal", district: "Karnal", state: "Haryana", minPrice: 2100, maxPrice: 3800, modalPrice: 2500, date: "2024-12", arrivals: 4500 },
      { market: "Khanna", district: "Ludhiana", state: "Punjab", minPrice: 2300, maxPrice: 3200, modalPrice: 2600, date: "2024-12", arrivals: 5200 },
      { market: "Gorakhpur", district: "Gorakhpur", state: "Uttar Pradesh", minPrice: 1950, maxPrice: 2500, modalPrice: 2200, date: "2024-12", arrivals: 2800 },
      { market: "Nellore", district: "Nellore", state: "Andhra Pradesh", minPrice: 2100, maxPrice: 2800, modalPrice: 2350, date: "2024-12", arrivals: 3500 },
      { market: "Burdwan", district: "Bardhaman", state: "West Bengal", minPrice: 1900, maxPrice: 2600, modalPrice: 2250, date: "2024-12", arrivals: 3200 },
      { market: "Thanjavur", district: "Thanjavur", state: "Tamil Nadu", minPrice: 2000, maxPrice: 2700, modalPrice: 2300, date: "2024-12", arrivals: 2100 }
    ]
  },
  {
    id: "maize_mp",
    commodity: "Maize",
    hindiName: "मक्का",
    variety: "Yellow / White / Hybrid",
    category: "cereal",
    unit: "₹/quintal",
    mspPrice: 2090,
    marketPrices: [
      { market: "Davangere", district: "Davangere", state: "Karnataka", minPrice: 1900, maxPrice: 2400, modalPrice: 2100, date: "2024-12", arrivals: 3500 },
      { market: "Gulbarga", district: "Kalaburagi", state: "Karnataka", minPrice: 1850, maxPrice: 2350, modalPrice: 2050, date: "2024-12", arrivals: 2800 },
      { market: "Nizamabad", district: "Nizamabad", state: "Telangana", minPrice: 1800, maxPrice: 2300, modalPrice: 2000, date: "2024-12", arrivals: 2200 },
      { market: "Bhilwara", district: "Bhilwara", state: "Rajasthan", minPrice: 1900, maxPrice: 2250, modalPrice: 2050, date: "2024-12", arrivals: 1500 },
      { market: "Chhindwara", district: "Chhindwara", state: "Madhya Pradesh", minPrice: 1850, maxPrice: 2300, modalPrice: 2080, date: "2024-12", arrivals: 1800 }
    ]
  },

  // ==================== PULSES ====================
  {
    id: "chana_mp",
    commodity: "Chickpea (Gram)",
    hindiName: "चना",
    variety: "Desi / Kabuli",
    category: "pulse",
    unit: "₹/quintal",
    mspPrice: 5440,
    marketPrices: [
      { market: "Indore", district: "Indore", state: "Madhya Pradesh", minPrice: 5200, maxPrice: 6800, modalPrice: 5800, date: "2024-12", arrivals: 4200 },
      { market: "Latur", district: "Latur", state: "Maharashtra", minPrice: 5100, maxPrice: 6500, modalPrice: 5600, date: "2024-12", arrivals: 3800 },
      { market: "Bikaner", district: "Bikaner", state: "Rajasthan", minPrice: 5300, maxPrice: 6200, modalPrice: 5650, date: "2024-12", arrivals: 2500 },
      { market: "Kota", district: "Kota", state: "Rajasthan", minPrice: 5250, maxPrice: 6600, modalPrice: 5700, date: "2024-12", arrivals: 2100 },
      { market: "Akola", district: "Akola", state: "Maharashtra", minPrice: 5000, maxPrice: 6400, modalPrice: 5500, date: "2024-12", arrivals: 1900 },
      { market: "Jaipur", district: "Jaipur", state: "Rajasthan", minPrice: 5400, maxPrice: 7000, modalPrice: 5900, date: "2024-12", arrivals: 1500 }
    ]
  },
  {
    id: "moong_mp",
    commodity: "Green Gram (Moong)",
    hindiName: "मूंग",
    variety: "Bold / Small",
    category: "pulse",
    unit: "₹/quintal",
    mspPrice: 8558,
    marketPrices: [
      { market: "Jodhpur", district: "Jodhpur", state: "Rajasthan", minPrice: 7500, maxPrice: 10500, modalPrice: 8800, date: "2024-12", arrivals: 1500 },
      { market: "Nagaur", district: "Nagaur", state: "Rajasthan", minPrice: 7200, maxPrice: 10000, modalPrice: 8500, date: "2024-12", arrivals: 1200 },
      { market: "Indore", district: "Indore", state: "Madhya Pradesh", minPrice: 7800, maxPrice: 10200, modalPrice: 8900, date: "2024-12", arrivals: 800 },
      { market: "Latur", district: "Latur", state: "Maharashtra", minPrice: 7000, maxPrice: 9800, modalPrice: 8400, date: "2024-12", arrivals: 900 }
    ]
  },
  {
    id: "tur_mp",
    commodity: "Pigeon Pea (Tur/Arhar)",
    hindiName: "तूर / अरहर",
    variety: "FAQ / Medium",
    category: "pulse",
    unit: "₹/quintal",
    mspPrice: 7000,
    marketPrices: [
      { market: "Latur", district: "Latur", state: "Maharashtra", minPrice: 8500, maxPrice: 12000, modalPrice: 9800, date: "2024-12", arrivals: 3500 },
      { market: "Gulbarga", district: "Kalaburagi", state: "Karnataka", minPrice: 8200, maxPrice: 11500, modalPrice: 9500, date: "2024-12", arrivals: 2800 },
      { market: "Akola", district: "Akola", state: "Maharashtra", minPrice: 8000, maxPrice: 11800, modalPrice: 9600, date: "2024-12", arrivals: 2200 },
      { market: "Indore", district: "Indore", state: "Madhya Pradesh", minPrice: 8500, maxPrice: 12500, modalPrice: 10000, date: "2024-12", arrivals: 1800 },
      { market: "Nagpur", district: "Nagpur", state: "Maharashtra", minPrice: 8300, maxPrice: 11200, modalPrice: 9400, date: "2024-12", arrivals: 1500 }
    ]
  },
  {
    id: "urad_mp",
    commodity: "Black Gram (Urad)",
    hindiName: "उड़द",
    variety: "Bold / Small / Munger",
    category: "pulse",
    unit: "₹/quintal",
    mspPrice: 6950,
    marketPrices: [
      { market: "Indore", district: "Indore", state: "Madhya Pradesh", minPrice: 6500, maxPrice: 9500, modalPrice: 7800, date: "2024-12", arrivals: 1200 },
      { market: "Nagpur", district: "Nagpur", state: "Maharashtra", minPrice: 6200, maxPrice: 9000, modalPrice: 7500, date: "2024-12", arrivals: 900 },
      { market: "Latur", district: "Latur", state: "Maharashtra", minPrice: 6000, maxPrice: 8800, modalPrice: 7400, date: "2024-12", arrivals: 1100 },
      { market: "Bikaner", district: "Bikaner", state: "Rajasthan", minPrice: 6800, maxPrice: 9200, modalPrice: 7900, date: "2024-12", arrivals: 700 }
    ]
  },
  {
    id: "masoor_mp",
    commodity: "Lentil (Masoor)",
    hindiName: "मसूर",
    variety: "Bold / Small Red",
    category: "pulse",
    unit: "₹/quintal",
    mspPrice: 6425,
    marketPrices: [
      { market: "Indore", district: "Indore", state: "Madhya Pradesh", minPrice: 5800, maxPrice: 7500, modalPrice: 6500, date: "2024-12", arrivals: 1500 },
      { market: "Rewa", district: "Rewa", state: "Madhya Pradesh", minPrice: 5500, maxPrice: 7200, modalPrice: 6200, date: "2024-12", arrivals: 800 },
      { market: "Varanasi", district: "Varanasi", state: "Uttar Pradesh", minPrice: 5600, maxPrice: 7000, modalPrice: 6300, date: "2024-12", arrivals: 600 }
    ]
  },

  // ==================== OILSEEDS ====================
  {
    id: "mustard_mp",
    commodity: "Mustard (Rapeseed)",
    hindiName: "सरसों",
    variety: "Bold / Small / Lahi",
    category: "oilseed",
    unit: "₹/quintal",
    mspPrice: 5650,
    marketPrices: [
      { market: "Jaipur", district: "Jaipur", state: "Rajasthan", minPrice: 5200, maxPrice: 6800, modalPrice: 5900, date: "2024-12", arrivals: 3500 },
      { market: "Alwar", district: "Alwar", state: "Rajasthan", minPrice: 5100, maxPrice: 6500, modalPrice: 5800, date: "2024-12", arrivals: 2800 },
      { market: "Sri Ganganagar", district: "Sri Ganganagar", state: "Rajasthan", minPrice: 5300, maxPrice: 6900, modalPrice: 6000, date: "2024-12", arrivals: 4200 },
      { market: "Hapur", district: "Hapur", state: "Uttar Pradesh", minPrice: 5000, maxPrice: 6400, modalPrice: 5700, date: "2024-12", arrivals: 1800 },
      { market: "Morena", district: "Morena", state: "Madhya Pradesh", minPrice: 5200, maxPrice: 6600, modalPrice: 5850, date: "2024-12", arrivals: 1500 }
    ]
  },
  {
    id: "soybean_mp",
    commodity: "Soybean",
    hindiName: "सोयाबीन",
    variety: "Yellow",
    category: "oilseed",
    unit: "₹/quintal",
    mspPrice: 4600,
    marketPrices: [
      { market: "Indore", district: "Indore", state: "Madhya Pradesh", minPrice: 4200, maxPrice: 5500, modalPrice: 4800, date: "2024-12", arrivals: 8500 },
      { market: "Ujjain", district: "Ujjain", state: "Madhya Pradesh", minPrice: 4100, maxPrice: 5300, modalPrice: 4700, date: "2024-12", arrivals: 5200 },
      { market: "Latur", district: "Latur", state: "Maharashtra", minPrice: 4000, maxPrice: 5200, modalPrice: 4600, date: "2024-12", arrivals: 4800 },
      { market: "Nagpur", district: "Nagpur", state: "Maharashtra", minPrice: 4100, maxPrice: 5100, modalPrice: 4650, date: "2024-12", arrivals: 3500 },
      { market: "Khandwa", district: "Khandwa", state: "Madhya Pradesh", minPrice: 4000, maxPrice: 5400, modalPrice: 4750, date: "2024-12", arrivals: 3000 }
    ]
  },
  {
    id: "groundnut_mp",
    commodity: "Groundnut",
    hindiName: "मूंगफली",
    variety: "Bold / Java / TG 51",
    category: "oilseed",
    unit: "₹/quintal",
    mspPrice: 6377,
    marketPrices: [
      { market: "Rajkot", district: "Rajkot", state: "Gujarat", minPrice: 5500, maxPrice: 8500, modalPrice: 6800, date: "2024-12", arrivals: 5500 },
      { market: "Gondal", district: "Rajkot", state: "Gujarat", minPrice: 5800, maxPrice: 9000, modalPrice: 7200, date: "2024-12", arrivals: 4200 },
      { market: "Junagadh", district: "Junagadh", state: "Gujarat", minPrice: 5200, maxPrice: 8000, modalPrice: 6500, date: "2024-12", arrivals: 3800 },
      { market: "Kurnool", district: "Kurnool", state: "Andhra Pradesh", minPrice: 5000, maxPrice: 7500, modalPrice: 6200, date: "2024-12", arrivals: 2500 },
      { market: "Villupuram", district: "Villupuram", state: "Tamil Nadu", minPrice: 5300, maxPrice: 7800, modalPrice: 6400, date: "2024-12", arrivals: 1800 }
    ]
  },

  // ==================== VEGETABLES ====================
  {
    id: "onion_mp",
    commodity: "Onion",
    hindiName: "प्याज",
    variety: "Red / White / Bangalore Rose",
    category: "vegetable",
    unit: "₹/quintal",
    mspPrice: null,
    marketPrices: [
      { market: "Lasalgaon", district: "Nashik", state: "Maharashtra", minPrice: 800, maxPrice: 3500, modalPrice: 1800, date: "2024-12", arrivals: 15000 },
      { market: "Pimpalgaon", district: "Nashik", state: "Maharashtra", minPrice: 700, maxPrice: 3200, modalPrice: 1700, date: "2024-12", arrivals: 8500 },
      { market: "Azadpur", district: "New Delhi", state: "Delhi", minPrice: 1200, maxPrice: 4000, modalPrice: 2200, date: "2024-12", arrivals: 6500 },
      { market: "Bangalore", district: "Bangalore", state: "Karnataka", minPrice: 1000, maxPrice: 3800, modalPrice: 2000, date: "2024-12", arrivals: 3500 },
      { market: "Mandsaur", district: "Mandsaur", state: "Madhya Pradesh", minPrice: 600, maxPrice: 2800, modalPrice: 1500, date: "2024-12", arrivals: 5200 },
      { market: "Hubli", district: "Dharwad", state: "Karnataka", minPrice: 900, maxPrice: 3500, modalPrice: 1900, date: "2024-12", arrivals: 2800 }
    ]
  },
  {
    id: "tomato_mp",
    commodity: "Tomato",
    hindiName: "टमाटर",
    variety: "Hybrid / Local / Desi",
    category: "vegetable",
    unit: "₹/quintal",
    mspPrice: null,
    marketPrices: [
      { market: "Kolar", district: "Kolar", state: "Karnataka", minPrice: 500, maxPrice: 4500, modalPrice: 1500, date: "2024-12", arrivals: 5500 },
      { market: "Madanapalle", district: "Annamayya", state: "Andhra Pradesh", minPrice: 400, maxPrice: 4000, modalPrice: 1400, date: "2024-12", arrivals: 4800 },
      { market: "Azadpur", district: "New Delhi", state: "Delhi", minPrice: 800, maxPrice: 5000, modalPrice: 2000, date: "2024-12", arrivals: 5200 },
      { market: "Pune", district: "Pune", state: "Maharashtra", minPrice: 600, maxPrice: 4200, modalPrice: 1600, date: "2024-12", arrivals: 3500 },
      { market: "Narayangaon", district: "Pune", state: "Maharashtra", minPrice: 500, maxPrice: 3800, modalPrice: 1500, date: "2024-12", arrivals: 2800 }
    ]
  },
  {
    id: "potato_mp",
    commodity: "Potato",
    hindiName: "आलू",
    variety: "Jyoti / Pukhraj / Chandramukhi",
    category: "vegetable",
    unit: "₹/quintal",
    mspPrice: null,
    marketPrices: [
      { market: "Agra", district: "Agra", state: "Uttar Pradesh", minPrice: 400, maxPrice: 1800, modalPrice: 900, date: "2024-12", arrivals: 8500 },
      { market: "Azadpur", district: "New Delhi", state: "Delhi", minPrice: 600, maxPrice: 2200, modalPrice: 1200, date: "2024-12", arrivals: 6500 },
      { market: "Hooghly", district: "Hooghly", state: "West Bengal", minPrice: 500, maxPrice: 1600, modalPrice: 850, date: "2024-12", arrivals: 5200 },
      { market: "Jalandhar", district: "Jalandhar", state: "Punjab", minPrice: 500, maxPrice: 1900, modalPrice: 1000, date: "2024-12", arrivals: 4200 },
      { market: "Indore", district: "Indore", state: "Madhya Pradesh", minPrice: 550, maxPrice: 2000, modalPrice: 1100, date: "2024-12", arrivals: 3800 }
    ]
  },
  {
    id: "chilli_mp",
    commodity: "Green Chilli",
    hindiName: "हरी मिर्च",
    variety: "Jwala / Bullet / Byadagi",
    category: "vegetable",
    unit: "₹/quintal",
    mspPrice: null,
    marketPrices: [
      { market: "Guntur", district: "Guntur", state: "Andhra Pradesh", minPrice: 2000, maxPrice: 18000, modalPrice: 8000, date: "2024-12", arrivals: 12000 },
      { market: "Khammam", district: "Khammam", state: "Telangana", minPrice: 1800, maxPrice: 15000, modalPrice: 7500, date: "2024-12", arrivals: 5500 },
      { market: "Warangal", district: "Warangal", state: "Telangana", minPrice: 2000, maxPrice: 16000, modalPrice: 7800, date: "2024-12", arrivals: 4200 },
      { market: "Azadpur", district: "New Delhi", state: "Delhi", minPrice: 3000, maxPrice: 8000, modalPrice: 5000, date: "2024-12", arrivals: 2500 }
    ]
  },

  // ==================== SPICES ====================
  {
    id: "turmeric_mp",
    commodity: "Turmeric",
    hindiName: "हल्दी",
    variety: "Erode / Salem / Nizamabad / Sangli",
    category: "spice",
    unit: "₹/quintal",
    mspPrice: null,
    marketPrices: [
      { market: "Erode", district: "Erode", state: "Tamil Nadu", minPrice: 10000, maxPrice: 18000, modalPrice: 13500, date: "2024-12", arrivals: 3500 },
      { market: "Nizamabad", district: "Nizamabad", state: "Telangana", minPrice: 9500, maxPrice: 17000, modalPrice: 13000, date: "2024-12", arrivals: 2800 },
      { market: "Sangli", district: "Sangli", state: "Maharashtra", minPrice: 9000, maxPrice: 16500, modalPrice: 12500, date: "2024-12", arrivals: 2200 },
      { market: "Duggirala", district: "Guntur", state: "Andhra Pradesh", minPrice: 9500, maxPrice: 16000, modalPrice: 12800, date: "2024-12", arrivals: 1800 }
    ]
  },
  {
    id: "jeera_mp",
    commodity: "Cumin (Jeera)",
    hindiName: "जीरा",
    variety: "Bold / Medium / Small",
    category: "spice",
    unit: "₹/quintal",
    mspPrice: null,
    marketPrices: [
      { market: "Unjha", district: "Mehsana", state: "Gujarat", minPrice: 28000, maxPrice: 55000, modalPrice: 42000, date: "2024-12", arrivals: 5500 },
      { market: "Jodhpur", district: "Jodhpur", state: "Rajasthan", minPrice: 26000, maxPrice: 52000, modalPrice: 40000, date: "2024-12", arrivals: 3200 },
      { market: "Nagaur", district: "Nagaur", state: "Rajasthan", minPrice: 25000, maxPrice: 50000, modalPrice: 38000, date: "2024-12", arrivals: 2800 }
    ]
  },

  // ==================== FIBER ====================
  {
    id: "cotton_mp",
    commodity: "Cotton",
    hindiName: "कपास",
    variety: "DCH-32 / Bunny / Long Staple",
    category: "fiber",
    unit: "₹/quintal",
    mspPrice: 6620,
    marketPrices: [
      { market: "Rajkot", district: "Rajkot", state: "Gujarat", minPrice: 6200, maxPrice: 7800, modalPrice: 7000, date: "2024-12", arrivals: 8500 },
      { market: "Amreli", district: "Amreli", state: "Gujarat", minPrice: 6000, maxPrice: 7500, modalPrice: 6800, date: "2024-12", arrivals: 5200 },
      { market: "Adilabad", district: "Adilabad", state: "Telangana", minPrice: 6100, maxPrice: 7200, modalPrice: 6700, date: "2024-12", arrivals: 4500 },
      { market: "Akola", district: "Akola", state: "Maharashtra", minPrice: 6000, maxPrice: 7400, modalPrice: 6750, date: "2024-12", arrivals: 6200 },
      { market: "Yavatmal", district: "Yavatmal", state: "Maharashtra", minPrice: 5800, maxPrice: 7200, modalPrice: 6600, date: "2024-12", arrivals: 4800 },
      { market: "Sirsa", district: "Sirsa", state: "Haryana", minPrice: 6200, maxPrice: 7600, modalPrice: 6900, date: "2024-12", arrivals: 3500 }
    ]
  }
];

// Price trends for major commodities (monthly patterns)
export const priceTrends: PriceTrend[] = [
  {
    commodity: "Onion",
    monthlyAvg: [
      { month: "Jan", avgPrice: 1800 }, { month: "Feb", avgPrice: 1500 },
      { month: "Mar", avgPrice: 1200 }, { month: "Apr", avgPrice: 1000 },
      { month: "May", avgPrice: 1200 }, { month: "Jun", avgPrice: 1800 },
      { month: "Jul", avgPrice: 2500 }, { month: "Aug", avgPrice: 3500 },
      { month: "Sep", avgPrice: 4000 }, { month: "Oct", avgPrice: 3500 },
      { month: "Nov", avgPrice: 2800 }, { month: "Dec", avgPrice: 2200 }
    ],
    yearlyAvg: [
      { year: "2020", avgPrice: 1550 }, { year: "2021", avgPrice: 1850 },
      { year: "2022", avgPrice: 2100 }, { year: "2023", avgPrice: 2450 },
      { year: "2024", avgPrice: 2200 }
    ],
    seasonalPattern: "Prices peak during Aug-Oct (lean season between Kharif and Rabi harvest). Crash in Nov-Mar post Rabi harvest when arrivals are high.",
    volatility: "extreme"
  },
  {
    commodity: "Tomato",
    monthlyAvg: [
      { month: "Jan", avgPrice: 1200 }, { month: "Feb", avgPrice: 800 },
      { month: "Mar", avgPrice: 600 }, { month: "Apr", avgPrice: 500 },
      { month: "May", avgPrice: 1000 }, { month: "Jun", avgPrice: 2500 },
      { month: "Jul", avgPrice: 4000 }, { month: "Aug", avgPrice: 3000 },
      { month: "Sep", avgPrice: 2000 }, { month: "Oct", avgPrice: 1500 },
      { month: "Nov", avgPrice: 1200 }, { month: "Dec", avgPrice: 1500 }
    ],
    yearlyAvg: [
      { year: "2020", avgPrice: 1200 }, { year: "2021", avgPrice: 1500 },
      { year: "2022", avgPrice: 1800 }, { year: "2023", avgPrice: 2800 },
      { year: "2024", avgPrice: 1600 }
    ],
    seasonalPattern: "Extreme price spikes in Jun-Aug due to monsoon disruptions. Glut periods in Feb-Apr when Rabi crop harvesting peaks. 2023 saw ₹200+/kg crisis.",
    volatility: "extreme"
  },
  {
    commodity: "Wheat",
    monthlyAvg: [
      { month: "Jan", avgPrice: 2500 }, { month: "Feb", avgPrice: 2550 },
      { month: "Mar", avgPrice: 2400 }, { month: "Apr", avgPrice: 2275 },
      { month: "May", avgPrice: 2300 }, { month: "Jun", avgPrice: 2350 },
      { month: "Jul", avgPrice: 2400 }, { month: "Aug", avgPrice: 2450 },
      { month: "Sep", avgPrice: 2500 }, { month: "Oct", avgPrice: 2550 },
      { month: "Nov", avgPrice: 2600 }, { month: "Dec", avgPrice: 2650 }
    ],
    yearlyAvg: [
      { year: "2020", avgPrice: 2000 }, { year: "2021", avgPrice: 2100 },
      { year: "2022", avgPrice: 2450 }, { year: "2023", avgPrice: 2550 },
      { year: "2024", avgPrice: 2500 }
    ],
    seasonalPattern: "Prices dip in Apr-May (harvest season). Gradual increase Jul-Dec as stocks reduce. Government procurement at MSP stabilizes market.",
    volatility: "low"
  },
  {
    commodity: "Rice (Paddy)",
    monthlyAvg: [
      { month: "Jan", avgPrice: 2400 }, { month: "Feb", avgPrice: 2350 },
      { month: "Mar", avgPrice: 2300 }, { month: "Apr", avgPrice: 2350 },
      { month: "May", avgPrice: 2400 }, { month: "Jun", avgPrice: 2450 },
      { month: "Jul", avgPrice: 2500 }, { month: "Aug", avgPrice: 2550 },
      { month: "Sep", avgPrice: 2500 }, { month: "Oct", avgPrice: 2350 },
      { month: "Nov", avgPrice: 2300 }, { month: "Dec", avgPrice: 2350 }
    ],
    yearlyAvg: [
      { year: "2020", avgPrice: 1868 }, { year: "2021", avgPrice: 1960 },
      { year: "2022", avgPrice: 2060 }, { year: "2023", avgPrice: 2183 },
      { year: "2024", avgPrice: 2300 }
    ],
    seasonalPattern: "Harvest pressure in Oct-Nov brings prices down. Government procurement provides floor. Export restrictions can impact domestic prices.",
    volatility: "low"
  },
  {
    commodity: "Potato",
    monthlyAvg: [
      { month: "Jan", avgPrice: 800 }, { month: "Feb", avgPrice: 600 },
      { month: "Mar", avgPrice: 500 }, { month: "Apr", avgPrice: 450 },
      { month: "May", avgPrice: 600 }, { month: "Jun", avgPrice: 900 },
      { month: "Jul", avgPrice: 1200 }, { month: "Aug", avgPrice: 1500 },
      { month: "Sep", avgPrice: 1800 }, { month: "Oct", avgPrice: 2000 },
      { month: "Nov", avgPrice: 1600 }, { month: "Dec", avgPrice: 1200 }
    ],
    yearlyAvg: [
      { year: "2020", avgPrice: 800 }, { year: "2021", avgPrice: 950 },
      { year: "2022", avgPrice: 1100 }, { year: "2023", avgPrice: 1200 },
      { year: "2024", avgPrice: 1050 }
    ],
    seasonalPattern: "Prices crash Feb-Apr during harvest. Cold storage releases control supply Jun-Oct. Peak prices in Sep-Oct before new crop.",
    volatility: "high"
  },
  {
    commodity: "Chickpea (Gram)",
    monthlyAvg: [
      { month: "Jan", avgPrice: 5800 }, { month: "Feb", avgPrice: 5600 },
      { month: "Mar", avgPrice: 5200 }, { month: "Apr", avgPrice: 5000 },
      { month: "May", avgPrice: 5100 }, { month: "Jun", avgPrice: 5300 },
      { month: "Jul", avgPrice: 5500 }, { month: "Aug", avgPrice: 5700 },
      { month: "Sep", avgPrice: 5900 }, { month: "Oct", avgPrice: 6100 },
      { month: "Nov", avgPrice: 6200 }, { month: "Dec", avgPrice: 6000 }
    ],
    yearlyAvg: [
      { year: "2020", avgPrice: 4200 }, { year: "2021", avgPrice: 4800 },
      { year: "2022", avgPrice: 5200 }, { year: "2023", avgPrice: 5500 },
      { year: "2024", avgPrice: 5600 }
    ],
    seasonalPattern: "Harvest pressure in Mar-May. Government procurement at MSP. Import duties impact domestic prices. Steady price appreciation over years due to growing demand.",
    volatility: "medium"
  },
  {
    commodity: "Cotton",
    monthlyAvg: [
      { month: "Jan", avgPrice: 6800 }, { month: "Feb", avgPrice: 6900 },
      { month: "Mar", avgPrice: 7000 }, { month: "Apr", avgPrice: 7100 },
      { month: "May", avgPrice: 7200 }, { month: "Jun", avgPrice: 7000 },
      { month: "Jul", avgPrice: 6800 }, { month: "Aug", avgPrice: 6600 },
      { month: "Sep", avgPrice: 6400 }, { month: "Oct", avgPrice: 6200 },
      { month: "Nov", avgPrice: 6400 }, { month: "Dec", avgPrice: 6600 }
    ],
    yearlyAvg: [
      { year: "2020", avgPrice: 5500 }, { year: "2021", avgPrice: 7500 },
      { year: "2022", avgPrice: 9500 }, { year: "2023", avgPrice: 6800 },
      { year: "2024", avgPrice: 6700 }
    ],
    seasonalPattern: "New crop arrivals in Oct-Nov depress prices. Prices recover Jan-May as supply tightens. International prices and MSP operations drive trends.",
    volatility: "medium"
  }
];

// ============ LIVE API INTEGRATION ============

import { supabase } from "@/integrations/supabase/client";

export interface LiveMarketPrice {
  crop: string;
  market: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  unit: string;
  date?: string;
}

/**
 * Fetch live mandi prices from data.gov.in via Supabase Edge Function.
 * Falls back to static dataset if the API is unavailable.
 */
export async function fetchLiveMandiPrices(
  state = "Punjab",
  district?: string
): Promise<{ prices: LiveMarketPrice[]; source: "live" | "static" }> {
  try {
    const { data, error } = await supabase.functions.invoke("market-prices", {
      body: { state, district },
    });
    if (!error && data?.prices?.length > 0) {
      return { prices: data.prices, source: "live" };
    }
  } catch {
    // Edge function unavailable — fall through to static data
  }

  // Fallback: convert static dataset to LiveMarketPrice format
  const staticPrices: LiveMarketPrice[] = getMandiPricesByState(state).map((entry) => {
    const parent = mandiPrices.find((m) =>
      m.marketPrices.some((p) => p.market === entry.market && p.state === entry.state)
    );
    return {
      crop: parent?.commodity ?? "Unknown",
      market: `${entry.market}, ${entry.district}`,
      minPrice: entry.minPrice,
      maxPrice: entry.maxPrice,
      modalPrice: entry.modalPrice,
      unit: "per quintal",
      date: entry.date,
    };
  });

  return { prices: staticPrices, source: "static" };
}

// ============ HELPER FUNCTIONS ============

export const getMandiPricesByCommodity = (commodity: string): MandiPrice | undefined =>
  mandiPrices.find(m => m.commodity.toLowerCase().includes(commodity.toLowerCase()));

export const getMandiPricesByState = (state: string): MarketEntry[] =>
  mandiPrices.flatMap(m =>
    m.marketPrices.filter(p => p.state.toLowerCase() === state.toLowerCase())
  );

export const getMandiPricesByMarket = (market: string): { commodity: string; price: MarketEntry }[] =>
  mandiPrices.flatMap(m =>
    m.marketPrices
      .filter(p => p.market.toLowerCase().includes(market.toLowerCase()))
      .map(p => ({ commodity: m.commodity, price: p }))
  );

export const getMSPCrops = (): { commodity: string; msp: number }[] =>
  mandiPrices
    .filter(m => m.mspPrice !== null)
    .map(m => ({ commodity: m.commodity, msp: m.mspPrice! }));

export const getPriceTrendByCommodity = (commodity: string): PriceTrend | undefined =>
  priceTrends.find(t => t.commodity.toLowerCase().includes(commodity.toLowerCase()));

export const getHighVolatilityCommodities = (): PriceTrend[] =>
  priceTrends.filter(t => t.volatility === "extreme" || t.volatility === "high");

export const getCommoditiesByCategory = (category: MandiPrice["category"]): MandiPrice[] =>
  mandiPrices.filter(m => m.category === category);
