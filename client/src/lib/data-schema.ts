/**
 * Custom Data Schema System
 * Allows users to define their own data structures, labels, and representations
 */

export type FieldType =
  | "string"
  | "number"
  | "boolean"
  | "date"
  | "datetime"
  | "email"
  | "url"
  | "currency"
  | "percentage"
  | "enum";

export type AggregationType = "sum" | "avg" | "min" | "max" | "count" | "median" | "mode";

export type VisualizationType =
  | "text"
  | "badge"
  | "progress"
  | "chart-line"
  | "chart-bar"
  | "chart-pie"
  | "chart-area"
  | "heatmap"
  | "table";

export interface FieldDefinition {
  id: string;
  name: string; // User-friendly label
  type: FieldType;
  description?: string;
  required?: boolean;
  unique?: boolean;

  // For enum types
  enumValues?: string[];

  // Validation
  min?: number;
  max?: number;
  pattern?: string; // Regex pattern

  // Display preferences
  displayFormat?: string; // e.g., "YYYY-MM-DD" for dates, "$0,0.00" for currency
  color?: string;
  icon?: string;

  // Aggregation
  defaultAggregation?: AggregationType;

  // Visualization
  preferredVisualization?: VisualizationType;
}

export interface DatasetSchema {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  category?: string;

  // Fields in this dataset
  fields: FieldDefinition[];

  // Relationships
  primaryKey?: string; // Field ID that serves as primary key

  // Metadata
  createdAt: string;
  updatedAt: string;
  recordCount?: number;
}

export interface CustomMetric {
  id: string;
  name: string;
  description?: string;

  // Calculation formula (JavaScript expression)
  formula: string;

  // Fields this metric depends on
  dependencies: string[];

  // Display
  type: FieldType;
  displayFormat?: string;
  visualization?: VisualizationType;

  // Aggregation for group calculations
  aggregation?: AggregationType;
}

export interface DataTransformation {
  id: string;
  name: string;
  sourceField: string;
  targetField: string;

  // Transformation type
  type: "rename" | "calculate" | "cast" | "split" | "merge" | "filter";

  // Transformation config
  config?: {
    formula?: string; // For calculate type
    targetType?: FieldType; // For cast type
    delimiter?: string; // For split type
    sourceFields?: string[]; // For merge type
    condition?: string; // For filter type
  };
}

export interface ImportMapping {
  sourceColumn: string;
  targetField: string;
  transformation?: DataTransformation;
}

export interface DataSource {
  id: string;
  name: string;
  type: "csv" | "json" | "api" | "manual";
  schemaId: string;

  // Import configuration
  url?: string; // For API sources
  apiKey?: string;
  refreshInterval?: number; // In milliseconds

  // Field mapping
  mappings: ImportMapping[];

  // Data preview
  sampleData?: any[];

  // Status
  lastImport?: string;
  status: "active" | "inactive" | "error";
  errorMessage?: string;

  createdAt: string;
  updatedAt: string;
}

export interface CustomDataset {
  schemaId: string;
  sourceId: string;
  data: Record<string, any>[];
  updatedAt: string;
}

// Storage keys
export const STORAGE_KEYS = {
  SCHEMAS: "custom-data-schemas",
  SOURCES: "custom-data-sources",
  DATASETS: "custom-datasets",
  METRICS: "custom-metrics",
} as const;

// Helper functions
export function createSchema(name: string, fields: FieldDefinition[]): DatasetSchema {
  return {
    id: generateId(),
    name,
    fields,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function createField(name: string, type: FieldType): FieldDefinition {
  return {
    id: generateId(),
    name,
    type,
  };
}

export function createMetric(
  name: string,
  formula: string,
  dependencies: string[]
): CustomMetric {
  return {
    id: generateId(),
    name,
    formula,
    dependencies,
    type: "number",
  };
}

export function validateField(value: any, field: FieldDefinition): boolean {
  if (field.required && (value === null || value === undefined || value === "")) {
    return false;
  }

  if (value === null || value === undefined || value === "") {
    return true; // Optional field
  }

  switch (field.type) {
    case "number":
    case "currency":
    case "percentage":
      if (typeof value !== "number" && isNaN(Number(value))) return false;
      const num = Number(value);
      if (field.min !== undefined && num < field.min) return false;
      if (field.max !== undefined && num > field.max) return false;
      return true;

    case "string":
      if (typeof value !== "string") return false;
      if (field.pattern && !new RegExp(field.pattern).test(value)) return false;
      return true;

    case "email":
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value));

    case "url":
      try {
        new URL(String(value));
        return true;
      } catch {
        return false;
      }

    case "boolean":
      return typeof value === "boolean" || value === "true" || value === "false";

    case "date":
    case "datetime":
      return !isNaN(new Date(value).getTime());

    case "enum":
      return field.enumValues?.includes(String(value)) ?? false;

    default:
      return true;
  }
}

export function formatFieldValue(value: any, field: FieldDefinition): string {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  switch (field.type) {
    case "currency":
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(Number(value));

    case "percentage":
      return `${Number(value).toFixed(2)}%`;

    case "date":
      return new Date(value).toLocaleDateString();

    case "datetime":
      return new Date(value).toLocaleString();

    case "number":
      if (field.displayFormat) {
        return Number(value).toFixed(parseInt(field.displayFormat) || 2);
      }
      return String(value);

    case "boolean":
      return value ? "Yes" : "No";

    default:
      return String(value);
  }
}

export function applyAggregation(
  values: any[],
  aggregation: AggregationType
): number {
  const numbers = values.map(Number).filter((n) => !isNaN(n));

  switch (aggregation) {
    case "sum":
      return numbers.reduce((sum, n) => sum + n, 0);

    case "avg":
      return numbers.length > 0
        ? numbers.reduce((sum, n) => sum + n, 0) / numbers.length
        : 0;

    case "min":
      return Math.min(...numbers);

    case "max":
      return Math.max(...numbers);

    case "count":
      return numbers.length;

    case "median":
      const sorted = [...numbers].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      return sorted.length % 2 !== 0
        ? sorted[mid]
        : (sorted[mid - 1] + sorted[mid]) / 2;

    case "mode":
      const frequency: Record<number, number> = {};
      numbers.forEach((n) => {
        frequency[n] = (frequency[n] || 0) + 1;
      });
      const maxFreq = Math.max(...Object.values(frequency));
      return Number(
        Object.keys(frequency).find((k) => frequency[Number(k)] === maxFreq)
      );

    default:
      return 0;
  }
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
