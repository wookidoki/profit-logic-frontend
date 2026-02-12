import type { CostCategory, ActionCardDto, CostBreakdownDto, ShadowWageDto } from '../types';
import { MINIMUM_WAGE, CATEGORY_LABELS } from '../constants';
export { MINIMUM_WAGE, CATEGORY_LABELS };

export const CATEGORY_COLORS: Record<CostCategory, string> = {
  API_USAGE: '#FF6B6B',
  SERVER: '#4ECDC4',
  TOOL_SUBSCRIPTION: '#45B7D1',
  MATERIAL: '#96CEB4',
  MARKETING: '#FFEAA7',
  OUTSOURCING: '#DDA0DD',
  OTHER: '#C0C0C0',
};

/** 비용 구조를 차트 데이터로 변환 */
export function toCostChartData(breakdown: CostBreakdownDto): {
  name: string;
  value: number;
  color: string;
  category: CostCategory;
}[] {
  return Object.entries(breakdown.category_ratio)
    .filter(([, ratio]) => ratio != null && ratio > 0)
    .sort(([, a], [, b]) => (b ?? 0) - (a ?? 0))
    .map(([cat, ratio]) => ({
      name: CATEGORY_LABELS[cat as CostCategory] || cat,
      value: ratio ?? 0,
      color: CATEGORY_COLORS[cat as CostCategory] || '#C0C0C0',
      category: cat as CostCategory,
    }));
}

/** 실질 시급이 최저임금 미만인지 */
export function isBelowMinimumWage(shadowWage: ShadowWageDto): boolean {
  return shadowWage.real_shadow_wage < shadowWage.minimum_wage;
}

/** 액션 카드를 priority 순으로 정렬 */
export function sortActionCards(cards: ActionCardDto[]): ActionCardDto[] {
  return [...cards].sort((a, b) => a.priority - b.priority);
}

/** 비용/시간 데이터가 충분한지 확인 */
export function hasEnoughData(breakdown: CostBreakdownDto, shadowWage: ShadowWageDto): {
  hasCostData: boolean;
  hasTimeData: boolean;
} {
  return {
    hasCostData: breakdown.total_cost > 0,
    hasTimeData: shadowWage.has_time_data,
  };
}
