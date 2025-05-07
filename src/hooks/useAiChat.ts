import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/app/store";
import {
  setValue,
  addMessage,
  setLoading,
  setVoiceReady,
  setWelcomeLoading,
  setIsSpeaking,
  toggleMessage as toggleMessageAction,
  resetValue,
  setHasVisited,
  setLoaderStep,
  setHasClickedProjects
} from "@/features/aiChat/aiChatSlice";
import { useAutoResizeTextarea } from "@/hooks/useAutoResizeTextarea";
import { AI_VOICE_GREETING_INSTRUCTIONS } from "@/server/constants/aiPrompts";
import projects from "@/knowledge/projects.json";
import { fetchTTS } from "@/lib/chatApi";
import { playAudio } from "@/lib/audio";
import { useChatScroll } from "@/hooks/useChatScroll";
import { useChatInput } from "@/hooks/useChatInput";
import { ChangeEvent, useCallback, useRef } from "react";
import { handleAboutMe } from "@/services/aboutMeService";
import { handleSendMessage } from "@/services/sendMessageService";

export function useAiChat() {
  const dispatch = useDispatch<AppDispatch>();
  const state = useSelector((state: RootState) => state.aiChat);
  const { textareaRef, adjustHeight } = useAutoResizeTextarea();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cancelledRef = useRef(false);

  // Use chat scroll hook
  const { chatEndRef, scrollToEnd } = useChatScroll({
    messages: state.messages,
    loading: state.loading,
    welcomeLoading: state.welcomeLoading,
    isSpeaking: state.isSpeaking,
  });

  const skipSpeaking = useCallback(() => {
    cancelledRef.current = true;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = audioRef.current.duration || 0;
    }
    dispatch(setIsSpeaking(false));
    dispatch(setLoading(false));
    dispatch(setLoaderStep('idle'));
  }, [dispatch]);

  // Handler for About button
  const handleAbout = useCallback(async () => {
    await handleAboutMe(dispatch, cancelledRef, audioRef);
  }, [dispatch]);

  // Handler for Projects button
  const handleProjects = useCallback(() => {
    dispatch(setHasClickedProjects(true));
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
    await handleSendMessage(dispatch, cancelledRef, audioRef, userMessage);
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
  const handleChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
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
    hasClickedAbout: state.hasClickedAbout,
    handleProjects,
    hasClickedProjects: state.hasClickedProjects,
    skipSpeaking,
  };
} 