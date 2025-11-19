/**
 * User Preferences Type Definitions
 * Centralized configuration for all user-customizable settings
 */

export type DashboardLayout = "grid" | "list" | "compact";
export type RefreshInterval = "off" | "30s" | "1m" | "5m" | "15m";
export type ColorPalette = "default" | "ocean" | "sunset" | "forest" | "purple" | "rose";
export type DateFormat = "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD";
export type CurrencyFormat = "USD" | "EUR" | "GBP" | "JPY";

export interface WidgetSettings {
  id: string;
  enabled: boolean;
  order: number;
  size?: "small" | "medium" | "large";
}

export interface NotificationSettings {
  enabled: boolean;
  churnAlerts: boolean;
  salesMilestones: boolean;
  lowInventory: boolean;
  soundEnabled: boolean;
}

export interface DashboardPreferences {
  layout: DashboardLayout;
  refreshInterval: RefreshInterval;
  defaultTab: string;
  showAnimations: boolean;
  compactMode: boolean;
}

export interface DisplayPreferences {
  colorPalette: ColorPalette;
  dateFormat: DateFormat;
  currencyFormat: CurrencyFormat;
  showTooltips: boolean;
  reducedMotion: boolean;
}

export interface UserPreferences {
  dashboard: DashboardPreferences;
  display: DisplayPreferences;
  widgets: WidgetSettings[];
  notifications: NotificationSettings;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  dashboard: {
    layout: "grid",
    refreshInterval: "1m",
    defaultTab: "overview",
    showAnimations: true,
    compactMode: false,
  },
  display: {
    colorPalette: "default",
    dateFormat: "MM/DD/YYYY",
    currencyFormat: "USD",
    showTooltips: true,
    reducedMotion: false,
  },
  widgets: [
    { id: "kpi-cards", enabled: true, order: 0, size: "medium" },
    { id: "clv-prediction", enabled: true, order: 1, size: "large" },
    { id: "churn-analysis", enabled: true, order: 2, size: "large" },
    { id: "sales-forecast", enabled: true, order: 3, size: "large" },
    { id: "recommendations", enabled: true, order: 4, size: "medium" },
  ],
  notifications: {
    enabled: true,
    churnAlerts: true,
    salesMilestones: true,
    lowInventory: false,
    soundEnabled: false,
  },
};

export const REFRESH_INTERVALS: Record<RefreshInterval, number> = {
  off: 0,
  "30s": 30000,
  "1m": 60000,
  "5m": 300000,
  "15m": 900000,
};

export const COLOR_PALETTES = {
  default: {
    primary: "hsl(222.2 47.4% 11.2%)",
    accent: "hsl(210 40% 96.1%)",
  },
  ocean: {
    primary: "hsl(199 89% 48%)",
    accent: "hsl(199 89% 95%)",
  },
  sunset: {
    primary: "hsl(24 95% 53%)",
    accent: "hsl(24 95% 97%)",
  },
  forest: {
    primary: "hsl(142 76% 36%)",
    accent: "hsl(142 76% 95%)",
  },
  purple: {
    primary: "hsl(262 83% 58%)",
    accent: "hsl(262 83% 97%)",
  },
  rose: {
    primary: "hsl(346 77% 50%)",
    accent: "hsl(346 77% 97%)",
  },
};
