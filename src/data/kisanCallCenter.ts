// Kisan Call Center (KCC) Dataset
// Source: AIKosh/IndiaAI, Kisan Call Centre (1800-180-1551), ICAR farmer helplines
// Common farmer queries and expert answers for chatbot integration

import { createDatasetMetadata } from "./datasetMetadata";

export interface KCCQuery {
  id: string;
  category: string;
  subcategory: string;
  question: string;
  questionHindi: string;
  answer: string;
  answerHindi: string;
  crop?: string;
  tags: string[];
  priority: "high" | "medium" | "low";
  season?: string[];
  region?: string[];
}

export const kisanCallCenterMetadata = createDatasetMetadata({
  version: "1.0.0",
  lastUpdated: "2024-11-05T00:00:00Z",
  source: "Kisan Call Centre + ICAR helpline guidance",
  notes: "FAQ responses normalized for multilingual assistant usage.",
});

export const kisanCallCenterData: KCCQuery[] = [
  // ==================== CROP MANAGEMENT ====================
  {
    id: "kcc_001",
    category: "Crop Management",
    subcategory: "Sowing",
    question: "What is the best time to sow wheat in North India?",
    questionHindi: "उत्तर भारत में गेहूं की बुवाई का सबसे अच्छा समय क्या है?",
    answer: "Optimal wheat sowing time for North Indian plains (Punjab, Haryana, UP, Rajasthan) is November 1-25 for timely sown varieties. For late sown conditions (after Nov 25), use varieties like HD 3059, PBW 752, or WH 1124. Seed rate: 100 kg/ha for timely, 125 kg/ha for late sown. Ensure soil moisture at sowing for good germination. For irrigated conditions, first irrigation (Crown Root Initiation) should be given 21-25 days after sowing.",
    answerHindi: "उत्तर भारतीय मैदानों में गेहूं की सही समय पर बुवाई 1-25 नवंबर है। देरी से (25 नवंबर के बाद) बुवाई के लिए HD 3059, PBW 752 या WH 1124 किस्में उपयोग करें। बीज दर: समय पर 100 किग्रा/हेक्टेयर, देरी से 125 किग्रा/हेक्टेयर। बुवाई के समय पर्याप्त नमी सुनिश्चित करें। पहली सिंचाई (CRI) बुवाई के 21-25 दिन बाद दें।",
    crop: "Wheat",
    tags: ["sowing", "wheat", "timing", "north india"],
    priority: "high",
    season: ["Rabi"],
    region: ["Punjab", "Haryana", "Uttar Pradesh", "Rajasthan"]
  },
  {
    id: "kcc_002",
    category: "Crop Management",
    subcategory: "Sowing",
    question: "What is the recommended seed rate for rice transplanting?",
    questionHindi: "धान की रोपाई के लिए अनुशंसित बीज दर क्या है?",
    answer: "For rice transplanting: Nursery seed rate is 30-40 kg/ha (for transplanting 1 hectare). Raise nursery in 1/20th area. Seedling age for transplanting: 25-30 days for medium duration varieties, 20-25 days for short duration. Plant spacing: 20×15 cm (33 hills/sq.m) for fine grain, 20×20 cm for coarse grain. Use 2-3 seedlings per hill. For SRI (System of Rice Intensification): only 5 kg seed/ha, single 8-14 day old seedling at 25×25 cm.",
    answerHindi: "धान की रोपाई: नर्सरी बीज दर 30-40 किग्रा/हेक्टेयर। 1/20 क्षेत्र में नर्सरी तैयार करें। रोपाई आयु: मध्यम अवधि 25-30 दिन, अल्प अवधि 20-25 दिन। दूरी: 20×15 सेमी बारीक चावल, 20×20 सेमी मोटा चावल। 2-3 पौधे प्रति हिल। SRI विधि: 5 किग्रा बीज/हेक्टेयर, 8-14 दिन का एक पौधा 25×25 सेमी पर।",
    crop: "Rice",
    tags: ["sowing", "rice", "transplanting", "seed rate", "SRI"],
    priority: "high",
    season: ["Kharif"],
    region: ["All India"]
  },
  {
    id: "kcc_003",
    category: "Crop Management",
    subcategory: "Variety Selection",
    question: "Which mustard variety is best for Rajasthan?",
    questionHindi: "राजस्थान के लिए सरसों की सबसे अच्छी किस्म कौन सी है?",
    answer: "For Rajasthan: (1) RH 749 - high yield (2.3 t/ha), high oil (42%), suitable for irrigated conditions. (2) Pusa Mustard 25 (NPJ 112) - white rust tolerant, bold seeded. (3) NRCDR-2 (Urvashi) - for rainfed conditions. (4) Bio 902 - private hybrid, very high yield. Sow by October 15-30 for best results. Seed treatment with Metalaxyl 35 SD @ 6g/kg for white rust protection. Apply 80:40:20 NPK kg/ha with 30 kg Sulphur/ha for higher oil content.",
    answerHindi: "राजस्थान के लिए: (1) RH 749 - उच्च उपज (2.3 टन/हे), तेल 42%। (2) पूसा सरसों 25 - सफेद रतुआ सहनशील। (3) NRCDR-2 - बारानी क्षेत्रों के लिए। (4) बायो 902 - निजी संकर, बहुत अधिक उपज। 15-30 अक्टूबर तक बुवाई करें। बीज उपचार Metalaxyl @ 6 ग्राम/किग्रा। 80:40:20 NPK + 30 किग्रा गंधक/हे डालें।",
    crop: "Mustard",
    tags: ["variety", "mustard", "rajasthan", "selection"],
    priority: "high",
    season: ["Rabi"],
    region: ["Rajasthan"]
  },
  {
    id: "kcc_004",
    category: "Crop Management",
    subcategory: "Irrigation",
    question: "How many irrigations does wheat need and at what stages?",
    questionHindi: "गेहूं को कितनी सिंचाई चाहिए और किन अवस्थाओं पर?",
    answer: "Wheat requires 4-6 irrigations depending on soil type: (1) CRI stage (21-25 DAS) - MOST CRITICAL, skipping reduces yield by 30-40%. (2) Tillering (40-45 DAS). (3) Late jointing (60-65 DAS). (4) Flowering (80-85 DAS). (5) Milking (95-100 DAS). (6) Dough stage (110-115 DAS). If only 1 irrigation available: give at CRI. If 2: CRI + Flowering. If 3: CRI + Late jointing + Milking. Light soils need more frequent irrigation. Total water requirement: 350-450 mm.",
    answerHindi: "गेहूं को 4-6 सिंचाई: (1) CRI (21-25 दिन) - सबसे महत्वपूर्ण, न देने से 30-40% उपज हानि। (2) टिलरिंग (40-45 दिन)। (3) गांठ बनना (60-65 दिन)। (4) फूल आना (80-85 दिन)। (5) दूधिया (95-100 दिन)। (6) दाना भरना (110-115 दिन)। 1 सिंचाई हो तो CRI पर। 2 हो तो CRI + फूल। 3 हो तो CRI + गांठ + दूधिया।",
    crop: "Wheat",
    tags: ["irrigation", "wheat", "water", "critical stages"],
    priority: "high",
    season: ["Rabi"],
    region: ["All India"]
  },
  {
    id: "kcc_005",
    category: "Crop Management",
    subcategory: "Fertilizer",
    question: "What fertilizer schedule should I follow for rice?",
    questionHindi: "धान के लिए खाद की अनुसूची क्या होनी चाहिए?",
    answer: "Recommended rice fertilizer schedule (120:60:40 NPK kg/ha): BASAL (at transplanting): Full Phosphorus (DAP 130 kg/ha) + Full Potash (MOP 67 kg/ha) + Zinc Sulphate 25 kg/ha. FIRST TOP DRESSING (21 DAT/at tillering): Urea 65 kg/ha. SECOND TOP DRESSING (at panicle initiation): Urea 65 kg/ha. For Basmati: reduce N to 80 kg/ha. Apply urea in standing water of 3-5 cm. Green manure (Dhaincha/Sesbania) incorporation before transplanting saves 25-30% nitrogen. Use Leaf Colour Chart (LCC) for need-based nitrogen management.",
    answerHindi: "धान खाद अनुसूची (120:60:40 NPK किग्रा/हे): बेसल (रोपाई पर): पूरा P (DAP 130 किग्रा) + पूरा K (MOP 67 किग्रा) + जिंक सल्फेट 25 किग्रा। पहली टॉप ड्रेसिंग (21 DAT): यूरिया 65 किग्रा। दूसरी (बाली आने पर): यूरिया 65 किग्रा। बासमती: N 80 किग्रा/हे तक कम करें। हरी खाद (ढैंचा) लगाने से 25-30% नाइट्रोजन बचत।",
    crop: "Rice",
    tags: ["fertilizer", "rice", "NPK", "schedule", "urea"],
    priority: "high",
    season: ["Kharif"],
    region: ["All India"]
  },

  // ==================== DISEASE & PEST MANAGEMENT ====================
  {
    id: "kcc_006",
    category: "Plant Protection",
    subcategory: "Disease",
    question: "How to control late blight in potato?",
    questionHindi: "आलू में पछेती झुलसा कैसे नियंत्रित करें?",
    answer: "Potato late blight control strategy: PREVENTIVE: (1) Use certified disease-free seed tubers. (2) Spray Mancozeb 75% WP @ 2.5g/L starting 45 days after planting at 10-day intervals. CURATIVE: When disease appears: (3) Spray Metalaxyl + Mancozeb (Ridomil Gold) @ 2.5g/L or Cymoxanil + Mancozeb @ 3g/L. (4) Alternate with contact + systemic fungicides. (5) Dehaulm (cut green tops) 10-15 days before harvest for healthy tubers. (6) Do not irrigate after disease onset. (7) Harvest in dry weather and cure tubers before storage.",
    answerHindi: "आलू पछेती झुलसा नियंत्रण: रोकथाम: (1) प्रमाणित बीज आलू। (2) मैन्कोजेब @ 2.5 ग्राम/ली 45 दिन बाद से 10 दिन अंतराल पर। उपचार: (3) Ridomil Gold @ 2.5 ग्राम/ली या Cymoxanil + Mancozeb @ 3 ग्राम/ली। (4) संपर्क + प्रणालीगत फफूंदनाशक बदल-बदल कर। (5) खुदाई से 10-15 दिन पहले डंठल काटें। (6) रोग के बाद सिंचाई न करें। (7) सूखे मौसम में खुदाई करें।",
    crop: "Potato",
    tags: ["late blight", "potato", "fungicide", "disease control"],
    priority: "high",
    season: ["Rabi"],
    region: ["Uttar Pradesh", "West Bengal", "Bihar", "Punjab"]
  },
  {
    id: "kcc_007",
    category: "Plant Protection",
    subcategory: "Pest",
    question: "How to manage pink bollworm in cotton?",
    questionHindi: "कपास में गुलाबी सुंडी का प्रबंधन कैसे करें?",
    answer: "Pink bollworm (PBW) management in cotton: (1) Use pheromone traps @ 5/acre for monitoring. (2) Spray when 8-10 moths/trap/night. (3) Chemical: Profenophos 50% EC @ 2ml/L or Quinalphos 25% EC @ 2ml/L or Emamectin benzoate 5% SG @ 0.4g/L. (4) Cycle spray with different mode-of-action insecticides. (5) Short-duration varieties (150-170 days) escape PBW. (6) CRITICAL: Remove and destroy all green bolls, dried bolls before April 1 (close season). (7) Deep ploughing after harvest. (8) Do not store un-ginned kapas near new crop.",
    answerHindi: "गुलाबी सुंडी प्रबंधन: (1) फेरोमोन ट्रैप 5/एकड़। (2) 8-10 पतंगे/ट्रैप/रात पर स्प्रे। (3) Profenophos @ 2 मिली/ली या Emamectin benzoate @ 0.4 ग्राम/ली। (4) अलग-अलग कीटनाशक बदलें। (5) कम अवधि की किस्में (150-170 दिन)। (6) 1 अप्रैल से पहले सभी हरे/सूखे टिंडे नष्ट करें। (7) कटाई बाद गहरी जुताई। (8) कच्ची कपास नई फसल के पास न रखें।",
    crop: "Cotton",
    tags: ["pink bollworm", "cotton", "pest management", "pheromone trap"],
    priority: "high",
    season: ["Kharif"],
    region: ["Gujarat", "Maharashtra", "Telangana", "Haryana", "Punjab"]
  },
  {
    id: "kcc_008",
    category: "Plant Protection",
    subcategory: "Disease",
    question: "What causes yellowing in rice and how to manage it?",
    questionHindi: "धान में पत्तियां पीली क्यों होती हैं और इसका उपचार क्या है?",
    answer: "Rice yellowing causes and solutions: (1) IRON DEFICIENCY (Khaira disease): Yellowing + browning of lower leaves. Apply Zinc Sulphate 25 kg/ha in soil + FeSO4 0.5% spray. (2) NITROGEN DEFICIENCY: Uniform pale yellow. Apply Urea 30-40 kg/ha. (3) BACTERIAL LEAF BLIGHT: Yellow stripes along veins. Spray Streptocycline @ 0.015%. (4) TUNGRO VIRUS: Yellow-orange discoloration. Control green leafhopper vector with Imidacloprid @ 0.3ml/L. (5) WATERLOGGING: Poor root aeration. Drain excess water. Diagnosis: If lower leaves yellow first = nutrient deficiency. If random pattern = disease.",
    answerHindi: "धान में पीलापन के कारण: (1) जिंक की कमी (खैरा): नीचे पत्तियां पीली + भूरी। जिंक सल्फेट 25 किग्रा/हे + FeSO4 0.5% स्प्रे। (2) नाइट्रोजन कमी: एक समान पीला। यूरिया 30-40 किग्रा। (3) जीवाणु पत्ती झुलसा: नसों के साथ पीली धारियां। Streptocycline @ 0.015%। (4) टुंग्रो: पीला-नारंगी। Imidacloprid @ 0.3 मिली/ली से हरा फुदका नियंत्रण। (5) जलभराव: पानी निकालें।",
    crop: "Rice",
    tags: ["yellowing", "rice", "nutrient deficiency", "disease", "zinc"],
    priority: "high",
    season: ["Kharif"],
    region: ["All India"]
  },
  {
    id: "kcc_009",
    category: "Plant Protection",
    subcategory: "Pest",
    question: "How to control fall armyworm in maize?",
    questionHindi: "मक्के में सैनिक कीट (फॉल आर्मीवर्म) कैसे नियंत्रित करें?",
    answer: "Fall armyworm (Spodoptera frugiperda) in maize: IDENTIFICATION: Inverted Y on head, 4 dark spots in square on last body segment. CONTROL: (1) Early detection: Check whorl for frass and holes. (2) Apply Emamectin benzoate 5% SG @ 0.4g/L or Spinetoram 11.7% SC @ 0.5ml/L spray directed into whorl. (3) Chlorantraniliprole 18.5% SC @ 0.4ml/L. (4) For small farms: Apply sand + lime mixture into whorl. (5) Biological: Release Trichogramma @ 1 lakh/acre. (6) Use pheromone traps for early warning. (7) Intercrop with pulses. (8) Avoid late planting.",
    answerHindi: "फॉल आर्मीवर्म नियंत्रण: पहचान: सिर पर उल्टा Y निशान। (1) पत्ती गोभ में मल और छेद जांचें। (2) Emamectin benzoate @ 0.4 ग्राम/ली या Spinetoram @ 0.5 मिली/ली गोभ में स्प्रे। (3) Chlorantraniliprole @ 0.4 मिली/ली। (4) छोटे खेत: रेत + चूना मिश्रण गोभ में। (5) ट्राइकोग्रामा 1 लाख/एकड़। (6) फेरोमोन ट्रैप। (7) दाल के साथ अंतरफसल। (8) देर से बुवाई से बचें।",
    crop: "Maize",
    tags: ["fall armyworm", "maize", "pest", "spodoptera"],
    priority: "high",
    season: ["Kharif"],
    region: ["Karnataka", "Andhra Pradesh", "Tamil Nadu", "Maharashtra", "Madhya Pradesh"]
  },
  {
    id: "kcc_010",
    category: "Plant Protection",
    subcategory: "Weed",
    question: "How to control weeds in wheat?",
    questionHindi: "गेहूं में खरपतवार नियंत्रण कैसे करें?",
    answer: "Wheat weed management: PRE-EMERGENCE (within 2-3 DAS): Pendimethalin 30% EC @ 3.3 L/ha in 500L water for Phalaris minor + broadleaf weeds. POST-EMERGENCE: For Phalaris minor (Gulli danda): Clodinafop 15% WP @ 400g/ha at 30-35 DAS or Sulfosulfuron 75% WG @ 33g/ha. For broadleaf weeds (Bathua, Senji): 2,4-D Amine salt 58% SL @ 2.0 L/ha at 30-35 DAS or Metsulfuron methyl 20% WG @ 20g/ha. For both: Sulfosulfuron + Metsulfuron (Total) @ 40g/ha. CRITICAL: Do not irrigate for 2 days after herbicide spray.",
    answerHindi: "गेहूं खरपतवार नियंत्रण: बुवाई पूर्व (2-3 दिन में): Pendimethalin @ 3.3 ली/हे। बुवाई बाद: गुल्ली डंडा: Clodinafop @ 400 ग्राम/हे 30-35 DAS या Sulfosulfuron @ 33 ग्राम/हे। चौड़ी पत्ती (बथुआ): 2,4-D @ 2.0 ली/हे। दोनों: Total (Sulfo+Metsu) @ 40 ग्राम/हे। स्प्रे बाद 2 दिन सिंचाई न करें।",
    crop: "Wheat",
    tags: ["weed", "wheat", "herbicide", "phalaris minor", "gulli danda"],
    priority: "high",
    season: ["Rabi"],
    region: ["Punjab", "Haryana", "Uttar Pradesh", "Rajasthan"]
  },

  // ==================== GOVERNMENT SCHEMES ====================
  {
    id: "kcc_011",
    category: "Government Scheme",
    subcategory: "PM-KISAN",
    question: "How to apply for PM-KISAN scheme and what are the benefits?",
    questionHindi: "PM-KISAN योजना के लिए कैसे आवेदन करें और क्या लाभ हैं?",
    answer: "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi): BENEFITS: ₹6,000/year in 3 installments of ₹2,000 directly to bank account. ELIGIBILITY: All farmer families with cultivable land (landless labourers excluded). EXCLUSIONS: Institutional landholders, current/former ministers, income tax payers, professionals. HOW TO APPLY: (1) Visit pmkisan.gov.in or Common Service Centre (CSC). (2) Need: Aadhaar card, bank passbook, land records (khasra/khatauni). (3) Register through state nodal officer or village panchayat. (4) Check status at pmkisan.gov.in with Aadhaar. KCC (Kisan Credit Card) also linked with PM-KISAN.",
    answerHindi: "PM-KISAN: लाभ: ₹6,000/वर्ष 3 किस्तों में ₹2,000। पात्रता: कृषि योग्य भूमि वाले सभी किसान परिवार। आवेदन: pmkisan.gov.in या CSC केंद्र। जरूरी दस्तावेज: आधार, बैंक पासबुक, भूमि रिकॉर्ड। स्थिति जांचें: pmkisan.gov.in पर आधार से।",
    tags: ["PM-KISAN", "government scheme", "subsidy", "direct benefit"],
    priority: "high",
    region: ["All India"]
  },
  {
    id: "kcc_012",
    category: "Government Scheme",
    subcategory: "Crop Insurance",
    question: "How does Pradhan Mantri Fasal Bima Yojana (PMFBY) work?",
    questionHindi: "प्रधानमंत्री फसल बीमा योजना (PMFBY) कैसे काम करती है?",
    answer: "PMFBY Crop Insurance: PREMIUM: Kharif crops 2%, Rabi crops 1.5%, Horticultural/Commercial 5% of sum insured (rest by government). COVERAGE: Natural calamities, pest attacks, diseases, drought, flood, hailstorm. Also covers localized calamities and post-harvest losses (up to 14 days). HOW TO ENROLL: (1) Within 7 days of sowing for loanee farmers (auto-enrolled). (2) Non-loanee: Visit bank, CSC, or PMFBY portal (pmfby.gov.in). (3) Documents: Aadhaar, bank account, land records, sowing certificate. CLAIM: (1) Report crop loss within 72 hours via PMFBY app or toll-free 14447. (2) Crop cutting experiments determine yield. (3) Compensation = threshold yield minus actual yield.",
    answerHindi: "PMFBY: प्रीमियम: खरीफ 2%, रबी 1.5%, बागवानी 5%। कवरेज: प्राकृतिक आपदा, कीट, रोग, सूखा, बाढ़, ओलावृष्टि, कटाई बाद 14 दिन तक। नामांकन: बुवाई के 7 दिन में बैंक/CSC/pmfby.gov.in। दावा: 72 घंटे में PMFBY ऐप या 14447 पर सूचित करें।",
    tags: ["PMFBY", "crop insurance", "government scheme", "premium"],
    priority: "high",
    region: ["All India"]
  },
  {
    id: "kcc_013",
    category: "Government Scheme",
    subcategory: "Soil Health Card",
    question: "What is Soil Health Card scheme and how to get one?",
    questionHindi: "मृदा स्वास्थ्य कार्ड योजना क्या है और कैसे प्राप्त करें?",
    answer: "Soil Health Card Scheme: PURPOSE: Provides soil nutrient status and fertilizer recommendations for 12 parameters (N, P, K, S, Zn, Fe, Cu, Mn, B, pH, EC, Organic Carbon). CYCLE: New card every 2 years. HOW TO GET: (1) Contact block/district agriculture officer. (2) Soil sample collected by trained staff from your field. (3) Analysis done at state soil testing laboratory. (4) Card generated with crop-wise fertilizer recommendations. (5) Check online at soilhealth.dac.gov.in with SHC number. BENEFITS: Save 15-20% on fertilizer costs by balanced application. Helps identify micronutrient deficiencies that limit yields.",
    answerHindi: "मृदा स्वास्थ्य कार्ड: उद्देश्य: 12 मापदंडों (N, P, K, S, Zn, Fe, Cu, Mn, B, pH, EC, OC) की जानकारी और फसलवार खाद सिफारिश। हर 2 साल नया कार्ड। प्राप्त करें: ब्लॉक/जिला कृषि अधिकारी से संपर्क। soilhealth.dac.gov.in पर ऑनलाइन देखें। लाभ: 15-20% खाद बचत।",
    tags: ["soil health card", "government scheme", "soil testing", "fertilizer"],
    priority: "medium",
    region: ["All India"]
  },
  {
    id: "kcc_014",
    category: "Government Scheme",
    subcategory: "Subsidy",
    question: "What subsidies are available for drip irrigation?",
    questionHindi: "ड्रिप सिंचाई पर कौन-कौन सी सब्सिडी उपलब्ध है?",
    answer: "Drip/Micro Irrigation Subsidies under PMKSY (Per Drop More Crop): SUBSIDY: Small/Marginal farmers: 55% of cost. Other farmers: 45% of cost. Some states give additional 10-25% top-up. HOW TO APPLY: (1) Register on state agriculture department portal. (2) Select approved drip system company from empanelled list. (3) Documents: Land records, Aadhaar, bank details, caste certificate (SC/ST for extra subsidy). (4) Get installation done by approved company. (5) Submit bills with geo-tagged photos for subsidy release. COST RANGE: ₹1.0-1.5 lakh/hectare for drip. ₹50,000-80,000/hectare for sprinkler.",
    answerHindi: "PMKSY ड्रिप/सूक्ष्म सिंचाई सब्सिडी: छोटे/सीमांत: 55%, अन्य: 45%। कुछ राज्य अतिरिक्त 10-25%। आवेदन: राज्य कृषि विभाग पोर्टल पर। अनुमोदित कंपनी से सिस्टम लगवाएं। जियो-टैग फोटो सहित बिल जमा करें। लागत: ड्रिप ₹1.0-1.5 लाख/हे, स्प्रिंकलर ₹50,000-80,000/हे।",
    tags: ["drip irrigation", "subsidy", "PMKSY", "micro irrigation"],
    priority: "medium",
    region: ["All India"]
  },

  // ==================== ORGANIC FARMING ====================
  {
    id: "kcc_015",
    category: "Organic Farming",
    subcategory: "Preparation",
    question: "How to prepare Jeevamrit and Beejamrit for organic farming?",
    questionHindi: "जैविक खेती के लिए जीवामृत और बीजामृत कैसे बनाएं?",
    answer: "JEEVAMRIT (liquid fertilizer): Mix in 200L water: 10 kg fresh desi cow dung + 10 L desi cow urine + 2 kg jaggery + 2 kg gram flour (besan) + handful of soil from bund/tree base. Stir daily, ready in 5-7 days. Usage: 200L/acre through irrigation or 20L diluted in 200L for foliar spray. Apply every 15 days. BEEJAMRIT (seed treatment): Mix 5 kg desi cow dung + 5L desi cow urine + 50g lime + 1L water. Make paste. Coat seeds uniformly, dry in shade. Protects against soil-borne pathogens. PANCHAGAVYA: Cow dung 5kg + cow urine 3L + milk 2L + curd 2L + ghee 1L. Ferment 15 days. Use 3% spray.",
    answerHindi: "जीवामृत: 200L पानी में 10 किग्रा देसी गोबर + 10 ली गोमूत्र + 2 किग्रा गुड़ + 2 किग्रा बेसन + मुट्ठी भर मिट्टी। 5-7 दिन में तैयार। 200 ली/एकड़ सिंचाई से। बीजामृत: 5 किग्रा गोबर + 5 ली गोमूत्र + 50 ग्राम चूना + 1 ली पानी। बीज लेप करें। पंचगव्य: गोबर 5 किग्रा + गोमूत्र 3 ली + दूध 2 ली + दही 2 ली + घी 1 ली। 15 दिन किण्वन। 3% स्प्रे।",
    tags: ["organic", "jeevamrit", "beejamrit", "panchagavya", "natural farming"],
    priority: "medium",
    region: ["All India"]
  },
  {
    id: "kcc_016",
    category: "Organic Farming",
    subcategory: "Certification",
    question: "How to get organic farming certification in India?",
    questionHindi: "भारत में जैविक खेती का प्रमाणन कैसे लें?",
    answer: "Organic certification in India: TWO SYSTEMS: (1) THIRD PARTY: Through NPOP (National Programme for Organic Production) accredited certifying agencies (APEDA-accredited). Process: Apply → Inspection → Conversion period (2-3 years) → Full certification. Cost: ₹5,000-15,000/year. Needed for export. (2) PGS-India (Participatory Guarantee System): Groups of 5+ farmers form a Local Group. Self-inspection + peer review. FREE through Jaivik Kheti portal (pgsindia-ncof.gov.in). Valid for domestic sale. GOVERNMENT SUPPORT: PKVY (Paramparagat Krishi Vikas Yojana) gives ₹50,000/ha over 3 years for organic conversion in clusters of 50+ farmers.",
    answerHindi: "जैविक प्रमाणन: दो प्रणालियां: (1) NPOP: प्रमाणन एजेंसी द्वारा, 2-3 वर्ष रूपांतरण, ₹5,000-15,000/वर्ष, निर्यात के लिए। (2) PGS-India: 5+ किसानों का समूह, मुफ्त, pgsindia-ncof.gov.in, घरेलू बिक्री के लिए। सरकारी सहायता: PKVY ₹50,000/हे 3 वर्षों में 50+ किसानों के क्लस्टर में।",
    tags: ["organic certification", "NPOP", "PGS", "PKVY"],
    priority: "medium",
    region: ["All India"]
  },

  // ==================== MARKET & SELLING ====================
  {
    id: "kcc_017",
    category: "Marketing",
    subcategory: "Selling",
    question: "How to sell produce on eNAM (National Agriculture Market)?",
    questionHindi: "eNAM (राष्ट्रीय कृषि बाजार) पर अपनी उपज कैसे बेचें?",
    answer: "eNAM (National Agriculture Market) selling process: (1) REGISTRATION: Visit nearest eNAM-linked mandi or register at enam.gov.in. Need Aadhaar, bank account, mobile number. (2) GATE ENTRY: Take produce to eNAM mandi, get gate entry slip with quantity/quality. (3) LOT CREATION: Mandi creates electronic lot with quality parameters. (4) BIDDING: Nationwide traders bid online. You get best price from across India, not just local traders. (5) PAYMENT: Direct bank transfer within 24 hours through UPI/RTGS. ADVANTAGES: Transparent pricing, better price discovery, reduced intermediaries. COVERAGE: 1,361 mandis across 23 states (as of 2024). Also sell through Kisan Rath mobile app for transport.",
    answerHindi: "eNAM पर बिक्री: (1) पंजीकरण: eNAM मंडी या enam.gov.in पर। आधार + बैंक + मोबाइल। (2) गेट एंट्री: मंडी में उपज लाएं, स्लिप लें। (3) लॉट बनाना: गुणवत्ता मापदंडों सहित। (4) बोली: देशभर के व्यापारी ऑनलाइन बोली लगाते हैं। (5) भुगतान: 24 घंटे में बैंक ट्रांसफर। 1,361 मंडियां 23 राज्यों में।",
    tags: ["eNAM", "selling", "market", "mandi", "online trading"],
    priority: "medium",
    region: ["All India"]
  },
  {
    id: "kcc_018",
    category: "Marketing",
    subcategory: "MSP",
    question: "What is MSP and how to sell at MSP?",
    questionHindi: "MSP क्या है और MSP पर कैसे बेचें?",
    answer: "MSP (Minimum Support Price): Government announces MSP for 23 crops based on cost of production (C2+50% formula). KHARIF MSP 2024-25: Paddy ₹2,300, Jowar ₹3,371, Bajra ₹2,500, Maize ₹2,090, Tur ₹7,550, Moong ₹8,682, Urad ₹6,950, Groundnut ₹6,377, Soybean ₹4,892, Cotton ₹7,121. RABI MSP 2024-25: Wheat ₹2,275, Barley ₹1,850, Gram ₹5,440, Masoor ₹6,425, Mustard ₹5,650. HOW TO SELL: (1) Register at government procurement centre when announced. (2) Bring produce meeting FAQ (Fair Average Quality) norms. (3) Procurement through FCI (wheat/rice), NAFED (pulses/oilseeds), CCI (cotton). (4) Payment within 72 hours to bank account.",
    answerHindi: "MSP: सरकार 23 फसलों के लिए MSP घोषित करती है। खरीफ 2024-25: धान ₹2,300, मक्का ₹2,090, मूंग ₹8,682, सोयाबीन ₹4,892, कपास ₹7,121। रबी: गेहूं ₹2,275, चना ₹5,440, सरसों ₹5,650। बेचने के लिए: सरकारी खरीद केंद्र पर पंजीकरण। FAQ मानक उपज लाएं। भुगतान 72 घंटे में।",
    tags: ["MSP", "minimum support price", "procurement", "FCI"],
    priority: "high",
    region: ["All India"]
  },

  // ==================== WEATHER & CLIMATE ====================
  {
    id: "kcc_019",
    category: "Weather Advisory",
    subcategory: "Monsoon",
    question: "How to prepare crops for heavy rainfall and waterlogging?",
    questionHindi: "भारी बारिश और जलभराव से फसल कैसे बचाएं?",
    answer: "Heavy rainfall and waterlogging management: BEFORE MONSOON: (1) Ensure proper field drainage channels. (2) Make raised beds for vegetables. (3) Apply all basal fertilizers before heavy rain period. DURING WATERLOGGING: (4) Drain excess water within 24-48 hours (critical for pulses). (5) Do NOT apply urea/nitrogen during waterlogging. (6) Apply potash (MOP 20 kg/ha) after drainage to strengthen plants. AFTER WATERLOGGING: (7) Spray 2% urea + 1% KCl foliar for recovery. (8) Apply copper fungicide to prevent root rot. (9) For rice: maintain 5 cm water, do not drain completely. (10) For vegetables: earthing up after drainage. PREVENTIVE: Grow flood-tolerant rice varieties (Swarna Sub-1, Ciherang Sub-1).",
    answerHindi: "जलभराव प्रबंधन: बारिश पूर्व: (1) जल निकासी नाली बनाएं। (2) सब्जियों के लिए उठी क्यारी। (3) बेसल खाद पहले डालें। जलभराव में: (4) 24-48 घंटे में पानी निकालें। (5) यूरिया न डालें। (6) MOP 20 किग्रा/हे जल निकासी बाद। बाद में: (7) 2% यूरिया + 1% KCl स्प्रे। (8) तांबा फफूंदनाशक। बाढ़ सहनशील धान: स्वर्णा Sub-1।",
    tags: ["waterlogging", "heavy rain", "drainage", "monsoon", "flood"],
    priority: "high",
    season: ["Kharif"],
    region: ["All India"]
  },
  {
    id: "kcc_020",
    category: "Weather Advisory",
    subcategory: "Heat Wave",
    question: "How to protect crops from heat wave?",
    questionHindi: "लू (गर्मी की लहर) से फसल कैसे बचाएं?",
    answer: "Heat wave crop protection: WHEAT (terminal heat): (1) Light irrigation at grain filling stage. (2) Spray KCl 0.5% + Thiourea 500ppm at heading. (3) Avoid late nitrogen. VEGETABLES: (4) Mulch with straw/grass (5-7 cm) to keep soil cool. (5) Kaolin spray 6% for heat reflection. (6) Irrigate in evening, not mid-day. (7) Use shade nets (35-50%) for nursery. GENERAL: (8) White-wash tree trunks (fruit trees). (9) Apply anti-transpirant sprays. (10) Increase irrigation frequency but reduce quantity per irrigation. (11) Harvest mature crops early. LONG-TERM: Use heat-tolerant varieties (wheat: HD 3298, HD 3226; rice: Sahbhagi).",
    answerHindi: "लू से बचाव: गेहूं: (1) दाना भरते समय हल्की सिंचाई। (2) KCl 0.5% + Thiourea 500ppm स्प्रे। सब्जियां: (3) पलवार बिछाएं 5-7 सेमी। (4) शाम को सिंचाई। (5) शेड नेट 35-50%। सामान्य: (6) पेड़ तने पर चूना। (7) सिंचाई बढ़ाएं, मात्रा कम। (8) पकी फसल जल्दी काटें। गर्मी सहनशील किस्में: गेहूं HD 3298, धान Sahbhagi।",
    tags: ["heat wave", "terminal heat", "mulching", "heat stress"],
    priority: "high",
    season: ["Rabi", "Summer"],
    region: ["All India"]
  },

  // ==================== ANIMAL HUSBANDRY ====================
  {
    id: "kcc_021",
    category: "Animal Husbandry",
    subcategory: "Dairy",
    question: "What is a balanced ration for dairy cattle giving 10 liters milk?",
    questionHindi: "10 लीटर दूध देने वाली गाय/भैंस का संतुलित आहार क्या है?",
    answer: "Balanced ration for 10L milk/day (400 kg crossbred cow): 1) MAINTENANCE: Dry fodder (wheat straw/paddy straw) 5-6 kg + Green fodder (berseem/lucerne/napier) 15-20 kg. 2) PRODUCTION RATION: Concentrate mix @ 1 kg per 2.5 L milk above maintenance (3 L). So: 3 kg concentrate needed. 3) CONCENTRATE MIX: Maize/Barley 35% + Mustard cake/Soybean meal 30% + Wheat bran 25% + Mineral mixture 2% + Salt 1% + Calcite powder 2%. 4) ADD: Mineral mixture 50g/day + Common salt 30g/day. 5) Clean water ad libitum (40-60 L/day). 6) For buffalo: 20% more concentrate needed for same milk.",
    answerHindi: "10 ली दूध (400 किग्रा गाय): रख-रखाव: सूखा चारा 5-6 किग्रा + हरा चारा 15-20 किग्रा। उत्पादन: दाना मिश्रण 1 किग्रा / 2.5 ली दूध = 3 किग्रा दाना। दाना: मक्का 35% + खली 30% + चोकर 25% + खनिज मिश्रण 2% + नमक 1% + कैल्शियम 2%। खनिज 50 ग्राम/दिन। स्वच्छ पानी 40-60 ली/दिन।",
    tags: ["dairy", "cattle", "feed", "ration", "milk"],
    priority: "medium",
    region: ["All India"]
  },

  // ==================== POST-HARVEST ====================
  {
    id: "kcc_022",
    category: "Post-Harvest",
    subcategory: "Storage",
    question: "How to store wheat safely to prevent insect damage?",
    questionHindi: "गेहूं को कीड़ों से बचाकर सुरक्षित कैसे भंडारित करें?",
    answer: "Safe wheat storage: DRYING: (1) Dry grain to 12% moisture (bite test: grain breaks with cracking sound). CLEANING: (2) Clean and winnow to remove chaff, broken grains, dirt. TREATMENT: (3) Apply Aluminium Phosphide (Celphos) tablets @ 3 tablets per tonne in airtight containers OR (4) Safer option: Deltamethrin 2.5% WP dust @ 40g per quintal (mix thoroughly). STORAGE: (5) Keep on wooden pallets (not directly on floor). (6) Store in airtight metal bins (Pusa bin) or improved kothi. (7) Leave 2-feet gap between wall and bags. (8) Periodically check: If temperature rises, re-fumigate. TRADITIONAL: Neem leaves between layers, sun-dry every 2-3 months. GOVERNMENT: Store at nearest FCI/CWC godown through licensed warehouse receipts.",
    answerHindi: "गेहूं भंडारण: सुखाना: 12% नमी (दांत से तोड़ने पर कड़क आवाज)। सफाई: छानना/फटकना। उपचार: Celphos 3 गोली/टन या Deltamethrin @ 40 ग्राम/क्विंटल। भंडारण: लकड़ी के तख्ते पर, पूसा बिन/धातु कोठी में, दीवार से 2 फीट दूर। जांच: तापमान बढ़े तो पुनः उपचार। पारंपरिक: नीम पत्ती, 2-3 महीने में धूप।",
    tags: ["storage", "wheat", "grain", "insect", "fumigation"],
    priority: "medium",
    season: ["Rabi"],
    region: ["All India"]
  },

  // ==================== SOIL MANAGEMENT ====================
  {
    id: "kcc_023",
    category: "Soil Management",
    subcategory: "Soil Testing",
    question: "How to collect soil sample properly for testing?",
    questionHindi: "मिट्टी जांच के लिए नमूना सही तरीके से कैसे लें?",
    answer: "Correct soil sampling method: TIMING: After harvest, before sowing. Dry field preferred. TOOLS: Khurpi/auger/shovel. METHOD: (1) Divide field into uniform areas (separate sample for each soil type/color). (2) Make V-shaped cut 15 cm (6 inches) deep at 15-20 random spots in zigzag pattern. (3) Take thin slice from one side of V cut. (4) Collect all slices in clean plastic bucket. (5) Mix thoroughly, remove stones/roots. (6) Take 500g sample by quartering (divide into 4, take opposite 2, repeat). (7) Dry in SHADE (not sun). (8) Pack in clean cloth/plastic bag. LABEL: Farmer name, village, survey number, crop grown, date. DO NOT: Sample near bunds, trees, manure heaps, irrigation channels.",
    answerHindi: "मिट्टी नमूना विधि: समय: कटाई बाद, बुवाई पूर्व। विधि: (1) समान क्षेत्र अलग करें। (2) 15-20 जगह ज़िगज़ैग में V-आकार कट 15 सेमी गहरा। (3) पतली पर्त लें। (4) साफ बाल्टी में मिलाएं। (5) पत्थर/जड़ निकालें। (6) चतुर्थांश विधि से 500 ग्राम लें। (7) छाया में सुखाएं। (8) लेबल: नाम, गांव, सर्वे नं, फसल, तिथि। न करें: बांध/पेड़/खाद ढेर के पास से न लें।",
    tags: ["soil sampling", "soil testing", "sample collection", "soil health"],
    priority: "medium",
    region: ["All India"]
  },
  {
    id: "kcc_024",
    category: "Soil Management",
    subcategory: "Salinity",
    question: "How to reclaim saline/alkaline (usar) soil?",
    questionHindi: "ऊसर (लवणीय/क्षारीय) मिट्टी का सुधार कैसे करें?",
    answer: "Usar/saline-alkaline soil reclamation: FOR ALKALI SOIL (pH >8.5): (1) Apply Gypsum based on soil test: typically 5-10 tonnes/ha. (2) Apply after monsoon, mix into top 15 cm. (3) Flood with water to leach salts. (4) Install subsurface drainage if waterlogged. (5) First crop: Rice (most tolerant). Varieties: CSR 30, CSR 36, CSR 46. (6) Add organic matter (FYM 10-15 t/ha) annually. (7) Include Dhaincha (Sesbania) green manure. FOR SALINE SOIL (high EC): (1) Leach with good quality water. (2) Raised bed cultivation. (3) Mulching to reduce evaporation. (4) Select salt-tolerant crops: Barley > wheat > rice. (5) Furrow irrigation (reduces salt accumulation on ridges). LONG-TERM: Grow dhaincha → rice rotation for 3-4 years to fully reclaim.",
    answerHindi: "ऊसर सुधार: क्षारीय (pH >8.5): (1) जिप्सम 5-10 टन/हे मिट्टी जांच अनुसार। (2) मानसून बाद, ऊपरी 15 सेमी में मिलाएं। (3) पानी से लवण धोएं। (4) पहली फसल: धान (CSR 30, 36, 46)। (5) गोबर खाद 10-15 टन/हे। (6) ढैंचा हरी खाद। लवणीय (अधिक EC): (1) अच्छे पानी से धोएं। (2) उठी क्यारी। (3) पलवार। (4) जौ > गेहूं > धान (सहनशीलता क्रम)।",
    tags: ["saline soil", "alkaline", "usar", "gypsum", "reclamation"],
    priority: "medium",
    region: ["Uttar Pradesh", "Haryana", "Rajasthan", "Gujarat", "Punjab"]
  },

  // ==================== WATER MANAGEMENT ====================
  {
    id: "kcc_025",
    category: "Water Management",
    subcategory: "Rainwater Harvesting",
    question: "How to do rainwater harvesting in farm?",
    questionHindi: "खेत में वर्षा जल संचयन कैसे करें?",
    answer: "Farm rainwater harvesting techniques: (1) FARM POND: Dig 20×20×3m pond at lowest point of farm. Line with plastic sheet or clay. Collect runoff from 1-2 hectares. Stores 600-1200 cubic meters. Cost: ₹50,000-1,00,000. 60% subsidy under PMKSY. (2) CONTOUR BUNDING: Make earthen bunds along contours to reduce runoff and increase infiltration. (3) CHECK DAMS: Small stone/cement structures across seasonal streams. (4) RECHARGE PIT: 1×1×3m pit filled with gravel + sand near borewell. Recharges groundwater. (5) ROOFTOP: Collect from farm building roof into tank. (6) PERCOLATION TANK: For community level. BENEFITS: One farm pond can irrigate 1-2 hectares for one season. Reduces dependency on borewells 40-60%.",
    answerHindi: "खेत में वर्षा जल संचयन: (1) फार्म पौंड: 20×20×3 मीटर, प्लास्टिक/मिट्टी लाइन, 600-1200 घन मीटर जल, ₹50,000-1,00,000, PMKSY से 60% सब्सिडी। (2) कंटूर बंडिंग: समोच्च रेखा पर मेड़। (3) चेक डैम: नालों पर छोटे बांध। (4) रिचार्ज पिट: 1×1×3 मीटर बजरी+रेत। (5) छत से संग्रह। लाभ: एक पौंड से 1-2 हेक्टेयर सिंचाई।",
    tags: ["rainwater harvesting", "farm pond", "water conservation", "PMKSY"],
    priority: "medium",
    region: ["All India"]
  },

  // ==================== HORTICULTURE ====================
  {
    id: "kcc_026",
    category: "Horticulture",
    subcategory: "Fruit",
    question: "Which fruit trees are best for semi-arid regions?",
    questionHindi: "अर्ध-शुष्क क्षेत्रों के लिए कौन से फल वृक्ष सबसे अच्छे हैं?",
    answer: "Best fruit trees for semi-arid regions (<700mm rainfall): (1) POMEGRANATE (Anar): Bhagwa/Ganesh variety. Income ₹3-5 lakh/acre. Needs 60-80 cm rainfall. Starts fruiting in 2-3 years. (2) GUAVA (Amrud): Allahabad Safeda, Lucknow 49. Hardy, ₹1-2 lakh/acre. (3) BER (Indian Jujube): Seb/Gola/Umran. Extremely drought tolerant. ₹60,000-1 lakh/acre. (4) AONLA (Indian Gooseberry): NA-7, Krishna. Deep rooted, drought resistant. Good processing demand. (5) CUSTARD APPLE (Sitaphal): Arka Sahan. Good for dry lands. (6) FIG (Anjeer): Deanna/Poona. Very drought resistant, premium market price ₹200-400/kg. SUBSIDY: 40-75% under NHM (National Horticulture Mission) for fruit orchards.",
    answerHindi: "अर्ध-शुष्क फल: (1) अनार: भगवा, ₹3-5 लाख/एकड़। (2) अमरूद: इलाहाबाद सफेदा, ₹1-2 लाख/एकड़। (3) बेर: सेब/उमरान, अत्यधिक सूखा सहनशील। (4) आंवला: NA-7, गहरी जड़ें। (5) सीताफल: अर्का सहन। (6) अंजीर: ₹200-400/किग्रा प्रीमियम। NHM से 40-75% सब्सिडी।",
    tags: ["fruit trees", "semi-arid", "pomegranate", "guava", "drought tolerant"],
    priority: "medium",
    region: ["Rajasthan", "Maharashtra", "Gujarat", "Karnataka", "Andhra Pradesh"]
  },

  // ==================== TECHNOLOGY ====================
  {
    id: "kcc_027",
    category: "Technology",
    subcategory: "Precision Farming",
    question: "What mobile apps are useful for Indian farmers?",
    questionHindi: "भारतीय किसानों के लिए कौन से मोबाइल ऐप्स उपयोगी हैं?",
    answer: "Useful mobile apps for farmers: GOVERNMENT: (1) Kisan Suvidha: Weather, market prices, plant protection, agro-advisories. (2) PM Kisan: Check PM-KISAN status, beneficiary list. (3) eNAM: Online market prices, buyer-seller platform. (4) Crop Insurance (PMFBY): Apply for crop insurance, track claims. (5) Soil Health Card: View soil test results. (6) Kisan Rath: Find transport for produce. (7) Damini: Lightning alert system. (8) Meghdoot/Mausam: IMD weather forecast. PRIVATE: (9) Plantix: AI crop disease detection from photos. (10) DeHaat: Farm inputs + market linkage. (11) Ninjacart/BigBasket: Direct-to-consumer selling. (12) CropIn: Smart farming analytics. HELPLINE: Kisan Call Centre 1800-180-1551 (toll free).",
    answerHindi: "किसान ऐप्स: सरकारी: (1) किसान सुविधा: मौसम, बाजार भाव। (2) PM किसान: स्थिति जांचें। (3) eNAM: ऑनलाइन मंडी। (4) PMFBY: फसल बीमा। (5) मृदा स्वास्थ्य कार्ड। (6) किसान रथ: परिवहन। (7) दामिनी: बिजली चेतावनी। निजी: (8) Plantix: फोटो से रोग पहचान। (9) DeHaat: इनपुट + बाजार। हेल्पलाइन: 1800-180-1551।",
    tags: ["mobile app", "technology", "kisan suvidha", "eNAM", "Plantix"],
    priority: "low",
    region: ["All India"]
  },

  // ==================== FINANCIAL ====================
  {
    id: "kcc_028",
    category: "Financial",
    subcategory: "Credit",
    question: "How to get Kisan Credit Card (KCC) loan?",
    questionHindi: "किसान क्रेडिट कार्ड (KCC) कैसे प्राप्त करें?",
    answer: "Kisan Credit Card (KCC): ELIGIBILITY: Farmers, tenant farmers, sharecroppers, SHGs, fishermen, animal husbandry farmers. CREDIT LIMIT: Based on land + crop (Scale of Finance × Area + 10% post-harvest + 20% consumption). Typically ₹1-3 lakh for small farmers. INTEREST: 7% p.a. with 3% subvention = effective 4% if repaid within 1 year. HOW TO APPLY: (1) Visit nearest bank (cooperative/RRB/commercial). (2) Fill KCC application form. (3) Documents: Land records (7/12 extract), Aadhaar, passport photos, cropping pattern declaration. (4) PM-KISAN beneficiaries get simplified process. (5) Card valid for 5 years, reviewed annually. INSURANCE: Free ₹50,000 accidental death + ₹25,000 permanent disability under KCC.",
    answerHindi: "KCC: पात्रता: किसान, बटाईदार, SHG, मछुआरे, पशुपालक। सीमा: भूमि+फसल आधारित, ₹1-3 लाख। ब्याज: 7% - 3% छूट = 4% (1 वर्ष में भुगतान पर)। आवेदन: नजदीकी बैंक, भूमि रिकॉर्ड + आधार + फोटो। PM-KISAN लाभार्थियों के लिए सरल प्रक्रिया। बीमा: ₹50,000 दुर्घटना मृत्यु।",
    tags: ["KCC", "kisan credit card", "loan", "bank", "interest"],
    priority: "high",
    region: ["All India"]
  },

  // ==================== EMERGENCY ====================
  {
    id: "kcc_029",
    category: "Emergency",
    subcategory: "Locust",
    question: "What to do if locust swarm attacks my field?",
    questionHindi: "अगर टिड्डी दल मेरे खेत पर हमला करे तो क्या करें?",
    answer: "Locust swarm emergency response: IMMEDIATE: (1) Report to district agriculture office / Locust Warning Organisation (LWO) helpline. (2) Make loud noise - beat drums/utensils, use tractor horn to scare swarm. (3) Light fires with moist material (smoke deters locusts). (4) If settled at night: Spray Malathion 96% ULV @ 925 ml/ha using tractor-mounted sprayers at dawn. (5) Alternative: Chlorpyrifos 50% EC @ 1.5 L/ha or Lambda-cyhalothrin 5% EC @ 400 ml/ha. (6) For small areas: Dust BHC/Carbaryl. COMPENSATION: Report to block office within 48 hours for SDRF compensation. Photograph damage. PREVENTION: Monitor LWO alerts at locustalert.in. Desert locust breeds in Rajasthan border areas May-July.",
    answerHindi: "टिड्डी आपातकाल: तुरंत: (1) जिला कृषि कार्यालय/LWO को सूचित करें। (2) शोर करें - ढोल/बर्तन बजाएं, ट्रैक्टर हॉर्न। (3) गीले पदार्थ से आग (धुआं)। (4) रात बैठे तो सुबह Malathion 96% ULV @ 925 मिली/हे स्प्रे। (5) या Chlorpyrifos @ 1.5 ली/हे। मुआवजा: 48 घंटे में ब्लॉक ऑफिस में रिपोर्ट। फोटो लें। locustalert.in पर अलर्ट देखें।",
    tags: ["locust", "emergency", "swarm", "pest attack", "malathion"],
    priority: "high",
    season: ["Kharif", "Summer"],
    region: ["Rajasthan", "Gujarat", "Madhya Pradesh", "Punjab", "Haryana"]
  },
  {
    id: "kcc_030",
    category: "Emergency",
    subcategory: "Hailstorm",
    question: "What to do after hailstorm damages crops?",
    questionHindi: "ओलावृष्टि से फसल नुकसान के बाद क्या करें?",
    answer: "Post-hailstorm crop management: IMMEDIATE (0-24 hours): (1) Take photos/videos of damage from multiple angles. (2) Report to PMFBY insurance within 72 hours (app/14447/bank). (3) Report to village panchayat/block office for SDRF compensation. CROP RECOVERY: (4) If crop is partially damaged: spray urea 2% + KCl 0.5% foliar for recovery. (5) Apply Mancozeb 2.5g/L to prevent secondary fungal infections on wounds. (6) For wheat at milking/dough stage: if >50% damage, consider harvesting for fodder. (7) For vegetables: remove broken parts, apply copper fungicide. (8) Give light irrigation to revive stressed plants. (9) If crop total loss: sow short-duration catch crop (moong/toria/vegetables). DOCUMENTS: Get girdawari/crop survey report from patwari for compensation claim.",
    answerHindi: "ओलावृष्टि बाद: तुरंत: (1) फोटो/वीडियो लें। (2) 72 घंटे में PMFBY बीमा सूचित करें (14447)। (3) पंचायत/ब्लॉक रिपोर्ट। फसल सुधार: (4) 2% यूरिया + 0.5% KCl स्प्रे। (5) Mancozeb 2.5 ग्राम/ली फफूंद रोकथाम। (6) गेहूं >50% नुकसान: चारे के लिए काटें। (7) कुल नुकसान: मूंग/तोरिया बोएं। पटवारी से गिरदावरी रिपोर्ट लें।",
    tags: ["hailstorm", "crop damage", "insurance", "compensation", "recovery"],
    priority: "high",
    season: ["Rabi"],
    region: ["All India"]
  }
];

