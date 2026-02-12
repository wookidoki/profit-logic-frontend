import api from './axios';
import type { ResponseData, Project } from '../types';

export type GoalStatus = 'NO_TARGET' | 'ON_TRACK' | 'BEHIND' | 'URGENT' | 'EXPIRED';

export interface GoalProgressResponse {
  targetRevenue: number | null;
  targetMonth: string | null;
  monthsTotal: number;
  monthsElapsed: number;
  monthsRemaining: number;
  timeProgressPercent: number;
  bepQuantity: number;
  requiredMonthlySales: number;
  dailySalesTarget: number;
  currentShadowWage: number;
  monthlyCostAverage: number;
  status: GoalStatus;
}

export interface GoalUpdateRequest {
  targetRevenue: number | null;
  targetMonth: string | null;
}

export const goalApi = {
  getProgress: (projectId: number) =>
    api.get<ResponseData<GoalProgressResponse>>(
      `/v1/projects/${projectId}/goal`,
    ),

  updateGoal: (projectId: number, data: GoalUpdateRequest) =>
    api.put<ResponseData<Project>>(
      `/v1/projects/${projectId}/goal`,
      data,
    ),
};
