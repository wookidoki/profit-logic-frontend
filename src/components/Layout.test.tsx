import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Layout from './Layout';
import { useAuthStore } from '../store/authStore';

describe('Layout', () => {
  beforeEach(() => {
    useAuthStore.setState({
      accessToken: null,
      email: null,
      nickname: null,
      isAuthenticated: false,
    });
  });

  it('로고 "Profit Logic" 렌더링', () => {
    render(
      <MemoryRouter>
        <Layout><div>child</div></Layout>
      </MemoryRouter>,
    );
    expect(screen.getByText('Profit Logic')).toBeInTheDocument();
  });

  it('네비게이션 링크 3개 렌더링', () => {
    render(
      <MemoryRouter>
        <Layout><div>child</div></Layout>
      </MemoryRouter>,
    );
    expect(screen.getByText('프로젝트')).toBeInTheDocument();
    expect(screen.getByText('빠른분석')).toBeInTheDocument();
    expect(screen.getByText('커뮤니티')).toBeInTheDocument();
  });

  it('비인증 → 로그인 버튼 표시', () => {
    render(
      <MemoryRouter>
        <Layout><div>child</div></Layout>
      </MemoryRouter>,
    );
    expect(screen.getByText('로그인')).toBeInTheDocument();
  });

  it('인증됨 → 닉네임 + 로그아웃 표시', () => {
    useAuthStore.setState({
      accessToken: 'token',
      email: 'test@test.com',
      nickname: '테스터',
      isAuthenticated: true,
    });

    render(
      <MemoryRouter>
        <Layout><div>child</div></Layout>
      </MemoryRouter>,
    );
    expect(screen.getByText('테스터님')).toBeInTheDocument();
    expect(screen.getByText('로그아웃')).toBeInTheDocument();
  });

  it('children 정상 렌더링', () => {
    render(
      <MemoryRouter>
        <Layout><div>테스트 콘텐츠</div></Layout>
      </MemoryRouter>,
    );
    expect(screen.getByText('테스트 콘텐츠')).toBeInTheDocument();
  });
});
