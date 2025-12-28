-- CommerceDashboard Database Schema
-- Run this in the Neon SQL Editor to create all tables

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  registration_date TIMESTAMP NOT NULL DEFAULT NOW(),
  total_spent DECIMAL(10, 2) NOT NULL DEFAULT '0',
  order_count INTEGER NOT NULL DEFAULT 0,
  last_purchase_date TIMESTAMP,
  segment TEXT NOT NULL DEFAULT 'new',
  churn_risk TEXT NOT NULL DEFAULT 'low',
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL,
  order_date TIMESTAMP NOT NULL DEFAULT NOW(),
  total_amount DECIMAL(10, 2) NOT NULL,
  item_count INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed'
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Order Items table
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL
);

-- ML Predictions table
CREATE TABLE IF NOT EXISTS ml_predictions (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL,
  prediction_type TEXT NOT NULL,
  predicted_value DECIMAL(10, 2),
  confidence DECIMAL(5, 4),
  features JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP
);

-- Sales Metrics table
CREATE TABLE IF NOT EXISTS sales_metrics (
  id SERIAL PRIMARY KEY,
  date TIMESTAMP NOT NULL,
  revenue DECIMAL(12, 2) NOT NULL,
  order_count INTEGER NOT NULL,
  customer_count INTEGER NOT NULL,
  avg_order_value DECIMAL(10, 2),
  conversion_rate DECIMAL(5, 4)
);

-- Product Recommendations table
CREATE TABLE IF NOT EXISTS product_recommendations (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL,
  recommended_product_id INTEGER NOT NULL,
  recommendation_type TEXT NOT NULL,
  confidence DECIMAL(5, 4) NOT NULL,
  support DECIMAL(5, 4),
  lift DECIMAL(8, 4),
  co_occurrence_count INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_segment ON customers(segment);
CREATE INDEX IF NOT EXISTS idx_customers_churn_risk ON customers(churn_risk);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_date ON orders(order_date);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_ml_predictions_customer_id ON ml_predictions(customer_id);
CREATE INDEX IF NOT EXISTS idx_ml_predictions_type ON ml_predictions(prediction_type);
CREATE INDEX IF NOT EXISTS idx_sales_metrics_date ON sales_metrics(date);
CREATE INDEX IF NOT EXISTS idx_product_recommendations_product_id ON product_recommendations(product_id);
CREATE INDEX IF NOT EXISTS idx_product_recommendations_type ON product_recommendations(recommendation_type);
