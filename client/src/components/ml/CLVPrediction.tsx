import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { TrendingUp, Users, Eye, Mail, RefreshCw, Download, Zap } from "lucide-react";
import { getCustomersWithPredictions, getCLVPredictions, generateAllPredictions, refreshAllData } from "@/lib/ml-api";
import { useToast } from "@/hooks/use-toast";

interface CLVPredictionProps {
  period: string;
  detailed?: boolean;
}

export function CLVPrediction({ period, detailed = false }: CLVPredictionProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: customers, isLoading: customersLoading } = useQuery({
    queryKey: ["/api/customers", { predictions: true, period }],
    queryFn: () => getCustomersWithPredictions(50, 0),
  });

  const { data: clvPredictions, isLoading: predictionsLoading } = useQuery({
    queryKey: ["/api/predictions/clv", period],
    queryFn: () => getCLVPredictions(),
  });

  // Mutation for refreshing data
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

  // Mutation for generating new predictions
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

  // Export functionality
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
      totalSpent: customer.totalSpent,
      predictedCLV: customer.predictedCLV || 'N/A',
      segment: customer.segment,
      churnRisk: customer.churnRisk,
      confidence: customer.clvPrediction?.confidence || 'N/A'
    }));

    const csvContent = "data:text/csv;charset=utf-8," + 
      "Name,Email,Total Spent,Predicted CLV,Segment,Churn Risk,Confidence\n" +
      csvData.map(row => Object.values(row).join(",")).join("\n");

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

  // Process CLV data for visualization
  const clvSegments = customers.reduce((acc, customer) => {
    const clv = customer.predictedCLV || parseFloat(customer.totalSpent);
    if (clv >= 2000) acc.high++;
    else if (clv >= 500) acc.medium++;
    else acc.low++;
    return acc;
  }, { high: 0, medium: 0, low: 0 });

  const pieData = [
    { name: 'High Value (>$2K)', value: clvSegments.high, color: '#10b981' },
    { name: 'Medium Value ($500-$2K)', value: clvSegments.medium, color: '#3b82f6' },
    { name: 'Low Value (<$500)', value: clvSegments.low, color: '#f59e0b' },
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
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                ML Confidence: {(modelAccuracy * 100).toFixed(1)}%
              </Badge>
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
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
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
                    labelStyle={{ color: '#374151' }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    wrapperStyle={{ 
                      paddingTop: '20px',
                      fontSize: '12px',
                      lineHeight: '16px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">High Value</p>
                  <p className="text-lg font-bold text-green-600">{clvSegments.high}</p>
                  <p className="text-xs text-gray-500">CLV &gt; $2K</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Medium Value</p>
                  <p className="text-lg font-bold text-blue-600">{clvSegments.medium}</p>
                  <p className="text-xs text-gray-500">CLV $500-$2K</p>
                </div>
                <div className="p-3 bg-amber-50 rounded-lg">
                  <p className="text-sm text-gray-600">Low Value</p>
                  <p className="text-lg font-bold text-amber-600">{clvSegments.low}</p>
                  <p className="text-xs text-gray-500">CLV &lt; $500</p>
                </div>
              </div>

              {detailed && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">CLV by Segment</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={barData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="segment" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="avgCLV" fill="#8b5cf6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
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
                            ${(customer.predictedCLV || parseFloat(customer.totalSpent)).toLocaleString()}
                          </span>
                          {customer.predictedCLV && (
                            <div className="text-xs text-gray-500">
                              {customer.predictedCLV > parseFloat(customer.totalSpent) ? '+' : ''}
                              {(((customer.predictedCLV - parseFloat(customer.totalSpent)) / parseFloat(customer.totalSpent)) * 100).toFixed(1)}%
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge 
                          variant="secondary" 
                          className={`${
                            parseFloat(customer.clvPrediction?.confidence || "0.8") > 0.9 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {(parseFloat(customer.clvPrediction?.confidence || "0.8") * 100).toFixed(0)}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge 
                          variant="outline"
                          className={`${
                            customer.segment === 'vip' ? 'border-purple-500 text-purple-700' :
                            customer.segment === 'high' ? 'border-green-500 text-green-700' :
                            customer.segment === 'medium' ? 'border-blue-500 text-blue-700' :
                            'border-gray-500 text-gray-700'
                          }`}
                        >
                          {customer.segment.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                            <Eye className="h-4 w-4" />
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
