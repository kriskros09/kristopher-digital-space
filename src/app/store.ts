import { configureStore, combineReducers } from '@reduxjs/toolkit';
import aiChatReducer from '../features/aiChat/aiChatSlice';
import {
  persistReducer,
  persistStore,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';

// Only persist the messages array and hasVisited flag in aiChat
const aiChatPersistConfig = {
  key: 'aiChat',
  storage,
  whitelist: ['messages', 'hasVisited'],
};

const rootReducer = combineReducers({
  aiChat: persistReducer(aiChatPersistConfig, aiChatReducer),
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 