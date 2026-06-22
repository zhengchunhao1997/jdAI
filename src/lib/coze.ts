type CozeWorkflowParams = Record<string, unknown>;

export type CozeMainReply = {
  answer: string;
  suggested_questions?: string[];
  need_handoff?: boolean;
  handoff_reason?: string;
  knowledge_used?: boolean;
  raw?: unknown;
};

export type XiaolanmaoWorkflowReply = {
  answer: string;
  raw?: unknown;
};

const apiBaseUrl = process.env.COZE_API_BASE_URL ?? "https://api.coze.com";

function getToken() {
  const token = process.env.COZE_API_TOKEN;

  if (!token) {
    throw new Error("COZE_API_TOKEN is not configured");
  }

  return token;
}

export async function runCozeWorkflow<T>(
  workflowId: string | undefined,
  parameters: CozeWorkflowParams,
): Promise<T> {
  if (!workflowId) {
    throw new Error("Coze workflow id is not configured");
  }

  const response = await fetch(`${apiBaseUrl}/v1/workflows/run`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      workflow_id: workflowId,
      parameters,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Coze workflow failed: ${response.status} ${errorText}`);
  }

  const payload = await response.json();
  return parseCozePayload<T>(payload);
}

export async function runXiaolanmaoWorkflow(input: {
  nickname: string;
  userId: string;
  userMessage: string;
}): Promise<XiaolanmaoWorkflowReply> {
  const workflowId = process.env.COZE_XIAOLANMAO_WORKFLOW_ID ?? "7653456639388303412";
  const token = process.env.COZE_XIAOLANMAO_API_TOKEN ?? process.env.COZE_API_TOKEN;
  const workflowBaseUrl = process.env.COZE_XIAOLANMAO_API_BASE_URL ?? "https://api.coze.cn";

  if (!token) {
    return {
      answer: mockXiaolanmaoReply(input.userMessage).answer,
      raw: { provider: "mock", reason: "missing token" },
    };
  }

  const response = await fetch(`${workflowBaseUrl}/v1/workflow/stream_run`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      workflow_id: workflowId,
      parameters: {
        nickname: input.nickname,
        user_id: input.userId,
        user_message: input.userMessage,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Coze xiaolanmao workflow failed: ${response.status} ${errorText}`);
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const payload = await response.json();
    const parsed = extractAnswerFromPayload(payload);
    return { answer: parsed.answer, raw: payload };
  }

  return parseWorkflowStreamResponse(response);
}

function parseCozePayload<T>(payload: unknown): T {
  if (!payload || typeof payload !== "object") {
    return payload as T;
  }

  const record = payload as Record<string, unknown>;
  const data = record.data;

  if (typeof data === "string") {
    try {
      return JSON.parse(data) as T;
    } catch {
      return { answer: data, raw: payload } as T;
    }
  }

  if (data && typeof data === "object") {
    return data as T;
  }

  return payload as T;
}

export async function runMainChatflow(input: {
  userMessage: string;
  conversationHistory: string;
  merchantName?: string;
  visitorId?: string;
  conversationName?: string;
  productContext?: string;
}) {
  if (!process.env.COZE_API_TOKEN || !process.env.COZE_MAIN_WORKFLOW_ID || !process.env.COZE_BOT_ID) {
    return mockMainReply(input.userMessage, input.productContext);
  }

  let result: Awaited<ReturnType<typeof runCozeChat>>;

  try {
    result = await runCozeChat({
      botId: process.env.COZE_BOT_ID,
      workflowId: process.env.COZE_MAIN_WORKFLOW_ID,
      userId: input.visitorId ?? "website-visitor",
      userMessage: input.userMessage,
      conversationHistory: input.conversationHistory,
      conversationName: input.conversationName ?? "Default",
      productContext: input.productContext,
    });
  } catch (error) {
    const fallback = mockMainReply(input.userMessage, input.productContext);
    return {
      ...fallback,
      raw: {
        provider: "coze",
        status: "fallback",
        error: error instanceof Error ? error.message : String(error),
      },
    } satisfies CozeMainReply;
  }

  return {
    answer: result.answer,
    suggested_questions: result.suggestedQuestions,
    need_handoff: /人工|顾问|销售|报价|合同|退款|转接|联系/.test(result.answer),
    handoff_reason: /报价|价格|合同|退款/.test(`${input.userMessage}\n${result.answer}`)
      ? "客户问题需要人工进一步确认"
      : undefined,
    knowledge_used: true,
    raw: result.raw,
  } satisfies CozeMainReply;
}

