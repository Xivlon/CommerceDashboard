import 'dotenv/config';
import { db } from "./db";
import { customers, products, orders, orderItems, mlPredictions, salesMetrics, productRecommendations } from "@shared/schema";

// Helper function to generate random date within range
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Helper function to pick random element from array
function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Helper function to pick multiple random elements
function randomElements<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

async function seedDatabase() {
  console.log("🌱 Starting comprehensive database seeding...");

  try {
    // Clear existing data
    console.log("🗑️  Clearing existing data...");
    await db.delete(productRecommendations);
    await db.delete(salesMetrics);
    await db.delete(mlPredictions);
    await db.delete(orderItems);
    await db.delete(orders);
    await db.delete(products);
    await db.delete(customers);
    console.log("✓ Existing data cleared");

    // Seed 100 customers with diverse profiles
    console.log("\n👥 Seeding 100 customers...");
    const firstNames = ["James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda", "William", "Elizabeth",
                        "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Christopher", "Karen",
                        "Daniel", "Nancy", "Matthew", "Lisa", "Anthony", "Betty", "Mark", "Margaret", "Donald", "Sandra",
                        "Steven", "Ashley", "Paul", "Kimberly", "Andrew", "Emily", "Joshua", "Donna", "Kenneth", "Michelle",
                        "Kevin", "Carol", "Brian", "Amanda", "George", "Melissa", "Timothy", "Deborah", "Ronald", "Stephanie",
                        "Edward", "Dorothy", "Jason", "Rebecca", "Jeffrey", "Sharon", "Ryan", "Laura", "Jacob", "Cynthia",
                        "Gary", "Kathleen", "Nicholas", "Amy", "Eric", "Angela", "Jonathan", "Shirley", "Stephen", "Anna",
                        "Larry", "Brenda", "Justin", "Pamela", "Scott", "Emma", "Brandon", "Nicole", "Benjamin", "Helen",
                        "Samuel", "Samantha", "Raymond", "Katherine", "Gregory", "Christine", "Frank", "Debra", "Alexander", "Rachel",
                        "Patrick", "Carolyn", "Jack", "Janet", "Dennis", "Catherine", "Jerry", "Maria", "Tyler", "Heather"];

    const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
                       "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin",
                       "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson",
                       "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores",
                       "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell", "Carter", "Roberts"];

    const segments = ["new", "low", "medium", "high", "vip"];
    const churnRisks = ["low", "medium", "high"];

    const customerData = [];
    const startDate = new Date('2022-01-01');
    const today = new Date();

    for (let i = 0; i < 100; i++) {
      const firstName = randomElement(firstNames);
      const lastName = randomElement(lastNames);
      const registrationDate = randomDate(startDate, new Date('2023-12-31'));
      const daysSinceRegistration = Math.floor((today.getTime() - registrationDate.getTime()) / (1000 * 60 * 60 * 24));

      // Generate realistic spending patterns based on segment
      let segment = randomElement(segments);
      let totalSpent = 0;
      let orderCount = 0;
      let lastPurchaseDate: Date | null = null;
      let churnRisk = "low";
      let isActive = true;

      if (segment === "new") {
        orderCount = Math.floor(Math.random() * 2) + 1;
        totalSpent = orderCount * (Math.random() * 150 + 50);
        lastPurchaseDate = randomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), today);
        churnRisk = "medium";
      } else if (segment === "low") {
        orderCount = Math.floor(Math.random() * 3) + 2;
        totalSpent = orderCount * (Math.random() * 200 + 80);
        const daysAgo = Math.random() * 120 + 30;
        lastPurchaseDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
        churnRisk = daysAgo > 90 ? "high" : "medium";
        isActive = daysAgo < 90;
      } else if (segment === "medium") {
        orderCount = Math.floor(Math.random() * 6) + 5;
        totalSpent = orderCount * (Math.random() * 250 + 120);
        const daysAgo = Math.random() * 60 + 10;
        lastPurchaseDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
        churnRisk = daysAgo > 45 ? "medium" : "low";
      } else if (segment === "high") {
        orderCount = Math.floor(Math.random() * 10) + 10;
        totalSpent = orderCount * (Math.random() * 300 + 180);
        const daysAgo = Math.random() * 30 + 5;
        lastPurchaseDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
        churnRisk = "low";
      } else { // vip
        orderCount = Math.floor(Math.random() * 20) + 15;
        totalSpent = orderCount * (Math.random() * 400 + 250);
        const daysAgo = Math.random() * 14 + 1;
        lastPurchaseDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
        churnRisk = "low";
      }

      customerData.push({
        name: `${firstName} ${lastName}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`,
        registrationDate,
        totalSpent: totalSpent.toFixed(2),
        orderCount,
        lastPurchaseDate,
        segment,
        churnRisk,
        isActive
      });
    }

    const insertedCustomers = await db.insert(customers).values(customerData).returning();
    console.log(`✓ Inserted ${insertedCustomers.length} customers`);

    // Seed 30 products across multiple categories
    console.log("\n📦 Seeding 30 products...");
    const productCategories = {
      "Electronics": [
        { name: "Wireless Headphones", price: 299.99 },
        { name: "Smart Watch", price: 249.99 },
        { name: "Bluetooth Speaker", price: 129.99 },
        { name: "Wireless Earbuds", price: 159.99 },
        { name: "4K Webcam", price: 199.99 },
        { name: "USB-C Hub", price: 79.99 },
        { name: "Portable Charger", price: 49.99 },
        { name: "Smart Home Hub", price: 89.99 }
      ],
      "Accessories": [
        { name: "Laptop Stand", price: 89.99 },
        { name: "Wireless Mouse", price: 49.99 },
        { name: "Mechanical Keyboard", price: 149.99 },
        { name: "Monitor Arm", price: 119.99 },
        { name: "Cable Organizer", price: 19.99 },
        { name: "Phone Case", price: 29.99 },
        { name: "Screen Protector", price: 24.99 }
      ],
      "Home & Office": [
        { name: "Ergonomic Chair", price: 399.99 },
        { name: "Standing Desk", price: 549.99 },
        { name: "Desk Lamp", price: 69.99 },
        { name: "Desk Organizer", price: 34.99 },
        { name: "Whiteboard", price: 79.99 },
        { name: "Filing Cabinet", price: 149.99 }
      ],
      "Clothing": [
        { name: "Running Shoes", price: 129.99 },
        { name: "Athletic Wear Set", price: 89.99 },
        { name: "Winter Jacket", price: 199.99 },
        { name: "Casual Backpack", price: 79.99 },
        { name: "Baseball Cap", price: 24.99 }
      ],
      "Health & Fitness": [
        { name: "Yoga Mat", price: 39.99 },
        { name: "Resistance Bands", price: 29.99 },
        { name: "Water Bottle", price: 19.99 },
        { name: "Fitness Tracker", price: 99.99 }
      ]
    };

    const productData = [];
    for (const [category, items] of Object.entries(productCategories)) {
      for (const item of items) {
        productData.push({
          name: item.name,
          category,
          price: item.price.toFixed(2),
          isActive: Math.random() > 0.1 // 90% active
        });
      }
    }

    const insertedProducts = await db.insert(products).values(productData).returning();
    console.log(`✓ Inserted ${insertedProducts.length} products`);

    // Seed 300+ orders with realistic patterns
    console.log("\n🛒 Seeding orders and order items...");
    const orderData = [];
    const orderItemData = [];
    const statuses = ["completed", "pending", "cancelled"];

    // Generate orders for each customer based on their order count
    for (const customer of insertedCustomers) {
      const numOrders = customer.orderCount;

      for (let i = 0; i < numOrders; i++) {
        // Generate order date between registration and last purchase
        const orderDate = customer.lastPurchaseDate
          ? randomDate(customer.registrationDate, customer.lastPurchaseDate)
          : randomDate(customer.registrationDate, today);

        // Determine order status (95% completed, 3% pending, 2% cancelled)
        const rand = Math.random();
        const status = rand < 0.95 ? "completed" : rand < 0.98 ? "pending" : "cancelled";

        // Select 1-5 random products for this order
        const numItems = Math.floor(Math.random() * 4) + 1;
        const selectedProducts = randomElements(insertedProducts.filter(p => p.isActive), numItems);

        let totalAmount = 0;
        let itemCount = 0;
        const tempOrderItems = [];

        for (const product of selectedProducts) {
          const quantity = Math.floor(Math.random() * 3) + 1;
          const unitPrice = parseFloat(product.price);
          const itemTotal = unitPrice * quantity;

          tempOrderItems.push({
            product,
            quantity,
            unitPrice: unitPrice.toFixed(2)
          });

          totalAmount += itemTotal;
          itemCount += quantity;
        }

        const orderIndex = orderData.length;
        orderData.push({
          customerId: customer.id,
          orderDate,
          totalAmount: totalAmount.toFixed(2),
          itemCount,
          status
        });

        // Store order items temporarily with order index
        orderItemData.push({ orderIndex, items: tempOrderItems });
      }
    }

    const insertedOrders = await db.insert(orders).values(orderData).returning();
    console.log(`✓ Inserted ${insertedOrders.length} orders`);

    // Now insert order items with actual order IDs
    const finalOrderItems = [];
    for (const orderItemGroup of orderItemData) {
      const order = insertedOrders[orderItemGroup.orderIndex];

      for (const item of orderItemGroup.items) {
        finalOrderItems.push({
          orderId: order.id,
          productId: item.product.id,
          quantity: item.quantity,
          unitPrice: item.unitPrice
        });
      }
    }

    const insertedOrderItems = await db.insert(orderItems).values(finalOrderItems).returning();
    console.log(`✓ Inserted ${insertedOrderItems.length} order items`);

    // Seed ML predictions for all customers
    console.log("\n🤖 Seeding ML predictions...");
    const mlPredictionData = [];

    for (const customer of insertedCustomers) {
      const daysSinceLastPurchase = customer.lastPurchaseDate
        ? Math.floor((today.getTime() - customer.lastPurchaseDate.getTime()) / (1000 * 60 * 60 * 24))
        : 365;

      // CLV Prediction
      const avgOrderValue = customer.orderCount > 0 ? parseFloat(customer.totalSpent) / customer.orderCount : 0;
      const purchaseFrequency = customer.orderCount / Math.max(1,
        (today.getTime() - customer.registrationDate.getTime()) / (1000 * 60 * 60 * 24 * 365)
      );
      const predictedCLV = avgOrderValue * purchaseFrequency * 2; // 2 year projection
      const clvConfidence = Math.min(0.95, 0.70 + (customer.orderCount / 50));

      mlPredictionData.push({
        customerId: customer.id,
        predictionType: "clv",
        predictedValue: predictedCLV.toFixed(2),
        confidence: clvConfidence.toFixed(4),
        features: {
          totalSpent: parseFloat(customer.totalSpent),
          orderCount: customer.orderCount,
          avgOrderValue,
          purchaseFrequency,
          daysSinceRegistration: Math.floor((today.getTime() - customer.registrationDate.getTime()) / (1000 * 60 * 60 * 24))
        },
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });

      // Churn Prediction
      let churnScore = 0;
      if (daysSinceLastPurchase > 90) {
        churnScore = Math.min(0.95, 0.5 + (daysSinceLastPurchase - 90) / 365);
      } else if (daysSinceLastPurchase > 45) {
        churnScore = 0.3 + (daysSinceLastPurchase - 45) / 180;
      } else {
        churnScore = Math.max(0.05, daysSinceLastPurchase / 450);
      }

      // Adjust based on order frequency
      if (customer.orderCount < 3) {
        churnScore += 0.2;
      } else if (customer.orderCount > 15) {
        churnScore -= 0.15;
      }

      churnScore = Math.max(0, Math.min(1, churnScore));
      const churnConfidence = 0.82 + Math.random() * 0.12;

      mlPredictionData.push({
        customerId: customer.id,
        predictionType: "churn",
        predictedValue: churnScore.toFixed(4),
        confidence: churnConfidence.toFixed(4),
        features: {
          daysSinceLastPurchase,
          totalSpent: parseFloat(customer.totalSpent),
          orderCount: customer.orderCount,
          orderFrequency: customer.orderCount
        },
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });
    }

    const insertedPredictions = await db.insert(mlPredictions).values(mlPredictionData).returning();
    console.log(`✓ Inserted ${insertedPredictions.length} ML predictions`);

    // Seed 90 days of sales metrics
    console.log("\n📊 Seeding 90 days of sales metrics...");
    const salesMetricData = [];
    const metricsStartDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

    for (let i = 0; i < 90; i++) {
      const date = new Date(metricsStartDate);
      date.setDate(date.getDate() + i);

      // Create realistic patterns (weekends have more orders)
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const baseOrders = isWeekend ? 40 : 25;
      const orderCount = Math.floor(Math.random() * 20) + baseOrders;

      // Revenue correlates with orders but has variance
      const avgOrderValue = Math.random() * 100 + 150;
      const revenue = orderCount * avgOrderValue;

      // Customer count is less than order count (repeat customers)
      const customerCount = Math.floor(orderCount * (0.6 + Math.random() * 0.3));

      // Conversion rate varies
      const conversionRate = 0.02 + Math.random() * 0.08;

      salesMetricData.push({
        date,
        revenue: revenue.toFixed(2),
        orderCount,
        customerCount,
        avgOrderValue: avgOrderValue.toFixed(2),
        conversionRate: conversionRate.toFixed(4)
      });
    }

    const insertedMetrics = await db.insert(salesMetrics).values(salesMetricData).returning();
    console.log(`✓ Inserted ${insertedMetrics.length} sales metrics`);

    // Seed product recommendations based on actual order patterns
    console.log("\n💡 Seeding product recommendations...");
    const recommendationData = [];
    const productPairCounts = new Map<string, number>();

    // Analyze order items to find product co-occurrences
    const orderGroups = new Map<number, number[]>();
    for (const item of insertedOrderItems) {
      if (!orderGroups.has(item.orderId)) {
        orderGroups.set(item.orderId, []);
      }
      orderGroups.get(item.orderId)!.push(item.productId);
    }

    // Count co-occurrences
    for (const productIds of orderGroups.values()) {
      for (let i = 0; i < productIds.length; i++) {
        for (let j = i + 1; j < productIds.length; j++) {
          const pair1 = `${productIds[i]}-${productIds[j]}`;
          const pair2 = `${productIds[j]}-${productIds[i]}`;
          productPairCounts.set(pair1, (productPairCounts.get(pair1) || 0) + 1);
          productPairCounts.set(pair2, (productPairCounts.get(pair2) || 0) + 1);
        }
      }
    }

    // Create recommendations from top co-occurrences
    const sortedPairs = Array.from(productPairCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 50);

    for (const [pair, count] of sortedPairs) {
      const [productId, recommendedProductId] = pair.split('-').map(Number);

      // Calculate metrics
      const support = count / insertedOrders.length;
      const lift = 1.5 + Math.random() * 2.5; // Realistic lift between 1.5 and 4.0
      const confidence = Math.min(0.95, support * lift);
      const recommendationType = lift > 2.5 ? "cross_sell" : "up_sell";

      recommendationData.push({
        productId,
        recommendedProductId,
        recommendationType,
        confidence: confidence.toFixed(4),
        support: support.toFixed(4),
        lift: lift.toFixed(4),
        coOccurrenceCount: count
      });
    }

    // Add some additional recommendations for products with few co-occurrences
    const productsWithFewRecs = insertedProducts.filter(p =>
      !recommendationData.some(r => r.productId === p.id)
    );

    for (const product of productsWithFewRecs.slice(0, 20)) {
      const sameCategory = insertedProducts.filter(p =>
        p.category === product.category && p.id !== product.id
      );

      if (sameCategory.length > 0) {
        const recommended = randomElement(sameCategory);
        recommendationData.push({
          productId: product.id,
          recommendedProductId: recommended.id,
          recommendationType: "cross_sell",
          confidence: (0.5 + Math.random() * 0.3).toFixed(4),
          support: (0.01 + Math.random() * 0.05).toFixed(4),
          lift: (1.2 + Math.random() * 1.5).toFixed(4),
          coOccurrenceCount: Math.floor(Math.random() * 10) + 1
        });
      }
    }

    const insertedRecommendations = await db.insert(productRecommendations).values(recommendationData).returning();
    console.log(`✓ Inserted ${insertedRecommendations.length} product recommendations`);

    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("✨ Database seeding completed successfully!");
    console.log("=".repeat(60));
    console.log(`📊 Summary:`);
    console.log(`   • ${insertedCustomers.length} customers`);
    console.log(`   • ${insertedProducts.length} products`);
    console.log(`   • ${insertedOrders.length} orders`);
    console.log(`   • ${insertedOrderItems.length} order items`);
    console.log(`   • ${insertedPredictions.length} ML predictions`);
    console.log(`   • ${insertedMetrics.length} sales metrics (90 days)`);
    console.log(`   • ${insertedRecommendations.length} product recommendations`);
    console.log("=".repeat(60));

  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

// Run the seeding (ES modules don't have require.main, so we just run it)
seedDatabase()
  .then(() => {
    console.log("\n✓ Seeding process completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n✗ Seeding process failed:", error);
    process.exit(1);
  });

export { seedDatabase };
