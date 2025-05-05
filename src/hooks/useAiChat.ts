import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/app/store";
import {
  setValue,
  addMessage,
  setLoading,
  setError,
  setVoiceReady,
  setWelcomeLoading,
  setIsSpeaking,
  toggleMessage as toggleMessageAction,
  resetValue,
  setHasVisited,
} from "@/features/aiChat/aiChatSlice";
import { useAutoResizeTextarea } from "@/hooks/useAutoResizeTextarea";
import { AI_VOICE_GREETING_INSTRUCTIONS, SYSTEM_PROMPT } from "@/server/constants/aiPrompts";
import projects from "@/knowledge/projects.json";
import { fetchAbout, fetchOpenAi, fetchTTS, sendChatMessage } from "@/lib/chatApi";
import { playAudio } from "@/lib/audio";
import { useChatScroll } from "@/hooks/useChatScroll";
import { useChatInput } from "@/hooks/useChatInput";
import { useState, useCallback } from "react";

export function useAiChat() {
  const dispatch = useDispatch<AppDispatch>();
  const state = useSelector((state: RootState) => state.aiChat);
  const { textareaRef, adjustHeight } = useAutoResizeTextarea();
  const [hasClickedAbout, setHasClickedAbout] = useState(false);
  const [hasClickedProjects, setHasClickedProjects] = useState(false);

  // Use chat scroll hook
  const { chatEndRef, scrollToEnd } = useChatScroll([
    state.messages,
    state.loading,
    state.welcomeLoading,
  ]);

  // Handler for About button
  const handleAbout = useCallback(async () => {
    setHasClickedAbout(true);
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      const { about } = await fetchAbout();
      const systemPromptWithKnowledge = `${SYSTEM_PROMPT}\n\n${about}`;
      const aiData = await fetchOpenAi(systemPromptWithKnowledge, "Tell me about Kristopher.");
      if (aiData.aiMessage) {
        dispatch(addMessage({ sender: "ai", text: aiData.aiMessage, isExpanded: false }));
        // Fetch TTS, but only set isSpeaking when audio actually starts
        const ttsData = await fetchTTS(aiData.aiMessage);
        if (ttsData.audioUrl) {
          let fallbackTimeout: ReturnType<typeof setTimeout> | null = null;
          const audio = playAudio(ttsData.audioUrl, {
            onPlay: () => dispatch(setIsSpeaking(true)),
            onEnd: () => {
              dispatch(setIsSpeaking(false));
              dispatch(setLoading(false));
              if (fallbackTimeout) clearTimeout(fallbackTimeout);
            },
          });
          audio.onloadedmetadata = () => {
            const duration = audio.duration && isFinite(audio.duration) ? audio.duration : 30;
            fallbackTimeout = setTimeout(() => {
              dispatch(setIsSpeaking(false));
              dispatch(setLoading(false));
            }, (duration + 2) * 1000);
          };
        } else {
          dispatch(setIsSpeaking(false));
          dispatch(setLoading(false));
        }
      } else {
        dispatch(addMessage({ sender: "ai", text: "Sorry, no response from AI.", isExpanded: false }));
        dispatch(setError(aiData.error || "Unknown error"));
        dispatch(setIsSpeaking(false));
        dispatch(setLoading(false));
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      dispatch(addMessage({ sender: "ai", text: "Sorry, no response from AI.", isExpanded: false }));
      dispatch(setError(errorMsg));
      dispatch(setIsSpeaking(false));
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  // Handler for Projects button
  const handleProjects = useCallback(() => {
    setHasClickedProjects(true);
    dispatch(addMessage({
      sender: "ai",
      text: "",
      type: "project-list",
      projects,
      isExpanded: true,
    }));
  }, [dispatch]);

  // Handlers
  const handleInputFocus = useCallback(async () => {
    if (!state.voiceReady && !state.hasVisited) {
      dispatch(setVoiceReady(true));
      dispatch(setWelcomeLoading(true));
      dispatch(setIsSpeaking(true));
      try {
        const data = await fetchTTS(AI_VOICE_GREETING_INSTRUCTIONS);
        if (data.audioUrl) {
          playAudio(data.audioUrl, {
            onEnd: () => dispatch(setIsSpeaking(false)),
          });
        }
      } finally {
        dispatch(setWelcomeLoading(false));
        dispatch(setHasVisited(true));
      }
    }
  }, [state.voiceReady, dispatch, state.hasVisited]);

  const sendMessage = useCallback(async (userMessage: string) => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    dispatch(addMessage({ sender: "user", text: userMessage }));
    try {
      const data = await sendChatMessage(userMessage, 'true');
      if (data.type === "contact-info" && data.contacts) {
        dispatch(addMessage({ sender: "ai", text: "", type: "contact-info", contacts: data.contacts, isExpanded: true }));
      } else if (data.type === "project-list" && data.projects) {
        dispatch(addMessage({ sender: "ai", text: "", type: "project-list", projects: data.projects, isExpanded: true }));
      } else if (data.aiMessage) {
        dispatch(addMessage({ sender: "ai", text: data.aiMessage, isExpanded: false }));
        if (data.audioUrl) {
          dispatch(setIsSpeaking(true));
          playAudio(data.audioUrl, {
            onEnd: () => dispatch(setIsSpeaking(false)),
          });
        }
      } else {
        dispatch(addMessage({ sender: "ai", text: "Sorry, no response from AI.", isExpanded: false }));
        dispatch(setError(data.error || "Unknown error"));
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      dispatch(addMessage({ sender: "ai", text: "Error contacting AI.", isExpanded: false }));
      dispatch(setError(`Network error: ${errorMsg}`));
    }
    dispatch(setLoading(false));
  }, [dispatch]);

  const toggleMessage = useCallback((index: number) => {
    dispatch(toggleMessageAction(index));
  }, [dispatch]);

  // Use chat input hook
  const { handleKeyDown, handleSend } = useChatInput({
    value: state.value,
    loading: state.loading,
    sendMessage,
    resetValue: () => dispatch(resetValue()),
    adjustHeight,
  });

  // Handle input change directly
  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    dispatch(setValue(e.target.value));
    adjustHeight();
  }, [dispatch, adjustHeight]);

  return {
    ...state,
    textareaRef,
    chatEndRef,
    adjustHeight,
    handleInputFocus,
    handleKeyDown,
    handleSend,
    handleChange,
    toggleMessage,
    scrollToEnd,
    handleAbout,
    hasClickedAbout,
    handleProjects,
    hasClickedProjects,
  };
} 