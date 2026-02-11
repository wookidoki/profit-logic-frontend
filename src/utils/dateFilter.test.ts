import { describe, it, expect } from 'vitest';
import { getDateRange, filterByDateRange } from './dateFilter';

describe('getDateRange', () => {
  // 2026-02-11 (수요일)
  const wednesday = new Date(2026, 1, 11);

  it('all 필터는 from/to 모두 undefined', () => {
    const range = getDateRange('all', wednesday);
    expect(range.from).toBeUndefined();
    expect(range.to).toBeUndefined();
  });

  it('week 필터는 이번 주 월요일부터 오늘까지', () => {
    const range = getDateRange('week', wednesday);
    expect(range.from).toBe('2026-02-09'); // 월요일
    expect(range.to).toBe('2026-02-11');   // 수요일(오늘)
  });

  it('month 필터는 이번 달 1일부터 오늘까지', () => {
    const range = getDateRange('month', wednesday);
    expect(range.from).toBe('2026-02-01');
    expect(range.to).toBe('2026-02-11');
  });

  it('일요일에 week 필터 시 이전 주 월요일', () => {
    const sunday = new Date(2026, 1, 15); // 일요일
    const range = getDateRange('week', sunday);
    expect(range.from).toBe('2026-02-09'); // 이전 주 월요일
    expect(range.to).toBe('2026-02-15');
  });

  it('월요일에 week 필터 시 당일이 from', () => {
    const monday = new Date(2026, 1, 9);
    const range = getDateRange('week', monday);
    expect(range.from).toBe('2026-02-09');
    expect(range.to).toBe('2026-02-09');
  });

  it('1월 1일에 month 필터', () => {
    const jan1 = new Date(2026, 0, 1);
    const range = getDateRange('month', jan1);
    expect(range.from).toBe('2026-01-01');
    expect(range.to).toBe('2026-01-01');
  });
});

describe('filterByDateRange', () => {
  const logs = [
    { id: 1, log_date: '2026-02-05' },
    { id: 2, log_date: '2026-02-09' },
    { id: 3, log_date: '2026-02-11' },
    { id: 4, log_date: '2026-02-15' },
  ];

  it('all 범위는 전체 반환', () => {
    const result = filterByDateRange(logs, { from: undefined, to: undefined });
    expect(result).toHaveLength(4);
  });

  it('from/to 범위에 맞는 항목만 반환', () => {
    const result = filterByDateRange(logs, { from: '2026-02-09', to: '2026-02-11' });
    expect(result).toHaveLength(2);
    expect(result.map((l) => l.id)).toEqual([2, 3]);
  });

  it('범위 밖 항목은 제외', () => {
    const result = filterByDateRange(logs, { from: '2026-02-12', to: '2026-02-20' });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(4);
  });

  it('빈 배열은 빈 배열 반환', () => {
    const result = filterByDateRange([], { from: '2026-02-01', to: '2026-02-28' });
    expect(result).toHaveLength(0);
  });
});
