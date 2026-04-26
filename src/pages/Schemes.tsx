import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useToast } from "@/hooks/use-toast";
import {
  PHASE1_STORAGE_EVENT,
  SchemeWizardProfile,
  getSchemeWizardState,
  saveSchemeWizardState,
} from "@/lib/phase1-storage";
import { apiFetch } from "@/lib/api";
import {
  Award,
  Building2,
  Calendar,
  CheckCircle2,
  DollarSign,
  FileSearch,
  FileText,
  Filter,
  Heart,
  Info,
  Link as LinkIcon,
  MapPin,
  Search,
  ShieldCheck,
  ShieldQuestion,
  Sprout,
  Users,
  Wheat,
} from "lucide-react";

type SchemeCategory = "subsidy" | "loan" | "insurance" | "training" | "equipment";
type SchemeStatus = "active" | "ending_soon" | "upcoming";

interface Scheme {
  id: string;
  title: string;
  description: string;
  category: SchemeCategory;
  amount: string;
  eligibility: string[];
  deadline: string;
  status: SchemeStatus;
  state: string;
  documents: string[];
  targetFarmerTypes: SchemeWizardProfile["farmerType"][];
  interestFocus: SchemeWizardProfile["interestedIn"][];
  irrigationNeeds: SchemeWizardProfile["irrigationNeed"][];
  minLandHolding?: number;
  maxLandHolding?: number;
  requiresDocuments?: boolean;
  cropFocus?: string[];
  applyUrl: string;
  learnMoreUrl: string;
}

interface SchemeRecommendation {
  isEligible: boolean;
  score: number;
  reasons: string[];
  blockers: string[];
}

interface AiSchemeMatch {
  name: string;
  hindi_name?: string;
  benefit?: string;
  eligibility?: string;
  how_to_apply?: string;
  deadline?: string;
}

