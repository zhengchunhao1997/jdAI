import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "即答 - 中小企业AI客服试跑与Coze工作流搭建",
  description:
    "即答基于Coze工作流为中小企业搭建AI客服，先做免费客服效率诊断，处理价格、发货、售后、预约、报名等重复咨询，3-5天上线试跑。",
  keywords: ["即答", "AI客服", "智能客服", "中小企业", "Coze工作流", "客服系统", "知识库"],
  openGraph: {
    title: "即答 - 先让AI接住中小企业的重复咨询",
    description: "免费客服效率诊断，基于Coze工作流搭建AI客服，3-5天上线试跑。",
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
  const cozeToken = process.env.NEXT_PUBLIC_COZE_PAT;

  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        {children}
        {cozeToken ? (
          <>
            <script src="https://lf-cdn.coze.cn/obj/unpkg/flow-platform/chat-app-sdk/1.2.0-beta.19/libs/cn/index.js" />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  (function () {
                    var token = ${JSON.stringify(cozeToken)};
                    function initCoze() {
                      if (!window.CozeWebSDK || window.__jidahCozeChatMounted) return;
                      window.__jidahCozeChatMounted = true;
                      window.__jidahCozeChatClient = new window.CozeWebSDK.WebChatClient({
                        config: {
                          bot_id: '7647543972197892159',
                        },
                        componentProps: {
                          title: '即答AI客服',
                        },
                        auth: {
                          type: 'token',
                          token: token,
                          onRefreshToken: function () {
                            return token;
                          }
                        }
                      });
                    }
                    var tries = 0;
                    var timer = window.setInterval(function () {
                      tries += 1;
                      initCoze();
                      if (window.__jidahCozeChatMounted || tries > 50) {
                        window.clearInterval(timer);
                      }
                    }, 100);
                  })();
                `,
              }}
            />
          </>
        ) : null}
      </body>
    </html>
  );
}
