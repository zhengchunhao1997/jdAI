import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "即答 - 小微企业个性化AI智能客服搭建服务",
  description:
    "即答为小微企业提供个性化AI智能客服搭建服务，支持7x24在线、企业专属知识库、多轮对话、转人工和多渠道接入。",
  keywords: ["即答", "AI客服", "智能客服", "小微企业", "客服系统", "知识库"],
  openGraph: {
    title: "即答 - 让每个小微企业都拥有专业AI客服",
    description: "7x24在线，懂你的业务，会引导转化，599元/月起。",
    type: "website",
    locale: "zh_CN",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
