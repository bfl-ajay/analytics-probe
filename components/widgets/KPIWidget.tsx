"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Loader } from "lucide-react";
import type {
  DatabaseConnection,
  DatabaseTable,
  ReportWidget,
  KPIConfig,
  DataModel,
} from "@/types";

interface KPIWidgetProps {
  widget: ReportWidget;
  tables: DatabaseTable[];
  dbConnection: DatabaseConnection | null;
  dataModel?: DataModel | null;
}

export default function KPIWidget({
  widget,
  tables,
  dbConnection,
  dataModel,
}: KPIWidgetProps) {
  const [value, setValue] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const config = widget.config as KPIConfig;

  useEffect(() => {
    if (
      config.measure?.column &&
      config.measure?.table &&
      dbConnection &&
      dataModel
    ) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.measure?.column, config.measure?.table]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/database/complex-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dbConnection,
          dataModel,
          columns: [config.measure],
          filters: config.filters || [],
          groupBy: [],
          limit: 1,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to load data");
      }

      const result = await response.json();
      if (result.data && result.data.length > 0) {
        const measure = config.measure.alias || config.measure.column;
        const val = result.data[0][measure];
        setValue(typeof val === "number" ? val : parseFloat(val));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
      setValue(null);
    } finally {
      setLoading(false);
    }
  };

  if (!config.measure?.column) {
    return (
      <div className="h-full flex items-center justify-center text-center">
        <div>
          <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Configure KPI: select a measure</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-6 h-6 animate-spin text-blue-500 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Loading KPI data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  const formatValue = (val: number): string => {
    if (config.format === "currency") {
      return `$${val.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }
    if (config.format === "percentage") {
      return `${(val * 100).toFixed(2)}%`;
    }
    return val.toLocaleString("en-US");
  };

  return (
    <div className="h-full flex flex-col items-center justify-center">
      <p className="text-sm text-gray-600 mb-2">
        {config.measure.alias || config.measure.column}
      </p>
      <p className="text-5xl font-bold text-blue-600">
        {value !== null ? formatValue(value) : "N/A"}
      </p>
    </div>
  );
}
