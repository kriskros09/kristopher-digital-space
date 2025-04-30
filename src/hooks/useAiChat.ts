import { useReducer, useRef, useCallback, useEffect, useState, KeyboardEvent, ChangeEvent } from "react";
import { aiChatReducer, initialAiChatState } from "@/state/aiChat/aiChatReducer";
import { AiChatState, AiChatAction, ChatMessage } from "@/state/aiChat/aiChatTypes";
import { useAutoResizeTextarea } from "@/hooks/useAutoResizeTextarea";
import { AI_VOICE_GREETING_INSTRUCTIONS } from "@/constants/aiPrompts";

const SYSTEM_PROMPT = "You may only answer questions about Kristopher using the information provided in the following knowledge files. Do not make up information.";

export function useAiChat() {
  const [state, dispatch] = useReducer(aiChatReducer, initialAiChatState);
  const { textareaRef, adjustHeight } = useAutoResizeTextarea();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [aboutLinks, setAboutLinks] = useState<{ [key: string]: string } | null>(null);
  const [hasClickedAbout, setHasClickedAbout] = useState(false);

  // Scroll to bottom on messages/loader change
  const scrollToEnd = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToEnd();
  }, [state.messages, state.loading, state.welcomeLoading, scrollToEnd]);

  // OpenAI call for About
  const sendAboutToOpenAI = useCallback(async (about: string) => {
    dispatch({ type: "SET_LOADING", loading: true });
    dispatch({ type: "SET_ERROR", error: null });
    dispatch({ type: "ADD_MESSAGE", message: { sender: "user", text: "Tell me about Kristopher." } });
    try {
      const res = await fetch("/api/openai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemPrompt: SYSTEM_PROMPT,
          userPrompt: about,
        }),
      });
      const data = await res.json();
      if (res.ok && data.aiMessage) {
        dispatch({ type: "ADD_MESSAGE", message: { sender: "ai", text: data.aiMessage, isExpanded: false } });
      } else {
        dispatch({ type: "ADD_MESSAGE", message: { sender: "ai", text: "Sorry, no response from AI.", isExpanded: false } });
        dispatch({ type: "SET_ERROR", error: data.error || "Unknown error" });
      }
    } catch (err) {
      dispatch({ type: "ADD_MESSAGE", message: { sender: "ai", text: "Error contacting AI.", isExpanded: false } });
      dispatch({ type: "SET_ERROR", error: "Network error" });
    }
    dispatch({ type: "SET_LOADING", loading: false });
  }, []);

  // Handler for About button
  const handleAbout = useCallback(async () => {
    setHasClickedAbout(true);
    setAboutLinks(null);
    dispatch({ type: "SET_LOADING", loading: true });
    dispatch({ type: "SET_ERROR", error: null });
    const res = await fetch("/api/knowledge/about");
    const { about, links } = await res.json();

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
      // Trigger TTS for the AI's message using the new /api/tts endpoint
      dispatch({ type: "SET_IS_SPEAKING", isSpeaking: true });
      const ttsRes = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: aiData.aiMessage }),
      });
      const ttsData = await ttsRes.json();
      if (ttsRes.ok && ttsData.audioUrl) {
        const audio = new Audio(ttsData.audioUrl);
        audio.play();
        audio.onended = () => dispatch({ type: "SET_IS_SPEAKING", isSpeaking: false });
        // Fallback: ensure isSpeaking is false after 15s if audio fails
        setTimeout(() => dispatch({ type: "SET_IS_SPEAKING", isSpeaking: false }), 15000);
      } else {
        dispatch({ type: "SET_IS_SPEAKING", isSpeaking: false });
      }
    } else {
      dispatch({ type: "ADD_MESSAGE", message: { sender: "ai", text: "Sorry, no response from AI.", isExpanded: false } });
      dispatch({ type: "SET_ERROR", error: aiData.error || "Unknown error" });
      dispatch({ type: "SET_IS_SPEAKING", isSpeaking: false });
    }
    setAboutLinks(links);
    dispatch({ type: "SET_LOADING", loading: false });
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
      if (res.ok && data.aiMessage) {
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
      dispatch({ type: "SET_ERROR", error: "Network error" });
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
    aboutLinks,
    hasClickedAbout,
  };
} 