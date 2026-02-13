import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useAuthStore } from '../store/authStore';
import { useAuth } from '../hooks/useAuth';
import { theme } from '../styles/theme';
import api from '../api/axios';

interface Props {
  children: React.ReactNode;
}

export default function Layout({ children }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const { nickname, isAuthenticated, role } = useAuthStore();
  const { logout } = useAuth();
  const [llmAvailable, setLlmAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    api.get('/health')
      .then((res) => {
        if (res.data?.data?.llm_available) {
          setLlmAvailable(true);
        } else {
          setLlmAvailable(false);
        }
      })
      .catch(() => setLlmAvailable(false));
  }, []);

  return (
    <Container>
      <Header>
        <HeaderLeft>
          <Logo onClick={() => navigate('/')}>Profit Logic</Logo>
          <Nav>
            {isAuthenticated && (
              <NavItem $active={location.pathname === '/'} onClick={() => navigate('/')}>
                대시보드
              </NavItem>
            )}
            <NavItem
              $active={location.pathname === '/consult' || location.pathname === '/scripts'}
              onClick={() => navigate('/consult')}
            >
              맞춤 상담
            </NavItem>
            {isAuthenticated && (
              <NavItem
                $active={location.pathname.startsWith('/projects')}
                onClick={() => navigate('/projects')}
              >
                프로젝트
              </NavItem>
            )}
            {isAuthenticated && (
              <NavItem
                $active={location.pathname === '/chat'}
                onClick={() => navigate('/chat')}
              >
                AI 챗봇
              </NavItem>
            )}
            <NavItem
              $active={location.pathname.startsWith('/board')}
              onClick={() => navigate('/board')}
            >
              커뮤니티
            </NavItem>
            {isAuthenticated && (
              <NavItem
                $active={location.pathname === '/mypage'}
                onClick={() => navigate('/mypage')}
              >
                마이페이지
              </NavItem>
            )}
            {role === 'ROLE_ADMIN' && (
              <NavItem
                $active={location.pathname === '/admin'}
                onClick={() => navigate('/admin')}
              >
                관리
              </NavItem>
            )}
          </Nav>
        </HeaderLeft>
        <UserArea>
          {isAuthenticated ? (
            <>
              <Greeting>{nickname}님</Greeting>
              <LogoutButton onClick={logout}>로그아웃</LogoutButton>
            </>
          ) : (
            <LoginButton onClick={() => navigate('/login')}>로그인</LoginButton>
          )}
        </UserArea>
      </Header>
      <Main>{children}</Main>
      {llmAvailable !== null && (
        <LlmBadge $active={llmAvailable} title={llmAvailable ? 'Gemini AI 연결됨' : 'AI 오프라인'}>
          {llmAvailable ? '\u2728' : '\u26AA'}
        </LlmBadge>
      )}
    </Container>
  );
}

const Container = styled.div`
  min-height: 100vh;
  background: ${theme.colors.background};
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 2rem;
  background: ${theme.colors.surface};
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
`;

const Logo = styled.h1`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${theme.colors.primary};
  cursor: pointer;
`;

const Nav = styled.nav`
  display: flex;
  gap: 0.25rem;
`;

const NavItem = styled.button<{ $active: boolean }>`
  padding: 0.5rem 0.75rem;
  background: ${({ $active }) => ($active ? `${theme.colors.primary}10` : 'transparent')};
  color: ${({ $active }) => ($active ? theme.colors.primary : theme.colors.textSecondary)};
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: ${({ $active }) => ($active ? '600' : '400')};
  transition: all 0.2s;

  &:hover {
    background: ${theme.colors.primary}10;
    color: ${theme.colors.primary};
  }
`;

const UserArea = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const Greeting = styled.span`
  font-size: 0.8125rem;
  color: ${theme.colors.textSecondary};
`;

const LogoutButton = styled.button`
  padding: 0.375rem 0.75rem;
  background: transparent;
  color: ${theme.colors.danger};
  border: 1px solid ${theme.colors.danger};
  border-radius: 6px;
  font-size: 0.8125rem;
  transition: all 0.2s;

  &:hover {
    background: ${theme.colors.danger};
    color: ${theme.colors.surface};
  }
`;

const LoginButton = styled.button`
  padding: 0.375rem 0.75rem;
  background: ${theme.colors.primary};
  color: ${theme.colors.surface};
  border-radius: 6px;
  font-size: 0.8125rem;
  transition: background 0.2s;

  &:hover {
    background: ${theme.colors.primaryHover};
  }
`;

const Main = styled.main``;

const LlmBadge = styled.div<{ $active: boolean }>`
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: ${({ $active }) => ($active ? `${theme.colors.primary}20` : `${theme.colors.textSecondary}15`)};
  border: 2px solid ${({ $active }) => ($active ? theme.colors.primary : theme.colors.textSecondary)};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  cursor: default;
  opacity: 0.6;
  z-index: 100;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
  }
`;
