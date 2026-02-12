import type { CostCategory, CostType } from '../types';

/** 2025년 최저임금 (원/시간) */
export const MINIMUM_WAGE = 9_860;

/** 월 기본 투입 시간 */
export const DEFAULT_WORK_HOURS = 160;

export const PROJECT_FIELDS = [
  { name: 'title' as const, label: '프로젝트 이름', placeholder: '예: 이모티콘 판매', type: 'text' },
  { name: 'price' as const, label: '건당 수익 (원)', placeholder: '예: 회차당 3,000 / 영상당 50,000', type: 'number' },
  { name: 'variable_cost' as const, label: '건당 비용 (원)', placeholder: '예: 외주 편집비, 소품비 (없으면 0)', type: 'number' },
  { name: 'fixed_cost' as const, label: '월 고정 지출 (원)', placeholder: '예: 도구 구독, 장비 할부', type: 'number' },
  { name: 'work_hours' as const, label: '월 투입 시간 (시간/월)', placeholder: `예: ${DEFAULT_WORK_HOURS}`, type: 'number' },
  { name: 'hourly_wage' as const, label: '본업 시급 (원)', placeholder: `예: ${MINIMUM_WAGE}`, type: 'number' },
] as const;

export const CATEGORY_LABELS: Record<CostCategory, string> = {
  API_USAGE: 'API 사용료',
  SERVER: '서버비',
  TOOL_SUBSCRIPTION: '도구 구독료',
  MATERIAL: '재료비',
  MARKETING: '마케팅비',
  OUTSOURCING: '외주비',
  OTHER: '기타',
};

export const COST_TYPE_LABELS: Record<CostType, string> = {
  FIXED: '월 고정 지출',
  VARIABLE: '건당 비용',
};
