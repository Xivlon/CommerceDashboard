# Database Setup Guide

This guide will help you set up your Neon PostgreSQL database for the CommerceDashboard application.

## Prerequisites

- Node.js installed
- Neon PostgreSQL database created
- Database connection string configured in `.env`

## Quick Setup (Recommended)

Run this single command to create tables and seed data:

```bash
npm run db:setup
```

This command will:
1. Push the database schema to Neon (creates all tables)
2. Seed the database with realistic test data

## Step-by-Step Setup

If you prefer to run each step manually:

### 1. Install Dependencies

```bash
npm install
```

### 2. Create Database Tables

This creates all tables defined in `shared/schema.ts`:

```bash
npm run db:push
```

**Tables created:**
- `users` - Admin/staff authentication
- `customers` - Customer profiles with ML scoring
- `orders` - Customer orders
- `products` - Product catalog
- `order_items` - Order line items
- `ml_predictions` - ML model predictions
- `sales_metrics` - Daily sales analytics
- `product_recommendations` - Market basket analysis

### 3. Seed Test Data

```bash
npm run db:seed
```

**Data seeded:**
- 100 customers with diverse profiles
- 30 products across 5 categories (Electronics, Accessories, Home & Office, Clothing, Health & Fitness)
- 300+ realistic orders with varied patterns
- 200 ML predictions (CLV and churn scores)
- 90 days of sales metrics
- 50+ product recommendations based on purchase patterns

## Database Connection

The database connection string is stored in `.env`:

```
DATABASE_URL='postgresql://neondb_owner:npg_pMQIcOqEo26Y@ep-steep-tree-ad6h7r4h-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
```

## Running the Application

After setup, start the development server:

```bash
npm run dev
```

## Troubleshooting

### Error: "relation does not exist"

This means you haven't run `npm run db:push` yet. Tables must be created before seeding.

**Solution:**
```bash
npm run db:push
npm run db:seed
```

### Connection Issues

If you get connection errors, verify:
1. Your `.env` file has the correct `DATABASE_URL`
2. Your Neon database is active and accessible
3. You have network access to Neon's servers

### Re-seeding the Database

To clear and re-seed all data:

```bash
npm run db:seed
```

The seed script automatically clears existing data before inserting new data.

## Database Schema

The schema is defined in `shared/schema.ts` using Drizzle ORM.

To modify the schema:
1. Edit `shared/schema.ts`
2. Run `npm run db:push` to apply changes
3. Re-seed if needed: `npm run db:seed`

## Additional Commands

- `npm run check` - Type-check TypeScript code
- `npm run build` - Build for production
- `npm start` - Start production server
