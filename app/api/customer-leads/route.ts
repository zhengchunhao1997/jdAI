import { NextResponse } from "next/server";
import { boolOrFalse, isAuthorized, normalizeRecords, query, textOrNull } from "@/lib/db";

type CustomerLead = Record<string, unknown>;

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

function values(record: CustomerLead) {
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

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);
  const records = normalizeRecords<CustomerLead>(payload);

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
        `insert into customer_leads (${columns.join(", ")})
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
