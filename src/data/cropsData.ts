// Comprehensive crop data with seasonal information and images
import { createDatasetMetadata } from './datasetMetadata';

const winterWheat = "https://images.pexels.com/photos/326082/pexels-photo-326082.jpeg?auto=compress&cs=tinysrgb&w=400";
const rabiCrops = "https://images.pexels.com/photos/265216/pexels-photo-265216.jpeg?auto=compress&cs=tinysrgb&w=400";
const kharifRice = "https://images.pexels.com/photos/2518861/pexels-photo-2518861.jpeg?auto=compress&cs=tinysrgb&w=400";
const summerVegetables = "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400";
const cotton = "https://images.pexels.com/photos/5725625/pexels-photo-5725625.jpeg?auto=compress&cs=tinysrgb&w=400";
const sugarcane = "https://images.pexels.com/photos/15609996/pexels-photo-15609996.jpeg?auto=compress&cs=tinysrgb&w=400";
const maizeCorn = "https://images.pexels.com/photos/547264/pexels-photo-547264.jpeg?auto=compress&cs=tinysrgb&w=400";
const soybean = "https://images.pexels.com/photos/6157049/pexels-photo-6157049.jpeg?auto=compress&cs=tinysrgb&w=400";
const onion = "https://images.pexels.com/photos/144206/pexels-photo-144206.jpeg?auto=compress&cs=tinysrgb&w=400";
const potato = "https://images.pexels.com/photos/144248/pexels-photo-144248.jpeg?auto=compress&cs=tinysrgb&w=400";
const barley = "https://images.pexels.com/photos/265216/pexels-photo-265216.jpeg?auto=compress&cs=tinysrgb&w=400";
const chickpea = "https://images.pexels.com/photos/6157049/pexels-photo-6157049.jpeg?auto=compress&cs=tinysrgb&w=400";
const pea = "https://images.pexels.com/photos/255469/pexels-photo-255469.jpeg?auto=compress&cs=tinysrgb&w=400";
const mustard = "https://images.pexels.com/photos/158198/pexels-photo-158198.jpeg?auto=compress&cs=tinysrgb&w=400";
const tomato = "https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg?auto=compress&cs=tinysrgb&w=400";
const watermelon = "https://images.pexels.com/photos/1313267/pexels-photo-1313267.jpeg?auto=compress&cs=tinysrgb&w=400";
const muskmelon = "https://images.pexels.com/photos/2894192/pexels-photo-2894192.jpeg?auto=compress&cs=tinysrgb&w=400";

export interface CropInfo {
  id: string;
  name: string;
  hindi: string;
  punjabi: string;
  season: 'rabi' | 'kharif' | 'summer' | 'perennial';
  image: string;
  plantingTime: string;
  harvestTime: string;
  duration: string;
  climate: string;
  soilType: string;
  avgYield: string;
  marketPrice: string;
  region: string[];
  waterRequirement: 'Low' | 'Medium' | 'High';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  profitability: 'Low' | 'Medium' | 'High';
  diseases: string[];
  fertilizers: string[];
  description: string;
}

export const cropsDataMetadata = createDatasetMetadata({
  version: '1.0.0',
  lastUpdated: '2024-10-15T00:00:00Z',
  source: 'ICAR seasonal crop references',
  notes: 'Seasonal crop showcase with imagery and regional notes.',
});

