import { NextResponse } from "next/server";
import { isAuthorized, normalizeRecords, query, textOrNull } from "@/lib/db";

type KbMissQuestion = Record<string, unknown>;

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

function values(record: KbMissQuestion) {
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

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);
  const records = normalizeRecords<KbMissQuestion>(payload);

  if (!records.length) {
    return NextResponse.json({ message: "No records provided" }, { status: 400 });
  }

  const inserted = [];

  try {
    for (const record of records) {
      if (!record.id) {
        return NextResponse.json({ message: "id is required" }, { status: 400 });
      }

      const placeholders = columns.map((_, index) => `$${index + 1}`).join(", ");
      const updates = columns
        .filter((column) => column !== "id")
        .map((column) => `${column} = excluded.${column}`)
        .join(", ");

      const result = await query(
        `insert into kb_miss_questions (${columns.join(", ")})
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
