import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { simulationApi } from '../api/simulationApi';
import { formatKRW, formatPercent, formatQuantity } from '../utils/formatNumber';
import type { Simulation } from '../types';

interface Props {
  projectId: number;
}

interface ParsedResult {
  break_even_point?: number;
  economic_profit?: number;
  margin_rate?: number;
  is_viable?: boolean;
}

export default function SimulationList({ projectId }: Props) {
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSimulations = async () => {
      try {
        const res = await simulationApi.getByProject(projectId);
        if (res.data.success && res.data.data) {
          setSimulations(res.data.data);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchSimulations();
  }, [projectId]);

  const handleDelete = async (simId: number) => {
    if (!confirm('이 시뮬레이션을 삭제하시겠습니까?')) return;
    try {
      await simulationApi.delete(simId);
      setSimulations((prev) => prev.filter((s) => s.id !== simId));
    } catch {
      alert('삭제에 실패했습니다.');
    }
  };

  const parseResult = (json: string): ParsedResult => {
    try {
      return JSON.parse(json);
    } catch {
      return {};
    }
  };

  if (loading) return <LoadingText>시뮬레이션 불러오는 중...</LoadingText>;

  if (simulations.length === 0) {
    return (
      <EmptyState>
        <EmptyText>저장된 시뮬레이션이 없습니다.</EmptyText>
        <EmptySub>분석 탭의 시나리오 시뮬레이터에서 결과를 저장해보세요.</EmptySub>
      </EmptyState>
    );
  }

  return (
    <Container>
      {simulations.map((sim) => {
        const parsed = parseResult(sim.result_json);
        return (
          <SimCard key={sim.id}>
            <SimHeader>
              <SimName>{sim.scenario_name}</SimName>
              <DeleteBtn onClick={() => handleDelete(sim.id)}>삭제</DeleteBtn>
            </SimHeader>
            <SimMetrics>
              {parsed.break_even_point != null && (
                <SimMetric>
                  <SimLabel>BEP</SimLabel>
                  <SimValue>{formatQuantity(parsed.break_even_point)}</SimValue>
                </SimMetric>
              )}
              {parsed.economic_profit != null && (
                <SimMetric>
                  <SimLabel>경제적 이윤</SimLabel>
                  <SimValue>{formatKRW(parsed.economic_profit)}</SimValue>
                </SimMetric>
              )}
              {parsed.margin_rate != null && (
                <SimMetric>
                  <SimLabel>안전마진율</SimLabel>
                  <SimValue>{formatPercent(parsed.margin_rate)}</SimValue>
                </SimMetric>
              )}
              {parsed.is_viable != null && (
                <SimMetric>
                  <SimLabel>생존가능</SimLabel>
                  <SimViable $viable={parsed.is_viable}>
                    {parsed.is_viable ? '가능' : '불가'}
                  </SimViable>
                </SimMetric>
              )}
            </SimMetrics>
            <SimDate>
              {new Date(sim.created_at).toLocaleString('ko-KR')}
            </SimDate>
          </SimCard>
        );
      })}
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const SimCard = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
`;

const SimHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
`;

const SimName = styled.h4`
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1a1a2e;
`;

const DeleteBtn = styled.button`
  padding: 0.25rem 0.625rem;
  font-size: 0.75rem;
  color: #ef476f;
  border: 1px solid #ef476f;
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #ef476f;
    color: #fff;
  }
`;

const SimMetrics = styled.div`
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  margin-bottom: 0.5rem;
`;

const SimMetric = styled.div``;

const SimLabel = styled.div`
  font-size: 0.6875rem;
  color: #6c757d;
`;

const SimValue = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: #1a1a2e;
`;

const SimViable = styled.div<{ $viable: boolean }>`
  font-size: 0.875rem;
  font-weight: 700;
  color: ${({ $viable }) => ($viable ? '#06d6a0' : '#ef476f')};
`;

const SimDate = styled.div`
  font-size: 0.75rem;
  color: #adb5bd;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4rem 2rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
`;

const EmptyText = styled.p`
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a2e;
  margin-bottom: 0.5rem;
`;

const EmptySub = styled.p`
  font-size: 0.875rem;
  color: #6c757d;
`;

const LoadingText = styled.div`
  text-align: center;
  padding: 4rem;
  color: #6c757d;
  font-size: 0.875rem;
`;
