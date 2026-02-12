import { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { LoadingText, ErrorBanner } from '../styles/shared';
import { goalApi } from '../api/goalApi';
import type { GoalProgressResponse, GoalStatus } from '../api/goalApi';
import { formatKRW } from '../utils/formatNumber';

interface Props {
  projectId: number;
  onSetGoal?: () => void;
}

const STATUS_CONFIG: Record<GoalStatus, { label: string; color: string; bg: string }> = {
  NO_TARGET: { label: '목표 미설정', color: '#6c757d', bg: '#f1f3f5' },
  ON_TRACK: { label: '순조로움', color: '#06d6a0', bg: '#f0fdf9' },
  BEHIND: { label: '주의 필요', color: '#f4a261', bg: '#fffbf0' },
  URGENT: { label: '긴급', color: '#ef476f', bg: '#fff5f5' },
  EXPIRED: { label: '기한 만료', color: '#6c757d', bg: '#f1f3f5' },
};

export default function GoalProgressPanel({ projectId, onSetGoal }: Props) {
  const [data, setData] = useState<GoalProgressResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProgress = useCallback(async () => {
    try {
      const res = await goalApi.getProgress(projectId);
      if (res.data.success && res.data.data) {
        setData(res.data.data);
      } else {
        setError('목표 데이터를 불러올 수 없습니다.');
      }
    } catch {
      setError('목표 데이터를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  if (loading) return <LoadingText>목표 진행률 로딩 중...</LoadingText>;
  if (error) return <ErrorBanner>{error}</ErrorBanner>;
  if (!data) return null;

  if (data.status === 'NO_TARGET') {
    return (
      <EmptyCard>
        <EmptyTitle>목표를 설정해보세요</EmptyTitle>
        <EmptyDesc>
          목표 매출과 달성 기한을 설정하면 일일 판매 페이스와 진행률을 추적할 수 있습니다.
        </EmptyDesc>
        {onSetGoal && (
          <SetGoalButton onClick={onSetGoal}>목표 설정하기</SetGoalButton>
        )}
      </EmptyCard>
    );
  }

  const statusConfig = STATUS_CONFIG[data.status];
  const timePercent = Math.min(data.timeProgressPercent, 100);

  return (
    <Container>
      <Header>
        <Title>목표 진행률</Title>
        <StatusBadge $color={statusConfig.color} $bg={statusConfig.bg}>
          {statusConfig.label}
        </StatusBadge>
      </Header>

      {/* 목표 요약 */}
      <GoalSummary>
        <SummaryItem>
          <SummaryLabel>목표 매출</SummaryLabel>
          <SummaryValue>{formatKRW(data.targetRevenue ?? 0)}</SummaryValue>
        </SummaryItem>
        <SummaryItem>
          <SummaryLabel>목표 기한</SummaryLabel>
          <SummaryValue>{data.targetMonth}</SummaryValue>
        </SummaryItem>
        <SummaryItem>
          <SummaryLabel>남은 기간</SummaryLabel>
          <SummaryValue>{data.monthsRemaining}개월</SummaryValue>
        </SummaryItem>
      </GoalSummary>

      {/* 시간 진행 바 */}
      <ProgressSection>
        <ProgressHeader>
          <ProgressLabel>시간 진행률</ProgressLabel>
          <ProgressPercent>{timePercent.toFixed(1)}%</ProgressPercent>
        </ProgressHeader>
        <ProgressBarBg>
          <ProgressBarFill
            $percent={timePercent}
            $color={timePercent >= 80 ? '#ef476f' : timePercent >= 50 ? '#f4a261' : '#4361ee'}
          />
        </ProgressBarBg>
        <ProgressMeta>
          {data.monthsElapsed}개월 경과 / 전체 {data.monthsTotal}개월
        </ProgressMeta>
      </ProgressSection>

      {/* 핵심 지표 */}
      <MetricGrid>
        <MetricCard>
          <MetricLabel>BEP 수량</MetricLabel>
          <MetricValue $color="#4361ee">
            {data.bepQuantity.toFixed(0)}개
          </MetricValue>
        </MetricCard>
        <MetricCard>
          <MetricLabel>월간 필요 판매량</MetricLabel>
          <MetricValue $color={data.status === 'BEHIND' ? '#ef476f' : '#1a1a2e'}>
            {data.requiredMonthlySales.toFixed(1)}개/월
          </MetricValue>
        </MetricCard>
        <MetricCard>
          <MetricLabel>일일 판매 페이스</MetricLabel>
          <MetricValue $color="#f4a261">
            {data.dailySalesTarget.toFixed(1)}개/일
          </MetricValue>
        </MetricCard>
        <MetricCard>
          <MetricLabel>현재 실질 시급</MetricLabel>
          <MetricValue $color="#06d6a0">
            {formatKRW(data.currentShadowWage)}
          </MetricValue>
        </MetricCard>
      </MetricGrid>

      {/* 인사이트 텍스트 */}
      <InsightBox $status={data.status}>
        {generateInsight(data)}
      </InsightBox>
    </Container>
  );
}

function generateInsight(data: GoalProgressResponse): string {
  const { status, monthsRemaining, requiredMonthlySales, dailySalesTarget, monthlyCostAverage } = data;

  switch (status) {
    case 'ON_TRACK':
      return `현재 페이스대로라면 목표 달성이 가능합니다. 일일 ${dailySalesTarget.toFixed(1)}개 판매를 유지하세요.`;
    case 'BEHIND':
      return `월 ${requiredMonthlySales.toFixed(0)}개 판매가 필요하지만, BEP가 이를 초과합니다. 비용 절감이나 가격 조정을 검토해보세요.`;
    case 'URGENT':
      return `${monthsRemaining}개월 남았습니다. 월 평균 비용 ${formatKRW(monthlyCostAverage)}를 줄이거나 판매 전략을 재검토하세요.`;
    case 'EXPIRED':
      return '목표 기한이 지났습니다. 새로운 목표를 설정해보세요.';
    default:
      return '';
  }
}

/* ── styled ── */

const Container = styled.div`
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Title = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0;
`;

const StatusBadge = styled.span<{ $color: string; $bg: string }>`
  padding: 0.25rem 0.75rem;
  background: ${({ $bg }) => $bg};
  color: ${({ $color }) => $color};
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
`;

const GoalSummary = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const SummaryItem = styled.div`
  flex: 1;
  min-width: 100px;
`;

const SummaryLabel = styled.div`
  font-size: 0.6875rem;
  color: #adb5bd;
  margin-bottom: 0.125rem;
`;

const SummaryValue = styled.div`
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1a1a2e;
`;

const ProgressSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
`;

const ProgressHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
`;

const ProgressLabel = styled.span`
  font-size: 0.8125rem;
  color: #495057;
  font-weight: 500;
`;

const ProgressPercent = styled.span`
  font-size: 0.875rem;
  font-weight: 700;
  color: #1a1a2e;
`;

const ProgressBarBg = styled.div`
  height: 10px;
  background: #f1f3f5;
  border-radius: 5px;
  overflow: hidden;
`;

const ProgressBarFill = styled.div<{ $percent: number; $color: string }>`
  height: 100%;
  width: ${({ $percent }) => $percent}%;
  background: ${({ $color }) => $color};
  border-radius: 5px;
  transition: width 0.6s ease;
`;

const ProgressMeta = styled.span`
  font-size: 0.6875rem;
  color: #adb5bd;
`;

const MetricGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const MetricCard = styled.div`
  background: #f8f9fa;
  padding: 0.875rem 1rem;
  border-radius: 8px;
`;

const MetricLabel = styled.div`
  font-size: 0.6875rem;
  color: #adb5bd;
  margin-bottom: 0.25rem;
`;

const MetricValue = styled.div<{ $color: string }>`
  font-size: 1.125rem;
  font-weight: 700;
  color: ${({ $color }) => $color};
`;

const InsightBox = styled.div<{ $status: GoalStatus }>`
  padding: 0.75rem 1rem;
  background: ${({ $status }) => STATUS_CONFIG[$status]?.bg || '#f1f3f5'};
  border-left: 3px solid ${({ $status }) => STATUS_CONFIG[$status]?.color || '#6c757d'};
  border-radius: 8px;
  font-size: 0.8125rem;
  color: #495057;
  line-height: 1.5;
`;

/* ── 빈 상태 ── */

const EmptyCard = styled.div`
  background: #fff;
  border: 2px dashed #dee2e6;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
`;

const EmptyTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #495057;
  margin: 0;
`;

const EmptyDesc = styled.p`
  font-size: 0.8125rem;
  color: #adb5bd;
  margin: 0;
  max-width: 320px;
`;

const SetGoalButton = styled.button`
  margin-top: 0.5rem;
  padding: 0.5rem 1.25rem;
  background: #4361ee;
  color: #fff;
  border-radius: 8px;
  font-size: 0.8125rem;
  font-weight: 600;
  transition: background 0.2s;

  &:hover {
    background: #3a56d4;
  }
`;
