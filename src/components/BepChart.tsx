import { useMemo } from 'react';
import styled from 'styled-components';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceDot,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '../styles/shared';
import type { CalculateResponse } from '../types/finance';

interface Props {
  result: CalculateResponse;
}

const POINT_COUNT = 50;

export default function BepChart({ result }: Props) {
  const fixedCost = result.break_even_point * result.contribution_margin;

  const chartData = useMemo(() => {
    const maxQty = Math.max(Math.ceil(result.break_even_point * 2), 10);
    const step = Math.max(1, Math.floor(maxQty / POINT_COUNT));
    const data = [];

    for (let q = 0; q <= maxQty; q += step) {
      data.push({
        quantity: q,
        contributionTotal: result.contribution_margin * q,
        fixedCost,
      });
    }
    return data;
  }, [result.break_even_point, result.contribution_margin, fixedCost]);

  const bepY = fixedCost;

  const formatAxis = (value: number) => {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
    return String(value);
  };

  return (
    <Card>
      <Title>손익분기점 (BEP) 차트</Title>
      <ResponsiveContainer width="100%" height={360}>
        <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
          <XAxis
            dataKey="quantity"
            label={{ value: '작업량 (건)', position: 'insideBottomRight', offset: -5 }}
            tickFormatter={formatAxis}
            fontSize={12}
          />
          <YAxis
            tickFormatter={formatAxis}
            fontSize={12}
            label={{ value: '금액 (원)', angle: -90, position: 'insideLeft', offset: 10 }}
          />
          <Tooltip
            formatter={(value, name) => {
              const labels: Record<string, string> = {
                contributionTotal: '공헌이익 누적',
                fixedCost: '월 고정 지출',
              };
              const formatted = typeof value === 'number'
                ? new Intl.NumberFormat('ko-KR').format(Math.round(value)) + '원'
                : '-';
              return [formatted, labels[name ?? ''] ?? name];
            }}
            labelFormatter={(qty) => `작업량: ${qty}건`}
          />
          <Legend
            formatter={(value: string) => {
              const labels: Record<string, string> = {
                contributionTotal: '공헌이익 누적',
                fixedCost: '월 고정 지출',
              };
              return labels[value] ?? value;
            }}
          />
          <Line
            type="monotone"
            dataKey="contributionTotal"
            stroke="#4361ee"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="fixedCost"
            stroke="#ffd166"
            strokeWidth={2}
            strokeDasharray="6 3"
            dot={false}
          />
          <ReferenceDot
            x={result.break_even_point}
            y={bepY}
            r={6}
            fill="#4361ee"
            stroke="#fff"
            strokeWidth={2}
            label={{ value: 'BEP', position: 'top', fontSize: 12, fontWeight: 700 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}

const Title = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a2e;
  margin-bottom: 1rem;
`;
