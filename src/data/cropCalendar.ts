// Crop Calendar Dataset
// Sources: ICAR-CRIDA AICRPAM Bulletin (District-Level Weather Calendars),
// ICAR Annual Report, DES (Directorate of Economics & Statistics) crop schedules,
// State Agriculture Departments, FAO GAEZ India crop calendars (2023)

import { createDatasetMetadata } from "./datasetMetadata";

export interface CropActivity {
  week: number;           // Week number in crop calendar (1-52)
  month: string;
  activity: string;
  category: "field_prep" | "sowing" | "irrigate" | "fertilize" | "spray" | "harvest" | "storage" | "monitoring";
  details: string;
  weatherCondition?: string;
  weather_alert?: string;
}

export interface CropCalendarEntry {
  id: string;
  crop: string;
  cropHindi: string;
  season: "Kharif" | "Rabi" | "Zaid" | "Annual";
  zone: string;          // AICRPAM agro-climatic zone
  states: string[];
  soilType: string;
  varietyClass: string;
  duration: string;      // crop duration in days
  sowingWindow: { start: string; end: string; optimal: string };
  harvestWindow: { start: string; end: string };
  totalRainfallReq: string;
  irrigationCount: number;
  keyActivities: CropActivity[];
  criticalWeatherStages: {
    stage: string;
    das: string;
    criticalWeather: string;
    impact: string;
    advisory: string;
  }[];
  yieldPotential: string;
  notes: string;
}

export const cropCalendarMetadata = createDatasetMetadata({
  version: "1.0.0",
  lastUpdated: "2024-10-20T00:00:00Z",
  source: "ICAR-CRIDA, DES, State Agri Depts, FAO GAEZ",
  notes: "District-level calendar guidance with critical stage advisories.",
});

// AICRPAM Zone definitions (ICAR-CRIDA):
// Zone I   = Western Himalayan Region (J&K, HP, Uttarakhand)
// Zone II  = Eastern Himalayan Region (Assam, NE states, Darjeeling, Sikkim)
// Zone III = Lower Gangetic Plain (West Bengal, Bihar lower)
// Zone IV  = Middle Gangetic Plain (UP, Bihar)
// Zone V   = Upper Gangetic Plain (UP, Haryana, Punjab, Uttarakhand plains)
// Zone VI  = Trans-Gangetic Plains (Punjab, Haryana, NW Rajasthan)
// Zone VII = Eastern Plateau & Hills (Jharkhand, Odisha, MP, Chhattisgarh)
// Zone VIII= Central Plateau & Hills (MP, Rajasthan south)
// Zone IX  = Western Plateau & Hills (Maharashtra, NW Karnataka)
// Zone X   = Southern Plateau & Hills (Karnataka, AP, Telangana)
// Zone XI  = East Coast Plains & Hills (Odisha coast, AP, TN north)
// Zone XII = West Coast Plains & Ghats (Kerala, coastal Karnataka, Goa)
// Zone XIII= Gujarat Plains & Hills
// Zone XIV = Western Dry Region (W Rajasthan, N Gujarat)
// Zone XV  = Islands (A&N, Lakshadweep)

