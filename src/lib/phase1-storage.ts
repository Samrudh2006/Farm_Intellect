export interface StoredCropReminder {
  id: string;
  date: string;
  task: string;
  priority: "low" | "medium" | "high";
  completed: boolean;
}

export interface StoredCropEntry {
  id: string;
  cropType: string;
  fieldName: string;
  plantingDate: string;
  harvestDate?: string;
  stage: string;
  notes: string;
  targetYield: string;
  irrigationPlan: string;
  reminders: StoredCropReminder[];
}

export interface FieldHistoryEntry {
  id: string;
  fieldId: number;
  date: string;
  type: "observation" | "irrigation" | "fertilizer" | "weather" | "harvest" | "soil";
  title: string;
  detail: string;
  health: number;
  source: string;
}

export interface SchemeWizardProfile {
  state: string;
  farmerType: "marginal" | "small" | "large" | "fpo" | "tenant";
  landHolding: number;
  cropFocus: string;
  irrigationNeed: "low" | "medium" | "high";
  interestedIn: "income" | "insurance" | "credit" | "equipment" | "training";
  hasDocuments: boolean;
  gender: "male" | "female" | "other";
}

export interface SchemeWizardState {
  profile: SchemeWizardProfile | null;
  matchedSchemeIds: string[];
  lastUpdated?: string;
}

export interface GeoPreference {
  state: string;
  district: string;
  village: string;
  preferredMarket: string;
  primaryCrop: string;
  languageCode: string;
}

export interface ExpertBooking {
  id: string;
  expertName: string;
  expertise: string;
  slot: string;
  mode: "chat" | "call" | "video" | "field_visit";
  issue: string;
  status: "requested" | "confirmed" | "completed";
  notes?: string;
}

import { getSecureItem, setSecureItem } from "./secure-storage";

const CROP_PLANS_KEY = "phase1-crop-plans";
const FIELD_HISTORY_KEY = "phase1-field-history";
const SCHEME_WIZARD_KEY = "phase1-scheme-wizard";
const GEO_PREFERENCE_KEY = "phase1-geo-preference";
const EXPERT_BOOKINGS_KEY = "phase1-expert-bookings";
const DISMISSED_ALERTS_KEY = "phase1-dismissed-alerts";
export const PHASE1_STORAGE_EVENT = "phase1-storage-updated";

const readFromStorage = <T,>(key: string, fallback: T): T => {
  return getSecureItem<T>(key, fallback);
};

const writeToStorage = <T,>(key: string, value: T) => {
  setSecureItem(key, value);
  window.dispatchEvent(new Event(PHASE1_STORAGE_EVENT));
};

const defaultFieldHistory: FieldHistoryEntry[] = [
  {
    id: "field-1-baseline",
    fieldId: 1,
    date: "2024-09-02T08:30:00.000Z",
    type: "soil",
    title: "Soil test baseline recorded",
    detail: "Organic carbon improved after compost application. Nitrogen still needs a top-up before tillering.",
    health: 78,
    source: "Lab report",
  },
  {
    id: "field-1-irrigation",
    fieldId: 1,
    date: "2024-09-10T06:15:00.000Z",
    type: "irrigation",
    title: "Protective irrigation completed",
    detail: "Applied one irrigation cycle after a 5-day dry spell. Moisture stress indicators returned to normal.",
    health: 84,
    source: "Farmer log",
  },
  {
    id: "field-2-warning",
    fieldId: 2,
    date: "2024-09-11T11:00:00.000Z",
    type: "weather",
    title: "Heat stress watch issued",
    detail: "Afternoon canopy temperature crossed threshold. Field requires closer irrigation monitoring for the next 72 hours.",
    health: 64,
    source: "Weather alert",
  },
  {
    id: "field-2-nutrient",
    fieldId: 2,
    date: "2024-09-14T09:45:00.000Z",
    type: "fertilizer",
    title: "Corrective nutrient spray applied",
    detail: "Foliar spray completed for pH-linked nutrient uptake issue. Follow-up reading scheduled after 4 days.",
    health: 70,
    source: "Expert advisory",
  },
  {
    id: "field-3-observation",
    fieldId: 3,
    date: "2024-09-16T07:20:00.000Z",
    type: "observation",
    title: "Canopy vigor above seasonal benchmark",
    detail: "NDVI and plant stand count indicate strong vegetative performance compared with last week.",
    health: 91,
    source: "Satellite insight",
  },
];

