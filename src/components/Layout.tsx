import { NavLink, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuthStore } from '../store/authStore';
import { useAuth } from '../hooks/useAuth';

interface Props {
  children: React.ReactNode;
}

export default function Layout({ children }: Props) {
  const { nickname, isAuthenticated } = useAuthStore();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Container>
      <Nav>
        <NavLeft>
          <Logo to="/">Profit Logic</Logo>
          <NavLinks>
            <StyledNavLink to="/">프로젝트</StyledNavLink>
            <StyledNavLink to="/analyze">빠른분석</StyledNavLink>
            <StyledNavLink to="/community">커뮤니티</StyledNavLink>
          </NavLinks>
        </NavLeft>
        <NavRight>
          {isAuthenticated ? (
            <>
              <Nickname>{nickname}님</Nickname>
              <LogoutBtn onClick={handleLogout}>로그아웃</LogoutBtn>
            </>
          ) : (
            <LoginBtn onClick={() => navigate('/login')}>로그인</LoginBtn>
          )}
        </NavRight>
      </Nav>
      <Main>{children}</Main>
    </Container>
  );
}

const Container = styled.div`
  min-height: 100vh;
  background: #f8f9fa;
`;

const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem;
  height: 56px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
`;

const NavLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
`;

const Logo = styled(NavLink)`
  font-size: 1.25rem;
  font-weight: 700;
  color: #4361ee;
  text-decoration: none;
`;

const NavLinks = styled.div`
  display: flex;
  gap: 0.25rem;
`;

const StyledNavLink = styled(NavLink)`
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #6c757d;
  text-decoration: none;
  border-radius: 6px;
  transition: all 0.2s;

  &:hover {
    background: #f0f1ff;
    color: #4361ee;
  }

  &.active {
    background: #eef0ff;
    color: #4361ee;
    font-weight: 600;
  }
`;

const NavRight = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const Nickname = styled.span`
  font-size: 0.875rem;
  color: #6c757d;
`;

const LogoutBtn = styled.button`
  padding: 0.375rem 0.75rem;
  background: transparent;
  color: #ef476f;
  border: 1px solid #ef476f;
  border-radius: 6px;
  font-size: 0.8125rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #ef476f;
    color: #fff;
  }
`;

const LoginBtn = styled.button`
  padding: 0.375rem 0.75rem;
  background: #4361ee;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 0.8125rem;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #3a56d4;
  }
`;

const Main = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem 2rem;
`;
