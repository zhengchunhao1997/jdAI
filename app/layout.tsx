import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "即答 - 小微企业个性化AI智能客服搭建服务",
  description:
    "即答为小微企业提供个性化AI智能客服搭建服务，基于企业知识库和Coze工作流处理重复咨询、留资引导和转人工，3-5天上线试跑，¥599/月起。",
  keywords: ["即答", "AI客服", "智能客服", "小微企业", "Coze工作流", "客服系统", "知识库"],
  openGraph: {
    title: "即答 - 让每个小微企业都拥有专业AI客服",
    description: "3天免费体验，基于企业知识库和Coze工作流搭建个性化AI智能客服。",
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
      <body suppressHydrationWarning>
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
