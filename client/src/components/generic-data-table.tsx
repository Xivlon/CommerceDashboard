/**
 * Generic Data Table Widget - Premium Edition
 * Displays custom dataset in table format with modern styling, sorting, filtering, and pagination
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
  Table as TableIcon,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  Search,
  X,
  Database,
  Sparkles,
  ChevronsLeft,
  ChevronsRight,
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
      <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
        <CardContent className="py-16 text-center">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 opacity-20 blur-xl rounded-full" />
            <TableIcon className="h-20 w-20 mx-auto text-muted-foreground mb-4 relative animate-pulse" />
          </div>
          <p className="text-muted-foreground font-medium">No data available</p>
          <p className="text-sm text-muted-foreground/60 mt-2">Connect a data source to get started</p>
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

  const clearFilter = () => {
    setFilterField("");
    setFilterValue("");
    setCurrentPage(1);
  };

  const hasActiveFilter = filterField && filterValue;

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-2 overflow-hidden">
      {/* Gradient accent bar */}
      <div className="h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 shadow-md">
              <Database className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                {title || schema.name}
              </CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <Sparkles className="h-3 w-3" />
                {description || (
                  <>
                    <span className="font-semibold text-foreground/80">{filteredData.length}</span>
                    {filteredData.length !== dataset.data.length && (
                      <span className="text-muted-foreground">of {dataset.data.length}</span>
                    )}
                    <span>records</span>
                  </>
                )}
              </CardDescription>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="shadow-sm hover:shadow-md transition-all hover:scale-105 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30 hover:border-green-500/50"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Enhanced Filter Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Filter className="h-4 w-4" />
            <span className="font-medium">Filter & Search</span>
            <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent" />
            {hasActiveFilter && (
              <Badge variant="secondary" className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/30">
                Active Filter
              </Badge>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Select value={filterField} onValueChange={setFilterField}>
              <SelectTrigger className="w-52 shadow-sm hover:shadow-md transition-all">
                <SelectValue placeholder="Select field to filter..." />
              </SelectTrigger>
              <SelectContent>
                {schema.fields.map((field) => (
                  <SelectItem key={field.id} value={field.id}>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {field.type}
                      </Badge>
                      {field.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {filterField && (
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Enter search value..."
                  value={filterValue}
                  onChange={(e) => {
                    setFilterValue(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10 shadow-sm hover:shadow-md transition-all"
                />
              </div>
            )}

            {hasActiveFilter && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilter}
                className="shadow-sm hover:shadow-md transition-all hover:bg-red-500/10 hover:text-red-600"
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>

          {hasActiveFilter && (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <Badge
                variant="secondary"
                className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 shadow-sm"
              >
                <Filter className="h-3 w-3 mr-1" />
                {schema.fields.find(f => f.id === filterField)?.name}: "{filterValue}"
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Premium Table */}
        <div className="rounded-xl overflow-hidden border-2 border-border shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              {/* Enhanced Header */}
              <thead>
                <tr className="bg-gradient-to-r from-accent via-accent to-accent/80 border-b-2 border-border">
                  {schema.fields.map((field) => (
                    <th
                      key={field.id}
                      className={`p-4 text-left cursor-pointer transition-all duration-200 hover:bg-accent/60 ${
                        sortField === field.id ? "bg-primary/10" : ""
                      }`}
                      onClick={() => handleSort(field.id)}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="font-bold text-foreground">{field.name}</span>
                        {sortField === field.id && (
                          <div className="p-1 rounded bg-primary/20">
                            {sortDirection === "asc" ? (
                              <ArrowUp className="h-3 w-3 text-primary" />
                            ) : (
                              <ArrowDown className="h-3 w-3 text-primary" />
                            )}
                          </div>
                        )}
                      </div>
                      <Badge
                        variant="outline"
                        className="text-xs font-normal bg-background/50"
                      >
                        {field.type}
                      </Badge>
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Enhanced Body with Striped Rows */}
              <tbody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className={`
                        border-b border-border/50 transition-all duration-200
                        hover:bg-accent/40 hover:shadow-md hover:scale-[1.01]
                        ${rowIndex % 2 === 0 ? "bg-background" : "bg-accent/20"}
                      `}
                    >
                      {schema.fields.map((field) => {
                        const value = row[field.id];
                        return (
                          <td
                            key={field.id}
                            className={`p-4 ${
                              sortField === field.id ? "bg-primary/5 font-medium" : ""
                            }`}
                          >
                            {formatFieldValue(value, field)}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={schema.fields.length} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="relative inline-block">
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 opacity-20 blur-xl rounded-full" />
                          <Search className="h-12 w-12 text-muted-foreground relative" />
                        </div>
                        <div>
                          <p className="text-muted-foreground font-medium">No matching records</p>
                          <p className="text-sm text-muted-foreground/60 mt-1">
                            Try adjusting your filter criteria
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Premium Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-sm px-3 py-1 shadow-sm">
                Page <span className="font-bold mx-1">{currentPage}</span> of <span className="font-bold ml-1">{totalPages}</span>
              </Badge>
              <Badge variant="secondary" className="text-sm px-3 py-1 shadow-sm">
                {startIndex + 1}-{Math.min(startIndex + pageSize, filteredData.length)} of {filteredData.length}
              </Badge>
            </div>

            <div className="flex items-center gap-1">
              {/* First page */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="shadow-sm hover:shadow-md transition-all"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>

              {/* Previous */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="shadow-sm hover:shadow-md transition-all"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {/* Page numbers */}
              {getPageNumbers().map((page, index) => (
                <Button
                  key={index}
                  variant={page === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => typeof page === "number" && setCurrentPage(page)}
                  disabled={typeof page === "string"}
                  className={`
                    min-w-[2.5rem] shadow-sm hover:shadow-md transition-all
                    ${page === currentPage ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md" : ""}
                    ${typeof page === "string" ? "cursor-default hover:bg-transparent" : ""}
                  `}
                >
                  {page}
                </Button>
              ))}

              {/* Next */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="shadow-sm hover:shadow-md transition-all"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>

              {/* Last page */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="shadow-sm hover:shadow-md transition-all"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
