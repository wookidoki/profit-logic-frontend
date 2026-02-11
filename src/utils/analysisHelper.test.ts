import { describe, it, expect } from 'vitest';
import {
  toCostChartData,
  isBelowMinimumWage,
  sortActionCards,
  hasEnoughData,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
} from './analysisHelper';
import { MINIMUM_WAGE } from '../constants';
import type { CostBreakdownDto, ShadowWageDto, ActionCardDto } from '../types';

describe('toCostChartData', () => {
  it('카테고리 비율을 차트 데이터로 변환', () => {
    const breakdown: CostBreakdownDto = {
      total_fixed_cost: 500000,
      total_variable_cost: 200000,
      total_cost: 700000,
      category_ratio: { API_USAGE: 40.5, SERVER: 30.0, OTHER: 29.5 },
    };
    const result = toCostChartData(breakdown);

    expect(result).toHaveLength(3);
    expect(result[0].name).toBe('API 사용료');
    expect(result[0].value).toBe(40.5);
    expect(result[0].color).toBe('#FF6B6B');
    expect(result[0].category).toBe('API_USAGE');
  });

  it('내림차순 정렬', () => {
    const breakdown: CostBreakdownDto = {
      total_fixed_cost: 0,
      total_variable_cost: 0,
      total_cost: 0,
      category_ratio: { SERVER: 10, MARKETING: 50, MATERIAL: 30 },
    };
    const result = toCostChartData(breakdown);
    expect(result[0].value).toBe(50);
    expect(result[1].value).toBe(30);
    expect(result[2].value).toBe(10);
  });

  it('0 이하 비율은 제외', () => {
    const breakdown: CostBreakdownDto = {
      total_fixed_cost: 0,
      total_variable_cost: 0,
      total_cost: 0,
      category_ratio: { API_USAGE: 100, SERVER: 0 },
    };
    const result = toCostChartData(breakdown);
    expect(result).toHaveLength(1);
  });

  it('빈 카테고리 비율은 빈 배열', () => {
    const breakdown: CostBreakdownDto = {
      total_fixed_cost: 0,
      total_variable_cost: 0,
      total_cost: 0,
      category_ratio: {},
    };
    expect(toCostChartData(breakdown)).toHaveLength(0);
  });
});

describe('isBelowMinimumWage', () => {
  it('최저임금 미만이면 true', () => {
    const wage: ShadowWageDto = {
      total_hours: 100,
      operating_profit: 500000,
      real_shadow_wage: 5000,
      minimum_wage: MINIMUM_WAGE,
      minimum_wage_ratio: 50.7,
      has_time_data: true,
    };
    expect(isBelowMinimumWage(wage)).toBe(true);
  });

  it('최저임금 이상이면 false', () => {
    const wage: ShadowWageDto = {
      total_hours: 100,
      operating_profit: 2000000,
      real_shadow_wage: 20000,
      minimum_wage: MINIMUM_WAGE,
      minimum_wage_ratio: 202.8,
      has_time_data: true,
    };
    expect(isBelowMinimumWage(wage)).toBe(false);
  });

  it('정확히 최저임금과 같으면 false', () => {
    const wage: ShadowWageDto = {
      total_hours: 100,
      operating_profit: 986000,
      real_shadow_wage: 9860,
      minimum_wage: MINIMUM_WAGE,
      minimum_wage_ratio: 100,
      has_time_data: true,
    };
    expect(isBelowMinimumWage(wage)).toBe(false);
  });
});

describe('sortActionCards', () => {
  it('priority 순으로 정렬', () => {
    const cards: ActionCardDto[] = [
      { type: 'SUGGESTION', title: 'B', description: '', priority: 3 },
      { type: 'WARNING', title: 'A', description: '', priority: 1 },
      { type: 'POSITIVE', title: 'C', description: '', priority: 5 },
    ];
    const sorted = sortActionCards(cards);
    expect(sorted[0].priority).toBe(1);
    expect(sorted[1].priority).toBe(3);
    expect(sorted[2].priority).toBe(5);
  });

  it('원본 배열을 변경하지 않음', () => {
    const cards: ActionCardDto[] = [
      { type: 'WARNING', title: 'B', description: '', priority: 2 },
      { type: 'POSITIVE', title: 'A', description: '', priority: 1 },
    ];
    const sorted = sortActionCards(cards);
    expect(cards[0].priority).toBe(2); // 원본 유지
    expect(sorted[0].priority).toBe(1);
  });

  it('빈 배열', () => {
    expect(sortActionCards([])).toHaveLength(0);
  });
});

describe('hasEnoughData', () => {
  it('비용+시간 모두 있으면 둘 다 true', () => {
    const breakdown: CostBreakdownDto = {
      total_fixed_cost: 100, total_variable_cost: 0, total_cost: 100, category_ratio: {},
    };
    const wage: ShadowWageDto = {
      total_hours: 10, operating_profit: 0, real_shadow_wage: 0,
      minimum_wage: MINIMUM_WAGE, minimum_wage_ratio: 0, has_time_data: true,
    };
    const result = hasEnoughData(breakdown, wage);
    expect(result.hasCostData).toBe(true);
    expect(result.hasTimeData).toBe(true);
  });

  it('비용 0이면 hasCostData false', () => {
    const breakdown: CostBreakdownDto = {
      total_fixed_cost: 0, total_variable_cost: 0, total_cost: 0, category_ratio: {},
    };
    const wage: ShadowWageDto = {
      total_hours: 10, operating_profit: 0, real_shadow_wage: 0,
      minimum_wage: MINIMUM_WAGE, minimum_wage_ratio: 0, has_time_data: true,
    };
    expect(hasEnoughData(breakdown, wage).hasCostData).toBe(false);
  });

  it('시간 데이터 없으면 hasTimeData false', () => {
    const breakdown: CostBreakdownDto = {
      total_fixed_cost: 100, total_variable_cost: 0, total_cost: 100, category_ratio: {},
    };
    const wage: ShadowWageDto = {
      total_hours: 160, operating_profit: 0, real_shadow_wage: 0,
      minimum_wage: MINIMUM_WAGE, minimum_wage_ratio: 0, has_time_data: false,
    };
    expect(hasEnoughData(breakdown, wage).hasTimeData).toBe(false);
  });
});

describe('CATEGORY constants', () => {
  it('7개 카테고리 라벨 존재', () => {
    expect(Object.keys(CATEGORY_LABELS)).toHaveLength(7);
  });

  it('7개 카테고리 색상 존재', () => {
    expect(Object.keys(CATEGORY_COLORS)).toHaveLength(7);
  });

  it('지정된 색상 정확히 매핑', () => {
    expect(CATEGORY_COLORS.API_USAGE).toBe('#FF6B6B');
    expect(CATEGORY_COLORS.SERVER).toBe('#4ECDC4');
    expect(CATEGORY_COLORS.TOOL_SUBSCRIPTION).toBe('#45B7D1');
  });
});
