import { AppDispatch } from "@/app/store";
import {
  setLoading,
  setError,
  setLoaderStep,
  addMessage,
  setIsSpeaking,
  setHasClickedAbout,
} from "@/features/aiChat/aiChatSlice";
import { fetchAbout, fetchOpenAi, fetchTTS } from "@/lib/chatApi";
import { playAudio } from "@/lib/audio";
import { SYSTEM_PROMPT } from "@/server/constants/aiPrompts";
import { RefObject } from "react";

export async function handleAboutMe(
  dispatch: AppDispatch,
  cancelledRef: RefObject<boolean>,
  audioRef: RefObject<HTMLAudioElement | null>
) {
  dispatch(setHasClickedAbout(true));
  dispatch(setLoading(true));
  dispatch(setError(null));
  dispatch(setLoaderStep('thinking'));
  try {
    const { about } = await fetchAbout();
    if (cancelledRef.current) return;
    const systemPromptWithKnowledge = `${SYSTEM_PROMPT}\n\n${about}`;
    const aiData = await fetchOpenAi(systemPromptWithKnowledge, "Tell me about Kristopher.");
    if (cancelledRef.current) return;
    dispatch(setLoaderStep('processing'));
    if (aiData.aiMessage) {
      dispatch(addMessage({ sender: "ai", text: aiData.aiMessage, isExpanded: false }));
      // Fetch TTS, but only set isSpeaking when audio actually starts
      const ttsData = await fetchTTS(aiData.aiMessage);
      if (cancelledRef.current) return;
      if (ttsData.audioUrl) {
        let fallbackTimeout: ReturnType<typeof setTimeout> | null = null;
        const audio = playAudio(ttsData.audioUrl, {
          onPlay: () => {
            dispatch(setIsSpeaking(true));
            dispatch(setLoaderStep('speaking'));
          },
          onEnd: () => {
            dispatch(setIsSpeaking(false));
            dispatch(setLoaderStep('idle'));
            dispatch(setLoading(false));
            if (fallbackTimeout) clearTimeout(fallbackTimeout);
          },
        });
        audioRef.current = audio;
        audio.onloadedmetadata = () => {
          const duration = audio.duration && isFinite(audio.duration) ? audio.duration : 30;
          fallbackTimeout = setTimeout(() => {
            dispatch(setIsSpeaking(false));
            dispatch(setLoaderStep('idle'));
            dispatch(setLoading(false));
          }, (duration + 2) * 1000);
        };
      } else {
        dispatch(setIsSpeaking(false));
        dispatch(setLoaderStep('idle'));
        dispatch(setLoading(false));
      }
    } else {
      dispatch(addMessage({ sender: "ai", text: "Sorry, no response from AI.", isExpanded: false }));
      dispatch(setError(aiData.error || "Unknown error"));
      dispatch(setIsSpeaking(false));
      dispatch(setLoaderStep('idle'));
      dispatch(setLoading(false));
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Unknown error";
    dispatch(addMessage({ sender: "ai", text: "Sorry, no response from AI.", isExpanded: false }));
    dispatch(setError(errorMsg));
    dispatch(setIsSpeaking(false));
    dispatch(setLoaderStep('idle'));
    dispatch(setLoading(false));
  }
} 