export const getCropPlans = () => readFromStorage<StoredCropEntry[]>(CROP_PLANS_KEY, []);

export const saveCropPlans = (plans: StoredCropEntry[]) => {
  writeToStorage(CROP_PLANS_KEY, plans);
};

export const getFieldHistoryEntries = () => {
  const stored = readFromStorage<FieldHistoryEntry[]>(FIELD_HISTORY_KEY, []);
  return stored.length > 0 ? stored : defaultFieldHistory;
};

export const saveFieldHistoryEntries = (entries: FieldHistoryEntry[]) => {
  writeToStorage(FIELD_HISTORY_KEY, entries);
};

export const appendFieldHistoryEntry = (entry: FieldHistoryEntry) => {
  const currentEntries = getFieldHistoryEntries();
  saveFieldHistoryEntries([entry, ...currentEntries]);
};

export const getSchemeWizardState = () =>
  readFromStorage<SchemeWizardState>(SCHEME_WIZARD_KEY, {
    profile: null,
    matchedSchemeIds: [],
  });

export const saveSchemeWizardState = (state: SchemeWizardState) => {
  writeToStorage(SCHEME_WIZARD_KEY, state);
};

export const getGeoPreference = () =>
  readFromStorage<GeoPreference>(GEO_PREFERENCE_KEY, {
    state: "Punjab",
    district: "Ludhiana",
    village: "Doraha",
    preferredMarket: "Khanna",
    primaryCrop: "Wheat",
    languageCode: "en",
  });

export const saveGeoPreference = (preference: GeoPreference) => {
  writeToStorage(GEO_PREFERENCE_KEY, preference);
};

export const getExpertBookings = () =>
  readFromStorage<ExpertBooking[]>(EXPERT_BOOKINGS_KEY, [
    {
      id: "booking-1",
      expertName: "Dr. Kavita Sharma",
      expertise: "Plant pathology",
      slot: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      mode: "video",
      issue: "Recurring leaf spot symptoms after irrigation swings",
      status: "confirmed",
      notes: "Keep recent scanner images and field history ready for review.",
    },
  ]);

export const saveExpertBookings = (bookings: ExpertBooking[]) => {
  writeToStorage(EXPERT_BOOKINGS_KEY, bookings);
};

export const appendExpertBooking = (booking: ExpertBooking) => {
  saveExpertBookings([booking, ...getExpertBookings()]);
};

export const getDismissedAlertIds = () => readFromStorage<string[]>(DISMISSED_ALERTS_KEY, []);

export const dismissAlert = (alertId: string) => {
  const current = getDismissedAlertIds();
  if (!current.includes(alertId)) {
    writeToStorage(DISMISSED_ALERTS_KEY, [...current, alertId]);
  }
};

export const restoreDismissedAlerts = () => {
  writeToStorage(DISMISSED_ALERTS_KEY, []);
};

export const getPhase1Summary = () => {
  const plans = getCropPlans();
  const fieldEvents = getFieldHistoryEntries();
  const schemeState = getSchemeWizardState();
  const expertBookings = getExpertBookings();

  return {
    cropPlans: plans.length,
    openTasks: plans.flatMap((plan) => plan.reminders).filter((reminder) => !reminder.completed).length,
    fieldEvents: fieldEvents.length,
    schemeMatches: schemeState.matchedSchemeIds.length,
    lastWizardRun: schemeState.lastUpdated,
    expertBookings: expertBookings.length,
  };
};