export const cropCalendarData: CropCalendarEntry[] = [
  // ===================== WHEAT - ZONE V/VI (Northwest India) =====================
  {
    id: "cal_wheat_NW",
    crop: "Wheat",
    cropHindi: "गेहूं",
    season: "Rabi",
    zone: "Zone V & VI - Trans & Upper Gangetic Plains",
    states: ["Punjab", "Haryana", "Uttar Pradesh (W)", "Rajasthan (N)"],
    soilType: "Well-drained alluvial / loam",
    varietyClass: "Timely sown (HD 3086, PBW 826, DBW 303); Late sown (HD 3059, PBW 752)",
    duration: "120-145 days (timely); 100-120 days (late)",
    sowingWindow: { start: "November 1", end: "December 15", optimal: "November 10-20" },
    harvestWindow: { start: "April 1", end: "April 30" },
    totalRainfallReq: "350-450 mm (most from irrigation)",
    irrigationCount: 5,
    keyActivities: [
      { week: 43, month: "October",  activity: "Field preparation",    category: "field_prep", details: "Deep summer ploughing or disc harrowing after Kharif. Apply FYM 6-8 t/ha if not applied in Kharif. Level field for uniform irrigation." },
      { week: 44, month: "November", activity: "Soil test & seeds",    category: "field_prep", details: "Test soil for pH, NPK, Zn. Procure certified seed. Seed treatment: Bavistin 2g/kg + Thiram 1.5g/kg" },
      { week: 45, month: "November", activity: "Basal fertilizer",     category: "fertilize",  details: "Apply DAP 130 kg/ha (P+N) + MOP 67 kg/ha + ZnSO4 25 kg/ha. Mix in soil during final harrowing.", weather_alert: "Avoid if soil is too dry – irrigate pre-sowing if rainfall < 100mm in October" },
      { week: 45, month: "November", activity: "Sowing",               category: "sowing",     details: "Seed rate 100 kg/ha, row spacing 22.5 cm, depth 5-6 cm. Seed drill preferred. Ensure good soil–seed contact.", weatherCondition: "Ideal: 15-20°C, dry weather, no rain forecast for 2-3 days after" },
      { week: 48, month: "December", activity: "CRI Irrigation (1st)", category: "irrigate",   details: "21-25 DAS. MOST CRITICAL irrigation. Light irrigation 60-70 mm. Prevents crown root desiccation. Do not delay.", weather_alert: "If fog/frost forecast — delay by 1-2 days; irrigate in afternoon, not morning" },
      { week: 48, month: "December", activity: "1st Top dress Urea",   category: "fertilize",  details: "Apply Urea 87 kg/ha (= 40 kg N) after 1st irrigation — do not apply to dry soil. Use LCC-6+ for timing." },
      { week: 1,  month: "January",  activity: "Weed scouting",        category: "monitoring", details: "Check for Phalaris minor (gulli danda) & broadleaf weeds. If >10 weeds/m², plan herbicide spray." },
      { week: 2,  month: "January",  activity: "Herbicide spray",       category: "spray",      details: "Clodinafop 400g/ha (Phalaris) or 2,4-D Amine 2L/ha (broadleaf) at 30-35 DAS. Do not irrigate 48h before/after spray." },
      { week: 3,  month: "January",  activity: "Tillering irrigation (2nd)", category: "irrigate", details: "40-45 DAS, 60-70 mm. Supports maximum tiller survival. Apply 2nd Urea dose (40 kg N) with this water." },
      { week: 5,  month: "February", activity: "Jointing irrigation (3rd)",  category: "irrigate", details: "60-65 DAS, 70-80 mm. Stem elongation stage. Inspect for aphids (ETL: 10/ear)", weather_alert: "If pre-flowering frost forecast — light irrigation to moderate frost impact" },
      { week: 6,  month: "February", activity: "Aphid monitoring",     category: "monitoring", details: "scout 10 random sites for aphid count per tiller. Spray dimethoate 30% EC @ 1.5 ml/L if ETL crossed." },
      { week: 8,  month: "February", activity: "Flowering irrigation (4th)", category: "irrigate", details: "80-85 DAS, 70 mm. Critical for grain number establishment. Avoid during rainfall or heavy fog.", weatherCondition: "Avoid sprinkler during dry hot wind (loo). Prefer furrow irrigation." },
      { week: 9,  month: "March",    activity: "Yellow/brown rust check", category: "monitoring", details: "Inspect for stripe rust (yellow pustules in rows) or brown rust. Spray Propiconazole 25% EC @ 1 ml/L if found." },
      { week: 10, month: "March",    activity: "Milking irrigation (5th)",   category: "irrigate", details: "95-100 DAS, 70 mm. Grain filling support. FINAL irrigation. Do not irrigate after this stage." },
      { week: 12, month: "March",    activity: "Harvest monitoring",    category: "monitoring", details: "128-140 DAS: Grain moisture 20-25% → combine-ready at 14%. Plan combine booking 2 weeks ahead.", weather_alert: "Monitor for thunderstorm/hailstorm in April — harvest early if risk detected" },
      { week: 14, month: "April",    activity: "Combine harvest",       category: "harvest",    details: "Harvest when grain moisture 12-14%. Avoid early morning harvest (dew). Set combine loss < 1%." },
      { week: 15, month: "April",    activity: "Grain storage",         category: "storage",    details: "Sun-dry if >14% moisture. Apply deltamethrin dust 2.5% @ 40g/quintal. Store in dry, airtight bins." }
    ],
    criticalWeatherStages: [
      { stage: "Sowing", das: "0", criticalWeather: "Soil temperature < 12°C or > 25°C", impact: "Poor germination, uneven crop establishment", advisory: "Delay sowing if soil temp <12°C; sow in time window Nov 10-20 for best results" },
      { stage: "Crown Root Initiation", das: "21-25", criticalWeather: "Frost (< 0°C)", impact: "Crown damage, mass plant death", advisory: "Give light irrigation before predicted frost; creates aerated layer that moderates temperature" },
      { stage: "Flowering/Anthesis", das: "80-90", criticalWeather: "Temperature > 34°C (heat wave) or hailstorm", impact: "Pollen sterility, grain setting failure if > 35°C for 3+ days", advisory: "Irrigate immediately; spray KCl 0.5% + Thiourea 500 ppm; harvest 7 days earlier if terminal heat forecast" },
      { stage: "Grain Filling", das: "95-120", criticalWeather: "Hot dry wind (loo), temp > 38°C", impact: "Shrivelled grain, low test weight", advisory: "Final irrigation at milking stage; heavy plant feeding with K; accelerated harvest if heat continues" },
    ],
    yieldPotential: "5-6 t/ha (timely, irrigated, HYV); 2.5-3.5 t/ha (late sown)",
    notes: "Punjab + Haryana account for 55% of India's wheat procurement. Zero-till sowing saves 3,000-4,000 L water and reduces residue burning.",
  },

  // ===================== RICE (PADDY) - ZONE IV (Eastern India) =====================
  {
    id: "cal_rice_eastern",
    crop: "Rice (Paddy)",
    cropHindi: "धान",
    season: "Kharif",
    zone: "Zone III & IV - Middle/Lower Gangetic Plain",
    states: ["West Bengal", "Bihar", "Uttar Pradesh (E)", "Odisha (N)"],
    soilType: "Alluvial; heavy clay for lowland rice",
    varietyClass: "Medium duration (Swarna, MTU-1010, Rajendra Bhagwati); Short duration (Pant Dhan 14)",
    duration: "130-150 days (medium), 100-110 days (short)",
    sowingWindow: { start: "May 15 (nursery)", end: "July 10", optimal: "June 1-15" },
    harvestWindow: { start: "October 15", end: "December 15" },
    totalRainfallReq: "1200-1400 mm (800mm min)",
    irrigationCount: 3,  // supplemental; mostly rainfed
    keyActivities: [
      { week: 20, month: "May",      activity: "Nursery preparation",  category: "field_prep", details: "Wet nursery: level 500 m² for 1 ha. Apply FYM 2 kg/m². Seed rate 30-35 kg/ha. Soak seeds 24h, drain 24h for sprouting." },
      { week: 20, month: "May",      activity: "Seed treatment",        category: "field_prep", details: "Treat with Carbendazim 2g/kg + Thiram 1g/kg for blast + damping-off. Bavistin 50% WP @ 2g/kg." },
      { week: 21, month: "May",      activity: "Nursery sowing",        category: "sowing",     details: "Broadcast sprouted seeds in prepared nursery beds. Apply urea @ 2g/m² at 7 DAP for seedling vigour.", weatherCondition: "Ideal: 28-32°C; avoid raising nursery under early monsoon heavy rain (seedling lodging)" },
      { week: 24, month: "June",     activity: "Land preparation",      category: "field_prep", details: "Plough 2-3 times. Puddle standing water 10-15cm for 3-4 days. Level with land leveller. Apply pressmud/compost if available." },
      { week: 25, month: "June",     activity: "Basal fertilizer",      category: "fertilize",  details: "Full DAP 130 kg/ha + MOP 67 kg/ha + ZnSO4 25 kg/ha. Mix in puddled soil before transplanting." },
      { week: 26, month: "June",     activity: "Transplanting",         category: "sowing",     details: "25-30 day old seedlings, 2-3 per hill at 20×15 cm. Maintain 5cm standing water.", weatherCondition: "Ideal monsoon onset: June 20 - July 10. Avoid transplanting at peak of heat wave." },
      { week: 28, month: "July",     activity: "1st Urea top-dress",    category: "fertilize",  details: "21 DAT, Urea 87 kg/ha. Drain water 2 days before application; reflood after 2 days. Use LCC-4 leaf colour code." },
      { week: 29, month: "July",     activity: "Weed management",       category: "spray",      details: "Butachlor 50% EC @ 2.5 L/ha at 3-5 DAT (pre-emergence) OR hand weed at 25 DAT. Maintain standing water during herbicide." },
      { week: 30, month: "July",     activity: "BPH monitoring",        category: "monitoring", details: "Check base of plants underwater for brown/grey hoppers. ETL: 1 adult/hill at tillering. Spray if crossed." },
      { week: 32, month: "August",   activity: "2nd Urea top-dress",    category: "fertilize",  details: "At panicle initiation (PI), 45-55 DAT — Urea 87 kg/ha. Critical for grain number. Use LCC-4." },
      { week: 34, month: "August",   activity: "Blast surveillance",    category: "monitoring", details: "Check leaves for blast (grey spindle lesions). If found, spray Tricyclazole 75% WP @ 0.6g/L immediately." },
      { week: 36, month: "September",activity: "Heading/Flowering",     category: "monitoring", details: "Maintain 2-3cm water at flowering. Check for bacterial blight (yellow margins) and neck blast (grey infected neck node)." },
      { week: 40, month: "October",  activity: "Grain maturity check",  category: "monitoring", details: "Drain field 10-15 days before harvest when 80% grains are golden. Avoid late draining (shattering)." },
      { week: 42, month: "October",  activity: "Harvest",               category: "harvest",    details: "Harvest at 20-22% moisture for combine, 26% for manual. Harvesting takes 3-5 days/ha." },
      { week: 43, month: "November", activity: "Threshing & drying",    category: "storage",    details: "Thresh within 24h of harvest to prevent stack heating. Sun-dry to 14% moisture for storage." }
    ],
    criticalWeatherStages: [
      { stage: "Nursery", das: "0-25", criticalWeather: "Early monsoon excess rain (>50mm/day)", impact: "Nursery flooding, seedling rot", advisory: "Raise slightly elevated nursery beds; pre-emergent drainage channels" },
      { stage: "Tillering", das: "21-45", criticalWeather: "Drought — no monsoon rain for 7+ days", impact: "Tiller death, root aeration crisis", advisory: "Supplemental irrigation from pump/tube well; 5 cm water depth maintenance" },
      { stage: "Panicle Initiation", das: "50-55", criticalWeather: "Temperature < 20°C for 3+ days (spikelet sterility)", impact: "Cold-induced sterility, poor panicle fill", advisory: "Increase water level to 15-20 cm to moderate low temperatures" },
      { stage: "Flowering", das: "75-90", criticalWeather: "Heavy rain + high humidity (>90% RH for 3 days)", impact: "Neck blast, BLB, sheath rot epidemic", advisory: "Spray propiconazole 25% EC @ 1 ml/L preventively at heading" },
    ],
    yieldPotential: "4.5-5.5 t/ha (transplanted HYV, Kharif irrigated); 2.5-3.5 t/ha rainfed",
    notes: "West Bengal: 14.5 Mt; UP: 16 Mt; Odisha adopts AWD (Alternate Wetting Drying) saving 25-30% water.",
  },

  // ===================== COTTON - ZONE IX (Maharashtra/Gujarat) =====================
  {
    id: "cal_cotton_central",
    crop: "Cotton",
    cropHindi: "कपास",
    season: "Kharif",
    zone: "Zone IX & XIII - Western Plateau & Gujarat Plains",
    states: ["Maharashtra", "Gujarat", "Madhya Pradesh"],
    soilType: "Black cotton soil (Vertisol) / Medium deep black",
    varietyClass: "Bt cotton hybrid (Bollgard II: Brahma, Turab, Ankur, Rahul); 150-200 day duration",
    duration: "165-200 days (full season)",
    sowingWindow: { start: "May 20", end: "June 30", optimal: "June 1-15" },
    harvestWindow: { start: "October 20", end: "February 10" },
    totalRainfallReq: "700-1200 mm (500mm minimum for rainfed)",
    irrigationCount: 4,
    keyActivities: [
      { week: 18, month: "May",      activity: "Summer ploughing",      category: "field_prep", details: "Deep plough (30-35 cm) in April-May. Solar sterilization of pests/pathogens. Incorporate crop residues.", weatherCondition: "Ideal: dry, >40°C for sterilisation effect on termite mounds" },
      { week: 21, month: "May",      activity: "Seed procurement",      category: "field_prep", details: "Use certified Bt hybrid seed. Check tag colours: Yellow = GM certified. Avoid spurious seed." },
      { week: 23, month: "June",     activity: "Pre-sowing irrigation", category: "irrigate",   details: "Apply 60-80 mm irrigation if rainfall < 50 mm by June 10. Ensures uniform germination on black soil." },
      { week: 23, month: "June",     activity: "Sowing",                category: "sowing",     details: "Row spacing 120×60 cm (H = main crop). Or 150×60 cm for tall hybrids. Seed rate 2.5 kg/ha. Depth 3-5 cm.", weatherCondition: "Sow 1-2 days after rainfall — black soil tillage window very narrow (sticky when wet, hard when dry)" },
      { week: 23, month: "June",     activity: "Basal fertilizer",      category: "fertilize",  details: "DAP 130 kg/ha + MOP 100 kg/ha + ZnSO4 25 kg/ha + Borax 5 kg/ha. Apply in furrow at sowing." },
      { week: 26, month: "June",     activity: "Thinning & gap filling", category: "field_prep", details: "At 15-20 DAS: thin to 1 plant/hill; gap fill with same hybrid. Earthing up for root support." },
      { week: 29, month: "July",     activity: "1st N top-dress",       category: "fertilize",  details: "30-35 DAS at squaring. Urea 65 kg/ha + MOP 50 kg/ha. Apply near plants, small earthing up." },
      { week: 29, month: "July",     activity: "Whitefly monitoring",   category: "monitoring", details: "Count adult whiteflies per leaf on 10 random plants. ETL: 10 adults/leaf. Install yellow sticky traps." },
      { week: 31, month: "August",   activity: "Pheromone trap setup",  category: "monitoring", details: "Install Helicoverpa pheromone (Helilure) traps 5/ha + Pink bollworm traps 5/ha. Check counts every 2-3 days." },
      { week: 33, month: "August",   activity: "2nd Irrigation",        category: "irrigate",   details: "If dry spell >15 days during boll development. 60-80mm critical. Do not stress at this stage — boll abortion." },
      { week: 33, month: "August",   activity: "Bollworm management",   category: "spray",      details: "If >1 larva/plant or >5 eggs/trap/night: Spray emamectin benzoate 5% SG @ 0.4g/L or Chlorantraniliprole 18.5% SC @ 0.4ml/L" },
      { week: 35, month: "September",activity: "2nd N top-dress",       category: "fertilize",  details: "65-75 DAS at boll formation. Urea 65 kg/ha. Last nitrogen application." },
      { week: 38, month: "September",activity: "Pink bollworm traps",   category: "monitoring", details: "Shift from Helicoverpa to PBW pheromone traps. PBW peak: September-October. ETL:  8 moths/trap/night." },
      { week: 40, month: "October",  activity: "Picking 1st",           category: "harvest",    details: "First picking of fully open bolls. Do not delay — rain causes staining. 8-10 pickings over season." },
      { week: 46, month: "November", activity: "Picking 2nd-4th",       category: "harvest",    details: "Manual picking every 20-25 days. Protect from boll rot. Late bolls require morning-only picking (dew)" },
      { week: 3,  month: "January",  activity: "Close Season compliance",category: "field_prep", details: "CRITICAL: By April 1 — destroy ALL green/dry bolls to break PBW cycle. Legal obligation in Punjab/Haryana/Gujarat." },
    ],
    criticalWeatherStages: [
      { stage: "Germination", das: "0-15", criticalWeather: "Excess rain on black soil causing waterlogging", impact: "Seedling death, damping off, salt accumulation", advisory: "Make broad beds with furrows (BBF system) for drainage" },
      { stage: "Squaring", das: "40-60", criticalWeather: "High humidity >80% RH for 7+ days", impact: "Whitefly/mite outbreaks, Grey mildew, leaf curl virus", advisory: "Preferential fungicide spray + anti-infective measures" },
      { stage: "Boll Development", das: "80-130", criticalWeather: "Drought (no rain for 20+ days)", impact: "Boll abortion, reduced lint yield", advisory: "Irrigate immediately; conserve soil moisture by inter-row cultivation" },
      { stage: "Boll Opening", das: "140-165", criticalWeather: "Unseasonal rain in October-November", impact: "Cotton fibre staining, reduced grade", advisory: "Accelerate picking, use polyethylene sheet covers for picked cotton" },
    ],
    yieldPotential: "20-25 quintals kapas/ha (desi varieties); 25-35 quintals/ha (Bt hybrids, irrigated)",
    notes: "Maharashtra: largest cotton growing state (4.2 Mha). Vidarbha region: 95% Bt adoption. Note: close season (April 1-May 31) mandatory in Gujarat, Haryana, Punjab.",
  },

  // ===================== MAIZE - ZONE IV (UP/Bihar Kharif) =====================
  {
    id: "cal_maize_kharif",
    crop: "Maize",
    cropHindi: "मक्का",
    season: "Kharif",
    zone: "Zone IV & V - Middle Gangetic Plain to Upper Gangetic Plain",
    states: ["Bihar", "Uttar Pradesh (E)", "Jharkhand", "West Bengal (N)"],
    soilType: "Alluvial sandy loam / loam (well-drained)",
    varietyClass: "Single-cross hybrids: DKC 9144, P3401, Vivek QPM 9 (Quality Protein), Shaktiman 1-4",
    duration: "80-95 days (Kharif single-cross hybrids)",
    sowingWindow: { start: "June 15", end: "July 15", optimal: "June 20 - July 5" },
    harvestWindow: { start: "October 1", end: "October 31" },
    totalRainfallReq: "500-700 mm",
    irrigationCount: 2,
    keyActivities: [
      { week: 24, month: "June",     activity: "Land preparation",      category: "field_prep", details: "2-3 ploughings + 1 harrowing + planking. Maize needs level, well-drained field. Avoid waterlogging zones." },
      { week: 25, month: "June",     activity: "Seed + Basal",          category: "sowing",     details: "Seed rate 18-20 kg/ha for single-cross hybrids, spacing 60×20 cm. Treat seed with Thiram 2g/kg. Apply DAP 130 kg/ha + MOP 83 kg/ha + ZnSO4 25 kg/ha as basal.", weatherCondition: "Sow immediately after 50mm monsoon rain for rainfed; for irrigated sow then irrigate." },
      { week: 27, month: "July",     activity: "Gap filling & thinning", category: "field_prep", details: "7-10 DAS: thin to 1 plant/hill; fill gaps within first week using treated spare seeds." },
      { week: 28, month: "July",     activity: "1st N top-dress + irrigation", category: "fertilize", details: "V4-V5 (knee-high, 25 DAS): Side-dress Urea 87 kg/ha. Irrigate if no rain for 7 days." },
      { week: 28, month: "July",     activity: "FAW monitoring",        category: "monitoring", details: "Check whorl for fall armyworm frass. Count damaged plants. ETL: 5% damaged whorls. Act early with emamectin." },
      { week: 30, month: "July",     activity: "Earthing up",           category: "field_prep", details: "At V6-V8 (35-40 DAS), perform earthing up (banking soil to stem base) to prevent lodging and root support." },
      { week: 31, month: "August",   activity: "2nd N top-dress",       category: "fertilize",  details: "At tasseling (50-55 DAS): last Urea split 87 kg/ha. Critical for grain number per ear. Do not delay." },
      { week: 32, month: "August",   activity: "Irrigation at silking",  category: "irrigate",   details: "R1 stage (flowering). MOST CRITICAL water need in 7-day silking window. 5 mm/day. Never skip." },
      { week: 35, month: "August",   activity: "Cob monitoring",        category: "monitoring", details: "Check for Helicoverpa borer damage at silk stage. Spray Emamectin 0.4g/L or Chlorantraniliprole 0.4ml/L at silk elongation." },
      { week: 39, month: "September",activity: "Maturity check",        category: "monitoring", details: "R6: black layer at kernel base = physiological maturity. Grain moisture 30-35%. Wait for drydown to <25% before harvest." },
      { week: 40, month: "October",  activity: "Harvest",               category: "harvest",    details: "Manual: cob harvest at 25-30% moisture, dry under sun. Combine: 13-15% moisture. Thresh immediately after picking." },
      { week: 41, month: "October",  activity: "Storage",               category: "storage",    details: "Dry shelled grain to 13% moisture. Store in gunny bags on wooden pallets. Apply deltamethrin dust for storage pest prevention." }
    ],
    criticalWeatherStages: [
      { stage: "Germination", das: "0-10", criticalWeather: "Soil temperature < 18°C", impact: "Poor germination, chilling injury", advisory: "Delay sowing until soil temp reaches 20°C; use plastic mulch to raise temperature" },
      { stage: "Tasseling", das: "50-55", criticalWeather: "Temperature > 38°C or < 14°C during pollination", impact: "Pollen sterility, incomplete kernel set, barren tips", advisory: "Irrigate to moderate temperature; delay sowing to avoid day temp > 38°C window" },
      { stage: "Grain Filling", das: "60-85", criticalWeather: "Drought — no rain for 10+ days", impact: "Kernel abortion, chaffy grain, husk tip protrusion", advisory: "Irrigate at R3 (milk) stage even if only 1 irrigation available" },
    ],
    yieldPotential: "6-8 t/ha (single-cross hybrid, optimal management); 3-4 t/ha (composite, rainfed)",
    notes: "Bihar is fastest growing maize state; Spring maize (Zaid): sow March 1-15, harvest June-July. QPM varieties have 2× higher protein quality.",
  },

  // ===================== MUSTARD - ZONE V/VI =====================
  {
    id: "cal_mustard_NW",
    crop: "Indian Mustard",
    cropHindi: "सरसों",
    season: "Rabi",
    zone: "Zone V & VI - Upper Gangetic & Trans-Gangetic Plains",
    states: ["Rajasthan", "Haryana", "Uttar Pradesh", "Madhya Pradesh"],
    soilType: "Sandy loam / alluvial. Rajasthan: arid to semi-arid loamy soils",
    varietyClass: "Rajasthan: RH 749, DRMR 1165; Top: Pusa Mustard 30, Pusa Double Zero Mustard 31; Hybrid: DMH-1 (under evaluation)",
    duration: "105-130 days",
    sowingWindow: { start: "October 1", end: "October 31", optimal: "October 10-20" },
    harvestWindow: { start: "February 10", end: "March 20" },
    totalRainfallReq: "250-500 mm (mostly rainfed)",
    irrigationCount: 2,
    keyActivities: [
      { week: 40, month: "October",  activity: "Field preparation",    category: "field_prep", details: "2-3 ploughings. Apply 5-6 t/ha FYM. Level field. Last ploughing before sowing (avoid pre-sowing deep till if soft)" },
      { week: 40, month: "October",  activity: "Seed treatment",       category: "field_prep", details: "Treat with Metalaxyl 35% SD @ 6g/kg seed for white rust. Also Thiram 2g/kg + Carbendazim 1g/kg." },
      { week: 41, month: "October",  activity: "Basal application",    category: "fertilize",  details: "DAP 87 kg/ha (P=40) + MOP 33 kg/ha + Gypsum 400 kg/ha (critical for sulphur) + ZnSO4 25 kg/ha." },
      { week: 41, month: "October",  activity: "Sowing",               category: "sowing",     details: "Seed rate 5-6 kg/ha. Row spacing 30 cm. Depth 2-3 cm. Ensure 10-12 plants/m row at establishment.", weatherCondition: "Ideal: cool 20-25°C, no rain after sowing for 5 days for root establishment" },
      { week: 44, month: "November", activity: "Thinning",             category: "field_prep", details: "At 2-3 leaf stage (12-15 DAS): thin to 10-15 cm between plants. Remove extra seedlings." },
      { week: 45, month: "November", activity: "1st Irrigation + N",   category: "irrigate",   details: "25-30 DAS (rosette stage, pre-branching). Apply Urea 87 kg/ha (remaining N 40 kg). Only 1-2 irrigations available for most farmers.", weatherCondition: "If rainfall > 30 mm at this stage, skip irrigation" },
      { week: 47, month: "November", activity: "White rust scouting",  category: "monitoring", details: "Check lower leaf surface for white rust pustules. ETL: 5% plants infected. Spray Metalaxyl + Mancozeb (Ridomil Gold) 2g/L." },
      { week: 50, month: "December", activity: "Aphid monitoring",     category: "monitoring", details: "Painted lady/mustard aphid peaks December-January. ETL: 30-40 aphids/plant or 25/twig. Spray if crossed." },
      { week: 1,  month: "January",  activity: "Flowering irrigation", category: "irrigate",   details: "At flowering (45-50 DAS if rainfall <30mm since last irrigation). 40-50 mm. Critical for pod number." },
      { week: 3,  month: "January",  activity: "Borax foliar",         category: "fertilize",  details: "0.2% borax spray at flowering for improved pod set and oil content. Add 0.5% KCl." },
      { week: 5,  month: "February", activity: "Alternaria leaf spot spray", category: "spray", details: "Check for dark brown/black concentric ring spots (alternaria). Spray Mancozeb 2.5 g/L preventively at pod fill." },
      { week: 7,  month: "February", activity: "Harvest readiness",    category: "monitoring", details: "25-30% siliqua turning yellow, seeds hard and black/brown. Moisture 20-25%. Plan combine or manual harvest." },
      { week: 8,  month: "February", activity: "Harvest",              category: "harvest",    details: "Manual: cut + bundle + dry 3-5 days in sun before threshing. Combine: set for small seeds, lower concave clearance.", weather_alert: "Rain at harvest — major quality issue (mustard oil absorbs moisture). Harvest immediately if rain forecast." },
      { week: 9,  month: "March",    activity: "Threshing & storage",  category: "storage",    details: "Thresh after 3-5 days sun drying. Store at <8% moisture in cloth bags. Do not use airtight bags (condensation)." }
    ],
    criticalWeatherStages: [
      { stage: "Germination", das: "0-10", criticalWeather: "Temperature > 30°C and dry at sowing", impact: "Poor germination; stand failure", advisory: "Pre-sow irrigation (palewa) if soil dry; sow in afternoon" },
      { stage: "Flowering", das: "45-60", criticalWeather: "Frost < 0°C, fog, cold rain", impact: "Flower drop, poor pod set, pod shatter at low temp", advisory: "Light irrigation at flowering greatly reduces frost impact on blossoms" },
      { stage: "Grain Fill", das: "75-90", criticalWeather: "Temperature > 30°C (heat wave)", impact: "Premature pod drying, poor grain quality, low oil", advisory: "Last irrigation at siliqua (pod) development; spray KCl 0.5%" },
    ],
    yieldPotential: "1.8-2.5 t/ha (Rajasthan irrigated); 1.0-1.5 t/ha rainfed",
    notes: "Rajasthan contributes 46% of India's rapeseed-mustard. Alwar, Bharatpur, Karauli: highest productivity. National oilseed policy: minimum 45% self-sufficiency target.",
  },

  // ===================== SUGARCANE - ZONE IV/V =====================
  {
    id: "cal_sugarcane_NC",
    crop: "Sugarcane",
    cropHindi: "गन्ना",
    season: "Annual",
    zone: "Zone IV & V - Middle & Upper Gangetic Plains",
    states: ["Uttar Pradesh", "Bihar", "Haryana", "Punjab"],
    soilType: "Deep alluvial loamy / clay loam",
    varietyClass: "Early: CoSe 98231, CoJ 64; Mid: Co 0238 (MSRB), CoSe 01235; Late: CoS 8436",
    duration: "300-365 days (plant crop); ratoon: 300 days",
    sowingWindow: { start: "February 15", end: "March 31", optimal: "February 15 - March 15 (spring planting)" },
    harvestWindow: { start: "November 1", end: "March 31" },
    totalRainfallReq: "1500-2500 mm (supplemented by irrigation)",
    irrigationCount: 8,
    keyActivities: [
      { week: 5,  month: "February", activity: "Sett preparation",     category: "field_prep", details: "Cut healthy 3-eye setts from disease-free fields. 25-30 cm length, 2-3 nodes. Treat with Carbendazim 0.1% + Dithane M-45 0.3% for 10 minutes." },
      { week: 6,  month: "February", activity: "Trench planting",      category: "sowing",     details: "Trench 25-30 cm deep, 150 cm row spacing. Apply basal N 100 kg + full P 80 kg + full K 120 kg in trench. Place setts end-to-end. Cover 5 cm soil.", weatherCondition: "Ideal: soil temperature > 20°C for germination; avoid cold waves after planting in February" },
      { week: 8,  month: "February", activity: "Propping",             category: "field_prep", details: "At 30-40 DAS: first earthing up (propping) to support young shoot. Destroys weeds." },
      { week: 11, month: "March",    activity: "1st Irrigation",       category: "irrigate",   details: "At 45-50 DAS if no rain. Maintain 5-7 cm depth in furrows. Sugarcane is very drought sensitive at germination-tillering." },
      { week: 14, month: "April",    activity: "2nd N top-dress",      category: "fertilize",  details: "60 DAS: 2nd N split — Urea 130 kg/ha. Apply at 2nd earthing up time." },
      { week: 18, month: "May",      activity: "Earthing up",          category: "field_prep", details: "At 90-100 DAS: major earthing up. Removes 70% weeds. Promotes buttress roots. Builds up large ridges." },
      { week: 20, month: "May",      activity: "3rd N top-dress",      category: "fertilize",  details: "120 DAS: final N split Urea 130 kg/ha. Do not apply N after July (excess N reduces sugar %)." },
      { week: 24, month: "June",     activity: "Propping & binding",   category: "field_prep", details: "At 150-160 DAS: prop canes with stakes + binding with dry leaves to prevent lodging in monsoon." },
      { week: 35, month: "August",   activity: "Stalk borer monitoring",category: "monitoring", details: "Check internodes for top shoot borer (Chilo infuscatellus) and internode borer. ETL: 5% dead hearts. Spray Chlorantraniliprole." },
      { week: 44, month: "November", activity: "Maturity evaluation",  category: "monitoring", details: "Test juice Brix (15-18%) & sucrose % (12-14%) for harvest readiness. Detrash for light access." },
      { week: 46, month: "November", activity: "Harvest",              category: "harvest",    details: "Harvest in Nov-March. Cut ground level with sharp cane knife. Link with sugar mill if supply agreement exists." },
      { week: 48, month: "December", activity: "Trash mulching ratoon",category: "field_prep", details: "After harvest, spread trash (leaves) as mulch 15-20 cm thick over ratoon rows. Conserves 40% moisture. Adds 50 kg N equivalent." }
    ],
    criticalWeatherStages: [
      { stage: "Germination-Tillering", das: "0-90", criticalWeather: "Cold waves < 10°C or late frost (March)", impact: "Shoot death, retarded germination", advisory: "Spring planting after last frost; propped leaf mulch insulation; irrigate before frost" },
      { stage: "Grand Growth", das: "120-240", criticalWeather: "Drought in June-July (delay in monsoon)", impact: "Stunted growth, inter-node shortening, 30% yield reduction", advisory: "Must irrigate at 10-15 day intervals during pre-monsoon phase" },
      { stage: "Maturation", das: "250-365", criticalWeather: "Heavy rain/waterlogging in November", impact: "Stalk shattering, red rot spread, sugar % falls", advisory: "Drain fields; harvest early mature varieties first" },
    ],
    yieldPotential: "70-90 t/ha (irrigated NW India); 50-65 t/ha rainfed; National avg: 79 t/ha",
    notes: "UP produces 40% of India's cane. Peak crush season: Dec-March. Mill link essential. Ratoon crop saves cost by 25-30% but yield 15-20% less than plant crop.",
  },

  // ===================== GROUNDNUT - ZONE X/XIII =====================
  {
    id: "cal_groundnut_Gujarat",
    crop: "Groundnut",
    cropHindi: "मूंगफली",
    season: "Kharif",
    zone: "Zone XIII - Gujarat Plains",
    states: ["Gujarat", "Rajasthan (S)", "Maharashtra"],
    soilType: "Sandy loam / light black; must be permeable (peg penetration)",
    varietyClass: "Kharif: GG 20, TAG 24, TJ 28 (spreading); Bold-seeded: GJG 9, GJG 22; Erect: GPBD 4 (bud necrosis resistant)",
    duration: "105-120 days",
    sowingWindow: { start: "June 15", end: "July 10", optimal: "June 20 - July 5" },
    harvestWindow: { start: "September 20", end: "October 30" },
    totalRainfallReq: "500-700 mm",
    irrigationCount: 3,
    keyActivities: [
      { week: 23, month: "June",     activity: "Seed preparation",     category: "field_prep", details: "Shell pods gently to avoid skin damage. Seed treatment: Thiram 3g/kg + Carbendazim 1g/kg + Rhizobium 25g/kg + PSB 25g/kg (apply last). Mix all in 25ml oil/kg." },
      { week: 24, month: "June",     activity: "Land prep + basal",    category: "sowing",     details: "Fine tilth. Apply SSP 500 kg/ha (P + S) + MOP 83 kg/ha + Boron 10 kg borax/ha. Gypsum 250 kg/ha at pegging (alternatively 500 kg/ha basal)." },
      { week: 24, month: "June",     activity: "Sowing",               category: "sowing",     details: "Spreading type: 45×15 cm; erect type: 30×15 cm. Seed rate 80-100 kg/ha (pods). Depth 4-5 cm. Use ridge-furrow for drainage.", weatherCondition: "Sow 1-2 days after monsoon rain starting. Do not sow in waterlogged condition." },
      { week: 26, month: "July",     activity: "Thinning & earthing",  category: "field_prep", details: "20-25 DAS: thin to 1 plant every 15 cm. First earthing up for root support." },
      { week: 28, month: "July",     activity: "Rhizobium nodulation", category: "monitoring", details: "Pull 1 root at 30 DAS. Check for pink/red nitrogen-fixing nodules. If absent, apply N 20 kg/ha (Urea 43 kg/ha)." },
      { week: 29, month: "July",     activity: "Gypsum application (pegging)", category: "fertilize", details: "At pegging (Gynophore entering soil stage, 30-35 DAS): broadcast gypsum 250 kg/ha between rows. Critical for calcium to kernel, prevents empty pods." },
      { week: 30, month: "July",     activity: "Thrips/mite monitoring",category: "monitoring", details: "Check top shoots for thrips (silver streaks) and mites (bronze stippling). ETL: 5 thrips/plant. Spray if exceeded." },
      { week: 32, month: "August",   activity: "Irrigation (if dry)",  category: "irrigate",   details: "Maintain soil moisture at pod development stage. Critical if >15 days no rain. Do not overwater — check if sandy soil dries completely." },
      { week: 35, month: "August",   activity: "Collar/stem rot check", category: "monitoring", details: "Check for collar rot (Aspergillus niger) — black sclerotia at stem base. Spray Carbendazim 1g/L at stem base." },
      { week: 40, month: "October",  activity: "Harvesting readiness", category: "monitoring", details: "Check pod maturity: scrape pod surface — light-colored inside = immature; dark brown inside = mature. 70-75% mature pods = harvest." },
      { week: 41, month: "October",  activity: "Harvest",              category: "harvest",    details: "Carefully dig/lift plants. Avoid pod damage. Windrow dry for 2-3 days. Thresh gently." },
      { week: 42, month: "October",  activity: "Drying & grading",     category: "storage",    details: "Dry pods to < 9% moisture. Grade for 3-prong: >50mm for seed; commercial: >42mm; crushed: remainder." }
    ],
    criticalWeatherStages: [
      { stage: "Pegging", das: "30-40", criticalWeather: "Drought at peg entry time", impact: "Empty pod shells (blanks), low kernel filling", advisory: "Gypsum broadcast + irrigation ensures calcium availability through soil moisture" },
      { stage: "Pod Development", das: "60-90", criticalWeather: "Waterlogging > 3 days", impact: "Aflatoxin risk from Aspergillus flavus (highly toxic, limits export)", advisory: "Drain immediately; late drought also causes Aspergillus contamination — avoid water stress near harvest" },
      { stage: "Harvest", das: "105-120", criticalWeather: "Heavy rain during harvest (October)", impact: "Aflatoxin contamination, pod germination in ground", advisory: "Harvest at right time; dry immediately; never leave pods in moist ground after maturity" },
    ],
    yieldPotential: "2.0-2.5 t/ha kernel Gujarat irrigated; 1.0-1.5 t/ha rainfed",
    notes: "Gujarat produces 37% of India's groundnut. Saurashtra (Junagadh-Amreli-Bhavnagar-Rajkot) is core zone. Aflatoxin management is critical for export quality (< 4 ppb EU standard).",
  },

  // ===================== CHICKPEA - ZONE VIII/V =====================
  {
    id: "cal_chickpea_central",
    crop: "Chickpea (Desi)",
    cropHindi: "चना",
    season: "Rabi",
    zone: "Zone V & VIII - Upper Gangetic & Central Plateau",
    states: ["Madhya Pradesh", "Rajasthan", "Maharashtra", "Uttar Pradesh", "Andhra Pradesh"],
    soilType: "Deep black, medium loam. Avoids sandy/light soils",
    varietyClass: "JG 11, RVG 202, JAKI 9218 (Desi); KAK 2 (Kabuli); Rust resistant: GNG 1581",
    duration: "90-110 days",
    sowingWindow: { start: "October 20", end: "November 20", optimal: "October 25 - November 10" },
    harvestWindow: { start: "January 25", end: "March 15" },
    totalRainfallReq: "Mostly residual moisture (Rabi rainfed); 250-350 mm total",
    irrigationCount: 1,
    keyActivities: [
      { week: 42, month: "October",  activity: "Seed treatment",       category: "field_prep", details: "Rhizobium + PSB + Trichoderma: 25g each/kg seed in 5ml gum Arabic. Dry in shade 30 min. Avoid direct sun." },
      { week: 43, month: "October",  activity: "Basal fertilizer",     category: "fertilize",  details: "SSP 300 kg/ha (P 48 kg + S 18 kg) + MOP 17 kg/ha. No N basal (Rhizobium provides). Sulphur improves protein quality." },
      { week: 43, month: "October",  activity: "Sowing",               category: "sowing",     details: "Seed rate 60-75 kg/ha (desi) or 100 kg/ha (kabuli). Row spacing 30-45 cm, depth 8-10 cm. Relies on residual soil moisture.", weatherCondition: "Requires dry cool weather. Avoid rain within 1 week before/after sowing (damping off risk)." },
      { week: 46, month: "November", activity: "Weed control",         category: "spray",      details: "At 25-30 DAS: Pendimethalin 1.25 kg/ha pre-emergence OR Imazethapyr 75g/ha post-emergence for narrow-leaf grasses." },
      { week: 48, month: "December", activity: "Flowering irrigation", category: "irrigate",   details: "1st (and possibly only) irrigation at pre-flowering (50 DAS) if soil moisture very low. 30-40mm only. Excess water promotes Botrytis grey mould." },
      { week: 50, month: "December", activity: "Pod borer scouting",   category: "monitoring", details: "Check for Helicoverpa pod borer from flowering. ETL: 2 larvae/m² or 5% damage. Respond immediately with emamectin benzoate." },
      { week: 1,  month: "January",  activity: "Pod borer spray",      category: "spray",      details: "Emamectin Benzoate 5% SG @ 0.4g/L at 1st larval stage OR NPV-H 250 LE/ha alternated with Bt-k." },
      { week: 3,  month: "January",  activity: "Wilt monitoring",      category: "monitoring", details: "Check for fusarium wilt — yellowing + wilting. If >5% plants wilted, remove and destroy. Collar rot: Trichoderma 2.5 kg/ha drench." },
      { week: 7,  month: "February", activity: "Harvest readiness",    category: "monitoring", details: "Lower leaves yellowing, pods browning, seeds have full colour. Harvest at <20% moisture." },
      { week: 8,  month: "February", activity: "Harvest",              category: "harvest",    details: "Manual (small farms) or combine. Combine loss < 1%. Thresh immediately. Do not leave crop wet after harvest." }
    ],
    criticalWeatherStages: [
      { stage: "Germination", das: "0-10", criticalWeather: "Rain > 25mm after sowing", impact: "Damping off, seed rot, root rot (Pythium)", advisory: "Avoid sowing on forecast rain; apply Trichoderma at sowing for biocontrol" },
      { stage: "Flowering", das: "55-75", criticalWeather: "Temperature > 30°C for 3+ days during flowering", impact: "Flower drop, poor pod set", advisory: "Spray Thiourea 500 ppm at flowering; provide single irrigation" },
      { stage: "Pod Fill", das: "75-95", criticalWeather: "Fog + humidity > 80% (botrytis season, December-January)", impact: "Grey mould (Botrytis cinerea) pod infection", advisory: "Spray Carbendazim 500g/ha at first sign of fog; avoid stagnant moisture" },
    ],
    yieldPotential: "1.5-2.0 t/ha (improved varieties irrigated); 0.8-1.2 t/ha rainfed",
    notes: "MP produces 38% of India's chickpea. MSP (2024-25): ₹5,440/quintal. NAKB (Narma varieties) command 25-30% premium in commodity market.",
  },
];

