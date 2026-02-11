import { useMemo } from 'react';
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
import styled from 'styled-components';
import type { CalculateRequest, CalculateResponse } from '../types/finance';

interface Props {
  formData: CalculateRequest;
  result: CalculateResponse;
}

const POINT_COUNT = 50;

export default function BepChart({ formData, result }: Props) {
  const chartData = useMemo(() => {
    const maxQty = Math.max(Math.ceil(result.break_even_point * 2), 10);
    const step = Math.max(1, Math.floor(maxQty / POINT_COUNT));
    const data = [];

    for (let q = 0; q <= maxQty; q += step) {
      data.push({
        quantity: q,
        revenue: formData.price * q,
        totalCost: formData.fixed_cost + formData.variable_cost * q,
        fixedCost: formData.fixed_cost,
      });
    }
    return data;
  }, [formData, result.break_even_point]);

  const bepRevenue = formData.price * result.break_even_point;

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
            label={{ value: '판매량 (개)', position: 'insideBottomRight', offset: -5 }}
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
                revenue: '총 수익',
                totalCost: '총 비용',
                fixedCost: '고정비',
              };
              const formatted = typeof value === 'number'
                ? new Intl.NumberFormat('ko-KR').format(Math.round(value)) + '원'
                : '-';
              return [formatted, labels[name ?? ''] ?? name];
            }}
            labelFormatter={(qty) => `판매량: ${qty}개`}
          />
          <Legend
            formatter={(value: string) => {
              const labels: Record<string, string> = {
                revenue: '총 수익',
                totalCost: '총 비용',
                fixedCost: '고정비',
              };
              return labels[value] ?? value;
            }}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#4361ee"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="totalCost"
            stroke="#ef476f"
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
            y={bepRevenue}
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

const Card = styled.div`
  background: #fff;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
`;

const Title = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a2e;
  margin-bottom: 1rem;
`;
