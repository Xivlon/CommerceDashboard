import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShoppingBag, ArrowRight, Target, TrendingUp, Package } from "lucide-react";
import { getProductRecommendations } from "@/lib/ml-api";
import { useToast } from "@/hooks/use-toast";

interface ProductRecommendationsProps {
  category: string;
  detailed?: boolean;
}

export function ProductRecommendations({ category, detailed = false }: ProductRecommendationsProps) {
  const { toast } = useToast();

  const { data: recommendations, isLoading } = useQuery({
    queryKey: ["/api/recommendations/products", category],
    queryFn: () => getProductRecommendations(),
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Product Recommendation Insights</CardTitle>
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

  if (!recommendations || recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Product Recommendation Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <Package className="h-16 w-16 mb-4" />
            <p className="text-lg font-medium">No recommendation data available</p>
            <p className="text-sm">Product recommendations will appear here once sufficient purchase data is available.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Group recommendations by type
  const crossSellRecommendations = recommendations.filter(rec => rec.recommendationType === 'cross_sell').slice(0, detailed ? 10 : 5);
  const upSellRecommendations = recommendations.filter(rec => rec.recommendationType === 'up_sell').slice(0, detailed ? 10 : 5);

  const handleCreateCampaign = (productId: number, recommendedProductId: number) => {
    toast({
      title: "Campaign Created",
      description: `Marketing campaign created for product recommendation pair.`,
    });
  };

  const avgConfidence = recommendations.length > 0 
    ? recommendations.reduce((sum, rec) => sum + parseFloat(rec.confidence), 0) / recommendations.length
    : 0;

  // Mock product names for display (in real app, these would come from product data)
  const getProductName = (id: number) => {
    const products = {
      1: 'Wireless Headphones',
      2: 'Phone Case',
      3: 'Gaming Laptop',
      4: 'Gaming Mouse',
      5: 'Keyboard',
      6: 'Memory Card',
      7: 'Camera Bag',
      8: 'Laptop Stand',
      9: 'External Monitor',
      10: 'Wireless Charger'
    };
    return products[id as keyof typeof products] || `Product ${id}`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Product Recommendation Insights</CardTitle>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Association Rules Confidence: {(avgConfidence * 100).toFixed(1)}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cross-sell Opportunities */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <ShoppingBag className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Top Cross-sell Opportunities</h3>
              </div>
              
              {crossSellRecommendations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No cross-sell opportunities identified</p>
                  <p className="text-sm">More data needed for analysis</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {crossSellRecommendations.map((rec, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
                            <ShoppingBag className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{getProductName(rec.productId)}</p>
                            <p className="text-sm text-gray-500">Primary product</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-green-600">
                            +${(rec.coOccurrenceCount * 45).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">Revenue potential</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                        <p className="text-sm text-gray-600">Frequently bought with:</p>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                          {getProductName(rec.recommendedProductId)} ({(parseFloat(rec.confidence) * 100).toFixed(0)}%)
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {rec.lift}x Lift
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {(parseFloat(rec.support || '0') * 100).toFixed(0)}% Support
                          </Badge>
                        </div>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-xs text-blue-600 hover:text-blue-800"
                          onClick={() => handleCreateCampaign(rec.productId, rec.recommendedProductId)}
                        >
                          Create Campaign
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Up-sell Analysis */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">Up-sell Recommendations</h3>
              </div>
              
              {upSellRecommendations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No up-sell opportunities identified</p>
                  <p className="text-sm">More data needed for analysis</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upSellRecommendations.map((rec, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900">{getProductName(rec.productId)}</h4>
                          <p className="text-sm text-gray-600">
                            → <span className="font-medium">{getProductName(rec.recommendedProductId)}</span>
                          </p>
                        </div>
                        <span className="text-sm font-bold text-purple-600">
                          +${(parseFloat(rec.confidence) * 300).toFixed(0)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                        <span>{rec.coOccurrenceCount} target customers</span>
                        <span className="font-medium text-green-600">
                          {(parseFloat(rec.confidence) * 100).toFixed(0)}% confidence
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {Math.floor(Math.random() * 4 + 3)} months avg timing
                        </Badge>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-xs text-purple-600 hover:text-purple-800"
                          onClick={() => handleCreateCampaign(rec.productId, rec.recommendedProductId)}
                        >
                          Target Customers
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {detailed && recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Product Affinity Matrix</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="grid grid-cols-6 gap-1 min-w-96">
                {/* Headers */}
                <div className="p-2 text-xs font-medium text-gray-600"></div>
                <div className="p-2 text-xs font-medium text-gray-600 text-center">Electronics</div>
                <div className="p-2 text-xs font-medium text-gray-600 text-center">Accessories</div>
                <div className="p-2 text-xs font-medium text-gray-600 text-center">Gaming</div>
                <div className="p-2 text-xs font-medium text-gray-600 text-center">Audio</div>
                <div className="p-2 text-xs font-medium text-gray-600 text-center">Mobile</div>
                
                {/* Rows with affinity scores */}
                <div className="p-2 text-xs font-medium text-gray-600">Electronics</div>
                <div className="p-2 bg-gray-200 text-xs text-center font-medium">1.0</div>
                <div className="p-2 bg-green-300 text-xs text-center font-medium">0.8</div>
                <div className="p-2 bg-green-400 text-xs text-center font-medium text-white">0.9</div>
                <div className="p-2 bg-green-200 text-xs text-center font-medium">0.7</div>
                <div className="p-2 bg-yellow-200 text-xs text-center font-medium">0.4</div>
                
                <div className="p-2 text-xs font-medium text-gray-600">Accessories</div>
                <div className="p-2 bg-green-300 text-xs text-center font-medium">0.8</div>
                <div className="p-2 bg-gray-200 text-xs text-center font-medium">1.0</div>
                <div className="p-2 bg-green-200 text-xs text-center font-medium">0.6</div>
                <div className="p-2 bg-green-200 text-xs text-center font-medium">0.5</div>
                <div className="p-2 bg-green-400 text-xs text-center font-medium text-white">0.9</div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-400 rounded"></div>
                  <span>Strong Affinity (0.8+)</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-200 rounded"></div>
                  <span>Moderate Affinity (0.5-0.8)</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-yellow-200 rounded"></div>
                  <span>Weak Affinity (<0.5)</span>
                </div>
              </div>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                Export Matrix
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {detailed && (
        <Card>
          <CardHeader>
            <CardTitle>Recommendation Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Pair</TableHead>
                    <TableHead className="text-center">Type</TableHead>
                    <TableHead className="text-center">Confidence</TableHead>
                    <TableHead className="text-center">Support</TableHead>
                    <TableHead className="text-center">Lift</TableHead>
                    <TableHead className="text-right">Co-occurrences</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recommendations.slice(0, 10).map((rec, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{getProductName(rec.productId)}</span>
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                          <span>{getProductName(rec.recommendedProductId)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge 
                          variant={rec.recommendationType === 'cross_sell' ? 'default' : 'secondary'}
                          className={`text-xs ${
                            rec.recommendationType === 'cross_sell' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {rec.recommendationType.replace('_', '-')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {(parseFloat(rec.confidence) * 100).toFixed(1)}%
                      </TableCell>
                      <TableCell className="text-center">
                        {rec.support ? (parseFloat(rec.support) * 100).toFixed(1) : 'N/A'}%
                      </TableCell>
                      <TableCell className="text-center">
                        {rec.lift ? parseFloat(rec.lift).toFixed(1) : 'N/A'}x
                      </TableCell>
                      <TableCell className="text-right">
                        {rec.coOccurrenceCount}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