const schemeCatalog: Scheme[] = [
  {
    id: "pm-kisan",
    title: "PM-KISAN Samman Nidhi",
    description: "Direct income support of ₹6,000 per year to farmer families with cultivable land.",
    category: "subsidy",
    amount: "₹6,000/year",
    eligibility: ["Land records required", "Small, marginal, and regular cultivators", "Best for income support"],
    deadline: "Ongoing enrollment",
    status: "active",
    state: "All India",
    documents: ["Aadhaar Card", "Land Records", "Bank Details"],
    targetFarmerTypes: ["marginal", "small", "large"],
    interestFocus: ["income"],
    irrigationNeeds: ["low", "medium", "high"],
    maxLandHolding: 25,
    requiresDocuments: true,
    cropFocus: ["all"],
    applyUrl: "https://pmkisan.gov.in/RegistrationFormnew.aspx",
    learnMoreUrl: "https://pmkisan.gov.in/",
  },
  {
    id: "pmfby",
    title: "Pradhan Mantri Fasal Bima Yojana",
    description: "Crop insurance protection against yield loss, weather shocks, and localized calamities.",
    category: "insurance",
    amount: "Up to ₹2 lakh",
    eligibility: ["Seasonal enrollment", "Useful for weather-sensitive crops", "Individual and tenant farmers can benefit"],
    deadline: "Seasonal cut-off applies",
    status: "active",
    state: "All India",
    documents: ["Aadhaar Card", "Land Records / Cultivation Proof", "Sowing Certificate"],
    targetFarmerTypes: ["marginal", "small", "large", "tenant"],
    interestFocus: ["insurance"],
    irrigationNeeds: ["low", "medium", "high"],
    requiresDocuments: true,
    cropFocus: ["all"],
    applyUrl: "https://pmfby.gov.in/",
    learnMoreUrl: "https://pmfby.gov.in/",
  },
  {
    id: "kcc",
    title: "Kisan Credit Card",
    description: "Working capital credit line for crops, allied activities, and seasonal farm cash flow needs.",
    category: "loan",
    amount: "Based on scale of finance",
    eligibility: ["Farmers, tenant farmers, and allied activity households", "Useful for short-term credit"],
    deadline: "Ongoing",
    status: "active",
    state: "All India",
    documents: ["Aadhaar Card", "Land Records", "Cropping Pattern Declaration"],
    targetFarmerTypes: ["marginal", "small", "large", "tenant"],
    interestFocus: ["credit", "income"],
    irrigationNeeds: ["low", "medium", "high"],
    requiresDocuments: true,
    cropFocus: ["all"],
    applyUrl: "https://www.myscheme.gov.in/schemes/kcc",
    learnMoreUrl: "https://www.myscheme.gov.in/schemes/kcc",
  },
  {
    id: "agri-infra-fund",
    title: "Agriculture Infrastructure Fund",
    description: "Medium-to-large financing support for post-harvest, storage, logistics, and aggregation assets.",
    category: "loan",
    amount: "₹1 lakh - ₹2 crore",
    eligibility: ["FPOs, cooperatives, and scale-ready farmers", "Project report required"],
    deadline: "Rolling applications",
    status: "active",
    state: "All India",
    documents: ["Project Report", "Entity Registration", "Land / Lease Documents"],
    targetFarmerTypes: ["large", "fpo"],
    interestFocus: ["credit", "equipment", "income"],
    irrigationNeeds: ["low", "medium", "high"],
    minLandHolding: 2,
    requiresDocuments: true,
    cropFocus: ["all"],
    applyUrl: "https://agriinfra.dac.gov.in/",
    learnMoreUrl: "https://agriinfra.dac.gov.in/",
  },
  {
    id: "solar-pump",
    title: "PM-KUSUM Solar Pump Subsidy",
    description: "Support for solar irrigation pumps to reduce diesel or unreliable grid dependence under PM-KUSUM scheme.",
    category: "equipment",
    amount: "40% - 60% subsidy",
    eligibility: ["Irrigation need should be medium or high", "Technical feasibility required"],
    deadline: "State window based",
    status: "active",
    state: "All India",
    documents: ["Electricity Bill", "Land Records", "Water Source Details"],
    targetFarmerTypes: ["marginal", "small", "large"],
    interestFocus: ["equipment"],
    irrigationNeeds: ["medium", "high"],
    requiresDocuments: true,
    cropFocus: ["all"],
    applyUrl: "https://pmkusum.mnre.gov.in/landing.html",
    learnMoreUrl: "https://mnre.gov.in/pm-kusum/",
  },
  {
    id: "pmksy-micro-irrigation",
    title: "PM Krishi Sinchai Yojana — Micro Irrigation",
    description: "Drip and sprinkler support for water-saving irrigation systems and better field efficiency.",
    category: "equipment",
    amount: "Up to 55% assistance",
    eligibility: ["Best for farmers with medium or high irrigation demand", "Useful for horticulture and row crops"],
    deadline: "State implementation cycle",
    status: "active",
    state: "All India",
    documents: ["Aadhaar Card", "Land Records", "Bank Details", "Quotation / Layout Plan"],
    targetFarmerTypes: ["marginal", "small", "large", "tenant"],
    interestFocus: ["equipment", "income"],
    irrigationNeeds: ["medium", "high"],
    requiresDocuments: true,
    cropFocus: ["tomato", "cotton", "sugarcane", "vegetables", "all"],
    applyUrl: "https://pmksy.gov.in/",
    learnMoreUrl: "https://pmksy.gov.in/",
  },
  {
    id: "soil-health-card",
    title: "Soil Health Card Scheme",
    description: "Free soil testing and fertilizer guidance to improve productivity and nutrient-use efficiency.",
    category: "training",
    amount: "Advisory support",
    eligibility: ["Available to all cultivators", "Strong fit for yield improvement planning"],
    deadline: "Field sampling cycle based",
    status: "active",
    state: "All India",
    documents: ["Aadhaar Card", "Field Details"],
    targetFarmerTypes: ["marginal", "small", "large", "tenant", "fpo"],
    interestFocus: ["training", "income"],
    irrigationNeeds: ["low", "medium", "high"],
    requiresDocuments: false,
    cropFocus: ["all"],
    applyUrl: "https://soilhealth.dac.gov.in/",
    learnMoreUrl: "https://soilhealth.dac.gov.in/",
  },
  {
    id: "fpo-capacity",
    title: "FPO Formation & Promotion (10,000 FPOs)",
    description: "Central scheme for formation and promotion of 10,000 Farmer Producer Organizations with equity grants and capacity building.",
    category: "training",
    amount: "Up to ₹18 lakh/FPO equity grant",
    eligibility: ["For Farmer Producer Organizations and collectives", "Useful for scaling market access"],
    deadline: "Program dependent",
    status: "active",
    state: "All India",
    documents: ["Registration Certificate", "Board Resolution", "Bank Details"],
    targetFarmerTypes: ["fpo"],
    interestFocus: ["training", "income", "credit"],
    irrigationNeeds: ["low", "medium", "high"],
    requiresDocuments: true,
    cropFocus: ["all"],
    applyUrl: "https://www.sfacindia.com/FPOS.aspx",
    learnMoreUrl: "https://www.sfacindia.com/FPOS.aspx",
  },
  // --- NEW SCHEMES ---
  {
    id: "enam",
    title: "e-NAM — National Agriculture Market",
    description: "Unified online trading platform connecting APMC mandis across India for transparent price discovery and better returns.",
    category: "subsidy",
    amount: "Free registration",
    eligibility: ["All farmers with produce to sell", "Linked to registered APMC mandis", "Aadhaar & bank account needed"],
    deadline: "Ongoing",
    status: "active",
    state: "All India",
    documents: ["Aadhaar Card", "Bank Details", "Mandi License (if trader)"],
    targetFarmerTypes: ["marginal", "small", "large", "tenant", "fpo"],
    interestFocus: ["income"],
    irrigationNeeds: ["low", "medium", "high"],
    requiresDocuments: true,
    cropFocus: ["all"],
    applyUrl: "https://enam.gov.in/web/stakeholder-registration/farmer-registration",
    learnMoreUrl: "https://enam.gov.in/web/",
  },
  {
    id: "nfsm",
    title: "National Food Security Mission (NFSM)",
    description: "Increases production of rice, wheat, pulses, coarse cereals and commercial crops through area expansion and productivity enhancement.",
    category: "subsidy",
    amount: "Varies by component",
    eligibility: ["Farmers growing rice, wheat, pulses, millets", "State-wise component allocation"],
    deadline: "Seasonal",
    status: "active",
    state: "All India",
    documents: ["Aadhaar Card", "Land Records", "Bank Details"],
    targetFarmerTypes: ["marginal", "small", "large"],
    interestFocus: ["income", "training"],
    irrigationNeeds: ["low", "medium", "high"],
    requiresDocuments: true,
    cropFocus: ["wheat", "rice", "pulses", "maize", "all"],
    applyUrl: "https://www.nfsm.gov.in/",
    learnMoreUrl: "https://www.nfsm.gov.in/",
  },
  {
    id: "pkvy",
    title: "Paramparagat Krishi Vikas Yojana (PKVY)",
    description: "Promotes organic farming through cluster approach with ₹50,000/ha support over 3 years for certification, inputs, and marketing.",
    category: "subsidy",
    amount: "₹50,000/ha over 3 years",
    eligibility: ["Clusters of 50+ farmers with 50 acre minimum", "Organic farming commitment required"],
    deadline: "State cycle based",
    status: "active",
    state: "All India",
    documents: ["Aadhaar Card", "Land Records", "Group Formation Proof"],
    targetFarmerTypes: ["marginal", "small", "large", "fpo"],
    interestFocus: ["training", "income"],
    irrigationNeeds: ["low", "medium", "high"],
    requiresDocuments: true,
    cropFocus: ["all"],
    applyUrl: "https://pgsindia-ncof.gov.in/pkvy/Index.aspx",
    learnMoreUrl: "https://pgsindia-ncof.gov.in/pkvy/Index.aspx",
  },
  {
    id: "smam",
    title: "Sub-Mission on Agricultural Mechanization (SMAM)",
    description: "Subsidy on farm machinery and equipment including tractors, harvesters, tillers, and custom hiring centres.",
    category: "equipment",
    amount: "25% - 80% subsidy",
    eligibility: ["All farmer categories", "SC/ST/women get higher subsidy", "Custom Hiring Centres eligible"],
    deadline: "Ongoing",
    status: "active",
    state: "All India",
    documents: ["Aadhaar Card", "Land Records", "Bank Details", "Caste Certificate (if applicable)"],
    targetFarmerTypes: ["marginal", "small", "large", "fpo"],
    interestFocus: ["equipment", "income"],
    irrigationNeeds: ["low", "medium", "high"],
    requiresDocuments: true,
    cropFocus: ["all"],
    applyUrl: "https://agrimachinery.nic.in/",
    learnMoreUrl: "https://agrimachinery.nic.in/",
  },
  {
    id: "atma",
    title: "Agricultural Technology Management Agency (ATMA)",
    description: "District-level extension services providing training, demonstrations, exposure visits, and technology dissemination to farmers.",
    category: "training",
    amount: "Free training & exposure visits",
    eligibility: ["All farmers", "Focus on technology adoption", "State agriculture department implements"],
    deadline: "Ongoing",
    status: "active",
    state: "All India",
    documents: ["Aadhaar Card", "Farm Details"],
    targetFarmerTypes: ["marginal", "small", "large", "tenant"],
    interestFocus: ["training"],
    irrigationNeeds: ["low", "medium", "high"],
    requiresDocuments: false,
    cropFocus: ["all"],
    applyUrl: "https://www.myscheme.gov.in/schemes/atma",
    learnMoreUrl: "https://extensionreforms.dacnet.nic.in/",
  },
  {
    id: "nmsa",
    title: "National Mission for Sustainable Agriculture (NMSA)",
    description: "Promotes climate-resilient agriculture through soil health management, rainfed area development, and agroforestry.",
    category: "training",
    amount: "Component-wise assistance",
    eligibility: ["Rainfed area farmers", "Climate-vulnerable regions", "All farmer categories"],
    deadline: "State implementation cycle",
    status: "active",
    state: "All India",
    documents: ["Aadhaar Card", "Land Records", "Bank Details"],
    targetFarmerTypes: ["marginal", "small", "large", "tenant"],
    interestFocus: ["training", "income"],
    irrigationNeeds: ["low", "medium"],
    requiresDocuments: true,
    cropFocus: ["all"],
    applyUrl: "https://nmsa.dac.gov.in/",
    learnMoreUrl: "https://nmsa.dac.gov.in/",
  },
  {
    id: "rkvy",
    title: "Rashtriya Krishi Vikas Yojana — RAFTAAR",
    description: "Flexibly funded scheme for states to develop agriculture and allied sectors with agri-startups, infrastructure, and innovation.",
    category: "subsidy",
    amount: "Project-based funding",
    eligibility: ["State government proposals", "Agri-entrepreneurs and startups", "Innovation projects"],
    deadline: "State proposal cycle",
    status: "active",
    state: "All India",
    documents: ["Project Proposal", "Entity Registration", "Bank Details"],
    targetFarmerTypes: ["large", "fpo"],
    interestFocus: ["credit", "income", "equipment"],
    irrigationNeeds: ["low", "medium", "high"],
    minLandHolding: 1,
    requiresDocuments: true,
    cropFocus: ["all"],
    applyUrl: "https://rkvy.nic.in/",
    learnMoreUrl: "https://rkvy.nic.in/",
  },
  {
    id: "midh",
    title: "Mission for Integrated Development of Horticulture (MIDH)",
    description: "Comprehensive support for horticulture crops — fruits, vegetables, spices, flowers — including planting material, cold storage, and marketing.",
    category: "subsidy",
    amount: "Up to 50% cost assistance",
    eligibility: ["Horticulture crop growers", "Nurseries, cold storages, food processing units"],
    deadline: "State implementation cycle",
    status: "active",
    state: "All India",
    documents: ["Aadhaar Card", "Land Records", "Project Report (for infrastructure)"],
    targetFarmerTypes: ["marginal", "small", "large", "fpo"],
    interestFocus: ["income", "equipment"],
    irrigationNeeds: ["medium", "high"],
    requiresDocuments: true,
    cropFocus: ["tomato", "onion", "potato", "muskmelon", "vegetables", "all"],
    applyUrl: "https://midh.gov.in/",
    learnMoreUrl: "https://midh.gov.in/",
  },
  {
    id: "dairy-entrepreneurship",
    title: "Dairy Entrepreneurship Development Scheme (DEDS)",
    description: "Capital subsidy for establishing small dairy farms, purchase of milch animals, milk processing units, and dairy parlours.",
    category: "loan",
    amount: "25% - 33% back-ended subsidy",
    eligibility: ["Farmers, SHGs, and entrepreneurs", "Dairy and animal husbandry focus", "Bank loan required"],
    deadline: "Ongoing via NABARD",
    status: "active",
    state: "All India",
    documents: ["Aadhaar Card", "Bank Loan Sanction", "Project Report"],
    targetFarmerTypes: ["marginal", "small", "large"],
    interestFocus: ["credit", "income"],
    irrigationNeeds: ["low", "medium", "high"],
    requiresDocuments: true,
    cropFocus: ["all"],
    applyUrl: "https://www.nabard.org/content1.aspx?id=591&catid=8&mid=488",
    learnMoreUrl: "https://www.nabard.org/content1.aspx?id=591&catid=8&mid=488",
  },
  {
    id: "pmjdy",
    title: "Pradhan Mantri Jan Dhan Yojana",
    description: "Zero-balance bank account with RuPay debit card, accident insurance of ₹2 lakh, and overdraft facility up to ₹10,000.",
    category: "subsidy",
    amount: "₹2 lakh accident insurance + ₹10,000 OD",
    eligibility: ["All Indian citizens without bank account", "Essential for DBT and PM-KISAN benefits"],
    deadline: "Ongoing",
    status: "active",
    state: "All India",
    documents: ["Aadhaar Card", "Any ID Proof"],
    targetFarmerTypes: ["marginal", "small", "large", "tenant"],
    interestFocus: ["income", "insurance"],
    irrigationNeeds: ["low", "medium", "high"],
    requiresDocuments: true,
    cropFocus: ["all"],
    applyUrl: "https://www.pmjdy.gov.in/",
    learnMoreUrl: "https://www.pmjdy.gov.in/",
  },
  {
    id: "pmjjby",
    title: "Pradhan Mantri Jeevan Jyoti Bima Yojana",
    description: "Life insurance cover of ₹2 lakh at just ₹436/year premium for all savings bank account holders aged 18-50.",
    category: "insurance",
    amount: "₹2 lakh life cover",
    eligibility: ["Age 18-50 with savings account", "Auto-debit of ₹436/year", "Covers death due to any reason"],
    deadline: "Enroll before May 31 each year",
    status: "active",
    state: "All India",
    documents: ["Aadhaar Card", "Bank Account"],
    targetFarmerTypes: ["marginal", "small", "large", "tenant"],
    interestFocus: ["insurance"],
    irrigationNeeds: ["low", "medium", "high"],
    requiresDocuments: true,
    cropFocus: ["all"],
    applyUrl: "https://www.myscheme.gov.in/schemes/pmjjby",
    learnMoreUrl: "https://financialservices.gov.in/insurance-divisions/Government-Sponsored-Socially-Oriented-Insurance-Schemes/Pradhan-Mantri-Jeevan-Jyoti-Bima-Yojana(PMJJBY)",
  },
  {
    id: "pmsby",
    title: "Pradhan Mantri Suraksha Bima Yojana",
    description: "Accidental death & disability insurance of ₹2 lakh at just ₹20/year for savings bank holders aged 18-70.",
    category: "insurance",
    amount: "₹2 lakh accident cover",
    eligibility: ["Age 18-70 with savings account", "Auto-debit of ₹20/year", "Accidental death & disability"],
    deadline: "Enroll before May 31 each year",
    status: "active",
    state: "All India",
    documents: ["Aadhaar Card", "Bank Account"],
    targetFarmerTypes: ["marginal", "small", "large", "tenant"],
    interestFocus: ["insurance"],
    irrigationNeeds: ["low", "medium", "high"],
    requiresDocuments: true,
    cropFocus: ["all"],
    applyUrl: "https://www.myscheme.gov.in/schemes/pmsby",
    learnMoreUrl: "https://financialservices.gov.in/insurance-divisions/Government-Sponsored-Socially-Oriented-Insurance-Schemes/Pradhan-Mantri-Suraksha-Bima-Yojana(PMSBY)",
  },
  {
    id: "mgnrega",
    title: "MGNREGA — Mahatma Gandhi Employment Guarantee",
    description: "100 days guaranteed wage employment per rural household per year in unskilled manual work including farm-related activities.",
    category: "subsidy",
    amount: "₹200-₹350/day (state-wise)",
    eligibility: ["Rural households", "Job card holders", "Unskilled manual labour"],
    deadline: "Ongoing",
    status: "active",
    state: "All India",
    documents: ["Job Card", "Aadhaar Card", "Bank Details"],
    targetFarmerTypes: ["marginal", "small", "tenant"],
    interestFocus: ["income"],
    irrigationNeeds: ["low", "medium", "high"],
    requiresDocuments: true,
    cropFocus: ["all"],
    applyUrl: "https://nrega.nic.in/Nregahome/MGNREGA_new/Nrega_home.aspx",
    learnMoreUrl: "https://nrega.nic.in/Nregahome/MGNREGA_new/Nrega_home.aspx",
  },
  {
    id: "pm-aasha",
    title: "PM-AASHA — Annadata Aay Sanrakshan Abhiyan",
    description: "Ensures farmers get MSP through price support, deficiency payment, and private procurement & stockist schemes.",
    category: "subsidy",
    amount: "MSP-linked price support",
    eligibility: ["Farmers growing notified crops", "Registered on e-NAM or state portal"],
    deadline: "Procurement season",
    status: "active",
    state: "All India",
    documents: ["Aadhaar Card", "Land Records", "Crop Registration"],
    targetFarmerTypes: ["marginal", "small", "large"],
    interestFocus: ["income"],
    irrigationNeeds: ["low", "medium", "high"],
    requiresDocuments: true,
    cropFocus: ["wheat", "rice", "pulses", "oilseeds", "all"],
    applyUrl: "https://www.myscheme.gov.in/schemes/pmaasha",
    learnMoreUrl: "https://dfpd.gov.in/pm-aasha.htm",
  },
  {
    id: "nabard-wdf",
    title: "NABARD Watershed Development Fund",
    description: "Funding for watershed projects to improve water resources, soil conservation, and sustainable livelihoods in rainfed areas.",
    category: "loan",
    amount: "Project-based grants",
    eligibility: ["Rainfed area communities", "Through state agencies and NGOs"],
    deadline: "Project cycle",
    status: "active",
    state: "All India",
    documents: ["Project Proposal", "Community Resolution"],
    targetFarmerTypes: ["marginal", "small", "large", "fpo"],
    interestFocus: ["credit", "training"],
    irrigationNeeds: ["low", "medium"],
    requiresDocuments: true,
    cropFocus: ["all"],
    applyUrl: "https://www.nabard.org/content.aspx?id=585",
    learnMoreUrl: "https://www.nabard.org/content.aspx?id=585",
  },
  {
    id: "nmoop",
    title: "National Mission on Oilseeds & Oil Palm (NMOOP)",
    description: "Promotes oilseed and oil palm cultivation through seed distribution, demonstrations, and area expansion to reduce edible oil imports.",
    category: "subsidy",
    amount: "Up to ₹30,000/ha for oil palm",
    eligibility: ["Oilseed and oil palm cultivators", "Focus on NE states for oil palm"],
    deadline: "Seasonal",
    status: "active",
    state: "All India",
    documents: ["Aadhaar Card", "Land Records", "Bank Details"],
    targetFarmerTypes: ["marginal", "small", "large"],
    interestFocus: ["income", "equipment"],
    irrigationNeeds: ["medium", "high"],
    requiresDocuments: true,
    cropFocus: ["soybean", "mustard", "all"],
    applyUrl: "https://nmoop.gov.in/",
    learnMoreUrl: "https://nmoop.gov.in/",
  },
  {
    id: "gobar-dhan",
    title: "GOBAR-DHAN Scheme",
    description: "Galvanizing Organic Bio-Agro Resources — converts cattle dung and agricultural waste into biogas, bio-CNG, and compost for extra income.",
    category: "subsidy",
    amount: "Project subsidies up to 50%",
    eligibility: ["Livestock-owning farmers", "Village-level biogas projects", "Individual and community models"],
    deadline: "Rolling",
    status: "active",
    state: "All India",
    documents: ["Aadhaar Card", "Livestock Details", "Bank Details"],
    targetFarmerTypes: ["marginal", "small", "large", "fpo"],
    interestFocus: ["income", "equipment"],
    irrigationNeeds: ["low", "medium", "high"],
    requiresDocuments: true,
    cropFocus: ["all"],
    applyUrl: "https://sbm.gov.in/gbdw20/",
    learnMoreUrl: "https://sbm.gov.in/gbdw20/",
  },
  {
    id: "vivad-se-vishwas-agri",
    title: "PM Vishwakarma Yojana (Agri-Artisans)",
    description: "Skill training, toolkit grant of ₹15,000, and collateral-free loans up to ₹3 lakh for rural artisans including blacksmiths making farm tools.",
    category: "training",
    amount: "₹15,000 toolkit + ₹3 lakh loan",
    eligibility: ["Traditional artisans", "Blacksmiths, carpenters, potters", "Must register via CSC/PM Vishwakarma portal"],
    deadline: "Ongoing",
    status: "active",
    state: "All India",
    documents: ["Aadhaar Card", "Artisan Certificate", "Bank Details"],
    targetFarmerTypes: ["marginal", "small"],
    interestFocus: ["training", "credit"],
    irrigationNeeds: ["low", "medium", "high"],
    requiresDocuments: true,
    cropFocus: ["all"],
    applyUrl: "https://pmvishwakarma.gov.in/",
    learnMoreUrl: "https://pmvishwakarma.gov.in/",
  },
  // --- STATE-SPECIFIC SCHEMES ---
  {
    id: "punjab-crop-diversification",
    title: "Punjab Crop Diversification Programme",
    description: "Incentivises shift from paddy to maize, cotton, pulses with ₹2,500/acre compensation and free seed distribution.",
    category: "subsidy",
    amount: "₹2,500/acre + free seeds",
    eligibility: ["Punjab farmers willing to diversify from paddy", "Minimum 1 acre diversion"],
    deadline: "Kharif season",
    status: "active",
    state: "Punjab",
    documents: ["Aadhaar Card", "Land Records", "Girdawari"],
    targetFarmerTypes: ["marginal", "small", "large"],
    interestFocus: ["income"],
    irrigationNeeds: ["medium", "high"],
    requiresDocuments: true,
    cropFocus: ["maize", "cotton", "pulses", "all"],
    applyUrl: "https://agri.punjab.gov.in/",
    learnMoreUrl: "https://agri.punjab.gov.in/",
  },
  {
    id: "maha-mahatma-phule",
    title: "Mahatma Phule Shetkari Karjmukti Yojana",
    description: "Maharashtra farm loan waiver scheme providing relief up to ₹2 lakh for eligible small and marginal farmers.",
    category: "loan",
    amount: "Up to ₹2 lakh waiver",
    eligibility: ["Maharashtra small/marginal farmers", "Outstanding crop loan before cut-off date"],
    deadline: "Application window",
    status: "active",
    state: "Maharashtra",
    documents: ["Aadhaar Card", "7/12 Extract", "Bank Loan Details"],
    targetFarmerTypes: ["marginal", "small"],
    interestFocus: ["credit", "income"],
    irrigationNeeds: ["low", "medium", "high"],
    requiresDocuments: true,
    cropFocus: ["all"],
    applyUrl: "https://mfrw.mahait.org/",
    learnMoreUrl: "https://mfrw.mahait.org/",
  },
  {
    id: "tn-uzhavar",
    title: "Tamil Nadu Uzhavar Pathukappu Thittam",
    description: "Farmer protection scheme providing free crop insurance and input assistance for Tamil Nadu cultivators.",
    category: "insurance",
    amount: "State-funded crop insurance",
    eligibility: ["Tamil Nadu registered farmers", "Crops notified by state government"],
    deadline: "Seasonal",
    status: "active",
    state: "Tamil Nadu",
    documents: ["Aadhaar Card", "Patta/Land Records", "Bank Details"],
    targetFarmerTypes: ["marginal", "small", "large", "tenant"],
    interestFocus: ["insurance"],
    irrigationNeeds: ["low", "medium", "high"],
    requiresDocuments: true,
    cropFocus: ["rice", "all"],
    applyUrl: "https://www.tn.gov.in/scheme/data_view/68",
    learnMoreUrl: "https://www.tn.gov.in/scheme/data_view/68",
  },
  {
    id: "haryana-bhavantar",
    title: "Haryana Bhavantar Bharpai Yojana",
    description: "Price deficiency payment for vegetables and fruits — government compensates difference between MSP and market price.",
    category: "subsidy",
    amount: "Deficiency payment per quintal",
    eligibility: ["Haryana farmers growing notified horticulture crops", "Must register on Meri Fasal Mera Byora"],
    deadline: "Crop season registration",
    status: "active",
    state: "Haryana",
    documents: ["Aadhaar Card", "Meri Fasal Mera Byora Registration", "Bank Details"],
    targetFarmerTypes: ["marginal", "small", "large"],
    interestFocus: ["income"],
    irrigationNeeds: ["medium", "high"],
    requiresDocuments: true,
    cropFocus: ["tomato", "onion", "potato", "vegetables", "all"],
    applyUrl: "https://fasal.haryana.gov.in/",
    learnMoreUrl: "https://fasal.haryana.gov.in/",
  },
  {
    id: "up-kisan-rin-mochan",
    title: "UP Kisan Rin Mochan Yojana",
    description: "Uttar Pradesh crop loan waiver up to ₹1 lakh for small and marginal farmers with outstanding bank loans.",
    category: "loan",
    amount: "Up to ₹1 lakh waiver",
    eligibility: ["UP small/marginal farmers", "Crop loan outstanding before cut-off"],
    deadline: "Application window",
    status: "active",
    state: "Uttar Pradesh",
    documents: ["Aadhaar Card", "Khasra/Khatauni", "Bank Loan Details"],
    targetFarmerTypes: ["marginal", "small"],
    interestFocus: ["credit", "income"],
    irrigationNeeds: ["low", "medium", "high"],
    requiresDocuments: true,
    cropFocus: ["all"],
    applyUrl: "https://www.upkisankarjrahat.upsdc.gov.in/",
    learnMoreUrl: "https://www.upkisankarjrahat.upsdc.gov.in/",
  },
  {
    id: "rajasthan-tarbandi",
    title: "Rajasthan Tarbandi Yojana",
    description: "Fencing subsidy to protect crops from stray animals — 50% cost borne by state government, max 400 running metres.",
    category: "equipment",
    amount: "50% subsidy (max ₹48,000)",
    eligibility: ["Rajasthan farmers with minimum 1.5 hectare", "Priority to SC/ST and small farmers"],
    deadline: "Application window",
    status: "active",
    state: "Rajasthan",
    documents: ["Aadhaar Card", "Jamabandi Copy", "Bank Details"],
    targetFarmerTypes: ["marginal", "small", "large"],
    interestFocus: ["equipment"],
    irrigationNeeds: ["low", "medium", "high"],
    requiresDocuments: true,
    cropFocus: ["all"],
    applyUrl: "https://rajkisan.rajasthan.gov.in/",
    learnMoreUrl: "https://rajkisan.rajasthan.gov.in/",
  },
  {
    id: "karnataka-raitha-siri",
    title: "Karnataka Raitha Siri Scheme",
    description: "Agricultural inputs subsidy including seeds, fertilizers, and farm equipment for Karnataka farmers at subsidized rates.",
    category: "subsidy",
    amount: "Input subsidy varies",
    eligibility: ["Karnataka registered farmers", "BPL and small farmers priority"],
    deadline: "Seasonal",
    status: "active",
    state: "Karnataka",
    documents: ["Aadhaar Card", "RTC/Land Records", "Bank Details"],
    targetFarmerTypes: ["marginal", "small", "large"],
    interestFocus: ["income", "equipment"],
    irrigationNeeds: ["low", "medium", "high"],
    requiresDocuments: true,
    cropFocus: ["all"],
    applyUrl: "https://raitamitra.karnataka.gov.in/",
    learnMoreUrl: "https://raitamitra.karnataka.gov.in/",
  },
];

