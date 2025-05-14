import { ChangeEvent, KeyboardEvent, RefObject, useState } from "react";
import { Textarea } from "@/components/ui/chat/textarea";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils/twCn";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/modals/dialog";
import { useDispatch } from "react-redux";
import { clearMessages } from "@/features/aiChat/aiChatSlice";
import { persistor } from "@/app/store";
import { toast } from "sonner";
import { ChatSettingsMenu } from "@/components/ui/chat/ChatSettingsMenu";

export interface ChatInputProps {
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
  onFocus: () => void;
  onSend: () => void;
  loading: boolean;
  welcomeLoading: boolean;
  textareaRef: RefObject<HTMLTextAreaElement>;
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
  const dispatch = useDispatch();
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleClearChat = async () => {
    dispatch(clearMessages());
    await persistor.purge();
    toast.success("Chat history cleared.");
    setDialogOpen(false);
  };

  return (
    <div className="flex items-center justify-end p-3 border-t border-neutral-800 gap-2">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        placeholder="Ask me a question about Kristopher ..."
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
          "ml-2 p-2 rounded-lg text-sm transition-colors hover:border-zinc-600 hover:bg-zinc-800 flex items-center justify-between gap-1",
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
          <Send
            className={cn(
              "w-5 h-5",
              value.trim() && !loading && !welcomeLoading
                ? "text-black"
                : "text-zinc-400"
            )}
          />
        )}
        <span className="sr-only">Send</span>
      </button>
      <ChatSettingsMenu />
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear chat history?</DialogTitle>
          </DialogHeader>
          <div className="py-2 text-sm text-zinc-400">
            This will clear your chat history. Are you sure?
          </div>
          <DialogFooter>
            <button
              className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
              onClick={handleClearChat}
            >
              Yes, clear
            </button>
            <button
              className="px-4 py-2 rounded bg-zinc-700 text-white hover:bg-zinc-600"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 