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
    __jidahCozeChatClient?: {
      open?: () => void;
      showChat?: () => void;
    };
    __jidahCozeChatMounted?: boolean;
  }
}
