import api from './axios';
import type { ResponseData, ActionCardDto } from '../types';

export type ProjectStatus = 'STABLE' | 'WARNING' | 'DANGER' | 'NORMAL' | 'NO_DATA';

export interface ProjectInsight {
  projectId: number;
  title: string;
  bep: number;
  shadowWage: number;
  contributionMarginRate: number;
  status: ProjectStatus;
  topActionCard: ActionCardDto | null;
}

export interface DashboardSummary {
  totalProjects: number;
  totalEstimatedRevenue: number;
  avgShadowWage: number;
  avgContributionMarginRate: number;
  warningCount: number;
  projects: ProjectInsight[];
}

export const dashboardApi = {
  getSummary: () =>
    api.get<ResponseData<DashboardSummary>>('/v1/dashboard/summary'),
};
