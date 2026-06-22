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
  "user_id",
  "nickname",
  "height",
  "weight",
  "target_weight",
  "main_concern",
  "risk_flag",
  "risk_type",
  "intent_level",
  "current_stage",
  "recommended_package",
  "last_user_message",
  "last_ai_reply",
  "lead_summary",
  "next_action",
  "follow_up_time",
  "profile_json",
  "owner",
  "created_at",
  "updated_at",
];

function values(record) {
  return [
    textOrNull(record.id),
    textOrNull(record.sys_platform),
    textOrNull(record.uuid),
    textOrNull(record.bstudio_create_time),
    textOrNull(record.user_id),
    textOrNull(record.nickname),
    textOrNull(record.height),
    textOrNull(record.weight),
    textOrNull(record.target_weight),
    textOrNull(record.main_concern),
    boolOrFalse(record.risk_flag),
    textOrNull(record.risk_type),
    textOrNull(record.intent_level),
    textOrNull(record.current_stage),
    textOrNull(record.recommended_package),
    textOrNull(record.last_user_message),
    textOrNull(record.last_ai_reply),
    textOrNull(record.lead_summary),
    textOrNull(record.next_action),
    textOrNull(record.follow_up_time),
    record.profile_json ? JSON.stringify(record.profile_json) : null,
    textOrNull(record.owner),
    textOrNull(record.created_at),
    textOrNull(record.updated_at),
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

  return upsertRecords(context, "customer_leads", columns, records, values, ["id", "user_id"]);
}
