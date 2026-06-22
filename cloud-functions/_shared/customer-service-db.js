import pg from "pg";

const { Pool } = pg;

let pool = null;

function getEnv(context, key) {
  return context?.env?.[key] ?? process.env[key];
}

function getDb(context) {
  const connectionString = getEnv(context, "DATABASE_URL");

  if (!connectionString) {
    throw new Error("Missing DATABASE_URL");
  }

  if (!pool) {
    pool = new Pool({
      connectionString,
      max: 5,
      ssl:
        getEnv(context, "DATABASE_SSL") === "false"
          ? false
          : {
              rejectUnauthorized: false,
            },
    });
  }

  return pool;
}

export async function query(context, text, values = []) {
  return getDb(context).query(text, values);
}

export function normalizeRecords(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload && typeof payload === "object" && Array.isArray(payload.records)) {
    return payload.records;
  }

  if (payload && typeof payload === "object") {
    return [payload];
  }

  return [];
}

export function textOrNull(value) {
  if (value === undefined || value === null) {
    return null;
  }

  const text = String(value).trim();
  return text ? text : null;
}

export function boolOrFalse(value) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    return value.toLowerCase() === "true";
  }

  return Boolean(value);
}

export function corsHeaders() {
  return {
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    "Access-Control-Allow-Methods": "OPTIONS, POST",
    "Access-Control-Allow-Origin": "*",
  };
}

export function json(data, init = {}) {
  return Response.json(data, {
    ...init,
    headers: {
      ...corsHeaders(),
      ...(init.headers ?? {}),
    },
  });
}

export function options() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(),
  });
}

export function authorize(context) {
  const apiKey = getEnv(context, "CUSTOMER_DATA_API_KEY");

  if (!apiKey) {
    return true;
  }

  const authorization = context.request.headers.get("authorization") ?? "";
  return authorization === `Bearer ${apiKey}`;
}

export async function parseJson(context) {
  return context.request.json().catch(() => null);
}

export async function upsertRecords(context, table, columns, records, getValues, requiredFields) {
  if (!records.length) {
    return json({ message: "No records provided" }, { status: 400 });
  }

  const placeholders = columns.map((_, index) => `$${index + 1}`).join(", ");
  const updates = columns
    .filter((column) => column !== "id")
    .map((column) => `${column} = excluded.${column}`)
    .join(", ");
  const inserted = [];

  for (const record of records) {
    const missingField = requiredFields.find((field) => !record[field]);

    if (missingField) {
      return json({ message: `${missingField} is required` }, { status: 400 });
    }

    const result = await query(
      context,
      `insert into ${table} (${columns.join(", ")})
       values (${placeholders})
       on conflict (id) do update set ${updates}
       returning id`,
      getValues(record),
    );

    inserted.push(result.rows[0]?.id);
  }

  return json({ ok: true, count: inserted.length, ids: inserted });
}
