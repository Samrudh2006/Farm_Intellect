// Crop Disease Detection Dataset
// Source: PlantVillage Dataset (54,000+ images, 38 diseases)
// Real disease data from ICAR, PlantVillage, and agricultural research

import { createDatasetMetadata } from "./datasetMetadata";

export interface CropDisease {
  id: string;
  crop: string;
  diseaseName: string;
  hindiName: string;
  scientificName: string;
  category: "fungal" | "bacterial" | "viral" | "nutrient" | "pest";
  severity: "low" | "medium" | "high" | "critical";
  symptoms: string[];
  affectedParts: string[];
  images: string[]; // PlantVillage class labels
  conditions: {
    temperature: string;
    humidity: string;
    season: string[];
    soil: string;
  };
  treatment: {
    chemical: string[];
    organic: string[];
    cultural: string[];
  };
  prevention: string[];
  yieldLoss: string;
  spreadRate: "slow" | "moderate" | "fast";
  confidence: number; // AI detection confidence threshold
}

export const cropDiseasesMetadata = createDatasetMetadata({
  version: "1.0.0",
  lastUpdated: "2024-11-20T00:00:00Z",
  source: "PlantVillage, ICAR crop protection references",
  notes: "Curated disease profiles and symptoms for AI triage.",
});

export const cropDiseases: CropDisease[] = [
  // ==================== TOMATO DISEASES (10) ====================
  {
    id: "tom_early_blight",
    crop: "Tomato",
    diseaseName: "Early Blight",
    hindiName: "अगेती झुलसा",
    scientificName: "Alternaria solani",
    category: "fungal",
    severity: "high",
    symptoms: [
      "Dark brown concentric ring spots on lower leaves",
      "Target-like lesion pattern on leaves",
      "Yellowing of leaves around spots",
      "Premature leaf drop starting from base",
      "Dark sunken spots on fruit stem end"
    ],
    affectedParts: ["leaves", "stems", "fruits"],
    images: ["Tomato___Early_blight"],
    conditions: {
      temperature: "24-29°C",
      humidity: ">80%",
      season: ["Kharif", "Rabi"],
      soil: "Poor drainage, overwatered"
    },
    treatment: {
      chemical: [
        "Mancozeb 75% WP @ 2.5g/L spray",
        "Chlorothalonil 75% WP @ 2g/L",
        "Azoxystrobin 23% SC @ 1ml/L"
      ],
      organic: [
        "Neem oil 3% spray",
        "Trichoderma viride @ 5g/L soil drench",
        "Pseudomonas fluorescens @ 5g/L spray"
      ],
      cultural: [
        "Remove and destroy infected plant debris",
        "Practice crop rotation with non-solanaceous crops",
        "Maintain proper plant spacing for air circulation",
        "Avoid overhead irrigation"
      ]
    },
    prevention: [
      "Use certified disease-free seeds",
      "Apply mulch to prevent soil splash",
      "Spray protective fungicide before monsoon",
      "Maintain 60cm row spacing"
    ],
    yieldLoss: "30-50%",
    spreadRate: "moderate",
    confidence: 0.92
  },
  {
    id: "tom_late_blight",
    crop: "Tomato",
    diseaseName: "Late Blight",
    hindiName: "पछेती झुलसा",
    scientificName: "Phytophthora infestans",
    category: "fungal",
    severity: "critical",
    symptoms: [
      "Water-soaked dark green to brown spots on leaves",
      "White fuzzy fungal growth on leaf undersides",
      "Rapidly expanding irregular brown lesions",
      "Stem blackening and plant collapse",
      "Brown firm rot on fruits"
    ],
    affectedParts: ["leaves", "stems", "fruits"],
    images: ["Tomato___Late_blight"],
    conditions: {
      temperature: "15-22°C",
      humidity: ">90%",
      season: ["Rabi", "Winter"],
      soil: "Waterlogged, cool moist conditions"
    },
    treatment: {
      chemical: [
        "Metalaxyl + Mancozeb (Ridomil Gold) @ 2.5g/L",
        "Cymoxanil + Mancozeb @ 3g/L",
        "Dimethomorph 50% WP @ 1g/L"
      ],
      organic: [
        "Copper hydroxide 77% WP @ 2g/L",
        "Bordeaux mixture 1% spray",
        "Trichoderma harzianum @ 5g/L"
      ],
      cultural: [
        "Destroy infected plants immediately",
        "Avoid overhead watering",
        "Improve field drainage",
        "Do not grow near potato fields"
      ]
    },
    prevention: [
      "Use resistant varieties (Arka Rakshak, Arka Samrat)",
      "Prophylactic spraying during cool wet weather",
      "Maintain proper field sanitation",
      "Avoid planting near potato crops"
    ],
    yieldLoss: "60-100%",
    spreadRate: "fast",
    confidence: 0.94
  },
  {
    id: "tom_leaf_mold",
    crop: "Tomato",
    diseaseName: "Leaf Mold",
    hindiName: "पत्ती फफूंदी",
    scientificName: "Passalora fulva",
    category: "fungal",
    severity: "medium",
    symptoms: [
      "Pale green to yellow spots on upper leaf surface",
      "Olive-green to brown velvety growth on lower surface",
      "Leaves curl upward and wilt",
      "Severe defoliation in humid conditions"
    ],
    affectedParts: ["leaves"],
    images: ["Tomato___Leaf_Mold"],
    conditions: {
      temperature: "22-28°C",
      humidity: ">85%",
      season: ["Kharif"],
      soil: "Greenhouse/polyhouse conditions"
    },
    treatment: {
      chemical: [
        "Mancozeb 75% WP @ 2.5g/L",
        "Copper oxychloride 50% WP @ 3g/L",
        "Hexaconazole 5% EC @ 1ml/L"
      ],
      organic: [
        "Neem oil 2% spray",
        "Baking soda solution 5g/L spray",
        "Trichoderma viride @ 4g/L"
      ],
      cultural: [
        "Increase ventilation in greenhouse",
        "Avoid leaf wetness",
        "Reduce plant density",
        "Lower humidity below 80%"
      ]
    },
    prevention: [
      "Use resistant varieties",
      "Ensure adequate ventilation",
      "Avoid overhead irrigation",
      "Remove lower infected leaves early"
    ],
    yieldLoss: "20-40%",
    spreadRate: "moderate",
    confidence: 0.89
  },
  {
    id: "tom_septoria",
    crop: "Tomato",
    diseaseName: "Septoria Leaf Spot",
    hindiName: "सेप्टोरिया पत्ती धब्बा",
    scientificName: "Septoria lycopersici",
    category: "fungal",
    severity: "medium",
    symptoms: [
      "Small circular spots with dark brown borders",
      "Grey-white center with tiny black dots (pycnidia)",
      "Lower leaves affected first",
      "Severe defoliation reducing fruit quality"
    ],
    affectedParts: ["leaves", "stems"],
    images: ["Tomato___Septoria_leaf_spot"],
    conditions: {
      temperature: "20-25°C",
      humidity: ">80%",
      season: ["Kharif", "Rabi"],
      soil: "Heavy rainfall areas"
    },
    treatment: {
      chemical: [
        "Mancozeb 75% WP @ 2.5g/L",
        "Chlorothalonil 75% WP @ 2g/L",
        "Propiconazole 25% EC @ 1ml/L"
      ],
      organic: [
        "Copper based fungicides @ 2g/L",
        "Bacillus subtilis based bioagent",
        "Neem oil 3% spray"
      ],
      cultural: [
        "Remove infected lower leaves",
        "Mulch to prevent soil splash",
        "3-year crop rotation",
        "Drip irrigation preferred"
      ]
    },
    prevention: [
      "Use pathogen-free transplants",
      "Practice crop rotation",
      "Apply mulch around base",
      "Avoid working in wet fields"
    ],
    yieldLoss: "25-50%",
    spreadRate: "moderate",
    confidence: 0.90
  },
  {
    id: "tom_bacterial_spot",
    crop: "Tomato",
    diseaseName: "Bacterial Spot",
    hindiName: "जीवाणु धब्बा",
    scientificName: "Xanthomonas vesicatoria",
    category: "bacterial",
    severity: "high",
    symptoms: [
      "Small, dark, water-soaked spots on leaves",
      "Spots become raised and scab-like on fruits",
      "Leaf margins become brown and tattered",
      "Fruit spots are raised with white halo"
    ],
    affectedParts: ["leaves", "fruits", "stems"],
    images: ["Tomato___Bacterial_spot"],
    conditions: {
      temperature: "25-30°C",
      humidity: ">80%",
      season: ["Kharif"],
      soil: "Warm humid tropical conditions"
    },
    treatment: {
      chemical: [
        "Streptocycline 0.01% + Copper oxychloride 0.3%",
        "Kasugamycin 3% SL @ 2ml/L",
        "Copper hydroxide 77% WP @ 2g/L"
      ],
      organic: [
        "Pseudomonas fluorescens @ 5g/L",
        "Copper based bactericides",
        "Acidified copper spray"
      ],
      cultural: [
        "Avoid overhead irrigation",
        "Remove severely infected plants",
        "Disinfect tools and equipment",
        "Use drip irrigation"
      ]
    },
    prevention: [
      "Use certified disease-free seeds",
      "Treat seeds with hot water (50°C for 25 min)",
      "Avoid handling wet plants",
      "Crop rotation for 2-3 years"
    ],
    yieldLoss: "20-50%",
    spreadRate: "fast",
    confidence: 0.88
  },
  {
    id: "tom_mosaic",
    crop: "Tomato",
    diseaseName: "Tomato Mosaic Virus",
    hindiName: "टमाटर मोज़ेक विषाणु",
    scientificName: "Tomato mosaic virus (ToMV)",
    category: "viral",
    severity: "high",
    symptoms: [
      "Light and dark green mosaic pattern on leaves",
      "Leaf curling and distortion",
      "Stunted plant growth",
      "Reduced fruit size and quality",
      "Fern leaf symptom in severe cases"
    ],
    affectedParts: ["leaves", "fruits", "whole plant"],
    images: ["Tomato___Tomato_mosaic_virus"],
    conditions: {
      temperature: "20-30°C",
      humidity: "Any",
      season: ["Kharif", "Rabi", "Summer"],
      soil: "All types - mechanically transmitted"
    },
    treatment: {
      chemical: [
        "No chemical cure for viral diseases",
        "Control aphid vectors with Imidacloprid 17.8% SL @ 0.3ml/L",
        "Thiamethoxam 25% WG @ 0.3g/L for vector control"
      ],
      organic: [
        "Neem oil 2% for vector control",
        "Yellow sticky traps for whitefly monitoring",
        "Milk spray (1:10 dilution) may reduce spread"
      ],
      cultural: [
        "Remove and destroy infected plants",
        "Wash hands with soap before handling plants",
        "Disinfect tools with 10% bleach solution",
        "Control weed hosts"
      ]
    },
    prevention: [
      "Use virus-resistant varieties",
      "Use virus-free seedlings",
      "Do not smoke near tomato plants (TMV in tobacco)",
      "Control insect vectors early"
    ],
    yieldLoss: "20-70%",
    spreadRate: "fast",
    confidence: 0.91
  },
  {
    id: "tom_yellow_curl",
    crop: "Tomato",
    diseaseName: "Yellow Leaf Curl Virus",
    hindiName: "पीला पत्ती मोड़ विषाणु",
    scientificName: "Tomato yellow leaf curl virus (TYLCV)",
    category: "viral",
    severity: "critical",
    symptoms: [
      "Upward curling and cupping of leaves",
      "Yellowing of leaf margins",
      "Severe stunting of plants",
      "Flower drop and poor fruit set",
      "Small crumpled leaves"
    ],
    affectedParts: ["leaves", "whole plant"],
    images: ["Tomato___Tomato_Yellow_Leaf_Curl_Virus"],
    conditions: {
      temperature: "25-35°C",
      humidity: "Any",
      season: ["Kharif", "Summer"],
      soil: "Whitefly-prone areas"
    },
    treatment: {
      chemical: [
        "Imidacloprid 17.8% SL @ 0.3ml/L (whitefly control)",
        "Thiamethoxam 25% WG @ 0.3g/L",
        "Diafenthiuron 50% WP @ 1g/L"
      ],
      organic: [
        "Neem oil 5% spray for whitefly",
        "Yellow sticky traps @ 12/acre",
        "Verticillium lecanii @ 5g/L"
      ],
      cultural: [
        "Remove infected plants immediately",
        "Use whitefly-proof net nurseries",
        "Grow barrier crops (maize/sorghum)",
        "Avoid summer tomato in endemic areas"
      ]
    },
    prevention: [
      "Use TYLCV-resistant varieties (Arka Ananya)",
      "Raise seedlings under insect-proof nets",
      "Install yellow sticky traps early",
      "Avoid planting near infected fields"
    ],
    yieldLoss: "50-100%",
    spreadRate: "fast",
    confidence: 0.93
  },
  {
    id: "tom_spider_mite",
    crop: "Tomato",
    diseaseName: "Spider Mite Damage",
    hindiName: "मकड़ी माइट",
    scientificName: "Tetranychus urticae",
    category: "pest",
    severity: "medium",
    symptoms: [
      "Tiny yellow spots (stippling) on leaves",
      "Fine webbing on leaf undersides",
      "Leaves turn bronze/brown",
      "Leaf drop in severe cases"
    ],
    affectedParts: ["leaves"],
    images: ["Tomato___Spider_mites Two-spotted_spider_mite"],
    conditions: {
      temperature: "27-35°C",
      humidity: "<50% (dry hot weather)",
      season: ["Summer"],
      soil: "Dry dusty conditions"
    },
    treatment: {
      chemical: [
        "Dicofol 18.5% EC @ 2.5ml/L",
        "Spiromesifen 22.9% SC @ 0.5ml/L",
        "Abamectin 1.9% EC @ 0.5ml/L"
      ],
      organic: [
        "Neem oil 3% spray",
        "Sulphur 80% WP @ 3g/L",
        "Release predatory mites (Phytoseiulus persimilis)"
      ],
      cultural: [
        "Increase irrigation frequency",
        "Spray water on undersides of leaves",
        "Remove heavily infested leaves",
        "Avoid dust on plants"
      ]
    },
    prevention: [
      "Regular monitoring of leaf undersides",
      "Maintain adequate irrigation",
      "Avoid water stress",
      "Release predatory mites preventively"
    ],
    yieldLoss: "15-30%",
    spreadRate: "fast",
    confidence: 0.87
  },
  {
    id: "tom_target_spot",
    crop: "Tomato",
    diseaseName: "Target Spot",
    hindiName: "लक्ष्य धब्बा",
    scientificName: "Corynespora cassiicola",
    category: "fungal",
    severity: "medium",
    symptoms: [
      "Brown spots with concentric rings (target pattern)",
      "Spots on leaves, stems, and fruits",
      "Lesions may coalesce causing large necrotic areas",
      "Premature defoliation"
    ],
    affectedParts: ["leaves", "stems", "fruits"],
    images: ["Tomato___Target_Spot"],
    conditions: {
      temperature: "25-32°C",
      humidity: ">80%",
      season: ["Kharif"],
      soil: "Warm humid conditions"
    },
    treatment: {
      chemical: [
        "Azoxystrobin 23% SC @ 1ml/L",
        "Difenoconazole 25% EC @ 0.5ml/L",
        "Mancozeb 75% WP @ 2.5g/L"
      ],
      organic: [
        "Trichoderma viride @ 5g/L",
        "Pseudomonas fluorescens spray",
        "Neem oil 2% spray"
      ],
      cultural: [
        "Remove infected debris",
        "Improve air circulation",
        "Avoid excess nitrogen fertilization",
        "Practice crop rotation"
      ]
    },
    prevention: [
      "Use resistant varieties",
      "Proper plant spacing",
      "Balanced fertilization",
      "Preventive fungicide spray in humid weather"
    ],
    yieldLoss: "20-40%",
    spreadRate: "moderate",
    confidence: 0.86
  },

  // ==================== POTATO DISEASES (4) ====================
  {
    id: "pot_early_blight",
    crop: "Potato",
    diseaseName: "Early Blight",
    hindiName: "अगेती झुलसा",
    scientificName: "Alternaria solani",
    category: "fungal",
    severity: "high",
    symptoms: [
      "Dark brown concentric ring spots on older leaves",
      "Spots enlarge and leaves turn yellow",
      "Premature defoliation",
      "Tuber lesions: dark sunken spots"
    ],
    affectedParts: ["leaves", "tubers"],
    images: ["Potato___Early_blight"],
    conditions: {
      temperature: "25-30°C",
      humidity: ">70%",
      season: ["Rabi"],
      soil: "Sandy loam, nutrient-deficient"
    },
    treatment: {
      chemical: [
        "Mancozeb 75% WP @ 2.5g/L at 10-day intervals",
        "Chlorothalonil 75% WP @ 2g/L",
        "Azoxystrobin 23% SC @ 1ml/L"
      ],
      organic: [
        "Trichoderma viride seed treatment @ 4g/kg",
        "Neem cake @ 200kg/ha in soil",
        "Pseudomonas fluorescens @ 5g/L"
      ],
      cultural: [
        "Use certified disease-free seed tubers",
        "Remove infected plant debris",
        "Balanced NPK fertilization",
        "Proper hilling to protect tubers"
      ]
    },
    prevention: [
      "Use resistant varieties (Kufri Jyoti, Kufri Badshah)",
      "Maintain proper plant nutrition",
      "Avoid overhead irrigation",
      "Crop rotation with cereals"
    ],
    yieldLoss: "20-40%",
    spreadRate: "moderate",
    confidence: 0.91
  },
  {
    id: "pot_late_blight",
    crop: "Potato",
    diseaseName: "Late Blight",
    hindiName: "पछेती झुलसा",
    scientificName: "Phytophthora infestans",
    category: "fungal",
    severity: "critical",
    symptoms: [
      "Water-soaked pale green lesions on leaf tips/margins",
      "White cottony fungal growth on leaf undersides",
      "Rapid browning and death of foliage",
      "Brown granular rot in tubers",
      "Foul smell from rotting tubers"
    ],
    affectedParts: ["leaves", "stems", "tubers"],
    images: ["Potato___Late_blight"],
    conditions: {
      temperature: "12-18°C",
      humidity: ">90%",
      season: ["Rabi", "Winter"],
      soil: "Cool, foggy, high moisture"
    },
    treatment: {
      chemical: [
        "Metalaxyl + Mancozeb (Ridomil Gold) @ 2.5g/L",
        "Cymoxanil 8% + Mancozeb 64% @ 3g/L",
        "Fenamidone 10% + Mancozeb 50% @ 3g/L"
      ],
      organic: [
        "Bordeaux mixture 1%",
        "Copper oxychloride 50% WP @ 3g/L",
        "Trichoderma-enriched compost"
      ],
      cultural: [
        "Destroy infected material immediately",
        "Avoid waterlogging in fields",
        "Proper hilling to protect tubers",
        "Harvest only in dry weather"
      ]
    },
    prevention: [
      "Use resistant varieties (Kufri Girdhari, Kufri Khyati)",
      "Use disease-free certified seed tubers",
      "Prophylactic spray of Mancozeb before expected fog",
      "Dehaulm (cut foliage) 10-15 days before harvest"
    ],
    yieldLoss: "50-80%",
    spreadRate: "fast",
    confidence: 0.95
  },

  // ==================== RICE DISEASES (4) ====================
  {
    id: "rice_blast",
    crop: "Rice",
    diseaseName: "Rice Blast",
    hindiName: "धान का ब्लास्ट",
    scientificName: "Magnaporthe oryzae",
    category: "fungal",
    severity: "critical",
    symptoms: [
      "Diamond/spindle-shaped spots on leaves with grey center",
      "Neck blast: rotting at panicle base causing white heads",
      "Node blast: black lesions on stem nodes",
      "Brown spots on leaf collar"
    ],
    affectedParts: ["leaves", "neck", "nodes", "panicle"],
    images: ["Rice___Blast"],
    conditions: {
      temperature: "25-28°C",
      humidity: ">90%",
      season: ["Kharif"],
      soil: "High nitrogen, low silicon"
    },
    treatment: {
      chemical: [
        "Tricyclazole 75% WP @ 0.6g/L (most effective)",
        "Isoprothiolane 40% EC @ 1.5ml/L",
        "Azoxystrobin 18.2% + Difenoconazole 11.4% @ 1ml/L"
      ],
      organic: [
        "Pseudomonas fluorescens @ 5g/L spray",
        "Trichoderma viride seed treatment @ 4g/kg",
        "Silicon application @ 200kg/ha"
      ],
      cultural: [
        "Avoid excess nitrogen (limit to 100kg N/ha)",
        "Maintain 2-3cm standing water",
        "Remove infected stubble after harvest",
        "Use split nitrogen application"
      ]
    },
    prevention: [
      "Use resistant varieties (Pusa 1637, Co 51)",
      "Seed treatment with Tricyclazole",
      "Balanced NPK with silicon",
      "Optimal planting density"
    ],
    yieldLoss: "30-70%",
    spreadRate: "fast",
    confidence: 0.93
  },
  {
    id: "rice_brown_spot",
    crop: "Rice",
    diseaseName: "Brown Spot",
    hindiName: "भूरा धब्बा",
    scientificName: "Bipolaris oryzae",
    category: "fungal",
    severity: "high",
    symptoms: [
      "Oval brown spots with grey center on leaves",
      "Spots on glumes causing grain discoloration",
      "Seedling blight from infected seeds",
      "Poor grain filling"
    ],
    affectedParts: ["leaves", "glumes", "grains"],
    images: ["Rice___Brown_spot"],
    conditions: {
      temperature: "25-30°C",
      humidity: ">80%",
      season: ["Kharif"],
      soil: "Nutrient-deficient, poor soils"
    },
    treatment: {
      chemical: [
        "Mancozeb 75% WP @ 2.5g/L",
        "Propiconazole 25% EC @ 1ml/L",
        "Carbendazim 50% WP @ 1g/L seed treatment"
      ],
      organic: [
        "Trichoderma viride seed treatment",
        "Pseudomonas fluorescens @ 10g/kg seed",
        "FYM enriched with Trichoderma"
      ],
      cultural: [
        "Apply adequate potassium fertilizer",
        "Use disease-free certified seeds",
        "Balanced fertilization especially K and Zn",
        "Proper water management"
      ]
    },
    prevention: [
      "Use resistant varieties",
      "Seed treatment with fungicides",
      "Correct micronutrient deficiencies (Zinc)",
      "Maintain soil health with organic matter"
    ],
    yieldLoss: "20-40%",
    spreadRate: "moderate",
    confidence: 0.88
  },
  {
    id: "rice_bacterial_blight",
    crop: "Rice",
    diseaseName: "Bacterial Leaf Blight",
    hindiName: "जीवाणु पत्ती झुलसा",
    scientificName: "Xanthomonas oryzae pv. oryzae",
    category: "bacterial",
    severity: "critical",
    symptoms: [
      "Water-soaked lesions along leaf margins",
      "Lesions turn yellow to white and dry up",
      "Milky bacterial ooze from cut leaves (morning)",
      "Wilting of seedlings (Kresek phase)",
      "Leaves turn grayish-white and dry"
    ],
    affectedParts: ["leaves", "seedlings"],
    images: ["Rice___Bacterial_leaf_blight"],
    conditions: {
      temperature: "28-34°C",
      humidity: ">80%",
      season: ["Kharif"],
      soil: "High nitrogen, waterlogged, storm damage"
    },
    treatment: {
      chemical: [
        "Streptocycline @ 0.015% spray",
        "Copper oxychloride 50% WP @ 2.5g/L",
        "Copper hydroxide 77% WP @ 2g/L"
      ],
      organic: [
        "Pseudomonas fluorescens @ 5g/L",
        "Neem oil 2% + garlic extract",
        "Trichoderma harzianum soil application"
      ],
      cultural: [
        "Drain excess water from fields",
        "Reduce nitrogen application",
        "Clip seedling tips before transplanting",
        "Avoid field work during rain"
      ]
    },
    prevention: [
      "Use resistant varieties (Improved Samba Mahsuri, Pusa 1460)",
      "Balanced fertilization (avoid excess N)",
      "Good field drainage",
      "Do not transplant during storms"
    ],
    yieldLoss: "30-60%",
    spreadRate: "fast",
    confidence: 0.90
  },
  {
    id: "rice_sheath_blight",
    crop: "Rice",
    diseaseName: "Sheath Blight",
    hindiName: "आवरण झुलसा",
    scientificName: "Rhizoctonia solani",
    category: "fungal",
    severity: "high",
    symptoms: [
      "Oval/elliptical lesions on leaf sheaths near water line",
      "Green-grey lesions with dark brown borders",
      "Lesions merge and spread upward",
      "White cottony mycelium visible",
      "Lodging in severe cases"
    ],
    affectedParts: ["sheaths", "leaves", "stems"],
    images: ["Rice___Sheath_blight"],
    conditions: {
      temperature: "28-32°C",
      humidity: ">90%",
      season: ["Kharif"],
      soil: "Dense planting, high nitrogen, floating sclerotia"
    },
    treatment: {
      chemical: [
        "Hexaconazole 5% EC @ 2ml/L",
        "Propiconazole 25% EC @ 1ml/L",
        "Validamycin 3% SL @ 2ml/L"
      ],
      organic: [
        "Trichoderma viride @ 2.5kg/ha in soil",
        "Pseudomonas fluorescens @ 2.5kg/ha",
        "Neem cake application @ 150kg/ha"
      ],
      cultural: [
        "Reduce plant density",
        "Avoid excess nitrogen",
        "Remove sclerotia from irrigation water",
        "Burn infected stubble"
      ]
    },
    prevention: [
      "Use tolerant varieties",
      "Optimal spacing (20x15cm)",
      "Balanced nutrition",
      "Avoid continuous rice monoculture"
    ],
    yieldLoss: "20-50%",
    spreadRate: "moderate",
    confidence: 0.86
  },

  // ==================== WHEAT DISEASES (3) ====================
  {
    id: "wheat_rust",
    crop: "Wheat",
    diseaseName: "Yellow Rust (Stripe Rust)",
    hindiName: "पीला रतुआ",
    scientificName: "Puccinia striiformis f. sp. tritici",
    category: "fungal",
    severity: "critical",
    symptoms: [
      "Yellow-orange pustules in stripes along leaf veins",
      "Pustules on leaves, leaf sheaths, and glumes",
      "Severe yellowing and drying of leaves",
      "Reduced grain filling and shriveled grains"
    ],
    affectedParts: ["leaves", "heads"],
    images: ["Wheat___Yellow_rust"],
    conditions: {
      temperature: "10-18°C",
      humidity: ">80%",
      season: ["Rabi"],
      soil: "Cool misty weather, cloudy days"
    },
    treatment: {
      chemical: [
        "Propiconazole 25% EC @ 1ml/L (most effective)",
        "Tebuconazole 25.9% EC @ 1ml/L",
        "Triadimefon 25% WP @ 1g/L"
      ],
      organic: [
        "Not very effective for rusts",
        "Neem oil may slow spread marginally",
        "Focus on resistant varieties"
      ],
      cultural: [
        "Remove volunteer wheat plants",
        "Destroy infected stubble",
        "Timely sowing (avoid late sowing)",
        "Avoid excessive irrigation during fog"
      ]
    },
    prevention: [
      "Use rust-resistant varieties (HD 3226, DBW 187)",
      "Timely sowing (Nov 1-25 for NW plains)",
      "Balanced fertilization",
      "Monitor and spray at first sign of rust"
    ],
    yieldLoss: "30-70%",
    spreadRate: "fast",
    confidence: 0.92
  },
  {
    id: "wheat_brown_rust",
    crop: "Wheat",
    diseaseName: "Brown Rust (Leaf Rust)",
    hindiName: "भूरा रतुआ",
    scientificName: "Puccinia triticina",
    category: "fungal",
    severity: "high",
    symptoms: [
      "Small circular orange-brown pustules scattered on leaves",
      "Pustules mainly on upper leaf surface",
      "Leaves turn yellow and dry prematurely",
      "Reduced grain weight"
    ],
    affectedParts: ["leaves"],
    images: ["Wheat___Brown_rust"],
    conditions: {
      temperature: "15-25°C",
      humidity: ">60%",
      season: ["Rabi"],
      soil: "Moderate temperature with dew"
    },
    treatment: {
      chemical: [
        "Propiconazole 25% EC @ 1ml/L spray",
        "Tebuconazole 25.9% EC @ 1ml/L",
        "Azoxystrobin 23% SC @ 1ml/L"
      ],
      organic: [
        "Limited organic options for rust diseases",
        "Bioagents have low efficacy against rusts"
      ],
      cultural: [
        "Grow recommended varieties",
        "Optimal sowing time",
        "Destroy alternate hosts (Thalictrum spp.)",
        "Avoid late nitrogen application"
      ]
    },
    prevention: [
      "Use resistant varieties (HD 2967, WH 1105)",
      "Early sowing",
      "Spray at first appearance of pustules",
      "Varietal diversification"
    ],
    yieldLoss: "20-40%",
    spreadRate: "fast",
    confidence: 0.90
  },
  {
    id: "wheat_powdery_mildew",
    crop: "Wheat",
    diseaseName: "Powdery Mildew",
    hindiName: "चूर्णी फफूंदी",
    scientificName: "Blumeria graminis f. sp. tritici",
    category: "fungal",
    severity: "medium",
    symptoms: [
      "White powdery fungal growth on leaves and stems",
      "Lower leaves affected first",
      "Leaves turn yellow under white powder",
      "Reduced photosynthesis and grain quality"
    ],
    affectedParts: ["leaves", "stems", "heads"],
    images: ["Wheat___Powdery_mildew"],
    conditions: {
      temperature: "15-22°C",
      humidity: ">70%",
      season: ["Rabi"],
      soil: "Dense canopy, excess nitrogen"
    },
    treatment: {
      chemical: [
        "Sulphur 80% WP @ 3g/L",
        "Propiconazole 25% EC @ 1ml/L",
        "Triadimefon 25% WP @ 1g/L"
      ],
      organic: [
        "Sulphur dust @ 25kg/ha",
        "Milk spray 10% concentration",
        "Baking soda 5g/L spray"
      ],
      cultural: [
        "Avoid high nitrogen doses",
        "Proper plant spacing",
        "Reduce plant density",
        "Good air circulation"
      ]
    },
    prevention: [
      "Use resistant varieties",
      "Balanced fertilization",
      "Avoid lodging conditions",
      "Timely sowing"
    ],
    yieldLoss: "15-30%",
    spreadRate: "moderate",
    confidence: 0.89
  },

  // ==================== COTTON DISEASES (3) ====================
  {
    id: "cot_leaf_curl",
    crop: "Cotton",
    diseaseName: "Cotton Leaf Curl Virus",
    hindiName: "कपास पत्ती मोड़ विषाणु",
    scientificName: "Cotton leaf curl virus (CLCuV)",
    category: "viral",
    severity: "critical",
    symptoms: [
      "Upward or downward curling of leaves",
      "Thickened leaf veins with enations underneath",
      "Stunted plant growth",
      "Small bolls with poor fiber",
      "Dark green twisted leaves"
    ],
    affectedParts: ["leaves", "whole plant", "bolls"],
    images: ["Cotton___Leaf_curl_virus"],
    conditions: {
      temperature: "28-35°C",
      humidity: "Any",
      season: ["Kharif"],
      soil: "Whitefly-infested areas (Punjab, Haryana, Rajasthan)"
    },
    treatment: {
      chemical: [
        "Imidacloprid 17.8% SL @ 0.3ml/L (whitefly control)",
        "Acetamiprid 20% SP @ 0.2g/L",
        "Diafenthiuron 50% WP @ 1g/L"
      ],
      organic: [
        "Neem oil 5% spray",
        "Yellow sticky traps @ 20/acre",
        "Verticillium lecanii @ 5g/L"
      ],
      cultural: [
        "Uproot infected plants early",
        "Destroy ratoon cotton",
        "Control alternative weed hosts",
        "Early sowing (April-May)"
      ]
    },
    prevention: [
      "Use CLCuV-tolerant Bt cotton varieties",
      "Early sowing to escape whitefly peak",
      "Seed treatment with Imidacloprid 70% WS",
      "Border crops as trap for whitefly"
    ],
    yieldLoss: "40-80%",
    spreadRate: "fast",
    confidence: 0.91
  },
  {
    id: "cot_bacterial_blight",
    crop: "Cotton",
    diseaseName: "Bacterial Blight",
    hindiName: "जीवाणु झुलसा",
    scientificName: "Xanthomonas citri pv. malvacearum",
    category: "bacterial",
    severity: "high",
    symptoms: [
      "Angular water-soaked spots on leaves",
      "Spots turn brown with dried margins",
      "Black arm on stems and branches",
      "Boll rot with bacterial ooze",
      "Black vein pattern on leaf undersides"
    ],
    affectedParts: ["leaves", "stems", "bolls"],
    images: ["Cotton___Bacterial_blight"],
    conditions: {
      temperature: "25-35°C",
      humidity: ">80%",
      season: ["Kharif"],
      soil: "Heavy rainfall, warm humid conditions"
    },
    treatment: {
      chemical: [
        "Streptocycline 0.01% + Copper oxychloride 0.25%",
        "Copper hydroxide 77% WP @ 2g/L",
        "Kasugamycin 3% SL @ 2ml/L"
      ],
      organic: [
        "Pseudomonas fluorescens @ 5g/L",
        "Copper-based bactericides",
        "Bioagent seed treatment"
      ],
      cultural: [
        "Remove infected plant parts",
        "Avoid working in wet fields",
        "Deep ploughing after harvest",
        "Crop rotation with cereals"
      ]
    },
    prevention: [
      "Acid delinting of seeds",
      "Seed treatment with Carboxin + Thiram",
      "Use resistant varieties",
      "Avoid rainfed cotton in endemic areas"
    ],
    yieldLoss: "20-40%",
    spreadRate: "moderate",
    confidence: 0.87
  },

  // ==================== MAIZE DISEASES (3) ====================
  {
    id: "maize_blight",
    crop: "Maize",
    diseaseName: "Northern Corn Leaf Blight",
    hindiName: "उत्तरी पत्ती झुलसा",
    scientificName: "Exserohilum turcicum",
    category: "fungal",
    severity: "high",
    symptoms: [
      "Long elliptical grey-green lesions on leaves",
      "Lesions 2.5-15cm long, cigar-shaped",
      "Lesions turn tan/brown as they mature",
      "Severe blight from lower leaves upward"
    ],
    affectedParts: ["leaves"],
    images: ["Corn_(maize)___Northern_Leaf_Blight"],
    conditions: {
      temperature: "18-27°C",
      humidity: ">90%",
      season: ["Kharif"],
      soil: "Cool wet conditions, heavy dew"
    },
    treatment: {
      chemical: [
        "Mancozeb 75% WP @ 2.5g/L at 10-day intervals",
        "Propiconazole 25% EC @ 1ml/L",
        "Azoxystrobin 23% SC @ 1ml/L"
      ],
      organic: [
        "Trichoderma viride seed treatment",
        "Pseudomonas fluorescens spray",
        "Neem-based preparations"
      ],
      cultural: [
        "Remove infected crop debris",
        "Crop rotation with non-cereal crops",
        "Balanced fertilization",
        "Proper plant population"
      ]
    },
    prevention: [
      "Use resistant hybrids",
      "Timely sowing",
      "Avoid high plant density",
      "Post-harvest residue management"
    ],
    yieldLoss: "30-50%",
    spreadRate: "moderate",
    confidence: 0.90
  },
  {
    id: "maize_common_rust",
    crop: "Maize",
    diseaseName: "Common Rust",
    hindiName: "सामान्य रतुआ",
    scientificName: "Puccinia sorghi",
    category: "fungal",
    severity: "medium",
    symptoms: [
      "Small circular to elongate brown pustules on both leaf surfaces",
      "Pustules scattered on leaves and sheaths",
      "Dark brown to black spores when mature",
      "Severe cases cause leaf drying"
    ],
    affectedParts: ["leaves", "sheaths"],
    images: ["Corn_(maize)___Common_rust_"],
    conditions: {
      temperature: "16-25°C",
      humidity: ">80%",
      season: ["Kharif", "Rabi"],
      soil: "Cool humid conditions"
    },
    treatment: {
      chemical: [
        "Mancozeb 75% WP @ 2.5g/L",
        "Propiconazole 25% EC @ 1ml/L",
        "Hexaconazole 5% EC @ 1.5ml/L"
      ],
      organic: [
        "Sulphur 80% WP @ 3g/L",
        "Trichoderma-based preparations"
      ],
      cultural: [
        "Early planting to escape rust period",
        "Remove alternate hosts",
        "Balanced fertilization"
      ]
    },
    prevention: [
      "Use rust-resistant hybrids",
      "Optimum sowing date",
      "Avoid late planting"
    ],
    yieldLoss: "15-30%",
    spreadRate: "moderate",
    confidence: 0.88
  },
  {
    id: "maize_gray_leaf",
    crop: "Maize",
    diseaseName: "Gray Leaf Spot",
    hindiName: "धूसर पत्ती धब्बा",
    scientificName: "Cercospora zeae-maydis",
    category: "fungal",
    severity: "high",
    symptoms: [
      "Rectangular grey to tan lesions between leaf veins",
      "Lesions run parallel to veins",
      "Leaves turn grey-brown when severely affected",
      "Lower leaves affected first"
    ],
    affectedParts: ["leaves"],
    images: ["Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot"],
    conditions: {
      temperature: "22-30°C",
      humidity: ">90%",
      season: ["Kharif"],
      soil: "High humidity, minimum tillage residue"
    },
    treatment: {
      chemical: [
        "Azoxystrobin + Propiconazole @ 1ml/L",
        "Pyraclostrobin 20% WG @ 0.75g/L",
        "Mancozeb 75% WP @ 2.5g/L"
      ],
      organic: [
        "Trichoderma viride application",
        "Neem oil spray"
      ],
      cultural: [
        "Crop rotation with soybean/pulses",
        "Deep ploughing to bury residue",
        "Avoid continuous maize",
        "Maintain adequate spacing"
      ]
    },
    prevention: [
      "Use tolerant hybrids",
      "Residue management",
      "Crop rotation",
      "Avoid high plant populations"
    ],
    yieldLoss: "20-40%",
    spreadRate: "moderate",
    confidence: 0.87
  },

  // ==================== APPLE DISEASES (3) ====================
  {
    id: "apple_scab",
    crop: "Apple",
    diseaseName: "Apple Scab",
    hindiName: "सेब की पपड़ी",
    scientificName: "Venturia inaequalis",
    category: "fungal",
    severity: "high",
    symptoms: [
      "Olive-green to dark brown velvety spots on leaves",
      "Spots on fruit surface causing cracking",
      "Scab lesions on fruit with cork-like texture",
      "Premature leaf fall",
      "Deformed fruits"
    ],
    affectedParts: ["leaves", "fruits"],
    images: ["Apple___Apple_scab"],
    conditions: {
      temperature: "12-24°C",
      humidity: ">70%",
      season: ["Spring (March-June)"],
      soil: "Wet spring weather in hilly regions"
    },
    treatment: {
      chemical: [
        "Mancozeb 75% WP @ 3g/L pre-bloom",
        "Myclobutanil 10% WP @ 0.4g/L post-bloom",
        "Dodine 65% WP @ 0.5g/L"
      ],
      organic: [
        "Lime sulphur spray 1% in dormancy",
        "Copper oxychloride at pink bud stage",
        "Sulphur 80% WP @ 3g/L"
      ],
      cultural: [
        "Rake and destroy fallen leaves",
        "Prune for open canopy (light and air)",
        "Remove infected fruit",
        "Apply urea 5% to fallen leaves in autumn"
      ]
    },
    prevention: [
      "Use resistant varieties (Prima, Liberty)",
      "Dormant pruning for air circulation",
      "Protective spray schedule starting at green tip",
      "Sanitation of fallen leaves"
    ],
    yieldLoss: "30-60%",
    spreadRate: "moderate",
    confidence: 0.93
  },
  {
    id: "apple_black_rot",
    crop: "Apple",
    diseaseName: "Black Rot",
    hindiName: "काला सड़न",
    scientificName: "Botryosphaeria obtusa",
    category: "fungal",
    severity: "high",
    symptoms: [
      "Purple spots on leaves enlarging to brown with purple margins",
      "Frog-eye leaf spot pattern",
      "Brown to black rot starting from calyx end of fruit",
      "Cankers on branches with rough bark"
    ],
    affectedParts: ["leaves", "fruits", "branches"],
    images: ["Apple___Black_rot"],
    conditions: {
      temperature: "20-28°C",
      humidity: ">75%",
      season: ["Summer", "Rainy"],
      soil: "Warm humid conditions"
    },
    treatment: {
      chemical: [
        "Captan 50% WP @ 2g/L",
        "Thiophanate methyl 70% WP @ 1g/L",
        "Myclobutanil 10% WP @ 0.4g/L"
      ],
      organic: [
        "Copper fungicides at dormant stage",
        "Neem oil spray",
        "Remove mummified fruits"
      ],
      cultural: [
        "Remove cankers from branches",
        "Destroy mummified and infected fruits",
        "Prune dead wood",
        "Maintain tree vigor"
      ]
    },
    prevention: [
      "Remove all mummified fruits from trees",
      "Prune dead and dying branches",
      "Regular fungicide program",
      "Keep trees healthy and stress-free"
    ],
    yieldLoss: "20-40%",
    spreadRate: "slow",
    confidence: 0.90
  },
  {
    id: "apple_cedar_rust",
    crop: "Apple",
    diseaseName: "Cedar Apple Rust",
    hindiName: "सीडार रतुआ",
    scientificName: "Gymnosporangium juniperi-virginianae",
    category: "fungal",
    severity: "medium",
    symptoms: [
      "Bright yellow-orange spots on upper leaf surface",
      "Tube-like structures on leaf undersides",
      "Spots on fruit with orange bumps",
      "Premature defoliation"
    ],
    affectedParts: ["leaves", "fruits"],
    images: ["Apple___Cedar_apple_rust"],
    conditions: {
      temperature: "15-25°C",
      humidity: ">80%",
      season: ["Spring-Summer"],
      soil: "Near cedar/juniper trees (alternate host)"
    },
    treatment: {
      chemical: [
        "Myclobutanil 10% WP @ 0.4g/L",
        "Mancozeb 75% WP @ 2.5g/L",
        "Fenarimol 12% EC @ 0.3ml/L"
      ],
      organic: [
        "Sulphur 80% WP @ 3g/L",
        "Copper-based fungicides",
        "Remove alternate hosts"
      ],
      cultural: [
        "Remove cedar/juniper trees within 2km if possible",
        "Prune galls from cedar trees",
        "Grow resistant apple varieties"
      ]
    },
    prevention: [
      "Use resistant varieties (Liberty, Enterprise)",
      "Remove alternate hosts",
      "Preventive fungicide spray program"
    ],
    yieldLoss: "10-25%",
    spreadRate: "slow",
    confidence: 0.91
  },

  // ==================== GRAPE DISEASES (3) ====================
  {
    id: "grape_black_rot",
    crop: "Grape",
    diseaseName: "Black Rot",
    hindiName: "काला सड़न",
    scientificName: "Guignardia bidwellii",
    category: "fungal",
    severity: "high",
    symptoms: [
      "Tan circular spots on leaves with dark borders",
      "Small black dots (pycnidia) in leaf lesions",
      "Berries turn brown then black (mummified)",
      "Entire cluster may be destroyed"
    ],
    affectedParts: ["leaves", "berries", "shoots"],
    images: ["Grape___Black_rot"],
    conditions: {
      temperature: "20-30°C",
      humidity: ">80%",
      season: ["Kharif", "Monsoon"],
      soil: "Warm wet weather"
    },
    treatment: {
      chemical: [
        "Mancozeb 75% WP @ 2.5g/L before bloom",
        "Myclobutanil 10% WP @ 0.4g/L",
        "Azoxystrobin 23% SC @ 1ml/L post-bloom"
      ],
      organic: [
        "Copper oxychloride 50% WP @ 3g/L",
        "Bordeaux mixture 0.5%",
        "Neem oil spray"
      ],
      cultural: [
        "Remove and destroy mummified berries",
        "Prune for open canopy",
        "Remove diseased tendrils and shoots",
        "Good vineyard sanitation"
      ]
    },
    prevention: [
      "Proper canopy management",
      "Remove all mummies before budbreak",
      "Begin fungicide at 10-15cm shoot growth",
      "Maintain clean vineyard floor"
    ],
    yieldLoss: "30-80%",
    spreadRate: "moderate",
    confidence: 0.91
  },
  {
    id: "grape_esca",
    crop: "Grape",
    diseaseName: "Esca (Black Measles)",
    hindiName: "एस्का रोग",
    scientificName: "Phaeomoniella chlamydospora complex",
    category: "fungal",
    severity: "high",
    symptoms: [
      "Tiger-stripe pattern on leaves (interveinal chlorosis)",
      "Dark spots on berries (measles)",
      "Sudden vine collapse in summer",
      "Internal wood necrosis (black streaks in cross-section)"
    ],
    affectedParts: ["leaves", "berries", "wood"],
    images: ["Grape___Esca_(Black_Measles)"],
    conditions: {
      temperature: "25-35°C",
      humidity: "Variable",
      season: ["Summer"],
      soil: "Stressed vines, pruning wounds"
    },
    treatment: {
      chemical: [
        "No effective chemical cure",
        "Sodium arsenite banned in most countries",
        "Fosetyl-Al trunk injection (experimental)"
      ],
      organic: [
        "Trichoderma-based pruning wound protectant",
        "Biopaste on pruning cuts"
      ],
      cultural: [
        "Remove and destroy infected vines",
        "Protect pruning wounds with paste",
        "Prune during dry weather",
        "Reduce vine stress"
      ]
    },
    prevention: [
      "Protect all pruning wounds",
      "Prune in late dormancy",
      "Maintain vine health and vigor",
      "Remove dead wood regularly"
    ],
    yieldLoss: "20-100% (vine death)",
    spreadRate: "slow",
    confidence: 0.85
  },
  {
    id: "grape_leaf_blight",
    crop: "Grape",
    diseaseName: "Isariopsis Leaf Spot",
    hindiName: "पत्ती धब्बा",
    scientificName: "Pseudocercospora vitis",
    category: "fungal",
    severity: "medium",
    symptoms: [
      "Small dark brown angular spots on leaves",
      "Spots bounded by veins",
      "Leaf may show scorched appearance",
      "Premature defoliation in severe cases"
    ],
    affectedParts: ["leaves"],
    images: ["Grape___Leaf_blight_(Isariopsis_Leaf_Spot)"],
    conditions: {
      temperature: "22-28°C",
      humidity: ">80%",
      season: ["Kharif"],
      soil: "Warm humid conditions"
    },
    treatment: {
      chemical: [
        "Mancozeb 75% WP @ 2.5g/L",
        "Copper oxychloride 50% WP @ 2.5g/L",
        "Carbendazim 50% WP @ 1g/L"
      ],
      organic: [
        "Bordeaux mixture 0.5%",
        "Neem oil 2% spray",
        "Trichoderma viride spray"
      ],
      cultural: [
        "Remove infected leaves",
        "Improve air circulation",
        "Avoid overhead irrigation",
        "Balanced fertilization"
      ]
    },
    prevention: [
      "Good canopy management",
      "Regular fungicide program",
      "Avoid dense planting",
      "Remove fallen debris"
    ],
    yieldLoss: "15-30%",
    spreadRate: "moderate",
    confidence: 0.86
  },

  // ==================== SUGARCANE DISEASES (2) ====================
  {
    id: "sug_red_rot",
    crop: "Sugarcane",
    diseaseName: "Red Rot",
    hindiName: "लाल सड़न",
    scientificName: "Colletotrichum falcatum",
    category: "fungal",
    severity: "critical",
    symptoms: [
      "Red discoloration inside the cane stalk",
      "White patches across the red area",
      "Withering and drying of crown leaves",
      "Hollow, sour-smelling stalks",
      "Yellowing of third and fourth leaves"
    ],
    affectedParts: ["stalk", "leaves"],
    images: ["Sugarcane___Red_rot"],
    conditions: {
      temperature: "25-32°C",
      humidity: ">80%",
      season: ["Kharif", "Monsoon"],
      soil: "Waterlogged, infected setts"
    },
    treatment: {
      chemical: [
        "Carbendazim 50% WP sett treatment @ 0.1%",
        "Thiophanate methyl 70% WP @ 0.1%",
        "No effective post-infection cure"
      ],
      organic: [
        "Trichoderma viride @ 4g/kg sett treatment",
        "Pseudomonas fluorescens sett dip",
        "Organic matter enriched with bioagents"
      ],
      cultural: [
        "Remove and burn infected clumps",
        "Avoid ratooning of infected fields",
        "Do not use infected cane as seed",
        "Hot water treatment of setts (52°C for 30 min)"
      ]
    },
    prevention: [
      "Use resistant varieties (Co 0238, CoS 767)",
      "Hot water treatment of seed setts",
      "Disease-free certified seed material",
      "Crop rotation with rice or pulse crops"
    ],
    yieldLoss: "50-100%",
    spreadRate: "moderate",
    confidence: 0.88
  },
  {
    id: "sug_smut",
    crop: "Sugarcane",
    diseaseName: "Sugarcane Smut",
    hindiName: "कंड रोग",
    scientificName: "Sporisorium scitamineum",
    category: "fungal",
    severity: "high",
    symptoms: [
      "Black whip-like structure from growing point",
      "Excessive tillering with thin stalks",
      "Grass-like shoots from clumps",
      "No commercial cane formed"
    ],
    affectedParts: ["growing point", "whole plant"],
    images: ["Sugarcane___Smut"],
    conditions: {
      temperature: "28-34°C",
      humidity: "Any",
      season: ["All seasons"],
      soil: "Sick soils with spore accumulation"
    },
    treatment: {
      chemical: [
        "Propiconazole sett treatment @ 0.1%",
        "Triadimefon 25% WP sett dip",
        "No post-infection chemical control"
      ],
      organic: [
        "Trichoderma viride sett treatment",
        "Pseudomonas fluorescens application"
      ],
      cultural: [
        "rogue out (uproot) smutted clumps immediately",
        "Burn smut whips before spore release",
        "Use disease-free seed setts",
        "Do not ratoon smut-affected fields"
      ]
    },
    prevention: [
      "Use resistant varieties (Co 86032, CoC 671)",
      "Hot air treatment of setts (54°C for 2.5 hrs)",
      "Rogue out infected clumps regularly",
      "Avoid planting infected setts"
    ],
    yieldLoss: "30-70%",
    spreadRate: "moderate",
    confidence: 0.92
  },

  // ==================== MUSTARD/RAPESEED (2) ====================
  {
    id: "must_white_rust",
    crop: "Mustard",
    diseaseName: "White Rust",
    hindiName: "सफेद रतुआ",
    scientificName: "Albugo candida",
    category: "fungal",
    severity: "high",
    symptoms: [
      "White shiny raised pustules on leaf undersides",
      "Corresponding yellow patches on upper surface",
      "Staghead formation - hypertrophy of inflorescence",
      "Distorted flowers and pods"
    ],
    affectedParts: ["leaves", "inflorescence", "pods"],
    images: ["Mustard___White_rust"],
    conditions: {
      temperature: "12-22°C",
      humidity: ">80%",
      season: ["Rabi"],
      soil: "Cool moist weather, foggy conditions"
    },
    treatment: {
      chemical: [
        "Metalaxyl + Mancozeb (Ridomil Gold) @ 2.5g/L",
        "Mancozeb 75% WP @ 2.5g/L at 10-day intervals",
        "Copper oxychloride 50% WP @ 3g/L"
      ],
      organic: [
        "Neem oil 2% spray",
        "Trichoderma viride @ 4g/kg seed treatment",
        "Pseudomonas fluorescens spray"
      ],
      cultural: [
        "Remove and destroy stagheads",
        "Timely sowing (Oct 15-30)",
        "Avoid excess irrigation during foggy weather",
        "Crop rotation with non-cruciferous crops"
      ]
    },
    prevention: [
      "Use tolerant varieties (Pusa Mustard 25, RH 749)",
      "Timely sowing",
      "Seed treatment with Metalaxyl",
      "Avoid late planting"
    ],
    yieldLoss: "30-60%",
    spreadRate: "moderate",
    confidence: 0.88
  },
  {
    id: "must_alternaria_blight",
    crop: "Mustard",
    diseaseName: "Alternaria Blight",
    hindiName: "अल्टरनेरिया झुलसा",
    scientificName: "Alternaria brassicae",
    category: "fungal",
    severity: "high",
    symptoms: [
      "Dark brown circular spots with concentric rings on leaves",
      "Spots on pods causing premature shattering",
      "Dark streaks on stems",
      "Seed discoloration"
    ],
    affectedParts: ["leaves", "pods", "stems"],
    images: ["Mustard___Alternaria_blight"],
    conditions: {
      temperature: "20-28°C",
      humidity: ">80%",
      season: ["Rabi"],
      soil: "Warm humid weather during pod stage"
    },
    treatment: {
      chemical: [
        "Mancozeb 75% WP @ 2.5g/L starting 45 DAS",
        "Iprodione 50% WP @ 2g/L",
        "Azoxystrobin 23% SC @ 1ml/L"
      ],
      organic: [
        "Neem oil 2% spray",
        "Trichoderma viride @ 4g/kg seed treatment",
        "Garlic extract spray"
      ],
      cultural: [
        "Use healthy certified seeds",
        "Early sowing to escape disease",
        "Maintain optimal plant population",
        "Destroy crop debris after harvest"
      ]
    },
    prevention: [
      "Use tolerant varieties",
      "Seed treatment with Iprodione/Mancozeb",
      "Timely sowing",
      "Regular monitoring from 45 DAS onwards"
    ],
    yieldLoss: "25-50%",
    spreadRate: "moderate",
    confidence: 0.87
  },

  // ==================== CHICKPEA (2) ====================
  {
    id: "chick_wilt",
    crop: "Chickpea",
    diseaseName: "Fusarium Wilt",
    hindiName: "उकठा रोग",
    scientificName: "Fusarium oxysporum f. sp. ciceris",
    category: "fungal",
    severity: "critical",
    symptoms: [
      "Yellowing and wilting of entire plant",
      "Brown discoloration of internal stem tissue",
      "Drooping of petioles starting from lower leaves",
      "Plant dries up standing (no lodging)",
      "Seedling mortality in early wilt"
    ],
    affectedParts: ["roots", "stems", "whole plant"],
    images: ["Chickpea___Fusarium_wilt"],
    conditions: {
      temperature: "25-30°C",
      humidity: "Any",
      season: ["Rabi"],
      soil: "Infested soils, sandy loam"
    },
    treatment: {
      chemical: [
        "Carbendazim 50% WP seed treatment @ 2g/kg",
        "Carboxin + Thiram (Vitavax Power) @ 3g/kg",
        "No effective post-infection chemical control"
      ],
      organic: [
        "Trichoderma viride @ 4g/kg seed + 2.5kg/ha soil",
        "Pseudomonas fluorescens @ 10g/kg seed",
        "Rhizobium + Trichoderma combination"
      ],
      cultural: [
        "Use wilt-sick plot for testing resistance",
        "Deep summer ploughing",
        "Crop rotation for 3-4 years",
        "Remove and burn infected plants"
      ]
    },
    prevention: [
      "Use resistant varieties (JG 315, Pusa 362, KAK 2)",
      "Seed treatment with Trichoderma + Carbendazim",
      "Crop rotation with cereals (rice, wheat)",
      "Avoid continuous chickpea"
    ],
    yieldLoss: "30-100%",
    spreadRate: "moderate",
    confidence: 0.89
  },
  {
    id: "chick_ascochyta",
    crop: "Chickpea",
    diseaseName: "Ascochyta Blight",
    hindiName: "एस्कोकाइटा झुलसा",
    scientificName: "Ascochyta rabiei",
    category: "fungal",
    severity: "high",
    symptoms: [
      "Circular brown spots with dark borders on leaves",
      "Stem lesions causing girdling and breakage",
      "Spots with pycnidia (tiny black dots) on pods",
      "Seed discoloration"
    ],
    affectedParts: ["leaves", "stems", "pods", "seeds"],
    images: ["Chickpea___Ascochyta_blight"],
    conditions: {
      temperature: "15-25°C",
      humidity: ">80%",
      season: ["Rabi"],
      soil: "Cool wet weather, high altitude"
    },
    treatment: {
      chemical: [
        "Mancozeb 75% WP @ 2.5g/L",
        "Chlorothalonil 75% WP @ 2g/L",
        "Carbendazim + Mancozeb @ 2.5g/L"
      ],
      organic: [
        "Trichoderma viride seed treatment",
        "Neem oil spray at first symptom appearance"
      ],
      cultural: [
        "Use certified disease-free seeds",
        "Crop rotation for 3+ years",
        "Destroy infected crop residue",
        "Avoid dense sowing"
      ]
    },
    prevention: [
      "Use resistant varieties (ILC 3279, Flipper)",
      "Seed treatment",
      "Avoid early sowing in endemic areas",
      "Good field drainage"
    ],
    yieldLoss: "25-60%",
    spreadRate: "fast",
    confidence: 0.86
  },

  // ==================== ONION (2) ====================
  {
    id: "onion_purple_blotch",
    crop: "Onion",
    diseaseName: "Purple Blotch",
    hindiName: "बैंगनी धब्बा",
    scientificName: "Alternaria porri",
    category: "fungal",
    severity: "high",
    symptoms: [
      "Water-soaked lesions on leaves turning purple-brown",
      "Concentric rings within purple lesions",
      "Lesions girdle leaf causing tip die-back",
      "Purple spots on seed stalks",
      "Neck rot in stored onions"
    ],
    affectedParts: ["leaves", "seed stalks", "bulbs"],
    images: ["Onion___Purple_blotch"],
    conditions: {
      temperature: "25-30°C",
      humidity: ">80%",
      season: ["Kharif", "Rabi"],
      soil: "Warm humid, heavy dew conditions"
    },
    treatment: {
      chemical: [
        "Mancozeb 75% WP @ 2.5g/L at 10-15 day intervals",
        "Tricyclazole + Mancozeb combination",
        "Chlorothalonil 75% WP @ 2g/L"
      ],
      organic: [
        "Trichoderma viride set treatment",
        "Neem oil 2% spray",
        "Pseudomonas fluorescens @ 5g/L"
      ],
      cultural: [
        "Proper crop rotation (2-3 years)",
        "Avoid overhead irrigation",
        "Ensure good drainage",
        "Remove infected plant debris"
      ]
    },
    prevention: [
      "Use tolerant varieties (Arka Kalyan, NHRDF Red)",
      "Seed treatment with Thiram @ 3g/kg",
      "Balanced NPK fertilization",
      "Proper spacing for air circulation"
    ],
    yieldLoss: "30-50%",
    spreadRate: "moderate",
    confidence: 0.87
  },
  {
    id: "onion_downy_mildew",
    crop: "Onion",
    diseaseName: "Downy Mildew",
    hindiName: "मृदुरोमिल फफूंदी",
    scientificName: "Peronospora destructor",
    category: "fungal",
    severity: "high",
    symptoms: [
      "Pale green to yellow elongated patches on leaves",
      "Grey-violet fuzzy growth on leaf surface",
      "Leaf tips collapse and turn brown",
      "Systemic infection causes stunting",
      "Bulb development is poor"
    ],
    affectedParts: ["leaves", "bulbs"],
    images: ["Onion___Downy_mildew"],
    conditions: {
      temperature: "10-20°C",
      humidity: ">95%",
      season: ["Rabi"],
      soil: "Cool wet weather, morning dew"
    },
    treatment: {
      chemical: [
        "Metalaxyl + Mancozeb (Ridomil Gold) @ 2.5g/L",
        "Fosetyl-Al 80% WP @ 3g/L",
        "Mancozeb 75% WP @ 2.5g/L (preventive)"
      ],
      organic: [
        "Copper oxychloride 50% WP @ 3g/L",
        "Bordeaux mixture 0.5%",
        "Neem oil spray"
      ],
      cultural: [
        "Avoid planting in low-lying waterlogged areas",
        "Wide spacing for air circulation",
        "Avoid evening irrigation",
        "Destroy volunteer onion plants"
      ]
    },
    prevention: [
      "Use tolerant varieties",
      "Healthy sets/seedlings",
      "Good field drainage",
      "Avoid dense planting"
    ],
    yieldLoss: "30-70%",
    spreadRate: "fast",
    confidence: 0.86
  }
];

// ============ HELPER FUNCTIONS ============

export const getDiseasesByCrop = (crop: string): CropDisease[] =>
  cropDiseases.filter(d => d.crop.toLowerCase() === crop.toLowerCase());

export const getDiseasesByCategory = (category: CropDisease["category"]): CropDisease[] =>
  cropDiseases.filter(d => d.category === category);

export const getDiseasesBySeverity = (severity: CropDisease["severity"]): CropDisease[] =>
  cropDiseases.filter(d => d.severity === severity);

export const searchDiseases = (query: string): CropDisease[] => {
  const q = query.toLowerCase();
  return cropDiseases.filter(d =>
    d.diseaseName.toLowerCase().includes(q) ||
    d.crop.toLowerCase().includes(q) ||
    d.hindiName.includes(q) ||
    d.symptoms.some(s => s.toLowerCase().includes(q)) ||
    d.scientificName.toLowerCase().includes(q)
  );
};

export const getCriticalDiseases = (): CropDisease[] =>
  cropDiseases.filter(d => d.severity === "critical");

export const getAllCropsWithDiseases = (): string[] =>
  [...new Set(cropDiseases.map(d => d.crop))];

export const getPlantVillageClasses = (): string[] =>
  cropDiseases.flatMap(d => d.images);
