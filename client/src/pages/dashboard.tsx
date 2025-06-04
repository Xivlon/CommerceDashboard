import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, Download } from "lucide-react";
import { MLKPICards } from "@/components/ml/MLKPICards";
import { CLVPrediction } from "@/components/ml/CLVPrediction";
import { ChurnAnalysis } from "@/components/ml/ChurnAnalysis";
import { SalesForecasting } from "@/components/ml/SalesForecasting";
import { ProductRecommendations } from "@/components/ml/ProductRecommendations";
import { ColorPaletteSelector } from "@/components/ui/color-palette-selector";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { getDashboardMetrics, getMLInsights, retrainModels } from "@/lib/ml-api";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState("30d");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const { data: dashboardMetrics, isLoading: metricsLoading, refetch: refetchMetrics } = useQuery({
    queryKey: ["/api/dashboard/metrics"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: mlInsights, isLoading: insightsLoading, refetch: refetchInsights } = useQuery({
    queryKey: ["/api/dashboard/insights"],
    refetchInterval: 60000, // Refresh every minute
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await retrainModels("all");
      await Promise.all([refetchMetrics(), refetchInsights()]);
      toast({
        title: "Models Updated",
        description: "ML models have been retrained successfully.",
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh ML models. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Dashboard data is being exported...",
    });
  };

  if (metricsLoading || insightsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-20 bg-white rounded-xl"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-32 bg-white rounded-xl"></div>
              ))}
            </div>
            <div className="h-96 bg-white rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">AI-Powered E-commerce Analytics</h1>
            <p className="text-gray-600">Real-time insights with Customer CLV, Churn Prediction & Sales Forecasting</p>
          </div>
          
          <div className="flex flex-wrap gap-3 mt-4 lg:mt-0">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="electronics">Electronics</SelectItem>
                <SelectItem value="clothing">Clothing</SelectItem>
                <SelectItem value="home">Home & Garden</SelectItem>
              </SelectContent>
            </Select>
            
            <ColorPaletteSelector />
            
            <Button 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="bg-theme-primary hover:bg-theme-primary/80"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh ML Models
            </Button>
            
            <Button 
              onClick={handleExport}
              className="bg-theme-success hover:bg-theme-success/80"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <MLKPICards metrics={dashboardMetrics} />

        {/* ML Insights Cards */}
        {mlInsights && mlInsights.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">AI-Powered Business Insights</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mlInsights.map((insight, index) => (
                <div 
                  key={index}
                  className={`p-4 rounded-r-lg border-l-4 ${
                    insight.type === 'revenue' ? 'border-theme-primary bg-theme-primary/10' :
                    insight.type === 'churn' ? 'border-theme-danger bg-theme-danger/10' :
                    insight.type === 'cross_sell' ? 'border-theme-success bg-theme-success/10' :
                    'border-theme-secondary bg-theme-secondary/10'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className={`font-medium ${
                      insight.type === 'revenue' ? 'text-theme-primary' :
                      insight.type === 'churn' ? 'text-theme-danger' :
                      insight.type === 'cross_sell' ? 'text-theme-success' :
                      'text-theme-secondary'
                    }`}>
                      {insight.title}
                    </h4>
                  </div>
                  <p className={`text-sm mb-3 ${
                    insight.type === 'revenue' ? 'text-theme-primary/80' :
                    insight.type === 'churn' ? 'text-theme-danger/80' :
                    insight.type === 'cross_sell' ? 'text-theme-success/80' :
                    'text-theme-secondary/80'
                  }`}>
                    {insight.description}
                  </p>
                  {insight.actionable && (
                    <Button 
                      size="sm" 
                      className={`text-xs ${
                        insight.type === 'revenue' ? 'bg-blue-600 hover:bg-blue-700' :
                        insight.type === 'churn' ? 'bg-red-600 hover:bg-red-700' :
                        insight.type === 'cross_sell' ? 'bg-green-600 hover:bg-green-700' :
                        'bg-purple-600 hover:bg-purple-700'
                      }`}
                    >
                      Implement Strategy
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full lg:w-auto lg:grid-cols-5 bg-white">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="clv">Customer CLV</TabsTrigger>
            <TabsTrigger value="churn">Churn Analysis</TabsTrigger>
            <TabsTrigger value="forecast">Sales Forecast</TabsTrigger>
            <TabsTrigger value="recommendations">Product Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Resizable Overview Layout */}
            <div className="flex flex-col gap-4 h-[800px]">
              <div className="flex gap-4 flex-1">
                <div className="resize-both overflow-auto min-w-[300px] min-h-[200px] w-1/2 h-full border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
                  <div className="h-full p-2">
                    <ChurnAnalysis period={selectedPeriod} />
                  </div>
                </div>
                <div className="resize-both overflow-auto min-w-[300px] min-h-[200px] w-1/2 h-full border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
                  <div className="h-full p-2">
                    <SalesForecasting period={selectedPeriod} />
                  </div>
                </div>
              </div>
              <div className="flex gap-4 flex-1">
                <div className="resize-both overflow-auto min-w-[300px] min-h-[200px] w-1/2 h-full border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
                  <div className="h-full p-2">
                    <ProductRecommendations category={selectedCategory} />
                  </div>
                </div>
                <div className="resize-both overflow-auto min-w-[300px] min-h-[200px] w-1/2 h-full border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
                  <div className="h-full p-2">
                    <CLVPrediction period={selectedPeriod} />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="clv">
            <CLVPrediction period={selectedPeriod} detailed />
          </TabsContent>

          <TabsContent value="churn">
            <ChurnAnalysis period={selectedPeriod} detailed />
          </TabsContent>

          <TabsContent value="forecast">
            <SalesForecasting period={selectedPeriod} detailed />
          </TabsContent>

          <TabsContent value="recommendations">
            <ProductRecommendations category={selectedCategory} detailed />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
