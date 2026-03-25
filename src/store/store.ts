import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import plotsReducer from '../features/plots/plotsSlice';
import sensorsReducer from '../features/sensors/sensorsSlice';
import advisoriesReducer from '../features/advisories/advisoriesSlice';
import notificationsReducer from '../features/notifications/notificationsSlice';
import marketReducer from '../features/market/marketSlice';
import assistantReducer from '../features/assistant/assistantSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    plots: plotsReducer,
    sensors: sensorsReducer,
    advisories: advisoriesReducer,
    notifications: notificationsReducer,
    market: marketReducer,
    assistant: assistantReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore File objects in assistant state
        ignoredActions: ['assistant/attachImage'],
        ignoredPaths: ['assistant.attachedImage'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
