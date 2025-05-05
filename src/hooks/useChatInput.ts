import { useCallback, KeyboardEvent } from "react";

interface UseChatInputProps {
  value: string;
  loading: boolean;
  sendMessage: (msg: string) => void;
  resetValue: () => void;
  adjustHeight: (reset?: boolean) => void;
}

export function useChatInput({ value, loading, sendMessage, resetValue, adjustHeight }: UseChatInputProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !loading) {
        sendMessage(value.trim());
        resetValue();
        adjustHeight(true);
      }
    }
  }, [value, loading, sendMessage, resetValue, adjustHeight]);

  const handleSend = useCallback(() => {
    if (value.trim() && !loading) {
      sendMessage(value.trim());
      resetValue();
      adjustHeight(true);
    }
  }, [value, loading, sendMessage, resetValue, adjustHeight]);

  return { handleKeyDown, handleSend };
} 