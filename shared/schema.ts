import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  registrationDate: timestamp("registration_date").notNull().defaultNow(),
  totalSpent: decimal("total_spent", { precision: 10, scale: 2 }).notNull().default('0'),
  orderCount: integer("order_count").notNull().default(0),
  lastPurchaseDate: timestamp("last_purchase_date"),
  segment: text("segment").notNull().default('new'), // new, low, medium, high, vip
  churnRisk: text("churn_risk").notNull().default('low'), // low, medium, high
  isActive: boolean("is_active").notNull().default(true),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull(),
  orderDate: timestamp("order_date").notNull().defaultNow(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  itemCount: integer("item_count").notNull(),
  status: text("status").notNull().default('completed'), // pending, completed, cancelled
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
});

export const mlPredictions = pgTable("ml_predictions", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull(),
  predictionType: text("prediction_type").notNull(), // clv, churn, forecast
  predictedValue: decimal("predicted_value", { precision: 10, scale: 2 }),
  confidence: decimal("confidence", { precision: 5, scale: 4 }),
  features: jsonb("features"), // Store feature data as JSON
  createdAt: timestamp("created_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at"),
});

export const salesMetrics = pgTable("sales_metrics", {
  id: serial("id").primaryKey(),
  date: timestamp("date").notNull(),
  revenue: decimal("revenue", { precision: 12, scale: 2 }).notNull(),
  orderCount: integer("order_count").notNull(),
  customerCount: integer("customer_count").notNull(),
  avgOrderValue: decimal("avg_order_value", { precision: 10, scale: 2 }),
  conversionRate: decimal("conversion_rate", { precision: 5, scale: 4 }),
});

export const productRecommendations = pgTable("product_recommendations", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  recommendedProductId: integer("recommended_product_id").notNull(),
  recommendationType: text("recommendation_type").notNull(), // cross_sell, up_sell
  confidence: decimal("confidence", { precision: 5, scale: 4 }).notNull(),
  support: decimal("support", { precision: 5, scale: 4 }),
  lift: decimal("lift", { precision: 8, scale: 4 }),
  coOccurrenceCount: integer("co_occurrence_count").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Insert schemas
export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  registrationDate: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  orderDate: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
});

export const insertMLPredictionSchema = createInsertSchema(mlPredictions).omit({
  id: true,
  createdAt: true,
});

export const insertSalesMetricSchema = createInsertSchema(salesMetrics).omit({
  id: true,
});

export const insertProductRecommendationSchema = createInsertSchema(productRecommendations).omit({
  id: true,
  createdAt: true,
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Types
export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

export type MLPrediction = typeof mlPredictions.$inferSelect;
export type InsertMLPrediction = z.infer<typeof insertMLPredictionSchema>;

export type SalesMetric = typeof salesMetrics.$inferSelect;
export type InsertSalesMetric = z.infer<typeof insertSalesMetricSchema>;

export type ProductRecommendation = typeof productRecommendations.$inferSelect;
export type InsertProductRecommendation = z.infer<typeof insertProductRecommendationSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

// Extended types for API responses
export type CustomerWithPredictions = Customer & {
  clvPrediction?: MLPrediction;
  churnPrediction?: MLPrediction;
  predictedCLV?: number;
  churnRiskScore?: number;
};

export type ProductWithRecommendations = Product & {
  crossSellProducts?: ProductRecommendation[];
  upSellProducts?: ProductRecommendation[];
};

export type DashboardMetrics = {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  avgOrderValue: number;
  avgCLV: number;
  churnRiskPercentage: number;
  forecastAccuracy: number;
  crossSellOpportunities: number;
  modelMetrics: {
    clvAccuracy: number;
    churnAccuracy: number;
    forecastAccuracy: number;
    recommendationAccuracy: number;
    lastUpdate: Date;
  };
};

export type MLInsight = {
  type: 'revenue' | 'churn' | 'cross_sell' | 'forecast';
  title: string;
  description: string;
  impact: string;
  confidence: number;
  actionable: boolean;
};
