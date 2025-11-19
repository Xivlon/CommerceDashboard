/**
 * Domain Configuration System
 * Enables the platform to work across different data-driven domains
 * with configurable terminology, metrics, and workflows
 */

export type DomainType =
  | 'commerce'
  | 'research'
  | 'sales'
  | 'marketing'
  | 'product'
  | 'finance'
  | 'education'
  | 'healthcare'
  | 'custom';

export interface EntityDefinition {
  singular: string;
  plural: string;
  icon: string;
  fields: {
    id: string;
    label: string;
    type: 'text' | 'number' | 'date' | 'email' | 'currency' | 'percentage' | 'category';
    required?: boolean;
    computed?: boolean;
  }[];
}

export interface MetricDefinition {
  id: string;
  label: string;
  description: string;
  type: 'currency' | 'number' | 'percentage' | 'count';
  icon: string;
  format?: (value: number) => string;
}

export interface PredictionModel {
  id: string;
  name: string;
  description: string;
  targetEntity: string;
  predictionType: 'classification' | 'regression' | 'clustering' | 'forecasting';
  outputs: {
    id: string;
    label: string;
    type: 'score' | 'category' | 'value' | 'probability';
  }[];
}

export interface DomainConfiguration {
  id: DomainType;
  name: string;
  description: string;

  // Primary entities (e.g., customers, students, patients, leads)
  entities: {
    primary: EntityDefinition;      // Main entity (customer, student, patient)
    secondary?: EntityDefinition;   // Secondary entity (product, course, treatment)
    interaction: EntityDefinition;  // Interaction (order, enrollment, appointment)
  };

  // Key metrics for this domain
  metrics: {
    primary: MetricDefinition[];    // Revenue, Score, Completion Rate, etc.
    derived: MetricDefinition[];    // CLV, Churn Risk, Retention, etc.
  };

  // ML/Analytics models available
  models: PredictionModel[];

  // Dashboard terminology
  terminology: {
    dashboardTitle: string;
    insightsLabel: string;
    analyticsLabel: string;
    dataLabel: string;
  };
}

// ============================================================================
// Domain Configurations
// ============================================================================

