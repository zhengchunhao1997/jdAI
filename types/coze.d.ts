export {};

declare global {
  interface Window {
    __jidahCozeChatClient?: {
      open?: () => void;
      show?: () => void;
      showChat?: () => void;
      toggle?: () => void;
    };
    __jidahCozeChatMounted?: boolean;
  }
}
