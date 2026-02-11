import styled from 'styled-components';
import { useAuthStore } from '../store/authStore';
import { useAuth } from '../hooks/useAuth';

export default function Dashboard() {
  const { nickname } = useAuthStore();
  const { logout } = useAuth();

  return (
    <Container>
      <Header>
        <Logo>Profit Logic</Logo>
        <UserArea>
          <Greeting>{nickname}님 환영합니다</Greeting>
          <LogoutButton onClick={logout}>로그아웃</LogoutButton>
        </UserArea>
      </Header>
      <Content>
        <WelcomeCard>
          <h2>수익성 분석을 시작하세요</h2>
          <p>프로젝트를 생성하고 손익분기점, 목표 판매량을 분석해 보세요.</p>
        </WelcomeCard>
      </Content>
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
  padding: 1rem 2rem;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
`;

const Logo = styled.h1`
  font-size: 1.25rem;
  font-weight: 700;
  color: #4361ee;
`;

const UserArea = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Greeting = styled.span`
  font-size: 0.875rem;
  color: #6c757d;
`;

const LogoutButton = styled.button`
  padding: 0.5rem 1rem;
  background: transparent;
  color: #ef476f;
  border: 1px solid #ef476f;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: all 0.2s;

  &:hover {
    background: #ef476f;
    color: #fff;
  }
`;

const Content = styled.main`
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 2rem;
`;

const WelcomeCard = styled.div`
  background: #fff;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);

  h2 {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    color: #1a1a2e;
  }

  p {
    color: #6c757d;
  }
`;
