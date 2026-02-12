import api from './axios';
import type { ResponseData } from '../types';

export interface MonthlySnapshot {
  month: string;
  total_cost: number;
  total_hours: number;
  shadow_wage: number;
  bep_quantity: number;
  safety_margin_ratio: number;
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
