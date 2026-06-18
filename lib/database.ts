import mysql from "mysql2/promise";
import type {
  DatabaseConnection,
  DataModel,
  QueryColumn,
  QueryFilter,
} from "@/types";

export async function createConnection(dbConfig: DatabaseConnection) {
  return await mysql.createConnection({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.username,
    password: dbConfig.password,
    database: dbConfig.database,
  });
}

export async function testDatabaseConnection(
  dbConfig: DatabaseConnection
): Promise<boolean> {
  try {
    const connection = await createConnection(dbConfig);
    await connection.ping();
    await connection.end();
    return true;
  } catch (error) {
    throw new Error(
      `Failed to connect to database: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

export async function getDatabaseSchema(dbConfig: DatabaseConnection) {
  const connection = await createConnection(dbConfig);

  try {
    // Get all tables
    const [tables]: any = await connection.execute(
      "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ?",
      [dbConfig.database]
    );

    const schemaData = await Promise.all(
      tables.map(async (table: any) => {
        const [columns]: any = await connection.execute(
          `SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?`,
          [dbConfig.database, table.TABLE_NAME]
        );

        return {
          name: table.TABLE_NAME,
          columns: columns.map((col: any) => ({
            name: col.COLUMN_NAME,
            type: col.COLUMN_TYPE,
            nullable: col.IS_NULLABLE === "YES",
          })),
        };
      })
    );

    return schemaData;
  } finally {
    await connection.end();
  }
}

export async function executeQuery(
  dbConfig: DatabaseConnection,
  table: string,
  columns: string[],
  limit: number = 50
) {
  const connection = await createConnection(dbConfig);

  try {
    const columnList = columns.length > 0 ? columns.join(", ") : "*";
    const query = `SELECT ${columnList} FROM \`${table}\` LIMIT ${limit}`;

    const [rows]: any = await connection.execute(query);
    return rows;
  } finally {
    await connection.end();
  }
}

// Execute complex query with JOINs, filters, grouping, and aggregations
export async function executeComplexQuery(
  dbConfig: DatabaseConnection,
  dataModel: DataModel,
  columns: QueryColumn[],
  filters: QueryFilter[],
  groupBy: string[],
  limit: number = 1000
) {
  const connection = await createConnection(dbConfig);

  try {
    // Build SELECT clause
    const selectParts: string[] = [];
    columns.forEach((col) => {
      const baseColumn = `\`${col.table}\`.\`${col.column}\``;
      let expression = baseColumn;

      if (col.aggregation && col.aggregation !== "none") {
        expression = `${col.aggregation.toUpperCase()}(${baseColumn})`;
      }

      const alias = col.alias ? ` AS \`${col.alias}\`` : "";
      selectParts.push(`${expression}${alias}`);
    });

    // Build FROM and JOINs
    const primaryTable = columns[0]?.table || dataModel.tables[0];
    let query = `SELECT ${selectParts.join(", ")} FROM \`${primaryTable}\``;

    // Add JOINs
    for (const rel of dataModel.relationships) {
      const joinType =
        rel.type === "full"
          ? "FULL OUTER JOIN"
          : `${rel.type.toUpperCase()} JOIN`;
      query += ` ${joinType} \`${rel.toTable}\` ON \`${rel.fromTable}\`.\`${rel.fromColumn}\` = \`${rel.toTable}\`.\`${rel.toColumn}\``;
    }

    // Add WHERE clause for filters
    if (filters.length > 0) {
      const filterConditions = filters.map((f) => {
        const col = `\`${f.table}\`.\`${f.column}\``;
        const operator = f.operator;
        let condition = "";

        if (operator === "IN") {
          const vals = Array.isArray(f.value)
            ? f.value.map((v) => `'${v}'`).join(",")
            : `'${f.value}'`;
          condition = `${col} IN (${vals})`;
        } else if (operator === "between") {
          const [v1, v2] = Array.isArray(f.value) ? f.value : [f.value];
          condition = `${col} BETWEEN '${v1}' AND '${v2}'`;
        } else {
          condition = `${col} ${operator} '${f.value}'`;
        }

        return condition;
      });
      query += ` WHERE ${filterConditions.join(" AND ")}`;
    }

    // Add GROUP BY
    if (groupBy.length > 0) {
      const groupByParts = groupBy.map((g) => {
        const [table, column] = g.split(".");
        return `\`${table}\`.\`${column}\``;
      });
      query += ` GROUP BY ${groupByParts.join(", ")}`;
    }

    // Add LIMIT
    query += ` LIMIT ${limit}`;

    const [rows]: any = await connection.execute(query);
    return rows;
  } finally {
    await connection.end();
  }
}
