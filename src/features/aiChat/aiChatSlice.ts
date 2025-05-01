import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ChatMessage {
  sender: 'user' | 'ai';
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

const initialState: AiChatState = {
  value: '',
  messages: [],
  loading: false,
  error: null,
  voiceReady: false,
  welcomeLoading: false,
  isSpeaking: false,
};

const aiChatSlice = createSlice({
  name: 'aiChat',
  initialState,
  reducers: {
    setValue(state, action: PayloadAction<string>) {
      state.value = action.payload;
    },
    addMessage(state, action: PayloadAction<ChatMessage>) {
      state.messages.push(action.payload);
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    setVoiceReady(state, action: PayloadAction<boolean>) {
      state.voiceReady = action.payload;
    },
    setWelcomeLoading(state, action: PayloadAction<boolean>) {
      state.welcomeLoading = action.payload;
    },
    setIsSpeaking(state, action: PayloadAction<boolean>) {
      state.isSpeaking = action.payload;
    },
    toggleMessage(state, action: PayloadAction<number>) {
      const idx = action.payload;
      if (state.messages[idx]) {
        state.messages[idx].isExpanded = !state.messages[idx].isExpanded;
      }
    },
    resetValue(state) {
      state.value = '';
    },
    setMessages(state, action: PayloadAction<ChatMessage[]>) {
      state.messages = action.payload;
    },
    clearMessages(state) {
      state.messages = [];
    },
  },
});

export const {
  setValue,
  addMessage,
  setLoading,
  setError,
  setVoiceReady,
  setWelcomeLoading,
  setIsSpeaking,
  toggleMessage,
  resetValue,
  setMessages,
  clearMessages,
} = aiChatSlice.actions;

export default aiChatSlice.reducer; 