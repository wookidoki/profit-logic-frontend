import api from './axios';
import type { ResponseData } from '../types';

export interface ReportResponse {
  id: number;
  project_id: number;
  year_month: string;
  content: string;
  tokens_used: number;
  created_at: string;
}

export const reportApi = {
  generate: (projectId: number, yearMonth: string) =>
    api.post<ResponseData<ReportResponse>>(
      `/v1/projects/${projectId}/reports?yearMonth=${yearMonth}`
    ),

  getList: (projectId: number) =>
    api.get<ResponseData<ReportResponse[]>>(`/v1/projects/${projectId}/reports`),

  getById: (projectId: number, reportId: number) =>
    api.get<ResponseData<ReportResponse>>(
      `/v1/projects/${projectId}/reports/${reportId}`
    ),
};
