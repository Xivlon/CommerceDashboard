import { useState, useEffect } from "react";

export type ColorPalette = 'default' | 'ocean' | 'sunset' | 'forest' | 'purple' | 'monochrome';

export interface PaletteColors {
  primary: string;
  secondary: string;
  accent: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  neutral: string;
}

const colorPalettes: Record<ColorPalette, PaletteColors> = {
  default: {
    primary: '#3b82f6',
    secondary: '#10b981',
    accent: '#f59e0b',
    success: '#22c55e',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#06b6d4',
    neutral: '#6b7280'
  },
  ocean: {
    primary: '#0ea5e9',
    secondary: '#06b6d4',
    accent: '#0891b2',
    success: '#14b8a6',
    warning: '#f59e0b',
    danger: '#e11d48',
    info: '#3b82f6',
    neutral: '#64748b'
  },
  sunset: {
    primary: '#f97316',
    secondary: '#ef4444',
    accent: '#eab308',
    success: '#84cc16',
    warning: '#f59e0b',
    danger: '#dc2626',
    info: '#8b5cf6',
    neutral: '#78716c'
  },
  forest: {
    primary: '#16a34a',
    secondary: '#059669',
    accent: '#65a30d',
    success: '#22c55e',
    warning: '#ca8a04',
    danger: '#dc2626',
    info: '#0891b2',
    neutral: '#6b7280'
  },
  purple: {
    primary: '#8b5cf6',
    secondary: '#a855f7',
    accent: '#c084fc',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#06b6d4',
    neutral: '#6b7280'
  },
  monochrome: {
    primary: '#374151',
    secondary: '#4b5563',
    accent: '#6b7280',
    success: '#9ca3af',
    warning: '#d1d5db',
    danger: '#111827',
    info: '#f3f4f6',
    neutral: '#e5e7eb'
  }
};

const paletteNames: Record<ColorPalette, string> = {
  default: 'Default Blue',
  ocean: 'Ocean Breeze',
  sunset: 'Sunset Glow',
  forest: 'Forest Green',
  purple: 'Royal Purple',
  monochrome: 'Monochrome'
};

export function useColorPalette() {
  const [currentPalette, setCurrentPalette] = useState<ColorPalette>(() => {
    const saved = localStorage.getItem('ml-dashboard-palette');
    return (saved as ColorPalette) || 'default';
  });

  useEffect(() => {
    localStorage.setItem('ml-dashboard-palette', currentPalette);
  }, [currentPalette]);

  const changePalette = (palette: ColorPalette) => {
    setCurrentPalette(palette);
  };

  const colors = colorPalettes[currentPalette];

  const getChartColors = () => {
    return [
      colors.primary,
      colors.secondary,
      colors.accent,
      colors.success,
      colors.warning,
      colors.danger,
      colors.info,
      colors.neutral
    ];
  };

  return {
    currentPalette,
    changePalette,
    colors,
    getChartColors,
    availablePalettes: Object.keys(colorPalettes) as ColorPalette[],
    paletteNames
  };
}