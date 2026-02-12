import styled from 'styled-components';
import { theme } from '../styles/theme';
import type { CalculateResponse } from '../types/finance';
import { formatKRW, formatPercent, formatQuantity } from '../utils/formatNumber';

interface Props {
  result: CalculateResponse;
}

export default function ResultCards({ result }: Props) {
  const metrics = [
    {
      label: '월 최소 건수 (BEP)',
      value: formatQuantity(result.break_even_point),
      color: theme.colors.primary,
    },
    {
      label: '목표 건수',
      value: formatQuantity(result.target_quantity),
      color: theme.colors.secondary,
    },
    {
      label: '월 수익',
      value: formatKRW(result.operating_profit),
      color: result.operating_profit >= 0 ? theme.colors.success : theme.colors.danger,
    },
    {
      label: '기회비용 반영 수익',
      value: formatKRW(result.economic_profit),
      color: result.economic_profit >= 0 ? theme.colors.success : theme.colors.danger,
    },
    {
      label: '안전마진율',
      value: formatPercent(result.margin_rate),
      color: result.margin_rate >= 20 ? theme.colors.success : result.margin_rate >= 0 ? theme.colors.warning : theme.colors.danger,
    },
    {
      label: '건당 순수익',
      value: formatKRW(result.contribution_margin),
      color: result.contribution_margin >= 0 ? theme.colors.success : theme.colors.danger,
    },
  ];

  return (
    <Container>
      <ViabilityBadge $viable={result.is_viable}>
        {result.is_viable ? '지속 가능' : '지속 불가'}
      </ViabilityBadge>
      <Grid>
        {metrics.map(({ label, value, color }) => (
          <Card key={label} $accentColor={color}>
            <CardLabel>{label}</CardLabel>
            <CardValue $color={color}>{value}</CardValue>
          </Card>
        ))}
      </Grid>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ViabilityBadge = styled.div<{ $viable: boolean }>`
  text-align: center;
  padding: 0.75rem;
  border-radius: 12px;
  font-size: 1.125rem;
  font-weight: 700;
  color: ${theme.colors.surface};
  background: ${({ $viable }) => ($viable ? theme.colors.success : theme.colors.danger)};
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div<{ $accentColor: string }>`
  background: ${theme.colors.surface};
  padding: 1rem 1.25rem;
  border-radius: 12px;
  border-left: 4px solid ${({ $accentColor }) => $accentColor};
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
`;

const CardLabel = styled.div`
  font-size: 0.75rem;
  color: ${theme.colors.textSecondary};
  margin-bottom: 0.25rem;
`;

const CardValue = styled.div<{ $color: string }>`
  font-size: 1.125rem;
  font-weight: 700;
  color: ${({ $color }) => $color};
`;
