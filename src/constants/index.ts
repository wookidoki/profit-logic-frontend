import type { CostCategory, CostType } from '../types';

/** 2025년 최저임금 (원/시간) */
export const MINIMUM_WAGE = 9_860;

/** 월 기본 근무시간 */
export const DEFAULT_WORK_HOURS = 160;

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
  FIXED: '고정비',
  VARIABLE: '변동비',
};
