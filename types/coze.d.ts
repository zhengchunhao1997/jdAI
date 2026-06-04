export {};

declare global {
  interface Window {
    CozeWebSDK?: {
      WebChatClient: new (options: {
        config: {
          bot_id: string;
        };
        componentProps?: {
          title?: string;
        };
        auth: {
          type: "token";
          token: string;
          onRefreshToken: () => string;
        };
      }) => unknown;
    };
    __jidahCozeChatMounted?: boolean;
  }
}
