/**
 * Generic Chart Widget
 * Visualizes custom dataset with multiple chart types
 */

import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DatasetSchema, FieldDefinition, applyAggregation, AggregationType } from "@/lib/data-schema";
import { dataSchemaManager } from "@/lib/data-schema-manager";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { BarChart as BarChartIcon, TrendingUp } from "lucide-react";

type ChartType = "line" | "bar" | "pie" | "area";

interface GenericChartWidgetProps {
  schemaId: string;
  sourceId?: string;
  title?: string;
  description?: string;
  defaultChartType?: ChartType;
  xAxisField?: string;
  yAxisField?: string;
  aggregation?: AggregationType;
}

export function GenericChartWidget({
  schemaId,
  sourceId,
  title,
  description,
  defaultChartType = "bar",
  xAxisField,
  yAxisField,
  aggregation = "sum",
}: GenericChartWidgetProps) {
  const schema = dataSchemaManager.getSchema(schemaId);
  const dataset = sourceId
    ? dataSchemaManager.getDataset(sourceId)
    : dataSchemaManager.getDatasetsBySchema(schemaId)[0];

  const [chartType, setChartType] = useState<ChartType>(defaultChartType);
  const [selectedXAxis, setSelectedXAxis] = useState<string>(
    xAxisField || schema?.fields[0]?.id || ""
  );
  const [selectedYAxis, setSelectedYAxis] = useState<string>(
    yAxisField || schema?.fields.find((f) => f.type === "number" || f.type === "currency")?.id || ""
  );
  const [selectedAggregation, setSelectedAggregation] = useState<AggregationType>(aggregation);

  if (!schema || !dataset) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <BarChartIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No data available</p>
        </CardContent>
      </Card>
    );
  }

  const chartData = useMemo(() => {
    if (!selectedXAxis || !selectedYAxis) return [];

    const grouped: Record<string, any[]> = {};

    dataset.data.forEach((row) => {
      const xValue = String(row[selectedXAxis] || "Unknown");
      if (!grouped[xValue]) {
        grouped[xValue] = [];
      }
      grouped[xValue].push(row[selectedYAxis]);
    });

    return Object.entries(grouped).map(([key, values]) => ({
      name: key,
      value: applyAggregation(values, selectedAggregation),
    }));
  }, [dataset.data, selectedXAxis, selectedYAxis, selectedAggregation]);

  const numericFields = schema.fields.filter(
    (f) => f.type === "number" || f.type === "currency" || f.type === "percentage"
  );

  const categoricalFields = schema.fields.filter(
    (f) => f.type === "string" || f.type === "enum" || f.type === "boolean"
  );

  const colors = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
    "#14b8a6",
    "#f97316",
  ];

  const renderChart = () => {
    switch (chartType) {
      case "line":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        );

      case "bar":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#3b82f6">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );

      case "pie":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      case "area":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  const totalValue = chartData.reduce((sum, item) => sum + item.value, 0);
  const avgValue = chartData.length > 0 ? totalValue / chartData.length : 0;
  const maxValue = Math.max(...chartData.map((item) => item.value));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle>{title || `${schema.name} Visualization`}</CardTitle>
            <CardDescription>
              {description || `Visualizing ${chartData.length} data points`}
            </CardDescription>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          <Select value={chartType} onValueChange={(value: ChartType) => setChartType(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bar">Bar Chart</SelectItem>
              <SelectItem value="line">Line Chart</SelectItem>
              <SelectItem value="pie">Pie Chart</SelectItem>
              <SelectItem value="area">Area Chart</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedXAxis} onValueChange={setSelectedXAxis}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="X-Axis..." />
            </SelectTrigger>
            <SelectContent>
              {categoricalFields.map((field) => (
                <SelectItem key={field.id} value={field.id}>
                  {field.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedYAxis} onValueChange={setSelectedYAxis}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Y-Axis..." />
            </SelectTrigger>
            <SelectContent>
              {numericFields.map((field) => (
                <SelectItem key={field.id} value={field.id}>
                  {field.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedAggregation}
            onValueChange={(value: AggregationType) => setSelectedAggregation(value)}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sum">Sum</SelectItem>
              <SelectItem value="avg">Average</SelectItem>
              <SelectItem value="min">Minimum</SelectItem>
              <SelectItem value="max">Maximum</SelectItem>
              <SelectItem value="count">Count</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-accent p-3 rounded-lg">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-xl font-bold">{totalValue.toFixed(2)}</p>
          </div>
          <div className="bg-accent p-3 rounded-lg">
            <p className="text-sm text-muted-foreground">Average</p>
            <p className="text-xl font-bold">{avgValue.toFixed(2)}</p>
          </div>
          <div className="bg-accent p-3 rounded-lg">
            <p className="text-sm text-muted-foreground">Maximum</p>
            <p className="text-xl font-bold">{maxValue.toFixed(2)}</p>
          </div>
        </div>

        {/* Chart */}
        {chartData.length > 0 ? (
          renderChart()
        ) : (
          <div className="py-12 text-center text-muted-foreground">
            <p>No data to visualize</p>
            <p className="text-sm">Select X and Y axis fields to generate chart</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
