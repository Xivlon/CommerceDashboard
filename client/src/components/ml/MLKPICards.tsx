import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Users, AlertTriangle, TrendingUp, Target } from "lucide-react";
import { useColorPalette } from "@/hooks/use-color-palette";
import type { DashboardMetrics } from "@shared/schema";

interface MLKPICardsProps {
  metrics?: DashboardMetrics;
}

export function MLKPICards({ metrics }: MLKPICardsProps) {
  const { colors } = useColorPalette();
  if (!metrics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const kpiCards = [
    {
      title: "Total Revenue",
      value: `$${(metrics.totalRevenue / 1000).toFixed(1)}K`,
      change: "+12.5%",
      changeType: "positive" as const,
      icon: DollarSign,
      bgColor: colors.success,
      description: "Total sales revenue"
    },
    {
      title: "Avg CLV",
      value: `$${metrics.avgCLV.toFixed(0)}`,
      change: "+8.3%",
      changeType: "positive" as const,
      icon: Users,
      bgColor: colors.primary,
      badge: "ML Predicted",
      badgeColor: colors.primary
    },
    {
      title: "Churn Risk",
      value: `${metrics.churnRiskPercentage.toFixed(1)}%`,
      change: `${Math.round((metrics.churnRiskPercentage / 100) * metrics.totalCustomers)} customers`,
      changeType: "negative" as const,
      icon: AlertTriangle,
      bgColor: colors.danger,
      badge: "High Risk",
      badgeColor: colors.danger
    },
    {
      title: "Forecast Accuracy",
      value: `${metrics.modelMetrics.forecastAccuracy.toFixed(1)}%`,
      change: "95% confidence",
      changeType: "neutral" as const,
      icon: TrendingUp,
      bgColor: colors.secondary,
      badge: "ML Model",
      badgeColor: colors.secondary
    },
    {
      title: "Cross-sell Opportunities",
      value: metrics.crossSellOpportunities.toString(),
      change: `+$${(metrics.crossSellOpportunities * 45).toLocaleString()} potential`,
      changeType: "positive" as const,
      icon: Target,
      bgColor: colors.accent,
      badge: "Revenue Boost",
      badgeColor: colors.accent
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
      {kpiCards.map((card, index) => (
        <Card key={index} className="hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-gray-500 text-sm font-medium">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                <div className="mt-2">
                  {card.badge ? (
                    <Badge className="text-xs text-white" style={{ backgroundColor: card.badgeColor }}>
                      {card.badge}
                    </Badge>
                  ) : (
                    <p className={`text-sm flex items-center ${
                      card.changeType === 'positive' ? 'text-green-600' :
                      card.changeType === 'negative' ? 'text-red-600' :
                      'text-gray-600'
                    }`}>
                      {card.changeType === 'positive' && <TrendingUp className="w-4 h-4 mr-1" />}
                      {card.changeType === 'negative' && <AlertTriangle className="w-4 h-4 mr-1" />}
                      {card.change}
                    </p>
                  )}
                </div>
              </div>
              <div className="p-3 rounded-full" style={{ backgroundColor: card.bgColor }}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
