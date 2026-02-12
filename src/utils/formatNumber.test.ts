import { describe, it, expect } from 'vitest';
import { formatKRW, formatPercent, formatQuantity } from './formatNumber';

describe('formatKRW', () => {
  it('정수 포맷', () => {
    expect(formatKRW(10000)).toBe('10,000원');
  });

  it('소수점 반올림', () => {
    expect(formatKRW(9999.5)).toBe('10,000원');
    expect(formatKRW(9999.4)).toBe('9,999원');
  });

  it('0원', () => {
    expect(formatKRW(0)).toBe('0원');
  });

  it('음수', () => {
    expect(formatKRW(-5000)).toBe('-5,000원');
  });

  it('큰 숫자 천단위 구분', () => {
    expect(formatKRW(1234567890)).toBe('1,234,567,890원');
  });
});

describe('formatPercent', () => {
  it('소수점 두 자리', () => {
    expect(formatPercent(12.3456)).toBe('12.35%');
  });

  it('정수도 소수점 두 자리', () => {
    expect(formatPercent(50)).toBe('50.00%');
  });

  it('0%', () => {
    expect(formatPercent(0)).toBe('0.00%');
  });

  it('음수 퍼센트', () => {
    expect(formatPercent(-15.5)).toBe('-15.50%');
  });
});

describe('formatQuantity', () => {
  it('올림 + 개 단위', () => {
    expect(formatQuantity(10.1)).toBe('11개');
  });

  it('정수는 그대로', () => {
    expect(formatQuantity(100)).toBe('100개');
  });

  it('0개', () => {
    expect(formatQuantity(0)).toBe('0개');
  });

  it('천단위 구분', () => {
    expect(formatQuantity(1500.5)).toBe('1,501개');
  });
});
