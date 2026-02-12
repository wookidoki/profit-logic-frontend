import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { PrimaryButton } from '../styles/shared';
import { projectApi } from '../api/projectApi';
import { analysisApi } from '../api/analysisApi';
import { formatKRW, formatPercent } from '../utils/formatNumber';
import type { Project, ProjectAnalysisResponse } from '../types';

const INITIAL_DISPLAY = 5;

interface ProjectWithAnalysis {
  project: Project;
  analysis: ProjectAnalysisResponse | null;
}

function getStatusColor(marginRate: number | undefined): string {
  if (marginRate == null) return '#adb5bd';
  if (marginRate >= 20) return '#06d6a0';
  if (marginRate >= 0) return '#ffd166';
  return '#ef476f';
}

function getStatusLabel(marginRate: number | undefined): string {
  if (marginRate == null) return '분석 필요';
  if (marginRate >= 20) return '안정';
  if (marginRate >= 0) return '주의';
  return '위험';
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [items, setItems] = useState<ProjectWithAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayCount, setDisplayCount] = useState(INITIAL_DISPLAY);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await projectApi.getAll();
        if (cancelled || !res.data.success || !res.data.data) return;
        const projects = res.data.data;

        // 먼저 프로젝트만 세팅 (빠른 렌더)
        setItems(projects.map((p) => ({ project: p, analysis: null })));
        setLoading(false);

        // 분석 데이터 병렬 로드
        const analysisResults = await Promise.allSettled(
          projects.map((p) => analysisApi.getAnalysis(p.id))
        );

        if (cancelled) return;
        setItems(projects.map((p, i) => {
          const result = analysisResults[i];
          const analysis = result.status === 'fulfilled' && result.value.data.success
            ? result.value.data.data
            : null;
          return { project: p, analysis };
        }));
      } catch {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  const displayed = items.slice(0, displayCount);
  const hasMore = items.length > displayCount;

  // 합산 지표 계산
  const analyzedItems = items.filter((i) => i.analysis);
  const totalProjects = items.length;
  const totalRevenue = analyzedItems.reduce((sum, i) => {
    const a = i.analysis!;
    return sum + a.bep.price * a.bep.bep; // 매출 = 가격 x BEP 수량 (근사치)
  }, 0);
  const avgMargin = analyzedItems.length > 0
    ? analyzedItems.reduce((sum, i) => {
        const cards = i.analysis!.action_cards;
        const marginCard = cards.find((c) => c.title.includes('안전마진'));
        if (marginCard) {
          const match = marginCard.description.match(/([-\d.]+)%/);
          return sum + (match ? parseFloat(match[1]) : 0);
        }
        return sum;
      }, 0) / analyzedItems.length
    : 0;
  const avgWage = analyzedItems.length > 0
    ? analyzedItems.reduce((sum, i) => sum + i.analysis!.shadow_wage.real_shadow_wage, 0) / analyzedItems.length
    : 0;

  if (loading) {
    return <LoadingContainer>프로젝트를 불러오는 중...</LoadingContainer>;
  }

  return (
    <Container>
      {/* 빠른 액션 바 */}
      <QuickActions>
        <ActionButton onClick={() => navigate('/projects/new')}>
          + 새 프로젝트 만들기
        </ActionButton>
        <ActionButtonSecondary onClick={() => navigate('/scripts')}>
          맞춤 분석 체험
        </ActionButtonSecondary>
        <ActionButtonSecondary onClick={() => navigate('/chat')}>
          AI 상담
        </ActionButtonSecondary>
      </QuickActions>

      {totalProjects === 0 ? (
        /* 빈 상태 */
        <EmptyState>
          <EmptyIcon>📊</EmptyIcon>
          <EmptyTitle>첫 프로젝트를 만들어보세요!</EmptyTitle>
          <EmptyDesc>프로젝트를 생성하면 손익분기점, 실질 시급, 비용 구조를 분석할 수 있습니다.</EmptyDesc>
          <CreateButton onClick={() => navigate('/projects/new')}>
            프로젝트 만들기
          </CreateButton>
        </EmptyState>
      ) : (
        <>
          {/* 상단 요약 카드 */}
          <SummaryGrid>
            <SummaryCard>
              <SummaryLabel>총 프로젝트</SummaryLabel>
              <SummaryValue>{totalProjects}개</SummaryValue>
            </SummaryCard>
            <SummaryCard>
              <SummaryLabel>총 월 매출 (추정)</SummaryLabel>
              <SummaryValue>{formatKRW(totalRevenue)}</SummaryValue>
            </SummaryCard>
            <SummaryCard>
              <SummaryLabel>평균 안전마진율</SummaryLabel>
              <SummaryValue>{formatPercent(avgMargin)}</SummaryValue>
            </SummaryCard>
            <SummaryCard>
              <SummaryLabel>평균 실질 시급</SummaryLabel>
              <SummaryValue $highlight={avgWage > 0 && avgWage < 9860}>
                {formatKRW(avgWage)}
              </SummaryValue>
            </SummaryCard>
          </SummaryGrid>

          {/* 프로젝트 카드 그리드 */}
          <ProjectGrid>
            {displayed.map(({ project, analysis }) => {
              const marginRate = analysis
                ? (() => {
                    const card = analysis.action_cards.find((c) => c.title.includes('안전마진'));
                    if (card) {
                      const match = card.description.match(/([-\d.]+)%/);
                      return match ? parseFloat(match[1]) : undefined;
                    }
                    return undefined;
                  })()
                : undefined;

              return (
                <ProjectCard key={project.id} onClick={() => navigate(`/projects/${project.id}`)}>
                  <CardHeader>
                    <CardTitle>{project.title}</CardTitle>
                    <StatusBadge $color={getStatusColor(marginRate)}>
                      {getStatusLabel(marginRate)}
                    </StatusBadge>
                  </CardHeader>

                  {analysis ? (
                    <MetricsRow>
                      <Metric>
                        <MetricLabel>BEP</MetricLabel>
                        <MetricValue>{analysis.bep.bep.toLocaleString()}개</MetricValue>
                      </Metric>
                      <Metric>
                        <MetricLabel>안전마진</MetricLabel>
                        <MetricValue>{marginRate != null ? formatPercent(marginRate) : '-'}</MetricValue>
                      </Metric>
                      <Metric>
                        <MetricLabel>실질 시급</MetricLabel>
                        <MetricValue $warn={analysis.shadow_wage.real_shadow_wage < 9860}>
                          {formatKRW(analysis.shadow_wage.real_shadow_wage)}
                        </MetricValue>
                      </Metric>
                    </MetricsRow>
                  ) : (
                    <NoDataMsg>비용과 시간을 입력하면 분석을 시작합니다</NoDataMsg>
                  )}
                </ProjectCard>
              );
            })}
          </ProjectGrid>

          {hasMore && (
            <MoreButton onClick={() => setDisplayCount((c) => c + INITIAL_DISPLAY)}>
              더보기 ({items.length - displayCount}개 남음)
            </MoreButton>
          )}
        </>
      )}
    </Container>
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

const CreateButton = styled(PrimaryButton)`
  margin-top: 1rem;
`;

/* ── Summary Cards ── */

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const SummaryCard = styled.div`
  background: #fff;
  padding: 1.25rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
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

/* ── Project Card Grid ── */

const ProjectGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const ProjectCard = styled.div`
  background: #fff;
  padding: 1.25rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;

  &:hover {
    border-color: #4361ee;
    box-shadow: 0 4px 12px rgba(67, 97, 238, 0.12);
    transform: translateY(-2px);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const CardTitle = styled.h3`
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1a1a2e;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  margin-right: 0.5rem;
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

const NoDataMsg = styled.div`
  font-size: 0.8125rem;
  color: #adb5bd;
  text-align: center;
  padding: 0.5rem 0;
`;

const MoreButton = styled.button`
  padding: 0.75rem;
  background: #fff;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  font-size: 0.875rem;
  color: #6c757d;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;

  &:hover {
    background: #f8f9fa;
    color: #4361ee;
    border-color: #4361ee;
  }
`;
