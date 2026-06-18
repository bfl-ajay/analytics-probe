export interface DatabaseConnection {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

export interface DatabaseTable {
  name: string;
  columns: TableColumn[];
}

export interface TableColumn {
  name: string;
  type: string;
  nullable: boolean;
}

// Data Model & Relationships
export interface TableRelationship {
  id: string;
  fromTable: string;
  toTable: string;
  fromColumn: string;
  toColumn: string;
  type: "inner" | "left" | "right" | "full";
}

export interface DataModel {
  id: string;
  name: string;
  tables: string[];
  relationships: TableRelationship[];
  createdAt: Date;
}

// Query Builder
export interface QueryColumn {
  table: string;
  column: string;
  alias?: string;
  aggregation?: "sum" | "avg" | "count" | "min" | "max" | "none";
}

export interface QueryFilter {
  table: string;
  column: string;
  operator: "=" | "!=" | ">" | "<" | ">=" | "<=" | "LIKE" | "IN" | "between";
  value: string | string[] | number | number[];
}

export interface QueryDefinition {
  id: string;
  name: string;
  selectedColumns: QueryColumn[];
  filters: QueryFilter[];
  groupBy: string[];
  orderBy?: { column: string; direction: "asc" | "desc" }[];
  limit?: number;
  dataModel: DataModel;
}

export interface ReportWidget {
  id: string;
  type: "chart" | "table" | "kpi" | "gauge";
  title: string;
  config: ChartConfig | TableConfig | KPIConfig;
  position: number;
  query?: QueryDefinition;
}

export interface ChartConfig {
  chartType: "bar" | "line" | "pie" | "area" | "scatter" | "bubble";
  dimension: QueryColumn;
  measure: QueryColumn;
  filters?: QueryFilter[];
  limit?: number;
  // Legacy properties for backward compatibility
  table?: string;
  xAxis?: string;
  yAxis?: string;
}

export interface TableConfig {
  columns: QueryColumn[];
  filters?: QueryFilter[];
  limit?: number;
  sortBy?: { column: string; direction: "asc" | "desc" };
  // Legacy properties for backward compatibility
  table?: string;
}

export interface KPIConfig {
  measure: QueryColumn;
  format?: "number" | "currency" | "percentage";
  filters?: QueryFilter[];
}

export interface Filter {
  column: string;
  operator: "=" | "!=" | ">" | "<" | ">=" | "<=" | "LIKE" | "IN";
  value: string | string[];
}

export interface Report {
  id: string;
  name: string;
  description: string;
  dataModel: DataModel;
  widgets: ReportWidget[];
  createdAt: Date;
  updatedAt: Date;
}
