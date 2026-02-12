import { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { LoadingText, ErrorBanner } from '../styles/shared';
import { trendApi } from '../api/trendApi';
import type { MonthlySnapshot } from '../api/trendApi';
import { formatKRW } from '../utils/formatNumber';

type Metric = 'bep' | 'shadowWage' | 'totalCost' | 'safetyMargin';

interface MetricConfig {
  label: string;
  dataKey: keyof MonthlySnapshot;
  color: string;
  format: (v: number) => string;
  unit: string;
}

const METRICS: Record<Metric, MetricConfig> = {
  bep: {
    label: 'BEP 수량',
    dataKey: 'bepQuantity',
    color: '#4361ee',
    format: (v) => `${v.toFixed(1)}개`,
    unit: '개',
  },
  shadowWage: {
    label: '실질 시급',
    dataKey: 'shadowWage',
    color: '#06d6a0',
    format: (v) => formatKRW(v),
    unit: '원',
  },
  totalCost: {
    label: '총 비용',
    dataKey: 'totalCost',
    color: '#ef476f',
    format: (v) => formatKRW(v),
    unit: '원',
  },
  safetyMargin: {
    label: '안전마진율',
    dataKey: 'safetyMarginRatio',
    color: '#f4a261',
    format: (v) => `${v.toFixed(1)}%`,
    unit: '%',
  },
};

interface Props {
  projectId: number;
}

export default function TrendChart({ projectId }: Props) {
  const [snapshots, setSnapshots] = useState<MonthlySnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [metric, setMetric] = useState<Metric>('bep');

  const fetchTrends = useCallback(async () => {
    try {
      const res = await trendApi.getMonthlyTrends(projectId);
      if (res.data.success && res.data.data) {
        setSnapshots(res.data.data.snapshots);
      } else {
        setError('트렌드 데이터를 불러올 수 없습니다.');
      }
    } catch {
      setError('트렌드 데이터를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchTrends();
  }, [fetchTrends]);

  if (loading) return <LoadingText>트렌드 로딩 중...</LoadingText>;
  if (error) return <ErrorBanner>{error}</ErrorBanner>;
  if (snapshots.length === 0) return null;

  const config = METRICS[metric];

  const chartData = snapshots.map((s) => ({
    month: formatMonth(s.month),
    value: Number(s[config.dataKey]),
  }));

  const values = chartData.map((d) => d.value);
  const latest = values[values.length - 1];
  const previous = values.length > 1 ? values[values.length - 2] : latest;
  const delta = latest - previous;
  const deltaPercent = previous !== 0 ? (delta / Math.abs(previous)) * 100 : 0;
  const insight = generateInsight(metric, latest, delta, deltaPercent);

  return (
    <Container>
      <Header>
        <Title>월별 추이</Title>
      </Header>

      <MetricTabs>
        {(Object.keys(METRICS) as Metric[]).map((key) => (
          <MetricTab
            key={key}
            $active={metric === key}
            $color={METRICS[key].color}
            onClick={() => setMetric(key)}
          >
            {METRICS[key].label}
          </MetricTab>
        ))}
      </MetricTabs>

      <ChartWrapper>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={chartData} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f5" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12, fill: '#6c757d' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#6c757d' }}
              axisLine={false}
              tickLine={false}
              width={60}
              tickFormatter={(v: number) =>
                config.unit === '원' ? `${(v / 10000).toFixed(0)}만` : String(v)
              }
            />
            <Tooltip
              formatter={(value) => [config.format(Number(value)), config.label]}
              labelStyle={{ color: '#495057', fontWeight: 600 }}
              contentStyle={{
                borderRadius: 8,
                border: 'none',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={config.color}
              strokeWidth={2.5}
              dot={{ r: 4, fill: config.color, stroke: '#fff', strokeWidth: 2 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartWrapper>

      {insight && (
        <InsightBox $positive={delta >= 0 && metric !== 'totalCost'}>
          <InsightText>{insight}</InsightText>
        </InsightBox>
      )}
    </Container>
  );
}

function formatMonth(ym: string): string {
  const parts = ym.split('-');
  return `${parts[1]}월`;
}

function generateInsight(
  metric: Metric,
  latest: number,
  delta: number,
  deltaPercent: number,
): string {
  const dir = delta > 0 ? '증가' : delta < 0 ? '감소' : '유지';
  const pct = Math.abs(deltaPercent).toFixed(1);

  switch (metric) {
    case 'bep':
      if (delta < 0) return `BEP가 전월 대비 ${pct}% 감소했습니다. 수익 구조가 개선되고 있습니다.`;
      if (delta > 0) return `BEP가 전월 대비 ${pct}% 증가했습니다. 비용 구조를 점검해보세요.`;
      return `BEP가 ${latest.toFixed(1)}개로 유지되고 있습니다.`;
    case 'shadowWage':
      if (delta > 0) return `실질 시급이 전월 대비 ${pct}% ${dir}! 시간 효율이 좋아지고 있습니다.`;
      if (delta < 0) return `실질 시급이 전월 대비 ${pct}% ${dir}했습니다. 투입 시간을 점검해보세요.`;
      return `실질 시급이 ${formatKRW(latest)}로 유지되고 있습니다.`;
    case 'totalCost':
      if (delta < 0) return `총 비용이 전월 대비 ${pct}% 감소했습니다. 비용 절감이 효과적입니다.`;
      if (delta > 0) return `총 비용이 전월 대비 ${pct}% 증가했습니다. 지출 항목을 확인해보세요.`;
      return `총 비용이 ${formatKRW(latest)}로 유지되고 있습니다.`;
    case 'safetyMargin':
      if (delta > 0) return `안전마진율이 전월 대비 ${pct}%p 개선되었습니다. 안정적인 구조입니다.`;
      if (delta < 0) return `안전마진율이 전월 대비 ${pct}%p 하락했습니다. 가격 정책을 검토해보세요.`;
      return `안전마진율이 ${latest.toFixed(1)}%로 유지되고 있습니다.`;
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

const MetricTabs = styled.div`
  display: flex;
  gap: 0.375rem;
  flex-wrap: wrap;
`;

const MetricTab = styled.button<{ $active: boolean; $color: string }>`
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8125rem;
  font-weight: ${({ $active }) => ($active ? '600' : '400')};
  color: ${({ $active, $color }) => ($active ? '#fff' : $color)};
  background: ${({ $active, $color }) => ($active ? $color : `${$color}15`)};
  border: 1px solid ${({ $active, $color }) => ($active ? $color : 'transparent')};
  transition: all 0.2s;

  &:hover {
    opacity: 0.85;
  }
`;

const ChartWrapper = styled.div`
  width: 100%;
`;

const InsightBox = styled.div<{ $positive: boolean }>`
  padding: 0.75rem 1rem;
  background: ${({ $positive }) => ($positive ? '#f0fdf9' : '#fff5f5')};
  border-left: 3px solid ${({ $positive }) => ($positive ? '#06d6a0' : '#ef476f')};
  border-radius: 8px;
`;

const InsightText = styled.p`
  margin: 0;
  font-size: 0.8125rem;
  color: #495057;
  line-height: 1.5;
`;
