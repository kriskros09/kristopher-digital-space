import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUpIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ChatInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onFocus: () => void;
  onSend: () => void;
  loading: boolean;
  welcomeLoading: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  disabled: boolean;
}

export function ChatInput({
  value,
  onChange,
  onKeyDown,
  onFocus,
  onSend,
  loading,
  welcomeLoading,
  textareaRef,
  disabled,
}: ChatInputProps) {
  return (
    <div className="flex items-center justify-end p-3 border-t border-neutral-800">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        placeholder="Ask me a question..."
        className={cn(
          "w-full px-4 py-3",
          "resize-none",
          "bg-transparent",
          "border-none",
          "text-white text-sm",
          "focus:outline-none",
          "focus-visible:ring-0 focus-visible:ring-offset-0",
          "placeholder:text-neutral-500 placeholder:text-sm",
          "min-h-[60px]"
        )}
        style={{
          overflow: "hidden",
        }}
        disabled={disabled}
      />
      <button
        type="button"
        onClick={onSend}
        className={cn(
          "ml-2 px-1.5 py-1.5 rounded-lg text-sm transition-colors border border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800 flex items-center justify-between gap-1",
          value.trim() && !loading && !welcomeLoading
            ? "bg-white text-black"
            : "text-zinc-400"
        )}
        disabled={!value.trim() || loading || welcomeLoading}
        aria-label="Send"
      >
        {loading || welcomeLoading ? (
          <span className="w-4 h-4 animate-spin border-2 border-white border-t-transparent rounded-full inline-block" />
        ) : (
          <ArrowUpIcon
            className={cn(
              "w-4 h-4",
              value.trim() && !loading && !welcomeLoading
                ? "text-black"
                : "text-zinc-400"
            )}
          />
        )}
        <span className="sr-only">Send</span>
      </button>
    </div>
  );
} 