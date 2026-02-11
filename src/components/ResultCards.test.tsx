import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ResultCards from './ResultCards';
import type { CalculateResponse } from '../types/finance';

const mockResult: CalculateResponse = {
  break_even_point: 200,
  operating_profit: 500000,
  economic_profit: 400000,
  target_quantity: 400,
  margin_rate: 50,
  contribution_margin: 5000,
  shadow_wage: 12500,
  is_viable: true,
  zone: 'GREEN',
  applied_hourly_wage: 9860,
};

describe('ResultCards', () => {
  it('생존 가능 배지 렌더링 (is_viable=true)', () => {
    render(<ResultCards result={mockResult} />);
    expect(screen.getByText('생존 가능')).toBeInTheDocument();
  });

  it('생존 불가 배지 렌더링 (is_viable=false)', () => {
    render(<ResultCards result={{ ...mockResult, is_viable: false, zone: 'RED' }} />);
    expect(screen.getByText('생존 불가')).toBeInTheDocument();
  });

  it('Zone 배지 렌더링', () => {
    render(<ResultCards result={mockResult} />);
    expect(screen.getByText('안전')).toBeInTheDocument();
  });

  it('8개 메트릭 카드 모두 렌더링', () => {
    render(<ResultCards result={mockResult} />);
    expect(screen.getByText('손익분기점 (BEP)')).toBeInTheDocument();
    expect(screen.getByText('목표 판매량')).toBeInTheDocument();
    expect(screen.getByText('영업이익')).toBeInTheDocument();
    expect(screen.getByText('경제적 이윤')).toBeInTheDocument();
    expect(screen.getByText('안전마진율')).toBeInTheDocument();
    expect(screen.getByText('공헌이익 (단위당)')).toBeInTheDocument();
    expect(screen.getByText('실질 시급 (Shadow Wage)')).toBeInTheDocument();
    expect(screen.getByText('적용 시급')).toBeInTheDocument();
  });

  it('BEP 값 올바르게 표시', () => {
    render(<ResultCards result={mockResult} />);
    expect(screen.getByText('200개')).toBeInTheDocument();
  });

  it('안전마진율 값 올바르게 표시', () => {
    render(<ResultCards result={mockResult} />);
    expect(screen.getByText('50.00%')).toBeInTheDocument();
  });
});
