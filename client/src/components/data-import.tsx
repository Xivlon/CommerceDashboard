/**
 * Data Import Component
 * Upload and map data from CSV/JSON files to schemas
 */

import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { DatasetSchema, DataSource, ImportMapping } from "@/lib/data-schema";
import { dataSchemaManager } from "@/lib/data-schema-manager";
import { Upload, FileText, CheckCircle, AlertCircle, MapPin, Table } from "lucide-react";

interface DataImportProps {
  schema: DatasetSchema;
  source?: DataSource;
  onComplete?: (sourceId: string) => void;
}

export function DataImport({ schema, source: existingSource, onComplete }: DataImportProps) {
  const [step, setStep] = useState<"upload" | "mapping" | "preview" | "complete">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<"csv" | "json">("csv");
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [mappings, setMappings] = useState<ImportMapping[]>([]);
  const [source, setSource] = useState<DataSource>(
    existingSource || {
      id: `source-${Date.now()}`,
      name: "",
      type: "csv",
      schemaId: schema.id,
      mappings: [],
      status: "inactive",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  );
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const extension = selectedFile.name.split(".").pop()?.toLowerCase();
    if (extension !== "csv" && extension !== "json") {
      toast({
        title: "Invalid File",
        description: "Please upload a CSV or JSON file.",
        variant: "destructive",
      });
      return;
    }

    setFile(selectedFile);
    setFileType(extension as "csv" | "json");
    parseFilePreview(selectedFile, extension as "csv" | "json");
  };

  const parseFilePreview = async (file: File, type: "csv" | "json") => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        let data: any[];
        let cols: string[];

        if (type === "csv") {
          const lines = text.trim().split("\n");
          cols = lines[0].split(",").map((h) => h.trim());

          data = lines.slice(1, 6).map((line) => {
            const values = line.split(",").map((v) => v.trim());
            const row: any = {};
            cols.forEach((col, i) => {
              row[col] = values[i] || "";
            });
            return row;
          });
        } else {
          const parsed = JSON.parse(text);
          data = Array.isArray(parsed) ? parsed.slice(0, 5) : [parsed];
          cols = data.length > 0 ? Object.keys(data[0]) : [];
        }

        setPreviewData(data);
        setColumns(cols);

        // Auto-create mappings for matching column names
        const autoMappings: ImportMapping[] = schema.fields.map((field) => {
          const matchingColumn = cols.find(
            (col) => col.toLowerCase() === field.name.toLowerCase()
          );
          return {
            sourceColumn: matchingColumn || cols[0] || "",
            targetField: field.id,
          };
        });

        setMappings(autoMappings);
        setStep("mapping");
      } catch (error) {
        toast({
          title: "Parse Error",
          description: "Failed to parse file. Please check the file format.",
          variant: "destructive",
        });
      }
    };

    reader.readAsText(file);
  };

  const updateMapping = (fieldId: string, sourceColumn: string) => {
    setMappings((prev) =>
      prev.map((m) =>
        m.targetField === fieldId ? { ...m, sourceColumn } : m
      )
    );
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    setProgress(0);

    try {
      // Update source with mappings
      const updatedSource: DataSource = {
        ...source,
        name: source.name || file.name,
        type: fileType,
        mappings,
      };

      dataSchemaManager.saveSource(updatedSource);

      // Simulate progress
      const interval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      // Import data
      let dataset;
      if (fileType === "csv") {
        dataset = await dataSchemaManager.importCSV(file, updatedSource.id);
      } else {
        dataset = await dataSchemaManager.importJSON(file, updatedSource.id);
      }

      clearInterval(interval);
      setProgress(100);

      toast({
        title: "Import Successful",
        description: `Imported ${dataset.data.length} records successfully.`,
      });

      setStep("complete");
      onComplete?.(updatedSource.id);
    } catch (error) {
      toast({
        title: "Import Failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  // Upload Step
  if (step === "upload") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Data File
          </CardTitle>
          <CardDescription>
            Import data from CSV or JSON files into {schema.name}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div
            className="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer hover:bg-accent/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">
              {file ? file.name : "Click to select a file"}
            </p>
            <p className="text-sm text-muted-foreground">
              Supports CSV and JSON formats
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.json"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {file && (
            <div className="bg-accent p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024).toFixed(2)} KB • {fileType.toUpperCase()}
                  </p>
                </div>
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="source-name">Data Source Name (Optional)</Label>
            <Input
              id="source-name"
              value={source.name}
              onChange={(e) => setSource({ ...source, name: e.target.value })}
              placeholder={file?.name || "My Data Source"}
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Mapping Step
  if (step === "mapping") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Map Fields
          </CardTitle>
          <CardDescription>
            Match columns from your file to schema fields
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <p className="text-sm">
              <strong>Preview:</strong> Showing first 5 rows from your file
            </p>
          </div>

          <div className="space-y-4">
            {schema.fields.map((field) => {
              const mapping = mappings.find((m) => m.targetField === field.id);
              const sampleValue = mapping?.sourceColumn
                ? previewData[0]?.[mapping.sourceColumn]
                : null;

              return (
                <div key={field.id} className="border rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 items-start">
                    <div>
                      <Label className="font-medium">{field.name}</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{field.type}</Badge>
                        {field.required && <Badge variant="secondary">Required</Badge>}
                      </div>
                      {field.description && (
                        <p className="text-sm text-muted-foreground mt-2">
                          {field.description}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Source Column</Label>
                      <Select
                        value={mapping?.sourceColumn || ""}
                        onValueChange={(value) => updateMapping(field.id, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select column..." />
                        </SelectTrigger>
                        <SelectContent>
                          {columns.map((col) => (
                            <SelectItem key={col} value={col}>
                              {col}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {sampleValue && (
                        <div className="bg-accent p-2 rounded text-sm">
                          <span className="text-muted-foreground">Sample:</span>{" "}
                          <span className="font-mono">{sampleValue}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => setStep("upload")}>
              Back
            </Button>
            <Button onClick={handleImport} disabled={importing}>
              {importing ? "Importing..." : "Import Data"}
            </Button>
          </div>

          {importing && (
            <div className="space-y-2">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-center text-muted-foreground">
                {progress}% complete
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Complete Step
  if (step === "complete") {
    const dataset = dataSchemaManager.getDataset(source.id);

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-600" />
            Import Complete
          </CardTitle>
          <CardDescription>Your data has been successfully imported</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-accent p-4 rounded-lg text-center">
              <p className="text-2xl font-bold">{dataset?.data.length || 0}</p>
              <p className="text-sm text-muted-foreground">Records Imported</p>
            </div>
            <div className="bg-accent p-4 rounded-lg text-center">
              <p className="text-2xl font-bold">{schema.fields.length}</p>
              <p className="text-sm text-muted-foreground">Fields Mapped</p>
            </div>
            <div className="bg-accent p-4 rounded-lg text-center">
              <p className="text-2xl font-bold">{columns.length}</p>
              <p className="text-sm text-muted-foreground">Source Columns</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Preview Data</Label>
            <div className="border rounded-lg overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-accent">
                  <tr>
                    {schema.fields.slice(0, 5).map((field) => (
                      <th key={field.id} className="p-2 text-left">
                        {field.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dataset?.data.slice(0, 3).map((row, i) => (
                    <tr key={i} className="border-t">
                      {schema.fields.slice(0, 5).map((field) => (
                        <td key={field.id} className="p-2">
                          {row[field.id] || "-"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <Button className="w-full" onClick={() => onComplete?.(source.id)}>
            Go to Dashboard
          </Button>
        </CardContent>
      </Card>
    );
  }

  return null;
}
