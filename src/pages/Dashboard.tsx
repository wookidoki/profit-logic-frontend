import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { PrimaryButton } from '../styles/shared';
import { dashboardApi } from '../api/dashboardApi';
import type { DashboardSummary, ProjectInsight, ProjectStatus } from '../api/dashboardApi';
import { formatKRW, formatPercent } from '../utils/formatNumber';

const STATUS_CONFIG: Record<ProjectStatus, { label: string; color: string }> = {
  STABLE: { label: '안정', color: '#06d6a0' },
  NORMAL: { label: '보통', color: '#4361ee' },
  WARNING: { label: '주의', color: '#ffd166' },
  DANGER: { label: '위험', color: '#ef476f' },
  NO_DATA: { label: '분석 필요', color: '#adb5bd' },
};

const CATEGORY_LABELS: Record<string, { emoji: string; name: string }> = {
  WEB_NOVEL: { emoji: '\u270D\uFE0F', name: '\uC6F9\uC18C\uC124' },
  SHORT_FORM: { emoji: '\uD83C\uDFAC', name: '\uC21F\uD3FC' },
  EMOTICON: { emoji: '\uD83D\uDE0A', name: '\uC774\uBAA8\uD2F0\uCF58' },
  BLOG: { emoji: '\uD83D\uDCDD', name: '\uBE14\uB85C\uADF8' },
  INDIE_DEV: { emoji: '\uD83D\uDCBB', name: '\uC778\uB514\uAC1C\uBC1C' },
};

const ACTION_CARD_STYLE: Record<string, { color: string; bg: string }> = {
  WARNING: { color: '#ef476f', bg: '#fff5f5' },
  POSITIVE: { color: '#06d6a0', bg: '#f0fdf9' },
  SUGGESTION: { color: '#f4a261', bg: '#fffbf0' },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await dashboardApi.getSummary();
        if (!cancelled && res.data.success && res.data.data) {
          setData(res.data.data);
        }
      } catch {
        // silent
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return <LoadingContainer>대시보드를 불러오는 중...</LoadingContainer>;
  }

  const isEmpty = !data || data.totalProjects === 0;

  return (
    <Container>
      {/* 빠른 액션 바 */}
      <QuickActions>
        <ActionButton onClick={() => navigate('/projects/new')}>
          + 새 프로젝트
        </ActionButton>
        <ActionButtonSecondary onClick={() => navigate('/consult')}>
          맞춤 상담
        </ActionButtonSecondary>
        <ActionButtonSecondary onClick={() => navigate('/chat')}>
          AI 챗봇
        </ActionButtonSecondary>
      </QuickActions>

      {isEmpty ? (
        <EmptyState>
          <EmptyIcon>📊</EmptyIcon>
          <EmptyTitle>첫 프로젝트를 만들어보세요!</EmptyTitle>
          <EmptyDesc>
            프로젝트를 생성하면 손익분기점, 실질 시급, 비용 구조를 분석할 수 있습니다.
          </EmptyDesc>
          <EmptyActions>
            <CreateButton onClick={() => navigate('/consult')}>
              맞춤 상담 시작하기
            </CreateButton>
            <EmptySecondaryBtn onClick={() => navigate('/projects/new')}>
              직접 입력으로 만들기
            </EmptySecondaryBtn>
          </EmptyActions>
        </EmptyState>
      ) : (
        <>
          {/* 상단 요약 */}
          <SummaryGrid>
            <SummaryCard>
              <SummaryLabel>총 프로젝트</SummaryLabel>
              <SummaryValue>{data!.totalProjects}개</SummaryValue>
            </SummaryCard>
            <SummaryCard>
              <SummaryLabel>추정 월 매출</SummaryLabel>
              <SummaryValue>{formatKRW(data!.totalEstimatedRevenue)}</SummaryValue>
            </SummaryCard>
            <SummaryCard>
              <SummaryLabel>평균 공헌이익률</SummaryLabel>
              <SummaryValue>{formatPercent(data!.avgContributionMarginRate)}</SummaryValue>
            </SummaryCard>
            <SummaryCard>
              <SummaryLabel>평균 실질 시급</SummaryLabel>
              <SummaryValue $highlight={(data!.avgShadowWage ?? 0) > 0 && (data!.avgShadowWage ?? 0) < 9860}>
                {formatKRW(data!.avgShadowWage)}
              </SummaryValue>
            </SummaryCard>
            {data!.warningCount > 0 && (
              <SummaryCard $accent>
                <SummaryLabel>주의 프로젝트</SummaryLabel>
                <SummaryValue $highlight>{data!.warningCount}개</SummaryValue>
              </SummaryCard>
            )}
          </SummaryGrid>

          {/* 프로젝트 인사이트 카드 */}
          <ProjectGrid>
            {data!.projects.map((insight) => (
              <InsightCard
                key={insight.projectId}
                insight={insight}
                onClick={() => navigate(`/projects/${insight.projectId}`)}
              />
            ))}
          </ProjectGrid>
        </>
      )}
    </Container>
  );
}

