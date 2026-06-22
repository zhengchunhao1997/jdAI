import type { Message } from "@prisma/client";

export function formatHistory(messages: Pick<Message, "senderType" | "content">[]) {
  return messages
    .map((message) => {
      const role =
        message.senderType === "VISITOR"
          ? "客户"
          : message.senderType === "AI"
            ? "AI客服"
            : message.senderType === "STAFF"
              ? "人工客服"
              : "系统";

      return `${role}: ${message.content}`;
    })
    .join("\n");
}

export function shouldCreateMissedJob(text: string) {
  return /不确定|需要确认|人工确认|暂不清楚|需要顾问|具体评估|没找到|无法确认/.test(text);
}

export function shouldCreateQualityJob(text: string) {
  return /价格|报价|合同|退款|发票|保证|承诺|投诉|赔偿|法律|医疗|金融|企业微信|小红书|抖音/.test(text);
}
