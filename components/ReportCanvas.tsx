"use client";

import { useState } from "react";
import { Trash2, Settings, Plus } from "lucide-react";
import type {
  DatabaseConnection,
  DatabaseTable,
  ReportWidget,
} from "@/types";
import ChartWidget from "./widgets/ChartWidget";
import TableWidget from "./widgets/TableWidget";
import WidgetConfigPanel from "./WidgetConfigPanel";

interface ReportCanvasProps {
  widgets: ReportWidget[];
  tables: DatabaseTable[];
  onUpdateWidget: (id: string, updates: Partial<ReportWidget>) => void;
  onRemoveWidget: (id: string) => void;
  dbConnection: DatabaseConnection | null;
}

export default function ReportCanvas({
  widgets,
  tables,
  onUpdateWidget,
  onRemoveWidget,
  dbConnection,
}: ReportCanvasProps) {
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);
  const [configPanelOpen, setConfigPanelOpen] = useState(false);

  const selectedWidget = widgets.find((w) => w.id === selectedWidgetId);

  if (widgets.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
        <div className="bg-gray-100 p-12 rounded-lg">
          <Plus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Start Building Your Report
          </h3>
          <p className="text-gray-600 mb-6 max-w-sm">
            Click the &quot;Add Chart&quot; or &quot;Add Table&quot; button to add widgets to your
            report. Drag columns from the schema to configure them.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Canvas */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          {widgets.map((widget) => (
            <div
              key={widget.id}
              onClick={() => {
                setSelectedWidgetId(widget.id);
                setConfigPanelOpen(true);
              }}
              className={`bg-white rounded-lg shadow transition cursor-pointer border-2 ${
                selectedWidgetId === widget.id
                  ? "border-blue-500 ring-2 ring-blue-200"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              {/* Widget Header */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">{widget.title}</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedWidgetId(widget.id);
                      setConfigPanelOpen(true);
                    }}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded transition"
                    title="Configure widget"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveWidget(widget.id);
                    }}
                    className="p-2 text-gray-600 hover:bg-red-100 hover:text-red-600 rounded transition"
                    title="Remove widget"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Widget Content */}
              <div className="p-4 bg-gray-50 min-h-[300px]">
                {widget.type === "chart" ? (
                  <ChartWidget
                    widget={widget}
                    tables={tables}
                    dbConnection={dbConnection}
                  />
                ) : (
                  <TableWidget
                    widget={widget}
                    tables={tables}
                    dbConnection={dbConnection}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Config Panel */}
      {selectedWidget && configPanelOpen && (
        <WidgetConfigPanel
          widget={selectedWidget}
          tables={tables}
          onClose={() => setConfigPanelOpen(false)}
          onUpdate={(updates) => {
            onUpdateWidget(selectedWidget.id, updates);
          }}
        />
      )}
    </div>
  );
}
