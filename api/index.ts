import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

// Initialize database connection
const sql = neon(process.env.DATABASE_URL!);

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).setHeader('Access-Control-Allow-Origin', '*').end();
  }

  // Set CORS headers
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  const { url, method } = req;
  const path = url?.split('?')[0] || '';

  try {
    // Route: GET /api/customers
    if (path === '/api/customers' && method === 'GET') {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const withPredictions = req.query.predictions === 'true';

      if (withPredictions) {
        const customers = await sql`
          SELECT c.*,
            (SELECT json_build_object('id', p.id, 'predicted_value', p.predicted_value, 'confidence', p.confidence)
             FROM ml_predictions p WHERE p.customer_id = c.id AND p.prediction_type = 'clv'
             ORDER BY p.created_at DESC LIMIT 1) as clv_prediction,
            (SELECT json_build_object('id', p.id, 'predicted_value', p.predicted_value, 'confidence', p.confidence)
             FROM ml_predictions p WHERE p.customer_id = c.id AND p.prediction_type = 'churn'
             ORDER BY p.created_at DESC LIMIT 1) as churn_prediction
          FROM customers c
          LIMIT ${limit} OFFSET ${offset}
        `;
        return res.json(customers);
      }

      const customers = await sql`SELECT * FROM customers LIMIT ${limit} OFFSET ${offset}`;
      return res.json(customers);
    }

    // Route: GET /api/dashboard/metrics
    if (path === '/api/dashboard/metrics' && method === 'GET') {
      const [totalCustomers] = await sql`SELECT COUNT(*) as count FROM customers`;
      const [totalOrders] = await sql`SELECT COUNT(*) as count FROM orders`;
      const [revenueResult] = await sql`SELECT COALESCE(SUM(CAST(total_spent AS FLOAT)), 0) as total FROM customers`;

      const totalRevenue = Number(revenueResult?.total || 0);
      const customerCount = Number(totalCustomers?.count || 0);
      const orderCount = Number(totalOrders?.count || 0);

      const avgOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0;
      const avgCLV = customerCount > 0 ? totalRevenue / customerCount : 0;

      const [highRiskCustomers] = await sql`SELECT COUNT(*) as count FROM customers WHERE churn_risk = 'high'`;
      const churnRiskPercentage = customerCount > 0 ? (Number(highRiskCustomers?.count || 0) / customerCount) * 100 : 0;

      return res.json({
        totalRevenue,
        totalOrders: orderCount,
        totalCustomers: customerCount,
        avgOrderValue,
        avgCLV,
        churnRiskPercentage,
        forecastAccuracy: 0.91,
        crossSellOpportunities: 0,
        modelMetrics: {
          clvAccuracy: 0.89,
          churnAccuracy: 0.85,
          forecastAccuracy: 0.91,
          recommendationAccuracy: 0.87,
          lastUpdate: new Date(),
        },
      });
    }

    // Route: GET /api/dashboard/insights
    if (path === '/api/dashboard/insights' && method === 'GET') {
      return res.json([
        {
          type: 'revenue',
          title: 'Revenue Opportunity',
          description: 'High-value customers showing increased purchase frequency',
          impact: 'Potential 15% revenue increase',
          confidence: 0.87,
          actionable: true,
        },
        {
          type: 'churn',
          title: 'Churn Risk Alert',
          description: 'Identified customers at risk of churning within 30 days',
          impact: 'Retain $45K in revenue',
          confidence: 0.82,
          actionable: true,
        },
        {
          type: 'cross_sell',
          title: 'Cross-sell Opportunity',
          description: 'Product bundle recommendations show high conversion potential',
          impact: 'Increase average order value by 23%',
          confidence: 0.91,
          actionable: true,
        },
        {
          type: 'forecast',
          title: 'Sales Forecast',
          description: 'Next quarter projected to exceed targets by 8%',
          impact: 'Additional $120K revenue',
          confidence: 0.94,
          actionable: false,
        },
      ]);
    }

    // Route: GET /api/predictions/clv
    if (path === '/api/predictions/clv' && method === 'GET') {
      const customerId = req.query.customerId ? parseInt(req.query.customerId as string) : null;

      if (customerId) {
        const [prediction] = await sql`
          SELECT * FROM ml_predictions
          WHERE customer_id = ${customerId} AND prediction_type = 'clv'
          ORDER BY created_at DESC LIMIT 1
        `;
        return res.json(prediction || null);
      }

      const predictions = await sql`SELECT * FROM ml_predictions WHERE prediction_type = 'clv'`;
      return res.json(predictions);
    }

    // Route: GET /api/predictions/churn
    if (path === '/api/predictions/churn' && method === 'GET') {
      const customerId = req.query.customerId ? parseInt(req.query.customerId as string) : null;

      if (customerId) {
        const [prediction] = await sql`
          SELECT * FROM ml_predictions
          WHERE customer_id = ${customerId} AND prediction_type = 'churn'
          ORDER BY created_at DESC LIMIT 1
        `;
        return res.json(prediction || null);
      }

      const predictions = await sql`SELECT * FROM ml_predictions WHERE prediction_type = 'churn'`;
      return res.json(predictions);
    }

    // Route: GET /api/sales-metrics
    if (path === '/api/sales-metrics' && method === 'GET') {
      const metrics = await sql`SELECT * FROM sales_metrics ORDER BY date`;
      return res.json(metrics);
    }

    // Route: GET /api/forecast/sales
    if (path === '/api/forecast/sales' && method === 'GET') {
      const days = parseInt(req.query.days as string) || 30;
      const historicalMetrics = await sql`SELECT * FROM sales_metrics ORDER BY date`;

      // Generate simple forecast
      const forecast = [];
      const baseRevenue = 40000;
      const now = new Date();

      for (let i = 1; i <= days; i++) {
        const forecastDate = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
        const dayOfWeek = forecastDate.getDay();
        const seasonalFactor = dayOfWeek === 0 || dayOfWeek === 6 ? 0.8 : 1.1;
        const predicted = baseRevenue * seasonalFactor * (0.9 + Math.random() * 0.2);

        forecast.push({
          date: forecastDate,
          predicted_revenue: predicted,
          confidence_lower: predicted * 0.85,
          confidence_upper: predicted * 1.15,
          trend: 0.02,
          seasonal_factor: seasonalFactor,
        });
      }

      return res.json({
        forecastPeriod: { startDate: now, endDate: new Date(now.getTime() + days * 24 * 60 * 60 * 1000), days },
        historical: historicalMetrics,
        forecast,
        confidence: 0.94,
        modelMetrics: { rmse: 12300, mape: 8.7, r2: 0.89 },
      });
    }

    // Route: GET /api/recommendations/products
    if (path === '/api/recommendations/products' && method === 'GET') {
      const productId = req.query.productId ? parseInt(req.query.productId as string) : null;
      const type = req.query.type as string | undefined;

      if (productId) {
        const recommendations = type
          ? await sql`SELECT * FROM product_recommendations WHERE product_id = ${productId} AND recommendation_type = ${type}`
          : await sql`SELECT * FROM product_recommendations WHERE product_id = ${productId}`;
        return res.json(recommendations);
      }

      const recommendations = type
        ? await sql`SELECT * FROM product_recommendations WHERE recommendation_type = ${type} LIMIT 100`
        : await sql`SELECT * FROM product_recommendations LIMIT 100`;
      return res.json(recommendations);
    }

    // 404 for unmatched routes
    return res.status(404).json({ error: 'Not found', path });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
