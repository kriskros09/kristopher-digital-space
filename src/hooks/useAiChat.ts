import { useRef, useCallback, useEffect, useState, KeyboardEvent, ChangeEvent } from "react";
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
import { AI_VOICE_GREETING_INSTRUCTIONS, SYSTEM_PROMPT } from "@/constants/aiPrompts";
import projects from "@/knowledge/projects.json";

export function useAiChat() {
  const dispatch = useDispatch<AppDispatch>();
  const state = useSelector((state: RootState) => state.aiChat);
  const { textareaRef, adjustHeight } = useAutoResizeTextarea();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [hasClickedAbout, setHasClickedAbout] = useState(false);
  const [hasClickedProjects, setHasClickedProjects] = useState(false);

  // Scroll to bottom on messages/loader change
  const scrollToEnd = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToEnd();
  }, [state.messages, state.loading, state.welcomeLoading, scrollToEnd]);

  // Handler for About button
  const handleAbout = useCallback(async () => {
    setHasClickedAbout(true);
    dispatch(setLoading(true));
    dispatch(setError(null));
    const res = await fetch("/api/knowledge/about");
    const { about } = await res.json();

    // Always ask the same question, provide about.md and links as context
    const systemPromptWithKnowledge = `${SYSTEM_PROMPT}\n\n${about}`;
    const aiRes = await fetch("/api/openai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemPrompt: systemPromptWithKnowledge,
        userPrompt: "Tell me about Kristopher.",
      }),
    });
    const aiData = await aiRes.json();
    if (aiRes.ok && aiData.aiMessage) {
      dispatch(addMessage({ sender: "ai", text: aiData.aiMessage, isExpanded: false }));
      // Fetch TTS, but only set isSpeaking when audio actually starts
      const ttsRes = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: aiData.aiMessage }),
      });
      const ttsData = await ttsRes.json();
      if (ttsRes.ok && ttsData.audioUrl) {
        const audio = new Audio(ttsData.audioUrl);
        let fallbackTimeout: ReturnType<typeof setTimeout> | null = null;

        audio.onplay = () => dispatch(setIsSpeaking(true));
        audio.onended = () => {
          dispatch(setIsSpeaking(false));
          dispatch(setLoading(false));
          if (fallbackTimeout) clearTimeout(fallbackTimeout);
        };
        audio.play();

        // Use audio duration if available, otherwise fallback to 30s
        audio.onloadedmetadata = () => {
          const duration = audio.duration && isFinite(audio.duration) ? audio.duration : 30;
          fallbackTimeout = setTimeout(() => {
            dispatch(setIsSpeaking(false));
            dispatch(setLoading(false));
          }, (duration + 2) * 1000); // 2s buffer
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
      // Fetch and play welcome audio using /api/tts
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: AI_VOICE_GREETING_INSTRUCTIONS }),
      });
      const data = await res.json();
      if (data.audioUrl) {
        const audio = new Audio(data.audioUrl);
        audio.play();
        audio.onended = () => dispatch(setIsSpeaking(false));
      }
      dispatch(setWelcomeLoading(false));
      dispatch(setHasVisited(true));
    }
  }, [state.voiceReady, dispatch, state.hasVisited]);

  const sendMessage = useCallback(async (userMessage: string) => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    dispatch(addMessage({ sender: "user", text: userMessage }));
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, tts: true }),
      });
      const data = await res.json();
      if (res.ok && data.type === "contact-info" && data.contacts) {
        dispatch(addMessage({ sender: "ai", text: "", type: "contact-info", contacts: data.contacts, isExpanded: true }));
      } else if (res.ok && data.type === "project-list" && data.projects) {
        dispatch(addMessage({ sender: "ai", text: "", type: "project-list", projects: data.projects, isExpanded: true }));
      } else if (res.ok && data.aiMessage) {
        dispatch(addMessage({ sender: "ai", text: data.aiMessage, isExpanded: false }));
        if (data.audioUrl) {
          dispatch(setIsSpeaking(true));
          const audio = new Audio(data.audioUrl);
          audio.play();
          audio.onended = () => dispatch(setIsSpeaking(false));
        }
      } else {
        dispatch(addMessage({ sender: "ai", text: "Sorry, no response from AI.", isExpanded: false }));
        dispatch(setError(data.error || "Unknown error"));
      }
    } catch (err) {
      dispatch(addMessage({ sender: "ai", text: "Error contacting AI.", isExpanded: false }));
      dispatch(setError(`Network error: ${err}`));
    }
    dispatch(setLoading(false));
  }, [dispatch]);

  const toggleMessage = useCallback((index: number) => {
    dispatch(toggleMessageAction(index));
  }, [dispatch]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (state.value.trim() && !state.loading) {
        sendMessage(state.value.trim());
        dispatch(resetValue());
        adjustHeight(true);
      }
    }
  }, [state.value, state.loading, sendMessage, adjustHeight, dispatch]);

  const handleSend = useCallback(() => {
    if (state.value.trim() && !state.loading) {
      sendMessage(state.value.trim());
      dispatch(resetValue());
      adjustHeight(true);
    }
  }, [state.value, state.loading, sendMessage, adjustHeight, dispatch]);

  const handleChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    dispatch(setValue(e.target.value));
    adjustHeight();
  }, [adjustHeight, dispatch]);

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