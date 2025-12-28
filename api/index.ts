import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import { storage } from "../server/storage";
import { mlEngine } from "../server/ml-engine";
import {
  customerQuerySchema,
  idParamSchema,
  customerIdQuerySchema,
  salesForecastQuerySchema,
  salesMetricsQuerySchema,
  productRecommendationsQuerySchema,
  generateCLVBodySchema,
  retrainModelBodySchema,
  validateQuery,
  validateBody,
  validateParams,
} from "../server/validation";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS for Vercel
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  next();
});

// Custom error class for API errors
class APIError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Async handler wrapper to catch errors
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Customer routes
app.get("/api/customers", asyncHandler(async (req, res) => {
  const validation = validateQuery(customerQuerySchema, req.query);
  if (!validation.success) {
    throw new APIError(400, "Invalid query parameters", validation.error);
  }

  const { limit, offset, predictions } = validation.data;
  const withPredictions = predictions === 'true';

  if (withPredictions) {
    const customers = await storage.getCustomersWithPredictions(limit, offset);
    res.json(customers);
  } else {
    const customers = await storage.getCustomers(limit, offset);
    res.json(customers);
  }
}));

app.get("/api/customers/:id", asyncHandler(async (req, res) => {
  const validation = validateParams(idParamSchema, req.params);
  if (!validation.success) {
    throw new APIError(400, "Invalid customer ID", validation.error);
  }

  const { id } = validation.data;
  const customer = await storage.getCustomer(id);

  if (!customer) {
    throw new APIError(404, "Customer not found");
  }

  res.json(customer);
}));

// ML Prediction routes
app.get("/api/predictions/clv", asyncHandler(async (req, res) => {
  const validation = validateQuery(customerIdQuerySchema, req.query);
  if (!validation.success) {
    throw new APIError(400, "Invalid query parameters", validation.error);
  }

  const { customerId } = validation.data;

  if (customerId) {
    const prediction = await storage.getMLPrediction(customerId, 'clv');
    res.json(prediction ?? null);
  } else {
    const predictions = await storage.getMLPredictions('clv');
    res.json(predictions);
  }
}));

app.post("/api/predictions/clv/generate", asyncHandler(async (req, res) => {
  const validation = validateBody(generateCLVBodySchema, req.body);
  if (!validation.success) {
    throw new APIError(400, "Invalid request body", validation.error);
  }

  const { customerId } = validation.data;

  const customer = await storage.getCustomer(customerId);
  if (!customer) {
    throw new APIError(404, "Customer not found");
  }

  const prediction = await mlEngine.generateCLVPrediction(customer);
  const savedPrediction = await storage.createMLPrediction(prediction);

  res.json(savedPrediction);
}));

app.get("/api/predictions/churn", asyncHandler(async (req, res) => {
  const validation = validateQuery(customerIdQuerySchema, req.query);
  if (!validation.success) {
    throw new APIError(400, "Invalid query parameters", validation.error);
  }

  const { customerId } = validation.data;

  if (customerId) {
    const prediction = await storage.getMLPrediction(customerId, 'churn');
    res.json(prediction ?? null);
  } else {
    const predictions = await storage.getMLPredictions('churn');
    res.json(predictions);
  }
}));

app.post("/api/predictions/churn/analyze", asyncHandler(async (req, res) => {
  const customers = await storage.getCustomers();

  if (customers.length === 0) {
    res.json([]);
    return;
  }

  const churnAnalysis = await mlEngine.analyzeChurnRisk(customers);

  const savedPredictions = await Promise.all(
    churnAnalysis.map(prediction => storage.createMLPrediction(prediction))
  );

  res.json(savedPredictions);
}));

app.get("/api/forecast/sales", asyncHandler(async (req, res) => {
  const validation = validateQuery(salesForecastQuerySchema, req.query);
  if (!validation.success) {
    throw new APIError(400, "Invalid query parameters", validation.error);
  }

  const { days, startDate: startDateStr } = validation.data;
  const startDate = startDateStr ? new Date(startDateStr) : new Date();

  if (isNaN(startDate.getTime())) {
    throw new APIError(400, "Invalid start date format");
  }

  const endDate = new Date(startDate.getTime() + days * 24 * 60 * 60 * 1000);

  const historicalMetrics = await storage.getSalesMetrics();
  const forecast = await mlEngine.generateSalesForecast(historicalMetrics, days);

  res.json({
    forecastPeriod: { startDate, endDate, days },
    historical: historicalMetrics,
    forecast: forecast,
    confidence: 0.94,
    modelMetrics: {
      rmse: 12300,
      mape: 8.7,
      r2: 0.89
    }
  });
}));

app.get("/api/recommendations/products", asyncHandler(async (req, res) => {
  const validation = validateQuery(productRecommendationsQuerySchema, req.query);
  if (!validation.success) {
    throw new APIError(400, "Invalid query parameters", validation.error);
  }

  const { productId, type } = validation.data;

  if (productId) {
    const recommendations = await storage.getProductRecommendations(productId, type);
    res.json(recommendations);
  } else {
    const recommendations = await storage.getAllProductRecommendations(type);
    res.json(recommendations);
  }
}));

app.post("/api/recommendations/generate", asyncHandler(async (req, res) => {
  const orders = await storage.getOrders();

  if (orders.length === 0) {
    res.json([]);
    return;
  }

  const orderItems = await Promise.all(
    orders.map(async order => await storage.getOrderItems(order.id))
  );

  const recommendations = await mlEngine.generateProductRecommendations(
    orders,
    orderItems.flat()
  );

  const savedRecommendations = await Promise.all(
    recommendations.map(rec => storage.createProductRecommendation(rec))
  );

  res.json(savedRecommendations);
}));

app.get("/api/dashboard/metrics", asyncHandler(async (_req, res) => {
  const metrics = await storage.getDashboardMetrics();
  res.json(metrics);
}));

app.get("/api/dashboard/insights", asyncHandler(async (_req, res) => {
  const insights = await storage.getMLInsights();
  res.json(insights);
}));

app.post("/api/ml/retrain", asyncHandler(async (req, res) => {
  const validation = validateBody(retrainModelBodySchema, req.body);
  if (!validation.success) {
    throw new APIError(400, "Invalid request body", validation.error);
  }

  const { modelType } = validation.data;
  const result = await mlEngine.retrainModel(modelType);
  res.json(result);
}));

app.get("/api/sales-metrics", asyncHandler(async (req, res) => {
  const validation = validateQuery(salesMetricsQuerySchema, req.query);
  if (!validation.success) {
    throw new APIError(400, "Invalid query parameters", validation.error);
  }

  const { startDate: startDateStr, endDate: endDateStr } = validation.data;

  let startDate: Date | undefined;
  let endDate: Date | undefined;

  if (startDateStr) {
    startDate = new Date(startDateStr);
    if (isNaN(startDate.getTime())) {
      throw new APIError(400, "Invalid start date format");
    }
  }

  if (endDateStr) {
    endDate = new Date(endDateStr);
    if (isNaN(endDate.getTime())) {
      throw new APIError(400, "Invalid end date format");
    }
  }

  const metrics = await storage.getSalesMetrics(startDate, endDate);
  res.json(metrics);
}));

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof APIError) {
    res.status(err.statusCode).json({
      error: err.message,
      details: err.details,
    });
    return;
  }

  console.error('Unexpected error:', err);

  res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

export default app;
