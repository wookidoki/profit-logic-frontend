import { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { useDebounce } from '../hooks/useDebounce';
import { useCalculate } from '../hooks/useCalculate';
import { formatKRW, formatPercent, formatQuantity } from '../utils/formatNumber';
import type { CalculateRequest, CalculateResponse } from '../types/finance';

interface Props {
  baseData: CalculateRequest;
  baseResult: CalculateResponse;
}

interface SliderConfig {
  key: keyof CalculateRequest;
  label: string;
}

const sliders: SliderConfig[] = [
  { key: 'price', label: '판매가' },
  { key: 'variable_cost', label: '변동비' },
  { key: 'fixed_cost', label: '고정비' },
  { key: 'work_hours', label: '근무시간' },
  { key: 'hourly_wage', label: '시급' },
  { key: 'target_profit', label: '목표이익' },
];

export default function ScenarioSimulator({ baseData, baseResult }: Props) {
  const [adjustments, setAdjustments] = useState<Record<string, number>>(() =>
    Object.fromEntries(sliders.map((s) => [s.key, 0]))
  );
  const { result: simResult, loading, calculate } = useCalculate();

  const adjustedData = useMemo<CalculateRequest>(() => ({
    price: baseData.price * (1 + adjustments.price / 100),
    variable_cost: baseData.variable_cost * (1 + adjustments.variable_cost / 100),
    fixed_cost: baseData.fixed_cost * (1 + adjustments.fixed_cost / 100),
    work_hours: Math.round(baseData.work_hours * (1 + adjustments.work_hours / 100)),
    hourly_wage: baseData.hourly_wage * (1 + adjustments.hourly_wage / 100),
    target_profit: baseData.target_profit * (1 + adjustments.target_profit / 100),
  }), [baseData, adjustments]);

  const debouncedData = useDebounce(adjustedData, 300);

  const hasChanges = Object.values(adjustments).some((v) => v !== 0);

  useEffect(() => {
    if (hasChanges) {
      calculate(debouncedData);
    }
  }, [debouncedData]);

  const displayResult = hasChanges && simResult ? simResult : baseResult;

  const handleSliderChange = (key: string, value: number) => {
    setAdjustments((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setAdjustments(Object.fromEntries(sliders.map((s) => [s.key, 0])));
  };

  const formatValue = (key: string, base: number, pct: number) => {
    const adjusted = base * (1 + pct / 100);
    return key === 'work_hours' ? `${Math.round(adjusted)}시간` : formatKRW(adjusted);
  };

  return (
    <Card>
      <Header>
        <Title>시나리오 시뮬레이션</Title>
        {hasChanges && (
          <ResetButton type="button" onClick={handleReset}>초기화</ResetButton>
        )}
      </Header>
      <Description>슬라이더를 움직여 "만약 ~한다면?" 시나리오를 테스트하세요.</Description>

      <SliderList>
        {sliders.map(({ key, label }) => (
          <SliderRow key={key}>
            <SliderLabel>
              <span>{label}</span>
              <PctBadge $positive={adjustments[key] > 0} $negative={adjustments[key] < 0}>
                {adjustments[key] > 0 ? '+' : ''}{adjustments[key]}%
              </PctBadge>
            </SliderLabel>
            <RangeSlider
              type="range"
              min={-50}
              max={100}
              step={5}
              value={adjustments[key]}
              onChange={(e) => handleSliderChange(key, Number(e.target.value))}
            />
            <ValueRow>
              <BaseValue>{formatValue(key, baseData[key], 0)}</BaseValue>
              <Arrow>→</Arrow>
              <AdjustedValue>{formatValue(key, baseData[key], adjustments[key])}</AdjustedValue>
            </ValueRow>
          </SliderRow>
        ))}
      </SliderList>

      {hasChanges && (
        <ResultSummary>
          <SummaryTitle>{loading ? '계산 중...' : '시뮬레이션 결과'}</SummaryTitle>
          <SummaryGrid>
            <SummaryItem>
              <SummaryLabel>BEP</SummaryLabel>
              <SummaryValue>
                {formatQuantity(displayResult.break_even_point)}
                <Delta value={displayResult.break_even_point - baseResult.break_even_point} invert />
              </SummaryValue>
            </SummaryItem>
            <SummaryItem>
              <SummaryLabel>경제적 이윤</SummaryLabel>
              <SummaryValue>
                {formatKRW(displayResult.economic_profit)}
                <Delta value={displayResult.economic_profit - baseResult.economic_profit} />
              </SummaryValue>
            </SummaryItem>
            <SummaryItem>
              <SummaryLabel>안전마진율</SummaryLabel>
              <SummaryValue>
                {formatPercent(displayResult.margin_rate)}
                <Delta value={displayResult.margin_rate - baseResult.margin_rate} />
              </SummaryValue>
            </SummaryItem>
            <SummaryItem>
              <SummaryLabel>생존가능성</SummaryLabel>
              <ViabilityText $viable={displayResult.is_viable}>
                {displayResult.is_viable ? '가능' : '불가'}
              </ViabilityText>
            </SummaryItem>
          </SummaryGrid>
        </ResultSummary>
      )}
    </Card>
  );
}

function Delta({ value, invert = false }: { value: number; invert?: boolean }) {
  if (Math.abs(value) < 0.01) return null;
  const isPositive = invert ? value < 0 : value > 0;
  const formatted = value > 0 ? `+${value.toFixed(1)}` : value.toFixed(1);
  return <DeltaSpan $positive={isPositive}> ({formatted})</DeltaSpan>;
}

const Card = styled.div`
  background: #fff;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
`;

const Title = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a2e;
`;

const ResetButton = styled.button`
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
  color: #6c757d;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  background: #fff;

  &:hover {
    background: #f8f9fa;
  }
`;

const Description = styled.p`
  font-size: 0.8125rem;
  color: #6c757d;
  margin-bottom: 1.25rem;
`;

const SliderList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const SliderRow = styled.div``;

const SliderLabel = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8125rem;
  font-weight: 500;
  color: #1a1a2e;
  margin-bottom: 0.25rem;
`;

const PctBadge = styled.span<{ $positive: boolean; $negative: boolean }>`
  font-size: 0.75rem;
  font-weight: 600;
  color: ${({ $positive, $negative }) =>
    $positive ? '#06d6a0' : $negative ? '#ef476f' : '#6c757d'};
`;

const RangeSlider = styled.input`
  width: 100%;
  height: 6px;
  appearance: none;
  background: #dee2e6;
  border-radius: 3px;
  outline: none;
  cursor: pointer;

  &::-webkit-slider-thumb {
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #4361ee;
    cursor: pointer;
  }

  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #4361ee;
    border: none;
    cursor: pointer;
  }
`;

const ValueRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.25rem;
  font-size: 0.75rem;
`;

const BaseValue = styled.span`
  color: #6c757d;
`;

const Arrow = styled.span`
  color: #adb5bd;
`;

const AdjustedValue = styled.span`
  font-weight: 600;
  color: #1a1a2e;
`;

const ResultSummary = styled.div`
  margin-top: 1.5rem;
  padding-top: 1.25rem;
  border-top: 1px solid #e9ecef;
`;

const SummaryTitle = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: #1a1a2e;
  margin-bottom: 0.75rem;
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
`;

const SummaryItem = styled.div`
  background: #f8f9fa;
  padding: 0.75rem;
  border-radius: 8px;
`;

const SummaryLabel = styled.div`
  font-size: 0.6875rem;
  color: #6c757d;
  margin-bottom: 0.125rem;
`;

const SummaryValue = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: #1a1a2e;
`;

const DeltaSpan = styled.span<{ $positive: boolean }>`
  font-size: 0.75rem;
  font-weight: 500;
  color: ${({ $positive }) => ($positive ? '#06d6a0' : '#ef476f')};
`;

const ViabilityText = styled.div<{ $viable: boolean }>`
  font-size: 0.875rem;
  font-weight: 700;
  color: ${({ $viable }) => ($viable ? '#06d6a0' : '#ef476f')};
`;
