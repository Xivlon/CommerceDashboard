/**
 * Generic Chart Widget - Premium Edition
 * Visualizes custom dataset with multiple chart types and stunning visuals
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
import {
  BarChart3,
  TrendingUp,
  Activity,
  Award,
  Layers,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  AreaChart as AreaChartIcon,
  Sparkles,
} from "lucide-react";

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

const chartTypeConfig = {
  bar: { icon: BarChart3, label: "Bar Chart", gradient: "from-blue-500 to-cyan-500" },
  line: { icon: LineChartIcon, label: "Line Chart", gradient: "from-purple-500 to-pink-500" },
  pie: { icon: PieChartIcon, label: "Pie Chart", gradient: "from-orange-500 to-red-500" },
  area: { icon: AreaChartIcon, label: "Area Chart", gradient: "from-green-500 to-emerald-500" },
};

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
      <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
        <CardContent className="py-16 text-center">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 opacity-20 blur-xl rounded-full" />
            <BarChart3 className="h-20 w-20 mx-auto text-muted-foreground mb-4 relative animate-pulse" />
          </div>
          <p className="text-muted-foreground font-medium">No data available</p>
          <p className="text-sm text-muted-foreground/60 mt-2">Connect a data source to get started</p>
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
    "#3b82f6", // blue
    "#10b981", // green
    "#f59e0b", // amber
    "#ef4444", // red
    "#8b5cf6", // purple
    "#ec4899", // pink
    "#14b8a6", // teal
    "#f97316", // orange
  ];

  const renderChart = () => {
    switch (chartType) {
      case "line":
        return (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartData}>
              <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ec4899" stopOpacity={0.2}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" opacity={0.3} />
              <XAxis dataKey="name" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                stroke="url(#lineGradient)"
                strokeWidth={3}
                dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case "bar":
        return (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" opacity={0.3} />
              <XAxis dataKey="name" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
              <Legend />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={colors[index % colors.length]}
                    className="transition-all duration-300 hover:opacity-80"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );

      case "pie":
        return (
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <defs>
                {chartData.map((entry, index) => (
                  <linearGradient key={`gradient-${index}`} id={`pieGradient${index}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={colors[index % colors.length]} stopOpacity={1}/>
                    <stop offset="100%" stopColor={colors[index % colors.length]} stopOpacity={0.7}/>
                  </linearGradient>
                ))}
              </defs>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={110}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={{ stroke: 'hsl(var(--border))' }}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={`url(#pieGradient${index})`}
                    className="transition-all duration-300 hover:opacity-80"
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      case "area":
        return (
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" opacity={0.3} />
              <XAxis dataKey="name" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#10b981"
                strokeWidth={3}
                fill="url(#areaGradient)"
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

  const ActiveChartIcon = chartTypeConfig[chartType].icon;

  return (
    <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-2 overflow-hidden">
      {/* Gradient accent bar */}
      <div className={`h-1.5 bg-gradient-to-r ${chartTypeConfig[chartType].gradient}`} />

      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-gradient-to-br ${chartTypeConfig[chartType].gradient} shadow-md`}>
                <ActiveChartIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                  {title || `${schema.name} Visualization`}
                </CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <Sparkles className="h-3 w-3" />
                  {description || `Visualizing ${chartData.length} data points`}
                </CardDescription>
              </div>
            </div>
          </div>
        </div>

        {/* Control Panel with Visual Grouping */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Layers className="h-4 w-4" />
            <span className="font-medium">Chart Configuration</span>
            <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent" />
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-medium px-1">Chart Type</label>
              <Select value={chartType} onValueChange={(value: ChartType) => setChartType(value)}>
                <SelectTrigger className="w-36 shadow-sm hover:shadow-md transition-all">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(chartTypeConfig).map(([key, config]) => {
                    const Icon = config.icon;
                    return (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {config.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="h-auto w-px bg-border mx-1" />

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-medium px-1">X-Axis</label>
              <Select value={selectedXAxis} onValueChange={setSelectedXAxis}>
                <SelectTrigger className="w-44 shadow-sm hover:shadow-md transition-all">
                  <SelectValue placeholder="Select field..." />
                </SelectTrigger>
                <SelectContent>
                  {categoricalFields.map((field) => (
                    <SelectItem key={field.id} value={field.id}>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">{field.type}</Badge>
                        {field.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-medium px-1">Y-Axis</label>
              <Select value={selectedYAxis} onValueChange={setSelectedYAxis}>
                <SelectTrigger className="w-44 shadow-sm hover:shadow-md transition-all">
                  <SelectValue placeholder="Select field..." />
                </SelectTrigger>
                <SelectContent>
                  {numericFields.map((field) => (
                    <SelectItem key={field.id} value={field.id}>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">{field.type}</Badge>
                        {field.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="h-auto w-px bg-border mx-1" />

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-medium px-1">Aggregation</label>
              <Select
                value={selectedAggregation}
                onValueChange={(value: AggregationType) => setSelectedAggregation(value)}
              >
                <SelectTrigger className="w-36 shadow-sm hover:shadow-md transition-all">
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
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Premium Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Card */}
          <div className="relative overflow-hidden rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-300 group bg-gradient-to-br from-blue-500/10 via-cyan-500/10 to-blue-500/5 border border-blue-500/20 hover:border-blue-500/40">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 shadow-md">
                    <TrendingUp className="h-4 w-4 text-white" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">Total</p>
                </div>
                <p className="text-3xl font-bold bg-gradient-to-br from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  {totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Cumulative sum</p>
              </div>
            </div>
          </div>

          {/* Average Card */}
          <div className="relative overflow-hidden rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-300 group bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-purple-500/5 border border-purple-500/20 hover:border-purple-500/40">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 shadow-md">
                    <Activity className="h-4 w-4 text-white" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">Average</p>
                </div>
                <p className="text-3xl font-bold bg-gradient-to-br from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {avgValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Mean value</p>
              </div>
            </div>
          </div>

          {/* Maximum Card */}
          <div className="relative overflow-hidden rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-300 group bg-gradient-to-br from-orange-500/10 via-red-500/10 to-orange-500/5 border border-orange-500/20 hover:border-orange-500/40">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 shadow-md">
                    <Award className="h-4 w-4 text-white" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">Maximum</p>
                </div>
                <p className="text-3xl font-bold bg-gradient-to-br from-orange-600 to-red-600 bg-clip-text text-transparent">
                  {maxValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Peak value</p>
              </div>
            </div>
          </div>
        </div>

        {/* Chart Container with Glass-morphism */}
        {chartData.length > 0 ? (
          <div className="relative rounded-xl overflow-hidden">
            {/* Subtle background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent/30 via-accent/10 to-transparent" />

            {/* Chart content */}
            <div className="relative backdrop-blur-sm bg-accent/20 p-6 rounded-xl border border-border/50">
              {renderChart()}
            </div>
          </div>
        ) : (
          <div className="py-16 text-center rounded-xl border-2 border-dashed border-border bg-accent/20">
            <div className="relative inline-block mb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-muted to-muted-foreground/20 opacity-20 blur-xl rounded-full" />
              <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground relative" />
            </div>
            <p className="text-muted-foreground font-medium">No data to visualize</p>
            <p className="text-sm text-muted-foreground/60 mt-2">
              Select X and Y axis fields to generate chart
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