// ============ HELPER FUNCTIONS ============

export const getQueriesByCategory = (category: string): KCCQuery[] =>
  kisanCallCenterData.filter(q => q.category.toLowerCase() === category.toLowerCase());

export const getQueriesByCrop = (crop: string): KCCQuery[] =>
  kisanCallCenterData.filter(q => q.crop?.toLowerCase() === crop.toLowerCase());

export const searchKCCQueries = (query: string): KCCQuery[] => {
  const q = query.toLowerCase();
  return kisanCallCenterData.filter(kcc =>
    kcc.question.toLowerCase().includes(q) ||
    kcc.answer.toLowerCase().includes(q) ||
    kcc.tags.some(t => t.toLowerCase().includes(q)) ||
    kcc.questionHindi.includes(query) ||
    kcc.category.toLowerCase().includes(q)
  );
};

export const getHighPriorityQueries = (): KCCQuery[] =>
  kisanCallCenterData.filter(q => q.priority === "high");

export const getQueriesByRegion = (region: string): KCCQuery[] =>
  kisanCallCenterData.filter(q =>
    q.region?.some(r => r.toLowerCase() === region.toLowerCase() || r === "All India")
  );

export const getKCCCategories = (): string[] =>
  [...new Set(kisanCallCenterData.map(q => q.category))];
