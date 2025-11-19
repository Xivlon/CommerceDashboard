import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Users, AlertTriangle, TrendingUp, Target, Star, Activity } from "lucide-react";
import { useColorPalette } from "@/hooks/use-color-palette";
import { useDomain } from "@/contexts/domain-context";
import type { DashboardMetrics } from "@shared/schema";

interface MLKPICardsProps {
  metrics?: DashboardMetrics;
}

export function MLKPICards({ metrics }: MLKPICardsProps) {
  const { colors } = useColorPalette();
  const { domainConfig, getMetricLabel } = useDomain();
  if (!metrics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Get domain-specific metrics
  const primaryMetrics = domainConfig.metrics.primary.slice(0, 3);
  const derivedMetrics = domainConfig.metrics.derived.slice(0, 2);

  // Helper to get icon by name
  const getIcon = (iconName: string) => {
    const icons: Record<string, any> = {
      DollarSign, Users, AlertTriangle, TrendingUp, Target, Star, Activity
    };
    return icons[iconName] || Activity;
  };

  // Helper to format value based on metric type
  const formatValue = (value: number, type: string) => {
    switch (type) {
      case 'currency':
        return `$${(value / 1000).toFixed(1)}K`;
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'count':
        return value.toLocaleString();
      default:
        return value.toFixed(0);
    }
  };

  const kpiCards = [
    // Primary Metrics
    ...primaryMetrics.map((metric, idx) => ({
      title: metric.label,
      value: idx === 0
        ? formatValue(metrics.totalRevenue, metric.type)
        : idx === 1
        ? formatValue(metrics.totalCustomers, metric.type)
        : formatValue(metrics.avgCLV, metric.type),
      change: "+12.5%",
      changeType: "positive" as const,
      icon: getIcon(metric.icon),
      bgColor: idx === 0 ? "bg-theme-success" : idx === 1 ? "bg-theme-primary" : "bg-theme-secondary",
      description: metric.description
    })),
    // Derived Metrics
    ...derivedMetrics.map((metric, idx) => ({
      title: metric.label,
      value: idx === 0
        ? formatValue(metrics.avgCLV, metric.type)
        : formatValue(metrics.churnRiskPercentage, metric.type),
      change: idx === 0 ? "95% confidence" : `${Math.round((metrics.churnRiskPercentage / 100) * metrics.totalCustomers)} at risk`,
      changeType: idx === 0 ? "neutral" as const : "negative" as const,
      icon: getIcon(metric.icon),
      bgColor: idx === 0 ? "bg-theme-accent" : "bg-theme-danger",
      badge: "ML Predicted",
      badgeColor: idx === 0 ? "bg-theme-accent" : "bg-theme-danger"
    }))
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
      {kpiCards.map((card, index) => (
        <Card key={index} className="hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-muted-foreground text-sm font-medium">{card.title}</p>
                <p className="text-2xl font-bold text-foreground mt-1">{card.value}</p>
                <div className="mt-2">
                  {card.badge ? (
                    <Badge className={`text-xs text-white ${card.badgeColor}`}>
                      {card.badge}
                    </Badge>
                  ) : (
                    <p className={`text-sm flex items-center ${
                      card.changeType === 'positive' ? 'text-theme-success' :
                      card.changeType === 'negative' ? 'text-theme-danger' :
                      'text-muted-foreground'
                    }`}>
                      {card.changeType === 'positive' && <TrendingUp className="w-4 h-4 mr-1" />}
                      {card.changeType === 'negative' && <AlertTriangle className="w-4 h-4 mr-1" />}
                      {card.change}
                    </p>
                  )}
                </div>
              </div>
              <div className={`p-3 rounded-full ${card.bgColor}`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