export const cropsData: CropInfo[] = [
  // RABI SEASON (Winter Crops)
  {
    id: 'wheat',
    name: 'Wheat',
    hindi: 'गेहूं',
    punjabi: 'ਕਣਕ',
    season: 'rabi',
    image: winterWheat,
    plantingTime: 'Nov - Dec',
    harvestTime: 'Apr - May',
    duration: '120-150 days',
    climate: 'Cool dry climate',
    soilType: 'Well-drained loamy soil',
    avgYield: '30-40 quintal/hectare',
    marketPrice: '₹2,000-2,500 per quintal',
    region: ['Punjab', 'Haryana', 'UP', 'MP', 'Rajasthan'],
    waterRequirement: 'Medium',
    difficulty: 'Medium',
    profitability: 'High',
    diseases: ['Rust', 'Bunt', 'Smut'],
    fertilizers: ['Urea', 'DAP', 'MOP'],
    description: 'Major staple crop with excellent market demand and government support.'
  },
  {
    id: 'barley',
    name: 'Barley',
    hindi: 'जौ',
    punjabi: 'ਜੌ',
    season: 'rabi',
    image: barley,
    plantingTime: 'Nov - Dec',
    harvestTime: 'Apr - May',
    duration: '120-140 days',
    climate: 'Cool dry climate',
    soilType: 'Sandy loam to clay loam',
    avgYield: '25-35 quintal/hectare',
    marketPrice: '₹1,500-2,000 per quintal',
    region: ['Rajasthan', 'UP', 'MP', 'Haryana'],
    waterRequirement: 'Low',
    difficulty: 'Easy',
    profitability: 'Medium',
    diseases: ['Net blotch', 'Leaf rust'],
    fertilizers: ['Urea', 'DAP'],
    description: 'Drought-tolerant crop suitable for marginal lands.'
  },
  {
    id: 'mustard',
    name: 'Mustard',
    hindi: 'सरसों',
    punjabi: 'ਸਰੋਂ',
    season: 'rabi',
    image: mustard,
    plantingTime: 'Oct - Nov',
    harvestTime: 'Mar - Apr',
    duration: '120-150 days',
    climate: 'Cool dry climate',
    soilType: 'Well-drained sandy loam',
    avgYield: '15-20 quintal/hectare',
    marketPrice: '₹4,000-5,000 per quintal',
    region: ['Rajasthan', 'Haryana', 'MP', 'Gujarat'],
    waterRequirement: 'Low',
    difficulty: 'Easy',
    profitability: 'High',
    diseases: ['Aphids', 'White rust'],
    fertilizers: ['Urea', 'DAP', 'Sulfur'],
    description: 'Oil seed crop with high market value and low water requirement.'
  },
  {
    id: 'chickpea',
    name: 'Chickpea (Gram)',
    hindi: 'चना',
    punjabi: 'ਚਣਾ',
    season: 'rabi',
    image: chickpea,
    plantingTime: 'Oct - Nov',
    harvestTime: 'Mar - Apr',
    duration: '120-140 days',
    climate: 'Cool dry climate',
    soilType: 'Well-drained clay loam',
    avgYield: '18-25 quintal/hectare',
    marketPrice: '₹4,500-6,000 per quintal',
    region: ['MP', 'Rajasthan', 'UP', 'Karnataka'],
    waterRequirement: 'Low',
    difficulty: 'Medium',
    profitability: 'High',
    diseases: ['Wilt', 'Blight', 'Pod borer'],
    fertilizers: ['DAP', 'MOP', 'Rhizobium'],
    description: 'Pulse crop with excellent protein content and market demand.'
  },
  {
    id: 'pea',
    name: 'Field Pea',
    hindi: 'मटर',
    punjabi: 'ਮਟਰ',
    season: 'rabi',
    image: pea,
    plantingTime: 'Oct - Nov',
    harvestTime: 'Mar - Apr',
    duration: '110-130 days',
    climate: 'Cool humid climate',
    soilType: 'Well-drained loamy soil',
    avgYield: '20-25 quintal/hectare',
    marketPrice: '₹3,500-4,500 per quintal',
    region: ['UP', 'MP', 'Bihar', 'West Bengal'],
    waterRequirement: 'Medium',
    difficulty: 'Easy',
    profitability: 'Medium',
    diseases: ['Powdery mildew', 'Rust'],
    fertilizers: ['DAP', 'MOP', 'Rhizobium'],
    description: 'Nutritious pulse crop suitable for intercropping.'
  },

  // KHARIF SEASON (Monsoon Crops)
  {
    id: 'rice',
    name: 'Rice',
    hindi: 'धान',
    punjabi: 'ਚਾਵਲ',
    season: 'kharif',
    image: kharifRice,
    plantingTime: 'Jun - Jul',
    harvestTime: 'Oct - Nov',
    duration: '120-150 days',
    climate: 'Hot humid climate',
    soilType: 'Clay to clay loam',
    avgYield: '40-60 quintal/hectare',
    marketPrice: '₹1,800-2,200 per quintal',
    region: ['Punjab', 'Haryana', 'West Bengal', 'AP', 'Tamil Nadu'],
    waterRequirement: 'High',
    difficulty: 'Medium',
    profitability: 'High',
    diseases: ['Blast', 'Sheath blight', 'Brown spot'],
    fertilizers: ['Urea', 'DAP', 'MOP'],
    description: 'Major food grain crop with assured government procurement.'
  },
  {
    id: 'cotton',
    name: 'Cotton',
    hindi: 'कपास',
    punjabi: 'ਕਪਾਹ',
    season: 'kharif',
    image: cotton,
    plantingTime: 'May - Jun',
    harvestTime: 'Oct - Jan',
    duration: '180-200 days',
    climate: 'Hot humid climate',
    soilType: 'Well-drained black cotton soil',
    avgYield: '15-25 quintal/hectare',
    marketPrice: '₹5,500-7,000 per quintal',
    region: ['Gujarat', 'Maharashtra', 'AP', 'Karnataka', 'Punjab'],
    waterRequirement: 'Medium',
    difficulty: 'Hard',
    profitability: 'High',
    diseases: ['Bollworm', 'Whitefly', 'Leaf curl'],
    fertilizers: ['Urea', 'DAP', 'MOP', 'Boron'],
    description: 'Cash crop with high profitability but requires intensive management.'
  },
  {
    id: 'maize',
    name: 'Maize (Corn)',
    hindi: 'मक्का',
    punjabi: 'ਮੱਕੀ',
    season: 'kharif',
    image: maizeCorn,
    plantingTime: 'Jun - Jul',
    harvestTime: 'Sep - Oct',
    duration: '100-120 days',
    climate: 'Warm humid climate',
    soilType: 'Well-drained fertile soil',
    avgYield: '35-50 quintal/hectare',
    marketPrice: '₹1,600-2,000 per quintal',
    region: ['Karnataka', 'AP', 'Tamil Nadu', 'MP', 'Bihar'],
    waterRequirement: 'Medium',
    difficulty: 'Easy',
    profitability: 'Medium',
    diseases: ['Leaf blight', 'Stalk rot'],
    fertilizers: ['Urea', 'DAP', 'Zinc sulfate'],
    description: 'Versatile crop used for food, feed, and industrial purposes.'
  },
  {
    id: 'soybean',
    name: 'Soybean',
    hindi: 'सोयाबीन',
    punjabi: 'ਸੋਇਆਬੀਨ',
    season: 'kharif',
    image: soybean,
    plantingTime: 'Jun - Jul',
    harvestTime: 'Oct - Nov',
    duration: '95-110 days',
    climate: 'Warm humid climate',
    soilType: 'Well-drained loamy soil',
    avgYield: '20-25 quintal/hectare',
    marketPrice: '₹3,500-4,500 per quintal',
    region: ['MP', 'Maharashtra', 'Rajasthan', 'Karnataka'],
    waterRequirement: 'Medium',
    difficulty: 'Medium',
    profitability: 'High',
    diseases: ['Yellow mosaic', 'Rust', 'Pod borer'],
    fertilizers: ['DAP', 'MOP', 'Rhizobium'],
    description: 'Important oilseed and protein crop with good export potential.'
  },
  {
    id: 'sugarcane',
    name: 'Sugarcane',
    hindi: 'गन्ना',
    punjabi: 'ਗੰਨਾ',
    season: 'perennial',
    image: sugarcane,
    plantingTime: 'Feb - Mar, Oct - Nov',
    harvestTime: 'Dec - Mar',
    duration: '12-18 months',
    climate: 'Hot humid climate',
    soilType: 'Deep fertile soil',
    avgYield: '700-1000 quintal/hectare',
    marketPrice: '₹280-320 per quintal',
    region: ['UP', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Punjab'],
    waterRequirement: 'High',
    difficulty: 'Hard',
    profitability: 'High',
    diseases: ['Smut', 'Red rot', 'Wilt'],
    fertilizers: ['Urea', 'DAP', 'MOP'],
    description: 'Long-duration cash crop with assured sugar mill procurement.'
  },

  // SUMMER SEASON
  {
    id: 'watermelon',
    name: 'Watermelon',
    hindi: 'तरबूज',
    punjabi: 'ਤਰਬੂਜ਼',
    season: 'summer',
    image: watermelon,
    plantingTime: 'Feb - Mar',
    harvestTime: 'May - Jun',
    duration: '90-100 days',
    climate: 'Hot dry climate',
    soilType: 'Sandy loam with good drainage',
    avgYield: '200-300 quintal/hectare',
    marketPrice: '₹8-15 per kg',
    region: ['Rajasthan', 'UP', 'Karnataka', 'AP'],
    waterRequirement: 'Medium',
    difficulty: 'Medium',
    profitability: 'High',
    diseases: ['Anthracnose', 'Downy mildew'],
    fertilizers: ['FYM', 'NPK', 'Calcium'],
    description: 'High-value summer fruit with excellent market demand.'
  },
  {
    id: 'muskmelon',
    name: 'Muskmelon',
    hindi: 'खरबूजा',
    punjabi: 'ਖਰਬੂਜਾ',
    season: 'summer',
    image: muskmelon,
    plantingTime: 'Feb - Mar',
    harvestTime: 'May - Jun',
    duration: '85-95 days',
    climate: 'Hot dry climate',
    soilType: 'Sandy loam soil',
    avgYield: '150-200 quintal/hectare',
    marketPrice: '₹15-25 per kg',
    region: ['Rajasthan', 'UP', 'Punjab', 'Haryana'],
    waterRequirement: 'Medium',
    difficulty: 'Medium',
    profitability: 'High',
    diseases: ['Powdery mildew', 'Aphids'],
    fertilizers: ['FYM', 'NPK'],
    description: 'Premium summer fruit with high market value.'
  },

  // YEAR-ROUND VEGETABLES
  {
    id: 'tomato',
    name: 'Tomato',
    hindi: 'टमाटर',
    punjabi: 'ਟਮਾਟਰ',
    season: 'rabi',
    image: tomato,
    plantingTime: 'Sep - Oct, Jan - Feb',
    harvestTime: 'Dec - Mar, Apr - Jun',
    duration: '120-140 days',
    climate: 'Cool to warm climate',
    soilType: 'Well-drained fertile soil',
    avgYield: '400-600 quintal/hectare',
    marketPrice: '₹8-25 per kg',
    region: ['Karnataka', 'AP', 'Maharashtra', 'MP'],
    waterRequirement: 'Medium',
    difficulty: 'Hard',
    profitability: 'High',
    diseases: ['Late blight', 'Early blight', 'Leaf curl'],
    fertilizers: ['NPK', 'Calcium', 'Boron'],
    description: 'High-value vegetable crop with year-round demand.'
  },
  {
    id: 'onion',
    name: 'Onion',
    hindi: 'प्याज',
    punjabi: 'ਪਿਆਜ਼',
    season: 'rabi',
    image: onion,
    plantingTime: 'Nov - Dec',
    harvestTime: 'Apr - May',
    duration: '120-150 days',
    climate: 'Cool dry climate',
    soilType: 'Well-drained loamy soil',
    avgYield: '250-400 quintal/hectare',
    marketPrice: '₹8-30 per kg',
    region: ['Maharashtra', 'Karnataka', 'Gujarat', 'MP'],
    waterRequirement: 'Medium',
    difficulty: 'Medium',
    profitability: 'High',
    diseases: ['Purple blotch', 'Thrips'],
    fertilizers: ['NPK', 'Sulfur'],
    description: 'Essential vegetable crop with volatile but profitable market.'
  },
  {
    id: 'potato',
    name: 'Potato',
    hindi: 'आलू',
    punjabi: 'ਆਲੂ',
    season: 'rabi',
    image: potato,
    plantingTime: 'Oct - Nov',
    harvestTime: 'Jan - Mar',
    duration: '90-120 days',
    climate: 'Cool climate',
    soilType: 'Well-drained sandy loam',
    avgYield: '200-300 quintal/hectare',
    marketPrice: '₹8-20 per kg',
    region: ['UP', 'West Bengal', 'Bihar', 'Punjab'],
    waterRequirement: 'Medium',
    difficulty: 'Medium',
    profitability: 'Medium',
    diseases: ['Late blight', 'Early blight'],
    fertilizers: ['NPK', 'FYM'],
    description: 'Staple vegetable crop with consistent market demand.'
  },
];

export const getSeasonalCrops = (season: string) => {
  return cropsData.filter(crop => crop.season === season);
}; 

export const getCropsByRegion = (region: string) => {
  return cropsData.filter(crop => crop.region.includes(region));
};

export const getHighProfitabilityCrops = () => {
  return cropsData.filter(crop => crop.profitability === 'High');
};

export const getLowWaterCrops = () => {
  return cropsData.filter(crop => crop.waterRequirement === 'Low');
};
