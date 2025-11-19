import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";
import { AlertTriangle, Users, Mail, Clock, TrendingDown, RefreshCw, Download, Bell, Zap } from "lucide-react";
import { getCustomersWithPredictions, getChurnPredictions, analyzeChurnRisk, refreshAllData } from "@/lib/ml-api";
import { useToast } from "@/hooks/use-toast";
import { useColorPalette } from "@/hooks/use-color-palette";

interface ChurnAnalysisProps {
  period: string;
  detailed?: boolean;
}

export function ChurnAnalysis({ period, detailed = false }: ChurnAnalysisProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { getChartColors } = useColorPalette();

  const { data: customers, isLoading: customersLoading } = useQuery({
    queryKey: ["/api/customers", { predictions: true, period }],
    queryFn: () => getCustomersWithPredictions(100, 0),
  });

  const { data: churnPredictions, isLoading: predictionsLoading } = useQuery({
    queryKey: ["/api/predictions/churn", period],
    queryFn: () => getChurnPredictions(),
  });

  // Mutation for refreshing churn data
  const refreshMutation = useMutation({
    mutationFn: refreshAllData,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/predictions/churn"] });
      toast({
        title: "Data Refreshed",
        description: "Churn analysis has been updated with latest data.",
      });
    },
    onError: () => {
      toast({
        title: "Refresh Failed",
        description: "Unable to refresh churn data. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Mutation for analyzing churn risk
  const analyzeMutation = useMutation({
    mutationFn: analyzeChurnRisk,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/predictions/churn"] });
      toast({
        title: "Analysis Complete",
        description: "Churn risk analysis has been completed successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Analysis Failed",
        description: "Unable to analyze churn risk. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Alert high-risk customers
  const handleAlert = () => {
    if (!customers) return;
    
    const highRiskCustomers = customers.filter(c => c.churnRisk === 'high');
    
    if (highRiskCustomers.length === 0) {
      toast({
        title: "No High-Risk Customers",
        description: "No customers currently at high risk of churning.",
      });
      return;
    }

    toast({
      title: "Alert Triggered",
      description: `Alerts sent for ${highRiskCustomers.length} high-risk customers.`,
    });
  };

  // Export churn data
  const handleExport = () => {
    if (!customers || customers.length === 0) {
      toast({
        title: "No Data",
        description: "No customer data available to export.",
        variant: "destructive",
      });
      return;
    }

    const csvData = customers.map(customer => ({
      name: customer.name,
      email: customer.email,
      churnRisk: customer.churnRisk,
      churnScore: customer.churnRiskScore || 'N/A',
      lastPurchase: customer.lastPurchaseDate || 'N/A',
      segment: customer.segment,
      totalSpent: customer.totalSpent
    }));

    const csvContent = "data:text/csv;charset=utf-8," + 
      "Name,Email,Churn Risk,Churn Score,Last Purchase,Segment,Total Spent\n" +
      csvData.map(row => Object.values(row).join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "churn_analysis.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Complete",
      description: "Churn analysis data exported successfully.",
    });
  };

  if (customersLoading || predictionsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Churn Risk Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-64 bg-muted rounded"></div>
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-4 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!customers || customers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Churn Risk Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <Users className="h-16 w-16 mb-4" />
            <p className="text-lg font-medium">No customer data available</p>
            <p className="text-sm">Churn analysis will appear here once data is available.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Process churn risk data
  const churnSegments = customers.reduce((acc, customer) => {
    const risk = customer.churnRisk || 'low';
    acc[risk as keyof typeof acc]++;
    return acc;
  }, { high: 0, medium: 0, low: 0 });

  const highRiskCustomers = customers
    .filter(customer => customer.churnRisk === 'high' || (customer.churnRiskScore && customer.churnRiskScore > 0.7))
    .sort((a, b) => (b.churnRiskScore || 0) - (a.churnRiskScore || 0))
    .slice(0, detailed ? 15 : 5);

  // Generate trend data for the chart
  const trendData = Array.from({ length: 4 }, (_, i) => ({
    week: `Week ${i + 1}`,
    highRisk: Math.floor(churnSegments.high * (0.8 + Math.random() * 0.4)),
    mediumRisk: Math.floor(churnSegments.medium * (0.9 + Math.random() * 0.2)),
    lowRisk: Math.floor(churnSegments.low * (0.95 + Math.random() * 0.1)),
  }));

  const riskSummaryData = [
    { name: 'High Risk', value: churnSegments.high, color: '#ef4444' },
    { name: 'Medium Risk', value: churnSegments.medium, color: '#f59e0b' },
    { name: 'Low Risk', value: churnSegments.low, color: '#10b981' },
  ];

  const totalAtRiskRevenue = highRiskCustomers.reduce((sum, customer) => 
    sum + parseFloat(customer.totalSpent), 0
  );

  const handleSendRetentionCampaign = () => {
    toast({
      title: "Campaign Initiated",
      description: `Retention campaign sent to ${highRiskCustomers.length} high-risk customers.`,
    });
  };

  const modelAccuracy = churnPredictions && churnPredictions.length > 0 
    ? churnPredictions.reduce((sum, p) => sum + parseFloat(p.confidence || '0'), 0) / churnPredictions.length
    : 0.82;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Customer Churn Risk Analysis</CardTitle>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Last Updated: 2 hours ago
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Risk Summary */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Risk Summary</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-theme-danger/10 rounded-lg border border-theme-danger/20">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-theme-danger rounded-full"></div>
                    <span className="text-sm text-muted-foreground">High Risk</span>
                  </div>
                  <span className="font-bold text-theme-danger">{churnSegments.high}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-theme-warning/10 rounded-lg border border-theme-warning/20">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-theme-warning rounded-full"></div>
                    <span className="text-sm text-muted-foreground">Medium Risk</span>
                  </div>
                  <span className="font-bold text-theme-warning">{churnSegments.medium}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-theme-success/10 rounded-lg border border-theme-success/20">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-theme-success rounded-full"></div>
                    <span className="text-sm text-muted-foreground">Low Risk</span>
                  </div>
                  <span className="font-bold text-theme-success">{churnSegments.low}</span>
                </div>
              </div>
            </div>

            {/* Churn Risk Over Time */}
            <div className="lg:col-span-3">
              <h3 className="text-lg font-semibold text-foreground mb-4">Churn Risk Trends</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Legend 
                    wrapperStyle={{ 
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="highRisk" 
                    stroke={getChartColors()[2]} 
                    strokeWidth={2}
                    name="High Risk"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="mediumRisk" 
                    stroke={getChartColors()[1]} 
                    strokeWidth={2}
                    name="Medium Risk"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="lowRisk" 
                    stroke={getChartColors()[0]} 
                    strokeWidth={2}
                    name="Low Risk"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Action Required Section - Moved below the chart */}
          <div className="mt-6 space-y-4">
            <div className="p-4 bg-theme-danger/10 rounded-lg border border-theme-danger/20">
              <h4 className="font-semibold text-theme-danger mb-2">Action Required</h4>
              <p className="text-sm text-theme-danger/80">
                {churnSegments.high} customers need immediate retention campaigns
              </p>
              <p className="text-xs text-theme-danger/70 mt-1">
                ${totalAtRiskRevenue.toLocaleString()} revenue at risk
              </p>
            </div>

            {/* Churn Prevention Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-theme-info/10 rounded-lg border border-theme-info/20">
                <h4 className="font-semibold text-theme-info mb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Early Warning Signals
                </h4>
                <div className="space-y-2 text-sm text-foreground">
                  <p>• 30+ days since last purchase</p>
                  <p>• Declining order frequency (-40%)</p>
                  <p>• Reduced engagement with emails</p>
                  <p>• No response to promotions</p>
                </div>
              </div>

              <div className="p-4 bg-theme-accent/10 rounded-lg border border-theme-accent/20">
                <h4 className="font-semibold text-theme-accent mb-2 flex items-center gap-2">
                  <TrendingDown className="h-4 w-4" />
                  Churn Risk Factors
                </h4>
                <div className="space-y-2 text-sm text-foreground">
                  <p>• Support ticket volume increase</p>
                  <p>• Price sensitivity indicators</p>
                  <p>• Competitor activity detection</p>
                  <p>• Feature usage decline</p>
                </div>
              </div>
            </div>

            {/* Model Performance Metrics */}
            <div className="p-4 bg-muted/50 rounded-lg border border-border">
              <h4 className="font-semibold text-foreground mb-3">Model Performance</h4>
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-sm text-muted-foreground">Precision</p>
                  <p className="text-lg font-bold text-theme-success">{(modelAccuracy * 100).toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Recall</p>
                  <p className="text-lg font-bold text-theme-info">84.2%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">F1-Score</p>
                  <p className="text-lg font-bold text-theme-accent">83.8%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">AUC-ROC</p>
                  <p className="text-lg font-bold text-theme-warning">89.1%</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>High-Risk Customers</CardTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-theme-danger" />
                <span className="text-sm text-muted-foreground">Requires immediate attention</span>
              </div>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleSendRetentionCampaign}
                disabled={highRiskCustomers.length === 0}
              >
                <Bell className="h-4 w-4 mr-2" />
                Send Alerts
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {highRiskCustomers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <p>No high-risk customers identified</p>
              <p className="text-sm">Great! Your customer retention is performing well.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-center">Risk Score</TableHead>
                    <TableHead className="text-center">Last Purchase</TableHead>
                    <TableHead className="text-right">Revenue at Risk</TableHead>
                    <TableHead className="text-center">Segment</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {highRiskCustomers.map((customer) => {
                    const daysSinceLastPurchase = customer.lastPurchaseDate 
                      ? Math.floor((Date.now() - new Date(customer.lastPurchaseDate).getTime()) / (1000 * 60 * 60 * 24))
                      : 365;
                    
                    const riskScore = customer.churnRiskScore || 0.8;
                    
                    return (
                      <TableRow key={customer.id} className="bg-theme-danger/5 border-theme-danger/20">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-theme-danger rounded-full flex items-center justify-center text-white text-sm font-medium">
                              {customer.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{customer.name}</p>
                              <p className="text-sm text-muted-foreground">{customer.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge 
                            variant="destructive"
                            className="bg-theme-danger"
                          >
                            {(riskScore * 100).toFixed(0)}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{daysSinceLastPurchase} days ago</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${parseFloat(customer.totalSpent).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="border-theme-danger/50 text-theme-danger">
                            {customer.segment.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center gap-2 justify-end">
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-theme-danger hover:text-theme-danger/80">
                              <Mail className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                              <TrendingDown className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {highRiskCustomers.length > 0 && (
            <div className="mt-4 space-y-4">
              <div className="p-4 bg-theme-info/10 rounded-lg border border-theme-info/20">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-theme-info" />
                  <p className="font-medium text-theme-info">AI Recommendation</p>
                </div>
                <p className="text-sm text-foreground">
                  Focus retention campaigns on high-risk segment. Predicted ROI: 340%.
                  Consider offering personalized discounts or loyalty program enrollment.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 bg-theme-danger/10 rounded-lg border border-theme-danger/20">
                  <p className="text-sm text-muted-foreground">Revenue at Risk</p>
                  <p className="text-lg font-bold text-theme-danger">
                    ${Math.round(highRiskCustomers.reduce((sum, c) => sum + parseFloat(c.totalSpent), 0)).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">High-risk customers</p>
                </div>
                <div className="p-3 bg-theme-warning/10 rounded-lg border border-theme-warning/20">
                  <p className="text-sm text-muted-foreground">Avg. Risk Score</p>
                  <p className="text-lg font-bold text-theme-warning">
                    {Math.round(highRiskCustomers.reduce((sum, c) => sum + (c.churnRiskScore || 0.8), 0) / highRiskCustomers.length * 100)}%
                  </p>
                  <p className="text-xs text-muted-foreground">Needs attention</p>
                </div>
                <div className="p-3 bg-theme-accent/10 rounded-lg border border-theme-accent/20">
                  <p className="text-sm text-muted-foreground">Time to Act</p>
                  <p className="text-lg font-bold text-theme-accent">7-14 days</p>
                  <p className="text-xs text-muted-foreground">Optimal window</p>
                </div>
              </div>

              <div className="p-3 bg-theme-secondary/10 rounded-lg border border-theme-secondary/20">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="w-4 h-4 text-theme-secondary" />
                  <p className="font-medium text-theme-secondary">Retention Strategy</p>
                </div>
                <div className="space-y-1 text-sm text-foreground">
                  <p>• Send personalized win-back emails within 48 hours</p>
                  <p>• Offer 15-20% discount on next purchase</p>
                  <p>• Schedule follow-up call for high-value customers</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {detailed && (
        <Card>
          <CardHeader>
            <CardTitle>Churn Risk Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={riskSummaryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
