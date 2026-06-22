import {
  authorize,
  boolOrFalse,
  json,
  normalizeRecords,
  options,
  parseJson,
  textOrNull,
  upsertRecords,
} from "../_shared/customer-service-db.js";

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

function values(record) {
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

export function onRequestOptions() {
  return options();
}

export async function onRequestPost(context) {
  if (!authorize(context)) {
    return json({ message: "Unauthorized" }, { status: 401 });
  }

  const payload = await parseJson(context);
  const records = normalizeRecords(payload);

  return upsertRecords(context, "conversation_events", columns, records, values, ["id", "user_id"]);
}