const states = ["All India", "Maharashtra", "Punjab", "Haryana", "Uttar Pradesh", "Tamil Nadu", "Rajasthan", "Karnataka"];

const categoryIcons: Record<SchemeCategory, typeof DollarSign> = {
  subsidy: DollarSign,
  loan: Building2,
  insurance: Heart,
  training: Users,
  equipment: Sprout,
};

const categoryColors: Record<SchemeCategory, string> = {
  subsidy: "bg-green-100 text-green-700",
  loan: "bg-blue-100 text-blue-700",
  insurance: "bg-purple-100 text-purple-700",
  training: "bg-orange-100 text-orange-700",
  equipment: "bg-cyan-100 text-cyan-700",
};

const statusColors: Record<SchemeStatus, "default" | "destructive" | "secondary"> = {
  active: "default",
  ending_soon: "destructive",
  upcoming: "secondary",
};

const getStateFromLocation = (location?: string) => {
  const match = states.find((state) => state !== "All India" && location?.toLowerCase().includes(state.toLowerCase()));
  return match ?? "Punjab";
};

const createDefaultProfile = (location?: string): SchemeWizardProfile => ({
  state: getStateFromLocation(location),
  farmerType: "small",
  landHolding: 2,
  cropFocus: "wheat",
  irrigationNeed: "medium",
  interestedIn: "income",
  hasDocuments: true,
  gender: "male",
});

