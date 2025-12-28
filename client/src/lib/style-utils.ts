import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Insight type to color mapping utilities
export type InsightType = 'revenue' | 'churn' | 'cross_sell' | 'forecast' | string;

export const insightColorMap: Record<string, {
  border: string;
  bg: string;
  text: string;
  textMuted: string;
  button: string;
}> = {
  revenue: {
    border: 'border-theme-primary',
    bg: 'bg-theme-primary/10',
    text: 'text-theme-primary',
    textMuted: 'text-theme-primary/80',
    button: 'bg-blue-600 hover:bg-blue-700',
  },
  churn: {
    border: 'border-theme-danger',
    bg: 'bg-theme-danger/10',
    text: 'text-theme-danger',
    textMuted: 'text-theme-danger/80',
    button: 'bg-red-600 hover:bg-red-700',
  },
  cross_sell: {
    border: 'border-theme-success',
    bg: 'bg-theme-success/10',
    text: 'text-theme-success',
    textMuted: 'text-theme-success/80',
    button: 'bg-green-600 hover:bg-green-700',
  },
  forecast: {
    border: 'border-theme-secondary',
    bg: 'bg-theme-secondary/10',
    text: 'text-theme-secondary',
    textMuted: 'text-theme-secondary/80',
    button: 'bg-purple-600 hover:bg-purple-700',
  },
};

export function getInsightColors(type: InsightType) {
  return insightColorMap[type] ?? insightColorMap.forecast;
}

export function getInsightContainerClass(type: InsightType): string {
  const colors = getInsightColors(type);
  return cn('p-4 rounded-r-lg border-l-4', colors.border, colors.bg);
}

// Risk level color mapping
export type RiskLevel = 'low' | 'medium' | 'high';

export const riskColorMap: Record<RiskLevel, {
  bg: string;
  text: string;
  badge: string;
  indicator: string;
}> = {
  low: {
    bg: 'bg-green-100 dark:bg-green-950/30',
    text: 'text-green-700 dark:text-green-400',
    badge: 'bg-green-100 text-green-800',
    indicator: 'bg-green-500',
  },
  medium: {
    bg: 'bg-yellow-100 dark:bg-yellow-950/30',
    text: 'text-yellow-700 dark:text-yellow-400',
    badge: 'bg-yellow-100 text-yellow-800',
    indicator: 'bg-yellow-500',
  },
  high: {
    bg: 'bg-red-100 dark:bg-red-950/30',
    text: 'text-red-700 dark:text-red-400',
    badge: 'bg-red-100 text-red-800',
    indicator: 'bg-red-500',
  },
};

export function getRiskColors(level: RiskLevel) {
  return riskColorMap[level];
}

// Confidence level utilities
export function getConfidenceLevel(confidence: number): RiskLevel {
  if (confidence >= 0.8) return 'high';
  if (confidence >= 0.6) return 'medium';
  return 'low';
}

export function getConfidenceColors(confidence: number) {
  const level = getConfidenceLevel(confidence);
  return {
    low: {
      bg: 'bg-yellow-100 dark:bg-yellow-950/30',
      text: 'text-yellow-700 dark:text-yellow-400',
    },
    medium: {
      bg: 'bg-blue-100 dark:bg-blue-950/30',
      text: 'text-blue-700 dark:text-blue-400',
    },
    high: {
      bg: 'bg-green-100 dark:bg-green-950/30',
      text: 'text-green-700 dark:text-green-400',
    },
  }[level];
}

// Metric card styling
export const metricCardVariants = {
  default: 'bg-card border border-border',
  primary: 'bg-theme-primary/10 border border-theme-primary/20',
  success: 'bg-theme-success/10 border border-theme-success/20',
  danger: 'bg-theme-danger/10 border border-theme-danger/20',
  warning: 'bg-yellow-100 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800',
};

export type MetricCardVariant = keyof typeof metricCardVariants;

export function getMetricCardClass(variant: MetricCardVariant = 'default'): string {
  return cn('rounded-xl p-4', metricCardVariants[variant]);
}

// Trend indicator utilities
export function getTrendIndicator(value: number): {
  icon: 'up' | 'down' | 'neutral';
  color: string;
  label: string;
} {
  if (value > 0) {
    return {
      icon: 'up',
      color: 'text-green-600 dark:text-green-400',
      label: `Up ${Math.abs(value).toFixed(1)}%`,
    };
  }
  if (value < 0) {
    return {
      icon: 'down',
      color: 'text-red-600 dark:text-red-400',
      label: `Down ${Math.abs(value).toFixed(1)}%`,
    };
  }
  return {
    icon: 'neutral',
    color: 'text-gray-600 dark:text-gray-400',
    label: 'No change',
  };
}

// Responsive grid utilities
export const gridLayouts = {
  kpiCards: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6',
  twoColumn: 'grid grid-cols-1 lg:grid-cols-2 gap-6',
  threeColumn: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
  fourColumn: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6',
};

// Animation utilities
export const animations = {
  fadeIn: 'animate-in fade-in duration-300',
  slideUp: 'animate-in slide-in-from-bottom-4 duration-300',
  scaleIn: 'animate-in zoom-in-95 duration-300',
  pulse: 'animate-pulse',
  spin: 'animate-spin',
};
