import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Package, ArrowUpRight, Target, ShoppingCart, DollarSign } from "lucide-react";
import { getProductRecommendations, generateProductRecommendations, formatCurrency, formatPercentage } from "@/lib/ml-api";
import type { ProductRecommendation } from "@shared/schema";

interface ProductRecommendationsProps {
  category: string;
  detailed?: boolean;
}

export function ProductRecommendations({ category, detailed = false }: ProductRecommendationsProps) {
  const { data: recommendations = [], isLoading, error } = useQuery({
    queryKey: ['/api/recommendations/products', category],
    queryFn: () => getProductRecommendations(),
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Product Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Product Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Failed to load recommendations</p>
        </CardContent>
      </Card>
    );
  }

  const crossSellRecommendations = recommendations.filter(r => r.recommendationType === 'cross_sell');
  const upSellRecommendations = recommendations.filter(r => r.recommendationType === 'up_sell');

  if (!detailed) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Product Recommendations
          </CardTitle>
          <CardDescription>AI-powered cross-sell and up-sell opportunities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{crossSellRecommendations.length}</div>
                <div className="text-sm text-gray-600">Cross-sell Opportunities</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{upSellRecommendations.length}</div>
                <div className="text-sm text-gray-600">Up-sell Opportunities</div>
              </div>
            </div>

            <div className="space-y-2">
              {recommendations.slice(0, 3).map((rec, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Product {rec.productId} → Product {rec.recommendedProductId}</p>
                    <p className="text-sm text-gray-600">{rec.recommendationType.replace('_', '-')} opportunity</p>
                  </div>
                  <Badge variant={rec.recommendationType === 'cross_sell' ? 'default' : 'secondary'}>
                    {formatPercentage(parseFloat(rec.confidence) * 100)}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = recommendations.slice(0, 10).map(rec => ({
    name: `P${rec.productId} → P${rec.recommendedProductId}`,
    confidence: parseFloat(rec.confidence) * 100,
    type: rec.recommendationType,
  }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Product Recommendation Analytics
          </CardTitle>
          <CardDescription>
            Detailed analysis of cross-sell and up-sell opportunities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="cross-sell">Cross-sell</TabsTrigger>
              <TabsTrigger value="up-sell">Up-sell</TabsTrigger>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">Total Recommendations</span>
                    </div>
                    <div className="text-2xl font-bold">{recommendations.length}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">Avg Confidence</span>
                    </div>
                    <div className="text-2xl font-bold">
                      {formatPercentage(
                        recommendations.reduce((sum, r) => sum + parseFloat(r.confidence), 0) / recommendations.length * 100
                      )}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-purple-500" />
                      <span className="text-sm font-medium">High Confidence</span>
                    </div>
                    <div className="text-2xl font-bold">
                      {recommendations.filter(r => parseFloat(r.confidence) > 0.7).length}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Recommendation Confidence Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="confidence" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="cross-sell" className="space-y-4">
              <div className="space-y-3">
                {crossSellRecommendations.slice(0, 10).map((rec, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Product {rec.productId} → Product {rec.recommendedProductId}</h4>
                          <p className="text-sm text-gray-600">Cross-sell opportunity</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="default">{formatPercentage(parseFloat(rec.confidence) * 100)}</Badge>
                          <p className="text-sm text-gray-600 mt-1">
                            Co-occurrence: {rec.coOccurrenceCount}
                          </p>
                        </div>
                      </div>
                      <Progress value={parseFloat(rec.confidence) * 100} className="mt-2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="up-sell" className="space-y-4">
              <div className="space-y-3">
                {upSellRecommendations.slice(0, 10).map((rec, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Product {rec.productId} → Product {rec.recommendedProductId}</h4>
                          <p className="text-sm text-gray-600">Up-sell opportunity</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary">{formatPercentage(parseFloat(rec.confidence) * 100)}</Badge>
                          <p className="text-sm text-gray-600 mt-1">
                            Co-occurrence: {rec.coOccurrenceCount}
                          </p>
                        </div>
                      </div>
                      <Progress value={parseFloat(rec.confidence) * 100} className="mt-2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Recommendation Types</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span>Cross-sell</span>
                        <Badge variant="default">{crossSellRecommendations.length}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Up-sell</span>
                        <Badge variant="secondary">{upSellRecommendations.length}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Confidence Levels</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span>High (&gt;70%)</span>
                        <Badge variant="default">
                          {recommendations.filter(r => parseFloat(r.confidence) > 0.7).length}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Medium (50-70%)</span>
                        <Badge variant="secondary">
                          {recommendations.filter(r => parseFloat(r.confidence) >= 0.5 && parseFloat(r.confidence) <= 0.7).length}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Low (&lt;50%)</span>
                        <Badge variant="outline">
                          {recommendations.filter(r => parseFloat(r.confidence) < 0.5).length}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-blue-600">
                        {formatPercentage(
                          recommendations.reduce((sum, r) => sum + parseFloat(r.confidence), 0) / recommendations.length * 100
                        )}
                      </div>
                      <div className="text-sm text-gray-600">Avg Confidence</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-green-600">
                        {Math.round(recommendations.reduce((sum, r) => sum + r.coOccurrenceCount, 0) / recommendations.length)}
                      </div>
                      <div className="text-sm text-gray-600">Avg Co-occurrence</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-purple-600">
                        {formatPercentage(recommendations.filter(r => parseFloat(r.confidence) > 0.7).length / recommendations.length * 100)}
                      </div>
                      <div className="text-sm text-gray-600">High Quality Rate</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-amber-600">
                        {recommendations.length > 0 ? Math.max(...recommendations.map(r => r.coOccurrenceCount)) : 0}
                      </div>
                      <div className="text-sm text-gray-600">Max Co-occurrence</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}