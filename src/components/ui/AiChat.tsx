"use client";

import { useEffect, useRef, useCallback, useState, KeyboardEvent, RefObject, ReactNode } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
    ImageIcon,
    FileUp,
    Figma,
    MonitorIcon,
    CircleUserRound,
    ArrowUpIcon,
    Paperclip,
    PlusIcon,
} from "lucide-react";
import { ChatMessageList } from "./ChatMessageList";
import { ChatInput } from "./ChatInput";
import { ErrorBanner } from "./ErrorBanner";
import { ActionButton } from "./ActionButton";
import { useAiChat } from "@/hooks/useAiChat";
import ReactMarkdown from "react-markdown";
import { Loader } from "./Loader";

export function AiChat() {
    const {
        value,
        messages,
        loading,
        error,
        voiceReady,
        welcomeLoading,
        isSpeaking,
        textareaRef,
        chatEndRef,
        adjustHeight,
        handleInputFocus,
        handleKeyDown,
        handleSend,
        handleChange,
        toggleMessage,
        handleAbout,
        aboutLinks,
        hasClickedAbout,
    } = useAiChat();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen w-full max-w-4xl mx-auto p-4 space-y-8">
            <div className="w-full mb-4">
                <div className="relative bg-neutral-900 rounded-sm border border-neutral-800">
                    <ChatMessageList
                        messages={messages}
                        isSpeaking={isSpeaking}
                        loading={loading}
                        toggleMessage={toggleMessage}
                        chatEndRef={chatEndRef as RefObject<HTMLDivElement>}
                    />
                    {aboutLinks && (
                        <div className="mt-4 flex flex-col items-center gap-2">
                            {Object.entries(aboutLinks).map(([key, url]) => (
                                <ReactMarkdown
                                    key={key}
                                    components={{
                                        a: ({ children, ...props }) => (
                                            <a
                                                {...props}
                                                className="text-blue-500 underline prose prose-invert text-center"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                {children}
                                            </a>
                                        ),
                                    }}
                                >
                                    {`[${key.charAt(0).toUpperCase() + key.slice(1)}](${url})`}
                                </ReactMarkdown>
                            ))}
                        </div>
                    )}
                    <ChatInput
                        value={value}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        onFocus={handleInputFocus}
                        onSend={handleSend}
                        loading={loading}
                        welcomeLoading={welcomeLoading}
                        textareaRef={textareaRef as RefObject<HTMLTextAreaElement>}
                        disabled={loading || welcomeLoading}
                    />
                    <ErrorBanner error={error} />
                </div>
            </div>
            <div className="flex gap-4 mb-4">
                <ActionButton icon={<MonitorIcon className="w-5 h-5" />} label="Projects" />
                <ActionButton icon={<CircleUserRound className="w-5 h-5" />} label="About Me" onClick={handleAbout} disabled={hasClickedAbout} />
            </div>
        </div>
    );
}


