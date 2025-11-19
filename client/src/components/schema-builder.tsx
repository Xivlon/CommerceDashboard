/**
 * Schema Builder Component
 * Visual interface for creating and editing data schemas
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { DatasetSchema, FieldDefinition, FieldType, createField } from "@/lib/data-schema";
import { dataSchemaManager } from "@/lib/data-schema-manager";
import { Plus, Trash2, Save, Download, Upload, GripVertical } from "lucide-react";

interface SchemaBuilderProps {
  schema?: DatasetSchema;
  onSave?: (schema: DatasetSchema) => void;
  onCancel?: () => void;
}

export function SchemaBuilder({ schema: initialSchema, onSave, onCancel }: SchemaBuilderProps) {
  const [schema, setSchema] = useState<DatasetSchema>(
    initialSchema || {
      id: `schema-${Date.now()}`,
      name: "",
      description: "",
      fields: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  );

  const [editingField, setEditingField] = useState<FieldDefinition | null>(null);
  const { toast } = useToast();

  const fieldTypes: FieldType[] = [
    "string",
    "number",
    "boolean",
    "date",
    "datetime",
    "email",
    "url",
    "currency",
    "percentage",
    "enum",
  ];

  const handleAddField = () => {
    const newField = createField("New Field", "string");
    setEditingField(newField);
  };

  const handleSaveField = () => {
    if (!editingField) return;

    const exists = schema.fields.find((f) => f.id === editingField.id);
    if (exists) {
      setSchema({
        ...schema,
        fields: schema.fields.map((f) => (f.id === editingField.id ? editingField : f)),
      });
    } else {
      setSchema({
        ...schema,
        fields: [...schema.fields, editingField],
      });
    }

    setEditingField(null);
    toast({
      title: "Field Saved",
      description: `${editingField.name} has been added to the schema.`,
    });
  };

  const handleDeleteField = (fieldId: string) => {
    setSchema({
      ...schema,
      fields: schema.fields.filter((f) => f.id !== fieldId),
    });
    toast({
      title: "Field Deleted",
      description: "Field has been removed from the schema.",
    });
  };

  const handleSaveSchema = () => {
    if (!schema.name) {
      toast({
        title: "Validation Error",
        description: "Schema name is required.",
        variant: "destructive",
      });
      return;
    }

    if (schema.fields.length === 0) {
      toast({
        title: "Validation Error",
        description: "At least one field is required.",
        variant: "destructive",
      });
      return;
    }

    dataSchemaManager.saveSchema(schema);
    toast({
      title: "Schema Saved",
      description: `${schema.name} has been saved successfully.`,
    });

    onSave?.(schema);
  };

  const handleExport = () => {
    dataSchemaManager.exportSchema(schema.id);
    toast({
      title: "Schema Exported",
      description: "Schema has been downloaded as JSON.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Schema Info */}
      <Card>
        <CardHeader>
          <CardTitle>Schema Information</CardTitle>
          <CardDescription>Define the basic properties of your data schema</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="schema-name">Schema Name *</Label>
            <Input
              id="schema-name"
              value={schema.name}
              onChange={(e) => setSchema({ ...schema, name: e.target.value })}
              placeholder="e.g., Research Data, Sales Records, Survey Responses"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="schema-desc">Description</Label>
            <Textarea
              id="schema-desc"
              value={schema.description || ""}
              onChange={(e) => setSchema({ ...schema, description: e.target.value })}
              placeholder="Describe what this schema represents..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="schema-category">Category</Label>
              <Input
                id="schema-category"
                value={schema.category || ""}
                onChange={(e) => setSchema({ ...schema, category: e.target.value })}
                placeholder="e.g., Research, Sales, Analytics"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="schema-primary">Primary Key Field</Label>
              <Select
                value={schema.primaryKey || ""}
                onValueChange={(value) => setSchema({ ...schema, primaryKey: value })}
              >
                <SelectTrigger id="schema-primary">
                  <SelectValue placeholder="Select primary key..." />
                </SelectTrigger>
                <SelectContent>
                  {schema.fields.map((field) => (
                    <SelectItem key={field.id} value={field.id}>
                      {field.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fields */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Fields ({schema.fields.length})</CardTitle>
              <CardDescription>Define the structure of your data</CardDescription>
            </div>
            <Button onClick={handleAddField}>
              <Plus className="h-4 w-4 mr-2" />
              Add Field
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {schema.fields.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No fields defined yet</p>
              <p className="text-sm">Click "Add Field" to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {schema.fields.map((field) => (
                <div
                  key={field.id}
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{field.name}</span>
                      <Badge variant="outline">{field.type}</Badge>
                      {field.required && <Badge variant="secondary">Required</Badge>}
                      {field.unique && <Badge variant="secondary">Unique</Badge>}
                    </div>
                    {field.description && (
                      <p className="text-sm text-muted-foreground mt-1">{field.description}</p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingField(field)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteField(field.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Field Editor Modal */}
      {editingField && (
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle>
              {schema.fields.find((f) => f.id === editingField.id) ? "Edit" : "Add"} Field
            </CardTitle>
            <CardDescription>Configure field properties and validation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="field-name">Field Name *</Label>
                <Input
                  id="field-name"
                  value={editingField.name}
                  onChange={(e) =>
                    setEditingField({ ...editingField, name: e.target.value })
                  }
                  placeholder="e.g., Email, Age, Score"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="field-type">Data Type *</Label>
                <Select
                  value={editingField.type}
                  onValueChange={(value: FieldType) =>
                    setEditingField({ ...editingField, type: value })
                  }
                >
                  <SelectTrigger id="field-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fieldTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="field-desc">Description</Label>
              <Textarea
                id="field-desc"
                value={editingField.description || ""}
                onChange={(e) =>
                  setEditingField({ ...editingField, description: e.target.value })
                }
                placeholder="Describe this field..."
                rows={2}
              />
            </div>

            <div className="flex gap-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="field-required"
                  checked={editingField.required || false}
                  onCheckedChange={(checked) =>
                    setEditingField({ ...editingField, required: checked })
                  }
                />
                <Label htmlFor="field-required">Required</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="field-unique"
                  checked={editingField.unique || false}
                  onCheckedChange={(checked) =>
                    setEditingField({ ...editingField, unique: checked })
                  }
                />
                <Label htmlFor="field-unique">Unique</Label>
              </div>
            </div>

            {editingField.type === "enum" && (
              <div className="space-y-2">
                <Label htmlFor="field-enum">Enum Values (comma-separated)</Label>
                <Input
                  id="field-enum"
                  value={editingField.enumValues?.join(", ") || ""}
                  onChange={(e) =>
                    setEditingField({
                      ...editingField,
                      enumValues: e.target.value.split(",").map((v) => v.trim()),
                    })
                  }
                  placeholder="e.g., Low, Medium, High"
                />
              </div>
            )}

            {(editingField.type === "number" ||
              editingField.type === "currency" ||
              editingField.type === "percentage") && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="field-min">Minimum Value</Label>
                  <Input
                    id="field-min"
                    type="number"
                    value={editingField.min || ""}
                    onChange={(e) =>
                      setEditingField({
                        ...editingField,
                        min: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="field-max">Maximum Value</Label>
                  <Input
                    id="field-max"
                    type="number"
                    value={editingField.max || ""}
                    onChange={(e) =>
                      setEditingField({
                        ...editingField,
                        max: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                  />
                </div>
              </div>
            )}

            <Separator />

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingField(null)}>
                Cancel
              </Button>
              <Button onClick={handleSaveField}>Save Field</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-between">
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export Schema
          </Button>
        </div>
        <div className="flex gap-2">
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button onClick={handleSaveSchema}>
            <Save className="h-4 w-4 mr-2" />
            Save Schema
          </Button>
        </div>
      </div>
    </div>
  );
}
