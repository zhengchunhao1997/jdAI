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
            <button
              id="jidah-coze-fallback"
              type="button"
              aria-label="打开即答AI客服"
              style={{
                position: "fixed",
                right: 24,
                bottom: 24,
                zIndex: 2147483647,
                display: "none",
                alignItems: "center",
                gap: 8,
                border: 0,
                borderRadius: 999,
                background: "#4F46E5",
                color: "#fff",
                boxShadow: "0 14px 35px rgba(79, 70, 229, 0.32)",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 700,
                padding: "12px 16px",
              }}
            >
              <span aria-hidden="true">💬</span>
              AI客服
            </button>
            <script src="https://lf-cdn.coze.cn/obj/unpkg/flow-platform/chat-app-sdk/1.2.0-beta.19/libs/cn/index.js" />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  (function () {
                    var token = ${JSON.stringify(cozeToken)};
                    var fallback = document.getElementById('jidah-coze-fallback');

                    function log(message, detail) {
                      if (detail) {
                        console.warn('[jidah-coze]', message, detail);
                      } else {
                        console.warn('[jidah-coze]', message);
                      }
                    }

                    function findCozeLauncher() {
                      var selectors = [
                        '[class*="coze" i]',
                        '[id*="coze" i]',
                        '[class*="chat" i]',
                        '[id*="chat" i]',
                        '[aria-label*="chat" i]',
                        '[aria-label*="客服" i]',
                        '[role="button"]',
                        'button'
                      ].join(',');
                      var elements = Array.prototype.slice.call(document.querySelectorAll(selectors));
                      return elements.find(function (element) {
                        if (element.id === 'jidah-coze-fallback') return false;
                        var rect = element.getBoundingClientRect();
                        var style = window.getComputedStyle(element);
                        var classAndId = String(element.className || '') + ' ' + String(element.id || '');
                        var label = String(element.getAttribute('aria-label') || '');
                        var isVisible = rect.width > 24 && rect.height > 24 && style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) !== 0;
                        var isFloating = style.position === 'fixed' || (rect.right > window.innerWidth - 160 && rect.bottom > window.innerHeight - 180);
                        var looksLikeCoze = /coze|chat/i.test(classAndId) || /chat|客服/i.test(label);
                        return isVisible && isFloating && looksLikeCoze;
                      });
                    }

                    function openCoze() {
                      var client = window.__jidahCozeChatClient;
                      try {
                        if (client && typeof client.showChat === 'function') {
                          client.showChat();
                          return;
                        }
                        if (client && typeof client.open === 'function') {
                          client.open();
                          return;
                        }
                      } catch (error) {
                        log('open method failed', error);
                      }

                      var launcher = findCozeLauncher();
                      if (launcher) {
                        launcher.click();
                      } else {
                        initCoze();
                      }
                    }

                    function initCoze() {
                      if (!window.CozeWebSDK || window.__jidahCozeChatMounted) return;
                      try {
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
                        window.__jidahCozeReady = true;
                      } catch (error) {
                        window.__jidahCozeChatMounted = false;
                        log('init failed', error);
                      }
                    }

                    if (fallback) {
                      fallback.addEventListener('click', openCoze);
                    }

                    var tries = 0;
                    var timer = window.setInterval(function () {
                      tries += 1;
                      initCoze();
                      if (window.__jidahCozeChatMounted || tries > 50) {
                        window.clearInterval(timer);
                        window.setTimeout(function () {
                          if (fallback && !findCozeLauncher()) {
                            fallback.style.display = 'inline-flex';
                          }
                        }, 800);
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
