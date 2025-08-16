// src/mockApi.js

// Example: fake sales data
export async function fetchSalesData() {
  // Simulate API delay
  await new Promise(res => setTimeout(res, 300));
  return [
    { date: "2025-08-01", sales: 1200 },
    { date: "2025-08-02", sales: 980 },
    { date: "2025-08-03", sales: 1450 },
  ];
}

// Example: fake customer segmentation
export async function fetchCustomers() {
  return [
    { name: "Alice", segment: "Premium", lifetimeValue: 12000 },
    { name: "Bob", segment: "Standard", lifetimeValue: 3200 },
    { name: "Clara", segment: "New", lifetimeValue: 500 },
  ];
}
