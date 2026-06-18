import mysql from "mysql2/promise";
import type { DatabaseConnection } from "@/types";

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
