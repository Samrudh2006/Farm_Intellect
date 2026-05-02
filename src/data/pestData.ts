// Pest Detection Dataset
// Sources: NCIPM (National Centre for Integrated Pest Management), ICAR crop protection manuals,
// FAO pest risk assessment, CIBRC India, PPQ (Plant Protection Quarantine) data

import { createDatasetMetadata } from "./datasetMetadata";

export interface PestProfile {
  id: string;
  name: string;
  localName: string;               // Hindi / regional name
  scientificName: string;
  order: string;
  family: string;
  category: "insect" | "mite" | "nematode" | "rodent" | "bird" | "mollusk" | "whitefly" | "thrips";
  affectedCrops: string[];
  lifeStage: ("egg" | "larva" | "nymph" | "adult" | "pupa")[];
  description: string;
  identification: {
    egg: string;
    larva?: string;
    adult: string;
    damage: string;
  };
  lifecycle: {
    stage: string;
    duration: string;
    location: string;
  }[];
  totalLifecycleDays: { min: number; max: number };
  seasonalPeak: string[];
  damageType: string;
  yieldLoss: string;
  ETL: string;                    // Economic Threshold Level
  monitoring: string;
  IPMStrategy: {
    cultural: string[];
    biological: string[];
    chemical: { pesticide: string; dose: string; formulation: string; timing: string }[];
  };
  resistance: string;             // Known chemical resistances
  quarantineStatus: "A1" | "A2" | "Regulated" | "None";  // NPPO classification
}

export const pestDataMetadata = createDatasetMetadata({
  version: "1.0.0",
  lastUpdated: "2024-11-01T00:00:00Z",
  source: "NCIPM, ICAR crop protection manuals, FAO pest risk data",
  notes: "Integrated pest profiles with IPM recommendations.",
});

