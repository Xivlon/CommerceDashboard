import { db } from "./db";
import { customers, products, orders, orderItems, mlPredictions, salesMetrics, productRecommendations } from "@shared/schema";

async function seedDatabase() {
  console.log("Starting database seeding...");

  try {
    // Seed customers
    console.log("Seeding customers...");
    const customerData = [
      {
        name: "John Smith",
        email: "john@example.com",
        registrationDate: new Date('2023-01-15'),
        totalSpent: "2547.89",
        orderCount: 12,
        lastPurchaseDate: new Date('2024-01-10'),
        segment: "high",
        churnRisk: "low",
        isActive: true
      },
      {
        name: "Emily Davis",
        email: "emily@example.com",
        registrationDate: new Date('2023-03-22'),
        totalSpent: "1823.45",
        orderCount: 8,
        lastPurchaseDate: new Date('2024-02-15'),
        segment: "medium",
        churnRisk: "medium",
        isActive: true
      },
      {
        name: "Michael Brown",
        email: "michael@example.com",
        registrationDate: new Date('2023-06-10'),
        totalSpent: "456.78",
        orderCount: 3,
        lastPurchaseDate: new Date('2023-12-20'),
        segment: "low",
        churnRisk: "high",
        isActive: false
      },
      {
        name: "Sarah Wilson",
        email: "sarah@example.com",
        registrationDate: new Date('2023-08-05'),
        totalSpent: "3245.67",
        orderCount: 15,
        lastPurchaseDate: new Date('2024-03-01'),
        segment: "vip",
        churnRisk: "low",
        isActive: true
      },
      {
        name: "David Johnson",
        email: "david@example.com",
        registrationDate: new Date('2023-11-12'),
        totalSpent: "987.34",
        orderCount: 6,
        lastPurchaseDate: new Date('2024-01-25'),
        segment: "medium",
        churnRisk: "medium",
        isActive: true
      }
    ];

    const insertedCustomers = await db.insert(customers).values(customerData).returning();
    console.log(`Inserted ${insertedCustomers.length} customers`);

    // Seed products
    console.log("Seeding products...");
    const productData = [
      {
        name: "Wireless Headphones",
        description: "High-quality wireless headphones with noise cancellation",
        price: "299.99",
        category: "Electronics",
        stock: 150,
        isActive: true
      },
      {
        name: "Smart Watch",
        description: "Feature-rich smartwatch with health tracking",
        price: "199.99",
        category: "Electronics",
        stock: 200,
        isActive: true
      },
      {
        name: "Laptop Stand",
        description: "Ergonomic adjustable laptop stand",
        price: "89.99",
        category: "Accessories",
        stock: 75,
        isActive: true
      },
      {
        name: "Bluetooth Speaker",
        description: "Portable wireless speaker with premium sound",
        price: "129.99",
        category: "Electronics",
        stock: 120,
        isActive: true
      },
      {
        name: "Wireless Mouse",
        description: "Precision wireless mouse for productivity",
        price: "49.99",
        category: "Accessories",
        stock: 300,
        isActive: true
      }
    ];

    const insertedProducts = await db.insert(products).values(productData).returning();
    console.log(`Inserted ${insertedProducts.length} products`);

    // Seed orders
    console.log("Seeding orders...");
    const orderData = [
      {
        customerId: insertedCustomers[0].id,
        orderDate: new Date('2024-01-10'),
        status: "completed",
        totalAmount: "399.98",
        itemCount: 2
      },
      {
        customerId: insertedCustomers[1].id,
        orderDate: new Date('2024-02-15'),
        status: "completed",
        totalAmount: "329.98"
      },
      {
        customerId: insertedCustomers[2].id,
        orderDate: new Date('2023-12-20'),
        status: "completed",
        totalAmount: "179.98"
      },
      {
        customerId: insertedCustomers[3].id,
        orderDate: new Date('2024-03-01'),
        status: "completed",
        totalAmount: "549.97"
      },
      {
        customerId: insertedCustomers[4].id,
        orderDate: new Date('2024-01-25'),
        status: "completed",
        totalAmount: "229.98"
      }
    ];

    const insertedOrders = await db.insert(orders).values(orderData).returning();
    console.log(`Inserted ${insertedOrders.length} orders`);

    // Seed order items
    console.log("Seeding order items...");
    const orderItemData = [
      {
        orderId: insertedOrders[0].id,
        productId: insertedProducts[0].id,
        quantity: 1,
        unitPrice: "299.99",
        totalPrice: "299.99"
      },
      {
        orderId: insertedOrders[0].id,
        productId: insertedProducts[4].id,
        quantity: 2,
        unitPrice: "49.99",
        totalPrice: "99.98"
      },
      {
        orderId: insertedOrders[1].id,
        productId: insertedProducts[1].id,
        quantity: 1,
        unitPrice: "199.99",
        totalPrice: "199.99"
      },
      {
        orderId: insertedOrders[1].id,
        productId: insertedProducts[3].id,
        quantity: 1,
        unitPrice: "129.99",
        totalPrice: "129.99"
      }
    ];

    const insertedOrderItems = await db.insert(orderItems).values(orderItemData).returning();
    console.log(`Inserted ${insertedOrderItems.length} order items`);

    // Seed ML predictions
    console.log("Seeding ML predictions...");
    const mlPredictionData = [
      {
        customerId: insertedCustomers[0].id,
        predictionType: "clv",
        predictedValue: "3200.50",
        confidence: "0.89",
        features: { totalSpent: 2547.89, orderCount: 12, daysSinceLastPurchase: 53 },
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      {
        customerId: insertedCustomers[0].id,
        predictionType: "churn",
        predictedValue: "0.15",
        confidence: "0.92",
        features: { daysSinceLastPurchase: 53, totalSpent: 2547.89, orderFrequency: 12 },
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      {
        customerId: insertedCustomers[1].id,
        predictionType: "clv",
        predictedValue: "2100.75",
        confidence: "0.85",
        features: { totalSpent: 1823.45, orderCount: 8, daysSinceLastPurchase: 18 },
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      {
        customerId: insertedCustomers[2].id,
        predictionType: "churn",
        predictedValue: "0.78",
        confidence: "0.94",
        features: { daysSinceLastPurchase: 105, totalSpent: 456.78, orderFrequency: 3 },
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    ];

    const insertedPredictions = await db.insert(mlPredictions).values(mlPredictionData).returning();
    console.log(`Inserted ${insertedPredictions.length} ML predictions`);

    // Seed sales metrics
    console.log("Seeding sales metrics...");
    const salesMetricData = [];
    const startDate = new Date('2024-01-01');
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      salesMetricData.push({
        date,
        orderCount: Math.floor(Math.random() * 50) + 10,
        revenue: (Math.random() * 10000 + 5000).toFixed(2),
        customerCount: Math.floor(Math.random() * 30) + 5,
        avgOrderValue: (Math.random() * 200 + 100).toFixed(2),
        conversionRate: (Math.random() * 0.1 + 0.02).toFixed(3)
      });
    }

    const insertedMetrics = await db.insert(salesMetrics).values(salesMetricData).returning();
    console.log(`Inserted ${insertedMetrics.length} sales metrics`);

    // Seed product recommendations
    console.log("Seeding product recommendations...");
    const recommendationData = [
      {
        productId: insertedProducts[0].id,
        recommendedProductId: insertedProducts[1].id,
        recommendationType: "cross_sell",
        confidence: "0.85",
        support: "0.12",
        lift: "2.4",
        coOccurrenceCount: 45
      },
      {
        productId: insertedProducts[0].id,
        recommendedProductId: insertedProducts[2].id,
        recommendationType: "up_sell",
        confidence: "0.72",
        support: "0.08",
        lift: "1.8",
        coOccurrenceCount: 32
      },
      {
        productId: insertedProducts[1].id,
        recommendedProductId: insertedProducts[0].id,
        recommendationType: "cross_sell",
        confidence: "0.91",
        support: "0.15",
        lift: "3.1",
        coOccurrenceCount: 68
      },
      {
        productId: insertedProducts[1].id,
        recommendedProductId: insertedProducts[3].id,
        recommendationType: "cross_sell",
        confidence: "0.67",
        support: "0.09",
        lift: "1.5",
        coOccurrenceCount: 28
      },
      {
        productId: insertedProducts[2].id,
        recommendedProductId: insertedProducts[4].id,
        recommendationType: "up_sell",
        confidence: "0.78",
        support: "0.11",
        lift: "2.2",
        coOccurrenceCount: 41
      }
    ];

    const insertedRecommendations = await db.insert(productRecommendations).values(recommendationData).returning();
    console.log(`Inserted ${insertedRecommendations.length} product recommendations`);

    console.log("Database seeding completed successfully!");
    
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

// Run the seeding if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log("Seeding completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Seeding failed:", error);
      process.exit(1);
    });
}

export { seedDatabase };