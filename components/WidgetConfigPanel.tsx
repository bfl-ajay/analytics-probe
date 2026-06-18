"use client";

import { X, ChevronDown } from "lucide-react";
import { useState } from "react";
import type { DatabaseTable, ReportWidget } from "@/types";

interface WidgetConfigPanelProps {
  widget: ReportWidget;
  tables: DatabaseTable[];
  onClose: () => void;
  onUpdate: (updates: Partial<ReportWidget>) => void;
}

export default function WidgetConfigPanel({
  widget,
  onClose,
  onUpdate,
}: WidgetConfigPanelProps) {
  const [title, setTitle] = useState(widget.title);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["general"])
  );

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    onUpdate({ title: newTitle });
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col shadow-lg">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Widget Config</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* General Settings */}
        <div className="border-b border-gray-200">
          <button
            onClick={() => toggleSection("general")}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition text-left"
          >
            <span className="font-medium text-gray-900">General</span>
            <ChevronDown
              className={`w-4 h-4 transition ${
                expandedSections.has("general") ? "" : "-rotate-90"
              }`}
            />
          </button>

          {expandedSections.has("general") && (
            <div className="px-4 pb-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Widget Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Widget Type
                </label>
                <p className="text-sm text-gray-600 capitalize">
                  {widget.type === "chart"
                    ? "Chart"
                    : widget.type === "table"
                      ? "Table"
                      : "KPI"}
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <p className="text-xs text-blue-900">
                  <strong>Tip:</strong> Configure this widget by editing the
                  Query Builder. Select columns, apply filters, and set
                  aggregations there.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
