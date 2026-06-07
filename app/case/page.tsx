import type { Metadata } from "next";
import { CasePage } from "@/components/case-page";

export const metadata: Metadata = {
  title: "即答AI客服案例体验 - 手机打开即可试用",
  description:
    "即答AI客服案例体验页，适合从小红书、抖音和公众号进入，直接体验AI客服如何回答价格、搭建周期、适用场景和转人工问题。",
  alternates: {
    canonical: "/case",
  },
  openGraph: {
    title: "即答AI客服案例体验",
    description: "手机打开即可体验即答AI客服，了解小微企业如何用AI接住重复咨询。",
    type: "website",
    locale: "zh_CN",
  },
};

export default function Page() {
  return <CasePage />;
}
