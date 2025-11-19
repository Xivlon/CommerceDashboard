/**
 * Data Sources Management Page
 * Manage schemas, data sources, and imports
 */

import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { dataSchemaManager } from "@/lib/data-schema-manager";
import { DatasetSchema, DataSource } from "@/lib/data-schema";
import { SchemaBuilder } from "@/components/schema-builder";
import { DataImport } from "@/components/data-import";
import { useToast } from "@/hooks/use-toast";
import {
  Database,
  Plus,
  Trash2,
  Edit,
  Upload,
  FileText,
  ArrowLeft,
  Search,
  Download,
  Eye,
} from "lucide-react";

export default function DataSources() {
  const [schemas, setSchemas] = useState<DatasetSchema[]>([]);
  const [sources, setSources] = useState<DataSource[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSchemaBuilder, setShowSchemaBuilder] = useState(false);
  const [showImporter, setShowImporter] = useState(false);
  const [selectedSchema, setSelectedSchema] = useState<DatasetSchema | null>(null);
  const [editingSchema, setEditingSchema] = useState<DatasetSchema | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setSchemas(dataSchemaManager.getSchemas());
    setSources(dataSchemaManager.getSources());
  };

  const handleDeleteSchema = (schemaId: string) => {
    if (confirm("Delete this schema? All associated data will be lost.")) {
      dataSchemaManager.deleteSchema(schemaId);
      loadData();
      toast({
        title: "Schema Deleted",
        description: "Schema and all data have been removed.",
      });
    }
  };

  const handleDeleteSource = (sourceId: string) => {
    if (confirm("Delete this data source?")) {
      dataSchemaManager.deleteSource(sourceId);
      loadData();
      toast({
        title: "Source Deleted",
        description: "Data source has been removed.",
      });
    }
  };

  const handleImportData = (schema: DatasetSchema) => {
    setSelectedSchema(schema);
    setShowImporter(true);
  };

  const handleImportComplete = () => {
    setShowImporter(false);
    setSelectedSchema(null);
    loadData();
  };

  const filteredSchemas = schemas.filter((schema) =>
    schema.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-theme-primary/5 p-6">
      <div className="container mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link href="/">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Database className="h-8 w-8" />
              Data Sources
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your custom data schemas and imports
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowSchemaBuilder(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Schema
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Schemas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{schemas.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Data Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sources.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Active Imports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {sources.filter((s) => s.status === "active").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {schemas.reduce((sum, s) => sum + (s.recordCount || 0), 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search schemas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>

        {/* Schemas Grid */}
        {filteredSchemas.length === 0 ? (
          <Card>
            <CardContent className="py-16">
              <div className="text-center">
                <Database className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Schemas Found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery
                    ? "Try a different search term"
                    : "Create your first schema to get started"}
                </p>
                {!searchQuery && (
                  <Button onClick={() => setShowSchemaBuilder(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Schema
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSchemas.map((schema) => {
              const schemaSources = sources.filter((s) => s.schemaId === schema.id);
              const activeSources = schemaSources.filter((s) => s.status === "active");

              return (
                <Card key={schema.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{schema.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {schema.description || "No description"}
                        </CardDescription>
                      </div>
                      {schema.category && (
                        <Badge variant="outline">{schema.category}</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Fields</p>
                        <p className="font-semibold">{schema.fields.length}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Records</p>
                        <p className="font-semibold">{schema.recordCount || 0}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Sources</p>
                        <p className="font-semibold">{schemaSources.length}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Active</p>
                        <p className="font-semibold text-green-600">{activeSources.length}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {schema.fields.slice(0, 3).map((field) => (
                        <Badge key={field.id} variant="secondary" className="text-xs">
                          {field.name}
                        </Badge>
                      ))}
                      {schema.fields.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{schema.fields.length - 3} more
                        </Badge>
                      )}
                    </div>

                    <div className="flex gap-2 pt-2">
                      {schema.recordCount && schema.recordCount > 0 ? (
                        <Link href={`/custom-dashboard/${schema.id}`}>
                          <Button variant="default" size="sm" className="flex-1">
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        </Link>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleImportData(schema)}
                        >
                          <Upload className="h-3 w-3 mr-1" />
                          Import
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingSchema(schema);
                          setShowSchemaBuilder(true);
                        }}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteSchema(schema.id)}
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => dataSchemaManager.exportSchema(schema.id)}
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Data Sources List */}
        {sources.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Imports</CardTitle>
              <CardDescription>View and manage your data sources</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sources.slice(0, 5).map((source) => {
                  const schema = schemas.find((s) => s.id === source.schemaId);
                  const dataset = dataSchemaManager.getDataset(source.id);

                  return (
                    <div
                      key={source.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{source.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {schema?.name} • {dataset?.data.length || 0} records
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={source.status === "active" ? "default" : "secondary"}
                        >
                          {source.status}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSource(source.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Schema Builder Dialog */}
      <Dialog open={showSchemaBuilder} onOpenChange={setShowSchemaBuilder}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingSchema ? "Edit Schema" : "Create New Schema"}
            </DialogTitle>
            <DialogDescription>
              Define the structure of your data with custom fields
            </DialogDescription>
          </DialogHeader>
          <SchemaBuilder
            schema={editingSchema || undefined}
            onSave={() => {
              setShowSchemaBuilder(false);
              setEditingSchema(null);
              loadData();
            }}
            onCancel={() => {
              setShowSchemaBuilder(false);
              setEditingSchema(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Data Import Dialog */}
      <Dialog open={showImporter} onOpenChange={setShowImporter}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Import Data</DialogTitle>
            <DialogDescription>
              Upload and map your data to {selectedSchema?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedSchema && (
            <DataImport
              schema={selectedSchema}
              onComplete={handleImportComplete}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
