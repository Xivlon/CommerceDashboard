import { apiRequest } from "./queryClient";
import type { 
  CustomerWithPredictions, 
  MLPrediction, 
  ProductRecommendation,
  ProductWithRecommendations,
  DashboardMetrics,
  MLInsight,
  SalesMetric
} from "@shared/schema";

// Customer and CLV API functions
export async function getCustomersWithPredictions(limit = 50, offset = 0): Promise<CustomerWithPredictions[]> {
  const response = await apiRequest("GET", `/api/customers?predictions=true&limit=${limit}&offset=${offset}`);
  return response.json();
}

export async function getCLVPredictions(customerId?: number): Promise<MLPrediction[]> {
  const url = customerId 
    ? `/api/predictions/clv?customerId=${customerId}`
    : `/api/predictions/clv`;
  const response = await apiRequest("GET", url);
  return response.json();
}

export async function generateCLVPrediction(customerId: number): Promise<MLPrediction> {
  const response = await apiRequest("POST", "/api/predictions/clv/generate", { customerId });
  return response.json();
}

// Churn prediction API functions
export async function getChurnPredictions(customerId?: number): Promise<MLPrediction[]> {
  const url = customerId 
    ? `/api/predictions/churn?customerId=${customerId}`
    : `/api/predictions/churn`;
  const response = await apiRequest("GET", url);
  return response.json();
}

export async function analyzeChurnRisk(): Promise<MLPrediction[]> {
  const response = await apiRequest("POST", "/api/predictions/churn/analyze");
  return response.json();
}

// Sales forecasting API functions
export async function getSalesForecast(days = 30): Promise<{
  forecastPeriod: { startDate: Date; endDate: Date; days: number };
  historical: SalesMetric[];
  forecast: any[];
  confidence: number;
  modelMetrics: {
    rmse: number;
    mape: number;
    r2: number;
  };
}> {
  const response = await apiRequest("GET", `/api/forecast/sales?days=${days}`);
  return response.json();
}

export async function getSalesMetrics(startDate?: Date, endDate?: Date): Promise<SalesMetric[]> {
  let url = "/api/sales-metrics";
  const params = new URLSearchParams();
  
  if (startDate) {
    params.append("startDate", startDate.toISOString());
  }
  if (endDate) {
    params.append("endDate", endDate.toISOString());
  }
  
  if (params.toString()) {
    url += `?${params.toString()}`;
  }
  
  const response = await apiRequest("GET", url);
  return response.json();
}

// Product recommendations API functions
export async function getProductRecommendations(productId?: number, type?: string): Promise<ProductRecommendation[]> {
  let url = "/api/recommendations/products";
  const params = new URLSearchParams();
  
  if (productId) {
    params.append("productId", productId.toString());
  }
  if (type) {
    params.append("type", type);
  }
  
  if (params.toString()) {
    url += `?${params.toString()}`;
  }
  
  const response = await apiRequest("GET", url);
  return response.json();
}

export async function generateProductRecommendations(): Promise<ProductRecommendation[]> {
  const response = await apiRequest("POST", "/api/recommendations/generate");
  return response.json();
}

// Dashboard API functions
export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const response = await apiRequest("GET", "/api/dashboard/metrics");
  return response.json();
}

export async function getMLInsights(): Promise<MLInsight[]> {
  const response = await apiRequest("GET", "/api/dashboard/insights");
  return response.json();
}

// ML model management
export async function retrainModels(modelType: string): Promise<{ success: boolean; accuracy: number; timestamp: Date }> {
  const response = await apiRequest("POST", "/api/ml/retrain", { modelType });
  return response.json();
}

// Utility functions for data processing
export function calculateCLVGrowth(current: number, predicted: number): number {
  if (current === 0) return 0;
  return ((predicted - current) / current) * 100;
}

export function getChurnRiskLevel(score: number): 'low' | 'medium' | 'high' {
  if (score >= 0.7) return 'high';
  if (score >= 0.4) return 'medium';
  return 'low';
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatConfidence(confidence: number): string {
  return `${(confidence * 100).toFixed(0)}%`;
}

// Data validation functions
export function isValidCLVPrediction(prediction: MLPrediction): boolean {
  return (
    prediction.predictionType === 'clv' &&
    prediction.predictedValue !== null &&
    prediction.confidence !== null &&
    parseFloat(prediction.confidence) >= 0 &&
    parseFloat(prediction.confidence) <= 1
  );
}

export function isValidChurnPrediction(prediction: MLPrediction): boolean {
  return (
    prediction.predictionType === 'churn' &&
    prediction.predictedValue !== null &&
    prediction.confidence !== null &&
    parseFloat(prediction.predictedValue) >= 0 &&
    parseFloat(prediction.predictedValue) <= 1
  );
}

export function isValidRecommendation(recommendation: ProductRecommendation): boolean {
  return (
    recommendation.productId > 0 &&
    recommendation.recommendedProductId > 0 &&
    recommendation.productId !== recommendation.recommendedProductId &&
    parseFloat(recommendation.confidence) >= 0 &&
    parseFloat(recommendation.confidence) <= 1
  );
}

// Error handling wrapper
export async function withErrorHandling<T>(
  apiCall: () => Promise<T>,
  errorMessage: string
): Promise<T | null> {
  try {
    return await apiCall();
  } catch (error) {
    console.error(`${errorMessage}:`, error);
    return null;
  }
}

// Batch operations
export async function generateAllPredictions(): Promise<{
  clv: MLPrediction[];
  churn: MLPrediction[];
  recommendations: ProductRecommendation[];
}> {
  try {
    const [churnPredictions, recommendations] = await Promise.all([
      analyzeChurnRisk(),
      generateProductRecommendations()
    ]);

    // CLV predictions are generated per customer, so we'll get existing ones
    const clvPredictions = await getCLVPredictions();

    return {
      clv: clvPredictions,
      churn: churnPredictions,
      recommendations
    };
  } catch (error) {
    console.error('Failed to generate all predictions:', error);
    throw error;
  }
}

export async function refreshAllData(): Promise<{
  metrics: DashboardMetrics;
  insights: MLInsight[];
  customers: CustomerWithPredictions[];
}> {
  try {
    const [metrics, insights, customers] = await Promise.all([
      getDashboardMetrics(),
      getMLInsights(),
      getCustomersWithPredictions(100, 0)
    ]);

    return { metrics, insights, customers };
  } catch (error) {
    console.error('Failed to refresh all data:', error);
    throw error;
  }
}
