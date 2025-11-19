/**
 * Custom Data Dashboard
 * Displays imported custom data with visualizations
 */

import { useEffect, useState } from "react";
import { Link, useParams } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { dataSchemaManager } from "@/lib/data-schema-manager";
import { DatasetSchema, DataSource, CustomDataset, applyAggregation } from "@/lib/data-schema";
import { GenericDataTable } from "@/components/generic-data-table";
import { GenericChartWidget } from "@/components/generic-chart-widget";
import { ArrowLeft, Database, RefreshCw, Settings, TrendingUp } from "lucide-react";

export default function CustomDashboard() {
  const params = useParams();
  const schemaId = params.schemaId || "";

  const [schema, setSchema] = useState<DatasetSchema | null>(null);
  const [sources, setSources] = useState<DataSource[]>([]);
  const [datasets, setDatasets] = useState<CustomDataset[]>([]);

  useEffect(() => {
    loadData();
  }, [schemaId]);

  const loadData = () => {
    const loadedSchema = dataSchemaManager.getSchema(schemaId);
    const loadedSources = dataSchemaManager.getSourcesBySchema(schemaId);
    const loadedDatasets = dataSchemaManager.getDatasetsBySchema(schemaId);

    setSchema(loadedSchema || null);
    setSources(loadedSources);
    setDatasets(loadedDatasets);
  };

  if (!schema) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-theme-primary/5 p-6">
        <div className="container mx-auto max-w-7xl">
          <Card>
            <CardContent className="py-16 text-center">
              <Database className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Schema Not Found</h3>
              <p className="text-muted-foreground mb-6">
                The requested data schema could not be found.
              </p>
              <Link href="/data-sources">
                <Button>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Data Sources
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const totalRecords = datasets.reduce((sum, d) => sum + d.data.length, 0);

  // Calculate some basic stats
  const numericFields = schema.fields.filter(
    (f) => f.type === "number" || f.type === "currency" || f.type === "percentage"
  );

  const stats = numericFields.slice(0, 4).map((field) => {
    const allValues = datasets.flatMap((d) => d.data.map((row) => row[field.id]));
    return {
      fieldName: field.name,
      sum: applyAggregation(allValues, "sum"),
      avg: applyAggregation(allValues, "avg"),
      max: applyAggregation(allValues, "max"),
      min: applyAggregation(allValues, "min"),
    };
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-theme-primary/5 p-6">
      <div className="container mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link href="/data-sources">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Data Sources
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <Database className="h-8 w-8" />
              <div>
                <h1 className="text-3xl font-bold">{schema.name}</h1>
                {schema.description && (
                  <p className="text-muted-foreground mt-1">{schema.description}</p>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Link href="/data-sources">
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Manage
              </Button>
            </Link>
          </div>
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap gap-2">
          {schema.category && <Badge variant="outline">{schema.category}</Badge>}
          <Badge variant="secondary">{schema.fields.length} Fields</Badge>
          <Badge variant="secondary">{totalRecords} Records</Badge>
          <Badge variant="secondary">{sources.length} Sources</Badge>
        </div>

        {/* Stats */}
        {stats.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <Card key={stat.fieldName}>
                <CardHeader className="pb-3">
                  <CardDescription>{stat.fieldName}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">{stat.avg.toFixed(2)}</span>
                    <span className="text-sm text-muted-foreground">avg</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Min: {stat.min.toFixed(2)}</span>
                    <span>Max: {stat.max.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Main Content */}
        <Tabs defaultValue="visualizations" className="space-y-6">
          <TabsList>
            <TabsTrigger value="visualizations">Visualizations</TabsTrigger>
            <TabsTrigger value="data">Data Table</TabsTrigger>
            <TabsTrigger value="sources">Sources ({sources.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="visualizations" className="space-y-6">
            {datasets.length === 0 ? (
              <Card>
                <CardContent className="py-16 text-center">
                  <TrendingUp className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Data Imported</h3>
                  <p className="text-muted-foreground mb-6">
                    Import data to see visualizations
                  </p>
                  <Link href="/data-sources">
                    <Button>Import Data</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Generate charts for each numeric field */}
                {numericFields.slice(0, 4).map((field) => (
                  <GenericChartWidget
                    key={field.id}
                    schemaId={schemaId}
                    sourceId={datasets[0]?.sourceId}
                    yAxisField={field.id}
                    defaultChartType="bar"
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="data">
            <GenericDataTable schemaId={schemaId} sourceId={datasets[0]?.sourceId} />
          </TabsContent>

          <TabsContent value="sources" className="space-y-4">
            {sources.map((source) => {
              const dataset = datasets.find((d) => d.sourceId === source.id);
              return (
                <Card key={source.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{source.name}</CardTitle>
                        <CardDescription>
                          Last imported:{" "}
                          {source.lastImport
                            ? new Date(source.lastImport).toLocaleString()
                            : "Never"}
                        </CardDescription>
                      </div>
                      <Badge
                        variant={source.status === "active" ? "default" : "secondary"}
                      >
                        {source.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Type</p>
                        <p className="font-semibold uppercase">{source.type}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Records</p>
                        <p className="font-semibold">{dataset?.data.length || 0}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Mappings</p>
                        <p className="font-semibold">{source.mappings.length}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Created</p>
                        <p className="font-semibold">
                          {new Date(source.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {sources.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No data sources configured</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
