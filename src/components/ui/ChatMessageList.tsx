import React from "react";
import { ChatMessage } from "./ChatMessage";
import { Loader } from "./Loader";

export interface ChatMessageListProps {
  messages: {
    sender: "user" | "ai";
    text: string;
    isExpanded?: boolean;
    type?: string;
  }[];
  isSpeaking: boolean;
  loading: boolean;
  toggleMessage: (index: number) => void;
  chatEndRef: React.RefObject<HTMLDivElement>;
}

export function ChatMessageList({ messages, isSpeaking, loading, toggleMessage, chatEndRef }: ChatMessageListProps) {
  // Add a virtual loader message if loading or isSpeaking
  const showLoader = loading || isSpeaking;
  const allMessages = showLoader
    ? [...messages, { sender: "ai" as const, type: "loader", text: "" }]
    : messages;

  return (
    <div className="h-64 overflow-y-auto p-4 flex flex-col gap-2">
      {allMessages.map((msg, i) => (
        <ChatMessage
          key={i}
          msg={msg}
          isMostRecentMessage={i === allMessages.length - 1}
          isSpeaking={isSpeaking}
          isLoader={msg.type === "loader"}
          onToggle={() => toggleMessage(i)}
          index={i}
        />
      ))}
      <div ref={chatEndRef} />
    </div>
  );
} 