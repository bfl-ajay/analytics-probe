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

export interface ReportWidget {
  id: string;
  type: "chart" | "table";
  title: string;
  config: ChartConfig | TableConfig;
  position: number;
}

export interface ChartConfig {
  chartType: "bar" | "line" | "pie" | "area";
  table: string;
  xAxis: string;
  yAxis: string;
  filters?: Filter[];
}

export interface TableConfig {
  table: string;
  columns: string[];
  filters?: Filter[];
  limit?: number;
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
  widgets: ReportWidget[];
  createdAt: Date;
  updatedAt: Date;
}
