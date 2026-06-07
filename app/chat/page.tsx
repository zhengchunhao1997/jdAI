import type { Metadata } from "next";
import { ChatPage } from "@/components/chat-page";

export const metadata: Metadata = {
  title: "即答AI客服体验 - 直接对话",
  description:
    "直接和即答AI客服演示助手对话，了解小微企业AI客服适用场景、价格方案、搭建周期和转人工规则。",
  alternates: {
    canonical: "/chat",
  },
};

export default function Page() {
  return <ChatPage />;
}
