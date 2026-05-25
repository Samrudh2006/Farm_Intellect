/**
 * Soil Health Types
 * Represents soil parameters, health card data, and API responses
 */

export interface SoilParameters {
  nitrogen: number; // N content in kg/ha
  phosphorus: number; // P content in kg/ha
  potassium: number; // K content in kg/ha
  ph: number; // pH value (4.5-8.5 range)
  organicMatter: number; // % organic matter
  ec: number; // Electrical Conductivity (dS/m)
  texture: 'sandy' | 'loam' | 'clay' | 'silt' | 'mixed';
  moisture: number; // % moisture content
}

export interface SoilHealthCard {
  id: string;
  farmerId: string;
  fieldId: string;
  fieldName: string;
  state: string;
  district: string;
  taluk?: string;
  testDate: Date;
  expiryDate: Date;
  parameters: SoilParameters;
  recommendations: string[];
  source: 'government' | 'farmer-input' | 'mock';
  lastUpdated: Date;
}

export interface CropSoilRequirement {
  crop: string;
  nitrogenMin: number;
  nitrogenMax: number;
  phosphorusMin: number;
  phosphorusMax: number;
  potassiumMin: number;
  potassiumMax: number;
  phMin: number;
  phMax: number;
  organicMatterMin: number;
  texturePreference: string[];
  drainageNeeds: 'poor' | 'moderate' | 'good' | 'well';
}

export interface SoilAmendment {
  name: string;
  type: 'fertilizer' | 'conditioner' | 'lime' | 'organic';
  npk: [number, number, number]; // N, P, K ratios
  applicationRate: number; // kg/ha
  cost: number; // INR per kg
  benefits: string[];
  timing: string; // when to apply
}

export interface SoilHealthScore {
  overall: number; // 0-100
  nitrogenStatus: 'deficient' | 'optimum' | 'excessive';
  phosphorusStatus: 'deficient' | 'optimum' | 'excessive';
  potassiumStatus: 'deficient' | 'optimum' | 'excessive';
  phStatus: 'acidic' | 'neutral' | 'alkaline';
  organicMatterStatus: 'poor' | 'moderate' | 'good' | 'excellent';
  recommendations: string[];
  amendments: SoilAmendment[];
}

export interface GovernmentSoilAPIResponse {
  status: 'success' | 'error';
  data?: SoilHealthCard;
  message?: string;
}

export interface SoilDataSource {
  id: string;
  name: string;
  type: 'government' | 'private' | 'offline';
  priority: number;
  available: boolean;
  lastChecked: Date;
}