const getRecommendation = (scheme: Scheme, profile: SchemeWizardProfile): SchemeRecommendation => {
  const reasons: string[] = [];
  const blockers: string[] = [];
  let score = 0;

  const stateMatch = scheme.state === "All India" || scheme.state === profile.state;
  if (stateMatch) {
    reasons.push(scheme.state === "All India" ? "Available nationwide" : `Available in ${profile.state}`);
    score += 20;
  } else {
    blockers.push(`This scheme currently serves ${scheme.state}`);
  }

  const farmerTypeMatch = scheme.targetFarmerTypes.includes(profile.farmerType);
  if (farmerTypeMatch) {
    reasons.push(`Fits ${profile.farmerType} farmer profile`);
    score += 20;
  } else {
    blockers.push(`Best suited to ${scheme.targetFarmerTypes.join(", ")} profiles`);
  }

  const landHoldingMinMatch = scheme.minLandHolding === undefined || profile.landHolding >= scheme.minLandHolding;
  const landHoldingMaxMatch = scheme.maxLandHolding === undefined || profile.landHolding <= scheme.maxLandHolding;
  if (landHoldingMinMatch && landHoldingMaxMatch) {
    reasons.push(`Land holding of ${profile.landHolding} acres is in range`);
    score += 15;
  } else {
    blockers.push("Land holding is outside the preferred range");
  }

  const interestMatch = scheme.interestFocus.includes(profile.interestedIn);
  if (interestMatch) {
    reasons.push(`Matches your priority need for ${profile.interestedIn}`);
    score += 20;
  } else {
    reasons.push(`Alternate value: strong for ${scheme.interestFocus.join(", ")}`);
    score += 8;
  }

  const irrigationMatch = scheme.irrigationNeeds.includes(profile.irrigationNeed);
  if (irrigationMatch) {
    reasons.push(`Aligned with ${profile.irrigationNeed} irrigation need`);
    score += 10;
  } else {
    blockers.push(`Better fit for ${scheme.irrigationNeeds.join(" / ")} irrigation needs`);
  }

  const documentsMatch = !scheme.requiresDocuments || profile.hasDocuments;
  if (documentsMatch) {
    reasons.push(profile.hasDocuments ? "You indicated documents are ready" : "Does not require a full document set initially");
    score += 10;
  } else {
    blockers.push("Document readiness is needed before applying");
  }

  const cropFocusMatch = !scheme.cropFocus || scheme.cropFocus.includes("all") || scheme.cropFocus.includes(profile.cropFocus.toLowerCase());
  if (cropFocusMatch) {
    reasons.push(`Relevant for ${profile.cropFocus} planning`);
    score += 5;
  }

  return {
    isEligible: stateMatch && farmerTypeMatch && landHoldingMinMatch && landHoldingMaxMatch && interestMatch && irrigationMatch && documentsMatch && cropFocusMatch,
    score: Math.min(score, 100),
    reasons: reasons.slice(0, 4),
    blockers: blockers.slice(0, 3),
  };
};

