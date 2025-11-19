/**
 * Advanced Theme Customizer
 * Provides granular control over theme colors, typography, and spacing
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { usePreferences } from "@/components/preferences-provider";
import { Palette, Type, Grid3x3, Radius, Download, Upload } from "lucide-react";

interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  muted: string;
  border: string;
}

interface ThemeSettings {
  colors: ThemeColors;
  borderRadius: number;
  fontSize: number;
  spacing: number;
  fontFamily: string;
}

export function AdvancedThemeCustomizer() {
  const { preferences, updateDisplay } = usePreferences();

  const [customTheme, setCustomTheme] = useState<ThemeSettings>({
    colors: {
      primary: "hsl(222.2 47.4% 11.2%)",
      secondary: "hsl(210 40% 96.1%)",
      accent: "hsl(210 40% 96.1%)",
      background: "hsl(0 0% 100%)",
      foreground: "hsl(222.2 47.4% 11.2%)",
      muted: "hsl(210 40% 96.1%)",
      border: "hsl(214.3 31.8% 91.4%)",
    },
    borderRadius: 8,
    fontSize: 16,
    spacing: 16,
    fontFamily: "system-ui, -apple-system, sans-serif",
  });

  const applyTheme = () => {
    const root = document.documentElement;

    // Apply colors
    Object.entries(customTheme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });

    // Apply other settings
    root.style.setProperty("--radius", `${customTheme.borderRadius}px`);
    root.style.setProperty("--font-size-base", `${customTheme.fontSize}px`);
    root.style.setProperty("--spacing-base", `${customTheme.spacing}px`);
    root.style.setProperty("--font-family", customTheme.fontFamily);
  };

  const exportTheme = () => {
    const themeJson = JSON.stringify(customTheme, null, 2);
    const blob = new Blob([themeJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "custom-theme.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const importTheme = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const theme = JSON.parse(e.target?.result as string);
        setCustomTheme(theme);
        applyTheme();
      } catch (error) {
        console.error("Failed to import theme:", error);
      }
    };
    reader.readAsText(file);
  };

  const updateColor = (key: keyof ThemeColors, value: string) => {
    setCustomTheme((prev) => ({
      ...prev,
      colors: { ...prev.colors, [key]: value },
    }));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Advanced Theme Customizer
        </CardTitle>
        <CardDescription>
          Create and customize your own theme with granular control
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="colors" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="colors">
              <Palette className="h-4 w-4 mr-2" />
              Colors
            </TabsTrigger>
            <TabsTrigger value="typography">
              <Type className="h-4 w-4 mr-2" />
              Typography
            </TabsTrigger>
            <TabsTrigger value="spacing">
            <Grid3x3 className="h-4 w-4 mr-2" />
              Spacing
            </TabsTrigger>
            <TabsTrigger value="export">
              <Download className="h-4 w-4 mr-2" />
              Export
            </TabsTrigger>
          </TabsList>

          <TabsContent value="colors" className="space-y-4 mt-4">
            {Object.entries(customTheme.colors).map(([key, value]) => {
              // Convert HSL to hex for color input
              const getHexFromHsl = (hsl: string): string => {
                if (!hsl.startsWith("hsl")) return hsl;
                const match = hsl.match(/\d+(\.\d+)?/g);
                if (!match || match.length < 3) return "#000000";

                const h = parseFloat(match[0]) / 360;
                const s = parseFloat(match[1]) / 100;
                const l = parseFloat(match[2]) / 100;

                const hslToRgb = (h: number, s: number, l: number) => {
                  let r, g, b;
                  if (s === 0) {
                    r = g = b = l;
                  } else {
                    const hue2rgb = (p: number, q: number, t: number) => {
                      if (t < 0) t += 1;
                      if (t > 1) t -= 1;
                      if (t < 1/6) return p + (q - p) * 6 * t;
                      if (t < 1/2) return q;
                      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                      return p;
                    };
                    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                    const p = 2 * l - q;
                    r = hue2rgb(p, q, h + 1/3);
                    g = hue2rgb(p, q, h);
                    b = hue2rgb(p, q, h - 1/3);
                  }
                  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
                };

                const [r, g, b] = hslToRgb(h, s, l);
                return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
              };

              return (
                <div key={key} className="space-y-2">
                  <Label className="capitalize">{key.replace(/([A-Z])/g, " $1")}</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={getHexFromHsl(value)}
                      onChange={(e) => updateColor(key as keyof ThemeColors, e.target.value)}
                      className="w-20 h-10"
                    />
                    <Input
                      type="text"
                      value={value}
                      onChange={(e) => updateColor(key as keyof ThemeColors, e.target.value)}
                      className="flex-1"
                      placeholder="hsl(0 0% 0%) or #000000"
                    />
                  </div>
                </div>
              );
            })}
          </TabsContent>

          <TabsContent value="typography" className="space-y-6 mt-4">
            <div className="space-y-2">
              <Label>Font Size (Base): {customTheme.fontSize}px</Label>
              <Slider
                value={[customTheme.fontSize]}
                onValueChange={([value]) =>
                  setCustomTheme((prev) => ({ ...prev, fontSize: value }))
                }
                min={12}
                max={24}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <Label>Font Family</Label>
              <Input
                value={customTheme.fontFamily}
                onChange={(e) =>
                  setCustomTheme((prev) => ({ ...prev, fontFamily: e.target.value }))
                }
                placeholder="system-ui, -apple-system, sans-serif"
              />
              <p className="text-sm text-muted-foreground">
                Examples: "Inter", "Roboto", "system-ui"
              </p>
            </div>
          </TabsContent>

          <TabsContent value="spacing" className="space-y-6 mt-4">
            <div className="space-y-2">
              <Label>Border Radius: {customTheme.borderRadius}px</Label>
              <Slider
                value={[customTheme.borderRadius]}
                onValueChange={([value]) =>
                  setCustomTheme((prev) => ({ ...prev, borderRadius: value }))
                }
                min={0}
                max={24}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <Label>Base Spacing: {customTheme.spacing}px</Label>
              <Slider
                value={[customTheme.spacing]}
                onValueChange={([value]) =>
                  setCustomTheme((prev) => ({ ...prev, spacing: value }))
                }
                min={8}
                max={32}
                step={2}
              />
            </div>
          </TabsContent>

          <TabsContent value="export" className="space-y-4 mt-4">
            <div className="flex gap-2">
              <Button onClick={exportTheme} className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Export Theme
              </Button>
              <Button
                onClick={() => document.getElementById("theme-import")?.click()}
                variant="outline"
                className="flex-1"
              >
                <Upload className="h-4 w-4 mr-2" />
                Import Theme
              </Button>
              <input
                id="theme-import"
                type="file"
                accept=".json"
                onChange={importTheme}
                className="hidden"
              />
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <pre className="text-xs overflow-auto">
                {JSON.stringify(customTheme, null, 2)}
              </pre>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex gap-2">
          <Button onClick={applyTheme} className="flex-1">
            Apply Theme
          </Button>
          <Button
            onClick={() => {
              const root = document.documentElement;
              root.removeAttribute("style");
            }}
            variant="outline"
          >
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
