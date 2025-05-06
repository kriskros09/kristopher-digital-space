import { cn } from "@/lib/utils/twCn";
import { Loader } from "../feedback/Loader";
import ReactMarkdown from "react-markdown";
import { ContactIcons } from "../buttons/ContactIcons";
import { ProjectSlider } from "../project/ProjectSlider";
import { Project } from "@/features/aiChat/aiChatSlice";

export interface ChatMessageProps {
  msg: {
    sender: "user" | "ai";
    text: string;
    isExpanded?: boolean;
    type?: string;
    contacts?: { name: string; url: string }[];
    projects?: Project[];
  };
  isMostRecentMessage: boolean;
  isSpeaking: boolean;
  isLoader?: boolean;
  onToggle: () => void;
  index: number;
}

export function ChatMessage({ msg, isSpeaking, isLoader, onToggle }: ChatMessageProps) {
  if (isLoader) {
    return (
      <div className="flex items-start">
        <Loader variant={isSpeaking ? "dots" : "spinner"} text={isSpeaking ? "AI is speaking..." : "Thinking..."} />
      </div>
    );
  }

  if (msg.type === "contact-info" && msg.contacts) {
    return (
      <div className="flex items-start">
        <div className="inline-block px-3 py-4 rounded-lg max-w-[80%] addGlassmorphism-ai text-white flex flex-col items-center">
          <div className="mb-2 text-center text-base font-medium">You can contact Kristopher via</div>
          <ContactIcons contacts={msg.contacts} />
        </div>
      </div>
    );
  }

  if (msg.type === "project-list" && msg.projects && msg.projects.length > 0) {
    return (
      <div className="flex flex-col items-start w-full">
        <div className="inline-block py-4 rounded-lg max-w-[100%] text-white flex flex-col items-center w-full">
          <ProjectSlider projects={msg.projects} />
        </div>
      </div>
    );
  }

  if (msg.sender === "user") {
    return (
      <div className="text-right">
        <div className="inline-block px-3 py-2 rounded-lg max-w-[80%] addGlassmorphism-user text-white ml-auto">
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
        </div>
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
          "addGlassmorphism-ai text-white",
          "hover:bg-gray-700 transition-colors",
          "flex items-center gap-2"
        )}
      >
        <span className={cn(
          "text-xs",
          msg.isExpanded ? "text-white" : "text-gray-500"
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