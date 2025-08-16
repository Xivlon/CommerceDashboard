// src/lib/mockApi.ts
export async function getDashboardMetrics() {
  await new Promise((res) => setTimeout(res, 300)); // fake delay
  return {
    revenue: 15230,
    orders: 320,
    customers: 87,
    avgOrderValue: 48,
    churnRate: 0.12,
  };
}

export async function getMLInsights() {
  await new Promise((res) => setTimeout(res, 300));
  return [
    {
      type: "revenue",
      title: "Revenue Growth Opportunity",
      description: "Upselling accessories could increase revenue by 12%.",
      actionable: true,
    },
    {
      type: "churn",
      title: "Churn Risk Identified",
      description: "20% of premium customers are at risk of churn.",
      actionable: true,
    },
    {
      type: "cross_sell",
      title: "Cross-sell Potential",
      description: "Customers buying laptops often purchase mice.",
      actionable: false,
    },
  ];
}

export async function retrainModels(scope: string) {
  await new Promise((res) => setTimeout(res, 1000));
  return { success: true, scope };
}
