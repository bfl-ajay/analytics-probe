"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
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
import { AlertCircle, Loader } from "lucide-react";
import type {
  DatabaseConnection,
  DatabaseTable,
  ReportWidget,
  ChartConfig,
} from "@/types";

interface ChartWidgetProps {
  widget: ReportWidget;
  tables: DatabaseTable[];
  dbConnection: DatabaseConnection | null;
}

export default function ChartWidget({
  widget,
  tables,
  dbConnection,
}: ChartWidgetProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const config = widget.config as ChartConfig;
  const selectedTable = tables.find((t) => t.name === config.table);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/database/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dbConnection,
          table: config.table,
          columns: [config.xAxis, config.yAxis],
          limit: 100,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to load data");
      }

      const result = await response.json();
      setData(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (config.table && config.xAxis && config.yAxis && dbConnection) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.table, config.xAxis, config.yAxis, config.chartType, dbConnection]);

  if (!config.table || !config.xAxis || !config.yAxis) {
    return (
      <div className="h-full flex items-center justify-center text-center">
        <div>
          <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">
            Configure chart: select table, X-axis, and Y-axis columns
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-6 h-6 animate-spin text-blue-500 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Loading chart data...</p>
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

  if (data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-sm text-gray-600">No data available</p>
      </div>
    );
  }

  const colors = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
  ];

  const xAxisKey = config.xAxis || (data[0] ? Object.keys(data[0])[0] : "");
  const yAxisKey = config.yAxis || (data[0] ? Object.keys(data[0])[1] || Object.keys(data[0])[0] : "");

  const renderChart = () => {
    switch (config.chartType) {
      case "bar":
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xAxisKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey={yAxisKey} fill="#3b82f6" />
          </BarChart>
        );
      case "line":
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xAxisKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey={yAxisKey} stroke="#3b82f6" />
          </LineChart>
        );
      case "pie":
        return (
          <PieChart>
            <Pie
              data={data}
              dataKey={yAxisKey}
              nameKey={xAxisKey}
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        );
      case "area":
      default:
        return (
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xAxisKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey={yAxisKey} fill="#3b82f6" />
          </AreaChart>
        );
    }
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      {renderChart()}
    </ResponsiveContainer>
  );
}
