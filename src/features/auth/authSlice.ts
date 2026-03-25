import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AuthState, User } from '../../types';

const loadAuthFromStorage = (): AuthState => {
  try {
    const token = localStorage.getItem('authToken');
    const userStr = localStorage.getItem('authUser');
    
    if (token && userStr) {
      const user = JSON.parse(userStr) as User;
      return {
        user,
        token,
        isAuthenticated: true,
      };
    }
  } catch (error) {
    console.error('Error loading auth from storage:', error);
  }
  
  return {
    user: null,
    token: null,
    isAuthenticated: false,
  };
};

const initialState: AuthState = loadAuthFromStorage();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      
      // Persist to localStorage
      localStorage.setItem('authToken', action.payload.token);
      localStorage.setItem('authUser', JSON.stringify(action.payload.user));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      
      // Clear localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
    },
    updateUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      if (state.user) {
        localStorage.setItem('authUser', JSON.stringify(action.payload));
      }
    },
  },
});

export const { login, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;
