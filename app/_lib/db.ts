import mysql, { type Pool, type RowDataPacket, type ResultSetHeader } from "mysql2/promise";

let pool: Pool | null = null;

export function getPool(): Pool {
  if (pool) return pool;
  pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "pai_nai_di",
    charset: "utf8mb4",
    waitForConnections: true,
    connectionLimit: 10,
    namedPlaceholders: true,
  });
  return pool;
}

// mysql2's ExecuteValues type is overly strict for named-placeholder objects;
// cast through `any` so callers can pass plain `{ id: 1 }`-style maps.
type Params = Record<string, unknown> | unknown[];

export async function query<T extends RowDataPacket[]>(
  sql: string,
  params?: Params,
): Promise<T> {
  const [rows] = await getPool().execute<T>(sql, params as never);
  return rows;
}

export async function execute(
  sql: string,
  params?: Params,
): Promise<ResultSetHeader> {
  const [result] = await getPool().execute<ResultSetHeader>(sql, params as never);
  return result;
}
