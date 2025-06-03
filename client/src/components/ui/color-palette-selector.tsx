import { Palette, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useColorPalette, type ColorPalette } from "@/hooks/use-color-palette";

export function ColorPaletteSelector() {
  const { currentPalette, changePalette, colors, availablePalettes, paletteNames } = useColorPalette();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Palette className="h-4 w-4" />
          <div 
            className="w-4 h-4 rounded-full border border-gray-300" 
            style={{ backgroundColor: colors.primary }}
          />
          {paletteNames[currentPalette]}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <h4 className="font-medium">Color Palette</h4>
          </div>
          
          <div className="grid gap-3">
            {availablePalettes.map((palette) => {
              const paletteColors = palette === currentPalette ? colors : {
                primary: palette === 'default' ? '#3b82f6' :
                        palette === 'ocean' ? '#0ea5e9' :
                        palette === 'sunset' ? '#f97316' :
                        palette === 'forest' ? '#16a34a' :
                        palette === 'purple' ? '#8b5cf6' : '#374151',
                secondary: palette === 'default' ? '#10b981' :
                          palette === 'ocean' ? '#06b6d4' :
                          palette === 'sunset' ? '#ef4444' :
                          palette === 'forest' ? '#059669' :
                          palette === 'purple' ? '#a855f7' : '#4b5563',
                accent: palette === 'default' ? '#f59e0b' :
                       palette === 'ocean' ? '#0891b2' :
                       palette === 'sunset' ? '#eab308' :
                       palette === 'forest' ? '#65a30d' :
                       palette === 'purple' ? '#c084fc' : '#6b7280'
              };
              
              return (
                <button
                  key={palette}
                  onClick={() => changePalette(palette)}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-colors hover:bg-gray-50 ${
                    palette === currentPalette 
                      ? 'border-blue-300 bg-blue-50' 
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      <div 
                        className="w-4 h-4 rounded-full border border-gray-300"
                        style={{ backgroundColor: paletteColors.primary }}
                      />
                      <div 
                        className="w-4 h-4 rounded-full border border-gray-300"
                        style={{ backgroundColor: paletteColors.secondary }}
                      />
                      <div 
                        className="w-4 h-4 rounded-full border border-gray-300"
                        style={{ backgroundColor: paletteColors.accent }}
                      />
                    </div>
                    <span className="font-medium text-sm">{paletteNames[palette]}</span>
                  </div>
                  
                  {palette === currentPalette && (
                    <Check className="h-4 w-4 text-blue-600" />
                  )}
                </button>
              );
            })}
          </div>
          
          <div className="pt-3 border-t">
            <p className="text-xs text-gray-500">
              Color palette changes apply to all charts and visualizations
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}