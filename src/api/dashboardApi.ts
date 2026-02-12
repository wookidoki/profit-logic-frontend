import api from './axios';
import type { ResponseData, ActionCardDto } from '../types';

export type ProjectStatus = 'STABLE' | 'WARNING' | 'DANGER' | 'NORMAL' | 'NO_DATA';

export interface ProjectInsight {
  project_id: number;
  title: string;
  bep: number;
  shadow_wage: number;
  contribution_margin_rate: number;
  status: ProjectStatus;
  top_action_card: ActionCardDto | null;
  creator_category: string | null;
}

export interface DashboardSummary {
  total_projects: number;
  total_estimated_revenue: number;
  avg_shadow_wage: number;
  avg_contribution_margin_rate: number;
  warning_count: number;
  projects: ProjectInsight[];
}

export const dashboardApi = {
  getSummary: () =>
    api.get<ResponseData<DashboardSummary>>('/v1/dashboard/summary'),
};
