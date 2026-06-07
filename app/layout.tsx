import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "即答AI客服",
  description:
    "即答为小微企业提供个性化AI智能客服搭建服务，基于企业知识库和Coze工作流处理重复咨询、留资引导和转人工，3-5天上线试跑，¥599/月起。",
  keywords: ["即答", "AI客服", "智能客服", "小微企业", "Coze工作流", "客服系统", "知识库"],
  openGraph: {
    title: "即答AI客服",
    description: "3天免费体验，基于企业知识库和Coze工作流搭建个性化AI智能客服。",
    type: "website",
    locale: "zh_CN",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/brand-logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
