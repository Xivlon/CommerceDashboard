import { CLVPrediction } from "@/components/ml/CLVPrediction";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Users, Target, BarChart3, Calendar, Filter } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getDashboardMetrics, getCustomersWithPredictions } from "@/lib/ml-api";

export default function CLVPage() {
  const { data: metrics } = useQuery({
    queryKey: ["/api/dashboard/metrics"],
    queryFn: getDashboardMetrics,
  });

  const { data: customers } = useQuery({
    queryKey: ["/api/customers", { predictions: true }],
    queryFn: () => getCustomersWithPredictions(100, 0),
  });

  const avgCLV = metrics?.avgCLV || 0;
  const totalCustomers = customers?.length || 0;
  const highValueCustomers = customers?.filter(c => (c.predictedCLV || parseFloat(c.totalSpent)) >= 2000).length || 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Customer Lifetime Value Analytics</h1>
            <p className="text-gray-600 mt-2">Comprehensive analysis and predictions for customer value optimization</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Date Range
            </Button>
            <Button className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Average CLV</p>
                  <p className="text-2xl font-bold text-gray-900">${avgCLV.toLocaleString()}</p>
                  <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3" />
                    +12% vs last quarter
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Customers</p>
                  <p className="text-2xl font-bold text-gray-900">{totalCustomers.toLocaleString()}</p>
                  <p className="text-sm text-blue-600 flex items-center gap-1 mt-1">
                    <Users className="h-3 w-3" />
                    {highValueCustomers} high-value
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Predicted Growth</p>
                  <p className="text-2xl font-bold text-gray-900">+24.5%</p>
                  <p className="text-sm text-orange-600 flex items-center gap-1 mt-1">
                    <Target className="h-3 w-3" />
                    Next 12 months
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Target className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Revenue Potential</p>
                  <p className="text-2xl font-bold text-gray-900">$2.1M</p>
                  <p className="text-sm text-purple-600 flex items-center gap-1 mt-1">
                    <BarChart3 className="h-3 w-3" />
                    Untapped value
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabbed Analysis */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="segments">Customer Segments</TabsTrigger>
            <TabsTrigger value="trends">Trends & Forecasts</TabsTrigger>
            <TabsTrigger value="strategies">Growth Strategies</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <CLVPrediction period="all" detailed={true} />
          </TabsContent>

          <TabsContent value="segments" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Segment Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                      <div>
                        <p className="font-medium text-green-900">VIP Customers</p>
                        <p className="text-sm text-green-700">CLV over $5,000</p>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {Math.floor((highValueCustomers / totalCustomers) * 100)}% of base
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                      <div>
                        <p className="font-medium text-blue-900">Premium Customers</p>
                        <p className="text-sm text-blue-700">CLV $2,000 - $5,000</p>
                      </div>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        32% of base
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                      <div>
                        <p className="font-medium text-orange-900">Standard Customers</p>
                        <p className="text-sm text-orange-700">CLV $500 - $2,000</p>
                      </div>
                      <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                        45% of base
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">New Customers</p>
                        <p className="text-sm text-gray-700">CLV under $500</p>
                      </div>
                      <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                        18% of base
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Segment Opportunities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border border-purple-200 rounded-lg">
                      <h4 className="font-medium text-purple-900 mb-2">Cross-Sell Potential</h4>
                      <p className="text-sm text-purple-700">Premium customers show 67% receptivity to complementary products</p>
                      <p className="text-xs text-purple-600 mt-1">Estimated revenue: +$340K</p>
                    </div>
                    <div className="p-4 border border-indigo-200 rounded-lg">
                      <h4 className="font-medium text-indigo-900 mb-2">Upsell Opportunities</h4>
                      <p className="text-sm text-indigo-700">Standard customers ready for premium tier migration</p>
                      <p className="text-xs text-indigo-600 mt-1">Conversion potential: 23%</p>
                    </div>
                    <div className="p-4 border border-green-200 rounded-lg">
                      <h4 className="font-medium text-green-900 mb-2">Retention Focus</h4>
                      <p className="text-sm text-green-700">VIP customers require personalized engagement</p>
                      <p className="text-xs text-green-600 mt-1">Risk mitigation: $890K revenue</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>CLV Trend Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-3">Quarterly Growth</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-blue-700">Q1 2024</span>
                        <span className="font-medium text-blue-900">+8.3%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-blue-700">Q2 2024</span>
                        <span className="font-medium text-blue-900">+12.1%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-blue-700">Q3 2024</span>
                        <span className="font-medium text-blue-900">+15.7%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-blue-700">Q4 2024</span>
                        <span className="font-medium text-blue-900">+18.2%</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-3">Seasonal Patterns</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-green-700">Holiday Season</span>
                        <span className="font-medium text-green-900">+35%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-green-700">Back to School</span>
                        <span className="font-medium text-green-900">+22%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-green-700">Summer</span>
                        <span className="font-medium text-green-900">+8%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-green-700">Spring</span>
                        <span className="font-medium text-green-900">+12%</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-medium text-purple-900 mb-3">Predictive Insights</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-purple-700">6-Month Forecast</span>
                        <span className="font-medium text-purple-900">+24%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-purple-700">1-Year Projection</span>
                        <span className="font-medium text-purple-900">+42%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-purple-700">Confidence Level</span>
                        <span className="font-medium text-purple-900">87.3%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-purple-700">Model Accuracy</span>
                        <span className="font-medium text-purple-900">91.2%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="strategies" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Immediate Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border-l-4 border-red-500 bg-red-50">
                      <h4 className="font-medium text-red-900">High Priority</h4>
                      <p className="text-sm text-red-700 mt-1">Launch retention campaign for at-risk VIP customers</p>
                      <p className="text-xs text-red-600 mt-1">Impact: Protect $890K revenue</p>
                    </div>
                    <div className="p-4 border-l-4 border-orange-500 bg-orange-50">
                      <h4 className="font-medium text-orange-900">Medium Priority</h4>
                      <p className="text-sm text-orange-700 mt-1">Implement cross-sell campaigns for premium segment</p>
                      <p className="text-xs text-orange-600 mt-1">Impact: +$340K potential revenue</p>
                    </div>
                    <div className="p-4 border-l-4 border-green-500 bg-green-50">
                      <h4 className="font-medium text-green-900">Long-term</h4>
                      <p className="text-sm text-green-700 mt-1">Develop loyalty program for customer lifecycle extension</p>
                      <p className="text-xs text-green-600 mt-1">Impact: +32% average CLV increase</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Strategic Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Personalization Engine</h4>
                      <p className="text-sm text-blue-700">Deploy AI-driven product recommendations</p>
                      <ul className="text-xs text-blue-600 mt-2 space-y-1">
                        <li>• Increase purchase frequency by 28%</li>
                        <li>• Boost average order value by 19%</li>
                        <li>• Improve customer satisfaction scores</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-indigo-50 rounded-lg">
                      <h4 className="font-medium text-indigo-900 mb-2">Tier-Based Programs</h4>
                      <p className="text-sm text-indigo-700">Implement value-based customer tiers</p>
                      <ul className="text-xs text-indigo-600 mt-2 space-y-1">
                        <li>• VIP exclusive access and benefits</li>
                        <li>• Premium early product releases</li>
                        <li>• Standard loyalty point acceleration</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <h4 className="font-medium text-purple-900 mb-2">Predictive Interventions</h4>
                      <p className="text-sm text-purple-700">Proactive engagement based on CLV trends</p>
                      <ul className="text-xs text-purple-600 mt-2 space-y-1">
                        <li>• Early churn risk detection</li>
                        <li>• Automated retention workflows</li>
                        <li>• Value optimization triggers</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}