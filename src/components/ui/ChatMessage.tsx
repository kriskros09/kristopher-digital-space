import React from "react";
import { cn } from "@/lib/utils";
import { Loader } from "./Loader";
import ReactMarkdown from "react-markdown";

export interface ChatMessageProps {
  msg: {
    sender: "user" | "ai";
    text: string;
    isExpanded?: boolean;
    type?: string;
  };
  isMostRecentMessage: boolean;
  isSpeaking: boolean;
  isLoader?: boolean;
  onToggle: () => void;
  index: number;
}

export function ChatMessage({ msg, isMostRecentMessage, isSpeaking, isLoader, onToggle, index }: ChatMessageProps) {
  if (isLoader) {
    return (
      <div className="flex items-start">
        <Loader variant={isSpeaking ? "dots" : "spinner"} text={isSpeaking ? "AI is speaking..." : "Thinking..."} />
      </div>
    );
  }
  if (msg.sender === "user") {
    return (
      <div className="text-right">
        <span className="inline-block px-3 py-2 rounded-lg max-w-[80%] bg-blue-600 text-white ml-auto">
          <ReactMarkdown
            components={{
              a: ({ children, ...props }) => (
                <a
                  {...props}
                  className="text-blue-200 underline prose prose-invert text-center"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {children}
                </a>
              ),
            }}
          >
            {msg.text}
          </ReactMarkdown>
        </span>
      </div>
    );
  }
  // AI message
  return (
    <div className="flex items-start">
      <button
        onClick={onToggle}
        className={cn(
          "inline-block px-3 py-2 rounded-lg max-w-[80%] text-left",
          "bg-gray-800 text-gray-100",
          "hover:bg-gray-700 transition-colors",
          "flex items-center gap-2"
        )}
      >
        <span className={cn(
          "text-xs",
          msg.isExpanded ? "text-gray-400" : "text-gray-500"
        )}>
          {msg.isExpanded ? "▼" : "▶"}
        </span>
        {msg.isExpanded ? (
          <span className="w-full">
            <ReactMarkdown
              components={{
                a: ({ children, ...props }) => (
                  <a
                    {...props}
                    className="text-blue-400 underline prose prose-invert text-center"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {children}
                  </a>
                ),
              }}
            >
              {msg.text}
            </ReactMarkdown>
          </span>
        ) : (
          <span className="text-gray-400">Click to view response</span>
        )}
      </button>
    </div>
  );
} 