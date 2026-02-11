import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuthStore } from '../store/authStore';
import { useAuth } from '../hooks/useAuth';
import { useCalculate } from '../hooks/useCalculate';
import ProjectInputForm from '../components/ProjectInputForm';
import ResultCards from '../components/ResultCards';
import BepChart from '../components/BepChart';
import ScenarioSimulator from '../components/ScenarioSimulator';
import type { CalculateRequest } from '../types/finance';

export default function Dashboard() {
  const navigate = useNavigate();
  const { nickname } = useAuthStore();
  const { logout } = useAuth();
  const { result, loading, error, calculate } = useCalculate();
  const [formData, setFormData] = useState<CalculateRequest | null>(null);

  const handleSubmit = (data: CalculateRequest) => {
    setFormData(data);
    calculate(data);
  };

  return (
    <Container>
      <Header>
        <HeaderLeft>
          <Logo>Profit Logic</Logo>
          <NavButton onClick={() => navigate('/scripts')}>맞춤 분석</NavButton>
        </HeaderLeft>
        <UserArea>
          <Greeting>{nickname}님 환영합니다</Greeting>
          <LogoutButton onClick={logout}>로그아웃</LogoutButton>
        </UserArea>
      </Header>

      <MainGrid>
        <LeftPanel>
          <ProjectInputForm
            onSubmit={handleSubmit}
            loading={loading}
            defaultValues={formData ?? undefined}
          />
          {error && <ErrorBanner>{error}</ErrorBanner>}
        </LeftPanel>

        <RightPanel>
          {result && formData ? (
            <>
              <ResultCards result={result} />
              <BepChart formData={formData} result={result} />
              <ScenarioSimulator baseData={formData} baseResult={result} />
            </>
          ) : (
            <EmptyState>
              <EmptyIcon>📊</EmptyIcon>
              <h3>수익성 분석을 시작하세요</h3>
              <p>좌측 폼에 프로젝트 정보를 입력하면 손익분기점, 목표 판매량 등을 분석합니다.</p>
            </EmptyState>
          )}
        </RightPanel>
      </MainGrid>
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

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
`;

const Logo = styled.h1`
  font-size: 1.25rem;
  font-weight: 700;
  color: #4361ee;
`;

const NavButton = styled.button`
  padding: 0.375rem 0.75rem;
  background: linear-gradient(135deg, #7209b7, #4361ee);
  color: #fff;
  border-radius: 6px;
  font-size: 0.8125rem;
  font-weight: 600;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }
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

const MainGrid = styled.main`
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 1.5rem;
  max-width: 1400px;
  margin: 1.5rem auto;
  padding: 0 2rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const LeftPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;

  @media (min-width: 1025px) {
    position: sticky;
    top: 1.5rem;
    align-self: start;
  }
`;

const RightPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ErrorBanner = styled.div`
  padding: 0.75rem 1rem;
  background: #fff5f5;
  color: #ef476f;
  border: 1px solid #ef476f;
  border-radius: 8px;
  font-size: 0.875rem;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #fff;
  padding: 4rem 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
  text-align: center;

  h3 {
    font-size: 1.25rem;
    color: #1a1a2e;
    margin-bottom: 0.5rem;
  }

  p {
    color: #6c757d;
    max-width: 320px;
  }
`;

const EmptyIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;
