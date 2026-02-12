import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useAuthStore } from '../store/authStore';
import { useAuth } from '../hooks/useAuth';

interface Props {
  children: React.ReactNode;
}

export default function Layout({ children }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const { nickname, isAuthenticated } = useAuthStore();
  const { logout } = useAuth();

  return (
    <Container>
      <Header>
        <HeaderLeft>
          <Logo onClick={() => navigate('/')}>Profit Logic</Logo>
          <Nav>
            <NavItem $active={location.pathname === '/'} onClick={() => navigate('/')}>
              대시보드
            </NavItem>
            {isAuthenticated && (
              <NavItem
                $active={location.pathname.startsWith('/projects')}
                onClick={() => navigate('/projects')}
              >
                프로젝트
              </NavItem>
            )}
            <NavItem $active={location.pathname === '/scripts'} onClick={() => navigate('/scripts')}>
              맞춤 분석
            </NavItem>
            {isAuthenticated && (
              <NavItem
                $active={location.pathname === '/chat'}
                onClick={() => navigate('/chat')}
              >
                AI 상담
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
    </Container>
  );
}

const Container = styled.div`
  min-height: 100vh;
  background: #f8f9fa;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 2rem;
  background: #fff;
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
  color: #4361ee;
  cursor: pointer;
`;

const Nav = styled.nav`
  display: flex;
  gap: 0.25rem;
`;

const NavItem = styled.button<{ $active: boolean }>`
  padding: 0.5rem 0.75rem;
  background: ${({ $active }) => ($active ? '#4361ee10' : 'transparent')};
  color: ${({ $active }) => ($active ? '#4361ee' : '#6c757d')};
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: ${({ $active }) => ($active ? '600' : '400')};
  transition: all 0.2s;

  &:hover {
    background: #4361ee10;
    color: #4361ee;
  }
`;

const UserArea = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const Greeting = styled.span`
  font-size: 0.8125rem;
  color: #6c757d;
`;

const LogoutButton = styled.button`
  padding: 0.375rem 0.75rem;
  background: transparent;
  color: #ef476f;
  border: 1px solid #ef476f;
  border-radius: 6px;
  font-size: 0.8125rem;
  transition: all 0.2s;

  &:hover {
    background: #ef476f;
    color: #fff;
  }
`;

const LoginButton = styled.button`
  padding: 0.375rem 0.75rem;
  background: #4361ee;
  color: #fff;
  border-radius: 6px;
  font-size: 0.8125rem;
  transition: background 0.2s;

  &:hover {
    background: #3a56d4;
  }
`;

const Main = styled.main``;
