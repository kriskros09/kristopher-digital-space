export interface ChatMessage {
  sender: "user" | "ai";
  text: string;
  isExpanded?: boolean;
  type?: string;
  contacts?: { name: string; url: string }[];
}

export interface AiChatState {
  value: string;
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  voiceReady: boolean;
  welcomeLoading: boolean;
  isSpeaking: boolean;
}

export type AiChatAction =
  | { type: "SET_VALUE"; value: string }
  | { type: "ADD_MESSAGE"; message: ChatMessage }
  | { type: "SET_LOADING"; loading: boolean }
  | { type: "SET_ERROR"; error: string | null }
  | { type: "SET_VOICE_READY"; voiceReady: boolean }
  | { type: "SET_WELCOME_LOADING"; welcomeLoading: boolean }
  | { type: "SET_IS_SPEAKING"; isSpeaking: boolean }
  | { type: "TOGGLE_MESSAGE"; index: number }
  | { type: "RESET_VALUE" }
  | { type: "SET_MESSAGES"; messages: ChatMessage[] }; 