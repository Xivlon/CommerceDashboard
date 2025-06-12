import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { TrendingUp, Users, Eye, Mail, RefreshCw, Download, Zap, AlertTriangle, Target } from "lucide-react";
import { getCustomersWithPredictions, getCLVPredictions, generateAllPredictions, refreshAllData } from "@/lib/ml-api";
import { useToast } from "@/hooks/use-toast";
import { useColorPalette } from "@/hooks/use-color-palette";

interface CLVPredictionProps {
  period: string;
  detailed?: boolean;
}

export function CLVPrediction({ period, detailed = false }: CLVPredictionProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { getChartColors } = useColorPalette();

  const { data: customers, isLoading: customersLoading } = useQuery({
    queryKey: ["/api/customers", { predictions: true, period }],
    queryFn: () => getCustomersWithPredictions(50, 0),
  });

  const { data: clvPredictions, isLoading: predictionsLoading } = useQuery({
    queryKey: ["/api/predictions/clv", period],
    queryFn: () => getCLVPredictions(),
  });

  const refreshMutation = useMutation({
    mutationFn: refreshAllData,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/predictions/clv"] });
      toast({
        title: "Data Refreshed",
        description: "CLV predictions have been updated with latest data.",
      });
    },
    onError: () => {
      toast({
        title: "Refresh Failed",
        description: "Unable to refresh data. Please try again.",
        variant: "destructive",
      });
    },
  });

  const generateMutation = useMutation({
    mutationFn: generateAllPredictions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/predictions/clv"] });
      toast({
        title: "Predictions Generated",
        description: "New CLV predictions have been generated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Generation Failed",
        description: "Unable to generate predictions. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleExport = () => {
    if (!customers) return;
    
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Customer,Email,Current CLV,Predicted CLV,Confidence\n" +
      customers.map(c => 
        `${c.name},${c.email},${c.totalSpent},${c.predictedCLV || 'N/A'},${c.clvPrediction?.confidence || 'N/A'}`
      ).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "clv_predictions.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Complete",
      description: "CLV predictions exported successfully.",
    });
  };

  if (customersLoading || predictionsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Customer Lifetime Value Prediction</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
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
          <CardTitle>Customer Lifetime Value Prediction</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <Users className="h-16 w-16 mb-4" />
            <p className="text-lg font-medium">No customer data available</p>
            <p className="text-sm">Customer predictions will appear here once data is available.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const clvSegments = customers.reduce((acc, customer) => {
    const clv = customer.predictedCLV || parseFloat(customer.totalSpent);
    if (clv >= 2000) acc.high++;
    else if (clv >= 500) acc.medium++;
    else acc.low++;
    return acc;
  }, { high: 0, medium: 0, low: 0 });

  const chartColors = getChartColors();
  const pieData = [
    { name: 'High Value (>$2K)', value: clvSegments.high, color: chartColors[1] },
    { name: 'Medium Value ($500-$2K)', value: clvSegments.medium, color: chartColors[0] },
    { name: 'Low Value (<$500)', value: clvSegments.low, color: chartColors[2] },
  ];

  const barData = [
    { segment: 'High Value', count: clvSegments.high, avgCLV: 3500 },
    { segment: 'Medium Value', count: clvSegments.medium, avgCLV: 1200 },
    { segment: 'Low Value', count: clvSegments.low, avgCLV: 300 },
  ];

  const topCLVCustomers = customers
    .filter(customer => customer.predictedCLV || customer.churnPrediction)
    .sort((a, b) => (b.predictedCLV || 0) - (a.predictedCLV || 0))
    .slice(0, detailed ? 10 : 5);

  const modelAccuracy = clvPredictions && clvPredictions.length > 0 
    ? clvPredictions.reduce((sum, p) => sum + parseFloat(p.confidence || '0'), 0) / clvPredictions.length
    : 0.87;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Customer Lifetime Value Distribution</CardTitle>
            <div className="flex flex-col items-end gap-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800 px-6 py-2 whitespace-nowrap">
                ML Confidence: {(modelAccuracy * 100).toFixed(1)}%
              </Badge>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refreshMutation.mutate()}
                  disabled={refreshMutation.isPending}
                >
                  {refreshMutation.isPending ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  Refresh
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => generateMutation.mutate()}
                  disabled={generateMutation.isPending}
                >
                  {generateMutation.isPending ? (
                    <Zap className="h-4 w-4 animate-pulse" />
                  ) : (
                    <Zap className="h-4 w-4" />
                  )}
                  Generate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                >
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <ResponsiveContainer width="100%" height={320}>
                <PieChart margin={{ top: 10, right: 20, bottom: 30, left: 20 }}>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={0}
                    dataKey="value"
                    label={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name) => [value, name]}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      color: 'hsl(var(--card-foreground))',
                      borderRadius: '8px'
                    }}
                    labelStyle={{ color: 'hsl(var(--card-foreground))' }}
                  />
                  <Legend 
                    verticalAlign="bottom"
                    height={36}
                    wrapperStyle={{ 
                      fontSize: '12px',
                      fontWeight: '500',
                      paddingTop: '15px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 text-center">
                <div className="p-3 bg-theme-success/10 rounded-lg border border-theme-success/20">
                  <p className="text-sm text-gray-600">High Value</p>
                  <p className="text-lg font-bold text-theme-success">{clvSegments.high}</p>
                  <p className="text-xs text-gray-500">CLV {'>'} $2K</p>
                </div>
                <div className="p-3 bg-theme-primary/10 rounded-lg border border-theme-primary/20">
                  <p className="text-sm text-gray-600">Medium Value</p>
                  <p className="text-lg font-bold text-theme-primary">{clvSegments.medium}</p>
                  <p className="text-xs text-gray-500">CLV $500-$2K</p>
                </div>
                <div className="p-3 bg-theme-accent/10 rounded-lg border border-theme-accent/20">
                  <p className="text-sm text-gray-600">Low Value</p>
                  <p className="text-lg font-bold text-theme-accent">{clvSegments.low}</p>
                  <p className="text-xs text-gray-500">CLV under $500</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h4 className="font-medium text-gray-900 dark:text-white mb-4">CLV Insights & Trends</h4>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <h5 className="font-semibold text-blue-900">Growth Opportunities</h5>
                </div>
                <div className="space-y-2 text-sm text-blue-800">
                  <div className="flex justify-between items-center">
                    <span>High-value customer growth</span>
                    <span className="font-medium">+23%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Cross-sell revenue potential</span>
                    <span className="font-medium">$127K</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Premium upgrade candidates</span>
                    <span className="font-medium">45 customers</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Loyalty program CLV impact</span>
                    <span className="font-medium">+32%</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <h5 className="font-semibold text-orange-900">Value at Risk</h5>
                </div>
                <div className="space-y-2 text-sm text-orange-800">
                  <div className="flex justify-between items-center">
                    <span>High-value customers at risk</span>
                    <span className="font-medium">12 customers</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Potential revenue loss</span>
                    <span className="font-medium">$89K</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Seasonal CLV impact</span>
                    <span className="font-medium">-15%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Price sensitive segment</span>
                    <span className="font-medium">Medium tier</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="h-4 w-4 text-green-600" />
                  <h5 className="font-semibold text-green-900">Recommended Actions</h5>
                </div>
                <div className="space-y-2 text-sm text-green-800">
                  <div className="flex justify-between items-center">
                    <span>VIP Program Launch</span>
                    <span className="font-medium text-xs">Top 10%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Retention Campaigns</span>
                    <span className="font-medium text-xs">Personalized</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Product Bundling</span>
                    <span className="font-medium text-xs">Medium tier</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Onboarding Optimization</span>
                    <span className="font-medium text-xs">New growth</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {detailed && (
            <div className="mt-6">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">CLV by Segment</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="segment" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      color: 'hsl(var(--card-foreground))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="avgCLV" fill={getChartColors()[1]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Top CLV Predictions</CardTitle>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm text-gray-500">Sorted by predicted value</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {topCLVCustomers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-500">
              <p>No CLV predictions available</p>
              <p className="text-sm">Predictions will be generated automatically</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-right">Current CLV</TableHead>
                    <TableHead className="text-right">Predicted CLV</TableHead>
                    <TableHead className="text-center">Confidence</TableHead>
                    <TableHead className="text-center">Segment</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topCLVCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {customer.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{customer.name}</p>
                            <p className="text-sm text-gray-500">{customer.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ${parseFloat(customer.totalSpent).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div>
                          <span className="font-medium text-green-600">
                            ${customer.predictedCLV ? customer.predictedCLV.toLocaleString() : 'N/A'}
                          </span>
                          {customer.predictedCLV && (
                            <p className="text-xs text-gray-500">
                              {customer.predictedCLV > parseFloat(customer.totalSpent) ? '+' : ''}
                              {(((customer.predictedCLV - parseFloat(customer.totalSpent)) / parseFloat(customer.totalSpent)) * 100).toFixed(1)}%
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="text-xs">
                          {customer.clvPrediction?.confidence ? 
                            `${(parseFloat(customer.clvPrediction.confidence) * 100).toFixed(0)}%` : 
                            'N/A'
                          }
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge 
                          variant="outline" 
                          className={
                            (customer.predictedCLV || parseFloat(customer.totalSpent)) >= 2000 
                              ? "bg-green-100 text-green-800" 
                              : (customer.predictedCLV || parseFloat(customer.totalSpent)) >= 500 
                              ? "bg-blue-100 text-blue-800" 
                              : "bg-gray-100 text-gray-800"
                          }
                        >
                          {(customer.predictedCLV || parseFloat(customer.totalSpent)) >= 2000 
                            ? "High" 
                            : (customer.predictedCLV || parseFloat(customer.totalSpent)) >= 500 
                            ? "Medium" 
                            : "Low"
                          }
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Mail className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}