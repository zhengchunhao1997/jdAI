import { NextResponse } from "next/server";

type LeadPayload = {
  name?: string;
  company?: string;
  phone?: string;
  wechat?: string;
  dailyConsults?: string;
  source?: string;
  commonQuestions?: string;
};

export async function POST(request: Request) {
  let payload: LeadPayload;

  try {
    payload = (await request.json()) as LeadPayload;
  } catch {
    return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
  }

  if (!payload.name || !payload.company || !payload.phone) {
    return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
  }

  const lead = {
    ...payload,
    submittedAt: new Date().toISOString(),
  };

  const webhookUrl = process.env.LEAD_WEBHOOK_URL;

  if (webhookUrl) {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(lead),
    });

    if (!response.ok) {
      return NextResponse.json({ message: "Webhook delivery failed" }, { status: 502 });
    }
  } else {
    console.info("New lead submitted", lead);
  }

  return NextResponse.json({ ok: true });
}