export const DOMAIN_CONFIGS: Record<DomainType, DomainConfiguration> = {
  commerce: {
    id: 'commerce',
    name: 'E-Commerce & Retail',
    description: 'Customer analytics, sales forecasting, and revenue optimization',
    entities: {
      primary: {
        singular: 'Customer',
        plural: 'Customers',
        icon: 'Users',
        fields: [
          { id: 'name', label: 'Name', type: 'text', required: true },
          { id: 'email', label: 'Email', type: 'email', required: true },
          { id: 'totalSpent', label: 'Total Spent', type: 'currency', computed: true },
          { id: 'segment', label: 'Segment', type: 'category' },
          { id: 'lastInteraction', label: 'Last Purchase', type: 'date' },
        ],
      },
      secondary: {
        singular: 'Product',
        plural: 'Products',
        icon: 'Package',
        fields: [
          { id: 'name', label: 'Product Name', type: 'text', required: true },
          { id: 'category', label: 'Category', type: 'category' },
          { id: 'price', label: 'Price', type: 'currency' },
        ],
      },
      interaction: {
        singular: 'Order',
        plural: 'Orders',
        icon: 'ShoppingCart',
        fields: [
          { id: 'orderDate', label: 'Order Date', type: 'date', required: true },
          { id: 'amount', label: 'Amount', type: 'currency', required: true },
          { id: 'status', label: 'Status', type: 'category' },
        ],
      },
    },
    metrics: {
      primary: [
        { id: 'totalRevenue', label: 'Total Revenue', description: 'Sum of all sales', type: 'currency', icon: 'DollarSign' },
        { id: 'orderCount', label: 'Orders', description: 'Number of orders', type: 'count', icon: 'ShoppingCart' },
        { id: 'avgOrderValue', label: 'Avg Order Value', description: 'Average order amount', type: 'currency', icon: 'TrendingUp' },
      ],
      derived: [
        { id: 'clv', label: 'Customer Lifetime Value', description: 'Predicted customer value', type: 'currency', icon: 'Target' },
        { id: 'churnRisk', label: 'Churn Risk', description: 'Probability of customer leaving', type: 'percentage', icon: 'AlertTriangle' },
      ],
    },
    models: [
      {
        id: 'clv-prediction',
        name: 'Customer Lifetime Value',
        description: 'Predict future customer value',
        targetEntity: 'customer',
        predictionType: 'regression',
        outputs: [{ id: 'clv', label: 'Predicted CLV', type: 'value' }],
      },
      {
        id: 'churn-risk',
        name: 'Churn Risk Analysis',
        description: 'Identify customers likely to leave',
        targetEntity: 'customer',
        predictionType: 'classification',
        outputs: [
          { id: 'churnScore', label: 'Churn Score', type: 'score' },
          { id: 'riskLevel', label: 'Risk Level', type: 'category' },
        ],
      },
    ],
    terminology: {
      dashboardTitle: 'Commerce Dashboard',
      insightsLabel: 'Business Insights',
      analyticsLabel: 'Sales Analytics',
      dataLabel: 'Customer Data',
    },
  },

  research: {
    id: 'research',
    name: 'Research & Analysis',
    description: 'Survey data, experiment results, and statistical analysis',
    entities: {
      primary: {
        singular: 'Participant',
        plural: 'Participants',
        icon: 'Users',
        fields: [
          { id: 'name', label: 'Participant ID', type: 'text', required: true },
          { id: 'email', label: 'Contact', type: 'email' },
          { id: 'totalSpent', label: 'Response Count', type: 'number', computed: true },
          { id: 'segment', label: 'Cohort', type: 'category' },
          { id: 'lastInteraction', label: 'Last Response', type: 'date' },
        ],
      },
      interaction: {
        singular: 'Response',
        plural: 'Responses',
        icon: 'FileText',
        fields: [
          { id: 'orderDate', label: 'Response Date', type: 'date', required: true },
          { id: 'amount', label: 'Score', type: 'number', required: true },
          { id: 'status', label: 'Status', type: 'category' },
        ],
      },
    },
    metrics: {
      primary: [
        { id: 'totalRevenue', label: 'Total Responses', description: 'Number of responses collected', type: 'count', icon: 'FileText' },
        { id: 'orderCount', label: 'Active Studies', description: 'Ongoing research projects', type: 'count', icon: 'Beaker' },
        { id: 'avgOrderValue', label: 'Avg Response Rate', description: 'Average participation rate', type: 'percentage', icon: 'TrendingUp' },
      ],
      derived: [
        { id: 'clv', label: 'Engagement Score', description: 'Participant engagement level', type: 'number', icon: 'Target' },
        { id: 'churnRisk', label: 'Dropout Risk', description: 'Likelihood of participant dropout', type: 'percentage', icon: 'AlertTriangle' },
      ],
    },
    models: [
      {
        id: 'engagement-prediction',
        name: 'Engagement Prediction',
        description: 'Predict participant engagement levels',
        targetEntity: 'participant',
        predictionType: 'regression',
        outputs: [{ id: 'engagementScore', label: 'Engagement Score', type: 'value' }],
      },
      {
        id: 'dropout-risk',
        name: 'Dropout Risk Analysis',
        description: 'Identify participants likely to dropout',
        targetEntity: 'participant',
        predictionType: 'classification',
        outputs: [
          { id: 'dropoutScore', label: 'Dropout Score', type: 'score' },
          { id: 'riskLevel', label: 'Risk Level', type: 'category' },
        ],
      },
    ],
    terminology: {
      dashboardTitle: 'Research Dashboard',
      insightsLabel: 'Research Insights',
      analyticsLabel: 'Data Analytics',
      dataLabel: 'Participant Data',
    },
  },

  sales: {
    id: 'sales',
    name: 'Sales & Pipeline',
    description: 'Lead tracking, pipeline analytics, and sales forecasting',
    entities: {
      primary: {
        singular: 'Lead',
        plural: 'Leads',
        icon: 'Target',
        fields: [
          { id: 'name', label: 'Company Name', type: 'text', required: true },
          { id: 'email', label: 'Contact Email', type: 'email', required: true },
          { id: 'totalSpent', label: 'Deal Value', type: 'currency', computed: true },
          { id: 'segment', label: 'Industry', type: 'category' },
          { id: 'lastInteraction', label: 'Last Contact', type: 'date' },
        ],
      },
      interaction: {
        singular: 'Deal',
        plural: 'Deals',
        icon: 'Briefcase',
        fields: [
          { id: 'orderDate', label: 'Deal Date', type: 'date', required: true },
          { id: 'amount', label: 'Deal Amount', type: 'currency', required: true },
          { id: 'status', label: 'Stage', type: 'category' },
        ],
      },
    },
    metrics: {
      primary: [
        { id: 'totalRevenue', label: 'Pipeline Value', description: 'Total value in pipeline', type: 'currency', icon: 'DollarSign' },
        { id: 'orderCount', label: 'Active Deals', description: 'Number of active deals', type: 'count', icon: 'Briefcase' },
        { id: 'avgOrderValue', label: 'Avg Deal Size', description: 'Average deal value', type: 'currency', icon: 'TrendingUp' },
      ],
      derived: [
        { id: 'clv', label: 'Lead Score', description: 'Predicted lead quality', type: 'number', icon: 'Target' },
        { id: 'churnRisk', label: 'Loss Risk', description: 'Probability of deal loss', type: 'percentage', icon: 'AlertTriangle' },
      ],
    },
    models: [
      {
        id: 'lead-scoring',
        name: 'Lead Scoring Model',
        description: 'Score and prioritize leads',
        targetEntity: 'lead',
        predictionType: 'regression',
        outputs: [{ id: 'leadScore', label: 'Lead Score', type: 'value' }],
      },
      {
        id: 'deal-win-prediction',
        name: 'Deal Win Probability',
        description: 'Predict likelihood of closing deals',
        targetEntity: 'deal',
        predictionType: 'classification',
        outputs: [
          { id: 'winProbability', label: 'Win Probability', type: 'probability' },
          { id: 'stage', label: 'Predicted Stage', type: 'category' },
        ],
      },
    ],
    terminology: {
      dashboardTitle: 'Sales Dashboard',
      insightsLabel: 'Sales Insights',
      analyticsLabel: 'Pipeline Analytics',
      dataLabel: 'Lead Data',
    },
  },

  marketing: {
    id: 'marketing',
    name: 'Marketing Analytics',
    description: 'Campaign tracking, conversion analytics, and audience insights',
    entities: {
      primary: {
        singular: 'Contact',
        plural: 'Contacts',
        icon: 'Mail',
        fields: [
          { id: 'name', label: 'Contact Name', type: 'text', required: true },
          { id: 'email', label: 'Email', type: 'email', required: true },
          { id: 'totalSpent', label: 'Engagement Score', type: 'number', computed: true },
          { id: 'segment', label: 'Audience Segment', type: 'category' },
          { id: 'lastInteraction', label: 'Last Engagement', type: 'date' },
        ],
      },
      interaction: {
        singular: 'Campaign',
        plural: 'Campaigns',
        icon: 'Megaphone',
        fields: [
          { id: 'orderDate', label: 'Campaign Date', type: 'date', required: true },
          { id: 'amount', label: 'Conversions', type: 'number', required: true },
          { id: 'status', label: 'Status', type: 'category' },
        ],
      },
    },
    metrics: {
      primary: [
        { id: 'totalRevenue', label: 'Total Conversions', description: 'Campaign conversions', type: 'count', icon: 'Target' },
        { id: 'orderCount', label: 'Active Campaigns', description: 'Running campaigns', type: 'count', icon: 'Megaphone' },
        { id: 'avgOrderValue', label: 'Conversion Rate', description: 'Average conversion rate', type: 'percentage', icon: 'TrendingUp' },
      ],
      derived: [
        { id: 'clv', label: 'Engagement Potential', description: 'Contact engagement potential', type: 'number', icon: 'Sparkles' },
        { id: 'churnRisk', label: 'Unsubscribe Risk', description: 'Likelihood to unsubscribe', type: 'percentage', icon: 'AlertTriangle' },
      ],
    },
    models: [
      {
        id: 'conversion-prediction',
        name: 'Conversion Prediction',
        description: 'Predict contact conversion likelihood',
        targetEntity: 'contact',
        predictionType: 'classification',
        outputs: [{ id: 'conversionScore', label: 'Conversion Score', type: 'probability' }],
      },
    ],
    terminology: {
      dashboardTitle: 'Marketing Dashboard',
      insightsLabel: 'Campaign Insights',
      analyticsLabel: 'Marketing Analytics',
      dataLabel: 'Audience Data',
    },
  },

  product: {
    id: 'product',
    name: 'Product Analytics',
    description: 'Usage tracking, feature analysis, and user behavior',
    entities: {
      primary: {
        singular: 'User',
        plural: 'Users',
        icon: 'User',
        fields: [
          { id: 'name', label: 'User Name', type: 'text', required: true },
          { id: 'email', label: 'Email', type: 'email', required: true },
          { id: 'totalSpent', label: 'Session Count', type: 'number', computed: true },
          { id: 'segment', label: 'User Type', type: 'category' },
          { id: 'lastInteraction', label: 'Last Active', type: 'date' },
        ],
      },
      interaction: {
        singular: 'Session',
        plural: 'Sessions',
        icon: 'Activity',
        fields: [
          { id: 'orderDate', label: 'Session Date', type: 'date', required: true },
          { id: 'amount', label: 'Duration (min)', type: 'number', required: true },
          { id: 'status', label: 'Quality', type: 'category' },
        ],
      },
    },
    metrics: {
      primary: [
        { id: 'totalRevenue', label: 'Active Users', description: 'Monthly active users', type: 'count', icon: 'Users' },
        { id: 'orderCount', label: 'Feature Usage', description: 'Feature adoption rate', type: 'percentage', icon: 'Zap' },
        { id: 'avgOrderValue', label: 'Avg Session Time', description: 'Average session duration', type: 'number', icon: 'Clock' },
      ],
      derived: [
        { id: 'clv', label: 'User Value', description: 'Predicted user value', type: 'number', icon: 'Star' },
        { id: 'churnRisk', label: 'Churn Risk', description: 'User retention risk', type: 'percentage', icon: 'AlertTriangle' },
      ],
    },
    models: [
      {
        id: 'retention-prediction',
        name: 'Retention Prediction',
        description: 'Predict user retention likelihood',
        targetEntity: 'user',
        predictionType: 'classification',
        outputs: [{ id: 'retentionScore', label: 'Retention Score', type: 'probability' }],
      },
    ],
    terminology: {
      dashboardTitle: 'Product Dashboard',
      insightsLabel: 'Usage Insights',
      analyticsLabel: 'Product Analytics',
      dataLabel: 'User Data',
    },
  },

  finance: {
    id: 'finance',
    name: 'Financial Analytics',
    description: 'Budget tracking, expense analysis, and forecasting',
    entities: {
      primary: {
        singular: 'Account',
        plural: 'Accounts',
        icon: 'Wallet',
        fields: [
          { id: 'name', label: 'Account Name', type: 'text', required: true },
          { id: 'email', label: 'Contact', type: 'email' },
          { id: 'totalSpent', label: 'Balance', type: 'currency', computed: true },
          { id: 'segment', label: 'Type', type: 'category' },
          { id: 'lastInteraction', label: 'Last Transaction', type: 'date' },
        ],
      },
      interaction: {
        singular: 'Transaction',
        plural: 'Transactions',
        icon: 'Receipt',
        fields: [
          { id: 'orderDate', label: 'Transaction Date', type: 'date', required: true },
          { id: 'amount', label: 'Amount', type: 'currency', required: true },
          { id: 'status', label: 'Category', type: 'category' },
        ],
      },
    },
    metrics: {
      primary: [
        { id: 'totalRevenue', label: 'Total Balance', description: 'Sum of all accounts', type: 'currency', icon: 'DollarSign' },
        { id: 'orderCount', label: 'Transactions', description: 'Transaction count', type: 'count', icon: 'Receipt' },
        { id: 'avgOrderValue', label: 'Avg Transaction', description: 'Average transaction amount', type: 'currency', icon: 'TrendingUp' },
      ],
      derived: [
        { id: 'clv', label: 'Budget Forecast', description: 'Predicted budget needs', type: 'currency', icon: 'TrendingUp' },
        { id: 'churnRisk', label: 'Overspend Risk', description: 'Budget overrun risk', type: 'percentage', icon: 'AlertTriangle' },
      ],
    },
    models: [
      {
        id: 'expense-forecast',
        name: 'Expense Forecasting',
        description: 'Predict future expenses',
        targetEntity: 'account',
        predictionType: 'forecasting',
        outputs: [{ id: 'forecastedExpense', label: 'Forecasted Expense', type: 'value' }],
      },
    ],
    terminology: {
      dashboardTitle: 'Finance Dashboard',
      insightsLabel: 'Financial Insights',
      analyticsLabel: 'Financial Analytics',
      dataLabel: 'Account Data',
    },
  },

  education: {
    id: 'education',
    name: 'Education Analytics',
    description: 'Student performance, course analytics, and learning outcomes',
    entities: {
      primary: {
        singular: 'Student',
        plural: 'Students',
        icon: 'GraduationCap',
        fields: [
          { id: 'name', label: 'Student Name', type: 'text', required: true },
          { id: 'email', label: 'Email', type: 'email', required: true },
          { id: 'totalSpent', label: 'Total Credits', type: 'number', computed: true },
          { id: 'segment', label: 'Program', type: 'category' },
          { id: 'lastInteraction', label: 'Last Activity', type: 'date' },
        ],
      },
      interaction: {
        singular: 'Assignment',
        plural: 'Assignments',
        icon: 'BookOpen',
        fields: [
          { id: 'orderDate', label: 'Submission Date', type: 'date', required: true },
          { id: 'amount', label: 'Score', type: 'number', required: true },
          { id: 'status', label: 'Status', type: 'category' },
        ],
      },
    },
    metrics: {
      primary: [
        { id: 'totalRevenue', label: 'Total Students', description: 'Enrolled students', type: 'count', icon: 'Users' },
        { id: 'orderCount', label: 'Assignments', description: 'Completed assignments', type: 'count', icon: 'BookOpen' },
        { id: 'avgOrderValue', label: 'Avg Performance', description: 'Average score', type: 'percentage', icon: 'TrendingUp' },
      ],
      derived: [
        { id: 'clv', label: 'Success Potential', description: 'Predicted student success', type: 'number', icon: 'Award' },
        { id: 'churnRisk', label: 'Dropout Risk', description: 'Student dropout risk', type: 'percentage', icon: 'AlertTriangle' },
      ],
    },
    models: [
      {
        id: 'performance-prediction',
        name: 'Performance Prediction',
        description: 'Predict student performance',
        targetEntity: 'student',
        predictionType: 'regression',
        outputs: [{ id: 'predictedGrade', label: 'Predicted Grade', type: 'value' }],
      },
    ],
    terminology: {
      dashboardTitle: 'Education Dashboard',
      insightsLabel: 'Learning Insights',
      analyticsLabel: 'Academic Analytics',
      dataLabel: 'Student Data',
    },
  },

  healthcare: {
    id: 'healthcare',
    name: 'Healthcare Analytics',
    description: 'Patient data, treatment outcomes, and clinical insights',
    entities: {
      primary: {
        singular: 'Patient',
        plural: 'Patients',
        icon: 'Heart',
        fields: [
          { id: 'name', label: 'Patient ID', type: 'text', required: true },
          { id: 'email', label: 'Contact', type: 'email' },
          { id: 'totalSpent', label: 'Visits', type: 'number', computed: true },
          { id: 'segment', label: 'Category', type: 'category' },
          { id: 'lastInteraction', label: 'Last Visit', type: 'date' },
        ],
      },
      interaction: {
        singular: 'Appointment',
        plural: 'Appointments',
        icon: 'Calendar',
        fields: [
          { id: 'orderDate', label: 'Appointment Date', type: 'date', required: true },
          { id: 'amount', label: 'Duration (min)', type: 'number', required: true },
          { id: 'status', label: 'Status', type: 'category' },
        ],
      },
    },
    metrics: {
      primary: [
        { id: 'totalRevenue', label: 'Active Patients', description: 'Currently active patients', type: 'count', icon: 'Users' },
        { id: 'orderCount', label: 'Appointments', description: 'Total appointments', type: 'count', icon: 'Calendar' },
        { id: 'avgOrderValue', label: 'Avg Visit Duration', description: 'Average appointment time', type: 'number', icon: 'Clock' },
      ],
      derived: [
        { id: 'clv', label: 'Health Score', description: 'Predicted health outcome', type: 'number', icon: 'Activity' },
        { id: 'churnRisk', label: 'Readmission Risk', description: 'Hospital readmission risk', type: 'percentage', icon: 'AlertTriangle' },
      ],
    },
    models: [
      {
        id: 'readmission-prediction',
        name: 'Readmission Prediction',
        description: 'Predict patient readmission risk',
        targetEntity: 'patient',
        predictionType: 'classification',
        outputs: [{ id: 'readmissionRisk', label: 'Readmission Risk', type: 'probability' }],
      },
    ],
    terminology: {
      dashboardTitle: 'Healthcare Dashboard',
      insightsLabel: 'Clinical Insights',
      analyticsLabel: 'Patient Analytics',
      dataLabel: 'Patient Data',
    },
  },

  custom: {
    id: 'custom',
    name: 'Custom Domain',
    description: 'Fully customizable for your specific needs',
    entities: {
      primary: {
        singular: 'Entity',
        plural: 'Entities',
        icon: 'Database',
        fields: [
          { id: 'name', label: 'Name', type: 'text', required: true },
          { id: 'email', label: 'Contact', type: 'email' },
          { id: 'totalSpent', label: 'Total Value', type: 'number', computed: true },
          { id: 'segment', label: 'Category', type: 'category' },
          { id: 'lastInteraction', label: 'Last Activity', type: 'date' },
        ],
      },
      interaction: {
        singular: 'Event',
        plural: 'Events',
        icon: 'Activity',
        fields: [
          { id: 'orderDate', label: 'Event Date', type: 'date', required: true },
          { id: 'amount', label: 'Value', type: 'number', required: true },
          { id: 'status', label: 'Status', type: 'category' },
        ],
      },
    },
    metrics: {
      primary: [
        { id: 'totalRevenue', label: 'Total Value', description: 'Aggregate value', type: 'number', icon: 'BarChart' },
        { id: 'orderCount', label: 'Event Count', description: 'Number of events', type: 'count', icon: 'Activity' },
        { id: 'avgOrderValue', label: 'Avg Value', description: 'Average event value', type: 'number', icon: 'TrendingUp' },
      ],
      derived: [
        { id: 'clv', label: 'Predicted Value', description: 'Forecasted value', type: 'number', icon: 'Target' },
        { id: 'churnRisk', label: 'Risk Score', description: 'Risk assessment', type: 'percentage', icon: 'AlertTriangle' },
      ],
    },
    models: [
      {
        id: 'generic-prediction',
        name: 'Generic Prediction',
        description: 'Customizable prediction model',
        targetEntity: 'entity',
        predictionType: 'regression',
        outputs: [{ id: 'prediction', label: 'Prediction', type: 'value' }],
      },
    ],
    terminology: {
      dashboardTitle: 'Analytics Dashboard',
      insightsLabel: 'Insights',
      analyticsLabel: 'Analytics',
      dataLabel: 'Data',
    },
  },
};

// ============================================================================
// Helper Functions
// ============================================================================

export function getDomainConfig(domainId: DomainType): DomainConfiguration {
  return DOMAIN_CONFIGS[domainId];
}

export function getAllDomains(): DomainConfiguration[] {
  return Object.values(DOMAIN_CONFIGS);
}

export function mapEntityFields(
  domain: DomainType,
  entityType: 'primary' | 'secondary' | 'interaction',
  data: Record<string, any>
): Record<string, any> {
  const config = getDomainConfig(domain);
  const entity = config.entities[entityType];

  if (!entity) return data;

  // Map generic fields to domain-specific labels
  const mapped: Record<string, any> = {};

  entity.fields.forEach(field => {
    if (data[field.id] !== undefined) {
      mapped[field.label] = data[field.id];
    }
  });

  return mapped;
}

export function getMetricLabel(domain: DomainType, metricId: string): string {
  const config = getDomainConfig(domain);
  const metric = [...config.metrics.primary, ...config.metrics.derived]
    .find(m => m.id === metricId);

  return metric?.label || metricId;
}
