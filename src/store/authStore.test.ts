import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from './authStore';

describe('authStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.setState({
      accessToken: null,
      email: null,
      nickname: null,
      role: null,
      isAuthenticated: false,
    });
  });

  it('초기 상태: 비인증', () => {
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.accessToken).toBeNull();
    expect(state.email).toBeNull();
    expect(state.nickname).toBeNull();
    expect(state.role).toBeNull();
  });

  it('login → 인증 상태로 변경', () => {
    useAuthStore.getState().login('test-token', 'test@test.com', '테스터', 'ROLE_USER');
    const state = useAuthStore.getState();

    expect(state.isAuthenticated).toBe(true);
    expect(state.accessToken).toBe('test-token');
    expect(state.email).toBe('test@test.com');
    expect(state.nickname).toBe('테스터');
    expect(state.role).toBe('ROLE_USER');
  });

  it('login → localStorage에 저장', () => {
    useAuthStore.getState().login('test-token', 'test@test.com', '테스터', 'ROLE_USER');

    expect(localStorage.getItem('accessToken')).toBe('test-token');
    expect(localStorage.getItem('email')).toBe('test@test.com');
    expect(localStorage.getItem('nickname')).toBe('테스터');
    expect(localStorage.getItem('role')).toBe('ROLE_USER');
  });

  it('logout → 비인증 상태로 변경', () => {
    useAuthStore.getState().login('test-token', 'test@test.com', '테스터', 'ROLE_USER');
    useAuthStore.getState().logout();
    const state = useAuthStore.getState();

    expect(state.isAuthenticated).toBe(false);
    expect(state.accessToken).toBeNull();
    expect(state.email).toBeNull();
    expect(state.nickname).toBeNull();
    expect(state.role).toBeNull();
  });

  it('logout → localStorage 클리어', () => {
    useAuthStore.getState().login('test-token', 'test@test.com', '테스터', 'ROLE_USER');
    useAuthStore.getState().logout();

    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(localStorage.getItem('email')).toBeNull();
    expect(localStorage.getItem('nickname')).toBeNull();
    expect(localStorage.getItem('role')).toBeNull();
  });
});
