"use client";

import { RefObject } from "react";
import {
    MonitorIcon,
    CircleUserRound,
} from "lucide-react";
import { ChatMessageList } from "./ChatMessageList";
import { ChatInput } from "./ChatInput";
import { ErrorBanner } from "./ErrorBanner";
import { ActionButton } from "./ActionButton";
import { useAiChat } from "@/hooks/useAiChat";

export function AiChat() {
    const {
        value,
        messages,
        loading,
        error,
        welcomeLoading,
        isSpeaking,
        textareaRef,
        chatEndRef,
        handleInputFocus,
        handleKeyDown,
        handleSend,
        handleChange,
        toggleMessage,
        handleAbout,
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


