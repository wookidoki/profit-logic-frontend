import { create } from 'zustand';

interface AuthState {
  accessToken: string | null;
  email: string | null;
  nickname: string | null;
  role: string | null;
  isAuthenticated: boolean;
  login: (token: string, email: string, nickname: string, role: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: localStorage.getItem('accessToken'),
  email: localStorage.getItem('email'),
  nickname: localStorage.getItem('nickname'),
  role: localStorage.getItem('role'),
  isAuthenticated: !!localStorage.getItem('accessToken'),

  login: (token, email, nickname, role) => {
    localStorage.setItem('accessToken', token);
    localStorage.setItem('email', email);
    localStorage.setItem('nickname', nickname);
    localStorage.setItem('role', role);
    set({ accessToken: token, email, nickname, role, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('email');
    localStorage.removeItem('nickname');
    localStorage.removeItem('role');
    set({ accessToken: null, email: null, nickname: null, role: null, isAuthenticated: false });
  },
}));
