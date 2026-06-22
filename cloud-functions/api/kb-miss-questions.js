import {
  authorize,
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
  "miss_id",
  "user_id",
  "chat_history",
  "ai_reply",
  "nickname",
  "miss_reason",
  "route",
  "status",
  "suggested_answer",
  "created_at",
  "updated_at",
  "user_message",
];

function values(record) {
  return [
    textOrNull(record.id),
    textOrNull(record.sys_platform),
    textOrNull(record.uuid),
    textOrNull(record.bstudio_create_time),
    textOrNull(record.miss_id),
    textOrNull(record.user_id),
    textOrNull(record.chat_history),
    textOrNull(record.ai_reply),
    textOrNull(record.nickname),
    textOrNull(record.miss_reason),
    textOrNull(record.route),
    textOrNull(record.status),
    textOrNull(record.suggested_answer),
    textOrNull(record.created_at),
    textOrNull(record.updated_at),
    textOrNull(record.user_message),
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

  return upsertRecords(context, "kb_miss_questions", columns, records, values, ["id"]);
}
