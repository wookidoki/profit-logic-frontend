import { create } from 'zustand';

interface AuthState {
  accessToken: string | null;
  email: string | null;
  nickname: string | null;
  isAuthenticated: boolean;
  login: (token: string, email: string, nickname: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: localStorage.getItem('accessToken'),
  email: localStorage.getItem('email'),
  nickname: localStorage.getItem('nickname'),
  isAuthenticated: !!localStorage.getItem('accessToken'),

  login: (token, email, nickname) => {
    localStorage.setItem('accessToken', token);
    localStorage.setItem('email', email);
    localStorage.setItem('nickname', nickname);
    set({ accessToken: token, email, nickname, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('email');
    localStorage.removeItem('nickname');
    set({ accessToken: null, email: null, nickname: null, isAuthenticated: false });
  },
}));