export const pestProfiles: PestProfile[] = [
  // =================== RICE PESTS ===================
  {
    id: "pest_001",
    name: "Brown Planthopper",
    localName: "Bhura Phoonka / Bura Majakha",
    scientificName: "Nilaparvata lugens (Stål)",
    order: "Hemiptera",
    family: "Delphacidae",
    category: "insect",
    affectedCrops: ["Rice"],
    lifeStage: ["egg", "nymph", "adult"],
    description: "One of the most destructive rice pests in Asia. Causes 'hopper burn' — circular dead patches. Macropterous (winged) adults migrate, brachypterous prefer to stay. Both suck phloem sap.",
    identification: {
      egg: "White elongated, inserted in leaf sheaths in rows",
      adult: "Macropterous: 3.5-4.5mm, brown with wings. Brachypterous: 2-3mm, dark brown, short wings. Both aggregate at base of plant.",
      damage: "Hopper burn — circular yellowing patches from plant base, plants dry, hollow stems. Sooty mould on honeydew."
    },
    lifecycle: [
      { stage: "Egg", duration: "6-8 days", location: "Inside leaf sheath tissue" },
      { stage: "Nymph (5 instars)", duration: "14-17 days", location: "Base of plant, leaf sheath" },
      { stage: "Adult", duration: "20-25 days", location: "Base of plant" }
    ],
    totalLifecycleDays: { min: 40, max: 50 },
    seasonalPeak: ["July-September (Kharif)", "October-November (resurgence)"],
    damageType: "Phloem feeding, honeydew excretion → sooty mould, virus transmission (Grassy Stunt, Ragged Stunt viruses)",
    yieldLoss: "Complete crop loss if hopper burn occurs at tillering or heading",
    ETL: "1 adult per hill at tillering; 5-10 hoppers per hill at vegetative stage",
    monitoring: "Light traps (peak migration), direct counting per hill method",
    IPMStrategy: {
      cultural: [
        "Grow resistant varieties (IR 72, Swarna, MTU 1010, Pusa Basmati 1121)",
        "Avoid nitrogen loading (limits N use to <100 kg/ha)",
        "Maintain field drainage to reduce humidity",
        "AVoid chlorpyrifos (causes BPH resurgence)",
        "Plant spacing 20×20 cm for air circulation",
        "Reduce insecticide use to preserve natural enemies"
      ],
      biological: [
        "Preserve spiders (Lycosa pseudoannulata, Araneae)",
        "Mirid bug predator (Cyrtorhinus lividipennis)",
        "Parasitoid egg wasps (Anagrus nilaparvatae)",
        "Beauveria bassiana 1×10⁸ cfu/ml spray"
      ],
      chemical: [
        { pesticide: "Buprofezin", dose: "1 ml/L", formulation: "25% SC", timing: "At nymph stage, before hopper burn" },
        { pesticide: "Pymetrozine", dose: "0.6 g/L", formulation: "50% WG", timing: "At nymph stage" },
        { pesticide: "Imidacloprid", dose: "0.3 ml/L", formulation: "17.8% SL", timing: "Preventive at transplanting seedlings" },
        { pesticide: "Dinotefuran", dose: "0.3 g/L", formulation: "20% SG", timing: "At hopper burn onset" }
      ]
    },
    resistance: "High resistance to carbofuran, monocrotophos, buprofezin (in some populations); rotate insecticide classes",
    quarantineStatus: "None"
  },
  {
    id: "pest_002",
    name: "Stem Borer (Yellow Stem Borer)",
    localName: "Tana Borer / Pith Borer",
    scientificName: "Scirpophaga incertulas (Walker)",
    order: "Lepidoptera",
    family: "Crambidae",
    category: "insect",
    affectedCrops: ["Rice"],
    lifeStage: ["egg", "larva", "pupa", "adult"],
    description: "Yellow stem borer is the most widespread stem borer of rice. Larvae bore into stems causing 'dead heart' at vegetative stage and 'white ear' at reproductive stage.",
    identification: {
      egg: "Round egg masses covered with brown/buff hairs on leaf underside, 50-150 eggs/mass",
      larva: "Yellow-white larva 20-25mm, dark dorsal stripe, head red-brown",
      adult: "Female: yellowish-white 10-13mm wingspan, black spot on forewing. Male: smaller, whitish.",
      damage: "Dead heart: central shoot dries at vegetative stage pulls out easily. White ear: panicle fails to fill at reproductive stage."
    },
    lifecycle: [
      { stage: "Egg", duration: "5-8 days", location: "Leaf surface in masses" },
      { stage: "Larva (5-8 instars)", duration: "25-35 days", location: "Inside stem, moves tiller to tiller" },
      { stage: "Pupa", duration: "7-10 days", location: "Base of plant inside stem" },
      { stage: "Adult", duration: "5-8 days", location: "Above crop canopy, oviposits at night" }
    ],
    totalLifecycleDays: { min: 42, max: 61 },
    seasonalPeak: ["June-July (1st gen), August-September (2nd gen)", "2nd generation most destructive"],
    damageType: "Stem boring, blocks nutrient transport",
    yieldLoss: "5-10% on average; up to 60-80% in severe outbreaks",
    ETL: "5% dead hearts at vegetative; 1-2 egg masses per m² before transplanting",
    monitoring: "Light traps for adult monitoring; count dead hearts in 10 random spots of 1m²",
    IPMStrategy: {
      cultural: [
        "Clip tips of seedlings before transplanting to destroy egg masses",
        "Remove and destroy egg masses regularly",
        "Avoid excessive N at early stage (reduces attraction)",
        "Flood fields during tillering (drowns pupae)",
        "Short-duration varieties (escape late season 2nd generation)"
      ],
      biological: [
        "Release Trichogramma japonicum @ 1 lakh cards/ha at 1st and 2nd week after transplanting",
        "Release Telenomus rowani (egg parasitoid)",
        "Encourage Braconid wasp (Cotesia flavipes) - larval parasitoid",
        "Bacillus thuringiensis (Bt) kurstaki @ 2-3 kg/ha spray into whorls"
      ],
      chemical: [
        { pesticide: "Chlorantraniliprole", dose: "0.4 ml/L spray or 4 kg/ha granules", formulation: "18.5% SC or 0.4% G", timing: "At 25-30 DAT, early larval stage" },
        { pesticide: "Fipronil", dose: "3 kg/ha granules", formulation: "0.3% G", timing: "Broadcast at transplanting for soil-borne pupae" },
        { pesticide: "Cartap hydrochloride", dose: "1.5 g/L", formulation: "50% SP", timing: "At egg hatching time" },
        { pesticide: "Flubendiamide", dose: "0.5 ml/L", formulation: "20% WG", timing: "At 1st -2nd instar larval stage" }
      ]
    },
    resistance: "Developing resistance to some organophosphates in South India; rotate with diamide insecticides",
    quarantineStatus: "None"
  },
  {
    id: "pest_003",
    name: "Green Leafhopper",
    localName: "Hara Teetla",
    scientificName: "Nephotettix virescens (Distant)",
    order: "Hemiptera",
    family: "Cicadellidae",
    category: "insect",
    affectedCrops: ["Rice"],
    lifeStage: ["egg", "nymph", "adult"],
    description: "Important vector of Rice Tungro Virus (RTV) — most economically important virus disease of rice. Even low populations can transmit tungro.",
    identification: {
      egg: "Inserted in pairs in leaf midrib, 6-10 eggs/mass",
      adult: "Bright green, 4-6mm, wedge-shaped, black spot on forewing",
      damage: "Direct: yellowing, stunting. Indirect (major): Tungro virus causes orange-yellow leaf discoloration, severe stunting, no heading."
    },
    lifecycle: [
      { stage: "Egg", duration: "4-8 days", location: "Leaf blade/sheath tissue" },
      { stage: "Nymph (5 instars)", duration: "16-22 days", location: "On leaf surface" },
      { stage: "Adult", duration: "25-40 days", location: "Leaf blades, active fliers" }
    ],
    totalLifecycleDays: { min: 45, max: 70 },
    seasonalPeak: ["April-May (Zaid nursery)","July-August (Kharif)"],
    damageType: "Phloem feeding + Tungro virus vector (one acquisition feed of 30 min infects plant permanently)",
    yieldLoss: "Tungro: 50-100% in severe cases; endemic in parts of South India, Assam, West Bengal",
    ETL: "2 adults per hill (non-Tungro area); spray immediately if Tungro symptoms seen",
    monitoring: "Yellow sticky traps; tungro-infected plant appearance (orange-yellow)",
    IPMStrategy: {
      cultural: [
        "Synchronized planting in community to break pest cycle",
        "Avoid late planting near Tungro-endemic areas",
        "Remove volunteer rice plants (virus source)",
        "Grow resistant varieties (TN1 susceptible; IR 8, Pankaj, MTU-7029 resistant)",
        "Adjust planting date to avoid peak vector periods"
      ],
      biological: [
        "Parasitoid egg wasps (Anagrus spp.)",
        "Predatory spiders",
        "Mirid bugs (Cyrtorhinus spp.)"
      ],
      chemical: [
        { pesticide: "Imidacloprid", dose: "0.3 ml/L", formulation: "17.8% SL", timing: "Seedling root-dip treatment or at 1-2 GLH/hill" },
        { pesticide: "Thiamethoxam", dose: "0.2 g/L", formulation: "25% WG", timing: "At nymph stage" },
        { pesticide: "Dinotefuran", dose: "1 ml/L", formulation: "20% SG", timing: "At migration appearance" }
      ]
    },
    resistance: "Developing resistance to neonicotinoids; rotate with pymetrozine or buprofezin",
    quarantineStatus: "None"
  },

  // =================== WHEAT PESTS ===================
  {
    id: "pest_004",
    name: "Aphids (Wheat Aphid Complex)",
    localName: "Mahoo / Saru",
    scientificName: "Sitobion avenae, Rhopalosiphum padi, Schizaphis graminum",
    order: "Hemiptera",
    family: "Aphididae",
    category: "insect",
    affectedCrops: ["Wheat", "Barley", "Oats", "Maize (Rhopalosiphum maidis)"],
    lifeStage: ["nymph", "adult"],
    description: "Three species attack wheat: Sitobion (grain aphid on ears), Rhopalosiphum padi (bird-cherry aphid on lower leaves), Schizaphis graminum (greenbug — most toxic). Cause direct damage + virus (BYDV) transmission.",
    identification: {
      egg: "Black shiny eggs on woody hosts (overwintering) — not in India",
      adult: "S. avenae: Green/red-brown, 1.5-2.5mm. R. padi: olive-green with rust patch. S. graminum: small, pale green. Colonies on leaves, sheaths, ears.",
      damage: "Yellowing, leaf malformation, honeydew-sooty mould; ear damage reduces grain weight"
    },
    lifecycle: [
      { stage: "Nymph", duration: "8-12 days", location: "Leaf underside, sheath" },
      { stage: "Adult (apterous)", duration: "20-30 days", location: "Colonising same plant" },
      { stage: "Alate (winged) adult", duration: "Migration events", location: "Dispersal" }
    ],
    totalLifecycleDays: { min: 28, max: 42 },
    seasonalPeak: ["December-February (Rabi)","January peak — cool weather favours aphids"],
    damageType: "Phloem feeding, honeydew deposition, BYDV virus vector",
    yieldLoss: "2-8% on average; up to 20% in heavy infestation years",
    ETL: "10 aphids per ear (S. avenae) or 50 per tiller; 5 per tiller if BYDV risk",
    monitoring: "Yellow/green water pan traps; direct sampling 5 tillers/site at 20 random sites",
    IPMStrategy: {
      cultural: [
        "Early sowing (avoid late sown where aphids peak)",
        "Timely irrigation (creates unfavourable humidity)",
        "Avoid excess nitrogen (lush growth attracts aphids)"
      ],
      biological: [
        "Natural enemies: Lady beetles (Coccinella septempunctata), lacewings, hover flies",
        "Parasitoid wasps (Diaeretiella rapae)",
        "Preserve natural enemies by avoiding broad-spectrum insecticides"
      ],
      chemical: [
        { pesticide: "Dimethoate", dose: "1.5 ml/L", formulation: "30% EC", timing: "At ETL — first occurrence" },
        { pesticide: "Imidacloprid", dose: "0.3 ml/L", formulation: "17.8% SL", timing: "At first aphid appearance on ears" },
        { pesticide: "Thiamethoxam", dose: "0.5 g/kg seed", formulation: "30% FS", timing: "Seed treatment — systemic protection for 45-60 days" },
        { pesticide: "Chlorpyrifos", dose: "2.0 ml/L", formulation: "20% EC", timing: "If severe infestation before flowering" }
      ]
    },
    resistance: "Some resistance to organophosphates; neonicotinoids remain effective",
    quarantineStatus: "None"
  },
  {
    id: "pest_005",
    name: "Termite",
    localName: "Deemak / Cheenti",
    scientificName: "Odontotermes obesus, Microtermes obesi, Heterotermes indicola",
    order: "Isoptera",
    family: "Termitidae",
    category: "insect",
    affectedCrops: ["Wheat", "Sugarcane", "Maize", "Groundnut", "Cotton", "Sorghum"],
    lifeStage: ["egg", "larva", "adult"],
    description: "Subterranean termites cause significant damage by feeding on roots and lower stem. More severe in light sandy soils with low moisture. Attack at germination and after stresses.",
    identification: {
      egg: "Oval, creamy white, 0.5mm, in underground galleries",
      larva: "Workers: white, 2-5mm. Soldiers: amber head, 4-6mm. No visible instar differences to field farmer.",
      adult: "Winged alates: dark brown, 10-12mm with wings. Emerge during pre-monsoon rains.",
      damage: "Complete hollowing of roots and stem base, leaving shell. Galleried stem. Mud-covered entry. Plants pull out leaving only outer husk. 'Deadheart' similar to borer."
    },
    lifecycle: [
      { stage: "Egg", duration: "12-14 days", location: "Underground galleries" },
      { stage: "Worker (takes 2 years to colony development)", duration: "Variable", location: "Soil tunnels" },
      { stage: "Alate emergence (nuptial flight)", duration: "April-June, post first monsoon rain", location: "Above ground" }
    ],
    totalLifecycleDays: { min: 0, max: 0 },  // Perennial colony
    seasonalPeak: ["March-June (hot, dry conditions)", "October-November (Rabi)"],
    damageType: "Underground stem/root feeding, gallerying, caused by worker caste",
    yieldLoss: "5-15% in infested fields; up to 25-30% in patches",
    ETL: "Act at first sign of wilting; no formal ETL due to cryptic nature",
    monitoring: "Mound inspection, scout at 10-15 DAS for wilting patches",
    IPMStrategy: {
      cultural: [
        "Thoroughly decompose organic matter before incorporating (half-rotten material attracts termites)",
        "Remove tree stumps and dead wood from fields",
        "Flooded/irrigated fields less susceptible",
        "Avoid continuous sole cropping — rotate with rice or mustard"
      ],
      biological: [
        "Metarhizium anisopliae (fungal bioinsecticide) — mix granules in soil @ 2.5 kg/ha",
        "Naturally occurring nematodes (Steinernema spp.) drench"
      ],
      chemical: [
        { pesticide: "Chlorpyrifos", dose: "4 L/ha in 60L water", formulation: "20% EC", timing: "Soil drench at sowing; or 250 ml/L irrigation water" },
        { pesticide: "Imidacloprid", dose: "6 ml/kg seed", formulation: "48% FS", timing: "Seed treatment — best prevention" },
        { pesticide: "Bifenthrin", dose: "1 L/ha", formulation: "10% EC (soil drench)", timing: "At infestation detection" },
        { pesticide: "Fipronil", dose: "3 kg/ha granules", formulation: "0.3% G", timing: "Broadcast in soil before sowing" }
      ]
    },
    resistance: "Low resistance issues reported; rotate with fipronil/imidacloprid",
    quarantineStatus: "None"
  },

  // =================== COTTON PESTS ===================
  {
    id: "pest_006",
    name: "Cotton Bollworm (American)",
    localName: "Hari Sundi / Tomato Fruitworm",
    scientificName: "Helicoverpa armigera (Hübner)",
    order: "Lepidoptera",
    family: "Noctuidae",
    category: "insect",
    affectedCrops: ["Cotton", "Tomato", "Chickpea", "Sorghum", "Maize", "Sunflower", "Groundnut"],
    lifeStage: ["egg", "larva", "pupa", "adult"],
    description: "Most polyphagous and economically devastating lepidopterous pest in India. The most expensive pest to control globally. Bt toxin-producing (Cry1Ac) cotton provides protection against this pest.",
    identification: {
      egg: "Dome-shaped, ribbed, 0.4-0.5mm, white turning grey, laid singly on young plant parts",
      larva: "Beige/olive-green to brown, 2-4 cm, fine spines, lateral white band with dark spots. Cannibalistic.",
      adult: "Wing span 35-40mm, yellowish brown forewing with dark spot, hindwing white with black margin",
      damage: "Circular holes in bolls with frass (bore one boll then move to another). Tomato: circular entry. Gram: round holes in pods. Sunflower: head feeding."
    },
    lifecycle: [
      { stage: "Egg", duration: "2-4 days", location: "Young plant parts, flowers, boll surface" },
      { stage: "Larva (6 instars)", duration: "18-22 days", location: "Inside bolls/pods/fruit from 2nd instar" },
      { stage: "Prepupa", duration: "2-3 days", location: "Soil surface" },
      { stage: "Pupa", duration: "10-18 days (up to 6 months diapause)", location: "5-8 cm deep in soil" },
      { stage: "Adult", duration: "7-15 days", location: "Canopy at night" }
    ],
    totalLifecycleDays: { min: 39, max: 62 },
    seasonalPeak: ["August-October (cotton Kharif)", "February-March (chickpea Rabi)", "Year-round in South India"],
    damageType: "Borer — young larvae feed on leaves, older larvae bore fruits/bolls; highly mobile",
    yieldLoss: "20-50% in cotton, 30-80% in chickpea under severe attack",
    ETL: "1 larva per plant or 5% damage in cotton. Chickpea: 1-2 larvae per meter row",
    monitoring: "Pheromone trap (Helilure) 1/2 acre; 5 moths/trap/night = spray threshold",
    IPMStrategy: {
      cultural: [
        "Bt cotton (Cry1Ac) — most effective GM strategy",
        "Intercroping with coriander, marigold, sorghum as trap crops",
        "Deep ploughing in summer to expose pupae (June)",
        "Remove and destroy infested bolls",
        "Short crop duration to avoid 3rd/4th generation"
      ],
      biological: [
        "Trichogramma chilonis egg parasitoid @ 1 lakh/acre at egg peak",
        "NPV-H (Helicoverpa nuclear polyhedrosis virus) @ 250 LE/ha",
        "Bacillus thuringiensis kurstaki @ 2 kg/ha at 1st-2nd instar larvae",
        "Chrysoperla carnea @ 1 lakh eggs/acre (lacewing)",
        "Campoletis chlorideae (larval parasitoid)"
      ],
      chemical: [
        { pesticide: "Emamectin benzoate", dose: "0.4 g/L", formulation: "5% SG", timing: "At 1st-2nd instar larvae (most effective)" },
        { pesticide: "Chlorantraniliprole", dose: "0.4 ml/L", formulation: "18.5% SC", timing: "At egg hatching" },
        { pesticide: "Indoxacarb + Acetamiprid (Avaunt + Assail)", dose: "0.5 ml/L + 0.5 ml/L", formulation: "14.5% SC", timing: "At 2nd instar" },
        { pesticide: "Spinosad", dose: "0.3 ml/L", formulation: "45% SC diluted", timing: "At early larval stage — preserves natural enemies" },
        { pesticide: "Lambda-cyhalothrin", dose: "0.5 ml/L", formulation: "5% EC", timing: "Last resort at heavy infestation" }
      ]
    },
    resistance: "HIGH resistance to pyrethroids, endosulfan, organophosphates. Developing resistance to spinosad. Avoid repeated use of any class.",
    quarantineStatus: "None"
  },
  {
    id: "pest_007",
    name: "Whitefly (Cotton/Tobacco Whitefly)",
    localName: "Safed Makhi",
    scientificName: "Bemisia tabaci (Gennadius) — Biotype B (B. argentifolii)",
    order: "Hemiptera",
    family: "Aleyrodidae",
    category: "whitefly",
    affectedCrops: ["Cotton", "Tomato", "Potato", "Chilli", "Mung bean", "Eggplant"],
    lifeStage: ["egg", "nymph", "adult"],
    description: "Super-pest vector of Cotton Leaf Curl Virus (CLCuV) — catastrophic disease of cotton in Punjab, Haryana. Single pest that devastated Pakistan/India Bt cotton crops in 2015. Also causes direct damage by phloem feeding.",
    identification: {
      egg: "Pale yellow, oval, 0.2mm, on leaf underside on stalks",
      larva: "Immobile 'scale-like' nymphs, pale translucent oval discs 0.3-0.7mm",
      adult: "Tiny 1-1.5mm, white waxy wings, holds wings tent-like. Huge clouds when disturbed from plants.",
      damage: "Yellowing, curling (CLCuV symptoms). Honeydew → sooty mould, stickiness. In tomato: irregular ripening (tomato silvering)."
    },
    lifecycle: [
      { stage: "Egg", duration: "5-8 days", location: "Underside of leaves" },
      { stage: "Nymph (4 instars)", duration: "12-16 days", location: "Underside of leaves, sessile" },
      { stage: "Adult", duration: "10-15 days", location: "Plant canopy, active flier" }
    ],
    totalLifecycleDays: { min: 27, max: 39 },
    seasonalPeak: ["August-October (Cotton)", "Year-round in glasshouses"],
    damageType: "Phloem sucking + CLCuV virus vector + sooty mould from honeydew",
    yieldLoss: "CLCuV causes 30-100% loss in cotton; economic damage in all hosts",
    ETL: "10 adult whiteflies per leaf or 50 nymphs per leaf",
    monitoring: "Yellow sticky traps; count adults per leaf on 10 random plants",
    IPMStrategy: {
      cultural: [
        "Plant CLCuV-tolerant/resistant cotton varieties (KISSAN variety, Sahiwal-2023)",
        "Roguing: remove CLCuV-infected plants early",
        "Avoid border sowing near alternate hosts (weeds, okra, tomato)",
        "Avoid excess nitrogen (reduces attractiveness to whitefly)",
        "Clean cultivation — remove alternate host weeds"
      ],
      biological: [
        "Beauveria bassiana @ 5×10⁸ cfu/ml — 2 sprays at humid conditions",
        "Lecanicillium lecanii @ 5×10⁸ cfu/ml",
        "Predatory bugs (Geocoris spp., Orius spp.)",
        "Parasitoid wasps (Eretmocerus mundus, Encarsia formosa)"
      ],
      chemical: [
        { pesticide: "Diafenthiuron", dose: "1 g/L", formulation: "50% WP", timing: "At first appearance — most effective nymphal stage" },
        { pesticide: "Spiromesifen", dose: "0.5 ml/L", formulation: "22.9% SC", timing: "Disrupts lipid biosynthesis — excellent vs nymphs" },
        { pesticide: "Buprofezin + Acephate", dose: "1 g/L + 1.5 g/L", formulation: "25% WP mix", timing: "Tank mix for adults + nymphs" },
        { pesticide: "Flonicamid", dose: "0.2 g/L", formulation: "50% WG", timing: "Affects feeding behaviour, anti-viral transmission" }
      ]
    },
    resistance: "Extreme resistance to all major classes. Resistance management CRITICAL. Use rotation: diamides → butenolides → tetronic acids → pyridine azomethines.",
    quarantineStatus: "Regulated"
  },

  // =================== COMMON PESTS (ALL CROPS) ===================
  {
    id: "pest_008",
    name: "Fall Armyworm",
    localName: "Nauvi Sundi / Sena Keet",
    scientificName: "Spodoptera frugiperda (J.E. Smith)",
    order: "Lepidoptera",
    family: "Noctuidae",
    category: "insect",
    affectedCrops: ["Maize", "Sorghum", "Millet", "Rice", "Sugarcane", "Cotton", "Vegetables"],
    lifeStage: ["egg", "larva", "pupa", "adult"],
    description: "Invasive pest originating from Americas, detected in India in May 2018 (Karnataka). Rapidly spread across all Indian states by 2019. Highly migratory — single adult flies 100km/night. FAO Pest of International Concern.",
    identification: {
      egg: "White dome-shaped masses 100-200 eggs, covered with grey fuzz, on upper leaf surface",
      larva: "Distinctive: inverted Y on head capsule. 4 dark spots in square arrangement on 8th abdominal segment. Brown/green, 3-4cm mature. Key ID character separates from other armyworms.",
      adult: "Mottled grey-brown forewing, white triangular spot near apex. 32–40mm wingspan",
      damage: "Skeletonized leaves → large irregular holes → windowpane damage → whorl filled with frass. Strips field in 1-3 nights at high density."
    },
    lifecycle: [
      { stage: "Egg", duration: "2-4 days (25°C), 5-8 days (lower temp)", location: "Upper leaf surface, near whorl" },
      { stage: "Larva (6 instars)", duration: "14-30 days (25°C preferred)", location: "Initially inside whorl, later external feeding" },
      { stage: "Pupa", duration: "8-12 days", location: "3-5 cm deep in soil" },
      { stage: "Adult", duration: "7-21 days", location: "Nocturnal, long-distance migrant" }
    ],
    totalLifecycleDays: { min: 31, max: 67 },
    seasonalPeak: ["June-October (Kharif maize)", "Year-round in South India (non-frost areas)"],
    damageType: "Voracious leaf/stem feeder; whorl damage causes malformed ears",
    yieldLoss: "30-50% in severe attack; total loss of young seedlings possible",
    ETL: "5% damaged plants or 1-2 larvae/plant at early vegetative stage",
    monitoring: "Pheromone trap with FAW-specific lure; count damage in 10 random whorls",
    IPMStrategy: {
      cultural: [
        "Early planting to avoid peak adult migration",
        "Push-Pull technology: Napier grass border + Desmodium intercrop",
        "Sand:lime (9:1) mixture applied to whorl — abrades larvae",
        "Tilt early maize sowing date 2-3 weeks",
        "Avoid late planting in endemic areas"
      ],
      biological: [
        "Spodoptera frugiperda NPV (SfNPV) @ 450 LE/ha spray into whorl",
        "Bacillus thuringiensis kurstaki @ 2-3 kg/ha into whorl",
        "Trichogramma chilonis egg parasitoid @ 1 lakh/acre",
        "Nomuraea rileyi @ 5×10⁸ cfu/ml — entomopathogenic fungus",
        "Heterorhabditis bacteriophora nematodes for soil larval stage"
      ],
      chemical: [
        { pesticide: "Emamectin benzoate", dose: "0.4 g/L", formulation: "5% SG", timing: "At 1st-2nd instar larval stage, spray into whorl" },
        { pesticide: "Spinetoram", dose: "0.5 ml/L", formulation: "11.7% SC", timing: "At first damage appearance, 7-day rotation" },
        { pesticide: "Chlorantraniliprole", dose: "0.4 ml/L", formulation: "18.5% SC", timing: "At egg hatch, 10-day rotation" },
        { pesticide: "Thiamethoxam + Lambda-cyhalothrin", dose: "0.25 ml/L", formulation: "12.6%+9.5% ZC", timing: "At adult oviposition peak (light trap data)" }
      ]
    },
    resistance: "Developing resistance to spinosyns, pyrethroids in certain populations. Resistance management essential from first season.",
    quarantineStatus: "A2"
  },
  {
    id: "pest_009",
    name: "Thrips (Tobacco Thrips / Onion Thrips)",
    localName: "Thrips / Chatpa Keet",
    scientificName: "Thrips tabaci Lindeman; Frankliniella schultzei",
    order: "Thysanoptera",
    family: "Thripidae",
    category: "thrips",
    affectedCrops: ["Onion", "Garlic", "Chilli", "Cotton", "Groundnut", "Mango", "Tomato"],
    lifeStage: ["egg", "larva", "pupa", "adult"],
    description: "Silver-leaf thrips cause direct damage by rasping and sucking. Also vector of Tomato Spotted Wilt Virus (TSWV) and Iris Yellow Spot Virus (IYSV). Onion/garlic crops most severely affected.",
    identification: {
      egg: "Beans-shaped, white, inserted in plant tissue",
      larva: "White/yellow nymphs 0.5-1mm on leaf surface",
      adult: "Pale yellow to brown, fringed wings, 1-1.5mm, torpedo-shaped",
      damage: "Silvery patches/streaks on leaves (feeding scars). Onion leaf tip drying, black spots (IYSV). Curling/twisting of new leaves."
    },
    lifecycle: [
      { stage: "Egg", duration: "4-6 days", location: "Inside leaf tissue" },
      { stage: "Larva (2 instars)", duration: "5-8 days", location: "Leaf surface" },
      { stage: "Prepupa/Pupa", duration: "3-5 days", location: "Soil or leaf fold" },
      { stage: "Adult", duration: "15-25 days", location: "Leaf surface/flower" }
    ],
    totalLifecycleDays: { min: 27, max: 44 },
    seasonalPeak: ["March-May (hot dry season)", "October-November (Rabi onion)"],
    damageType: "Rasping-sucking, silver stippling + TSWV/IYSV virus vector",
    yieldLoss: "20-50% in onion/garlic; complete loss in IYSV-epidemic years",
    ETL: "50 thrips per plant or 5 adults per flower; 2-4 thrips per leaf in seedlings",
    monitoring: "Blue sticky traps (more attractive to thrips than yellow); count per leaf",
    IPMStrategy: {
      cultural: [
        "Avoid planting consecutive onion/garlic cycles without break crop",
        "Reflective mulch (silver plastic) deters thrips landing",
        "NFT greenhouse ventilation to reduce thrips",
        "Remove TSWV/IYSV symptomatic plants"
      ],
      biological: [
        "Predatory mites (Amblyseius cucumeris) @ 50-100 mites/m²",
        "Orius spp. predatory bug",
        "Beauveria bassiana @ 5×10⁸ cfu/ml spray at high humidity"
      ],
      chemical: [
        { pesticide: "Spinosad", dose: "0.3 ml/L", formulation: "45% SC diluted", timing: "At first adult detection, 5-7 day interval" },
        { pesticide: "Fipronil", dose: "1.5 ml/L", formulation: "5% SC", timing: "At high population — penetrates thrips hiding in leaf folds" },
        { pesticide: "Imidacloprid", dose: "0.5 ml/L", formulation: "17.8% SL", timing: "Seedling drench before transplanting" },
        { pesticide: "Dimethoate", dose: "2 ml/L", formulation: "30% EC", timing: "At ETL; cheap broad-spectrum option" }
      ]
    },
    resistance: "High resistance to pyrethroid, organophosphate. Spinosad resistance developing. Use rotation: spinosyns → diamides → phenylpyrazoles.",
    quarantineStatus: "None"
  },
  {
    id: "pest_010",
    name: "Red Mite / Spider Mite",
    localName: "Lal Ghun / Makkdi",
    scientificName: "Tetranychus urticae (Koch); Tetranychus truncatus Ehara",
    order: "Acari",
    family: "Tetranychidae",
    category: "mite",
    affectedCrops: ["Cotton", "Tomato", "Cucumber", "Soybean", "Maize", "Okra", "Groundnut"],
    lifeStage: ["egg", "larva", "nymph", "adult"],
    description: "Two-spotted spider mite is a key secondary pest that erupts after broad-spectrum organophosphate/pyrethroid sprays kill natural enemies. Hot, dry windy conditions favor outbreaks.",
    identification: {
      egg: "Spherical, translucent, 0.1mm on silk webbing underside leaf",
      adult: "Oval, 0.3-0.5mm, greenish/yellow-green to red/brown. 2 dark spots on sides. Barely visible to naked eye.",
      damage: "Fine stippling/speckling (white dots) on upper leaf surface; bronze/grey discoloration. Dense webbing under leaves at severe stage. Premature defoliation."
    },
    lifecycle: [
      { stage: "Egg", duration: "3-5 days at 30°C", location: "Leaf underside in silk webbing" },
      { stage: "Larva (6 legs)", duration: "1-2 days", location: "Leaf underside" },
      { stage: "Protonymph + Deutonymph", duration: "4-7 days", location: "Leaf surface" },
      { stage: "Adult", duration: "14-30 days", location: "Leaf underside, webbing" }
    ],
    totalLifecycleDays: { min: 22, max: 44 },
    seasonalPeak: ["May-June (peak dry)", "August-October (second flush after monsoon)"],
    damageType: "Cell content sucking, chloroplast disruption — bronze/silver appearance",
    yieldLoss: "10-30% in cotton, 20-40% in cucurbits under severe attack",
    ETL: "5-8 mites per leaf; first webbing visible",
    monitoring: "Shake leaf over white paper to dislodge mites; hand lens examination of 10 leaves",
    IPMStrategy: {
      cultural: [
        "Dusty field conditions promote mites — spray water to wash off dust from plants",
        "Avoid stress (drought, nitrogen excess)",
        "Overhead irrigation reduces mite populations",
        "Avoid chlorpyrifos/pyrethroids (kill predatory mites → outbreak)"
      ],
      biological: [
        "Phytoseiid predatory mites: Amblyseius womersleyi, Neoseiulus californicus @ 10-15/plant",
        "Stethorus punctillum predatory beetle",
        "Predatory midge: Feltiella acarisuga"
      ],
      chemical: [
        { pesticide: "Abamectin", dose: "0.3 ml/L", formulation: "1.9% EC", timing: "At first sign of bronze discoloration" },
        { pesticide: "Spiromesifen", dose: "0.5 ml/L", formulation: "22.9% SC", timing: "Acts on eggs + nymphs — best during population build-up" },
        { pesticide: "Fenpyroximate", dose: "1 ml/L", formulation: "5% EC", timing: "Quick knockdown of active mites" },
        { pesticide: "Etoxazole", dose: "0.5 ml/L", formulation: "10% SC", timing: "Acts on eggs/larvae — use before peak" }
      ]
    },
    resistance: "HIGH multi-class resistance. Never use same miticide more than twice consecutively. Mandatory rotation between mode-of-action groups (IRAC groups 6, 10, 13, 25).",
    quarantineStatus: "None"
  },

  // =================== VEGETABLE PESTS ===================
  {
    id: "pest_011",
    name: "Diamondback Moth",
    localName: "Haira Sundi",
    scientificName: "Plutella xylostella (Linnaeus)",
    order: "Lepidoptera",
    family: "Plutellidae",
    category: "insect",
    affectedCrops: ["Cabbage", "Cauliflower", "Mustard", "Radish", "Turnip", "Broccoli"],
    lifeStage: ["egg", "larva", "pupa", "adult"],
    description: "World's most pesticide-resistant pest. Resistant to 94 active ingredients globally. Larvae mine leaves, cause 'windowpaning'. Critically important in cabbage-family crops.",
    identification: {
      egg: "Oval, flat, 0.5mm, pale yellow, singly on underside of leaves",
      larva: "Pale green, 10-12mm, tapered ends, characteristic S-wriggling when disturbed, fall on silk thread",
      adult: "Grey-brown, 8-10mm, 3 diamond shapes on folded wing. Male: 3 white diamond marks on back.",
      damage: "Larvae mine epidermis (1st instar), create windows eating all but one epidermal layer (3rd-4th instar). Windowpaned cabbage head unmarketable."
    },
    lifecycle: [
      { stage: "Egg", duration: "3-5 days", location: "Leaf underside near veins" },
      { stage: "Larva (4 instars)", duration: "8-14 days", location: "Leaf tissue and surface" },
      { stage: "Cocoon/Pupa", duration: "5-8 days", location: "Leaf surface in lacy silk cocoon" },
      { stage: "Adult", duration: "10-20 days", location: "Plant canopy, nocturnal" }
    ],
    totalLifecycleDays: { min: 26, max: 47 },
    seasonalPeak: ["October-March (cool dry Rabi)", "Year-round in hills"],
    damageType: "Leaf mining, windowpaning, defoliation",
    yieldLoss: "15-30% in commercial cabbage, total loss of crop without management",
    ETL: "2 larvae per plant; 50% plants infested",
    monitoring: "Pheromone traps (DBM-specific lure) 1-2/acre",
    IPMStrategy: {
      cultural: [
        "Mustard as trap crop in ratio 1:25",
        "Eruca sativa (rocket) as trap crop — more attractive",
        "Intercrop with tomato or coriander",
        "Net houses for nursery",
        "Non-crucifer crop rotation for at least one season"
      ],
      biological: [
        "Cotesia plutellae (Braconid wasp) — most effective biocontrol agent",
        "Bacillus thuringiensis kurstaki @ 2-3 kg/ha alternated with chemicals",
        "DBM-specific NPV @ 250 LE/ha",
        "Predatory bugs (Podisus maculiventris)"
      ],
      chemical: [
        { pesticide: "Emamectin benzoate", dose: "0.4 g/L", formulation: "5% SG", timing: "Best for resistance management, 7-10 day interval" },
        { pesticide: "Chlorfenapyr", dose: "1 ml/L", formulation: "10% SC", timing: "When DBM is resistant to other groups — novel mode of action" },
        { pesticide: "Chlorantraniliprole", dose: "0.4 ml/L", formulation: "18.5% SC", timing: "At 1st-2nd instar, best for controlled release" },
        { pesticide: "Indoxacarb", dose: "0.5 ml/L", formulation: "14.5% SC", timing: "At headband formation stage" }
      ]
    },
    resistance: "Classic example of extreme pesticide resistance; sequence chemistry to delay resistance",
    quarantineStatus: "None"
  },
  {
    id: "pest_012",
    name: "Fruit Fly (Oriental Fruit Fly)",
    localName: "Phal Makhi",
    scientificName: "Bactrocera dorsalis (Hendel)",
    order: "Diptera",
    family: "Tephritidae",
    category: "insect",
    affectedCrops: ["Mango", "Guava", "Papaya", "Peach", "Citrus", "Capsicum", "Tomato", "Melon"],
    lifeStage: ["egg", "larva", "pupa", "adult"],
    description: "The single most important quarantine pest for exported fruits from India. Females insert eggs under fruit skin; larvae cause internal rotting. One female lays 1200-1500 eggs total.",
    identification: {
      egg: "Creamy white, banana-shaped, 1mm, laid in clusters under fruit skin",
      larva: "Yellowish-white maggot, 1-10mm, wedge-shaped, legless",
      adult: "12-15mm, mostly dark brown with yellow markings, single T-shaped dark spot on abdomen",
      damage: "External sting marks, internal soft/rotting pulp infested with maggots. Premature fruit drop."
    },
    lifecycle: [
      { stage: "Egg", duration: "1-2 days", location: "Inside fruit flesh, just under skin" },
      { stage: "Larva (3 instars)", duration: "8-12 days", location: "Inside fruit" },
      { stage: "Pupa", duration: "8-12 days", location: "Soil under tree, 2-5cm deep" },
      { stage: "Adult (pre-reproductive)", duration: "7-10 days", location: "Host plant canopy" }
    ],
    totalLifecycleDays: { min: 24, max: 36 },
    seasonalPeak: ["March-June", "September-November (post-monsoon)"],
    damageType: "Oviposition + larval feeding causes fruit decay and drop",
    yieldLoss: "50-90% in guava, papaya, peach. Serious export rejection issue.",
    ETL: "2-3 adults per trap per day (MAT pheromone trap) or first sting detection",
    monitoring: "Cue-lure (parapheromoone for males) traps 5-6/acre at 2m height",
    IPMStrategy: {
      cultural: [
        "Bag fruits with paper/plastic bags at marble-size stage",
        "Collect and destroy fallen fruits daily",
        "Deep ploughing to expose pupae",
        "Keep orchard clean",
        "Post-harvest heat treatment (48°C/60 min) for export"
      ],
      biological: [
        "Fopius arisanus egg parasitoid (NBAII, Bengaluru release programme)",
        "Diachasmimorpha longicaudata larval parasitoid"
      ],
      chemical: [
        { pesticide: "MAT (Male Annihilation Technique)", dose: "Methyl Eugenol + Malathion bait, 1-2 blocks/tree", formulation: "Cue-lure pheromone mat", timing: "During pre-fruiting period, replace every 4-6 weeks" },
        { pesticide: "Spinosad bait (GF-120)", dose: "60-100 ml diluted in 2L water bait spray", formulation: "0.024% protein bait", timing: "Weekly spot sprays on leaf underside (not on fruit)" },
        { pesticide: "Dimethoate", dose: "1.5 ml/L + protein hydrolysate bait", formulation: "30% EC bait spray", timing: "Before population peak; spot spray only" }
      ]
    },
    resistance: "Spinosad resistance developing in high-pressure areas; use rotation",
    quarantineStatus: "A2"
  },

  // =================== STORED GRAIN PESTS ===================
  {
    id: "pest_013",
    name: "Wheat Weevil / Grain Weevil",
    localName: "Ghun / Sund",
    scientificName: "Sitophilus granarius (L.); S. oryzae (L.)",
    order: "Coleoptera",
    family: "Curculionidae",
    category: "insect",
    affectedCrops: ["Wheat (stored)", "Rice", "Sorghum", "Barley", "Rye"],
    lifeStage: ["egg", "larva", "pupa", "adult"],
    description: "Primary stored grain pest found in whole undamaged grain. Female hollows grain, lays single egg, seals with waxy plug. Larvae develop inside — grain appears intact but empty.",
    identification: {
      egg: "White oval inside grain cavity, sealed with waxy material",
      larva: "White legless grub inside grain, 3-5 stages",
      adult: "Dark reddish-brown 2.5-3.5mm, long snout (typical weevil), dark patches on thorax + elytra",
      damage: "Hollowed grains, floured grain powder, musty smell, elevated grain temperature. Weight loss up to 10-15% per year."
    },
    lifecycle: [
      { stage: "Egg", duration: "3-5 days (25°C)", location: "Inside grain cavity" },
      { stage: "Larva (4 instars)", duration: "18-25 days", location: "Inside grain" },
      { stage: "Pupa", duration: "6-8 days", location: "Inside grain" },
      { stage: "Adult", duration: "3-6 months", location: "In grain mass" }
    ],
    totalLifecycleDays: { min: 27, max: 38 },
    seasonalPeak: ["Year-round in storage", "Peak in summer storage (>25°C, >12% moisture)"],
    damageType: "Internal grain feeding — complete grain destruction",
    yieldLoss: "5-20% in domestic; up to 25% in tropical storage",
    ETL: "1 weevil per kg grain",
    monitoring: "Probe or cone trap in grain mass; count per kg",
    IPMStrategy: {
      cultural: [
        "Dry grain below 12% moisture — most important prevention",
        "Clean store thoroughly before filling",
        "Use airtight metal bins (Pusa improved bin)",
        "Separate old grain from new"
      ],
      biological: ["Pseudoscorpions (Chelifer cancroides) — natural predators in traditional storage", "Ichneumonid wasp (Theocolax elegans)"],
      chemical: [
        { pesticide: "Aluminium Phosphide (Celphos)", dose: "2-3 tablets per tonne in sealed storage", formulation: "56% tablet (3g PH3)", timing: "Seal for 5 days; dangerous — trained use only" },
        { pesticide: "Deltamethrin", dose: "1 kg deltamethrin powder per 100 kg grain", formulation: "2.5% ready-to-use dust", timing: "Mix at storage for short-term protection" },
        { pesticide: "Pyrethrin + piperonyl butoxide", dose: "2 g/m² surface spray", formulation: "0.5% grain spray", timing: "Spray on grain bin walls before filling" }
      ]
    },
    resistance: "Low — fumigation rotations not being used widely yet; maintain vigilance",
    quarantineStatus: "None"
  },
];

// ===================== HELPER FUNCTIONS =====================

export const getPestsByCrop = (crop: string): PestProfile[] =>
  pestProfiles.filter(p => p.affectedCrops.some(c => c.toLowerCase().includes(crop.toLowerCase())));

export const getPestsByCategory = (category: string): PestProfile[] =>
  pestProfiles.filter(p => p.category === category);

export const getQuarantinePests = (): PestProfile[] =>
  pestProfiles.filter(p => p.quarantineStatus !== "None");

export const searchPests = (query: string): PestProfile[] => {
  const q = query.toLowerCase();
  return pestProfiles.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.localName.toLowerCase().includes(q) ||
    p.scientificName.toLowerCase().includes(q) ||
    p.damageType.toLowerCase().includes(q)
  );
};

export const getPestByID = (id: string): PestProfile | undefined =>
  pestProfiles.find(p => p.id === id);

export const getHighDamagePests = (): PestProfile[] =>
  pestProfiles.filter(p => {
    const yieldLossPct = parseInt(p.yieldLoss.replace(/[^0-9]/g, ""));
    return yieldLossPct >= 30;
  });
