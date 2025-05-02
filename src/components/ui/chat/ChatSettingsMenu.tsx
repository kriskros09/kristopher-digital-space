import { useState } from "react";
import {  Settings } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/modals/dialog";
import { useDispatch, useSelector } from "react-redux";
import { clearMessages } from "@/features/aiChat/aiChatSlice";
import { persistor } from "@/app/store";
import { toast } from "sonner";
import type { RootState } from "@/app/store";

export function ChatSettingsMenu() {
  const dispatch = useDispatch();
  const messages = useSelector((state: RootState) => state.aiChat.messages);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleClearChat = async () => {
    dispatch(clearMessages());
    await persistor.purge();
    toast.success("Chat history cleared.");
    setDialogOpen(false);
  };

  const handleClearChatRequest = () => {
    if (!messages || messages.length === 0) {
      toast("Your chat history is already cleared.");
      return;
    }
    setDialogOpen(true);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="ml-1 p-2 rounded-lg hover:border-zinc-600 hover:bg-zinc-800 text-zinc-400 flex items-center"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={handleClearChatRequest}>
            Clear chat
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-neutral-900 gradient-border">
          <DialogHeader>
            <DialogTitle className="text-white">Clear chat history?</DialogTitle>
          </DialogHeader>
          <div className="py-2 text-sm text-white">
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
    </>
  );
} 