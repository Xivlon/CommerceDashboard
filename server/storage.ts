import { 
  customers, orders, products, orderItems, mlPredictions, 
  salesMetrics, productRecommendations,
  type Customer, type InsertCustomer,
  type Order, type InsertOrder,
  type Product, type InsertProduct,
  type OrderItem, type InsertOrderItem,
  type MLPrediction, type InsertMLPrediction,
  type SalesMetric, type InsertSalesMetric,
  type ProductRecommendation, type InsertProductRecommendation,
  type CustomerWithPredictions, type ProductWithRecommendations,
  type DashboardMetrics, type MLInsight,
  users, type User, type InsertUser
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Customer methods
  getCustomer(id: number): Promise<Customer | undefined>;
  getCustomers(limit?: number, offset?: number): Promise<Customer[]>;
  getCustomersWithPredictions(limit?: number, offset?: number): Promise<CustomerWithPredictions[]>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, updates: Partial<Customer>): Promise<Customer>;

  // Order methods
  getOrder(id: number): Promise<Order | undefined>;
  getOrders(customerId?: number, limit?: number, offset?: number): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;

  // Product methods
  getProduct(id: number): Promise<Product | undefined>;
  getProducts(category?: string, limit?: number, offset?: number): Promise<Product[]>;
  getProductsWithRecommendations(limit?: number, offset?: number): Promise<ProductWithRecommendations[]>;
  createProduct(product: InsertProduct): Promise<Product>;

  // ML Prediction methods
  getMLPrediction(customerId: number, predictionType: string): Promise<MLPrediction | undefined>;
  getMLPredictions(predictionType?: string, limit?: number, offset?: number): Promise<MLPrediction[]>;
  createMLPrediction(prediction: InsertMLPrediction): Promise<MLPrediction>;
  updateMLPrediction(id: number, updates: Partial<MLPrediction>): Promise<MLPrediction>;

  // Sales Metrics methods
  getSalesMetrics(startDate?: Date, endDate?: Date): Promise<SalesMetric[]>;
  createSalesMetric(metric: InsertSalesMetric): Promise<SalesMetric>;

  // Product Recommendation methods
  getProductRecommendations(productId: number, type?: string): Promise<ProductRecommendation[]>;
  createProductRecommendation(recommendation: InsertProductRecommendation): Promise<ProductRecommendation>;

  // Dashboard methods
  getDashboardMetrics(): Promise<DashboardMetrics>;
  getMLInsights(): Promise<MLInsight[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private customers: Map<number, Customer>;
  private orders: Map<number, Order>;
  private products: Map<number, Product>;
  private orderItems: Map<number, OrderItem>;
  private mlPredictions: Map<number, MLPrediction>;
  private salesMetrics: Map<number, SalesMetric>;
  private productRecommendations: Map<number, ProductRecommendation>;
  
  private currentUserId: number;
  private currentCustomerId: number;
  private currentOrderId: number;
  private currentProductId: number;
  private currentOrderItemId: number;
  private currentMLPredictionId: number;
  private currentSalesMetricId: number;
  private currentProductRecommendationId: number;

  constructor() {
    this.users = new Map();
    this.customers = new Map();
    this.orders = new Map();
    this.products = new Map();
    this.orderItems = new Map();
    this.mlPredictions = new Map();
    this.salesMetrics = new Map();
    this.productRecommendations = new Map();
    
    this.currentUserId = 1;
    this.currentCustomerId = 1;
    this.currentOrderId = 1;
    this.currentProductId = 1;
    this.currentOrderItemId = 1;
    this.currentMLPredictionId = 1;
    this.currentSalesMetricId = 1;
    this.currentProductRecommendationId = 1;

    this.initializeData();
  }

  private initializeData() {
    // Initialize some sample data for demonstration
    const sampleCustomers: Customer[] = [
      {
        id: 1,
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
        id: 2,
        name: "Emily Davis",
        email: "emily@example.com",
        registrationDate: new Date('2023-03-20'),
        totalSpent: "892.34",
        orderCount: 5,
        lastPurchaseDate: new Date('2023-11-15'),
        segment: "medium",
        churnRisk: "high",
        isActive: true
      },
      {
        id: 3,
        name: "Michael Wilson",
        email: "michael@example.com",
        registrationDate: new Date('2022-08-10'),
        totalSpent: "4234.67",
        orderCount: 23,
        lastPurchaseDate: new Date('2024-01-20'),
        segment: "vip",
        churnRisk: "low",
        isActive: true
      }
    ];

    const sampleProducts: Product[] = [
      {
        id: 1,
        name: "Wireless Headphones",
        category: "Electronics",
        price: "129.99",
        isActive: true
      },
      {
        id: 2,
        name: "Phone Case",
        category: "Accessories",
        price: "24.99",
        isActive: true
      },
      {
        id: 3,
        name: "Gaming Laptop",
        category: "Electronics",
        price: "1299.99",
        isActive: true
      }
    ];

    sampleCustomers.forEach(customer => {
      this.customers.set(customer.id, customer);
    });

    sampleProducts.forEach(product => {
      this.products.set(product.id, product);
    });

    // Initialize sample product recommendations
    const sampleRecommendations: ProductRecommendation[] = [
      {
        id: 1,
        productId: 1,
        recommendedProductId: 2,
        recommendationType: "cross_sell",
        confidence: "0.85",
        support: "0.12",
        lift: "2.4",
        coOccurrenceCount: 45,
        createdAt: new Date()
      },
      {
        id: 2,
        productId: 1,
        recommendedProductId: 3,
        recommendationType: "up_sell",
        confidence: "0.72",
        support: "0.08",
        lift: "1.8",
        coOccurrenceCount: 32,
        createdAt: new Date()
      },
      {
        id: 3,
        productId: 2,
        recommendedProductId: 1,
        recommendationType: "cross_sell",
        confidence: "0.91",
        support: "0.15",
        lift: "3.1",
        coOccurrenceCount: 68,
        createdAt: new Date()
      },
      {
        id: 4,
        productId: 2,
        recommendedProductId: 3,
        recommendationType: "cross_sell",
        confidence: "0.67",
        support: "0.09",
        lift: "1.5",
        coOccurrenceCount: 28,
        createdAt: new Date()
      },
      {
        id: 5,
        productId: 3,
        recommendedProductId: 1,
        recommendationType: "up_sell",
        confidence: "0.78",
        support: "0.11",
        lift: "2.2",
        coOccurrenceCount: 41,
        createdAt: new Date()
      }
    ];

    sampleRecommendations.forEach(rec => {
      this.productRecommendations.set(rec.id, rec);
    });

    this.currentCustomerId = 4;
    this.currentProductId = 4;
    this.currentProductRecommendationId = 6;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Customer methods
  async getCustomer(id: number): Promise<Customer | undefined> {
    return this.customers.get(id);
  }

  async getCustomers(limit = 50, offset = 0): Promise<Customer[]> {
    const allCustomers = Array.from(this.customers.values());
    return allCustomers.slice(offset, offset + limit);
  }

  async getCustomersWithPredictions(limit = 50, offset = 0): Promise<CustomerWithPredictions[]> {
    const customers = await this.getCustomers(limit, offset);
    
    return Promise.all(customers.map(async (customer) => {
      const clvPrediction = await this.getMLPrediction(customer.id, 'clv');
      const churnPrediction = await this.getMLPrediction(customer.id, 'churn');
      
      return {
        ...customer,
        clvPrediction,
        churnPrediction,
        predictedCLV: clvPrediction ? parseFloat(clvPrediction.predictedValue || '0') : undefined,
        churnRiskScore: churnPrediction ? parseFloat(churnPrediction.confidence || '0') : undefined,
      };
    }));
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const id = this.currentCustomerId++;
    const newCustomer: Customer = {
      ...customer,
      id,
      registrationDate: new Date(),
      totalSpent: customer.totalSpent || "0",
      orderCount: customer.orderCount || 0,
      lastPurchaseDate: customer.lastPurchaseDate || null,
      segment: customer.segment || 'new',
      churnRisk: customer.churnRisk || 'low',
      isActive: customer.isActive ?? true,
    };
    this.customers.set(id, newCustomer);
    return newCustomer;
  }

  async updateCustomer(id: number, updates: Partial<Customer>): Promise<Customer> {
    const customer = this.customers.get(id);
    if (!customer) {
      throw new Error(`Customer with id ${id} not found`);
    }
    const updatedCustomer = { ...customer, ...updates };
    this.customers.set(id, updatedCustomer);
    return updatedCustomer;
  }

  // Order methods
  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getOrders(customerId?: number, limit = 50, offset = 0): Promise<Order[]> {
    let allOrders = Array.from(this.orders.values());
    
    if (customerId) {
      allOrders = allOrders.filter(order => order.customerId === customerId);
    }
    
    return allOrders.slice(offset, offset + limit);
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const id = this.currentOrderId++;
    const newOrder: Order = {
      ...order,
      id,
      orderDate: new Date(),
      status: order.status || 'completed',
    };
    this.orders.set(id, newOrder);
    return newOrder;
  }

  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values()).filter(item => item.orderId === orderId);
  }

  async createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const id = this.currentOrderItemId++;
    const newOrderItem: OrderItem = { ...orderItem, id };
    this.orderItems.set(id, newOrderItem);
    return newOrderItem;
  }

  // Product methods
  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProducts(category?: string, limit = 50, offset = 0): Promise<Product[]> {
    let allProducts = Array.from(this.products.values());
    
    if (category) {
      allProducts = allProducts.filter(product => product.category === category);
    }
    
    return allProducts.slice(offset, offset + limit);
  }

  async getProductsWithRecommendations(limit = 50, offset = 0): Promise<ProductWithRecommendations[]> {
    const products = await this.getProducts(undefined, limit, offset);
    
    return Promise.all(products.map(async (product) => {
      const crossSellProducts = await this.getProductRecommendations(product.id, 'cross_sell');
      const upSellProducts = await this.getProductRecommendations(product.id, 'up_sell');
      
      return {
        ...product,
        crossSellProducts,
        upSellProducts,
      };
    }));
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.currentProductId++;
    const newProduct: Product = {
      ...product,
      id,
      isActive: product.isActive ?? true,
    };
    this.products.set(id, newProduct);
    return newProduct;
  }

  // ML Prediction methods
  async getMLPrediction(customerId: number, predictionType: string): Promise<MLPrediction | undefined> {
    return Array.from(this.mlPredictions.values()).find(
      prediction => prediction.customerId === customerId && prediction.predictionType === predictionType
    );
  }

  async getMLPredictions(predictionType?: string, limit = 50, offset = 0): Promise<MLPrediction[]> {
    let allPredictions = Array.from(this.mlPredictions.values());
    
    if (predictionType) {
      allPredictions = allPredictions.filter(prediction => prediction.predictionType === predictionType);
    }
    
    return allPredictions.slice(offset, offset + limit);
  }

  async createMLPrediction(prediction: InsertMLPrediction): Promise<MLPrediction> {
    const id = this.currentMLPredictionId++;
    const newPrediction: MLPrediction = {
      ...prediction,
      id,
      createdAt: new Date(),
      predictedValue: prediction.predictedValue || null,
      confidence: prediction.confidence || null,
      features: prediction.features || null,
      expiresAt: prediction.expiresAt || null,
    };
    this.mlPredictions.set(id, newPrediction);
    return newPrediction;
  }

  async updateMLPrediction(id: number, updates: Partial<MLPrediction>): Promise<MLPrediction> {
    const prediction = this.mlPredictions.get(id);
    if (!prediction) {
      throw new Error(`ML Prediction with id ${id} not found`);
    }
    const updatedPrediction = { ...prediction, ...updates };
    this.mlPredictions.set(id, updatedPrediction);
    return updatedPrediction;
  }

  // Sales Metrics methods
  async getSalesMetrics(startDate?: Date, endDate?: Date): Promise<SalesMetric[]> {
    let allMetrics = Array.from(this.salesMetrics.values());
    
    if (startDate || endDate) {
      allMetrics = allMetrics.filter(metric => {
        const metricDate = new Date(metric.date);
        if (startDate && metricDate < startDate) return false;
        if (endDate && metricDate > endDate) return false;
        return true;
      });
    }
    
    return allMetrics.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  async createSalesMetric(metric: InsertSalesMetric): Promise<SalesMetric> {
    const id = this.currentSalesMetricId++;
    const newMetric: SalesMetric = { 
      ...metric, 
      id,
      avgOrderValue: metric.avgOrderValue || null,
      conversionRate: metric.conversionRate || null,
    };
    this.salesMetrics.set(id, newMetric);
    return newMetric;
  }

  // Product Recommendation methods
  async getProductRecommendations(productId: number, type?: string): Promise<ProductRecommendation[]> {
    let recommendations = Array.from(this.productRecommendations.values()).filter(
      rec => rec.productId === productId
    );
    
    if (type) {
      recommendations = recommendations.filter(rec => rec.recommendationType === type);
    }
    
    return recommendations.sort((a, b) => parseFloat(b.confidence) - parseFloat(a.confidence));
  }

  async createProductRecommendation(recommendation: InsertProductRecommendation): Promise<ProductRecommendation> {
    const id = this.currentProductRecommendationId++;
    const newRecommendation: ProductRecommendation = {
      ...recommendation,
      id,
      createdAt: new Date(),
      support: recommendation.support || null,
      lift: recommendation.lift || null,
    };
    this.productRecommendations.set(id, newRecommendation);
    return newRecommendation;
  }

  // Dashboard methods
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const customers = Array.from(this.customers.values());
    const orders = Array.from(this.orders.values());
    const predictions = Array.from(this.mlPredictions.values());
    
    const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);
    const totalOrders = orders.length;
    const totalCustomers = customers.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    const clvPredictions = predictions.filter(p => p.predictionType === 'clv');
    const avgCLV = clvPredictions.length > 0 
      ? clvPredictions.reduce((sum, p) => sum + parseFloat(p.predictedValue || '0'), 0) / clvPredictions.length
      : 0;
    
    const highRiskCustomers = customers.filter(c => c.churnRisk === 'high').length;
    const churnRiskPercentage = totalCustomers > 0 ? (highRiskCustomers / totalCustomers) * 100 : 0;
    
    const crossSellOpportunities = Array.from(this.productRecommendations.values())
      .filter(r => r.recommendationType === 'cross_sell').length;

    return {
      totalRevenue,
      totalOrders,
      totalCustomers,
      avgOrderValue,
      avgCLV,
      churnRiskPercentage,
      forecastAccuracy: 94.2,
      crossSellOpportunities,
      modelMetrics: {
        clvAccuracy: 87.3,
        churnAccuracy: 82.1,
        forecastAccuracy: 94.2,
        recommendationAccuracy: 79.4,
        lastUpdate: new Date(),
      },
    };
  }

  async getMLInsights(): Promise<MLInsight[]> {
    const metrics = await this.getDashboardMetrics();
    
    const insights: MLInsight[] = [
      {
        type: 'revenue',
        title: 'Revenue Optimization',
        description: `Focus on customers with CLV > $2K. Potential revenue increase: $${(metrics.avgCLV * 0.15 * metrics.totalCustomers).toLocaleString()} annually.`,
        impact: 'high',
        confidence: 87,
        actionable: true,
      },
      {
        type: 'churn',
        title: 'Churn Prevention',
        description: `${Math.round(metrics.churnRiskPercentage * metrics.totalCustomers / 100)} high-risk customers identified. Targeted campaigns could save $${(metrics.avgOrderValue * 6 * Math.round(metrics.churnRiskPercentage * metrics.totalCustomers / 100)).toLocaleString()} in lost revenue.`,
        impact: 'high',
        confidence: 82,
        actionable: true,
      },
      {
        type: 'cross_sell',
        title: 'Cross-Sell Boost',
        description: `${metrics.crossSellOpportunities} cross-sell opportunities identified. Bundle recommendations could generate additional $${(metrics.crossSellOpportunities * 45).toLocaleString()} revenue.`,
        impact: 'medium',
        confidence: 79,
        actionable: true,
      },
    ];

    return insights;
  }
}

export const storage = new MemStorage();
