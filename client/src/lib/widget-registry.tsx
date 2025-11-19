/**
 * Widget Registry
 * Central registry for all dashboard widgets with metadata
 */

import { ComponentType } from "react";
import { MLKPICards } from "@/components/ml/MLKPICards";
import { CLVPrediction } from "@/components/ml/CLVPrediction";
import { ChurnAnalysis } from "@/components/ml/ChurnAnalysis";
import { SalesForecasting } from "@/components/ml/SalesForecasting";
import { ProductRecommendations } from "@/components/ml/ProductRecommendations";

export interface WidgetProps {
  period?: string;
  category?: string;
  detailed?: boolean;
  metrics?: any;
  [key: string]: any;
}

export interface WidgetDefinition {
  id: string;
  component: ComponentType<WidgetProps>;
  title: string;
  description: string;
  category: "analytics" | "ml" | "kpi";
  defaultSize: "small" | "medium" | "large";
  requiredProps?: string[];
  minWidth?: number;
  minHeight?: number;
}

export const WIDGET_DEFINITIONS: Record<string, WidgetDefinition> = {
  "kpi-cards": {
    id: "kpi-cards",
    component: MLKPICards as ComponentType<WidgetProps>,
    title: "KPI Cards",
    description: "Key performance indicators at a glance",
    category: "kpi",
    defaultSize: "medium",
    requiredProps: ["metrics"],
    minWidth: 1,
    minHeight: 1,
  },
  "clv-prediction": {
    id: "clv-prediction",
    component: CLVPrediction,
    title: "Customer Lifetime Value",
    description: "Predict customer value over time",
    category: "ml",
    defaultSize: "large",
    requiredProps: ["period"],
    minWidth: 2,
    minHeight: 2,
  },
  "churn-analysis": {
    id: "churn-analysis",
    component: ChurnAnalysis,
    title: "Churn Analysis",
    description: "Identify at-risk customers",
    category: "ml",
    defaultSize: "large",
    requiredProps: ["period"],
    minWidth: 2,
    minHeight: 2,
  },
  "sales-forecast": {
    id: "sales-forecast",
    component: SalesForecasting,
    title: "Sales Forecasting",
    description: "Revenue predictions and trends",
    category: "analytics",
    defaultSize: "large",
    requiredProps: ["period"],
    minWidth: 2,
    minHeight: 2,
  },
  "recommendations": {
    id: "recommendations",
    component: ProductRecommendations,
    title: "Product Recommendations",
    description: "Cross-sell and up-sell insights",
    category: "analytics",
    defaultSize: "medium",
    requiredProps: ["category"],
    minWidth: 2,
    minHeight: 1,
  },
};

export function getWidget(widgetId: string): WidgetDefinition | undefined {
  return WIDGET_DEFINITIONS[widgetId];
}

export function getAllWidgets(): WidgetDefinition[] {
  return Object.values(WIDGET_DEFINITIONS);
}

export function getWidgetsByCategory(category: "analytics" | "ml" | "kpi"): WidgetDefinition[] {
  return getAllWidgets().filter((widget) => widget.category === category);
}