function InsightCard({ insight, onClick }: { insight: ProjectInsight; onClick: () => void }) {
  const statusConfig = STATUS_CONFIG[insight.status] || STATUS_CONFIG.NO_DATA;
  const topCard = insight.topActionCard;
  const cardStyle = topCard ? ACTION_CARD_STYLE[topCard.type] || ACTION_CARD_STYLE.SUGGESTION : null;

  return (
    <ProjectCard onClick={onClick} $borderColor={statusConfig.color}>
      <CardHeader>
        <CardTitleRow>
          {insight.creatorCategory && CATEGORY_LABELS[insight.creatorCategory] && (
            <CategoryTag>
              {CATEGORY_LABELS[insight.creatorCategory].emoji} {CATEGORY_LABELS[insight.creatorCategory].name}
            </CategoryTag>
          )}
          <CardTitle>{insight.title}</CardTitle>
        </CardTitleRow>
        <StatusBadge $color={statusConfig.color}>
          {statusConfig.label}
        </StatusBadge>
      </CardHeader>

      {insight.status !== 'NO_DATA' ? (
        <>
          <MetricsRow>
            <Metric>
              <MetricLabel>BEP</MetricLabel>
              <MetricValue>{(insight.bep ?? 0).toLocaleString('ko-KR', { maximumFractionDigits: 0 })}개</MetricValue>
            </Metric>
            <Metric>
              <MetricLabel>공헌이익률</MetricLabel>
              <MetricValue>{formatPercent(insight.contributionMarginRate)}</MetricValue>
            </Metric>
            <Metric>
              <MetricLabel>실질 시급</MetricLabel>
              <MetricValue $warn={(insight.shadowWage ?? 0) < 9860}>
                {formatKRW(insight.shadowWage)}
              </MetricValue>
            </Metric>
          </MetricsRow>

          {topCard && cardStyle && (
            <ActionCardBanner $bg={cardStyle.bg} $color={cardStyle.color}>
              <ActionCardTitle>{topCard.title}</ActionCardTitle>
            </ActionCardBanner>
          )}
        </>
      ) : (
        <NoDataMsg>비용과 시간을 입력하면 분석을 시작합니다</NoDataMsg>
      )}
    </ProjectCard>
  );
}

/* ── Styled Components ── */

const Container = styled.main`
  max-width: 1200px;
  margin: 1.5rem auto;
  padding: 0 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  font-size: 0.875rem;
  color: #6c757d;
`;

/* ── Quick Actions ── */

const QuickActions = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  padding: 0.625rem 1.25rem;
  background: #4361ee;
  color: #fff;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  transition: background 0.2s;

  &:hover {
    background: #3a56d4;
  }
`;

const ActionButtonSecondary = styled.button`
  padding: 0.625rem 1.25rem;
  background: #fff;
  color: #4361ee;
  border: 1px solid #4361ee;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  transition: all 0.2s;

  &:hover {
    background: #4361ee;
    color: #fff;
  }
`;

/* ── Empty State ── */

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
  gap: 0.5rem;
`;

const EmptyIcon = styled.div`
  font-size: 3rem;
`;

const EmptyTitle = styled.h3`
  font-size: 1.25rem;
  color: #1a1a2e;
`;

const EmptyDesc = styled.p`
  color: #6c757d;
  max-width: 360px;
  line-height: 1.5;
`;

const EmptyActions = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
  flex-wrap: wrap;
`;

const CreateButton = styled(PrimaryButton)``;

const EmptySecondaryBtn = styled.button`
  padding: 0.75rem 1.5rem;
  background: #fff;
  color: #4361ee;
  border: 1px solid #4361ee;
  border-radius: 8px;
  font-size: 0.9375rem;
  font-weight: 600;
  transition: all 0.2s;

  &:hover {
    background: #4361ee;
    color: #fff;
  }
`;

/* ── Summary Cards ── */

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1rem;
`;

const SummaryCard = styled.div<{ $accent?: boolean }>`
  background: ${({ $accent }) => ($accent ? '#fff5f5' : '#fff')};
  padding: 1.25rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  ${({ $accent }) => $accent && 'border: 1px solid #ef476f20;'}
`;

const SummaryLabel = styled.div`
  font-size: 0.75rem;
  color: #6c757d;
  margin-bottom: 0.375rem;
`;

const SummaryValue = styled.div<{ $highlight?: boolean }>`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${({ $highlight }) => ($highlight ? '#ef476f' : '#1a1a2e')};
`;

/* ── Project Insight Card Grid ── */

const ProjectGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1rem;
`;

const ProjectCard = styled.div<{ $borderColor: string }>`
  background: #fff;
  padding: 1.25rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.2s;
  border-left: 4px solid ${({ $borderColor }) => $borderColor};
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  &:hover {
    box-shadow: 0 4px 12px rgba(67, 97, 238, 0.12);
    transform: translateY(-2px);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CardTitleRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
  min-width: 0;
  margin-right: 0.5rem;
`;

const CategoryTag = styled.span`
  font-size: 0.6875rem;
  color: #7209b7;
  font-weight: 500;
`;

const CardTitle = styled.h3`
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1a1a2e;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StatusBadge = styled.span<{ $color: string }>`
  padding: 0.25rem 0.625rem;
  border-radius: 20px;
  font-size: 0.6875rem;
  font-weight: 600;
  color: ${({ $color }) => $color};
  background: ${({ $color }) => $color + '18'};
  white-space: nowrap;
`;

const MetricsRow = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const Metric = styled.div`
  flex: 1;
`;

const MetricLabel = styled.div`
  font-size: 0.6875rem;
  color: #6c757d;
  margin-bottom: 0.125rem;
`;

const MetricValue = styled.div<{ $warn?: boolean }>`
  font-size: 0.8125rem;
  font-weight: 600;
  color: ${({ $warn }) => ($warn ? '#ef476f' : '#1a1a2e')};
`;

const ActionCardBanner = styled.div<{ $bg: string; $color: string }>`
  padding: 0.5rem 0.75rem;
  background: ${({ $bg }) => $bg};
  border-left: 3px solid ${({ $color }) => $color};
  border-radius: 6px;
`;

const ActionCardTitle = styled.div`
  font-size: 0.75rem;
  font-weight: 500;
  color: #495057;
  line-height: 1.4;
`;

const NoDataMsg = styled.div`
  font-size: 0.8125rem;
  color: #adb5bd;
  text-align: center;
  padding: 0.5rem 0;
`;
