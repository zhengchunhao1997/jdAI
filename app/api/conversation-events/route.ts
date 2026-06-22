import { NextResponse } from "next/server";
import { boolOrFalse, isAuthorized, normalizeRecords, query, textOrNull } from "@/lib/db";

type ConversationEvent = Record<string, unknown>;

const columns = [
  "id",
  "sys_platform",
  "uuid",
  "bstudio_create_time",
  "event_id",
  "lead_id",
  "user_id",
  "event_type",
  "user_message",
  "ai_reply",
  "intent_level",
  "next_action",
  "risk_flag",
  "risk_type",
  "message_summary",
  "created_at",
];

function values(record: ConversationEvent) {
  return [
    textOrNull(record.id),
    textOrNull(record.sys_platform),
    textOrNull(record.uuid),
    textOrNull(record.bstudio_create_time),
    textOrNull(record.event_id),
    textOrNull(record.lead_id),
    textOrNull(record.user_id),
    textOrNull(record.event_type),
    textOrNull(record.user_message),
    textOrNull(record.ai_reply),
    textOrNull(record.intent_level),
    textOrNull(record.next_action),
    boolOrFalse(record.risk_flag),
    textOrNull(record.risk_type),
    textOrNull(record.message_summary),
    textOrNull(record.created_at),
  ];
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);
  const records = normalizeRecords<ConversationEvent>(payload);

  if (!records.length) {
    return NextResponse.json({ message: "No records provided" }, { status: 400 });
  }

  const inserted = [];

  try {
    for (const record of records) {
      if (!record.id || !record.user_id) {
        return NextResponse.json({ message: "id and user_id are required" }, { status: 400 });
      }

      const placeholders = columns.map((_, index) => `$${index + 1}`).join(", ");
      const updates = columns
        .filter((column) => column !== "id")
        .map((column) => `${column} = excluded.${column}`)
        .join(", ");

      const result = await query(
        `insert into conversation_events (${columns.join(", ")})
         values (${placeholders})
         on conflict (id) do update set ${updates}
         returning id`,
        values(record),
      );

      inserted.push(result.rows[0]?.id);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Database write failed";
    return NextResponse.json({ message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, count: inserted.length, ids: inserted });
}
