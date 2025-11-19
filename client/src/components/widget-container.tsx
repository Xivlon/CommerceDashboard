/**
 * Widget Container
 * Renders widgets dynamically based on preferences and widget registry
 */

import { memo } from "react";
import { Card } from "@/components/ui/card";
import { getWidget, WidgetProps } from "@/lib/widget-registry";
import { usePreferences } from "@/components/preferences-provider";
import { cn } from "@/lib/utils";

interface WidgetContainerProps {
  widgetId: string;
  props?: WidgetProps;
  className?: string;
  showTitle?: boolean;
}

export const WidgetContainer = memo(function WidgetContainer({
  widgetId,
  props = {},
  className,
  showTitle = false,
}: WidgetContainerProps) {
  const { preferences } = usePreferences();
  const widgetDef = getWidget(widgetId);

  // Check if widget is enabled
  const widgetSettings = preferences.widgets.find((w) => w.id === widgetId);
  const isEnabled = widgetSettings?.enabled ?? true;

  if (!isEnabled || !widgetDef) {
    return null;
  }

  const WidgetComponent = widgetDef.component;

  // Determine widget size class
  const sizeClasses = {
    small: "col-span-1",
    medium: "col-span-1 lg:col-span-2",
    large: "col-span-1 lg:col-span-2 xl:col-span-3",
  };

  const widgetSize = widgetSettings?.size || widgetDef.defaultSize;

  return (
    <div
      className={cn(sizeClasses[widgetSize], className)}
      data-widget-id={widgetId}
      data-widget-order={widgetSettings?.order}
    >
      {showTitle && (
        <div className="mb-2">
          <h3 className="text-lg font-semibold">{widgetDef.title}</h3>
          <p className="text-sm text-muted-foreground">{widgetDef.description}</p>
        </div>
      )}
      <WidgetComponent {...props} />
    </div>
  );
});

interface WidgetGridProps {
  widgetIds: string[];
  sharedProps?: WidgetProps;
  className?: string;
}

export function WidgetGrid({ widgetIds, sharedProps = {}, className }: WidgetGridProps) {
  const { preferences } = usePreferences();

  // Sort widgets by order preference
  const sortedWidgetIds = [...widgetIds].sort((a, b) => {
    const orderA = preferences.widgets.find((w) => w.id === a)?.order ?? 999;
    const orderB = preferences.widgets.find((w) => w.id === b)?.order ?? 999;
    return orderA - orderB;
  });

  const layout = preferences.dashboard.layout;
  const compactMode = preferences.dashboard.compactMode;

  // Layout-specific grid classes
  const layoutClasses = {
    grid: "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6",
    list: "flex flex-col gap-6",
    compact: "grid grid-cols-1 gap-2",
  };

  return (
    <div className={cn(layoutClasses[layout], compactMode && "gap-2", className)}>
      {sortedWidgetIds.map((widgetId) => (
        <WidgetContainer
          key={widgetId}
          widgetId={widgetId}
          props={sharedProps}
        />
      ))}
    </div>
  );
}
