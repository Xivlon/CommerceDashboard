import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  refreshAllData,
  generateAllPredictions,
  analyzeChurnRisk,
  generateProductRecommendations,
  retrainModels,
} from "@/lib/ml-api";

interface MutationConfig {
  onSuccessMessage?: string;
  onSuccessDescription?: string;
  onErrorMessage?: string;
  onErrorDescription?: string;
  invalidateQueries?: string[];
}

export function useRefreshData(config: MutationConfig = {}) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: refreshAllData,
    onSuccess: () => {
      const queriesToInvalidate = config.invalidateQueries ?? [
        "/api/customers",
        "/api/predictions/clv",
        "/api/predictions/churn",
        "/api/dashboard/metrics",
        "/api/dashboard/insights",
      ];

      queriesToInvalidate.forEach(queryKey => {
        queryClient.invalidateQueries({ queryKey: [queryKey] });
      });

      toast({
        title: config.onSuccessMessage ?? "Data Refreshed",
        description: config.onSuccessDescription ?? "All data has been updated with the latest information.",
      });
    },
    onError: () => {
      toast({
        title: config.onErrorMessage ?? "Refresh Failed",
        description: config.onErrorDescription ?? "Unable to refresh data. Please try again.",
        variant: "destructive",
      });
    },
  });
}

export function useGeneratePredictions(config: MutationConfig = {}) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: generateAllPredictions,
    onSuccess: () => {
      const queriesToInvalidate = config.invalidateQueries ?? [
        "/api/customers",
        "/api/predictions/clv",
        "/api/predictions/churn",
      ];

      queriesToInvalidate.forEach(queryKey => {
        queryClient.invalidateQueries({ queryKey: [queryKey] });
      });

      toast({
        title: config.onSuccessMessage ?? "Predictions Generated",
        description: config.onSuccessDescription ?? "New predictions have been generated successfully.",
      });
    },
    onError: () => {
      toast({
        title: config.onErrorMessage ?? "Generation Failed",
        description: config.onErrorDescription ?? "Unable to generate predictions. Please try again.",
        variant: "destructive",
      });
    },
  });
}

export function useAnalyzeChurn(config: MutationConfig = {}) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: analyzeChurnRisk,
    onSuccess: () => {
      const queriesToInvalidate = config.invalidateQueries ?? [
        "/api/predictions/churn",
        "/api/customers",
      ];

      queriesToInvalidate.forEach(queryKey => {
        queryClient.invalidateQueries({ queryKey: [queryKey] });
      });

      toast({
        title: config.onSuccessMessage ?? "Analysis Complete",
        description: config.onSuccessDescription ?? "Churn risk analysis has been completed successfully.",
      });
    },
    onError: () => {
      toast({
        title: config.onErrorMessage ?? "Analysis Failed",
        description: config.onErrorDescription ?? "Unable to analyze churn risk. Please try again.",
        variant: "destructive",
      });
    },
  });
}

export function useGenerateRecommendations(config: MutationConfig = {}) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: generateProductRecommendations,
    onSuccess: () => {
      const queriesToInvalidate = config.invalidateQueries ?? [
        "/api/recommendations/products",
      ];

      queriesToInvalidate.forEach(queryKey => {
        queryClient.invalidateQueries({ queryKey: [queryKey] });
      });

      toast({
        title: config.onSuccessMessage ?? "Recommendations Generated",
        description: config.onSuccessDescription ?? "Product recommendations have been updated.",
      });
    },
    onError: () => {
      toast({
        title: config.onErrorMessage ?? "Generation Failed",
        description: config.onErrorDescription ?? "Unable to generate recommendations. Please try again.",
        variant: "destructive",
      });
    },
  });
}

export function useRetrainModels(config: MutationConfig = {}) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (modelType: string) => retrainModels(modelType),
    onSuccess: () => {
      const queriesToInvalidate = config.invalidateQueries ?? [
        "/api/dashboard/metrics",
        "/api/dashboard/insights",
      ];

      queriesToInvalidate.forEach(queryKey => {
        queryClient.invalidateQueries({ queryKey: [queryKey] });
      });

      toast({
        title: config.onSuccessMessage ?? "Models Updated",
        description: config.onSuccessDescription ?? "ML models have been retrained successfully.",
      });
    },
    onError: () => {
      toast({
        title: config.onErrorMessage ?? "Retraining Failed",
        description: config.onErrorDescription ?? "Unable to retrain models. Please try again.",
        variant: "destructive",
      });
    },
  });
}

// Export functionality hook
export function useExportData() {
  const { toast } = useToast();

  const exportToCSV = (
    data: Record<string, unknown>[],
    filename: string,
    headers?: string[]
  ) => {
    if (!data || data.length === 0) {
      toast({
        title: "No Data",
        description: "No data available to export.",
        variant: "destructive",
      });
      return;
    }

    const keys = headers ?? Object.keys(data[0]);
    const csvContent = "data:text/csv;charset=utf-8," +
      keys.join(",") + "\n" +
      data.map(row =>
        keys.map(key => {
          const value = row[key];
          // Handle null/undefined and escape commas
          if (value === null || value === undefined) return 'N/A';
          const strValue = String(value);
          return strValue.includes(',') ? `"${strValue}"` : strValue;
        }).join(",")
      ).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Complete",
      description: `Data exported to ${filename} successfully.`,
    });
  };

  return { exportToCSV };
}
