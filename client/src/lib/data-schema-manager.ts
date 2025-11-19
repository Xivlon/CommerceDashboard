/**
 * Data Schema Manager
 * Handles CRUD operations for custom schemas, data sources, and datasets
 */

import {
  DatasetSchema,
  DataSource,
  CustomDataset,
  CustomMetric,
  STORAGE_KEYS,
  FieldDefinition,
  validateField,
  ImportMapping,
} from "./data-schema";

class DataSchemaManager {
  // ===== SCHEMA MANAGEMENT =====

  getSchemas(): DatasetSchema[] {
    const stored = localStorage.getItem(STORAGE_KEYS.SCHEMAS);
    return stored ? JSON.parse(stored) : [];
  }

  getSchema(schemaId: string): DatasetSchema | undefined {
    return this.getSchemas().find((s) => s.id === schemaId);
  }

  saveSchema(schema: DatasetSchema): void {
    const schemas = this.getSchemas();
    const index = schemas.findIndex((s) => s.id === schema.id);

    schema.updatedAt = new Date().toISOString();

    if (index >= 0) {
      schemas[index] = schema;
    } else {
      schemas.push(schema);
    }

    localStorage.setItem(STORAGE_KEYS.SCHEMAS, JSON.stringify(schemas));
  }

  deleteSchema(schemaId: string): void {
    const schemas = this.getSchemas().filter((s) => s.id !== schemaId);
    localStorage.setItem(STORAGE_KEYS.SCHEMAS, JSON.stringify(schemas));

    // Also delete associated data sources and datasets
    const sources = this.getSources().filter((s) => s.schemaId !== schemaId);
    localStorage.setItem(STORAGE_KEYS.SOURCES, JSON.stringify(sources));

    const datasets = this.getDatasets().filter((d) => d.schemaId !== schemaId);
    localStorage.setItem(STORAGE_KEYS.DATASETS, JSON.stringify(datasets));
  }

  addField(schemaId: string, field: FieldDefinition): void {
    const schema = this.getSchema(schemaId);
    if (!schema) return;

    schema.fields.push(field);
    this.saveSchema(schema);
  }

  updateField(schemaId: string, fieldId: string, updates: Partial<FieldDefinition>): void {
    const schema = this.getSchema(schemaId);
    if (!schema) return;

    const field = schema.fields.find((f) => f.id === fieldId);
    if (!field) return;

    Object.assign(field, updates);
    this.saveSchema(schema);
  }

  deleteField(schemaId: string, fieldId: string): void {
    const schema = this.getSchema(schemaId);
    if (!schema) return;

    schema.fields = schema.fields.filter((f) => f.id !== fieldId);
    this.saveSchema(schema);
  }

  // ===== DATA SOURCE MANAGEMENT =====

  getSources(): DataSource[] {
    const stored = localStorage.getItem(STORAGE_KEYS.SOURCES);
    return stored ? JSON.parse(stored) : [];
  }

  getSource(sourceId: string): DataSource | undefined {
    return this.getSources().find((s) => s.id === sourceId);
  }

  getSourcesBySchema(schemaId: string): DataSource[] {
    return this.getSources().filter((s) => s.schemaId === schemaId);
  }

  saveSource(source: DataSource): void {
    const sources = this.getSources();
    const index = sources.findIndex((s) => s.id === source.id);

    source.updatedAt = new Date().toISOString();

    if (index >= 0) {
      sources[index] = source;
    } else {
      sources.push(source);
    }

    localStorage.setItem(STORAGE_KEYS.SOURCES, JSON.stringify(sources));
  }

  deleteSource(sourceId: string): void {
    const sources = this.getSources().filter((s) => s.id !== sourceId);
    localStorage.setItem(STORAGE_KEYS.SOURCES, JSON.stringify(sources));

    // Also delete associated datasets
    const datasets = this.getDatasets().filter((d) => d.sourceId !== sourceId);
    localStorage.setItem(STORAGE_KEYS.DATASETS, JSON.stringify(datasets));
  }

  // ===== DATASET MANAGEMENT =====

  getDatasets(): CustomDataset[] {
    const stored = localStorage.getItem(STORAGE_KEYS.DATASETS);
    return stored ? JSON.parse(stored) : [];
  }

  getDataset(sourceId: string): CustomDataset | undefined {
    return this.getDatasets().find((d) => d.sourceId === sourceId);
  }

  getDatasetsBySchema(schemaId: string): CustomDataset[] {
    return this.getDatasets().filter((d) => d.schemaId === schemaId);
  }

  saveDataset(dataset: CustomDataset): void {
    const datasets = this.getDatasets();
    const index = datasets.findIndex((d) => d.sourceId === dataset.sourceId);

    dataset.updatedAt = new Date().toISOString();

    if (index >= 0) {
      datasets[index] = dataset;
    } else {
      datasets.push(dataset);
    }

    localStorage.setItem(STORAGE_KEYS.DATASETS, JSON.stringify(datasets));

    // Update schema record count
    const schema = this.getSchema(dataset.schemaId);
    if (schema) {
      schema.recordCount = dataset.data.length;
      this.saveSchema(schema);
    }
  }

  deleteDataset(sourceId: string): void {
    const datasets = this.getDatasets().filter((d) => d.sourceId !== sourceId);
    localStorage.setItem(STORAGE_KEYS.DATASETS, JSON.stringify(datasets));
  }

