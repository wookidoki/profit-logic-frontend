import { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { analysisApi } from '../api/analysisApi';
import { formatKRW } from '../utils/formatNumber';
import type {
  ProjectAnalysisResponse,
  ActionCardDto,
  ActionCardType,
  CostCategory,
} from '../types';

const CATEGORY_LABELS: Record<CostCategory, string> = {
  API_USAGE: 'API 사용료',
  SERVER: '서버비',
  TOOL_SUBSCRIPTION: '도구 구독료',
  MATERIAL: '재료비',
  MARKETING: '마케팅비',
  OUTSOURCING: '외주비',
  OTHER: '기타',
};

const ACTION_CARD_CONFIG: Record<ActionCardType, { color: string; bg: string; icon: string }> = {
  WARNING: { color: '#ef476f', bg: '#fff5f5', icon: '⚠️' },
  POSITIVE: { color: '#06d6a0', bg: '#f0fdf9', icon: '✅' },
  SUGGESTION: { color: '#4361ee', bg: '#eef2ff', icon: '💡' },
};

interface Props {
  projectId: number;
}

export default function EnhancedAnalysisPanel({ projectId }: Props) {
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
  const sortedCards = [...action_cards].sort((a, b) => a.priority - b.priority);

  return (
    <Panel>
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

      {/* BEP 분석 */}
      <Section>
        <SectionTitle>손익분기점 (BEP)</SectionTitle>
        <MetricGrid>
          <MetricCard>
            <MetricLabel>BEP 수량</MetricLabel>
            <MetricValue $color="#4361ee">
              {bep.bep.toLocaleString('ko-KR', { maximumFractionDigits: 1 })}개
            </MetricValue>
          </MetricCard>
          <MetricCard>
            <MetricLabel>공헌이익</MetricLabel>
            <MetricValue>{formatKRW(bep.contribution_margin)}</MetricValue>
          </MetricCard>
          <MetricCard>
            <MetricLabel>적용 고정비</MetricLabel>
            <MetricValue>{formatKRW(bep.enhanced_fixed_cost)}</MetricValue>
          </MetricCard>
          <MetricCard>
            <MetricLabel>단위당 변동비</MetricLabel>
            <MetricValue>{formatKRW(bep.variable_cost_per_unit)}</MetricValue>
          </MetricCard>
        </MetricGrid>
      </Section>

      {/* 실질 시급 분석 */}
      <Section>
        <SectionTitle>실질 시급 분석</SectionTitle>
        {!shadow_wage.has_time_data && (
          <InfoBanner>작업시간 기록이 없어 프로젝트 기본 근무시간으로 계산했습니다.</InfoBanner>
        )}
        <MetricGrid>
          <MetricCard>
            <MetricLabel>실질 시급</MetricLabel>
            <MetricValue $color={shadow_wage.real_shadow_wage < shadow_wage.minimum_wage ? '#ef476f' : '#06d6a0'}>
              {formatKRW(shadow_wage.real_shadow_wage)}
            </MetricValue>
          </MetricCard>
          <MetricCard>
            <MetricLabel>최저임금 대비</MetricLabel>
            <MetricValue $color={shadow_wage.minimum_wage_ratio < 100 ? '#ef476f' : '#06d6a0'}>
              {shadow_wage.minimum_wage_ratio.toFixed(1)}%
            </MetricValue>
          </MetricCard>
          <MetricCard>
            <MetricLabel>총 투입시간</MetricLabel>
            <MetricValue>{shadow_wage.total_hours.toFixed(1)}시간</MetricValue>
          </MetricCard>
          <MetricCard>
            <MetricLabel>영업이익</MetricLabel>
            <MetricValue>{formatKRW(shadow_wage.operating_profit)}</MetricValue>
          </MetricCard>
        </MetricGrid>
        <WageBar>
          <WageBarFill
            $ratio={Math.min(shadow_wage.minimum_wage_ratio, 200)}
            $over={shadow_wage.minimum_wage_ratio >= 100}
          />
          <WageBarMark style={{ left: '50%' }}>
            <WageBarMarkLabel>최저임금</WageBarMarkLabel>
          </WageBarMark>
        </WageBar>
      </Section>

      {/* 비용 구조 */}
      <Section>
        <SectionTitle>비용 구조</SectionTitle>
        <MetricGrid $cols={3}>
          <MetricCard>
            <MetricLabel>총 비용</MetricLabel>
            <MetricValue $color="#1a1a2e">{formatKRW(cost_breakdown.total_cost)}</MetricValue>
          </MetricCard>
          <MetricCard>
            <MetricLabel>고정비</MetricLabel>
            <MetricValue>{formatKRW(cost_breakdown.total_fixed_cost)}</MetricValue>
          </MetricCard>
          <MetricCard>
            <MetricLabel>변동비</MetricLabel>
            <MetricValue>{formatKRW(cost_breakdown.total_variable_cost)}</MetricValue>
          </MetricCard>
        </MetricGrid>

        {Object.keys(cost_breakdown.category_ratio).length > 0 && (
          <RatioList>
            {Object.entries(cost_breakdown.category_ratio)
              .sort(([, a], [, b]) => b - a)
              .map(([cat, ratio]) => (
                <RatioItem key={cat}>
                  <RatioHeader>
                    <RatioLabel>{CATEGORY_LABELS[cat as CostCategory] || cat}</RatioLabel>
                    <RatioPercent>{ratio.toFixed(1)}%</RatioPercent>
                  </RatioHeader>
                  <RatioBarBg>
                    <RatioBarFill style={{ width: `${Math.min(ratio, 100)}%` }} />
                  </RatioBarBg>
                </RatioItem>
              ))}
          </RatioList>
        )}
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

const LoadingText = styled.div`
  text-align: center;
  color: #6c757d;
  padding: 2rem 0;
`;

const ErrorBanner = styled.div`
  padding: 0.75rem 1rem;
  background: #fff5f5;
  color: #ef476f;
  border: 1px solid #ef476f;
  border-radius: 8px;
  font-size: 0.875rem;
`;

const InfoBanner = styled.div`
  padding: 0.625rem 1rem;
  background: #eef2ff;
  color: #4361ee;
  border-radius: 8px;
  font-size: 0.8125rem;
`;

/* ── 메트릭 카드 그리드 ── */

const MetricGrid = styled.div<{ $cols?: number }>`
  display: grid;
  grid-template-columns: repeat(${({ $cols }) => $cols || 4}, 1fr);
  gap: 0.75rem;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const MetricCard = styled.div`
  background: #fff;
  padding: 1rem;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
`;

const MetricLabel = styled.div`
  font-size: 0.6875rem;
  color: #adb5bd;
  margin-bottom: 0.25rem;
`;

const MetricValue = styled.div<{ $color?: string }>`
  font-size: 1.125rem;
  font-weight: 700;
  color: ${({ $color }) => $color || '#1a1a2e'};
`;

/* ── 최저임금 대비 바 ── */

const WageBar = styled.div`
  position: relative;
  height: 8px;
  background: #f1f3f5;
  border-radius: 4px;
  margin-top: 0.25rem;
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

/* ── 비용 비율 바 ── */

const RatioList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  background: #fff;
  padding: 1rem;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
`;

const RatioItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const RatioHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const RatioLabel = styled.span`
  font-size: 0.8125rem;
  color: #495057;
`;

const RatioPercent = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  color: #4361ee;
`;

const RatioBarBg = styled.div`
  height: 6px;
  background: #f1f3f5;
  border-radius: 3px;
`;

const RatioBarFill = styled.div`
  height: 100%;
  background: #4361ee;
  border-radius: 3px;
  transition: width 0.4s ease;
`;
