"use client";

import { RefObject } from "react";
import {
    MonitorIcon,
    CircleUserRound,
} from "lucide-react";
import { ChatMessageList } from "./ChatMessageList";
import { ChatInput } from "./ChatInput";
import { ErrorBanner } from "@/components/ui/feedback/ErrorBanner";
import { ActionButton } from "@/components/ui/buttons/ActionButton";
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
        handleProjects,
        hasClickedProjects,
        loaderStep,
        skipSpeaking
    } = useAiChat();

    return (
        <div className="absolute w-full p-4 space-y-8">
            <div className="addGlassmorphism rounded-sm">
                <ChatMessageList
                    messages={messages}
                    isSpeaking={isSpeaking}
                    loading={loading}
                    toggleMessage={toggleMessage}
                    chatEndRef={chatEndRef as RefObject<HTMLDivElement>}
                    loaderStep={loaderStep}
                    onSkip={skipSpeaking}
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
            <div className="flex gap-4 mb-4">
                <ActionButton icon={<MonitorIcon className="w-5 h-5" />} label="Projects" onClick={handleProjects} disabled={hasClickedProjects} />
                <ActionButton icon={<CircleUserRound className="w-5 h-5" />} label="About Me" onClick={handleAbout} disabled={hasClickedAbout} />
            </div>
        </div>
    );
}


