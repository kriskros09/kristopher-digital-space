import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Project {
  name: string;
  image: string;
  description: string;
  stack: string[];
  role: string;
  slug: string;
}

export interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  isExpanded?: boolean;
  type?: string;
  contacts?: { name: string; url: string }[];
  projects?: Project[];
}

export interface AiChatState {
  value: string;
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  voiceReady: boolean;
  welcomeLoading: boolean;
  isSpeaking: boolean;
  hasVisited: boolean;
  loaderStep: 'idle' | 'thinking' | 'processing' | 'speaking';
  hasClickedProjects: boolean;
  hasClickedAbout: boolean;
}

// Helper to safely read from sessionStorage (for SSR safety)
function getSessionStorageFlag(key: string, defaultValue = false): boolean {
  if (typeof window !== 'undefined') {
    const value = sessionStorage.getItem(key);
    return value === 'true';
  }
  return defaultValue;
}

const initialState: AiChatState = {
  value: '',
  messages: [],
  loading: false,
  error: null,
  voiceReady: false,
  welcomeLoading: false,
  isSpeaking: false,
  hasVisited: false,
  loaderStep: 'idle',
  hasClickedProjects: typeof window !== 'undefined' ? getSessionStorageFlag('hasClickedProjects') : false,
  hasClickedAbout: typeof window !== 'undefined' ? getSessionStorageFlag('hasClickedAbout') : false,
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
      state.messages = state.messages.map((msg, i) => ({
        ...msg,
        isExpanded: i === idx ? !msg.isExpanded : false,
      }));
    },
    resetValue(state) {
      state.value = '';
    },
    setMessages(state, action: PayloadAction<ChatMessage[]>) {
      state.messages = action.payload;
    },
    clearMessages(state) {
      state.messages = [];
      state.hasClickedProjects = false;
      state.hasClickedAbout = false;
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('hasClickedProjects');
        sessionStorage.removeItem('hasClickedAbout');
      }
    },
    setHasVisited(state, action: PayloadAction<boolean>) {
      state.hasVisited = action.payload;
    },
    setLoaderStep(state, action: PayloadAction<'idle' | 'thinking' | 'processing' | 'speaking'>) {
      state.loaderStep = action.payload;
    },
    setHasClickedProjects(state, action: PayloadAction<boolean>) {
      state.hasClickedProjects = action.payload;
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('hasClickedProjects', String(action.payload));
      }
    },
    setHasClickedAbout(state, action: PayloadAction<boolean>) {
      state.hasClickedAbout = action.payload;
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('hasClickedAbout', String(action.payload));
      }
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
  setHasVisited,
  setLoaderStep,
  setHasClickedProjects,
  setHasClickedAbout,
} = aiChatSlice.actions;

export default aiChatSlice.reducer; 