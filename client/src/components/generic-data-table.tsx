/**
 * Generic Data Table Widget
 * Displays custom dataset in table format with sorting, filtering, and pagination
 */

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatasetSchema, formatFieldValue } from "@/lib/data-schema";
import { dataSchemaManager } from "@/lib/data-schema-manager";
import {
  Table,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
} from "lucide-react";

interface GenericDataTableProps {
  schemaId: string;
  sourceId?: string;
  title?: string;
  description?: string;
  pageSize?: number;
}

export function GenericDataTable({
  schemaId,
  sourceId,
  title,
  description,
  pageSize = 10,
}: GenericDataTableProps) {
  const schema = dataSchemaManager.getSchema(schemaId);
  const dataset = sourceId
    ? dataSchemaManager.getDataset(sourceId)
    : dataSchemaManager.getDatasetsBySchema(schemaId)[0];

  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [filterField, setFilterField] = useState<string>("");
  const [filterValue, setFilterValue] = useState("");

  if (!schema || !dataset) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Table className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No data available</p>
        </CardContent>
      </Card>
    );
  }

  const filteredData = useMemo(() => {
    let data = [...dataset.data];

    // Apply filter
    if (filterField && filterValue) {
      data = data.filter((row) => {
        const value = row[filterField];
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(filterValue.toLowerCase());
      });
    }

    // Apply sort
    if (sortField) {
      data.sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];

        if (aVal === bVal) return 0;
        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;

        const comparison = aVal < bVal ? -1 : 1;
        return sortDirection === "asc" ? comparison : -comparison;
      });
    }

    return data;
  }, [dataset.data, sortField, sortDirection, filterField, filterValue]);

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);

  const handleSort = (fieldId: string) => {
    if (sortField === fieldId) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(fieldId);
      setSortDirection("asc");
    }
  };

  const handleExport = () => {
    const csv = [
      schema.fields.map((f) => f.name).join(","),
      ...filteredData.map((row) =>
        schema.fields.map((f) => row[f.id] || "").join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${schema.name}-export.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title || schema.name}</CardTitle>
            <CardDescription>
              {description || `${filteredData.length} of ${dataset.data.length} records`}
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex gap-2">
          <Select value={filterField} onValueChange={setFilterField}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by field..." />
            </SelectTrigger>
            <SelectContent>
              {schema.fields.map((field) => (
                <SelectItem key={field.id} value={field.id}>
                  {field.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {filterField && (
            <Input
              placeholder="Filter value..."
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              className="max-w-xs"
            />
          )}
          {filterValue && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFilterField("");
                setFilterValue("");
              }}
            >
              Clear
            </Button>
          )}
        </div>

        {/* Table */}
        <div className="border rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-accent">
              <tr>
                {schema.fields.map((field) => (
                  <th
                    key={field.id}
                    className="p-3 text-left cursor-pointer hover:bg-accent/80"
                    onClick={() => handleSort(field.id)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{field.name}</span>
                      {sortField === field.id && (
                        sortDirection === "asc" ? (
                          <ArrowUp className="h-3 w-3" />
                        ) : (
                          <ArrowDown className="h-3 w-3" />
                        )
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {field.type}
                      </Badge>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-t hover:bg-accent/30">
                  {schema.fields.map((field) => {
                    const value = row[field.id];
                    return (
                      <td key={field.id} className="p-3">
                        {formatFieldValue(value, field)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
