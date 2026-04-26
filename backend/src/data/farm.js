export const sensors = [
  {
    id: "sensor-1",
    name: "Soil Moisture Sensor A1",
    type: "soil_moisture",
    location: "Field A - Section 1",
    status: "online",
    battery: 85,
    lastReading: "2024-09-18T14:30:00Z",
    value: 42,
    unit: "%",
    optimal: { min: 35, max: 65 },
    coordinates: { lat: 30.901, lng: 75.857 }
  },
  {
    id: "sensor-2",
    name: "Temperature Sensor A2",
    type: "temperature",
    location: "Field A - Section 2",
    status: "online",
    battery: 92,
    lastReading: "2024-09-18T14:28:00Z",
    value: 24.5,
    unit: "°C",
    optimal: { min: 18, max: 28 },
    coordinates: { lat: 30.903, lng: 75.859 }
  },
  {
    id: "sensor-3",
    name: "pH Sensor B1",
    type: "ph",
    location: "Field B - Section 1",
    status: "warning",
    battery: 23,
    lastReading: "2024-09-18T13:15:00Z",
    value: 6.8,
    unit: "pH",
    optimal: { min: 6.0, max: 7.5 },
    coordinates: { lat: 30.899, lng: 75.854 }
  },
  {
    id: "sensor-4",
    name: "Soil Moisture Sensor B2",
    type: "soil_moisture",
    location: "Field B - Section 2",
    status: "offline",
    battery: 0,
    lastReading: "2024-09-17T09:22:00Z",
    value: 28,
    unit: "%",
    optimal: { min: 35, max: 65 },
    coordinates: { lat: 30.897, lng: 75.852 }
  },
  {
    id: "sensor-5",
    name: "NPK Sensor C1",
    type: "npk",
    location: "Field C - Section 1",
    status: "online",
    battery: 67,
    lastReading: "2024-09-18T14:25:00Z",
    value: 185,
    unit: "ppm",
    optimal: { min: 150, max: 300 },
    coordinates: { lat: 30.905, lng: 75.861 }
  }
];

export const fields = [
  {
    id: "field-1",
    name: "Field A",
    area: "12.5 hectares",
    crop: "Winter Wheat",
    coordinates: [
      { lat: 30.901, lng: 75.857 },
      { lat: 30.903, lng: 75.859 },
      { lat: 30.904, lng: 75.856 },
      { lat: 30.902, lng: 75.854 }
    ],
    sensors: [
      { type: "soil_moisture", value: 42, status: "optimal" },
      { type: "temperature", value: 24.5, status: "optimal" }
    ],
    health: 85,
    lastUpdated: "2024-09-18T14:30:00Z"
  },
  {
    id: "field-2",
    name: "Field B",
    area: "8.2 hectares",
    crop: "Corn",
    coordinates: [
      { lat: 30.899, lng: 75.854 },
      { lat: 30.9, lng: 75.852 },
      { lat: 30.898, lng: 75.85 },
      { lat: 30.897, lng: 75.852 }
    ],
    sensors: [
      { type: "ph", value: 6.8, status: "warning" },
      { type: "soil_moisture", value: 28, status: "low" }
    ],
    health: 67,
    lastUpdated: "2024-09-18T13:15:00Z"
  },
  {
    id: "field-3",
    name: "Field C",
    area: "6.8 hectares",
    crop: "Soybeans",
    coordinates: [
      { lat: 30.905, lng: 75.861 },
      { lat: 30.906, lng: 75.863 },
      { lat: 30.907, lng: 75.859 },
      { lat: 30.904, lng: 75.858 }
    ],
    sensors: [
      { type: "npk", value: 185, status: "optimal" }
    ],
    health: 92,
    lastUpdated: "2024-09-18T14:25:00Z"
  }
];
