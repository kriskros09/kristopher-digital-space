import { useReducer, useRef, useCallback, useEffect, useState, KeyboardEvent, ChangeEvent } from "react";
import { aiChatReducer, initialAiChatState } from "@/state/aiChat/aiChatReducer";
import { useAutoResizeTextarea } from "@/hooks/useAutoResizeTextarea";
import { AI_VOICE_GREETING_INSTRUCTIONS, SYSTEM_PROMPT } from "@/constants/aiPrompts";


export function useAiChat() {
  const [state, dispatch] = useReducer(aiChatReducer, initialAiChatState);
  const { textareaRef, adjustHeight } = useAutoResizeTextarea();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [hasClickedAbout, setHasClickedAbout] = useState(false);

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
    dispatch({ type: "SET_LOADING", loading: true });
    dispatch({ type: "SET_ERROR", error: null });
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
      dispatch({ type: "ADD_MESSAGE", message: { sender: "ai", text: aiData.aiMessage, isExpanded: false } });
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

        audio.onplay = () => dispatch({ type: "SET_IS_SPEAKING", isSpeaking: true });
        audio.onended = () => {
          dispatch({ type: "SET_IS_SPEAKING", isSpeaking: false });
          dispatch({ type: "SET_LOADING", loading: false });
          if (fallbackTimeout) clearTimeout(fallbackTimeout);
        };
        audio.play();

        // Use audio duration if available, otherwise fallback to 30s
        audio.onloadedmetadata = () => {
          const duration = audio.duration && isFinite(audio.duration) ? audio.duration : 30;
          fallbackTimeout = setTimeout(() => {
            dispatch({ type: "SET_IS_SPEAKING", isSpeaking: false });
            dispatch({ type: "SET_LOADING", loading: false });
          }, (duration + 2) * 1000); // 2s buffer
        };
      } else {
        dispatch({ type: "SET_IS_SPEAKING", isSpeaking: false });
        dispatch({ type: "SET_LOADING", loading: false });
      }
    } else {
      dispatch({ type: "ADD_MESSAGE", message: { sender: "ai", text: "Sorry, no response from AI.", isExpanded: false } });
      dispatch({ type: "SET_ERROR", error: aiData.error || "Unknown error" });
      dispatch({ type: "SET_IS_SPEAKING", isSpeaking: false });
      dispatch({ type: "SET_LOADING", loading: false });
    }
  }, []);

  // Handlers
  const handleInputFocus = useCallback(async () => {
    if (!state.voiceReady) {
      dispatch({ type: "SET_VOICE_READY", voiceReady: true });
      dispatch({ type: "SET_WELCOME_LOADING", welcomeLoading: true });
      dispatch({ type: "SET_IS_SPEAKING", isSpeaking: true });
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
        audio.onended = () => dispatch({ type: "SET_IS_SPEAKING", isSpeaking: false });
      }
      dispatch({ type: "SET_WELCOME_LOADING", welcomeLoading: false });
    }
  }, [state.voiceReady]);

  const sendMessage = useCallback(async (userMessage: string) => {
    dispatch({ type: "SET_LOADING", loading: true });
    dispatch({ type: "SET_ERROR", error: null });
    dispatch({ type: "ADD_MESSAGE", message: { sender: "user", text: userMessage } });
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, tts: true }),
      });
      const data = await res.json();
      if (res.ok && data.type === "contact-info" && data.contacts) {
        dispatch({ type: "ADD_MESSAGE", message: { sender: "ai", text: "", type: "contact-info", contacts: data.contacts, isExpanded: true } });
      } else if (res.ok && data.aiMessage) {
        dispatch({ type: "ADD_MESSAGE", message: { sender: "ai", text: data.aiMessage, isExpanded: false } });
        if (data.audioUrl) {
          dispatch({ type: "SET_IS_SPEAKING", isSpeaking: true });
          const audio = new Audio(data.audioUrl);
          audio.play();
          audio.onended = () => dispatch({ type: "SET_IS_SPEAKING", isSpeaking: false });
        }
      } else {
        dispatch({ type: "ADD_MESSAGE", message: { sender: "ai", text: "Sorry, no response from AI.", isExpanded: false } });
        dispatch({ type: "SET_ERROR", error: data.error || "Unknown error" });
      }
    } catch (err) {
      dispatch({ type: "ADD_MESSAGE", message: { sender: "ai", text: "Error contacting AI.", isExpanded: false } });
      dispatch({ type: "SET_ERROR", error: `Network error: ${err}` });
    }
    dispatch({ type: "SET_LOADING", loading: false });
  }, []);

  const toggleMessage = useCallback((index: number) => {
    dispatch({ type: "TOGGLE_MESSAGE", index });
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (state.value.trim() && !state.loading) {
        sendMessage(state.value.trim());
        dispatch({ type: "RESET_VALUE" });
        adjustHeight(true);
      }
    }
  }, [state.value, state.loading, sendMessage, adjustHeight]);

  const handleSend = useCallback(() => {
    if (state.value.trim() && !state.loading) {
      sendMessage(state.value.trim());
      dispatch({ type: "RESET_VALUE" });
      adjustHeight(true);
    }
  }, [state.value, state.loading, sendMessage, adjustHeight]);

  const handleChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    dispatch({ type: "SET_VALUE", value: e.target.value });
    adjustHeight();
  }, [adjustHeight]);

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
  };
} 