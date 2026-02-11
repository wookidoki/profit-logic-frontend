import { describe, it, expect } from 'vitest';
import { formatKRW, formatPercent, formatQuantity } from './formatNumber';

describe('formatKRW', () => {
  it('양수 금액을 원 단위로 포맷', () => {
    expect(formatKRW(1500000)).toBe('1,500,000원');
  });

  it('0원 포맷', () => {
    expect(formatKRW(0)).toBe('0원');
  });

  it('음수 금액 포맷', () => {
    expect(formatKRW(-500000)).toBe('-500,000원');
  });

  it('소수점 반올림', () => {
    expect(formatKRW(1234.56)).toBe('1,235원');
  });
});

describe('formatPercent', () => {
  it('소수점 2자리까지 표시', () => {
    expect(formatPercent(50)).toBe('50.00%');
  });

  it('음수 퍼센트', () => {
    expect(formatPercent(-5.123)).toBe('-5.12%');
  });

  it('0% 포맷', () => {
    expect(formatPercent(0)).toBe('0.00%');
  });
});

describe('formatQuantity', () => {
  it('양수 수량 올림 적용', () => {
    expect(formatQuantity(14.1)).toBe('15개');
  });

  it('정수 수량', () => {
    expect(formatQuantity(200)).toBe('200개');
  });

  it('0개 포맷', () => {
    expect(formatQuantity(0)).toBe('0개');
  });
});
