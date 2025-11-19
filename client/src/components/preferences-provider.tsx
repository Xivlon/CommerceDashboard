import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { UserPreferences, DEFAULT_PREFERENCES, COLOR_PALETTES } from "@/lib/preferences";

type PreferencesContextType = {
  preferences: UserPreferences;
  updatePreferences: (updates: Partial<UserPreferences>) => void;
  resetPreferences: () => void;
  updateDashboard: (updates: Partial<UserPreferences["dashboard"]>) => void;
  updateDisplay: (updates: Partial<UserPreferences["display"]>) => void;
  updateNotifications: (updates: Partial<UserPreferences["notifications"]>) => void;
  toggleWidget: (widgetId: string) => void;
  reorderWidgets: (widgetIds: string[]) => void;
};

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

const STORAGE_KEY = "commerce-dashboard-preferences";

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with defaults to ensure all properties exist
        return {
          ...DEFAULT_PREFERENCES,
          ...parsed,
          dashboard: { ...DEFAULT_PREFERENCES.dashboard, ...parsed.dashboard },
          display: { ...DEFAULT_PREFERENCES.display, ...parsed.display },
          notifications: { ...DEFAULT_PREFERENCES.notifications, ...parsed.notifications },
          widgets: parsed.widgets || DEFAULT_PREFERENCES.widgets,
        };
      }
    } catch (error) {
      console.error("Failed to load preferences:", error);
    }
    return DEFAULT_PREFERENCES;
  });

  // Persist preferences to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error("Failed to save preferences:", error);
    }
  }, [preferences]);

  // Apply color palette
  useEffect(() => {
    const palette = COLOR_PALETTES[preferences.display.colorPalette];
    if (palette) {
      const root = document.documentElement;
      Object.entries(palette).forEach(([key, value]) => {
        root.style.setProperty(`--${key}`, value);
      });
    }
  }, [preferences.display.colorPalette]);

  // Apply reduced motion preference
  useEffect(() => {
    const root = document.documentElement;
    if (preferences.display.reducedMotion) {
      root.style.setProperty("--animation-duration", "0.01ms");
    } else {
      root.style.removeProperty("--animation-duration");
    }
  }, [preferences.display.reducedMotion]);

  const updatePreferences = useCallback((updates: Partial<UserPreferences>) => {
    setPreferences((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetPreferences = useCallback(() => {
    setPreferences(DEFAULT_PREFERENCES);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const updateDashboard = useCallback((updates: Partial<UserPreferences["dashboard"]>) => {
    setPreferences((prev) => ({
      ...prev,
      dashboard: { ...prev.dashboard, ...updates },
    }));
  }, []);

  const updateDisplay = useCallback((updates: Partial<UserPreferences["display"]>) => {
    setPreferences((prev) => ({
      ...prev,
      display: { ...prev.display, ...updates },
    }));
  }, []);

  const updateNotifications = useCallback((updates: Partial<UserPreferences["notifications"]>) => {
    setPreferences((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, ...updates },
    }));
  }, []);

  const toggleWidget = useCallback((widgetId: string) => {
    setPreferences((prev) => ({
      ...prev,
      widgets: prev.widgets.map((w) =>
        w.id === widgetId ? { ...w, enabled: !w.enabled } : w
      ),
    }));
  }, []);

  const reorderWidgets = useCallback((widgetIds: string[]) => {
    setPreferences((prev) => ({
      ...prev,
      widgets: widgetIds.map((id, index) => {
        const widget = prev.widgets.find((w) => w.id === id);
        return widget ? { ...widget, order: index } : { id, enabled: true, order: index };
      }),
    }));
  }, []);

  const value: PreferencesContextType = {
    preferences,
    updatePreferences,
    resetPreferences,
    updateDashboard,
    updateDisplay,
    updateNotifications,
    toggleWidget,
    reorderWidgets,
  };

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error("usePreferences must be used within a PreferencesProvider");
  }
  return context;
}
