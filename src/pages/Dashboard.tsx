import { useState } from 'react';
import styled from 'styled-components';
import { ErrorBanner } from '../styles/shared';
import { useCalculate } from '../hooks/useCalculate';
import ProjectInputForm from '../components/ProjectInputForm';
import ResultCards from '../components/ResultCards';
import BepChart from '../components/BepChart';
import ScenarioSimulator from '../components/ScenarioSimulator';
import type { CalculateRequest } from '../types/finance';

export default function Dashboard() {
  const { result, loading, error, calculate } = useCalculate();
  const [formData, setFormData] = useState<CalculateRequest | null>(null);

  const handleSubmit = (data: CalculateRequest) => {
    setFormData(data);
    calculate(data);
  };

  return (
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
  );
}

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
