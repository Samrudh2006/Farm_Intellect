export const merchants = [
  {
    id: "merchant-1",
    name: "Raj Agro Trading",
    company: "Raj Agro Pvt Ltd",
    location: "Pune, Maharashtra",
    distance: "12 km",
    rating: 4.5,
    phone: "+91 98765 43210",
    specialties: ["Wheat", "Rice", "Pulses"],
    crops: [
      { name: "Wheat", price: 2150, unit: "quintal", demand: "high" },
      { name: "Rice", price: 3200, unit: "quintal", demand: "medium" },
      { name: "Chickpea", price: 5800, unit: "quintal", demand: "high" }
    ],
    verified: true
  },
  {
    id: "merchant-2",
    name: "Green Valley Foods",
    company: "Green Valley Processing",
    location: "Nashik, Maharashtra",
    distance: "25 km",
    rating: 4.2,
    phone: "+91 98765 43211",
    specialties: ["Vegetables", "Fruits", "Organic"],
    crops: [
      { name: "Tomato", price: 25, unit: "kg", demand: "high" },
      { name: "Onion", price: 18, unit: "kg", demand: "medium" },
      { name: "Potato", price: 15, unit: "kg", demand: "low" }
    ],
    verified: true
  },
  {
    id: "merchant-3",
    name: "Maharashtra Cotton Corp",
    company: "Cotton Corporation of India",
    location: "Aurangabad, Maharashtra",
    distance: "45 km",
    rating: 4.8,
    phone: "+91 98765 43212",
    specialties: ["Cotton", "Sugarcane"],
    crops: [
      { name: "Cotton", price: 6200, unit: "quintal", demand: "high" },
      { name: "Sugarcane", price: 350, unit: "quintal", demand: "medium" }
    ],
    verified: true
  }
];

export const cropDemand = [
  {
    crop: "Wheat",
    avgPrice: 2180,
    merchants: 8,
    trend: "up",
    recommendation: "High demand due to festival season. Best time to sell."
  },
  {
    crop: "Rice",
    avgPrice: 3150,
    merchants: 6,
    trend: "stable",
    recommendation: "Stable prices. Good time for bulk sales."
  },
  {
    crop: "Cotton",
    avgPrice: 6350,
    merchants: 4,
    trend: "up",
    recommendation: "Export demand increasing. Premium prices available."
  },
  {
    crop: "Tomato",
    avgPrice: 28,
    merchants: 12,
    trend: "down",
    recommendation: "Oversupply in market. Consider processed sales."
  }
];
