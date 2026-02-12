import api from './axios';
import type { ResponseData } from '../types';

export interface MonthlySnapshot {
  month: string;
  totalCost: number;
  totalHours: number;
  shadowWage: number;
  bepQuantity: number;
  safetyMarginRatio: number;
}

export interface MonthlyTrendResponse {
  months: string[];
  snapshots: MonthlySnapshot[];
}

export const trendApi = {
  getMonthlyTrends: (projectId: number, months = 6) =>
    api.get<ResponseData<MonthlyTrendResponse>>(
      `/v1/projects/${projectId}/trends`,
      { params: { months } },
    ),
};
