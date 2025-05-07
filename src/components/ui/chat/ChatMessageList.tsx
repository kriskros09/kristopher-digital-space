import { RefObject } from "react";
import { ChatMessage } from "./ChatMessage";
import { Project } from "@/features/aiChat/aiChatSlice";

export interface ChatMessageListProps {
  messages: {
    sender: "user" | "ai";
    text: string;
    isExpanded?: boolean;
    type?: string;
    contacts?: { name: string; url: string }[];
    project?: Project;
  }[];
  isSpeaking: boolean;
  loading: boolean;
  toggleMessage: (index: number) => void;
  chatEndRef: RefObject<HTMLDivElement>;
  loaderStep: 'idle' | 'thinking' | 'processing' | 'speaking';
  onSkip: () => void;
}

export function ChatMessageList({ messages, isSpeaking, loading, toggleMessage, chatEndRef, loaderStep, onSkip }: ChatMessageListProps) {
  // Add a virtual loader message if loading or isSpeaking
  const showLoader = loading || isSpeaking;
  const allMessages = showLoader
    ? [...messages, { sender: "ai" as const, type: "loader", text: "" }]
    : messages;

  return (
    <div className="chat-message-list overflow-y-scroll p-4 flex flex-col gap-2 h-[470px] lg:h-[600px] xl:h-[500px] 2xl:h-[700px]">
      {allMessages.map((msg, i) => (
        <ChatMessage
          key={i}
          msg={msg}
          isMostRecentMessage={i === allMessages.length - 1}
          isSpeaking={isSpeaking}
          isLoader={msg.type === "loader"}
          loaderStep={msg.type === "loader" ? loaderStep : undefined}
          onSkip={msg.type === "loader" ? onSkip : undefined}
          onToggle={() => toggleMessage(i)}
          index={i}
        />
      ))}
      <div ref={chatEndRef} />
    </div>
  );
} 