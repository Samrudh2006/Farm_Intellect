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
import { supabase } from "@/integrations/supabase/client";
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

// Scheme catalog will be fetched from Supabase

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

const DEFAULT_MOCK_SCHEMES_CATALOG: Scheme[] = [
  {
    id: "scheme-pm-kisan",
    title: "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
    description: "An initiative by the Government of India that provides up to ₹6,000 per year in three equal installments as minimum income support to all small and marginal farmers.",
    category: "subsidy",
    amount: "₹6,000 / year",
    eligibility: ["Small & marginal farmers", "Must own cultivable land", "Land holding up to 2 hectares"],
    deadline: "2026-12-31",
    status: "active",
    state: "All India",
    documents: ["Aadhaar Card", "Land Ownership Papers", "Bank Account Details"],
    targetFarmerTypes: ["small", "marginal"],
    interestFocus: ["income", "direct_benefit"],
    irrigationNeeds: ["low", "medium", "high"],
    minLandHolding: 0,
    maxLandHolding: 2,
    requiresDocuments: true,
    cropFocus: ["wheat", "rice", "maize", "pulses", "any"],
    applyUrl: "https://pmkisan.gov.in/",
    learnMoreUrl: "https://pmkisan.gov.in/"
  },
  {
    id: "scheme-pmfby",
    title: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
    description: "An actuarial premium based crop insurance scheme that yields financial support to farmers suffering crop loss/damage arising out of unforeseen events.",
    category: "insurance",
    amount: "Up to ₹50,000 / hectare coverage",
    eligibility: ["All farmers growing notified crops", "Sharecroppers & tenant farmers are also eligible"],
    deadline: "2026-07-31",
    status: "ending_soon",
    state: "All India",
    documents: ["Land Records", "Sowing Certificate", "ID Proof", "Bank Passbook"],
    targetFarmerTypes: ["small", "marginal", "large"],
    interestFocus: ["insurance", "risk_mitigation"],
    irrigationNeeds: ["low", "medium", "high"],
    requiresDocuments: true,
    cropFocus: ["wheat", "rice", "cotton", "oilseeds", "pulses"],
    applyUrl: "https://pmfby.gov.in/",
    learnMoreUrl: "https://pmfby.gov.in/"
  },
  {
    id: "scheme-kcc",
    title: "Kisan Credit Card (KCC) Loan Scheme",
    description: "Provides farmers with timely credit support to meet their cultivation and other needs like purchase of inputs, seeds, fertilizers, and pesticides.",
    category: "loan",
    amount: "Up to ₹3,00,000 @ 4% interest rate",
    eligibility: ["Owner cultivators", "Tenant farmers", "Sharecroppers", "Self-help groups of farmers"],
    deadline: "2026-12-31",
    status: "active",
    state: "All India",
    documents: ["Land Records", "KCC Application Form", "ID & Address Proof", "Panchayat Certificate"],
    targetFarmerTypes: ["small", "marginal", "large"],
    interestFocus: ["loan", "credit", "inputs"],
    irrigationNeeds: ["low", "medium", "high"],
    minLandHolding: 0,
    requiresDocuments: true,
    cropFocus: ["any"],
    applyUrl: "https://www.sbi.co.in/web/personal-banking/loans/agriculture-loans/kisan-credit-card",
    learnMoreUrl: "https://www.sbi.co.in/"
  },
  {
    id: "scheme-pmksy",
    title: "Pradhan Mantri Krishi Sinchayee Yojana (PMKSY)",
    description: "Focuses on creating sources of assured irrigation, improving on-farm water use efficiency, and promoting micro-irrigation technologies (drip and sprinkler).",
    category: "equipment",
    amount: "Up to 80% subsidy on micro-irrigation setups",
    eligibility: ["Farmers with cultivable land", "Members of water user associations"],
    deadline: "2026-10-15",
    status: "active",
    state: "Punjab",
    documents: ["Land Patta", "Electricity Bill", "Soil Health Card", "Aadhaar Card"],
    targetFarmerTypes: ["small", "marginal", "large"],
    interestFocus: ["irrigation", "equipment", "water_saving"],
    irrigationNeeds: ["high", "medium"],
    requiresDocuments: true,
    cropFocus: ["any", "cotton", "sugarcane", "vegetables"],
    applyUrl: "https://pmksy.gov.in/",
    learnMoreUrl: "https://pmksy.gov.in/"
  }
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
  const [schemeCatalog, setSchemeCatalog] = useState<Scheme[]>([]);
  const [dbLoading, setDbLoading] = useState(true);

  useEffect(() => {
    const fetchSchemes = async () => {
      setDbLoading(true);
      const { data, error } = await supabase.from("schemes").select("*");
      if (data && data.length > 0) {
        setSchemeCatalog(data.map(d => ({
          id: d.id,
          title: d.title,
          description: d.description,
          category: d.category,
          amount: d.amount,
          eligibility: d.eligibility,
          deadline: d.deadline,
          status: d.status,
          state: d.state,
          documents: d.documents,
          targetFarmerTypes: d.target_farmer_types,
          interestFocus: d.interest_focus,
          irrigationNeeds: d.irrigation_needs,
          minLandHolding: d.min_land_holding,
          maxLandHolding: d.max_land_holding,
          requiresDocuments: d.requires_documents,
          cropFocus: d.crop_focus,
          applyUrl: d.apply_url,
          learnMoreUrl: d.learn_more_url
        })));
      } else {
        setSchemeCatalog(DEFAULT_MOCK_SCHEMES_CATALOG);
      }
      setDbLoading(false);
    };
    fetchSchemes();
  }, []);

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
                      <a href={scheme.applyUrl} target="_blank" rel="noopener noreferrer">
                        <LinkIcon className="mr-2 h-4 w-4" />
                        Apply Now
                      </a>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <a href={scheme.learnMoreUrl} target="_blank" rel="noopener noreferrer">Learn More</a>
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
