"use client";

import { useMemo } from "react";
import { ChatPanel } from "@/components/chat-panel";

export function ChatPage() {
  const initialQuestion = useMemo(() => {
    if (typeof window === "undefined") {
      return null;
    }

    return new URLSearchParams(window.location.search).get("q");
  }, []);

  return (
    <main className="h-screen bg-[#f7f8ff] dark:bg-[#0f1024]">
      <ChatPanel mode="full" initialQuestion={initialQuestion} />
    </main>
  );
}
