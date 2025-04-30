import { AiChatState, AiChatAction } from "./aiChatTypes";

export const initialAiChatState: AiChatState = {
  value: "",
  messages: [],
  loading: false,
  error: null,
  voiceReady: false,
  welcomeLoading: false,
  isSpeaking: false,
};

export function aiChatReducer(state: AiChatState, action: AiChatAction): AiChatState {
  switch (action.type) {
    case "SET_VALUE":
      return { ...state, value: action.value };
    case "RESET_VALUE":
      return { ...state, value: "" };
    case "ADD_MESSAGE":
      return { ...state, messages: [...state.messages, action.message] };
    case "SET_MESSAGES":
      return { ...state, messages: action.messages };
    case "SET_LOADING":
      return { ...state, loading: action.loading };
    case "SET_ERROR":
      return { ...state, error: action.error };
    case "SET_VOICE_READY":
      return { ...state, voiceReady: action.voiceReady };
    case "SET_WELCOME_LOADING":
      return { ...state, welcomeLoading: action.welcomeLoading };
    case "SET_IS_SPEAKING":
      return { ...state, isSpeaking: action.isSpeaking };
    case "TOGGLE_MESSAGE":
      return {
        ...state,
        messages: state.messages.map((msg, i) =>
          i === action.index && msg.sender === "ai"
            ? { ...msg, isExpanded: !msg.isExpanded }
            : msg
        ),
      };
    default:
      return state;
  }
} 