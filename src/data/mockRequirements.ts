export interface Requirement {
  id: string;
  merchantId: string;
  merchantName: string;
  crop: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  quality: string;
  deadline: string;
  status: "open" | "fulfilled" | "cancelled";
  createdAt: string;
}

export const mockRequirements: Requirement[] = [
  {
    id: "req-1",
    merchantId: "merch-1",
    merchantName: "AgriCorp Industries",
    crop: "Wheat",
    quantity: 50,
    unit: "tons",
    pricePerUnit: 2200,
    quality: "Organic, Grade A",
    deadline: "2026-06-15",
    status: "open",
    createdAt: "2026-05-28",
  },
  {
    id: "req-2",
    merchantId: "merch-2",
    merchantName: "Fresh Foods Ltd",
    crop: "Tomato",
    quantity: 5,
    unit: "tons",
    pricePerUnit: 1500,
    quality: "Fresh, no blemishes",
    deadline: "2026-06-05",
    status: "open",
    createdAt: "2026-06-01",
  },
  {
    id: "req-3",
    merchantId: "merch-1",
    merchantName: "AgriCorp Industries",
    crop: "Cotton",
    quantity: 100,
    unit: "tons",
    pricePerUnit: 5800,
    quality: "Long staple",
    deadline: "2026-07-01",
    status: "fulfilled",
    createdAt: "2026-05-10",
  },
];
