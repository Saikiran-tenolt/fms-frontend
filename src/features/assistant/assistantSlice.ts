import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AssistantState, ChatMessage } from '../../types';

const initialState: AssistantState = {
  messages: [],
  loading: false,
  attachedImage: null,
};

const assistantSlice = createSlice({
  name: 'assistant',
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.messages.push(action.payload);
    },
    setMessages: (state, action: PayloadAction<ChatMessage[]>) => {
      state.messages = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    attachImage: (state, action: PayloadAction<File | null>) => {
      state.attachedImage = action.payload;
    },
    clearMessages: (state) => {
      state.messages = [];
    },
  },
});

export const { addMessage, setMessages, setLoading, attachImage, clearMessages } = assistantSlice.actions;
export default assistantSlice.reducer;