// ===================== HELPER FUNCTIONS =====================

export const getCalendarByCrop = (crop: string): CropCalendarEntry[] =>
  cropCalendarData.filter(c => c.crop.toLowerCase().includes(crop.toLowerCase()));

export const getCalendarBySeason = (season: string): CropCalendarEntry[] =>
  cropCalendarData.filter(c => c.season.toLowerCase() === season.toLowerCase());

export const getCalendarByState = (state: string): CropCalendarEntry[] =>
  cropCalendarData.filter(c => c.states.some(s => s.toLowerCase().includes(state.toLowerCase())));

export const getCurrentActivities = (cropId: string, weekNumber: number): CropActivity[] => {
  const entry = cropCalendarData.find(c => c.id === cropId);
  if (!entry) return [];
  return entry.keyActivities.filter(a => Math.abs(a.week - weekNumber) <= 1);
};

export const getWeatherAlerts = (cropId: string, das: number): CropCalendarEntry["criticalWeatherStages"] => {
  const entry = cropCalendarData.find(c => c.id === cropId);
  if (!entry) return [];
  return entry.criticalWeatherStages.filter(s => {
    const [min, max] = s.das.split("-").map(Number);
    return das >= min && das <= (max || min + 10);
  });
};

export const getCalendarZones = (): string[] =>
  [...new Set(cropCalendarData.map(c => c.zone))];
