import { AppDispatch } from "@/app/store";
import {
  setLoading,
  setError,
  setLoaderStep,
  addMessage,
  setIsSpeaking,
} from "@/features/aiChat/aiChatSlice";
import { sendChatMessage } from "@/lib/chatApi";
import { playAudio } from "@/lib/audio";
import { RefObject } from "react";

export async function handleSendMessage(
  dispatch: AppDispatch,
  cancelledRef: RefObject<boolean>,
  audioRef: RefObject<HTMLAudioElement | null>,
  userMessage: string
) {
  dispatch(setLoading(true));
  dispatch(setError(null));
  dispatch(setLoaderStep('thinking'));
  dispatch(addMessage({ sender: "user", text: userMessage }));
  try {
    const data = await sendChatMessage(userMessage, 'true');
    if (cancelledRef.current) return;
    dispatch(setLoaderStep('processing'));
    if (data.type === "contact-info" && data.contacts) {
      dispatch(addMessage({ sender: "ai", text: "", type: "contact-info", contacts: data.contacts, isExpanded: true }));
      dispatch(setLoaderStep('idle'));
    } else if (data.type === "project-list" && data.projects) {
      dispatch(addMessage({ sender: "ai", text: "", type: "project-list", projects: data.projects, isExpanded: true }));
      dispatch(setLoaderStep('idle'));
    } else if (data.aiMessage) {
      dispatch(addMessage({ sender: "ai", text: data.aiMessage, isExpanded: false }));
      if (data.audioUrl) {
        const audio = playAudio(data.audioUrl, {
          onPlay: () => {
            dispatch(setIsSpeaking(true));
            dispatch(setLoaderStep('speaking'));
          },
          onEnd: () => {
            dispatch(setIsSpeaking(false));
            dispatch(setLoaderStep('idle'));
          },
        });
        audioRef.current = audio;
      } else {
        dispatch(setIsSpeaking(false));
        dispatch(setLoaderStep('idle'));
      }
    } else {
      dispatch(addMessage({ sender: "ai", text: "Sorry, no response from AI.", isExpanded: false }));
      dispatch(setError(data.error || "Unknown error"));
      dispatch(setLoaderStep('idle'));
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Unknown error";
    dispatch(addMessage({ sender: "ai", text: "Error contacting AI.", isExpanded: false }));
    dispatch(setError(`Network error: ${errorMsg}`));
    dispatch(setLoaderStep('idle'));
  }
  dispatch(setLoading(false));
} 