async function runCozeChat(input: {
  botId: string;
  workflowId: string;
  userId: string;
  userMessage: string;
  conversationHistory: string;
  conversationName: string;
  productContext?: string;
}) {
  const response = await fetch(`${apiBaseUrl}/v3/chat`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      bot_id: input.botId,
      workflow_id: input.workflowId,
      user_id: input.userId,
      stream: true,
      additional_messages: [
        {
          content: input.userMessage,
          content_type: "text",
          role: "user",
          type: "question",
        },
      ],
      parameters: {
        CONVERSATION_NAME: input.conversationName,
        CONVERSATION_HISTORY: input.conversationHistory,
        USER_INPUT: input.userMessage,
        PRODUCT_CONTEXT: input.productContext ?? "",
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Coze chat failed: ${response.status} ${errorText}`);
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const payload = await response.json();
    assertSuccessfulCozePayload(payload);
    const parsed = extractAnswerFromPayload(payload);
    return { answer: parsed.answer, suggestedQuestions: parsed.suggestedQuestions, raw: payload };
  }

  if (!response.body) {
    const payload = await response.json();
    assertSuccessfulCozePayload(payload);
    const parsed = extractAnswerFromPayload(payload);
    return { answer: parsed.answer, suggestedQuestions: parsed.suggestedQuestions, raw: payload };
  }

  return parseCozeSseResponse(response);
}

async function parseCozeSseResponse(response: Response) {
  const reader = response.body?.getReader();
  if (!reader) return { answer: "", raw: [] };

  const decoder = new TextDecoder();
  const events: Array<{ event: string; data: unknown }> = [];
  let buffer = "";
  let deltaAnswer = "";
  let completedAnswer: ParsedAnswer | null = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split(/\n\n/);
    buffer = parts.pop() ?? "";

    for (const part of parts) {
      const parsed = parseSseEvent(part);
      if (!parsed) continue;

      events.push(parsed);

      if (parsed.event.toLowerCase() === "error") {
        throw new Error(`Coze chat stream error: ${JSON.stringify(parsed.data)}`);
      }

      if (!parsed.data || typeof parsed.data !== "object") continue;
      const data = parsed.data as Record<string, unknown>;
      const isAnswerMessage = data.type === undefined || data.type === "answer";

      if (isAnswerMessage && typeof data.content === "string") {
        if (parsed.event === "conversation.message.delta") {
          deltaAnswer += data.content;
        }

        if (parsed.event === "conversation.message.completed") {
          completedAnswer = extractAnswerContent(data.content);
        }
      }
    }
  }

  if (completedAnswer?.answer) {
    return {
      answer: completedAnswer.answer,
      suggestedQuestions: completedAnswer.suggestedQuestions,
      raw: events,
    };
  }

  if (deltaAnswer) {
    const parsedDelta = extractAnswerContent(deltaAnswer);
    return {
      answer: parsedDelta.answer,
      suggestedQuestions: parsedDelta.suggestedQuestions,
      raw: events,
    };
  }

  return {
    ...mockMainReply(""),
    raw: events,
  };
}

async function parseWorkflowStreamResponse(response: Response): Promise<XiaolanmaoWorkflowReply> {
  const reader = response.body?.getReader();
  if (!reader) return { answer: "我已收到你的问题。", raw: [] };

  const decoder = new TextDecoder();
  const events: Array<{ event: string; data: unknown }> = [];
  let buffer = "";
  const chunks: string[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split(/\n\n/);
    buffer = parts.pop() ?? "";

    for (const part of parts) {
      const parsed = parseSseEvent(part);
      if (!parsed) continue;
      events.push(parsed);

      if (parsed.event.toLowerCase() === "error") {
        throw new Error(`Coze workflow stream error: ${formatCozeError(parsed.data)}`);
      }

      const text = extractWorkflowText(parsed.data);
      if (text) chunks.push(text);
    }
  }

  if (buffer.trim()) {
    const parsed = parseSseEvent(buffer);
    if (parsed) {
      events.push(parsed);
      const text = extractWorkflowText(parsed.data);
      if (text) chunks.push(text);
    }
  }

  const answer = normalizeWorkflowAnswer(chunks.join(""));
  if (!answer) {
    throw new Error("Coze workflow returned empty output. 请检查工作流 End 节点是否把回答字段映射到 output。");
  }

  return { answer, raw: events };
}

function assertSuccessfulCozePayload(payload: unknown) {
  if (!payload || typeof payload !== "object") return;

  const record = payload as Record<string, unknown>;
  const code = record.code;
  const isSuccessCode = code === undefined || code === 0 || code === "0";

  if (!isSuccessCode) {
    const message = typeof record.msg === "string" ? record.msg : JSON.stringify(payload);
    throw new Error(`Coze chat returned code ${String(code)}: ${message}`);
  }
}

function parseSseEvent(chunk: string) {
  const lines = chunk.split(/\r?\n/);
  const event = lines
    .find((line) => line.startsWith("event:"))
    ?.slice("event:".length)
    .trim();
  const dataText = lines
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice("data:".length).trim())
    .join("\n");

  if (!event && !dataText) return null;

  let data: unknown = dataText;
  if (dataText && dataText !== "[DONE]") {
    try {
      data = JSON.parse(dataText);
    } catch {
      data = dataText;
    }
  }

  return { event: event ?? "message", data };
}

type ParsedAnswer = {
  answer: string;
  suggestedQuestions: string[];
};

function extractAnswerFromPayload(payload: unknown): ParsedAnswer {
  if (!payload || typeof payload !== "object") return { answer: "我已收到你的问题。", suggestedQuestions: [] };

  const record = payload as Record<string, unknown>;
  const data = record.data;

  if (data && typeof data === "object") {
    const dataRecord = data as Record<string, unknown>;
    if (typeof dataRecord.content === "string") return extractAnswerContent(dataRecord.content);
    if (typeof dataRecord.answer === "string") return extractAnswerContent(dataRecord.answer);
  }

  if (typeof record.content === "string") return extractAnswerContent(record.content);
  if (typeof record.answer === "string") return extractAnswerContent(record.answer);

  return { answer: "我已收到你的问题。", suggestedQuestions: [] };
}

function extractAnswerContent(content: string): ParsedAnswer {
  try {
    const parsed = JSON.parse(content) as unknown;
    if (parsed && typeof parsed === "object") {
      const record = parsed as Record<string, unknown>;
      const suggestedQuestions = extractSuggestedQuestions(record);
      for (const key of ["answer", "output", "reply", "content", "text"]) {
        if (typeof record[key] === "string") {
          return { answer: record[key], suggestedQuestions };
        }
      }
    }
  } catch {
    // Coze answer content is usually plain text. JSON is only used by some workflows.
  }

  return { answer: content, suggestedQuestions: [] };
}

function extractWorkflowText(data: unknown): string {
  if (typeof data === "string") {
    if (!data || data === "[DONE]") return "";
    return extractAnswerContent(data).answer;
  }

  if (!data || typeof data !== "object") return "";
  const record = data as Record<string, unknown>;

  for (const key of ["answer", "output", "content", "text", "reply"]) {
    if (typeof record[key] === "string") return extractAnswerContent(record[key]).answer;
  }

  const nestedData = record.data;
  if (typeof nestedData === "string") return extractAnswerContent(nestedData).answer;
  if (nestedData && typeof nestedData === "object") return extractWorkflowText(nestedData);

  return "";
}

function normalizeWorkflowAnswer(value: string) {
  const answer = value
    .replace(/\{\"msg_type\":\"generate_answer_finish\"[\s\S]*$/, "")
    .replace(/\s+/g, " ")
    .trim();

  return answer;
}

function formatCozeError(data: unknown) {
  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    return String(record.error_message ?? record.msg ?? JSON.stringify(data));
  }

  return String(data);
}

function extractSuggestedQuestions(record: Record<string, unknown>) {
  const value = record.suggested_questions ?? record.suggestedQuestions ?? record.questions;
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 3);
}

export async function runLeadWorkflow(input: { conversationHistory: string }) {
  if (!process.env.COZE_API_TOKEN || !process.env.COZE_LEAD_WORKFLOW_ID) {
    return mockLeadResult(input.conversationHistory);
  }

  return runCozeWorkflow<LeadWorkflowResult>(process.env.COZE_LEAD_WORKFLOW_ID, {
    conversation_history: input.conversationHistory,
  });
}

export async function runSummaryWorkflow(input: { conversationHistory: string }) {
  if (!process.env.COZE_API_TOKEN || !process.env.COZE_SUMMARY_WORKFLOW_ID) {
    return { summary: mockSummary(input.conversationHistory) };
  }

  return runCozeWorkflow<{ summary: string }>(process.env.COZE_SUMMARY_WORKFLOW_ID, {
    conversation_history: input.conversationHistory,
  });
}

export async function runMissedWorkflow(input: {
  userText: string;
  answer: string;
}) {
  if (!process.env.COZE_API_TOKEN || !process.env.COZE_MISSED_WORKFLOW_ID) {
    return mockMissedResult(input);
  }

  return runCozeWorkflow<MissedWorkflowResult>(process.env.COZE_MISSED_WORKFLOW_ID, {
    user_text: input.userText,
    answer: input.answer,
  });
}

export async function runQualityWorkflow(input: {
  userText: string;
  answer: string;
}) {
  if (!process.env.COZE_API_TOKEN || !process.env.COZE_QUALITY_WORKFLOW_ID) {
    return mockQualityResult(`${input.userText}\n${input.answer}`);
  }

  return runCozeWorkflow<QualityWorkflowResult>(process.env.COZE_QUALITY_WORKFLOW_ID, {
    user_text: input.userText,
    answer: input.answer,
  });
}

export type LeadWorkflowResult = {
  name?: string;
  phone?: string;
  wechat?: string;
  company?: string;
  industry?: string;
  daily_consult_volume?: string;
  target_channel?: string;
  demand?: string;
  intent_level?: "HIGH" | "MEDIUM" | "LOW" | "NONE" | "UNKNOWN";
  tags?: string[];
  next_action?: string;
  need_follow_up?: boolean;
};

export type MissedWorkflowResult = {
  is_missed: boolean;
  question?: string;
  reason?: string;
  suggested_answer?: string;
};

export type QualityWorkflowResult = {
  risk_level: string;
  risk_flags: string[];
  should_handoff: boolean;
  reason?: string;
};

function mockMainReply(userMessage: string, productContext?: string): CozeMainReply {
  if (/小蓝帽|体重|减肥|瘦|身高|哺乳期|套餐/.test(`${productContext ?? ""}\n${userMessage}`)) {
    return mockXiaolanmaoReply(userMessage);
  }

  const asksPricing = /价格|多少钱|收费|报价/.test(userMessage);
  const asksChannel = /企业微信|小红书|抖音|公众号|网站/.test(userMessage);

  if (asksPricing) {
    return {
      answer:
        "价格会根据你的行业、每天咨询量、接入渠道和是否需要人工接管来评估。你可以先告诉我每天大概有多少咨询、主要想接哪个渠道，我可以帮你判断适合哪种方案。",
      suggested_questions: ["每天100个咨询适合哪种方案？", "可以先试用体验吗？", "报价前需要准备哪些信息？"],
      need_handoff: true,
      handoff_reason: "客户咨询价格，需要顾问进一步确认方案",
      knowledge_used: true,
    };
  }

  if (asksChannel) {
    return {
      answer:
        "网站聊天窗口可以作为第一版优先接入；企业微信、公众号、小红书或抖音需要根据接口权限和使用场景评估。你们现在主要在哪个渠道接待客户？",
      suggested_questions: ["企业微信接入多久能上线？", "我们现在用企微群可以接吗？", "每天100个咨询适合吗？"],
      need_handoff: true,
      handoff_reason: "客户咨询渠道接入，需要确认接口条件",
      knowledge_used: true,
    };
  }

  return {
    answer:
      "即答 AI客服是一套面向商家的 AI 售前客服系统，可以 7x24 小时接待咨询，基于知识库回答问题，识别高意向线索，并在复杂问题上转人工。你可以告诉我你的行业和每天咨询量，我先帮你判断是否适合。",
    suggested_questions: ["可以接入网站和企业微信吗？", "如果客户问价格会怎么处理？", "后台能看到哪些线索？"],
    need_handoff: false,
    knowledge_used: true,
  };
}

function mockXiaolanmaoReply(userMessage: string): CozeMainReply {
  const asksRisk = /哺乳|怀孕|孕期|疾病|高血压|糖尿病|用药|药/.test(userMessage);
  const asksPrice = /价格|多少钱|套餐|买几套|费用/.test(userMessage);
  const hasProfile = /身高|体重|目标|斤|kg|KG|cm|CM|\d{2,3}/.test(userMessage);

  if (asksRisk) {
    return {
      answer:
        "你提到的情况涉及健康风险，小蓝帽 AI 客服不能替代医生判断。建议先咨询医生或人工顾问确认是否适合使用。你也可以补充身高、体重、目标体重和当前身体情况，我帮你整理给顾问继续跟进。",
      suggested_questions: ["可以转人工顾问吗？", "需要提供哪些身体信息？", "哪些人不建议使用？"],
      need_handoff: true,
      handoff_reason: "客户咨询健康风险，需要人工确认",
      knowledge_used: true,
    };
  }

  if (asksPrice) {
    return {
      answer:
        "小蓝帽的套餐通常会根据你的当前体重、目标体重和周期来推荐。你可以先告诉我身高、体重、目标体重，以及主要顾虑是价格、效果还是反弹，我再帮你判断适合咨询哪种套餐。涉及最终价格和下单，我会建议转人工确认。",
      suggested_questions: ["我适合买几套？", "可以转人工下单吗？", "多久能看到效果？"],
      need_handoff: true,
      handoff_reason: "客户咨询套餐价格，需要人工承接",
      knowledge_used: true,
    };
  }

  if (hasProfile) {
    return {
      answer:
        "收到。为了更准确推荐小蓝帽方案，我还需要确认三个信息：你的目标体重是多少、希望多久达成、有没有哺乳期/孕期/基础疾病或正在用药的情况。确认后我可以帮你判断是先了解基础方案，还是直接转人工顾问给你做套餐建议。",
      suggested_questions: ["目标一个月瘦多少合适？", "我适合买几套？", "帮我转人工顾问"],
      need_handoff: false,
      knowledge_used: true,
    };
  }

  return {
    answer:
      "我是小蓝帽 AI 体重管理顾问。你可以直接告诉我身高、体重、目标体重和主要顾虑，比如价格、效果、安全或反弹。我会先帮你整理需求，适合下单或需要确认健康情况时再转人工顾问。",
    suggested_questions: ["小蓝帽多少钱一套？", "多久能看到效果？", "会不会反弹？"],
    need_handoff: false,
    knowledge_used: true,
  };
}

function mockLeadResult(history: string): LeadWorkflowResult {
  const highIntent = /价格|报价|企业微信|合同|套餐|试用|部署/.test(history);
  return {
    intent_level: highIntent ? "HIGH" : "MEDIUM",
    tags: [
      /企业微信/.test(history) ? "企业微信接入" : "功能咨询",
      /价格|报价|套餐/.test(history) ? "关注价格" : "了解产品",
    ],
    demand: history.slice(-300),
    next_action: highIntent ? "销售今天内跟进，确认渠道和报价方案。" : "发送产品介绍，继续观察试用意向。",
    need_follow_up: highIntent,
  };
}

function mockSummary(history: string) {
  if (/企业微信/.test(history)) {
    return "客户关注企业微信接入和价格方案，已触发人工跟进建议。";
  }

  if (/价格|报价/.test(history)) {
    return "客户正在了解价格和适用方案，需要销售进一步确认咨询量与接入渠道。";
  }

  return "客户咨询即答 AI客服能力，AI 已介绍售前接待、知识库问答、线索识别和人工接管能力。";
}

function mockMissedResult(input: { userText: string; answer: string }): MissedWorkflowResult {
  const text = `${input.userText}\n${input.answer}`;
  const isMissed = /不确定|暂不清楚|没找到|无法确认|需要确认/.test(text);
  return {
    is_missed: isMissed,
    question: isMissed ? input.userText : undefined,
    reason: isMissed ? "当前知识库缺少明确答案" : undefined,
    suggested_answer: isMissed ? "补充该问题的标准回答，并标注是否需要转人工。" : undefined,
  };
}

function mockQualityResult(text: string): QualityWorkflowResult {
  const riskFlags = ["价格", "报价", "合同", "退款", "投诉", "法律", "医疗"].filter((keyword) =>
    text.includes(keyword),
  );

  return {
    risk_level: riskFlags.length > 0 ? "medium" : "low",
    risk_flags: riskFlags,
    should_handoff: riskFlags.length > 0,
    reason: riskFlags.length > 0 ? "涉及高风险或需人工确认的问题" : undefined,
  };
}
