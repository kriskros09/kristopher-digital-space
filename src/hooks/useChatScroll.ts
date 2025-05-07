import { ChatMessage } from "@/features/aiChat/aiChatSlice";
import { useRef, useCallback, useEffect } from "react";

interface ChatScrollProps {
  messages: ChatMessage[];
  loading: boolean;
  welcomeLoading: boolean;
  isSpeaking: boolean;
}

export function useChatScroll({messages, loading, welcomeLoading, isSpeaking}: ChatScrollProps) {
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToEnd = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToEnd();
  }, [messages, loading, welcomeLoading, isSpeaking, scrollToEnd]);

  return { chatEndRef, scrollToEnd };
} 