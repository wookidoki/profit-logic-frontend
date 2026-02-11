import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from './authStore';

// localStorage mock
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

describe('authStore', () => {
  beforeEach(() => {
    localStorageMock.clear();
    useAuthStore.setState({
      accessToken: null,
      email: null,
      nickname: null,
      isAuthenticated: false,
    });
  });

  it('초기 상태: 비인증', () => {
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.accessToken).toBeNull();
  });

  it('login → 상태 및 localStorage 업데이트', () => {
    useAuthStore.getState().login('jwt-token', 'test@test.com', '테스터');

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.accessToken).toBe('jwt-token');
    expect(state.email).toBe('test@test.com');
    expect(state.nickname).toBe('테스터');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('accessToken', 'jwt-token');
  });

  it('logout → 상태 초기화 및 localStorage 삭제', () => {
    useAuthStore.getState().login('jwt-token', 'test@test.com', '테스터');
    useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.accessToken).toBeNull();
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('accessToken');
  });
});