  // ===== CUSTOM METRICS =====

  getMetrics(): CustomMetric[] {
    const stored = localStorage.getItem(STORAGE_KEYS.METRICS);
    return stored ? JSON.parse(stored) : [];
  }

  getMetric(metricId: string): CustomMetric | undefined {
    return this.getMetrics().find((m) => m.id === metricId);
  }

  saveMetric(metric: CustomMetric): void {
    const metrics = this.getMetrics();
    const index = metrics.findIndex((m) => m.id === metric.id);

    if (index >= 0) {
      metrics[index] = metric;
    } else {
      metrics.push(metric);
    }

    localStorage.setItem(STORAGE_KEYS.METRICS, JSON.stringify(metrics));
  }

  deleteMetric(metricId: string): void {
    const metrics = this.getMetrics().filter((m) => m.id !== metricId);
    localStorage.setItem(STORAGE_KEYS.METRICS, JSON.stringify(metrics));
  }

  calculateMetric(metricId: string, data: Record<string, any>): any {
    const metric = this.getMetric(metricId);
    if (!metric) return null;

    try {
      // Create a safe execution context
      const context = { ...data };
      const func = new Function(...Object.keys(context), `return ${metric.formula}`);
      return func(...Object.values(context));
    } catch (error) {
      console.error(`Error calculating metric ${metric.name}:`, error);
      return null;
    }
  }

  // ===== DATA IMPORT =====

  async importCSV(file: File, sourceId: string): Promise<CustomDataset> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const data = this.parseCSV(text);

          const source = this.getSource(sourceId);
          if (!source) {
            throw new Error("Source not found");
          }

          const mappedData = this.applyMappings(data, source.mappings);
          const validatedData = this.validateData(mappedData, source.schemaId);

          const dataset: CustomDataset = {
            schemaId: source.schemaId,
            sourceId: source.id,
            data: validatedData,
            updatedAt: new Date().toISOString(),
          };

          this.saveDataset(dataset);

          // Update source status
          source.lastImport = new Date().toISOString();
          source.status = "active";
          source.sampleData = validatedData.slice(0, 5);
          this.saveSource(source);

          resolve(dataset);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    });
  }

  async importJSON(file: File, sourceId: string): Promise<CustomDataset> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const data = JSON.parse(text);
          const arrayData = Array.isArray(data) ? data : [data];

          const source = this.getSource(sourceId);
          if (!source) {
            throw new Error("Source not found");
          }

          const mappedData = this.applyMappings(arrayData, source.mappings);
          const validatedData = this.validateData(mappedData, source.schemaId);

          const dataset: CustomDataset = {
            schemaId: source.schemaId,
            sourceId: source.id,
            data: validatedData,
            updatedAt: new Date().toISOString(),
          };

          this.saveDataset(dataset);

          // Update source status
          source.lastImport = new Date().toISOString();
          source.status = "active";
          source.sampleData = validatedData.slice(0, 5);
          this.saveSource(source);

          resolve(dataset);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    });
  }

  private parseCSV(text: string): Record<string, any>[] {
    const lines = text.trim().split("\n");
    if (lines.length === 0) return [];

    const headers = lines[0].split(",").map((h) => h.trim());
    const data: Record<string, any>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim());
      const row: Record<string, any> = {};

      headers.forEach((header, index) => {
        row[header] = values[index] || "";
      });

      data.push(row);
    }

    return data;
  }

  private applyMappings(
    data: Record<string, any>[],
    mappings: ImportMapping[]
  ): Record<string, any>[] {
    return data.map((row) => {
      const mappedRow: Record<string, any> = {};

      mappings.forEach((mapping) => {
        const value = row[mapping.sourceColumn];
        mappedRow[mapping.targetField] = value;

        // Apply transformation if specified
        if (mapping.transformation) {
          // Transformation logic would go here
          // For now, just pass through
        }
      });

      return mappedRow;
    });
  }

  private validateData(
    data: Record<string, any>[],
    schemaId: string
  ): Record<string, any>[] {
    const schema = this.getSchema(schemaId);
    if (!schema) return data;

    return data.filter((row) => {
      return schema.fields.every((field) => {
        const value = row[field.id];
        return validateField(value, field);
      });
    });
  }

  // ===== UTILITY FUNCTIONS =====

  exportSchema(schemaId: string): void {
    const schema = this.getSchema(schemaId);
    if (!schema) return;

    const json = JSON.stringify(schema, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${schema.name}-schema.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async importSchema(file: File): Promise<DatasetSchema> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const schema: DatasetSchema = JSON.parse(e.target?.result as string);
          schema.id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          schema.createdAt = new Date().toISOString();
          schema.updatedAt = new Date().toISOString();
          this.saveSchema(schema);
          resolve(schema);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    });
  }

  clearAllData(): void {
    if (confirm("Are you sure you want to delete all custom data? This cannot be undone.")) {
      localStorage.removeItem(STORAGE_KEYS.SCHEMAS);
      localStorage.removeItem(STORAGE_KEYS.SOURCES);
      localStorage.removeItem(STORAGE_KEYS.DATASETS);
      localStorage.removeItem(STORAGE_KEYS.METRICS);
    }
  }
}

// Export singleton instance
export const dataSchemaManager = new DataSchemaManager();
