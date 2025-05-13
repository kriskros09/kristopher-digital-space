"use client";

import { RefObject, useState } from "react";
import {
    MonitorIcon,
    CircleUserRound,
    BriefcaseIcon,
} from "lucide-react";
import { ChatMessageList } from "./ChatMessageList";
import { ChatInput } from "./ChatInput";
import { ErrorBanner } from "@/components/ui/feedback/ErrorBanner";
import { ActionButton } from "@/components/ui/buttons/ActionButton";
import { useAiChat } from "@/hooks/useAiChat";
import { useFeatureFlags } from "@/hooks/useFeatureFlags";
import { Dock, DockItem, DockLabel, DockIcon } from "@/components/ui/dock";
import { dockNavigationItems } from "@/lib/constants";
import { useRouter } from "next/navigation";

export function AiChat() {
    const { flags } = useFeatureFlags();
    const [, setClickedIdx] = useState<number | null>(null);
    const router = useRouter();
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

    function handleExpertise() {
        router.push("/expertise");
    }

    function handleDockClick(item: typeof dockNavigationItems[number], idx: number) {
        if (item.title === "Projects") {
            handleProjects();
            setClickedIdx(idx);
        }
        if (item.title === "About me") {
            handleAbout();
            setClickedIdx(idx);
        }
        if (item.title === "Expertise") {
            handleExpertise();
        };
    }

    function isDockItemDisabled(item: typeof dockNavigationItems[number]) {
        if (item.title === "Projects") return hasClickedProjects;
        if (item.title === "About me") return hasClickedAbout;
        return false;
    }

    return (
        <div className={`${flags.showCpuArchitecture?.value ? 'absolute' : ''} w-full p-4 space-y-8`}>
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
            {flags.showButtonNavigation?.value && (
                <div className="flex gap-4 mb-4 justify-center">
                    {flags.showProjectsButton?.value && (
                        <ActionButton
                            icon={<MonitorIcon className="w-5 h-5" />}
                            label="Projects"
                            onClick={handleProjects}
                            disabled={hasClickedProjects}
                        />
                    )}
                    {flags.showAboutMeButton?.value && (
                        <ActionButton
                            icon={<CircleUserRound className="w-5 h-5" />}
                            label="About Me"
                            onClick={handleAbout}
                            disabled={hasClickedAbout}
                        />
                    )}
                    {flags.showExpertiseButton?.value && (
                        <ActionButton
                            icon={<BriefcaseIcon className="w-5 h-5" />}
                            label="Expertise"
                            onClick={handleExpertise}
                            disabled={false}
                        />
                    )}
                </div>
            )}
            {flags.showDockNavigation?.value && (
                <div className='absolute bottom-30 lg:bottom-10 left-1/2 max-w-full -translate-x-1/2'>
                    <Dock className='gradient-border items-end pb-3'>
                        {dockNavigationItems.map((item, idx) => (
                            <DockItem
                                key={idx}
                                className="aspect-square rounded-full bg-neutral-800"
                                onClick={() => handleDockClick(item, idx)}
                                disabled={isDockItemDisabled(item)}
                            >
                                <DockLabel className='text-white bg-neutral-800 border-none'>{item.title}</DockLabel>
                                <DockIcon>{item.icon}</DockIcon>
                            </DockItem>
                        ))}
                    </Dock>
                </div>
            )}
        </div>
    );
}


