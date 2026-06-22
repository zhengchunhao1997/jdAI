import { Pool, type QueryResultRow } from "pg";

let pool: Pool | null = null;

export function getDb() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("Missing DATABASE_URL");
  }

  if (!pool) {
    pool = new Pool({
      connectionString,
      max: 5,
      ssl:
        process.env.DATABASE_SSL === "false"
          ? false
          : {
              rejectUnauthorized: false,
            },
    });
  }

  return pool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  values: unknown[] = [],
) {
  return getDb().query<T>(text, values);
}

export function normalizeRecords<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) {
    return payload as T[];
  }

  if (payload && typeof payload === "object" && Array.isArray((payload as { records?: unknown }).records)) {
    return (payload as { records: T[] }).records;
  }

  if (payload && typeof payload === "object") {
    return [payload as T];
  }

  return [];
}

export function textOrNull(value: unknown) {
  if (value === undefined || value === null) {
    return null;
  }

  const text = String(value).trim();
  return text ? text : null;
}

export function boolOrFalse(value: unknown) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    return value.toLowerCase() === "true";
  }

  return Boolean(value);
}

export function isAuthorized(request: Request) {
  const apiKey = process.env.CUSTOMER_DATA_API_KEY;

  if (!apiKey) {
    return true;
  }

  return request.headers.get("authorization") === `Bearer ${apiKey}`;
}