const wizardFields = (profile: SchemeWizardProfile) => [
  Boolean(profile.state),
  Boolean(profile.farmerType),
  profile.landHolding > 0,
  Boolean(profile.cropFocus.trim()),
  Boolean(profile.irrigationNeed),
  Boolean(profile.interestedIn),
  typeof profile.hasDocuments === "boolean",
  Boolean(profile.gender),
];

const Schemes = () => {
  const { user } = useCurrentUser();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedState, setSelectedState] = useState<string>("all");
  const [wizardProfile, setWizardProfile] = useState<SchemeWizardProfile>(() => {
    const saved = getSchemeWizardState();
    return saved.profile ?? createDefaultProfile(user.location);
  });
  const [matchedSchemeIds, setMatchedSchemeIds] = useState<string[]>(() => getSchemeWizardState().matchedSchemeIds);
  const [aiMatches, setAiMatches] = useState<AiSchemeMatch[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | undefined>(() => getSchemeWizardState().lastUpdated);

  const completionChecks = useMemo(() => wizardFields(wizardProfile), [wizardProfile]);
  const completionPercentage = Math.round((completionChecks.filter(Boolean).length / completionChecks.length) * 100);
  const wizardSteps = useMemo(
    () => [
      {
        title: "Profile basics",
        description: "State, farmer type, and land holding",
        complete: Boolean(wizardProfile.state && wizardProfile.farmerType && wizardProfile.landHolding > 0),
      },
      {
        title: "Farm needs",
        description: "Crop focus, irrigation, and support priority",
        complete: Boolean(wizardProfile.cropFocus.trim() && wizardProfile.irrigationNeed && wizardProfile.interestedIn),
      },
      {
        title: "Application readiness",
        description: "Documents and personal eligibility context",
        complete: Boolean(wizardProfile.gender),
      },
    ],
    [wizardProfile],
  );

  useEffect(() => {
    const refreshWizard = () => {
      const saved = getSchemeWizardState();
      setMatchedSchemeIds(saved.matchedSchemeIds);
      setLastUpdated(saved.lastUpdated);
      if (saved.profile) {
        setWizardProfile(saved.profile);
      }
    };

    window.addEventListener(PHASE1_STORAGE_EVENT, refreshWizard);
    window.addEventListener("focus", refreshWizard);

    return () => {
      window.removeEventListener(PHASE1_STORAGE_EVENT, refreshWizard);
      window.removeEventListener("focus", refreshWizard);
    };
  }, []);

  const filteredSchemes = useMemo(() => {
    return schemeCatalog.filter((scheme) => {
      const matchesSearch =
        scheme.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        scheme.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "all" || scheme.category === selectedCategory;
      const matchesState = selectedState === "all" || scheme.state === selectedState || scheme.state === "All India";

      return matchesSearch && matchesCategory && matchesState;
    });
  }, [searchQuery, selectedCategory, selectedState]);

  const matchedSchemeSet = useMemo(() => new Set(matchedSchemeIds), [matchedSchemeIds]);

  const recommendationMap = useMemo(
    () => new Map(schemeCatalog.map((scheme) => [scheme.id, getRecommendation(scheme, wizardProfile)])),
    [wizardProfile],
  );

  const prioritizedSchemes = useMemo(() => {
    return [...filteredSchemes].sort((left, right) => {
      const leftMatch = matchedSchemeSet.has(left.id) ? 1 : 0;
      const rightMatch = matchedSchemeSet.has(right.id) ? 1 : 0;
      const leftScore = recommendationMap.get(left.id)?.score ?? 0;
      const rightScore = recommendationMap.get(right.id)?.score ?? 0;
      if (rightMatch !== leftMatch) return rightMatch - leftMatch;
      return rightScore - leftScore;
    });
  }, [filteredSchemes, matchedSchemeSet, recommendationMap]);

  const matchedSchemes = useMemo(
    () => schemeCatalog.filter((scheme) => matchedSchemeSet.has(scheme.id)).sort((left, right) => (recommendationMap.get(right.id)?.score ?? 0) - (recommendationMap.get(left.id)?.score ?? 0)),
    [matchedSchemeSet, recommendationMap],
  );

  const handleRunWizard = async () => {
    const matches = schemeCatalog.filter((scheme) => recommendationMap.get(scheme.id)?.isEligible).map((scheme) => scheme.id);
    setAiLoading(true);
    try {
      const { schemes } = await apiFetch<{ schemes: { eligible_schemes: AiSchemeMatch[] } }>("/api/ai/match-schemes", {
        method: "POST",
        body: JSON.stringify({
          landHolding: wizardProfile.landHolding,
          cropType: wizardProfile.cropFocus,
          state: wizardProfile.state,
          category: wizardProfile.farmerType,
        }),
      });

      const eligibleSchemes = schemes?.eligible_schemes ?? [];
      setAiMatches(eligibleSchemes);

      const matchedIds = schemeCatalog
        .filter((scheme) =>
          eligibleSchemes.some((ai) => scheme.title.toLowerCase().includes(ai.name.toLowerCase()))
        )
        .map((scheme) => scheme.id);

      const allMatches = matchedIds.length > 0 ? matchedIds : matches;
      const now = new Date().toISOString();

      saveSchemeWizardState({
        profile: wizardProfile,
        matchedSchemeIds: allMatches,
        lastUpdated: now,
      });

      setMatchedSchemeIds(allMatches);
      setLastUpdated(now);

      toast({
        title: "Eligibility updated",
        description: eligibleSchemes.length > 0
          ? `${eligibleSchemes.length} schemes matched by AI.`
          : allMatches.length > 0
            ? `${allMatches.length} schemes matched your profile.`
            : "No direct matches yet — try adjusting state, interest, or farmer type.",
      });
    } catch (error: any) {
      const now = new Date().toISOString();
      saveSchemeWizardState({
        profile: wizardProfile,
        matchedSchemeIds: matches,
        lastUpdated: now,
      });
      setMatchedSchemeIds(matches);
      setLastUpdated(now);
      toast({
        title: "Eligibility updated",
        description: matches.length > 0 ? `${matches.length} schemes matched your profile.` : "No direct matches yet — try adjusting state, interest, or farmer type.",
      });
    } finally {
      setAiLoading(false);
    }
  };

  const handleResetWizard = () => {
    const resetProfile = createDefaultProfile(user.location);
    setWizardProfile(resetProfile);
    setMatchedSchemeIds([]);
    setLastUpdated(undefined);
    saveSchemeWizardState({ profile: resetProfile, matchedSchemeIds: [] });

    toast({
      title: "Wizard reset",
      description: "Profile inputs were reset and saved match history was cleared.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        user={{ name: user.name, role: "farmer" }}
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        notificationCount={3}
      />

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} userRole="farmer" />

      <main className="space-y-6 p-6 md:ml-64">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Government Schemes & Eligibility Wizard</h2>
            <p className="text-muted-foreground">
              Match subsidies, insurance, equipment, and credit support to {user.name}&apos;s farm profile, then browse the full scheme catalog.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="gap-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              {matchedSchemeIds.length} matched schemes
            </Badge>
            <Badge variant="outline" className="gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {wizardProfile.state}
            </Badge>
            {lastUpdated && <Badge variant="outline">Last run {new Date(lastUpdated).toLocaleDateString()}</Badge>}
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Run the eligibility wizard
              </CardTitle>
              <CardDescription>
                Save your profile once and Farm Intellect will keep the farmer dashboard in sync with your latest scheme matches.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 rounded-xl border bg-background/70 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">Wizard completion</p>
                    <p className="text-sm text-muted-foreground">Finish the profile and then run the wizard to save matches to the dashboard.</p>
                  </div>
                  <Badge variant="outline">{completionPercentage}% ready</Badge>
                </div>
                <Progress value={completionPercentage} className="h-2.5" />
                <div className="grid gap-3 md:grid-cols-3">
                  {wizardSteps.map((step, index) => (
                    <div key={step.title} className={`rounded-lg border p-3 ${step.complete ? "border-primary/40 bg-primary/5" : "bg-background"}`}>
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${step.complete ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                          {index + 1}
                        </span>
                        {step.title}
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">{step.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="scheme-state">State</Label>
                  <Select value={wizardProfile.state} onValueChange={(value) => setWizardProfile((current) => ({ ...current, state: value }))}>
                    <SelectTrigger id="scheme-state">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {states.filter((state) => state !== "All India").map((state) => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scheme-farmer-type">Farmer type</Label>
                  <Select value={wizardProfile.farmerType} onValueChange={(value) => setWizardProfile((current) => ({ ...current, farmerType: value as SchemeWizardProfile["farmerType"] }))}>
                    <SelectTrigger id="scheme-farmer-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="marginal">Marginal</SelectItem>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                      <SelectItem value="tenant">Tenant</SelectItem>
                      <SelectItem value="fpo">FPO</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scheme-land-holding">Land holding (acres)</Label>
                  <Input
                    id="scheme-land-holding"
                    type="number"
                    min="0"
                    step="0.5"
                    value={wizardProfile.landHolding}
                    onChange={(event) => setWizardProfile((current) => ({ ...current, landHolding: Number(event.target.value) || 0 }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scheme-crop-focus">Crop focus</Label>
                  <Input
                    id="scheme-crop-focus"
                    value={wizardProfile.cropFocus}
                    onChange={(event) => setWizardProfile((current) => ({ ...current, cropFocus: event.target.value }))}
                    placeholder="e.g. wheat, tomato"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="scheme-irrigation">Irrigation need</Label>
                  <Select value={wizardProfile.irrigationNeed} onValueChange={(value) => setWizardProfile((current) => ({ ...current, irrigationNeed: value as SchemeWizardProfile["irrigationNeed"] }))}>
                    <SelectTrigger id="scheme-irrigation">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scheme-interest">Priority need</Label>
                  <Select value={wizardProfile.interestedIn} onValueChange={(value) => setWizardProfile((current) => ({ ...current, interestedIn: value as SchemeWizardProfile["interestedIn"] }))}>
                    <SelectTrigger id="scheme-interest">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Income support</SelectItem>
                      <SelectItem value="insurance">Insurance</SelectItem>
                      <SelectItem value="credit">Credit</SelectItem>
                      <SelectItem value="equipment">Equipment</SelectItem>
                      <SelectItem value="training">Training</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scheme-documents">Documents ready?</Label>
                  <Select value={wizardProfile.hasDocuments ? "yes" : "no"} onValueChange={(value) => setWizardProfile((current) => ({ ...current, hasDocuments: value === "yes" }))}>
                    <SelectTrigger id="scheme-documents">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scheme-gender">Gender</Label>
                  <Select value={wizardProfile.gender} onValueChange={(value) => setWizardProfile((current) => ({ ...current, gender: value as SchemeWizardProfile["gender"] }))}>
                    <SelectTrigger id="scheme-gender">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button onClick={handleRunWizard} disabled={aiLoading}>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  {aiLoading ? "Matching schemes..." : "Save profile & run wizard"}
                </Button>
                <Button variant="outline" onClick={handleResetWizard}>
                  Reset wizard
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Best-fit schemes right now
              </CardTitle>
              <CardDescription>
                Your top matches are saved locally so the farmer dashboard can show the latest eligibility count.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {aiMatches.length > 0 && (
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">AI-matched schemes</h3>
                    <Badge variant="secondary">{aiMatches.length} matches</Badge>
                  </div>
                  <div className="space-y-3">
                    {aiMatches.map((scheme) => (
                      <div key={scheme.name} className="rounded-lg border border-primary/10 bg-background p-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="font-medium">{scheme.name}</p>
                            {scheme.hindi_name && (
                              <p className="text-xs text-muted-foreground">{scheme.hindi_name}</p>
                            )}
                          </div>
                          {scheme.deadline && <Badge variant="outline">Deadline: {scheme.deadline}</Badge>}
                        </div>
                        {scheme.benefit && (
                          <p className="mt-2 text-sm text-muted-foreground">{scheme.benefit}</p>
                        )}
                        {scheme.eligibility && (
                          <p className="mt-2 text-xs text-muted-foreground">Eligibility: {scheme.eligibility}</p>
                        )}
                        {scheme.how_to_apply && (
                          <p className="mt-2 text-xs text-muted-foreground">How to apply: {scheme.how_to_apply}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {matchedSchemes.length > 0 ? (
                matchedSchemes.map((scheme) => (
                  <div key={scheme.id} className="rounded-xl border p-4">
                    {(() => {
                      const recommendation = recommendationMap.get(scheme.id);
                      return (
                        <>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold">{scheme.title}</h3>
                        <p className="text-sm text-muted-foreground">{scheme.description}</p>
                      </div>
                      <Badge>{scheme.amount}</Badge>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      <Badge variant="outline">{scheme.state}</Badge>
                      <Badge variant="outline">{scheme.category}</Badge>
                      <Badge variant="outline">Deadline: {scheme.deadline}</Badge>
                      <Badge variant="secondary">Fit score {recommendation?.score ?? 0}%</Badge>
                    </div>
                    {recommendation && (
                      <div className="mt-3 space-y-2">
                        {recommendation.reasons.map((reason) => (
                          <div key={reason} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                            <span>{reason}</span>
                          </div>
                        ))}
                      </div>
                    )}
                        </>
                      );
                    })()}
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed p-8 text-center">
                  <FileSearch className="mx-auto h-10 w-10 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No matches saved yet</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Run the wizard to shortlist the best schemes for your current land, state, irrigation, and support needs.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search schemes..." value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className="pl-10" />
              </div>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="subsidy">Subsidies</SelectItem>
                  <SelectItem value="loan">Loans</SelectItem>
                  <SelectItem value="insurance">Insurance</SelectItem>
                  <SelectItem value="training">Training</SelectItem>
                  <SelectItem value="equipment">Equipment</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger>
                  <SelectValue placeholder="State" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All States</SelectItem>
                  {states.map((state) => (
                    <SelectItem key={state} value={state}>{state}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setSelectedState("all");
              }}>
                <Filter className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {prioritizedSchemes.map((scheme) => {
            const CategoryIcon = categoryIcons[scheme.category];
            const isMatched = matchedSchemeSet.has(scheme.id);
            const recommendation = recommendationMap.get(scheme.id);

            return (
              <Card key={scheme.id} className={`transition-shadow hover:shadow-lg ${isMatched ? "border-primary/40 bg-primary/5" : ""}`}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`rounded-lg p-2 ${categoryColors[scheme.category]}`}>
                        <CategoryIcon className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Badge variant={statusColors[scheme.status]}>{scheme.status.replace("_", " ")}</Badge>
                        {recommendation && <Badge variant="outline">Fit score {recommendation.score}%</Badge>}
                        {isMatched && (
                          <Badge variant="secondary" className="gap-1">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Wizard match
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">{scheme.amount}</div>
                    </div>
                  </div>

                  <CardTitle className="text-lg">{scheme.title}</CardTitle>
                  <CardDescription>{scheme.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{scheme.state}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Deadline: {scheme.deadline}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Eligibility</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {scheme.eligibility.map((criteria) => (
                        <li key={criteria} className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                          {criteria}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {recommendation && recommendation.reasons.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="flex items-center gap-2 text-sm font-medium">
                        <Info className="h-4 w-4 text-primary" />
                        Why this is recommended
                      </h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        {recommendation.reasons.map((reason) => (
                          <li key={reason} className="flex items-start gap-2">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {recommendation && recommendation.blockers.length > 0 && !recommendation.isEligible && (
                    <div className="space-y-2 rounded-lg border border-dashed p-3">
                      <h4 className="flex items-center gap-2 text-sm font-medium">
                        <ShieldQuestion className="h-4 w-4 text-muted-foreground" />
                        What may block approval
                      </h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        {recommendation.blockers.map((blocker) => (
                          <li key={blocker} className="flex items-start gap-2">
                            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                            <span>{blocker}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Required documents</h4>
                    <div className="flex flex-wrap gap-1">
                      {scheme.documents.map((doc) => (
                        <Badge key={doc} variant="outline" className="text-xs">
                          <FileText className="mr-1 h-3 w-3" />
                          {doc}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button asChild className="flex-1" size="sm">
                      <a href={scheme.applyUrl} target="_blank" rel="noreferrer">
                        <LinkIcon className="mr-2 h-4 w-4" />
                        Apply Now
                      </a>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <a href={scheme.learnMoreUrl} target="_blank" rel="noreferrer">Learn More</a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {prioritizedSchemes.length === 0 && (
          <Card className="py-12 text-center">
            <CardContent>
              <Wheat className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-medium">No schemes found</h3>
              <p className="text-muted-foreground">Try adjusting your search or category filters.</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Schemes;
