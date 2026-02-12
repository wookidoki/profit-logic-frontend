import { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { ErrorBanner, LoadingText } from '../styles/shared';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { analysisApi } from '../api/analysisApi';
import { formatKRW } from '../utils/formatNumber';
import TrendChart from './TrendChart';
import {
  toCostChartData,
  isBelowMinimumWage,
  sortActionCards,
  hasEnoughData,
} from '../utils/analysisHelper';
import type {
  ProjectAnalysisResponse,
  ActionCardDto,
  ActionCardType,
} from '../types';

const ACTION_CARD_CONFIG: Record<ActionCardType, { color: string; bg: string; icon: string }> = {
  WARNING: { color: '#ef476f', bg: '#fff5f5', icon: '⚠️' },
  POSITIVE: { color: '#06d6a0', bg: '#f0fdf9', icon: '✅' },
  SUGGESTION: { color: '#f4a261', bg: '#fffbf0', icon: '💡' },
};

interface Props {
  projectId: number;
  onNavigateTab?: (tab: string) => void;
}

export default function EnhancedAnalysisPanel({ projectId, onNavigateTab }: Props) {
  const [data, setData] = useState<ProjectAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalysis = useCallback(async () => {
    try {
      const res = await analysisApi.getAnalysis(projectId);
      if (res.data.success && res.data.data) {
        setData(res.data.data);
      } else {
        setError(res.data.message || '분석 데이터를 불러올 수 없습니다.');
      }
    } catch {
      setError('종합 분석을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchAnalysis();
  }, [fetchAnalysis]);

  if (loading) return <LoadingText>종합 분석 중...</LoadingText>;
  if (error) return <ErrorBanner>{error}</ErrorBanner>;
  if (!data) return null;

  const { cost_breakdown, shadow_wage, bep, action_cards } = data;
  const chartData = toCostChartData(cost_breakdown);
  const sortedCards = sortActionCards(action_cards);
  const belowMinWage = isBelowMinimumWage(shadow_wage);
  const { hasCostData, hasTimeData } = hasEnoughData(cost_breakdown, shadow_wage);

  // 안전마진율 = (1 - BEP/실제판매량) 근사 → minimumWageRatio로 대체 표시
  const safetyMargin = bep.contribution_margin > 0
    ? ((bep.price - bep.variable_cost_per_unit) / bep.price * 100)
    : 0;

  return (
    <Panel>
      {/* 데이터 부족 안내 */}
      {(!hasCostData || !hasTimeData) && (
        <DataGuideBanner>
          <GuideIcon>📝</GuideIcon>
          <GuideContent>
            <GuideTitle>더 정확한 분석을 위해 데이터를 추가해주세요</GuideTitle>
            <GuideLinks>
              {!hasCostData && (
                <GuideLink onClick={() => onNavigateTab?.('costs')}>
                  → 비용 상세 입력하기
                </GuideLink>
              )}
              {!hasTimeData && (
                <GuideLink onClick={() => onNavigateTab?.('timelogs')}>
                  → 작업시간 기록하기
                </GuideLink>
              )}
            </GuideLinks>
          </GuideContent>
        </DataGuideBanner>
      )}

      {/* 월별 추이 차트 */}
      <TrendChart projectId={projectId} />

      {/* 액션 카드 */}
      {sortedCards.length > 0 && (
        <Section>
          <SectionTitle>진단 결과</SectionTitle>
          <CardList>
            {sortedCards.map((card, i) => (
              <ActionCard key={i} card={card} />
            ))}
          </CardList>
        </Section>
      )}

      {/* 핵심 지표 카드 3개 */}
      <Section>
        <SectionTitle>핵심 지표</SectionTitle>
        <MetricGrid>
          <MetricCard>
            <MetricLabel>실질 시급</MetricLabel>
            <MetricValue $color={belowMinWage ? '#ef476f' : '#06d6a0'}>
              {formatKRW(shadow_wage.real_shadow_wage)}
            </MetricValue>
            <MetricSub $color={belowMinWage ? '#ef476f' : '#6c757d'}>
              최저임금 대비 {(shadow_wage.minimum_wage_ratio ?? 0).toFixed(1)}%
            </MetricSub>
          </MetricCard>
          <MetricCard>
            <MetricLabel>BEP 수량</MetricLabel>
            <MetricValue $color="#4361ee">
              {(bep.bep ?? 0).toLocaleString('ko-KR', { maximumFractionDigits: 1 })}개
            </MetricValue>
            <MetricSub>
              공헌이익 {formatKRW(bep.contribution_margin)}
            </MetricSub>
          </MetricCard>
          <MetricCard>
            <MetricLabel>공헌이익률</MetricLabel>
            <MetricValue $color={safetyMargin >= 30 ? '#06d6a0' : safetyMargin >= 15 ? '#f4a261' : '#ef476f'}>
              {(safetyMargin ?? 0).toFixed(1)}%
            </MetricValue>
            <MetricSub>
              적용 고정비 {formatKRW(bep.enhanced_fixed_cost)}
            </MetricSub>
          </MetricCard>
        </MetricGrid>
      </Section>

      {/* 비용 구조 차트 */}
      {chartData.length > 0 && (
        <Section>
          <SectionTitle>비용 구조</SectionTitle>
          <ChartCard>
            <CostSummary>
              <CostSummaryItem>
                <MetricLabel>총 비용</MetricLabel>
                <CostValue>{formatKRW(cost_breakdown.total_cost)}</CostValue>
              </CostSummaryItem>
              <CostSummaryItem>
                <MetricLabel>고정비</MetricLabel>
                <CostValue>{formatKRW(cost_breakdown.total_fixed_cost)}</CostValue>
              </CostSummaryItem>
              <CostSummaryItem>
                <MetricLabel>변동비</MetricLabel>
                <CostValue>{formatKRW(cost_breakdown.total_variable_cost)}</CostValue>
              </CostSummaryItem>
            </CostSummary>
            <ChartWrapper>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                  >
                    {chartData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => `${Number(value).toFixed(1)}%`}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartWrapper>
          </ChartCard>
        </Section>
      )}

      {/* 실질 시급 상세 */}
      <Section>
        <SectionTitle>실질 시급 분석</SectionTitle>
        {!hasTimeData && (
          <InfoBanner>작업시간 기록이 없어 프로젝트 기본 근무시간으로 계산했습니다.</InfoBanner>
        )}
        <DetailGrid>
          <DetailItem>
            <MetricLabel>총 투입시간</MetricLabel>
            <DetailValue>{(shadow_wage.total_hours ?? 0).toFixed(1)}시간</DetailValue>
          </DetailItem>
          <DetailItem>
            <MetricLabel>영업이익</MetricLabel>
            <DetailValue>{formatKRW(shadow_wage.operating_profit)}</DetailValue>
          </DetailItem>
          <DetailItem>
            <MetricLabel>최저임금</MetricLabel>
            <DetailValue>{formatKRW(shadow_wage.minimum_wage)}</DetailValue>
          </DetailItem>
        </DetailGrid>
        <WageBar>
          <WageBarFill
            $ratio={Math.min(shadow_wage.minimum_wage_ratio ?? 0, 200)}
            $over={!belowMinWage}
          />
          <WageBarMark>
            <WageBarMarkLabel>최저임금</WageBarMarkLabel>
          </WageBarMark>
        </WageBar>
      </Section>
    </Panel>
  );
}

/* ── ActionCard 서브컴포넌트 ── */

function ActionCard({ card }: { card: ActionCardDto }) {
  const config = ACTION_CARD_CONFIG[card.type];
  return (
    <ActionCardWrapper $bg={config.bg} $color={config.color}>
      <ActionCardIcon>{config.icon}</ActionCardIcon>
      <ActionCardBody>
        <ActionCardTitle $color={config.color}>{card.title}</ActionCardTitle>
        <ActionCardDesc>{card.description}</ActionCardDesc>
      </ActionCardBody>
    </ActionCardWrapper>
  );
}

/* ── styled-components ── */

const Panel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const SectionTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a2e;
`;

const InfoBanner = styled.div`
  padding: 0.625rem 1rem;
  background: #eef2ff;
  color: #4361ee;
  border-radius: 8px;
  font-size: 0.8125rem;
`;

/* ── 데이터 부족 안내 ── */

const DataGuideBanner = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  background: #fffbf0;
  border: 1px solid #f4a261;
  border-radius: 10px;
`;

const GuideIcon = styled.span`
  font-size: 1.25rem;
  flex-shrink: 0;
`;

const GuideContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
`;

const GuideTitle = styled.span`
  font-size: 0.875rem;
  font-weight: 600;
  color: #495057;
`;

const GuideLinks = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const GuideLink = styled.button`
  background: transparent;
  color: #4361ee;
  font-size: 0.8125rem;
  text-align: left;
  padding: 0;
  transition: color 0.2s;

  &:hover {
    color: #3a56d4;
    text-decoration: underline;
  }
`;

/* ── 핵심 지표 카드 ── */

const MetricGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const MetricCard = styled.div`
  background: #fff;
  padding: 1.25rem;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
`;

const MetricLabel = styled.div`
  font-size: 0.6875rem;
  color: #adb5bd;
  margin-bottom: 0.25rem;
`;

const MetricValue = styled.div<{ $color?: string }>`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${({ $color }) => $color || '#1a1a2e'};
`;

const MetricSub = styled.div<{ $color?: string }>`
  font-size: 0.75rem;
  color: ${({ $color }) => $color || '#adb5bd'};
  margin-top: 0.25rem;
`;

/* ── 비용 구조 차트 ── */

const ChartCard = styled.div`
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 1.25rem;
`;

const CostSummary = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
`;

const CostSummaryItem = styled.div``;

const CostValue = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a2e;
`;

const ChartWrapper = styled.div`
  width: 100%;
`;

/* ── 실질 시급 상세 ── */

const DetailGrid = styled.div`
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
`;

const DetailItem = styled.div`
  flex: 1;
  min-width: 100px;
  background: #fff;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
`;

const DetailValue = styled.div`
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1a1a2e;
`;

const WageBar = styled.div`
  position: relative;
  height: 8px;
  background: #f1f3f5;
  border-radius: 4px;
`;

const WageBarFill = styled.div<{ $ratio: number; $over: boolean }>`
  height: 100%;
  width: ${({ $ratio }) => Math.min($ratio / 2, 100)}%;
  background: ${({ $over }) => ($over ? '#06d6a0' : '#ef476f')};
  border-radius: 4px;
  transition: width 0.6s ease;
`;

const WageBarMark = styled.div`
  position: absolute;
  top: -4px;
  left: 50%;
  width: 2px;
  height: 16px;
  background: #6c757d;
`;

const WageBarMarkLabel = styled.span`
  position: absolute;
  top: 18px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.625rem;
  color: #6c757d;
  white-space: nowrap;
`;

/* ── 액션 카드 ── */

const CardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ActionCardWrapper = styled.div<{ $bg: string; $color: string }>`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  background: ${({ $bg }) => $bg};
  border-left: 3px solid ${({ $color }) => $color};
  border-radius: 8px;
`;

const ActionCardIcon = styled.span`
  font-size: 1.125rem;
  flex-shrink: 0;
  margin-top: 1px;
`;

const ActionCardBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
`;

const ActionCardTitle = styled.span<{ $color: string }>`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ $color }) => $color};
`;

const ActionCardDesc = styled.span`
  font-size: 0.8125rem;
  color: #495057;
  line-height: 1.4;
`;
