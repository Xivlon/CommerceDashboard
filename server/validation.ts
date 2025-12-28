import { z } from "zod";

// Query parameter schemas
export const paginationSchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(50),
  offset: z.coerce.number().int().nonnegative().default(0),
});

export const customerQuerySchema = paginationSchema.extend({
  predictions: z.enum(['true', 'false']).optional().default('false'),
});

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const customerIdQuerySchema = z.object({
  customerId: z.coerce.number().int().positive().optional(),
});

export const salesForecastQuerySchema = z.object({
  days: z.coerce.number().int().positive().max(365).default(30),
  startDate: z.string().datetime().optional(),
});

export const salesMetricsQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const productRecommendationsQuerySchema = z.object({
  productId: z.coerce.number().int().positive().optional(),
  type: z.enum(['cross_sell', 'up_sell']).optional(),
});

// Request body schemas
export const generateCLVBodySchema = z.object({
  customerId: z.number().int().positive(),
});

export const retrainModelBodySchema = z.object({
  modelType: z.enum(['clv', 'churn', 'forecast', 'recommendations', 'all']),
});

// Forecast data types
export interface ForecastDataPoint {
  date: Date;
  predicted_revenue: number;
  confidence_lower: number;
  confidence_upper: number;
  trend: number;
  seasonal_factor: number;
}

export interface SalesForecastResponse {
  forecastPeriod: {
    startDate: Date;
    endDate: Date;
    days: number;
  };
  historical: unknown[];
  forecast: ForecastDataPoint[];
  confidence: number;
  modelMetrics: {
    rmse: number;
    mape: number;
    r2: number;
  };
}

// Customer features for ML predictions
export interface CustomerFeatures {
  totalSpent: number;
  orderCount: number;
  daysSinceRegistration: number;
  daysSinceLastPurchase: number;
  avgOrderValue: number;
}

export interface ChurnFeatures {
  daysSinceLastPurchase: number;
  orderFrequency: number;
  totalSpent: number;
  avgOrderValue: number;
  isActive: boolean;
}

// Validation helper function
export function validateQuery<T>(schema: z.ZodSchema<T>, query: unknown): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(query);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const errors = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
  return { success: false, error: errors };
}

export function validateBody<T>(schema: z.ZodSchema<T>, body: unknown): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(body);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const errors = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
  return { success: false, error: errors };
}

export function validateParams<T>(schema: z.ZodSchema<T>, params: unknown): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(params);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const errors = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
  return { success: false, error: errors };
}
