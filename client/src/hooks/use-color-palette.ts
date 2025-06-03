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
    
    // Update CSS custom properties
    const root = document.documentElement;
    const palette = colorPalettes[currentPalette];
    
    // Convert hex colors to HSL for CSS variables
    const hexToHsl = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;
      
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h = 0, s = 0, l = (max + min) / 2;
      
      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
      }
      
      return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
    };
    
    root.style.setProperty('--theme-primary', hexToHsl(palette.primary));
    root.style.setProperty('--theme-secondary', hexToHsl(palette.secondary));
    root.style.setProperty('--theme-accent', hexToHsl(palette.accent));
    root.style.setProperty('--theme-success', hexToHsl(palette.success));
    root.style.setProperty('--theme-warning', hexToHsl(palette.warning));
    root.style.setProperty('--theme-danger', hexToHsl(palette.danger));
    root.style.setProperty('--theme-info', hexToHsl(palette.info));
    root.style.setProperty('--theme-neutral', hexToHsl(palette.neutral));
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