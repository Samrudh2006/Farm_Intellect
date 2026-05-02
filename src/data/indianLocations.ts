// Comprehensive list of Indian cities/towns organized by state
// Covers all states and major agricultural regions

import { createDatasetMetadata } from "./datasetMetadata";

export interface IndianLocation {
  city: string;
  state: string;
  label: string; // "City, State"
}

export const indianLocationsMetadata = createDatasetMetadata({
  version: "1.0.0",
  lastUpdated: "2024-10-01T00:00:00Z",
  source: "Govt open data + census town lists",
  notes: "Primary districts and market towns for geo personalization.",
});

const locationsByState: Record<string, string[]> = {
  "Andhra Pradesh": [
    "Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Kakinada",
    "Rajahmundry", "Tirupati", "Kadapa", "Anantapur", "Eluru", "Ongole",
    "Chittoor", "Machilipatnam", "Srikakulam", "Tenali", "Proddatur", "Adoni"
  ],
  "Arunachal Pradesh": [
    "Itanagar", "Naharlagun", "Pasighat", "Tawang", "Ziro", "Bomdila", "Along"
  ],
  "Assam": [
    "Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Nagaon", "Tinsukia",
    "Tezpur", "Bongaigaon", "Karimganj", "Goalpara", "Sivasagar", "Lakhimpur"
  ],
  "Bihar": [
    "Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Darbhanga", "Purnia",
    "Arrah", "Begusarai", "Katihar", "Munger", "Chapra", "Sasaram",
    "Hajipur", "Bihar Sharif", "Sitamarhi", "Samastipur", "Bettiah", "Motihari"
  ],
  "Chhattisgarh": [
    "Raipur", "Bhilai", "Bilaspur", "Korba", "Durg", "Rajnandgaon",
    "Raigarh", "Jagdalpur", "Ambikapur", "Dhamtari", "Mahasamund", "Kawardha"
  ],
  "Goa": [
    "Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda", "Bicholim"
  ],
  "Gujarat": [
    "Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar",
    "Junagadh", "Gandhinagar", "Anand", "Mehsana", "Morbi", "Nadiad",
    "Bharuch", "Navsari", "Valsad", "Surendranagar", "Palanpur", "Godhra",
    "Porbandar", "Kutch", "Amreli", "Dahod", "Patan"
  ],
  "Haryana": [
    "Chandigarh", "Faridabad", "Gurugram", "Panipat", "Ambala", "Karnal",
    "Hisar", "Rohtak", "Sonipat", "Yamunanagar", "Panchkula", "Bhiwani",
    "Sirsa", "Jind", "Kaithal", "Kurukshetra", "Fatehabad", "Rewari",
    "Palwal", "Mahendragarh"
  ],
  "Himachal Pradesh": [
    "Shimla", "Mandi", "Dharamshala", "Solan", "Kullu", "Manali",
    "Hamirpur", "Una", "Bilaspur", "Nahan", "Palampur", "Kangra", "Chamba"
  ],
  "Jharkhand": [
    "Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Deoghar", "Hazaribagh",
    "Giridih", "Ramgarh", "Dumka", "Chaibasa", "Phusro", "Medininagar"
  ],
  "Karnataka": [
    "Bengaluru", "Mysuru", "Hubli", "Mangaluru", "Belgaum", "Gulbarga",
    "Davangere", "Bellary", "Shimoga", "Tumkur", "Raichur", "Bidar",
    "Hospet", "Hassan", "Gadag", "Udupi", "Mandya", "Chitradurga",
    "Chikmagalur", "Bagalkot", "Dharwad", "Kolar"
  ],
  "Kerala": [
    "Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam",
    "Kannur", "Alappuzha", "Palakkad", "Malappuram", "Kottayam",
    "Kasaragod", "Pathanamthitta", "Idukki", "Wayanad"
  ],
  "Madhya Pradesh": [
    "Bhopal", "Indore", "Jabalpur", "Gwalior", "Ujjain", "Sagar",
    "Dewas", "Satna", "Ratlam", "Rewa", "Murwara", "Singrauli",
    "Burhanpur", "Khandwa", "Bhind", "Chhindwara", "Guna", "Shivpuri",
    "Vidisha", "Damoh", "Mandsaur", "Khargone", "Neemuch", "Hoshangabad"
  ],
  "Maharashtra": [
    "Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad", "Solapur",
    "Kolhapur", "Amravati", "Nanded", "Sangli", "Akola", "Latur",
    "Jalgaon", "Ahmednagar", "Chandrapur", "Wardha", "Dhule", "Beed",
    "Parbhani", "Osmanabad", "Satara", "Ratnagiri", "Sindhudurg",
    "Buldhana", "Yavatmal", "Washim", "Hingoli", "Jalna", "Gondia"
  ],
  "Manipur": [
    "Imphal", "Thoubal", "Bishnupur", "Churachandpur", "Kakching"
  ],
  "Meghalaya": [
    "Shillong", "Tura", "Jowai", "Nongpoh", "Williamnagar"
  ],
  "Mizoram": [
    "Aizawl", "Lunglei", "Champhai", "Serchhip", "Kolasib"
  ],
  "Nagaland": [
    "Kohima", "Dimapur", "Mokokchung", "Tuensang", "Wokha", "Mon"
  ],
  "Odisha": [
    "Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur",
    "Puri", "Balasore", "Baripada", "Bhadrak", "Jeypore", "Jharsuguda",
    "Angul", "Dhenkanal", "Kendrapara", "Koraput"
  ],
  "Punjab": [
    "Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda",
    "Mohali", "Hoshiarpur", "Pathankot", "Moga", "Abohar",
    "Malerkotla", "Khanna", "Phagwara", "Muktsar", "Barnala",
    "Rajpura", "Firozpur", "Kapurthala", "Faridkot", "Sangrur",
    "Fazilka", "Gurdaspur", "Mansa", "Nawanshahr", "Rupnagar",
    "Tarn Taran"
  ],
  "Rajasthan": [
    "Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer", "Bikaner",
    "Bhilwara", "Alwar", "Bharatpur", "Sikar", "Pali", "Sri Ganganagar",
    "Hanumangarh", "Nagaur", "Jhunjhunu", "Churu", "Tonk", "Bundi",
    "Baran", "Chittorgarh", "Barmer", "Jaisalmer", "Sawai Madhopur",
    "Jhalawar", "Dungarpur", "Banswara", "Pratapgarh", "Rajsamand"
  ],
  "Sikkim": [
    "Gangtok", "Namchi", "Gyalshing", "Mangan", "Rangpo"
  ],
  "Tamil Nadu": [
    "Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem",
    "Tirunelveli", "Erode", "Vellore", "Thoothukudi", "Dindigul",
    "Thanjavur", "Tirupur", "Ranipet", "Sivakasi", "Karur",
    "Nagercoil", "Kanchipuram", "Kumbakonam", "Rajapalayam",
    "Pudukkottai", "Hosur", "Nagapattinam", "Villupuram"
  ],
  "Telangana": [
    "Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam",
    "Ramagundam", "Mahbubnagar", "Nalgonda", "Adilabad", "Suryapet",
    "Siddipet", "Miryalaguda", "Mancherial", "Kamareddy"
  ],
  "Tripura": [
    "Agartala", "Dharmanagar", "Udaipur", "Kailashahar", "Belonia"
  ],
  "Uttar Pradesh": [
    "Lucknow", "Kanpur", "Agra", "Varanasi", "Meerut", "Prayagraj",
    "Ghaziabad", "Noida", "Bareilly", "Aligarh", "Moradabad", "Saharanpur",
    "Gorakhpur", "Faizabad", "Jhansi", "Mathura", "Firozabad", "Rampur",
    "Muzaffarnagar", "Shahjahanpur", "Etawah", "Banda", "Sultanpur",
    "Hardoi", "Sitapur", "Lakhimpur Kheri", "Unnao", "Rae Bareli",
    "Fatehpur", "Mirzapur", "Basti", "Azamgarh", "Deoria", "Bulandshahr",
    "Barabanki", "Mainpuri", "Etah", "Hathras", "Pratapgarh"
  ],
  "Uttarakhand": [
    "Dehradun", "Haridwar", "Rishikesh", "Roorkee", "Haldwani",
    "Rudrapur", "Kashipur", "Nainital", "Almora", "Pithoragarh",
    "Mussoorie", "Kotdwar", "Pauri"
  ],
  "West Bengal": [
    "Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri",
    "Bardhaman", "Malda", "Baharampur", "Habra", "Kharagpur",
    "Shantiniketan", "Darjeeling", "Jalpaiguri", "Raiganj",
    "Haldia", "Krishnanagar", "Cooch Behar", "Balurghat", "Midnapore"
  ],
  // Union Territories
  "Delhi": [
    "New Delhi", "Delhi"
  ],
  "Jammu & Kashmir": [
    "Srinagar", "Jammu", "Anantnag", "Baramulla", "Sopore",
    "Kathua", "Udhampur", "Pulwama", "Kupwara", "Rajouri"
  ],
  "Ladakh": [
    "Leh", "Kargil"
  ],
  "Puducherry": [
    "Puducherry", "Karaikal", "Mahe", "Yanam"
  ],
  "Chandigarh": [
    "Chandigarh"
  ],
  "Andaman & Nicobar": [
    "Port Blair"
  ],
  "Dadra & Nagar Haveli and Daman & Diu": [
    "Silvassa", "Daman", "Diu"
  ],
  "Lakshadweep": [
    "Kavaratti"
  ],
};

// Build flat list
export const indianLocations: IndianLocation[] = [];

for (const [state, cities] of Object.entries(locationsByState)) {
  for (const city of cities) {
    indianLocations.push({
      city,
      state,
      label: `${city}, ${state}`,
    });
  }
}

// Get unique states
export const indianStates = Object.keys(locationsByState).sort();

// Get cities for a specific state
export const getCitiesByState = (state: string): string[] => {
  return locationsByState[state] || [];
};

// Search locations by query
export const searchLocations = (query: string): IndianLocation[] => {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase();
  return indianLocations
    .filter((loc) => loc.city.toLowerCase().includes(q) || loc.state.toLowerCase().includes(q))
    .slice(0, 20);
};

export default indianLocations;
